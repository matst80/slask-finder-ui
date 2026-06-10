import { defaultConfig, type WindowConfig } from '../config'
import { windowShapes } from '../shapes'
import { type Issue, normalize } from './rules'
import {
  applyColors,
  applyFrame,
  applyGlass,
  applyGlazing,
  applyOpenable,
  applySize,
  applyThreshold,
} from './sections'
import type { ShapedWindowShape, WindowSpec } from './types'

const defaultShapeParam = (
  shape: ShapedWindowShape,
  fallback: number,
): number => windowShapes[shape].param?.default ?? fallback

export type BuildResult = { config: WindowConfig; issues: Issue[] }

/**
 * Compile a `WindowSpec` (the discriminated authoring type) down to a flat,
 * renderable `WindowConfig`. Each supplied section is merged over `base` so
 * everything left unspecified is kept from the base config; the result is then
 * normalised (ranges clamped, kind invariants enforced).
 *
 * Pass an existing config as `base` to tweak one section while preserving the
 * rest — the morphing-document workflow the live designer uses.
 */
export const buildConfig = (
  spec: WindowSpec,
  base: WindowConfig = defaultConfig,
): BuildResult => {
  let c: WindowConfig = { ...base }

  // Common sections.
  if (spec.material) c = { ...c, material: spec.material }
  if (spec.size) c = applySize(c, spec.size)
  if (spec.frame) c = applyFrame(c, spec.frame)
  if (spec.glass) c = applyGlass(c, spec.glass)
  if (spec.glazing) c = applyGlazing(c, spec.glazing)
  if (spec.colors) c = applyColors(c, spec.colors)

  // Per-kind sections.
  switch (spec.kind) {
    case 'window':
      c = { ...c, type: 'window', shape: 'rect' }
      c = applyOpenable(c, spec)
      break
    case 'door':
      c = { ...c, type: 'door', shape: 'rect' }
      c = applyOpenable(c, spec)
      if (spec.threshold) c = applyThreshold(c, spec.threshold)
      break
    case 'shaped':
      c = { ...c, type: 'window', shape: spec.shape }
      if (spec.shapeParam !== undefined) {
        c = { ...c, shapeParam: spec.shapeParam }
      } else {
        // Adopt the shape's default measurement when none is given.
        c = { ...c, shapeParam: defaultShapeParam(spec.shape, c.shapeParam) }
      }
      break
  }

  return normalize(c)
}

/** Convenience: just the config (issues discarded). */
export const toConfig = (spec: WindowSpec, base?: WindowConfig): WindowConfig =>
  buildConfig(spec, base).config

/** Convenience: just the validation/normalization issues for a spec. */
export const validate = (spec: WindowSpec, base?: WindowConfig): Issue[] =>
  buildConfig(spec, base).issues
