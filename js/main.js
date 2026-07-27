/**
 * ReadyTag — Main Script & Interactive UI Controllers
 * File: site/js/main.js
 */

(function () {
  'use strict';

  /**
   * Utility: Throttle function using requestAnimationFrame
   * Prevents excessive layout recalculations during scroll/resize events
   */
  function rafThrottle(fn) {
    let ticking = false;
    return function (...args) {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          fn.apply(this, args);
          ticking = false;
        });
        ticking = true;
      }
    };
  }

  /**
   * 1. Sticky Glass Navbar Controller
   * Listens to window scroll with throttling and toggles .navbar-scrolled on #main-nav
   */
  function initStickyNavbar() {
    const mainNav = document.getElementById('main-nav') || document.querySelector('.navbar') || document.querySelector('nav');
    if (!mainNav) return;

    const handleScroll = () => {
      if (window.scrollY > 40) {
        mainNav.classList.add('navbar-scrolled');
      } else {
        mainNav.classList.remove('navbar-scrolled');
      }
    };

    // Run on init in case page is loaded already scrolled
    handleScroll();

    window.addEventListener('scroll', rafThrottle(handleScroll), { passive: true });
  }

  /**
   * 2. Smooth Anchor Navigation
   * Intercepts clicks on internal anchor links (a[href^="#"]) and scrolls with 80px navbar offset
   */
  function initSmoothAnchors() {
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const targetElement = document.querySelector(href);
      if (!targetElement) return;

      e.preventDefault();

      const navbarOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Automatically close mobile menu when a navigation item is clicked
      const navContainer = document.getElementById('nav-links-container');
      const mobileBtn = document.getElementById('mobile-menu-btn');
      if (navContainer && navContainer.classList.contains('active')) {
        navContainer.classList.remove('active');
        if (mobileBtn) mobileBtn.classList.remove('active');
      }
    });
  }

  /**
   * 3. Platform Comparison Matrix Tab Switcher
   * Filters .matrix-row and .platform-rule-card by data-platform attribute with fade effect
   */
  function initPlatformMatrixTabs() {
    const tabBtns = document.querySelectorAll('.matrix-tab-btn');
    if (!tabBtns.length) return;

    const matrixRows = document.querySelectorAll('.matrix-row');
    const platformCards = document.querySelectorAll('.platform-rule-card');
    const itemsToFilter = [...matrixRows, ...platformCards];

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const selectedPlatform = btn.getAttribute('data-platform') || 'all';

        // Toggle active class on buttons
        tabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        // Smooth filter transition
        itemsToFilter.forEach((item) => {
          const itemPlatform = item.getAttribute('data-platform') || 'all';
          const shouldShow =
            selectedPlatform === 'all' ||
            itemPlatform === 'all' ||
            itemPlatform === selectedPlatform;

          if (shouldShow) {
            item.style.display = '';
            // Trigger reflow for transition
            void item.offsetWidth;
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
            item.classList.remove('is-hidden');
          } else {
            item.style.opacity = '0';
            item.style.transform = 'translateY(8px)';
            item.classList.add('is-hidden');
            setTimeout(() => {
              if (item.classList.contains('is-hidden')) {
                item.style.display = 'none';
              }
            }, 200);
          }
        });
      });
    });
  }

  /**
   * 4. Accordion FAQ Controller
   * Toggles .active class on parent .faq-item and expands/collapses .faq-answer smoothly
   */
  function initFAQAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (!faqQuestions.length) return;

    faqQuestions.forEach((question) => {
      question.addEventListener('click', () => {
        const faqItem = question.closest('.faq-item');
        if (!faqItem) return;

        const faqAnswer = faqItem.querySelector('.faq-answer');
        const isAlreadyActive = faqItem.classList.contains('active');

        // Single accordion mode: close all other items
        const allItems = document.querySelectorAll('.faq-item');
        allItems.forEach((item) => {
          if (item !== faqItem) {
            item.classList.remove('active');
            const ans = item.querySelector('.faq-answer');
            if (ans) {
              ans.style.maxHeight = null;
            }
          }
        });

        // Toggle target item
        if (isAlreadyActive) {
          faqItem.classList.remove('active');
          if (faqAnswer) faqAnswer.style.maxHeight = null;
        } else {
          faqItem.classList.add('active');
          if (faqAnswer) {
            faqAnswer.style.maxHeight = faqAnswer.scrollHeight + 'px';
          }
        }
      });
    });
  }

  /**
   * 5. Mobile Navigation Menu Toggle
   * Toggles .active class on #nav-links-container when #mobile-menu-btn is clicked
   */
  function initMobileNav() {
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navContainer = document.getElementById('nav-links-container');
    if (!mobileBtn || !navContainer) return;

    mobileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileBtn.classList.toggle('active');
      navContainer.classList.toggle('active');
    });

    // Close when clicking outside of menu
    document.addEventListener('click', (e) => {
      if (
        navContainer.classList.contains('active') &&
        !navContainer.contains(e.target) &&
        !mobileBtn.contains(e.target)
      ) {
        navContainer.classList.remove('active');
        mobileBtn.classList.remove('active');
      }
    });
  }

  /**
   * 6. IntersectionObserver Scroll Reveal Animations
   * Adds .is-visible class to .animate-on-scroll elements when they enter viewport
   */
  function initScrollReveal() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (!animatedElements.length) return;

    if ('IntersectionObserver' in window) {
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.15
      };

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, observerOptions);

      animatedElements.forEach((el) => observer.observe(el));
    } else {
      // Fallback for environments without IntersectionObserver
      animatedElements.forEach((el) => el.classList.add('is-visible'));
    }
  }

  /**
   * 7. Global Expose & Auto-Initialization
   */
  function initMainSite() {
    initStickyNavbar();
    initSmoothAnchors();
    initPlatformMatrixTabs();
    initFAQAccordion();
    initMobileNav();
    initScrollReveal();
  }

  // Expose global initMainSite function
  window.initMainSite = initMainSite;

  // Auto initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMainSite);
  } else {
    initMainSite();
  }
})();
