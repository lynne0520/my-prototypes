/* ============================================================
 * docx.js — 纯前端 DOCX 生成器（无第三方依赖）
 *  - store 模式 zip + CRC32
 *  - OOXML：段落 / 富文本 run / 表格 / 分页 / 图片 / 页脚页码
 *  - 产物为真实 .docx，Word / WPS 可直接打开
 * ============================================================ */
(function () {
  /* ---------------- zip ---------------- */
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  const enc = new TextEncoder();

  function zipStore(files) {
    const chunks = [];
    const central = [];
    let offset = 0;
    for (const f of files) {
      const nameBytes = enc.encode(f.name);
      const bytes = f.bytes;
      const crc = crc32(bytes);
      const size = bytes.length;
      const lh = new Uint8Array(30 + nameBytes.length);
      const dv = new DataView(lh.buffer);
      dv.setUint32(0, 0x04034b50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 0x0800, true);
      dv.setUint16(8, 0, true);
      dv.setUint16(10, 0, true);
      dv.setUint16(12, 0, true);
      dv.setUint32(14, crc, true);
      dv.setUint32(18, size, true);
      dv.setUint32(22, size, true);
      dv.setUint16(26, nameBytes.length, true);
      dv.setUint16(28, 0, true);
      lh.set(nameBytes, 30);
      chunks.push(lh, bytes);

      const ch = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(ch.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, 0, true);
      cv.setUint16(14, 0, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, size, true);
      cv.setUint32(24, size, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, offset, true);
      ch.set(nameBytes, 46);
      central.push(ch);

      offset += lh.length + size;
    }
    let cdSize = 0;
    for (const c of central) cdSize += c.length;
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, cdSize, true);
    ev.setUint32(16, offset, true);
    ev.setUint16(20, 0, true);
    return new Blob([...chunks, ...central, eocd], { type: "application/zip" });
  }

  /* ---------------- xml helpers ---------------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function rPr(o) {
    let x = "";
    if (o.font) x += `<w:rFonts w:ascii="${o.font}" w:hAnsi="${o.font}" w:eastAsia="${o.font}"/>`;
    if (o.b) x += "<w:b/><w:bCs/>";
    if (o.i) x += "<w:i/>";
    if (o.strike) x += "<w:strike/>";
    if (o.color) x += `<w:color w:val="${o.color}"/>`;
    if (o.size) x += `<w:sz w:val="${o.size}"/><w:szCs w:val="${o.size}"/>`;
    if (o.u) x += `<w:u w:val="${o.u}"/>`;
    if (o.sup) x += '<w:vertAlign w:val="superscript"/>';
    return x ? `<w:rPr>${x}</w:rPr>` : "";
  }

  function run(text, o = {}) {
    const t = esc(text).replace(/\n/g, "</w:t><w:br/><w:t xml:space=\"preserve\">");
    return `<w:r>${rPr(o)}<w:t xml:space="preserve">${t}</w:t></w:r>`;
  }

  function pPr(o = {}) {
    let x = "";
    if (o.spacing) x += `<w:spacing w:before="${o.spacing[0] || 0}" w:after="${o.spacing[1] || 0}" w:line="${o.spacing[2] || 240}" w:lineRule="auto"/>`;
    if (o.ind) x += `<w:ind w:left="${o.ind[0] || 0}" w:right="${o.ind[1] || 0}" w:firstLine="${o.ind[2] || 0}"/>`;
    if (o.align) x += `<w:jc w:val="${o.align}"/>`;
    if (o.border) x += `<w:pBdr><w:bottom w:val="single" w:sz="${o.border.sz || 6}" w:space="2" w:color="${o.border.color || 'D9DEE7'}"/></w:pBdr>`;
    if (o.shd) x += `<w:shd w:val="clear" w:color="auto" w:fill="${o.shd}"/>`;
    if (o.keepNext) x += "<w:keepNext/>";
    return x ? `<w:pPr>${x}</w:pPr>` : "";
  }

  function para(inner, o = {}) {
    return `<w:p>${pPr(o)}${inner}</w:p>`;
  }

  /* ---------------- 文档构造器 ---------------- */
  class Docx {
    constructor(opts = {}) {
      this.body = "";
      this.images = [];
      this.footerText = opts.footer || "";
      this.meta = { title: opts.title || "智批报告", author: opts.author || "智批系统" };
    }

    title(text, sub) {
      this.body += para(run(text, { font: "黑体", size: 36, b: true, color: "1B2430" }), {
        align: "center",
        spacing: [0, 60, 300],
      });
      if (sub) this.body += para(run(sub, { size: 19, color: "6B7686" }), { align: "center", spacing: [0, 200, 300] });
      return this;
    }

    h1(text) {
      this.body += para(run(text, { font: "黑体", size: 26, b: true, color: "0F2B5B" }), {
        spacing: [220, 100, 300],
        keepNext: true,
        border: { sz: 10, color: "1677FF" },
      });
      return this;
    }

    h2(text) {
      this.body += para(run(text, { font: "黑体", size: 21, b: true, color: "22303F" }), { spacing: [160, 60, 300], keepNext: true });
      return this;
    }

    p(text, o = {}) {
      this.body += para(run(text, Object.assign({ size: 20, color: "2B3648" }, o.run || {})), {
        spacing: [0, o.after == null ? 80 : o.after, o.line || 300],
        ind: o.ind,
        align: o.align,
      });
      return this;
    }

    rich(segments, o = {}) {
      const inner = segments
        .map((s) => {
          if (s.text != null) return run(s.text, Object.assign({ size: 20, color: "2B3648" }, s));
          return run(s.t || "", Object.assign({ size: 20, color: "2B3648" }, s));
        })
        .join("");
      this.body += para(inner, { spacing: [0, 80, 300], ind: o.ind, align: o.align });
      return this;
    }

    spacer(h = 120) {
      this.body += para("", { spacing: [0, h, 240] });
      return this;
    }

    pageBreak() {
      this.body += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
      return this;
    }

    /** rows: [][]; cell 可以是字符串，或 { blocks:[...], shd, bold, align, color } */
    table(rows, opts = {}) {
      const widthTotal = 9360;
      const widths = opts.widths || rows[0].map(() => 1);
      const totalW = widths.reduce((a, b) => a + b, 0);
      const cols = widths.map((w) => Math.round((widthTotal * w) / totalW));
      const border =
        '<w:tblBorders><w:top w:val="single" w:sz="4" w:color="D9DEE7"/><w:left w:val="single" w:sz="4" w:color="D9DEE7"/><w:bottom w:val="single" w:sz="4" w:color="D9DEE7"/><w:right w:val="single" w:sz="4" w:color="D9DEE7"/><w:insideH w:val="single" w:sz="4" w:color="D9DEE7"/><w:insideV w:val="single" w:sz="4" w:color="D9DEE7"/></w:tblBorders>';
      let xml = `<w:tbl><w:tblPr><w:tblW w:w="${widthTotal}" w:type="dxa"/><w:tblLayout w:type="fixed"/>${border}<w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>`;
      cols.forEach((c) => (xml += `<w:gridCol w:w="${c}"/>`));
      xml += "</w:tblGrid>";
      rows.forEach((row, ri) => {
        xml += "<w:tr>";
        if (ri === 0 && opts.header !== false) xml += '<w:trPr><w:tblHeader/></w:trPr>';
        row.forEach((cell, ci) => {
          const c = typeof cell === "object" && cell !== null ? cell : { text: cell };
          const isHead = ri === 0 && opts.header !== false;
          const fill = c.shd || (isHead ? "EEF3FA" : null);
          const span = c.colspan || 1;
          xml += `<w:tc><w:tcPr><w:tcW w:w="${cols.slice(ci, ci + span).reduce((a, b) => a + b, 0)}" w:type="dxa"/>${
            span > 1 ? `<w:gridSpan w:val="${span}"/>` : ""
          }${
            fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>` : ""
          }<w:vAlign w:val="center"/></w:tcPr>`;
          const runs = run(c.text == null ? "" : c.text, {
            size: c.size || 18,
            b: isHead || c.bold,
            color: c.color || (isHead ? "1B2430" : "2B3648"),
          });
          xml += para(runs, { spacing: [0, 0, 260], align: c.align });
          xml += "</w:tc>";
        });
        xml += "</w:tr>";
      });
      xml += "</w:tbl>";
      this.body += xml + para("", { spacing: [0, 100, 200] });
      return this;
    }

    /** 图片：base64（不含前缀）、显示宽高（px） */
    image(base64, wPx, hPx, caption) {
      const exist = this.images.find((im) => im.base64 === base64);
      const id = exist ? exist.id : this.images.length + 1;
      const rid = "rIdImg" + id;
      if (!exist) this.images.push({ rid, base64, id });
      const cx = Math.round(wPx * 9525);
      const cy = Math.round(hPx * 9525);
      this.body +=
        `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="60" w:after="60"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">` +
        `<wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${id}" name="image${id}.png"/>` +
        `<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>` +
        `<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
        `<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
        `<pic:nvPicPr><pic:cNvPr id="${id}" name="image${id}.png"/><pic:cNvPicPr/></pic:nvPicPr>` +
        `<pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` +
        `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>` +
        `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
      if (caption) this.body += para(run(caption, { size: 17, color: "8A94A6" }), { align: "center", spacing: [0, 120, 240] });
      return this;
    }

    /* ---------------- 打包 ---------------- */
    async toBlob() {
      const hasFooter = !!this.footerText;
      const hasImg = this.images.length > 0;

      const rels = [];
      rels.push('<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>');
      if (hasFooter)
        rels.push('<Relationship Id="rIdFooter" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>');
      this.images.forEach((im) =>
        rels.push(`<Relationship Id="${im.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image${im.id}.png"/>`),
      );

      const sect =
        '<w:sectPr>' +
        (hasFooter ? '<w:footerReference w:type="default" r:id="rIdFooter"/>' : "") +
        '<w:pgSz w:w="11906" w:h="16838"/>' +
        '<w:pgMar w:top="1247" w:right="1247" w:bottom="1134" w:left="1247" w:header="851" w:footer="850" w:gutter="0"/>' +
        '<w:cols w:space="425"/><w:docGrid w:linePitch="312"/></w:sectPr>';

      const documentXml =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
        "<w:body>" +
        this.body +
        sect +
        "</w:body></w:document>";

      const stylesXml =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
        '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="宋体" w:cs="Calibri"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:rPrDefault>' +
        '<w:pPrDefault><w:pPr><w:spacing w:after="80" w:line="300" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
        '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
        "</w:styles>";

      const footerXml =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        '<w:p><w:pPr><w:jc w:val="center"/><w:pBdr><w:top w:val="single" w:sz="4" w:space="4" w:color="D9DEE7"/></w:pBdr></w:pPr>' +
        run(this.footerText, { size: 16, color: "9AA3AF" }) +
        run("　第 ", { size: 16, color: "9AA3AF" }) +
        '<w:fldSimple w:instr=" PAGE "><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="9AA3AF"/></w:rPr><w:t>1</w:t></w:r></w:fldSimple>' +
        run(" 页", { size: 16, color: "9AA3AF" }) +
        "</w:p></w:ftr>";

      const coreXml =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
        `<dc:title>${esc(this.meta.title)}</dc:title><dc:creator>${esc(this.meta.author)}</dc:creator><cp:lastModifiedBy>${esc(this.meta.author)}</cp:lastModifiedBy>` +
        "</cp:coreProperties>";

      const contentTypes =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        (hasImg ? '<Default Extension="png" ContentType="image/png"/>' : "") +
        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
        '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
        (hasFooter ? '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>' : "") +
        '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
        "</Types>";

      const rootRels =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
        "</Relationships>";

      const docRels =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        rels.join("") +
        "</Relationships>";

      const files = [
        { name: "[Content_Types].xml", bytes: enc.encode(contentTypes) },
        { name: "_rels/.rels", bytes: enc.encode(rootRels) },
        { name: "docProps/core.xml", bytes: enc.encode(coreXml) },
        { name: "word/document.xml", bytes: enc.encode(documentXml) },
        { name: "word/styles.xml", bytes: enc.encode(stylesXml) },
        { name: "word/_rels/document.xml.rels", bytes: enc.encode(docRels) },
      ];
      if (hasFooter) files.push({ name: "word/footer1.xml", bytes: enc.encode(footerXml) });
      this.images.forEach((im) => {
        const bin = atob(im.base64);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        files.push({ name: `word/media/image${im.id}.png`, bytes: arr });
      });

      return zipStore(files);
    }
  }

  window.DOCX = { Docx, zipStore, esc };
})();
