## ADDED Requirements

### Requirement: Typed message contract
The system SHALL define all cross-context messages as a single discriminated union keyed by a literal `type`, with each `type` linked to its request payload and response type via a shared `MessageMap`. Sending or handling a message with a payload or response that does not match its `type` SHALL be a compile-time type error.

#### Scenario: Well-typed message compiles
- **WHEN** a caller sends a message whose `type` and payload match an entry in `MessageMap`
- **THEN** the code type-checks and the response is inferred as that entry's response type

#### Scenario: Mismatched payload is rejected
- **WHEN** a caller sends a message with a `type` but a payload shape that does not match that `type`'s entry in `MessageMap`
- **THEN** the TypeScript compiler reports a type error

### Requirement: Background action router
The background service worker SHALL register a single top-level message listener that dispatches each incoming message to exactly one typed handler keyed by `type`. Handlers that resolve asynchronously SHALL return their result to the sender without the channel closing prematurely.

#### Scenario: Synchronous action dispatch
- **WHEN** the content script sends a known message `type`
- **THEN** the router invokes the matching handler and the sender receives that handler's typed response

#### Scenario: Asynchronous action dispatch
- **WHEN** a handler returns a promise
- **THEN** the router keeps the message channel open and delivers the resolved value as the response

#### Scenario: Unknown action
- **WHEN** a message arrives with a `type` that has no registered handler
- **THEN** the router ignores it and does not throw

### Requirement: Background-to-page command bridge
For commands that must run in the page, the background SHALL execute them via `chrome.scripting.executeScript` targeting the relevant tab with `allFrames: true`, invoking a content-exposed `window.marginAPI`. The background SHALL NOT rely on a content-side `runtime.onMessage` listener for these commands.

#### Scenario: Command reaches the page without a listener handshake
- **WHEN** the background runs a command against a tab whose content script has initialized `window.marginAPI`
- **THEN** the injected function calls the corresponding `window.marginAPI` method and its return value is delivered back to the background

#### Scenario: Multi-frame result aggregation
- **WHEN** a command is injected into a tab with multiple frames
- **THEN** results from all frames are collected and the meaningful (non-empty) result is used

### Requirement: Exposed content API surface
The content script SHALL expose a typed `window.marginAPI` object at initialization, and its type SHALL be declared once in the shared module so background-injected functions and the content implementation share the same contract.

#### Scenario: API available after content init
- **WHEN** the content script has finished initializing in a frame
- **THEN** `window.marginAPI` is defined with the methods declared in the shared contract
