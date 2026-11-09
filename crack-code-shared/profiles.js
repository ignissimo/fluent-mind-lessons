/* Device-local course profiles. Identity is an ID, never a name match. */
var CtcProfiles = (() => {
 const INDEX='fma-ctc:learners:v1';const validId=id=>typeof id==='string'&&/^p_[a-zA-Z0-9_-]{8,80}$/.test(id);
 const cleanName=value=>typeof value==='string'?value.normalize('NFC').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,40):'';
 function make(storageGetter,{level="level-1",core=CtcOne}={}){const memory=new Map(),pending=new Set();let warning='';
 const temporary=()=>{warning='Saving is not available. Your work stays in this tab only. Keep the tab open.';};
 function read(key,fallback,latest=false){let text;try{text=!latest&&pending.has(key)?memory.get(key):storageGetter().getItem(key);}catch(_){temporary();text=memory.get(key);}if(!text)return fallback;
 try{const value=JSON.parse(text);if(!pending.has(key))memory.set(key,text);return value;}catch(_){warning='One saved record is damaged. Other learner profiles stay separate. A recovery copy is kept when possible.';try{const db=storageGetter();if(!db.getItem(key+':recovery'))db.setItem(key+':recovery',text);}catch(_){}return fallback;}}
 function write(key,value){const text=JSON.stringify(value);memory.set(key,text);try{storageGetter().setItem(key,text);pending.delete(key);}catch(_){pending.add(key);temporary();}}
 function list(){const v=read(INDEX,[]);if(!Array.isArray(v))return [];return v.filter(x=>x&&validId(x.id)&&cleanName(x.name)).map(x=>({id:x.id,name:cleanName(x.name),createdAt:typeof x.createdAt==='string'?x.createdAt:''})).filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i);}
 function create(name){name=cleanName(name);if(!name)throw Error('Please enter your name.');const id='p_'+(globalThis.crypto?.randomUUID?crypto.randomUUID():Date.now().toString(36)+'_'+Math.random().toString(36).slice(2));const p={id,name,createdAt:new Date().toISOString()};write(INDEX,[...list(),p]);return p;}
 function key(id){if(!validId(id)||!list().some(x=>x.id===id))throw Error('Please choose a learner.');return 'fma-ctc:learner:'+id+':course:v1';}
 function state(id){const r=read(key(id),{});return core.restore(r?.levels?.[level]);}
 function save(id,value){const k=key(id),queued=pending.has(k)?read(k,{}):null,old=read(k,{},true),next=core.merge(core.merge(old?.levels?.[level],queued?.levels?.[level]),value),summary=core.summary(next);const course={...(old?.course&&typeof old.course==='object'?old.course:{}),[level]:{completed:summary.completed,missions:summary.missions,tasks:summary.tasks,completedAt:summary.completed?(old?.course?.[level]?.completedAt||new Date().toISOString()):null}};
 write(k,{version:1,updatedAt:new Date().toISOString(),levels:{...(old?.levels&&typeof old.levels==='object'?old.levels:{}),[level]:next},course});return next;}
 function course(id){const v=read(key(id),{}),summary=core.summary(core.restore(v?.levels?.[level]));return {[level]:{completed:summary.completed,missions:summary.missions,tasks:summary.tasks,completedAt:summary.completed?v.course?.[level]?.completedAt||null:null}};}
 return {list,create,state,save,course,warning:()=>warning,cleanName};}
 return {make,INDEX};
})();
