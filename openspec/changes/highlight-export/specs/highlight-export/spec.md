## ADDED Requirements

### Requirement: Export to JSON
The system SHALL export highlights to a JSON file that faithfully represents the stored records plus a format header, suitable for re-import.

#### Scenario: Export current document JSON
- **WHEN** the user exports the current document as JSON
- **THEN** a JSON file is produced containing that document's highlight records and a format/version header

#### Scenario: Export all documents
- **WHEN** the user selects all-documents export
- **THEN** the JSON includes highlights for every stored document

### Requirement: Export to Markdown
The system SHALL export highlights to a readable Markdown file listing the highlighted text grouped per document.

#### Scenario: Markdown lists highlighted text
- **WHEN** the user exports as Markdown
- **THEN** a Markdown file is produced listing the highlighted text grouped by document

### Requirement: Import JSON
The system SHALL import a previously exported JSON file, migrating older records and merging them into the store without overwriting unrelated highlights.

#### Scenario: Import merges
- **WHEN** the user imports a valid JSON export
- **THEN** its highlights are added to the store and appear on the corresponding documents

#### Scenario: Duplicate import deduped
- **WHEN** an imported record already exists (same uuid)
- **THEN** it is not duplicated

#### Scenario: Older export migrated
- **WHEN** an imported record uses an older store-format version
- **THEN** it is migrated to the current shape before being stored

#### Scenario: Invalid file rejected
- **WHEN** the user imports a malformed or foreign file
- **THEN** the import is rejected with a clear error and the existing store is unchanged
