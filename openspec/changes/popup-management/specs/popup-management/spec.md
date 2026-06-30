## ADDED Requirements

### Requirement: List current document highlights
The popup SHALL list the highlights of the currently open document, showing a text snippet and color for each, read from the highlight store.

#### Scenario: Highlights listed
- **WHEN** the user opens the popup while a document with highlights is open
- **THEN** each highlight is shown with its text snippet and color

#### Scenario: No document open
- **WHEN** the popup opens with no Margin viewer active
- **THEN** an empty/"open a PDF" state is shown instead of an error

### Requirement: Jump to a highlight
The popup SHALL scroll the viewer to a highlight when its list item is activated.

#### Scenario: Jump scrolls viewer
- **WHEN** the user clicks a highlight in the list
- **THEN** the viewer scrolls to bring that highlight into view

#### Scenario: Jump to lost highlight
- **WHEN** the user activates a highlight that could not be anchored
- **THEN** the viewer does not scroll and the item is indicated as unavailable

### Requirement: Remove from the popup
The popup SHALL remove a single highlight and SHALL remove all highlights for the document, persisting both, with the viewer reflecting the change.

#### Scenario: Single remove persists and syncs
- **WHEN** the user removes a highlight from the popup
- **THEN** it is deleted from storage, disappears from the viewer, and does not reappear on reload

#### Scenario: Remove all
- **WHEN** the user chooses remove-all
- **THEN** all of the document's highlights are removed from storage and the viewer
