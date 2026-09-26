# Cross-Site SEO Overhaul & Trending Blog Launches Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul technical & on-page SEO across all existing blog posts on ReadyTag and Illustrator Scripts websites, and author/publish two high-impact 2026 trending blog posts with complete structured data entity graphs and product-led conversions.

**Architecture:** Static HTML5 with vanilla semantic architecture, entity-first Schema.org JSON-LD (`@graph`), high-fidelity OpenGraph/Twitter social cards (1280x800 / 1920x1080), validated XML sitemaps, and strict internal linking hierarchy.

**Tech Stack:** HTML5, CSS3, JSON-LD Schema.org, XML Sitemaps, PowerShell for verification.

## Global Constraints
- Target 1: ReadyTag Site (`D:\Projects\ReadyTag\site`)
- Target 2: Illustrator Scripts Site (`D:\Projects\Illustrator Scripts\website`)
- Canonical Base URL 1: `https://nil4gh.github.io/readytag/`
- Canonical Base URL 2: `https://nil4gh.github.io/nildevscripts/`
- Social image size: minimum 1200x630px (never 128x128px icons)
- Date stamp: `2026-09-26`

---

### Task 1: Asset Preparation & Social Card Creation for ReadyTag

**Files:**
- Create: `D:\Projects\ReadyTag\site\assets\readytag-og-card.png`
- Source: `D:\Projects\ReadyTag\store_assets\01_01-hero---automate-stock-metadata_1280x800.png`

**Interfaces:**
- Consumes: Existing marketing banner (1280x800 png)
- Produces: `https://nil4gh.github.io/readytag/assets/readytag-og-card.png` for all OG/Twitter cards

- [ ] **Step 1: Copy high-resolution graphic to site assets**
```powershell
Copy-Item -Path "D:\Projects\ReadyTag\store_assets\01_01-hero---automate-stock-metadata_1280x800.png" -Destination "D:\Projects\ReadyTag\site\assets\readytag-og-card.png" -Force
```

- [ ] **Step 2: Verify file existence and size**
```powershell
Get-Item -Path "D:\Projects\ReadyTag\site\assets\readytag-og-card.png" | Select-Object Name, Length
```

---

### Task 2: Author and Publish New Trending Blog for ReadyTag

**Files:**
- Create: `D:\Projects\ReadyTag\site\blog\adobe-stock-dynamic-upload-limits-guide-2026.html`

**Content Requirements:**
- **Title:** `Adobe Stock Dynamic Upload Limits (2026): How to Protect Your Quota with Compliant Metadata | ReadyTag`
- **Slug:** `adobe-stock-dynamic-upload-limits-guide-2026.html`
- **Primary Keywords:** `adobe stock dynamic upload limits 2026`, `adobe stock weekly submission cap`, `adobe stock metadata compliance`
- **Structure:**
  - H1: Adobe Stock Dynamic Upload Limits in 2026: Why Metadata Quality Dictates Your Weekly Quota
  - Section 1: The 2026 Shift from Fixed Upload Caps to Dynamic Acceptance Tiers
  - Section 2: How Adobe's Review Filter Flags Redundant & Spammy Metadata
  - Section 3: The "Too Similar" Algorithmic Penalty Explained
  - Section 4: 4 Rules for Compliant, High-Conversion Metadata That Keeps Limits Maxed
  - Section 5: Step-by-Step BYOK Workflow with ReadyTag
  - Section 6: FAQ Accordion with 3 core contributor questions
  - Related Guides + CTA to ReadyTag Chrome Extension
- **Structured Data:** Full `@graph` including `WebSite`, `Organization`, `Person`, `BreadcrumbList`, and `BlogPosting`.

- [ ] **Step 1: Write the complete HTML file**
Create `D:\Projects\ReadyTag\site\blog\adobe-stock-dynamic-upload-limits-guide-2026.html`.

- [ ] **Step 2: Verify HTML and Schema markup**
Verify that canonical URL, OG tags, and JSON-LD parse without syntax error.

---

### Task 3: Apply SEO Overhaul to All 6 Existing ReadyTag Blogs

**Files:**
- Modify: `D:\Projects\ReadyTag\site\blog\adobe-stock-keywording-with-ai.html`
- Modify: `D:\Projects\ReadyTag\site\blog\freepik-contributor-seo-keywording-guide.html`
- Modify: `D:\Projects\ReadyTag\site\blog\mastering-shutterstock-keywording-with-ai.html`
- Modify: `D:\Projects\ReadyTag\site\blog\maximizing-stock-earnings-with-ai.html`
- Modify: `D:\Projects\ReadyTag\site\blog\why-adobe-stock-rejects-your-files.html`
- Modify: `D:\Projects\ReadyTag\site\blog\why-readytag-is-the-leading-metadata-tool.html`

**Changes for Each File:**
1. Upgrade `og:image` and `twitter:image` from `icon128.png` to `https://nil4gh.github.io/readytag/assets/readytag-og-card.png`.
2. Add `og:image:width` (1280), `og:image:height` (800), `og:image:type` (image/png), `og:locale` (`en_US`), and `og:site_name` (`ReadyTag`).
3. Add `robots` meta tag: `index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1`.
4. Update Schema.org to entity `@graph`: include `BreadcrumbList`, proper author credentials, publisher organization with logo, and image URL in `Article`.
5. Update `dateModified` to `2026-09-26`.

- [ ] **Step 1: Update metadata & schema in each of the 6 files**
- [ ] **Step 2: Validate JSON-LD script blocks across all 6 files**

---

### Task 4: Update ReadyTag Blog Index and Sitemap

**Files:**
- Modify: `D:\Projects\ReadyTag\site\blog\index.html`
- Modify: `D:\Projects\ReadyTag\site\sitemap.xml`

**Changes:**
1. In `blog/index.html`:
   - Add feature card for the new article "Adobe Stock Dynamic Upload Limits (2026)" at top of grid.
   - Update article count and ensure all 7 articles are indexed.
2. In `sitemap.xml`:
   - Add `https://nil4gh.github.io/readytag/blog/adobe-stock-dynamic-upload-limits-guide-2026.html` (priority 0.8).
   - Add missing `https://nil4gh.github.io/readytag/blog/why-readytag-is-the-leading-metadata-tool.html` (priority 0.7).
   - Update `<lastmod>2026-09-26</lastmod>` for all active blog URLs.

- [ ] **Step 1: Update blog index HTML**
- [ ] **Step 2: Update sitemap.xml**
- [ ] **Step 3: Verify sitemap XML syntax**

---

### Task 5: Author and Publish New Trending Blog for Illustrator Scripts

**Files:**
- Create: `D:\Projects\Illustrator Scripts\website\blog\fixing-stock-vector-rejections-illustrator-preflight-guide\index.html`

**Content Requirements:**
- **Title:** `Fixing Stock Vector Rejections: The Automated Adobe Illustrator Preflight Checklist (2026) // Niloy Scripts`
- **Slug:** `fixing-stock-vector-rejections-illustrator-preflight-guide`
- **Primary Keywords:** `adobe stock vector rejection fix`, `illustrator vector preflight checklist 2026`, `freepik vector submission errors`
- **Structure:**
  - H1: Fixing Stock Vector Rejections: The Automated Adobe Illustrator Preflight Checklist (2026)
  - Section 1: The Anatomy of a Stock Vector Rejection (Why 40% of Uploads Fail Review)
  - Section 2: Defect 1: Stray Anchor Points & Open Path Micro-Gaps
  - Section 3: Defect 2: Unexpanded Appearances, Brushes, and Pattern Fills
  - Section 4: Defect 3: Ghost Layers & Elements Outside the Artboard Boundary
  - Section 5: Defect 4: Embedded Raster Effects & The EPS 10 Color Shift Trap
  - Section 6: Automated Preflight with ExtendScript: Production Code Snippet
  - Section 7: Batch Sanitization with StockVector Exporter Pro
  - Section 8: FAQ & Technical Troubleshooting
  - Related Guides + GitHub CTA
- **Structured Data:** Unified `@graph` with `BreadcrumbList`, `BlogPosting`, `Person` author (`Niloy`), and `Organization`.

- [ ] **Step 1: Write the complete HTML file**
Create `D:\Projects\Illustrator Scripts\website\blog\fixing-stock-vector-rejections-illustrator-preflight-guide\index.html`.

- [ ] **Step 2: Verify HTML and Schema markup**
Verify that canonical URL, OG tags, and JSON-LD parse without syntax error.

---

### Task 6: Apply SEO Overhaul to Existing Illustrator Scripts Blogs

**Files:**
- Modify: `D:\Projects\Illustrator Scripts\website\blog\how-to-batch-export-vectors-adobe-illustrator\index.html`
- Modify: `D:\Projects\Illustrator Scripts\website\blog\stock-vector-eps10-preflight-submission-guide\index.html`

**Changes for Each File:**
1. Add `og:locale` (`en_US`), `og:image:width` (1920), `og:image:height` (1080), `og:image:alt`.
2. Add `robots` directive: `index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1`.
3. Enhance Schema.org `@graph` author definition with `sameAs` link to GitHub profile (`https://github.com/NiL4gh`).
4. Update `dateModified` to `2026-09-26`.

- [ ] **Step 1: Update metadata and schema in both files**
- [ ] **Step 2: Validate JSON-LD script blocks in both files**

---

### Task 7: Update Illustrator Scripts Blog Index and Sitemap

**Files:**
- Modify: `D:\Projects\Illustrator Scripts\website\blog\index.html`
- Modify: `D:\Projects\Illustrator Scripts\website\sitemap.xml`

**Changes:**
1. In `blog/index.html`:
   - Add catalog card for `fixing-stock-vector-rejections-illustrator-preflight-guide/`.
   - Update counter to `3 ARTICLES INDEXED`.
2. In `sitemap.xml`:
   - Add `https://nil4gh.github.io/nildevscripts/blog/fixing-stock-vector-rejections-illustrator-preflight-guide/` (priority 0.8).
   - Update `<lastmod>2026-09-26</lastmod>`.

- [ ] **Step 1: Update blog index HTML**
- [ ] **Step 2: Update sitemap.xml**
- [ ] **Step 3: Verify sitemap XML syntax**

---

### Task 8: End-to-End Automated Validation & Integrity Check

**Files:**
- Run test script on all touched files in both repositories.

- [ ] **Step 1: Write and run verification script**
Check:
- JSON-LD syntax validity across all modified and newly created blog files.
- Existence of high-res OG image targets.
- XML validation on both `sitemap.xml` files.
- Internal link checks (canonical vs relative links).
- [ ] **Step 2: Confirm zero errors and clean build state**
