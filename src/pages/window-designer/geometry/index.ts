import type { WindowConfig } from '../config'
import { buildPolygonGeometry } from './polygon'
import { buildRectGeometry } from './rect'
import type { DerivedGeometry } from './types'

export { lightTransform, type Vec3 } from './transform'
export type { DerivedGeometry, Infill, Keyed, LightGeo } from './types'

/**
 * Derive all renderable geometry for a window. Dispatches between the
 * rectangular pipeline (grid of openable lights, doors, rails) and the
 * free-form polygon pipeline (a single fixed pane).
 */
export const buildGeometry = (c: WindowConfig): DerivedGeometry =>
  c.shape === 'rect' ? buildRectGeometry(c) : buildPolygonGeometry(c)
