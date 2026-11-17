const fs=require('fs');
const lines=fs.readFileSync('js/app.js','utf8').split(/\r?\n/);
const syms=['initTreeChart','init(','switchView','refreshActiveTabCharts','renderKgAch','renderKgEvidenceOverview','renderTeachAdviceSummary','openRelDiagDrawer','renderSourceColumn','timeScopeText','confirmMastery','currentTableRows','exportCurrentTable','kgRender','kgRenderModules','dirStateOf','refreshViewsForDir','showProtoToast','causeMatrix','STUDENTS'];
for(let i=5813;i<lines.length;i++){
  const l=lines[i];
  for(const s of syms){ if(l.includes(s)) { console.log((i+1)+' ['+s+'] '+l.trim().slice(0,150)); break; } }
}
