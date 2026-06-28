## 1. Project Initialization & Tooling Setup

- [x] 1.1 Create the project directory structure under src (background, content, popup, shared, utils, assets)
- [x] 1.2 Initialize package.json with dependencies for Vite, TypeScript, ESLint, Prettier, and chrome types
- [x] 1.3 Create tsconfig.json for TypeScript compilation of scripts
- [x] 1.4 Configure vite.config.ts with Rollup multi-input settings for bundling the extension components
- [x] 1.5 Create configuration files for ESLint and Prettier
- [x] 1.6 Add build, lint, and formatting scripts to package.json

## 2. Extension Core & Communication

- [x] 2.1 Create manifest.json specifying Manifest V3, PDF URL matching, and background service worker
- [x] 2.2 Create src/shared/types.ts with definitions for strongly-typed messages between scripts
- [x] 2.3 Implement background service worker in src/background/index.ts that listens for messages and prints confirmation logs
- [x] 2.4 Implement content script in src/content/index.ts that validates execution on PDF URLs and sends a verification message
- [x] 2.5 Create a minimal placeholder popup in src/popup/index.html and src/popup/index.ts

## 3. Build & Integration Verification

- [x] 3.1 Run build and lint scripts to confirm TypeScript compiles clean and Vite builds successfully
- [x] 3.2 Confirm output in dist/ folder contains manifest.json, background script, content script, and popup files
