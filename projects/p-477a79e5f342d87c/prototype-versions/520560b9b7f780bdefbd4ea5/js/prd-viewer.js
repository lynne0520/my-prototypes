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
    var PRD_STORAGE_KEY = 'xkFocusPrdOverrides_v1'; // localStorage key：带项目标识 + 版本后缀，避免跨项目串数据
    var PRD_APP_NAME = '跨学科分析表';               // 项目名：写入导出 Markdown 的文档标题「项目名 产品需求文档（PRD）」
    var PRD_HOME_SECTION = 'XK-00';               // 首次打开默认定位的章节 id（总览：对象场景 + 判弱规则）
    var PRD_EXPORT_NAME = '跨学科分析表PRD';               // 导出 Markdown 文件名前缀（最终 <前缀>-YYYYMMDD-HHmm.md）
    var PRD_DRAWER_MIN_W = 420;                    // 抽屉拖动最小宽度 px
    var PRD_DRAWER_MAX_W = 1200;                   // 抽屉拖动最大宽度 px（同时受 CSS max-width: 94vw 限制）
    var PRD_DRAWER_WIDTH_KEY = 'xkFocusPrdWidth_v1'; // 抽屉宽度本地记忆 key
    var PRD_FAB_POS_KEY = 'xkFocusPrdFabPos_v1';     // 悬浮按钮位置记忆 key
    // 有其他浮层打开时 Esc 让行：跨学科分析的时间与作业筛选弹窗
    function prdAnyOverlayOpen() {
        var m = document.getElementById('focusModal');
        return !!(m && m.style.display !== 'none');
    }

    /* ---------- 数据区：与 PRD.md 章节一一对应（同源维护，新增/删章三处同步） ---------- */
    var PRD_GROUPS = [
        { key: 'XK', name: '一、跨学科分析（当日诊断）' }
    ];

    // body 为 Markdown（唯一格式），由内置 prdMd() 渲染；与 PRD.md 章节同源
    var PRD_SECTIONS = [
        {
            id: 'XK-00', group: 'XK', title: '使用对象、场景与判弱规则（总览，无页面徽章）',
            body: [
                '**功能**：说明这份报表给谁用、什么时候用，以及班级与学生两套判弱规则。本章为总览，不对应页面徽章；具体数值口径见 XK-04。',
                '',
                '### 使用对象与场景',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 使用对象 | 班主任：快速识别班级绝对弱、相对弱学科，并确定每个学生先补哪一科 |',
                '| 使用时机 | 默认使用当天已批改完的作业做一次跨学科分诊；调整时间与作业范围后整表重算 |',
                '| 不用于 | 长期能力画像、学生排名与教师考核、单次考试总分比较；只有 1 份作业时班级标待确认、学生标暂定 |',
                '',
                '### 判弱规则总表',
                '',
                '| 层级 | 判定规则 | 页面输出 |',
                '| --- | --- | --- |',
                '| 班级 · 数据闸门 | 该科未交率 >30% | 先抓提交，不判学科强弱 |',
                '| 班级 · 绝对弱（班均差） | 班均未达 85%，且最近两次作业均低于同卷年级至少 5pp | 绝对弱 |',
                '| 班级 · 绝对弱（低分面） | 得分率 <60% 的学生占比 ≥30% | 绝对弱 |',
                '| 班级 · 证据待确认 | 达到绝对弱条件，但只有 1 份作业，或班均差只出现一次 | 绝对弱·待确认 |',
                '| 班级 · 相对弱 | 班均未达 85%、低于年级，但未达绝对弱条件 | 相对弱 |',
                '| 学生 · 数据闸门 | 该科未交率 >30%；或无有效成绩 | 先抓提交；待补数据 |',
                '| 学生 · 绝对低分 | 得分率 <60% | 重点提升 |',
                '| 学生 · 相对偏低 | 得分率 <85%，且低于班均至少 10pp | 重点提升 |',
                '| 学生 · 无触发兜底 | 相对分 =（个人 − 班均）÷10pp，取最小者 | 优先巩固 |',
                '| 学生 · 证据不足 | 只有 1 份有效作业 | 标「暂定」 |',
                '',
                '**判定顺序**：数据闸门 ＞ 绝对低分 ＞ 未达 85% 且低 10pp ＞ 相对最弱（兜底）。',
                '',
                '- **班级侧**：绝对弱两条通道可并列，命中的学科全部列出；绝对弱（含待确认）与相对弱也可同时出现。',
                '- **学生侧**：每人只保留一个主建议；多科同时触发时，先取低分科，低分科之间按「距 60% ÷ 10pp」、短板科之间按「低于班均 ÷ 10pp」比较。',
                '- **满分区**：不单独豁免；低分或低于班均 10pp 时照常触发学生判弱。',
                '',
                '班级与学生都使用固定阈值，但用途不同：班级 5pp、学生 10pp。班级层只输出弱科清单，不输出教学组织方式或班级任务；学生层只给一个主建议，其余过线科目不升级成第二个主建议。'
            ].join('\n')
        },
        {
            id: 'XK-01', group: 'XK', title: '跨学科分析视图入口与外壳（#panelFocus）',
            body: [
                '**功能**：班级报告左侧新增「跨学科分析」菜单，进入跨学科当日诊断视图。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 入口 | 班级报告左侧菜单第三项「跨学科分析」（学情统计 / 提交汇总 / 跨学科分析），默认进入本视图 |',
                '| 显示 | 面板标题「跨学科分析诊断——高三34班」，标题右侧为口径说明气泡与导出按钮，下方为报表主体 |',
                '| 交互 | 进入本视图时，单学科筛选条与「作业/考试」分段控件全部让位隐藏，改用跨学科分析专用筛选条 |',
                '| 视觉 | 品牌主色文字/图标 #0044FF；实心按钮/复选框填充 #004FFF |',
                '| 边界 | 演示数据仅覆盖高三34班 |'
            ].join('\n')
        },
        {
            id: 'XK-02', group: 'XK', title: '跨学科分析筛选条（#filtersFocus）',
            body: [
                '**功能**：选择学年、年级、班级，并回显当前统计的时间、学科、作业范围。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 显示 | 三行：①学年下拉（默认「2026-2027学年」）+ 年级胶囊（高一/高二/高三，默认高三）；②班级链接（高三31~34班，默认34班）；③时间与作业回显 +「调整时间与作业」按钮 |',
                '| 回显 | 只回显三项——时间、学科（覆盖学科数）、作业（份数）；明细在弹窗内调整 |',
                '| 交互 | 年级选非高三、班级选非34班 → 提示「演示数据仅覆盖高三34班」，不切换；学年切换 → 提示统计周期已切换 |',
                '| 规则 | 回显时间：起止同一天且为今天时显示「今天 2026-11-05」，否则显示「起 ~ 止」 |'
            ].join('\n')
        },
        {
            id: 'XK-03', group: 'XK', title: '时间与作业筛选弹窗（#focusModal）',
            body: [
                '**功能**：统一设置统计时间范围与参与统计的作业清单，应用后整份报表按新范围重算。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 显示 | 时间范围（预设：今天/近3天/近7天/近14天/近30天/自定义 + 起止日期）；作业清单按学科分组，每组含「全选/清空」与逐份勾选，每份标满分、已交/应交人数与批改率 |',
                '| 交互 | 点遮罩、取消或 Esc 关闭；起止日期颠倒时自动对调并落为「自定义」；勾选变化实时提示「已选 x/y 份作业 · 覆盖 n 个学科」 |',
                '| 规则 | 「近3天」= 今天向前推 2 天 |',
                '| 边界 | 至少保留一份作业，否则应用按钮禁用并红字提示「至少保留一份作业」；应用后关闭弹窗、内容区回到顶部并 toast 已应用范围 |'
            ].join('\n')
        },
        {
            id: 'XK-04', group: 'XK', title: '统计口径与判定规则（#focusHintSlot）',
            body: [
                '**功能**：标题行「?」气泡集中说明全部计算口径与判定规则，鼠标悬停或键盘聚焦展开。本章为整份报表的计算依据。',
                '',
                '| 口径 | 计算方法 / 判定规则 |',
                '| --- | --- |',
                '| 学科得分率 | 该科所有作业「得分合计 ÷ 满分合计」，按满分加权（满分大的作业占比大）；缺交作业不计 0 分，也不进入分母 |',
                '| 低分判定（重要） | 全文「低分 / <60」一律指**得分率低于 60%**，不是 60 分原始分：得分率 = 得分合计 ÷ 满分合计 × 100，满分不同的作业先折算到百分制再比。例：满分 20 分的作业，12 分以下（得分率 <60%）即低分；满分 100 分时 60 分以下才是低分 |',
                '| 较年级 | 班级得分率 − 同卷年级得分率，单位 pp（个百分点）；正值高于年级、负值低于年级 |',
                '| 证据等级 | 按作业份数：≥3 份 = A（3 份以上）、2 份 = B、1 份 = C；C 级只给临时建议 |',
                '| 数据时效 | 全部作业落在当日或近 3 天才参与自动排序；超出近 3 天只作趋势复核，不参与排序 |',
                '| 满分区 | 某科学生得分率 P75 ≥ 95% 时标为满分区，热力色阶仍统一为 10pp；因相对判弱要求本人未达 85%，高分小分差通常不会触发，但低于 60% 的学生仍照常进入个人建议 |',
                '| 班级判弱线 | 固定 5pp，只用于绝对弱 / 相对弱判定与排序，不再由学生提醒线派生 |',
                '| 班级绝对弱 | 两条通道任一命中即判绝对弱：①班均未达 85%，且最近两次作业都比同卷年级低 ≥5pp；②全班得分率 <60% 的学生占比 ≥30%。两通道可并列，命中的学科全部进入弱科清单，不再只取一科。只出现一次或仅 1 份作业时标「绝对弱·待确认」。某科未交率 >30% 先抓提交、不判强弱 |',
                '| 班级相对弱 | 班均未达 85%、低于年级但未达绝对弱条件时，按「低于年级的量 ÷ 5pp」排顺序，在弱科清单与诊断要点里全部列出，只呈现判定与差距 |',
                '| 提升提醒线 | 固定 10pp；仅当个人得分率未达 85% 时，才用于相对判弱 |',
                '| 学生重点提升 | 得分率 <60%，或个人得分率 <85% 且比班均低 ≥10pp，任一即触发；多科过线时先比是否低分，低分再按「距 60% ÷ 10pp」、短板按 −d÷10pp 降序取一科 |',
                '| 学生优先巩固 | 无重点提升项时必选一科：相对分 = (个人 − 班均) ÷ 10pp，取最小者；即使仍高于班均也只表示学习优先级，不等于薄弱学科。所有有效科都不低于班均时，KPI 会单独计数 |',
                '',
                '> 10pp / 5pp / 30% 均为尚无教研校准时的暂行保守阈值，不是统计定律，后续需用真实作业与教师人工判断回测校准。标准差只作“学生分化”展示，不参与判定。',
                '',
                '> 演示数据：各作业得分率由学科基准率对称拆分得出，为示意值，非真实观测。'
            ].join('\n')
        },
        {
            id: 'XK-05', group: 'XK', title: '班级弱科清单（.diag-decision）',
            body: [
                '**功能**：报表顶部按学科列出「哪些科绝对弱、哪些科相对弱」及逐科依据，只呈现判定结果与依据。',
                '',
                '| 状态 | 触发条件 |',
                '| --- | --- |',
                '| 绝对弱 x 科：A、B | 班均未达 85% 且连续两次低于年级 ≥5pp，或得分率 <60% 的学生占比 ≥30%；命中的学科全部列出，逐科附班均、低于年级 pp、是否连续同向、低分人数与占比、作业份数与时效 |',
                '| 绝对弱·待确认 | 满足上述差距或低分面条件，但只出现一次或仅 1 份作业；在学科名后注「待确认」，并写「连续证据尚未形成」 |',
                '| 相对弱 x 科 | 班均未达 85%、低于年级但未达绝对弱条件；按低于年级量 ÷5pp 排序，逐科注「比年级低 x 个百分点，未达绝对弱条件」 |',
                '| 本次没有绝对弱科目 | 无学科达到绝对弱条件；仍有相对弱时继续列出相对弱，两类都没有时写「六科均未达到绝对弱或相对弱条件」 |',
                '| 提交预警 | 有学科未交率 >30% 时追加一行：学科名与未交率，标「先抓提交，不判学科强弱」 |',
                '',
                '本模块只输出学科判定与证据，不输出教学组织方式或班级任务。'
            ].join('\n')
        },
        {
            id: 'XK-06', group: 'XK', title: 'KPI 概览卡片（.kpi-row）',
            body: [
                '**功能**：三张卡片概览班级弱科、学生个人建议、低于年级均学科数。',
                '',
                '| 卡片 | 内容 |',
                '| --- | --- |',
                '| 班级弱科 | 主值「x 科绝对弱」（含待确认）；副行列绝对弱学科名（含待确认 n 科）、相对弱学科名、六科平均较年级（只作整体水平参考，不参与判定）；无绝对弱时写「无绝对弱科」 |',
                '| 学生个人建议 | 覆盖重点提升与优先巩固：主值「x / 37 人」；副行「重点提升 n 人 · 优先巩固 m 人（含 k 人各科都高于班均）·（先抓提交 j 人）」；点卡片下钻到学生热力表并闪烁定位 |',
                '| 低于年级均学科 | 主值「x / y 科」；副行列出学科名并注「略低不等于弱科」，无则「全部高于年级均」 |',
                '',
                '视觉：品牌卡边框 #BED3FF、底色 #EEF4FF、数值字 #0044FF。'
            ].join('\n')
        },
        {
            id: 'XK-07', group: 'XK', title: '一、班级各学科得分率与分布（.focus-section）',
            body: [
                '**功能**：条形图 + 诊断要点 + 学科统计表，展示各科班均得分率、较年级、分化与等级分布。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 条形图 | 按班均得分率从低到高排；条长 = 班均得分率，竖线 = 年级均，右端数字 = 较年级 pp（个百分点） |',
                '| 统计表列 | 学科 · 作业份数 · 提交 · 未交率 · 班均得分率 · 年级得分率 · 较年级 · 可提升空间（100 − 班均）· 中位数 · 学生分化(σ，仅展示) · 最高 · 最低 · 优/良/中/低分四档 · 提醒线（固定 10pp）· 班级判定 |',
                '| 排序 | 绝对弱学科（含待确认）置顶，其余按较年级升序（越低于年级越靠前） |',
                '| 等级分档（按得分率） | 优 ≥85% / 良 70–84% / 中 60–69% / 低分 <60% |',
                '| 班级判定列取值 | 绝对弱（红）· 绝对弱·待确认（橙）· 相对弱（橙）· 正常（灰）；数据状态单独标：先抓提交、趋势复核；满分区标在学科名单元格，不占判定列 |',
                '| 诊断要点 | 编号列出：①绝对弱学科逐科列依据，没有则写「没有绝对弱科」；②相对弱学科逐科列出；③学生侧覆盖人数与短板集中科目；④提交预警；⑤满分区科目常规小分差不触发相对判弱，低分面过线时仍判绝对弱 |',
                '',
                '视觉：条形渐变 #8FB4FF → #0044FF；年级均刻度线 #9AA5B6；表头底 #F9FAFE、表格行线 #E1EBFF。'
            ].join('\n')
        },
        {
            id: 'XK-08', group: 'XK', title: '二、学生各科得分热力表（#focusStudentSection）',
            body: [
                '**功能**：逐生逐科展示离均差与得分率热力格，并为每人给出唯一一科个人补弱方向。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 单元格 | 上排 = 个人 − 班均（pp，即百分点），下排 = 个人得分率（%）；颜色统一按「偏离 ÷ 10pp」分七档，σ 不参与色阶 |',
                '| 七档色阶 | 红（远低于→偏低）底 #F8D2D4→#FDF1F1、字 #A2262C→#9D5B5F；灰蓝（接近班均）底 #F1F4F9 字 #5B6779；绿（偏高→远高）底 #EBF7F0→#B6E5CA、字 #2F7D54→#0D6B3F |',
                '| 满分区 | P75 ≥95% 的科目在表头统一标「满分区」，格子内不再逐格打「近满分」角标，避免与颜色/低分冲突 |',
                '| 个人补弱学科 | 重点提升（未达 85% 且低于班均 ≥10pp，或低分）或优先巩固（相对最弱），并注「低于/仍高于班均 xpp」 |',
                '| 建议类型标签 | 重点提升 底 #EEF4FF 字 #0044FF；优先巩固 底 #E1EBFF 字 #002EA3；临时关注/先抓提交 字 #E08A1E；待补数据 底 #EEF2F8 字 #9AA5B6 |',
                '| 一句话建议 | 标答下方小字按同一顺序生成：低分→得分率拉到 60%；短板→比班均低 x 个百分点、超提醒线 y 个百分点；仅相对→先巩固相对最弱；先抓提交→补交后再判；无数据→先交作业 |',
                '| 行排序 | 重点提升置顶 → 优先巩固 → 先抓提交 → 其余按学号 |',
                '| 交互 | 「只看重点提升学生（n 人）」勾选过滤；表头与格子悬停显示口径提示 |',
                '',
                '> 优先巩固只表示个人各科学习优先级，即使该科仍高于班均也可作巩固方向；仅 1 份作业时显示「暂定」。'
            ].join('\n')
        },
        {
            id: 'XK-09', group: 'XK', title: '三、作业列表（.focus-section）',
            body: [
                '**功能**：列出当前筛选内每份作业的明细，与学科层同源同口径。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 列 | 学科（同科多份标 1/2）· 作业名称 · 满分 · 提交 · 提交率（迷你条）· 平均分 · 得分率 · 年级得分率 · 较年级 · 批改时间 |',
                '| 口径 | 同一学科多份作业并列、无主次，均按满分权重计入该科得分率；「较年级」= 该作业得分率 − 该作业年级得分率，与学科层同源，改筛选两侧同步重算 |',
                '| 汇总 | 头部注「共 n 份作业 · 合计提交 x/y（占比）」 |',
                '| 边界 | 无作业时显示空态「当前筛选下没有可展示的作业」 |'
            ].join('\n')
        },
        {
            id: 'XK-10', group: 'XK', title: '导出（#focusExport）',
            body: [
                '**功能**：把当前报表导出为 CSV（Excel 可打开），首行附口径说明。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 结构 | 首行口径说明（照当前判定口径生成：班级 · 时间 · 绝对弱学科清单（含待确认）· 相对弱学科清单 · 绝对弱 = 班均 <85% 且连续两次低于年级 5pp，或低分学生占比 ≥30% · 相对弱 = 班均 <85% 且低于年级但未达绝对弱 · 学生提醒线：10pp 且本人得分率 <85% · 证据不足时标待确认），其后三块：①学科统计表（含可提升空间，末列为班级判定）②学生明细表（含一句话建议）③作业明细表 |',
                '| 文件名 | 跨学科分析_班级_起[_止].csv（起止同天时省略「_止」） |',
                '| 交互 | 点击导出并 toast「已导出 文件名」 |',
                '| 边界 | 未选任何作业时提示「未选择任何作业」，不导出 |'
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
        PRD_SECTIONS.forEach(function (s) {
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
