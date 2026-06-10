import * as THREE from 'three'
import type { WindowConfig } from '../config'
import {
  buildBarGeometry,
  buildDoorFrameGeometry,
  buildFrame,
  buildFrameGeometry,
} from '../frameGeometry'
import {
  buildMullionProfile,
  buildProfile,
  buildRainRailProfile,
  buildThresholdProfile,
} from '../profiles'
import type { DerivedGeometry, Infill, Keyed, LightGeo } from './types'

/**
 * Build the rectangular window/door pipeline: outer frame (mitred window or
 * threshold door), a grid of lights with per-light sashes, glazing bars, glass
 * or kick panels, an optional mid rail and a bottom rain rail.
 */
export const buildRectGeometry = (c: WindowConfig): DerivedGeometry => {
  const isDoor = c.type === 'door'

  // --- Outer frame (head + jambs share the frame profile) ---
  const frameProfile = buildProfile(c.frameStyle, {
    width: c.frameWidth,
    depth: c.frameDepth,
    rebateWidth: c.frameRebateWidth,
    rebateDepth: c.frameRebateDepth,
    chamfer: c.frameChamfer,
  })
  // A door swaps the bottom member for a low threshold; a window mitres all
  // four corners of the single frame profile.
  const bottomWidth = isDoor ? c.thresholdHeight : c.frameWidth
  const frame = isDoor
    ? buildDoorFrameGeometry(
        frameProfile,
        buildThresholdProfile(
          c.thresholdHeight,
          c.thresholdDepth,
          c.thresholdChamfer,
        ),
        c.outerWidth,
        c.outerHeight,
        0,
      )
    : buildFrameGeometry(frameProfile, c.outerWidth, c.outerHeight, 0)

  // Frame opening. The bottom member may be shorter (door threshold), so the
  // opening is taller and its center shifts down.
  const openingW = c.outerWidth - 2 * c.frameWidth
  const openingH = c.outerHeight - c.frameWidth - bottomWidth
  const openY = (bottomWidth - c.frameWidth) / 2

  // Sit everything forward in the frame (fronts flush at depth 0).
  const sashZ = 0

  // --- Subdivide the opening into a grid of lights ---
  const cols = Math.max(1, Math.round(c.lightsX))
  const rows = Math.max(1, Math.round(c.lightsY))
  const structW = c.structWidth
  const cellW = (openingW - (cols - 1) * structW) / cols
  const cellH = (openingH - (rows - 1) * structW) / rows
  // Center of column i / row j, accounting for the opening's vertical shift.
  const colCenter = (i: number) =>
    -openingW / 2 + i * (cellW + structW) + cellW / 2
  const rowCenter = (j: number) =>
    openY - openingH / 2 + j * (cellH + structW) + cellH / 2

  // --- Structural dividers (full-depth members, reuse the symmetric bar) ---
  const structProfile = buildMullionProfile(
    structW,
    c.frameDepth,
    c.frameChamfer,
  )
  const isSliding = (col: number, row: number) => {
    const mode = c.lights[`${col}-${row}`]
    return mode === 'slide-left' || mode === 'slide-right'
  }
  const structures: Keyed[] = []
  for (let i = 1; i < cols; i++) {
    // A sliding leaf passes its neighbour in depth, so there is no fixed
    // mullion between it and the column it overlaps; drop the divider if either
    // side slides in any row.
    let slides = false
    for (let j = 0; j < rows; j++) {
      if (isSliding(i - 1, j) || isSliding(i, j)) {
        slides = true
        break
      }
    }
    if (slides) continue
    const x = -openingW / 2 + i * (cellW + structW) - structW / 2
    const geometry = buildBarGeometry(structProfile, openingH, 'y', 0)
    geometry.translate(x, openY, 0)
    structures.push({ geometry, key: `mv-${i}` })
  }
  for (let j = 1; j < rows; j++) {
    const y = openY - openingH / 2 + j * (cellH + structW) - structW / 2
    const geometry = buildBarGeometry(structProfile, openingW, 'x', 0)
    geometry.translate(0, y, 0)
    structures.push({ geometry, key: `mh-${j}` })
  }

  // --- Per-light sash, glazing bars and glass ---
  const sashProfile = buildProfile(c.sashStyle, {
    width: c.sashWidth,
    depth: c.sashDepth,
    rebateWidth: c.sashRebateWidth,
    rebateDepth: c.sashRebateDepth,
    chamfer: c.sashChamfer,
  })
  // Wider meeting stile (same shape, wider) used on interior vertical edges
  // where two leaves abut, e.g. a double door.
  const meetingStileProfile = buildProfile(c.sashStyle, {
    width: c.meetingStileWidth,
    depth: c.sashDepth,
    rebateWidth: c.sashRebateWidth,
    rebateDepth: c.sashRebateDepth,
    chamfer: c.sashChamfer,
  })
  // A through-bar spans the full sash depth; a one-sided bar is applied to the
  // front or back face of the glass only.
  const barDepth =
    c.mullionSide === 'through'
      ? c.sashDepth
      : Math.min(c.mullionDepth, c.sashDepth)
  const barZ = c.mullionSide === 'back' ? sashZ + c.sashDepth - barDepth : sashZ
  const mullionProfile = buildMullionProfile(
    c.mullionWidth,
    barDepth,
    c.mullionChamfer,
  )

  // Fixed sash-stop ledge swept around each cell, set back in depth so the
  // sash closes against it; revealed when the light is opened.
  const stopProfile = buildProfile(c.stopStyle, {
    width: c.stopWidth,
    depth: c.stopDepth,
    rebateWidth: 0,
    rebateDepth: 0,
    chamfer: c.stopChamfer,
  })
  // Seat the stop against the face the sash closes onto, with a small overlap
  // to keep them in contact. An outward-swinging leaf rests against a stop
  // behind it (+Z); an inward-swinging leaf rests against a stop on its front
  // face (toward the camera), so the stop mirrors to the front when openInward.
  const stopOverlap = Math.min(c.stopDepth * 0.4, c.sashDepth * 0.5)
  const stopZ = c.openInward
    ? Math.max(sashZ - c.stopDepth + stopOverlap, 0)
    : Math.min(sashZ + c.sashDepth - stopOverlap, c.frameDepth - c.stopDepth)
  // Run the stop to the cell edge and a touch beyond, so it merges into the
  // surrounding frame / dividers instead of floating at the sash edge.
  const stopEmbed = 0.003

  const stops: Keyed[] = []
  const lights: LightGeo[] = []

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const cx = colCenter(i)
      const cy = rowCenter(j)
      const id = `${i}-${j}`

      const sashOuterW = cellW - 2 * c.sashGap
      const sashOuterH = cellH - 2 * c.sashGap

      // Stop runs to the cell opening (merging into the frame) and protrudes
      // inward; the sash closes against it and it sits just behind the sash.
      if (c.sashStop) {
        const stopGeo = buildFrameGeometry(
          stopProfile,
          cellW + 2 * stopEmbed,
          cellH + 2 * stopEmbed,
          stopZ,
        )
        stopGeo.translate(cx, cy, 0)
        stops.push({ geometry: stopGeo, key: `stop-${id}` })
      }
      // A meeting stile goes on an interior vertical edge (where leaves abut).
      // Its corners butt (stile runs through), so the leaf becomes stile-and-
      // rail there; plain edges stay mitered like a window sash.
      const hasLeftStile = c.meetingStile && i > 0
      const hasRightStile = c.meetingStile && i < cols - 1
      const leftW = hasLeftStile ? c.meetingStileWidth : c.sashWidth
      const rightW = hasRightStile ? c.meetingStileWidth : c.sashWidth

      // Built centered on the cell origin (not translated to cx/cy) so the
      // renderer can swing the whole light about its hinge edge.
      const sash = buildFrame(
        {
          top: sashProfile,
          bottom: sashProfile,
          left: hasLeftStile ? meetingStileProfile : sashProfile,
          right: hasRightStile ? meetingStileProfile : sashProfile,
        },
        {
          tl: hasLeftStile ? 'butt' : 'miter',
          bl: hasLeftStile ? 'butt' : 'miter',
          tr: hasRightStile ? 'butt' : 'miter',
          br: hasRightStile ? 'butt' : 'miter',
        },
        sashOuterW,
        sashOuterH,
        sashZ,
      )

      // A wider stile on one side shrinks the opening and shifts it sideways.
      const sashOpenW = sashOuterW - leftW - rightW
      const sashOpenH = sashOuterH - 2 * c.sashWidth
      const openXC = (leftW - rightW) / 2
      const midZ = sashZ + c.sashDepth / 2

      // A mid rail (and/or kick panel) splits the opening into stacked regions.
      // Each region is glass or a solid panel; glazing bars only grid the glass.
      type Region = { kind: Infill['kind']; y: number; h: number; tag: string }
      const regions: Region[] = []
      if (c.midRail || c.kickPanel) {
        const railHalf = c.midRail ? c.midRailWidth / 2 : 0
        const yRail = Math.min(
          Math.max(-sashOpenH / 2 + c.midRailHeight, -sashOpenH / 2 + railHalf),
          sashOpenH / 2 - railHalf,
        )
        const lowTop = yRail - railHalf
        const highBot = yRail + railHalf
        regions.push({
          kind: c.kickPanel ? 'panel' : 'glass',
          y: (-sashOpenH / 2 + lowTop) / 2,
          h: lowTop + sashOpenH / 2,
          tag: 'low',
        })
        regions.push({
          kind: 'glass',
          y: (highBot + sashOpenH / 2) / 2,
          h: sashOpenH / 2 - highBot,
          tag: 'high',
        })
      } else {
        regions.push({ kind: 'glass', y: 0, h: sashOpenH, tag: 'full' })
      }

      const bars: Keyed[] = []
      const infillW = Math.max(
        0.001,
        sashOpenW + 2 * c.sashRebateWidth - 2 * c.glassInset,
      )
      const infills: Infill[] = regions.map((r) => ({
        kind: r.kind,
        width: infillW,
        height: Math.max(0.001, r.h + 2 * c.sashRebateWidth - 2 * c.glassInset),
        x: openXC,
        y: r.y,
        z: midZ,
        thickness: r.kind === 'panel' ? c.sashDepth * 0.6 : c.glassThickness,
        key: `infill-${id}-${r.tag}`,
      }))

      // Glazing bars grid each glass region only (never the kick panel).
      for (const r of regions) {
        if (r.kind !== 'glass') continue
        for (let k = 1; k <= c.mullionsX; k++) {
          const xOff = -sashOpenW / 2 + (sashOpenW * k) / (c.mullionsX + 1)
          const geometry = buildBarGeometry(mullionProfile, r.h, 'y', barZ)
          geometry.translate(openXC + xOff, r.y, 0)
          bars.push({ geometry, key: `barv-${id}-${r.tag}-${k}` })
        }
        for (let k = 1; k <= c.mullionsY; k++) {
          const yOff = r.y - r.h / 2 + (r.h * k) / (c.mullionsY + 1)
          const geometry = buildBarGeometry(
            mullionProfile,
            sashOpenW,
            'x',
            barZ,
          )
          geometry.translate(openXC, yOff, 0)
          bars.push({ geometry, key: `barh-${id}-${r.tag}-${k}` })
        }
      }

      // The mid rail bar itself sits at the split line, with an optional drip
      // rail mounted on top of it (shares the rain-rail toggle).
      let railBar: THREE.BufferGeometry | null = null
      if (c.midRail) {
        const railHalf = c.midRailWidth / 2
        const yRail = Math.min(
          Math.max(-sashOpenH / 2 + c.midRailHeight, -sashOpenH / 2 + railHalf),
          sashOpenH / 2 - railHalf,
        )
        const geometry = buildBarGeometry(
          buildMullionProfile(c.midRailWidth, c.sashDepth, c.mullionChamfer),
          sashOpenW,
          'x',
          sashZ,
        )
        geometry.translate(openXC, yRail, 0)
        bars.push({ geometry, key: `midrail-${id}` })

        if (c.rainRail) {
          railBar = buildBarGeometry(
            buildRainRailProfile({
              projection: c.rainProjection,
              height: c.rainHeight,
              lip: c.rainLip,
              thickness: c.rainThickness,
            }),
            sashOpenW,
            'x',
            sashZ,
          )
          // Mount on the top edge of the mid rail.
          railBar.translate(openXC, yRail + railHalf, 0)
        }
      }

      lights.push({
        key: id,
        cx,
        cy,
        sashOuterW,
        sashOuterH,
        midZ,
        sash,
        bars,
        infills,
        railBar,
      })
    }
  }

  // --- Bottom aluminium rain rail (drip / water bar) ---
  // Extruded across the whole opening, mounted at the bottom edge, projecting
  // out past the front face (along -Z) and sloping down to a lip.
  let rail: THREE.BufferGeometry | null = null
  if (c.rainRail) {
    const railProfile = buildRainRailProfile({
      projection: c.rainProjection,
      height: c.rainHeight,
      lip: c.rainLip,
      thickness: c.rainThickness,
    })
    rail = buildBarGeometry(railProfile, openingW, 'x', sashZ)
    rail.translate(0, openY - openingH / 2, 0)
  }

  return {
    frame,
    structures,
    stops,
    lights,
    rail,
    polyGlass: null,
    centerZ: c.frameDepth / 2,
  }
}
