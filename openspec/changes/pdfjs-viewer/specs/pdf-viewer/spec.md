## ADDED Requirements

### Requirement: Render PDF with selectable text layer
The viewer page SHALL render a PDF given by URL using bundled pdf.js, producing for each page a visual layer and an overlaid DOM text layer whose text is selectable via the browser's native selection.

#### Scenario: PDF renders
- **WHEN** the viewer is opened with a valid PDF file URL
- **THEN** the document's pages render and their text is visible

#### Scenario: Text is selectable
- **WHEN** the user drags across rendered PDF text
- **THEN** `window.getSelection().toString()` in the viewer returns the selected text

### Requirement: Offline pdf.js assets
The viewer SHALL load pdf.js, its worker, and supporting assets (cmaps/standard fonts) exclusively from the extension origin, with no remote network fetches for code.

#### Scenario: Worker loads from extension origin
- **WHEN** the viewer initializes pdf.js
- **THEN** the worker is loaded from a `chrome-extension://` URL and no remote script is requested

### Requirement: Navigation and zoom
The viewer SHALL allow the user to move through pages (scroll/paging) and change zoom, keeping the text layer aligned with the visual layer at every zoom level.

#### Scenario: Zoom keeps text aligned
- **WHEN** the user changes the zoom level
- **THEN** the text layer re-renders so selection still aligns with the visible glyphs

### Requirement: File access guidance
WHEN the viewer cannot read a local PDF because file-URL access is disabled, it SHALL surface actionable guidance rather than failing silently.

#### Scenario: File access disabled
- **WHEN** the viewer is opened for a `file://` PDF and the fetch fails due to missing file-URL access
- **THEN** the viewer shows a message instructing the user to enable "Allow access to file URLs"
