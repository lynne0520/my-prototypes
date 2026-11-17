const fs=require('fs');
const lines=fs.readFileSync('js/app.js','utf8').split(/\r?\n/);
const MAIN_END=5808;
// 建立顶层声明块
const decls=[];
for(let i=0;i<MAIN_END;i++){
  const m=lines[i].match(/^(?:function\s+([A-Za-z_$][\w$]*)|const\s+([A-Za-z_$][\w$]*)|let\s+([A-Za-z_$][\w$]*)|var\s+([A-Za-z_$][\w$]*))/);
  if(!m) continue;
  const name=m[1]||m[2]||m[3]||m[4];
  let end=i;
  if(/^function/.test(lines[i])){
    let depth=0,started=false;
    for(let j=i;j<MAIN_END;j++){
      for(const ch of lines[j]){ if(ch==='{'){depth++;started=true;} else if(ch==='}'){depth--;} }
      if(started&&depth<=0){end=j;break;}
    }
  } else {
    for(let j=i;j<MAIN_END;j++){ if(/;\s*$/.test(lines[j])){end=j;break;} end=j; }
  }
  decls.push({name,start:i,end});
}
// 去重（同名只留首个）
const seen=new Set(); const uniq=[];
for(const d of decls){ if(!seen.has(d.name)){seen.add(d.name);uniq.push(d);} }
const byName=new Map(uniq.map(d=>[d.name,d]));
// st 模块真实引用
const stLines=lines.slice(MAIN_END);
const stCode=stLines.map(l=>l.replace(/\/\/.*$/,'').replace(/\/\*[\s\S]*?\*\//g,'')).join('\n');
const roots=uniq.filter(d=>new RegExp('(^|[^\\w$.])'+d.name.replace(/\$/g,'\\$')+'(?![\\w$])').test(stCode)).map(d=>d.name);
// 递归闭包
const keep=new Set(); const queue=[...roots];
while(queue.length){
  const n=queue.pop(); if(keep.has(n)||!byName.has(n)) continue; keep.add(n);
  const d=byName.get(n);
  const body=lines.slice(d.start,d.end+1).join('\n');
  for(const o of uniq){ if(o.name===n) continue;
    if(new RegExp('(^|[^\\w$.])'+o.name.replace(/\$/g,'\\$')+'(?![\\w$])').test(body)) { if(!keep.has(o.name)) queue.push(o.name); }
  }
}
let total=0; const kept=[...keep].map(n=>byName.get(n)).sort((a,b)=>a.start-b.start);
kept.forEach(d=>{total+=d.end-d.start+1;});
console.log('根引用:',roots.length,'| 闭包需保留顶层声明:',kept.length,'| 行数:',total,'/ 主模块',MAIN_END,'行',(total/MAIN_END*100).toFixed(1)+'%');
console.log('可删:',MAIN_END-total,'行');
console.log('\n需保留清单：'); console.log(kept.map(d=>d.name+'['+(d.start+1)+'-'+(d.end+1)+']').join(' '));
