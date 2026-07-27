# Test Infrastructure for ReadyTag v2.0

**Date:** 2026-07-17
**Status:** Design — revised per review [2026-07-17], awaiting final signoff

## Overview

Add automated testing at three layers for the ReadyTag Chrome MV3 extension. Project is ~5,700 lines of vanilla JS with no build step, no npm, no module system. Files load sequentially via manifest `content_scripts` order into an isolated content-script world.

**Approach:** Vitest + jsdom + mocked Chrome APIs. All tests run in Node — no browser required. Extension source files are untouched.

## Motivation

Zero automated testing exists today. All validation is manual (loading extension in Chrome, visiting live contributor portals). This creates risk when:
- Refactoring state.js (used by all content scripts)
- Changing strategy selectors (can break platform detection)
- Adding providers (can break IPC routing)
- Modifying panel UI (can break onboarding or settings)

## Architecture

### Directory Layout

```
ReadyTag/
├── package.json               ← NEW: devDependencies + test scripts only
├── vitest.config.js           ← NEW: jsdom env, global setup, per-tier includes
├── .husky/pre-commit          ← NEW: runs unit + integration tier before commit
├── tests/
│   ├── setup.ts               ← Mock chrome.* APIs, jsdom bootstrap, isolation rules
│   ├── helpers/
│   │   ├── load-scripts.js    ← Sequential loader; reads order from manifest
│   │   ├── panel-fixture.js   ← Contract: buildPanel({ipc, storage, theme}) → accessor
│   │   ├── strategy-fixture.js← Contract: buildHost(strategy, html) → { detect, run }
│   │   └── stub-input.js      ← Synthetic valueTracker + nativeSet for React bypass
│   ├── unit/
│   │   ├── state.test.js      ← Pure helpers, undo log persist/load/LRU, shutdown guard
│   │   └── api.test.js        ← ipc() wrapper + IPC payload shape coverage
│   ├── integration/
│   │   ├── onboarding.test.js ← 5-step wizard flow, back/next navigation
│   │   ├── panel-ui.test.js   ← Shadow DOM creation, tabs, theme, minimize, slide-overs
│   │   ├── settings.test.js   ← autoSave, provider switch, key validation, presets
│   │   ├── generate-flow.test.js ← startRun, working view, IPC pipeline, undo
│   │   ├── batch-mode.test.js ← Batch toggle, loop, counter, pause/stop
│   │   └── csv-export.test.js ← exportCSV, exportLog, clearLog, history rendering
│   └── e2e/
│       └── selectors/         ← Strategy selector tests; see Layer 3 caveat below
│           ├── adobe-selectors.test.js
│           ├── shutterstock-selectors.test.js
│           ├── freepik-selectors.test.js
│           └── vecteezy-selectors.test.js
└── readytag_v2.0_public/      ← UNTOUCHED — no imports added
```

> **Why `tests/e2e/selectors/` and not `tests/e2e/`?** Real E2E needs a real browser. These jsdom tests validate strategy code against a **handwritten fixture** — they prove the strategy parses the expected DOM shape, not that it works on the live portal. Each file's top-of-file comment must restate this scope. Playwright moves in here later (Future Expansion).

> **`tests/unit/undo-log.test.js` was removed.** Undo log is part of `state.js`; tests consolidated into `state.test.js` to avoid duplicate maintenance on the same module.

### Script Loading Strategy

Extension files are loaded into jsdom by reading them and evaluating in correct order:

```
state.js → api.js → strategies/adobe.js → strategies/shutterstock.js →
strategies/freepik.js → strategies/vecteezy.js → ui/panel.js → content.js
```

The order is sourced from `readytag_v2.0_public/manifest.json` `content_scripts[].js` — single source of truth, not hand-maintained in this doc. Evaluation uses `eval()` at global scope to preserve global-variable sharing between files. Strategy files are loaded selectively for tests in `e2e/selectors/` (only the relevant strategy per test).

**Isolation rules (mandatory — prevents cross-test pollution via eval-loaded globals):**

- Each test file calls `vi.resetModules()` in `beforeEach` and re-runs the loader.
- Each `beforeEach` snapshots `_store`, `_calls`, and any other mutable mock state and restores in `afterEach`.
- Production files MUST NOT call `chrome.runtime.sendMessage` at module top level. All IPC must originate from a function call (user click, lifecycle hook, etc.). This is enforced via a small `top-level-sendMessage` lint rule (or an AST check in `setup.ts` if lint rule walls are too high).
- The `_shadow` reference is exposed via `buildPanel()` and is part of the tested public surface — renaming it is a breaking test change (factor into a `getShadow()` accessor if tempting to rename).

### Chrome API Mocks (tests/setup.ts)

In-memory implementations that track calls and let tests control responses:

| API | Mock Behavior | Test Control |
|-----|--------------|-------------|
| `chrome.runtime.sendMessage` | Stores calls, returns mock response | `sendMessage.mockResolvedValue(...)` per test |
| `chrome.runtime.getURL` | Returns `chrome-extension://mock-id/{path}` | Fixed mapping |
| `chrome.runtime.lastError` | Settable per test | Set to simulate IPC failures |
| `chrome.storage.local.get` | Reads from in-memory `_store` | Pre-seed `_store` in setup |
| `chrome.storage.local.set` | Writes to in-memory `_store`, fires onChange | Inspect `_store` after test |
| `chrome.storage.onChanged` | addListener fires on set | Verify listener callbacks |

All mocks reset between tests (store cleared, call history wiped).

### Observer Handling Strategy

Per-tier decision on what jsdom can and cannot simulate reliably:

| Test Layer | MutationObserver | IntersectionObserver | setTimeout / setInterval |
|------------|------------------|----------------------|---------------------------|
| `tests/unit/` | Not used | Not used | `vi.useFakeTimers()` as needed |
| `tests/integration/` | **Mock with `vi.fn()`**; manually invoke callbacks to simulate | **Mock with `vi.fn()`** | `vi.useFakeTimers()` for polling logic |
| `tests/e2e/selectors/` | Mock same as integration | Mock same as integration | Real timers; expect synchronous |

**Deferred to Playwright (not in Phase 1):** any test that depends on **timed** DOM mutations — race save polling, `transitionend` on real DOM updates, watchtower `IntersectionObserver` for active-tile detection, native React `nativeSet()` event sequences.

## Test Layers

### Layer 1 — Unit Tests (Pure Logic, No DOM)

Targets functions that operate on data alone — no DOM access, no Chrome APIs, no MutationObservers.

| Test File | Target Functions | Key Assertions |
|-----------|-----------------|----------------|
| `state.test.js` | `extractThumbFingerprint()` | Returns numeric ID from ftcdn/CDN/cm-images URLs; null/empty URL returns URL itself |
| | `sanitizeTitle()` | Trims whitespace, collapses internal whitespace, caps at 200 chars |
| | `sanitizeKeywords()` | Splits by comma, trims, deduplicates, enforces 1-50 count, handles empty |
| | `undoLog` (in-memory + persist) | LRU cap at 50, overwrite duplicate assetId, clear on visual indicator disable, persistUndoLog/loadUndoLog roundtrip |
| | shutdown guard (`isShutdown`, `rtGuard`) | Functions return undefined after shutdown, intervals cleared |
| | `AppState.set()` / `AppState.render()` | **Tested only if `AppState` is exposed on `globalThis`/`window`; otherwise skip and add a TODO.** |
| `api.test.js` | `ipc()` | Resolves with response on success; rejects on `lastError`; guarded on shutdown |
| | **IPC payload shapes** | **For each IPC type background expects (GENERATE, DESCRIBE_IMAGE, SAVE_SETTINGS, TEST_CONNECTION, GET_STATE, etc.), assert the `{type, payload}` schema the caller sends. Mocks happily round-trip malformed payloads — these tests are the only thing preventing silent payload drift.** |

### Layer 2 — UI Integration Tests (Shadow DOM Panel)

Load `panel.html` into jsdom, execute `buildPanel()` to create the closed shadow root, then interact through `_shadow.querySelector`. All DOM queries use shadow-root-proxied `id()`/`qsa()` or direct `_shadow.querySelector`.

**[Per-test descriptions unchanged from original draft — see history.]**

### Fixture Helper Contracts

Fixing the helper contracts now, before any helpers are written, prevents three months of fixture drift. Each helper owns its full lifecycle.

#### `tests/helpers/panel-fixture.js`

```ts
type PanelFixture = {
  build(options?: {
    storage?: Record<string, any>;       // pre-seed chrome.storage.local
    ipc?: Record<string, any>;            // per-message-type mock responses
    theme?: 'light' | 'dark';             // initial data-theme on #rt-host
    url?: string;                         // initial document.location.href
  }): {
    host: HTMLElement;                    // #rt-host
    shadow: ShadowRoot;                   // closed shadowRoot (via buildPanel handle)
    trigger<T extends Event>(selector: string, event: T): void;
    query(selector: string): Element | null;
    awaitIdle(): Promise<void>;           // flush microtasks + fake timers
    cleanup(): void;                      // remove host, restore document
  };
};
```

#### `tests/helpers/strategy-fixture.js`

```ts
type StrategyFixture = {
  build(strategy: 'adobe' | 'shutterstock' | 'freepik' | 'vecteezy', html: string): {
    detect(): string;                     // returns strategy name from fixture URL
    readTitle(): string | null;
    fillKeywords(kws: string[]): void;
    extras?: Record<string, (...args: any[]) => void>;   // applyXxxExtras per platform
    runSingle(input: { image?: Blob }): Promise<{ title: string; keywords: string[] }>;
    cleanup(): void;
  };
};
```

Helpers MUST NOT share state across test files. Each fixture returns a fresh instance and a `cleanup()` the test calls in `afterEach` (the framework will also call it on `process.on('exit')` as a backstop).

### Layer 3 — Strategy Selector Tests (NOT live-portal E2E)

> **Scope statement (mandatory top-of-file comment in every file in `tests/e2e/selectors/`):**
>
> ```
> // SCOPE: This test validates the strategy code against a HANDWRITTEN FIXTURE.
> // It does NOT validate that ReadyTag works on the live contributor portal.
> // Live-portal validation requires Playwright (see Future Expansion in design).
> // When the live portal ships a DOM change, the fixture becomes stale; update
> // the fixture here, then verify via Playwright before trusting this test.
> ```

Each test creates a jsdom document with a minimal host-page DOM containing platform-specific elements (thumbnails, inputs, dialogs). The strategy file + content.js are loaded into this DOM.

**Common setup per strategy test:**
1. Set `document.location.href` to platform URL
2. Inject minimal DOM fixture
3. Load strategy file + content.js via eval
4. Call `detectStrategy()` → `buildPanel()`

**[Per-strategy assertion lists unchanged from original draft — see history.]**

### Strategy Fixture Pattern (Adobe example)

```js
document.body.innerHTML = `
  <div class="asset-grid">
    <div class="upload-tile__thumbnail" data-asset-id="1234567" aria-current="page">
      <img src="https://as2.ftcdn.net/v2/jpg/01/23/45/67/1000_F_1234567_abc.jpg" class="content-thumbnail__img">
    </div>
  </div>
  <div class="title-area">
    <span id="title">Sunset Over Mountains</span>
    <button class="spectrum-Button spectrum-Button--primary" title="Edit title">Edit</button>
  </div>
  <div class="keywords-panel">
    <div class="keyword-chip">mountain<span class="mr-tag-remove">x</span></div>
    <div class="keyword-chip">sunset<span class="mr-tag-remove">x</span></div>
    <input class="chip-input" placeholder="Add keyword">
  </div>
  <button class="spectrum-Button spectrum-Button--cta" title="Save">Save</button>
`;
```

## Non-Goals (for this phase)

- **No background.js tests** — service worker tested indirectly through mocked IPC responses
- **No csv.js tests** — CSV tab runs as separate page; deferred
- **No popup.js tests** — simple 57-line display page; low risk
- **No onboarding.js page tests** — full-tab page; deferred
- **No real-browser E2E in Phase 1** — jsdom only; Playwright added later
- **No visual/theme CSS tests** — CSS regression testing not in scope
- **No CI integration in Phase 1** — but a local **pre-commit hook (`.husky/pre-commit`) IS in scope**: runs `vitest run tests/unit tests/integration --bail=1` on staged files. Catches break-on-save locally before manual run is forgotten. Strategy selectors tier is manual (`npm run test:selectors`) — too slow for pre-commit.

## Future Expansion

- Playwright E2E: Real Chrome with unpacked extension for MutationObserver timing, `nativeSet()` React/Vue bypass, and live portal validation
- Worker unit tests: The Cloudflare Worker (`readytag-worker/`) has its own repo; test separately
- CI: GitHub Actions running `npm test` on push (pre-commit catches locally first; CI catches branch-protection violations)
- TypeScript type checking: Add typed interfaces for IPC messages to prevent payload shape drift (the `APIPayload` table from `api.test.js` becomes a typed contract)

## Dependencies

**package.json (pinned versions — drift between jsdom/vitest minors can break observer mocking):**

```json
{
  "name": "readytag-tests",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:selectors": "vitest run tests/e2e/selectors",
    "test:fast": "vitest run tests/unit tests/integration --bail=1",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "vitest": "2.1.9",
    "jsdom": "25.0.1"
  }
}
```

No runtime dependencies. Extension remains zero-dependency vanilla JS.

**Why no `@testing-library/dom`:** direct `_shadow.querySelector` is clearer for closed shadow roots + known selector IDs. Revisit if queries grow user-centric (e.g., "find submit by label").

**Why no `husky`:** use Git's native `core.hooksPath` set once via `git config core.hooksPath .husky`. No npm dep needed for what is effectively a 5-line shell script.

**`.husky/pre-commit`** — raw shell, no husky dep:

```sh
#!/usr/bin/env sh
npx vitest run tests/unit tests/integration --bail=1
```

**`bin/init-hooks.sh`** — one-shot setup (runs `git config core.hooksPath .husky`):

```sh
#!/usr/bin/env sh
git config core.hooksPath .husky
echo "Pre-commit hook installed. Test runs scoped to unit + integration fast tier."
```

## Risks

| Risk | Mitigation |
|------|-----------|
| `eval()` loading can't replicate content-script isolation | Load into global scope; isolation rules (above) prevent cross-test pollution; `vi.resetModules()` per test |
| Shadow DOM is closed — tests depend on `_shadow` variable name | `_shadow` is part of the tested public surface by convention; future rename requires updating `getShadow()` accessor; heavy refs go through the fixture helper's `.query()` so tests don't touch `_shadow` directly |
| `MutationObserver` / `IntersectionObserver` not available in jsdom | Per-tier decision table above; defer timing-sensitive tests to Playwright |
| Strategy fixture may drift from live platform DOM | Scope statement at top of every selector test file; Playwright revalidation cadence before each release |
| `nativeSet()` React bypass can't be fully simulated | Mock `_valueTracker` on input element via `tests/helpers/stub-input.js`; verify event dispatch sequence in tests that need it |
| Pre-commit hook slows commits | Tier-scoped: only unit + integration (3-5s typical); selector tier manual |
| `core.hooksPath` setup is a doc-only step (not enforced) | Add a one-shot `bin/init-hooks.sh` that calls `git config core.hooksPath .husky`; document in `TESTING.md` |
