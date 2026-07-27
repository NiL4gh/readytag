# Architecture — ReadyTag Extension

---

## Script Load Order

```
state.js → api.js → strategies/adobe.js → strategies/shutterstock.js → strategies/freepik.js → strategies/vecteezy.js → content.js
```

All files share one content-script isolated world (no ES modules, no IIFE). Variables declared in earlier files are available in later ones.

---

## File Roles

| File | Role |
|------|------|
| `state.js` | Module-level state + pure helpers. No DOM access except via `id()`/`qsa()`. |
| `api.js` | Single export: `ipc(payload)` — Promise wrapper for `chrome.runtime.sendMessage` |
| `strategies/*.js` | Platform strategy objects (selectors, thumb candidates, image URL patterns) |
| `content.js` | Everything else: panel HTML, all logic, wiring, automation flows |
| `background.js` | Service worker — handles all IPC messages, makes fetch to Cloudflare Worker |
| `popup.html` | Browser action popup — shows provider, call count (inline script OK in popup context) |
| `onboarding.html/js` | Full-tab first-run wizard — saves initial provider + API key |
| `csv.html/js` | Full-tab CSV batch export — reads storage directly, no `ipc()` |

---

## IPC Message Types

All pass through `chrome.runtime.sendMessage` via `ipc()` in `api.js`.

| Type | Payload fields | What background.js does |
|------|---------------|------------------------|
| `GENERATE` | `input, category, provider, keys, customPrompt, style, includeWords, excludeWords, titleLength, kwCount, keywordsOnly, titleOnly` | POST to Worker `/generate` |
| `DESCRIBE_IMAGE` | `imageUrl, provider, keys` | POST to Worker `/describe` |
| `TOP_UP_KEYWORDS` | `existing, need, input, provider, keys` | POST to Worker `/topup` |
| `GET_SETTINGS` | _(none)_ | Returns all of `chrome.storage.local` |
| `SAVE_SETTINGS` | `settings` (object) | Writes to `chrome.storage.local` |
| `OPEN_CSV_TAB` | _(none)_ | Opens `csv.html` in a new Chrome tab |

---

## Data Flow — Single Asset Generation

```
User clicks "Generate & Apply"
  └─ content.js reads title or thumbnail URL
       └─ [if imageMode] ipc(DESCRIBE_IMAGE) → background → Worker /describe → vision model
            → returns { input: "structured description string" }
       └─ ipc(GENERATE) → background → Worker /generate → AI provider
            → returns { title, keywords, kwArray, groqRate, tMin, tLimit, kMin, kLimit }
  └─ content.js: writeTitle() → fillKeywords() → saveAsset()
```

---

## Module-Level State (state.js)

| Variable | Type | Description |
|----------|------|-------------|
| `SEL` | Object | Platform selector map. Overlaid by `currentStrategy.sel` at boot via `Object.assign(SEL, currentStrategy.sel)`. |
| `_shadow` | ShadowRoot\|null | Closed shadow root for the panel. Set by `buildPanel()`. |
| `currentStrategy` | Object\|null | Active platform strategy. Set once by `detectStrategy()`. |
| `undoLog` | Object | `assetId → { origTitle, origKw }`. Persisted to storage, capped at 50 entries. |
| `_lastActiveThumb` | Element\|null | Most recently identified active asset thumbnail. |
| `_thumbFp` | String\|null | Fingerprint of the currently active asset. |
| `visualIndicatorEnabled` | Boolean | Whether grid badges are active. |
| `_badgeState` | Map | Badge status per asset fingerprint. |
| `assetHistory` | Object | Per-asset metadata snapshots (before/after). |
| `_visibleImgs` | Set | Images currently in viewport (IntersectionObserver). |
| `_observedImgSet` | Set | All observed images (for leak prevention). |
| `_badgeIO` | IntersectionObserver | Manages badge visibility. |
| `BADGE_CFG` | Object | `{ done, active, error }` → `{ bg, color, icon }`. |
| `abortFlag` | Boolean | Signals all long-running loops to stop. |
| `isRunning` | Boolean | Concurrency lock — only one automation run at a time. |
| `activeTab` | String | Current tab: `"generate"`, `"history"`, `"csv"`, `"help"`. |
| `sessionLog` | Array | History tab entries. |
| `entryCounter` | Number | Human-readable `#N` counter for log entries. |
| `_logPersistTimer` | Number | Timer ID debouncing sessionLog writes to storage. |
| `imageModeEnabled` | Boolean | Whether vision analysis is active. |
| `_saveToast` | Number | Timer ID for "✓ Saved" notification. |
| `PATREON_URL` | String | `"https://nil4gh.github.io/readytag/"` |
| `MODAL_TRIGGERS` | Array | Call counts at which the Patreon modal is shown: `[10, 30, 80]`. |

**content.js top-level state (CSV tab only):**

| Variable | Description |
|----------|-------------|
| `_csvFiles` | Current file list in the CSV export tab |
| `_csvResults` | Last generated CSV string (available for re-download) |

---

## Base SEL Object (state.js)

Defaults to Adobe Stock selectors. Overlaid by `currentStrategy.sel` at boot.

```javascript
const SEL = {
  titleEditBtn: ['button[data-t="portfolio-detail-panel-title-edit"]', 'textarea[data-t="asset-title-content-tagger"]'],
  kwEditBtn:    ['button[data-t="portfolio-detail-panel-keywords-edit"]', 'textarea[data-t="content-keywords-ui-textarea"]'],
  kwInput:      ['input[data-t="content-keyword"]', 'textarea[data-t="content-keywords-ui-textarea"]'],
  kwRemoveBtn:  ['button[data-t="content-keywords-input-actions-item-icon-remove"]'],
  kwModal:      ['input[data-t="content-keyword"]', 'textarea[data-t="content-keywords-ui-textarea"]'],
  titleInput:   ['.container-table-cell input[type="text"]', '.container-table-cell textarea', ...],
  saveBtn:      ['button.button--action', 'button[class*="button--action"]', 'button[data-t*="save"]'],
  confirmBtn:   ['button[data-variant="accent"]', 'button[class*="accent"]', 'button[data-testid*="confirm"]'],
  okBtn:        ['button.button--dialog', 'button[class*="button--dialog"]', 'button[data-t*="ok"]'],
  saveWorkBtn:  ['button[data-t="save-work"]', 'button[data-t="save"]', '.save-work-button'],
};
```

---

## Key Functions (content.js)

### Initialisation
| Function | Calls | Called by |
|----------|-------|-----------|
| `init()` | `detectStrategy()`, `buildPanel()` | Boot (document_idle) |
| `detectStrategy()` | — | `init()` |
| `buildPanel()` | `checkOnboarding()`, `loadTheme()`, `initDropdowns()`, `startAssetScanner()`, `loadHistory()`, `wire()` | `init()`, MutationObserver rebuild |
| `wire()` | all event listener setup | `buildPanel()` |

### Automation Core
| Function | Role |
|----------|------|
| `startRun()` | Entry point for Generate & Apply — sets `isRunning`, calls `runSingle()` |
| `runSingle()` | Full single-asset pipeline: read input → describe (if image) → generate → writeTitle → fillKeywords → save |
| `fillKeywords()` | Removes existing keywords, fills new ones via `setKwValue()` |
| `setKwValue(input, value)` | Handles the platform-specific keyword entry (type + Enter for chip-based inputs) |
| `raceTitleSave()` | Handles the Adobe title save dialog race condition |
| `handleUndo(targetId, scope)` | Restores origTitle/origKw from undoLog and re-applies |

### Helpers
| Function | Role |
|----------|------|
| `resolveEl(selectorOrArray)` | Finds host-page DOM element from selector list; skips `#mr-panel` |
| `waitForResolved(selectorOrArray, timeout)` | Polling wait for element to become visible |
| `isKwModalOpen()` | Checks if keyword input is visible and not inside the panel |
| `readAssetImageUrl()` | Finds thumbnail URL using `currentStrategy.imageUrlPatterns` |
| `nativeSet(el, value)` | React/Vue controlled-input bypass using `nativeInputValueSetter` + dispatchEvent |
| `isVis(el)` | `offsetWidth > 0 && offsetHeight > 0` — visibility check |
| `readTitle()` | Reads current title from host page via `SEL.titleInput` |

### Navigation
| Function | Role |
|----------|------|
| `navigateAsset(direction)` | Clicks platform-native prev/next button |
| `navigateUploadTile(direction)` | Upload route navigation via `_uploadTileIdx` |
| `doNavigate(direction, force)` | Router: upload route vs portfolio route |

### Strategy Limits
| Strategy | `titleLength` sent | Enforced title range | `kwCount` sent | Enforced kw range |
|---------|------------------|---------------------|----------------|------------------|
| Adobe Recommended | 85 | 65–85 chars | 30 | 15–35 kw |
| SEO Focused (default) | 180 | 90–125 chars | 49 | 35–45 kw |

Top-up loop: runs while `kwArray.length < kwMin`, max 3 attempts (via `TOP_UP_KEYWORDS` IPC).

---

## background.js

MV3 service worker — **shuts down after ~30s of inactivity**. In-memory state is lost on restart.

`sessionCallCount` is persisted to `chrome.storage.local` via `bumpCallCount()` to survive restarts.

`WORKER_URL` constant on line 6: `"https://readytagworker.l-lawliet-620.workers.dev"`

`fetchWithRetry()` — retries once on 5xx errors, surfaces 429 with `Retry-After` to the user.
