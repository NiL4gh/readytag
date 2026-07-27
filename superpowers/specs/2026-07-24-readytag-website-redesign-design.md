# ReadyTag Extension Website & Landing Page Redesign Specification

**Date**: 2026-07-24  
**Status**: Draft (Awaiting User Review)  
**Target Path**: `site/index.html` & `site/` asset modular directories  

---

## 1. Executive Summary & Goals

### 1.1 Overview
ReadyTag is a high-performance MV3 Chrome extension built specifically for microstock media contributors (photographers, vector illustrators, 3D artists, and AI prompt engineers selling assets on **Adobe Stock**, **Shutterstock**, **Freepik**, and **Vecteezy**). 

The goal of this redesign is to replace the current basic landing page (`site/index.html`) with a modern, high-converting product showcase website that rivals top stock contributor platforms and SaaS marketing sites. 

### 1.2 Core Objectives
1. **Captivate Visitors Immediately**: Deliver a stunning hero section featuring a dynamic HTML5 keyword particle canvas and an authentic, pixel-perfect preview of the actual ReadyTag Chrome extension UI panel (derived directly from `readytag_v2.0_public/ui/panel.html`).
2. **Drive Conversion**: Clearly demonstrate ReadyTag’s unique value propositions: BYOK (Bring Your Own Key — free models via Groq & Gemini), 10 AI Providers, Vision AI scanning, batch processing, CSV export, and platform-aware character/keyword rules.
3. **Establish Authority & Trust**: Feature interactive platform rule breakdowns (Adobe, Shutterstock, Freepik, Vecteezy), competitor comparison matrix, contributor ROI calculator, and security/privacy transparency regarding Cloudflare Worker API proxies.
4. **Maximized SEO & Metadata**: Embed rich structured JSON-LD `SoftwareApplication` schema, OpenGraph, Twitter Cards, and search-optimized keyword density targeting high-intent contributor queries.
5. **Lightweight & Modular**: Structured cleanly in standard HTML/CSS/JS without bloated build dependencies, ensuring instant page load times and zero-friction deployment to static hosts (GitHub Pages, Cloudflare Pages, Vercel).

---

## 2. File Structure & Architecture (`site/`)

```
site/
├── index.html                  # Main semantic HTML5 page with rich SEO & JSON-LD
├── css/
│   ├── main.css                # CSS custom properties, reset, typography & layout tokens
│   ├── components.css          # Cards, extension mockup, tables, calculator, accordions
│   └── animations.css          # CSS keyframe animations, glows, shimmers & transitions
├── js/
│   ├── keyword-canvas.js       # Lightweight HTML5 Canvas particle & floating keyword mesh
│   ├── extension-mockup.js     # Authentic interactive extension panel UI controller
│   ├── roi-calculator.js       # Interactive time & earnings saved calculator logic
│   └── main.js                 # Sticky nav, platform tab switcher, FAQ accordions & smooth scroll
└── assets/
    ├── icons/                  # Clean SVG icons for platforms & features
    └── previews/               # Stock media sample thumbnails for interactive demo
```

---

## 3. Visual Aesthetics & Design System

### 3.1 Color Palette
- **Background Deep**: `#090b10` (Dark canvas)
- **Surface Elevation 1**: `#121620` (Card background)
- **Surface Elevation 2**: `#1a202c` (Input / Hover surface)
- **Borders & Dividers**: `rgba(255, 255, 255, 0.08)` / `#252e3e`
- **Primary Brand Accent**: `#6366f1` (Indigo Glow)
- **Secondary Accent**: `#06b6d4` (Electric Cyan)
- **Tertiary Accent**: `#8b5cf6` (Deep Violet)
- **Success / Free Tier**: `#10b981` (Emerald Green)
- **Text Main**: `#f8fafc`
- **Text Muted**: `#94a3b8`

### 3.2 Glassmorphism & UI Accents
- **Glass Panel**: `background: rgba(18, 22, 32, 0.75); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1);`
- **Glow Effects**: Radial gradient backdrop spotlights behind hero elements and call-to-action buttons (`box-shadow: 0 0 30px rgba(99, 102, 241, 0.35)`).

### 3.3 Typography
- **Primary Font**: `'Inter', 'Plus Jakarta Sans', -apple-system, system-ui, sans-serif`
- **Code / Monospace**: `'JetBrains Mono', 'Fira Code', monospace` (for API keys, counts, and character meters)

---

## 4. Comprehensive Page Section Breakdown

### 4.1 Sticky Navigation Bar
- **Brand Logo**: ReadyTag logo with glowing icon & version pill badge (`v2.0`).
- **Nav Links**: Features, Platforms, AI Models, Growth & ROI, FAQ.
- **CTA Button**: Glowing gradient button: `Add to Chrome — It's Free` (links directly to Chrome Web Store).

### 4.2 Hero Section (Conversion & Engagement Center)
- **Badge**: `Chrome Extension · MV3 · 100% Privacy BYOK`
- **H1 Headline**: *"Turn Stock Assets into Royalty Revenue with Vision AI Metadata"*
- **Subheadline**: *"Generate platform-optimized titles and ranked tags for Adobe Stock, Shutterstock, Freepik, and Vecteezy in seconds. Works with 10 top AI providers — 100% free with your own Groq or Gemini key."*
- **CTAs**: Primary `Add to Chrome — Free` (with 5-star rating graphic) + Secondary `Try Live UI Demo ↓`.
- **Background Canvas**: Floating stock keywords particle mesh (interactively drifting and subtly responding to mouse moves).
- **Hero Centerpiece**: **Authentic Interactive ReadyTag Extension UI Panel Mockup**:
  - Embedded inside a realistic Chrome browser frame over a simulated stock portal upload dashboard.
  - Rendered using the exact layout and CSS tokens from `readytag_v2.0_public/ui/panel.html` and `readytag_v2.0_public/content.css`.
  - Interactive controls: Users can switch sample stock assets (e.g. *Golden Hour Landscape*, *3D Tech Abstract*, *AI Cyberpunk Art*), change target platform (Adobe Stock / Shutterstock / Freepik), and toggle provider mode (Groq Llama 3.3 70B / Gemini Flash) to see live title & keyword generation output in real time.

### 4.3 Supported Stock Platforms Bar
- Logos & badges for **Adobe Stock**, **Shutterstock**, **Freepik**, and **Vecteezy**.
- Displays key platform metadata rules:
  - *Adobe Stock*: Max 30 keywords (Top 5 priority weighted), 90 char title.
  - *Shutterstock*: Max 50 keywords (Min 7 tags), 200 char title.
  - *Freepik*: Max 30 keywords, strict category tag rules.
  - *Vecteezy*: Max 49 keywords, commercial isolation tags.

### 4.4 Contributor Growth Impact & Search Algorithm Booster
- **Visual Graphic**: Interactive SVG chart showing search placement trajectory (from Page 9 -> Page 1 rank boost).
- **Key Concepts**:
  - *Algorithmic Tag Ranking*: Why placing highest-converting search keywords in the top 5 positions increases asset sales by 3x-5x.
  - *Zero Upload Rejections*: Prevents stock agency rejections caused by exceeding title length limits or missing mandatory tags.

### 4.5 Feature Deep-Dive Grid (6 Core Cards)
1. 👁 **Vision AI Engine**: Analyzes thumbnail pixels directly to generate metadata from actual visual content, not just vague filenames.
2. ⚡ **1-Click Batch Portfolio Auto-Tag**: Automatically processes and fills entire pages of visible assets in contributor dashboards with anti-bot safety delays.
3. 📄 **CSV Bulk Export Tool**: Process local asset folders offline and export complete spreadsheets ready for batch upload.
4. 🔑 **Bring Your Own Key (BYOK)**: Privacy-first architecture. Zero monthly subscription markups; use free API keys from Groq or Google Gemini.
5. 🎛 **Custom Presets & Negative Keywords**: Force-include brand terms, customize prompt tones, and exclude unwanted words across generations.
6. 🎯 **Platform-Aware Auto-Formatter**: Automatically trims titles to exact platform character limits and deduplicates keywords.

### 4.6 10 AI Provider Comparison Matrix
- Interactive filterable table featuring:
  - **Groq** (Llama 3.3 70B) — *FREE* · Vision ✓
  - **Google Gemini** (Gemini 2.5 Flash) — *FREE* · Vision ✓
  - **DeepSeek** (DeepSeek V3) — *FREE Tier*
  - **Mistral** (Mistral Large) — *FREE Tier* · Vision ✓
  - **Nvidia NIM** (Llama 3.1 405B) — *FREE Tier* · Vision ✓
  - **ZhipuAI** (GLM-4 Flash) — *FREE* · Vision ✓
  - **OpenRouter** (100+ Models) — *FREE Tier* · Vision ✓
  - **OpenAI** (GPT-4o) — *Paid* · Vision ✓
  - **Anthropic** (Claude Sonnet) — *Paid* · Vision ✓
  - **xAI** (Grok 3) — *Paid* · Vision ✓

### 4.7 Competitor Comparison Matrix (ReadyTag vs. Legacy Tools)
- Clear comparison table evaluating **ReadyTag** against **Legacy Desktop Apps** (e.g. Xpiks / StockSubmitter) and **Paid SaaS Tools** (e.g. Wirestock) across price, direct in-browser injection, Vision AI, privacy, and batch capabilities.

### 4.8 Interactive Time & Earnings Saved Calculator
- **Sliders**:
  - *Assets uploaded per month* (e.g., 50 to 2,000 assets)
  - *Current minutes spent keywording per asset* (e.g., 2 to 10 minutes)
- **Dynamic Output Display**:
  - ⏱ **Hours Saved Every Month**
  - 📈 **Estimated Extra Royalties Earned** from boosted search index velocity.

### 4.9 3-Step Simple Setup Guide
- Step 1: **Install Extension** (1-click Chrome Web Store install).
- Step 2: **Enter Free API Key** (Groq or Gemini key in popup settings).
- Step 3: **Open Contributor Dashboard** (Click "Generate" on Adobe Stock, Shutterstock, Freepik, or Vecteezy).

### 4.10 BYOK Privacy, Security & Cloudflare Architecture
- Explains the **Cloudflare Worker Proxy Architecture**.
- API keys stored strictly in `chrome.storage.local`.
- Zero server-side key logging or persistence; direct encrypted transmission to providers.

### 4.11 Accordion FAQ (SEO-Rich)
- Interactive expandable FAQ addressing API key security, free tier limits, AI vision accuracy, CSV batching, and supported browsers.

### 4.12 Bottom Call-to-Action Banner
- Vibrant glowing glass banner: *"Stop Wasting Hours on Manual Metadata. Start Tagging in Seconds."* with primary Web Store install button.

### 4.13 Footer & SEO Metadata
- Copyright, quick links (Docs, Privacy, Terms, GitHub, Web Store), schema.org markup, and version status.

---

## 5. Interactive Components & Animations (Zero Heavy Dependencies)

1. **Floating Keyword Mesh Canvas (`site/js/keyword-canvas.js`)**:
   - Lightweight 2D canvas particle loop with 15 drifting stock tags (*"4k background"*, *"vector illustration"*, *"copy space"*, *"isolated on white"*, *"golden hour"*).
   - Pauses execution automatically via `IntersectionObserver` when scrolled off-screen to preserve CPU/GPU resources.
2. **Authentic Extension Panel Preview (`site/js/extension-mockup.js`)**:
   - Recreates the extension interface panel using DOM elements structured after `readytag_v2.0_public/ui/panel.html`.
   - Allows users to click sample buttons to see simulated live metadata generation with character meter progress bars.
3. **SVG Growth Line & Scanning Beam Animations (`site/css/animations.css`)**:
   - Pure CSS `stroke-dashoffset` line drawing for the growth chart.
   - Smooth CSS keyframe scanning laser beam effect on image thumbnails in the demo.

---

## 6. Technical SEO & Schema Strategy

- **OpenGraph & Twitter Card Meta Tags**: Full social share titles, descriptions, and thumbnail image pointers.
- **JSON-LD Structured Data**:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ReadyTag",
    "operatingSystem": "Chrome OS, Windows, macOS, Linux",
    "applicationCategory": "BrowserExtension",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "AI-powered metadata, titles and keywords generator for stock media contributors on Adobe Stock, Shutterstock, Freepik, and Vecteezy."
  }
  ```
- **Semantic HTML5 Tags**: Clean `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` structure with single `<h1>`.

---

## 7. Next Steps & Implementation Workflow

1. Present this design specification to the user for approval.
2. Create detailed execution plan via `writing-plans` skill.
3. Construct modular `site/` files step-by-step and test locally.
