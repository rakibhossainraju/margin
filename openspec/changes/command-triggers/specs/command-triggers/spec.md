## ADDED Requirements

### Requirement: Keyboard shortcut to highlight selection
The extension SHALL provide a keyboard command that highlights the current text selection in the viewer, dispatched via the background router and executeScript bridge.

#### Scenario: Shortcut highlights selection
- **WHEN** the user selects text in the viewer and presses the highlight shortcut
- **THEN** the selection is highlighted using the current color

#### Scenario: Shortcut with no selection
- **WHEN** the highlight shortcut is pressed with no selection
- **THEN** nothing is highlighted and no error occurs

### Requirement: Keyboard shortcut to change color
The extension SHALL provide a keyboard command to change the current highlight color.

#### Scenario: Color shortcut changes current color
- **WHEN** the user invokes the change-color command
- **THEN** the current color updates and subsequent highlights use it

### Requirement: Context-menu highlighting
The extension SHALL add a context-menu entry to highlight the current selection, shown when text is selected, plus color choices.

#### Scenario: Context menu highlights
- **WHEN** the user right-clicks selected text and chooses Highlight
- **THEN** the selection is highlighted

#### Scenario: Context menu color choice
- **WHEN** the user picks a color from the context-menu color entries
- **THEN** the current color updates accordingly

### Requirement: Triggers dispatch via the bridge
All triggers SHALL dispatch through the background action router and executeScript bridge rather than a direct content message channel.

#### Scenario: Trigger fails safe outside the viewer
- **WHEN** a trigger fires in a tab without the Margin viewer API present
- **THEN** it performs no action and produces no unhandled error
