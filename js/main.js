/* ============================================
   main.js — 入口：初始化所有子系统
   ============================================ */

(function () {
  'use strict';

  var initialized = false;

  function initAll() {
    if (initialized) return;
    initialized = true;

    /* ---- Hero 银河背景 ---- */
    var particleCanvas = document.getElementById('particle-canvas');
    var galaxy = null;

    try {
      if (particleCanvas && typeof window.Galaxy === 'function') {
        galaxy = new window.Galaxy(particleCanvas, {
          starSpeed: 0.5,
          density: 1.4,
          hueShift: 140,
          speed: 1,
          glowIntensity: 0.65,
          saturation: 0,
          mouseRepulsion: true,
          repulsionStrength: 2,
          twinkleIntensity: 0.3,
          rotationSpeed: 0.1,
          transparent: true,
        });
      }
    } catch (e) {
      console.warn('Galaxy background skipped:', e.message);
    }

    /* ---- Footer 星空 ---- */
    initStarfield();

    /* ---- 滚动动画 ---- */
    window.ScrollAnimations.init();

    /* ---- 时间线展开/收起 ---- */
    var timelineToggle = document.getElementById('timeline-toggle');
    var timeline = document.getElementById('timeline');
    var toggleText = timelineToggle ? timelineToggle.querySelector('.toggle-text') : null;

    if (timelineToggle && timeline) {
      timelineToggle.addEventListener('click', function () {
        var isOpen = timeline.classList.toggle('expanded');
        timelineToggle.classList.toggle('open', isOpen);
        if (toggleText) {
          toggleText.textContent = isOpen ? '收起时间线' : '展开我的时间线';
        }
      });
    }

    /* ---- 平滑滚动到 Works ---- */
    var heroCta = document.querySelector('.hero-cta');
    if (heroCta) {
      heroCta.addEventListener('click', function (e) {
        var target = document.querySelector(heroCta.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  function initStarfield() {
    var starsCanvas = document.getElementById('stars-canvas');
    if (starsCanvas && typeof window.Starfield === 'function') {
      new window.Starfield(starsCanvas);
    }
  }

  // ES module 脚本是 defer 的，此时 DOM 已就绪
  // try/catch 可确保即使 Galaxy 抛错，剩余部分也能执行
  if (window.Galaxy) {
    initAll();
  } else {
    window.addEventListener('galaxy-ready', initAll);
  }
  // 兜底：3 秒后如果还没收到事件，也强制启动
  setTimeout(function () {
    if (!initialized) initAll();
  }, 3000);

})();
