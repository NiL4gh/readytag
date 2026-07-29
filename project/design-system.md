# Design System

All values are from `content.css`. Never introduce values not listed here. Never use raw hex values — always use CSS variables.

---

## CSS Variables

### Light / Pearl Theme (`#mr-panel`)

| Variable | Value |
|----------|-------|
| `--bg` | `#f5f4f0` |
| `--surface` | `#ffffff` |
| `--raised` | `#ebe9e3` |
| `--input` | `#f9f8f5` |
| `--border` | `#ddd9d2` |
| `--focus` | `#5b7cf6` |
| `--accent` | `#5b7cf6` |
| `--accent-h` | `#4568e8` |
| `--teal` | `#0891b2` |
| `--text` | `#111827` |
| `--text2` | `#374151` |
| `--label` | `#4b5563` |
| `--muted` | `#6b7280` |
| `--green` | `#16a34a` |
| `--gbg` | `#f0fdf4` |
| `--gbd` | `#bbf7d0` |
| `--yellow` | `#d97706` |
| `--ybg` | `#fffbeb` |
| `--ybd` | `#fde68a` |
| `--red` | `#dc2626` |
| `--rbg` | `#fef2f2` |
| `--rbd` | `#fecaca` |
| `--shadow` | `0 12px 48px rgba(0,0,0,.15), 0 0 0 1px rgba(0,0,0,.07)` |
| `--hover` | `#ebe9e3` |

### Dark / Midnight Theme (`#mr-panel.mr-dark`) — default

| Variable | Value |
|----------|-------|
| `--bg` | `#0a0c14` |
| `--surface` | `#111422` |
| `--raised` | `#181b2c` |
| `--input` | `#141728` |
| `--border` | `#252a42` |
| `--focus` | `#7289ff` |
| `--accent` | `#7289ff` |
| `--accent-h` | `#5c73f5` |
| `--teal` | `#2dd4bf` |
| `--text` | `#f0f2ff` |
| `--text2` | `#c8cde8` |
| `--label` | `#8b91b8` |
| `--muted` | `#5a6080` |
| `--green` | `#4ade80` |
| `--gbg` | `#081810` |
| `--gbd` | `#14532d` |
| `--yellow` | `#fbbf24` |
| `--ybg` | `#180f00` |
| `--ybd` | `#6b3a06` |
| `--red` | `#f87171` |
| `--rbg` | `#140606` |
| `--rbd` | `#6b1919` |
| `--shadow` | `0 16px 56px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.05)` |
| `--hover` | `#1e2236` |

---

## Layout Dimensions

| Element | Value |
|---------|-------|
| Panel width | `380px` — **never change** |
| Panel height | `100vh` |
| Header height (`--header-h`) | `44px` |
| Tab bar height (`--tabs-h`) | `36px` |

---

## Allowed Border-Radius Values

`4px` `5px` `6px` `8px` `9px` `10px` `12px` `14px` — use only these. Do not introduce new values.

---

## Button Specs

| Class | Padding | Border-radius | Notes |
|-------|---------|---------------|-------|
| `.mr-btn` / `.mr-btn-primary` | `11px` | `10px` | Full width, `gap: 8px` |
| `.mr-btn-stop` | `9px` | `8px` | Full width |
| `.mr-btn-ghost` | `8px` | `8px` | Full width |
| `.mr-btn-xs` | `3px 8px` | `5px` | Inline action buttons |
| `.mr-btn-undo` | `8px 12px` | `6px` | `gap: 4px` |
| `.mr-dd-btn` | `8px 11px` | `8px` | Dropdown trigger, `gap: 8px` |
| `.mr-seg-btn` | `6px 4px` | — | Segmented control item |

---

## Input Specs

| Class | Padding | Border-radius |
|-------|---------|---------------|
| `.mr-key-input` | `9px 11px` | `8px` |

---

## Card / Container Specs

| Element | Padding | Border-radius |
|---------|---------|---------------|
| `#mr-asset-card` | `10px 12px` | `10px` |
| `.mr-result-card` header (`.mr-result-hdr`) | `6px 10px` | `8px` |
| `.mr-result-card` body (`.mr-result-body`) | `8px 10px` | — |
| `.mr-tab-pane` | `13px` (bottom: `250px`) | — |
| `#mr-working` overlay | — | — |
| `.mr-log-entry` header (`.mr-log-hdr`) | `8px 10px` | `9px` |

---

## Badge Specs

| Class | Size | Border-radius |
|-------|------|---------------|
| `.mr-count-badge` | `padding: 1px 6px` | `4px` |
| `.mr-grid-badge` | `24×24px` | `50%` |
| `.mr-visual-badge` | `20×20px` | `50%` |

**Badge states** (from `BADGE_CFG` in `state.js`):
| State | Background | Color | Icon |
|-------|-----------|-------|------|
| `done` | `#4ade80` | `#052010` | `✓` |
| `active` | `#fbbf24` | `#000` | `⟳` |
| `error` | `#f87171` | `#fff` | `✕` |

---

## Typography (existing values only)

Common font sizes in the panel: `10px`, `11px`, `11.5px`, `12px`, `12.5px`, `13px`, `14px`  
Font weights used: `400`, `500`, `600`, `700`, `800`  
Font family: system UI stack (inherited from `all: initial` reset on `#rt-host`)

---

## Key Element IDs (Generate Tab)

| ID | Element | Role |
|----|---------|------|
| `#rt-host` | `div` | Shadow DOM host, injected into `document.body` |
| `#mr-panel` | `div` | Root inside shadow root |
| `#mr-header` | `div` | Top header row |
| `#mr-logo` | `div` | Logo + provider badge |
| `#mr-provider-badge` | `span` | Active provider label (e.g. "Groq") |
| `#mr-theme-toggle` | `button` | Dark/light toggle |
| `#mr-settings-btn` | `button` | Opens settings slide-over |
| `#mr-min` | `button` | Minimize panel |
| `#mr-maximize-tab` | `div` | Fixed off-canvas restore trigger (minimized state) |
| `#mr-tabs` | `div` | Tab bar container |
| `.mr-tab` | `button` | Tab button (data-tab: generate/history/csv/help) |
| `#mr-tab-generate` | `div` | Generate tab pane |
| `#mr-tab-history` | `div` | History tab pane |
| `#mr-tab-help` | `div` | Help tab pane |
| `#mr-settings-pane` | `div` | Settings slide-over (absolute, z-index: 10) |
| `#mr-asset-card` | `div` | Current asset display |
| `#mr-asset-title` | `div` | Asset title text (display only) |
| `#mr-input` | `input[hidden]` | Hidden input carrying API payload description |
| `#mr-preview-card` / `#mr-preview-img` | `div`/`img` | Thumbnail preview |
| `#mr-nav-row` | `div` | Prev/Next navigation row |
| `#mr-nav-prev` / `#mr-nav-next` | `button` | Navigation buttons |
| `#mr-nav-status` | `span` | "1 of 24" position display |
| `#mr-working` | `div` | Processing overlay (absolute, covers generate tab) |
| `#mr-steps` / `.mr-step` / `.mr-step-dot` | `div` | 6-step progress indicator |
| `#mr-working-result` | `div` | Generated output cards (title + keywords) |
| `#mr-prev-title` | `div` | Generated title preview text |
| `#mr-prev-kw` | `div` | Generated keywords preview |
| `#mr-stop-btn` | `button` | Stop current run |
| `#mr-go` | `button` | Sticky "Generate & Apply" CTA |
| `#mr-undo-row` | `div` | Undo row container |
| `#mr-undo-title-btn` / `#mr-undo-kw-btn` | `button` | Undo actions |
| `#mr-category` | `input[hidden]` | Selected category value |
| `#mr-title-strategy` | `input[hidden]` | Title length strategy |
| `#mr-kw-strategy` | `input[hidden]` | Keyword count strategy |
| `#mr-output-mode-val` | `input[hidden]` | Output mode (both/title/keywords) |
| `#mr-custom-tone` | `input` | Style/tone input |
| `#mr-custom-context` | `textarea` | Detailed instructions input |
| `#mr-include-words` | `input` | Include words input |
| `#mr-exclude-words` | `input` | Exclude words input |
| `#mr-batch-toggle` | `input[checkbox]` | Batch mode toggle |
| `#mr-upload-suite` | `div` | Upload options (visible on /uploads route only) |
| `#mr-version-pill` | `span` | "ReadyTag · v2.0" |
| `#mr-call-count` | `span` | Session call counter display |
