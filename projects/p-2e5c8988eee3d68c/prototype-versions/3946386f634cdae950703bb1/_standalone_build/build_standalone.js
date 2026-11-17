/**
 * 学科学情分析系统 · 独立分享版构建脚本
 * 将 index.html 依赖的本地资源（styles.css / app.js）与 CDN 资源
 * （Chart.js / ECharts / Font Awesome / Outfit 字体）全部内联，
 * 产出可离线双击打开的单文件 HTML。
 *
 * 用法: node build_standalone.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');          // 项目根: 学科学情/
const ASSET = __dirname;                             // 本目录: _standalone_build/
const VERSION = 'v1.1.0';
const OUT_NAME = `学科学情_独立分享版_${VERSION}.html`;

const readAsset = f => fs.readFileSync(path.join(ASSET, f), 'utf8');
const readRoot = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const b64 = f => fs.readFileSync(path.join(ASSET, f)).toString('base64');

// 源工程为 CRLF（Windows），统一正规化为 LF，便于多行锚点匹配与后续模板字符串拼接。
let html = readRoot('index.html').replace(/\r\n/g, '\n');

/* ---------- 安全校验与替换工具 ---------- */
// JS 内联前检查 </script>（避免提前闭合 script 标签）；CSS 内联前检查 </style>
function assertInlineSafe(label, code, closeTag) {
    if (code.toLowerCase().includes(closeTag)) {
        throw new Error(`${label} 中包含 "${closeTag}"，直接内联会破坏 HTML 结构`);
    }
}
// 精确锚点替换：必须恰好命中 1 处，否则构建失败（防呆）
function replaceOnce(label, from, to) {
    const count = html.split(from).length - 1;
    if (count !== 1) throw new Error(`锚点 [${label}] 匹配到 ${count} 处（期望 1 处）`);
    html = html.replace(from, () => to);
    console.log(`  [ok] ${label}`);
}

/* ---------- 1. 本地样式与脚本 ---------- */
const stylesCss = readRoot('styles.css');
const appJs = readRoot('app.js');
assertInlineSafe('styles.css', stylesCss, '</style');
assertInlineSafe('app.js', appJs, '</script');

/* ---------- 2. ECharts（chart.js 已从源工程移除） ---------- */
const echartsJs = readAsset('echarts.min.js');
assertInlineSafe('echarts.min.js', echartsJs, '</script');

/* ---------- 3. Font Awesome：woff2 字体转 base64 data URI ----------
 * all.min.css 含 10 个 @font-face（FA6 主名 3 + FA5 别名 3 + FontAwesome 旧名 3 + v4compatibility 1）。
 * 经检查 FA5/FontAwesome/v4compatibility 别名在规则部分零引用，删除其声明块，
 * 避免 solid/regular 字体 base64 重复内嵌 3 次；仅保留 FA6 的 Brands/Free400/Free900。
 * 页面无 fab 图标，Brands 的字体文件保持相对路径引用（不会被触发下载）。
 */
let faCss = readAsset('fa-all.min.css');
assertInlineSafe('fa-all.min.css', faCss, '</style');
faCss = faCss.replace(/@font-face\{[^}]*\}/g, face => {
    // 仅保留 FA6 主名声明（Free400/Free900/Brands）；FA5 别名与 FontAwesome 旧名块引用同一批文件，
    // 必须按 font-family 名称区分，不能按字体文件名区分
    if (face.includes('"Font Awesome 6 Free"') || face.includes('"Font Awesome 6 Brands"')) return face;
    return '';
});
const keptFaces = (faCss.match(/@font-face\{/g) || []).length;
if (keptFaces !== 3) throw new Error(`FA @font-face 保留数异常: ${keptFaces}（期望 3）`);
faCss = faCss.replace(/url\(\.\.\/webfonts\/(fa-solid-900|fa-regular-400)\.woff2\)/g, (m, name) => {
    console.log(`  [ok] 内嵌字体 ${name}.woff2`);
    return `url(data:font/woff2;base64,${b64(name + '.woff2')})`;
});
const faEmbedded = (faCss.match(/data:font\/woff2/g) || []).length;
if (faEmbedded !== 2) throw new Error(`Font Awesome 字体内嵌数异常: ${faEmbedded}（期望 2）`);

/* ---------- 4. Outfit 字体（可变字体，仅 2 个分片） ----------
 * outfit-woff2.css 中唯一 URL 按出现顺序为:
 *   [0] ...uktqQ4E.woff2 = latin-ext 分片（CSS 中 /* latin-ext *​/ 块在前）
 *   [1] ...tEtq.woff2    = latin 分片
 */
let outfitCss = readAsset('outfit-woff2.css');
assertInlineSafe('outfit-woff2.css', outfitCss, '</style');
const outfitUrls = [...new Set(
    [...outfitCss.matchAll(/https:\/\/fonts\.gstatic\.com\/[^\s)]+\.woff2/g)].map(m => m[0])
)];
if (outfitUrls.length !== 2) throw new Error(`Outfit 字体 URL 数异常: ${outfitUrls.length}（期望 2）`);
const outfitMap = [
    [outfitUrls[0], 'outfit-latin-ext.woff2'],
    [outfitUrls[1], 'outfit-latin.woff2'],
];
for (const [url, file] of outfitMap) {
    outfitCss = outfitCss.split(url).join(`data:font/woff2;base64,${b64(file)}`);
    console.log(`  [ok] 内嵌字体 ${file}`);
}

/* ---------- 5. 执行替换 ---------- */
console.log('开始替换外部引用:');
replaceOnce('styles.css',
    '<link rel="stylesheet" href="styles.css">',
    `<style>\n${stylesCss}\n</style>`);
replaceOnce('font-awesome',
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">',
    `<style>\n${faCss}\n</style>`);
replaceOnce('outfit-font',
    '<link rel="stylesheet" href="https://fonts.geekzu.org/css2?family=Outfit:wght@400;500;600;700;800&display=swap">',
    `<style>\n${outfitCss}\n</style>`);
// 源工程 head 内为「本地 echarts.min.js + CDN 兜底」双保险；
// 独立分享版直接内联 echarts，兜底 script 与相关注释一并移除，避免残留外链引用。
replaceOnce('echarts(local+fallback)',
    `    <!-- ECharts 5.4.2：本地优先（离线/弱网秒载，免 CDN 下载）；本地缺失时 CDN 兜底（bootcdn 主 + staticfile 备，均锁死版本）
         注：chart.js 从未被使用且 jsdelivr 同步阻塞首屏解析约 1.3s，已移除 -->
    <script src="echarts.min.js"></script>
    <script>
        if (!window.echarts) {
            var _ecBoot = document.createElement('script');
            _ecBoot.src = 'https://cdn.bootcdn.net/ajax/libs/echarts/5.4.2/echarts.min.js';
            _ecBoot.onerror = function () {
                var _ecStatic = document.createElement('script');
                _ecStatic.src = 'https://cdn.staticfile.org/echarts/5.4.2/echarts.min.js';
                document.head.appendChild(_ecStatic);
            };
            document.head.appendChild(_ecBoot);
        }
    </script>`,
    `    <!-- ECharts 5.4.2：独立分享版直接内联，无外链依赖 -->
    <script>
${echartsJs}
    </script>`);
replaceOnce('app.js',
    '<script src="app.js"></script>',
    `<script>\n${appJs}\n</script>`);

/* ---------- 6. 注入版本信息 ---------- */
const now = new Date();
const pad = n => String(n).padStart(2, '0');
const builtAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
const banner = `<!DOCTYPE html>
<!--
  学科学情分析系统 · 独立分享版
  版本: ${VERSION}
  构建时间: ${builtAt}
  说明: 单文件离线版，styles.css / app.js / ECharts 5.4.2 / Font Awesome 6.4.0 / Outfit 字体已全部内联，
        双击即可在任意现代浏览器打开，无需联网、无需部署。
  数据说明: 手动编辑等用户数据保存在浏览器 localStorage，换电脑或换浏览器不随文件携带。
  源工程: F:\\07 project\\学科学情
-->`;
if (!html.startsWith('<!DOCTYPE html>')) throw new Error('index.html 未以 <!DOCTYPE html> 开头');
html = banner + html.slice('<!DOCTYPE html>'.length);

/* ---------- 7. 产物校验与输出 ---------- */
const leftovers = html.match(/<script src=|<link rel="stylesheet" href="http/g) || [];
if (leftovers.length > 0) throw new Error(`仍残留 ${leftovers.length} 处外部引用`);

const outPath = path.join(ROOT, OUT_NAME);
fs.writeFileSync(outPath, html, 'utf8');
const sizeMB = (fs.statSync(outPath).size / 1024 / 1024).toFixed(2);
console.log(`\n构建完成: ${OUT_NAME}`);
console.log(`版本: ${VERSION} | 构建时间: ${builtAt} | 大小: ${sizeMB} MB`);
