/* ============================================
   particles.js — Galaxy 银河背景 + Starfield 星尘
   ============================================ */

/* ============================================
   Galaxy — Hero 区螺旋银河背景
   参数对齐 React Galaxy 组件
   ============================================ */

class Galaxy {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];

    // 参数（对齐 React Galaxy 组件）
    this.starSpeed = 0.5;        // 恒星沿旋臂流动速度
    this.density = 1.4;          // 恒星密度倍数
    this.hueShift = 140;         // 色相偏移 — 蓝
    this.speed = 1;              // 整体速度
    this.glowIntensity = 0.65;   // 辉光强度
    this.saturation = 0;         // 饱和度 — 接近纯白
    this.mouseRepulsion = true;  // 鼠标排斥
    this.repulsionStrength = 2;  // 排斥力度
    this.twinkleIntensity = 0.3; // 闪烁强度
    this.rotationSpeed = 0.1;    // 旋转速度
    this.transparent = true;     // 无背景填充

    this.mouse = { x: -9999, y: -9999 };
    this.centerX = 0;
    this.centerY = 0;
    this.rotation = 0;
    this.animationId = null;

    // 螺旋臂参数
    this.armCount = 4;
    this.starCount = Math.floor(700 * this.density);
    this.armSpread = 0.45;       // 臂间散布
    this.twistFactor = 0.018;    // 螺旋卷曲度

    this._resizeHandler = this._onResize.bind(this);
    this._mouseHandler = this._onMouseMove.bind(this);
    this._leaveHandler = this._onMouseLeave.bind(this);

    window.addEventListener('resize', this._resizeHandler);
    canvas.addEventListener('mousemove', this._mouseHandler);
    canvas.addEventListener('mouseleave', this._leaveHandler);

    this._resize();
    this._initStars();
    this._animate();
  }

  /* ---- 布局 ---- */

  _resize() {
    const parent = this.canvas.parentElement;
    this.width = this.canvas.width = parent ? parent.clientWidth : window.innerWidth;
    this.height = this.canvas.height = parent ? parent.clientHeight : window.innerHeight;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }

  _onResize() {
    this._resize();
    this._initStars();
  }

  /* ---- 鼠标 ---- */

  _onMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  _onMouseLeave() {
    this.mouse.x = -9999;
    this.mouse.y = -9999;
  }

  /* ---- 恒星初始化 ---- */

  _initStars() {
    this.stars = [];
    const maxRadius = Math.min(this.width, this.height) * 0.46;

    for (let i = 0; i < this.starCount; i++) {
      // 选择旋臂
      const arm = Math.floor(Math.random() * this.armCount);
      const armAngle = (arm / this.armCount) * Math.PI * 2 + this.rotation;

      // 距离中心 — 幂分布让中心更密
      const t = Math.random();
      const radius = Math.pow(t, 0.55) * maxRadius + Math.random() * 20;

      // 螺旋公式：角度 = 臂基础角 + 半径 * 卷曲度 + 散布
      const angle = armAngle + radius * this.twistFactor +
        (Math.random() - 0.5) * this.armSpread;

      const x = this.centerX + Math.cos(angle) * radius;
      const y = this.centerY + Math.sin(angle) * radius;

      // 靠近中心更大更亮
      const distRatio = radius / maxRadius;
      const sizeFactor = 1 - distRatio * 0.6;
      const size = (Math.random() * 2 + 0.4) * sizeFactor;

      // 颜色冷暖渐变（中心暖白 → 边缘冷白）
      const warmth = 1 - distRatio;

      this.stars.push({
        arm: arm,
        armAngle: armAngle,
        baseRadius: radius,
        baseAngle: angle,
        x: x,
        y: y,
        size: size,
        warmth: warmth,
        opacity: Math.random() * 0.55 + 0.45,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.025 + 0.004,
        // 辉光（仅较大恒星）
        hasGlow: size > 1.1 && Math.random() < 0.3,
      });
    }

    // 添加中心"尘埃"——大量极小星点模糊成光晕
    const dustCount = 300;
    for (let i = 0; i < dustCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * maxRadius * 0.3;
      this.stars.push({
        arm: -1, // 尘埃不属于任何旋臂
        armAngle: 0,
        baseRadius: radius,
        baseAngle: angle,
        x: this.centerX + Math.cos(angle) * radius,
        y: this.centerY + Math.sin(angle) * radius,
        size: Math.random() * 0.9 + 0.15,
        warmth: 1,
        opacity: Math.random() * 0.35 + 0.1,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.04 + 0.01,
        hasGlow: false,
        isDust: true,
      });
    }
  }

  /* ---- 动画循环 ---- */

  _animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 旋转
    this.rotation += this.rotationSpeed * 0.0008 * this.speed;

    const maxRadius = Math.min(this.width, this.height) * 0.46;

    /* ---- 中心辉光（在恒星下方）---- */
    if (this.glowIntensity > 0) {
      // 主辉光
      const coreGlow = this.ctx.createRadialGradient(
        this.centerX, this.centerY, 0,
        this.centerX, this.centerY, maxRadius * 0.7
      );
      const a = this.glowIntensity * 0.18;
      coreGlow.addColorStop(0, `rgba(170, 205, 255, ${a})`);
      coreGlow.addColorStop(0.3, `rgba(140, 180, 240, ${a * 0.5})`);
      coreGlow.addColorStop(0.7, `rgba(100, 140, 210, ${a * 0.1})`);
      coreGlow.addColorStop(1, 'rgba(80, 100, 180, 0)');
      this.ctx.fillStyle = coreGlow;
      this.ctx.fillRect(0, 0, this.width, this.height);

      // 旋臂方向额外辉光带
      for (let a = 0; a < this.armCount; a++) {
        const armAngle = (a / this.armCount) * Math.PI * 2 + this.rotation;
        const armGlow = this.ctx.createRadialGradient(
          this.centerX, this.centerY, maxRadius * 0.05,
          this.centerX + Math.cos(armAngle) * maxRadius * 0.5,
          this.centerY + Math.sin(armAngle) * maxRadius * 0.5,
          maxRadius * 0.55
        );
        const ga = this.glowIntensity * 0.06;
        armGlow.addColorStop(0, `rgba(160, 195, 245, ${ga})`);
        armGlow.addColorStop(1, 'rgba(120, 160, 220, 0)');
        this.ctx.fillStyle = armGlow;
        this.ctx.fillRect(0, 0, this.width, this.height);
      }
    }

    /* ---- 绘制所有恒星 ---- */
    for (const s of this.stars) {
      // 螺旋运动：尘埃随机漂移，臂星沿轨道
      let currentX, currentY;
      if (s.isDust) {
        // 尘埃绕中心慢慢转
        const dustAngle = s.baseAngle + this.rotation * 0.3;
        currentX = this.centerX + Math.cos(dustAngle) * s.baseRadius;
        currentY = this.centerY + Math.sin(dustAngle) * s.baseRadius;
      } else {
        const orbitAngle = s.baseAngle + this.rotation * this.starSpeed;
        currentX = this.centerX + Math.cos(orbitAngle) * s.baseRadius;
        currentY = this.centerY + Math.sin(orbitAngle) * s.baseRadius;
      }

      // 鼠标排斥
      if (this.mouseRepulsion) {
        const dx = currentX - this.mouse.x;
        const dy = currentY - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelDist = 200;

        if (dist < repelDist && dist > 0) {
          const force = Math.pow((repelDist - dist) / repelDist, 2)
            * this.repulsionStrength * 100;
          const repelAngle = Math.atan2(dy, dx);
          currentX += Math.cos(repelAngle) * force;
          currentY += Math.sin(repelAngle) * force;
        }
      }

      // 闪烁
      s.twinkle += s.twinkleSpeed;
      const twinkleVal = 1 - this.twinkleIntensity *
        (0.5 + 0.5 * Math.sin(s.twinkle));
      const opacity = Math.min(1, Math.max(0, s.opacity * twinkleVal));

      // 颜色：hueShift=140 蓝调，saturation=0 接近纯白
      // 中心微暖 → 边缘微冷
      const baseR = 215 + s.warmth * 40;
      const baseG = 215 + s.warmth * 30;
      const baseB = 220 + (1 - s.warmth) * 35;
      const r = Math.floor(baseR);
      const g = Math.floor(baseG);
      const b = Math.floor(baseB);

      // 画星点
      this.ctx.beginPath();
      this.ctx.arc(currentX, currentY, s.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      this.ctx.fill();

      // 辉光晕
      if (s.hasGlow && this.glowIntensity > 0) {
        const gSize = s.size * 3.5;
        const starGlow = this.ctx.createRadialGradient(
          currentX, currentY, 0,
          currentX, currentY, gSize
        );
        const ga = this.glowIntensity * 0.35 * opacity;
        starGlow.addColorStop(0, `rgba(170, 205, 255, ${ga})`);
        starGlow.addColorStop(1, 'rgba(170, 205, 255, 0)');
        this.ctx.beginPath();
        this.ctx.arc(currentX, currentY, gSize, 0, Math.PI * 2);
        this.ctx.fillStyle = starGlow;
        this.ctx.fill();
      }
    }

    this.animationId = requestAnimationFrame(() => this._animate());
  }

  /* ---- 销毁 ---- */

  destroy() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this._resizeHandler);
    this.canvas.removeEventListener('mousemove', this._mouseHandler);
    this.canvas.removeEventListener('mouseleave', this._leaveHandler);
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}

window.Galaxy = Galaxy;


/* ============================================
   Starfield — Footer 星尘区缓慢飘浮背景
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
