# Technical Design Specification: Cross-Site SEO Overhaul & 2026 Trending Blog Launches

- **Date:** 2026-09-26
- **Target Projects:**
  1. **ReadyTag Website:** `D:\Projects\ReadyTag\site`
  2. **Niloy Illustrator Script Suite:** `D:\Projects\Illustrator Scripts\website`

---

## 1. Executive Summary & Root Cause Analysis

### Problems Identified in Existing SEO Implementations:
1. **Social Preview Failure (OpenGraph & Twitter):**
   - ReadyTag uses `https://nil4gh.github.io/readytag/assets/icon128.png` (128x128px) for `og:image` and `twitter:image`. Twitter requires a minimum of 300x157px for `summary_large_image` cards, and modern social platforms recommend 1200x630px. Cards currently render distorted or fail rich card validation entirely.
2. **Schema.org Incomplete Entity Graphs:**
   - ReadyTag articles lack `BreadcrumbList` schema and omit the mandatory `image` field in `Article` schema, triggering Google Search Console warnings.
   - Author entity definitions are shallow, lacking E-E-A-T signals (`sameAs` links to GitHub, verified portfolio).
3. **Sitemap Omissions & Lastmod Desynchronization:**
   - ReadyTag's `why-readytag-is-the-leading-metadata-tool.html` is missing from `sitemap.xml`.
   - Stale `<lastmod>` tags do not reflect content improvements.
4. **Missing Product-Led Internal Linking & FAQ Structured Data:**
   - Articles lack contextual cross-links to category landing pages (`/adobe-stock/`, `/freepik/`, `/vecteezy/`, `/shutterstock/`) and lack interactive FAQ accordions supported by `FAQPage` or structured sections.

---

## 2. 2026 Modern SEO Standard Architecture

All existing and new blog pages will be aligned with this unified standard:

### A. Metadata & OpenGraph
- **Title Tag:** `[Primary Keyword Under 60 Chars] | [Brand]`
- **Meta Description:** 135–155 characters with primary and secondary keywords, active voice, and clear search intent resolution.
- **Canonical:** Self-referential absolute HTTPS URL matching exact file structure.
- **Robots:** `index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1`
- **Social Tags:**
  - `og:type` = `article`
  - `og:site_name` = `ReadyTag` / `Niloy Illustrator Script Suite`
  - `og:locale` = `en_US`
  - `og:image` = high-resolution 1200x630 (or 1280x800) image with explicit `og:image:width`, `og:image:height`, and `og:image:alt`
  - `twitter:card` = `summary_large_image`
  - `article:published_time` & `article:modified_time` in ISO 8601 format.

### B. Schema.org Entity-First JSON-LD `@graph`
Every article will embed a unified `@graph` containing:
1. `Organization`: Stable `@id`, official name, URL, high-res logo `ImageObject`, and `sameAs` array (GitHub repository, Chrome Web Store).
2. `Person` (Author): Stable `@id`, name, job title, and social/GitHub profile link for verified E-E-A-T authority.
3. `BreadcrumbList`: Level 1 (Home), Level 2 (Blog Index), Level 3 (Article).
4. `BlogPosting` / `Article`: Headline, description, canonical `@id`, featured image URL, publication/modification timestamps, author `@id`, publisher `@id`, and target keywords.

### C. Content & Core Web Vitals (CWV)
- Single semantic `<h1>` tag with primary search query.
- Strict heading progression: `<h2>` -> `<h3>` (no skips).
- All inline `<img>` tags equipped with explicit `width`, `height`, descriptive `alt` tags, and `loading="lazy"`.
- Product-Led callouts: Actionable code/workflows solving search intent, naturally linking to ReadyTag Chrome Extension and StockVector Exporter Pro.

---

## 3. Blog Posts & Scope of Changes

### Project A: ReadyTag (`D:\Projects\ReadyTag\site`)
1. **Asset Optimization:**
   - Copy high-resolution marketing graphic `store_assets/01_01-hero---automate-stock-metadata_1280x800.png` to `site/assets/readytag-og-card.png`.
2. **New Blog Post Creation:**
   - **Path:** `site/blog/adobe-stock-dynamic-upload-limits-guide-2026.html`
   - **Title:** "Adobe Stock Dynamic Upload Limits (2026): How to Protect Your Quota with Compliant Metadata | ReadyTag"
   - **Primary Keyword:** `adobe stock dynamic upload limits 2026`, `adobe stock weekly submission cap`
   - **Content:** Explains how Adobe's 2026 weekly quota algorithm calculates limits based on contributor acceptance rates, how "too similar" and misleading keyword penalties throttle limits, and how ReadyTag's BYOK AI prompt engineering ensures compliant titles and tags to maintain maximum tier limits.
3. **Existing Blogs Upgraded to Modern SEO Standard:**
   - `why-adobe-stock-rejects-your-files.html`
   - `freepik-contributor-seo-keywording-guide.html`
   - `adobe-stock-keywording-with-ai.html`
   - `mastering-shutterstock-keywording-with-ai.html`
   - `maximizing-stock-earnings-with-ai.html`
   - `why-readytag-is-the-leading-metadata-tool.html`
4. **Site Hub & Technical Files:**
   - `site/blog/index.html`: Update blog listing to feature the new 2026 dynamic limits guide, refresh cards with high-res badges, and ensure consistent internal linking.
   - `site/sitemap.xml`: Add the new article, add the previously missing `why-readytag-is-the-leading-metadata-tool.html`, and update all `<lastmod>` timestamps to `2026-09-26`.

---

### Project B: Illustrator Scripts (`D:\Projects\Illustrator Scripts\website`)
1. **New Blog Post Creation:**
   - **Path:** `website/blog/fixing-stock-vector-rejections-illustrator-preflight-guide/index.html`
   - **Title:** "Fixing Stock Vector Rejections: The Automated Adobe Illustrator Preflight Checklist (2026) // Niloy Scripts"
   - **Primary Keyword:** `adobe stock vector rejection fix`, `illustrator vector preflight checklist 2026`
   - **Content:** Technical breakdown of the top 5 vector rejection causes on Adobe Stock and Freepik: stray points, unexpanded strokes/appearances, clipping masks outside artboards, embedded raster textures, and RGB-to-CMYK shifts. Demonstrates automated inspection scripts and batch preflight with StockVector Exporter Pro.
2. **Existing Blogs Upgraded to Modern SEO Standard:**
   - `website/blog/how-to-batch-export-vectors-adobe-illustrator/index.html`
   - `website/blog/stock-vector-eps10-preflight-submission-guide/index.html`
   - Upgrade JSON-LD `@graph`, fix missing OG metadata (`og:locale`, `og:image:width`, `og:image:height`), add robots directive.
3. **Site Hub & Technical Files:**
   - `website/blog/index.html`: Add the new preflight guide card, update article counters and terminal archive text.
   - `website/sitemap.xml`: Add the new article URL and update `<lastmod>` timestamps.

---

## 4. Verification & Testing Plan
1. **Structured Data Validation:**
   - Validate JSON-LD syntax and required properties (`@context`, `@type`, `headline`, `image`, `publisher`, `author`, `itemListElement`).
2. **Link Integrity & Asset Resolution:**
   - Verify all canonical URLs, relative CSS/image paths, and internal hyperlinks resolve with HTTP 200 equivalent.
3. **Sitemap XML Validation:**
   - Validate XML schema of both `sitemap.xml` files.
4. **Visual Layout & Responsiveness:**
   - Verify styling consistency across desktop and mobile viewport breakpoints.
