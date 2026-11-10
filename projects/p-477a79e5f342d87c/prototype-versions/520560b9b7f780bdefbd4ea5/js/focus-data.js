/* ==========================================================================
   跨学科分析 · 数据层 + 报表渲染层（v2 判定口径）
   --------------------------------------------------------------------------
   同一份报表被两处引用，避免口径漂移：
     1) index.html → 左侧【跨学科分析】视图（壳页负责筛选，本文件只渲染报表主体）
     2) 高三34班_跨学科分析报表_最近批改.html → 独立可分享报表

   v4 绝对弱 / 相对弱双层版：
     1. 聚合：学科得分率 = Σ(各作业得分) / Σ(各作业满分)，按满分加权；
        班级与年级使用同一作业集合、同一权重，缺交不按 0 分。
     2. 证据：A≥3 份 / B=2 份 / C=1 份；C 级只给临时建议。
        当前决策只使用当日或近 3 天证据，更长窗口保留展示但只做趋势复核。
     3. 班级绝对弱两条通道：低分人数占比 ≥30%、
        班均未达 85% 且连续两次低于年级 5 个百分点；证据不足时标「待确认」。
        班级相对弱 = 班均未达 85% 且低于年级、但未达绝对弱条件的科，按差距排序。
        页面只呈现绝对弱 / 相对弱清单及判定依据。
     4. 学生绝对弱：低分（<60%），或未达 85% 且低于班均 10 个百分点，
        先比是否低分再比偏离程度；学生相对弱仍按偏离刻度兜底为「优先巩固」。
     5. 标准差只作「学生分化」展示，不参与判定；P75 ≥95% 的科目仍标「满分区」，
        但不再享有跳过判定的豁免，避免高分区里的低分学生被漏掉。

   对外接口：window.FocusReport
     · TODAY / TODAY_LABEL / SUBJECTS / HOMEWORKS（供壳页筛选使用）
     · computeAll(ids) / exportRows(ids) / render(root, opts)
     · configure(patch)  —— 真实数据注入入口，见文件末尾
   ========================================================================== */
(function (global) {
  'use strict';

  /* ==================== 1. 常量与数据 ==================== */

  var TODAY = '2026-11-05';
  var TODAY_LABEL = '2026-11-05（今天）';
  var SUBJECTS = ['语文', '数学', '英语', '物理', '化学', '生物'];

  /* 演示数据开关：true 时逐作业得分率由学科基准率对称拆分生成（非真实观测） */
  var DEMO = true;

  /* 等级分档（均按得分率百分比）：优 ≥85% / 良 70~84% / 中 60~69% / 低分 <60% */
  var CUT = { excellent: 85, good: 70, pass: 60 };

  /* 演示数据拆分幅度：第一份整体偏高、第二份对称下压，保证按满分加权后仍等于基准率 */
  var SPLIT = 3.2;

  /* 天花板判定线：学生得分率 P75 ≥ 95% 视为该科已被计分上限压住 */
  var CEILING_P75 = 95;

  /*
    暂行教学口径（尚无教研校准，数值取保守、可解释的起始值）：
      · 学生提醒线：固定 10 个百分点，仅当个人得分率未达 85% 时用于相对判弱；
      · 学生低分线：得分率 <60%，不受 85% 闸门限制；
      · 班级判弱线：固定 5 个百分点，要求班均未达 85% 且最近两次作业连续同向；
      · 低分面：得分率 <60% 的学生占比 ≥30%，独立判为绝对弱。
    标准差只保留为“学生分化”展示指标，不参与任何判定。
    10 / 5 / 30 是便于教师理解和后续回测的暂行阈值，不是统计定律。
  */
  var STUDENT_TRIGGER_PP = 10;
  var CLASS_ACTION_PP = 5;
  var CLASS_CONFIRM_TIMES = 2;
  var CLASS_LOW_SHARE_MIN = 0.30;
  var SUBMIT_Q_HIGH = 0.30;
  var RECENT_LOOKBACK_DAYS = 2;             // 今天 + 向前 2 天 = 近 3 天

  /*
    当日作业清单：同一学科可多份，作业之间无主次。
    gradeRate = 该校该作业的年级得分率（与班均同一套作业口径；真实接入时由平台提供）。
  */
  var HOMEWORKS = [
    { id: 'yw1', subject: '语文', name: '知识清单1（文言实词与病句）', full: 40, due: 37, handed: 37, date: TODAY, graded: '11-05 12:20', gradeRate: 79.4 },
    { id: 'yw2', subject: '语文', name: '古诗文默写（第3单元）', full: 20, due: 37, handed: 35, date: TODAY, graded: '11-05 12:35', gradeRate: 76.7 },
    { id: 'sx1', subject: '数学', name: '高三数学周末测试（五）2026.11.02', full: 60, due: 37, handed: 37, date: TODAY, graded: '11-05 08:15', gradeRate: 76.4 },
    { id: 'sx2', subject: '数学', name: '课堂限时练（导数应用）', full: 30, due: 37, handed: 37, date: TODAY, graded: '11-05 08:20', gradeRate: 74.6 },
    { id: 'yy1', subject: '英语', name: '读后续写（二稿）', full: 25, due: 37, handed: 36, date: TODAY, graded: '11-05 21:40', gradeRate: 86.2 },
    { id: 'yy2', subject: '英语', name: '听力42', full: 30, due: 37, handed: 34, date: TODAY, graded: '11-05 09:05', gradeRate: 89.5 },
    { id: 'wl1', subject: '物理', name: '第九章 作业1 库仑定律 电场强度', full: 40, due: 37, handed: 37, date: TODAY, graded: '11-05 14:30', gradeRate: 74.4 },
    { id: 'hx1', subject: '化学', name: '10月19日化学作业答题纸（电化学）', full: 50, due: 37, handed: 37, date: TODAY, graded: '11-05 16:05', gradeRate: 71.2 },
    { id: 'sw1', subject: '生物', name: '限时练三（遗传规律）', full: 40, due: 37, handed: 37, date: TODAY, graded: '11-05 19:50', gradeRate: 78.0 }
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

  var STUDENTS = [];
  var HW_BY_SUBJECT = {};

  /* 作业行展示口径：已批改份数 = 该作业所属学科逐生得分率的有效人次（有分数即已批改），
     与学科统计表「提交」列同源，避免弹窗与报表出现两套人数；handed 为平台已交人次，缺省按应交人数兜底。 */
  function attachHomeworkStats() {
    HOMEWORKS.forEach(function (hw) {
      var col = SUBJECTS.indexOf(hw.subject);
      var graded = 0;
      if (col >= 0) {
        ROWS.forEach(function (row) { if (isNum(row[2 + col])) graded += 1; });
      }
      var handed = isNum(hw.handed) ? hw.handed : hw.due;
      hw.graded = graded;
      hw.handed = Math.max(graded, handed);
      hw.gradePct = hw.handed ? Math.round(graded / hw.handed * 100) : null;
    });
  }

  function buildStudents() {
    return ROWS.map(function (row) {
      var stu = { id: row[0], name: row[1], rates: {}, hw: null };
      SUBJECTS.forEach(function (sub, i) {
        var v = row[2 + i];
        stu.rates[sub] = (typeof v === 'number' && !isNaN(v)) ? v : null;
      });
      /* 第 9 列起若存在对象，则为真实逐作业得分率映射（hwId → 得分率），DEMO 关闭时必需 */
      if (row[8] && typeof row[8] === 'object') stu.hw = row[8];
      return stu;
    });
  }

  function rebuildHwIndex() {
    HW_BY_SUBJECT = {};
    SUBJECTS.forEach(function (sub) {
      HW_BY_SUBJECT[sub] = HOMEWORKS.filter(function (h) { return h.subject === sub; });
    });
    STUDENTS = buildStudents();
    attachHomeworkStats();
    /* configure 后同步公开引用，避免壳页仍拿到注入前的学生名单 */
    if (global.FocusReport) {
      global.FocusReport.STUDENTS = STUDENTS;
      global.FocusReport.HW_BY_SUBJECT = HW_BY_SUBJECT;
    }
  }

  rebuildHwIndex();

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

  /* 按权重加权平均；权重缺失或非正的项直接跳过，分母同步缩减（缺失不按 0 分计） */
  function weightedMean(pairs) {
    var sw = 0;
    var sv = 0;
    pairs.forEach(function (p) {
      if (isNum(p.v) && isNum(p.w) && p.w > 0) {
        sv += p.v * p.w;
        sw += p.w;
      }
    });
    return sw ? sv / sw : null;
  }

  function shiftDate(iso, days) {
    var d = new Date(iso + 'T00:00:00');
    d.setDate(d.getDate() + days);
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function evidenceOf(n) {
    return n >= 3 ? 'A' : (n === 2 ? 'B' : (n === 1 ? 'C' : 'N'));
  }

  /* 证据等级直接说人话：A≥3 / B=2 / C=1 份，不再出现 A/B/C 字母 */
  function evidenceText(e) {
    return e === 'N' ? '—' : (e === 'A' ? '3 份以上' : (e === 'B' ? '2 份' : '1 份'));
  }

  /* 只要窗口混入近 3 天以前的数据，就不再用于自动排序 */
  function timingOf(list) {
    if (!list.length) return 'history';
    var start = shiftDate(TODAY, -RECENT_LOOKBACK_DAYS);
    var recent = list.every(function (hw) {
      return hw.date >= start && hw.date <= TODAY;
    });
    if (!recent) return 'history';
    var todayCount = list.filter(function (hw) { return hw.date === TODAY; }).length;
    return todayCount === list.length ? 'today' : (todayCount ? 'mixed' : 'recent');
  }

  function timingText(t) {
    return t === 'today' ? '当日证据' : (t === 'mixed' ? '近3天区间证据' :
      (t === 'recent' ? '非当日·近3天' : '长窗·趋势复核'));
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

  /* 升序数组的线性插值分位数 */
  function quantile(sorted, q) {
    if (!sorted.length) return null;
    var pos = (sorted.length - 1) * q;
    var lo = Math.floor(pos);
    var hi = Math.ceil(pos);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  }

  /* 离均差热力分档：统一以 10 个百分点为刻度，与固定学生提醒线同源。 */
  function heatClass(d, t) {
    if (!isNum(d) || !isNum(t)) return 'heat-na';
    if (d <= -3 * t) return 'heat-n3';
    if (d <= -1.5 * t) return 'heat-n2';
    if (d <= -t) return 'heat-n1';
    if (d < t) return 'heat-flat';
    if (d < 1.5 * t) return 'heat-p1';
    if (d < 3 * t) return 'heat-p2';
    return 'heat-p3';
  }

  /* ==================== 3. 作业级得分率 ==================== */

  /*
    单份作业的得分率。
    · 真实数据：stu.hw[hwId] 直接返回；
    · 演示数据（DEMO=true 且无真实逐作业数据）：围绕该生学科基准率拆分，
      并以作业满分为权重解出第二份的值，保证
        「Σ(得分率 × 满分) / Σ满分」恒等于基准率，
      即演示数据在 v2 的满分加权口径下仍然自洽。
    同一学科超过 2 份作业时不再拆分（直接返回基准率），避免退化解。
  */
  function homeworkRate(stu, hw) {
    if (stu.hw && isNum(stu.hw[hw.id])) return stu.hw[hw.id];

    var base = stu.rates[hw.subject];
    if (!isNum(base)) return null;
    if (!DEMO) return null;

    var list = HW_BY_SUBJECT[hw.subject] || [];
    if (list.length <= 1 || list.length > 2) return round1(base);

    var d1 = parseInt(stu.id.slice(-1), 10);
    var d2 = parseInt(stu.id.slice(-2, -1), 10);
    var bias = SPLIT + (((d1 + d2) % 5) - 2) * 0.6;   // SPLIT ± 1.2，随学生浮动

    var first = list[0];
    var second = list[1];
    var w1 = first.full || 1;
    var w2 = second.full || 1;
    var r1 = Math.min(base + bias, 100);
    var r2 = (base * (w1 + w2) - w1 * r1) / w2;       // 按满分权重反解，保证加权均值 = 基准率
    if (r2 < 0) {
      r2 = 0;
      r1 = Math.min((base * (w1 + w2)) / w1, 100);
    }
    if (r2 > 100) {
      r2 = 100;
      r1 = Math.max((base * (w1 + w2) - w2 * 100) / w1, 0);
    }

    return round1(hw === first ? r1 : r2);
  }

  function selectedHomeworks(ids) {
    if (!ids) return HOMEWORKS.slice();
    return HOMEWORKS.filter(function (h) { return ids.indexOf(h.id) >= 0; });
  }

  /*
    班级弱科证据：从最近一次作业向前数，连续有多少次同时满足
    「该次班均 <85%」且「比同卷年级低 ≥5 个百分点」。
    同日作业没有更细时间时按当前作业顺序判断；中间断一次即停止。
  */
  function classActionStreak(list, hwMap) {
    var ordered = list.slice().sort(function (a, b) {
      if (a.date === b.date) return list.indexOf(a) - list.indexOf(b);
      return a.date < b.date ? -1 : 1;
    });
    var streak = 0;
    for (var i = ordered.length - 1; i >= 0; i--) {
      var hw = ordered[i];
      var rate = hwMap[hw.id];
      var hit = isNum(rate) && isNum(hw.gradeRate) &&
        rate < CUT.excellent && hw.gradeRate - rate >= CLASS_ACTION_PP;
      if (!hit) break;
      streak++;
    }
    return streak;
  }

  /* ==================== 4. 指标计算 ==================== */

  function computeSubject(subject, ids) {
    var list = selectedHomeworks(ids).filter(function (h) { return h.subject === subject; });
    if (!list.length) return null;

    /* 作业级：各作业的班级平均得分率（人次不计缺交，分母随有效人次缩减） */
    var hwMap = {};
    var hwCounts = {};
    var submitted = 0;
    var due = 0;
    var classRateSum = 0;
    var validFullSum = 0;

    list.forEach(function (hw) {
      var pairs = [];
      STUDENTS.forEach(function (stu) {
        var r = homeworkRate(stu, hw);
        if (isNum(r)) pairs.push({ v: r, w: hw.full });
      });
      hwMap[hw.id] = weightedMean(pairs);
      hwCounts[hw.id] = pairs.length;
      submitted += pairs.length;
      due += hw.due;
      pairs.forEach(function (p) {
        classRateSum += p.v * hw.full;
        validFullSum += hw.full;
      });
    });

    /* 严格按有效提交 pooled：Σ(得分率×满分) / Σ满分，缺交不进入分母 */
    var avg = validFullSum ? classRateSum / validFullSum : null;

    /* 年级均使用同一作业、同一有效人次×满分权重，避免缺交造成两侧权重不同源 */
    var gradeAvg = weightedMean(list.map(function (hw) {
      return { v: hw.gradeRate, w: hw.full * (hwCounts[hw.id] || 0) };
    }));

    /* 学生级：该生该科的满分加权得分率；提交率独立记录，不混入能力分 */
    var stuRateMap = {};
    var stuMissingQMap = {};
    var stuRates = [];
    STUDENTS.forEach(function (stu) {
      var submittedCount = 0;
      var v = weightedMean(list.map(function (hw) {
        var rate = homeworkRate(stu, hw);
        if (isNum(rate)) submittedCount++;
        return { v: rate, w: hw.full };
      }));
      stuRateMap[stu.id] = v;
      stuMissingQMap[stu.id] = list.length ? (list.length - submittedCount) / list.length : 0;
      if (isNum(v)) stuRates.push(v);
    });

    var sorted = stuRates.slice().sort(function (a, b) { return a - b; });
    var n = stuRates.length;
    var median = quantile(sorted, 0.5);
    var p75 = quantile(sorted, 0.75);

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

    /* 天花板：P75 触及计分上限附近，剩余差异主要来自赋分颗粒度，不能用来判短板 */
    var exempt = isNum(p75) && p75 >= CEILING_P75;

    /* 固定提醒线只表示“低多少个百分点值得提醒”，实际还要通过 85% 绝对闸门。 */
    var trigger = STUDENT_TRIGGER_PP;

    var diff = isNum(avg) && isNum(gradeAvg) ? avg - gradeAvg : null;

    /*
      班级判弱线固定 5 个百分点；actionRatio 仅表达差距相对判弱线的倍数，
      是否判为绝对弱还要看班均是否未达 85%、以及最近两次是否连续同向。
    */
    var actionLine = CLASS_ACTION_PP;
    var actionStreak = classActionStreak(list, hwMap);
    var actionConfirmed = actionStreak >= CLASS_CONFIRM_TIMES;
    var belowGrade = isNum(diff) && diff < 0 ? -diff : 0;
    var actionRatio = belowGrade > 0 ? belowGrade / actionLine : null;

    return {
      name: subject,
      n: n,
      hwCount: list.length,
      list: list,
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
      p75: p75,
      max: n ? sorted[n - 1] : null,
      min: n ? sorted[0] : null,
      dist: dist,
      exempt: exempt,
      trigger: trigger,
      actionLine: actionLine,
      actionStreak: actionStreak,
      actionConfirmed: actionConfirmed,
      belowGrade: belowGrade,
      actionRatio: actionRatio,
      evidence: evidenceOf(list.length),
      timing: timingOf(list),
      missingQ: due ? Math.max(0, (due - submitted) / due) : 0,
      lowShare: n ? dist.weak / n : 0,
      gradeGap: isNum(diff) ? -diff : null,
      stuMissingQMap: stuMissingQMap
    };
  }

  function computeAll(ids) {
    return SUBJECTS.map(function (sub) {
      return computeSubject(sub, ids);
    }).filter(Boolean);
  }

  /* 参与班级比较的学科：有同卷年级均即可；是否判弱另由绝对闸门判定 */
  function rankable(shown) {
    return shown.filter(function (s) { return isNum(s.diff); });
  }

  /* 班均差通道：班均未达 85%，且比同卷年级低至少 5 个百分点。 */
  function classGapHit(s) {
    return isNum(s.avg) && s.avg < CUT.excellent &&
      isNum(s.gradeGap) && s.gradeGap >= CLASS_ACTION_PP;
  }

  /* 班级结论允许为空：门槛未过线时，不再从六科里强制挑一个「最弱」 */
  function decideClass(shown) {
    var pool = rankable(shown);
    var submitWarn = shown.filter(function (s) { return s.missingQ > SUBMIT_Q_HIGH; });
    var eligible = shown.filter(function (s) {
      return s.timing !== 'history' && s.missingQ <= SUBMIT_Q_HIGH &&
        (isNum(s.diff) || s.lowShare >= CLASS_LOW_SHARE_MIN);
    });

    /*
      班级绝对弱两条通道，任一命中即判绝对弱，互不覆盖：
        · 低分人数占比 ≥30% → 判为绝对弱（低分面）
        · 班均未达 85%，且连续两次低于年级 ≥5 个百分点 → 判为绝对弱（班均差）
    */
    var candidates = eligible.filter(function (s) {
      return s.lowShare >= CLASS_LOW_SHARE_MIN || classGapHit(s);
    });

    candidates.forEach(function (s) {
      s.absoluteCandidate = s.lowShare >= CLASS_LOW_SHARE_MIN;
    });
    candidates.sort(function (a, b) {
      if (a.absoluteCandidate !== b.absoluteCandidate) return a.absoluteCandidate ? -1 : 1;
      if (a.absoluteCandidate && b.absoluteCandidate && a.lowShare !== b.lowShare) {
        return b.lowShare - a.lowShare;
      }
      var ar = isNum(a.actionRatio) ? a.actionRatio : -1;
      var br = isNum(b.actionRatio) ? b.actionRatio : -1;
      if (ar !== br) return br - ar;
      return b.lowShare - a.lowShare;
    });

    /* 班级相对弱：未达绝对弱条件，但班均未达 85% 且低于年级；与绝对弱分组同时列出 */
    var relative = eligible.filter(function (s) {
      return candidates.indexOf(s) < 0 && s.avg < CUT.excellent &&
        s.diff < 0 && isNum(s.actionRatio);
    }).sort(function (a, b) { return b.actionRatio - a.actionRatio; });

    /* 整体水平：六科「班均 − 年级」的平均，教师可心算，只作文案修饰，不触发动作 */
    var diffs = shown.filter(function (s) { return isNum(s.diff); }).map(function (s) { return s.diff; });
    var meanDiff = diffs.length ? diffs.reduce(function (a, v) { return a + v; }, 0) / diffs.length : null;

    /*
      证据是否足以坐实绝对弱：
        · 低分面通道：2 份作业即可确认；
        · 班均差通道：必须最近连续两次同向，只出现一次或仅 1 份作业都标「待确认」。
      绝对弱与相对弱都是清单，不再只取一科。
    */
    var absolute = [];
    var pending = [];
    candidates.forEach(function (s) {
      var unconfirmed = s.evidence === 'C' ||
        (classGapHit(s) && s.lowShare < CLASS_LOW_SHARE_MIN && !s.actionConfirmed);
      (unconfirmed ? pending : absolute).push(s);
    });

    return {
      pool: pool, submitWarn: submitWarn, candidates: candidates,
      relative: relative, meanDiff: meanDiff,
      absolute: absolute, pending: pending
    };
  }

  /* 学科只标能力判定与数据状态，不输出教学组织方式 */
  function subjectConclusion(s, decision) {
    if (s.missingQ > SUBMIT_Q_HIGH) return '先抓提交';
    if (s.timing === 'history') return '趋势复核';
    if (decision.absolute.indexOf(s) >= 0) return '绝对弱';
    if (decision.pending.indexOf(s) >= 0) return '绝对弱·待确认';
    if (decision.relative.indexOf(s) >= 0) return '相对弱';
    return '正常';
  }

  function comparePriorityCells(a, b) {
    if (a.fail !== b.fail) return a.fail ? -1 : 1;
    if (Math.abs(a.severity - b.severity) > 0.0001) return b.severity - a.severity;
    return a.v - b.v;
  }

  function compareStudentRows(a, b) {
    if (!!a.priority !== !!b.priority) return a.priority ? -1 : 1;
    if (a.priority && b.priority) {
      if (!!a.priority.relative !== !!b.priority.relative) return a.priority.relative ? 1 : -1;
      if (a.priority.relative && b.priority.relative &&
          Math.abs(a.priority.relativeScore - b.priority.relativeScore) > 0.0001) {
        return a.priority.relativeScore - b.priority.relativeScore;
      }
      if (!a.priority.relative && !b.priority.relative) {
        var byCell = comparePriorityCells(a.priority, b.priority);
        if (byCell) return byCell;
      }
    }
    if (a.submitOnly !== b.submitOnly) return a.submitOnly ? -1 : 1;
    return a.stu.id < b.stu.id ? -1 : (a.stu.id > b.stu.id ? 1 : 0);
  }

  /*
    逐生个人补弱：
      · 重点提升：短板 = 本人得分率未达 85%，且 d ≤ −10pp；低分 = 得分率 <60%，两者均可独立触发。
        多科过线时，先比较是否低分，低分比「距 60% ÷ 10pp」，短板比「−d ÷ 10pp」。
      · 优先巩固：没有重点候选时，仍从有效科次中选一科。相对分 = d / 10pp，
        数值最小者就是该生各科中的相对最弱；即使仍高于班均，也只表示优先巩固。
      · 未交率 >30% 的科次先抓提交，长窗不参与推荐；满分区不单独豁免，
        85% 闸门已避开高分小分差被误判；低分通道仍对满分区生效。
        完全无有效成绩时不编造结论，显示「待补数据」。
  */
  /*
    一句话建议：学生端只需要这一句，不出现任何统计术语。
    取词顺序与判定链一致：先抓提交 → 低分 → 短板 → 仅相对 → 无数据。
  */
  function adviceOf(priority, cells, submitOnly, aboveAll) {
    if (!priority) {
      if (submitOnly) {
        var pending = cells.filter(function (c) {
          return c.submitWarn && c.timing !== 'history';
        }).map(function (c) { return c.sub; });
        return '先补交 ' + pending.join('、') + ' 的作业，交上来再判强弱。';
      }
      return '暂无可比较的成绩，先把最近几份作业交上来。';
    }
    var p = priority;
    if (p.fail) {
      return '先把 ' + p.sub + ' 得分率拉到 60%（现在 ' + f1(p.v) + '%），其他科目先不动。';
    }
    if (p.relative) {
      var tail = p.evidence === 'C' ? '（只有 1 份作业，方向暂定）' : '';
      if (aboveAll) {
        return '各科都不低于班均，' + p.sub + ' 是相对最吃力的一科，先巩固它。' + tail;
      }
      if (isNum(p.d) && p.d >= 0.05) {
        return p.sub + ' 比班均高 ' + f1(p.d) + ' 个百分点，是其余各科里最靠后的一科，先巩固它。' + tail;
      }
      if (isNum(p.d) && Math.abs(p.d) < 0.05) {
        return p.sub + ' 正好等于班均，是其余各科里最靠后的一科，先巩固它。' + tail;
      }
      return '各科都没到提醒线，' + p.sub + ' 相对最弱（低于班均 ' +
        f1(Math.abs(p.d)) + ' 个百分点），先巩固这一科。' + tail;
    }
    return p.sub + ' 比班均低 ' + f1(Math.abs(p.d)) + ' 个百分点（已超过 ' +
      f1(p.t) + ' 个百分点的提醒线），本周重点补 ' + p.sub + '。';
  }

  function weakestOf(shown) {
    var rows = [];
    var weakCounts = {};
    var weakTotal = 0;
    var weakCells = 0;
    var urgentTotal = 0;
    var failTotal = 0;
    var priorityTotal = 0;
    var relativeTotal = 0;
    var recommendationTotal = 0;
    var temporaryTotal = 0;
    var submitTotal = 0;
    var relativeAboveAllTotal = 0;

    STUDENTS.forEach(function (stu) {
      var cells = [];

      shown.forEach(function (st) {
        var v = st.stuRateMap[stu.id];
        var q = st.stuMissingQMap[stu.id] || 0;
        if (!isNum(v)) {
          cells.push({
            sub: st.name, v: null, d: null, exempt: st.exempt, t: st.trigger,
            evidence: st.evidence, timing: st.timing, q: q,
            submitWarn: q > SUBMIT_Q_HIGH, severity: 0, relativeScore: null
          });
          return;
        }
        var d = isNum(st.avg) ? v - st.avg : null;
        var recent = st.timing !== 'history';
        var submitWarn = q > SUBMIT_Q_HIGH;
        /* 相对判弱必须同时过两道闸门：本人未达 85%，且低于班均 10 个百分点。 */
        var short = recent && !submitWarn && isNum(d) &&
          v < CUT.excellent && d <= -st.trigger;
        var relativeScale = STUDENT_TRIGGER_PP;
        var cell = {
          sub: st.name, v: v, d: d, exempt: st.exempt,
          t: st.trigger, sd: st.sd, evidence: st.evidence, timing: st.timing,
          q: q, submitWarn: submitWarn,
          short: short,
          fail: v < CUT.pass,
          /* 不及格但没到提醒线的格次也要有严重度，否则多科不及格时退化成按分数排 */
          severity: short ? Math.max(0, -d / st.trigger) :
            (v < CUT.pass ? Math.max(0, (CUT.pass - v) / relativeScale) : 0),
          relativeScore: isNum(d) ? d / relativeScale : null,
          relative: false
        };
        cells.push(cell);
      });

      var candidates = cells.filter(function (c) {
        /* 近满分科目仍保留「不及格」通道：一个班都考 96 分时，不及格的学生照样要补 */
        return c.timing !== 'history' && !c.submitWarn &&
          isNum(c.v) && (c.short || c.fail);
      }).sort(comparePriorityCells);
      var priority = candidates[0] || null;

      if (!priority) {
        var relativePool = cells.filter(function (c) {
          return !c.exempt && c.timing !== 'history' && !c.submitWarn &&
            isNum(c.v) && isNum(c.relativeScore);
        });
        /* 若只剩近满分科目，也给出相对巩固方向，但不升级成「短板」 */
        if (!relativePool.length) {
          relativePool = cells.filter(function (c) {
            return c.timing !== 'history' && !c.submitWarn &&
              isNum(c.v) && isNum(c.relativeScore);
          });
        }
        relativePool.sort(function (a, b) {
          if (Math.abs(a.relativeScore - b.relativeScore) > 0.0001) {
            return a.relativeScore - b.relativeScore;
          }
          if (a.v !== b.v) return a.v - b.v;
          return a.sub < b.sub ? -1 : (a.sub > b.sub ? 1 : 0);
        });
        priority = relativePool[0] || null;
        if (priority) priority.relative = true;
      }

      var submitOnly = !priority && cells.some(function (c) {
        return c.submitWarn && c.timing !== 'history';
      });
      var temporary = !!(priority && !priority.relative && priority.evidence === 'C');
      var status = priority ? (priority.relative ?
        (priority.evidence === 'C' ? '优先巩固·暂定' : '优先巩固') :
        (temporary ? '临时关注' : '优先提升')) :
        (submitOnly ? '先抓提交' : '待补数据');

      var shortCells = cells.filter(function (c) { return c.short; });
      var failed = cells.filter(function (c) {
        return c.fail && c.timing !== 'history';
      }).map(function (c) { return c.sub; });
      var short = shortCells.length > 0;
      var urgent = !!(priority && !priority.relative && priority.fail);
      /* 相对巩固且各科都不低于班均：只说明整体偏强，不升级为薄弱学科 */
      var aboveAll = !!(priority && priority.relative && cells.every(function (c) {
        return !isNum(c.d) || c.d >= 0;
      }));

      rows.push({
        stu: stu, cells: cells, priority: priority,
        shortCells: shortCells, short: short, urgent: urgent,
        failed: failed, submitOnly: submitOnly,
        temporary: temporary, status: status,
        advice: adviceOf(priority, cells, submitOnly, aboveAll),
        aboveAll: aboveAll
      });

      shortCells.forEach(function (c) {
        weakCounts[c.sub] = (weakCounts[c.sub] || 0) + 1;
      });
      if (short) weakTotal++;
      weakCells += shortCells.length;
      if (urgent) urgentTotal++;
      if (failed.length) failTotal++;
      if (priority) {
        recommendationTotal++;
        if (priority.relative) {
          relativeTotal++;
          if (aboveAll) relativeAboveAllTotal++;
        } else priorityTotal++;
      }
      if (temporary) temporaryTotal++;
      if (submitOnly) submitTotal++;
    });

    var top = Object.keys(weakCounts).map(function (k) {
      return { name: k, count: weakCounts[k] };
    }).sort(function (a, b) { return b.count - a.count; });

    return {
      rows: rows,
      weakCounts: weakCounts,
      weakTop: top,
      weakTotal: weakTotal,
      weakCells: weakCells,
      urgentTotal: urgentTotal,
      failTotal: failTotal,
      priorityTotal: priorityTotal,
      relativeTotal: relativeTotal,
      recommendationTotal: recommendationTotal,
      temporaryTotal: temporaryTotal,
      submitTotal: submitTotal,
      relativeAboveAllTotal: relativeAboveAllTotal
    };
  }

  /* ==================== 5. 渲染：口径说明 / KPI ==================== */

  /* 标题行的小问号：说明文字默认收起，hover / 键盘聚焦才展开 */
  function tip(body) {
    return '<span class="q-tip" tabindex="0" role="note" aria-label="查看说明">?' +
      '<span class="q-tip__bubble">' + body + '</span></span>';
  }

  function hintHTML(opts, all) {
    var hws = selectedHomeworks(opts.homeworks);
    var submit = 0;
    var due = 0;
    all.forEach(function (s) {
      submit += s.submitted;
      due += s.due;
    });

    var ceiling = all.filter(function (s) { return s.exempt; });
    var history = all.filter(function (s) { return s.timing === 'history'; });
    var nonToday = all.filter(function (s) { return s.timing === 'recent' || s.timing === 'mixed'; });

    return '<span class="prd-badge" data-prd="XK-04" title="查看 PRD XK-04：统计口径与判定规则">XK-04</span>' +
      '<span class="q-tip q-tip--icon-only" tabindex="0" role="note" aria-label="查看统计口径">?' +
      '<span class="q-tip__bubble">' +
      '<span><b>统计范围</b>' + (opts.dateLabel || TODAY_LABEL) + '，覆盖 ' + all.length +
        ' 个学科共 ' + hws.length + ' 份作业，作业提交率 ' + pctOf(submit, due) + '。</span>' +
      '<span><b>学科得分率</b>把这一科所有作业的得分加起来，除以所有作业的满分加起来（满分大的作业占比重大）。没交的作业不按 0 分算，也不进分母。</span>' +
      '<span><b>较年级</b>班级得分率减同卷年级得分率，单位是「个百分点」，正值高于年级、负值低于年级。</span>' +
      '<span><b>班级怎么判弱科</b>两条路互不替代，达到任一即判绝对弱：全班 ' +
        Math.round(CLASS_LOW_SHARE_MIN * 100) + '% 以上的学生得分率不到 60%，或' +
        '班均未达 85%、且最近两次作业都比同卷年级低至少 ' + CLASS_ACTION_PP +
        ' 个百分点。只出现一次或只有 1 份作业时标待确认；' +
        '班均未达 85% 且低于年级但未达条件的，列为相对弱。' +
        '某科未交超过 ' + Math.round(SUBMIT_Q_HIGH * 100) +
        '% 先抓提交、不判学科强弱。</span>' +
      '<span><b>学生怎么定补哪一科</b>每名有有效成绩的学生都必须有一科个人补弱方向：得分率不到 60%，或本人得分率未达 85%、又比班均低至少 ' +
        STUDENT_TRIGGER_PP + ' 个百分点，就列为重点提升；没有过线学科时，再选出相对最弱的一科进行巩固。</span>' +
      '<span><b>优先巩固不等同于薄弱学科</b>把「个人得分率 − 班均」除以 10 个百分点，得数最小的那一科就是个人最该先巩固的。它可能仍高于班均，只表示这是该生各科里最吃力的一科，不表示水平不足。</span>' +
      (nonToday.length
        ? '<span><b>非当日数据</b>' + nonToday.map(function (s) {
            return s.name + '（' + timingText(s.timing) + '）';
          }).join('、') + '：用的是近 3 天的作业，结论不能说成「今天」的表现。</span>'
        : '') +
      (history.length
        ? '<span><b>只作趋势参考</b>' + history.map(function (s) {
            return s.name;
          }).join('、') + '：数据超出近 3 天，不参与自动排序。</span>'
        : '') +
      (ceiling.length
        ? '<span><b>已接近满分</b>' + ceiling.map(function (s) {
            return s.name + '（多数学生已达 ' + f1(s.p75) + '% 左右）';
          }).join('、') + '：标为满分区，但因得分率普遍高于 85%，通常不会触发相对判弱；其中仍有学生低于 60% 或明显掉队时，照常进入个人建议。</span>'
        : '') +
      (DEMO
        ? '<span><b>演示数据</b>各作业得分率由学科基准率拆分得出，是示意值，不是真实观测。</span>'
        : '') +
      '</span></span>';
  }

  /* 弱科逐科依据：班均差与低分面两条通道分别说明，不合并成行动指令 */
  function weakSubjectLine(s, pendingFlag) {
    var reasons = [];
    if (classGapHit(s)) {
      reasons.push('班均 ' + f1(s.avg) + '%，比年级低 ' + f1(s.gradeGap) + ' 个百分点' +
        (s.actionConfirmed ? '，连续两次同向' : ''));
    }
    if (s.lowShare >= CLASS_LOW_SHARE_MIN) {
      reasons.push('得分率不到 60% 的 ' + s.dist.weak + ' 人（' + pctOf(s.dist.weak, s.n) + '）');
    }
    return '<div class="diag-decision-note"><b>' + s.name + '</b>' +
      (pendingFlag ? '（待确认）' : '') + '：' + reasons.join('；') +
      '。依据 ' + evidenceText(s.evidence) + ' · ' + timingText(s.timing) +
      (pendingFlag ? '，连续证据尚未形成' : '') + '。</div>';
  }

  /* 班级弱科清单：只回答「哪些科绝对弱、哪些科相对弱」，不给班级统一行动建议 */
  function decisionHTML(decision) {
    var absolute = decision.absolute;
    var pending = decision.pending;
    var relative = decision.relative;
    var allWeak = absolute.concat(pending);
    var html = '';

    if (allWeak.length) {
      html += '<b>绝对弱 ' + allWeak.length + ' 科：' +
        allWeak.map(function (s) { return s.name; }).join('、') + '。</b>';
      absolute.forEach(function (s) { html += weakSubjectLine(s, false); });
      pending.forEach(function (s) { html += weakSubjectLine(s, true); });
    } else {
      html += '<b>本次没有绝对弱科目。</b>';
    }

    if (relative.length) {
      html += '<div class="diag-decision-note"><b>相对弱 ' + relative.length + ' 科：</b>' +
        relative.map(function (s) {
          return s.name + '（比年级低 ' + f1(s.belowGrade) + ' 个百分点，未达绝对弱条件）';
        }).join('、') + '。</div>';
    } else if (!allWeak.length) {
      html += '<div class="diag-decision-note">六科均未达到绝对弱或相对弱条件。</div>';
    }

    if (decision.submitWarn.length) {
      html += '<div class="diag-decision-note">另有 ' + decision.submitWarn.map(function (s) {
        return s.name + '（未交 ' + Math.round(s.missingQ * 100) + '%）';
      }).join('、') + ' 未交率超过 ' + Math.round(SUBMIT_Q_HIGH * 100) +
        '%，先抓提交，不判学科强弱。</div>';
    }
    return '<div class="diag-decision">' +
      '<span class="prd-badge prd-badge-up" data-prd="XK-05" title="查看 PRD XK-05：班级弱科清单">XK-05</span>' +
      html + '</div>';
  }

  function kpiHTML(shown, weakInfo, decision) {
    var allWeak = decision.absolute.concat(decision.pending);
    var relative = decision.relative;
    var below = decision.pool.filter(function (s) { return s.diff < 0; });

    var card = function (label, value, sub, opts) {
      opts = opts || {};
      return '<div class="kpi-card' + (opts.brand ? ' kpi-card--brand' : '') +
        (opts.jump ? ' kpi-card--link' : '') + '"' +
        (opts.jump ? ' data-focus-jump="' + opts.jump + '" role="button" tabindex="0"' : '') + '>' +
        '<div class="kpi-card__label">' + label + (opts.tip ? tip(opts.tip) : '') + '</div>' +
        '<div class="kpi-card__value">' + value + '</div>' +
        '<div class="kpi-card__sub">' + sub + '</div>' +
        '</div>';
    };

    return '<div class="kpi-row kpi-row--three">' +
      '<span class="prd-badge prd-badge-r" data-prd="XK-06" title="查看 PRD XK-06：KPI 概览卡片">XK-06</span>' +
      card('班级弱科', allWeak.length + ' <small>科绝对弱</small>',
        (allWeak.length
          ? '绝对弱：' + allWeak.map(function (s) { return s.name; }).join('、') +
            (decision.pending.length ? '（含待确认 ' + decision.pending.length + ' 科）' : '')
          : '无绝对弱科') +
          (relative.length ? ' · 相对弱：' + relative.map(function (s) { return s.name; }).join('、') : '') +
          (isNum(decision.meanDiff) ? ' · 六科平均' + (decision.meanDiff >= 0 ? '高于年级 ' : '低于年级 ') +
            f1(Math.abs(decision.meanDiff)) + ' 个百分点' : ''),
        { brand: true, tip: '绝对弱：班均未达 85% 且连续两次低于年级 5 个百分点，或得分率 60% 以下学生占比达到 30%；证据不足时标待确认。相对弱：班均未达 85% 且低于年级，但未达绝对弱条件。本卡只列弱科及判定依据。六科平均只是整体水平参考，不参与判定。' }) +
      card('学生个人建议', weakInfo.recommendationTotal + ' <small>/ ' + STUDENTS.length + ' 人</small>',
        '重点提升 ' + weakInfo.priorityTotal + ' 人 · 优先巩固 ' + weakInfo.relativeTotal + ' 人' +
          (weakInfo.relativeAboveAllTotal ? '（含 ' + weakInfo.relativeAboveAllTotal + ' 人各科都高于班均）' : '') +
          (weakInfo.submitTotal ? ' · 先抓提交 ' + weakInfo.submitTotal + ' 人' : '') +
          ' · <span class="kpi-card__more">查看名单 ›</span>',
        { jump: 'focusStudentSection', tip: '每名学生都会拿到一科个人建议，分两类：得分率不到 60%，或本人未达 85% 且比班均低至少 10 个百分点的学生列为重点提升，其余学生按相对最弱给出优先巩固。优先巩固不等同于薄弱学科。点卡片查看名单。' }) +
      card('低于年级均学科', below.length + ' <small>/ ' + decision.pool.length + ' 科</small>',
        below.length ? below.map(function (s) { return s.name; }).join('、') + '（略低不等于弱科）' :
          '全部高于年级均',
        { tip: '班级得分率低于同卷年级得分率的学科数。略低不等于绝对弱：是否绝对弱由班均绝对水平、连续两次同向证据与低分面占比决定。' }) +
      '</div>';
  }

  /* ==================== 6. 渲染：一、班级各学科 ==================== */

  function focusConclusionTag(label) {
    var cls = 'tag tag--none';
    if (label === '绝对弱') cls = 'tag tag--danger';
    else if (/待确认|相对弱|先抓提交/.test(label)) cls = 'tag tag--late';
    return '<span class="' + cls + '">' + label + '</span>';
  }

  function sectionOne(shown, weakInfo, decision) {
    var byRate = shown.slice().sort(function (a, b) { return a.avg - b.avg; });
    var tableRows = shown.slice().sort(function (a, b) {
      var ac = decision.candidates.indexOf(a);
      var bc = decision.candidates.indexOf(b);
      if (ac >= 0 || bc >= 0) {
        if (ac < 0) return 1;
        if (bc < 0) return -1;
        return ac - bc;
      }
      var ad = isNum(a.diff) ? a.diff : 999;
      var bd = isNum(b.diff) ? b.diff : 999;
      return ad - bd;
    });

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

    var trs = tableRows.map(function (s) {
      var weakRow = decision.candidates.indexOf(s) >= 0;
      var conclusion = subjectConclusion(s, decision);
      return '<tr' + (weakRow ? ' class="is-top"' : '') + '>' +
        '<td class="cell-strong">' + s.name +
          ' <span class="cell-hint">' + s.hwCount + ' 份</span>' +
          (s.exempt ? ' <span class="tag tag--ceiling">满分区</span>' : '') + '</td>' +
        '<td><span class="diag-evidence diag-evidence--' + s.evidence + '">' + evidenceText(s.evidence) +
          '</span><br><span class="cell-hint">' + timingText(s.timing) + '</span></td>' +
        '<td class="cell-num">' + s.submitted + '/' + s.due + '</td>' +
        '<td class="cell-num">' + Math.round(s.missingQ * 100) + '%</td>' +
        '<td class="cell-num cell-strong">' + f1(s.avg) + '%</td>' +
        '<td class="cell-num cell-muted">' + f1(s.gradeAvg) + '%</td>' +
        '<td class="cell-num ' + deltaCls(s.diff) + '">' + signed(s.diff) + '</td>' +
        '<td class="cell-num cell-muted">' + f1(100 - s.avg) + '</td>' +
        '<td class="cell-num">' + f1(s.median) + '</td>' +
        '<td class="cell-num">' + f1(s.sd) + '</td>' +
        '<td class="cell-num">' + f1(s.max) + '</td>' +
        '<td class="cell-num">' + f1(s.min) + '</td>' +
        '<td class="cell-dist cell-dist--ex"><b>' + s.dist.ex + '</b><span>' + pctOf(s.dist.ex, s.n) + '</span></td>' +
        '<td class="cell-dist"><b>' + s.dist.good + '</b><span>' + pctOf(s.dist.good, s.n) + '</span></td>' +
        '<td class="cell-dist"><b>' + s.dist.pass + '</b><span>' + pctOf(s.dist.pass, s.n) + '</span></td>' +
        '<td class="cell-dist cell-dist--weak"><b>' + s.dist.weak + '</b><span>' + pctOf(s.dist.weak, s.n) + '</span></td>' +
        '<td class="cell-num">' + f1(s.trigger) + '</td>' +
        '<td>' + focusConclusionTag(conclusion) + '</td>' +
        '</tr>';
    }).join('');

    /* 班级与学生结论分离：班级弱科清单不影响学生个别提升 */
    var bullets = '';
    var ceiling = shown.filter(function (s) { return s.exempt; });
    var allWeak = decision.absolute.concat(decision.pending);
    if (allWeak.length) {
      bullets += '<li><span class="diagnosis__rank">1</span><b>绝对弱 ' + allWeak.length + ' 科：</b>' +
        allWeak.map(function (s) {
          var reasons = [];
          if (classGapHit(s)) {
            reasons.push('班均 ' + f1(s.avg) + '%，比年级低 ' + f1(s.gradeGap) +
              ' 个百分点' + (s.actionConfirmed ? '，连续两次同向' : ''));
          }
          if (s.lowShare >= CLASS_LOW_SHARE_MIN) {
            reasons.push('得分率不到 60% 的 ' + s.dist.weak + ' 人（' + pctOf(s.dist.weak, s.n) + '）');
          }
          return '<b>' + s.name + '</b>（' + reasons.join('；') +
            (decision.pending.indexOf(s) >= 0 ? '；待确认，连续证据尚未形成' : '') + '）';
        }).join('、') + '。</li>';
    } else {
      bullets += '<li><span class="diagnosis__rank">1</span><b>没有绝对弱科。</b></li>';
    }
    if (decision.relative.length) {
      bullets += '<li>相对弱：<b>' + decision.relative.map(function (s) {
        return s.name + '（比年级低 ' + f1(s.belowGrade) + ' 个百分点）';
      }).join('、') + '</b>，班均未达 85% 且低于年级，但未达绝对弱条件。</li>';
    }

    var w1 = weakInfo.weakTop[0];
    var w2 = weakInfo.weakTop[1];
    bullets += '<li>学生侧：<b>' + weakInfo.recommendationTotal + ' 人</b>均有个人补弱学科，其中重点提升 <b>' +
      weakInfo.priorityTotal + ' 人</b>、优先巩固 <b>' + weakInfo.relativeTotal + ' 人</b>' +
      (weakInfo.relativeAboveAllTotal ? '（其中 ' + weakInfo.relativeAboveAllTotal + ' 人各科都高于班均）' : '') + '；' +
      (w1 ? '明确短板集中在 <b>' + w1.name + '（' + w1.count + ' 科次）</b>' +
        (w2 ? ' 与 <b>' + w2.name + '（' + w2.count + ' 科次）</b>' : '') + '。' :
        '当前没有科次同时达到「未达 85% 且低于班均 10 个百分点」，未触发学生仍按相对最弱科安排巩固。') +
      '班级弱科与学生个人方向分开看，互不影响。</li>';

    if (decision.submitWarn.length) {
      bullets += '<li>提交预警：<b>' + decision.submitWarn.map(function (s) {
        return s.name + '（' + Math.round(s.missingQ * 100) + '%）';
      }).join('、') + '</b> 未交率超过 ' + Math.round(SUBMIT_Q_HIGH * 100) +
        '%，先抓提交，不用零分拉低能力判断。</li>';
    }

    if (ceiling.length) {
      bullets += '<li>满分区科目（多数学生已近满分）：<b>' + ceiling.map(function (s) {
        return s.name + '（多数学生已达 ' + f1(s.p75) + '% 左右）';
      }).join('、') + '</b> 常规小分差不会触发相对判弱；但其中学生低于 60% 时照常进入个人建议，低分面达到 ' +
        Math.round(CLASS_LOW_SHARE_MIN * 100) + '% 时该科仍判绝对弱。</li>';
    }

    return '<section class="focus-section">' +
      '<span class="prd-badge" data-prd="XK-07" title="查看 PRD XK-07：班级各学科得分率与分布">XK-07</span>' +
      '<div class="focus-section__head">' +
        '<span class="focus-section__idx">一</span>' +
        '<h2 class="focus-section__title">班级各学科得分率与分布</h2>' +
        tip('<span>条形从低到高排，长短是班均得分率；竖线是年级均得分率；最右边数字是班级比年级高或低多少个百分点。</span>' +
          '<span>表格里的「学生分化」是标准差：数值越大，说明这一科学生之间分数拉得越开，只看班均会漏掉两头。</span>' +
          '<span>「提升提醒线」固定为 ' + STUDENT_TRIGGER_PP + ' 个百分点，但还必须同时满足本人得分率未达 85%：高分学生之间的小分差不会被当成短板。</span>' +
          '<span>判断顺序：达到两条件之一即判绝对弱——班均未达 85% 且最近两次都比年级低 ' + CLASS_ACTION_PP +
            ' 个百分点以上，或得分率 60% 以下的学生达到 ' + Math.round(CLASS_LOW_SHARE_MIN * 100) +
            '%；班均未达 85% 且低于年级但未达条件的列为相对弱。只出现一次或只有 1 份作业时标待确认，超过近 3 天的数据只作趋势参考。</span>' +
          '<span>「可提升空间」= 100 − 班均：同样低 3 个百分点，一科还剩 30 个百分点的提升空间、另一科只剩 5 个百分点，该先抓哪个一目了然。</span>') +
      '</div>' +
      '<div class="focus-split">' +
        '<div>' +
          '<div class="bar-list">' + bars + '</div>' +
          '<div class="bar-legend">' +
            '<span><i></i>班级均得分率</span>' +
            '<span><i class="is-mark"></i>年级均</span>' +
            '<span>条形右端为较年级的百分点</span>' +
          '</div>' +
        '</div>' +
        '<aside class="diagnosis">' +
          '<h3 class="diagnosis__title">班级弱科与判定依据</h3>' +
          '<ul class="diagnosis__list">' + bullets + '</ul>' +
        '</aside>' +
      '</div>' +
      '<div class="table-card">' +
        '<div class="table-scroll">' +
          '<table class="data-table data-table--compact data-table--stat">' +
            '<thead><tr>' +
              '<th>学科</th><th title="有效作业份数，下方小字为数据时效">作业份数</th><th title="交上来的人次 / 应交人次">提交</th><th title="未交人次 ÷ 应交人次">未交率</th>' +
              '<th title="这一科所有作业的得分合计 ÷ 满分合计">班均得分率</th><th title="同一套作业的年级得分率">年级得分率</th><th title="班级 − 年级，单位：个百分点">较年级</th>' +
              '<th title="100 − 班均得分率：这一科全班一共还有多少分可提升">可提升空间</th>' +
              '<th title="把全班得分率从低到高排，正中间那个数">中位数</th><th title="标准差：越大说明学生之间分数拉得越开">学生分化</th><th>最高</th><th>最低</th>' +
              '<th>优 ≥85%</th><th>良 70–84%</th><th>中 60–69%</th><th>低分 &lt;60%</th>' +
              '<th title="固定 10 个百分点；同时要求本人得分率未达 85%，才算相对短板">提醒线</th><th title="绝对弱 / 相对弱为能力判定；先抓提交、趋势复核为数据状态">班级判定</th>' +
            '</tr></thead>' +
            '<tbody>' + trs + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
      '</section>';
  }

  /* ==================== 7. 渲染：二、学生离均差热力 ==================== */

  function heatLegend() {
    var items = [
      ['heat-n3', '远低于班均'], ['heat-n2', '明显偏低'], ['heat-n1', '偏低'],
      ['heat-flat', '接近班均'], ['heat-p1', '偏高'], ['heat-p2', '明显偏高'], ['heat-p3', '远高于班均']
    ];
    return '<div class="heat-legend"><span>上排：较班均（百分点） · 下排：得分率（%）</span>' +
      items.map(function (it) {
        return '<em>·</em><i class="' + it[0] + '">' + it[1] + '</i>';
      }).join('') +
      '<em>·</em><span>红色越深 = 离班均越远（统一按 10 个百分点分档；满分区里接近满分的格子淡化显示）</span></div>';
  }

  function sectionTwo(shown, weakInfo) {
    var list = weakInfo.rows.slice();
    if (ui.weakOnly) {
      list = list.filter(function (r) { return r.priority && !r.priority.relative; });
    }
    list.sort(compareStudentRows);

    var head = '<tr><th>学号</th><th>姓名</th>' +
      shown.map(function (s) {
        /* 表头只留两项：班均与作业份数；提醒线数值放到鼠标悬停说明，列宽不做宽 */
        var headTip = s.name + '：班级均 ' + f1(s.avg) + '%（' + evidenceText(s.evidence) + '作业）' +
          (s.exempt ? '，多数学生已近满分；相对判弱仍以未达 85% 为前提' :
            '，未达 85% 且低于班均 ' + f1(s.trigger) + ' 个百分点算需要提升');
        /* 「满分区」只在表头统一标一次，格子内不再逐格打角标 */
        return '<th title="' + headTip + '">' + s.name +
          (s.exempt ? ' <span class="th-sub">满分区</span>' : '') +
          '<br><span class="th-sub">班均 ' + f1(s.avg) + '% · ' +
          evidenceText(s.evidence) + '</span></th>';
      }).join('') +
      '<th>个人补弱学科</th><th>该科得分率</th><th>建议类型</th></tr>';

    var body = list.map(function (r) {
      var cells = r.cells.map(function (c) {
        if (!isNum(c.v)) {
          return '<td class="heat-cell heat-na">—' +
            (c.submitWarn ? '<em>先抓提交</em>' : '') + '</td>';
        }
        /* 所有学科统一用固定 10 个百分点作色阶刻度，σ 不再参与颜色或判定。 */
        var scale = isNum(c.t) ? c.t : STUDENT_TRIGGER_PP;
        /* 满分区里真正接近满分的格才淡化字色；已经明显偏低的格保持清晰，不能又淡又说“不判” */
        var dim = c.exempt && Math.abs(c.d) <= scale;
        var cls = (c.timing === 'history' ? 'heat-flat' : heatClass(c.d, scale)) +
          (c.fail ? ' is-fail' : '') + (dim ? ' is-ceiling' : '');
        var cellTip = c.sub + '：得分率 ' + f1(c.v) + '%，比班均' +
          (c.d >= 0 ? '高 ' : '低 ') + f1(Math.abs(c.d)) + ' 个百分点，提醒线 ' +
          f1(c.t) + ' 个百分点；相对判弱同时要求本人未达 85%' +
          '，' + timingText(c.timing) + (c.fail ? '，低分' : '');
        return '<td class="heat-cell ' + cls + '" title="' + cellTip + '">' +
          '<b>' + signed(c.d) + '</b><span>' + f1(c.v) + '%</span>' +
          (c.fail ? '<em>低分</em>' : (c.short ? '<em>短板</em>' : '')) +
          '</td>';
      }).join('');

      var tagCls = r.priority ? (r.priority.relative ? 'tag tag--relative' :
        (r.urgent ? 'tag tag--danger' : (r.temporary ? 'tag tag--late' : 'tag tag--brand'))) :
        (r.submitOnly ? 'tag tag--late' : 'tag tag--none');
      var tag = '<span class="' + tagCls + '">' + r.status + '</span>';
      var p = r.priority;

      return '<tr' + (r.urgent ? ' class="is-urgent"' : '') + '>' +
        '<td class="cell-num">' + r.stu.id + '</td>' +
        '<td>' + r.stu.name + '</td>' +
        cells +
        '<td class="cell-strong">' + (p ? p.sub +
          ' <span class="cell-hint">' +
          (p.relative ? (Math.abs(p.d) < 0.05 ? '相对最弱 · 与班均持平' :
            '相对最弱 · ' + (p.d < 0 ? '低于班均 ' : '仍高于班均 ') +
            f1(Math.abs(p.d)) + ' 个百分点') :
            (p.short ? '重点 · 低于班均 ' + f1(Math.abs(p.d)) + ' 个百分点' : '重点 · 低分')) +
          '</span>' : '—') + '</td>' +
        '<td class="cell-num' + (p && p.fail ? ' cell-dev-down' : '') + '">' +
          (p ? f1(p.v) + '%' + (p.fail ? ' <span class="cell-hint">低分</span>' : '') : '—') + '</td>' +
        '<td>' + tag + '<span class="cell-advice">' + r.advice + '</span></td>' +
        '</tr>';
    }).join('');

    var empty = list.length ? '' :
      '<tr><td colspan="' + (shown.length + 5) + '"><div class="empty-state">' +
      '当前筛选下没有符合条件的学生</div></td></tr>';

    return '<section class="focus-section" id="focusStudentSection">' +
      '<span class="prd-badge" data-prd="XK-08" title="查看 PRD XK-08：学生各科得分热力表">XK-08</span>' +
      '<div class="focus-section__head">' +
        '<span class="focus-section__idx">二</span>' +
        '<h2 class="focus-section__title">学生各科得分与班均对比（热力图）</h2>' +
        tip('<span>格子上排数字 = 该生这一科得分率减去班均得分率，正数高于班均，单位是百分点；下排数字 = 该生这一科的得分率。</span>' +
          '<span>颜色按与班均的差距分档：相差不到 10 个百分点的为灰色（接近班均），低 10～15 个百分点浅红，低 15～30 个百分点偏红，低 30 个百分点以上深红；高于班均的一侧用绿色对称表示。</span>' +
          '<span>个人补弱学科怎么选：先看有没有低分（得分率不到 60%），或本人未达 85% 且低于班均 10 个百分点的重点提升项；若没有，再按「（个人 − 班均）÷ 10」选出相对最弱的一科。</span>' +
          '<span>「优先巩固」只表示个人各科里的学习优先级，不等同于薄弱学科；即使该科仍高于班均，也可作为巩固方向。只有 1 份作业时显示「暂定」。</span>' +
          '<span>未交超过 ' + Math.round(SUBMIT_Q_HIGH * 100) +
            '% 的科目先抓提交；超过近 3 天的数据不进推荐。满分区仍标在表头，但其中学生低于 60% 或明显掉队时，照常进入个人建议。</span>') +
        '<div class="focus-section__actions">' +
          '<label class="checkbox checkbox--inline">' +
            '<input type="checkbox" data-focus-weak' + (ui.weakOnly ? ' checked' : '') + ' />' +
            '<span class="checkbox__box"></span><span>只看重点提升学生（' + weakInfo.priorityTotal + ' 人）</span>' +
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
      '</section>';
  }

  /* ==================== 8. 渲染：三、作业明细 ==================== */

  function sectionThree(ids, all) {
    var statMap = {};
    all.forEach(function (s) { statMap[s.name] = s; });

    var list = selectedHomeworks(ids);
    if (!list.length) {
      return '<section class="focus-section">' +
        '<span class="prd-badge" data-prd="XK-09" title="查看 PRD XK-09：作业列表">XK-09</span>' +
        '<div class="focus-section__head"><span class="focus-section__idx">三</span>' +
        '<h2 class="focus-section__title">作业列表</h2></div>' +
        '<div class="empty-state">当前筛选下没有可展示的作业</div></section>';
    }

    var trs = list.map(function (hw) {
      var st = statMap[hw.subject];
      var rate = st ? st.hwMap[hw.id] : null;
      var diff = isNum(rate) && isNum(hw.gradeRate) ? rate - hw.gradeRate : null;
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
        '<td class="cell-num cell-muted">' + f1(hw.gradeRate) + '%</td>' +
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
      '<span class="prd-badge" data-prd="XK-09" title="查看 PRD XK-09：作业列表">XK-09</span>' +
      '<div class="focus-section__head">' +
        '<span class="focus-section__idx">三</span>' +
        '<h2 class="focus-section__title">作业列表</h2>' +
        tip('<span>同一学科可以有多份作业，没有主次，都按满分计入该科得分率；学科后面的 1/2 表示这一科在当前筛选里的第几份。</span>' +
          '<span>「较年级」= 这份作业的得分率减去这份作业的年级得分率，和学科层的「较年级」同一个口径，改筛选后两边一起重算。</span>') +
        '<span class="focus-section__note">共 ' + list.length + ' 份作业 · 合计提交 ' +
          submit + '/' + due + '（' + pctOf(submit, due) + '）</span>' +
      '</div>' +
      '<div class="table-card">' +
        '<div class="table-scroll">' +
          '<table class="data-table data-table--compact">' +
            '<thead><tr>' +
              '<th>学科</th><th>作业名称</th><th>满分</th><th>提交</th><th>提交率</th>' +
              '<th>平均分</th><th>得分率</th><th>年级得分率</th><th>较年级</th><th>批改时间</th>' +
            '</tr></thead><tbody>' + trs + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
      '</section>';
  }

  /* ==================== 9. 对外渲染入口 ==================== */

  function render(root, opts) {
    if (!root) return;
    opts = opts || {};
    lastRender = { root: root, opts: opts };

    var ids = opts.homeworks || HOMEWORKS.map(function (h) { return h.id; });
    var all = computeAll(ids);

    /* 口径说明收进标题行：写进壳页预留的槽位；独立报表页无槽位则不显示 */
    var doc = root.ownerDocument || document;
    var slot = doc.getElementById('focusHintSlot');
    if (slot) slot.innerHTML = hintHTML(opts, all);

    if (!all.length) {
      root.innerHTML = '<div class="focus-section"><div class="empty-state">' +
        '未选择任何作业，请在「调整筛选」中至少保留一份作业</div></div>';
      return;
    }

    var html = '';
    var weakInfo = weakestOf(all);
    var decision = decideClass(all);
    html += decisionHTML(decision);
    html += kpiHTML(all, weakInfo, decision);
    html += sectionOne(all, weakInfo, decision);
    html += sectionTwo(all, weakInfo);
    html += sectionThree(ids, all);

    root.innerHTML = html;
  }

  /* 热力表「只看需要提升的学生」开关：模块内自管理，两处引用均生效 */
  document.addEventListener('change', function (e) {
    var input = e.target && e.target.closest ? e.target.closest('[data-focus-weak]') : null;
    if (!input || !lastRender) return;
    ui.weakOnly = input.checked;
    render(lastRender.root, lastRender.opts);
  });

  /* KPI 卡下钻：点「学生个人建议」直达下方学生名单，落点闪一次供定位 */
  function jumpToSection(id) {
    var section = id ? document.getElementById(id) : null;
    if (!section) return;
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    section.classList.remove('is-flash');
    void section.offsetWidth;
    section.classList.add('is-flash');
    setTimeout(function () { section.classList.remove('is-flash'); }, 1900);
  }

  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest) return;
    if (e.target.closest('.q-tip')) return;
    var card = e.target.closest('[data-focus-jump]');
    if (!card) return;
    jumpToSection(card.getAttribute('data-focus-jump'));
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (!e.target || !e.target.closest) return;
    var card = e.target.closest('[data-focus-jump]');
    if (!card) return;
    e.preventDefault();
    jumpToSection(card.getAttribute('data-focus-jump'));
  });

  /* ==================== 10. 导出数据 ==================== */

  function exportRows(ids) {
    var all = computeAll(ids);
    var decision = decideClass(all);
    var allWeak = decision.absolute.concat(decision.pending);
    var classSummary = (allWeak.length
      ? '绝对弱：' + allWeak.map(function (s) {
          return s.name + (decision.pending.indexOf(s) >= 0 ? '(待确认)' : '');
        }).join('、')
      : '无绝对弱科') +
      (decision.relative.length
        ? '；相对弱：' + decision.relative.map(function (s) { return s.name; }).join('、')
        : '');
    var rows = [[
      '跨学科分析 · 班级报表 · ' + TODAY,
      classSummary +
      '；绝对弱 = 班均 <85% 且连续两次低于年级 ' + CLASS_ACTION_PP +
      ' 个百分点，或得分率 60% 以下学生 ≥' + Math.round(CLASS_LOW_SHARE_MIN * 100) +
      '%；相对弱 = 班均 <85% 且低于年级但未达绝对弱；学生提醒线：' + STUDENT_TRIGGER_PP +
      ' 个百分点，仅适用于本人得分率 <85%；证据不足时标待确认'
    ]];
    rows.push(['学科', '作业份数', '证据（作业份数）', '数据时效', '提交(人次)', '未交率',
      '班均得分率', '年级得分率', '较年级(百分点)', '可提升空间', '中位数', '学生分化(标准差)', '75 分位',
      '最高', '最低', '优(得分率≥85%)', '良(70~84%)', '中(60~69%)', '低分(<60%)', '低分学生占比', '提醒线(百分点)', '满分区(P75≥95%)', '班级判定']);
    all.slice().sort(function (a, b) {
      var ad = isNum(a.diff) ? a.diff : 999;
      var bd = isNum(b.diff) ? b.diff : 999;
      return ad - bd;
    }).forEach(function (s) {
      rows.push([s.name, s.hwCount, evidenceText(s.evidence), timingText(s.timing),
        s.submitted + '/' + s.due, Math.round(s.missingQ * 100) + '%',
        f1(s.avg), f1(s.gradeAvg), signed(s.diff), f1(100 - s.avg),
        f1(s.median), f1(s.sd), f1(s.p75), f1(s.max), f1(s.min),
        s.dist.ex, s.dist.good, s.dist.pass, s.dist.weak, pctOf(s.dist.weak, s.n),
        s.exempt ? '—' : f1(s.trigger), s.exempt ? '是' : '否', subjectConclusion(s, decision)]);
    });

    rows.push([]);
    rows.push(['学号', '姓名'].concat(all.map(function (s) { return s.name + '得分率'; }))
      .concat(all.map(function (s) { return s.name + '较班均'; }))
      .concat(['个人补弱学科', '建议类型', '证据强度', '该科得分率', '该科较班均', '建议科低于班均(百分点)',
        '短板', '低分科目', '个人建议类型', '一句话建议']));

    var info = weakestOf(all);
    info.rows.slice().sort(compareStudentRows).forEach(function (r) {
      var p = r.priority;
      var line = [r.stu.id, r.stu.name];
      r.cells.forEach(function (c) { line.push(isNum(c.v) ? f1(c.v) : '—'); });
      r.cells.forEach(function (c) { line.push(isNum(c.d) ? signed(c.d) : '—'); });
      line.push(p ? p.sub : '—', p ? (p.relative ? '优先巩固' : '重点提升') : '—',
        p ? evidenceText(p.evidence) : '—', p ? f1(p.v) : '—',
        p ? signed(p.d) : '—', p ? (p.relative ? '未过线' : f1(Math.abs(p.d))) : '—',
        r.short ? '是' : '否', r.failed.length ? r.failed.join('、') : '—', r.status, r.advice);
      rows.push(line);
    });

    rows.push([]);
    rows.push(['学科', '作业名称', '满分', '提交', '得分率', '年级率', '较年级', '批改时间']);
    selectedHomeworks(ids).forEach(function (hw) {
      var st = null;
      all.forEach(function (s) { if (s.name === hw.subject) st = s; });
      var rate = st ? st.hwMap[hw.id] : null;
      rows.push([hw.subject, hw.name, hw.full,
        (st ? (st.hwCounts[hw.id] || 0) : 0) + '/' + hw.due,
        f1(rate), f1(hw.gradeRate),
        isNum(rate) ? signed(rate - hw.gradeRate) : '—', hw.graded]);
    });
    return rows;
  }

  /* ==================== 11. 数据注入契约 ==================== */

  /*
    真实接入入口。渲染层只吃这份契约，换数据源不改任何渲染代码。
      configure({
        demo: false,                        // 关闭演示生成，逐作业得分率必须来自 rows[i].hw
        homeworks: [{ id, subject, name, full, due, handed, date, graded, gradeRate }],
        rows: [['学号', '姓名', 语, 数, 英, 物, 化, 生, { hwId: 得分率, ... }]]
      })
    约定：
      · gradeRate 必须是「同一份作业」的年级得分率，否则差值列又变成不同源的两个数；
      · rows[i] 第 9 位起为逐作业得分率映射，缺项按未提交处理（不按 0 分计）；
      · HOMEWORKS / SUBJECTS 数组身份保持不变，壳页（app.js）持有的引用继续有效。
  */
  function configure(patch) {
    patch = patch || {};
    if (patch.demo === false) DEMO = false;
    if (Array.isArray(patch.homeworks)) {
      HOMEWORKS.length = 0;
      Array.prototype.push.apply(HOMEWORKS, patch.homeworks);
    }
    if (Array.isArray(patch.rows)) {
      ROWS.length = 0;
      Array.prototype.push.apply(ROWS, patch.rows);
    }
    rebuildHwIndex();
    if (lastRender) render(lastRender.root, lastRender.opts);
  }

  global.FocusReport = {
    TODAY: TODAY,
    TODAY_LABEL: TODAY_LABEL,
    SUBJECTS: SUBJECTS,
    HOMEWORKS: HOMEWORKS,
    HW_BY_SUBJECT: HW_BY_SUBJECT,
    STUDENTS: STUDENTS,
    CUT: CUT,
    computeAll: computeAll,
    weakestOf: weakestOf,
    decideClass: decideClass,
    exportRows: exportRows,
    configure: configure,
    render: render,
    isDemo: function () { return DEMO; }
  };
})(window);
