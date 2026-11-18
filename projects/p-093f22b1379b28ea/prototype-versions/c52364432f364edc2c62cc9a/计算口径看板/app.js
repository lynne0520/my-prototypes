/* 学科学情 · 计算口径看板
 * 所有数字由本文件实时算出，禁止手写结论值。
 * 口径来源：PRD.md CALC-01 / XK-06A / XK-07B（班级口径）。
 * 学生层口径（学生学情、学生追踪-知识点分析、环比、需关注名单与状态判定 V3.0）已下线，本看板不再维护。
 */

/* ==================== 0 基础数学（唯一实现） ==================== */

const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;
const fmt = (v, d = 1) => (v === null || v === undefined || Number.isNaN(v) ? '—' : v.toFixed(d));
const sum = (a) => a.reduce((x, y) => x + y, 0);
const mean = (a) => (a.length ? sum(a) / a.length : null);

/* 总体标准差：除以 n，不是 n−1（教学口径，不是抽样估计） */
const sdPop = (a) => {
  const m = mean(a);
  return Math.sqrt(sum(a.map((v) => (v - m) ** 2)) / a.length);
};
/* 样本标准差：仅用于演示「除错分母会差多少」 */
const sdSample = (a) => {
  const m = mean(a);
  return Math.sqrt(sum(a.map((v) => (v - m) ** 2)) / (a.length - 1));
};

/* w = 0.5^(Δ / H) */
const wOf = (days, H) => Math.pow(0.5, days / H);

/* 加权平均：Σ(w·v) ÷ Σw，权重归一，因此同乘常数结果不变 */
const wMean = (vals, ws) => {
  const sw = sum(ws);
  return sw ? sum(vals.map((v, i) => v * ws[i])) / sw : null;
};

const dayDiff = (from, to) =>
  Math.round((new Date(to + 'T00:00:00') - new Date(from + 'T00:00:00')) / 86400000);

/* ==================== 1 样例数据 ==================== */

/* 6 场演示任务：取自学科学情一期 js/app.js 的 periodTasks（真实演示值） */
const TASKS = [
  { name: '第一次月考', date: '2025-09-28', type: 'exam', rate: 72.4, grade: 70.2, submitted: 48 },
  { name: '同步作业(三)', date: '2025-10-09', type: 'assignment', rate: 68.1, grade: 66.8, submitted: 46 },
  { name: '同步作业(五)', date: '2025-10-16', type: 'assignment', rate: 74.6, grade: 72.1, submitted: 48 },
  { name: '期中联考', date: '2025-11-13', type: 'exam', rate: 63.4, grade: 65.9, submitted: 44 },
  { name: '同步作业(七)', date: '2025-11-20', type: 'assignment', rate: 71.3, grade: 69.8, submitted: 45 },
  { name: '冲刺卷(一)', date: '2025-12-11', type: 'exam', rate: 76.8, grade: 75.4, submitted: 45 },
];
const CLASS_SIZE = 48;
const PERIOD_END = TASKS[TASKS.length - 1].date; // 周期结束日 = 加权锚点

/* 样例考核项：6 场中 1 场未考查（null），用于演示「未知不进分母」 */
const ATOM = {
  name: '指数幂运算',
  module: '指数与对数',
  losses: [null, 38.0, 33.0, 52.0, 41.0, 61.0],
};

/* 样例题目：一题多标签，用于演示「同场同点合并后按分值加权」 */
const QUESTIONS = [
  { no: '12(1)', score: 10, got: 6.0, atoms: ['指数幂运算'] },
  { no: '12(2)', score: 12, got: 7.2, atoms: ['指数幂运算', '指数函数'] },
  { no: '15', score: 8, got: 5.6, atoms: ['指数幂运算'] },
];

/* mSet 样例：18 个挂接单元（16 个末级知识点 + 2 个被挂接的能力末级节点） */
const MSET = {
  knowledgeCount: 16,
  abilityCount: 2,
  treeLeaves: 111, // 全树末级节点总数（错误分母）
  nodes: [92, 88, 86, 85, 84, 83, 82, 81, 81, 80, 80, 78, 74, 70, 66, 58, 52, 45],
};

/* 错因首末占比 */
const CAUSES = [
  { name: '计算失误', first: 32.1, last: 41.2 },
  { name: '概念混淆', first: 28.4, last: 22.0 },
  { name: '方法不当', first: 21.5, last: 20.8 },
  { name: '审题不清', first: 18.0, last: 16.0 },
];

/* ==================== 2 参数 ==================== */

const PARAMS = [
  { id: 'H', name: 'H 半衰期', hint: '知识点加权的时间衰减常数（后台常量，前端不开放配置）', min: 15, max: 60, step: 5, def: 30, unit: ' 天',
    impacts: ['考核项 mastery', '档位 / 未掌握数', '达标率'] },
  { id: 'pass', name: '达标线', hint: '「掌握」档下限；3 档与 4 档均为 80（4 档的 90 是「优秀」下限）', min: 75, max: 90, step: 5, def: 80, unit: '%',
    impacts: ['达标率分子', '达标数量', '已达标标签'] },
  { id: 'low', name: '未掌握线', hint: '最低档上界，用于树图着色、未掌握计数、断层目标', min: 55, max: 70, step: 5, def: 60, unit: '%',
    impacts: ['未掌握节点数', '考核项档位', '前序断层目标判定'] },
  { id: 'nStub', name: '顽固次数', hint: '失分率 ≥阈值的「不同任务」数达到该值即判顽固', min: 2, max: 4, step: 1, def: 3, unit: ' 次',
    impacts: ['顽固命中', '顽固强度', '教学建议'] },
  { id: 'stubThr', name: '顽固失分率阈值', hint: '逐场 loss ≥ 该值才计入次数', min: 30, max: 50, step: 5, def: 40, unit: '%',
    impacts: ['顽固命中', '顽固强度', '热力行尾判定章'] },
];

const P = Object.fromEntries(PARAMS.map((p) => [p.id, p.def]));

/* 掌握档位：3 档 / 4 档的达标线必须相同（4 档只多一条「优秀」90 线） */
const BANDS = {
  3: { mastered: 80, weak: 60 },
  4: { excellent: 90, mastered: 80, weak: 60 },
};

/* ==================== 3 计算 ==================== */

/* 档位映射：3 档 = 达标线 / 未掌握线；4 档仅多一条「优秀」90 线 */
function tierOf(mastery, p) {
  if (mastery === null) return { name: '无证据', cls: 'none' };
  if (mastery >= 90) return { name: '优秀', cls: 'green' };
  if (mastery >= p.pass) return { name: '掌握', cls: 'green' };
  if (mastery >= p.low) return { name: '一般', cls: 'blue' };
  return { name: '未掌握', cls: 'red' };
}

/* 单场知识点得分率：同场同点题目合并后按分值加权 */
function qRateOf(atomsFilter) {
  const qs = QUESTIONS.filter((q) => q.atoms.includes(atomsFilter));
  const total = sum(qs.map((q) => q.score));
  /* 逐题失分率先不取整，避免合计行与分项对不上（30 × 37.3 = 1119 ≠ 1120） */
  const lossRaw = qs.map((q) => (1 - q.got / q.score) * 100);
  const scoreLoss = sum(qs.map((q, i) => q.score * lossRaw[i]));
  return { qs, total, scoreLoss, lossRate: r1(scoreLoss / total), qRate: r1(100 - scoreLoss / total) };
}

/* 节点掌握度：Σw·rate ÷ Σw，null 场不进分母 */
function masteryOf(losses, dates, anchor, H) {
  const rows = [];
  losses.forEach((loss, i) => {
    if (loss === null) return;
    const days = dayDiff(dates[i], anchor);
    rows.push({ i, date: dates[i], loss, rate: r1(100 - loss), days, w: wOf(days, H) });
  });
  const sw = sum(rows.map((r) => r.w));
  const swr = sum(rows.map((r) => r.w * r.rate));
  return { rows, sw, swr, mastery: r1(swr / sw), valid: rows.length };
}

/* 顽固判定：逐场 loss ≥ 阈值 的「不同任务」数 */
function stubbornOf(losses, thr, need) {
  const hits = [];
  losses.forEach((loss, i) => {
    if (loss !== null && loss >= thr) hits.push({ i, loss });
  });
  const n = hits.length;
  const strength = n >= 5 ? '结构性（≥5 次）' : n >= 3 ? '疑似（3~4 次）' : '观察（1~2 次）';
  return { hits, n, hit: n >= need, strength };
}

/* 原学生层状态引擎（d / w2 / P / S / L / Δ′ / 九显示态 / 五档等级）已随需关注名单一同下线 */
/* 热力行尾六态：顽固优先，其余看前后两半均值差 */
function heatTrend(losses, thr, need) {
  const valid = losses.filter((v) => v !== null);
  const half = Math.floor(valid.length / 2);
  const diff = mean(valid.slice(half)) - mean(valid.slice(0, half));
  const stub = stubbornOf(losses, thr, need);
  let state;
  if (stub.hit) state = '顽固';
  else if (Math.abs(diff) >= 5) state = diff > 0 ? '恶化' : '回升';
  else state = stub.n >= 1 ? '偶发' : '稳定';
  return { valid, cumulative: r1(mean(valid)), first: r1(mean(valid.slice(0, half))),
    second: r1(mean(valid.slice(half))), diff: r1(diff), state, stub };
}

/* ==================== 4 渲染工具 ==================== */

const $ = (id) => document.getElementById(id);
const body = (key) => document.querySelector(`[data-render="${key}"]`);
const chip = (t) => `<span class="chip ${t.cls}">${t.text}</span>`;
const v = (x, d = 1) => `<span class="num">${fmt(x, d)}</span>`;

function table(head, rows, foot) {
  return `<table class="dt"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.join('')}</tr>`).join('')}</tbody>
    ${foot ? `<tfoot><tr>${foot.join('')}</tr></tfoot>` : ''}</table>`;
}

const verdict = (cls, items) =>
  `<div class="verdict ${cls}">${items
    .map((it) => `<span class="k">${it[0]}</span><span class="v ${it[2] || ''}">${it[1]}</span>`)
    .join('')}</div>`;

const trap = (html) => `<div class="trap">${html}</div>`;

/* ==================== 5 各卡渲染 ==================== */

function renderT1() {
  const kp = qRateOf('指数幂运算');
  const ab = qRateOf('指数函数');
  const perQ = r1(mean(kp.qs.map((q) => r1((1 - q.got / q.score) * 100))));

  const rows = QUESTIONS.map((q) => [
    `<td>${q.no}</td>`,
    `<td class="num">${q.score}</td>`,
    `<td class="num">${q.got}</td>`,
    `<td class="num">${fmt(r1((1 - q.got / q.score) * 100))}%</td>`,
    `<td class="num">${q.score * r1((1 - q.got / q.score) * 100)}</td>`,
    `<td class="mute">${q.atoms.join('、')}</td>`,
  ]);

  body('t1').innerHTML =
    table(['题号', '分值', '得分', '失分率', '分值 × 失分率', '挂接知识点'], rows,
      [`<td colspan="2">合计</td>`, `<td class="num">${kp.total}</td>`,
       `<td class="num">${fmt(kp.lossRate)}%</td>`, `<td class="num">${fmt(kp.scoreLoss, 1)}</td>`, `<td></td>`]) +
    verdict('ok-bg', [
      ['qRate「指数幂运算」', fmt(kp.qRate) + '%', 'ok'],
      ['有效题数', kp.qs.length + ' 题', ''],
    ]) +
    `<div class="compare">
      <div class="cmp good"><h5>正确：合并后按分值加权</h5>
        <p>Σ(分值 × 失分率) ÷ Σ分值 = ${fmt(kp.scoreLoss, 1)} ÷ ${kp.total} = <span class="n">${fmt(kp.lossRate)}%</span> 失分 → qRate <span class="n">${fmt(kp.qRate)}%</span></p></div>
      <div class="cmp bad"><h5>错误：逐题失分率算术平均</h5>
        <p>(40% + 40% + 30%) ÷ 3 = <span class="n">${fmt(perQ)}%</span> 失分 → 得分率 <span class="n">${fmt(100 - perQ)}%</span></p>
        <p>差 ${fmt(Math.abs(kp.qRate - (100 - perQ)))} 个百分点。分值大的题必须更有话语权。</p></div>
    </div>` +
    trap(`<b>两条硬约束：</b>① 同一道题挂多个知识点时，各知识点<b>独立</b>计算，不存在加总守恒——「指数函数」只由 12(2) 派生，得 ${fmt(ab.qRate)}%，与「指数幂运算」无数量关系；② 同一场同一考核项内必须合并计算，若按题次逐题入表，「12(2)」会被重复计入两个知识点，题目总数与分值都会虚高。`);
}

function renderT2(p) {
  const m = masteryOf(ATOM.losses, TASKS.map((t) => t.date), PERIOD_END, p.H);
  const tier = tierOf(m.mastery, p);
  const arith = r1(mean(m.rows.map((r) => r.rate)));

  const rows = ATOM.losses.map((loss, i) => {
    if (loss === null) {
      return [`<td>${TASKS[i].name}</td>`, `<td>${TASKS[i].date}</td>`, `<td class="mid mute">未考查</td>`,
        `<td class="mid mute">—</td>`, `<td class="mid mute">—</td>`, `<td class="num mute">—</td>`,
        `<td class="num mute">—</td>`, `<td class="mute">不进分母</td>`];
    }
    const r = m.rows.find((x) => x.i === i);
    return [`<td>${TASKS[i].name}</td>`, `<td>${TASKS[i].date}</td>`, `<td class="mid num">${r.days}</td>`,
      `<td class="mid num">${fmt(r.w, 3)}</td>`, `<td class="num">${fmt(r.rate)}%</td>`,
      `<td class="num">${fmt(r.w * r.rate, 2)}</td>`, `<td class="num">${fmt(loss)}%</td>`,
      `<td class="mute">${loss >= p.stubThr ? '<span class="hit">≥阈值</span>' : '—'}</td>`];
  });

  body('t2').innerHTML =
    table(['任务', '日期', 'Δ 天', 'w', '单场得分率', 'w × 得分率', '单场失分率', '顽固计数'], rows,
      [`<td colspan="2">合计（${m.valid} 场有效）</td>`, `<td></td>`, `<td class="num">${fmt(m.sw, 3)}</td>`,
       `<td></td>`, `<td class="num">${fmt(m.swr, 2)}</td>`, `<td></td>`, `<td></td>`]) +
    verdict('', [
      ['mastery = ', fmt(m.swr, 2) + ' ÷ ' + fmt(m.sw, 3) + ' = ' + fmt(m.mastery) + '%', ''],
      ['档位', tier.name, tier.cls === 'red' ? 'bad' : tier.cls === 'green' ? 'ok' : 'warn'],
      ['算术均值（对照）', fmt(arith) + '%', ''],
      ['差值', fmt(m.mastery - arith) + ' 个点', ''],
    ]) +
    trap(`<b>为什么加权更低：</b>近期两场（11-20、12-11）失分率是 41% / 61%，权重合计 ${fmt(m.rows[3].w + m.rows[4].w, 3)}，占 Σw 的 ${fmt((m.rows[3].w + m.rows[4].w) / m.sw * 100)}%；最早的 10-09 只有 ${fmt(m.rows[0].w / m.sw * 100)}%。算术均值把这四场等权，因此<b>把正在恶化的趋势藏了起来</b>。<br><b>两条边界：</b>① 09-28 那场未考查本点，<b>不进分母也不按 0 分算</b>（按 0 算会得出 ${fmt((m.swr) / (m.sw + wOf(dayDiff(TASKS[0].date, PERIOD_END), p.H)))}% 这种毫无意义的数）；② 权重只用于同周期内相对比较，全部 w 同乘常数结果不变，所以不必关心 H 的绝对量级。`);
}

function renderT3() {
  const rates = TASKS.map((t) => t.rate);
  const grades = TASKS.map((t) => t.grade);
  const m = mean(rates);
  const sd = sdPop(rates);
  const stable = 100 - sd;
  const max = Math.max(...rates), min = Math.min(...rates);
  const wins = rates.filter((r, i) => r > grades[i]).length;
  const winRate = (wins / rates.length) * 100;
  const firstLast = rates[rates.length - 1] - rates[0];
  const should = CLASS_SIZE * TASKS.length;
  const done = sum(TASKS.map((t) => t.submitted));
  const submit = (done / should) * 100;
  const trendBand = (x) =>
    x >= 3 ? '显著回升' : x >= 1 ? '缓慢回升' : x > -1 ? '基本持平' : x > -3 ? '缓慢下滑' : '明显下滑';

  const rows = TASKS.map((t, i) => [
    `<td>${t.name}</td>`, `<td>${t.date}</td>`,
    `<td class="mute">${t.type === 'exam' ? '考试' : '作业'}</td>`,
    `<td class="num">${fmt(t.rate)}</td>`, `<td class="num">${fmt(t.grade)}</td>`,
    `<td class="num">${fmt(t.rate - t.grade)}</td>`,
    `<td class="num">${fmt(t.rate - m, 2)}</td>`,
    `<td class="num">${fmt((t.rate - m) ** 2, 2)}</td>`,
    `<td class="num">${t.submitted} / ${CLASS_SIZE}</td>`,
  ]);

  body('t3').innerHTML =
    table(['任务', '日期', '类型', '本班 cRate', '年级', '差值', 'v − mean', '(v − mean)²', '实交 / 应交'], rows,
      [`<td colspan="3">合计</td>`, `<td class="num">${fmt(sum(rates), 1)}</td>`, `<td></td>`, `<td></td>`,
       `<td></td>`, `<td class="num">${fmt(sum(rates.map((x) => (x - m) ** 2)), 2)}</td>`, `<td class="num">${done} / ${should}</td>`]) +
    verdict('', [
      ['平均得分率', fmt(m) + '%', ''],
      ['σ（÷n）', fmt(sd, 2), ''],
      ['稳定度', fmt(stable) + '%', 'ok'],
      ['极差', fmt(max - min) + ' 个点', ''],
      ['年级对比胜率', fmt(winRate) + '%', 'ok'],
      ['首末变化', (firstLast >= 0 ? '+' : '') + fmt(firstLast) + ' 个点 · ' + trendBand(firstLast), ''],
      ['提交率', fmt(submit) + '%', ''],
    ]) +
    `<div class="compare">
      <div class="cmp good"><h5>正确：σ ÷ n = ${fmt(sd, 2)}</h5>
        <p>教学口径，把 6 场当作全部证据，不是从总体里抽样估计。</p></div>
      <div class="cmp bad"><h5>错误：σ ÷ (n−1) = ${fmt(sdSample(rates), 2)}</h5>
        <p>稳定度会变成 <span class="n">${fmt(100 - sdSample(rates))}</span>%，比正确值高 ${fmt(sdSample(rates) - sd, 2)} 个点。差得不多，但它是<b>系统性偏高</b>，全班 48 人都偏。</p></div>
    </div>` +
    trap(`<b>三个易错点：</b>① 稳定度必须用同一个 σ 直接相减，<b>不得</b>先各自四舍五入到 1 位再减（会出现 100 − 4.4 = 95.6 而实际 95.63 的情况）；② 胜率是<b>严格大于</b>，本班与年级相等的那场不计胜；③ 首末变化只取首末两场，中间场次的起伏不进趋势档，档位边界 ±3 / ±1 用原始差值严格比较，不得先取整（3.96 → 4.0 会把「缓慢」错判成「显著」）。`);
}

function renderT4(p) {
  const total = MSET.knowledgeCount + MSET.abilityCount;
  const pass = MSET.nodes.filter((n) => n >= p.pass).length;
  const low = MSET.nodes.filter((n) => n < p.low).length;
  const weak = total - pass - low;
  const rate = (pass / total) * 100;
  const wrongRate = (pass / MSET.treeLeaves) * 100;

  body('t4').innerHTML =
    table(['集合构成', '数量', '说明'],
      [[`<td>末级知识点（本期被题目挂接）</td>`, `<td class="num">${MSET.knowledgeCount}</td>`, `<td class="mute">按任务汇总去重，未挂接的不进集合</td>`],
       [`<td>能力末级节点（关联知识点至少 1 个被挂接）</td>`, `<td class="num">${MSET.abilityCount}</td>`, `<td class="mute">得分率由这些知识点聚合派生</td>`],
       [`<td><b>|mSet|</b></td>`, `<td class="num"><b>${total}</b></td>`, `<td class="mute">达标率的分母</td>`],
       [`<td>全树末级节点总数</td>`, `<td class="num">${MSET.treeLeaves}</td>`, `<td class="hit">不是分母</td>`]]) +
    table(['档位（按 mastery ≥ ' + p.pass + '% / ≥ ' + p.low + '%）', '节点数', '占比'],
      [[`<td>达标</td>`, `<td class="num">${pass}</td>`, `<td class="num">${fmt((pass / total) * 100)}%</td>`],
       [`<td>薄弱</td>`, `<td class="num">${weak}</td>`, `<td class="num">${fmt((weak / total) * 100)}%</td>`],
       [`<td>未掌握</td>`, `<td class="num">${low}</td>`, `<td class="num">${fmt((low / total) * 100)}%</td>`]],
      [`<td>合计</td>`, `<td class="num">${pass + weak + low}</td>`, `<td class="num">${fmt(((pass + weak + low) / total) * 100)}%</td>`]) +
    verdict(pass + weak + low === total ? 'ok-bg' : 'bad-bg', [
      ['达标率 = ' + pass + ' ÷ ' + total, fmt(rate) + '%', 'ok'],
      ['三档正算之和', `${pass + weak + low} / ${total}`, pass + weak + low === total ? 'ok' : 'bad'],
    ]) +
    `<div class="compare">
      <div class="cmp good"><h5>正确：分母 = mSet = ${total}</h5>
        <p>达标率 <span class="n">${fmt(rate)}%</span></p></div>
      <div class="cmp bad"><h5>错误：分母 = 全树末级 ${MSET.treeLeaves}</h5>
        <p>达标率 <span class="n">${fmt(wrongRate)}%</span>。少了 ${total - pass} 个「本期没考」的节点进分母，数字掉了 ${fmt(rate - wrongRate)} 个点，界面不报错。</p></div>
    </div>` +
    trap(`<b>不得反算：</b>「未掌握 = 总数 − 达标 − 薄弱」只有在三档定义严格互补时才成立。一旦出现「无证据」节点混入分母（例如把能力末级也算全树末级），反算结果就会与正算分叉。三条一律正算，并要求三者之和 === |mSet|（见断言 A-04）。`);
}

function renderT5(p) {
  const s = stubbornOf(ATOM.losses, p.stubThr, p.nStub);
  const rateHits = ATOM.losses.filter((l) => l !== null && 100 - l >= p.stubThr).length;

  const rows = ATOM.losses.map((loss, i) => {
    if (loss === null) return [`<td>${TASKS[i].name}</td>`, `<td class="mid mute">—</td>`, `<td class="mid mute">—</td>`, `<td class="mute">未考查，不计数</td>`];
    return [`<td>${TASKS[i].name}</td>`, `<td class="num">${fmt(100 - loss)}%</td>`, `<td class="num">${fmt(loss)}%</td>`,
      `<td class="mute">${loss >= p.stubThr ? '<span class="hit">✓ 计入</span>' : '—'}</td>`];
  });

  body('t5').innerHTML =
    table(['任务', '得分率 rate', '失分率 loss', `loss ≥ ${p.stubThr}%？`], rows,
      [`<td>命中次数</td>`, `<td></td>`, `<td></td>`, `<td class="num"><b>${s.n}</b> 次</td>`]) +
    verdict(s.hit ? 'bad-bg' : 'ok-bg', [
      [`命中 ${s.n} 次 ≥ ${p.nStub} 次`, s.hit ? '顽固' : '不构成顽固', s.hit ? 'bad' : 'ok'],
      ['强度', s.strength, ''],
    ]) +
    `<div class="compare">
      <div class="cmp good"><h5>正确：用 loss 计数 → ${s.n} 次</h5>
        <p>失分率 ≥${p.stubThr}% 的场次：${s.hits.map((h) => fmt(h.loss) + '%').join('、') || '无'}</p></div>
      <div class="cmp bad"><h5>错误：用 rate ≥${p.stubThr}% 计数 → ${rateHits} 次</h5>
        <p>方向反了：得分率高说明<b>学得好</b>，却会被判成「顽固」。这是本方案里最容易犯、最难在界面上看出来的错误。</p></div>
    </div>` +
    trap(`<b>三个边界：</b>① 计数单位是「不同任务」，同一任务多次批改改分只取最终生效成绩、只算一次；② 未考查的场次不计数（既不加分子也不加分母）；③ 加权 mastery 是<b>一个数</b>，无法反推次数，所以顽固判定不能复用它——只能回到逐场 loss。当前 mastery = ${fmt(masteryOf(ATOM.losses, TASKS.map((t) => t.date), PERIOD_END, p.H).mastery)}%，单看这个数根本看不出「3 场失分超 40%」。`);
}

function renderT6(p) {
  const ht = heatTrend(ATOM.losses, p.stubThr, p.nStub);
  const cls = (l) => (l === null ? 'h0' : l < 20 ? 'h-l1' : l < 40 ? 'h-l2' : l < 60 ? 'h-l3' : l < 75 ? 'h-l4' : 'h-l5');

  const cells = ATOM.losses.map((l, i) => `<div>
      <div class="mute" style="font-size:10.5px;margin-bottom:3px">${TASKS[i].date.slice(5)}</div>
      <div class="heat"><span class="${cls(l)}">${l === null ? '未考' : fmt(l, 0)}</span></div>
    </div>`).join('');

  body('t6').innerHTML =
    `<div style="display:flex;gap:10px;flex-wrap:wrap">${cells}</div>` +
    table(['判定项', '取数', '结果', '口径'],
      [[`<td>累计失分率</td>`, `<td class="mute">${ht.valid.map((x) => fmt(x, 0)).join(' + ')} ÷ ${ht.valid.length}</td>`, `<td class="num">${fmt(ht.cumulative)}%</td>`, `<td><span class="chip q-mean">算术平均</span></td>`],
       [`<td>累计得分率（对照）</td>`, `<td class="mute">100 − 累计失分率</td>`, `<td class="num">${fmt(100 - ht.cumulative)}%</td>`, `<td class="mute">与 mastery ${fmt(masteryOf(ATOM.losses, TASKS.map((t) => t.date), PERIOD_END, p.H).mastery)}% 不相等，正常</td>`],
       [`<td>前半 / 后半均值</td>`, `<td class="mute">前 ⌊${ht.valid.length}/2⌋ = 2 场 / 其余 3 场</td>`, `<td class="num">${fmt(ht.first)} / ${fmt(ht.second)}</td>`, `<td><span class="chip q-mean">算术平均</span></td>`],
       [`<td>两半均值差</td>`, `<td class="mute">后半 − 前半</td>`, `<td class="num">${ht.diff > 0 ? '+' : ''}${fmt(ht.diff)}</td>`, `<td class="mute">|差| ≥ 5 才算趋势</td>`],
       [`<td>行尾判定章</td>`, `<td class="mute">顽固 ${ht.stub.n} 次 ≥ ${p.nStub} → 优先</td>`, `<td class="num"><b>${ht.state}</b></td>`, `<td class="mute">趋势本可判 ${ht.diff >= 5 ? '恶化' : ht.diff <= -5 ? '回升' : '稳定'}，但顽固优先</td>`]]) +
    trap(`<b>两条不可互引：</b>① 累计列是<b>失分率</b>的算术平均，mastery 是<b>得分率</b>的时间加权值，两者只有恰好 1 场考查时才互补为 100；② 五档是<b>固定锚点</b>（40% 分界是得分率 60% 未掌握线的镜像），不随掌握档位的 3 档 / 4 档切换——改了档位，热力配色必须一动不动。`);
}

function renderT7() {
  const rows = CAUSES.map((c) => {
    const ch = r1(c.last - c.first);
    const sig = Math.abs(ch) >= 3;
    return { ...c, ch, sig };
  }).sort((a, b) => Math.abs(b.ch) - Math.abs(a.ch));

  const tbl = table(['错因', '首次占比', '末次占比', '变化幅度', '判定'],
    rows.map((r) => [`<td>${r.name}</td>`, `<td class="num">${fmt(r.first)}%</td>`, `<td class="num">${fmt(r.last)}%</td>`,
      `<td class="num ${r.ch > 0 ? 'hit' : ''}">${r.ch > 0 ? '+' : ''}${fmt(r.ch)}</td>`,
      `<td>${r.sig ? (r.ch > 0 ? '<span class="badge red">显著上升</span>' : '<span class="badge green">显著下降</span>') : '<span class="badge blue">基本稳定</span>'}</td>`]));

  const sig = rows.filter((r) => r.sig);
  const stableCount = rows.length - sig.length;

  body('t7').innerHTML = tbl +
    verdict('', [
      ['显著迁移', sig.length + ' 条', ''],
      ['归入「基本稳定」', stableCount + ' 条', ''],
    ]) +
    trap(`<b>边界：</b>① 只取<b>首末两场</b>，中间场次不参与，所以「趋势」其实是两点比较——场次少于 2 时整块不出结论；② 幅度保留 1 位小数后再比较 3 个百分点，避免 2.96 被四舍五入成 3.0 后误判为显著；③ 下降项也要列出来（绿），否则教师会以为错因结构只恶化不好转。`);
}

/* ==================== 6 参数沙盘 ==================== */

let changed = new Set();

function renderControls() {
  $('sandboxControls').innerHTML = PARAMS.map((p) => `
    <div class="ctrl">
      <div class="ctrl-top">
        <label for="p_${p.id}">${p.name}</label>
        <span class="ctrl-val" id="v_${p.id}">${P[p.id]}${p.unit}</span>
      </div>
      <div class="ctrl-hint">${p.hint}</div>
      <input type="range" id="p_${p.id}" min="${p.min}" max="${p.max}" step="${p.step}" value="${P[p.id]}" />
    </div>`).join('');

  PARAMS.forEach((p) => {
    $(`p_${p.id}`).addEventListener('input', (e) => {
      P[p.id] = Number(e.target.value);
      $(`v_${p.id}`).textContent = P[p.id] + p.unit;
      $(`v_${p.id}`).classList.toggle('changed', P[p.id] !== p.def);
      if (P[p.id] !== p.def) changed.add(p.id); else changed.delete(p.id);
      renderAll();
    });
  });
}

function renderSandbox() {
  const p = P;
  const m = masteryOf(ATOM.losses, TASKS.map((t) => t.date), PERIOD_END, p.H);
  const tier = tierOf(m.mastery, p);
  const stub = stubbornOf(ATOM.losses, p.stubThr, p.nStub);
  const pass = MSET.nodes.filter((n) => n >= p.pass).length;
  const total = MSET.knowledgeCount + MSET.abilityCount;
  const lowN = MSET.nodes.filter((n) => n < p.low).length;

  const defH = PARAMS.find((x) => x.id === 'H').def;
  const defM = masteryOf(ATOM.losses, TASKS.map((t) => t.date), PERIOD_END, defH);
  const defStub = stubbornOf(ATOM.losses, 40, 3);
  const defPass = MSET.nodes.filter((n) => n >= 80).length;
  const defLow = MSET.nodes.filter((n) => n < 60).length;

  const row = (label, sub, now, def, unit) => `
    <div class="sb-row">
      <div class="lbl">${label}${sub ? `<em>${sub}</em>` : ''}</div>
      <div class="now">${now}${unit || ''}</div>
      <div class="dlt">${now === def ? '不变' : '原 ' + def}</div>
    </div>`;

  $('sbResults').innerHTML =
    row('考核项 mastery', `Σw·rate ÷ Σw，H=${p.H}`, fmt(m.mastery), fmt(defM.mastery), '%') +
    row('考核项档位', `≥${p.pass} 掌握 / ≥${p.low} 一般`, tier.name, tierOf(defM.mastery, Object.assign({}, p, { pass: 80, low: 60 })).name, '') +
    row('达标率', `${pass} ÷ |mSet| ${total}`, fmt((pass / total) * 100), fmt((defPass / total) * 100), '%') +
    row('未掌握节点数', `mastery < ${p.low}`, lowN, defLow, ' 个') +
    row('顽固命中', `${stub.n} 次 ≥ ${p.nStub}`, stub.hit ? '是' : '否', defStub.hit ? '是' : '否', '') +
    row('顽固强度', '按命中次数分档', stub.strength, defStub.strength, '');

  const impactSet = new Set();
  changed.forEach((id) => {
    const p0 = PARAMS.find((x) => x.id === id);
    if (p0) p0.impacts.forEach((x) => impactSet.add(x));
  });
  const all = [...new Set(PARAMS.flatMap((x) => x.impacts))];
  $('sbImpacts').innerHTML = `<div class="impact-chips">${all
    .map((x) => `<span class="impact ${impactSet.has(x) ? 'on' : ''}">${x}</span>`).join('')}</div>`;

  $('sbChanged').textContent = changed.size
    ? '已改：' + [...changed].map((id) => PARAMS.find((x) => x.id === id).name).join('、')
    : '';
}

/* ==================== 7 坑清单 ==================== */

const PITFALLS = [
  { no: 'P-01', what: 'σ 除以 n − 1', why: '教学口径把 6 场当作全部证据，不是抽样估计。除错分母使稳定度系统性偏高，全班 48 人都偏。', do: 'sdPop(v) 除以 n', assert: 'sd(n−1)/sd(n) === √(n/(n−1))' },
  { no: 'P-02', what: '稳定度与 σ 各自四舍五入后相减', why: '出现 100 − 4.4 = 95.6，而真值 95.63，页面上两个数字对不上。', do: '同源相减，只在最终展示时取整', assert: '|stable − (100 − σ)| < 1e−9' },
  { no: 'P-03', what: '4 档把达标线写成 90%', why: '达标线与档位数无关，3 档 4 档都是 80；90 是「优秀」下限。写错则达标率整体崩塌，且不报错。', do: '达标线恒取「掌握」档下限 80', assert: 'passLine(3档) === passLine(4档) === 80' },
  { no: 'P-04', what: '达标率分母用全树末级节点', why: '未考查节点混进分母，达标率从 61.1% 掉到 9.9%，看起来依然「合理」。', do: '分母恒取 mSet', assert: 'pass + weak + low === |mSet|' },
  { no: 'P-05', what: '未考查场次按 0 分计入', why: 'mastery 被系统性压低，与「确实没掌握」混为一谈（未知 ≠ 未掌握）。', do: 'null 场次不进分子也不进分母', assert: 'Σw 只累计有效场次' },
  { no: 'P-06', what: '顽固判定用得分率计数', why: '方向反了：得分率高的场次被判成顽固。本卡实例从 3 次变 4 次，强度从「疑似」跳到「结构性」。', do: '一律用 loss = 100 − rate 计数', assert: 'stub(loss) !== stub(rate)' },
  { no: 'P-07', what: '同一任务多次批改重复计数', why: '一次考试的多次改分会把「3 次不同任务」凑成 4 次，凭空造出顽固项。', do: '按任务去重，取最终生效成绩', assert: 'count(distinct taskId)' },
  { no: 'P-08', what: '跨口径互引（加权值进均价、累计列与 mastery 互补）', why: '页面之间互相打脸，且没人能判断哪个数对。', do: '三类口径各自只在链内流转', assert: '同一数字只出现在一个口径的展示位' },
];

function renderPitfalls() {
  $('pitTable').innerHTML = `<thead><tr>
      <th>#</th><th>写错的做法</th><th>后果</th><th>必须这样做</th><th>必须断这个</th>
    </tr></thead><tbody>${PITFALLS.map((p) => `<tr>
      <td class="no">${p.no}</td>
      <td class="what">${p.what}</td>
      <td class="mute">${p.why}</td>
      <td class="do">${p.do}</td>
      <td class="assert">${p.assert}</td>
    </tr>`).join('')}</tbody>`;
}

/* ==================== 8 断言清单 ==================== */

function buildAsserts() {
  const rates = TASKS.map((t) => t.rate);
  const sd = sdPop(rates);
  const sdS = sdSample(rates);
  const m = masteryOf(ATOM.losses, TASKS.map((t) => t.date), PERIOD_END, P.H);
  const stubLoss = stubbornOf(ATOM.losses, P.stubThr, P.nStub).n;
  const stubRate = ATOM.losses.filter((l) => l !== null && 100 - l >= P.stubThr).length;
  const total = MSET.knowledgeCount + MSET.abilityCount;
  const pass = MSET.nodes.filter((n) => n >= P.pass).length;
  const low = MSET.nodes.filter((n) => n < P.low).length;
  const oneField = wMean([71.3], [wOf(21, P.H)]);
  const ws = TASKS.map((t) => wOf(dayDiff(t.date, PERIOD_END), P.H));
  const pw = wMean(rates, ws);
  const pw2 = wMean(rates, ws.map((w) => w * 2));

  return [
    { id: 'A-01', t: 'σ 除以 n 而非 n−1',
      expr: 'sdPop(6 场) ÷ sdSample(6 场) === √(5/6)',
      act: fmt(sd / sdS, 4), exp: fmt(Math.sqrt(5 / 6), 4),
      ok: Math.abs(sd / sdS - Math.sqrt(5 / 6)) < 1e-9 },
    { id: 'A-02', t: '稳定度与 σ 互补且同源',
      expr: '(100 − σ) + σ === 100',
      act: fmt((100 - sd) + sd, 6), exp: '100.000000',
      ok: Math.abs((100 - sd) + sd - 100) < 1e-9 },
    { id: 'A-03', t: '达标线与档位数无关',
      expr: 'BANDS[3].mastered === BANDS[4].mastered === 80',
      act: `${BANDS[3].mastered} / ${BANDS[4].mastered}`, exp: '80 / 80',
      ok: BANDS[3].mastered === BANDS[4].mastered && BANDS[3].mastered === 80 },
    { id: 'A-04', t: '三档正算之和 === |mSet|',
      expr: `${pass} + ${total - pass - low} + ${low} === ${total}`,
      act: String(pass + (total - pass - low) + low), exp: String(total),
      ok: pass + (total - pass - low) + low === total },
    { id: 'A-05', t: '仅 1 场时加权退化为原值',
      expr: 'wMean([71.3], [w]) === 71.3',
      act: fmt(oneField, 4), exp: '71.3000',
      ok: Math.abs(oneField - 71.3) < 1e-9 },
    { id: 'A-06', t: 'null 场次不进分母',
      expr: '有效场次 === 5（6 场中 1 场未考查）',
      act: String(m.valid), exp: '5',
      ok: m.valid === 5 },
    { id: 'A-07', t: '顽固用 loss 而非 rate',
      expr: 'stub(loss) ≠ stub(100 − loss)',
      act: `${stubLoss} ≠ ${stubRate}`, exp: '两者不相等（默认 3 vs 4）',
      ok: stubLoss !== stubRate },
    { id: 'A-08', t: '权重等比缩放不改变结果',
      expr: 'wMean(v, 2w) === wMean(v, w)',
      act: String(Math.abs(pw2 - pw) < 1e-9), exp: 'true',
      ok: Math.abs(pw2 - pw) < 1e-9 },
  ];
}

function renderAsserts() {
  const list = buildAsserts();
  $('assertTable').innerHTML = `<thead><tr>
      <th>#</th><th>不变量</th><th>表达式</th><th>实测</th><th>期望</th><th>状态</th>
    </tr></thead><tbody>${list.map((a) => `<tr data-id="${a.id}">
      <td class="no">${a.id}</td>
      <td>${a.t}</td>
      <td class="expr">${a.expr}</td>
      <td class="act">${a.act}</td>
      <td class="act mute">${a.exp}</td>
      <td class="st st-idle">未运行</td>
    </tr>`).join('')}</tbody>`;
}

function runAsserts() {
  const list = buildAsserts();
  let ok = 0;
  list.forEach((a) => {
    if (a.ok) ok += 1;
    const cell = document.querySelector(`#assertTable tr[data-id="${a.id}"] .st`);
    if (cell) {
      cell.textContent = a.ok ? '通过' : '不符';
      cell.className = 'st ' + (a.ok ? 'st-pass' : 'st-fail');
    }
  });
  $('assertSummary').innerHTML = `共 <b>${list.length}</b> 条，通过 <b>${ok}</b> 条${ok === list.length ? '，口径自洽' : `，<b>${list.length - ok}</b> 条需复核`}`;
}

/* ==================== 9 总装 ==================== */

function renderAll() {
  renderT1();
  renderT2(P);
  renderT3();
  renderT4(P);
  renderT5(P);
  renderT6(P);
  renderT7();
  renderSandbox();
}

function initToc() {
  const links = [...document.querySelectorAll('.toc a')];
  const secs = links.map((a) => document.querySelector(a.getAttribute('href')));
  const io = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        const i = secs.indexOf(e.target);
        if (i < 0) return;
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.remove('on'));
          links[i].classList.add('on');
        }
      });
    },
    { rootMargin: '-60px 0px -70% 0px' }
  );
  secs.forEach((s) => s && io.observe(s));
}

document.addEventListener('DOMContentLoaded', () => {
  renderControls();
  renderPitfalls();
  renderAsserts();
  renderAll();
  initToc();

  $('sbReset').addEventListener('click', () => {
    PARAMS.forEach((p) => {
      P[p.id] = p.def;
      $(`p_${p.id}`).value = p.def;
      $(`v_${p.id}`).textContent = p.def + p.unit;
      $(`v_${p.id}`).classList.remove('changed');
    });
    changed.clear();
    renderAll();
    renderAsserts();
    $('assertSummary').textContent = '未运行';
  });

  $('assertRun').addEventListener('click', runAsserts);
});
