/**
 * ReadyTag — Extension Panel Preview UI Controller
 * 
 * Powers the interactive Chrome Extension UI mockup preview widget on the landing page.
 * Includes sample presets, platform rule compliance meters, AI model badges,
 * Vision AI scanning animations, typing title animation, and sequential tag rendering.
 */

(function () {
  'use strict';

  // 1. Realistic Asset Presets Data
  const ASSET_PRESETS = [
    {
      id: 0,
      name: 'Mountain Sunset',
      category: 'Nature Photo',
      title: 'Breathtaking mountain peak at sunset during golden hour, epic wilderness landscape',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 30%, #7c2d12 70%, #1e1b4b 100%)',
      icon: '🏔️',
      tags: [
        'mountain', 'landscape', 'sunset', 'golden hour', 'wilderness',
        'sky', 'peak', 'nature', 'scenic', 'travel',
        'explore', 'outdoors', 'horizon', 'sunlight', 'majestic',
        'copy space', 'high resolution', 'hiking', 'view', 'adventure'
      ]
    },
    {
      id: 1,
      name: 'Cyberpunk City',
      category: '3D Vector Illustration',
      title: 'Futuristic cyberpunk cityscape with glowing neon lights, isometric 3D vector illustration',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 30%, #8b5cf6 70%, #ec4899 100%)',
      icon: '🏙️',
      tags: [
        'cyberpunk', 'futuristic', 'cityscape', 'neon', 'vector',
        '3d illustration', 'isometric', 'night city', 'technology', 'glowing',
        'metropolis', 'sci-fi', 'urban', 'digital art', 'isolated',
        'background', 'graphic design', 'creative', 'modern'
      ]
    },
    {
      id: 2,
      name: 'Business Team',
      category: 'Corporate Photo',
      title: 'Diverse business team collaborating on modern laptop in office environment',
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 40%, #0284c7 70%, #0f172a 100%)',
      icon: '👥',
      tags: [
        'business', 'teamwork', 'collaboration', 'office', 'people',
        'meeting', 'diverse', 'laptop', 'corporate', 'technology',
        'working', 'brainstorming', 'professional', 'strategy', 'success',
        'communication', 'workspace', 'modern'
      ]
    },
    {
      id: 3,
      name: '3D Liquid Gradient',
      category: 'Abstract AI Art',
      title: 'Smooth abstract liquid gradient wallpaper background, vibrant 3D render composition',
      gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 40%, #f43f5e 70%, #fb923c 100%)',
      icon: '🎨',
      tags: [
        'abstract', 'gradient', '3d render', 'liquid', 'wallpaper',
        'background', 'vibrant', 'colorful', 'smooth', 'flow',
        'modern', 'texture', 'digital', 'artistic', 'copy space',
        'fluid', 'dynamic', 'design', 'shape'
      ]
    }
  ];

  // 2. Platform Rule Specs
  const PLATFORMS = {
    adobe: {
      id: 'adobe',
      name: 'Adobe Stock',
      maxKeywords: 30,
      maxTitleLength: 90
    },
    shutterstock: {
      id: 'shutterstock',
      name: 'Shutterstock',
      maxKeywords: 50,
      maxTitleLength: 200
    },
    freepik: {
      id: 'freepik',
      name: 'Freepik',
      maxKeywords: 30,
      maxTitleLength: 120
    },
    vecteezy: {
      id: 'vecteezy',
      name: 'Vecteezy',
      maxKeywords: 49,
      maxTitleLength: 180
    }
  };

  // 3. AI Providers & Model Specs
  const AI_PROVIDERS = {
    groq: {
      id: 'groq',
      name: 'Groq (Llama 3.3 70B)',
      badges: ['FREE', 'FAST', 'VISION']
    },
    gemini: {
      id: 'gemini',
      name: 'Gemini (2.5 Flash)',
      badges: ['FREE', 'FAST', 'VISION']
    },
    deepseek: {
      id: 'deepseek',
      name: 'DeepSeek V3',
      badges: ['FREE', 'FAST']
    },
    openai: {
      id: 'openai',
      name: 'OpenAI GPT-4o',
      badges: ['FAST', 'VISION']
    }
  };

  // State Variables
  let currentPresetIndex = 0;
  let currentPlatformId = 'adobe';
  let currentProviderId = 'groq';
  let typingTimer = null;
  let pillTimers = [];

  /**
   * Main Initialization Function
   */
  function initExtensionMockup() {
    const container = document.querySelector('.mockup, #extension-mockup-container, [data-extension-mockup]');
    if (!container) return;

    // Build the inner HTML for the extension preview controller
    renderMockupSkeleton(container);
    bindEvents(container);

    // Initial load
    updatePresetView(0, true);
  }

  /**
   * Renders the complete HTML interface inside target container
   */
  function renderMockupSkeleton(container) {
    container.classList.add('readytag-mockup-wrapper');
    container.innerHTML = `
      <style>
        .readytag-mockup-wrapper {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }
        .rt-flex-layout {
          display: flex;
          gap: 20px;
          align-items: stretch;
          flex-wrap: wrap;
        }
        .rt-flex-card {
          flex: 1 1 420px;
          background: #121622;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.12);
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        /* Demo Asset Card Styling */
        .rt-card-title-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid #252b3d;
          margin-bottom: 14px;
        }
        .rt-card-heading {
          font-size: 13px;
          font-weight: 700;
          color: #f8fafc;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .rt-asset-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 14px;
        }
        .rt-asset-btn {
          position: relative;
          height: 56px;
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 16px;
          background: #1a202c;
        }
        .rt-asset-btn:hover {
          transform: translateY(-2px);
          border-color: rgba(99, 102, 241, 0.5);
        }
        .rt-asset-btn.active {
          border-color: #6366f1;
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.4);
        }
        .rt-asset-btn-label {
          font-size: 9px;
          font-weight: 600;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 90%;
        }

        /* Vision Scanning Box */
        .rt-preview-box {
          position: relative;
          height: 120px;
          border-radius: 10px;
          margin-bottom: 14px;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          padding: 10px 12px;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
          transition: background 0.4s ease;
        }
        .rt-preview-info {
          position: relative;
          z-index: 2;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .rt-preview-category {
          font-size: 10px;
          color: #94a3b8;
          font-weight: 600;
          text-transform: uppercase;
        }
        .rt-preview-title-short {
          font-size: 11px;
          font-weight: 700;
          color: #f8fafc;
        }
        .rt-laser-beam {
          position: absolute;
          left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #38bdf8, #818cf8, transparent);
          box-shadow: 0 0 15px #38bdf8, 0 0 25px #818cf8;
          top: -10px;
          opacity: 0;
          pointer-events: none;
          z-index: 10;
        }
        .rt-laser-beam.scanning {
          animation: laserScan 1.6s ease-in-out forwards;
        }
        @keyframes laserScan {
          0% { top: 0%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        /* Platform Rule Switcher */
        .rt-platform-tabs {
          display: flex;
          gap: 4px;
          background: #181c27;
          padding: 3px;
          border-radius: 8px;
          margin-bottom: 12px;
          border: 1px solid #282f42;
        }
        .rt-tab-btn {
          flex: 1;
          padding: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }
        .rt-tab-btn.active {
          background: #252b3b;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }

        /* Authentic Extension Panel (Matching panel.html & content.css) */
        .mr-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 10px;
          border-bottom: 1px solid #252b3d;
          margin-bottom: 10px;
        }
        .mr-logo-group {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 14px;
          color: #ffffff;
        }
        .mr-logo-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #6366f1;
          box-shadow: 0 0 10px #6366f1;
        }
        .mr-provider-badge {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.3);
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .mr-header-icons {
          display: flex;
          gap: 6px;
          color: #94a3b8;
        }
        .mr-icon-btn {
          background: #1a202c;
          border: 1px solid #2d3748;
          color: #94a3b8;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        /* Tab bar */
        .mr-tabs-bar {
          display: flex;
          gap: 4px;
          border-bottom: 1px solid #252b3d;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .mr-tab-item {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          border-radius: 6px;
          cursor: pointer;
        }
        .mr-tab-item.active {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
        }

        /* Asset Card */
        .mr-asset-card-box {
          background: #181c27;
          border: 1px solid #282f42;
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 10px;
        }
        .mr-asset-hdr {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          color: #64748b;
          margin-bottom: 4px;
        }
        .mr-img-mode-tag {
          background: rgba(168, 85, 247, 0.15);
          color: #c084fc;
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
        }
        .mr-asset-name {
          font-size: 11px;
          color: #e2e8f0;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Nav row */
        .mr-nav-row-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .mr-nav-btn-sm {
          background: #1a202c;
          border: 1px solid #2d3748;
          color: #94a3b8;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
        }

        /* Live metrics */
        .mr-live-metrics-box {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #94a3b8;
          background: #181c27;
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid #252b3d;
          margin-bottom: 10px;
        }
        .mr-metric-val {
          font-weight: 700;
          color: #4ade80;
        }

        /* Big primary action button */
        .mr-btn-go-primary {
          width: 100%;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          border: none;
          padding: 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
          transition: all 0.2s ease;
          margin-bottom: 12px;
        }
        .mr-btn-go-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.45);
        }

        /* Result Cards */
        .mr-res-card {
          background: #181c27;
          border: 1px solid #282f42;
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 8px;
        }
        .mr-res-hdr {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          margin-bottom: 6px;
        }
        .mr-count-pill {
          background: rgba(74, 222, 128, 0.15);
          color: #4ade80;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-family: 'JetBrains Mono', monospace;
        }
        .mr-res-title-text {
          font-size: 11px;
          color: #f8fafc;
          line-height: 1.4;
          min-height: 32px;
        }

        /* Keyword pills container */
        .rt-tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          max-height: 110px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .rt-tag-pill {
          background: #1e2433;
          border: 1px solid #2e374d;
          color: #cbd5e1;
          font-size: 10px;
          padding: 2px 7px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          animation: tagFadeIn 0.2s ease forwards;
        }
        @keyframes tagFadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Toast notification */
        .rt-toast {
          position: fixed;
          bottom: 24px; right: 24px;
          background: #10b981;
          color: #ffffff;
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          transform: translateY(100px);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 9999;
        }
        .rt-toast.show {
          transform: translateY(0);
          opacity: 1;
        }
      </style>

      <div class="rt-flex-layout">
        <!-- LEFT CARD: Stock Asset & Vision AI Preview -->
        <div class="rt-flex-card rt-demo-card">
          <div class="rt-card-title-bar">
            <div class="rt-card-heading">
              <span>📷 Stock Asset Preview</span>
            </div>
            <div class="rt-provider-select-wrapper">
              <select id="rt-provider-select" class="rt-provider-select">
                <option value="groq">Groq (Llama 3.3 70B)</option>
                <option value="gemini">Gemini (2.5 Flash)</option>
                <option value="deepseek">DeepSeek V3</option>
                <option value="openai">OpenAI (GPT-4o)</option>
              </select>
            </div>
          </div>

          <!-- Asset Selector Buttons -->
          <div class="rt-asset-bar">
            ${ASSET_PRESETS.map((preset, idx) => `
              <div class="rt-asset-btn ${idx === 0 ? 'active' : ''}" data-preset="${idx}" style="background: ${preset.gradient}">
                <span>${preset.icon}</span>
                <span class="rt-asset-btn-label">${preset.name}</span>
              </div>
            `).join('')}
          </div>

          <!-- Stock Image Box with Scanning Laser Beam -->
          <div id="rt-preview-box" class="rt-preview-box" style="background: ${ASSET_PRESETS[0].gradient}">
            <div id="rt-laser-beam" class="rt-laser-beam"></div>
            <div class="rt-preview-info">
              <div id="rt-preview-category" class="rt-preview-category">${ASSET_PRESETS[0].category}</div>
              <div id="rt-preview-title-short" class="rt-preview-title-short">${ASSET_PRESETS[0].name}</div>
            </div>
          </div>

          <!-- Platform Rule Switcher Tabs -->
          <div class="rt-card-heading" style="margin-bottom: 6px; font-size: 11px; color: #94a3b8;">
            <span>Target Platform Strategy</span>
          </div>
          <div class="rt-platform-tabs">
            <button class="rt-tab-btn active" data-platform="adobe">Adobe Stock</button>
            <button class="rt-tab-btn" data-platform="shutterstock">Shutterstock</button>
            <button class="rt-tab-btn" data-platform="freepik">Freepik</button>
            <button class="rt-tab-btn" data-platform="vecteezy">Vecteezy</button>
          </div>
        </div>

        <!-- RIGHT CARD: Authentic ReadyTag Extension Panel (Matching panel.html) -->
        <div class="rt-flex-card rt-panel-card">
          <!-- Real Panel Header -->
          <div class="mr-panel-header">
            <div class="mr-logo-group">
              <div class="mr-logo-dot"></div>
              <span>ReadyTag</span>
              <span id="mr-provider-badge" class="mr-provider-badge">Groq</span>
            </div>
            <div class="mr-header-icons">
              <button class="mr-icon-btn" title="Settings">⚙</button>
              <button class="mr-icon-btn" title="Help">?</button>
              <button class="mr-icon-btn" title="Toggle theme">🌙</button>
              <button class="mr-icon-btn" title="Minimize Panel">›</button>
            </div>
          </div>

          <!-- Tab Bar -->
          <div class="mr-tabs-bar">
            <div class="mr-tab-item active">Generate</div>
            <div class="mr-tab-item">Customize</div>
            <div class="mr-tab-item">Log</div>
            <div class="mr-tab-item">CSV ↗</div>
          </div>

          <!-- Current Asset Title Card -->
          <div class="mr-asset-card-box">
            <div class="mr-asset-hdr">
              <span>Current asset</span>
              <span class="mr-img-mode-tag">📷 Image mode</span>
            </div>
            <div id="mr-asset-title-label" class="mr-asset-name">${ASSET_PRESETS[0].name}.jpg</div>
          </div>

          <!-- Nav Row & Live Metrics -->
          <div class="mr-nav-row-box">
            <button class="mr-nav-btn-sm">‹ Prev</button>
            <span style="font-size: 10px; color: #64748b;">Asset 1 of 12</span>
            <button class="mr-nav-btn-sm">Next ›</button>
          </div>

          <div class="mr-live-metrics-box">
            <span id="rt-live-title-metric">Title: <span class="mr-metric-val" id="rt-title-len-val">78</span>/90 chars</span>
            <span id="rt-live-kw-metric">Keywords: <span class="mr-metric-val" id="rt-kw-cnt-val">20</span>/30</span>
          </div>

          <!-- Primary Generate Action Button -->
          <button id="rt-btn-generate" class="mr-btn-go-primary">
            <span>▶</span>
            <span>Generate & Apply Metadata</span>
          </button>

          <!-- Generated Title Result Card -->
          <div class="mr-res-card">
            <div class="mr-res-hdr">
              <span>New Title</span>
              <span id="rt-title-count-badge" class="mr-count-pill">78 chars</span>
            </div>
            <div id="rt-title-display" class="mr-res-title-text">${ASSET_PRESETS[0].title}</div>
          </div>

          <!-- Generated Keywords Result Card -->
          <div class="mr-res-card">
            <div class="mr-res-hdr">
              <span>Ranked Keywords</span>
              <div style="display: flex; gap: 6px; align-items: center;">
                <span id="rt-kw-count-badge" class="mr-count-pill">20 tags</span>
                <button id="rt-btn-copy" style="background: transparent; border: none; color: #6366f1; font-size: 10px; font-weight: 700; cursor: pointer;">Copy All</button>
              </div>
            </div>
            <div id="rt-tags-container" class="rt-tags-container"></div>
          </div>
        </div>
      </div>

      <div id="rt-toast" class="rt-toast">Copied 20 keywords to clipboard!</div>
    `;
  }
  /**
   * Event Listeners Setup
   */
  function bindEvents(container) {
    // 1. Asset Switcher
    const assetBtns = container.querySelectorAll('.rt-asset-btn');
    assetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-preset'), 10);
        if (index === currentPresetIndex) return;

        assetBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        updatePresetView(index, false);
      });
    });

    // 2. Platform Switcher
    const tabBtns = container.querySelectorAll('.rt-tab-btn');
    tabBtns.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabBtns.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        currentPlatformId = tab.getAttribute('data-platform');
        updateComplianceMeters();
      });
    });

    // 3. Provider Selector
    const providerSelect = container.querySelector('#rt-provider-select');
    if (providerSelect) {
      providerSelect.addEventListener('change', (e) => {
        currentProviderId = e.target.value;
        const badgeEl = container.querySelector('#mr-provider-badge');
        if (badgeEl) {
          const provObj = AI_PROVIDERS[currentProviderId];
          badgeEl.textContent = provObj ? provObj.name.split(' ')[0] : 'Groq';
        }
      });
    }

    // 4. Generate Button
    const genBtn = container.querySelector('#rt-btn-generate');
    if (genBtn) {
      genBtn.addEventListener('click', () => {
        triggerLaserScan(container);
        runTypingAndPillsAnimation(container);
      });
    }

    // 5. Copy Keywords Button
    const copyBtn = container.querySelector('#rt-btn-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const preset = ASSET_PRESETS[currentPresetIndex];
        const textToCopy = preset.tags.join(', ');
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).catch(() => {});
        }

        showToast(`Copied ${preset.tags.length} keywords to clipboard!`);
      });
    }
  }

  /**
   * Updates current preset view, updates thumbnail background, triggers laser scan,
   * updates provider badges & runs title/keyword animations.
   */
  function updatePresetView(index, isInitial) {
    currentPresetIndex = index;
    const preset = ASSET_PRESETS[index];
    const container = document.querySelector('.readytag-mockup-wrapper') || document.querySelector('#extension-preview-root');
    if (!container) return;

    // Update thumbnail preview box
    const previewBox = container.querySelector('#rt-preview-box');
    const categoryEl = container.querySelector('#rt-preview-category');
    const titleShortEl = container.querySelector('#rt-preview-title-short');
    const assetTitleLabel = container.querySelector('#mr-asset-title-label');

    if (previewBox) previewBox.style.background = preset.gradient;
    if (categoryEl) categoryEl.textContent = preset.category;
    if (titleShortEl) titleShortEl.textContent = preset.name;
    if (assetTitleLabel) assetTitleLabel.textContent = `${preset.name.toLowerCase().replace(/\s+/g, '_')}.jpg`;

    // Trigger laser scanning animation
    triggerLaserScan(container);

    // Update Badges & Meters
    updateComplianceMeters();

    // Run Title and Keyword Pill Animation
    runTypingAndPillsAnimation(container);
  }

  /**
   * Triggers simulated "Vision AI Scanning" laser animation over active thumbnail
   */
  function triggerLaserScan(container) {
    const laser = container.querySelector('#rt-laser-beam');
    if (!laser) return;
    laser.classList.remove('scanning');
    // Force reflow
    void laser.offsetWidth;
    laser.classList.add('scanning');
  }

  /**
   * Recalculates and updates compliance meters with green fill percentages
   */
  function updateComplianceMeters() {
    const container = document.querySelector('.readytag-mockup-wrapper') || document.querySelector('#extension-preview-root');
    if (!container) return;

    const preset = ASSET_PRESETS[currentPresetIndex];
    const platform = PLATFORMS[currentPlatformId] || PLATFORMS.adobe;

    const titleLen = preset.title.length;
    const kwCount = preset.tags.length;

    // Metric display numbers
    const titleLenVal = container.querySelector('#rt-title-len-val');
    const kwCntVal = container.querySelector('#rt-kw-cnt-val');
    const titleBadge = container.querySelector('#rt-title-count-badge');
    const kwBadge = container.querySelector('#rt-kw-count-badge');

    if (titleLenVal) titleLenVal.textContent = titleLen;
    if (kwCntVal) kwCntVal.textContent = kwCount;
    if (titleBadge) titleBadge.textContent = `${titleLen} / ${platform.maxTitleLength} chars`;
    if (kwBadge) kwBadge.textContent = `${kwCount} / ${platform.maxKeywords} tags`;
  }

  /**
   * Runs typing animation for title and populates keyword pills sequentially
   */
  function runTypingAndPillsAnimation(container) {
    const preset = ASSET_PRESETS[currentPresetIndex];
    const titleDisplay = container.querySelector('#rt-title-display');
    const tagsContainer = container.querySelector('#rt-tags-container');

    if (!titleDisplay || !tagsContainer) return;

    // Clear active timers
    if (typingTimer) clearInterval(typingTimer);
    pillTimers.forEach((t) => clearTimeout(t));
    pillTimers = [];

    // Reset Title & Pills
    titleDisplay.textContent = '';
    tagsContainer.innerHTML = '';

    // Typing Title Animation
    const fullTitle = preset.title;
    let charIndex = 0;

    typingTimer = setInterval(() => {
      if (charIndex < fullTitle.length) {
        titleDisplay.textContent += fullTitle.charAt(charIndex);
        charIndex++;
      } else {
        clearInterval(typingTimer);
        typingTimer = null;
      }
    }, 18);

    // Sequential Keyword Pills Population
    preset.tags.forEach((tag, idx) => {
      const pill = document.createElement('span');
      pill.className = 'rt-tag-pill';
      pill.textContent = tag;
      tagsContainer.appendChild(pill);

      const timer = setTimeout(() => {
        pill.style.opacity = '1';
      }, 60 + idx * 30);
      pillTimers.push(timer);
    });
  }

  /**
   * Triggers sleek toast notification
   */
  function showToast(message) {
    let toast = document.querySelector('#rt-toast') || document.querySelector('.rt-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'rt-toast';
      toast.className = 'rt-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // Export globally
  window.initExtensionMockup = initExtensionMockup;

  // Auto-initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExtensionMockup);
  } else {
    initExtensionMockup();
  }
})();
