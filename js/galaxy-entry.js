/* ============================================
   galaxy-entry.js — ES Module 入口
   导入 Galaxy 类，挂载到 window 并触发 galaxy-ready 事件
   ============================================ */

import Galaxy from './galaxy.js';

window.Galaxy = Galaxy;
console.log('Galaxy class loaded:', typeof Galaxy);

// 触发自定义事件，main.js 监听此事件后初始化
window.dispatchEvent(new CustomEvent('galaxy-ready'));
