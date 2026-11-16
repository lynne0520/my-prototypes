/* ============================================================
 * report-docx.js — 把智批报告数据编排成 Word 文档结构
 * ============================================================ */
(function () {
  const { Docx } = window.DOCX;

  const C = {
    ink: "1B2430",
    body: "2B3648",
    sub: "6B7686",
    blue: "1677FF",
    del: "C0392B",
    ins: "1F8A4C",
    line: "D9DEE7",
  };

  function stars(n) {
    return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
  }

  /** 取包含错词的句子，用于“原句 / 订正后” */
  function sentenceOf(rep, c) {
    const para = rep.plain.find((x) => x.includes(c.from)) || "";
    const parts = para.split(/(?<=[.!?])\s+/);
    const src = parts.find((p) => p.includes(c.from)) || para;
    return { src, fixed: src.replace(c.from, c.to) };
  }

  function segRuns(doc, segs) {
    const list = [];
    segs.forEach((s) => {
      if (s.del != null) {
        list.push({ t: s.del, strike: true, color: C.del, size: 21 });
        list.push({ t: " ", size: 21 });
        list.push({ t: s.ins, b: true, u: "single", color: C.ins, size: 21 });
        list.push({ t: String(s.n), sup: true, color: C.blue, size: 15 });
      } else {
        list.push({ t: s.text, size: 21, color: C.body });
      }
    });
    return list;
  }

  /* ---------------- 单个学生 × 多题的文档 ---------------- */
  function buildStudentDoc(student, qids, cfg, scan) {
    const doc = new Docx({
      title: `${student.name} · ${window.HW.name} 智批报告`,
      footer: `${window.HW.school} · ${window.HW.name} · 智批报告`,
    });

    // 学生档案头
    doc.title("英语作文智批报告", `${window.HW.klass}　${window.HW.name}　扫描时间 ${window.HW.scanTime}`);
    const head = [
      ["姓名", student.name, "班级", window.HW.klass],
      ["作业", window.HW.name, "学科", window.HW.subject],
      ["作文题数", `${qids.length} 题`, "总分", `${student.total} / ${window.HW.fullScore}`],
    ];
    if (cfg.modules.basic !== false) {
      doc.table(head, { widths: [1.1, 2.6, 1.1, 2.6] });
    }

    qids.forEach((qid, i) => {
      const q = window.HW.questions.find((x) => x.id === qid);
      const rep = student.reports[qid];
      if (!rep) return;
      if (i > 0) doc.pageBreak();

      doc.h1(`${q.no}　${q.type}　得分 ${rep.score} / ${q.fullScore}（${rep.levelName}）`);
      doc.p(`题目：${q.stem}`, { run: { color: C.sub, size: 18 }, after: 120 });

      // 一、基本信息
      if (cfg.modules.basic !== false) {
        doc.h2("一、基本信息");
        doc.table(
          [
            ["满分", "得分", "档位", "字数 / 句数 / 段数"],
            [
              `${q.fullScore}`,
              `${rep.score}`,
              rep.levelName,
              `${rep.stat.words} 词 / ${rep.stat.sentences} 句 / ${rep.stat.paragraphs} 段（要求 ${rep.stat.limit}）`,
            ],
            ["诊断标签", { text: rep.tags.join("　·　"), colspan: 3 }],
          ],
          { widths: [1.2, 1, 1, 3.6] },
        );
        doc.p("综合评价", { run: { b: true, size: 20, color: C.ink }, after: 40 });
        doc.p(rep.overview);
      }

      // 二、原文与旁批
      if (cfg.modules.text !== false) {
        doc.h2("二、原文与旁批（红色删除线为原词，绿色为修订词，上标为纠错编号）");
        rep.paras.forEach((segs, idx) => {
          doc.rich([{ t: `¶${idx + 1}　`, size: 19, color: C.blue, b: true }, ...segRuns(doc, segs)]);
        });
        if (cfg.modules.image && scan) {
          doc.image(scan.base64, scan.w, scan.h, `原卷扫描图 · ${student.name} · ${q.no}`);
        }
      }

      // 三、评分维度
      if (cfg.modules.dims !== false) {
        doc.h2(cfg.modules.text !== false ? "三、评分维度详情" : "二、评分维度详情");
        doc.table(
          [["维度", "星级", "评语"], ...rep.dims.map((d) => [d.name, stars(d.stars), d.text])],
          { widths: [1, 1.6, 7] },
        );
      }

      // 四、纠错详情
      if (cfg.modules.corrections !== false) {
        doc.h2(`四、纠错详情（共 ${rep.corrections.length} 处）`);
        doc.table(
          [
            ["纠错项", "错误类型", "说明 / 知识点", "原句 → 订正后"],
            ...rep.corrections.map((c) => {
              const { src, fixed } = sentenceOf(rep, c);
              return [
                { text: `${c.n}.　${c.from} → ${c.to}`, bold: true, color: C.ink },
                c.type,
                `${c.note}\n知识点：${c.tip}`,
                `原句：${src}\n订正：${fixed}`,
              ];
            }),
          ],
          { widths: [2, 1.7, 2.5, 4.3] },
        );
      }

      // 五、详细分析
      if (cfg.modules.analysis !== false) {
        doc.h2("五、详细分析");
        rep.analysis.forEach((a) => {
          doc.p(a.title, { run: { b: true, size: 20, color: C.ink }, after: 30 });
          doc.p(a.text);
        });
      }

      // 六、润色提升
      if (cfg.modules.polish) {
        doc.h2("六、润色提升");
        doc.table(
          [
            ["原句", rep.polish.from],
            ["升格句", rep.polish.to],
            ["润色思路", rep.polish.note],
          ],
          { widths: [1, 7.5], header: false },
        );
      }

      doc.p("本报告由 AI 生成，仅供教学参考。", { run: { size: 16, color: C.sub }, align: "right" });
    });

    return doc.toBlob();
  }

  /* ---------------- 班级合订本文档 ---------------- */
  function buildClassDoc(students, qids, cfg, scan) {
    const doc = new Docx({
      title: `${window.HW.klass} ${window.HW.name} 智批报告（班级合订）`,
      footer: `${window.HW.school} · ${window.HW.name} · 班级智批报告`,
    });

    /* 封面 */
    if (cfg.cover !== false) {
      doc.spacer(600);
      doc.title("英语作文智批报告", "班级合订本");
      doc.spacer(200);
      doc.table(
        [
          ["学校", window.HW.school],
          ["班级", window.HW.klass],
          ["作业", window.HW.name],
          ["学科 / 题量", `${window.HW.subject} / ${qids.length} 题（${qids.map((q) => window.HW.questions.find((x) => x.id === q).type).join("、")}）`],
          ["导出学生", `${students.length} 人 · 共 ${students.length * qids.length} 篇`],
          ["扫描时间", window.HW.scanTime],
          ["导出时间", cfg.exportTime],
          ["导出人", window.HW.teacher],
        ],
        { widths: [2, 8], header: false },
      );
      doc.spacer(400);
      doc.p("本合订本由「电子作业本 · 智批报告导出」生成，报告内容由 AI 批改产出，仅供教师教学参考。", {
        run: { size: 17, color: C.sub },
        align: "center",
      });
      doc.pageBreak();
    }

    /* 班级总览 */
    if (cfg.overview !== false) {
      doc.h1("班级成绩总览");
      const rows = [["序号", "姓名", ...qids.map((q) => window.HW.questions.find((x) => x.id === q).no), "总分", "档位", "主要失分点"]];
      students.forEach((s, i) => {
        const mainIssue = s.reports[qids[0]] ? s.reports[qids[0]].corrections.slice(0, 2).map((c) => c.type).join("、") : "—";
        rows.push([
          String(i + 1),
          s.name,
          ...qids.map((q) => (s.reports[q] ? String(s.reports[q].score) : "—")),
          `${s.total} / ${window.HW.fullScore}`,
          s.reports[qids[0]] ? s.reports[qids[0]].levelName : "—",
          mainIssue || "—",
        ]);
      });
      const avg = (students.reduce((a, s) => a + s.total, 0) / students.length).toFixed(2);
      doc.table(rows, { widths: [0.7, 1.6, ...qids.map(() => 0.9), 1.2, 1.1, 3] });
      doc.p(`班级平均总分：${avg} 分　|　最高：${Math.max(...students.map((s) => s.total))} 分　|　最低：${Math.min(...students.map((s) => s.total))} 分`, {
        run: { size: 18, color: C.sub },
      });
      doc.pageBreak();
    }

    /* 目录 */
    if (cfg.toc !== false) {
      doc.h1("目录");
      const tocRows = [["篇次", "姓名", ...qids.map((q) => window.HW.questions.find((x) => x.id === q).no), "总分"]];
      students.forEach((s, i) => {
        tocRows.push([`第 ${i + 1} 篇`, s.name, ...qids.map((q) => (s.reports[q] ? String(s.reports[q].score) : "—")), `${s.total}`]);
      });
      doc.table(tocRows, { widths: [1.2, 2, ...qids.map(() => 1), 1.2] });
      doc.pageBreak();
    }

    /* 逐生：每人新起一页；同一学生第 1 题紧接标题，后续题分页 */
    students.forEach((s, si) => {
      if (si > 0) doc.pageBreak();
      doc.h1(`第 ${si + 1} 篇　${s.name}`);
      doc.p(`总分 ${s.total} / ${window.HW.fullScore}　·　${qids.map((q) => `${window.HW.questions.find((x) => x.id === q).type} ${s.reports[q] ? s.reports[q].score : "—"} 分`).join("　|　")}`, {
        run: { size: 19, color: C.sub },
      });
      qids.forEach((qid, qi) => {
        const q = window.HW.questions.find((x) => x.id === qid);
        const rep = s.reports[qid];
        if (!rep) return;
        if (qi > 0) doc.pageBreak();
        doc.h2(`${q.no}　${q.type}　${rep.score} / ${q.fullScore}　${rep.levelName}`);
        doc.p(`原文（修订稿）：`, { run: { b: true, size: 19, color: C.ink }, after: 30 });
        rep.paras.forEach((segs, idx) => doc.rich([{ t: `¶${idx + 1}　`, size: 18, color: C.blue, b: true }, ...segRuns(doc, segs)]));
        if (cfg.modules.dims !== false) {
          doc.p("评分维度", { run: { b: true, size: 19, color: C.ink }, after: 30 });
          doc.table([["维度", "星级", "评语"], ...rep.dims.map((d) => [d.name, stars(d.stars), d.text])], { widths: [1, 1.6, 7] });
        }
        if (cfg.modules.corrections !== false) {
          doc.p(`纠错详情（${rep.corrections.length} 处）`, { run: { b: true, size: 19, color: C.ink }, after: 30 });
          doc.table(
            [
              ["纠错项", "类型", "说明 / 知识点", "原句 → 订正后"],
              ...rep.corrections.map((c) => {
                const { src, fixed } = sentenceOf(rep, c);
                return [
                  { text: `${c.n}.　${c.from} → ${c.to}`, bold: true, color: C.ink },
                  c.type,
                  `${c.note}\n知识点：${c.tip}`,
                  `原句：${src}\n订正：${fixed}`,
                ];
              }),
            ],
            { widths: [2, 1.7, 2.5, 4.3] },
          );
        }
        if (cfg.modules.analysis !== false) {
          doc.p("详细分析", { run: { b: true, size: 19, color: C.ink }, after: 30 });
          rep.analysis.forEach((a) => doc.p(`${a.title}：${a.text}`));
        }
        if (cfg.modules.polish) {
          doc.p("润色提升", { run: { b: true, size: 19, color: C.ink }, after: 30 });
          doc.table([["原句", rep.polish.from], ["升格句", rep.polish.to], ["思路", rep.polish.note]], { widths: [1, 7.5], header: false });
        }
        if (cfg.modules.image && scan) doc.image(scan.base64, scan.w, scan.h, `原卷扫描图 · ${s.name} · ${q.no}`);
      });
    });

    doc.p("本报告由 AI 生成，仅供教学参考。", { run: { size: 16, color: C.sub }, align: "right" });
    return doc.toBlob();
  }

  window.REPORT_DOCX = { buildStudentDoc, buildClassDoc };
})();
