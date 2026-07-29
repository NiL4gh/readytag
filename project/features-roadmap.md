# Features & Roadmap

---

## Implemented — v1.x (MetaRefresh, archived)

- Sidebar panel with page-push and minimized state
- Cloudflare Worker proxy for multi-provider support
- Visual badge system (persistent "Done" markers on grid thumbnails)
- Asset fingerprinting via CDN URL patterns
- Onboarding wizard
- Custom prompt presets (saveable/deletable)
- SEO strategy selector (Contributor vs Adobe Recommended title/keyword ranges)
- Undo system for title and keywords
- Route-specific UI (upload page vs portfolio)
- Upload page support (Adobe Stock /uploads)
- Live asset preview thumbnail in panel
- Image Mode (vision AI for thumbnail analysis)
- Gemini 2.5 Flash provider

---

## Implemented — v2.0 (ReadyTag, current)

- **Modular architecture:** `state.js`, `api.js`, `strategies/*.js`, `content.js` (was 168KB monolith)
- **Shadow DOM isolation:** Closed shadow root (`#rt-host`) — no CSS bleed from host platform
- **MutationObserver:** Replaced setInterval polling for badge stamping and upload tile binding
- **IntersectionObserver leak fix:** `_observedImgSet` + `unobserve()` on DOM removal
- **Multi-platform:** Adobe Stock, Shutterstock, Freepik, Vecteezy (strategy pattern)
- **`qsa()` shadow DOM helper:** All panel-internal querySelectorAll calls updated
- **Batch Mode:** Toggle in Generate tab — auto-processes all visible assets in sequence (with Skip Tagged and Slow Mode options)
- **CSV Batch Export:** Full-tab drag-and-drop tool for local image files; downloads `.csv`
- **ReadyTag rebrand:** Extension renamed from MetaRefresh
- **Premium dark-first UI:** Midnight theme default; both themes elevated
- **10 AI providers:** Added DeepSeek, Mistral, ZhipuAI, Nvidia NIM, OpenRouter, xAI Grok
- **Vecteezy support:** 4th platform added
- **Standalone onboarding:** Full-tab wizard (`onboarding.html`)
- **Standalone CSV page:** Full-tab export (`csv.html`/`csv.js`)

---

## Planned Features

### 1. ReadyTag Pro / Token System

- **Status:** Not started. See [`monetization.md`](monetization.md) for full spec.
- LemonSqueezy + Cloudflare D1/KV
- Free tier: 50 tokens/month
- Pro: unlimited CSV batch, all presets, priority routing

### 2. Sequential Auto-Pilot (Batch Auto-Pilot)

- **Status:** Not started
- **Gate:** ReadyTag Pro feature
- Fully autonomous background loop — generates, saves, navigates to the next asset automatically
- Live progress dashboard, pause/resume, configurable inter-asset delay
- Targets live contributor portal (not local files — that's CSV Export)
- This is the flagship planned v2.x feature

### 3. Shutterstock / Freepik / Vecteezy Selector Validation

- **Status:** Selectors exist, need live DOM validation
- These platforms are code-complete but mark as production-ready only after confirming selectors against live portals

### 4. Trend-Aware Keyword Injection

- **Status:** Not started (requires external data source)
- Augment generated keywords with currently trending search terms from the target platform

### 5. Pre-Flight Rejection Scanner

- **Status:** Not started
- Before submitting, scan metadata against known rejection patterns (trademark terms, generic fillers, character overflow)

### 6. CWS Listing Update & Assets

- **Status:** Complete (Graphics Ready in `store_assets/`)
- CWS Store assets generated via StoreCraft Strategy Suite B ("Clean Contributor Studio")
- 5 high-res screenshots (1280x800), 1 small tile thumbnail (440x280), 1 marquee banner (1400x560) placed in [`store_assets/`](../../store_assets/)
- Ready for upload to Chrome Web Store Developer Dashboard under CWS Extension ID `achfpjlldepcapcecadonijoahbdpdfm`

---

## Known Issues & Technical Debt

1. **Shutterstock/Freepik/Vecteezy selectors unvalidated** — do not market these as production-ready until confirmed against live portals

2. **Grid badge desync** — if the host platform reloads the grid via AJAX without a full page refresh, badges may need a navigation event to re-scan. A 10s fallback `setInterval` in the MutationObserver setup mitigates but does not fully fix this.

3. **Sidebar shift** — some platform UI elements with `position: fixed` may not honor the `mr-pushed` body class correctly

4. **CSV Vision mode + Worker base64** — CSV batch Vision mode sends base64 data URLs to DESCRIBE_IMAGE. If the Worker tries to `fetch(imageUrl)` on a `data:` URL, it will fail silently. Validate Worker behaviour before marking Vision as a first-class CSV batch feature.

5. **CWS listing is stale** — live listing still shows MetaRefresh/v1.1.5 copy. v2.0 CWS submission is pending.

6. **Patreon URL** — `PATREON_URL` in `state.js` and banner CTAs in `content.js` still point to `patreon.com/MetaRefresh`. Update if the Patreon page is rebranded.

7. **Chrome Web Store review link** — banner CTA and onboarding still link to the v1.1.5 CWS page. Will need updating after v2.0 submission.
