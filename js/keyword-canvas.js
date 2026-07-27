/**
 * ReadyTag Hero Floating Keyword Canvas Component
 * Renders an interactive 2D canvas of floating keyword pills with proximity connection lines.
 */

(function () {
  'use strict';

  const KEYWORDS = [
    "4k background",
    "vector illustration",
    "isolated on white",
    "golden hour",
    "copy space",
    "commercial use",
    "trending tag",
    "seamless pattern",
    "high resolution",
    "stock photography",
    "minimalist vector",
    "abstract 3d",
    "business concept",
    "ai prompt",
    "adobe stock ready",
    "shutterstock seo",
    "freepik contributor",
    "vecteezy vector",
    "vision ai scan",
    "batch auto tag",
    "csv bulk export",
    "byok privacy",
    "groq llama 70b",
    "gemini 2.5 flash",
    "deepseek v3",
    "royalty revenue",
    "high converting tags",
    "search placement",
    "top 5 priority",
    "character limit safe",
    "microstock agency",
    "digital asset"
  ];

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      return;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function initKeywordCanvas() {
    const canvas = document.getElementById('hero-keyword-canvas');
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const parent = canvas.parentElement || document.body;
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let animationFrameId = null;
    let isVisible = true;

    const mouse = {
      x: null,
      y: null,
      active: false,
      radius: 160
    };

    class Particle {
      constructor(text, containerWidth, containerHeight) {
        this.text = text;
        this.x = Math.random() * (Math.max(containerWidth - 120, 50)) + 60;
        this.y = Math.random() * (Math.max(containerHeight - 80, 50)) + 40;
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.25 + Math.random() * 0.35;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.pillWidth = 0;
        this.pillHeight = 24;
        this.paddingX = 8;
        this.dotRadius = 2.5;
        this.measured = false;
      }

      measure(ctx) {
        ctx.font = '500 11px Inter, system-ui, -apple-system, sans-serif';
        const textWidth = ctx.measureText(this.text).width;
        this.pillWidth = textWidth + 28;
        this.measured = true;
      }

      update(boundsWidth, boundsHeight, mouseState) {
        // Mouse repulsion / attraction force
        if (mouseState.active && mouseState.x !== null && mouseState.y !== null) {
          const dx = this.x - mouseState.x;
          const dy = this.y - mouseState.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouseState.radius && dist > 0) {
            const force = (1 - dist / mouseState.radius) * 0.35;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            this.vx += fx;
            this.vy += fy;
          }
        }

        // Apply friction / drag to stabilize velocity
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Maintain gentle minimum movement speed
        const currentSpeed = Math.hypot(this.vx, this.vy);
        if (currentSpeed < 0.15) {
          const angle = Math.atan2(this.vy, this.vx) || Math.random() * Math.PI * 2;
          this.vx = Math.cos(angle) * 0.15;
          this.vy = Math.sin(angle) * 0.15;
        } else if (currentSpeed > 1.8) {
          this.vx = (this.vx / currentSpeed) * 1.8;
          this.vy = (this.vy / currentSpeed) * 1.8;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Bounce off canvas boundaries gracefully
        const marginX = (this.pillWidth / 2) || 40;
        const marginY = (this.pillHeight / 2) || 15;

        if (this.x < marginX) {
          this.x = marginX;
          this.vx *= -1;
        } else if (this.x > boundsWidth - marginX) {
          this.x = boundsWidth - marginX;
          this.vx *= -1;
        }

        if (this.y < marginY) {
          this.y = marginY;
          this.vy *= -1;
        } else if (this.y > boundsHeight - marginY) {
          this.y = boundsHeight - marginY;
          this.vy *= -1;
        }
      }

      draw(ctx) {
        if (!this.measured) {
          this.measure(ctx);
        }

        const halfW = this.pillWidth / 2;
        const halfH = this.pillHeight / 2;
        const rx = this.x - halfW;
        const ry = this.y - halfH;

        // Decreased opacity rounded pill background & border
        drawRoundedRect(ctx, rx, ry, this.pillWidth, this.pillHeight, 12);
        ctx.fillStyle = 'rgba(18, 24, 38, 0.22)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Accent indigo bullet dot with reduced opacity
        const dotX = rx + this.paddingX + this.dotRadius;
        const dotY = this.y;
        ctx.beginPath();
        ctx.arc(dotX, dotY, this.dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.45)';
        ctx.fill();

        // Keyword text with reduced opacity
        ctx.font = '500 11px Inter, system-ui, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(203, 213, 225, 0.35)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const textX = dotX + this.dotRadius + 5;
        ctx.fillText(this.text, textX, this.y);
      }
    }

    let particles = [];

    function resizeCanvas() {
      const rect = parent.getBoundingClientRect();
      width = rect.width || parent.clientWidth || window.innerWidth;
      height = rect.height || parent.clientHeight || window.innerHeight;
      dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (particles.length === 0) {
        particles = KEYWORDS.map(kw => new Particle(kw, width, height));
      } else {
        // Keep existing particles within new canvas dimensions
        particles.forEach(p => {
          p.x = Math.min(Math.max(p.x, 30), width - 30);
          p.y = Math.min(Math.max(p.y, 20), height - 20);
        });
      }
    }

    function drawConnections() {
      const maxDist = 140;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.05;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      if (!isVisible) return;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Draw connection lines between nearby keyword pills
      drawConnections();

      // Update and render particles
      particles.forEach(p => {
        p.update(width, height, mouse);
        p.draw(ctx);
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(animate);
    }

    function startLoop() {
      if (!animationFrameId && isVisible) {
        animationFrameId = requestAnimationFrame(animate);
      }
    }

    function stopLoop() {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }

    function debounce(fn, delay) {
      let timer;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    }

    // Mouse interaction tracking
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = null;
      mouse.y = null;
    };

    const heroTarget = canvas.closest('.hero, header, section') || parent;
    heroTarget.addEventListener('mousemove', handleMouseMove, { passive: true });
    heroTarget.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // Debounced window resize listener
    window.addEventListener('resize', debounce(() => {
      resizeCanvas();
    }, 150));

    // IntersectionObserver to pause loop when canvas is out of viewport
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            isVisible = true;
            startLoop();
          } else {
            isVisible = false;
            stopLoop();
          }
        });
      }, { threshold: 0.05 });

      observer.observe(canvas);
    }

    // Initialize dimensions and start animation
    resizeCanvas();
    startLoop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKeywordCanvas);
  } else {
    initKeywordCanvas();
  }
})();
