# Chrome Storage Schema

All data lives in `chrome.storage.local`. Retrieve everything at once via `GET_SETTINGS` IPC (returns the full storage object). Save via `SAVE_SETTINGS` IPC.

---

## API Keys & Provider

| Key | Type | Description |
|-----|------|-------------|
| `provider` | string | Active provider ID: `"groq"` \| `"openai"` \| `"anthropic"` \| `"gemini-pro"` \| `"deepseek"` \| `"mistral"` \| `"xai"` \| `"nvidia"` \| `"openrouter"` \| `"zhipuai"` |
| `groqKey` | string | Groq API key |
| `openaiKey` | string | OpenAI API key |
| `anthropicKey` | string | Anthropic API key |
| `geminiKey` | string | Google Gemini key (used for both `gemini` and `gemini-pro` provider IDs) |
| `deepseekKey` | string | DeepSeek API key |
| `mistralKey` | string | Mistral API key |
| `xaiKey` | string | xAI (Grok) API key |
| `nvidiaKey` | string | Nvidia NIM API key |
| `openrouterKey` | string | OpenRouter API key |
| `zhipuaiKey` | string | ZhipuAI API key |

---

## Settings

| Key | Type | Description |
|-----|------|-------------|
| `imageMode` | boolean | Whether vision analysis is enabled |
| `theme` | `"dark"` \| `"light"` | Panel theme. Dark is default. |
| `visualBadge` | boolean | Whether grid thumbnail badges are shown |

---

## Session & History

| Key | Type | Description |
|-----|------|-------------|
| `sessionCallCount` | number | Cumulative API call counter, persisted across MV3 service worker restarts |
| `mrUndoLog` | object | `{ [assetId]: { origTitle: string, origKw: string } }` — capped at 50 entries by `persistUndoLog()` |
| `assetHistory` | object | Per-asset metadata snapshot: `{ [assetId]: { title, keywords, timestamp } }` |
| `sessionLog` | array | History tab entries (log of all generation runs this session) |
| `entryCounter` | number | Running count for human-readable `#N` log entry IDs |

---

## Onboarding

| Key | Type | Description |
|-----|------|-------------|
| `onboardingDone` | boolean | Set to `true` after onboarding completes. Prevents re-showing on reload/reinstall. |

---

## Customization Presets

| Key | Type | Description |
|-----|------|-------------|
| `customPresets` | array | User-saved presets: `[{ name, tone, context, includeWords, excludeWords, titleStrategy, kwStrategy }]` |

---

## Key Mapping Note

Storage keys use the `Key` suffix (`groqKey`, `openaiKey`, etc.). When `content.js` builds the IPC `keys` object for GENERATE/DESCRIBE calls, it remaps them:

```javascript
const keys = {
  groq:         settings?.groqKey       || "",
  openai:       settings?.openaiKey     || "",
  // ... etc
};
```

`background.js:keyForProvider(provider, keys)` then picks `keys[provider]` (no `Key` suffix).
