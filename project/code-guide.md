# Code Guide — Rules for Any AI Agent Working on ReadyTag

Read this before touching any code. Every rule here exists because breaking it causes silent failures or hard-to-trace bugs.

---

## Shadow DOM — The Most Important Rule

The entire ReadyTag panel lives inside a **closed shadow root** on `#rt-host`. `document.querySelector` cannot pierce it.

### Correct query APIs

| Target | Use | Never use |
|--------|-----|-----------|
| Panel element (inside shadow root) | `id("mr-something")` | `document.getElementById("mr-something")` |
| Multiple panel elements | `qsa(".mr-class")` | `document.querySelectorAll(".mr-class")` |
| Host page element (platform DOM) | `document.querySelector(...)` | `id(...)` or `qsa(...)` |

`id()` and `qsa()` are defined in `state.js`. They route through `_shadow || document`. Using `document.querySelectorAll` on a panel-internal selector is a **silent failure** — empty NodeList, no error.

If you already hold a shadow DOM element, calling `.querySelectorAll()` directly on it is fine:
```js
id("mr-tab-generate")?.querySelectorAll(".mr-field")  // ✅ correct
```

### Shadow DOM structure

```
document.body
  └── <div id="rt-host">            ← shadow host (injected by buildPanel)
        └── #shadow-root (closed)   ← stored in _shadow (state.js)
              ├── <link> → content.css
              └── <div id="mr-panel">
                    ├── #mr-maximize-tab
                    ├── #mr-onboarding
                    └── #mr-app
                          ├── #mr-header
                          ├── #mr-tabs
                          ├── #mr-tab-generate
                          ├── #mr-tab-history
                          ├── #mr-tab-help
                          └── #mr-settings-pane  (z-index: 10 slide-over)
```

---

## Edit Protocol

1. Read [`architecture.md`](architecture.md) for the function/caller map before changing any function
2. Make only the change requested — do not refactor adjacent code
3. If a change touches more than 2 functions, confirm with the user first

---

## Selector Rules

- All host-page DOM selectors must go through the `SEL` object (defined in `state.js`, overlaid by `currentStrategy.sel` at boot)
- Never write a raw selector string directly inside automation functions
- To use a new selector: add it to `SEL` first, then reference `SEL.newKey`
- Use `resolveEl(SEL.keyName)` or `waitForResolved(SEL.keyName, timeout)` — never query the host DOM directly in automation functions
- `resolveEl()` explicitly skips elements inside `#mr-panel` — never remove that guard

---

## Platform Strategy Rules

- Never hardcode Adobe-specific selectors in `content.js` automation code
- All platform-specific selectors live in `strategies/*.js`
- `currentStrategy` is set once at boot by `detectStrategy()` — never reassign it during a run
- Adding a new platform: create `strategies/newplatform.js`, add `hostMatch`, register in `detectStrategy()`

---

## IPC Rules

- All AI API calls route through: `content.js → ipc() (api.js) → background.js → Cloudflare Worker`
- Never call any AI API directly from `content.js`
- Never add new IPC message types without explicit instruction — see [`architecture.md`](architecture.md) for the current set

---

## Run Control Rules

- `abortFlag` must be checked via `shouldAbort()` or `checkAbort()` inside all long-running loops
- `isRunning` must be `true` at the start and `false` in the `finally` block of every automation run
- Never set `isRunning = false` from outside the automation's own finally block

---

## State Variable Rules

- `_shadow` is null until `buildPanel()` runs — never access it before init
- `currentStrategy` is read-only during a run — set once by `detectStrategy()` at boot
- `undoLog` keyed by `_thumbFp || getCurrentAssetId() || name-prefix` — never by title alone
- CSV tab state (`_csvFiles`, `_csvResults` — in content.js) is CSV-only — never read from automation functions

---

## Route Awareness

Always check which route the code runs on:

**`/uploads` route (Adobe Stock only):**
- Shows Upload Options box (Editorial, Generative AI, Icon, People/Property)
- Navigation uses `navigateUploadTile()` and `_uploadTileIdx`
- Keyword modal is skipped entirely
- Save uses `button[data-t="save-work"]` only
- Undo row is hidden — `handleUndo()` returns immediately

**Standard portfolio (all platforms):**
- Full generate + apply + undo workflow
- Visual grid badges active
- Navigation via platform-native prev/next buttons

Never apply upload-route logic to standard pages or vice versa.

---

## Design System Rules

See [`design-system.md`](design-system.md) for all values. Summary:
- Padding must match an existing value from the design system
- Border-radius: only `4px 5px 6px 8px 9px 10px 12px 14px`
- Colors must use a CSS variable — **never a raw hex value**
- No new CSS variables may be introduced
- CSS is vanilla only — no frameworks, no preprocessors
- Panel width is fixed at `380px` — never change it

---

## CSP Rules

Manifest V3 enforces strict Content Security Policy:
- No inline `<script>` blocks in any HTML file
- No inline event handlers (`onclick="..."`)
- All scripts must be external `.js` files via `<script src="...">`
- `content.css` is loaded into the shadow root manually via `<link>` — it is NOT in the `css` array of `manifest.json`

---

## What Not to Do

- Do not add features not explicitly requested
- Do not rename existing functions, IDs, or CSS classes (the `mr-` prefix on IDs is legacy — leave it)
- Do not change the panel width (380px) or overall layout structure
- Do not add new settings fields, toggles, or UI sections without instruction
- Do not refactor working code while fixing a bug
- Do not commit without being asked
- Do not use `document.getElementById` or `document.querySelectorAll` for panel-internal elements
