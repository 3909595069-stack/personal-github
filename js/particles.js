/* ============================================
   particles.js — Hero 区粒子交互系统
   鼠标移动→粒子散开
   鼠标离开→粒子缓慢聚拢回原位
   ============================================ */

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -9999, y: -9999 };
    this.particleCount = 150;
    this.maxRepelDist = 150;
    this.animationId = null;

    this._resizeHandler = this._onResize.bind(this);
    this._mouseHandler = this._onMouseMove.bind(this);
    this._leaveHandler = this._onMouseLeave.bind(this);

    window.addEventListener('resize', this._resizeHandler);
    canvas.addEventListener('mousemove', this._mouseHandler);
    canvas.addEventListener('mouseleave', this._leaveHandler);

    this._resize();
    this._initParticles();
    this._animate();
  }

  /* ---- 内部方法 ---- */

  _resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  _onResize() {
    this._resize();
    // 粒子重新分布到新画布范围
    for (const p of this.particles) {
      p.baseX = Math.random() * this.width;
      p.baseY = Math.random() * this.height;
      p.x = p.baseX;
      p.y = p.baseY;
    }
  }

  _onMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  _onMouseLeave() {
    this.mouse.x = -9999;
    this.mouse.y = -9999;
  }

  _initParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      this.particles.push({
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        baseX: x,
        baseY: y,
        size: Math.random() * 2 + 0.8,
        // 70%锐蓝 30%暖金
        color: Math.random() < 0.7
          ? { r: 100, g: 181, b: 246 }   // #64B5F6
          : { r: 255, g: 183, b: 77 },    // #FFB74D
        opacity: Math.random() * 0.5 + 0.15,
      });
    }
  }

  _animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (const p of this.particles) {
      // 鼠标排斥力
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.maxRepelDist && dist > 0) {
        const force = Math.pow((this.maxRepelDist - dist) / this.maxRepelDist, 2);
        const angle = Math.atan2(dy, dx);
        p.vx += Math.cos(angle) * force * 3;
        p.vy += Math.sin(angle) * force * 3;
      }

      // 回归原位
      p.vx += (p.baseX - p.x) * 0.008;
      p.vy += (p.baseY - p.y) * 0.008;

      // 阻尼
      p.vx *= 0.94;
      p.vy *= 0.94;

      // 更新位置
      p.x += p.vx;
      p.y += p.vy;

      // 绘制
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity})`;
      this.ctx.fill();
    }

    this.animationId = requestAnimationFrame(() => this._animate());
  }

  /* ---- 公开方法 ---- */

  destroy() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this._resizeHandler);
    this.canvas.removeEventListener('mousemove', this._mouseHandler);
    this.canvas.removeEventListener('mouseleave', this._leaveHandler);
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}

/* 挂载到全局 */
window.ParticleSystem = ParticleSystem;
