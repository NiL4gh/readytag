# ReadyTag Chrome Web Store Graphics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract ReadyTag extension UI elements and render 7 pixel-perfect Chrome Web Store release graphics (5x 1280x800 screenshots, 440x280 small tile thumbnail, 1400x560 marquee banner) using StoreCraft and Strategy Suite B ("Clean Contributor Studio") featuring Adobe Stock 3D abstract hero visuals.

**Architecture:** Update StoreCraft Playwright scripts (`create-portal-mockups.js` and `capture-ui.js`) to build high-definition HTML/CSS mockups of stock contributor portals integrated with the ReadyTag sidebar (`ui/panel.html`), popup (`popup.html`), and CSV generator (`csv.html`). Then run StoreCraft CLI renderer to output final PNG assets at 2x scale.

**Tech Stack:** Node.js, Playwright (Chromium headless 2x Retina scale), StoreCraft Canvas Engine, ReadyTag v2.0 UI components.

## Global Constraints

- **Scale Factor**: `deviceScaleFactor: 2` (2x Retina rendering for crisp text & graphics)
- **Primary Hero Visual**: Adobe Stock Contributor Portal with 3D Abstract Geometric Art & ReadyTag Sidebar
- **Strategy Config**: `C:\Users\niloy\Documents\StoreCraft\config\strategy-b-clean-studio.json`
- **Asset Directory**: `C:\Users\niloy\Documents\StoreCraft\assets\readytag-ui\`
- **Output Directory**: `C:\Users\niloy\Documents\StoreCraft\output\strategy-b-clean-studio\`

---

### Task 1: Enhance Portal Mockup Generator Script

**Files:**
- Modify: `C:\Users\niloy\Documents\StoreCraft\scripts\create-portal-mockups.js`

**Interfaces:**
- Consumes: `C:\Users\niloy\Documents\ReadyTag\readytag_v2.0_public\ui\panel.html`, `C:\Users\niloy\Documents\ReadyTag\readytag_v2.0_public\content.css`
- Produces: `C:\Users\niloy\Documents\StoreCraft\assets\readytag-ui\adobe-stock-readytag.png`, `C:\Users\niloy\Documents\StoreCraft\assets\readytag-ui\freepik-readytag.png`

- [ ] **Step 1: Update `create-portal-mockups.js` with rich Adobe Stock & Freepik mockups**

Update `C:\Users\niloy\Documents\StoreCraft\scripts\create-portal-mockups.js` to build a high-resolution dark theme layout for Adobe Stock Contributor Portal (showing 3D Abstract Geometric Shapes, selected state, and ReadyTag panel populated with 25+ tags) and Freepik Contributor Dashboard.

- [ ] **Step 2: Verify `create-portal-mockups.js` syntax**

Run: `node --check C:\Users\niloy\Documents\StoreCraft\scripts\create-portal-mockups.js`
Expected: No syntax errors.

---

### Task 2: Enhance UI Capture Script

**Files:**
- Modify: `C:\Users\niloy\Documents\StoreCraft\scripts\capture-ui.js`

**Interfaces:**
- Consumes: `readytag_v2.0_public/ui/panel.html`, `readytag_v2.0_public/popup.html`, `readytag_v2.0_public/csv.html`
- Produces: `C:\Users\niloy\Documents\StoreCraft\assets\readytag-ui\panel-sidebar.png`, `popup-menu.png`, `csv-page.png`

- [ ] **Step 1: Update `capture-ui.js` to render crisp extension UI elements**

Update `C:\Users\niloy\Documents\StoreCraft\scripts\capture-ui.js` to ensure [`csv.html`](file:///C:/Users/niloy/Documents/ReadyTag/readytag_v2.0_public/csv.html) renders with dark theme sample batch rows and [`popup.html`](file:///C:/Users/niloy/Documents/ReadyTag/readytag_v2.0_public/popup.html) renders with provider key indicators.

- [ ] **Step 2: Verify `capture-ui.js` syntax**

Run: `node --check C:\Users\niloy\Documents\StoreCraft\scripts\capture-ui.js`
Expected: No syntax errors.

---

### Task 3: Execute UI Capture & Portal Mockup Generation

**Files:**
- Create/Overwrite: `C:\Users\niloy\Documents\StoreCraft\assets\readytag-ui\adobe-stock-readytag.png`
- Create/Overwrite: `C:\Users\niloy\Documents\StoreCraft\assets\readytag-ui\freepik-readytag.png`
- Create/Overwrite: `C:\Users\niloy\Documents\StoreCraft\assets\readytag-ui\panel-sidebar.png`
- Create/Overwrite: `C:\Users\niloy\Documents\StoreCraft\assets\readytag-ui\popup-menu.png`
- Create/Overwrite: `C:\Users\niloy\Documents\StoreCraft\assets\readytag-ui\csv-page.png`

- [ ] **Step 1: Run portal mockups script**

Run: `node scripts/create-portal-mockups.js` in `C:\Users\niloy\Documents\StoreCraft`
Expected: `✓ Captured Adobe Stock + ReadyTag Mockup` and `✓ Captured Freepik + ReadyTag Mockup`.

- [ ] **Step 2: Run UI capture script**

Run: `node scripts/capture-ui.js` in `C:\Users\niloy\Documents\StoreCraft`
Expected: `✓ Captured Sidebar Panel`, `✓ Captured CSV Page`, `✓ Captured Popup Menu`.

---

### Task 4: Execute StoreCraft CLI Renderer & Validate Deliverables

**Files:**
- Create: `C:\Users\niloy\Documents\StoreCraft\output\strategy-b-clean-studio\sb_slide_1.png`
- Create: `C:\Users\niloy\Documents\StoreCraft\output\strategy-b-clean-studio\sb_slide_2.png`
- Create: `C:\Users\niloy\Documents\StoreCraft\output\strategy-b-clean-studio\sb_slide_3.png`
- Create: `C:\Users\niloy\Documents\StoreCraft\output\strategy-b-clean-studio\sb_slide_4.png`
- Create: `C:\Users\niloy\Documents\StoreCraft\output\strategy-b-clean-studio\sb_slide_5.png`
- Create: `C:\Users\niloy\Documents\StoreCraft\output\strategy-b-clean-studio\sb_slide_thumb.png`
- Create: `C:\Users\niloy\Documents\StoreCraft\output\strategy-b-clean-studio\sb_slide_marquee.png`

- [ ] **Step 1: Run StoreCraft render CLI**

Run: `npm run render -- --config config/strategy-b-clean-studio.json --out ./output/strategy-b-clean-studio` in `C:\Users\niloy\Documents\StoreCraft`
Expected: 7 images rendered successfully.

- [ ] **Step 2: Validate output image files**

Run: `Get-ChildItem output/strategy-b-clean-studio` in `C:\Users\niloy\Documents\StoreCraft`
Expected: 7 PNG files with non-zero size.
