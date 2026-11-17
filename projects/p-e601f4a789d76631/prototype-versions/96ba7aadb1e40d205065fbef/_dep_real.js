const fs=require('fs');
const src=fs.readFileSync('js/app.js','utf8').split(/\r?\n/);
const main=src.slice(0,5808), st=src.slice(5809);
const decls=[];
main.forEach((l,i)=>{const m=l.match(/^(?:function\s+([A-Za-z_$][\w$]*)|const\s+([A-Za-z_$][\w$]*)|let\s+([A-Za-z_$][\w$]*)|var\s+([A-Za-z_$][\w$]*))/);if(m){const n=m[1]||m[2]||m[3]||m[4];decls.push({n,line:i+1,body:l});}});
const uniq=[...new Map(decls.map(d=>[d.n,d])).values()];
const hits={};
st.forEach((l,i)=>{
  const code=l.replace(/\/\/.*$/,'').replace(/\/\*[\s\S]*?\*\//g,'');
  if(!code.trim()) return;
  for(const d of uniq){
    if(new RegExp('(^|[^\\w$.])'+d.n.replace(/\$/g,'\\$')+'(?![\\w$])').test(code)){
      (hits[d.n]=hits[d.n]||[]).push(i+5810+':'+code.trim().slice(0,110));
    }
  }
});
console.log('真实引用符号数：',Object.keys(hits).length);
for(const [k,v] of Object.entries(hits)){console.log('\n### '+k+'  ('+uniq.find(d=>d.n===k).line+' 定义)  出现'+v.length+'次');v.slice(0,4).forEach(x=>console.log('   '+x));}
