import type * as THREE from 'three'

/** A geometry tagged with a stable React key. */
export type Keyed = { geometry: THREE.BufferGeometry; key: string }

/** A glazed or solid (kick panel) infill region within a light. */
export type Infill = {
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
export type LightGeo = {
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

/** Everything the renderer needs for one window, derived from the config. */
export type DerivedGeometry = {
  frame: THREE.BufferGeometry
  /** Structural mullions/transoms dividing the lights. */
  structures: Keyed[]
  /** Fixed sash-stop ledges, one per light cell. */
  stops: Keyed[]
  lights: LightGeo[]
  rail: THREE.BufferGeometry | null
  /** Single fixed glass pane for a free-form polygon shape (else null). */
  polyGlass: THREE.BufferGeometry | null
  centerZ: number
}
