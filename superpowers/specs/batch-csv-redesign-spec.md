# Batch & CSV Redesign — Specification

## Domain 1: Tab Navigation & Layout

### Purpose

Restructure the sidebar tab bar from 5 tabs to 4, move Help to a header icon, and relocate the CSV entry point into the Batch tab.

### Requirements

#### R1.1: Tab Bar Reduces to 4 Tabs

The tab bar MUST display exactly 4 tabs in this order: **Generate**, **Customize**, **Batch**, **Log**.

- The `CSV ↗` tab MUST be removed from the tab bar.
- The `Help` tab MUST be removed from the tab bar.
- The `Customize` tab MUST remain in its current position (2nd from left).

##### Scenario: Tab bar renders correctly

- GIVEN the panel is opened
- WHEN the tab bar is rendered
- THEN it shows exactly 4 tabs: "Generate", "Customize", "Batch", "Log"
- AND no "CSV ↗" or "Help" tab is present

##### Scenario: Batch tab is active by default when entering batch mode

- GIVEN the user clicks the "Batch" tab
- WHEN the tab switches
- THEN the batch dashboard pane is visible
- AND all other tab panes are hidden

#### R1.2: CSV Entry Moves to Batch Tab Footer

The Batch tab footer MUST contain a "CSV Export" button that opens `csv.html` in a new Chrome tab.

##### Scenario: CSV button in Batch tab

- GIVEN the Batch dashboard is displayed
- WHEN the user clicks the "CSV Export" button in the footer
- THEN `chrome.tabs.create({ url: chrome.runtime.getURL('csv.html') })` is called
- AND a new browser tab opens with the CSV export page

##### Scenario: CSV button works during active batch

- GIVEN a batch is currently running
- WHEN the user clicks "CSV Export"
- THEN the CSV page opens in a new tab regardless
- AND the running batch is unaffected

#### R1.3: Help Moves to Header Icon

The panel header MUST include a `?` button that opens a Help slide-over panel (same pattern as the Settings slide-over).

##### Scenario: Help icon renders

- GIVEN the panel is opened
- THEN the header shows a `?` icon button alongside the Settings gear and Theme toggle

##### Scenario: Help slide-over opens

- GIVEN the user clicks the `?` icon
- THEN a slide-over panel opens from the right
- AND it contains help content: keyboard shortcuts, platform compatibility, version number
- AND it can be closed via a `✕` button or clicking outside

#### R1.4: Customize Tab Unchanged

The Customize tab MUST retain its existing behavior, rendering, and wiring. No modifications to its HTML, CSS, or JavaScript.

##### Scenario: Customize tab works as before

- GIVEN the user clicks the "Customize" tab
- THEN the same customization UI is displayed as before the redesign
- AND all controls (tone, context, include/exclude words) function identically

---

## Domain 2: Batch Dashboard (UI in sidebar)

### Purpose

Replace the old batch toggle inside the Generate tab with a dedicated Batch tab that shows a live dashboard with per-asset progress, controls, and status summary.

### Requirements

#### R2.1: Batch Dashboard Layout

The Batch tab pane MUST render a structured dashboard with these sections from top to bottom:

1. **Collapsible config section** — batch settings (asset count, delay between assets, skip-already-tagged toggle)
2. **Status bar** — overall progress bar + "X / Y assets" counter
3. **Control row** — Pause button and Stop button
4. **Asset table** — rows showing #, filename, character count, status icon
5. **Summary row** — count of done / active / queued / errored assets
6. **Footer actions** — CSV Export button and Retry All button

##### Scenario: Dashboard renders on tab switch

- GIVEN the user clicks the Batch tab
- THEN all 6 sections are rendered correctly
- AND the asset table is empty (no batch started yet) or shows the current/pending batch
- AND the config section shows sensible defaults (count=all, delay=300ms, skip_tagged=true)

##### Scenario: Config section is collapsible

- GIVEN the Batch tab is displayed
- WHEN the user clicks the config section header
- THEN the config content collapses/hides
- AND clicking again expands it

#### R2.2: Asset Table Rows

Each row in the asset table MUST display:

- **Column 1**: Index number (1-based)
- **Column 2**: Filename (truncated with ellipsis if too long)
- **Column 3**: Character count (shown only after processing, "-" while queued)
- **Column 4**: Status icon (see R2.3)

The currently processing row MUST be visually highlighted (e.g., accent background color).

##### Scenario: Asset row renders with correct data

- GIVEN a batch with 3 assets is queued
- WHEN the batch starts
- THEN row 1 shows the first asset filename, char count updates after processing
- AND the status icon updates from ⏳ to ⟳ to ✓ or ✕
- AND the active row has a distinct background color

##### Scenario: Long filenames are truncated

- GIVEN an asset with a very long filename
- THEN the filename cell shows the name truncated with `…`
- AND the full name is available via tooltip or title attribute

#### R2.3: Status Icons

The asset table MUST use these status icons and colors:

| State | Icon | Color |
|-------|------|-------|
| queued | ⏳ | `--muted` |
| processing | ⟳ | `--accent` |
| done | ✓ | `--green` |
| error | ✕ | `--red` |
| paused | ⏸ | `--yellow` |

##### Scenario: Icons match state

- GIVEN an asset transitions from queued to processing
- THEN its icon changes from ⏳ to ⟳
- AND the color changes from `--muted` to `--accent`

##### Scenario: Error state shows retry affordance

- GIVEN an asset has status "error"
- THEN its row shows a clickable retry icon (↻) alongside the ✕ icon

#### R2.4: Status Bar

The status bar MUST show:
- A progress bar that fills as assets complete (0% → 100%)
- Text: "X / Y assets" where X is processed count, Y is total

##### Scenario: Progress bar updates correctly

- GIVEN a batch of 10 assets
- WHEN 3 assets are done
- THEN the progress bar is at 30% width
- AND the text reads "3 / 10 assets"

#### R2.5: Summary Row

The summary row MUST show counts: ✓ N done, ⟳ N active, ⏳ N queued, ✕ N errors.

##### Scenario: Summary updates in real-time

- GIVEN a batch with 5 assets, 2 done, 1 active, 2 queued
- THEN the summary shows "✓ 2 done  ⟳ 1 active  ⏳ 2 queued"
- AND when one more completes, it updates to "✓ 3 done  ⟳ 0 active  ⏳ 2 queued"

---

## Domain 3: Batch Engine

### Purpose

Rewrite `core/batchManager.js` with a per-asset state machine that supports pause, resume, stop, and retry. Runs sequentially in the content script.

### Requirements

#### R3.1: Per-Asset State Machine

Each asset MUST have an independent state that transitions through these states:

```
⏳ queued → ⟳ processing → ✓ done
⏳ queued → ⟳ processing → ✕ error → [retry] → ⟳ processing
⏳ queued → ⏸ paused → [resume] → ⟳ processing
```

##### Scenario: Normal processing flow

- GIVEN a batch starts with 3 assets
- WHEN asset 1 finishes successfully
- THEN asset 1 state = "done"
- AND processing moves to asset 2
- AND when all 3 are done, engine state = "complete"

##### Scenario: Error does not crash the engine

- GIVEN asset 2 fails during processing
- THEN asset 2 state = "error"
- AND the engine continues to asset 3
- AND the engine does NOT halt on individual errors

#### R3.2: Pause

Pause MUST allow the current asset to finish processing, then check the pause flag before the next iteration and break the loop.

- Pausing MUST NOT abort the currently processing asset mid-flight.
- Remaining queued assets MUST stay in "queued" state (not lost).

##### Scenario: Pause during batch

- GIVEN a batch is processing 5 assets, currently on asset 3
- WHEN the user clicks Pause
- THEN asset 3 completes normally
- AND the engine pauses before asset 4
- AND assets 4 and 5 remain "queued"

##### Scenario: Pause when idle

- GIVEN no batch is running
- WHEN the user clicks Pause
- THEN nothing happens (no-op)

#### R3.3: Resume

Resume MUST re-enter the processing loop starting from the next queued asset.

##### Scenario: Resume after pause

- GIVEN the engine is paused after completing 3 out of 5 assets
- WHEN the user clicks Resume
- THEN processing continues from asset 4
- AND asset 4 transitions to "processing"

#### R3.4: Stop

Stop MUST halt the engine and reset the queue. Completed assets stay "done". Remaining assets go back to initial state.

##### Scenario: Stop during batch

- GIVEN a batch is processing 5 assets, on asset 3
- WHEN the user clicks Stop
- THEN asset 3 is abandoned (no new state written)
- AND assets 4 and 5 reset to initial state
- AND engine state = "idle"

##### Scenario: Stop after completion

- GIVEN a batch has completed all assets
- WHEN the user clicks Stop
- THEN nothing happens (no-op)

#### R3.5: Per-Asset Retry

Each errored asset MUST have a retry mechanism. Clicking retry on an errored row resets that asset to "queued" and re-processes it.

##### Scenario: Retry single asset

- GIVEN a batch completed with 1 errored asset
- WHEN the user clicks the retry icon on that row
- THEN that asset transitions back to "processing"
- AND on success, it becomes "done"
- AND other assets are unaffected

##### Scenario: Retry during running batch

- GIVEN a batch is running with 3 assets queued, 2 errored
- WHEN the user retries one of the errored assets
- THEN it is inserted at the front of the processing queue
- AND processed after the current asset finishes

#### R3.6: Retry All

The Retry All button MUST reset ALL errored assets to "queued" and re-process them.

##### Scenario: Retry All

- GIVEN a batch completed with 4 errors out of 10
- WHEN the user clicks Retry All
- THEN all 4 errored assets transition back to "queued"
- AND the engine re-processes them in order

#### R3.7: Progress Callback

The engine MUST accept an `onProgress(batchState)` callback that fires after each asset completes (success or error).

##### Scenario: Renderer receives progress updates

- GIVEN content.js calls `batchManager.run(queue, config, onProgress)`
- WHEN each asset completes
- THEN `onProgress` is called with the full `batchState` object
- AND the renderer updates the dashboard DOM accordingly

##### Scenario: Progress fires for all states

- GIVEN a batch processes, pauses, and resumes
- THEN `onProgress` fires for: each completion, pause (once after current asset), resume, and final completion

#### R3.8: Inter-Asset Delay

The engine MUST apply a configurable delay (in milliseconds) between completing one asset and starting the next.

##### Scenario: Delay respected

- GIVEN config.delay = 500
- WHEN asset 1 finishes
- THEN the engine waits 500ms before starting asset 2

##### Scenario: Zero delay

- GIVEN config.delay = 0
- WHEN asset 1 finishes
- THEN asset 2 starts immediately (no artificial delay)

---

## Domain 4: CSV Export Page

### Purpose

Redesign the standalone CSV export page (`csv.html` / `csv.js`) with full feature parity to the main panel, dark mode support, per-asset progress, and pause/resume/retry. Visual identity of a standalone web app.

### Requirements

#### R4.1: Entry Point

The CSV page MUST open via `chrome.tabs.create` called from the "CSV Export" button in the Batch tab footer.

##### Scenario: Opens from Batch tab

- GIVEN the user clicks "CSV Export" in the Batch tab footer
- THEN a new Chrome tab opens with `csv.html`

##### Scenario: Also opens from URL

- GIVEN the user navigates to `chrome-extension://<id>/csv.html` directly
- THEN the page loads and functions normally (no dependency on being opened from the Batch tab)

#### R4.2: Full Feature Parity

The CSV page MUST provide the same customization options as the main panel:

- **Category** dropdown: generic, illustration, photo, vector, nature, business, technology, lifestyle, travel, food, architecture, fashion, sports, holiday, abstract
- **Platform style** dropdown: General (49kw/180ch), Adobe Stock (30kw/90ch), Shutterstock (50kw/200ch), Freepik, Vecteezy
- **Title strategy** dropdown: Concise, Descriptive, Auto, Creative
- **Keyword count** dropdown: Auto, Standard, Extensive
- **Output mode** segmented toggle: Both, Title Only, Keywords Only
- **Custom tone** text input
- **Custom context** textarea
- **Include words** text input
- **Exclude words** text input
- **Analysis mode** toggle: Text Mode (filename-based), Image Mode (AI vision)

##### Scenario: All settings render

- GIVEN the CSV page loads
- THEN all control elements (dropdowns, inputs, toggles) are rendered
- AND they default to the same defaults as the main panel

##### Scenario: Persistent values

- GIVEN the user has saved settings in the extension
- WHEN the CSV page loads
- THEN it reads Category, Platform, Title strategy, Keyword count from storage
- AND loads them as defaults

##### Scenario: Analysis mode works

- GIVEN the user selects "Image Mode"
- WHEN a batch runs
- THEN each file is sent to `chrome.runtime.sendMessage({ type: "DESCRIBE_IMAGE", ... })` for vision analysis
- AND the response is used as the input prompt instead of the filename

#### R4.3: Dark Mode

The CSV page MUST support dark mode by reading `theme` from `chrome.storage.sync` and applying a `.mr-dark` class to `<body>`.

##### Scenario: Dark mode on load

- GIVEN the user's theme is set to "dark" in storage
- WHEN the CSV page loads
- THEN the page renders in dark theme colors (midnight palette)
- AND all cards, inputs, and controls use dark theme variables

##### Scenario: Light mode on load

- GIVEN the user's theme is set to "light" (or unset)
- WHEN the CSV page loads
- THEN the page renders in light/pearl theme colors

#### R4.4: File Drop Zone

The CSV page MUST provide a drag-and-drop zone that accepts image files (JPEG, PNG, WebP, SVG). It MUST also support clicking to browse files.

##### Scenario: Drop files

- GIVEN the user drags 5 image files onto the drop zone
- THEN the files are accepted
- AND a file list is displayed with filenames and sizes
- AND the Generate button becomes enabled

##### Scenario: Non-image files rejected

- GIVEN the user drops a PDF file onto the drop zone
- THEN the PDF is filtered out
- AND only image files are accepted

##### Scenario: Clear files

- GIVEN files are loaded
- WHEN the user clicks "Clear all"
- THEN the file list is emptied
- AND the Generate button is disabled

#### R4.5: Processing with Per-Asset Progress

During processing, the CSV page MUST show:
- A progress bar updating per file
- A file list with per-row status icons (same as batch dashboard: ⏳ ⟳ ✓ ✕ ⏸)
- Current file being processed highlighted

##### Scenario: Progress visible during batch

- GIVEN 10 files are loaded and the user clicks Generate
- THEN a progress bar appears
- AND each file row shows its status updating in real-time
- AND the progress bar fills proportionally

##### Scenario: Error row visible

- GIVEN one file fails during processing
- THEN its row shows ✕ in red
- AND processing continues to the next file
- AND final summary shows error count

#### R4.6: Pause/Resume in CSV

The CSV page MUST have Pause/Resume controls that work identically to the batch dashboard engine.

##### Scenario: Pause CSV processing

- GIVEN CSV processing is running on 20 files, currently on file 8
- WHEN the user clicks Pause
- THEN file 8 completes
- AND processing pauses before file 9
- AND the button changes to "Resume"

##### Scenario: Resume CSV processing

- GIVEN CSV processing is paused after 8 files
- WHEN the user clicks Resume
- THEN processing continues from file 9

#### R4.7: Retry in CSV

The CSV page MUST support per-file retry and Retry All for errored items.

##### Scenario: Retry single file in CSV

- GIVEN CSV processing completed with 2 errors out of 10
- WHEN the user clicks the retry icon on an errored row
- THEN that file is re-processed
- AND its status updates on completion

#### R4.8: CSV Output

On completion, the CSV page MUST:
- Generate a CSV file with columns: filename, title, keywords, provider, status, error
- Download the CSV file automatically
- Show a "Download CSV again" button

##### Scenario: CSV is downloaded

- GIVEN processing completes successfully
- THEN a CSV file download is triggered
- AND the filename format is `readytag-batch-YYYY-MM-DD.csv`

##### Scenario: Re-download

- GIVEN processing completed
- WHEN the user clicks "Download CSV again"
- THEN the same CSV is downloaded again without re-processing

#### R4.9: Cost Confirmation

Before processing, the CSV page MUST show a confirmation dialog with estimated API call count and provider information.

##### Scenario: Confirmation shown

- GIVEN 15 files are loaded
- WHEN the user clicks Generate
- THEN a modal shows "15 files × 1 call = 15 API calls to Groq"
- AND the user must confirm to proceed

##### Scenario: Confirmation cancelled

- GIVEN the confirmation dialog is shown
- WHEN the user clicks Cancel
- THEN no processing occurs
- AND the file list remains unchanged

---

## Edge Cases & Cross-Domain

#### EC1: Empty batch in dashboard

- GIVEN the user opens the Batch tab
- WHEN no portfolio assets are detected on the current page
- THEN the dashboard shows a message: "No assets detected on this page"
- AND controls are disabled

#### EC2: Tab switch during active batch

- GIVEN a batch is running in the Batch tab
- WHEN the user switches to Generate tab
- THEN the batch continues running in the background
- AND when the user returns to Batch tab, the dashboard shows updated progress

#### EC3: Panel close during active batch

- GIVEN a batch is running
- WHEN the user closes/minimizes the panel
- THEN the batch continues (no abort)
- AND when the panel is re-opened, progress is current

#### EC4: All assets errored

- GIVEN all assets in a batch return errors
- THEN the dashboard shows 0% progress
- AND summary reads "✓ 0 done, ✕ N errors"
- AND Retry All is available

#### EC5: CSV page refresh during processing

- GIVEN CSV processing is running
- WHEN the user refreshes the tab
- THEN all in-memory state is lost
- AND the user must re-select files and start over

#### EC6: No API key

- GIVEN the user has not configured an API key
- WHEN the user clicks Generate in the CSV page
- THEN an error message is shown: "No API key configured. Add it in extension Settings."
- AND no API call is made

---

*Spec v1.0 — 4 domains, 30+ requirements, 40+ scenarios*
