const fs = require('fs');
const dir = 'F:/07 project/智批报告Word导出/';
const read = f => fs.readFileSync(dir + f, 'utf8');

const html = read('index.html');
const js = read('app.js');
const md = read('PRD.md');

const uniq = a => Array.from(new Set(a)).sort();
const diff = (a, b) => a.filter(x => !b.includes(x)).concat(b.filter(x => !a.includes(x)));

// 1) 徽章：data-prd
const badgesAll = [...html.matchAll(/data-prd="([A-Z]{2}-\d{2})"/g)].map(m => m[1]);
const badges = uniq(badgesAll);
const badgeDup = badgesAll.filter((v, i) => badgesAll.indexOf(v) !== i);

// 2) PRD_SECTIONS：仅取数据块范围内的 id
const s0 = js.indexOf('var PRD_SECTIONS = [');
const s1 = js.indexOf('/* ---------- 以下为通用逻辑', s0);
const secBlock = js.slice(s0, s1);
const secIdsAll = [...secBlock.matchAll(/id:\s*'([A-Z]{2}-\d{2})'/g)].map(m => m[1]);
const secIds = uniq(secIdsAll);
const secDup = secIdsAll.filter((v, i) => secIdsAll.indexOf(v) !== i);
const groups = [...js.slice(js.indexOf('var PRD_GROUPS'), s0).matchAll(/key:\s*'([A-Z]{2})',\s*name:\s*'([^']*)'/g)].map(m => m[1]);

// 3) PRD.md 章节
const mdIdsAll = [...md.matchAll(/^## ([A-Z]{2}-\d{2})\s/gm)].map(m => m[1]);
const mdIds = uniq(mdIdsAll);
const mdDup = mdIdsAll.filter((v, i) => mdIdsAll.indexOf(v) !== i);

const errors = [];
const warns = [];

if (badgeDup.length) errors.push('index.html 徽章重复：' + uniq(badgeDup).join(', '));
if (secDup.length) errors.push('app.js 章节重复：' + uniq(secDup).join(', '));
if (mdDup.length) errors.push('PRD.md 章节重复：' + uniq(mdDup).join(', '));

const d1 = diff(badges, secIds);
if (d1.length) errors.push('徽章 ↔ PRD_SECTIONS 不一致：' + d1.join(', '));
const d2 = diff(secIds, mdIds);
if (d2.length) errors.push('PRD_SECTIONS ↔ PRD.md 不一致：' + d2.join(', '));

// 组归属：每个 id 前缀须在 PRD_GROUPS；章节 group 字段须与 id 前缀一致
const groupIds = secIds.map(id => id.slice(0, 2));
uniq(groupIds).forEach(g => { if (!groups.includes(g)) errors.push('PRD_GROUPS 缺少组：' + g); });
[...secBlock.matchAll(/id:\s*'([A-Z]{2})-(\d{2})',\s*group:\s*'([A-Z]{2})'/g)].forEach(m => {
    if (m[1] !== m[3]) errors.push('章节 group 与 id 前缀不一致：' + m[1] + '-' + m[2] + ' group=' + m[3]);
});
groups.forEach(g => { if (!groupIds.includes(g)) warns.push('组 ' + g + ' 下无章节'); });

// 断号：本轮按需求只保留部分章节，缺号属预期，仅作提示
const gaps = [];
groups.forEach(g => {
    const nums = secIds.filter(id => id.startsWith(g + '-')).map(id => parseInt(id.slice(3), 10)).sort((a, b) => a - b);
    if (!nums.length) return;
    for (let n = nums[0]; n <= nums[nums.length - 1]; n++) {
        if (!nums.includes(n)) gaps.push(g + '-' + String(n).padStart(2, '0'));
    }
});
if (gaps.length) warns.push('保留章节不连续（缺号）：' + gaps.join(', '));

// body 非空 & 非 HTML 直出、AC 编号连续性
const bodies = [...secBlock.matchAll(/body:\s*\[([\s\S]*?)\]\.join\('\\n'\)/g)].map(m => m[1]);
if (bodies.length !== secIds.length) warns.push('body 数（' + bodies.length + '）与章节数（' + secIds.length + '）不等');
bodies.forEach((b, i) => {
    if (!b.trim()) errors.push('空 body：第 ' + (i + 1) + ' 章');
    if (/^\s*'(p|ul|ol|table|div|h[1-6]|blockquote)\b/i.test(b.trim().replace(/^'/, ''))) errors.push('body 以 HTML 标签开头（应改 Markdown）：第 ' + (i + 1) + ' 章');
});

const acAll = [...md.matchAll(/^\|\s*(AC-\d{2})\s*\|/gm)].map(m => m[1]);
const acNums = acAll.map(a => parseInt(a.slice(3), 10));
acNums.forEach((n, i) => { if (n !== i + 1) errors.push('AC 编号不连续：第 ' + (i + 1) + ' 行是 AC-' + String(n).padStart(2, '0')); });

// 章节标题三方一致（去掉 id 前缀后比较）
const mdTitles = {};
[...md.matchAll(/^## ([A-Z]{2}-\d{2}) (.+)$/gm)].forEach(m => { mdTitles[m[1]] = m[2].trim(); });
const jsTitles = {};
[...secBlock.matchAll(/id:\s*'([A-Z]{2}-\d{2})',\s*group:\s*'[A-Z]{2}',\s*title:\s*'([^']*)'/g)].forEach(m => { jsTitles[m[1]] = m[2].trim(); });
Object.keys(mdTitles).forEach(id => {
    if (jsTitles[id] && jsTitles[id] !== mdTitles[id]) warns.push('标题不一致 ' + id + '：\n  PRD.md = ' + mdTitles[id] + '\n  app.js = ' + jsTitles[id]);
});

// app.js 语法检查（vm.Script 只编译不执行）
const vm = require('vm');
try { new vm.Script(js, { filename: 'app.js' }); console.log('app.js 语法检查：通过'); }
catch (e) { errors.push('app.js 语法错误：' + e.message); }

// PRD.md 章节正文 ↔ PRD_SECTIONS body 同源比对（去空白后逐字比对）
const mdLines = md.split(/\r?\n/);
const mdBodies = {};
let curId = null;
let buf = [];
function flushMd() { if (curId) mdBodies[curId] = buf.join('\n'); curId = null; buf = []; }
mdLines.forEach(line => {
    const mh = line.match(/^## ([A-Z]{2}-\d{2})\s/);
    if (mh) { flushMd(); curId = mh[1]; return; }
    if (/^#\s/.test(line) || /^---\s*$/.test(line)) { flushMd(); return; }
    if (curId) buf.push(line);
});
flushMd();

const vm2 = require('vm');
const bodyRe = /id:\s*'([A-Z]{2}-\d{2})',\s*group:\s*'[A-Z]{2}',\s*title:\s*'[^']*',\s*body:\s*\[([\s\S]*?)\]\.join\('\\n'\)/g;
let bm;
const norm = s => s.replace(/\s+/g, '');
while ((bm = bodyRe.exec(secBlock)) !== null) {
    const id = bm[1];
    let arr;
    try {
        arr = new vm2.Script('[' + bm[2] + ']', { filename: id }).runInNewContext({});
    } catch (e) {
        errors.push('body 数组无法解析：' + id + '（' + e.message + '）');
        continue;
    }
    const a = norm(arr.join('\n'));
    const b = norm(mdBodies[id] || '');
    if (a !== b) {
        let k = 0;
        while (k < a.length && k < b.length && a[k] === b[k]) k++;
        warns.push('正文与 PRD.md 不一致 ' + id + '：首个差异在第 ' + k + ' 字符附近\n  app.js = ' + a.slice(k, k + 40) + '\n  PRD.md = ' + b.slice(k, k + 40));
    }
}

console.log('组：', groups.join(', '));
console.log('徽章 ' + badges.length + ' / PRD_SECTIONS ' + secIds.length + ' / PRD.md ' + mdIds.length);
console.log('章节：', secIds.join(' '));
console.log('AC 共 ' + acAll.length + ' 条');
if (warns.length) { console.log('\n警告：'); warns.forEach(w => console.log('  - ' + w)); }
if (errors.length) { console.log('\n错误：'); errors.forEach(e => console.log('  - ' + e)); process.exit(1); }
console.log('\n三方一致性校验：全部通过');
