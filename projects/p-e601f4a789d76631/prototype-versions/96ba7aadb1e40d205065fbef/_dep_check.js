const fs=require('fs');
const src=fs.readFileSync('js/app.js','utf8').split(/\r?\n/);
const main=src.slice(0,5808).join('\n');
const st=src.slice(5809).join('\n');
// 顶层声明（function / const / let / var，行首无缩进）
const decls=[];
main.split(/\r?\n/).forEach((l,i)=>{const m=l.match(/^(?:function\s+([A-Za-z_$][\w$]*)|const\s+([A-Za-z_$][\w$]*)|let\s+([A-Za-z_$][\w$]*)|var\s+([A-Za-z_$][\w$]*))/);if(m){const n=m[1]||m[2]||m[3]||m[4];decls.push({n,line:i+1});}});
const uniq=[...new Map(decls.map(d=>[d.n,d])).values()];
const used=uniq.filter(d=>new RegExp('\\b'+d.n.replace(/\$/g,'\\$')+'\\b').test(st));
console.log('顶层声明总数',uniq.length,'| st 模块引用到的顶层符号数',used.length);
console.log(used.map(d=>d.n+':'+d.line).join('\n'));
