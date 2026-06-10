import type { Vec2 } from './frameGeometry'

/**
 * Free-form window shapes. Each shape's outline is a function of a single
 * normalised parameter `t` (a fraction in [0, 1]) and returns vertices in the
 * unit box [-0.5, 0.5] in both axes (x right, y up, centred on the origin). The
 * renderer scales them by the outer width/height. `rect` has a null outline and
 * routes to the full rectangular pipeline (openable lights, doors, …); every
 * other shape is a fixed, single-glazed polygon swept with the frame profile.
 *
 * Shapes that aren't fully determined by width × height carry a `param` — the
 * one extra measurement the user can dial in (apex position, eaves height, …).
 */
export type WindowShape =
  | 'rect'
  | 'tri-left'
  | 'tri-right'
  | 'tri-iso'
  | 'quad-up-right'
  | 'quad-up-left'
  | 'diamond'
  | 'house'
  | 'pent-cut-tr'
  | 'pent-cut-bl'

/** An adjustable second measurement, expressed as a fraction of the outline. */
export type ShapeParam = {
  label: string
  min: number
  max: number
  default: number
}

export type ShapePreset = {
  label: string
  /** Optional adjustable measurement; absent when width × height fully fix it. */
  param?: ShapeParam
  /** Outline vertices for parameter `t`; null routes to the rect pipeline. */
  outline: ((t: number) => Vec2[]) | null
}

const p = (x: number, y: number): Vec2 => ({ x, y })

export const windowShapes: Record<WindowShape, ShapePreset> = {
  rect: { label: 'Rektangel', outline: null },
  'tri-left': {
    label: 'Figur 45 (3 hörn)',
    outline: () => [p(-0.5, -0.5), p(0.5, -0.5), p(-0.5, 0.5)],
  },
  'tri-right': {
    label: 'Figur 46 (3 hörn)',
    outline: () => [p(-0.5, -0.5), p(0.5, -0.5), p(0.5, 0.5)],
  },
  'tri-iso': {
    label: 'Figur 25 (3 hörn)',
    param: { label: 'Apex position', min: 0, max: 1, default: 0.5 },
    outline: (t) => [p(-0.5, -0.5), p(0.5, -0.5), p(-0.5 + t, 0.5)],
  },
  'quad-up-right': {
    label: 'Figur 1 (4 hörn)',
    param: { label: 'Low side height', min: 0.05, max: 0.95, default: 0.6 },
    outline: (t) => [
      p(-0.5, -0.5),
      p(0.5, -0.5),
      p(0.5, 0.5),
      p(-0.5, -0.5 + t),
    ],
  },
  'quad-up-left': {
    label: 'Figur 2 (4 hörn)',
    param: { label: 'Low side height', min: 0.05, max: 0.95, default: 0.6 },
    outline: (t) => [
      p(-0.5, -0.5),
      p(0.5, -0.5),
      p(0.5, -0.5 + t),
      p(-0.5, 0.5),
    ],
  },
  diamond: {
    label: 'Figur 90 (4 hörn)',
    outline: () => [p(0, -0.5), p(0.5, 0), p(0, 0.5), p(-0.5, 0)],
  },
  house: {
    label: 'Figur 37 (5 hörn)',
    param: { label: 'Eaves height', min: 0.05, max: 0.9, default: 0.65 },
    outline: (t) => [
      p(-0.5, -0.5),
      p(0.5, -0.5),
      p(0.5, -0.5 + t),
      p(0, 0.5),
      p(-0.5, -0.5 + t),
    ],
  },
  'pent-cut-tr': {
    label: 'Figur 4 (5 hörn)',
    param: { label: 'Corner cut', min: 0.1, max: 0.9, default: 0.3 },
    outline: (t) => [
      p(-0.5, -0.5),
      p(0.5, -0.5),
      p(0.5, 0.5 - t),
      p(0.5 - t, 0.5),
      p(-0.5, 0.5),
    ],
  },
  'pent-cut-bl': {
    label: 'Figur 3 (5 hörn)',
    param: { label: 'Corner cut', min: 0.1, max: 0.9, default: 0.3 },
    outline: (t) => [
      p(-0.5 + t, -0.5),
      p(0.5, -0.5),
      p(0.5, 0.5),
      p(-0.5, 0.5),
      p(-0.5, -0.5 + t),
    ],
  },
}

export const windowShapeKeys = Object.keys(windowShapes) as WindowShape[]

/** The outline for a shape at parameter `t`, falling back to the preset default. */
export const shapeOutline = (shape: WindowShape, t: number): Vec2[] => {
  const preset = windowShapes[shape]
  if (!preset.outline) return []
  return preset.outline(t)
}

/** Scale normalised outline vertices to actual outer width/height. */
export const scaleShape = (
  points: Vec2[],
  width: number,
  height: number,
): Vec2[] => points.map((v) => ({ x: v.x * width, y: v.y * height }))
