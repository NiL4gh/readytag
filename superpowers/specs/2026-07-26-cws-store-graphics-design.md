# Specification: ReadyTag Chrome Web Store Graphics & Extraction Pipeline

**Date:** 2026-07-26  
**Status:** Approved  
**Strategy Suite:** Strategy Suite B — Clean Contributor Studio  
**Target App:** StoreCraft Studio (`C:\Users\niloy\Documents\StoreCraft`)  
**Source Extension:** ReadyTag v2.0 (`C:\Users\niloy\Documents\ReadyTag\readytag_v2.0_public`)  

---

## 1. Executive Summary

This document specifies the strategy and technical pipeline for extracting the ReadyTag Chrome extension UI elements (`panel.html`, `popup.html`, `csv.html`) and generating ultra-crisp, high-resolution release graphics (CWS Small Tile Thumbnail 440x280, 5x Screenshots 1280x800, Marquee Banner 1400x560) using the **StoreCraft** graphic studio renderer.

The primary hero graphic showcases the **Adobe Stock Contributor Portal** with 3D Abstract Geometric Art assets and the embedded ReadyTag AI sidebar.

---

## 2. Architecture & Pipeline Overview

```
[ ReadyTag v2.0 Source ]
 (ui/panel.html, popup.html, csv.html, content.css)
        │
        ▼
[ Playwright UI Extraction Script ] (C:\Users\niloy\Documents\StoreCraft\scripts\create-portal-mockups.js)
 ├── Render 2x Retina HTML/CSS Portal Mockups (Adobe Stock, Freepik, etc.)
 ├── Inject authentic 3D Abstract Art titles & high-ranking keyword tags into panel.html DOM
 └── Output High-Res PNGs -> StoreCraft/assets/readytag-ui/
        │
        ▼
[ StoreCraft Graphic Studio ] (C:\Users\niloy\Documents\StoreCraft)
 ├── Config: config/strategy-b-clean-studio.json
 └── Render CLI: npm run render -- --config config/strategy-b-clean-studio.json --out ./output/strategy-b-clean-studio
        │
        ▼
[ Final CWS Assets Output ] (StoreCraft/output/strategy-b-clean-studio/)
 ├── sb_slide_1.png (Hero - Adobe Stock + ReadyTag Sidebar 1280x800)
 ├── sb_slide_2.png (Vision AI Tagging - Freepik 1280x800)
 ├── sb_slide_3.png (Pre-Upload CSV Batch Pipeline 1280x800)
 ├── sb_slide_4.png (Bring Your Own Key BYOK 1280x800)
 ├── sb_slide_5.png (Multi-Platform Compatibility Matrix 1280x800)
 ├── sb_slide_thumb.png (CWS Small Tile 440x280)
 └── sb_slide_marquee.png (CWS Marquee Banner 1400x560)
```

---

## 3. Stock Platform Portal Mockups & Asset Specifications

### 3.1 Adobe Stock Contributor Portal (Primary Hero Visual)
- **Theme**: Dark slate (`#0f172a`), deep header bar (`#1e293b`), red Adobe Stock indicator branding.
- **Featured Sample Asset**: 3D AI Abstract Geometric Shapes & Spheres (`Set of 3D Abstract Geometric Shapes on Dark Background`).
- **Sidebar State**: Mounted ReadyTag panel (`panel.html`) displaying 25+ generated keyword tags (`abstract`, `3d`, `render`, `geometric`, `futuristic`, `neon`, `violet`, etc.), selected asset thumbnail preview, BYOK active indicator, and primary 1-Click Metadata action button.

### 3.2 Freepik Contributor Dashboard
- **Theme**: Dark navy (`#0b1329`), header bar (`#16203a`), blue Freepik indicator branding.
- **Featured Sample Asset**: Vector Graphic & Illustration artwork.
- **Sidebar State**: ReadyTag panel showing automatic Vision AI categorization & vector tagging.

### 3.3 Standalone CSV Generator Page
- **Source**: Directly renders [`csv.html`](file:///C:/Users/niloy/Documents/ReadyTag/readytag_v2.0_public/csv.html) with dark theme styling, file selector dropzone, and pre-populated sample batch data table (`abstract_shape_3d.jpg`, `neon_cyber_background.jpg`, `minimal_vector_pattern.eps`).

### 3.4 BYOK Popup Menu
- **Source**: Renders [`popup.html`](file:///C:/Users/niloy/Documents/ReadyTag/readytag_v2.0_public/popup.html) with active provider badges for Groq (Free), OpenAI, Anthropic, Gemini & OpenRouter.

---

## 4. Deliverable File Manifest

All output files will be rendered at scale 2x in `C:\Users\niloy\Documents\StoreCraft\output\strategy-b-clean-studio`:

| File Name | Resolution | Description |
| :--- | :--- | :--- |
| `sb_slide_1.png` | 1280 x 800 | Hero Screenshot — Adobe Stock Contributor Portal with ReadyTag Sidebar |
| `sb_slide_2.png` | 1280 x 800 | Screenshot 2 — Vision AI Recognition on Freepik |
| `sb_slide_3.png` | 1280 x 800 | Screenshot 3 — Pre-Upload CSV Batch Generator Page |
| `sb_slide_4.png` | 1280 x 800 | Screenshot 4 — Bring Your Own Key (BYOK) Freedom & Providers |
| `sb_slide_5.png` | 1280 x 800 | Screenshot 5 — Ecosystem & Multi-Platform Compatibility Matrix |
| `sb_slide_thumb.png` | 440 x 280 | Chrome Web Store Small Tile Store Listing Thumbnail |
| `sb_slide_marquee.png` | 1400 x 560 | Chrome Web Store Marquee Promotional Banner |

---

## 5. Execution Steps

1. **Update Portal & UI Capture Scripts**: Modify `StoreCraft/scripts/create-portal-mockups.js` and `StoreCraft/scripts/capture-ui.js` to render the Adobe Stock 3D abstract asset mockup and extract UI assets cleanly.
2. **Execute UI Capture Engine**: Run `node scripts/create-portal-mockups.js` and `node scripts/capture-ui.js` in StoreCraft directory.
3. **Validate StoreCraft Config**: Ensure `config/strategy-b-clean-studio.json` accurately references the generated assets in `StoreCraft/assets/readytag-ui/`.
4. **Render Final Release Graphics**: Run `npm run render -- --config config/strategy-b-clean-studio.json --out ./output/strategy-b-clean-studio`.
5. **Verify Output Integrity**: Verify all 7 image files exist in `StoreCraft/output/strategy-b-clean-studio` and check pixel dimensions and non-zero file sizes.
