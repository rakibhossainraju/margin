## ADDED Requirements

### Requirement: Capture a non-empty selection
The viewer SHALL read the current text selection and produce a normalized capture object containing the selection string, anchor node, anchor offset, focus node, focus offset, and the common-ancestor container.

#### Scenario: Valid selection captured
- **WHEN** the user has selected one or more characters of PDF text and capture is invoked
- **THEN** a capture object is returned with a non-empty string and the anchor/focus nodes, offsets, and common-ancestor container populated

### Requirement: Reject empty selections
The capture SHALL reject collapsed or empty selections without producing a highlight.

#### Scenario: Collapsed selection rejected
- **WHEN** capture is invoked while the selection is collapsed (no text selected)
- **THEN** no capture object is produced and no highlight is created
