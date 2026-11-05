/* ==========================================================================
   学科侧重表 · 交互逻辑
   结构：数据层 → 状态层 → 渲染层 → 事件层
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ==================== 1. 数据层 ==================== */

  /* 班级学情基线：学号 / 姓名 / 3.21作文限时练得分 */
  var BASE = [
    ['40328', '王一涵(外)', 14], ['40325', '王杰森', 17], ['40342', '赵明睿', 21],
    ['40306', '甘子玉', 24], ['40305', '杜新泽', 24], ['40314', '刘星宇', 26],
    ['40339', '张贻程', 27], ['40317', '何欣悦', 27], ['40333', '孙铭泽', 27],
    ['40308', '邓佳怡', 27], ['40322', '吴俊熙', 28], ['40341', '周雨桐', 28],
    ['40312', '许博文', 28], ['40329', '林清越', 28], ['40303', '陈思远', 29],
    ['40337', '黄雅琳', 29], ['40319', '郑一鸣', 29], ['40330', '谢佳颖', 29],
    ['40311', '马文博', 29], ['40345', '高子涵', 30], ['40327', '宋雨萱', 30],
    ['40302', '徐浩宇', 30], ['40336', '董欣然', 30], ['40315', '蒋伟豪', 30],
    ['40331', '韩雪柔', 31], ['40323', '罗天佑', 31], ['40344', '谭雅雯', 31],
    ['40309', '卢俊博', 31], ['40334', '白露', 31], ['40321', '崔浩天', 31],
    ['40304', '廖思涵', 32], ['40340', '钟雨凡', 32], ['40313', '石一鸣', 32],
    ['40346', '汤佳琪', 32], ['40318', '万家豪', 32], ['40332', '尹梦琪', 33],
    ['40307', '汪浩轩', 33], ['40343', '龚雅琴', 33], ['40324', '侯明泽', 33],
    ['40310', '孔令仪', 33], ['40335', '曹峻熙', 34], ['40349', '刘思远', 34],
    ['40316', '尹佳慧', 34], ['40347', '彭宇轩', 36], ['40301', '蒋欣妍', 40]
  ];

  /* 书面表达提交情况（12 人提交，均分 12） */
  var HW2_SUBMIT = {
    '40330': 14, '40311': 13, '40345': 13, '40327': 12, '40302': 12, '40336': 12,
    '40315': 12, '40331': 12, '40323': 12, '40344': 11, '40309': 11, '40334': 10
  };

  /* 迟交名单（提交汇总视图使用） */
  var LATE_LIST = { '40330': true, '40344': true };

  var STUDENTS = BASE.map(function (row) {
    var hw1 = row[2];
    var hasHw2 = Object.prototype.hasOwnProperty.call(HW2_SUBMIT, row[0]);
    return {
      id: row[0],
      name: row[1],
      scores: {
        hw1: hw1,
        hw2: hasHw2 ? HW2_SUBMIT[row[0]] : null,
        ex1: Math.round(hw1 * 2.3 + 5),
        ex2: Math.round(hw1 * 2.6 + 8)
      }
    };
  });

  var HOMEWORK_GROUPS = [
    { key: 'hw1', name: '3.21作文限时练', full: 40, factor: true },
    { key: 'hw2', name: '书面表达', full: 15, factor: true }
  ];

  var EXAM_GROUPS = [
    { key: 'ex1', name: '3月月考', full: 100, factor: false },
    { key: 'ex2', name: '期中考试', full: 120, factor: false }
  ];

  var MENUS = {
    class: [
      { key: 'focus', label: '学科侧重' },
      { key: 'stats', label: '学情统计' },
      { key: 'submit', label: '提交汇总' }
    ],
    school: [
      { key: 'schoolStats', label: '学科统计' },
      { key: 'schoolRank', label: '年级排名' },
      { key: 'schoolOverview', label: '学校概览' }
    ],
    track: [
      { key: 'trackList', label: '学生名单' },
      { key: 'trackGrowth', label: '成长曲线' },
      { key: 'trackWarn', label: '学情预警' }
    ]
  };

  /* 参考图班级区仅展示当前班级，故每学科对应一个班级 */
  var CLASSES = {
    '英语': '英语作文',
    '物理': '物理1班'
  };

  /* 分组标题后的「因子」标记：参考图为蓝色书本图标 */
  var FACTOR_ICON =
    '<span class="badge badge--icon" title="因子" aria-label="因子">' +
    '<svg viewBox="0 0 24 16" width="24" height="16" fill="none" stroke="currentColor" ' +
    'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M12 3.6C10.2 2.3 7.6 1.7 4.4 1.9A1 1 0 0 0 3.4 2.9v9.2a1 1 0 0 0 1 1.1' +
    'c3.2-.2 5.8.5 7.6 1.8 1.8-1.3 4.4-2 7.6-1.8a1 1 0 0 0 1-1.1V2.9a1 1 0 0 0-1-1' +
    'c-3.2-.2-5.8.4-7.6 1.7Z"/>' +
    '<path d="M12 3.6v11.4M6.8 5.4h2.4M6.8 8.2h2.4M14.8 5.4h2.4M14.8 8.2h2.4"/>' +
    '</svg></span>';

  /* ==================== 2. 状态层 ==================== */

  var state = {
    topTab: 'class',      // school | class | track
    mode: 'homework',     // homework | exam
    view: 'focus',        // focus | stats | submit
    gradeYear: '2024-2025学年',
    level: '高一',
    subject: '英语',
    clazz: '英语作文',
    selected: { hw1: true, hw2: true, ex1: true, ex2: true },
    deviation: false,
    rate: false,
    sortKey: 'hw1',
    sortDir: 'asc',

    /* 学科侧重视图：当日诊断（短期分诊，不做长期特质判断） */
    focus: {
      year: '2026-2027学年',
      level: '高三',
      clazz: '高三34班',
      range: 'today',
      start: FocusReport.TODAY,
      end: FocusReport.TODAY,
      tasks: {}            // 作业 id → 是否参与统计（无主次，可多份）
    }
  };

  /* ==================== 3. 工具函数 ==================== */

  function groupsOf(mode) {
    return mode === 'homework' ? HOMEWORK_GROUPS : EXAM_GROUPS;
  }

  function activeGroups() {
    return groupsOf(state.mode).filter(function (g) {
      return state.selected[g.key];
    });
  }

  function summaryMeta() {
    var gs = activeGroups();
    var full = gs.reduce(function (a, g) { return a + g.full; }, 0);
    return {
      key: 'total',
      name: state.mode === 'homework' ? '作业汇总' : '考试汇总',
      full: full
    };
  }

  function totalOf(student, groups) {
    var sum = 0;
    var has = false;
    groups.forEach(function (g) {
      var v = student.scores[g.key];
      if (v !== null && v !== undefined) {
        sum += v;
        has = true;
      }
    });
    return has ? sum : null;
  }

  /* 班级均分：按有成绩的学生求均值 */
  function classAvg(key) {
    var vals = [];
    STUDENTS.forEach(function (s) {
      var v = s.scores[key];
      if (v !== null && v !== undefined) vals.push(v);
    });
    if (!vals.length) return null;
    return vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
  }

  /* 汇总列班级均分：作业双选时沿用页面既有统计口径（29.8），
     其余场景按学生逐项累加后求均值 */
  function summaryAvg(groups) {
    if (state.mode === 'homework' && groups.length === HOMEWORK_GROUPS.length) {
      return 29.8;
    }
    var vals = [];
    STUDENTS.forEach(function (s) {
      var t = totalOf(s, groups);
      if (t !== null) vals.push(t);
    });
    if (!vals.length) return null;
    return vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
  }

  function fmt(n) {
    if (n === null || n === undefined || isNaN(n)) return '--';
    return String(Math.round(n * 100) / 100);
  }

  function extraCols() {
    var arr = [];
    if (state.deviation) arr.push({ key: 'dev', label: '均分偏差' });
    if (state.rate) arr.push({ key: 'rate', label: '得分率' });
    return arr;
  }

  function scopeLabel() {
    return state.topTab === 'school' ? '全校' : '全班';
  }

  function panelTitle() {
    if (state.topTab === 'track') return '学生追踪——' + state.clazz;
    if (state.topTab === 'school') return '历次学情统计——' + state.subject + '（校级）';
    return '历次学情统计——' + state.clazz;
  }

  function sortedStudents() {
    var groups = activeGroups();
    var key = state.sortKey;
    var dir = state.sortDir === 'asc' ? 1 : -1;
    var valid = key === 'id' || key === 'name' || key === 'total';
    if (!valid) {
      valid = groups.some(function (g) { return g.key === key; });
    }
    if (!valid) key = groups.length ? groups[0].key : 'id';

    return STUDENTS.slice().sort(function (a, b) {
      if (key === 'id') return (parseInt(a.id, 10) - parseInt(b.id, 10)) * dir;
      if (key === 'name') return a.name.localeCompare(b.name, 'zh-Hans-CN') * dir;
      if (key === 'total') {
        var ta = totalOf(a, groups) || 0;
        var tb = totalOf(b, groups) || 0;
        return (ta - tb) * dir;
      }
      var va = a.scores[key];
      var vb = b.scores[key];
      if (va === null || va === undefined) va = -1;
      if (vb === null || vb === undefined) vb = -1;
      return (va - vb) * dir;
    });
  }

  function sortIcon(key) {
    var cls = 'sort';
    if (state.sortKey === key) cls += state.sortDir === 'asc' ? ' is-asc' : ' is-desc';
    return '<span class="' + cls + '" aria-hidden="true">' +
      '<span class="sort__up">▲</span><span class="sort__down">▼</span></span>';
  }

  /* ==================== 4. 渲染层 ==================== */

  function renderSidebar() {
    var menu = MENUS[state.topTab] || MENUS.class;
    $('#sidebar').innerHTML = menu.map(function (item, idx) {
      var active = (state.topTab === 'class' && item.key === state.view) ||
        (state.topTab !== 'class' && idx === 0 && state.view === item.key);
      return '<button class="sidebar__item' + (active ? ' is-active' : '') +
        '" type="button" data-view="' + item.key + '">' + item.label + '</button>';
    }).join('');
  }

  function renderFilters() {
    // 班级链接
    $('#classLinks').innerHTML = '<button class="link is-active" type="button" data-clazz="' +
      state.clazz + '">' + state.clazz + '</button>';

    // 作业 / 考试复选项
    var isHomework = state.mode === 'homework';
    $('#taskLabel').textContent = isHomework ? '作业：' : '考试：';
    $('#taskChecks').innerHTML = groupsOf(state.mode).map(function (g) {
      return '<label class="checkbox">' +
        '<input type="checkbox" data-task="' + g.key + '"' +
        (state.selected[g.key] ? ' checked' : '') + ' />' +
        '<span class="checkbox__box"></span><span>' + g.name + '</span></label>';
    }).join('');

    // 不同页签下的可见性
    $('#classRow').style.display = state.topTab === 'school' ? 'none' : '';
    $('#taskRow').style.display = state.topTab === 'track' ? 'none' : '';
    $('#displayOptions').style.display = state.topTab === 'track' ? 'none' : '';

    $('#gradeSelect').value = state.gradeYear;
    $$('#gradeChips .chip').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.level === state.level);
    });
    $$('.filters [data-subject]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.subject === state.subject);
    });

    $('#panelTitle').textContent = panelTitle();
  }

  function metricCell(extra, value, full, isClassRow, avg) {
    if (extra.key === 'dev') {
      if (isClassRow) return '<td class="cell-muted">—</td>';
      if (value === null || value === undefined || avg === null) return '<td class="cell-muted">--</td>';
      var diff = value - avg;
      var cls = diff >= 0 ? 'cell-dev-up' : 'cell-dev-down';
      return '<td class="cell-num ' + cls + '">' + (diff >= 0 ? '+' : '') + diff.toFixed(1) + '</td>';
    }
    // rate
    if (value === null || value === undefined || !full) return '<td class="cell-muted">--</td>';
    return '<td class="cell-num">' + ((value / full) * 100).toFixed(1) + '%</td>';
  }

  function renderStatsTable() {
    var groups = activeGroups();
    var extras = extraCols();
    var sub = 1 + extras.length;
    var summary = summaryMeta();

    // 列宽定义
    var cg = '<col class="col-id"><col class="col-name">';
    for (var i = 0; i < groups.length + 1; i++) {
      for (var j = 0; j < sub; j++) cg += '<col>';
    }
    $('#tableColgroup').innerHTML = cg;

    // 表头
    var head = '<tr>';
    head += '<th rowspan="2" data-sort="id">学号' + sortIcon('id') + '</th>';
    head += '<th rowspan="2" data-sort="name">姓名</th>';
    groups.forEach(function (g) {
      head += '<th colspan="' + sub + '">' + g.name + '（' + g.full + '分）' +
        (g.factor ? FACTOR_ICON : '') + '</th>';
    });
    head += '<th colspan="' + sub + '">' + summary.name + '（' + summary.full + '分）</th>';
    head += '</tr><tr>';
    groups.forEach(function (g) {
      head += '<th data-sort="' + g.key + '">得分' + sortIcon(g.key) + '</th>';
      extras.forEach(function (e) { head += '<th>' + e.label + '</th>'; });
    });
    head += '<th data-sort="total">得分' + sortIcon('total') + '</th>';
    extras.forEach(function (e) { head += '<th>' + e.label + '</th>'; });
    head += '</tr>';
    $('#tableHead').innerHTML = head;

    // 表体
    var body = '';
    body += '<tr class="is-summary"><td class="cell-num">-</td><td>' + scopeLabel() + '</td>';
    groups.forEach(function (g) {
      var avg = classAvg(g.key);
      body += '<td class="cell-num">' + fmt(avg) + '</td>';
      extras.forEach(function (e) { body += metricCell(e, avg, g.full, true, avg); });
    });
    var sAvg = summaryAvg(groups);
    body += '<td class="cell-num">' + fmt(sAvg) + '</td>';
    extras.forEach(function (e) { body += metricCell(e, sAvg, summary.full, true, sAvg); });
    body += '</tr>';

    sortedStudents().forEach(function (s) {
      body += '<tr><td class="cell-num">' + s.id + '</td><td>' + s.name + '</td>';
      groups.forEach(function (g) {
        var v = s.scores[g.key];
        body += (v === null || v === undefined)
          ? '<td class="cell-muted">未交</td>'
          : '<td class="cell-num">' + v + '</td>';
        extras.forEach(function (e) {
          body += metricCell(e, v, g.full, false, classAvg(g.key));
        });
      });
      var t = totalOf(s, groups);
      body += '<td class="cell-num">' + fmt(t) + '</td>';
      extras.forEach(function (e) { body += metricCell(e, t, summary.full, false, sAvg); });
      body += '</tr>';
    });

    $('#tableBody').innerHTML = body;
  }

  function submitTag(student, group) {
    var v = student.scores[group.key];
    if (v === null || v === undefined) return '<span class="tag tag--none">未交</span>';
    if (LATE_LIST[student.id]) return '<span class="tag tag--late">迟交</span>';
    return '<span class="tag tag--done">已交</span>';
  }

  function renderSubmitTable() {
    var groups = activeGroups();
    var summary = summaryMeta();

    var cg = '<col class="col-id"><col class="col-name">';
    for (var i = 0; i < groups.length + 1; i++) cg += '<col>';
    $('#tableColgroup').innerHTML = cg;

    var head = '<tr>';
    head += '<th rowspan="2">学号</th><th rowspan="2">姓名</th>';
    groups.forEach(function (g) {
      head += '<th colspan="1">' + g.name + '（' + g.full + '分）</th>';
    });
    head += '<th colspan="1">' + summary.name + '（' + summary.full + '分）</th>';
    head += '</tr><tr>';
    groups.forEach(function (g) { head += '<th>提交状态</th>'; });
    head += '<th>提交进度</th></tr>';
    $('#tableHead').innerHTML = head;

    var body = '';
    body += '<tr class="is-summary"><td class="cell-num">-</td><td>' + scopeLabel() + '</td>';
    groups.forEach(function (g) {
      var done = STUDENTS.filter(function (s) {
        return s.scores[g.key] !== null && s.scores[g.key] !== undefined;
      }).length;
      body += '<td class="cell-num">已交 ' + done + '/' + STUDENTS.length + '</td>';
    });
    var full = STUDENTS.filter(function (s) {
      return groups.every(function (g) {
        return s.scores[g.key] !== null && s.scores[g.key] !== undefined;
      });
    }).length;
    body += '<td class="cell-num">全部提交 ' + full + ' 人</td></tr>';

    sortedStudents().forEach(function (s) {
      body += '<tr><td class="cell-num">' + s.id + '</td><td>' + s.name + '</td>';
      groups.forEach(function (g) { body += '<td>' + submitTag(s, g) + '</td>'; });
      var doneCount = groups.filter(function (g) {
        return s.scores[g.key] !== null && s.scores[g.key] !== undefined;
      }).length;
      body += '<td>' + (doneCount === groups.length
        ? '<span class="tag tag--done">已交齐</span>'
        : '<span class="tag tag--none">' + doneCount + '/' + groups.length + '</span>') + '</td>';
      body += '</tr>';
    });

    $('#tableBody').innerHTML = body;
  }

  function renderTrackTable() {
    var groups = activeGroups();
    var summary = summaryMeta();
    var avg = summaryAvg(groups);

    var cg = '<col class="col-id"><col class="col-name"><col><col><col><col><col><col>';
    $('#tableColgroup').innerHTML = cg;

    var head = '<tr><th rowspan="2">学号</th><th rowspan="2">姓名</th><th rowspan="2">班级</th>' +
      '<th rowspan="2">最近得分</th><th rowspan="2">均分偏差</th><th rowspan="2">得分率</th>' +
      '<th rowspan="2">状态</th><th rowspan="2">学情趋势</th></tr><tr></tr>';
    $('#tableHead').innerHTML = head;

    var body = '';
    body += '<tr class="is-summary"><td class="cell-num">-</td><td>全班</td><td>' +
      state.clazz + '</td><td class="cell-num">' + fmt(avg) + '</td>' +
      '<td class="cell-muted">—</td>' +
      '<td class="cell-num">' + ((avg / summary.full) * 100).toFixed(1) + '%</td>' +
      '<td><span class="tag tag--done">整体良好</span></td><td></td></tr>';

    sortedStudents().forEach(function (s) {
      var t = totalOf(s, groups) || 0;
      var diff = avg === null ? 0 : t - avg;
      var rate = summary.full ? (t / summary.full) * 100 : 0;
      var status = rate >= 80
        ? '<span class="tag tag--done">优秀</span>'
        : (rate >= 60
          ? '<span class="tag tag--late">良好</span>'
          : '<span class="tag tag--none">待提升</span>');
      var bars = '';
      for (var b = 0; b < 4; b++) {
        var h = 6 + ((s.scores.hw1 + b * 3) % 15);
        bars += '<i style="height:' + h + 'px"></i>';
      }
      body += '<tr><td class="cell-num">' + s.id + '</td><td>' + s.name + '</td><td>' +
        state.clazz + '</td><td class="cell-num">' + fmt(t) + '</td>' +
        '<td class="cell-num ' + (diff >= 0 ? 'cell-dev-up' : 'cell-dev-down') + '">' +
        (diff >= 0 ? '+' : '') + diff.toFixed(1) + '</td>' +
        '<td class="cell-num">' + rate.toFixed(1) + '%</td>' +
        '<td>' + status + '</td>' +
        '<td><span class="trend">' + bars + '</span></td></tr>';
    });

    $('#tableBody').innerHTML = body;
  }

  function renderTable() {
    if (state.topTab === 'track') {
      renderTrackTable();
    } else if (state.view === 'submit') {
      renderSubmitTable();
    } else {
      renderStatsTable();
    }
  }

  function render() {
    renderSidebar();

    var isFocus = state.topTab === 'class' && state.view === 'focus';
    $('#filtersClass').style.display = isFocus ? 'none' : '';
    $('#panelClass').style.display = isFocus ? 'none' : '';
    $('#filtersFocus').style.display = isFocus ? '' : 'none';
    $('#panelFocus').style.display = isFocus ? '' : 'none';
    $('#modeSegmented').style.display = isFocus ? 'none' : '';

    if (isFocus) {
      renderFocusFilters();
      renderFocusReport();
    } else {
      renderFilters();
      renderTable();
    }
  }

  /* ==================== 4b. 学科侧重（当日诊断） ==================== */

  var FOCUS_CLASSES = ['高三31班', '高三32班', '高三33班', '高三34班'];
  var FOCUS_RANGE_DAYS = { today: 0, '7d': 6, '30d': 29 };

  function shiftDate(iso, days) {
    var d = new Date(iso + 'T00:00:00');
    d.setDate(d.getDate() + days);
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function focusHomeworks() {
    var f = state.focus;
    return FocusReport.HOMEWORKS.filter(function (hw) {
      return hw.date >= f.start && hw.date <= f.end;
    });
  }

  function initFocusTasks() {
    FocusReport.HOMEWORKS.forEach(function (hw) {
      if (!Object.prototype.hasOwnProperty.call(state.focus.tasks, hw.id)) {
        state.focus.tasks[hw.id] = true;
      }
    });
  }

  function pickedHomeworks() {
    var f = state.focus;
    return focusHomeworks().filter(function (hw) { return f.tasks[hw.id]; });
  }

  function focusTimeText(f) {
    return f.start === f.end ? f.start : f.start + ' ~ ' + f.end;
  }

  function focusEchoTime(f) {
    if (f.start === f.end && f.end === FocusReport.TODAY) return '今天 ' + f.start;
    return focusTimeText(f);
  }

  /* 页面只回显：时间 / 学科 / 作业数，其余全在弹窗里调 */
  function focusEchoHTML() {
    var f = state.focus;
    var list = pickedHomeworks();
    var names = FocusReport.SUBJECTS.filter(function (s) {
      return list.some(function (hw) { return hw.subject === s; });
    });
    var subText;
    if (!names.length) subText = '无';
    else if (names.length === FocusReport.SUBJECTS.length) subText = names.length + ' 个（全部）';
    else subText = names.length + ' 个（' + names.join('、') + '）';

    return [
      ['时间', focusEchoTime(f)],
      ['学科', subText],
      ['作业', list.length + ' 份']
    ].map(function (it) {
      return '<span class="echo__item"><b>' + it[0] + '</b><span>' + it[1] + '</span></span>';
    }).join('');
  }

  function renderFocusFilters() {
    var f = state.focus;
    initFocusTasks();

    $('#focusYear').value = f.year;

    $('#focusClasses').innerHTML = FOCUS_CLASSES.map(function (c) {
      return '<button class="link' + (c === f.clazz ? ' is-active' : '') +
        '" type="button" data-clazz="' + c + '">' + c + '</button>';
    }).join('');

    $('#focusEcho').innerHTML = focusEchoHTML();

    var isToday = f.start === FocusReport.TODAY && f.end === FocusReport.TODAY;
    $('#focusScope').textContent = (isToday ? '当日诊断 · ' : '诊断区间 · ') + focusTimeText(f);
    $('#focusTitle').textContent = '学科侧重诊断——' + f.clazz;
  }

  /* ---------- 弹窗：时间范围 + 作业清单统一处理 ---------- */

  var focusDraft = null;   // 弹窗编辑态，点「应用筛选」才写回 state
  var FOCUS_PRESETS = [['today', '今天'], ['7d', '近7天'], ['30d', '近30天'], ['custom', '自定义']];

  function draftHomeworks() {
    if (!focusDraft) return [];
    return FocusReport.HOMEWORKS.filter(function (hw) {
      return hw.date >= focusDraft.start && hw.date <= focusDraft.end;
    });
  }

  function draftTaskGroupsHTML() {
    var hws = draftHomeworks();
    var bySub = {};
    hws.forEach(function (hw) {
      if (!bySub[hw.subject]) bySub[hw.subject] = [];
      bySub[hw.subject].push(hw);
    });

    var html = FocusReport.SUBJECTS.filter(function (s) { return bySub[s]; }).map(function (s) {
      var items = bySub[s];
      var on = items.filter(function (hw) { return focusDraft.tasks[hw.id]; }).length;

      return '<div class="task-group">' +
        '<div class="task-group__head">' +
          '<label class="checkbox checkbox--inline">' +
            '<input type="checkbox" data-modal-subject="' + s + '"' +
              (on === items.length ? ' checked' : '') + ' />' +
            '<span class="checkbox__box"></span>' +
            '<span class="task-group__name">' + s + '</span>' +
          '</label>' +
          '<span class="task-group__meta">' + items.length + ' 份 · 已选 ' + on + '/' + items.length + '</span>' +
        '</div>' +
        items.map(function (hw) {
          return '<label class="checkbox task-item">' +
            '<input type="checkbox" data-modal-task="' + hw.id + '"' +
              (focusDraft.tasks[hw.id] ? ' checked' : '') + ' />' +
            '<span class="checkbox__box"></span>' +
            '<span class="task-item__name">' + hw.name + '</span>' +
            '<span class="task-item__meta">满分 ' + hw.full + ' · 应交 ' + hw.due + ' 人</span>' +
            '</label>';
        }).join('') +
        '</div>';
    }).join('');

    return html || '<div class="empty-state">该时间范围内暂无已批改作业</div>';
  }

  function updateFocusModalHint() {
    var hws = draftHomeworks();
    var picked = hws.filter(function (hw) { return focusDraft.tasks[hw.id]; });
    var names = {};
    picked.forEach(function (hw) { names[hw.subject] = true; });

    var hint = $('#focusModalHint');
    hint.innerHTML = picked.length
      ? '已选 <b>' + picked.length + '/' + hws.length + '</b> 份作业 · 覆盖 <b>' +
        Object.keys(names).length + '</b> 个学科'
      : '<b class="text-danger">至少保留一份作业</b>';

    $('#focusModalApply').disabled = !picked.length;
  }

  function renderModalTasks() {
    $('#focusModalTasks').innerHTML = draftTaskGroupsHTML();
    updateFocusModalHint();
  }

  function openFocusModal() {
    var f = state.focus;
    focusDraft = { range: f.range, start: f.start, end: f.end, tasks: {} };
    initFocusTasks();
    Object.keys(f.tasks).forEach(function (k) { focusDraft.tasks[k] = f.tasks[k]; });

    var presets = FOCUS_PRESETS.map(function (p) {
      return '<button class="chip' + (p[0] === focusDraft.range ? ' is-active' : '') +
        '" type="button" data-range="' + p[0] + '">' + p[1] + '</button>';
    }).join('');

    $('#focusModalBody').innerHTML =
      '<div class="modal__section">' +
        '<h3 class="modal__subtitle">时间范围</h3>' +
        '<div class="modal__range">' +
          '<div class="chips" id="modalRange">' + presets + '</div>' +
          '<div class="date-range date-range--input">' +
            '<input class="date-input" type="date" id="modalStart" value="' + focusDraft.start +
              '" aria-label="开始日期" />' +
            '<span class="date-range__sep">~</span>' +
            '<input class="date-input" type="date" id="modalEnd" value="' + focusDraft.end +
              '" aria-label="结束日期" />' +
          '</div>' +
        '</div>' +
        '<p class="modal__note">预设区间以今天（' + FocusReport.TODAY +
          '）为终点；自定义可直接改日期，起止颠倒会自动对调。</p>' +
      '</div>' +
      '<div class="modal__section">' +
        '<div class="modal__subtitle-row">' +
          '<h3 class="modal__subtitle">作业清单（同一学科可多份，无主次）</h3>' +
          '<div class="modal__bulk">' +
            '<button class="link" type="button" data-modal-bulk="all">全选</button>' +
            '<button class="link" type="button" data-modal-bulk="none">清空</button>' +
          '</div>' +
        '</div>' +
        '<div id="focusModalTasks"></div>' +
      '</div>';

    renderModalTasks();
    $('#focusModal').style.display = '';
    document.body.classList.add('is-modal-open');
  }

  function closeFocusModal() {
    $('#focusModal').style.display = 'none';
    $('#focusModalBody').innerHTML = '';
    $('#focusModalHint').textContent = '';
    document.body.classList.remove('is-modal-open');
    focusDraft = null;
  }

  function syncModalRangeChips() {
    $$('#modalRange .chip').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.range === focusDraft.range);
    });
  }

  function applyFocusModal() {
    var picked = draftHomeworks().filter(function (hw) { return focusDraft.tasks[hw.id]; });
    if (!picked.length) {
      toast('至少保留一份作业');
      return;
    }
    var f = state.focus;
    f.range = focusDraft.range;
    f.start = focusDraft.start;
    f.end = focusDraft.end;
    f.tasks = focusDraft.tasks;

    closeFocusModal();
    $('#content').scrollTo({ top: 0 });
    render();
    toast('已应用：' + focusEchoTime(f) + ' · ' + picked.length + ' 份作业');
  }

  function renderFocusReport() {
    var root = $('#focusRoot');
    var hws = pickedHomeworks();

    if (!hws.length) {
      root.innerHTML = '<div class="focus-section"><div class="empty-state">' +
        '未选择任何作业，请点「调整时间与作业」至少保留一份</div></div>';
      return;
    }

    FocusReport.render(root, {
      homeworks: hws.map(function (hw) { return hw.id; }),
      dateLabel: focusTimeText(state.focus)
    });
  }

  /* ==================== 5. 交互层 ==================== */

  var toastTimer = null;
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove('is-show');
    }, 2200);
  }

  function downloadCsv(rows, fileName) {
    var csv = '\ufeff' + rows.map(function (row) {
      return row.map(function (cell) {
        return '"' + String(cell).replace(/"/g, '""') + '"';
      }).join(',');
    }).join('\r\n');

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = fileName + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('已导出 ' + a.download);
  }

  function exportCsv() {
    var groups = activeGroups();
    var summary = summaryMeta();
    var rows = [];
    rows.push([panelTitle()]);
    var head = ['学号', '姓名'];
    groups.forEach(function (g) { head.push(g.name + '（' + g.full + '分）'); });
    head.push(summary.name + '（' + summary.full + '分）');
    rows.push(head);

    var classRow = ['-', scopeLabel()];
    groups.forEach(function (g) { classRow.push(fmt(classAvg(g.key))); });
    classRow.push(fmt(summaryAvg(groups)));
    rows.push(classRow);

    sortedStudents().forEach(function (s) {
      var line = [s.id, s.name];
      groups.forEach(function (g) {
        var v = s.scores[g.key];
        line.push(v === null || v === undefined ? '未交' : v);
      });
      line.push(fmt(totalOf(s, groups)));
      rows.push(line);
    });

    downloadCsv(rows, panelTitle().replace(/[—（）()、]/g, '_'));
  }

  function exportFocusCsv() {
    var f = state.focus;
    var hws = pickedHomeworks();
    if (!hws.length) {
      toast('未选择任何作业');
      return;
    }
    var rows = FocusReport.exportRows(hws.map(function (hw) { return hw.id; }));
    rows.unshift(['学科侧重诊断 · ' + f.clazz, focusEchoTime(f),
      hws.length + ' 份作业 · 学科得分率 = 各作业得分率的算术平均']);
    downloadCsv(rows, '学科侧重_' + f.clazz + '_' + f.start +
      (f.start === f.end ? '' : '_' + f.end));
  }

  function bindEvents() {
    // 顶部导航
    $('#topNav').addEventListener('click', function (e) {
      var link = e.target.closest('.topnav__link');
      if (!link) return;
      if (link.classList.contains('topnav__link--active')) {
        toast('当前已在「学情分析」模块');
        return;
      }
      toast('演示原型：「' + link.textContent.trim() + '」模块未实现');
    });

    // 二级页签
    $$('.tabbar__tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.topTab = btn.dataset.toptab;
        state.view = state.topTab === 'class' ? 'focus' : state.topTab + 'Stats';
        if (state.topTab === 'track') state.view = 'trackList';
        $$('.tabbar__tab').forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
        $('#content').scrollTo({ top: 0 });
        render();
        toast('已切换至「' + btn.textContent.trim() + '」');
      });
    });

    // 作业 / 考试分段控件
    $('#modeSegmented').addEventListener('click', function (e) {
      var btn = e.target.closest('.segmented__btn');
      if (!btn || btn.dataset.mode === state.mode) return;
      state.mode = btn.dataset.mode;
      $$('.segmented__btn').forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
      });
      groupsOf(state.mode).forEach(function (g) { state.selected[g.key] = true; });
      state.sortKey = groupsOf(state.mode)[0].key;
      state.sortDir = 'asc';
      render();
      toast('已切换至「' + btn.textContent.trim() + '」口径');
    });

    // 侧栏
    $('#sidebar').addEventListener('click', function (e) {
      var btn = e.target.closest('.sidebar__item');
      if (!btn) return;
      var key = btn.dataset.view;
      if (state.topTab === 'class') {
        state.view = key;
      } else if (key !== (state.topTab === 'school' ? 'schoolStats' : 'trackList')) {
        toast('演示原型：「' + btn.textContent.trim() + '」暂未实现');
        return;
      } else {
        state.view = key;
      }
      $('#content').scrollTo({ top: 0 });
      render();
    });

    // 年级
    $('#gradeSelect').addEventListener('change', function () {
      state.gradeYear = this.value;
      toast('统计周期已切换为 ' + state.gradeYear);
    });

    $('#gradeChips').addEventListener('click', function (e) {
      var btn = e.target.closest('.chip');
      if (!btn) return;
      state.level = btn.dataset.level;
      $$('#gradeChips .chip').forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
      });
      toast('已切换至 ' + state.level);
    });

    // 学科
    $$('.filters [data-subject]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (state.subject === btn.dataset.subject) return;
        state.subject = btn.dataset.subject;
        state.clazz = CLASSES[state.subject];
        render();
        toast('已切换至 ' + state.subject + '学科');
      });
    });

    // 班级
    $('#classLinks').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-clazz]');
      if (!btn) return;
      toast('演示原型：班级切换暂未实现');
    });

    // 作业 / 考试勾选
    $('#taskChecks').addEventListener('change', function (e) {
      var input = e.target.closest('input[data-task]');
      if (!input) return;
      var key = input.dataset.task;
      var onCount = activeGroups().length;
      if (!input.checked && onCount <= 1) {
        input.checked = true;
        toast('至少需要保留一项' + (state.mode === 'homework' ? '作业' : '考试'));
        return;
      }
      state.selected[key] = input.checked;
      render();
    });

    // 显示项
    $('#optDeviation').addEventListener('change', function () {
      state.deviation = this.checked;
      renderTable();
    });
    $('#optRate').addEventListener('change', function () {
      state.rate = this.checked;
      renderTable();
    });

    // 排序
    $('#tableHead').addEventListener('click', function (e) {
      var th = e.target.closest('th[data-sort]');
      if (!th) return;
      var key = th.dataset.sort;
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortKey = key;
        state.sortDir = 'asc';
      }
      renderTable();
    });

    // 操作按钮
    $('#exportBtn').addEventListener('click', exportCsv);
    $('#focusExport').addEventListener('click', exportFocusCsv);

    /* ---------- 学科侧重：筛选层 ---------- */

    $('#focusYear').addEventListener('change', function () {
      state.focus.year = this.value;
      toast('统计周期已切换为 ' + this.value);
    });

    // 年级：演示数据仅覆盖高三34班
    $('#focusLevels').addEventListener('click', function (e) {
      var btn = e.target.closest('.chip');
      if (!btn) return;
      if (btn.dataset.level !== '高三') {
        toast('演示数据仅覆盖高三34班');
        return;
      }
      $$('#focusLevels .chip').forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
      });
    });

    $('#focusClasses').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-clazz]');
      if (!btn) return;
      if (btn.dataset.clazz !== state.focus.clazz) {
        toast('演示数据仅覆盖高三34班');
      }
    });

    // 时间 / 作业统一在弹窗内处理
    $('#focusFilterBtn').addEventListener('click', openFocusModal);
    $('#focusModalClose').addEventListener('click', closeFocusModal);
    $('#focusModalCancel').addEventListener('click', closeFocusModal);
    $('#focusModalApply').addEventListener('click', applyFocusModal);

    // 点遮罩关闭
    $('#focusModal').addEventListener('click', function (e) {
      if (e.target === this) closeFocusModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && focusDraft) closeFocusModal();
    });

    // 弹窗内：预设区间
    $('#focusModal').addEventListener('click', function (e) {
      var chip = e.target.closest('#modalRange .chip');
      if (chip) {
        focusDraft.range = chip.dataset.range;
        if (FOCUS_RANGE_DAYS[focusDraft.range] !== undefined) {
          focusDraft.end = FocusReport.TODAY;
          focusDraft.start = shiftDate(FocusReport.TODAY, -FOCUS_RANGE_DAYS[focusDraft.range]);
          $('#modalStart').value = focusDraft.start;
          $('#modalEnd').value = focusDraft.end;
        }
        syncModalRangeChips();
        renderModalTasks();
        return;
      }

      var bulk = e.target.closest('[data-modal-bulk]');
      if (bulk) {
        var on = bulk.dataset.modalBulk === 'all';
        draftHomeworks().forEach(function (hw) { focusDraft.tasks[hw.id] = on; });
        renderModalTasks();
      }
    });

    // 弹窗内：自定义日期
    $('#focusModal').addEventListener('change', function (e) {
      if (e.target.id === 'modalStart' || e.target.id === 'modalEnd') {
        focusDraft.start = $('#modalStart').value || focusDraft.start;
        focusDraft.end = $('#modalEnd').value || focusDraft.end;
        if (focusDraft.start > focusDraft.end) {
          var tmp = focusDraft.start;
          focusDraft.start = focusDraft.end;
          focusDraft.end = tmp;
        }
        focusDraft.range = 'custom';
        $('#modalStart').value = focusDraft.start;
        $('#modalEnd').value = focusDraft.end;
        syncModalRangeChips();
        renderModalTasks();
        return;
      }

      var sub = e.target.closest('input[data-modal-subject]');
      if (sub) {
        var name = sub.dataset.modalSubject;
        var on = sub.checked;
        draftHomeworks().forEach(function (hw) {
          if (hw.subject === name) focusDraft.tasks[hw.id] = on;
        });
        renderModalTasks();
        return;
      }

      var item = e.target.closest('input[data-modal-task]');
      if (item) {
        focusDraft.tasks[item.dataset.modalTask] = item.checked;
        renderModalTasks();
      }
    });
  }

  /* ==================== 启动 ==================== */
  function init() {
    bindEvents();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
