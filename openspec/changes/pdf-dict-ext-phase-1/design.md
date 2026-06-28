## Context

We are establishing the codebase and architecture for a new Chrome Extension designed to interact with PDF pages. In this initial phase, the priority is to set up a robust, scalable project template (Vite + TypeScript + Manifest V3 + ESLint + Prettier) and verify that the content script successfully executes exclusively on PDF URLs and communicates with the background service worker.

## Goals / Non-Goals

**Goals:**
- Set up a clean, linted, and buildable project structure using TypeScript, Vite, and Manifest V3.
- Establish clean architectural boundaries with folders for `background/`, `content/`, `popup/`, `shared/`, `utils/`, and `assets/`.
- Ensure content script executes exclusively on PDF URLs (matching `.pdf` extensions or patterns).
- Enable bidirectional communication verification between the content script and background service worker.

**Non-Goals:**
- Implementing dictionary lookup or word selection logic.
- Implementing AI/translation API integrations.
- Storing words or user settings.
- Building user interface components (popup UI, options page, highlight layers).

## Decisions

### 1. Build and Bundling Strategy: Vite + Rollup Multi-Input Config
- **Decision**: Configure Vite using native Rollup multi-input options instead of CRXJS plugin.
- **Rationale**: While CRXJS is popular, it can be fragile across different Vite and Manifest V3 version updates. A direct Rollup configuration within `vite.config.ts` allows us to compile the content script (`content/index.ts`) and background script (`background/index.ts`) to specific output chunks/files, and bundle the popup (`popup/index.html`) using standard HTML entry processing.
- **Alternatives considered**:
  - *CRXJS Vite Plugin*: Rejected due to potential dependency conflicts and version instability.
  - *Webpack/CRA*: Rejected because Vite provides faster build speeds and a cleaner modern developer experience.

### 2. PDF URL Target Matching
- **Decision**: Define strict URL matching patterns in `manifest.json` content script configuration, paired with a runtime check in the content script.
  - Manifest matches: `*://*/*.pdf*`, `file://*/*.pdf*`.
  - Content script runtime check: Ensure the document content-type is `application/pdf` or URL contains `.pdf` before initiating communication.
- **Rationale**: Restricting the matches in `manifest.json` ensures Chrome does not inject the content script into normal web pages, saving resources. The script-side check acts as a secondary safeguard to handle dynamic responses or edge cases.
- **Alternatives considered**:
  - *Match `<all_urls>`*: Rejected because it would inject the content script into all web pages, violating the requirement that the extension should not execute on normal web pages.

### 3. Messaging Layer Protocol
- **Decision**: Implement a simple strongly-typed message protocol using a shared interface `ChromeMessage` in `src/shared/types.ts`.
- **Rationale**: Using structured message types prevents runtime deserialization errors and provides clear API contracts between background and content scripts as features scale.
- **Alternatives considered**:
  - *Untyped chrome.runtime.sendMessage*: Rejected as it leads to brittle communications when new features are added in later phases.

## Risks / Trade-offs

- **[Risk] File URL Access** → For local PDF files (`file:///path/to.pdf`), Chrome disables extension injection by default.
  - *Mitigation*: Document in the setup guide that the user must explicitly toggle "Allow access to file URLs" in `chrome://extensions` for the extension to work on local PDF files.
- **[Risk] Chrome PDF Viewer Sandboxing** → The default Chrome PDF viewer (PDFium) runs inside a nested, protected `<embed>` element which restricts standard content scripts from accessing the internal DOM of the PDF.
  - *Mitigation*: In Phase 1, we focus on verify-only injection/execution of the script on the parent document. In future phases, handling PDF text extraction can be done via PDF.js or parsing the stream if standard DOM selection is blocked.

## Migration Plan

1. **Local Setup**: Set up ESLint, Prettier, and Vite configuration.
2. **Build Verification**: Run `npm run build` and inspect the `dist/` directory to verify `manifest.json` matches the compiled entry files.
3. **Chrome Installation**: Load the `dist/` folder via "Load unpacked" on `chrome://extensions`.
4. **Verification**: Open a remote/local PDF and verify logs in both the page console (content script) and the background service worker console.

## Open Questions

- *Do we need support for dynamic/blob PDF URLs?* Currently, only static URL matches are targeted. We will address blob/object URLs in a subsequent phase if required.
