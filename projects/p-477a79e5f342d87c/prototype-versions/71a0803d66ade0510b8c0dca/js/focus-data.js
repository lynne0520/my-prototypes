/* ==========================================================================
   学科侧重 · 数据层 + 报表渲染层
   --------------------------------------------------------------------------
   同一份报表被两处引用，避免口径漂移：
     1) index.html → 左侧【学科侧重】视图（壳页负责筛选，本文件只渲染报表主体）
     2) 高三34班_学科侧重报表_最近批改.html → 独立可分享报表
   核心口径：
     · 同一学科可有多份作业，作业之间无主次；
     · 学科得分率 = 该科各作业得分率的算术平均；
     · 学生学科得分率 = 该生各作业得分率的算术平均；
     · 离均差 = 个人学科得分率 − 班级学科得分率。
   对外接口：window.FocusReport
   ========================================================================== */
(function (global) {
  'use strict';

  /* ==================== 1. 常量与数据 ==================== */

  var TODAY = '2026-11-05';
  var TODAY_LABEL = '2026-11-05（今天）';
  var SUBJECTS = ['语文', '数学', '英语', '物理', '化学', '生物'];

  /* 年级均得分率（全校高三同口径） */
  var GRADE_RATE = {
    '语文': 78.5, '数学': 75.8, '英语': 88.0,
    '物理': 74.4, '化学': 71.2, '生物': 78.0
  };

  /* 当日作业清单：同一学科可多份，作业之间无主次 */
  var HOMEWORKS = [
    { id: 'yw1', subject: '语文', name: '知识清单1（文言实词与病句）', full: 40, due: 37, date: TODAY, graded: '11-05 12:20' },
    { id: 'yw2', subject: '语文', name: '古诗文默写（第3单元）', full: 20, due: 37, date: TODAY, graded: '11-05 12:35' },
    { id: 'sx1', subject: '数学', name: '高三数学周末测试（五）2026.11.02', full: 60, due: 37, date: TODAY, graded: '11-05 08:15' },
    { id: 'sx2', subject: '数学', name: '课堂限时练（导数应用）', full: 30, due: 37, date: TODAY, graded: '11-05 08:20' },
    { id: 'yy1', subject: '英语', name: '读后续写（二稿）', full: 25, due: 37, date: TODAY, graded: '11-05 21:40' },
    { id: 'yy2', subject: '英语', name: '听力42', full: 30, due: 37, date: TODAY, graded: '11-05 09:05' },
    { id: 'wl1', subject: '物理', name: '第九章 作业1 库仑定律 电场强度', full: 40, due: 37, date: TODAY, graded: '11-05 14:30' },
    { id: 'hx1', subject: '化学', name: '10月19日化学作业答题纸（电化学）', full: 50, due: 37, date: TODAY, graded: '11-05 16:05' },
    { id: 'sw1', subject: '生物', name: '限时练三（遗传规律）', full: 40, due: 37, date: TODAY, graded: '11-05 19:50' }
  ];

  /* 逐生学科基准得分率（%）：学号 / 姓名 / 语 数 英 物 化 生；null = 该科未交或未批改 */
  var ROWS = [
    ['43438', '冯昌宁', 82.3, 51.3, 85.0, 88.9, 65.4, 87.5],
    ['43423', '张甜甜', 88.2, 63.3, 90.0, 53.7, 65.4, 84.7],
    ['43429', '邓瑶', 82.3, 62.7, 90.0, 70.4, 53.9, 68.1],
    ['43420', '吴可欣', 64.7, 60.0, 100.0, 66.7, 69.2, 55.6],
    ['43432', '齐奥雪', 82.3, 69.3, 90.0, 55.6, 73.1, 97.2],
    ['43426', '张悦', 76.5, 77.3, 75.0, 83.3, 57.7, 68.1],
    ['43435', '任仲轩', 88.2, 58.0, 90.0, 63.0, 61.5, 83.3],
    ['43431', '宋文腾', 70.6, 58.7, 95.0, 72.2, 65.4, 87.5],
    ['43414', '刘畅', 58.8, 71.3, 95.0, 83.3, 65.4, 93.1],
    ['43421', '尹茂硕', 58.8, 71.3, 100.0, 94.4, 69.2, 83.3],
    ['43415', '陈一诺', 58.8, 81.3, null, 70.4, null, 83.3],
    ['43408', '秦国奥', 76.5, 91.3, 90.0, 68.5, 61.5, 84.7],
    ['43433', '程涵', 76.5, 70.7, 95.0, 77.8, 61.5, 66.7],
    ['43419', '刘舒灿', 64.7, 76.0, 90.0, 88.9, 73.1, 88.9],
    ['43437', '张静茹', 64.7, 66.0, 100.0, 66.7, 73.1, 77.8],
    ['43439', '程绍贤', 64.7, 79.3, 90.0, 77.8, 69.2, 68.1],
    ['43425', '荣梦涵', 64.7, 70.0, null, 66.7, 69.2, 83.3],
    ['43436', '谭浩', 88.2, 68.7, 90.0, 64.8, 65.4, 76.4],
    ['43407', '牛鑫蕾', 82.3, 65.3, 100.0, 70.4, 65.4, 75.0],
    ['43427', '王淼', 88.2, 77.3, 85.0, 75.9, 69.2, 65.3],
    ['43403', '刘广祎', null, 77.3, 100.0, 94.4, 65.4, 87.5],
    ['43413', '王美琦', 70.6, 77.3, 100.0, 72.2, 69.2, 66.7],
    ['43416', '路庆剑', 76.5, 79.3, 100.0, 66.7, 76.9, 76.4],
    ['43405', '王全振', 94.1, 70.0, 100.0, 94.4, 69.2, 97.2],
    ['43440', '王逸宸', 70.6, 71.3, 100.0, 72.2, 69.2, 80.6],
    ['43430', '赵航', 88.2, 90.7, null, 92.6, 69.2, 83.3],
    ['43402', '陈其鑫', 88.2, 80.0, 95.0, 83.3, 69.2, 91.7],
    ['43412', '冯闯闯', 70.6, 70.0, 90.0, 83.3, 73.1, 81.9],
    ['43411', '仲明月', 88.2, 77.3, 90.0, 88.9, 73.1, 75.0],
    ['43417', '侯焕烨', 76.5, 92.0, 100.0, 83.3, 73.1, 87.5],
    ['43422', '周宇豪', null, 75.3, 85.0, 83.3, 73.1, 81.9],
    ['43418', '张艳敏', 76.5, 82.7, 100.0, 81.5, 73.1, 87.5],
    ['43410', '王子暄', 76.5, 76.7, 90.0, 83.3, 73.1, 94.4],
    ['43404', '荣晗', 88.2, 76.0, 90.0, 88.9, 73.1, 87.5],
    ['43409', '董静欣', 82.3, 74.0, 85.0, 77.8, 73.1, 84.7],
    ['43401', '陈鹏翔', 82.3, 88.7, 95.0, 88.9, 73.1, 81.9],
    ['43406', '马文祺', 82.3, 86.7, 90.0, 83.3, 73.1, 84.7]
  ];

  var STUDENTS = ROWS.map(function (row) {
    var stu = { id: row[0], name: row[1], rates: {} };
    SUBJECTS.forEach(function (sub, i) {
      var v = row[2 + i];
      stu.rates[sub] = (typeof v === 'number' && !isNaN(v)) ? v : null;
    });
    return stu;
  });

  /* 学科 → 当日作业（保持 HOMEWORKS 顺序） */
  var HW_BY_SUBJECT = {};
  SUBJECTS.forEach(function (sub) {
    HW_BY_SUBJECT[sub] = HOMEWORKS.filter(function (h) { return h.subject === sub; });
  });

  /* 等级分档：优 ≥85 / 良 70~84 / 中 60~69 / 差 <60 */
  var CUT = { excellent: 85, good: 70, pass: 60 };

  /* 同一学科多份作业的拆分幅度：以学科基准率上下对称，保证算术平均等于基准 */
  var SPLIT = 3.2;

  /* 模块内 UI 状态（两处引用各自独立，互不影响） */
  var ui = { weakOnly: false };
  var lastRender = null;

  /* ==================== 2. 工具函数 ==================== */

  function isNum(v) {
    return typeof v === 'number' && !isNaN(v);
  }

  function mean(arr) {
    if (!arr.length) return null;
    return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
  }

  function round1(v) {
    return Math.round(v * 10) / 10;
  }

  function f1(v) {
    if (!isNum(v)) return '—';
    return round1(v).toFixed(1);
  }

  function signed(v) {
    if (!isNum(v)) return '—';
    if (Math.abs(v) < 0.05) return '0.0';
    return (v > 0 ? '+' : '') + f1(v);
  }

  function pctOf(n, total) {
    if (!total) return '0%';
    return Math.round((n / total) * 100) + '%';
  }

  function deltaCls(v) {
    if (!isNum(v) || Math.abs(v) < 0.5) return 'delta--flat';
    return v > 0 ? 'delta--up' : 'delta--down';
  }

  /* 离均差热力分档：与图例一一对应 */
  function heatClass(d) {
    if (!isNum(d)) return 'heat-na';
    if (d <= -15) return 'heat-n3';
    if (d <= -6) return 'heat-n2';
    if (d < -2) return 'heat-n1';
    if (d <= 2) return 'heat-flat';
    if (d <= 6) return 'heat-p1';
    if (d <= 15) return 'heat-p2';
    return 'heat-p3';
  }

  /* ==================== 3. 作业级 / 学科级得分率 ==================== */

  /*
    单份作业的得分率：同一学科有多份作业时，各份作业难度不同，围绕该生学科基准率
    对称分摊（第一份整体偏高、第二份偏低，个人扰动由学号决定），因此
    「各作业得分率的算术平均」恒等于基准率，又不会出现两份作业得分率完全相同。
  */
  function homeworkRate(stu, hw) {
    var base = stu.rates[hw.subject];
    if (!isNum(base)) return null;
    var list = HW_BY_SUBJECT[hw.subject] || [];
    if (list.length <= 1 || list.length > 2) return round1(base);

    var d1 = parseInt(stu.id.slice(-1), 10);
    var d2 = parseInt(stu.id.slice(-2, -1), 10);
    var bias = SPLIT + (((d1 + d2) % 5) - 2) * 0.6;   // SPLIT ± 1.2，随学生浮动
    var first = Math.min(base + bias, 100);
    var second = 2 * base - first;
    if (second < 0) {
      second = 0;
      first = Math.min(2 * base, 100);
    }

    return round1(list.indexOf(hw) === 0 ? first : second);
  }

  function selectedHomeworks(ids) {
    if (!ids) return HOMEWORKS.slice();
    return HOMEWORKS.filter(function (h) { return ids.indexOf(h.id) >= 0; });
  }

  /* ==================== 4. 指标计算 ==================== */

  function computeSubject(subject, ids) {
    var list = selectedHomeworks(ids).filter(function (h) { return h.subject === subject; });

    /* 作业级：各作业的班级平均得分率（作业之间等权） */
    var hwMap = {};
    var hwCounts = {};
    var hwMeans = [];
    var submitted = 0;
    var due = 0;

    list.forEach(function (hw) {
      var vals = [];
      STUDENTS.forEach(function (stu) {
        var r = homeworkRate(stu, hw);
        if (isNum(r)) vals.push(r);
      });
      var m = mean(vals);
      hwMap[hw.id] = m;
      hwCounts[hw.id] = vals.length;
      if (isNum(m)) hwMeans.push(m);
      submitted += vals.length;
      due += hw.due;
    });

    /* 学科得分率 = 该科各作业得分率的算术平均 */
    var avg = hwMeans.length ? mean(hwMeans) : null;

    /* 学生级：该生各作业得分率的算术平均 */
    var stuRateMap = {};
    var stuRates = [];
    STUDENTS.forEach(function (stu) {
      var vals = [];
      list.forEach(function (hw) {
        var r = homeworkRate(stu, hw);
        if (isNum(r)) vals.push(r);
      });
      var v = vals.length ? mean(vals) : null;
      stuRateMap[stu.id] = v;
      if (isNum(v)) stuRates.push(v);
    });

    var sorted = stuRates.slice().sort(function (a, b) { return a - b; });
    var n = stuRates.length;
    var median = null;
    if (n) median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;

    var sd = 0;
    if (n > 1 && isNum(avg)) {
      var ss = stuRates.reduce(function (a, v) { return a + (v - avg) * (v - avg); }, 0);
      sd = Math.sqrt(ss / n);
    }

    var dist = { ex: 0, good: 0, pass: 0, weak: 0 };
    stuRates.forEach(function (v) {
      if (v >= CUT.excellent) dist.ex++;
      else if (v >= CUT.good) dist.good++;
      else if (v >= CUT.pass) dist.pass++;
      else dist.weak++;
    });

    var gradeAvg = GRADE_RATE[subject];
    var diff = isNum(avg) ? avg - gradeAvg : null;

    /* 补弱收益指数：提分空间 40% + 年级差距 120% + 差生占比 15% */
    var benefit = isNum(avg)
      ? (100 - avg) * 0.4 + (gradeAvg - avg) * 1.2 + (n ? (dist.weak / n) * 100 * 0.15 : 0)
      : 0;

    return {
      name: subject,
      n: n,
      hwCount: list.length,
      hwMap: hwMap,
      hwCounts: hwCounts,
      stuRateMap: stuRateMap,
      submitted: submitted,
      due: due,
      avg: avg,
      gradeAvg: gradeAvg,
      diff: diff,
      median: median,
      sd: sd,
      max: n ? sorted[n - 1] : null,
      min: n ? sorted[0] : null,
      dist: dist,
      benefit: benefit
    };
  }

  function computeAll(ids) {
    return SUBJECTS.map(function (sub) {
      return computeSubject(sub, ids);
    }).filter(function (s) {
      return s.hwCount > 0;
    });
  }

  /* 逐生诊断：best = 离均差最小的学科（相对班均）；worst = 得分率最低的学科（绝对短板） */
  function weakestOf(shown) {
    var rows = [];
    var weakCounts = {};

    STUDENTS.forEach(function (stu) {
      var cells = [];
      var best = null;
      var worst = null;
      shown.forEach(function (st) {
        var v = st.stuRateMap[stu.id];
        if (!isNum(v)) {
          cells.push({ sub: st.name, v: null, d: null });
          return;
        }
        var d = v - st.avg;
        cells.push({ sub: st.name, v: v, d: d });
        if (!best || d < best.d - 0.05 || (Math.abs(d - best.d) <= 0.05 && v < best.v)) {
          best = { sub: st.name, v: v, d: d };
        }
        if (!worst || v < worst.v) worst = { sub: st.name, v: v, d: d };
      });
      if (!best) return;
      rows.push({ stu: stu, cells: cells, best: best, worst: worst });
      if (worst.v < CUT.pass) weakCounts[worst.sub] = (weakCounts[worst.sub] || 0) + 1;
    });

    var top = Object.keys(weakCounts).map(function (k) {
      return { name: k, count: weakCounts[k] };
    }).sort(function (a, b) { return b.count - a.count; });

    var weakTotal = 0;
    Object.keys(weakCounts).forEach(function (k) { weakTotal += weakCounts[k]; });

    return { rows: rows, weakCounts: weakCounts, weakTop: top, weakTotal: weakTotal };
  }

  /* ==================== 5. 渲染：口径条 / KPI ==================== */

  function hintHTML(opts, all) {
    var hws = selectedHomeworks(opts.homeworks);
    var isToday = (opts.dateLabel || TODAY_LABEL).indexOf('~') < 0 &&
      (opts.dateLabel || TODAY_LABEL).indexOf(TODAY) >= 0;

    var submit = 0;
    var due = 0;
    all.forEach(function (s) {
      submit += s.submitted;
      due += s.due;
    });

    return '<div class="focus-hint">' +
      '<b>诊断口径</b>' +
      '<span>日期 <b>' + (opts.dateLabel || TODAY_LABEL) + '</b>　·　覆盖 <b>' + all.length +
      '</b> 个学科 / <b>' + hws.length + '</b> 份作业（' + (isToday ? '当日' : '区间内') +
      '全部已批改作业，无主次）　·　学科得分率 = 该科各作业得分率的<b>算术平均</b>　·　作业提交率 ' +
      pctOf(submit, due) + '</span>' +
      '<span class="focus-hint__tag">短期分诊 · 不代表长期学科特质</span>' +
      '</div>';
  }

  function kpiHTML(shown, weakInfo) {
    var rank = shown.slice().sort(function (a, b) { return b.benefit - a.benefit; });
    var top = rank[0];
    var below = shown.filter(function (s) { return isNum(s.diff) && s.diff < 0; });

    var card = function (label, value, sub, brand) {
      return '<div class="kpi-card' + (brand ? ' kpi-card--brand' : '') + '">' +
        '<div class="kpi-card__label">' + label + '</div>' +
        '<div class="kpi-card__value">' + value + '</div>' +
        '<div class="kpi-card__sub">' + sub + '</div>' +
        '</div>';
    };

    return '<div class="kpi-row">' +
      card('建议优先补（补弱收益最高）', top.name,
        '班均 ' + f1(top.avg) + '% · 收益指数 ' + f1(top.benefit), true) +
      card('需重点补弱学生', weakInfo.weakTotal + ' <small>/ ' + STUDENTS.length + ' 人</small>',
        '最弱科得分率低于 60%') +
      card('低于年级均学科', below.length + ' <small>/ ' + shown.length + ' 科</small>',
        below.length ? below.map(function (s) { return s.name; }).join('、') : '全部高于年级均') +
      card('班级短板学科', top.name,
        '可提空间 ' + f1(100 - top.avg) + 'pt · 差生 ' + top.dist.weak + ' 人') +
      '</div>';
  }

  /* ==================== 6. 渲染：一、班级各学科 ==================== */

  function sectionOne(shown, weakInfo) {
    var byRate = shown.slice().sort(function (a, b) { return a.avg - b.avg; });
    var rank = shown.slice().sort(function (a, b) { return b.benefit - a.benefit; });
    var maxB = 1;
    rank.forEach(function (s) { if (s.benefit > maxB) maxB = s.benefit; });

    var bars = byRate.map(function (s) {
      var w = Math.max(2, Math.min(100, s.avg));
      var m = Math.max(0, Math.min(100, s.gradeAvg));
      return '<div class="bar-row">' +
        '<span class="bar-row__label">' + s.name + '</span>' +
        '<span class="bar-row__track">' +
          '<span class="bar-row__fill" style="width:' + w.toFixed(1) + '%"></span>' +
          '<span class="bar-row__mark" style="left:' + m.toFixed(1) + '%" ' +
            'title="年级均 ' + f1(s.gradeAvg) + '%"></span>' +
        '</span>' +
        '<span class="bar-row__value">' + f1(s.avg) + '%</span>' +
        '<span class="bar-row__delta ' + deltaCls(s.diff) + '">' + signed(s.diff) + '</span>' +
        '</div>';
    }).join('');

    var trs = rank.map(function (s, i) {
      var bw = Math.max(0, Math.min(100, (Math.max(s.benefit, 0) / maxB) * 100));
      return '<tr' + (i === 0 ? ' class="is-top"' : '') + '>' +
        '<td class="cell-strong">' + s.name +
          ' <span class="cell-hint">' + s.hwCount + ' 份</span></td>' +
        '<td class="cell-num">' + s.submitted + '/' + s.due + '</td>' +
        '<td class="cell-num cell-strong">' + f1(s.avg) + '%</td>' +
        '<td class="cell-num cell-muted">' + f1(s.gradeAvg) + '%</td>' +
        '<td class="cell-num ' + deltaCls(s.diff) + '">' + signed(s.diff) + '</td>' +
        '<td class="cell-num">' + f1(s.median) + '</td>' +
        '<td class="cell-num">' + f1(s.sd) + '</td>' +
        '<td class="cell-num">' + f1(s.max) + '</td>' +
        '<td class="cell-num">' + f1(s.min) + '</td>' +
        '<td class="cell-dist cell-dist--ex"><b>' + s.dist.ex + '</b><span>' + pctOf(s.dist.ex, s.n) + '</span></td>' +
        '<td class="cell-dist"><b>' + s.dist.good + '</b><span>' + pctOf(s.dist.good, s.n) + '</span></td>' +
        '<td class="cell-dist"><b>' + s.dist.pass + '</b><span>' + pctOf(s.dist.pass, s.n) + '</span></td>' +
        '<td class="cell-dist cell-dist--weak"><b>' + s.dist.weak + '</b><span>' + pctOf(s.dist.weak, s.n) + '</span></td>' +
        '<td><span class="benefit">' +
          '<span class="benefit__track"><span class="benefit__fill" style="width:' + bw.toFixed(1) + '%"></span></span>' +
          '<span class="benefit__num">' + f1(s.benefit) + '</span>' +
        '</span></td>' +
        '</tr>';
    }).join('');

    /* 诊断结论 */
    var d1 = rank[0];
    var d2 = rank[1];
    var d3 = rank[2];
    var last = rank[rank.length - 1];
    var bullets = '';

    bullets += '<li><span class="diagnosis__rank">1</span><b>' + d1.name + '</b>　班均 ' + f1(d1.avg) + '%，' +
      (d1.diff >= 0 ? '高于' : '低于') + '年级均 ' + f1(Math.abs(d1.diff)) + 'pt，' +
      '低于 60% 共 ' + d1.dist.weak + ' 人（' + pctOf(d1.dist.weak, d1.n) + '），' +
      '可提空间 ' + f1(100 - d1.avg) + 'pt → 补弱收益 ' + f1(d1.benefit) + ' 居首，当日优先投入。</li>';

    if (d2) {
      bullets += '<li><span class="diagnosis__rank">2</span>次优 <b>' + d2.name + '</b>（' + f1(d2.avg) + '%，收益 ' +
        f1(d2.benefit) + '）' +
        (d3 ? '与 <b>' + d3.name + '</b>（' + f1(d3.avg) + '%，收益 ' + f1(d3.benefit) + '）' : '') +
        '，可与「' + d1.name + '」错峰安排，避免单科疲劳。</li>';
    }

    if (weakInfo.weakTop.length) {
      var w1 = weakInfo.weakTop[0];
      var w2 = weakInfo.weakTop[1];
      var same = w1.name === d1.name || (w2 && w2.name === d1.name);
      bullets += '<li>学生侧：<b>' + weakInfo.weakTotal + ' 人</b>最弱科不足 60%，短板集中 <b>' + w1.name +
        '（' + w1.count + ' 人）</b>' + (w2 ? ' 与 <b>' + w2.name + '（' + w2.count + ' 人）</b>' : '') +
        (same ? '，与班级班均短板（' + d1.name + '）重合，适合整班统一讲评。</li>'
          : '；班级班均短板为 <b>' + d1.name + '</b>，建议「整班讲' + d1.name + ' + 个别补' +
            w1.name + '」双轨推进。</li>');
    }

    if (last && rank.length > 1) {
      bullets += '<li>暂不优先 <b>' + last.name + '</b>　班均 ' + f1(last.avg) + '%，' +
        (last.diff >= 0 ? '高于' : '低于') + '年级均 ' + f1(Math.abs(last.diff)) + 'pt，' +
        '可提空间仅 ' + f1(100 - last.avg) + 'pt，当日投入产出比最低。</li>';
    }

    return '<section class="focus-section">' +
      '<div class="focus-section__head">' +
        '<span class="focus-section__idx">一</span>' +
        '<h2 class="focus-section__title">班级各学科得分率与分布</h2>' +
        '<span class="focus-section__note">条形按班均得分率升序；竖线为年级均；右侧为「班级 − 年级」差值</span>' +
      '</div>' +
      '<div class="focus-split">' +
        '<div>' +
          '<div class="bar-list">' + bars + '</div>' +
          '<div class="bar-legend">' +
            '<span><i></i>班级均得分率</span>' +
            '<span><i class="is-mark"></i>年级均</span>' +
            '<span>差值单位：百分点（pt）</span>' +
          '</div>' +
        '</div>' +
        '<aside class="diagnosis">' +
          '<h3 class="diagnosis__title">当日诊断结论</h3>' +
          '<ul class="diagnosis__list">' + bullets + '</ul>' +
        '</aside>' +
      '</div>' +
      '<div class="table-card">' +
        '<div class="table-scroll">' +
          '<table class="data-table data-table--compact data-table--stat">' +
            '<thead><tr>' +
              '<th>学科</th><th>提交</th><th>班均</th><th>年级均</th><th>差值</th>' +
              '<th>中位</th><th>标准差</th><th>最高</th><th>最低</th>' +
              '<th>优 ≥85</th><th>良 70–84</th><th>中 60–69</th><th>差 &lt;60</th>' +
              '<th>补弱收益</th>' +
            '</tr></thead>' +
            '<tbody>' + trs + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
      '<p class="focus-section__foot">学科得分率 = 该科各作业得分率的算术平均（作业无主次）；' +
      '提交按作业人次累计（如「化学 36/37」为单份，「语文 70/74」为 2 份合计）。' +
      '补弱收益指数 = 提分空间 40% + 年级差距 120% + 差生占比 15%，表格按收益降序，首行为建议优先学科。</p>' +
      '</section>';
  }

  /* ==================== 7. 渲染：二、学生离均差热力 ==================== */

  function heatLegend() {
    var items = [
      ['heat-n3', '≤ −15'], ['heat-n2', '−15~−6'], ['heat-n1', '−6~−2'],
      ['heat-flat', '±2'], ['heat-p1', '+2~+6'], ['heat-p2', '+6~+15'], ['heat-p3', '> +15']
    ];
    return '<div class="heat-legend"><span>离均差</span>' +
      items.map(function (it) {
        return '<em>·</em><i class="' + it[0] + '">' + it[1] + '</i>';
      }).join('') +
      '<em>·</em><span>红色 = 低于班级均，绿色 = 高于班级均</span></div>';
  }

  function sectionTwo(shown, weakInfo) {
    var list = weakInfo.rows.slice();
    if (ui.weakOnly) {
      list = list.filter(function (r) { return r.worst.v < CUT.pass; });
    }
    list.sort(function (a, b) {
      return a.worst.v - b.worst.v || a.best.d - b.best.d;
    });

    var head = '<tr><th>学号</th><th>姓名</th>' +
      shown.map(function (s) {
        return '<th>' + s.name + '<br><span class="th-sub">班均 ' + f1(s.avg) + '%</span></th>';
      }).join('') +
      '<th>离均差最弱</th><th>最低得分率</th><th>判定</th></tr>';

    var body = list.map(function (r) {
      var urgent = r.worst.v < CUT.pass;
      var cells = r.cells.map(function (c) {
        if (!isNum(c.v)) return '<td class="heat-cell heat-na">—</td>';
        return '<td class="heat-cell ' + heatClass(c.d) + '">' +
          '<b>' + signed(c.d) + '</b><span>' + f1(c.v) + '</span></td>';
      }).join('');

      var tag = urgent
        ? '<span class="tag tag--danger">重点补</span>'
        : (r.best.d < -2 ? '<span class="tag tag--brand">需关注</span>' : '<span class="tag tag--none">正常</span>');

      return '<tr' + (urgent ? ' class="is-urgent"' : '') + '>' +
        '<td class="cell-num">' + r.stu.id + '</td>' +
        '<td>' + r.stu.name + '</td>' +
        cells +
        '<td class="cell-strong">' + r.best.sub +
          ' <span class="cell-hint">' + signed(r.best.d) + '</span></td>' +
        '<td class="cell-num' + (urgent ? ' cell-dev-down' : '') + '">' +
          r.worst.sub + ' ' + f1(r.worst.v) + '%</td>' +
        '<td>' + tag + '</td>' +
        '</tr>';
    }).join('');

    var empty = list.length ? '' :
      '<tr><td colspan="' + (shown.length + 5) + '"><div class="empty-state">' +
      '当前筛选下没有符合条件的学生</div></td></tr>';

    return '<section class="focus-section">' +
      '<div class="focus-section__head">' +
        '<span class="focus-section__idx">二</span>' +
        '<h2 class="focus-section__title">学生各学科离均差（热力图）</h2>' +
        '<span class="focus-section__note">离均差 = 个人学科得分率 − 班级学科得分率；单元格上行为离均差，下行为个人得分率</span>' +
        '<div class="focus-section__actions">' +
          '<label class="checkbox checkbox--inline">' +
            '<input type="checkbox" data-focus-weak' + (ui.weakOnly ? ' checked' : '') + ' />' +
            '<span class="checkbox__box"></span><span>仅看需重点补弱（' + weakInfo.weakTotal + ' 人）</span>' +
          '</label>' +
        '</div>' +
      '</div>' +
      heatLegend() +
      '<div class="table-card" style="margin-top:12px">' +
        '<div class="table-scroll heat-scroll">' +
          '<table class="data-table data-table--heat">' +
            '<thead>' + head + '</thead><tbody>' + body + empty + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
      '<p class="focus-section__foot">排序：按「最低得分率」升序（越靠前越该补）。' +
      '「离均差最弱」是相对班均的短板（热力图最红格），用于看"掉队程度"；「最低得分率」是绝对短板，用于决定补哪科；' +
      '得分率低于 60% 标为「重点补」，仅离均差低于 −2pt 而绝对分尚可的标为「需关注」。缺交或未批改显示「—」，不参与判定。' +
      '</p>' +
      '</section>';
  }

  /* ==================== 8. 渲染：三、作业明细 ==================== */

  function sectionThree(ids, all) {
    var statMap = {};
    all.forEach(function (s) { statMap[s.name] = s; });

    var list = selectedHomeworks(ids);
    if (!list.length) {
      return '<section class="focus-section">' +
        '<div class="focus-section__head"><span class="focus-section__idx">三</span>' +
        '<h2 class="focus-section__title">当日作业基本信息</h2></div>' +
        '<div class="empty-state">当前筛选下没有可展示的作业</div></section>';
    }

    var trs = list.map(function (hw) {
      var st = statMap[hw.subject];
      var rate = st ? st.hwMap[hw.id] : null;
      var gradeAvg = GRADE_RATE[hw.subject];
      var diff = isNum(rate) ? rate - gradeAvg : null;
      var score = isNum(rate) ? (rate * hw.full) / 100 : null;
      var present = st ? (st.hwCounts[hw.id] || 0) : 0;
      var subW = hw.due ? (present / hw.due) * 100 : 0;
      var seq = HW_BY_SUBJECT[hw.subject].indexOf(hw) + 1;
      var total = HW_BY_SUBJECT[hw.subject].length;

      return '<tr>' +
        '<td class="cell-strong">' + hw.subject +
          (total > 1 ? ' <span class="cell-hint">' + seq + '/' + total + '</span>' : '') + '</td>' +
        '<td class="cell-name" title="' + hw.name + '">' + hw.name + '</td>' +
        '<td class="cell-num">' + hw.full + '</td>' +
        '<td class="cell-num">' + present + '/' + hw.due + '</td>' +
        '<td><span class="mini-bar">' +
          '<span class="mini-bar__track"><span class="mini-bar__fill" style="width:' + subW.toFixed(1) + '%"></span></span>' +
          '<span class="mini-bar__num">' + pctOf(present, hw.due) + '</span>' +
        '</span></td>' +
        '<td class="cell-num">' + f1(score) + '</td>' +
        '<td class="cell-num cell-strong">' + f1(rate) + '%</td>' +
        '<td class="cell-num ' + deltaCls(diff) + '">' + (isNum(diff) ? signed(diff) : '—') + '</td>' +
        '<td class="cell-num cell-muted">' + hw.graded + '</td>' +
        '</tr>';
    }).join('');

    var submit = 0;
    var due = 0;
    list.forEach(function (hw) {
      var st = statMap[hw.subject];
      submit += st ? (st.hwCounts[hw.id] || 0) : 0;
      due += hw.due;
    });

    return '<section class="focus-section">' +
      '<div class="focus-section__head">' +
        '<span class="focus-section__idx">三</span>' +
        '<h2 class="focus-section__title">当日作业基本信息</h2>' +
        '<span class="focus-section__note">共 ' + list.length + ' 份作业 · 合计提交 ' +
          submit + '/' + due + '（' + pctOf(submit, due) + '）</span>' +
      '</div>' +
      '<div class="table-card">' +
        '<div class="table-scroll">' +
          '<table class="data-table data-table--compact">' +
            '<thead><tr>' +
              '<th>学科</th><th>作业名称</th><th>满分</th><th>提交</th><th>提交率</th>' +
              '<th>批改均分</th><th>得分率</th><th>较年级</th><th>批改时间</th>' +
            '</tr></thead><tbody>' + trs + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
      '<p class="focus-section__foot">同一学科的多份作业并列展示、无主次，均计入该学科得分率（算术平均）；' +
      '「学科」列后的 1/2 表示该科当日的第几份。「较年级」= 该作业得分率 − 该学科年级均。</p>' +
      '</section>';
  }

  /* ==================== 9. 对外渲染入口 ==================== */

  function render(root, opts) {
    if (!root) return;
    opts = opts || {};
    lastRender = { root: root, opts: opts };

    var ids = opts.homeworks || HOMEWORKS.map(function (h) { return h.id; });
    var all = computeAll(ids);

    var html = hintHTML(opts, all);

    if (!all.length) {
      root.innerHTML = html + '<div class="focus-section"><div class="empty-state">' +
        '未选择任何作业，请在「调整筛选」中至少保留一份作业</div></div>';
      return;
    }

    var weakInfo = weakestOf(all);
    html += kpiHTML(all, weakInfo);
    html += sectionOne(all, weakInfo);
    html += sectionTwo(all, weakInfo);
    html += sectionThree(ids, all);

    root.innerHTML = html;
  }

  /* 热力表「仅看重点补弱」开关：模块内自管理，两处引用均生效 */
  document.addEventListener('change', function (e) {
    var input = e.target && e.target.closest ? e.target.closest('[data-focus-weak]') : null;
    if (!input || !lastRender) return;
    ui.weakOnly = input.checked;
    render(lastRender.root, lastRender.opts);
  });

  /* ==================== 10. 导出数据 ==================== */

  function exportRows(ids) {
    var all = computeAll(ids);
    var rows = [['学科侧重诊断 · ' + TODAY, '学科得分率 = 该科各作业得分率的算术平均（作业无主次）']];
    rows.push(['学科', '作业份数', '提交(人次)', '班均得分率', '年级均', '差值', '中位', '标准差', '最高', '最低',
      '优', '良', '中', '差', '补弱收益']);
    all.slice().sort(function (a, b) { return b.benefit - a.benefit; }).forEach(function (s) {
      rows.push([s.name, s.hwCount, s.submitted + '/' + s.due, f1(s.avg), f1(s.gradeAvg), signed(s.diff),
        f1(s.median), f1(s.sd), f1(s.max), f1(s.min),
        s.dist.ex, s.dist.good, s.dist.pass, s.dist.weak, f1(s.benefit)]);
    });

    rows.push([]);
    rows.push(['学号', '姓名'].concat(all.map(function (s) { return s.name + '得分率'; }))
      .concat(all.map(function (s) { return s.name + '离均差'; }))
      .concat(['离均差最弱', '最低得分率学科', '最低得分率']));

    var info = weakestOf(all);
    info.rows.slice().sort(function (a, b) { return a.worst.v - b.worst.v; }).forEach(function (r) {
      var line = [r.stu.id, r.stu.name];
      r.cells.forEach(function (c) { line.push(isNum(c.v) ? f1(c.v) : '—'); });
      r.cells.forEach(function (c) { line.push(isNum(c.d) ? signed(c.d) : '—'); });
      line.push(r.best.sub, r.worst.sub, f1(r.worst.v));
      rows.push(line);
    });

    rows.push([]);
    rows.push(['学科', '作业名称', '满分', '提交', '得分率', '较年级', '批改时间']);
    selectedHomeworks(ids).forEach(function (hw) {
      var st = null;
      all.forEach(function (s) { if (s.name === hw.subject) st = s; });
      var rate = st ? st.hwMap[hw.id] : null;
      rows.push([hw.subject, hw.name, hw.full,
        (st ? (st.hwCounts[hw.id] || 0) : 0) + '/' + hw.due,
        f1(rate), isNum(rate) ? signed(rate - GRADE_RATE[hw.subject]) : '—', hw.graded]);
    });
    return rows;
  }

  global.FocusReport = {
    TODAY: TODAY,
    TODAY_LABEL: TODAY_LABEL,
    SUBJECTS: SUBJECTS,
    HOMEWORKS: HOMEWORKS,
    HW_BY_SUBJECT: HW_BY_SUBJECT,
    STUDENTS: STUDENTS,
    computeAll: computeAll,
    exportRows: exportRows,
    render: render
  };
})(window);
