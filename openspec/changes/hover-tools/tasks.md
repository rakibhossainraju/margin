## 1. Toolbar component

- [ ] 1.1 Implement a toolbar Web Component with shadow root in `src/viewer/hover-tools/toolbar.ts`
- [ ] 1.2 Add encapsulated styles + minimal icons inside the shadow root
- [ ] 1.3 Render delete, copy, and color-entry-point controls (color opens a stub for P6)

## 2. Hover behavior

- [ ] 2.1 Attach delegated `mouseover`/`mouseout` on the highlight container, detecting `<margin-highlight>` targets
- [ ] 2.2 Keep toolbar open while pointer is over highlight or toolbar; grace-delay hide otherwise
- [ ] 2.3 Position toolbar from the highlight's live bounding rect

## 3. Positioning under pdf.js

- [ ] 3.1 Re-anchor the toolbar on viewer scroll/zoom while visible
- [ ] 3.2 Verify positioning survives text-layer re-render (delegation keeps listeners on container)

## 4. Actions

- [ ] 4.1 Wire delete to P4 `highlight-store` remove (DOM unwrap + storage delete)
- [ ] 4.2 Wire copy to `navigator.clipboard.writeText` with the highlight string; handle rejection
- [ ] 4.3 Wire the color entry point to invoke the (P6) color selection seam

## 5. Validation

- [ ] 5.1 Manual: hover highlight → toolbar appears, correctly placed
- [ ] 5.2 Manual: delete → gone and stays gone after reload
- [ ] 5.3 Manual: copy → clipboard has the text
- [ ] 5.4 Manual: scroll/zoom with toolbar open → stays anchored
- [ ] 5.5 `bun run build` passes with no type errors
- [ ] 5.6 Attribution where hover-tools logic is reused from jeromepl/highlighter (MIT)
