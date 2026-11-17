/* ============================================================
 * PRD 查看器逻辑（自包含 IIFE，无外部依赖，不污染全局）
 * 接入步骤：
 *   1. 页面已包含 viewer-dom.html 的 DOM 与 viewer.css 的样式
 *   2. 修改下方「配置区」「数据区」
 *   3. 多文件原型：本文件内容追加到主 JS 末尾
 *      单文件原型：放入 </body> 前的 <script> 块内
 * 内容格式：PRD 章节 body 一律为 Markdown（由项目作者在 PRD_SECTIONS 中
 * 维护，或用户经页内编辑器写入 localStorage），由内置 prdMd() 渲染为受控
 * HTML；文本先转义再解析，Markdown 中的 < > & 不会生成标签，故不构成注入面。
 * 导入/导出：头部 ⬇⬆ 收发的是一份 Markdown 文档（与 PRD.md 同构），不用 JSON；
 * 导出为覆盖层合并后的快照，导入按「## 编号 标题」只取章节正文。
 * 搜索：抽屉顶部 #prdSearch 检索章节标题与当前生效正文（含本地修改），结果浮层
 * 点击定位、正文与标题命中高亮（只包文本节点、不改 innerHTML），Esc 先收浮层再清空。
 * 兼容：整段以块级 HTML 标签开头的 body 按旧版 HTML 直出（仅用于升级前的历史数据）。
 * ============================================================ */
(function () {
    'use strict';

    /* 嵌入宿主页视图（?embed=1 或 srcdoc 注入 window.__RPQ）：编号徽章与抽屉仍在本视图内可用，
       但悬浮入口 #prdFab 由宿主页统一提供——不隐藏会与宿主入口叠成多个「PRD」按钮 */

    /* ---------- 配置区（讲评试卷 4.0） ---------- */
    var PRD_STORAGE_KEY = 'jj40PrdOverrides_v1';   // localStorage key：带项目标识 + 版本后缀，避免跨项目串数据
    var PRD_APP_NAME = '讲评试卷 4.0';             // 项目名：写入导出 Markdown 的文档标题「项目名 产品需求文档（PRD）」
    var PRD_HOME_SECTION = 'LP-01';                // 首次打开默认定位的章节 id
    var PRD_EXPORT_NAME = '讲评试卷4.0-原型PRD';    // 导出文件名前缀
    var PRD_DRAWER_MIN_W = 420;                    // 抽屉拖动最小宽度 px
    var PRD_DRAWER_MAX_W = 1200;                   // 抽屉拖动最大宽度 px（同时受 CSS max-width: 94vw 限制）
    var PRD_DRAWER_WIDTH_KEY = 'jj40PrdWidth_v1';  // 抽屉宽度本地记忆 key：带项目标识 + 版本后缀，避免跨项目串数据
    var PRD_FAB_POS_KEY = 'jj40PrdFabPos_v1';      // 悬浮按钮位置记忆 key：带项目标识 + 版本后缀，避免跨项目串数据
    // 有其他浮层打开时 Esc 让行；按原型实际浮层选择器补充
    function prdAnyOverlayOpen() {
        return !!document.querySelector('.modal-overlay.show, .modal-overlay.active, .modal.show, .modal.active, .drawer.open:not(#prdDrawer), .more-menu.open, .user-menu.open, .unsub-tip.show');
    }

    /* ---------- 数据区：由 prd-sections.js 统一定义（window.PRD_GROUPS / window.PRD_SECTIONS） ---------- */
    var PRD_GROUPS = window.PRD_GROUPS || [];
    var PRD_SECTIONS = window.PRD_SECTIONS || [];
    if (!PRD_SECTIONS.length) {
        if (window.console) console.warn('[PRD] 未找到 window.PRD_SECTIONS，请确认 prd-sections.js 已在本文件之前加载');
        return;
    }

    /* ---------- 以下为通用逻辑，无需修改 ---------- */

    /* ---------- Markdown 渲染：极简子集（无依赖，先转义后解析，不执行 HTML） ----------
       支持：# ~ ### 标题（→ h4）、#### 及以上（→ h5）、段落、- / * / + 与 1. 列表
       （行首每多缩进 2 空格即下一层）、GFM 表格与 :--: 对齐、> 提示块（→ .prd-note）、
       --- 分隔线、``` 代码块；行内 **粗体** `code` ~~删除~~ 【隐藏】【演示】。
       不支持：斜体、图片、链接、内联 HTML（文本一律转义后输出）。 */
    var PRD_HTML_HEAD = /^\s*<(p|ul|ol|table|div|section|blockquote|h[1-6])\b/i;

    function prdEsc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // 行内语法：先把 `code` 抽出占位，其余文本已转义，替换只生成白名单标签
    function prdInline(s) {
        var codes = [];
        var out = prdEsc(s)
            .replace(/`([^`]+)`/g, function (m, c) {
                codes.push(c);
                return '\u0000' + (codes.length - 1) + '\u0000';
            })
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/~~([^~]+)~~/g, '<del>$1</del>')
            .replace(/【隐藏】/g, '<span class="prd-hidden-tag">隐藏</span>')
            .replace(/【演示】/g, '<span class="prd-demo-tag">演示</span>');
        return out.replace(/\u0000(\d+)\u0000/g, function (m, i) {
            return '<code>' + codes[+i] + '</code>';
        });
    }

    function prdMdSplitRow(line) {
        var s = String(line).trim();
        if (s.charAt(0) === '|') s = s.slice(1);
        if (s.charAt(s.length - 1) === '|') s = s.slice(0, -1);
        return s.split('|').map(function (c) { return c.trim(); });
    }

    function prdMdIsTableSep(line) {
        if (String(line).indexOf('|') < 0) return false;
        var cells = prdMdSplitRow(line);
        for (var i = 0; i < cells.length; i++) {
            if (!/^:?-+:?$/.test(cells[i])) return false;
        }
        return cells.length > 0;
    }

    // 段落合并的终止条件：遇到任一新的块级起始行
    function prdMdIsBlockStart(lines, i) {
        var t = String(lines[i]).trim();
        if (!t) return true;
        if (/^#{1,6}\s/.test(t)) return true;
        if (t.charAt(0) === '>') return true;
        if (/^(-{3,}|\*{3,})$/.test(t)) return true;
        if (t.indexOf('```') === 0) return true;
        if (/^([-*+]|\d+\.)\s+/.test(t)) return true;
        if (t.indexOf('|') > -1 && i + 1 < lines.length && prdMdIsTableSep(lines[i + 1])) return true;
        return false;
    }

    // 列表递归：按缩进量切层，返回 { html, next }
    function prdMdList(items, pos, indent) {
        var tag = items[pos].ordered ? 'ol' : 'ul';
        var out = '<' + tag + '>';
        var i = pos;
        while (i < items.length && items[i].indent >= indent) {
            var it = items[i];
            if (it.indent > indent) { // 首项缩进突增：作为同级子表输出
                var sub0 = prdMdList(items, i, it.indent);
                out += sub0.html;
                i = sub0.next;
                continue;
            }
            i++;
            var inner = '';
            if (i < items.length && items[i].indent > indent) {
                var sub = prdMdList(items, i, items[i].indent);
                inner = sub.html;
                i = sub.next;
            }
            out += '<li>' + prdInline(it.text) + inner + '</li>';
        }
        return { html: out + '</' + tag + '>', next: i };
    }

    function prdMd(src) {
        var text = String(src == null ? '' : src).replace(/\r\n?/g, '\n').trim();
        if (!text) return '';
        if (PRD_HTML_HEAD.test(text)) return text; // 兼容旧版 HTML body 直出

        var lines = text.split('\n');
        var out = [];
        var i = 0;
        while (i < lines.length) {
            var line = lines[i];
            var t = line.trim();
            if (!t) { i++; continue; }

            // ``` 代码块
            if (t.indexOf('```') === 0) {
                var buf = [];
                i++;
                while (i < lines.length && lines[i].trim().indexOf('```') !== 0) {
                    buf.push(lines[i]);
                    i++;
                }
                i++; // 跳过结束围栏
                out.push('<pre class="prd-code"><code>' + prdEsc(buf.join('\n')) + '</code></pre>');
                continue;
            }

            // --- 分隔线
            if (/^(-{3,}|\*{3,})$/.test(t)) { out.push('<hr>'); i++; continue; }

            // # 标题
            var hm = /^(#{1,6})\s+(.*)$/.exec(t);
            if (hm) {
                var lv = hm[1].length <= 3 ? '4' : '5';
                out.push('<h' + lv + '>' + prdInline(hm[2]) + '</h' + lv + '>');
                i++;
                continue;
            }

            // > 提示块（连续行合并为一段）
            if (t.charAt(0) === '>') {
                var qs = [];
                while (i < lines.length && lines[i].trim().charAt(0) === '>') {
                    qs.push(lines[i].trim().replace(/^>\s?/, ''));
                    i++;
                }
                out.push('<div class="prd-note">' + prdInline(qs.join(' ')) + '</div>');
                continue;
            }

            // GFM 表格：含 | 且下一行为分隔行
            if (t.indexOf('|') > -1 && i + 1 < lines.length && prdMdIsTableSep(lines[i + 1])) {
                var head = prdMdSplitRow(t);
                var aligns = prdMdSplitRow(lines[i + 1]).map(function (c) {
                    if (/^:.+:$/.test(c)) return 'center';
                    if (/^:/.test(c)) return 'left';
                    if (/:$/.test(c)) return 'right';
                    return '';
                });
                i += 2;
                var rows = [];
                while (i < lines.length && lines[i].trim() && lines[i].indexOf('|') > -1) {
                    rows.push(prdMdSplitRow(lines[i]));
                    i++;
                }
                var th = '<tr>' + head.map(function (c, k) {
                    return '<th' + (aligns[k] ? ' style="text-align:' + aligns[k] + '"' : '') + '>'
                        + prdInline(c) + '</th>';
                }).join('') + '</tr>';
                var tb = rows.map(function (r) {
                    var cells = [];
                    for (var k = 0; k < head.length; k++) {
                        cells.push('<td' + (aligns[k] ? ' style="text-align:' + aligns[k] + '"' : '') + '>'
                            + prdInline(r[k] || '') + '</td>');
                    }
                    return '<tr>' + cells.join('') + '</tr>';
                }).join('');
                out.push('<table><thead>' + th + '</thead><tbody>' + tb + '</tbody></table>');
                continue;
            }

            // - / 1. 列表（连续列表行整体收集后递归建层）
            if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
                var items = [];
                while (i < lines.length) {
                    var lm = /^(\s*)([-*+]|\d+\.)\s+(.*)$/.exec(lines[i]);
                    if (!lm) break;
                    items.push({
                        indent: lm[1].replace(/\t/g, '    ').length,
                        ordered: /\d+\./.test(lm[2]),
                        text: lm[3]
                    });
                    i++;
                }
                if (items.length) {
                    out.push(prdMdList(items, 0, items[0].indent).html);
                    continue;
                }
            }

            // 普通段落：连续非块起始行以空格合并
            var para = [t];
            i++;
            while (i < lines.length && !prdMdIsBlockStart(lines, i)) {
                para.push(lines[i].trim());
                i++;
            }
            out.push('<p>' + prdInline(para.join(' ')) + '</p>');
        }
        return out.join('\n');
    }

    var prdFab = document.getElementById('prdFab');
    var prdDrawer = document.getElementById('prdDrawer');
    var prdCloseBtn = document.getElementById('prdClose');
    var prdToc = document.getElementById('prdToc');
    var prdContent = document.getElementById('prdContent');
    if (!prdFab || !prdDrawer || !prdToc || !prdContent) return;

    /* 嵌入模式：悬浮入口由宿主提供，本视图隐藏；徽章点击仍打开本视图内抽屉 */
    var prdEmbedded = (function () {
        try {
            var q = new URLSearchParams((typeof window.__RPQ === 'string' && window.__RPQ) ? window.__RPQ : location.search);
            return q.get('embed') === '1';
        } catch (err) { return false; }
    })();
    if (prdEmbedded) prdFab.style.display = 'none';

    /* ---------- 抽屉宽度拖动调节（左缘手柄：范围钳制 + 本地记忆） ---------- */
    var prdResizeHandle = document.getElementById('prdResize');
    var prdDrag = null;

    function prdClampWidth(w) {
        var vw = window.innerWidth;
        var max = Math.min(PRD_DRAWER_MAX_W, vw * 0.94); // 与 CSS max-width: 94vw 保持一致
        var min = Math.min(PRD_DRAWER_MIN_W, max);
        return Math.min(max, Math.max(min, w));
    }

    function prdApplyWidth(w) {
        prdDrawer.style.width = prdClampWidth(w) + 'px';
    }

    // 恢复上次拖动记忆的宽度；读取失败时保持 CSS 默认
    (function prdInitWidth() {
        try {
            var saved = parseFloat(localStorage.getItem(PRD_DRAWER_WIDTH_KEY));
            if (isFinite(saved)) prdApplyWidth(saved);
        } catch (err) { /* 读取失败静默 */ }
    })();

    function prdEndDrag() {
        if (!prdDrag) return;
        prdDrag = null;
        document.body.classList.remove('prd-resizing');
        var w = prdDrawer.style.width;
        if (w) {
            try { localStorage.setItem(PRD_DRAWER_WIDTH_KEY, String(parseFloat(w))); } catch (err) { /* 存储受限时静默 */ }
        }
    }

    if (prdResizeHandle) {
        prdResizeHandle.addEventListener('pointerdown', function (e) {
            prdDrag = { startX: e.clientX, startW: prdDrawer.offsetWidth };
            document.body.classList.add('prd-resizing');
            if (prdResizeHandle.setPointerCapture) prdResizeHandle.setPointerCapture(e.pointerId);
            e.preventDefault();
        });
        prdResizeHandle.addEventListener('pointermove', function (e) {
            if (!prdDrag) return;
            // 抽屉右缘固定：新宽 = 起始宽 + (起始X - 当前X)，向左拖加宽
            prdApplyWidth(prdDrag.startW + (prdDrag.startX - e.clientX));
        });
        prdResizeHandle.addEventListener('pointerup', prdEndDrag);
        prdResizeHandle.addEventListener('pointercancel', prdEndDrag);
    }

    /* ---------- 手动编辑：localStorage 覆盖层 ---------- */
    // 仅存储与默认内容不同的章节；渲染时覆盖默认 body，默认内容始终可从代码恢复
    var prdOverrides = prdLoadOverrides();
    var prdEditingId = null; // 同一时刻仅允许一个章节处于编辑态

    function prdLoadOverrides() {
        try {
            var raw = localStorage.getItem(PRD_STORAGE_KEY);
            var obj = raw ? JSON.parse(raw) : {};
            return (obj && typeof obj === 'object') ? obj : {};
        } catch (err) {
            return {};
        }
    }

    function prdPersistOverrides() {
        try { localStorage.setItem(PRD_STORAGE_KEY, JSON.stringify(prdOverrides)); } catch (err) { /* 存储受限时静默 */ }
    }

    function prdHasOverride(id) {
        return Object.prototype.hasOwnProperty.call(prdOverrides, id);
    }

    function prdSecOf(id) {
        for (var i = 0; i < PRD_SECTIONS.length; i++) {
            if (PRD_SECTIONS[i].id === id) return PRD_SECTIONS[i];
        }
        return null;
    }

    function prdBodyOf(s) {
        return prdHasOverride(s.id) ? prdOverrides[s.id] : s.body;
    }

    // 轻提示（自包含 toast，不依赖原型既有 toast）
    var prdToastTimer = null;
    function prdToast(msg) {
        var t = document.getElementById('prdToast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'prdToast';
            t.className = 'prd-toast';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(prdToastTimer);
        prdToastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
    }

    /* ---------- 搜索：标题/正文关键词检索 + 点击定位 + 命中高亮 ----------
       检索范围：章节标题 + 当前生效正文（经 prdBodyOf 取覆盖层后的 Markdown，剥语法后比对），
       空格分隔多词按「同时包含」过滤；标题与正文都计命中次数。
       点击结果 → 目录选中 + 滚到该章首个命中（无命中退回章节顶部）+ 标题闪烁 + 命中包 mark；
       点击后浮层自动收起（聚焦输入框或继续输入时重新展开），避免遮挡刚定位的正文；
       ↑↓ 切换结果、回车依次定位、Esc 先收起浮层再清空（搜索为空时让行给抽屉 Esc）。
       高亮只包裹文本节点，不替换 innerHTML，表格/列表/提示块结构不受影响；
       编辑保存、恢复默认、导入触发重渲后由 prdSearchRefresh() 自动恢复结果与高亮。 */
    var prdSearchInput = document.getElementById('prdSearch');
    var prdSearchClear = document.getElementById('prdSearchClear');
    var prdSearchRes = document.getElementById('prdSearchRes');
    var prdSearchTerms = [];      // 当前生效关键词（已去重）
    var prdSearchQ = '';          // 上次检索的原始输入，回车时据此判断是否需先检索
    var prdSearchHits = [];       // 结果 [{ id, title, count, snip }]
    var prdSearchIdx = -1;        // 键盘活动项下标
    var prdSearchActiveId = null; // 已定位章节 id（重渲后据此恢复当前命中样式）
    var prdSearchTimer = null;

    function prdReEsc(s) {
        return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 关键词拆分：空格分词 + 去重（大小写不敏感）
    function prdSplitTerms(q) {
        var out = [], seen = {};
        String(q == null ? '' : q).trim().split(/\s+/).forEach(function (t) {
            var k = t.toLowerCase();
            if (!t || seen[k]) return;
            seen[k] = 1;
            out.push(t);
        });
        return out;
    }

    // 正文 Markdown → 纯文本：用于计数与结果片段，去掉语法噪声
    function prdPlain(md) {
        return String(md == null ? '' : md)
            .replace(/```[\s\S]*?(?:```|$)/g, ' ')
            .replace(/`([^`]*)`/g, '$1')
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/~~([^~]+)~~/g, '$1')
            .replace(/^\s*#{1,6}\s+/gm, '')
            .replace(/^\s*>\s?/gm, '')
            .replace(/^\s*[-*+]\s+/gm, '')
            .replace(/\|/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // 命中次数（大小写不敏感）
    function prdCountHits(text, terms) {
        var lower = String(text == null ? '' : text).toLowerCase(), n = 0;
        terms.forEach(function (t) {
            var k = t.toLowerCase(), i = 0;
            while (k && (i = lower.indexOf(k, i)) !== -1) { n++; i += k.length; }
        });
        return n;
    }

    // 转义并按关键词包 mark（只生成白名单标签，不引入注入面）
    function prdHl(raw, terms) {
        var s = String(raw == null ? '' : raw);
        if (!terms.length) return prdEsc(s);
        var re = new RegExp('(' + terms.map(prdReEsc).join('|') + ')', 'gi');
        return s.split(re).map(function (part, i) {
            return i % 2 ? '<mark class="prd-hit">' + prdEsc(part) + '</mark>' : prdEsc(part);
        }).join('');
    }

    // 以首个命中为中心截取片段（原文，未转义）
    function prdSnip(plain, terms, span) {
        var s = String(plain == null ? '' : plain), lower = s.toLowerCase();
        var at = -1, len = 0;
        for (var i = 0; i < terms.length && at < 0; i++) {
            at = lower.indexOf(terms[i].toLowerCase());
            len = terms[i].length;
        }
        if (at < 0) return s.slice(0, span * 2) + (s.length > span * 2 ? '…' : '');
        var start = Math.max(0, at - Math.floor(span / 2));
        var end = Math.min(s.length, at + len + span);
        return (start > 0 ? '…' : '') + s.slice(start, end) + (end < s.length ? '…' : '');
    }

    // 清除正文高亮：mark 拆回文本节点并合并相邻文本，保证原文不被破坏
    function prdClearHits() {
        prdContent.querySelectorAll('mark.prd-hit').forEach(function (m) {
            var p = m.parentNode;
            if (!p) return;
            while (m.firstChild) p.insertBefore(m.firstChild, m);
            p.removeChild(m);
            if (p.normalize) p.normalize();
        });
    }

    // 在 root 的文本节点内包 mark；跳过脚本/样式/文本域/既有 mark，保留原有元素结构
    function prdMarkIn(root, terms) {
        if (!root || !terms.length) return;
        var pattern = '(' + terms.map(prdReEsc).join('|') + ')';
        var probe = new RegExp(pattern, 'i');
        var walker = document.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */, null);
        var nodes = [];
        while (walker.nextNode()) {
            var n = walker.currentNode;
            var tag = n.parentNode ? n.parentNode.nodeName : '';
            if (!n.nodeValue || /^(SCRIPT|STYLE|TEXTAREA|MARK)$/.test(tag)) continue;
            if (probe.test(n.nodeValue)) nodes.push(n);
        }
        nodes.forEach(function (n) {
            var text = n.nodeValue, frag = document.createDocumentFragment(), last = 0;
            var re = new RegExp(pattern, 'gi'), m;
            while ((m = re.exec(text))) {
                if (!m[0]) { re.lastIndex++; continue; }
                if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
                var mk = document.createElement('mark');
                mk.className = 'prd-hit';
                mk.textContent = m[0];
                frag.appendChild(mk);
                last = m.index + m[0].length;
            }
            if (!last) return;
            if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
            n.parentNode.replaceChild(frag, n);
        });
    }

    // 目录反馈：命中项加左杠，未命中项淡化
    function prdMarkToc(on) {
        var hit = {};
        prdSearchHits.forEach(function (r) { hit[r.id] = 1; });
        prdToc.querySelectorAll('.prd-toc-item').forEach(function (el) {
            var m = !!hit[el.getAttribute('data-sec')];
            el.classList.toggle('prd-toc-hit', !!on && m);
            el.classList.toggle('prd-toc-dim', !!on && !m);
        });
    }

    // 检索并渲染结果浮层（不滚动、不改活动项）
    function prdSearchCompute() {
        prdSearchHits = [];
        var total = 0;
        PRD_SECTIONS.forEach(function (s) {
            var plain = prdPlain(prdBodyOf(s));
            var lowerT = String(s.title).toLowerCase(), lowerB = plain.toLowerCase();
            var all = prdSearchTerms.every(function (t) {
                var k = t.toLowerCase();
                return lowerT.indexOf(k) > -1 || lowerB.indexOf(k) > -1;
            });
            if (!all) return;
            var tHit = prdCountHits(s.title, prdSearchTerms);
            var bHit = prdCountHits(plain, prdSearchTerms);
            total += tHit + bHit;
            prdSearchHits.push({
                id: s.id, title: s.title, count: tHit + bHit,
                snip: prdSnip(tHit ? String(s.title) : plain, prdSearchTerms, 26)
            });
        });
        if (!prdSearchRes) return;
        prdSearchRes.hidden = false;
        prdSearchRes.innerHTML = prdSearchHits.length
            ? '<div class="prd-res-sum">' + prdSearchHits.length + ' 个章节 · ' + total + ' 处命中</div>'
                + prdSearchHits.map(function (r, i) {
                    return '<div class="prd-res-item' + (i === prdSearchIdx ? ' active' : '') + '"'
                        + ' data-prd-res="' + r.id + '" data-idx="' + i + '">'
                        + '<span class="prd-res-no">' + r.id + '</span>'
                        + '<span class="prd-res-main"><b>' + prdHl(r.title, prdSearchTerms) + '</b>'
                        + '<span class="prd-res-snip">' + prdHl(r.snip, prdSearchTerms) + '</span></span>'
                        + '<span class="prd-res-count">' + r.count + '</span></div>';
                }).join('')
            : '<div class="prd-res-sum prd-res-empty">无匹配：换个关键词试试（空格分隔多词表示需同时包含）</div>';
        prdMarkToc(true);
    }

    // 高亮正文与标题命中；已定位章节的首个命中加「当前」描边
    function prdSearchPaint() {
        prdClearHits();
        if (!prdSearchTerms.length) { prdMarkToc(false); return; }
        PRD_SECTIONS.forEach(function (s) {
            var sec = document.getElementById('prd-sec-' + s.id);
            if (!sec) return;
            prdMarkIn(sec.querySelector('.prd-sec-t'), prdSearchTerms);
            prdMarkIn(sec.querySelector('.prd-sec-body'), prdSearchTerms);
        });
        prdContent.querySelectorAll('mark.prd-hit-cur').forEach(function (m) {
            m.classList.remove('prd-hit-cur');
        });
        var curSec = prdSearchActiveId ? document.getElementById('prd-sec-' + prdSearchActiveId) : null;
        var curHit = curSec ? curSec.querySelector('mark.prd-hit') : null;
        if (curHit) curHit.classList.add('prd-hit-cur');
    }

    // 收起结果浮层（保留关键词、正文高亮与目录标记）
    function prdSearchFold() {
        if (prdSearchRes) prdSearchRes.hidden = true;
    }

    // 定位到第 idx 条结果：目录选中 + 滚到首个命中 + 标题闪烁；fold=true 时定位后收起浮层
    function prdGotoResult(idx, fold) {
        var r = prdSearchHits[idx];
        if (!r) return;
        prdSearchIdx = idx;
        prdSearchActiveId = r.id;
        if (prdSearchRes) {
            prdSearchRes.querySelectorAll('.prd-res-item').forEach(function (el) {
                var on = el.getAttribute('data-idx') === String(idx);
                el.classList.toggle('active', on);
                if (on && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
            });
        }
        prdToc.querySelectorAll('.prd-toc-item').forEach(function (el) {
            el.classList.toggle('active', el.getAttribute('data-sec') === r.id);
        });
        var tocItem = prdToc.querySelector('.prd-toc-item[data-sec="' + r.id + '"]');
        if (tocItem && tocItem.scrollIntoView) tocItem.scrollIntoView({ block: 'nearest' });

        prdSearchPaint();
        var sec = document.getElementById('prd-sec-' + r.id);
        if (!sec) return;
        var hit = sec.querySelector('mark.prd-hit');
        var prevBehavior = prdContent.style.scrollBehavior;
        prdContent.style.scrollBehavior = 'auto'; // 搜索连续切换不做平滑动画，避免定位漂移
        if (hit) {
            var cr = prdContent.getBoundingClientRect(), hr = hit.getBoundingClientRect();
            prdContent.scrollTop = Math.max(0, prdContent.scrollTop + hr.top - cr.top - 40);
        } else {
            prdContent.scrollTop = Math.max(0, sec.offsetTop - 12);
        }
        prdContent.style.scrollBehavior = prevBehavior;
        sec.classList.remove('prd-flash');
        void sec.offsetWidth;
        sec.classList.add('prd-flash');
        if (fold) prdSearchFold();
    }

    // 执行检索；keepActive=true 时保留当前定位（重渲后恢复用）
    function prdSearchRun(keepActive) {
        prdSearchQ = prdSearchInput ? prdSearchInput.value : '';
        prdSearchTerms = prdSplitTerms(prdSearchQ);
        if (prdSearchClear) prdSearchClear.classList.toggle('show', !!prdSearchQ);
        if (!prdSearchTerms.length) {
            prdSearchHits = [];
            prdSearchIdx = -1;
            prdSearchActiveId = null;
            if (prdSearchRes) { prdSearchRes.hidden = true; prdSearchRes.innerHTML = ''; }
            prdClearHits();
            prdMarkToc(false);
            return;
        }
        if (!keepActive) { prdSearchIdx = -1; prdSearchActiveId = null; }
        prdSearchCompute();
        prdSearchPaint();
    }

    function prdClearSearch() {
        if (prdSearchInput) prdSearchInput.value = '';
        prdSearchRun(false);
        if (prdSearchInput) prdSearchInput.focus();
    }

    // 重渲（编辑保存/恢复默认/导入）后恢复结果与高亮，不改变当前滚动位置
    function prdSearchRefresh() {
        if (!prdSearchTerms.length) { prdMarkToc(false); return; }
        prdSearchCompute();
        prdSearchPaint();
    }

    if (prdSearchInput) {
        prdSearchInput.addEventListener('input', function () {
            clearTimeout(prdSearchTimer);
            prdSearchTimer = setTimeout(function () { prdSearchRun(false); }, 90);
        });
        // 浮层收起后回到输入框：已有结果则重新展开（focus 兼顾 Tab 进入，click 兼顾已聚焦时再点）
        var prdSearchShow = function () {
            if (prdSearchRes && prdSearchTerms.length) prdSearchRes.hidden = false;
        };
        prdSearchInput.addEventListener('focus', prdSearchShow);
        prdSearchInput.addEventListener('click', prdSearchShow);
        prdSearchInput.addEventListener('keydown', function (e) {
            var total = prdSearchHits.length;
            if (e.key === 'Enter') {
                e.preventDefault();
                clearTimeout(prdSearchTimer);
                if (prdSearchQ !== prdSearchInput.value) { prdSearchRun(false); prdGotoResult(0); return; }
                if (!total) return;
                var next = e.shiftKey
                    ? (prdSearchIdx <= 0 ? total - 1 : prdSearchIdx - 1)
                    : (prdSearchIdx + 1 >= total ? 0 : prdSearchIdx + 1);
                prdGotoResult(next);
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                if (!total) return;
                e.preventDefault();
                var i = prdSearchIdx + (e.key === 'ArrowDown' ? 1 : -1);
                prdGotoResult((i + total) % total);
            } else if (e.key === 'Escape') {
                if (prdSearchInput.value) {
                    e.preventDefault();
                    e.stopPropagation();
                    // 两段式：先收起浮层看正文，再按一次才清空高亮
                    if (prdSearchRes && !prdSearchRes.hidden) prdSearchFold(); else prdClearSearch();
                } else {
                    prdSearchInput.blur(); // 空态让行：交给 document 的 Esc 收起抽屉
                }
            }
        });
    }
    if (prdSearchClear) prdSearchClear.addEventListener('click', prdClearSearch);
    if (prdSearchRes) {
        prdSearchRes.addEventListener('click', function (e) {
            var item = e.target.closest ? e.target.closest('.prd-res-item') : null;
            if (!item) return;
            prdGotoResult(parseInt(item.getAttribute('data-idx'), 10) || 0, true);
        });
    }
    // 点击搜索区域以外：收起浮层（关键词与高亮保留）
    document.addEventListener('mousedown', function (e) {
        if (!prdSearchRes || prdSearchRes.hidden) return;
        if (e.target && e.target.closest && e.target.closest('.prd-search-wrap')) return;
        prdSearchFold();
    }, true);

    // 渲染目录（按组）与全部章节内容；含本地修改的章节带「已修改」标记与目录圆点
    function prdRender() {
        prdToc.innerHTML = PRD_GROUPS.map(function (g) {
            var items = PRD_SECTIONS.filter(function (s) { return s.group === g.key; }).map(function (s) {
                return '<div class="prd-toc-item" data-sec="' + s.id + '"><span class="toc-no">' + s.id + '</span><span>' + s.title + '</span>'
                    + (prdHasOverride(s.id) ? '<i class="toc-dot" title="含本地修改"></i>' : '')
                    + '</div>';
            }).join('');
            return '<div class="prd-toc-group">' + g.name + '</div>' + items;
        }).join('');
        prdContent.innerHTML = PRD_SECTIONS.map(function (s) {
            return '<section class="prd-sec" id="prd-sec-' + s.id + '">'
                + '<div class="prd-sec-h"><span class="sec-no">' + s.id + '</span><span class="prd-sec-t">' + s.title + '</span>'
                + (prdHasOverride(s.id) ? '<span class="prd-modified">已修改</span>' : '')
                + '<span class="prd-sec-edit" data-prd-edit="' + s.id + '" title="编辑本章节">✎</span>'
                + '</div><div class="prd-sec-body">' + prdMd(prdBodyOf(s)) + '</div></section>';
        }).join('')
            + '<p class="prd-note">页面各模块悬浮的编号徽章与上述章节一一对应，点击徽章可定位本章。顶部搜索框可按标题或正文关键词检索，点击结果定位并高亮命中。点击章节标题右侧 ✎ 以 <b>Markdown</b> 编辑本章节，修改保存在本浏览器（localStorage），可经头部导出/导入 <b>Markdown</b> 文档备份与迁移。</p>';
        prdSearchRefresh();
    }

    // 定位到指定章节：目录选中 + 内容滚动 + 标题闪烁高亮
    function prdLocate(id) {
        var sec = document.getElementById('prd-sec-' + id);
        if (!sec) return;
        prdToc.querySelectorAll('.prd-toc-item').forEach(function (el) {
            el.classList.toggle('active', el.getAttribute('data-sec') === id);
        });
        prdContent.scrollTop = Math.max(0, sec.offsetTop - 12);
        sec.classList.remove('prd-flash');
        void sec.offsetWidth; // 强制 reflow，重启动画
        sec.classList.add('prd-flash');
        var tocItem = prdToc.querySelector('.prd-toc-item[data-sec="' + id + '"]');
        if (tocItem && tocItem.scrollIntoView) tocItem.scrollIntoView({ block: 'nearest' });
    }

    function prdOpen(id) {
        prdDrawer.classList.add('open');
        if (id) {
            prdLocate(id);
        } else if (!prdToc.querySelector('.prd-toc-item.active')) {
            prdLocate(PRD_HOME_SECTION);
        }
    }

    function prdCloseDrawer() {
        prdDrawer.classList.remove('open');
        prdSearchFold(); // 抽屉收起时一并收起结果浮层，重开不遮挡正文（关键词与高亮保留）
    }

    /* 宿主页供嵌入视图调用（postMessage rp-prd）：统一打开全视口抽屉并定位章节 */
    window.__prdOpenSection = function (id) { prdOpen(id); };

    /* ---------- 手动编辑：编辑态切换 / 保存 / 恢复 / 导入导出 ---------- */

    // 有未保存修改时确认放弃；返回 true 表示可以继续（编辑态已清理）
    function prdConfirmDiscard() {
        var ta = document.getElementById('prdEditor');
        if (!ta || !prdEditingId) { prdEditingId = null; return true; }
        var sec = prdSecOf(prdEditingId);
        var origin = sec ? prdBodyOf(sec) : '';
        if (ta.value !== origin && !window.confirm('当前章节有未保存的修改，确定放弃吗？')) return false;
        prdEditingId = null;
        return true;
    }

    function prdEnterEdit(id) {
        if (prdEditingId === id) return;
        var sec = prdSecOf(id);
        var secEl = document.getElementById('prd-sec-' + id);
        if (!sec || !secEl) return;
        if (prdEditingId) {
            var prevId = prdEditingId;
            if (!prdConfirmDiscard()) return;
            prdRerenderKeeping(prevId); // 还原上一节的编辑态
        }
        prdEditingId = id;
        secEl.classList.add('prd-editing');
        var bodyBox = secEl.querySelector('.prd-sec-body');
        bodyBox.innerHTML = '<textarea class="prd-editor" id="prdEditor" spellcheck="false"></textarea>'
            + '<div class="prd-editor-actions">'
            + '<button type="button" class="prd-btn prd-btn-primary" data-prd-save="' + id + '">保存</button>'
            + '<button type="button" class="prd-btn prd-btn-ghost" data-prd-cancel="' + id + '">取消</button>'
            + '<button type="button" class="prd-btn prd-btn-danger" data-prd-reset="' + id + '">恢复默认</button>'
            + '<span class="prd-editor-tip">Markdown 编辑：**粗体**　`代码`　| 表 | 格 |　- 列表　&gt; 提示　【隐藏】标记；正文用自然语言、不写代码；保存在本浏览器，可经头部导出 Markdown 备份</span>'
            + '</div>';
        var ta = bodyBox.querySelector('.prd-editor');
        var current = prdBodyOf(sec);
        ta.value = current;
        ta.rows = Math.min(28, Math.max(10, current.split('\n').length + 2));
        ta.focus();
    }

    function prdSaveEdit(id) {
        var ta = document.getElementById('prdEditor');
        var sec = prdSecOf(id);
        if (!ta || !sec) return;
        var val = ta.value.trim();
        if (!val) { prdToast('内容不能为空'); return; }
        if (val === sec.body.trim()) {
            delete prdOverrides[id]; // 与默认一致视为未修改
        } else {
            prdOverrides[id] = val;
        }
        prdPersistOverrides();
        prdEditingId = null;
        prdRerenderKeeping(id);
        prdToast(prdHasOverride(id) ? '已保存（本地生效，标注「已修改」）' : '已保存（与默认一致）');
    }

    function prdExitEdit(id) {
        if (prdEditingId !== id) return;
        if (!prdConfirmDiscard()) return;
        prdRerenderKeeping(id);
    }

    function prdResetSec(id) {
        if (!prdHasOverride(id)) { prdToast('该章节已是默认内容'); return; }
        if (!window.confirm('恢复为默认内容？本地修改将被丢弃。')) return;
        delete prdOverrides[id];
        prdPersistOverrides();
        prdEditingId = null;
        prdRerenderKeeping(id);
        prdToast('已恢复默认内容');
    }

    // 全量重渲并保持浏览位置（目录选中项 + 滚动到指定章节）
    function prdRerenderKeeping(id) {
        var active = prdToc.querySelector('.prd-toc-item.active');
        var activeId = active ? active.getAttribute('data-sec') : null;
        prdRender();
        if (activeId) {
            var item = prdToc.querySelector('.prd-toc-item[data-sec="' + activeId + '"]');
            if (item) item.classList.add('active');
        }
        if (id) {
            var secEl = document.getElementById('prd-sec-' + id);
            if (secEl) prdContent.scrollTop = Math.max(0, secEl.offsetTop - 12);
        }
    }

    /* ---------- 导出 / 导入：Markdown 文档（与 PRD.md 同构） ----------
       导出结构：# 项目名 产品需求文档（PRD） / > 说明行 / # 组名 / ## 编号 标题 + 正文，
       章节与组之间以 --- 分隔；正文取覆盖层合并后的 Markdown，可直接作为 PRD.md 快照。
       导入：仅认「## 编号 标题」为章节起点，正文到下一个「## 编号」或任意其他「# / ## 标题」为止，
       故文档头、组标题、验收场景表等非章节内容不会混入；正文首尾的 --- 分隔线剔除；
       章节标题与分组以代码内 PRD_SECTIONS 为准，文件里的标题不参与覆盖。 */

    function prdExportText() {
        var now = new Date();
        var pad = function (n) { return String(n).padStart(2, '0'); };
        var modified = 0;
        PRD_SECTIONS.forEach(function (s) { if (prdHasOverride(s.id)) modified++; });
        var groupKeys = PRD_GROUPS.map(function (g) { return g.key; });
        var blocks = [];
        // 未登记在 PRD_GROUPS 的章节归入「其他章节」，避免导出丢内容
        PRD_GROUPS.concat([{ key: null, name: '其他章节' }]).forEach(function (g) {
            var list = PRD_SECTIONS.filter(function (s) {
                return g.key ? s.group === g.key : groupKeys.indexOf(s.group) < 0;
            });
            if (!list.length) return;
            blocks.push('# ' + g.name + '\n\n' + list.map(function (s) {
                return '## ' + s.id + ' ' + s.title + '\n\n' + String(prdBodyOf(s)).trim();
            }).join('\n\n---\n\n'));
        });
        return [
            '# ' + PRD_APP_NAME + ' 产品需求文档（PRD）',
            '',
            '> 导出自原型页内 PRD 查看器，含全部本地修改 · '
                + now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate())
                + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes())
                + ' · 共 ' + PRD_SECTIONS.length + ' 章' + (modified ? '（本地修改 ' + modified + ' 章）' : ''),
            '',
            blocks.join('\n\n---\n\n'),
            ''
        ].join('\n');
    }

    // Markdown → 章节列表 [{ id, body }]；无章节时返回空数组
    function prdParseMd(text) {
        var lines = String(text == null ? '' : text).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
        var list = [];
        var cur = null;
        var fence = false; // ``` 围栏内的 # / ## 属正文内容，不参与结构识别
        for (var i = 0; i < lines.length; i++) {
            var t = lines[i].trim();
            if (t.indexOf('```') === 0) {
                fence = !fence;
                if (cur) cur.lines.push(lines[i]);
                continue;
            }
            if (fence) { if (cur) cur.lines.push(lines[i]); continue; }
            var m = /^##\s+([A-Za-z]{2,4}-\d{2})(?:\s+(.*))?$/.exec(t);
            if (m) {
                if (cur) list.push(cur);
                cur = { id: m[1].toUpperCase(), lines: [] };
                continue;
            }
            if (!cur) continue;       // 首个章节之前：文档标题与说明行，忽略
            if (/^#{1,2}\s/.test(t)) { // 一级标题（组）或非编号的二级标题（如「验收场景」）：本章结束
                list.push(cur);
                cur = null;
                continue;
            }
            cur.lines.push(lines[i]);
        }
        if (cur) list.push(cur);
        return list.map(function (s) {
            var body = s.lines.join('\n')
                .replace(/^\s*(?:---\s*\n)+/, '') // 章节前的分隔线
                .replace(/(?:\n\s*---)+\s*$/, '') // 章节末尾的分隔线
                .replace(/\n{3,}/g, '\n\n')
                .trim();
            return { id: s.id, body: body };
        });
    }

    // 导出：下载 Markdown 文档（含全部本地修改）
    function prdExport() {
        var now = new Date();
        var pad = function (n) { return String(n).padStart(2, '0'); };
        var blob = new Blob([prdExportText()], { type: 'text/markdown;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = PRD_EXPORT_NAME + '-' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate())
            + '-' + pad(now.getHours()) + pad(now.getMinutes()) + '.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 0);
        prdToast('已导出 PRD Markdown（含全部本地修改）');
    }

    // 导入：读取 Markdown 文档，与默认不同的章节写入覆盖层
    function prdImport() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.markdown,.txt,text/markdown,text/plain';
        input.addEventListener('change', function () {
            var file = input.files && input.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function () {
                var list = prdParseMd(reader.result);
                if (!list.length) {
                    window.alert('导入失败：文件中没有「## 编号 标题」形式的章节行（编号需与页面徽章一致，如 LP-01）。');
                    return;
                }
                if (prdEditingId && !prdConfirmDiscard()) return;
                var covered = 0, same = 0, skipped = 0, unknown = 0;
                list.forEach(function (item) {
                    if (!item.body) { skipped++; return; } // 空正文不覆盖，避免误清空本地修改
                    var sec = prdSecOf(item.id);
                    if (!sec) { unknown++; return; }
                    if (item.body === sec.body.trim()) {
                        if (prdHasOverride(item.id)) delete prdOverrides[item.id];
                        same++;
                    } else {
                        prdOverrides[item.id] = item.body;
                        covered++;
                    }
                });
                prdPersistOverrides();
                prdRerenderKeeping(null);
                prdToast('导入完成：' + covered + ' 节覆盖默认' + (same ? '，' + same + ' 节与默认一致' : '')
                    + (skipped ? '，' + skipped + ' 节正文为空已忽略' : '')
                    + (unknown ? '，' + unknown + ' 节编号无法识别已忽略' : ''));
            };
            reader.readAsText(file, 'utf-8');
        });
        input.click();
    }

    /* ---------- 悬浮按钮拖拽 + 吸边（任意拖动，松手吸附最近左右边缘，位置本地记忆） ---------- */
    var PRD_FAB_MARGIN = 12;          // 吸边与钳制时距视口边缘的最小间距
    var prdFabDrag = null;            // 拖动会话 { startX, startY, origLeft, origTop, moved }
    var prdFabSuppressClick = false;  // 拖动结束后吞掉浏览器补发的 click，避免拖完顺手开抽屉

    function prdFabPlace(left, top) {
        prdFab.style.right = 'auto';
        prdFab.style.bottom = 'auto';
        prdFab.style.left = left + 'px';
        prdFab.style.top = top + 'px';
    }

    function prdFabReadPos() {
        try {
            var pos = JSON.parse(localStorage.getItem(PRD_FAB_POS_KEY) || 'null');
            if (pos && (pos.side === 'left' || pos.side === 'right') && isFinite(pos.y)) return pos;
        } catch (err) { /* 读取失败静默 */ }
        return null;
    }

    // 按吸边侧 + y 落位（x 由 side 决定），y 钳制在视口内；返回钳制后的 top
    function prdFabApply(side, y) {
        var r = prdFab.getBoundingClientRect();
        var vw = window.innerWidth, vh = window.innerHeight;
        var x = side === 'left' ? PRD_FAB_MARGIN : vw - r.width - PRD_FAB_MARGIN;
        var top = Math.min(vh - r.height - PRD_FAB_MARGIN, Math.max(PRD_FAB_MARGIN, y));
        prdFabPlace(x, top);
        return top;
    }

    // 恢复记忆位置；无记忆保持 CSS 默认右下角
    (function prdFabInit() {
        var pos = prdFabReadPos();
        if (pos) prdFabApply(pos.side, pos.y);
    })();

    // 视口尺寸变化后按记忆重新吸边钳制，避免 fab 跑出屏幕
    window.addEventListener('resize', function () {
        var pos = prdFabReadPos();
        if (pos) prdFabApply(pos.side, pos.y);
    });

    prdFab.addEventListener('pointerdown', function (e) {
        if (e.button !== undefined && e.button !== 0) return;
        var r = prdFab.getBoundingClientRect();
        prdFabDrag = { startX: e.clientX, startY: e.clientY, origLeft: r.left, origTop: r.top, moved: false };
        try { if (prdFab.setPointerCapture) prdFab.setPointerCapture(e.pointerId); } catch (err) { /* 合成事件/无活动指针时静默 */ }
    });

    prdFab.addEventListener('pointermove', function (e) {
        if (!prdFabDrag) return;
        var dx = e.clientX - prdFabDrag.startX;
        var dy = e.clientY - prdFabDrag.startY;
        if (!prdFabDrag.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return; // 阈值内视为点击
        prdFabDrag.moved = true;
        prdFab.classList.add('prd-fab-drag');
        prdFabPlace(prdFabDrag.origLeft + dx, prdFabDrag.origTop + dy);
    });

    function prdFabEndDrag() {
        if (!prdFabDrag) return;
        var moved = prdFabDrag.moved;
        prdFabDrag = null;
        prdFab.classList.remove('prd-fab-drag');
        if (!moved) return; // 未超阈值：交给 click 事件 toggle
        prdFabSuppressClick = true;
        var r = prdFab.getBoundingClientRect();
        var side = (r.left + r.width / 2) < window.innerWidth / 2 ? 'left' : 'right'; // 吸最近水平边
        var top = prdFabApply(side, r.top);
        try { localStorage.setItem(PRD_FAB_POS_KEY, JSON.stringify({ side: side, y: Math.round(top) })); } catch (err) { /* 存储受限时静默 */ }
    }
    prdFab.addEventListener('pointerup', prdFabEndDrag);
    prdFab.addEventListener('pointercancel', prdFabEndDrag);

    /* ---------- 事件绑定 ---------- */

    // 浮动按钮 toggle：点击展开抽屉，再次点击收起（编辑内容保留在 DOM，不丢）
    // 拖动结束会补发一次 click，用 prdFabSuppressClick 吞掉
    prdFab.addEventListener('click', function () {
        if (prdFabSuppressClick) { prdFabSuppressClick = false; return; }
        if (prdDrawer.classList.contains('open')) {
            prdCloseDrawer();
        } else {
            prdOpen();
        }
    });
    if (prdCloseBtn) prdCloseBtn.addEventListener('click', prdCloseDrawer);

    // 目录点击定位（抽屉保持展开，不遮挡原型操作）
    prdToc.addEventListener('click', function (e) {
        var item = e.target.closest('.prd-toc-item');
        if (item) prdLocate(item.getAttribute('data-sec'));
    });

    // 模块编号徽章点击（事件委托）：展开抽屉并定位；阻止冒泡避免触发卡片下钻等既有绑定
    // 嵌入视图：本视图抽屉只能覆盖 iframe 区域（顶部被宿主顶栏 / tab 条遮挡），改由宿主打开全视口抽屉
    document.addEventListener('click', function (e) {
        var badge = e.target.closest('.prd-badge');
        if (!badge) return;
        e.stopPropagation();
        e.preventDefault();
        var id = badge.getAttribute('data-prd');
        if (prdEmbedded) {
            try { window.parent.postMessage({ type: 'rp-prd', id: id }, '*'); } catch (err) { /* 父窗不可达时静默 */ }
            return;
        }
        prdOpen(id);
    });

    // 章节编辑按钮（事件委托：编辑 / 保存 / 取消 / 恢复默认）
    prdContent.addEventListener('click', function (e) {
        var editBtn = e.target.closest('[data-prd-edit]');
        if (editBtn) { prdEnterEdit(editBtn.getAttribute('data-prd-edit')); return; }
        var saveBtn = e.target.closest('[data-prd-save]');
        if (saveBtn) { prdSaveEdit(saveBtn.getAttribute('data-prd-save')); return; }
        var cancelBtn = e.target.closest('[data-prd-cancel]');
        if (cancelBtn) { prdExitEdit(cancelBtn.getAttribute('data-prd-cancel')); return; }
        var resetBtn = e.target.closest('[data-prd-reset]');
        if (resetBtn) { prdResetSec(resetBtn.getAttribute('data-prd-reset')); }
    });

    var prdExportBtn = document.getElementById('prdExport');
    var prdImportBtn = document.getElementById('prdImport');
    if (prdExportBtn) prdExportBtn.addEventListener('click', prdExport);
    if (prdImportBtn) prdImportBtn.addEventListener('click', prdImport);

    // Esc：编辑态优先取消编辑，其次搜索浮层/关键词，再次其他浮层让行，最后收起抽屉
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (!prdDrawer.classList.contains('open')) return;
        if (prdEditingId) {
            var id = prdEditingId;
            if (prdConfirmDiscard()) prdRerenderKeeping(id);
            return;
        }
        // 搜索优先：浮层开着先收起，再按才清空关键词，最后让行给抽屉
        if (prdSearchTerms.length) {
            if (prdSearchRes && !prdSearchRes.hidden) prdSearchFold(); else prdClearSearch();
            return;
        }
        if (prdAnyOverlayOpen()) return;
        prdCloseDrawer();
    });

    prdRender();
})();
