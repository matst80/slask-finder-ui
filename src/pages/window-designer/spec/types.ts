import type { LightMode, MullionSide, SurfaceMaterial } from '../config'
import type { ProfileStyle } from '../profiles'
import type { WindowShape } from '../shapes'

/**
 * The authoring layer. A `WindowSpec` is a discriminated union (by `kind`) that
 * only carries the properties valid for that kind of window — illegal field
 * combinations don't typecheck. `buildConfig` (see ./build) compiles a spec
 * down to the flat `WindowConfig` the renderer consumes, merging each supplied
 * section over a base config so unspecified sections are preserved.
 *
 * Every section is a partial bag of "a bunch of properties"; presets are just
 * spec objects, and the fluent builder (./builder) is sugar over the same spec.
 */

/** A toggleable section: `true`/`false` flips it on/off, an object also tunes it. */
export type Toggle<T> = boolean | T

export type ShapedWindowShape = Exclude<WindowShape, 'rect'>

// --- Section property groups (all fields optional; absent = keep base) -------

export type SizeProps = { width?: number; height?: number }

export type FrameProps = {
  style?: ProfileStyle
  width?: number
  depth?: number
  rebateWidth?: number
  rebateDepth?: number
  chamfer?: number
}

export type SashProps = {
  style?: ProfileStyle
  gap?: number
  width?: number
  depth?: number
  rebateWidth?: number
  rebateDepth?: number
  chamfer?: number
}

export type GlazingProps = {
  x?: number
  y?: number
  width?: number
  depth?: number
  chamfer?: number
  side?: MullionSide
}

export type GlassProps = { thickness?: number; inset?: number }

export type ColorProps = {
  frame?: string
  sash?: string
  glass?: string
  rain?: string
  panel?: string
}

export type GridProps = { x?: number; y?: number; dividerWidth?: number }

export type OpenProps = { angle?: number; inward?: boolean }

export type SashStopProps = {
  width?: number
  depth?: number
  chamfer?: number
  style?: ProfileStyle
}

export type MeetingStileProps = { width?: number }

export type MidRailProps = {
  height?: number
  thickness?: number
  kickPanel?: boolean
}

export type RainRailProps = {
  projection?: number
  height?: number
  lip?: number
  thickness?: number
}

export type ThresholdProps = {
  height?: number
  depth?: number
  chamfer?: number
}

// --- Common + per-kind specs -------------------------------------------------

/** Sections shared by every kind. */
export type CommonSpec = {
  material?: SurfaceMaterial
  size?: SizeProps
  frame?: FrameProps
  glass?: GlassProps
  glazing?: GlazingProps
  colors?: ColorProps
}

/** Sections shared by the openable (rectangular) kinds. */
export type OpenableSpec = {
  grid?: GridProps
  /** Per-cell opening mode, keyed `${col}-${row}`; merged over the base. */
  openings?: Record<string, LightMode>
  open?: OpenProps
  sash?: SashProps
  sashStop?: Toggle<SashStopProps>
  meetingStile?: Toggle<MeetingStileProps>
  midRail?: Toggle<MidRailProps>
  rainRail?: Toggle<RainRailProps>
}

/** A rectangular, openable window. */
export type CasementSpec = CommonSpec &
  OpenableSpec & {
    kind: 'window'
  }

/** A rectangular door: openable, plus a low threshold along the bottom. */
export type DoorSpec = CommonSpec &
  OpenableSpec & {
    kind: 'door'
    threshold?: ThresholdProps
  }

/** A fixed, single-glazed free-form shape (optionally with glazing bars). */
export type ShapedSpec = CommonSpec & {
  kind: 'shaped'
  shape: ShapedWindowShape
  /** The shape's adjustable measurement (fraction in [0,1]). */
  shapeParam?: number
}

export type WindowSpec = CasementSpec | DoorSpec | ShapedSpec
export type WindowKind = WindowSpec['kind']
