import * as THREE from 'three'
import type { WindowConfig } from '../config'
import {
  buildPolygonFrame,
  offsetPolygon,
  profileWidth,
} from '../frameGeometry'
import { buildProfile } from '../profiles'
import { scaleShape, shapeOutline } from '../shapes'
import type { DerivedGeometry } from './types'

/**
 * Build a free-form (non-rectangular) fixed window: the frame profile swept
 * around the preset polygon, with a single glass pane filling the inset
 * interior. None of the rectangular machinery (lights, openings, dividers,
 * doors, rails) applies, so those collections come back empty.
 */
export const buildPolygonGeometry = (c: WindowConfig): DerivedGeometry => {
  const points = scaleShape(
    shapeOutline(c.shape, c.shapeParam),
    c.outerWidth,
    c.outerHeight,
  )

  const frameProfile = buildProfile(c.frameStyle, {
    width: c.frameWidth,
    depth: c.frameDepth,
    rebateWidth: c.frameRebateWidth,
    rebateDepth: c.frameRebateDepth,
    chamfer: c.frameChamfer,
  })
  const frame = buildPolygonFrame(points, frameProfile, 0)

  // Glass fills the polygon inset by the frame reach, tucked a little under the
  // rebate lip (mirrors the rectangular glass). Extruded through the glass
  // thickness, centred in the frame depth.
  const fw = profileWidth(frameProfile)
  const inset = Math.max(0.001, fw - c.frameRebateWidth - c.glassInset)
  const glassOutline = offsetPolygon(points, inset)
  const shape2d = new THREE.Shape(
    glassOutline.map((v) => new THREE.Vector2(v.x, v.y)),
  )
  const polyGlass = new THREE.ExtrudeGeometry(shape2d, {
    depth: c.glassThickness,
    bevelEnabled: false,
  })
  polyGlass.translate(0, 0, c.frameDepth / 2 - c.glassThickness / 2)

  return {
    frame,
    structures: [],
    stops: [],
    lights: [],
    rail: null,
    polyGlass,
    centerZ: c.frameDepth / 2,
  }
}
