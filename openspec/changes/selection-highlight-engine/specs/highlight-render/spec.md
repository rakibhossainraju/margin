## ADDED Requirements

### Requirement: Wrap selected text into highlight elements
Given a captured selection, the engine SHALL wrap exactly the selected text — across one or more text nodes, including partial text nodes — into one or more `<margin-highlight>` custom elements, leaving surrounding text unchanged.

#### Scenario: Single-node selection
- **WHEN** a selection within a single text node is rendered
- **THEN** only the selected substring is wrapped in a `<margin-highlight>` element and the rest of the node's text is preserved

#### Scenario: Multi-node selection
- **WHEN** a selection spanning multiple text nodes is rendered
- **THEN** each covered text segment is wrapped so the full selected text is highlighted and no unselected text is wrapped

### Requirement: Whitespace-tolerant matching
The engine SHALL match the selection string against text-node content tolerating whitespace differences, and SHALL abort a highlight when a non-whitespace mismatch makes the range unanchorable.

#### Scenario: Whitespace differences tolerated
- **WHEN** the text-node content differs from the selection string only in whitespace
- **THEN** the highlight is still applied over the correct range

#### Scenario: Unanchorable selection aborts
- **WHEN** a non-whitespace mismatch prevents locating the selected text
- **THEN** no partial/incorrect highlight is left in the DOM

### Requirement: Highlight element identity and styling
Each rendered highlight SHALL be a `<margin-highlight>` custom element carrying a unique id and a color, styled via scoped styles that do not leak to or inherit page styling.

#### Scenario: Element carries id and color
- **WHEN** a highlight is rendered
- **THEN** its `<margin-highlight>` element exposes a unique id and the requested color

### Requirement: Remove highlight by id
The engine SHALL remove a highlight by id, restoring the original text content (undoing any text-node splits) so the text reads as before.

#### Scenario: Removal restores text
- **WHEN** a highlight is removed by its id
- **THEN** its `<margin-highlight>` element is gone and the underlying text is intact and selectable

### Requirement: Highlighting invocable via marginAPI
The engine SHALL expose `highlight.create` and `highlight.remove` on `window.marginAPI` so highlighting can be triggered in-page and via the background executeScript bridge.

#### Scenario: Create via marginAPI
- **WHEN** `window.marginAPI.highlight.create` is invoked with a current selection
- **THEN** a highlight is rendered and its id is returned
