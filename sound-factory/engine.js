/* Pure validation/state helpers; no storage or DOM dependency. */
(() => {
 const F=Factory,all=[...F.modules,F.homework],tasks=all.flatMap(m=>m.tasks),ids=new Set(tasks.map(t=>t.id));
 F.fresh=()=>({version:1,module:0,index:0,view:'menu',solved:{},assisted:{},attempts:{},notebooks:{},drafts:{},read:{},revealed:{},songSeen:false});
 F.correct=(t,a)=>{if(!Array.isArray(a)||a.length!==t.answer.length)return false;if(t.kind==='multi')return new Set(a).size===a.length&&t.answer.every(v=>a.includes(v));return a.every((v,i)=>v===t.answer[i]);};
 F.record=(s,module,t,a)=>{if(!ids.has(t.id))return false;s.attempts[t.id]=(s.attempts[t.id]||0)+1;if(!F.correct(t,a))return false;if(s.revealed[t.id]){F.assist(s,t);return true;}s.solved[t.id]=true;delete s.assisted[t.id];return true;};
 F.assist=(s,t)=>{if(ids.has(t.id)&&!s.solved[t.id])s.assisted[t.id]=true;};
 F.done=(s,m)=>m.tasks.every(t=>s.solved[t.id]||s.assisted[t.id])&&(!m.notebook||s.notebooks[m.id]===true);
 F.stats=(s,home=false)=>{const ms=home?[F.homework]:F.modules;const ts=ms.flatMap(m=>m.tasks),solved=ts.filter(t=>s.solved[t.id]).length,assisted=ts.filter(t=>!s.solved[t.id]&&s.assisted[t.id]).length,notebooks=ms.filter(m=>m.notebook&&s.notebooks[m.id]).length;const collected=new Set(ts.filter(t=>s.solved[t.id]).flatMap(t=>F.words.filter(w=>[t.listen,t.word,...t.answer].some(v=>typeof v==='string'&&v.toLowerCase().split(/[^a-z]+/).includes(w.word))).map(w=>w.word)));return {solved,assisted,notebooks,words:collected.size,xp:solved*10+notebooks*5,completed:ms.filter(m=>F.done(s,m)).length,total:ts.length,progress:Math.round(100*(solved+assisted)/(ts.length||1))};};
 F.restore=v=>{const s=F.fresh();if(!v||typeof v!=='object'||Array.isArray(v))return s;s.module=Number.isInteger(v.module)&&v.module>=0&&v.module<=6?v.module:0;s.index=Number.isInteger(v.index)&&v.index>=0&&v.index<=20?v.index:0;s.view=['menu','task','results','notebook','song'].includes(v.view)?v.view:'menu';s.songSeen=v.songSeen===true;
 for(const key of ['solved','assisted','read','revealed'])if(v[key]&&typeof v[key]==='object'&&!Array.isArray(v[key]))for(const t of tasks)if(v[key][t.id]===true)s[key][t.id]=true;
 if(v.notebooks&&typeof v.notebooks==='object')for(const m of all)if(m.notebook&&v.notebooks[m.id]===true)s.notebooks[m.id]=true;
 if(v.attempts&&typeof v.attempts==='object')for(const t of tasks)if(Number.isInteger(v.attempts[t.id])&&v.attempts[t.id]>0)s.attempts[t.id]=Math.min(v.attempts[t.id],10000);
 if(v.drafts&&typeof v.drafts==='object')for(const t of tasks){const d=v.drafts[t.id];if(Array.isArray(d)&&d.length<=40&&d.every(x=>typeof x==='string'&&x.length<=100))s.drafts[t.id]=d;}
 return s;};
 F.shuffle=(items,key)=>{let n=2166136261;for(const c of key)n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;const a=items.map((v,i)=>({v,i}));for(let i=a.length-1;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const j=n%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
})();
