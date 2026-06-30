## ADDED Requirements

### Requirement: Unit tests for high-risk units
The project SHALL include unit tests covering the whitespace-tolerant matcher, the serialize/resolve anchoring functions, and the storage migration seam.

#### Scenario: Matcher covered
- **WHEN** the unit suite runs
- **THEN** it exercises single-node, multi-node, partial-node, whitespace-difference, and mismatch-abort cases of the matcher

#### Scenario: Serialize round-trip covered
- **WHEN** the unit suite runs
- **THEN** it asserts a selection serialized and resolved on a representative DOM returns the original nodes, including the invalid-selector fallback

#### Scenario: Migration covered
- **WHEN** the unit suite runs
- **THEN** it asserts an older-format record fixture migrates to the current shape

### Requirement: End-to-end core flows
The project SHALL include Playwright e2e tests that load the built extension in a real browser and verify the core flows.

#### Scenario: Highlight and restore
- **WHEN** the e2e suite opens a fixture PDF in the viewer, highlights text, and reloads
- **THEN** the highlight is restored after reload

#### Scenario: Remove flow
- **WHEN** the e2e suite removes a highlight
- **THEN** it is gone and does not reappear on reload

#### Scenario: Export/import round-trip
- **WHEN** the e2e suite exports highlights to JSON and imports them into a clean state
- **THEN** the highlights are restored without duplication
