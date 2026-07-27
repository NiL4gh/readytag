# Worker API Reference

Worker URL: `https://readytagworker.l-lawliet-620.workers.dev`  
Source: `readytag-worker/src/index.js` (auto-deploys from `NiL4gh/readytag-worker` main)  
CORS: Allows `chrome-extension://` and `moz-extension://` origins only.

For the full prompt system, processing pipeline, and vision logic — see `readytag-worker/CLAUDE.md`.

---

## POST /generate

Generates title + keywords for a stock asset.

**Request:**
```json
{
  "input": "description of the asset (text from title, or assembled by /describe)",
  "category": "generic | vector | illustration | photo | video",
  "provider": "groq | openai | anthropic | gemini-pro | deepseek | mistral | xai | nvidia | openrouter | zhipuai",
  "key": "<user's api key>",
  "titleLength": 180,
  "kwCount": 49,
  "style": "professional",
  "customPrompt": "additional context",
  "includeWords": "word1, word2",
  "excludeWords": "word3",
  "keywordsOnly": false,
  "titleOnly": false
}
```

**`titleLength` interpretation:**
- `≤110` → Adobe strategy: enforces 65–85 char title range
- `>110` → Contributor strategy: enforces 90–125 char title range

**`kwCount` interpretation:**
- `≤38` → Adobe strategy: 15–35 keywords
- `>38` → Contributor strategy: 35–45 keywords

**Success response:**
```json
{
  "success": true,
  "data": {
    "title": "...",
    "keywords": "word1,word2,...",
    "kwArray": ["word1", "word2"],
    "groqRate": { "remaining": 28, "reset": "10s" },
    "tMin": 90, "tLimit": 125,
    "kMin": 35, "kLimit": 45
  }
}
```

**Error response:**
```json
{ "success": false, "error": "error message" }
```

---

## POST /topup

Adds keywords to an existing set. Used by:
1. User's "Top Up Keywords" button in the panel
2. Automatic keyword floor enforcement inside `/generate`

**Request:**
```json
{
  "existing": ["word1", "word2"],
  "need": 15,
  "input": "asset description",
  "provider": "groq",
  "key": "<api-key>"
}
```

**Success response:**
```json
{ "success": true, "data": { "extras": ["newword1", "newword2"] } }
```

---

## POST /describe

Analyses a thumbnail image and returns a structured description for use as `input` to `/generate`.

**Request:**
```json
{
  "imageUrl": "https://cdn.example.com/image.jpg",
  "provider": "groq",
  "key": "<api-key>"
}
```

**Success response:**
```json
{
  "success": true,
  "data": {
    "input": "golden retriever puppy lying on grass, outdoor park with autumn trees, eye-level photo, warm earth tones, serene, soft fur, natural lighting, shallow depth of field"
  }
}
```

The Worker fetches the image, converts to base64, calls the vision model with `DESCRIBE_PROMPT`, parses the structured JSON response, and assembles the fields into a comma-separated `input` string.

**Vision support by provider:**
| Provider | Vision model |
|---------|-------------|
| groq | `meta-llama/llama-4-scout-17b-16e-instruct` |
| openai | `gpt-4o` |
| anthropic | `claude-sonnet-4-6` |
| gemini-pro | `gemini-2.5-flash` |
| nvidia | `meta/llama-3.2-90b-vision-instruct` |
| openrouter | `meta-llama/llama-3.2-90b-vision-instruct:free` |
| zhipuai | `glm-4v-flash` |
| xai | `grok-2-vision-1212` |
| mistral | `pixtral-12b-2409` |
| deepseek | ❌ throws: "DeepSeek does not support Image Mode" |

---

## background.js Integration

`background.js` calls these endpoints via `fetchWithRetry()` (1 retry on 5xx, surfaces 429 with `Retry-After`).

`WORKER_URL` constant is on **line 6** of `background.js`. Update it there if the worker URL ever changes — also update `host_permissions` in `manifest.json`.
