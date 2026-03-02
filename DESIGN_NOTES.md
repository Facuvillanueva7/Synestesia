# Design Notes

## Core decisions
- Zustand was chosen for lightweight, low-boilerplate state sharing across engine/UI.
- Scene plugin boundary isolates visual modules from transport/audio internals.
- Post chain uses an original custom shader and ping-pong targets to keep dependency footprint low.

## Trade-offs
- Implemented broad feature coverage first, with simple baseline scene internals, to keep architecture extensible.
- Some advanced UI editors (full preset morph timeline, deep mapping UI) are represented via foundational modules and hooks for expansion.

## Performance
- Typed arrays are reused per frame in `AudioEngine`.
- Scene switching disposes geometries/materials to avoid GPU leaks.
- Postprocess is optional via quality settings.

## Originality / anti-cloning
- All naming, structure, shaders, and scene logic were authored from scratch for this project.
- No vendor assets, copied presets, or trademarked UI motifs were used.
- Procedural visuals only; user supplies audio input.
