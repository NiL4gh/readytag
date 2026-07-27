# Batch & CSV Redesign — Architecture & Design

## 1. SYSTEM ARCHITECTURE OVERVIEW

### Current State

```
panel.html ──► panel.js (buildPanel → load HTML → wire)
                      │
                      ▼
                 content.js (wires tabs, event handlers, runs everything)
                      │
              ┌───────┼───────────┐
              ▼       ▼           ▼
        batchManager.js  state.js   api.js
        (simple abort    (shared     (IPC wrapper)
         flag + loop)     state)
```

- All logic runs in content script (must have DOM access for portfolio selectors)
- No background script involvement in batch processing
- Batch config UI lives in **Generate tab** (panel.html lines 147-209)
- Batch engine is a simple abort-flag sequential loop in `batchManager.js`
- Tab bar in panel.html lines 36-42: 5 tabs (Generate, Customize, Log, CSV ↗, Help)
- Batch toggle + config lives inside Generate tab (not its own tab)

### New Architecture

```
panel.html ──► panel.js (buildPanel → load HTML → wire)
                      │
                      ▼
                 content.js (wires tabs, event handlers)
                      │
              ┌───────┼───────────┬───────────┐
              ▼       ▼           ▼           ▼
        batchManager.js  batchDashboard.js  state.js  api.js
        (state machine,  (renders Batch    (shared    (IPC)
         pause/resume/    tab UI, receives   state)
         retry engine)    progress updates)
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Batch engine location | content.js (via batchManager.js) | Needs DOM access for platform-specific selectors |
| Dashboard rendering | Dedicated `batchDashboard.js` module | Separates rendering from engine logic |
| State management | In-memory Map in batchManager.js | No persistence needed across panel closes |
| Progress updates | Callback pattern: `onProgress(batchState)` | Decouples engine from renderer |
| Pause mechanism | Flag check between iterations | No abort mid-asset — finishes current, breaks before next |
| Tab data | Static in panel.html | No dynamic tab management needed |
| CSV page | Standalone, reads settings via chrome.storage | Independent of panel lifecycle |

---

## 2. COMPONENT INTERACTION

### 2.1 Tab Navigation Flow

```
User clicks tab button (.mr-tab[data-tab])
         │
         ▼
content.js: switchTab(tabId)
         │
         ├── generate → show #mr-tab-generate, hide others
         ├── customize → show #mr-tab-customize, hide others
         ├── batch    → show #mr-tab-batch, hide others
         │               └── call renderBatchDashboard() if first visit
         └── log      → show #mr-tab-history, hide others
```

### 2.2 Batch Processing Flow

```
User configures settings → clicks "Start Batch"
         │
         ▼
content.js: onBatchStart()
         │
         ├── 1. Read config from hidden inputs (count, delay, skipTagged)
         ├── 2. Detect portfolio assets via strategy module
         ├── 3. Build asset queue: [{id, filename, thumbSrc, ...}]
         ├── 4. Call batchManager.run(queue, config, onProgress)
         │
         ▼
batchManager.run():
  for each asset in queue:
    1. Check pause flag → if paused, break
    2. Set asset state = 'processing'
    3. Call onProgress(batchState) → dashboard highlights row
    4. Navigate to asset (click thumbnail)
    5. Wait for asset detail to load
    6. Call runSingle() from content.js
    7. Set asset state = 'done' | 'error'
    8. Call onProgress(batchState) → dashboard updates row
    9. Apply inter-asset delay
         │
         ▼
batchManager completes:
  - onProgress(batchState) with status='complete'
  - Dashboard shows summary
  - "Retry All" enabled if any errors
```

### 2.3 Pause/Resume Flow

```
User clicks Pause
         │
         ▼
batchManager.pause()
  - Sets pause flag = true
  - Current asset finishes normally
  - Before next iteration: checks flag → breaks loop
  - Assets at breakpoint remain 'queued'
         │
         ▼
User clicks Resume
         │
         ▼
batchManager.resume()
  - Clears pause flag
  - Re-enters loop from next queued asset
  - Continues processing
```

### 2.4 Retry Flow

```
User clicks retry (↻) on errored row
         │
         ▼
batchManager.retryAsset(assetId)
  - Resets asset state = 'queued'
  - If engine is idle: starts new run for this asset
  - If engine is paused: inserts at front of queue
  - If engine is running: adds to front of queue
         │
         ▼
User clicks "Retry All"
         │
         ▼
batchManager.retryAll()
  - Resets ALL errored assets = 'queued'
  - Starts new run for all retried assets
```

---

## 3. STATE MODEL

### 3.1 batchState (in memory, batchManager.js)

```js
const batchState = {
  status: 'idle',        // 'idle' | 'running' | 'paused' | 'complete'
  assets: new Map(),      // assetId → AssetState
  currentIndex: -1,       // index of currently processing asset
  config: {
    count: 5,             // max assets to process
    delay: 1000,          // ms between assets
    skipTagged: true,     // skip already-processed
    outputMode: 'both',   // 'both' | 'title' | 'keywords'
  },
  summary: {
    done: 0,
    errors: 0,
    skipped: 0,
    total: 0,
  },
};
```

### 3.2 AssetState (per asset)

```js
{
  id: string,              // unique asset identifier (fingerprint or index)
  filename: string,        // display name
  status: 'queued'         // 'queued' | 'processing' | 'done' | 'error' | 'paused'
       | 'processing'
       | 'done'
       | 'error'
       | 'paused',
  charCount: number|null,  // title char count (null until processed)
  error: string|null,      // error message if status='error'
}
```

### 3.3 Dashboard UI State

The dashboard renderer (`batchDashboard.js`) stores its own lightweight UI state to avoid re-reading the DOM:

```js
{
  isRendered: false,        // has the dashboard been rendered?
  isConfigOpen: true,       // is config section expanded?
}
```

---

## 4. FILE-BY-FILE CHANGES

### 4.1 ui/panel.html — Tab layout + Batch pane + Help button

**Changes:**

1. **Header** (line 21-32): Add `#mr-help-btn` after `#mr-theme-toggle`:
```html
<button id="mr-help-btn" title="Help">?</button>
```

2. **Tab bar** (lines 36-42): Replace 5 tabs with 4:
```html
<div id="mr-tabs">
  <button class="mr-tab mr-tab-active" data-tab="generate">Generate</button>
  <button class="mr-tab" data-tab="customize">Customize</button>
  <button class="mr-tab" data-tab="batch">Batch</button>
  <button class="mr-tab" data-tab="history">Log</button>
</div>
```

3. **Batch config** (lines 147-209): Remove the batch config section from Generate tab (`#mr-batch-config` block). This becomes the collapsible config section in Batch tab.

4. **Add `#mr-tab-batch` pane** (BETWEEN Generate and History tabs, after line 240):
```html
<!-- ── BATCH TAB ── -->
<div id="mr-tab-batch" class="mr-tab-pane mr-hidden">
  <div class="mr-tab-toolbar">
    <span class="mr-tab-title">Batch</span>
  </div>
  <!-- Dashboard rendered dynamically by batchDashboard.js -->
  <div id="mr-batch-dashboard"></div>
</div>
```

5. **Remove** `#mr-tab-help` (lines 375-443) — its content moves to the help slide-over.

6. **Add Help slide-over** (similar pattern to `#mr-settings-pane`):
```html
<!-- ── HELP SLIDE-OVER ── -->
<div id="mr-help-pane" class="mr-slide-over mr-hidden">
  ...help content from old Help tab...
</div>
```

### 4.2 ui/panel.js — Wire Help button

**No changes needed for tab switching** — the existing tab switching code in content.js handles the new tab data attributes.

**But:** `wire()` function must be updated to:
- Add click handler for `#mr-help-btn` (toggle help slide-over)
- Close help slide-over on `✕` click or outside click (same pattern as settings pane)

### 4.3 core/batchManager.js — Rewrite

**Full rewrite needed.** Replace the current simple abort-flag loop with:

```js
(function() {
  const state = {
    status: 'idle',
    assets: new Map(),
    currentIndex: -1,
    config: { count: 5, delay: 1000, skipTagged: true },
    summary: { done: 0, errors: 0, skipped: 0, total: 0 },
  };
  
  let _pauseFlag = false;
  let _abortFlag = false;
  let _onProgress = null;
  let _pendingRetries = [];  // asset IDs queued for retry

  async function run(queue, config, onProgress) { /* ... */ }
  function pause() { /* ... */ }
  function resume() { /* ... */ }
  function stop() { /* ... */ }
  function retryAsset(assetId) { /* ... */ }
  function retryAll() { /* ... */ }
  function getState() { /* ... */ }
  
  window.batchManager = { run, pause, resume, stop, retryAsset, retryAll, getState };
})();
```

**Implementation details:**

- **`run(queue, config, onProgress)`**: 
  - Initialize state from queue + config
  - Set status = 'running'
  - Call `onProgress(batchState)` 
  - Loop through assets
  - Before each iteration: check `_pauseFlag`, `_abortFlag`, `_pendingRetries`
  - Each iteration: update asset state, call content.js `navigateAsset()` + `runSingle()` via exposed globals
  - After each: call `onProgress(batchState)`, apply delay
  - On complete: set status = 'complete', call final `onProgress()`

- **`pause()`**: Set `_pauseFlag = true`. Returns immediately. Engine checks flag before next iteration.

- **`resume()`**: Set `_pauseFlag = false`. If engine is paused, re-enters loop.

- **`stop()`**: Set `_abortFlag = true`. Resets all non-done assets to initial state. Engine checks flag before next iteration.

- **`retryAsset(assetId)`**: Reset asset state = 'queued'. If engine is idle/paused, push to front of queue and trigger resume logic.

- **`retryAll()`**: Same for all errored assets.

### 4.4 content.js — Wire Batch tab + remove CSV/Help tab handlers

**Changes needed:**

1. **Import/wire `batchDashboard.js`** — add rendering call
2. **Update `wireTabs()`** — remove CSV/Help handlers, add Batch handler
3. **Wire `wireBatchTab()`** — rewrite to render dashboard instead of toggle
4. **Remove** the old batch config wiring (count/delay dropdowns from Generate tab)
5. **Add** Help button handler in `wire()` function
6. **Expose** `navigateAsset()`, `runSingle()`, `findActiveThumb()` etc. as globals for the batch engine to call

**Tab wiring changes:**
```js
// OLD
tabHandlers.csv = () => chrome.tabs.create({ url: chrome.runtime.getURL('csv.html') });
tabHandlers.help = () => showHelpTab();

// NEW  
tabHandlers.batch = () => renderBatchDashboard();
// CSV: only via button click in Batch tab footer
// Help: only via header icon click
```

**`wireBatchTab()` rewrite** — from wiring toggle controls to rendering dashboard:
```js
function wireBatchTab() {
  const dashboard = id('mr-batch-dashboard');
  if (!dashboard || dashboard.dataset.wired) return;
  dashboard.dataset.wired = 'true';
  
  batchDashboard.render(dashboard, {
    onStart: handleBatchStart,
    onPause: () => batchManager.pause(),
    onResume: () => batchManager.resume(),
    onStop: () => batchManager.stop(),
    onRetryAsset: (id) => batchManager.retryAsset(id),
    onRetryAll: () => batchManager.retryAll(),
    onCsvExport: () => chrome.tabs.create({ url: chrome.runtime.getURL('csv.html') }),
  });
}
```

### 4.5 core/batchDashboard.js — NEW file

Renders the Batch tab HTML and manages dashboard DOM updates.

```js
// batchDashboard.js
(function() {
  function render(container, callbacks) {
    container.innerHTML = `
      <div id="mr-batch-config" class="mr-collapse">
        <div class="mr-collapse-hdr">⚙ Batch Config <span class="mr-collapse-arrow">▼</span></div>
        <div class="mr-collapse-body">
          ... count dropdown, delay dropdown, skip-tagged toggle, strategy ...
        </div>
      </div>
      <div id="mr-batch-status">
        <div class="mr-batch-status-bar">
          <span>Batch Progress</span>
          <span id="mr-batch-progress-text">0 / 0 assets</span>
        </div>
        <div class="mr-progress-track">
          <div id="mr-batch-progress-fill" class="mr-progress-fill" style="width:0%"></div>
        </div>
      </div>
      <div id="mr-batch-controls">
        <button id="mr-batch-pause-btn" class="mr-btn-primary">⏸ Pause</button>
        <button id="mr-batch-stop-btn" class="mr-btn-stop">■ Stop</button>
      </div>
      <div id="mr-batch-table">
        <div class="mr-batch-table-hdr">
          <span>#</span><span>Asset</span><span>Ch</span><span></span>
        </div>
        <div id="mr-batch-table-body"></div>
      </div>
      <div id="mr-batch-summary"></div>
      <div id="mr-batch-footer">
        <button id="mr-batch-csv-btn" class="mr-btn-ghost">📥 CSV Export</button>
        <button id="mr-batch-retry-all-btn" class="mr-btn-ghost">⟲ Retry All</button>
      </div>
    `;
    wireCallbacks(container, callbacks);
  }
  
  function updateProgress(state) { /* update DOM from batchState */ }
  function highlightRow(index) { /* accent background on active row */ }
  function updateSummary(summary) { /* update counts */ }
  
  window.batchDashboard = { render, updateProgress };
})();
```

### 4.6 state.js — Add batchState reference

Expose the batch state object so other components can read it:

```js
// Add to state.js
window.batchState = null; // set by batchManager during run
```

### 4.7 csv.html — Full redesign

- Replace inline CSS variables with design-system values
- Add dark mode support via `.mr-dark` class
- Add missing controls (title strategy, keyword count, output mode, custom tone, context, include/exclude)
- Add pause/resume/retry UI
- Add per-file progress table
- Keep the standalone web app feel (spacious, 14px radius cards, 20px padding)

### 4.8 csv.js — Rewrite for feature parity

- Add strategy dropdowns (title, keywords, output mode)
- Add custom tone, context, include/exclude inputs
- Add dark mode init (read from chrome.storage)
- Add per-file processing with state tracking
- Add pause/resume/retry controls
- Keep existing: file drop zone, CSV generation, download

---

## 5. HELP SLIDE-OVER DESIGN

**Pattern**: Same as `#mr-settings-pane` — an absolute-positioned panel that slides in from the right, z-index above tab content.

```html
<div id="mr-help-pane" class="mr-slide-over mr-hidden">
  <div class="mr-slide-over-hdr">
    <span class="mr-slide-over-title">Help</span>
    <button id="mr-help-close">✕</button>
  </div>
  <div class="mr-slide-over-body">
    <!-- Same content as current Help tab, minus the version/FAQ -->
  </div>
</div>
```

**CSS behavior**: Same as settings pane — toggle `.mr-hidden`, transitions, outside-click-to-close.

---

## 6. CSV PAGE ARCHITECTURE

### 6.1 Dark Mode

```js
// csv.js init
chrome.storage.sync.get('theme', ({ theme }) => {
  if (theme === 'dark') document.body.classList.add('mr-dark');
});
// CSS variables switch via .mr-dark on body
```

### 6.2 Processing Pipeline

```js
// csv.js
async function runBatch() {
  const files = getFiles();
  const state = initFileStates(files);
  let paused = false;
  let abort = false;
  
  showProgress(state);
  
  for (let i = 0; i < files.length; i++) {
    // Check pause/abort flags
    if (abort) break;
    if (paused) { await waitForResume(); }
    
    state.files[i].status = 'processing';
    updateRow(i, state.files[i]);
    
    try {
      const result = await processFile(files[i], getSettings());
      state.files[i].status = 'done';
      state.files[i].result = result;
    } catch (e) {
      state.files[i].status = 'error';
      state.files[i].error = e.message;
    }
    
    updateRow(i, state.files[i]);
    updateProgress(state);
  }
  
  finishBatch(state);
}
```

### 6.3 Generate CSV Output

Same format as current: columns = filename, title, keywords, provider, status, error.

---

## 7. EDGE CASE HANDLING

| Scenario | Behavior |
|----------|----------|
| No assets on page | Dashboard shows "No assets detected" placeholder |
| Tab switch during batch | Batch continues in background. Dashboard updates on return. |
| Panel close during batch | Batch continues (no abort). Re-open to see current progress. |
| Page navigation during batch | Engine detects stale DOM → gracefully errors current asset |
| All assets errored | Summary shows 0 done, N errors. Retry All available. |
| CSV page refresh | In-memory state lost. User must re-select files. |
| No API key configured | Error message shown, no API calls made |
| Non-image files dropped | Filtered out silently (only images accepted) |
| Zero-length file list | Generate button disabled when no files loaded |

---

## 8. REVIEW CHECKPOINTS

Each checkpoint is a code review gate. The reviewer should verify:

| # | Phase | What to Verify |
|---|-------|---------------|
| CP1 | Tab layout | Tab bar renders 4 tabs correctly. Help button in header. CSV opens from Batch footer. Old CSV/Help tabs gone. |
| CP2 | Batch dashboard | All 6 sections render. Config collapses. Asset table scrolls. Status icons match states. |
| CP3 | Batch engine | State machine correct. Pause finishes current asset. Resume picks up. Stop resets. Retry works per-asset and bulk. Progress callback fires. |
| CP4 | Batch integration | Content.js wiring works. Dashboard receives real updates. Batch runs on each platform (Adobe, Shutterstock, Freepik, Vecteezy). |
| CP5 | CSV redesign | All feature controls present. Dark mode works. Per-file progress displayed. Pause/resume/retry work. CSV downloads correctly. |
| CP6 | Regression | Generate tab unchanged. Customize tab unchanged. Log unchanged. Settings unchanged. Single-asset processing unchanged. |

---

## 9. IMPLEMENTATION ORDER

```
Phase 1: Foundation (CP1)
  1.1 Update panel.html — tab bar, header help button, Batch tab pane
  1.2 Update panel.js — wire help button
  1.3 Update content.js — tab wiring, remove CSV/Help handlers

Phase 2: Batch Dashboard (CP2)
  2.1 Create batchDashboard.js — render dashboard HTML + wire controls
  2.2 Update content.js — wireBatchTab() renders dashboard

Phase 3: Batch Engine (CP3)
  3.1 Rewrite batchManager.js — state machine, pause/resume/stop/retry
  3.2 Wire engine to dashboard via onProgress callback

Phase 4: Integration (CP4)
  4.1 Connect batch engine to platform detection (strategies/)
  4.2 Test on all 4 platforms

Phase 5: CSV Redesign (CP5)
  5.1 Rewrite csv.html — new layout + dark mode
  5.2 Rewrite csv.js — feature parity + pause/resume/retry

Phase 6: Regression (CP6)
  6.1 Test single-asset flow
  6.2 Test Customize tab
  6.3 Test Log/history
  6.4 Test settings
```

---

## 10. FILES NOT CHANGED

| File | Reason |
|------|--------|
| `background.js` | No IPC changes needed |
| `api.js` | No new IPC messages |
| `strategies/*.js` | Platform selectors unchanged |
| `content.css` | Uses existing CSS variables only |

---

*Design v1.0 — For implementation by sdd-apply agent*
