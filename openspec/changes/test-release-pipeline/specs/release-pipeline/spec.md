## ADDED Requirements

### Requirement: CI gate on every change
The project SHALL run lint, typecheck, unit tests, and build automatically on every push and pull request, failing the check when any step fails.

#### Scenario: Failing check blocks
- **WHEN** a change introduces a lint error, type error, failing unit test, or broken build
- **THEN** CI reports failure for that change

#### Scenario: Passing change is green
- **WHEN** a change passes lint, typecheck, unit tests, and build
- **THEN** CI reports success

### Requirement: End-to-end tests run on a defined trigger
The project SHALL run the Playwright e2e suite on a defined trigger (e.g. scheduled or pre-release) rather than blocking every push.

#### Scenario: e2e runs on its trigger
- **WHEN** the configured e2e trigger fires
- **THEN** the Playwright suite runs against the built extension

### Requirement: Repeatable release packaging
The project SHALL provide a release script that builds from clean and produces a versioned, store-ready zip of the distribution, with manifest/version validation.

#### Scenario: Release artifact produced
- **WHEN** the release script is run
- **THEN** a versioned zip of the built `dist` is produced after a clean build

#### Scenario: Version validated
- **WHEN** the manifest version is missing or malformed
- **THEN** the release script fails rather than producing an artifact
