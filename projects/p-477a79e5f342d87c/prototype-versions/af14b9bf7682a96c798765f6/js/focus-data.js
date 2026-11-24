/* ==========================================================================
   跨学科分析 · 数据层 + 报表渲染层（v2 判定口径）
   --------------------------------------------------------------------------
   同一份报表被两处引用，避免口径漂移：
     1) index.html → 左侧【跨学科分析】视图（壳页负责筛选，本文件只渲染报表主体）
     2) 高三34班_跨学科分析报表_最近批改.html → 独立可分享报表

   v5 逐学科可配置规则版：
     1. 聚合：学科得分率 = Σ(各作业得分) / Σ(各作业满分)，按满分加权；
        班级与学科组使用同一作业集合、同一权重，缺交不按 0 分。
     2. 证据：A≥3 份 / B=2 份 / C=1 份；C 级只给临时建议。
        判定使用选中范围内的全部作业（最长 30 天），不再按作业日期剔除数据。
     3. 每科独立设置达标线、低分线、班级/学生差距线、低分面、未交率闸门与确认次数；
        未设置时使用常规默认值，难度预设只带入达标线与低分线。
     4. 班级明确短板由低分面或连续班均差通道触发；学生重点提升由绝对低分或相对偏低触发。
        所有判定、热力色阶、建议与导出均读取本科实际规则，而非全局固定阈值。
     5. 标准差只作「得分分散程度」展示，不参与判定；P75 ≥95% 的科目仍标「满分区」，
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

  /* 展示分档：优 ≥85% / 良 70~84% 固定；中/低分以逐科低分线为界。 */
  var CUT = { excellent: 85, good: 70, pass: 60 };

  /* 演示数据拆分幅度：第一份整体偏高、第二份对称下压，保证按满分加权后仍等于基准率 */
  var SPLIT = 3.2;

  /* 天花板判定线：学生得分率 P75 ≥ 95% 视为该科已被计分上限压住 */
  var CEILING_P75 = 95;

  /*
    常规默认教学口径（尚无教研校准，教师可按学科调整）：
      · 达标线 85%、学生低分线 60%、学生提醒线 10 个百分点；
      · 班级判弱线 5 个百分点、连续确认 2 次；
      · 低分面 30%、未交率闸门 30%。
    标准差只保留为“得分分散程度”展示指标，不参与任何判定。
    这些默认值是便于教师理解和后续回测的暂行阈值，不是统计定律。
  */
  var STUDENT_TRIGGER_PP = 10;
  var CLASS_ACTION_PP = 5;
  var CLASS_CONFIRM_TIMES = 2;
  var CLASS_LOW_SHARE_MIN = 0.30;
  var SUBMIT_Q_HIGH = 0.30;

  /* 离差「基本持平」带：|班均 − 学科组均| < 1 个百分点时不判方向。
     学科组均本身有抽样波动，1pp 以内的差不足以支撑任何教学结论。 */
  var FLAT_PP = 1;

  /* 教师可调的逐学科规则：预设只负责带入数值，任何手动修改都标为自定义。 */
  var DIFFICULTY_PRESETS = {
    normal: { label: '常规', targetLine: 85, lowLine: 60 },
    hard: { label: '偏难', targetLine: 75, lowLine: 50 },
    easy: { label: '偏易', targetLine: 90, lowLine: 65 }
  };
  var SUBJECT_RULES = {};

  function numberOr(v, fallback, min, max) {
    var n = typeof v === 'number' ? v : parseFloat(v);
    if (!isNum(n)) n = fallback;
    return Math.max(min, Math.min(max, n));
  }

  function normalizeRule(patch) {
    patch = patch || {};
    var difficulty = patch.difficulty || 'normal';
    var preset = DIFFICULTY_PRESETS[difficulty] || DIFFICULTY_PRESETS.normal;
    var targetLine = numberOr(patch.targetLine, preset.targetLine, 1, 100);
    var lowLine = numberOr(patch.lowLine, preset.lowLine, 1, 69);
    if (lowLine >= targetLine) lowLine = Math.max(1, Math.min(69, targetLine - 1));
    return {
      difficulty: difficulty,
      targetLine: targetLine,
      lowLine: lowLine,
      classGap: numberOr(patch.classGap, CLASS_ACTION_PP, 1, 30),
      studentGap: numberOr(patch.studentGap, STUDENT_TRIGGER_PP, 1, 30),
      lowShare: numberOr(patch.lowShare, CLASS_LOW_SHARE_MIN * 100, 1, 100),
      missingRate: numberOr(patch.missingRate, SUBMIT_Q_HIGH * 100, 0, 100),
      confirmTimes: Math.round(numberOr(patch.confirmTimes, CLASS_CONFIRM_TIMES, 1, 5))
    };
  }

  function ruleFor(subject) {
    return normalizeRule(SUBJECT_RULES[subject]);
  }

  function difficultyLabel(rule) {
    var preset = DIFFICULTY_PRESETS[rule.difficulty];
    return preset ? preset.label : '自定义';
  }

  function configureRules(map) {
    SUBJECT_RULES = {};
    map = map || {};
    Object.keys(map).forEach(function (subject) {
      if (SUBJECTS.indexOf(subject) >= 0) SUBJECT_RULES[subject] = normalizeRule(map[subject]);
    });
  }

  function getRules() {
    var map = {};
    SUBJECTS.forEach(function (subject) { map[subject] = ruleFor(subject); });
    return map;
  }

  function getRulePreset(difficulty, current) {
    var rule = normalizeRule(current);
    var preset = DIFFICULTY_PRESETS[difficulty];
    if (!preset) {
      rule.difficulty = 'custom';
      return rule;
    }
    rule.difficulty = difficulty;
    rule.targetLine = preset.targetLine;
    rule.lowLine = preset.lowLine;
    return normalizeRule(rule);
  }

  function rulesText(all) {
    return all.map(function (s) {
      return s.name + '（' + difficultyLabel(s.rule) + '：达标 ' + f1(s.targetLine) +
        '%，低分 ' + f1(s.lowLine) + '%，班级差 ' + f1(s.actionLine) +
        ' 个百分点，学生差 ' + f1(s.trigger) + ' 个百分点）';
    }).join('；');
  }

  /*
    当日作业清单：同一学科可多份，作业之间无主次。
    gradeRate = 该校该作业的学科组得分率（与班均同一套作业口径；真实接入时由平台提供）。
  */
  var HOMEWORKS = [
    { id: 'yw1', subject: '语文', name: '知识清单1（文言实词与病句）', full: 40, due: 37, handed: 37, date: TODAY, scannedAt: '11-05 12:20', gradeRate: 79.4 },
    { id: 'yw2', subject: '语文', name: '古诗文默写（第3单元）', full: 20, due: 37, handed: 35, date: TODAY, scannedAt: '11-05 12:35', gradeRate: 76.7 },
    { id: 'sx1', subject: '数学', name: '高三数学周末测试（五）2026.11.02', full: 60, due: 37, handed: 37, date: TODAY, scannedAt: '11-05 08:15', gradeRate: 76.4 },
    { id: 'sx2', subject: '数学', name: '课堂限时练（导数应用）', full: 30, due: 37, handed: 37, date: TODAY, scannedAt: '11-05 08:20', gradeRate: 74.6 },
    { id: 'yy1', subject: '英语', name: '读后续写（二稿）', full: 25, due: 37, handed: 36, date: TODAY, scannedAt: '11-05 21:40', gradeRate: 86.2 },
    { id: 'yy2', subject: '英语', name: '听力42', full: 30, due: 37, handed: 34, date: TODAY, scannedAt: '11-05 09:05', gradeRate: 89.5 },
    { id: 'wl1', subject: '物理', name: '第九章 作业1 库仑定律 电场强度', full: 40, due: 37, handed: 37, date: TODAY, scannedAt: '11-05 14:30', gradeRate: 74.4 },
    { id: 'hx1', subject: '化学', name: '10月19日化学作业答题纸（电化学）', full: 50, due: 37, handed: 37, date: TODAY, scannedAt: '11-05 16:05', gradeRate: 71.2 },
    { id: 'sw1', subject: '生物', name: '限时练三（遗传规律）', full: 40, due: 37, handed: 37, date: TODAY, scannedAt: '11-05 19:50', gradeRate: 78.0 }
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

  /*
    演示班级二：高三35班（弱科示例），40 人。
    常规默认规则下，语文、数学各有 13 人得分率低于 60%，低分面分别为 32.5% 与 35%；
    两科班均同时低于同卷学科组 5 个百分点以上，因此都稳定触发班级明确短板。
    其余四科班均高于学科组，保留一组正常对照。
  */
  var CLASS35_ROWS = [
    ['43501', '赵子航', 52, 49, 87, 77, 71, 80],
    ['43502', '林雨桐', 55, 51, 90, 80, 74, 84],
    ['43503', '周嘉禾', 58, 53, 93, 75, 69, 77],
    ['43504', '吴思远', 53, 55, 86, 82, 76, 86],
    ['43505', '陈可欣', 56, 49, 89, 78, 72, 79],
    ['43506', '王子墨', 59, 51, 92, 84, 78, 83],
    ['43507', '李雨泽', 54, 53, 95, 76, 70, 81],
    ['43508', '张若熙', 57, 55, 88, 81, 75, 85],
    ['43509', '刘博文', 52, 49, 91, 79, 73, 78],
    ['43510', '杨欣怡', 55, 51, 94, 83, 77, 84],
    ['43511', '黄浩宇', 58, 53, 97, 77, 71, 82],
    ['43512', '徐嘉宁', 53, 55, 89, 82, 76, 86],
    ['43513', '孙一诺', 56, 49, 92, 78, 72, 80],
    ['43514', '马晨曦', 62, 59, 88, 80, 74, 81],
    ['43515', '朱语涵', 68, 65, 91, 76, 70, 78],
    ['43516', '胡俊熙', 74, 71, 94, 82, 76, 86],
    ['43517', '郭雨欣', 80, 77, 86, 74, 68, 76],
    ['43518', '何宇航', 86, 83, 89, 79, 73, 82],
    ['43519', '高梦琪', 65, 60, 92, 81, 75, 85],
    ['43520', '罗子涵', 71, 66, 95, 77, 71, 79],
    ['43521', '郑天佑', 77, 72, 87, 83, 77, 87],
    ['43522', '梁怡然', 83, 78, 90, 75, 69, 77],
    ['43523', '谢承泽', 89, 84, 93, 80, 74, 83],
    ['43524', '宋佳宁', 63, 61, 96, 82, 76, 86],
    ['43525', '唐子轩', 69, 67, 88, 78, 72, 80],
    ['43526', '韩雨晨', 75, 73, 91, 84, 78, 88],
    ['43527', '曹欣然', 81, 79, 94, 76, 70, 78],
    ['43528', '许嘉豪', 87, 85, 97, 81, 75, 84],
    ['43529', '邓思琪', 66, 62, 89, 77, 71, 80],
    ['43530', '冯宇辰', 72, 68, 92, 83, 77, 87],
    ['43531', '曾雅涵', 78, 74, 95, 79, 73, 82],
    ['43532', '彭子睿', 84, 80, 98, 85, 79, 89],
    ['43533', '吕梦瑶', 90, 86, 90, 75, 69, 77],
    ['43534', '苏浩宇', 64, 63, 93, 80, 74, 83],
    ['43535', '卢欣妍', 70, 69, 96, 82, 76, 86],
    ['43536', '蒋文博', 76, 75, 88, 78, 72, 79],
    ['43537', '蔡雨桐', 82, 81, 91, 84, 78, 88],
    ['43538', '贾子聪', 88, 87, 94, 76, 70, 78],
    ['43539', '丁佳怡', 67, 64, 87, 81, 75, 84],
    ['43540', '魏晨阳', 73, 70, 90, 79, 73, 82]
  ];

  /* 原始演示班快照：切回高三34班时恢复，不让班级切换污染基准数据 */
  var CLASS34_HOMEWORKS = cloneHomeworks(HOMEWORKS);
  var CLASS34_ROWS = cloneRows(ROWS);

  var STUDENTS = [];
  var HW_BY_SUBJECT = {};

  /* 作业行展示口径：已批改份数 = 该作业所属学科逐生得分率的有效人次（有分数即已批改），
     与学科统计表「提交」列同源，避免弹窗与报表出现两套人数；handed 为平台已交人次，缺省按应交人数兜底。
     已批改份数必须单独存放，不能覆盖 scannedAt，否则作业列表会把人数当成扫描时间显示。 */
  function attachHomeworkStats() {
    HOMEWORKS.forEach(function (hw) {
      var col = SUBJECTS.indexOf(hw.subject);
      var gradedCount = 0;
      if (col >= 0) {
        ROWS.forEach(function (row) { if (isNum(row[2 + col])) gradedCount += 1; });
      }
      var handed = isNum(hw.handed) ? hw.handed : hw.due;
      /* 兼容旧数据契约：历史字段 graded 曾是时间字符串 */
      if (!hw.scannedAt && typeof hw.graded === 'string') hw.scannedAt = hw.graded;
      hw.gradedCount = gradedCount;
      hw.handed = Math.max(gradedCount, handed);
      hw.gradePct = hw.handed ? Math.round(gradedCount / hw.handed * 100) : null;
    });
  }

  function cloneHomeworks(list) {
    return list.map(function (hw) {
      var copy = {};
      Object.keys(hw).forEach(function (k) { copy[k] = hw[k]; });
      return copy;
    });
  }

  function cloneRows(rows) {
    return rows.map(function (row) {
      return row.map(function (cell) {
        if (!cell || typeof cell !== 'object') return cell;
        var copy = {};
        Object.keys(cell).forEach(function (k) { copy[k] = cell[k]; });
        return copy;
      });
    });
  }

  function class35Homeworks() {
    return cloneHomeworks(CLASS34_HOMEWORKS).map(function (hw) {
      hw.due = 40;
      hw.handed = 40;
      return hw;
    });
  }

  function demoClassData(clazz) {
    if (clazz === '高三34班') {
      return { homeworks: cloneHomeworks(CLASS34_HOMEWORKS), rows: cloneRows(CLASS34_ROWS) };
    }
    if (clazz === '高三35班') {
      return { homeworks: class35Homeworks(), rows: cloneRows(CLASS35_ROWS) };
    }
    if (clazz === '高三36班') {
      /* 缺省示例：只有语文、英语两科有作业，其余学科无成绩。 */
      var allowed = ['语文', '英语'];
      var homeworks = cloneHomeworks(CLASS34_HOMEWORKS).filter(function (hw) {
        return allowed.indexOf(hw.subject) >= 0;
      });
      var rows = cloneRows(CLASS34_ROWS).map(function (row) {
        SUBJECTS.forEach(function (subject, i) {
          if (allowed.indexOf(subject) < 0) row[2 + i] = null;
        });
        return row;
      });
      return { homeworks: homeworks, rows: rows };
    }
    return null;
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

  /* 学生「关注」星标：本地持久化；file:// 下 localStorage 可能受限，全程 try/catch 兜底 */
  var WATCH_KEY = 'xkFocusWatched_v1';
  function loadWatched() {
    try {
      var raw = window.localStorage.getItem(WATCH_KEY);
      var obj = raw ? JSON.parse(raw) : {};
      return obj && typeof obj === 'object' ? obj : {};
    } catch (e) { return {}; }
  }
  function saveWatched(map) {
    try { window.localStorage.setItem(WATCH_KEY, JSON.stringify(map)); } catch (e) {}
  }

  /* 模块内 UI 状态（两处引用各自独立，互不影响） */
  var ui = { weakOnly: false, watched: loadWatched() };
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

  /* 窗口内的作业一律参与判定：timing 只用于标注「当日 / 区间」，不再剔除数据 */
  function timingOf(list) {
    if (!list.length) return 'none';
    var todayCount = list.filter(function (hw) { return hw.date === TODAY; }).length;
    return todayCount === list.length ? 'today' : (todayCount ? 'mixed' : 'recent');
  }

  function timingText(t) {
    return t === 'today' ? '当日作业' : (t === 'mixed' ? '区间含当日' :
      (t === 'recent' ? '区间不含当日' : '—'));
  }

  function round1(v) {
    return Math.round(v * 10) / 10;
  }

  function f1(v) {
    if (!isNum(v)) return '—';
    return round1(v).toFixed(1);
  }

  /* 表头区间用：整数不带小数点，非整数保留一位 */
  function numText(v) {
    if (!isNum(v)) return '—';
    var r = round1(v);
    return r % 1 === 0 ? String(r) : r.toFixed(1);
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

  /* 较学科组的颜色：低于学科组为红，达到或高于为绿；无值的科目保持中性色 */
  function deltaCls(v) {
    if (!isNum(v)) return 'delta--flat';
    return v < 0 ? 'delta--down' : 'delta--up';
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

  /* 离均差热力分档：每科以自己的学生提醒线 t 为刻度。 */
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
    「该次班均未达本科达标线」且「比同卷学科组低至少本科班级差距线」。
    同日作业没有更细时间时按当前作业顺序判断；中间断一次即停止。
  */
  function classActionStreak(list, hwMap, rule) {
    var ordered = list.slice().sort(function (a, b) {
      if (a.date === b.date) return list.indexOf(a) - list.indexOf(b);
      return a.date < b.date ? -1 : 1;
    });
    var streak = 0;
    for (var i = ordered.length - 1; i >= 0; i--) {
      var hw = ordered[i];
      var rate = hwMap[hw.id];
      var hit = isNum(rate) && isNum(hw.gradeRate) &&
        rate < rule.targetLine && hw.gradeRate - rate >= rule.classGap;
      if (!hit) break;
      streak++;
    }
    return streak;
  }

  /* ==================== 4. 指标计算 ==================== */

  function computeSubject(subject, ids) {
    var list = selectedHomeworks(ids).filter(function (h) { return h.subject === subject; });
    if (!list.length) return null;
    var rule = ruleFor(subject);

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

    /* 学科组均使用同一作业、同一有效人次×满分权重，避免缺交造成两侧权重不同源 */
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
      else if (v >= rule.lowLine) dist.pass++;
      else dist.weak++;
    });

    /* 天花板：P75 触及计分上限附近，剩余差异主要来自赋分颗粒度，不能用来判短板 */
    var exempt = isNum(p75) && p75 >= CEILING_P75;

    /* 学生提醒线只表示相对差距，实际还要通过本科达标线闸门。 */
    var trigger = rule.studentGap;

    var diff = isNum(avg) && isNum(gradeAvg) ? avg - gradeAvg : null;

    /*
      actionRatio 仅表达差距相对本科班级判弱线的倍数；是否判为明确短板，
      还要看班均是否未达本科达标线、以及连续同向次数是否达到本科要求。
    */
    var actionLine = rule.classGap;
    var actionStreak = classActionStreak(list, hwMap, rule);
    var actionConfirmed = actionStreak >= rule.confirmTimes;
    var belowGrade = isNum(diff) && diff < 0 ? -diff : 0;
    var actionRatio = belowGrade > 0 ? belowGrade / actionLine : null;

    return {
      name: subject,
      rule: rule,
      targetLine: rule.targetLine,
      lowLine: rule.lowLine,
      lowShareMin: rule.lowShare / 100,
      missingLimit: rule.missingRate / 100,
      confirmTimes: rule.confirmTimes,
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

  /* 参与班级比较的学科：有同卷学科组均即可；是否判弱另由绝对闸门判定 */
  function rankable(shown) {
    return shown.filter(function (s) { return isNum(s.diff); });
  }

  /* 班均差通道：班均未达本科达标线，且比同卷学科组低至少本科班级差距线。 */
  function classGapHit(s) {
    return isNum(s.avg) && s.avg < s.targetLine &&
      isNum(s.gradeGap) && s.gradeGap >= s.actionLine;
  }

  /* 班级结论允许为空：门槛未过线时，不再从六科里强制挑一个「最弱」 */
  function decideClass(shown) {
    var pool = rankable(shown);
    var submitWarn = shown.filter(function (s) { return s.missingQ > s.missingLimit; });
    var eligible = shown.filter(function (s) {
      return s.missingQ <= s.missingLimit &&
        (isNum(s.diff) || s.lowShare >= s.lowShareMin);
    });

    /*
      班级明确短板两条通道，任一命中即判明确短板，互不覆盖：
        · 低于本科低分线的人数占比达到本科低分面阈值；
        · 班均未达本科达标线，且班均差达到本科差距线。
    */
    var candidates = eligible.filter(function (s) {
      return s.lowShare >= s.lowShareMin || classGapHit(s);
    });

    candidates.forEach(function (s) {
      s.absoluteCandidate = s.lowShare >= s.lowShareMin;
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

    /* 班级相对短板：未达明确短板条件，但班均未达本科达标线且低于学科组。 */
    var relative = eligible.filter(function (s) {
      return candidates.indexOf(s) < 0 && s.avg < s.targetLine &&
        s.diff < 0 && isNum(s.actionRatio);
    }).sort(function (a, b) { return b.actionRatio - a.actionRatio; });

    /* 整体水平：六科「班均 − 学科组」的平均，教师可心算，只作文案修饰，不触发动作 */
    var diffs = shown.filter(function (s) { return isNum(s.diff); }).map(function (s) { return s.diff; });
    var meanDiff = diffs.length ? diffs.reduce(function (a, v) { return a + v; }, 0) / diffs.length : null;

    /*
      证据是否足以坐实明确短板：
        · 低分面通道：至少 2 份作业即可确认；
        · 班均差通道：最近连续同向次数须达到本科设置，否则标「待确认」。
      明确短板与相对短板都是清单，不再只取一科。
    */
    var absolute = [];
    var pending = [];
    candidates.forEach(function (s) {
      var unconfirmed = s.evidence === 'C' ||
        (classGapHit(s) && s.lowShare < s.lowShareMin && !s.actionConfirmed);
      (unconfirmed ? pending : absolute).push(s);
    });

    return {
      pool: pool, submitWarn: submitWarn, candidates: candidates,
      relative: relative, meanDiff: meanDiff,
      absolute: absolute, pending: pending
    };
  }

  /* 学科只标阶段性判定与数据状态，不输出教学组织方式 */
  function subjectConclusion(s, decision) {
    if (s.missingQ > s.missingLimit) return '先抓提交';
    if (decision.absolute.indexOf(s) >= 0) return '明确短板';
    if (decision.pending.indexOf(s) >= 0) return '短板待确认';
    if (decision.relative.indexOf(s) >= 0) return '相对短板';
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
      · 重点提升：本人未达本科达标线且离均差达到本科提醒线，或低于本科低分线。
        多科过线时先比是否低分，再用本科提醒线归一化偏离程度。
      · 优先巩固：没有重点候选时，仍从有效科次中选一科。相对分 = d / 本科提醒线，
        数值最小者就是该生各科中的相对最弱；即使仍高于班均，也只表示优先巩固。
      · 超过本科未交率闸门的科次先抓提交；满分区不单独豁免，
        达标线闸门已避开高分小分差被误判；低分通道仍对满分区生效。
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
          return c.submitWarn;
        }).map(function (c) { return c.sub; });
        return '先补交 ' + pending.join('、') + ' 的作业，交上来再判强弱。';
      }
      return '暂无可比较的成绩，先把最近几份作业交上来。';
    }
    var p = priority;
    if (p.fail) {
      return '先把 ' + p.sub + ' 得分率拉到 ' + f1(p.lowLine) + '%（现在 ' + f1(p.v) + '%），其他科目先不动。';
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
            submitWarn: q > st.missingLimit, severity: 0, relativeScore: null,
            lowLine: st.lowLine, targetLine: st.targetLine
          });
          return;
        }
        var d = isNum(st.avg) ? v - st.avg : null;
        var submitWarn = q > st.missingLimit;
        /* 相对判弱使用该生本科达标线与差距线，低分线独立触发。 */
        var short = !submitWarn && isNum(d) &&
          v < st.targetLine && d <= -st.trigger;
        var relativeScale = st.trigger;
        var cell = {
          sub: st.name, v: v, d: d, exempt: st.exempt,
          t: st.trigger, sd: st.sd, evidence: st.evidence, timing: st.timing,
          q: q, submitWarn: submitWarn,
          lowLine: st.lowLine, targetLine: st.targetLine,
          short: short,
          fail: v < st.lowLine,
          /* 低分严重度也按本科提醒线归一化，避免不同学科阈值导致排序偏斜。 */
          severity: short ? Math.max(0, -d / st.trigger) :
            (v < st.lowLine ? Math.max(0, (st.lowLine - v) / relativeScale) : 0),
          relativeScore: isNum(d) ? d / relativeScale : null,
          relative: false
        };
        cells.push(cell);
      });

      var candidates = cells.filter(function (c) {
        /* 近满分科目仍保留「不及格」通道：一个班都考 96 分时，不及格的学生照样要补 */
        return !c.submitWarn &&
          isNum(c.v) && (c.short || c.fail);
      }).sort(comparePriorityCells);
      var priority = candidates[0] || null;

      if (!priority) {
        var relativePool = cells.filter(function (c) {
          return !c.exempt && !c.submitWarn &&
            isNum(c.v) && isNum(c.relativeScore);
        });
        /* 若只剩近满分科目，也给出相对巩固方向，但不升级成「短板」 */
        if (!relativePool.length) {
          relativePool = cells.filter(function (c) {
            return !c.submitWarn &&
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
        return c.submitWarn;
      });
      var temporary = !!(priority && !priority.relative && priority.evidence === 'C');
      var status = priority ? (priority.relative ?
        (priority.evidence === 'C' ? '优先巩固·暂定' : '优先巩固') :
        (temporary ? '重点提升·暂定' : '重点提升')) :
        (submitOnly ? '先抓提交' : '待补数据');

      var shortCells = cells.filter(function (c) { return c.short; });
      var failed = cells.filter(function (c) {
        return c.fail;
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

  function kpiHTML(shown, weakInfo, decision) {
    var absolute = decision.absolute;
    var pending = decision.pending;
    var relative = decision.relative;

    /* 主值先回答「是哪几科」：科目名逐个标色，数量与状态降到小字与副行 */
    var subNames = function (list, tone) {
      return list.map(function (s) {
        return '<span class="kpi-name kpi-name--' + tone + '">' + s.name + '</span>';
      }).join('<span class="kpi-name__sep">、</span>');
    };

    var weakValue, weakSub;
    if (absolute.length) {
      weakValue = subNames(absolute, 'danger') +
        (pending.length ? '<span class="kpi-name__sep">、</span>' + subNames(pending, 'pending') : '') +
        '<small>' + absolute.length + ' 科明确短板</small>';
      weakSub = '已命中本科判弱条件，优先讲评' +
        (pending.length ? ' · 另有 ' + pending.length + ' 科待确认' : '') +
        (relative.length ? ' · 相对短板：' + relative.map(function (s) { return s.name; }).join('、') : '');
    } else if (pending.length) {
      weakValue = subNames(pending, 'pending') + '<small>' + pending.length + ' 科待确认</small>';
      weakSub = '已达短板条件但证据不足 · 看学科表「班级判定」列';
    } else if (relative.length) {
      weakValue = subNames(relative, 'relative') + '<small>' + relative.length + ' 科相对短板</small>';
      weakSub = '无明确短板 · 相对短板按低于学科组程度排序';
    } else {
      weakValue = '<span class="kpi-name kpi-name--none">—</span><small>无明显短板</small>';
      weakSub = '六科均未命中本科判弱条件';
    }

    var card = function (label, value, sub, opts) {
      opts = opts || {};
      return '<div class="kpi-card' + (opts.brand ? ' kpi-card--brand' : '') +
        (opts.jump ? ' kpi-card--link' : '') + '"' +
        (opts.jump ? ' data-focus-jump="' + opts.jump + '" role="button" tabindex="0"' : '') + '>' +
        '<div class="kpi-card__label">' + label + '</div>' +
        '<div class="kpi-card__value' + (opts.valueClass || '') + '">' + value + '</div>' +
        '<div class="kpi-card__sub">' + sub + '</div>' +
        '</div>';
    };

    return '<div class="kpi-row kpi-row--two">' +
      '<span class="prd-badge prd-badge-r" data-prd="XK-06" title="查看 PRD XK-06：KPI 概览卡片">XK-06</span>' +
      card('班级弱科', weakValue, weakSub, { brand: true, valueClass: ' kpi-card__value--names' }) +
      card('学生个人建议', weakInfo.priorityTotal + ' <small>人重点提升</small><span class="kpi-card__sep">·</span>' +
        weakInfo.relativeTotal + ' <small>人优先巩固</small>',
        (weakInfo.relativeAboveAllTotal ? '优先巩固含 ' + weakInfo.relativeAboveAllTotal + ' 人各科都高于班均 · ' : '') +
          (weakInfo.submitTotal ? '先抓提交 ' + weakInfo.submitTotal + ' 人 · ' : '') +
          '<span class="kpi-card__more">查看名单 ›</span>',
        { jump: 'focusStudentSection' }) +
      '</div>';
  }

  /* ==================== 6. 渲染：一、班级各学科 ==================== */

  function focusConclusionTag(label) {
    var cls = 'tag tag--none';
    if (label === '明确短板') cls = 'tag tag--danger';
    else if (/待确认|相对短板|先抓提交/.test(label)) cls = 'tag tag--late';
    return '<span class="' + cls + '">' + label + '</span>';
  }

  /*
    离差条形图：条长 = 班均得分率 − 学科组均得分率，零点 = 该科自己的学科组均。
    · 条长统一用「个百分点」，六科共用一把尺，才能横着比；
    · 条长不再编码绝对水平（哪科绝对高），改由右侧数字组「离差 · 班均 · 组均」回答，
      条上不叠加优/良/中/低分等级，也不叠加证据等级；
    · ±1pp 以内标「基本持平」；每行按该科班级差距线画判弱线；满分区叠斜纹。
  */
  function deviationChart(shown) {
    var rows = shown.slice().sort(function (a, b) {
      var ad = isNum(a.diff) ? a.diff : 999;
      var bd = isNum(b.diff) ? b.diff : 999;
      return ad - bd;
    });

    /* 轴幅：既装得下最大离差，也装得下各科判弱线；取 2 的整数倍，刻度才整齐 */
    var span = FLAT_PP;
    rows.forEach(function (s) {
      if (isNum(s.diff)) span = Math.max(span, Math.abs(s.diff));
      span = Math.max(span, s.actionLine);
    });
    var L = Math.max(2, Math.ceil((span * 1.15) / 2) * 2);
    var step = L >= 6 ? 2 : (L >= 3 ? 1 : 0.5);

    /* 百分点 → 轨道百分比：零点固定在 50%，±L 落在轨道两头 */
    var at = function (v) { return 50 + (v / (2 * L)) * 100; };
    var wide = function (v) { return (Math.abs(v) / (2 * L)) * 100; };

    var ticks = '';
    for (var i = 1; i < (2 * L) / step; i++) {
      var t = round1(-L + i * step);
      ticks += '<span style="left:' + at(t).toFixed(2) + '%">' +
        (t === 0 ? '0' : (t > 0 ? '+' : '-') + numText(Math.abs(t)) + 'pp') + '</span>';
    }

    /*
      判弱线：各科可设不同值，所以不以一条全局线表达。
      按数值去重后在标尺刻度下方各画一条橙色竖线：
        · 六科阈值相同时只有一条；不同时几条并列，位置差 = 阈值差；
        · 行内每行另有一条同位置的橙色虚线，上下对齐即知是哪一科。
    */
    var gapLines = [];
    rows.forEach(function (s) {
      var v = round1(s.actionLine);
      if (v > L) return;
      var hit = null;
      gapLines.forEach(function (g) { if (g.v === v) hit = g; });
      if (!hit) {
        hit = { v: v, subs: [] };
        gapLines.push(hit);
      }
      hit.subs.push(s.name);
    });
    gapLines.sort(function (a, b) { return a.v - b.v; });
    var gapMarks = gapLines.map(function (g) {
      return '<span class="dv-axis__gap" style="left:' + at(-g.v).toFixed(2) + '%" title="' +
        g.subs.join('、') + '的判弱线：低于学科组 ' + numText(g.v) +
        ' 个百分点（本科班级差距线）"></span>';
    }).join('');

    var axis = '<div class="dv-axis">' +
      '<span></span>' +
      '<span class="dv-axis__scale">' + ticks + gapMarks + '</span>' +
      '<span class="dv-axis__cap">离差 · 班均 · 组均</span>' +
    '</div>';

    var body = rows.map(function (s) {
      var d = isNum(s.diff) ? round1(s.diff) : null;
      var flat = d !== null && Math.abs(d) < FLAT_PP;
      var cls = 'dv-row__bar' + (d === null ? ' dv-row__bar--na'
        : (flat ? ' dv-row__bar--flat' : (d < 0 ? ' dv-row__bar--neg' : ' dv-row__bar--pos'))) +
        (s.exempt && d !== null ? ' dv-row__bar--hatch' : '');
      /* 持平条以零点居中，避免把 0.4pp 的差画成某个方向 */
      var style = d === null ? 'display:none'
        : (flat
            ? 'left:' + at(-Math.abs(d) / 2).toFixed(2) + '%;width:' + wide(d).toFixed(2) + '%'
            : (d < 0
                ? 'right:' + (100 - at(0)).toFixed(2) + '%;width:' + wide(d).toFixed(2) + '%'
                : 'left:' + at(0).toFixed(2) + '%;width:' + wide(d).toFixed(2) + '%'));

      var barTip = s.name + '：班均 ' + f1(s.avg) + '% − 学科组均 ' + f1(s.gradeAvg) + '% = ' +
        signed(d) + ' 个百分点' +
        (flat ? '（±' + numText(FLAT_PP) + 'pp 以内，视为基本持平）' : '') +
        (s.exempt ? '；满分区（P75 ≥' + numText(CEILING_P75) + '%），差值主要来自赋分颗粒度' : '');

      return '<div class="dv-row">' +
        '<span class="dv-row__label">' + s.name +
          (flat ? '<em class="dv-flat-tag" title="与学科组均相差 ' + f1(Math.abs(d)) +
            ' 个百分点，未超出 ±' + numText(FLAT_PP) + 'pp">基本持平</em>' : '') +
        '</span>' +
        '<span class="dv-row__track">' +
          '<span class="dv-row__band" style="left:' + at(-FLAT_PP).toFixed(2) +
            '%;width:' + wide(2 * FLAT_PP).toFixed(2) + '%"></span>' +
          (s.actionLine <= L
            ? '<span class="dv-row__gap" style="left:' + at(-s.actionLine).toFixed(2) +
              '%" title="判弱线：低于学科组 ' + numText(s.actionLine) + ' 个百分点（本科班级差距线）"></span>'
            : '') +
          '<span class="dv-row__zero"></span>' +
          '<span class="' + cls + '" style="' + style + '" title="' + barTip + '"></span>' +
        '</span>' +
        '<span class="dv-row__num">' +
          (d === null
            ? '<b class="dv-row__delta delta--flat">—</b>' +
              '<small><span>无同卷学科组均</span></small>'
            : /* 主行 = 离差（比学科组高低多少，红绿突出），下排并列班均与组均（绝对水平参照） */
              '<b class="dv-row__delta ' + deltaCls(d) + '">' + signed(d) + '</b>' +
              '<small><span>班均 ' + f1(s.avg) + '%</span>' +
                '<span>组均 ' + f1(s.gradeAvg) + '%</span></small>') +
        '</span>' +
      '</div>';
    }).join('');

    var gapDetail = shown.map(function (s) {
      return s.name + ' ' + numText(s.actionLine) + 'pp';
    }).join(' · ');
    var gapSame = shown.every(function (s) {
      return round1(s.actionLine) === round1(shown[0].actionLine);
    });

    var legend =
      '<span><i class="sw-neg"></i>低于学科组（向左）</span>' +
      '<span><i class="sw-pos"></i>高于学科组（向右）</span>' +
      '<span><i class="sw-band"></i>±' + numText(FLAT_PP) + 'pp 基本持平</span>' +
      '<span title="判弱线即各科班级差距线：低于学科组达到该幅度、且班均未达本科达标线，才进入明确短板候选。本次 ' +
        gapDetail + '"><i class="sw-gap"></i>' +
        (gapSame
          ? '判弱线 −' + numText(shown[0].actionLine) + 'pp（六科相同）'
          : '判弱线（逐科）：' + gapLines.map(function (g) {
              return g.subs.join('、') + ' ' + numText(g.v) + 'pp';
            }).join(' · ')) + '</span>' +
      '<span title="满分区：学生得分率 P75 ≥' + numText(CEILING_P75) +
        '%，计分已触上限，差值主要来自赋分颗粒度，不能当结论用"><i class="sw-hatch"></i>满分区斜纹</span>' +
      '<span>右侧数字：主行离差（pp，红绿突出）· 下排班均与组均</span>';

    return { axis: axis, rows: body, legend: legend };
  }

  function sectionOne(shown, weakInfo, decision) {
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

    var chart = deviationChart(shown);

    /* 四档表头的得分率区间：优/良为固定展示线；中/低分下限取逐科低分线，全科一致才直接写数值 */
    var lowLineSet = [];
    shown.forEach(function (s) {
      var t = numText(s.lowLine);
      if (lowLineSet.indexOf(t) < 0) lowLineSet.push(t);
    });
    var lowLineSame = lowLineSet.length === 1;
    var lowBare = lowLineSame ? lowLineSet[0] : '低分线';
    var lowLineDetail = shown.map(function (s) {
      return s.name + ' ' + numText(s.lowLine) + '%';
    }).join(' · ');
    var bandHeads = [
      ['优', '≥' + numText(CUT.excellent) + '%',
        '等级分档（按得分率）：优为 ≥' + numText(CUT.excellent) + '%，固定展示线'],
      ['良', numText(CUT.good) + '–' + numText(CUT.excellent - 0.1) + '%',
        '等级分档（按得分率）：良为 ' + numText(CUT.good) + '% 至 ' + numText(CUT.excellent) + '% 以下'],
      ['中', lowBare + '–' + numText(CUT.good - 0.1) + '%',
        '等级分档（按得分率）：中档下限用各学科低分线，上限为 ' + numText(CUT.good) + '% 以下；本次低分线 ' + lowLineDetail],
      ['低分', '<' + lowBare + (lowLineSame ? '%' : ''),
        '等级分档（按得分率）：低于各学科低分线即为低分；本次低分线 ' + lowLineDetail]
    ].map(function (h) {
      return '<th title="' + h[2] + '">' + h[0] +
        '<br><span class="th-sub th-sub--nowrap">' + h[1] + '</span></th>';
    }).join('');

    var trs = tableRows.map(function (s) {
      var weakRow = decision.candidates.indexOf(s) >= 0;
      var conclusion = subjectConclusion(s, decision);
      return '<tr' + (weakRow ? ' class="is-top"' : '') + '>' +
        '<td class="cell-strong">' + s.name +
          ' <span class="cell-hint">' + s.hwCount + ' 份</span>' +
          (s.exempt ? ' <span class="tag tag--ceiling">满分区</span>' : '') + '</td>' +
        '<td><span class="diag-evidence diag-evidence--' + s.evidence + '">' + evidenceText(s.evidence) + '</span></td>' +
        '<td class="cell-num">' + s.submitted + '/' + s.due + '</td>' +
        '<td class="cell-num">' + Math.round(s.missingQ * 100) + '%</td>' +
        '<td class="cell-num cell-strong">' + f1(s.avg) + '%</td>' +
        '<td class="cell-num cell-muted">' + f1(s.gradeAvg) + '%</td>' +
        '<td class="cell-num ' + deltaCls(s.diff) + '">' + signed(s.diff) + '</td>' +
        '<td class="cell-num">' + f1(s.median) + '</td>' +
        '<td class="cell-num">' + f1(s.sd) + '</td>' +
        '<td class="cell-num">' + f1(s.max) + '</td>' +
        '<td class="cell-num">' + f1(s.min) + '</td>' +
        '<td class="cell-dist cell-dist--ex">' + s.dist.ex + '</td>' +
        '<td class="cell-dist">' + s.dist.good + '</td>' +
        '<td class="cell-dist">' + s.dist.pass + '</td>' +
        '<td class="cell-dist cell-dist--weak">' + s.dist.weak + '</td>' +
        '<td>' + focusConclusionTag(conclusion) + '</td>' +
        '</tr>';
    }).join('');

    return '<section class="focus-section" id="focusSubjectSection">' +
      '<span class="prd-badge" data-prd="XK-07" title="查看 PRD XK-07：班级各学科得分率离均差">XK-07</span>' +
      '<div class="focus-section__head">' +
        '<span class="focus-section__idx">一</span>' +
        '<h2 class="focus-section__title">班级各学科得分率离均差</h2>' +
        tip('<span><b>条长</b>= 班均得分率 − 学科组得分率（百分点）；六科共用一把尺，可直接横着比。</span>' +
          '<span><b>零点</b>每行零点都是这一科自己的学科组均，所以条长只回答「比自己的学科组高还是低、高多少」；右侧主行就是这个离差值（红=低于，绿=不低于），下排并列班均与组均。</span>' +
          '<span><b>基本持平</b>相差 1 个百分点以内。</span>' +
          '<span><b>判弱线</b>向左越过橙色短竖线即班级明确短板候选；阈值可逐科设定，六科相同时只画一条，满分区用斜纹标出。</span>' +
          '<span><b>标准差</b>数值越大，说明这一科学生之间的分差拉得越开。</span>' +
          '<span><b>短板待确认</b>已达到明确短板条件，但只有 1 份作业，或班均差的连续同向次数未达本科设置（默认 2 次）。</span>') +
      '</div>' +
      '<div class="focus-split focus-split--full">' +
        '<div>' +
          '<div class="bar-list bar-list--dev">' +
            chart.axis +
            '<div class="dv-rows">' + chart.rows + '</div>' +
          '</div>' +
          '<div class="bar-legend bar-legend--dev">' + chart.legend + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="table-card">' +
        '<div class="table-scroll">' +
          '<table class="data-table data-table--compact data-table--stat">' +
            '<thead><tr>' +
              '<th>学科</th><th title="有效作业份数">作业份数</th><th title="交上来的人次 / 应交人次">提交</th><th title="未交人次 ÷ 应交人次">未交率</th>' +
              '<th title="这一科所有作业的得分合计 ÷ 满分合计">班均得分率</th><th title="同一套作业的学科组得分率">学科组得分率</th><th title="班级 − 学科组，单位：个百分点；低于学科组标红，达到或高于标绿">较学科组</th>' +
              '<th title="把全班得分率从低到高排，正中间那个数">中位数</th><th title="标准差：越大说明学生之间分数拉得越开">标准差</th><th>最高</th><th>最低</th>' +
              bandHeads +
              '<th title="明确短板 / 相对短板为阶段性学科判定；先抓提交为数据状态">班级判定</th>' +
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
      '<em>·</em><span>红色越深 = 离班均越远（按各学科学生差距线分档；满分区里接近满分的格子淡化显示）；黑白打印时七档按灰度深浅区分，越深越低</span></div>';
  }

  /* 建议原因一句话：热力表「建议学科」列悬停提示与学生表导出共用同一口径 */
  function weakReason(r) {
    var p = r.priority;
    if (!p) return r.submitOnly ? '先补交作业再判定' : '暂无有效成绩';
    if (p.fail) {
      return '低于 ' + f1(p.lowLine) + '%' + (p.short ? ' · 低于班均 ' + f1(Math.abs(p.d)) + ' 个百分点' : '');
    }
    if (p.short) {
      return '低于班均 ' + f1(Math.abs(p.d)) + ' 个百分点';
    }
    return '个人相对靠后' + (Math.abs(p.d) < 0.05 ? ' · 与班均持平' :
      ' · ' + (p.d < 0 ? '低于' : '高于') + '班均 ' + f1(Math.abs(p.d)) + ' 个百分点');
  }

  /* 姓名前「关注」小星星：点亮=已关注，点击切换并本地持久化（无图标字体，用内联 SVG） */
  var STAR_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.6l2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.6-5 2.6.9-5.6-4-3.9 5.6-.8z"/></svg>';
  function watchStar(id, on) {
    return '<button type="button" class="watch-star' + (on ? ' is-on' : '') + '" ' +
      'data-watch-stu="' + id + '" aria-pressed="' + (on ? 'true' : 'false') + '" ' +
      'title="' + (on ? '取消关注' : '关注该生') + '">' + STAR_SVG + '</button>';
  }

  function sectionTwo(shown, weakInfo) {
    var list = weakInfo.rows.slice();
    if (ui.weakOnly) {
      list = list.filter(function (r) { return r.priority && !r.priority.relative; });
    }
    list.sort(compareStudentRows);

    var head = '<tr><th>学号</th><th>姓名</th>' +
      shown.map(function (s) {
        /* 表头只留学科名 + 班均；作业份数与满分区移到悬停提示，避免表头叠三行小字 */
        var headTip = s.name + '：班级均 ' + f1(s.avg) + '%（' + s.hwCount + ' 份作业）' +
          (s.exempt ? '，满分区（75 分位 ≥95%）' : '') + '，' +
          difficultyLabel(s.rule) + '，达标线 ' + f1(s.targetLine) + '%，低分线 ' + f1(s.lowLine) + '%，' +
          '未达达标线且低于班均 ' + f1(s.trigger) + ' 个百分点算需要提升';
        return '<th title="' + headTip + '">' + s.name +
          '<br><span class="th-sub">班均 ' + f1(s.avg) + '%</span></th>';
      }).join('') +
      '<th class="weak-subject-col" title="该生唯一一科建议学科（重点提升或优先巩固）；悬停单元格可查看建议原因">建议学科</th>' +
      '<th class="weak-score-col">该科得分率</th><th class="weak-tag-col">建议类型</th></tr>';

    var body = list.map(function (r) {
      var cells = r.cells.map(function (c) {
        if (!isNum(c.v)) {
          return '<td class="heat-cell heat-na">—' +
            (c.submitWarn ? '<em>先抓提交</em>' : '') + '</td>';
        }
        /* 色阶使用各学科学生差距线，σ 不参与颜色或判定。 */
        var scale = isNum(c.t) ? c.t : STUDENT_TRIGGER_PP;
        /* 满分区里真正接近满分的格才淡化字色；已经明显偏低的格保持清晰，不能又淡又说“不判” */
        var dim = c.exempt && Math.abs(c.d) <= scale;
        var cls = heatClass(c.d, scale) +
          (c.fail ? ' is-fail' : '') + (dim ? ' is-ceiling' : '');
        var cellTip = c.sub + '：得分率 ' + f1(c.v) + '%，比班均' +
          (c.d >= 0 ? '高 ' : '低 ') + f1(Math.abs(c.d)) + ' 个百分点，提醒线 ' +
          f1(c.t) + ' 个百分点；相对判弱同时要求本人未达 ' + f1(c.targetLine) + '%' +
          '，低分线 ' + f1(c.lowLine) + '%，' + timingText(c.timing) + (c.fail ? '，低分' : '');
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
      var reason = weakReason(r);

      var watched = !!ui.watched[r.stu.id];
      return '<tr' + (r.urgent ? ' class="is-urgent"' : '') + '>' +
        '<td class="cell-num">' + r.stu.id + '</td>' +
        '<td class="cell-name">' + watchStar(r.stu.id, watched) + r.stu.name + '</td>' +
        cells +
        '<td class="weak-subject-cell" title="' + reason + '">' +
          '<span class="weak-subject__name">' + (p ? p.sub : '—') + '</span></td>' +
        '<td class="cell-num weak-score-cell' + (p && p.fail ? ' cell-dev-down' : '') + '">' +
          (p ? '<span class="weak-score__value">' + f1(p.v) + '%</span>' +
            (isNum(p.d) ? '<span class="weak-score__avg">班均 ' + f1(p.v - p.d) + '%</span>' : '') : '—') + '</td>' +
        '<td class="weak-tag-cell" title="' + r.advice + '">' + tag + '</td>' +
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
        tip('<span><b>上排数字</b>= 个人得分率 − 班均得分率（百分点，正数高于班均）；<b>下排数字</b>= 个人得分率。</span>' +
          '<span><b>颜色</b>按与班均的差距分档，高于班均的一侧用绿色对称表示。</span>' +
          '<span><b>重点提升</b>低于本科低分线，或未达达标线且低于班均达到本科学生差距线；<b>优先巩固</b>其余学科里「（个人 − 班均）÷ 本科学生差距线」最小的一科，只表示个人优先级，不等同于薄弱学科。</span>' +
          '<span><b>暂定</b>本科只有 1 份作业时结论标「暂定」；未交率超过本科闸门的科目先抓提交，先补交再判强弱。</span>') +
        '<div class="focus-section__actions">' +
          '<label class="checkbox checkbox--inline">' +
            '<input type="checkbox" data-focus-weak' + (ui.weakOnly ? ' checked' : '') + ' />' +
            '<span class="checkbox__box"></span><span>只看重点提升学生（' + weakInfo.priorityTotal + ' 人）</span>' +
          '</label>' +
          '<button type="button" class="btn btn--ghost btn--sm focus-export-stu" data-focus-export-stu ' +
            'title="把本表（学生各科得分与班均对比）单独导出为 CSV">' +
            '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" ' +
              'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              '<path d="M12 3.5v11M8 11l4 4 4-4M4.5 19.5h15" /></svg>' +
            '导出本表' +
          '</button>' +
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

      return '<tr>' +
        '<td class="cell-strong">' + hw.subject + '</td>' +
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
        '<td class="cell-num cell-muted">' + (hw.scannedAt || '—') + '</td>' +
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
        tip('<span>同一学科的多份作业不分主次，都按满分计入该科得分率。</span>' +
          '<span><b>较学科组</b>= 作业得分率 − 同学科组得分率，与学科层同一口径，改筛选后两边一起重算。</span>') +
        '<span class="focus-section__note">共 ' + list.length + ' 份作业 · 合计提交 ' +
          submit + '/' + due + '（' + pctOf(submit, due) + '）</span>' +
      '</div>' +
      '<div class="table-card">' +
        '<div class="table-scroll">' +
          '<table class="data-table data-table--compact">' +
            '<thead><tr>' +
              '<th>学科</th><th>作业名称</th><th>满分</th><th>提交</th><th>提交率</th>' +
              '<th>平均分</th><th>得分率</th><th>学科组得分率</th><th>较学科组</th><th>扫描时间</th>' +
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

    /* PRD 入口徽章写进标题行：写进壳页预留的槽位；独立报表页无槽位则不显示 */
    var doc = root.ownerDocument || document;
    var slot = doc.getElementById('focusHintSlot');
    if (slot) slot.innerHTML = '<span class="prd-badge" data-prd="XK-04" title="查看 PRD XK-04：统计口径与判定规则">XK-04</span>';

    if (!all.length) {
      root.innerHTML = '<div class="focus-section"><div class="empty-state">' +
        '未选择任何作业，请在「调整筛选」中至少保留一份作业</div></div>';
      return;
    }

    var html = '';
    var weakInfo = weakestOf(all);
    var decision = decideClass(all);
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

  /* 姓名前「关注」星标：就地切换点亮态并持久化，不整表重渲染（避免滚动跳动） */
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-watch-stu]') : null;
    if (!btn) return;
    e.stopPropagation();
    e.preventDefault();
    var id = btn.getAttribute('data-watch-stu');
    var on = !ui.watched[id];
    if (on) { ui.watched[id] = 1; } else { delete ui.watched[id]; }
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.title = on ? '取消关注' : '关注该生';
    saveWatched(ui.watched);
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
      ? '明确短板：' + allWeak.map(function (s) {
          return s.name + (decision.pending.indexOf(s) >= 0 ? '(待确认)' : '');
        }).join('、')
      : '无明确短板') +
      (decision.relative.length
        ? '；相对短板：' + decision.relative.map(function (s) { return s.name; }).join('、')
        : '');
    var rows = [[
      '跨学科分析 · 班级报表 · ' + TODAY,
      classSummary + '；本次按学科使用独立难度与判弱指标：' + rulesText(all) +
      '；明确短板与重点提升均以逐科实际阈值为准；证据不足时标待确认；判定只表示阶段性表现，不代表能力定型'
    ]];
    rows.push(['学科', '难度', '达标线(%)', '低分线(%)', '班级差距线(百分点)',
      '低分面阈值(%)', '未交率闸门(%)', '连续确认次数', '作业份数', '证据（作业份数）', '数据时效', '提交(人次)', '未交率',
      '班均得分率', '学科组得分率', '较学科组(百分点)', '中位数', '标准差', '75 分位',
      '最高', '最低', '优(得分率≥85%)', '良(70~85%)', '中(低分线~70%)', '低分(逐科低分线)', '低分学生占比', '满分区(P75≥95%)', '班级判定']);
    all.slice().sort(function (a, b) {
      var ad = isNum(a.diff) ? a.diff : 999;
      var bd = isNum(b.diff) ? b.diff : 999;
      return ad - bd;
    }).forEach(function (s) {
      rows.push([s.name, difficultyLabel(s.rule), f1(s.targetLine), f1(s.lowLine), f1(s.actionLine),
        Math.round(s.lowShareMin * 100), Math.round(s.missingLimit * 100), s.confirmTimes,
        s.hwCount, evidenceText(s.evidence), timingText(s.timing),
        s.submitted + '/' + s.due, Math.round(s.missingQ * 100) + '%',
        f1(s.avg), f1(s.gradeAvg), signed(s.diff),
        f1(s.median), f1(s.sd), f1(s.p75), f1(s.max), f1(s.min),
        s.dist.ex, s.dist.good, s.dist.pass, s.dist.weak, pctOf(s.dist.weak, s.n),
        s.exempt ? '是' : '否', subjectConclusion(s, decision)]);
    });

    rows.push([]);
    rows.push(['学号', '姓名'].concat(all.map(function (s) { return s.name + '得分率'; }))
      .concat(all.map(function (s) { return s.name + '较班均'; }))
      .concat(['个人建议学科', '建议类型', '证据强度', '该科得分率', '该科较班均', '建议科低于班均(百分点)',
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
    rows.push(['学科', '作业名称', '满分', '提交', '得分率', '学科组率', '较学科组', '扫描时间']);
    selectedHomeworks(ids).forEach(function (hw) {
      var st = null;
      all.forEach(function (s) { if (s.name === hw.subject) st = s; });
      var rate = st ? st.hwMap[hw.id] : null;
      rows.push([hw.subject, hw.name, hw.full,
        (st ? (st.hwCounts[hw.id] || 0) : 0) + '/' + hw.due,
        f1(rate), f1(hw.gradeRate),
        isNum(rate) ? signed(rate - hw.gradeRate) : '—', hw.scannedAt || '—']);
    });
    return rows;
  }

  /* 学生热力表专属导出：只出「学生各科得分与班均对比」一张表，供 section 内「导出本表」按钮调用 */
  function exportStudentRows(ids) {
    var all = computeAll(ids);
    var info = weakestOf(all);
    var rows = [[
      '跨学科分析 · 学生各科得分与班均对比 · ' + TODAY,
      '单元格上排 = 个人得分率 − 班均（百分点），下排 = 个人得分率；色阶、低分线、达标线与提醒线均按各学科本次设置；' +
        '「优先巩固」只表示学习优先级，不等同于薄弱学科；仅 1 份作业标「重点提升·暂定」或「优先巩固·暂定」'
    ]];
    var header = ['关注', '学号', '姓名'];
    all.forEach(function (s) { header.push(s.name + '得分率'); });
    all.forEach(function (s) { header.push(s.name + '较班均'); });
    header = header.concat(['建议学科', '建议原因', '该科得分率', '该科班均', '建议类型', '一句话建议']);
    rows.push(header);
    info.rows.slice().sort(compareStudentRows).forEach(function (r) {
      var p = r.priority;
      var line = [ui.watched[r.stu.id] ? '★' : '', r.stu.id, r.stu.name];
      r.cells.forEach(function (c) { line.push(isNum(c.v) ? f1(c.v) : '—'); });
      r.cells.forEach(function (c) { line.push(isNum(c.d) ? signed(c.d) : '—'); });
      line.push(p ? p.sub : '—', weakReason(r), p ? f1(p.v) : '—',
        (p && isNum(p.d)) ? f1(p.v - p.d) : '—', r.status, r.advice);
      rows.push(line);
    });
    return rows;
  }

  /* ==================== 11. 数据注入契约 ==================== */

  /*
    真实接入入口。渲染层只吃这份契约，换数据源不改任何渲染代码。
      configure({
        demo: false,                        // 关闭演示生成，逐作业得分率必须来自 rows[i].hw
        homeworks: [{ id, subject, name, full, due, handed, date, scannedAt, gradeRate }],
        rows: [['学号', '姓名', 语, 数, 英, 物, 化, 生, { hwId: 得分率, ... }]]
      })
    约定：
      · gradeRate 必须是「同一份作业」的学科组得分率，否则差值列又变成不同源的两个数；
      · scannedAt = 平台扫描完成时间字符串，仅展示、不参与判定；旧字段 graded 若仍为字符串会被兼容读取；
      · rows[i] 第 9 位起为逐作业得分率映射，缺项按未提交处理（不按 0 分计）；
      · HOMEWORKS / SUBJECTS 数组身份保持不变，壳页（app.js）持有的引用继续有效。
  */
  /* 切换演示班级：恢复班级独立的作业与逐生数据，并保持 DEMO 拆分口径 */
  function setDemoClass(clazz) {
    var data = demoClassData(clazz);
    if (!data) return false;
    DEMO = true;
    HOMEWORKS.length = 0;
    Array.prototype.push.apply(HOMEWORKS, data.homeworks);
    ROWS.length = 0;
    Array.prototype.push.apply(ROWS, data.rows);
    rebuildHwIndex();
    if (lastRender) render(lastRender.root, lastRender.opts);
    return true;
  }

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
    DIFFICULTY_PRESETS: DIFFICULTY_PRESETS,
    getRules: getRules,
    getRulePreset: getRulePreset,
    configureRules: configureRules,
    difficultyLabel: difficultyLabel,
    computeAll: computeAll,
    weakestOf: weakestOf,
    decideClass: decideClass,
    exportRows: exportRows,
    exportStudentRows: exportStudentRows,
    configure: configure,
    setDemoClass: setDemoClass,
    render: render,
    isDemo: function () { return DEMO; }
  };
})(window);
