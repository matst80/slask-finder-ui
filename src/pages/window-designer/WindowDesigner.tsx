import { ContactShadows, Environment, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import {
  defaultConfig,
  type LightMode,
  lightModes,
  type MullionSide,
  mullionSides,
  type SurfaceMaterial,
  surfaceMaterials,
  type WindowConfig,
  type WindowType,
  windowTypes,
} from './config'
import { type ProfileStyle, profileStyles } from './profiles'
import { type WindowShape, windowShapeKeys, windowShapes } from './shapes'
import { WindowModel } from './WindowModel'

type NumericKey = {
  [K in keyof WindowConfig]: WindowConfig[K] extends number ? K : never
}[keyof WindowConfig]

type SliderDef = {
  key: NumericKey
  label: string
  min: number
  max: number
  step: number
}

type StyleKey = 'frameStyle' | 'sashStyle' | 'stopStyle'
type ColorKey =
  | 'frameColor'
  | 'sashColor'
  | 'glassColor'
  | 'rainColor'
  | 'panelColor'
type ToggleKey = 'rainRail' | 'sashStop' | 'meetingStile'

const sectionToggles: Record<string, ToggleKey | undefined> = {
  'Meeting stile': 'meetingStile',
  'Sash stop': 'sashStop',
  'Bottom rain rail': 'rainRail',
}

/** Sections that still apply to a fixed, free-form polygon window. */
const polygonSections = new Set([
  'Window',
  'Outer frame profile',
  'Glazing bars',
  'Glass',
])

/** Outline used to preview the rectangular shape in the gallery. */
const rectOutline = [
  { x: -0.5, y: -0.5 },
  { x: 0.5, y: -0.5 },
  { x: 0.5, y: 0.5 },
  { x: -0.5, y: 0.5 },
]

/** Map normalised outline vertices to an SVG polygon points string. */
const shapePreviewPoints = (pts: { x: number; y: number }[]): string =>
  pts.map((v) => `${(v.x + 0.5) * 88 + 6},${(0.5 - v.y) * 88 + 6}`).join(' ')

const lightModeLabels: Record<LightMode, string> = {
  fixed: 'Fixed',
  left: 'Hinge left',
  right: 'Hinge right',
  top: 'Top (over)',
  bottom: 'Bottom (under)',
  'slide-left': 'Slide left',
  'slide-right': 'Slide right',
}

const sections: { title: string; sliders: SliderDef[] }[] = [
  {
    title: 'Window',
    sliders: [
      { key: 'outerWidth', label: 'Width', min: 0.4, max: 3, step: 0.01 },
      { key: 'outerHeight', label: 'Height', min: 0.4, max: 2.5, step: 0.01 },
    ],
  },
  {
    title: 'Door threshold',
    sliders: [
      {
        key: 'thresholdHeight',
        label: 'Height',
        min: 0.01,
        max: 0.08,
        step: 0.001,
      },
      {
        key: 'thresholdDepth',
        label: 'Depth',
        min: 0.02,
        max: 0.12,
        step: 0.001,
      },
      {
        key: 'thresholdChamfer',
        label: 'Chamfer',
        min: 0,
        max: 0.03,
        step: 0.001,
      },
    ],
  },
  {
    title: 'Lights',
    sliders: [
      { key: 'lightsX', label: 'Lights across', min: 1, max: 4, step: 1 },
      { key: 'lightsY', label: 'Lights down', min: 1, max: 4, step: 1 },
      {
        key: 'structWidth',
        label: 'Divider width',
        min: 0.02,
        max: 0.12,
        step: 0.001,
      },
      { key: 'openAngle', label: 'Open angle', min: 0, max: 60, step: 1 },
    ],
  },
  {
    title: 'Outer frame profile',
    sliders: [
      { key: 'frameWidth', label: 'Width', min: 0.02, max: 0.15, step: 0.001 },
      { key: 'frameDepth', label: 'Depth', min: 0.02, max: 0.15, step: 0.001 },
      {
        key: 'frameRebateWidth',
        label: 'Rebate width',
        min: 0,
        max: 0.06,
        step: 0.001,
      },
      {
        key: 'frameRebateDepth',
        label: 'Rebate depth',
        min: 0,
        max: 0.1,
        step: 0.001,
      },
      { key: 'frameChamfer', label: 'Chamfer', min: 0, max: 0.03, step: 0.001 },
    ],
  },
  {
    title: 'Inner frame (sash) profile',
    sliders: [
      { key: 'sashGap', label: 'Reveal gap', min: 0, max: 0.03, step: 0.001 },
      { key: 'sashWidth', label: 'Width', min: 0.02, max: 0.12, step: 0.001 },
      { key: 'sashDepth', label: 'Depth', min: 0.02, max: 0.12, step: 0.001 },
      {
        key: 'sashRebateWidth',
        label: 'Rebate width',
        min: 0,
        max: 0.05,
        step: 0.001,
      },
      {
        key: 'sashRebateDepth',
        label: 'Rebate depth',
        min: 0,
        max: 0.08,
        step: 0.001,
      },
      { key: 'sashChamfer', label: 'Chamfer', min: 0, max: 0.03, step: 0.001 },
    ],
  },
  {
    title: 'Glazing bars',
    sliders: [
      { key: 'mullionsX', label: 'Vertical bars', min: 0, max: 5, step: 1 },
      { key: 'mullionsY', label: 'Horizontal bars', min: 0, max: 5, step: 1 },
      {
        key: 'mullionWidth',
        label: 'Bar width',
        min: 0.01,
        max: 0.05,
        step: 0.001,
      },
      {
        key: 'mullionDepth',
        label: 'Bar depth (1-sided)',
        min: 0.005,
        max: 0.05,
        step: 0.001,
      },
      {
        key: 'mullionChamfer',
        label: 'Bar bevel',
        min: 0,
        max: 0.02,
        step: 0.001,
      },
    ],
  },
  {
    title: 'Glass',
    sliders: [
      {
        key: 'glassThickness',
        label: 'Glass thickness',
        min: 0.004,
        max: 0.05,
        step: 0.001,
      },
      {
        key: 'glassInset',
        label: 'Glass inset',
        min: 0,
        max: 0.02,
        step: 0.001,
      },
    ],
  },
  {
    title: 'Meeting stile',
    sliders: [
      {
        key: 'meetingStileWidth',
        label: 'Stile width',
        min: 0.04,
        max: 0.2,
        step: 0.001,
      },
    ],
  },
  {
    title: 'Mid rail & panel',
    sliders: [
      {
        key: 'midRailHeight',
        label: 'Rail / panel height',
        min: 0.1,
        max: 2,
        step: 0.01,
      },
      {
        key: 'midRailWidth',
        label: 'Rail thickness',
        min: 0.03,
        max: 0.2,
        step: 0.001,
      },
    ],
  },
  {
    title: 'Sash stop',
    sliders: [
      { key: 'stopWidth', label: 'Width', min: 0.005, max: 0.05, step: 0.001 },
      { key: 'stopDepth', label: 'Depth', min: 0.005, max: 0.06, step: 0.001 },
      { key: 'stopChamfer', label: 'Chamfer', min: 0, max: 0.02, step: 0.001 },
    ],
  },
  {
    title: 'Bottom rain rail',
    sliders: [
      {
        key: 'rainProjection',
        label: 'Projection',
        min: 0.01,
        max: 0.1,
        step: 0.001,
      },
      { key: 'rainHeight', label: 'Drop', min: 0.01, max: 0.1, step: 0.001 },
      { key: 'rainLip', label: 'Drip lip', min: 0, max: 0.05, step: 0.001 },
      {
        key: 'rainThickness',
        label: 'Thickness',
        min: 0.003,
        max: 0.03,
        step: 0.001,
      },
    ],
  },
]

const Slider = ({
  def,
  value,
  onChange,
}: {
  def: SliderDef
  value: number
  onChange: (v: number) => void
}) => (
  <label className="flex flex-col gap-1 text-xs text-gray-600">
    <span className="flex items-center justify-between">
      <span>{def.label}</span>
      <span className="font-mono text-gray-400">
        {def.step >= 1 ? value : (value * 1000).toFixed(0) + ' mm'}
      </span>
    </span>
    <input
      type="range"
      min={def.min}
      max={def.max}
      step={def.step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="accent-blue-600"
    />
  </label>
)

const ShapeGallery = ({
  value,
  onChange,
}: {
  value: WindowShape
  onChange: (v: WindowShape) => void
}) => (
  <div className="mb-5">
    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
      Shape
    </h2>
    <div className="grid grid-cols-4 gap-2">
      {windowShapeKeys.map((key) => {
        const preset = windowShapes[key]
        const pts = preset.outline
          ? preset.outline(preset.param?.default ?? 0.5)
          : rectOutline
        const active = value === key
        return (
          <button
            key={key}
            type="button"
            title={preset.label}
            onClick={() => onChange(key)}
            className={`flex aspect-square items-center justify-center rounded-md border p-1.5 ${
              active
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
              <polygon
                points={shapePreviewPoints(pts)}
                className={active ? 'fill-blue-200' : 'fill-gray-200'}
                stroke="#9ca3af"
                strokeWidth={7}
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )
      })}
    </div>
  </div>
)

export const WindowDesigner = () => {
  const [config, setConfig] = useState<WindowConfig>(defaultConfig)
  const isPolygon = config.shape !== 'rect'

  const set = (key: NumericKey, value: number) =>
    setConfig((c) => ({ ...c, [key]: value }))
  const setStyle = (key: StyleKey, value: ProfileStyle) =>
    setConfig((c) => ({ ...c, [key]: value }))
  const setColor = (key: ColorKey, value: string) =>
    setConfig((c) => ({ ...c, [key]: value }))
  const setLight = (key: string, mode: LightMode) =>
    setConfig((c) => ({ ...c, lights: { ...c.lights, [key]: mode } }))
  // Switching shape adopts that shape's default measurement.
  const setShape = (shape: WindowShape) =>
    setConfig((c) => ({
      ...c,
      shape,
      shapeParam: windowShapes[shape].param?.default ?? c.shapeParam,
    }))

  const cols = Math.max(1, Math.round(config.lightsX))
  const rows = Math.max(1, Math.round(config.lightsY))
  const shapeParam = windowShapes[config.shape].param

  return (
    <div className="flex h-screen w-full flex-col bg-gray-100 md:flex-row">
      <div className="relative min-h-0 flex-1">
        <Canvas
          shadows="percentage"
          dpr={[1, 2]}
          camera={{ position: [1.4, 1.1, 2.2], fov: 40 }}
        >
          <color attach="background" args={['#dfe3e8']} />
          {/* Image-based lighting carries most of the look; keep direct lights
              as soft key/fill so reflections read on the profiles. */}
          <ambientLight intensity={0.25} />
          <directionalLight
            position={[3, 5, 4]}
            intensity={1.6}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0002}
            shadow-normalBias={0.02}
          >
            <orthographicCamera
              attach="shadow-camera"
              args={[-2, 2, 2, -2, 0.1, 20]}
            />
          </directionalLight>
          <directionalLight position={[-4, 2, -3]} intensity={0.35} />
          <Environment preset="city" environmentIntensity={0.7} />
          <WindowModel config={config} />
          <ContactShadows
            position={[0, -config.outerHeight / 2, 0]}
            scale={Math.max(config.outerWidth, config.outerHeight) * 2.2}
            blur={2.4}
            opacity={0.45}
            far={1.2}
          />
          <OrbitControls
            makeDefault
            enablePan
            minDistance={0.5}
            maxDistance={8}
          />
        </Canvas>
        <div className="pointer-events-none absolute left-4 top-4 rounded-lg bg-white/70 px-3 py-2 text-sm font-medium text-gray-700 backdrop-blur">
          Window Profile Designer
        </div>
      </div>

      <div className="w-full shrink-0 overflow-y-auto border-t border-gray-200 bg-white p-4 md:h-screen md:w-80 md:border-l md:border-t-0">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-base font-semibold text-gray-800">Parameters</h1>
          <button
            type="button"
            onClick={() => setConfig(defaultConfig)}
            className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
          >
            Reset
          </button>
        </div>

        <ShapeGallery value={config.shape} onChange={setShape} />

        {shapeParam && (
          <label className="mb-5 flex flex-col gap-1 text-xs text-gray-600">
            <span className="flex items-center justify-between">
              <span>{shapeParam.label}</span>
              <span className="font-mono text-gray-400">
                {(config.shapeParam * 100).toFixed(0)}%
              </span>
            </span>
            <input
              type="range"
              min={shapeParam.min}
              max={shapeParam.max}
              step={0.01}
              value={config.shapeParam}
              onChange={(e) =>
                setConfig((c) => ({
                  ...c,
                  shapeParam: Number(e.target.value),
                }))
              }
              className="accent-blue-600"
            />
          </label>
        )}

        <div className="mb-4 grid grid-cols-2 gap-3">
          {!isPolygon && (
            <EnumSelect
              label="Type"
              value={config.type}
              options={windowTypes}
              onChange={(v) =>
                setConfig((c) => ({ ...c, type: v as WindowType }))
              }
            />
          )}
          <EnumSelect
            label="Material"
            value={config.material}
            options={surfaceMaterials}
            onChange={(v) =>
              setConfig((c) => ({ ...c, material: v as SurfaceMaterial }))
            }
          />
          <StyleSelect
            label="Frame style"
            value={config.frameStyle}
            onChange={(v) => setStyle('frameStyle', v)}
          />
          {!isPolygon && (
            <StyleSelect
              label="Sash style"
              value={config.sashStyle}
              onChange={(v) => setStyle('sashStyle', v)}
            />
          )}
          <EnumSelect
            label="Glazing bar"
            value={config.mullionSide}
            options={mullionSides}
            onChange={(v) =>
              setConfig((c) => ({ ...c, mullionSide: v as MullionSide }))
            }
          />
        </div>

        {!isPolygon && (
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Opening per light
              </h2>
              <label className="flex items-center gap-1.5 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={config.openInward}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, openInward: e.target.checked }))
                  }
                  className="accent-blue-600"
                />
                Open inward
              </label>
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: rows }).map((_, rIdx) => {
                // Render top row first so the grid matches the on-screen layout.
                const j = rows - 1 - rIdx
                return (
                  <div
                    key={j}
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
                  >
                    {Array.from({ length: cols }).map((_, i) => {
                      const key = `${i}-${j}`
                      const mode = config.lights[key] ?? 'fixed'
                      return (
                        <select
                          key={key}
                          value={mode}
                          onChange={(e) =>
                            setLight(key, e.target.value as LightMode)
                          }
                          className="rounded-md border border-gray-200 bg-white px-1.5 py-1 text-xs capitalize"
                          title={`Light ${key}`}
                        >
                          {lightModes.map((m) => (
                            <option key={m} value={m} className="capitalize">
                              {lightModeLabels[m]}
                            </option>
                          ))}
                        </select>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {sections.map((section) => {
          // Free-form polygons are fixed and single-glazed: only the outline,
          // frame profile and glass apply.
          if (isPolygon && !polygonSections.has(section.title)) {
            return null
          }
          // The threshold only applies to doors.
          if (section.title === 'Door threshold' && config.type !== 'door') {
            return null
          }
          const toggle = sectionToggles[section.title]
          const enabled = toggle ? config[toggle] : true
          return (
            <div key={section.title} className="mb-5">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {section.title}
                </h2>
                {toggle && (
                  <label className="flex items-center gap-1.5 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={config[toggle]}
                      onChange={(e) =>
                        setConfig((c) => ({ ...c, [toggle]: e.target.checked }))
                      }
                      className="accent-blue-600"
                    />
                    Enabled
                  </label>
                )}
                {section.title === 'Mid rail & panel' && (
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={config.midRail}
                        onChange={(e) =>
                          setConfig((c) => ({
                            ...c,
                            midRail: e.target.checked,
                          }))
                        }
                        className="accent-blue-600"
                      />
                      Rail
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={config.kickPanel}
                        onChange={(e) =>
                          setConfig((c) => ({
                            ...c,
                            kickPanel: e.target.checked,
                          }))
                        }
                        className="accent-blue-600"
                      />
                      Kick panel
                    </label>
                  </div>
                )}
              </div>
              {enabled && (
                <div className="flex flex-col gap-3">
                  {section.sliders.map((def) => (
                    <Slider
                      key={def.key}
                      def={def}
                      value={config[def.key]}
                      onChange={(v) => set(def.key, v)}
                    />
                  ))}
                  {section.title === 'Sash stop' && (
                    <StyleSelect
                      label="Stop style"
                      value={config.stopStyle}
                      onChange={(v) => setStyle('stopStyle', v)}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}

        <div className="mb-2">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Colors
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <ColorInput
              label="Frame"
              value={config.frameColor}
              onChange={(v) => setColor('frameColor', v)}
            />
            <ColorInput
              label="Sash"
              value={config.sashColor}
              onChange={(v) => setColor('sashColor', v)}
            />
            <ColorInput
              label="Glass"
              value={config.glassColor}
              onChange={(v) => setColor('glassColor', v)}
            />
            <ColorInput
              label="Rain rail"
              value={config.rainColor}
              onChange={(v) => setColor('rainColor', v)}
            />
            <ColorInput
              label="Panel"
              value={config.panelColor}
              onChange={(v) => setColor('panelColor', v)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const StyleSelect = ({
  label,
  value,
  onChange,
}: {
  label: string
  value: ProfileStyle
  onChange: (v: ProfileStyle) => void
}) => (
  <label className="flex flex-col gap-1 text-xs text-gray-600">
    <span>{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ProfileStyle)}
      className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm capitalize"
    >
      {profileStyles.map((s) => (
        <option key={s} value={s} className="capitalize">
          {s}
        </option>
      ))}
    </select>
  </label>
)

const EnumSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (v: string) => void
}) => (
  <label className="flex flex-col gap-1 text-xs text-gray-600">
    <span>{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm capitalize"
    >
      {options.map((s) => (
        <option key={s} value={s} className="capitalize">
          {s}
        </option>
      ))}
    </select>
  </label>
)

const ColorInput = ({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) => (
  <label className="flex flex-col gap-1 text-xs text-gray-600">
    <span>{label}</span>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-full cursor-pointer rounded-md border border-gray-200"
    />
  </label>
)

export default WindowDesigner
