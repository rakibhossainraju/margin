## ADDED Requirements

### Requirement: PDF Content Script Injection
The Chrome Extension SHALL inject the content script only on URLs representing PDF documents.

#### Scenario: User navigates to a PDF URL
- **WHEN** the user navigates to a URL ending in `.pdf` or otherwise representing a PDF document
- **THEN** the extension SHALL load and execute the content script

#### Scenario: User navigates to a non-PDF URL
- **WHEN** the user navigates to a normal HTML webpage
- **THEN** the content script SHALL NOT execute and SHALL NOT inject any UI/logic

### Requirement: Service Worker Communication
The content script SHALL communicate with the background service worker to verify bidirectional messaging.

#### Scenario: Content script loaded on PDF
- **WHEN** the content script loads on a PDF page
- **THEN** it SHALL print a verification log to the console and send a verification message to the background service worker

#### Scenario: Background service worker receives message
- **WHEN** the background service worker receives the verification message from the content script
- **THEN** it SHALL print a confirmation log to the service worker console
