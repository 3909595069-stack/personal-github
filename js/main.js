/* ============================================
   main.js — 入口：初始化所有子系统
   ============================================ */

(function () {
  'use strict';

  /* ---- Hero 银河背景 ---- */
  // 使用 OGL WebGL Galaxy（ReactBits 移植版）
  // Galaxy 类在 galaxy.js 中定义，OGL 由 CDN 加载
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
    // WebGL 不可用时回退：Galaxy 背景静默跳过，其余内容正常显示
    console.warn('Galaxy background skipped:', e.message);
  }

  /* ---- Footer 星空 ---- */
  var starsCanvas = document.getElementById('stars-canvas');
  var starfield = null;

  if (starsCanvas && typeof window.Starfield === 'function') {
    starfield = new window.Starfield(starsCanvas);
  }

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

  /* ---- 平滑滚动到Works区（Hero CTA按钮） ---- */
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

})();
