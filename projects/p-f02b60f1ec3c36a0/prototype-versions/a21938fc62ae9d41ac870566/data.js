/* ============================================================
 * data.js — 原型模拟数据
 * 页面结构对齐「电子作业本 · 3.21作文限时练」真实讲评页；
 * 作文原文与批改内容为示意数据，其中 周泽同·一、1 为真实报告内容。
 * ============================================================ */

window.HW = {
  id: 1018661,
  name: "3.21作文限时练",
  klass: "高一(3)班",
  school: "演示学校 进步中学",
  teacher: "jbgz001",
  subject: "英语作文",
  scanTime: "2026-10-13",
  fullScore: 40,
  avg: 29.56,
  submitted: 50,
  absent: ["黄晨阳", "刘傲航"],
  questions: [
    {
      id: "q1",
      no: "一、1",
      type: "应用文写作",
      fullScore: 15,
      rate: 74.8,
      qAvg: 11.2,
      limit: "80词",
      levelNames: ["第一档", "第二档", "第三档", "第四档", "第五档"],
      stem:
        "假定你是李华，你班最近开展了用视频日志（vlog）记录校园美好瞬间的活动，请你给英国朋友 Moss 写一封邮件，内容包括：（1）介绍你制作的视频日志；（2）你的感受。",
    },
    {
      id: "q2",
      no: "二、2",
      type: "读后续写",
      fullScore: 25,
      rate: 73.4,
      qAvg: 18.3,
      limit: "150词",
      levelNames: ["第一档", "第二档", "第三档", "第四档", "第五档"],
      stem:
        "阅读下面材料，根据其内容和所给段落开头语续写两段，使之构成一篇完整的短文。My most memorable Thanksgiving happened last year at our local church, where a simple outreach program blossomed into a profound lesson on the power of sharing, care, and inclusion…",
    },
  ],
};

/* ---------------- 原文模板（⟦原词|修订|编号⟧） ---------------- */
const TEXTS = {
  q1: {
    A: {
      paras: [
        "With the activity documenting perfect ⟦moment|moments|1⟧ launched in our school, I am more than delighted to share my unique experience with you.",
        "On the basis of vlog, a novel way to reflect ⟦dailylife|daily life|2⟧, I introduced my school initially in the video. Then my camera turned to the playground, where my ⟦classmate|classmates|3⟧ ⟦showcase|showcased|4⟧ their outstanding talent and the spirit of sports. What's more, I have shot several moral ⟦behavior|behaviors|5⟧, ranging from ⟦pick up|picking up|6⟧ litter to helping disabled students.",
        "This activity has ⟦turned out|revealed|7⟧ our students' positive attitude and ⟦gesture|gestures|8⟧ to life. What I have yielded is that I ⟦regain|regained|9⟧ the enthusiasm of life and focus on wonderful moments in ⟦daily- bring|daily|10⟧ life, ⟦which me|which brings me|11⟧ a sense of beauty echoing my soul from our school.",
      ],
      marks: {
        1: { type: "单复数错误", note: "perfect moments 应用复数表多个瞬间。", tip: "可数名词表泛指多个对象时用复数。" },
        2: { type: "拼写错误", note: "daily life 为两词，不应粘连书写。", tip: "固定搭配需保持分词书写。" },
        3: { type: "单复数错误", note: "their 指代复数，classmate 应用复数形式。", tip: "代词与先行词数需保持一致。" },
        4: { type: "时态错误", note: "全文叙述过去活动，谓语应用过去式。", tip: "叙事时态应保持一致。" },
        5: { type: "单复数错误", note: "several 后接可数名词复数形式。", tip: "several 修饰可数名词复数。" },
        6: { type: "非谓语错误", note: "ranging from...to... 前后均应用动名词。", tip: "介词后接动词应用 -ing 形式。" },
        7: { type: "搭配错误", note: "turn out 意为“结果是”，此处应用 reveal 表展现。", tip: "turn out 不接宾语表展现之意。" },
        8: { type: "单复数错误", note: "attitude and gestures 并列，gesture 应用复数。", tip: "并列成分数需保持一致。" },
        9: { type: "时态错误", note: "that 从句叙述已发生感悟，应用过去式。", tip: "宾语从句时态与主句呼应。" },
        10: { type: "拼写错误", note: "daily life 为两词，OCR 断裂导致拼写错误。", tip: "注意 OCR 断词造成的拼接错误。" },
        11: { type: "句式结构错误", note: "which 引导定语从句缺少谓语动词，应加 brings。", tip: "定语从句须有完整主谓结构。" },
      },
    },
    B: {
      paras: [
        "I am Li Hua, a student from Class 3. Knowing that you are interested in Chinese campus life, I am writing to share a vlog ⟦which|that|1⟧ records the beautiful moments of our school.",
        "The vlog begins with the morning reading in the classroom, and then it moves to the playground ⟦where|which|2⟧ students are playing basketball. Besides, I also ⟦shoot|shot|3⟧ the scene of the art festival last Friday. Many ⟦student|students|4⟧ took part in the performance and their smile ⟦show|showed|5⟧ their confidence.",
        "Through this vlog, I have learned ⟦to|that|6⟧ the beauty of our school lies in every ordinary day.",
      ],
      marks: {
        1: { type: "关系词错误", note: "先行词 vlog 指物，从句缺主语，用 that/which 均可，但与前文 which 重复应改 that。", tip: "避免同一句重复使用同类关系词。" },
        2: { type: "关系词错误", note: "先行词为地点，但从句中 are playing 需主语，应用 which。", tip: "关系词选择看从句成分是否残缺。" },
        3: { type: "时态错误", note: "叙述上周五活动，应用过去式 shot。", tip: "时间状语决定谓语时态。" },
        4: { type: "单复数错误", note: "Many 后接可数名词复数。", tip: "many 修饰可数名词复数。" },
        5: { type: "主谓一致", note: "主语 their smile 为单数，应用 showed→shows 或改 smiles。", tip: "主谓一致看中心词，不看修饰语。" },
        6: { type: "搭配错误", note: "learn 后搭配名词性从句或名词，此处应为 learn that…。", tip: "learn 后接从句常用 that 引导。" },
      },
    },
    C: {
      paras: [
        "I'm writing to introduce a vlog ⟦what|that|1⟧ I made recently with my classmates. The vlog records the beautiful moments in our campus.",
        "In the first part, we ⟦filming|filmed|2⟧ the sunrise over the teaching building. Then we went to the playground and recorded a football match. The players' ⟦spirit|spirits|3⟧ impressed me deeply, and I ⟦realize|realized|4⟧ that teamwork is the key to success.",
        "As for my feelings, making the vlog ⟦help|helped|5⟧ me find the beauty around me. I hope you can watch it and ⟦give|offer|6⟧ me some advice.",
      ],
      marks: {
        1: { type: "关系词错误", note: "vlog 后为定语从句，what 不能引导定语从句。", tip: "what 不引导定语从句。" },
        2: { type: "时态错误", note: "叙述过去拍摄过程，应用一般过去时 filmed。", tip: "叙事段落保持一般过去时。" },
        3: { type: "单复数错误", note: "spirit 表“精神”时为不可数，此处不应加 s。", tip: "抽象名词表概念时不可数。" },
        4: { type: "时态错误", note: "与 impressed 并列，应用过去式 realized。", tip: "并列谓语时态需一致。" },
        5: { type: "时态错误", note: "动名词作主语，谓语描述过去经历用 helped。", tip: "动名词主语视为单数，时态依语境。" },
        6: { type: "搭配错误", note: "give me some advice 为固定搭配，offer 后应接 advice to me。", tip: "重视固定搭配的介词结构。" },
      },
    },
  },
  q2: {
    A: {
      paras: [
        "Para.1 Just as the disappointed family were about to leave, Mrs Jones stopped them. She walked to the table where our baskets were ⟦lay|laid|1⟧, picked up her own basket and handed it to the father. “We have enough,” she said softly, “and Thanksgiving is about sharing.” The hall fell ⟦silence|silent|2⟧ for a moment, and then someone began to clap. Soon, baskets were opened, and families took out turkeys, bread and ⟦vegetable|vegetables|3⟧ to put into a new one.",
        "Para.2 Seeing the special “basket”, the family were moved to tears. The little girl hugged her ⟦mother|mother's|4⟧ leg and smiled shyly, while the father kept ⟦say|saying|5⟧ thank you again and again. That night, I understood that a basket is not only food, but a hug from strangers. The ⟦warm|warmth|6⟧ in that hall stayed with me long after the lights went out.",
      ],
      marks: {
        1: { type: "动词形式错误", note: "were laid 为被动语态，此处应用过去分词 laid。", tip: "被动语态使用过去分词。" },
        2: { type: "词性错误", note: "fall 后接形容词作表语，用 silent。", tip: "系动词后接形容词。" },
        3: { type: "单复数错误", note: "并列名词表多种蔬菜，用复数 vegetables。", tip: "可数名词并列泛指时用复数。" },
        4: { type: "所有格错误", note: "“妈妈的腿”应用名词所有格 mother's。", tip: "名词修饰另一名词表所属时用所有格。" },
        5: { type: "非谓语错误", note: "keep 后接动名词表示持续状态。", tip: "keep doing 表持续动作。" },
        6: { type: "词性错误", note: "此处作主语，应用名词 warmth。", tip: "主语位置使用名词形式。" },
      },
    },
    B: {
      paras: [
        "Para.1 Just as the disappointed family were about to leave, Mrs Jones stopped them. “Wait a moment, please,” she said, and she carried her basket to them. Seeing this, several other ⟦family|families|1⟧ stood up and shared what they had. In a few minutes, a new basket was filled with bread, turkey and ⟦candle|candles|2⟧. The father looked at us in ⟦surprised|surprise|3⟧, unable to speak.",
        "Para.2 Seeing the special “basket”, the family were moved to tears. The mother held the basket tightly as if it were the most ⟦value|valuable|4⟧ thing in the world. Before they left, the little girl ⟦turn|turned|5⟧ back and waved to everyone. I suddenly realized that giving is not losing but ⟦receive|receiving|6⟧ more love.",
      ],
      marks: {
        1: { type: "单复数错误", note: "several 后接可数名词复数 families。", tip: "several 修饰可数名词复数。" },
        2: { type: "单复数错误", note: "并列列举多种物品，用复数 candles。", tip: "并列可数名词泛指用复数。" },
        3: { type: "词性错误", note: "in surprise 为固定搭配，需名词。", tip: "介词后接名词构成固定搭配。" },
        4: { type: "词性错误", note: "修饰名词 thing 应用形容词 valuable。", tip: "定语位置使用形容词。" },
        5: { type: "时态错误", note: "叙述过去动作，用 turned。", tip: "叙事时态保持一致。" },
        6: { type: "非谓语错误", note: "but 连接并列成分，应与 giving 保持一致。", tip: "并列结构形式需对称。" },
      },
    },
  },
};

/* ---------------- 班级名单（对齐真实页面得分分组） ---------------- */
const BANDS = {
  优: ["党咏乐", "王一涵(外)", "王逸轩", "赵明睿", "李梓轩", "王圣为", "徐浩童", "张瀚蔚", "赵铭浩", "甄梓康", "钟生远", "马天翼", "史津谊", "周泽同", "颛孙宇浩"],
  良: ["陈启迪", "陈宇恒", "杜博轩", "韩冰月", "韩秉正", "李沐阳", "李世贤", "吕馨凝", "马馨然", "孙一阳", "唐海瞳", "田芯蕊", "王楚宁", "王杰森", "王玉锐", "杨屹然", "叶城旭", "殷宇泽", "张甘霖", "张文瑜", "张子鉴", "赵梓童", "种美伊", "周闻达", "周奕彤", "杜新泽", "刘鸿锦", "王韬翔", "夏雨欣", "张祖铭", "张贻程"],
  差: ["甘子玉", "刘星宇", "梅瑞颖", "孙廷鑫"],
};

function seed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000;
  return h;
}

const LEVEL_RATE = { 优: 0.86, 良: 0.72, 差: 0.42 };
const KEEP_RATE = { 优: 0.35, 良: 0.62, 差: 1 };

const OVERVIEW = {
  q1: {
    优: "文章要点齐全，vlog 内容与个人感受层次分明，能使用定语从句、非谓语结构提升表达；个别单复数与拼写失误不影响理解，书信格式完整。",
    良: "文章完成两项要点，结构为三段式，衔接词使用基本得当；语法错误集中在时态与单复数，存在个别影响理解的残缺句，结尾缺少期待回复的礼貌收束。",
    差: "仅完成部分要点，vlog 内容介绍笼统、感受表达空泛；句子多为简单句且存在多处基础语法错误，邮件格式不完整。",
  },
  q2: {
    优: "两段续写与原文情节衔接自然，第一段解决“资源不足”的冲突，第二段落到情感升华；细节描写与心理描写丰富，语言有画面感。",
    良: "情节推进合理，能呼应前文人物；语言以简单句为主，偶有词性与非谓语错误，段末升华略显直白。",
    差: "情节与前文衔接较弱，缺少具体细节支撑，语言错误较多且句式单一，两段之间连贯性不足。",
  },
};

const DIMS = {
  q1: ["内容", "语言", "结构"],
  q2: ["情节", "语言", "结构", "衔接"],
};

function dimText(qid, dim, level) {
  const map = {
    q1: {
      内容: {
        优: "要点 1～4 全部覆盖，背景、vlog 内容、感受与期待回复齐全。",
        良: "要点 2 与要点 3 覆盖完整，要点 1 仅提及活动未说明主题背景，要点 4 缺少明确的期待回复表述。",
        差: "仅覆盖要点 2 的部分内容，个人感受表达笼统，缺少完整的书信要素。",
      },
      语言: {
        优: "词汇选择准确，能使用定语从句与非谓语结构，仅存在个别单复数与拼写瑕疵。",
        良: "存在多处错误：单复数、时态、非谓语与搭配错误交替出现，个别残缺句影响理解。",
        差: "基础语法错误密集，主谓一致、时态与词性混淆，多个句子无法独立成立。",
      },
      结构: {
        优: "三段式清晰，开头点题、中间展开、结尾升华并致谢，衔接词丰富。",
        良: "正文三段层次清晰，使用 Then / What's more 衔接；结尾有升华句但无礼节性收尾。",
        差: "段落划分随意，句间缺少衔接，结尾突兀。",
      },
    },
    q2: {
      情节: {
        优: "第一段紧扣 Para.1 开头，用“让出自己的篮子”化解冲突，动作链完整；第二段落到情感回应，主题升华自然。",
        良: "情节推进合理，能让 Mrs Jones 主动让出篮子；但第二段细节较少，情感表达略直白。",
        差: "情节与前文人物动机脱节，缺少具体动作支撑，结尾生硬。",
      },
      语言: {
        优: "动作描写与心理描写交替，长短句结合，用词生动。",
        良: "以简单句为主，偶有词性、非谓语错误，缺少生动细节描写。",
        差: "句式单一，动词形式错误较多，影响叙事流畅度。",
      },
      结构: {
        优: "两段各自独立完整，段首承接原文，段末留有余味。",
        良: "两段分工明确，第一段叙事、第二段抒情，衔接基本顺畅。",
        差: "两段内容重复，缺少推进层次。",
      },
      衔接: {
        优: "使用 Just as / Seeing this / Before they left 等衔接手段，时间线清晰。",
        良: "主要依靠时间副词衔接，缺少逻辑性连接词。",
        差: "句与句之间跳跃明显，指代不清。",
      },
    },
  };
  return map[qid][dim][level];
}

const TAGS = {
  q1: ["单复数错误", "时态错误", "句式结构错误", "词汇丰富", "复杂句运用", "逻辑连贯"],
  q2: ["情节连贯", "细节描写", "语言生动", "句式多样", "情感升华"],
};

/* ---------------- 解析 ⟦原词|修订|编号⟧ ---------------- */
function parseParas(paras, keepMark) {
  return paras.map((raw) => {
    const segs = [];
    const re = /⟦([^|]+)\|([^|]+)\|(\d+)⟧/g;
    let last = 0;
    let m;
    while ((m = re.exec(raw))) {
      if (m.index > last) segs.push({ text: raw.slice(last, m.index) });
      const idx = Number(m[3]);
      if (keepMark(idx)) segs.push({ del: m[1], ins: m[2], n: idx });
      else segs.push({ text: m[1] });
      last = re.lastIndex;
    }
    if (last < raw.length) segs.push({ text: raw.slice(last) });
    return segs;
  });
}

function plainOf(paras, mode) {
  return paras.map((raw) =>
    raw.replace(/⟦([^|]+)\|([^|]+)\|\d+⟧/g, (_, a, b) => (mode === "fix" ? b : a)),
  );
}

/* ---------------- 生成报告 ---------------- */
function buildReport(name, q, level, variantKey) {
  const tpl = TEXTS[q.id][variantKey];
  const s = seed(name + q.id);
  const keepRate = KEEP_RATE[level];
  const marks = Object.keys(tpl.marks).map(Number).sort((a, b) => a - b);
  const keep = marks.filter((i, k) => (s + k * 17) % 100 < keepRate * 100 || name === "周泽同");
  const keepSet = new Set(keep);
  const corrections = marks
    .filter((i) => keepSet.has(i))
    .map((i) => {
      const raw = tpl.paras.find((p) => p.includes("|" + i + "⟧"));
      const m = raw.match(new RegExp("⟦([^|]+)\\|([^|]+)\\|" + i + "⟧"));
      return {
        n: i,
        from: m[1],
        to: m[2],
        type: tpl.marks[i].type,
        note: tpl.marks[i].note,
        tip: tpl.marks[i].tip,
      };
    });

  const isZhou = name === "周泽同";
  const rate = isZhou ? (q.id === "q1" ? 0.8 : 0.76) : LEVEL_RATE[level] + (((s % 9) - 4) / 100);
  const score = Math.max(1, Math.min(q.fullScore, Math.round(q.fullScore * rate)));
  const lv = score / q.fullScore >= 0.8 ? 4 : score / q.fullScore >= 0.6 ? 3 : score / q.fullScore >= 0.4 ? 2 : 1;
  const levelName = q.levelNames[lv];

  const words = plainOf(tpl.paras, "fix").join(" ").trim().split(/\s+/).filter(Boolean).length;
  const sentences = plainOf(tpl.paras, "fix")
    .join(" ")
    .split(/[.!?]+/)
    .filter((x) => x.trim()).length;

  const stars = Math.max(2, Math.min(5, Math.round((score / q.fullScore) * 5)));

  return {
    name,
    qid: q.id,
    score,
    levelName,
    tags: TAGS[q.id].slice(0, 4),
    stat: { words, sentences, paragraphs: tpl.paras.length, limit: q.limit, fullScore: q.fullScore },
    overview: OVERVIEW[q.id][level],
    dims: DIMS[q.id].map((d) => ({ name: d, stars: Math.max(2, Math.min(5, stars + (s % 3) - 1)), text: dimText(q.id, d, level) })),
    paras: parseParas(tpl.paras, (i) => keepSet.has(i)),
    plain: plainOf(tpl.paras, "orig"),
    fixed: plainOf(tpl.paras, "fix"),
    corrections,
    analysis: [
      { title: "语法错误", text: `共 ${corrections.length} 处错误，${corrections[0] ? corrections[0].type : "单复数错误"}最频繁，${level === "差" ? "基础句法问题集中" : "以机械性错误为主"}，建议按类整理错题本。` },
      { title: q.id === "q1" ? "句式结构" : "情节推进", text: q.id === "q1" ? "复杂句占比良好，定语从句与非谓语结构运用得当，可尝试强调句或倒装句进一步提升句式多样性。" : "第一段以动作链推进冲突解决，第二段落到情感回应，建议在转折处增加人物心理描写以强化张力。" },
      { title: "逻辑连贯", text: "使用 Then（顺序）、What's more / and（递进）、where（地点）等衔接词，可增加 however / therefore 等转折与结果词丰富逻辑层次。" },
    ],
    polish: {
      from: "This activity has revealed our students' positive attitude and gestures to life.",
      to: "The activity, far from being a mere record, has revealed the very attitude our students hold toward life — one of gratitude and warmth.",
      note: "把“记录活动”升格为“记录中的人生态度”，用插入语拉开节奏，结尾落到 gratitude 与 warmth 两个具象词，避免口号化。",
    },
  };
}

/* ---------------- 打包导出 ---------------- */
window.HW_ROSTER = [];
window.HW_REPORTS = {};

(function buildAll() {
  const order = ["q1", "q2"];
  const variants = { q1: ["A", "B", "C"], q2: ["A", "B"] };
  let idx = 0;
  ["优", "良", "差"].forEach((level) => {
    BANDS[level].forEach((name) => {
      const rec = { id: "s" + idx++, name, level, reports: {} };
      order.forEach((qid) => {
        const q = HW.questions.find((x) => x.id === qid);
        const vk = name === "周泽同" ? "A" : variants[qid][seed(name + qid) % variants[qid].length];
        const rep = buildReport(name, q, level, vk);
        rec.reports[qid] = rep;
        window.HW_REPORTS[name + "_" + qid] = rep;
      });
      rec.total = order.reduce((a, qid) => a + rec.reports[qid].score, 0);
      window.HW_ROSTER.push(rec);
    });
  });
})();

/* ---------------- 润色提升 · 5 模块（更多表达 / 逻辑提升 / 学生佳句 / 全文润色及对照表 / 提升建议） ---------------- */
/* 周泽同·应用文（q1）为线上真实内容，逐字复刻 */
const RICH_ZHOU_Q1 = {
  more: [
    { orig: "With the activity documenting perfect moment launched in our school", basicHtml: "With the activity <b>documenting perfect moments</b> launched in our school", basicNote: "（moment→moments，复数准确）", advHtml: "<b>Launched to capture campus beauty</b>, the activity <b>documenting perfect moments</b> began in our school.", advNote: "（分词状语，背景前置）" },
    { orig: "Then my camera turned to the playground, where my classmate showcase their outstanding talent", basicHtml: "Then my camera turned to the playground, where my <b>classmates showcased</b> their outstanding talent", basicNote: "（classmate→classmates，showcase→showcased）", advHtml: "<b>Shifting to the playground</b>, my camera captured classmates <b>showcasing</b> their outstanding talent.", advNote: "（分词状语，非谓语简化）" },
    { orig: "This activity has turned out our students' positive attitude and gesture to life", basicHtml: "This activity has <b>revealed</b> our students' positive attitude and <b>gestures</b> to life", basicNote: "（turn out→revealed，gesture→gestures）", advHtml: "This activity <b>has brought to light</b> our students' positive attitude and <b>gestures toward</b> life.", advNote: "（短语升级，介词优化）" },
    { orig: "which me a sense of beauty echoing my soul from our school", basicHtml: "which <b>brings</b> me a sense of beauty echoing my soul from our school", basicNote: "（添加 brings，谓语完整）", advHtml: "<b>endowing me with</b> a sense of beauty <b>that resonates with</b> my soul.", advNote: "（非谓语状语，定语从句升级）" },
    { orig: "I regain the enthusiasm of life and focus on wonderful moments in daily life", basicHtml: "I <b>regained</b> the enthusiasm <b>for</b> life and <b>now</b> focus on wonderful moments in daily life", basicNote: "（regain→regained，of→for，增 now）", advHtml: "<b>Having regained</b> my enthusiasm for life, I <b>now cherish</b> wonderful moments in daily life.", advNote: "（完成时分词，动词升级）" },
  ],
  logic: [
    { tag: "逻辑衔接词", orig: "Then my camera turned to the playground", improved: "Subsequently, my camera shifted to the playground", reason: "Then→Subsequently，衔接更正式" },
    { tag: "句意衔接", orig: "What's more, I have shot several moral behavior", improved: "Additionally, I captured several acts of moral behavior", reason: "What's more→Additionally，shot→captured 更准确" },
    { tag: "逻辑衔接词", orig: "What I have yielded is that I regain the enthusiasm", improved: "The key takeaway is that I have regained the enthusiasm", reason: "What I have yielded→The key takeaway，表达更地道" },
  ],
  best: [
    { group: "高级词汇", items: [{ html: "With the activity documenting perfect moment launched in our school, I am <b>more than delighted</b> to share my unique experience with you.", tag: "高级情感表达" }] },
    { group: "高级句式", items: [
      { html: "Then my camera turned to the playground, <b>where my classmate showcase their outstanding talent and the spirit of sports</b>.", tag: "where 引导定语从句修饰 playground" },
      { html: "What's more, I have shot several moral behavior, <b>ranging from pick up litter to helping disabled students</b>.", tag: "ranging from...to... 作伴随状语" },
    ] },
  ],
  full: {
    paras: [
      { cls: "salutation", text: "Dear Moss," },
      { cls: "body", text: "I am writing to share my experience of participating in our class vlog activity themed on documenting perfect moments on campus. Launched last month, this project aims to capture the beauty of school life through short videos." },
      { cls: "body", text: "My vlog begins with a tour of our school buildings, then shifts to the playground where classmates showcase their talents and sportsmanship. Additionally, I captured several acts of kindness, ranging from picking up litter to helping disabled students navigate the campus." },
      { cls: "body", text: "This activity has revealed our students' positive attitude and gestures toward life. Having regained my enthusiasm for life, I now cherish wonderful moments in daily life, which endows me with a sense of beauty that resonates with my soul." },
      { cls: "body", text: "I look forward to hearing about your school life too. Please reply soon!" },
      { cls: "closing", text: "Yours," },
      { cls: "closing", text: "Li Hua" },
    ],
    note: "（注：本次润色保留了你的核心观点，结构上做了优化调整）",
    compare: [
      { dim: "结构逻辑", status: "三段正文层次清晰，可补充称呼与结束语完成邮件格式。", direction: "范文补充 Dear Moss 与 Yours, Li Hua 形成完整邮件结构，段落衔接更流畅。" },
      { dim: "词汇层次", status: "使用 more than delighted / novel way 等高级表达，但存在拼写与搭配错误。", direction: "范文用 themed on / showcase / sportsmanship / endows...with 等准确高级词汇，修正搭配错误。" },
      { dim: "句式亮点", status: "运用定语从句 (where...) 与非谓语 (ranging from...)，但句 6 定语从句缺谓语。", direction: "范文保留定语从句与非谓语结构，修复 which 从句谓语缺失，增补 Having regained 分词状语。" },
      { dim: "内容深度", status: "vlog 内容与个人感受覆盖完整，但活动背景与期待回复表述不充分。", direction: "范文补充活动发起时间 (last month) 与目的 (aims to capture...)，增补 I look forward to... 完成礼节性收尾。" },
    ],
  },
  suggestions: [
    { cat: "语言", text: "强化名词单复数规则训练，尤其 several / their 等提示词后需用复数。" },
    { cat: "语言", text: "叙事文时态保持一致，过去活动用一般过去时，感悟用现在完成时或过去时。" },
    { cat: "结构", text: "邮件结尾添加期待回复表述如 I look forward to your reply 以完成礼节性收尾。" },
  ],
};

/* 衔接词升格映射（用于其余学生「逻辑提升」生成） */
const CONNECTOR_UP = [
  { re: /\bThen\b/g, to: "Subsequently", tag: "逻辑衔接词", why: "Then→Subsequently，衔接更正式" },
  { re: /\bWhat's more\b/g, to: "Additionally", tag: "句意衔接", why: "What's more→Additionally，递进更书面" },
  { re: /\bBesides\b/g, to: "Furthermore", tag: "句意衔接", why: "Besides→Furthermore，递进更正式" },
  { re: /\bAnd\b/g, to: "Moreover", tag: "逻辑衔接词", why: "And→Moreover，句首衔接更清晰" },
  { re: /\bSo\b/g, to: "Therefore", tag: "逻辑衔接词", why: "So→Therefore，因果关系更明确" },
];

function sentSplit(text) {
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

function buildRich(rep, q, level) {
  const fixedSents = sentSplit(rep.fixed.join(" "));
  /* 更多表达：取前 3 处纠错，定位其所在句 */
  const more = rep.corrections.slice(0, 3).map((c) => {
    const origSent = rep.plain.map(sentSplit).flat().find((s) => s.toLowerCase().includes(String(c.from).toLowerCase())) || rep.plain[0] || "";
    const fixSent = fixedSents.find((s) => s.toLowerCase().includes(String(c.to).toLowerCase())) || origSent;
    const basicHtml = fixSent.replace(new RegExp("(" + c.to.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "i"), "<b>$1</b>");
    return {
      orig: origSent,
      basicHtml,
      basicNote: `（${c.from}→${c.to}，${c.type}）`,
      advHtml: basicHtml,
      advNote: "（在纠错基础上优化句式，表达更地道）",
    };
  });
  /* 逻辑提升：命中衔接词映射 */
  const logic = [];
  for (const s of fixedSents) {
    for (const m of CONNECTOR_UP) {
      if (m.re.test(s)) {
        logic.push({ tag: m.tag, orig: s, improved: s.replace(m.re, m.to), reason: m.why });
        break;
      }
    }
    if (logic.length >= 3) break;
  }
  /* 学生佳句：挑含高级结构的句子 */
  const adv = fixedSents.filter((s) => /\b(where|which|that|who|ranging|having|although|because)\b/i.test(s)).slice(0, 2);
  const vocab = fixedSents.filter((s) => !adv.includes(s)).sort((a, b) => b.length - a.length).slice(0, 1);
  const best = [];
  if (vocab.length) best.push({ group: "高级词汇", items: vocab.map((s) => ({ html: s, tag: "用词准确、表达完整" })) });
  if (adv.length) best.push({ group: "高级句式", items: adv.map((s) => ({ html: s, tag: /where|which|that|who/i.test(s) ? "定语从句，句式紧凑" : "非谓语结构，表达凝练" })) });
  /* 全文润色：以订正后全文为范文 + 由维度生成对照表 */
  const full = {
    paras: rep.fixed.map((p, i) => ({ cls: "body", text: p })),
    note: "（注：本次润色保留了你的核心观点，仅在语法与衔接上做了优化调整）",
    compare: rep.dims.map((d) => ({
      dim: d.name,
      status: d.text,
      direction: `范文围绕「${d.name}」进一步优化，${d.stars >= 4 ? "保持亮点并提升表达精度" : "针对薄弱环节补强"}。`,
    })),
  };
  /* 提升建议：由详细分析转化 */
  const suggestions = rep.analysis.map((a) => ({ cat: /语法|句式|结构/.test(a.title) ? (a.title === "语法错误" ? "语言" : "结构") : "内容", text: a.text }));
  return { more, logic, best, full, suggestions };
}

(function enrichRich() {
  window.HW_ROSTER.forEach((rec) => {
    Object.keys(rec.reports).forEach((qid) => {
      const rep = rec.reports[qid];
      const q = HW.questions.find((x) => x.id === qid);
      const level = rec.level;
      rep.rich = rec.name === "周泽同" && qid === "q1" ? RICH_ZHOU_Q1 : buildRich(rep, q, level);
    });
  });
})();

/* ---------------- 详细分析 · 三环形图数据 ---------------- */
const RING_COLORS = ["#3B82F6", "#22C55E", "#A855F7", "#F59E0B", "#EF4444", "#14B8A6"];

function buildRings(rep) {
  /* 环 1 语法错误：按错误类型统计 */
  const byType = {};
  rep.corrections.forEach((c) => (byType[c.type] = (byType[c.type] || 0) + 1));
  const g1 = Object.keys(byType).map((k) => ({ name: k, value: byType[k] })).sort((a, b) => b.value - a.value);
  const grammar = g1.length ? g1 : [{ name: "无错误", value: 1 }];
  /* 环 2 句子结构：复杂句 vs 简单句 */
  const sents = rep.fixed.join(" ").split(/(?<=[.!?])\s+/).filter((s) => s.trim());
  const complex = sents.filter((s) => /\b(where|which|that|who|because|although|ranging|having|while|when)\b/i.test(s) || /,\s*\w+ing\b/.test(s)).length;
  const simple = Math.max(0, sents.length - complex);
  const structure = [{ name: "复杂句", value: complex }, { name: "简单句", value: simple }];
  /* 环 3 逻辑连贯：衔接词类型统计 */
  const joined = rep.fixed.join(" ").toLowerCase();
  const coh = [
    { name: "顺序", value: (joined.match(/\b(then|first|next|subsequently|finally)\b/g) || []).length },
    { name: "递进", value: (joined.match(/\b(what's more|besides|additionally|moreover|and)\b/g) || []).length },
    { name: "地点时间", value: (joined.match(/\b(where|when|while)\b/g) || []).length },
    { name: "转折因果", value: (joined.match(/\b(however|but|because|so|therefore)\b/g) || []).length },
  ].filter((x) => x.value > 0);
  const coherence = coh.length ? coh : [{ name: "衔接词", value: 1 }];
  return { grammar, structure, coherence };
}

(function enrichRings() {
  window.HW_ROSTER.forEach((rec) => {
    Object.keys(rec.reports).forEach((qid) => {
      rec.reports[qid].rings = buildRings(rec.reports[qid]);
    });
  });
})();

window.RING_COLORS = RING_COLORS;

/* 真实页面上 周泽同 应用文为 12 分 / 第四档，强制对齐 */
(function alignZhou() {
  const z = window.HW_ROSTER.find((s) => s.name === "周泽同");
  if (!z) return;
  z.reports.q1.score = 12;
  z.reports.q1.levelName = "第四档";
  z.total = z.reports.q1.score + z.reports.q2.score;
})();
