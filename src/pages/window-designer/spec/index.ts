/**
 * The window authoring layer: a discriminated-union `WindowSpec` plus a section
 * builder and rule set that compile down to the flat `WindowConfig` the
 * renderer consumes — without changing that contract.
 *
 *   buildConfig(spec, base?) -> { config, issues }     // declarative
 *   window().frame({...}).grid(2,1).open('0-0','left').build()   // fluent sugar
 *   buildConfig(presets['french-door'])                // per-model presets
 */
export { type BuildResult, buildConfig, toConfig, validate } from './build'
export { door, shaped, window } from './builder'
export { type ModelId, modelIds, presets } from './presets'
export { type Issue, normalize } from './rules'
export type {
  CasementSpec,
  ColorProps,
  CommonSpec,
  DoorSpec,
  FrameProps,
  GlassProps,
  GlazingProps,
  GridProps,
  MeetingStileProps,
  MidRailProps,
  OpenableSpec,
  OpenProps,
  RainRailProps,
  SashProps,
  SashStopProps,
  ShapedSpec,
  ShapedWindowShape,
  SizeProps,
  ThresholdProps,
  Toggle,
  WindowKind,
  WindowSpec,
} from './types'
