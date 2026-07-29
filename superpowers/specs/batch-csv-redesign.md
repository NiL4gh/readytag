# Batch Mode & CSV Export — UX Redesign

## OVERVIEW

Full UX redesign of ReadyTag's batch processing system. Grid batch (in-portfolio) and CSV batch export (standalone) get a live dashboard, per-asset progress tracking, pause/resume/retry, and feature parity with the main panel.

### Design Decisions (from brainstorming)

| Decision | Value |
|----------|-------|
| Tab layout | Generate \| Customize \| Batch \| Log (4 tabs, down from 5) |
| CSV entry | Button inside Batch tab, not a separate tab |
| Help | Moved to `?` icon in panel header |
| Customize tab | Kept as-is |
| Batch scope | Full UX redesign (Option B) — live table, per-asset status |
| CSV scope | Full feature parity (Option A) — same customization as panel |
| CSV visual | Standalone web app feel, not panel density |

---

## 1. TAB LAYOUT CHANGES

### Tab Bar

```
┌──────────┬──────────┬──────────┬──────────┐
│ Generate │ Customize│  Batch   │   Log    │
└──────────┴──────────┴──────────┴──────────┘
```

**Removed:** `CSV ↗` tab, `Help` tab
**Added:** `Batch` tab (replaces old batch toggle in Generate tab)

### Header Icons

```
┌──────────────────────────────────────────────────┐
│ ReadyTag logo    [?] [⚙] [☀]    [—]             │
└──────────────────────────────────────────────────┘
```

- `?` — opens Help slide-over (same pattern as Settings slide-over)
- `⚙` — Settings slide-over (unchanged)
- `☀` — Dark/light theme toggle (unchanged)

### Tab IDs (panel.html)

- `.mr-tab[data-tab="batch"]` — new
- `.mr-tab[data-tab="csv"]` — removed
- `.mr-tab[data-tab="help"]` — removed

### Tab Handlers (content.js `wireTabs()`)

```js
// REMOVED
tabHandlers.csv = () => chrome.tabs.create({ url: chrome.runtime.getURL('csv.html') });
tabHandlers.help = () => showHelpSlideOver();

// ADDED
tabHandlers.batch = () => showBatchTab();
// Help now handled by header icon click
```

---

## 2. HELP IN HEADER

- Add `#mr-help-btn` button to `#mr-header` alongside `#mr-settings-btn` and `#mr-theme-toggle`
- Click opens a slide-over panel (same CSS/structure as `#mr-settings-pane`)
- Contains: keyboard shortcuts, platform info, version, link to docs/changelog
- Close via `✕` button or clicking outside

---

## 3. BATCH DASHBOARD UI

### Structure (inside `#mr-tab-batch`)

```
┌─────────────────────────────────────┐
│ ⚙ Batch Config  (collapsible)       │
│  ┌────────────────────────────────┐  │
│  │ Assets: [5]  Delay: [500ms]    │  │
│  │ Skip tagged: [✓]  Strategy..   │  │
│  └────────────────────────────────┘  │
│                                      │
│ ┌─── Batch Progress ───────────────┐ │
│ │ 3 / 5 assets      [████████░░ 60%]│ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌── [⏸ Pause] ── [■ Stop] ────────┐ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌─── Asset Queue ──────────────────┐ │
│ │ #  Asset              Ch  Status │ │
│ │ 1  mountain_landscape  85  ✓     │ │
│ │ 2  abstract_vector     92  ✓     │ │
│ │ 3  portrait_photo.jpg  ⟳  ⟳     │ │ ← active row
│ │ 4  food_photography    —   ⏳    │ │
│ │ 5  city_skyline        —   ⏳    │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ✓ 2 done  ⟳ 1 active  ⏳ 2 queued    │
│                                      │
│ ┌── [📥 CSV Export]  [⟲ Retry All] ┐│
│ └──────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Status Icons

| Icon | State | CSS Color |
|------|-------|-----------|
| ⏳ | queued | `--muted` |
| ⟳ | processing | `--accent` |
| ✓ | done | `--green` |
| ✕ | error | `--red` |
| ⏸ | paused | `--yellow` |

### Components (new IDs in panel.html)

- `#mr-batch-config` — collapsible config section
- `#mr-batch-status` — progress bar + count
- `#mr-batch-pause` / `#mr-batch-stop` — control buttons
- `#mr-batch-table` — asset table container
- `#mr-batch-summary` — status count row
- `#mr-batch-csv-btn` — opens csv.html in new tab
- `#mr-batch-retry-all` — retry all errored assets

---

## 4. BATCH ENGINE ARCHITECTURE

### State Machine (per-asset)

```
⏳ queued → ⟳ processing → ✓ done
⏳ queued → ⟳ processing → ✕ error → [retry] → ⟳ processing
⏳ queued → ⏸ paused → [resume] → ⟳ processing
```

### State Store (core/batchManager.js)

```js
const batchState = {
  status: 'idle' | 'running' | 'paused' | 'complete',
  assets: Map<assetId, {
    filename: string,
    status: 'queued' | 'processing' | 'done' | 'error' | 'paused',
    charCount: number | null,
    error?: string
  }>,
  currentIndex: number,
  config: {
    count: number,
    delay: number,
    skipTagged: boolean,
    strategy: string
  }
};
```

### Processing Loop

- Sequential (same as today's `startRun` loop)
- One asset at a time
- Before each iteration: check pause flag
- After each asset: apply inter-asset delay
- On complete: report summary

### Pause/Resume/Stop

| Action | Behavior |
|--------|----------|
| Pause | Finish current asset. Before next iteration, check flag → break. Remaining stay `⏳ queued` |
| Resume | Re-enter loop from next queued asset |
| Stop | Like pause but resets queue. Done stay done. Remaining reset to initial state |

### Retry

- Per-asset: click `↻` on errored row → reset that asset to `⏳ queued` → start processing
- Retry All: same for all errored assets
- If engine is idle, starts a new run for retried items only

### Wire Integration (content.js)

- `wireBatchTab()` — renders dashboard HTML, wires event listeners
- Calls `batchManager.run(queue, config, onProgress)` 
- `onProgress(state)` callback updates the dashboard UI
- No messages to background script — everything in-process (content script has DOM access)

---

## 5. CSV EXPORT REDESIGN

### Entry Point

- Button `#mr-batch-csv-btn` in Batch dashboard footer
- Calls `chrome.tabs.create({ url: chrome.runtime.getURL('csv.html') })`
- Same behavior as the old CSV ↗ tab, just moved inside Batch tab

### Visual Identity

- Standalone web app feel (not panel density)
- Same brand colors (`--accent`, `--bg`, `--surface`, `--text` via the design system values)
- Dark mode support: reads `theme` from `chrome.storage.sync` → toggles `.mr-dark` on `<body>`
- Spacious layout: 20px card padding, 14px border-radius, larger type (12-20px)
- Centered max-width column (~680px)

### Feature Parity (Option A)

| Feature | Implementation |
|---------|---------------|
| Category | `<select>` dropdown (same values as panel) |
| Platform style | `<select>` with all 4: General, Adobe Stock, Shutterstock, Freepik, Vecteezy |
| Title strategy | `<select>`: Concise, Descriptive, Auto, Creative |
| Keyword count | `<select>`: Auto, Standard, Extensive |
| Output mode | Segmented toggle: Both \| Title Only \| Keywords Only |
| Custom tone | `<input>` inline |
| Custom context | `<textarea>` inline |
| Include words | `<input>` inline |
| Exclude words | `<input>` inline |
| Analysis mode | Segmented toggle: Text Mode (filename) \| Image Mode (AI vision) |
| Dark mode | Reads from chrome.storage, applies `.mr-dark` class |
| Per-asset progress | Table rows with status icons (same as batch dashboard) |
| Pause/Resume | Control buttons during processing |
| Retry | Per-row retry for errored items |
| Provider display | Shows current provider + model + key status |

### Layout Sections (csv.html)

1. **Header** — Logo + title + subtitle
2. **Config card** — Category, Platform, Strategy, Keywords in a 2×2 grid + Output mode toggle
3. **Advanced (collapsible)** — Tone, Context, Include/Exclude words
4. **Analysis mode toggle** + **Drop zone** + **File list**
5. **Progress** — Bar + per-row status table (shown during processing)
6. **Generate button** — Primary CTA
7. **Result** — Download button (shown after completion)
8. **How it works** — 3-step guide (unchanged from current)

### Dark Mode

- On load: `chrome.storage.sync.get('theme')` → if `'dark'`, add class `.mr-dark` to `<body>`
- CSS variables switch to midnight palette (same values as panel's dark theme)
- All cards, inputs, buttons re-theme via variables

---

## 6. FILE CHANGES

| File | Change |
|------|--------|
| `core/batchManager.js` | Rewrite — add state machine, pause/resume/retry, progress callback |
| `content.js` | Update `wireBatchTab()` → render new dashboard + wire events. Remove CSV/Help tab handlers. |
| `state.js` | Add `batchState` to shared state |
| `csv.html` | Rewrite HTML — new layout with full feature parity, dark mode support |
| `csv.js` | Rewrite — add strategies, output mode, pause/resume/retry, dark mode init |
| `ui/panel.html` | Add `#mr-help-btn` to header. Add `#mr-tab-batch` pane. Remove CSV/Help tab. |
| `ui/panel.js` | Wire help slide-over. No structural changes needed. |
| `docs/project/design-system.md` | Update tab references if needed |

### No Changes

- `background.js` — no IPC changes needed (all in-process)
- `api.js` — no changes
- `strategies/*.js` — unchanged

---

## 7. DESIGN SYSTEM COMPLIANCE

All new UI uses existing CSS variables from `design-system.md`:

- Colors: `--bg`, `--surface`, `--raised`, `--border`, `--accent`, `--green`, `--red`, `--yellow`, `--text`, `--text2`, `--muted`
- Border-radius: `8px` (inputs), `10px` (cards/buttons), `12px` (CSV generate button), `14px` (CSV cards)
- Font sizes: `10px`–`14px` (panel), `11px`–`20px` (CSV page)
- Button specs: match `.mr-btn-primary` padding/border-radius

---

## 8. IMPLEMENTATION ORDER

1. **Tab layout** — Remove CSV/Help tabs, add Batch tab pane, add Help header button
2. **batchManager.js rewrite** — State machine, pause/resume/retry, progress callback
3. **Batch dashboard HTML** — wireBatchTab() renders new UI
4. **Batch tab wiring** — Connect engine to dashboard
5. **CSV.html redesign** — New layout + dark mode
6. **CSV.js rewrite** — Feature parity, pause/resume, dark mode
7. **Integration testing** — Grid batch on each platform, CSV export flow

---

*Design v1.0 — Generated from brainstorming session bs-8636-1783521857.60912*
