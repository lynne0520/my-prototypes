/* ============================================================
   讲评试卷 4.0 · 知识点图谱（三视图）
   来源：学科学情「知识点分析」树状图 / 力导向 / 放射 三视图整体迁移
   —— 学科知识体系（知识点树）、关联关系沿用原实现；
   —— 本次作业考查（exam）由下方 KPG_EXAM 映射到本页 knowledgeData，
      证据只分三态：本次考查 / 待诊断 / 未学，无证据节点灰显（未知 ≠ 未掌握）。
   ============================================================ */

(function () {
'use strict';

/* ================= 1. 学科知识体系（知识点树） ================= */
const KPG_SYSTEM = {
    kpTree: {
        id: 'root', name: '高中数学知识体系', mastery: 72, gradeMastery: 70, unmasteredCount: 45, level: 0,
        children: [
            {
                id: 'c1', name: '集合与逻辑', mastery: 85, gradeMastery: 80, unmasteredCount: 12, level: 1, children: [
                    {
                        id: 'c1-1', name: '集合运算', mastery: 92, gradeMastery: 88, unmasteredCount: 5, level: 2, children: [
                            { id: 'c1-1-1', name: '并集与交集', mastery: 95, gradeMastery: 92, unmasteredCount: 2, level: 3 },
                            { id: 'c1-1-2', name: '补集', mastery: 88, gradeMastery: 85, unmasteredCount: 3, level: 3 },
                            { id: 'c1-1-3', name: '子集与真子集', mastery: 90, gradeMastery: 87, unmasteredCount: 2, level: 3 }
                        ]
                    },
                    {
                        id: 'c1-1b', name: '集合的表示方法', mastery: 65, gradeMastery: 70, unmasteredCount: 15, level: 2, children: [
                            { id: 'c1-1b-1', name: '列举法与描述法转换', mastery: 45, gradeMastery: 50, unmasteredCount: 22, level: 3 }
                        ]
                    },
                    {
                        id: 'c1-2', name: '常用逻辑用语', mastery: 72, gradeMastery: 75, unmasteredCount: 18, level: 2, children: [
                            { id: 'c1-2-1', name: '充分与必要条件', mastery: 70, gradeMastery: 74, unmasteredCount: 9, level: 3 },
                            { id: 'c1-2-2', name: '全称与存在量词', mastery: 68, gradeMastery: 71, unmasteredCount: 8, level: 3 }
                        ]
                    }
                ]
            },
            {
                id: 'c2', name: '函数及其性质', mastery: 55, gradeMastery: 62, unmasteredCount: 36, level: 1, children: [
                    {
                        id: 'c2-1', name: '函数的概念', mastery: 58, gradeMastery: 60, unmasteredCount: 20, level: 2, children: [
                            { id: 'c2-1-1', name: '定义域值域', mastery: 62, gradeMastery: 65, unmasteredCount: 15, level: 3 },
                            { id: 'c2-1-2', name: '对应关系与解析式', mastery: 60, gradeMastery: 62, unmasteredCount: 12, level: 3 },
                            { id: 'c2-1-3', name: '分段函数', mastery: 55, gradeMastery: 58, unmasteredCount: 14, level: 3 }
                        ]
                    },
                    {
                        id: 'c2-2', name: '函数性质', mastery: 52, gradeMastery: 56, unmasteredCount: 24, level: 2, children: [
                            { id: 'c2-2-1', name: '单调性', mastery: 45, gradeMastery: 50, unmasteredCount: 21, level: 3 },
                            { id: 'c2-2-2', name: '奇偶性', mastery: 58, gradeMastery: 60, unmasteredCount: 12, level: 3 },
                            { id: 'c2-2-3', name: '最值', mastery: 50, gradeMastery: 54, unmasteredCount: 16, level: 3 }
                        ]
                    }
                ]
            },
            {
                id: 'c3', name: '指数函数与对数函数', mastery: 42, gradeMastery: 50, unmasteredCount: 40, level: 1, children: [
                    {
                        id: 'c3-1', name: '指数运算', mastery: 48, gradeMastery: 52, unmasteredCount: 20, level: 2, children: [
                            { id: 'c3-1-1', name: '指数幂运算', mastery: 50, gradeMastery: 55, unmasteredCount: 10, level: 3 },
                            { id: 'c3-1-2', name: '指数函数', mastery: 46, gradeMastery: 50, unmasteredCount: 12, level: 3 }
                        ]
                    },
                    {
                        id: 'c3-2', name: '对数运算', mastery: 40, gradeMastery: 48, unmasteredCount: 22, level: 2, children: [
                            { id: 'c3-2-1', name: '对数运算法则', mastery: 42, gradeMastery: 47, unmasteredCount: 11, level: 3 },
                            { id: 'c3-2-2', name: '对数函数', mastery: 38, gradeMastery: 44, unmasteredCount: 13, level: 3 },
                            { id: 'c3-2-3', name: '换底公式', mastery: 45, gradeMastery: 49, unmasteredCount: 9, level: 3 }
                        ]
                    }
                ]
            },
            {
                id: 'c4', name: '三角函数', mastery: 78, gradeMastery: 72, unmasteredCount: 10, level: 1, children: [
                    {
                        id: 'c4-1', name: '任意角与弧度制', mastery: 85, gradeMastery: 82, unmasteredCount: 4, level: 2, children: [
                            { id: 'c4-1-1', name: '角度与弧度互化', mastery: 88, gradeMastery: 85, unmasteredCount: 2, level: 3 },
                            { id: 'c4-1-2', name: '象限角判断', mastery: 82, gradeMastery: 79, unmasteredCount: 3, level: 3 }
                        ]
                    },
                    {
                        id: 'c4-2', name: '三角恒等变换', mastery: 72, gradeMastery: 70, unmasteredCount: 8, level: 2, children: [
                            { id: 'c4-2-1', name: '同角基本关系', mastery: 78, gradeMastery: 75, unmasteredCount: 4, level: 3 },
                            { id: 'c4-2-2', name: '诱导公式', mastery: 70, gradeMastery: 69, unmasteredCount: 6, level: 3 },
                            { id: 'c4-2-3', name: '和差角公式', mastery: 65, gradeMastery: 66, unmasteredCount: 8, level: 3 },
                            { id: 'c4-2-4', name: '二倍角公式', mastery: 68, gradeMastery: 67, unmasteredCount: 7, level: 3 }
                        ]
                    },
                    {
                        id: 'c4-3', name: '三角函数图像', mastery: 75, gradeMastery: 71, unmasteredCount: 6, level: 2, children: [
                            { id: 'c4-3-1', name: '正弦函数图像与性质', mastery: 78, gradeMastery: 74, unmasteredCount: 3, level: 3 },
                            { id: 'c4-3-2', name: '余弦函数图像与性质', mastery: 76, gradeMastery: 72, unmasteredCount: 3, level: 3 },
                            { id: 'c4-3-3', name: '正切函数图像与性质', mastery: 70, gradeMastery: 69, unmasteredCount: 5, level: 3 },
                            { id: 'c4-3-4', name: '图像变换', mastery: 72, gradeMastery: 70, unmasteredCount: 5, level: 3 }
                        ]
                    }
                ]
            },
            {
                id: 'c5', name: '平面向量', mastery: 74, gradeMastery: 71, unmasteredCount: 12, level: 1, children: [
                    {
                        id: 'c5-1', name: '向量的概念', mastery: 82, gradeMastery: 78, unmasteredCount: 4, level: 2, children: [
                            { id: 'c5-1-1', name: '向量的模', mastery: 85, gradeMastery: 81, unmasteredCount: 2, level: 3 },
                            { id: 'c5-1-2', name: '相等向量与共线向量', mastery: 80, gradeMastery: 76, unmasteredCount: 3, level: 3 },
                            { id: 'c5-1-3', name: '单位向量', mastery: 84, gradeMastery: 80, unmasteredCount: 2, level: 3 }
                        ]
                    },
                    {
                        id: 'c5-2', name: '向量的运算', mastery: 70, gradeMastery: 68, unmasteredCount: 8, level: 2, children: [
                            { id: 'c5-2-1', name: '向量加减法', mastery: 75, gradeMastery: 72, unmasteredCount: 4, level: 3 },
                            { id: 'c5-2-2', name: '数乘运算', mastery: 72, gradeMastery: 70, unmasteredCount: 5, level: 3 },
                            { id: 'c5-2-3', name: '数量积运算', mastery: 65, gradeMastery: 63, unmasteredCount: 7, level: 3 }
                        ]
                    },
                    {
                        id: 'c5-3', name: '向量的应用', mastery: 68, gradeMastery: 66, unmasteredCount: 7, level: 2, children: [
                            { id: 'c5-3-1', name: '向量法解几何', mastery: 66, gradeMastery: 64, unmasteredCount: 4, level: 3 },
                            { id: 'c5-3-2', name: '解三角形', mastery: 70, gradeMastery: 68, unmasteredCount: 5, level: 3 }
                        ]
                    }
                ]
            },
            {
                id: 'c6', name: '数列', mastery: 65, gradeMastery: 62, unmasteredCount: 16, level: 1, children: [
                    {
                        id: 'c6-1', name: '数列的概念', mastery: 72, gradeMastery: 70, unmasteredCount: 5, level: 2, children: [
                            { id: 'c6-1-1', name: '通项公式', mastery: 75, gradeMastery: 72, unmasteredCount: 3, level: 3 },
                            { id: 'c6-1-2', name: '递推关系', mastery: 68, gradeMastery: 66, unmasteredCount: 5, level: 3 }
                        ]
                    },
                    {
                        id: 'c6-2', name: '等差数列', mastery: 66, gradeMastery: 63, unmasteredCount: 8, level: 2, children: [
                            { id: 'c6-2-1', name: '等差数列通项与求和', mastery: 70, gradeMastery: 67, unmasteredCount: 4, level: 3 },
                            { id: 'c6-2-2', name: '等差数列性质应用', mastery: 62, gradeMastery: 60, unmasteredCount: 6, level: 3 }
                        ]
                    },
                    {
                        id: 'c6-3', name: '等比数列', mastery: 58, gradeMastery: 57, unmasteredCount: 10, level: 2, children: [
                            { id: 'c6-3-1', name: '等比数列通项与求和', mastery: 60, gradeMastery: 58, unmasteredCount: 6, level: 3 },
                            { id: 'c6-3-2', name: '等比数列性质应用', mastery: 56, gradeMastery: 55, unmasteredCount: 7, level: 3 }
                        ]
                    }
                ]
            },
            {
                id: 'c7', name: '不等式', mastery: 70, gradeMastery: 68, unmasteredCount: 14, level: 1, children: [
                    { id: 'c7-1', name: '不等式性质', mastery: 78, gradeMastery: 75, unmasteredCount: 5, level: 2 },
                    {
                        id: 'c7-2', name: '一元二次不等式', mastery: 72, gradeMastery: 70, unmasteredCount: 6, level: 2, children: [
                            { id: 'c7-2-1', name: '一元二次不等式解法', mastery: 74, gradeMastery: 72, unmasteredCount: 3, level: 3 },
                            { id: 'c7-2-2', name: '恒成立问题', mastery: 66, gradeMastery: 64, unmasteredCount: 6, level: 3 }
                        ]
                    },
                    {
                        id: 'c7-3', name: '基本不等式', mastery: 62, gradeMastery: 60, unmasteredCount: 8, level: 2, children: [
                            { id: 'c7-3-1', name: '均值不等式应用', mastery: 60, gradeMastery: 58, unmasteredCount: 7, level: 3 }
                        ]
                    }
                ]
            },
            {
                id: 'c8', name: '立体几何', mastery: 68, gradeMastery: 66, unmasteredCount: 15, level: 1, children: [
                    {
                        id: 'c8-1', name: '空间几何体', mastery: 75, gradeMastery: 72, unmasteredCount: 5, level: 2, children: [
                            { id: 'c8-1-1', name: '表面积与体积', mastery: 78, gradeMastery: 75, unmasteredCount: 3, level: 3 },
                            { id: 'c8-1-2', name: '三视图与直观图', mastery: 72, gradeMastery: 70, unmasteredCount: 5, level: 3 }
                        ]
                    },
                    {
                        id: 'c8-2', name: '位置关系', mastery: 65, gradeMastery: 63, unmasteredCount: 8, level: 2, children: [
                            { id: 'c8-2-1', name: '线面平行', mastery: 68, gradeMastery: 66, unmasteredCount: 4, level: 3 },
                            { id: 'c8-2-2', name: '线面垂直', mastery: 62, gradeMastery: 61, unmasteredCount: 6, level: 3 },
                            { id: 'c8-2-3', name: '面面平行与垂直', mastery: 60, gradeMastery: 59, unmasteredCount: 7, level: 3 }
                        ]
                    },
                    {
                        id: 'c8-3', name: '空间向量', mastery: 60, gradeMastery: 58, unmasteredCount: 8, level: 2, children: [
                            { id: 'c8-3-1', name: '空间向量运算', mastery: 58, gradeMastery: 57, unmasteredCount: 5, level: 3 },
                            { id: 'c8-3-2', name: '法向量求法', mastery: 61, gradeMastery: 59, unmasteredCount: 4, level: 3 }
                        ]
                    }
                ]
            },
            {
                id: 'c9', name: '解析几何', mastery: 63, gradeMastery: 61, unmasteredCount: 18, level: 1, children: [
                    {
                        id: 'c9-1', name: '直线与方程', mastery: 72, gradeMastery: 69, unmasteredCount: 6, level: 2, children: [
                            { id: 'c9-1-1', name: '斜率与倾斜角', mastery: 75, gradeMastery: 72, unmasteredCount: 3, level: 3 },
                            { id: 'c9-1-2', name: '直线方程', mastery: 70, gradeMastery: 68, unmasteredCount: 4, level: 3 },
                            { id: 'c9-1-3', name: '距离公式', mastery: 73, gradeMastery: 70, unmasteredCount: 3, level: 3 }
                        ]
                    },
                    {
                        id: 'c9-2', name: '圆与方程', mastery: 68, gradeMastery: 66, unmasteredCount: 6, level: 2, children: [
                            { id: 'c9-2-1', name: '圆的方程', mastery: 70, gradeMastery: 68, unmasteredCount: 3, level: 3 },
                            { id: 'c9-2-2', name: '直线与圆位置关系', mastery: 66, gradeMastery: 64, unmasteredCount: 5, level: 3 }
                        ]
                    },
                    {
                        id: 'c9-3', name: '圆锥曲线', mastery: 55, gradeMastery: 54, unmasteredCount: 12, level: 2, children: [
                            { id: 'c9-3-1', name: '椭圆', mastery: 60, gradeMastery: 58, unmasteredCount: 6, level: 3 },
                            { id: 'c9-3-2', name: '双曲线', mastery: 52, gradeMastery: 52, unmasteredCount: 8, level: 3 },
                            { id: 'c9-3-3', name: '抛物线', mastery: 56, gradeMastery: 55, unmasteredCount: 7, level: 3 }
                        ]
                    }
                ]
            },
            {
                id: 'c10', name: '概率统计', mastery: 73, gradeMastery: 70, unmasteredCount: 10, level: 1, children: [
                    {
                        id: 'c10-1', name: '统计', mastery: 76, gradeMastery: 73, unmasteredCount: 4, level: 2, children: [
                            { id: 'c10-1-1', name: '抽样方法', mastery: 80, gradeMastery: 77, unmasteredCount: 2, level: 3 },
                            { id: 'c10-1-2', name: '频率分布直方图', mastery: 74, gradeMastery: 71, unmasteredCount: 3, level: 3 },
                            { id: 'c10-1-3', name: '均值与方差', mastery: 72, gradeMastery: 70, unmasteredCount: 4, level: 3 }
                        ]
                    },
                    {
                        id: 'c10-2', name: '概率', mastery: 70, gradeMastery: 67, unmasteredCount: 6, level: 2, children: [
                            { id: 'c10-2-1', name: '排列组合', mastery: 62, gradeMastery: 61, unmasteredCount: 6, level: 3 },
                            { id: 'c10-2-2', name: '古典概型', mastery: 74, gradeMastery: 71, unmasteredCount: 3, level: 3 },
                            { id: 'c10-2-3', name: '事件关系与独立性', mastery: 66, gradeMastery: 64, unmasteredCount: 5, level: 3 }
                        ]
                    }
                ]
            },
            {
                id: 'c11', name: '导数及其应用', mastery: 58, gradeMastery: 56, unmasteredCount: 20, level: 1, children: [
                    {
                        id: 'c11-1', name: '导数概念', mastery: 64, gradeMastery: 62, unmasteredCount: 6, level: 2, children: [
                            { id: 'c11-1-1', name: '导数的定义', mastery: 66, gradeMastery: 64, unmasteredCount: 3, level: 3 },
                            { id: 'c11-1-2', name: '导数的几何意义', mastery: 62, gradeMastery: 60, unmasteredCount: 4, level: 3 }
                        ]
                    },
                    {
                        id: 'c11-2', name: '导数运算', mastery: 60, gradeMastery: 58, unmasteredCount: 8, level: 2, children: [
                            { id: 'c11-2-1', name: '基本初等函数导数', mastery: 63, gradeMastery: 61, unmasteredCount: 4, level: 3 },
                            { id: 'c11-2-2', name: '复合函数求导', mastery: 55, gradeMastery: 54, unmasteredCount: 6, level: 3 }
                        ]
                    },
                    {
                        id: 'c11-3', name: '导数应用', mastery: 52, gradeMastery: 51, unmasteredCount: 12, level: 2, children: [
                            { id: 'c11-3-1', name: '单调性与极值', mastery: 50, gradeMastery: 50, unmasteredCount: 8, level: 3 },
                            { id: 'c11-3-2', name: '最值问题', mastery: 54, gradeMastery: 52, unmasteredCount: 6, level: 3 },
                            { id: 'c11-3-3', name: '恒成立与零点', mastery: 48, gradeMastery: 49, unmasteredCount: 9, level: 3 }
                        ]
                    }
                ]
            }
        ]
    }
};

/* ================= 2. 知识点关联数据（前置 / 易混 / 题型 / 方法 / 易错点） ================= */
const KPG_RELATIONS = {
    /* —— 集合与逻辑 —— */
    '集合运算': { prerequisite: [], confusable: [], questionType: ['选择题', '填空题'], methods: ['Venn图法'], errorPoints: ['忽视空集的讨论'] },
    '集合的表示方法': { prerequisite: ['集合运算'], confusable: [], questionType: ['选择题', '填空题'], methods: ['列举法', '描述法'], errorPoints: ['描述法漏写代表元素'] },
    '列举法与描述法转换': { prerequisite: ['集合的表示方法'], confusable: [], questionType: ['填空题'], methods: ['列举法', '描述法'], errorPoints: ['描述法漏写代表元素'] },
    '并集与交集': { prerequisite: ['子集与真子集'], confusable: ['补集'], questionType: ['选择题', '填空题'], methods: ['Venn图法'], errorPoints: ['忽视空集的讨论'] },
    '补集': { prerequisite: ['并集与交集'], confusable: ['并集与交集'], questionType: ['选择题'], methods: ['Venn图法'], errorPoints: ['忽视空集的讨论'] },
    '子集与真子集': { prerequisite: [], questionType: ['选择题'], methods: ['Venn图法'], errorPoints: ['忽视空集的讨论'] },
    '常用逻辑用语': { prerequisite: ['集合运算'], questionType: ['选择题'] },
    '充分与必要条件': { prerequisite: ['常用逻辑用语'], confusable: ['全称与存在量词'], questionType: ['选择题'], errorPoints: ['混淆充分与必要方向'] },
    '全称与存在量词': { prerequisite: ['常用逻辑用语'], confusable: ['充分与必要条件'], questionType: ['选择题'] },

    /* —— 函数基础 —— */
    '函数的概念': { prerequisite: ['集合运算'], confusable: [], questionType: ['选择题', '填空题'], methods: ['转化与化归'] },
    '定义域值域': { prerequisite: ['函数的概念', '集合运算'], questionType: ['选择题', '填空题'], errorPoints: ['忽略定义域限制'] },
    '对应关系与解析式': { prerequisite: ['函数的概念'], questionType: ['填空题'], methods: ['待定系数法'] },
    '分段函数': { prerequisite: ['函数的概念', '对应关系与解析式'], questionType: ['选择题', '填空题'], methods: ['分类讨论'], errorPoints: ['分类讨论遗漏'] },
    '函数性质': { prerequisite: ['函数的概念'] },
    '单调性': { prerequisite: ['函数的概念'], questionType: ['选择题', '解答题'], methods: ['数形结合'], errorPoints: ['忽略定义域限制'] },
    '奇偶性': { prerequisite: ['函数的概念'], questionType: ['选择题', '填空题'], methods: ['数形结合'] },
    '最值': { prerequisite: ['单调性'], questionType: ['填空题', '解答题'], methods: ['数形结合', '分类讨论'], errorPoints: ['忽略定义域限制'] },

    /* —— 指数与对数 —— */
    '指数运算': { prerequisite: ['函数的概念'] },
    '指数幂运算': { prerequisite: [], questionType: ['选择题', '填空题'], errorPoints: ['运算符号错误'] },
    '指数函数': { prerequisite: ['函数的概念', '指数幂运算'], confusable: ['对数函数'], questionType: ['选择题', '填空题'], methods: ['数形结合'], errorPoints: ['忽略底数取值范围讨论'] },
    '对数运算': { prerequisite: ['指数运算'] },
    '对数运算法则': { prerequisite: ['指数幂运算'], questionType: ['选择题', '填空题'], errorPoints: ['运算符号错误'] },
    '对数函数': { prerequisite: ['函数的概念', '对数运算法则'], confusable: ['指数函数'], questionType: ['选择题', '填空题'], methods: ['数形结合'], errorPoints: ['忽略真数取值范围'] },
    '换底公式': { prerequisite: ['对数运算法则'], questionType: ['选择题'], errorPoints: ['运算符号错误'] },

    /* —— 三角函数 —— */
    '任意角与弧度制': { prerequisite: [] },
    '角度与弧度互化': { prerequisite: [], questionType: ['选择题', '填空题'], errorPoints: ['弧度与角度混用'] },
    '象限角判断': { prerequisite: ['角度与弧度互化'], questionType: ['选择题'], errorPoints: ['弧度与角度混用'] },
    '三角恒等变换': { prerequisite: ['任意角与弧度制'] },
    '同角基本关系': { prerequisite: ['象限角判断'], questionType: ['选择题', '填空题'], errorPoints: ['运算符号错误'] },
    '诱导公式': { prerequisite: ['同角基本关系'], questionType: ['选择题', '填空题'], methods: ['转化与化归'], errorPoints: ['运算符号错误'] },
    '和差角公式': { prerequisite: ['诱导公式'], questionType: ['选择题', '解答题'], methods: ['转化与化归'] },
    '二倍角公式': { prerequisite: ['和差角公式'], questionType: ['选择题', '填空题'], methods: ['转化与化归'] },
    '三角函数图像': { prerequisite: ['任意角与弧度制', '三角恒等变换'] },
    '正弦函数图像与性质': { prerequisite: ['同角基本关系'], questionType: ['选择题', '填空题'], methods: ['数形结合'] },
    '余弦函数图像与性质': { prerequisite: ['正弦函数图像与性质'], confusable: ['正弦函数图像与性质'], questionType: ['选择题', '填空题'], methods: ['数形结合'] },
    '正切函数图像与性质': { prerequisite: ['诱导公式'], confusable: ['正弦函数图像与性质'], questionType: ['选择题', '填空题'], methods: ['数形结合'], errorPoints: ['忽略定义域限制'] },
    '图像变换': { prerequisite: ['正弦函数图像与性质', '余弦函数图像与性质'], questionType: ['选择题', '填空题'], methods: ['数形结合'], errorPoints: ['图像平移方向记反'] },

    /* —— 平面向量 —— */
    '向量的概念': { prerequisite: [] },
    '向量的模': { prerequisite: [], questionType: ['选择题', '填空题'] },
    '相等向量与共线向量': { prerequisite: ['向量的模'], questionType: ['选择题'] },
    '单位向量': { prerequisite: ['向量的模'], questionType: ['选择题'] },
    '向量的运算': { prerequisite: ['向量的概念'] },
    '向量加减法': { prerequisite: ['相等向量与共线向量'], questionType: ['选择题', '填空题'], methods: ['数形结合'], errorPoints: ['运算符号错误'] },
    '数乘运算': { prerequisite: ['向量加减法'], questionType: ['选择题'], methods: ['数形结合'] },
    '数量积运算': { prerequisite: ['数乘运算', '同角基本关系'], questionType: ['选择题', '填空题'], methods: ['转化与化归'], errorPoints: ['夹角范围误判'] },
    '向量的应用': { prerequisite: ['向量的运算', '三角恒等变换'] },
    '向量法解几何': { prerequisite: ['数量积运算'], questionType: ['解答题', '证明题'], methods: ['坐标法', '转化与化归'] },
    '解三角形': { prerequisite: ['数量积运算', '正弦函数图像与性质'], questionType: ['解答题', '应用题'], methods: ['转化与化归'], errorPoints: ['分类讨论遗漏'] },

    /* —— 数列 —— */
    '数列的概念': { prerequisite: ['函数的概念'] },
    '通项公式': { prerequisite: ['函数的概念'], questionType: ['选择题', '填空题'], methods: ['归纳法'] },
    '递推关系': { prerequisite: ['通项公式'], questionType: ['选择题'], methods: ['归纳法', '构造法'] },
    '等差数列': { prerequisite: ['数列的概念'] },
    '等差数列通项与求和': { prerequisite: ['通项公式'], questionType: ['选择题', '解答题'], methods: ['转化与化归'] },
    '等差数列性质应用': { prerequisite: ['等差数列通项与求和'], questionType: ['选择题', '填空题'], errorPoints: ['忽略数列首项检验'] },
    '等比数列': { prerequisite: ['等差数列'] },
    '等比数列通项与求和': { prerequisite: ['等差数列通项与求和'], questionType: ['选择题', '解答题'], errorPoints: ['忽略公比为 1 的讨论'] },
    '等比数列性质应用': { prerequisite: ['等比数列通项与求和'], confusable: ['等差数列性质应用'], questionType: ['选择题', '填空题'], errorPoints: ['忽略公比为 1 的讨论'] },

    /* —— 不等式 —— */
    '不等式性质': { prerequisite: [], questionType: ['选择题'] },
    '一元二次不等式': { prerequisite: ['函数的概念'] },
    '一元二次不等式解法': { prerequisite: ['函数的概念'], questionType: ['选择题', '填空题'], methods: ['数形结合'], errorPoints: ['区间端点取舍错误'] },
    '恒成立问题': { prerequisite: ['一元二次不等式解法', '单调性'], questionType: ['选择题', '解答题'], methods: ['分类讨论', '构造法'], errorPoints: ['分类讨论遗漏'] },
    '基本不等式': { prerequisite: ['不等式性质'] },
    '均值不等式应用': { prerequisite: ['不等式性质'], questionType: ['选择题', '填空题', '解答题'], methods: ['转化与化归'], errorPoints: ['忽略取等条件'] },

    /* —— 立体几何 —— */
    '空间几何体': { prerequisite: [] },
    '三视图与直观图': { prerequisite: [], questionType: ['选择题', '填空题'], methods: ['数形结合'] },
    '表面积与体积': { prerequisite: ['三视图与直观图'], questionType: ['选择题', '填空题'] },
    '位置关系': { prerequisite: ['空间几何体'] },
    '线面平行': { prerequisite: ['三视图与直观图'], questionType: ['解答题', '证明题'], methods: ['转化与化归'] },
    '线面垂直': { prerequisite: ['线面平行'], questionType: ['解答题', '证明题'], methods: ['转化与化归'] },
    '面面平行与垂直': { prerequisite: ['线面垂直'], questionType: ['解答题', '证明题'], methods: ['转化与化归'] },
    '空间向量': { prerequisite: ['向量的运算', '位置关系'] },
    '空间向量运算': { prerequisite: ['数量积运算'], questionType: ['选择题', '填空题'] },
    '法向量求法': { prerequisite: ['空间向量运算', '线面垂直'], questionType: ['解答题'], methods: ['坐标法', '转化与化归'], errorPoints: ['运算符号错误'] },

    /* —— 解析几何 —— */
    '直线与方程': { prerequisite: ['三角函数图像'] },
    '斜率与倾斜角': { prerequisite: ['正切函数图像与性质'], questionType: ['选择题', '填空题'], errorPoints: ['忽略斜率不存在的情况'] },
    '直线方程': { prerequisite: ['斜率与倾斜角'], questionType: ['选择题', '填空题'], methods: ['待定系数法'], errorPoints: ['忽略斜率不存在的情况'] },
    '距离公式': { prerequisite: ['直线方程'], questionType: ['选择题', '填空题'], methods: ['坐标法'] },
    '圆与方程': { prerequisite: ['直线与方程'] },
    '圆的方程': { prerequisite: ['距离公式'], questionType: ['选择题', '填空题'], methods: ['待定系数法', '数形结合'] },
    '直线与圆位置关系': { prerequisite: ['圆的方程', '直线方程'], questionType: ['选择题', '填空题'], methods: ['数形结合', '坐标法'] },
    '圆锥曲线': { prerequisite: ['圆与方程'] },
    '椭圆': { prerequisite: ['距离公式'], questionType: ['选择题', '解答题'], methods: ['待定系数法', '坐标法'], errorPoints: ['焦点位置漏讨论'] },
    '双曲线': { prerequisite: ['椭圆'], confusable: ['椭圆'], questionType: ['选择题', '填空题'], errorPoints: ['焦点位置漏讨论'] },
    '抛物线': { prerequisite: ['椭圆'], confusable: ['双曲线'], questionType: ['选择题', '填空题'], errorPoints: ['焦点位置漏讨论'] },

    /* —— 概率统计 —— */
    '统计': { prerequisite: [] },
    '抽样方法': { prerequisite: [], questionType: ['选择题'] },
    '频率分布直方图': { prerequisite: ['抽样方法'], questionType: ['选择题', '解答题'], methods: ['数形结合'] },
    '均值与方差': { prerequisite: ['频率分布直方图'], questionType: ['选择题', '填空题'], errorPoints: ['运算符号错误'] },
    '概率': { prerequisite: ['统计'] },
    '排列组合': { prerequisite: [], questionType: ['选择题', '填空题'], methods: ['分类讨论'], errorPoints: ['分类讨论遗漏'] },
    '古典概型': { prerequisite: ['排列组合'], questionType: ['选择题', '填空题'], methods: ['分类讨论'] },
    '事件关系与独立性': { prerequisite: ['古典概型'], confusable: ['古典概型'], questionType: ['选择题'], errorPoints: ['混淆互斥与独立事件'] },

    /* —— 导数及其应用 —— */
    '导数概念': { prerequisite: ['函数的概念', '函数性质'] },
    '导数的定义': { prerequisite: ['函数的概念'], questionType: ['选择题'] },
    '导数的几何意义': { prerequisite: ['导数的定义'], questionType: ['选择题', '填空题'], methods: ['数形结合'] },
    '导数运算': { prerequisite: ['导数概念'] },
    '基本初等函数导数': { prerequisite: ['导数的定义'], questionType: ['选择题', '填空题'], errorPoints: ['运算符号错误'] },
    '复合函数求导': { prerequisite: ['基本初等函数导数'], questionType: ['选择题', '填空题'], methods: ['转化与化归'], errorPoints: ['链式求导漏层'] },
    '导数应用': { prerequisite: ['导数运算', '基本不等式'] },
    '单调性与极值': { prerequisite: ['导数的几何意义', '单调性'], questionType: ['解答题', '选择题'], methods: ['分类讨论', '数形结合'], errorPoints: ['极值判定条件遗漏'] },
    '最值问题': { prerequisite: ['单调性与极值', '最值'], questionType: ['解答题', '应用题'], methods: ['分类讨论'] },
    '恒成立与零点': { prerequisite: ['最值问题', '恒成立问题'], questionType: ['解答题', '选择题'], methods: ['构造法', '分类讨论', '数形结合'], errorPoints: ['分类讨论遗漏', '忽略定义域限制'] }
};

/* ================= 3. 证据例外表（待诊断 / 未学） ================= */
const KPG_EVIDENCE_EXCEPTIONS = {
    /* —— none：已学 · 本次暂无作答证据（未知 ≠ 未掌握） —— */
    '分段函数': { state: 'none' },
    '指数幂运算': { state: 'none' },
    '换底公式': { state: 'none' },
    '递推关系': { state: 'none' },
    '平面向量': { state: 'none' },
    '向量的概念': { state: 'none' }, '向量的模': { state: 'none' }, '相等向量与共线向量': { state: 'none' }, '单位向量': { state: 'none' },
    '向量的运算': { state: 'none' }, '向量加减法': { state: 'none' }, '数乘运算': { state: 'none' }, '数量积运算': { state: 'none' },
    '向量的应用': { state: 'none' }, '向量法解几何': { state: 'none' }, '解三角形': { state: 'none' },
    '立体几何': { state: 'none' },
    '空间几何体': { state: 'none' }, '表面积与体积': { state: 'none' }, '三视图与直观图': { state: 'none' },
    '位置关系': { state: 'none' }, '线面平行': { state: 'none' }, '线面垂直': { state: 'none' }, '面面平行与垂直': { state: 'none' },
    '统计': { state: 'none' }, '抽样方法': { state: 'none' }, '频率分布直方图': { state: 'none' }, '均值与方差': { state: 'none' },

    /* —— unlearned：未学 · 仅衔接（灰） —— */
    '空间向量': { state: 'unlearned' }, '空间向量运算': { state: 'unlearned' }, '法向量求法': { state: 'unlearned' },
    '圆锥曲线': { state: 'unlearned' }, '椭圆': { state: 'unlearned' }, '双曲线': { state: 'unlearned' }, '抛物线': { state: 'unlearned' },
    '导数及其应用': { state: 'unlearned' }, '导数概念': { state: 'unlearned' }, '导数的定义': { state: 'unlearned' },
    '导数的几何意义': { state: 'unlearned' }, '导数运算': { state: 'unlearned' }, '基本初等函数导数': { state: 'unlearned' },
    '复合函数求导': { state: 'unlearned' }, '导数应用': { state: 'unlearned' }, '单调性与极值': { state: 'unlearned' },
    '最值问题': { state: 'unlearned' }, '恒成立与零点': { state: 'unlearned' }
};

/* ================= 4. 视图引擎 ================= */
/* ============================================================
   知识点图谱 · 三视图引擎（迁移自学科学情「知识点分析」）
   树状图 / 力导向 / 放射 + 左侧模块目录 + 筛选工具栏 + 右侧详情面板
   ============================================================ */

/* ---------- 1. 本次作业考查映射（对齐讲评试卷 knowledgeData） ---------- */
// rate = 本次班级得分率；kpId = 明细表知识点 id（用于打开原有「关联诊断」抽屉）
const KPG_EXAM = {
    '集合与逻辑':         { rate: 85, kpId: '1',     questions: '1, 2' },
    '集合的表示方法':     { rate: 65, kpId: '1-1',   questions: '1' },
    '列举法与描述法转换': { rate: 45, kpId: '1-1-1', questions: '1' },
    '函数及其性质':       { rate: 72, kpId: '2',     questions: '3, 4, 12' },
    '单调性':             { rate: 88, kpId: '2-1',   questions: '3' },
    '奇偶性':             { rate: 58, kpId: '2-2',   questions: '4, 12' },
    '三角函数':           { rate: 40, kpId: '3',     questions: '7, 8, 15' }
};

/* ---------- 2. 关系类型 / 关联节点池 / 模块配色 ---------- */
const KPG_RELATION_DEFS = {
    prerequisite:   { name: '前置 / 后续知识', short: '前置', color: '#2468f2', lineType: 'solid',  width: 1.6, directed: true },
    confusable:     { name: '易混淆知识点',   short: '易混', color: '#fa8c16', lineType: 'dashed', width: 1.4, directed: false },
    questionType:   { name: '考查题型',       short: '题型', color: '#36b37e', lineType: 'dotted', width: 1.1, directed: true },
    method:         { name: '常用方法',       short: '方法', color: '#fa541c', lineType: 'dashed', width: 1.2, directed: true },
    errorPoint:     { name: '题型易错点',     short: '易错', color: '#f5222d', lineType: 'dashed', width: 1.2, directed: true },
    structure:      { name: '树状结构',       short: '结构', color: '#c0c4cc', lineType: 'solid',  width: 1,   directed: false }
};

const KPG_EXTRA_NODE_DEFS = {
    question: { kindLabel: '题型',   symbol: 'rect',      size: [32, 16], color: '#36b37e', rels: ['questionType'] },
    method:   { kindLabel: '方法',   symbol: 'diamond',   size: 16,       color: '#fa541c', rels: ['method'] },
    error:    { kindLabel: '易错点', symbol: 'triangle',  size: 14,       color: '#f5222d', rels: ['errorPoint'] }
};

const KPG_MODULE_COLORS = {
    '集合与逻辑': '#2468f2', '函数及其性质': '#9254de', '指数函数与对数函数': '#fa8c16', '三角函数': '#36b37e',
    '平面向量': '#fa541c', '数列': '#13c2c2', '不等式': '#36cfc9', '立体几何': '#40a9ff',
    '解析几何': '#eb2f96', '概率统计': '#a0d911', '导数及其应用': '#5a5cec'
};

/* ---------- 3. 状态 ---------- */
const kpgState = {
    view: 'tree',              // tree | force | radial
    depth: 3,                  // 展示深度 1/2/3
    labelMode: 'compact',      // all | compact | none
    onlyRelated: false,
    rels: { prerequisite: true, confusable: false, questionType: false, method: false, errorPoint: false, structure: true },
    modules: {},
    showAll: false,
    selected: null,
    inited: false
};

let kpgChart = null;
const kpgIndex = { byName: {}, list: [], followUps: {}, built: false };

const kpgEl = (id) => document.getElementById(id);
const kpgEsc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const kpgColor = (rate) => (typeof window.getMasteryColor === 'function' ? window.getMasteryColor(rate) : '#2468f2');

function kpgFlatten(node, excludeSelf) {
    const out = [];
    const walk = (n) => {
        if (!(excludeSelf && n.level === 0)) out.push(n);
        if (n.children) n.children.forEach(walk);
    };
    walk(node);
    return out;
}

function kpgMasteryOf(node) {
    return Math.min(100, Number(node.mastery) || 0);
}

// 证据三态：exam 本次作业考查 / none 待诊断 / unlearned 未学
function kpgEvOf(name) {
    const exam = KPG_EXAM[name];
    if (exam) return { state: 'exam', rate: exam.rate, kpId: exam.kpId, questions: exam.questions };
    const ex = KPG_EVIDENCE_EXCEPTIONS[name];
    if (ex) return { state: ex.state, rate: null };
    return { state: 'none', rate: null };
}

function kpgNoEv(ev) {
    return ev.state === 'none' || ev.state === 'unlearned';
}

// 一级模块的「已考 x/y」：分子 = 本次作业考查的知识点数
function kpgCoverageOf(moduleName) {
    const info = kpgIndex.byName[moduleName];
    const nodes = info ? kpgFlatten(info.node, true) : [];
    let exam = 0;
    nodes.forEach(n => { if (KPG_EXAM[n.name]) exam++; });
    return { exam, total: nodes.length };
}

// 本次薄弱（红环）：本次考查且得分率 < 60
function kpgIsFault(name) {
    const exam = KPG_EXAM[name];
    return !!exam && exam.rate < 60;
}

/* ---------- 4. 索引 ---------- */
function kpgBuildIndex() {
    if (kpgIndex.built) return;
    kpgIndex.built = true;
    const root = KPG_SYSTEM.kpTree;
    const walk = (n, parent, module, path) => {
        if (n.level > 0) {
            const mod = n.level === 1 ? n.name : module;
            kpgIndex.byName[n.name] = { node: n, parent: parent ? parent.name : null, module: mod, path: path.concat(n.name).join(' / '), level: n.level };
            kpgIndex.list.push(n);
        }
        (n.children || []).forEach(c => walk(c, n, n.level === 1 ? n.name : module, path.concat(n.level === 0 ? [] : n.name)));
    };
    walk(root, null, null, []);

    Object.keys(KPG_RELATIONS).forEach(name => {
        (KPG_RELATIONS[name].prerequisite || []).forEach(p => {
            if (!kpgIndex.byName[p]) return;
            (kpgIndex.followUps[p] = kpgIndex.followUps[p] || []).push(name);
        });
    });
}

// 一级 / 二级知识点详情面板：聚合子树关系，剔除模块内部自关联
function kpgAggEntry(name) {
    const node = kpgIndex.byName[name].node;
    const subtree = new Set(kpgFlatten(node, false).map(n => n.name));
    const acc = { prerequisite: {}, confusable: {}, questionType: {}, methods: {}, errorPoints: {}, followUps: {} };
    subtree.forEach(nm => {
        const e = KPG_RELATIONS[nm];
        if (!e) return;
        const addKp = (group, target) => {
            if (target === name || subtree.has(target)) return;
            (acc[group][target] = acc[group][target] || []).push(nm);
        };
        const addExtra = (group, target) => { (acc[group][target] = acc[group][target] || []).push(nm); };
        (e.prerequisite || []).forEach(p => addKp('prerequisite', p));
        (e.confusable || []).forEach(c => addKp('confusable', c));
        (e.questionType || []).forEach(q => addExtra('questionType', q));
        (e.methods || []).forEach(m => addExtra('methods', m));
        (e.errorPoints || []).forEach(er => addExtra('errorPoints', er));
    });
    Object.keys(KPG_RELATIONS).forEach(nm => {
        if (subtree.has(nm)) return;
        if ((KPG_RELATIONS[nm].prerequisite || []).some(p => subtree.has(p))) acc.followUps[nm] = ['前置'];
    });
    return acc;
}

function kpgEntryOf(name) {
    const direct = KPG_RELATIONS[name];
    if (direct) {
        const f = (arr) => { const o = {}; (arr || []).forEach(t => (o[t] = [name])); return o; };
        const fu = {}; (kpgIndex.followUps[name] || []).forEach(t => (fu[t] = [name]));
        return {
            prerequisite: f(direct.prerequisite), confusable: f(direct.confusable),
            questionType: f(direct.questionType), methods: f(direct.methods),
            errorPoints: f(direct.errorPoints), followUps: fu
        };
    }
    return kpgAggEntry(name);
}

/* ---------- 5. 构图 ---------- */
function kpgVisibleKpNodes() {
    return kpgIndex.list.filter(n => {
        const info = kpgIndex.byName[n.name];
        if (kpgState.modules[info.module] === false) return false;
        if (n.level > kpgState.depth) return false;
        if (!kpgState.showAll) {
            // 未勾选「查看全部知识点」时：只保留本次已考模块及其有证据节点（与树状图口径一致）
            if (kpgCoverageOf(info.module).exam === 0) return false;
            if (n.level >= 2 && kpgEvOf(n.name).state === 'none') return false;
        }
        return true;
    });
}

function kpgCollectEdges(kpSet) {
    const edges = [];
    const extras = {};
    const addExtra = (kpName, kind, relKey, target) => {
        if (!kpgState.rels[relKey]) return;
        // name 必须随节点一起存下：extras 的 key 只是索引，渲染节点与放射布局都依赖 x.name
        if (!extras[target]) extras[target] = { name: target, kind, refs: [] };
        if (!extras[target].refs.includes(kpName)) extras[target].refs.push(kpName);
        edges.push({ rel: relKey, source: kpName, target });
    };
    Object.keys(KPG_RELATIONS).forEach(name => {
        if (!kpSet[name]) return;
        const e = KPG_RELATIONS[name];
        (e.prerequisite || []).forEach(p => { if (kpSet[p] && kpgState.rels.prerequisite) edges.push({ rel: 'prerequisite', source: p, target: name }); });
        (e.confusable || []).forEach(c => { if (kpSet[c] && kpgState.rels.confusable) edges.push({ rel: 'confusable', source: name, target: c }); });
        (e.questionType || []).forEach(q => addExtra(name, 'question', 'questionType', q));
        (e.methods || []).forEach(m => addExtra(name, 'method', 'method', m));
        (e.errorPoints || []).forEach(er => addExtra(name, 'error', 'errorPoint', er));
    });
    return { edges, extras };
}

function kpgBuildGraph() {
    const visible = {};
    kpgVisibleKpNodes().forEach(n => { visible[n.name] = n; });

    let kpSet = visible;
    if (kpgState.onlyRelated) {
        const first = kpgCollectEdges(visible);
        const linked = new Set();
        first.edges.forEach(e => { linked.add(e.source); linked.add(e.target); });
        kpSet = {};
        Object.keys(visible).forEach(nm => { if (linked.has(nm)) kpSet[nm] = visible[nm]; });
    }

    const { edges, extras } = kpgCollectEdges(kpSet);

    if (kpgState.rels.structure) {
        Object.keys(kpSet).forEach(name => {
            const parent = kpgIndex.byName[name].parent;
            if (parent && kpSet[parent]) edges.push({ rel: 'structure', source: parent, target: name });
        });
    }
    return { kpSet, edges, extras };
}

/* ---------- 6. 放射布局 ---------- */
// 按节点相对圆心的方位决定标签朝向，避免整圈标签统一朝右互相压住
function kpgOutwardPos(x, y, cx, cy) {
    const deg = Math.atan2(cy - y, x - cx) * 180 / Math.PI;
    if (deg > 45 && deg <= 135) return 'top';
    if (deg > 135 || deg <= -135) return 'left';
    if (deg <= -45) return 'bottom';
    return 'right';
}

function kpgRadialPositions(nodes, kpSet, extras, dom) {
    const W = dom.clientWidth || 900, H = dom.clientHeight || 620;
    const cx = W / 2, cy = H / 2;
    // 画布普遍远宽于高：用椭圆半径而非正圆，避免左右留出大片空白
    const rx = W * 0.36, ry = H * 0.40;
    const radius = { 1: 0.30, 2: 0.62, 3: 0.92 };
    const at = (ang, k) => ({ x: cx + Math.cos(ang) * rx * k, y: cy + Math.sin(ang) * ry * k, angle: ang });
    const maxL = Math.max(1, ...Object.values(kpSet).map(n => n.level));

    const leavesOf = (n) => {
        let c = 0;
        const walk = (m) => { if (m.level === maxL) c++; (m.children || []).forEach(walk); };
        walk(n);
        return Math.max(c, 1);
    };
    const inSet = (n) => !!kpSet[n.name];

    const pos = {};
    const modules = (KPG_SYSTEM.kpTree.children || []).filter(inSet);
    const assign = (n, a0, a1) => {
        const mid = (a0 + a1) / 2;
        pos[n.name] = at(mid, radius[n.level] || 0.92);
        const kids = (n.children || []).filter(inSet);
        if (!kids.length) return;
        const tot = kids.reduce((s, k) => s + leavesOf(k), 0) || 1;
        let cur = a0;
        kids.forEach(k => { const sp = (leavesOf(k) / tot) * (a1 - a0); assign(k, cur, cur + sp); cur += sp; });
    };

    if (modules.length) {
        const totalLeaves = modules.reduce((s, m) => s + leavesOf(m), 0) || 1;
        let acc = -Math.PI / 2;
        modules.forEach(m => { const span = (leavesOf(m) / totalLeaves) * Math.PI * 2; assign(m, acc, acc + span); acc += span; });
    } else {
        const names = Object.keys(kpSet);
        names.forEach((nm, i) => {
            const ang = -Math.PI / 2 + (i / names.length) * Math.PI * 2;
            pos[nm] = at(ang, 0.6);
        });
    }

    nodes.forEach(nd => {
        if (!nd.kp || !pos[nd.name]) return;
        nd.x = pos[nd.name].x;
        nd.y = pos[nd.name].y;
        if (nd.label) nd.label.position = kpgOutwardPos(nd.x, nd.y, cx, cy);
    });

    const extraArr = Object.values(extras);
    if (extraArr.length) {
        extraArr.forEach(x => {
            // 圆周平均（向量和）：直接算术平均会在 ±π 边界两侧算出错误方位
            let sx = 0, sy = 0;
            x.refs.forEach(rn => {
                const a = pos[rn] && pos[rn].angle;
                if (a === undefined) return;
                sx += Math.cos(a); sy += Math.sin(a);
            });
            x.angle = (sx || sy) ? Math.atan2(sy, sx) : -Math.PI / 2;
        });
        extraArr.sort((a, b) => a.angle - b.angle);
        const first = extraArr[0].angle, last = extraArr[extraArr.length - 1].angle;
        const midA = (first + last) / 2;
        // 节点多时若只按引用方位占一小段弧，必然堆叠：此时铺满整圈
        const span = Math.max(Math.abs(last - first), Math.min(Math.PI * 2 * 0.97, extraArr.length * 0.42));
        extraArr.forEach((x, i) => {
            const t = extraArr.length === 1 ? 0.5 : i / (extraArr.length - 1);
            const ang = midA - span / 2 + span * t;
            const nd = nodes.find(n => n.extra && n.name === x.name);
            if (!nd) return;
            const p = at(ang, 1.08);
            nd.x = p.x;
            nd.y = p.y;
            // 标签朝外：外环节点密集时统一朝右会互相压住
            nd.label = nd.label || {};
            nd.label.position = kpgOutwardPos(nd.x, nd.y, cx, cy);
        });
    }
}

/* ---------- 6.5 力导向固定带 ---------- */
// 被大量知识点共享的题型节点：共享度越高越会被多条边拉向同一个质心，
// 必然叠在一起。这里把它们钉在画布下侧的带子上，避免压住知识点主体。
function kpgPinSharedNodes(nodes, dom) {
    const W = dom.clientWidth || 900, H = dom.clientHeight || 620;
    const band = (kind, y) => {
        const list = nodes.filter(n => n.extra && n.kind === kind && n.refCount >= 4);
        list.sort((a, b) => b.refCount - a.refCount);
        list.forEach((n, i) => {
            n.fixed = true;
            n.x = W * (0.18 + 0.64 * (list.length === 1 ? 0 : i / (list.length - 1)));
            n.y = y;
        });
        return list.length;
    };
    band('question', H - 62);
}

/* ---------- 7. 树状图 ---------- */
function kpgTreeData() {
    const root = KPG_SYSTEM.kpTree;
    const keepModule = (name) => kpgState.modules[name] !== false;
    const inScope = (n) => {
        if (n.level === 1) return kpgState.showAll || kpgCoverageOf(n.name).exam > 0;
        return kpgState.showAll || kpgEvOf(n.name).state !== 'none';
    };
    const process = (n) => {
        const ev = n.level === 0 ? null : kpgEvOf(n.name);
        const gray = !!ev && kpgNoEv(ev);
        const rate = ev && ev.rate != null ? ev.rate : kpgMasteryOf(n);
        const evState = ev ? ev.state : null;
        const item = {
            name: n.name,
            kp: n.level > 0,
            level: n.level,
            module: n.level > 0 ? kpgIndex.byName[n.name].module : '',
            evState: evState,
            kpId: ev && ev.kpId ? ev.kpId : null,
            value: gray ? null : Number(rate.toFixed(1)),
            itemStyle: {
                color: n.level === 0 ? '#909399' : (gray ? '#909399' : kpgColor(rate)),
                // 描边区分证据来源：蓝实线 = 本次考查，白描边 = 无本次证据
                borderColor: evState === 'exam' ? '#1a56db' : '#ffffff',
                borderWidth: 1.6
            },
            children: (n.children || []).filter(c => c.level > 1 ? (inScope(c) && keepModule(kpgIndex.byName[c.name].module)) : true).map(process)
        };
        if (gray) item.label = { color: '#909399' };
        return item;
    };
    const data = process(root);
    data.children = (root.children || []).filter(m => keepModule(m.name) && (kpgState.showAll || kpgCoverageOf(m.name).exam > 0)).map(process);
    return data;
}

function kpgCountLeaves(node) {
    return (node.children && node.children.length) ? node.children.reduce((s, c) => s + kpgCountLeaves(c), 0) : 1;
}

function kpgCountKpNodes(node, acc) {
    acc = acc || { nodes: 0, gray: 0 };
    if (node.kp) {
        acc.nodes++;
        if (node.evState === 'none' || node.evState === 'unlearned') acc.gray++;
    }
    (node.children || []).forEach(c => kpgCountKpNodes(c, acc));
    return acc;
}

function kpgRenderTree() {
    const dom = kpgEl('kpgChart');
    if (!dom) return;
    const data = kpgTreeData();
    const leaves = kpgCountLeaves(data);
    dom.style.height = Math.max(520, Math.ceil(leaves * 18)) + 'px';
    if (!kpgChart) kpgChart = echarts.init(dom);
    kpgChart.resize();

    kpgChart.setOption({
        tooltip: {
            confine: true,
            formatter: (p) => {
                const d = p.data || {};
                if (!d.kp) return `<b>${kpgEsc(d.name)}</b><br>学科知识体系根节点`;
                const ev = kpgEvOf(d.name);
                const head = `<b>${kpgEsc(d.name)}</b><br>${['', '一级', '二级', '三级'][d.level]}知识点 · ${kpgEsc(d.module)}<br>`;
                if (ev.state === 'exam') return head + `本次作业考查 · 班级得分率 <b>${ev.rate}%</b> · 题${ev.questions}`;
                if (ev.state === 'unlearned') return head + '教学进度未到 · 未检测';
                return head + '已学 · 暂无作答证据（未知 ≠ 未掌握）';
            }
        },
        series: [{
            type: 'tree',
            orient: 'LR',
            data: [data],
            left: '10%', right: '24%', top: '2%', bottom: '2%',
            symbolSize: 12,
            label: { position: 'left', align: 'right', verticalAlign: 'middle', fontSize: 12, distance: 8, color: '#3d434b' },
            leaves: { label: { position: 'right', align: 'left', verticalAlign: 'middle', distance: 8 } },
            lineStyle: { color: '#c0c4cc', width: 1.5, curveness: 0.5 },
            itemStyle: { borderWidth: 1.6 },
            initialTreeDepth: -1,
            expandAndCollapse: false,
            animationDuration: 400
        }]
    }, true);

    kpgChart.off('click');
    kpgChart.on('click', (params) => {
        const d = params.data || {};
        if (d.kp) kpgSelect(d.name);
    });

    kpgRenderStat(kpgCountKpNodes(data));
}

/* ---------- 8. 力导向 / 放射 ---------- */
function kpgRenderGraph() {
    const dom = kpgEl('kpgChart');
    if (!dom) return;
    if (typeof echarts === 'undefined') {
        dom.innerHTML = '<div class="kpg-empty">图谱组件加载失败（ECharts 未加载）</div>';
        return;
    }
    dom.style.height = '640px';
    if (!kpgChart) kpgChart = echarts.init(dom);
    kpgChart.resize();

    const { kpSet, edges, extras } = kpgBuildGraph();
    const kpCount = Object.keys(kpSet).length;
    const noEvCount = Object.values(kpSet).filter(n => kpgNoEv(kpgEvOf(n.name))).length;

    if (!kpCount) {
        kpgChart.clear();
        kpgChart.setOption({
            graphic: [{ type: 'text', left: 'center', top: 'middle', style: { text: '请至少选择一个知识模块或开启一类关系', fill: '#909399', fontSize: 13 } }]
        });
        kpgRenderStat({ nodes: 0, extras: 0, edges: 0, gray: 0 });
        kpgRenderDetail(null);
        return;
    }

    const nodes = [];
    Object.values(kpSet).forEach(n => {
        const info = kpgIndex.byName[n.name];
        const ev = kpgEvOf(n.name);
        const noEv = kpgNoEv(ev);
        const fault = kpgIsFault(n.name);
        const size = kpgState.view === 'radial' ? [0, 24, 13, 8][n.level] : [0, 28, 15, 9][n.level];
        nodes.push({
            name: n.name, kp: true, level: n.level, module: info.module, path: info.path,
            value: noEv || ev.rate == null ? null : Math.round(ev.rate * 10) / 10,
            fault, evState: ev.state, evSource: ev.source || null, noEv,
            symbol: 'circle', symbolSize: size,
            itemStyle: {
                color: noEv ? '#909399' : (fault ? '#f5222d' : (KPG_MODULE_COLORS[info.module] || '#2468f2')),
                opacity: noEv ? 0.55 : 1,
                borderColor: ev.state === 'exam' ? '#1a56db' : '#ffffff',
                borderWidth: fault ? 2.5 : (ev.state === 'exam' ? 2 : (n.level === 1 ? 2 : 1)),
                shadowColor: fault ? 'rgba(239, 68, 68, 0.5)' : 'transparent',
                shadowBlur: fault ? 12 : 0
            },
            label: {
                show: kpgState.labelMode === 'all' || (kpgState.labelMode === 'compact' && n.level <= 2),
                position: 'right', distance: 4,
                color: noEv ? '#909399' : (n.level === 1 ? '#303133' : '#494f57'),
                fontSize: n.level === 1 ? 11.5 : 10.5,
                fontWeight: n.level === 1 ? 700 : 500
            }
        });
    });
    Object.values(extras).forEach(x => {
        const def = KPG_EXTRA_NODE_DEFS[x.kind];
        nodes.push({
            name: x.name, extra: true, kind: x.kind, refCount: x.refs.length,
            symbol: def.symbol, symbolSize: def.size,
            // 白底 + 类型色描边：与知识点（实心圆、模块色）拉开层级，避免同色混淆
            itemStyle: { color: '#ffffff', borderColor: def.color, borderWidth: 1.8 },
            label: { show: kpgState.labelMode !== 'none', position: 'right', distance: 4, color: def.color, fontWeight: 600, fontSize: 10.5 }
        });
    });

    if (kpgState.view === 'radial') kpgRadialPositions(nodes, kpSet, extras, dom);
    else kpgPinSharedNodes(nodes, dom);

    const rateOf = (name) => { const ev = kpgEvOf(name); return ev.rate == null ? null : ev.rate; };

    const links = edges.map(e => {
        const def = KPG_RELATION_DEFS[e.rel];
        let broken = false;
        if (e.rel === 'prerequisite') {
            const tr = rateOf(e.target), sr = rateOf(e.source);
            broken = tr != null && sr != null && tr < 60 && sr < 70;
        }
        return {
            source: e.source, target: e.target, rel: e.rel, broken,
            lineStyle: {
                color: broken ? '#f5222d' : def.color,
                width: broken ? 2.5 : def.width,
                type: def.lineType,
                curveness: e.rel === 'structure' ? 0 : 0.18,
                opacity: broken ? 1 : (e.rel === 'structure' ? 0.55 : 0.85),
                shadowColor: broken ? 'rgba(239, 68, 68, 0.35)' : 'transparent',
                shadowBlur: broken ? 6 : 0
            }
        };
    });

    const series = {
        type: 'graph',
        roam: true,
        draggable: true,
        scaleLimit: { min: 0.25, max: 4 },
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: 6,
        // hideOverlap 会直接吞掉重叠标签（默认状态下会让大片节点变成无标注圆点），
        // 因此先让 ECharts 尝试移开（shiftY），实在不行才隐藏
        labelLayout: { hideOverlap: true, moveOverlap: 'shiftY' },
        emphasis: { focus: 'adjacency', scale: 1.15 },
        lineStyle: { curveness: 0.18 },
        data: nodes,
        links: links
    };
    if (kpgState.view === 'force') {
        series.layout = 'force';
        // 预留 12% 缓冲：力导向没有边界约束，收敛后外圈节点可能被斥力推出画布
        series.zoom = 0.9;
        series.force = { repulsion: 320, edgeLength: [45, 120], gravity: 0.18, friction: 0.25 };
    } else {
        series.layout = 'none';
    }

    kpgChart.setOption({
        tooltip: {
            confine: true,
            formatter: (p) => {
                if (p.dataType === 'edge') {
                    const d = KPG_RELATION_DEFS[p.data.rel];
                    const warn = p.data.broken ? '<br><span style="color:#f5222d;font-weight:700">⚠ 前置未牢固、后续已脱节，疑似学习断层</span>' : '';
                    return `<b>${d.name}</b><br>${kpgEsc(p.data.source)} → ${kpgEsc(p.data.target)}${warn}`;
                }
                const d = p.data;
                if (d.extra) return `<b>${kpgEsc(d.name)}</b><br>类型：${KPG_EXTRA_NODE_DEFS[d.kind].kindLabel}<br>被 ${d.refCount} 个知识点关联`;
                const ev = kpgEvOf(d.name);
                const head = `<b>${kpgEsc(d.name)}</b><br>${['', '一级', '二级', '三级'][d.level]}知识点 · ${kpgEsc(d.module)}<br>`;
                if (ev.state === 'exam') {
                    const faultTip = d.fault ? '<br><span style="color:#f5222d;font-weight:700">⚠ 本次薄弱（<60%），建议优先讲评</span>' : '';
                    return head + `本次作业考查 · 班级得分率：<b>${ev.rate}%</b> · 题${ev.questions}${faultTip}`;
                }
                if (ev.state === 'unlearned') return head + '<span style="color:#909399">教学进度未到 · 未检测</span>';
                return head + '<span style="color:#909399">已学 · 暂无作答证据（未知 ≠ 未掌握）</span>';
            }
        },
        series: [series]
    }, true);

    kpgChart.off('click');
    kpgChart.on('click', (params) => {
        const d = params.data || {};
        if (d.kp) kpgSelect(d.name);
    });

    kpgRenderStat({ nodes: kpCount, extras: Object.keys(extras).length, edges: edges.length, gray: noEvCount });
    if (kpgState.selected && kpSet[kpgState.selected]) kpgChart.dispatchAction({ type: 'highlight', seriesIndex: 0, name: kpgState.selected });
}

/* ---------- 9. 目录 / 工具栏 / 图例 / 统计 ---------- */
function kpgRenderModules() {
    const listEl = kpgEl('kpgModuleList');
    if (!listEl) return;
    const modules = KPG_SYSTEM.kpTree.children || [];
    const dirModules = kpgState.showAll ? modules : modules.filter(m => kpgCoverageOf(m.name).exam > 0);

    listEl.innerHTML = dirModules.map(m => {
        const on = kpgState.modules[m.name] !== false;
        const color = KPG_MODULE_COLORS[m.name] || '#2468f2';
        const cov = kpgCoverageOf(m.name);
        const zero = cov.exam === 0;
        const ev = kpgEvOf(m.name);
        const rate = ev.rate != null ? ev.rate : kpgMasteryOf(m);
        const scoreHtml = zero
            ? '<span class="kpg-mod-score kpg-mod-none" title="本次作业未涉及该模块（未知 ≠ 未掌握）">未检测</span>'
            : `<span class="kpg-mod-score" style="color:${kpgColor(rate)};background:${kpgColor(rate)}1a" title="模块掌握度（原型模拟）">${Math.round(rate)}%</span>`;
        return `<div class="kpg-module-item ${on ? '' : 'off'}${zero ? ' zero-coverage' : ''}" data-module="${kpgEsc(m.name)}" title="${kpgEsc(m.name)} · 本次已考 ${cov.exam}/${cov.total}">
            <i class="kpg-mod-dot" style="background:${color}"></i>
            <span class="kpg-mod-name">${kpgEsc(m.name)}</span>
            ${scoreHtml}
            <span class="kpg-mod-cov${zero ? ' zero' : ''}">已考${cov.exam}/${cov.total}</span>
        </div>`;
    }).join('');

    listEl.querySelectorAll('.kpg-module-item').forEach(item => {
        item.onclick = () => {
            const name = item.dataset.module;
            kpgState.modules[name] = kpgState.modules[name] === false;
            kpgRenderModules();
            kpgRender();
        };
    });

    const onCnt = dirModules.filter(m => kpgState.modules[m.name] !== false).length;
    const cntEl = kpgEl('kpgModuleCount');
    if (cntEl) cntEl.textContent = `${onCnt}/${dirModules.length}`;
}

function kpgRenderLegend() {
    const el = kpgEl('kpgLegend');
    if (!el) return;
    const evItems =
        '<span class="kpg-leg-item"><i class="kpg-leg-sw" style="background:#2468f2;border:2px solid #1a56db"></i>本次考查（蓝框）</span>' +
        '<span class="kpg-leg-item"><i class="kpg-leg-sw" style="background:#909399;opacity:.6"></i>待诊断 / 未学</span>' +
        '<span class="kpg-leg-item"><i class="kpg-leg-sw" style="background:#f5222d;box-shadow:0 0 0 3px rgba(239,68,68,.25)"></i>本次薄弱(&lt;60%)</span>' +
        `<span class="kpg-leg-item" style="color:#909399">填充 = ${kpgState.view === 'tree' ? '掌握度' : '模块色'}</span>`;
    const relItems = Object.keys(KPG_RELATION_DEFS).filter(k => k !== 'structure').map(k => {
        const d = KPG_RELATION_DEFS[k];
        return `<span class="kpg-leg-item" title="${kpgEsc(d.name)}"><i class="kpg-leg-line" style="border-color:${d.color};border-top-style:${d.lineType}"></i>${d.short}</span>`;
    }).join('');
    const kindItems = Object.keys(KPG_EXTRA_NODE_DEFS).map(k => {
        const d = KPG_EXTRA_NODE_DEFS[k];
        return `<span class="kpg-leg-item"><i class="kpg-leg-dot" style="background:${d.color}"></i>${d.kindLabel}</span>`;
    }).join('');
    el.innerHTML = evItems + '<span class="kpg-leg-sep"></span>' + relItems + '<span class="kpg-leg-sep"></span>' + kindItems +
        '<span class="kpg-leg-hint">箭头表示关联方向 · 滚轮缩放 · 拖拽平移 · 点击节点查看详情</span>';
}

function kpgRenderStat(o) {
    const el = kpgEl('kpgStat');
    if (!el) return;
    const isTree = kpgState.view === 'tree';
    if (isTree) {
        el.innerHTML = `知识点 <b>${o.nodes}</b> · 树状层级视图` +
            (o.gray ? `<span class="kpg-stat-gray">（含未检测 ${o.gray}）</span>` : '');
        return;
    }
    el.innerHTML = `知识点 <b>${o.nodes}</b> · 关联节点 <b>${o.extras || 0}</b> · 关联边 <b>${o.edges || 0}</b>` +
        (o.gray ? `<span class="kpg-stat-gray">（含未检测 ${o.gray}）</span>` : '');
}

/* ---------- 10. 详情面板 ---------- */
function kpgSelect(name) {
    kpgState.selected = name;
    kpgRenderDetail(name);
    if (!kpgChart) return;
    // 取消选中时必须显式 downplay：emphasis.focus=adjacency 的高亮是持久的，
    // 否则整张图会一直停留在「只亮相邻节点」的淡化态
    if (!name) {
        kpgChart.dispatchAction({ type: 'downplay', seriesIndex: 0 });
        return;
    }
    if (kpgIndex.byName[name] && kpgState.view !== 'tree') {
        kpgChart.dispatchAction({ type: 'downplay', seriesIndex: 0 });
        kpgChart.dispatchAction({ type: 'highlight', seriesIndex: 0, name });
    }
}

function kpgRenderDetail(name) {
    const panel = kpgEl('kpgDetail');
    if (!panel) return;
    if (!name || !kpgIndex.byName[name]) {
        panel.innerHTML = '<div class="kpg-detail-empty"><i>◎</i><p>点击图谱 / 树状图中的节点<br>查看知识点关联详情</p></div>';
        return;
    }

    const info = kpgIndex.byName[name];
    const n = info.node;
    const children = n.children || [];
    const descCount = kpgFlatten(n, false).length - 1;
    const ev = kpgEvOf(name);
    const noEv = kpgNoEv(ev);
    const rate = ev.rate != null ? ev.rate : kpgMasteryOf(n);
    const entry = kpgEntryOf(name);

    const GROUPS = [
        { key: 'prerequisite', title: '前置知识', color: KPG_RELATION_DEFS.prerequisite.color, kp: true },
        { key: 'followUps', title: '后续知识', color: KPG_RELATION_DEFS.prerequisite.color, kp: true },
        { key: 'confusable', title: '易混淆知识点', color: KPG_RELATION_DEFS.confusable.color, kp: true },
        { key: 'questionType', title: '考查题型', color: KPG_RELATION_DEFS.questionType.color, tag: '题型' },
        { key: 'methods', title: '常用方法', color: KPG_RELATION_DEFS.method.color, tag: '方法' },
        { key: 'errorPoints', title: '题型易错点', color: KPG_RELATION_DEFS.errorPoint.color, tag: '易错点' }
    ];

    const relRow = (target, tag, color, count, kRate, brokenRow) => `
        <div class="kpg-rel-row${brokenRow ? ' kpg-rel-broken' : ''}" data-target="${kpgEsc(target)}">
            <span class="kpg-rel-dot" style="background:${color}"></span>
            <span class="kpg-rel-name">${kpgEsc(target)}</span>
            <span class="kpg-rel-tag">${tag}</span>
            ${kRate != null ? `<span class="kpg-rel-mastery" style="color:${kpgColor(kRate)}" title="得分率">${kRate.toFixed(0)}%</span>` : ''}
            ${brokenRow ? '<span class="kpg-rel-break">断层</span>' : ''}
            ${count ? `<span class="kpg-rel-count">${count} 个知识点</span>` : ''}
        </div>`;

    let relHtml = '';
    let relTotal = 0;
    GROUPS.forEach(g => {
        const map = entry[g.key] || {};
        const keys = Object.keys(map);
        if (!keys.length) return;
        relTotal += keys.length;
        const shown = keys.slice(0, 8);
        relHtml += `<div class="kpg-rel-group">
            <div class="kpg-rel-title" style="color:${g.color}">${g.title} <span>${keys.length}</span></div>` +
            shown.map(k => {
                const tag = g.kp ? (kpgIndex.byName[k] ? ['一级', '二级', '三级'][kpgIndex.byName[k].level - 1] + '知识点' : '知识点') : g.tag;
                const kInfo = g.kp ? kpgIndex.byName[k] : null;
                const kEv = kInfo ? kpgEvOf(k) : null;
                const kRate = kEv && kEv.rate != null ? kEv.rate : (kInfo ? Math.round(kpgMasteryOf(kInfo.node)) : null);
                const brokenRow = g.key === 'prerequisite' && !noEv && rate != null && rate < 60 && kRate != null && kRate < 70;
                return relRow(k, tag, g.color, g.kp ? 0 : map[k].length, kRate, brokenRow);
            }).join('') +
            (keys.length > 8 ? `<div class="kpg-rel-more">… 及另外 ${keys.length - 8} 项</div>` : '') +
            '</div>';
    });

    const exam = KPG_EXAM[name];
    const evBadge = ev.state === 'exam'
        ? `<span class="kpg-ev-badge kpg-ev-exam">本次考查 · 题${exam.questions}</span>`
        : ev.state === 'unlearned'
            ? '<span class="kpg-ev-badge kpg-ev-unlearned">未学 · 仅衔接</span>'
            : '<span class="kpg-ev-badge kpg-ev-none">待诊断</span>';

    panel.innerHTML = `
        <div class="kpg-detail-head">
            <span class="kpg-detail-level">${['', '一级', '二级', '三级'][n.level]}知识点</span>
            ${noEv
                ? '<span class="kpg-detail-mastery" style="color:#909399" title="无作答证据（未知 ≠ 未掌握）">未检测</span>'
                : `<span class="kpg-detail-mastery" style="color:${kpgColor(rate)}">${Number(rate).toFixed(1)}%</span>`}
        </div>
        <h4 class="kpg-detail-title">${kpgEsc(name)}</h4>
        <div class="kpg-detail-path">${kpgEsc(info.path)}</div>
        <div class="kpg-detail-evid">${evBadge}${noEv ? '' : '<span class="kpg-detail-evid-src">本次班级得分率</span>'}</div>
        <div class="kpg-detail-stats">
            <span>关联<b>${relTotal}</b></span>
            <span>子节点<b>${children.length}</b></span>
            <span>子孙节点<b>${descCount}</b></span>
        </div>
        ${exam ? `<button type="button" class="kpg-detail-btn" id="kpgDiagBtn"><svg class="ic" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.7 9.3 9.3 6.7"/><path d="M5.4 7.6 4.1 8.9a2.6 2.6 0 0 0 3.7 3.7l1.3-1.3"/><path d="M10.6 8.4l1.3-1.3a2.6 2.6 0 0 0-3.7-3.7L6.9 4.7"/></svg> 关联诊断（前序 / 后续证据）</button>` : ''}
        ${exam && exam.rate < 60 ? `<button type="button" class="kpg-detail-btn kpg-detail-btn-warn" id="kpgDrillBtn"><svg class="ic" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg> 类题加练</button>` : ''}
        <div class="kpg-detail-scroll">
            ${relHtml || '<div class="kpg-detail-none">该知识点暂未维护关联关系</div>'}
        </div>`;

    panel.querySelectorAll('.kpg-rel-row').forEach(row => {
        row.onclick = () => {
            const t = row.dataset.target;
            if (kpgIndex.byName[t]) kpgSelect(t);
            else if (kpgChart && kpgState.view !== 'tree') {
                kpgChart.dispatchAction({ type: 'downplay', seriesIndex: 0 });
                kpgChart.dispatchAction({ type: 'highlight', seriesIndex: 0, name: t });
            }
        };
    });

    const diagBtn = kpgEl('kpgDiagBtn');
    if (diagBtn) diagBtn.onclick = () => { if (typeof openDiagModal === 'function') openDiagModal(exam.kpId); };
    const drillBtn = kpgEl('kpgDrillBtn');
    if (drillBtn) drillBtn.onclick = () => { if (typeof openDrillModal === 'function') openDrillModal(exam.kpId); };
}

/* ---------- 11. 渲染分发 ---------- */
function kpgTabActive() {
    const el = kpgEl('kp-graph-content');
    return !!el && el.classList.contains('active');
}

function kpgRender() {
    kpgRenderModules();
    kpgRenderLegend();
    document.querySelectorAll('#kpgToolbar .kpg-graph-only').forEach(el => {
        el.style.display = kpgState.view === 'tree' ? 'none' : '';
    });
    const chk = kpgEl('kpgOnlyRelated');
    if (chk && chk.checked !== kpgState.onlyRelated) chk.checked = kpgState.onlyRelated;
    if (!kpgTabActive()) return;
    if (typeof echarts === 'undefined') return;
    if (kpgState.view === 'tree') kpgRenderTree();
    else kpgRenderGraph();
}

function kpgSwitchView(view) {
    if (view === 'relation') view = 'force';
    if (!['tree', 'force', 'radial'].includes(view)) return;
    kpgState.view = view;
    [['kg-view-tree', 'tree'], ['kg-view-force', 'force'], ['kg-view-radial', 'radial']].forEach(([id, v]) => {
        const btn = kpgEl(id);
        if (!btn) return;
        btn.classList.toggle('active', v === view);
        btn.setAttribute('aria-selected', String(v === view));
    });
    kpgRender();
}

/* ---------- 12. 初始化 ---------- */
function kpgBindToolbar() {
    const bindChips = (groupId, handler) => {
        const group = kpgEl(groupId);
        if (!group) return;
        group.querySelectorAll('.kpg-chip').forEach(chip => {
            chip.onclick = () => {
                group.querySelectorAll('.kpg-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                handler(chip.dataset);
            };
        });
    };
    bindChips('kpgDepthGroup', (d) => { kpgState.depth = Number(d.depth); kpgRender(); });
    bindChips('kpgLabelGroup', (d) => { kpgState.labelMode = d.label; kpgRender(); });

    const relGroup = kpgEl('kpgRelationGroup');
    if (relGroup) {
        relGroup.querySelectorAll('.kpg-chip').forEach(chip => {
            chip.onclick = () => {
                const key = chip.dataset.rel;
                kpgState.rels[key] = !kpgState.rels[key];
                chip.classList.toggle('active', kpgState.rels[key]);
                kpgRender();
            };
        });
    }

    const chkOnly = kpgEl('kpgOnlyRelated');
    if (chkOnly) chkOnly.onchange = (e) => { kpgState.onlyRelated = e.target.checked; kpgRender(); };

    const showAll = kpgEl('kpgShowAll');
    if (showAll) showAll.onchange = (e) => { kpgState.showAll = e.target.checked; kpgRender(); };

    const fit = kpgEl('kpgFit');
    if (fit) fit.onclick = () => {
        if (!kpgChart) return;
        kpgChart.dispatchAction({ type: 'restore' });
        if (kpgState.view !== 'tree') kpgRender();
    };

    [['kg-view-tree', 'tree'], ['kg-view-force', 'force'], ['kg-view-radial', 'radial']].forEach(([id, v]) => {
        const btn = kpgEl(id);
        if (btn) btn.onclick = () => kpgSwitchView(v);
    });
}

function kpgInit() {
    if (kpgState.inited) return;
    if (!kpgEl('kp-graph-content')) return;
    kpgState.inited = true;
    kpgBuildIndex();
    (KPG_SYSTEM.kpTree.children || []).forEach(m => { kpgState.modules[m.name] = true; });
    kpgBindToolbar();
    kpgSwitchView('tree');
    kpgSelect(null);
}

function kpgActivate() {
    kpgInit();
    kpgRender();
    if (kpgChart) setTimeout(() => { kpgChart.resize(); }, 60);
}

function kpgResize() {
    if (kpgChart) kpgChart.resize();
}

window.KPGraph = {
    init: kpgInit,
    activate: kpgActivate,
    resize: kpgResize,
    render: kpgRender,
    switchView: kpgSwitchView,
    select: kpgSelect
};

/* ================= 5. 启动 ================= */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.KPGraph.init());
} else {
    setTimeout(() => window.KPGraph.init(), 0);
}
})();