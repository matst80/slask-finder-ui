import type { ProfileStyle } from './profiles'
import type { WindowShape } from './shapes'

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
  /**
   * Outer outline. `rect` is the full pipeline (lights, openings, doors, …);
   * any other shape is a fixed, single-glazed polygon swept with the frame
   * profile.
   */
  shape: WindowShape
  /** The adjustable measurement for shapes that carry one (fraction in [0,1]). */
  shapeParam: number
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
  shape: 'rect',
  shapeParam: 0.5,
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
