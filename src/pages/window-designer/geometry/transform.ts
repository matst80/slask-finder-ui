import type { LightMode } from '../config'
import type { LightGeo } from './types'

export type Vec3 = [number, number, number]

/**
 * Resolve a light's operation into two nested-group transforms plus a rotation.
 * Hinge modes pivot about the hinge edge at sash mid-depth; slide modes shift
 * the leaf sideways onto a depth-offset track; fixed lights sit in place.
 *
 * The renderer wraps each light in an outer group (carrying `outerPos` +
 * `rotation`, i.e. the operation) and an inner group (`innerPos`) that places
 * the cell-local geometry back at the cell center.
 */
export const lightTransform = (
  light: LightGeo,
  mode: LightMode,
  angleRad: number,
  slideFrac: number,
): { outerPos: Vec3; innerPos: Vec3; rotation: Vec3 } => {
  const hw = light.sashOuterW / 2
  const hh = light.sashOuterH / 2
  const dz = light.midZ // sash mid-depth
  const place = (pivot: Vec3, rotation: Vec3) => ({
    outerPos: [light.cx + pivot[0], light.cy + pivot[1], pivot[2]] as Vec3,
    innerPos: [-pivot[0], -pivot[1], -pivot[2]] as Vec3,
    rotation,
  })
  // Slide a leaf sideways along its own track. Opposing leaves ride tracks
  // offset in depth by a full sash thickness (slide-left in front, slide-right
  // behind), so they pass each other and clear the fixed leaves in the plane
  // between them instead of intersecting. The offset is constant (sliders sit
  // on their tracks even when closed); only the sideways travel scales.
  const slide = (dir: number) => ({
    outerPos: [
      light.cx + dir * slideFrac * light.sashOuterW,
      light.cy,
      dir < 0 ? -dz * 2 : dz * 2,
    ] as Vec3,
    innerPos: [0, 0, 0] as Vec3,
    rotation: [0, 0, 0] as Vec3,
  })
  switch (mode) {
    case 'left':
      return place([-hw, 0, dz], [0, -angleRad, 0])
    case 'right':
      return place([hw, 0, dz], [0, angleRad, 0])
    case 'top':
      return place([0, hh, dz], [-angleRad, 0, 0])
    case 'bottom':
      return place([0, -hh, dz], [angleRad, 0, 0])
    case 'slide-left':
      return slide(-1)
    case 'slide-right':
      return slide(1)
    default:
      return place([0, 0, 0], [0, 0, 0])
  }
}
