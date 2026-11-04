/* 拆分产物冒烟自检脚本（浏览器内执行，供 agent-browser eval --stdin 使用）
   用法：Get-Content tools/smoke_check.js -Raw | agent-browser eval --stdin */
(() => {
  const sheets = [...document.styleSheets].map((s) => {
    let rules = -1;
    let err = null;
    try { rules = s.cssRules ? s.cssRules.length : -1; } catch (e) { err = String(e).slice(0, 80); }
    return { file: (s.href || 'inline').split('/').pop(), rules, err };
  });

  const canvases = [...document.querySelectorAll('canvas')].map((c) => ({
    id: (c.closest('[id]') || {}).id || '',
    w: c.width,
    h: c.height,
  }));

  const fab = document.getElementById('prdFab');
  const drawer = document.getElementById('prdDrawer');
  const shell = document.querySelector('.app-shell');
  const nav = document.querySelector('.topnav, .navbar, .global-nav, header');

  return {
    sheets,
    echarts: typeof window.echarts,
    echartsVersion: window.echarts && window.echarts.version,
    canvases,
    prdFab: fab && {
      display: getComputedStyle(fab).display,
      position: getComputedStyle(fab).position,
      rect: fab.getBoundingClientRect().toJSON(),
    },
    prdDrawer: drawer && {
      position: getComputedStyle(drawer).position,
      width: getComputedStyle(drawer).width,
      sections: document.getElementById('prdToc') ? document.getElementById('prdToc').children.length : null,
    },
    nav: nav && { tag: nav.tagName, h: nav.getBoundingClientRect().height },
    appShell: shell && { w: Math.round(shell.getBoundingClientRect().width), h: Math.round(shell.getBoundingClientRect().height) },
    fontUsed: getComputedStyle(document.body).fontFamily,
    faLoaded: getComputedStyle(document.documentElement).getPropertyValue('--fa-style-family') !== '',
    iconGlyph: (() => {
      const i = document.querySelector('.fa-solid, .fas');
      if (!i) return null;
      const cs = getComputedStyle(i, '::before');
      return { family: cs.fontFamily, content: cs.content };
    })(),
  };
})()
