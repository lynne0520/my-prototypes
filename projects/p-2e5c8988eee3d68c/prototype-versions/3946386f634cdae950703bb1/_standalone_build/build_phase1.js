/**
 * 学科学情分析系统 · 一期独立分享版构建脚本
 * 保留学情诊断、学生追踪与教学建议，彻底移除题目生成、组卷配置和 mock 题干。
 * 原始 index.html / app.js / styles.css 不修改。
 *
 * 用法: node build_phase1.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ASSET = __dirname;
const OUT_NAME = '学科学情_一期独立分享版.html';
const readAsset = f => fs.readFileSync(path.join(ASSET, f), 'utf8');
const readRoot = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const b64 = f => fs.readFileSync(path.join(ASSET, f)).toString('base64');

let html = readRoot('index.html').replace(/\r\n/g, '\n');
let appJs = readRoot('app.js').replace(/\r\n/g, '\n');
let stylesCss = readRoot('styles.css').replace(/\r\n/g, '\n');

function replaceOnce(label, from, to, target = 'app') {
    const current = target === 'html' ? html : (target === 'styles' ? stylesCss : appJs);
    const count = current.split(from).length - 1;
    if (count !== 1) throw new Error(`[${label}] 锚点匹配 ${count} 处（期望 1 处）`);
    const next = current.replace(from, () => to);
    if (target === 'html') html = next; else if (target === 'styles') stylesCss = next; else appJs = next;
    console.log(`  [ok] ${label}`);
}
function replaceAll(label, from, to, target = 'app') {
    const current = target === 'html' ? html : (target === 'styles' ? stylesCss : appJs);
    const count = current.split(from).length - 1;
    if (count < 1) throw new Error(`[${label}] 锚点匹配 0 处（期望至少 1 处）`);
    const next = current.split(from).join(to);
    if (target === 'html') html = next; else if (target === 'styles') stylesCss = next; else appJs = next;
    console.log(`  [ok] ${label}（${count} 处）`);
}
function replaceBetween(label, start, end, to, target = 'app') {
    const current = target === 'html' ? html : (target === 'styles' ? stylesCss : appJs);
    const from = current.indexOf(start);
    if (from < 0) throw new Error(`[${label}] 找不到起始锚点`);
    const finish = current.indexOf(end, from + start.length);
    if (finish < 0) throw new Error(`[${label}] 找不到结束锚点`);
    const next = current.slice(0, from) + to + current.slice(finish);
    if (target === 'html') html = next; else if (target === 'styles') stylesCss = next; else appJs = next;
    console.log(`  [ok] ${label}`);
}
function assertInlineSafe(label, code, closeTag) {
    if (code.toLowerCase().includes(closeTag)) throw new Error(`${label} 中包含 ${closeTag}，无法安全内联`);
}

/* ---------- 1. 页面结构：移除出题容器与全部生成入口 ---------- */
replaceOnce('页面标题', '<title>学科学情分析系统</title>', '<title>学科学情分析系统 · 一期</title>', 'html');
replaceOnce('移除掌握程度角色标签', '<span class="filter-setup-roletag" id="masterySetupRoleTag">学科组长</span>\n', '', 'html');
replaceBetween('移除智能出题弹窗',
    '    <!-- 智能出题弹窗（mock：各诊断入口共用',
    '    <!-- 学情来源 Modal -->', '', 'html');
replaceOnce('移除共性错题巩固卷入',
`                                    <button type="button" class="btn btn-primary mistake-gen-btn" id="btnGenVariant"
                                        disabled>
                                        <i class="fas fa-wand-magic-sparkles"></i> 生成变式巩固卷
                                    </button>
`, '', 'html');
replaceOnce('移除个人巩固卷入',
`                                            <button type="button" class="btn btn-primary mistake-gen-btn" id="stKpLostGen" disabled>
                                                <i class="fas fa-wand-magic-sparkles"></i> 生成变式巩固卷
                                            </button>
`, '', 'html');
replaceOnce('共性错题注释一期化',
    '<!-- 一期隐藏：共性错题清单（摘要卡 3 下钻目标，二期随卡片一并恢复，去掉 hidden 即可；口径 = 班级得分率 ≤60%，勾选后生成变式巩固卷） -->',
    '<!-- 一期隐藏：共性错题历史数据模块；本分享版不提供题目生成或组卷操作。 -->', 'html');
replaceOnce('个人失分注释一期化',
    '<!-- 个人失分明细（摘要卡 3 下钻：周期内该生有失分记录的考核项，勾选后生成个人巩固卷） -->',
    '<!-- 个人失分明细（当前隐藏）：仅保留历史作答数据，不提供题目生成或组卷操作。 -->', 'html');
replaceOnce('诊断区说明一期化',
    '基于图谱关系聚合 · 顽固薄弱 / 前序断层 / 易混淆 / 题型易错点 / 前后序证据与分目的加练',
    '基于图谱关系聚合 · 顽固薄弱 / 前序断层 / 易混淆 / 题型易错点 / 前后序证据与分组教学建议', 'html');
replaceOnce('综合建议注释一期化',
    '<!-- 综合建议及练习方案：汇总上方各条建议为一周期教学路径与组卷方案（随维度联动刷新） -->',
    '<!-- 综合教学建议：汇总上方建议为一周期教学路径、关注范围与使用场景。 -->', 'html');
replaceOnce('个人综合建议 HTML 注释一期化',
    '<!-- 个人综合建议及练习方案：复用班级版渲染器，scope 与文案为该生口径 -->',
    '<!-- 个人综合教学建议：复用班级版渲染器，关注范围与文案为该生口径。 -->', 'html');
replaceOnce('关联诊断建议按钮',
`                <button type="button" class="btn btn-primary" id="relDiagGenDrill"><i class="fas fa-list-check"></i>
                    生成分目的加练建议</button>`,
`                <button type="button" class="btn btn-primary" id="relDiagGenDrill"><i class="fas fa-list-check"></i>
                    查看分组教学建议</button>`, 'html');
replaceAll('建议抽屉语义一期化', '分目的加练建议', '分组教学建议', 'html');
replaceOnce('移除通用加练入口',
`                <!-- 二期：一键通用加练——合并各目的生成全班通用单卷（题库组卷模拟） -->
                <button type="button" class="btn btn-primary" id="drillMerged"><i class="fas fa-wand-magic-sparkles"></i>
                    一键生成通用加练</button>
`, '', 'html');
replaceOnce('PRD 标识一期化', '学科学情 · 学生追踪-知识点分析 · Markdown 版', '学科学情一期 · 学生追踪-知识点分析 · Markdown 版', 'html');

/* ---------- 1b. 样式：同步删除只服务于出题与组卷的 CSS ---------- */
replaceBetween('移除出题弹窗层级样式',
    '/* 二期：分目的组卷——',
    '.modal-overlay.show {', '', 'styles');
replaceOnce('综合建议样式注释一期化',
    '/* ---- 综合建议及练习方案（汇总卡：教学路径 + 组卷方案，主色标识与单条语义色区分） ---- */',
    '/* ---- 综合教学建议（汇总卡：教学路径 + 关注范围，主色标识与单条语义色区分） ---- */', 'styles');
replaceBetween('移除智能出题样式',
    '/* ---------------- 智能出题弹窗',
    '/* ---------------- 共性错题清单', '', 'styles');
replaceBetween('移除错题巩固卷按钮样式',
    '/* 头部操作区的紧凑主按钮',
    '.mistake-table .ck-cell {', '', 'styles');
replaceBetween('移除建议区组卷按钮样式',
    '/* 二期：目的区「生成练习」',
    '.drill-toggle {', '', 'styles');
replaceBetween('移除图谱出题按钮样式',
    '/* 断层节点详情面板：生成前序补偿练习入口',
    '/* ============================================================\n   学生追踪', '', 'styles');
replaceBetween('移除个人出题按钮样式',
    '/* 详情弹窗：生成个人补偿练习',
    '/* ===== PRD 查看器', '', 'styles');
replaceBetween('移除掌握程度角色标签样式',
    '/* 入口内的角色标签：',
    '.filter-setup:focus-visible {', '', 'styles');

/* ---------- 2. 班级教学建议：只保留诊断直达与建议导出 ---------- */
replaceOnce('移除图谱详情补偿练习按钮',
`        \${!noEv && shownMastery < 60 ? \`<button type="button" class="kg-detail-diag-btn kg-detail-practice-btn" id="kgDetailPracticeBtn" title="沿断层根因链生成前序补偿练习（与断层卡同源）">
            <i class="fas fa-wand-magic-sparkles"></i> 生成前序补偿练习
        </button>\` : ''}
`, '', 'app');
replaceOnce('移除图谱详情补偿练习事件',
`    // 断层节点（掌握度 <60）：生成前序补偿练习入口（与断层卡加练同源，走智能出题弹窗）
    const practiceBtn = document.getElementById('kgDetailPracticeBtn');
    if (practiceBtn) practiceBtn.onclick = () => openPracticeGen('fault', name);
`, '', 'app');
replaceBetween('重写班级教学建议规则',
    'const TEACH_ADVICE_RULES = [',
    'function renderTeachAdvice() {',
`const TEACH_ADVICE_RULES = [
    {
        id: 'stub', tone: 'red', title: '专项突破',
        when: c => c.stubs.length > 0,
        why: c => \`\${c.stubs.length} 个\${dimensionLabel()}命中顽固薄弱（≥3 次失分率 ≥40%）：<b>\${c.stubs.map(k => escapeHTML(k.name)).join('、')}</b>。重复讲题对结构性问题无效，建议安排专项课时。\`,
        actions: [{ label: '查看顽固薄弱', ghost: true, run: () => gotoDiagTab('stub') }]
    },
    {
        id: 'fault', tone: 'orange', title: '前序补偿',
        when: c => c.faults.length > 0,
        why: c => {
            const roots = c.faults.filter(f => f.tr.rootCause);
            const ex = roots.length && roots[0].tr.root ? \`（如「<b>\${escapeHTML(roots[0].tr.root.name)}</b>」）\` : '';
            if (roots.length) return \`\${c.faults.length} 个\${dimensionLabel()}掌握度 &lt;60%，其中 <b>\${roots.length}</b> 个根因在前序\${ex}。直接讲薄弱点无效，须先补前序再讲当前。\`;
            const breaks = c.faults.filter(f => f.tr.breaks.length);
            if (breaks.length) return \`\${c.faults.length} 个\${dimensionLabel()}掌握度 &lt;60%，根因暂未定位：<b>\${breaks.length}</b> 个前置暂无作答证据，须先诊断再归因。\`;
            const cov = c.relCov === null ? '' : \`（前置关系标注覆盖 <b>\${c.relCov}%</b>）\`;
            return \`\${c.faults.length} 个\${dimensionLabel()}掌握度 &lt;60%，前置关系尚未建立\${cov}，暂按同点巩固处理；题库补充标注后自动升级为前序归因。\`;
        },
        actions: [{ label: '查看断层归因', ghost: true, run: () => gotoDiagTab('fault') }]
    },
    {
        id: 'conf', tone: 'amber', title: '成对辨析',
        when: () => confusionData.length > 0,
        why: () => {
            const top = confusionData.slice().sort((a, b) => b.cls - a.cls)[0];
            return \`\${confusionData.length} 对易混淆，最高「<b>\${escapeHTML(top.a)} vs \${escapeHTML(top.b)}</b>」全班 \${top.cls} 人次。建议 10 分钟辨析课 + 学生互讲差异，替代无效刷题。\`;
        },
        actions: [{ label: '查看易混淆', ghost: true, run: () => gotoDiagTab('conf') }]
    },
    {
        id: 'cause', tone: 'red', title: '限时短训',
        when: c => c.causeUp.length > 0,
        why: c => {
            const names = c.causeUp.map(d => \`\${escapeHTML(d.def.name)} +\${d.delta}%\`);
            const shown = names.slice(0, 3).join('、') + (names.length > 3 ? \` 等 <b>\${names.length}</b> 项\` : '');
            return \`错因迁移：<b>\${shown}</b> 占比持续上升。建议安排短时、高频率的针对性讲练，并优先讲解对应错因。\`;
        },
        actions: [{ label: '查看错因分析', ghost: true, run: () => gotoCauseSection() }]
    },
    {
        id: 'maintain', tone: 'green', title: '减量维持',
        when: c => c.achCount > 0,
        why: c => \`<b>\${c.achCount}</b> 个\${dimensionLabel()}已达掌握线（≥\${masteryLevels[0].min}%）。建议转为每周 1 次滚动复测防回退，把课时让给薄弱项。\`,
        actions: [{ label: '查看已达标', ghost: true, run: () => gotoDiagTab('ach') }]
    },
    {
        id: 'relbuild', tone: 'slate', title: '关系建设引导',
        when: c => c.relGaps.length > 0,
        why: c => {
            const top = c.relGaps.slice(0, 3).map(k => \`<b>\${escapeHTML(k.name)}</b>\`).join('、');
            const confTxt = c.confEmpty ? '；易混淆对数据为空，建议同步补充' : '';
            return \`<b>\${c.relGaps.length}</b> 个薄弱\${dimensionLabel()}尚无前置关系标注，前序归因能力受限。建议题库优先标注：\${top}\${confTxt}。\`;
        },
        actions: [{ label: '查看断层归因', ghost: true, run: () => gotoDiagTab('fault') }]
    }
];

`, 'app');
replaceOnce('移除个人关系建设导出标注清单',
    "{ label: '导出标注清单', run: () => stToast('关系标注清单已导出（原型演示）') },",
    '', 'app');
replaceOnce('移除掌握程度角色标签回写',
    "const tag = document.getElementById('masterySetupRoleTag');\n        if (tag) tag.textContent = editable ? role.label : `${role.label}·只读`;\n",
    '', 'app');
replaceOnce('权限态同步注释去角色标签',
    '/* 权限态同步：入口胶囊（图标 / 文案 / 角色标签）+ 弹窗（提示条 / 单选禁用 / 按钮）',
    '/* 权限态同步：入口胶囊（图标 / 文案）+ 弹窗（提示条 / 单选禁用 / 按钮）', 'app');
replaceOnce('PRD 掌握程度入口不回显角色',
    '**入口按角色分级**：学科组长及以上显示齿轮 + 角色标签（可写），学科教师 / 班主任显示锁 + 「只读」标签（仅可查看，悬停提示联系学科组长）；',
    '**入口按角色分级**：学科组长及以上显示齿轮与「设置掌握程度」，学科教师 / 班主任显示锁与「查看掌握程度」（仅可查看，不回显角色，悬停提示联系学科组长）；', 'app');

/* ---------- 3. 综合建议：删除组卷表、题量与综合练习卷 ---------- */
replaceBetween('重写综合教学建议',
    '/* ---------------- 综合建议及练习方案',
    '// 班级版综合建议文案模板',
`/* ---------------- 综合教学建议（教学路径 + 关注范围 + 使用场景） ---------------- */

const ADVICE_PLAN_META = {
    stub: { scene: '专项课时（连排 2 课时）' },
    fault: { scene: '新课前 10 分钟前置补偿' },
    conf: { scene: '课中 10 分钟辨析 + 学生互讲' },
    cause: { scene: '课后短时针对性讲练（隔天 1 次）' },
    gap: { scene: '优先补齐低于班级 10% 的差距项' },
    maintain: { scene: '每周 1 次滚动复测（防回退）' }
};
const ADVICE_PLAN_ORDER = ['fault', 'stub', 'conf', 'cause', 'gap', 'maintain'];

function renderTeachAdviceSummary(items, ctx, opts) {
    const box = document.getElementById((opts && opts.boxId) || 'teachAdviceSummary');
    if (!box) return;
    const planItems = ADVICE_PLAN_ORDER.map(id => items.find(r => r.id === id)).filter(Boolean);
    if (!planItems.length) {
        box.innerHTML = '';
        box.style.display = 'none';
        return;
    }
    box.style.display = '';
    const defaultScopeOf = id => {
        if (id === 'stub') return calcPeriodStats().stubSorted.map(k => k.name);
        if (id === 'maintain') return flattenTree(currentTree(), true).filter(n => masteryOf(n) >= masteryLevels[0].min).map(n => n.name);
        if (id === 'fault') {
            const faults = kgCollectFaults();
            const roots = faults.filter(x => x.tr.rootCause).map(x => x.tr.root.name);
            return roots.length ? roots : faults.map(x => x.node.name);
        }
        if (id === 'conf') return confusionData.slice().sort((a, b) => b.cls - a.cls).slice(0, 3).map(c => \`\${c.a} vs \${c.b}\`);
        if (id === 'cause') {
            const first = causeMatrix[0], last = causeMatrix[causeMatrix.length - 1];
            return CAUSE_DEFS.map((c, i) => ({ name: c.name, delta: last[i] - first[i] })).filter(d => d.delta >= 3).map(d => d.name);
        }
        return [];
    };
    const scopeOf = id => [...new Set(opts && opts.scopeOf ? opts.scopeOf(id) : defaultScopeOf(id))];
    const steps = planItems.map((r, i) =>
        \`<span class="adv-plan-step"><span class="adv-plan-no tone-\${r.tone}">\${i + 1}</span>\${r.title}</span>\`)
        .join('<i class="fas fa-arrow-right adv-plan-arrow"></i>');
    const parts = opts && opts.parts ? opts.parts : buildDefaultAdviceParts(items, ctx);
    const covNote = planItems.some(r => r.id === 'fault') && ctx.relCov !== null && ctx.relCov < 60
        ? \`<div class="adv-summary-cov"><i class="fas fa-circle-info"></i> 前置关系标注覆盖 <b>\${ctx.relCov}%</b> · 前序补偿按同点巩固口径，归因能力受限</div>\`
        : '';
    const rows = planItems.map(r => {
        const scope = scopeOf(r.id);
        const scopeTxt = scope.length
            ? escapeHTML(scope.slice(0, 3).join('、')) + (scope.length > 3 ? \` 等 <b>\${scope.length}</b> 项\` : '')
            : '—';
        return \`<tr>
            <td><span class="adv-plan-dot tone-\${r.tone}"></span>\${r.title}</td>
            <td class="adv-plan-scope" title="\${escapeHTML(scope.join('、'))}">\${scopeTxt}</td>
            <td class="adv-plan-scene">\${ADVICE_PLAN_META[r.id].scene}</td>
        </tr>\`;
    }).join('');
    const summaryTitle = (opts && opts.title) || '综合教学建议';
    box.innerHTML = \`
        <div class="adv-summary-hd">
            <div class="adv-summary-title">\${summaryTitle}</div>
            <div class="adv-summary-sub">将上方 \${planItems.length} 条建议按「先补差、再突破、后巩固」整合为一周期执行建议</div>
        </div>
        \${covNote}
        <div class="adv-plan-path">\${steps}</div>
        <div class="adv-summary-text"><b>综合建议：</b>\${parts.join('；')}。</div>
        <div class="adv-plan-table-wrap">
            <table class="adv-plan-table">
                <thead><tr><th>教学动作</th><th>关注范围</th><th>使用场景</th></tr></thead>
                <tbody>\${rows}</tbody>
            </table>
        </div>
        <div class="adv-summary-actions">
            <button type="button" class="advice-btn ghost" id="btnExportPlan"><i class="fas fa-file-export"></i> 导出建议</button>
        </div>\`;
    const expPlanBtn = box.querySelector('#btnExportPlan');
    if (expPlanBtn) expPlanBtn.onclick = () => showProtoToast('综合教学建议已导出（原型演示）');
}

`, 'app');
replaceBetween('删除全部出题逻辑与 mock 题干',
    '/* ---------------- 智能出题（mock：',
    '/* ---------------- 图谱诊断：标签切换与状态同步',
    '/* ---------------- 图谱诊断：标签切换与状态同步', 'app');

/* ---------- 4. 分组教学建议：保留对象、范围和依据，删除题量及组卷 ---------- */
replaceBetween('重写教学建议目的元数据',
    '// 六种加练目的元数据',
    '/* ---------------- 掌握程度档位',
`// 六类教学建议目的元数据（仅描述教学动作，不包含题量、题型或组卷参数）
const DRILL_PURPOSE_META = {
    diag: { label: '前置诊断', color: '#f59e0b', desc: '前置暂无证据 → 先通过课堂提问、既有作答或面谈确认基础情况' },
    pre: { label: '前置补练', color: '#0891b2', desc: '最弱前置有证据且汇总 <70% → 先补齐当前学习所需的基础' },
    confuse: { label: '概念辨析', color: '#ec4899', desc: '存在易混淆教研标注 → 成对对比讲解与学生互讲，替代无效刷题' },
    solid: { label: '同点巩固', color: '#3b82f6', desc: '前置尚可、当前 <80% → 重点巩固当前知识点本身' },
    next: { label: '后续应用', color: '#22c55e', desc: '个人周期汇总 ≥80% → 通过课堂任务检查迁移并适度提高' },
    retest: { label: '效果验证', color: '#8b5cf6', desc: '补练完成后 → 结合后续课堂反馈或既有任务验证掌握情况' }
};

/* ---------------- 掌握程度档位`, 'app');
replaceBetween('删除组卷蓝图与配比工具',
    '// 目的区题型名（与 PRD 9.4.6 建议规模口径一致）',
    '// 分目的组卷范围：',
    '// 分组教学建议范围：', 'app');
replaceOnce('建议范围注释一期化', '// 分组教学建议范围：// 分目的组卷范围：', '// 分组教学建议范围：');
replaceOnce('全班建议对象说明', '全班共练（名单学生重点关注）', '全班关注（名单学生重点跟进）');
replaceAll('全班建议对象文案', '全班共练', '全班关注');
replaceBetween('重写单个教学建议区',
    'function drillSectionHtml(sec) {',
    '// 复测区：',
`function drillSectionHtml(sec) {
    const md = DRILL_PURPOSE_META[sec.key];
    const scope = drillState.scopes[sec.key] || sec.scope || 'list';
    const cnt = sec.students ? sec.students.length : null;
    const warnHtml = sec.warn ? \`<div class="drill-warn"><i class="fas fa-triangle-exclamation"></i>\${escapeHTML(sec.warn)}</div>\` : '';
    const focus = sec.scopeKps && sec.scopeKps.length ? sec.scopeKps.join('、') : '按课堂诊断结果确定';
    return \`<div class="drill-sec" data-act="\${sec.key}">
        <div class="drill-sec-hd">
            <span class="drill-sec-tag" style="background:\${md.color}">\${md.label}</span>
        </div>
        <div class="drill-sec-desc">\${escapeHTML(md.desc)}</div>
        \${cnt !== null ? \`<div class="drill-scope">
            <label><input type="radio" name="scope_\${sec.key}" value="list" \${scope === 'list' ? 'checked' : ''}> 仅名单学生 \${cnt} 人</label>
            <label><input type="radio" name="scope_\${sec.key}" value="class" \${scope === 'class' ? 'checked' : ''}> 全班关注</label>
        </div>\` : ''}
        \${drillRosterHtml(sec, scope)}
        \${warnHtml}
        <div class="drill-basis">关注范围：\${escapeHTML(focus)}</div>
        <div class="drill-basis">依据：\${escapeHTML(sec.basis)}</div>
    </div>\`;
}

// 效果验证区：`, 'app');
replaceBetween('重写效果验证建议区',
    'function drillRetestHtml(secs) {',
    '// 分目的加练抽屉内容：',
`function drillRetestHtml(secs) {
    if (!secs.length) return '';
    const md = DRILL_PURPOSE_META.retest;
    return \`<div class="drill-sec drill-sec-retest \${drillState.retest ? '' : 'off'}" data-act="retest">
        <div class="drill-sec-hd">
            <span class="drill-sec-tag" style="background:\${md.color}">\${md.label}</span>
            <label class="drill-toggle"><input type="checkbox" id="drillRetestChk" \${drillState.retest ? 'checked' : ''}> 附带效果验证建议</label>
        </div>
        <div class="drill-sec-desc">\${escapeHTML(md.desc)}</div>
        <div class="drill-basis">原题订正只记订正完成，不直接计为掌握；须结合后续表现再次确认。</div>
    </div>\`;
}

// 分组教学建议抽屉内容：`, 'app');
replaceBetween('重写教学建议抽屉主体',
    'function renderDrillBody(name) {',
    '// 抽屉内交互：',
`function renderDrillBody(name) {
    const body = document.getElementById('drillBody');
    if (!body) return;
    const info = kgIndex.byName[name];
    const node = info.node;
    const m = masteryOf(node);
    const st = statusOf(m);
    const ev = evidenceStateOf(name);
    const { secs } = drillSectionsOf(name);
    if (!secs.length) {
        body.innerHTML = \`<div class="drill-empty"><i class="fas fa-circle-check"></i>当前知识点暂无需要分组干预的教学建议<br><em>前置均有证据且达标、周期汇总 ≥80%、无易混淆标注</em></div>\`;
        updateDrillSummary([]);
        return;
    }
    const ownRate = ev.state === 'period'
        ? \`<b style="color:\${st.color}">\${m.toFixed(1)}%</b>（周期内 \${ev.count} 场汇总）\`
        : (ev.state === 'history'
            ? \`<b style="color:\${st.color}">\${ev.rate}%</b>（历史证据 · \${escapeHTML(ev.source)}）\`
            : '<b>—</b>（暂无周期证据）');
    body.innerHTML = \`
        <div class="rd-head">
            <div class="rd-head-top">
                <span class="rd-level">\${['', '一级', '二级', '三级'][node.level]}知识点</span>
                \${evBadgeHtml(ev)}
            </div>
            <h3 class="rd-title">\${escapeHTML(name)} · 分组教学建议</h3>
            <div class="rd-path">\${escapeHTML(info.path)}</div>
            <div class="rd-stats">
                <span>周期汇总 \${ownRate}</span>
                <span>档位 <b>\${st.name}</b></span>
                <span>未掌握 <b>\${node.unmasteredCount || 0}</b> 人</span>
            </div>
            <div class="rd-agg-tip">本页仅输出教学动作、关注范围、建议对象与判定依据，不包含题目内容。</div>
        </div>
        \${secs.map(sec => drillSectionHtml(sec)).join('')}
        \${drillRetestHtml(secs)}
        <div class="drill-summary" id="drillSummary"></div>\`;
    bindDrillBodyEvents(secs);
    updateDrillSummary(secs);
}

// 抽屉内交互：`, 'app');
replaceOnce('移除建议区组卷事件',
`    // 二期：目的区「生成练习」/ 复测区「生成复测卷」→ 分目的组卷（practiceModal 按蓝图出题）
    body.querySelectorAll('.drill-gen-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            if (!btn.disabled && drillTarget) openDrillPaper(drillTarget, btn.dataset.act);
        };
    });
`, '', 'app');
replaceBetween('重写教学建议摘要',
    '// 底部实时计数：',
    'function openDrillDrawer(name, purposeKey) {',
`// 底部摘要：仅汇总建议类别，不输出题量或组卷信息
function updateDrillSummary(secs) {
    const el = document.getElementById('drillSummary');
    if (!el) return;
    if (!secs || !secs.length) {
        el.classList.add('empty');
        el.innerText = '暂无需分组干预的教学建议';
        return;
    }
    el.classList.remove('empty');
    el.innerHTML = \`共 <b>\${secs.length}</b> 类教学建议\${drillState.retest ? ' · 含效果验证' : ''}\`;
}

`, 'app');
replaceBetween('重写教学建议 CSV 导出',
    '// 导出分目的加练建议 CSV',
    '// 复制纯文本建议摘要',
`// 导出分组教学建议 CSV（不包含题量、题型、难度或题目内容）
function exportDrillAdvice() {
    if (!drillTarget || !kgIndex.byName[drillTarget]) return;
    const { secs } = drillSectionsOf(drillTarget);
    if (!secs.length) return;
    const verifyNote = drillState.retest ? '结合后续课堂反馈或既有任务验证掌握情况' : '';
    const rows = [['教学动作', '目标知识点', '关注范围', '建议对象', '学生名单', '判定依据', '效果验证']];
    secs.forEach(sec => {
        const md = DRILL_PURPOSE_META[sec.key];
        const scope = drillState.scopes[sec.key] || sec.scope || 'list';
        const focus = sec.scopeKps && sec.scopeKps.length ? sec.scopeKps.join('、') : '按课堂诊断结果确定';
        rows.push([
            md.label, drillTarget, focus,
            scope === 'class' ? '全班关注' : '仅名单学生',
            sec.students ? sec.students.join('、') : '全班',
            sec.basis, verifyNote
        ]);
    });
    downloadCSV(\`学科学情_分组教学建议_\${drillTarget}.csv\`, rows);
}

// 复制纯文本建议摘要`, 'app');
replaceBetween('重写教学建议复制',
    'function copyDrillAdvice(btn) {',
    'function fallbackCopy(text, done) {',
`function copyDrillAdvice(btn) {
    if (!drillTarget || !kgIndex.byName[drillTarget]) return;
    const { secs, m } = drillSectionsOf(drillTarget);
    if (!secs.length) return;
    const lines = [\`【\${drillTarget} · 分组教学建议】周期汇总 \${m.toFixed(1)}%\`];
    secs.forEach(sec => {
        const md = DRILL_PURPOSE_META[sec.key];
        const scope = drillState.scopes[sec.key] || sec.scope || 'list';
        const roster = sec.students
            ? (scope === 'list' ? \`名单 \${sec.students.length} 人：\${sec.students.join('、')}\` : '全班关注（名单学生重点跟进）')
            : '全班关注';
        const focus = sec.scopeKps && sec.scopeKps.length ? sec.scopeKps.join('、') : '按课堂诊断结果确定';
        lines.push(\`· \${md.label}｜关注范围：\${focus}｜\${roster}\`);
        lines.push(\`  教学建议：\${md.desc}\`);
        lines.push(\`  依据：\${sec.basis}\`);
        if (sec.warn) lines.push(\`  提示：\${sec.warn}\`);
    });
    if (drillState.retest) lines.push('· 效果验证｜结合后续课堂反馈或既有任务确认掌握情况');
    const text = lines.join('\\n');
    const done = () => {
        if (!btn) return;
        const old = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> 已复制';
        setTimeout(() => { btn.innerHTML = old; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
        fallbackCopy(text, done);
    }
}

`, 'app');

/* ---------- 5. 学生端：同步移除个人出题入口 ---------- */
replaceBetween('重写个人教学建议规则',
    '    const ST_KP_ADVICE_RULES = [',
    '    // 直达入口：个人教学建议',
`    const ST_KP_ADVICE_RULES = [
        {
            id: 'stub', tone: 'red', title: '个人专项突破',
            when: c => c.stubs.length > 0,
            why: c => \`<b>\${c.stubs.length}</b> 个\${c.label}命中顽固薄弱（≥3 次失分率 ≥40%）：<b>\${c.stubs.map(k => stEsc(k.node.name)).join('、')}</b>。建议安排个人专项讲练与针对性辅导。\`,
            actions: [{ label: '查看顽固薄弱', ghost: true, run: () => stKpGoto('stKpDiagSection') }]
        },
        {
            id: 'fault', tone: 'orange', title: '前序补偿',
            when: c => c.faults.length > 0,
            why: c => {
                if (c.faultRoots.length) return \`<b>\${c.faults.length}</b> 个\${c.label}掌握度 &lt;\${unmasteredThreshold()}%，其中 <b>\${c.faultRoots.length}</b> 个根因在前序（如「<b>\${stEsc(c.faultRoots[0])}</b>」）。须先补前序再讲当前。\`;
                const cov = c.relCov === null ? '' : \`（前置关系标注覆盖 <b>\${c.relCov}%</b>）\`;
                return \`<b>\${c.faults.length}</b> 个\${c.label}掌握度 &lt;\${unmasteredThreshold()}%，前置关系尚未建立\${cov}，暂按同点巩固处理；题库补充标注后自动升级为前序归因。\`;
            },
            actions: [{ label: '查看断层归因', ghost: true, run: () => stKpGoto('stKpDiagSection') }]
        },
        {
            id: 'conf', tone: 'amber', title: '成对辨析',
            when: c => !c.noData && c.confTop.length > 0,
            why: c => \`\${c.confTop.length} 对易混淆最高「<b>\${stEsc(c.confTop[0].a)} vs \${stEsc(c.confTop[0].b)}</b>」该生 \${c.confTop[0].hits} 次。建议成对辨析并让其自己讲出差别。\`,
            actions: [{ label: '查看易混淆', ghost: true, run: () => stKpGoto('stKpDiagSection') }]
        },
        {
            id: 'gap', tone: 'cyan', title: '追赶班级',
            when: c => !c.noData && c.delta <= -5,
            why: c => \`个人平均得分率 <b>\${c.avgM}%</b> 低于班级平均 <b>\${c.avgC}%</b>（<b>\${c.delta}%</b>）。建议结合失分明细定位拖分\${c.label}，优先补齐低于班级 10% 以上的差距项。\`,
            actions: [
                { label: '导出个人学情单', run: () => stKpExport() },
                { label: '查看失分明细', ghost: true, run: () => stKpGoto('stKpLostSection') }
            ]
        },
        {
            id: 'maintain', tone: 'green', title: '达标维持',
            when: c => !c.noData && c.achCount > 0,
            why: c => \`<b>\${c.achCount}</b> 个\${c.label}已达达标线（≥\${masteryLevels[0].min}%）。建议转为每周 1 次滚动复测防回退，把练习时间让给薄弱项。\`,
            actions: [{ label: '查看达标项', ghost: true, run: () => stKpSwitchView('table') }]
        },
        {
            id: 'relbuild', tone: 'slate', title: '关系建设引导',
            when: c => c.relGaps.length > 0,
            why: c => {
                const top = c.relGaps.slice(0, 3).map(k => \`<b>\${stEsc(k.name)}</b>\`).join('、');
                const confTxt = c.confEmpty ? '；易混淆对数据为空，建议同步补充' : '';
                return \`<b>\${c.relGaps.length}</b> 个薄弱\${c.label}尚无前置关系标注，前序归因能力受限。建议题库优先标注：\${top}\${confTxt}。\`;
            },
            actions: [{ label: '查看断层归因', ghost: true, run: () => stKpGoto('stKpDiagSection') }]
        }
    ];

`, 'app');
replaceOnce('个人综合建议标题', "title: '个人综合练习方案'", "title: '个人综合教学建议'");
replaceOnce('移除个人详情练习按钮定义',
`        const practiceBtn = n.mastery < unmasteredThreshold()
            ? '<button class="st-mb-btn danger" id="stKpModalPractice"><i class="fas fa-wand-magic-sparkles"></i> 生成个人补偿练习</button>'
            : '';
`, "        const practiceBtn = '';\n");
replaceOnce('移除个人详情练习按钮事件',
`        const pBtn = st$('stKpModalPractice');
        if (pBtn) pBtn.onclick = () => {
            const scope = fault && fault.root ? [fault.root.name, n.name] : [n.name];
            stCloseModal();   // 先关详情弹窗：避免双层 overlay 时 Esc 把底层一并关掉
            openPracticeGen('fault', student.name, scope, '个人前序补偿练习');
        };
`, '', 'app');
replaceOnce('移除个人图谱补偿练习按钮',
`            \${mastery < unmasteredThreshold() ? \`<button type="button" class="kg-detail-diag-btn kg-detail-practice-btn" id="stKpKgPracticeBtn" title="沿断层根因链生成个人前序补偿练习（与断层卡同源）">
                <i class="fas fa-wand-magic-sparkles"></i> 生成个人补偿练习</button>\` : ''}
`, '', 'app');
replaceOnce('移除个人图谱补偿练习事件',
`        // 断层节点（个人低于未掌握阈值，随档位联动）：生成个人前序补偿练习（沿根因链，与详情弹窗红钮同源）
        const practiceBtn = st$('stKpKgPracticeBtn');
        if (practiceBtn) practiceBtn.onclick = () => {
            const fault = stKpGraphFaults().find(f => f.node.name === name);
            const scope = fault && fault.root ? [fault.root.name, name] : [name];
            openPracticeGen('fault', stCurrentStudent().name, scope, '个人前序补偿练习');
        };
`, '', 'app');
replaceOnce('个人失分按钮空值保护',
`    function stKpUpdateLostSelInfo() {
        st$('stKpLostSelInfo').textContent = '已选 ' + stKpLostSel.size + ' 项';
        st$('stKpLostGen').disabled = stKpLostSel.size === 0;
    }`,
`    function stKpUpdateLostSelInfo() {
        st$('stKpLostSelInfo').textContent = '已选 ' + stKpLostSel.size + ' 项';
    }`);
replaceOnce('移除个人失分巩固卷事件',
`        st$('stKpLostGen').addEventListener('click', () => {
            if (!stKpLostSel.size) return;
            openPracticeGen('mistake', stCurrentStudent().name, [...stKpLostSel], '个人失分巩固卷');
        });
`, '', 'app');

/* ---------- 6. 全局事件：清理已删除 DOM 的绑定 ---------- */
replaceOnce('移除共性错题按钮状态更新',
`    const btn = document.getElementById('btnGenVariant');
    if (info) info.innerText = \`已选 \${mistakeSel.size} 道\`;
    if (btn) btn.disabled = mistakeSel.size === 0;`,
`    if (info) info.innerText = \`已选 \${mistakeSel.size} 道\`;`);
replaceOnce('移除共性错题巩固卷事件',
`    document.getElementById('btnGenVariant').onclick = () => {
        const kps = [...new Set(mistakeSource().filter(m => mistakeSel.has(m.id)).map(m => m.kp))];
        openPracticeGen('mistake', null, kps);
    };
`, '', 'app');
replaceOnce('移除通用加练事件',
`    // 二期：一键通用加练——合并各目的范围与配额生成全班通用单卷
    document.getElementById('drillMerged').onclick = () => { if (drillTarget) openDrillMerged(drillTarget); };
`, '', 'app');
replaceOnce('Esc 不再处理出题弹窗',
`        if (document.getElementById('practiceModal').classList.contains('show')) closePracticeGen();
        else if (document.getElementById('drillDrawer').classList.contains('open')) closeDrillDrawer();`,
`        if (document.getElementById('drillDrawer').classList.contains('open')) closeDrillDrawer();`);

replaceOnce('个人失分样式注释一期化', '/* ---- 个人失分明细（摘要卡 3 下钻：与卡片同源 lostCnt 聚合，勾选后生成个人巩固卷） ---- */', '/* ---- 个人失分明细（摘要卡 3 下钻：与卡片同源 lostCnt 聚合，一期仅保留历史数据） ---- */');
replaceOnce('个人综合建议注释一期化', '// 个人综合建议及练习方案：复用班级版渲染器（同 HTML/样式/组卷表），覆盖范围与文案为该生口径', '// 个人综合教学建议：复用班级版渲染器，关注范围与文案为该生口径');

/* ---------- 7. 页内 PRD：同步一期边界，隔离旧版本地覆盖 ---------- */
replaceOnce('PRD 本地存储隔离', "const PRD_STORAGE_KEY = 'xkStPrdOverrides_v1';", "const PRD_STORAGE_KEY = 'xkStPrdOverrides_phase1_v1';");
replaceOnce('共性错题事件注释一期化', '// 共性错题清单：全选 / 单选 / 行操作 / 生成变式巩固卷', '// 共性错题清单：全选 / 单选 / 行操作（一期仅保留历史数据）');
replaceOnce('PRD 共性错题边界',
    "'隐藏**共性错题清单**：一期不显示——班级得分率 ≤60% 共性错题八列表格 + 「生成变式巩固卷」（智能出题的失分巩固来源）。'",
    "'**共性错题清单**：当前一期隐藏，仅保留历史错题数据；本分享版不提供题目生成或组卷操作。'");
replaceOnce('PRD 图谱详情边界', '点击节点打开详情面板（关联清单 / 断层警示 / 生成前序补偿练习）', '点击节点打开详情面板（关联清单 / 断层警示 / 前后序关联诊断）');
replaceOnce('PRD 错因建议边界', '教学建议 / 综合方案 / 智能出题同样按规则动态筛选', '教学建议 / 综合教学建议同样按规则动态筛选');
replaceOnce('PRD 个人图谱边界', '根因链标签、生成前序补偿练习、前后序关联诊断', '根因链标签、前后序关联诊断');
replaceBetween('PRD 班级教学建议一期化',
    "        {\n            id: 'XK-09'",
    "        {\n            id: 'XK-10'",
`        {
            id: 'XK-09', group: 'XK', title: '教学建议',
            body: [
                '由一张建议规则表驱动；一期仅输出教学建议、数据依据与诊断直达，不提供题目生成或组卷功能。',
                '',
                '| 规则 | 触发条件 | 建议动作 |',
                '| --- | --- | --- |',
                '| 专项突破 | 存在顽固薄弱 | 安排专项课时，查看顽固薄弱 |',
                '| 前序补偿 | 存在前序断层 | 先补前序再讲当前，查看断层归因 |',
                '| 成对辨析 | 存在易混淆对 | 课中辨析与学生互讲 |',
                '| 限时短训 | 存在显著错因迁移 | 安排短时针对性讲练 |',
                '| 减量维持 | 存在已达标项 | 滚动复测、让出课时 |',
                '| 关系建设引导 | 薄弱项缺少前置关系 | 查看断层归因 |',
                '',
                '- 底部综合教学建议仅包含教学路径、综合建议、关注范围与使用场景，不包含题量、题型配比、试卷方案或题目内容。',
                '- 「导出建议单」当前为演示提示。'
            ].join('\\n')
        },
`, 'app');
replaceBetween('PRD 弹窗与抽屉一期化',
    "        {\n            id: 'XK-12'",
    "        {\n            id: 'ST-01'",
`        {
            id: 'XK-12', group: 'XK', title: '弹窗与抽屉',
            body: [
                '- **XK-12.1 设置掌握程度**：3 档/4 档单选；按角色控制写权限，展示最后保存留痕并模拟并发冲突；确认后班级与学生追踪全量联动。',
                '- **XK-12.2 设置权重（已移除）**：得分率统一由后台默认时间衰减模型聚合。',
                '- **XK-12.3 学情来源**：作业/考试双栏勾选，栏头全选 + 计数；学生追踪同款交互。',
                '- **XK-12.4 一期功能边界**：不包含题目生成、题量配置、题型配比、组卷、保存题库或布置新练习。',
                '- **XK-12.5 关联诊断与分组教学建议**：保留证据四态、前后序关系、学生分组、教学动作、关注范围、建议对象与判定依据；支持复制建议和导出 CSV。',
                '- 效果验证仅提供教学建议，通过后续课堂反馈或既有任务确认，不生成复测题。',
                '- **XK-12.6 题库知识图谱组件接口**：一期保留自研图谱组件，题库组件仅作全屏查看入口；接口与主题契约沿用原需求。',
                '- **治理红线**：无作答证据 = 未知 ≠ 未掌握；前后序关系须经教研确认，未确认前不得作为失分归因事实。'
            ].join('\\n')
        },
`, 'app');
replaceBetween('PRD 个人失分边界',
    "        {\n            id: 'ST-09'",
    "        {\n            id: 'ST-10'",
`        {
            id: 'ST-09', group: 'ST', title: '个人失分明细',
            body: [
                '当前一期隐藏，页面结构保留个人历史失分明细。',
                '- 清单一期仅作历史学情数据保留，不提供个人巩固卷或其他题目生成功能。'
            ].join('\\n')
        },
`, 'app');
replaceBetween('PRD 个人教学建议一期化',
    "        {\n            id: 'ST-10'",
    "        {\n            id: 'ST-11'",
`        {
            id: 'ST-10', group: 'ST', title: '个人教学建议',
            body: [
                '个人口径的教学建议区：把该生当前学科、当前周期的诊断结论汇总成可直接执行的教学动作。一期只给建议、指向与依据，不包含题目内容、组卷或布置练习的入口。',
                '',
                '**数据来源（与上方各诊断模块同源，不独立计算）**',
                '',
                '- 个人平均得分率与达标项计数取自个人树当前维度末级节点的掌握度；',
                '- 顽固薄弱取个人顽固列表（近 3 次及以上考查中失分率 ≥40%），前序断层取个人断层归因结果，易混淆命中次数与易混淆诊断卡同一算法；',
                '- 达标线取「设置掌握程度」最高档下限（默认 80%，随档位切换联动）；',
                '- 统计范围跟随左侧目录关闭状态与范围开关，保证建议里出现的数字与上方摘要卡、诊断卡逐项一致；两处数字不一致即视为缺陷，不是口径差异。',
                '',
                '**六类建议规则**（按规则表逐条判定，命中即出一条，同类只出一条）',
                '',
                '| 建议 | 触发条件 | 依据文案写什么 | 按钮 |',
                '| --- | --- | --- | --- |',
                '| 个人专项突破（红） | 存在顽固薄弱项 | 命中项数量 + 知识点名单 + 说明重复讲题对结构性问题无效 | 查看顽固薄弱（滚动定位诊断区并脉冲高亮） |',
                '| 前序补偿（橙） | 存在掌握度低于未掌握阈值的断层点 | 有根因：断层项数量 + 根因示例，强调先补前序再讲当前；关系未建：按同点巩固处理，并给出前置关系标注覆盖率 | 查看断层归因 |',
                '| 成对辨析（琥珀） | 存在易混淆对，且该学科有演示数据 | 易混对数 + 最严重的一对 + 该生命中次数，提示用成对辨析与学生互讲替代刷题 | 查看易混淆 |',
                '| 追赶班级（青） | 个人均值比班级均值低 5 个百分点及以上 | 个人均值、班级均值、差值，并提示优先补齐低于班级 10% 的差距项 | 导出个人学情单；查看失分明细 |',
                '| 达标维持（绿） | 存在达到达标线的考核项 | 达标项数量 + 当前达标线，建议转每周一次滚动复测，把时间让给薄弱项 | 查看达标项（切表格视图） |',
                '| 关系建设引导（石板灰） | 存在薄弱项，且该项没有任何前置关系标注 | 待标注数量 + 前三个知识点名称 + 易混淆数据为空时追加提示 | 查看断层归因 |',
                '',
                '**空态与例外**',
                '',
                '- 六条全部不命中：显示「该生本周期各项诊断均无异常，按既有节奏推进即可」，底部综合卡同步隐藏；',
                '- 学科无演示数据：显示「该学科知识体系未覆盖，暂无个人教学建议」，区域与综合卡一起隐藏；',
                '- 关系建设引导属于题库数据治理动作，不计入教学动作条数，也不进综合卡的教学动作表。',
                '',
                '**底部 · 个人综合教学建议卡**',
                '',
                '- 与班级版共用同一套结构与样式，只把口径换成该生：标题为「个人综合教学建议」，副标题写明纳入整合的建议条数；',
                '- 教学路径按固定优先级排：前序补偿 → 个人专项突破 → 成对辨析 → 追赶班级 → 达标维持，缺项自动跳过、不占位；',
                '- 综合建议文案按同一顺序串联该生实际命中的动作，只回答「先补什么、再攻什么、最后怎么巩固」；',
                '- 教学动作表三列：教学动作 / 关注范围（顽固项、前序根因、易混对、差距项、达标项，按实际范围取前三项，超出折叠为「等 N 项」）/ 使用场景（专项课时、新课前补偿、课中辨析、优先补齐差距项、每周滚动复测）；',
                '- 前序补偿入表且前置关系标注覆盖率低于 60% 时，卡片顶部提示归因能力受限，说明该条按同点巩固口径处理；',
                '- 卡内「导出建议」为演示提示，不做真实下载。',
                '',
                '**导出与联动**',
                '',
                '- 区域右上「导出建议单」导出该生当前学科、当前周期、当前目录范围下的知识点学情表（CSV：取值范围 / 考察频次 / 个人得分率 / 班级得分率 / 与班级差值 / 个人失分次数 / 掌握程度），无作答证据的行数值列置横线，与主模块表格导出同口径；',
                '- 所有按钮只做三件事：滚动定位并高亮对应诊断区、切换视图、导出数据；一期点不到任何出题、组卷或布置入口。'
            ].join('\\n')
        },
`, 'app');
replaceBetween('PRD 个人详情边界',
    "        {\n            id: 'ST-11'",
    "        {\n            id: 'ST-12'",
`        {
            id: 'ST-11', group: 'ST', title: '详情弹窗（个人口径）',
            body: [
                '- 考核项个人明细弹窗展示学生、层级、路径、个人/班级得分率、掌握程度、断层判定与历史作答证据。',
                '- 操作仅保留关闭、查看错题本、我的作答与原图预览；一期不提供个人题目生成或组卷入口。'
            ].join('\\n')
        },
`, 'app');

/* ---------- 8. 产物级安全校验 ---------- */
const forbidden = [
    'openPracticeGen', 'openDrillPaper', 'openDrillMerged', 'closePracticeGen',
    'renderPracticeConfig', 'renderPracticeResult', 'genMockQuestions', 'mockQuestionOf',
    'PRACTICE_STEM_TPLS', 'PRACTICE_SOURCE_META', 'PURPOSE_BLUEPRINT', 'pgState',
    'practiceModal', 'drillMerged', 'btnGenVariant', 'stKpLostGen',
    'stKpModalPractice', 'stKpKgPracticeBtn', 'kgDetailPracticeBtn', 'drill-gen-btn', 'btnGenMixPlan',
    '生成题目', '生成专项练习', '生成个人专项练习', '生成补偿练习', '生成前序补偿练习',
    '生成个人补偿练习', '生成辨析题组', '生成限时题组', '生成变式巩固卷',
    '一键生成通用加练', '一键生成综合练习卷', '生成复测卷', 'AI 出题中'
];
// replaceBetween 会保留结束锚点；若调用时把结束锚点也写进替换文本，会生成重复选择器并吞掉后续整段 CSS。
const duplicatedCssSelectors = stylesCss.match(/([^\n{}]{1,120}\{)\s*\1/g) || [];
if (duplicatedCssSelectors.length) {
    throw new Error(`样式存在重复选择器（疑似替换污染）：${duplicatedCssSelectors.slice(0, 5).join(' | ')}`);
}
const functionalSource = html + '\n' + appJs + '\n' + stylesCss;
const residues = forbidden.filter(word => functionalSource.includes(word));
if (residues.length) {
    residues.forEach(word => {
        const at = functionalSource.indexOf(word);
        const line = functionalSource.slice(0, at).split('\n').length;
        console.error(`[残留] ${word}（合并源码第 ${line} 行）：${functionalSource.slice(Math.max(0, at - 100), at + word.length + 140).replace(/\n/g, ' ')}`);
    });
    throw new Error(`一期禁用功能残留：${residues.join('、')}`);
}
new vm.Script(appJs, { filename: 'app.phase1.js' });
assertInlineSafe('styles.css', stylesCss, '</style');
assertInlineSafe('app.js', appJs, '</script');

/* ---------- 9. 内联离线资源 ---------- */
const echartsJs = readAsset('echarts.min.js');
assertInlineSafe('echarts.min.js', echartsJs, '</script');
let faCss = readAsset('fa-all.min.css');
assertInlineSafe('fa-all.min.css', faCss, '</style');
faCss = faCss.replace(/@font-face\{[^}]*\}/g, face => {
    if (face.includes('"Font Awesome 6 Free"') || face.includes('"Font Awesome 6 Brands"')) return face;
    return '';
});
if ((faCss.match(/@font-face\{/g) || []).length !== 3) throw new Error('Font Awesome @font-face 保留数异常');
faCss = faCss.replace(/url\(\.\.\/webfonts\/(fa-solid-900|fa-regular-400)\.woff2\)/g,
    (m, name) => `url(data:font/woff2;base64,${b64(name + '.woff2')})`);
if ((faCss.match(/data:font\/woff2/g) || []).length !== 2) throw new Error('Font Awesome 字体内嵌数异常');

let outfitCss = readAsset('outfit-woff2.css');
assertInlineSafe('outfit-woff2.css', outfitCss, '</style');
const outfitUrls = [...new Set([...outfitCss.matchAll(/https:\/\/fonts\.gstatic\.com\/[^\s)]+\.woff2/g)].map(m => m[0]))];
if (outfitUrls.length !== 2) throw new Error('Outfit 字体 URL 数异常');
[[outfitUrls[0], 'outfit-latin-ext.woff2'], [outfitUrls[1], 'outfit-latin.woff2']].forEach(([url, file]) => {
    outfitCss = outfitCss.split(url).join(`data:font/woff2;base64,${b64(file)}`);
});

replaceOnce('内联 styles.css', '<link rel="stylesheet" href="styles.css">', `<style>\n${stylesCss}\n</style>`, 'html');
replaceOnce('内联 Font Awesome',
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">',
    `<style>\n${faCss}\n</style>`, 'html');
replaceOnce('内联 Outfit',
    '<link rel="stylesheet" href="https://fonts.geekzu.org/css2?family=Outfit:wght@400;500;600;700;800&display=swap">',
    `<style>\n${outfitCss}\n</style>`, 'html');
replaceOnce('内联 ECharts',
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
`    <!-- ECharts 5.4.2：一期独立分享版直接内联，无外链依赖 -->
    <script>
${echartsJs}
    </script>`, 'html');
replaceOnce('内联一期 app.js', '<script src="app.js"></script>', `<script>\n${appJs}\n</script>`, 'html');

const now = new Date();
const pad = n => String(n).padStart(2, '0');
const builtAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
const banner = `<!DOCTYPE html>
<!--
  学科学情分析系统 · 一期独立分享版
  构建时间: ${builtAt}
  范围: 学情汇总、知识点分析、学生学情、学生追踪、关联诊断与教学建议。
  边界: 不包含题目生成、组卷配置、mock 题干、保存题库或布置新练习。
  离线: 样式、脚本、ECharts、Font Awesome 与 Outfit 字体全部内联，双击即可打开。
  数据: 原型演示数据；PRD 本地修改使用一期独立 localStorage 命名空间。
-->`;
if (!html.startsWith('<!DOCTYPE html>')) throw new Error('index.html 未以 <!DOCTYPE html> 开头');
html = banner + html.slice('<!DOCTYPE html>'.length);
const leftovers = html.match(/<script src=|<link rel="stylesheet" href="http/g) || [];
if (leftovers.length) throw new Error(`仍残留 ${leftovers.length} 处外部引用`);

const outPath = path.join(ROOT, OUT_NAME);
fs.writeFileSync(outPath, html, 'utf8');
console.log(`\n构建完成: ${OUT_NAME}`);
console.log(`大小: ${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB`);
