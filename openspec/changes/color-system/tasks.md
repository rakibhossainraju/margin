## 1. Color registry

- [ ] 1.1 Define the typed palette (name → background + text) in `src/viewer/color/registry.ts`
- [ ] 1.2 Add a default color + unknown-name fallback resolver
- [ ] 1.3 Replace any magic color strings in P3 render with registry lookups

## 2. Current color preference

- [ ] 2.1 Add a current-color preference key to storage (versioned via P1)
- [ ] 2.2 Read current color at highlight creation
- [ ] 2.3 Implement set-current-color and persist

## 3. Palette UI

- [ ] 3.1 Build a palette/swatch component in `src/viewer/color/palette.ts`
- [ ] 3.2 Support two modes: set-current and recolor-target
- [ ] 3.3 Wire the P5 toolbar color entry point to open the palette for the hovered highlight

## 4. Recolor

- [ ] 4.1 Apply chosen color to the highlight element
- [ ] 4.2 Persist via P4 `highlight-store` update(color)

## 5. Validation

- [ ] 5.1 Manual: change current color → new highlights use it; survives reload
- [ ] 5.2 Manual: recolor existing highlight → persists across reload
- [ ] 5.3 Manual: unknown stored color name → falls back to default, no crash
- [ ] 5.4 `bun run build` passes with no type errors
- [ ] 5.5 Attribution where color flow is adapted from jeromepl/highlighter (MIT)
