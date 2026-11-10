/* ==========================================================================
   学科诊断 · 数据层 + 渲染层
   依据《班主任作业弱科快速定位方案（目标线可配置版）》：
     · 低分线固定 60%（得分率 <60% 叫「低分」）；目标线 T 可配置（默认 75），只用于收益排序
     · 证据等级：A≥3 份 / B=2 份 / C=1 份，C 级结论标「临时」，下一份复核
     · 未交不按 0 分算，单独用「未交率」反映；Q 超阈值先抓提交，不判能力最弱
     · 班级先判最弱（W 最大）、再判收益（G 最大）→ 只补一科；学生同理
   对外接口：window.DiagnosisReport
     · CLASS_NAME / STUDENTS / SUBJECTS / DEFAULT_PARAMS
     · compute(params) / render(root, opts) / exportRows(params)
   数据口径：只分「已交/未交」，无迟交、无订正；得分均为百分制得分率。
   ========================================================================== */
(function (global) {
  'use strict';

  var TODAY = '2026-11-05';
  var CLASS_NAME = '高三34班';

  /* 复用「跨学科分析」同一班学生名单，保证同一演示班级、口径一致 */
  var STUDENTS = (global.FocusReport && global.FocusReport.STUDENTS) || [];

  /*
    学科配置（演示数据，真实接入时由 configure 或后端替换）：
      base     —— 目标班级平均得分率（%）
      lowShare —— 低分（得分率 <60%）学生占比
      miss     —— 未交率
      weight   —— 学科权重（高考分值/课时，0.8—1.5）
      hws      —— 该科作业清单（份数决定证据等级 A/B/C）
  */
  var SUBJECTS = [
    {
      name: '数学', weight: 1.3, base: 62, lowShare: 0.35, miss: 0.10,
      hws: [
        { id: 'sx-d1', name: '课堂限时练（函数与导数）', full: 60, date: '2026-11-04' }
      ]
    },
    {
      name: '语文', weight: 1.0, base: 74, lowShare: 0.12, miss: 0.05,
      hws: [
        { id: 'yw-d1', name: '知识清单（文言实词与病句）', full: 40, date: '2026-11-03' },
        { id: 'yw-d2', name: '古诗文默写（第3单元）', full: 20, date: '2026-11-03' },
        { id: 'yw-d3', name: '论述类文本限时练', full: 30, date: '2026-11-05' }
      ]
    },
    {
      name: '英语', weight: 1.2, base: 82, lowShare: 0.08, miss: 0.20,
      hws: [
        { id: 'yy-d1', name: '读后续写（二稿）', full: 25, date: '2026-11-02' },
        { id: 'yy-d2', name: '听力42', full: 30, date: '2026-11-03' },
        { id: 'yy-d3', name: '语法填空（定语从句）', full: 20, date: '2026-11-05' }
      ]
    },
    {
      name: '物理', weight: 0.8, base: 68, lowShare: 0.20, miss: 0.12,
      hws: [
        { id: 'wl-d1', name: '库仑定律 电场强度', full: 40, date: '2026-11-04' },
        { id: 'wl-d2', name: '电势能与电势', full: 30, date: '2026-11-05' }
      ]
    },
    {
      name: '化学', weight: 0.7, base: 60, lowShare: 0.30, miss: 0.15,
      hws: [
        { id: 'hx-d1', name: '电化学基础', full: 50, date: '2026-11-03' },
        { id: 'hx-d2', name: '离子方程式', full: 30, date: '2026-11-05' }
      ]
    },
    {
      name: '生物', weight: 0.6, base: 76, lowShare: 0.08, miss: 0.08,
      hws: [
        { id: 'sw-d1', name: '遗传规律限时练', full: 40, date: '2026-11-04' },
        { id: 'sw-d2', name: '细胞代谢', full: 30, date: '2026-11-05' }
      ]
    }
  ];

  var DEFAULT_PARAMS = { T: 75, wMin: 30, wIkMin: 35, gapMin: 8, qHigh: 30 };

  /* ==================== 工具函数 ==================== */

  function seeded(seed) {
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function round1(n) { return Math.round(n * 10) / 10; }
  function isNum(v) { return typeof v === 'number' && !isNaN(v); }

  function mean(arr) {
    var valid = arr.filter(isNum);
    if (!valid.length) return null;
    return valid.reduce(function (a, b) { return a + b; }, 0) / valid.length;
  }

  function f1(v) { return isNum(v) ? round1(v).toFixed(1) : '—'; }
  function f2(v) { return isNum(v) ? (Math.round(v * 100) / 100).toFixed(2) : '—'; }

  function signed(v) {
    if (!isNum(v)) return '—';
    if (Math.abs(v) < 0.05) return '0.0';
    return (v > 0 ? '+' : '') + round1(v).toFixed(1);
  }

  /* ==================== 数据生成（演示） ====================
     逐生逐科逐作业：null = 未交；否则为百分制得分率。
     低分生与正常生分层生成，保证低分占比可控；正常生围绕 base 分布。 */

  var RAW = [];

  function buildRaw() {
    SUBJECTS.forEach(function (sub, si) { sub._idx = si; });
    RAW = STUDENTS.map(function (stu, i) {
      var row = {};
      SUBJECTS.forEach(function (sub, si) {
        var lowTierMean = 44;
        var normalBase = (sub.base - sub.lowShare * lowTierMean) / (1 - sub.lowShare);
        var r = seeded(i * 7 + si * 13 + 1);
        var ability;
        if (r < sub.lowShare) {
          ability = 58 - seeded(i * 3 + si * 5 + 1) * 30;            // [28, 58]
        } else {
          var u = (r - sub.lowShare) / (1 - sub.lowShare);
          ability = normalBase + (u - 0.5) * 16;                     // 正常生离散 ±8
        }
        ability = clamp(ability, 20, 100);
        row[sub.name] = sub.hws.map(function (hw, hi) {
          if (seeded(i * 11 + si * 17 + hi * 23 + 5) < sub.miss) return null;
          var noise = (seeded(i * 3 + si * 5 + hi * 7 + 9) - 0.5) * 8;
          return round1(clamp(ability + noise, 8, 100));
        });
      });
      return row;
    });
  }

  buildRaw();

  /* ==================== 参数归一 ==================== */

  function normalizeParams(p) {
    p = p || {};
    return {
      T: isNum(p.T) ? p.T : DEFAULT_PARAMS.T,
      wMin: isNum(p.wMin) ? p.wMin : DEFAULT_PARAMS.wMin,
      wIkMin: isNum(p.wIkMin) ? p.wIkMin : DEFAULT_PARAMS.wIkMin,
      gapMin: isNum(p.gapMin) ? p.gapMin : DEFAULT_PARAMS.gapMin,
      qHigh: isNum(p.qHigh) ? p.qHigh : DEFAULT_PARAMS.qHigh
    };
  }

  /* ==================== 时间窗 ====================
     页首筛选给定起止日期，只统计窗口内的作业：份数↓ 则证据等级↓、结论转「临时」。 */

  function activeIdx(sub, win) {
    return sub.hws.map(function (hw, hi) { return hi; }).filter(function (hi) {
      var d = sub.hws[hi].date;
      return (!win || !win.start || d >= win.start) && (!win || !win.end || d <= win.end);
    });
  }

  function evidenceOf(nHw) {
    return nHw >= 3 ? 'A' : (nHw === 2 ? 'B' : (nHw === 1 ? 'C' : 'N'));
  }

  function evidenceText(e) {
    return e === 'N' ? '—' : (e === 'A' ? '3 份以上' : (e === 'B' ? '2 份' : '1 份'));
  }

  /* ==================== 班级层面 ==================== */

  function computeClass(params, win) {
    var n = STUDENTS.length;
    return SUBJECTS.map(function (sub) {
      var idxs = activeIdx(sub, win);
      var nHw = idxs.length;
      var due = n * nHw;
      var submitted = 0, rateSum = 0, rateCount = 0, lowCount = 0;
      var lowStudents = {};

      STUDENTS.forEach(function (stu, i) {
        var hasLow = false;
        idxs.forEach(function (hi) {
          var r = RAW[i][sub.name][hi];
          if (r === null) return;                    // 未交：不按 0 分计
          submitted++; rateSum += r; rateCount++;
          if (r < 60) { lowCount++; hasLow = true; }
        });
        if (hasLow) lowStudents[i] = true;
      });

      var R = rateCount ? rateSum / rateCount : null;          // 平均得分率
      var L = rateCount ? (lowCount / rateCount) * 100 : 0;    // 低分率
      var Q = due ? ((due - submitted) / due) * 100 : 0;       // 未交率
      var C = n ? Object.keys(lowStudents).length / n : 0;     // 低分学生占比
      var evidence = evidenceOf(nHw);

      var W = isNum(R) ? 0.5 * (100 - R) + 0.3 * L + 0.2 * Q : null;
      var space = isNum(R) ? Math.max(0, params.T - R) : 0;
      var h = (isNum(R) && R < 30) ? 0.7 : 1.0;
      var G = isNum(R)
        ? space * sub.weight * (0.5 + 0.5 * C) * (1 + 0.5 * Q / 100) * h
        : 0;

      return {
        name: sub.name, weight: sub.weight, nHw: nHw, due: due, submitted: submitted,
        R: R, L: L, Q: Q, C: C, evidence: evidence, W: W, G: G
      };
    });
  }

  function classRanking(stats, params) {
    var submitWarn = stats.filter(function (s) { return s.Q > params.qHigh; });
    var candidates = stats.filter(function (s) {
      return s.Q <= params.qHigh && isNum(s.W) && s.W >= params.wMin;
    });

    var weakest = null, priority = null, tie = false, relativeMode = false;

    if (candidates.length) {
      var byW = candidates.slice().sort(function (a, b) { return b.W - a.W; });
      weakest = byW[0];
      if (byW.length >= 2 && (byW[0].W - byW[1].W) < 5) tie = true;

      var byG = candidates.slice().sort(function (a, b) { return b.G - a.G; });
      priority = byG[0];
    } else {
      relativeMode = true;
      var avgAll = mean(stats.map(function (s) { return s.R; }));
      var rel = stats.filter(function (s) { return isNum(s.R) && s.Q <= params.qHigh; })
        .slice().sort(function (a, b) { return (a.R || 0) - (b.R || 0); });
      weakest = rel[0] || null;
      priority = weakest;
    }

    stats.forEach(function (s) {
      var isPriority = priority && s.name === priority.name;
      var isWeakest = weakest && s.name === weakest.name;
      var label;
      if (relativeMode && isWeakest) label = '相对短板';
      else if (s.Q > params.qHigh) label = '先抓提交';
      else if (isPriority && isWeakest) label = s.evidence === 'C' ? '临时最弱·优先补' : '最弱·优先补';
      else if (isPriority) label = s.evidence === 'C' ? '临时优先补' : '优先补';
      else if (isWeakest) label = s.evidence === 'C' ? '临时最弱' : '最弱';
      else label = '监控';
      s.conclusion = label;
      s.isWeakest = isWeakest;
      s.isPriority = isPriority;
    });

    return {
      stats: stats, candidates: candidates, submitWarn: submitWarn,
      weakest: weakest, priority: priority, tie: tie, relativeMode: relativeMode
    };
  }

  /* ==================== 学生层面 ==================== */

  function computeStudents(params, win) {
    return STUDENTS.map(function (stu, i) {
      var perSub = SUBJECTS.map(function (sub) {
        var idxs = activeIdx(sub, win);
        var cell = idxs.map(function (hi) { return RAW[i][sub.name][hi]; });
        var nHw = cell.length;
        var submittedRates = cell.filter(function (r) { return r !== null; });
        var submitted = submittedRates.length;
        var R = submitted ? mean(submittedRates) : null;
        var lowCount = submittedRates.filter(function (r) { return r < 60; }).length;
        var L = submitted ? (lowCount / submitted) * 100 : 0;
        var Q = nHw ? ((nHw - submitted) / nHw) * 100 : 0;
        return {
          name: sub.name, weight: sub.weight, nHw: nHw,
          R: R, L: L, Q: Q,
          evidence: evidenceOf(nHw)
        };
      });

      var Ri = mean(perSub.map(function (s) { return s.R; }));
      var Ti = isNum(Ri) ? Math.min(Ri, params.T) : params.T;

      perSub.forEach(function (s) {
        s.gap = (isNum(Ri) && isNum(s.R)) ? Ri - s.R : 0;
        s.W = isNum(s.R)
          ? 0.45 * (100 - s.R) + 0.25 * s.L + 0.15 * s.Q +
            0.15 * Math.min(100, Math.max(0, s.gap) * 5)
          : null;
        var space = isNum(s.R) ? Math.max(0, Ti - s.R) : 0;
        var h = (isNum(s.R) && s.R < 30) ? 0.7 : 1.0;
        s.G = isNum(s.R) ? space * s.weight * (1 + 0.5 * s.Q / 100) * h : 0;
      });

      var scoredWithR = perSub.filter(function (s) { return isNum(s.R); });
      var byG = scoredWithR.slice().sort(function (a, b) { return b.G - a.G; });
      var priority = byG[0] || null;

      var eligible = perSub.filter(function (s) {
        return isNum(s.R) && s.Q <= params.qHigh;
      });
      var tooManyMiss = perSub.filter(function (s) { return s.Q > params.qHigh; }).length >= 2;

      var weakest = null, weakestLabel = '';
      if (tooManyMiss || !eligible.length) {
        weakestLabel = '先抓提交';
      } else {
        var strongWeak = eligible.filter(function (s) {
          return s.W >= params.wIkMin && s.gap >= params.gapMin;
        }).sort(function (a, b) { return b.W - a.W; });

        if (strongWeak.length) {
          weakest = strongWeak[0];
          weakestLabel = weakest.evidence === 'C' ? '临时优先补' : '最弱';
        } else {
          var lowSubs = eligible.filter(function (s) { return s.R < 60; });
          if (lowSubs.length >= 2) {
            weakest = lowSubs.slice().sort(function (a, b) { return a.R - b.R; })[0];
            weakestLabel = '整体偏弱，先补最低';
          }
        }
      }

      return {
        stu: stu, perSub: perSub, Ri: Ri,
        priority: priority, weakest: weakest, weakestLabel: weakestLabel,
        tooManyMiss: tooManyMiss
      };
    });
  }

  function studentAction(r, params) {
    var w = r.weakest;
    if (r.tooManyMiss || !w) return '提交跟踪';
    if (w.Q > params.qHigh) return '提交跟踪';
    if (w.R < 30) return '基础补救';
    if (w.evidence === 'C') return '下一份复核';
    return '面批';
  }

  /* ==================== 渲染：标签 / 卡片 / 分区 ==================== */

  function conclusionTag(s) {
    var label = s.conclusion || '监控';
    var cls = 'tag';
    if (/优先补/.test(label)) cls += ' tag--brand';
    else if (/先抓提交/.test(label)) cls += ' tag--late';
    else if (/最弱|相对短板|整体偏弱/.test(label)) cls += ' tag--danger';
    else cls += ' tag--none';
    return '<span class="' + cls + '">' + label + '</span>';
  }

  function actionTag(r, params) {
    var a = studentAction(r, params);
    var cls = 'tag';
    if (a === '面批') cls += ' tag--brand';
    else if (a === '提交跟踪') cls += ' tag--late';
    else if (a === '基础补救') cls += ' tag--danger';
    else cls += ' tag--none';
    return '<span class="' + cls + '">' + a + '</span>';
  }

  function configHTML(params) {
    function field(id, key, label, value, min, max) {
      return '<label class="diag-param"><span>' + label + '</span>' +
        '<input type="number" id="' + id + '" data-diag-param="' + key + '"' +
        ' value="' + value + '" min="' + min + '" max="' + max + '" step="1" /></label>';
    }
    return '<div class="diag-config">' +
      '<span class="diag-config__title">参数设置</span>' +
      field('diagT', 'T', '争分线（目标分）', params.T, 60, 90) +
      field('diagWMin', 'wMin', '班级薄弱程度门槛', params.wMin, 10, 60) +
      field('diagGapMin', 'gapMin', '个人偏科门槛', params.gapMin, 3, 20) +
      field('diagQHigh', 'qHigh', '未交预警线', params.qHigh, 10, 60) +
      '<span class="diag-config__hint">低分线固定为得分率 60% · 争分线只影响补强收益</span>' +
      '</div>';
  }

  /* 标题行口径提示：默认只留一个「?」，hover / 聚焦才展开 */
  function tip(body) {
    return '<span class="q-tip" tabindex="0" role="note" aria-label="查看说明">?' +
      '<span class="q-tip__bubble">' + body + '</span></span>';
  }

  function hintHTML(params, opts) {
    opts = opts || {};
    return '<span class="q-tip q-tip--label" tabindex="0" role="note" aria-label="查看诊断口径">口径 ?' +
      '<span class="q-tip__bubble">' +
      '<span><b>统计范围</b>' + (opts.dateLabel || TODAY) + ' · ' + CLASS_NAME + '（' + STUDENTS.length +
        ' 人），只统计区间内的作业，只分「已交 / 未交」，得分率不到 60% 算低分。</span>' +
      '<span><b>争分线</b>' + params.T + ' 分只用来比较「补哪一科更划算」，不是及格线，可以改。</span>' +
      '<span><b>一个学科有多弱</b>看三件事：平均得分率离满分差多少（占一半）、低分率（占三成）、未交率（占两成），合成一个「薄弱程度」，越大越弱。</span>' +
      '<span><b>先补哪一科</b>看「补强收益」：离争分线的提分空间 × 学科权重 × 低分学生覆盖面 × 提交修正，越大越该先补。所以「最弱」和「先补」可能是两科。</span>' +
      '<span><b>作业份数</b>该科有效作业 3 份以上结论最稳；只有 1 份时标「临时」，下一份作业再复核。</span>' +
      '</span></span>';
  }

  function kpiHTML(classResult, params) {
    var weakest = classResult.weakest;
    var priority = classResult.priority;
    var card = function (label, value, sub, opts) {
      opts = opts || {};
      return '<div class="kpi-card' + (opts.brand ? ' kpi-card--brand' : '') + '">' +
        '<div class="kpi-card__label">' + label + (opts.tip ? tip(opts.tip) : '') + '</div>' +
        '<div class="kpi-card__value">' + value + '</div>' +
        '<div class="kpi-card__sub">' + sub + '</div></div>';
    };
    return '<div class="kpi-row kpi-row--three">' +
      card('班级最弱学科', weakest ? weakest.name : '—',
        weakest
          ? (weakest.evidence === 'C' ? '临时最弱 · ' : '') + '薄弱程度 ' + f1(weakest.W) +
            ' · 得分率低于 60% 的 ' + f1(weakest.L) + '%'
          : '暂无弱科候选',
        { tip: '按「平均得分率低、低分多、未交多」合成的薄弱程度排出的最低一科。' }) +
      card('本周优先补学科', priority ? priority.name : '—',
        priority
          ? (priority.evidence === 'C' ? '临时优先补 · ' : '') + '补强收益 ' + f2(priority.G) +
            ' · 低分涉及 ' + Math.round(priority.C * 100) + '% 学生'
          : (classResult.relativeMode ? '按相对短板处理' : '—'),
        { brand: true, tip: '按「提分空间 × 学科权重 × 低分覆盖面 × 提交情况」算出的性价比最高的学科，可能不是最弱的那一科。' }) +
      card('未交预警学科', classResult.submitWarn.length ? classResult.submitWarn.map(function (s) { return s.name; }).join('、') : '无',
        classResult.submitWarn.length
          ? '未交率超 ' + params.qHigh + '%，先抓提交'
          : '各科未交率均未超 ' + params.qHigh + '%',
        { tip: '未交率超过预警线的学科：先把作业收齐，不拿 0 分判断学科强弱。' }) +
      '</div>';
  }

  function decisionHTML(classResult, params) {
    var weakest = classResult.weakest;
    var priority = classResult.priority;
    var html;
    if (!priority) {
      html = '当前没有进入弱科候选的学科，各科差异在阈值内，维持常规节奏即可。';
    } else if (classResult.relativeMode) {
      html = '<b>相对短板：' + priority.name + '。</b>各科均未达到弱度阈值，' + priority.name +
        ' 相对最低（' + f1(priority.R) + '%），本周优先关注，同时保持整体节奏。';
    } else if (weakest && weakest.name !== priority.name) {
      html = '<b>决策建议：' + weakest.name + '最弱，但本周先补' + priority.name + '。</b>' +
        weakest.name + '的薄弱程度更高（' + f1(weakest.W) + '），但 ' + priority.name +
        '的补强收益更高（' + f2(priority.G) + '）——' +
        '低分涉及人多、可提升空间足、提交也能顺手抓。只补一科，其余监控。';
    } else {
      html = '<b>决策建议：本周优先补' + priority.name + '。</b>' +
        (priority.evidence === 'C'
          ? '当前只有 1 份作业，结论为「临时」，下一份作业复核后再定正式方向。'
          : priority.name + ' 既是最弱学科、又是收益最高学科，适合整班统一讲评。');
    }
    if (classResult.submitWarn.length) {
      html += '<div class="diag-decision-note">' +
        classResult.submitWarn.map(function (s) { return s.name; }).join('、') +
        ' 未交率超 ' + params.qHigh + '%，先做提交管理，不直接判学科能力最弱。</div>';
    }
    return '<div class="diag-decision">' + html + '</div>';
  }

  function classSectionHTML(classResult, params) {
    var stats = classResult.stats.slice().sort(function (a, b) {
      return (b.W || 0) - (a.W || 0);
    });

    var trs = stats.map(function (s) {
      return '<tr' + (s.isPriority ? ' class="is-top"' : '') + '>' +
        '<td class="cell-strong">' + s.name + '</td>' +
        '<td><span class="diag-evidence diag-evidence--' + s.evidence + '">' + evidenceText(s.evidence) + '</span></td>' +
        '<td class="cell-num">' + f1(s.R) + '%</td>' +
        '<td class="cell-num">' + f1(s.L) + '%</td>' +
        '<td class="cell-num">' + f1(s.Q) + '%</td>' +
        '<td class="cell-num">' + Math.round(s.C * 100) + '%</td>' +
        '<td class="cell-num">' + params.T + '</td>' +
        '<td class="cell-num' + (s.isWeakest ? ' cell-strong' : '') + '">' + f1(s.W) + '</td>' +
        '<td class="cell-num' + (s.isPriority ? ' cell-strong' : '') + '">' + f2(s.G) + '</td>' +
        '<td>' + conclusionTag(s) + '</td>' +
        '</tr>';
    }).join('');

    return '<section class="focus-section">' +
      '<div class="focus-section__head">' +
        '<span class="focus-section__idx">一</span>' +
        '<h2 class="focus-section__title">班级各学科薄弱程度与补科收益</h2>' +
        tip('<span>薄弱程度 = 一半看「平均得分率离满分差多少」+ 三成看「低分率」+ 两成看「未交率」，越大越弱。</span>' +
          '<span>补强收益 = 离争分线的提分空间 × 学科权重 × 低分学生覆盖面 × 提交修正，越大越该先补；平均分特别低的学科会打折，因为短期拉不动。</span>' +
          '<span>「最弱」看薄弱程度最高，「先补哪科」看补强收益最高，两者可以不同。只有 1 份作业时结论标「临时」，下一份复核。</span>') +
      '</div>' +
      '<div class="table-card">' +
        '<div class="table-scroll">' +
          '<table class="data-table data-table--compact">' +
            '<thead><tr>' +
              '<th>学科</th><th title="该科在当前时间窗内的有效作业份数，份数越多结论越稳">证据（作业份数）</th>' +
              '<th title="该科所有作业的得分合计 ÷ 满分合计">平均得分率</th><th title="得分率不到 60% 的学生占比">低分率</th>' +
              '<th title="未交人次 ÷ 应交人次">未交率</th><th title="成绩低于争分线又没到低分线的那部分学生占比">低分学生占比</th>' +
              '<th title="设定的目标分，与满分之间的差距就是可提分空间">争分线（分）</th>' +
              '<th title="0—100，越大说明这一科越弱">薄弱程度</th>' +
              '<th title="补上这块短板一晚能拿回多少分，越大越该先补">补强收益（分）</th><th>结论</th>' +
            '</tr></thead>' +
            '<tbody>' + trs + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
      '</section>';
  }

  function studentSectionHTML(studentRows, params) {
    studentRows = studentRows.slice().sort(function (a, b) {
      var aw = a.weakest ? 0 : 1;
      var bw = b.weakest ? 0 : 1;
      if (aw !== bw) return aw - bw;
      var ag = a.weakest ? a.weakest.gap : 0;
      var bg = b.weakest ? b.weakest.gap : 0;
      return ag - bg;
    });

    var trs = studentRows.map(function (r) {
      var w = r.weakest;
      var ev = (w || r.priority || {}).evidence || 'N';
      return '<tr>' +
        '<td class="cell-num">' + r.stu.id + '</td>' +
        '<td>' + r.stu.name + '</td>' +
        '<td class="cell-strong">' + (w ? w.name + ' <span class="cell-hint">' + r.weakestLabel + '</span>' : '—') + '</td>' +
        '<td class="cell-strong">' + (r.priority ? r.priority.name : '—') + '</td>' +
        '<td><span class="diag-evidence diag-evidence--' + ev + '">' + evidenceText(ev) + '</span></td>' +
        '<td class="cell-num">' + (w ? f1(w.R) + '%' : '—') + '</td>' +
        '<td class="cell-num">' + f1(r.Ri) + '%</td>' +
        '<td class="cell-num">' + (w ? '低 ' + f1(w.gap) + ' 分' : '—') + '</td>' +
        '<td class="cell-num">' + (w ? f1(w.Q) + '%' : '—') + '</td>' +
        '<td>' + actionTag(r, params) + '</td>' +
        '</tr>';
    }).join('');

    return '<section class="focus-section">' +
      '<div class="focus-section__head">' +
        '<span class="focus-section__idx">二</span>' +
        '<h2 class="focus-section__title">学生个人弱科与优先补学科</h2>' +
        tip('<span>每人只突出两件事：最弱的一科、当前优先补的一科，两者可以不同。</span>' +
          '<span>「比个人平均低」= 他自己各科的平均分，减掉这一科的分，低得越多说明这一科拖后腿越明显。</span>' +
          '<span>建议动作：多科未交或最弱科未交多 → 先做提交跟踪；得分率低于 30 → 从基础补救；只有 1 份作业 → 下一份复核；其余安排面批。</span>' +
          '<span>未交率超过 ' + params.qHigh + '% 的学科先抓提交，不拿 0 分判能力。</span>') +
      '</div>' +
      '<div class="table-card">' +
        '<div class="table-scroll">' +
          '<table class="data-table data-table--compact">' +
            '<thead><tr>' +
              '<th>学号</th><th>学生</th><th>最弱学科</th><th>优先补学科</th><th>证据（作业份数）</th>' +
              '<th title="这一科的得分率">该科得分率</th><th title="该生所有学科的平均得分率">个人平均</th>' +
              '<th title="个人平均 − 该科得分率，越大说明这一科越拖后腿">比个人平均低</th>' +
              '<th title="未交人次 ÷ 应交人次">未交率</th><th>建议动作</th>' +
            '</tr></thead>' +
            '<tbody>' + trs + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
      '</section>';
  }

  /* ==================== 计算入口 ==================== */

  function compute(params, win) {
    params = normalizeParams(params);
    var stats = computeClass(params, win);
    var classResult = classRanking(stats, params);
    var studentRows = computeStudents(params, win);
    return { params: params, classResult: classResult, studentRows: studentRows };
  }

  /* ==================== 渲染入口 ==================== */

  function render(root, opts) {
    if (!root) return;
    opts = opts || {};
    var result = compute(opts.params, opts.window);

    /* 口径说明不再常驻页面，收到标题行的小问号气泡里 */
    var doc = root.ownerDocument || document;
    var slot = doc.getElementById('diagnosisHintSlot');
    if (slot) slot.innerHTML = hintHTML(result.params, opts);

    var html = '';
    html += configHTML(result.params);
    html += kpiHTML(result.classResult, result.params);
    html += decisionHTML(result.classResult, result.params);
    html += classSectionHTML(result.classResult, result.params);
    html += studentSectionHTML(result.studentRows, result.params);

    root.innerHTML = html;
  }

  /* ==================== 导出数据 ==================== */

  function exportRows(params, win) {
    var result = compute(params, win);
    var rows = [];
    rows.push([
      '学科诊断 · ' + CLASS_NAME + ' · ' + (win
        ? win.start + (win.start === win.end ? '' : ' ~ ' + win.end)
        : TODAY),
      '争分线 ' + result.params.T + ' 分（目标分）；得分率低于 60% 算低分；证据按作业份数：3 份以上最稳、2 份次之、1 份只作临时参考'
    ]);
    rows.push(['学科', '作业份数', '证据（作业份数）', '班级平均得分率', '低分率（得分率<60%）', '未交率',
      '低分学生占比', '争分线（分）', '薄弱程度', '补强收益（分）', '结论']);
    result.classResult.stats.forEach(function (s) {
      rows.push([s.name, s.nHw, evidenceText(s.evidence), f1(s.R), f1(s.L), f1(s.Q),
        Math.round(s.C * 100) + '%', result.params.T, f1(s.W), f2(s.G), s.conclusion]);
    });

    rows.push([]);
    rows.push(['学号', '学生', '最弱学科', '最弱说明', '优先补学科', '证据（作业份数）',
      '该科得分率', '个人平均', '比个人平均低', '未交率', '建议动作']);
    result.studentRows.forEach(function (r) {
      var ev = (r.weakest || r.priority || {}).evidence || 'N';
      rows.push([r.stu.id, r.stu.name,
        r.weakest ? r.weakest.name : '—', r.weakestLabel,
        r.priority ? r.priority.name : '—', evidenceText(ev),
        r.weakest ? f1(r.weakest.R) : '—', f1(r.Ri),
        r.weakest ? '低 ' + f1(r.weakest.gap) + ' 分' : '—',
        r.weakest ? f1(r.weakest.Q) : '—', studentAction(r, result.params)]);
    });
    return rows;
  }

  global.DiagnosisReport = {
    TODAY: TODAY,
    CLASS_NAME: CLASS_NAME,
    STUDENTS: STUDENTS,
    SUBJECTS: SUBJECTS,
    DEFAULT_PARAMS: DEFAULT_PARAMS,
    compute: compute,
    render: render,
    exportRows: exportRows
  };
})(window);
