# Prompt System

The full implementation lives in `readytag-worker/src/index.js`. This doc explains the design so you can make changes correctly.

For the complete implementation reference, read `readytag-worker/CLAUDE.md`.

---

## Overview

The worker builds an XML-structured system prompt for each generate call via `buildPrompt(category, isSet, options)`. The AI must return a JSON object: `{"title":"...","keywords":"word1,word2,..."}`.

---

## Prompt Assembly Order

Each section is an XML tag. Sections are always included in this order; optional blocks appear only when the user supplied the corresponding parameter.

1. Opening persona: "expert specialist metadata writer for digital stock asset marketplaces"
2. `<WritingPhilosophy>` — satisfy algorithms + humans; vary the lead; natural prepositional phrases
3. `<AssetCategoryRules>` — format-specific keyword/title guidance from `CATEGORY_ADDONS[category]`
4. `<CollectionAssetIdentity>` or `<SingleAssetIdentity>` — detected by `isSetAsset(input)` (checks: set/pack/bundle/collection/kit/assortment/composite)
5. _(optional)_ `<MandatoryToneStyle>` — from `style` param
6. _(optional)_ `<CriticalExtraContext>` — from `customPrompt` param; "takes precedence over generic observations"
7. _(optional)_ `<MandatoryInclusions>` — from `includeWords` param
8. _(optional)_ `<StrictExclusions>` — from `excludeWords` param
9. `<KeywordRules>` — count, ordering, multi-word rules, noun/verb forms, discipline
10. `<TitleRules>` — character range, counting requirement, tips, correct-length examples
11. `<FormattingConstraints>` — title and keyword punctuation rules
12. `<NegativeConstraints>` — hard ceiling + forbidden terms list
13. `<OutputFormat>` — "Respond ONLY with a valid JSON object. No markdown, no preamble."

---

## Category Addons

| Category | Format keywords instructed | Title guidance |
|----------|--------------------------|----------------|
| `generic` | None — no format bias | Let use-case context guide commercial focus |
| `vector` | `vector, eps, svg, clipart, silhouette, scalable, illustration` | Weave vector context naturally into Part B; never start keywords with format terms |
| `illustration` | `illustration, drawing, artwork, digital, sketch, painterly` | Visual quality and subject first; never start keywords with "illustration" |
| `photo` | `photography, photo, image, stock, picture, shot` | Subject and scene first; never use vector/eps/svg |
| `video` | `video, footage, clip, motion, loop, animation, seamless` | Subject first, motion quality and loop status second; never start with "video" |

---

## Title Rules

| Strategy | `titleLength` param | Enforced range |
|---------|-------------------|----------------|
| Adobe Recommended | `≤110` (sent as 85) | 65–85 characters |
| SEO Focused (default) | `>110` (sent as 180) | 90–125 characters |

The prompt includes correct-length examples and explicit counting instructions. If the first response is too short, the worker makes one retry call with the short title quoted and asks for expansion.

**Forbidden in titles:**
- Connector phrases: "ideal for", "perfect for", "suitable for", "great for", "can be used for", "designed for"
- Formulaic openers: "vector illustration of", "silhouette of a", "high resolution", "this is", "a beautiful"
- Adjective stacking: "bold clean modern minimalist professional"
- Filler praise: "beautiful", "stunning", "amazing", "high quality"
- Use-case chains: "for logos, branding, packaging, marketing, and print"
- Punctuation other than commas and periods (hyphens in compound adjectives OK)
- Brand names and copyright/watermark terms (same list as keywords)

---

## Keyword Rules

**Count:** `35–45` (contributor) or `15–35` (adobe). Every keyword must be earned.

**Ordering:**
- Positions 1–5: Mirror the most important words from the generated title exactly
- Positions 6–15: Deep subject-specific terms
- Positions 16+: Format terms, then earned commercial/style/discovery terms

**Noun/verb form:**
- Nouns: always singular (`dog` not `dogs`)
- Verbs: infinitive root (`run` not `running`, `smile` not `smiling`)

**Allowed multi-word keyphrases (never split these):**
`close up, social media, user interface, artificial intelligence, credit card, real estate, virtual reality, machine learning, smart home, oil painting, watercolor painting, graphic design, web design, vector art, golden retriever, cherry blossom, french bulldog, great white shark, high angle, aerial view, depth of field`

**Must split (adjective+noun, verb+noun, subject+format):**
`blue sky → blue, sky` | `dog running → dog, run` | `flower vector → flower, vector`

Self-audit test: "Can the parts be separated without changing the core unique meaning?" If yes → split.

**Forbidden everywhere (title + keywords):**
- Brand names: `adobe, shutterstock, freepik, photoshop, illustrator, canva, figma`
- Copyright/metadata noise: `watermark, watermarked, copyright, signature, high resolution, stock photo, free illustration, premium vector`
- Generic fillers in first 25 keyword positions: `background, illustration, vector, design, isolated, white, graphic`

---

## Post-Processing Pipeline

After the AI responds, the worker runs these steps in order:

1. **JSON parsing** — strip markdown fences → extract `{…}` → `JSON.parse()`. Regex fallback on failure. Throws with raw preview if completely unparseable.

2. **Title ceiling** — `trimTitle(title, tLimit, tMin)`: smart truncation preferring word boundaries, then comma boundaries, then hard slice. Strips dangling prepositions.

3. **Title floor** — if `title.length < tMin` (and not `keywordsOnly`): one retry call to same provider with the short title quoted and explicit expansion instructions.

4. **Keyword floor** — if `kwArray.length < kMin` (and not `titleOnly`): one embedded topup call requesting `kMin - current + 8` extra keywords. Deduplicates against existing set.

5. **Keyword healing** — `healKeywords(kwArray)`: detects split cohesive keyphrases (e.g. `["close","up"]`) and reassembles them at the position of the first part. Runs after both initial generation and any topup.

6. **Final cap** — slice to `kLimit + 5`, deduplicate, return.

---

## Vision Description Prompt (DESCRIBE_PROMPT)

Returns structured JSON for the `/describe` route:

```json
{
  "subject": "specific detailed noun phrase",
  "scene": "background/setting or 'isolated'",
  "style": "photo | illustration | vector | 3d-render | screenshot | video",
  "perspective": "close-up | eye-level | wide-shot | aerial | unknown",
  "colors": "2-3 dominant colors or color mood",
  "mood": "one or two words",
  "descriptors": ["3-5 visual descriptors based only on what is visible"],
  "isCollection": true | false
}
```

Assembled into `input` string: `subject, scene, perspective+style, colors, mood, ...descriptors`

For collection assets: `subject` has collection words stripped and " set" appended.

**Key rules in the prompt:**
- Identify specific breeds, species, landmarks (e.g. "German Shepherd" not "dog", "Colosseum in Rome" not "amphitheater")
- Base everything strictly on the image — never invent
- `descriptors` must be an array of 3–5 strings
- `style` and `perspective` must use exact allowed values only
