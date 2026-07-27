# Platform Strategies

Each platform has a strategy object in `strategies/<platform>.js`. All share the same interface. `detectStrategy()` in `content.js` selects the right one at boot via `location.hostname`.

---

## Strategy Object Shape

```javascript
{
  name: string,              // "adobe" | "shutterstock" | "freepik" | "vecteezy"
  hostMatch: string,         // substring matched against location.hostname
  sel: { ...SEL overrides }, // keys from SEL that this platform overrides
  gridThumbCandidates: [],   // ordered CSS selectors to find grid thumbnails
  imageUrlPatterns: [],      // URL substrings identifying asset images
  uploadTileSelector: "",    // selector for upload-page tile thumbnails
  detailPanelSelector: "",   // selector for the edit panel container
}
```

At boot: `Object.assign(SEL, currentStrategy.sel)` overlays the platform selectors onto the shared `SEL` object. Adobe is the fallback/default.

---

## Adobe Stock (`contributor.stock.adobe.com`)

**Status:** Production-validated. All selectors confirmed against live DOM.

Uses `data-t` attributes — stable across deploys.

```javascript
sel: {
  titleEditBtn:  ['button[data-t="portfolio-detail-panel-title-edit"]', 'textarea[data-t="asset-title-content-tagger"]'],
  kwEditBtn:     ['button[data-t="portfolio-detail-panel-keywords-edit"]', 'textarea[data-t="content-keywords-ui-textarea"]'],
  kwInput:       ['input[data-t="content-keyword"]', 'textarea[data-t="content-keywords-ui-textarea"]'],
  kwRemoveBtn:   ['button[data-t="content-keywords-input-actions-item-icon-remove"]'],
  kwModal:       ['input[data-t="content-keyword"]', 'textarea[data-t="content-keywords-ui-textarea"]'],
  titleInput:    ['.container-table-cell input[type="text"]', '.container-table-cell textarea',
                  '[class*="container-table-cell"] input[type="text"]', '[class*="container-table-cell"] textarea',
                  '[class*="detail-panel"] input[type="text"]:not([data-t])',
                  'textarea[data-t="asset-title-content-tagger"]'],
  saveBtn:       ['button.button--action', 'button[class*="button--action"]', 'button[data-t*="save"]'],
  confirmBtn:    ['button[data-variant="accent"]', 'button[class*="accent"]', 'button[data-testid*="confirm"]'],
  okBtn:         ['button.button--dialog', 'button[class*="button--dialog"]', 'button[data-t*="ok"]'],
  saveWorkBtn:   ['button[data-t="save-work"]', 'button[data-t="save"]', '.save-work-button'],
}

gridThumbCandidates: [
  ".content-thumbnail__img.c-align",
  ".content-thumbnail__img",
  "[class*='content-thumbnail'] img[src*='stock.adobe']",
  "[class*='thumbnail'] img[src*='ftcdn']",
  "[class*='portfolio'] img[src*='ftcdn']",
  "[class*='portfolio'] img[src*='stock.adobe']",
  "[class*='grid'] img[src*='ftcdn']"
]

imageUrlPatterns: ["ftcdn", "stock.adobe"]
uploadTileSelector: "img.upload-tile__thumbnail"
detailPanelSelector: '.detail-panel, [class*="detail-panel"], [data-t="portfolio-detail-panel"]'
```

**Special: `/uploads` route**
- Shows Upload Options UI (Editorial, Generative AI, Icon, People/Property)
- Keyword modal is SKIPPED — save uses `saveWorkBtn` only
- Navigation uses upload tile index, not platform nav buttons
- Undo row hidden

---

## Shutterstock (`submit.shutterstock.com`)

**Status:** Selectors validated. Uses React + MUI.

MUI class names are stable. Styled-component `sc-*` classes change on deploy — never target them.

```javascript
sel: {
  titleInput:    ['textarea[name="description"]'],
  titleEditBtn:  ['textarea[name="description"]'],
  kwInput:       ['input.MuiInputBase-inputAdornedEnd', 'input[placeholder*="Add keyword" i]', 'input[placeholder*="comma or semicolon" i]'],
  kwEditBtn:     ['input.MuiInputBase-inputAdornedEnd', 'input[placeholder*="Add keyword" i]'],
  kwModal:       ['input.MuiInputBase-inputAdornedEnd', 'input[placeholder*="Add keyword" i]'],
  kwRemoveBtn:   ['[class*="MuiChip-deleteIcon"]', 'svg[data-testid="CancelIcon"]', '[class*="MuiChip"] [aria-label*="delete" i]', '[class*="MuiChip"] button'],
  saveBtn:       ['button[data-testid="content_editor_buttons_save-button"]', 'button[data-testid*="save"]', 'button.MuiButton-containedPrimary', 'button[class*="MuiButton-contained"]'],
  confirmBtn:    ['button[data-testid*="confirm"]', 'button[class*="MuiButton-containedPrimary"]'],
  okBtn:         ['button[data-testid*="ok"]', 'button[data-testid*="done"]'],
  saveWorkBtn:   ['button[data-testid="content_editor_buttons_save-button"]', 'button[data-testid*="save"]'],
}

gridThumbCandidates: ['img[data-testid^="card-media-"]', 'img[src*="cdn.shutterstock.com"]', 'img[class*="MuiCardMedia"]']
imageUrlPatterns: ["cdn.shutterstock.com", "shutterstock.com"]
uploadTileSelector: 'img[data-testid^="card-media-"]'
```

**Quirk — React controlled textarea:**
`textarea[name="description"]` is React-controlled. Setting `.value` directly does nothing. Must use:
```javascript
const nativeTextAreaSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
nativeTextAreaSetter.call(el, newValue);
el.dispatchEvent(new Event('input', { bubbles: true }));
```
`nativeSet()` in `content.js` handles this.

---

## Freepik (`contributor.freepik.com` / `contributor.magnific.com`)

**Status:** Selectors validated. Uses Vue with `data-cy` attributes — very stable.

```javascript
sel: {
  titleInput:     ['textarea[data-cy="editTitle"]'],
  titleEditBtn:   ['textarea[data-cy="editTitle"]'],
  kwInput:        ['input[data-cy="editTags"]'],
  kwEditBtn:      ['input[data-cy="editTags"]'],
  kwModal:        ['input[data-cy="editTags"]'],
  kwRemoveBtn:    ['button[data-cy="deleteTag"]'],
  saveBtn:        ['button[data-cy="savePreitems"]'],
  confirmBtn:     ['button[data-cy="confirmAction"]', 'button[class*="button--primary"]'],
  okBtn:          ['button[data-cy="okBtn"]', 'button[class*="button--primary"]'],
  saveWorkBtn:    ['button[data-cy="savePreitems"]'],
  deleteAllKwBtn: ['button[data-cy="deleteTags"]'],    // ← unique to Freepik
  deleteTitleBtn: ['button[data-cy="deleteTitle"]'],
}

gridThumbCandidates: ['img[data-cy="preitemImg-grid"]', 'img[src*="img-contributor.magnific.com"]', 'img[src*="freepik.com"]']
imageUrlPatterns: ["img-contributor.magnific.com", "freepik.com"]
uploadTileSelector: 'img[data-cy="preitemImg-grid"]'
```

**Quirk — delete-all button:**
Freepik is the only platform with a "delete all tags" button (`button[data-cy="deleteTags"]`). `content.js` uses it to clear all keywords at once before filling, instead of removing chips one-by-one. This is much faster and more reliable.

---

## Vecteezy (`www.vecteezy.com`)

**Status:** Selectors validated. Uses React + MUI + styled-components.

**Never target `sc-*` classes** — styled-component class names change on every deploy.

```javascript
sel: {
  titleInput:    ['input#title-input', 'input[id="title-input"]'],
  titleEditBtn:  ['input#title-input'],
  kwInput:       ['[data-testid="tagger-input"] input', 'input[class*="MuiInputBase-input"][class*="MuiOutlinedInput-input"]'],
  kwEditBtn:     ['[data-testid="tagger-input"] input'],
  kwModal:       ['[data-testid="tagger-input"] input'],
  kwRemoveBtn:   ['[data-testid="tagger-input"] [class*="MuiChip-deleteIcon"]', '[data-testid="tagger-input"] [class*="chip"] button',
                  '[data-testid="tagger-input"] [class*="tag"] button', '[data-testid="tagger-input"] svg[data-testid="CancelIcon"]',
                  '[class*="tagger"] [class*="MuiChip-deleteIcon"]', '[class*="MuiChip-deleteIcon"]'],
  saveBtn:       ['[data-testid="save-changes-icon"]', 'button[data-testid="save-changes-icon"]', '[data-testid*="save"]'],
  confirmBtn:    ['button[class*="MuiButton-containedPrimary"]', 'button[class*="MuiButton-contained"]'],
  okBtn:         ['button[class*="MuiButton-contained"]'],
  saveWorkBtn:   ['[data-testid="save-changes-icon"]'],
}

gridThumbCandidates: ['img[src*="cm-images.vecteezy.com"]', 'img[alt][src*="vecteezy"]', 'img[loading="lazy"][src*="vecteezy"]']
imageUrlPatterns: ["cm-images.vecteezy.com", "vecteezy.com"]
uploadTileSelector: 'img[src*="cm-images.vecteezy.com"]'
```

**Quirk — React controlled input:**
`input#title-input` is React-controlled. Same `nativeSet()` approach as Shutterstock, but use `HTMLInputElement.prototype` setter.

**Quirk — Active-asset tracking must survive React reconciliation (first-card-clobber):**

Vecteezy's UI routinely re-applies `Mui-selected` to `imgs[0]` (the first grid tile) during React reconciliation — e.g. after saving metadata, or between DOM mutations during a generate run. The MutationObserver (L110-145) and `findActiveThumb()` Mui-selected scan (L4262-4290) both write `_vecteezyActiveIdx` when Mui-selected appears, silently overwriting the user's real position to `imgs[0]`.

**Fix — run-locked index (`_vzRunLockIdx`):**
- `_vzRunLockIdx` is snapshotted at the start of `runSingle()` and `runBatch()` from the current `_vecteezyActiveIdx`
- `findActiveThumb()` checks `_vzRunLockIdx` FIRST — if it's >= 0, returns the locked index regardless of what `_vecteezyActiveIdx` says
- When `runSingle()` completes, `_vecteezyActiveIdx` is restored from `_vzRunLockIdx` before unlocking
- Lock cleared at run end (runSingle return/catch, runBatch finally)

**Key invariant:** During any generation, `_vzRunLockIdx >= 0` means "use this index, not `_vecteezyActiveIdx`". The observer and Mui-selected scans can freely clobber `_vecteezyActiveIdx` — they don't affect `_vzRunLockIdx`. The lock-restore at run end ensures Next/Prev navigation uses the correct index after generation completes.

---

## Adding a New Platform

1. Create `strategies/newplatform.js` with the full strategy object
2. Add `<script src="strategies/newplatform.js">` in `manifest.json` content_scripts (before `content.js`)
3. Add detection in `detectStrategy()` in `content.js`:
   ```javascript
   if (host.includes("newplatform.com")) return newplatformStrategy;
   ```
4. Add host to `matches` and `host_permissions` in `manifest.json`
5. Validate all selectors against the live DOM before marking as production-ready
6. Document in this file
