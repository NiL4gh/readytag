# ReadyTag Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `site/index.html` into a modern, comprehensive, high-converting product landing page for the ReadyTag Chrome extension, utilizing authentic UI components from `readytag_v2.0_public/ui/panel.html` and a vanilla HTML5/CSS3/JS architecture.

**Architecture:** A zero-build modular static site architecture residing under `site/` with separated CSS styles, JS modules, interactive canvas keyword background, authentic extension panel preview widget, platform rules comparison matrix, ROI calculator, and full schema.org JSON-LD SEO metadata.

**Tech Stack:** Vanilla HTML5, CSS3 (variables, grid, flexbox, glassmorphism), HTML5 Canvas 2D API, Vanilla ES6 JavaScript (Zero third-party npm dependencies).

## Global Constraints
- Target directory: `site/`
- Zero npm or build dependencies: page must load instantly in any browser
- Authentic UI snippets: extension preview MUST extract structural HTML & CSS classes from `readytag_v2.0_public/ui/panel.html` and `readytag_v2.0_public/content.css`
- Dark mode theme: `#090b10` dark base with `#6366f1` Indigo, `#06b6d4` Cyan, and `#8b5cf6` Violet accents
- 100/100 Core Web Vitals performance: lightweight script execution with IntersectionObserver optimization for canvas animations

---

### Task 1: CSS Design System & Theme Styling

**Files:**
- Create: `site/css/main.css`
- Create: `site/css/components.css`
- Create: `site/css/animations.css`

**Interfaces:**
- Consumes: Design tokens (colors, typography, glassmorphism backdrop filters)
- Produces: CSS layout classes, typography rules, card grids, table styling, and keyframe animation utilities used by `site/index.html`.

- [ ] **Step 1: Create `site/css/main.css` with CSS custom properties and resets**

```css
:root {
  --bg-dark: #090b10;
  --bg-surface-1: #121620;
  --bg-surface-2: #1a202c;
  --bg-glass: rgba(18, 22, 32, 0.75);
  --border-color: rgba(255, 255, 255, 0.08);
  --border-highlight: rgba(99, 102, 241, 0.3);
  
  --accent-indigo: #6366f1;
  --accent-cyan: #06b6d4;
  --accent-violet: #8b5cf6;
  --accent-emerald: #10b981;
  
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --text-dim: #64748b;

  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: var(--font-sans);
  line-height: 1.6;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
```

- [ ] **Step 2: Create `site/css/components.css` for Cards, Nav, Hero, Extension Mockup & Tables**

Include layout styles for `.navbar`, `.hero`, `.extension-mockup-frame`, `.feature-grid`, `.platform-matrix`, `.calculator-box`, and `.accordion-item`.

- [ ] **Step 3: Create `site/css/animations.css` for CSS Keyframes & Micro-Animations**

Define `.pulse-glow`, `.scanning-laser`, `.shimmer-btn`, `.float-badge`, and `.stroke-draw` animations.

- [ ] **Step 4: Verify CSS files exist and validate syntax**

Ensure no syntax errors in CSS files.

---

### Task 2: Floating Keyword Canvas Component (`site/js/keyword-canvas.js`)

**Files:**
- Create: `site/js/keyword-canvas.js`

**Interfaces:**
- Consumes: `<canvas id="keyword-canvas">` DOM element
- Produces: Ambient drifting stock keywords (*"4k background"*, *"vector illustration"*, *"copy space"*, *"isolated"*, *"golden hour"*) with subtle mouse interaction lines and IntersectionObserver auto-pause.

- [ ] **Step 1: Write `site/js/keyword-canvas.js`**

Implement high-performance 2D Canvas rendering loop with 15-20 stock keyword badges that float gently, connect with faint glowing lines when near each other, and pause when out of view.

- [ ] **Step 2: Verify Canvas script syntax**

Check syntax and ensure fallback for low-power mode or disabled JS.

---

### Task 3: Authentic Extension Panel Preview UI Controller (`site/js/extension-mockup.js`)

**Files:**
- Create: `site/js/extension-mockup.js`

**Interfaces:**
- Consumes: Mockup container `#extension-preview-root`
- Produces: Pixel-perfect replica of the ReadyTag Chrome extension side panel derived from `readytag_v2.0_public/ui/panel.html` with interactive asset switcher (Landscape, 3D Vector, Cyberpunk AI, Business People) and live metadata generation simulation.

- [ ] **Step 1: Write `site/js/extension-mockup.js`**

Extract and embed the exact DOM structure from `readytag_v2.0_public/ui/panel.html` inside a responsive browser card frame, wiring up demo preset clicks to update titles, keywords, character meters, and platform tab indicators.

- [ ] **Step 2: Verify interactive preview responsiveness**

Test sample asset switching and copy button toasts.

---

### Task 4: Interactive ROI & Time Saved Calculator (`site/js/roi-calculator.js`)

**Files:**
- Create: `site/js/roi-calculator.js`

**Interfaces:**
- Consumes: Range sliders `#range-assets` and `#range-minutes`
- Produces: Live updated outputs `#output-hours-saved` and `#output-earnings-boost` with smooth number counting animation.

- [ ] **Step 1: Write `site/js/roi-calculator.js`**

Implement calculation formula:
- `Hours Saved = (Assets * MinutesPerAsset * 0.90) / 60`
- `Estimated Revenue Boost = Assets * $0.45 * (Keywords SEO Coefficient)`

- [ ] **Step 2: Verify dynamic slider bindings**

Ensure values update cleanly on input drag events.

---

### Task 5: Main Script & Interactive UI Controllers (`site/js/main.js`)

**Files:**
- Create: `site/js/main.js`

**Interfaces:**
- Consumes: Navbar `#main-nav`, FAQ items `.faq-header`, platform comparison tabs `.tab-btn`
- Produces: Glassmorphism sticky navbar scroll effect, platform comparison filter logic, accordion toggle behavior, and smooth internal link anchor scrolling.

- [ ] **Step 1: Write `site/js/main.js`**

Implement event listeners for sticky navigation, platform table filters, and FAQ accordion expanding.

---

### Task 6: Comprehensive Page Assembly (`site/index.html`)

**Files:**
- Modify: `site/index.html`

**Interfaces:**
- Consumes: All CSS stylesheets (`css/main.css`, `css/components.css`, `css/animations.css`), JS modules (`js/keyword-canvas.js`, `js/extension-mockup.js`, `js/roi-calculator.js`, `js/main.js`)
- Produces: Complete semantic HTML5 document with structured JSON-LD schema, OpenGraph metadata, sticky nav, hero, platform bar, growth section, feature grid, 10 AI provider table, competitor comparison matrix, ROI calculator, 3-step guide, architecture security overview, FAQ accordion, bottom CTA, and footer.

- [ ] **Step 1: Build complete `site/index.html` structure with meta tags & JSON-LD**

Assemble all 12 sections with copy, SVG icons, authentic extension markup container, interactive calculator markup, and schema tags.

- [ ] **Step 2: Link CSS & JavaScript files cleanly in `site/index.html`**

Ensure correct relative script and stylesheet references.

---

### Task 7: Verification & Testing

**Files:**
- Inspect: `site/index.html`

- [ ] **Step 1: Launch local HTTP server to verify page rendering**

Run: `npx -y http-server site -p 8080` (or `python -m http.server 8080 --directory site`)

- [ ] **Step 2: Inspect browser console and verify zero errors**

Ensure all scripts, styles, canvas graphics, and interactive preview controls execute cleanly without console errors.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-24-readytag-website-redesign.md`.

**Two execution options:**
1. **Subagent-Driven (recommended)** - Fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.
