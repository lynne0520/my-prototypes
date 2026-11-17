# -*- coding: utf-8 -*-
"""整合版单文件验收：http 环境全链路 + file:// 冒烟（讲评试卷 4.0）"""
import sys
from playwright.sync_api import sync_playwright

BASE = 'http://127.0.0.1:8099/'
PAGE = '讲评试卷4.0整合版.html'
errs = []
warns = []
ok = []
fail = []


def chk(name, cond, extra=''):
    (ok if cond else fail).append(name + (' ' + extra if extra else ''))
    print(('PASS' if cond else 'FAIL'), name, extra)


def close_drawer():
    """关闭宿主 PRD 抽屉（嵌入视图徽章统一由宿主打开，避免遮挡后续点击）"""
    pg.evaluate("document.getElementById('prdClose') && document.getElementById('prdClose').click()")


with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1600, 'height': 950})
    pg.route('**fonts.googleapis.com/**', lambda r: r.abort())
    pg.route('**fonts.gstatic.com/**', lambda r: r.abort())
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: warns.append('%s|%s|%s' % (m.type, m.text[:60], (m.location or {}).get('url', ''))) if m.type in ('error', 'warning') else None)
    pg.set_default_timeout(15000)

    # ── 1. 整合版首页：默认落在作业列表层级（最外层，无讲评试卷 tab 条） ──
    pg.goto(BASE + PAGE, wait_until='domcontentloaded')
    pg.wait_for_timeout(2200)
    chk('默认列表层级', pg.evaluate("document.body.classList.contains('wb-lv-list')"))
    chk('列表层级 tab 条隐藏', pg.evaluate("!document.querySelector('#wb-tabs').offsetParent"))
    chk('列表 pane 激活', pg.locator('#wb-pane-list').evaluate("el => el.classList.contains('active')"))
    chk('讲评试卷 tab 共 4 个', pg.evaluate("document.querySelectorAll('#wb-tabs .wb-tab').length === 4"))
    pg.screenshot(path='_it_1_list.png')

    # ── 2. 作业列表视图内：PRD 徽章可见（iframe 内部） ──
    fl = pg.frame_locator('#wb-frame-list')
    chk('LP-01 徽章可见', fl.locator('.prd-badge[data-prd="LP-01"]').count() == 1)
    chk('LP-03 徽章可见', fl.locator('.prd-badge[data-prd="LP-03"]').count() == 1)
    chk('列表内顶栏已隐藏', fl.locator('body.lp-embed .topnav').count() == 1)
    pg.screenshot(path='_it_2_list_badges.png')

    # ── 3. 列表内点 LP-03 徽章 → 宿主全视口抽屉打开（iframe 内抽屉会被顶栏/tab 条裁半截，已改路由到宿主） ──
    fl.locator('.prd-badge[data-prd="LP-03"]').click()
    pg.wait_for_timeout(900)
    chk('列表徽章→宿主抽屉打开', pg.locator('#prdDrawer.open').count() == 1)
    chk('宿主抽屉全高置顶', pg.evaluate("(function(){var d=document.getElementById('prdDrawer').getBoundingClientRect();return d.top<=1 && d.height>=window.innerHeight-2})()"))
    pg.screenshot(path='_it_3_list_drawer.png')
    close_drawer()
    pg.wait_for_timeout(300)

    # ── 4. 列表入口 → 班级报告（R1 教师，HW-0910-U1 / 71） ──
    fl.locator('button.act', has_text='班级报告').first.click()
    pg.wait_for_timeout(2500)
    chk('切到班级报告视图', pg.evaluate("document.querySelector('#wb-tabs .wb-tab.active').dataset.wb === 'class'"))
    chk('讲评层级 tab 条显示', pg.locator('#wb-tabs').is_visible())
    chk('讲评层级不再隐藏 tab', pg.evaluate("!document.body.classList.contains('wb-lv-list')"))
    tabs = pg.locator('#wb-tabs .wb-tab').all_inner_texts()
    chk('讲评层级 tab 齐备', [t.strip() for t in tabs] == ['讲评工作台', '班级报告', '年级报告', '作文报告'], str(tabs))
    chk('返回按钮可见', pg.locator('.back-btn').is_visible())
    fc = pg.frame_locator('#wb-frame-class')
    chk('RP-01 徽章可见', fc.locator('.prd-badge[data-prd="RP-01"]').count() == 1)
    chk('QT-01 徽章可见', fc.locator('.prd-badge[data-prd="QT-01"]').count() == 1)
    chk('CR-01 徽章可见（教师 R1）', fc.locator('.prd-badge[data-prd="CR-01"]').count() == 1)
    chk('教师 R1 不含 CR-10（组长）', fc.locator('.prd-badge[data-prd="CR-10"]').count() == 0)
    chk('嵌入报告顶栏不注入', fc.locator('#rp-topnav header').count() == 0)
    pg.screenshot(path='_it_4_class_teacher.png')

    # ── 5. 标题行「< 返回」→ 回作业列表层级 ──
    pg.locator('.back-btn').click()
    pg.wait_for_timeout(1200)
    chk('返回列表层级', pg.evaluate("document.body.classList.contains('wb-lv-list')"))
    chk('返回后 tab 条隐藏', pg.evaluate("!document.querySelector('#wb-tabs').offsetParent"))

    # ── 6. 列表入口 → 讲评工作台（查看详情，HW-0910-U1） ──
    fl2 = pg.frame_locator('#wb-frame-list')
    fl2.locator('button.act', has_text='查看详情').first.click()
    pg.wait_for_timeout(2800)
    chk('切到讲评工作台', pg.evaluate("document.querySelector('#wb-tabs .wb-tab.active').dataset.wb === 'workbench'"))
    chk('讲评层级 tab 条显示（工作台）', pg.locator('#wb-tabs').is_visible())
    chk('工作台标题联动作业名', 'unit1' in pg.locator('#hw-title').inner_text())
    chk('作文报告 tab 出现（含作文题作业）', pg.locator('#wb-tab-essay').evaluate("el => el.style.display !== 'none'"))
    chk('工作台图表容器存在', pg.locator('#question-content').count() == 1)
    pg.screenshot(path='_it_6_workbench.png')

    # ── 7. 工作台 → 作文报告 tab ──
    pg.locator('#wb-tab-essay').click()
    pg.wait_for_timeout(2600)
    chk('切到作文报告', pg.evaluate("document.querySelector('#wb-tabs .wb-tab.active').dataset.wb === 'essay'"))
    fe = pg.frame_locator('#wb-frame-essay')
    chk('ES-02 徽章可见', fe.locator('.prd-badge[data-prd="ES-02"]').count() == 1)
    chk('ES-01 徽章可见', fe.locator('.prd-badge[data-prd="ES-01"]').count() == 1)
    pg.screenshot(path='_it_7_essay.png')

    # ── 8. 宿主账户菜单切角色 → 学科组长，班级/年级/列表按新口径重载 ──
    pg.locator('#gn-user').click()
    pg.wait_for_timeout(400)
    pg.locator('#gn-user-menu [data-role="leader"]').click()
    pg.wait_for_timeout(2200)
    chk('角色徽章=学科组长', pg.locator('#gn-role-badge').inner_text() == '学科组长')
    pg.locator('.wb-tab[data-wb="class"]').click()
    pg.wait_for_timeout(2200)
    fc2 = pg.frame_locator('#wb-frame-class')
    chk('组长 R3 含 CR-10 徽章', fc2.locator('.prd-badge[data-prd="CR-10"]').count() == 1)
    pg.screenshot(path='_it_8_class_leader.png')

    # ── 9. 班级报告内点徽章 → 宿主全视口抽屉（嵌入视图内抽屉会被裁，已改路由到宿主） ──
    fc2.locator('.prd-badge[data-prd="RP-01"]').click()
    pg.wait_for_timeout(900)
    chk('班级报告徽章→宿主抽屉打开', pg.locator('#prdDrawer.open').count() == 1)
    chk('班级报告抽屉全高置顶', pg.evaluate("(function(){var d=document.getElementById('prdDrawer').getBoundingClientRect();return d.top<=1 && d.height>=window.innerHeight-2})()"))
    pg.screenshot(path='_it_9_class_drawer.png')
    close_drawer()
    pg.wait_for_timeout(300)

    # ── 10. 年级报告视图 + 徽章 ──
    pg.locator('.wb-tab[data-wb="grade"]').click()
    pg.wait_for_timeout(2400)
    chk('切到年级报告', pg.evaluate("document.querySelector('#wb-tabs .wb-tab.active').dataset.wb === 'grade'"))
    fg = pg.frame_locator('#wb-frame-grade')
    chk('GR-01 徽章可见', fg.locator('.prd-badge[data-prd="GR-01"]').count() == 1)
    pg.screenshot(path='_it_10_grade.png')

    # ── 11. 宿主工作台无 PRD 徽章数据则不报错，抽屉仍可用 ──
    chk('宿主 PRD 入口存在', pg.locator('#prdFab').count() == 1)

    # ── 12. 直链 ?hw=（无 wb）→ 讲评工作台入口（list 独立态「查看详情」跳转） ──
    pg.goto(BASE + PAGE + '?hw=HW-0910-U1', wait_until='domcontentloaded')
    pg.wait_for_timeout(2400)
    chk('直链 hw 进工作台', pg.evaluate("document.querySelector('#wb-tabs .wb-tab.active').dataset.wb === 'workbench'"))
    chk('直链工作台 tab 条显示', pg.locator('#wb-tabs').is_visible())

    b.close()

# ── file:// 冒烟（double-click 场景）：主页加载 + 列表徽章 + 无 pageerror ──
import pathlib
FILE = pathlib.Path(r'F:\07 project\讲评试卷4.0\讲评试卷4.0整合版.html').as_uri()
errs2 = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1600, 'height': 950})
    pg.route('**fonts.googleapis.com/**', lambda r: r.abort())
    pg.route('**fonts.gstatic.com/**', lambda r: r.abort())
    pg.on('pageerror', lambda e: errs2.append(str(e)))
    pg.set_default_timeout(15000)
    pg.goto(FILE, wait_until='domcontentloaded')
    pg.wait_for_timeout(2500)
    chk('file:// 默认列表层级', pg.evaluate("document.body.classList.contains('wb-lv-list')"))
    fl = pg.frame_locator('#wb-frame-list')
    chk('file:// 列表 LP-01 徽章可见', fl.locator('.prd-badge[data-prd="LP-01"]').count() == 1)
    fl.locator('button.act', has_text='班级报告').first.click()
    pg.wait_for_timeout(2500)
    chk('file:// 切到班级报告', pg.evaluate("document.querySelector('#wb-tabs .wb-tab.active').dataset.wb === 'class'"))
    chk('file:// 讲评层级 tab 条显示', pg.locator('#wb-tabs').is_visible())
    fc = pg.frame_locator('#wb-frame-class')
    chk('file:// 班级报告 RP-01 徽章可见', fc.locator('.prd-badge[data-prd="RP-01"]').count() == 1)
    pg.screenshot(path='_it_file_class.png')
    b.close()

print('ERRORS(http):', errs)
print('ERRORS(file):', errs2)
print('WARN/ERR console(http):', [w for w in warns if 'favicon' not in w][:12])
print('TOTAL pass=%d fail=%d' % (len(ok), len(fail)))
for f in fail:
    print('  FAILED:', f)
sys.exit(1 if fail else 0)
