/* ============================================
   main.js — 入口：初始化所有子系统
   ============================================ */

(function () {
  'use strict';

  /* ---- Hero 银河背景 ---- */
  const particleCanvas = document.getElementById('particle-canvas');
  let galaxy = null;

  if (particleCanvas) {
    galaxy = new window.Galaxy(particleCanvas);
  }

  /* ---- Footer 星空 ---- */
  const starsCanvas = document.getElementById('stars-canvas');
  let starfield = null;

  if (starsCanvas) {
    starfield = new window.Starfield(starsCanvas);
  }

  /* ---- 滚动动画 ---- */
  window.ScrollAnimations.init();

  /* ---- 时间线展开/收起 ---- */
  const timelineToggle = document.getElementById('timeline-toggle');
  const timeline = document.getElementById('timeline');
  const toggleText = timelineToggle?.querySelector('.toggle-text');

  if (timelineToggle && timeline) {
    timelineToggle.addEventListener('click', () => {
      const isOpen = timeline.classList.toggle('expanded');
      timelineToggle.classList.toggle('open', isOpen);
      if (toggleText) {
        toggleText.textContent = isOpen ? '收起时间线' : '展开我的时间线';
      }
    });
  }

  /* ---- 平滑滚动到Works区（Hero CTA按钮） ---- */
  const heroCta = document.querySelector('.hero-cta');
  if (heroCta) {
    heroCta.addEventListener('click', (e) => {
      const target = document.querySelector(heroCta.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

})();
