import type { WindowSpec } from './types'

/**
 * Predefined configurations per model. Each is a plain `WindowSpec`; the real
 * application can grow this catalog freely, and `buildConfig(presets[id])`
 * turns any entry into a renderable flat config. Anything a preset omits falls
 * back to the base config it's built over.
 */
export type ModelId =
  | 'single-casement'
  | 'double-casement'
  | 'fixed-picture'
  | 'georgian-6-light'
  | 'french-door'
  | 'panelled-door'
  | 'triangle-fixed'
  | 'gable-light'
  | 'arched-trapezoid'

export const presets: Record<ModelId, WindowSpec> = {
  'single-casement': {
    kind: 'window',
    grid: { x: 1, y: 1 },
    openings: { '0-0': 'left' },
    sashStop: true,
    rainRail: true,
  },
  'double-casement': {
    kind: 'window',
    grid: { x: 2, y: 1 },
    openings: { '0-0': 'left', '1-0': 'right' },
    meetingStile: true,
    sashStop: true,
    rainRail: true,
  },
  'fixed-picture': {
    kind: 'window',
    grid: { x: 1, y: 1 },
    openings: { '0-0': 'fixed' },
    sashStop: false,
    rainRail: false,
  },
  'georgian-6-light': {
    kind: 'window',
    grid: { x: 1, y: 1 },
    openings: { '0-0': 'fixed' },
    glazing: { x: 1, y: 2, side: 'through' },
    rainRail: true,
  },
  'french-door': {
    kind: 'door',
    size: { width: 1.4, height: 2.1 },
    grid: { x: 2, y: 1 },
    openings: { '0-0': 'left', '1-0': 'right' },
    meetingStile: { width: 0.12 },
    glazing: { x: 1, y: 3 },
    threshold: { height: 0.025 },
  },
  'panelled-door': {
    kind: 'door',
    size: { width: 0.9, height: 2.1 },
    grid: { x: 1, y: 1 },
    openings: { '0-0': 'left' },
    midRail: { height: 0.95, kickPanel: true },
    threshold: { height: 0.02 },
  },
  'triangle-fixed': {
    kind: 'shaped',
    shape: 'tri-iso',
    glazing: { x: 0, y: 0 },
  },
  'gable-light': {
    kind: 'shaped',
    shape: 'house',
    shapeParam: 0.6,
    glazing: { x: 2, y: 1 },
  },
  'arched-trapezoid': {
    kind: 'shaped',
    shape: 'quad-up-right',
    shapeParam: 0.55,
    glazing: { x: 0, y: 0 },
  },
}

export const modelIds = Object.keys(presets) as ModelId[]
