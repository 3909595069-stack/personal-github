# 个人网站 — 暗黑放映室

## 本地预览

用任意静态服务器打开：

```bash
# Python
python -m http.server 8080

# 或直接用浏览器打开
start index.html
```

## 部署

推送到 GitHub，在 Cloudflare Pages 中连接仓库：
- 构建命令：（留空）
- 输出目录：`/`
- 框架预设：None

## 修改指南

- 改颜色/字体/动画 → 编辑 `css/style.css` 的 `:root` 变量区
- 改文案/时间线/作品信息 → 编辑 `index.html` 对应区域
- 改粒子效果 → 编辑 `js/particles.js`
- 换图片 → 把截图放入 `assets/`，在 `index.html` 中替换占位区
