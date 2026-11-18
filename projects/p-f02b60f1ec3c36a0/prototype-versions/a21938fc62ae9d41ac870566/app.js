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


/* ============================================================
 * PRD 查看器逻辑（自包含 IIFE，无外部依赖，不污染全局）
 * 接入步骤：
 *   1. 页面已包含 viewer-dom.html 的 DOM 与 viewer.css 的样式
 *   2. 修改下方「配置区」「数据区」
 *   3. 多文件原型：本文件内容追加到主 JS 末尾
 *      单文件原型：放入 </body> 前的 <script> 块内
 * 内容格式：PRD 章节 body 一律为 Markdown（由项目作者在 PRD_SECTIONS 中
 * 维护，或用户经页内编辑器写入 localStorage），由内置 prdMd() 渲染为受控
 * HTML；文本先转义再解析，Markdown 中的 < > & 不会生成标签，故不构成注入面。
 * 导入/导出：头部 ⬇⬆ 收发的是一份 Markdown 文档（与项目 PRD.md 同构），不用 JSON；
 * 导出为覆盖层合并后的快照，导入按「## 编号 标题」只取章节正文。
 * 搜索：抽屉顶部 #prdSearch 检索章节标题与当前生效正文（含本地修改），结果浮层
 * 点击定位、正文与标题命中高亮（只包文本节点、不改 innerHTML），Esc 先收浮层再清空。
 * 兼容：整段以块级 HTML 标签开头的 body 按旧版 HTML 直出（仅用于升级前的历史数据）。
 * ============================================================ */
(function () {
    'use strict';

    /* ---------- 配置区（按项目修改） ---------- */
    var PRD_STORAGE_KEY = 'wpWordExportPrdOverrides_v1'; // localStorage key：带项目标识 + 版本后缀，避免跨项目串数据
    var PRD_APP_NAME = '智批报告 Word 导出';            // 项目名：写入导出 Markdown 的文档标题「项目名 产品需求文档（PRD）」
    var PRD_HOME_SECTION = 'JP-04';               // 首次打开默认定位的章节 id
    var PRD_EXPORT_NAME = '智批报告Word导出-PRD';   // 导出 Markdown 文件名前缀（最终 <前缀>-YYYYMMDD-HHmm.md）
    var PRD_DRAWER_MIN_W = 420;                    // 抽屉拖动最小宽度 px
    var PRD_DRAWER_MAX_W = 1200;                   // 抽屉拖动最大宽度 px（同时受 CSS max-width: 94vw 限制）
    var PRD_DRAWER_WIDTH_KEY = 'wpWordExportPrdWidth_v1'; // 抽屉宽度本地记忆 key：带项目标识 + 版本后缀，避免跨项目串数据
    var PRD_FAB_POS_KEY = 'wpWordExportPrdFabPos_v1';     // 悬浮按钮位置记忆 key：带项目标识 + 版本后缀，避免跨项目串数据
    // 有其他浮层打开时 Esc 让行；按原型实际浮层选择器补充
    function prdAnyOverlayOpen() {
        return !!document.querySelector('.mask.show, .exp-mask.show, .rv-menu.open');
    }

    /* ---------- 数据区：与 PRD.md 章节一一对应（同源维护，新增/删章三处同步） ---------- */
    var PRD_GROUPS = [
        { key: 'JP', name: '一、讲评页' },
        { key: 'WD', name: '二、Word 导出配置弹窗' },
        { key: 'RP', name: '三、报告页导出设置' }
    ];

    // body 为 Markdown（唯一格式），由内置 prdMd() 渲染；写法：数组逐行 join('\n')
    var PRD_SECTIONS = [
        {
            id: 'JP-04', group: 'JP', title: '【导出智批报告】入口（#btnExport）',
            body: [
                '**功能**：讲评页新增的批量导出入口，与报告页【导出报告】共用同一套导出设置。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 显示 | 位于「讲评课件」卡头右侧工具区，排在「导出讲评课件」左侧；白底蓝边、无图标、无下拉菜单 |',
                '| 交互 | 点击 → 打开「导出报告」设置弹窗；因讲评页无当前学生，「当前学生」置灰显示「未选择」并默认选中「当前班级」 |',
                '| 规则 | 确定为 Word → 继续打开「导出智批报告（Word）」配置弹窗；确定为 PDF → 仅提示「已创建 PDF 导出任务（N 道作文题，示意）」，不生成文件 |',
                '| 边界 | 与报告页入口的唯一差异是默认导出范围（讲评页 = 当前班级） |'
            ].join('\n')
        },
        {
            id: 'WD-01', group: 'WD', title: '导出题目（#qChips）',
            body: [
                '**功能**：选择本次导出包含哪些作文题，多题按学生合并。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 显示 | 弹窗副标题实时汇总「本作业共 2 道作文题 · 50 名学生 · 已勾选 N 题 / M 人」；每题一张可选卡：勾选框、题号 + 题型、满分 / 得分率 / 平均分 |',
                '| 交互 | 点击卡片切换勾选，已选卡为蓝框浅底 |',
                '| 规则 | 至少保留 1 题，取消最后一题时提示「至少保留一道作文题」并保持勾选；顺序固定按题号 |',
                '| 边界 | 多题合并时同一学生的多篇报告装进同一份 Word，第 2 篇起新起一页 |'
            ].join('\n')
        },
        {
            id: 'WD-03', group: 'WD', title: '文件组织与合订选项（#orgCards、#orderRow）',
            body: [
                '**功能**：决定输出为「一个学生一个 Word」还是「班级整体一份 Word」。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 显示 | 两张组织卡：一个学生一个 Word（该生全部作文题合并、打包 zip；示例名「高一(3)班_3.21作文限时练_周泽同_智批报告.docx」）、班级整体一份 Word（封面 + 班级总览 + 目录 + 逐生逐题；示例名「…智批报告(班级合订).docx」） |',
                '| 交互 | 点击卡片切换；选「班级整体」时出现排序（按得分从高到低 / 按姓名拼音 / 按名单顺序，点击循环切换）与三个勾选项：封面页、班级总览、目录（默认全勾） |',
                '| 规则 | 文件数：单生 = 人数，合订 = 1；篇数 = 人数 × 已选题数 |',
                '| 边界 | 选单生模式时排序与三个勾选项整行隐藏【隐藏】 |'
            ].join('\n')
        },
        {
            id: 'WD-04', group: 'WD', title: '内容模块（#modGrid）',
            body: [
                '**功能**：选择 Word 中保留哪些报告章节。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 显示 | 7 张模块卡，每卡名称 + 一句说明：基本信息（得分 / 档位 / 字数 / 标签）、原文与旁批（修订对照 + 纠错编号上标）、评分维度（内容 / 语言 / 结构评语）、纠错详情（原词 → 修订、知识点）、详细分析（语法 / 句式 / 连贯）、润色提升（原句与升格句对照）、原卷扫描图（内嵌手写卷面） |',
                '| 交互 | 点击卡片切换勾选，取消即从 Word 中略去对应章节 |',
                '| 规则 | 默认勾选前 5 项；润色提升、原卷扫描图默认不勾 |',
                '| 边界 | 全部取消时 Word 只剩大标题与题号标题 |'
            ].join('\n')
        },
        {
            id: 'RP-01', group: 'RP', title: '报告预览与作文题号切换（.rv-bar-l、#repQSelect）',
            body: [
                '**功能**：全屏预览单个学生的智批报告，并在多题作业内切换作文题。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 显示 | 顶栏三区：左（文档图标、「英语作文智批报告」、学科下拉、作文题号下拉）；中（上一篇、学生姓名、下一篇、换一篇）；右（AI 生成提示、学生端展示开关、导出报告、通知、关闭）；主体为报告正文与右侧智批详情 / 润色提升 |',
                '| 交互 | 题号下拉列出「题号 + 题型」，选中后整页报告切到该题；上一篇 / 下一篇按名单顺序切换学生 |',
                '| 规则 | 标题、得分、档位、原文、详情随当前学生与当前题号整体刷新 |',
                '| 边界 | 仅 1 道作文题时不显示题号下拉；换一篇、学生端展示、通知为版式示意 |'
            ].join('\n')
        },
        {
            id: 'RP-03', group: 'RP', title: '作文题号（#expQItem）',
            body: [
                '**功能**：多题作业导出时选择要导出的作文题。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 显示 | 块头右侧计数「已选 N / M 题」+「全选」按钮；下方逐行勾选项：题号 + 题型 + 满分 |',
                '| 交互 | 勾选 / 取消即时更新计数；点「全选」一键勾满，全选态按钮文案变「已全选」并置灰 |',
                '| 规则 | 默认全选；至少保留 1 题，取消最后一题时回退勾选并提示「至少保留一道作文题」 |',
                '| 边界 | 作业只有 1 道作文题时整块隐藏【隐藏】 |'
            ].join('\n')
        },
        {
            id: 'RP-04', group: 'RP', title: '导出格式与作答原图（#expFormatItem）',
            body: [
                '**功能**：选择 Word 或 PDF，并据格式收敛作答原图的呈现方式。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 显示 | 导出格式单选：Word 文档（.docx）、PDF 文档（.pdf，默认选中）；其上方「作答原图」的子选项随格式变化 |',
                '| 交互 | 选 Word：原图子项只有「显示批阅痕迹 / 仅显示原图」；选 PDF：多出「显示旁批」 |',
                '| 规则 | 切到 Word 时若「显示旁批」处于选中，自动回退为「仅显示原图」，避免隐藏项仍被选中 |',
                '| 边界 | 取消勾选「作答原图」时，其下子项全部置灰不可选 |'
            ].join('\n')
        },
        {
            id: 'RP-05', group: 'RP', title: '导出内容与模块锁定（#expContentItem）',
            body: [
                '**功能**：选择导出内容（原图、得分、9 个内容模块），并处理旁批与修订信息的互斥。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 显示 | 「图与得分」：作答原图（3 个子单选）、作文得分（「显示班级均分+最高分 / 不显示」，默认不显示）；「内容模块」：标题 + 计数「已选 9 / 共 9 项」+ 全选复选框 + 展开按钮，展开后为 3×3 复选网格（评分维度、作文修订、纠错详情、更多表达、逻辑提升、学生佳句、全文润色、润色对照提升、提升建议）与置灰的「范文」 |',
                '| 交互 | 父项取消 → 子单选整体置灰；网格默认收起，点「展开」内联展开（按钮变「收起」）；全选框支持全选 / 半选 / 零选三态 |',
                '| 规则 | 计数只统计可选模块，置灰项不计入；PDF + 显示旁批 时「作文修订」「纠错详情」置灰并取消勾选，同时显示提示条「已选择“显示旁批”，修订及纠错信息将以旁批形式展示」；退出该组合后按锁定前勾选复原 |',
                '| 边界 | 点确定时若原图、得分与所有模块均未勾选，提示「请至少选择一项导出内容」且弹窗不关闭 |'
            ].join('\n')
        }
    ];

    /* ---------- 以下为通用逻辑，无需修改 ---------- */

    /* ---------- Markdown 渲染：极简子集（无依赖，先转义后解析，不执行 HTML） ----------
       支持：# ~ ### 标题（→ h4）、#### 及以上（→ h5）、段落、- / * / + 与 1. 列表
       （行首每多缩进 2 空格即下一层）、GFM 表格与 :--: 对齐、> 提示块（→ .prd-note）、
       --- 分隔线、``` 代码块；行内 **粗体** `code` ~~删除~~ 【隐藏】【演示】。
       不支持：斜体、图片、链接、内联 HTML（文本一律转义后输出）。 */
    var PRD_HTML_HEAD = /^\s*<(p|ul|ol|table|div|section|blockquote|h[1-6])\b/i;

    function prdEsc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // 行内语法：先把 `code` 抽出占位，其余文本已转义，替换只生成白名单标签
    function prdInline(s) {
        var codes = [];
        var out = prdEsc(s)
            .replace(/`([^`]+)`/g, function (m, c) {
                codes.push(c);
                return '\u0000' + (codes.length - 1) + '\u0000';
            })
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/~~([^~]+)~~/g, '<del>$1</del>')
            .replace(/【隐藏】/g, '<span class="prd-hidden-tag">隐藏</span>')
            .replace(/【演示】/g, '<span class="prd-demo-tag">演示</span>');
        return out.replace(/\u0000(\d+)\u0000/g, function (m, i) {
            return '<code>' + codes[+i] + '</code>';
        });
    }

    function prdMdSplitRow(line) {
        var s = String(line).trim();
        if (s.charAt(0) === '|') s = s.slice(1);
        if (s.charAt(s.length - 1) === '|') s = s.slice(0, -1);
        return s.split('|').map(function (c) { return c.trim(); });
    }

    function prdMdIsTableSep(line) {
        if (String(line).indexOf('|') < 0) return false;
        var cells = prdMdSplitRow(line);
        for (var i = 0; i < cells.length; i++) {
            if (!/^:?-+:?$/.test(cells[i])) return false;
        }
        return cells.length > 0;
    }

    // 段落合并的终止条件：遇到任一新的块级起始行
    function prdMdIsBlockStart(lines, i) {
        var t = String(lines[i]).trim();
        if (!t) return true;
        if (/^#{1,6}\s/.test(t)) return true;
        if (t.charAt(0) === '>') return true;
        if (/^(-{3,}|\*{3,})$/.test(t)) return true;
        if (t.indexOf('```') === 0) return true;
        if (/^([-*+]|\d+\.)\s+/.test(t)) return true;
        if (t.indexOf('|') > -1 && i + 1 < lines.length && prdMdIsTableSep(lines[i + 1])) return true;
        return false;
    }

    // 列表递归：按缩进量切层，返回 { html, next }
    function prdMdList(items, pos, indent) {
        var tag = items[pos].ordered ? 'ol' : 'ul';
        var out = '<' + tag + '>';
        var i = pos;
        while (i < items.length && items[i].indent >= indent) {
            var it = items[i];
            if (it.indent > indent) { // 首项缩进突增：作为同级子表输出
                var sub0 = prdMdList(items, i, it.indent);
                out += sub0.html;
                i = sub0.next;
                continue;
            }
            i++;
            var inner = '';
            if (i < items.length && items[i].indent > indent) {
                var sub = prdMdList(items, i, items[i].indent);
                inner = sub.html;
                i = sub.next;
            }
            out += '<li>' + prdInline(it.text) + inner + '</li>';
        }
        return { html: out + '</' + tag + '>', next: i };
    }

    function prdMd(src) {
        var text = String(src == null ? '' : src).replace(/\r\n?/g, '\n').trim();
        if (!text) return '';
        if (PRD_HTML_HEAD.test(text)) return text; // 兼容旧版 HTML body 直出

        var lines = text.split('\n');
        var out = [];
        var i = 0;
        while (i < lines.length) {
            var line = lines[i];
            var t = line.trim();
            if (!t) { i++; continue; }

            // ``` 代码块
            if (t.indexOf('```') === 0) {
                var buf = [];
                i++;
                while (i < lines.length && lines[i].trim().indexOf('```') !== 0) {
                    buf.push(lines[i]);
                    i++;
                }
                i++; // 跳过结束围栏
                out.push('<pre class="prd-code"><code>' + prdEsc(buf.join('\n')) + '</code></pre>');
                continue;
            }

            // --- 分隔线
            if (/^(-{3,}|\*{3,})$/.test(t)) { out.push('<hr>'); i++; continue; }

            // # 标题
            var hm = /^(#{1,6})\s+(.*)$/.exec(t);
            if (hm) {
                var lv = hm[1].length <= 3 ? '4' : '5';
                out.push('<h' + lv + '>' + prdInline(hm[2]) + '</h' + lv + '>');
                i++;
                continue;
            }

            // > 提示块（连续行合并为一段）
            if (t.charAt(0) === '>') {
                var qs = [];
                while (i < lines.length && lines[i].trim().charAt(0) === '>') {
                    qs.push(lines[i].trim().replace(/^>\s?/, ''));
                    i++;
                }
                out.push('<div class="prd-note">' + prdInline(qs.join(' ')) + '</div>');
                continue;
            }

            // GFM 表格：含 | 且下一行为分隔行
            if (t.indexOf('|') > -1 && i + 1 < lines.length && prdMdIsTableSep(lines[i + 1])) {
                var head = prdMdSplitRow(t);
                var aligns = prdMdSplitRow(lines[i + 1]).map(function (c) {
                    if (/^:.+:$/.test(c)) return 'center';
                    if (/^:/.test(c)) return 'left';
                    if (/:$/.test(c)) return 'right';
                    return '';
                });
                i += 2;
                var rows = [];
                while (i < lines.length && lines[i].trim() && lines[i].indexOf('|') > -1) {
                    rows.push(prdMdSplitRow(lines[i]));
                    i++;
                }
                var th = '<tr>' + head.map(function (c, k) {
                    return '<th' + (aligns[k] ? ' style="text-align:' + aligns[k] + '"' : '') + '>'
                        + prdInline(c) + '</th>';
                }).join('') + '</tr>';
                var tb = rows.map(function (r) {
                    var cells = [];
                    for (var k = 0; k < head.length; k++) {
                        cells.push('<td' + (aligns[k] ? ' style="text-align:' + aligns[k] + '"' : '') + '>'
                            + prdInline(r[k] || '') + '</td>');
                    }
                    return '<tr>' + cells.join('') + '</tr>';
                }).join('');
                out.push('<table><thead>' + th + '</thead><tbody>' + tb + '</tbody></table>');
                continue;
            }

            // - / 1. 列表（连续列表行整体收集后递归建层）
            if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
                var items = [];
                while (i < lines.length) {
                    var lm = /^(\s*)([-*+]|\d+\.)\s+(.*)$/.exec(lines[i]);
                    if (!lm) break;
                    items.push({
                        indent: lm[1].replace(/\t/g, '    ').length,
                        ordered: /\d+\./.test(lm[2]),
                        text: lm[3]
                    });
                    i++;
                }
                if (items.length) {
                    out.push(prdMdList(items, 0, items[0].indent).html);
                    continue;
                }
            }

            // 普通段落：连续非块起始行以空格合并
            var para = [t];
            i++;
            while (i < lines.length && !prdMdIsBlockStart(lines, i)) {
                para.push(lines[i].trim());
                i++;
            }
            out.push('<p>' + prdInline(para.join(' ')) + '</p>');
        }
        return out.join('\n');
    }

    var prdFab = document.getElementById('prdFab');
    var prdDrawer = document.getElementById('prdDrawer');
    var prdCloseBtn = document.getElementById('prdClose');
    var prdToc = document.getElementById('prdToc');
    var prdContent = document.getElementById('prdContent');
    if (!prdFab || !prdDrawer || !prdToc || !prdContent) return;

    /* ---------- 抽屉宽度拖动调节（左缘手柄：范围钳制 + 本地记忆） ---------- */
    var prdResizeHandle = document.getElementById('prdResize');
    var prdDrag = null;

    function prdClampWidth(w) {
        var vw = window.innerWidth;
        var max = Math.min(PRD_DRAWER_MAX_W, vw * 0.94); // 与 CSS max-width: 94vw 保持一致
        var min = Math.min(PRD_DRAWER_MIN_W, max);
        return Math.min(max, Math.max(min, w));
    }

    function prdApplyWidth(w) {
        prdDrawer.style.width = prdClampWidth(w) + 'px';
    }

    // 恢复上次拖动记忆的宽度；读取失败时保持 CSS 默认
    (function prdInitWidth() {
        try {
            var saved = parseFloat(localStorage.getItem(PRD_DRAWER_WIDTH_KEY));
            if (isFinite(saved)) prdApplyWidth(saved);
        } catch (err) { /* 读取失败静默 */ }
    })();

    function prdEndDrag() {
        if (!prdDrag) return;
        prdDrag = null;
        document.body.classList.remove('prd-resizing');
        var w = prdDrawer.style.width;
        if (w) {
            try { localStorage.setItem(PRD_DRAWER_WIDTH_KEY, String(parseFloat(w))); } catch (err) { /* 存储受限时静默 */ }
        }
    }

    if (prdResizeHandle) {
        prdResizeHandle.addEventListener('pointerdown', function (e) {
            prdDrag = { startX: e.clientX, startW: prdDrawer.offsetWidth };
            document.body.classList.add('prd-resizing');
            if (prdResizeHandle.setPointerCapture) prdResizeHandle.setPointerCapture(e.pointerId);
            e.preventDefault();
        });
        prdResizeHandle.addEventListener('pointermove', function (e) {
            if (!prdDrag) return;
            // 抽屉右缘固定：新宽 = 起始宽 + (起始X - 当前X)，向左拖加宽
            prdApplyWidth(prdDrag.startW + (prdDrag.startX - e.clientX));
        });
        prdResizeHandle.addEventListener('pointerup', prdEndDrag);
        prdResizeHandle.addEventListener('pointercancel', prdEndDrag);
    }

    /* ---------- 悬浮按钮拖拽 + 吸边（任意拖动，松手吸附最近左右边缘，位置本地记忆） ---------- */
    var PRD_FAB_MARGIN = 12;          // 吸边与钳制时距视口边缘的最小间距
    var prdFabDrag = null;            // 拖动会话 { startX, startY, origLeft, origTop, moved }
    var prdFabSuppressClick = false;  // 拖动结束后吞掉浏览器补发的 click，避免拖完顺手开抽屉

    function prdFabPlace(left, top) {
        prdFab.style.right = 'auto';
        prdFab.style.bottom = 'auto';
        prdFab.style.left = left + 'px';
        prdFab.style.top = top + 'px';
    }

    function prdFabReadPos() {
        try {
            var pos = JSON.parse(localStorage.getItem(PRD_FAB_POS_KEY) || 'null');
            if (pos && (pos.side === 'left' || pos.side === 'right') && isFinite(pos.y)) return pos;
        } catch (err) { /* 读取失败静默 */ }
        return null;
    }

    // 按吸边侧 + y 落位（x 由 side 决定），y 钳制在视口内；返回钳制后的 top
    function prdFabApply(side, y) {
        var r = prdFab.getBoundingClientRect();
        var vw = window.innerWidth, vh = window.innerHeight;
        var x = side === 'left' ? PRD_FAB_MARGIN : vw - r.width - PRD_FAB_MARGIN;
        var top = Math.min(vh - r.height - PRD_FAB_MARGIN, Math.max(PRD_FAB_MARGIN, y));
        prdFabPlace(x, top);
        return top;
    }

    // 恢复记忆位置；无记忆保持 CSS 默认右下角
    (function prdFabInit() {
        var pos = prdFabReadPos();
        if (pos) prdFabApply(pos.side, pos.y);
    })();

    // 视口尺寸变化后按记忆重新吸边钳制，避免 fab 跑出屏幕
    window.addEventListener('resize', function () {
        var pos = prdFabReadPos();
        if (pos) prdFabApply(pos.side, pos.y);
    });

    prdFab.addEventListener('pointerdown', function (e) {
        if (e.button !== undefined && e.button !== 0) return;
        var r = prdFab.getBoundingClientRect();
        prdFabDrag = { startX: e.clientX, startY: e.clientY, origLeft: r.left, origTop: r.top, moved: false };
        try { if (prdFab.setPointerCapture) prdFab.setPointerCapture(e.pointerId); } catch (err) { /* 合成事件/无活动指针时静默 */ }
    });

    prdFab.addEventListener('pointermove', function (e) {
        if (!prdFabDrag) return;
        var dx = e.clientX - prdFabDrag.startX;
        var dy = e.clientY - prdFabDrag.startY;
        if (!prdFabDrag.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return; // 阈值内视为点击
        prdFabDrag.moved = true;
        prdFab.classList.add('prd-fab-drag');
        prdFabPlace(prdFabDrag.origLeft + dx, prdFabDrag.origTop + dy);
    });

    function prdFabEndDrag() {
        if (!prdFabDrag) return;
        var moved = prdFabDrag.moved;
        prdFabDrag = null;
        prdFab.classList.remove('prd-fab-drag');
        if (!moved) return; // 未超阈值：交给 click 事件 toggle
        prdFabSuppressClick = true;
        var r = prdFab.getBoundingClientRect();
        var side = (r.left + r.width / 2) < window.innerWidth / 2 ? 'left' : 'right'; // 吸最近水平边
        var top = prdFabApply(side, r.top);
        try { localStorage.setItem(PRD_FAB_POS_KEY, JSON.stringify({ side: side, y: Math.round(top) })); } catch (err) { /* 存储受限时静默 */ }
    }
    prdFab.addEventListener('pointerup', prdFabEndDrag);
    prdFab.addEventListener('pointercancel', prdFabEndDrag);

    /* ---------- 手动编辑：localStorage 覆盖层 ---------- */
    // 仅存储与默认内容不同的章节；渲染时覆盖默认 body，默认内容始终可从代码恢复
    var prdOverrides = prdLoadOverrides();
    var prdEditingId = null; // 同一时刻仅允许一个章节处于编辑态

    function prdLoadOverrides() {
        try {
            var raw = localStorage.getItem(PRD_STORAGE_KEY);
            var obj = raw ? JSON.parse(raw) : {};
            return (obj && typeof obj === 'object') ? obj : {};
        } catch (err) {
            return {};
        }
    }

    function prdPersistOverrides() {
        try { localStorage.setItem(PRD_STORAGE_KEY, JSON.stringify(prdOverrides)); } catch (err) { /* 存储受限时静默 */ }
    }

    function prdHasOverride(id) {
        return Object.prototype.hasOwnProperty.call(prdOverrides, id);
    }

    function prdSecOf(id) {
        for (var i = 0; i < PRD_SECTIONS.length; i++) {
            if (PRD_SECTIONS[i].id === id) return PRD_SECTIONS[i];
        }
        return null;
    }

    function prdBodyOf(s) {
        return prdHasOverride(s.id) ? prdOverrides[s.id] : s.body;
    }

    // 轻提示（自包含 toast，不依赖原型既有 toast）
    var prdToastTimer = null;
    function prdToast(msg) {
        var t = document.getElementById('prdToast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'prdToast';
            t.className = 'prd-toast';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(prdToastTimer);
        prdToastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
    }

    /* ---------- 搜索：标题/正文关键词检索 + 点击定位 + 命中高亮 ----------
       检索范围：章节标题 + 当前生效正文（经 prdBodyOf 取覆盖层后的 Markdown，剥语法后比对），
       空格分隔多词按「同时包含」过滤；标题与正文都计命中次数。
       点击结果 → 目录选中 + 滚到该章首个命中（无命中退回章节顶部）+ 标题闪烁 + 命中包 mark；
       点击后浮层自动收起（聚焦输入框或继续输入时重新展开），避免遮挡刚定位的正文；
       ↑↓ 切换结果、回车依次定位、Esc 先收起浮层再清空（搜索为空时让行给抽屉 Esc）。
       高亮只包裹文本节点，不替换 innerHTML，表格/列表/提示块结构不受影响；
       编辑保存、恢复默认、导入触发重渲后由 prdSearchRefresh() 自动恢复结果与高亮。 */
    var prdSearchInput = document.getElementById('prdSearch');
    var prdSearchClear = document.getElementById('prdSearchClear');
    var prdSearchRes = document.getElementById('prdSearchRes');
    var prdSearchTerms = [];      // 当前生效关键词（已去重）
    var prdSearchQ = '';          // 上次检索的原始输入，回车时据此判断是否需先检索
    var prdSearchHits = [];       // 结果 [{ id, title, count, snip }]
    var prdSearchIdx = -1;        // 键盘活动项下标
    var prdSearchActiveId = null; // 已定位章节 id（重渲后据此恢复当前命中样式）
    var prdSearchTimer = null;

    function prdReEsc(s) {
        return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 关键词拆分：空格分词 + 去重（大小写不敏感）
    function prdSplitTerms(q) {
        var out = [], seen = {};
        String(q == null ? '' : q).trim().split(/\s+/).forEach(function (t) {
            var k = t.toLowerCase();
            if (!t || seen[k]) return;
            seen[k] = 1;
            out.push(t);
        });
        return out;
    }

    // 正文 Markdown → 纯文本：用于计数与结果片段，去掉语法噪声
    function prdPlain(md) {
        return String(md == null ? '' : md)
            .replace(/```[\s\S]*?(?:```|$)/g, ' ')
            .replace(/`([^`]*)`/g, '$1')
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/~~([^~]+)~~/g, '$1')
            .replace(/^\s*#{1,6}\s+/gm, '')
            .replace(/^\s*>\s?/gm, '')
            .replace(/^\s*[-*+]\s+/gm, '')
            .replace(/\|/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // 命中次数（大小写不敏感）
    function prdCountHits(text, terms) {
        var lower = String(text == null ? '' : text).toLowerCase(), n = 0;
        terms.forEach(function (t) {
            var k = t.toLowerCase(), i = 0;
            while (k && (i = lower.indexOf(k, i)) !== -1) { n++; i += k.length; }
        });
        return n;
    }

    // 转义并按关键词包 mark（只生成白名单标签，不引入注入面）
    function prdHl(raw, terms) {
        var s = String(raw == null ? '' : raw);
        if (!terms.length) return prdEsc(s);
        var re = new RegExp('(' + terms.map(prdReEsc).join('|') + ')', 'gi');
        return s.split(re).map(function (part, i) {
            return i % 2 ? '<mark class="prd-hit">' + prdEsc(part) + '</mark>' : prdEsc(part);
        }).join('');
    }

    // 以首个命中为中心截取片段（原文，未转义）
    function prdSnip(plain, terms, span) {
        var s = String(plain == null ? '' : plain), lower = s.toLowerCase();
        var at = -1, len = 0;
        for (var i = 0; i < terms.length && at < 0; i++) {
            at = lower.indexOf(terms[i].toLowerCase());
            len = terms[i].length;
        }
        if (at < 0) return s.slice(0, span * 2) + (s.length > span * 2 ? '…' : '');
        var start = Math.max(0, at - Math.floor(span / 2));
        var end = Math.min(s.length, at + len + span);
        return (start > 0 ? '…' : '') + s.slice(start, end) + (end < s.length ? '…' : '');
    }

    // 清除正文高亮：mark 拆回文本节点并合并相邻文本，保证原文不被破坏
    function prdClearHits() {
        prdContent.querySelectorAll('mark.prd-hit').forEach(function (m) {
            var p = m.parentNode;
            if (!p) return;
            while (m.firstChild) p.insertBefore(m.firstChild, m);
            p.removeChild(m);
            if (p.normalize) p.normalize();
        });
    }

    // 在 root 的文本节点内包 mark；跳过脚本/样式/文本域/既有 mark，保留原有元素结构
    function prdMarkIn(root, terms) {
        if (!root || !terms.length) return;
        var pattern = '(' + terms.map(prdReEsc).join('|') + ')';
        var probe = new RegExp(pattern, 'i');
        var walker = document.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */, null);
        var nodes = [];
        while (walker.nextNode()) {
            var n = walker.currentNode;
            var tag = n.parentNode ? n.parentNode.nodeName : '';
            if (!n.nodeValue || /^(SCRIPT|STYLE|TEXTAREA|MARK)$/.test(tag)) continue;
            if (probe.test(n.nodeValue)) nodes.push(n);
        }
        nodes.forEach(function (n) {
            var text = n.nodeValue, frag = document.createDocumentFragment(), last = 0;
            var re = new RegExp(pattern, 'gi'), m;
            while ((m = re.exec(text))) {
                if (!m[0]) { re.lastIndex++; continue; }
                if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
                var mk = document.createElement('mark');
                mk.className = 'prd-hit';
                mk.textContent = m[0];
                frag.appendChild(mk);
                last = m.index + m[0].length;
            }
            if (!last) return;
            if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
            n.parentNode.replaceChild(frag, n);
        });
    }

    // 目录反馈：命中项加左杠，未命中项淡化
    function prdMarkToc(on) {
        var hit = {};
        prdSearchHits.forEach(function (r) { hit[r.id] = 1; });
        prdToc.querySelectorAll('.prd-toc-item').forEach(function (el) {
            var m = !!hit[el.getAttribute('data-sec')];
            el.classList.toggle('prd-toc-hit', !!on && m);
            el.classList.toggle('prd-toc-dim', !!on && !m);
        });
    }

    // 检索并渲染结果浮层（不滚动、不改活动项）
    function prdSearchCompute() {
        prdSearchHits = [];
        var total = 0;
        PRD_SECTIONS.forEach(function (s) {
            var plain = prdPlain(prdBodyOf(s));
            var lowerT = String(s.title).toLowerCase(), lowerB = plain.toLowerCase();
            var all = prdSearchTerms.every(function (t) {
                var k = t.toLowerCase();
                return lowerT.indexOf(k) > -1 || lowerB.indexOf(k) > -1;
            });
            if (!all) return;
            var tHit = prdCountHits(s.title, prdSearchTerms);
            var bHit = prdCountHits(plain, prdSearchTerms);
            total += tHit + bHit;
            prdSearchHits.push({
                id: s.id, title: s.title, count: tHit + bHit,
                snip: prdSnip(tHit ? String(s.title) : plain, prdSearchTerms, 26)
            });
        });
        if (!prdSearchRes) return;
        prdSearchRes.hidden = false;
        prdSearchRes.innerHTML = prdSearchHits.length
            ? '<div class="prd-res-sum">' + prdSearchHits.length + ' 个章节 · ' + total + ' 处命中</div>'
                + prdSearchHits.map(function (r, i) {
                    return '<div class="prd-res-item' + (i === prdSearchIdx ? ' active' : '') + '"'
                        + ' data-prd-res="' + r.id + '" data-idx="' + i + '">'
                        + '<span class="prd-res-no">' + r.id + '</span>'
                        + '<span class="prd-res-main"><b>' + prdHl(r.title, prdSearchTerms) + '</b>'
                        + '<span class="prd-res-snip">' + prdHl(r.snip, prdSearchTerms) + '</span></span>'
                        + '<span class="prd-res-count">' + r.count + '</span></div>';
                }).join('')
            : '<div class="prd-res-sum prd-res-empty">无匹配：换个关键词试试（空格分隔多词表示需同时包含）</div>';
        prdMarkToc(true);
    }

    // 高亮正文与标题命中；已定位章节的首个命中加「当前」描边
    function prdSearchPaint() {
        prdClearHits();
        if (!prdSearchTerms.length) { prdMarkToc(false); return; }
        // 只对命中章节（与结果浮层、目录同一集合）包 mark，避免未列出的章节也被高亮
        var hitIds = {};
        prdSearchHits.forEach(function (r) { hitIds[r.id] = 1; });
        PRD_SECTIONS.forEach(function (s) {
            if (!hitIds[s.id]) return;
            var sec = document.getElementById('prd-sec-' + s.id);
            if (!sec) return;
            prdMarkIn(sec.querySelector('.prd-sec-t'), prdSearchTerms);
            prdMarkIn(sec.querySelector('.prd-sec-body'), prdSearchTerms);
        });
        prdContent.querySelectorAll('mark.prd-hit-cur').forEach(function (m) {
            m.classList.remove('prd-hit-cur');
        });
        var curSec = prdSearchActiveId ? document.getElementById('prd-sec-' + prdSearchActiveId) : null;
        var curHit = curSec ? curSec.querySelector('mark.prd-hit') : null;
        if (curHit) curHit.classList.add('prd-hit-cur');
    }

    // 收起结果浮层（保留关键词、正文高亮与目录标记）
    function prdSearchFold() {
        if (prdSearchRes) prdSearchRes.hidden = true;
    }

    // 定位到第 idx 条结果：目录选中 + 滚到首个命中 + 标题闪烁；fold=true 时定位后收起浮层
    function prdGotoResult(idx, fold) {
        var r = prdSearchHits[idx];
        if (!r) return;
        prdSearchIdx = idx;
        prdSearchActiveId = r.id;
        if (prdSearchRes) {
            prdSearchRes.querySelectorAll('.prd-res-item').forEach(function (el) {
                var on = el.getAttribute('data-idx') === String(idx);
                el.classList.toggle('active', on);
                if (on && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
            });
        }
        prdToc.querySelectorAll('.prd-toc-item').forEach(function (el) {
            el.classList.toggle('active', el.getAttribute('data-sec') === r.id);
        });
        var tocItem = prdToc.querySelector('.prd-toc-item[data-sec="' + r.id + '"]');
        if (tocItem && tocItem.scrollIntoView) tocItem.scrollIntoView({ block: 'nearest' });

        prdSearchPaint();
        var sec = document.getElementById('prd-sec-' + r.id);
        if (!sec) return;
        var hit = sec.querySelector('mark.prd-hit');
        var prevBehavior = prdContent.style.scrollBehavior;
        prdContent.style.scrollBehavior = 'auto'; // 搜索连续切换不做平滑动画，避免定位漂移
        if (hit) {
            var cr = prdContent.getBoundingClientRect(), hr = hit.getBoundingClientRect();
            prdContent.scrollTop = Math.max(0, prdContent.scrollTop + hr.top - cr.top - 40);
        } else {
            prdContent.scrollTop = Math.max(0, sec.offsetTop - 12);
        }
        prdContent.style.scrollBehavior = prevBehavior;
        sec.classList.remove('prd-flash');
        void sec.offsetWidth;
        sec.classList.add('prd-flash');
        if (fold) prdSearchFold();
    }

    // 执行检索；keepActive=true 时保留当前定位（重渲后恢复用）
    function prdSearchRun(keepActive) {
        prdSearchQ = prdSearchInput ? prdSearchInput.value : '';
        prdSearchTerms = prdSplitTerms(prdSearchQ);
        if (prdSearchClear) prdSearchClear.classList.toggle('show', !!prdSearchQ);
        if (!prdSearchTerms.length) {
            prdSearchHits = [];
            prdSearchIdx = -1;
            prdSearchActiveId = null;
            if (prdSearchRes) { prdSearchRes.hidden = true; prdSearchRes.innerHTML = ''; }
            prdClearHits();
            prdMarkToc(false);
            return;
        }
        if (!keepActive) { prdSearchIdx = -1; prdSearchActiveId = null; }
        prdSearchCompute();
        prdSearchPaint();
    }

    function prdClearSearch() {
        if (prdSearchInput) prdSearchInput.value = '';
        prdSearchRun(false);
        if (prdSearchInput) prdSearchInput.focus();
    }

    // 重渲（编辑保存/恢复默认/导入）后恢复结果与高亮，不改变当前滚动位置
    function prdSearchRefresh() {
        if (!prdSearchTerms.length) { prdMarkToc(false); return; }
        prdSearchCompute();
        prdSearchPaint();
    }

    if (prdSearchInput) {
        prdSearchInput.addEventListener('input', function () {
            clearTimeout(prdSearchTimer);
            prdSearchTimer = setTimeout(function () { prdSearchRun(false); }, 90);
        });
        // 浮层收起后回到输入框：已有结果则重新展开（focus 兼顾 Tab 进入，click 兼顾已聚焦时再点）
        var prdSearchShow = function () {
            if (prdSearchRes && prdSearchTerms.length) prdSearchRes.hidden = false;
        };
        prdSearchInput.addEventListener('focus', prdSearchShow);
        prdSearchInput.addEventListener('click', prdSearchShow);
        prdSearchInput.addEventListener('keydown', function (e) {
            var total = prdSearchHits.length;
            if (e.key === 'Enter') {
                e.preventDefault();
                clearTimeout(prdSearchTimer);
                if (prdSearchQ !== prdSearchInput.value) { prdSearchRun(false); prdGotoResult(0); return; }
                if (!total) return;
                var next = e.shiftKey
                    ? (prdSearchIdx <= 0 ? total - 1 : prdSearchIdx - 1)
                    : (prdSearchIdx + 1 >= total ? 0 : prdSearchIdx + 1);
                prdGotoResult(next);
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                if (!total) return;
                e.preventDefault();
                var i = prdSearchIdx + (e.key === 'ArrowDown' ? 1 : -1);
                prdGotoResult((i + total) % total);
            } else if (e.key === 'Escape') {
                if (prdSearchInput.value) {
                    e.preventDefault();
                    e.stopPropagation();
                    // 两段式：先收起浮层看正文，再按一次才清空高亮
                    if (prdSearchRes && !prdSearchRes.hidden) prdSearchFold(); else prdClearSearch();
                } else {
                    prdSearchInput.blur(); // 空态让行：交给 document 的 Esc 收起抽屉
                }
            }
        });
    }
    if (prdSearchClear) prdSearchClear.addEventListener('click', prdClearSearch);
    if (prdSearchRes) {
        prdSearchRes.addEventListener('click', function (e) {
            var item = e.target.closest ? e.target.closest('.prd-res-item') : null;
            if (!item) return;
            prdGotoResult(parseInt(item.getAttribute('data-idx'), 10) || 0, true);
        });
    }
    // 点击搜索区域以外：收起浮层（关键词与高亮保留）
    document.addEventListener('mousedown', function (e) {
        if (!prdSearchRes || prdSearchRes.hidden) return;
        if (e.target && e.target.closest && e.target.closest('.prd-search-wrap')) return;
        prdSearchFold();
    }, true);

    // 渲染目录（按组）与全部章节内容；含本地修改的章节带「已修改」标记与目录圆点
    function prdRender() {
        prdToc.innerHTML = PRD_GROUPS.map(function (g) {
            var items = PRD_SECTIONS.filter(function (s) { return s.group === g.key; }).map(function (s) {
                return '<div class="prd-toc-item" data-sec="' + s.id + '"><span class="toc-no">' + s.id + '</span><span>' + s.title + '</span>'
                    + (prdHasOverride(s.id) ? '<i class="toc-dot" title="含本地修改"></i>' : '')
                    + '</div>';
            }).join('');
            return '<div class="prd-toc-group">' + g.name + '</div>' + items;
        }).join('');
        prdContent.innerHTML = PRD_SECTIONS.map(function (s) {
            return '<section class="prd-sec" id="prd-sec-' + s.id + '">'
                + '<div class="prd-sec-h"><span class="sec-no">' + s.id + '</span><span class="prd-sec-t">' + s.title + '</span>'
                + (prdHasOverride(s.id) ? '<span class="prd-modified">已修改</span>' : '')
                + '<span class="prd-sec-edit" data-prd-edit="' + s.id + '" title="编辑本章节">✎</span>'
                + '</div><div class="prd-sec-body">' + prdMd(prdBodyOf(s)) + '</div></section>';
        }).join('')
            + '<p class="prd-note">页面各模块悬浮的编号徽章与上述章节一一对应，点击徽章可定位本章。顶部搜索框可按标题或正文关键词检索，点击结果定位并高亮命中。点击章节标题右侧 ✎ 以 <b>Markdown</b> 编辑本章节，修改保存在本浏览器（localStorage），可经头部导出/导入 <b>Markdown</b> 文档备份与迁移。</p>';
        prdSearchRefresh();
    }

    // 定位到指定章节：目录选中 + 内容滚动 + 标题闪烁高亮
    function prdLocate(id) {
        var sec = document.getElementById('prd-sec-' + id);
        if (!sec) return;
        prdToc.querySelectorAll('.prd-toc-item').forEach(function (el) {
            el.classList.toggle('active', el.getAttribute('data-sec') === id);
        });
        prdContent.scrollTop = Math.max(0, sec.offsetTop - 12);
        sec.classList.remove('prd-flash');
        void sec.offsetWidth; // 强制 reflow，重启动画
        sec.classList.add('prd-flash');
        var tocItem = prdToc.querySelector('.prd-toc-item[data-sec="' + id + '"]');
        if (tocItem && tocItem.scrollIntoView) tocItem.scrollIntoView({ block: 'nearest' });
    }

    function prdOpen(id) {
        prdDrawer.classList.add('open');
        if (id) {
            prdLocate(id);
        } else if (!prdToc.querySelector('.prd-toc-item.active')) {
            prdLocate(PRD_HOME_SECTION);
        }
    }

    function prdCloseDrawer() {
        prdDrawer.classList.remove('open');
        prdSearchFold(); // 抽屉收起时一并收起结果浮层，重开不遮挡正文（关键词与高亮保留）
    }

    /* ---------- 手动编辑：编辑态切换 / 保存 / 恢复 / 导入导出 ---------- */

    // 有未保存修改时确认放弃；返回 true 表示可以继续（编辑态已清理）
    function prdConfirmDiscard() {
        var ta = document.getElementById('prdEditor');
        if (!ta || !prdEditingId) { prdEditingId = null; return true; }
        var sec = prdSecOf(prdEditingId);
        var origin = sec ? prdBodyOf(sec) : '';
        if (ta.value !== origin && !window.confirm('当前章节有未保存的修改，确定放弃吗？')) return false;
        prdEditingId = null;
        return true;
    }

    function prdEnterEdit(id) {
        if (prdEditingId === id) return;
        var sec = prdSecOf(id);
        var secEl = document.getElementById('prd-sec-' + id);
        if (!sec || !secEl) return;
        if (prdEditingId) {
            var prevId = prdEditingId;
            if (!prdConfirmDiscard()) return;
            prdRerenderKeeping(prevId); // 还原上一节的编辑态
        }
        prdEditingId = id;
        secEl.classList.add('prd-editing');
        var bodyBox = secEl.querySelector('.prd-sec-body');
        bodyBox.innerHTML = '<textarea class="prd-editor" id="prdEditor" spellcheck="false"></textarea>'
            + '<div class="prd-editor-actions">'
            + '<button type="button" class="prd-btn prd-btn-primary" data-prd-save="' + id + '">保存</button>'
            + '<button type="button" class="prd-btn prd-btn-ghost" data-prd-cancel="' + id + '">取消</button>'
            + '<button type="button" class="prd-btn prd-btn-danger" data-prd-reset="' + id + '">恢复默认</button>'
            + '<span class="prd-editor-tip">Markdown 编辑：**粗体**　| 表 | 格 |　- 列表　&gt; 提示　【隐藏】标记；正文用自然语言、不写代码；保存在本浏览器，可经头部导出 Markdown 备份</span>'
            + '</div>';
        var ta = bodyBox.querySelector('.prd-editor');
        var current = prdBodyOf(sec);
        ta.value = current;
        ta.rows = Math.min(28, Math.max(10, current.split('\n').length + 2));
        ta.focus();
    }

    function prdSaveEdit(id) {
        var ta = document.getElementById('prdEditor');
        var sec = prdSecOf(id);
        if (!ta || !sec) return;
        var val = ta.value.trim();
        if (!val) { prdToast('内容不能为空'); return; }
        if (val === sec.body.trim()) {
            delete prdOverrides[id]; // 与默认一致视为未修改
        } else {
            prdOverrides[id] = val;
        }
        prdPersistOverrides();
        prdEditingId = null;
        prdRerenderKeeping(id);
        prdToast(prdHasOverride(id) ? '已保存（本地生效，标注「已修改」）' : '已保存（与默认一致）');
    }

    function prdExitEdit(id) {
        if (prdEditingId !== id) return;
        if (!prdConfirmDiscard()) return;
        prdRerenderKeeping(id);
    }

    function prdResetSec(id) {
        if (!prdHasOverride(id)) { prdToast('该章节已是默认内容'); return; }
        if (!window.confirm('恢复为默认内容？本地修改将被丢弃。')) return;
        delete prdOverrides[id];
        prdPersistOverrides();
        prdEditingId = null;
        prdRerenderKeeping(id);
        prdToast('已恢复默认内容');
    }

    // 全量重渲并保持浏览位置（目录选中项 + 滚动到指定章节）
    function prdRerenderKeeping(id) {
        var active = prdToc.querySelector('.prd-toc-item.active');
        var activeId = active ? active.getAttribute('data-sec') : null;
        prdRender();
        if (activeId) {
            var item = prdToc.querySelector('.prd-toc-item[data-sec="' + activeId + '"]');
            if (item) item.classList.add('active');
        }
        if (id) {
            var secEl = document.getElementById('prd-sec-' + id);
            if (secEl) prdContent.scrollTop = Math.max(0, secEl.offsetTop - 12);
        }
    }

    /* ---------- 导出 / 导入：Markdown 文档（与项目 PRD.md 同构） ----------
       导出结构：# 项目名 产品需求文档（PRD） / > 说明行 / # 组名 / ## 编号 标题 + 正文，
       章节与组之间以 --- 分隔；正文取覆盖层合并后的 Markdown，可直接作为 PRD.md 快照。
       导入：仅认「## 编号 标题」为章节起点，正文到下一个「## 编号」或任意「# 」标题为止，
       故文档头、组标题、验收场景表等非章节内容不会混入；正文首尾的 --- 分隔线剔除；
       章节标题与分组以代码内 PRD_SECTIONS 为准，文件里的标题不参与覆盖。 */

    function prdExportText() {
        var now = new Date();
        var pad = function (n) { return String(n).padStart(2, '0'); };
        var modified = 0;
        PRD_SECTIONS.forEach(function (s) { if (prdHasOverride(s.id)) modified++; });
        var groupKeys = PRD_GROUPS.map(function (g) { return g.key; });
        var blocks = [];
        // 未登记在 PRD_GROUPS 的章节归入「其他章节」，避免导出丢内容
        PRD_GROUPS.concat([{ key: null, name: '其他章节' }]).forEach(function (g) {
            var list = PRD_SECTIONS.filter(function (s) {
                return g.key ? s.group === g.key : groupKeys.indexOf(s.group) < 0;
            });
            if (!list.length) return;
            blocks.push('# ' + g.name + '\n\n' + list.map(function (s) {
                return '## ' + s.id + ' ' + s.title + '\n\n' + String(prdBodyOf(s)).trim();
            }).join('\n\n---\n\n'));
        });
        return [
            '# ' + PRD_APP_NAME + ' 产品需求文档（PRD）',
            '',
            '> 导出自原型页内 PRD 查看器，含全部本地修改 · '
                + now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate())
                + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes())
                + ' · 共 ' + PRD_SECTIONS.length + ' 章' + (modified ? '（本地修改 ' + modified + ' 章）' : ''),
            '',
            blocks.join('\n\n---\n\n'),
            ''
        ].join('\n');
    }

    // Markdown → 章节列表 [{ id, body }]；无章节时返回空数组
    function prdParseMd(text) {
        var lines = String(text == null ? '' : text).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
        var list = [];
        var cur = null;
        var fence = false; // ``` 围栏内的 # / ## 属正文内容，不参与结构识别
        for (var i = 0; i < lines.length; i++) {
            var t = lines[i].trim();
            if (t.indexOf('```') === 0) {
                fence = !fence;
                if (cur) cur.lines.push(lines[i]);
                continue;
            }
            if (fence) { if (cur) cur.lines.push(lines[i]); continue; }
            var m = /^##\s+([A-Za-z]{2,4}-\d{2})(?:\s+(.*))?$/.exec(t);
            if (m) {
                if (cur) list.push(cur);
                cur = { id: m[1].toUpperCase(), lines: [] };
                continue;
            }
            if (!cur) continue;       // 首个章节之前：文档标题与说明行，忽略
            if (/^#\s/.test(t)) {     // 一级标题 = 组/部分标题：本章结束，其后内容忽略
                list.push(cur);
                cur = null;
                continue;
            }
            cur.lines.push(lines[i]);
        }
        if (cur) list.push(cur);
        return list.map(function (s) {
            var body = s.lines.join('\n')
                .replace(/^\s*(?:---\s*\n)+/, '') // 章节前的分隔线
                .replace(/(?:\n\s*---)+\s*$/, '') // 章节末尾的分隔线
                .replace(/\n{3,}/g, '\n\n')
                .trim();
            return { id: s.id, body: body };
        });
    }

    // 导出：下载 Markdown 文档（含全部本地修改）
    function prdExport() {
        var now = new Date();
        var pad = function (n) { return String(n).padStart(2, '0'); };
        var blob = new Blob([prdExportText()], { type: 'text/markdown;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = PRD_EXPORT_NAME + '-' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate())
            + '-' + pad(now.getHours()) + pad(now.getMinutes()) + '.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 0);
        prdToast('已导出 PRD Markdown（含全部本地修改）');
    }

    // 导入：读取 Markdown 文档，与默认不同的章节写入覆盖层
    function prdImport() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.markdown,.txt,text/markdown,text/plain';
        input.addEventListener('change', function () {
            var file = input.files && input.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function () {
                var list = prdParseMd(reader.result);
                if (!list.length) {
                    window.alert('导入失败：文件中没有「## 编号 标题」形式的章节行（编号需与页面徽章一致，如 XX-01）。');
                    return;
                }
                if (prdEditingId && !prdConfirmDiscard()) return;
                var covered = 0, same = 0, skipped = 0, unknown = 0;
                list.forEach(function (item) {
                    if (!item.body) { skipped++; return; } // 空正文不覆盖，避免误清空本地修改
                    var sec = prdSecOf(item.id);
                    if (!sec) { unknown++; return; }
                    if (item.body === sec.body.trim()) {
                        if (prdHasOverride(item.id)) delete prdOverrides[item.id];
                        same++;
                    } else {
                        prdOverrides[item.id] = item.body;
                        covered++;
                    }
                });
                prdPersistOverrides();
                prdRerenderKeeping(null);
                prdToast('导入完成：' + covered + ' 节覆盖默认' + (same ? '，' + same + ' 节与默认一致' : '')
                    + (skipped ? '，' + skipped + ' 节正文为空已忽略' : '')
                    + (unknown ? '，' + unknown + ' 节编号无法识别已忽略' : ''));
            };
            reader.readAsText(file, 'utf-8');
        });
        input.click();
    }

    /* ---------- 事件绑定 ---------- */

    // 浮动按钮 toggle：点击展开抽屉，再次点击收起（编辑内容保留在 DOM，不丢）
    // 拖动结束会补发一次 click，用 prdFabSuppressClick 吞掉
    prdFab.addEventListener('click', function () {
        if (prdFabSuppressClick) { prdFabSuppressClick = false; return; }
        if (prdDrawer.classList.contains('open')) {
            prdCloseDrawer();
        } else {
            prdOpen();
        }
    });
    if (prdCloseBtn) prdCloseBtn.addEventListener('click', prdCloseDrawer);

    // 目录点击定位（抽屉保持展开，不遮挡原型操作）
    prdToc.addEventListener('click', function (e) {
        var item = e.target.closest('.prd-toc-item');
        if (item) prdLocate(item.getAttribute('data-sec'));
    });

    // 模块编号徽章点击（事件委托）：展开抽屉并定位；阻止冒泡避免触发卡片下钻等既有绑定
    document.addEventListener('click', function (e) {
        var badge = e.target.closest('.prd-badge');
        if (!badge) return;
        e.stopPropagation();
        e.preventDefault();
        prdOpen(badge.getAttribute('data-prd'));
    });

    // 章节编辑按钮（事件委托：编辑 / 保存 / 取消 / 恢复默认）
    prdContent.addEventListener('click', function (e) {
        var editBtn = e.target.closest('[data-prd-edit]');
        if (editBtn) { prdEnterEdit(editBtn.getAttribute('data-prd-edit')); return; }
        var saveBtn = e.target.closest('[data-prd-save]');
        if (saveBtn) { prdSaveEdit(saveBtn.getAttribute('data-prd-save')); return; }
        var cancelBtn = e.target.closest('[data-prd-cancel]');
        if (cancelBtn) { prdExitEdit(cancelBtn.getAttribute('data-prd-cancel')); return; }
        var resetBtn = e.target.closest('[data-prd-reset]');
        if (resetBtn) { prdResetSec(resetBtn.getAttribute('data-prd-reset')); }
    });

    var prdExportBtn = document.getElementById('prdExport');
    var prdImportBtn = document.getElementById('prdImport');
    if (prdExportBtn) prdExportBtn.addEventListener('click', prdExport);
    if (prdImportBtn) prdImportBtn.addEventListener('click', prdImport);

    // Esc：编辑态优先取消编辑，其次其他浮层让行，最后收起抽屉
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (!prdDrawer.classList.contains('open')) return;
        if (prdEditingId) {
            var id = prdEditingId;
            if (prdConfirmDiscard()) prdRerenderKeeping(id);
            return;
        }
        // 搜索优先：浮层开着先收起，再按才清空关键词，最后让行给抽屉
        if (prdSearchTerms.length) {
            if (prdSearchRes && !prdSearchRes.hidden) prdSearchFold(); else prdClearSearch();
            return;
        }
        if (prdAnyOverlayOpen()) return;
        prdCloseDrawer();
    });

    prdRender();
})();
