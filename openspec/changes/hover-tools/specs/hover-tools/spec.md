## ADDED Requirements

### Requirement: Show toolbar on highlight hover
The viewer SHALL display a floating toolbar anchored to a highlight when the user hovers it, and SHALL keep it visible while the pointer is over the highlight or the toolbar.

#### Scenario: Toolbar appears on hover
- **WHEN** the user hovers a `<margin-highlight>` element
- **THEN** a toolbar appears anchored near that highlight

#### Scenario: Toolbar stays while pointer moves into it
- **WHEN** the user moves the pointer from the highlight onto the toolbar
- **THEN** the toolbar remains visible

#### Scenario: Toolbar hides on mouse-out
- **WHEN** the pointer leaves both the highlight and the toolbar
- **THEN** the toolbar hides after a short grace delay

### Requirement: Toolbar actions
The toolbar SHALL offer delete, copy, and a color entry point for the hovered highlight.

#### Scenario: Delete removes and persists
- **WHEN** the user clicks delete
- **THEN** the highlight is removed from the document and from storage so it does not reappear on reload

#### Scenario: Copy puts text on the clipboard
- **WHEN** the user clicks copy
- **THEN** the highlight's text is written to the clipboard

#### Scenario: Color entry point available
- **WHEN** the toolbar is shown
- **THEN** a color control is present that opens color selection

### Requirement: Encapsulated, correctly positioned toolbar
The toolbar's styles SHALL be encapsulated so they neither leak to nor inherit from the viewer, and its position SHALL track the highlight as the viewer scrolls or zooms while it is visible.

#### Scenario: Styles isolated
- **WHEN** the toolbar renders
- **THEN** its appearance is unaffected by viewer styles and it does not alter viewer styling

#### Scenario: Re-anchors on scroll/zoom
- **WHEN** the viewer is scrolled or zoomed while the toolbar is visible
- **THEN** the toolbar repositions to stay anchored to its highlight
