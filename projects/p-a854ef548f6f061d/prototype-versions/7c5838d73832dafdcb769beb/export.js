/* ════════════════════════════════════════════════════════════════
   export.js · 报告导出壳页公共逻辑（export-class / export-grade / export-essay 三页共用）
   流程：
     1. 读取 <body data-src="class-report.html" data-title="…">，把本页 location.search 原样转给源报告
        （URL 契约 hw / cls / role / q 不变），并追加 embed=1（无顶栏、无 PRD 抽屉），以隐藏 iframe 加载
     2. iframe 加载完成 → postMessage {type:'rp-export-req'}；源页 rpInitShell 里的监听回传
        {type:'rp-export-html', html, styles, title, role, hw, cls}
     3. 本页把源页 <style>（作文页私有样式等）注入 <head>，把 #rp-main 的 HTML 放进 .xp-page；
        ?only=m6（可逗号分隔）时只保留指定模块（班级报告「讲评清单导出」用）
     4. 「打印 / 另存为 PDF」= window.print()；PDF 不在这里生成，纸面细节直接改 export.css / report.css
   file:// 下跨 frame 不能直读 contentDocument，所以全部走 postMessage
   ════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    var body = document.body;
    var SRC = body.getAttribute('data-src');
    var TITLE = body.getAttribute('data-title') || '报告导出';
    var Q = new URLSearchParams(location.search);
    var ONLY = (Q.get('only') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);

    var page = document.getElementById('xp-page');
    var meta = document.getElementById('xp-meta');
    var ROLE_NAME = { teacher: '任课教师版', leader: '备课组长 / 管理版' };

    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function now() {
        var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    }

    /* 源页 URL：去掉壳页私有参数 only，补 embed=1 */
    function srcUrl() {
        var q = new URLSearchParams(location.search);
        q.delete('only');
        q.set('embed', '1');
        return SRC + '?' + q.toString();
    }

    var frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;left:-9999px;top:0;width:1280px;height:900px;border:0;visibility:hidden';
    frame.src = srcUrl();
    body.appendChild(frame);
    frame.addEventListener('load', function () {
        try { frame.contentWindow.postMessage({ type: 'rp-export-req' }, '*'); } catch (e) { fail('无法向源报告发送导出请求'); }
    });
    var timer = setTimeout(function () { fail('源报告未在 8 秒内返回内容，请确认 ' + SRC + ' 可正常打开'); }, 8000);

    function fail(msg) {
        clearTimeout(timer);
        page.innerHTML = '<div class="xp-empty">' + esc(msg) + '</div>';
    }

    window.addEventListener('message', function (e) {
        var d = e.data || {};
        if (d.type !== 'rp-export-html') return;
        clearTimeout(timer);
        /* 源页私有 <style>（作文页的 .es-* 等）注入壳页；report.css 已由壳页自行引用 */
        (d.styles || []).forEach(function (css) {
            var st = document.createElement('style');
            st.setAttribute('data-from', SRC);
            st.textContent = css;
            document.head.appendChild(st);
        });
        var tmp = document.createElement('div');
        tmp.innerHTML = d.html || '';
        if (ONLY.length) {
            /* 只保留指定模块（.mod#mX）；非模块节点（如作文页题目卡）保留 */
            Array.prototype.forEach.call(tmp.querySelectorAll('section.mod'), function (sec) {
                if (ONLY.indexOf(sec.id) < 0) sec.parentNode.removeChild(sec);
            });
        }
        /* 展开全部折叠区 / 题目信息区；textarea 的输入值已由源页写进 textContent */
        Array.prototype.forEach.call(tmp.querySelectorAll('details'), function (x) { x.open = true; });
        Array.prototype.forEach.call(tmp.querySelectorAll('.es-q-info.collapsed'), function (x) { x.classList.remove('collapsed'); });
        /* 行内下钻属屏幕交互态：导出稿只保留题目清单，不带 .drill-row（源页新加载时通常也未展开，此处作防御性剔除） */
        Array.prototype.forEach.call(tmp.querySelectorAll('.drill-row'), function (x) { x.parentNode.removeChild(x); });

        var role = d.role ? (ROLE_NAME[d.role] || d.role) : '';
        var m = d.meta || {};
        var mods = d.modules || [];
        /* 导出稿抬头写业务信息（学科 / 作业 / 满分 / 批阅时间 / 班级 / 角色）——只看导出稿也能知道这是哪次作业；
           不再用内部作业 ID（HW-0910-U1）当标题附属信息 */
        var subParts = [];
        if (m.subject) subParts.push(m.subject);
        if (m.name) subParts.push(m.name);
        if (m.full) subParts.push('满分 ' + m.full + ' 分');
        if (m.reviewedAt) subParts.push('批阅于 ' + m.reviewedAt);
        if (d.cls) subParts.push(d.cls + ' 班');
        if (role) subParts.push(role);
        var rangeTxt = ONLY.length
            ? '仅导出模块 ' + ONLY.map(function (id) {
                var it = mods.filter(function (x) { return x.id === id; })[0];
                return it ? it.no + ' ' + it.title : id.replace(/^m/, '');
            }).join('、')
            : (mods.length ? '全部模块（' + mods.length + '）' : '');
        if (rangeTxt) subParts.push(rangeTxt);
        var title = (d.title || TITLE).replace(/\s*·\s*讲评试卷 4\.0\s*$/, '');
        document.title = title + ' · 导出';
        if (meta) meta.textContent = subParts.join(' · ');

        page.innerHTML = '<div class="xp-head"><h1>' + esc(title) + '</h1>'
            + (subParts.length ? '<span class="sub">' + esc(subParts.join(' · ')) + '</span>' : '')
            + '<span class="when">导出时间 ' + now() + '</span></div>';
        var wrap = document.createElement('div');
        wrap.className = 'rp-wrap ' + (d.role === 'leader' ? 'role-leader' : 'role-teacher');
        var main = document.createElement('main');
        main.id = 'rp-main';
        while (tmp.firstChild) main.appendChild(tmp.firstChild);
        wrap.appendChild(main);
        page.appendChild(wrap);
        /* 源 iframe 已完成使命，移除以释放内存（避免其 scroll/resize 监听持续运行） */
        if (frame.parentNode) frame.parentNode.removeChild(frame);
    });

    document.getElementById('xp-print').addEventListener('click', function () { window.print(); });
    document.getElementById('xp-back').addEventListener('click', function () {
        var q = new URLSearchParams(location.search);
        q.delete('only');
        q.delete('embed');
        location.href = SRC + (q.toString() ? '?' + q.toString() : '');
    });
})();
