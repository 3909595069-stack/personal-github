/* ============================================
   scroll-animations.js
   用 Intersection Observer 实现滚动渐显
   每个section进入视口→加 .visible 类
   每个section离开视口→移除 .visible 类
   ============================================ */

const ScrollAnimations = {
  observer: null,

  init(options = {}) {
    const config = {
      threshold: 0.15,        // section 15%可见时触发
      rootMargin: '0px 0px -50px 0px',
      ...options,
    };

    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
        // 不移除visible，保持已亮区域
      }
    }, config);

    // 观察所有section
    const sections = document.querySelectorAll('section');
    for (const section of sections) {
      this.observer.observe(section);
    }
  },

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  },
};

window.ScrollAnimations = ScrollAnimations;
