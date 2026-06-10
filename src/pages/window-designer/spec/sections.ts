import type { WindowConfig } from '../config'
import type {
  ColorProps,
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
  SizeProps,
  ThresholdProps,
  Toggle,
} from './types'

/**
 * Each section applier takes the current flat config and a partial property
 * bag, and returns a new config with only the supplied fields overwritten.
 * `??` everywhere is what gives the "keep the base config when changing one
 * part" behaviour: an omitted field falls through to its current value.
 */

export const applySize = (c: WindowConfig, p: SizeProps): WindowConfig => ({
  ...c,
  outerWidth: p.width ?? c.outerWidth,
  outerHeight: p.height ?? c.outerHeight,
})

export const applyFrame = (c: WindowConfig, p: FrameProps): WindowConfig => ({
  ...c,
  frameStyle: p.style ?? c.frameStyle,
  frameWidth: p.width ?? c.frameWidth,
  frameDepth: p.depth ?? c.frameDepth,
  frameRebateWidth: p.rebateWidth ?? c.frameRebateWidth,
  frameRebateDepth: p.rebateDepth ?? c.frameRebateDepth,
  frameChamfer: p.chamfer ?? c.frameChamfer,
})

export const applySash = (c: WindowConfig, p: SashProps): WindowConfig => ({
  ...c,
  sashStyle: p.style ?? c.sashStyle,
  sashGap: p.gap ?? c.sashGap,
  sashWidth: p.width ?? c.sashWidth,
  sashDepth: p.depth ?? c.sashDepth,
  sashRebateWidth: p.rebateWidth ?? c.sashRebateWidth,
  sashRebateDepth: p.rebateDepth ?? c.sashRebateDepth,
  sashChamfer: p.chamfer ?? c.sashChamfer,
})

export const applyGlazing = (
  c: WindowConfig,
  p: GlazingProps,
): WindowConfig => ({
  ...c,
  mullionsX: p.x ?? c.mullionsX,
  mullionsY: p.y ?? c.mullionsY,
  mullionWidth: p.width ?? c.mullionWidth,
  mullionDepth: p.depth ?? c.mullionDepth,
  mullionChamfer: p.chamfer ?? c.mullionChamfer,
  mullionSide: p.side ?? c.mullionSide,
})

export const applyGlass = (c: WindowConfig, p: GlassProps): WindowConfig => ({
  ...c,
  glassThickness: p.thickness ?? c.glassThickness,
  glassInset: p.inset ?? c.glassInset,
})

export const applyColors = (c: WindowConfig, p: ColorProps): WindowConfig => ({
  ...c,
  frameColor: p.frame ?? c.frameColor,
  sashColor: p.sash ?? c.sashColor,
  glassColor: p.glass ?? c.glassColor,
  rainColor: p.rain ?? c.rainColor,
  panelColor: p.panel ?? c.panelColor,
})

export const applyGrid = (c: WindowConfig, p: GridProps): WindowConfig => ({
  ...c,
  lightsX: p.x ?? c.lightsX,
  lightsY: p.y ?? c.lightsY,
  structWidth: p.dividerWidth ?? c.structWidth,
})

export const applyOpen = (c: WindowConfig, p: OpenProps): WindowConfig => ({
  ...c,
  openAngle: p.angle ?? c.openAngle,
  openInward: p.inward ?? c.openInward,
})

export const applySashStop = (
  c: WindowConfig,
  v: Toggle<SashStopProps>,
): WindowConfig => {
  if (typeof v === 'boolean') return { ...c, sashStop: v }
  return {
    ...c,
    sashStop: true,
    stopWidth: v.width ?? c.stopWidth,
    stopDepth: v.depth ?? c.stopDepth,
    stopChamfer: v.chamfer ?? c.stopChamfer,
    stopStyle: v.style ?? c.stopStyle,
  }
}

export const applyMeetingStile = (
  c: WindowConfig,
  v: Toggle<MeetingStileProps>,
): WindowConfig => {
  if (typeof v === 'boolean') return { ...c, meetingStile: v }
  return {
    ...c,
    meetingStile: true,
    meetingStileWidth: v.width ?? c.meetingStileWidth,
  }
}

export const applyMidRail = (
  c: WindowConfig,
  v: Toggle<MidRailProps>,
): WindowConfig => {
  if (typeof v === 'boolean') return { ...c, midRail: v }
  return {
    ...c,
    midRail: true,
    midRailHeight: v.height ?? c.midRailHeight,
    midRailWidth: v.thickness ?? c.midRailWidth,
    kickPanel: v.kickPanel ?? c.kickPanel,
  }
}

export const applyRainRail = (
  c: WindowConfig,
  v: Toggle<RainRailProps>,
): WindowConfig => {
  if (typeof v === 'boolean') return { ...c, rainRail: v }
  return {
    ...c,
    rainRail: true,
    rainProjection: v.projection ?? c.rainProjection,
    rainHeight: v.height ?? c.rainHeight,
    rainLip: v.lip ?? c.rainLip,
    rainThickness: v.thickness ?? c.rainThickness,
  }
}

export const applyThreshold = (
  c: WindowConfig,
  p: ThresholdProps,
): WindowConfig => ({
  ...c,
  thresholdHeight: p.height ?? c.thresholdHeight,
  thresholdDepth: p.depth ?? c.thresholdDepth,
  thresholdChamfer: p.chamfer ?? c.thresholdChamfer,
})

/** Apply every openable section present on a casement/door spec, in order. */
export const applyOpenable = (
  c: WindowConfig,
  s: OpenableSpec,
): WindowConfig => {
  let next = c
  if (s.grid) next = applyGrid(next, s.grid)
  if (s.openings) next = { ...next, lights: { ...next.lights, ...s.openings } }
  if (s.open) next = applyOpen(next, s.open)
  if (s.sash) next = applySash(next, s.sash)
  if (s.sashStop !== undefined) next = applySashStop(next, s.sashStop)
  if (s.meetingStile !== undefined) {
    next = applyMeetingStile(next, s.meetingStile)
  }
  if (s.midRail !== undefined) next = applyMidRail(next, s.midRail)
  if (s.rainRail !== undefined) next = applyRainRail(next, s.rainRail)
  return next
}
