import type { Profile, ProfilePoint } from './frameGeometry'

/**
 * Parameters describing a window profile cross-section. Everything is dynamic:
 * change any value and the swept geometry rebuilds.
 */
export type ProfileParams = {
  /** Total lateral width of the profile (how far it reaches into the opening). */
  width: number
  /** Total depth (window thickness direction). */
  depth: number
  /** Width of the inner-front rebate where the next part (sash/glass) sits. */
  rebateWidth: number
  /** Depth of that rebate. */
  rebateDepth: number
  /** 45-degree chamfer applied to the outer-front edge (0 = square). */
  chamfer: number
}

export type ProfileStyle = 'classic' | 'flush' | 'beveled'

export const profileStyles: ProfileStyle[] = ['classic', 'flush', 'beveled']

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v))

/**
 * Build a frame/sash cross-section from parameters. Lateral runs 0..width
 * (outer edge -> opening), depth runs 0..depth. The inner-front corner gets a
 * rebate notch so the following part nests into it, mirroring how real window
 * profiles stack (frame -> sash -> glazing bead -> glass).
 */
export const buildProfile = (
  style: ProfileStyle,
  params: ProfileParams,
): Profile => {
  const w = params.width
  const d = params.depth
  const rw = clamp(params.rebateWidth, 0, w * 0.9)
  const rd = clamp(params.rebateDepth, 0, d * 0.9)
  const ch = clamp(params.chamfer, 0, Math.min(w, d) * 0.45)

  const points: ProfilePoint[] = []
  const add = (lateral: number, depth: number) =>
    points.push({ lateral, depth })

  const frontChamfer = style === 'beveled' ? Math.max(ch, w * 0.25) : ch
  const hasChamfer = frontChamfer > 0 && style !== 'flush'
  const hasRebate = style !== 'flush' && rw > 0 && rd > 0

  // Trace the perimeter in order: front face (outer -> inner), up the rebate,
  // along the back face (inner -> outer), down the outer face, chamfer closes.

  // Front face, starting just past the outer-front chamfer.
  add(hasChamfer ? frontChamfer : 0, 0)
  if (hasRebate) {
    add(w - rw, 0)
    add(w - rw, rd)
    add(w, rd)
  } else {
    add(w, 0)
  }
  // Inner-back and outer-back corners.
  add(w, d)
  add(0, d)
  // Down the outer face; the chamfer cuts the outer-front corner.
  if (hasChamfer) {
    add(0, frontChamfer)
  }

  // De-duplicate consecutive coincident points (chamfer/flush edge cases).
  const cleaned: ProfilePoint[] = []
  for (const p of points) {
    const prev = cleaned[cleaned.length - 1]
    if (!prev || prev.lateral !== p.lateral || prev.depth !== p.depth) {
      cleaned.push(p)
    }
  }
  return cleaned
}

/**
 * Build a symmetric glazing-bar (mullion) cross-section, centered on lateral 0
 * so it sits on the bar axis. `chamfer` controls the corner bevel: 0 yields a
 * square bar, larger values a beaded bar. The result is identical from both
 * faces, so it works as a through-bar or a one-sided applied bar.
 */
export const buildMullionProfile = (
  width: number,
  depth: number,
  chamfer: number,
): Profile => {
  const hw = width / 2
  const bevel = clamp(chamfer, 0, Math.min(hw, depth) * 0.49)
  if (bevel <= 0) {
    return [
      { lateral: -hw, depth: 0 },
      { lateral: hw, depth: 0 },
      { lateral: hw, depth },
      { lateral: -hw, depth },
    ]
  }
  return [
    { lateral: -hw, depth: bevel },
    { lateral: -hw + bevel, depth: 0 },
    { lateral: hw - bevel, depth: 0 },
    { lateral: hw, depth: bevel },
    { lateral: hw, depth: depth - bevel },
    { lateral: hw - bevel, depth },
    { lateral: -hw + bevel, depth },
    { lateral: -hw, depth: depth - bevel },
  ]
}

/** Parameters for the bottom aluminium rain rail (drip / water bar). */
export type RainRailParams = {
  /** How far the rail projects out past the front face (along -Z). */
  projection: number
  /** Total vertical drop below the mount line. */
  height: number
  /** Height of the downturned front drip lip. */
  lip: number
  /** Thickness of the back (mount) edge. */
  thickness: number
}

/**
 * Build the cross-section of a bottom aluminium rain rail, expressed in the
 * vertical/depth plane so it can be extruded horizontally along the window
 * width. Lateral maps to the vertical axis (0 = mount line, negative = down)
 * and depth maps to Z (0 = front face, negative = projecting outward).
 *
 * The shape is a sloped sill that sheds water toward the front and ends in a
 * downturned drip lip.
 */
export const buildRainRailProfile = (params: RainRailParams): Profile => {
  const proj = Math.max(0.005, params.projection)
  const h = Math.max(0.005, params.height)
  const lip = clamp(params.lip, 0, h * 0.9)
  const t = clamp(params.thickness, 0.002, h * 0.9)
  return [
    { lateral: 0, depth: 0 }, // top, back (mount line)
    { lateral: -(h - lip), depth: -proj }, // top, front (sloped down)
    { lateral: -h, depth: -proj }, // front, bottom (drip lip)
    { lateral: -t, depth: 0 }, // bottom, back
  ]
}

/**
 * Build a door threshold (low sill) cross-section. Unlike the tall frame
 * profile this is a shallow bar with chamfered top edges (a walk-over sill).
 * Lateral 0 = the outer/bottom edge, increasing up into the opening; depth runs
 * 0..depth. `height` is how far the sill rises, kept small so it reads as thin.
 */
export const buildThresholdProfile = (
  height: number,
  depth: number,
  chamfer: number,
): Profile => {
  const h = Math.max(0.004, height)
  const d = Math.max(0.004, depth)
  const ch = clamp(chamfer, 0, Math.min(h, d) * 0.49)
  if (ch <= 0) {
    return [
      { lateral: 0, depth: 0 },
      { lateral: h, depth: 0 },
      { lateral: h, depth: d },
      { lateral: 0, depth: d },
    ]
  }
  return [
    { lateral: 0, depth: 0 }, // bottom-front
    { lateral: h - ch, depth: 0 }, // up the front face
    { lateral: h, depth: ch }, // chamfer to the top
    { lateral: h, depth: d - ch }, // across the top
    { lateral: h - ch, depth: d }, // chamfer down to the back
    { lateral: 0, depth: d }, // bottom-back
  ]
}
