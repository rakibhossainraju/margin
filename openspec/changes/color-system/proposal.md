## Why

Highlights so far use a single/implicit color. Real highlighting needs multiple colors (categorize, emphasize) plus a remembered "current color" and the ability to recolor an existing highlight. This phase adds a typed color system: a defined palette, a persisted current-color preference, color applied at creation, and recolor via the P5 hover toolbar's color entry point.

## What Changes

- Define a typed **color registry** (named colors → background + text color), replacing magic color strings.
- Track and persist a **current color** preference (used for new highlights) via P1 `storage-layer`.
- Apply the current color when creating a highlight (P3 render uses the registry value).
- **Recolor** an existing highlight from the P5 toolbar color entry point, persisting the change via P4 `highlight-store` update.
- Provide a color-choice UI surface (palette) wired into the hover toolbar.

## Capabilities

### New Capabilities

- `color-system`: A typed color palette, a persisted current-color preference for new highlights, and per-highlight recoloring that persists.

### Modified Capabilities

<!-- None promoted to openspec/specs yet. Consumes P3 highlight-render (apply color), P4 highlight-store (persist recolor), P5 hover-tools (color entry point), P1 storage-layer (current-color pref). -->

## Impact

- Code: new `src/viewer/color/` (registry, current-color state, palette UI); P3 render reads the registry; P5 toolbar color entry point opens the palette; P4 update persists recolor.
- Storage: a current-color preference key (versioned via P1).
- Ported concept: color list + current-color/change-color flow from `jeromepl/highlighter` (MIT) — reimplemented typed.
- Downstream: P8 popup may show/filter by color; P9 export may include color.
