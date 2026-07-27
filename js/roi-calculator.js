/**
 * ReadyTag Website - Interactive ROI & Time Saved Calculator
 */

(function () {
  'use strict';

  let animationFrameId = null;
  let currentValues = {
    monthly: 0,
    yearly: 0,
    royalty: 0
  };

  let hasAnimatedOnScroll = false;

  function initROICalculator() {
    const assetsInput = document.getElementById('calc-assets');
    const minutesInput = document.getElementById('calc-minutes');
    const assetsDisplay = document.getElementById('val-assets-display');
    const minutesDisplay = document.getElementById('val-minutes-display');
    const outMonthly = document.getElementById('out-hours-monthly');
    const outYearly = document.getElementById('out-hours-yearly');
    const outRoyalty = document.getElementById('out-royalty-boost');

    // Enforce slider defaults & attributes if elements exist
    if (assetsInput) {
      if (!assetsInput.hasAttribute('min')) assetsInput.min = '20';
      if (!assetsInput.hasAttribute('max')) assetsInput.max = '2000';
      if (!assetsInput.hasAttribute('step')) assetsInput.step = '10';
      if (!assetsInput.value) assetsInput.value = '300';
    }
    if (minutesInput) {
      if (!minutesInput.hasAttribute('min')) minutesInput.min = '1';
      if (!minutesInput.hasAttribute('max')) minutesInput.max = '15';
      if (!minutesInput.hasAttribute('step')) minutesInput.step = '0.5';
      if (!minutesInput.value) minutesInput.value = '5';
    }

    function calculateTargets() {
      const assets = assetsInput ? parseFloat(assetsInput.value) || 300 : 300;
      const minutes = minutesInput ? parseFloat(minutesInput.value) || 5 : 5;

      const hoursSavedMonthly = Math.round((assets * minutes * 0.88) / 60);
      const hoursSavedYearly = Math.round(hoursSavedMonthly * 12);
      const estimatedRoyaltyBoost = Math.round(assets * 0.45 * 1.25);

      return {
        monthly: hoursSavedMonthly,
        yearly: hoursSavedYearly,
        royalty: estimatedRoyaltyBoost,
        assets,
        minutes
      };
    }

    function updateBadgeDisplays(assets, minutes) {
      if (assetsDisplay) {
        assetsDisplay.textContent = `${Math.round(assets)} assets / month`;
      }
      if (minutesDisplay) {
        minutesDisplay.textContent = `${parseFloat(minutes).toFixed(1)} mins / asset`;
      }
    }

    function animateToTargets(targets, duration = 400) {
      const startMonthly = currentValues.monthly;
      const startYearly = currentValues.yearly;
      const startRoyalty = currentValues.royalty;

      const targetMonthly = targets.monthly;
      const targetYearly = targets.yearly;
      const targetRoyalty = targets.royalty;

      const startTime = performance.now();

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing function (easeOutCubic)
        const ease = 1 - Math.pow(1 - progress, 3);

        const currentM = startMonthly + (targetMonthly - startMonthly) * ease;
        const currentY = startYearly + (targetYearly - startYearly) * ease;
        const currentR = startRoyalty + (targetRoyalty - startRoyalty) * ease;

        currentValues.monthly = currentM;
        currentValues.yearly = currentY;
        currentValues.royalty = currentR;

        if (outMonthly) {
          outMonthly.textContent = `${Math.round(currentM)} hrs`;
        }
        if (outYearly) {
          outYearly.textContent = `${Math.round(currentY)} hrs`;
        }
        if (outRoyalty) {
          outRoyalty.textContent = `+$${Math.round(currentR)} / mo`;
        }

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          currentValues.monthly = targetMonthly;
          currentValues.yearly = targetYearly;
          currentValues.royalty = targetRoyalty;

          if (outMonthly) outMonthly.textContent = `${targetMonthly} hrs`;
          if (outYearly) outYearly.textContent = `${targetYearly} hrs`;
          if (outRoyalty) outRoyalty.textContent = `+$${targetRoyalty} / mo`;
        }
      }

      animationFrameId = requestAnimationFrame(step);
    }

    function updateCalculator(animate = true) {
      const targets = calculateTargets();
      updateBadgeDisplays(targets.assets, targets.minutes);

      if (animate) {
        animateToTargets(targets);
      } else {
        currentValues.monthly = targets.monthly;
        currentValues.yearly = targets.yearly;
        currentValues.royalty = targets.royalty;
        if (outMonthly) outMonthly.textContent = `${targets.monthly} hrs`;
        if (outYearly) outYearly.textContent = `${targets.yearly} hrs`;
        if (outRoyalty) outRoyalty.textContent = `+$${targets.royalty} / mo`;
      }
    }

    // Event listeners for range input changes
    if (assetsInput) {
      assetsInput.addEventListener('input', () => updateCalculator(true));
      assetsInput.addEventListener('change', () => updateCalculator(true));
    }
    if (minutesInput) {
      minutesInput.addEventListener('input', () => updateCalculator(true));
      minutesInput.addEventListener('change', () => updateCalculator(true));
    }

    // IntersectionObserver to animate numbers when calculator enters viewport
    const calcContainer = document.getElementById('roi-calculator') ||
                          (assetsInput ? (assetsInput.closest('section') || assetsInput.parentElement) : null);

    if (calcContainer && typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!hasAnimatedOnScroll) {
              hasAnimatedOnScroll = true;
              currentValues = { monthly: 0, yearly: 0, royalty: 0 };
              updateCalculator(true);
            }
          }
        });
      }, { threshold: 0.2 });

      observer.observe(calcContainer);
    } else {
      updateCalculator(true);
    }
  }

  // Expose global initROICalculator function
  window.initROICalculator = initROICalculator;

  // Auto-initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initROICalculator);
  } else {
    initROICalculator();
  }
})();
