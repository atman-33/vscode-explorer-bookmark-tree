# Project Context

## Purpose
Provide a VS Code extension foundation for building the Explorer Bookmark Tree experience. The extension hosts custom activity bar views backed by a React-powered Webview so we can surface bookmarked folders, files, and saved explorer filters inside VS Code.

## Tech Stack
- Extension runtime: TypeScript 5.x targeting Node 16, compiled with esbuild into `dist/extension.js`.
- Webview UI: React 18 + TypeScript bundled with Vite into `dist/webview` assets.
- Styling: Utility-first CSS defined in `webview-ui/src/app.css` using Tailwind-style classes, with shadcn/ui primitives via Radix Slot + class-variance-authority.
- Tooling: Biome (lint/format via Ultracite wrapper), Vitest test runner, Husky-managed Git hooks, GitHub Actions for CI and release pipelines.

## Project Conventions

### Code Style
- Biome enforces tabs for indentation, double quotes, and required semicolons; prefer TypeScript `interface` declarations over type aliases (Biome rule).
- Favor explicit return types in exported APIs and keep `any` usage limited to VS Code message bridges.
- Extension modules live under `src/` with grouped folders (`commands/`, `providers/`, `utils/`); webview React components live under `webview-ui/src/` using PascalCase component names and colocated feature folders.
- Keep strings and IDs prefixed with `vscode-extension-boilerplate` until the rename happens so VS Code contributions stay consistent.

### Architecture Patterns
- `src/extension.ts` is the single activation entry point; register commands and `WebviewViewProvider` instances there and dispose via `context.subscriptions`.
- Webview providers (e.g., `SimpleViewProvider`, `InteractiveViewProvider`) are thin wrappers that resolve HTML via `getWebviewContent` and pass along the `page` identifier so the React app can decide what to render.
- Webview UI bootstraps through `webview-ui/src/index.tsx`, switching on the `data-page` attribute. Communication with the extension uses the thin wrapper in `webview-ui/src/bridge/vscode.ts` with `postMessage` + nonce-protected handlers.
- Place shared extension-only helpers under `src/utils/`; prefer narrow utility modules instead of singletons unless stateful access to VS Code APIs is required.

### Testing Strategy
- Vitest drives unit tests for both the extension runtime and shared TypeScript utilities (`vitest.config.ts` + `tsconfig.test.json`). Tests can live alongside source (`*.test.ts`) or under `tests/`.
- Aim to cover command behavior with mocked VS Code API responses (see `tests/__mocks__/vscode.ts`) and add webview logic tests with DOM-enabled Vitest suites as UI becomes more complex.
- CI (`.github/workflows/on-pr.yml`) runs `npm run build` then `npm run test`; keep suites fast enough to finish within that workflow.
- Prefer deterministic tests—avoid relying on VS Code host state or network access.

### Git Workflow
- `main` is the protected release branch. Feature work happens on topic branches via PR with required CI (build + test) passing before merge.
- Conventional Commits (`feat:`, `fix:`, etc.) are encouraged to drive automated changelog entries in the Version Bump workflow.
- Husky hooks (installed via `npm run prepare`) run Ultracite lint/format checks locally; do not bypass them in regular development.
- Releases are driven by GitHub Actions: run `Version Bump` to create a release PR and tag (`vX.Y.Z`), or `Release Only` when the version is already set. Tag pushes trigger packaging and publishing to VS Code Marketplace and Open VSX.

## Domain Context
The long-term goal is to let users curate a tree of bookmarked workspace resources that lives in the VS Code Activity Bar. Items will support grouping, quick navigation, and context-aware actions (open file, reveal in explorer, run command). Existing boilerplate commands/webviews serve as scaffolding; new capabilities should be wired through the established provider → React feature pattern.

## Important Constraints
- Extension must stay compatible with VS Code `^1.84.0`; avoid APIs introduced after that unless we also raise the `engines.vscode` field.
- Webview assets must be self-contained (no remote scripts/styles) and loaded via `getWebviewContent` with CSP nonce enforcement.
- Keep bundle size small—webview assets are produced by Vite/React; avoid large dependencies without justification.
- All JSON/TypeScript configs assume UTF-8 + LF endings; follow existing repo defaults to keep Husky/CI happy.

## External Dependencies
- VS Code API (`vscode` module) for commands, notifications, and `WebviewViewProvider` integration.
- esbuild and Vite in the build toolchain; Ultracite wraps Biome for lint/format/check tasks.
- Publishing relies on the VS Code Marketplace (`vsce`) and Open VSX (`ovsx`) via GitHub Actions secrets (`VSCE_PAT`, `OPEN_VSX_TOKEN`).
- Webview UI references shadcn/ui, Radix primitives, and lucide-react icons—ensure their licenses remain compatible with the MIT-licensed extension.
