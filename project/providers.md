# AI Providers

---

## Provider Table

| Key | Display name | Text model | Vision model | API base | Storage key | Free |
|-----|-------------|-----------|-------------|---------|-------------|------|
| `groq` | Groq — Llama 3.3 70B | `llama-3.3-70b-versatile` | `meta-llama/llama-4-scout-17b-16e-instruct` | `https://api.groq.com/openai/v1` | `groqKey` | Yes (default) |
| `openai` | OpenAI — GPT-4o | `gpt-4o` | `gpt-4o` | `https://api.openai.com/v1` | `openaiKey` | Paid |
| `anthropic` | Anthropic — Claude Sonnet | `claude-sonnet-4-6` | `claude-sonnet-4-6` | `https://api.anthropic.com/v1/messages` | `anthropicKey` | Paid |
| `gemini-pro` | Google — Gemini 2.5 Flash | `gemini-2.5-flash` | `gemini-2.5-flash` | `https://generativelanguage.googleapis.com/v1beta` | `geminiKey` | Yes |
| `deepseek` | DeepSeek — V3 | `deepseek-chat` | ❌ throws error | `https://api.deepseek.com/v1` | `deepseekKey` | Yes |
| `mistral` | Mistral — Large | `mistral-large-latest` | `pixtral-12b-2409` | `https://api.mistral.ai/v1` | `mistralKey` | Yes |
| `xai` | xAI — Grok 3 | `grok-3` | `grok-2-vision-1212` | `https://api.x.ai/v1` | `xaiKey` | Paid |
| `nvidia` | Nvidia NIM — Llama 405B | `meta/llama-3.1-405b-instruct` | `meta/llama-3.2-90b-vision-instruct` | `https://integrate.api.nvidia.com/v1` | `nvidiaKey` | Yes |
| `openrouter` | OpenRouter — Gemini Flash (free) | `google/gemini-2.0-flash-exp:free` | `meta-llama/llama-3.2-90b-vision-instruct:free` | `https://openrouter.ai/api/v1` | `openrouterKey` | Yes |
| `zhipuai` | ZhipuAI — GLM-4 Flash | `glm-4-flash` | `glm-4v-flash` | `https://open.bigmodel.cn/api/paas/v4` | `zhipuaiKey` | Yes |

---

## Provider Notes

**Groq**
- Default provider. Returns rate limit headers: `x-ratelimit-remaining-requests`, `x-ratelimit-reset-requests`
- Worker's `parseGroqRate()` extracts these and returns them as `groqRate` in the response
- Extension shows remaining request count in the panel footer
- Vision model is different from text model

**Anthropic**
- Uses `x-api-key: <key>` header instead of `Authorization: Bearer <key>`
- Uses `anthropic-version: 2023-06-01` header
- Response format: `content[0].text` (not `choices[0].message.content`)
- No `response_format: { type: "json_object" }` support — model must be prompted to output JSON

**Gemini**
- Uses query param auth: `?key=<apikey>` (not auth header)
- Uses `system_instruction` field instead of system role in messages
- `thinkingConfig: { thinkingBudget: 0 }` disables chain-of-thought (saves tokens + latency)
- No `json_object` response format — model must output JSON naturally
- Response: `candidates[0].content.parts[].text`
- `geminiKey` is used for both `gemini` and `gemini-pro` provider IDs

**DeepSeek**
- Vision not supported — throws explicit user-visible error: "DeepSeek does not support Image Mode."
- Otherwise OpenAI-compatible (`/v1/chat/completions`, `json_object` mode)

**OpenRouter**
- Requires extra headers: `HTTP-Referer: https://nil4gh.github.io/readytag`, `X-Title: ReadyTag`
- Returns text-only (no `json_object` mode on free model) — model must output JSON naturally

**ZhipuAI**
- Vision model (`glm-4v-flash`) is different from text model (`glm-4-flash`)
- OpenAI-compatible endpoint

**Nvidia NIM**
- Both text and vision use OpenAI-compatible format
- Free tier available at `build.nvidia.com`

---

## Key Mapping (critical)

`chrome.storage.local` uses keys with `Key` suffix. `content.js` remaps when building the IPC `keys` object:

```javascript
const keys = {
  groq:         settings?.groqKey       || "",
  openai:       settings?.openaiKey     || "",
  anthropic:    settings?.anthropicKey  || "",
  gemini:       settings?.geminiKey     || "",
  "gemini-pro": settings?.geminiKey     || "",  // same key, two provider IDs
  deepseek:     settings?.deepseekKey   || "",
  mistral:      settings?.mistralKey    || "",
  xai:          settings?.xaiKey        || "",
  nvidia:       settings?.nvidiaKey     || "",
  openrouter:   settings?.openrouterKey || "",
  zhipuai:      settings?.zhipuaiKey    || "",
};
```

`background.js:keyForProvider(provider, keys)` then selects `keys[provider]`.

---

## Adding a New Provider

1. Add `callNewProvider()` in `readytag-worker/src/index.js`
2. Add case in `callProvider()` switch
3. If vision supported: add `callNewProviderVision()` and case in `handleDescribe()` switch
4. In extension: add storage key mapping in `content.js` keys object
5. Add dropdown item in `content.js` settings pane HTML (`data-val="newprovider"`)
6. Add to `popup.html` `PROVIDER_LABELS` object
7. Add card in `onboarding.html` provider selection step
8. Add `newproviderKey` to the storage schema doc
9. Update this file
