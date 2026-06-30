## ADDED Requirements

### Requirement: Serialize a selection to a reload-stable form
The system SHALL serialize a captured selection to durable data consisting of CSS-path queries to the anchor and focus nodes, their offsets, and the selection string, such that the original endpoints can be located after the document is re-rendered.

#### Scenario: Selection serialized
- **WHEN** a highlight is created from a capture
- **THEN** a serialized record is produced containing anchor and focus node queries, both offsets, and the selection string

#### Scenario: Text-node endpoints addressable
- **WHEN** an endpoint is a text node
- **THEN** its query encodes the text node's position so it can be resolved back to that exact text node

### Requirement: Resolve queries back to live nodes
On a freshly rendered document, the system SHALL resolve a stored query back to the corresponding live DOM node, using a robust fallback when the stored selector is not a valid CSS selector but the node exists.

#### Scenario: Standard selector resolves
- **WHEN** a stored query is a valid selector for an existing node
- **THEN** the matching node is returned

#### Scenario: Invalid-but-real selector falls back
- **WHEN** a stored query is rejected as an invalid CSS selector but the addressed node exists in the DOM
- **THEN** the fallback walk resolves and returns the node

#### Scenario: Missing node yields no match
- **WHEN** a stored query addresses a node that no longer exists
- **THEN** resolution returns no node (the highlight is treated as unanchorable)
