## Context

P3 renders highlights with a color value; P4 persists it and supports update; P5 exposes a color entry point on the toolbar. This phase makes color a real, typed feature: a fixed palette, a remembered current color for new highlights, and recoloring existing ones. `jeromepl/highlighter` models this with named colors (yellow/blue/green/pink/dark), a stored current color, and per-highlight color updates — we adopt the shape, typed.

## Goals / Non-Goals

**Goals:**
- A typed registry mapping color name → `{ background, text }`.
- A persisted current-color preference applied to new highlights.
- Recolor an existing highlight, persisted via P4 update.
- A palette UI wired into the P5 toolbar.

**Non-Goals:**
- Custom user-defined colors / color editing (highlighter has edit-color; defer).
- Color-based filtering in popup (P8 may add).
- Keyboard shortcuts to switch color (P7 owns triggers; it may call this system).

## Decisions

### D1: Typed color registry as single source of truth
One module exports the palette as a typed map; all code references registry entries, never raw hex/name strings.
- *Why:* eliminates magic strings (highlighter's weakness), gives autocomplete + exhaustive handling.
- *Alternative:* CSS variables only — still needs a typed name list for storage/logic; registry holds both.

### D2: Current color persisted via storage-layer
Store current color name under a preference key (versioned). New highlights read it at create time.
- *Why:* preference must survive reloads; P1 layer already gives versioned typed storage.
- *Alternative:* in-memory only — lost on reload/SW restart; rejected.

### D3: Recolor via P4 update, not a new store path
Recolor changes the element's color and calls P4 `highlight-store` update.
- *Why:* one persistence path; P4 already specs update(color).

### D4: Palette UI as a small component opened from the toolbar
The color entry point (P5) opens a palette (swatches); selecting sets either the current color (for new) or recolors the hovered highlight (in-context).
- *Why:* matches highlighter UX (context-menu colors + toolbar). Keep it the same component for both entry modes.

## Risks / Trade-offs

- [Color name in storage no longer exists after a palette change] → migration/fallback to a default color on unknown name; covered by P1 migration seam + a default.
- [Text color/contrast on certain backgrounds] → registry stores explicit text color per swatch (highlighter does this), not just background.
- [Two entry modes (set-current vs recolor) confusing] → palette takes an explicit mode/target; toolbar passes the hovered highlight, global trigger sets current.

## Migration Plan

Additive. Steps: (1) registry; (2) current-color storage + read at create; (3) palette component; (4) wire toolbar entry point → recolor via P4; (5) default/fallback for unknown stored color names. Rollback = revert; existing highlights keep their stored color.

## Open Questions

- Final palette (which colors, how many) — adopt highlighter's set as a starting point; tune later.
- Whether custom colors land in v2 or later — defer unless requested.
