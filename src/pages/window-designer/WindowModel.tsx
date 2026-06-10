import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import {
  buildBarGeometry,
  buildDoorFrameGeometry,
  buildFrame,
  buildFrameGeometry,
} from './frameGeometry'
import {
  buildMullionProfile,
  buildProfile,
  buildRainRailProfile,
  buildThresholdProfile,
  type ProfileStyle,
} from './profiles'

/** Window (sill-less, centered opening) or door (low threshold along bottom). */
export type WindowType = 'window' | 'door'
export const windowTypes: WindowType[] = ['window', 'door']

/** Surface finish of the joinery (frame, sash, mullions, panels). */
export type SurfaceMaterial = 'pvc' | 'wood' | 'aluminium'
export const surfaceMaterials: SurfaceMaterial[] = ['pvc', 'wood', 'aluminium']

/** PBR finish per material (colour stays separately configurable). */
export const surfaceProps = (
  material: SurfaceMaterial,
): { roughness: number; metalness: number; envMapIntensity: number } => {
  switch (material) {
    case 'aluminium':
      return { roughness: 0.35, metalness: 0.9, envMapIntensity: 1.0 }
    case 'wood':
      return { roughness: 0.75, metalness: 0.0, envMapIntensity: 0.3 }
    default: // pvc
      return { roughness: 0.5, metalness: 0.0, envMapIntensity: 0.6 }
  }
}

/** Where a glazing bar sits relative to the glass. */
export type MullionSide = 'through' | 'front' | 'back'
export const mullionSides: MullionSide[] = ['through', 'front', 'back']

/**
 * Per-light opening mode. `fixed` is non-opening; the hinge modes name the
 * hinge edge (`left`/`right` casement, `top` awning, `bottom` hopper); the
 * `slide-*` modes slide the leaf sideways in front of its neighbour.
 */
export type LightMode =
  | 'fixed'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'slide-left'
  | 'slide-right'
export const lightModes: LightMode[] = [
  'fixed',
  'left',
  'right',
  'top',
  'bottom',
  'slide-left',
  'slide-right',
]

/** Fully dynamic description of a window. Tweak any value to rebuild. */
export type WindowConfig = {
  /** Window or door (door swaps the bottom for a low threshold). */
  type: WindowType
  /** Joinery surface finish (PVC, wood, aluminium). */
  material: SurfaceMaterial
  /** Door threshold (low sill) profile. */
  thresholdHeight: number
  thresholdDepth: number
  thresholdChamfer: number
  /** Overall window dimensions (outer rectangle of the frame). */
  outerWidth: number
  outerHeight: number
  /** Outer frame profile. */
  frameWidth: number
  frameDepth: number
  frameStyle: ProfileStyle
  frameRebateWidth: number
  frameRebateDepth: number
  frameChamfer: number
  /** Number of lights (separately glazed openings) across and down. */
  lightsX: number
  lightsY: number
  /** Width of the structural mullion/transom dividing the lights. */
  structWidth: number
  /** Wider meeting-stile profile on interior vertical edges (double doors). */
  meetingStile: boolean
  meetingStileWidth: number
  /** Per-light opening mode, keyed by `${col}-${row}` (default fixed). */
  lights: Record<string, LightMode>
  /** Swing angle (degrees) used to preview openable lights. */
  openAngle: number
  /** Swing direction: true = inward, false = outward (toward the front). */
  openInward: boolean
  /** Fixed sash-stop / rebate ledge the sash closes against (visible open). */
  sashStop: boolean
  stopWidth: number
  stopDepth: number
  stopChamfer: number
  stopStyle: ProfileStyle
  /** Gap between the frame opening and the sash (the casement reveal). */
  sashGap: number
  /** Inner frame (sash) profile. */
  sashWidth: number
  sashDepth: number
  sashStyle: ProfileStyle
  sashRebateWidth: number
  sashRebateDepth: number
  sashChamfer: number
  /** Glazing bar grid dividing the glass. */
  mullionsX: number
  mullionsY: number
  mullionWidth: number
  /** Glazing bar profile: through the glass, or applied to one face only. */
  mullionSide: MullionSide
  /** Depth of the bar when applied to a single face. */
  mullionDepth: number
  /** Corner bevel of the glazing bar (0 = square). */
  mullionChamfer: number
  /** Horizontal mid rail (lock rail) splitting each light. */
  midRail: boolean
  /** Height of the mid rail center, measured up from the opening bottom. */
  midRailHeight: number
  /** Vertical extent (thickness) of the mid rail. */
  midRailWidth: number
  /** Fill the area below the mid rail with a solid panel (door kick panel). */
  kickPanel: boolean
  /** Bottom aluminium rain rail (drip / water bar). */
  rainRail: boolean
  rainProjection: number
  rainHeight: number
  rainLip: number
  rainThickness: number
  /** Glass. */
  glassThickness: number
  glassInset: number
  /** Colors. */
  frameColor: string
  sashColor: string
  glassColor: string
  rainColor: string
  panelColor: string
}

export const defaultConfig: WindowConfig = {
  type: 'window',
  material: 'pvc',
  thresholdHeight: 0.03,
  thresholdDepth: 0.05,
  thresholdChamfer: 0.008,
  outerWidth: 1.2,
  outerHeight: 1.5,
  frameWidth: 0.07,
  frameDepth: 0.07,
  frameStyle: 'classic',
  frameRebateWidth: 0.005,
  frameRebateDepth: 0.005,
  frameChamfer: 0.008,
  lightsX: 2,
  lightsY: 1,
  structWidth: 0.06,
  meetingStile: false,
  meetingStileWidth: 0.1,
  lights: { '0-0': 'left' },
  openAngle: 16,
  openInward: false,
  sashStop: true,
  stopWidth: 0.015,
  stopDepth: 0.02,
  stopChamfer: 0.004,
  stopStyle: 'classic',
  sashGap: 0.004,
  sashWidth: 0.06,
  sashDepth: 0.055,
  sashStyle: 'classic',
  sashRebateWidth: 0.004,
  sashRebateDepth: 0.003,
  sashChamfer: 0.006,
  mullionsX: 1,
  mullionsY: 2,
  mullionWidth: 0.025,
  mullionSide: 'through',
  mullionDepth: 0.02,
  mullionChamfer: 0.01,
  midRail: false,
  midRailHeight: 0.9,
  midRailWidth: 0.1,
  kickPanel: false,
  rainRail: true,
  rainProjection: 0.015,
  rainHeight: 0.01,
  rainLip: 0.03,
  rainThickness: 0.03,
  glassThickness: 0.024,
  glassInset: 0.0,
  frameColor: '#e8e8ea',
  sashColor: '#f4f4f6',
  glassColor: '#bfe3ec',
  rainColor: '#9aa0a6',
  panelColor: '#e6e7ea',
}

type Keyed = { geometry: THREE.BufferGeometry; key: string }

/** A glazed or solid (kick panel) infill region within a light. */
type Infill = {
  kind: 'glass' | 'panel'
  width: number
  height: number
  x: number
  y: number
  z: number
  thickness: number
  key: string
}

/**
 * One light's parts, built in cell-LOCAL coordinates (cell centered on the
 * origin). `cx`/`cy` is where the cell sits in the window; `sashOuterW/H` give
 * the sash extent so the renderer can locate the hinge edge. Keeping the parts
 * local lets the renderer swing the whole light about its hinge.
 */
type LightGeo = {
  key: string
  cx: number
  cy: number
  sashOuterW: number
  sashOuterH: number
  midZ: number
  sash: THREE.BufferGeometry
  bars: Keyed[]
  infills: Infill[]
  /** Drip rail protecting the mid rail (moves with the leaf). */
  railBar: THREE.BufferGeometry | null
}

type DerivedGeometry = {
  frame: THREE.BufferGeometry
  /** Structural mullions/transoms dividing the lights. */
  structures: Keyed[]
  /** Fixed sash-stop ledges, one per light cell. */
  stops: Keyed[]
  lights: LightGeo[]
  rail: THREE.BufferGeometry | null
  centerZ: number
}

const buildGeometry = (c: WindowConfig): DerivedGeometry => {
  const isDoor = c.type === 'door'

  // --- Outer frame (head + jambs share the frame profile) ---
  const frameProfile = buildProfile(c.frameStyle, {
    width: c.frameWidth,
    depth: c.frameDepth,
    rebateWidth: c.frameRebateWidth,
    rebateDepth: c.frameRebateDepth,
    chamfer: c.frameChamfer,
  })
  // A door swaps the bottom member for a low threshold; a window mitres all
  // four corners of the single frame profile.
  const bottomWidth = isDoor ? c.thresholdHeight : c.frameWidth
  const frame = isDoor
    ? buildDoorFrameGeometry(
        frameProfile,
        buildThresholdProfile(
          c.thresholdHeight,
          c.thresholdDepth,
          c.thresholdChamfer,
        ),
        c.outerWidth,
        c.outerHeight,
        0,
      )
    : buildFrameGeometry(frameProfile, c.outerWidth, c.outerHeight, 0)

  // Frame opening. The bottom member may be shorter (door threshold), so the
  // opening is taller and its center shifts down.
  const openingW = c.outerWidth - 2 * c.frameWidth
  const openingH = c.outerHeight - c.frameWidth - bottomWidth
  const openY = (bottomWidth - c.frameWidth) / 2

  // Sit everything forward in the frame (fronts flush at depth 0).
  const sashZ = 0

  // --- Subdivide the opening into a grid of lights ---
  const cols = Math.max(1, Math.round(c.lightsX))
  const rows = Math.max(1, Math.round(c.lightsY))
  const structW = c.structWidth
  const cellW = (openingW - (cols - 1) * structW) / cols
  const cellH = (openingH - (rows - 1) * structW) / rows
  // Center of column i / row j, accounting for the opening's vertical shift.
  const colCenter = (i: number) =>
    -openingW / 2 + i * (cellW + structW) + cellW / 2
  const rowCenter = (j: number) =>
    openY - openingH / 2 + j * (cellH + structW) + cellH / 2

  // --- Structural dividers (full-depth members, reuse the symmetric bar) ---
  const structProfile = buildMullionProfile(
    structW,
    c.frameDepth,
    c.frameChamfer,
  )
  const isSliding = (col: number, row: number) => {
    const mode = c.lights[`${col}-${row}`]
    return mode === 'slide-left' || mode === 'slide-right'
  }
  const structures: Keyed[] = []
  for (let i = 1; i < cols; i++) {
    // A sliding leaf passes its neighbour in depth, so there is no fixed
    // mullion between it and the column it overlaps; drop the divider if either
    // side slides in any row.
    let slides = false
    for (let j = 0; j < rows; j++) {
      if (isSliding(i - 1, j) || isSliding(i, j)) {
        slides = true
        break
      }
    }
    if (slides) continue
    const x = -openingW / 2 + i * (cellW + structW) - structW / 2
    const geometry = buildBarGeometry(structProfile, openingH, 'y', 0)
    geometry.translate(x, openY, 0)
    structures.push({ geometry, key: `mv-${i}` })
  }
  for (let j = 1; j < rows; j++) {
    const y = openY - openingH / 2 + j * (cellH + structW) - structW / 2
    const geometry = buildBarGeometry(structProfile, openingW, 'x', 0)
    geometry.translate(0, y, 0)
    structures.push({ geometry, key: `mh-${j}` })
  }

  // --- Per-light sash, glazing bars and glass ---
  const sashProfile = buildProfile(c.sashStyle, {
    width: c.sashWidth,
    depth: c.sashDepth,
    rebateWidth: c.sashRebateWidth,
    rebateDepth: c.sashRebateDepth,
    chamfer: c.sashChamfer,
  })
  // Wider meeting stile (same shape, wider) used on interior vertical edges
  // where two leaves abut, e.g. a double door.
  const meetingStileProfile = buildProfile(c.sashStyle, {
    width: c.meetingStileWidth,
    depth: c.sashDepth,
    rebateWidth: c.sashRebateWidth,
    rebateDepth: c.sashRebateDepth,
    chamfer: c.sashChamfer,
  })
  // A through-bar spans the full sash depth; a one-sided bar is applied to the
  // front or back face of the glass only.
  const barDepth =
    c.mullionSide === 'through'
      ? c.sashDepth
      : Math.min(c.mullionDepth, c.sashDepth)
  const barZ = c.mullionSide === 'back' ? sashZ + c.sashDepth - barDepth : sashZ
  const mullionProfile = buildMullionProfile(
    c.mullionWidth,
    barDepth,
    c.mullionChamfer,
  )

  // Fixed sash-stop ledge swept around each cell, set back in depth so the
  // sash closes against it; revealed when the light is opened.
  const stopProfile = buildProfile(c.stopStyle, {
    width: c.stopWidth,
    depth: c.stopDepth,
    rebateWidth: 0,
    rebateDepth: 0,
    chamfer: c.stopChamfer,
  })
  // Seat the stop against the face the sash closes onto, with a small overlap
  // to keep them in contact. An outward-swinging leaf rests against a stop
  // behind it (+Z); an inward-swinging leaf rests against a stop on its front
  // face (toward the camera), so the stop mirrors to the front when openInward.
  const stopOverlap = Math.min(c.stopDepth * 0.4, c.sashDepth * 0.5)
  const stopZ = c.openInward
    ? Math.max(sashZ - c.stopDepth + stopOverlap, 0)
    : Math.min(sashZ + c.sashDepth - stopOverlap, c.frameDepth - c.stopDepth)
  // Run the stop to the cell edge and a touch beyond, so it merges into the
  // surrounding frame / dividers instead of floating at the sash edge.
  const stopEmbed = 0.003

  const stops: Keyed[] = []
  const lights: LightGeo[] = []

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const cx = colCenter(i)
      const cy = rowCenter(j)
      const id = `${i}-${j}`

      const sashOuterW = cellW - 2 * c.sashGap
      const sashOuterH = cellH - 2 * c.sashGap

      // Stop runs to the cell opening (merging into the frame) and protrudes
      // inward; the sash closes against it and it sits just behind the sash.
      if (c.sashStop) {
        const stopGeo = buildFrameGeometry(
          stopProfile,
          cellW + 2 * stopEmbed,
          cellH + 2 * stopEmbed,
          stopZ,
        )
        stopGeo.translate(cx, cy, 0)
        stops.push({ geometry: stopGeo, key: `stop-${id}` })
      }
      // A meeting stile goes on an interior vertical edge (where leaves abut).
      // Its corners butt (stile runs through), so the leaf becomes stile-and-
      // rail there; plain edges stay mitered like a window sash.
      const hasLeftStile = c.meetingStile && i > 0
      const hasRightStile = c.meetingStile && i < cols - 1
      const leftW = hasLeftStile ? c.meetingStileWidth : c.sashWidth
      const rightW = hasRightStile ? c.meetingStileWidth : c.sashWidth

      // Built centered on the cell origin (not translated to cx/cy) so the
      // renderer can swing the whole light about its hinge edge.
      const sash = buildFrame(
        {
          top: sashProfile,
          bottom: sashProfile,
          left: hasLeftStile ? meetingStileProfile : sashProfile,
          right: hasRightStile ? meetingStileProfile : sashProfile,
        },
        {
          tl: hasLeftStile ? 'butt' : 'miter',
          bl: hasLeftStile ? 'butt' : 'miter',
          tr: hasRightStile ? 'butt' : 'miter',
          br: hasRightStile ? 'butt' : 'miter',
        },
        sashOuterW,
        sashOuterH,
        sashZ,
      )

      // A wider stile on one side shrinks the opening and shifts it sideways.
      const sashOpenW = sashOuterW - leftW - rightW
      const sashOpenH = sashOuterH - 2 * c.sashWidth
      const openXC = (leftW - rightW) / 2
      const midZ = sashZ + c.sashDepth / 2

      // A mid rail (and/or kick panel) splits the opening into stacked regions.
      // Each region is glass or a solid panel; glazing bars only grid the glass.
      type Region = { kind: Infill['kind']; y: number; h: number; tag: string }
      const regions: Region[] = []
      if (c.midRail || c.kickPanel) {
        const railHalf = c.midRail ? c.midRailWidth / 2 : 0
        const yRail = Math.min(
          Math.max(-sashOpenH / 2 + c.midRailHeight, -sashOpenH / 2 + railHalf),
          sashOpenH / 2 - railHalf,
        )
        const lowTop = yRail - railHalf
        const highBot = yRail + railHalf
        regions.push({
          kind: c.kickPanel ? 'panel' : 'glass',
          y: (-sashOpenH / 2 + lowTop) / 2,
          h: lowTop + sashOpenH / 2,
          tag: 'low',
        })
        regions.push({
          kind: 'glass',
          y: (highBot + sashOpenH / 2) / 2,
          h: sashOpenH / 2 - highBot,
          tag: 'high',
        })
      } else {
        regions.push({ kind: 'glass', y: 0, h: sashOpenH, tag: 'full' })
      }

      const bars: Keyed[] = []
      const infillW = Math.max(
        0.001,
        sashOpenW + 2 * c.sashRebateWidth - 2 * c.glassInset,
      )
      const infills: Infill[] = regions.map((r) => ({
        kind: r.kind,
        width: infillW,
        height: Math.max(0.001, r.h + 2 * c.sashRebateWidth - 2 * c.glassInset),
        x: openXC,
        y: r.y,
        z: midZ,
        thickness: r.kind === 'panel' ? c.sashDepth * 0.6 : c.glassThickness,
        key: `infill-${id}-${r.tag}`,
      }))

      // Glazing bars grid each glass region only (never the kick panel).
      for (const r of regions) {
        if (r.kind !== 'glass') continue
        for (let k = 1; k <= c.mullionsX; k++) {
          const xOff = -sashOpenW / 2 + (sashOpenW * k) / (c.mullionsX + 1)
          const geometry = buildBarGeometry(mullionProfile, r.h, 'y', barZ)
          geometry.translate(openXC + xOff, r.y, 0)
          bars.push({ geometry, key: `barv-${id}-${r.tag}-${k}` })
        }
        for (let k = 1; k <= c.mullionsY; k++) {
          const yOff = r.y - r.h / 2 + (r.h * k) / (c.mullionsY + 1)
          const geometry = buildBarGeometry(
            mullionProfile,
            sashOpenW,
            'x',
            barZ,
          )
          geometry.translate(openXC, yOff, 0)
          bars.push({ geometry, key: `barh-${id}-${r.tag}-${k}` })
        }
      }

      // The mid rail bar itself sits at the split line, with an optional drip
      // rail mounted on top of it (shares the rain-rail toggle).
      let railBar: THREE.BufferGeometry | null = null
      if (c.midRail) {
        const railHalf = c.midRailWidth / 2
        const yRail = Math.min(
          Math.max(-sashOpenH / 2 + c.midRailHeight, -sashOpenH / 2 + railHalf),
          sashOpenH / 2 - railHalf,
        )
        const geometry = buildBarGeometry(
          buildMullionProfile(c.midRailWidth, c.sashDepth, c.mullionChamfer),
          sashOpenW,
          'x',
          sashZ,
        )
        geometry.translate(openXC, yRail, 0)
        bars.push({ geometry, key: `midrail-${id}` })

        if (c.rainRail) {
          railBar = buildBarGeometry(
            buildRainRailProfile({
              projection: c.rainProjection,
              height: c.rainHeight,
              lip: c.rainLip,
              thickness: c.rainThickness,
            }),
            sashOpenW,
            'x',
            sashZ,
          )
          // Mount on the top edge of the mid rail.
          railBar.translate(openXC, yRail + railHalf, 0)
        }
      }

      lights.push({
        key: id,
        cx,
        cy,
        sashOuterW,
        sashOuterH,
        midZ,
        sash,
        bars,
        infills,
        railBar,
      })
    }
  }

  // --- Bottom aluminium rain rail (drip / water bar) ---
  // Extruded across the whole opening, mounted at the bottom edge, projecting
  // out past the front face (along -Z) and sloping down to a lip.
  let rail: THREE.BufferGeometry | null = null
  if (c.rainRail) {
    const railProfile = buildRainRailProfile({
      projection: c.rainProjection,
      height: c.rainHeight,
      lip: c.rainLip,
      thickness: c.rainThickness,
    })
    rail = buildBarGeometry(railProfile, openingW, 'x', sashZ)
    rail.translate(0, openY - openingH / 2, 0)
  }

  return {
    frame,
    structures,
    stops,
    lights,
    rail,
    centerZ: c.frameDepth / 2,
  }
}

type Vec3 = [number, number, number]

/**
 * Resolve a light's operation into two nested-group transforms plus a rotation.
 * Hinge modes pivot about the hinge edge at sash mid-depth; slide modes shift
 * the leaf sideways onto a front track; fixed lights sit in place.
 */
const lightTransform = (
  light: LightGeo,
  mode: LightMode,
  angleRad: number,
  slideFrac: number,
): { outerPos: Vec3; innerPos: Vec3; rotation: Vec3 } => {
  const hw = light.sashOuterW / 2
  const hh = light.sashOuterH / 2
  const dz = light.midZ // sash mid-depth
  const place = (pivot: Vec3, rotation: Vec3) => ({
    outerPos: [light.cx + pivot[0], light.cy + pivot[1], pivot[2]] as Vec3,
    innerPos: [-pivot[0], -pivot[1], -pivot[2]] as Vec3,
    rotation,
  })
  // Slide a leaf sideways along its own track. Opposing leaves ride tracks
  // offset in depth by a full sash thickness (slide-left in front, slide-right
  // behind), so they pass each other and clear the fixed leaves in the plane
  // between them instead of intersecting. The offset is constant (sliders sit
  // on their tracks even when closed); only the sideways travel scales.
  const slide = (dir: number) => ({
    outerPos: [
      light.cx + dir * slideFrac * light.sashOuterW,
      light.cy,
      dir < 0 ? -dz * 2 : dz * 2,
    ] as Vec3,
    innerPos: [0, 0, 0] as Vec3,
    rotation: [0, 0, 0] as Vec3,
  })
  switch (mode) {
    case 'left':
      return place([-hw, 0, dz], [0, -angleRad, 0])
    case 'right':
      return place([hw, 0, dz], [0, angleRad, 0])
    case 'top':
      return place([0, hh, dz], [-angleRad, 0, 0])
    case 'bottom':
      return place([0, -hh, dz], [angleRad, 0, 0])
    case 'slide-left':
      return slide(-1)
    case 'slide-right':
      return slide(1)
    default:
      return place([0, 0, 0], [0, 0, 0])
  }
}

export const WindowModel = ({ config }: { config: WindowConfig }) => {
  const geo = useMemo(() => buildGeometry(config), [config])

  // Dispose superseded geometries when the config changes or on unmount.
  useEffect(
    () => () => {
      geo.frame.dispose()
      geo.rail?.dispose()
      for (const m of geo.structures) m.geometry.dispose()
      for (const m of geo.stops) m.geometry.dispose()
      for (const l of geo.lights) {
        l.sash.dispose()
        l.railBar?.dispose()
        for (const b of l.bars) b.geometry.dispose()
      }
    },
    [geo],
  )

  // Surface finish (PVC / wood / aluminium) for all joinery; double-sided
  // because triangle winding isn't relied upon (normals are analytic).
  const frameMaterialProps = {
    ...surfaceProps(config.material),
    side: THREE.DoubleSide,
  }

  // Outward swing moves the free edge away from the camera (-Z); inward flips.
  const angleRad =
    ((config.openAngle * Math.PI) / 180) * (config.openInward ? 1 : -1)
  // Reuse the open-amount slider (0..60) as the slide fraction (0..1).
  const slideFrac = config.openAngle / 60

  return (
    <group position={[0, 0, -geo.centerZ]}>
      <mesh geometry={geo.frame} castShadow receiveShadow>
        <meshStandardMaterial
          color={config.frameColor}
          {...frameMaterialProps}
        />
      </mesh>

      {geo.structures.map((m) => (
        <mesh key={m.key} geometry={m.geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={config.frameColor}
            {...frameMaterialProps}
          />
        </mesh>
      ))}

      {geo.stops.map((m) => (
        <mesh key={m.key} geometry={m.geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={config.frameColor}
            {...frameMaterialProps}
          />
        </mesh>
      ))}

      {geo.lights.map((light) => {
        const mode = config.lights[light.key] ?? 'fixed'
        const { outerPos, innerPos, rotation } = lightTransform(
          light,
          mode,
          angleRad,
          slideFrac,
        )
        // Outer group carries the operation (hinge pivot / slide); inner group
        // places the cell-local content back at the cell center.
        return (
          <group key={light.key} position={outerPos} rotation={rotation}>
            <group position={innerPos}>
              <mesh geometry={light.sash} castShadow receiveShadow>
                <meshStandardMaterial
                  color={config.sashColor}
                  {...frameMaterialProps}
                />
              </mesh>
              {light.bars.map((b) => (
                <mesh
                  key={b.key}
                  geometry={b.geometry}
                  castShadow
                  receiveShadow
                >
                  <meshStandardMaterial
                    color={config.sashColor}
                    {...frameMaterialProps}
                  />
                </mesh>
              ))}
              {light.railBar && (
                <mesh geometry={light.railBar} castShadow receiveShadow>
                  <meshStandardMaterial
                    color={config.rainColor}
                    roughness={0.3}
                    metalness={0.9}
                    envMapIntensity={1.1}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              )}
              {light.infills.map((g) =>
                g.kind === 'panel' ? (
                  <mesh
                    key={g.key}
                    position={[g.x, g.y, g.z]}
                    castShadow
                    receiveShadow
                  >
                    <boxGeometry args={[g.width, g.height, g.thickness]} />
                    <meshStandardMaterial
                      color={config.panelColor}
                      {...frameMaterialProps}
                    />
                  </mesh>
                ) : (
                  <mesh key={g.key} position={[g.x, g.y, g.z]}>
                    <boxGeometry args={[g.width, g.height, g.thickness]} />
                    <meshPhysicalMaterial
                      color={config.glassColor}
                      transmission={1}
                      thickness={g.thickness}
                      attenuationColor={config.glassColor}
                      attenuationDistance={0.4}
                      roughness={0.08}
                      metalness={0}
                      ior={1.5}
                      reflectivity={0.5}
                      envMapIntensity={1.2}
                      transparent
                    />
                  </mesh>
                ),
              )}
            </group>
          </group>
        )
      })}

      {geo.rail && (
        <mesh geometry={geo.rail} castShadow receiveShadow>
          <meshStandardMaterial
            color={config.rainColor}
            roughness={0.3}
            metalness={0.9}
            envMapIntensity={1.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}
