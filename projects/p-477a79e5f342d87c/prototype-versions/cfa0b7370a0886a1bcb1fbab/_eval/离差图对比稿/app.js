/* ==========================================================================
   各学科得分率条形图 · 旧/新读法静态对比稿
   数据来源：学科侧重表/js/focus-data.js → FocusReport.computeAll()
   （高三34班 · 2026-11-05 · 六科 · 满分加权 pooled 口径，未手工改动）
   ========================================================================== */
(function () {
  'use strict';

  /* 真实算出来的六科指标 ---------------------------------------------------- */
  var DATA = [
    { name: '语文', avg: 77.0, grade: 78.5, hw: 2, ev: 'B', exempt: false, sd: 9.9 },
    { name: '数学', avg: 73.9, grade: 75.8, hw: 2, ev: 'B', exempt: false, sd: 9.4 },
    { name: '英语', avg: 92.9, grade: 88.0, hw: 2, ev: 'B', exempt: true, sd: 6.1 },
    { name: '物理', avg: 77.8, grade: 74.4, hw: 1, ev: 'C', exempt: false, sd: 10.7 },
    { name: '化学', avg: 68.7, grade: 71.2, hw: 1, ev: 'C', exempt: false, sd: 5.0 },
    { name: '生物', avg: 81.3, grade: 78.0, hw: 1, ev: 'C', exempt: false, sd: 9.4 }
  ];

  /* 与页面同源的分数线（CUT.excellent 85 / CUT.good 70 / 逐科低分线 60） */
  var TARGET = 85;
  var LOW = 60;

  /* 离差轴：±6pp —— ceil(max|离差| 4.9 × 1.2 / 2) × 2，不是拍脑袋的 100% */
  var L = 6;

  var $ = function (id) { return document.getElementById(id); };

  function signed(v) {
    return (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v).toFixed(1);
  }

  function deltaCls(v) {
    if (Math.abs(v) < 0.5) return 'delta--flat';
    return v > 0 ? 'delta--up' : 'delta--down';
  }

  function levelOf(avg) {
    if (avg >= 85) return { text: '优', cls: 'pill--ex' };
    if (avg >= 70) return { text: '良', cls: 'pill--good' };
    if (avg >= LOW) return { text: '中', cls: 'pill--mid' };
    return { text: '低分', cls: 'pill--low' };
  }

  /* ---------------- 旧图：条长 = 班均得分率，竖线 = 学科组均（0–100 绝对轴） --------- */

  function renderOld() {
    /* 行序与右图保持一致（按离差升序），让两图的差别只剩“条长口径”这一个变量 */
    var sorted = DATA.slice().sort(function (a, b) {
      return (a.avg - a.grade) - (b.avg - b.grade);
    });
    var html = sorted.map(function (s) {
      var d = s.avg - s.grade;
      return '<div class="bar-row">' +
        '<span class="bar-row__label">' + s.name + '</span>' +
        '<span class="bar-row__track">' +
          '<span class="bar-row__fill" style="width:' + s.avg.toFixed(1) + '%"></span>' +
          '<span class="bar-row__mark" style="left:' + s.grade.toFixed(1) + '%" ' +
            'title="' + s.name + '学科组均 ' + s.grade.toFixed(1) + '%"></span>' +
        '</span>' +
        '<span class="bar-row__value">' + s.avg.toFixed(1) + '%</span>' +
        '<span class="bar-row__delta ' + deltaCls(d) + '">' + signed(d) + '</span>' +
        '</div>';
    }).join('');
    $('oldChart').innerHTML = '<div class="bar-list">' + html + '</div>';
  }

  /* ---------------- 新图：条长 = 班均 − 学科组均，零点 = 学科组均 ------------------ */

  var absMode = 'pill';

  function pos(v) { return 50 + v / (2 * L) * 100; }   /* 百分点 → 轨道百分比 */
  function width(v) { return Math.abs(v) / (2 * L) * 100; }

  function axisHTML() {
    var ticks = [-4, -2, 0, 2, 4];
    return '<span></span>' +
      '<span class="dv-axis__scale">' +
        ticks.map(function (t) {
          var txt = t === 0 ? '0' : (t > 0 ? '+' : '−') + Math.abs(t) + 'pp';
          return '<span style="left:' + pos(t).toFixed(2) + '%">' + txt + '</span>';
        }).join('') +
      '</span>' +
      '<span class="dv-axis__cap">班均 / 组均</span>';
  }

  /* 绝对水平的两种补位方式：与离差轴解耦，只挂在学科名下方，不参与条长 */
  function pillOf(s) {
    if (absMode !== 'pill') return '';
    var lv = levelOf(s.avg);
    return '<em class="pill ' + lv.cls + '" title="按得分率分档：优 ≥85 / 良 70～85 / 中 60～70 / 低分 &lt;60">' +
      lv.text + '</em>';
  }

  function microOf(s) {
    if (absMode !== 'mini') return '';
    return '<span class="micro" title="迷你条 = 班均得分率 ' + s.avg.toFixed(1) +
      '%，竖线 = 本科达标线 85%">' +
      '<i style="width:' + s.avg.toFixed(1) + '%"></i>' +
      '<u style="left:' + TARGET + '%"></u>' +
      '</span>';
  }

  function renderNew() {
    var sorted = DATA.slice().sort(function (a, b) { return (a.avg - a.grade) - (b.avg - b.grade); });
    var html = sorted.map(function (s) {
      var d = +(s.avg - s.grade).toFixed(1);
      var flat = Math.abs(d) < 1;
      var cls = flat ? 'dv-row__bar--flat' : (d < 0 ? 'dv-row__bar--neg' : 'dv-row__bar--pos');
      var barStyle = flat
        /* 持平：条贴中轴、极短，不给方向误导 */
        ? 'left:' + (pos(-Math.abs(d) / 2)).toFixed(2) + '%;width:' + width(d).toFixed(2) + '%'
        : (d < 0
            ? 'right:' + (100 - pos(0)).toFixed(2) + '%;width:' + width(d).toFixed(2) + '%'
            : 'left:' + pos(0).toFixed(2) + '%;width:' + width(d).toFixed(2) + '%');

      return '<div class="dv-row">' +
        '<span class="dv-row__label">' +
          '<span class="nm">' + s.name + pillOf(s) +
            '<i class="ev" title="本科 ' + s.hw + ' 份作业，证据 ' + s.ev + ' 级' +
              (s.ev === 'C' ? '（单份作业，差值波动较大，判定需复核）' : '') + '">' + s.ev + '</i>' +
          '</span>' +
          microOf(s) +
        '</span>' +
        '<span class="dv-row__track">' +
          '<span class="dv-row__band"></span>' +
          '<span class="dv-row__gap" title="班级判弱线：低于学科组 5 个百分点（数值按学科可配，本次六科均为 5pp）"></span>' +
          '<span class="dv-row__zero"></span>' +
          '<span class="dv-row__bar ' + cls + (s.exempt ? ' dv-row__bar--hatch' : '') + '" style="' + barStyle + '"' +
            ' title="' + s.name + '：班均 ' + s.avg.toFixed(1) + '% − 学科组均 ' + s.grade.toFixed(1) +
            '% = ' + signed(d) + ' 个百分点' + (s.exempt ? '（满分区，P75 ≥ 95%，差值主要来自赋分颗粒度）' : '') + '"></span>' +
        '</span>' +
        '<span class="dv-row__num">' +
          '<b class="' + deltaCls(d) + '">' + signed(d) + '</b>' +
          '<small>' + s.avg.toFixed(1) + '% / ' + s.grade.toFixed(1) + '%</small>' +
        '</span>' +
        '</div>';
    }).join('');
    $('newChart').innerHTML =
      '<div class="dv-axis">' + axisHTML() + '</div>' +
      '<div class="dv-rows">' + html + '</div>';
  }

  /* ---------------- 切换绝对水平的展示方式 ---------------- */

  function bindSeg() {
    var box = $('absMode');
    if (!box) return;
    box.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-mode]');
      if (!btn) return;
      absMode = btn.getAttribute('data-mode');
      Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) {
        b.classList.toggle('is-on', b === btn);
      });
      renderNew();
    });
  }

  /* ---------------- 启动 ---------------- */

  /* 支持用 #abs=mini / #abs=none 直接打开到指定态，便于对比与截图 */
  function initMode() {
    var m = /abs=(pill|mini|none)/.exec(location.hash + location.search);
    if (m) absMode = m[1];
    var box = $('absMode');
    if (!box) return;
    Array.prototype.forEach.call(box.querySelectorAll('button'), function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-mode') === absMode);
    });
  }

  function init() {
    initMode();
    renderOld();
    renderNew();
    bindSeg();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
