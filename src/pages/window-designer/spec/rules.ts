import { defaultConfig, type WindowConfig } from '../config'
import { windowShapes } from '../shapes'

/** A normalization note: what was adjusted and why. */
export type Issue = string

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v))
const clampInt = (v: number, min: number, max: number) =>
  clamp(Math.round(v), min, max)

/**
 * Bring a flat config into a renderable, internally-consistent state and report
 * what had to change. This is the "validate + normalize" rule layer: ranges are
 * clamped and cross-field invariants (a shaped window can't open, a door needs
 * a threshold) are enforced so `buildConfig` always yields a usable config.
 */
export const normalize = (
  c: WindowConfig,
): { config: WindowConfig; issues: Issue[] } => {
  const issues: Issue[] = []
  let n: WindowConfig = { ...c }

  // Range clamps.
  n.openAngle = clamp(n.openAngle, 0, 60)
  n.shapeParam = clamp(n.shapeParam, 0, 1)
  n.lightsX = clampInt(n.lightsX, 1, 4)
  n.lightsY = clampInt(n.lightsY, 1, 4)
  n.mullionsX = clampInt(n.mullionsX, 0, 6)
  n.mullionsY = clampInt(n.mullionsY, 0, 6)

  if (n.shape === 'rect') {
    // A door must have a positive threshold to read as a door.
    if (n.type === 'door' && n.thresholdHeight <= 0) {
      issues.push('Door threshold height must be positive; reset to default.')
      n.thresholdHeight = defaultConfig.thresholdHeight
    }
  } else {
    // Shaped windows are fixed, single-glazed panes: drop opening machinery.
    const opened = Object.entries(n.lights).filter(([, m]) => m !== 'fixed')
    if (opened.length > 0) {
      issues.push('Shaped windows cannot open; openings reset to fixed.')
      n.lights = {}
    }
    if (n.type === 'door') {
      issues.push('Shaped windows cannot be doors; reset to window.')
      n = { ...n, type: 'window' }
    }
    // Keep the adjustable measurement within the selected shape's bounds.
    const param = windowShapes[n.shape].param
    if (param) {
      const within = clamp(n.shapeParam, param.min, param.max)
      if (within !== n.shapeParam) {
        issues.push(`${param.label} clamped to its valid range.`)
        n.shapeParam = within
      }
    }
  }

  return { config: n, issues }
}
