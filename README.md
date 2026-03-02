# Prismatic Audio Canvas

## Planned Folder Tree (implemented)
```txt
/src
  /app
  /engine/render
  /engine/audio
  /engine/transport
  /engine/automation
  /engine/params
  /engine/presets
  /engine/themes
  /engine/input
  /scenes
  /ui
  /utils
  /assets
```

## Feature Set Implemented
- Original, modular WebGL visualizer with 10 scene plugins.
- Web Audio microphone/file input + per-frame feature extraction.
- Visual transport clock (BPM, tap tempo, swing, divisions, bar/beat/step ticks).
- Param schema-driven scene control UI.
- Theme token presets and editable styling.
- LFO and audio mapping plumbing.
- Snapshot PNG export and hotkeys.
- Local preset persistence helpers.
- Quality/post stack with feedback shader, vignette, grain, chromatic aberration.

## Setup
```bash
npm install
npm run dev
npm run build
npm run test
```

## Architecture
- `AudioEngine`: wraps WebAudio nodes, FFT sampling, smoothing, onset, and band metrics.
- `VisualTransport`: independent musical clock with tap tempo and event ticks.
- `RenderEngine`: scene lifecycle + ping-pong postprocess.
- `ScenePlugin`: strict plugin interface with typed params.

## Adding a Scene
1. Create a new `ScenePlugin` in `src/scenes/index.ts` or a dedicated module.
2. Define `params` using `ParamSchema`.
3. Implement `init/update/dispose` and register into `scenes` array.
4. Scene controls appear automatically in UI.

## Param Schema + Auto UI
Use `slider/toggle/select/color/vec2/vec3/button`; provide metadata and defaults.
`ParamControls` renders fields directly from schema; values are clamped through params module.

## Audio Features
Per frame output includes:
- `rms`, `peak`, `centroid`, `flux`
- `bands.sub/bass/lowMid/highMid/treble`
- normalized `spectrum`, `waveform`
- adaptive onset gate with cooldown

## Transport
Supports BPM 20-240, tap tempo averaging, swing, numerator/denominator hooks, and step division/triplet toggles.
Outputs beat phase, bar phase, bar counter, and tick booleans.

## Presets / Theme / Automation
- Presets persisted in localStorage (`engine/presets`).
- Theme tokens in `engine/themes` with 3 editable presets.
- LFO lanes + audio mappings in `engine/automation` for resolved params pipeline.

## Performance & Debugging
- RAF loop with array reuse in audio engine.
- Adjustable render resolution and post toggles.
- FPS HUD.
- All scene resources are disposed on scene switch.

## Hotkeys
- `1..0` switch scenes
- `Space` transport play/stop
- `T` tap tempo
- `F` fullscreen
- `P` panel toggle
- `H` HUD toggle
- `S` PNG snapshot
- `R` randomize scene values
- `Arrow Up/Down` nudge BPM

## OBS
Video record via OBS Display/Window capture while app runs in browser.
