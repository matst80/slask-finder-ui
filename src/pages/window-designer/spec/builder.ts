import type { LightMode, SurfaceMaterial, WindowConfig } from '../config'
import { type BuildResult, buildConfig } from './build'
import type {
  CasementSpec,
  ColorProps,
  DoorSpec,
  FrameProps,
  GlassProps,
  GlazingProps,
  MeetingStileProps,
  MidRailProps,
  RainRailProps,
  SashProps,
  SashStopProps,
  ShapedSpec,
  ShapedWindowShape,
  SizeProps,
  ThresholdProps,
  Toggle,
  WindowSpec,
} from './types'

/**
 * Fluent sugar over the spec. Each method mutates an internal `WindowSpec` and
 * returns `this`, so chains read naturally; `.toSpec()` exposes the canonical
 * spec and `.build()` compiles it (optionally over a base config). The strict
 * typing lives in the spec union — these builders just accumulate it.
 */
class BaseBuilder<S extends WindowSpec> {
  protected spec: S
  constructor(spec: S) {
    this.spec = spec
  }
  material(m: SurfaceMaterial): this {
    this.spec = { ...this.spec, material: m }
    return this
  }
  size(p: SizeProps): this {
    this.spec = { ...this.spec, size: { ...this.spec.size, ...p } }
    return this
  }
  frame(p: FrameProps): this {
    this.spec = { ...this.spec, frame: { ...this.spec.frame, ...p } }
    return this
  }
  glass(p: GlassProps): this {
    this.spec = { ...this.spec, glass: { ...this.spec.glass, ...p } }
    return this
  }
  glazing(p: GlazingProps): this {
    this.spec = { ...this.spec, glazing: { ...this.spec.glazing, ...p } }
    return this
  }
  colors(p: ColorProps): this {
    this.spec = { ...this.spec, colors: { ...this.spec.colors, ...p } }
    return this
  }
  toSpec(): S {
    return this.spec
  }
  result(base?: WindowConfig): BuildResult {
    return buildConfig(this.spec, base)
  }
  build(base?: WindowConfig): WindowConfig {
    return buildConfig(this.spec, base).config
  }
}

class OpenableBuilder<
  S extends CasementSpec | DoorSpec,
> extends BaseBuilder<S> {
  grid(x: number, y: number, dividerWidth?: number): this {
    this.spec = { ...this.spec, grid: { x, y, dividerWidth } }
    return this
  }
  open(key: string, mode: LightMode): this {
    this.spec = {
      ...this.spec,
      openings: { ...this.spec.openings, [key]: mode },
    }
    return this
  }
  swing(angle: number, inward = false): this {
    this.spec = { ...this.spec, open: { angle, inward } }
    return this
  }
  sash(p: SashProps): this {
    this.spec = { ...this.spec, sash: { ...this.spec.sash, ...p } }
    return this
  }
  sashStop(v: Toggle<SashStopProps> = true): this {
    this.spec = { ...this.spec, sashStop: v }
    return this
  }
  meetingStile(v: Toggle<MeetingStileProps> = true): this {
    this.spec = { ...this.spec, meetingStile: v }
    return this
  }
  midRail(v: Toggle<MidRailProps> = true): this {
    this.spec = { ...this.spec, midRail: v }
    return this
  }
  rainRail(v: Toggle<RainRailProps> = true): this {
    this.spec = { ...this.spec, rainRail: v }
    return this
  }
}

class CasementBuilder extends OpenableBuilder<CasementSpec> {}

class DoorBuilder extends OpenableBuilder<DoorSpec> {
  threshold(p: ThresholdProps): this {
    this.spec = { ...this.spec, threshold: { ...this.spec.threshold, ...p } }
    return this
  }
}

class ShapedBuilder extends BaseBuilder<ShapedSpec> {
  param(t: number): this {
    this.spec = { ...this.spec, shapeParam: t }
    return this
  }
}

/** Start a rectangular openable window. */
export const window = (): CasementBuilder =>
  new CasementBuilder({ kind: 'window' })

/** Start a rectangular door (openable + threshold). */
export const door = (): DoorBuilder => new DoorBuilder({ kind: 'door' })

/** Start a fixed free-form shape. */
export const shaped = (shape: ShapedWindowShape): ShapedBuilder =>
  new ShapedBuilder({ kind: 'shaped', shape })
