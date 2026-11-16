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
                '| 使用对象 | 班主任：快速识别班级明确短板、相对短板学科，并确定每个学生先补哪一科 |',
                '| 使用时机 | 默认使用当天已批改完的作业做一次跨学科分诊；调整时间与作业范围后整表重算 |',
                '| 不用于 | 长期能力画像、学生排名与教师考核、单次考试总分比较；只有 1 份作业时班级标待确认、学生标暂定 |',
                '',
                '### 判弱规则总表',
                '',
                '下表全部读取当前教师为各学科保存的规则；括号内为未修改时的常规默认值，不再表示所有学科强制共用该数值。',
                '',
                '| 层级 | 判定规则 | 页面输出 |',
                '| --- | --- | --- |',
                '| 班级 · 数据闸门 | 该科未交率 > 本科未交率闸门（默认 30%） | 先抓提交，不判学科强弱 |',
                '| 班级 · 明确短板（班均差） | 班均未达本科达标线（默认 85%），且最近连续 N 次（默认 2 次）作业均未达该线并低于同卷学科组至少本科班级差距线（默认 5pp） | 明确短板 |',
                '| 班级 · 明确短板（低分面） | 得分率低于本科低分线（默认 60%）的学生占比达到本科低分面阈值（默认 30%） | 明确短板 |',
                '| 班级 · 证据待确认 | 达到明确短板条件但只有 1 份作业；或仅班均差通道命中且连续次数不足 N | 短板待确认 |',
                '| 班级 · 相对短板 | 班均未达本科达标线、低于学科组，但未达明确短板条件 | 相对短板 |',
                '| 学生 · 数据闸门 | 该生该科未交率超过本科闸门；或无有效成绩 | 先抓提交；待补数据 |',
                '| 学生 · 绝对低分 | 得分率低于本科低分线 | 重点提升 |',
                '| 学生 · 相对偏低 | 得分率未达本科达标线，且低于班均至少本科学生提醒线（默认 10pp） | 重点提升 |',
                '| 学生 · 无触发兜底 | 相对分 =（个人 − 班均）÷ 本科学生提醒线，取最小者 | 优先巩固 |',
                '| 学生 · 证据不足 | 只有 1 份有效作业 | 重点提升项标「临时关注」，优先巩固项标「暂定」 |',
                '',
                '**判定顺序**：数据闸门 ＞ 绝对低分 ＞ 未达本科达标线且相对差距过线 ＞ 相对最弱（兜底）。',
                '',
                '- **班级侧**：明确短板两条通道可并列，命中的学科全部列出；明确短板（含待确认）与相对短板也可同时出现。',
                '- **学生侧**：每人只保留一个主建议；多科同时触发时先取低分科，再分别按「距本科低分线 ÷ 本科提醒线」「低于班均 ÷ 本科提醒线」比较，避免不同学科阈值造成排序偏斜。',
                '- **满分区**：不单独豁免；低于本科低分线或达到本科相对判弱条件时照常触发。',
                '',
                '班级层只输出弱科判定结果（KPI「班级弱科」卡与学科统计表「班级判定」列），不输出教学组织方式或班级任务；学生层只给一个主建议，其余过线科目不升级成第二个主建议。'
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
                '| 显示 | 面板标题「跨学科分析诊断——班级名」，默认高三34班；切换高三35班后加载该班数据与弱科诊断，标题右侧为 XK-04 口径徽章与导出按钮，下方为报表主体 |',
                '| 交互 | 进入本视图时，单学科筛选条与「作业/考试」分段控件全部让位隐藏，改用跨学科分析专用筛选条 |',
                '| 缺省页 | 当前选中作业覆盖不足 3 个学科时，主区域显示「暂无法进行跨学科分析」、当前学科数、至少 3 科说明及设置按钮；导出禁用，不渲染 KPI、学科表与学生热力表 |',
                '| 视觉 | 品牌主色文字/图标 #0044FF；实心按钮/复选框填充 #004FFF |',
                '| 边界 | 演示数据覆盖高三34班（基准）、高三35班（弱科示例）与高三36班（缺省示例，仅语文、英语有作业）；其余班级不加载数据 |'
            ].join('\n')
        },
        {
            id: 'XK-02', group: 'XK', title: '跨学科分析筛选条（#filtersFocus）',
            body: [
                '**功能**：选择学年、年级、班级，并回显当前统计的时间、学科、作业范围。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 显示 | 三行：①学年下拉（默认「2026-2027学年」）+ 年级胶囊（高一/高二/高三，默认高三）；②班级链接（高三31~36班，默认34班，班级按钮只显示班级名，不加数据提示后缀）；③时间、作业与规则回显 +「调整时间与作业」按钮 |',
                '| 回显 | 回显四项——时间、学科（覆盖学科数）、作业（份数）、规则；规则无修改时显示「各科常规」，有修改时列出如「数学偏难」「语文自定义」 |',
                '| 交互 | 年级选非高三 → 提示「演示数据仅覆盖高三年级」；班级选31~33班 → 提示覆盖范围；34～36班可切换并重载各自学生、作业数据；学年切换 → 提示统计周期已切换 |',
                '| 规则 | 回显时间：起止同一天且为今天时显示「今天 2026-11-05」，否则显示「起 ~ 止」 |'
            ].join('\n')
        },
        {
            id: 'XK-03', group: 'XK', title: '时间、作业与判弱规则弹窗（#focusModal）',
            body: [
                '**功能**：统一设置统计时间、参与统计的作业和逐学科判弱规则；保存后整份报表按新范围与各学科实际规则重算，并记住当前教师的使用习惯。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 时间 | 预设：今天/近3天/近7天/近14天/近30天/自定义 + 起止日期；「近3天」= 今天向前推 2 天，起止颠倒时自动对调并落为「自定义」 |',
                '| 学科 Tab | 只列当前时间范围内有作业的学科；每科显示难度与已选作业数/总数。Tab 面板同时承载本科作业清单和规则，不同学科互不覆盖 |',
                '| 作业清单 | 每科含「全选/清空」与逐份勾选，每份标满分、已交/应交人数与批改率；勾选变化实时提示已选份数与覆盖学科数 |',
                '| 难度预设 | 常规 = 达标线 85% / 低分线 60%；偏难 = 75% / 50%；偏易 = 90% / 65%。切换难度只改这两条线，其余指标保留；手动改任一数值后标「自定义」 |',
                '| 核心指标 | 每科独立设置达标线、低分线、班级差距线、学生差距线、低分人数占比；高级设置含未交率闸门与连续确认次数 |',
                '| 恢复常规 | 将当前学科全部七项指标恢复为常规默认值：85%、60%、5pp、10pp、30%、30%、2 次，不影响其他学科 |',
                '| 教师持久化 | 点「保存并应用」后按当前教师账号写入 `xkFocusSubjectRules_v1:<账号>`；刷新后读取本账号规则，未修改学科回退常规默认，其他账号不读取该规则。存储失败时本次仍应用，但 toast 明确说明未持久保存 |',
                '| 取消与校验 | 点遮罩、取消或 Esc 只关闭弹窗，不保存草稿；数字为空、超出范围、低分线不低于达标线、确认次数非 1～5 整数时禁用保存并给出具体原因 |',
                '| 边界 | 至少保留一份作业，否则禁用保存；1～2 科允许保存并提示应用后显示缺省页；保存成功后关闭弹窗、内容区回顶并 toast 保存结果 |'
            ].join('\n')
        },
        {
            id: 'XK-04', group: 'XK', title: '统计口径与判定规则（#focusHintSlot）',
            body: [
                '**功能**：标题行提供 XK-04 徽章入口（不设小问号与 hover 气泡），点击打开本章集中说明全部计算口径与判定规则。本章为整份报表的计算依据。',
                '',
                '| 口径 | 计算方法 / 判定规则 |',
                '| --- | --- |',
                '| 学科得分率 | 该科所有作业「得分合计 ÷ 满分合计」，按满分加权（满分大的作业占比大）；缺交作业不计 0 分，也不进入分母 |',
                '| 低分判定（重要） | 「低分」指得分率低于当前学科低分线，不是原始分；常规默认低分线为 60%。满分不同的作业先折算到百分制再比较，页面与导出同步展示本次逐科低分线 |',
                '| 较学科组 | 班级得分率 − 同卷学科组得分率，单位 pp（个百分点）；正值高于学科组、负值低于学科组 |',
                '| 证据等级 | 按作业份数：≥3 份 = A（3 份以上）、2 份 = B、1 份 = C；C 级只给临时建议 |',
                '| 数据时效 | 全部作业落在当日或近 3 天才参与自动排序；超出近 3 天只作趋势复核，不参与排序 |',
                '| 满分区 | 某科学生得分率 P75 ≥95% 时标为满分区，不豁免判弱；热力色阶按本科学生提醒线分档，绝对低分仍照常进入个人建议 |',
                '| 班级判弱线 | 使用本科班级差距线（常规默认 5pp），只用于明确短板 / 相对短板判定与排序，不由学生提醒线派生 |',
                '| 班级明确短板 | 两条通道任一命中：①班均未达本科达标线，且最近连续 N 次作业均未达该线并比同卷学科组低至少本科班级差距线；②低于本科低分线的学生占比达到本科低分面阈值。两通道可并列；仅 1 份作业或班均差连续次数不足 N 时标「短板待确认」。未交率超过本科闸门先抓提交 |',
                '| 班级相对短板 | 班均未达本科达标线、低于学科组但未达明确短板条件时，按「低于学科组的量 ÷ 本科班级差距线」排序，在 KPI 与学科统计表中全部列出 |',
                '| 提升提醒线 | 使用本科学生差距线（常规默认 10pp）；仅当个人得分率未达本科达标线时用于相对判弱，同时作为本科热力色阶与跨科优先级归一化刻度 |',
                '| 学生重点提升 | 得分率低于本科低分线，或未达本科达标线且比班均低至少本科提醒线，任一即触发；多科过线时先比是否低分，再用本科提醒线归一化严重度取一科 |',
                '| 学生优先巩固 | 无重点提升项时必选一科：相对分 =（个人 − 班均）÷ 本科提醒线，取最小者；即使仍高于班均也只表示学习优先级，不等于薄弱学科 |',
                '| 展示分档与判弱解耦 | 优 ≥85%、良 ≥70% 且 <85% 固定用于展示；中 = 本科低分线至 <70%，低分 < 本科低分线。调整达标线不会改变「优」的固定展示线 |',
                '',
                '> 常规默认值均为尚无教研校准时的暂行保守阈值，不是统计定律；教师修改后以当前账号、当前学科保存值为准。标准差只作“学生分化”展示，不参与判定。',
                '>',
                '> 「明确短板」表示当前作业证据已达到设定阈值，属于阶段性学科表现判断，不代表班级或学生能力定型；「相对短板」的参照为同卷学科组。',
                '',
                '> 演示数据：各作业得分率由学科基准率对称拆分得出，为示意值，非真实观测。高三34班为常规基准班，高三35班在常规默认规则下为弱科示例班，高三36班为仅两科作业的缺省示例。'
            ].join('\n')
        },
        {
            id: 'XK-06', group: 'XK', title: 'KPI 概览卡片（.kpi-row）',
            body: [
                '**功能**：两张卡片分别回答「哪些学科需关注」「哪些学生需建议」，避免重复罗列同一批学科名单。',
                '',
                '| 卡片 | 内容 |',
                '| --- | --- |',
                '| 班级弱科 | 主值「x 科明确短板」（含待确认）；副行只列明确短板学科名（含待确认 n 科）与相对短板学科名；无明确短板但有相对短板时写「无明确短板科」，两类均无时写「本次未发现明确或相对短板」 |',
                '| 学生个人建议 | 主值「n 人重点提升 · m 人优先巩固」，不显示班级总人数；副行「优先巩固含 k 人各科都高于班均 ·（先抓提交 j 人）· 查看名单」；点卡片下钻到学生热力表并闪烁定位 |',
                '',
                '视觉：品牌卡边框 #BED3FF、底色 #EEF4FF、数值字 #0044FF。'
            ].join('\n')
        },
        {
            id: 'XK-07', group: 'XK', title: '一、班级各学科得分率与分布（.focus-section）',
            body: [
                '**功能**：条形图 + 学科统计表，展示各科班均得分率、较学科组、分化与等级分布。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 条形图 | 按班均得分率从低到高排；条长 = 班均得分率，竖线 = 学科组均，右端数字 = 较学科组 pp（个百分点） |',
                '| 统计表列 | 学科 · 作业份数 · 提交 · 未交率 · 班均得分率 · 学科组得分率 · 较学科组 · 可提升空间（100 − 班均）· 中位数 · 学生分化(σ，仅展示) · 最高 · 最低 · 优/良/中/低分四档 · 学生提醒线（逐科值）· 班级判定 |',
                '| 排序 | 明确短板学科（含待确认）置顶，其余按较学科组升序（越低于学科组越靠前） |',
                '| 等级分档（按得分率） | 优 ≥85% / 良 70%～<85% / 中 本科低分线～<70% / 低分 < 本科低分线；低分线常规默认 60%，可按学科调整 |',
                '| 班级判定列取值 | 明确短板（红）· 短板待确认（橙）· 相对短板（橙）· 正常（灰）；数据状态单独标：先抓提交、趋势复核；满分区标在学科名单元格，不占判定列 |',
                '',
                '视觉：条形渐变 #8FB4FF → #0044FF；学科组均刻度线 #9AA5B6；表头底 #F9FAFE、表格行线 #E1EBFF。'
            ].join('\n')
        },
        {
            id: 'XK-08', group: 'XK', title: '二、学生各科得分热力表（#focusStudentSection）',
            body: [
                '**功能**：逐生逐科展示离均差与得分率热力格，并为每人给出唯一一科个人建议学科。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 学科表头 | 首行学科名后跟（n 份），次行仅显示班均 xx.x%，不再重复作业份数；满分区仍统一标在表头；达标线/低分线/提醒线等口径放表头悬停提示 |',
                '| 单元格 | 上排 = 个人 − 班均（pp，即百分点），下排 = 个人得分率（%）；每科颜色按「偏离 ÷ 本科学生提醒线」分七档，σ 不参与色阶 |',
                '| 七档色阶 | 屏幕：红（远低于→偏低）底 #F8D2D4→#FDF1F1、字 #A2262C→#9D5B5F；灰蓝（接近班均）底 #F1F4F9 字 #5B6779；绿（偏高→远高）底 #EBF7F0→#B6E5CA、字 #2F7D54→#0D6B3F。黑白打印：自动换为亮度单调递增的七档底 #B9A6A6→#C8B6B6→#D7C6C6→#D4D9E2→#E3EDE5→#EEF5EF→#F9FCFA（越深 = 越低于班均），保留轻微暖/冷倾向供彩色打印辨认红绿，图例色块同步 |',
                '| 满分区 | P75 ≥95% 的科目在表头统一标「满分区」，格子内不再逐格打「近满分」角标，避免与颜色/低分冲突 |',
                '| 建议学科 | 列名「建议学科」（覆盖重点提升与优先巩固，不局限薄弱科）；单元格只显示学科名，建议原因移入单元格悬停提示：低于本科低分线（同时触发短板时附低于班均 xpp）、低于班均 xpp、个人相对靠后（附与班均差）；无推荐时显示—并在悬停说明先补交作业或暂无有效成绩；导出 CSV 仍保留「建议学科」「建议原因」两列 |',
                '| 该科得分率 | 主数字为个人得分率，下行显示该科班均，便于直接核对判弱原因 |',
                '| 建议类型标签 | 全量六类：重点提升（低分项红底，其余蓝底）、临时关注（重点提升仅 1 份作业，橙字）、优先巩固（底 #E1EBFF 字 #002EA3）、优先巩固·暂定（仅 1 份作业的优先巩固）、先抓提交（橙字）、待补数据（灰底）；单元格只显示标签，完整一句话建议移至标签悬停提示 |',
                '| 行排序 | 重点提升/临时关注置顶 → 优先巩固/优先巩固·暂定 → 先抓提交 → 其余按学号 |',
                '| 关注星标 | 姓名前一个小星星（内联 SVG）：未关注为灰色描边，点击点亮为琥珀色填充表示已关注，再点取消；关注态本地持久化（localStorage 键 xkFocusWatched_v1），切换时就地更新不整表重渲染；导出 CSV 首列「关注」已关注标★ |',
                '| 交互 | 「只看重点提升学生（n 人）」勾选过滤，覆盖重点提升与临时关注；表头与格子悬停显示口径提示；标题行右侧「导出本表」按钮（图标 + 文字、无边框幽灵样式）把本表单独导出为 CSV |',
                '',
                '> 优先巩固只表示个人各科学习优先级，即使该科仍高于班均也可作巩固方向；仅 1 份作业时，重点提升显示「临时关注」，优先巩固显示「优先巩固·暂定」，均不当作稳定结论。'
            ].join('\n')
        },
        {
            id: 'XK-09', group: 'XK', title: '三、作业列表（.focus-section）',
            body: [
                '**功能**：列出当前筛选内每份作业的明细，与学科层同源同口径。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 列 | 学科（同科多份标 1/2）· 作业名称 · 满分 · 提交 · 提交率（迷你条）· 平均分 · 得分率 · 学科组得分率 · 较学科组 · 扫描时间 |',
                '| 扫描时间 | 平台完成扫描并生成该份作业成绩的时间，仅展示、不参与判定；无时间返回时显示「—」，不得用已批改人数代替 |',
                '| 口径 | 同一学科多份作业并列、无主次，均按满分权重计入该科得分率；「较学科组」= 该作业得分率 − 该作业学科组得分率，与学科层同源，改筛选两侧同步重算 |',
                '| 汇总 | 头部注「共 n 份作业 · 合计提交 x/y（占比）」 |',
                '| 边界 | 无作业时显示空态「当前筛选下没有可展示的作业」 |'
            ].join('\n')
        },
        {
            id: 'XK-10', group: 'XK', title: '导出（#focusExport）',
            body: [
                '**功能**：标题行「导出」按钮打开格式选择弹窗，可选 PDF 文档或 Excel 表格，确认后按所选格式导出当前报表。',
                '',
                '| 项 | 内容 |',
                '| --- | --- |',
                '| 格式弹窗 | 两张单选卡片：PDF 文档（默认选中）/ Excel 表格，卡内仅显示格式名称（无图标、徽标与说明文字）；底部提示导出范围（时间 · 作业份数 · 学科数）；取消 / 确认导出，支持点遮罩与 Esc 关闭，记住上次选择 |',
                '| PDF（HTML 打印页） | 新窗口生成自包含 HTML 报表页：tokens/app 样式经 CSSOM 内联（读取受限时退回相对 link）；报表主体为当前 #focusRoot 快照并静态化（去 PRD 徽章、导出本表按钮、筛选勾选与下钻交互，关注星标转静态标记）；页头含班级、时间范围、作业/学科数、生成时间与口径说明 |',
                '| PDF 样式调整 | 外壳与打印规则集中在 <style id="export-style"> 块（注释标明调整区）；顶部工具栏提供「打印 / 保存为 PDF」（window.print）与「下载 HTML」（序列化整页离线保存）；默认 @page A4 横向、保留热力底色、工具栏不入打印 |',
                '| Excel 结构 | 首行口径说明按当前逐学科规则生成，含班级、时间、明确/相对短板清单及各科难度、达标线、低分线、班级/学生差距线；其后三块：①学科统计表（含可提升空间，末列为班级判定）②学生明细表（含一句话建议）③作业明细表 |',
                '| 规则快照 | 学科统计表前置导出每科难度、达标线、低分线、班级差距线、学生提醒线、低分面阈值、未交率闸门、连续确认次数，确保导出结果可复核 |',
                '| 文件名 | Excel：跨学科分析_班级_起[_止].csv；HTML：同名 .html（起止同天时省略「_止」） |',
                '| 交互 | Excel 导出后 toast「已导出 文件名」；PDF 生成后 toast 提示在新页面打印或下载；学生热力表「导出本表」仍单独导出 CSV，使用逐科色阶、低分线、达标线与提醒线口径 |',
                '| 边界 | 当前作业覆盖不足 3 个学科时导出按钮禁用，事件层再次拦截并提示；不导出缺省页；浏览器拦截弹窗时提示允许后重试 |',
                '',
                '> **原型与正式开发的差异**：原型中「PDF 文档」导出以生成自包含 HTML 打印页的方式演示（新窗口预览、浏览器打印另存 PDF、下载 HTML 二次调样式），HTML 仅为原型演示载体；正式开发时无需生成 HTML 中间产物，确认导出后直接生成 PDF 文件并触发浏览器下载，版式沿用本原型打印页规则（A4 横向、保留热力底色、宽表自适应缩放、工具栏不入打印），文件名为 跨学科分析_班级_起[_止].pdf。'
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
