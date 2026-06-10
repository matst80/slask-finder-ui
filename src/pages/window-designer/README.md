# Window Designer

A fully dynamic React Three Fiber window/door generator. Profiles are 2D
cross-sections swept along the members of a frame (mitred at every corner), so
any combination of frame, sash, glazing bars, glass, panels and rails rebuilds
from plain numbers. Rectangular windows/doors and free-form fixed shapes share
the same sweep engine.

Live editor route: `/window-designer`.

## Layers

The code is split so each file has one job. Reading top to bottom = primitives →
schema → derivation → authoring → presentation.

```
frameGeometry.ts   sweep engine: addBar, buildFrame, buildPolygonFrame, offsetPolygon
profiles.ts        cross-sections: frame/sash, mullion, rain rail, threshold
shapes.ts          free-form outline presets (parametric)
config.ts          flat WindowConfig (the render contract) + defaultConfig + enums
geometry/          config -> renderable geometry
  rect.ts            rectangular pipeline (lights, openings, doors, rails)
  polygon.ts         free-form fixed pane + trimmed glazing bars
  transform.ts       per-light hinge/slide transforms
  index.ts           buildGeometry dispatch + re-exports
spec/              authoring layer: discriminated union -> flat config
  types.ts           WindowSpec union + section property groups
  sections.ts        pure appliers (config, props) -> config
  rules.ts           normalize(): clamp ranges + enforce invariants
  build.ts           buildConfig(spec, base?) -> { config, issues }
  builder.ts         fluent sugar: window() / door() / shaped()
  presets.ts         per-model predefined specs
  index.ts           barrel
WindowModel.tsx    R3F component that renders a WindowConfig
WindowDesigner.tsx live editor UI (sliders, gallery, colors)
```

The single boundary everything funnels through is the flat **`WindowConfig`**.
`WindowModel` only ever takes a `WindowConfig`; how you produce one is up to you.

## Rendering a window

```tsx
import { WindowModel } from './WindowModel'
import { defaultConfig } from './config'

<Canvas>
  {/* ...lights, <Environment /> ... */}
  <WindowModel config={defaultConfig} />
</Canvas>
```

`WindowModel` must live inside a `<Canvas>` and wants image-based lighting
(`<Environment preset="city" />`) for the glass/metal reflections to read. See
`WindowDesigner.tsx` for a complete scene setup.

## Building a config (the `spec/` layer)

You rarely hand-write a flat `WindowConfig`. Instead describe a window with a
**`WindowSpec`** — a discriminated union by `kind` (`'window' | 'door' |
'shaped'`) where each variant only carries the sections that apply — and compile
it with `buildConfig`.

### Declarative

```ts
import { buildConfig } from './spec'

const { config, issues } = buildConfig({
  kind: 'window',
  frame: { style: 'classic', width: 0.07 },
  grid: { x: 2, y: 1 },
  openings: { '0-0': 'left', '1-0': 'right' },
  meetingStile: true,
})
// config is a flat WindowConfig ready for <WindowModel>; issues lists any
// values the rules had to adjust.
```

### Fluent sugar

The builder is just sugar over the same spec (`window()`, `door()`,
`shaped(shape)`); these two produce an identical config:

```ts
import { window } from './spec'

const config = window()
  .frame({ style: 'classic', width: 0.07 })
  .grid(2, 1)
  .open('0-0', 'left')
  .open('1-0', 'right')
  .meetingStile()
  .build()
```

`door()` adds `.threshold({...})`; `shaped('house')` adds `.param(t)` and drops
the openable methods. `.toSpec()` returns the underlying spec, `.result()`
returns `{ config, issues }`.

### Presets

`presets` is a `Record<ModelId, WindowSpec>` you can grow into a product
catalog:

```ts
import { buildConfig, presets } from './spec'

const frenchDoor = buildConfig(presets['french-door']).config
```

## Sections and the "keep the base" rule

Every spec field is a **section** — a partial bag of properties (`frame`,
`glazing`, `colors`, `sash`, `midRail`, …). Each applier overwrites only the
fields you supply (`value ?? base`), so editing one section preserves
everything else. Pass an existing config as the `base` to tweak in place:

```ts
// recolor only; grid, openings, meeting stile, … all carried over
const recolored = buildConfig({ kind: 'window', colors: { frame: '#222' } }, existing).config
```

Toggleable sections accept `true`/`false` to flip them, or an object to flip and
tune at once: `sashStop: true`, `midRail: { height: 0.95, kickPanel: true }`.

## Rules (validate + normalize)

`buildConfig` runs `normalize()` last. It clamps ranges (open angle 0–60, light
counts 1–4, bar counts 0–6, shape parameter to the shape's bounds) and enforces
cross-field invariants, returning a human-readable `issues[]` for anything it
changed. For example a `shaped` window can't open, so any openings are reset to
fixed and an issue is reported. The returned config is always renderable.

## Shapes

`shapes.ts` holds the free-form outline presets (triangles, trapezoids, diamond,
house, cut pentagons) as functions of one normalised parameter `t` (apex
position, eaves height, corner cut …). `'rect'` has a null outline and routes to
the rectangular pipeline. Shaped windows are fixed and single-glazed but support
glazing bars, trimmed to the polygon.

## Adding things

- **A new frame/sash profile style:** extend `ProfileStyle` in `profiles.ts` and
  handle it in `buildProfile`.
- **A new free-form shape:** add an entry to `windowShapes` in `shapes.ts`
  (outline fn + optional `param`); the gallery and builder pick it up.
- **A new config field:** add it to `WindowConfig`/`defaultConfig`, consume it in
  `geometry/rect.ts` or `geometry/polygon.ts`, expose it via a `spec/` section
  (type in `types.ts`, applier in `sections.ts`), and add a slider in
  `WindowDesigner.tsx`.
- **A new model:** add a `WindowSpec` to `presets` in `spec/presets.ts`.
```
