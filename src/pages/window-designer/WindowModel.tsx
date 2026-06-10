import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { buildBarGeometry, buildFrameGeometry } from './frameGeometry'
import {
  buildMullionProfile,
  buildProfile,
  buildRainRailProfile,
  type ProfileStyle,
} from './profiles'

/** Where a glazing bar sits relative to the glass. */
export type MullionSide = 'through' | 'front' | 'back'
export const mullionSides: MullionSide[] = ['through', 'front', 'back']

/**
 * Per-light opening mode. `fixed` is non-opening; the others are openable and
 * name the hinge edge: `left`/`right` (casement), `top` (awning, "over") and
 * `bottom` (hopper, "under").
 */
export type LightMode = 'fixed' | 'left' | 'right' | 'top' | 'bottom'
export const lightModes: LightMode[] = [
  'fixed',
  'left',
  'right',
  'top',
  'bottom',
]

/** Fully dynamic description of a window. Tweak any value to rebuild. */
export type WindowConfig = {
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
}

export const defaultConfig: WindowConfig = {
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
  rainRail: true,
  rainProjection: 0.025,
  rainHeight: 0.01,
  rainLip: 0.03,
  rainThickness: 0.03,
  glassThickness: 0.024,
  glassInset: 0.0,
  frameColor: '#e8e8ea',
  sashColor: '#f4f4f6',
  glassColor: '#bfe3ec',
  rainColor: '#9aa0a6',
}

type Keyed = { geometry: THREE.BufferGeometry; key: string }

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
  sash: THREE.BufferGeometry
  bars: Keyed[]
  glass: { width: number; height: number; thickness: number; z: number }
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
  // --- Outer frame ---
  const frameProfile = buildProfile(c.frameStyle, {
    width: c.frameWidth,
    depth: c.frameDepth,
    rebateWidth: c.frameRebateWidth,
    rebateDepth: c.frameRebateDepth,
    chamfer: c.frameChamfer,
  })
  const frame = buildFrameGeometry(frameProfile, c.outerWidth, c.outerHeight, 0)

  // Frame opening (inside the outer frame).
  const openingW = c.outerWidth - 2 * c.frameWidth
  const openingH = c.outerHeight - 2 * c.frameWidth

  // Sit everything forward in the frame (fronts flush at depth 0).
  const sashZ = 0

  // --- Subdivide the opening into a grid of lights ---
  const cols = Math.max(1, Math.round(c.lightsX))
  const rows = Math.max(1, Math.round(c.lightsY))
  const structW = c.structWidth
  const cellW = (openingW - (cols - 1) * structW) / cols
  const cellH = (openingH - (rows - 1) * structW) / rows
  // Left/bottom edge of column i / row j, and the center of cell (i, j).
  const colCenter = (i: number) =>
    -openingW / 2 + i * (cellW + structW) + cellW / 2
  const rowCenter = (j: number) =>
    -openingH / 2 + j * (cellH + structW) + cellH / 2

  // --- Structural dividers (full-depth members, reuse the symmetric bar) ---
  const structProfile = buildMullionProfile(
    structW,
    c.frameDepth,
    c.frameChamfer,
  )
  const structures: Keyed[] = []
  for (let i = 1; i < cols; i++) {
    const x = -openingW / 2 + i * (cellW + structW) - structW / 2
    const geometry = buildBarGeometry(structProfile, openingH, 'y', 0)
    geometry.translate(x, 0, 0)
    structures.push({ geometry, key: `mv-${i}` })
  }
  for (let j = 1; j < rows; j++) {
    const y = -openingH / 2 + j * (cellH + structW) - structW / 2
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
  // Seat the stop just behind the sash (a small overlap keeps them in contact)
  // and within the frame depth, so the sash visibly rests against it.
  const stopOverlap = Math.min(c.stopDepth * 0.4, c.sashDepth * 0.5)
  const stopZ = Math.min(
    sashZ + c.sashDepth - stopOverlap,
    c.frameDepth - c.stopDepth,
  )
  const stopInset = 0.001 // keep stop just inside the sash edge (no coplanar)

  const stops: Keyed[] = []
  const lights: LightGeo[] = []

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const cx = colCenter(i)
      const cy = rowCenter(j)
      const id = `${i}-${j}`

      const sashOuterW = cellW - 2 * c.sashGap
      const sashOuterH = cellH - 2 * c.sashGap

      // Stop aligned to the sash outer rectangle (edges line up) and seated
      // just behind it.
      if (c.sashStop) {
        const stopGeo = buildFrameGeometry(
          stopProfile,
          sashOuterW - 2 * stopInset,
          sashOuterH - 2 * stopInset,
          stopZ,
        )
        stopGeo.translate(cx, cy, 0)
        stops.push({ geometry: stopGeo, key: `stop-${id}` })
      }
      // Built centered on the cell origin (not translated to cx/cy) so the
      // renderer can swing the whole light about its hinge edge.
      const sash = buildFrameGeometry(
        sashProfile,
        sashOuterW,
        sashOuterH,
        sashZ,
      )

      const sashOpenW = sashOuterW - 2 * c.sashWidth
      const sashOpenH = sashOuterH - 2 * c.sashWidth

      // Glazing bars (decorative grid) within this light.
      const bars: Keyed[] = []
      for (let k = 1; k <= c.mullionsX; k++) {
        const xOff = -sashOpenW / 2 + (sashOpenW * k) / (c.mullionsX + 1)
        const geometry = buildBarGeometry(mullionProfile, sashOpenH, 'y', barZ)
        geometry.translate(xOff, 0, 0)
        bars.push({ geometry, key: `barv-${id}-${k}` })
      }
      for (let k = 1; k <= c.mullionsY; k++) {
        const yOff = -sashOpenH / 2 + (sashOpenH * k) / (c.mullionsY + 1)
        const geometry = buildBarGeometry(mullionProfile, sashOpenW, 'x', barZ)
        geometry.translate(0, yOff, 0)
        bars.push({ geometry, key: `barh-${id}-${k}` })
      }

      lights.push({
        key: id,
        cx,
        cy,
        sashOuterW,
        sashOuterH,
        sash,
        bars,
        glass: {
          width: Math.max(0.001, sashOpenW - 2 * c.glassInset),
          height: Math.max(0.001, sashOpenH - 2 * c.glassInset),
          thickness: c.glassThickness,
          z: sashZ + c.sashDepth / 2,
        },
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
    rail.translate(0, -openingH / 2, 0)
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

/**
 * Hinge pivot (relative to the light's cell center) and rotation for a mode.
 * The pivot sits at the sash mid-depth so the leaf swings like a real hinge.
 */
const hingeTransform = (
  light: LightGeo,
  mode: LightMode,
  angleRad: number,
): { pivot: [number, number, number]; rotation: [number, number, number] } => {
  const hw = light.sashOuterW / 2
  const hh = light.sashOuterH / 2
  const dz = light.glass.z // sash mid-depth
  switch (mode) {
    case 'left':
      return { pivot: [-hw, 0, dz], rotation: [0, -angleRad, 0] }
    case 'right':
      return { pivot: [hw, 0, dz], rotation: [0, angleRad, 0] }
    case 'top':
      return { pivot: [0, hh, dz], rotation: [-angleRad, 0, 0] }
    case 'bottom':
      return { pivot: [0, -hh, dz], rotation: [angleRad, 0, 0] }
    default:
      return { pivot: [0, 0, 0], rotation: [0, 0, 0] }
  }
}

const frameMaterialProps = {
  roughness: 0.45,
  metalness: 0.05,
  // Normals are computed analytically (always outward), but triangle winding
  // is not relied upon, so render double-sided to avoid any culling surprises.
  side: THREE.DoubleSide,
} as const

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
        for (const b of l.bars) b.geometry.dispose()
      }
    },
    [geo],
  )

  // Outward swing moves the free edge toward the front (+Z); inward flips it.
  const angleRad =
    ((config.openAngle * Math.PI) / 180) * (config.openInward ? -1 : 1)

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
        const { pivot, rotation } = hingeTransform(light, mode, angleRad)
        // Outer group sits at the hinge axis and rotates; inner group places
        // the cell-local content back at the cell center relative to that axis.
        return (
          <group
            key={light.key}
            position={[light.cx + pivot[0], light.cy + pivot[1], pivot[2]]}
            rotation={rotation}
          >
            <group position={[-pivot[0], -pivot[1], -pivot[2]]}>
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
              <mesh position={[0, 0, light.glass.z]}>
                <boxGeometry
                  args={[
                    light.glass.width,
                    light.glass.height,
                    light.glass.thickness,
                  ]}
                />
                <meshPhysicalMaterial
                  color={config.glassColor}
                  transmission={0.95}
                  thickness={light.glass.thickness}
                  roughness={0.05}
                  ior={1.5}
                  transparent
                  opacity={0.55}
                  metalness={0}
                />
              </mesh>
            </group>
          </group>
        )
      })}

      {geo.rail && (
        <mesh geometry={geo.rail} castShadow receiveShadow>
          <meshStandardMaterial
            color={config.rainColor}
            roughness={0.35}
            metalness={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}
