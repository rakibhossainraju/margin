## ADDED Requirements

### Requirement: Typed color palette
The system SHALL define a typed palette mapping each color name to an explicit background and text color, and all color usage SHALL reference the palette rather than raw color strings.

#### Scenario: Palette entry resolves to colors
- **WHEN** code requests a palette color by name
- **THEN** it receives that color's background and text values

#### Scenario: Unknown color falls back
- **WHEN** a stored color name is not present in the palette
- **THEN** a default palette color is used instead of failing

### Requirement: Persisted current color
The system SHALL remember a current color used for new highlights, persisted across reloads.

#### Scenario: New highlight uses current color
- **WHEN** the user creates a highlight
- **THEN** it is rendered with the current color

#### Scenario: Current color survives reload
- **WHEN** the user changes the current color and reloads
- **THEN** new highlights still use the chosen current color

### Requirement: Recolor an existing highlight
The system SHALL recolor an existing highlight and persist the change.

#### Scenario: Recolor persists
- **WHEN** the user selects a new color for an existing highlight
- **THEN** the highlight updates to that color and the change is saved across reloads

### Requirement: Color selection UI
The system SHALL provide a palette UI, reachable from the hover toolbar, for choosing a color to set as current or to apply to a highlight.

#### Scenario: Palette opens from toolbar
- **WHEN** the user activates the toolbar's color entry point
- **THEN** the palette is shown with the available colors

#### Scenario: Selecting recolors in context
- **WHEN** the palette is opened for a hovered highlight and a color is chosen
- **THEN** that highlight is recolored and the change is persisted
