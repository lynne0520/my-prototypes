/* ════════════════════════════════════════════════════════════════
   report-data.js · 讲评试卷 4.0 单次作业报告（班级 / 年级）共享数据与图表库
   - 无真实数据接入：全部为演示 mock（作业报告设计方案 9.1 的 L1~L6 分层）
   - 口径与阈值集中在 RP_CONFIG（方案第八节），不硬编码
   - 本版为单次作业口径：不接入历史数据，PREV 仅作接口桩；76 班 valid=9 → 触发 8.1 小样本保护
   - 图表纯 SVG（方案 10.3），打印友好
   ════════════════════════════════════════════════════════════════ */
'use strict';

/* ── L6 配置层：阈值集中管理 ── */
var RP_CONFIG = {
    grade: { ex: 90, good: 80, pass: 60, low: 30 },   /* 等级分档：读取生产「设置等级」四档口径 */
    lecture: 70,                                      /* 重点讲评题阈值（报告内可调，调完实时重算） */
    kp: { master: 80, weak: 60 },                     /* 知识点掌握分级 */
    commonWeakCover: 0.5,                             /* 年级共性薄弱：薄弱班覆盖 ≥ 50% */
    meanGap: 3,                                       /* 与年级均分差判定线：超出 ±3pp 才判「明显高于 / 低于年级」 */
    sdPp: 15,                                         /* 标准差判定线：≥ 15pp 判两极分化（同时用于班际极差是否分化的判定） */
    lowWarn: 10,                                      /* 低分率预警线：> 10% 标黄并在汇总结论句内提示及格线下占比 */
    sig: { two: 0.01, one: 0.05 },                    /* 显著性水平 */
    smallSample: 10                                   /* 小样本保护线：有效样本 < 10 */
};

/* ── URL 参数：?hw=&cls=&role=&embed=&q= ──
   整合版嵌入 srcdoc iframe 时无地址栏，由宿主在 <head> 注入 window.__RPQ（同格式 query 字符串）；
   独立打开时仍读 location.search（旧契约不变） */
var RP_PARAMS = (function () {
    var q = new URLSearchParams((typeof window.__RPQ === 'string' && window.__RPQ) ? window.__RPQ : location.search);
    return {
        hw: q.get('hw') || 'HW-0910-U1',
        cls: q.get('cls') || '71',
        role: q.get('role') === 'leader' ? 'leader' : 'teacher',
        q: q.get('q') || '',
        anchor: q.get('anchor') || '',
        embed: q.get('embed') === '1',
        /* 本页文件名：srcdoc 无地址栏，宿主注入；独立打开时为空（回退 location.pathname） */
        page: q.get('page') || ''
    };
})();
function rpUrl(patch) {
    /* 嵌入（srcdoc 注入 __RPQ）时以注入参数为基重建：about:srcdoc 下 location.search/pathname 不可用，
       且必须保留 embed=1 与 hw/cls/role，否则页内跳转会丢上下文，甚至在 iframe 内加载出无 embed 的整页（顶栏重复） */
    var embedded = (typeof window.__RPQ === 'string' && window.__RPQ);
    var q = new URLSearchParams(embedded ? window.__RPQ : location.search);
    Object.keys(patch).forEach(function (k) {
        if (patch[k] === null || (k === 'role' && patch[k] === 'teacher')) q.delete(k);
        else q.set(k, patch[k]);
    });
    var base = embedded ? (RP_PARAMS.page || location.pathname) : location.pathname;
    var s = q.toString();
    return base + (s ? '?' + s : '');
}

/* ── 作业元信息（与 list.html HOMEWORK 口径一致的演示值） ── */
var RP_HW = {
    id: 'HW-0910-U1', name: 'unit1 单元检测一', subject: '英语', type: '校本作业',
    /* 满分与 RP_QUESTIONS 分值合计一致（12 题 Σ=105）；不再挂 150，避免表头口径与逐题分值打架 */
    fullScore: 105, reviewedAt: '2026-09-10 16:42'
};

/* ── L1 题目层：gradeBase 为年级目标得分率，班级得分率由偏置+确定性扰动生成后回算 ──
   marked：需讲评的另一种来源——学生端主动标记 / 教师端批改时标记（null = 未标记，只看得分率） */
/* kps：题目 ↔ 知识点为多对多映射，一道题可关联多个知识点，且允许跨维度挂接
   （演示 mock：先列同步知识点、再列复习知识点；生产需知识图谱映射表）
   cw：该题的错因构成权重（演示 mock）——键为错因 id、值为该错因占「本题做错学生」的百分比，
       权重最大者即 q.cause（该题主错因）；一次作业内同一道题可能对应不止一类错因 */
var RP_QUESTIONS = [
    { no: '1',  type: 'obj', score: 5,  kps: ['sy1', 'kp1'], gradeBase: 92, cause: 'c1', cw: { c1: 70, c2: 30 }, correct: 'B', stem: '冠词辨析：a / an / the 在泛指与特指中的选择' },
    { no: '2',  type: 'obj', score: 5,  kps: ['sy1', 'kp2'], gradeBase: 88, cause: 'c2', cw: { c2: 78, c1: 22 }, correct: 'D', marked: 'stu', stem: '介词固定搭配（depend on / result in）' },
    { no: '3',  type: 'obj', score: 5,  kps: ['sy2', 'kp3'], gradeBase: 74, cause: 'c3', cw: { c3: 74, c1: 26 }, correct: 'C', stem: '定语从句关系词选择（which / that / where）' },
    { no: '4',  type: 'obj', score: 5,  kps: ['sy2', 'kp3', 'kp2'], gradeBase: 66, cause: 'c3', cw: { c3: 66, c4: 34 }, correct: 'A', stem: '定语从句省略与介词 + 关系代词' },
    { no: '5',  type: 'obj', score: 5,  kps: ['sy3', 'kp4'], gradeBase: 81, cause: 'c4', cw: { c4: 62, c3: 38 }, correct: 'B', stem: '非谓语动词 doing / done 作状语' },
    { no: '6',  type: 'obj', score: 5,  kps: ['sy3', 'kp4'], gradeBase: 58, cause: 'c4', cw: { c4: 70, c5: 30 }, correct: 'C', stem: '非谓语动词独立主格与逻辑主语一致' },
    { no: '7',  type: 'obj', score: 5,  kps: ['sy4', 'kp5'], gradeBase: 69, cause: 'c5', cw: { c5: 76, c1: 24 }, correct: 'D', stem: '虚拟语气条件句（与现在/过去事实相反）' },
    { no: '8',  type: 'obj', score: 5,  kps: ['sy4', 'kp5'], gradeBase: 63, cause: 'c5', cw: { c5: 70, c3: 30 }, correct: 'B', stem: '虚拟语气含蓄条件（without / but for）' },
    { no: '9',  type: 'sub', score: 10, kps: ['sy5', 'kp6', 'kp7'], gradeBase: 77, cause: 'c1', cw: { c1: 58, c2: 42 }, stem: '完形填空：上下文线索推断（8 空）' },
    { no: '10', type: 'sub', score: 10, kps: ['sy6', 'kp7'], gradeBase: 71, cause: 'c2', cw: { c2: 64, c1: 36 }, marked: 'tea', stem: '阅读理解：主旨大意与作者态度' },
    { no: '11', type: 'sub', score: 20, kps: ['sy5', 'kp6', 'kp4'], gradeBase: 64, cause: 'c6', cw: { c6: 60, c5: 40 }, stem: '语法填空：词形转换与句法结构' },
    { no: '12', type: 'sub', score: 25, kps: ['sy7', 'kp8'], gradeBase: 60, cause: 'c6', cw: { c6: 80, c2: 20 }, stem: '应用文写作：建议信（格式 / 内容 / 语言）' }
];

/* ── L2 知识点层：一个学科的知识点分多个维度（同步 / 复习…），每个知识点只归属一个维度 ──
   - 维度是并列关系，没有「能力 / 核心素养」维度，也不由知识点反推任何能力项；
   - 各维度独立统计：维度内知识点掌握率只由「挂在该知识点上的题」计算，不跨维度合并、不加权折算；
   - 一道题可同时挂接多个维度的知识点（见 q.kps），各维度各算各的，互不抵扣。 */
var RP_KP_DIMS = [
    { id: 'sync',   n: '同步知识点', short: '同步', desc: '随教材单元进度（Unit 1）' },
    { id: 'review', n: '复习知识点', short: '复习', desc: '语法与题型专题复习' }
];
var RP_KP_DIM_DEFAULT = RP_KP_DIMS[0].id;
var RP_KPS = [
    /* 同步知识点：随 Unit 1 教材进度 */
    { id: 'sy1', dim: 'sync', n: 'Unit1 语法·冠词与介词' },
    { id: 'sy2', dim: 'sync', n: 'Unit1 语法·定语从句' },
    { id: 'sy3', dim: 'sync', n: 'Unit1 语法·非谓语动词' },
    { id: 'sy4', dim: 'sync', n: 'Unit1 语法·虚拟语气' },
    { id: 'sy5', dim: 'sync', n: 'Unit1 语篇·完形与语法填空' },
    { id: 'sy6', dim: 'sync', n: 'Unit1 语篇·阅读主旨' },
    { id: 'sy7', dim: 'sync', n: 'Unit1 写作·建议信' },
    /* 复习知识点：语法 / 题型专题（与同步维度同名知识点分属不同维度，各自独立统计） */
    { id: 'kp1', dim: 'review', n: '冠词与名词' },
    { id: 'kp2', dim: 'review', n: '介词与介词短语' },
    { id: 'kp3', dim: 'review', n: '定语从句' },
    { id: 'kp4', dim: 'review', n: '非谓语动词' },
    { id: 'kp5', dim: 'review', n: '虚拟语气' },
    { id: 'kp6', dim: 'review', n: '完形与语法填空·句法' },
    { id: 'kp7', dim: 'review', n: '阅读理解·主旨态度' },
    { id: 'kp8', dim: 'review', n: '应用文写作' }
];

/* ── 班级池：bias 为相对年级的教学偏置；76 班 valid=9 触发小样本保护；72 班未批阅 ── */
var RP_CLASSES = [
    { cls: '71', teacher: '王晓明', total: 35, submitted: 35, blank: 1, abnormal: 0, bias: 1.6,  sd: 11, seed: 71, status: 'reviewed', timeMed: 33 },
    { cls: '72', teacher: '李婷',   total: 35, submitted: 35, blank: 0, abnormal: 0, bias: 0,    sd: 12, seed: 72, status: 'pending' },
    { cls: '73', teacher: '张伟',   total: 35, submitted: 35, blank: 0, abnormal: 1, bias: 3.4,  sd: 10, seed: 73, status: 'reviewed', timeMed: 31 },
    { cls: '74', teacher: '陈静',   total: 35, submitted: 34, blank: 2, abnormal: 0, bias: 0.2,  sd: 13, seed: 74, status: 'reviewed', timeMed: 35 },
    { cls: '75', teacher: '刘洋',   total: 35, submitted: 33, blank: 0, abnormal: 0, bias: -3.4, sd: 14, seed: 75, status: 'reviewed', timeMed: 37 },
    { cls: '76', teacher: '赵磊',   total: 20, submitted: 15, blank: 3, abnormal: 3, bias: -5.2, sd: 16, seed: 76, status: 'reviewed', timeMed: 40 }
];
RP_CLASSES.forEach(function (c) { c.valid = c.status === 'reviewed' ? c.submitted - c.blank - c.abnormal : 0; });

/* ── 确定性伪随机（mulberry32）：刷新稳定 ── */
function rpRand(seed) {
    var a = seed >>> 0;
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
function rpClamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

/* ── 生成班级题级得分率 → 回算班级均分 / 年级均分（人数加权，方案 8.1） ── */
var RP_GRADE, RP_BEST;   /* 年级聚合 / 年级最优班：下方 IIFE 内回算，声明置顶避免 strict 模式未声明赋值 */
(function () {
    var totalScore = RP_QUESTIONS.reduce(function (s, q) { return s + q.score; }, 0);
    RP_CLASSES.forEach(function (c) {
        if (c.status !== 'reviewed') return;
        var r = rpRand(c.seed * 97 + 13);
        c.qRates = RP_QUESTIONS.map(function (q) {
            return Math.round(rpClamp(q.gradeBase + c.bias + (r() * 10 - 5), 8, 99) * 10) / 10;
        });
        c.mean = Math.round(RP_QUESTIONS.reduce(function (s, q, i) { return s + c.qRates[i] * q.score; }, 0) / totalScore * 10) / 10;
        /* 知识点得分率 = 该知识点关联题目得分率的题均（一道题关联多个知识点时，同时计入每个关联知识点；再加微小扰动） */
        var r2 = rpRand(c.seed * 31 + 7);
        c.kpRates = {};
        RP_KPS.forEach(function (k) {
            var qs = RP_QUESTIONS.map(function (q, i) { return q.kps.indexOf(k.id) >= 0 ? c.qRates[i] : null; }).filter(function (v) { return v !== null; });
            c.kpRates[k.id] = Math.round((qs.reduce(function (s, v) { return s + v; }, 0) / qs.length + (r2() * 4 - 2)) * 10) / 10;
        });
    });
    var reviewed = RP_CLASSES.filter(function (c) { return c.status === 'reviewed'; });
    var wSum = reviewed.reduce(function (s, c) { return s + c.valid; }, 0);
    RP_GRADE = {
        valid: wSum,
        mean: Math.round(reviewed.reduce(function (s, c) { return s + c.mean * c.valid; }, 0) / wSum * 10) / 10,
        qRates: RP_QUESTIONS.map(function (q, i) {
            return Math.round(reviewed.reduce(function (s, c) { return s + c.qRates[i] * c.valid; }, 0) / wSum * 10) / 10;
        }),
        kpRates: (function () {
            var o = {};
            RP_KPS.forEach(function (k) {
                o[k.id] = Math.round(reviewed.reduce(function (s, c) { return s + c.kpRates[k.id] * c.valid; }, 0) / wSum * 10) / 10;
            });
            return o;
        })(),
        timeMed: 34
    };
    /* 年级最优班（匿名聚合标签，R2 模块 2 用，不暴露班名） */
    RP_BEST = reviewed.slice().sort(function (a, b) { return b.mean - a.mean; })[0];
})();

/* ── 正态 CDF（Abramowitz-Stegun）→ 档位率 / 显著性 ── */
function rpPhi(z) {
    var t = 1 / (1 + 0.2316419 * Math.abs(z));
    var d = 0.3989423 * Math.exp(-z * z / 2);
    var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z >= 0 ? 1 - p : p;
}
/* 由均分/标准差近似四档占比（%）——累计口径，仅在拿不到学生明细时兜底 */
function rpTierRates(mean, sd) {
    var g = RP_CONFIG.grade;
    return {
        ex: Math.round((1 - rpPhi((g.ex - mean) / sd)) * 1000) / 10,
        good: Math.round((1 - rpPhi((g.good - mean) / sd)) * 1000) / 10,
        pass: Math.round((1 - rpPhi((g.pass - mean) / sd)) * 1000) / 10,
        low: Math.round(rpPhi((g.low - mean) / sd) * 1000) / 10
    };
}
/* 两比例 z 检验 → 显著性标记（R3/R4 班际差异） */
function rpZTest(x1, n1, x2, n2) {
    if (!n1 || !n2) return { z: 0, p: 1, mark: '' };
    var p1 = x1 / n1, p2 = x2 / n2, p = (x1 + x2) / (n1 + n2);
    if (p <= 0 || p >= 1) return { z: 0, p: 1, mark: '' };
    var se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));
    if (!se) return { z: 0, p: 1, mark: '' };
    var z = (p1 - p2) / se, pv = 2 * (1 - rpPhi(Math.abs(z)));
    return { z: Math.round(z * 100) / 100, p: pv, mark: pv < RP_CONFIG.sig.two ? '**' : (pv < RP_CONFIG.sig.one ? '*' : '') };
}
function rpSmall(c) { return c.valid < RP_CONFIG.smallSample; }
function rpPp(v) { var s = v > 0 ? '+' : (v < 0 ? '−' : ''); return s + Math.abs(Math.round(v * 10) / 10) + 'pp'; }
/* ── 得分率（%）↔ 平均分换算：满分取题目分值合计（RP_QUESTIONS Σ = 105），与导出元信息同一口径 ──
   KPI 里「平均分」与「得分率」两卡并列展示，换算只在展示层做，不回写任何比率；
   差值的单位随卡片走：平均分用「分」，得分率 / 各档率用「pp」 */
function rpFullScore() { return rpTotalScore(); }
function rpScoreOf(rate) { return Math.round(rate * rpTotalScore() / 100 * 10) / 10; }
function rpScoreDiff(v) { var s = v > 0 ? '+' : (v < 0 ? '−' : ''); return s + Math.abs(v).toFixed(1) + ' 分'; }
function rpKpLevel(rate) {
    return rate >= RP_CONFIG.kp.master ? 'master' : (rate >= RP_CONFIG.kp.weak ? 'weak' : 'none');
}
var RP_KP_LEVEL_NAME = { master: '掌握', weak: '薄弱', none: '未掌握' };

/* ── 知识点维度：元信息 / 维度内知识点 / 知识点归属（统一入口，避免各模块自行过滤） ── */
function rpDim(id) {
    var d = RP_KP_DIMS.find(function (x) { return x.id === (id || RP_KP_DIM_DEFAULT); });
    return d || RP_KP_DIMS[0];
}
function rpKpsOfDim(dim) {
    var d = rpDim(dim);
    return RP_KPS.filter(function (k) { return k.dim === d.id; });
}
function rpKpOf(id) { return RP_KPS.find(function (k) { return k.id === id; }); }
function rpKpDimOf(id) { var k = rpKpOf(id); return k ? rpDim(k.dim) : null; }
/* 维度均掌握率：该维度内知识点掌握率的算术平均；维度之间各算各的，不合并、不加权折算 */
function rpDimMean(rates, dim) {
    var ks = rpKpsOfDim(dim), n = ks.length;
    if (!n) return null;
    var s = ks.reduce(function (a, k) { return a + (rates[k.id] == null ? 0 : rates[k.id]); }, 0);
    return Math.round(s / n * 10) / 10;
}
/* 知识点 chip：data-dim 供样式区分维度（同步蓝 / 复习紫），title 标出所属维度 */
function rpKpChip(id) {
    var k = rpKpOf(id);
    if (!k) return '<span class="kp-chip">' + rpEsc(id) + '</span>';
    var d = rpDim(k.dim);
    return '<span class="kp-chip" data-dim="' + d.id + '" title="' + rpEsc(d.n) + '">' + rpEsc(k.n) + '</span>';
}

/* ── L3 学生层：为报告班级生成确定性学生（结构蓝本沿用讲评页 studentData 字段命名） ── */
var RP_SURN = ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
var RP_GIVEN = ['浩然', '雨桐', '子轩', '欣怡', '梓豪', '语嫣', '明哲', '思远', '佳琪', '博文', '若曦', '天宇', '梦瑶', '俊杰', '晓雯', '鹏飞', '雅静', '志强', '慧敏', '建国', '诗涵', '宇航', '嘉怡', '泽民', '婉清', '鸿煊', '静怡', '睿渊', '乐瑶', '昊然', '书瑶', '凯瑞', '芷若', '煜城', '曼雯'];
var RP_STU_CACHE = {};   /* 学生花名册确定性生成，缓存后多处调用（题级失分 / 未掌握人数 / 分层）不再重复造人 */
function rpStudents(cls) {
    if (RP_STU_CACHE[cls]) return RP_STU_CACHE[cls];
    var c = RP_CLASSES.find(function (x) { return x.cls === cls; });
    if (!c || c.status !== 'reviewed') return [];
    var r = rpRand(c.seed * 131 + 5), arr = [], i;
    for (i = 0; i < c.submitted; i++) {
        var u = r() + r() + r();                       /* 近似正态 */
        var rate = Math.round(rpClamp(c.mean + (u - 1.5) / 1.5 * c.sd * 1.4, 6, 100) * 10) / 10;
        var blank = r() < 0.14 ? 2 + Math.floor(r() * 2) : (r() < 0.2 ? 1 : 0);
        arr.push({
            name: RP_SURN[i % RP_SURN.length] + RP_GIVEN[(i * 7 + c.seed) % RP_GIVEN.length],
            examNum: '2026' + cls + String(i + 1).padStart(2, '0'),
            scoreRate: rate,
            blankCount: i < c.blank ? Math.max(blank, 2) : blank,
            timeUsed: Math.round(24 + r() * 20),
            status: i < c.blank ? 'blank' : (i < c.blank + c.abnormal ? 'abnormal' : 'normal')
        });
    }
    arr.sort(function (a, b) { return b.scoreRate - a.scoreRate; });
    /* 年级排名按「班内名次 × 年级/本班样本比 + 班均偏置」折算：班内名次越靠前，年级名次必然越靠前（同增同减，不再有并列倒挂） */
    var gScale = c.valid ? RP_GRADE.valid / c.valid : 1;
    var gOff = Math.round((RP_GRADE.mean - c.mean) * 1.2);
    arr.forEach(function (s, idx) {
        s.classRank = idx + 1;
        s.gradeRank = Math.max(1, Math.round((idx + 0.5) * gScale) + gOff);
        /* 预警规则（单次口径：只用「本次低分」「本次答题异常」两条） */
        s.tags = [];
        if (s.status !== 'blank' && s.scoreRate <= 70) s.tags.push('本次低分');
        if (s.blankCount >= 2) s.tags.push('本次答题异常');
        /* 薄弱知识点：每个维度各取该维度最弱一个，带维度前缀（维度独立，不跨维度混排） */
        s.weak = RP_KP_DIMS.map(function (d) {
            var ks = rpKpsOfDim(d.id).slice().sort(function (a, b) { return c.kpRates[a.id] - c.kpRates[b.id]; });
            return ks.length ? d.short + '·' + ks[0].n : null;
        }).filter(Boolean);
    });
    RP_STU_CACHE[cls] = arr;
    return arr;
}
/* 某题做错的学生名单（客观题按选项分布、主观题按得分率反推） */
function rpWrongStudents(cls, qIdx) {
    var c = RP_CLASSES.find(function (x) { return x.cls === cls; });
    var stus = rpStudents(cls);
    var q = RP_QUESTIONS[qIdx];
    var pWrong = 1 - (c.qRates[qIdx] || 0) / 100;
    return stus.filter(function (s, i) {
        if (s.status === 'blank') return true;
        var r = rpRand(c.seed * 1000 + qIdx * 97 + i)();
        return r < pWrong * (s.scoreRate < c.mean ? 1.25 : 0.8);
    });
}
/* 客观题选项分布（人数，正确项占比 = 得分率） */
function rpOptionDist(cls, qIdx) {
    var c = RP_CLASSES.find(function (x) { return x.cls === cls; });
    var q = RP_QUESTIONS[qIdx];
    if (q.type !== 'obj') return null;
    var r = rpRand(c.seed * 500 + qIdx * 31);
    var correct = Math.round(c.valid * (c.qRates[qIdx] || 0) / 100);
    var rest = c.valid - correct, keys = ['A', 'B', 'C', 'D'].filter(function (k) { return k !== q.correct; });
    var w = keys.map(function () { return 0.4 + r(); }), wSum = w.reduce(function (s, v) { return s + v; }, 0);
    var out = [], left = rest;
    keys.forEach(function (k, i) {
        var v = i === keys.length - 1 ? left : Math.round(rest * w[i] / wSum);
        left -= v; out.push({ k: k, v: v, correct: false });
    });
    out.push({ k: q.correct, v: correct, correct: true });
    return out.sort(function (a, b) { return a.k < b.k ? -1 : 1; });
}

/* ════ 未交名单：本次未提交的学生 ════
   未提交不按 0 分计入学业指标，只影响提交率；名单供教师催交（不参与任何均值 / 档位计算） */
function rpUnsubmitted(cls) {
    var c = RP_CLASSES.find(function (x) { return x.cls === cls; });
    if (!c || c.status !== 'reviewed') return [];
    var lack = Math.max(0, c.total - c.submitted), out = [];
    for (var i = 0; i < lack; i++) {
        var k = c.submitted + i;
        out.push({
            name: RP_SURN[k % RP_SURN.length] + RP_GIVEN[(k * 7 + c.seed + 3) % RP_GIVEN.length],
            examNum: '2026' + cls + String(k + 1).padStart(2, '0'),
            status: '未提交'
        });
    }
    return out;
}

/* ════ 学生级题目得分率（演示派生） ════
   班级题级得分率 + 个人偏差×0.9 + ±3 的确定性抖动；只服务于「分层建议」的组内题级统计，
   不回写任何班 / 年级 KPI，避免出现两套均分口径 */
function rpStuQRates(s, cls) {
    var c = RP_CLASSES.find(function (x) { return x.cls === cls; });
    var off = s.scoreRate - c.mean;
    var h = parseInt((s.examNum || '0').slice(-2), 10) || 0;
    return RP_QUESTIONS.map(function (q, i) {
        return Math.round(rpClamp(c.qRates[i] + off * 0.9 + ((h + i * 7) % 5 - 2) * 1.5, 3, 100) * 10) / 10;
    });
}
/* 知识点未掌握人数（题目级近似）：取该知识点关联题中得分率最低一题的做错人数。
   生产接入学生 × 知识点明细后应改为真实未掌握人数（方案 9.3 P2 知识图谱映射） */
function rpKpWeakN(cls, kpId) {
    var c = RP_CLASSES.find(function (x) { return x.cls === cls; });
    if (!c || !c.qRates) return 0;
    var idx = -1;
    RP_QUESTIONS.forEach(function (q, i) {
        if (q.kps.indexOf(kpId) < 0) return;
        if (idx < 0 || c.qRates[i] < c.qRates[idx]) idx = i;
    });
    return idx < 0 ? 0 : rpWrongStudents(cls, idx).length;
}
/* ════ 班内三层（前 30% / 中间 50% / 后 20%） ════
   与模块 2 的四档不是一套口径：四档看「离及格 / 优秀的绝对距离」，分层看「班内该分几层、各层补什么」。
   人数在各班内自洽（∑层 = 有效样本），不跳班比较；结果缓存：分层只跟分数有关，报告内多次调用不重算 */
var RP_LAYER_CACHE = {};
function rpLayers(cls, dim) {
    var d = rpDim(dim), ck = cls + '|' + d.id;   /* 缓存按班 + 维度分开：切维度不能拿到另一个维度的结果 */
    if (RP_LAYER_CACHE[ck]) return RP_LAYER_CACHE[ck];
    var m = rpMetrics(cls), stus = rpValidStudents(cls), n = stus.length;
    if (!n) return [];
    var sorted = stus.slice().sort(function (a, b) { return b.scoreRate - a.scoreRate; });
    var nA = Math.min(Math.max(1, Math.round(n * 0.3)), n - 1);
    var nC = Math.min(Math.max(1, Math.round(n * 0.2)), n - nA);
    var groups = [
        { key: 'A', name: 'A 层', sub: '前 30%', arr: sorted.slice(0, nA) },
        { key: 'B', name: 'B 层', sub: '中间 50%', arr: sorted.slice(nA, n - nC) },
        { key: 'C', name: 'C 层', sub: '后 20%', arr: sorted.slice(n - nC) }
    ];
    var out = groups.filter(function (g) { return g.arr.length; }).map(function (g) {
        var rates = g.arr.map(function (s) { return s.scoreRate; });
        var mean = Math.round(rates.reduce(function (a, b) { return a + b; }, 0) / rates.length * 10) / 10;
        var memberRates = g.arr.map(function (s) { return rpStuQRates(s, cls); });
        var qRates = RP_QUESTIONS.map(function (q, i) {
            return Math.round(memberRates.reduce(function (a, o) { return a + o[i]; }, 0) / memberRates.length * 10) / 10;
        });
        var lost = RP_QUESTIONS.map(function (q, i) { return Math.round(g.arr.length * q.score * (1 - qRates[i] / 100)); });
        var topI = lost.indexOf(Math.max.apply(null, lost));
        var kpList = rpKpsOfDim(d.id).map(function (k) {
            var idxs = RP_QUESTIONS.map(function (q, i) { return q.kps.indexOf(k.id) >= 0 ? i : -1; }).filter(function (i) { return i >= 0; });
            var v = idxs.reduce(function (a, i) { return a + qRates[i]; }, 0) / (idxs.length || 1);
            return { id: k.id, n: k.n, v: Math.round(v * 10) / 10 };
        }).sort(function (a, b) { return a.v - b.v; });
        return {
            key: g.key, name: g.name, sub: g.sub, cnt: g.arr.length,
            pct: Math.round(g.arr.length / n * 1000) / 10,
            mean: mean, d: Math.round((mean - m.mean) * 10) / 10,
            min: Math.round(Math.min.apply(null, rates) * 10) / 10,
            max: Math.round(Math.max.apply(null, rates) * 10) / 10,
            exN: g.arr.filter(function (s) { return s.scoreRate >= RP_CONFIG.grade.ex; }).length,
            passN: g.arr.filter(function (s) { return s.scoreRate >= RP_CONFIG.grade.pass; }).length,
            topQ: RP_QUESTIONS[topI].no, topQlost: lost[topI],
            weakKp: kpList[0], members: g.arr
        };
    });
    RP_LAYER_CACHE[ck] = out;
    return out;
}

/* ════ 需讲评判定：三种来源取并集（缺一不可） ════
   ① 学生端标记（学生自己点「没懂 / 需讲」） ② 教师端标记（批改时手动标记）
   ③ 得分率默认标记（得分率 < 讲评阈值，默认 RP_CONFIG.lecture = 70%，报告内可调）
   返回 null 表示不需讲评；否则返回 { k, n } 供徽标渲染 */
function rpMarkSource(rate, idx, thr) {
    var q = RP_QUESTIONS[idx];
    if (q && q.marked === 'stu') return { k: 'stu', n: '学生标记' };
    if (q && q.marked === 'tea') return { k: 'tea', n: '教师标记' };
    return rate < (thr == null ? RP_CONFIG.lecture : thr) ? { k: 'rate', n: '得分率默认' } : null;
}
function rpNeedLect(rate, idx, thr) { return !!rpMarkSource(rate, idx, thr); }
function rpMarkTag(rate, idx, thr) {
    var s = rpMarkSource(rate, idx, thr);
    return s ? '<span class="tag-src ' + s.k + '">' + s.n + '</span>' : '';
}

/* ── L4 错因层 ── */
var RP_CAUSES = [
    { id: 'c1', n: '语境线索忽略', color: '#2468f2' },
    { id: 'c2', n: '固定搭配记忆混淆', color: '#40a9ff' },
    { id: 'c3', n: '从句结构分析错误', color: '#fa8c16' },
    { id: 'c4', n: '逻辑主语判断失误', color: '#9254de' },
    { id: 'c5', n: '时态参照点错位', color: '#606266' },
    { id: 'c6', n: '要点覆盖不全·格式失范', color: '#cf1322' }
];
/* ── L4 错因层：逐题 × 逐生错因归属 ──
   错因先落到题（每题一组权重 cw = 各错因承担该题做错学生的比例），再落到人：
   「做错某题的学生」按该题权重确定性地分配到各错因类别。同一份分配同时供给
   ①「按题目看班级汇总错因」②「按学生看各小题错因」两个视图 —— 两边人次逐题可对账，
   不会出现同一份数据两套口径。人次 = 学生 × 题目（演示派生，确定性：刷新稳定） */
var RP_QCAUSE_CACHE = {};
function rpQCauseIds(q) {
    var w = q.cw || {};
    var ids = Object.keys(w).sort(function (a, b) { return (w[b] || 0) - (w[a] || 0); });
    if (!ids.length) ids = [q.cause];
    return ids;
}
/* 某班逐题 × 逐生的错因归属 */
function rpQCauseMap(cls) {
    if (RP_QCAUSE_CACHE[cls] !== undefined) return RP_QCAUSE_CACHE[cls];
    var c = RP_CLASSES.find(function (x) { return x.cls === cls; });
    if (!c || c.status !== 'reviewed') { RP_QCAUSE_CACHE[cls] = null; return null; }
    var byStu = {}, byQ = [];
    RP_QUESTIONS.forEach(function (q, i) {
        var ids = rpQCauseIds(q), acc = [], sum = 0;
        ids.forEach(function (id) { sum += (q.cw[id] || 0); acc.push(sum); });
        var counts = {};
        ids.forEach(function (id) { counts[id] = 0; });
        var rows = [];
        rpWrongStudents(cls, i).forEach(function (s, si) {
            var r = rpRand(c.seed * 613 + i * 977 + si * 31 + 3)();
            var pick = ids[ids.length - 1];
            for (var k = 0; k < ids.length; k++) { if (r * (sum || 1) < acc[k]) { pick = ids[k]; break; } }
            counts[pick]++;
            if (!byStu[s.examNum]) byStu[s.examNum] = {};
            byStu[s.examNum][i] = pick;
            rows.push({ stu: s, cause: pick });
        });
        byQ.push({ i: i, q: q, ids: ids, counts: counts, rows: rows, wrong: rows.length });
    });
    var map = { cls: cls, byQ: byQ, byStu: byStu };
    RP_QCAUSE_CACHE[cls] = map;
    return map;
}
/* 年级逐题错因归属 = 各已批阅班级的逐生归属叠加（与班级同一套模型，只是跨班合并） */
var RP_GCAUSE_CACHE = null;
function rpGradeCauseMap() {
    if (RP_GCAUSE_CACHE) return RP_GCAUSE_CACHE;
    var maps = [];
    RP_CLASSES.filter(function (c) { return c.status === 'reviewed'; }).forEach(function (c) {
        var m = rpQCauseMap(c.cls); if (m) maps.push(m);
    });
    var byQ = RP_QUESTIONS.map(function (q, i) {
        var counts = {}, wrong = 0;
        RP_CAUSES.forEach(function (cs) { counts[cs.id] = 0; });
        maps.forEach(function (m) {
            m.byQ[i].ids.forEach(function (id) { counts[id] += m.byQ[i].counts[id] || 0; });
            wrong += m.byQ[i].wrong;
        });
        return { i: i, q: q, ids: rpQCauseIds(q), counts: counts, rows: [], wrong: wrong };
    });
    RP_GCAUSE_CACHE = { byQ: byQ };
    return RP_GCAUSE_CACHE;
}
/* 按最大余数法把一个整数总量分摊到若干份：保证 Σ 各份 = 总量
   （直接各份四舍五入会累加误差，出现「各错因失分之和 ≠ 该题全班失分」） */
function rpAllocate(total, parts) {
    var out = {};
    if (!parts || !parts.length) return out;
    var base = parts.map(function (p) {
        var v = Math.floor(p.raw);
        return { id: p.id, v: v, rem: p.raw - v };
    });
    var sum = base.reduce(function (a, b) { return a + b.v; }, 0);
    var diff = Math.round(total) - sum;
    var order = base.slice().sort(function (a, b) { return b.rem - a.rem; });
    var n = order.length, idx = 0;
    while (diff > 0) { order[idx % n].v += 1; diff--; idx++; }
    while (diff < 0) { order[n - 1 - (idx % n)].v -= 1; diff++; idx++; }
    base.forEach(function (b) { out[b.id] = b.v; });
    return out;
}
/* 某题错因构成行：人次 / 占比 / 失分（该题全班失分按做错人数均摊后，再按错因归属拆分）
   失分与占比均用最大余数法分配，保证 Σ 各错因失分 = 该题全班失分、Σ 占比 = 100% */
function rpCauseRowsOf(map, i, valid, rate) {
    if (!map || !map.byQ[i]) return [];
    var row = map.byQ[i];
    var lostQ = Math.round(valid * row.q.score * (1 - rate / 100));
    var share = row.wrong ? lostQ / row.wrong : 0;
    var parts = row.ids.map(function (id) {
        return { id: id, n: row.counts[id] || 0, raw: share * (row.counts[id] || 0) };
    }).filter(function (p) { return p.n > 0; });
    var lostMap = rpAllocate(lostQ, parts);
    var pctMap = rpAllocate(100, parts.map(function (p) {
        return { id: p.id, raw: row.wrong ? p.n / row.wrong * 100 : 0 };
    }));
    return parts.map(function (p) {
        var cs = RP_CAUSES.find(function (x) { return x.id === p.id; }) || { id: p.id, n: p.id, color: '#c0c4cc' };
        return {
            id: p.id, n: cs.n, color: cs.color, cnt: p.n,
            pct: pctMap[p.id], lost: lostMap[p.id],
            main: p.id === row.q.cause
        };
    }).sort(function (a, b) { return b.cnt - a.cnt; });
}
function rpQCauseRows(cls, i) {
    var c = RP_CLASSES.find(function (x) { return x.cls === cls; });
    if (!c) return [];
    return rpCauseRowsOf(rpQCauseMap(cls), i, c.valid, c.qRates[i] || 0);
}
function rpGradeQCauseRows(i) {
    return rpCauseRowsOf(rpGradeCauseMap(), i, RP_GRADE.valid, RP_GRADE.qRates[i] || 0);
}
/* 班级错因汇总：= 逐题人次求和（与「按题目」「按学生」两视图同源，人次可对账）
   失分取逐题 rpCauseRowsOf 的同一份分配累加，故 Σ 各错因失分 = Σ 各题全班失分（严格相等） */
function rpCauseStats(cls) {
    var map = rpQCauseMap(cls);
    if (!map) return [];
    var c = RP_CLASSES.find(function (x) { return x.cls === cls; });
    var agg = {};
    RP_CAUSES.forEach(function (cs) { agg[cs.id] = { id: cs.id, n: cs.n, color: cs.color, qs: [], cnt: 0, stu: 0, lost: 0 }; });
    map.byQ.forEach(function (row) {
        rpCauseRowsOf(map, row.i, c.valid, c.qRates[row.i] || 0).forEach(function (r) {
            var a = agg[r.id]; if (!a) return;
            a.cnt += r.cnt; a.lost += r.lost; a.qs.push(row.q.no);
        });
    });
    return RP_CAUSES.map(function (cs) {
        var a = agg[cs.id], stu = 0;
        Object.keys(map.byStu).forEach(function (k) {
            var m = map.byStu[k], has = false;
            for (var i in m) { if (m[i] === cs.id) { has = true; break; } }
            if (has) stu++;
        });
        return { id: cs.id, n: cs.n, color: cs.color, qs: a.qs, cnt: a.cnt, stu: stu, lost: a.lost };
    }).filter(function (x) { return x.cnt > 0; }).sort(function (a, b) { return b.cnt - a.cnt; });
}
/* 年级错因汇总（按题目聚合，不分知识点维度）：与班级同一套模型（各已批阅班逐生归属叠加），
   供班级报告「本班 × 年级」错因对照；lost 与本班同口径（同为逐题最大余数法分配） */
function rpGradeCauseStats() {
    var map = rpGradeCauseMap();
    var agg = {};
    RP_CAUSES.forEach(function (cs) { agg[cs.id] = { id: cs.id, n: cs.n, color: cs.color, qs: [], cnt: 0, lost: 0 }; });
    map.byQ.forEach(function (row) {
        rpCauseRowsOf(map, row.i, RP_GRADE.valid, RP_GRADE.qRates[row.i] || 0).forEach(function (r) {
            var a = agg[r.id]; if (!a) return;
            a.cnt += r.cnt; a.lost += r.lost; a.qs.push(row.q.no);
        });
    });
    return RP_CAUSES.map(function (cs) {
        var a = agg[cs.id];
        return { id: cs.id, n: cs.n, color: cs.color, qs: a.qs, cnt: a.cnt, lost: a.lost };
    }).filter(function (x) { return x.cnt > 0; }).sort(function (a, b) { return b.cnt - a.cnt; });
}

/* ── L5 历史层：接口桩，本版不消费（单次作业口径，报告不做跨次对比） ── */
var RP_PREV = [];
function rpHasHistory() { return RP_PREV.length > 0; }

/* ══════════════════════ 指标层：档位 / KPI / 分布（口径集中，页面不各自计算） ══════════════════════
   档位为「累计口径」：优秀 ≥ ex、良好 ≥ good、及格 ≥ pass、低分 < low。
   阈值全部来自 RP_CONFIG.grade（= 生产「设置等级」同一份配置），报告不自设第二套档位；
   方案模块 1 表格里写的 85% / 40% 与此冲突，统一以配置为准。 */
var RP_TIERS = [
    { k: 'ex', n: '优秀', hit: function (r) { return r >= RP_CONFIG.grade.ex; }, rule: function () { return '得分率 ≥ ' + RP_CONFIG.grade.ex + '%'; } },
    { k: 'good', n: '良好', hit: function (r) { return r >= RP_CONFIG.grade.good; }, rule: function () { return '得分率 ≥ ' + RP_CONFIG.grade.good + '%'; } },
    { k: 'pass', n: '及格', hit: function (r) { return r >= RP_CONFIG.grade.pass; }, rule: function () { return '得分率 ≥ ' + RP_CONFIG.grade.pass + '%'; } },
    { k: 'low', n: '低分', hit: function (r) { return r < RP_CONFIG.grade.low; }, rule: function () { return '得分率 < ' + RP_CONFIG.grade.low + '%'; } }
];
function rpMedian(a) {
    if (!a.length) return null;
    var s = a.slice().sort(function (x, y) { return x - y; }), m = s.length >> 1;
    return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2 * 10) / 10;
}
function rpSd(vals, mean) {
    if (vals.length < 2) return 0;
    var s = vals.reduce(function (a, v) { return a + (v - mean) * (v - mean); }, 0);
    return Math.round(Math.sqrt(s / (vals.length - 1)) * 10) / 10;
}
function rpValidStudents(cls) { return rpStudents(cls).filter(function (s) { return s.status === 'normal'; }); }
function rpTierCounts(stus) {
    var n = stus.length, o = { n: n };
    RP_TIERS.forEach(function (t) {
        var cnt = stus.filter(function (s) { return t.hit(s.scoreRate); }).length;
        o[t.k] = cnt;
        o[t.k + 'Rate'] = n ? Math.round(cnt / n * 1000) / 10 : null;
    });
    return o;
}
function rpTiers(cls) { return rpTierCounts(rpValidStudents(cls)); }
function rpGradeStudents() {
    var arr = [];
    RP_CLASSES.forEach(function (c) { if (c.status === 'reviewed') arr = arr.concat(rpValidStudents(c.cls)); });
    return arr;
}
function rpReviewedClasses(excludeSmall) {
    return RP_CLASSES.filter(function (c) { return c.status === 'reviewed' && (!excludeSmall || !rpSmall(c)); });
}
/* 班级 KPI 集（R1 模块 1 四卡 + 小注 / R3 模块 1 速览共用） */
function rpMetrics(cls) {
    var c = RP_CLASSES.find(function (x) { return x.cls === cls; });
    if (!c || c.status !== 'reviewed') return null;
    var stus = rpValidStudents(cls), m = rpTierCounts(stus);
    var rates = stus.map(function (s) { return s.scoreRate; });
    m.cls = cls; m.teacher = c.teacher; m.total = c.total; m.submitted = c.submitted;
    m.valid = stus.length;
    m.blank = c.blank; m.abnormal = c.abnormal;
    m.subRate = Math.round(c.submitted / c.total * 1000) / 10;
    m.mean = c.mean;
    m.sd = rpSd(rates, c.mean);
    m.timeMed = rpMedian(stus.map(function (s) { return s.timeUsed; }));
    m.max = rates.length ? Math.round(Math.max.apply(null, rates) * 10) / 10 : null;
    m.min = rates.length ? Math.round(Math.min.apply(null, rates) * 10) / 10 : null;
    m.small = rpSmall(c);
    return m;
}
/* 年级 KPI 集：有效人数加权（方案 8.1），非班级简单平均 */
function rpGradeMetrics() {
    var stus = rpGradeStudents(), m = rpTierCounts(stus);
    var rates = stus.map(function (s) { return s.scoreRate; });
    var tSum = RP_CLASSES.reduce(function (s, c) { return s + c.total; }, 0);
    var sSum = RP_CLASSES.reduce(function (s, c) { return s + c.submitted; }, 0);
    m.valid = stus.length;
    m.mean = RP_GRADE.mean;
    m.sd = rpSd(rates, RP_GRADE.mean);
    m.timeMed = RP_GRADE.timeMed;
    m.subRate = Math.round(sSum / tSum * 1000) / 10;
    m.total = tSum; m.submitted = sSum;
    m.clsCount = RP_CLASSES.length;
    m.reviewedCount = rpReviewedClasses().length;
    return m;
}
/* 得分分布直方图：本班人数柱 + 年级同规模折算曲线；本班空档且相邻有人 → 断层带（hl） */
function rpHist(cls) {
    var stus = rpValidStudents(cls), n = stus.length, g = rpGradeStudents(), gn = g.length;
    var inBin = function (s, lo, hi) { return s.scoreRate >= lo && s.scoreRate < hi; };
    var bins = [], i;
    for (i = 0; i < 10; i++) {
        var lo = i * 10, hi = lo + 10;
        var v = stus.filter(function (s) { return inBin(s, lo, hi === 100 ? 101 : hi); }).length;
        var gv = g.filter(function (s) { return inBin(s, lo, hi === 100 ? 101 : hi); }).length;
        bins.push({ lb: lo + '–' + hi, v: v, gv: n && gn ? Math.round(gv / gn * n * 10) / 10 : 0, hl: false });
    }
    for (i = 1; i < bins.length - 1; i++) {
        if (bins[i].v === 0 && bins[i - 1].v > 0 && bins[i + 1].v > 0) bins[i].hl = true;
    }
    return bins;
}
/* 班级排名（按平均得分率，仅已批阅班级参与） */
function rpRank(cls) {
    var sorted = rpReviewedClasses().slice().sort(function (a, b) { return b.mean - a.mean; });
    var idx = -1;
    sorted.forEach(function (c, i) { if (c.cls === cls) idx = i; });
    return { rank: idx + 1, total: sorted.length, list: sorted };
}
/* 年级共性薄弱：年级掌握率 < 掌握线 或 未达掌握线的班级覆盖 ≥ commonWeakCover（方案 R2 模块 5 / R4 模块 2）
   只看一个维度：各维度知识点独立判定，不做维度合并，也不因为其它维度薄弱而连带命中 */
function rpCommonWeak(dim) {
    var pool = rpReviewedClasses(true);
    return rpKpsOfDim(dim).map(function (k) {
        var weak = pool.filter(function (c) { return c.kpRates[k.id] < RP_CONFIG.kp.master; });
        var cover = pool.length ? weak.length / pool.length : 0;
        var lowGrade = RP_GRADE.kpRates[k.id] < RP_CONFIG.kp.master;
        return {
            id: k.id, n: k.n, gradeRate: RP_GRADE.kpRates[k.id],
            weakCnt: weak.length, poolCnt: pool.length,
            cover: Math.round(cover * 1000) / 10,
            weakCls: weak.map(function (c) { return c.cls; }),
            hit: lowGrade || cover >= RP_CONFIG.commonWeakCover,
            reason: lowGrade && cover >= RP_CONFIG.commonWeakCover ? '年级掌握率未达掌握线 + 薄弱班覆盖达标'
                : (lowGrade ? '年级掌握率未达掌握线（< ' + RP_CONFIG.kp.master + '%）' : '薄弱班覆盖 ' + Math.round(cover * 100) + '% ≥ ' + Math.round(RP_CONFIG.commonWeakCover * 100) + '%')
        };
    }).sort(function (a, b) { return a.gradeRate - b.gradeRate; });
}
/* 知识点 id 数组 → 名称串：按维度分组（同步：A / B；复习：C），不把不同维度知识点串成一个整体 */
function rpKpNames(ids) {
    var groups = {};
    (ids || []).forEach(function (id) {
        var k = rpKpOf(id), d = k ? rpDim(k.dim) : null;
        var key = d ? d.id : 'other';
        (groups[key] = groups[key] || { d: d, names: [] }).names.push(k ? k.n : id);
    });
    return RP_KP_DIMS.filter(function (d) { return groups[d.id]; }).map(function (d) {
        return d.short + '：' + groups[d.id].names.join(' / ');
    }).join('；') || '—';
}
/* 年级错因 × 知识点 人次矩阵（由题级得分率 + 题目映射推算）
   错因按题目聚合，不设知识点维度：列取全量知识点，只有知识点分析类模块才按维度过滤；
   行合计（人次）= 该错因全量人次，与 rpGradeCauseStats 同口径 */
function rpCauseKpMatrix() {
    var ks = RP_KPS, map = rpGradeCauseMap();
    return RP_CAUSES.map(function (cs) {
        var row = { id: cs.id, n: cs.n, color: cs.color, cells: {}, total: 0 };
        ks.forEach(function (k) { row.cells[k.id] = 0; });
        /* 与 m5 错因分析同一套逐生归属（年级 = 各已批阅班叠加）：行合计 = 该错因全量人次 */
        map.byQ.forEach(function (r) {
            var v = r.counts[cs.id] || 0;
            if (!v) return;
            row.total += v;
            r.q.kps.forEach(function (kid) { if (row.cells[kid] != null) row.cells[kid] += v; });
        });
        return row;
    }).sort(function (a, b) { return b.total - a.total; });
}
/* 年级典型错题 TOP N（按年级得分率升序） */
function rpTopWrong(n) {
    return RP_QUESTIONS.map(function (q, i) {
        var cs = RP_CAUSES.find(function (x) { return x.id === q.cause; });
        return {
            idx: i, no: q.no, stem: q.stem, type: q.type, score: q.score, rate: RP_GRADE.qRates[i],
            kp: rpKpNames(q.kps) || '—', cause: cs ? cs.n : '—',
            lost: Math.round(RP_GRADE.valid * q.score * (1 - RP_GRADE.qRates[i] / 100))
        };
    }).sort(function (a, b) { return a.rate - b.rate; }).slice(0, n);
}
/* 年级选项混淆对（客观题：正确项 vs 最高错误项，人数跨班汇总） */
function rpConfusePairs(dim) {
    var d = dim ? rpDim(dim) : null;
    var out = [];
    RP_QUESTIONS.forEach(function (q, i) {
        if (q.type !== 'obj') return;
        /* 传 dim 时只保留挂了该维度知识点的题，知识点文本也只列该维度内的 */
        var kpIds = d ? q.kps.filter(function (id) { var kd = rpKpDimOf(id); return kd && kd.id === d.id; }) : q.kps;
        if (d && !kpIds.length) return;
        var agg = {};
        rpReviewedClasses(true).forEach(function (c) {
            (rpOptionDist(c.cls, i) || []).forEach(function (o) { agg[o.k] = (agg[o.k] || 0) + o.v; });
        });
        var wrong = Object.keys(agg).filter(function (k) { return k !== q.correct; })
            .sort(function (a, b) { return agg[b] - agg[a]; });
        if (!wrong.length) return;
        var tot = Object.keys(agg).reduce(function (s, k) { return s + agg[k]; }, 0) || 1;
        out.push({
            no: q.no, kp: kpIds.map(function (id) { var k = rpKpOf(id); return k ? k.n : id; }).join(' / ') || '—',
            correct: q.correct, correctPc: Math.round(agg[q.correct] / tot * 1000) / 10,
            wrong: wrong[0], wrongPc: Math.round(agg[wrong[0]] / tot * 1000) / 10
        });
    });
    return out.sort(function (a, b) { return b.wrongPc - a.wrongPc; });
}

/* ══════════════════════ SVG 图表库（纯 SVG，打印友好） ══════════════════════ */
function rpEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
/* 重点模块星标：12px 实心星形（与全站 SVG 图标同一语言，替掉 emoji ⭐，随文字色走 --rp-warn） */
function rpStar() {
    return '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"/></svg>';
}
function rpY(v, H, PT, PB, max) { return PT + (1 - v / max) * (H - PT - PB); }

/* 柱 + 折线（逐题得分率：本班柱 + 年级线；threshold 以下柱标红）
   v2 密度：W 不动（决定字号缩放比，动了会连带打印字号变差），只降 H —— 图形纵向留白收紧，文字尺寸不变
   v3 左右结构：图进 .rp-cols 左栏（宽约 560–720px）时，1000 宽 viewBox 会被缩到 0.6–0.7 倍、字号掉到 7px；
   因此开放 o.w（建议 640）让渲染比例回到 ≈1，字号回到 10–11px 档；全宽场景不传 w，行为与之前完全一致 */
function rpSvgBarLine(o) {
    var W = o.w || 1000, H = o.h || 210, PL = 40, PR = 12, PT = 16, PB = 30, max = 100;
    var n = o.labels.length, iw = (W - PL - PR) / n, bw = Math.min(34, iw * 0.5);
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + rpEsc(o.aria || '柱状折线图') + '">';
    [0, 25, 50, 75, 100].forEach(function (g) {
        var y = rpY(g, H, PT, PB, max);
        s += '<line x1="' + PL + '" y1="' + y + '" x2="' + (W - PR) + '" y2="' + y + '" stroke="#eef1f5" stroke-width="1"/>' +
             '<text x="' + (PL - 6) + '" y="' + (y + 3.5) + '" font-size="10" fill="#909399" text-anchor="end">' + g + '</text>';
    });
    if (o.threshold != null) {
        var ty = rpY(o.threshold, H, PT, PB, max);
        s += '<line x1="' + PL + '" y1="' + ty + '" x2="' + (W - PR) + '" y2="' + ty + '" stroke="#cf1322" stroke-width="1" stroke-dasharray="5 4"/>' +
             '<text x="' + (W - PR) + '" y="' + (ty - 4) + '" font-size="10" fill="#cf1322" text-anchor="end">讲评阈值 ' + o.threshold + '%</text>';
    }
    var pts = [];
    o.labels.forEach(function (lb, i) {
        var cx = PL + iw * i + iw / 2;
        var v = o.bars[i], y = rpY(v, H, PT, PB, max);
        var fill = (o.threshold != null && v < o.threshold) ? '#cf1322' : '#2468f2';
        s += '<rect x="' + (cx - bw / 2) + '" y="' + y + '" width="' + bw + '" height="' + (H - PB - y) + '" rx="2" fill="' + fill + '"><title>' + rpEsc(lb) + ' 本班 ' + v + '%</title></rect>';
        if (o.line) {
            pts.push(cx + ',' + rpY(o.line[i], H, PT, PB, max));
            s += '<circle cx="' + cx + '" cy="' + rpY(o.line[i], H, PT, PB, max) + '" r="2.6" fill="#606266"><title>' + rpEsc(lb) + ' 年级 ' + o.line[i] + '%</title></circle>';
        }
        s += '<text x="' + cx + '" y="' + (H - 10) + '" font-size="10.5" fill="#606266" text-anchor="middle">' + rpEsc(lb) + '</text>';
    });
    if (pts.length) s += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="#606266" stroke-width="1.6" stroke-dasharray="5 4"/>';
    return s + '</svg>';
}

/* 三线对标：本班柱 + 年级最优班（匿名）实线 + 年级平均虚线；gapIdx 标出差距最大题。
   教师统一在班级报告 m8 使用；R4 不暴露该匿名对标视图。 */
function rpSvg3Line(o) {
    var W = o.w || 1000, H = o.h || 220, PL = 40, PR = 12, PT = 18, PB = 30, max = 100;
    var n = o.labels.length, iw = (W - PL - PR) / n, bw = Math.min(34, iw * 0.5);
    var y = function (v) { return rpY(v, H, PT, PB, max); };
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="我的班、年级最优班与年级平均三线对比图">';
    [0, 25, 50, 75, 100].forEach(function (g) {
        s += '<line x1="' + PL + '" y1="' + y(g) + '" x2="' + (W - PR) + '" y2="' + y(g) + '" stroke="#eef1f5"/>'
            + '<text x="' + (PL - 6) + '" y="' + (y(g) + 3.5) + '" font-size="10" fill="#909399" text-anchor="end">' + g + '</text>';
    });
    var pb = [], pg = [];
    o.labels.forEach(function (lb, i) {
        var cx = PL + iw * i + iw / 2, gap = o.gapIdx.indexOf(i) > -1, v = o.mine[i];
        s += '<rect x="' + (cx - bw / 2) + '" y="' + y(v) + '" width="' + bw + '" height="' + (H - PB - y(v)) + '" rx="2" fill="' + (gap ? '#cf1322' : '#8fb5fa') + '"><title>' + rpEsc(lb) + ' 我的班 ' + v + '%</title></rect>';
        pb.push(cx + ',' + y(o.best[i]));
        pg.push(cx + ',' + y(o.grade[i]));
        s += '<text x="' + cx + '" y="' + (H - 10) + '" font-size="10.5" fill="#606266" text-anchor="middle">' + rpEsc(lb) + '</text>';
        if (gap) s += '<text x="' + cx + '" y="' + (y(v) - 6) + '" font-size="12" fill="#cf1322" text-anchor="middle" font-weight="700">▲</text>';
    });
    s += '<polyline points="' + pg.join(' ') + '" fill="none" stroke="#606266" stroke-width="1.6" stroke-dasharray="5 4"/>';
    s += '<polyline points="' + pb.join(' ') + '" fill="none" stroke="#389e0d" stroke-width="1.8"/>';
    return s + '</svg>';
}

/* 分布直方图：本班柱（人数）+ 年级同样本折算曲线（o.w 见 rpSvgBarLine 说明） */
function rpSvgHist(o) {
    var W = o.w || 1000, H = o.h || 190, PL = 40, PR = 12, PT = 14, PB = 28;
    var max = Math.max.apply(null, o.bins.map(function (b) { return Math.max(b.v, b.gv); })) * 1.15 || 10;
    var n = o.bins.length, iw = (W - PL - PR) / n, bw = Math.min(46, iw * 0.55);
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="得分分布直方图">';
    [0, 0.25, 0.5, 0.75, 1].forEach(function (f) {
        var v = Math.round(max * f), y = rpY(v, H, PT, PB, max);
        s += '<line x1="' + PL + '" y1="' + y + '" x2="' + (W - PR) + '" y2="' + y + '" stroke="#eef1f5"/>' +
             '<text x="' + (PL - 6) + '" y="' + (y + 3.5) + '" font-size="10" fill="#909399" text-anchor="end">' + v + '</text>';
    });
    var pts = [];
    o.bins.forEach(function (b, i) {
        var cx = PL + iw * i + iw / 2;
        var y = rpY(b.v, H, PT, PB, max);
        s += '<rect x="' + (cx - bw / 2) + '" y="' + y + '" width="' + bw + '" height="' + (H - PB - y) + '" rx="2" fill="' + (b.hl ? '#fa8c16' : '#8fb5fa') + '"><title>' + rpEsc(b.lb) + ' 本班 ' + b.v + ' 人</title></rect>';
        pts.push(cx + ',' + rpY(b.gv, H, PT, PB, max));
        s += '<text x="' + cx + '" y="' + (H - 9) + '" font-size="10.5" fill="#606266" text-anchor="middle">' + rpEsc(b.lb) + '</text>';
    });
    s += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="#606266" stroke-width="1.6" stroke-dasharray="5 4"/>';
    return s + '</svg>';
}

/* 环形图（错因聚类） */
function rpSvgDonut(o) {
    var S = 210, cx = S / 2, cy = S / 2, R = 82, r0 = 50;
    var total = o.segs.reduce(function (s, x) { return s + x.v; }, 0) || 1;
    var a0 = -Math.PI / 2, s = '<svg viewBox="0 0 ' + S + ' ' + S + '" role="img" aria-label="错因占比环形图" style="max-width:230px">';
    o.segs.forEach(function (sg) {
        var a1 = a0 + sg.v / total * Math.PI * 2;
        var large = (a1 - a0) > Math.PI ? 1 : 0;
        var x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0);
        var x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
        var x2 = cx + r0 * Math.cos(a1), y2 = cy + r0 * Math.sin(a1);
        var x3 = cx + r0 * Math.cos(a0), y3 = cy + r0 * Math.sin(a0);
        s += '<path d="M' + x0 + ' ' + y0 + ' A' + R + ' ' + R + ' 0 ' + large + ' 1 ' + x1 + ' ' + y1 +
             ' L' + x2 + ' ' + y2 + ' A' + r0 + ' ' + r0 + ' 0 ' + large + ' 0 ' + x3 + ' ' + y3 + ' Z" fill="' + sg.color + '"><title>' + rpEsc(sg.n) + ' ' + sg.v + ' 人次</title></path>';
        a0 = a1;
    });
    s += '<text x="' + cx + '" y="' + (cy - 2) + '" font-size="20" font-weight="700" fill="#303133" text-anchor="middle">' + total + '</text>' +
         '<text x="' + cx + '" y="' + (cy + 15) + '" font-size="10.5" fill="#909399" text-anchor="middle">人次合计</text></svg>';
    return s;
}

/* 横向条（知识点掌握率 / 差距），ref 为年级参照刻度
   rh 行距 26→21、条高 13→11：行距仍是字号（11.5）的 1.8 倍，不拥挤 */
function rpSvgHBars(o) {
    var W = o.w || 1000, rh = o.rh || 21, PL = o.pl || 150, PR = 60, PT = 6;
    var H = PT + o.items.length * rh + 8, max = 100;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="横向条形图">';
    o.items.forEach(function (it, i) {
        var y = PT + i * rh + 3, bh = 11;
        var w = (W - PL - PR) * it.v / max;
        var col = it.color || (rpKpLevel(it.v) === 'master' ? '#389e0d' : (rpKpLevel(it.v) === 'weak' ? '#fa8c16' : '#cf1322'));
        s += '<text x="' + (PL - 8) + '" y="' + (y + bh - 2) + '" font-size="11.5" fill="#494f57" text-anchor="end">' + rpEsc(it.n) + '</text>';
        s += '<rect x="' + PL + '" y="' + y + '" width="' + (W - PL - PR) + '" height="' + bh + '" rx="3" fill="#f0f2f5"/>';
        s += '<rect x="' + PL + '" y="' + y + '" width="' + w + '" height="' + bh + '" rx="3" fill="' + col + '"><title>' + rpEsc(it.n) + ' ' + it.v + '%</title></rect>';
        if (it.ref != null) {
            var rx = PL + (W - PL - PR) * it.ref / max;
            s += '<line x1="' + rx + '" y1="' + (y - 2) + '" x2="' + rx + '" y2="' + (y + bh + 2) + '" stroke="#606266" stroke-width="1.6"><title>年级 ' + it.ref + '%</title></line>';
        }
        s += '<text x="' + (PL + w + 6) + '" y="' + (y + bh - 2) + '" font-size="11" fill="#606266">' + it.v + '%</text>';
    });
    return s + '</svg>';
}

/* 热力矩阵（班 × 知识点 / 错因 × 知识点），分档着色 + 数值文本（非颜色单一编码）
   W 随列数变化，不锁定：宽屏下 1000 宽图表放大 1.4 倍时字号 ~14px，
   热力图若同样放大到 1.8 倍，字号会飙到 20px，因此给它加 max-width 封顶，与其它图表同一字号档 */
function rpSvgHeat(o) {
    var cw = o.cw || 74, ch = o.ch || 30, PL = o.pl || 120, PT = 26;
    var W = PL + o.cols.length * cw + 8, H = PT + o.rows.length * ch + 6;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="热力矩阵" style="max-width:' + Math.round(W * 1.3) + 'px">';
    o.cols.forEach(function (c, j) {
        s += '<text x="' + (PL + j * cw + cw / 2) + '" y="' + (PT - 8) + '" font-size="10.5" fill="#606266" text-anchor="middle">' + rpEsc(c) + '</text>';
    });
    o.rows.forEach(function (rn, i) {
        s += '<text x="' + (PL - 8) + '" y="' + (PT + i * ch + ch / 2 + 4) + '" font-size="11" fill="#494f57" text-anchor="end">' + rpEsc(rn) + '</text>';
        o.cols.forEach(function (c, j) {
            var cell = o.get(i, j), x = PL + j * cw, y = PT + i * ch;
            var bg = '#f5f7fa', fg = '#909399', txt = '—';
            if (cell && cell.v != null) {
                txt = cell.v + (cell.unit === '' ? '' : '%');
                if (cell.v >= 80) { bg = '#d9f7be'; fg = '#135200'; }
                else if (cell.v >= 60) { bg = '#feffe6'; fg = '#613400'; }
                else { bg = '#fff1f0'; fg = '#8c1414'; }
            }
            s += '<rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="' + (cw - 2) + '" height="' + (ch - 2) + '" rx="4" fill="' + bg + '"/>' +
                 '<text x="' + (x + cw / 2) + '" y="' + (y + ch / 2 + 4) + '" font-size="11" fill="' + fg + '" text-anchor="middle"' + (cell && cell.title ? '><title>' + rpEsc(cell.title) + '</title>' : '>') + txt + '</text>';
        });
    });
    return s + '</svg>';
}

/* 堆叠横条（班级错因结构） */
function rpSvgStack(o) {
    var W = o.w || 1000, rh = o.rh || 20, PL = 60, PR = 50, PT = 4;
    var H = PT + o.rows.length * rh + 6;
    var max = Math.max.apply(null, o.rows.map(function (r) { return r.segs.reduce(function (s, x) { return s + x.v; }, 0); })) || 1;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="堆叠条形图">';
    o.rows.forEach(function (r, i) {
        var y = PT + i * rh + 4, x = PL, tot = r.segs.reduce(function (s2, x) { return s2 + x.v; }, 0);
        s += '<text x="' + (PL - 8) + '" y="' + (y + 11) + '" font-size="11" fill="#494f57" text-anchor="end">' + rpEsc(r.n) + '</text>';
        r.segs.forEach(function (sg) {
            var w = (W - PL - PR) * sg.v / max;
            s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="14" fill="' + sg.color + '"><title>' + rpEsc(r.n) + ' ' + rpEsc(sg.n) + ' ' + sg.v + '</title></rect>';
            x += w;
        });
        s += '<text x="' + (x + 6) + '" y="' + (y + 11) + '" font-size="10.5" fill="#606266">' + tot + '</text>';
    });
    return s + '</svg>';
}

/* ══════════════════════ 通用 UI：概览汇总结论 / 标题问号 / 顶栏 / 锚点 / toast / 打印 ══════════════════════ */
/* 概览「汇总结论」：每条结论独立一段（一个 paras 元素 = 一条结论），不再是清单 / 表格
   o = { tag, paras:[html, ...], foot }
   - 条序固定：① 水平与结构 ② 讲评安排 ③ 数据可信度；每条结论一段，行首序号圆由 report.css 自动编号，数值直接嵌进句子
   - 标签行独立成行（.concl-head），不混入第 1 条结论；序号圆从正文首条起算
   - 不设判定项列、本次取值列、分隔线与列对齐；判定规则 / 统计口径统一进标题旁「?」（rpHelp）
   - 句内强调用 .cp-t 着色文字（bad 红 / warn 橙，配浅色高亮底），不出胶囊徽标；空段落自动跳过 */
function rpConclProse(o) {
    var paras = (o.paras || []).filter(function (p) { return !!p; });
    var head = o.tag ? '<p class="concl-head"><span class="concl-tag">' + rpEsc(o.tag) + '</span></p>' : '';
    var body = paras.map(function (p) {
        return '<p class="cp">' + p + '</p>';
    }).join('');
    return '<div class="concl">' + head + body
        + (o.foot ? '<div class="rp-note">' + o.foot + '</div>' : '')
        + '</div>';
}

/* 标题旁「?」：把统计方法 / 判定规则 / 数据来源从正文收到一处
   rows = [[标签, 说明HTML], ...]；hover / focus / 点击均可打开，点击后常驻 */
function rpHelp(title, rows) {
    var body = (rows || []).map(function (r) {
        return '<span class="mh-row"><span class="mh-k">' + r[0] + '</span><span class="mh-v">' + r[1] + '</span></span>';
    }).join('');
    return '<span class="mod-help">'
        + '<button type="button" class="mh-btn" aria-expanded="false" aria-label="' + rpEsc(title) + '" title="' + rpEsc(title) + '">?</button>'
        + '<span class="mh-pop" role="tooltip"><span class="mh-box"><b class="mh-t">' + rpEsc(title) + '</b>' + body + '</span></span>'
        + '</span>';
}
/* 弹层定住位：默认锚在「?」左侧，靠近右边界时自动左移，避免横向滚动 */
function rpHelpPlace(el) {
    var btn = el.querySelector('.mh-btn'), pop = el.querySelector('.mh-pop');
    if (!btn || !pop) return;
    var clientW = document.documentElement.clientWidth;
    var r = btn.getBoundingClientRect();
    var w = Math.min(430, clientW - 32);
    var left = Math.min(Math.max(12, r.left - 10), clientW - w - 12);
    pop.style.width = w + 'px';
    pop.style.left = (left - r.left) + 'px';
}
function rpHelpCloseAll(except) {
    var list = document.querySelectorAll('.mod-help.open');
    Array.prototype.forEach.call(list, function (el) {
        if (el === except) return;
        el.classList.remove('open');
        var b = el.querySelector('.mh-btn');
        if (b) b.setAttribute('aria-expanded', 'false');
    });
}
document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.mh-btn');
    var inside = e.target.closest && e.target.closest('.mod-help');
    if (!btn) { if (!inside) rpHelpCloseAll(null); return; }
    var wrap = btn.parentNode;
    var on = wrap.classList.toggle('open');
    btn.setAttribute('aria-expanded', on ? 'true' : 'false');
    rpHelpCloseAll(wrap);
    if (on) rpHelpPlace(wrap);
});
document.addEventListener('mouseover', function (e) {
    var el = e.target.closest && e.target.closest('.mod-help');
    if (el) rpHelpPlace(el);
});
document.addEventListener('focusin', function (e) {
    var el = e.target.closest && e.target.closest('.mod-help');
    if (el) rpHelpPlace(el);
});
document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    rpHelpCloseAll(null);
    if (typeof rpExpClose === 'function') rpExpClose();
    if (typeof rpDrawerClose === 'function') rpDrawerClose();
});
function rpToast(msg, warn) {
    var box = document.getElementById('rp-toast');
    if (!box) { box = document.createElement('div'); box.id = 'rp-toast'; document.body.appendChild(box); }
    var t = document.createElement('div');
    t.className = 't' + (warn ? ' warn' : '');
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
}
function rpTopnavHtml() {
    var role = RP_PARAMS.role;
    return '<header class="topnav">' +
        '<div class="gn-logo"><span class="gn-mark">演示学校</span><span class="gn-name">进步中学</span></div>' +
        '<nav class="gn-menu" id="gn-menu" aria-label="全局主导航">' +
        ['首页', '备课授课', '学情分析', '作业', '错题本', '考试', '校级管理', '试卷库', '教研集备', '班级管理']
            .map(function (m) { return '<div class="gn-item' + (m === '作业' ? ' on' : '') + '">' + m + '</div>'; }).join('') +
        '</nav>' +
        '<div class="gn-right">' +
        '<div class="role-seg" id="gn-role-seg" role="tablist" aria-label="角色视角切换">' +
        '<span data-role="teacher" class="' + (role === 'teacher' ? 'on' : '') + '" role="tab" aria-selected="' + (role === 'teacher') + '">任课教师</span>' +
        '<span data-role="leader" class="' + (role === 'leader' ? 'on' : '') + '" role="tab" aria-selected="' + (role === 'leader') + '">学科组长</span>' +
        '</div>' +
        '<div class="gn-sep"></div>' +
        '<div class="gn-ico" role="button" tabindex="0" title="应用中心" aria-label="应用中心"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg></div>' +
        '<div class="gn-sep"></div>' +
        '<div class="gn-user" role="button" tabindex="0" aria-label="账户菜单"><span>jbgz001</span><small>▾</small></div>' +
        '</div></header>';
}
function rpInitShell(anchorItems, anchorActions) {
    var EMB = RP_PARAMS.embed;
    var tn = document.getElementById('rp-topnav');
    if (tn) tn.innerHTML = EMB ? '' : rpTopnavHtml();
    document.body.classList.add('rp-body');
    if (EMB) document.body.classList.add('rp-embed');
    var wrap = document.getElementById('rp-wrap');
    if (wrap) wrap.classList.add(RP_PARAMS.role === 'leader' ? 'role-leader' : 'role-teacher');
    if (EMB) {
        /* 嵌入讲评工作台 iframe（4.0 同页 tab / 整合版单页）：
           页内锚点（#xxx）在 iframe 内正常滚动放行；
           其余外链 → 通知父页面切换视图：「返回作业列表」回列表视图，其余回讲评工作台 */
        document.addEventListener('click', function (e) {
            var a = e.target.closest('a[href]');
            if (!a) return;
            var href = a.getAttribute('href') || '';
            if (href.charAt(0) === '#') return;
            e.preventDefault();
            var to = (href.indexOf('list.html') > -1) ? 'list' : 'workbench';
            try { window.parent.postMessage({ type: 'rp-nav', to: to }, '*'); } catch (e2) { }
        });
    } else {
        /* 顶栏交互：角色切换 = 带 ?role= 重载（报告内容随角色变化）；作业 → 列表页；其余占位 */
        var seg = document.getElementById('gn-role-seg');
        seg.addEventListener('click', function (e) {
            var sp = e.target.closest('span[data-role]');
            if (!sp || sp.dataset.role === RP_PARAMS.role) return;
            location.href = rpUrl({ role: sp.dataset.role });
        });
        document.getElementById('gn-menu').addEventListener('click', function (e) {
            var it = e.target.closest('.gn-item');
            if (!it) return;
            if (it.textContent.trim() === '作业') { location.href = 'list.html'; return; }
            rpToast('演示原型：' + it.textContent.trim() + ' 模块未接入，4.0 仅覆盖作业列表 / 讲评 / 报告', true);
        });
        document.querySelector('.gn-ico').addEventListener('click', function () { rpToast('演示原型：应用中心未接入', true); });
        document.querySelector('.gn-user').addEventListener('click', function () { rpToast('演示原型：账户菜单未接入', true); });
    }
    /* 锚点导航（报告头已取消：页面操作按钮挂在导航右侧）
       §18 风格对齐：选中态 .on 与基准「当前 tab 高亮」同语言，默认首项，点击与滚动同步 */
    if (anchorItems && anchorItems.length) {
        var anchorBar = document.getElementById('rp-anchor');
        anchorBar.innerHTML = anchorItems.map(function (it) {
            return '<a href="#' + it.id + '" data-target="' + it.id + '"><span class="no">' + it.no + '</span>' + rpEsc(it.name) + '</a>';
        }).join('') + (anchorActions ? '<div class="rp-anchor-act no-print">' + anchorActions + '</div>' : '');
        var anchorLinks = anchorBar.querySelectorAll('a');
        var setAnchorOn = function (a) {
            anchorLinks.forEach(function (x) { x.classList.toggle('on', x === a); });
        };
        if (anchorLinks.length) setAnchorOn(anchorLinks[0]);
        anchorBar.addEventListener('click', function (e) {
            var a = e.target.closest('a[data-target]');
            if (a) setAnchorOn(a);
        });
        var spy = function () {
            var topbar = 120, cur = anchorLinks[0];
            anchorLinks.forEach(function (a) {
                var el = document.getElementById(a.getAttribute('data-target'));
                if (el && el.getBoundingClientRect().top <= topbar) cur = a;
            });
            setAnchorOn(cur);
        };
        window.addEventListener('scroll', spy, { passive: true });
    }
    /* 打印前展开所有折叠区（方案 10.4） */
    window.addEventListener('beforeprint', function () {
        document.querySelectorAll('details').forEach(function (d) { d.open = true; });
    });
    /* 导出壳页（export-*.html）以隐藏 iframe + embed=1 加载本页后发来 rp-export-req，
       这里回传 #rp-main 的渲染结果与页内 <style>（file:// 下跨 frame 不能直读 contentDocument，只能走 postMessage）。
       与 index.html 的 rp-nav 消息不冲突（index 仅处理 type==='rp-nav'） */
    window.addEventListener('message', function (e) {
        var d = e.data || {};
        /* 宿主切回本视图时询问浮层状态：抽屉 / 弹窗在子页内不会随视图切换销毁，需恢复宿主遮罩 */
        if (d.type === 'rp-mask-ask') { rpMaskSync(); return; }
        if (d.type !== 'rp-export-req' || !e.source) return;
        document.querySelectorAll('details').forEach(function (x) { x.open = true; });
        document.querySelectorAll('textarea').forEach(function (t) { t.textContent = t.value; });
        var main = document.getElementById('rp-main');
        var styles = [].map.call(document.querySelectorAll('head style'), function (s) { return s.textContent; });
        try {
            e.source.postMessage({
                type: 'rp-export-html', html: main ? main.innerHTML : '', styles: styles,
                title: document.title, role: RP_PARAMS.role, hw: RP_PARAMS.hw, cls: RP_PARAMS.cls,
                meta: rpExportMeta(), modules: rpExportItems()
            }, '*');
        } catch (e2) { }
    });
}

/* 导出：不再直接 window.print()，改为打开独立导出壳页（export-class / export-grade / export-essay），
   壳页拉取本页 #rp-main 内容后以 A4 横向版式呈现，可逐处微调后再「另存为 PDF」。
   壳页加载源报告时需带 embed=1（无顶栏）+ hw / cls / role / q：
   独立打开时透传地址栏参数，整合版嵌入时按 RP_PARAMS 重建（两者契约一致） */
function rpOpenExport(page, extra) {
    var qs = new URLSearchParams();
    qs.set('embed', '1');
    if (RP_PARAMS.hw) qs.set('hw', RP_PARAMS.hw);
    if (RP_PARAMS.cls) qs.set('cls', RP_PARAMS.cls);
    if (RP_PARAMS.role === 'leader') qs.set('role', 'leader');
    if (RP_PARAMS.q) qs.set('q', RP_PARAMS.q);
    var q = '?' + qs.toString();
    if (extra) q += '&' + extra;
    var w = null;
    try { w = window.open(page + q, '_blank'); } catch (e) { }
    if (!w && typeof rpToast === 'function') rpToast('浏览器拦截了新窗口，请允许弹窗后重试', true);
}

/* ══════════════════════ 导出元信息 / 导出设置面板（班级 / 年级 / 作文三页共用） ══════════════════════
   导出前先弹设置面板：列出当前页全部 section.mod，默认全选、支持全选 / 半选，
   确认后仍走 export-*.html（全部勾选不带 only，部分勾选传 only=m1,m3,…），与旧契约完全兼容 */
function rpTotalScore() {
    return RP_QUESTIONS.reduce(function (s, q) { return s + q.score; }, 0);
}
function rpExportMeta() {
    var es = (typeof RP_ESSAY_HW !== 'undefined') ? RP_ESSAY_HW[RP_PARAMS.hw] : null;
    var isHw = RP_HW.id === RP_PARAMS.hw;
    return {
        name: isHw ? RP_HW.name : (es ? es.map(function (q) { return q.genre; }).join(' / ') : RP_HW.name),
        subject: isHw ? RP_HW.subject : '英语',
        full: isHw ? RP_HW.fullScore : (es ? es.reduce(function (s, q) { return s + q.full; }, 0) : RP_HW.fullScore),
        reviewedAt: (isHw || !es) ? RP_HW.reviewedAt : ''
    };
}
/* 当前页可导出模块（按 DOM 顺序；模块号 + 标题直接读页头，不再维护第二份清单） */
function rpExportItems() {
    return [].map.call(document.querySelectorAll('#rp-main section.mod'), function (sec, i) {
        var noEl = sec.querySelector('.mod-no'), tiEl = sec.querySelector('.mod-title');
        return {
            id: sec.id,
            no: noEl ? noEl.textContent.trim() : String(i + 1),
            title: tiEl ? tiEl.textContent.replace(/\s+/g, ' ').trim() : (sec.id || '')
        };
    });
}
/* ══════════════════════ 宿主遮罩联动（嵌入态） ══════════════════════
   报告页以 iframe 嵌入宿主时，iframe 内 position:fixed 的遮罩只相对子文档视口，
   宿主顶栏（全局导航 / 作业标题行 / 视图页签）在 iframe 之外，永远压不暗，
   且 z-index 跨不过文档边界。打开 / 关闭页内浮层时同步上报宿主，
   由宿主在文档顶层补一段与子页同色的遮罩补齐整屏。 */
function rpMaskSync() {
    if (!RP_PARAMS.embed) return;
    var el = document.getElementById('rp-expset') || document.getElementById('rp-drawer');
    if (!el) {
        var es = document.getElementById('esStuMask');   /* 作文页：学生个人智批报告弹窗 */
        if (es && !es.hidden) el = es;
    }
    var color = '';
    if (el) { try { color = getComputedStyle(el).backgroundColor || ''; } catch (e) { } }
    try {
        window.parent.postMessage({ type: 'rp-mask', state: el ? 'open' : 'close', color: color }, '*');
    } catch (e2) { }
}
var RP_EXP_PAGE = null;
/* preset：可选，只预勾选指定模块（如讲评清单的「导出讲评清单」传 'm6'），其余行为与全选一致 */
function rpExportSettings(page, preset) {
    var items = rpExportItems();
    if (!items.length) { rpOpenExport(page); return; }
    RP_EXP_PAGE = page;
    var pre = preset ? String(preset).split(',') : null;
    rpExpClose(true);
    var list = items.map(function (it) {
        var on = !pre || pre.indexOf(it.id) > -1;
        return '<label class="exp-item"><input type="checkbox" data-mod="' + it.id + '"' + (on ? ' checked' : '') + '>'
            + '<span class="exp-no">' + rpEsc(it.no) + '</span><span class="exp-t">' + rpEsc(it.title) + '</span></label>';
    }).join('');
    var box = document.createElement('div');
    box.id = 'rp-expset';
    box.className = 'exp-mask';
    box.innerHTML = '<div class="exp-panel" role="dialog" aria-modal="true" aria-label="导出设置">'
        + '<div class="exp-h"><b>导出设置</b><span>勾选要写进导出稿的模块</span>'
        + '<button type="button" class="exp-x" data-exp="close" aria-label="关闭">✕</button></div>'
        + '<label class="exp-all"><input type="checkbox" id="exp-all"><b>全选</b>'
        + '<span class="exp-cnt" id="exp-cnt"></span></label>'
        + '<div class="exp-list">' + list + '</div>'
        + '<div class="exp-f"><span class="exp-tip">导出为 A4 横向 HTML，可再另存为 PDF；未勾选的模块不会出现在导出稿中。</span>'
        + '<button type="button" class="rp-btn" data-exp="close">取消</button>'
        + '<button type="button" class="rp-btn primary" data-exp="ok">继续导出</button></div>'
        + '</div>';
    document.body.appendChild(box);
    document.documentElement.classList.add('rp-noscroll');
    rpExpSync();
    rpMaskSync();
}
function rpExpSync() {
    var box = document.getElementById('rp-expset');
    if (!box) return;
    var all = box.querySelectorAll('input[data-mod]'), on = box.querySelectorAll('input[data-mod]:checked');
    var allBox = document.getElementById('exp-all'), cnt = document.getElementById('exp-cnt');
    if (allBox) { allBox.checked = all.length > 0 && on.length === all.length; allBox.indeterminate = on.length > 0 && on.length < all.length; }
    if (cnt) cnt.textContent = '已选 ' + on.length + ' / ' + all.length + ' 个模块';
}
function rpExpClose(silent) {
    var box = document.getElementById('rp-expset');
    if (box && box.parentNode) box.parentNode.removeChild(box);
    if (!document.getElementById('rp-drawer')) document.documentElement.classList.remove('rp-noscroll');
    if (!silent) rpMaskSync();
}
/* 通用右侧抽屉（未交名单 / 失分学生名单等，需查才看，不占正文高度） */
function rpDrawer(title, bodyHtml, sub) {
    rpDrawerClose(true);
    var box = document.createElement('div');
    box.id = 'rp-drawer';
    box.className = 'dr-mask';
    box.innerHTML = '<div class="dr-panel" role="dialog" aria-modal="true" aria-label="' + rpEsc(title) + '">'
        + '<div class="dr-h"><b>' + rpEsc(title) + '</b>' + (sub ? '<span>' + rpEsc(sub) + '</span>' : '')
        + '<button type="button" class="dr-x" data-dr="close" aria-label="关闭">✕</button></div>'
        + '<div class="dr-b">' + bodyHtml + '</div></div>';
    document.body.appendChild(box);
    document.documentElement.classList.add('rp-noscroll');
    rpMaskSync();
}
function rpDrawerClose(silent) {
    var box = document.getElementById('rp-drawer');
    if (box && box.parentNode) box.parentNode.removeChild(box);
    if (!document.getElementById('rp-expset')) document.documentElement.classList.remove('rp-noscroll');
    if (!silent) rpMaskSync();
}
/* 面板 / 抽屉的事件委托：三个报告页不再各写一份 */
document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-exp]');
    if (t) {
        var act = t.getAttribute('data-exp');
        if (act !== 'ok') { rpExpClose(); return; }
        var box = document.getElementById('rp-expset');
        if (!box) return;
        var all = box.querySelectorAll('input[data-mod]');
        var on = [].filter.call(all, function (x) { return x.checked; }).map(function (x) { return x.getAttribute('data-mod'); });
        if (!on.length) { rpToast('至少勾选一个模块', true); return; }
        var page = RP_EXP_PAGE;
        rpExpClose();
        if (on.length === all.length) rpOpenExport(page);
        else rpOpenExport(page, 'only=' + on.join(','));
        return;
    }
    if (e.target.id === 'rp-drawer' || (e.target.closest && e.target.closest('[data-dr="close"]'))) rpDrawerClose();
});
document.addEventListener('change', function (e) {
    var t = e.target, box = document.getElementById('rp-expset');
    if (!t || !box || !box.contains(t)) return;
    if (t.id === 'exp-all') {
        [].forEach.call(box.querySelectorAll('input[data-mod]'), function (x) { x.checked = t.checked; });
    }
    rpExpSync();
});

/* ══════════════════════ 作文智批：题目配置 + 学生级报告 mock（L3 学生层扩展） ══════════════════════
   消费方：essay-report.html（班级作文报告）与 index.html「作文报告」入口显隐。
   - RP_ESSAY_HW：作业 → 作文题目列表（支持一份作业多题、语文/英语混排）
   - rpEssayStudents(hwId, qid, cls)：复用 rpStudents 花名册，按确定性种子生成学生级智批报告；
     字段对齐两份学生智批报告 schema 的子集（英语：_scoreResult/errors/highlights/polished_sentences/...；
     语文：total_score/score_detail/paragraph_comments.annotations/deductions/...），
     班级报告的全部汇总数字均由本数组实时聚合，不手写结论
   - 白卷（blank）/ 异常卷（abnormal）学生无智批报告：noReport=true，不参与任何聚合 */
var RP_ESSAY_HW = {
    'HW-0910-U1': [
        { qid: 'q12', no: '12', subject: 'en', qtype: 'practical_writing', genre: '应用文写作 · 建议信',
          title: '假定你是李华，英国朋友 Peter 来信说难以适应高中生活，请给他回信提出建议。',
          full: 25, wordReq: '80 词左右', wcBase: 90, baseRate: null /* null → 取 RP_QUESTIONS 第 12 题的班级得分率 */ }
    ],
    'HW-0820-EN': [
        { qid: 'q1', no: '第一节', subject: 'en', qtype: 'continuation', genre: '读后续写',
          title: '阅读下面短文，根据所给情节与两段开头语续写，使之构成一篇完整的短文（乐于助人主题）。',
          full: 25, wordReq: '150 词左右', wcBase: 150, baseRate: 62 },
        { qid: 'q2', no: '第二节', subject: 'en', qtype: 'practical_writing', genre: '应用文写作 · 邀请信',
          title: '假定你是李华，请给外教 Chris 写封邮件，邀请他参加本周五的班级英语角活动。',
          full: 15, wordReq: '80 词左右', wcBase: 85, baseRate: 71 }
    ],
    'HW-0818-CN': [
        { qid: 'q1', no: '23', subject: 'cn', qtype: 'cn_essay', genre: '议论文',
          title: '阅读材料「青春因奋斗而精彩」，明确立意，自拟题目，写一篇不少于 800 字的议论文。',
          full: 60, wordReq: '不少于 800 字', wcBase: 850, baseRate: 66 }
    ],
    'HW-0822-MIX': [
        { qid: 'q1', no: '21', subject: 'cn', qtype: 'cn_mini', genre: '微写作 · 推介语',
          title: '班级拟举办「家乡文化名片」推介活动，请写一段 150 字左右的推介语。',
          full: 10, wordReq: '150 字左右', wcBase: 160, baseRate: 72 },
        { qid: 'q2', no: '22', subject: 'en', qtype: 'practical_writing', genre: '应用文写作 · 通知',
          title: '假定你是学生会主席李华，请写一则英语通知，邀请留学生代表参加中秋节文化体验活动。',
          full: 15, wordReq: '80 词左右', wcBase: 85, baseRate: 69 }
    ]
};
function rpEssayQuestions(hwId) { return RP_ESSAY_HW[hwId] || []; }
function rpHwHasEssay(hwId) { return rpEssayQuestions(hwId).length > 0; }

/* ── 英语素材池：错误例句（type 取值与学生报告 grammar 类型中文名一致） ── */
var RP_EN_ERR_POOL = [
    { type: '时态错误', original: 'I have went to the library yesterday.', correction: 'I went to the library yesterday.', note: 'yesterday 提示一般过去时' },
    { type: '时态错误', original: 'When I arrived, he already left.', correction: 'When I arrived, he had already left.', note: '先发生的动作用过去完成时' },
    { type: '主谓一致', original: 'The number of students are increasing.', correction: 'The number of students is increasing.', note: 'the number of 后接单数谓语' },
    { type: '主谓一致', original: 'Everyone have their own dream.', correction: 'Everyone has their own dream.', note: 'everyone 作主语按单数处理' },
    { type: '拼写错误', original: 'I beleive practice makes perfect.', correction: 'I believe practice makes perfect.', note: 'believe 拼写' },
    { type: '拼写错误', original: 'We should protect the enviroment.', correction: 'We should protect the environment.', note: 'environment 拼写' },
    { type: '搭配错误', original: 'I am looking forward to hear from you.', correction: 'I am looking forward to hearing from you.', note: 'look forward to + doing' },
    { type: '搭配错误', original: 'He made a lot of progresses.', correction: 'He made a lot of progress.', note: 'progress 不可数' },
    { type: '词性误用', original: 'We had a happily discussion.', correction: 'We had a happy discussion.', note: '形容词修饰名词' },
    { type: '词性误用', original: 'Keep health is important.', correction: 'Keeping healthy is important.', note: '动名词作主语；keep + 形容词' },
    { type: '冠词错误', original: 'I had the breakfast at 7 this morning.', correction: 'I had breakfast at 7 this morning.', note: '三餐前一般不加冠词' },
    { type: '冠词错误', original: 'She plays piano very well.', correction: 'She plays the piano very well.', note: '乐器名词前加 the' },
    { type: '介词错误', original: 'We will meet in Monday morning.', correction: 'We will meet on Monday morning.', note: '具体某天的上午用 on' },
    { type: '介词错误', original: 'He is good in English.', correction: 'He is good at English.', note: 'be good at 固定搭配' },
    { type: '单复数错误', original: 'There are many advices I can give you.', correction: 'There is much advice I can give you.', note: 'advice 不可数' },
    { type: '单复数错误', original: 'One of my friend is from London.', correction: 'One of my friends is from London.', note: 'one of + 复数名词' },
    { type: '非谓语错误', original: 'I suggest to hold the activity on Friday.', correction: 'I suggest holding the activity on Friday.', note: 'suggest + doing' },
    { type: '非谓语错误', original: 'Seen from the hill, and the city looks beautiful.', correction: 'Seen from the hill, the city looks beautiful.', note: '分词状语不与 and 连用' },
    { type: '句式结构', original: 'Because I was tired, so I went to bed early.', correction: 'Because I was tired, I went to bed early.', note: 'because 与 so 不连用' },
    { type: '句式结构', original: 'This is the best book which I have ever read.', correction: 'This is the best book that I have ever read.', note: '最高级后定语从句用 that' }
];
/* ── 英语素材池：高级词汇 ──
   word：词条原文（学生卷面写法可能因句首大写 / 连字符写法而不同，聚合侧按 trim().toLowerCase() 归一）
   note：中文释义
   sents：该生引用该词条的例句变体（每人取其一，使同一词条在不同学生名下呈现不同句子）
   归一化规则与「词汇 / 短语」判定统一在 essay-report.html 侧完成，素材层只给原始形态 */
var RP_EN_VOCAB_POOL = [
    { word: 'significant', note: '高级替换 important',
      sents: ['The change in our study habits is significant.',
        'We attached significant importance to teamwork.',
        'It is significant that the whole class kept the promise.',
        'The gap between the two groups was significant in the survey.'] },
    { word: 'additionally', note: '衔接词，表递进',
      sents: ['Additionally, regular review makes knowledge stick.',
        'Additionally, we volunteered as peer tutors.',
        'Additionally, the school opened a new reading room.'] },
    { word: 'be devoted to', note: '高级搭配「致力于」',
      sents: ['Our monitor is devoted to helping every member improve.',
        'She is devoted to protecting the environment.',
        'The old teacher is devoted to every student in her class.',
        'He is devoted to the craft of writing English well.',
        'Our school is devoted to giving each child a fair start.'] },
    { word: 'broaden my horizons', note: '地道表达「开阔眼界」',
      sents: ['Travel abroad can broaden my horizons.',
        'Reading widely can broaden my horizons.',
        'The overseas trip helped me broaden my horizons.',
        'Volunteering helped me broaden my horizons beyond the classroom.',
        'A summer school would broaden my horizons in another way.',
        'Exchange programmes broaden my horizons for every participant.'] },
    { word: 'a sense of achievement', note: '高级名词短语',
      sents: ['Completing the project gave me a sense of achievement.',
        'Each small step brings a sense of achievement.',
        'Winning the debate filled us with a sense of achievement.',
        'I felt a sense of achievement after the marathon.',
        'Signing my name on the notice board gave me a sense of achievement.',
        'There is a sense of achievement in learning to say no.',
        'Daily practice gave them a sense of achievement.'] },
    { word: 'spare no effort', note: '高级搭配「不遗余力」',
      sents: ['We will spare no effort to protect the campus trees.',
        'The staff spared no effort to support us.',
        'They spared no effort to make the event welcoming for everyone.',
        'We should spare no effort to keep our promise.',
        'The volunteers spared no effort in organising the charity sale.'] },
    { word: 'be beneficial to', note: '高级替换 be good for',
      sents: ['Daily exercise is beneficial to both body and mind.',
        'Reading aloud is beneficial to pronunciation.',
        'Early review is beneficial to long-term memory.',
        'A tidy desk is beneficial to focused study.',
        'Group discussion is beneficial to writing as well.',
        'A balanced diet is beneficial to students under pressure.'] },
    { word: 'take ... into account', note: '高级搭配「考虑到」',
      sents: ['We should take the suggestions of our classmates into account.',
        'Before deciding, take the cost into account.',
        'We must take the weather into account when we plan the trip.',
        'Please take the deadline into account when you hand in the form.',
        'Teachers should take every student\'s voice into account.'] },
    { word: 'overcome', note: '高级替换 get over',
      sents: ['With the teacher\'s help, I can overcome my stage fright.',
        'Teamwork helped us overcome the crisis.',
        'She worked hard to overcome her fear of speaking in public.',
        'Daily practice helped him overcome his spelling mistakes.',
        'Warm words can overcome a lonely mood.'] },
    { word: 'in conclusion', note: '结尾衔接词',
      sents: ['In conclusion, volunteering shapes a better campus.',
        'In conclusion, small habits decide our future.',
        'In conclusion, a clear plan beats blind effort.',
        'In conclusion, being kind costs nothing but means a lot.',
        'In conclusion, teamwork is the real winner of the day.',
        'In conclusion, every effort counts towards our common goal.'] },
    { word: 'take part in', note: '高级搭配「参与」',
      sents: ['I hope to take part in the English corner this Friday.',
        'Over forty students took part in the debate.',
        'She will take part in the photography club this term.',
        'We took part in the clean-up activity near the river.',
        'Our class will take part in the charity sale next Monday.',
        'Many volunteers took part in the marathon for charity.',
        'I am glad to take part in the school radio programme.',
        'All members are free to take part in the book club.'] }
];
/* ── 英语素材池：高分句式（syntax_type 为原始类型，聚合侧按关键词归一化：
   倒装句 / not only 倒装 / so 倒装 / 让步倒装 → 倒装） ── */
var RP_EN_SYNTAX_POOL = [
    { syntax_type: '倒装句',
      sents: ['Only by working hard can we achieve our goals.',
        'Only in this way can we solve the problem.',
        'Only when we listen carefully can we learn fast.',
        'Only with clear goals can we keep moving forward.',
        'Only after the rain stopped did the match begin.'] },
    { syntax_type: '主语从句',
      sents: ['It is universally acknowledged that perseverance leads to success.',
        'What we learn today will shape our tomorrow.',
        'That he finished the race alone impressed us all.',
        'Whatever we decide, we should stick to it.',
        'Whether he will come remains unknown to us.',
        'Who made such a long speech remained a mystery.'] },
    { syntax_type: 'not only 倒装',
      sents: ['Not only did he finish his homework, but he also helped his classmates.',
        'Not only does reading widen our view, but it also trains our mind.',
        'Not only did the rain delay us, but it also spoiled the plan.',
        'Not only can she sing well, but she can also play the piano.',
        'Not only did the students plant trees, but they also cleaned the river.',
        'Not only does exercise keep us fit, but it also relieves pressure.',
        'Not only had we waited, but we had also prepared well.',
        'Not only will the course widen our choices, but it will also build skills.'] },
    { syntax_type: '时间状语从句',
      sents: ['The moment I saw the result, I could not help crying.',
        'Whenever I feel lost, I turn to my diary.',
        'As soon as the bell rang, we rushed out of the classroom.',
        'Before I knew it, the summer holiday had begun.',
        'After the ceremony ended, we walked back together.',
        'While the rain was pouring, the class kept reading aloud.',
        'Since the project began, our team has met every Friday.',
        'Until we finish the last question, we will not leave.'] },
    { syntax_type: '定语从句',
      sents: ['The teacher who taught me English is now working in Beijing.',
        'Those who persist will finally succeed.',
        'The book that changed my mind is still on my desk.',
        'A friend who listens is worth a hundred who advise.',
        'The letters that he wrote reveal his true feelings.'] },
    { syntax_type: '让步倒装',
      sents: ['Hard as it was, we managed to get through it.',
        'Tired as we were, we finished the task on time.',
        'Young as she is, she handles the project calmly.',
        'Quiet as it was, the hall was full of cheers.',
        'Busy as he was, he still came to help us.',
        'Cold as the water was, we jumped in together.',
        'Difficult as the task was, no one gave up.',
        'Late as it was, the library stayed open for us.',
        'Simple as the plan looks, it works wonders.'] },
    { syntax_type: '强调句',
      sents: ['It was my teacher\'s encouragement that lit up my confidence.',
        'It is the team that finally solved the problem.',
        'It was the small details that made the day special.',
        'It is not talent but persistence that carries us far.',
        'It was in the library that I first read that book.',
        'It is our parents who deserve our deepest thanks.',
        'It was a long night that changed my plan.'] },
    { syntax_type: 'so 倒装',
      sents: ['So meaningful was the activity that everyone wanted to join again.',
        'So confident was she that she answered at once.',
        'So cold was the morning that we could hardly see the road.',
        'So excited were the children that they shouted at the top of their lungs.',
        'So patient is our teacher that we never feel afraid to ask.'] },
    { syntax_type: '宾语从句',
      sents: ['I firmly believe that our efforts will pay off.',
        'She admitted that she had made a mistake.',
        'He said that the meeting would start at nine.',
        'I wonder whether the plan will work in practice.',
        'Our monitor told us that the deadline had been moved.',
        'The teacher explained that the rule applied to everyone.',
        'I remember that my grandmother told a similar story.'] },
    { syntax_type: '被动语态',
      sents: ['The task was finished ahead of schedule.',
        'Our suggestions were warmly received by the teachers.',
        'The classroom was cleaned by the duty group before lunch.',
        'The prize was presented to her by the headmaster.',
        'The old bridge was repaired last winter.'] }
];
/* ── 英语素材池：生动描写 ──
   description_type 为受控枚举：action 动作 / psychology 心理 / environment 环境 / dialogue 对话，
   天然按类型归组，不会因文案差异碎成多组 ── */
var RP_EN_DESC_POOL = [
    { description_type: 'action',
      sents: ['He dashed to the kitchen and seized the milk.',
        'She leapt over the fence and waved at us.',
        'The old man bent down and tied his shoes slowly.',
        'She pushed open the door and stepped into the hall.',
        'He clenched his fist and raised it to the sky.',
        'She picked up the basket and hurried down the lane.',
        'The boy held the rope tight and pulled the flag up.',
        'He grabbed the brush and swept the floor quickly.',
        'She tore the paper into small pieces.',
        'He jumped onto the bike and rode away.',
        'She pressed the button and waited for the lift.',
        'He dropped his bag and ran towards the classroom.'] },
    { description_type: 'psychology',
      sents: ['My heart hammered as I stepped onto the stage.',
        'A wave of relief washed over me at last.',
        'A cold doubt crept into my mind at the news.',
        'Hope bloomed quietly in my chest that evening.',
        'A knot of worry tightened in my stomach.',
        'I felt a sudden rush of pride when she smiled.',
        'Fear seized me the moment the lights went out.',
        'My spirits lifted as soon as the rain stopped.',
        'A bitter taste of failure lingered in my mouth.',
        'Curiosity tickled at the back of my mind.',
        'Shame burned in my cheeks before I could say a word.',
        'A deep calm settled over me after the storm.',
        'I was torn between joy and disbelief.',
        'Confidence warmed me from the inside that morning.'] },
    { description_type: 'environment',
      sents: ['Golden sunlight spilled across the quiet playground.',
        'Autumn wind rustled through the maple-lined path.',
        'Dawn light crept over the misty rooftops.',
        'The busy market hummed with laughter and chatter.',
        'A thin mist drifted above the still lake.',
        'Rain drummed against the classroom window.',
        'The old library smelled of dust and old paper.',
        'Street lamps flickered on along the empty avenue.',
        'Fresh grass bent under the evening breeze.',
        'The classroom was flooded with pale winter light.',
        'Chimneys smoked quietly against the grey sky.',
        'Cicadas sang loudly in the summer woods.'] },
    { description_type: 'dialogue',
      sents: ['She said softly, "I would rather try again tomorrow."',
        'He shouted laughingly, "You made it!"',
        'The teacher smiled and said, "I am proud of you."',
        '"Let us try once more," Mum whispered in my ear.',
        '"That is exactly what I mean," he replied at once.',
        '"I will be there," she promised with a smile.',
        '"Why not try it once more?" the monitor asked kindly.',
        '"We are almost there," grandpa said with a laugh.',
        '"Nobody is perfect," she said to comfort me.',
        '"Look at the stars!" cried the little boy excitedly.',
        '"Who is willing to go first?" the teacher asked.'] }
];
var RP_EN_POLISH_POOL = [
    { original: 'I think it is good for us.', improved: 'From my perspective, it is undoubtedly beneficial to us.' },
    { original: 'We should try our best to study.', improved: 'We are supposed to spare no effort to devote ourselves to study.' },
    { original: 'I hope you can come.', improved: 'I would appreciate it if you could come.' },
    { original: 'The activity was very interesting.', improved: 'The activity turned out to be fascinating and rewarding.' },
    { original: 'Reading is useful.', improved: 'Reading is of great benefit to us.' },
    { original: 'I was very nervous.', improved: 'I was overwhelmed by nervousness.' },
    { original: 'We had a good time.', improved: 'We had a truly wonderful and unforgettable time.' },
    { original: 'Thank you for your help.', improved: 'I am sincerely grateful for your generous help.' }
];
/* ── 英语素材池：整篇范文（原稿段 → 润色后段 成对）
   每题给「开头 / 主体 / 结尾」三组段落素材：o = 该生原稿句，p = 润色后句。
   学生级成篇作文按考号确定性抽段拼装：同一学生多次渲染结果稳定，同班不同学生抽到的段落组合不同。 */
var RP_EN_ESSAY_POOL = {
    q1: {
        title: 'A Small Act of Kindness',
        bodyN: 3,
        open: [
            { o: 'Mr. Li was walking along the river when he saw a boy struggling with a heavy box near the bridge.',
              p: 'Mr. Li was strolling along the riverbank when he noticed a boy struggling to carry a heavy box beside the bridge.' },
            { o: 'It began to rain heavily at that moment, and the boy had no umbrella with him.',
              p: 'It was pouring down at that very moment, and the boy had not brought an umbrella along.' }
        ],
        body: [
            { o: 'Mr. Li walked over at once and helped the boy hold the box. "Let me share the load with you," he said warmly.',
              p: 'Without hesitation, Mr. Li stepped forward and shared the burden of the box. "Let me take half of it with you," he said warmly.' },
            { o: 'The boy was very grateful. He said the box was full of books for the poor children in the village.',
              p: 'The boy was deeply grateful, explaining that the box was crammed with books for the children in the village.' },
            { o: 'Together they carried the box to the bus stop. The heavy rain did not stop them.',
              p: 'Together they carried the box all the way to the bus stop; neither the pouring rain nor the weight of the box could hold them back.' },
            { o: 'A few weeks later the boy wrote a letter to the school and praised Mr. Li for his kindness.',
              p: 'Weeks later, the boy penned a letter to the school, praising Mr. Li for his selfless kindness.' }
        ],
        end: [
            { o: 'Since then, more and more students have joined the "Warm Hands" activity. Mr. Li says that small acts of help can change a whole school.',
              p: 'Since then, an increasing number of students have joined the "Warm Hands" activity. Mr. Li insists that small acts of kindness can transform an entire school.' },
            { o: 'A kind heart is like a seed. Once it is planted, good will grow everywhere around it.',
              p: 'A kind heart is like a seed: once it is planted, goodness will take root and spread everywhere around it.' }
        ]
    },
    q2: {
        title: 'An Invitation to the English Corner',
        bodyN: 2,
        sign: ['Yours sincerely,', 'Li Hua'],
        open: [
            { o: 'Dear Chris, I am Li Hua from Class Two. I am glad to tell you about our English Corner this Friday.',
              p: 'Dear Chris, I am writing to invite you to our English Corner, which will be held this Friday afternoon.' },
            { o: 'Dear Chris, you spoke highly of our English Corner last time. I would like to tell you more about it.',
              p: 'Dear Chris, since you spoke so highly of our English Corner last time, I am writing to share more about it with you.' }
        ],
        body: [
            { o: 'The activity will start at four in the afternoon in the reading room. We will talk about travelling and share our stories.',
              p: 'The activity is to be held at four in the afternoon in the reading room, where we will talk about travelling and share our stories.' },
            { o: 'We also need a teacher to lead a discussion about English study. Could you give us a short talk?',
              p: 'We would also be grateful if you could lead a short discussion on how to learn English effectively.' },
            { o: 'Some of my classmates will bring snacks, and everyone is welcome to come.',
              p: 'Some of my classmates will bring snacks, and everyone is warmly welcome to join us; it would mean a great deal to us if you could come.' }
        ],
        end: [
            { o: 'Please let me know if you are free. I am looking forward to your reply.',
              p: 'Please let me know at your earliest convenience if you are available, for I am looking forward to your early reply.' },
            { o: 'Looking forward to your coming, and thank you for your support.',
              p: 'I am looking forward to your presence, and thank you in advance for your support.' }
        ]
    },
    q12: {
        title: 'Some Suggestions for a Newcomer',
        bodyN: 2,
        sign: ['Yours sincerely,', 'Li Hua'],
        open: [
            { o: 'Dear Peter, I am Li Hua. I am glad to hear that you have had some trouble adapting to our school life.',
              p: 'Dear Peter, I am Li Hua, and I am delighted to hear that you have had some trouble adapting to our school life.' }
        ],
        body: [
            { o: 'First, you can join our English Corner every Friday. Talking with classmates will help you feel at home.',
              p: 'First of all, you are welcome to join our English Corner every Friday, for talking with classmates will help you feel at home.' },
            { o: 'Second, do not be afraid of making mistakes. Every student here once spoke broken English, and that is how we learn.',
              p: 'Secondly, never be afraid of making mistakes; every student here once spoke broken English, and that is exactly how we learn.' }
        ],
        end: [
            { o: 'If you have any questions, please write to me. I am sure you will enjoy your time here.',
              p: 'Should you have any questions, please feel free to write to me, for I am sure you will enjoy your time here.' }
        ]
    },
    q22: {
        title: 'Notice: Mid-Autumn Festival Culture Experience',
        bodyN: 2,
        sign: ['The Student Union', 'September 20th'],
        open: [
            { o: 'To exchange students, our Student Union is going to hold a Mid-Autumn Festival culture experience activity.',
              p: 'In order to deepen our exchanges with international students, our Student Union will hold a Mid-Autumn Festival culture experience activity.' }
        ],
        body: [
            { o: 'The activity will be held in the school hall at three in the afternoon on September 25th.',
              p: 'The activity is scheduled to take place in the school hall at three in the afternoon on September 25th.' },
            { o: 'We will make traditional mooncakes, learn how to write calligraphy and enjoy a lantern riddle game.',
              p: 'During the event we will make traditional mooncakes, learn to write calligraphy and enjoy a lantern riddle game.' }
        ],
        end: [
            { o: 'Those who are interested please sign up at the Student Union office before Wednesday.',
              p: 'Those who are interested are welcome to sign up at the Student Union office before Wednesday.' }
        ]
    }
};
var RP_EN_SUGG_POOL = {
    content: ['要点覆盖不全：动笔前逐条标注题目要点，确保每个要点有对应句。', '建议补充具体事例支撑观点，避免内容空泛。', '审清写作身份与对象，语气需贴合收信人。'],
    language: ['减少初级词汇重复，尝试高级替换（如 important → significant）。', '注意时态一致：叙述过去经历统一用一般过去时。', '多积累固定搭配，避免中式直译。'],
    structure: ['建议使用衔接词（firstly / additionally / therefore）增强连贯。', '注意分段：建议三段式（引出—展开—结尾）。', '结尾段应自然收束并回应主题。']
};

/* ── 语文素材池：旁批（type 取值与学生报告 ANNO_LABEL 一致）、润色、亮点、建议 ── */
var RP_CN_ANNO_POOL = [
    { type: 'typo', text: '错别字：「迫不及待」误写为「迫不急待」' },
    { type: 'typo', text: '错别字：「一如既往」误写为「一如继往」' },
    { type: 'typo', text: '错别字：「辐射」误写为「幅射」' },
    { type: 'grammar', text: '语病：「通过这次活动，使我明白了坚持的意义」缺主语' },
    { type: 'grammar', text: '语病：「能否成功取决于努力的程度」一面对两面' },
    { type: 'word_choice', text: '用词不当：「巨大的成就感」宜改为「由衷的成就感」' },
    { type: 'word_choice', text: '用词重复：同段三次使用「非常」，建议替换' },
    { type: 'factual_error', text: '事实错误：苏轼为北宋人，误写为唐代' },
    { type: 'logic_issue', text: '逻辑问题：第三段论据与中心论点关联不紧' },
    { type: 'logic_issue', text: '逻辑问题：分论点二与分论点三存在内容交叉' },
    { type: 'structure_issue', text: '结构问题：开头铺垫过长，入题偏慢' },
    { type: 'structure_issue', text: '结构问题：结尾仓促，缺少呼应开头的收束' },
    { type: 'shallow_theme', text: '立意肤浅：止步于个人得失，未升华至青年责任' },
    { type: 'weak_argument', text: '论据不足：第二分论点仅一例且素材较陈旧' },
    { type: 'highlight', text: '亮点：化用《劝学》「不积跬步」自然贴切' },
    { type: 'highlight', text: '亮点：结尾以设问收束，余韵悠长' },
    { type: 'highlight', text: '亮点：比喻论证使抽象道理具体可感' },
    { type: 'highlight', text: '亮点：开头场景切入，画面感强' }
];
var RP_CN_POLISH_POOL = [
    { original: '青春很美好，我们要珍惜。', polished: '青春如朝露，转瞬即逝，唯有珍视方能不负韶华。', method: '比喻润色' },
    { original: '坚持就是胜利。', polished: '滴水穿石，非一日之功；绳锯木断，乃恒久之力。', method: '化用名言' },
    { original: '他学习很努力。', polished: '他焚膏继晷、手不释卷，于书山学海中笃行不怠。', method: '成语叠加' },
    { original: '家乡的变化很大。', polished: '家乡旧貌换新颜：青砖黛瓦间，尽是时代跃动的脉搏。', method: '形象描写' },
    { original: '我们要勇敢面对困难。', polished: '惟其艰难，方显勇毅；惟其磨砺，始得玉成。', method: '整句对仗' },
    { original: '这件事让我很难忘。', polished: '那幕情景如烙印般镌刻心底，历久弥新。', method: '比喻润色' }
];
var RP_CN_STRENGTH_POOL = ['立意深刻，能由个人体验升华至时代青年责任', '结构严谨，递进式论证层层深入', '语言典雅，名言化用自然', '事例新颖，贴近时代热点', '开头以场景切入，画面感强', '论证方法多样，比喻与对比并用'];
var RP_CN_WEAK_POOL = ['论据较陈旧，建议补充时事素材', '部分段落详略失衡，入题偏慢', '错别字与标点问题影响文面', '结尾升华稍显突兀，铺垫不足', '分论点之间有交叉，逻辑线可更清晰', '书写卷面有待加强'];
/* 语文维度子项（与学生报告 score_detail.*.items 的 key 一致）：内容 5 + 表达 4 + 发展 4 */
var RP_CN_DIM_ITEMS = {
    content: ['relevance', 'focus', 'substance', 'thought', 'emotion'],
    expression: ['genre_fit', 'structure', 'language', 'handwriting'],
    development: ['depth', 'richness', 'style', 'creativity']
};
var RP_CN_ITEM_NAME = {
    relevance: '符合题意', focus: '中心突出', substance: '内容充实', thought: '思想健康', emotion: '感情真挚',
    genre_fit: '符合文体', structure: '结构严谨', language: '语言流畅', handwriting: '字迹工整',
    depth: '深刻性', richness: '丰富性', style: '文采', creativity: '创新性'
};
var RP_CN_ANNO_LABEL = {
    off_topic: '离题', shallow_theme: '立意肤浅', weak_argument: '论据不足',
    typo: '错别字', grammar: '语病', word_choice: '用词不当',
    logic_issue: '逻辑问题', structure_issue: '结构问题',
    factual_error: '事实错误', highlight: '亮点',
    word_count_short: '字数不足', title_missing: '缺标题'
};
var RP_CN_DEDUCT_LABEL = {
    typo: '错别字', punctuation: '标点错误', word_count_short: '字数不足',
    title_missing: '缺标题', info_leak: '泄露信息', handwriting_penalty: '卷面书写'
};

/* ── 确定性工具：字符串散列种子 + 不放回抽选 ── */
function rpEssaySeed(hwId, qid, cls) {
    var s = hwId + '|' + qid + '|' + cls, h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
}
function rpPickN(r, pool, n) {
    var idx = pool.map(function (_, i) { return i; }), out = [];
    for (var i = 0; i < n && idx.length; i++) {
        var j = Math.floor(r() * idx.length);
        out.push(pool[idx.splice(j, 1)[0]]);
    }
    return out;
}
/* 该题班级基准得分率：HW-0910-U1 q12 复用 RP_QUESTIONS 第 12 题口径，其余用题目自带 baseRate + 班级偏置 */
function rpEssayBaseRate(q, c) {
    if (q.baseRate == null && c.qRates) return c.qRates[RP_QUESTIONS.length - 1];
    return rpClamp((q.baseRate || 66) + (c.bias || 0), 20, 95);
}

/* 词形变体：模拟学生卷面原始写法（句首大写 / 连字符写法），
   用于验证归一化规则——Take part in / take-part-in / take part in 归为同一条目 */
function rpEnWordForm(r, word) {
    var x = r();
    if (x < 0.22) return word.charAt(0).toUpperCase() + word.slice(1);
    if (x < 0.34 && word.indexOf(' ') > 0 && word.indexOf('...') < 0) return word.replace(/ /g, '-');
    return word;
}

/* 英语学生级报告 mock：维度分合成总分（可复算），错误/亮点数量与得分率负/正相关 */
function rpEnEssayStu(r, q, s, rate) {
    var dimFull = q.full === 25 ? { content: 10, language: 10, structure: 5 } : { content: 6, language: 6, structure: 3 };
    var dims = {}, dimRates = {}, total = 0;
    ['content', 'language', 'structure'].forEach(function (k) {
        var dr = rpClamp(rate + (r() * 16 - 8), 10, 100);
        dimRates[k] = dr;
        dims[k] = Math.round(dr / 100 * dimFull[k] * 2) / 2;
        total += dims[k];
    });
    total = Math.min(q.full, Math.round(total * 2) / 2);
    var realRate = Math.round(total / q.full * 1000) / 10;
    var errN = realRate >= 85 ? Math.floor(r() * 2)
        : realRate >= 70 ? 1 + Math.floor(r() * 3)
        : realRate >= 55 ? 3 + Math.floor(r() * 2) : 4 + Math.floor(r() * 4);
    var errors = rpPickN(r, RP_EN_ERR_POOL, errN).map(function (e) {
        return { type: e.type, original: e.original, correction: e.correction, note: e.note };
    });
    /* 佳句亮点专用随机流 rb：只服务于词形变体 / 例句挑选 / 生动描写取材。
       它不插入本函数既有 r() 的取数序列，保证维度分、错误数等既有 mock 数据整体不漂移 */
    var rb = rpRand(rpEssaySeed('BEST-v1', s.examNum, 'en'));
    var vocab = (realRate >= 60 ? rpPickN(r, RP_EN_VOCAB_POOL, realRate >= 85 ? 2 + Math.floor(r() * 2) : Math.floor(r() * 2)) : []).map(function (v) {
        return { word: rpEnWordForm(rb, v.word), note: v.note, sent: v.sents[Math.floor(rb() * v.sents.length)] };
    });
    var syntax = (realRate >= 70 ? rpPickN(r, RP_EN_SYNTAX_POOL, realRate >= 88 ? 2 : 1) : []).map(function (y) {
        return { sentence: y.sents[Math.floor(rb() * y.sents.length)], syntax_type: y.syntax_type };
    });
    var descriptions = realRate >= 65 ? rpPickN(rb, RP_EN_DESC_POOL, realRate >= 85 ? 2 : 1).map(function (d) {
        return { sentence: d.sents[Math.floor(rb() * d.sents.length)], description_type: d.description_type };
    }) : [];
    var polished = rpPickN(r, RP_EN_POLISH_POOL, 1 + Math.floor(r() * 2));
    var weakDim = ['content', 'language', 'structure'].sort(function (a, b) { return dimRates[a] - dimRates[b]; })[0];
    var sugg = [{ category: weakDim, content: rpPickN(r, RP_EN_SUGG_POOL[weakDim], 1)[0] }];
    var other = weakDim === 'language' ? 'structure' : 'language';
    sugg.push({ category: other, content: rpPickN(r, RP_EN_SUGG_POOL[other], 1)[0] });
    var level = realRate >= 85 ? '第五档' : realRate >= 70 ? '第四档' : realRate >= 55 ? '第三档'
        : realRate >= 35 ? '第二档' : (total > 0 ? '第一档' : '零分');
    return {
        examNum: s.examNum, name: s.name, status: 'normal',
        score: total, rate: realRate, level: level,
        dims: dims, dimFull: dimFull,
        wordCount: Math.round(q.wcBase * (0.85 + r() * 0.4)),
        errors: errors, vocab: vocab, syntax: syntax, descriptions: descriptions, polished: polished, suggestions: sugg,
        essay: rpEnEssay(q.qid, s.examNum)
    };
}

/* 词条归一键：与页面侧分组键同规则（去首尾空格、统一小写、连字符与多余空白折成空格） */
function rpEnNormKey(w) {
    return String(w == null ? '' : w).trim().toLowerCase()
        .replace(/[-‐‑–—]/g, ' ').replace(/\s+/g, ' ').trim();
}
/* 由学生手里的词条写法反查素材条目（词形变体：句首大写 / 连字符写法都能对上） */
function rpEnVocabEntry(word) {
    var k = rpEnNormKey(word);
    for (var i = 0; i < RP_EN_VOCAB_POOL.length; i++) {
        if (rpEnNormKey(RP_EN_VOCAB_POOL[i].word) === k) return RP_EN_VOCAB_POOL[i];
    }
    return null;
}
function rpEnSyntaxEntry(type) {
    for (var i = 0; i < RP_EN_SYNTAX_POOL.length; i++) {
        if (RP_EN_SYNTAX_POOL[i].syntax_type === type) return RP_EN_SYNTAX_POOL[i];
    }
    return null;
}
function rpEnDescEntry(type) {
    for (var i = 0; i < RP_EN_DESC_POOL.length; i++) {
        if (RP_EN_DESC_POOL[i].description_type === type) return RP_EN_DESC_POOL[i];
    }
    return null;
}
/* 段落抽取：从素材池里确定性地取 n 段（不重复，按原顺序返回） */
function rpEnPickSegs(list, n, r) {
    var idx = [], guard = 0;
    while (idx.length < n && idx.length < list.length && guard < 80) {
        guard++;
        var i = Math.floor(r() * list.length);
        if (idx.indexOf(i) < 0) idx.push(i);
    }
    for (var j = 0; idx.length < n && j < list.length; j++) {
        if (idx.indexOf(j) < 0) idx.push(j);
    }
    idx.sort(function (a, b) { return a - b; });
    return idx.map(function (i) { return list[i]; });
}
/* 成篇作文：开头 1 段 + 主体 bodyN 段 + 结尾 1 段，逐段给「原稿 / 润色后」两份文本；
   按考号派生随机流，同一学生多次渲染结果稳定，不同学生抽到的段落组合不同 */
function rpEnEssay(qid, examNum) {
    var pool = RP_EN_ESSAY_POOL[qid];
    if (!pool) return null;
    var r = rpRand(rpEssaySeed('ESSAY-v1', examNum, qid));
    var segs = [];
    if (pool.open) segs = segs.concat(rpEnPickSegs(pool.open, 1, r));
    if (pool.body) segs = segs.concat(rpEnPickSegs(pool.body, pool.bodyN || 2, r));
    if (pool.end) segs = segs.concat(rpEnPickSegs(pool.end, 1, r));
    return {
        title: pool.title,
        sign: pool.sign || null,
        orig: segs.map(function (x) { return x.o; }),
        pol: segs.map(function (x) { return x.p; })
    };
}
/* 例句去重：同一素材条目下按学生出现顺序轮转取例句，
   组内跨条目天然不重样（不同条目例句池不同），条目内轮转也不会重复，
   避免模块 6「学生佳句」同一分组里出现多行完全相同的句子 */
function rpEnAssignSents(stus) {
    var cv = {}, cs = {}, cd = {};
    stus.forEach(function (s) {
        if (!s.vocab) return;
        s.vocab.forEach(function (v) {
            var e = rpEnVocabEntry(v.word);
            if (!e) return;
            var c = cv[e.word] || 0;
            v.sent = e.sents[c % e.sents.length];
            cv[e.word] = c + 1;
        });
        s.syntax.forEach(function (y) {
            var e = rpEnSyntaxEntry(y.syntax_type);
            if (!e) return;
            var c = cs[y.syntax_type] || 0;
            y.sentence = e.sents[c % e.sents.length];
            cs[y.syntax_type] = c + 1;
        });
        (s.descriptions || []).forEach(function (d) {
            var e = rpEnDescEntry(d.description_type);
            if (!e) return;
            var c = cd[d.description_type] || 0;
            d.sentence = e.sents[c % e.sents.length];
            cd[d.description_type] = c + 1;
        });
    });
    return stus;
}

/* 语文学生级报告 mock：总分 = 三维得分 − 扣分合计（与学生报告公式一致，可复算） */
function rpCnEssayStu(r, q, s, rate) {
    var dimFull = q.full === 60 ? { content: 20, expression: 20, development: 20 } : { content: 4, expression: 3, development: 3 };
    var dims = {}, dimRates = {}, items = {}, dimSum = 0;
    Object.keys(RP_CN_DIM_ITEMS).forEach(function (k) {
        var dr = rpClamp(rate + (r() * 14 - 7), 10, 100);
        dimRates[k] = dr;
        dims[k] = Math.round(dr / 100 * dimFull[k]);
        dimSum += dims[k];
        RP_CN_DIM_ITEMS[k].forEach(function (it) {
            items[it] = Math.round(rpClamp(dr + (r() * 20 - 10), 5, 100));
        });
    });
    /* 扣分明细：按概率命中，合计扣分从总分中扣减 */
    var deductions = [], dedTotal = 0;
    if (r() < 0.35) { var d1 = -(1 + Math.floor(r() * 2)); deductions.push({ type: 'typo', deduction: d1 }); dedTotal += -d1; }
    if (r() < 0.18) { deductions.push({ type: 'punctuation', deduction: -1 }); dedTotal += 1; }
    if (rate < 50 && r() < 0.35) { var d3 = -(2 + Math.floor(r() * 3)); deductions.push({ type: 'word_count_short', deduction: d3 }); dedTotal += -d3; }
    if (r() < 0.03) { deductions.push({ type: 'title_missing', deduction: -2 }); dedTotal += 2; }
    if (r() < 0.10) { deductions.push({ type: 'handwriting_penalty', deduction: -1 }); dedTotal += 1; }
    var score = Math.max(0, dimSum - dedTotal);
    var rate01 = score / q.full;
    var gradeLabel = rate01 >= 0.8 ? '一类文' : rate01 >= 0.7 ? '二类文' : rate01 >= 0.6 ? '三类文'
        : rate01 >= 0.5 ? '四类文' : '五类文';
    /* 旁批：低分多问题类，高分多亮点类 */
    var realRate = rate01 * 100;
    var annoPool = RP_CN_ANNO_POOL.filter(function (a) { return a.type !== 'highlight'; });
    var hlPool = RP_CN_ANNO_POOL.filter(function (a) { return a.type === 'highlight'; });
    var annos = rpPickN(r, annoPool, realRate >= 80 ? 1 + Math.floor(r() * 2) : realRate >= 60 ? 2 + Math.floor(r() * 2) : 3 + Math.floor(r() * 3))
        .concat(rpPickN(r, hlPool, realRate >= 75 ? 1 + Math.floor(r() * 2) : (r() < 0.3 ? 1 : 0)));
    return {
        examNum: s.examNum, name: s.name, status: 'normal',
        score: score, rate: Math.round(rate01 * 1000) / 10, level: gradeLabel,
        dims: dims, dimFull: dimFull, items: items,
        deductions: deductions, dedTotal: dedTotal,
        wordCount: Math.round(q.wcBase * (0.88 + r() * 0.3)),
        annos: annos,
        polish: rpPickN(r, RP_CN_POLISH_POOL, 1 + Math.floor(r() * 2)),
        strengths: rpPickN(r, RP_CN_STRENGTH_POOL, realRate >= 70 ? 1 + Math.floor(r() * 2) : Math.floor(r() * 2)),
        weaknesses: rpPickN(r, RP_CN_WEAK_POOL, realRate >= 80 ? Math.floor(r() * 2) : 1 + Math.floor(r() * 2))
    };
}

/* 学生级智批报告集合：复用班级花名册，确定性生成；白卷/异常卷 → noReport */
function rpEssayStudents(hwId, qid, cls) {
    var q = rpEssayQuestions(hwId).filter(function (x) { return x.qid === qid; })[0];
    var c = RP_CLASSES.find(function (x) { return x.cls === cls; });
    if (!q || !c || c.status !== 'reviewed') return [];
    var r = rpRand(rpEssaySeed(hwId, qid, cls));
    var base = rpEssayBaseRate(q, c);
    var list = rpStudents(cls).map(function (s) {
        if (s.status !== 'normal') {
            return { examNum: s.examNum, name: s.name, status: s.status, noReport: true };
        }
        var u = r() + r() + r();
        var rate = rpClamp(base + (u - 1.5) / 1.5 * 15, 8, 99);
        return q.subject === 'en' ? rpEnEssayStu(r, q, s, rate) : rpCnEssayStu(r, q, s, rate);
    });
    /* 英语：组内例句去重（同一素材条目下轮转取不同例句），语文不涉及 */
    return q.subject === 'en' ? rpEnAssignSents(list) : list;
}

/* 年级作文学生集合：同作业同题下全部「已批阅」班级（未批阅班自动排除）的学生级作文，
   供作文报告做班级 × 年级对比（维度均分 / 错误类型人次）。
   年级口径 = 同作业同题下所有已批阅班级已智批学生的合集，含当前班； */
function rpEssayGradeStudents(hwId, qid) {
    var out = [];
    RP_CLASSES.forEach(function (c) {
        if (c.status !== 'reviewed') return;
        rpEssayStudents(hwId, qid, c.cls).forEach(function (s) {
            if (s.noReport) return;
            s.cls = c.cls;
            out.push(s);
        });
    });
    return out;
}

/* 计数柱状图（人数等计数轴，值域自适应；labels + values + 可选 colors/unit）
   本图仅作文报告使用，宿主 .es-cell 宽约 690px：viewBox 若仍取 1000，字会缩到 7px；
   改 700 并把 H 同比降到 133，渲染高度不变但字号回到 10px 档（o.w 可覆盖，同 rpSvgBarLine） */
function rpSvgBars(o) {
    var W = o.w || 700, H = o.h || 133, PL = 40, PR = 12, PT = 20, PB = 28;
    var max = Math.max.apply(null, o.values.concat([1])) * 1.18;
    var n = o.labels.length, iw = (W - PL - PR) / n, bw = Math.min(52, iw * 0.6);
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + rpEsc(o.aria || '柱状图') + '">';
    [0, 0.5, 1].forEach(function (f) {
        var v = Math.round(max * f), y = rpY(v, H, PT, PB, max);
        s += '<line x1="' + PL + '" y1="' + y + '" x2="' + (W - PR) + '" y2="' + y + '" stroke="#eef1f5"/>'
            + '<text x="' + (PL - 6) + '" y="' + (y + 3.5) + '" font-size="10" fill="#909399" text-anchor="end">' + v + '</text>';
    });
    o.labels.forEach(function (lb, i) {
        var cx = PL + iw * i + iw / 2, v = o.values[i], y = rpY(v, H, PT, PB, max);
        var fill = (o.colors && o.colors[i]) || '#8fb5fa';
        s += '<rect x="' + (cx - bw / 2) + '" y="' + y + '" width="' + bw + '" height="' + Math.max(0, H - PB - y) + '" rx="2" fill="' + fill + '"><title>' + rpEsc(lb) + ' ' + v + (o.unit || '') + '</title></rect>';
        if (v > 0) s += '<text x="' + cx + '" y="' + (y - 5) + '" font-size="10.5" fill="#606266" text-anchor="middle">' + v + '</text>';
        s += '<text x="' + cx + '" y="' + (H - 9) + '" font-size="10.5" fill="#606266" text-anchor="middle">' + rpEsc(lb) + '</text>';
    });
    return s + '</svg>';
}
