## ADDED Requirements

### Requirement: Persist highlights per document
The system SHALL save highlights under a stable per-document key via the storage layer, so highlights from different documents are isolated.

#### Scenario: Highlight saved under document key
- **WHEN** a highlight is created in a document
- **THEN** its serialized record is persisted under that document's key and is retrievable on a later load of the same document

#### Scenario: Documents isolated
- **WHEN** highlights exist for two different documents
- **THEN** loading one document returns only its own highlights

### Requirement: Restore highlights on load
WHEN a document is reopened, the system SHALL load its saved highlights and re-apply each one using the existing render engine.

#### Scenario: Highlights reappear after reload
- **WHEN** a document with saved highlights is reopened and its text layer has rendered
- **THEN** each anchorable highlight is re-applied and visible over its original text

#### Scenario: Re-applied after text-layer re-render
- **WHEN** the text layer is regenerated (e.g. on zoom)
- **THEN** the saved highlights are re-applied so they remain visible

### Requirement: Graceful handling of lost highlights
The system SHALL skip highlights that cannot be anchored, record them as lost, and continue restoring the remainder without error.

#### Scenario: One unanchorable highlight does not block others
- **WHEN** one saved highlight cannot be anchored during restore
- **THEN** it is recorded as lost and all other anchorable highlights are still restored

### Requirement: Versioned records with migration seam
Every persisted highlight record SHALL carry a store-format version, and reads SHALL pass through a migration seam that can upgrade older records before use.

#### Scenario: Version stamped on save
- **WHEN** a highlight record is saved
- **THEN** it includes the current store-format version

#### Scenario: Older record migrated on read
- **WHEN** a record with an older store-format version is read
- **THEN** it passes through the migration seam and is returned in the current shape

### Requirement: Remove and update persisted highlights
The system SHALL remove a persisted highlight by id and update a persisted highlight's mutable fields (e.g. color), reflecting changes in storage.

#### Scenario: Remove persists
- **WHEN** a highlight is removed
- **THEN** it is deleted from storage and does not reappear on reload

#### Scenario: Update persists
- **WHEN** a highlight's color is updated
- **THEN** the change is saved and reflected on reload
