# -*- coding: utf-8 -*-
"""
讲评试卷 4.0 · 整合版单文件构建脚本
====================================
把 5 个源页面整合为一个 HTML 页面（一个入口 + 五个同页视图）：

  - 壳（宿主）：index.html —— 全局顶栏 + 两级层级：作业列表为最外层；点「查看详情」进入讲评试卷，
     同页 tab 为讲评工作台 / 班级报告 / 年级报告 / 作文报告（讲评工作台直接内联在壳内；
     其余 4 个视图的 HTML 内联为 srcdoc 模板 window.__WB_TPL，由壳的 WB IIFE 在首次进入该视图时
     装载到对应 iframe（srcdoc 无地址栏，参数经注入 window.__RPQ 传入子视图，格式同 query 字符串）。
  - 视图模板：list.html / class-report.html / grade-report.html / essay-report.html
     每份模板在 <head> 后注入 <script>window.__RPQ=__RPQ__;</script>（占位符运行时替换为 JSON 字符串）。
  - 共享 css/js 资源（style.css / report.css / report-data.js / prd-*.js/css 等）仍以相对路径
     外部引用：srcdoc 文档继承宿主 base URL，file:// 与 http:// 双环境均可解析。

用法：python build_integrated.py
产物：讲评试卷4.0整合版.html（与源文件同目录，双击即可用）
改源页面后需重新运行本脚本再生成整合版。
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'index.html')
OUT = os.path.join(HERE, '讲评试卷4.0整合版.html')

VIEWS = ['list.html', 'class-report.html', 'grade-report.html', 'essay-report.html']
KEY = {'list.html': 'list', 'class-report.html': 'class',
       'grade-report.html': 'grade', 'essay-report.html': 'essay'}

# 壳中 WB IIFE 脚本的定位锚点（含其 <script> 开标签，必须恰好命中 1 次）
ANCHOR = '<script>\n    /* ══════════ 作业视图切换（4.0 同页 tab：讲评工作台 / 班级报告 / 年级报告） ══════════'


def read(f):
    p = os.path.join(HERE, f)
    with open(p, 'r', encoding='utf-8') as fh:
        s = fh.read()
    return s.replace('\r\n', '\n')


def make_tpl(html):
    """给视图 HTML 注入 __RPQ 占位脚本（紧随 <head> 之后，保证先于一切页面脚本执行）。
       占位符不带引号：运行时 loadFrame 用 JSON.stringify(query) 替换，生成合法字符串字面量。"""
    anchor = '<head>'
    assert html.count(anchor) == 1, '视图应恰好一个 <head>'
    inject = '<script>window.__RPQ=__RPQ__;</script>'
    return html.replace(anchor, anchor + '\n' + inject, 1)


def js_str(s):
    """HTML → 可安全放进外层 <script> 的 JS 字符串字面量：
       - json.dumps 转义引号/换行；
       - `</` → `<\/` 防止提前闭合外层 </script>；
       - `<!--` → `\x3C!--` 防止 script 数据进入注释逃逸态（JS 解析后还原为 <!--）。"""
    t = json.dumps(s, ensure_ascii=False)
    t = t.replace('</', '<\\/')
    t = t.replace('<!--', '\\x3C!--')
    return t


def main():
    shell = read('index.html')
    assert shell.count(ANCHOR) == 1, '壳中 WB IIFE 锚点必须恰好命中 1 次'

    parts = []
    for f in VIEWS:
        tpl = make_tpl(read(f))
        parts.append('%s:%s' % (KEY[f], js_str(tpl)))

    tpl_script = ('<script>\n'
                  '/* ══════════ 整合版：4 个嵌入视图的 srcdoc 模板（由 build_integrated.py 生成） ══════════\n'
                  '   占位符 __RPQ__ 在装载时被替换为该视图的 query 字符串（embed=1&hw=&cls=&role=） */\n'
                  'window.__WB_TPL = window.__WB_TPL || {};\n'
                  + ';\n'.join('window.__WB_TPL.%s = %s' % (k, v) for k, v in [p.split(':', 1) for p in parts])
                  + ';\n'
                  '</script>\n    ' + ANCHOR)

    # 用【TPL 块 + 原锚点】替换原锚点（原锚点含 WB IIFE 的 <script> 开标签，避免双开标签）
    out = shell.replace(ANCHOR, tpl_script, 1)

    with open(OUT, 'w', encoding='utf-8') as fh:
        fh.write(out)
    print('generated:', OUT, os.path.getsize(OUT), 'bytes')


if __name__ == '__main__':
    main()
