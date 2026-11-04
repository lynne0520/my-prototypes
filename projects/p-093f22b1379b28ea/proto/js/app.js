
/* ============================================================
   学科学情分析系统 - 逻辑层（合并版）
   功能来源：index.html(app.js) + 学科学情_独立版.html
   ============================================================ */

/* ---------------- Mock Data ---------------- */

// 知识体系树 / 能力体系树（三级层级）
const AppData = {
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
                        id: 'c1-2', name: '常用逻辑用语', mastery: 72, gradeMastery: 75, unmasteredCount: 18, level: 2, children: [
                            { id: 'c1-2-1', name: '充分与必要条件', mastery: 70, gradeMastery: 74, unmasteredCount: 9, level: 3 },
                            { id: 'c1-2-2', name: '全称与存在量词', mastery: 68, gradeMastery: 71, unmasteredCount: 8, level: 3 }
                        ]
                    }
                ]
            },
            {
                id: 'c2', name: '函数基础', mastery: 55, gradeMastery: 62, unmasteredCount: 36, level: 1, children: [
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
                id: 'c3', name: '指数与对数', mastery: 42, gradeMastery: 50, unmasteredCount: 40, level: 1, children: [
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
    },
    abilityTree: {
        id: 'root-a', name: '高中数学核心素养', mastery: 65, gradeMastery: 62, unmasteredCount: 28, level: 0,
        children: [
            {
                id: 'a1', name: '数学运算', mastery: 72, gradeMastery: 70, unmasteredCount: 10, level: 1, children: [
                    {
                        id: 'a1-1', name: '代数计算', mastery: 75, gradeMastery: 72, unmasteredCount: 4, level: 2, children: [
                            { id: 'a1-1-1', name: '整式加减', mastery: 90, gradeMastery: 85, unmasteredCount: 1, level: 3 },
                            { id: 'a1-1-2', name: '分式化简', mastery: 60, gradeMastery: 65, unmasteredCount: 3, level: 3 }
                        ]
                    },
                    { id: 'a1-2', name: '估值计算', mastery: 68, gradeMastery: 65, unmasteredCount: 6, level: 2 }
                ]
            },
            {
                id: 'a2', name: '逻辑推理', mastery: 48, gradeMastery: 55, unmasteredCount: 15, level: 1, children: [
                    { id: 'a2-1', name: '归纳推理', mastery: 50, gradeMastery: 52, unmasteredCount: 8, level: 2 },
                    { id: 'a2-2', name: '演绎推理', mastery: 45, gradeMastery: 58, unmasteredCount: 7, level: 2 }
                ]
            },
            { id: 'a3', name: '直观想象', mastery: 88, gradeMastery: 82, unmasteredCount: 3, level: 1 },
            { id: 'a4', name: '数学建模', mastery: 65, gradeMastery: 60, unmasteredCount: 5, level: 1 }
        ]
    }
};

// 知识点 -> 作业考试明细（type: exam 考试 / assignment 作业）
const mockKPRawData = {
    "集合与逻辑": [
        { name: "2025-26学年第一次月考", qno: "1、3、7", rate: 95, gradeRate: 90, type: 'exam' },
        { name: "高中数学必修一同步作业 (三)", qno: "2、5", rate: 90, gradeRate: 88, type: 'assignment' }
    ],
    "集合运算": [
        { name: "2025-26学年第一次月考", qno: "1、3", rate: 95, gradeRate: 90, type: 'exam' },
        { name: "高中数学必修一同步作业 (三)", qno: "2", rate: 90, gradeRate: 88, type: 'assignment' }
    ],
    "并集与交集": [
        { name: "2025-26学年第一次月考", qno: "1", rate: 98, gradeRate: 92, type: 'exam' }
    ],
    "补集": [
        { name: "2025-26学年第一次月考", qno: "7", rate: 85, gradeRate: 80, type: 'exam' }
    ],
    "常用逻辑用语": [
        { name: "十一月期中联考", qno: "4、9", rate: 72, gradeRate: 75, type: 'exam' }
    ],
    "函数基础": [
        { name: "十一月期中联考", qno: "12、15", rate: 55, gradeRate: 60, type: 'exam' },
        { name: "期末模拟冲刺卷 (一)", qno: "10", rate: 58, gradeRate: 62, type: 'exam' },
        { name: "高中数学必修一同步作业 (五)", qno: "3、6", rate: 62, gradeRate: 64, type: 'assignment' }
    ],
    "三角函数": [
        { name: "2025-26学年第一次月考", qno: "18、20", rate: 80, gradeRate: 74, type: 'exam' },
        { name: "高中数学必修一同步作业 (三)", qno: "8、11", rate: 76, gradeRate: 71, type: 'assignment' }
    ],
    "指数与对数": [
        { name: "十一月期中联考", qno: "13、16", rate: 42, gradeRate: 50, type: 'exam' },
        { name: "高中数学必修一同步作业 (七)", qno: "5", rate: 48, gradeRate: 53, type: 'assignment' }
    ]
};

// 能力 -> 作业考试明细
const mockAbilityRawData = {
    "数学运算": [
        { name: "2025-26学年第一次月考", qno: "2、6", rate: 72, gradeRate: 70, type: 'exam' },
        { name: "高中数学必修一同步作业 (三)", qno: "4", rate: 68, gradeRate: 66, type: 'assignment' }
    ],
    "逻辑推理": [
        { name: "十一月期中联考", qno: "14、19", rate: 48, gradeRate: 55, type: 'exam' },
        { name: "单元检测试卷", qno: "9", rate: 52, gradeRate: 57, type: 'exam' }
    ],
    "直观想象": [
        { name: "2025-26学年第一次月考", qno: "17", rate: 88, gradeRate: 82, type: 'exam' },
        { name: "高中数学必修一同步作业 (四)", qno: "7、10", rate: 84, gradeRate: 80, type: 'assignment' }
    ],
    "数学建模": [
        { name: "期末模拟冲刺卷 (一)", qno: "21", rate: 65, gradeRate: 60, type: 'exam' },
        { name: "高中数学必修一同步作业 (八)", qno: "6", rate: 60, gradeRate: 58, type: 'assignment' }
    ]
};

// 筛选列表（作业 / 考试）
const ModalData = {
    assignments: [
        { id: 'a1', name: '2025年09月09日数学作业', date: '2025-09-09', checked: true },
        { id: 'a2', name: '2025年09月08日数学作业', date: '2025-09-08', checked: true },
        { id: 'a3', name: '2025年09月07日数学作业', date: '2025-09-07', checked: true },
        { id: 'a4', name: '2025年09月06日数学作业', date: '2025-09-06', checked: true },
        { id: 'a5', name: '2025年09月05日数学作业', date: '2025-09-05', checked: true },
        { id: 'a6', name: '2025年09月04日数学作业', date: '2025-09-04', checked: true },
        { id: 'a7', name: '2025年09月03日数学作业', date: '2025-09-03', checked: true },
        { id: 'a8', name: '2025年09月02日数学作业', date: '2025-09-02', checked: true },
        { id: 'a9', name: '2025年09月01日数学作业', date: '2025-09-01', checked: true },
        { id: 'a10', name: '2025年08月31日数学作业', date: '2025-08-31', checked: true },
        { id: 'a11', name: '2025年08月30日数学作业', date: '2025-08-30', checked: true },
        { id: 'a12', name: '2025年08月29日数学作业', date: '2025-08-29', checked: true }
    ],
    exams: [
        { id: 'e1', name: '2025年09月期中调研考试', date: '2025-09-20', checked: true },
        { id: 'e2', name: '2025年09月第一次月考', date: '2025-09-28', checked: true },
        { id: 'e3', name: '2025年09月单元摸底卷', date: '2025-09-12', checked: true },
        { id: 'e4', name: '2026年1月统考', date: '2026-01-15', checked: true },
        { id: 'e5', name: '高一数学入园测试', date: '2025-09-01', checked: true },
        { id: 'e6', name: '高一数学第一次周练', date: '2025-09-05', checked: true },
        { id: 'e7', name: '高一数学第二次周练', date: '2025-09-12', checked: true },
        { id: 'e8', name: '高一数学第三次周练', date: '2025-09-19', checked: true },
        { id: 'e9', name: '高一数学第四次周练', date: '2025-09-26', checked: true },
        { id: 'e10', name: '九月名校联考(1)', date: '2025-09-22', checked: true },
        { id: 'e11', name: '九月名校联考(2)', date: '2025-09-23', checked: true },
        { id: 'e12', name: '九月名校联考(3)', date: '2025-09-24', checked: true }
    ]
};

// 年级 / 班级二级菜单
const gradeClassData = {
    '高一': ['全部班级', '1班', '2班'],
    '高二': ['全部班级', '1班', '2班'],
    '高三': ['全部班级', '1班']
};
const cascadeState = { grade: '高二', class: '1班' };   // 默认选中高二1班
let browseGrade = cascadeState.grade;                    // 面板中正在浏览的年级

// 教师任教学年（演示）：下拉只渲染学年标签；grade/cls 是该学年该班学生群体所在的年级班级，
// 仅用于按学年回查数据，页面不呈现（查询口径见 PRD XK-02）
const TEACHER_AUTH_YEARS = [
    { label: '2025-2026学年', grade: '高二', cls: '1班', current: true },
    { label: '2024-2025学年', grade: '高三', cls: '1班' },
    { label: '2023-2024学年', grade: '高一', cls: '2班' }
];

// 主模块轻量 toast（复用学生追踪的全局 #stToast 元素）
let mainToastTimer = null;
function mainToast(msg) {
    const t = document.getElementById('stToast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(mainToastTimer);
    mainToastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// 共性错题（带知识体系 / 维度 / 知识点 / 来源标签）
const mistakeData = [
    { id: "一、1", content: "已知集合 A = {x|x^2-3x+2=0}, B={x|1<x<3}, 则 A∩B = ?", classRate: 42, gradeRate: 45, system: 'sync', dimension: 'kp', kp: '集合与逻辑', source: '2025-26学年第一次月考' },
    { id: "二、4", content: "已知函数 f(x) = sin(wx + φ) 的部分图像如图所示，求 w 和 φ 的值。", classRate: 38, gradeRate: 40, system: 'sync', dimension: 'kp', kp: '三角函数', source: '高中数学必修一同步作业(三)' },
    { id: "三、5", content: "设 f(x) 是定义在 R 上的奇函数，当 x>0 时 f(x) = 2^x - 1，则 f(-1) = ?", classRate: 55, gradeRate: 58, system: 'sync', dimension: 'kp', kp: '函数基础', source: '单元检测试卷' },
    { id: "四、2", content: "在直角坐标系中，直线 l 过点 (1,2) 且与圆 x^2+y^2=5 相切，则 l 的方程为？", classRate: 32, gradeRate: 35, system: 'exam', dimension: 'kp', kp: '指数与对数', source: '高考模拟卷 A' }
];

const abilityMistakeData = [
    { id: "三、2", content: "利用导数证明不等式：ln(x+1) < x (x>0)。", classRate: 25, gradeRate: 30, system: 'sync', dimension: 'ability', kp: '逻辑推理', source: '同步作业(十二)' },
    { id: "四、1", content: "求四面体 ABCD 中点 E 到平面 BCD 的距离。", classRate: 52, gradeRate: 50, system: 'exam', dimension: 'ability', kp: '直观想象', source: '高考复习题册' }
];

// 知识点标签配色（错题筛选面板用）
const kpTagColors = {
    '集合与逻辑': '#3b82f6', '函数基础': '#ef4444', '指数与对数': '#f59e0b',
    '三角函数': '#10b981', '平面向量': '#f97316', '数列': '#8b5cf6',
    '不等式': '#14b8a6', '立体几何': '#06b6d4', '解析几何': '#ec4899',
    '概率统计': '#84cc16', '导数及其应用': '#6366f1',
    '数学运算': '#3b82f6', '逻辑推理': '#ef4444', '直观想象': '#10b981', '数学建模': '#f59e0b'
};

/* ---------------- 周期分析数据（整合自班级周期分析报告） ---------------- */

// 纳入统计的任务序列（时间正序，名称与学情来源 / 明细数据保持一致）
// chapter/score/submitted/weakKp 为任务清单演示字段：已交口径与顶部提交率（288/276）自洽，薄弱点取自 kpTree 真实薄弱项
const periodTasks = [
    { name: '第一次月考', full: '2025-26学年第一次月考', date: '2025-09-28', type: 'exam', classRate: 72.4, gradeRate: 70.2, chapter: '集合与逻辑', score: 100, submitted: 48, weakKp: '充分与必要条件' },
    { name: '同步作业(三)', full: '高中数学必修一同步作业 (三)', date: '2025-10-09', type: 'assignment', classRate: 68.1, gradeRate: 66.8, chapter: '函数基础', score: 50, submitted: 46, weakKp: '函数的概念' },
    { name: '同步作业(五)', full: '高中数学必修一同步作业 (五)', date: '2025-10-16', type: 'assignment', classRate: 74.6, gradeRate: 72.1, chapter: '指数与对数', score: 50, submitted: 48, weakKp: '指数幂运算' },
    { name: '期中联考', full: '十一月期中联考', date: '2025-11-13', type: 'exam', classRate: 63.4, gradeRate: 65.9, chapter: '函数基础', score: 100, submitted: 44, weakKp: '函数性质' },
    { name: '同步作业(七)', full: '高中数学必修一同步作业 (七)', date: '2025-11-20', type: 'assignment', classRate: 71.3, gradeRate: 69.8, chapter: '指数与对数', score: 50, submitted: 45, weakKp: '指数函数' },
    { name: '冲刺卷(一)', full: '期末模拟冲刺卷 (一)', date: '2025-12-11', type: 'exam', classRate: 76.8, gradeRate: 75.4, chapter: '综合测试', score: 100, submitted: 45, weakKp: '指数函数' }
];
const prevPeriodRate = 69.8;   // 上一周期基准（班级口径）
const prevPeriodGradeRate = 69.1;   // 上一周期年级平均得分率基准（年级口径，卡6 环比用）

// 错因体系（配色 + 教学建议文案，幅度数字由数据动态计算）
const CAUSE_DEFS = [
    { name: '计算失误', color: '#ef4444', advice: { up: '占比持续上升，建议用「限时 10 分钟 3 题」高频短训替代整卷练习', down: '计算准确率改善，继续保持解题步骤规范化要求' } },
    { name: '概念混淆', color: '#f59e0b', advice: { up: '相近概念辨析不清，建议采用成对对比式讲解', down: '概念辨析讲评见效，可维持当前教学节奏' } },
    { name: '审题不清', color: '#f97316', advice: { up: '漏读条件增多，建议强化「圈画关键词」审题训练', down: '审题习惯培养见效，错误占比稳步下降' } },
    { name: '方法选择', color: '#8b5cf6', advice: { up: '题型与方法匹配困难，建议按题型归纳解题决策路径', down: '方法选择趋于合理，可进入综合题型训练' } },
    { name: '书写规范', color: '#3b82f6', advice: { up: '步骤书写失分增加，建议展示标准答卷范例', down: '书写规范保持良好，基本稳定' } },
    { name: '未作答', color: '#94a3b8', advice: { up: '空白题增多，集中在卷末压轴题，属答题时间分配问题', down: '作答完成度改善，继续保持' } }
];

// 错因配色兜底：错因种类随学科/题目动态扩展（CAUSE_DEFS 仅为当前演示集），未预置颜色的错因按色板循环取色；
// 引用处一律走 causeColorOf，不直接读 def.color，保证任意错因集合下图表 / 图例 / tooltip 配色一致
const CAUSE_PALETTE = ['#ef4444', '#f59e0b', '#f97316', '#8b5cf6', '#3b82f6', '#94a3b8', '#10b981', '#ec4899', '#06b6d4', '#84cc16'];
function causeColorOf(def, idx) {
    return (def && def.color) || CAUSE_PALETTE[idx % CAUSE_PALETTE.length];
}
// 错因干预文案兜底：未预置 advice 的错因用通用模板，避免新增错因种类后关键发现出现空文案
function causeAdviceOf(def, up) {
    return (def && def.advice && (up ? def.advice.up : def.advice.down))
        || (up ? '占比持续上升，建议针对该错因安排专项干预，并在下周期复测验证' : '占比稳步下降，保持当前教学节奏并持续观察');
}

// 每次任务的错因占比（行 = 任务，列 = CAUSE_DEFS 顺序）
const causeMatrix = [
    [28, 26, 16, 14, 10, 6],
    [30, 24, 15, 14, 11, 6],
    [32, 23, 14, 14, 11, 6],
    [33, 21, 13, 15, 12, 6],
    [35, 20, 13, 15, 11, 6],
    [37, 19, 12, 14, 12, 6]
];

// 考核项 × 任务 失分率矩阵（null = 该场未考查，与「无失分」区分）
const heatData = {
    kp: [
        { name: '指数与对数', values: [52, 58, null, 58, 52, 55] },
        { name: '单调性', values: [42, null, 52, 55, null, 48] },
        { name: '函数基础', values: [45, null, 38, 45, null, 36] },
        { name: '函数的概念', values: [null, null, 36, 38, null, 34] },
        { name: '常用逻辑用语', values: [28, null, null, 30, null, 26] },
        { name: '三角函数', values: [20, 24, null, 22, null, 18] },
        { name: '集合运算', values: [8, 10, null, 12, null, 10] }
    ],
    ability: [
        { name: '演绎推理', values: [null, null, 48, 55, 50, 52] },
        { name: '逻辑推理', values: [null, 38, null, 52, 46, 48] },
        { name: '归纳推理', values: [null, 32, null, 42, 38, 36] },
        { name: '分式化简', values: [35, null, 40, 40, 38, 32] },
        { name: '数学建模', values: [null, null, null, 35, 30, 38] },
        { name: '数学运算', values: [28, 32, 26, 30, 28, 24] }
    ]
};

/* ---------------- 知识点关联图谱数据 ---------------- */

// 关系类型定义：颜色 / 线型 / 是否有向（结构边为树状父子，单独开关控制）
const KP_RELATION_DEFS = {
    prerequisite: { name: '前置 / 后续知识', short: '前置', color: '#3b82f6', lineType: 'solid', width: 1.6, directed: true },
    confusable: { name: '易混淆知识点', short: '易混', color: '#f59e0b', lineType: 'dashed', width: 1.4, directed: false },
    examAbility: { name: '考查能力', short: '考查', color: '#8b5cf6', lineType: 'dotted', width: 1.2, directed: true },
    requireAbility: { name: '依赖能力', short: '依赖', color: '#d946ef', lineType: 'dotted', width: 1.2, directed: true },
    questionType: { name: '考查题型', short: '题型', color: '#10b981', lineType: 'dotted', width: 1.1, directed: true },
    method: { name: '常用方法', short: '方法', color: '#f97316', lineType: 'dashed', width: 1.2, directed: true },
    errorPoint: { name: '题型易错点', short: '易错', color: '#ef4444', lineType: 'dashed', width: 1.2, directed: true },
    structure: { name: '树状结构', short: '结构', color: '#cbd5e1', lineType: 'solid', width: 1, directed: false }
};

// 关联节点池（能力 / 题型 / 方法 / 易错点）：形状与颜色定义
// 【现仅作类型元数据】四类非知识点节点已不在画布渲染（不再占节点、不再连边），
// 仅在知识点详情面板的分类清单中可见；画布上的颜色只表达掌握程度
const KG_EXTRA_NODE_DEFS = {
    ability: { kindLabel: '能力', symbol: 'roundRect', size: [46, 22], color: '#6366f1', rels: ['examAbility', 'requireAbility'] },
    question: { kindLabel: '题型', symbol: 'rect', size: [34, 17], color: '#10b981', rels: ['questionType'] },
    method: { kindLabel: '方法', symbol: 'diamond', size: 17, color: '#f97316', rels: ['method'] },
    error: { kindLabel: '易错点', symbol: 'triangle', size: 15, color: '#ef4444', rels: ['errorPoint'] }
};

// 画布可见关系：只有知识点 ↔ 知识点（前置/后续、易混淆）会画成连线；
// 能力 / 题型 / 方法 / 易错点类关系不进画布，仅在知识点详情面板呈现；
// 最终哪些关系存在、何类型，以题库实际标注为准（未标注则图上无边、面板无该项）
const KG_CANVAS_RELATIONS = ['prerequisite', 'confusable'];

// 说明：图谱节点 / 左侧目录不再按模块类型着色（原 KG_MODULE_COLORS 模块色板、ABILITY_MODULE_COLORS 能力色板已移除），
// 知识点颜色统一由掌握情况决定（statusOf → masteryTierHex；暂无作答证据恒灰），见 kpHexOf

// 知识点关联数据：prerequisite 前置 / confusable 易混淆 / examAbility 考查能力 /
// requireAbility 依赖能力 / questionType 考查题型 / methods 常用方法 / errorPoints 题型易错点
// 后续知识由前置关系自动反向推导，不重复维护
const kpRelations = {
    /* —— 集合与逻辑 —— */
    '集合运算': { prerequisite: [], confusable: [], examAbility: ['数学运算'], questionType: ['选择题', '填空题'], methods: ['Venn图法'], errorPoints: ['忽视空集的讨论'] },
    '并集与交集': { prerequisite: ['子集与真子集'], confusable: ['补集'], examAbility: ['数学运算'], questionType: ['选择题', '填空题'], methods: ['Venn图法'], errorPoints: ['忽视空集的讨论'] },
    '补集': { prerequisite: ['并集与交集'], confusable: ['并集与交集'], examAbility: ['数学运算'], questionType: ['选择题'], methods: ['Venn图法'], errorPoints: ['忽视空集的讨论'] },
    '子集与真子集': { prerequisite: [], examAbility: ['逻辑推理'], questionType: ['选择题'], methods: ['Venn图法'], errorPoints: ['忽视空集的讨论'] },
    '常用逻辑用语': { prerequisite: ['集合运算'], examAbility: ['逻辑推理'], questionType: ['选择题'] },
    '充分与必要条件': { prerequisite: ['常用逻辑用语'], confusable: ['全称与存在量词'], examAbility: ['逻辑推理'], questionType: ['选择题'], errorPoints: ['混淆充分与必要方向'] },
    '全称与存在量词': { prerequisite: ['常用逻辑用语'], confusable: ['充分与必要条件'], examAbility: ['逻辑推理'], questionType: ['选择题'] },

    /* —— 函数基础 —— */
    '函数的概念': { prerequisite: ['集合运算'], confusable: [], examAbility: ['数学运算', '数学建模'], requireAbility: ['逻辑推理'], questionType: ['选择题', '填空题'], methods: ['转化与化归'] },
    '定义域值域': { prerequisite: ['函数的概念', '集合运算'], examAbility: ['数学运算'], questionType: ['选择题', '填空题'], errorPoints: ['忽略定义域限制'] },
    '对应关系与解析式': { prerequisite: ['函数的概念'], examAbility: ['数学运算'], questionType: ['填空题'], methods: ['待定系数法'] },
    '分段函数': { prerequisite: ['函数的概念', '对应关系与解析式'], examAbility: ['数学运算', '逻辑推理'], questionType: ['选择题', '填空题'], methods: ['分类讨论'], errorPoints: ['分类讨论遗漏'] },
    '函数性质': { prerequisite: ['函数的概念'], requireAbility: ['逻辑推理', '直观想象'] },
    '单调性': { prerequisite: ['函数的概念'], examAbility: ['逻辑推理'], requireAbility: ['直观想象'], questionType: ['选择题', '解答题'], methods: ['数形结合'], errorPoints: ['忽略定义域限制'] },
    '奇偶性': { prerequisite: ['函数的概念'], examAbility: ['逻辑推理', '直观想象'], questionType: ['选择题', '填空题'], methods: ['数形结合'] },
    '最值': { prerequisite: ['单调性'], examAbility: ['数学运算'], questionType: ['填空题', '解答题'], methods: ['数形结合', '分类讨论'], errorPoints: ['忽略定义域限制'] },

    /* —— 指数与对数 —— */
    '指数运算': { prerequisite: ['函数的概念'], examAbility: ['数学运算'] },
    '指数幂运算': { prerequisite: [], examAbility: ['数学运算'], questionType: ['选择题', '填空题'], errorPoints: ['运算符号错误'] },
    '指数函数': { prerequisite: ['函数的概念', '指数幂运算'], confusable: ['对数函数'], examAbility: ['直观想象', '数学运算'], questionType: ['选择题', '填空题'], methods: ['数形结合'], errorPoints: ['忽略底数取值范围讨论'] },
    '对数运算': { prerequisite: ['指数运算'], examAbility: ['数学运算'] },
    '对数运算法则': { prerequisite: ['指数幂运算'], examAbility: ['数学运算'], questionType: ['选择题', '填空题'], errorPoints: ['运算符号错误'] },
    '对数函数': { prerequisite: ['函数的概念', '对数运算法则'], confusable: ['指数函数'], examAbility: ['直观想象', '数学运算'], questionType: ['选择题', '填空题'], methods: ['数形结合'], errorPoints: ['忽略真数取值范围'] },
    '换底公式': { prerequisite: ['对数运算法则'], examAbility: ['数学运算'], questionType: ['选择题'], errorPoints: ['运算符号错误'] },

    /* —— 三角函数 —— */
    '任意角与弧度制': { prerequisite: [] },
    '角度与弧度互化': { prerequisite: [], examAbility: ['数学运算'], questionType: ['选择题', '填空题'], errorPoints: ['弧度与角度混用'] },
    '象限角判断': { prerequisite: ['角度与弧度互化'], examAbility: ['直观想象', '逻辑推理'], questionType: ['选择题'], errorPoints: ['弧度与角度混用'] },
    '三角恒等变换': { prerequisite: ['任意角与弧度制'], examAbility: ['数学运算'] },
    '同角基本关系': { prerequisite: ['象限角判断'], examAbility: ['数学运算'], questionType: ['选择题', '填空题'], errorPoints: ['运算符号错误'] },
    '诱导公式': { prerequisite: ['同角基本关系'], examAbility: ['数学运算', '逻辑推理'], questionType: ['选择题', '填空题'], methods: ['转化与化归'], errorPoints: ['运算符号错误'] },
    '和差角公式': { prerequisite: ['诱导公式'], examAbility: ['数学运算'], questionType: ['选择题', '解答题'], methods: ['转化与化归'] },
    '二倍角公式': { prerequisite: ['和差角公式'], examAbility: ['数学运算'], questionType: ['选择题', '填空题'], methods: ['转化与化归'] },
    '三角函数图像': { prerequisite: ['任意角与弧度制', '三角恒等变换'], examAbility: ['直观想象'] },
    '正弦函数图像与性质': { prerequisite: ['同角基本关系'], examAbility: ['直观想象'], questionType: ['选择题', '填空题'], methods: ['数形结合'] },
    '余弦函数图像与性质': { prerequisite: ['正弦函数图像与性质'], confusable: ['正弦函数图像与性质'], examAbility: ['直观想象'], questionType: ['选择题', '填空题'], methods: ['数形结合'] },
    '正切函数图像与性质': { prerequisite: ['诱导公式'], confusable: ['正弦函数图像与性质'], examAbility: ['直观想象'], questionType: ['选择题', '填空题'], methods: ['数形结合'], errorPoints: ['忽略定义域限制'] },
    '图像变换': { prerequisite: ['正弦函数图像与性质', '余弦函数图像与性质'], examAbility: ['直观想象'], requireAbility: ['直观想象'], questionType: ['选择题', '填空题'], methods: ['数形结合'], errorPoints: ['图像平移方向记反'] },

    /* —— 平面向量 —— */
    '向量的概念': { prerequisite: [] },
    '向量的模': { prerequisite: [], examAbility: ['数学运算'], questionType: ['选择题', '填空题'] },
    '相等向量与共线向量': { prerequisite: ['向量的模'], examAbility: ['逻辑推理'], questionType: ['选择题'] },
    '单位向量': { prerequisite: ['向量的模'], examAbility: ['数学运算'], questionType: ['选择题'] },
    '向量的运算': { prerequisite: ['向量的概念'], examAbility: ['数学运算'] },
    '向量加减法': { prerequisite: ['相等向量与共线向量'], examAbility: ['数学运算', '直观想象'], questionType: ['选择题', '填空题'], methods: ['数形结合'], errorPoints: ['运算符号错误'] },
    '数乘运算': { prerequisite: ['向量加减法'], examAbility: ['数学运算'], questionType: ['选择题'], methods: ['数形结合'] },
    '数量积运算': { prerequisite: ['数乘运算', '同角基本关系'], examAbility: ['数学运算'], requireAbility: ['逻辑推理'], questionType: ['选择题', '填空题'], methods: ['转化与化归'], errorPoints: ['夹角范围误判'] },
    '向量的应用': { prerequisite: ['向量的运算', '三角恒等变换'] },
    '向量法解几何': { prerequisite: ['数量积运算'], examAbility: ['直观想象', '逻辑推理'], requireAbility: ['逻辑推理', '直观想象'], questionType: ['解答题', '证明题'], methods: ['坐标法', '转化与化归'] },
    '解三角形': { prerequisite: ['数量积运算', '正弦函数图像与性质'], examAbility: ['数学运算', '数学建模'], questionType: ['解答题', '应用题'], methods: ['转化与化归'], errorPoints: ['分类讨论遗漏'] },

    /* —— 数列 —— */
    '数列的概念': { prerequisite: ['函数的概念'] },
    '通项公式': { prerequisite: ['函数的概念'], examAbility: ['数学运算', '逻辑推理'], questionType: ['选择题', '填空题'], methods: ['归纳法'] },
    '递推关系': { prerequisite: ['通项公式'], examAbility: ['逻辑推理'], questionType: ['选择题'], methods: ['归纳法', '构造法'] },
    '等差数列': { prerequisite: ['数列的概念'], examAbility: ['数学运算'] },
    '等差数列通项与求和': { prerequisite: ['通项公式'], examAbility: ['数学运算'], questionType: ['选择题', '解答题'], methods: ['转化与化归'] },
    '等差数列性质应用': { prerequisite: ['等差数列通项与求和'], examAbility: ['逻辑推理'], questionType: ['选择题', '填空题'], errorPoints: ['忽略数列首项检验'] },
    '等比数列': { prerequisite: ['等差数列'], examAbility: ['数学运算'] },
    '等比数列通项与求和': { prerequisite: ['等差数列通项与求和'], examAbility: ['数学运算'], questionType: ['选择题', '解答题'], errorPoints: ['忽略公比为 1 的讨论'] },
    '等比数列性质应用': { prerequisite: ['等比数列通项与求和'], confusable: ['等差数列性质应用'], examAbility: ['逻辑推理'], questionType: ['选择题', '填空题'], errorPoints: ['忽略公比为 1 的讨论'] },

    /* —— 不等式 —— */
    '不等式性质': { prerequisite: [], examAbility: ['逻辑推理'], questionType: ['选择题'] },
    '一元二次不等式': { prerequisite: ['函数的概念'], examAbility: ['数学运算', '直观想象'] },
    '一元二次不等式解法': { prerequisite: ['函数的概念'], examAbility: ['数学运算', '直观想象'], questionType: ['选择题', '填空题'], methods: ['数形结合'], errorPoints: ['区间端点取舍错误'] },
    '恒成立问题': { prerequisite: ['一元二次不等式解法', '单调性'], examAbility: ['逻辑推理', '数学运算'], requireAbility: ['逻辑推理', '数学建模'], questionType: ['选择题', '解答题'], methods: ['分类讨论', '构造法'], errorPoints: ['分类讨论遗漏'] },
    '基本不等式': { prerequisite: ['不等式性质'], examAbility: ['数学运算'] },
    '均值不等式应用': { prerequisite: ['不等式性质'], examAbility: ['数学运算'], questionType: ['选择题', '填空题', '解答题'], methods: ['转化与化归'], errorPoints: ['忽略取等条件'] },

    /* —— 立体几何 —— */
    '空间几何体': { prerequisite: [] },
    '三视图与直观图': { prerequisite: [], examAbility: ['直观想象'], requireAbility: ['直观想象'], questionType: ['选择题', '填空题'], methods: ['数形结合'] },
    '表面积与体积': { prerequisite: ['三视图与直观图'], examAbility: ['数学运算', '直观想象'], questionType: ['选择题', '填空题'] },
    '位置关系': { prerequisite: ['空间几何体'] },
    '线面平行': { prerequisite: ['三视图与直观图'], examAbility: ['逻辑推理'], requireAbility: ['逻辑推理'], questionType: ['解答题', '证明题'], methods: ['转化与化归'] },
    '线面垂直': { prerequisite: ['线面平行'], examAbility: ['逻辑推理'], requireAbility: ['逻辑推理', '直观想象'], questionType: ['解答题', '证明题'], methods: ['转化与化归'] },
    '面面平行与垂直': { prerequisite: ['线面垂直'], examAbility: ['逻辑推理'], requireAbility: ['逻辑推理'], questionType: ['解答题', '证明题'], methods: ['转化与化归'] },
    '空间向量': { prerequisite: ['向量的运算', '位置关系'] },
    '空间向量运算': { prerequisite: ['数量积运算'], examAbility: ['数学运算'], questionType: ['选择题', '填空题'] },
    '法向量求法': { prerequisite: ['空间向量运算', '线面垂直'], examAbility: ['数学运算', '逻辑推理'], questionType: ['解答题'], methods: ['坐标法', '转化与化归'], errorPoints: ['运算符号错误'] },

    /* —— 解析几何 —— */
    '直线与方程': { prerequisite: ['三角函数图像'], examAbility: ['数学运算'] },
    '斜率与倾斜角': { prerequisite: ['正切函数图像与性质'], examAbility: ['数学运算'], questionType: ['选择题', '填空题'], errorPoints: ['忽略斜率不存在的情况'] },
    '直线方程': { prerequisite: ['斜率与倾斜角'], examAbility: ['数学运算'], questionType: ['选择题', '填空题'], methods: ['待定系数法'], errorPoints: ['忽略斜率不存在的情况'] },
    '距离公式': { prerequisite: ['直线方程'], examAbility: ['数学运算'], questionType: ['选择题', '填空题'], methods: ['坐标法'] },
    '圆与方程': { prerequisite: ['直线与方程'], examAbility: ['数学运算'] },
    '圆的方程': { prerequisite: ['距离公式'], examAbility: ['数学运算'], questionType: ['选择题', '填空题'], methods: ['待定系数法', '数形结合'] },
    '直线与圆位置关系': { prerequisite: ['圆的方程', '直线方程'], examAbility: ['直观想象', '数学运算'], questionType: ['选择题', '填空题'], methods: ['数形结合', '坐标法'] },
    '圆锥曲线': { prerequisite: ['圆与方程'], examAbility: ['数学运算', '直观想象'] },
    '椭圆': { prerequisite: ['距离公式'], examAbility: ['数学运算', '直观想象'], requireAbility: ['数学运算'], questionType: ['选择题', '解答题'], methods: ['待定系数法', '坐标法'], errorPoints: ['焦点位置漏讨论'] },
    '双曲线': { prerequisite: ['椭圆'], confusable: ['椭圆'], examAbility: ['数学运算', '直观想象'], questionType: ['选择题', '填空题'], errorPoints: ['焦点位置漏讨论'] },
    '抛物线': { prerequisite: ['椭圆'], confusable: ['双曲线'], examAbility: ['数学运算', '直观想象'], questionType: ['选择题', '填空题'], errorPoints: ['焦点位置漏讨论'] },

    /* —— 概率统计 —— */
    '统计': { prerequisite: [], examAbility: ['数学建模'] },
    '抽样方法': { prerequisite: [], examAbility: ['数学建模'], questionType: ['选择题'] },
    '频率分布直方图': { prerequisite: ['抽样方法'], examAbility: ['数学运算', '直观想象'], questionType: ['选择题', '解答题'], methods: ['数形结合'] },
    '均值与方差': { prerequisite: ['频率分布直方图'], examAbility: ['数学运算'], questionType: ['选择题', '填空题'], errorPoints: ['运算符号错误'] },
    '概率': { prerequisite: ['统计'], examAbility: ['数学运算', '数学建模'] },
    '排列组合': { prerequisite: [], examAbility: ['逻辑推理', '数学运算'], requireAbility: ['逻辑推理'], questionType: ['选择题', '填空题'], methods: ['分类讨论'], errorPoints: ['分类讨论遗漏'] },
    '古典概型': { prerequisite: ['排列组合'], examAbility: ['数学运算', '数学建模'], questionType: ['选择题', '填空题'], methods: ['分类讨论'] },
    '事件关系与独立性': { prerequisite: ['古典概型'], confusable: ['古典概型'], examAbility: ['逻辑推理'], questionType: ['选择题'], errorPoints: ['混淆互斥与独立事件'] },

    /* —— 导数及其应用 —— */
    '导数概念': { prerequisite: ['函数的概念', '函数性质'] },
    '导数的定义': { prerequisite: ['函数的概念'], examAbility: ['逻辑推理', '数学运算'], questionType: ['选择题'] },
    '导数的几何意义': { prerequisite: ['导数的定义'], examAbility: ['直观想象', '数学运算'], requireAbility: ['直观想象'], questionType: ['选择题', '填空题'], methods: ['数形结合'] },
    '导数运算': { prerequisite: ['导数概念'], examAbility: ['数学运算'] },
    '基本初等函数导数': { prerequisite: ['导数的定义'], examAbility: ['数学运算'], questionType: ['选择题', '填空题'], errorPoints: ['运算符号错误'] },
    '复合函数求导': { prerequisite: ['基本初等函数导数'], examAbility: ['数学运算', '逻辑推理'], questionType: ['选择题', '填空题'], methods: ['转化与化归'], errorPoints: ['链式求导漏层'] },
    '导数应用': { prerequisite: ['导数运算', '基本不等式'] },
    '单调性与极值': { prerequisite: ['导数的几何意义', '单调性'], examAbility: ['逻辑推理', '数学运算'], requireAbility: ['逻辑推理', '数学建模'], questionType: ['解答题', '选择题'], methods: ['分类讨论', '数形结合'], errorPoints: ['极值判定条件遗漏'] },
    '最值问题': { prerequisite: ['单调性与极值', '最值'], examAbility: ['数学运算', '数学建模'], questionType: ['解答题', '应用题'], methods: ['分类讨论'] },
    '恒成立与零点': { prerequisite: ['最值问题', '恒成立问题'], examAbility: ['逻辑推理', '数学建模'], requireAbility: ['逻辑推理', '数学建模'], questionType: ['解答题', '选择题'], methods: ['构造法', '分类讨论', '数形结合'], errorPoints: ['分类讨论遗漏', '忽略定义域限制'] }
};

/* ---------------- 图谱诊断补充数据（迁移自校级学情报告平台 · data-kg.js） ---------------- */

// 易混淆知识点对（关系 5）：a/b 为易混对，kp 为关联知识点，hit=本人命中，cls=全班人次，expr=典型混淆表现，fix=辨析建议
const confusionData = [
    {
        a: '充分条件', b: '必要条件', kp: '充分与必要条件',
        hit: 24, cls: 31,
        expr: '看到「若 p 则 q」就判断 p 是 q 的必要条件；把箭头方向与充分/必要对应关系记反',
        fix: '锚定口诀：「箭头指向谁，谁就是必要条件」；配合集合包含关系 p⊆q 双向验证'
    },
    {
        a: '指数函数', b: '对数函数', kp: '指数函数',
        hit: 22, cls: 28,
        expr: '把 a^x 与 log_a x 的定义域、值域对调；图像关于 y=x 对称的性质掌握不牢',
        fix: '同一坐标系画出 y=2^x 与 y=log_2 x，标注定义域 / 值域 / 单调性三栏对比'
    },
    {
        a: '等差数列', b: '等比数列', kp: '等比数列性质应用',
        hit: 18, cls: 25,
        expr: '把等差中项 (a+c)/2=b 与等比中项 b²=ac 混用；前 n 项和公式套错',
        fix: '做一张对比表：通项 / 中项 / 前 n 项和 三栏并列，强调公比 q≠0 与 q=1 的特殊讨论'
    },
    {
        a: '椭圆', b: '双曲线', kp: '双曲线',
        hit: 17, cls: 23,
        expr: 'a、b、c 关系式记反：椭圆 a²=b²+c²、双曲线 c²=a²+b²；标准方程分母与焦点位置对应关系混用',
        fix: '强调「椭圆 a 最大、双曲线 c 最大」；用图像 + 方程双向验证焦点位置'
    },
    {
        a: '互斥事件', b: '独立事件', kp: '事件关系与独立性',
        hit: 15, cls: 20,
        expr: '把 P(A∪B)=P(A)+P(B)（互斥）与 P(AB)=P(A)P(B)（独立）混用，认为二者不能共存',
        fix: '互斥看「能否同时发生」、独立看「是否影响概率」；两者不冲突，同一题可能既互斥又独立'
    },
    {
        a: '正弦函数图像', b: '余弦函数图像', kp: '余弦函数图像与性质',
        hit: 14, cls: 18,
        expr: '把 sin 与 cos 的单调区间、对称轴 / 对称中心记反；诱导公式转化后符号出错',
        fix: '先画 sin 图像，再用「左加右减」平移 π/2 得 cos；单调区间用「同增异减」口诀锚定'
    }
];

// 题型 × 易错点 命中情况（本周期，关系 10）：cls=全班命中人次，tot=参与人数，kp=主要关联知识点
const pitfallHitData = [
    { qt: '解答题', pit: '分类讨论遗漏', cls: 26, tot: 48, kp: '恒成立与零点' },
    { qt: '填空题', pit: '运算符号错误', cls: 24, tot: 48, kp: '诱导公式' },
    { qt: '选择题', pit: '忽略定义域限制', cls: 22, tot: 48, kp: '单调性' },
    { qt: '解答题', pit: '焦点位置漏讨论', cls: 19, tot: 48, kp: '椭圆' },
    { qt: '选择题', pit: '混淆充分与必要方向', cls: 18, tot: 48, kp: '充分与必要条件' },
    { qt: '填空题', pit: '忽略取等条件', cls: 15, tot: 48, kp: '均值不等式应用' },
    { qt: '解答题', pit: '链式求导漏层', cls: 14, tot: 48, kp: '复合函数求导' },
    { qt: '选择题', pit: '弧度与角度混用', cls: 12, tot: 48, kp: '象限角判断' },
    { qt: '填空题', pit: '区间端点取舍错误', cls: 11, tot: 48, kp: '一元二次不等式解法' }
];

/* ---------------- 前序/后序关联诊断与分目的加练（F14 · 同步自讲评试卷3.0方案，适配周期汇总数据源）
   单次作业内无法获取前序/后序知识点的作答数据；本模块基于周期内多份作业、考试的汇总证据。 ---------------- */

// 证据状态定义（周期版四态）
const REL_EVIDENCE_DEFS = {
    period: { label: '周期内考查', cls: 'ev-period', color: '#3b82f6' },
    history: { label: '历史证据', cls: 'ev-history', color: '#06b6d4' },
    none: { label: '暂无证据', cls: 'ev-none', color: '#f59e0b' },
    unlearned: { label: '未学·仅衔接', cls: 'ev-unlearned', color: '#94a3b8' }
};

// 证据例外表：默认有 mastery 的节点视为周期内考查；此表显式覆盖节点证据状态（真实接入按「场次×题目命中」实时推导）
// 演示口径（高二上学期：必修一复习 + 综合训练周期的 6 次任务，无数据 46/111 ≈ 41%，已检测 63/111）：
//   history   高一已有检测、本期未考（保留历史得分率与来源线索）；
//   none      已学但本期任务未覆盖（平面向量整模块 / 立体几何非向量部分 / 统计 / 零散前置）；
//   unlearned 教学进度未到（圆锥曲线、导数、空间向量），仅课堂衔接、不诊断不加练。
// 覆盖分布（period x/y）：集合与逻辑 8/8 · 函数基础 8/9 · 指数与对数 6/8 · 三角函数 13/14 · 平面向量 0/12 ·
//   数列 9/10 · 不等式 6/7 · 立体几何 0/11 · 解析几何 8/12 · 概率统计 5/9 · 导数及其应用 0/11
const KG_EVIDENCE_EXCEPTIONS = {
    /* —— history：周期外历史证据（青） —— */
    '任意角与弧度制': { state: 'history', rate: 85, source: '高一上学期期末考' },
    '不等式性质': { state: 'history', rate: 78, source: '高一上学期期末考' },

    /* —— none：已学 · 本期暂无作答证据（未知 ≠ 未掌握） —— */
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

// 学生名单池（原型模拟；真实数据按学生粒度作答证据生成，支持教师手工增删）
const KG_STUDENT_POOL = ['赵雨', '王笑天', '李墨白', '杨静云', '段问薇', '丁曼容', '周乐心', '傅彭薄', '潘夏彤', '张启航', '林疏影', '沈砚秋'];

// 显式分组样例（与断层卡演示链对齐，四组互斥覆盖全部 12 人）
const KG_STUDENT_GROUPS = {
    '对数函数': {
        diag: { students: [], reason: '直接前置均有周期内作答证据，无需前置诊断' },
        pre: { students: ['赵雨', '丁曼容', '周乐心', '沈砚秋'], reason: '最弱前置「对数运算法则」周期内 3 场汇总 42%（<70%），先补基础再回当前' },
        solid: { students: ['王笑天', '杨静云', '段问薇', '潘夏彤', '张启航'], reason: '前置尚可的学生中当前仅 38%，重点巩固对数函数图像与性质' },
        next: { students: ['李墨白'], reason: '个人周期汇总 ≥80%，可安排对数函数→数列综合的后续应用' }
    },
    '指数函数': {
        diag: { students: ['傅彭薄', '林疏影'], reason: '当前汇总 46% 失分，且前置「指数幂运算」暂无作答证据，先诊断再决定' },
        pre: { students: ['赵雨', '周乐心'], reason: '前置「函数的概念」周期汇总 58%（<70%），先补基础' },
        solid: { students: ['王笑天', '杨静云', '段问薇', '丁曼容', '潘夏彤', '张启航'], reason: '前置尚可，重点巩固指数函数图像与底数讨论' },
        next: { students: ['李墨白', '沈砚秋'], reason: '个人周期汇总 ≥80%，可安排指数函数→对数函数的后续应用' }
    },
    '单调性': {
        diag: { students: [], reason: '前置「函数的概念」周期内有作答证据，无需前置诊断' },
        pre: { students: ['赵雨', '杨静云', '沈砚秋'], reason: '前置「函数的概念」周期汇总 58%（<70%），先补基础' },
        solid: { students: ['王笑天', '段问薇', '丁曼容', '周乐心', '傅彭薄', '潘夏彤'], reason: '前置尚可，重点巩固单调性判定与证明步骤' },
        next: { students: ['李墨白', '张启航', '林疏影'], reason: '个人周期汇总 ≥80%，可进入「最值 / 恒成立问题」后续应用' }
    }
};

// 六类教学建议目的元数据（仅描述教学动作，不包含题量、题型或组卷参数）
const DRILL_PURPOSE_META = {
    diag: { label: '前置诊断', color: '#f59e0b', desc: '前置暂无证据 → 先通过课堂提问、既有作答或面谈确认基础情况' },
    pre: { label: '前置补练', color: '#0891b2', desc: '最弱前置有证据且汇总 <70% → 先补齐当前学习所需的基础' },
    confuse: { label: '概念辨析', color: '#ec4899', desc: '存在易混淆教研标注 → 成对对比讲解与学生互讲，替代无效刷题' },
    solid: { label: '同点巩固', color: '#3b82f6', desc: '前置尚可、当前 <80% → 重点巩固当前知识点本身' },
    next: { label: '后续应用', color: '#22c55e', desc: '个人周期汇总 ≥80% → 通过课堂任务检查迁移并适度提高' },
    retest: { label: '效果验证', color: '#8b5cf6', desc: '补练完成后 → 结合后续课堂反馈或既有任务验证掌握情况' }
};

/* ---------------- 掌握程度档位/* ---------------- 掌握程度档位 ---------------- */

const MASTERY_PRESETS = {
    3: [
        { name: '掌握', min: 80, max: 100 },
        { name: '一般', min: 60, max: 80 },
        { name: '未掌握', min: 0, max: 60 }
    ],
    4: [
        { name: '优秀', min: 90, max: 100 },
        { name: '掌握', min: 80, max: 90 },
        { name: '一般', min: 60, max: 80 },
        { name: '未掌握', min: 0, max: 60 }
    ]
};

/* ---------------- State ---------------- */

let currentDimension = 'kp';   // kp | ability
let currentMainTab = 'summary'; // 主页签：summary 学情汇总 | analysis 知识点分析 | students 学生学情
let chapterSidebarExpanded = true; // 目录显隐独立于数据与分析视图
let currentView = 'tree';      // tree | heat | table
let currentTableMode = 0;      // 0 全部 / 1 一级 / 2 二级 / 3 三级
let showAllKp = false;         // 「查看全部知识点」范围开关（默认仅周期学情包含的知识点模块；渲染层过滤，不动统计口径）
let currentDetailItem = null;
let currentDetailType = 'all'; // all | assignment | exam
let masteryLevelCount = 3;
let masteryLevels = MASTERY_PRESETS[3].map(l => ({ ...l }));

/* ---------------- 掌握程度：权限 / 留痕 / 并发保护 ----------------
 * 档位全校共用且可能多人同时段操作，纯粹「人人可改」会带来覆盖与责任不清：
 * ① 入口按角色分级——学科组长及以上可写，学科教师 / 班主任等只读查看（仅看设置后的结果）；
 * ② 弹窗常驻「最后一次保存」时间 + 操作人（姓名脱敏：姓 + 名末字 + 账号后四位）；
 * ③ 并发冲突：以最后一次保存为准（后写覆盖），但打开弹窗后配置被他人改写时，
 *    确认不再静默覆盖，而是弹出冲突提示由用户选择「使用最新」或「以我的为准」。
 * 原型用 masteryRoleSelect / btnSimulatePeerSave 模拟登录态与并发；真实系统由登录态与后端版本号下发。
 */
const AUTH_ROLES = {
    leader:   { label: '学科组长', canEdit: true,  name: '张伟', account: 'T10032' },
    director: { label: '教研主任', canEdit: true,  name: '李静', account: 'U20017' },
    teacher:  { label: '学科教师', canEdit: false, name: '王芳', account: 'T30058' },
    head:     { label: '班主任',   canEdit: false, name: '陈刚', account: 'B40126' }
};
let currentRoleKey = 'leader';
// 全局配置的「服务端」影子状态：version 只用于并发冲突检测，最终以 time 最晚的一次保存为准
let masteryState = {
    version: 1,
    time: '2026-10-24 15:32',
    operator: '张伟',
    account: 'T10032',
    role: '学科组长',
    levelCount: 3
};
// 打开弹窗时的版本快照：确认时与当前版本比对，不一致即判定他人已改写
let masteryModalBaseVersion = 0;

let myTreeChart, myDetailsChart, periodTrendChart, causeStackChart;

/* ---------------- 元素缓存 ---------------- */

const El = {
    // 筛选栏
    filterCount: document.getElementById('filterCount'),
    filterModal: document.getElementById('filterModalOverlay'),
    modalAssignList: document.getElementById('modalAssignList'),
    modalExamList: document.getElementById('modalExamList'),
    checkAllAssignments: document.getElementById('checkAllAssignments'),
    checkAllExams: document.getElementById('checkAllExams'),
    assignEmpty: document.getElementById('assignEmpty'),
    examEmpty: document.getElementById('examEmpty'),
    gradeClassCascade: document.getElementById('gradeClassCascade'),
    cascadeTrigger: document.getElementById('cascadeTrigger'),
    cascadeValue: document.getElementById('cascadeValue'),
    cascadeGrades: document.getElementById('cascadeGrades'),
    cascadeClasses: document.getElementById('cascadeClasses'),
    // 主面板
    chapterSidebar: document.getElementById('chapterSidebar'),
    chapterToggle: document.getElementById('btnToggleChapters'),
    analysisLayout: document.getElementById('analysisLayout'),
    valSummary1: document.getElementById('valSummary1'),
    valSummary2: document.getElementById('valSummary2'),
    valSummary3: document.getElementById('valSummary3'),
    summaryTitle1: document.getElementById('summaryTitle1'),
    summaryTitle2: document.getElementById('summaryTitle2'),
    summaryTitle3: document.getElementById('summaryTitle3'),
    badgeMasteryThreshold: document.getElementById('badgeMasteryThreshold'),
    sectionTitleText: document.getElementById('sectionTitleText'),
    kpTreeChart: document.getElementById('kpTreeChart'),
    kpTableHead: document.getElementById('kpTableHead'),
    kpTableBody: document.getElementById('kpTableBody'),
    kpTableTabs: document.getElementById('kpTableTabs'),
    treeView: document.getElementById('treeView'),
    tableView: document.getElementById('tableView'),
    // 周期分析（整合自班级周期分析报告）
    periodOverviewSection: document.getElementById('periodOverviewSection'),
    periodKpiGrid: document.getElementById('periodKpiGrid'),
    periodTaskTableWrap: document.getElementById('periodTaskTableWrap'),
    periodStatHint: document.getElementById('periodStatHint'),
    periodInsightList: document.getElementById('periodInsightList'),
    valSummary4: document.getElementById('valSummary4'),
    valSummary5: document.getElementById('valSummary5'),
    summaryTitle5: document.getElementById('summaryTitle5'),
    badgePeriodDelta: document.getElementById('badgePeriodDelta'),
    // 年级平均得分率卡（随班级筛选联动，见 syncSummaryCards）
    valSummary6: document.getElementById('valSummary6'),
    badgeGradeDelta: document.getElementById('badgeGradeDelta'),
    cardSummary4: document.getElementById('cardSummary4'),
    heatView: document.getElementById('heatView'),
    causeFindingList: document.getElementById('causeFindingList'),
    // 详情视图
    detailsView: document.getElementById('detailsView'),
    detailsSidebarList: document.getElementById('detailsSidebarList'),
    detailsSidebarLabel: document.getElementById('detailsSidebarLabel'),
    detailsTableBody: document.getElementById('detailsTableBody'),
    detailsChartContainer: document.getElementById('detailsChartContainer'),
    detailsTableWrapper: document.getElementById('detailsTableWrapper'),
    // 弹窗
    masteryModal: document.getElementById('masteryModalOverlay'),
    masteryLevelContainer: document.getElementById('masteryLevelContainer')
};

/* ---------------- Utils ---------------- */

const LEVEL_ICONS = { 1: { t: '知', c: 'icon-zhi' }, 2: { t: '题', c: 'icon-ti' }, 3: { t: '微', c: 'icon-wei' } };
const ABILITY_ICON = { t: '力', c: 'icon-wei' };

const escapeHTML = (str) => String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const formatRate = (v) => (v || v === 0) ? Number(v).toFixed(1) + "%" : "--";

function currentTree() {
    return currentDimension === 'kp' ? AppData.kpTree : AppData.abilityTree;
}
function dimensionLabel() {
    return currentDimension === 'kp' ? '知识点' : '能力';
}
function iconOf(level) {
    return currentDimension === 'kp' ? (LEVEL_ICONS[level] || LEVEL_ICONS[1]) : ABILITY_ICON;
}
function detailSource() {
    return currentDimension === 'kp' ? mockKPRawData : mockAbilityRawData;
}
function mistakeSource() {
    return currentDimension === 'kp' ? mistakeData : abilityMistakeData;
}
function masteryOf(node) {
    return Math.min(100, node.mastery);
}
// 未掌握阈值 = 最低档位的上界（如 3 档时为 60）
function unmasteredThreshold() {
    return masteryLevels[masteryLevels.length - 1].max;
}
// 档位索引 → 色值：图谱节点 / 目录色点 / 诊断关系行 / 图例共用同一套掌握度配色（绿 → 黄 → 红）
function masteryTierHex(i, total) {
    return i >= total - 1 ? '#ef4444' : (i === total - 2 ? '#f59e0b' : '#10b981');
}
// 根据档位配置返回状态：名称 / 颜色 / 标签类
function statusOf(mastery) {
    const n = masteryLevels.length;
    for (let i = 0; i < n; i++) {
        if (mastery >= masteryLevels[i].min) {
            return {
                name: masteryLevels[i].name,
                color: i >= n - 1 ? 'var(--danger)' : (i === n - 2 ? 'var(--warning)' : 'var(--success)'),
                hexColor: masteryTierHex(i, n),
                cls: i >= n - 1 ? 'status-low' : (i === n - 2 ? 'status-mid' : 'status-high')
            };
        }
    }
    const last = masteryLevels[n - 1];
    return { name: last.name, color: 'var(--danger)', hexColor: masteryTierHex(n - 1, n), cls: 'status-low' };
}
// 展平树（含/不含根节点）
function flattenTree(tree, excludeRoot) {
    const out = [];
    const walk = (n) => {
        if (!(excludeRoot && n.level === 0)) out.push(n);
        if (n.children) n.children.forEach(walk);
    };
    walk(tree);
    return out;
}

// 页签面板是否可见（ECharts 依赖容器实际尺寸，面板隐藏期间跳过图表渲染）
function panelVisible(id) {
    const el = document.getElementById(id);
    return !!el && !el.hidden;
}

/* ---------------- 主面板渲染 ---------------- */

// 维度清单（数据驱动）：主页签栏内嵌子导航 chip 按此渲染；真实数据接入后按学科配置维度组
const DIMENSIONS = [
    { key: 'kp', label: '知识点', count: () => flattenTree(AppData.kpTree, true).length },
    { key: 'ability', label: '能力', count: () => flattenTree(AppData.abilityTree, true).length }
];

// 渲染维度 chip：单维度学科不渲染（无切换需求，页签栏零维度痕迹）；多维度 chip 流排、溢出横向滚动
function renderDimChips() {
    const group = document.getElementById('dimChipGroup');
    if (!group) return;
    if (DIMENSIONS.length <= 1) {
        group.innerHTML = '';
        return;
    }
    group.innerHTML = DIMENSIONS.map(d =>
        `<span class="dim-chip${d.key === currentDimension ? ' active' : ''}" data-dim="${d.key}" title="切换至${d.label}维度">${d.label} (${d.count()})</span>`
    ).join('');
}

// 维度组显隐：仅「知识点分析」页签激活且维度 ≥2 时展开（单维学科恒收起）
function updateDimGroupVisibility() {
    const group = document.getElementById('dimGroup');
    if (!group) return;
    group.classList.toggle('dim-collapsed', currentMainTab !== 'analysis' || DIMENSIONS.length <= 1);
}

function refreshDashboard() {
    const label = dimensionLabel();

    // 标题（随维度联动显示：知识点分析明细 / 能力分析明细，与学生追踪 stKpTitleText 同款命名）
    El.sectionTitleText.innerText = `${label}分析明细`;

    // 统计卡片
    const nodes = flattenTree(currentTree(), true);            // level > 0
    const unmastered = nodes.filter(n => masteryOf(n) < unmasteredThreshold()).length;
    const mistakes = mistakeSource();
    const mistakesByRange = mistakes.filter(m => m.classRate >= 0 && m.classRate <= 60).length;

    // 卡1（知识点维度）：覆盖率口径「周期已检测 x / 全体系总数」，不随「查看全部知识点」开关变化（统计红线）
    const unit1El = document.querySelector('#cardSummary1 .value-unit');
    if (currentDimension === 'kp') {
        const cov = kpCoverageTotal();
        El.summaryTitle1.innerText = '周期已检测知识点';
        El.valSummary1.innerText = cov.covered;   // 仅显示已检测数量（覆盖率分母不再并列展示）
        if (unit1El) unit1El.style.display = '';   // 恢复单位「个」
    } else {
        El.summaryTitle1.innerText = `${label}数量`;
        El.valSummary1.innerText = nodes.length;
        if (unit1El) unit1El.style.display = '';
    }
    El.valSummary2.innerText = unmastered;
    El.valSummary3.innerText = mistakesByRange;
    El.badgeMasteryThreshold.innerText = `得分率 < ${unmasteredThreshold()}%`;

    // 周期指标卡（班级平均得分率 / 年级平均得分率 / 顽固薄弱项，随维度联动）
    const pStats = calcPeriodStats();
    El.valSummary4.innerText = pStats.pRate;
    // 环比徽章：无环比数据（自定义区间前置窗口无任务）时隐藏，不展示误导性的 0%
    if (pStats.dRate !== null) {
        El.badgePeriodDelta.style.display = '';
        El.badgePeriodDelta.innerText = `环比 ${pStats.dRate > 0 ? '+' : ''}${pStats.dRate}%`;
        El.badgePeriodDelta.className = `badge ${pStats.dRate >= 0 ? 'badge-success' : 'badge-danger'}`;
    } else {
        El.badgePeriodDelta.style.display = 'none';
    }
    // 年级卡：徽章展示年级环比上一周期（与班级卡环比同口径：上升进步绿色 / 下降退步红色）
    El.valSummary6.innerText = pStats.gRate;
    if (pStats.gDRate !== null) {
        El.badgeGradeDelta.style.display = '';
        El.badgeGradeDelta.innerText = `环比 ${pStats.gDRate > 0 ? '+' : ''}${pStats.gDRate}%`;
        El.badgeGradeDelta.className = `badge ${pStats.gDRate >= 0 ? 'badge-success' : 'badge-danger'}`;
    } else {
        El.badgeGradeDelta.style.display = 'none';
    }
    syncSummaryCards();   // 班级卡显隐随班级筛选联动（全部班级时无单一班级口径）
    El.summaryTitle5.innerText = `顽固薄弱${label}`;
    El.valSummary5.innerText = pStats.stubSorted.length;
    renderPeriodInsights();
    renderPeriodKpis();
    renderPeriodTaskTable();
    renderCommonMistakes();

    // 维度标签（chip 组随 refreshDashboard 刷新 active 与计数；isKp 供层级 Tab 文案等后续渲染复用）
    const isKp = currentDimension === 'kp';
    setChapterSidebarExpanded(chapterSidebarExpanded);
    renderDimChips();

    // 层级 Tab 文案
    const kpTabs = El.kpTableTabs.querySelectorAll('span');
    const labels = isKp ? ['全部', '一级知识点', '二级知识点', '三级知识点'] : ['全部', '一级能力', '二级能力', '三级能力'];
    kpTabs.forEach((t, i) => {
        t.innerText = labels[i] || t.innerText;
        t.classList.toggle('active', Number(t.dataset.mode) === currentTableMode);
    });
    El.kpTableTabs.style.display = 'flex';

    // 明细 / 图表 / 错题
    renderTable(currentTableMode);
    initTreeChart();
    if (currentView === 'heat') {
        renderHeatView();
    }
    El.detailsSidebarLabel.innerText = label;

    // 统一目录随维度刷新（四视图共用）
    kgRenderModules();

    // 知识点 / 能力均为知识点维度类型：关联图谱与图谱诊断在两个维度下功能一致，同步刷新诊断数据
    renderKgDiagnosis();

    window.dispatchEvent(new Event('resize'));
}

function renderTable(mode = 0) {
    const isAll = mode === 0;
    const labelPrefix = dimensionLabel();

    El.kpTableHead.innerHTML = `<tr>
        <th>${labelPrefix}</th>
        <th>考察频次 (次)</th>
        <th>班级得分率 (%)</th>
        <th>年级得分率 (%)</th>
        <th>得分率差值 (%)</th>
        <th>班级未掌握人数</th>
        <th>掌握程度</th>
        <th>检测状态</th>
        <th>操作</th>
    </tr>`;

    const rows = currentTableRows(mode);

    if (!rows.length) {
        El.kpTableBody.innerHTML = `<tr><td colspan="9" style="padding: 40px; color: var(--text-muted);">暂无符合条件的数据</td></tr>`;
        return;
    }

    El.kpTableBody.innerHTML = rows.map(d => {
        const mastery = masteryOf(d);
        const gradeRate = d.gradeMastery || 0;
        const icon = iconOf(d.level);
        const paddingLeft = isAll ? (24 + (d.level - 1) * 24) : 24;

        // 检测状态（仅知识点维度）：一级模块行显示覆盖「已考x/y」（零覆盖显示「本期未检测」），末级行显示四态徽章；
        // 无本期证据的行数值列置 —（未知 ≠ 未掌握，不展示误导性演示值）；history 行班级得分率用历史得分率
        const ev = currentDimension === 'kp' ? evidenceStateOf(d.name) : null;
        const evState = ev ? ev.state : null;
        const noEv = evState === 'none' || evState === 'unlearned';
        const isHis = evState === 'history';
        const shownRate = isHis ? ev.rate : mastery;
        const noPeriod = noEv || isHis;          // 频次/年级/差值/未掌握人数为本期口径，无本期证据置 —
        const diff = noPeriod ? null : (mastery - gradeRate);
        const diffColor = diff === null ? 'var(--text-muted)' : diff < 0 ? 'var(--danger)' : diff > 0 ? 'var(--success)' : 'var(--text-main)';
        const diffText = diff === null ? '—' : (diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1));
        const st = noEv ? null : statusOf(shownRate);
        let evBadge = '<span class="tb-ev">—</span>';
        if (ev) {
            if (d.level === 1) {
                const c = kpModuleCoverage(d.name);
                evBadge = `<span class="tb-ev ${c.covered === 0 ? 'tb-ev-none' : 'tb-ev-ok'}" title="本期已检测 ${c.covered} / 共 ${c.total} 个知识点（含周期外历史证据）">${c.covered === 0 ? '本期未检测' : `已考${c.covered}/${c.total}`}</span>`;
            } else if (evState === 'period') {
                evBadge = '<span class="tb-ev tb-ev-ok">本期已检测</span>';
            } else if (isHis) {
                evBadge = `<span class="tb-ev tb-ev-his" title="历史证据：${escapeHTML(ev.source || '周期外检测')}">历史证据</span>`;
            } else {
                evBadge = `<span class="tb-ev tb-ev-none" title="${evState === 'unlearned' ? '教学进度未到，未检测' : '已学 · 本期暂无作答证据（未知 ≠ 未掌握）'}">${evState === 'unlearned' ? '未学' : '本期未检测'}</span>`;
            }
        }

        return `<tr${noEv ? ' style="color:#94a3b8;"' : ''}>
            <td style="text-align:left; padding-left: ${paddingLeft}px;">
                <span class="tree-node-icon ${icon.c}">${icon.t}</span>
                <span style="${isAll && d.level === 1 ? 'font-weight: 700;' : ''}${noEv ? 'color:#94a3b8;' : ''}">${escapeHTML(d.name)}</span>
            </td>
            <td>${noPeriod ? '—' : (d.freq || 10)}</td>
            <td style="font-weight:700; color:${noEv ? '#94a3b8' : st.color}">${noEv ? '—' : shownRate.toFixed(1) + '%'}</td>
            <td>${noPeriod ? '—' : gradeRate + '%'}</td>
            <td style="font-weight:700; color:${diffColor}">${diffText}${diff === null ? '' : '%'}</td>
            <td style="color: var(--primary); font-weight: 600;">${noPeriod ? '—' : (d.unmasteredCount || 0)}</td>
            <td>${noEv ? '<span class="status-label" style="color:#94a3b8;">—</span>' : `<span class="status-label ${st.cls}">${st.name}</span>`}</td>
            <td>${evBadge}</td>
            <td><span class="action-link" style="justify-content:center;" onclick="window.openDetails('${d.name}')">查看详情</span></td>
        </tr>`;
    }).join('');
}

// 树状图底部图例：色块与节点着色同源（statusOf 规则由 masteryLevels 档位驱动），
// 档位切换（confirmMastery → refreshDashboard）与维度切换后随 initTreeChart 重建
function renderTreeLegend() {
    const el = document.getElementById('treeLegend');
    if (!el) return;
    const n = masteryLevels.length;
    const items = masteryLevels.map((lv, i) => {
        const hex = masteryTierHex(i, n);
        const range = i === 0 ? `≥${lv.min}%` : (i === n - 1 ? `<${lv.max}%` : `${lv.min}~${lv.max}%`);
        return `<span class="tl-item"><i class="tl-sw" style="background:${hex}"></i>${lv.name} ${range}</span>`;
    }).join('');
    // 灰色项仅知识点维度有意义（能力维度无证据四态概念，节点无灰色编码）
    const gray = currentDimension === 'kp'
        ? '<span class="tl-item"><i class="tl-sw" style="background:#94a3b8"></i>无作答证据 / 未学</span>'
        : '';
    const note = currentDimension === 'kp'
        ? '档位随「设置掌握程度」联动 · 灰色节点无本期证据（未知 ≠ 未掌握）'
        : '档位随「设置掌握程度」联动';
    el.innerHTML = `<span class="tl-title">掌握程度：</span>${items}${gray}<span class="legend-note">${note}</span>`;
}

function initTreeChart() {
    const dom = El.kpTreeChart;
    if (!dom) return;
    if (!panelVisible('analysisTabPanel')) return; // 「知识点分析」页签隐藏期间跳过，切换页签时再渲染
    renderTreeLegend();   // 底部图例不依赖 ECharts，随档位/维度切换先行重建
    if (!window.echarts) {
        // ECharts 尚未加载完成，稍后重试
        setTimeout(initTreeChart, 500);
        return;
    }
    if (!myTreeChart) myTreeChart = echarts.getInstanceByDom(dom) || echarts.init(dom);

    // 渲染层过滤：剔除统一目录中关闭的一级节点（数据源与统计口径不受影响）
    const shown = dirStateOf();
    const fullTree = currentTree();
    const tree = { ...fullTree, children: (fullTree.children || []).filter(c => shown[c.name] !== false) };
    // 证据四态着色（仅知识点维度）：none/unlearned 恒灰（勾选「查看全部知识点」后仍灰，可分辨无数据节点）；
    // history 用例外表历史得分率；范围开关仅控制 none 的显隐（kpScopeKeep），不影响配色
    const process = (n) => {
        const ev = (currentDimension === 'kp' && n.level > 0) ? evidenceStateOf(n.name) : null;
        const gray = !!ev && (ev.state === 'none' || ev.state === 'unlearned');
        const shownRate = ev && ev.state === 'history' ? ev.rate : masteryOf(n);
        const item = {
            name: n.name,
            evState: ev ? ev.state : null,
            evSource: (ev && ev.source) || null,
            value: gray ? null : shownRate.toFixed(1),
            itemStyle: { color: gray ? '#94a3b8' : statusOf(shownRate).hexColor },
            children: n.children ? n.children.filter(kpScopeKeep).map(process) : []
        };
        if (gray) item.label = { color: '#94a3b8' };
        return item;
    };
    const data = process(tree);

    // 末级节点行距保障：ECharts tree 将全部叶子均匀摊在容器高度内，叶子多时行距不足 8px 导致标签重叠；
    // 按可见叶子数动态增高容器（每叶预留 18px，保底 500px），页面自然滚动查看
    const leafCount = (function cnt(n) {
        return (n.children && n.children.length) ? n.children.reduce((s, c) => s + cnt(c), 0) : 1;
    })(data);
    dom.style.height = Math.max(500, Math.ceil(leafCount * 18)) + 'px';

    myTreeChart.setOption({
        tooltip: {
            formatter: (p) => {
                const d = p.data || {};
                if (d.evState === 'none') return `${p.name}<br/>已学 · 本期暂无作答证据（未知 ≠ 未掌握）`;
                if (d.evState === 'unlearned') return `${p.name}<br/>教学进度未到 · 未检测`;
                if (d.evState === 'history') return `${p.name}: ${p.value}%<br/>历史证据：${d.evSource || '周期外检测'}`;
                return `${p.name}: ${p.value}%`;
            }
        },
        series: [{
            type: 'tree',
            orient: 'LR',
            data: [data],
            left: '13%', right: '24%', top: '2%', bottom: '2%',
            symbolSize: 9,
            label: {
                position: 'left', align: 'right', verticalAlign: 'middle',
                fontSize: 12, distance: 8, color: '#334155'
            },
            leaves: {
                label: { position: 'right', align: 'left', verticalAlign: 'middle', distance: 8 }
            },
            lineStyle: { color: '#cbd5e1', width: 1.5, curveness: 0.5 },
            itemStyle: { borderWidth: 1.5, borderColor: '#ffffff' },
            initialTreeDepth: -1,
            expandAndCollapse: true,
            animationDuration: 400
        }]
    }, true);

    dom.classList.add('loaded');
    myTreeChart.resize();
}

/* ---------------- 知识点关联图谱 ---------------- */

// 图谱状态：布局 / 展示深度 / 标签策略 / 仅看关联 / 关系开关 / 模块可见性 / 选中节点
let kgChart = null;
const kgState = {
    layout: 'force',          // force | radial
    depth: 3,                 // 展示深度：1/2/3 级知识点
    labelMode: 'compact',     // all | compact | none
    onlyRelated: false,       // 仅看有关联的知识点（至少有一条 kp↔kp 关系边）
    // 关系开关只保留画布可见的三类（KG_CANVAS_RELATIONS + 树状结构）；
    // 能力/题型/方法/易错点类关系不上画布，故不设开关
    rels: { prerequisite: true, confusable: false, structure: true },
    modules: {},              // 知识点模块目录状态（四视图共用）
    abilityModules: null,     // 能力维度目录状态（懒初始化，与模块状态各自保持）
    selected: null
};

// 知识点索引：name -> { node, parent, module, path, level }
const kgIndex = { byName: {}, list: [], followUps: {}, built: false };

function kgBuildIndex() {
    if (kgIndex.built) return;   // 幂等：init() 提前构建（卡1 覆盖口径依赖证据索引），initKnowledgeGraph 重复调用安全
    kgIndex.built = true;
    const root = AppData.kpTree;
    const walk = (n, parent, module, path) => {
        if (n.level > 0) {
            const mod = n.level === 1 ? n.name : module;
            kgIndex.byName[n.name] = { node: n, parent: parent ? parent.name : null, module: mod, path: path.join(' / '), level: n.level };
            kgIndex.list.push(n);
        }
        const nextPath = n.level === 0 ? [root.name] : path.concat(n.name);
        (n.children || []).forEach(c => walk(c, n, n.level === 1 ? n.name : module, nextPath));
    };
    walk(root, null, null, []);

    // 后续知识：由前置关系反向推导，不重复维护
    Object.keys(kpRelations).forEach(name => {
        (kpRelations[name].prerequisite || []).forEach(p => {
            if (!kgIndex.byName[p]) return;
            (kgIndex.followUps[p] = kgIndex.followUps[p] || []).push(name);
        });
    });
}

// 聚合关系（供一级 / 二级知识点详情面板）：汇总子树内所有知识点的关联，剔除模块内部自关联
function kgAggEntry(name) {
    const node = kgIndex.byName[name].node;
    const subtree = new Set(flattenTree(node, false).map(n => n.name));
    const acc = { prerequisite: {}, confusable: {}, examAbility: {}, requireAbility: {}, questionType: {}, methods: {}, errorPoints: {}, followUps: {} };
    subtree.forEach(nm => {
        const e = kpRelations[nm];
        if (!e) return;
        const addKp = (group, target) => {
            if (target === name || subtree.has(target)) return;
            (acc[group][target] = acc[group][target] || []).push(nm);
        };
        const addExtra = (group, target) => { (acc[group][target] = acc[group][target] || []).push(nm); };
        (e.prerequisite || []).forEach(p => addKp('prerequisite', p));
        (e.confusable || []).forEach(c => addKp('confusable', c));
        (e.examAbility || []).forEach(a => addExtra('examAbility', a));
        (e.requireAbility || []).forEach(a => addExtra('requireAbility', a));
        (e.questionType || []).forEach(q => addExtra('questionType', q));
        (e.methods || []).forEach(m => addExtra('methods', m));
        (e.errorPoints || []).forEach(er => addExtra('errorPoints', er));
    });
    // 后续：前置指向子树内节点的外部知识点
    Object.keys(kpRelations).forEach(nm => {
        if (subtree.has(nm)) return;
        if ((kpRelations[nm].prerequisite || []).some(p => subtree.has(p))) acc.followUps[nm] = ['前置'];
    });
    return acc;
}

// 面板用关系数据：优先取自身维护的直接关系，无则聚合子树
function kgEntryOf(name) {
    const direct = kpRelations[name];
    if (direct) {
        const f = (arr) => { const o = {}; (arr || []).forEach(t => (o[t] = [name])); return o; };
        const fu = {}; (kgIndex.followUps[name] || []).forEach(t => (fu[t] = [name]));
        return {
            prerequisite: f(direct.prerequisite), confusable: f(direct.confusable),
            examAbility: f(direct.examAbility), requireAbility: f(direct.requireAbility),
            questionType: f(direct.questionType), methods: f(direct.methods),
            errorPoints: f(direct.errorPoints), followUps: fu
        };
    }
    return kgAggEntry(name);
}

// 当前可见的知识点（模块过滤 + 深度过滤）
function kgVisibleKpNodes() {
    return kgIndex.list.filter(n => {
        const info = kgIndex.byName[n.name];
        if (kgState.modules[info.module] === false) return false;
        if (n.level > kgState.depth) return false;
        // 范围开关（渲染层）：默认仅保留周期学情包含的知识点——零覆盖一级模块按归属模块整棵剔除
        // （模块行及其全部后代含 unlearned，避免孤儿节点漂浮；目录行同步隐藏），
        // 有覆盖模块内 none 节点隐藏；勾选后全量；图谱固定知识点树，不随当前维度豁免
        if (!showAllKp) {
            if (n.level >= 1 && kpModuleCoverage(info.module).covered === 0) return false;
            if (n.level >= 2 && evidenceStateOf(n.name).state === 'none') return false;
        }
        return true;
    });
}

// 收集指定知识点集合的关联边：只收知识点 ↔ 知识点（前置 / 易混淆），
// 能力 / 题型 / 方法 / 易错点属关联节点池，不进画布（只看详情面板），避免非知识点节点抢占视觉焦点
function kgCollectEdges(kpSet) {
    const edges = [];
    Object.keys(kpRelations).forEach(name => {
        if (!kpSet[name]) return;
        const e = kpRelations[name];
        (e.prerequisite || []).forEach(p => { if (kpSet[p] && kgState.rels.prerequisite) edges.push({ rel: 'prerequisite', source: p, target: name }); });
        (e.confusable || []).forEach(c => { if (kpSet[c] && kgState.rels.confusable) edges.push({ rel: 'confusable', source: name, target: c }); });
    });
    return { edges };
}

// 构图：可见知识点 + 知识点间关联边 + 树状结构边
function kgBuildGraph() {
    const visible = {};
    kgVisibleKpNodes().forEach(n => { visible[n.name] = n; });

    let kpSet = visible;
    if (kgState.onlyRelated) {
        const first = kgCollectEdges(visible);
        const linked = new Set();
        first.edges.forEach(e => { linked.add(e.source); linked.add(e.target); });
        kpSet = {};
        Object.keys(visible).forEach(nm => { if (linked.has(nm)) kpSet[nm] = visible[nm]; });
    }

    const { edges } = kgCollectEdges(kpSet);

    if (kgState.rels.structure) {
        Object.keys(kpSet).forEach(name => {
            const parent = kgIndex.byName[name].parent;
            if (parent && kpSet[parent]) edges.push({ rel: 'structure', source: parent, target: name });
        });
    }
    return { kpSet, edges };
}

// 放射布局坐标：知识点按模块扇区径向排布
function kgRadialPositions(nodes, kpSet, dom) {
    const W = dom.clientWidth || 900, H = dom.clientHeight || 600;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.42;
    const radius = { 1: R * 0.30, 2: R * 0.62, 3: R * 0.92 };
    const maxL = Math.max(1, ...Object.values(kpSet).map(n => n.level));

    const leavesOf = (n) => {
        let c = 0;
        const walk = (m) => { if (m.level === maxL) c++; (m.children || []).forEach(walk); };
        walk(n);
        return Math.max(c, 1);
    };
    const inSet = (n) => !!kpSet[n.name];

    const pos = {};
    const modules = (AppData.kpTree.children || []).filter(inSet);
    const assign = (n, a0, a1) => {
        const mid = (a0 + a1) / 2;
        pos[n.name] = { x: cx + Math.cos(mid) * (radius[n.level] || R), y: cy + Math.sin(mid) * (radius[n.level] || R), angle: mid };
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
        // 仅关联模式下可能没有一级节点：剩余知识点均匀成环
        const names = Object.keys(kpSet);
        names.forEach((nm, i) => {
            const ang = -Math.PI / 2 + (i / names.length) * Math.PI * 2;
            pos[nm] = { x: cx + Math.cos(ang) * R * 0.6, y: cy + Math.sin(ang) * R * 0.6, angle: ang };
        });
    }

    nodes.forEach(nd => { if (nd.kp && pos[nd.name]) { nd.x = pos[nd.name].x; nd.y = pos[nd.name].y; } });
}

// 渲染图谱（力导向 / 放射两种布局可切换）
function kgRender() {
    const dom = document.getElementById('kgChart');
    if (!dom) return;
    if (!panelVisible('analysisTabPanel')) return; // 页签隐藏期间跳过，切换页签时再渲染
    if (currentView !== 'graph') return; // 四视图合并后：关联图谱视图未激活时跳过，切换视图时再渲染
    if (!window.echarts) { setTimeout(kgRender, 500); return; }
    if (!kgChart) {
        kgChart = echarts.getInstanceByDom(dom) || echarts.init(dom);
        kgChart.on('click', (params) => {
            if (params.dataType === 'node' && params.data && params.data.kp) kgSelectNode(params.data.name);
        });
    }

    const { kpSet, edges } = kgBuildGraph();
    const statEl = document.getElementById('kgStat');

    const kpCount = Object.keys(kpSet).length;
    // 范围内无证据节点计数（none 已学未检测 + unlearned 未学）：统计条后缀「含未检测 N」，灰色编码可辨
    const noEvCount = Object.values(kpSet).filter(n => {
        const st = evidenceStateOf(n.name).state;
        return st === 'none' || st === 'unlearned';
    }).length;
    // 画布只画知识点与知识点间关系，不再统计/展示「关联节点」数
    if (statEl) statEl.innerHTML = `知识点 <b>${kpCount}</b> · 关联边 <b>${edges.length}</b>` +
        (noEvCount ? `<span style="color:#94a3b8">（含未检测 ${noEvCount}）</span>` : '');

    if (!kpCount) {
        kgChart.clear();
        kgChart.setOption({
            graphic: [{ type: 'text', left: 'center', top: 'middle', style: { text: '请至少选择一个知识模块或开启一类关系', fill: '#94a3b8', fontSize: 13 } }]
        });
        return;
    }

    // 断层警示：节点角标口径与图谱诊断断层卡一致（kgCollectFaults：掌握度<60 且有证据，最多 5 项）
    const kgFaultNames = new Set(kgCollectFaults().map(f => f.node.name));

    const nodes = [];
    Object.values(kpSet).forEach(n => {
        const info = kgIndex.byName[n.name];
        const isFault = kgFaultNames.has(n.name);
        // 证据四态灰色编码：none/unlearned 恒灰+降透明度（勾选「查看全部知识点」后仍灰，可分辨无数据节点）；
        // 无证据节点不展示掌握度（未知 ≠ 未掌握）
        const ev = evidenceStateOf(n.name);
        const noEv = ev.state === 'none' || ev.state === 'unlearned';
        const size = kgState.layout === 'radial' ? [0, 24, 13, 8][n.level] : [0, 28, 15, 9][n.level];
        // 节点填充色 = 掌握度档位色（红/黄/绿），不再按所属模块取色；断层节点另加红色描边 + 光晕强调
        const hex = noEv ? '#94a3b8' : statusOf(masteryOf(n)).hexColor;
        nodes.push({
            name: n.name, kp: true, level: n.level, module: info.module, path: info.path,
            value: noEv ? null : Math.round(masteryOf(n) * 10) / 10, fault: isFault,
            evState: ev.state, evSource: ev.source || null, noEv,
            symbol: 'circle', symbolSize: size,
            itemStyle: {
                color: hex,
                opacity: noEv ? 0.55 : 1,
                borderColor: isFault ? '#b91c1c' : '#fff',
                borderWidth: isFault ? 3 : (n.level === 1 ? 2 : 1),
                shadowColor: isFault ? 'rgba(239, 68, 68, 0.55)' : 'transparent',
                shadowBlur: isFault ? 12 : 0
            },
            label: {
                show: kgState.labelMode === 'all' || (kgState.labelMode === 'compact' && n.level <= 2),
                position: 'right', distance: 4,
                color: noEv ? '#94a3b8' : (n.level === 1 ? '#1e293b' : '#475569'),
                fontSize: n.level === 1 ? 11.5 : 10.5,
                fontWeight: n.level === 1 ? 700 : 500
            }
        });
    });

    if (kgState.layout === 'radial') kgRadialPositions(nodes, kpSet, dom);

    const links = edges.map(e => {
        const def = KP_RELATION_DEFS[e.rel];
        // 断层边：指向断层节点(与断层卡同口径) 且前置有证据且未牢固(<70) 的前置边，红色加粗警示——红边即断层卡上的根因链；
        // 无证据前置不算断层（未知 ≠ 未掌握），与 weakestPrereqEvidence 口径一致（history 用历史得分率）
        let broken = false;
        if (e.rel === 'prerequisite' && kgFaultNames.has(e.target)) {
            const sInfo = kgIndex.byName[e.source];
            const sEv = sInfo ? evidenceStateOf(e.source) : null;
            broken = !!(sEv && (sEv.state === 'period' || sEv.state === 'history') && sEv.rate < 70);
        }
        return {
            source: e.source, target: e.target, rel: e.rel, broken,
            lineStyle: {
                color: broken ? '#ef4444' : def.color,
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
        labelLayout: { hideOverlap: true },
        emphasis: { focus: 'adjacency', scale: 1.15 },
        lineStyle: { curveness: 0.18 },
        data: nodes,
        links: links
    };
    if (kgState.layout === 'force') {
        series.layout = 'force';
        series.force = { repulsion: 170, edgeLength: [40, 120], gravity: 0.15, friction: 0.2 };
    } else {
        series.layout = 'none';
    }

    kgChart.setOption({
        tooltip: {
            confine: true,
            formatter: (p) => {
                if (p.dataType === 'edge') {
                    const d = KP_RELATION_DEFS[p.data.rel];
                    const warn = p.data.broken ? '<br><span style="color:#ef4444;font-weight:700">⚠ 前置未牢固、后续已脱节，疑似学习断层</span>' : '';
                    return `<b>${d.name}</b><br>${escapeHTML(p.data.source)} → ${escapeHTML(p.data.target)}${warn}`;
                }
                const d = p.data;
                if (d.noEv) {
                    return `<b>${escapeHTML(d.name)}</b><br>${['', '一级', '二级', '三级'][d.level]}知识点 · ${escapeHTML(d.module)}<br><span style="color:#94a3b8">${d.evState === 'unlearned' ? '教学进度未到 · 未检测' : '已学 · 本期暂无作答证据（未知 ≠ 未掌握）'}</span>`;
                }
                const hisTip = d.evState === 'history' ? `<br>历史证据：${escapeHTML(d.evSource || '周期外检测')}（本期未考查）` : '';
                const faultTip = d.fault ? '<br><span style="color:#ef4444;font-weight:700">⚠ 断层薄弱（掌握度 <60%），点击查看关联详情</span>' : '';
                return `<b>${escapeHTML(d.name)}</b><br>${['', '一级', '二级', '三级'][d.level]}知识点 · ${escapeHTML(d.module)}<br>班级掌握度：${d.value}%${hisTip}${faultTip}`;
            }
        },
        series: [series]
    }, true);

    if (kgState.selected) kgChart.dispatchAction({ type: 'highlight', seriesIndex: 0, name: kgState.selected });
}

// 选中知识点：图谱高亮 + 详情面板
function kgSelectNode(name) {
    kgState.selected = name;
    kgRenderDetail(name);
    if (kgChart && name && kgIndex.byName[name]) {
        kgChart.dispatchAction({ type: 'downplay', seriesIndex: 0 });
        kgChart.dispatchAction({ type: 'highlight', seriesIndex: 0, name });
    }
}

function kgRenderDetail(name) {
    const panel = document.getElementById('kgDetailPanel');
    if (!panel) return;
    if (!name || !kgIndex.byName[name]) {
        panel.innerHTML = `<div class="kg-detail-empty"><i class="fas fa-hand-pointer"></i><p>点击图谱中的节点<br>查看知识点关联详情</p></div>`;
        return;
    }

    const info = kgIndex.byName[name];
    const n = info.node;
    const children = n.children || [];
    const descCount = flattenTree(n, false).length - 1;
    // 证据四态：无证据节点头部显示「未检测」（不展示演示掌握度）；history 用历史得分率
    const ev = evidenceStateOf(name);
    const noEv = ev.state === 'none' || ev.state === 'unlearned';
    const shownMastery = ev.state === 'history' ? ev.rate : masteryOf(n);
    const st = noEv ? null : statusOf(shownMastery);
    const entry = kgEntryOf(name);

    const GROUPS = [
        { key: 'prerequisite', title: '前置知识', color: KP_RELATION_DEFS.prerequisite.color, kp: true },
        { key: 'followUps', title: '后续知识', color: KP_RELATION_DEFS.prerequisite.color, kp: true },
        { key: 'confusable', title: '易混淆知识点', color: KP_RELATION_DEFS.confusable.color, kp: true },
        { key: 'examAbility', title: '考查能力', color: KP_RELATION_DEFS.examAbility.color, tag: '能力' },
        { key: 'requireAbility', title: '依赖能力', color: KP_RELATION_DEFS.requireAbility.color, tag: '能力' },
        { key: 'questionType', title: '考查题型', color: KP_RELATION_DEFS.questionType.color, tag: '题型' },
        { key: 'methods', title: '常用方法', color: KP_RELATION_DEFS.method.color, tag: '方法' },
        { key: 'errorPoints', title: '题型易错点', color: KP_RELATION_DEFS.errorPoint.color, tag: '易错点' }
    ];

    const relRow = (target, tag, dotColor, count, kMastery, brokenRow) => `
        <div class="kg-rel-row${brokenRow ? ' kg-rel-broken' : ''}" data-target="${escapeHTML(target)}">
            <span class="kg-rel-dot" style="background:${dotColor}"></span>
            <span class="kg-rel-name">${escapeHTML(target)}</span>
            <span class="kg-rel-tag">${tag}</span>
            ${kMastery !== null && kMastery !== undefined ? `<span class="kg-rel-mastery" style="color:${statusOf(kMastery).color}" title="班级掌握度">${kMastery.toFixed(0)}%</span>` : ''}
            ${brokenRow ? '<span class="kg-rel-break">断层</span>' : ''}
            ${count ? `<span class="kg-rel-count">${count} 个知识点</span>` : ''}
        </div>`;

    let relHtml = '';
    let relTotal = 0;
    GROUPS.forEach(g => {
        const map = entry[g.key] || {};
        const keys = Object.keys(map);
        if (!keys.length) return;
        relTotal += keys.length;
        const shown = keys.slice(0, 8);
        relHtml += `<div class="kg-rel-group">
            <div class="kg-rel-title" style="color:${g.color}">${g.title} <span>${keys.length}</span></div>` +
            shown.map(k => {
                const tag = g.kp
                    ? (kgIndex.byName[k] ? ['一级', '二级', '三级'][kgIndex.byName[k].level - 1] + '知识点' : '知识点')
                    : g.tag;
                // 掌握度徽标：kp 行且在索引内且有证据时展示（无证据前置不显示，未知 ≠ 未掌握）；
                // 前置行命中断层链（当前节点未掌握 <60 且前置 <70）红底警示
                const kInfo = g.kp ? kgIndex.byName[k] : null;
                const kEv = kInfo ? evidenceStateOf(k) : null;
                const kNoEv = kEv && (kEv.state === 'none' || kEv.state === 'unlearned');
                const kMastery = (kInfo && !kNoEv) ? (kEv.state === 'history' ? kEv.rate : masteryOf(kInfo.node)) : null;
                const brokenRow = g.key === 'prerequisite' && !noEv && kMastery !== null && shownMastery < 60 && kMastery < 70;
                // 行首色点 = 目标知识点自身的掌握情况（无证据灰）；非知识点（能力/题型/方法/易错点）仍按类型区分色
                const dotColor = g.kp ? (kMastery === null ? '#94a3b8' : statusOf(kMastery).hexColor) : g.color;
                return relRow(k, tag, dotColor, g.kp ? 0 : map[k].length, kMastery, brokenRow);
            }).join('') +
            (keys.length > 8 ? `<div class="kg-rel-more">… 及另外 ${keys.length - 8} 项</div>` : '') +
            `</div>`;
    });

    panel.innerHTML = `
        <div class="kg-detail-head">
            <span class="kg-detail-level">${['', '一级', '二级', '三级'][n.level]}知识点</span>
            ${noEv
                ? `<span class="kg-detail-mastery" style="color:#94a3b8" title="${ev.state === 'unlearned' ? '教学进度未到，未检测' : '已学 · 本期暂无作答证据（未知 ≠ 未掌握）'}">未检测</span>`
                : `<span class="kg-detail-mastery" style="color:${st.color}">${shownMastery.toFixed(1)}%</span>`}
        </div>
        <h4 class="kg-detail-title">${escapeHTML(name)}</h4>
        <div class="kg-detail-path">${escapeHTML(info.path)}</div>
        <div class="kg-detail-stats">
            <span>关联<b>${relTotal}</b></span>
            <span>子节点<b>${children.length}</b></span>
            <span>子孙节点<b>${descCount}</b></span>
        </div>
        <button type="button" class="kg-detail-diag-btn" id="kgDetailDiagBtn" title="查看该知识点的前后序证据与分目的加练建议">
            <i class="fas fa-diagram-project"></i> 前后序关联诊断
        </button>
        <div class="kg-detail-scroll">
            ${relHtml || '<div class="kg-detail-none">该知识点暂未维护关联关系</div>'}
        </div>`;

    // 点击关系行 → 跳转选中目标知识点 / 高亮关联节点
    panel.querySelectorAll('.kg-rel-row').forEach(row => {
        row.onclick = () => {
            const t = row.dataset.target;
            if (kgIndex.byName[t]) {
                kgSelectNode(t);
            } else if (kgChart) {
                kgChart.dispatchAction({ type: 'downplay', seriesIndex: 0 });
                kgChart.dispatchAction({ type: 'highlight', seriesIndex: 0, name: t });
            }
        };
    });

    // F14：前后序关联诊断入口（与断层卡 / 证据总览卡入口一致，打开右侧抽屉）
    const diagBtn = document.getElementById('kgDetailDiagBtn');
    if (diagBtn) diagBtn.onclick = () => openRelDiagDrawer(name);

}

// ── 统一目录（四视图共用）：按维度与视图渲染一级节点过滤器，图谱视图固定知识点模块 ──

// 能力维度目录色板（已废弃：能力节点同样按掌握度着色，保留空注释位便于检索历史代码）

// 能力维度一级索引：能力名 → 所属一级节点（热力演进行过滤用）
const ablIndex = { byName: {} };
function buildAblIndex() {
    ablIndex.byName = {};
    (AppData.abilityTree.children || []).forEach(m => {
        flattenTree(m, false).forEach(n => { ablIndex.byName[n.name] = m.name; });
    });
}

// 统一目录状态：图谱视图固定消费知识点模块状态；其余视图随当前维度（两维度各自保持互不干扰）
function dirStateOf() {
    if (currentDimension === 'kp' || currentView === 'graph') return kgState.modules;
    if (!kgState.abilityModules) {
        kgState.abilityModules = {};
        (AppData.abilityTree.children || []).forEach(m => { kgState.abilityModules[m.name] = true; });
    }
    return kgState.abilityModules;
}

// 目录过滤变化后刷新当前视图（四视图各自在渲染层过滤，统计口径不受影响）
function refreshViewsForDir() {
    if (currentView === 'tree') initTreeChart();
    else if (currentView === 'heat') renderHeatView();
    else if (currentView === 'table') renderTable(currentTableMode);
    else kgRender();
}

// 左侧统一目录：色点 + 名称 + 得分率徽章 + 覆盖/计数徽章（替代原静态章节目录）
function kgRenderModules() {
    const listEl = document.getElementById('kgModuleList');
    if (!listEl) return;
    const useKpDir = currentDimension === 'kp' || currentView === 'graph';
    const tree = useKpDir ? AppData.kpTree : AppData.abilityTree;
    const state = useKpDir ? kgState.modules : (kgState.abilityModules || (kgState.abilityModules = {}));
    const modules = (tree.children || []);
    // 范围开关联动目录：默认（未勾选）仅显示周期学情包含的知识点模块（零覆盖模块行隐藏，计数随可见集合）；
    // 勾选后显示全部（零覆盖模块琥珀警示 + 可开关）；能力目录无证据概念不受影响；隐藏模块的开关状态字典保留，恢复显示不丢
    const dirModules = (useKpDir && !showAllKp)
        ? modules.filter(m => kpModuleCoverage(m.name).covered > 0)
        : modules;
    listEl.innerHTML = dirModules.map(m => {
        const on = state[m.name] !== false;
        const count = flattenTree(m, false).length;
        const st = statusOf(masteryOf(m));
        // 知识点目录：纯计数升级为覆盖徽章「已考x/y」（有检测证据 period+history / 子树总数）；
        // 零覆盖模块降饱和 + 得分率徽章替换为「未检测」（未知 ≠ 未掌握，不展示误导性得分率）
        const cov = useKpDir ? kpModuleCoverage(m.name) : null;
        const zeroCov = !!cov && cov.covered === 0;
        // 目录色点 = 该模块（或能力）的掌握度档位色，无检测证据恒灰；与图谱节点 / 表格同一套掌握度配色，不再按类型取色
        const dotColor = zeroCov ? '#94a3b8' : st.hexColor;
        const countHtml = cov
            ? `<span class="kg-mod-cov${zeroCov ? ' zero' : ''}" title="本期已检测 ${cov.covered} / 共 ${cov.total} 个知识点（含周期外历史证据）">已考${cov.covered}/${cov.total}</span>`
            : `<span class="kg-mod-count">${count}</span>`;
        const scoreHtml = zeroCov
            ? `<span class="kg-mod-score kg-mod-none" title="本期任务未覆盖该模块，暂无作答证据（未知 ≠ 未掌握）">未检测</span>`
            : `<span class="kg-mod-score" style="color:${st.hexColor};background:${st.hexColor}1a" title="周期汇总得分率">${Math.round(masteryOf(m))}%</span>`;
        return `<div class="kg-module-item ${on ? '' : 'off'}${zeroCov ? ' zero-coverage' : ''}" data-module="${escapeHTML(m.name)}">
            <i class="kg-mod-dot" style="background:${dotColor}"></i>
            <span class="kg-mod-name">${escapeHTML(m.name)}</span>
            ${scoreHtml}
            ${countHtml}
        </div>`;
    }).join('');
    listEl.querySelectorAll('.kg-module-item').forEach(item => {
        item.onclick = () => {
            state[item.dataset.module] = state[item.dataset.module] === false;
            kgRenderModules();
            refreshViewsForDir();
        };
    });
    const onCnt = dirModules.filter(m => state[m.name] !== false).length;
    const cntEl = document.getElementById('kgModuleCount');
    if (cntEl) cntEl.innerText = `${onCnt}/${dirModules.length}`;
    const titleEl = document.getElementById('dirTitle');
    if (titleEl) titleEl.innerText = useKpDir ? '知识模块' : '核心素养';
    // 「查看全部知识点」复选框：仅知识点目录显示（能力树无证据状态概念；图谱视图固定知识点树故恒显）；勾选态与 showAllKp 同步
    const showAllWrap = document.getElementById('kgShowAllWrap');
    const showAllBox = document.getElementById('kgShowAll');
    if (showAllWrap) {
        showAllWrap.style.display = useKpDir ? '' : 'none';
        if (showAllBox && showAllBox.checked !== showAllKp) showAllBox.checked = showAllKp;
    }
}

// 掌握度色阶图例项（与 statusOf / 图谱节点 / 目录色点同源；withGray 控制是否附「无证据」灰项）
function masteryLegendItemsHtml(withGray) {
    const n = masteryLevels.length;
    const items = masteryLevels.map((lv, i) => {
        const range = i === 0 ? `≥${lv.min}%` : (i === n - 1 ? `<${lv.max}%` : `${lv.min}~${lv.max}%`);
        return `<span class="legend-item"><i class="dot" style="background:${masteryTierHex(i, n)}"></i>${lv.name} ${range}</span>`;
    }).join('');
    return items + (withGray ? '<span class="legend-item"><i class="dot" style="background:#94a3b8"></i>暂无证据 / 未学</span>' : '');
}

// 底部图例：节点掌握度色阶 + 画布可见关系线型（能力/题型/方法/易错点类关系不上画布，故不入图例）
function kgRenderLegend() {
    const el = document.getElementById('kgLegend');
    if (!el) return;
    const relItems = KG_CANVAS_RELATIONS.map(k => {
        const d = KP_RELATION_DEFS[k];
        return `<span class="legend-item" title="${escapeHTML(d.name)}">` +
            `<i class="kg-leg-line" style="border-color:${d.color};border-top-style:${d.lineType}"></i>${d.short}</span>`;
    }).join('');
    // 知识点节点颜色 = 掌握程度（红/黄/绿）而非模块类型；关系线型只覆盖画布上实际会出现的两类关系
    el.innerHTML = `<span class="legend-item kg-leg-title">节点掌握度</span>` + masteryLegendItemsHtml(true) +
        '<i class="kg-leg-sep"></i>' + relItems +
        `<span class="legend-item" style="margin-left:auto;color:#94a3b8">红描边 = 断层薄弱 · 箭头表示关联方向 · 能力/题型/方法/易错点关系见节点详情</span>`;
}

// 初始化图谱：索引构建 + 工具栏事件绑定 + 首次渲染
function initKnowledgeGraph() {
    kgBuildIndex();
    buildAblIndex();
    (AppData.kpTree.children || []).forEach(m => { kgState.modules[m.name] = true; });

    kgRenderModules();
    kgRenderLegend();

    // 布局切换：力导向 / 放射
    const btnForce = document.getElementById('kgBtnForce');
    const btnRadial = document.getElementById('kgBtnRadial');
    if (btnForce && btnRadial) {
        btnForce.onclick = () => {
            kgState.layout = 'force';
            btnForce.classList.add('active');
            btnRadial.classList.remove('active');
            kgRender();
        };
        btnRadial.onclick = () => {
            kgState.layout = 'radial';
            btnRadial.classList.add('active');
            btnForce.classList.remove('active');
            kgRender();
        };
    }

    // 适应画布：重置缩放平移，放射布局重算坐标即自适应
    const btnFit = document.getElementById('kgBtnFit');
    if (btnFit) btnFit.onclick = () => {
        if (!kgChart) return;
        kgChart.dispatchAction({ type: 'restore' });
        if (kgState.layout === 'radial') kgRender();
    };

    // 单选 chip 组（深度 / 标签）
    const bindChipGroup = (groupId, handler) => {
        const group = document.getElementById(groupId);
        if (!group) return;
        group.querySelectorAll('.kg-chip').forEach(chip => {
            chip.onclick = () => {
                group.querySelectorAll('.kg-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                handler(chip.dataset);
            };
        });
    };
    bindChipGroup('kgDepthGroup', (d) => { kgState.depth = Number(d.depth); kgRender(); });
    bindChipGroup('kgLabelGroup', (d) => { kgState.labelMode = d.label; kgRender(); });

    // 关系开关（多选）
    const relGroup = document.getElementById('kgRelationGroup');
    if (relGroup) {
        relGroup.querySelectorAll('.kg-chip').forEach(chip => {
            chip.onclick = () => {
                const key = chip.dataset.rel;
                kgState.rels[key] = !kgState.rels[key];
                chip.classList.toggle('active', kgState.rels[key]);
                kgRender();
            };
        });
    }

    // 仅看有关联的知识点（画布边只剩 kp↔kp，非知识点节点不参与）
    const chkOnly = document.getElementById('kgOnlyRelated');
    if (chkOnly) chkOnly.onchange = (e) => { kgState.onlyRelated = e.target.checked; kgRender(); };

    // 「查看全部知识点」范围开关：目录行 + 树状图 / 表格 / 关联图谱同步过滤（渲染层，统计口径不动）；
    // 热力演进不随开关变化（XK-06.4）
    const showAllBox = document.getElementById('kgShowAll');
    if (showAllBox) showAllBox.onchange = () => {
        showAllKp = showAllBox.checked;
        kgRenderModules();      // 零覆盖模块行随开关显隐（勾选态同步在 kgRenderModules 内，程序设 checked 不触发 onchange）
        refreshViewsForDir();
    };

    kgRender();
    kgSelectNode('对数函数');   // 默认选中示例节点（断层演示链：38% 未掌握 + 前置根因，展示关联详情与红色入口；原「相等向量与共线向量」已划入本期未检测例外）
    renderKgDiagnosis();                    // 首次渲染图谱诊断模块（需 kgIndex 已构建）
}

/* ---------------- 周期分析渲染（整合自班级周期分析报告） ---------------- */

// 环比基准：学年/月/周档取上一周期演示基准；自定义档取「起始日期前的等长前置窗口」（与自定义区间同天数），
// 窗口内无任务时返回 null → 全链路不显示环比（KPI delta / 摘要徽章 / 结论文案）
function currentPrevBase() {
    const active = document.querySelector('#timeSegment .segment-btn.active');
    const seg = active ? active.textContent.trim() : '月';
    if (seg !== '自定义') return { rate: prevPeriodRate, gradeRate: prevPeriodGradeRate, label: '上一周期', tasks: null };
    const sEl = document.getElementById('customDateStart'), eEl = document.getElementById('customDateEnd');
    if (!sEl || !eEl || !sEl.value || !eEl.value) return null;
    const s = new Date(sEl.value + 'T00:00:00'), e = new Date(eEl.value + 'T00:00:00');
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return null;
    const len = Math.round((e - s) / 86400000) + 1;                    // 自定义区间天数
    const ps = new Date(s.getTime() - len * 86400000);                // 前置窗口起 = 起始日前推 len 天
    const pe = new Date(s.getTime() - 86400000);                      // 前置窗口止 = 起始日前 1 天
    const inWin = periodTasks.filter(t => {
        const d = new Date(t.date + 'T00:00:00');
        return d >= ps && d <= pe;
    });
    if (!inWin.length) return null;                                   // 环比窗口无任务 → 无环比数据
    const r1 = v => Math.round(v * 10) / 10;
    const fmt = d => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
        rate: r1(inWin.reduce((a, t) => a + t.classRate, 0) / inWin.length),
        gradeRate: r1(inWin.reduce((a, t) => a + t.gradeRate, 0) / inWin.length),
        label: `环比窗口${fmt(ps)}~${fmt(pe)}`,
        tasks: inWin.length
    };
}

// 周期指标计算：加权均值、稳定度、环比、趋势判定、顽固薄弱
function calcPeriodStats() {
    const rates = periodTasks.map(t => t.classRate);
    const n = rates.length;
    const mean = rates.reduce((a, b) => a + b, 0) / n;
    const sd = Math.round(Math.sqrt(rates.reduce((a, v) => a + (v - mean) ** 2, 0) / n) * 10) / 10;
    const pRate = Math.round(mean * 10) / 10;
    // 年级平均得分率：与班级同口径（纳入统计任务的 gradeRate 均值）
    const gRate = Math.round(periodTasks.reduce((a, t) => a + t.gradeRate, 0) / n * 10) / 10;
    const prevBase = currentPrevBase();
    const dRate = prevBase ? Math.round((pRate - prevBase.rate) * 10) / 10 : null;          // 无环比基准 → null（不显示环比）
    const gDRate = prevBase ? Math.round((gRate - prevBase.gradeRate) * 10) / 10 : null;   // 年级环比同链路
    const prog = Math.round((rates[n - 1] - rates[0]) * 10) / 10;
    const max = Math.max(...rates), min = Math.min(...rates);
    const winCnt = periodTasks.filter(t => t.classRate > t.gradeRate).length;
    const exams = periodTasks.filter(t => t.type === 'exam');
    const examWin = exams.filter(t => t.classRate > t.gradeRate).length;

    let trend;
    const trendBase = dRate !== null ? dRate : prog;   // 环比缺失时趋势判定回退周期内首尾进步幅度
    if (trendBase >= 3) trend = '显著回升';
    else if (trendBase >= 1) trend = '缓慢回升';
    else if (trendBase > -1) trend = '基本持平';
    else if (trendBase > -3) trend = '缓慢下滑';
    else trend = '明显下滑';

    // 顽固薄弱：该考核项失分率 ≥40% 的已考查场次 ≥3（结构性问题）
    const heatRows = heatData[currentDimension].map(r => {
        const valid = r.values.filter(v => v !== null);
        const avg = valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 0;
        return { name: r.name, avg, heavyCnt: r.values.filter(v => v !== null && v >= 40).length };
    });
    const stubSorted = heatRows.filter(r => r.heavyCnt >= 3).sort((a, b) => b.avg - a.avg);

    return {
        total: n, pRate, gRate, dRate, gDRate, prevBase, prog, sd, stable: Math.round((100 - sd) * 10) / 10,
        max, min, range: Math.round((max - min) * 10) / 10,
        winCnt, examCnt: exams.length, examWin, assignCnt: n - exams.length,
        trend, stubSorted
    };
}

// 周期概览统计口径：作业/考试整体视角，取全部维度（kp + ability）体系树的末级（叶子）节点，
// 不随「知识点/能力」维度切换；与 calcPeriodStats.stubSorted（当前维度混合层级，供知识点分析页签消费）区分
function periodLeafNodes() {
    return flattenTree(AppData.kpTree, true).concat(flattenTree(AppData.abilityTree, true))
        .filter(n => !n.children || !n.children.length);
}

// 全维度末级顽固薄弱：heatData 两维度行先按末级节点名过滤，再按 ≥3 场失分率 ≥40% 判定，按场均失分率降序
function periodLeafStubs() {
    const leafNames = {};
    periodLeafNodes().forEach(n => { leafNames[n.name] = true; });
    return heatData.kp.concat(heatData.ability)
        .filter(r => leafNames[r.name])
        .map(r => {
            const valid = r.values.filter(v => v !== null);
            const avg = valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 0;
            return { name: r.name, avg, heavyCnt: r.values.filter(v => v !== null && v >= 40).length };
        })
        .filter(r => r.heavyCnt >= 3)
        .sort((a, b) => b.avg - a.avg);
}

// 周期趋势图：本班 vs 年级 vs 上周期基准（考试▲ / 作业●）
function initPeriodTrendChart() {
    const dom = document.getElementById('periodTrendChart');
    if (!dom) return;
    if (!panelVisible('summaryTabPanel')) return; // 「学情汇总」页签隐藏期间跳过，切换页签时再渲染
    if (!window.echarts) { setTimeout(initPeriodTrendChart, 150); return; }
    // 高 DPR 屏限制渲染像素密度（canvas 物理像素减半，提速明显且肉眼无差异）；
    // animation:false 免入场动画，setOption 后瞬时呈现
    if (!periodTrendChart) periodTrendChart = echarts.getInstanceByDom(dom) || echarts.init(dom, null, { devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2) });

    const labels = periodTasks.map(t => `${t.name}\n${t.date.slice(5)}`);
    periodTrendChart.setOption({
        animation: false,
        tooltip: {
            trigger: 'axis',
            formatter: (params) => {
                const t = periodTasks[params[0].dataIndex];
                return `<b>${t.full}</b>（${t.type === 'exam' ? '考试' : '作业'} · ${t.date}）<br>` +
                    params.map(p => `${p.marker}${p.seriesName}：<b>${p.value}%</b>`).join('<br>');
            }
        },
        grid: { left: 48, right: 30, top: 40, bottom: 52 },
        xAxis: {
            type: 'category', data: labels, boundaryGap: false,
            axisLabel: { interval: 0, fontSize: 11, color: '#64748b', lineHeight: 16 },
            axisTick: { show: false }, axisLine: { lineStyle: { color: '#e2e8f0' } }
        },
        yAxis: {
            type: 'value', min: 55, max: 85, name: '得分率(%)',
            nameTextStyle: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#f1f5f9' } },
            axisLabel: { color: '#94a3b8' }
        },
        series: [
            {
                name: '本班得分率', type: 'line', smooth: true, z: 3,
                data: periodTasks.map(t => ({
                    value: t.classRate,
                    symbol: t.type === 'exam' ? 'triangle' : 'circle',
                    symbolSize: t.type === 'exam' ? 12 : 9
                })),
                lineStyle: { width: 3, color: '#3b82f6' },
                itemStyle: { color: '#3b82f6', borderColor: '#fff', borderWidth: 1.5 },
                areaStyle: { color: 'rgba(59, 130, 246, 0.07)' },
                label: {
                    show: true, position: 'top', fontSize: 11, fontWeight: 700, color: '#2563eb',
                    formatter: (p) => p.value + '%'
                },
                markLine: {
                    silent: true, symbol: ['none', 'none'],
                    lineStyle: { color: '#ef4444', type: 'dotted', width: 1.5 },
                    label: { formatter: `上一周期 ${prevPeriodRate}%`, position: 'insideEndTop', color: '#ef4444', fontSize: 11 },
                    data: [{ yAxis: prevPeriodRate }]
                }
            },
            {
                name: '年级得分率', type: 'line', smooth: true,
                data: periodTasks.map(t => t.gradeRate),
                symbol: 'circle', symbolSize: 6,
                lineStyle: { width: 2, type: 'dashed', color: '#94a3b8' },
                itemStyle: { color: '#94a3b8' }
            }
        ]
    }, true);
    periodTrendChart.resize();
}

// 周期结论规则表：when(s) 决定条目是否出现，cls(s) 定语义色，build(s) 生成文案；
// 所有数字来自 calcPeriodStats() 实时计算，新增结论类型只需追加规则项
const INSIGHT_RULES = [
    {
        id: 'trend', when: () => true, cls: () => 'i-blue',
        build: s => s.dRate !== null
            ? `班级平均得分率 <b>${s.pRate}%</b>，环比 <b class="${s.dRate >= 0 ? 'up' : 'down'}">${s.dRate > 0 ? '+' : ''}${s.dRate}%</b>；最近一次较最早一次 <b class="${s.prog >= 0 ? 'up' : 'down'}">${s.prog > 0 ? '+' : ''}${s.prog}%</b>，趋势判定为「<b>${s.trend}</b>」。`
            : `班级平均得分率 <b>${s.pRate}%</b>，<b>无环比数据</b>（环比窗口内无任务）；周期内最近一次较最早一次 <b class="${s.prog >= 0 ? 'up' : 'down'}">${s.prog > 0 ? '+' : ''}${s.prog}%</b>，趋势判定为「<b>${s.trend}</b>」（环比缺失，按周期内首尾判定）。`
    },
    {
        id: 'stable', when: () => true,
        cls: s => s.sd >= 5 ? 'i-red' : (s.sd >= 3 ? 'i-amber' : 'i-green'),
        build: s => `稳定度 <b>${s.stable}</b>（标准差 ${s.sd}），最高 <b>${s.max}%</b> / 最低 <b>${s.min}%</b>，极差 ${s.range}%，${s.sd >= 5 ? '波动偏大，提升尚未稳定' : (s.sd >= 3 ? '波动中等，需关注状态起伏' : '表现稳定')}。`
    },
    {
        id: 'grade', when: () => true,
        cls: s => s.winCnt >= s.total * 0.6 ? 'i-green' : (s.winCnt < s.total * 0.4 ? 'i-red' : 'i-amber'),
        build: s => {
            const loseList = periodTasks.filter(t => t.classRate <= t.gradeRate)
                .map(t => `「${t.name}」（${t.classRate}% vs 年级 ${t.gradeRate}%）`);
            return `${s.total} 次任务中 <b>${s.winCnt} 次</b>高于年级均${loseList.length ? `，仅 ${loseList.join('、')} 落后` : ''}；其中考试 ${s.examWin}/${s.examCnt} 领先。`;
        }
    },
    {
        id: 'stub', when: s => s.stubSorted.length > 0, cls: () => 'i-red',
        build: s => `<b>${s.stubSorted.length}</b> 个末级知识点命中顽固薄弱（≥3 次失分率 ≥40%，含能力维度）：<b>${s.stubSorted.map(k => escapeHTML(k.name)).join('、')}</b>，属结构性问题，建议安排专项复习而非重复讲题。`
    },
    {
        id: 'advice', when: s => s.stubSorted.length > 0, cls: () => 'i-amber',
        build: s => {
            const worst = s.stubSorted[0];
            return `优先针对「<b>${escapeHTML(worst.name)}</b>」（累计失分率 ${worst.avg}%）安排专项课时，下阶段验证目标：失分率降至 40% 以下。`;
        }
    }
];

// 周期结论（规则表驱动生成，见 INSIGHT_RULES）
function renderPeriodInsights() {
    const s = calcPeriodStats();
    s.stubSorted = periodLeafStubs();   // 周期结论属周期概览：顽固薄弱按全维度末级口径，不随维度切换
    const items = INSIGHT_RULES.filter(r => r.when(s)).map(r => ({ cls: r.cls(s), html: r.build(s) }));

    El.periodInsightList.innerHTML = items.map(it =>
        `<div class="insight-item ${it.cls}"><div>${it.html}</div></div>`).join('');

    El.periodStatHint.innerText =
        `统计区间：近一月 · 纳入 ${s.total} 次任务（作业 ${s.assignCnt} · 考试 ${s.examCnt}）· 对比基准：上一周期 ${prevPeriodRate}%`;
}

/* ---------------- 学生阶段性学情状态判定（V2.0 方案；完整判定规则见 PRD XK-10） ----------------
   原型阶段说明：暂无真实数据接入，本页状态与判定数字（前后半段差值 / 低于·高于平时水平次数 /
   有效场次 / 平均得分率 / 与班级平均差）均为「模拟数据」，由 stSimStatus 按学号稳定生成，
   仅用于演示 UI 与状态联动（KPI 卡 / 需关注弹层 / 列表徽章 同源）。
   判定算法（留一法残差 / MAD 个人波动带 / 低位双条件 / 持续性确认 / 阈值分学科校准）不在原型内实时执行，
   完整规则以 PRD 抽屉 XK-10「学生状态判定规则（V2.0）」为准，待真实数据接入后据此实现。
   状态名沿用教学语言：待观察 / 断崖下跌 / 持续低位 / 低位回升 / 明显进步 / 平稳（V2.0 新增「待观察」，
   样本不足不归入平稳）；徽章悬停只给一句话结论（前后半段差多少 + 几次超出平时水平），
   不向教师展示 Δ_th / SD_r / MAD 等口径；完整口径集中在学生列表标题旁小问号的「状态判定说明」浮层。 */

// 学生名册（按截图学号降序，刘鸿锦(40313) 为默认选中）；置于顶层供状态引擎与周期概览 KPI 卡共用
const ST_STUDENTS = [
    { id: 40320, name: '孙壮峰', starred: true },
    { id: 40319, name: '史津谊', starred: true },
    { id: 40318, name: '梅瑞颖', starred: true },
    { id: 40317, name: '马馨然', starred: false },
    { id: 40316, name: '马天翼', starred: false },
    { id: 40315, name: '吕馨凝', starred: false },
    { id: 40314, name: '刘星宇', starred: false },
    { id: 40313, name: '刘鸿锦', starred: true },
    { id: 40312, name: '李梓轩', starred: false },
    { id: 40311, name: '李世贤', starred: false },
    { id: 40310, name: '李沐阳', starred: false },
    { id: 40309, name: '黄晨阳', starred: false },
    { id: 40308, name: '韩秉正', starred: false },
    { id: 40307, name: '韩冰月', starred: false },
    { id: 40306, name: '甘子玉', starred: false },
    { id: 40305, name: '杜新泽', starred: false },
    { id: 40304, name: '杜博轩', starred: false }
];

// 基于学号的稳定伪随机（同一学生刷新后演示数据不变）
function stSeed(seed) {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
}

// 判定规则参数（V2.0 口径常量，与 PRD XK-10 规则一一对应；原型仅用于生成模拟判定数字，不据此实时计算）
const ST_STATUS_RULES = {
    deltaTh: 8,            // Δ 阈值（%）：默认 8；真实口径 Δ_th = max(8, sdDeltaK × SD_Δ)，分学科分年级校准
    sdDeltaK: 0.8,         // Δ_th 校准系数：0.8 × 同年级同学科历史 Δ 的标准差
    bandK: 1.5,            // 个人波动带 = 历史残差 median ± bandK × σ（σ = madK × MAD）
    madK: 1.4826,          // MAD → σ 转换系数（正态一致性常数）
    bandWinMax: 8,         // 波动带历史窗口上限 K（5~8 场）
    bandWinMin: 3,         // 波动带历史残差最少场次：不足用班级残差标准差替代，标「波动带近似」
    bandMin: 6,            // 波动带半宽下限（%）：防样本少 / 波动小导致带过窄而噪声误触发
    confirmBreaks: 2,      // 后半段异动场次下限（持续性确认，进步/退步对称）
    minTasks: 4,           // 周期最少有效场次 n ≥ 4
    minHalf: 2,            // 前 / 后半段各 ≥ 2 场（floor(n/2) 分段）
    lowP: 60,              // 低位水平线（%）：avg_p < 60 且 avg_r < −lowRSDK × SD_r 双条件
    lowRSDK: 0.5,          // 低位残差系数：avg_r < −0.5 × SD_r
    midHighPct: 40,        // 中 / 高位年级分位线（%）：年级分位 ≥ 40%
    reboundEps: 2,         // 趋势无回升判定（%）：Δ ≤ 0 或 R_post ≤ R_pre + 2
    lowPeriods: 2          // 持续低位连续命中周期数：≥ 2（周期不重叠）
};

// 状态定义（V2.0 六状态，按判定优先级排序；watch=true 计入「需关注」；hint=教师语言的一句话判定口径，供图例与浮层复用）
const ST_STATUS_DEFS = {
    pending: { label: '待观察',   cls: 'wtag-pend', watch: false, advice: '样本不足不判趋势：补足有效场次（≥4 场且前/后半段各 ≥2 场）后再评估', hint: '有效作答不足 4 次，或成绩起伏过大，数据太少不判趋势' },
    cliff:   { label: '断崖下跌', cls: 'wtag-down', watch: true,  advice: '紧急排查近期诱因（状态 / 难度跳变 / 知识断层），优先个别辅导', hint: '后一半平均得分率比前一半低 8 个百分点以上，且至少 2 次明显低于平时水平' },
    low:     { label: '持续低位', cls: 'wtag-low',  watch: true,  advice: '系统性补基础：先做前置诊断，再安排同点巩固', hint: '近一个月平均得分率不到 60%，长期低于班级平均，连续两个周期没有起色' },
    lowUp:   { label: '低位回升', cls: 'wtag-up',   watch: false, advice: '干预见效：保持当前节奏，每周滚动复测确认稳定', hint: '原来长期低位，后一半比前一半高 8 个百分点以上，且至少 2 次超过平时水平' },
    up:      { label: '明显进步', cls: 'wtag-up',   watch: false, advice: '正向激励：可适度提高任务挑战度', hint: '原来中等以上，后一半比前一半高 8 个百分点以上，且有 2 次以上持续确认' },
    flat:    { label: '平稳',     cls: '',          watch: false, advice: '按既有教学节奏推进', hint: '成绩没有明显上涨或下跌' }
};

// 演示数据植入模式：让 17 人演示班覆盖 V2.0 各状态分支（状态仍由算法真实算出，非硬编码名单）
const ST_STATUS_PLANT = {
    40320: { mode: 'cliff',   base: 78 },   // 孙壮峰：中高位 → 后半段系统性下滑
    40316: { mode: 'cliff',   base: 72 },   // 马天翼
    40315: { mode: 'low',     base: 52 },   // 吕馨凝：长期低位
    40305: { mode: 'low',     base: 48 },   // 杜新泽
    40313: { mode: 'lowUp',   base: 49 },   // 刘鸿锦：低位回升（默认选中学生，演示正向反馈）
    40319: { mode: 'up',      base: 68 },   // 史津谊：明显进步
    40311: { mode: 'up',      base: 66 },   // 李世贤
    40306: { mode: 'pending', base: 51, why: 'n' },    // 甘子玉：有效场次不足（待观察）
    40307: { mode: 'pending', base: 55, why: 'band' }  // 韩冰月：波动带不可用（待观察）
};

// 单生状态（模拟）：原型无真实数据接入，状态与展示用判定数字（Δ / 波动带 L·U / 突破场次 n_low·n_high /
// 有效场次 / R_pre·R_post / avg_p·avg_r）按学号稳定模拟生成，仅用于演示 UI 与联动；
// 真实计算口径（留一法残差 / MAD 波动带 / 低位双条件 / 持续性确认 / Δ_th 校准）见 PRD XK-10，此处不实时计算。
function stSimStatus(s) {
    const R = ST_STATUS_RULES;
    const plant = ST_STATUS_PLANT[s.id] || null;
    const assigned = 6;                                        // 纳入周期的任务场次（模拟）
    const none = !plant && stSeed(s.id * 11 + 29) > 0.94;      // 个别学生全周期未提交（未学习）
    const plantWhy = plant && plant.mode === 'pending' ? (plant.why || 'n') : null;
    // 有效场次：未学习 0 / 待观察(why=n) 2 / 待观察(why=band) 4 / 其余 4~6 场
    const missed = none ? assigned : plantWhy === 'n' ? 4 : plantWhy === 'band' ? 2 : Math.floor(stSeed(s.id * 3 + 11) * 3);
    const validN = assigned - missed;
    const submitRate = Math.round(validN / assigned * 10000) / 100;
    const avgRate = none ? 0 : (plant ? plant.base : Math.round((42 + stSeed(s.id * 5 + 17) * 48) * 10) / 10);
    const distLevel = none ? '未学习' : (avgRate >= 85 ? '优秀' : avgRate >= 70 ? '良好' : avgRate >= 60 ? '合格' : '待合格');
    const level = avgRate < R.lowP ? 'low' : avgRate < 85 ? 'mid' : 'high';

    // 状态判定（模拟 V2.0 优先级）：待观察 > 断崖下跌 > 持续低位 > 低位回升 > 明显进步 > 平稳
    const key = (none || plantWhy) ? 'pending' : (plant ? plant.mode : 'flat');
    const def = ST_STATUS_DEFS[key];

    // 展示用判定数字（模拟，非真实计算）
    const dir = key === 'cliff' ? -1 : (key === 'up' || key === 'lowUp') ? 1 : 0;   // 趋势方向
    const delta = key === 'pending' ? 0
        : dir === 0
            ? Math.round((stSeed(s.id * 7 + 3) - 0.5) * 2 * (R.deltaTh - 1) * 10) / 10
            : dir * Math.round((R.deltaTh + 1 + stSeed(s.id * 7 + 3) * 6) * 10) / 10;
    // 前半段残差均值：低位类起于负区、断崖下跌起于正区、其余 ±3% 内
    const rPre = key === 'pending' ? 0
        : (key === 'low' || key === 'lowUp') ? -Math.round((2 + stSeed(s.id * 23 + 9) * 8) * 10) / 10
        : key === 'cliff' ? Math.round((1 + stSeed(s.id * 23 + 9) * 4) * 10) / 10
        : Math.round((stSeed(s.id * 23 + 9) - 0.5) * 6 * 10) / 10;
    const rPost = key === 'pending' ? 0 : Math.round((rPre + delta) * 10) / 10;
    // 平均残差（低位类 < −4% 满足 avg_r < −0.5×SD_r；明显进步为正）
    const avgR = key === 'pending' ? 0
        : (key === 'low' || key === 'lowUp') ? -Math.round((4 + stSeed(s.id * 29 + 13) * 8) * 10) / 10
        : key === 'up' ? Math.round((2 + stSeed(s.id * 29 + 13) * 6) * 10) / 10
        : key === 'cliff' ? Math.round((1 + stSeed(s.id * 29 + 13) * 4) * 10) / 10
        : Math.round((stSeed(s.id * 29 + 13) - 0.5) * 8 * 10) / 10;
    // 个人波动带（模拟）：半宽 = max(bandMin, 6~10%)，中心取 avgR；
    // 待观察(why=band) = 历史残差 <3 场且无班级残差标准差替代 → 波动带不可用
    const bandOK = plantWhy !== 'band';
    const halfW = Math.round((R.bandMin + stSeed(s.id * 13 + 5) * 4) * 10) / 10;
    const bandL = bandOK ? Math.round((avgR - halfW) * 10) / 10 : null;
    const bandU = bandOK ? Math.round((avgR + halfW) * 10) / 10 : null;
    // 波动带来源：低位类与部分平稳学生历史场次少 → 班级残差标准差替代（「波动带近似」）
    const bandSrc = !bandOK ? 'none'
        : ((key === 'low' || key === 'lowUp' || key === 'pending' || (key === 'flat' && stSeed(s.id * 31 + 3) < 0.3)) ? 'approx' : 'history');
    // 突破场次：断崖下跌后半段 ≥2 场低于 L；低位回升 / 明显进步 ≥2 场高于 U；平稳 0~1 场
    const nLow = key === 'cliff' ? R.confirmBreaks + Math.floor(stSeed(s.id * 19 + 1) * 2)
        : (key === 'flat' && stSeed(s.id * 19 + 1) < 0.35) ? 1 : 0;
    const nHigh = (key === 'up' || key === 'lowUp') ? R.confirmBreaks + Math.floor(stSeed(s.id * 19 + 1) * 2)
        : (key === 'flat' && stSeed(s.id * 19 + 1) >= 0.35 && stSeed(s.id * 37 + 2) < 0.25) ? 1 : 0;

    const rec = {
        id: s.id, name: s.name, assigned, missed, submitRate, validN,
        avgRate, distLevel, level,
        delta, rPre, rPost, avgR, bandL, bandU, bandSrc, nLow, nHigh,
        key, label: def.label, cls: def.cls, watch: def.watch, advice: def.advice, hint: def.hint, reason: ''
    };

    // 悬停说明（面向教师的一句话结论）：只保留最关键的对比数字（前后半段差多少、几次低于/高于平时水平），
    // 不再展示 Δ_th / SD_r / MAD / R_pre 等判定口径；完整算法口径见 PRD XK-10，不占用教师阅读成本
    if (none) {
        rec.reason = '本周期一次都没交，暂时无法判断，需要先补交作业。';
    } else if (key === 'pending') {
        rec.reason = plantWhy === 'band'
            ? `近 ${validN} 次成绩忽高忽低，看不出稳定水平，先继续观察。`
            : `本周期只交了 ${validN} 次，次数太少，暂时无法判断趋势。`;
    } else if (key === 'cliff') {
        rec.reason = `近 ${validN} 次任务里，后一半平均得分率比前一半低 ${Math.abs(rec.delta)} 个百分点，其中 ${nLow} 次明显低于平时水平，属于明显下滑。`;
    } else if (key === 'low') {
        rec.reason = `近一个月平均得分率只有 ${avgRate}%，比班级平均低 ${Math.abs(avgR)} 个百分点，且一直没有回升。`;
    } else if (key === 'lowUp') {
        rec.reason = `原来一直在低位，后一半平均得分率比前一半高 ${rec.delta} 个百分点，其中 ${nHigh} 次超过平时水平，正在回升。`;
    } else if (key === 'up') {
        rec.reason = `后一半平均得分率比前一半高 ${rec.delta} 个百分点，其中 ${nHigh} 次超过平时水平，属于明显进步。`;
    } else {
        rec.reason = '成绩没有明显上涨或下跌，保持常规观察。';
    }
    return rec;
}

// 全部学生状态（模拟数据，一次性生成并缓存）：周期概览 KPI 卡 / 需关注弹层 / 学生学情筛选 / 列表徽章 同源
const ST_STATUS_LIST = ST_STUDENTS.map(s => stSimStatus(s));
const ST_STATUS_BY_ID = {};
ST_STATUS_LIST.forEach(r => { ST_STATUS_BY_ID[r.id] = r; });
// 需关注 = 断崖下跌 ∪ 持续低位；正向关注 = 低位回升 ∪ 明显进步（不计入需关注）；待观察不计入任何关注名单
const WATCH_FOCUS_ID_SET = new Set(ST_STATUS_LIST.filter(r => r.watch).map(r => r.id));
const WATCH_GROUPS = ['cliff', 'low', 'lowUp', 'up', 'pending'].map(k => ({
    key: k, label: ST_STATUS_DEFS[k].label, watch: ST_STATUS_DEFS[k].watch,
    note: k === 'pending' ? '数据不足 · 不计入需关注' : (ST_STATUS_DEFS[k].watch ? '' : '正向关注 · 不计入需关注'),
    advice: ST_STATUS_DEFS[k].advice, students: ST_STATUS_LIST.filter(r => r.key === k)
}));

// 「需关注学生」卡 hover 弹层：按状态分组 + 逐人判定依据（与算法同源，非硬编码名单）
function watchStudentsPopHtml() {
    return `<div class="pk-watch-pop">
        <div class="wpg-head"><b>${WATCH_FOCUS_ID_SET.size}</b> 名需关注学生 · 点击卡片查看名单</div>
        ${WATCH_GROUPS.map(g => `
            <div class="wpg-group wpg-${g.key}">
                <div class="wpg-label">${g.label} <b>${g.students.length}</b>${g.note ? `<span class="wpg-note">${g.note}</span>` : ''}</div>
                <div class="wpg-names">${g.students.length ? g.students.map(r => `<span class="wpg-stu" title="${r.reason}">${r.name}</span>`).join('、') : '<span class="wpg-none">本周期无</span>'}</div>
            </div>`).join('')}
    </div>`;
}

// 「需关注学生」弹层定位：横向右侧放不下则右对齐；纵向上方空间不足则向下弹。
// 弹层是 .content-body 滚动容器内的绝对定位元素，向上越界会被容器 overflow 裁切（表现为名单顶部被切）。
function placeWatchPop(card, pop) {
    if (!card || !pop) return;
    const rect = card.getBoundingClientRect();
    pop.classList.toggle('pk-pop-right', rect.left + 300 > window.innerWidth - 8);

    // 未悬停时弹层为 display:none，读不到高度：临时可见测量一次后按元素缓存（宽度定值 300，高度仅随名单长度变化）
    let h = Number(pop.dataset.popH || 0);
    if (!h) {
        const prevDisplay = pop.style.display;
        const prevVisibility = pop.style.visibility;
        const prevMaxHeight = pop.style.maxHeight;
        pop.style.display = 'block';
        pop.style.visibility = 'hidden';
        pop.style.maxHeight = 'none';
        h = pop.offsetHeight;
        pop.style.display = prevDisplay;
        pop.style.visibility = prevVisibility;
        pop.style.maxHeight = prevMaxHeight;
        pop.dataset.popH = String(h);
    }

    // 弹出方向：上方放得下优先向上（不遮卡片下方内容）；上方不足且下方更宽裕则向下；
    // 两侧都放不下时按较大一侧限高 + 内部滚动，保证弹层头部（表头与首组名单）不被容器裁掉
    const gap = 8;
    const clipEl = document.querySelector('.content-body');
    const clip = clipEl ? clipEl.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
    const spaceAbove = rect.top - clip.top;
    const spaceBelow = clip.bottom - rect.bottom;
    const down = spaceAbove < h + gap && spaceBelow > spaceAbove;
    pop.classList.toggle('pk-pop-down', down);
    // 3px = 卡片 hover 上浮位移（.period-kpi:hover transform），向上弹时需从可用高度中扣除，否则弹层顶部会溢出 3px
    const avail = (down ? spaceBelow : spaceAbove - 3) - gap;
    pop.style.maxHeight = avail < h ? Math.max(140, avail) + 'px' : '';
}

// 周期指标卡（迁移自校级学情报告平台 · 周期指标：六项指标与口径保持一致；
// 达标率 / 顽固薄弱两卡为作业·考试整体口径：全维度末级节点，见 periodLeafNodes/periodLeafStubs）
function renderPeriodKpis() {
    const el = El.periodKpiGrid;
    if (!el) return;
    const s = calcPeriodStats();
    // 周期概览口径：作业/考试整体视角，统计全部维度（kp+ability）末级节点，不随维度切换
    const leafStubs = periodLeafStubs();

    // 达标分布（达标 ≥80% / 薄弱 / 未掌握，未掌握阈值随档位配置联动；全维度末级节点）
    const nodes = periodLeafNodes();
    const goodCnt = nodes.filter(n => masteryOf(n) >= 80).length;
    const weakCnt = nodes.filter(n => masteryOf(n) >= unmasteredThreshold() && masteryOf(n) < 80).length;
    const poorCnt = nodes.length - goodCnt - weakCnt;
    const reachRate = nodes.length ? Math.round(goodCnt / nodes.length * 1000) / 10 : 0;

    // 年级均（与本页期间得分率同口径：各次得分率算术平均）
    const gradeAvg = Math.round(periodTasks.reduce((a, t) => a + t.gradeRate, 0) / s.total * 10) / 10;

    // 任务提交为演示口径；需关注学生与状态引擎 ST_STATUS_LIST 同源（学生学情「需关注」筛选同口径）
    const submitDemo = { total: 288, done: 276, missing: 12 };
    const focusDemo = {
        total: WATCH_FOCUS_ID_SET.size,
        cliff: WATCH_GROUPS[0].students.length,     // 断崖下跌
        low: WATCH_GROUPS[1].students.length,       // 持续低位
        lowUp: WATCH_GROUPS[2].students.length,     // 低位回升（正向，不计入需关注）
        up: WATCH_GROUPS[3].students.length,        // 明显进步（正向，不计入需关注）
        pending: WATCH_GROUPS[4].students.length,   // 待观察（样本不足，不计入需关注）
        followRate: 72
    };

    const cards = [
        {
            label: '平均得分率', ic: 'fa-chart-line', value: s.pRate, unit: '%', tone: '',
            delta: s.dRate !== null ? (s.dRate > 0 ? '+' : '') + s.dRate + '%' : null, deltaCls: s.dRate !== null && s.dRate < 0 ? 'down' : 'up',
            deltaTip: '相较于年级得分率的差值百分点（本班 − 年级）',
            tip: '周期内各次任务得分率的算术平均（按任务次数平均，非按分值加权）',
            sub: `年级均 <b>${gradeAvg}%</b>${s.prevBase ? ` · ${s.prevBase.label} <b>${s.prevBase.rate}%</b>` : ' · 无环比数据'} · 任务 ${s.total} 次`
        },
        {
            label: '稳定度', ic: 'fa-balance-scale', value: s.stable, unit: '', tone: s.sd > 5 ? 'tone-warn' : '',
            tip: '100 − 周期内各次得分率的标准差；越高越稳',
            sub: `标准差 <b>${s.sd}</b> · 最高 <b>${s.max}%</b> · 最低 <b>${s.min}%</b>`
        },
        {
            label: '知识点达标率', ic: 'fa-compass', value: reachRate, unit: '%', tone: '', goto: 'analysis',
            delta: s.dRate !== null ? '+5%' : null, deltaCls: 'up',
            deltaTip: '相较于年级知识点达标率的差值百分点（本班 − 年级）',
            tip: '全部维度（知识点+能力）末级节点中，达标（掌握度 ≥80%）节点数 ÷ 已覆盖末级节点总数；按作业/考试整体统计，不随维度切换',
            sub: `末级节点 <b>${nodes.length}</b> 个 · 达标 <b>${goodCnt}</b> · 薄弱 <b>${weakCnt}</b> · 未掌握 <b>${poorCnt}</b><span class="pk-goto-cta"><i class="fas fa-arrow-right"></i> 查看明细</span>`
        },
        {
            label: '顽固薄弱知识点', ic: 'fa-cubes', value: leafStubs.length, unit: '个', tone: 'tone-bad', goto: 'analysis-heat',
            tip: '全部维度（知识点+能力）末级节点中，同一节点在 ≥3 次不同任务失分率 ≥40%；按作业/考试整体统计，不随维度切换',
            sub: `较上周期 <b>+1</b> 个 · 已改善 2 个 · 新增 3 个<span class="pk-goto-cta"><i class="fas fa-arrow-right"></i> 查看顽固项</span>`
        },
        {
            label: '提交率', ic: 'fa-inbox', value: 95.8, unit: '%', tone: '',
            tip: '周期内任务实交人次 ÷ 应交人次（无迟交单列口径）',
            sub: `应交 <b>${submitDemo.total}</b> 人次 · 已交 <b>${submitDemo.done}</b> · 未交 <b>${submitDemo.missing}</b>`
        },
        {
            label: '需关注学生', ic: 'fa-exclamation-triangle', value: focusDemo.total, unit: '人', tone: 'tone-bad', watch: true,
            tip: '本周期成绩断崖下跌或持续低位的学生合计；低位回升、明显进步、数据不足者不计入。',
            sub: `断崖下跌 <b>${focusDemo.cliff}</b> · 持续低位 <b>${focusDemo.low}</b> · 低位回升 <b>${focusDemo.lowUp}</b> · 明显进步 <b>${focusDemo.up}</b> · 待观察 <b>${focusDemo.pending}</b><br>已跟进 <b>${focusDemo.followRate}%</b><span class="pk-watch-cta"><i class="fas fa-users"></i> 查看名单</span>`
        }
    ];

    el.innerHTML = cards.map((c, i) => `
        <div class="period-kpi ${c.tone}${c.watch ? ' pk-watch-card' : ''}${c.goto ? ' pk-goto-card' : ''}"${c.goto ? ` data-goto="${c.goto}"` : ''}>
            <div class="pk-label"><span>${c.label}</span><span class="kpi-tip ${i === cards.length - 1 ? 'tip-end' : ''}" tabindex="0" data-tip="${c.tip}">?</span></div>
            <div class="pk-value">${c.value}<span class="pk-unit">${c.unit}</span>${c.delta ? `<span class="pk-delta ${c.deltaCls}"${c.deltaTip ? ` tabindex="0" data-tip="${c.deltaTip}"` : ''}>${c.delta}</span>` : ''}</div>
            <div class="pk-sub">${c.sub}</div>
            ${c.watch ? watchStudentsPopHtml() : ''}
        </div>`).join('');

    // 需关注学生卡：点击下钻学生学情「需关注」筛选名单；弹层按视口位置选择对齐方向与弹出方向
    const watchCard = el.querySelector('.pk-watch-card');
    if (watchCard) {
        watchCard.addEventListener('click', (e) => {
            // 点标题问号只看口径说明，不下钻（与悬停名单弹层区分开）
            if (e.target.closest('.kpi-tip')) return;
            switchMainTab('students');
            if (window.StudentBridge && typeof window.StudentBridge.gotoWatchStudents === 'function') {
                window.StudentBridge.gotoWatchStudents();
            }
        });
        const watchPop = watchCard.querySelector('.pk-watch-pop');
        placeWatchPop(watchCard, watchPop);
        // 悬停 / 聚焦标题问号时收起名单弹层（两套悬浮说明不同时弹）
        watchCard.addEventListener('mouseover', (e) => {
            const tip = e.target.closest('.kpi-tip');
            const focusedTip = watchCard.querySelector('.kpi-tip:focus');
            // 鼠标移出问号即释放焦点，避免 :focus 气泡常驻后又弹名单造成重叠
            if (!tip && focusedTip) focusedTip.blur();
            watchCard.classList.toggle('pk-watch-tip-hover', !!tip);
        });
        watchCard.addEventListener('focusin', (e) => {
            if (e.target.closest('.kpi-tip')) watchCard.classList.add('pk-watch-tip-hover');
        });
        watchCard.addEventListener('focusout', (e) => {
            if (e.target.closest('.kpi-tip')) watchCard.classList.remove('pk-watch-tip-hover');
        });
        watchCard.addEventListener('mouseleave', () => watchCard.classList.remove('pk-watch-tip-hover'));
        // 悬停前重算：筛选 / 切周期 / 滚动后卡片位置变化，弹出方向随之调整；内部滚动位置重置到表头
        watchCard.addEventListener('mouseenter', () => {
            placeWatchPop(watchCard, watchPop);
            watchPop.scrollTop = 0;
        });
        // resize 只注册一次，回调取当前卡片（本卡片随筛选多次重渲染，避免监听累积）
        if (!window.__watchPopResizeBound) {
            window.__watchPopResizeBound = true;
            window.addEventListener('resize', () => {
                const card = document.querySelector('.pk-watch-card');
                if (card) placeWatchPop(card, card.querySelector('.pk-watch-pop'));
            });
        }
    }

    // 达标率 / 顽固薄弱卡：下钻知识点分析页签（明细模块 / 热力演进视图，与摘要卡5 同口径）
    const gotoHandlers = {
        analysis: () => {
            switchMainTab('analysis');
            document.getElementById('analysisSection').scrollIntoView({ behavior: 'smooth' });
        },
        'analysis-heat': () => {
            switchMainTab('analysis');
            setHeatFocus({ stubborn: true });   // 定位当前维度顽固行（PRD：切换热力演进并定位模块），行级滚动由 renderHeatView 完成
            switchView('heat');
        }
    };
    el.querySelectorAll('.pk-goto-card').forEach(card => {
        const fn = gotoHandlers[card.dataset.goto];
        if (fn) card.addEventListener('click', fn);
    });
}

// 期间任务清单（迁移自校级学情报告平台 · 班级周期分析报告第 3 节，列字段全量对齐）
function renderPeriodTaskTable() {
    const el = El.periodTaskTableWrap;
    if (!el) return;
    const s = calcPeriodStats();
    // 年级均与本页期间得分率同口径（各次得分率算术平均）
    const gradeAvg = Math.round(periodTasks.reduce((a, t) => a + t.gradeRate, 0) / s.total * 10) / 10;
    const diff = Math.round((s.pRate - gradeAvg) * 10) / 10;
    const scoreSum = periodTasks.reduce((a, t) => a + (t.score || 0), 0);
    const submitSum = periodTasks.reduce((a, t) => a + (t.submitted || 0), 0);
    const shouldSum = 48 * s.total;          // 每次任务 48 人应交（与顶部提交率演示口径一致）
    const leafStubs = periodLeafStubs();   // 合计行薄弱项与周期概览同口径：全维度末级节点
    const worstKp = leafStubs.length ? leafStubs[0].name : '—';

    let html = '<div class="table-scroll-wrap"><table class="analysis-table period-task-table"><thead><tr>' +
        '<th>日期</th><th>任务名称</th><th>类型</th>' +
        '<th>满分</th><th>已交</th>' +
        `<th class="sortable" onclick="sortPeriodTask('classRate')">班级得分率 (%)${sortArrow('classRate')}</th>` +
        `<th class="sortable" onclick="sortPeriodTask('gradeRate')">年级得分率 (%)${sortArrow('gradeRate')}</th>` +
        '<th>差值</th>' +
        '<th>首要薄弱点</th><th>操作</th></tr></thead><tbody>';
    // 排序：复制后排序（不改原数组），合计行固定在末尾
    let rows = periodTasks.slice();
    if (periodTaskSort.key) {
        const k = periodTaskSort.key, dir = periodTaskSort.dir;
        rows.sort((a, b) => (Number(a[k]) - Number(b[k])) * dir);
    }
    rows.forEach(t => {
        const d = Math.round((t.classRate - t.gradeRate) * 10) / 10;
        html += '<tr>' +
            `<td>${t.date}</td>` +
            `<td class="task-name" title="${escapeHTML(t.full)}">${escapeHTML(t.name)}</td>` +
            `<td><span class="badge ${t.type === 'exam' ? 'badge-danger' : 'badge-primary'}">${t.type === 'exam' ? '考试' : '作业'}</span></td>` +
            `<td>${t.score ?? '—'}</td>` +
            `<td>${t.submitted ?? '—'}/48</td>` +
            `<td class="rate-cell">${t.classRate}</td>` +
            `<td class="rate-cell muted">${t.gradeRate}</td>` +
            `<td class="rate-cell ${d >= 0 ? 'td-up' : 'td-down'}">${d > 0 ? '+' : ''}${d}%</td>` +
            `<td class="left-cell weak-kp" title="该次任务失分最集中的${dimensionLabel()}">${escapeHTML(t.weakKp || '—')}</td>` +
            '<td><span class="task-link" onclick="showProtoToast(\'打开作业详情\')">查看明细</span></td>' +
            '</tr>';
    });
    html += '<tr class="sum-row">' +
        '<td>合计</td>' +
        `<td>${s.total} 次任务</td>` +
        '<td>—</td>' +
        `<td>${scoreSum}</td>` +
        `<td>${submitSum}/${shouldSum}</td>` +
        `<td class="rate-cell">${s.pRate}</td>` +
        `<td class="rate-cell muted">${gradeAvg}</td>` +
        `<td class="rate-cell ${diff >= 0 ? 'td-up' : 'td-down'}">${diff > 0 ? '+' : ''}${diff}%</td>` +
        `<td class="left-cell weak-kp" title="周期内累计失分率最高的顽固薄弱项">${escapeHTML(worstKp)}</td>` +
        '<td>—</td>' +
        '</tr>';
    html += '</tbody></table></div>';

    el.innerHTML = html;
}

// 任务清单「查看明细」：原型阶段不跳转，仅 Toast 提示（首次调用时动态创建 toast 元素）
let protoToastTimer = null;
function showProtoToast(msg) {
    let t = document.getElementById('protoToast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'protoToast';
        t.className = 'proto-toast';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(protoToastTimer);
    protoToastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// 任务清单得分率列排序状态：升序 → 降序 → 恢复默认（三态切换）
let periodTaskSort = { key: null, dir: 1 };
function sortPeriodTask(key) {
    if (periodTaskSort.key === key) {
        if (periodTaskSort.dir === 1) periodTaskSort.dir = -1;
        else periodTaskSort = { key: null, dir: 1 };
    } else {
        periodTaskSort = { key: key, dir: 1 };
    }
    renderPeriodTaskTable();
}

// 排序表头箭头：未激活显示淡色双向箭头，激活显示 ▲ / ▼
function sortArrow(key) {
    if (periodTaskSort.key !== key) return '<span class="sort-arrow">↕</span>';
    return periodTaskSort.dir === 1
        ? '<span class="sort-arrow asc">▲</span>'
        : '<span class="sort-arrow desc">▼</span>';
}

/* ---------------- 共性错题清单（摘要卡 3 下钻目标 · 与卡面数字同口径：得分率 ≤60%） ---------------- */

// 勾选状态：key = 题号 id；维度切换时按新清单过滤，避免 kp / ability 题号串选
let mistakeSel = new Set();

function commonMistakes() {
    return mistakeSource().filter(m => m.classRate >= 0 && m.classRate <= 60);
}

function renderCommonMistakes() {
    const body = document.getElementById('mistakeListBody');
    if (!body) return;
    const list = commonMistakes();
    mistakeSel = new Set([...mistakeSel].filter(id => list.some(m => m.id === id)));
    const th = document.getElementById('mistakeKpTh');
    if (th) th.innerText = `关联${dimensionLabel()}`;

    body.innerHTML = list.map(m => {
        const color = kpTagColors[m.kp] || '#3b82f6';
        return `<tr>
            <td class="ck-cell"><input type="checkbox" class="mistake-ck" data-id="${m.id}" ${mistakeSel.has(m.id) ? 'checked' : ''}></td>
            <td class="m-title-cell" title="${escapeHTML(m.content)}"><span class="m-qid">${m.id}</span>${escapeHTML(m.content)}</td>
            <td class="muted">${escapeHTML(m.source)}</td>
            <td class="rate-cell td-down">${m.classRate}</td>
            <td class="rate-cell muted">${m.gradeRate}</td>
            <td><span class="m-kp-chip" style="color:${color};background:${color}1a;border-color:${color}55">${escapeHTML(m.kp)}</span></td>
            <td><span class="task-link" data-act="origin" data-id="${m.id}">查看原卷</span></td>
        </tr>`;
    }).join('') || '<tr><td colspan="7" class="m-empty">本周期无共性错题（班级得分率 ≤60%）</td></tr>';

    const ckAll = document.getElementById('mistakeCheckAll');
    if (ckAll) {
        ckAll.checked = list.length > 0 && mistakeSel.size === list.length;
        ckAll.indeterminate = mistakeSel.size > 0 && mistakeSel.size < list.length;
    }
    updateMistakeSelInfo();
}

function updateMistakeSelInfo() {
    const info = document.getElementById('mistakeSelInfo');
    if (info) info.innerText = `已选 ${mistakeSel.size} 道`;
}

// 热力等级（失分率 → 色阶档位）
function heatLevelClass(v) {
    if (v === 0) return 'h0';
    if (v < 20) return 'h1';
    if (v < 40) return 'h2';
    if (v < 60) return 'h3';
    if (v < 75) return 'h4';
    return 'h5';
}

// 热力演进行判定（B1）：顽固 → 反复 → 偶发 → 恶化/回升/稳定；趋势 = 有效值前后两半均值差
function heatVerdictOf(r) {
    const heavyCnt = r.values.filter(v => v !== null && v >= 40).length;
    if (heavyCnt >= 3) return { key: 'stubborn', text: `顽固 · ${heavyCnt} 次`, cls: 'hv-stubborn', tip: `${heavyCnt} 次失分 ≥40%，结构性薄弱，重复讲题无效，建议专项课时` };
    const valid = r.values.filter(v => v !== null);
    let diff = 0;
    if (valid.length >= 2) {
        const half = Math.floor(valid.length / 2);
        const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
        diff = Math.round((mean(valid.slice(half)) - mean(valid.slice(0, half))) * 10) / 10;
    }
    if (heavyCnt === 2) return { key: 'repeat', text: '反复', cls: 'hv-repeat', tip: '2 次失分 ≥40%，顽固苗头，需盯紧后续任务' };
    if (heavyCnt === 1) return { key: 'occ', text: '偶发', cls: 'hv-occ', tip: '仅 1 次重度失分，倾向偶发（题难/粗心），暂不专项处理' };
    if (diff >= 5) return { key: 'worse', text: '恶化', cls: 'hv-worse', tip: `后半段失分均值较前半段 +${diff}%，失分加重，建议尽快介入` };
    if (diff <= -5) return { key: 'better', text: '回升', cls: 'hv-better', tip: `后半段失分均值较前半段 ${diff}%，失分收窄，前期干预在起效` };
    return { key: 'stable', text: '稳定', cls: 'hv-stable', tip: diff ? `前后两半均值差 ${diff > 0 ? '+' : ''}${diff}%，基本稳定` : '前后两半均值持平' };
}

// 行叙事 tooltip（B4）：把矩阵翻译成教师语言，整行悬停即读
function heatNarrativeOf(r, verdict) {
    const valid = r.values.filter(v => v !== null);
    const last = valid.length ? valid[valid.length - 1] : null;
    const base = `${r.name}：${periodTasks.length} 次任务中考查 ${valid.length} 次，累计失分率 ${r.avg}%`;
    if (verdict.key === 'stubborn') return `${base}；最近一次 ${last}%，属结构性薄弱，重复讲题无效，建议安排专项课时。`;
    if (verdict.key === 'repeat') return `${base}；最近一次 ${last}%，顽固苗头，需盯紧后续任务。`;
    if (verdict.key === 'occ') return `${base}；最近一次 ${last}%，倾向偶发，暂不专项处理。`;
    if (verdict.key === 'worse') return `${base}；最近一次 ${last}%，失分有加重趋势，建议尽快介入。`;
    if (verdict.key === 'better') return `${base}；最近一次 ${last}%，失分逐步收窄，前期干预在起效。`;
    return `${base}；最近一次 ${last}%，波动不大，保持现有节奏。`;
}

// 下钻定位焦点（B2）：{ names:Set } 点名高亮 或 { stubborn:true } 高亮全部顽固行；渲染后脉冲定位，随后自动清除
let heatFocus = null;
let heatFocusTimer = null;
function setHeatFocus(focus) {
    heatFocus = focus || null;
    if (heatFocusTimer) { clearTimeout(heatFocusTimer); heatFocusTimer = null; }
}

// 热力演进视图：考核项 × 任务失分率矩阵（行按累计降序，顽固标记）
function renderHeatView() {
    if (!El.heatView) return;
    const label = dimensionLabel();
    // 口径说明（XK-06.4）：热力演进 = 周期内实际考查的考核项 × 任务矩阵，不随「查看全部知识点」范围开关变化
    // （矩阵行仅含已考查项，未检测知识点无失分率数据，不在本图展示——如需查看全体系覆盖请用树状图/关联图谱）
    // 渲染层过滤：目录中关闭的一级节点对应考核项不展示（未命中索引的行默认保留）
    const shown = dirStateOf();
    const heatRows = heatData[currentDimension].filter(r => {
        const mod = currentDimension === 'kp'
            ? (kgIndex.byName[r.name] && kgIndex.byName[r.name].module)
            : ablIndex.byName[r.name];
        return mod == null || shown[mod] !== false;
    });
    const rows = heatRows.map(r => {
        const valid = r.values.filter(v => v !== null);
        const avg = valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 0;
        const heavyCnt = r.values.filter(v => v !== null && v >= 40).length;
        return { name: r.name, values: r.values, avg, stubborn: heavyCnt >= 3, heavyCnt };
    }).sort((a, b) => b.avg - a.avg);

    // 下钻焦点命中：点名命中优先；点名未命中当前维度时回退高亮全部顽固行，仍无则回退置顶行
    let focusMode = null;
    if (heatFocus) {
        if (heatFocus.names && heatFocus.names.size) {
            if (rows.some(r => heatFocus.names.has(r.name))) focusMode = { names: heatFocus.names };
            else if (rows.some(r => r.stubborn)) focusMode = { stubborn: true };
            else focusMode = { top: true };
        } else if (heatFocus.stubborn) {
            focusMode = rows.some(r => r.stubborn) ? { stubborn: true } : { top: true };
        }
    }

    let html = '<div class="heat-axis-note"><i class="fas fa-info-circle"></i>单元格数值 = 班级<b>失分率%</b>，颜色越红丢分越重（得分率 = 100 − 失分率）</div>';
    html += '<div class="heat-table-wrap"><table class="heat-table"><thead><tr>' +
        `<th class="rowhd">${label}</th>` +
        periodTasks.map(t => `<th>${escapeHTML(t.name)}<span>${t.date.slice(5)} · ${t.type === 'exam' ? '考试' : '作业'}</span></th>`).join('') +
        '<th>累计</th><th>判定</th></tr></thead><tbody>';

    rows.forEach((r, idx) => {
        const verdict = heatVerdictOf(r);
        const focused = focusMode ? (focusMode.names ? focusMode.names.has(r.name) : focusMode.stubborn ? r.stubborn : idx === 0) : false;
        html += `<tr data-heat-name="${escapeHTML(r.name)}"${focused ? ' class="heat-focus-row"' : ''} title="${escapeHTML(heatNarrativeOf(r, verdict))}"><th class="rowhd">${escapeHTML(r.name)}${r.stubborn ? '<span class="stub-mark">顽固</span>' : ''}</th>`;
        r.values.forEach((v, i) => {
            if (v === null) {
                html += `<td class="h-none" title="${escapeHTML(periodTasks[i].full)}：该场未考查">·</td>`;
            } else {
                html += `<td class="${heatLevelClass(v)}" title="${escapeHTML(periodTasks[i].full)} · ${escapeHTML(r.name)}：失分率 ${v}%">${v}</td>`;
            }
        });
        html += `<td class="${heatLevelClass(r.avg)} heat-avg" title="周期累计失分率 ${r.avg}%">${r.avg}</td>`;
        html += `<td><span class="heat-verdict ${verdict.cls}" title="${escapeHTML(verdict.tip)}">${verdict.text}</span></td></tr>`;
    });
    html += '</tbody></table></div>';

    html += '<div class="heat-legend"><span>失分率：</span>' +
        '<span><i class="sw h1"></i>&lt;20% 轻度</span>' +
        '<span><i class="sw h2"></i>20~40% 中度</span>' +
        '<span><i class="sw h3"></i>40~60% 较重</span>' +
        '<span><i class="sw h4"></i>60~75% 严重</span>' +
        '<span><i class="sw h5"></i>≥75% 极重</span>' +
        '<span class="legend-note">顽固 = ≥3 次失分率 ≥40% · 「·」= 该场未考查（与无失分区分）</span></div>';

    // 热力结论（动态）
    const stub = rows.filter(r => r.stubborn);
    let conclusion;
    if (!rows.length) {
        // 空态：目录一级模块全部关闭，矩阵无可展示行；不能落入「暂无顽固项、失分偶发」分支（0 行时说偶发不成立）
        conclusion = `当前目录下没有可展示的${label}，请恢复左侧已关闭的模块后再查看。`;
    } else if (stub.length) {
        const worst = rows[0];
        conclusion = `共 ${rows.length} 个${label}，其中 <b>${stub.length}</b> 个命中顽固薄弱：` +
            `<b>${stub.map(k => escapeHTML(k.name)).join('、')}</b>。` +
            `「${escapeHTML(worst.name)}」累计失分率 ${worst.avg}%，为当前最突出短板，建议安排专项课时集中突破。`;
    } else {
        conclusion = `共 ${rows.length} 个${label}，暂无顽固薄弱项（≥3 次失分率 ≥40%），整体失分以偶发性为主，保持当前教学节奏即可。`;
    }
    html += `<div class="heat-conclusion"><i class="fas fa-lightbulb" style="margin-right:6px;color:var(--primary)"></i>${conclusion}</div>`;

    El.heatView.innerHTML = html;

    // 下钻定位（B2）：滚动到首个高亮行（视图切换后已可见），脉冲结束后清除焦点
    if (focusMode) {
        requestAnimationFrame(() => {
            const first = El.heatView.querySelector('.heat-focus-row');
            if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        heatFocusTimer = setTimeout(() => {
            heatFocus = null;
            El.heatView.querySelectorAll('.heat-focus-row').forEach(tr => tr.classList.remove('heat-focus-row'));
        }, 3400);
    }
}

// 错因结构堆叠图（每行一次任务，段宽 = 错因占比）
function initCauseChart() {
    const dom = document.getElementById('causeStackChart');
    if (!dom) return;
    if (!panelVisible('analysisTabPanel')) return; // 「知识点分析」页签隐藏期间跳过，切换页签时再渲染
    if (!window.echarts) { setTimeout(initCauseChart, 500); return; }
    if (!causeStackChart) causeStackChart = echarts.getInstanceByDom(dom) || echarts.init(dom);

    causeStackChart.setOption({
        // item 触发（与高亮口径一致）：hover 某错因段时 emphasis 高亮该错因全部任务段，
        // tooltip 同步显示「该错因在各次任务的占比 + 周期均值 + 首尾环比」，而非该任务的错因构成
        tooltip: {
            trigger: 'item',
            formatter: (p) => {
                const ci = p.seriesIndex, def = CAUSE_DEFS[ci];
                const rowIdx = causeMatrix.length - 1 - p.dataIndex; // series data 已 reverse（最新在上）
                const first = causeMatrix[0][ci], last = causeMatrix[causeMatrix.length - 1][ci];
                const delta = Math.round((last - first) * 10) / 10;
                const avg = Math.round(causeMatrix.reduce((s, r) => s + r[ci], 0) / causeMatrix.length * 10) / 10;
                const rows = causeMatrix.map((row, ri) => ({ t: periodTasks[ri], v: row[ci], cur: ri === rowIdx })).reverse();
                return `<div class="cause-tip">
                    <div class="cause-tip-hd"><i class="legend-dot" style="background:${causeColorOf(def, ci)}"></i><b>${escapeHTML(def.name)}</b>
                        <span class="cause-tip-avg">周期均值 ${avg}%</span>
                        <span class="cause-delta ${delta > 0 ? 'up' : 'down'}">${delta > 0 ? '+' : ''}${delta}%</span></div>
                    ${rows.map(r => `<div class="cause-tip-row${r.cur ? ' cur' : ''}"><span>${escapeHTML(r.t.name)}</span><b>${r.v}%</b></div>`).join('')}
                </div>`;
            }
        },
        grid: { left: 96, right: 40, top: 12, bottom: 34 },
        xAxis: {
            type: 'value', max: 100,
            axisLabel: { formatter: '{value}%', color: '#94a3b8' },
            splitLine: { lineStyle: { color: '#f1f5f9' } }
        },
        yAxis: {
            type: 'category',
            data: periodTasks.map(t => t.name).reverse(),
            axisLabel: { fontSize: 12, color: '#475569' },
            axisTick: { show: false }, axisLine: { lineStyle: { color: '#e2e8f0' } }
        },
        series: CAUSE_DEFS.map((c, ci) => ({
            name: c.name, type: 'bar', stack: 'total', barWidth: 18,
            itemStyle: { color: causeColorOf(c, ci), borderRadius: ci === CAUSE_DEFS.length - 1 ? [0, 3, 3, 0] : 0 },
            emphasis: { focus: 'series' },
            data: causeMatrix.map(row => row[ci]).reverse()
        }))
    }, true);
    causeStackChart.resize();

    // 自定义图例（与关键发现共用配色）
    const legendEl = document.getElementById('causeLegend');
    if (legendEl) {
        legendEl.innerHTML = CAUSE_DEFS.map((c, ci) =>
            `<span class="legend-item"><i class="legend-dot" style="background:${causeColorOf(c, ci)}"></i>${c.name}</span>`).join('');
    }
}

// 错因关键发现：首尾场占比对比，|Δ|≥3% 列为关键迁移
function renderCauseFindings() {
    const first = causeMatrix[0], last = causeMatrix[causeMatrix.length - 1];
    const diffs = CAUSE_DEFS.map((c, i) => ({
        def: c, from: first[i], to: last[i],
        delta: Math.round((last[i] - first[i]) * 10) / 10
    }));
    const significant = diffs.filter(d => Math.abs(d.delta) >= 3).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    const stable = diffs.filter(d => Math.abs(d.delta) < 3);

    let html = significant.map(d => {
        const up = d.delta > 0;
        return `<div class="insight-item ${up ? 'i-red' : 'i-green'}">
            <div><b>${d.def.name}</b>：${d.from}% → <b>${d.to}%</b>
            <span class="cause-delta ${up ? 'up' : 'down'}">${up ? '+' : ''}${d.delta}%</span><br>
            <span class="insight-advice">${causeAdviceOf(d.def, up)}</span></div>
        </div>`;
    }).join('');

    if (stable.length) {
        html += `<div class="insight-item i-blue">
            <div><b>基本稳定</b>：${stable.map(d => d.def.name).join('、')} 的占比变化均在 ±3% 以内，错因结构未发生明显迁移。</div></div>`;
    }
    El.causeFindingList.innerHTML = html;
}

/* ---------------- 知识图谱诊断（迁移自校级学情报告平台） ----------------
   5 个子模块：顽固薄弱 / 前序断层归因（F14 证据化）/ 易混淆 / 题型×易错点 / 前后序证据总览
   ------------------------------------------------------------- */

// 前序/后序证据状态（F14）：period 周期内考查 / history 周期外历史 / none 暂无证据 / unlearned 未学
// 无证据与未学节点不展示掌握率（未知 ≠ 0%）
function evidenceStateOf(name) {
    const ex = KG_EVIDENCE_EXCEPTIONS[name];
    if (ex) {
        if (ex.state === 'history') return { state: 'history', rate: ex.rate, source: ex.source };
        return { state: ex.state, rate: null };
    }
    const info = kgIndex.byName[name];
    if (!info) return { state: 'none', rate: null };
    return { state: 'period', rate: Math.round(masteryOf(info.node)), count: kgPeriodCountOf(info.node) };
}

// 知识点着色统一口径：按掌握情况取色（档位绿/黄/红），暂无证据 / 未学恒灰。
// 图谱节点、左侧目录、详情面板关系行、诊断卡片与抽屉一律走这里——颜色不再编码模块或关系类型
function kpHexOf(name) {
    const ev = evidenceStateOf(name);
    if (ev.state === 'none' || ev.state === 'unlearned') return '#94a3b8';
    const rate = ev.state === 'history' ? ev.rate : (kgIndex.byName[name] ? masteryOf(kgIndex.byName[name].node) : null);
    return (rate === null || rate === undefined) ? '#94a3b8' : statusOf(rate).hexColor;
}

// 知识点维度覆盖统计（卡1 口径：有检测证据 = period + history；不随「查看全部知识点」开关变化，统计红线）
function kpCoverageTotal() {
    let covered = 0;
    kgIndex.list.forEach(n => {
        const st = evidenceStateOf(n.name).state;
        if (st === 'period' || st === 'history') covered++;
    });
    return { covered, total: kgIndex.list.length };
}

// 一级模块覆盖统计（目录覆盖徽章「已考x/y」：子树任一节点有检测证据即计入分子）
function kpModuleCoverage(moduleName) {
    const info = kgIndex.byName[moduleName];
    const nodes = info ? flattenTree(info.node, true) : [];
    let covered = 0;
    nodes.forEach(n => {
        const st = evidenceStateOf(n.name).state;
        if (st === 'period' || st === 'history') covered++;
    });
    return { covered, total: nodes.length };
}

// 范围保留判定（showAllKp=false 时仅保留周期学情包含的知识点：
// 零覆盖一级模块（子树无任何 period/history 证据）整棵剔除，目录行同步隐藏；
// 有覆盖模块内 none（已学未考）隐藏、history 保留历史线索、unlearned 保留结构完备；
// 勾选后全量显示，未检测/未学灰色标识）
function kpScopeKeep(node) {
    if (showAllKp || currentDimension !== 'kp') return true;
    if (node.level === 0) return true;
    if (node.level === 1) return kpModuleCoverage(node.name).covered > 0;
    return evidenceStateOf(node.name).state !== 'none';
}

// 周期内考查场次数（原型派生：叶子按掌握档 2~4 场，父节点取子树叶子最大值；真实接入按场次×题目命中推导）
function kgPeriodCountOf(node) {
    if (!node.children || !node.children.length) {
        return masteryOf(node) >= 80 ? 4 : masteryOf(node) >= 60 ? 3 : 2;
    }
    return flattenTree(node, false)
        .filter(n => !n.children || !n.children.length)
        .reduce((mx, n) => {
            const ex = KG_EVIDENCE_EXCEPTIONS[n.name];
            if (ex && ex.state !== 'history') return mx;
            return Math.max(mx, masteryOf(n) >= 80 ? 4 : masteryOf(n) >= 60 ? 3 : 2);
        }, 0);
}

// 最弱有证据前置：无证据前置不参与根因比较（未知 ≠ 薄弱），仅触发前置诊断
function weakestPrereqEvidence(name) {
    const rel = kpRelations[name];
    const pres = (rel && rel.prerequisite) || [];
    if (!pres.length) return null;
    let worst = null, noEvidence = false;
    pres.forEach(p => {
        const ev = evidenceStateOf(p);
        if (ev.state === 'none') { noEvidence = true; return; }
        if (ev.state === 'unlearned') return;
        if (!worst || ev.rate < worst.rate) worst = { name: p, rate: ev.rate };
    });
    return { worst, noEvidence };
}

// 学生分组派生（原型模拟：名单池确定性旋转，四组互斥；真实数据按学生粒度作答证据生成）
function deriveStudentGroups(node) {
    const off = [...node.name].reduce((s, c) => s + c.charCodeAt(0), 0) % KG_STUDENT_POOL.length;
    const rotated = KG_STUDENT_POOL.slice(off).concat(KG_STUDENT_POOL.slice(0, off));
    const m = masteryOf(node);
    const wp = weakestPrereqEvidence(node.name);
    if (m >= 80) return { diag: [], pre: [], solid: [], next: rotated.slice(0, 8) };
    if (m < 60 && wp && wp.noEvidence) return { diag: rotated.slice(0, 4), pre: [], solid: rotated.slice(4, 9), next: rotated.slice(9, 12) };
    if (m < 60 && wp && wp.worst && wp.worst.rate < 70) return { diag: [], pre: rotated.slice(0, 4), solid: rotated.slice(4, 9), next: rotated.slice(9, 12) };
    return { diag: [], pre: [], solid: rotated.slice(0, 6), next: rotated.slice(6, 10) };
}

// 统一分组访问：显式样例优先，其余派生；统一携带分组理由
function groupsOf(name) {
    const explicit = KG_STUDENT_GROUPS[name];
    if (explicit) {
        return { diag: explicit.diag, pre: explicit.pre, solid: explicit.solid, next: explicit.next };
    }
    const node = kgIndex.byName[name] ? kgIndex.byName[name].node : null;
    if (!node) return null;
    const d = deriveStudentGroups(node);
    const wp = weakestPrereqEvidence(name);
    const nonePres = ((kpRelations[name] || {}).prerequisite || []).filter(p => evidenceStateOf(p).state === 'none');
    const reasons = {
        diag: nonePres.length ? `当前失分，且前置「${nonePres.join('、')}」暂无作答证据，先诊断再决定` : '前置均有作答证据，无需前置诊断',
        pre: wp && wp.worst ? `最弱前置「${wp.worst.name}」周期汇总 ${wp.worst.rate}%（<70%），先补基础再回当前` : '前置表现尚可，无需前置补练',
        solid: '前置尚可，重点巩固当前知识点本身',
        next: '个人周期汇总 ≥80%，可安排后续应用检查'
    };
    return { diag: { students: d.diag, reason: reasons.diag }, pre: { students: d.pre, reason: reasons.pre }, solid: { students: d.solid, reason: reasons.solid }, next: { students: d.next, reason: reasons.next } };
}

// 前序断层归因：对掌握度 <60% 的知识点，沿 kpRelations.prerequisite 链回溯，定位根因层
// F14 证据化修正：暂无证据前置 = 证据断点，不当作根因；根因节点必有周期内或历史证据且 <70%
// 冷启动（关系建设期）：目标无前置关系条目 → noRel=true，「关系未建」与「前序已达标」严格区分，不得归因造假
function kgTraceRoot(name) {
    const noRel = !((kpRelations[name] && kpRelations[name].prerequisite) || []).length;
    const chain = [];
    const breaks = [];
    let cur = name;
    let guard = 0;
    while (cur && guard++ < 8) {
        const info = kgIndex.byName[cur];
        if (!info) break;
        chain.push(info.node);
        const pres = ((kpRelations[cur] && kpRelations[cur].prerequisite) || [])
            .map(p => kgIndex.byName[p]).filter(Boolean);
        if (!pres.length) break;
        // 无证据前置：记录断点（未知 ≠ 薄弱），不参与根因比较（pres 元素为 kgIndex 索引项，名称取 node.name）
        pres.forEach(p => {
            if (evidenceStateOf(p.node.name).state === 'none') breaks.push(p.node.name);
        });
        const known = pres.filter(p => ['period', 'history'].includes(evidenceStateOf(p.node.name).state));
        if (!known.length) break;
        // 取掌握度最低的有证据前序；已达标（≥70%）则回溯终止
        const worst = known.slice().sort((a, b) => masteryOf(a.node) - masteryOf(b.node))[0];
        if (masteryOf(worst.node) >= 70) break;
        cur = worst.node.name;
    }
    const weakUp = chain.slice(1).filter(n => masteryOf(n) < 70);
    const root = weakUp.length ? weakUp[weakUp.length - 1] : chain[chain.length - 1];
    return { chain, root, rootCause: weakUp.length > 0, breaks: [...new Set(breaks)], noRel };
}

// 前置关系标注覆盖度（%）：有作答证据且已建前置关系的知识点 / 有作答证据的知识点数
// 分母只算有证据节点（未考节点建不建关系对当前建议无影响）；能力维度关系不适用，返回 null
function kgRelationCoverage() {
    if (dimensionLabel() === '能力' || !kgIndex.list.length) return null;
    const withEv = kgIndex.list.filter(n => ['period', 'history'].includes(evidenceStateOf(n.name).state));
    if (!withEv.length) return null;
    const withRel = withEv.filter(n => (kpRelations[n.name] && kpRelations[n.name].prerequisite || []).length > 0);
    return Math.round(withRel.length / withEv.length * 100);
}

// 采集当前知识点维度下的前序断层项（掌握度 <60%，按掌握度升序，最多 5 项）
// F14：暂无证据与未学节点不进断层候选（静态掌握率不代表周期表现）
function kgCollectFaults() {
    if (!kgIndex.list.length) return [];
    return kgIndex.list
        .filter(n => n.level >= 2 && masteryOf(n) < 60)
        .filter(n => ['period', 'history'].includes(evidenceStateOf(n.name).state))
        .sort((a, b) => masteryOf(a) - masteryOf(b))
        .slice(0, 5)
        .map(n => ({ node: n, tr: kgTraceRoot(n.name) }));
}

// 子模块 1：顽固薄弱知识点（数据源 = calcPeriodStats.stubSorted，与热力图 / 周期结论保持一致）
function renderKgStubList() {
    const box = document.getElementById('kgStubList');
    const cntEl = document.getElementById('kgStubCount');
    if (!box) return;
    const stub = calcPeriodStats().stubSorted.slice(0, 5);
    if (cntEl) cntEl.innerText = stub.length;
    if (!stub.length) {
        box.innerHTML = '<div class="kg-diag-empty"><i class="fas fa-check-circle"></i> 本周期暂无顽固薄弱项（≥3 次失分率 ≥40%）</div>';
        return;
    }
    box.innerHTML = stub.map((k, i) => {
        const info = kgIndex.byName[k.name];
        const chap = info ? info.path : '—';
        const lvCls = i === 0 ? 'lv1' : i === 1 ? 'lv2' : i === 2 ? 'lv3' : 'lv';
        const recent = k.values ? k.values.filter(v => v !== null).slice(-1)[0] : null;
        return `<div class="kg-stub-item" data-stub="${escapeHTML(k.name)}" title="点击在热力演进视图中定位该考核项">
            <span class="kg-stub-no ${lvCls}">${i + 1}</span>
            <div class="kg-stub-body">
                <div class="kg-stub-title">
                    <b style="color:${kpHexOf(k.name)}">${escapeHTML(k.name)}</b>
                    <span class="kg-tag kg-tag-red">顽固 · ${k.heavyCnt} 次</span>
                    ${i === 0 ? '<span class="kg-tag kg-tag-orange">优先专项</span>' : ''}
                </div>
                <div class="kg-stub-track"><i style="width:${Math.min(100, k.avg)}%"></i></div>
                <div class="kg-stub-meta">
                    <span>累计失分率 <b>${k.avg}%</b></span>
                    <span>· 命中 ${k.heavyCnt}/${periodTasks.length} 任务</span>
                    ${recent !== null && recent !== undefined ? `<span>· 最近一次 ${recent}%</span>` : ''}
                    <span class="kg-stub-chap" title="${escapeHTML(chap)}">· ${escapeHTML(chap)}</span>
                </div>
            </div>
            <span class="kg-stub-pct">${k.avg}%</span>
        </div>`;
    }).join('');
    // 顽固条目 → 热力演进行定位（B2 联动）：点名未命中当前维度时由 renderHeatView 回退高亮全部顽固行
    box.querySelectorAll('.kg-stub-item').forEach(item => {
        item.onclick = () => {
            setHeatFocus({ names: new Set([item.dataset.stub]) });
            switchView('heat');
        };
    });
}

// 子模块 2：前序断层归因 TOP（根因在前序 → 先补前序再讲当前；F14：证据断点 + 目的徽章 + 点击入关联诊断）
function renderKgFaultList() {
    const box = document.getElementById('kgFaultList');
    const cntEl = document.getElementById('kgFaultCount');
    if (!box) return;
    const faults = kgCollectFaults();
    const rootCnt = faults.filter(x => x.tr.rootCause).length;
    if (cntEl) cntEl.innerText = `${rootCnt}/${faults.length}`;
    if (!faults.length) {
        box.innerHTML = '<div class="kg-diag-empty"><i class="fas fa-check-circle"></i> 本班无掌握度 <60% 且有作答证据的知识点，无需前序回溯</div>';
        return;
    }
    box.innerHTML = faults.map((x, i) => {
        const n = x.node, tr = x.tr, root = tr.root;
        const m = Math.round(masteryOf(n));
        const rootM = Math.round(masteryOf(root));
        // 链路展示：目标 ← 中间层 ← 根因（反转后从左到右为“根因→表现”）；断点节点以虚样式附于链尾；关系未建时无链可回溯
        const chainHtml = tr.noRel
            ? '<span class="kg-fault-node brk">前置关系未建 · 无法回溯</span>'
            : tr.chain.slice().reverse().map((cn, ci) => {
                const cm = Math.round(masteryOf(cn));
                const isRoot = tr.rootCause && cn.name === root.name;
                const cls = isRoot ? 'root' : (cm < 70 ? 'weak' : 'ok');
                return (ci ? '<span class="kg-fault-arrow"><i class="fas fa-arrow-right-long"></i></span>' : '') +
                    `<span class="kg-fault-node ${cls}" title="掌握度 ${cm}%">${escapeHTML(cn.name)}<em>${cm}%</em></span>`;
            }).join('');
        const breakHtml = tr.breaks.length
            ? '<span class="kg-fault-arrow"><i class="fas fa-arrow-right-long"></i></span>' +
              tr.breaks.map(b => `<span class="kg-fault-node brk" title="暂无作答证据，先诊断再归因">${escapeHTML(b)}<em>暂无证据</em></span>`).join('')
            : '';
        // 加练目的徽章：关系未建 → 待标注；根因在前序 → 前置补练；链上有断点 → 前置诊断；否则 → 同点巩固
        const purposeTag = tr.noRel
            ? '<span class="kg-tag kg-tag-slate">待标注</span>'
            : (tr.rootCause
                ? '<span class="kg-tag kg-tag-purple">前置补练</span>'
                : (tr.breaks.length ? '<span class="kg-tag kg-tag-orange">前置诊断</span>' : '<span class="kg-tag kg-tag-blue">同点巩固</span>'));
        // 结果四态：前置关系未建（冷启动，不归因造假）/ 根因在前序 / 根因未知（证据断点）/ 前序已达标
        const tagHtml = tr.noRel
            ? '<span class="kg-tag kg-tag-slate">前置关系未建 · 无法归因</span>'
            : (tr.rootCause
                ? `<span class="kg-tag kg-tag-purple">根因在前序：${escapeHTML(root.name)}</span>`
                : (tr.breaks.length
                    ? '<span class="kg-tag kg-tag-orange">根因未知 · 前置暂无证据</span>'
                    : '<span class="kg-tag kg-tag-cyan">前序已达标 · 本点自身问题</span>'));
        const action = tr.noRel
            ? `处置：<b>可直接针对 ${escapeHTML(n.name)} 做专项巩固</b>；前置归因待题库补充标注后自动升级。`
            : (tr.rootCause
                ? `处置：<b>先补 ${escapeHTML(root.name)}（${rootM}%）</b>，再讲 ${escapeHTML(n.name)}。直接讲后者，学生会卡在前序步骤上。`
                : (tr.breaks.length
                    ? `处置：前置「${escapeHTML(tr.breaks.join('、'))}」<b>暂无作答证据</b>，先诊断再归因，不得直接判定为基础不牢。`
                    : `处置：<b>可直接针对 ${escapeHTML(n.name)} 做专项</b>，前置节点均已达标。`));
        return `<div class="kg-fault-item" data-kp="${escapeHTML(n.name)}" role="button" tabindex="0" title="点击查看关联诊断">
            <div class="kg-fault-hd">
                <span class="kg-fault-rank">${i + 1}</span>
                <b>${escapeHTML(n.name)}</b>
                <span class="kg-tag kg-tag-red">${m}%</span>
                ${tagHtml}
                ${purposeTag}
            </div>
            <div class="kg-fault-chain">${chainHtml}${breakHtml}</div>
            <div class="kg-fault-meta">${action}</div>
            <div class="kg-fault-cta">点击查看关联诊断 <i class="fas fa-chevron-right"></i></div>
        </div>`;
    }).join('');
    box.querySelectorAll('.kg-fault-item').forEach(item => {
        item.onclick = () => openRelDiagDrawer(item.dataset.kp);
    });
}

// 子模块 3：易混淆知识点（取命中人次 TOP 3）
function renderKgConfList() {
    const box = document.getElementById('kgConfList');
    const cntEl = document.getElementById('kgConfCount');
    if (!box) return;
    if (cntEl) cntEl.innerText = confusionData.length;
    const top = confusionData.slice().sort((a, b) => b.cls - a.cls).slice(0, 3);
    box.innerHTML = top.map(c => `<div class="kg-conf-pair">
        <div class="kg-conf-hd">
            <span class="kg-conf-vs"><span>${escapeHTML(c.a)}</span><i>易混</i><span>${escapeHTML(c.b)}</span></span>
            <span class="kg-conf-hits">
                <span class="kg-tag kg-tag-red">全班 ${c.cls} 人次</span>
                <span class="kg-tag" style="color:${kpHexOf(c.kp)};background:${kpHexOf(c.kp)}14" title="知识点颜色 = 掌握情况">关联：${escapeHTML(c.kp)}</span>
            </span>
        </div>
        <div class="kg-conf-body"><b>典型混淆表现：</b>${escapeHTML(c.expr)}</div>
        <div class="kg-conf-fix"><i class="fas fa-check"></i> 辨析建议：${escapeHTML(c.fix)}</div>
    </div>`).join('');
}

// 子模块 4：题型 × 易错点（按全班命中人次降序 TOP 7）
function renderKgPitList() {
    const box = document.getElementById('kgPitList');
    const cntEl = document.getElementById('kgPitCount');
    if (!box) return;
    if (cntEl) cntEl.innerText = pitfallHitData.length;
    const top = pitfallHitData.slice().sort((a, b) => b.cls - a.cls).slice(0, 7);
    box.innerHTML = top.map(p => {
        const pct = Math.round(p.cls / p.tot * 100);
        const tone = pct >= 40 ? 'hi' : pct >= 25 ? 'mid' : 'lo';
        return `<div class="kg-pit-row">
            <span class="kg-pit-qt">${escapeHTML(p.qt)}</span>
            <span class="kg-pit-name" title="关联知识点：${escapeHTML(p.kp)}">${escapeHTML(p.pit)}</span>
            <span class="kg-pit-hit ${tone}">${p.cls}/${p.tot} 人</span>
            <span class="kg-pit-pct ${tone}">${pct}%</span>
            <span class="kg-pit-track"><i class="${tone}" style="width:${Math.min(100, pct)}%"></i></span>
            <span class="kg-pit-kp">关联：<b style="color:${kpHexOf(p.kp)}">${escapeHTML(p.kp)}</b></span>
        </div>`;
    }).join('');
}

// 子模块 5：前序 / 后序证据总览（四态计数 + 待诊断清单，F14）
function renderKgEvidenceOverview() {
    const chipsEl = document.getElementById('kgEvidenceChips');
    const listEl = document.getElementById('kgEvidenceList');
    const cntEl = document.getElementById('kgEvidenceCount');
    if (!chipsEl || !listEl) return;
    const stats = { period: 0, history: 0, none: 0, unlearned: 0 };
    kgIndex.list.forEach(n => { stats[evidenceStateOf(n.name).state]++; });
    if (cntEl) cntEl.innerText = stats.none;
    chipsEl.innerHTML = [
        ['period', `周期内考查 ${stats.period}`],
        ['history', `历史证据 ${stats.history}`],
        ['none', `暂无证据 ${stats.none}`],
        ['unlearned', `未学 ${stats.unlearned}`]
    ].map(([k, label]) => `<span class="kg-ev-chip ${REL_EVIDENCE_DEFS[k].cls}"><i style="background:${REL_EVIDENCE_DEFS[k].color}"></i>${label}</span>`).join('');

    // 待诊断清单：暂无证据节点 + 引用它的知识点（谁的前置）；点击进入引用者的关联诊断并高亮断点行
    const noneNodes = kgIndex.list.filter(n => evidenceStateOf(n.name).state === 'none');
    const refs = {};
    kgIndex.list.forEach(n => {
        ((kpRelations[n.name] && kpRelations[n.name].prerequisite) || []).forEach(p => {
            if (evidenceStateOf(p).state === 'none') (refs[p] = refs[p] || []).push(n.name);
        });
    });
    const withRefs = noneNodes.filter(n => refs[n.name]);
    const orphans = noneNodes.length - withRefs.length;
    let html = withRefs.map(n => `<div class="kg-ev-item" data-kp="${escapeHTML(refs[n.name][0])}" data-focus="${escapeHTML(n.name)}" role="button" tabindex="0" title="查看「${escapeHTML(refs[n.name][0])}」的关联诊断，并高亮该断点">
        <span class="kg-ev-badge ev-none">暂无证据</span>
        <b>${escapeHTML(n.name)}</b>
        <span class="kg-ev-ref">「${escapeHTML(refs[n.name].join('、'))}」的前置 · 周期内与历史均未独立考查</span>
        <i class="fas fa-chevron-right"></i>
    </div>`).join('');
    html += `<div class="kg-ev-note">另有 ${orphans} 个暂无证据知识点未被薄弱目标前置引用，暂不进入待诊断清单；未学 ${stats.unlearned} 个仅课堂衔接，不诊断、不加练。单次作业无法获取前后序作答数据，上述证据来自周期内多任务汇总（原型模拟）。</div>`;
    listEl.innerHTML = html;
    listEl.querySelectorAll('.kg-ev-item').forEach(item => {
        item.onclick = () => openRelDiagDrawer(item.dataset.kp, item.dataset.focus);
    });
}

// 子模块 6：已达标与进步（正向展示——存量认可 + 增量可见；达标线随「设置掌握程度」档位联动，统计为全量不受目录筛选影响）
const KG_ACH_RISE_PP = 8;   // 明显进步判定：首末有效场次得分率提升阈值（%）

function renderKgAch() {
    const sumEl = document.getElementById('kgAchSummary');
    if (!sumEl) return;
    const line = masteryLevels[0].min;            // 达标线（默认 3 档 = 80）
    const skilledLine = Math.max(90, line);       // 熟练线（默认 90）
    const nodes = flattenTree(currentTree(), true);
    const good = nodes.filter(n => masteryOf(n) >= line).sort((a, b) => masteryOf(b) - masteryOf(a));
    const skilled = good.filter(n => masteryOf(n) >= skilledLine);
    const passed = good.filter(n => masteryOf(n) < skilledLine);

    // 标签徽标 = 已达标节点数（树口径全量，与顶部达标率卡同口径）
    const cntEl = document.getElementById('kgAchCount');
    if (cntEl) cntEl.innerText = good.length;

    const noteEl = document.getElementById('kgAchNote');
    if (noteEl) noteEl.innerText = `达标线 ≥${line}%（随「设置掌握程度」档位联动）· 统计为全量${dimensionLabel()}，不受左侧目录筛选影响`;
    sumEl.innerHTML = [
        `<b>${good.length}</b> 个已达标`,
        `占全部 ${nodes.length} 个的 <b>${nodes.length ? Math.round(good.length / nodes.length * 100) : 0}%</b>`,
        `其中熟练掌握 <b>${skilled.length}</b> 个`
    ].map(t => `<span>${t}</span>`).join('<span class="kg-diag-ov-sep">·</span>');

    // ── 本周期正向变化（heatData 失分率 → 得分率 = 100 − 失分率，仅取有效场次）──
    const trendEl = document.getElementById('kgAchTrend');
    const trendCntEl = document.getElementById('kgAchTrendCnt');
    const stable = [], newly = [], rising = [];
    (heatData[currentDimension] || []).forEach(r => {
        const valid = (r.values || []).filter(v => v !== null && v !== undefined).map(v => 100 - v);
        if (!valid.length) return;
        const item = { name: r.name, first: valid[0], last: valid[valid.length - 1] };
        if (valid.every(v => v >= line)) stable.push(item);
        else if (item.last >= line) newly.push(item);
        else if (item.last - item.first >= KG_ACH_RISE_PP) rising.push(item);
    });
    const trendTotal = stable.length + newly.length + rising.length;
    if (trendCntEl) trendCntEl.innerText = trendTotal ? `${trendTotal} 项` : '';
    if (trendEl) {
        const trendRow = (it, badge, cls) => `<div class="kg-ach-trend-item" data-kp="${escapeHTML(it.name)}" role="button" tabindex="0" title="查看「${escapeHTML(it.name)}」详情">
            <span class="kg-ach-badge ${cls}">${badge}</span>
            <b>${escapeHTML(it.name)}</b>
            <span class="kg-ach-track">首场 ${it.first}% <i class="fas fa-arrow-right"></i> 末场 ${it.last}%${it.last > it.first ? `（+${it.last - it.first}%）` : ''}</span>
            <i class="fas fa-chevron-right"></i>
        </div>`;
        trendEl.innerHTML = trendTotal
            ? stable.map(it => trendRow(it, '稳定达标', 'ach-stable')).join('')
                + newly.map(it => trendRow(it, '新晋达标', 'ach-newly')).join('')
                + rising.map(it => trendRow(it, '明显进步', 'ach-rising')).join('')
            : `<div class="kg-diag-empty"><i class="fas fa-seedling"></i>本周期${dimensionLabel()}维度暂未出现达标或明显进步项——能力养成通常滞后于知识掌握，属正常现象</div>`;
        trendEl.querySelectorAll('.kg-ach-trend-item').forEach(item => {
            item.onclick = () => window.openDetails(item.dataset.kp);
        });
    }

    // ── 已达标清单（chips 云，超过 12 个截断 + 展开全部）──
    const renderChips = (listId, moreId, arr, emptyText) => {
        const listEl = document.getElementById(listId);
        const moreEl = document.getElementById(moreId);
        if (!listEl) return;
        if (!arr.length) {
            listEl.classList.remove('collapsed');
            listEl.innerHTML = `<div class="kg-diag-empty">${emptyText}</div>`;
            if (moreEl) moreEl.hidden = true;
            return;
        }
        listEl.innerHTML = arr.map(n => {
            const icon = iconOf(n.level);
            return `<span class="kg-ach-chip" data-kp="${escapeHTML(n.name)}" role="button" tabindex="0" title="查看「${escapeHTML(n.name)}」详情">
                <span class="tree-node-icon ${icon.c}">${icon.t}</span>${escapeHTML(n.name)} <b>${Math.round(masteryOf(n))}%</b>
            </span>`;
        }).join('');
        listEl.querySelectorAll('.kg-ach-chip').forEach(chip => {
            chip.onclick = () => window.openDetails(chip.dataset.kp);
        });
        const needMore = arr.length > 12;
        listEl.classList.toggle('collapsed', needMore);
        if (moreEl) {
            moreEl.hidden = !needMore;
            moreEl.innerText = `展开全部 ${arr.length} 个`;
            moreEl.onclick = () => { listEl.classList.remove('collapsed'); moreEl.hidden = true; };
        }
    };
    renderChips('kgAchSkilledChips', 'kgAchSkilledMore', skilled, `暂无 ≥${skilledLine}% 的${dimensionLabel()}`);
    renderChips('kgAchPassedChips', 'kgAchPassedMore', passed, `暂无 ${line}%–${skilledLine}% 的${dimensionLabel()}`);

    // 组标题与计数联动达标线
    const setText = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };
    setText('kgAchSkilledTitle', `熟练掌握（≥${skilledLine}%）`);
    setText('kgAchPassedTitle', `达标（${line}%–${skilledLine}%）`);
    setText('kgAchSkilledCnt', skilled.length ? `${skilled.length} 个` : '');
    setText('kgAchPassedCnt', passed.length ? `${passed.length} 个` : '');
}

// 总入口：一次性渲染 6 个子模块（知识点 / 能力维度下均展示，功能一致）
function renderKgDiagnosis() {
    const section = document.getElementById('kgDiagnosisSection');
    if (!section) return;
    if (!kgIndex.list.length) return;   // 索引未构建时跳过，initKnowledgeGraph 会重新触发
    renderKgStubList();
    renderKgFaultList();
    renderKgConfList();
    renderKgPitList();
    renderKgEvidenceOverview();
    renderKgAch();
    updateKgDiagTabStates();
    renderTeachAdvice();
}

/* ---------------- 教学建议（规则表驱动：汇总各诊断模块结论为可执行动作） ---------------- */

// 规则表：when(ctx) 决定条目是否出现，tone 定语义色，why(ctx) 生成数据依据，actions 为右侧按钮
const TEACH_ADVICE_RULES = [
    {
        id: 'stub', tone: 'red', title: '专项突破',
        when: c => c.stubs.length > 0,
        why: c => `${c.stubs.length} 个${dimensionLabel()}命中顽固薄弱（≥3 次失分率 ≥40%）：<b>${c.stubs.map(k => escapeHTML(k.name)).join('、')}</b>。重复讲题对结构性问题无效，建议安排专项课时。`,
        actions: [{ label: '查看顽固薄弱', ghost: true, run: () => gotoDiagTab('stub') }]
    },
    {
        id: 'fault', tone: 'orange', title: '前序补偿',
        when: c => c.faults.length > 0,
        why: c => {
            const roots = c.faults.filter(f => f.tr.rootCause);
            const ex = roots.length && roots[0].tr.root ? `（如「<b>${escapeHTML(roots[0].tr.root.name)}</b>」）` : '';
            if (roots.length) return `${c.faults.length} 个${dimensionLabel()}掌握度 &lt;60%，其中 <b>${roots.length}</b> 个根因在前序${ex}。直接讲薄弱点无效，须先补前序再讲当前。`;
            const breaks = c.faults.filter(f => f.tr.breaks.length);
            if (breaks.length) return `${c.faults.length} 个${dimensionLabel()}掌握度 &lt;60%，根因暂未定位：<b>${breaks.length}</b> 个前置暂无作答证据，须先诊断再归因。`;
            const cov = c.relCov === null ? '' : `（前置关系标注覆盖 <b>${c.relCov}%</b>）`;
            return `${c.faults.length} 个${dimensionLabel()}掌握度 &lt;60%，前置关系尚未建立${cov}，暂按同点巩固处理；题库补充标注后自动升级为前序归因。`;
        },
        actions: [{ label: '查看断层归因', ghost: true, run: () => gotoDiagTab('fault') }]
    },
    {
        id: 'conf', tone: 'amber', title: '成对辨析',
        when: () => confusionData.length > 0,
        why: () => {
            const top = confusionData.slice().sort((a, b) => b.cls - a.cls)[0];
            return `${confusionData.length} 对易混淆，最高「<b>${escapeHTML(top.a)} vs ${escapeHTML(top.b)}</b>」全班 ${top.cls} 人次。建议 10 分钟辨析课 + 学生互讲差异，替代无效刷题。`;
        },
        actions: [{ label: '查看易混淆', ghost: true, run: () => gotoDiagTab('conf') }]
    },
    {
        id: 'cause', tone: 'red', title: '限时短训',
        when: c => c.causeUp.length > 0,
        why: c => {
            const names = c.causeUp.map(d => `${escapeHTML(d.def.name)} +${d.delta}%`);
            const shown = names.slice(0, 3).join('、') + (names.length > 3 ? ` 等 <b>${names.length}</b> 项` : '');
            return `错因迁移：<b>${shown}</b> 占比持续上升。建议安排短时、高频率的针对性讲练，并优先讲解对应错因。`;
        },
        actions: [{ label: '查看错因分析', ghost: true, run: () => gotoCauseSection() }]
    },
    {
        id: 'maintain', tone: 'green', title: '减量维持',
        when: c => c.achCount > 0,
        why: c => `<b>${c.achCount}</b> 个${dimensionLabel()}已达掌握线（≥${masteryLevels[0].min}%）。建议转为每周 1 次滚动复测防回退，把课时让给薄弱项。`,
        actions: [{ label: '查看已达标', ghost: true, run: () => gotoDiagTab('ach') }]
    },
    {
        id: 'relbuild', tone: 'slate', title: '关系建设引导',
        when: c => c.relGaps.length > 0,
        why: c => {
            const top = c.relGaps.slice(0, 3).map(k => `<b>${escapeHTML(k.name)}</b>`).join('、');
            const confTxt = c.confEmpty ? '；易混淆对数据为空，建议同步补充' : '';
            return `<b>${c.relGaps.length}</b> 个薄弱${dimensionLabel()}尚无前置关系标注，前序归因能力受限。建议题库优先标注：${top}${confTxt}。`;
        },
        actions: [{ label: '查看断层归因', ghost: true, run: () => gotoDiagTab('fault') }]
    }
];

function renderTeachAdvice() {
    const box = document.getElementById('teachAdviceList');
    if (!box) return;
    const s = calcPeriodStats();
    const first = causeMatrix[0], last = causeMatrix[causeMatrix.length - 1];
    const causeUp = CAUSE_DEFS.map((c, i) => ({ def: c, delta: Math.round((last[i] - first[i]) * 10) / 10 }))
        .filter(d => d.delta >= 3).sort((a, b) => b.delta - a.delta);
    const faults = kgIndex.list.length ? kgCollectFaults() : [];
    // 冷启动引导：薄弱（顽固 ∪ 断层）且无前置关系条目的知识点，按失分热度排序供题库优先标注
    const relGaps = [...new Set([
        ...s.stubSorted.map(k => k.name),
        ...faults.map(f => f.node.name)
    ])].filter(n => !((kpRelations[n] && kpRelations[n].prerequisite) || []).length)
        .map(n => {
            const stub = s.stubSorted.find(k => k.name === n);
            const node = kgIndex.byName[n] ? kgIndex.byName[n].node : null;
            return { name: n, hot: stub ? stub.avg : (node ? 100 - masteryOf(node) : 0) };
        }).sort((a, b) => b.hot - a.hot);
    const ctx = {
        stubs: s.stubSorted,
        faults,
        causeUp,
        relCov: kgRelationCoverage(),
        relGaps,
        confEmpty: !confusionData.length,
        achCount: flattenTree(currentTree(), true).filter(n => masteryOf(n) >= masteryLevels[0].min).length
    };
    const items = TEACH_ADVICE_RULES.filter(r => r.when(ctx));
    box.innerHTML = items.length ? items.map(r => `
        <div class="advice-item tone-${r.tone}">
            <div class="advice-bd">
                <div class="advice-title">${r.title}</div>
                <div class="advice-why">${r.why(ctx)}</div>
            </div>
            <div class="advice-actions">${r.actions.map((a, i) =>
                `<button type="button" class="advice-btn${a.ghost ? ' ghost' : ''}" data-adv="${r.id}" data-act="${i}">${a.label}</button>`).join('')}
            </div>
        </div>`).join('')
        : '<div class="kg-diag-empty"><i class="fas fa-circle-check"></i> 本周期各项诊断均无异常，按既有教学节奏推进即可</div>';
    box.querySelectorAll('.advice-btn').forEach(b => {
        b.onclick = () => {
            const rule = TEACH_ADVICE_RULES.find(r => r.id === b.dataset.adv);
            if (rule) rule.actions[Number(b.dataset.act)].run(ctx);
        };
    });
    const expBtn = document.getElementById('btnExportAdvice');
    if (expBtn) expBtn.onclick = () => showProtoToast('教学建议单已导出（原型演示）');
    renderTeachAdviceSummary(items, ctx);
}

/* ---------------- 综合教学建议（教学路径 + 关注范围 + 使用场景） ---------------- */

const ADVICE_PLAN_META = {
    stub: { scene: '专项课时（连排 2 课时）' },
    fault: { scene: '新课前 10 分钟前置补偿' },
    conf: { scene: '课中 10 分钟辨析 + 学生互讲' },
    cause: { scene: '课后短时针对性讲练（隔天 1 次）' },
    gap: { scene: '优先补齐低于班级 10% 的差距项' },
    maintain: { scene: '每周 1 次滚动复测（防回退）' }
};
const ADVICE_PLAN_ORDER = ['fault', 'stub', 'conf', 'cause', 'gap', 'maintain'];

function renderTeachAdviceSummary(items, ctx, opts) {
    const box = document.getElementById((opts && opts.boxId) || 'teachAdviceSummary');
    if (!box) return;
    const planItems = ADVICE_PLAN_ORDER.map(id => items.find(r => r.id === id)).filter(Boolean);
    if (!planItems.length) {
        box.innerHTML = '';
        box.style.display = 'none';
        return;
    }
    box.style.display = '';
    const defaultScopeOf = id => {
        if (id === 'stub') return calcPeriodStats().stubSorted.map(k => k.name);
        if (id === 'maintain') return flattenTree(currentTree(), true).filter(n => masteryOf(n) >= masteryLevels[0].min).map(n => n.name);
        if (id === 'fault') {
            const faults = kgCollectFaults();
            const roots = faults.filter(x => x.tr.rootCause).map(x => x.tr.root.name);
            return roots.length ? roots : faults.map(x => x.node.name);
        }
        if (id === 'conf') return confusionData.slice().sort((a, b) => b.cls - a.cls).slice(0, 3).map(c => `${c.a} vs ${c.b}`);
        if (id === 'cause') {
            const first = causeMatrix[0], last = causeMatrix[causeMatrix.length - 1];
            return CAUSE_DEFS.map((c, i) => ({ name: c.name, delta: last[i] - first[i] })).filter(d => d.delta >= 3).map(d => d.name);
        }
        return [];
    };
    const scopeOf = id => [...new Set(opts && opts.scopeOf ? opts.scopeOf(id) : defaultScopeOf(id))];
    const steps = planItems.map((r, i) =>
        `<span class="adv-plan-step"><span class="adv-plan-no tone-${r.tone}">${i + 1}</span>${r.title}</span>`)
        .join('<i class="fas fa-arrow-right adv-plan-arrow"></i>');
    const parts = opts && opts.parts ? opts.parts : buildDefaultAdviceParts(items, ctx);
    const covNote = planItems.some(r => r.id === 'fault') && ctx.relCov !== null && ctx.relCov < 60
        ? `<div class="adv-summary-cov"><i class="fas fa-circle-info"></i> 前置关系标注覆盖 <b>${ctx.relCov}%</b> · 前序补偿按同点巩固口径，归因能力受限</div>`
        : '';
    const rows = planItems.map(r => {
        const scope = scopeOf(r.id);
        const scopeTxt = scope.length
            ? escapeHTML(scope.slice(0, 3).join('、')) + (scope.length > 3 ? ` 等 <b>${scope.length}</b> 项` : '')
            : '—';
        return `<tr>
            <td><span class="adv-plan-dot tone-${r.tone}"></span>${r.title}</td>
            <td class="adv-plan-scope" title="${escapeHTML(scope.join('、'))}">${scopeTxt}</td>
            <td class="adv-plan-scene">${ADVICE_PLAN_META[r.id].scene}</td>
        </tr>`;
    }).join('');
    const summaryTitle = (opts && opts.title) || '综合教学建议';
    box.innerHTML = `
        <div class="adv-summary-hd">
            <div class="adv-summary-title">${summaryTitle}</div>
            <div class="adv-summary-sub">将上方 ${planItems.length} 条建议按「先补差、再突破、后巩固」整合为一周期执行建议</div>
        </div>
        ${covNote}
        <div class="adv-plan-path">${steps}</div>
        <div class="adv-summary-text"><b>综合建议：</b>${parts.join('；')}。</div>
        <div class="adv-plan-table-wrap">
            <table class="adv-plan-table">
                <thead><tr><th>教学动作</th><th>关注范围</th><th>使用场景</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
        <div class="adv-summary-actions">
            <button type="button" class="advice-btn ghost" id="btnExportPlan"><i class="fas fa-file-export"></i> 导出建议</button>
        </div>`;
    const expPlanBtn = box.querySelector('#btnExportPlan');
    if (expPlanBtn) expPlanBtn.onclick = () => showProtoToast('综合教学建议已导出（原型演示）');
}

// 班级版综合建议文案模板：把各条 why 压缩为一句执行顺序（个人视角由 opts.parts 覆盖）
function buildDefaultAdviceParts(items, ctx) {
    const parts = [];
    if (items.find(r => r.id === 'fault')) {
        const rootCnt = ctx.faults.filter(f => f.tr.rootCause).length;
        parts.push(rootCnt
            ? `先补 <b>${rootCnt}</b> 个前序根因，否则当前薄弱点讲不透`
            : `直接对 <b>${ctx.faults.length}</b> 个断层点做同点巩固（前置关系未建，暂不归因）`);
    }
    if (items.find(r => r.id === 'stub')) parts.push(`再集中突破 <b>${ctx.stubs.length}</b> 个顽固薄弱`);
    if (items.find(r => r.id === 'conf')) parts.push('课中穿插成对辨析，替代重复刷题');
    if (items.find(r => r.id === 'cause')) parts.push('课后限时短训压制上升错因');
    if (items.find(r => r.id === 'maintain')) parts.push(`已达标 <b>${ctx.achCount}</b> 项转为滚动复测，让出课时`);
    return parts;
}

// 直达入口：教学建议 / 图谱详情 → 诊断区对应标签（切页签 + 切标签 + 滚动定位）
function gotoDiagTab(key) {
    switchMainTab('analysis');
    switchKgDiagTab(key);
    const sec = document.getElementById('kgDiagnosisSection');
    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function gotoCauseSection() {
    switchMainTab('analysis');
    const sec = document.getElementById('causeSection');
    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------------- 图谱诊断：标签切换与状态同步/* ---------------- 图谱诊断：标签切换与状态同步 ---------------- */

// 6 类诊断标签的计数读取口径（fault 计数为「根因数/断层总数」格式，断层总数取第二段）
const KG_DIAG_TAB_DEFS = [
    { key: 'stub', countId: 'kgStubCount', label: '顽固' },
    { key: 'fault', countId: 'kgFaultCount', label: '断层', parse: v => v.split('/')[1] },
    { key: 'conf', countId: 'kgConfCount', label: '混淆' },
    { key: 'pit', countId: 'kgPitCount', label: '易错' },
    { key: 'evidence', countId: 'kgEvidenceCount', label: '待诊断' },
    { key: 'ach', countId: 'kgAchCount', label: '已达标' }
];

function switchKgDiagTab(key) {
    document.querySelectorAll('#kgDiagTabs .kg-diag-tab').forEach(t => {
        const on = t.dataset.diag === key;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', String(on));
    });
    document.querySelectorAll('#kgDiagnosisSection .kg-diag-panel').forEach(p => {
        p.classList.toggle('active', p.dataset.diag === key);
    });
}

// 渲染后同步：计数为 0 的标签灰显（仍可点击查看空态）+ 右侧诊断摘要（点击直跳对应标签）
function updateKgDiagTabStates() {
    const overview = document.getElementById('kgDiagOverview');
    const parts = [];
    KG_DIAG_TAB_DEFS.forEach(d => {
        const cntEl = document.getElementById(d.countId);
        if (!cntEl) return;
        const raw = (cntEl.textContent || '0').trim();
        const num = parseInt(d.parse ? d.parse(raw) : raw, 10) || 0;
        const tab = document.querySelector(`#kgDiagTabs .kg-diag-tab[data-diag="${d.key}"]`);
        if (tab) tab.classList.toggle('is-empty', num === 0);
        parts.push(`<span class="kg-diag-ov-item" data-diag="${d.key}" title="查看${d.label}类诊断"><b>${num}</b> ${d.label}</span>`);
    });
    if (overview) {
        overview.innerHTML = parts.join('<span class="kg-diag-ov-sep">·</span>');
        overview.querySelectorAll('.kg-diag-ov-item').forEach(item => {
            item.onclick = () => switchKgDiagTab(item.dataset.diag);
        });
    }
}

/* ---------------- F14：关联诊断抽屉与分目的加练抽屉 ---------------- */

let relDiagTarget = null;   // 当前关联诊断抽屉目标知识点
let relDiagStudentCtx = null;   // 个人视角上下文（学生追踪图谱入口传入 { student, resolve }；班级口径入口为 null）
let drillTarget = null;     // 当前加练建议抽屉目标知识点
const drillState = { scopes: {}, retest: true };   // 各目的布置范围与复测开关

function evBadgeHtml(ev) {
    const d = REL_EVIDENCE_DEFS[ev.state];
    let text = d.label;
    if (ev.state === 'period') text = `周期内 ${ev.count} 场 · ${ev.rate}%`;
    if (ev.state === 'history') text = `历史证据 ${ev.rate}%（${ev.source}）`;
    // 徽章底色/文字色 = 该知识点掌握档位色（与图谱节点同源）；无证据 / 未学 无可比分数，沿用状态色
    const hex = (ev.state === 'period' || ev.state === 'history') ? statusOf(ev.rate).hexColor : null;
    const style = hex ? ` style="color:${hex};background:${hex}1f"` : '';
    return `<span class="kg-ev-badge ${d.cls}"${style} title="${d.label}">${text}</span>`;
}

// 前序区动作：按证据状态生成（未学仅衔接 / 无证据先诊断 / <70% 补练 / 尚可无需补练）
function prereqActionHtml(target, ev) {
    if (ev.state === 'unlearned') return '<span class="rd-rel-note">未学内容仅课堂衔接，不诊断、不加练</span>';
    if (ev.state === 'none') return `<button type="button" class="rd-mini-btn rd-btn-diag" data-act="diag" data-kp="${escapeHTML(target)}">查看分组建议</button>`;
    if (ev.rate < 70) return `<button type="button" class="rd-mini-btn rd-btn-pre" data-act="pre" data-kp="${escapeHTML(target)}">查看分组建议</button>`;
    return '<span class="rd-rel-note ok">前置表现尚可，暂无需补练</span>';
}

// 后序区动作：未学仅衔接；当前 ≥80% 才提供后续应用；其余掌握后再安排
function followUpActionHtml(target, ev, currentM) {
    if (ev.state === 'unlearned') return '<span class="rd-rel-note">未学内容，仅课堂衔接预告，不布置加练</span>';
    if (ev.state === 'none') return '<span class="rd-rel-note">暂无作答证据，待诊断 / 考查后评估</span>';
    if (currentM >= 80) return `<button type="button" class="rd-mini-btn rd-btn-next" data-act="next" data-kp="${escapeHTML(target)}">查看分组建议</button>`;
    return '<span class="rd-rel-note">当前知识点掌握后再安排</span>';
}

function openRelDiagDrawer(name, focusRelName, studentCtx) {
    if (!name || !kgIndex.byName[name]) return;
    closeDrillDrawer();   // 两抽屉互斥
    relDiagTarget = name;
    relDiagStudentCtx = studentCtx || null;   // 班级口径入口不传 → 无个人视角横幅
    renderRelDiagBody(name);
    const overlay = document.getElementById('relDiagOverlay');
    const drawer = document.getElementById('relDiagDrawer');
    if (overlay && drawer) {
        overlay.classList.add('open');
        drawer.classList.add('open');
        document.getElementById('relDiagBody').scrollTop = 0;
    }
    if (focusRelName) {
        setTimeout(() => {
            const row = document.querySelector(`#relDiagBody .rd-rel-row[data-kp="${focusRelName}"]`);
            if (row) {
                row.scrollIntoView({ block: 'center', behavior: 'smooth' });
                row.classList.add('rd-focus');
                setTimeout(() => row.classList.remove('rd-focus'), 2400);
            }
        }, 280);
    }
}

function closeRelDiagDrawer() {
    const overlay = document.getElementById('relDiagOverlay');
    const drawer = document.getElementById('relDiagDrawer');
    if (overlay) overlay.classList.remove('open');
    if (drawer) drawer.classList.remove('open');
}

// 关联诊断抽屉内容：头部 → 前序区 → 易混淆区 → 后序区 → 分组建议 → 判断红线
function renderRelDiagBody(name) {
    const body = document.getElementById('relDiagBody');
    if (!body) return;
    const info = kgIndex.byName[name];
    const node = info.node;
    const m = masteryOf(node);
    const st = statusOf(m);
    const ev = evidenceStateOf(name);
    const entry = kgEntryOf(name);
    const groups = groupsOf(name);
    const confHits = confusionData.filter(c => c.kp === name || c.a === name || c.b === name);

    const ownRate = ev.state === 'period'
        ? `<b style="color:${st.color}">${m.toFixed(1)}%</b>`
        : (ev.state === 'history'
            ? `<b style="color:${st.color}">${ev.rate}%</b> <em>（历史 ${escapeHTML(ev.source)}）</em>`
            : '<b>—</b> <em>（暂无周期证据，未知 ≠ 未掌握）</em>');

    const relSection = (title, color, keys, rowsHtml) => keys.length ? `
        <div class="rd-sec">
            <div class="rd-sec-title" style="color:${color}">${title} <span>${keys.length}</span></div>
            ${rowsHtml}
        </div>` : '';

    const preKeys = Object.keys(entry.prerequisite || {});
    const preRows = preKeys.map(t => {
        const evT = evidenceStateOf(t);
        const src = (entry.prerequisite[t] || []).filter(s => s !== name && s !== t);
        return `<div class="rd-rel-row" data-kp="${escapeHTML(t)}" ${src.length ? `title="来源子知识点：${escapeHTML(src.join('、'))}"` : ''}>
            <span class="rd-rel-chip rd-chip-neutral">前置</span>
            <span class="rd-rel-name" style="color:${kpHexOf(t)}">${escapeHTML(t)}</span>
            ${evBadgeHtml(evT)}
            <span class="rd-rel-act">${prereqActionHtml(t, evT)}</span>
        </div>`;
    }).join('');

    const confKeys = Object.keys(entry.confusable || {});
    const confRows = confKeys.map(t => {
        const evT = evidenceStateOf(t);
        const hit = confHits.find(c => c.a === t || c.b === t);
        const hitHtml = hit ? `<span class="rd-conf-hits">全班 ${hit.cls} 人次命中</span>` : '';
        return `<div class="rd-rel-row" data-kp="${escapeHTML(t)}">
            <span class="rd-rel-chip rd-chip-neutral">易混淆</span>
            <span class="rd-rel-name" style="color:${kpHexOf(t)}">${escapeHTML(t)}</span>
            ${evBadgeHtml(evT)}
            ${hitHtml}
            <span class="rd-rel-act"><button type="button" class="rd-mini-btn rd-btn-confuse" data-act="confuse" data-kp="${escapeHTML(t)}">查看分组建议</button></span>
        </div>`;
    }).join('');

    const nextKeys = Object.keys(entry.followUps || {});
    const nextRows = nextKeys.map(t => {
        const evT = evidenceStateOf(t);
        return `<div class="rd-rel-row" data-kp="${escapeHTML(t)}">
            <span class="rd-rel-chip rd-chip-neutral">后续</span>
            <span class="rd-rel-name" style="color:${kpHexOf(t)}">${escapeHTML(t)}</span>
            ${evBadgeHtml(evT)}
            <span class="rd-rel-act">${followUpActionHtml(t, evT, m)}</span>
        </div>`;
    }).join('');

    const GROUP_DEFS = [
        { key: 'diag' }, { key: 'pre' }, { key: 'solid' }, { key: 'next' }
    ];
    const groupsHtml = groups ? GROUP_DEFS.map(g => {
        const grp = groups[g.key];
        const md = DRILL_PURPOSE_META[g.key];
        const cnt = grp.students.length;
        const chips = grp.students.map(s => `<span class="rd-chip">${escapeHTML(s)}</span>`).join('');
        const extra = cnt
            ? `<div class="rd-group-chips">${chips}</div>
               <button type="button" class="rd-mini-btn rd-btn-${g.key}" data-act="${g.key}" data-kp="${escapeHTML(name)}">查看分组建议</button>`
            : '';
        return `<div class="rd-group-card g-${g.key} ${cnt ? '' : 'g-empty'}">
            <div class="rd-group-hd">
                <span class="rd-group-tag" style="background:${md.color}">${md.label}</span>
                <span class="rd-group-cnt">${cnt ? cnt + ' 人' : '本组无人'}</span>
            </div>
            <div class="rd-group-reason">${escapeHTML(grp.reason)}</div>
            ${extra}
        </div>`;
    }).join('') : '<div class="kg-diag-empty">暂无分组数据</div>';

    body.innerHTML = `
        ${(() => {
            // 个人视角横幅（学生追踪图谱入口）：resolve 按当前目标点实时取个人值，抽屉内切换知识点后横幅同步更新
            if (!relDiagStudentCtx) return '';
            const sd = relDiagStudentCtx.resolve ? relDiagStudentCtx.resolve(name) : null;
            if (!sd) return '';
            const sdDiff = Math.round((sd.mastery - sd.classMastery) * 10) / 10;
            return `<div class="rd-student-banner">
                <i class="fas fa-user-graduate"></i>
                个人视角：<b>${escapeHTML(relDiagStudentCtx.student)}</b> · 个人掌握 <b style="color:${statusOf(sd.mastery).color}">${sd.mastery.toFixed(1)}%</b> · 与班级差 ${sdDiff > 0 ? '+' : ''}${sdDiff}pp${sd.faultRoot ? ` · 个人断层根因 <b>${escapeHTML(sd.faultRoot)}</b> 未牢固` : ' · 该点无个人断层根因'}
                <span class="rd-student-banner-note">下方证据链与分组为班级口径</span>
            </div>`;
        })()}
        <div class="rd-head">
            <div class="rd-head-top">
                <span class="rd-level">${['', '一级', '二级', '三级'][node.level]}知识点</span>
                ${evBadgeHtml(ev)}
                <button type="button" class="rd-close-x" id="rdCloseX" aria-label="关闭关联诊断"><i class="fas fa-times"></i></button>
            </div>
            <h3 class="rd-title">${escapeHTML(name)}</h3>
            <div class="rd-path">${escapeHTML(info.path)}</div>
            <div class="rd-stats">
                <span>周期汇总 ${ownRate}</span>
                <span>档位 <b>${st.name}</b></span>
                <span>未掌握 <b>${node.unmasteredCount || 0}</b> 人</span>
            </div>
            ${node.level < 3 ? '<div class="rd-agg-tip">关联由子知识点聚合，已剔除模块内自关联；点击前置 / 后续名称可切换目标知识点</div>' : '<div class="rd-agg-tip">点击前置 / 后续名称可切换目标知识点</div>'}
        </div>
        ${relSection('前序 · 证据与补练建议', KP_RELATION_DEFS.prerequisite.color, preKeys, preRows)}
        ${relSection('易混淆 · 辨析建议', KP_RELATION_DEFS.confusable.color, confKeys, confRows)}
        ${relSection('后序 · 衔接与应用建议', '#22c55e', nextKeys, nextRows)}
        <div class="rd-sec">
            <div class="rd-sec-title" style="color:#0f172a">学生分组建议 <span>按知识点作答证据，非总分分层</span></div>
            <div class="rd-groups">${groupsHtml}</div>
        </div>
        <div class="rd-redline">
            <i class="fas fa-shield-halved"></i>
            判断边界：综合题失分 ≠ 全关联薄弱；班级均值 ≠ 人人有问题；无作答证据 = 未知，先诊断再下结论。
        </div>`;

    const closeX = document.getElementById('rdCloseX');
    if (closeX) closeX.onclick = closeRelDiagDrawer;
    // 快捷按钮 → 分目的加练抽屉定位对应目的区
    body.querySelectorAll('.rd-mini-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            openDrillDrawer(name, btn.dataset.act);
        };
    });
    // 关系行名称点击 → 抽屉内切换目标知识点
    body.querySelectorAll('.rd-rel-row .rd-rel-name').forEach(el => {
        el.onclick = () => {
            const t = el.closest('.rd-rel-row').dataset.kp;
            if (t && kgIndex.byName[t]) {
                relDiagTarget = t;
                renderRelDiagBody(t);
                body.scrollTop = 0;
            }
        };
    });
}

// 分组教学建议范围：各目的练的知识点不同（与关联诊断抽屉前序/混淆/后续行同源）
// diag=暂无证据前置（未知先诊断）/ pre=有证据且<70%前置（升序，最弱在前）/ confuse=当前点+易混淆项（成对）
// solid=当前点+子知识点 / next=后序知识点 / 其余（retest）=当前点（同点换情境红线）
function drillSecScope(name, secKey) {
    const entry = kgEntryOf(name);
    const pres = Object.keys(entry.prerequisite || {});
    switch (secKey) {
        case 'diag':
            return pres.filter(p => evidenceStateOf(p).state === 'none');
        case 'pre':
            return pres
                .map(p => ({ p, ev: evidenceStateOf(p) }))
                .filter(x => (x.ev.state === 'period' || x.ev.state === 'history') && x.ev.rate < 70)
                .sort((a, b) => a.ev.rate - b.ev.rate)
                .map(x => x.p);
        case 'confuse':
            return [name, ...Object.keys(entry.confusable || {})];
        case 'solid': {
            const kids = (kgIndex.byName[name].node.children || []).map(c => c.name).filter(n => kgIndex.byName[n]);
            return [name, ...kids];
        }
        case 'next':
            return Object.keys(entry.followUps || {});
        default:
            return [name];
    }
}

// 分目的加练抽屉：目的区派生（diag→pre→confuse→solid→next，非空才显示；触发条件见 PRD 9.4.6）
function drillSectionsOf(name) {
    const node = kgIndex.byName[name].node;
    const m = masteryOf(node);
    const groups = groupsOf(name) || {
        diag: { students: [], reason: '' }, pre: { students: [], reason: '' },
        solid: { students: [], reason: '' }, next: { students: [], reason: '' }
    };
    const entry = kgEntryOf(name);
    const confKeys = Object.keys(entry.confusable || {});
    const confHits = confusionData.filter(c => c.kp === name || c.a === name || c.b === name);

    const secs = [];
    if (groups.diag.students.length) secs.push({ key: 'diag', students: groups.diag.students, basis: groups.diag.reason, scopeKps: drillSecScope(name, 'diag') });
    if (groups.pre.students.length) secs.push({ key: 'pre', students: groups.pre.students, basis: groups.pre.reason, scopeKps: drillSecScope(name, 'pre') });
    if (confKeys.length) {
        const hitTxt = confHits.length ? `，全班合计命中 ${confHits.reduce((s, h) => s + h.cls, 0)} 人次` : '（暂无命中记录）';
        secs.push({ key: 'confuse', students: null, scope: 'class', basis: `教研标注易混淆：${confKeys.join('、')}${hitTxt}，成对对比替代无效刷题`, scopeKps: drillSecScope(name, 'confuse') });
    }
    if (m < 80 && groups.solid.students.length) {
        secs.push({ key: 'solid', students: groups.solid.students, basis: `${groups.solid.reason}；目标周期汇总 ${Math.round(m)}% <80%`, scopeKps: drillSecScope(name, 'solid') });
    }
    if (groups.next.students.length) {
        secs.push({
            key: 'next', students: groups.next.students, basis: groups.next.reason,
            warn: m < 80 ? `目标周期汇总 ${Math.round(m)}% <80%，建议先完成同点巩固，再进入后续应用` : '',
            scopeKps: drillSecScope(name, 'next')
        });
    }
    return { secs, m, groups };
}

// 布置名单：仅名单学生 → chips；全班关注 → 统一文案（概念辨析无学生粒度名单，固定全班）
function drillRosterHtml(sec, scope) {
    if (!sec.students) return '<div class="drill-roster all"><i class="fas fa-users"></i> 全班关注</div>';
    if (scope === 'class') return '<div class="drill-roster all"><i class="fas fa-users"></i> 全班关注（名单学生重点跟进）</div>';
    return `<div class="drill-roster">${sec.students.map(s => `<span class="rd-chip">${escapeHTML(s)}</span>`).join('')}</div>`;
}

function drillSectionHtml(sec) {
    const md = DRILL_PURPOSE_META[sec.key];
    const scope = drillState.scopes[sec.key] || sec.scope || 'list';
    const cnt = sec.students ? sec.students.length : null;
    const warnHtml = sec.warn ? `<div class="drill-warn"><i class="fas fa-triangle-exclamation"></i>${escapeHTML(sec.warn)}</div>` : '';
    const focus = sec.scopeKps && sec.scopeKps.length ? sec.scopeKps.join('、') : '按课堂诊断结果确定';
    return `<div class="drill-sec" data-act="${sec.key}">
        <div class="drill-sec-hd">
            <span class="drill-sec-tag" style="background:${md.color}">${md.label}</span>
        </div>
        <div class="drill-sec-desc">${escapeHTML(md.desc)}</div>
        ${cnt !== null ? `<div class="drill-scope">
            <label><input type="radio" name="scope_${sec.key}" value="list" ${scope === 'list' ? 'checked' : ''}> 仅名单学生 ${cnt} 人</label>
            <label><input type="radio" name="scope_${sec.key}" value="class" ${scope === 'class' ? 'checked' : ''}> 全班关注</label>
        </div>` : ''}
        ${drillRosterHtml(sec, scope)}
        ${warnHtml}
        <div class="drill-basis">关注范围：${escapeHTML(focus)}</div>
        <div class="drill-basis">依据：${escapeHTML(sec.basis)}</div>
    </div>`;
}

// 效果验证区：// 复测区：存在任一补练类目的时自动附带，开关可控（关闭仅不纳入计数与导出）
function drillRetestHtml(secs) {
    if (!secs.length) return '';
    const md = DRILL_PURPOSE_META.retest;
    return `<div class="drill-sec drill-sec-retest ${drillState.retest ? '' : 'off'}" data-act="retest">
        <div class="drill-sec-hd">
            <span class="drill-sec-tag" style="background:${md.color}">${md.label}</span>
            <label class="drill-toggle"><input type="checkbox" id="drillRetestChk" ${drillState.retest ? 'checked' : ''}> 附带效果验证建议</label>
        </div>
        <div class="drill-sec-desc">${escapeHTML(md.desc)}</div>
        <div class="drill-basis">原题订正只记订正完成，不直接计为掌握；须结合后续表现再次确认。</div>
    </div>`;
}

// 分组教学建议抽屉内容：// 分目的加练抽屉内容：头部 → 目的区 → 复测区 → 汇总计数
function renderDrillBody(name) {
    const body = document.getElementById('drillBody');
    if (!body) return;
    const info = kgIndex.byName[name];
    const node = info.node;
    const m = masteryOf(node);
    const st = statusOf(m);
    const ev = evidenceStateOf(name);
    const { secs } = drillSectionsOf(name);
    if (!secs.length) {
        body.innerHTML = `<div class="drill-empty"><i class="fas fa-circle-check"></i>当前知识点暂无需要分组干预的教学建议<br><em>前置均有证据且达标、周期汇总 ≥80%、无易混淆标注</em></div>`;
        updateDrillSummary([]);
        return;
    }
    const ownRate = ev.state === 'period'
        ? `<b style="color:${st.color}">${m.toFixed(1)}%</b>（周期内 ${ev.count} 场汇总）`
        : (ev.state === 'history'
            ? `<b style="color:${st.color}">${ev.rate}%</b>（历史证据 · ${escapeHTML(ev.source)}）`
            : '<b>—</b>（暂无周期证据）');
    body.innerHTML = `
        <div class="rd-head">
            <div class="rd-head-top">
                <span class="rd-level">${['', '一级', '二级', '三级'][node.level]}知识点</span>
                ${evBadgeHtml(ev)}
            </div>
            <h3 class="rd-title">${escapeHTML(name)} · 分组教学建议</h3>
            <div class="rd-path">${escapeHTML(info.path)}</div>
            <div class="rd-stats">
                <span>周期汇总 ${ownRate}</span>
                <span>档位 <b>${st.name}</b></span>
                <span>未掌握 <b>${node.unmasteredCount || 0}</b> 人</span>
            </div>
            <div class="rd-agg-tip">本页仅输出教学动作、关注范围、建议对象与判定依据，不包含题目内容。</div>
        </div>
        ${secs.map(sec => drillSectionHtml(sec)).join('')}
        ${drillRetestHtml(secs)}
        <div class="drill-summary" id="drillSummary"></div>`;
    bindDrillBodyEvents(secs);
    updateDrillSummary(secs);
}

// 抽屉内交互：// 抽屉内交互：布置范围切换（局部更新名单，不动滚动位置）/ 复测开关（联动计数）
function bindDrillBodyEvents(secs) {
    const body = document.getElementById('drillBody');
    if (!body) return;
    body.querySelectorAll('.drill-scope input[type="radio"]').forEach(radio => {
        radio.onchange = () => {
            const key = radio.name.replace('scope_', '');
            drillState.scopes[key] = radio.value;
            const sec = secs.find(s => s.key === key);
            const box = radio.closest('.drill-sec').querySelector('.drill-roster');
            if (box && sec) box.outerHTML = drillRosterHtml(sec, radio.value);
        };
    });
    const chk = document.getElementById('drillRetestChk');
    if (chk) chk.onchange = () => {
        drillState.retest = chk.checked;
        chk.closest('.drill-sec-retest')?.classList.toggle('off', !chk.checked);
        updateDrillSummary(secs);
    };
}

// 底部摘要：仅汇总建议类别，不输出题量或组卷信息
function updateDrillSummary(secs) {
    const el = document.getElementById('drillSummary');
    if (!el) return;
    if (!secs || !secs.length) {
        el.classList.add('empty');
        el.innerText = '暂无需分组干预的教学建议';
        return;
    }
    el.classList.remove('empty');
    el.innerHTML = `共 <b>${secs.length}</b> 类教学建议${drillState.retest ? ' · 含效果验证' : ''}`;
}

function openDrillDrawer(name, purposeKey) {
    if (!name || !kgIndex.byName[name]) return;
    closeRelDiagDrawer();   // 两抽屉互斥
    drillTarget = name;
    renderDrillBody(name);
    const overlay = document.getElementById('drillOverlay');
    const drawer = document.getElementById('drillDrawer');
    if (overlay && drawer) {
        overlay.classList.add('open');
        drawer.classList.add('open');
        document.getElementById('drillBody').scrollTop = 0;
    }
    // 从关联诊断前序 / 分组快捷按钮进入时，定位并高亮对应目的区
    if (purposeKey) {
        setTimeout(() => {
            const sec = document.querySelector(`#drillBody .drill-sec[data-act="${purposeKey}"]`);
            if (sec) {
                sec.scrollIntoView({ block: 'center', behavior: 'smooth' });
                sec.classList.add('rd-focus');
                setTimeout(() => sec.classList.remove('rd-focus'), 2400);
            }
        }, 280);
    }
}

function closeDrillDrawer() {
    const overlay = document.getElementById('drillOverlay');
    const drawer = document.getElementById('drillDrawer');
    if (overlay) overlay.classList.remove('open');
    if (drawer) drawer.classList.remove('open');
}

// 导出分组教学建议 CSV（不包含题量、题型、难度或题目内容）
function exportDrillAdvice() {
    if (!drillTarget || !kgIndex.byName[drillTarget]) return;
    const { secs } = drillSectionsOf(drillTarget);
    if (!secs.length) return;
    const verifyNote = drillState.retest ? '结合后续课堂反馈或既有任务验证掌握情况' : '';
    const rows = [['教学动作', '目标知识点', '关注范围', '建议对象', '学生名单', '判定依据', '效果验证']];
    secs.forEach(sec => {
        const md = DRILL_PURPOSE_META[sec.key];
        const scope = drillState.scopes[sec.key] || sec.scope || 'list';
        const focus = sec.scopeKps && sec.scopeKps.length ? sec.scopeKps.join('、') : '按课堂诊断结果确定';
        rows.push([
            md.label, drillTarget, focus,
            scope === 'class' ? '全班关注' : '仅名单学生',
            sec.students ? sec.students.join('、') : '全班',
            sec.basis, verifyNote
        ]);
    });
    downloadCSV(`学科学情_分组教学建议_${drillTarget}.csv`, rows);
}

// 复制纯文本建议摘要// 复制纯文本建议摘要（剪贴板 API，失败降级 execCommand）
function copyDrillAdvice(btn) {
    if (!drillTarget || !kgIndex.byName[drillTarget]) return;
    const { secs, m } = drillSectionsOf(drillTarget);
    if (!secs.length) return;
    const lines = [`【${drillTarget} · 分组教学建议】周期汇总 ${m.toFixed(1)}%`];
    secs.forEach(sec => {
        const md = DRILL_PURPOSE_META[sec.key];
        const scope = drillState.scopes[sec.key] || sec.scope || 'list';
        const roster = sec.students
            ? (scope === 'list' ? `名单 ${sec.students.length} 人：${sec.students.join('、')}` : '全班关注（名单学生重点跟进）')
            : '全班关注';
        const focus = sec.scopeKps && sec.scopeKps.length ? sec.scopeKps.join('、') : '按课堂诊断结果确定';
        lines.push(`· ${md.label}｜关注范围：${focus}｜${roster}`);
        lines.push(`  教学建议：${md.desc}`);
        lines.push(`  依据：${sec.basis}`);
        if (sec.warn) lines.push(`  提示：${sec.warn}`);
    });
    if (drillState.retest) lines.push('· 效果验证｜结合后续课堂反馈或既有任务确认掌握情况');
    const text = lines.join('\n');
    const done = () => {
        if (!btn) return;
        const old = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> 已复制';
        setTimeout(() => { btn.innerHTML = old; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
        fallbackCopy(text, done);
    }
}

function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* 原型环境忽略 */ }
    document.body.removeChild(ta);
}

/* ---------------- 详情视图 ---------------- */

function openDetails(name) {
    El.detailsView.classList.add('show');
    currentDetailType = 'all';
    document.querySelectorAll('#detailsTypeFilter span').forEach(s => s.classList.toggle('active', s.dataset.type === 'all'));
    renderDetailsSidebar(name);
}
window.openDetails = openDetails;

function renderDetailsSidebar(initialActiveName) {
    const list = currentTree().children || [];
    El.detailsSidebarList.innerHTML = '';
    El.detailsSidebarLabel.innerText = dimensionLabel();

    list.forEach((node, index) => {
        const mastery = masteryOf(node);
        const icon = iconOf(1);
        const isActive = initialActiveName ? node.name === initialActiveName : index === 0;
        const div = document.createElement('div');
        div.className = `details-sidebar-item ${isActive ? 'active' : ''}`;
        div.dataset.name = node.name;
        div.innerHTML = `
            <div class="sidebar-item-left">
                <span class="tree-node-icon ${icon.c}" style="transform: scale(0.85);">${icon.t}</span>
                <span>${escapeHTML(node.name)}</span>
            </div>
            <span style="font-weight: 700; flex-shrink:0; color:${statusOf(mastery).color}">${formatRate(mastery)}</span>
        `;
        div.onclick = () => {
            El.detailsSidebarList.querySelectorAll('.details-sidebar-item').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            selectDetailItem(node);
        };
        El.detailsSidebarList.appendChild(div);
    });

    const active = list.find(n => n.name === initialActiveName) || list[0];
    if (active) selectDetailItem(active);
}

function selectDetailItem(node) {
    currentDetailItem = node;
    renderDetailsTable(node);
    if (document.getElementById('btnDetailsChart').classList.contains('active')) {
        renderDetailsChart(node);
        myDetailsChart?.resize();
    }
}

function detailRowsOf(name) {
    return detailSource()[name] || [];
}

function renderDetailsTable(node) {
    const all = detailRowsOf(node.name);
    const list = currentDetailType === 'all' ? all : all.filter(t => t.type === currentDetailType);

    El.detailsTableBody.innerHTML = list.length
        ? list.map(t => `<tr>
            <td style="text-align:left;">${escapeHTML(t.name)}</td>
            <td>${t.qno || '--'}</td>
            <td style="color:${statusOf(t.rate).color}; font-weight:700;">${t.rate}%</td>
            <td>${t.gradeRate}%</td>
            <td><span class="action-link" style="justify-content:center;" onclick="window.openReviewPage('${t.name}', '${t.type === 'exam' ? '试卷讲评页' : '作业讲评页'}')" title="跳转至该次${t.type === 'exam' ? '考试' : '作业'}讲评页（原型演示）">查看详情</span></td>
        </tr>`).join('')
        : `<tr><td colspan="5" style="padding: 40px; color: var(--text-muted);">暂无数据</td></tr>`;
}

// XK-11 操作列：行内「查看详情」→ 跳转该次作业 / 考试的讲评页
// 原型阶段仅 toast 提示；真实接入后按任务名路由至讲评模块（对接口径同「选题与布置由题库 / 讲评页承接」）
function openReviewPage(taskName, pageLabel) {
    mainToast(`已跳转至${pageLabel}：${taskName}（原型演示，待接入讲评模块）`);
}
window.openReviewPage = openReviewPage;

function renderDetailsChart(node) {
    if (!window.echarts) {
        setTimeout(() => renderDetailsChart(node), 500);
        return;
    }
    if (!myDetailsChart) myDetailsChart = echarts.getInstanceByDom(El.detailsChartContainer) || echarts.init(El.detailsChartContainer);

    const all = detailRowsOf(node.name);
    const list = currentDetailType === 'all' ? all : all.filter(t => t.type === currentDetailType);

    if (!list.length) {
        myDetailsChart.clear();
        myDetailsChart.setOption({
            title: { text: '暂无趋势数据', left: 'center', top: 'middle', textStyle: { color: '#94a3b8', fontSize: 14, fontWeight: 'normal' } }
        });
        return;
    }

    const names = list.map(t => t.name);
    myDetailsChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['班级得分率', '年级得分率'], top: 0 },
        grid: { left: 60, right: 40, top: 48, bottom: 72 },
        xAxis: {
            type: 'category',
            data: names,
            axisLabel: {
                interval: 0,
                rotate: names.length > 2 ? 15 : 0,
                formatter: (v) => v.length > 10 ? v.slice(0, 10) + '…' : v
            }
        },
        yAxis: { type: 'value', max: 100, name: '得分率(%)' },
        series: [
            {
                name: '班级得分率', type: 'line', data: list.map(t => t.rate), smooth: true,
                lineStyle: { width: 3 }, itemStyle: { color: '#3b82f6' },
                areaStyle: { color: 'rgba(59, 130, 246, 0.08)' }
            },
            {
                name: '年级得分率', type: 'line', data: list.map(t => t.gradeRate), smooth: true,
                lineStyle: { width: 2, type: 'dashed' }, itemStyle: { color: '#94a3b8' }
            }
        ]
    }, true);
    myDetailsChart.resize();
}

/* ---------------- 弹窗：学情来源 ---------------- */

function renderModalList() {
    renderSourceColumn(ModalData.assignments, El.modalAssignList, El.checkAllAssignments, El.assignEmpty);
    renderSourceColumn(ModalData.exams, El.modalExamList, El.checkAllExams, El.examEmpty);
    updateSourceCounts();
    syncScopeEcho();   // 勾选变化即时同步弹窗底栏与外部胶囊的已选份数
}

function renderSourceColumn(list, container, checkAll, emptyEl) {
    if (!container) return;
    if (list.length === 0) {
        container.innerHTML = '';
        checkAll.checked = false;
        emptyEl.style.display = 'flex';
        return;
    }
    emptyEl.style.display = 'none';
    checkAll.checked = list.every(item => item.checked);

    container.innerHTML = list.map(item => `
        <label class="check-item">
            <input type="checkbox" class="modal-item-checkbox" data-id="${item.id}" ${item.checked ? 'checked' : ''}>
            <i class="fas fa-folder"></i>
            <span title="${escapeHTML(item.name)}">${escapeHTML(item.name)}</span>
            ${item.date ? `<span class="item-date">${item.date}</span>` : ''}
        </label>
    `).join('');

    container.querySelectorAll('.modal-item-checkbox').forEach(cb => {
        cb.onchange = (e) => {
            const item = list.find(i => i.id === e.target.dataset.id);
            if (item) item.checked = e.target.checked;
            renderModalList();
        };
    });
}

function updateSourceCounts() {
    const aChecked = ModalData.assignments.filter(i => i.checked).length;
    const eChecked = ModalData.exams.filter(i => i.checked).length;
    const elA = document.getElementById('labelAssignCount');
    const elE = document.getElementById('labelExamCount');
    if (elA) elA.innerText = `(${aChecked}/${ModalData.assignments.length})`;
    if (elE) elE.innerText = `(${eChecked}/${ModalData.exams.length})`;
}

// 时间范围回显文案：按当前激活档位与对应日期控件生成（弹窗内设定 → 外部胶囊 / 弹窗底栏同源回显）
function timeScopeText() {
    const active = document.querySelector('#timeSegment .segment-btn.active');
    const seg = active ? active.textContent.trim() : '月';
    const val = id => { const el = document.getElementById(id); return el ? el.value : ''; };
    if (seg === '学年') return val('yearPickSelect') || '—';
    if (seg === '月') {
        const m = val('monthPickInput');
        if (!m) return '—';
        const parts = m.split('-');
        return `${parts[0]}年${Number(parts[1])}月`;
    }
    if (seg === '周') {
        const w = val('weekPickInput');
        const hint = document.getElementById('weekPickHint');
        const range = hint && hint.innerText && hint.innerText !== '--' ? `（${hint.innerText}）` : '';
        return w ? `${w}${range}` : '—';
    }
    const s = val('customDateStart'), e = val('customDateEnd');
    return s && e ? `${s} ~ ${e}` : '—';
}

// 回显同步：筛选栏胶囊（时间范围 · 已选 N 份）+ 弹窗底栏当前范围，两处同读一份口径
function syncScopeEcho() {
    const total = ModalData.assignments.filter(a => a.checked).length + ModalData.exams.filter(e => e.checked).length;
    const range = timeScopeText();
    const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    set('filterRangeText', range);
    set('filterCountText', `已选 ${total} 份`);
    set('modalRangeEcho', range);
    set('modalCountEcho', `已选 ${total} 份`);
    if (El.filterCount) El.filterCount.title = `统计范围 ${range} · 已选 ${total} 份（点击设置时间范围与学情来源）`;
}

function updateFilterCount() {
    syncScopeEcho();
}

/* ---------------- 筛选栏：年级/班级二级菜单 ---------------- */

function updateCascadeValue() {
    El.cascadeValue.textContent = cascadeState.class === '全部班级'
        ? `${cascadeState.grade}·全部班级`
        : `${cascadeState.grade}${cascadeState.class}`;
}

// 摘要卡随班级筛选联动：选中具体班级 → 班级/年级均分双卡并列；「全部班级」→ 仅年级卡（无单一班级口径）
function syncSummaryCards() {
    if (El.cardSummary4) El.cardSummary4.hidden = cascadeState.class === '全部班级';
}

function renderCascadeClasses() {
    const classes = gradeClassData[browseGrade] || [];
    const isSelectedGrade = browseGrade === cascadeState.grade;
    El.cascadeClasses.innerHTML = classes.map(c => `
        <li data-class="${c}" class="${isSelectedGrade && c === cascadeState.class ? 'active' : ''}">${c}</li>
    `).join('');
    El.cascadeClasses.querySelectorAll('li').forEach(li => {
        li.onclick = (e) => {
            e.stopPropagation();
            cascadeState.grade = browseGrade;
            cascadeState.class = li.dataset.class;
            updateCascadeValue();
            renderCascadeClasses();
            syncSummaryCards();   // 班级卡显隐联动（年级切换不影响 class，无需处理）
            El.gradeClassCascade.classList.remove('open');
        };
    });
}

function initCascadeMenu() {
    El.cascadeGrades.querySelectorAll('li').forEach(li => {
        li.classList.toggle('active', li.dataset.grade === browseGrade);
        li.onclick = (e) => {
            e.stopPropagation();
            browseGrade = li.dataset.grade;
            El.cascadeGrades.querySelectorAll('li').forEach(x => x.classList.remove('active'));
            li.classList.add('active');
            renderCascadeClasses();
        };
    });
    renderCascadeClasses();
    updateCascadeValue();
}

/* ---------------- 弹窗：掌握程度 ---------------- */

/* 姓名脱敏：姓 + 中间字星号（每字一个 *）+ 名末字 +（账号后四位）
 * 两字姓名：张伟 / T10032 → 张*（0032）（中间字为零时固定给一个 *，避免完全裸露）
 * 三字姓名：王建国 / T10088 → 王*国（0088）；四字：欧阳建国 → 欧**国
 * 单字姓名按两字规则处理（李 → 李*）；账号后四位是对同性同名、同掩码的最终区分手段 */
function desensitizeName(name, account) {
    const s = String(name || '').trim();
    const rawAcc = String(account || '').trim();
    const tail = rawAcc.length >= 4 ? rawAcc.slice(-4) : rawAcc.padStart(4, '0');
    if (!s) return `（${tail}）`;
    if (s.length === 1) return `${s}*（${tail}）`;
    if (s.length === 2) return `${s.charAt(0)}*（${tail}）`;
    return `${s.charAt(0)}${'*'.repeat(s.length - 2)}${s.charAt(s.length - 1)}（${tail}）`;
}

function currentRoleInfo() {
    return AUTH_ROLES[currentRoleKey] || AUTH_ROLES.teacher;
}

// 写权限：仅学科组长及以上（学科组长 / 教研主任）
function canEditMastery() {
    return !!currentRoleInfo().canEdit;
}

// 保存时间：yyyy-MM-dd HH:mm（本地时区）
function nowStamp() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// 最后一次保存留痕：时间 + 脱敏操作人 + 操作时角色
function renderMasteryAudit() {
    const t = document.getElementById('masteryAuditTime');
    const u = document.getElementById('masteryAuditUser');
    if (t) t.textContent = masteryState.time || '—';
    if (u) u.textContent = `${desensitizeName(masteryState.operator, masteryState.account)} · ${masteryState.role}`;
}

/* 权限态同步：入口胶囊（图标 / 文案）+ 弹窗（提示条 / 单选禁用 / 按钮）
 * 只读角色仍可打开弹窗查看当前档位，但无法修改确认 */
function syncMasteryPermissionUI() {
    const role = currentRoleInfo();
    const editable = role.canEdit;

    const btn = document.getElementById('btnMasterySetup');
    if (btn) {
        btn.classList.toggle('is-readonly', !editable);
        btn.title = editable
            ? `当前角色：${role.label} · 可修改掌握程度档位（全校共用）`
            : `当前角色：${role.label}（只读） · 仅学科组长及以上可修改，如需调整请联系学科组长`;
        const icon = document.getElementById('masterySetupIcon');
        if (icon) icon.className = editable ? 'fas fa-cog' : 'fas fa-lock';
        const text = document.getElementById('masterySetupText');
        if (text) text.textContent = editable ? '设置掌握程度' : '查看掌握程度';
            }

    // 弹窗内权限说明条已取消：只读态不再用文案说明，改由「控件禁用 + 隐藏提交按钮」表达
    // 留痕条右侧提示：只读时改为权限引导
    const auditTip = document.getElementById('masteryAuditTip');
    if (auditTip) {
        auditTip.textContent = editable ? '修改将同步全体教师' : '如需调整请联系学科组长';
    }

    const panel = document.getElementById('masterySetupPanel');
    if (panel) panel.classList.toggle('is-readonly', !editable);
    document.querySelectorAll('input[name="masteryLevel"]').forEach(r => { r.disabled = !editable; });

    const confirmBtn = document.getElementById('btnConfirmMastery');
    if (confirmBtn) {
        confirmBtn.disabled = !editable;
        confirmBtn.title = editable ? '' : '当前角色无修改权限';
    }
    // 只读态不渲染取消 / 确认（CSS 隐藏），无需改文案，关闭统一走右上角 ×
}

function renderMasteryLevels(count) {
    const config = MASTERY_PRESETS[count] || MASTERY_PRESETS[3];
    El.masteryLevelContainer.innerHTML = config.map((c, i) => {
        const isLast = i === config.length - 1;
        return `
            <div class="level-config-item">
                <span class="level-name">${c.name}：</span>
                <div class="range-input white">${c.min} %</div>
                <span class="range-symbol">${isLast ? '≤' : '<'}</span>
                <span class="range-text">得分率</span>
                <span class="range-symbol">≤</span>
                <div class="range-input">${c.max} %</div>
            </div>`;
    }).join('');
}

function openMasteryModal() {
    El.masteryModal.classList.add('show');
    // 快照当前版本：确认时与最新版本比对识别并发写入
    masteryModalBaseVersion = masteryState.version;
    // 回填【已生效】档位：上次未保存的选择不残留
    const activeCount = MASTERY_PRESETS[masteryState.levelCount] ? masteryState.levelCount : masteryLevelCount;
    document.querySelectorAll('input[name="masteryLevel"]').forEach(r => { r.checked = Number(r.value) === activeCount; });
    renderMasteryLevels(activeCount);
    renderMasteryAudit();
    hideMasteryConflict();
    syncMasteryPermissionUI();
}
function closeMasteryModal() {
    El.masteryModal.classList.remove('show');
    hideMasteryConflict();
}

/* 保存：统一入口（正常确认 / 冲突时确认覆盖 / 演示模拟他人保存共用）
 * 以最后一次保存为准——每次成功保存都把 version + 1 并覆写留痕 */
function applyMasterySave(levelCount, operator) {
    const who = operator || { name: currentRoleInfo().name, account: currentRoleInfo().account, role: currentRoleInfo().label };
    masteryLevelCount = levelCount;
    masteryLevels = MASTERY_PRESETS[masteryLevelCount].map(l => ({ ...l }));
    masteryState = {
        version: masteryState.version + 1,
        time: nowStamp(),
        operator: who.name,
        account: who.account,
        role: who.role,
        levelCount: masteryLevelCount
    };
    renderMasteryAudit();
    // 档位变更后主面板配色、状态与统计实时刷新
    refreshDashboard();
    // 全校共用档位：同步学生追踪-知识点分析（stKpStatus 委托 statusOf；视图隐藏时图表自跳过，切回由 stShowView/stKpActivate 补渲）
    if (window.StudentBridge && typeof window.StudentBridge.onMasteryChanged === 'function') window.StudentBridge.onMasteryChanged();
}

// 冲突提示：打开弹窗后配置已被他人保存（不再静默覆盖）
function showMasteryConflict() {
    const bar = document.getElementById('masteryConflictBar');
    const txt = document.getElementById('masteryConflictText');
    if (txt) {
        txt.textContent = `该设置已于 ${masteryState.time} 被 ${desensitizeName(masteryState.operator, masteryState.account)}·${masteryState.role} 保存为 ${masteryState.levelCount} 档。`;
    }
    if (bar) bar.classList.add('show');
    const confirmBtn = document.getElementById('btnConfirmMastery');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.title = '请先在冲突提示中选择处理方式';
    }
}

function hideMasteryConflict() {
    const bar = document.getElementById('masteryConflictBar');
    if (bar) bar.classList.remove('show');
    const confirmBtn = document.getElementById('btnConfirmMastery');
    if (confirmBtn) {
        confirmBtn.disabled = !canEditMastery();
        confirmBtn.title = canEditMastery() ? '' : '当前角色无修改权限';
    }
}

function confirmMastery() {
    // 权限护栏：只读角色即使程序绕过按钮也不写档位（纯查看后关闭）
    if (!canEditMastery()) {
        closeMasteryModal();
        return;
    }
    // 并发护栏：打开弹窗后配置被他人保存 → 先提示，由用户决定覆盖或采用最新
    if (masteryState.version !== masteryModalBaseVersion) {
        showMasteryConflict();
        return;
    }
    const checked = document.querySelector('input[name="masteryLevel"]:checked');
    applyMasterySave(Number(checked ? checked.value : masteryLevelCount));
    closeMasteryModal();
}

/* 原型演示：模拟另一位组长在当前用户打开弹窗期间保存档位
 * 真实系统由后端推送 / 轮询触发同一冲突判定，上线时直接删除本函数与 btnSimulatePeerSave */
function simulatePeerSave() {
    const peers = [
        { name: '王建国', account: 'T10088', role: '学科组长', levelCount: 4 },
        { name: '李静', account: 'U20017', role: '教研主任', levelCount: 3 }
    ];
    const peer = peers.filter(p => p.account !== currentRoleInfo().account)[0] || peers[0];
    applyMasterySave(peer.levelCount, peer);
}

/* ---------------- 数据导出 ---------------- */

// 当前维度 / 层级 / 统一目录过滤条件下的表格数据
function currentTableRows(mode) {
    const isAll = mode === 0;
    const flat = [];
    const shown = dirStateOf();
    const walk = (n) => {
        if (n.level > 0 && (isAll || n.level === mode)) flat.push(n);
        // 范围开关（渲染层）：默认零覆盖一级模块整棵剔除、有覆盖模块内 none 节点剔除（kpScopeKeep）；勾选后全量
        if (n.children) n.children.filter(kpScopeKeep).forEach(walk);
    };
    // 渲染层过滤：目录中关闭的一级节点整棵子树不进表格；零覆盖模块由 kpScopeKeep 在入口剔除
    (currentTree().children || []).filter(c => shown[c.name] !== false && kpScopeKeep(c)).forEach(walk);
    return flat;
}

function downloadCSV(filename, rows) {
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportCurrentTable() {
    // 检测状态列与表格视图同口径：能力维度 '—'；模块行「已考x/y」；末级行四态文案；无本期证据的数值列置 —
    const rows = [['名称', '考察频次(次)', '班级得分率(%)', '年级得分率(%)', '得分率差值(%)', '班级未掌握人数', '掌握程度', '检测状态']];
    currentTableRows(currentTableMode).forEach(d => {
        const m = masteryOf(d);
        const grade = d.gradeMastery || 0;
        const ev = currentDimension === 'kp' ? evidenceStateOf(d.name) : null;
        const evState = ev ? ev.state : null;
        const noEv = evState === 'none' || evState === 'unlearned';
        const isHis = evState === 'history';
        const shownRate = isHis ? ev.rate : m;
        const noPeriod = noEv || isHis;
        let evText = '—';
        if (ev) {
            if (d.level === 1) {
                const c = kpModuleCoverage(d.name);
                evText = c.covered === 0 ? '本期未检测' : `已考${c.covered}/${c.total}`;
            } else if (evState === 'period') evText = '本期已检测';
            else if (isHis) evText = `历史证据（${ev.source || '周期外检测'}）`;
            else if (evState === 'none') evText = '本期未检测';
            else evText = '未学';
        }
        rows.push([
            d.name,
            noPeriod ? '—' : (d.freq || 10),
            noEv ? '—' : shownRate.toFixed(1),
            noPeriod ? '—' : grade,
            noPeriod ? '—' : (m - grade).toFixed(1),
            noPeriod ? '—' : (d.unmasteredCount || 0),
            noEv ? '—' : statusOf(shownRate).name,
            evText
        ]);
    });
    downloadCSV(`学科学情_${dimensionLabel()}明细.csv`, rows);
}

function exportDetailsTable() {
    if (!currentDetailItem) return;
    const all = detailRowsOf(currentDetailItem.name);
    const list = currentDetailType === 'all' ? all : all.filter(t => t.type === currentDetailType);
    const rows = [['作业考试名称', '对应题号', '班级得分率(%)', '年级得分率(%)']];
    list.forEach(t => rows.push([t.name, t.qno || '--', t.rate, t.gradeRate]));
    downloadCSV(`学科学情_${currentDetailItem.name}_作业考试明细.csv`, rows);
}

/* ---------------- 主页签切换：学情汇总 / 知识点分析 / 学生学情 ---------------- */

// 学情汇总 = 周期学情概览；知识点分析 = 知识点/能力维度切换及其下方全部模块；学生学情 = 范围内学生作业考试情况列表
function switchMainTab(tab) {
    if ((tab !== 'summary' && tab !== 'analysis' && tab !== 'students') || tab === currentMainTab) return;
    currentMainTab = tab;

    document.querySelectorAll('#subjectMainTabs .subject-main-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.mainTab === tab);
    });
    document.getElementById('summaryTabPanel').hidden = tab !== 'summary';
    document.getElementById('analysisTabPanel').hidden = tab !== 'analysis';
    document.getElementById('studentsTabPanel').hidden = tab !== 'students';
    updateDimGroupVisibility();   // 维度子导航随主页签展开 / 收起

    // 切页签回到顶部，避免停留在上一页签的滚动位置
    const body = document.querySelector('.content-body');
    if (body) body.scrollTop = 0;

    refreshActiveTabCharts();
}

// 恢复当前主页签内图表的尺寸（页签切换 / 学科学情视图重新显示后调用：
// 容器隐藏期间发生的 resize 会使 ECharts 图表尺寸失效）
function refreshActiveTabCharts() {
    if (currentMainTab === 'summary') {
        periodTrendChart ? periodTrendChart.resize() : initPeriodTrendChart();
    } else if (currentMainTab === 'students') {
        // 学生学情页签：分布图由学生追踪模块接管，挂载后触发补渲染
        if (window.StudentBridge && typeof window.StudentBridge.onStudentsTabVisible === 'function') {
            window.StudentBridge.onStudentsTabVisible();
        }
    } else {
        myTreeChart ? myTreeChart.resize() : initTreeChart();
        causeStackChart ? causeStackChart.resize() : initCauseChart();
        kgRender();   // 力导向 / 放射布局依赖画布实际尺寸，整体重渲染
    }
    window.dispatchEvent(new Event('resize'));
}

// 供学生追踪模块调用的主模块钩子（学科学情-学生学情列表 → 学生追踪-知识点分析联动）
window.switchMainTab = switchMainTab;

/* ---------------- 视图切换 ---------------- */

function switchView(view) {
    currentView = view;
    document.getElementById('btnTree').classList.toggle('active', view === 'tree');
    document.getElementById('btnHeat').classList.toggle('active', view === 'heat');
    document.getElementById('btnTable').classList.toggle('active', view === 'table');
    document.getElementById('btnGraph').classList.toggle('active', view === 'graph');

    El.treeView.style.display = view === 'tree' ? 'block' : 'none';
    El.heatView.style.display = view === 'heat' ? 'block' : 'none';
    El.tableView.style.display = view === 'table' ? 'block' : 'none';
    document.getElementById('kgView').style.display = view === 'graph' ? 'block' : 'none';

    // 图谱专属控件（布局切换 / 适应画布 / 工具栏 / 详情面板）与三栏布局随视图切换
    document.getElementById('analysisSection').classList.toggle('graph-view', view === 'graph');
    El.analysisLayout.classList.toggle('view-graph', view === 'graph');
    // 目录数据源可能随视图变化（能力维度下图谱视图固定知识点模块）
    kgRenderModules();

    if (view === 'tree') {
        // 无条件重设 option：从其它视图切回时状态可能已变（如范围开关在图谱/表格视图勾选），
        // 仅 resize 会沿用旧数据；initTreeChart 幂等且带 panelVisible 门控
        initTreeChart();
        myTreeChart?.resize();
    } else if (view === 'heat') {
        renderHeatView();
    } else if (view === 'graph') {
        kgRender();   // 力导向 / 放射布局依赖画布实际尺寸，从隐藏恢复必须整体重渲染
    } else {
        renderTable(currentTableMode);
    }
    window.dispatchEvent(new Event('resize'));
}

function setChapterSidebarExpanded(expanded) {
    chapterSidebarExpanded = expanded;
    // 章节目录不再随维度隐藏：知识点 / 能力均为知识点类型，两个维度功能保持一致
    const visible = expanded;
    El.chapterSidebar.hidden = !visible;
    El.chapterToggle.hidden = false;
    El.chapterToggle.setAttribute('aria-expanded', String(visible));
    El.chapterToggle.setAttribute('aria-label', visible ? '收起章节目录' : '展开章节目录');
    El.chapterToggle.querySelector('span').textContent = visible ? '收起目录' : '展开目录';
    El.chapterToggle.querySelector('i').className = visible ? 'fas fa-outdent' : 'fas fa-indent';
    El.analysisLayout.classList.toggle('chapters-collapsed', !visible);

    // 等待布局更新后适配图表宽度，不刷新或修改分析数据。
    requestAnimationFrame(() => {
        if (currentView === 'tree') myTreeChart?.resize();
    });
}

/* ---------------- 学科切换：双学科权限 + L2-a 缺省页（PRD XK-13） ----------------
   演示口径：教务只配数学、语文两个学科，不存在「无学科」形态。
   数学有完整知识体系；语文有任务、有批改但题库未接入其知识体系，切过去整片分析让位给 L2-a 缺省页
   （有任务无体系 ≠ 无数据：既不显示 0，也不输出任何知识点诊断）。
   语文任务仅用于缺省页的「N 份任务」说明，不参与 periodTasks 的任何统计。 */
const SUBJECT_OFFLINE_TASKS = {
    语文: [
        { name: '语文同步作业(一)', type: '作业', date: '2025-10-11', classRate: 70.2, gradeRate: 68.9 },
        { name: '语文学科周测', type: '考试', date: '2025-10-25', classRate: 66.5, gradeRate: 65.1 }
    ]
};

function currentSubjectValue() {
    const el = document.getElementById('subjectSelect');
    return el ? el.value : '数学';
}

// 已勾选的任务份数：与筛选栏「已选：N 份」同一口径
function currentSourceTotal() {
    return ModalData.assignments.filter(a => a.checked).length
        + ModalData.exams.filter(e => e.checked).length;
}

function applySubjectView(subject) {
    subject = subject || currentSubjectValue();
    const section2a = document.getElementById('subjectOfflineSection');
    const section0b = document.getElementById('sourceEmptySection');
    if (!section2a || !section0b) return;
    const tabs = document.getElementById('subjectMainTabs');
    const panels = ['summaryTabPanel', 'analysisTabPanel', 'studentsTabPanel']
        .map(id => document.getElementById(id)).filter(Boolean);
    const offline = SUBJECT_OFFLINE_TASKS[subject];

    // 页面级空态互斥：已选 0 份（L0-b）优先于体系未接入（L2-a）
    if (currentSourceTotal() === 0) {
        section0b.hidden = false;
        section2a.hidden = true;
        if (tabs) tabs.style.display = 'none';
        panels.forEach(p => { p.hidden = true; });
        return;
    }
    section0b.hidden = true;

    if (!offline) {
        // 有知识体系：恢复主页签与当前选中面板
        section2a.hidden = true;
        if (tabs) tabs.style.display = '';
        const active = document.querySelector('.subject-main-tab.active');
        const key = active ? active.dataset.mainTab : 'summary';
        const targetId = key === 'analysis' ? 'analysisTabPanel'
            : (key === 'students' ? 'studentsTabPanel' : 'summaryTabPanel');
        panels.forEach(p => { p.hidden = p.id !== targetId; });
        // 面板隐藏期间被 window resize 压成 0：必须补渲染当前页签图表（力导向 / 放射布局仅 resize 不够），
        // refreshActiveTabCharts 内部已广播一次 window resize
        if (typeof refreshActiveTabCharts === 'function') refreshActiveTabCharts();
        return;
    }

    // 无知识体系：主页签与全部分析面板让位，只留缺省页
    if (tabs) tabs.style.display = 'none';
    panels.forEach(p => { p.hidden = true; });
    section2a.hidden = false;

    const n = offline.length;
    const title = document.getElementById('subjectOfflineTitle');
    const desc = document.getElementById('subjectOfflineDesc');
    if (title) title.textContent = `${subject}学科知识体系未覆盖`;
    if (desc) desc.textContent = `本周期已有 ${n} 份${subject}学科任务完成批改，但题库尚未接入${subject}学科知识体系，暂不提供知识点分析。`;
}

/* ---------------- 事件绑定 ---------------- */

function bindEvents() {
    // 筛选栏 → 学情来源弹窗
    El.filterCount.onclick = () => {
        syncScopeEcho();
        El.filterModal.classList.add('show');
        renderModalList();
    };
    const closeFilterModal = () => El.filterModal.classList.remove('show');
    document.getElementById('closeModalIcon').onclick = closeFilterModal;
    document.getElementById('btnCancelModal').onclick = closeFilterModal;
    document.getElementById('btnConfirmModal').onclick = () => {
        updateFilterCount();
        closeFilterModal();
        // 勾选结果变化后重新判定页面级空态（已选 0 份 → L0-b）
        applySubjectView();
    };

    // 两栏全选
    El.checkAllAssignments.onchange = (e) => {
        ModalData.assignments.forEach(i => i.checked = e.target.checked);
        renderModalList();
    };
    El.checkAllExams.onchange = (e) => {
        ModalData.exams.forEach(i => i.checked = e.target.checked);
        renderModalList();
    };

    // 学科筛选：演示双学科权限（数学 / 语文），切语文进入 L2-a 缺省页（见 applySubjectView）
    const subjectSelectEl = document.getElementById('subjectSelect');
    if (subjectSelectEl) {
        subjectSelectEl.onchange = () => applySubjectView(subjectSelectEl.value);
    }
    // L0-b 缺省页出口：重新打开学情来源弹窗（自助恢复，不依赖刷新页面）
    const btnReselect = document.getElementById('btnReselectTasks');
    if (btnReselect) {
        btnReselect.onclick = () => {
            syncScopeEcho();
            El.filterModal.classList.add('show');
            renderModalList();
        };
    }

    // 年级 / 班级二级垂直菜单
    initCascadeMenu();
    El.cascadeTrigger.onclick = (e) => {
        e.stopPropagation();
        El.gradeClassCascade.classList.toggle('open');
        if (El.gradeClassCascade.classList.contains('open')) {
            renderCascadeClasses();   // 打开时同步当前选中高亮
        }
    };
    document.addEventListener('click', (e) => {
        if (!El.gradeClassCascade.contains(e.target)) {
            El.gradeClassCascade.classList.remove('open');
        }
    });

    // 章节目录展开 / 收起，仅影响明细模块布局
    El.chapterToggle.onclick = () => setChapterSidebarExpanded(!chapterSidebarExpanded);

    // 时间筛选分段（学年/月/周/自定义）——选中档位联动显示对应日期控件
    const timeSegment = document.getElementById('timeSegment');
    const customDateRange = document.getElementById('customDateRange');
    if (timeSegment && customDateRange) {
        // 自然周提示：由 ISO 周号推算周一~周日日期范围
        const updateWeekHint = () => {
            const input = document.getElementById('weekPickInput');
            const hint = document.getElementById('weekPickHint');
            if (!input || !hint) return;
            const m = /^(\d{4})-W(\d{1,2})$/.exec(input.value || '');
            if (!m) { hint.innerText = '--'; return; }
            const jan4 = new Date(Number(m[1]), 0, 4);
            const day = jan4.getDay() || 7;               // 周一=1 … 周日=7
            const monday = new Date(jan4);
            monday.setDate(jan4.getDate() - (day - 1) + (Number(m[2]) - 1) * 7);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            const fmt = (d) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            hint.innerText = `${fmt(monday)} ~ ${fmt(sunday)}`;
        };
        const pickers = {
            '学年': document.getElementById('yearRangePicker'),
            '月': document.getElementById('monthPicker'),
            '周': document.getElementById('weekPicker'),
            '自定义': customDateRange
        };
        const showPicker = (label) => {
            Object.entries(pickers).forEach(([name, el]) => {
                if (el) el.style.display = name === label ? 'flex' : 'none';
            });
            if (label === '周') updateWeekHint();
        };
        const timeBtns = timeSegment.querySelectorAll('.segment-btn');
        timeBtns.forEach(btn => {
            btn.onclick = () => {
                timeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                showPicker(btn.textContent.trim());
                syncScopeEcho();      // 档位变化即时回显时间范围（弹窗内设定，外部胶囊同步）
                refreshDashboard();   // 档位切换可能改变环比基准（自定义→等长前置窗口）→ 重算周期模块
            };
        });
        // 自定义区间 / 月 / 周 / 学年 picker 变更：环比窗口随日期变化 → 重算（无环比数据时全链路隐藏环比）
        ['customDateStart', 'customDateEnd', 'monthPickInput', 'weekPickInput', 'yearPickSelect'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.onchange = () => {
                if (id === 'weekPickInput') updateWeekHint();   // 周档内改周号时同步起止日期提示（原先只在切到周档时更新）
                syncScopeEcho();
                refreshDashboard();
            };
        });
        // 初始档位（默认"月"）同步显示对应日期控件，并把时间范围回显到胶囊与弹窗底栏
        const initBtn = timeSegment.querySelector('.segment-btn.active');
        if (initBtn) showPicker(initBtn.textContent.trim());
        syncScopeEcho();
    }

    // 学年下拉：只切换查询学年。班级范围恒取当前学年任教班级，不做年级-班级联动、不在页面呈现历史学年的年级班级
    const yearAuthSelect = document.getElementById('yearAuthSelect');
    if (yearAuthSelect) {
        yearAuthSelect.onchange = () => {
            const y = TEACHER_AUTH_YEARS.find(it => it.label === yearAuthSelect.value);
            if (!y) return;
            syncSummaryCards();
            refreshDashboard();
            mainToast(`已切换至${y.label}，已按当前任教班级回查该学年数据`);
        };
    }

    // 主页签切换：学情汇总 / 知识点分析
    document.querySelectorAll('#subjectMainTabs .subject-main-tab').forEach(tab => {
        tab.onclick = () => switchMainTab(tab.dataset.mainTab);
    });

    // 图谱诊断标签切换
    document.querySelectorAll('#kgDiagTabs .kg-diag-tab').forEach(tab => {
        tab.onclick = () => switchKgDiagTab(tab.dataset.diag);
    });

    // 维度切换（chip 组事件委托，替代原 tabKp/tabAbility 行内标签；知识点 / 能力均为知识点类型，两维度功能一致）
    const dimChipGroup = document.getElementById('dimChipGroup');
    if (dimChipGroup) {
        dimChipGroup.onclick = (e) => {
            const chip = e.target.closest('.dim-chip');
            if (!chip) return;
            const key = chip.dataset.dim;
            if (!key || currentDimension === key) return;
            currentDimension = key;
            refreshDashboard();
        };
    }

    // 视图切换（树状 / 热力 / 表格 / 关联图谱）
    document.getElementById('btnTree').onclick = () => switchView('tree');
    document.getElementById('btnHeat').onclick = () => switchView('heat');
    document.getElementById('btnTable').onclick = () => switchView('table');
    document.getElementById('btnGraph').onclick = () => switchView('graph');

    // 层级 Tab
    El.kpTableTabs.querySelectorAll('span').forEach(tab => {
        tab.onclick = () => {
            currentTableMode = Number(tab.dataset.mode);
            El.kpTableTabs.querySelectorAll('span').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderTable(currentTableMode);
        };
    });

    // 统计卡片下钻（卡1 / 卡2 取消下钻：集合统计与单节点详情 / 过滤清单维度不统一）
    // 周期指标卡下钻：周期学情概览位于「学情汇总」页签，先切页签再滚动
    document.getElementById('cardSummary4').onclick = () => {
        switchMainTab('summary');
        El.periodOverviewSection.scrollIntoView({ behavior: 'smooth' });
    };
    document.getElementById('cardSummary5').onclick = () => {
        setHeatFocus({ stubborn: true });   // 高亮当前维度全部顽固行并滚动定位（与诊断区顽固名单同源）
        switchView('heat');
    };
    // 共性错题卡下钻：切页签 → 滚动到共性错题清单 → 高亮脉冲提示落点
    document.getElementById('cardSummary3').onclick = () => {
        switchMainTab('analysis');
        const sec = document.getElementById('mistakeSection');
        sec.scrollIntoView({ behavior: 'smooth' });
        sec.classList.remove('pulse-flash');
        void sec.offsetWidth;   // 强制回流以重启动画
        sec.classList.add('pulse-flash');
    };
    // 共性错题清单：全选 / 单选 / 行操作（一期仅保留历史数据）
    document.getElementById('mistakeCheckAll').onchange = (e) => {
        mistakeSel = e.target.checked ? new Set(commonMistakes().map(m => m.id)) : new Set();
        renderCommonMistakes();
    };
    document.getElementById('mistakeListBody').onclick = (e) => {
        const ck = e.target.closest('.mistake-ck');
        if (ck) {
            if (ck.checked) mistakeSel.add(ck.dataset.id); else mistakeSel.delete(ck.dataset.id);
            const list = commonMistakes();
            const ckAll = document.getElementById('mistakeCheckAll');
            ckAll.checked = mistakeSel.size === list.length && list.length > 0;
            ckAll.indeterminate = mistakeSel.size > 0 && mistakeSel.size < list.length;
            updateMistakeSelInfo();
            return;
        }
        if (e.target.closest('[data-act="origin"]')) showProtoToast('打开原卷查看作答分布（原型演示）');
    };

    // 掌握程度
    document.getElementById('btnMasterySetup').onclick = openMasteryModal;
    document.getElementById('btnCancelMastery').onclick = closeMasteryModal;
    document.getElementById('closeMasteryIcon').onclick = closeMasteryModal;
    document.getElementById('btnConfirmMastery').onclick = confirmMastery;
    document.querySelectorAll('input[name="masteryLevel"]').forEach(radio => {
        radio.onchange = (e) => renderMasteryLevels(Number(e.target.value));
    });
    // 掌握程度权限：角色切换（原型演示） + 首屏权限态渲染
    const masteryRoleSelect = document.getElementById('masteryRoleSelect');
    if (masteryRoleSelect) {
        masteryRoleSelect.value = currentRoleKey;
        masteryRoleSelect.onchange = (e) => {
            currentRoleKey = e.target.value;
            syncMasteryPermissionUI();
        };
    }
    // 并发冲突：以我的修改为准（覆盖）/ 使用最新设置（放弃本次）
    const btnConflictOverwrite = document.getElementById('btnConflictOverwrite');
    if (btnConflictOverwrite) {
        btnConflictOverwrite.onclick = () => {
            const checked = document.querySelector('input[name="masteryLevel"]:checked');
            const levelCount = Number(checked ? checked.value : masteryState.levelCount);
            hideMasteryConflict();
            applyMasterySave(levelCount);
            closeMasteryModal();
        };
    }
    const btnConflictDiscard = document.getElementById('btnConflictDiscard');
    if (btnConflictDiscard) {
        btnConflictDiscard.onclick = () => {
            // 采用最新：丢弃本次选择，档位与区间回填为对方已保存的结果
            hideMasteryConflict();
            masteryLevelCount = masteryState.levelCount;
            masteryLevels = MASTERY_PRESETS[masteryLevelCount].map(l => ({ ...l }));
            document.querySelectorAll('input[name="masteryLevel"]').forEach(r => { r.checked = Number(r.value) === masteryState.levelCount; });
            renderMasteryLevels(masteryState.levelCount);
            closeMasteryModal();
        };
    }
    // 原型演示：模拟他人并发保存（上线删除）
    const btnSimulatePeerSave = document.getElementById('btnSimulatePeerSave');
    if (btnSimulatePeerSave) btnSimulatePeerSave.onclick = simulatePeerSave;
    syncMasteryPermissionUI();

    // 导出
    document.getElementById('btnExport').onclick = exportCurrentTable;
    document.getElementById('btnExportDetails').onclick = exportDetailsTable;

    // 详情视图
    document.getElementById('closeDetails').onclick = () => El.detailsView.classList.remove('show');
    document.querySelectorAll('#detailsTypeFilter span').forEach(span => {
        span.onclick = () => {
            currentDetailType = span.dataset.type;
            document.querySelectorAll('#detailsTypeFilter span').forEach(s => s.classList.remove('active'));
            span.classList.add('active');
            if (currentDetailItem) {
                renderDetailsTable(currentDetailItem);
                if (document.getElementById('btnDetailsChart').classList.contains('active')) renderDetailsChart(currentDetailItem);
            }
        };
    });
    document.getElementById('btnDetailsTable').onclick = () => {
        document.getElementById('btnDetailsTable').classList.add('active');
        document.getElementById('btnDetailsChart').classList.remove('active');
        El.detailsChartContainer.style.display = 'none';
        El.detailsTableWrapper.style.display = 'block';
    };
    document.getElementById('btnDetailsChart').onclick = () => {
        document.getElementById('btnDetailsChart').classList.add('active');
        document.getElementById('btnDetailsTable').classList.remove('active');
        El.detailsChartContainer.style.display = 'block';
        El.detailsTableWrapper.style.display = 'none';
        if (currentDetailItem) renderDetailsChart(currentDetailItem);
    };

    // F14：关联诊断抽屉 / 分目的加练抽屉（两抽屉互斥，Esc 关闭最上层）
    document.getElementById('relDiagClose').onclick = closeRelDiagDrawer;
    document.getElementById('relDiagGenDrill').onclick = () => { if (relDiagTarget) openDrillDrawer(relDiagTarget); };
    // 分目的加练抽屉顶部面包屑：返回上一层「前后序关联诊断」（同一目标点；学生追踪入口的个人视角上下文保留）
    document.getElementById('drillBackRelDiag').onclick = () => {
        if (drillTarget && kgIndex.byName[drillTarget]) openRelDiagDrawer(drillTarget, null, relDiagStudentCtx);
    };
    document.getElementById('drillClose').onclick = closeDrillDrawer;
    document.getElementById('drillCopy').onclick = (e) => copyDrillAdvice(e.currentTarget);
    document.getElementById('drillExport').onclick = exportDrillAdvice;
    [['relDiagOverlay', closeRelDiagDrawer], ['drillOverlay', closeDrillDrawer]].forEach(([id, fn]) => {
        const ov = document.getElementById(id);
        if (ov) ov.addEventListener('click', (e) => { if (e.target === ov) fn(); });
    });
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (document.getElementById('drillDrawer').classList.contains('open')) closeDrillDrawer();
        else if (document.getElementById('relDiagDrawer').classList.contains('open')) closeRelDiagDrawer();
    });

    // 全局 resize
    window.addEventListener('resize', () => {
        myTreeChart?.resize();
        myDetailsChart?.resize();
        periodTrendChart?.resize();
        causeStackChart?.resize();
        kgChart?.resize();
    });
}

/* ---------------- Init ---------------- */

function init() {
    kgBuildIndex();   // 证据索引提前构建：refreshDashboard 卡1 覆盖口径依赖 evidenceStateOf（幂等）
    bindEvents();
    refreshDashboard();
    switchView('tree');       // 默认树状图
    renderCauseFindings();    // 错因关键发现（与维度无关，初始化一次）
    initKnowledgeGraph();     // 知识点关联图谱（echarts 延迟加载，内部自动重试）

    // 重型图表延后渲染，保证首屏速度
    setTimeout(() => {
        initTreeChart();
        initPeriodTrendChart();   // 周期趋势图
        initCauseChart();         // 错因结构堆叠图
        window.dispatchEvent(new Event('resize'));
        // 图表渲染引发的布局变化可能导致容器滚动，复位到首屏
        document.querySelector('.content-body').scrollTop = 0;
    }, 300);
}

init();

/* ============================================================
   学生追踪模块（sub-nav「学生追踪」tab）
   依据原型截图还原：左侧学生列表 + 作业表格 + 得分变化曲线
   ============================================================ */
(function () {
    'use strict';

    /* ---------------- 工具 ---------------- */
    const st$ = (id) => document.getElementById(id);
    const stEsc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const stFmtDiff = (v) => { const n = Math.round(v * 100) / 100; return n === 0 ? '0' : String(n); };

    let stToastTimer = null;
    function stToast(msg) {
        const t = st$('stToast');
        if (!t) return;
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(stToastTimer);
        stToastTimer = setTimeout(() => t.classList.remove('show'), 2200);
    }

    /* ---------------- 演示数据 ----------------
       注：ST_STUDENTS（学生名册）与 stSeed（稳定伪随机）已上移至顶层，
       供「学生状态判定引擎」与周期概览 KPI 卡共用，此处直接引用不再重复定义 */

    // 刘鸿锦 英语作业（截图精确数据：均分差 = 得分 - 班级平均分）
    const ST_HW_EN_LIU = [
        { subject: '英语', name: '3.21作文限时练', date: '2026-09-29 10:44:29', rank: 4, full: 40, score: 32, classAvg: 30.62, gradeAvg: 29.8 },
        { subject: '英语', name: '书面表达', date: '2026-09-28 11:11:26', rank: 1, full: 15, score: 12, classAvg: 12, gradeAvg: 11.4 }
    ];

    // 刘鸿锦 物理作业（学科切换演示数据）
    const ST_HW_PHY_LIU = [
        { subject: '物理', name: '机械能守恒定律 课时练', date: '2026-09-25 09:12:40', rank: 12, full: 100, score: 78, classAvg: 74.5, gradeAvg: 72.1 },
        { subject: '物理', name: '功和功率 随堂检测', date: '2026-09-18 15:02:11', rank: 23, full: 60, score: 45, classAvg: 47.8, gradeAvg: 46.2 },
        { subject: '物理', name: '重力势能 课时作业', date: '2026-09-11 10:35:00', rank: 8, full: 50, score: 42, classAvg: 38.9, gradeAvg: 37.5 }
    ];

    // 考试分析数据（依据原型截图还原）
    // 学科页签序列（截图：总分/语文/数学/英语/物理/化学/生物/政治/历史/物化生/文科综合-1）
    const ST_EXAM_SUBJECTS = ['总分', '语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '物化生', '文科综合-1'];
    // 历次考试时间轴（截图 8 个日期）
    const ST_EXAM_DATES = ['2025-10-13', '2025-11-05', '2025-12-16', '2025-12-31', '2026-03-05', '2026-03-25', '2026-05-25', '2026-08-24'];
    const ST_EXAM_NAMES = ['月考（一）', '期中考试', '周测（12月）', '月考（二）', '开学摸底考', '月考（三）', '期中考试（下）', '暑期返校考'];

    // 刘鸿锦考试数据（按截图精确复刻：95/D · 95/95 · 95/95 · 1/1 · T 分数 50）
    const ST_EXAM_HUB_LIU = {
        latest: {
            name: '0924测试1', trend: 'up', trendLabel: '连续上升',
            score: 95, grade: 'D',
            classAvg: 95, gradeAvg: 95,
            classMax: 95, gradeMax: 95,
            classRank: 1, gradeRank: 1,
            tScore: 50
        },
        subjects: [
            { name: '总分', score: 95, classAvg: 95, classMax: 95, classMin: 95, classMedian: 95 },
            { name: '英语', score: 95, classAvg: 95, classMax: 95, classMin: 95, classMedian: 95 }
        ],
        history: {
            '总分': { scores: [62, 71, 58, 75, 68, 80, 74, 95], classRanks: [28, 22, 30, 19, 24, 15, 18, 1], gradeRanks: [130, 112, 141, 96, 118, 84, 95, 6] },
            '英语': { scores: [55, 66, 60, 70, 65, 76, 71, 92], classRanks: [31, 25, 27, 21, 23, 14, 17, 2], gradeRanks: [150, 121, 133, 104, 115, 80, 90, 11] }
        }
    };

    // 为任意学生生成稳定的考试分析演示数据
    function stGenExamHub(student) {
        if (student.id === 40313) return ST_EXAM_HUB_LIU;
        const extra = ['数学', '物理', '化学'][Math.floor(stSeed(student.id * 5) * 3)];
        const history = {};
        const mkScores = (off) => {
            const arr = [];
            let v = 55 + stSeed(student.id + off) * 25;
            for (let i = 0; i < ST_EXAM_DATES.length; i++) {
                v = Math.max(40, Math.min(98, v + (stSeed(student.id * 3 + i * 7 + off) - 0.45) * 18));
                arr.push(Math.round(v));
            }
            return arr;
        };
        const mkRanks = (off, max) => ST_EXAM_DATES.map((_, i) => 1 + Math.floor(stSeed(student.id * 7 + i * 11 + off) * max));
        ['总分', '英语', extra].forEach((sub, idx) => {
            history[sub] = { scores: mkScores(idx + 1), classRanks: mkRanks(idx + 21, 44), gradeRanks: mkRanks(idx + 41, 200) };
        });
        const lastScore = history['总分'].scores[7];
        const prev = history['总分'].scores.slice(0, 7);
        const trend = (lastScore > prev[6] && prev[6] >= prev[5]) ? 'up' : ((lastScore < prev[6] && prev[6] <= prev[5]) ? 'down' : 'flat');
        const classAvg = Math.round(60 + stSeed(student.id * 13) * 30);
        return {
            latest: {
                name: '0924测试1',
                trend,
                trendLabel: trend === 'up' ? '连续上升' : (trend === 'down' ? '连续下降' : '波动变化'),
                score: lastScore,
                grade: lastScore >= 85 ? 'A' : (lastScore >= 70 ? 'B' : (lastScore >= 55 ? 'C' : 'D')),
                classAvg,
                gradeAvg: Math.max(40, classAvg - 3),
                classMax: 98, gradeMax: 100,
                classRank: history['总分'].classRanks[7],
                gradeRank: history['总分'].gradeRanks[7],
                tScore: Math.round(50 + (lastScore - classAvg) * 0.8)
            },
            subjects: ['总分', '英语', extra].map((sub) => ({
                name: sub,
                score: history[sub].scores[7],
                classAvg: Math.round(60 + stSeed(student.id * 17 + sub.length) * 30),
                classMax: 98, classMin: 35, classMedian: 65
            })),
            history
        };
    }

    // 刘鸿锦 错题本
    const ST_MISTAKES_LIU = [
        { subject: '英语', source: '书面表达', date: '2026-09-28', stem: '书面表达（建议信）：开头段未点明写信目的，第二段建议要点缺少衔接词，句式单一。', kps: ['应用文写作', '衔接与连贯'], rate: 60, wrongCnt: '得分 12/15' },
        { subject: '英语', source: '3.21作文限时练', date: '2026-09-29', stem: '读后续写：情节推进与前文伏笔衔接不足，动作描写链条断裂，结尾升华突兀。', kps: ['读后续写', '细节描写'], rate: 70, wrongCnt: '得分 32/40' },
        { subject: '物理', source: '机械能守恒定律 课时练', date: '2026-09-25', stem: '第 7 题：链条/圆弧轨道机械能守恒问题，漏算重力势能参考面导致方程列式错误。', kps: ['机械能守恒定律', '能量守恒思想'], rate: 55, wrongCnt: '错 3 空' },
        { subject: '物理', source: '功和功率 随堂检测', date: '2026-09-18', stem: '第 4 题：机车以额定功率启动的加速度求解，误将匀加速阶段公式用于变加速阶段。', kps: ['功率', '牛顿第二定律'], rate: 40, wrongCnt: '错 5 空' }
    ];

    const ST_HW_POOL = {
        '英语': ['书面表达', '3.21作文限时练', 'Unit 1 词汇检测', '阅读理解限时练', '语法填空专项'],
        '物理': ['机械能守恒定律 课时练', '功和功率 随堂检测', '重力势能 课时作业', '牛顿运动定律 章末练习']
    };
    const ST_PAGE_SIZE = 10;

    // 为任意学生生成稳定的演示作业记录
    function stGenHomework(student, subject) {
        if (student.id === 40313) return subject === '英语' ? ST_HW_EN_LIU : ST_HW_PHY_LIU;
        const pool = ST_HW_POOL[subject];
        const cnt = 2 + Math.floor(stSeed(student.id + (subject === '英语' ? 1 : 2)) * 3); // 2~4 条
        const list = [];
        for (let i = 0; i < cnt; i++) {
            const r1 = stSeed(student.id * 7 + i * 13 + (subject === '英语' ? 3 : 5));
            const r2 = stSeed(student.id * 11 + i * 29 + (subject === '英语' ? 7 : 9));
            const full = subject === '英语' ? [15, 40][i % 2] : [50, 60, 100][i % 3];
            const score = Math.max(1, Math.round(full * (0.55 + r1 * 0.4)));
            const classAvg = Math.round(full * (0.6 + r2 * 0.2) * 100) / 100;
            const gradeAvg = Math.round((classAvg - 1.2 + r1 * 2.4) * 100) / 100;
            const day = 25 - i * 7 - Math.floor(r2 * 4);
            list.push({
                subject, name: pool[i % pool.length],
                date: '2026-09-' + (day < 10 ? '0' + day : day) + ' ' + (8 + i) + ':' + (10 + Math.floor(r1 * 40)) + ':' + (10 + Math.floor(r2 * 40)),
                rank: 1 + Math.floor(r2 * 40), full, score, classAvg, gradeAvg
            });
        }
        return list;
    }

    function stGenMistakes(student) {
        if (student.id === 40313) return ST_MISTAKES_LIU;
        const out = [];
        for (let i = 0; i < 4; i++) {
            const r = stSeed(student.id * 13 + i * 31);
            out.push({
                subject: i % 2 === 0 ? '英语' : '物理',
                source: ST_HW_POOL[i % 2 === 0 ? '英语' : '物理'][i % 3],
                date: '2026-09-' + (26 - i * 3),
                stem: '演示错题题干：本题考查' + (i % 2 === 0 ? '英语写作篇章结构' : '物理基本规律应用') + '，学生作答在关键步骤出现偏差，失分集中于第 ' + (i + 1) + ' 问。',
                kps: ['演示知识点A', '演示知识点B'],
                rate: 30 + Math.floor(r * 45), wrongCnt: '错 ' + (1 + Math.floor(r * 3)) + ' 空'
            });
        }
        return out;
    }

    /* ---------------- 学生学情面板（学科学情-【学生学情】页签） ---------------- */

    // 学情分布等级（对齐原型截图：优秀/良好/合格/待合格/未学习）
    const ST_STU_LEVELS = ['优秀', '良好', '合格', '待合格', '未学习'];
    const ST_STU_LEVEL_CLS = { '优秀': 'stu-lv-good', '良好': 'stu-lv-fine', '合格': 'stu-lv-pass', '待合格': 'stu-lv-weak', '未学习': 'stu-lv-none' };
    const ST_STU_PAGE_SIZE = 10;
    const stStuState = { level: 'all', search: '', page: 1 };
    let stuDistChart = null;

    // 学生作业画像：提交口径基于学号稳定伪随机；平均得分率 / 学情分布与状态判定同源（取自状态引擎模拟结果）
    function stProfile(s) {
        const st = ST_STATUS_BY_ID[s.id];
        const assigned = 24;                                   // 统计区间任务数（对齐筛选栏「已选：24 份」口径）
        const none = st.distLevel === '未学习';                 // 全周期未提交（未学习），与状态引擎一致
        const missed = none ? assigned : Math.floor(stSeed(s.id * 3 + 11) * 4);   // 0~3 次未提交
        const submitRate = Math.round((assigned - missed) / assigned * 10000) / 100;
        return { assigned, missed, submitRate, avgRate: st.avgRate, level: st.distLevel };
    }

    function stStuCounts() {
        const counts = {};
        ST_STU_LEVELS.forEach(l => counts[l] = 0);
        ST_STUDENTS.forEach(s => { const p = stProfile(s); counts[p.level] = (counts[p.level] || 0) + 1; });
        return counts;
    }

    function stStuRowsFiltered() {
        const kw = stStuState.search.trim().toLowerCase();
        let rows = ST_STUDENTS.map(s => ({ s, p: stProfile(s) }));
        if (stStuState.level === 'watch') rows = rows.filter(r => WATCH_FOCUS_ID_SET.has(r.s.id));
        else if (stStuState.level !== 'all') rows = rows.filter(r => r.p.level === stStuState.level);
        if (kw) rows = rows.filter(r => r.s.name.toLowerCase().indexOf(kw) >= 0 || String(r.s.id).indexOf(kw) >= 0);
        rows.sort((a, b) => b.p.avgRate - a.p.avgRate);
        return rows;
    }

    // 等级口径说明（对齐 stProfile：≥85 优秀 / ≥70 良好 / ≥60 合格 / 否则待合格；未学习 = 全周期未提交）
    const ST_STU_LEVEL_HINTS = { '优秀': '得分率 ≥85%', '良好': '得分率 70~85%', '合格': '得分率 60~70%', '待合格': '得分率 &lt;60%', '未学习': '区间内均未提交' };

    // 左侧等级筛选按钮（全部学生/优秀/良好/合格/待合格/未学习 + 人数；等级按钮附口径说明）
    function stRenderStuLevelBtns() {
        const counts = stStuCounts();
        // 「需关注」与周期概览 KPI 卡名单同源（状态引擎 ST_STATUS_LIST：断崖下跌 / 持续低位）
        const items = [
            { key: 'all', label: '全部学生', n: ST_STUDENTS.length },
            { key: 'watch', label: '需关注', hint: '断崖下跌 / 持续低位', n: WATCH_FOCUS_ID_SET.size, watch: true }
        ].concat(ST_STU_LEVELS.map(l => ({ key: l, label: l, hint: ST_STU_LEVEL_HINTS[l] || '', n: counts[l] || 0 })));
        st$('stuLevelBtns').innerHTML = items.map(it =>
            '<button type="button" class="stu-level-btn' + (it.watch ? ' stu-level-watch' : '') + (stStuState.level === it.key ? ' active' : '') + '" data-level="' + it.key + '">' +
            '<span class="stu-level-name">' + it.label + (it.hint ? ' <span class="stu-level-hint">' + it.hint + '</span>' : '') + '</span>' +
            '<span class="stu-level-n">' + it.n + '</span>人</button>').join('');
    }

    // 等级柱色（与标题问号气泡 · 等级徽章同源配色）
    const ST_STU_LEVEL_COLORS = { '优秀': '#10b981', '良好': '#3b82f6', '合格': '#d9822b', '待合格': '#ef4444', '未学习': '#64748b' };

    // 左侧分布柱状图：各等级学生数（柱顶标人数，悬浮显示人数与占比；y 轴按人数自适应）
    function stRenderStuDist() {
        const dom = st$('stuDistChart');
        if (!dom || dom.offsetWidth === 0) return;   // 页签隐藏期间跳过，切页签时补渲染
        if (!window.echarts) { setTimeout(stRenderStuDist, 500); return; }
        if (!stuDistChart) stuDistChart = echarts.getInstanceByDom(dom) || echarts.init(dom);
        const counts = stStuCounts();
        const values = ST_STU_LEVELS.map(l => counts[l] || 0);
        const total = Math.max(1, values.reduce((a, b) => a + b, 0));
        const max = Math.max(3, Math.max.apply(null, values) + 1);
        stuDistChart.setOption({
            tooltip: {
                trigger: 'item',
                confine: true,
                formatter: p => `${p.name}：<b>${p.value}</b> 人（${Math.round(p.value / total * 100)}%）`
            },
            grid: { left: 28, right: 10, top: 24, bottom: 22 },
            xAxis: {
                type: 'category',
                data: ST_STU_LEVELS,
                axisTick: { show: false },
                axisLine: { lineStyle: { color: '#e2e8f0' } },
                axisLabel: { color: '#64748b', fontSize: 10, interval: 0 }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max,
                minInterval: 1,
                axisLabel: { color: '#94a3b8', fontSize: 10 },
                splitLine: { lineStyle: { color: '#eef2f7' } }
            },
            series: [{
                type: 'bar',
                barWidth: 20,
                label: { show: true, position: 'top', fontSize: 11, fontWeight: 700, color: '#334155' },
                data: ST_STU_LEVELS.map((l, i) => ({
                    value: values[i],
                    itemStyle: { color: ST_STU_LEVEL_COLORS[l], borderRadius: [5, 5, 0, 0] }
                }))
            }]
        }, true);
    }

    // 学生列表表格：标记/姓名/未提交次数/提交率/平均得分率/学情分布/操作
    function stRenderStuTable() {
        const rows = stStuRowsFiltered();
        const pages = Math.max(1, Math.ceil(rows.length / ST_STU_PAGE_SIZE));
        if (stStuState.page > pages) stStuState.page = 1;
        const slice = rows.slice((stStuState.page - 1) * ST_STU_PAGE_SIZE, stStuState.page * ST_STU_PAGE_SIZE);

        st$('stuTableBody').innerHTML = slice.length ? slice.map((r) => {
            const s = r.s, p = r.p;
            const rateCls = p.submitRate < 60 ? ' stu-num-danger' : '';
            const avgCls = p.avgRate < 60 ? ' stu-num-danger' : '';
            const st = ST_STATUS_BY_ID[s.id];
            const watchTag = (st && st.key !== 'flat')
                ? '<span class="stu-watch-tag ' + st.cls + '">' + st.label +
                    '<span class="stu-watch-tip">' + stEsc(st.reason) + '</span></span>'
                : '';
            return '<tr>' +
                '<td class="stu-col-star"><i class="' + (s.starred ? 'fas' : 'far') + ' fa-star stu-star-btn' + (s.starred ? ' starred' : '') + '" data-star="' + s.id + '" title="标记学生"></i></td>' +
                '<td class="stu-th-name"><span class="st-name-link" data-gostudent="' + s.id + '">' + stEsc(s.name) + '</span>' + watchTag + '</td>' +
                '<td class="stu-num' + (p.missed > 0 ? ' stu-num-under' : '') + '">' + (p.missed || '—') + '</td>' +
                '<td class="stu-num' + rateCls + '">' + p.submitRate.toFixed(2) + '</td>' +
                '<td class="stu-num' + avgCls + '">' + p.avgRate.toFixed(1) + '</td>' +
                '<td><span class="stu-level-badge ' + (ST_STU_LEVEL_CLS[p.level] || '') + '">' + stEsc(p.level) + '</span></td>' +
                '<td><span class="st-op-link" data-gostudent="' + s.id + '">详情</span></td>' +
                '</tr>';
        }).join('') : '<tr><td colspan="7"><div class="st-empty">当前筛选条件下暂无学生</div></td></tr>';

        st$('stuListTitle').textContent = '学生列表 (' + rows.length + '人)';

        let pg = '<span class="st-page-arrow' + (stStuState.page <= 1 ? ' disabled' : '') + '" data-pg="prev"><i class="fas fa-angle-left"></i></span>';
        for (let p = 1; p <= pages; p++) {
            pg += '<span class="st-page-num' + (p === stStuState.page ? ' active' : '') + '" data-pg="' + p + '">' + p + '</span>';
        }
        pg += '<span class="st-page-arrow' + (stStuState.page >= pages ? ' disabled' : '') + '" data-pg="next"><i class="fas fa-angle-right"></i></span>';
        st$('stuPagination').innerHTML = pg;
    }

    // 跳转联动：学生学情列表 → 学生追踪-知识点分析（切换学生并直接定位页签）
    function stStuGoStudent(id) {
        stShowView('track');   // 先显示学生追踪视图，保证知识点分析图表容器可测量
        if (id !== stState.studentId) {
            stState.studentId = id;
            stState.hwPage = 1;
        }
        stState.tab = 'knowledge';
        stRenderStudentList();
        stRenderStudentHeader();
        stRefreshData();
        stToast('已跳转至学生追踪 · 知识点分析：' + stCurrentStudent().name);
    }

    /* ---------------- 状态 ---------------- */
    const stState = {
        studentId: 40313,
        tab: 'homework',        // homework | exam | mistake
        subject: '英语',        // 表格学科筛选
        chartSubject: '英语',   // 图表学科筛选
        metric: 'score',       // score | rate
        examSubject: '总分',    // 考试分析当前学科
        examView: 'table',      // 考试历次统计视图：table | line
        examMetric: 'score',   // 考试图表指标：score | classRank | gradeRank
        rankVisible: true,
        rangeStart: '2026-03-29',
        rangeEnd: '2026-09-29',
        hwPage: 1,
        search: '',
        group: 'all',
        mistakeSubject: 'all'
    };

    function stCurrentStudent() {
        return ST_STUDENTS.find((s) => s.id === stState.studentId) || ST_STUDENTS[0];
    }

    function stHomeworkInRange(list) {
        const s = stState.rangeStart.replace(/-/g, '');
        const e = stState.rangeEnd.replace(/-/g, '');
        return list.filter((r) => {
            const d = r.date.slice(0, 10).replace(/-/g, '');
            return d >= s && d <= e;
        });
    }

    /* ---------------- 学生列表 ---------------- */
    function stRenderStudentList() {
        const kw = stState.search.trim().toLowerCase();
        const list = ST_STUDENTS.filter((s) => {
            if (stState.group === 'starred' && !s.starred) return false;
            if (kw && s.name.toLowerCase().indexOf(kw) < 0 && String(s.id).indexOf(kw) < 0) return false;
            return true;
        });
        const html = list.map((s) => {
            const star = '<i class="' + (s.starred ? 'fas' : 'far') + ' fa-star st-stu-star' + (s.starred ? ' starred' : '') + '"></i>';
            return '<li class="st-student-item' + (s.id === stState.studentId ? ' active' : '') + '" data-id="' + s.id + '">' +
                star + '<span class="st-stu-name">' + stEsc(s.name) + ' (' + s.id + ')</span></li>';
        }).join('');
        const box = st$('stStudentList');
        box.innerHTML = html || '<div class="st-stu-empty">未找到匹配学生</div>';
        const active = box.querySelector('.st-student-item.active');
        if (active) active.scrollIntoView({ block: 'nearest' });
    }

    /* ---------------- 学生头部 ---------------- */
    function stRenderStudentHeader() {
        const s = stCurrentStudent();
        st$('stStudentName').textContent = s.name;
        st$('stStudentNo').textContent = '(' + s.id + ')';
        const starBtn = st$('stStarBtn');
        starBtn.classList.toggle('starred', !!s.starred);
        starBtn.querySelector('i').className = s.starred ? 'fas fa-star' : 'far fa-star';

        document.querySelectorAll('.st-data-tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === stState.tab));
        st$('stViewHomework').hidden = stState.tab !== 'homework';
        st$('stViewExam').hidden = stState.tab !== 'exam';
        st$('stViewMistake').hidden = stState.tab !== 'mistake';
        st$('stViewKnowledge').hidden = stState.tab !== 'knowledge';
        // 切到考试页签时激活图表渲染（容器此前 hidden，柱状图被 offsetWidth===0 跳过）
        if (stState.tab === 'exam') stRenderExamView();
        // 切到作业页签时补渲染趋势图（容器 hidden 期间 ECharts 无法测量尺寸）
        if (stState.tab === 'homework') stRenderTrendChart();
        // 切到知识点分析页签时补渲染（容器 hidden 期间 ECharts 无法测量尺寸）
        if (stState.tab === 'knowledge') stKpActivate();
        // 状态徽章：仅知识点分析页签激活时显示于个人周期学情概览标题后（口径 = 该页签独立筛选范围，见 stRenderKpTabStatus）
        stRenderKpTabStatus();
    }

    // 状态徽章（仅知识点分析页签激活时显示于个人周期学情概览标题后）：数据、文案与学情页列表徽章同源 ST_STATUS_BY_ID，
    // 悬停为同一句话结论（不再叠印统计范围与判定口径）；切页签/切学生经 stRenderStudentHeader、筛选变化经 stKpRenderAll 刷新
    function stRenderKpTabStatus() {
        const slot = st$('stKpTabStatus');
        if (!slot) return;
        if (stState.tab !== 'knowledge') { slot.innerHTML = ''; return; }
        const s = stCurrentStudent();
        const st = ST_STATUS_BY_ID[s.id];
        slot.innerHTML = (st && st.key !== 'flat')
            ? '<span class="stu-watch-tag ' + st.cls + '">' + st.label +
                '<span class="stu-watch-tip">' + stEsc(st.reason) + '</span></span>'
            : '';
    }

    /* ---------------- 作业表格 ---------------- */
    function stRateClass(rate) {
        if (rate >= 85) return 'rate-good';
        if (rate >= 70) return '';
        if (rate >= 50) return 'rate-mid';
        return 'rate-low';
    }

    function stRowHtml(r) {
        const rate = Math.round(r.score / r.full * 1000) / 10;
        const diff = Math.round((r.score - r.classAvg) * 100) / 100;
        const diffCls = diff > 0 ? 'st-diff-pos' : (diff < 0 ? 'st-diff-neg' : 'st-diff-zero');
        return '<tr>' +
            '<td>' + stEsc(r.subject) + '</td>' +
            '<td class="st-th-name"><span class="st-name-link" data-hw="' + stEsc(r.name) + '">' + stEsc(r.name) + '</span></td>' +
            '<td>' + stEsc(r.date) + '</td>' +
            '<td class="st-col-rank">' + r.rank + '</td>' +
            '<td>' + r.full + '</td><td>' + r.score + '</td>' +
            '<td class="' + diffCls + '">' + stFmtDiff(diff) + '</td>' +
            '<td><span class="st-rate-wrap"><span class="st-rate-bar"><i class="' + stRateClass(rate) + '" style="width:' + Math.min(100, rate) + '%"></i></span>' + rate + '%</span></td>' +
            '<td><span class="st-op-link" data-detail="' + stEsc(r.name) + '">作答详情</span><span class="st-op-link" data-image="' + stEsc(r.name) + '">作答图像</span></td>' +
            '</tr>';
    }

    function stRenderHomeworkTable() {
        const records = stHomeworkInRange(stGenHomework(stCurrentStudent(), stState.subject))
            .sort((a, b) => (a.date < b.date ? 1 : -1)); // 最新在前，与截图一致
        const pages = Math.max(1, Math.ceil(records.length / ST_PAGE_SIZE));
        if (stState.hwPage > pages) stState.hwPage = 1;
        const slice = records.slice((stState.hwPage - 1) * ST_PAGE_SIZE, stState.hwPage * ST_PAGE_SIZE);

        const body = st$('stHwBody');
        body.innerHTML = slice.length
            ? slice.map(stRowHtml).join('')
            : '<tr><td colspan="9"><div class="st-empty">当前筛选条件下暂无作业记录</div></td></tr>';

        // 班名列显隐（表头 + 单元格同步）
        document.querySelectorAll('#stHwTable .st-col-rank').forEach((cell) => {
            cell.style.display = stState.rankVisible ? '' : 'none';
        });

        // 分页
        let pg = '<span class="st-page-arrow' + (stState.hwPage <= 1 ? ' disabled' : '') + '" data-pg="prev"><i class="fas fa-angle-left"></i></span>';
        for (let p = 1; p <= pages; p++) {
            pg += '<span class="st-page-num' + (p === stState.hwPage ? ' active' : '') + '" data-pg="' + p + '">' + p + '</span>';
        }
        pg += '<span class="st-page-arrow' + (stState.hwPage >= pages ? ' disabled' : '') + '" data-pg="next"><i class="fas fa-angle-right"></i></span>';
        st$('stHwPagination').innerHTML = pg;
    }

    /* ---------------- 考试分析（依据原型截图：最近考试汇总 / 学科成绩柱状图 / 历次学情统计） ---------------- */
    let stExamBarChart = null;
    let stExamTrendEChart = null;
    const ST_EXAM_METRIC_LABELS = { score: '个人得分', classRank: '班级排名', gradeRank: '年级排名' };

    function stExamHub() {
        return stGenExamHub(stCurrentStudent());
    }

    // 1. 最近考试成绩汇总：考试名 + 趋势标记 + 5 张指标卡
    function stRenderExamKpis() {
        const L = stExamHub().latest;
        st$('stExamLatestName').textContent = L.name;
        const trendEl = st$('stExamLatestTrend');
        trendEl.className = 'st-exam-trend ' + (L.trend || 'flat');
        const icon = L.trend === 'up' ? 'fa-arrow-trend-up' : (L.trend === 'down' ? 'fa-arrow-trend-down' : 'fa-arrow-right-long');
        trendEl.innerHTML = '<i class="fas ' + icon + '"></i> ' + stEsc(L.trendLabel);

        const kpis = [
            { label: '总分/等级', value: L.score + '/' + L.grade },
            { label: '平均分（班级/年级）', value: L.classAvg + '/' + L.gradeAvg },
            { label: '最高分（班级/年级）', value: L.classMax + '/' + L.gradeMax },
            { label: '排名（班级/年级）', value: L.classRank + '/' + L.gradeRank },
            { label: 'T分数', value: L.tScore }
        ];
        st$('stExamKpis').innerHTML = kpis.map((k) =>
            '<div class="st-exam-kpi"><div class="st-exam-kpi-label">' + k.label + '</div><div class="st-exam-kpi-value">' + k.value + '</div></div>'
        ).join('');
    }

    // 1.1 学科成绩汇总：五系列柱状图
    function stRenderExamBarChart() {
        const dom = st$('stExamBarChart');
        if (!dom || dom.offsetWidth === 0) return; // 容器不可见时跳过，待激活后渲染
        if (!window.echarts) { setTimeout(stRenderExamBarChart, 500); return; }
        if (!stExamBarChart) stExamBarChart = echarts.getInstanceByDom(dom) || echarts.init(dom);
        const subs = stExamHub().subjects;
        const bar = (name, key, color) => ({
            name, type: 'bar', data: subs.map((s) => s[key]),
            itemStyle: { color, borderRadius: [3, 3, 0, 0] }, barGap: '20%'
        });
        stExamBarChart.setOption({
            grid: { left: 48, right: 24, top: 30, bottom: 36 },
            tooltip: { trigger: 'axis' },
            xAxis: {
                type: 'category', data: subs.map((s) => s.name),
                axisLabel: { color: '#6b7487', fontSize: 12 },
                axisLine: { lineStyle: { color: '#dfe4ec' } },
                axisTick: { alignWithLabel: true }
            },
            yAxis: {
                type: 'value', max: 100,
                axisLabel: { color: '#97a0b3' },
                splitLine: { lineStyle: { color: '#eef1f6' } }
            },
            series: [
                bar('得分', 'score', '#3b82f6'),
                bar('班级平均', 'classAvg', '#06b6d4'),
                bar('班级最高', 'classMax', '#10b981'),
                bar('班级最低', 'classMin', '#ef4444'),
                bar('班级中位数', 'classMedian', '#8b5cf6')
            ]
        }, true);
    }

    // 2. 历次学情统计：学科页签 + 表格/折线图切换
    function stRenderExamHistory() {
        const hub = stExamHub();
        st$('stExamSubjectTabs').innerHTML = ST_EXAM_SUBJECTS.map((sub) => {
            const has = !!hub.history[sub];
            return '<span class="st-exam-sub-tab' + (sub === stState.examSubject ? ' active' : '') + (has ? '' : ' disabled') +
                '" data-sub="' + sub + '"' + (has ? '' : ' title="该生未参加此学科考试"') + '>' + sub + '</span>';
        }).join('');

        const h = hub.history[stState.examSubject];
        const body = st$('stExamHistoryBody');
        body.innerHTML = h
            ? ST_EXAM_DATES.map((d, i) =>
                '<tr><td>' + d + '</td><td>' + stEsc(ST_EXAM_NAMES[i]) + '</td>' +
                '<td class="st-exam-val-col">' + h.scores[i] + '</td>' +
                '<td class="st-exam-val-col">' + h.classRanks[i] + '</td>' +
                '<td class="st-exam-val-col">' + h.gradeRanks[i] + '</td></tr>'
            ).join('')
            : '<tr><td colspan="5"><div class="st-empty">该生未参加此学科考试</div></td></tr>';

        st$('stExamBtnTable').classList.toggle('active', stState.examView === 'table');
        st$('stExamBtnLine').classList.toggle('active', stState.examView === 'line');
        st$('stExamHistoryTableWrap').hidden = stState.examView !== 'table';
        st$('stExamChartWrap').hidden = stState.examView !== 'line';
        if (stState.examView === 'line') stRenderExamTrendChart();
    }

    // 历次折线：指标随下拉切换（个人得分 / 班级排名 / 年级排名），排名采用倒轴（第 1 名在顶部）
    function stRenderExamTrendChart() {
        const dom = st$('stExamTrendChart');
        if (!dom || dom.offsetWidth === 0) return;
        if (!window.echarts) { setTimeout(stRenderExamTrendChart, 500); return; }
        if (!stExamTrendEChart) stExamTrendEChart = echarts.getInstanceByDom(dom) || echarts.init(dom);

        const title = ST_EXAM_METRIC_LABELS[stState.examMetric] || '个人得分';
        st$('stExamChartTitle').textContent = title;
        const h = stExamHub().history[stState.examSubject];
        if (!h) { stExamTrendEChart.clear(); return; }

        const key = stState.examMetric === 'score' ? 'scores' : (stState.examMetric === 'classRank' ? 'classRanks' : 'gradeRanks');
        const isRank = key !== 'scores';
        stExamTrendEChart.setOption({
            grid: { left: 48, right: 24, top: 30, bottom: 64 },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(48, 59, 86, 0.92)', borderWidth: 0,
                textStyle: { color: '#fff', fontSize: 12 }
            },
            xAxis: {
                type: 'category', data: ST_EXAM_DATES,
                axisLabel: { color: '#97a0b3', interval: 0, rotate: 30 },
                axisLine: { lineStyle: { color: '#dfe4ec' } }
            },
            yAxis: {
                type: 'value',
                inverse: isRank,
                max: isRank ? (value) => value.max + 1 : 100,
                axisLabel: { color: '#97a0b3' },
                splitLine: { lineStyle: { color: '#eef1f6' } }
            },
            series: [{
                name: title, type: 'line', data: h[key],
                symbol: 'circle', symbolSize: 7,
                lineStyle: { width: 2, color: '#3b82f6' },
                itemStyle: { color: '#3b82f6' },
                label: { show: true, position: 'top', fontSize: 11, fontWeight: 600, color: '#3b82f6' }
            }]
        }, true);
    }

    // 考试视图汇总刷新（图表仅在视图可见时渲染）
    function stRenderExamView() {
        stRenderExamKpis();
        stRenderExamHistory();
        if (!st$('stViewExam').hidden) {
            setTimeout(() => {
                stRenderExamBarChart();
                if (stState.examView === 'line') stRenderExamTrendChart();
                stExamBarChart?.resize();
                stExamTrendEChart?.resize();
            }, 0);
        }
    }

    // 历次学情统计导出 CSV
    function stExportExamHistory() {
        const h = stExamHub().history[stState.examSubject];
        const rows = [['考试日期', '考试名称', '个人得分', '班级排名', '年级排名']];
        if (h) {
            ST_EXAM_DATES.forEach((d, i) => {
                rows.push([d, ST_EXAM_NAMES[i], h.scores[i], h.classRanks[i], h.gradeRanks[i]]);
            });
        }
        stExportCsv(stCurrentStudent().name + '-' + stState.examSubject + '历次学情统计.csv', rows);
    }

    /* ---------------- 错题本 ---------------- */
    function stRenderMistakeList() {
        let records = stGenMistakes(stCurrentStudent());
        if (stState.mistakeSubject !== 'all') {
            records = records.filter((m) => m.subject === stState.mistakeSubject);
        }
        const box = st$('stMistakeList');
        box.innerHTML = records.length ? records.map((m, idx) =>
            '<div class="st-mistake-item">' +
            '<div class="st-mi-index">' + (idx + 1) + '</div>' +
            '<div class="st-mi-main">' +
            '<div class="st-mi-top"><span class="st-mi-subject">' + stEsc(m.subject) + '</span><span class="st-mi-source">来源：' + stEsc(m.source) + '</span><span class="st-mi-source">' + stEsc(m.date) + '</span></div>' +
            '<div class="st-mi-stem">' + stEsc(m.stem) + '</div>' +
            '<div class="st-mi-bottom"><span class="st-mi-kp">知识点：<b>' + m.kps.map(stEsc).join('</b>、<b>') + '</b></span><span>' + stEsc(m.wrongCnt) + '</span></div>' +
            '</div>' +
            '<div class="st-mi-right"><div class="st-mi-rate">' + m.rate + '%</div><div class="st-mi-rate-sub">得分率</div></div>' +
            '</div>'
        ).join('') : '<div class="st-empty">当前筛选条件下暂无错题</div>';
    }

    /* ---------------- 知识点分析视图（学生追踪-【知识点分析】数据页签） ----------------
       分析范围：当前学生；结构与学科学情-知识点分析对齐（维度切换/摘要卡/章节目录/树状图/表格） */

    const stKpState = { dimension: 'kp', view: 'tree', tableMode: 0, chapters: true, modules: {}, abilityModules: null, diagTab: 'stub',
    time: { mode: 'month', month: '2026-09', week: '2026-W39', year: '2026-2027学年', customFrom: '2026-09-01', customTo: '2026-09-15', subject: '数学' } };
    const stKpCache = { tree: null, byName: null };
    let stKpTreeChart = null;
    let stShowAllKp = false;   // 「查看全部知识点」范围开关（同步主模块 showAllKp；默认仅周期学情包含的模块，渲染层过滤，不动统计口径）

    /* ---- 时间筛选 + 纳入统计的任务清单（同学科学情顶部时间筛选） ---- */

    // 任务池：当前周期内各学科作业/考试（时间正序）；个人/班级得分率由学号种子稳定生成
    // 知识点演示树（AppData.kpTree）仅覆盖数学，其他学科任务仅参与任务清单与已选份数口径
    const ST_KP_TASKS = [
        { type: 'assignment', name: '同步作业(三) · 集合与逻辑', subject: '数学', date: '2026-09-03' },
        { type: 'assignment', name: '阅读理解限时练 · 现代文', subject: '语文', date: '2026-09-05' },
        { type: 'assignment', name: '同步作业(五) · 函数概念', subject: '数学', date: '2026-09-08' },
        { type: 'assignment', name: 'Unit 1 词汇检测', subject: '英语', date: '2026-09-10' },
        { type: 'assignment', name: '同步作业(七) · 指数运算', subject: '数学', date: '2026-09-12' },
        { type: 'assignment', name: '力学综合小测', subject: '物理', date: '2026-09-12' },
        { type: 'assignment', name: '周测小卷(一) · 函数性质', subject: '数学', date: '2026-09-15' },
        { type: 'exam', name: '九月月考(二)', subject: '数学', date: '2026-09-17' },
        { type: 'assignment', name: '周末专项卷 · 三角恒等变换', subject: '数学', date: '2026-09-19' },
        { type: 'assignment', name: '文言文基础巩固练', subject: '语文', date: '2026-09-19' },
        { type: 'assignment', name: '书面表达限时练', subject: '英语', date: '2026-09-23' },
        { type: 'assignment', name: '错题重练卷 · 期初易错点', subject: '数学', date: '2026-09-22' },
        { type: 'exam', name: '0924测试1', subject: '数学', date: '2026-09-24' },
        { type: 'assignment', name: '机械能专项检测', subject: '物理', date: '2026-09-26' }
    ];

    // 周字符串（YYYY-Www）→ [周一, 周日]（ISO 日期，同主模块周选控件算法）
    function stKpWeekDates(weekStr) {
        const m = /^(\d{4})-W(\d{1,2})$/.exec(weekStr || '');
        if (!m) return null;
        const jan4 = new Date(Number(m[1]), 0, 4);
        const day = jan4.getDay() || 7;               // 周一=1 … 周日=7
        const monday = new Date(jan4);
        monday.setDate(jan4.getDate() - (day - 1) + (Number(m[2]) - 1) * 7);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const fmt = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        return [fmt(monday), fmt(sunday)];
    }

    // 当前时间筛选档位对应的统计区间 [from, to]（yyyy-mm-dd，可直接字典序比较）
    function stKpTimeRange() {
        const t = stKpState.time;
        if (t.mode === 'month') {
            const [y, m] = (t.month || '2026-09').split('-').map(Number);
            const last = new Date(y, m, 0).getDate();
            return [t.month + '-01', y + '-' + String(m).padStart(2, '0') + '-' + String(last).padStart(2, '0')];
        }
        if (t.mode === 'week') return stKpWeekDates(t.week) || ['0000-01-01', '9999-12-31'];
        if (t.mode === 'custom') {
            const from = t.customFrom || '0000-01-01', to = t.customTo || '9999-12-31';
            return from <= to ? [from, to] : [to, from];
        }
        const y1 = Number((t.year || '2025-2026学年').slice(0, 4));   // 2025-2026学年 → 2025-09-01 ~ 2026-08-31
        return [y1 + '-09-01', (y1 + 1) + '-08-31'];
    }

    // 每任务个人/班级得分率：刘鸿锦 0924测试1 按考试 KPI 精确值 95%；其余按学号+池内索引种子稳定生成
    function stKpTaskRates(student, idx, task) {
        if (student.id === 40313 && task.name === '0924测试1') return { mine: 95, cls: 95 };
        const r1 = stSeed(student.id * 3 + idx * 17 + (task.type === 'exam' ? 1 : 2));
        const r2 = stSeed(student.id * 5 + idx * 23 + (task.type === 'exam' ? 3 : 4));
        const cls = Math.round(55 + r2 * 25);
        const mine = Math.max(30, Math.min(98, Math.round(cls + (r1 - 0.45) * 30)));
        return { mine, cls };
    }

    // 时间范围内的任务列表（含个人/班级得分率）：先按学科筛选，再按时间范围过滤，最后剔除学情来源弹窗中取消勾选的任务
    function stKpTaskList(student) {
        const [from, to] = stKpTimeRange();
        const subject = stKpState.time.subject;
        return ST_KP_TASKS
            .map((task, idx) => ({ task, idx, rates: stKpTaskRates(student, idx, task) }))
            .filter(x => x.task.subject === subject && x.task.date >= from && x.task.date <= to && x.task.checked !== false)
            .map(x => ({ type: x.task.type, name: x.task.name, subject: x.task.subject, date: x.task.date, mine: x.rates.mine, cls: x.rates.cls }));
    }

    // 时间范围回显文案（随当前档位与对应日期控件生成，格式与班级侧 timeScopeText 对齐）
    function stKpTimeScopeText() {
        const t = stKpState.time;
        if (t.mode === 'year') return t.year || '—';
        if (t.mode === 'month') {
            const p = (t.month || '').split('-');
            return p.length === 2 ? Number(p[0]) + '年' + Number(p[1]) + '月' : '—';
        }
        if (t.mode === 'week') {
            const r = stKpWeekDates(t.week);
            return t.week + (r ? '（' + r[0].slice(5) + ' ~ ' + r[1].slice(5) + '）' : '');   // 短格式对齐班级侧 weekPickHint
        }
        return t.customFrom && t.customTo ? t.customFrom + ' ~ ' + t.customTo : '—';
    }

    // 双处同源回显：筛选条胶囊 + 弹窗底栏（份数 = 池内已勾选任务数，与 stKpTaskList 的学科+时间+勾选三重过滤等价）
    function stKSyncScopeEcho() {
        const total = stKpModalPool().filter(stKpTaskOn).length;
        const range = stKpTimeScopeText();
        const count = '已选 ' + total + ' 份';
        const set = (id, txt) => { const el = st$(id); if (el) el.textContent = txt; };
        set('stKpRangeText', range);
        set('stKpFilterCountText', count);
        set('stKpModalRangeEcho', range);
        set('stKpModalCountEcho', count);
        const btn = st$('stKpFilterCount');
        if (btn) btn.title = '统计范围 ' + range + ' · ' + count + '（点击设置时间范围与学情来源）';
    }

    // 已选份数回显（点击胶囊打开「学情来源与统计范围」弹窗；口径 = 当前学科 + 时间范围内且未取消勾选的任务数）
    function stKpRenderTasks() {
        stKSyncScopeEcho();
    }

    /* ---- 个人周期学情概览（参考班级周期学情概览：KPI + 周期结论；无独立趋势图，得分趋势并入学情来源弹窗） ---- */

    // 个人周期统计：基于该生周期内任务序列（stKpTaskList 含个人/班级得分率，按日期升序）；
    // 个人暂无上周期数据源 → 无环比，趋势判定按周期内首末进步（与班级「环比缺失回退首尾」同逻辑）
    function stKpPeriodStats() {
        const list = stKpTaskList(stCurrentStudent());
        const mine = list.map(t => t.mine);
        const n = mine.length;
        const avgMine = n ? Math.round(mine.reduce((a, b) => a + b, 0) / n * 10) / 10 : 0;
        const avgCls = n ? Math.round(list.reduce((a, t) => a + t.cls, 0) / n * 10) / 10 : 0;
        const delta = Math.round((avgMine - avgCls) * 10) / 10;
        const prog = n > 1 ? Math.round((mine[n - 1] - mine[0]) * 10) / 10 : null;
        const sd = n ? Math.round(Math.sqrt(mine.reduce((a, v) => a + (v - avgMine) ** 2, 0) / n) * 10) / 10 : 0;
        const max = n ? Math.max(...mine) : null;
        const min = n ? Math.min(...mine) : null;
        const range = n > 1 ? Math.round((max - min) * 10) / 10 : 0;
        const winCnt = list.filter(t => t.mine > t.cls).length;
        const assignCnt = list.filter(t => t.type === 'assignment').length;
        let trend = '—';
        if (prog !== null) {
            if (prog >= 3) trend = '显著回升';
            else if (prog >= 1) trend = '缓慢回升';
            else if (prog > -1) trend = '基本持平';
            else if (prog > -3) trend = '缓慢下滑';
            else trend = '明显下滑';
        }
        const stub = stKpStubList();
        return { list, n, avgMine, avgCls, delta, prog, sd, stable: Math.round((100 - sd) * 10) / 10, max, min, range, winCnt, assignCnt, examCnt: n - assignCnt, trend, stub };
    }

    // 个人周期结论规则表（when/cls/build 与班级 INSIGHT_RULES 同构；无环比 → prog 直接参与趋势判定）
    const PERSON_INSIGHT_RULES = [
        {
            id: 'trend', when: s => s.n > 0, cls: () => 'i-blue',
            build: s => `个人平均得分率 <b>${s.avgMine}%</b>（班级基准 <b>${s.avgCls}%</b>，差 <b class="${s.delta >= 0 ? 'up' : 'down'}">${s.delta > 0 ? '+' : ''}${s.delta}%</b>）；周期内最近一次较最早一次 <b class="${s.prog >= 0 ? 'up' : 'down'}">${s.prog > 0 ? '+' : ''}${s.prog}%</b>，趋势判定「<b>${s.trend}</b>」（个人暂无环比数据，按周期内首尾判定）。`
        },
        {
            id: 'stable', when: s => s.n > 0,
            cls: s => s.sd >= 5 ? 'i-red' : (s.sd >= 3 ? 'i-amber' : 'i-green'),
            build: s => `稳定度 <b>${s.stable}</b>（标准差 ${s.sd}），最高 <b>${s.max}%</b> / 最低 <b>${s.min}%</b>，极差 ${s.range}%，${s.sd >= 5 ? '波动偏大，提升尚未稳定' : (s.sd >= 3 ? '波动中等，需关注状态起伏' : '表现稳定')}。`
        },
        {
            id: 'vsClass', when: s => s.n > 0,
            cls: s => s.winCnt >= s.n * 0.6 ? 'i-green' : (s.winCnt < s.n * 0.4 ? 'i-amber' : 'i-blue'),
            build: s => {
                const loseList = s.list.filter(t => t.mine <= t.cls).map(t => `「${stEsc(t.name)}」（${t.mine}% vs 班级 ${t.cls}%）`);
                return `${s.n} 次任务中 <b>${s.winCnt} 次</b>高于班级均${loseList.length ? `，${loseList.join('、')} 落后` : '，全部领先班级'}；其中作业 ${s.assignCnt} 次 · 考试 ${s.examCnt} 次。`;
            }
        },
        {
            id: 'stub', when: s => s.stub.length > 0, cls: () => 'i-red',
            build: s => `<b>${s.stub.length}</b> 个考核项命中个人顽固薄弱（≥3 次失分率 ≥40%）：<b>${s.stub.map(k => stEsc(k.node.name)).join('、')}</b>，建议安排个人专项加练而非随堂重复讲题。`
        },
        {
            id: 'status', when: s => !!s.statusRec, cls: s => s.statusRec.watch ? 'i-red' : 'i-green',
            build: s => `状态判定「<b>${s.statusRec.label}</b>」（有效场次 <b>${s.statusRec.validN}</b> · 平均得分率 <b>${s.statusRec.avgRate}%</b>，与学生学情页徽章同源；完整规则见 PRD XK-10）：${stEsc(s.statusRec.advice)}。`
        }
    ];

    // 学情状态通俗解读（趋势图下方说明条）：六状态大白话映射，与学生学情页徽章同源（ST_STATUS_BY_ID）
    const ST_STATUS_PLAIN = {
        '待观察': '有效场次还不够，先按最近一次成绩看，多留意后续变化',
        '断崖下跌': '最近明显掉队了，建议尽快找学生了解原因、及时干预',
        '持续低位': '一直学得吃力，建议先补基础、适当降低任务难度',
        '低位回升': '之前学得吃力、现在开始好转，保持当前节奏别放松',
        '明显进步': '进步已经确认，可以适当提高任务挑战度',
        '平稳': '成绩稳定但缺少变化，建议从顽固薄弱点找突破'
    };

    // 个人周期概览渲染：KPI 卡（复用班级 period-kpi 样式）+ 周期结论（insight-list）
    function stKpRenderPeriodOverview() {
        const s = stKpPeriodStats();
        s.statusRec = ST_STATUS_BY_ID[stCurrentStudent().id] || null;
        const noData = stKpCache.tree && stKpCache.tree.noData;

        // 统计区间 hint（口径与知识点分析筛选一致：学科 + 时间范围 + 已勾选任务）
        const [from, to] = stKpTimeRange();
        st$('stKpPeriodHint').innerText = '统计区间：' + stKpState.time.subject + ' · ' + from + ' ~ ' + to + ' · 纳入 ' + s.n + ' 次任务（作业 ' + s.assignCnt + ' · 考试 ' + s.examCnt + '）';

        // KPI 卡（4 张）：趋势进退步与状态判定已结论化（见 PERSON_INSIGHT_RULES trend/status 条目），不再单独设卡避免口径重复
        const kpiCards = [
            { label: '个人平均得分率', value: s.n ? s.avgMine : '—', unit: s.n ? '%' : '', tone: '', delta: s.n ? (s.delta > 0 ? '+' : '') + s.delta + '%' : null, deltaCls: s.delta >= 0 ? 'up' : 'down', tip: '该生周期内各次任务个人得分率的算术平均（按任务次数平均，非按分值加权）', sub: `班级基准 <b>${s.n ? s.avgCls + '%' : '—'}</b> · 任务 ${s.n} 次` },
            { label: '稳定度', value: s.n ? s.stable : '—', unit: '', tone: s.sd > 5 ? 'tone-warn' : '', tip: '100 − 该生周期内各次得分率的标准差；越高越稳', sub: `标准差 <b>${s.n ? s.sd : '—'}</b> · 最高 <b>${s.max !== null ? s.max + '%' : '—'}</b> · 最低 <b>${s.min !== null ? s.min + '%' : '—'}</b>` },
            { label: '个人顽固薄弱', value: noData ? '—' : s.stub.length, unit: noData ? '' : '个', tone: s.stub.length ? 'tone-bad' : '', tip: '该生同一考核项在 ≥3 次不同任务中失分率 ≥40%（与个人知识图谱诊断-顽固薄弱同源）', sub: noData ? '该学科演示知识体系未覆盖' : (s.stub.length ? `首位「<b>${stEsc(s.stub[0].node.name)}</b>」掌握度 <b>${s.stub[0].node.mastery}%</b>` : '本周期暂无顽固薄弱') },
            { label: '高于班级场次', value: s.n ? s.winCnt + '/' + s.n : '—', unit: '', tone: '', tip: '该生个人得分率高于班级得分率的任务场次 / 周期内任务总数', sub: `落后场次 <b>${s.n - s.winCnt}</b> · 作业 ${s.assignCnt} · 考试 ${s.examCnt}` }
        ];
        st$('stKpPeriodKpiGrid').innerHTML = kpiCards.map((c, i) => `
            <div class="period-kpi ${c.tone}">
                <div class="pk-label"><span>${c.label}</span><span class="kpi-tip ${i === kpiCards.length - 1 ? 'tip-end' : ''}" tabindex="0" data-tip="${c.tip}">?</span></div>
                <div class="pk-value">${c.value}<span class="pk-unit">${c.unit}</span>${c.delta ? `<span class="pk-delta ${c.deltaCls}">${c.delta}</span>` : ''}</div>
                <div class="pk-sub">${c.sub}</div>
            </div>`).join('');

        const items = PERSON_INSIGHT_RULES.filter(r => r.when(s)).map(r => ({ cls: r.cls(s), html: r.build(s) }));
        st$('stKpPeriodInsightList').innerHTML = items.length
            ? items.map(it => `<div class="insight-item ${it.cls}"><div>${it.html}</div></div>`).join('')
            : '<div class="insight-item i-blue"><div>当前筛选范围内暂无该生任务数据。</div></div>';

        stKpRenderPeriodTrend();   // 该生周期得分趋势（口径与 KPI/结论同源；容器不可测量时由 stKpActivate 补渲染）

        // 趋势图下方说明条：学情状态通俗解读（六状态大白话，与该生当前状态动态联动）
        const note = st$('stKpPeriodStatusNote');
        const plain = st$('stKpPeriodStatusPlain');
        if (s.statusRec) {
            note.classList.toggle('note-watch', !!s.statusRec.watch);
            plain.innerHTML = `<span class="st-kp-status-plain-label">${stEsc(s.statusRec.label)}</span>${stEsc(ST_STATUS_PLAIN[s.statusRec.label] || s.statusRec.advice)}`;
        } else {
            note.classList.remove('note-watch');
            plain.textContent = '当前筛选范围内暂无该生状态判定';
        }
    }

    /* ---- 学情来源弹窗（交互同学科学情 filterModalOverlay：作业/考试双栏 + 栏头全选计数 + 确定/取消） ---- */

    // 默认勾选：ST_KP_TASKS 无 checked 字段即为选中；弹窗内取消勾选写回 checked:false，由 stKpTaskList 过滤
    const stKpTaskOn = (t) => t.checked !== false;

    // 弹窗任务池：当前学科 + 时间范围（含取消勾选项；直接返回 ST_KP_TASKS 原始引用以写回勾选态）
    function stKpModalPool() {
        const [from, to] = stKpTimeRange();
        const subject = stKpState.time.subject;
        return ST_KP_TASKS.filter(t => t.subject === subject && t.date >= from && t.date <= to);
    }

    // 单栏渲染（同学科学情 renderSourceColumn：空列显示空态并清全选；列表项带日期）
    function stKpModalColumn(list, containerId, checkAllId, emptyId) {
        const container = st$(containerId);
        const checkAll = st$(checkAllId);
        const emptyEl = st$(emptyId);
        if (list.length === 0) {
            container.innerHTML = '';
            checkAll.checked = false;
            emptyEl.style.display = 'flex';
            return;
        }
        emptyEl.style.display = 'none';
        checkAll.checked = list.every(stKpTaskOn);
        container.innerHTML = list.map(t => `
            <label class="check-item">
                <input type="checkbox" class="modal-item-checkbox" data-name="${stEsc(t.name)}" ${stKpTaskOn(t) ? 'checked' : ''}>
                <i class="fas fa-folder"></i>
                <span>${stEsc(t.name)}</span>
                <span class="item-date">${t.date}</span>
            </label>
        `).join('');
        container.querySelectorAll('.modal-item-checkbox').forEach(cb => {
            cb.onchange = (e) => {
                const t = list.find(x => x.name === e.target.dataset.name);
                if (t) t.checked = e.target.checked;   // 勾选变更即时写回任务池（同学科学情：取消不回滚，确定后才重算口径）
                stKpRenderFilterModal();
            };
        });
    }

    // 弹窗全量渲染：双栏列表 + 栏头计数「(已选/总数)」
    function stKpRenderFilterModal() {
        const pool = stKpModalPool();
        const assigns = pool.filter(t => t.type === 'assignment');
        const exams = pool.filter(t => t.type === 'exam');
        stKpModalColumn(assigns, 'stKpModalAssignList', 'stKpCheckAllAssignments', 'stKpAssignEmpty');
        stKpModalColumn(exams, 'stKpModalExamList', 'stKpCheckAllExams', 'stKpExamEmpty');
        st$('stKpLabelAssignCount').innerText = '(' + assigns.filter(stKpTaskOn).length + '/' + assigns.length + ')';
        st$('stKpLabelExamCount').innerText = '(' + exams.filter(stKpTaskOn).length + '/' + exams.length + ')';
        stKSyncScopeEcho();   // 勾选/全选/时间变更任一入口都会落到本函数，回显统一在此收口
    }

    // 个人周期得分趋势（原学情来源弹窗趋势图迁入概览）：x = 当前学科+时间范围已勾选任务（stKpTaskList，日期升序）；
    // 折线 = 个人得分率（蓝实线，考试▲/作业●）+ 班级得分率（灰虚线）；与 KPI/结论同口径，勾选变更经确定→stKpRenderAll 刷新；
    // 无 pin 高亮（勾选联动语义属弹窗，概览仅呈现纳入统计任务的整体趋势）
    function stKpRenderPeriodTrend() {
        const dom = st$('stKpPeriodTrendChart');
        if (!dom) return;
        if (st$('stViewKnowledge').hidden || !dom.offsetWidth) return;   // 页签未激活/容器不可测量时跳过，stKpActivate 时补渲染
        if (!window.echarts) { setTimeout(stKpRenderPeriodTrend, 150); return; }
        const chart = echarts.getInstanceByDom(dom) || echarts.init(dom);
        const items = stKpTaskList(stCurrentStudent());
        const emptyEl = st$('stKpPeriodTrendEmpty');
        if (!items.length) {
            chart.clear();
            emptyEl.style.display = 'flex';
            return;
        }
        emptyEl.style.display = 'none';
        chart.setOption({
            animation: false,
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(48, 59, 86, 0.92)',
                borderWidth: 0,
                textStyle: { color: '#fff', fontSize: 12 },
                formatter: (params) => {
                    const x = items[params[0].dataIndex];
                    return '<div style="font-weight:600;margin-bottom:2px">' + stEsc(x.name) + '</div>' +
                        '<div style="color:#b8c0d4">' + x.date + ' · ' + (x.type === 'exam' ? '考试' : '作业') + '</div>' +
                        params.map(p => p.marker + p.seriesName + '：<b>' + p.value + '%</b>').join('<br>');
                }
            },
            grid: { left: 44, right: 24, top: 36, bottom: 52 },
            xAxis: {
                type: 'category', data: items.map(x => x.name), boundaryGap: false,
                axisLabel: { interval: 0, fontSize: 10, color: '#64748b', lineHeight: 14, formatter: (v) => v.length > 8 ? v.slice(0, 8) + '…' : v },
                axisTick: { show: false }, axisLine: { lineStyle: { color: '#e2e8f0' } }
            },
            yAxis: {
                type: 'value', name: '得分率(%)', min: 0, max: 100,
                nameTextStyle: { color: '#94a3b8', fontSize: 10 },
                splitLine: { lineStyle: { color: '#f1f5f9' } },
                axisLabel: { color: '#94a3b8', fontSize: 10 }
            },
            series: [
                {
                    name: '个人得分率', type: 'line', smooth: true, z: 3,
                    data: items.map(x => ({ value: x.mine, symbol: x.type === 'exam' ? 'triangle' : 'circle', symbolSize: x.type === 'exam' ? 11 : 8 })),
                    lineStyle: { width: 2.5, color: '#3b82f6' },
                    itemStyle: { color: '#3b82f6', borderColor: '#fff', borderWidth: 1.5 },
                    label: { show: true, position: 'top', fontSize: 10, fontWeight: 700, color: '#2563eb', formatter: (p) => p.value + '%' }
                },
                {
                    name: '班级得分率', type: 'line', smooth: true,
                    data: items.map(x => x.cls),
                    symbol: 'circle', symbolSize: 5,
                    lineStyle: { width: 2, type: 'dashed', color: '#94a3b8' },
                    itemStyle: { color: '#94a3b8' }
                }
            ]
        }, true);
    }

    // 周选控件 hint（复用主模块算法文案格式）
    function stKpUpdateWeekHint() {
        const hint = st$('stKpWeekHint');
        const range = stKpWeekDates(stKpState.time.week);
        hint.textContent = range ? range[0].slice(5).replace('-', '/') + ' ~ ' + range[1].slice(5).replace('-', '/') : '--';
    }

    // 时间筛选档位对应的日期控件显隐（同学科学情顶部 showPicker 逻辑）；切到学年档时同步下拉当前值防状态不一致
    function stKpShowTimePicker(mode) {
        const map = { year: 'stKpYearPicker', month: 'stKpMonthPicker', week: 'stKpWeekPicker', custom: 'stKpCustomRange' };
        Object.keys(map).forEach(k => { st$(map[k]).style.display = k === mode ? 'flex' : 'none'; });
        if (mode === 'week') stKpUpdateWeekHint();
        if (mode === 'year') stKpState.time.year = st$('stKpYearSelect').value;
    }

    // 时间筛选变更统一出口：重渲染概览派生模块（内含胶囊回显），弹窗打开时同步刷新任务池列表与底栏回显
    function stKpTimeChanged() {
        stKpRenderAll();
        if (st$('stKpFilterModalOverlay').classList.contains('show')) stKpRenderFilterModal();
    }

    // 学生个人树：克隆班级树，按学号种子重算个人掌握度（确定性，刷新不变）
    // 任务数因子：范围内任务越少，个人偏移越收敛于班级基准（证据不足），频次/失分随任务数缩放
    // 演示知识体系仅覆盖数学：其他学科返回 noData 空树，各模块进入空态（任务清单仍展示该学科任务）
    function stKpTreeOf(student) {
        const subject = stKpState.time.subject;
        if (subject !== '数学') {
            stKpCache.tree = { name: subject + '知识体系', level: 0, mastery: 0, classMastery: 0, children: [], nTasks: stKpTaskList(student).length, noData: true };
            stKpCache.byName = {};
            return stKpCache.tree;
        }
        const base = stKpState.dimension === 'kp' ? AppData.kpTree : AppData.abilityTree;
        const nTasks = stKpTaskList(student).length;
        const coverage = Math.max(0.35, Math.min(1, nTasks / 6));   // 证据覆盖度：<6 份任务时个人特征弱化
        const freqScale = nTasks / 6;
        const clone = (n) => {
            const r = stSeed(student.id * 13 + n.name.length * 7 + n.level * 3);
            const m = Math.max(4, Math.min(99, Math.round((n.mastery + (r - 0.42) * 30 * coverage) * 10) / 10));
            const freq = Math.max(0, Math.round(((n.freq || 10) + Math.floor(stSeed(student.id + n.name.length) * 8)) * freqScale));
            const c = { name: n.name, level: n.level, mastery: m, classMastery: n.mastery, freq, lostCnt: freq ? Math.max(1, Math.round(freq * (100 - m) / 100)) : 0, nTasks };
            if (n.children) c.children = n.children.map(clone);
            return c;
        };
        const tree = clone(base);
        const byName = {};
        (function walk(n, parent, chapter, path) {
            byName[n.name] = { node: n, parent: parent ? parent.name : null, chapter, path: path.join(' / '), level: n.level };
            (n.children || []).forEach(c => walk(c, n, n.level === 1 ? n.name : chapter, path.concat(n.name)));
        })(tree, null, null, []);
        stKpCache.tree = tree;
        stKpCache.byName = byName;
        return tree;
    }

    function stKpFlatten(tree, excludeRoot) {
        const out = [];
        (function walk(n) { if (!(excludeRoot && n.level === 0)) out.push(n); (n.children || []).forEach(walk); })(tree);
        return out;
    }

    // 学生掌握档位：全校共用「设置掌握程度」档位配置——直接委托学科学情 statusOf（读 masteryLevels），
    // 档位名称/颜色随档位切换（3 档：掌握/一般/未掌握；4 档：优秀/掌握/一般/未掌握）
    function stKpStatus(m) {
        const s = statusOf(m);
        return { name: s.name, color: s.color, hex: s.hexColor, cls: s.cls };
    }

    // 个人知识点着色：按个人掌握档位取色（个人树内无该节点 → 灰），与个人图谱节点 / 目录色点同源
    function stKpKpHexOf(name) {
        const info = stKpCache.byName ? stKpCache.byName[name] : null;
        return info ? stKpStatus(info.node.mastery).hex : '#94a3b8';
    }

    function stKpIcon(level) {
        return stKpState.dimension === 'kp' ? (LEVEL_ICONS[level] || LEVEL_ICONS[1]) : ABILITY_ICON;
    }

    function stKpLabel() {
        return stKpState.dimension === 'kp' ? '知识点' : '能力';
    }

    // 摘要卡：考核项数量 / 未掌握 / 个人失分题次 / 个人均分率（对比班级）/ 顽固薄弱项
    function stKpRenderCards() {
        const student = stCurrentStudent();
        const label = stKpLabel();
        const nodes = stKpFlatten(stKpCache.tree, true);
        const unmastered = nodes.filter(n => n.mastery < unmasteredThreshold()).length;
        const lostTotal = nodes.reduce((a, n) => a + n.lostCnt, 0);
        const avgM = nodes.length ? Math.round(nodes.reduce((a, n) => a + n.mastery, 0) / nodes.length * 10) / 10 : 0;
        const avgC = nodes.length ? Math.round(nodes.reduce((a, n) => a + n.classMastery, 0) / nodes.length * 10) / 10 : 0;
        const delta = Math.round((avgM - avgC) * 10) / 10;
        const stub = stKpStubList();

        st$('stKpTitleText').textContent = label + '分析明细';
        // 卡1：知识点维度覆盖率口径「周期已检测 x / 全体系总数」（同学科学情 XK-05 卡1 逻辑，证据判定
        // stKpEvidenceStateOf 的 period + history；不随「查看全部知识点」范围开关变化——统计红线）；能力维度 = 非根节点总数
        const card1UnitEl = st$('stKpCard1').querySelector('.value-unit');
        const b4 = st$('stKpBadge4');
        if (stKpCache.tree.noData) {
            // 演示知识体系未覆盖该学科：卡片置 '--'，避免误读为 0 个知识点（覆盖率口径不适用，恢复单位）
            st$('stKpTitle1').textContent = label + '数量';
            st$('stKpVal1').textContent = '--';
            if (card1UnitEl) card1UnitEl.style.display = '';
            st$('stKpVal2').textContent = '--';
            st$('stKpVal3').textContent = '--';
            st$('stKpVal4').textContent = '--';
            st$('stKpVal5').textContent = '--';
            b4.textContent = '该学科演示数据未覆盖';
            b4.className = 'badge';
        } else {
            if (stKpState.dimension === 'kp') {
                const covered = nodes.filter(n => {
                    const evidence = stKpEvidenceStateOf(n.name).state;
                    return evidence === 'period' || evidence === 'history';
                }).length;
                st$('stKpTitle1').textContent = '周期已检测知识点';
                st$('stKpVal1').textContent = covered;   // 仅显示已检测数量（覆盖率分母不再并列展示）
                if (card1UnitEl) card1UnitEl.style.display = '';   // 恢复单位「个」
            } else {
                st$('stKpTitle1').textContent = label + '数量';
                st$('stKpVal1').textContent = nodes.length;
                if (card1UnitEl) card1UnitEl.style.display = '';
            }
            st$('stKpTitle2').textContent = '未掌握数量';
            st$('stKpVal2').textContent = unmastered;
            st$('stKpBadge2').innerText = '得分率 < ' + unmasteredThreshold() + '%';   // 徽章随「设置掌握程度」档位联动（同学科学情 badgeMasteryThreshold）
            st$('stKpVal3').textContent = lostTotal;
            st$('stKpVal4').textContent = avgM;
            b4.textContent = '与班级 ' + (delta > 0 ? '+' : '') + delta + '%';
            b4.className = 'badge ' + (delta >= 0 ? 'badge-success' : 'badge-danger');
        }
        st$('stKpTitle5').textContent = '顽固薄弱' + label;
        if (!stKpCache.tree.noData) st$('stKpVal5').textContent = stub.length;

        // 维度标签（计数与班级树一致，节点结构相同）；演示未覆盖学科不带计数
        const isKp = stKpState.dimension === 'kp';
        const tabKp = st$('stKpTabKp'), tabAb = st$('stKpTabAbility');
        tabKp.textContent = stKpCache.tree.noData ? '知识点' : '知识点 (' + stKpFlatten(AppData.kpTree, true).length + ')';
        tabAb.textContent = stKpCache.tree.noData ? '能力' : '能力 (' + stKpFlatten(AppData.abilityTree, true).length + ')';
        tabKp.classList.toggle('active', isKp);
        tabAb.classList.toggle('active', !isKp);
        tabKp.style.color = isKp ? 'var(--primary)' : 'var(--text-muted)';
        tabAb.style.color = !isKp ? 'var(--primary)' : 'var(--text-muted)';

        // 层级页签文案
        const tabs = st$('stKpTableTabs').querySelectorAll('span');
        const labels = ['全部', '一级' + label, '二级' + label, '三级' + label];
        tabs.forEach((t, i) => { t.textContent = labels[i] || t.textContent; });
    }

    // 目录数据源：图谱视图固定知识点树（同步主模块 kgRenderModules 的 useKpDir 逻辑），其余视图跟随当前维度
    function stKpDirTreeOf() {
        return stKpState.view === 'graph' ? stKpGraphTreeOf().tree : stKpCache.tree;
    }

    // 目录开关状态：kp 维度与图谱视图共用 modules，ability 维度独立记忆（对齐主模块 dirStateOf）
    function stKpDirStateOf() {
        if (stKpState.dimension === 'kp' || stKpState.view === 'graph') return stKpState.modules;
        if (!stKpState.abilityModules) stKpState.abilityModules = {};
        return stKpState.abilityModules;
    }

    // 目录/范围开关是否按知识点证据口径消费（知识点维度或图谱固定知识点树；能力维度无证据状态概念，同步主模块 useKpDir）
    function stKpUseKpDir() { return stKpState.dimension === 'kp' || stKpState.view === 'graph'; }

    // 范围开关保留过滤（同步主模块 kpScopeKeep）：未勾选时零覆盖一级模块整棵隐藏、有覆盖模块内 none 节点隐藏
    // （history/unlearned 保留：历史线索 + 结构完备）；勾选后全量；仅渲染层，统计口径不随开关变化
    function stKpScopeKeep(n) {
        if (stShowAllKp || !stKpUseKpDir()) return true;
        if (n.level === 0) return true;
        if (n.level === 1) return kpModuleCoverage(n.name).covered > 0;
        return evidenceStateOf(n.name).state !== 'none';
    }

    // 目录过滤变化后刷新当前视图（渲染层过滤，统计口径不受影响，对齐主模块 refreshViewsForDir）
    function stKpRefreshViewsForDir() {
        if (stKpState.view === 'tree') stKpInitTreeChart();
        else if (stKpState.view === 'table') stKpRenderTable(stKpState.tableMode);
        else if (stKpState.view === 'graph') stKpRenderGraph();
    }

    // 左侧统一目录（同步学科学情 kgRenderModules）：色点 + 名称 + 该生得分率徽章 + 覆盖/计数徽章，点击开关过滤；范围开关联动显隐
    function stKpRenderChapters() {
        const listEl = st$('stKpModuleList');
        if (!listEl) return;
        const useKpDir = stKpUseKpDir();
        const tree = stKpDirTreeOf();
        const state = stKpDirStateOf();
        const modules = (tree && tree.children) || [];
        // 范围开关联动目录（同步主模块）：默认仅显示周期学情包含的知识点模块（零覆盖模块行隐藏，计数随可见集合）；
        // 勾选后显示全部（零覆盖模块琥珀警示 + 可开关）；隐藏模块的开关状态字典保留，恢复显示不丢
        const dirModules = (useKpDir && !stShowAllKp)
            ? modules.filter(m => kpModuleCoverage(m.name).covered > 0)
            : modules;
        listEl.innerHTML = dirModules.map(m => {
            const on = state[m.name] !== false;
            const count = stKpFlatten(m, false).length;
            const st = stKpStatus(m.mastery);
            // 知识点目录：覆盖徽章「已考x/y」（有检测证据 period+history / 子树总数，学科级资产与班级同口径）；
            // 零覆盖模块降饱和 + 得分率徽章替换为「未检测」（未知 ≠ 未掌握）
            const cov = useKpDir ? kpModuleCoverage(m.name) : null;
            const zeroCov = !!cov && cov.covered === 0;
            // 目录色点 = 该模块（或能力）的个人掌握度档位色（无证据灰），不再按模块类型取色
            const dotColor = zeroCov ? '#94a3b8' : st.hex;
            const countHtml = cov
                ? '<span class="kg-mod-cov' + (zeroCov ? ' zero' : '') + '" title="本期已检测 ' + cov.covered + ' / 共 ' + cov.total + ' 个知识点（含周期外历史证据）">已考' + cov.covered + '/' + cov.total + '</span>'
                : '<span class="kg-mod-count">' + count + '</span>';
            const scoreHtml = zeroCov
                ? '<span class="kg-mod-score kg-mod-none" title="本期任务未覆盖该模块，暂无作答证据（未知 ≠ 未掌握）">未检测</span>'
                : '<span class="kg-mod-score" style="color:' + st.hex + ';background:' + st.hex + '1a" title="该生周期汇总得分率">' + Math.round(m.mastery) + '%</span>';
            return '<div class="kg-module-item' + (on ? '' : ' off') + (zeroCov ? ' zero-coverage' : '') + '" data-module="' + stEsc(m.name) + '" title="点击在视图中' + (on ? '隐藏' : '显示') + '该模块">' +
                '<i class="kg-mod-dot" style="background:' + dotColor + '"></i>' +
                '<span class="kg-mod-name">' + stEsc(m.name) + '</span>' +
                scoreHtml +
                countHtml + '</div>';
        }).join('');
        listEl.querySelectorAll('.kg-module-item').forEach(item => {
            item.onclick = () => {
                state[item.dataset.module] = state[item.dataset.module] === false;
                stKpRenderChapters();
                stKpRefreshViewsForDir();
            };
        });
        const onCnt = dirModules.filter(m => state[m.name] !== false).length;
        const cntEl = st$('stKpModuleCount');
        if (cntEl) cntEl.innerText = onCnt + '/' + dirModules.length;
        const titleEl = st$('stKpDirTitle');
        if (titleEl) titleEl.innerText = useKpDir ? '知识模块' : '核心素养';
        // 「查看全部知识点」复选框：仅知识点目录显示（能力树无证据状态概念；noData 学科无模块不渲染）；勾选态与 stShowAllKp 同步
        const showAllWrap = st$('stKpShowAllWrap');
        const showAllBox = st$('stKpShowAll');
        if (showAllWrap) {
            // 用 inline-flex 而非 ''（.kg-check 基类 display:flex 会覆盖 <label> 默认隐藏语义）；能力维度直接隐藏复选框本体
            showAllWrap.style.display = (useKpDir && modules.length) ? 'inline-flex' : 'none';
            if (showAllBox) showAllBox.checked = stShowAllKp;
        }
    }

    // 个人树状图底部图例：随「设置掌握程度」3/4 档实时生成（色块与节点着色同源 stKpStatus→statusOf/masteryLevels，全校共用档位配置）+ 灰色无证据标识
    function stKpRenderTreeLegend() {
        const el = st$('stKpTreeLegend');
        if (!el) return;
        const n = masteryLevels.length;
        const items = masteryLevels.map((lv, i) => {
            const hex = i >= n - 1 ? '#ef4444' : (i === n - 2 ? '#f59e0b' : '#10b981');
            const range = i === 0 ? `≥${lv.min}%` : (i === n - 1 ? `<${lv.max}%` : `${lv.min}~${lv.max}%`);
            return `<span class="tl-item"><i class="tl-sw" style="background:${hex}"></i>${lv.name} ${range}</span>`;
        }).join('');
        el.innerHTML = `<span class="tl-title">掌握程度：</span>${items}`
            + '<span class="tl-item"><i class="tl-sw" style="background:#94a3b8"></i>无作答证据 / 未覆盖</span>'
            + '<span class="legend-note">档位随「设置掌握程度」联动 · 灰色节点不展示个人掌握度（未知 ≠ 未掌握）</span>';
    }

    // 个人树状图：结构与班级版一致，节点色随个人掌握度
    function stKpInitTreeChart() {
        const dom = st$('stKpTreeChart');
        if (!dom || st$('stViewKnowledge').hidden) return;   // 视图隐藏期间跳过，切页签时补渲染
        if (dom.offsetWidth === 0) return;   // 学生追踪视图整体隐藏时容器不可测量，跳过（切回时由 stKpActivate 补渲染）
        if (!window.echarts) { setTimeout(stKpInitTreeChart, 500); return; }
        if (!stKpTreeChart) stKpTreeChart = echarts.getInstanceByDom(dom) || echarts.init(dom);
        // 渲染层过滤：剔除统一目录中关闭的一级模块与范围开关外节点（数据源与统计口径不受影响，对齐主模块 initTreeChart）
        const shown = stKpDirStateOf();
        const fullTree = stKpCache.tree;
        const tree = Object.assign({}, fullTree, { children: (fullTree.children || []).filter(c => shown[c.name] !== false) });
        // 证据四态灰色编码（仅知识点维度，同步主模块）：none/unlearned 恒灰（勾选「查看全部知识点」后仍灰）；
        // 范围开关仅控制 none 显隐（stKpScopeKeep），不影响配色；无证据节点不展示个人掌握度（未知 ≠ 未掌握）
        const useKpEv = stKpState.dimension === 'kp';
        const process = (n) => {
            const ev = (useKpEv && n.level > 0 && !n.noData) ? evidenceStateOf(n.name) : null;
            const gray = !!ev && (ev.state === 'none' || ev.state === 'unlearned');
            const item = {
                name: n.name,
                evState: ev ? ev.state : null,
                value: n.noData ? '--' : (gray ? null : n.mastery.toFixed(1)),
                itemStyle: { color: (n.noData || gray) ? '#94a3b8' : stKpStatus(n.mastery).hex },   // 未覆盖学科/无证据节点置灰，避免红色节点误导为低掌握
                children: n.children ? n.children.filter(stKpScopeKeep).map(process) : []
            };
            if (gray) item.label = { color: '#94a3b8' };
            return item;
        };
        const data = process(tree);
        // 末级节点行距保障：同主模块 initTreeChart，按可见叶子数动态增高容器（每叶 18px，保底 460px）
        const leafCount = (function cnt(n) {
            return (n.children && n.children.length) ? n.children.reduce((s, c) => s + cnt(c), 0) : 1;
        })(data);
        dom.style.height = Math.max(460, Math.ceil(leafCount * 18)) + 'px';
        stKpTreeChart.setOption({
            tooltip: {
                formatter: (p) => {
                    const pd = p.data || {};
                    if (pd.evState === 'none') return stEsc(p.name) + '<br>已学 · 本期暂无作答证据（未知 ≠ 未掌握）';
                    if (pd.evState === 'unlearned') return stEsc(p.name) + '<br>教学进度未到 · 未学（仅衔接，不布置加练）';
                    const info = stKpCache.byName[p.name];
                    const n = info ? info.node : null;
                    const cm = n ? n.classMastery : '--';
                    return stEsc(p.name) + '：个人 ' + p.value + '% · 班级 ' + cm + '%';
                }
            },
            series: [{
                type: 'tree',
                orient: 'LR',
                data: [data],
                left: '13%', right: '24%', top: '2%', bottom: '2%',
                symbolSize: 9,
                label: { position: 'left', align: 'right', verticalAlign: 'middle', fontSize: 12, distance: 8, color: '#334155' },
                leaves: { label: { position: 'right', align: 'left', verticalAlign: 'middle', distance: 8 } },
                lineStyle: { color: '#cbd5e1', width: 1.5, curveness: 0.5 },
                itemStyle: { borderWidth: 1.5, borderColor: '#ffffff' },
                initialTreeDepth: -1,
                expandAndCollapse: true,
                animationDuration: 400
            }]
        }, true);
        dom.classList.add('loaded');
        stKpRenderTreeLegend();   // 底部图例不依赖重渲染，紧随图表渲染同步刷新
        stKpTreeChart.resize();
    }

    // 表格：个人得分率 / 班级得分率 / 与班级差值 / 个人失分次数 / 掌握程度
    function stKpRenderTable(mode) {
        const label = stKpLabel();
        st$('stKpTableHead').innerHTML = '<tr>' +
            '<th>' + label + '</th>' +
            '<th>考察频次 (次)</th>' +
            '<th>个人得分率 (%)</th>' +
            '<th>班级得分率 (%)</th>' +
            '<th>与班级差值 (%)</th>' +
            '<th>个人失分次数</th>' +
            '<th>掌握程度</th>' +
            '<th>操作</th></tr>';

        const isAll = mode === 0;
        // 渲染层过滤：目录中关闭的一级模块整棵子树不进表格 + 范围开关同口径（与树状图/图谱一致，对齐主模块 currentTableRows）
        const shown = stKpDirStateOf();
        let nodes = [];
        ((stKpCache.tree && stKpCache.tree.children) || []).filter(c => shown[c.name] !== false)
            .forEach(c => stKpFlatten(c, true).forEach(n => nodes.push(n)));
        if (stKpUseKpDir()) nodes = nodes.filter(stKpScopeKeep);
        if (mode > 0) nodes = nodes.filter(n => n.level === mode);

        if (!nodes.length) {
            const emptyMsg = (stKpCache.tree && stKpCache.tree.noData)
                ? '该学科知识点演示数据未覆盖，仅任务清单与已选份数可用'
                : '暂无符合条件的数据';
            st$('stKpTableBody').innerHTML = '<tr><td colspan="8" style="padding: 40px; color: var(--text-muted);">' + emptyMsg + '</td></tr>';
            return;
        }
        st$('stKpTableBody').innerHTML = nodes.map(d => {
            const m = d.mastery, cm = d.classMastery;
            const diff = Math.round((m - cm) * 10) / 10;
            const diffColor = diff < 0 ? 'var(--danger)' : (diff > 0 ? 'var(--success)' : 'var(--text-main)');
            const diffText = diff > 0 ? '+' + diff : diff;
            const st = stKpStatus(m);
            const icon = stKpIcon(d.level);
            const paddingLeft = isAll ? (24 + (d.level - 1) * 24) : 24;
            // 无证据节点（none 已学未考 / unlearned 未学，仅知识点维度）：数值列置「—」（未知 ≠ 未掌握，与主模块表格同口径）
            const ev = stKpUseKpDir() && d.level > 0 && !treeNoData() ? evidenceStateOf(d.name) : null;
            const noEv = !!ev && (ev.state === 'none' || ev.state === 'unlearned');
            const cellsHtml = noEv
                ? '<td>—</td><td style="color:#94a3b8">—</td><td>—</td><td>—</td><td>—</td>' +
                  '<td><span class="status-label" style="color:#94a3b8;background:#f1f5f9">' + (ev.state === 'unlearned' ? '未学·仅衔接' : '本期未检测') + '</span></td>'
                : '<td>' + d.freq + '</td>' +
                  '<td style="font-weight:700; color:' + st.color + '">' + m.toFixed(1) + '%</td>' +
                  '<td>' + cm + '%</td>' +
                  '<td style="font-weight:700; color:' + diffColor + '">' + diffText + '%</td>' +
                  '<td style="color: var(--danger); font-weight: 600;">' + d.lostCnt + '</td>' +
                  '<td><span class="status-label ' + st.cls + '">' + st.name + '</span></td>';
            return '<tr>' +
                '<td style="text-align:left; padding-left: ' + paddingLeft + 'px;">' +
                '<span class="tree-node-icon ' + icon.c + '">' + icon.t + '</span>' +
                '<span style="' + (isAll && d.level === 1 ? 'font-weight: 700;' : '') + '">' + stEsc(d.name) + '</span></td>' +
                cellsHtml +
                '<td><span class="action-link" style="justify-content:center;" data-stkp-detail="' + stEsc(d.name) + '">查看详情</span></td>' +
                '</tr>';
        }).join('');
    }

    // 当前个人树是否为未覆盖学科（表格无证据判定门控）
    function treeNoData() { return !!(stKpCache.tree && stKpCache.tree.noData); }

    function stKpSwitchView(view) {
        stKpState.view = view;
        st$('stKpBtnTree').classList.toggle('active', view === 'tree');
        st$('stKpBtnTable').classList.toggle('active', view === 'table');
        st$('stKpBtnGraph').classList.toggle('active', view === 'graph');
        st$('stKpTreeView').style.display = view === 'tree' ? 'block' : 'none';
        st$('stKpTableView').style.display = view === 'table' ? 'block' : 'none';
        st$('stKpGraphView').style.display = view === 'graph' ? 'block' : 'none';
        // 图谱专属控件（布局切换 / 适应画布 / 工具栏 / 详情面板）与三栏布局随视图切换（同步学科学情 .graph-view 机制）
        st$('stKpAnalysisSection').classList.toggle('graph-view', view === 'graph');
        st$('stKpLayout').classList.toggle('view-graph', view === 'graph');
        stKpRenderChapters();   // 目录数据源随视图变化（图谱视图固定知识点目录，同步主模块 switchView 内 kgRenderModules 调用）
        if (view === 'tree') {
            stKpInitTreeChart();
            // ECharts 在隐藏容器（学生追踪视图整体隐藏 / 树状视图刚切回）上 resize 会把 canvas 回退到 100×dpr，需门控
            if (st$('stKpTreeChart').offsetWidth > 0) stKpTreeChart?.resize();
        } else if (view === 'graph') {
            stKpRenderGraph();   // 力导向 / 放射布局依赖画布实际尺寸，从隐藏恢复必须整体重渲染
            if (stKpGraphChart) stKpGraphChart.resize();
        } else {
            stKpRenderTable(stKpState.tableMode);
        }
        window.dispatchEvent(new Event('resize'));
    }

    function stKpSetChapters(expanded) {
        stKpState.chapters = expanded;
        st$('stKpChapterSidebar').hidden = !expanded;
        const btn = st$('stKpToggleChapters');
        btn.setAttribute('aria-expanded', String(expanded));
        btn.setAttribute('aria-label', expanded ? '收起目录' : '展开目录');
        btn.querySelector('span').textContent = expanded ? '收起目录' : '展开目录';
        btn.querySelector('i').className = expanded ? 'fas fa-outdent' : 'fas fa-indent';
        st$('stKpLayout').classList.toggle('chapters-collapsed', !expanded);
        requestAnimationFrame(() => { if (stKpState.view === 'tree') stKpTreeChart?.resize(); });
    }

    function stKpSwitchDimension(dim) {
        if (stKpState.dimension === dim) return;
        stKpState.dimension = dim;
        stKpRenderAll();
    }

    /* ---- 个人知识图谱诊断 ---- */

    // 顽固薄弱：个人掌握度低于未掌握阈值（unmasteredThreshold，随「设置掌握程度」档位联动，默认 <60）的二/三级节点，按掌握度升序取前 5（命中次数种子生成）
    // 判定前提：范围内 ≥3 次不同任务失分——任务不足时无顽固薄弱
    function stKpStubList() {
        const student = stCurrentStudent();
        const nTasks = (stKpCache.tree && stKpCache.tree.nTasks) || 0;
        if (nTasks < 3) return [];
        return stKpFlatten(stKpCache.tree, true)
            .filter(n => n.level >= 2 && n.mastery < unmasteredThreshold())
            .map(n => ({ node: n, heavyCnt: 3 + Math.floor(stSeed(student.id * 17 + n.name.length * 3) * 3) }))
            .sort((a, b) => a.node.mastery - b.node.mastery)
            .slice(0, 5);
    }

    function stKpRenderStub() {
        const stub = stKpStubList();
        st$('stKpStubCount').textContent = stub.length;
        const box = st$('stKpStubList');
        if (stKpCache.tree && stKpCache.tree.noData) {
            box.innerHTML = '<div class="kg-diag-empty"><i class="fas fa-info-circle"></i> ' + stEsc(stKpState.time.subject) + '知识体系演示数据未覆盖，暂无个人知识图谱诊断</div>';
            return;
        }
        if (!stub.length) {
            box.innerHTML = '<div class="kg-diag-empty"><i class="fas fa-check-circle"></i> 该生本周期暂无顽固薄弱项（≥3 次失分率 ≥40%）</div>';
            return;
        }
        box.innerHTML = stub.map((k, i) => {
            const info = stKpCache.byName[k.node.name];
            const lvCls = i === 0 ? 'lv1' : (i === 1 ? 'lv2' : (i === 2 ? 'lv3' : 'lv'));
            const lostRate = Math.round(100 - k.node.mastery);
            return '<div class="kg-stub-item">' +
                '<span class="kg-stub-no ' + lvCls + '">' + (i + 1) + '</span>' +
                '<div class="kg-stub-body">' +
                '<div class="kg-stub-title"><b style="color:' + stKpStatus(k.node.mastery).hex + '">' + stEsc(k.node.name) + '</b>' +
                '<span class="kg-tag kg-tag-red">顽固 · ' + k.heavyCnt + ' 次</span>' +
                (i === 0 ? '<span class="kg-tag kg-tag-orange">优先专项</span>' : '') + '</div>' +
                '<div class="kg-stub-track"><i style="width:' + lostRate + '%"></i></div>' +
                '<div class="kg-stub-meta">' +
                '<span>个人掌握度 <b>' + k.node.mastery + '%</b></span>' +
                '<span>· 班级 ' + k.node.classMastery + '%</span>' +
                '<span class="kg-stub-chap" title="' + stEsc(info ? info.path : '') + '">· ' + stEsc(info ? info.path : '—') + '</span>' +
                '</div></div>' +
                '<span class="kg-stub-pct">' + lostRate + '%</span>' +
                '</div>';
        }).join('');
    }

    // 前序断层：目标低于未掌握阈值（随「设置掌握程度」档位联动，默认 <60）且树内祖先链存在 <70 节点 → 根因在前序；无前置关系条目 → noRel（关系未建，不归因）
    function stKpCollectFaults() {
        const faults = [];
        (function walk(n, ancestors) {
            const next = ancestors.concat(n.level >= 1 ? [n] : []);
            if (n.level >= 2 && n.mastery < unmasteredThreshold()) {
                const chain = next.slice(0, -1);   // 目标之前的祖先链
                const weak = chain.filter(a => a.mastery < 70);
                // 无前置关系条目时祖先链仅为目录顺序，不得当作依赖归因——root 强制置 null，与断层卡第四态同口径
                const noRel = !((kpRelations[n.name] && kpRelations[n.name].prerequisite) || []).length;
                faults.push({ node: n, chain, root: noRel ? null : (weak.length ? weak[weak.length - 1] : null), noRel });
            }
            (n.children || []).forEach(c => walk(c, next));
        })(stKpCache.tree, []);
        return faults.sort((a, b) => a.node.mastery - b.node.mastery).slice(0, 5);
    }

    function stKpRenderFault() {
        const faults = stKpCollectFaults();
        // 判定口径脚注随「设置掌握程度」档位联动（未掌握阈值动态渲染；<70% 前置薄弱线为教研常量）
        const footEl = st$('stKpFaultFoot');
        if (footEl) footEl.innerHTML = '判定规则：该生目标知识点掌握度 &lt;' + unmasteredThreshold() + '%，且其前置中存在 &lt;70% 的节点 → 根因在前序，沿最弱前置回溯（最多 5 层、跨一级模块停止、环路跳过）至达标节点为止；近 5 层无 &lt;70% 前置则改判本点自身问题。<b>直接讲薄弱点会无效，需先补前序。</b>';
        const rootCnt = faults.filter(x => x.root).length;
        st$('stKpFaultCount').textContent = rootCnt + '/' + faults.length;
        const box = st$('stKpFaultList');
        if (stKpCache.tree && stKpCache.tree.noData) {
            box.innerHTML = '<div class="kg-diag-empty"><i class="fas fa-info-circle"></i> ' + stEsc(stKpState.time.subject) + '知识体系演示数据未覆盖，暂无前序断层归因</div>';
            return;
        }
        if (!faults.length) {
            box.innerHTML = '<div class="kg-diag-empty"><i class="fas fa-check-circle"></i> 该生无掌握度 <' + unmasteredThreshold() + '% 且有作答证据的知识点，无需前序回溯</div>';
            return;
        }
        box.innerHTML = faults.map((x, i) => {
            const n = x.node, root = x.root;
            const m = Math.round(n.mastery * 10) / 10;
            const chainHtml = x.chain.slice().reverse().map((cn, ci) => {
                const cm = Math.round(cn.mastery * 10) / 10;
                const isRoot = root && cn.name === root.name;
                const cls = isRoot ? 'root' : (cm < 70 ? 'weak' : 'ok');
                return (ci ? '<span class="kg-fault-arrow"><i class="fas fa-arrow-right-long"></i></span>' : '') +
                    '<span class="kg-fault-node ' + cls + '" title="掌握度 ' + cm + '%">' + stEsc(cn.name) + '<em>' + cm + '%</em></span>';
            }).join('');
            const tagHtml = x.noRel
                ? '<span class="kg-tag kg-tag-slate">前置关系未建 · 无法归因</span><span class="kg-tag kg-tag-slate">待标注</span>'
                : (root
                    ? '<span class="kg-tag kg-tag-purple">根因在前序：' + stEsc(root.name) + '</span><span class="kg-tag kg-tag-purple">前置补练</span>'
                    : '<span class="kg-tag kg-tag-cyan">前序已达标 · 本点自身问题</span><span class="kg-tag kg-tag-blue">同点巩固</span>');
            const action = x.noRel
                ? '处置：<b>可直接针对 ' + stEsc(n.name) + ' 做个人专项加练</b>；前置归因待题库补充标注后自动升级。'
                : (root
                    ? '处置：<b>先补 ' + stEsc(root.name) + '（' + Math.round(root.mastery) + '%）</b>，再讲 ' + stEsc(n.name) + '。直接讲后者，该生会卡在前序步骤上。'
                    : '处置：<b>可直接针对 ' + stEsc(n.name) + ' 做个人专项加练</b>，前置节点均已达标。');
            return '<div class="kg-fault-item" data-kp="' + stEsc(n.name) + '" role="button" tabindex="0" title="点击查看知识点详情">' +
                '<div class="kg-fault-hd">' +
                '<span class="kg-fault-rank">' + (i + 1) + '</span>' +
                '<b>' + stEsc(n.name) + '</b>' +
                '<span class="kg-tag kg-tag-red">' + m + '%</span>' +
                tagHtml + '</div>' +
                '<div class="kg-fault-chain">' + (x.noRel ? '<span class="kg-fault-node brk">前置关系未建 · 无法回溯</span>' : (chainHtml || '<span class="kg-fault-node ok">无前置链</span>')) + '</div>' +
                '<div class="kg-fault-meta">' + action + '</div>' +
                '<div class="kg-fault-cta">点击查看知识点详情 <i class="fas fa-chevron-right"></i></div>' +
                '</div>';
        }).join('');
        box.querySelectorAll('.kg-fault-item').forEach(item => {
            item.onclick = () => stKpModalDetail(item.dataset.kp);
        });
    }

    function stKpRenderConf() {
        const student = stCurrentStudent();
        const box = st$('stKpConfList');
        if (stKpCache.tree && stKpCache.tree.noData) {
            st$('stKpConfCount').textContent = 0;
            box.innerHTML = '<div class="kg-diag-empty"><i class="fas fa-info-circle"></i> ' + stEsc(stKpState.time.subject) + '知识体系演示数据未覆盖，暂无易混淆分析</div>';
            return;
        }
        const top = confusionData.slice(0, 3).map(c => ({
            a: c.a, b: c.b, kp: c.kp, expr: c.expr, fix: c.fix,
            hits: 1 + Math.floor(stSeed(student.id * 19 + c.a.length + c.b.length) * 4)
        }));
        st$('stKpConfCount').textContent = top.length;
        st$('stKpConfList').innerHTML = top.map(c =>
            '<div class="kg-conf-pair">' +
            '<div class="kg-conf-hd">' +
            '<span class="kg-conf-vs"><span>' + stEsc(c.a) + '</span><i>易混</i><span>' + stEsc(c.b) + '</span></span>' +
            '<span class="kg-conf-hits">' +
            '<span class="kg-tag kg-tag-red">该生 ' + c.hits + ' 次</span>' +
            '<span class="kg-tag" style="color:' + stKpKpHexOf(c.kp) + ';background:' + stKpKpHexOf(c.kp) + '14" title="知识点颜色 = 个人掌握情况">关联：' + stEsc(c.kp) + '</span>' +
            '</span></div>' +
            '<div class="kg-conf-body"><b>典型混淆表现：</b>' + stEsc(c.expr) + '</div>' +
            '<div class="kg-conf-fix"><i class="fas fa-check"></i> 辨析建议：' + stEsc(c.fix) + '</div>' +
            '</div>').join('');
    }

    /* ---- 个人题型易错点（同步学科学情 kgPitList：结构复用全局 pitfallHitData，命中次数按学号种子个人化派生） ---- */
    function stKpRenderPit() {
        const student = stCurrentStudent();
        const box = st$('stKpPitList');
        if (!box) return;
        if (stKpCache.tree && stKpCache.tree.noData) {
            st$('stKpPitCount').textContent = 0;
            box.innerHTML = '<div class="kg-diag-empty"><i class="fas fa-info-circle"></i> ' + stEsc(stKpState.time.subject) + '知识体系演示数据未覆盖，暂无个人易错点分析</div>';
            return;
        }
        const nTasks = (stKpCache.tree && stKpCache.tree.nTasks) || 0;
        if (!nTasks) {
            st$('stKpPitCount').textContent = 0;
            box.innerHTML = '<div class="kg-diag-empty"><i class="fas fa-check-circle"></i> 本周期无该生任务记录，暂无易错点统计</div>';
            return;
        }
        const list = pitfallHitData.map(p => ({
            qt: p.qt, pit: p.pit, kp: p.kp,
            hits: Math.min(nTasks, 1 + Math.floor(stSeed(student.id * 23 + p.pit.length) * 3)),   // 该生命中 1~3 次，封顶任务数（短周期 nTasks<3 时不得超出）
            tot: nTasks
        })).sort((a, b) => (b.hits / b.tot) - (a.hits / a.tot)).slice(0, 7);
        st$('stKpPitCount').textContent = list.length;
        box.innerHTML = list.map(p => {
            const pct = Math.round(p.hits / p.tot * 100);
            const tone = pct >= 40 ? 'hi' : (pct >= 25 ? 'mid' : 'lo');
            return '<div class="kg-pit-row">' +
                '<span class="kg-pit-qt">' + stEsc(p.qt) + '</span>' +
                '<span class="kg-pit-name" title="关联知识点：' + stEsc(p.kp) + '">' + stEsc(p.pit) + '</span>' +
                '<span class="kg-pit-hit ' + tone + '">该生 ' + p.hits + '/' + p.tot + ' 次</span>' +
                '<span class="kg-pit-pct ' + tone + '">' + pct + '%</span>' +
                '<span class="kg-pit-track"><i class="' + tone + '" style="width:' + Math.min(100, pct) + '%"></i></span>' +
                '<span class="kg-pit-kp">关联：<b style="color:' + stKpKpHexOf(p.kp) + '">' + stEsc(p.kp) + '</b></span>' +
                '</div>';
        }).join('');
    }

    /* ---- 个人前后序证据（同步学科学情 renderKgEvidenceOverview：例外表为全局结构性数据共享，周期内考查以该生 freq 判定） ---- */
    function stKpEvidenceStateOf(name) {
        const ex = KG_EVIDENCE_EXCEPTIONS[name];
        if (ex) {
            if (ex.state === 'history') return { state: 'history', rate: ex.rate, source: ex.source };
            return { state: ex.state, rate: null };
        }
        const info = stKpCache.byName ? stKpCache.byName[name] : null;
        if (!info || !info.node.freq) return { state: 'none', rate: null };
        return { state: 'period', rate: Math.round(info.node.mastery), count: info.node.freq };
    }

    function stKpRenderEvidence() {
        const chipsEl = st$('stKpEvidenceChips'), listEl = st$('stKpEvidenceList'), cntEl = st$('stKpEvidenceCount');
        if (!chipsEl || !listEl) return;
        if (stKpCache.tree && stKpCache.tree.noData) {
            cntEl.textContent = 0;
            chipsEl.innerHTML = '';
            listEl.innerHTML = '<div class="kg-diag-empty"><i class="fas fa-info-circle"></i> ' + stEsc(stKpState.time.subject) + '知识体系演示数据未覆盖，暂无前后序证据总览</div>';
            return;
        }
        const nodes = stKpFlatten(stKpCache.tree, true);
        const stats = { period: 0, history: 0, none: 0, unlearned: 0 };
        nodes.forEach(n => { stats[stKpEvidenceStateOf(n.name).state]++; });
        cntEl.textContent = stats.none;
        chipsEl.innerHTML = [
            ['period', '周期内考查 ' + stats.period],
            ['history', '历史证据 ' + stats.history],
            ['none', '暂无证据 ' + stats.none],
            ['unlearned', '未学 ' + stats.unlearned]
        ].map(([k, label]) => '<span class="kg-ev-chip ' + REL_EVIDENCE_DEFS[k].cls + '"><i style="background:' + REL_EVIDENCE_DEFS[k].color + '"></i>' + label + '</span>').join('');

        // 待诊断清单：暂无证据节点 + 引用它的知识点（谁的前置），点击打开该知识点详情
        const noneNodes = nodes.filter(n => stKpEvidenceStateOf(n.name).state === 'none');
        const refs = {};
        nodes.forEach(n => {
            ((kpRelations[n.name] && kpRelations[n.name].prerequisite) || []).forEach(p => {
                if (stKpEvidenceStateOf(p).state === 'none') (refs[p] = refs[p] || []).push(n.name);
            });
        });
        const withRefs = noneNodes.filter(n => refs[n.name]);
        const orphans = noneNodes.length - withRefs.length;
        let html = withRefs.map(n => '<div class="kg-ev-item" data-kp="' + stEsc(n.name) + '" role="button" tabindex="0" title="查看「' + stEsc(n.name) + '」知识点详情">' +
            '<span class="kg-ev-badge ev-none">暂无证据</span>' +
            '<b>' + stEsc(n.name) + '</b>' +
            '<span class="kg-ev-ref">「' + stEsc(refs[n.name].join('、')) + '」的前置 · 该生周期内与历史均未独立考查</span>' +
            '<i class="fas fa-chevron-right"></i>' +
            '</div>').join('');
        html += '<div class="kg-ev-note">另有 ' + orphans + ' 个暂无证据知识点未被薄弱目标前置引用，暂不进入待诊断清单；未学 ' + stats.unlearned + ' 个仅课堂衔接，不诊断、不加练。单次作业无法获取前后序作答数据，上述证据来自该生周期内多任务汇总（原型模拟）。</div>';
        listEl.innerHTML = html;
        listEl.querySelectorAll('.kg-ev-item').forEach(item => {
            item.onclick = () => stKpModalDetail(item.dataset.kp);
        });
    }

    /* ---- 个人已达标与进步（同步学科学情 renderKgAch：达标线共享 masteryLevels；正向变化首末场按学号种子确定性派生） ---- */
    function stKpRenderAch() {
        const sumEl = st$('stKpAchSummary');
        if (!sumEl) return;
        const cntEl = st$('stKpAchCount');
        if (stKpCache.tree && stKpCache.tree.noData) {
            cntEl.textContent = 0;
            sumEl.innerHTML = '';
            st$('stKpAchNote').innerText = stKpState.time.subject + '知识体系演示数据未覆盖';
            st$('stKpAchTrend').innerHTML = '<div class="kg-diag-empty"><i class="fas fa-info-circle"></i> 暂无已达标统计</div>';
            st$('stKpAchSkilledChips').innerHTML = '';
            st$('stKpAchPassedChips').innerHTML = '';
            // 清空上一学科残留的计数徽章 / 组标题 / 展开按钮与折叠态
            st$('stKpAchTrendCnt').innerText = '';
            st$('stKpAchSkilledCnt').innerText = '';
            st$('stKpAchPassedCnt').innerText = '';
            st$('stKpAchSkilledTitle').innerText = '熟练掌握';
            st$('stKpAchPassedTitle').innerText = '达标';
            st$('stKpAchSkilledChips').classList.remove('collapsed');
            st$('stKpAchPassedChips').classList.remove('collapsed');
            st$('stKpAchSkilledMore').hidden = true;
            st$('stKpAchPassedMore').hidden = true;
            return;
        }
        const line = masteryLevels[0].min;            // 达标线（默认 3 档 = 80，与学科学情同一配置联动）
        const skilledLine = Math.max(90, line);       // 熟练线
        const nodes = stKpFlatten(stKpCache.tree, true);
        const good = nodes.filter(n => n.mastery >= line).sort((a, b) => b.mastery - a.mastery);
        const skilled = good.filter(n => n.mastery >= skilledLine);
        const passed = good.filter(n => n.mastery < skilledLine);
        cntEl.textContent = good.length;
        st$('stKpAchNote').innerText = '达标线 ≥' + line + '%（随「设置掌握程度」档位联动）· 该生个人口径，统计为全量知识点';
        sumEl.innerHTML = [
            '<b>' + good.length + '</b> 个已达标',
            '占全部 ' + nodes.length + ' 个的 <b>' + (nodes.length ? Math.round(good.length / nodes.length * 100) : 0) + '%</b>',
            '其中熟练掌握 <b>' + skilled.length + '</b> 个'
        ].map(t => '<span>' + t + '</span>').join('<span class="kg-diag-ov-sep">·</span>');

        // 本周期正向变化：该生有效考查（freq>=2）节点，首末场得分率（首场 = 末场 − 种子扰动，确定性）
        const student = stCurrentStudent();
        const stable = [], newly = [], rising = [];
        nodes.filter(n => n.freq >= 2).forEach(n => {
            const last = Math.round(n.mastery * 10) / 10;
            const first = Math.round(Math.max(4, Math.min(99, last - stSeed(student.id * 31 + n.name.length) * 14)) * 10) / 10;
            const item = { name: n.name, first, last };
            if (first >= line && last >= line) stable.push(item);
            else if (last >= line) newly.push(item);
            else if (last - first >= 8) rising.push(item);
        });
        const trendTotal = stable.length + newly.length + rising.length;
        const trendCntEl = st$('stKpAchTrendCnt');
        if (trendCntEl) trendCntEl.innerText = trendTotal ? trendTotal + ' 项' : '';
        const trendRow = (it, badge, cls) => '<div class="kg-ach-trend-item" data-kp="' + stEsc(it.name) + '" role="button" tabindex="0" title="查看「' + stEsc(it.name) + '」详情">' +
            '<span class="kg-ach-badge ' + cls + '">' + badge + '</span>' +
            '<b>' + stEsc(it.name) + '</b>' +
            '<span class="kg-ach-track">首场 ' + it.first + '% <i class="fas fa-arrow-right"></i> 末场 ' + it.last + '%' + (it.last > it.first ? '（+' + Math.round((it.last - it.first) * 10) / 10 + '%）' : '') + '</span>' +
            '<i class="fas fa-chevron-right"></i>' +
            '</div>';
        const shown = stable.slice(0, 3).map(it => trendRow(it, '稳定达标', 'ach-stable')).join('')
            + newly.slice(0, 3).map(it => trendRow(it, '新晋达标', 'ach-newly')).join('')
            + rising.slice(0, 3).map(it => trendRow(it, '明显进步', 'ach-rising')).join('');
        const shownCnt = Math.min(stable.length, 3) + Math.min(newly.length, 3) + Math.min(rising.length, 3);
        st$('stKpAchTrend').innerHTML = trendTotal
            ? shown + (trendTotal > shownCnt ? '<div class="kg-rel-more">… 及另外 ' + (trendTotal - shownCnt) + ' 项</div>' : '')
            : '<div class="kg-diag-empty"><i class="fas fa-seedling"></i>该生本周期暂未出现达标或明显进步项</div>';
        st$('stKpAchTrend').querySelectorAll('.kg-ach-trend-item').forEach(item => {
            item.onclick = () => stKpModalDetail(item.dataset.kp);
        });

        // 已达标清单（chips 云，超过 12 个截断 + 展开全部）
        const renderChips = (listId, moreId, arr, emptyText) => {
            const listEl = st$(listId), moreEl = st$(moreId);
            if (!listEl) return;
            if (!arr.length) {
                listEl.classList.remove('collapsed');
                listEl.innerHTML = '<div class="kg-diag-empty">' + emptyText + '</div>';
                if (moreEl) moreEl.hidden = true;
                return;
            }
            listEl.innerHTML = arr.map(n => {
                const icon = LEVEL_ICONS[n.level] || LEVEL_ICONS[1];
                return '<span class="kg-ach-chip" data-kp="' + stEsc(n.name) + '" role="button" tabindex="0" title="查看「' + stEsc(n.name) + '」详情">' +
                    '<span class="tree-node-icon ' + icon.c + '">' + icon.t + '</span>' + stEsc(n.name) + ' <b>' + Math.round(n.mastery) + '%</b>' +
                    '</span>';
            }).join('');
            listEl.querySelectorAll('.kg-ach-chip').forEach(chip => {
                chip.onclick = () => stKpModalDetail(chip.dataset.kp);
            });
            const needMore = arr.length > 12;
            listEl.classList.toggle('collapsed', needMore);
            if (moreEl) {
                moreEl.hidden = !needMore;
                moreEl.innerText = '展开全部 ' + arr.length + ' 个';
                moreEl.onclick = () => { listEl.classList.remove('collapsed'); moreEl.hidden = true; };
            }
        };
        renderChips('stKpAchSkilledChips', 'stKpAchSkilledMore', skilled, '暂无 ≥' + skilledLine + '% 的知识点');
        renderChips('stKpAchPassedChips', 'stKpAchPassedMore', passed, '暂无 ' + line + '%–' + skilledLine + '% 的知识点');
        const setText = (id, text) => { const el = st$(id); if (el) el.innerText = text; };
        setText('stKpAchSkilledTitle', '熟练掌握（≥' + skilledLine + '%）');
        setText('stKpAchPassedTitle', '达标（' + line + '%–' + skilledLine + '%）');
        setText('stKpAchSkilledCnt', skilled.length ? skilled.length + ' 个' : '');
        setText('stKpAchPassedCnt', passed.length ? passed.length + ' 个' : '');
    }

    /* ---- 个人错因结构分析（同步学科学情 causeSection：CAUSE_DEFS 共享；该生矩阵 = 班级基准行 + 学号种子偏移 + 特征增益，行内归一） ---- */
    let stKpCauseChart = null;

    function stKpCauseMatrixOf(student, tasks) {
        const feat = student.id % CAUSE_DEFS.length;   // 该生特征错因（占比系统性偏高，确定性）
        return tasks.map((t, i) => {
            const base = causeMatrix[i % causeMatrix.length];
            const vals = CAUSE_DEFS.map((_, ci) => {
                let v = base[ci] + (stSeed(student.id * 37 + i * 7 + ci) - 0.5) * 10;
                if (ci === feat) v += 7;
                return Math.max(2, v);
            });
            const sum = vals.reduce((s, v) => s + v, 0);
            return vals.map(v => Math.round(v / sum * 1000) / 10);
        });
    }

    function stKpRenderCauseFindings(rows) {
        const box = st$('stKpCauseFindingList');
        if (!box) return;
        if (stKpCache.tree && stKpCache.tree.noData) {
            box.innerHTML = '<div class="insight-item i-blue"><div>' + stEsc(stKpState.time.subject) + '知识体系演示数据未覆盖，暂无该生错因分析</div></div>';
            return;
        }
        if (rows.length < 2) {
            box.innerHTML = '<div class="insight-item i-blue"><div>该生本周期任务不足 2 份，无法对比错因迁移</div></div>';
            return;
        }
        const first = rows[0], last = rows[rows.length - 1];
        const diffs = CAUSE_DEFS.map((c, i) => ({ def: c, from: first[i], to: last[i], delta: Math.round((last[i] - first[i]) * 10) / 10 }));
        const significant = diffs.filter(d => Math.abs(d.delta) >= 3).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
        const stable = diffs.filter(d => Math.abs(d.delta) < 3);
        let html = significant.map(d => {
            const up = d.delta > 0;
            return '<div class="insight-item ' + (up ? 'i-red' : 'i-green') + '">' +
                '<div><b>' + d.def.name + '</b>：' + d.from + '% → <b>' + d.to + '%</b>' +
                '<span class="cause-delta ' + (up ? 'up' : 'down') + '">' + (up ? '+' : '') + d.delta + '%</span><br>' +
                '<span class="insight-advice">' + causeAdviceOf(d.def, up) + '</span></div></div>';
        }).join('');
        if (stable.length) {
            html += '<div class="insight-item i-blue"><div><b>基本稳定</b>：' + stable.map(d => d.def.name).join('、') + ' 的占比变化均在 ±3% 以内，该生错因结构未发生明显迁移。</div></div>';
        }
        box.innerHTML = html;
    }

    function stKpRenderCause() {
        const student = stCurrentStudent();
        const tasks = stKpTaskList(student);
        const rows = stKpCauseMatrixOf(student, tasks);
        stKpRenderCauseFindings(rows);
        // 图表：视图隐藏期间跳过（ECharts 无法测量尺寸），切回知识页签时由 stKpActivate 补渲染
        if (st$('stViewKnowledge').hidden) return;
        const dom = st$('stKpCauseStackChart');
        if (!dom || dom.offsetWidth === 0) return;
        if (!window.echarts) { setTimeout(stKpRenderCause, 500); return; }
        if (!stKpCauseChart) stKpCauseChart = echarts.getInstanceByDom(dom) || echarts.init(dom);
        const legendEl = st$('stKpCauseLegend');
        if (stKpCache.tree && stKpCache.tree.noData) {
            stKpCauseChart.clear();
            stKpCauseChart.setOption({ graphic: [{ type: 'text', left: 'center', top: 'middle', style: { text: stKpState.time.subject + '知识体系演示数据未覆盖，暂无错因结构分析', fill: '#94a3b8', fontSize: 13 } }] });
            if (legendEl) legendEl.innerHTML = '';
            return;
        }
        if (!tasks.length) {
            stKpCauseChart.clear();
            stKpCauseChart.setOption({ graphic: [{ type: 'text', left: 'center', top: 'middle', style: { text: '本周期无该生智批作业任务，暂无错因结构分析', fill: '#94a3b8', fontSize: 13 } }] });
            if (legendEl) legendEl.innerHTML = '';
            return;
        }
        stKpCauseChart.setOption({
            // item 触发（与班级版错因结构分析同口径）：hover 某错因段时高亮该错因全部任务段，
            // 悬浮显示该错因在各次任务的占比 + 周期均值 + 首尾环比（tooltip 与高亮同口径）
            tooltip: {
                trigger: 'item',
                formatter: (p) => {
                    const ci = p.seriesIndex, def = CAUSE_DEFS[ci];
                    const rowIdx = rows.length - 1 - p.dataIndex; // series data 已 reverse（最新在上）
                    const delta = Math.round((rows[rows.length - 1][ci] - rows[0][ci]) * 10) / 10;
                    const avg = Math.round(rows.reduce((s, r) => s + r[ci], 0) / rows.length * 10) / 10;
                    const list = rows.map((row, ri) => ({ t: tasks[ri], v: row[ci], cur: ri === rowIdx })).reverse();
                    return '<div class="cause-tip">' +
                        '<div class="cause-tip-hd"><i class="legend-dot" style="background:' + causeColorOf(def, ci) + '"></i><b>' + stEsc(def.name) + '</b>' +
                        '<span class="cause-tip-avg">周期均值 ' + avg + '%</span>' +
                        '<span class="cause-delta ' + (delta > 0 ? 'up' : 'down') + '">' + (delta > 0 ? '+' : '') + delta + '%</span></div>' +
                        list.map(r => '<div class="cause-tip-row' + (r.cur ? ' cur' : '') + '"><span>' + stEsc(r.t.name) + '</span><b>' + r.v + '%</b></div>').join('') +
                        '</div>';
                }
            },
            grid: { left: 156, right: 40, top: 12, bottom: 34 },   // 个人任务名较长（如「周末专项卷 · 三角恒等变换」），加宽左区防裁切
            xAxis: {
                type: 'value', max: 100,
                axisLabel: { formatter: '{value}%', color: '#94a3b8' },
                splitLine: { lineStyle: { color: '#f1f5f9' } }
            },
            yAxis: {
                type: 'category',
                data: tasks.map(t => t.name).reverse(),
                axisLabel: { fontSize: 12, color: '#475569', width: 146, overflow: 'truncate' },
                axisTick: { show: false }, axisLine: { lineStyle: { color: '#e2e8f0' } }
            },
            series: CAUSE_DEFS.map((c, ci) => ({
                name: c.name, type: 'bar', stack: 'total', barWidth: 18,
                itemStyle: { color: causeColorOf(c, ci), borderRadius: ci === CAUSE_DEFS.length - 1 ? [0, 3, 3, 0] : 0 },
                emphasis: { focus: 'series' },
                data: rows.map(row => row[ci]).reverse()
            }))
        }, true);
        stKpCauseChart.resize();
        if (legendEl) {
            legendEl.innerHTML = CAUSE_DEFS.map((c, ci) =>
                '<span class="legend-item"><i class="legend-dot" style="background:' + causeColorOf(c, ci) + '"></i>' + c.name + '</span>').join('');
        }
    }

    /* ---- 诊断标签切换与状态同步（同步学科学情 KG_DIAG_TAB_DEFS 机制；fault 计数为「根因数/断层总数」格式，断层总数取第二段） ---- */
    const ST_KP_DIAG_TAB_DEFS = [
        { key: 'stub', countId: 'stKpStubCount', label: '顽固' },
        { key: 'fault', countId: 'stKpFaultCount', label: '断层', parse: v => v.split('/')[1] },
        { key: 'conf', countId: 'stKpConfCount', label: '混淆' },
        { key: 'pit', countId: 'stKpPitCount', label: '易错' },
        { key: 'evidence', countId: 'stKpEvidenceCount', label: '待诊断' },
        { key: 'ach', countId: 'stKpAchCount', label: '已达标' }
    ];

    function stKpSwitchDiagTab(key) {
        stKpState.diagTab = key;
        document.querySelectorAll('#stKpDiagTabs .kg-diag-tab').forEach(t => {
            const on = t.dataset.diag === key;
            t.classList.toggle('active', on);
            t.setAttribute('aria-selected', String(on));
        });
        document.querySelectorAll('#stKpDiagSection .kg-diag-panel').forEach(p => {
            p.classList.toggle('active', p.dataset.diag === key);
        });
    }

    // 渲染后同步：计数为 0 的标签灰显（仍可点击查看空态）+ 右侧诊断摘要（点击直跳对应标签）
    function stKpUpdateDiagTabStates() {
        const overview = st$('stKpDiagOverview');
        const parts = [];
        ST_KP_DIAG_TAB_DEFS.forEach(d => {
            const cntEl = st$(d.countId);
            if (!cntEl) return;
            const raw = (cntEl.textContent || '0').trim();
            const num = parseInt(d.parse ? d.parse(raw) : raw, 10) || 0;
            const tab = document.querySelector('#stKpDiagTabs .kg-diag-tab[data-diag="' + d.key + '"]');
            if (tab) tab.classList.toggle('is-empty', num === 0);
            parts.push('<span class="kg-diag-ov-item" data-diag="' + d.key + '" title="查看' + d.label + '类诊断"><b>' + num + '</b> ' + d.label + '</span>');
        });
        if (overview) {
            overview.innerHTML = parts.join('<span class="kg-diag-ov-sep">·</span>');
            overview.querySelectorAll('.kg-diag-ov-item').forEach(item => {
                item.onclick = () => stKpSwitchDiagTab(item.dataset.diag);
            });
        }
    }

    function stKpRenderDiag() {
        stKpRenderStub();
        stKpRenderFault();
        stKpRenderConf();
        stKpRenderPit();
        stKpRenderEvidence();
        stKpRenderAch();
        stKpUpdateDiagTabStates();
    }

    /* ---- 个人失分明细（摘要卡 3 下钻：与卡片同源 lostCnt 聚合，一期仅保留历史数据） ---- */
    let stKpLostSel = new Set();

    // 失分清单数据源：周期树内 lostCnt>0 的考核项，按个人得分率升序（最薄弱在前）
    function stKpLostList() {
        if (!stKpCache.tree || stKpCache.tree.noData) return [];
        return stKpFlatten(stKpCache.tree, true)
            .filter(n => n.lostCnt > 0)
            .sort((a, b) => a.mastery - b.mastery);
    }

    function stKpRenderLost() {
        const body = st$('stKpLostBody');
        if (!body) return;
        const label = stKpLabel();
        st$('stKpLostTh').textContent = '失分' + label;
        st$('stKpLostLabel').textContent = label;
        const list = stKpLostList();
        // 维度 / 学生 / 周期切换后按当前清单过滤勾选，防止跨口径串选
        stKpLostSel = new Set([...stKpLostSel].filter(name => list.some(n => n.name === name)));
        if (stKpCache.tree && stKpCache.tree.noData) {
            body.innerHTML = '<tr><td colspan="8" class="m-empty">' + stEsc(stKpState.time.subject) + '知识体系演示数据未覆盖，暂无失分明细</td></tr>';
        } else {
            body.innerHTML = list.map(n => {
                const info = stKpCache.byName[n.name];
                const st = stKpStatus(n.mastery);
                return '<tr>' +
                    '<td class="ck-cell"><input type="checkbox" class="st-kp-lost-ck" data-name="' + stEsc(n.name) + '"' + (stKpLostSel.has(n.name) ? ' checked' : '') + '></td>' +
                    '<td class="m-title-cell" title="' + stEsc(n.name) + '"><b>' + stEsc(n.name) + '</b></td>' +
                    '<td class="m-title-cell muted" title="' + stEsc(info ? info.path : '') + '">' + stEsc(info ? info.path : '—') + '</td>' +
                    '<td>' + n.freq + '</td>' +
                    '<td><span style="color:' + st.hex + ';font-weight:700">' + n.mastery + '</span></td>' +
                    '<td class="muted">' + n.classMastery + '</td>' +
                    '<td class="td-down">' + n.lostCnt + '</td>' +
                    '<td><span class="task-link" data-act="detail" data-name="' + stEsc(n.name) + '">查看详情</span></td>' +
                    '</tr>';
            }).join('') || '<tr><td colspan="8" class="m-empty">本周期该生无失分记录，全部达标</td></tr>';
        }
        const ckAll = st$('stKpLostCheckAll');
        ckAll.checked = list.length > 0 && stKpLostSel.size === list.length;
        ckAll.indeterminate = stKpLostSel.size > 0 && stKpLostSel.size < list.length;
        stKpUpdateLostSelInfo();
    }

    function stKpUpdateLostSelInfo() {
        st$('stKpLostSelInfo').textContent = '已选 ' + stKpLostSel.size + ' 项';
    }

    /* ---- 个人教学建议（规则表驱动：汇总该生各诊断结论为可执行动作，与学科学情-教学建议同构） ---- */
    const ST_KP_ADVICE_RULES = [
        {
            id: 'stub', tone: 'red', title: '个人专项突破',
            when: c => c.stubs.length > 0,
            why: c => `<b>${c.stubs.length}</b> 个${c.label}命中顽固薄弱（≥3 次失分率 ≥40%）：<b>${c.stubs.map(k => stEsc(k.node.name)).join('、')}</b>。建议安排个人专项讲练与针对性辅导。`,
            actions: [{ label: '查看顽固薄弱', ghost: true, run: () => stKpGoto('stKpDiagSection') }]
        },
        {
            id: 'fault', tone: 'orange', title: '前序补偿',
            when: c => c.faults.length > 0,
            why: c => {
                if (c.faultRoots.length) return `<b>${c.faults.length}</b> 个${c.label}掌握度 &lt;${unmasteredThreshold()}%，其中 <b>${c.faultRoots.length}</b> 个根因在前序（如「<b>${stEsc(c.faultRoots[0])}</b>」）。须先补前序再讲当前。`;
                const cov = c.relCov === null ? '' : `（前置关系标注覆盖 <b>${c.relCov}%</b>）`;
                return `<b>${c.faults.length}</b> 个${c.label}掌握度 &lt;${unmasteredThreshold()}%，前置关系尚未建立${cov}，暂按同点巩固处理；题库补充标注后自动升级为前序归因。`;
            },
            actions: [{ label: '查看断层归因', ghost: true, run: () => stKpGoto('stKpDiagSection') }]
        },
        {
            id: 'conf', tone: 'amber', title: '成对辨析',
            when: c => !c.noData && c.confTop.length > 0,
            why: c => `${c.confTop.length} 对易混淆最高「<b>${stEsc(c.confTop[0].a)} vs ${stEsc(c.confTop[0].b)}</b>」该生 ${c.confTop[0].hits} 次。建议成对辨析并让其自己讲出差别。`,
            actions: [{ label: '查看易混淆', ghost: true, run: () => stKpGoto('stKpDiagSection') }]
        },
        {
            id: 'gap', tone: 'cyan', title: '追赶班级',
            when: c => !c.noData && c.delta <= -5,
            why: c => `个人平均得分率 <b>${c.avgM}%</b> 低于班级平均 <b>${c.avgC}%</b>（<b>${c.delta}%</b>）。建议结合失分明细定位拖分${c.label}，优先补齐低于班级 10% 以上的差距项。`,
            actions: [
                { label: '导出个人学情单', run: () => stKpExport() },
                { label: '查看失分明细', ghost: true, run: () => stKpGoto('stKpLostSection') }
            ]
        },
        {
            id: 'maintain', tone: 'green', title: '达标维持',
            when: c => !c.noData && c.achCount > 0,
            why: c => `<b>${c.achCount}</b> 个${c.label}已达达标线（≥${masteryLevels[0].min}%）。建议转为每周 1 次滚动复测防回退，把练习时间让给薄弱项。`,
            actions: [{ label: '查看达标项', ghost: true, run: () => stKpSwitchView('table') }]
        },
        {
            id: 'relbuild', tone: 'slate', title: '关系建设引导',
            when: c => c.relGaps.length > 0,
            why: c => {
                const top = c.relGaps.slice(0, 3).map(k => `<b>${stEsc(k.name)}</b>`).join('、');
                const confTxt = c.confEmpty ? '；易混淆对数据为空，建议同步补充' : '';
                return `<b>${c.relGaps.length}</b> 个薄弱${c.label}尚无前置关系标注，前序归因能力受限。建议题库优先标注：${top}${confTxt}。`;
            },
            actions: [{ label: '查看断层归因', ghost: true, run: () => stKpGoto('stKpDiagSection') }]
        }
    ];

    // 直达入口：个人教学建议 / 摘要卡 → 对应模块滚动定位 + 脉冲高亮
    function stKpGoto(id) {
        const sec = st$(id);
        if (!sec) return;
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        sec.classList.remove('pulse-flash');
        void sec.offsetWidth;
        sec.classList.add('pulse-flash');
    }

    function stKpRenderAdvice() {
        const box = st$('stKpAdviceList');
        if (!box) return;
        const student = stCurrentStudent();
        const sBox = document.getElementById('stKpAdviceSummary');
        if (stKpCache.tree && stKpCache.tree.noData) {
            box.innerHTML = '<div class="kg-diag-empty"><i class="fas fa-info-circle"></i> ' + stEsc(stKpState.time.subject) + '知识体系演示数据未覆盖，暂无个人教学建议</div>';
            if (sBox) { sBox.innerHTML = ''; sBox.style.display = 'none'; }
            return;
        }
        const nodes = stKpFlatten(stKpCache.tree, true);
        const avgM = nodes.length ? Math.round(nodes.reduce((a, n) => a + n.mastery, 0) / nodes.length * 10) / 10 : 0;
        const avgC = nodes.length ? Math.round(nodes.reduce((a, n) => a + n.classMastery, 0) / nodes.length * 10) / 10 : 0;
        const faults = stKpCollectFaults();
        const stubs = stKpStubList();
        // 冷启动引导：该生薄弱（顽固 ∪ 断层）且无前置关系条目的知识点，按失分热度排序供题库优先标注
        const relGaps = [...new Set([
            ...stubs.map(k => k.node.name),
            ...faults.map(f => f.node.name)
        ])].filter(n => !((kpRelations[n] && kpRelations[n].prerequisite) || []).length)
            .map(n => {
                const node = nodes.find(x => x.name === n);
                return { name: n, hot: node ? 100 - node.mastery : 0 };
            }).sort((a, b) => b.hot - a.hot);
        const ctx = {
            studentName: student.name,
            label: stKpLabel(),
            noData: false,
            stubs,
            faults,
            faultRoots: [...new Set(faults.filter(f => f.root).map(f => f.root.name))],
            // hits 种子算法与 stKpRenderConf 同源，保证诊断卡与建议条数字一致
            confTop: confusionData.slice(0, 3).map(c => ({ a: c.a, b: c.b, hits: 1 + Math.floor(stSeed(student.id * 19 + c.a.length + c.b.length) * 4) })),
            avgM, avgC,
            delta: Math.round((avgM - avgC) * 10) / 10,
            achCount: nodes.filter(n => n.mastery >= masteryLevels[0].min).length,   // 达标线随「设置掌握程度」档位联动（同学科学情 maintain 规则口径）
            // 冷启动口径（关系为学科级资产，与班级版同源）
            relCov: kgRelationCoverage(),
            relGaps,
            confEmpty: !confusionData.length,
            // 综合方案数据：差距项（低于班级 10%）/ 已达标项名单（个人口径）
            gapNames: nodes.filter(n => n.classMastery - n.mastery >= 10).map(n => n.name),
            achNames: nodes.filter(n => n.mastery >= masteryLevels[0].min).map(n => n.name)
        };
        const items = ST_KP_ADVICE_RULES.filter(r => r.when(ctx));
        box.innerHTML = items.length ? items.map(r => `
            <div class="advice-item tone-${r.tone}">
                <div class="advice-bd">
                    <div class="advice-title">${r.title}</div>
                    <div class="advice-why">${r.why(ctx)}</div>
                </div>
                <div class="advice-actions">${r.actions.map((a, i) =>
                    `<button type="button" class="advice-btn${a.ghost ? ' ghost' : ''}" data-adv="${r.id}" data-act="${i}">${a.label}</button>`).join('')}
                </div>
            </div>`).join('')
            : '<div class="kg-diag-empty"><i class="fas fa-circle-check"></i> 该生本周期各项诊断均无异常，按既有节奏推进即可</div>';
        box.querySelectorAll('.advice-btn').forEach(b => {
            b.onclick = () => {
                const rule = ST_KP_ADVICE_RULES.find(r => r.id === b.dataset.adv);
                if (rule) rule.actions[Number(b.dataset.act)].run(ctx);
            };
        });
        stKpRenderAdviceSummary(items, ctx);
    }

    // 个人综合教学建议：复用班级版渲染器，关注范围与文案为该生口径
    function stKpRenderAdviceSummary(items, ctx) {
        renderTeachAdviceSummary(items, ctx, {
            boxId: 'stKpAdviceSummary',
            title: '个人综合教学建议',
            scopeOf: id => ({
                stub: ctx.stubs.map(k => k.node.name),
                fault: ctx.faultRoots.length ? ctx.faultRoots : ctx.faults.map(f => f.node.name),
                conf: ctx.confTop.map(x => `${x.a} vs ${x.b}`),
                gap: ctx.gapNames,
                maintain: ctx.achNames
            }[id] || []),
            parts: [
                ctx.faults.length ? (ctx.faultRoots.length
                    ? `先补 <b>${ctx.faultRoots.length}</b> 个前序根因，否则该生会卡在薄弱点的前序步骤`
                    : `直接对 <b>${ctx.faults.length}</b> 个断层点做个人专项巩固（前置关系未建，暂不归因）`) : null,
                ctx.stubs.length ? `再安排个人专项加练突破 <b>${ctx.stubs.length}</b> 个顽固薄弱` : null,
                ctx.confTop.length ? '易混淆项用成对辨析 + 互讲差异，替代无效刷题' : null,
                ctx.delta <= -5 ? `个人平均低于班级 <b>${Math.abs(ctx.delta)}%</b>，优先补齐拖分差距项` : null,
                ctx.achCount ? `已达标 <b>${ctx.achCount}</b> 项转为滚动复测，让出练习时间` : null
            ].filter(Boolean)
        });
    }

    /* ---- 导出 / 详情弹窗 ---- */

    function stKpExport() {
        const student = stCurrentStudent();
        const label = stKpLabel();
        const rows = [[label, '考察频次(次)', '个人得分率(%)', '班级得分率(%)', '与班级差值(%)', '个人失分次数', '掌握程度']];
        // 与表格同口径：目录中关闭的一级模块整棵子树不导出 + 范围开关同口径；无证据行数值列置「—」（对齐主模块 exportCurrentTable）
        const shown = stKpDirStateOf();
        const useKp = stKpUseKpDir();
        const noData = !!(stKpCache.tree && stKpCache.tree.noData);
        ((stKpCache.tree && stKpCache.tree.children) || []).filter(c => shown[c.name] !== false)
            .forEach(c => stKpFlatten(c, true).forEach(n => {
                if (useKp && !stKpScopeKeep(n)) return;
                const ev = useKp && n.level > 0 && !noData ? evidenceStateOf(n.name) : null;
                const noEv = !!ev && (ev.state === 'none' || ev.state === 'unlearned');
                if (noEv) {
                    rows.push([n.name, '—', '—', '—', '—', '—', ev.state === 'unlearned' ? '未学·仅衔接' : '本期未检测']);
                    return;
                }
                const diff = Math.round((n.mastery - n.classMastery) * 10) / 10;
                rows.push([n.name, n.freq, n.mastery, n.classMastery, diff, n.lostCnt, stKpStatus(n.mastery).name]);
            }));
        stExportCsv(student.name + '-' + label + '个人分析.csv', rows);
    }

    // 作答证据（演示数据）：该考点在各次任务（作业/考试）中的作答记录——题号/分值/题面、作答原文节选、我的/班级/年级得分率与失分标注
    // 任务选取：对范围内任务做确定性种子覆盖（覆盖概率随考察频次上升），兜底至少最近 1 次，最多展示最近 4 次（按任务时间倒序）
    function stKpEvidenceHtml(student, n) {
        const tasks = stKpTaskList(student);
        if (!tasks.length) return '<div class="st-mb-essay">当前筛选范围内暂无该考点的作答记录（原型演示）。</div>';
        const ratio = Math.min(0.8, Math.max(0.3, (n.freq || 3) / 30));
        const picked = [];
        tasks.forEach((t, i) => {
            if (stSeed(student.id * 7 + i * 31 + n.name.length * 13) < ratio) picked.push({ t, i });
        });
        if (!picked.length) picked.push({ t: tasks[tasks.length - 1], i: tasks.length - 1 });
        const shown = picked.slice(-4).reverse();   // 最新在前
        const cards = shown.map(({ t, i }) => {
            const sd = k => stSeed(student.id * 11 + i * 41 + n.name.length * 7 + k);
            const qNo = 1 + Math.floor(sd(1) * 18);
            const full = [5, 8, 10, 12, 15][Math.floor(sd(2) * 5)];
            const mine = Math.max(6, Math.min(100, Math.round(n.mastery + (sd(3) - 0.5) * 18)));
            const cls = Math.max(10, Math.min(98, Math.round(n.classMastery + (sd(4) - 0.5) * 8)));
            const grade = Math.max(8, Math.min(96, cls - 2 - Math.round(sd(5) * 6)));
            const stem = ['完成求解，并写出必要的推理过程。', '判断结论并说明依据，标注关键步骤。', '完成计算与检验，说明所用的定义或运算法则。'][Math.floor(sd(6) * 3)];
            const lost = mine < unmasteredThreshold();
            const ans = lost
                ? '解：① 直接套用公式完成求解；② 结果得出但未注明适用条件与检验步骤。（原型演示：作答原文节选）'
                : '解：依据「' + stEsc(n.name) + '」的定义与性质逐步推导：① 明确题设条件；② 关键步骤化简与代入；③ 得出结果并检验，过程完整。（原型演示：作答原文节选）';
            const ci = Math.floor(sd(7) * CAUSE_DEFS.length);
            const lossPiece = ['第②步化简符号处理有误', '关键判断依据混淆（相近概念用反）', '遗漏题干限定条件', '解法选择不当，中途换法', '关键步骤未写出，跳步失分', '末问空白未作答'][ci];
            return '<div class="st-mb-ev-card">' +
                '<div class="st-mb-ev-head"><span class="st-mb-ev-no">第' + qNo + '题</span>' +
                '<span class="st-mb-ev-task">（' + (t.type === 'exam' ? '考试' : '作业') + ' · ' + stEsc(t.name) + '）</span></div>' +
                '<div class="st-mb-ev-stem">（' + full + '分）结合「' + stEsc(n.name) + '」：' + stem + '</div>' +
                '<div class="st-mb-ev-ans">' + ans + '</div>' +
                (lost ? '<div class="st-mb-ev-loss"><i class="fas fa-triangle-exclamation"></i><b>失分步骤：</b>' + lossPiece + ' · <b>错因：</b><span style="color:' + CAUSE_DEFS[ci].color + '">' + CAUSE_DEFS[ci].name + '</span></div>' : '') +
                '<div class="st-mb-ev-foot">' +
                '<div class="st-mb-ev-stats">' +
                '<span class="st-mb-ev-stat"><span class="st-mb-ev-lb">我的得分率：</span><b style="color:' + statusOf(mine).hexColor + '">' + mine + '%</b></span>' +
                '<span class="st-mb-ev-stat"><span class="st-mb-ev-lb">班级得分率：</span><b>' + cls + '%</b></span>' +
                '<span class="st-mb-ev-stat"><span class="st-mb-ev-lb">年级得分率：</span><b>' + grade + '%</b></span>' +
                '</div>' +
                '<div class="st-mb-ev-mine"><button type="button" class="st-mb-ev-mine-btn" data-stkp-answer="1" data-no="' + qNo + '" data-task="' + stEsc(t.name) + '" data-kp="' + stEsc(n.name) + '" data-full="' + full + '" data-type="' + t.type + '"><i class="fas fa-pen"></i> 我的作答</button></div>' +
                '</div></div>';
        }).join('');
        const total = picked.length;
        const note = total > shown.length
            ? '按任务时间倒序 · 仅展示最近 ' + shown.length + ' 次（共 ' + total + ' 条记录，演示数据）'
            : '按任务时间倒序 · 演示数据';
        return '<div class="st-mb-ev-list">' + cards + '</div>' +
            '<div class="st-mb-ev-footbar"><span>' + note + '</span><span>共 ' + total + ' 条</span></div>';
    }

    function stKpModalDetail(name) {
        const info = stKpCache.byName[name];
        if (!info) return;
        const n = info.node;
        const st = stKpStatus(n.mastery);
        const student = stCurrentStudent();
        // 断层判定：与「前序断层归因」诊断卡同口径（stKpCollectFaults）；四态：关系未建 / 根因在前序 / 前序已达标
        const fault = n.mastery < unmasteredThreshold() ? stKpCollectFaults().find(f => f.node.name === name) : null;
        const faultHtml = fault
            ? (fault.noRel
                ? '<div class="st-mb-okpre"><i class="fas fa-circle-info"></i>本点前置关系未建立，暂无法归因；可直接针对本点做专项巩固，题库补充标注后自动升级为前序归因。</div>'
                : (fault.root
                    ? '<div class="st-mb-fault"><i class="fas fa-link-slash"></i><b>前序断层</b>：根因「<b>' + stEsc(fault.root.name) + '</b>」（掌握度 ' + Math.round(fault.root.mastery) + '%）未牢固，直接讲本点该生会卡在前序步骤，建议先补前序。</div>'
                    : '<div class="st-mb-okpre"><i class="fas fa-circle-check"></i>前置链均已达标（≥70%），本点为自身薄弱，可直接针对本点做专项巩固。</div>'))
            : '';
        const practiceBtn = '';
        stOpenModal(stKpLabel() + '个人明细 · ' + n.name,
            '<div class="st-mb-meta">' +
            '<span>学生：<b>' + stEsc(student.name) + ' (' + student.id + ')</b></span>' +
            '<span>层级：<b>' + '一二三'.charAt(n.level - 1) + '级</b></span>' +
            '<span>路径：<b>' + stEsc(info.path) + '</b></span>' +
            '<span>个人得分率：<b style="color:' + st.hex + '">' + n.mastery + '%</b></span>' +
            '<span>班级得分率：<b>' + n.classMastery + '%</b></span>' +
            '<span>掌握程度：<b style="color:' + st.hex + '">' + st.name + '</b></span>' +
            '</div>' +
            faultHtml +
            '<div class="st-mb-section-title">作答证据（历次作答 · 演示数据）</div>' +
            stKpEvidenceHtml(student, n) +
            '<div class="st-mb-op-row"><button class="st-mb-btn ghost" data-st-close="1">关闭</button><button class="st-mb-btn primary" data-st-close="1">查看错题本</button>' + practiceBtn + '</div>');
    }

    /* ---- 关联图谱（同步学科学情：多关系 + 力导向/放射 + 断层警示 + 关联详情，掌握度为该生个人口径） ---- */
    const stKpGraphState = {
        layout: 'force',          // force | radial
        depth: 3,                 // 展示深度：1/2/3 级知识点
        labelMode: 'compact',     // all | compact | none
        onlyRelated: false,       // 仅看有关联的知识点（与学科学情同口径）
        // 关系开关只保留画布可见的三类，四类关联节点池关系仅在详情面板呈现
        rels: { prerequisite: true, confusable: false, structure: true },
        selected: null
    };
    let stKpGraphChart = null;

    // 图谱固定知识点维度（kpRelations 仅维护知识点关系，与学科学情行为一致）；个人树独立缓存，随学生/周期/学科惰性重建
    const stKpGraphCache = { key: null, tree: null, byName: {} };

    function stKpGraphTreeOf() {
        const student = stCurrentStudent();
        const t = stKpState.time;
        const key = [student.id, t.subject, t.mode, t.month, t.week, t.year, t.customFrom, t.customTo].join('|');
        if (stKpGraphCache.key === key) return stKpGraphCache;
        if (t.subject !== '数学') {
            stKpGraphCache.key = key;
            stKpGraphCache.tree = { name: t.subject + '知识体系', level: 0, children: [], noData: true };
            stKpGraphCache.byName = {};
            return stKpGraphCache;
        }
        // 个人掌握度算法与 stKpTreeOf 同源（学号种子 + 证据覆盖度收敛），base 固定知识点树
        const nTasks = stKpTaskList(student).length;
        const coverage = Math.max(0.35, Math.min(1, nTasks / 6));
        const clone = (n) => {
            const r = stSeed(student.id * 13 + n.name.length * 7 + n.level * 3);
            const m = Math.max(4, Math.min(99, Math.round((n.mastery + (r - 0.42) * 30 * coverage) * 10) / 10));
            const c = { name: n.name, level: n.level, mastery: m, classMastery: n.mastery };
            if (n.children) c.children = n.children.map(clone);
            return c;
        };
        const tree = clone(AppData.kpTree);
        const byName = {};
        (function walk(n, parent, chapter, path) {
            byName[n.name] = { node: n, parent: parent ? parent.name : null, chapter, path: path.join(' / '), level: n.level };
            (n.children || []).forEach(c => walk(c, n, n.level === 1 ? n.name : chapter, path.concat(n.name)));
        })(tree, null, null, []);
        stKpGraphCache.key = key;
        stKpGraphCache.tree = tree;
        stKpGraphCache.byName = byName;
        return stKpGraphCache;
    }

    // 图谱断层：目标个人低于未掌握阈值（随「设置掌握程度」档位联动，默认 <60）且祖先链存在 <70（与该生「前序断层归因」诊断卡同算法，跑在图谱个人树上）
    function stKpGraphFaults() {
        const faults = [];
        (function walk(n, ancestors) {
            const next = ancestors.concat(n.level >= 1 ? [n] : []);
            if (n.level >= 2 && n.mastery < unmasteredThreshold()) {
                const chain = next.slice(0, -1);
                const weak = chain.filter(a => a.mastery < 70);
                faults.push({ node: n, chain, root: weak.length ? weak[weak.length - 1] : null });
            }
            (n.children || []).forEach(c => walk(c, next));
        })(stKpGraphTreeOf().tree, []);
        return faults.sort((a, b) => a.node.mastery - b.node.mastery).slice(0, 5);
    }

    function stKpGraphVisibleKpNodes() {
        // 渲染层过滤：目录中关闭的一级模块整棵子树不进图谱 + 范围开关同口径（零覆盖整棵/none 隐藏，对齐主模块 kgRender 的 modules 过滤）；
        // 根节点不进图谱集合（对齐主模块无根口径，否则统计条/结构边数与班级基线不一致）
        const shown = stKpDirStateOf();
        const tree = stKpGraphTreeOf().tree;
        const out = [];
        ((tree && tree.children) || []).filter(c => shown[c.name] !== false && stKpScopeKeep(c))
            .forEach(c => stKpFlatten(c, true).forEach(n => { if (stKpScopeKeep(n)) out.push(n); }));
        return out.filter(n => n.level <= stKpGraphState.depth);
    }

    // 收集关联边（同步主模块 kgCollectEdges）：只收知识点 ↔ 知识点，
    // 能力 / 题型 / 方法 / 易错点类关系不上画布，仅在知识点详情面板可见
    function stKpGraphCollectEdges(kpSet) {
        const edges = [];
        Object.keys(kpRelations).forEach(name => {
            if (!kpSet[name]) return;
            const e = kpRelations[name];
            (e.prerequisite || []).forEach(p => { if (kpSet[p] && stKpGraphState.rels.prerequisite) edges.push({ rel: 'prerequisite', source: p, target: name }); });
            (e.confusable || []).forEach(c => { if (kpSet[c] && stKpGraphState.rels.confusable) edges.push({ rel: 'confusable', source: name, target: c }); });
        });
        return { edges };
    }

    function stKpGraphBuildGraph() {
        const visible = {};
        stKpGraphVisibleKpNodes().forEach(n => { visible[n.name] = n; });
        let kpSet = visible;
        if (stKpGraphState.onlyRelated) {
            const first = stKpGraphCollectEdges(visible);
            const linked = new Set();
            first.edges.forEach(e => { linked.add(e.source); linked.add(e.target); });
            kpSet = {};
            Object.keys(visible).forEach(nm => { if (linked.has(nm)) kpSet[nm] = visible[nm]; });
        }
        const { edges } = stKpGraphCollectEdges(kpSet);
        if (stKpGraphState.rels.structure) {
            Object.keys(kpSet).forEach(name => {
                const parent = stKpGraphCache.byName[name].parent;
                if (parent && kpSet[parent]) edges.push({ rel: 'structure', source: parent, target: name });
            });
        }
        return { kpSet, edges };
    }

    // 放射布局坐标（同步学科学情：知识点按模块扇区径向排布）
    function stKpGraphRadialPositions(nodes, kpSet, dom) {
        const W = dom.clientWidth || 900, H = dom.clientHeight || 600;
        const cx = W / 2, cy = H / 2;
        const R = Math.min(W, H) * 0.42;
        const radius = { 1: R * 0.30, 2: R * 0.62, 3: R * 0.92 };
        const maxL = Math.max(1, ...Object.values(kpSet).map(n => n.level));
        const leavesOf = (n) => {
            let c = 0;
            const walk = (m) => { if (m.level === maxL) c++; (m.children || []).forEach(walk); };
            walk(n);
            return Math.max(c, 1);
        };
        const inSet = (n) => !!kpSet[n.name];
        const pos = {};
        const modules = (stKpGraphTreeOf().tree.children || []).filter(inSet);
        const assign = (n, a0, a1) => {
            const mid = (a0 + a1) / 2;
            pos[n.name] = { x: cx + Math.cos(mid) * (radius[n.level] || R), y: cy + Math.sin(mid) * (radius[n.level] || R), angle: mid };
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
                pos[nm] = { x: cx + Math.cos(ang) * R * 0.6, y: cy + Math.sin(ang) * R * 0.6, angle: ang };
            });
        }
        nodes.forEach(nd => { if (nd.kp && pos[nd.name]) { nd.x = pos[nd.name].x; nd.y = pos[nd.name].y; } });
    }

    // 渲染图谱（力导向 / 放射；红节点 = 该生断层薄弱，红边 = 诊断卡根因链）
    function stKpRenderGraph() {
        const dom = st$('stKpGraphChart');
        if (!dom) return;
        if (st$('stViewKnowledge').hidden) return;   // 视图隐藏期间跳过，切回时再渲染
        if (stKpState.view !== 'graph') return;       // 图谱视图未激活时跳过
        if (!window.echarts) { setTimeout(stKpRenderGraph, 500); return; }
        if (!stKpGraphChart) {
            stKpGraphChart = echarts.getInstanceByDom(dom) || echarts.init(dom);
            stKpGraphChart.on('click', (params) => {
                if (params.dataType === 'node' && params.data && params.data.kp) stKpGraphSelectNode(params.data.name);
            });
        }

        const cache = stKpGraphTreeOf();
        const { kpSet, edges } = stKpGraphBuildGraph();
        const statEl = st$('stKpKgStat');
        const kpCount = Object.keys(kpSet).length;
        // 范围内无证据节点计数（none + unlearned）：统计条后缀「含未检测 N」，灰色编码可辨（同步主模块）
        const noEvCount = Object.values(kpSet).filter(n => { const s = evidenceStateOf(n.name).state; return s === 'none' || s === 'unlearned'; }).length;
        if (statEl) statEl.innerHTML = `知识点 <b>${kpCount}</b> · 关联边 <b>${edges.length}</b>` +
            (noEvCount ? `<span style="color:#94a3b8">（含未检测 ${noEvCount}）</span>` : '');

        if (cache.tree.noData || !kpCount) {
            stKpGraphChart.clear();
            stKpGraphChart.setOption({
                graphic: [{ type: 'text', left: 'center', top: 'middle', style: { text: cache.tree.noData ? '该学科知识点演示数据未覆盖' : '请至少开启一类关系或调整深度', fill: '#94a3b8', fontSize: 13 } }]
            });
            stKpGraphSelectNode(null);
            return;
        }

        // 断层警示：节点角标与该生「前序断层归因」诊断卡同源
        const faultNames = new Set(stKpGraphFaults().map(f => f.node.name));

        const nodes = [];
        Object.values(kpSet).forEach(n => {
            const info = stKpGraphCache.byName[n.name];
            // 节点四态灰色编码（同步主模块）：none/unlearned 恒灰 + 降透明度，不展示个人掌握度，也不参与断层着色（未知 ≠ 未掌握）
            const ev = n.level > 0 && !cache.tree.noData ? evidenceStateOf(n.name) : null;
            const noEv = !!ev && (ev.state === 'none' || ev.state === 'unlearned');
            const isFault = !noEv && faultNames.has(n.name);
            const size = stKpGraphState.layout === 'radial' ? [0, 24, 13, 8][n.level] : [0, 28, 15, 9][n.level];
            nodes.push({
                name: n.name, kp: true, level: n.level, module: info.chapter, path: info.path,
                value: noEv ? null : Math.round(n.mastery * 10) / 10, cls: n.classMastery, fault: isFault,
                noEvTip: noEv ? (ev.state === 'unlearned' ? '教学进度未到 · 未学（仅衔接）' : '已学 · 本期暂无作答证据') : null,
                symbol: 'circle', symbolSize: size,
                itemStyle: {
                    // 节点填充色 = 个人掌握度档位色（与主模块同口径）；无证据灰，断层点另加红描边
                    color: noEv ? '#94a3b8' : stKpStatus(n.mastery).hex,
                    opacity: noEv ? 0.55 : 1,
                    borderColor: isFault ? '#b91c1c' : '#fff',
                    borderWidth: isFault ? 3 : (n.level === 1 ? 2 : 1),
                    shadowColor: isFault ? 'rgba(239, 68, 68, 0.5)' : 'transparent',
                    shadowBlur: isFault ? 12 : 0
                },
                label: {
                    show: stKpGraphState.labelMode === 'all' || (stKpGraphState.labelMode === 'compact' && n.level <= 2),
                    position: 'right', distance: 4,
                    color: noEv ? '#94a3b8' : (n.level === 1 ? '#1e293b' : '#475569'),
                    fontSize: n.level === 1 ? 11.5 : 10.5,
                    fontWeight: n.level === 1 ? 700 : 500
                }
            });
        });

        if (stKpGraphState.layout === 'radial') stKpGraphRadialPositions(nodes, kpSet, dom);

        const links = edges.map(e => {
            const def = KP_RELATION_DEFS[e.rel];
            // 断层边：指向断层节点(与诊断卡同口径) 且前置个人掌握度 <70 的前置边，红色加粗警示
            let broken = false;
            if (e.rel === 'prerequisite' && faultNames.has(e.target)) {
                const sInfo = stKpGraphCache.byName[e.source];
                // 无证据前置不算断层（未知 ≠ 未掌握），与主模块 kgRender 红边口径一致
                const sEv = sInfo ? evidenceStateOf(e.source).state : null;
                const sNoEv = sEv === 'none' || sEv === 'unlearned';
                broken = !!(sInfo && !sNoEv && sInfo.node.mastery < 70);
            }
            return {
                source: e.source, target: e.target, rel: e.rel, broken,
                lineStyle: {
                    color: broken ? '#ef4444' : def.color,
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
            labelLayout: { hideOverlap: true },
            emphasis: { focus: 'adjacency', scale: 1.15 },
            lineStyle: { curveness: 0.18 },
            data: nodes,
            links: links
        };
        if (stKpGraphState.layout === 'force') {
            series.layout = 'force';
            series.force = { repulsion: 170, edgeLength: [40, 120], gravity: 0.15, friction: 0.2 };
        } else {
            series.layout = 'none';
        }

        stKpGraphChart.setOption({
            tooltip: {
                confine: true,
                formatter: (p) => {
                    if (p.dataType === 'edge') {
                        const d = KP_RELATION_DEFS[p.data.rel];
                        const warn = p.data.broken ? '<br><span style="color:#ef4444;font-weight:700">⚠ 前置未牢固、后续已脱节，疑似该生学习断层</span>' : '';
                        return `<b>${d.name}</b><br>${stEsc(p.data.source)} → ${stEsc(p.data.target)}${warn}`;
                    }
                    const d = p.data;
                    const faultTip = d.fault ? '<br><span style="color:#ef4444;font-weight:700">⚠ 断层薄弱（个人掌握度 <' + unmasteredThreshold() + '%），点击查看关联详情</span>' : '';
                    if (d.noEvTip) {
                        return `<b>${stEsc(d.name)}</b><br>${['', '一级', '二级', '三级'][d.level]}知识点 · ${stEsc(d.module)}<br><span style="color:#94a3b8">${d.noEvTip}（未知 ≠ 未掌握）</span>`;
                    }
                    return `<b>${stEsc(d.name)}</b><br>${['', '一级', '二级', '三级'][d.level]}知识点 · ${stEsc(d.module)}<br>个人掌握度：${d.value}% · 班级：${d.cls}%${faultTip}`;
                }
            },
            series: [series]
        }, true);

        // 学生/周期切换后选中节点的个人掌握度已变化：详情面板随数据联动刷新
        if (stKpGraphState.selected && stKpGraphCache.byName[stKpGraphState.selected]) {
            stKpRenderGraphDetail(stKpGraphState.selected);
            stKpGraphChart.dispatchAction({ type: 'highlight', seriesIndex: 0, name: stKpGraphState.selected });
        } else {
            stKpGraphSelectNode(null);
        }
    }

    // 选中知识点：图谱高亮 + 个人关联详情面板
    function stKpGraphSelectNode(name) {
        stKpGraphState.selected = name;
        stKpRenderGraphDetail(name);
        if (stKpGraphChart && name && stKpGraphCache.byName[name]) {
            stKpGraphChart.dispatchAction({ type: 'downplay', seriesIndex: 0 });
            stKpGraphChart.dispatchAction({ type: 'highlight', seriesIndex: 0, name });
        }
    }

    function stKpRenderGraphDetail(name) {
        const panel = st$('stKpKgDetailPanel');
        if (!panel) return;
        if (!name || !stKpGraphCache.byName[name]) {
            panel.innerHTML = `<div class="kg-detail-empty"><i class="fas fa-hand-pointer"></i><p>点击图谱中的节点<br>查看该知识点的个人关联详情</p></div>`;
            return;
        }
        const info = stKpGraphCache.byName[name];
        const n = info.node;
        const children = n.children || [];
        const descCount = stKpFlatten(n, false).length - 1;
        const mastery = n.mastery;
        const st = stKpStatus(mastery);
        const entry = kgEntryOf(name);   // 全局：关系结构数据（kpRelations/kgIndex），与学生无关

        const GROUPS = [
            { key: 'prerequisite', title: '前置知识', color: KP_RELATION_DEFS.prerequisite.color, kp: true },
            { key: 'followUps', title: '后续知识', color: KP_RELATION_DEFS.prerequisite.color, kp: true },
            { key: 'confusable', title: '易混淆知识点', color: KP_RELATION_DEFS.confusable.color, kp: true },
            { key: 'examAbility', title: '考查能力', color: KP_RELATION_DEFS.examAbility.color, tag: '能力' },
            { key: 'requireAbility', title: '依赖能力', color: KP_RELATION_DEFS.requireAbility.color, tag: '能力' },
            { key: 'questionType', title: '考查题型', color: KP_RELATION_DEFS.questionType.color, tag: '题型' },
            { key: 'methods', title: '常用方法', color: KP_RELATION_DEFS.method.color, tag: '方法' },
            { key: 'errorPoints', title: '题型易错点', color: KP_RELATION_DEFS.errorPoint.color, tag: '易错点' }
        ];

        const relRow = (target, tag, dotColor, count, kMastery, brokenRow) => `
            <div class="kg-rel-row${brokenRow ? ' kg-rel-broken' : ''}" data-target="${stEsc(target)}">
                <span class="kg-rel-dot" style="background:${dotColor}"></span>
                <span class="kg-rel-name">${stEsc(target)}</span>
                <span class="kg-rel-tag">${tag}</span>
                ${kMastery !== null && kMastery !== undefined ? `<span class="kg-rel-mastery" style="color:${stKpStatus(kMastery).hex}" title="个人掌握度">${kMastery.toFixed(0)}%</span>` : ''}
                ${brokenRow ? '<span class="kg-rel-break">断层</span>' : ''}
                ${count ? `<span class="kg-rel-count">${count} 个知识点</span>` : ''}
            </div>`;

        let relHtml = '';
        let relTotal = 0;
        GROUPS.forEach(g => {
            const map = entry[g.key] || {};
            const keys = Object.keys(map);
            if (!keys.length) return;
            relTotal += keys.length;
            const shown = keys.slice(0, 8);
            relHtml += `<div class="kg-rel-group">
                <div class="kg-rel-title" style="color:${g.color}">${g.title} <span>${keys.length}</span></div>` +
                shown.map(k => {
                    const tag = g.kp
                        ? (stKpGraphCache.byName[k] ? ['一级', '二级', '三级'][stKpGraphCache.byName[k].level - 1] + '知识点' : '知识点')
                        : g.tag;
                    // 掌握度徽标：个人口径；前置行命中断层链（当前个人低于未掌握阈值且前置 <70）红底警示
                    const kInfo = g.kp ? stKpGraphCache.byName[k] : null;
                    const kMastery = kInfo ? kInfo.node.mastery : null;
                    const brokenRow = g.key === 'prerequisite' && kMastery !== null && mastery < unmasteredThreshold() && kMastery < 70;
                    // 行首色点 = 目标知识点的个人掌握度档位色（无证据灰），不再按关系类型取色
                    const dotColor = g.kp ? (kMastery === null ? '#94a3b8' : stKpStatus(kMastery).hex) : g.color;
                    return relRow(k, tag, dotColor, g.kp ? 0 : map[k].length, kMastery, brokenRow);
                }).join('') +
                (keys.length > 8 ? `<div class="kg-rel-more">… 及另外 ${keys.length - 8} 项</div>` : '') +
                `</div>`;
        });

        const diff = Math.round((mastery - n.classMastery) * 10) / 10;
        panel.innerHTML = `
            <div class="kg-detail-head">
                <span class="kg-detail-level">${['', '一级', '二级', '三级'][n.level]}知识点</span>
                <span class="kg-detail-mastery" style="color:${st.hex}">${mastery.toFixed(1)}%</span>
            </div>
            <h4 class="kg-detail-title">${stEsc(name)}</h4>
            <div class="kg-detail-path">${stEsc(info.path)}</div>
            <div class="kg-detail-stats">
                <span>个人<b style="color:${st.hex}">${mastery.toFixed(0)}%</b></span>
                <span>班级<b>${n.classMastery}%</b></span>
                <span class="muted" title="与班级差值">${diff > 0 ? '+' : ''}${diff}%</span>
                <span>关联<b>${relTotal}</b></span>
                <span>子孙<b>${descCount}</b></span>
            </div>
            <button type="button" class="kg-detail-diag-btn" id="stKpKgDiagBtn" title="查看该知识点的前后序证据与分目的加练建议（个人视角横幅 + 班级证据链）">
                <i class="fas fa-diagram-project"></i> 前后序关联诊断
            </button>
            <div class="kg-detail-scroll">
                ${relHtml || '<div class="kg-detail-none">该知识点暂未维护关联关系</div>'}
            </div>`;

        // 点击关系行 → 跳转选中目标知识点 / 高亮关联节点
        panel.querySelectorAll('.kg-rel-row').forEach(row => {
            row.onclick = () => {
                const t = row.dataset.target;
                if (stKpGraphCache.byName[t]) {
                    stKpGraphSelectNode(t);
                } else if (stKpGraphChart) {
                    stKpGraphChart.dispatchAction({ type: 'downplay', seriesIndex: 0 });
                    stKpGraphChart.dispatchAction({ type: 'highlight', seriesIndex: 0, name: t });
                }
            };
        });


        // F14 迁移：前后序关联诊断入口（与主模块同源抽屉；个人视角上下文用 resolve 闭包实时取个人值，抽屉内切换目标点后横幅同步）
        const diagBtn = st$('stKpKgDiagBtn');
        if (diagBtn) diagBtn.onclick = () => openRelDiagDrawer(name, null, {
            student: stCurrentStudent().name,
            resolve: (kpName) => {
                const kInfo = stKpGraphCache.byName[kpName];
                if (!kInfo) return null;
                const kFault = stKpGraphFaults().find(f => f.node.name === kpName);
                return {
                    mastery: kInfo.node.mastery,
                    classMastery: kInfo.node.classMastery,
                    faultRoot: kFault && kFault.root ? kFault.root.name : null
                };
            }
        });
    }

    // 底部图例：节点掌握度色阶 + 画布可见关系线型（与学科学情同源，能力/题型/方法/易错点类关系不入图例）
    function stKpRenderKgLegend() {
        const el = st$('stKpKgLegend');
        if (!el) return;
        const relItems = KG_CANVAS_RELATIONS.map(k => {
            const d = KP_RELATION_DEFS[k];
            return `<span class="legend-item" title="${stEsc(d.name)}">` +
                `<i class="kg-leg-line" style="border-color:${d.color};border-top-style:${d.lineType}"></i>${d.short}</span>`;
        }).join('');
        // 节点颜色 = 个人掌握程度（全校共用档位），不再按模块类型着色
        el.innerHTML = `<span class="legend-item kg-leg-title">节点掌握度</span>` + masteryLegendItemsHtml(true) +
            '<i class="kg-leg-sep"></i>' + relItems +
            `<span class="legend-item" style="margin-left:auto;color:#94a3b8">红描边 = 断层薄弱 · 箭头表示关联方向 · 能力/题型/方法/易错点关系见节点详情</span>`;
    }

    /* ---- 汇总渲染 / 激活 ---- */

    function stKpRenderAll() {
        stKpRenderTasks();   // 时间筛选任务清单与已选份数先行（树数据依赖范围内任务数）
        stKpTreeOf(stCurrentStudent());
        stKpRenderPeriodOverview();   // 个人周期学情概览（顽固薄弱口径依赖 stKpCache.tree，须在 stKpTreeOf 之后）
        stRenderKpTabStatus();        // 状态徽章范围说明随筛选刷新（仅知识点分析页签激活时可见于概览标题后）
        stKpRenderKgLegend();   // 关联图谱图例（静态关系体系，一次渲染）
        stKpRenderCards();
        stKpRenderChapters();
        stKpSetChapters(stKpState.chapters);
        stKpSwitchView(stKpState.view);
        stKpRenderDiag();
        stKpRenderCause(); // 个人错因结构分析（同步学科学情-错因结构分析）
        stKpRenderLost();   // 个人失分明细（摘要卡 3 下钻目标）
        stKpRenderAdvice(); // 个人教学建议
    }

    // 切到知识点分析页签时补渲染（容器 hidden 期间 ECharts 无法测量尺寸）
    function stKpActivate() {
        if (st$('stViewKnowledge').hidden) return;
        stKpRenderAll();
    }

    /* ---------------- 得分变化曲线（ECharts） ---------------- */
    let stTrendChart = null;

    function stChartData() {
        // 按提交时间升序（从早到晚），与截图 X 轴一致
        return stHomeworkInRange(stGenHomework(stCurrentStudent(), stState.chartSubject))
            .sort((a, b) => (a.date > b.date ? 1 : -1));
    }

    function stMetricValue(r, key) {
        if (stState.metric === 'rate') return Math.round(r.score / r.full * 1000) / 10;
        if (key === 'classAvg') return r.classAvg;
        if (key === 'gradeAvg') return r.gradeAvg;
        return r.score;
    }

    function stRenderTrendChart() {
        const dom = st$('stTrendChart');
        if (!dom || dom.offsetWidth === 0) return;   // 页签隐藏期间跳过，切页签时再渲染
        if (!window.echarts) { setTimeout(stRenderTrendChart, 500); return; }
        if (!stTrendChart) stTrendChart = echarts.getInstanceByDom(dom) || echarts.init(dom);

        const data = stChartData();
        const names = data.map((r) => r.name);
        const dates = data.map((r) => r.date);

        let yMax = 100;
        if (stState.metric === 'score' && data.length) {
            let maxV = 0;
            data.forEach((r) => {
                ['score', 'classAvg', 'gradeAvg'].forEach((k) => { maxV = Math.max(maxV, stMetricValue(r, k)); });
            });
            yMax = Math.max(35, Math.ceil(maxV * 1.08 / 5) * 5);
        }

        const seriesDefs = [
            { key: 'score', name: '个人得分', color: '#10b981' },
            { key: 'classAvg', name: '班级平均分', color: '#f59e0b' },
            { key: 'gradeAvg', name: '年级平均分', color: '#3b82f6' }
        ];
        const showLabel = data.length > 0 && data.length <= 4; // 点位少时直接标值

        stTrendChart.setOption({
            grid: { left: 48, right: 24, top: 40, bottom: 64 },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(48, 59, 86, 0.92)',
                borderWidth: 0,
                textStyle: { color: '#fff', fontSize: 12 },
                formatter: (params) => {
                    const i = params[0].dataIndex;
                    const rows = params.map((p) =>
                        '<div>' + p.marker + p.seriesName + '：<b>' + p.value + (stState.metric === 'rate' ? '%' : ' 分') + '</b></div>').join('');
                    return '<div style="font-weight:600;margin-bottom:2px">' + stEsc(data[i].name) + '</div>' +
                        '<div style="color:#b8c0d4">' + stEsc(data[i].date) + '</div>' + rows;
                }
            },
            legend: {
                top: 0, right: 0, icon: 'circle', itemWidth: 10, itemHeight: 10, itemGap: 18,
                textStyle: { fontSize: 12, color: '#64748b' }
            },
            xAxis: {
                type: 'category',
                data: names,
                axisTick: { alignWithLabel: true },
                axisLine: { lineStyle: { color: '#dfe4ec' } },
                axisLabel: {
                    interval: 0,
                    color: '#6b7487',
                    lineHeight: 18,
                    formatter: (v, i) => (v.length > 12 ? v.slice(0, 12) + '…' : v) + '\n' + dates[i]
                }
            },
            yAxis: {
                type: 'value',
                max: yMax,
                name: stState.metric === 'rate' ? '%' : '分',
                nameTextStyle: { color: '#97a0b3', align: 'right', padding: [0, 6, 0, 0] },
                axisLabel: { color: '#97a0b3' },
                splitLine: { lineStyle: { color: '#eef1f6' } }
            },
            series: seriesDefs.map((d) => ({
                name: d.name,
                type: 'line',
                color: d.color,
                data: data.map((r) => stMetricValue(r, d.key)),
                symbol: 'circle',
                symbolSize: 7,
                lineStyle: { width: 2 },
                emphasis: { focus: 'series' },
                label: showLabel ? {
                    show: true, position: 'top', distance: 6,
                    fontSize: 11, fontWeight: 600, color: d.color
                } : { show: false }
            }))
        }, true);
    }

    /* ---------------- 弹窗 ---------------- */
    function stOpenModal(title, html) {
        st$('stModalTitle').textContent = title;
        st$('stModalBody').innerHTML = html;
        st$('stModalOverlay').classList.add('show');
    }

    function stCloseModal() {
        st$('stModalOverlay').classList.remove('show');
    }

    // 作答图像预览（原型演示：未接入真实作答图，以占位图示意）：点击作答证据卡「我的作答」打开；
    // 关闭路径 = 遮罩空白 / 右上 × / Esc（Esc 由全局处理优先关本层，避免连底层详情弹窗一起关）
    function stKpOpenAnswerPreview(btn) {
        const d = btn.dataset;
        st$('stAnsPreviewTitle').textContent = '我的作答 · 第' + d.no + '题';
        st$('stAnsPreviewMeta').textContent = d.kp + ' · ' + d.task + '（' + (d.type === 'exam' ? '考试' : '作业') + '） · 满分 ' + d.full + ' 分';
        st$('stAnsPreviewNo').textContent = '第 ' + d.no + ' 题';
        st$('stAnsPreviewFull').textContent = d.full + ' 分';
        st$('stAnsPreviewOverlay').classList.add('show');
    }

    function stKpCloseAnswerPreview() {
        st$('stAnsPreviewOverlay').classList.remove('show');
    }

    function stModalDetail(name) {
        const student = stCurrentStudent();
        const pool = stGenHomework(student, stState.subject)
            .concat(stGenHomework(student, stState.subject === '英语' ? '物理' : '英语'));
        const rec = pool.find((r) => r.name === name) || ST_HW_EN_LIU[0];
        const rate = Math.round(rec.score / rec.full * 1000) / 10;
        stOpenModal('作答详情 · ' + rec.name,
            '<div class="st-mb-meta">' +
            '<span>学生：<b>' + stEsc(student.name) + ' (' + student.id + ')</b></span>' +
            '<span>学科：<b>' + stEsc(rec.subject) + '</b></span>' +
            '<span>提交日期：<b>' + stEsc(rec.date) + '</b></span>' +
            '<span>班名：<b>' + rec.rank + '</b></span>' +
            '<span>得分：<b>' + rec.score + ' / ' + rec.full + '</b></span>' +
            '<span>得分率：<b>' + rate + '%</b></span>' +
            '</div>' +
            '<div class="st-mb-section-title">作答内容（演示摘录）</div>' +
            '<div class="st-mb-essay">Dear Jim,<br>How is everything going? I am writing to tell you about our school sports meeting held last Friday. It was a great success. …<br><br>（原型演示：此处展示该生完整作答原文与逐题得分明细）</div>' +
            '<div class="st-mb-op-row"><button class="st-mb-btn ghost" data-st-close="1">关闭</button><button class="st-mb-btn primary" data-st-close="1">查看智批报告</button></div>');
    }

    function stModalImage(name) {
        stOpenModal('作答图像 · ' + name,
            '<div class="st-mb-meta"><span>来源：<b>扫描原图</b></span><span>状态：<b>已识别</b></span></div>' +
            '<div class="st-mb-image-ph"><i class="far fa-image"></i><span>原型演示：此处展示学生作答扫描原图（支持缩放与旋转）</span></div>');
    }

    /* ---------------- 导出 ---------------- */
    function stExportCsv(filename, rows) {
        const csv = '\uFEFF' + rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        stToast('已导出：' + filename);
    }

    function stExportHomework() {
        const student = stCurrentStudent();
        const records = stHomeworkInRange(stGenHomework(student, stState.subject));
        const rows = [['学科', '作业名称', '提交日期', '班名', '满分', '得分', '均分差', '得分率']];
        records.forEach((r) => {
            rows.push([r.subject, r.name, r.date, r.rank, r.full, r.score,
                stFmtDiff(Math.round((r.score - r.classAvg) * 100) / 100),
                Math.round(r.score / r.full * 1000) / 10 + '%']);
        });
        stExportCsv(student.name + '-' + stState.subject + '作业记录.csv', rows);
    }

    /* ---------------- 视图切换（sub-nav） ---------------- */
    function stShowView(name) {
        const isTrack = name === 'track';
        st$('subjectView').style.display = isTrack ? 'none' : '';
        st$('studentTrackView').hidden = !isTrack;
        document.querySelectorAll('.sub-nav-item').forEach((i) => {
            i.classList.toggle('active', i.dataset.view === name);
        });
        if (isTrack) {
            // ECharts 需容器可见后才能正确测量宽度，下一帧再渲染
            setTimeout(() => { stRenderTrendChart(); if (stTrendChart) stTrendChart.resize(); }, 0);
            // 学科学情侧「设置掌握程度」等全局口径变更后：知识点分析页签激活时补渲（含树图档位配色/图例）
            if (stState.tab === 'knowledge') setTimeout(stKpActivate, 0);
            const body = document.querySelector('.content-body');
            if (body) body.scrollTop = 0;
        } else {
            // 学科学情视图重新显示：视图隐藏期间的窗口 resize 会使页签内图表尺寸失效
            setTimeout(refreshActiveTabCharts, 0);
        }
    }

    /* ---------------- 事件绑定 ---------------- */
    function stBindEvents() {
        // sub-nav 视图切换
        document.querySelectorAll('.sub-nav-item').forEach((item) => {
            item.addEventListener('click', () => {
                const v = item.dataset.view;
                if (v === 'subject' || v === 'track') stShowView(v);
                else stToast('原型演示：「' + item.textContent.trim() + '」模块待接入');
            });
        });

        // 学生列表点击（事件委托）
        st$('stStudentList').addEventListener('click', (e) => {
            const li = e.target.closest('.st-student-item');
            if (!li) return;
            const id = Number(li.dataset.id);
            if (id !== stState.studentId) {
                stState.studentId = id;
                stState.hwPage = 1;
                stRenderStudentList();
                stRenderStudentHeader();
                stRefreshData();
            }
        });

        // 搜索 / 分组
        st$('stSearchInput').addEventListener('input', function () {
            stState.search = this.value;
            stRenderStudentList();
        });
        st$('stGroupFilter').addEventListener('change', function () {
            stState.group = this.value;
            stRenderStudentList();
        });

        // 星标切换
        st$('stStarBtn').addEventListener('click', () => {
            const s = stCurrentStudent();
            s.starred = !s.starred;
            stRenderStudentHeader();
            stRenderStudentList();
            stToast(s.starred ? '已加入星标学生' : '已取消星标');
        });

        // 数据页签：作业 / 考试 / 错题本
        st$('stDataTabs').addEventListener('click', (e) => {
            const tab = e.target.closest('.st-data-tab');
            if (!tab) return;
            stState.tab = tab.dataset.tab;
            stRenderStudentHeader();
        });

        // 考试-历次学情统计：学科页签切换（未参加学科禁用不可点）
        st$('stExamSubjectTabs').addEventListener('click', (e) => {
            const t = e.target.closest('.st-exam-sub-tab');
            if (!t || t.classList.contains('disabled') || t.classList.contains('active')) return;
            stState.examSubject = t.dataset.sub;
            stRenderExamHistory();
        });

        // 考试-历次学情统计：表格 / 折线图视图切换
        st$('stExamBtnTable').addEventListener('click', () => {
            if (stState.examView === 'table') return;
            stState.examView = 'table';
            stRenderExamHistory();
        });
        st$('stExamBtnLine').addEventListener('click', () => {
            if (stState.examView === 'line') return;
            stState.examView = 'line';
            stRenderExamHistory();
        });

        // 考试-折线图指标切换（个人得分 / 班级排名 / 年级排名，排名倒轴）
        st$('stExamRankSelect').addEventListener('change', (e) => {
            stState.examMetric = e.target.value;
            if (stState.examView === 'line') stRenderExamTrendChart();
        });

        // 考试-历次学情统计导出 CSV
        st$('stExamHistoryExport').addEventListener('click', stExportExamHistory);

        // 作业表格学科切换（注意：不能用箭头函数 + this，严格模式下 this 为 undefined）
        st$('stSubjectSwitch').addEventListener('click', (e) => {
            const chip = e.target.closest('.st-sub-chip');
            if (!chip) return;
            stState.subject = chip.dataset.subject;
            stState.hwPage = 1;
            st$('stSubjectSwitch').querySelectorAll('.st-sub-chip').forEach((c) => c.classList.toggle('active', c === chip));
            stRenderHomeworkTable();
        });

        // 日期区间弹层
        st$('stDateDisplay').addEventListener('click', (e) => {
            e.stopPropagation();
            st$('stDatePop').classList.toggle('show');
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.st-date-wrap')) st$('stDatePop').classList.remove('show');
        });
        st$('stDateApply').addEventListener('click', () => {
            const s = st$('stDateStart').value;
            const en = st$('stDateEnd').value;
            if (!s || !en) { stToast('请选择完整的起止日期'); return; }
            if (s > en) { stToast('开始日期不能晚于结束日期'); return; }
            stState.rangeStart = s;
            stState.rangeEnd = en;
            stState.hwPage = 1;
            st$('stDateText').textContent = s + ' ~ ' + en;
            st$('stDatePop').classList.remove('show');
            stRenderHomeworkTable();
            stRenderTrendChart();
        });
        st$('stDateReset').addEventListener('click', () => {
            st$('stDateStart').value = '2026-03-29';
            st$('stDateEnd').value = '2026-09-29';
        });

        // 显示排名
        st$('stRankToggle').addEventListener('change', function () {
            stState.rankVisible = this.checked;
            stRenderHomeworkTable();
        });

        // 分页（事件委托）
        st$('stHwPagination').addEventListener('click', (e) => {
            const el = e.target.closest('[data-pg]');
            if (!el || el.classList.contains('disabled') || el.classList.contains('active')) return;
            const records = stHomeworkInRange(stGenHomework(stCurrentStudent(), stState.subject));
            const pages = Math.max(1, Math.ceil(records.length / ST_PAGE_SIZE));
            if (el.dataset.pg === 'prev') stState.hwPage = Math.max(1, stState.hwPage - 1);
            else if (el.dataset.pg === 'next') stState.hwPage = Math.min(pages, stState.hwPage + 1);
            else stState.hwPage = Number(el.dataset.pg);
            stRenderHomeworkTable();
        });

        // 导出 / 电子作业本（考试视图导出按钮已随二期重构移除，不再绑定）
        st$('stExportBtn').addEventListener('click', stExportHomework);
        st$('stMistakeExport').addEventListener('click', () => stToast('原型演示：错题本导出'));
        st$('stEbookBtn').addEventListener('click', () => stToast('原型演示：打开 ' + stCurrentStudent().name + ' 的电子作业本'));

        // 作业表格操作（事件委托）
        st$('stHwBody').addEventListener('click', (e) => {
            const detail = e.target.closest('[data-detail]');
            if (detail) { stModalDetail(detail.dataset.detail); return; }
            const image = e.target.closest('[data-image]');
            if (image) { stModalImage(image.dataset.image); return; }
            const hw = e.target.closest('[data-hw]');
            if (hw) stModalDetail(hw.dataset.hw);
        });

        // （考试旧表格 stExamBody 已随二期重构移除，操作绑定同步移除）

        // 错题本点击
        st$('stMistakeList').addEventListener('click', () => stToast('原型演示：打开错题详情'));

        // 错题本学科筛选
        st$('stMistakeSubject').addEventListener('click', function (e) {
            const chip = e.target.closest('.st-sub-chip');
            if (!chip) return;
            stState.mistakeSubject = chip.dataset.msub;
            this.querySelectorAll('.st-sub-chip').forEach((c) => c.classList.toggle('active', c === chip));
            stRenderMistakeList();
        });

        // 图表学科切换
        st$('stChartSubject').addEventListener('click', function (e) {
            const chip = e.target.closest('.st-chart-sub');
            if (!chip) return;
            stState.chartSubject = chip.dataset.subject;
            this.querySelectorAll('.st-chart-sub').forEach((c) => c.classList.toggle('active', c === chip));
            stRenderTrendChart();
        });

        // 图表指标切换（得分 / 得分率）
        st$('stMetricSelect').addEventListener('change', function () {
            stState.metric = this.value;
            stRenderTrendChart();
        });

        /* ===== 学生学情面板（学科学情-【学生学情】页签） ===== */
        st$('stuSearchInput').addEventListener('input', function () {
            stStuState.search = this.value;
            stStuState.page = 1;
            stRenderStuTable();
        });
        st$('stuLevelBtns').addEventListener('click', (e) => {
            const btn = e.target.closest('.stu-level-btn');
            if (!btn || btn.classList.contains('active')) return;
            stStuState.level = btn.dataset.level;
            stStuState.page = 1;
            stRenderStuLevelBtns();
            stRenderStuDist();
            stRenderStuTable();
        });
        st$('stuTableBody').addEventListener('click', (e) => {
            const star = e.target.closest('[data-star]');
            if (star) {
                const s = ST_STUDENTS.find((x) => x.id === Number(star.dataset.star));
                if (s) {
                    s.starred = !s.starred;
                    stRenderStuTable();
                    stToast(s.starred ? '已标记学生：' + s.name : '已取消标记：' + s.name);
                }
                return;
            }
            const go = e.target.closest('[data-gostudent]');
            if (go) stStuGoStudent(Number(go.dataset.gostudent));
        });
        st$('stuPagination').addEventListener('click', (e) => {
            const el = e.target.closest('[data-pg]');
            if (!el || el.classList.contains('disabled') || el.classList.contains('active')) return;
            const rows = stStuRowsFiltered();
            const pages = Math.max(1, Math.ceil(rows.length / ST_STU_PAGE_SIZE));
            if (el.dataset.pg === 'prev') stStuState.page = Math.max(1, stStuState.page - 1);
            else if (el.dataset.pg === 'next') stStuState.page = Math.min(pages, stStuState.page + 1);
            else stStuState.page = Number(el.dataset.pg);
            stRenderStuTable();
        });

        /* ===== 学生追踪-知识点分析视图 ===== */
        st$('stKpTabKp').addEventListener('click', () => stKpSwitchDimension('kp'));
        st$('stKpTabAbility').addEventListener('click', () => stKpSwitchDimension('ability'));

        // 学科筛选：切换后任务清单/已选份数/知识点数据全量重算（演示知识体系仅覆盖数学）
        st$('stKpSubjectSelect').addEventListener('change', function () {
            stKpState.time.subject = this.value;
            stKpRenderAll();
        });

        // 时间筛选：切档（学年/月/周/自定义）→ 显隐对应日期控件 + 重渲染任务清单与个人数据
        st$('stKpTimeSegment').addEventListener('click', (e) => {
            const btn = e.target.closest('.segment-btn');
            if (!btn || btn.classList.contains('active')) return;
            stKpState.time.mode = btn.dataset.tmode;
            st$('stKpTimeSegment').querySelectorAll('.segment-btn').forEach(b => b.classList.toggle('active', b === btn));
            stKpShowTimePicker(btn.dataset.tmode);
            stKpTimeChanged();
        });
        st$('stKpMonthInput').addEventListener('change', function () {
            if (this.value) stKpState.time.month = this.value;
            stKpTimeChanged();
        });
        st$('stKpWeekInput').addEventListener('change', function () {
            if (this.value) stKpState.time.week = this.value;
            stKpUpdateWeekHint();
            stKpTimeChanged();
        });
        st$('stKpYearSelect').addEventListener('change', function () {
            stKpState.time.year = this.value;
            stKpTimeChanged();
        });
        st$('stKpCustomFrom').addEventListener('change', function () {
            if (this.value) stKpState.time.customFrom = this.value;
            stKpTimeChanged();
        });
        st$('stKpCustomTo').addEventListener('change', function () {
            if (this.value) stKpState.time.customTo = this.value;
            stKpTimeChanged();
        });

        // 学情来源与统计范围弹窗（交互同学科学情 filterModalOverlay）：点胶囊打开，时间范围 + 双栏勾选同屏一次设定，确定后按勾选任务重算已选份数与证据量因子 nTasks
        const stKpOpenFilterModal = () => {
            st$('stKpFilterModalOverlay').classList.add('show');
            stKpRenderFilterModal();
        };
        st$('stKpFilterCount').addEventListener('click', stKpOpenFilterModal);
        st$('stKpFilterCount').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stKpOpenFilterModal(); }
        });
        const stKpCloseFilterModal = () => st$('stKpFilterModalOverlay').classList.remove('show');
        st$('stKpFilterModalClose').addEventListener('click', stKpCloseFilterModal);
        st$('stKpBtnCancelModal').addEventListener('click', stKpCloseFilterModal);
        st$('stKpBtnConfirmModal').addEventListener('click', () => {
            if (!st$('stViewKnowledge').hidden) stKpRenderAll(); else stKpRenderTasks();   // 重算任务数证据因子与全部派生模块
            stKpCloseFilterModal();
        });
        st$('stKpCheckAllAssignments').addEventListener('change', function () {
            stKpModalPool().filter(t => t.type === 'assignment').forEach(t => t.checked = this.checked);
            stKpRenderFilterModal();
        });
        st$('stKpCheckAllExams').addEventListener('change', function () {
            stKpModalPool().filter(t => t.type === 'exam').forEach(t => t.checked = this.checked);
            stKpRenderFilterModal();
        });
        st$('stKpBtnTree').addEventListener('click', () => stKpSwitchView('tree'));
        st$('stKpBtnTable').addEventListener('click', () => stKpSwitchView('table'));
        st$('stKpTableTabs').addEventListener('click', (e) => {
            const t = e.target.closest('span[data-mode]');
            if (!t || t.classList.contains('active')) return;
            stKpState.tableMode = Number(t.dataset.mode);
            st$('stKpTableTabs').querySelectorAll('span').forEach((x) => x.classList.toggle('active', x === t));
            if (stKpState.view === 'table') stKpRenderTable(stKpState.tableMode);
        });
        st$('stKpToggleChapters').addEventListener('click', () => stKpSetChapters(!stKpState.chapters));
        st$('stKpExport').addEventListener('click', stKpExport);
        // 「查看全部知识点」范围开关（同步学科学情 kgShowAll）：目录行 + 树状图/表格/图谱/导出渲染层同步过滤，统计口径不动
        const stShowAllBox = st$('stKpShowAll');
        if (stShowAllBox) stShowAllBox.addEventListener('change', function () {
            stShowAllKp = this.checked;
            stKpRenderChapters();      // 零覆盖模块行随开关显隐（勾选态同步在 stKpRenderChapters 内）
            stKpRefreshViewsForDir();  // 当前视图同步重渲染
        });
        // 摘要卡下钻：未掌握数量 → 切表格视图；个人失分题次 → 失分明细清单；顽固薄弱项 → 诊断模块
        st$('stKpCard2').addEventListener('click', () => stKpSwitchView('table'));
        st$('stKpCard3').addEventListener('click', () => stKpGoto('stKpLostSection'));
        st$('stKpCard5').addEventListener('click', () => {
            st$('stKpDiagSection').scrollIntoView({ behavior: 'smooth' });
        });
        // 失分明细：全选 / 单选 / 查看详情 / 生成个人巩固卷
        st$('stKpLostCheckAll').addEventListener('change', (e) => {
            const list = stKpLostList();
            stKpLostSel = e.target.checked ? new Set(list.map(n => n.name)) : new Set();
            stKpRenderLost();
        });
        st$('stKpLostBody').addEventListener('click', (e) => {
            const ck = e.target.closest('.st-kp-lost-ck');
            if (ck) {
                if (ck.checked) stKpLostSel.add(ck.dataset.name); else stKpLostSel.delete(ck.dataset.name);
                const list = stKpLostList();
                const ckAll = st$('stKpLostCheckAll');
                ckAll.checked = list.length > 0 && stKpLostSel.size === list.length;
                ckAll.indeterminate = stKpLostSel.size > 0 && stKpLostSel.size < list.length;
                stKpUpdateLostSelInfo();
                return;
            }
            const d = e.target.closest('[data-act="detail"]');
            if (d) stKpModalDetail(d.dataset.name);
        });
        st$('stKpAdviceExport').addEventListener('click', () => stToast('个人教学建议单已导出（原型演示）'));
        st$('stKpTableBody').addEventListener('click', (e) => {
            const d = e.target.closest('[data-stkp-detail]');
            if (d) stKpModalDetail(d.dataset.stkpDetail);
        });

        // 个人知识图谱诊断 6 标签切换（同步学科学情-知识图谱诊断）
        document.querySelectorAll('#stKpDiagTabs .kg-diag-tab').forEach(tab => {
            tab.addEventListener('click', () => stKpSwitchDiagTab(tab.dataset.diag));
        });

        // 关联图谱（同步学科学情）：视图切换 / 布局 / 适应画布 / 深度与标签与关系开关 / 仅看关联
        st$('stKpBtnGraph').addEventListener('click', () => stKpSwitchView('graph'));
        const kgBtnForce = st$('stKpKgBtnForce'), kgBtnRadial = st$('stKpKgBtnRadial');
        kgBtnForce.addEventListener('click', () => {
            stKpGraphState.layout = 'force';
            kgBtnForce.classList.add('active');
            kgBtnRadial.classList.remove('active');
            stKpRenderGraph();
        });
        kgBtnRadial.addEventListener('click', () => {
            stKpGraphState.layout = 'radial';
            kgBtnRadial.classList.add('active');
            kgBtnForce.classList.remove('active');
            stKpRenderGraph();
        });
        st$('stKpKgBtnFit').addEventListener('click', () => {
            if (!stKpGraphChart) return;
            stKpGraphChart.dispatchAction({ type: 'restore' });
            if (stKpGraphState.layout === 'radial') stKpRenderGraph();   // 放射布局重算坐标即自适应
        });
        const bindKgChipGroup = (groupId, handler) => {
            const group = st$(groupId);
            group.querySelectorAll('.kg-chip').forEach(chip => {
                chip.onclick = () => {
                    group.querySelectorAll('.kg-chip').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    handler(chip.dataset);
                };
            });
        };
        bindKgChipGroup('stKpDepthGroup', (d) => { stKpGraphState.depth = Number(d.depth); stKpRenderGraph(); });
        bindKgChipGroup('stKpLabelGroup', (d) => { stKpGraphState.labelMode = d.label; stKpRenderGraph(); });
        st$('stKpRelationGroup').querySelectorAll('.kg-chip').forEach(chip => {
            chip.onclick = () => {
                const key = chip.dataset.rel;
                stKpGraphState.rels[key] = !stKpGraphState.rels[key];
                chip.classList.toggle('active', stKpGraphState.rels[key]);
                stKpRenderGraph();
            };
        });
        st$('stKpOnlyRelated').addEventListener('change', (e) => { stKpGraphState.onlyRelated = e.target.checked; stKpRenderGraph(); });

        // 弹窗关闭
        st$('stModalClose').addEventListener('click', stCloseModal);
        st$('stModalOverlay').addEventListener('click', (e) => {
            if (e.target === st$('stModalOverlay')) stCloseModal();
        });
        st$('stModalBody').addEventListener('click', (e) => {
            if (e.target.closest('[data-st-close]')) { stCloseModal(); return; }
            const ansBtn = e.target.closest('[data-stkp-answer]');
            if (ansBtn) stKpOpenAnswerPreview(ansBtn);
        });
        // 作答图像预览弹窗（叠于详情弹窗之上）：遮罩空白 / 右上 × 关闭
        st$('stAnsPreviewOverlay').addEventListener('click', (e) => {
            if (e.target === st$('stAnsPreviewOverlay') || e.target.closest('#stAnsPreviewClose')) stKpCloseAnswerPreview();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // 预览层打开时 Esc 仅关预览层，避免把底层详情弹窗一并关掉
                if (st$('stAnsPreviewOverlay').classList.contains('show')) { stKpCloseAnswerPreview(); return; }
                stCloseModal();
            }
        });

        // 窗口尺寸变化同步图表
        window.addEventListener('resize', () => {
            if (!st$('studentTrackView').hidden) {
                stTrendChart?.resize();
                stExamBarChart?.resize();
                stExamTrendEChart?.resize();
                if (stState.tab === 'knowledge') {
                    stKpTreeChart?.resize();
                    if (stKpState.view === 'graph') stKpGraphChart?.resize();
                    stKpCauseChart?.resize(); // 个人错因结构堆叠图
                }
            }
            if (st$('subjectView').style.display !== 'none' && !document.getElementById('studentsTabPanel').hidden) {
                stuDistChart?.resize();
            }
        });
    }

    /* ---------------- 汇总刷新 ---------------- */
    function stRefreshData() {
        stRenderHomeworkTable();
        stRenderExamView();
        stRenderMistakeList();
        stRenderTrendChart();
        stKpRenderAll();   // 知识点分析视图数据同步（树图渲染带可见性门控，隐藏期自动跳过）
    }

    /* ---------------- init ---------------- */
    function stInit() {
        stRenderStudentList();
        stRenderStudentHeader();
        stRefreshData();
        stBindEvents();
        // 学生学情面板（位于学科学情视图内，切到「学生学情」页签时激活分布柱状图）
        stRenderStuLevelBtns();
        stRenderStuTable();
    }

    // 主模块钩子：学科学情-【学生学情】页签激活时补渲染分布柱状图（切页签 / 切回学科学情视图时调用）
    window.StudentBridge = {
        onStudentsTabVisible() {
            stRenderStuDist();
            stuDistChart?.resize();
        },
        // 主模块钩子：掌握档位变更（confirmMastery 确认）→ 学生追踪-知识点分析全校共用口径重算（图表在视图隐藏时自跳过，切回补渲）
        onMasteryChanged() {
            stKpRenderAll();
        },
        // 主模块钩子：周期概览「需关注学生」卡点击 → 学生学情「需关注」筛选
        gotoWatchStudents() {
            stStuState.level = 'watch';
            stStuState.page = 1;
            stStuState.search = '';
            const si = st$('stuSearchInput');
            if (si) si.value = '';
            stRenderStuLevelBtns();
            stRenderStuDist();
            stRenderStuTable();
            stToast('已筛选「需关注」学生 ' + WATCH_FOCUS_ID_SET.size + ' 人（断崖下跌 / 持续低位）');
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', stInit);
    } else {
        stInit();
    }
})();

/* ================= PRD 查看器（内嵌需求文档 + 模块编号徽章联动定位） ================= */
// 与《学科学情与学生追踪知识点分析-PRD.md》同源；章节正文 body 唯一格式为 Markdown（页内渲染 / 编辑 / 导出导入同源）。
// 页面各模块标题旁的编号徽章（XK-nn / ST-nn）点击后自动展开抽屉并定位、高亮对应章节。

(function () {
    'use strict';

    const PRD_GROUPS = [
        { key: 'XK', name: '一、学科学情' },
        { key: 'ST', name: '二、学生追踪-知识点分析' }
    ];

    // 导出 Markdown 文档的标题与文件名前缀：首行 = PRD_APP_NAME + 产品需求文档（PRD），文件 <PRD_EXPORT_NAME>-yyyyMMdd-HHmm.md
    const PRD_APP_NAME = '学科学情与学生追踪-知识点分析';
    const PRD_EXPORT_NAME = '学科学情与学生追踪知识点分析-PRD';

    // 章节 body 一律为 Markdown 原文（逐行字符串数组 join('\n')），不要写成 HTML 模板字符串
    const PRD_SECTIONS = [
        {
            id: 'XK-01', group: 'XK', title: '全局导航与视图框架',
            body: [
                '- **范围**：学情分析新增「学科学情」，学生追踪新增「知识点分析」；按选定周期的作业与考试数据做知识点分析并输出教学建议（班级、个人两条口径）。',
                '- **互斥显示**：两侧视图同一时刻只显示一侧；切回页签须重绘该页图表，否则因容器此前不可见而空白。',
                '- **前置条件**：作业与考试数据须打通，未打通时周期汇总、顽固判定与前序归因均不成立。',
                '- **一期边界**：校级报告、班级报告仅占位入口，不实现。'
            ].join('\n')
        },
        {
            id: 'XK-02', group: 'XK', title: '顶部筛选栏',
            body: [
                '筛选条件对三个主页签全局生效。',
                '',
                '| 项 | 规则 |',
                '| --- | --- |',
                '| 学年 | 默认当前学年（演示 2025-2026）；下拉只列学年（含 2024-2025、2023-2024），不展示各学年所带年级班级；切换后按所选学年回查该班学生群体的作业与考试数据，年级班级选中保持不变，全量重算 |',
                '| 班级 | 默认当前学年任教班级（演示高二 1 班）；列表随所选年级的任教权限生成；选「全部班级」时隐藏「班级平均得分率」卡（无单一班级可算均值） |',
                '| 学科 | 范围为教务权限内学科，恒 ≥1 个：单学科固定不可切，多学科按列表切换，默认选中第一个；演示按双学科（数学、语文）配置，语文无知识体系 → 切语文学科进入 L2-a 缺省页（XK-13），切回数学恢复原页签与图表 |',
                '| 时间 | 学年 / 月（默认）/ 周 / 自定义四档，档位切换对应日期控件显隐；月、周、自定义可跨学年选择（范围取教务权限数据并集）；档位与日期控件收在「学情来源与统计范围」弹窗顶部的时间条内，筛选栏只回显「时间范围 · 已选 N 份」胶囊，不再直放时间控件 |',
                '| 环比 | 学年、月、周档取上一周期；自定义档取起始日期前等长窗口（起始减 len 天 ~ 起始前 1 天）；窗口内无任务 → 全链路隐藏环比（KPI 徽章、摘要徽章、结论文案） |',
                '| 学情来源 | 筛选栏胶囊点开弹窗（XK-12.3）：顶部设统计时间范围、下方勾选作业 / 考试，一次设定；选择即时生效，取消不回滚 |',
                '| 掌握程度 | 「设置掌握程度」打开弹窗（XK-12.1）；档位全校共用并同步学生追踪；学科组长及以上可写，学科教师 / 班主任为只读查看（悬停提示联系学科组长） |',
                '',
                '> 已知限制：学科切换不重算演示数据。'
            ].join('\n')
        },
        {
            id: 'XK-03', group: 'XK', title: '主页签',
            body: [
                '- 三个主页签：学情汇总（默认）/ 知识点分析 / 学生学情，同一时刻只显示一个面板。',
                '- 维度子导航：「知识点分析」激活时页签后展开维度 chip，维度项由学科配置决定；单维度学科不显示，超宽横向滚动，切换筛选后计数同步刷新。',
                '- 切页签后补渲染面板内图表（隐藏期间不渲染）；页签只控制显示，不改变数据口径。'
            ].join('\n')
        },
        {
            id: 'XK-04', group: 'XK', title: '周期学情概览',
            body: [
                '位置：学情汇总页签。统计区间 = 近一月，展示纳入任务数（作业/考试分列）与对比基准（上一周期）。维度口径与维度切换解耦：达标率与顽固薄弱统计全部维度末级（叶子）节点并集，不随维度切换。',
                '',
                '| 卡 | 口径 |',
                '| --- | --- |',
                '| 平均得分率 | 各次任务班级得分率的算术平均（按任务次数，不按分值加权）；环比见 XK-02 |',
                '| 稳定度 | 100 − 各次得分率的总体标准差，越高越稳 |',
                '| 知识点达标率 | 全维度末级节点中掌握度达标的节点数 ÷ 末级节点总数；阈值随掌握档位联动；徽章为较上一周期的百分点差；点击下钻明细模块 |',
                '| 顽固薄弱知识点 | 全维度末级节点中同一节点 ≥3 次不同任务失分率 ≥40%；徽章「±N 个 · 已改善 N · 新增 N」（净变化 = 新增 − 改善）；点击下钻热力演进 |',
                '| 提交率 | 实交人次 ÷ 应交人次（不设迟交单列，迟交计入已交） |',
                '| 需关注学生 | 需关注 = 断崖下跌 ∪ 持续低位（与 XK-10 同一套判定）；副行分类计数；悬停出名单弹层，点击下钻学生学情筛选 |',
                '',
                '**周期结论**：由声明式规则表驱动，每条规则定义「出现条件 / 语义色 / 文案模板」，数字按当次统计实时计算。',
                '',
                '| 规则 | 出现条件 | 语义色 | 文案要点 |',
                '| --- | --- | --- | --- |',
                '| 趋势 | 必出 | 恒蓝 | 平均得分率、环比变化、首末变化（升绿降红）+ 趋势档位：升 ≥3 个百分点显著回升 / 升 1~3 缓慢回升 / 相差 1 个点内基本持平 / 降 1~3 缓慢下滑 / 降 ≥3 明显下滑 |',
                '| 稳定度 | 必出 | 标准差 ≥5 红 / 3~5 琥珀 / <3 绿 | 稳定度、标准差、最高最低与极差；后缀分档 波动偏大 / 波动中等 / 表现稳定 |',
                '| 年级对比 | 必出 | 胜率 ≥60% 绿 / <40% 红 / 其余琥珀 | N 次任务中 X 次高于年级均值；落后清单逐条列「任务名（班级% vs 年级%）」；考试另行统计领先场次 |',
                '| 顽固薄弱 | 全维度末级顽固非空 | 恒红 | 命中数 + 名单（含能力维度）+ 判定口径；定性「结构性问题，建议专项复习而非重复讲题」 |',
                '| 行动建议 | 全维度末级顽固非空 | 恒琥珀 | 针对平均失分率最高的一项优先安排专项课时；验证目标失分率降至 40% 以下 |',
                '',
                '- **得分趋势图**：本班得分率（蓝实线，考试三角、作业圆点）与年级得分率（灰虚线）双折线 + 基准线；**任务清单**：列头可排序，合计行「首要薄弱点」取全部维度末级节点中平均失分率最高的一项。',
                '- **查看明细分流**：作业 → 作业讲评页，考试 → 试卷讲评页，携带该行任务标识落地到具体任务；跳转前按角色判定讲评页菜单权限，无权限不跳转并提示「暂无查看权限」（约 2.2 秒消失，入口仍可见）；原型阶段点击仅提示「打开作业详情」，真实跳转与权限判定待讲评模块接入。'
            ].join('\n')
        },
        {
            id: 'XK-05', group: 'XK', title: '维度切换与摘要卡',
            body: [
                '- **维度切换**：chip 组内嵌主页签栏（「知识点分析」页签后展开），切换整页维度（标题、卡片、目录、树、表格、图谱、诊断联动）；两维度功能一致；单维度学科不渲染，≥3 维横向滚动。',
                '',
                '| 卡 | 口径与交互 |',
                '| --- | --- |',
                '| 卡1 周期已检测知识点 / 考核项数量 | 知识点：有检测证据（本期任务或历史考试）的节点数，不随「查看全部知识点」开关变化；能力：非根节点总数；无点击交互 |',
                '| 卡2 未掌握数量 | 掌握度低于未掌握阈值（默认 60%）的节点数，随档位联动；无点击交互 |',
                '| 卡3 共性错题数 | 一期隐藏（页面结构保留），二期恢复；清单仅保留历史错题数据，本版不提供题目生成或组卷 |',
                '| 卡4 班级平均得分率 | 周期平均得分率 + 环比徽章；仅选中具体班级时显示 |',
                '| 卡5 年级平均得分率 | 纳入任务的年级得分率均值；徽章为年级环比上一周期 |',
                '| 卡6 顽固薄弱项 | 顽固薄弱项数量，徽章「≥3次失分率≥40%」；点击切换热力演进视图并脉冲高亮顽固行 |'
            ].join('\n')
        },
        {
            id: 'XK-06', group: 'XK', title: '知识点分析明细',
            body: [
                '- **标题联动**：模块标题随维度显示「知识点分析明细」或「能力分析明细」，主页签名恒为「知识点分析」。',
                '- **统一目录**：一级节点多选开关 + 「已开/总数」计数 + 覆盖徽章「已考 x/y」（子树有检测证据节点数 ÷ 子树节点总数）；关闭项灰显加删除线，再次点击恢复，只影响展示层；零覆盖一级模块默认隐藏，勾选「查看全部知识点」后显示（琥珀提醒，得分率位改「未检测」）；目录色点 = 该模块掌握度档位色，无证据恒灰，不按模块类型取色。',
                '- **查看全部知识点**：默认不勾选，仅知识点维度渲染；勾选后目录、树状图、表格、关联图谱显示全部 111 个节点；统计口径（摘要卡、KPI、诊断计数、教学建议）不随开关变化，属统计红线；知识点与能力两个维度的开关状态分别记忆。',
                '- **树状图（默认）**：节点按掌握度档位着色；暂无证据与未学恒灰（勾选后仍灰，悬停提示证据状态）；有历史得分的按历史得分率着色；底部图例随掌握档位实时生成。',
                '- **表格**：层级页签「全部/一级/二级/三级」；检测状态四态（本期已检测绿 / 仅有历史证据青 / 本期未检测灰 / 未学灰）；无本期证据的行数值显示「—」，未知不算未掌握。',
                '- **关联图谱**：深度一级 / 二级 / 三级（默认）；关系开关 3 项（前置·后续、易混淆、树状结构，仅文字加选中态）；另有标签策略、仅看关联、力导向 / 放射布局。画布只渲染知识点节点及其间边，能力、题型、方法、易错点四类关联对象只在节点详情面板的关联清单出现（类型标签 + 引用计数），不占节点也不连边；节点填充色 = 掌握度档位色，断层节点改红色描边 + 红晕 + 加粗线宽（填充仍表掌握度）；断层红边只画有证据的前置关系；统计条只显示「知识点 N · 关联边 E」；点击节点打开详情面板（关联清单 / 断层警示 / 前后序关联诊断）。',
                '- **导出**：按当前维度、层级、目录过滤后的同口径数据导出 CSV（带 BOM），含检测状态列。',
                '',
                '**节点得分率**：按时间衰减加权计算——单场得分率 = 100 − 该场失分率，权重 = 0.5 的（距周期结束天数 ÷ 半衰期 30 天）次幂，加权求和后除以权重之和。完整步骤、数值示例、边界与口径边界见 XK-06A；热力演进累计列用未加权的有效场次算术平均，两者不可互相引用。',
                '',
                '**热力演进**',
                '',
                '| 项 | 规则 |',
                '| --- | --- |',
                '| 单元格 | 失分率五档着色：<20% 轻度 / 20~40% 中度 / 40~60% 较重 / 60~75% 严重 / ≥75% 极重；未考查场次显示「·」，不参与均值也不计入顽固，与「失分为 0」严格区分 |',
                '| 累计列 | 有效场次失分率的算术平均，不做时间衰减；得分率 = 100 − 失分率 |',
                '| 顽固判定 | 失分率 ≥40% 的场次达到 3 次及以上（与摘要卡同名口径） |',
                '| 行尾判定章 | 顽固 / 反复 / 偶发 / 恶化 / 回升 / 稳定六种；趋势按矩阵前后两半段均值差是否超过 5 个百分点判定，各带判定依据提示 |',
                '',
                '**底部结论生成规则**（按当次数据实时生成，无固定文案）',
                '',
                '| 取数项 | 规则 |',
                '| --- | --- |',
                '| 统计行数 | 当前维度可展示的考核项行数；目录关闭的模块不计入，「共 N 个」同步变小 |',
                '| 顽固数 | 可展示行中命中顽固的行数，与行首「顽固」标记同源 |',
                '| 顽固名单 | 命中行按表格顺序（累计失分率降序）顿号连接，不按命中场次排序 |',
                '| 最突出短板 | 固定取表格首行（累计失分率最高）的名称与累计值，可以不是顽固项 |',
                '| 累计失分率 | 有效场次失分率的算术平均取整，不做时间衰减；与周期得分率加权口径不同，两者不可互相引用 |',
                '',
                '| 分支 | 触发条件 | 文案 |',
                '| --- | --- | --- |',
                '| 无可展示行 | 目录一级模块全部关闭 | 当前目录下没有可展示的知识点（或能力），请恢复左侧已关闭的模块后再查看 |',
                '| 有顽固项 | 顽固数 > 0 | 共 N 个知识点，其中 X 个命中顽固薄弱：逐项点名；累计最高项失分率 Y% 为当前最突出短板，建议安排专项课时集中突破 |',
                '| 无顽固项 | 顽固数 = 0 且行数 > 0 | 共 N 个知识点，暂无顽固薄弱项（≥3 次失分率 ≥40%），整体失分以偶发性为主，保持当前教学节奏 |',
                '',
                '> 取数顺序：先按目录过滤行，再算累计失分率与顽固标记，最后按累计失分率降序排列，因此首行一定是当前可展示行中累计失分率最高的一项。'
            ].join('\n')
        },
        {
            id: 'XK-06A', group: 'XK', title: '周期得分率与时间衰减模型',
            body: [
                '**要解决的问题**：同一知识点在一个周期内常被多次考查。直接取算术平均，两个月前的一次低分会与上周的一次高分同权，已经补上的漏洞被旧证据继续拖着，教师看到的掌握状态滞后于现实。时间衰减模型以「周期结束日」为锚点，越靠近锚点的证据权重越高。',
                '',
                '**计算步骤**',
                '',
                '1. 单场得分率 = 该场该知识点得分 ÷ 该场该知识点分值 × 100，等价于 100 − 该场失分率；场次之间不再按分值加权（场次内部已按分值算比例）；',
                '2. 距锚点天数 Δ = 周期结束日 − 该场任务日期（自然日，当日为 0 天）；',
                '3. 单场权重 w = 0.5 的（Δ ÷ H）次幂，H 为半衰期，默认 30 天，属后台常量、前端不开放配置；',
                '4. 周期得分率 = Σ（w × 单场得分率）÷ Σw，四舍五入保留 1 位小数；',
                '5. 加权结果按掌握档位映射为掌握状态（3 档 80 / 60，4 档 90 / 80 / 60），达标线取最高档下限。',
                '',
                '**权重随距锚点时间的衰减（H = 30 天）**',
                '',
                '| 距周期结束 | 权重 w | 相对影响 |',
                '| --- | --- | --- |',
                '| 0 天（当天） | 1.000 | 与基准同权 |',
                '| 7 天 | 0.851 | 八成半 |',
                '| 15 天 | 0.707 | 七成 |',
                '| 30 天 | 0.500 | 半权（半衰期定义点） |',
                '| 45 天 | 0.354 | 约三分之一 |',
                '| 60 天 | 0.250 | 四分之一 |',
                '',
                '> 权重只用于同一周期内的相对比较：全部 w 同乘一个常数，结果不变，因此只看各场占比、不必关心绝对量级。锚点取周期结束日而非「今天」，是为了同一周期在任何一天打开都得到同一个得分率。',
                '',
                '**数值示例**（周期结束日 10-31，H = 30 天）',
                '',
                '| 任务 | 日期 | Δ | 权重 w | 单场得分率 | w × 得分率 |',
                '| --- | --- | --- | --- | --- | --- |',
                '| A | 10-03 | 28 天 | 0.524 | 60.0% | 31.4 |',
                '| B | 10-14 | 17 天 | 0.675 | 72.0% | 48.6 |',
                '| C | 10-28 | 3 天 | 0.933 | 88.0% | 82.1 |',
                '| 合计 | — | — | Σw = 2.132 | 算术均值 73.3% | Σ = 162.1 |',
                '',
                '- 周期得分率 = 162.1 ÷ 2.132 = **76.1%**，比算术均值高 2.8 个百分点：最近两场权重合计 1.608（占 75%），最远一场只占 25%。',
                '- 敏感性：把 A 改成 100%、C 改成 50% 后，算术均值 73.3% → 74.0%（几乎不动），加权结果 76.1% → 69.3%（下移 6.8 个百分点）——加权模型对最近一次的变化更敏感，这正是「学生最近补上了没有」要看的东西。',
                '',
                '**边界与豁免**',
                '',
                '| 情形 | 处理 |',
                '| --- | --- |',
                '| 周期内仅 1 场考查 | 直接取该场得分率（权重归一后为 1，与算术均值一致） |',
                '| 0 场考查 | 标「未覆盖」，不计入达标率分母，不显示 0 与档位色（未知 ≠ 未掌握） |',
                '| 某场未考查该点 | 该场不参与，也不按 0 分计入（按 0 算会系统性压低得分率） |',
                '| 分值缺失 / 满分为 0 | 剔除该场并计入数据异常，不改变分母 |',
                '| 换周期或改时间档 | 全部场次按新锚点重算权重，不做增量复用 |',
                '| 同一任务多次批改改分 | 取最终生效成绩，一场任务只算一次 |',
                '| 半衰期调整 | 全量重算并留痕，历史报表不回溯改写 |',
                '',
                '**口径边界（不可混用）**',
                '',
                '| 位置 | 用的口径 |',
                '| --- | --- |',
                '| 树状图、表格、关联图谱的节点得分率与掌握状态 | 本模型加权值 |',
                '| 摘要卡班级 / 年级平均得分率、周期 KPI 平均得分率、稳定度 | 按任务次数的算术平均（不按分值、不加权） |',
                '| 热力演进单元格 | 单场失分率原值，不做聚合 |',
                '| 热力演进累计列、顽固判定、最突出短板、结论里的累计失分率 | 有效场次的算术平均，与加权口径互不引用 |',
                '| 达标率 | 分子为加权得分率达标的末级节点数，分母为有 ≥1 次考查的末级节点数 |',
                '| 学生追踪个人树 | 个人加权得分率同公式，班级基准仍取班级加权值，差值 = 个人 − 班级 |',
                '',
                '**口径选择理由与调参**',
                '',
                '- 用指数衰减而非线性衰减：线性衰减在半衰期处直接截断，会让「刚过窗口」的一次低分突然消失，产生断崖；指数衰减连续、单调、可累加。',
                '- 场次之间等权（只按时间衰减），不按分值或题量加权：掌握状态关心「这个点会不会」，不关心「这个点占多少分」，否则一道 12 分大题会主导判断。',
                '- 保留未加权均值：两个口径并列展示才能看出「近期是否偏离长期水平」，只给加权值会把波动藏起来。',
                '- 半衰期取 30 天：与月档统计周期对齐，一个月前的证据恰好半权；调大则旧证据久拖不散，调小则单次考试波动主导结论，调整须走后台常量并留痕。',
                '',
                '> 原型现状：树节点掌握度与得分率均为内置静态演示值，页面未实现本模型；以上为真实作业与考试数据接入后的计算规范，须由数据侧聚合产出，前端只负责展示与档位映射。'
            ].join('\n')
        },
        {
            id: 'XK-07', group: 'XK', title: '知识图谱诊断',
            body: [
                '六个诊断标签，计数徽章一屏总览；计数为 0 时必须区分「已检查无问题」与「无法诊断」两种空态，不得只显示 0。全部标签共用同一套证据等级、关系可见性与可诊断性前置判定（细则见 XK-07A ~ XK-07D）。',
                '',
                '| 标签 | 判定口径 | 处置要点 |',
                '| --- | --- | --- |',
                '| 顽固薄弱 | 同一考核项 ≥3 次不同任务失分率 ≥40%；强度三档：≥5 次结构性 / 3~4 次疑似 / 1~2 次观察（观察项进折叠区，不进主清单）；病型五类：概念型 / 基础型 / 方法型 / 习惯型 / 孤立型 | 病型定动作：概念型成对辨析、基础型前序补偿、方法型方法专题、习惯型审题规范、孤立型补标注；建议专项课而非重复讲题 |',
                '| 前序断层 | 目标掌握度低于未掌握阈值且前置链存在 <70% 节点；回溯三道闸：层数 ≤5、遇一级模块边界停止、环路节点跳过；近 5 层无 <70% 节点改判「本点自身问题」；无证据前置不参与根因比较；前置关系未建为第四态、不归因，待题库标注后自动升级 | 计数「有根因数 / 断层总数」（关系未建不计入分子）；直接讲薄弱点无效，须先补前序；点击进关联诊断抽屉 |',
                '| 易混淆 | 数据源统一为题库易混淆关系，先做无序对归一（成对只算一次）；三级分级：双弱（两侧均低于阈值）= 概念未建立 / 单弱（一侧低一侧达标）= 方向性混淆 / 双强但同题失分 = 情境性混淆；相邻对同时命中输出混淆链（链长 ≤3）；命中人次 ≥5 才出卡 | 双弱讲新知、单弱课中辨析、双强换情境复测 |',
                '| 题型易错点 | 阅卷标注 + 客观题规则匹配命中清单；点级（知识点 × 易错点）= 讲评落点；同一易错点在 ≥3 个知识点命中 = 跨点习惯性错误，升级为审题 / 书写规范项 | 可直接写进讲评稿；跨点项不再逐点重复 |',
                '| 前后序证据 | 周期内多任务汇总，四态映射证据等级：本期已考查 A/B（按场次）、仅有历史证据 C、暂无证据与未学 D；D 级禁止出结论（未知 ≠ 未掌握） | 点节点标签打开关联诊断抽屉 |',
                '| 已达标 | 达标线取最高档下限（3 档 80% / 4 档 90%，随档位联动）；有效场次 ≥2 场方可判达标，仅 1 场标「待确认」；进步判定为首末有效场次提升 ≥8 个百分点 | 转「减量维持」，每周 1 次滚动复测 |',
                '',
                '- **配色**：知识点名与关联标签一律按掌握度取色（顽固名单、易混淆「关联：X」、易错点「关联：X」，无证据恒灰），不再按模块色或关系类型取色；断层链节点保留根因红 / 薄弱黄 / 达标绿；「顽固 · N 次」「优先专项」等计数与动作徽章仍按语义色。',
                '- **关系覆盖度**（内部指标）= 有作答证据且已建前置关系的知识点 ÷ 有作答证据知识点，能力维度不适用；仅用于断层卡第四态与教学建议降级判定。'
            ].join('\n')
        },
        {
            id: 'XK-07A', group: 'XK', title: '诊断关系体系与画布边界',
            body: [
                '题库知识关系共 21 类；诊断规则不按关系名逐条写，而按拓扑角色分组，角色决定能否做路径回溯还是只能做聚合统计。',
                '',
                '| 关系类型 | 边数 | 拓扑角色 | 画布 | 诊断用途 |',
                '| --- | --- | --- | --- | --- |',
                '| 前置 / 后续知识 | 915 / 915 | 链条（深链，入度约 1） | 实线箭头 | 断层回溯、补链顺序、达标后衔接 |',
                '| 易混淆知识点 | 149 | 二元（无序对） | 虚线 | 成对辨析、混淆链 |',
                '| 知识点考查能力 / 依赖能力 | 919 / 902 | 汇聚（多对一，4 个能力） | 不上图 | 能力短板（可测）/ 能力根因（待补测） |',
                '| 知识点解题方法 | 401 | 枢纽（多对多） | 不上图 | 方法聚合诊断 |',
                '| 常见易错知识点 | 26 | 标签（多对一） | 不上图 | 讲评落点、跨点习惯错误 |',
                '| 前置 / 后续 / 易混淆题点 | 92 / 92 / 36 | 链条 + 二元 | 实线箭头 + 虚线 | 考法顺序与考法辨析 |',
                '| 题点的方法 / 易错 / 能力类 | 59 / 69 / 134 / 111 | 枢纽 / 标签 / 汇聚 | 不上图 | 考法画像（启用范围待确认） |',
                '| 微题点的方法 / 易错 / 能力类 | 23 / 18 / 40 / 36 | 枢纽 / 标签 / 汇聚 | 不上图 | 变式覆盖与变式方法（只做聚合不做链路） |',
                '| 前置 / 后续 / 易混淆微题点 | 21 / 21 / 11 | 链条 + 二元 | 不上图 | 高中未开通则禁用，不得出断层或易混诊断 |',
                '',
                '**画布-诊断一致性（红线）**：只有画线类关系（知识点与题点的前后置、易混淆）可生成路径型结论（断层链、混淆对、考法链）；方法 / 能力 / 易错点属仅详情类，只能出现在清单、聚合卡与教学建议；每条结论须列出所引用关系（类型 + 对象 + 关系度）并可点回图谱；宣称画布可见却引用非画线关系即实现缺陷。',
                '',
                '**诊断单元**：一期固定「知识点」单元，6 个标签结构不变，方法与能力洞察由病型分组承载；二期扩展知识点 / 题点 / 微题点 / 解题方法 / 关键能力 5 个单元，切换后按矩阵裁剪标签，不适用项显示「该单元不提供此类诊断」并禁用，不得显示 0 与「本班无…」。',
                '',
                '| 诊断类型 | 知识点 | 题点 | 微题点 | 解题方法 | 关键能力 |',
                '| --- | --- | --- | --- | --- | --- |',
                '| 顽固 / 薄弱 | 是 | 是 | 是 | 是（方法薄弱） | 是（能力短板） |',
                '| 前序断层 | 是 | 是（题点前置） | 否 | 否 | 否 |',
                '| 易混淆 | 是 | 是（题点混淆） | 否 | 否 | 否 |',
                '| 方法聚合 | 是 | 视启用范围 | 是 | 自身 | 是 |',
                '| 能力聚合 | 是 | 视启用范围 | 是 | 是 | 自身 |',
                '| 易错点聚合 | 是 | 视启用范围 | 是 | 否 | 否 |',
                '| 考法覆盖 | 是 | 自身 | 自身 | 是 | 是 |',
                '| 已达标 | 是 | 是 | 是 | 是 | 是 |'
            ].join('\n')
        },
        {
            id: 'XK-07B', group: 'XK', title: '诊断规则集（8 条）',
            body: [
                '**规则 0 · 可诊断性前置**：任何规则执行前先判该条目是否可诊断（原因码与文案见 XK-07D），不可诊断项不进入判定、排序与计数。',
                '',
                '**规则 1 · 证据等级（全部诊断共用，先行过滤）**',
                '',
                '| 等级 | 定义 | 允许的结论 |',
                '| --- | --- | --- |',
                '| A | 周期内 ≥3 场直接考查 | 可定性（顽固 / 断层 / 达标） |',
                '| B | 1~2 场直接考查 | 只出「疑似」，进折叠区 |',
                '| C | 仅有历史证据 | 只做趋势参考，不进主清单 |',
                '| D | 无作答证据（暂无证据 / 未学） | 禁止出结论，只能「待诊断」 |',
                '',
                '**规则 2~8 · 判定口径**',
                '',
                '| 规则 | 命中条件与算法 |',
                '| --- | --- |',
                '| 2 顽固薄弱 | 同一考核项 ≥3 次不同任务失分率 ≥40% 且证据等级 A；强度 ≥5 次结构性 / 3~4 次疑似 / 1~2 次观察；病型按 概念 → 基础 → 方法 → 习惯 → 孤立 顺序命中即止（概念：落在命中的易混淆对上且该对为双弱或单弱；基础：近端前置 ≤2 层存在 <70% 节点；方法：关联方法中至少 1 个命中方法薄弱；习惯：命中的易错点在 ≥3 个其他知识点同时命中；孤立：无任何关系标注） |',
                '| 3 前序断层 | 目标掌握度低于未掌握阈值（默认 60%）且前置链存在 <70% 节点；闸 1 最多回溯 5 层，超限标「超过 5 层未定位根因」；闸 2 跨一级模块的前置只提示不归因；闸 3 环路 visited 保护、节点只记一次；兜底：近 5 层无 <70% 节点改判「本点自身问题」；关系度为类型常量（前置 90），只用于并列排序 |',
                '| 4 易混淆 | 题库 149 对为单向存储，须先按无序对归一去重，否则命中数少一半；双弱 = 两侧均低于阈值；单弱 = 一侧低于阈值且另一侧达标；双强 = 两侧达标但同题失分；相邻对同时命中输出混淆链（链长 ≤3）；命中人次 ≥5 才出卡；关系度 95 仅排序 |',
                '| 5 易错点 | 点级 = 知识点 × 易错点，作讲评落点；同一易错点在 ≥3 个知识点命中 → 跨点习惯性错误，进「审题 / 书写规范」，不再逐点重复；关系表无选择 / 填空 / 解答维度，现有题型标签为演示自造 |',
                '| 6 方法聚合 | 方法掌握 = 关联知识点得分率的算术平均（不按关系度加权）；方法薄弱 = 关联点 ≥2 且（关联点中顽固或断层占比 ≥50%，或方法掌握 <65%）；仅被 1 个知识点引用的方法不单独诊断；覆盖 ≥5 个知识点的方法建议连排 2 课时并按方法组卷 |',
                '| 7 能力二分 | 考查侧：关联知识点 ≥8 个且平均得分率 <65% → 能力短板（可测）；依赖侧：作为依赖能力关联的薄弱点占比 ≥40% 且无考查边 → 标「待补测」，禁止直接判薄弱；同一知识点-能力同时存在依赖与考查（现有 227 对）只计一次 |',
                '| 8 考法覆盖 | 考法缺口 = 关联题点中已考且 <60% 的占比 ≥40%；未验证考法 = 从未考查占比 ≥50%，不得据此判掌握或薄弱；题点与知识点无直属边（同名仅 6/146），须先补映射；一期不上线，标「待数据补齐」 |',
                '',
                '**参数总表（默认值，均可后台调整）**',
                '',
                '| 参数 | 默认 | 参数 | 默认 |',
                '| --- | --- | --- | --- |',
                '| 顽固次数 / 失分率阈值 | 3 次 / 40% | 结构性强度 | ≥5 次 |',
                '| 断层目标 / 前置阈值 | 未掌握阈值 60% / 70% | 断层回溯层数 | 5 层 |',
                '| 易混出卡门槛 | 5 人次 | 方法聚合最少点 | 2 个 |',
                '| 方法薄弱占比 / 掌握阈值 | 50% / 65% | 能力聚合最少点 / 短板阈值 | 8 个 / 65% |',
                '| 跨点习惯错误 | ≥3 个知识点 | 考法缺口 / 未验证占比 | 40% / 50% |',
                '| 达标线 | 80% / 90%（3 档 / 4 档） | 进步阈值 | 8 个百分点 |'
            ].join('\n')
        },
        {
            id: 'XK-07C', group: 'XK', title: '诊断冲突消解与结构化输出',
            body: [
                '**冲突消解（一条主因 + 其余折叠）**：同一知识点可能同时命中断层、易混、顽固、方法、能力，按顺序取第一条作主因，其余折叠为「同时命中 N 项」，避免「先补前置」与「直接讲本点」并存。',
                '',
                '| 顺序 | 主因 | 理由 |',
                '| --- | --- | --- |',
                '| 1 | 前序断层 | 前置不牢时讲本点无效 |',
                '| 2 | 易混淆（单弱） | 概念方向错时刷题无效 |',
                '| 3 | 方法型顽固 | 解法未建立时重复练同题无效 |',
                '| 4 | 顽固（概念 / 基础 / 习惯型） | 按病型给对应动作 |',
                '| 5 | 能力短板 | 跨知识点专项 |',
                '| 6 | 考法未验证 | 先补测再判断 |',
                '| 7 | 已达标 | 减量维持 |',
                '| 8 | 补标注 | 数据治理，不计入教学动作条数 |',
                '',
                '**诊断条目统一字段**：单元（一期恒为知识点）/ 类型 / 证据等级 / 病型（仅顽固项）/ 引用关系（类型 + 对象 + 关系度）/ 判定数字（场次、得分率、阈值、层深）/ 动作与优先级；字段用于排序、折叠、跳转与导出。',
                '',
                '**数据前置条件（未满足则规则降级）**：易混淆为单向存储须先归一，否则命中数少一半；关系度为类型常量（前后置与考查 90、依赖与方法与易错 85、易混淆 95），不可进评分公式；前置链存在 1 个 45 节点环（导数极值链与不等式链），须断环并 visited 保护；题点与知识点无直属边，规则 8 不得上线。',
                '',
                '**分期**：一期不改 6 标签 UI，落地规则 1~5 与冲突消解、建议优先级；二期随诊断单元切换、方法与能力独立标签、规则 8 上线。教学建议分类与底部综合建议必须同源，两处数字不一致即缺陷。'
            ].join('\n')
        },
        {
            id: 'XK-07D', group: 'XK', title: '无法诊断的判定与说明',
            body: [
                '**核心区分**：无法诊断 ≠ 无问题。前者缺证据或缺关系，后者已检查且结论正常；两者文案、计数口径与处置动作均不同。',
                '',
                '| 级别 | 含义 | 展示位置 | 页面处理 |',
                '| --- | --- | --- | --- |',
                '| 单元级 | 该学科或该分析单元不提供此类诊断（如微题点的前序断层、未开通的题点方法） | 标签 / 单元切换器 | 标签禁用 + 「该单元不提供此类诊断」，不显示 0 |',
                '| 规则级 | 整条规则所需关系类型未开通或缺失 | 模块底部 | 模块置「规则未启用」，并从覆盖率分母剔除 |',
                '| 条目级 | 个别知识点缺边、边失效、成环、无证据 | 卡片行 / 表格行 | 灰底 + 原因徽章 + 悬停说明，不显示得分率与 0 |',
                '',
                '**原因码表（条目级）**',
                '',
                '| 原因码 | 触发条件 | 页面文案 | 处置动作 |',
                '| --- | --- | --- | --- |',
                '| REL-MISSING 关系未建 | 无前置边（第四态） | 前置关系未建，暂不归因 | 题库补标注 |',
                '| REL-REMOVED 关系已撤回 | 上期有边、本期无边（快照 diff） | 关系已调整，旧结论失效，待重新诊断 | 教研确认是否误删 |',
                '| REL-CHANGED 类型变更 | 同一对对象关系类型改变 | 关系类型由 X 改为 Y，按新类型重算 | — |',
                '| REL-DANGLING 对象失效 | 对端节点被删除、合并或改名 | 关联对象已失效（改名或合并） | 数据修复 |',
                '| REL-CYCLE 存在环路 | 环检测命中（现有 1 个 45 节点环） | 存在环路，根因不唯一，仅显示环上最弱节点 | 数据侧断环 |',
                '| REL-ONEWAY 单向异常 | 易混淆只存单向，无序对归一后对端缺失 | 关系数据异常（单向），已按无序对兜底 | 数据修复 |',
                '| REL-OFF 类型未开通 | 学科关系范围配置 | 该学科未开通此关系，不提供此类诊断 | 产品确认 |',
                '| EVD-NONE / EVD-LOW | 四态为暂无证据 / 未学；仅 1~2 场直接考查 | 暂无作答证据，暂不判定 / 证据不足（N 场），仅作疑似 | 补任务或补测 |',
                '| MAP-MISSING 映射缺失 | 规则 8 无可用边 | 考法映射缺失，本规则不适用 | 补映射（一期不上线） |',
                '',
                '> 无证据（教学侧，动作是补任务）与关系异常（数据侧，动作是补标注）必须分开展示；合并成同一种灰态会让教师误判「孩子没问题」或「系统坏了」，处置也会派错人。',
                '',
                '**关系调整后的结论失效与重算**：每条结论绑定关系快照（快照号 + 周期结束日）；被撤回的边若为某结论引用，该结论标「已失效·待重算」，不自动沿用也不改判为「无问题」；新增边使原「关系未建」项自动重算——前置均达标转「无断层（已检查）」，仍有 <70% 前置则升级为断层；改类型后旧结论失效、按新类型重算，跨类型结论不拼接；对端失效先修边再诊断；周期内变更一律按期末快照计算，并在模块底部标注「周期内关系有调整，按期末版本计算」。',
                '',
                '**计数与覆盖率口径**：不可诊断项不计分子也不计分母，单独列表；模块底部固定一行「可诊断 N ÷ 应诊断 M（%）」+ 原因分组计数（如「关系未建 6 · 无证据 9 · 环 1」）；摘要卡、教学建议、导出三处数字与之一致，不一致即缺陷；全模块不可诊断时显示「本周期无法诊断」+ 原因分布 + 处置建议，不得显示「本班无此类问题」。',
                '',
                '**展示与联动**：条目级灰底 + 原因徽章，悬停给原因、处置与责任方（题库 / 教研 / 教学侧）；卡片底部只放覆盖率，点开进关联诊断抽屉看清单；导出 CSV 增加「可诊断性 / 不可诊断原因 / 关系快照号」三列；不可诊断项不显示得分率与掌握档位色、不参与排序；「关系建设引导」取关系未建与对象失效清单，「补测验证」取无证据与证据不足清单，两类不合并。',
                '',
                '**红线**：不得计入「本班无…」或「已达标」；不允许只显示「—」；关系未建、已撤回、对象失效不得视为关系正常；关系变更后旧结论不得静默沿用；无证据与关系异常不得合并为同一种空态。层级边界：本章管条目级，页面级整块无数据见 XK-13，两者不叠加。'
            ].join('\n')
        },
        {
            id: 'XK-08', group: 'XK', title: '错因结构分析',
            body: [
                '- **堆叠柱状图**：各次任务的失分归因占比（错因 × 任务）；图例可点击显隐系列；悬停某一段时高亮该错因在所有任务上的段落，并显示各次占比 + 周期均值 + 首尾环比。',
                '- **错因体系动态化**：错因种类随学科或题目扩展，配色与干预文案均有通用兜底，教学建议只取首尾差 ≥3 个百分点且上升的错因，不写死错因枚举。',
                '- **限制**：仅智批作业支持错因分析。',
                '',
                '**关键发现规则**（与维度无关，页面初始化渲染一次）',
                '',
                '| 步骤 | 规则 |',
                '| --- | --- |',
                '| 取数 | 取错因矩阵首行（最早任务）与末行（最近任务），逐错因算 占比变化 = 末次 − 首次，保留 1 位小数 |',
                '| 显著迁移 | 变化幅度 ≥3 个百分点判为显著迁移，按幅度降序逐条展示；上升（差值为正）红色、下降为绿色 |',
                '| 基本稳定 | 变化幅度 <3 个百分点归入一条蓝色汇总，注明错因结构未发生明显迁移 |',
                '| 单条结构 | 错因名 + 「首次占比 → 末次占比（变化幅度）」+ 对应干预建议；未预置文案的错因走通用模板兜底 |'
            ].join('\n')
        },
        {
            id: 'XK-09', group: 'XK', title: '教学建议',
            body: [
                '由建议规则表驱动；一期只输出建议、数据依据与诊断直达，不提供题目生成或组卷。',
                '',
                '| 建议 | 触发条件 | 动作 |',
                '| --- | --- | --- |',
                '| 专项突破 | 存在顽固薄弱 | 安排专项课时，查看顽固薄弱 |',
                '| 前序补偿 | 存在前序断层 | 先补前序再讲当前，查看断层归因 |',
                '| 方法专题 | 存在方法型顽固（同一方法关联 ≥2 个知识点且 ≥50% 关联点薄弱） | 连排方法专题课、按方法组卷 |',
                '| 成对辨析 | 存在易混淆对（单弱优先，其次双弱） | 课中辨析与学生互讲；双强只做换情境复测 |',
                '| 能力专项 | 某能力关联知识点 ≥8 个且平均得分率 <65% | 跨知识点能力专项训练 |',
                '| 补测验证 | 能力仅有依赖边无考查边，或知识点关联题点未考占比 ≥50% | 安排覆盖该能力或考法的测评，不得直接判薄弱 |',
                '| 限时短训 | 存在显著错因迁移，或同一易错点 ≥3 个知识点命中 | 短时针对性讲练；习惯性错误走审题 / 书写规范 |',
                '| 减量维持 | 存在已达标项 | 滚动复测、让出课时 |',
                '| 关系建设引导 | 薄弱项缺前置关系，或顽固项无任何关系标注 | 查看断层归因，按薄弱热度排标注顺序 |',
                '',
                '- **动作优先级**：前序补偿 → 专项突破 → 方法专题 → 成对辨析 → 能力专项 → 补测验证 → 限时短训 → 减量维持 → 关系建设引导（补标注）；同一知识点多标签命中只取优先级最高的一条作主因，其余折叠为「同时命中 N 项」。',
                '- 底部综合建议只含教学路径、综合建议、关注范围与使用场景，不含题量、题型配比、试卷方案或题目内容；「导出建议单」为演示提示。'
            ].join('\n')
        },
        {
            id: 'XK-10', group: 'XK', title: '学生学情',
            body: [
                '- **左侧分布**：学情分布柱状图（五档 优秀 / 良好 / 合格 / 待合格 / 未学习，柱顶标人数，y 轴按人数自适应）+ 等级筛选按钮组（全部、需关注 + 五档，各带计数徽章）；「需关注」与周期概览 KPI 同源；姓名后显示状态徽章。',
                '- **右侧列表**：姓名搜索 + 七列表格（星标 / 姓名 / 未提交次数 / 提交率 / 平均得分率 / 等级徽章 / 操作），10 条 / 页；标题旁问号悬停展开「状态判定说明（V2.0）」浮层。',
                '- **等级口径**：≥85 优秀、≥70 良好、≥60 合格、否则待合格、全周期未提交 = 未学习；平均得分率、等级与状态判定同源；提交情况按学号稳定生成的演示数据。',
                '- **跳转**：操作列「学情分析」→ 切学生追踪视图 + 知识点分析页签并选中该生。',
                '- **徽章**：断崖下跌（红）/ 持续低位（橙）/ 低位回升（绿）/ 明显进步（绿）/ 待观察（灰）/ 平稳（不显示）；悬停显示判定口径与该生判定数字；需关注 = 断崖下跌 ∪ 持续低位，正向关注 = 低位回升 ∪ 明显进步（不计入需关注），待观察不计入任何名单。',
                '',
                '**状态判定 V2.0**（真实数据接入后的计算口径；原型阶段为按学号稳定生成的模拟数据，覆盖六种分支，不实时计算）',
                '',
                '| 项 | 口径 |',
                '| --- | --- |',
                '| 有效考试 | 正常参加 + 班级有效人数 ≥10 + 非补考 / 免考 / 作弊 |',
                '| 周期 | 连续 4 次有效考试（或自然分段），前后半按时间对半分（前半取总场次一半向下取整）；n ≥4 且前后半各 ≥2，否则「待观察 / 数据不足」；周期不重叠 |',
                '| 核心指标 | 个人得分率 = 个人得分 ÷ 满分；班级均值用留一法（剔除本人；有效人数 <10 时取年级同学科均值，仍不足标「均值不稳定」）；残差 = 个人得分率 − 留一法班级均值；趋势差 = 后半残差均值 − 前半残差均值 |',
                '| 个人波动带 | 取前 5~8 场（至少 3 场）历史残差中位数为中心，以残差绝对偏差中位数换算标准差，中心 ∓1.5 倍标准差为下沿与上沿；历史不足 3 场用同次班级残差标准差并标「近似」，仍不可用判「待观察」 |',
                '| 低位条件 | 平均得分率 <60% 且平均残差 < −0.5 倍班级残差标准差；中 / 高位为平均残差 ≥ −0.5 倍标准差或年级分位 ≥40% |',
                '| 突破场次 | 低于下沿的场次数、高于上沿的场次数；显著变化阈值默认 8 个百分点，建议按学科年级校准（取默认值与班级趋势差标准差 0.8 倍中的较大者） |',
                '',
                '| 优先级 | 状态 | 判定条件 | 行动 |',
                '| --- | --- | --- | --- |',
                '| 1 | 待观察 / 数据不足 | 有效场次 <4，或前后半 <2，或波动带不可用且无替代 | 不判趋势，补充数据 |',
                '| 2 | 断崖下跌 | 趋势差 ≤ −阈值 且低于下沿 ≥2 场 | 优先跟进，需关注 |',
                '| 3 | 持续低位 | 连续 ≥2 周期：平均得分率 <60% 且平均残差 < −0.5 倍标准差且趋势无回升 | 需关注 |',
                '| 4 | 低位回升 | 原处低位且趋势差 ≥ +阈值 且高于上沿 ≥2 场 | 正向关注，不计入需关注 |',
                '| 5 | 明显进步 | 中 / 高位且趋势差 ≥ +阈值 且高于上沿 ≥2 场 | 正向关注，不计入需关注 |',
                '| 6 | 平稳 | 以上均不满足且有效场次足够 | 常规观察 |',
                '',
                '> 需关注卡片与学生学情徽章调用同一套计算，徽章悬停展示证据数字；参数需回溯校准、分学科配置、人工复核并定期审计。'
            ].join('\n')
        },
        {
            id: 'XK-11', group: 'XK', title: '作业考试明细详情页',
            body: [
                '- 打开方式：表格视图行内「查看详情」→ 全屏浮层，「返回」关闭。',
                '- **左侧**：考核项列表（一级条目 + 班级得分率，可切换选中）；**右侧**：类型过滤（全部 / 作业 / 考试）、「趋势图 / 表格」切换、表格（名称 / 题号 / 班级得分率 / 年级得分率 / 操作）+ CSV 导出（不含操作列）。',
                '- **行级查看详情**：考试 → 试卷讲评页，作业 → 作业讲评页；原型阶段仅提示，真实接入后由讲评模块按任务名路由承接。',
                '',
                '> 已知限制：二 / 三级行查看详情上卷至所属一级节点（详情侧栏仅支持一级导航）。'
            ].join('\n')
        },
        {
            id: 'XK-12', group: 'XK', title: '弹窗与抽屉',
            body: [
                '- **设置掌握程度**：3 档 / 4 档单选；按角色控制写权限，展示最后保存留痕并模拟并发冲突；确认后班级与学生追踪全量联动。学科组长及以上可改档位（底部取消 / 确认）；学科教师与班主任为只读查看，档位单选与得分率区间置禁用态（灰底虚线 + 禁止光标），不渲染取消 / 确认按钮，仅右上角 × 关闭；弹窗内不设权限说明条。',
                '- **设置权重（已移除）**：得分率统一由后台默认时间衰减模型聚合。',
                '- **学情来源与统计范围**：弹窗顶部为统计时间条（学年 / 月 / 周 / 自定义档位 + 对应日期控件），下方作业 / 考试双栏勾选、栏头全选与计数；底栏左侧回显「当前范围 · 已选 N 份」，与筛选栏胶囊同源；学生追踪同款弹窗交互。',
                '- **关联诊断与分组教学建议**：保留证据四态、前后序关系、学生分组、教学动作、关注范围、建议对象与判定依据；支持复制建议和导出 CSV。',
                '- **题库知识图谱组件**：一期保留自研图谱组件，题库组件仅作全屏查看入口。',
                '- **一期边界**：不包含题目生成、题量配置、题型配比、组卷、保存题库或布置新练习；效果验证只给教学建议，不生成复测题。',
                '- **治理红线**：无作答证据 = 未知 ≠ 未掌握；前后序关系须经教研确认，未确认前不得作为失分归因事实。'
            ].join('\n')
        },
        {
            id: 'XK-13', group: 'XK', title: '缺省页与空态方案',
            body: [
                '缺省页按原因分级：同一句「暂无数据」背后可能是没布置、没回传、没勾选、没标注、没接入，处置与责任方完全不同。',
                '',
                '| 级别 | 判定条件 | 责任方 | 主文案 |',
                '| --- | --- | --- | --- |',
                '| L0 周期全空 | 周期内作业 + 考试任务数 = 0 | 教学侧 | 本周期没有作业与考试任务 |',
                '| L0-b 已选 0 份 | 任务池非空，但学情来源被全部取消勾选 | 用户操作 | 已取消全部任务勾选，当前无可分析数据 |',
                '| L1 学科无任务 | 多学科权限下任务池非空，但当前学科任务数 = 0 | 教学侧 | 该学科本周期没布置任务；其他学科有 N 份 |',
                '| L2-a 体系未接入 | 该学科无知识体系（题库映射缺失） | 产品侧 | 该学科知识体系未覆盖 |',
                '| L2-b 未标注知识点 | 有任务有批改，但题目未关联知识点 | 数据治理 | 任务未关联知识点，无法做知识点分析 |',
                '| L3-a 非智批 | 作业为人工登分 / 扫描录入 | 数据链路 | 仅智批作业支持错因分析 |',
                '| L3-b 未标注错因 | 智批完成但无错因标注 | 数据治理 | 已批改，未标注错因 |',
                '| L4 证据不足 | 有证据但有效场次 ≤2 | 教学侧 | 本周期仅 N 场，结论仅供参考 |',
                '',
                '- **判定顺序**：L0 → L0-b → L1 → L2 → L3 → L4，命中即停；顺序颠倒会出现「有任务却提示无任务」「未标注却提示未接入」。',
                '- **不存在「无学科」态**：教师可选学科恒 ≥1 个（单学科 / 多学科两种形态），页面不设「无可选学科」空态；单学科下永远不会出现 L1，L2-a 也不会因切学科触发，只能由「已有任务但题库未接入其知识体系」引起。',
                '- **L0 三子情形**：未布置（任务池空且无布置记录）/ 未回传（有布置记录无批改结果）/ 全取消勾选（任务池非空且已选 0 份），三者文案与下一步动作不同，不得共用一句。',
                '- **处置码**：H 整块隐藏不留空框；E 缺省占位（容器 + 插图 + 文案 + 入口）；D 保留结构、数值置「—」；N 正常渲染。',
                '',
                '| 模块 | L0 | L0-b | L1 | L2-a | L2-b | L3 | L4 |',
                '| --- | --- | --- | --- | --- | --- | --- | --- |',
                '| 顶部筛选栏 / 学生追踪筛选条 | N | N | N | N | N | N | N |',
                '| 周期概览 KPI（班级 6 卡 / 个人 4 卡） | E | D | D | E | N | N | N |',
                '| 得分趋势图（班级 / 个人） | E | E | E | E | N | N | N |',
                '| 任务清单 | E | N | N | N | N | N | N |',
                '| 周期结论（班级 / 个人） | E | E | E | E | N | N | N |',
                '| 摘要卡（5 张） | H | H | H | H（个人 D） | E | N | N |',
                '| 目录 + 树 / 热力 / 表格 / 图谱 | H | H | H | E | E | N | N |',
                '| 诊断 6 标签 | H | H | H | H | H | N | N |',
                '| 错因结构 | H | H | H | H | H | E | N |',
                '| 教学建议 | H | E | E | E | E | N | N |',
                '| 学生学情列表 | D | N | N | N | N | N | N |',
                '| 明细页「查看详情」 | H | N | N | N | N | N | N |',
                '| 导出 | 禁用 | 禁用 | 禁用 | 禁用 | 可用 | 可用 | 可用 |',
                '',
                '- **同页互斥**：只渲染最高级空态（L0 > L0-b > L1 > L2 > L3 > L4），低级别模块折叠为一行摘要（如「另有 4 个模块因无任务未展示」），默认收起可展开；禁止 6 张 KPI 全为「—」各带一行「暂无数据」；筛选栏与顶部导航始终可用，内容级主页签可随面板一起让位；空态不劫持滚动、不强行弹窗。',
                '- **文案四要素**：现象、原因、影响，加「下一步」（仅当使用者能自助处置时必填；产品侧与数据治理侧原因只说明不指引，避免制造无效动作）。',
                '- **红线**：空态不显示「0」（0 = 有数据且为零）；得分率分母为 0 置「—」，不显示 0%；空周期隐藏环比；不得输出「已达标 / 无问题 / 各项正常」；不同原因不得共用一句「暂无数据」；L0 下不输出任何诊断条目（含关系未建）。',
                '',
                '> 现状：已实现任务清单、学情来源弹窗、表格与明细弹窗、个人侧体系未覆盖、教学建议无异常、班级侧 L2-a 与 L0-b 空态；班级侧整页 L0 缺省、L2-b 与 L3-b 提示、同页空态互斥折叠、L0 下导出禁用尚未实现。层级边界：本章管页面级 / 模块级缺省，条目级不可诊断见 XK-07D。'
            ].join('\n')
        },
        {
            id: 'ST-01', group: 'ST', title: '学生列表',
            body: [
                '- 筛选：分组下拉（全部 / 星标学生）+ 按姓名或学号搜索；列表按学号降序，每行含星标按钮、姓名、学号。',
                '- 交互：星标可切换；点击选中当前学生，右侧全部模块联动刷新。'
            ].join('\n')
        },
        {
            id: 'ST-02', group: 'ST', title: '学生头部与数据页签',
            body: [
                '- 头部：星标按钮（与列表联动）+ 姓名 + 学号 + 竖线分隔 + 四数据页签同行居左；四页签互斥显示，隐藏期间不画图，切到该页签时再补渲染。',
                '- 四页签：**作业（默认）**= 学科筛选 + 日期范围 + 排名开关 + CSV 导出 + 九列表格 + 个人 / 班级 / 年级三线得分曲线；**考试**= 最近考试 KPI 五卡 + 学科成绩柱状图 + 历次学情统计；**错题本**= 学科筛选 + 错题卡片 + 导出；**知识点分析**= ST-03 ~ ST-14 范围。',
                '- 演示数据：刘鸿锦为截图复刻数据，其余学生以学号作固定种子生成，刷新不变。'
            ].join('\n')
        },
        {
            id: 'ST-03', group: 'ST', title: '学科与时间筛选条',
            body: [
                '- **学科下拉**：范围为教务权限内学科，默认选中第一个（演示为数学，其余学科走未覆盖空态）；切换后整页按新学科全量重算。',
                '- **时间与作业的合并入口**：筛选条只保留学科下拉 + 回显胶囊「时间范围 · 已选 N 份」；档位（学年/月/周/自定义）、日期控件与作业/考试勾选统一收在「学情来源与统计范围」弹窗内一次设定（同 XK-12.3 方案）。',
                '- **回显口径**：时间文本按档位格式化为「2026年9月」/「2026-2027学年」/「2026-W39（09-21 ~ 09-27）」/「2026-09-01 ~ 2026-09-15」；份数 = 当前学科 + 时间范围内且未取消勾选的任务数，与弹窗底栏同源同步。',
                '- 个人与班级得分率由种子稳定生成；已选任务份数作为证据量因子影响个人数据收敛程度（ST-05）。'
            ].join('\n')
        },
        {
            id: 'ST-04', group: 'ST', title: '维度切换（并入模块头标题行）',
            body: [
                '- 维度标签：知识点（111）/ 能力（10），位于「知识点维度分析」标题行右侧；节点结构与班级树一致、计数同源；无演示数据的学科不显示计数。'
            ].join('\n')
        },
        {
            id: 'ST-05', group: 'ST', title: '摘要卡（5 张）',
            body: [
                '数据源为**个人树**：以班级树为底，用学号作固定种子给个人掌握度加偏移——偏移幅度取决于证据覆盖度（已选任务数 ÷ 6，最低取 0.35），任务越少越贴近班级基准，掌握度落在 4%~99%；考察频次与个人失分题次按同一比例缩放（失分题次约等于考察频次 × 未掌握比例）；班级基准保留用于对比。',
                '',
                '| 卡 | 口径与交互 |',
                '| --- | --- |',
                '| 卡1 周期已检测知识点 / 能力数量 | 知识点：个人证据覆盖「有检测证据 x / 全体系总数」（本期任务或历史考试），不随「查看全部知识点」开关变化；能力：非根节点总数；无演示数据的学科置横线 |',
                '| 卡2 未掌握数量 | 掌握度低于未掌握阈值（默认 60%，随档位联动）的节点数；点击切表格视图 |',
                '| 卡3 个人失分题次 | 个人失分题次合计，与个人失分明细同源；一期隐藏，页面结构保留 |',
                '| 卡4 个人平均得分率 | 个人掌握度均值；徽章为与班级的差值（正负百分点，上升绿下降红）；无演示数据的学科五张卡均置横线 |',
                '| 卡5 顽固薄弱项 | 顽固薄弱项个数，徽章「≥3 次失分率 ≥40%」；点击定位个人知识图谱诊断区 |',
                '',
                '**掌握档位**（与学科学情共用同一套，改档位后全页联动）：3 档 掌握 ≥80 / 一般 60~80 / 未掌握 <60；4 档 优秀 ≥90 / 掌握 80~90 / 一般 60~80 / 未掌握 <60。'
            ].join('\n')
        },
        {
            id: 'ST-06', group: 'ST', title: '知识点分析明细',
            body: [
                '- **统一目录（个人版）**：一级模块多选开关 + 计数徽章 + 个人得分率徽章（按全校共用档位着色）+ 覆盖徽章「已考 x/y」（零覆盖模块琥珀警示，得分率位显示「未检测」）；关闭项灰显加删除线，再次点击恢复；只影响展示层（树 / 表格 / 图谱 / 导出），统计口径不变；开关状态按维度独立记忆，切维度、学科、学生不重置；目录色点 = 该模块个人掌握度档位色，无证据恒灰。',
                '- **查看全部知识点**（仅知识点维度）：默认只显示该生周期涉及的知识点模块（零覆盖一级模块整棵隐藏，模块内本期未检测节点隐藏，仅有历史证据与未学节点保留）；勾选后显示全部节点；无作答证据的节点恒灰并标「未检测」，不展示个人掌握度，表格与导出数值列置「—」，不参与断层着色与红边，图谱统计条追加「含未检测 N」；统计口径（摘要卡 / 诊断 / 建议）不随开关变化。',
                '- **树状图（默认）**：按层级展开，节点按个人掌握档位着色；底部图例随档位配置生成（3 档 / 4 档档位名 + 区间 + 色块）+ 灰色「无作答证据 / 未覆盖」；容器隐藏（尺寸为 0）时跳过绘制，切到该视图再补渲染。',
                '- **表格**：层级页签「全部 / 一级 / 二级 / 三级」；列：考核项、考察频次、个人得分率、班级得分率、与班级差值（按正负着色）、个人失分次数、掌握程度、操作（查看详情 → ST-11 弹窗）。',
                '- **关联图谱**：工具栏同学科学情（深度默认三级、关系开关 3 项且只有文字与选中态、标签策略、仅看关联、力导向 / 放射布局）；画布只渲染知识点节点与知识点间边，四类关联节点池不上图；节点掌握度为个人值；前序断层节点红描边 + 红晕 + 加粗线宽（口径同 ST-07，按得分率升序最多取 5 个）；节点详情面板含个人 / 班级掌握度与差值、关联清单（考查能力 / 依赖能力 / 考查题型 / 常用方法 / 题型易错点分类）、根因链标签与前后序诊断；图例为两段式（节点掌握度色阶 / 画布可见关系线型）。',
                '- **导出**：《学生姓名-知识点（或能力）个人分析.csv》，目录关闭模块同口径剔除；学科知识体系未覆盖时目录显示「未覆盖」（不显示 0/0），树图只保留单个置灰节点，表格显示缺省提示行，图谱区走 L2-a 占位，KPI 四卡置「—」，不得以 0 代替无数据（口径见 XK-13）。'
            ].join('\n')
        },
        {
            id: 'ST-07', group: 'ST', title: '个人知识图谱诊断（6 个标签）',
            body: [
                '结构与学科学情「知识图谱诊断」一致，口径为当前选中学生的个人数据。',
                '',
                '| 标签 | 个人口径 |',
                '| --- | --- |',
                '| 顽固薄弱 | 同一考核项在 ≥3 次不同任务中失分率 ≥40%（诊断区取二级及以下、掌握度低于未掌握阈值（默认 60%）的考核项，按得分率升序最多 5 项）；已选任务不足 3 份时判定为空，证据不足不下结论 |',
                '| 前序断层 | 目标掌握度低于未掌握阈值且祖先链存在 <70% 节点 → 根因取最弱的一级前置；无前置关系记「前置关系未建·待标注」不归因；个人版三态（关系未建 / 根因在前序 / 前序已达标），无「前置暂无证据」态；计数为「有根因数 / 断层总数」 |',
                '| 易混淆 | 学科级易混淆对 + 该生个人命中次数（与 ST-10 建议条数同源）；无演示数据的学科不渲染 |',
                '| 题型易错点 | 该生个人易错点清单 |',
                '| 前后序证据 | 该生周期内多任务汇总证据（原型模拟）；无作答证据 = 未知，不得标为未掌握；未学内容仅衔接，不布置加练 |',
                '| 已达标 | 达标线取最高档下限（3 档 80% / 4 档 90%）；进步判定为首末有效场次提升 ≥8 个百分点；已达标转「减量维持」，每周 1 次滚动复测 |',
                '',
                '- **配色**：顽固薄弱项名、易混淆与易错点「关联：X」中的知识点按个人掌握档位着色（个人树查不到取灰），计数徽章保持语义色。',
                '- **规则同源**：证据等级 A/B/C/D、顽固强度三档与病型五类、断层三道闸（≤5 层 / 跨模块停 / 环保护）、易混淆三级分级与冲突消解顺序均与班级侧一致（细则见 XK-07A ~ XK-07C）。'
            ].join('\n')
        },
        {
            id: 'ST-08', group: 'ST', title: '个人错因结构分析',
            body: [
                '- **堆叠柱状图**：该生各次任务的失分归因占比 + 图例可点击显隐；悬停某错因段时高亮该错因在全部任务中的段，显示各次占比 + 周期均值 + 首尾环比（与班级版同口径）。',
                '- **限制**：仅智批作业支持错因分析；配色与干预文案走通用兜底，不写死错因枚举。',
                '',
                '**个人化矩阵生成**（原型模拟）：以班级错因矩阵对应行为基准，逐单元加一个由「学号 + 场次 + 错因序号」确定的抖动（幅度约 ±5），特征错因额外上调约 7 个点，单元下限 2 后按行归一化到 100%；接入真实数据后替换为该生逐题失分归因汇总。',
                '',
                '**关键发现**：先判空态——学科未覆盖显示单条「XX 知识体系演示数据未覆盖，暂无该生错因分析」；本周期任务不足 2 份显示「该生本周期任务不足 2 份，无法对比错因迁移」。判定与班级 XK-08 同口径：首尾场次逐错因对比，变化幅度 ≥3 个百分点判为显著迁移并按幅度降序（上升红、下降绿 + 配套干预文案），不足 3 个百分点归入「基本稳定」蓝色汇总。'
            ].join('\n')
        },
        {
            id: 'ST-09', group: 'ST', title: '个人失分明细',
            body: [
                '- 一期隐藏，页面结构保留个人历史失分明细。',
                '- 清单仅作历史学情数据保留，不提供个人巩固卷或其他题目生成功能。'
            ].join('\n')
        },
        {
            id: 'ST-10', group: 'ST', title: '个人教学建议',
            body: [
                '把该生当前学科、当前周期的诊断结论汇总成可执行的教学动作；一期只给建议、指向与依据，不含题目内容、组卷或布置练习入口。',
                '',
                '**数据来源（与上方诊断模块同源，不独立计算）**：个人平均得分率与达标项取个人树当前维度末级节点掌握度；顽固薄弱取个人顽固列表（≥3 次考查中失分率 ≥40%），前序断层取个人断层归因，易混淆命中次数与诊断卡同一算法；达标线取掌握程度最高档下限（默认 80%）；统计范围跟随目录关闭状态与范围开关，与摘要卡、诊断卡逐项一致，不一致即缺陷。',
                '',
                '| 建议 | 触发条件 | 依据文案 | 按钮 |',
                '| --- | --- | --- | --- |',
                '| 个人专项突破（红） | 存在顽固薄弱项 | 命中项数量 + 知识点名单，说明重复讲题对结构性问题无效 | 查看顽固薄弱（滚动定位并脉冲高亮） |',
                '| 前序补偿（橙） | 存在掌握度低于未掌握阈值的断层点 | 有根因：断层项数量 + 根因示例；关系未建：按同点巩固处理并给前置标注覆盖率 | 查看断层归因 |',
                '| 成对辨析（琥珀） | 存在易混淆对且该学科有演示数据 | 易混对数 + 最严重的一对 + 该生命中次数，提示用成对辨析与学生互讲替代刷题 | 查看易混淆 |',
                '| 追赶班级（青） | 个人均值比班级均值低 ≥5 个百分点 | 个人均值、班级均值、差值，优先补齐低于班级 10% 的差距项 | 导出个人学情单；查看失分明细 |',
                '| 达标维持（绿） | 存在达到达标线的考核项 | 达标项数量 + 当前达标线，建议每周一次滚动复测 | 查看达标项（切表格视图） |',
                '| 关系建设引导（石板灰） | 存在薄弱项且该项无任何前置关系标注 | 待标注数量 + 前三个知识点名称 | 查看断层归因 |',
                '',
                '- **空态**：六条全不命中显示「该生本周期各项诊断均无异常，按既有节奏推进」，综合卡同步隐藏；学科无演示数据显示「该学科知识体系未覆盖，暂无个人教学建议」并隐藏区域与综合卡；关系建设引导属数据治理动作，不计入教学动作条数。',
                '- **个人综合教学建议卡**：与班级版同结构，标题「个人综合教学建议」+ 纳入整合的建议条数；教学路径按 前序补偿 → 个人专项突破 → 成对辨析 → 追赶班级 → 达标维持 排列，缺项跳过；教学动作表三列（教学动作 / 关注范围取前三项、超出折叠为「等 N 项」/ 使用场景）；前序补偿入表且前置标注覆盖率 <60% 时卡片顶部提示归因能力受限；「导出建议」为演示提示。',
                '- **导出与联动**：右上「导出建议单」导出该生当前学科、周期、目录范围下的知识点学情表（取值范围 / 考察频次 / 个人得分率 / 班级得分率 / 与班级差值 / 个人失分次数 / 掌握程度），无证据行数值置横线；按钮只做三件事——滚动定位并高亮诊断区、切换视图、导出数据，点不到任何出题、组卷或布置入口。'
            ].join('\n')
        },
        {
            id: 'ST-11', group: 'ST', title: '详情弹窗（个人口径）',
            body: [
                '- 考核项个人明细弹窗展示学生、层级、路径、个人 / 班级得分率、掌握程度、断层判定与历史作答证据。',
                '- 操作仅保留关闭、查看错题本、我的作答与原图预览；一期不提供题目生成或组卷入口。'
            ].join('\n')
        },
        {
            id: 'ST-12', group: 'ST', title: '状态徽章',
            body: [
                '- **位置**：个人周期学情概览标题行内，排在概览徽章之前；仅在知识点分析页签激活时显示（口径只对应知识点分析的筛选范围）。',
                '- **数据同源**：与学情页列表徽章同读一份状态表（V2.0 六状态）；平稳不渲染徽章，未学习判为待观察并使用待观察样式。',
                '- **口径标注**：悬停气泡含判定口径、判定理由与「统计范围：学科 X · 起 ~ 止」；切页签、切学生、改筛选时重新渲染。'
            ].join('\n')
        },
        {
            id: 'ST-13', group: 'ST', title: '个人周期学情概览',
            body: [
                '位置：时间筛选条之后、维度工具之前。筛选条以下分两大模块：01 个人周期学情概览（本模块）与 02 知识点维度分析（维度工具至教学建议）。数据源为当前已选任务集合（个人与班级得分率成对提供、按日期升序）；个人无上一周期数据时不显示环比，趋势判定回退为周期内首末进步。',
                '',
                '| KPI 卡（4 张） | 口径 |',
                '| --- | --- |',
                '| 个人平均得分率 | 各次任务个人得分率的算术平均；徽章为与班级基准的差值（正负百分点） |',
                '| 稳定度 | 100 − 个人得分率标准差；副行：标准差 / 最高 / 最低 |',
                '| 个人顽固薄弱 | 同诊断区口径（≥3 次失分率 ≥40%）；非数学学科显示「演示知识体系未覆盖」 |',
                '| 高于班级场次 | 个人得分率高于班级的场次数 / 周期任务总数；副行：落后场次 + 作业与考试拆分 |',
                '',
                '- **趋势与状态结论化**：「周期进步」「状态判定」两张卡已并入周期结论——趋势条目承载末次减首次的进步幅度与趋势档位，状态条目承载 V2.0 六状态（附有效场次与平均得分率）。',
                '- **该生周期得分趋势**：横轴为已勾选任务（日期升序），个人得分率蓝实线（考试三角、作业圆点）+ 班级得分率灰虚线；无任务显示空态。',
                '- **学情状态通俗解读条**：状态胶囊 + 大白话（与学情页徽章同源）；断崖下跌与持续低位为红色提醒态，其余蓝色；无判定显示「当前筛选范围内暂无该生状态判定」。',
                '- **个人周期结论**：与班级版同构的规则表驱动，5 条——趋势 / 稳定度 / 班级对比（落后清单逐条列「任务名（个人% vs 班级%）」）/ 顽固薄弱 / 状态建议；无任务时显示单条空态。'
            ].join('\n')
        },
        {
            id: 'ST-14', group: 'ST', title: '学情来源弹窗',
            body: [
                '位置：筛选条胶囊「时间范围 · 已选 N 份」打开的「学情来源与统计范围」弹窗（交互同学科学情 XK-12）。',
                '',
                '- **统计时间范围**：弹窗顶部时间条承载档位与对应日期控件（由筛选条迁入）；选定即生效，切换后同步刷新弹窗内任务列表与个人概览。',
                '- **勾选交互**：双栏列表（可选范围 = 当前学科 + 当前时间范围内的任务，默认全选）+ 栏头全选与「已选 / 总数」计数 + 底部确定 / 取消；底栏左侧回显「当前范围 · 已选 N 份」；「取消」不回滚勾选与时间变更（已知限制）。',
                '- **变更记录**：原「选中任务得分趋势图」已迁移至个人周期学情概览（ST-13），本弹窗保留时间范围设置与勾选交互。'
            ].join('\n')
        }
    ];

    const prdFab = document.getElementById('prdFab');
    const prdDrawer = document.getElementById('prdDrawer');
    const prdCloseBtn = document.getElementById('prdClose');
    const prdToc = document.getElementById('prdToc');
    const prdContent = document.getElementById('prdContent');
    if (!prdFab || !prdDrawer || !prdToc || !prdContent) return;

    /* ---------- 手动编辑：localStorage 覆盖层 ---------- */
    // 仅存储与默认内容不同的章节；渲染时覆盖默认 body，默认内容始终可从代码恢复
    const PRD_STORAGE_KEY = 'xkStPrdOverrides_phase1_v1';
    let prdOverrides = prdLoadOverrides();
    let prdEditingId = null; // 同一时刻仅允许一个章节处于编辑态

    function prdLoadOverrides() {
        try {
            const raw = localStorage.getItem(PRD_STORAGE_KEY);
            const obj = raw ? JSON.parse(raw) : {};
            if (!obj || typeof obj !== 'object') return {};
            // 兼容 v1 字符串格式：无 base 指纹 → 视为基于未知旧默认，渲染不覆盖（编辑态仍可查看 / 恢复）
            Object.keys(obj).forEach(k => {
                if (typeof obj[k] === 'string') obj[k] = { body: obj[k], base: null };
            });
            return obj;
        } catch (err) {
            return {};
        }
    }

    function prdPersistOverrides() {
        try { localStorage.setItem(PRD_STORAGE_KEY, JSON.stringify(prdOverrides)); } catch (err) { /* 存储受限时静默 */ }
    }

    // 默认 body 指纹：代码默认升级后，基于旧默认的本地覆盖自动失效，避免抽屉与原型口径脱节
    function prdBaseOf(sec) {
        return sec.body.length + '|' + sec.body.slice(0, 32);
    }

    function prdHasRawOverride(id) {
        return Object.prototype.hasOwnProperty.call(prdOverrides, id);
    }

    function prdHasOverride(id) {
        const ov = prdOverrides[id];
        const sec = prdSecOf(id);
        return !!ov && !!sec && ov.base === prdBaseOf(sec);
    }

    function prdSecOf(id) {
        return PRD_SECTIONS.find(s => s.id === id) || null;
    }

    function prdBodyOf(s) {
        return prdHasOverride(s.id) ? prdOverrides[s.id].body : s.body;
    }

    /* ---------- Markdown 渲染：极简子集（无依赖，先转义后解析，不执行 HTML） ----------
       支持：# ~ ### 标题（→ h4，#### 及以上 → h5）、段落、- / 1. 列表（行首每多缩进 2 空格即下一层）、
       GFM 表格（:--: 控制对齐）、> 提示块（→ .prd-note）、--- 分隔线、``` 代码块；
       行内 **粗体** / `code` / ~~删除~~ / 【隐藏】/【演示】。
       不支持：斜体、图片、链接、内联 HTML（正文文本一律先转义再输出，写标签只会显示为文本）。
       章节 body 的唯一格式是 Markdown：代码内默认值、本地覆盖层、导入的 .md 三处都是 Markdown 原文。 */
    const PRD_HTML_HEAD = /^\s*<(p|ul|ol|table|div|section|blockquote|h[1-6])\b/i;

    function prdEsc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // 行内语法：先把 `code` 抽出占位，其余文本已转义，替换只生成白名单标签
    function prdInline(s) {
        const codes = [];
        const out = prdEsc(s)
            .replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; })
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/~~([^~]+)~~/g, '<del>$1</del>')
            .replace(/【隐藏】/g, '<span class="prd-hidden-tag">隐藏</span>')
            .replace(/【演示】/g, '<span class="prd-demo-tag">演示</span>');
        return out.replace(/\u0000(\d+)\u0000/g, (m, i) => '<code>' + codes[+i] + '</code>');
    }

    function prdMdSplitRow(line) {
        let s = String(line).trim();
        if (s.charAt(0) === '|') s = s.slice(1);
        if (s.charAt(s.length - 1) === '|') s = s.slice(0, -1);
        return s.split('|').map(c => c.trim());
    }

    function prdMdIsTableSep(line) {
        if (String(line).indexOf('|') < 0) return false;
        const cells = prdMdSplitRow(line);
        return cells.length > 0 && cells.every(c => /^:?-+:?$/.test(c));
    }

    // 段落合并的终止条件：遇到任一新的块级起始行
    function prdMdIsBlockStart(lines, i) {
        const t = String(lines[i]).trim();
        if (!t) return true;
        if (/^#{1,6}\s/.test(t)) return true;
        if (t.charAt(0) === '>') return true;
        if (/^(-{3,}|\*{3,})$/.test(t)) return true;
        if (t.indexOf('```') === 0) return true;
        if (/^([-*+]|\d+\.)\s+/.test(t)) return true;
        if (t.indexOf('|') > -1 && i + 1 < lines.length && prdMdIsTableSep(lines[i + 1])) return true;
        return false;
    }

    // 列表递归：按缩进量切层
    function prdMdList(items, pos, indent) {
        const tag = items[pos].ordered ? 'ol' : 'ul';
        let out = '<' + tag + '>';
        let i = pos;
        while (i < items.length && items[i].indent >= indent) {
            const it = items[i];
            if (it.indent > indent) { // 首项缩进突增：作为同级子表输出
                const sub0 = prdMdList(items, i, it.indent);
                out += sub0.html;
                i = sub0.next;
                continue;
            }
            i++;
            let inner = '';
            if (i < items.length && items[i].indent > indent) {
                const sub = prdMdList(items, i, items[i].indent);
                inner = sub.html;
                i = sub.next;
            }
            out += '<li>' + prdInline(it.text) + inner + '</li>';
        }
        return { html: out + '</' + tag + '>', next: i };
    }

    function prdMd(src) {
        const text = String(src == null ? '' : src).replace(/\r\n?/g, '\n').trim();
        if (!text) return '';
        if (PRD_HTML_HEAD.test(text)) return text; // 兼容旧版 HTML body 直出（历史覆盖层）

        const lines = text.split('\n');
        const out = [];
        let i = 0;
        while (i < lines.length) {
            const line = lines[i];
            const t = line.trim();
            if (!t) { i++; continue; }

            // ``` 代码块
            if (t.indexOf('```') === 0) {
                const buf = [];
                i++;
                while (i < lines.length && lines[i].trim().indexOf('```') !== 0) { buf.push(lines[i]); i++; }
                i++; // 跳过结束围栏
                out.push('<pre class="prd-code"><code>' + prdEsc(buf.join('\n')) + '</code></pre>');
                continue;
            }

            // --- 分隔线
            if (/^(-{3,}|\*{3,})$/.test(t)) { out.push('<hr>'); i++; continue; }

            // # 标题
            const hm = /^(#{1,6})\s+(.*)$/.exec(t);
            if (hm) {
                const lv = hm[1].length <= 3 ? '4' : '5';
                out.push('<h' + lv + '>' + prdInline(hm[2]) + '</h' + lv + '>');
                i++;
                continue;
            }

            // > 提示块（连续行合并为一段）
            if (t.charAt(0) === '>') {
                const qs = [];
                while (i < lines.length && lines[i].trim().charAt(0) === '>') {
                    qs.push(lines[i].trim().replace(/^>\s?/, ''));
                    i++;
                }
                out.push('<div class="prd-note">' + prdInline(qs.join(' ')) + '</div>');
                continue;
            }

            // GFM 表格：含 | 且下一行为分隔行
            if (t.indexOf('|') > -1 && i + 1 < lines.length && prdMdIsTableSep(lines[i + 1])) {
                const head = prdMdSplitRow(t);
                const aligns = prdMdSplitRow(lines[i + 1]).map(c => {
                    if (/^:.+:$/.test(c)) return 'center';
                    if (/^:/.test(c)) return 'left';
                    if (/:$/.test(c)) return 'right';
                    return '';
                });
                i += 2;
                const rows = [];
                while (i < lines.length && lines[i].trim() && lines[i].indexOf('|') > -1) {
                    rows.push(prdMdSplitRow(lines[i]));
                    i++;
                }
                const th = '<tr>' + head.map((c, k) => '<th' + (aligns[k] ? ' style="text-align:' + aligns[k] + '"' : '') + '>'
                    + prdInline(c) + '</th>').join('') + '</tr>';
                const tb = rows.map(r => '<tr>' + head.map((c, k) => '<td' + (aligns[k] ? ' style="text-align:' + aligns[k] + '"' : '') + '>'
                    + prdInline(r[k] || '') + '</td>').join('') + '</tr>').join('');
                out.push('<table><thead>' + th + '</thead><tbody>' + tb + '</tbody></table>');
                continue;
            }

            // - / 1. 列表（连续列表行整体收集后递归建层）
            if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
                const items = [];
                while (i < lines.length) {
                    const lm = /^(\s*)([-*+]|\d+\.)\s+(.*)$/.exec(lines[i]);
                    if (!lm) break;
                    items.push({ indent: lm[1].replace(/\t/g, '    ').length, ordered: /\d+\./.test(lm[2]), text: lm[3] });
                    i++;
                }
                if (items.length) { out.push(prdMdList(items, 0, items[0].indent).html); continue; }
            }

            // 普通段落：连续非块起始行以空格合并
            const para = [t];
            i++;
            while (i < lines.length && !prdMdIsBlockStart(lines, i)) { para.push(lines[i].trim()); i++; }
            out.push('<p>' + prdInline(para.join(' ')) + '</p>');
        }
        return out.join('\n');
    }

    // 轻提示（复用 proto-toast 样式，独立于主模块私有 showProtoToast）
    let prdToastTimer = null;
    function prdToast(msg) {
        let t = document.getElementById('protoToast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'protoToast';
            t.className = 'proto-toast';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(prdToastTimer);
        prdToastTimer = setTimeout(() => t.classList.remove('show'), 2200);
    }

    // 表格外包一层横向滚动容器：窄抽屉下宽表可横向滚动，不再逐字竖排
    function prdMdBox(md) {
        return prdMd(md)
            .replace(/<table>/g, '<div class="prd-table-scroll"><table>')
            .replace(/<\/table>/g, '</table></div>');
    }

    // 渲染目录（按 XK / ST 两组）与全部章节内容；含本地修改的章节带「已修改」标记与目录圆点
    function prdRender() {
        prdToc.innerHTML = PRD_GROUPS.map(g => {
            const items = PRD_SECTIONS.filter(s => s.group === g.key).map(s =>
                '<div class="prd-toc-item" data-sec="' + s.id + '"><span class="toc-no">' + s.id + '</span><span>' + s.title + '</span>'
                + (prdHasOverride(s.id) ? '<i class="toc-dot" title="含本地修改"></i>' : '')
                + '</div>'
            ).join('');
            return '<div class="prd-toc-group">' + g.name + '</div>' + items;
        }).join('');
        prdContent.innerHTML = PRD_SECTIONS.map(s =>
            '<section class="prd-sec" id="prd-sec-' + s.id + '">'
            + '<div class="prd-sec-h"><span class="sec-no">' + s.id + '</span><span>' + s.title + '</span>'
            + (prdHasOverride(s.id) ? '<span class="prd-modified">已修改</span>' : '')
            + '<i class="fas fa-pen prd-sec-edit" data-prd-edit="' + s.id + '" title="编辑本章节"></i>'
            + '</div><div class="prd-sec-body">' + prdMdBox(prdBodyOf(s)) + '</div></section>'
        ).join('')
            + '<p class="prd-note">与原型目录下的 PRD.md 同源，徽章（XK-nn / ST-nn）与章节一一对应。抽屉左边缘可拖动调宽（360~960px，双击复位 640px，宽度记忆在本浏览器）；章节铅笔图标可编辑正文（<b>Markdown 原文</b>，存 localStorage，可经头部导出 / 导入 .md 文档）。隐藏模块（学科学情卡3、共性错题清单；学生追踪卡3、个人失分明细）DOM 保留，可直接恢复。</p>';
    }

    // 定位到指定章节：目录选中 + 内容滚动 + 标题闪烁高亮
    function prdLocate(id) {
        const sec = document.getElementById('prd-sec-' + id);
        if (!sec) return;
        prdToc.querySelectorAll('.prd-toc-item').forEach(el => {
            el.classList.toggle('active', el.getAttribute('data-sec') === id);
        });
        prdContent.scrollTop = Math.max(0, sec.offsetTop - 12);
        sec.classList.remove('prd-flash');
        void sec.offsetWidth; // 强制 reflow，重启动画
        sec.classList.add('prd-flash');
        const tocItem = prdToc.querySelector('.prd-toc-item[data-sec="' + id + '"]');
        if (tocItem && tocItem.scrollIntoView) tocItem.scrollIntoView({ block: 'nearest' });
    }

    /* ---------- 顶部关键词搜索：输入 → 结果下拉（标题优先，命中高亮）→ 点击定位 ---------- */
    const prdSearchInput = document.getElementById('prdSearchInput');
    const prdSearchClear = document.getElementById('prdSearchClear');
    const prdSearchResults = document.getElementById('prdSearchResults');

    // 搜索用纯文本：走同一条 prdMd 渲染链再取 textContent，保证与右侧渲染内容一致
    function prdPlainText(md) {
        const tmp = document.createElement('div');
        tmp.innerHTML = prdMd(md);
        return (tmp.textContent || '').replace(/\s+/g, ' ').trim();
    }

    function prdSearch(query) {
        if (!prdSearchResults) return;
        const q = (query || '').trim();
        if (!q) {
            prdSearchResults.classList.remove('show');
            prdSearchResults.innerHTML = '';
            return;
        }
        const ql = q.toLowerCase();
        const hits = [];
        PRD_SECTIONS.forEach(s => {
            const title = s.id + ' ' + s.title;
            const body = prdPlainText(prdBodyOf(s));   // 搜索覆盖层生效后的正文，与渲染一致
            const ti = title.toLowerCase().indexOf(ql);
            const bi = body.toLowerCase().indexOf(ql);
            if (ti === -1 && bi === -1) return;
            let snippet = '';
            if (ti === -1) {
                const start = Math.max(0, bi - 24);
                const end = Math.min(body.length, bi + q.length + 28);
                snippet = (start > 0 ? '…' : '') + body.substring(start, bi)
                    + '<mark>' + body.substring(bi, bi + q.length) + '</mark>'
                    + body.substring(bi + q.length, end) + (end < body.length ? '…' : '');
            }
            hits.push({ s, snippet, inTitle: ti !== -1, markTitle: ti !== -1
                ? title.substring(0, ti) + '<mark>' + title.substring(ti, ti + q.length) + '</mark>' + title.substring(ti + q.length)
                : title });
        });
        hits.sort((a, b) => (b.inTitle - a.inTitle) || (a.s.id < b.s.id ? -1 : 1));
        if (!hits.length) {
            prdSearchResults.innerHTML = '<div class="prd-search-empty">无匹配章节，试试「环比」「顽固」「需关注」</div>';
        } else {
            prdSearchResults.innerHTML = hits.slice(0, 20).map(h =>
                '<button type="button" class="prd-search-item" data-sec="' + h.s.id + '">'
                + '<span class="prd-search-no">' + h.s.id + '</span>'
                + '<span class="prd-search-txt"><b>' + h.markTitle + '</b>'
                + (h.inTitle ? '' : '<em>' + h.snippet + '</em>') + '</span>'
                + '</button>'
            ).join('') + (hits.length > 20 ? '<div class="prd-search-more">共 ' + hits.length + ' 条匹配，仅显示前 20 条</div>' : '');
        }
        prdSearchResults.classList.add('show');
    }

    if (prdSearchInput) {
        let prdSearchTimer = null;
        prdSearchInput.addEventListener('input', () => {
            clearTimeout(prdSearchTimer);
            prdSearchTimer = setTimeout(() => prdSearch(prdSearchInput.value), 150);
        });
        prdSearchInput.addEventListener('focus', () => {
            if (prdSearchInput.value) prdSearch(prdSearchInput.value);
        });
        prdSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // 关键词已空：不拦截，让行给抽屉自身的 Esc（否则第二次 Esc 会被吞掉）
                if (!prdSearchInput.value) return;
                e.stopPropagation();   // 先清空搜索，不让 Esc 直接收起抽屉
                prdSearchInput.value = '';
                prdSearch('');
            } else if (e.key === 'Enter') {
                const first = prdSearchResults && prdSearchResults.querySelector('.prd-search-item');
                if (first) first.click();
            }
        });
    }
    if (prdSearchClear) {
        prdSearchClear.addEventListener('click', () => {
            prdSearchInput.value = '';
            prdSearch('');
            prdSearchInput.focus();
        });
    }
    if (prdSearchResults) {
        prdSearchResults.addEventListener('click', (e) => {
            const item = e.target.closest('.prd-search-item');
            if (!item) return;
            prdSearchResults.classList.remove('show');
            prdLocate(item.getAttribute('data-sec'));
        });
    }
    // 点击搜索区以外任意位置收起结果下拉
    document.addEventListener('click', (e) => {
        if (prdSearchResults && !e.target.closest('.prd-searchbar') && !e.target.closest('.prd-search-results')) {
            prdSearchResults.classList.remove('show');
        }
    });

    function prdOpen(id) {
        prdDrawer.classList.add('open');
        if (prdSearchResults) prdSearchResults.classList.remove('show');   // 展开抽屉时收起搜索下拉
        if (id) {
            prdLocate(id);
        } else if (!prdToc.querySelector('.prd-toc-item.active')) {
            prdLocate('XK-01');
        }
    }

    function prdCloseDrawer() {
        prdDrawer.classList.remove('open');
    }

    /* ---------- 抽屉宽度拖动调节（左边缘手柄） ---------- */
    // 区间：min 360px ~ max 960px（同时受 CSS max-width 94vw 约束，取小值）；双击手柄复位默认 640px；宽度记忆在 localStorage
    const PRD_WIDTH_KEY = 'xkStPrdWidth_v1';
    const PRD_WIDTH_MIN = 360;
    const PRD_WIDTH_DEFAULT = 640;
    const PRD_WIDTH_MAX = 960;
    let prdDragState = null;   // { startX, startWidth }

    const prdResizeHandle = document.getElementById('prdResizeHandle');

    function prdMaxWidth() { return Math.min(PRD_WIDTH_MAX, window.innerWidth * 0.94); }
    function prdClampWidth(w) { return Math.max(PRD_WIDTH_MIN, Math.min(w, prdMaxWidth())); }
    function prdSetWidth(w) {
        const cw = prdClampWidth(w);
        prdDrawer.style.width = cw + 'px';
        try { localStorage.setItem(PRD_WIDTH_KEY, String(cw)); } catch (err) { /* 隐私模式等存储不可用时忽略 */ }
    }

    // 恢复记忆宽度（首次使用为默认 640px；记忆值越界时重新收敛到合法区间）
    (function () {
        const saved = Number(localStorage.getItem(PRD_WIDTH_KEY));
        if (saved && saved >= PRD_WIDTH_MIN) prdDrawer.style.width = prdClampWidth(saved) + 'px';
    })();

    // 视口变窄时（如旋转/缩放窗口）仅收敛渲染宽度，不覆盖记忆值
    window.addEventListener('resize', () => {
        const w = parseFloat(prdDrawer.style.width) || PRD_WIDTH_DEFAULT;
        if (w > prdMaxWidth()) prdDrawer.style.width = prdMaxWidth() + 'px';
    });

    if (prdResizeHandle) {
        prdResizeHandle.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            prdDragState = { startX: e.clientX, startWidth: prdDrawer.getBoundingClientRect().width };
            try { prdResizeHandle.setPointerCapture(e.pointerId); } catch (err) { /* 合成事件无真实指针，忽略 */ }
            prdResizeHandle.classList.add('prd-resizing');
            document.body.classList.add('prd-resizing');
            e.preventDefault();
        });
        // 抽屉锚定右缘：向左拖（clientX 减小）变宽，实时 clamp 到 [min, max] 区间
        prdResizeHandle.addEventListener('pointermove', (e) => {
            if (!prdDragState) return;
            prdSetWidth(prdDragState.startWidth + (prdDragState.startX - e.clientX));
        });
        const prdEndDrag = (e) => {
            if (!prdDragState) return;
            prdDragState = null;
            prdResizeHandle.classList.remove('prd-resizing');
            document.body.classList.remove('prd-resizing');
            try { prdResizeHandle.releasePointerCapture(e.pointerId); } catch (err) { /* 同上 */ }
        };
        prdResizeHandle.addEventListener('pointerup', prdEndDrag);
        prdResizeHandle.addEventListener('pointercancel', prdEndDrag);
        prdResizeHandle.addEventListener('dblclick', () => prdSetWidth(PRD_WIDTH_DEFAULT));
    }

    /* ---------- 手动编辑：编辑态切换 / 保存 / 恢复 / 导入导出 ---------- */

    // 有未保存修改时确认放弃；返回 true 表示可以继续（编辑态已清理）
    function prdConfirmDiscard() {
        const ta = document.getElementById('prdEditor');
        if (!ta || !prdEditingId) { prdEditingId = null; return true; }
        const sec = prdSecOf(prdEditingId);
        const origin = sec ? prdBodyOf(sec) : '';
        if (ta.value !== origin && !window.confirm('当前章节有未保存的修改，确定放弃吗？')) return false;
        prdEditingId = null;
        return true;
    }

    function prdEnterEdit(id) {
        if (prdEditingId === id) return;
        const sec = prdSecOf(id);
        const secEl = document.getElementById('prd-sec-' + id);
        if (!sec || !secEl) return;
        if (prdEditingId) {
            const prevId = prdEditingId;
            if (!prdConfirmDiscard()) return;
            prdRerenderKeeping(prevId); // 还原上一节的编辑态
        }
        prdEditingId = id;
        secEl.classList.add('prd-editing');
        const bodyBox = secEl.querySelector('.prd-sec-body');
        bodyBox.innerHTML = '<textarea class="prd-editor" id="prdEditor" spellcheck="false"></textarea>'
            + '<div class="prd-editor-actions">'
            + '<button type="button" class="prd-btn prd-btn-primary" data-prd-save="' + id + '">保存</button>'
            + '<button type="button" class="prd-btn prd-btn-ghost" data-prd-cancel="' + id + '">取消</button>'
            + '<button type="button" class="prd-btn prd-btn-danger" data-prd-reset="' + id + '">恢复默认</button>'
            + '<span class="prd-editor-tip">' + (prdHasRawOverride(id) && !prdHasOverride(id) ? '本地修改基于旧版默认，当前未生效；保存后重新生效。' : 'Markdown 编辑：**粗体** | 表 | 格 | - 列表 > 提示 【隐藏】标记；修改保存在本浏览器，可经头部导出 .md 备份') + '</span>'
            + '</div>';
        const ta = bodyBox.querySelector('.prd-editor');
        const ov = prdOverrides[id];
        const current = ov ? ov.body : sec.body;
        ta.value = current;
        ta.rows = Math.min(28, Math.max(10, current.split('\n').length + 2));
        ta.focus();
    }

    function prdSaveEdit(id) {
        const ta = document.getElementById('prdEditor');
        const sec = prdSecOf(id);
        if (!ta || !sec) return;
        const val = ta.value.trim();
        if (!val) { prdToast('内容不能为空'); return; }
        if (val === sec.body.trim()) {
            delete prdOverrides[id]; // 与默认一致视为未修改
        } else {
            prdOverrides[id] = { body: val, base: prdBaseOf(sec) };
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
        if (!prdHasRawOverride(id)) { prdToast('该章节已是默认内容'); return; }
        if (!window.confirm('恢复为默认内容？本地修改将被丢弃。')) return;
        delete prdOverrides[id];
        prdPersistOverrides();
        prdEditingId = null;
        prdRerenderKeeping(id);
        prdToast('已恢复默认内容');
    }

    // 全量重渲并保持浏览位置（目录选中项 + 滚动到指定章节）
    function prdRerenderKeeping(id) {
        const active = prdToc.querySelector('.prd-toc-item.active');
        const activeId = active ? active.getAttribute('data-sec') : null;
        prdRender();
        if (activeId) {
            const item = prdToc.querySelector('.prd-toc-item[data-sec="' + activeId + '"]');
            if (item) item.classList.add('active');
        }
        if (id) {
            const secEl = document.getElementById('prd-sec-' + id);
            if (secEl) prdContent.scrollTop = Math.max(0, secEl.offsetTop - 12);
        }
    }

    /* ---------- 导出 / 导入：Markdown 文档（与项目 PRD.md 同构） ----------
       导出结构：# 项目名 产品需求文档（PRD） / > 说明行 / # 组名 / ## 编号 标题 + 正文，
       章节与组之间以 --- 分隔；正文取覆盖层合并后的 Markdown，可直接当 PRD.md 快照。
       导入：仅认「## 编号 标题」为章节起点，正文到下一个「## 编号」或任意「# 」标题为止，
       故文档头、组标题、验收场景表等非章节内容不会混入；正文首尾的 --- 分隔线剔除；
       章节标题与分组以代码内 PRD_SECTIONS 为准，文件里的标题不参与覆盖。 */

    function prdExportText() {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        let modified = 0;
        PRD_SECTIONS.forEach(s => { if (prdHasOverride(s.id)) modified++; });
        const groupKeys = PRD_GROUPS.map(g => g.key);
        const blocks = [];
        // 未登记在 PRD_GROUPS 的章节归入「其他章节」，避免导出丢内容
        PRD_GROUPS.concat([{ key: null, name: '其他章节' }]).forEach(g => {
            const list = PRD_SECTIONS.filter(s => (g.key ? s.group === g.key : groupKeys.indexOf(s.group) < 0));
            if (!list.length) return;
            blocks.push('# ' + g.name + '\n\n' + list.map(s =>
                '## ' + s.id + ' ' + s.title + '\n\n' + String(prdBodyOf(s)).trim()
            ).join('\n\n---\n\n'));
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

    // Markdown → 章节列表 [{ id, body }]；无章节行时返回空数组
    function prdParseMd(text) {
        const lines = String(text == null ? '' : text).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
        const list = [];
        let cur = null;
        let fence = false; // ``` 围栏内的 # / ## 属正文，不参与结构识别
        for (let i = 0; i < lines.length; i++) {
            const t = lines[i].trim();
            if (t.indexOf('```') === 0) {
                fence = !fence;
                if (cur) cur.lines.push(lines[i]);
                continue;
            }
            if (fence) { if (cur) cur.lines.push(lines[i]); continue; }
            const m = /^##\s+([A-Za-z]{2,4}-\d{2})(?:\s+(.*))?$/.exec(t);
            if (m) {
                if (cur) list.push(cur);
                cur = { id: m[1].toUpperCase(), lines: [] };
                continue;
            }
            if (!cur) continue;       // 首个章节之前：文档标题与说明行，忽略
            if (/^#\s/.test(t)) {     // 一级标题 = 组/部分标题：本章结束，其后内容归下一章
                list.push(cur);
                cur = null;
                continue;
            }
            cur.lines.push(lines[i]);
        }
        if (cur) list.push(cur);
        return list.map(s => ({
            id: s.id,
            body: s.lines.join('\n')
                .replace(/^\s*(?:---\s*\n)+/, '')   // 章节前的分隔线
                .replace(/(?:\n\s*---)+\s*$/, '')   // 章节末尾的分隔线
                .replace(/\n{3,}/g, '\n\n')
                .trim()
        }));
    }

    // 导出：下载 Markdown 文档（含全部本地修改）
    function prdExport() {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const blob = new Blob([prdExportText()], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = PRD_EXPORT_NAME + '-' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate())
            + '-' + pad(now.getHours()) + pad(now.getMinutes()) + '.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 0);
        prdToast('已导出 PRD Markdown（含全部本地修改）');
    }

    // 导入：读取 Markdown 文档，与默认不同的章节写入覆盖层
    function prdImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.markdown,.txt,text/markdown,text/plain';
        input.addEventListener('change', () => {
            const file = input.files && input.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                const list = prdParseMd(reader.result);
                if (!list.length) {
                    window.alert('导入失败：文件中没有「## 编号 标题」形式的章节行（编号需与页面徽章一致，如 XK-01）。');
                    return;
                }
                if (prdEditingId && !prdConfirmDiscard()) return;
                let covered = 0, same = 0, skipped = 0, unknown = 0;
                list.forEach(item => {
                    if (!item.body) { skipped++; return; } // 空正文不覆盖，避免误清空本地修改
                    const sec = prdSecOf(item.id);
                    if (!sec) { unknown++; return; }
                    if (item.body === String(sec.body).trim()) {
                        if (prdHasRawOverride(item.id)) delete prdOverrides[item.id];
                        same++;
                    } else {
                        prdOverrides[item.id] = { body: item.body, base: prdBaseOf(sec) };
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

    // 有弹窗 / 其他抽屉开着时，Esc 优先让既有处理器关弹窗
    function prdAnyOverlayOpen() {
        if (document.querySelector('.modal-overlay.show')) return true;
        const drill = document.getElementById('drillDrawer');
        if (drill && drill.classList.contains('open')) return true;
        const rel = document.getElementById('relDiagDrawer');
        if (rel && rel.classList.contains('open')) return true;
        return false;
    }

    // 浮动按钮 toggle：点击展开抽屉，再次点击收起（编辑内容保留在 DOM，不丢）
    prdFab.addEventListener('click', () => {
        if (prdDrawer.classList.contains('open')) {
            prdCloseDrawer();
        } else {
            prdOpen();
        }
    });
    if (prdCloseBtn) prdCloseBtn.addEventListener('click', prdCloseDrawer);

    // 浮动按钮拖动：按住可拖到任意位置（避免遮挡页面底部内容）；位置记忆 localStorage，刷新后保持；
    // 位移 ≥5px 视为拖动，拖动后的 click 在捕获阶段被拦截不触发抽屉开合（普通点击行为不变）
    (function prdFabDrag() {
        const POS_KEY = 'xkStPrdFabPos_v1';
        const MARGIN = 8;
        let dragMoved = false;
        let dragState = null;

        function applyPos(left, top) {
            const w = prdFab.offsetWidth;
            const h = prdFab.offsetHeight;
            const maxL = Math.max(MARGIN, window.innerWidth - w - MARGIN);
            const maxT = Math.max(MARGIN, window.innerHeight - h - MARGIN);
            const l = Math.min(Math.max(MARGIN, left), maxL);
            const t = Math.min(Math.max(MARGIN, top), maxT);
            prdFab.style.left = l + 'px';
            prdFab.style.top = t + 'px';
            prdFab.style.right = 'auto';
            prdFab.style.bottom = 'auto';
            return { left: l, top: t };
        }

        function persistPos() {
            if (!prdFab.style.left) return;
            try {
                localStorage.setItem(POS_KEY, JSON.stringify({
                    left: parseFloat(prdFab.style.left),
                    top: parseFloat(prdFab.style.top)
                }));
            } catch (err) { /* 存储受限时静默 */ }
        }

        // 恢复记忆位置（越界自动钳制回视口内）
        try {
            const saved = JSON.parse(localStorage.getItem(POS_KEY) || 'null');
            if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) applyPos(saved.left, saved.top);
        } catch (err) { /* 存储受限时静默 */ }

        prdFab.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            const rect = prdFab.getBoundingClientRect();
            dragState = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ol: rect.left, ot: rect.top };
            dragMoved = false;
            // 合成事件/指针已释放等边界场景容错，失败不影响拖动主流程
            try { prdFab.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
        });

        prdFab.addEventListener('pointermove', (e) => {
            if (!dragState || e.pointerId !== dragState.id) return;
            const dx = e.clientX - dragState.sx;
            const dy = e.clientY - dragState.sy;
            if (!dragMoved && Math.abs(dx) + Math.abs(dy) < 5) return;
            dragMoved = true;
            prdFab.classList.add('dragging');
            applyPos(dragState.ol + dx, dragState.ot + dy);
        });

        function endDrag() {
            if (!dragState) return;
            dragState = null;
            prdFab.classList.remove('dragging');
            if (dragMoved) persistPos();
        }
        prdFab.addEventListener('pointerup', endDrag);
        prdFab.addEventListener('pointercancel', endDrag);

        // 拖动后浏览器会跟随派发一次 click：捕获阶段消费，避免误触抽屉开合
        document.addEventListener('click', (e) => {
            if (!dragMoved) return;
            dragMoved = false;
            if (prdFab.contains(e.target)) { e.stopPropagation(); e.preventDefault(); }
        }, true);

        // 窗口尺寸变化：位置越界时钳制回视口内并更新记忆
        window.addEventListener('resize', () => {
            if (!prdFab.style.left) return;
            const p = applyPos(parseFloat(prdFab.style.left), parseFloat(prdFab.style.top));
            try { localStorage.setItem(POS_KEY, JSON.stringify({ left: p.left, top: p.top })); } catch (err) { /* 静默 */ }
        });
    })();

    // 目录点击定位（抽屉保持展开，不遮挡原型操作）
    prdToc.addEventListener('click', (e) => {
        const item = e.target.closest('.prd-toc-item');
        if (item) prdLocate(item.getAttribute('data-sec'));
    });

    // 模块编号徽章点击（事件委托）：展开抽屉并定位；阻止冒泡避免触发卡片下钻等既有绑定
    document.addEventListener('click', (e) => {
        const badge = e.target.closest('.prd-badge');
        if (!badge) return;
        e.stopPropagation();
        e.preventDefault();
        prdOpen(badge.getAttribute('data-prd'));
    });

    // 章节编辑按钮（事件委托：编辑 / 保存 / 取消 / 恢复默认）
    prdContent.addEventListener('click', (e) => {
        const editBtn = e.target.closest('[data-prd-edit]');
        if (editBtn) { prdEnterEdit(editBtn.getAttribute('data-prd-edit')); return; }
        const saveBtn = e.target.closest('[data-prd-save]');
        if (saveBtn) { prdSaveEdit(saveBtn.getAttribute('data-prd-save')); return; }
        const cancelBtn = e.target.closest('[data-prd-cancel]');
        if (cancelBtn) { prdExitEdit(cancelBtn.getAttribute('data-prd-cancel')); return; }
        const resetBtn = e.target.closest('[data-prd-reset]');
        if (resetBtn) { prdResetSec(resetBtn.getAttribute('data-prd-reset')); }
    });

    const prdExportBtn = document.getElementById('prdExport');
    const prdImportBtn = document.getElementById('prdImport');
    if (prdExportBtn) prdExportBtn.addEventListener('click', prdExport);
    if (prdImportBtn) prdImportBtn.addEventListener('click', prdImport);

    // Esc：搜索下拉优先收起，其次编辑态取消编辑，再次弹窗让行，最后收起抽屉
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (!prdDrawer.classList.contains('open')) return;
        if (prdSearchResults && prdSearchResults.classList.contains('show')) {
            prdSearchResults.classList.remove('show');
            return;
        }
        if (prdEditingId) {
            const id = prdEditingId;
            if (prdConfirmDiscard()) prdRerenderKeeping(id);
            return;
        }
        if (prdAnyOverlayOpen()) return;
        prdCloseDrawer();
    });

    prdRender();
})();

