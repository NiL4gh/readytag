# Handover Specification: API Stacking & Fallback System (v2.1)

> **Target Agent:** AI Coding Subagent / Developer  
> **Status:** Approved Architecture & Specification  
> **Date:** 2026-07-27  
> **Extension Path:** `readytag_v2.0_public/`  
> **Worker Path:** `readytag-worker/`

---

## 1. Objective

Implement **API Stacking (Hybrid Multi-Key & Multi-Provider Fallback)** for ReadyTag.  
Users will be able to:
1. Add multiple API keys per provider (e.g., `Groq Key 1`, `Groq Key 2`).
2. Define a prioritized provider fallback queue (e.g., `1. Groq` → `2. Gemini` → `3. DeepSeek`).
3. Handle rate limits (429), quota errors (401/403), or server failures (5xx) gracefully with automatic same-provider key rotation and user-confirmed provider switching.

---

## 2. Storage Schema Changes (`chrome.storage.local`)

### Existing Schema:
```json
{
  "provider": "groq",
  "keys": {
    "groq": "gsk_...",
    "gemini": "AIza...",
    "openai": ""
  }
}
```

### New Stacking Schema:
```json
{
  "provider": "groq",
  "keys": {
    "groq": ["gsk_key1...", "gsk_key2..."],
    "gemini": ["AIzaKey1..."],
    "deepseek": ["sk-key1...", "sk-key2..."],
    "openai": []
  },
  "keyIndexes": {
    "groq": 0,
    "gemini": 0,
    "deepseek": 0
  },
  "fallbackStack": ["groq", "gemini", "deepseek", "mistral", "zhipuai", "nvidia", "openai", "anthropic", "xai", "openrouter"]
}
```

*Backward Compatibility Requirement:*  
On startup in `background.js` or `state.js`, migrate legacy string keys (`keys.groq = "gsk_..."`) to single-element arrays (`keys.groq = ["gsk_..."]`).

---

## 3. Core Technical Flow

### Level 1: Automatic Same-Provider Key Rotation (`background.js`)
When `handleGenerate`, `handleDescribe`, or `handleTopUp` receives an error from the Worker/API (HTTP 429, 401, or network failure):
1. Check if the current provider has additional keys in its array (`keys[provider]`).
2. Increment `keyIndexes[provider]` and immediately retry the request with the next key.
3. If a stacked key succeeds, update `keyIndexes[provider]` in `chrome.storage.local` and complete the request seamlessly.

### Level 2: User-Confirmed Provider Switch (`background.js` & `content.js`)
When all keys for the current provider are exhausted:
1. `background.js` returns a structured error object to `content.js`:
   ```json
   {
     "success": false,
     "code": "FALLBACK_REQUIRED",
     "currentProvider": "groq",
     "nextProvider": "gemini",
     "error": "Groq rate limit reached across all 2 stacked keys."
   }
   ```
2. `content.js` intercepts `code: "FALLBACK_REQUIRED"` and renders a user confirmation banner/card in the sidebar panel:
   * **Title:** ⚠️ Groq quota exceeded
   * **Message:** All Groq keys rate-limited. Switch to **Gemini** to continue?
   * **Buttons:** `[Switch to Gemini & Retry]` `[Cancel]`
3. If the user clicks **Switch to Gemini**, `content.js` sets `provider = "gemini"` in storage/state and re-triggers generation automatically.

---

## 4. Required UI Updates

### A. Settings UI (`content.js` & `popup.html` / `popup.js`)
* Replace single API Key text inputs with a multi-key manager:
  * Display current key list for selected provider.
  * Add `[+ Add Another Key]` button.
  * Trash icon (`🗑️`) next to each key to remove it.
  * Key index/active badge (shows which key is currently primary).
* Add **Fallback Priority Queue** reordering:
  * List enabled providers with move-up / move-down arrows or priority numbers (`#1`, `#2`, `#3`).

---

## 5. File Map & Modification Checklist

- [ ] [`readytag_v2.0_public/background.js`](file:///C:/Users/niloy/Documents/ReadyTag/readytag_v2.0_public/background.js)
  - Update `keyForProvider()` to handle array of keys and active key index.
  - Wrap `handleGenerate` / `handleDescribe` / `handleTopUp` in a key-rotation loop.
  - Return `{ success: false, code: "FALLBACK_REQUIRED", nextProvider: ... }` when provider keys are exhausted.
  - Add migration logic in `onInstalled` / startup to convert legacy key strings into arrays.

- [ ] [`readytag_v2.0_public/state.js`](file:///C:/Users/niloy/Documents/ReadyTag/readytag_v2.0_public/state.js)
  - Add `keyIndexes` and `fallbackStack` to default state schema.
  - Add helper function `getNextFallbackProvider(currentProvider)`.

- [ ] [`readytag_v2.0_public/content.js`](file:///C:/Users/niloy/Documents/ReadyTag/readytag_v2.0_public/content.js)
  - Implement `renderFallbackPromptModal(currentProvider, nextProvider, onConfirm)` UI element inside the Shadow DOM panel.
  - Catch `FALLBACK_REQUIRED` in generation loops (single asset & batch mode).

- [ ] [`readytag_v2.0_public/popup.html`](file:///C:/Users/niloy/Documents/ReadyTag/readytag_v2.0_public/popup.html) & [`readytag_v2.0_public/popup.js`](file:///C:/Users/niloy/Documents/ReadyTag/readytag_v2.0_public/popup.js)
  - Update Settings pane to render multiple key inputs per provider and fallback stack order.

---

## 6. Verification & Test Criteria

1. **Migration Test:** Install v2.0 with a single Groq key. Verify startup converts it to `groq: ["key1"]` without error.
2. **Key Rotation Test:** Add 2 Groq keys (first one invalid/rate-limited). Verify background service worker automatically fails over to key 2 and completes metadata generation.
3. **Provider Fallback Test:** Add 1 invalid Groq key and 1 valid Gemini key. Trigger generation. Verify sidebar shows prompt: *"Groq quota exceeded. Switch to Gemini?"*. Confirm clicking **Switch to Gemini** successfully generates titles & keywords.
