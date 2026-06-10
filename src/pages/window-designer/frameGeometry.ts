import * as THREE from 'three'

/**
 * A point on a profile cross-section.
 * - `lateral`: distance measured inward from the outer edge of the frame
 *   (0 = outer edge, increasing toward the window opening).
 * - `depth`: position along the window thickness axis (the local Z axis).
 *
 * The list of points describes a closed polygon (the cross-section that gets
 * swept around the frame). It does not need a duplicated closing point.
 */
export type ProfilePoint = { lateral: number; depth: number }
export type Profile = ProfilePoint[]

/** Signed area (shoelace) in the lateral/depth plane. Positive = CCW. */
const signedArea = (profile: Profile): number => {
  let area = 0
  for (let i = 0; i < profile.length; i++) {
    const a = profile[i]
    const b = profile[(i + 1) % profile.length]
    area += a.lateral * b.depth - b.lateral * a.depth
  }
  return area / 2
}

/** Return a copy guaranteed to be wound counter-clockwise. */
const toCCW = (profile: Profile): Profile =>
  signedArea(profile) < 0 ? [...profile].reverse() : profile

export type Vec2 = { x: number; y: number }

/** Rotate a 2D vector by -90 degrees (clockwise). */
const rotMinus90 = (v: Vec2): Vec2 => ({ x: v.y, y: -v.x })

type Buffers = { positions: number[]; normals: number[] }

const pushVertex = (buffers: Buffers, p: THREE.Vector3, n: THREE.Vector3) => {
  buffers.positions.push(p.x, p.y, p.z)
  buffers.normals.push(n.x, n.y, n.z)
}

const pushTriangle = (
  buffers: Buffers,
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
  n: THREE.Vector3,
) => {
  pushVertex(buffers, a, n)
  pushVertex(buffers, b, n)
  pushVertex(buffers, c, n)
}

/**
 * How a bar's end is cut:
 * - `'miter'`: 45-degree cut, inset by the point's lateral value (shares a
 *   mitered corner with a neighbour that has the same profile).
 * - a number: a square cut inset by that fixed amount. `0` runs the bar
 *   straight to the corner (a "through" member); a positive value butts the
 *   end against a neighbour of that width.
 */
type EndCut = number | 'miter'

type BarOptions = {
  /** World-space outer corner where the run starts. */
  cornerStart: Vec2
  /** Unit direction the bar runs along (in the XY plane). */
  runDir: Vec2
  /** Unit direction pointing inward toward the opening (in the XY plane). */
  lateralDir: Vec2
  /** Outer length of the bar along the run. */
  runLength: number
  /** End treatment at the run start. */
  startCut: EndCut
  /** End treatment at the run end. */
  endCut: EndCut
  /**
   * Miter inset factor at the start/end (multiplies the point's lateral value
   * when the cut is `'miter'`). `1` is the 45-degree rectangle corner; for an
   * arbitrary polygon vertex of interior angle θ it is `1 / tan(θ / 2)`.
   */
  startMiter?: number
  endMiter?: number
  /** Base offset along the depth (Z) axis. */
  depthOffset: number
}

/**
 * Sweep a profile cross-section along a single straight bar and append the
 * resulting triangles (with analytic normals) to the buffers.
 *
 * The construction places, for every profile point, two world positions: one
 * at each end of the run. Mitered ends are inset by the point's lateral value,
 * which yields exact 45-degree corners when four bars share an outer rectangle.
 */
const addBar = (buffers: Buffers, rawProfile: Profile, opts: BarOptions) => {
  const profile = toCCW(rawProfile)
  const { cornerStart, runDir, lateralDir, runLength, depthOffset } = opts

  // World position of a profile point at a given run parameter.
  const at = (lateral: number, depth: number, run: number): THREE.Vector3 =>
    new THREE.Vector3(
      cornerStart.x + runDir.x * run + lateralDir.x * lateral,
      cornerStart.y + runDir.y * run + lateralDir.y * lateral,
      depthOffset + depth,
    )

  const startMiter = opts.startMiter ?? 1
  const endMiter = opts.endMiter ?? 1
  const runStart = (lateral: number) =>
    opts.startCut === 'miter' ? startMiter * lateral : opts.startCut
  const runEnd = (lateral: number) =>
    opts.endCut === 'miter'
      ? runLength - endMiter * lateral
      : runLength - opts.endCut

  // Side walls: one quad per profile edge, normal computed analytically so we
  // never depend on triangle winding for shading.
  for (let i = 0; i < profile.length; i++) {
    const a = profile[i]
    const b = profile[(i + 1) % profile.length]

    const sa = at(a.lateral, a.depth, runStart(a.lateral))
    const ea = at(a.lateral, a.depth, runEnd(a.lateral))
    const sb = at(b.lateral, b.depth, runStart(b.lateral))
    const eb = at(b.lateral, b.depth, runEnd(b.lateral))

    // Outward normal of edge a->b for a CCW profile: edge direction in the
    // (lateral, depth) plane rotated -90 degrees, mapped back to world.
    const dLat = b.lateral - a.lateral
    const dDep = b.depth - a.depth
    const n = new THREE.Vector3(
      lateralDir.x * dDep,
      lateralDir.y * dDep,
      -dLat,
    ).normalize()

    pushTriangle(buffers, sa, sb, eb, n)
    pushTriangle(buffers, sa, eb, ea, n)
  }

  // End caps (mostly hidden at mitered corners, kept so each bar is a closed
  // solid). Triangulate the profile polygon in its own 2D plane.
  const contour = profile.map((p) => new THREE.Vector2(p.lateral, p.depth))
  const faces = THREE.ShapeUtils.triangulateShape(contour, [])

  const capNormalStart = new THREE.Vector3(-runDir.x, -runDir.y, 0).normalize()
  const capNormalEnd = new THREE.Vector3(runDir.x, runDir.y, 0).normalize()

  for (const [i0, i1, i2] of faces) {
    const a = profile[i0]
    const b = profile[i1]
    const c = profile[i2]

    pushTriangle(
      buffers,
      at(a.lateral, a.depth, runStart(a.lateral)),
      at(b.lateral, b.depth, runStart(b.lateral)),
      at(c.lateral, c.depth, runStart(c.lateral)),
      capNormalStart,
    )
    pushTriangle(
      buffers,
      at(a.lateral, a.depth, runEnd(a.lateral)),
      at(b.lateral, b.depth, runEnd(b.lateral)),
      at(c.lateral, c.depth, runEnd(c.lateral)),
      capNormalEnd,
    )
  }
}

const finalize = (buffers: Buffers): THREE.BufferGeometry => {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(buffers.positions, 3),
  )
  geometry.setAttribute(
    'normal',
    new THREE.Float32BufferAttribute(buffers.normals, 3),
  )
  geometry.computeBoundingSphere()
  return geometry
}

/** The widest lateral reach of a profile (how far it protrudes into the opening). */
export const profileWidth = (profile: Profile): number =>
  profile.reduce((m, p) => Math.max(m, p.lateral), 0)

/** A different profile for each side of the frame. */
export type FrameProfiles = {
  top: Profile
  bottom: Profile
  left: Profile
  right: Profile
}

/** How two members meet at a corner. */
export type CornerJoin = 'miter' | 'butt'

/**
 * Corner joins, keyed by corner. `'miter'` needs both members to share a
 * profile; `'butt'` runs the vertical jamb through and butts the horizontal
 * head/threshold against it (used when the threshold profile differs).
 */
export type FrameCorners = {
  tl: CornerJoin
  tr: CornerJoin
  bl: CornerJoin
  br: CornerJoin
}

const allMiter: FrameCorners = {
  tl: 'miter',
  tr: 'miter',
  bl: 'miter',
  br: 'miter',
}

// End cut for a vertical member at a corner: through when butted.
const vCut = (join: CornerJoin): EndCut => (join === 'miter' ? 'miter' : 0)
// End cut for a horizontal member at a corner: inset by the jamb width.
const hCut = (join: CornerJoin, jambWidth: number): EndCut =>
  join === 'miter' ? 'miter' : jambWidth

/**
 * Build a rectangular frame from per-side profiles and per-corner joins around
 * an outer rectangle of `width` x `height`, centered on the origin.
 *
 * Vertical members (left/right) run the full height; at a butted corner they
 * pass through and the horizontal member (top/bottom) insets to butt against
 * them. This lets a door reuse the same builder with a thinner threshold along
 * the bottom while keeping mitered head corners.
 */
export const buildFrame = (
  profiles: FrameProfiles,
  corners: FrameCorners,
  width: number,
  height: number,
  depthOffset = 0,
): THREE.BufferGeometry => {
  const buffers: Buffers = { positions: [], normals: [] }
  const w = width / 2
  const h = height / 2
  const leftW = profileWidth(profiles.left)
  const rightW = profileWidth(profiles.right)

  // Top edge: from top-right corner toward -X. start=TR, end=TL.
  addBar(buffers, profiles.top, {
    cornerStart: { x: w, y: h },
    runDir: rotMinus90({ x: 0, y: -1 }),
    lateralDir: { x: 0, y: -1 },
    runLength: width,
    startCut: hCut(corners.tr, rightW),
    endCut: hCut(corners.tl, leftW),
    depthOffset,
  })
  // Right edge: from bottom-right corner toward +Y. start=BR, end=TR.
  addBar(buffers, profiles.right, {
    cornerStart: { x: w, y: -h },
    runDir: rotMinus90({ x: -1, y: 0 }),
    lateralDir: { x: -1, y: 0 },
    runLength: height,
    startCut: vCut(corners.br),
    endCut: vCut(corners.tr),
    depthOffset,
  })
  // Bottom edge: from bottom-left corner toward +X. start=BL, end=BR.
  addBar(buffers, profiles.bottom, {
    cornerStart: { x: -w, y: -h },
    runDir: rotMinus90({ x: 0, y: 1 }),
    lateralDir: { x: 0, y: 1 },
    runLength: width,
    startCut: hCut(corners.bl, leftW),
    endCut: hCut(corners.br, rightW),
    depthOffset,
  })
  // Left edge: from top-left corner toward -Y. start=TL, end=BL.
  addBar(buffers, profiles.left, {
    cornerStart: { x: -w, y: h },
    runDir: rotMinus90({ x: 1, y: 0 }),
    lateralDir: { x: 1, y: 0 },
    runLength: height,
    startCut: vCut(corners.tl),
    endCut: vCut(corners.bl),
    depthOffset,
  })

  return finalize(buffers)
}

/**
 * Build a rectangular frame by sweeping a single `profile` around an outer
 * rectangle, with mitered 45-degree corners (the window case).
 */
export const buildFrameGeometry = (
  profile: Profile,
  width: number,
  height: number,
  depthOffset = 0,
): THREE.BufferGeometry =>
  buildFrame(
    { top: profile, bottom: profile, left: profile, right: profile },
    allMiter,
    width,
    height,
    depthOffset,
  )

/**
 * Build a door frame: head + jambs share `sideProfile` (mitered head corners)
 * and the bottom uses a separate `thresholdProfile` butted between the jambs.
 */
export const buildDoorFrameGeometry = (
  sideProfile: Profile,
  thresholdProfile: Profile,
  width: number,
  height: number,
  depthOffset = 0,
): THREE.BufferGeometry =>
  buildFrame(
    {
      top: sideProfile,
      bottom: thresholdProfile,
      left: sideProfile,
      right: sideProfile,
    },
    { tl: 'miter', tr: 'miter', bl: 'butt', br: 'butt' },
    width,
    height,
    depthOffset,
  )

/**
 * Build a single straight bar (used for mullions / glazing bars). The bar is
 * centered on the origin and runs along `axis` ('x' or 'y') with the supplied
 * length. `lateralDir` points to one side; pass a symmetric profile to get a
 * bar that looks the same from both faces.
 */
export const buildBarGeometry = (
  profile: Profile,
  length: number,
  axis: 'x' | 'y',
  depthOffset = 0,
): THREE.BufferGeometry => {
  const buffers: Buffers = { positions: [], normals: [] }
  const half = length / 2

  if (axis === 'x') {
    addBar(buffers, profile, {
      cornerStart: { x: -half, y: 0 },
      runDir: { x: 1, y: 0 },
      lateralDir: { x: 0, y: 1 },
      runLength: length,
      startCut: 0,
      endCut: 0,
      depthOffset,
    })
  } else {
    addBar(buffers, profile, {
      cornerStart: { x: 0, y: -half },
      runDir: { x: 0, y: 1 },
      lateralDir: { x: 1, y: 0 },
      runLength: length,
      startCut: 0,
      endCut: 0,
      depthOffset,
    })
  }

  return finalize(buffers)
}

// --- Free-form polygon frames -------------------------------------------------

const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y })
const len2 = (v: Vec2): number => Math.hypot(v.x, v.y)
const normalize2 = (v: Vec2): Vec2 => {
  const l = len2(v) || 1
  return { x: v.x / l, y: v.y / l }
}
const dot2 = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y

/** Signed area of a polygon in the XY plane (positive = counter-clockwise). */
const polyArea = (pts: Vec2[]): number => {
  let area = 0
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    area += a.x * b.y - b.x * a.y
  }
  return area / 2
}

/** Return the polygon wound counter-clockwise (so the interior is on the left). */
const toCCWPoly = (pts: Vec2[]): Vec2[] =>
  polyArea(pts) < 0 ? [...pts].reverse() : pts

/**
 * Sweep a frame profile around an arbitrary closed polygon, mitering each
 * vertex by its angle bisector. The rectangular frame is the 4-vertex,
 * all-90-degree special case; here each vertex of interior angle θ gets a miter
 * inset factor of `1 / tan(θ / 2)`. `points` are the OUTER outline vertices in
 * order (winding is normalised); the profile's lateral axis runs inward.
 */
export const buildPolygonFrame = (
  points: Vec2[],
  profile: Profile,
  depthOffset = 0,
): THREE.BufferGeometry => {
  const pts = toCCWPoly(points)
  const n = pts.length
  const buffers: Buffers = { positions: [], normals: [] }

  // Miter factor at vertex i from the interior angle between its two edges.
  const miterFactor = (i: number): number => {
    const prev = pts[(i - 1 + n) % n]
    const cur = pts[i]
    const next = pts[(i + 1) % n]
    const a = normalize2(sub(prev, cur))
    const b = normalize2(sub(next, cur))
    const angle = Math.acos(Math.max(-1, Math.min(1, dot2(a, b))))
    const t = Math.tan(angle / 2)
    // Guard near-straight vertices (angle → π) from blowing up the inset.
    return t < 1e-3 ? 1 / 1e-3 : 1 / t
  }

  for (let i = 0; i < n; i++) {
    const A = pts[i]
    const B = pts[(i + 1) % n]
    const edge = sub(B, A)
    const runLength = len2(edge)
    if (runLength < 1e-6) continue
    const runDir = normalize2(edge)
    // Inward normal for a CCW polygon is the edge direction rotated +90.
    const lateralDir: Vec2 = { x: -runDir.y, y: runDir.x }
    addBar(buffers, profile, {
      cornerStart: A,
      runDir,
      lateralDir,
      runLength,
      startCut: 'miter',
      endCut: 'miter',
      startMiter: miterFactor(i),
      endMiter: miterFactor((i + 1) % n),
      depthOffset,
    })
  }

  return finalize(buffers)
}

/**
 * Offset a polygon inward by `dist` (moving each edge along its inward normal
 * and re-intersecting neighbouring edges). Used to derive the glass outline
 * inside a polygon frame. Assumes a convex, CCW-or-CW simple polygon.
 */
export const offsetPolygon = (points: Vec2[], dist: number): Vec2[] => {
  const pts = toCCWPoly(points)
  const n = pts.length
  // Each edge becomes a line (point + direction) shifted inward.
  const lines = pts.map((A, i) => {
    const B = pts[(i + 1) % n]
    const dir = normalize2(sub(B, A))
    const inward: Vec2 = { x: -dir.y, y: dir.x }
    return {
      p: { x: A.x + inward.x * dist, y: A.y + inward.y * dist },
      d: dir,
    }
  })
  // Vertex i of the offset polygon is where edge (i-1) meets edge i.
  const result: Vec2[] = []
  for (let i = 0; i < n; i++) {
    const l1 = lines[(i - 1 + n) % n]
    const l2 = lines[i]
    // Solve l1.p + t*l1.d = l2.p + s*l2.d for t.
    const denom = l1.d.x * l2.d.y - l1.d.y * l2.d.x
    if (Math.abs(denom) < 1e-9) {
      result.push(l2.p) // near-parallel: fall back to the offset corner
      continue
    }
    const diff = sub(l2.p, l1.p)
    const t = (diff.x * l2.d.y - diff.y * l2.d.x) / denom
    result.push({ x: l1.p.x + l1.d.x * t, y: l1.p.y + l1.d.y * t })
  }
  return result
}
