# API Stacking & Fallback System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement API Stacking (Hybrid Multi-Key per provider & Multi-Provider Fallback Queue with automatic key rotation and user-confirmed provider switching) for ReadyTag.

**Architecture:** Extend `chrome.storage.local` schema to store key arrays per provider (`keys[provider] = [...]`), key index pointers (`keyIndexes[provider]`), and a prioritized fallback queue (`fallbackStack = [...]`). Refactor background service worker (`background.js`) to handle automatic key rotation on rate-limits (429/401/403/network errors) and emit a `FALLBACK_REQUIRED` signal when keys for a provider are exhausted. Implement a fallback confirmation card in `content.js` (Shadow DOM sidebar) and a multi-key + priority stack editor in Settings UI (`ui/panel.html`, `ui/panel.js`).

**Tech Stack:** Chrome Extension Manifest V3 (JavaScript ES6+, Chrome Storage API, Shadow DOM, HTML5/CSS3).

## Global Constraints

- Storage schema: `keys` maps provider string to Array of strings. `keyIndexes` maps provider to number. `fallbackStack` is Array of provider strings.
- Backward compatibility: Convert existing string keys (e.g. `keys.groq = "gsk_..."`) to arrays (`["gsk_..."]`) seamlessly on startup or settings load.
- Level 1 automatic same-provider key rotation: happens transparently inside `background.js`.
- Level 2 provider fallback: requires user confirmation via UI prompt card in `content.js` sidebar panel.
- No third-party UI framework dependencies; maintain native vanilla JS and existing Shadow DOM architecture.

---

### Task 1: Storage Schema Migration & Helper Functions in `state.js` & `background.js`

**Files:**
- Modify: [`readytag_v2.0_public/state.js`](file:///C:/Users/niloy/Documents/ReadyTag/readytag_v2.0_public/state.js)
- Modify: [`readytag_v2.0_public/background.js`](file:///C:/Users/niloy/Documents/ReadyTag/readytag_v2.0_public/background.js)

**Interfaces:**
- Consumes: Existing `chrome.storage.local` keys schema (`keys: { groq: "gsk_...", gemini: "AIza..." }`)
- Produces: `migrateKeysSchema(storageData)` helper, `keyForProvider(provider, keys, keyIndexes)` supporting arrays, `getNextFallbackProvider(currentProvider, keys, fallbackStack)` helper.

- [ ] **Step 1: Write migration & helper functions in `state.js`**

Add migration and helper utilities in `state.js`:
```javascript
const DEFAULT_FALLBACK_STACK = [
  "groq", "gemini", "deepseek", "mistral", "zhipuai", "nvidia", "openai", "anthropic", "xai", "openrouter"
];

function migrateKeysSchema(data) {
  const keys = data.keys || {};
  const migratedKeys = {};
  const providers = ["groq", "gemini", "deepseek", "mistral", "zhipuai", "nvidia", "openai", "anthropic", "xai", "openrouter"];

  providers.forEach(p => {
    const val = keys[p];
    if (Array.isArray(val)) {
      migratedKeys[p] = val.filter(k => typeof k === "string" && k.trim().length > 0);
    } else if (typeof val === "string" && val.trim().length > 0) {
      migratedKeys[p] = [val.trim()];
    } else {
      migratedKeys[p] = [];
    }
  });

  const keyIndexes = data.keyIndexes || {};
  providers.forEach(p => {
    if (typeof keyIndexes[p] !== "number" || keyIndexes[p] >= (migratedKeys[p].length || 1)) {
      keyIndexes[p] = 0;
    }
  });

  const fallbackStack = Array.isArray(data.fallbackStack) && data.fallbackStack.length > 0
    ? data.fallbackStack
    : DEFAULT_FALLBACK_STACK;

  return { keys: migratedKeys, keyIndexes, fallbackStack };
}

function getActiveKeyForProvider(provider, keys, keyIndexes) {
  const providerKeys = keys?.[provider];
  if (Array.isArray(providerKeys)) {
    const idx = keyIndexes?.[provider] || 0;
    return providerKeys[idx] || providerKeys[0] || "";
  }
  if (typeof providerKeys === "string") return providerKeys;
  return "";
}

function getNextFallbackProvider(currentProvider, keys, fallbackStack) {
  const stack = Array.isArray(fallbackStack) ? fallbackStack : DEFAULT_FALLBACK_STACK;
  const currIdx = stack.indexOf(currentProvider);
  const searchOrder = currIdx !== -1
    ? [...stack.slice(currIdx + 1), ...stack.slice(0, currIdx)]
    : stack;

  for (const p of searchOrder) {
    if (p === currentProvider) continue;
    const pKeys = keys?.[p];
    const hasKey = Array.isArray(pKeys)
      ? pKeys.some(k => typeof k === "string" && k.trim().length > 0)
      : typeof pKeys === "string" && pKeys.trim().length > 0;
    if (hasKey) return p;
  }
  return null;
}
```

- [ ] **Step 2: Update `keyForProvider` and add migration on startup in `background.js`**

Update `keyForProvider` in `background.js`:
```javascript
function keyForProvider(provider, keys, keyIndexes) {
  const target = provider === "gemini-pro" ? "gemini" : provider;
  const pKeys = keys ? keys[target] : null;
  if (Array.isArray(pKeys)) {
    const idx = (keyIndexes && typeof keyIndexes[target] === "number") ? keyIndexes[target] : 0;
    return pKeys[idx] || pKeys[0] || "";
  }
  if (typeof pKeys === "string") return pKeys;
  return "";
}
```
Add auto-migration on `chrome.runtime.onInstalled` and `GET_SETTINGS` message handling in `background.js`.

- [ ] **Step 3: Test & Verify schema migration manually or via node unit assertion**

Verify that passing legacy `{ groq: "gsk_123" }` returns `{ groq: ["gsk_123"] }` and correct active key index.

---

### Task 2: Level 1 (Automatic Key Rotation) and Level 2 (Fallback Signal) in `background.js`

**Files:**
- Modify: [`readytag_v2.0_public/background.js`](file:///C:/Users/niloy/Documents/ReadyTag/readytag_v2.0_public/background.js)

**Interfaces:**
- Consumes: Worker API endpoints (`/generate`, `/describe`, `/topup`)
- Produces: Automatic retry with next key index in `keys[provider]`. Returns `{ success: false, code: "FALLBACK_REQUIRED", currentProvider, nextProvider, error }` when provider keys are exhausted.

- [ ] **Step 1: Create `executeWithKeyRotation` wrapper in `background.js`**

Implement key rotation loop:
```javascript
async function executeWithKeyRotation(provider, keys, keyIndexes, fallbackStack, apiCallFn) {
  const targetProvider = provider === "gemini-pro" ? "gemini" : provider;
  let pKeys = keys ? keys[targetProvider] : [];
  if (typeof pKeys === "string") pKeys = pKeys ? [pKeys] : [];
  if (!Array.isArray(pKeys) || pKeys.length === 0) {
    pKeys = [""]; // single attempt if no keys configured
  }

  let startIndex = (keyIndexes && typeof keyIndexes[targetProvider] === "number") ? keyIndexes[targetProvider] : 0;
  if (startIndex >= pKeys.length) startIndex = 0;

  let lastError = null;

  for (let attempt = 0; attempt < pKeys.length; attempt++) {
    const currentIndex = (startIndex + attempt) % pKeys.length;
    const currentKey = pKeys[currentIndex];

    try {
      const result = await apiCallFn(currentKey);
      // Success! Persist current working key index
      if (keyIndexes && keyIndexes[targetProvider] !== currentIndex) {
        keyIndexes[targetProvider] = currentIndex;
        chrome.storage.local.set({ keyIndexes });
      }
      return result;
    } catch (err) {
      lastError = err;
      console.warn(`[ReadyTag] Key ${currentIndex + 1}/${pKeys.length} for ${provider} failed:`, err.message);

      const isQuotaOrRateErr = err.message && (
        err.message.includes("Rate Limit") ||
        err.message.includes("429") ||
        err.message.includes("401") ||
        err.message.includes("403") ||
        err.message.includes("Quota") ||
        err.message.includes("exceeded")
      );

      // If not a rate/quota error or only 1 key, don't keep spinning keys endlessly unless quota/rate error
      if (!isQuotaOrRateErr && pKeys.length === 1) {
        throw err;
      }
    }
  }

  // All keys for this provider exhausted! Check if fallback provider available
  const nextProvider = getNextFallbackProvider(provider, keys, fallbackStack);
  if (nextProvider) {
    const errObj = new Error(lastError?.message || `${provider} quota exceeded across all keys.`);
    errObj.code = "FALLBACK_REQUIRED";
    errObj.currentProvider = provider;
    errObj.nextProvider = nextProvider;
    throw errObj;
  }

  throw lastError || new Error(`All keys exhausted for ${provider}`);
}
```

- [ ] **Step 2: Update `handleGenerate`, `handleDescribe`, `handleTopUp` in `background.js`**

Wrap `handleGenerate`, `handleDescribe`, and `handleTopUp` inside `executeWithKeyRotation`.

Update message listener in `background.js` to inspect error objects:
```javascript
if (e.code === "FALLBACK_REQUIRED") {
  sendResponse({
    success: false,
    code: "FALLBACK_REQUIRED",
    currentProvider: e.currentProvider,
    nextProvider: e.nextProvider,
    error: e.message
  });
} else {
  sendResponse({ success: false, error: e.message });
}
```

- [ ] **Step 3: Verification of background response**

Verify that when key fails and another key exists, it retries automatically. When all keys fail, it returns `code: "FALLBACK_REQUIRED"`.

---

### Task 3: Provider Fallback Modal/Card UI in `content.js` and `ui/panel.html`

**Files:**
- Modify: [`readytag_v2.0_public/ui/panel.html`](file:///C:/Users/niloy/Documents/ReadyTag/readytag_v2.0_public/ui/panel.html)
- Modify: [`readytag_v2.0_public/content.js`](file:///C:/Users/niloy/Documents/ReadyTag/readytag_v2.0_public/content.js)
- Modify: [`readytag_v2.0_public/content.css`](file:///C:/Users/niloy/Documents/ReadyTag/readytag_v2.0_public/content.css)

**Interfaces:**
- Consumes: Background error response containing `{ code: "FALLBACK_REQUIRED", currentProvider, nextProvider }`
- Produces: Confirmation banner inside panel Shadow DOM, switching active provider in storage on confirmation and auto-retrying generation.

- [ ] **Step 1: Add Fallback Card HTML in `ui/panel.html`**

Inside `ui/panel.html` (under `#mr-tab-generate`):
```html
<div id="mr-fallback-card" class="mr-fallback-card mr-hidden">
  <div class="mr-fallback-header">
    <span class="mr-fallback-icon">⚠️</span>
    <span id="mr-fallback-title" class="mr-fallback-title">Groq quota exceeded</span>
  </div>
  <div id="mr-fallback-msg" class="mr-fallback-msg">
    All Groq keys rate-limited. Switch to <strong>Gemini</strong> to continue?
  </div>
  <div class="mr-fallback-actions">
    <button id="mr-fallback-switch-btn" class="mr-btn-accent">Switch to Gemini & Retry</button>
    <button id="mr-fallback-cancel-btn" class="mr-btn-ghost">Cancel</button>
  </div>
</div>
```

- [ ] **Step 2: Add CSS styling for Fallback Card in `content.css`**

Add styles for `.mr-fallback-card`, `.mr-fallback-header`, `.mr-fallback-actions`, etc. to match the dark/light modern UI design.

- [ ] **Step 3: Intercept `FALLBACK_REQUIRED` and handle confirmation in `content.js`**

Implement helper `showFallbackPrompt(currentProvider, nextProvider, retryCallback)` in `content.js`:
- Populate `#mr-fallback-title` and `#mr-fallback-msg`.
- Show `#mr-fallback-card`.
- Attach click handler to `#mr-fallback-switch-btn`:
  - Set `chrome.storage.local.set({ provider: nextProvider })`.
  - Update `AppState.set({ provider: nextProvider })` or `#mr-prov-label`.
  - Hide `#mr-fallback-card`.
  - Execute `retryCallback()`.
- Attach click handler to `#mr-fallback-cancel-btn`:
  - Hide `#mr-fallback-card`.

In `handleGenerate` / batch process in `content.js`:
Catch `res.code === "FALLBACK_REQUIRED"`, call `showFallbackPrompt(res.currentProvider, res.nextProvider, () => retryGeneration())`.

---

### Task 4: Multi-Key Manager & Fallback Stack Reordering UI in `ui/panel.html` & `ui/panel.js`

**Files:**
- Modify: [`readytag_v2.0_public/ui/panel.html`](file:///C:/Users/niloy/Documents/ReadyTag/readytag_v2.0_public/ui/panel.html)
- Modify: [`readytag_v2.0_public/ui/panel.js`](file:///C:/Users/niloy/Documents/ReadyTag/readytag_v2.0_public/ui/panel.js)

**Interfaces:**
- Consumes: Storage schema with `keys` (object of arrays), `keyIndexes`, and `fallbackStack` array.
- Produces: Dynamic UI for adding/deleting multiple API keys per provider, and reordering fallback priority queue. Saves updated arrays to `chrome.storage.local`.

- [ ] **Step 1: Add Multi-Key Manager containers and Fallback Queue UI in `ui/panel.html`**

Update `#mr-settings-pane` in `ui/panel.html`:
Replace static API key single inputs with dynamic key container `#mr-multikey-container` for the selected provider, plus an `[+ Add Key]` button.
Add Card: **Provider Fallback Queue Priority** containing list `#mr-fallback-stack-list` with Move Up (`▲`) and Move Down (`▼`) buttons per provider.

- [ ] **Step 2: Implement key rendering, dynamic row addition/deletion, and stack reordering in `ui/panel.js`**

In `ui/panel.js`:
- Function `renderMultiKeyInputs(provider, keysArray, activeIndex)`:
  - Renders input rows for each key in `keysArray`.
  - Displays `#1 Active` badge next to index `activeIndex`.
  - Trash icon button `🗑️` to delete key row.
  - `+ Add Another Key` button appends a blank input field.
- Function `renderFallbackStackList(fallbackStack)`:
  - Renders ordered list of providers with `#1`, `#2`, etc.
  - Clicking `▲` swaps element with index - 1; clicking `▼` swaps with index + 1.
- Update Save Settings logic to collect all key inputs into arrays per provider, read `fallbackStack`, and save `{ keys, keyIndexes, fallbackStack }` to `chrome.storage.local`.

---

### Task 5: End-to-End Verification & Sanity Checks

**Files:**
- All modified files: `readytag_v2.0_public/state.js`, `readytag_v2.0_public/background.js`, `readytag_v2.0_public/content.js`, `readytag_v2.0_public/ui/panel.html`, `readytag_v2.0_public/ui/panel.js`, `readytag_v2.0_public/content.css`.

- [ ] **Step 1: Test Migration**
  - Run initial storage check. Verify legacy string keys migrate to single-element arrays without data loss.

- [ ] **Step 2: Test Key Rotation**
  - Simulate primary key failing (e.g. invalid key or 429).
  - Verify background worker seamlessly attempts key #2 and updates `keyIndexes`.

- [ ] **Step 3: Test Provider Fallback Prompt**
  - Simulate all keys failing for Provider 1.
  - Verify sidebar displays fallback confirmation prompt card.
  - Click "Switch & Retry", verify active provider changes and generation resumes.

- [ ] **Step 4: Code Quality & Syntax Verification**
  - Check for any lint/syntax errors across all touched files.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-07-27-api-stacking.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration
**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
