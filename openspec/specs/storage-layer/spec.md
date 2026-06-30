# storage-layer Specification

## Purpose
TBD - created by archiving change architecture-foundation. Update Purpose after archive.
## Requirements
### Requirement: Typed storage facade
The system SHALL provide a typed facade over `chrome.storage.local` exposing get, set, update, and remove operations. Call sites SHALL NOT reference raw storage keys or perform manual serialization directly; all access SHALL go through the facade.

#### Scenario: Typed read returns declared shape
- **WHEN** a caller reads a namespaced key through the facade
- **THEN** the returned value is typed as that key's declared record type, defaulting to a typed empty value when absent

#### Scenario: Typed write
- **WHEN** a caller writes a record through the facade
- **THEN** the value is persisted to `chrome.storage.local` under the namespaced key and is retrievable by a subsequent read

### Requirement: Namespaced keys
The facade SHALL namespace stored entries by a stable key scheme so that different record categories do not collide.

#### Scenario: Distinct categories do not collide
- **WHEN** two different record categories are written
- **THEN** each is stored under its own namespaced key and reading one never returns the other's data

### Requirement: Versioned records
Every record written through the facade SHALL carry a `version` field set to the store-format version at write time, and the facade SHALL route reads through a migration seam that can upgrade older records before returning them.

#### Scenario: Version stamped on write
- **WHEN** a record is written through the facade
- **THEN** the persisted record includes a `version` field reflecting the current store-format version

#### Scenario: Migration seam invoked on read
- **WHEN** a record is read through the facade
- **THEN** the record passes through the migration seam before being returned to the caller

#### Scenario: No-op migration in this phase
- **WHEN** a record is read whose `version` equals the current store-format version
- **THEN** the migration seam returns it unchanged

