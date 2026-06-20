/* ============================================
   galaxy.js — ReactBits Galaxy 背景（纯 JS 移植）
   基于 DavidHDev/react-bits Galaxy.tsx
   使用 OGL v1.0.11 + 原始 GLSL 着色器
   通过 ES module import 加载 OGL
   ============================================ */

import {
  Renderer,
  Program,
  Mesh,
  Color,
  Geometry,
} from 'https://cdn.jsdelivr.net/npm/ogl@1.0.11/src/index.mjs';

// 全屏三角形 — OGL v1.0.11 extras/Triangle.js 的等价实现
// Triangle 类本质就是一个覆盖全屏的 Geometry
const triangleGeometry = new Geometry(null, {
  position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
  uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
});

export default class Galaxy {
  constructor(container, options = {}) {
    this.container = container;

    // 参数（对齐 ReactBits GalaxyProps 默认值）
    this.focal = options.focal || [0.5, 0.5];
    this.rotation = options.rotation || [1.0, 0.0];
    this.starSpeed = options.starSpeed ?? 0.5;
    this.density = options.density ?? 1.4;
    this.hueShift = options.hueShift ?? 140;
    this.disableAnimation = options.disableAnimation || false;
    this.speed = options.speed ?? 1;
    this.mouseInteraction = options.mouseInteraction !== false;
    this.glowIntensity = options.glowIntensity ?? 0.65;
    this.saturation = options.saturation ?? 0;
    this.mouseRepulsion = options.mouseRepulsion !== false;
    this.twinkleIntensity = options.twinkleIntensity ?? 0.3;
    this.rotationSpeed = options.rotationSpeed ?? 0.1;
    this.repulsionStrength = options.repulsionStrength ?? 2;
    this.autoCenterRepulsion = options.autoCenterRepulsion ?? 0;
    this.transparent = options.transparent !== false;

    // 鼠标平滑
    this.targetMousePos = { x: 0.5, y: 0.5 };
    this.smoothMousePos = { x: 0.5, y: 0.5 };
    this.targetMouseActive = 0.0;
    this.smoothMouseActive = 0.0;

    this.animateId = null;
    this.program = null;
    this.mesh = null;
    this.renderer = null;
    this.gl = null;

    // 着色器 — 与 ReactBits Galaxy.tsx 完全一致
    this.vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}`;

    this.fragmentShader = `
precision highp float;
uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;
varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + offset;
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;
      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));
      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;
      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;
      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;
      col += star * size * color;
    }
  }
  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;
  vec2 mouseNorm = uMouse - vec2(0.5);
  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }
  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;
  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;
  vec3 col = vec3(0.0);
  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }
  if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}`;

    this._init();
  }

  _init() {
    const ctn = this.container;
    if (!ctn) return;

    // 创建 OGL Renderer
    const renderer = new Renderer({
      alpha: this.transparent,
      premultipliedAlpha: false,
    });
    this.renderer = renderer;
    const gl = renderer.gl;
    this.gl = gl;

    if (this.transparent) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
    } else {
      gl.clearColor(0, 0, 0, 1);
    }

    // 全屏三角形几何体（GL上下文绑定后创建）
    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
      uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
    });

    // 着色器程序
    const program = new Program(gl, {
      vertex: this.vertexShader,
      fragment: this.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new Color(
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height,
          ),
        },
        uFocal: { value: new Float32Array(this.focal) },
        uRotation: { value: new Float32Array(this.rotation) },
        uStarSpeed: { value: this.starSpeed },
        uDensity: { value: this.density },
        uHueShift: { value: this.hueShift },
        uSpeed: { value: this.speed },
        uMouse: {
          value: new Float32Array([this.smoothMousePos.x, this.smoothMousePos.y]),
        },
        uGlowIntensity: { value: this.glowIntensity },
        uSaturation: { value: this.saturation },
        uMouseRepulsion: { value: this.mouseRepulsion },
        uTwinkleIntensity: { value: this.twinkleIntensity },
        uRotationSpeed: { value: this.rotationSpeed },
        uRepulsionStrength: { value: this.repulsionStrength },
        uMouseActiveFactor: { value: 0.0 },
        uAutoCenterRepulsion: { value: this.autoCenterRepulsion },
        uTransparent: { value: this.transparent },
      },
    });
    this.program = program;

    const mesh = new Mesh(gl, { geometry, program });
    this.mesh = mesh;

    // 鼠标事件
    if (this.mouseInteraction) {
      this._mouseMoveHandler = (e) => {
        const rect = ctn.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = 1.0 - (e.clientY - rect.top) / rect.height;
        this.targetMousePos = { x, y };
        this.targetMouseActive = 1.0;
      };
      this._mouseLeaveHandler = () => {
        this.targetMouseActive = 0.0;
      };
      ctn.addEventListener('mousemove', this._mouseMoveHandler);
      ctn.addEventListener('mouseleave', this._mouseLeaveHandler);
    }

    // 大小调整
    this._resizeHandler = () => this._resize();
    window.addEventListener('resize', this._resizeHandler, false);
    this._resize();

    // 把 WebGL canvas 插入 DOM
    const glCanvas = gl.canvas;
    glCanvas.style.position = 'absolute';
    glCanvas.style.inset = '0';
    glCanvas.style.width = '100%';
    glCanvas.style.height = '100%';
    glCanvas.style.zIndex = '0';
    ctn.insertBefore(glCanvas, ctn.firstChild);

    // 启动动画
    this._animate();
  }

  _resize() {
    const ctn = this.container;
    if (!ctn || !this.renderer) return;
    const scale = 1;
    this.renderer.setSize(ctn.offsetWidth * scale, ctn.offsetHeight * scale);
    if (this.program) {
      const gl = this.renderer.gl;
      this.program.uniforms.uResolution.value = new Color(
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height,
      );
    }
  }

  _animate() {
    const self = this;

    function update(t) {
      self.animateId = requestAnimationFrame(update);

      if (!self.disableAnimation) {
        self.program.uniforms.uTime.value = t * 0.001;
        self.program.uniforms.uStarSpeed.value = (t * 0.001 * self.starSpeed) / 10.0;
      }

      // 鼠标平滑插值
      const lerp = 0.05;
      self.smoothMousePos.x += (self.targetMousePos.x - self.smoothMousePos.x) * lerp;
      self.smoothMousePos.y += (self.targetMousePos.y - self.smoothMousePos.y) * lerp;
      self.smoothMouseActive += (self.targetMouseActive - self.smoothMouseActive) * lerp;

      self.program.uniforms.uMouse.value[0] = self.smoothMousePos.x;
      self.program.uniforms.uMouse.value[1] = self.smoothMousePos.y;
      self.program.uniforms.uMouseActiveFactor.value = self.smoothMouseActive;

      self.renderer.render({ scene: self.mesh });
    }

    this.animateId = requestAnimationFrame(update);
  }

  destroy() {
    cancelAnimationFrame(this.animateId);
    window.removeEventListener('resize', this._resizeHandler);

    if (this.container) {
      if (this._mouseMoveHandler) {
        this.container.removeEventListener('mousemove', this._mouseMoveHandler);
      }
      if (this._mouseLeaveHandler) {
        this.container.removeEventListener('mouseleave', this._mouseLeaveHandler);
      }
      if (this.gl && this.gl.canvas && this.gl.canvas.parentNode === this.container) {
        this.container.removeChild(this.gl.canvas);
      }
    }

    if (this.gl) {
      const ext = this.gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    }

    this.program = null;
    this.mesh = null;
    this.renderer = null;
    this.gl = null;
  }
}
