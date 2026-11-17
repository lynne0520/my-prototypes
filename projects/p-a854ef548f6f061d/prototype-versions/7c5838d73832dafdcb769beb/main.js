/**
 * 讲评试卷 - 核心交互逻辑 (High-Fidelity)
 */

// =========================
// 0. 线性 SVG 图标（§19：emoji 不作结构图标，与基准蓝色文字链同风格）
// =========================
const IC_ATTR = 'class="ic" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
const IC = {
    chart: `<svg ${IC_ATTR}><path d="M2.5 13.5h11"/><path d="M5 13.5V9M8 13.5V5.5M11 13.5V7.5"/></svg>`,
    plus: `<svg ${IC_ATTR}><path d="M8 3v10M3 8h10"/></svg>`,
    plusSq: `<svg ${IC_ATTR}><rect x="2.5" y="2.5" width="11" height="11" rx="1.5"/><path d="M8 5.5v5M5.5 8h5"/></svg>`,
    link: `<svg ${IC_ATTR}><path d="M6.7 9.3 9.3 6.7"/><path d="M5.4 7.6 4.1 8.9a2.6 2.6 0 0 0 3.7 3.7l1.3-1.3"/><path d="M10.6 8.4l1.3-1.3a2.6 2.6 0 0 0-3.7-3.7L6.9 4.7"/></svg>`,
    expand: `<svg ${IC_ATTR}><path d="M6 2.5H2.5V6M10 2.5h3.5V6M6 13.5H2.5V10M10 13.5h3.5V10"/></svg>`,
    repeat: `<svg ${IC_ATTR}><path d="M13.3 8a5.3 5.3 0 1 1-1.6-3.8"/><path d="M13.3 2.3v3.1h-3.1"/></svg>`,
    sparkle: `<svg ${IC_ATTR}><path d="M8 2.2 9.35 5.65 12.8 7 9.35 8.35 8 11.8 6.65 8.35 3.2 7 6.65 5.65 8 2.2Z"/></svg>`,
    layer: `<svg ${IC_ATTR}><rect x="2.5" y="2.5" width="7.5" height="7.5" rx="1"/><path d="M6 13.5h7.5V6"/></svg>`,
};

// =========================
// 1. 模拟层级数据 (深度优先排序)
// =========================

const knowledgeData = [
    { id: '1', level: 1, type: 'kd', name: '集合与逻辑', questions: '1, 2', avg: 2.5, rate: 85, weight: 12, master: '掌握', weakCount: 2, weakList: '张三, 李四' },
    { id: '1-1', level: 2, type: 'qd', name: '集合的表示方法', questions: '1', avg: 1.2, rate: 65, weight: 6, master: '达标', weakCount: 15, weakList: '多名学生' },
    { id: '1-1-1', level: 3, type: 'ms', name: '列举法与描述法转换', questions: '1', avg: 0.8, rate: 45, weight: 6, master: '未掌握', weakCount: 22, weakList: '陈静等' },
    { id: '2', level: 1, type: 'kd', name: '函数及其性质', questions: '3, 4, 12', avg: 15.2, rate: 72, weight: 25, master: '达标', weakCount: 5, weakList: '五名学生' },
    { id: '2-1', level: 2, type: 'kd', name: '函数的单调性', questions: '3', avg: 8.5, rate: 88, weight: 12, master: '掌握', weakCount: 1, weakList: '王五' },
    { id: '2-2', level: 2, type: 'qd', name: '奇偶性判定', questions: '4, 12', avg: 6.7, rate: 58, weight: 13, master: '未掌握', weakCount: 30, weakList: '多名学生' },
    { id: '3', level: 1, type: 'kd', name: '三角函数', questions: '7, 8, 15', avg: 12.0, rate: 40, weight: 20, master: '未掌握', weakCount: 18, weakList: '刘洋等' },
];

// =========================
// 2. 模拟学生数据
// =========================
const studentData = [
    { name: '赵雨', avg: 21, classRank: 11, gradeRank: 61, star: false, correct: 4, half: 5, wrong: 22, unanswer: 10, score: 21, total: 90 },
    { name: '李赫', avg: 96, classRank: 2, gradeRank: 2, star: true, correct: 35, half: 2, wrong: 3, unanswer: 0, score: 96, total: 90 },
    { name: '王笑天', avg: 56, classRank: 6, gradeRank: 16, star: false, correct: 20, half: 10, wrong: 5, unanswer: 5, score: 56, total: 90 },
    { name: '孙忆枫', avg: 93, classRank: 3, gradeRank: 3, star: true, correct: 32, half: 4, wrong: 2, unanswer: 2, score: 93, total: 90 },
    { name: '周乐心', avg: 44, classRank: 9, gradeRank: 19, star: false, correct: 15, half: 8, wrong: 12, unanswer: 5, score: 44, total: 90 },
    { name: '丁曼容', avg: 21, classRank: 11, gradeRank: 61, star: true, correct: 8, half: 12, wrong: 15, unanswer: 5, score: 21, total: 90 },
    { name: '张三', avg: 30, classRank: 10, gradeRank: 60, star: false, correct: 10, half: 6, wrong: 18, unanswer: 6, score: 30, total: 90 },
    { name: '杨静云', avg: 55, classRank: 7, gradeRank: 17, star: true, correct: 18, half: 10, wrong: 8, unanswer: 4, score: 55, total: 90 },
    { name: '王五', avg: 51, classRank: 8, gradeRank: 17, star: false, correct: 16, half: 9, wrong: 10, unanswer: 5, score: 51, total: 90 },
    { name: '王泽', avg: 91, classRank: 4, gradeRank: 14, star: true, correct: 30, half: 6, wrong: 3, unanswer: 1, score: 91, total: 90 },
    { name: '李四', avg: 85, classRank: 5, gradeRank: 15, star: false, correct: 28, half: 7, wrong: 4, unanswer: 1, score: 85, total: 90 },
    { name: '顾伦', avg: 98, classRank: 1, gradeRank: 1, star: true, correct: 40, half: 0, wrong: 0, unanswer: 0, score: 98, total: 90 },
];

const questionStatuses = [
    'correct', 'correct', 'correct', 'correct', 'half', 'half', 'half', 'half', 'half',
    'wrong', 'wrong', 'wrong', 'wrong', 'wrong', 'wrong', 'wrong', 'wrong', 'wrong',
    'wrong', 'wrong', 'wrong', 'wrong', 'wrong', 'wrong', 'wrong', 'wrong', 'wrong',
    'wrong', 'wrong', 'wrong', 'wrong', 'wrong', 'unanswer', 'unanswer', 'unanswer',
    'unanswer', 'unanswer', 'unanswer', 'unanswer', 'unanswer', 'unanswer', 'unanswer'
];

// =========================
// 3. 全局状态
// =========================
let currentReportType = 'joint';
let currentTableMode = 'all';
let currentStudentIdx = -1;
let isKpExpanded = false;
let isStudentExpanded = false;

// 学生成绩模块状态（当前维度：question | type | student，仅此一处为真源）
let displayColumns = {
    question: {
        examNum: true, eduNum: true, objScore: true, subjScore: true,
        jointRank: true, gradeRank: true, classRank: true, grade: true
    },
    type: {
        examNum: true, eduNum: true, objScore: true, subjScore: true,
        jointRank: true, gradeRank: true, classRank: true, grade: true
    }
};
let objDisplayConfig = { showOption: true, showScore: true };
let isSplitMode = false;

// 关注学生集合
let starredStudents = new Set();

let masteryConfig = {
    // 固定四档掌握程度（不再提供设置入口）：优秀≥90 / 掌握≥80 / 一般≥60 / 未掌握<60
    tiers: [
        { name: '优秀', min: 90, max: 100, color: '#2468f2' },
        { name: '掌握', min: 80, max: 90, color: '#52c41a' },
        { name: '一般', min: 60, max: 80, color: '#fa8c16' },
        { name: '未掌握', min: 0, max: 60, color: '#f5222d' },
    ]
};

function getMasteryTier(rate) {
    const tiers = masteryConfig.tiers;
    for (const t of tiers) {
        if (rate >= t.min) return t;
    }
    return tiers[tiers.length - 1];
}

function getMasteryColor(rate) {
    return getMasteryTier(rate).color;
}

// =========================
// 4. 初始化
// =========================
document.addEventListener('DOMContentLoaded', () => {
    initTopLevelTabs();
    initMainTabs();
    initHierarchyTabs();
    renderKnowledgeTable();
    renderStudentTable();
    initQMReport();
    initPerformanceModule();
    initMistakesTabs();
    renderClassMistakesTable();
    renderStudentMistakesTable();
    initComparisonModule();
    initKnowledgeGraphUpgrade();

    // CDN 兜底：若首屏渲染时 echarts 尚未就绪（本地文件缺失且 CDN 异步加载中），
    // 待脚本回退加载完成后激活着色图谱渲染，避免长期停留在“加载失败”提示
    window.__onEChartsReady = function () {
        if (window.KPGraph) window.KPGraph.activate();
    };

    const kpToggle = document.getElementById('kp-fold-toggle');
    if (kpToggle) {
        kpToggle.onclick = () => {
            isKpExpanded = !isKpExpanded;
            renderKnowledgeTable();
        };
    }
    const studentToggle = document.getElementById('student-fold-toggle');
    if (studentToggle) {
        studentToggle.onclick = () => {
            isStudentExpanded = !isStudentExpanded;
            renderStudentTable();
        };
    }
});

function initTopLevelTabs() {
    const tabs = document.querySelectorAll('.top-level-nav .top-nav-item');
    const contentMap = {
        'lecturing': 'lecturing-tab-content',
        'performance': 'performance-tab-content',
        'mistakes': 'mistakes-tab-content',
        'comparison': 'comparison-tab-content',
    };

    tabs.forEach(tab => {
        tab.onclick = () => {
            const target = tab.dataset.mainTab;
            if (!target) return;

            tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            Object.values(contentMap).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.remove('active');
            });
            const activeId = contentMap[target];
            if (activeId) {
                const activeEl = document.getElementById(activeId);
                if (activeEl) activeEl.classList.add('active');
            }

            if (target === 'lecturing') {
                const currentSubTab = document.querySelector('.tab-nav .tab-item.active');
                if (currentSubTab && currentSubTab.dataset.tab === 'kp-graph') {
                    setTimeout(() => { if (window.KPGraph) window.KPGraph.resize(); }, 200);
                }
            }
        };
    });
}

function initMainTabs() {
    const tabs = document.querySelectorAll('.tab-nav .tab-item');
    const contentMap = {
        'question': 'question-content',
        'type': 'type-content',
        'knowledge': 'knowledge-content',
        'kp-graph': 'kp-graph-content',
    };

    const kpFilter = document.getElementById('kp-filter-group');
    const qmActions = document.getElementById('qm-actions');
    const qmGroupLabel = document.getElementById('qm-group-label');
    const qmViewToggle = document.getElementById('qm-view-toggle');
    const exportReportBtn = document.querySelector('.header-actions .right-buttons .export-btn');

    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            const target = tab.dataset.tab;
            if (!target) return;

            Object.values(contentMap).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.remove('active');
            });
            const activeId = contentMap[target];
            if (activeId) {
                const activeEl = document.getElementById(activeId);
                if (activeEl) activeEl.classList.add('active');
            }

            const isKP = (target === 'knowledge' || target === 'kp-graph');
            if (kpFilter) kpFilter.style.display = isKP ? 'flex' : 'none';

            // 题目明细 / 题型明细：专属操作组（表格·柱状图 + 对比班级 + 导出Excel）；
            // 「导出报表」在这两个页签下让位给「导出Excel」，避免两个导出入口同屏
            const isQm = (target === 'question' || target === 'type');
            if (qmActions) qmActions.style.display = isQm ? 'flex' : 'none';
            if (qmGroupLabel) qmGroupLabel.style.display = (target === 'type') ? 'inline-flex' : 'none';
            if (qmViewToggle) qmViewToggle.style.display = (target === 'type') ? 'none' : 'flex';
            if (exportReportBtn) exportReportBtn.style.display = isQm ? 'none' : '';

            if (target === 'question') {
                renderQuestionDetail();
                // 柱状图容器在隐藏页签内尺寸为 0，回到页签时需重算
                if (qmState.view === 'bar') setTimeout(() => { if (qmChart) qmChart.resize(); }, 80);
            }
            if (target === 'type') renderTypeDetail();

            if (target === 'kp-graph') {
                // 首次进入 tab：容器此前为 display:none，需激活渲染并重算尺寸
                setTimeout(() => { if (window.KPGraph) window.KPGraph.activate(); }, 100);
            }
        };
    });
}

function initHierarchyTabs() {
    const tabs = document.querySelectorAll('.h-tab');
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            currentTableMode = tab.dataset.mode;
            renderKnowledgeTable();
        };
    });
}

function renderKnowledgeTable() {
    const head = document.getElementById('knowledge-table-head');
    const body = document.getElementById('knowledge-table-body');
    const table = document.getElementById('analysis-table');
    if (!head || !body) return;

    if (currentTableMode === 'all') {
        table.classList.add('all-levels-mode');
    } else {
        table.classList.remove('all-levels-mode');
    }

    let h1 = `<tr>`;
    if (currentTableMode === 'all') {
        h1 += `<th>一级知识点</th><th>二级知识点</th><th>三级知识点</th>`;
    } else {
        const labels = { '1': '一级', '2': '二级', '3': '三级' };
        h1 += `<th class="name-col">${labels[currentTableMode]}知识点</th>`;
    }
    h1 += `<th class="num-col">对应题号</th><th>年级平均分</th><th>班级平均分</th><th>年级得分率</th><th>班级得分率</th><th>得分率差值</th><th>班级掌握程度</th><th>未掌握人数</th><th>未掌握名单</th><th class="rel-diag-col">关联诊断</th></tr>`;
    head.innerHTML = h1;

    const filteredData = currentTableMode === 'all' ? knowledgeData : knowledgeData.filter(d => d.level === parseInt(currentTableMode));
    let dataToRender = isKpExpanded ? filteredData : filteredData.slice(0, 10);

    const foldContainer = document.getElementById('kp-fold-container');
    const toggleBtn = document.getElementById('kp-fold-toggle');
    if (foldContainer && toggleBtn) {
        foldContainer.style.display = filteredData.length > 10 ? 'block' : 'none';
        toggleBtn.textContent = isKpExpanded ? '收起 ▲' : '展开 ▼';
    }

    const icons = { 'kd': '知', 'qd': '题', 'ms': '微' };
    body.innerHTML = dataToRender.map(d => {
        let nameCells = '';
        if (currentTableMode === 'all') {
            for (let i = 1; i <= 3; i++) {
                nameCells += d.level === i ? `<td class="name-col"><span class="kd-icon type-${d.type}">${icons[d.type]}</span>${d.name}</td>` : `<td></td>`;
            }
        } else {
            nameCells = `<td class="name-col"><span class="kd-icon type-${d.type}">${icons[d.type]}</span>${d.name}</td>`;
        }
        const classRate = d.rate;
        const gradeRate = Math.round(Math.max(0, Math.min(100, classRate - 5)));
        const classAvg = (d.weight * classRate / 100).toFixed(1);
        const gradeAvg = (d.weight * gradeRate / 100).toFixed(1);
        const rateDiff = (classRate - gradeRate);
        const tier = getMasteryTier(classRate);
        return `<tr>${nameCells}<td>${d.questions}</td><td>${gradeAvg}</td><td>${classAvg}</td><td><span style="color:${getMasteryColor(gradeRate)}">${gradeRate}%</span></td><td><span style="color:${tier.color}">${classRate}%</span></td><td style="color:${rateDiff >= 0 ? '#52c41a' : '#f5222d'}">${rateDiff > 0 ? '+' : ''}${rateDiff}%</td><td style="color:${tier.color}">${tier.name}</td><td>${d.weakCount || '-'}</td><td style="font-size:12px">${d.weakList || '-'}</td><td class="rel-diag-col">${renderRelDiagCell(d.id)}</td></tr>`;
    }).join('');
}

// 知识点图谱三视图（树状图 / 力导向 / 放射）已整体迁移至 kg-graph.js，对外暴露 window.KPGraph

function renderStudentTable() {
    const body = document.getElementById('student-table-body');
    if (!body) return;
    // 「仅显示已关注学生」：按 star 标记过滤演示数据
    const focusOnly = document.getElementById('sa-focus-only-check')?.checked || false;
    const list = focusOnly ? studentData.filter(s => s.star) : studentData;
    let dataToRender = isStudentExpanded ? list : list.slice(0, 10);
    const foldContainer = document.getElementById('student-fold-container');
    const toggleBtn = document.getElementById('student-fold-toggle');
    if (foldContainer && toggleBtn) {
        foldContainer.style.display = list.length > 10 ? 'block' : 'none';
        toggleBtn.textContent = isStudentExpanded ? '收起 ▲' : '展开 ▼';
    }
    body.innerHTML = dataToRender.map((s) => {
        // 用 studentData 真实下标打开弹窗，避免「仅显示已关注学生」过滤后序号错位
        const idx = studentData.indexOf(s);
        const total = s.correct + s.half + s.wrong + s.unanswer;
        return `<tr onclick="openStudentModal(${idx})"><td>${s.name}</td><td>${s.avg}</td><td>${s.classRank}</td><td>${s.gradeRank}</td><td><div class="performance-strip"><div class="strip-segment correct" style="width:${s.correct / total * 100}%"></div><div class="strip-segment half" style="width:${s.half / total * 100}%"></div><div class="strip-segment wrong" style="width:${s.wrong / total * 100}%"></div></div></td></tr>`;
    }).join('');
}

function openStudentModal(idx) {
    currentStudentIdx = idx;
    document.getElementById('student-modal').style.display = 'flex';
    renderLearningPath(idx);
}
function closeStudentModal() { document.getElementById('student-modal').style.display = 'none'; }

// =========================
// 5. 学生成绩页面专用逻辑
// =========================
let currentPerfDimension = 'question'; // 'question' | 'type' | 'student'

const examQuestionTypes = [
    { id: 'choice', name: '选择题', total: 45 },
    { id: 'fill', name: '填空题', total: 20 },
    { id: 'short', name: '简答题', total: 35 },
    { id: 'solve', name: '解答题', total: 50 }
];

// 扩展模拟数据以支持“显示选项”
const perfStudentData = [
    { name: '赵雨', examNum: '2026001', eduNum: 'EDU1001', score: 112, objScore: 45, subjScore: 67, jointRank: 117, gradeRank: 61, classRank: 11, grade: 'B', detailScores: [5, 4, 3, 5, 2, 4, 6, 8, 8, 10, 12, 12, 10, 10, 13], detailOptions: ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C'], typeScores: { choice: 30, fill: 15, short: 24, solve: 43 }, status: 'normal' },
    { name: '顾伦', examNum: '2026012', eduNum: 'EDU1012', score: 148, objScore: 60, subjScore: 88, jointRank: 1, gradeRank: 1, classRank: 1, grade: 'A+', detailScores: [5, 5, 5, 5, 5, 5, 10, 10, 10, 10, 15, 15, 15, 15, 18], detailOptions: ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'], typeScores: { choice: 45, fill: 20, short: 34, solve: 49 }, status: 'normal' },
    { name: '李赫', examNum: '2026002', eduNum: 'EDU1002', score: 142, objScore: 58, subjScore: 84, jointRank: 5, gradeRank: 2, classRank: 2, grade: 'A', detailScores: [5, 5, 4, 5, 5, 4, 10, 9, 10, 10, 14, 15, 14, 15, 17], detailOptions: ['A', 'A', 'B', 'A', 'A', 'B', 'A', 'A', 'B', 'A', 'A', 'B', 'A', 'A', 'B'], typeScores: { choice: 42, fill: 18, short: 33, solve: 49 }, status: 'normal' },
    { name: '杨静云', examNum: '2026008', eduNum: 'EDU1008', score: 105, objScore: 40, subjScore: 65, jointRank: 150, gradeRank: 17, classRank: 7, grade: 'B', detailScores: [4, 4, 3, 4, 2, 3, 7, 7, 8, 9, 10, 11, 10, 11, 12], detailOptions: ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'], typeScores: { choice: 28, fill: 12, short: 22, solve: 43 }, status: 'normal' },
    { name: '王笑天', examNum: '2026003', eduNum: 'EDU1003', score: 126, objScore: 52, subjScore: 74, jointRank: 45, gradeRank: 16, classRank: 6, grade: 'B+', detailScores: [5, 5, 3, 5, 4, 5, 8, 8, 9, 9, 12, 13, 12, 13, 15], detailOptions: ['C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C'], typeScores: { choice: 38, fill: 16, short: 28, solve: 44 }, status: 'normal' },
    { name: '陈默', examNum: '2026015', eduNum: 'EDU1015', score: 0, status: 'unsubmitted' },
    { name: '林星', examNum: '2026020', eduNum: 'EDU1020', score: 0, status: 'unscanned' }
];

function initPerformanceModule() {
    initDimensionToggle(); // 重构:视图切换
    initCustomDropdowns(); // 增强:显示内容配置
    initSearchAndSplit(); // 保留:搜索和拆分小题
    renderDisplayContentDropdown(); // 新增:渲染显示内容下拉面板
    updateToolbarVisibility(); // 新增:更新工具栏可见性
    initExportButton(); // 新增:导出按钮
    initStudentAnswerView(); // 整合:学生作答视图（仅显示已关注学生）
    renderPerformanceTable(); // 重构:渲染表格
}

// 学生作答视图专用交互（SA-01 整合至学生成绩页）
function initStudentAnswerView() {
    const focusCheck = document.getElementById('sa-focus-only-check');
    if (focusCheck) {
        focusCheck.onchange = () => renderStudentTable();
    }
}

// 视图切换逻辑（题目明细 / 题型明细 / 学生作答三态）
function initDimensionToggle() {
    const buttons = document.querySelectorAll('#dimension-toggle .segment-btn');
    buttons.forEach(btn => {
        btn.onclick = () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPerfDimension = btn.dataset.dim;

            // 更新控件显示状态
            updateToolbarVisibility();

            // 切换视图容器显隐（成绩表格 ↔ 学生作答表）
            updatePerfViewVisibility();

            // 重新渲染当前视图
            renderPerfView();
        };
    });
}

function updateToolbarVisibility() {
    const displayContentDropdown = document.getElementById('display-content-dropdown');
    const objDisplayDropdown = document.getElementById('obj-display-dropdown');
    const splitModeLabel = document.getElementById('split-mode-label');
    const saFocusLabel = document.getElementById('sa-focus-label');
    const searchBox = document.querySelector('.perf-toolbar .toolbar-search');

    const isQuestion = currentPerfDimension === 'question';
    const isStudent = currentPerfDimension === 'student';

    // 显示内容 / 搜索：题目、题型视图可用
    displayContentDropdown?.classList.toggle('hidden', isStudent);
    searchBox?.classList.toggle('hidden', isStudent);
    // 客观题显示 / 按拆分小题显示：仅题目明细视图可用
    objDisplayDropdown?.classList.toggle('hidden', !isQuestion);
    splitModeLabel?.classList.toggle('hidden', !isQuestion);
    // 仅显示已关注学生：仅学生作答视图可用
    saFocusLabel?.classList.toggle('hidden', !isStudent);
}

// 成绩表格与分页 ↔ 学生作答表 容器显隐
function updatePerfViewVisibility() {
    const isStudent = currentPerfDimension === 'student';
    const perfSection = document.getElementById('perf-table-section');
    const saSection = document.getElementById('sa-table-section');
    const pagination = document.getElementById('perf-pagination');

    if (perfSection) perfSection.style.display = isStudent ? 'none' : '';
    if (pagination) pagination.style.display = isStudent ? 'none' : '';
    if (saSection) saSection.style.display = isStudent ? '' : 'none';
}

function renderPerfView() {
    if (currentPerfDimension === 'student') {
        renderStudentTable();
    } else {
        renderPerformanceTable();
    }
}

// 显示内容配置下拉面板
function renderDisplayContentDropdown() {
    const panel = document.querySelector('#display-content-dropdown .dropdown-panel');
    if (!panel) return;
    
    const columns = displayColumns[currentPerfDimension];
    if (!columns) return; // 学生作答视图无列配置面板
    const columnLabels = {
        examNum: '考号', eduNum: '新教育号', objScore: '客观题得分',
        subjScore: '主观题得分', jointRank: '联考排名', gradeRank: '级名',
        classRank: '班名', grade: '等级'
    };
    
    let html = '<div style="padding: 12px;">';
    html += '<label style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">';
    html += '<input type="checkbox" id="all-col-check"> 全选</label>';
    html += '<div style="display: flex; flex-direction: column; gap: 6px;">';
    
    Object.keys(columns).forEach(key => {
        html += `<label style="display: flex; align-items: center; gap: 6px;">`;
        html += `<input type="checkbox" class="col-check" data-col="${key}" ${columns[key] ? 'checked' : ''}> ${columnLabels[key]}</label>`;
    });
    
    html += '</div></div>';
    panel.innerHTML = html;
    
    // 绑定事件
    panel.querySelector('#all-col-check').onchange = (e) => {
        Object.keys(columns).forEach(key => columns[key] = e.target.checked);
        panel.querySelectorAll('.col-check').forEach(cb => cb.checked = e.target.checked);
        renderPerformanceTable();
    };
    
    panel.querySelectorAll('.col-check').forEach(cb => {
        cb.onchange = (e) => {
            columns[e.target.dataset.col] = e.target.checked;
            renderPerformanceTable();
        };
    });
}

// 导出按钮
function initExportButton() {
    const exportBtn = document.getElementById('export-btn');
    if (!exportBtn) return;
    
    exportBtn.onclick = (e) => {
        e.stopPropagation();
        // 显示导出下拉菜单
        let menu = document.getElementById('export-dropdown-menu');
        if (!menu) {
            menu = document.createElement('div');
            menu.id = 'export-dropdown-menu';
            menu.className = 'export-dropdown-menu';
            menu.innerHTML = `
                <div class="export-dropdown-item" data-type="by-student">按学生导出成绩单</div>
                <div class="export-dropdown-item" data-type="all">导出全部表格</div>
            `;
            exportBtn.parentElement.style.position = 'relative';
            exportBtn.parentElement.appendChild(menu);
            
            menu.querySelectorAll('.export-dropdown-item').forEach(item => {
                item.onclick = () => {
                    handleExport(item.dataset.type);
                    menu.classList.remove('show');
                };
            });
        }
        menu.classList.toggle('show');
    };
    
    document.addEventListener('click', () => {
        const menu = document.getElementById('export-dropdown-menu');
        if (menu) menu.classList.remove('show');
    });
}

function handleExport(type) {
    if (type === 'by-student') {
        alert('按学生导出成绩单功能(预留接口)');
    } else if (type === 'all') {
        alert('导出全部表格功能(预留接口)');
    }
}

// 切换关注星星
function toggleStar(event, studentName) {
    event.stopPropagation();
    if (starredStudents.has(studentName)) {
        starredStudents.delete(studentName);
    } else {
        starredStudents.add(studentName);
    }
    // 直接切换当前星星的样式，避免重新渲染整个表格
    const starEl = event.target;
    starEl.classList.toggle('starred');
}
function initCustomDropdowns() {
    document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
        trigger.onclick = (e) => {
            e.stopPropagation();
            const parent = trigger.parentElement;
            const isOpen = parent.classList.contains('open');
            // 关闭所有其他下拉
            document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('open'));
            if (!isOpen) parent.classList.add('open');
        };
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('open'));
    });

    document.querySelectorAll('.dropdown-panel').forEach(panel => {
        panel.onclick = (e) => e.stopPropagation();
    });

    // 处理“全选”逻辑
    const allCheck = document.getElementById('all-content-check');
    if (allCheck) {
        allCheck.onchange = () => {
            const checks = document.querySelectorAll('#display-content-dropdown .item-check, #display-content-dropdown .group-check');
            checks.forEach(c => c.checked = allCheck.checked);
            renderPerformanceTable();
        };
    }

    // 处理分组勾选
    document.querySelectorAll('.group-check').forEach(gc => {
        gc.onchange = () => {
            const items = document.querySelectorAll(`.item-check[data-group="${gc.dataset.group}"]`);
            items.forEach(i => i.checked = gc.checked);
            updateAllCheckState();
            renderPerformanceTable();
        };
    });

    // 处理普通项勾选
    document.querySelectorAll('.item-check').forEach(ic => {
        ic.onchange = () => {
            if (ic.dataset.group) {
                const groupCheck = document.querySelector(`.group-check[data-group="${ic.dataset.group}"]`);
                const brotherItems = document.querySelectorAll(`.item-check[data-group="${ic.dataset.group}"]`);
                const allBrotherChecked = Array.from(brotherItems).every(i => i.checked);
                if (groupCheck) groupCheck.checked = allBrotherChecked;
            }
            updateAllCheckState();
            renderPerformanceTable();
        };
    });

    // 客观题显示选项勾选
    document.querySelectorAll('#obj-display-dropdown input').forEach(c => {
        c.onchange = () => {
            const checkedCount = document.querySelectorAll('#obj-display-dropdown input:checked').length;
            if (checkedCount === 0) {
                alert('至少勾选一个');
                c.checked = true;
                return;
            }
            renderPerformanceTable();
        };
    });
}

function updateAllCheckState() {
    const allItems = document.querySelectorAll('#display-content-dropdown .item-check');
    const allChecked = Array.from(allItems).every(i => i.checked);
    const allCheck = document.getElementById('all-content-check');
    if (allCheck) allCheck.checked = allChecked;
}

// 2. 维度切换已重构：见上文 initDimensionToggle（三态：题目明细 / 题型明细 / 学生作答），此处不再重复定义

// 3. 搜索与拆分
function initSearchAndSplit() {
    const searchInput = document.getElementById('stu-search-input');
    if (searchInput) {
        searchInput.oninput = () => renderPerformanceTable();
    }
    const splitCheck = document.getElementById('split-mode-check');
    if (splitCheck) {
        splitCheck.onchange = () => renderPerformanceTable();
    }
}

// 5. 主表格渲染 - 双层表头（支持自适应宽度）
// 表格渲染核心函数
function renderPerformanceTable() {
    const head = document.getElementById('perf-table-head');
    const body = document.getElementById('perf-table-body');
    if (!head || !body) return;
    // 学生作答视图下成绩表隐藏，不重复渲染
    if (currentPerfDimension === 'student') return;

    const query = document.getElementById('stu-search-input')?.value.toLowerCase() || '';
    
    // 学生基础数据
    const baseData = [
        { name: '李怡悦', examNum: '12036', eduNum: '-', score: 57, objScore: 27.5, subjScore: 29.5, jointRank: 5, gradeRank: 1, classRank: 1, grade: 'E' },
        { name: '傅彭薄', examNum: '12038', eduNum: '-', score: 53, objScore: 9, subjScore: 44, jointRank: 6, gradeRank: 2, classRank: 2, grade: 'E' },
        { name: '潘夏彤', examNum: '12037', eduNum: '-', score: 50, objScore: 11.5, subjScore: 38.5, jointRank: 7, gradeRank: 3, classRank: 3, grade: 'E' },
        { name: '段问薇', examNum: '12039', eduNum: '-', score: 48.5, objScore: 4, subjScore: 44.5, jointRank: 8, gradeRank: 4, classRank: 4, grade: 'E' }
    ];
    
    // 过滤数据
    let data = baseData.filter(s => s.name.toLowerCase().includes(query));
    
    // 构建表头
    buildTableHeader(head, baseData[0]);
    
    // 构建数据行
    buildTableBody(body, data);
}

// 构建表头
function buildTableHeader(head, sampleData) {
    const cols = displayColumns[currentPerfDimension];
    let h = '<colgroup>';
    h += '<col class="col-name" style="width: 100px;">';
    
    if (cols.examNum) h += '<col class="col-exam-num" style="width: 80px;">';
    if (cols.eduNum) h += '<col class="col-edu-num" style="width: 100px;">';
    h += '<col class="col-total" style="width: 70px;">';
    if (cols.objScore) h += '<col class="col-obj" style="width: 90px;">';
    if (cols.subjScore) h += '<col class="col-subj" style="width: 90px;">';
    if (cols.jointRank) h += '<col class="col-joint-rank" style="width: 80px;">';
    if (cols.gradeRank) h += '<col class="col-year-rank" style="width: 70px;">';
    if (cols.classRank) h += '<col class="col-class-rank" style="width: 70px;">';
    if (cols.grade) h += '<col class="col-level" style="width: 60px;">';
    
    // 题目明细视图:添加题目列
    if (currentPerfDimension === 'question') {
        const questionCount = 6;
        for (let i = 0; i < questionCount * 2; i++) {
            h += '<col class="score-cell" style="width: 40px;">';
        }
    } else {
        // 题型明细视图:添加题型列
        const questionTypes = ['单选题', '多选题', '填空题', '简答题', '计算题'];
        questionTypes.forEach(() => {
            h += '<col class="type-cell" style="width: 80px;">';
        });
    }
    
    h += '</colgroup>';
    
    // 第一行表头
    h += '<thead><tr>';
    h += '<th rowspan="2" class="sticky-col col-name"><div class="th-name-wrapper"><span>姓名</span><label class="th-checkbox-label"><input type="checkbox" id="focus-only-check"> 只看关注</label></div></th>';
    
    if (cols.examNum) h += '<th rowspan="2" class="num-col col-exam-num sortable" data-sort="examNum">考号 <span class="sort-icon">⇅</span></th>';
    if (cols.eduNum) h += '<th rowspan="2" class="num-col col-edu-num sortable" data-sort="eduNum">新教育号 <span class="sort-icon">⇅</span></th>';
    h += '<th rowspan="2" class="num-col col-total sortable" data-sort="score">总分<br>150 <span class="sort-icon">⇅</span></th>';
    if (cols.objScore) h += '<th rowspan="2" class="num-col sortable" data-sort="objScore">客观题得分 <span class="sort-icon">⇅</span></th>';
    if (cols.subjScore) h += '<th rowspan="2" class="num-col sortable" data-sort="subjScore">主观题得分 <span class="sort-icon">⇅</span></th>';
    if (cols.jointRank) h += '<th rowspan="2" class="num-col sortable" data-sort="jointRank">联考排名 <span class="sort-icon">⇅</span></th>';
    if (cols.gradeRank) h += '<th rowspan="2" class="num-col sortable" data-sort="gradeRank">级名 <span class="sort-icon">⇅</span></th>';
    if (cols.classRank) h += '<th rowspan="2" class="num-col sortable" data-sort="classRank">班名 <span class="sort-icon">⇅</span></th>';
    if (cols.grade) h += '<th rowspan="2" class="num-col sortable" data-sort="grade">等级 <span class="sort-icon">⇅</span></th>';
    
    if (currentPerfDimension === 'question') {
        for (let i = 1; i <= 6; i++) {
            h += `<th colspan="2" class="question-col">${i}</th>`;
        }
    } else {
        const questionTypes = ['单选题', '多选题', '填空题', '简答题', '计算题'];
        questionTypes.forEach(type => {
            h += `<th rowspan="2" class="type-col">${type}<br>10</th>`;
        });
    }
    
    h += '</tr>';
    
    // 第二行表头(仅题目明细视图)
    if (currentPerfDimension === 'question') {
        h += '<tr>';
        for (let i = 1; i <= 6; i++) {
            const showOption = objDisplayConfig.showOption;
            const showScore = objDisplayConfig.showScore;
            
            if (showOption) {
                h += `<th class="sub-th">${['A', 'B', 'C', 'D', 'A', '1'][i-1] || ''}</th>`;
            }
            if (showScore) {
                h += `<th class="sub-th">${[2.5, 2.5, 2.5, 2.5, 2.5, 4][i-1] || ''}</th>`;
            }
        }
        h += '</tr>';
    }
    
    h += '</tr></thead>';
    head.innerHTML = h;
}

// 构建数据行
function buildTableBody(body, data) {
    const cols = displayColumns[currentPerfDimension];
    const showOption = objDisplayConfig.showOption;
    const showScore = objDisplayConfig.showScore;
    
    body.innerHTML = data.map(s => {
        let r = '<tr class="clickable-row">';
        // 姓名列：带关注星星
        const isStarred = starredStudents.has(s.name);
        r += `<td class="name-col sticky-col col-name" title="${s.name}"><span class="perf-star ${isStarred ? 'starred' : ''}" data-student="${s.name}" onclick="toggleStar(event, '${s.name}')">★</span>${s.name}</td>`;
        
        if (cols.examNum) r += `<td class="num-col col-exam-num">${s.examNum}</td>`;
        if (cols.eduNum) r += `<td class="num-col col-edu-num">${s.eduNum}</td>`;
        r += `<td class="total-col col-total">${s.score}</td>`;
        if (cols.objScore) r += `<td class="num-col">${s.objScore}</td>`;
        if (cols.subjScore) r += `<td class="num-col">${s.subjScore}</td>`;
        if (cols.jointRank) r += `<td class="num-col">${s.jointRank}</td>`;
        if (cols.gradeRank) r += `<td class="num-col">${s.gradeRank}</td>`;
        if (cols.classRank) r += `<td class="num-col">${s.classRank}</td>`;
        if (cols.grade) r += `<td class="num-col">${s.grade}</td>`;
        
        // 题目明细或题型明细数据
        if (currentPerfDimension === 'question') {
            const answers = [
                [['A', '2.5'], ['A', '0'], ['A', '0'], ['A', '0'], ['A', '2.5'], ['8', '0']],
                [['B', '0'], ['B', '2.5'], ['B', '0'], ['B', '0'], ['B', '0'], ['6', '0']],
                [['B', '0'], ['B', '2.5'], ['C', '2.5'], ['C', '0'], ['D', '0'], ['6', '0']],
                [['-', '0'], ['-', '0'], ['-', '0'], ['-', '0'], ['-', '0'], ['4', '0']]
            ];
            const studentAnswers = answers[data.indexOf(s)] || [];
            
            studentAnswers.forEach(ans => {
                if (showOption) r += `<td class="score-cell" title="选项">${ans[0]}</td>`;
                if (showScore) r += `<td class="score-cell" title="得分">${ans[1]}</td>`;
            });
        } else {
            // 题型明细数据(模拟)
            const typeScores = [
                [5, 4, 7, 10, 10],
                [4, 4, 5, 9, 8],
                [3, 3, 8, 8, 6],
                [2, 2, 0, 0, 0]
            ];
            const scores = typeScores[data.indexOf(s)] || [];
            scores.forEach(score => {
                r += `<td class="type-cell">${score}</td>`;
            });
        }
        
        r += '</tr>';
        return r;
    }).join('');
}

// =========================
// 6. 本次错题模块逻辑 (模拟数据与渲染)
// =========================

const classMistakeData = [
    { id: '1', score: 5, avg: 3.2, rate: 64, count: 12, list: '张三, 李四, 王五, 赵六, 孙七, 周八, 吴九, 郑十, 陈一, 楚二, 卫三, 蒋四' },
    { id: '3', score: 5, avg: 2.5, rate: 50, count: 15, list: '李赫, 赵雨, 王笑天, 杨静云, 周乐心, 丁曼容, 顾伦, 张三, 李四, 孙忆枫, 周乐心, 丁曼容, 张三, 李四, 王五' },
    { id: '12', score: 10, avg: 4.2, rate: 42, count: 20, list: '陈静, 林星, 马腾, 陆飞, 贺兰, 欧阳, 诸葛, 司马, 夏侯, 尉迟, 独孤, 南宫, 东方, 西门, 上官, 皇甫, 澹台, 公孙, 轩辕, 封腾' },
    { id: '15', score: 15, avg: 8.5, rate: 56, count: 14, list: '王大锤, 刘华强, 封不觉, 叶修, 韩文清, 黄少天, 喻文州, 王杰希, 肖时钦, 楚云秀, 苏沐橙, 江波涛, 周泽楷, 孙翔' }
];

const studentMistakeData = [
    { name: '赵雨', eduNum: 'EDU1001', className: '1班', score: 27, rate: 45, wrongNos: '一、2, 七、20, 三、5, 四、11' },
    { name: '李赫', eduNum: 'EDU1002', className: '1班', score: 42, rate: 70, wrongNos: '二、3, 五、14' },
    { name: '王笑天', eduNum: 'EDU1003', className: '2班', score: 31, rate: 52, wrongNos: '一、2, 三、5, 六、18' },
    { name: '孙忆枫', eduNum: 'EDU1004', className: '2班', score: 39, rate: 65, wrongNos: '三、5, 八、21' },
    { name: '周乐心', eduNum: 'EDU1005', className: '3班', score: 23, rate: 38, wrongNos: '一、2, 七、20, 九、24' },
    { name: '丁曼容', eduNum: 'EDU1006', className: '3班', score: 29, rate: 48, wrongNos: '二、3, 四、11, 五、14' },
    { name: '顾伦', eduNum: 'EDU1012', className: '1班', score: 56, rate: 93, wrongNos: '-' }
];

function initMistakesTabs() {
    const tabs = document.querySelectorAll('#mistake-sub-tabs .tab-item');
    const contentMap = {
        'class': 'class-mistake-content',
        'student': 'student-mistake-content'
    };

    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.dataset.mistakeTab;
            Object.values(contentMap).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
            const activeEl = document.getElementById(contentMap[target]);
            if (activeEl) activeEl.style.display = 'block';

            if (target === 'class') renderClassMistakesTable();
            if (target === 'student') renderStudentMistakesTable();
        };
    });
    
    // 初始化得分率区间筛选
    initRateRangeFilter();
}

// 得分率区间筛选
let rateRangeFilter = { min: 0, max: 60 };

function initRateRangeFilter() {
    const minInput = document.querySelector('.rate-min');
    const maxInput = document.querySelector('.rate-max');
    
    if (minInput) {
        minInput.addEventListener('input', (e) => {
            rateRangeFilter.min = parseInt(e.target.value) || 0;
            renderClassMistakesTable();
        });
    }
    
    if (maxInput) {
        maxInput.addEventListener('input', (e) => {
            rateRangeFilter.max = parseInt(e.target.value) || 100;
            renderClassMistakesTable();
        });
    }
}

function renderClassMistakesTable() {
    const cards = document.getElementById('class-mistake-cards');
    if (!cards) return;
    
    // 根据得分率区间筛选数据
    const filteredData = classMistakeData.filter(d => 
        d.rate >= rateRangeFilter.min && d.rate <= rateRangeFilter.max
    );
    
    if (filteredData.length === 0) {
        cards.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">暂无符合条件的错题数据</div>';
        return;
    }
    
    cards.innerHTML = filteredData.map(d => `
        <article class="mistake-card">
            <div class="mistake-card-head">
                <span class="mistake-card-tag">一、${d.id}</span>
            </div>
            <div class="mistake-card-body">
                <p>本小题没有题干，您可以点击此处来查看本小题的答案和解析。</p>
                <div class="mistake-card-options">
                    <span>A. 选项占位</span>
                    <span>B. 选项占位</span>
                    <span>C. 选项占位</span>
                    <span>D. 选项占位</span>
                </div>
            </div>
            <div class="mistake-card-footer">
                <div class="mistake-card-stats">班级得分率: ${d.rate}% 年级得分率: ${Math.max(0, d.rate - 6)}%</div>
                <div class="mistake-card-actions">
                    <button class="btn btn-outline">${IC.chart} 数据分析</button>
                    <button class="btn btn-outline">${IC.repeat} 添加重练</button>
                    <button class="btn btn-outline">${IC.plusSq} 添加类题</button>
                </div>
            </div>
        </article>
    `).join('');
}

function renderStudentMistakesTable() {
    const body = document.getElementById('student-mistake-body');
    if (!body) return;
    body.innerHTML = studentMistakeData.map(s => `
        <tr>
            <td>${s.name}</td>
            <td>${s.eduNum}</td>
            <td>${s.className}</td>
            <td>${s.score}</td>
            <td style="color: ${getMasteryColor(s.rate)}">${s.rate}%</td>
            <td class="mistake-no-col">${s.wrongNos}</td>
        </tr>
    `).join('');
}

// ========================
// 班级对比模块
// ========================

const classComparisonData = {
    classes: ['1班', '2班', '年级'],
    metrics: {
        '1班': { actualCount: 29, absentCount: 0, maxScore: 696.5, avgScore: 539.5, avgRate: 62.3 },
        '2班': { actualCount: 30, absentCount: 0, maxScore: 650.7, avgScore: 513.5, avgRate: 59.1 },
        '年级': { actualCount: 59, absentCount: 0, maxScore: 696.5, avgScore: 521.2, avgRate: 59.1 }
    }
};

let currentComparisonClass = '1班';
let comparisonCharts = [];

function initComparisonModule() {
    renderComparisonContent();
    initCapsuleToggles();
}

// 胶囊按钮切换
function initCapsuleToggles() {
    document.querySelectorAll('.capsule-toggle').forEach(toggle => {
        const buttons = toggle.querySelectorAll('.capsule-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 这里可以添加切换视图的逻辑
                const viewType = btn.dataset.view;
                const section = toggle.closest('.card-box');
                console.log(`切换到${viewType}视图`);
                // TODO: 根据viewType切换表格/图表显示
            });
        });
    });
}

function renderComparisonContent() {
    renderClassStatsComparison();
    renderClassMistakeComparison();
    renderClassScoreDistribution();
    renderClassWrongDistribution();
}

function renderClassStatsComparison() {
    const container = document.getElementById('class-stats-comparison');
    if (!container) return;

    // 班级成绩数据（按截图）
    const rows = [
        { cls: '年级', actual: 10, absent: 0, max: 69, diff: '', min: 50, avg: 61.8, rate: 61.8, rank: '', excelNum: 0, excelRate: 0, goodNum: 0, goodRate: 0, passNum: 8, passRate: 80, lowNum: 0, lowRate: 0, std: 6.3, tScore: 53.3 },
        { cls: '1班', actual: 5, absent: 0, max: 63, diff: -4.2, min: 50, avg: 57.6, rate: 57.6, rank: 2, excelNum: 0, excelRate: 0, goodNum: 0, goodRate: 0, passNum: 3, passRate: 60, lowNum: 0, lowRate: 0, std: 6.2, tScore: 43.7 },
        { cls: '2班', actual: 5, absent: 0, max: 69, diff: 4.2, min: 63, avg: 66, rate: 66, rank: 1, excelNum: 0, excelRate: 0, goodNum: 0, goodRate: 0, passNum: 5, passRate: 100, lowNum: 0, lowRate: 0, std: 2.5, tScore: 56.3 }
    ];

    let html = `<table class="comparison-table" style="width: 100%; font-size: 13px;">
        <thead>
            <tr>
                <th rowspan="2">班级</th>
                <th rowspan="2">实考人数</th>
                <th rowspan="2">缺考人数</th>
                <th rowspan="2">最高分</th>
                <th rowspan="2">离均差</th>
                <th rowspan="2">最低分</th>
                <th colspan="3">平均分</th>
                <th colspan="2">优秀[90%-100%]</th>
                <th colspan="2">良好[80%-90%)</th>
                <th colspan="2">合格[60%-80%)</th>
                <th colspan="2">低分[0%-30%)</th>
                <th rowspan="2">标准差</th>
                <th rowspan="2">T分数</th>
            </tr>
            <tr>
                <th>平均分</th><th>得分率</th><th>排名</th>
                <th>优秀人数</th><th>优秀率</th>
                <th>良好人数</th><th>良好率</th>
                <th>及格人数</th><th>及格率</th>
                <th>低分人数</th><th>低分率</th>
            </tr>
        </thead><tbody>`;

    rows.forEach(d => {
        html += `<tr>
            <td><strong>${d.cls}</strong></td>
            <td>${d.actual}</td><td>${d.absent}</td><td>${d.max}</td>
            <td>${d.diff === '' ? '' : d.diff}</td><td>${d.min}</td>
            <td style="color: var(--primary-color); font-weight: 600;">${d.avg}</td>
            <td>${d.rate}</td><td>${d.rank === '' ? '' : d.rank}</td>
            <td>${d.excelNum}</td><td>${d.excelRate}</td>
            <td>${d.goodNum}</td><td>${d.goodRate}</td>
            <td>${d.passNum}</td><td>${d.passRate}</td>
            <td>${d.lowNum}</td><td>${d.lowRate}</td>
            <td>${d.std}</td><td>${d.tScore}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

function renderClassMistakeComparison() {
    const container = document.getElementById('class-mistake-comparison');
    if (!container) return;

    const questions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let html = `<table class="comparison-table" style="width: 100%; font-size: 13px;">
        <thead><tr><th>班级</th><th>平均分</th>`;
    questions.forEach(q => html += `<th>${q}</th>`);
    html += `<th>选择题</th><th>填空题</th><th>简答题</th></tr></thead>
        <tbody>
        <tr><td>1班</td><td>539.5</td>
            <td>3</td><td>3</td><td>3</td><td>3</td><td>3</td><td>5</td><td>5</td><td>10</td><td>10</td><td>10</td>
            <td>15</td><td>10</td><td>20</td>
        </tr>
        <tr><td>年级</td><td>521.2</td>
            <td>3</td><td>3</td><td>3</td><td>3</td><td>3</td><td>5</td><td>5</td><td>10</td><td>10</td><td>10</td>
            <td>15</td><td>10</td><td>20</td>
        </tr>
        </tbody></table>`;
    container.innerHTML = html;
}

function renderClassScoreDistribution() {
    const container = document.getElementById('class-score-distribution');
    if (!container) return;
    container.innerHTML = `
    <table class="comparison-table" style="width: 100%; font-size: 13px;">
        <thead>
            <tr>
                <th rowspan="2">班级</th>
                <th colspan="2">[130,150]</th>
                <th colspan="2">[120,130)</th>
                <th colspan="2">[110,120)</th>
            </tr>
            <tr>
                <th>人数</th><th>比例</th>
                <th>人数</th><th>比例</th>
                <th>人数</th><th>比例</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>1班</td><td>8</td><td>27.6%</td><td>10</td><td>34.5%</td><td>7</td><td>24.1%</td></tr>
            <tr><td>2班</td><td>6</td><td>20.0%</td><td>11</td><td>36.7%</td><td>9</td><td>30.0%</td></tr>
            <tr><td>3班</td><td>5</td><td>17.2%</td><td>12</td><td>41.4%</td><td>8</td><td>27.6%</td></tr>
        </tbody>
    </table>`;
}

function renderClassWrongDistribution() {
    const container = document.getElementById('class-wrong-distribution');
    if (!container) return;
    container.innerHTML = `
    <table class="comparison-table" style="width: 100%; font-size: 13px;">
        <thead>
            <tr>
                <th rowspan="2">班级</th>
                <th colspan="2">前10名(<=10名)</th>
                <th colspan="2">前20名(<=20名)</th>
                <th colspan="2">前50名(<=50名)</th>
            </tr>
            <tr>
                <th>人数</th><th>比例</th>
                <th>人数</th><th>比例</th>
                <th>人数</th><th>比例</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>1班</td><td>3</td><td>10.3%</td><td>8</td><td>27.6%</td><td>17</td><td>58.6%</td></tr>
            <tr><td>2班</td><td>2</td><td>6.7%</td><td>7</td><td>23.3%</td><td>16</td><td>53.3%</td></tr>
            <tr><td>3班</td><td>1</td><td>3.4%</td><td>5</td><td>17.2%</td><td>14</td><td>48.3%</td></tr>
        </tbody>
    </table>`;
}

// ============================================================
// 6. 知识图谱关系升级（3.0 原型）
//    说明：以下知识关系 / 证据 / 题目均为模拟教研标注数据，
//    暂未接入真实题库与作答数据。
//    证据状态 evidence：
//      exam    = 本次作业有独立考查（有作答证据）
//      none    = 暂无作答证据（待诊断；代表"未知"，不代表"未掌握"）
// ============================================================

// ---------- 6.1 关联知识点池（本次未考查的图谱扩展节点） ----------
const KP_RELATION_NODES = {
    'F-set-concept':  { name: '集合的概念',               evidence: 'none' },
    'F-func-domain':  { name: '函数的概念与定义域',       evidence: 'none' },
    'F-sym-domain':   { name: '定义域关于原点对称的判定', evidence: 'none' },
    'F-fx-compare':   { name: 'f(-x) 与 f(x) 的计算比较', evidence: 'none' },
    'F-angle-radian': { name: '任意角与弧度制',           evidence: 'none' },
    'F-unit-circle':  { name: '单位圆与三角函数定义',     evidence: 'none' },
    'C-mono-parity':  { name: '单调性与奇偶性概念辨析',   evidence: 'none', kind: 'confuse' },
    'N-set-ops':      { name: '集合的运算',               evidence: 'exam',    rate: 78, questions: '2' },
    'N-parity-param': { name: '利用奇偶性求参数',         evidence: 'none' },
    'N-parity-ineq':  { name: '利用奇偶性解不等式',       evidence: 'none' },
    'N-asinox':       { name: '函数 y=Asin(ωx+φ) 的图象', evidence: 'none', unlearned: true },
    'N-identity':     { name: '三角恒等变换',             evidence: 'none', unlearned: true },
};

// ---------- 6.2 知识点关系（模拟教研标注） ----------
// prev = 前序（前置 → 当前）；next = 后序（当前 → 后续）；confuse = 易混淆
const KP_RELATIONS = {
    '1-1':   { prev: ['F-set-concept'], next: ['N-set-ops'], confuse: [] },
    '1-1-1': { prev: ['F-set-concept'], next: ['N-set-ops'], confuse: [] },
    '2-1':   { prev: ['F-func-domain'], next: ['2-2'],       confuse: [] },
    '2-2':   { prev: ['F-func-domain', 'F-sym-domain', 'F-fx-compare'], next: ['N-parity-param', 'N-parity-ineq'], confuse: ['C-mono-parity'] },
    '3':     { prev: ['F-angle-radian', 'F-unit-circle'], next: ['N-asinox', 'N-identity'], confuse: [] },
};

// ---------- 6.3 学生分组证据（四类处理路径，模拟数据） ----------
const KP_STUDENT_GROUPS = {
    '2-2': {
        diag:  { students: ['赵雨', '张三', '周乐心', '傅彭薄'], reason: '当前失分，且前置「定义域关于原点对称」等暂无作答证据，先诊断再决定' },
        solid: { students: ['杨静云', '王五', '李四', '潘夏彤'], reason: '前置暂无证据，重点巩固奇偶性判定本身' },
        next:  { students: ['顾伦', '李赫', '孙忆枫', '王泽'], reason: '本知识点表现稳定，可安排「利用奇偶性求参数」应用' },
    },
    '3': {
        diag:  { students: ['赵雨', '丁曼容', '张三', '周乐心'], reason: '当前失分，且前置「单位圆与三角函数定义」暂无作答证据' },
        solid: { students: ['李四', '王笑天', '傅彭薄', '段问薇', '潘夏彤'], reason: '前置暂无证据，重点巩固三角函数定义与同角关系' },
        next:  { students: ['顾伦', '李赫', '孙忆枫', '王泽'], reason: '本次表现稳定；后续内容未学，仅随堂衔接' },
    },
    '1-1-1': {
        diag:  { students: [], reason: '前置「集合的概念」暂无作答证据，无需前置诊断' },
        solid: { students: ['陈静', '赵雨', '张三', '周乐心', '丁曼容'], reason: '列举法与描述法转换得分率 45%，理解性错误居多，需同点巩固' },
        next:  { students: ['李赫', '顾伦'], reason: '本次表现稳定，可尝试「集合的运算」综合应用' },
    },
};

// ---------- 6.4 分目的加练题库（模拟） ----------
function dq(id, type, diff, minutes, stem, purpose, reason) {
    return { id, type, diff, minutes, stem, purpose, reason };
}
const DRILL_BANK = {
    diag: { // 前置诊断：针对"暂无作答证据"的前置
        'F-sym-domain':  [dq('D-01', '单选题', '基础', 3, '函数 f(x)=√(x²-1) 的定义域是否关于原点对称？请说明判断依据。', '检查「定义域关于原点对称」的理解', '奇偶性判定的前置条件，本次无独立考查记录')],
        'F-fx-compare':  [dq('D-02', '填空题', '基础', 4, '已知 f(x)=x³+mx，计算 f(-x) 并与 f(x) 比较，写出你依据的判定步骤。', '检查 f(-x) 与 f(x) 的计算比较', '奇偶性判定的直接前置操作，暂无作答证据')],
        'F-unit-circle': [dq('D-03', '单选题', '基础', 3, '角 α 终边经过点 P(-1/2, √3/2)，则 sinα·cosα = ?', '检查单位圆与三角函数定义', '第7、8题共同前置，暂无作答证据')],
    },
    confuse: { // 概念辨析
        '2-2': [dq('C-01', '单选题', '中档', 4, '下列说法正确的是：A. 奇函数一定单调；B. 偶函数图象一定过原点；C. 奇函数图象关于原点对称；D. 单调函数必为奇或偶函数。', '辨析「单调性与奇偶性」概念', '本次第4、12题失分以概念混淆为主')],
    },
    solid: { // 同点巩固：当前知识点类题
        '2-2': [
            dq('S-21', '单选题', '中档', 4, '判断函数 f(x)=x³+sinx 的奇偶性，并说明理由。', '巩固奇偶性判定（定义法）', '当前得分率 58%，前置尚可的学生优先练判定本身'),
            dq('S-22', '解答题', '中档', 6, '已知奇函数 f(x) 在区间 [1,4] 上单调递减，比较 f(-2) 与 f(-3) 的大小。', '巩固奇偶性与单调性综合应用', '第4、12题失分集中在概念混淆与综合应用'),
        ],
        '3': [
            dq('S-31', '单选题', '基础', 3, '已知 sinα=1/3 且 α∈(π/2, π)，则 cosα = ?', '巩固同角三角函数关系', '三角函数本次得分率 40%，先补基础计算'),
            dq('S-32', '解答题', '中档', 8, '已知 tanα=2，求 (sinα+cosα)/(sinα-cosα) 的值。', '巩固同角关系与齐次式计算', '第7、8题失分集中于定义与同角变换'),
        ],
        '1-1-1': [dq('S-11', '单选题', '基础', 3, '用描述法表示集合：大于 1 且小于 5 的全体实数。', '巩固列举法与描述法转换', '当前得分率 45%，理解性错误居多')],
    },
    next: { // 后续应用：当前掌握稳定后的迁移
        '2-2': [dq('N-21', '解答题', '中档', 8, '已知 f(x) 是奇函数，当 x>0 时 f(x)=x²+1，求 x<0 时 f(x) 的解析式。', '检查「利用奇偶性求解析式」的迁移应用', '奇偶性判定掌握稳定后的后续应用')],
        '2-1': [dq('N-11', '解答题', '中档', 7, '已知 f(x)=x³-ax 在 R 上单调递增，求 a 的取值范围。', '单调性与参数综合应用', '函数单调性掌握稳定（88%），可安排综合应用')],
    },
    retest: { // 复测：换情境新题，用于验证掌握
        '2-2': [dq('R-21', '单选题', '中档', 4, '（复测·换情境）判断函数 f(x)=x|x| 的奇偶性并说明理由。', '复测：奇偶性判定（换情境新题）', '原题订正只记「订正完成」，不计为掌握，需换情境新题验证')],
        '3':   [dq('R-31', '填空题', '基础', 3, '（复测·换情境）已知 cosα=-1/2，α∈(π, 3π/2)，则 sinα = ?', '复测：三角函数定义与同角关系', '补练完成后验证，通过方可进入后续衔接')],
    },
};

const PURPOSE_META = {
    diag:    { label: '前置诊断', color: '#fa8c16', desc: '前置暂无证据 → 用少量小题判断是否需要补基础' },
    confuse: { label: '概念辨析', color: '#eb2f96', desc: '易混淆概念 → 成对对比练习' },
    solid:   { label: '同点巩固', color: '#2468f2', desc: '当前偏弱 → 巩固当前知识本身' },
    next:    { label: '后续应用', color: '#52c41a', desc: '当前表现稳定 → 检查迁移、适度提高' },
    retest:  { label: '复测验证', color: '#9254de', desc: '补练完成后 → 同目标、换情境新题验证掌握' },
};

// ---------- 6.5 关系解析 ----------
function parentOfKp(id) {
    const parts = String(id).split('-');
    return parts.length > 1 ? parts.slice(0, -1).join('-') : null;
}

function resolveRelNode(rid) {
    const kp = knowledgeData.find(k => k.id === rid);
    if (kp) return { rid, name: kp.name, kind: 'exam', evidence: 'exam', rate: kp.rate, level: kp.level, questions: kp.questions };
    const def = KP_RELATION_NODES[rid];
    if (def) return {
        rid, name: def.name,
        kind: def.kind || (def.evidence === 'exam' ? 'exam' : 'ext'),
        evidence: def.evidence, rate: def.rate,
        examName: def.examName, questions: def.questions, unlearned: def.unlearned,
    };
    return null;
}

function relationsFor(kpId) {
    if (KP_RELATIONS[kpId]) {
        const r = KP_RELATIONS[kpId];
        return { prev: r.prev.slice(), next: r.next.slice(), confuse: r.confuse.slice(), aggregated: false };
    }
    // 一 / 二级知识点：聚合子孙关系（剔除模块内自关联）
    const prev = new Set(), next = new Set(), confuse = new Set();
    knowledgeData.forEach(k => {
        if (k.id === kpId || !String(k.id).startsWith(kpId + '-')) return;
        const r = KP_RELATIONS[k.id];
        if (!r) return;
        r.prev.forEach(x => { if (!String(x).startsWith(kpId + '-') && x !== kpId) prev.add(x); });
        r.next.forEach(x => { if (!String(x).startsWith(kpId + '-') && x !== kpId) next.add(x); });
        r.confuse.forEach(x => confuse.add(x));
    });
    if (!prev.size && !next.size && !confuse.size) return null;
    return { prev: [...prev], next: [...next], confuse: [...confuse], aggregated: true };
}

function relCountFor(kpId) {
    const r = relationsFor(kpId);
    return r ? { prev: r.prev.length, next: r.next.length, confuse: r.confuse.length } : null;
}

function renderRelDiagCell(kpId) {
    const c = relCountFor(kpId);
    if (!c) return '<span class="rel-none">—</span>';
    const tip = `前序 ${c.prev} · 后序 ${c.next}` + (c.confuse ? ` · 易混淆 ${c.confuse}` : '');
    return `<button type="button" class="rel-diag-btn" title="${tip}" onclick="openDiagModal('${kpId}')">${IC.link} 关联诊断<span class="rel-diag-sub">前${c.prev}·后${c.next}</span></button>`;
}

function evBadgeHtml(node) {
    if (node.evidence === 'exam') return '<span class="ev-badge ev-exam">本次考查</span>';
    if (node.unlearned) return '<span class="ev-badge ev-unlearned">未学·仅衔接</span>';
    return '<span class="ev-badge ev-none">待诊断</span>';
}

function evDetailHtml(node) {
    if (node.evidence === 'exam') return `本次得分率 <b style="color:${getMasteryColor(node.rate)}">${node.rate}%</b>${node.questions ? ` · 题${node.questions}` : ''}`;
    if (node.unlearned) return '教学进度未学，只做课堂衔接预告，不建议加练';
    return '暂无作答证据 —— 代表"未知"，不代表未掌握';
}

// ---------- 6.6 关联诊断弹窗 ----------
let diagModalKpId = null;

function openDiagModal(kpId, focusRelId) {
    const kp = knowledgeData.find(k => k.id === kpId);
    if (!kp) return;
    diagModalKpId = kpId;
    closeDrillModal();
    closeBasketDrawer(); // 诊断抽屉与题篮抽屉互斥，避免重叠遮挡
    const rel = relationsFor(kpId);
    const tier = getMasteryTier(kp.rate);
    const levelNames = { 1: '一级知识点', 2: '二级知识点', 3: '三级知识点' };

    let html = `
    <div class="diag-kp-head">
        <div class="diag-kp-title">
            <span class="diag-level-badge">${levelNames[kp.level] || ''}</span>
            <span class="diag-kp-name">${kp.name}</span>
        </div>
        <div class="diag-kp-evidence">
            <span>本次证据：题${kp.questions}</span>
            <span>班级得分率 <b style="color:${tier.color}">${kp.rate}%（${tier.name}）</b></span>
            <span>未掌握 <b>${kp.weakCount || 0}</b> 人</span>
        </div>
    </div>`;

    if (!rel) {
        html += '<div class="diag-empty">该知识点暂无经教研标注的前序 / 后序关系（原型模拟数据）。</div>';
    } else {
        if (rel.aggregated) html += '<div class="diag-agg-note">以下关联由子知识点关系汇总而来（一 / 二级知识点聚合展示）。</div>';

        html += `<div class="diag-section"><div class="diag-sec-title">前序（前置知识） · ${rel.prev.length}</div>`;
        if (!rel.prev.length) html += '<div class="diag-empty">暂无前置关联</div>';
        rel.prev.forEach(rid => { html += diagRelRow(rid, 'prev', kp); });
        html += '</div>';

        if (rel.confuse.length) {
            html += `<div class="diag-section"><div class="diag-sec-title">易混淆关联 · ${rel.confuse.length}</div>`;
            rel.confuse.forEach(rid => { html += diagRelRow(rid, 'confuse', kp); });
            html += '</div>';
        }

        html += `<div class="diag-section"><div class="diag-sec-title">后序（后续知识） · ${rel.next.length}</div>`;
        if (!rel.next.length) html += '<div class="diag-empty">暂无后续关联</div>';
        rel.next.forEach(rid => { html += diagRelRow(rid, 'next', kp); });
        html += '</div>';

        html += buildDiagGroups(kpId);
    }

    html += '<div class="diag-redline"><b>判断边界：</b>综合题失分 ≠ 所有关联知识点薄弱；班级均值偏低 ≠ 人人有问题；无证据 = 未知，需先诊断。数据为原型模拟。</div>';
    html += `<div class="diag-foot">
        <button type="button" class="btn btn-outline" onclick="closeDiagModal()">关闭</button>
        ${rel ? `<button type="button" class="primary-btn" onclick="openDrillModal('${kpId}')">生成分目的加练建议</button>` : ''}
    </div>`;

    document.getElementById('diag-modal-title').textContent = `关联诊断 · ${kp.name}`;
    document.getElementById('diag-modal-body').innerHTML = html;
    document.getElementById('diag-modal').classList.add('open'); // 右侧抽屉滑入
    if (focusRelId) {
        const el = document.getElementById('diag-row-' + focusRelId);
        if (el) {
            el.scrollIntoView({ block: 'center' });
            el.classList.add('highlight');
            setTimeout(() => el.classList.remove('highlight'), 2400);
        }
    }
}

function diagRelRow(rid, type, kp) {
    const node = resolveRelNode(rid);
    if (!node) return '';
    const relChip = type === 'prev'
        ? '<span class="rel-chip prev">前置</span>'
        : type === 'next' ? '<span class="rel-chip next">后续</span>' : '<span class="rel-chip confuse">易混淆</span>';
    let actions = '';
    if (type === 'prev') {
        if (node.evidence === 'none' && !node.unlearned) {
            actions = `<button type="button" class="btn btn-outline btn-sm" onclick="openDrillModal('${kp.id}', 'diag', '${rid}')">诊断题预览</button>
                       <button type="button" class="btn btn-outline btn-sm" onclick="quickAddDiag('${kp.id}', '${rid}')">加入前置诊断</button>`;
        } else if (node.evidence === 'exam') {
            actions = `<button type="button" class="btn btn-outline btn-sm" onclick="openDiagModal('${rid}')">查看该知识点诊断</button>`;
        } else {
            actions = '<span class="diag-ok">前置表现尚可，暂无需补练</span>';
        }
    } else if (type === 'next') {
        if (node.unlearned) {
            actions = '<span class="diag-ok">未学内容，仅课堂衔接预告，不布置加练</span>';
        } else if (node.evidence === 'exam') {
            actions = `<button type="button" class="btn btn-outline btn-sm" onclick="openDiagModal('${rid}')">查看该知识点诊断</button>`;
        } else {
            actions = `<span class="diag-ok">当前掌握后再安排</span> <button type="button" class="btn btn-outline btn-sm" onclick="openDrillModal('${kp.id}', 'next')">选后续应用题</button>`;
        }
    } else {
        actions = `<button type="button" class="btn btn-outline btn-sm" onclick="openDrillModal('${kp.id}', 'confuse')">辨析题预览</button>`;
    }
    return `<div class="diag-row" id="diag-row-${rid}">
        <div class="diag-row-main">
            ${relChip}
            <span class="diag-node-name">${node.name}</span>
            ${evBadgeHtml(node)}
            <span class="diag-node-detail">${evDetailHtml(node)}</span>
        </div>
        <div class="diag-row-actions">${actions}</div>
    </div>`;
}

function buildDiagGroups(kpId) {
    const g = KP_STUDENT_GROUPS[kpId];
    if (!g) return '';
    const order = ['diag', 'solid', 'next'];
    let html = '<div class="diag-section"><div class="diag-sec-title">学生分组建议（按知识点作答证据，非总分分层）</div><div class="diag-group-grid">';
    order.forEach(p => {
        const meta = PURPOSE_META[p];
        const grp = g[p];
        const chips = grp.students.length
            ? grp.students.map(s => `<span class="student-chip">${s}</span>`).join('')
            : `<span class="diag-ok">${grp.reason}</span>`;
        const btn = grp.students.length
            ? `<button type="button" class="btn btn-outline btn-sm" onclick="openDrillModal('${kpId}', '${p}')">生成本组加练</button>`
            : '';
        html += `<div class="diag-group-card">
            <div class="diag-group-head"><span class="purpose-badge" style="background:${meta.color}">${meta.label}</span>${btn}</div>
            <div class="diag-group-chips">${chips}</div>
            <div class="diag-group-reason">${grp.reason}</div>
        </div>`;
    });
    html += '</div></div>';
    return html;
}

function closeDiagModal() {
    const m = document.getElementById('diag-modal');
    if (m) m.classList.remove('open'); // 抽屉滑出
}

function quickAddDiag(kpId, rid) {
    const node = resolveRelNode(rid);
    const qs = (DRILL_BANK.diag[rid] || []).map(q => Object.assign({}, q));
    const kp = knowledgeData.find(k => k.id === kpId);
    if (!qs.length) { showToast('该前置暂无诊断题（原型模拟）'); return; }
    const grp = (KP_STUDENT_GROUPS[kpId] || {}).diag;
    addToBasket({ purpose: 'diag', kpId, kpName: kp.name, scope: 'list', students: grp ? grp.students : [], questions: qs, retest: null });
    showToast(`已加入题篮：前置诊断「${node.name}」${qs.length} 题`);
}

// ---------- 6.7 分目的加练弹窗 ----------
let drillModalKpId = null;
let drillQuestionMap = {};
const DRILL_PURPOSE_ORDER = ['diag', 'confuse', 'solid', 'next'];

function drillQuestionsFor(kpId, purpose) {
    if (purpose === 'confuse' || purpose === 'solid' || purpose === 'next') {
        return (DRILL_BANK[purpose][kpId] || []).map(q => Object.assign({}, q));
    }
    const rel = relationsFor(kpId);
    if (!rel) return [];
    const out = [];
    rel.prev.forEach(rid => {
        const node = resolveRelNode(rid);
        if (!node) return;
        if (purpose === 'diag' && node.evidence === 'none' && !node.unlearned) {
            (DRILL_BANK.diag[rid] || []).forEach(q => out.push(Object.assign({}, q, { target: node.name })));
        }
    });
    return out;
}

function openDrillModal(kpId, focusPurpose, focusRelId) {
    const kp = knowledgeData.find(k => k.id === kpId);
    if (!kp) return;
    drillModalKpId = kpId;
    closeDiagModal();
    drillQuestionMap = {};
    let html = '';
    DRILL_PURPOSE_ORDER.forEach(p => {
        const qs = drillQuestionsFor(kpId, p);
        if (!qs.length) return;
        const meta = PURPOSE_META[p];
        const grp = (KP_STUDENT_GROUPS[kpId] || {})[p];
        const students = grp && grp.students.length ? grp.students : [];
        const scopeDefault = students.length ? 'list' : 'all';
        qs.forEach(q => { drillQuestionMap[q.id] = q; });
        const warn = (p === 'next' && kp.rate < 80)
            ? `<span class="drill-warn">当前得分率 ${kp.rate}%，建议先完成同点巩固</span>` : '';
        html += `<div class="drill-purpose" data-purpose="${p}">
            <div class="drill-purpose-head">
                <span class="purpose-badge" style="background:${meta.color}">${meta.label}</span>
                <span class="drill-purpose-desc">${meta.desc}</span>
                ${warn}
                <label class="drill-scope">布置范围
                    <select class="drill-scope-select" data-purpose="${p}">
                        <option value="list" ${scopeDefault === 'list' ? 'selected' : ''}>仅名单学生（${students.length}人）</option>
                        <option value="all" ${scopeDefault === 'all' ? 'selected' : ''}>全班共练</option>
                    </select>
                </label>
            </div>
            ${students.length ? `<div class="drill-students">${students.map(s => `<span class="student-chip">${s}</span>`).join('')}</div>` : ''}
            <div class="drill-q-list">`;
        qs.forEach(q => {
            const checked = focusPurpose ? (p === focusPurpose) : (p !== 'next' || kp.rate >= 80);
            const focusNode = focusRelId ? resolveRelNode(focusRelId) : null;
            const hl = focusNode && q.target === focusNode.name ? ' highlight' : '';
            html += `<div class="drill-q${hl}">
                <label class="drill-q-check"><input type="checkbox" data-purpose="${p}" value="${q.id}" ${checked ? 'checked' : ''} aria-label="选用 ${q.id}"></label>
                <div class="drill-q-main">
                    <div class="drill-q-title"><b>${q.id}</b> <span class="drill-q-meta">${q.type} · ${q.diff} · 约 ${q.minutes} 分钟${q.target ? ` · 目标：${q.target}` : ''}</span></div>
                    <div class="drill-q-stem">${q.stem}</div>
                    <div class="drill-q-reason"><span>推荐目的：${q.purpose}</span><span>推荐依据：${q.reason}</span></div>
                </div>
            </div>`;
        });
        html += '</div></div>';
    });
    const retests = DRILL_BANK.retest[kpId] || [];
    if (retests.length) {
        retests.forEach(q => { drillQuestionMap[q.id] = q; });
        html += `<div class="drill-retest">
            <label class="drill-retest-check"><input type="checkbox" id="drill-retest-toggle" checked> 同时生成复测任务（同目标 · 换情境新题）</label>
            <div class="drill-retest-list">${retests.map(q => `<span class="drill-retest-q"><b>${q.id}</b> ${q.type} · ${q.purpose}</span>`).join('')}</div>
            <div class="drill-retest-note">原题重做正确只记「订正完成」，不计为「已掌握」；需复测通过方可进入后续衔接。</div>
        </div>`;
    }
    if (!html) html = '<div class="diag-empty">该知识点暂无可用加练题（原型模拟数据）。</div>';
    document.getElementById('drill-modal-title').textContent = `分目的加练 · ${kp.name}`;
    const body = document.getElementById('drill-modal-body');
    body.innerHTML = html;
    body.querySelectorAll('input[type="checkbox"][data-purpose]').forEach(cb => cb.addEventListener('change', updateDrillTotal));
    const retestToggle = document.getElementById('drill-retest-toggle');
    if (retestToggle) retestToggle.addEventListener('change', updateDrillTotal);
    updateDrillTotal();
    document.getElementById('drill-modal').style.display = 'flex';
}

function updateDrillTotal() {
    const boxes = document.querySelectorAll('#drill-modal-body input[type="checkbox"][data-purpose]');
    let count = 0, minutes = 0;
    boxes.forEach(cb => {
        if (cb.checked && drillQuestionMap[cb.value]) {
            count++;
            minutes += drillQuestionMap[cb.value].minutes || 0;
        }
    });
    const retestToggle = document.getElementById('drill-retest-toggle');
    let retestInfo = '';
    if (retestToggle) {
        if (retestToggle.checked) {
            Object.keys(drillQuestionMap).forEach(id => {
                if (id.startsWith('R-')) { count++; minutes += drillQuestionMap[id].minutes || 0; }
            });
            retestInfo = '（含复测）';
        }
    }
    const info = document.getElementById('drill-total-info');
    if (info) info.textContent = `已选 ${count} 题 · 预计 ${minutes} 分钟${retestInfo}`;
}

function basketAddedStudentsForKp(kpId) {
    const set = new Set();
    drillBasket.forEach(g => { if (g.kpId === kpId && g.scope === 'list') g.students.forEach(s => set.add(s)); });
    return [...set];
}

function addCheckedToBasket() {
    const kpId = drillModalKpId;
    const kp = knowledgeData.find(k => k.id === kpId);
    if (!kp) return;
    const body = document.getElementById('drill-modal-body');
    let added = 0;
    DRILL_PURPOSE_ORDER.forEach(p => {
        const section = body.querySelector(`.drill-purpose[data-purpose="${p}"]`);
        if (!section) return;
        const checkedIds = Array.from(section.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
        if (!checkedIds.length) return;
        const qs = drillQuestionsFor(kpId, p).filter(q => checkedIds.includes(q.id));
        if (!qs.length) return;
        const scopeSel = section.querySelector('.drill-scope-select');
        const scope = scopeSel ? scopeSel.value : 'list';
        const grp = (KP_STUDENT_GROUPS[kpId] || {})[p];
        const students = scope === 'list' ? (grp ? grp.students : []) : [];
        addToBasket({ purpose: p, kpId, kpName: kp.name, scope, students, questions: qs, retest: null });
        added++;
    });
    const retestToggle = document.getElementById('drill-retest-toggle');
    if (retestToggle && retestToggle.checked && (DRILL_BANK.retest[kpId] || []).length) {
        const students = basketAddedStudentsForKp(kpId);
        addToBasket({
            purpose: 'retest', kpId, kpName: kp.name,
            scope: students.length ? 'list' : 'all', students,
            questions: DRILL_BANK.retest[kpId].map(q => Object.assign({}, q)), retest: null,
        });
    }
    closeDrillModal();
    showToast(added ? `已加入题篮：${added} 组加练建议` : '未勾选任何题目');
}

function closeDrillModal() {
    const m = document.getElementById('drill-modal');
    if (m) m.style.display = 'none';
}

// ---------- 6.8 补练题篮（分组 + 布置 + 复测追踪） ----------
let drillBasket = [];
let basketPublished = [];
let basketSeq = 1;

function addToBasket(group) {
    group.uid = 'B' + (basketSeq++);
    drillBasket.push(group);
    renderBasketUI();
}

function removeBasketGroup(uid) {
    drillBasket = drillBasket.filter(g => g.uid !== uid);
    renderBasketUI();
}

function clearBasket() {
    if (!drillBasket.length) { showToast('题篮已为空'); return; }
    drillBasket = [];
    renderBasketUI();
    showToast('已清空待确认题篮');
}

function openBasketDrawer() {
    closeDiagModal(); // 题篮抽屉与诊断抽屉互斥
    document.getElementById('basket-drawer').classList.add('open');
    renderBasketDrawer();
}

function closeBasketDrawer() {
    document.getElementById('basket-drawer').classList.remove('open');
}

function renderBasketUI() {
    const fab = document.getElementById('basket-fab');
    const count = document.getElementById('basket-fab-count');
    const total = drillBasket.length + basketPublished.length;
    if (count) count.textContent = String(total);
    if (fab) fab.classList.toggle('has', total > 0);
    if (document.getElementById('basket-drawer').classList.contains('open')) renderBasketDrawer();
}

function basketGroupHtml(g) {
    const meta = PURPOSE_META[g.purpose];
    const scopeText = g.scope === 'all' ? '全班共练' : `名单学生（${g.students.length}人）`;
    const mins = g.questions.reduce((s, q) => s + (q.minutes || 0), 0);
    return `<div class="basket-group">
        <div class="basket-group-head">
            <span class="purpose-badge" style="background:${meta.color}">${meta.label}</span>
            <span class="basket-kp">${g.kpName}</span>
            <span class="basket-scope">${scopeText}</span>
            <button type="button" class="basket-remove" onclick="removeBasketGroup('${g.uid}')" aria-label="移除该组">&times;</button>
        </div>
        ${g.students.length ? `<div class="basket-students">${g.students.map(s => `<span class="student-chip">${s}</span>`).join('')}</div>` : ''}
        <div class="basket-qs">${g.questions.map(q => `<span class="basket-q">${q.id}·${q.type}·${q.diff}·${q.minutes}min</span>`).join('')}</div>
        <div class="basket-mins">预计负担：${g.questions.length} 题 · 约 ${mins} 分钟${g.purpose === 'retest' ? ' · 复测通过后方可进入后续衔接' : ''}</div>
    </div>`;
}

function basketTrackHtml(g) {
    const meta = PURPOSE_META[g.purpose];
    return `<div class="basket-group published">
        <div class="basket-group-head">
            <span class="purpose-badge" style="background:${meta.color}">${meta.label}</span>
            <span class="basket-kp">${g.kpName}</span>
            <span class="track-state">补练中（模拟）</span>
        </div>
        <div class="basket-track">
            <span class="track-step done">已发布</span><span class="track-arrow">→</span>
            <span class="track-step doing">补练进行中</span><span class="track-arrow">→</span>
            <span class="track-step todo">${g.purpose === 'retest' ? '待复测批阅' : '待复测'}</span>
        </div>
        <div class="basket-mins">复测通过 → 进入后续衔接；未通过 → 回到补练。原题订正不计为掌握。</div>
    </div>`;
}

function renderBasketDrawer() {
    const body = document.getElementById('basket-drawer-body');
    if (!body) return;
    let html = '';
    if (drillBasket.length) {
        html += `<div class="basket-subtitle">待确认（${drillBasket.length} 组 · 发布前请核对名单与题目）</div>`;
        drillBasket.forEach(g => { html += basketGroupHtml(g); });
    } else {
        html += '<div class="basket-empty">题篮为空。可从「知识点明细 → 关联诊断」「关系图节点」「讲评课件 → 类题加练」生成分组补练建议。</div>';
    }
    if (basketPublished.length) {
        html += `<div class="basket-subtitle">补练追踪（已布置 · 原型模拟状态）</div>`;
        basketPublished.forEach(g => { html += basketTrackHtml(g); });
    }
    body.innerHTML = html;
    const pub = document.getElementById('basket-publish-btn');
    if (pub) {
        pub.disabled = !drillBasket.length;
        pub.style.opacity = drillBasket.length ? '1' : '.5';
        pub.style.cursor = drillBasket.length ? 'pointer' : 'not-allowed';
    }
}

function publishBasket() {
    if (!drillBasket.length) { showToast('题篮为空，请先生成加练建议'); return; }
    const n = drillBasket.length;
    drillBasket.forEach(g => basketPublished.push(g));
    drillBasket = [];
    renderBasketUI();
    showToast(`已布置 ${n} 组补练；复测任务已加入追踪列表（原型模拟，未真实下发）`);
}

// ---------- 6.9 知识点图谱（三视图已迁移至 kg-graph.js，此处仅保留旧入口兼容） ----------
// 兼容旧调用：switchKGView('relation') / switchToKGRelationView() 均落到「力导向」视图
function switchKGView(view) {
    if (window.KPGraph) window.KPGraph.switchView(view);
}

function switchToKGRelationView() {
    const lect = document.querySelector('.top-level-nav .top-nav-item[data-main-tab="lecturing"]');
    if (lect) lect.click();
    const tab = document.querySelector('.tab-nav .tab-item[data-tab="kp-graph"]');
    if (tab) tab.click();
    setTimeout(() => {
        if (!window.KPGraph) return;
        window.KPGraph.activate();
        window.KPGraph.switchView('force');
    }, 120);
}

// ---------- 6.10 讲评课件（按题号 / 按知识依赖顺序） ----------
const COURSEWARE_QUESTIONS = [
    { qno: '第一.1题', kps: ['1-1', '1-1-1'], mainKp: '1-1-1', rate: 60, gradeRate: 55, opts: true },
    { qno: '第4题',   kps: ['2-2'], mainKp: '2-2', rate: 58, gradeRate: 53, opts: true },
    { qno: '第7题',   kps: ['3'],   mainKp: '3',   rate: 40, gradeRate: 34, opts: true },
    { qno: '第8题',   kps: ['3'],   mainKp: '3',   rate: 42, gradeRate: 36, opts: true },
    { qno: '第12题',  kps: ['2-2'], mainKp: '2-2', rate: 55, gradeRate: 50, opts: true },
    { qno: '第15题',  kps: ['3'],   mainKp: '3',   rate: 56, gradeRate: 50, opts: false },
];

const LECTURE_PLAN = [
    { type: 'question', qno: '第一.1题', phase: '基础订正', color: '#909399', reason: '得分率 60%，属理解性偏差，建议学生课后自行订正，课堂不占用时间。' },
    { type: 'step', phase: '前置诊断', color: '#08979c', title: '任意角与弧度制', meta: '本次无作答证据 · 待诊断', reason: '第7、8、15题共同前置，本次无作答证据，建议用 5 分钟现场诊断，再决定是否补练。', minutes: 5 },
    { type: 'question', qno: '第7题', phase: '原题讲评', color: '#2468f2', reason: '本次最薄弱知识点（三角函数 40%），先行讲评。' },
    { type: 'question', qno: '第8题', phase: '迁移检查', color: '#5a5cec', reason: '与第7题同知识点、换情境，讲评后现场检查能否迁移。' },
    { type: 'step', phase: '现场摸底', color: '#fa8c16', title: '单位圆与三角函数定义', meta: '暂无作答证据 · 待诊断', reason: '无证据 ≠ 未掌握：讲评中用 1 道口算小题现场摸底，再决定是否补练。', minutes: 3 },
    { type: 'question', qno: '第4题', phase: '概念辨析', color: '#eb2f96', reason: '奇偶性判定失分多与「单调性 / 奇偶性」概念混淆相关，建议对比讲解。' },
    { type: 'question', qno: '第12题', phase: '概念辨析', color: '#eb2f96', reason: '与第4题同类失分，讲评后合并安排辨析练习。' },
    { type: 'question', qno: '第15题', phase: '步骤规范', color: '#9254de', reason: '三角函数综合题，失分含过程分，重点示范规范步骤。' },
    { type: 'step', phase: '后续衔接', color: '#606266', title: '函数 y=Asin(ωx+φ) 的图象（预告）', meta: '教学进度：未学', reason: '仅 2 分钟衔接预告，不展开、不布置加练。', minutes: 2 },
];

function renderLecturePlan() {
    const wrap = document.getElementById('lecture-plan');
    if (!wrap) return;
    const steps = LECTURE_PLAN.map((s, i) =>
        `<span class="lp-step" style="--c:${s.color}"><i>${i + 1}</i>${s.phase}${s.type === 'question' ? '·' + s.qno : ''}</span>`
    ).join('<span class="lp-arrow">→</span>');
    wrap.innerHTML = `
        <div class="lp-track" role="list" aria-label="推荐讲评顺序">${steps}</div>
        <div class="lp-caption">推荐讲评顺序（依据知识依赖与证据生成，教师可调整）：先诊断共同前置 → 原题讲评 → 换情境迁移检查 → 无证据项现场摸底 → 概念辨析 → 步骤规范 → 未学内容仅衔接预告。</div>`;
}

function questionCardHtml(q, planItem) {
    const phaseHtml = planItem ? `<span class="cw-phase-badge" style="background:${planItem.color}">${planItem.phase}</span>` : '';
    const adviceHtml = planItem ? `<div class="cw-advice">讲评建议：${planItem.reason}</div>` : '';
    const kpNames = q.kps.map(id => (knowledgeData.find(k => k.id === id) || {}).name).filter(Boolean).join('、');
    const drillCount = Math.max((DRILL_BANK.solid[q.mainKp] || []).length, 1);
    const bodyHtml = q.opts
        ? `<p>本小题没有题干，您可以点击此处来查看本小题的答案和解析</p>
           <div class="options"><div>A.</div><div>B.</div><div>C.</div><div>D.</div></div>`
        : `<p>解答题 · 点击此处查看参考答案与评分标准（本题失分含过程分，重点示范规范步骤）</p>`;
    return `<div class="question-card">
        <div class="question-header">
            <span class="q-number">${q.qno}</span>
            ${phaseHtml}
            <span class="cw-kp-tag">知识点：${kpNames}</span>
        </div>
        <div class="question-body">${bodyHtml}</div>
        ${adviceHtml}
        <div class="question-footer">
            <div class="stats">
                <span>班级得分率：<strong>${q.rate}%</strong></span>
                <span>年级得分率：<strong>${q.gradeRate}%</strong></span>
            </div>
            <div class="footer-btns">
                <button type="button" class="text-btn">${IC.chart} 数据分析</button>
                <button type="button" class="text-btn" onclick="openDiagModal('${q.mainKp}')">${IC.link} 关联诊断</button>
                <button type="button" class="text-btn" onclick="openDrillModal('${q.mainKp}')">${IC.plus} 类题加练(${drillCount})</button>
                <button type="button" class="text-btn">${IC.expand} 全屏显示</button>
            </div>
        </div>
    </div>`;
}

function renderCourseware(sortMode) {
    const wrap = document.getElementById('cw-cards-knowledge');
    if (!wrap) return;
    renderLecturePlan();
    const planEl = document.getElementById('lecture-plan');
    if (planEl) planEl.style.display = sortMode === 'dependency' ? 'block' : 'none';
    let html = '';
    if (sortMode === 'dependency') {
        LECTURE_PLAN.forEach(item => {
            if (item.type === 'step') {
                html += `<div class="lp-card" style="--c:${item.color}">
                    <div class="lp-card-head"><span class="cw-phase-badge" style="background:${item.color}">${item.phase}</span><b>${item.title}</b><span class="lp-card-meta">${item.meta}</span></div>
                    <div class="lp-card-reason">讲评建议：${item.reason}${item.minutes ? `（约 ${item.minutes} 分钟）` : ''}</div>
                </div>`;
            } else {
                const q = COURSEWARE_QUESTIONS.find(x => x.qno === item.qno);
                if (q) html += questionCardHtml(q, item);
            }
        });
    } else {
        COURSEWARE_QUESTIONS.forEach(q => { html += questionCardHtml(q, null); });
    }
    wrap.innerHTML = html;
}

function applyDependencySortAndScroll() {
    const lect = document.querySelector('.top-level-nav .top-nav-item[data-main-tab="lecturing"]');
    if (lect) lect.click();
    const tab = document.querySelector('.tab-nav .tab-item[data-tab="knowledge"]');
    if (tab) tab.click();
    const sel = document.getElementById('cw-sort-knowledge');
    if (sel) sel.value = 'dependency';
    renderCourseware('dependency');
    const plan = document.getElementById('lecture-plan');
    if (plan) plan.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---------- 6.11 学生学习路径（学生详情弹窗） ----------
function renderLearningPath(idx) {
    const el = document.getElementById('modal-learning-path');
    if (!el || !studentData[idx]) return;
    const s = studentData[idx];
    let target, steps;
    if (s.avg >= 85) {
        target = '后续应用 · 利用奇偶性求参数 / 三角函数综合';
        steps = [
            { label: '本次表现核查（三角函数、奇偶性判定稳定）', status: 'done' },
            { label: '后续应用练习（综合题 1 道）', status: 'todo' },
            { label: '复测验证（换情境新题）', status: 'todo' },
        ];
    } else if (s.avg >= 60) {
        target = '同点巩固 · 奇偶性判定 / 三角函数同角关系';
        steps = [
            { label: '本次作答证据核查（同点薄弱已定位）', status: 'done' },
            { label: '同点巩固练习（2 道）', status: 'todo' },
            { label: '复测验证（换情境新题）', status: 'todo' },
        ];
    } else {
        target = '奇偶性判定 / 三角函数（本次失分，前置待诊断）';
        steps = [
            { label: '前置诊断（单位圆定义 / 定义域对称性，各 1 题）', status: 'todo' },
            { label: '按诊断结果决定是否补练', status: 'todo' },
            { label: '同点巩固（2 道）', status: 'todo' },
            { label: '复测验证（换情境新题）', status: 'todo' },
        ];
    }
    const statusText = { done: '已完成', doing: '进行中', todo: '待开始' };
    el.innerHTML = `
        <div class="learn-path-target">当前目标：<b>${target}</b></div>
        <div class="learn-path-steps">${steps.map(st => `<span class="lp-node ${st.status}"><i></i>${st.label}<em>${statusText[st.status]}</em></span>`).join('<span class="lp-arrow">→</span>')}</div>
        <div class="learn-path-note">路径依据知识图谱前后序关系与学生作答证据生成（原型模拟数据）；「待诊断」表示暂无证据，先诊断再决定是否补练。</div>`;
}

// ---------- 6.12 Toast ----------
let toastTimer = null;
function showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ---------- 6.13 初始化 ----------
function initKnowledgeGraphUpgrade() {
    // 三视图按钮 / 筛选工具栏 / 左右面板的事件绑定均由 kg-graph.js 接管（KPGraph.init 幂等）
    if (window.KPGraph) window.KPGraph.init();

    const sel = document.getElementById('cw-sort-knowledge');
    if (sel) sel.onchange = (e) => renderCourseware(e.target.value);
    renderCourseware('number');

    window.addEventListener('resize', () => {
        if (window.KPGraph) window.KPGraph.resize();
    });
}

// ============================================================
// 7. 讲评报表：题目明细 / 题型明细（还原基准截图）
//    题目明细 = 转置统计表（行=指标，列=题号）
//    题型明细 = 行式统计表（行=题型，列=指标）
//    两表共用：添加对比班级 / 导出Excel；题目明细另含：表格·柱状图、得分率升序、点题号全屏
//    数据口径：与「学生成绩」同源（6 道题 / 满分 90）；对比班级为模拟数据
// ============================================================
const QM_CLASS_NAME = '自动化巡检班-勿动';

// 题目基础数据：题号 / 题型 / 分值 / 年级·班级得分率；sub = 复合题的小问
const QM_QUESTIONS = [
    { no: '1', type: '单选题', score: 5, gradeRate: 82, classRate: 80, sub: null },
    { no: '2', type: '单选题', score: 5, gradeRate: 64, classRate: 60, sub: null },
    { no: '3', type: '单选题', score: 5, gradeRate: 45, classRate: 40, sub: null },
    { no: '4', type: '多选题', score: 10, gradeRate: 58, classRate: 55, sub: null },
    { no: '5', type: '填空题', score: 15, gradeRate: 42, classRate: 33, sub: null },
    {
        no: '6', type: '解答题', score: 50, gradeRate: 51, classRate: 45,
        sub: [
            { no: '6(1)', score: 12, gradeRate: 62, classRate: 58 },
            { no: '6(2)', score: 20, gradeRate: 48, classRate: 40 },
            { no: '6(3)', score: 18, gradeRate: 31, classRate: 25 },
        ],
    },
];

// 对比班级得分率（模拟）：按题号顺序给出，平均分由「分值 × 得分率」折算，与年级/班级同口径
const QM_COMPARE_RATES = {
    '1班': [84, 66, 48, 60, 36, 49],
    '2班': [78, 58, 36, 52, 30, 41],
    '3班': [70, 55, 44, 49, 28, 38],
};

const qmState = {
    view: 'table',        // 'table' | 'bar'
    rateAsc: false,       // 得分率从低到高排列
    compare: '',          // 对比班级
    groupByType: false,   // 题型明细-手动分组统计
    colWidths: {},        // 拖拽过的列宽（key: 列标识）
};
let qmChart = null;

const qmRound1 = (n) => Math.round(n * 10) / 10;
const qmAvg = (score, rate) => (rate == null ? null : qmRound1(score * rate / 100));
const qmRateOf = (avg, score) => (score ? Math.round(avg / score * 100) : null);
const qmCmpRate = (q, cls) => {
    const list = QM_COMPARE_RATES[cls];
    if (!list) return null;
    const idx = Number(q.no) - 1;
    return (idx >= 0 && idx < list.length) ? list[idx] : null;
};

function qmRateText(rate) {
    return (rate == null) ? '<span class="qm-na">*</span>' : rate + '%';
}
function qmNumText(v) {
    if (v == null) return '<span class="qm-na">*</span>';
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
}
function qmOrderedQuestions() {
    const list = QM_QUESTIONS.slice();
    if (qmState.rateAsc) list.sort((a, b) => a.classRate - b.classRate);
    return list;
}

// ---------- 7.1 题目明细（转置表：行=指标，列=题号） ----------
function renderQuestionDetail() {
    const head = document.getElementById('qm-question-head');
    const body = document.getElementById('qm-question-body');
    const colgroup = document.getElementById('qm-question-colgroup');
    if (!head || !body || !colgroup) return;

    const qs = qmOrderedQuestions();
    const cmp = qmState.compare;

    // 首列固定宽度，其余列由 CSS 均分；拖拽过的列写回像素宽
    const labelW = qmState.colWidths.__questionLabel;
    colgroup.innerHTML = `<col class="qm-col-label"${labelW ? ` style="width:${labelW}px"` : ''}>`
        + qs.map(q => {
            const w = qmState.colWidths['q' + q.no];
            return `<col${w ? ` style="width:${w}px"` : ''}>`;
        }).join('');

    head.innerHTML = `<tr><th class="qm-corner">题号<span class="qm-resizer" data-resize-key="__questionLabel" title="拖拽调整列宽"></span></th>`
        + qs.map(q => `<th class="qm-qhead">
            <button type="button" class="qm-qno" data-qno="${q.no}" title="点击全屏显示第 ${q.no} 题详情">${q.no}</button>
            ${q.sub ? `<span class="qm-sub-ico" title="复合题，含 ${q.sub.length} 个小问">${IC.layer}</span>` : ''}
            <span class="qm-resizer" data-resize-key="q${q.no}" title="拖拽调整列宽"></span>
        </th>`).join('') + `</tr>`;

    const rows = [
        { label: '年级得分率', cell: q => qmRateText(q.gradeRate) },
        { label: `${QM_CLASS_NAME}得分率`, cell: q => qmRateText(q.classRate) },
    ];
    if (cmp) rows.push({ label: `${cmp}得分率`, cell: q => qmRateText(qmCmpRate(q, cmp)) });
    rows.push({ label: '年级平均分', cell: q => qmNumText(qmAvg(q.score, q.gradeRate)) });
    rows.push({ label: `${QM_CLASS_NAME}平均分`, cell: q => qmNumText(qmAvg(q.score, q.classRate)) });
    if (cmp) rows.push({ label: `${cmp}平均分`, cell: q => qmNumText(qmAvg(q.score, qmCmpRate(q, cmp))) });

    body.innerHTML = rows.map(r => `<tr><td class="qm-row-label">${r.label}</td>`
        + qs.map(q => `<td class="qm-num">${r.cell(q)}</td>`).join('') + `</tr>`).join('');
}

// ---------- 7.2 题型明细（行式表：行=题型，列=指标） ----------
function qmTypeRows() {
    const cmp = qmState.compare;
    if (!qmState.groupByType) {
        // 默认：按题号逐行
        return QM_QUESTIONS.map(q => ({
            type: q.type,
            nos: q.no,
            score: q.score,
            gradeAvg: qmAvg(q.score, q.gradeRate),
            classAvg: qmAvg(q.score, q.classRate),
            cmpAvg: cmp ? qmAvg(q.score, qmCmpRate(q, cmp)) : null,
            gradeRate: q.gradeRate,
            classRate: q.classRate,
            cmpRate: cmp ? qmCmpRate(q, cmp) : null,
        }));
    }
    // 手动分组统计：同题型合并（分值与平均分累加，得分率按合并后重算）
    const byType = new Map();
    QM_QUESTIONS.forEach(q => {
        if (!byType.has(q.type)) byType.set(q.type, []);
        byType.get(q.type).push(q);
    });
    return Array.from(byType.entries()).map(([type, list]) => {
        const score = list.reduce((s, q) => s + q.score, 0);
        const gradeAvg = qmRound1(list.reduce((s, q) => s + q.score * q.gradeRate / 100, 0));
        const classAvg = qmRound1(list.reduce((s, q) => s + q.score * q.classRate / 100, 0));
        const cmpAvg = cmp ? qmRound1(list.reduce((s, q) => s + q.score * (qmCmpRate(q, cmp) || 0) / 100, 0)) : null;
        return {
            type,
            nos: list.map(q => q.no).join('、'),
            score, gradeAvg, classAvg, cmpAvg,
            gradeRate: qmRateOf(gradeAvg, score),
            classRate: qmRateOf(classAvg, score),
            cmpRate: cmp ? qmRateOf(cmpAvg, score) : null,
        };
    });
}

function renderTypeDetail() {
    const head = document.getElementById('qm-type-head');
    const body = document.getElementById('qm-type-body');
    const colgroup = document.getElementById('qm-type-colgroup');
    if (!head || !body || !colgroup) return;

    const rows = qmTypeRows();
    const cmp = qmState.compare;

    const cols = [
        { key: '__typeLabel', label: '题型', labelCol: true },
        { key: 'nos', label: '题号' },
        { key: 'score', label: '题型分值' },
        { key: 'gradeAvg', label: '年级平均分' },
        { key: 'classAvg', label: '班级平均分' },
    ];
    if (cmp) cols.push({ key: 'cmpAvg', label: `${cmp}平均分` });
    cols.push({ key: 'gradeRate', label: '年级得分率' }, { key: 'classRate', label: '班级得分率' });
    if (cmp) cols.push({ key: 'cmpRate', label: `${cmp}得分率` });

    colgroup.innerHTML = cols.map(c => {
        const w = qmState.colWidths[c.key];
        return `<col${c.labelCol ? ' class="qm-col-label"' : ''}${w ? ` style="width:${w}px"` : ''}>`;
    }).join('');

    head.innerHTML = `<tr>` + cols.map(c => `<th>${c.label}<span class="qm-resizer" data-resize-key="${c.key}" title="拖拽调整列宽"></span></th>`).join('') + `</tr>`;

    body.innerHTML = rows.map(r => `<tr>
        <td class="qm-row-label">${r.type}</td>
        <td class="qm-num">${r.nos}</td>
        <td class="qm-num">${r.score}</td>
        <td class="qm-num">${qmNumText(r.gradeAvg)}</td>
        <td class="qm-num">${qmNumText(r.classAvg)}</td>
        ${cmp ? `<td class="qm-num">${qmNumText(r.cmpAvg)}</td>` : ''}
        <td class="qm-num">${qmRateText(r.gradeRate)}</td>
        <td class="qm-num">${qmRateText(r.classRate)}</td>
        ${cmp ? `<td class="qm-num">${qmRateText(r.cmpRate)}</td>` : ''}
    </tr>`).join('');
}

// ---------- 7.3 表格 / 柱状图视图切换 ----------
function renderQmChart() {
    const el = document.getElementById('qm-question-chart');
    if (!el || typeof echarts === 'undefined') return;
    if (!qmChart) qmChart = echarts.init(el);

    const qs = qmOrderedQuestions();
    const cmp = qmState.compare;
    const series = [
        { name: '年级得分率', type: 'bar', barMaxWidth: 36, barGap: '18%', itemStyle: { color: '#bfd3f7' }, data: qs.map(q => q.gradeRate) },
        { name: QM_CLASS_NAME + '得分率', type: 'bar', barMaxWidth: 36, barGap: '18%', itemStyle: { color: '#2468f2' }, data: qs.map(q => q.classRate) },
    ];
    if (cmp) series.push({ name: cmp + '得分率', type: 'bar', barMaxWidth: 36, barGap: '18%', itemStyle: { color: '#f7ba1e' }, data: qs.map(q => qmCmpRate(q, cmp)) });

    qmChart.setOption({
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: (params) => {
                const q = qs[params[0].dataIndex];
                return `<b>第 ${q.no} 题</b>（${q.type} · ${q.score} 分）<br>`
                    + params.map(p => `${p.marker}${p.seriesName}：${p.value}%　平均分 ${qmNumText(qmAvg(q.score, p.value))}`).join('<br>');
            },
        },
        legend: { data: series.map(s => s.name), right: 8, top: 2, itemWidth: 12, itemHeight: 8, textStyle: { fontSize: 12, color: '#606266' } },
        grid: { left: 8, right: 16, top: 46, bottom: 8, containLabel: true },
        xAxis: {
            type: 'category',
            data: qs.map(q => '第' + q.no + '题'),
            axisTick: { show: false },
            axisLine: { lineStyle: { color: '#e4e7ed' } },
            axisLabel: { color: '#606266', fontSize: 12 },
        },
        yAxis: {
            type: 'value', max: 100, name: '得分率 %',
            nameTextStyle: { color: '#909399', fontSize: 12 },
            axisLabel: { color: '#909399', fontSize: 12, formatter: '{value}%' },
            splitLine: { lineStyle: { color: '#f0f2f5' } },
        },
        series,
    }, true);
    qmChart.resize();
}

function setQmView(view) {
    qmState.view = view;
    const wrap = document.getElementById('qm-question-wrap');
    const chartEl = document.getElementById('qm-question-chart');
    if (!wrap || !chartEl) return;
    if (view === 'bar') {
        wrap.style.display = 'none';
        chartEl.style.display = 'block';
        renderQmChart();
    } else {
        chartEl.style.display = 'none';
        wrap.style.display = 'block';
    }
}

// ---------- 7.4 列宽拖拽（表头右侧拖块，还原基准交互） ----------
// 全部列都写死像素后，表格改用像素总宽；否则 fixed 布局会把剩余宽度再摊回各列
function qmSyncTableWidth(table) {
    const cols = Array.from(table.querySelectorAll('colgroup col'));
    let total = 0;
    const allFixed = cols.every(c => {
        const w = parseFloat(c.style.width);
        if (w) { total += w; return true; }
        return false;
    });
    table.style.width = allFixed ? total + 'px' : '100%';
}

function initQmResize(table) {
    if (!table) return;
    table.addEventListener('mousedown', (e) => {
        const handle = e.target.closest('.qm-resizer');
        if (!handle) return;
        const th = handle.closest('th');
        if (!th) return;
        const idx = Array.prototype.indexOf.call(th.parentNode.children, th);
        const col = table.querySelectorAll('colgroup col')[idx];
        if (!col) return;

        e.preventDefault();
        const startX = e.clientX;
        const startW = col.getBoundingClientRect().width || th.getBoundingClientRect().width;
        const key = handle.dataset.resizeKey;
        document.body.classList.add('qm-resizing');

        const onMove = (ev) => {
            const w = Math.max(88, Math.round(startW + ev.clientX - startX));
            col.style.width = w + 'px';
            if (key) qmState.colWidths[key] = w;
            qmSyncTableWidth(table);
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.body.classList.remove('qm-resizing');
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });
}

// ---------- 7.5 题目全屏详情（点击题号打开） ----------
function openQmQuestionModal(no) {
    const q = QM_QUESTIONS.find(x => x.no === no);
    const modal = document.getElementById('qm-question-modal');
    const title = document.getElementById('qm-modal-title');
    const body = document.getElementById('qm-modal-body');
    if (!q || !modal || !body) return;

    const cmp = qmState.compare;
    const subHtml = q.sub ? `
        <h4 class="qm-modal-h4">子题拆分</h4>
        <table class="qm-table qm-sub-table">
            <thead><tr><th>小题</th><th>分值</th><th>年级平均分</th><th>班级平均分</th><th>年级得分率</th><th>班级得分率</th></tr></thead>
            <tbody>${q.sub.map(s => `<tr>
                <td class="qm-row-label">${s.no}</td>
                <td class="qm-num">${s.score}</td>
                <td class="qm-num">${qmNumText(qmAvg(s.score, s.gradeRate))}</td>
                <td class="qm-num">${qmNumText(qmAvg(s.score, s.classRate))}</td>
                <td class="qm-num">${s.gradeRate}%</td>
                <td class="qm-num">${s.classRate}%</td>
            </tr>`).join('')}</tbody>
        </table>` : '';

    body.innerHTML = `
        <div class="qm-modal-meta">
            <span class="qm-meta-tag">${q.type}</span>
            <span class="qm-meta-tag">题号 ${q.no}</span>
            <span class="qm-meta-tag">分值 ${q.score}</span>
            ${q.sub ? `<span class="qm-meta-tag primary">复合题 · ${q.sub.length} 个小问</span>` : ''}
            ${cmp ? `<span class="qm-meta-tag primary">已对比 ${cmp}</span>` : ''}
        </div>
        <div class="qm-modal-grid">
            <div class="qm-metric"><span>年级得分率</span><strong>${q.gradeRate}%</strong></div>
            <div class="qm-metric"><span>${QM_CLASS_NAME}得分率</span><strong>${q.classRate}%</strong></div>
            <div class="qm-metric"><span>年级平均分</span><strong>${qmNumText(qmAvg(q.score, q.gradeRate))}</strong></div>
            <div class="qm-metric"><span>${QM_CLASS_NAME}平均分</span><strong>${qmNumText(qmAvg(q.score, q.classRate))}</strong></div>
        </div>
        <h4 class="qm-modal-h4">题干</h4>
        <div class="qm-modal-stem">本小题没有题干，您可以点击此处来查看本小题的答案和解析。</div>
        ${subHtml}
        <h4 class="qm-modal-h4">答案与解析</h4>
        <div class="qm-modal-answer">
            <p><strong>参考答案：</strong>原型演示占位，接入题库后展示标准答案与评分细则。</p>
            <p><strong>解析：</strong>本题年级得分率 ${q.gradeRate}%、${QM_CLASS_NAME}得分率 ${q.classRate}%${cmp ? `、${cmp}得分率 ${qmCmpRate(q, cmp)}%` : ''}。讲评时建议先还原学生典型错答，再回到「知识点明细」定位失分知识点。</p>
        </div>`;

    if (title) title.textContent = `第 ${q.no} 题 · ${q.type}`;
    modal.style.display = 'flex';
    document.body.classList.add('qm-modal-open');
}

function closeQmQuestionModal() {
    const modal = document.getElementById('qm-question-modal');
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('qm-modal-open');
}

// ---------- 7.6 初始化 ----------
function initQMReport() {
    renderQuestionDetail();
    renderTypeDetail();

    const viewToggle = document.getElementById('qm-view-toggle');
    if (viewToggle) {
        viewToggle.querySelectorAll('.segment-btn').forEach(btn => {
            btn.onclick = () => {
                if (btn.classList.contains('active')) return;
                viewToggle.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                setQmView(btn.dataset.qmView);
            };
        });
    }

    const ascCheck = document.getElementById('qm-rate-asc');
    if (ascCheck) {
        ascCheck.onchange = () => {
            qmState.rateAsc = ascCheck.checked;
            renderQuestionDetail();
            if (qmState.view === 'bar') renderQmChart();
        };
    }

    const groupCheck = document.getElementById('qm-group-check');
    if (groupCheck) {
        groupCheck.onchange = () => {
            qmState.groupByType = groupCheck.checked;
            renderTypeDetail();
            showToast(qmState.groupByType ? '已按题型合并统计（同题型多题分值 / 平均分累加）' : '已恢复按题号逐行统计');
        };
    }

    const classSelect = document.getElementById('qm-class-select');
    if (classSelect) {
        classSelect.onchange = () => {
            qmState.compare = classSelect.value;
            classSelect.classList.toggle('qm-has-value', !!qmState.compare);
            renderQuestionDetail();
            renderTypeDetail();
            if (qmState.view === 'bar') renderQmChart();
            if (qmState.compare) showToast(`已添加对比班级：${qmState.compare}（对比数据为模拟）`);
        };
    }

    const exportBtn = document.getElementById('qm-export-btn');
    if (exportBtn) {
        exportBtn.onclick = () => {
            const active = document.querySelector('.tab-nav .tab-item.active');
            const isType = !!(active && active.dataset.tab === 'type');
            const name = isType ? '题型明细' : '题目明细';
            const rows = isType ? qmTypeRows().length + ' 个题型' : QM_QUESTIONS.length + ' 道题';
            const scope = qmState.compare ? `含 ${qmState.compare} 对比` : '年级 / 班级两列';
            showToast(`原型演示：已导出《${name}》Excel（${rows}，${scope}）`);
        };
    }

    const qTable = document.getElementById('qm-question-table');
    if (qTable) {
        qTable.addEventListener('click', (e) => {
            const btn = e.target.closest('.qm-qno');
            if (btn) openQmQuestionModal(btn.dataset.qno);
        });
        initQmResize(qTable);
    }
    const tTable = document.getElementById('qm-type-table');
    if (tTable) initQmResize(tTable);

    const modal = document.getElementById('qm-question-modal');
    if (modal) {
        modal.addEventListener('click', (e) => { if (e.target === modal) closeQmQuestionModal(); });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') closeQmQuestionModal();
    });

    window.addEventListener('resize', () => { if (qmChart) qmChart.resize(); });
}

// =========================
// 11. 班级对比 · 设置等级
// 等级阈值与报告侧同源（RP_CONFIG.grade 四档默认 90/80/60/30）；
// 本页对比表为演示数据，确定后仅保存口径并提示，不重算人数与率。
// =========================
const gradeLevelConfig = {
    mode: 'cumulative',   // 累计分段：优秀/良好/及格均按「得分率 ≥ 阈值」判定
    tiers: 4,             // 4 = 四档，5 = 五档（多一档「中等」）
    ex: 90, good: 80, mid: 70, pass: 60, low: 30,
    lowInclusive: true,   // 低分是否含端点：勾选为 ≤，否则为 <
    updated: false
};

function openGradeLevelModal() {
    const modal = document.getElementById('grade-level-modal');
    if (!modal) return;
    document.getElementById('gl-mode').value = gradeLevelConfig.mode;
    document.querySelectorAll('input[name="gl-tier-count"]').forEach(r => {
        r.checked = Number(r.value) === gradeLevelConfig.tiers;
    });
    document.getElementById('gl-ex').value = gradeLevelConfig.ex;
    document.getElementById('gl-good').value = gradeLevelConfig.good;
    document.getElementById('gl-mid').value = gradeLevelConfig.mid;
    document.getElementById('gl-pass').value = gradeLevelConfig.pass;
    document.getElementById('gl-low').value = gradeLevelConfig.low;
    document.getElementById('gl-low-include').checked = gradeLevelConfig.lowInclusive;
    syncGradeTierCount();
    syncGradeLowText();
    modal.style.display = 'flex';
}

function closeGradeLevelModal() {
    const modal = document.getElementById('grade-level-modal');
    if (modal) modal.style.display = 'none';
}

// 四档 / 五档切换：五档多一档「中等」，其余阈值口径不变
function syncGradeTierCount() {
    const picked = document.querySelector('input[name="gl-tier-count"]:checked');
    const five = !!picked && picked.value === '5';
    const midRow = document.getElementById('gl-mid-row');
    if (midRow) midRow.style.display = five ? 'flex' : 'none';
}

// 低分端点：勾选「包含 N%」时运算符从 < 变 ≤，文案跟随输入的阈值
function syncGradeLowText() {
    const include = document.getElementById('gl-low-include');
    const lowInput = document.getElementById('gl-low');
    const op = document.getElementById('gl-low-op');
    const val = document.getElementById('gl-low-val');
    if (op) op.textContent = include && include.checked ? '≤' : '<';
    if (val) val.textContent = lowInput && lowInput.value !== '' ? lowInput.value : '0';
}

function applyGradeLevel() {
    const num = (id) => Number(document.getElementById(id).value);
    const picked = document.querySelector('input[name="gl-tier-count"]:checked');
    const tiers = picked && picked.value === '5' ? 5 : 4;
    const ex = num('gl-ex');
    const good = num('gl-good');
    const mid = num('gl-mid');
    const pass = num('gl-pass');
    const low = num('gl-low');
    const seq = tiers === 5 ? [ex, good, mid, pass, low] : [ex, good, pass, low];

    if (seq.some(v => !Number.isFinite(v) || v < 0 || v > 100)) {
        showToast('得分率请填写 0–100 之间的数值');
        return;
    }
    for (let i = 1; i < seq.length; i++) {
        if (seq[i] >= seq[i - 1]) {
            showToast('累计分段需从高到低：优秀 > 良好' + (tiers === 5 ? ' > 中等' : '') + ' > 及格 > 低分');
            return;
        }
    }

    Object.assign(gradeLevelConfig, {
        mode: document.getElementById('gl-mode').value,
        tiers: tiers,
        ex: ex,
        good: good,
        mid: mid,
        pass: pass,
        low: low,
        lowInclusive: document.getElementById('gl-low-include').checked,
        updated: true
    });
    closeGradeLevelModal();
    showToast('等级阈值已保存：优秀 ≥ ' + ex + '% · 良好 ≥ ' + good + '%'
        + (tiers === 5 ? ' · 中等 ≥ ' + mid + '%' : '')
        + ' · 及格 ≥ ' + pass + '% · 低分 ' + (gradeLevelConfig.lowInclusive ? '≤' : '<') + ' ' + low + '%'
        + '（演示数据未按新阈值重算）');
}

// 弹窗：点击遮罩 / Esc 关闭，与题目详情弹窗同一交互
(function () {
    const modal = document.getElementById('grade-level-modal');
    if (!modal) return;
    modal.addEventListener('click', (e) => { if (e.target === modal) closeGradeLevelModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') closeGradeLevelModal();
    });
})();
