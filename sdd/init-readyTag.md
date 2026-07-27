# SDD Init Report — ReadyTag

**Date:** 2026-07-06
**Project:** ReadyTag (Chrome MV3 Extension)
**Workspace:** `C:\Users\niloy\Documents\ReadyTag`

---

## 1. Project Summary

ReadyTag (formerly MetaRefresh) is a Chrome MV3 extension that injects a sidebar into stock contributor portals (Adobe Stock, Shutterstock, Freepik, Vecteezy) and generates AI-powered titles + keywords. It uses a **bring-your-own-key (BYOK)** model with 10 supported AI providers. A Cloudflare Worker backend (`readytag-worker`) handles prompt construction and AI API routing.

**Version:** 2.0.0  
**CWS ID:** `achfpjlldepcapcecadonijoahbdpdfm`  
**Worker URL:** `https://readytagworker.l-lawliet-620.workers.dev`  

---

## 2. Stack Detection

| Dimension | Detected |
|-----------|----------|
| **Runtime** | Browser (Chrome MV3 — service workers + content scripts) + Cloudflare Workers (edge runtime for AI proxy) |
| **Language** | Vanilla JavaScript (ES5/ES6) — **no TypeScript** |
| **Framework** | None. Vanilla DOM manipulation via Shadow DOM. No React/Vue/Svelte. |
| **Build tools** | **None.** No webpack, rollup, babel, or bundler. Extension loads raw `.js` files via `manifest.json`. Worker uses raw ES module in `src/index.js`. |
| **Package manager** | **None.** No `package.json`, `node_modules`, `yarn.lock`, or `package-lock.json` in the extension. Worker has no dependency manifest. |
| **CSS architecture** | CSS custom properties (theme vars in `content.css`), Shadow DOM encapsulation (`mode: "closed"`), `mr-` prefixed BEM-like classes |
| **Config files** | None for the extension. Worker has `wrangler.toml` (`compatibility_date = "2025-01-01"`). |

### Source structure

```
readytag_v2.0_public/     ← Extension source (root)
  manifest.json           ← MV3 manifest
  background.js           ← Service worker (API proxy, tab management)
  content.js              ← Main injected script (panel bootstrap, DOM interaction)
  content.css             ← Panel styling (~1500 lines of CSS custom properties)
  state.js                ← Shared state (selectors, AppState, undo log, badge system)
  api.js                  ← IPC wrapper (chrome.runtime.sendMessage)
  popup.html / popup.js   ← Browser action popup
  onboarding.html / .js   ← First-run onboarding tab
  csv.html / csv.js       ← CSV batch export tab
  strategies/             ← Platform-specific DOM selectors
    adobe.js, shutterstock.js, freepik.js, vecteezy.js
  ui/
    panel.html            ← Sidebar panel HTML template
    panel.js              ← Panel construction and wiring
  core/
    batchManager.js       ← Batch processing pipeline
  icons/

readytag-worker/          ← Cloudflare Worker (separate git repo)
  src/index.js            ← Main worker (prompt logic, AI routing)
  wrangler.toml           ← Worker config
```

---

## 3. Conventions Detected

### Code style
- **`"use strict"`** in every JS file (verified in all 10 `.js` files).
- **camelCase** for variables and functions: `detectStrategy()`, `autoSave()`, `buildPanel()`, `showTab()`.
- **PascalCase** for config/constant objects: `AppState`, `SEL`, `BADGE_CFG`, `PROVIDER_LABELS`, `OB_PROVIDER_META`.
- **UPPER_SNAKE_CASE** for truly constant values: `WORKER_URL`, `PATREON_URL`, `MODAL_TRIGGERS`.
- **Copyright headers** in every file: `// Copyright © 2025–2026 Niloy Pal ...`
- **Inline `const` based module pattern** — no ES module `import`/`export`; objects assigned to global variables (`const adobeStrategy = {...}`) loaded via script order in `manifest.json`.

### Naming
- **Files:** Mostly plain names in lowercase (`content.js`, `state.js`, `popup.html`, `background.js`). `batchManager.js` uses camelCase.
- **HTML IDs:** `mr-` prefix throughout (`mr-panel`, `mr-tab-generate`, `mr-go`, `mr-setting-btn`).
- **CSS classes:** `mr-hidden`, `mr-tab-active`, `mr-dd-menu`, `mr-ob-prov-card` — BEM-like with `mr-` prefix.
- **`content.js` global functions:** `init()`, `wire()`, `showTab()`, `autoSave()`, etc. — all camelCase, defined in the content script scope.

### Import / module style
- **No ES module system.** Extension uses `manifest.json` `"js"` array for load ordering: `state.js` → `api.js` → strategies → `ui/panel.js` → `core/batchManager.js` → `content.js`.
- **Global scope sharing.** Files write to globals (`const adobeStrategy`, `const AppState`, `function ipc()`), later files access them directly.
- **Worker:** ES module (`export default { fetch }`) via wrangler.

### Comment style
- Block sections with `// ──── ... ────` dividers.
- JSDoc-lite: `@param` tags present in some functions but not consistently.
- Strategic `// Task X.Y` comments referencing SDD task numbers (legacy).

---

## 4. Architecture Patterns

### 4.1 State management
- **Simple reactive object pattern:** `AppState` object with `set(updates)` → `render()` cycle (defined in `state.js`).
- **Chrome storage persistence:** `chrome.storage.local.get/set` for all persistent state (settings, keys, asset history, theme, session count).
- **Per-session state:** Global variables for runtime state (`abortFlag`, `isRunning`, `sessionLog`, `entryCounter`, `_shadow`).
- **Undo log:** `undoLog` object persisted to `chrome.storage.local` with 50-entry cap.

### 4.2 IPC pattern
- **Content → Background:** `chrome.runtime.sendMessage` via `ipc()` wrapper in `api.js`.
- **Background → Content:** Not used directly; background responds via `sendResponse`.
- **Message types:** `GENERATE`, `DESCRIBE_IMAGE`, `GET_SETTINGS`, `SAVE_SETTINGS`, `TOP_UP_KEYWORDS`, `OPEN_CSV_TAB`, `TEST_CONNECTION`.
- **Background → Worker:** HTTP `fetch` to Cloudflare Worker with retry wrapper (`fetchWithRetry`, 1 retry on 5xx, handles 429).

### 4.3 Component structure
- **Closed Shadow DOM** (`mode: "closed"`) for CSS isolation. Host `<div id="rt-host">` in real DOM, shadow root contains the panel.
- **HTML template** fetched from `chrome.runtime.getURL("ui/panel.html")`, with `{{ICON_16}}` token replacement.
- **Event wiring** via `wire()` function: inline `onclick` handlers and `addEventListener` for form controls.
- **Tab system:** `showTab()` toggles visibility of `mr-tab-*` panes, driven by `AppState.tab`.

### 4.4 Platform strategy pattern
- **Strategy objects:** Each platform exports a const object (`adobeStrategy`, `shutterstockStrategy`, `freepikStrategy`, `vecteezyStrategy`) with:
  - `name` — platform identifier
  - `hostMatch` — hostname check
  - `sel` — DOM selectors overrides (merged into `SEL` at boot)
  - `getCustomUI()` — optional platform-specific UI HTML
  - Platform-specific methods like `applyTitle()`, `fillKeywords()`, `clickSave()`
- **Detection:** `detectStrategy()` in `content.js` matches `location.hostname`.

### 4.5 Module boundaries
| Module | Responsibility |
|--------|---------------|
| `background.js` | Service worker: API calls to worker, settings storage, tab management |
| `state.js` | Shared selectors (`SEL`), undo log, badge system, `AppState` reactive state, helpers |
| `api.js` | IPC wrapper (`ipc()` function) |
| `content.js` | Panel bootstrap, DOM interaction, pipeline orchestration (100k+ chars) |
| `strategies/*.js` | Platform-specific DOM selectors and interaction logic |
| `ui/panel.js` | Panel construction (`buildPanel()`), DOM wiring (`wire()`) |
| `core/batchManager.js` | Batch processing pipeline |
| `popup.js` | Browser action popup (displays provider/runs info) |
| `onboarding.js` | First-run setup wizard |
| `csv.js` | Standalone CSV batch export page |

### 4.6 Worker architecture
- **Single endpoint** at `src/index.js` with routes: `POST /generate`, `POST /topup`, `POST /describe`.
- **Prompt system** built into worker (not sent from extension) — prompt templates for stock metadata, with category-based overrides (generic, vector, illustration).
- **AI provider routing:** Maps provider name → API endpoint, constructs auth headers, parses response.
- **No TypeScript**, no database, no KV store.

### 4.7 Storage schema
- `chrome.storage.local` keys: API keys (`groqKey`, `openaiKey`, `anthropicKey`, etc.), `provider`, `imageMode`, `outputMode`, `uiTheme`, `sessionCallCount`, `mrSessionLog`, `mrEntryCounter`, `mrAssetHistory`, `mrUndoLog`, `userPresets`, `batchEnabled`, `batchCount`, `batchDelay`, `panelMinimized`, `onboardingDone`, `visualIndicatorEnabled`, `customContext`, `customTone`, `includeWords`, `excludeWords`, `currentPreset`.

---

## 5. Testing Capability

| Criterion | Status |
|-----------|--------|
| Test files (`*.test.*`, `*.spec.*`) | **None found** (0 files) |
| Test directories (`__tests__/`, `__test__/`) | **None found** (0 directories) |
| Test config files (jest, vitest, playwright) | **None found** (0 files) |
| `package.json` with test script | **No `package.json` exists** |
| Test runner installed | **None** |
| Coverage tools | **None** |
| Existing test patterns | **No tests exist** |

### Verdict

There is **zero testing infrastructure** in this project. The extension uses no build tools, no package manager, and no test runner. The Cloudflare Worker also has no test configuration.

---

## 6. TDD Readiness Score

**Score: 0 / 10**

| Factor | Points | Notes |
|--------|--------|-------|
| Test runner installed | 0 | None |
| Single test command | 0 | No `package.json` |
| Existing tests as templates | 0 | None |
| Testable module boundaries | 1 | Strategies are self-contained objects |
| Mock/stub capability | 0 | No framework |
| CI integration | 0 | None |
| Coverage reporting | 0 | None |
| Headless browser support | 0 | Not configured |
| TypeScript types for testing | 0 | No TypeScript |
| Developer test documentation | 0 | None |

### Explanation

The entire extension is vanilla JavaScript loaded by the browser via `manifest.json`. There are no modules, no bundling, no package manager. The code relies on the Chrome runtime (`chrome.storage`, `chrome.runtime.sendMessage`), browser DOM APIs, and script-order globals — all of which require a browser environment to execute. There is no Node.js environment configuration, no test runner, and zero existing tests.

To reach TDD readiness, the minimum viable steps would be:
1. Set up a `package.json` with a test runner (Jest, Vitest)
2. Configure a browser-like environment (Jest with `jsdom`, or Playwright)
3. Shim Chrome API globals (chrome.storage, chrome.runtime)
4. Refactor the codebase into importable modules (ES modules or CommonJS)
5. Write first test for a pure function (e.g., utilities) to establish the pattern

---

## 7. Recommended Next Actions

### Immediate (phase 1 — foundation)
1. **Add `package.json`** with at least `npm test` script. Install Jest or Vitest.
2. **Set up Chrome API mocks** — either `chrome-storage-mock` or a custom shim for `jest.setup.js`.
3. **Refactor pure utilities** out of `state.js`/`content.js` into testable functions (e.g., `escHtml()`, `shouldAbort()`, `validateKey()`, `getCurrentAssetId()`, `sleep()`).
4. **Write first unit tests** for the pure utility functions to establish patterns.
5. **Configure `jsdom`** as the test environment for DOM-adjacent logic.

### Medium (phase 2 — test coverage)
6. **Test platform strategy selectors** — verify that `resolveEl()` works for each strategy's DOM queries.
7. **Test `ipc()` wrapper** — mock `chrome.runtime.sendMessage` and verify error handling.
8. **Test `AppState.set/render`** — verify state changes trigger correct DOM class toggles.
9. **Test `background.js` call routing** — verify message handler dispatches to correct handler.
10. **Test batch pipeline logic** — verify `runSingle()`, `selectGridItem()`, `navigateAsset()`.

### Longer-term (phase 3 — infrastructure)
11. **Add Playwright or Puppeteer** for end-to-end testing (requires loading the unpacked extension).
12. **Set up GitHub Actions** for CI: run unit tests on push, lint on PR.
13. **Add linting** (ESLint) — the codebase has `"use strict"` but no lint config.
14. **Consider TypeScript migration** for type safety, especially in the worker and IPC message shapes.

### Worker-specific
15. **Add worker tests** — Cloudflare Workers have `wrangler dev` and Miniflare for local testing.
16. **Test prompt outputs** — snapshot test generated prompts for known inputs.

---

*Generated by SDD Init phase. This file is the single source of truth for the project's technical baseline and should be updated when the stack or testing infrastructure changes.*
