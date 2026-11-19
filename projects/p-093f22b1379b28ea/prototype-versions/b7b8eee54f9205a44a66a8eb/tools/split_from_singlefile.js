/* ============================================================
   学科学情 · 一期独立分享版 → 多文件工程 拆分脚本
   来源：《学科学情_一期独立分享版.html》（全内联单文件）
   产物：index.html + styles/*.css + js/app.js + vendor/echarts.min.js
   原则：只做「内联块搬移」，标签内文本逐字节原样落盘，不改任何业务逻辑。
   用法：node tools/split_from_singlefile.js [源文件路径]
   ============================================================ */

const fs = require('fs');
const path = require('path');

const SRC = process.argv[2] || 'F:\\07 project\\学科学情\\学科学情_一期独立分享版.html';
const OUT = path.resolve(__dirname, '..');

// 内联块 → 目标文件，顺序必须与源文件出现顺序一致
const STYLE_TARGETS = [
  { file: 'styles/app.css', note: '主样式：设计令牌、布局、组件、PRD 抽屉' },
  { file: 'styles/fontawesome.css', note: 'Font Awesome Free 6.4.0（solid/regular 字体已内联 base64）' },
  { file: 'styles/fonts.css', note: 'Outfit 字体 @font-face（woff2 base64 内联）' },
];
const SCRIPT_TARGETS = [
  { file: 'vendor/echarts.min.js', head: true, note: 'ECharts 5.4.2' },
  { file: 'js/app.js', head: false, note: '一期业务逻辑层' },
];

function fail(msg) {
  console.error('BUILD FAILED: ' + msg);
  process.exit(1);
}

function collect(text, tag) {
  const re = new RegExp('<' + tag + '\\b([^>]*)>([\\s\\S]*?)<\\/' + tag + '>', 'gi');
  const blocks = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    blocks.push({
      start: m.index,
      end: re.lastIndex,
      openTag: m[0].slice(0, m[0].indexOf('>') + 1),
      attrs: m[1].trim(),
      body: m[2],
    });
  }
  return blocks;
}

const raw = fs.readFileSync(SRC, 'utf8');

// ---------- 1. 结构校验 ----------
const styleBlocks = collect(raw, 'style');
const scriptBlocks = collect(raw, 'script');

if (styleBlocks.length !== STYLE_TARGETS.length) {
  fail(`<style> 块数量 ${styleBlocks.length} 与预期 ${STYLE_TARGETS.length} 不一致`);
}
if (scriptBlocks.length !== SCRIPT_TARGETS.length) {
  fail(`<script> 块数量 ${scriptBlocks.length} 与预期 ${SCRIPT_TARGETS.length} 不一致`);
}
scriptBlocks.forEach((b, i) => {
  if (/\bsrc\s*=/.test(b.attrs)) fail(`第 ${i + 1} 个 <script> 已带 src 属性，源文件不是纯内联`);
  if (!b.body.trim()) fail(`第 ${i + 1} 个 <script> 内容为空`);
});
styleBlocks.forEach((b, i) => {
  if (/\bsrc\s*=/.test(b.attrs)) fail(`第 ${i + 1} 个 <style> 带非法属性`);
  if (!b.body.trim()) fail(`第 ${i + 1} 个 <style> 内容为空`);
});

// ---------- 2. 落盘外部文件 ----------
const written = [];
function emit(relPath, content, label) {
  const abs = path.join(OUT, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
  written.push({ relPath, bytes: Buffer.byteLength(content, 'utf8'), label });
}

styleBlocks.forEach((b, i) => emit(STYLE_TARGETS[i].file, b.body, STYLE_TARGETS[i].note));
scriptBlocks.forEach((b, i) => emit(SCRIPT_TARGETS[i].file, b.body, SCRIPT_TARGETS[i].note));

// ---------- 3. 生成 index.html（按原位置替换为外链） ----------
const replacements = [];
// 只替换标签本身，标签前的原始缩进自动保留
styleBlocks.forEach((b, i) => {
  replacements.push({
    start: b.start,
    end: b.end,
    text: `<link rel="stylesheet" href="${STYLE_TARGETS[i].file}">`,
  });
});
scriptBlocks.forEach((b, i) => {
  // head 内保持阻塞式加载，顺序与内联时完全一致
  replacements.push({
    start: b.start,
    end: b.end,
    text: `<script src="${SCRIPT_TARGETS[i].file}"></script>`,
  });
});
replacements.sort((a, b) => b.start - a.start);

let html = raw;
for (const r of replacements) {
  html = html.slice(0, r.start) + r.text + html.slice(r.end);
}

// 头部说明同步为多文件口径（仅注释，不影响运行）
html = html.replace(
  '  离线: 样式、脚本、ECharts、Font Awesome 与 Outfit 字体全部内联，双击即可打开。',
  [
    '  形态: 多文件工程版（index.html + styles/*.css + js/app.js + vendor/echarts.min.js）。',
    '        shared 单文件分享版仍见《学科学情\\学科学情_一期独立分享版.html》，双击即开。',
    '  离线: 样式、脚本、ECharts、Font Awesome 与 Outfit 字体全部本地，无外部网络请求。',
  ].join('\n')
);
html = html.replace(
  '<!-- ECharts 5.4.2：一期独立分享版直接内联，无外链依赖 -->',
  '<!-- ECharts 5.4.2：本地 vendor 副本，无外部网络请求 -->'
);
html = html.replace(
  '  构建时间: 2026-11-02 15:48',
  '  构建时间: 2026-11-02 15:48（多文件工程版：2026-11-03 反向拆分）'
);

fs.writeFileSync(path.join(OUT, 'index.html'), html, 'utf8');

// ---------- 4. 校验 ----------
const problems = [];

const outHtml = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
if (/<style\b/i.test(outHtml)) problems.push('index.html 仍残留 <style> 内联块');
if (/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/i.test(outHtml)) problems.push('index.html 仍残留内联脚本');

// 每个外部文件内容必须与源内联块逐字节一致
styleBlocks.forEach((b, i) => {
  const back = fs.readFileSync(path.join(OUT, STYLE_TARGETS[i].file), 'utf8');
  if (back !== b.body) problems.push(`${STYLE_TARGETS[i].file} 内容与源 <style> 块不一致`);
});
scriptBlocks.forEach((b, i) => {
  const back = fs.readFileSync(path.join(OUT, SCRIPT_TARGETS[i].file), 'utf8');
  if (back !== b.body) problems.push(`${SCRIPT_TARGETS[i].file} 内容与源 <script> 块不一致`);
});

// 所有引用必须能在磁盘找到
const refRe = /(?:href|src)="((?!https?:|data:|#)[^"]+)"/g;
let rm;
while ((rm = refRe.exec(outHtml)) !== null) {
  const target = path.join(OUT, rm[1]);
  if (!fs.existsSync(target)) problems.push(`index.html 引用的文件不存在：${rm[1]}`);
}

// 缩进不得重复（link/script 前只保留源标签原有缩进）
if (/^ {5,}<(?:link|script)/m.test(outHtml)) problems.push('index.html 存在异常缩进的外链标签');

// 引用顺序必须与源顺序一致
const order = [...outHtml.matchAll(/(?:href|src)="((?!https?:|data:|#)[^"]+)"/g)].map((m) => m[1]);
const expectOrder = [...STYLE_TARGETS.map((t) => t.file), ...SCRIPT_TARGETS.map((t) => t.file)];
if (order.join('|') !== expectOrder.join('|')) {
  problems.push(`资源引用顺序异常：${order.join(' > ')}`);
}

// 语法自检
for (const t of SCRIPT_TARGETS) {
  const code = fs.readFileSync(path.join(OUT, t.file), 'utf8');
  try {
    new (require('vm').Script)(code, { filename: t.file });
  } catch (e) {
    problems.push(`${t.file} 语法错误：${e.message}`);
  }
}

const cssTotal = STYLE_TARGETS.reduce((s, t) => s + fs.statSync(path.join(OUT, t.file)).size, 0);
const jsTotal = SCRIPT_TARGETS.reduce((s, t) => s + fs.statSync(path.join(OUT, t.file)).size, 0);
if (/url\((?!\s*['"]?data:)/.test(STYLE_TARGETS.map((t) => fs.readFileSync(path.join(OUT, t.file), 'utf8')).join('\n'))) {
  console.log('  [warn] 样式内仍存在非 data: 的 url() 引用（源文件原有的 ../webfonts 死链回退，浏览器不会实际发起请求）');
}

if (problems.length) {
  console.error('BUILD FAILED:');
  problems.forEach((p) => console.error('  - ' + p));
  process.exit(1);
}

console.log('OK 拆分完成：' + OUT);
written.forEach((w) => console.log(`  ${w.relPath.padEnd(24)} ${(w.bytes / 1024).toFixed(1).padStart(9)} KB   ${w.label}`));
console.log(`  index.html               ${(Buffer.byteLength(outHtml, 'utf8') / 1024).toFixed(1).padStart(9)} KB`);
console.log(`  合计 CSS ${(cssTotal / 1024).toFixed(1)} KB / JS ${(jsTotal / 1024).toFixed(1)} KB / 源文件 ${(Buffer.byteLength(raw, 'utf8') / 1024).toFixed(1)} KB`);
