import * as THREE from 'three'
import type { WindowConfig } from '../config'
import {
  buildBarGeometry,
  buildPolygonFrame,
  offsetPolygon,
  profileWidth,
  type Vec2,
} from '../frameGeometry'
import { buildMullionProfile, buildProfile } from '../profiles'
import { scaleShape, shapeOutline } from '../shapes'
import type { DerivedGeometry, Keyed } from './types'

/**
 * The span of a convex polygon along one axis at a given coordinate: the two
 * crossings of the scan line with the boundary, as `[lo, hi]` on the other
 * axis, or null if the line misses the polygon. Used to trim glazing bars to
 * the glass outline.
 */
const polygonSpan = (
  poly: Vec2[],
  value: number,
  axis: 'x' | 'y',
): [number, number] | null => {
  const hits: number[] = []
  const n = poly.length
  for (let i = 0; i < n; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % n]
    const av = axis === 'x' ? a.x : a.y
    const bv = axis === 'x' ? b.x : b.y
    if (av === bv) continue // edge parallel to the scan line
    if ((av <= value && bv >= value) || (bv <= value && av >= value)) {
      const t = (value - av) / (bv - av)
      hits.push(axis === 'x' ? a.y + t * (b.y - a.y) : a.x + t * (b.x - a.x))
    }
  }
  if (hits.length < 2) return null
  return [Math.min(...hits), Math.max(...hits)]
}

/**
 * Build a free-form (non-rectangular) fixed window: the frame profile swept
 * around the preset polygon, a single glass pane filling the inset interior,
 * and an optional glazing-bar grid trimmed to the glass outline. None of the
 * other rectangular machinery (openable lights, dividers, doors, rails)
 * applies, so those collections come back empty.
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

  // --- Glazing bars: a grid laid across the glass outline, each bar trimmed to
  // the polygon's chord at its position (valid for the convex presets). ---
  const polyBars: Keyed[] = []
  if (c.mullionsX > 0 || c.mullionsY > 0) {
    const barDepth =
      c.mullionSide === 'through'
        ? c.frameDepth
        : Math.min(c.mullionDepth, c.frameDepth)
    const barZ = c.mullionSide === 'back' ? c.frameDepth - barDepth : 0
    const mullion = buildMullionProfile(
      c.mullionWidth,
      barDepth,
      c.mullionChamfer,
    )

    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (const v of glassOutline) {
      minX = Math.min(minX, v.x)
      maxX = Math.max(maxX, v.x)
      minY = Math.min(minY, v.y)
      maxY = Math.max(maxY, v.y)
    }

    for (let k = 1; k <= c.mullionsX; k++) {
      const x = minX + ((maxX - minX) * k) / (c.mullionsX + 1)
      const span = polygonSpan(glassOutline, x, 'x')
      if (!span || span[1] - span[0] <= 0.001) continue
      const geometry = buildBarGeometry(mullion, span[1] - span[0], 'y', barZ)
      geometry.translate(x, (span[0] + span[1]) / 2, 0)
      polyBars.push({ geometry, key: `pbarv-${k}` })
    }
    for (let k = 1; k <= c.mullionsY; k++) {
      const y = minY + ((maxY - minY) * k) / (c.mullionsY + 1)
      const span = polygonSpan(glassOutline, y, 'y')
      if (!span || span[1] - span[0] <= 0.001) continue
      const geometry = buildBarGeometry(mullion, span[1] - span[0], 'x', barZ)
      geometry.translate((span[0] + span[1]) / 2, y, 0)
      polyBars.push({ geometry, key: `pbarh-${k}` })
    }
  }

  return {
    frame,
    structures: [],
    stops: [],
    lights: [],
    rail: null,
    polyGlass,
    polyBars,
    centerZ: c.frameDepth / 2,
  }
}
