const fs=require('fs');
const lines=fs.readFileSync('js/app.js','utf8').split(/\r?\n/);
const st=lines.slice(5808).join('\n');
['drill','Drill','practice','Practice','组卷','加练','生成题目','mockQuestion','PRACTICE_STEM'].forEach(k=>{
  const hits=st.split(/\r?\n/).map((l,i)=>[i+5809,l]).filter(([,l])=>l.includes(k));
  console.log(k+': '+hits.length+(hits.length?' | '+hits.slice(0,3).map(([n,l])=>n+':'+l.trim().slice(0,90)).join(' || '):''));
});
