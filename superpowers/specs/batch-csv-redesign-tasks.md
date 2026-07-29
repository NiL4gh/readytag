# Batch & CSV Redesign — Implementation Plan

## Overview

21 implementation tasks organized into 6 phases. Each phase ends with a **review checkpoint (CP)**. Estimated: 350-500 lines of new/changed JavaScript, ~200 lines of HTML changes.

---

## PHASE 1: FOUNDATION — Tab Layout & Navigation

### 1.1 Update panel.html — Tab bar

**File:** `ui/panel.html`

**Changes:**
1. Remove `.mr-tab[data-tab="csv"]` and `.mr-tab[data-tab="help"]` from `#mr-tabs`
2. Add `.mr-tab[data-tab="batch"]` between Customize and Log
3. Order: Generate | Customize | Batch | Log

**Verify:** Tab bar renders 4 tabs. No CSV or Help tabs visible.

---

### 1.2 Update panel.html — Add Help button to header

**File:** `ui/panel.html`

**Changes:**
1. Add `<button id="mr-help-btn" title="Help">?</button>` in `#mr-header-right` between `#mr-theme-toggle` and `#mr-min`
2. Style consistently with settings/theme buttons (same padding, hover state)

**Verify:** Header shows `?` button next to Settings gear and Theme toggle.

---

### 1.3 Update panel.html — Add Batch tab pane

**File:** `ui/panel.html`

**Changes:**
1. Add `<div id="mr-tab-batch" class="mr-tab-pane mr-hidden">` container
2. Inside: toolbar with "Batch" title + `<div id="mr-batch-dashboard"></div>` (rendered dynamically)
3. Place the new pane between Generate and Customize panes

**Verify:** Batch tab pane exists with mr-hidden class.

---

### 1.4 Update panel.html — Remove old batch config from Generate tab

**File:** `ui/panel.html`

**Changes:**
1. Remove the entire `#mr-batch-config` block (lines 147-209) from the Generate tab
2. The `#mr-go` button and `#mr-batch-stop-btn` remain in Generate tab for single-asset processing
3. Remove `#mr-batch-stop-btn` from Generate tab (moves to Batch tab)

**Verify:** Generate tab no longer shows batch toggle/config. Single-asset "Generate & Apply" still works.

---

### 1.5 Update panel.html — Create Help slide-over

**File:** `ui/panel.html`

**Changes:**
1. Add `<div id="mr-help-pane" class="mr-slide-over mr-hidden">` after `#mr-tab-batch`
2. Structure: header (title + close button) + body with help content from old Help tab
3. Content: "What's New" section, Quick Start guide, Platform dashboard links
4. Remove old `#mr-tab-help` block (lines 375-443)

**Verify:** Help slide-over renders with same content as old Help tab. Open/close works.

---

### 1.6 Update panel.js — Wire Help button

**File:** `ui/panel.js`

**Changes:**
1. Add click handler for `#mr-help-btn`: toggle `#mr-help-pane` visibility
2. Add close handler for `#mr-help-close`
3. Add outside-click-to-close behavior (same pattern as settings pane)
4. Export CSS for `.mr-slide-over` if not already defined

**Verify:** Clicking `?` opens help slide-over. `✕` closes it. Clicking outside closes it.

---

### 1.7 Update content.js — Tab wiring

**File:** `content.js` (around line 680+, the `wireBatchTab()` call site)

**Changes:**
1. Update `wireTabs()` or the tab-switching logic: remove CSV/Help tab handlers
2. Add batch tab handler: `data-tab="batch"` → switch to `#mr-tab-batch`
3. Ensure batch tab pane shows/hides correctly when switching tabs
4. Remove the old `wireBatchTab()` call from the Generate tab init

**Verify:** Clicking Batch tab shows the batch pane. CSV/Help tabs no longer exist. Tab switching works correctly.

---

### ✅ REVIEW CHECKPOINT 1 — Tab Layout

Verify:
- [ ] Tab bar shows exactly 4 tabs: Generate, Customize, Batch, Log
- [ ] Help button (?) visible in header
- [ ] Help slide-over opens/closes correctly
- [ ] Clicking Batch tab switches to batch pane
- [ ] Generate tab has no batch toggle/config
- [ ] Customize tab unchanged
- [ ] Log tab unchanged

---

## PHASE 2: BATCH DASHBOARD UI

### 2.1 Create batchDashboard.js — Render function

**File:** `batchDashboard.js` (new file in `core/`)

**Changes:**
1. Create `batchDashboard.render(container, callbacks)` function
2. Generate inner HTML:
   - Collapsible config section (asset count, delay, skip tagged, strategy)
   - Status bar (progress bar + "X / Y assets" text)
   - Control buttons (Pause, Stop)
   - Asset table (header + body container)
   - Summary row
   - Footer (CSV Export, Retry All)
3. Wire button click handlers to callbacks
4. Export via `window.batchDashboard`

**Verify:** Calling `batchDashboard.render()` populates the container with all dashboard sections.

---

### 2.2 batchDashboard.js — Progress update function

**File:** `batchDashboard.js`

**Changes:**
1. Create `batchDashboard.updateProgress(batchState)` function
2. Update progress bar width = `(summary.done / summary.total) * 100%`
3. Update progress text: `"X / Y assets"`
4. Clear and rebuild asset table rows from `batchState.assets`
5. Highlight active row with accent color
6. Update summary counts: done, active, queued, errors
7. Each row includes: index, filename (truncated), char count, status icon + retry icon (if errored)

**Verify:** Calling `updateProgress()` with test data correctly updates all DOM elements.

---

### 2.3 batchDashboard.js — Config persistence

**File:** `batchDashboard.js`

**Changes:**
1. On dashboard render: load saved config from `chrome.storage.local`
2. Wire dropdown changes to `autoSave()` for persistence
3. Wire collapsible toggle to save open/closed preference

**Verify:** Changing config in dashboard persists across panel reopen.

---

### 2.4 Update content.js — Wire dashboard

**File:** `content.js`

**Changes:**
1. In `wireBatchTab()` (or equivalent): call `batchDashboard.render()` on `#mr-batch-dashboard`
2. Pass callbacks to render: onStart, onPause, onResume, onStop, onRetryAsset, onRetryAll, onCsvExport
3. Ensure dashboard wires only once (use a `data-wired` flag)

**Verify:** Opening Batch tab renders the dashboard. All buttons are clickable.

---

### ✅ REVIEW CHECKPOINT 2 — Batch Dashboard

Verify:
- [ ] Dashboard renders with all 6 sections
- [ ] Config section collapsible
- [ ] Config loads saved values from storage
- [ ] Asset table renders correctly
- [ ] Progress bar updates visually
- [ ] Summary counts display correctly
- [ ] CSV Export button opens csv.html in new tab

---

## PHASE 3: BATCH ENGINE

### 3.1 Rewrite batchManager.js — State + init

**File:** `core/batchManager.js`

**Changes:**
1. Create `batchState` object with status, assets Map, currentIndex, config, summary
2. Create `initState(queue, config)` function
3. Create `getState()` accessor
4. Export `window.batchManager = { initState, getState, ... }`

**Verify:** Creating a queue and calling initState populates the state correctly.

---

### 3.2 batchManager.js — Run loop

**File:** `core/batchManager.js`

**Changes:**
1. Create `async run(queue, config, onProgress)` function
2. Initialize state from queue + config
3. Loop through assets:
   - Check `_pauseFlag`, `_abortFlag`
   - Set asset state = 'processing'
   - Call content.js functions: `navigateAsset()`, `runSingle()`
   - On success: state = 'done', on error: state = 'error'
   - Call `onProgress(batchState)` after each
   - Apply inter-asset delay
4. On complete: set status = 'complete', call final `onProgress()`

**Verify:** Running with a test queue processes all assets sequentially. Progress fires for each.

---

### 3.3 batchManager.js — Pause/Resume/Stop

**File:** `core/batchManager.js`

**Changes:**
1. `pause()`: set `_pauseFlag = true`. Engine finishes current asset, checks flag, breaks loop.
2. `resume()`: set `_pauseFlag = false`. Re-enter loop.
3. `stop()`: set `_abortFlag = true`. Engine breaks loop. Reset non-done assets.

**Verify:**
- Pause: current asset finishes, engine stops before next
- Resume: processing continues from next queued asset
- Stop: engine halts, queue resets, done assets stay done

---

### 3.4 batchManager.js — Retry

**File:** `core/batchManager.js`

**Changes:**
1. `retryAsset(assetId)`: reset asset to 'queued'. If idle, start new mini-run. If running, insert at front.
2. `retryAll()`: same for all errored assets.
3. Handle case where engine is paused + retry → resume automatically.

**Verify:**
- Single retry: errored asset re-processes correctly
- Retry All: all errors re-process
- Retry during active batch: retried asset processed next

---

### 3.5 Wire engine to dashboard

**File:** `content.js` + `batchDashboard.js`

**Changes:**
1. Pass `batchManager.run()` as the onStart callback in `wireBatchTab()`
2. In `onProgress`: call `batchDashboard.updateProgress(batchState)`
3. Wire Pause/Stop buttons to `batchManager.pause()/stop()`
4. Wire Retry buttons to `batchManager.retryAsset()/retryAll()`
5. Wire Resume button (appears after pause)

**Verify:** Starting a batch from the dashboard shows real-time progress. Pause/Stop/Retry all work end-to-end.

---

### ✅ REVIEW CHECKPOINT 3 — Batch Engine

Verify:
- [ ] State machine transitions correctly (queued→processing→done/error)
- [ ] Pause: finishes current asset, stops before next
- [ ] Resume: continues from correct asset
- [ ] Stop: halts and resets queue
- [ ] Retry single: re-processes one errored asset
- [ ] Retry All: re-processes all errors
- [ ] Progress callback fires after each asset
- [ ] Engine doesn't crash on individual asset errors

---

## PHASE 4: INTEGRATION

### 4.1 Connect to platform asset detection

**File:** `batchManager.js` + `content.js`

**Changes:**
1. Batch engine reads asset list from platform strategy (same `resolveGridThumbs()` that current batch uses)
2. Build queue from detected thumbnails
3. Use existing `findActiveThumb()`, `navigateAsset()`, `extractThumbFingerprint()` for navigation
4. Use existing `assetHistory` for skip-tagged check

**Verify:** Batch detects correct assets on each platform's portfolio page.

---

### 4.2 Cross-platform testing

**Test on each platform:**
1. Adobe Stock contributor dashboard
2. Shutterstock submit dashboard
3. Freepik contributor dashboard
4. Vecteezy contributor dashboard

For each: verify asset detection, sequential processing, pause/resume, retry.

---

### ✅ REVIEW CHECKPOINT 4 — Integration

Verify:
- [ ] Batch works on Adobe Stock portfolio page
- [ ] Batch works on Shutterstock portfolio page
- [ ] Batch works on Freepik portfolio page
- [ ] Batch works on Vecteezy portfolio page
- [ ] Skip-tagged correctly detects already-processed assets
- [ ] Navigation between assets works on all platforms

---

## PHASE 5: CSV REDESIGN

### 5.1 Rewrite csv.html — Layout

**File:** `csv.html`

**Changes:**
1. Replace inline CSS variables with design-system values (same var names as panel)
2. Add `.mr-dark` class CSS for dark mode (midnight palette)
3. Add missing controls:
   - Title strategy dropdown
   - Keyword count dropdown
   - Output mode segmented toggle
   - Custom tone input
   - Custom context textarea
   - Include words input
   - Exclude words input
4. Keep: Category dropdown, Platform dropdown, Analysis mode toggle
5. Update Platform dropdown to include Freepik + Vecteezy
6. Keep: File drop zone, file list, progress bar, generate button, download button
7. Add: Pause/Resume/Stop controls (shown during processing)
8. Add: Per-file progress table (rows with status icons)
9. Keep: "How it works" section at bottom
10. Keep: Brand footer

**Spacing:** 20px card padding, 14px border-radius, 12-20px font sizes (web app feel).

**Verify:** All controls render. Dark mode works. Layout is spacious.

---

### 5.2 Rewrite csv.js — Feature parity

**File:** `csv.js`

**Changes:**
1. **Dark mode init**: Read `theme` from `chrome.storage.sync`, apply `.mr-dark` to body
2. **Settings init**: Read ALL settings from storage (tone, context, include/exclude, strategies)
3. **Strategy dropdowns**: Wire title strategy, keyword count, output mode to API call
4. **Per-file processing**: Track each file's state (queued/processing/done/error)
5. **Pause/Resume**: Add flag + loop break/continue
6. **Retry**: Per-file retry button → reset file state → re-process
7. **Cost confirmation**: Update to show correct counts based on strategy
8. **API call**: Pass all customization params to `chrome.runtime.sendMessage({ type: "GENERATE", ... })`

**Verify:**
- All customization inputs affect the generated output
- Dark mode switches correctly
- Per-file progress shows status icons
- Pause/Resume/Stop work
- Retry re-processes individual files
- CSV downloads with correct columns

---

### ✅ REVIEW CHECKPOINT 5 — CSV Redesign

Verify:
- [ ] All strategy dropdowns render and work
- [ ] Output mode toggle works (both/title/keywords)
- [ ] Custom tone, context, include/exclude inputs affect output
- [ ] Dark mode works (reads from storage)
- [ ] Per-file progress table shows status icons
- [ ] Pause/Resume/Stop work
- [ ] Retry single file and Retry All work
- [ ] CSV downloads correctly
- [ ] Cost confirmation dialog shows correct counts
- [ ] Drop zone works (drag + click to browse)
- [ ] Non-image files filtered out

---

## PHASE 6: REGRESSION

### 6.1 Test single-asset flow

**Verify:**
- Single "Generate & Apply" works on all 4 platforms
- Working overlay shows steps
- Title and keywords are written correctly
- Undo works
- Navigation (prev/next) still works

---

### 6.2 Test Customize tab

**Verify:**
- All dropdowns present
- Output mode toggle works
- Tone, context, include/exclude inputs save and load
- Presets still work

---

### 6.3 Test Log tab

**Verify:**
- History renders
- CSV export from log works
- Clear log works

---

### 6.4 Test Settings

**Verify:**
- Provider selection works
- API key entry works
- Image mode toggle works
- Background mode toggle works
- Visual indicators toggle works

---

### ✅ REVIEW CHECKPOINT 6 — Regression

Verify:
- [ ] Single-asset generation works on all platforms
- [ ] Customize tab fully functional
- [ ] Log tab shows history
- [ ] Settings pane works
- [ ] No console errors
- [ ] Panel opens/closes correctly
- [ ] Theme toggle works

---

## TASK SUMMARY

| Phase | Tasks | Changes | Review |
|-------|-------|---------|--------|
| 1. Foundation | 7 | panel.html, panel.js, content.js | CP1 |
| 2. Batch Dashboard | 4 | batchDashboard.js (new), content.js | CP2 |
| 3. Batch Engine | 5 | batchManager.js, content.js, batchDashboard.js | CP3 |
| 4. Integration | 2 | batchManager.js, test on 4 platforms | CP4 |
| 5. CSV Redesign | 2 | csv.html, csv.js | CP5 |
| 6. Regression | 4 | Testing all existing features | CP6 |
| **Total** | **21** | **10 files** | **6 checkpoints** |

---

*Plan v1.0 — Ready for review and approval*
