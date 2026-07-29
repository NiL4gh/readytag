# Design Spec: ReadyTag Landing Page Redesign
**Date:** 2026-07-17  
**Author:** Antigravity (Google DeepMind pair-programmer)  
**Status:** Pending Review  

---

## 1. Context & Motivation
The current landing page for the ReadyTag extension (formerly MetaRefresh) looks like a generic AI tool website. The goal is to redesign it to reflect the **Adobe Stock homepage visual language** (premium dark/light theme, high-density asset grids, clean Spectrum UI design tokens) while retaining ReadyTag's brand identity. 

Additionally, because the landing page is hosted on GitHub Pages (`docs/`), we will implement best-in-class search engine optimization (SEO) to rank on keywords targeted at stock photography/vector media contributors.

---

## 2. Verified Extension State (Content Source)
The landing page content must align exactly with the current features verified from the codebase:
- **Version:** `2.0.0`
- **Supported Portals:** Adobe Stock (`contributor.stock.adobe.com`), Shutterstock (`submit.shutterstock.com`), Freepik (`contributor.freepik.com`), Vecteezy (`www.vecteezy.com`).
- **Core Workflows:**
  1. **Single-Asset:** Autofills titles/keywords directly inside portal editor DOM.
  2. **Batch Mode:** Scans, tags, and saves all visible assets in a portfolio tab sequentially.
  3. **CSV Export:** Drag-and-drop local media files to generate bulk metadata spreadsheets.
- **Image Mode:** Leverages Vision AI (Gemini, Pixtral, GPT-4o, NIM) to inspect actual asset thumbnails for keywords.
- **BYOK (Bring Your Own Key):** User credentials stay in local storage; worker routes to selected API providers (Groq, Gemini, DeepSeek, Mistral, OpenAI, Anthropic, xAI, Nvidia NIM, ZhipuAI, OpenRouter).

---

## 3. Visual Design & Theme Integration
The website will support an **interactive theme toggle** mapping to Adobe Stock's official Spectrum UI palette, while keeping ReadyTag's core brand elements intact.

### 3.1. Design Tokens (CSS Variables)

| Token Class | Adobe Dark Theme (Default) | Adobe Light Theme | Usage |
| :--- | :--- | :--- | :--- |
| `--bg-page` | `#090a0f` | `#f8f8f8` | Main page background |
| `--bg-surface` | `#151924` | `#ffffff` | Feature cards, interactive wrappers |
| `--bg-hover` | `#1e2230` | `#eaeaea` | Interactive element hover states |
| `--border-color` | `#2c3245` | `#e1e1e1` | Subtle divider and card lines |
| `--text-primary` | `#ffffff` | `#1e1e1e` | Headers and body text |
| `--text-secondary`| `#a3acb9` | `#6e6e6e` | Muted paragraph copy |
| `--adobe-accent` | `#1473e6` | `#1473e6` | Adobe Brand Blue: buttons, active borders, link hovers |
| `--readytag-brand`| `#7289ff` | `#5b7cf6` | ReadyTag Accent: Logos, extension badges, mock panel highlights |

### 3.2. Typography & Assets
- **Font Stack:** System UI (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`).
- **Assets:** Lightweight inline SVGs for standard indicators (Chrome Web Store logo, checkmarks, search icons).
- **Images:** Curated high-quality stock photographs from Unsplash (for the media grid category demo).

---

## 4. Code Architecture (Balanced Approach)
To ensure maximum page loading speeds (a critical Google SEO factor) while maintaining clean development organization, we will avoid framework build tools and separate concerns into three clean files:

```
docs/
  index.html     # Main landing page (Semantic markup, meta tags, schema markup)
  style.css      # Design system variables, layout grids, theme classes
  main.js        # Light/dark theme toggles and interactive mockup sandbox handlers
```

---

## 5. Page Sections & Layout

### 5.1. Global Navigation
- Fixed blur navbar (`backdrop-filter: blur(12px)`) with borders.
- Branding: `ReadyTag` text logo using `--readytag-brand`.
- Nav links linking to `#features`, `#providers`, and GitHub.
- CTA Button: Outlined pill `"Add to Chrome — Free"` styled as a Spectrum interactive element.

### 5.2. Hero Section
- **Split Layout:**
  - **Left (Copy):** Header `<h1>` (e.g. *"Power your stock portfolio with AI metadata"*), a detailed subtext targeting the BYOK model, and primary buttons linking to the Chrome Web Store.
  - **Right (Mockup):** A visual window representing a web browser at `contributor.stock.adobe.com`. The mock window displays a stock asset workspace with the ReadyTag extension panel injected on the right.

### 5.3. Medium Optimization Showcase (The Asset Grid)
- A 4-column responsive grid styled like the Adobe Stock homepage.
- Columns represent **Photos**, **Vectors**, **Illustrations**, and **CSV Batch**.
- Hovering a card triggers a smooth overlay detailing the metadata guidelines ReadyTag automatically formats for that specific medium (character lengths, file properties, keyword exclusion rules).

### 5.4. Features & Autopilot Panel
- 3 clean feature cards detailing **Batch Autopilot**, **BYOK Model**, and **Zero Data Retention**.
- Clean grids, `border-radius: 8px`, and CSS-only micro-animations (e.g. slight card lift on hover).

### 5.5. AI Providers Comparison Table
- Clean table detailing supported providers, model choices, free tiers, and vision capabilities.

### 5.6. Global Footer
- Licensing disclaimer stating independence: *Not affiliated with, endorsed by, or partnered with Adobe, Shutterstock, Freepik, or Vecteezy.*
- Social and repo links.

---

## 6. Search Engine Optimization (SEO) & Schema
To maximize visibility on search results, the landing page will implement:

### 6.1. Metadata Headers
- **Title:** `ReadyTag — AI Metadata Generator for Stock Contributors`
- **Meta Description:** `Generate platform-optimized titles and keywords directly inside Adobe Stock, Shutterstock, and Freepik contributor portals. Uses Llama 3.3, Gemini, and GPT-4o with your own API key.`
- **Keywords Meta:** `adobe stock metadata generator, stock contributor AI, shutterstock keywords, freepik contributor helper, csv tagging tool`

### 6.2. JSON-LD Schema
We will embed the following structured data block in the page head to prompt Google to display rich installer snippets in search engine results pages (SERPs):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ReadyTag",
  "operatingSystem": "Chrome OS, Windows, macOS, Linux",
  "applicationCategory": "BrowserApplication",
  "downloadUrl": "https://chromewebstore.google.com/detail/metarefresh-meta-refresh/achfpjlldepcapcecadonijoahbdpdfm",
  "offers": {
    "@type": "Offer",
    "price": "0.00",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Person",
    "name": "Niloy Pal"
  },
  "description": "AI-powered title and keyword generator for stock contributors. Supports Adobe Stock, Shutterstock, Freepik, and Vecteezy."
}
</script>
```

---

## 7. Implementation Tasks & Verification Plan

### 7.1. Creation Order
1. Create `docs/style.css` containing variables and utility styles.
2. Create `docs/main.js` containing interactive handlers.
3. Write `docs/index.html` with full semantic layout and SEO headers.
4. Clean up any inline assets or styles from the old index.

### 7.2. Verification Criteria
- **W3C Semantic Check:** HTML validation check (no unclosed tags, valid nesting).
- **Responsive Review:** Layout scales properly from `320px` (mobile viewport) to `1920px` (desktop wide viewport).
- **Lighthouse Performance Score:** Target `>95%` mobile and desktop performance score, verified via Chrome dev audits.
- **Interactive Handlers:** Theme toggle switches variables seamlessly; clicking anchor links scrolls smoothly to target sections.
- **Rule Adherence:** After writing/modifying code files, verify correctness via locally running commands and ensure zero compile/console errors.
