/* ============================================
   particles.js — Starfield 星尘背景（仅 Footer）
   Galaxy 效果已移至 galaxy.js (OGL WebGL 版)
   ============================================ */

class Starfield {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.starCount = 200;
    this.animationId = null;

    this._resizeHandler = this._onResize.bind(this);

    window.addEventListener('resize', this._resizeHandler);
    this._resize();
    this._initStars();
    this._animate();
  }

  _resize() {
    const footer = this.canvas.parentElement;
    if (footer) {
      this.width = this.canvas.width = footer.clientWidth;
      this.height = this.canvas.height = footer.clientHeight;
    } else {
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
    }
  }

  _onResize() {
    this._resize();
    for (const s of this.stars) {
      s.x = Math.random() * this.width;
      s.y = Math.random() * this.height;
    }
  }

  _initStars() {
    this.stars = [];
    for (let i = 0; i < this.starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.6 + 0.1,
        speedY: Math.random() * 0.15 + 0.03,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.008 + 0.002,
      });
    }
  }

  _animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (const s of this.stars) {
      s.y -= s.speedY;
      if (s.y < -5) {
        s.y = this.height + 5;
        s.x = Math.random() * this.width;
      }

      s.twinkle += s.twinkleSpeed;
      const currentOpacity = s.opacity * (0.5 + 0.5 * Math.sin(s.twinkle));

      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(238, 234, 224, ${currentOpacity})`;
      this.ctx.fill();
    }

    this.animationId = requestAnimationFrame(() => this._animate());
  }

  destroy() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this._resizeHandler);
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}

window.Starfield = Starfield;
