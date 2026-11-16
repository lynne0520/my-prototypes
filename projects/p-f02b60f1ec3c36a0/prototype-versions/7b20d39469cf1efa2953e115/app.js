/* ============================================================
 * app.js — 页面渲染 + 导出配置 + 生成流程
 * ============================================================ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const HW = window.HW;
  const ROSTER = window.HW_ROSTER;

  /* ---------------- 配置状态 ---------------- */
  const cfg = {
    questionIds: HW.questions.map((q) => q.id),
    scope: "all",
    bands: ["优", "良", "差"],
    picked: [],
    org: "per-student",
    order: "score-desc",
    cover: true,
    overview: true,
    toc: true,
    modules: { basic: true, text: true, dims: true, corrections: true, analysis: true, polish: false, image: false },
    expContent: null,
    nameTpl: "{班级}_{作业名}_{学生姓名}_智批报告",
  };

  const MODULES = [
    { k: "basic", name: "基本信息", desc: "得分 / 档位 / 字数 / 标签" },
    { k: "text", name: "原文与旁批", desc: "修订对照 + 纠错编号上标" },
    { k: "dims", name: "评分维度", desc: "内容 / 语言 / 结构评语" },
    { k: "corrections", name: "纠错详情", desc: "原词→修订、知识点" },
    { k: "analysis", name: "详细分析", desc: "语法 / 句式 / 连贯" },
    { k: "polish", name: "润色提升", desc: "原句与升格句对照" },
    { k: "image", name: "原卷扫描图", desc: "内嵌学生手写卷面" },
  ];

  /* ---------------- 基础渲染 ---------------- */
  function renderMeta() {
    $("#metaRow").innerHTML = `
      <select class="sel"><option>英语作文</option><option>语文作文</option></select>
      <span class="sep">|</span>
      <span><span class="k">扫描时间：</span><span class="v">${HW.scanTime}</span></span>
      <span class="sep">|</span>
      <span><span class="k">作业满分：</span><span class="v">${HW.fullScore}</span></span>
      <span class="sep">|</span>
      <span><span class="k">作业平均分：</span><span class="v">${HW.avg}</span></span>
      <span class="sep">|</span>
      <span><span class="k">已交人数：</span><span class="v">${HW.submitted}</span></span>
      <span class="sep">|</span>
      <span><span class="k">未交人数：</span><span class="warn">${HW.absent.length}（异常学号卡？）</span></span>
      <span class="sep">|</span>
      <span><span class="k">未交名单：</span><span class="warn">${HW.absent.join(",")}</span></span>`;
  }

  function renderStat() {
    const qs = HW.questions;
    const rows = [
      ["题号", ...qs.map((q) => `${q.no}　${q.type}`)],
      ["年级得分率", ...qs.map((q) => q.rate + "%")],
      ["英语作文得分率", ...qs.map((q) => q.rate + "%")],
      ["年级平均分", ...qs.map((q) => q.qAvg)],
      ["英语作文平均分", ...qs.map((q) => q.qAvg)],
    ];
    $("#statTable").innerHTML = rows
      .map((r, i) => `<tr>${r.map((c, j) => (i === 0 || j === 0 ? `<th>${c}</th>` : `<td>${c}</td>`)).join("")}</tr>`)
      .join("");
  }

  function renderQuestions() {
    $("#questionList").innerHTML = HW.questions
      .map(
        (q) => `
      <div class="q-card">
        <div class="q-head">
          <span class="q-no">${q.no}</span>
          <span class="q-type">${q.type}</span>
          <span class="q-rate">得分率：<b>${q.rate}%</b>　平均 <b>${q.qAvg}</b> / ${q.fullScore}</span>
        </div>
        <div class="q-body">
          <div class="q-stem"><span class="ln">1.</span>${q.stem}</div>
          <div class="q-side">
            <div class="row"><span>AI 已批阅</span><b>${HW.submitted} / ${HW.submitted + HW.absent.length} 人</b></div>
            <div class="row"><span>人均错误点</span><b>${q.id === "q1" ? "7.2" : "5.6"} 处</b></div>
            <div class="row"><span>高频错因</span><b>${q.id === "q1" ? "单复数 / 时态" : "细节描写不足"}</b></div>
            <div class="q-actions">
              <button class="qa accent" data-rep="${q.id}">📄 智批报告</button>
              <button class="qa">📊 数据分析</button>
              <button class="qa">＋ 添加类题</button>
              <button class="qa">⤢ 全屏显示</button>
            </div>
          </div>
        </div>
      </div>`,
      )
      .join("");

    $$("[data-rep]").forEach((b) => b.addEventListener("click", () => openReport(ROSTER.find((s) => s.name === "周泽同"), b.dataset.rep)));
  }

  /* ---------------- 学生筛选 ---------------- */
  function pickedStudents() {
    let list = ROSTER.slice();
    if (cfg.scope === "band") list = list.filter((s) => cfg.bands.includes(s.level));
    if (cfg.scope === "pick") list = list.filter((s) => cfg.picked.includes(s.name));
    if (cfg.order === "score-desc") list.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "zh"));
    else if (cfg.order === "name") list.sort((a, b) => a.name.localeCompare(b.name, "zh"));
    return list;
  }

  function fileName(student) {
    const date = HW.scanTime;
    let n = cfg.nameTpl
      .replace(/{班级}/g, HW.klass)
      .replace(/{作业名}/g, HW.name)
      .replace(/{学生姓名}/g, student ? student.name : "班级合订")
      .replace(/{题号}/g, cfg.questionIds.map((q) => HW.questions.find((x) => x.id === q).no).join("+"))
      .replace(/{日期}/g, date);
    return n.replace(/[\\/:*?"<>|]/g, "-") + ".docx";
  }

  /* ---------------- 弹窗 ---------------- */
  function openDialog(presetOrg) {
    if (presetOrg) cfg.org = presetOrg;
    renderDialog();
    $("#mask").classList.add("show");
  }

  function renderDialog() {
    const students = pickedStudents();
    const pieces = students.length * cfg.questionIds.length;
    $("#dlgSub").textContent = `本作业共 ${HW.questions.length} 道作文题 · ${HW.submitted} 名学生 · 已勾选 ${cfg.questionIds.length} 题 / ${students.length} 人`;

    /* 题目 */
    $("#qChips").innerHTML = HW.questions
      .map(
        (q) => `
      <label class="q-chip ${cfg.questionIds.includes(q.id) ? "on" : ""}" data-q="${q.id}">
        <span class="cbox">${cfg.questionIds.includes(q.id) ? "✓" : ""}</span>
        <span>
          <b>${q.no}　${q.type}</b>
          <span class="meta">满分 ${q.fullScore} · 得分率 ${q.rate}% · 平均 ${q.qAvg} 分</span>
        </span>
      </label>`,
      )
      .join("");
    $$("#qChips .q-chip").forEach((el) =>
      el.addEventListener("click", () => {
        const id = el.dataset.q;
        if (cfg.questionIds.includes(id)) {
          if (cfg.questionIds.length === 1) return toast("至少保留一道作文题");
          cfg.questionIds = cfg.questionIds.filter((x) => x !== id);
        } else cfg.questionIds.push(id);
        cfg.questionIds.sort((a, b) => (a === "q1" ? -1 : 1));
        renderDialog();
      }),
    );

    /* 学生范围 */
    $$("#scopeRow input").forEach((r) => {
      r.checked = r.value === cfg.scope;
      r.closest(".radio").classList.toggle("on", r.checked);
      r.onchange = () => {
        cfg.scope = r.value;
        renderDialog();
      };
    });
    const bandBox = $("#bandPicker");
    bandBox.hidden = cfg.scope !== "band";
    if (cfg.scope === "band") {
      const counts = { 优: "12–15 分", 良: "9–12 分", 差: "0–9 分" };
      bandBox.innerHTML = ["优", "良", "差"]
        .map(
          (b) => `<button class="bp-item ${cfg.bands.includes(b) ? "on" : ""}" data-b="${b}">${b}（${counts[b]}）<b>${ROSTER.filter((s) => s.level === b).length} 人</b></button>`,
        )
        .join("");
      $$("#bandPicker .bp-item").forEach((el) =>
        el.addEventListener("click", () => {
          const b = el.dataset.b;
          cfg.bands = cfg.bands.includes(b) ? cfg.bands.filter((x) => x !== b) : [...cfg.bands, b];
          renderDialog();
        }),
      );
    }
    const pickBox = $("#pickPicker");
    pickBox.hidden = cfg.scope !== "pick";
    if (cfg.scope === "pick") {
      pickBox.innerHTML = ROSTER.map(
        (s) => `<button class="pick-item ${cfg.picked.includes(s.name) ? "on" : ""}" data-n="${s.name}">${s.name}</button>`,
      ).join("");
      $$("#pickPicker .pick-item").forEach((el) =>
        el.addEventListener("click", () => {
          const n = el.dataset.n;
          cfg.picked = cfg.picked.includes(n) ? cfg.picked.filter((x) => x !== n) : [...cfg.picked, n];
          renderDialog();
        }),
      );
    }

    /* 组织方式 */
    $$("#orgCards .org-card").forEach((card) => {
      card.classList.toggle("on", card.dataset.org === cfg.org);
      card.onclick = () => {
        cfg.org = card.dataset.org;
        renderDialog();
      };
    });
    $("#namePreviewPer").textContent = fileName(ROSTER.find((s) => s.name === "周泽同"));
    $("#namePreviewClass").textContent = fileName(null).replace("班级合订", "智批报告(班级合订)");

    /* 排序与合订附加 */
    $("#orderSel").childNodes[0].nodeValue =
      { "score-desc": "按得分从高到低", name: "按姓名拼音", orig: "按名单顺序" }[cfg.order] + " ";
    $("#orderSel").onclick = () => {
      cfg.order = cfg.order === "score-desc" ? "name" : cfg.order === "name" ? "orig" : "score-desc";
      renderDialog();
    };
    $$("[data-class-opt]").forEach((l) => (l.style.display = cfg.org === "class" ? "inline-flex" : "none"));
    $("#optCover").checked = cfg.cover;
    $("#optOverview").checked = cfg.overview;
    $("#optToc").checked = cfg.toc;
    $("#optCover").onchange = (e) => (cfg.cover = e.target.checked);
    $("#optOverview").onchange = (e) => (cfg.overview = e.target.checked);
    $("#optToc").onchange = (e) => (cfg.toc = e.target.checked);

    /* 内容模块 */
    $("#modGrid").innerHTML = MODULES.map(
      (m) => `
      <label class="mod-item ${cfg.modules[m.k] ? "on" : ""}" data-m="${m.k}">
        <input type="checkbox" ${cfg.modules[m.k] ? "checked" : ""} />
        <span>${m.name}<small>${m.desc}</small></span>
      </label>`,
    ).join("");
    $$("#modGrid .mod-item").forEach((el) =>
      el.addEventListener("click", (ev) => {
        ev.preventDefault();
        const k = el.dataset.m;
        cfg.modules[k] = !cfg.modules[k];
        renderDialog();
      }),
    );

    /* 命名 */
    const input = $("#nameTpl");
    input.value = cfg.nameTpl;
    input.oninput = () => {
      cfg.nameTpl = input.value || "{班级}_{作业名}_{学生姓名}_智批报告";
      $("#namePreviewPer").textContent = fileName(ROSTER[0]);
      $("#namePreviewClass").textContent = fileName(null).replace("班级合订", "智批报告(班级合订)");
    };

    /* 预估 */
    const fileCount = cfg.org === "class" ? 1 : students.length;
    $("#est").innerHTML = `预计 <b>${fileCount}</b> 个文件 · <b>${pieces}</b> 篇报告 · 约 <b>${((pieces * 46) / 1024).toFixed(1)} MB</b>`;
    $("#btnStart").disabled = pieces === 0;
  }

  /* ---------------- 生成 ---------------- */
  let busy = false;

  async function runExport() {
    if (busy) return;
    const students = pickedStudents();
    const qids = cfg.questionIds.slice();
    if (!students.length || !qids.length) return toast("请至少选择 1 名学生与 1 道作文题");

    busy = true;
    $("#mask").classList.remove("show");
    const wrap = $("#progressWrap");
    wrap.hidden = false;
    const units = cfg.org === "class" ? 1 : students.length;
    const totalPieces = students.length * qids.length;

    const scan = cfg.modules.image ? makeScan() : null;
    const exportTime = new Date().toLocaleString("zh-CN", { hour12: false });
    const files = [];
    let done = 0;

    const paint = (label) => {
      const pct = Math.round((done / units) * 100);
      $("#pgPct").textContent = pct + "%";
      $("#pgFill").style.width = pct + "%";
      $("#pgLine").textContent = label;
      $("#pgCount").textContent = `${done} / ${units} 个文件`;
    };
    paint("准备文档结构…");

    try {
      if (cfg.org === "class") {
        $("#pgTitle").textContent = "正在生成班级合订本…";
        const blob = await window.REPORT_DOCX.buildClassDoc(students, qids, Object.assign({ exportTime }, cfg), scan);
        done = 1;
        paint(`合订完成：${students.length} 人 · ${totalPieces} 篇`);
        files.push({ name: fileName(null), blob });
      } else {
        $("#pgTitle").textContent = "正在生成智批报告…";
        for (let i = 0; i < students.length; i++) {
          const s = students[i];
          paint(`${s.name}（第 ${i + 1}/${students.length} 人）· ${qids.length} 篇`);
          const blob = await window.REPORT_DOCX.buildStudentDoc(s, qids, cfg, scan);
          files.push({ name: fileName(s), blob });
          done = i + 1;
          paint(`${s.name} 完成 · 共 ${files.length} 个文件`);
          await new Promise((r) => setTimeout(r, 12));
        }
      }
      await new Promise((r) => setTimeout(r, 200));
      wrap.hidden = true;
      showResult(files, students.length, totalPieces);
    } catch (e) {
      wrap.hidden = true;
      console.error(e);
      toast("生成失败：" + e.message);
    } finally {
      busy = false;
    }
  }

  function showResult(files, studentCount, pieces) {
    const panel = $("#resultPanel");
    panel.hidden = false;
    $("#rpTitle").textContent = `导出完成 · ${files.length} 个 Word 文件`;
    $("#rpSub").textContent = `${studentCount} 名学生 · ${pieces} 篇报告 · 合计 ${(files.reduce((a, f) => a + f.blob.size, 0) / 1024 / 1024).toFixed(2)} MB`;
    $("#rpList").innerHTML = files
      .map(
        (f, i) => `
      <div class="rp-row">
        <span class="doc-ico">DOC</span>
        <span class="rp-name">${f.name}<small>${(f.blob.size / 1024).toFixed(0)} KB · Word 文档</small></span>
        <button class="rp-dl" data-i="${i}">下载</button>
      </div>`,
      )
      .join("");
    $$("#rpList .rp-dl").forEach((b) =>
      b.addEventListener("click", () => download(files[Number(b.dataset.i)].blob, files[Number(b.dataset.i)].name)),
    );
    $("#rpDownload").onclick = async () => {
      if (files.length === 1) return download(files[0].blob, files[0].name);
      const bytes = [];
      for (const f of files) bytes.push({ name: f.name, bytes: new Uint8Array(await f.blob.arrayBuffer()) });
      const zip = window.DOCX.zipStore(bytes);
      download(zip, `${HW.klass}_${HW.name}_智批报告_${files.length}份.zip`);
      toast(`已打包 ${files.length} 个 Word 文件`);
    };
  }

  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  /* 模拟手写卷面图 */
  let scanCache = null;
  function makeScan() {
    if (scanCache) return scanCache;
    const c = document.createElement("canvas");
    c.width = 900;
    c.height = 560;
    const g = c.getContext("2d");
    g.fillStyle = "#fdfcf7";
    g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = "#d9d3c3";
    g.lineWidth = 1;
    for (let y = 80; y < c.height; y += 34) {
      g.beginPath();
      g.moveTo(40, y);
      g.lineTo(c.width - 40, y);
      g.stroke();
    }
    g.strokeStyle = "#c62828";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(40, 46);
    g.lineTo(c.width - 40, 46);
    g.stroke();
    g.fillStyle = "#2f3b52";
    g.font = "italic 19px 'Segoe Script', cursive";
    const lines = [
      "Dear Moss,",
      "I'm writing to share a vlog recording the beautiful",
      "moments in our school. In the video, you can see the",
      "morning reading, the football match on the playground",
      "and the art festival last Friday. Making it, I found",
      "that beauty hides in every ordinary day.",
      "Yours, Li Hua",
    ];
    lines.forEach((t, i) => g.fillText(t, 56, 96 + i * 34));
    g.strokeStyle = "#e2725b";
    g.lineWidth = 1.6;
    g.beginPath();
    g.ellipse(300, 200, 60, 12, 0, 0, Math.PI * 2);
    g.stroke();
    scanCache = { base64: c.toDataURL("image/png").split(",")[1], w: 520, h: 323 };
    return scanCache;
  }

  /* ---------------- 单篇报告预览 ---------------- */
  let repCtx = { student: null, qid: "q1", pane: "detail" };

  function openReport(student, qid) {
    repCtx.student = student;
    repCtx.qid = qid;
    repCtx.pane = "detail";
    $$(".rv-tab").forEach((t) => t.classList.toggle("active", t.dataset.pane === "detail"));
    renderReport();
    $("#repMask").classList.add("show");
  }

  function starsHtml(n) {
    let h = "";
    for (let i = 1; i <= 5; i++) h += `<span class="${i <= n ? "on" : "off"}">★</span>`;
    return h;
  }

  function renderReport() {
    const s = repCtx.student;
    const q = HW.questions.find((x) => x.id === repCtx.qid);
    const rep = s.reports[repCtx.qid];
    $("#repStudent").textContent = s.name;
    $("#repH1").textContent = `${q.type}智批报告`;
    $("#repMeta").innerHTML =
      `<span>姓名：<b>${s.name}</b></span><span>要求：<b>${rep.stat.limit}</b></span>` +
      `<span>全文：<b>${rep.stat.words}词</b></span><span>满分：<b>${q.fullScore}分</b></span>`;
    $("#repScore").innerHTML = `${rep.score}<i>✎</i>`;
    $("#repMedal").textContent = rep.levelName;
    $("#repTags").innerHTML = rep.tags
      .map((t, i) => {
        const cls = i < 3 ? "" : i === rep.tags.length - 1 && rep.tags.length > 4 ? "info" : "ok";
        return `<span class="rv-tag ${cls}">${t}</span>`;
      })
      .join("");
    $("#repParas").innerHTML = rep.paras
      .map((segs, pi) => {
        const html = segs
          .map((x) => {
            if (x.del != null)
              return `<span class="rv-hl"><span class="rv-num">${x.n}</span><span class="rv-strike">${x.del}</span> <span class="rv-correct">${x.ins}</span></span>`;
            return x.text;
          })
          .join("");
        return `<p class="rv-para"><span class="rv-paranum">${pi + 1}</span>${html}</p>`;
      })
      .join("");
    const scan = makeScan();
    $("#repScan").innerHTML = `<img src="data:image/png;base64,${scan.base64}" alt="原卷扫描图" />`;
    renderRepRight(rep);
    setupQuestionSelect();
  }

  /* 题号下拉：仅当该作业 ≥ 2 道作文题时显示，切换当前报告题目 */
  function setupQuestionSelect() {
    const sel = $("#repQSelect");
    const qs = HW.questions;
    sel.classList.remove("open");
    if (qs.length < 2) {
      sel.hidden = true;
      return;
    }
    sel.hidden = false;
    const cur = qs.find((x) => x.id === repCtx.qid) || qs[0];
    $(".rv-qlabel", sel).textContent = `${cur.no} ${cur.type}`;
    $("#repQMenu").innerHTML = qs
      .map(
        (q) => `<div class="rv-menu-item ${q.id === repCtx.qid ? "on" : ""}" data-qid="${q.id}"><span class="qno">${q.no}</span>${q.type}</div>`,
      )
      .join("");
  }

  /* ---- 环形图（SVG donut）---- */
  function donutSvg(segs, colors, size, thickness, cTop, cSub) {
    const total = segs.reduce((a, s) => a + s.value, 0) || 1;
    const r = (size - thickness) / 2;
    const C = 2 * Math.PI * r;
    let off = 0;
    const arcs = segs
      .map((s, i) => {
        const len = (s.value / total) * C;
        const el = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="${thickness}" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 ${size / 2} ${size / 2})"></circle>`;
        off += len;
        return el;
      })
      .join("");
    return `<svg class="rv-donut" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#eef1f6" stroke-width="${thickness}"></circle>
      ${arcs}
      <text x="${size / 2}" y="${size / 2 - 1}" text-anchor="middle" class="rv-donut-num">${cTop}</text>
      <text x="${size / 2}" y="${size / 2 + 17}" text-anchor="middle" class="rv-donut-lbl">${cSub}</text>
    </svg>`;
  }

  function donutLegend(segs, colors) {
    const total = segs.reduce((a, s) => a + s.value, 0) || 1;
    return `<div class="rv-ring-legend">${segs
      .map(
        (s, i) =>
          `<div class="rv-ring-li"><i style="background:${colors[i % colors.length]}"></i><span class="n">${s.name}</span><span class="v">${s.value}（${Math.round((s.value / total) * 100)}%）</span></div>`,
      )
      .join("")}</div>`;
  }

  /* ---- 智批详情：详细分析三环形图 ---- */
  function analysisHtml(rep) {
    const C = window.RING_COLORS;
    const ring = rep.rings;
    const sec = (title, desc, segs, cTop, cSub) => `
      <div class="rv-ana-sec">
        <div class="rv-ana-h">${title}</div>
        <div class="rv-ana-desc">${desc}</div>
        <div class="rv-ring">${donutSvg(segs, C, 128, 16, cTop, cSub)}${donutLegend(segs, C)}</div>
      </div>`;
    const gTot = ring.grammar.reduce((a, s) => a + s.value, 0);
    const sTot = ring.structure.reduce((a, s) => a + s.value, 0);
    const cPct = sTot ? Math.round((ring.structure[0].value / sTot) * 100) + "%" : "0%";
    const cTot = ring.coherence.reduce((a, s) => a + s.value, 0);
    return `
      <div class="rv-sec-title">详细分析</div>
      ${sec("语法错误", rep.analysis[0].text, ring.grammar, gTot, "处错误")}
      ${sec("句子结构", rep.analysis[1].text, ring.structure, cPct, "复杂句")}
      ${sec("逻辑连贯", rep.analysis[2].text, ring.coherence, cTot, "处衔接")}`;
  }

  /* ---- 润色提升：5 模块 ---- */
  function polishHtml(rep) {
    const r = rep.rich;
    const more = r.more
      .map(
        (m) => `<div class="rv-exp-item">
          <div class="rv-exp-row orig"><span class="rv-exp-t">我的原文</span><span class="rv-exp-c">${m.orig}</span></div>
          <div class="rv-exp-row basic"><span class="rv-exp-t">基础提升</span><span class="rv-exp-c">${m.basicHtml}<span class="rv-exp-note">${m.basicNote}</span></span></div>
          <div class="rv-exp-row adv"><span class="rv-exp-t">高级表达</span><span class="rv-exp-c">${m.advHtml}<span class="rv-exp-note">${m.advNote}</span></span></div>
        </div>`,
      )
      .join("");
    const logic = r.logic.length
      ? r.logic
          .map(
            (l) => `<div class="rv-con-item">
              <span class="rv-con-tag">${l.tag}</span>
              <div class="rv-con-row orig"><span class="rv-con-t">原文</span><span class="rv-con-x">${l.orig}</span></div>
              <div class="rv-con-row imp"><span class="rv-con-t">提升</span><span class="rv-con-x">${l.improved}</span></div>
              <div class="rv-con-row rsn"><span class="rv-con-t">→</span><span class="rv-con-x">${l.reason}</span></div>
            </div>`,
          )
          .join("")
      : `<div class="rv-empty">暂无可提升的衔接词</div>`;
    const best = r.best
      .map(
        (g) => `<div class="rv-best-group"><div class="rv-subtitle-s">${g.group}</div>${g.items
          .map((it) => `<div class="rv-ti-item"><p class="rv-ti-title">${it.html}</p><span class="rv-ti-tag">${it.tag}</span></div>`)
          .join("")}</div>`,
      )
      .join("");
    const full = `
      <div class="rv-letter-box">
        <div class="rv-letter">${r.full.paras.map((p) => `<p class="letter-${p.cls}">${p.text}</p>`).join("")}</div>
        <div class="rv-letter-note">${r.full.note}</div>
      </div>
      <div class="rv-subtitle-s">润色对照分析</div>
      <table class="rv-cmp-table">
        <thead><tr><th>维度</th><th>学生原文状态</th><th>润色方向</th></tr></thead>
        <tbody>${r.full.compare.map((c) => `<tr><td class="c-dim">${c.dim}</td><td>${c.status}</td><td>${c.direction}</td></tr>`).join("")}</tbody>
      </table>`;
    const sug = r.suggestions
      .map((s) => `<div class="rv-sug-item ${s.cat}"><span class="rv-sug-tag">${s.cat}</span><span class="rv-sug-text">${s.text}</span></div>`)
      .join("");
    return `
      <div class="rv-card"><div class="rv-card-title">更多表达</div>${more}</div>
      <div class="rv-card"><div class="rv-card-title">逻辑提升</div>${logic}</div>
      <div class="rv-card"><div class="rv-card-title">学生佳句</div>${best}</div>
      <div class="rv-card"><div class="rv-card-title">全文润色</div>${full}</div>
      <div class="rv-card"><div class="rv-card-title">提升建议</div>${sug}</div>`;
  }

  function renderRepRight(rep) {
    const box = $("#repRight");
    if (repCtx.pane === "polish") {
      box.innerHTML = polishHtml(rep);
      return;
    }
    box.innerHTML = `
      <div class="rv-base">📐 基数数据
        <span class="rv-divider"></span><b>${rep.stat.words}</b> 词数
        <span class="rv-divider"></span><b>${rep.stat.sentences}</b> 句数
        <span class="rv-divider"></span><b>${rep.stat.paragraphs}</b> 段数
      </div>
      <div class="rv-sec-title">评分维度详情</div>
      <div class="rv-overall">
        <span class="rv-overall-title">综合评价</span>
        <div class="rv-overall-body">${rep.overview}</div>
      </div>
      ${rep.dims
        .map(
          (d) => `<div class="rv-dim">
            <div class="rv-dim-head"><span class="rv-dim-label">${d.name}</span><span class="rv-stars">${starsHtml(d.stars)}</span></div>
            <div class="rv-dim-comment">${d.text}</div>
          </div>`,
        )
        .join("")}
      <div class="rv-sec-title">纠错详情（${rep.corrections.length} 处）</div>
      ${rep.corrections
        .map(
          (c) => `<div class="rv-err">
            <span class="rv-err-index">${c.n}</span>
            <div class="rv-err-body">
              <div class="rv-err-pair">
                <span class="rv-err-word">${c.from}</span><span class="rv-err-arrow">→</span><span class="rv-err-fix">${c.to}</span>
                <span class="rv-err-tag">${c.type}</span>
              </div>
              <div class="rv-err-explain">${c.note}</div>
              <div class="rv-err-tip">${c.tip}</div>
            </div>
          </div>`,
        )
        .join("")}
      ${analysisHtml(rep)}`;
  }

  /* ---------------- 导出内容：默认值 / 读取 / 摘要 ---------------- */
  const EXP_DEFAULTS = {
    img: true,
    imgMode: "raw",
    score: true,
    scoreMode: "hide",
    mods: { dims: true, rev: true, err: true, more: true, logic: true, best: true, full: true, cmp: true, sug: true },
  };
  const EXP_MOD_NAMES = { dims: "评分维度", rev: "作文修订", err: "纠错详情", more: "更多表达", logic: "逻辑提升", best: "学生佳句", full: "全文润色", cmp: "润色对照提升", sug: "提升建议" };

  /* PDF +「显示旁批」：修订与纠错已随旁批呈现，两个模块互斥置灰不可选 */
  const MARGIN_LOCK_TIP = "已选择“显示旁批”，修订及纠错信息将以旁批形式展示";
  let marginLockMemo = null; /* 记住锁定前的勾选，解锁时原样还回 */

  function syncMarginModuleLock() {
    const fmt = document.querySelector('input[name="expFormat"]:checked');
    const mode = document.querySelector('input[name="expImgMode"]:checked');
    const imgOn = $('input[name="expImg"]').checked;
    const locked = imgOn && !!fmt && fmt.value === "pdf" && !!mode && mode.value === "margin";
    const boxes = $$('.exp-cb[data-margin-lock] input[name="expMod"]');
    if (locked && !marginLockMemo) {
      marginLockMemo = {};
      boxes.forEach((b) => (marginLockMemo[b.value] = b.checked));
    }
    boxes.forEach((b) => {
      const label = b.closest(".exp-cb");
      b.disabled = locked;
      label.classList.toggle("disabled", locked);
      if (locked) {
        b.checked = false;
        label.title = MARGIN_LOCK_TIP;
      } else {
        label.removeAttribute("title");
        if (marginLockMemo && b.value in marginLockMemo) b.checked = marginLockMemo[b.value];
      }
    });
    if (!locked) marginLockMemo = null;
    const note = $("#expModNote");
    if (note) note.hidden = !locked;
  }

  function readExpContent() {
    const mods = {};
    $$('input[name="expMod"]').forEach((c) => (mods[c.value] = c.checked));
    return {
      img: $('input[name="expImg"]').checked,
      imgMode: $('input[name="expImgMode"]:checked').value,
      score: $('input[name="expScore"]').checked,
      scoreMode: $('input[name="expScoreMode"]:checked').value,
      mods,
    };
  }

  function applyExpContent(st) {
    $('input[name="expImg"]').checked = st.img;
    $('input[name="expScore"]').checked = st.score;
    const setRadio = (n, v) => {
      const el = document.querySelector(`input[name="${n}"][value="${v}"]`);
      if (el) el.checked = true;
    };
    setRadio("expImgMode", st.imgMode);
    setRadio("expScoreMode", st.scoreMode);
    $$('input[name="expMod"]').forEach((c) => (c.checked = !!st.mods[c.value]));
  }

  function expEnabledNames(st) {
    const names = [];
    if (st.img) names.push("作答原图");
    if (st.score) names.push("作文得分");
    Object.keys(EXP_MOD_NAMES).forEach((k) => {
      if (st.mods[k]) names.push(EXP_MOD_NAMES[k]);
    });
    return names;
  }

  function refreshExpSummary() {
    /* 先处理互斥锁定（会改勾选），再读取状态，保证 cfg 与界面一致 */
    syncMarginModuleLock();
    const st = readExpContent();
    cfg.expContent = st;
    /* 内容模块计数：只统计可选项（「范文」无 name，互斥锁定项 disabled，均不计入） */
    const usable = $$('input[name="expMod"]').filter((c) => !c.disabled);
    const modOn = usable.filter((c) => c.checked).length;
    const count = $("#expModCount");
    if (count) {
      count.innerHTML = `已选 <b>${modOn}</b> / 共 ${usable.length} 项`;
      count.classList.toggle("partial", modOn > 0 && modOn < usable.length);
      count.classList.toggle("zero", modOn === 0);
    }
    /* 内容模块全选复选框：全选 checked / 部分选 indeterminate / 零选 unchecked */
    const allBox = $("#expModAll");
    if (allBox) {
      const full = usable.length > 0 && modOn === usable.length;
      allBox.disabled = usable.length === 0;
      allBox.checked = full;
      allBox.indeterminate = modOn > 0 && !full;
      const wrap = allBox.closest(".exp-cb");
      if (wrap) {
        wrap.classList.toggle("disabled", allBox.disabled);
        wrap.title = full ? "取消全选" : "全选";
      }
    }
  }

  /* ---------------- 导出设置：作文题号（多选，默认全选） ---------------- */
  function expQBoxes() {
    return $$('#expQList input[name="expQ"]');
  }

  function refreshExpQState() {
    const boxes = expQBoxes();
    const on = boxes.filter((c) => c.checked).length;
    cfg.questionIds = boxes.filter((c) => c.checked).map((c) => c.value);
    $("#expQCount").textContent = `已选 ${on} / ${boxes.length} 题`;
    const allBtn = $("#expQAll");
    const full = boxes.length > 0 && on === boxes.length;
    allBtn.disabled = full;
    allBtn.textContent = full ? "已全选" : "全选";
  }

  /* 仅当作业包含 ≥2 道作文题时显示；未选择状态回落到全选 */
  function renderExpQuestions() {
    const qs = HW.questions;
    $("#expQItem").hidden = qs.length < 2;
    if (qs.length < 2) return;
    const valid = new Set(qs.map((q) => q.id));
    if (!cfg.questionIds.some((id) => valid.has(id))) cfg.questionIds = qs.map((q) => q.id);
    $("#expQList").innerHTML = qs
      .map(
        (q) => `
      <label class="exp-cb">
        <input type="checkbox" name="expQ" value="${q.id}" ${cfg.questionIds.includes(q.id) ? "checked" : ""} />
        <span class="box"></span>
        <span class="txt">${q.no}　${q.type}</span>
        <span class="exp-qmeta">满分 ${q.fullScore}</span>
      </label>`,
      )
      .join("");
    expQBoxes().forEach((c) =>
      c.addEventListener("change", () => {
        if (!expQBoxes().some((x) => x.checked)) {
          c.checked = true; // 至少保留一道作文题
          return toast("至少保留一道作文题");
        }
        refreshExpQState();
      }),
    );
    refreshExpQState();
  }

  /* ---------------- 事件绑定 ---------------- */
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 1900);
  }

  function bind() {
    /* 讲评页【导出智批报告】→ 统一导出设置弹窗（与报告页【导出报告】同一套设置） */
    $("#btnExport").addEventListener("click", () => openExportSettings(false));

    $("#dlgClose").onclick = () => $("#mask").classList.remove("show");
    $("#btnCancel").onclick = () => $("#mask").classList.remove("show");
    $("#mask").onclick = (e) => {
      if (e.target.id === "mask") $("#mask").classList.remove("show");
    };
    $("#btnStart").onclick = () => {
      cfg.cover = $("#optCover").checked;
      cfg.overview = $("#optOverview").checked;
      cfg.toc = $("#optToc").checked;
      runExport();
    };

    $("#btnBg").onclick = () => {
      $("#progressWrap").hidden = true;
      toast("已转后台生成，完成后自动提示");
    };
    $("#rpClose").onclick = () => ($("#resultPanel").hidden = true);
    $("#rpAgain").onclick = () => {
      $("#resultPanel").hidden = true;
      openDialog();
    };
    $("#repClose").onclick = () => $("#repMask").classList.remove("show");
    $("#repMask").onclick = (e) => {
      if (e.target.id === "repMask") $("#repMask").classList.remove("show");
    };
    $("#repPrev").onclick = () => {
      const i = ROSTER.findIndex((s) => s.name === repCtx.student.name);
      repCtx.student = ROSTER[(i - 1 + ROSTER.length) % ROSTER.length];
      renderReport();
    };
    $("#repNext").onclick = () => {
      const i = ROSTER.findIndex((s) => s.name === repCtx.student.name);
      repCtx.student = ROSTER[(i + 1) % ROSTER.length];
      renderReport();
    };
    $$(".rv-tab").forEach((t) =>
      t.addEventListener("click", () => {
        repCtx.pane = t.dataset.pane;
        $$(".rv-tab").forEach((x) => x.classList.toggle("active", x === t));
        renderRepRight(repCtx.student.reports[repCtx.qid]);
      }),
    );

    /* 题号下拉：展开/收起 + 选择切换 */
    const qSel = $("#repQSelect");
    qSel.addEventListener("click", (e) => {
      e.stopPropagation();
      const item = e.target.closest(".rv-menu-item");
      if (item) {
        repCtx.qid = item.dataset.qid;
        renderReport();
        qSel.classList.remove("open");
      } else {
        qSel.classList.toggle("open");
      }
    });
    document.addEventListener("click", () => qSel.classList.remove("open"));

    /* 导出设置弹窗：报告页【导出报告】与讲评页【导出智批报告】共用同一入口
       fromReport=true 才可导出「当前学生」；讲评页无学生上下文则该项禁用并默认「当前班级」 */
    const openExportSettings = (fromReport) => {
      const stu = document.querySelector('input[name="expScope"][value="student"]');
      const cls = document.querySelector('input[name="expScope"][value="class"]');
      const stuName = fromReport && repCtx.student ? repCtx.student.name : "";
      $("#expStudentName").textContent = stuName || "未选择";
      stu.disabled = !stuName;
      stu.closest(".exp-radio").classList.toggle("disabled", !stuName);
      (stuName ? stu : cls).checked = true;

      renderExpQuestions();
      applyExpContent(cfg.expContent || JSON.parse(JSON.stringify(EXP_DEFAULTS)));
      setExpPanelOpen(false);
      syncExpContent();
      syncImgModeByFormat();
      refreshExpSummary();
      $("#expMask").classList.add("show");
    };
    $(".rv-export").addEventListener("click", () => openExportSettings(true));
    /* 导出内容：父级勾选控制子单选可用性 */
    const syncExpContent = () => {
      [["expImg", "expImgMode"], ["expScore", "expScoreMode"]].forEach(([ck, radio]) => {
        const box = document.querySelector(`input[name="${ck}"]`);
        const on = box && box.checked;
        document.querySelectorAll(`input[name="${radio}"]`).forEach((r) => {
          r.disabled = !on;
          r.closest(".exp-radio").classList.toggle("disabled", !on);
        });
      });
    };
    /* 导出内容：根据导出格式切换作答原图子选项（PDF 3 项 / Word 2 项） */
    const syncImgModeByFormat = () => {
      const fmt = document.querySelector('input[name="expFormat"]:checked').value;
      $(".exp-modal").classList.toggle("word", fmt === "word");
      const cur = document.querySelector('input[name="expImgMode"]:checked');
      if (fmt === "word" && cur && cur.closest(".exp-only-pdf")) {
        $('input[name="expImgMode"][value="raw"]').checked = true;
      }
    };
    $$('#expMask input[name="expFormat"]').forEach((r) =>
      r.addEventListener("change", () => {
        syncImgModeByFormat();
        refreshExpSummary();
      }),
    );
    /* 导出内容：仅「内容模块」的选项网格收起 / 展开（按钮与副标题同行） */
    const setExpPanelOpen = (open) => {
      $("#expContentPanel").classList.toggle("open", open);
      $("#expMoreBtn").classList.toggle("open", open);
      $("#expMoreBtn").setAttribute("aria-expanded", open ? "true" : "false");
      $("#expMoreTxt").textContent = open ? "收起" : "展开";
    };
    $("#expMoreBtn").addEventListener("click", () => setExpPanelOpen(!$("#expContentPanel").classList.contains("open")));
    /* 内容模块：全选复选框——已全选则取消全选，否则全选（置灰项不参与） */
    $("#expModAll").addEventListener("change", () => {
      const boxes = $$('input[name="expMod"]').filter((c) => !c.disabled);
      const full = boxes.length > 0 && boxes.every((c) => c.checked);
      boxes.forEach((c) => (c.checked = !full));
      refreshExpSummary();
    });
    /* 作文题号：一键全选（已全选时置灰） */
    $("#expQAll").addEventListener("click", () => {
      expQBoxes().forEach((c) => (c.checked = true));
      refreshExpQState();
    });
    $$("#expMask input[type=checkbox]").forEach((c) => {
      if (c.id === "expModAll") return; /* 全选框自带处理器，避免重复刷新 */
      c.addEventListener("change", () => {
        syncExpContent();
        refreshExpSummary();
      });
    });
    $$("#expMask input[type=radio]").forEach((r) => r.addEventListener("change", refreshExpSummary));
    syncExpContent();
    syncImgModeByFormat();
    refreshExpSummary();
    $("#expClose").onclick = () => $("#expMask").classList.remove("show");
    $("#expCancel").onclick = () => $("#expMask").classList.remove("show");
    $("#expMask").onclick = (e) => {
      if (e.target.id === "expMask") $("#expMask").classList.remove("show");
    };
    $("#expOk").onclick = () => {
      if (expEnabledNames(readExpContent()).length === 0) return toast("请至少选择一项导出内容");
      const fmt = document.querySelector('input[name="expFormat"]:checked').value;
      const scope = document.querySelector('input[name="expScope"]:checked');
      /* 「导出范围 / 导出形式」回填到批量导出配置，两个入口设置一致 */
      cfg.org = document.querySelector('input[name="expOrg"]:checked').value === "class" ? "class" : "per-student";
      if (scope && scope.value === "student" && repCtx.student) {
        cfg.scope = "pick";
        cfg.picked = [repCtx.student.name];
      } else {
        cfg.scope = "all";
        cfg.picked = [];
      }
      $("#expMask").classList.remove("show");
      if (fmt === "word") openDialog();
      else toast(`已创建 PDF 导出任务（${cfg.questionIds.length} 道作文题，示意）`);
    };
  }

  /* ---------------- 启动 ---------------- */
  window.__makeScan = makeScan; // 原型调试入口
  renderMeta();
  renderStat();
  renderQuestions();
  bind();
})();
