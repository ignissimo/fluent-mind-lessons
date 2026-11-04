/* Shared, pure Level 1 content and save rules. No rewards or fabricated course completion. */
var CtcOne = (() => {
 const vowels=[['A','/æ/','cat'],['E','/e/','bed'],['I','/ɪ/','pig'],['U','/ʌ/','sun']];
 const names=['Sound Scanner','Sound Bingo','Word Machine','Alien Decoder','Robot Error','Missing Vowel','Sentence Lab','Final Vault'];
 const words=[['cat','/kæt/'],['bed','/bed/'],['pig','/pɪg/'],['sun','/sʌn/'],['bag','/bæg/'],['pen','/pen/'],['cup','/kʌp/'],['hat','/hæt/']];
 const aliens=[['zim','/zɪm/','pig'],['dap','/dæp/','cat'],['teg','/teg/','bed'],['vun','/vʌn/','sun'],['lat','/læt/','cat'],['pem','/pem/','bed'],['bif','/bɪf/','pig'],['sut','/sʌt/','sun']];
 const robots=[['cat','/kæt/',true],['bed','/bɪd/',false],['pig','/pɪg/',true],['sun','/sæn/',false],['bag','/bæg/',true],['pen','/pɪn/',false],['cup','/kʌp/',true],['sit','/set/',false]];
 const fixes=['/kæt/','/bed/','/pɪg/','/sʌn/','/bæg/','/pen/','/kʌp/','/sɪt/'];
 const sentences=['The cat is big.','A man can run.','Ben has a red bag.','The pig can sit.','The sun is up.','The bus is red.'];
 const story='Ben has a cat. The cat is big. The cat can run. Ben has fun.';
 const questions=[['Who has a cat?',['Ben','Sam','The pig'],'Ben'],['Is the cat big?',['Yes','No'],'Yes'],['What can the cat do?',['run','fly','swim'],'run'],['What does Ben have?',['a cat','a bus','a cup'],'a cat']];
 const grid=['A','I','E','U','A','U','E','A','I','E','I','A','U','E','I','E','U','I','A','U','A','E','U','I','A'];
 const totals=[8,2,8,8,8,8,6,4];
 const fresh=()=>({version:1,tasks:{},checkpoints:{},last:{mission:-1,at:0},homework:{answers:{},written:false,at:0}});
 function task(m,n){if(!Number.isInteger(m)||!Number.isInteger(n)||m<0||m>7||n<0||n>=totals[m])return null;
 if(m===0){const v=vowels[n%4];return {kind:'choice',prompt:'Match the letter and the sound code.',cue:n<4?v[0]:v[1],options:vowels.map(x=>x[n<4?1:0]),answer:[v[n<4?1:0]],listen:v[2]};}
 if(m===1)return {kind:'bingo',prompt:n?'Read the IPA. Say the letter.':'Read the letter. Say its sound.',grid:n?grid.map(x=>vowels.find(v=>v[0]===x)[1]):grid,answer:[]};
 if(m===2)return {kind:'build',prompt:'Build the word. Then read it.',word:words[n][0],ipa:words[n][1],tiles:(words[n][0]+'x').split(''),answer:words[n][0].split(''),listen:words[n][0],art:n};
 if(m===3)return {kind:'alien',prompt:'Read this made-up word. Sound it out, then blend.',cue:aliens[n][0],ipa:aliens[n][1],listen:aliens[n][2],answer:[]};
 if(m===4)return {kind:'choice',prompt:'Does the sound code match the word?',cue:robots[n][0]+' — '+robots[n][1],options:['RIGHT','WRONG'],answer:[robots[n][2]?'RIGHT':'WRONG'],listen:robots[n][0],repair:robots[n][0]+' '+fixes[n]};
 if(m===5)return {kind:'choice',prompt:'Choose the vowel. Write the whole word.',cue:words[n][0][0]+'_'+words[n][0].slice(2),options:['A','E','I','U'],answer:[words[n][0][1].toUpperCase()],listen:words[n][0],word:words[n][0],ipa:words[n][1],art:n,written:true};
 if(m===6)return {kind:'sentence',prompt:'Build the sentence. Then read it aloud.',cue:'Put the words in order.',tiles:sentences[n].split(' '),answer:sentences[n].split(' '),listen:sentences[n],read:true};
 const q=questions[n];return {kind:'choice',prompt:q[0],cue:'Read the story to find the answer.',options:q[1],answer:[q[2]],listen:story,written:n===3};
 }
 const line=marks=>{if(!Array.isArray(marks))return false;const set=new Set(marks.filter(v=>Number.isInteger(v)&&v>=0&&v<25));const rows=Array.from({length:5},(_,r)=>Array.from({length:5},(_,c)=>r*5+c));const cols=Array.from({length:5},(_,c)=>Array.from({length:5},(_,r)=>r*5+c));return [...rows,...cols,[0,6,12,18,24],[4,8,12,16,20]].some(a=>a.every(n=>set.has(n)));};
 const equal=(a,b)=>Array.isArray(a)&&a.length===b.length&&a.every((x,i)=>x===b[i]);
 function record(s,m,n,answer,meta={}){const t=task(m,n);if(!t)return false;const ok=t.kind==='bingo'?line(answer)&&meta.read===true:t.kind==='alien'?meta.read===true:equal(answer,t.answer);if(!ok)return false;if(t.read&&meta.read!==true||t.written&&meta.written!==true)return false;
 const key=m+':'+n;if(!s.tasks[key])s.tasks[key]={ok:true,kind:t.kind==='alien'||t.kind==='bingo'?'self-report':'checked',at:Date.now(),read:!!(t.read||t.kind==='alien'||t.kind==='bingo'),written:!!t.written,...(t.kind==='bingo'?{marks:[...new Set(answer)]}:{})};return true;}
 function missionDone(s,m){return Number.isInteger(m)&&m>=0&&m<8&&Array.from({length:totals[m]},(_,n)=>!!s.tasks[m+':'+n]).every(Boolean);}
 function summary(s){const done=names.filter((_,m)=>missionDone(s,m)).length;return {missions:done,totalMissions:8,tasks:Object.keys(s.tasks).length,totalTasks:52,completed:done===8,homework:homeworkDone(s)};}
 function homeworkDone(s){return ['cat','bed','pig','sun','pen'].every((v,i)=>s.homework.answers[i]===v)&&s.homework.written===true;}
 const obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
 function restore(v){const s=fresh();if(!obj(v))return s;
 if(obj(v.tasks))for(let m=0;m<8;m++)for(let n=0;n<totals[m];n++){const k=m+':'+n,x=v.tasks[k],t=task(m,n);if(!obj(x)||x.ok!==true||t.read&&!x.read||t.written&&!x.written)continue;if((t.kind==='alien'||t.kind==='bingo')&&x.read!==true||t.kind==='bingo'&&!line(x.marks))continue;s.tasks[k]={ok:true,kind:t.kind==='alien'||t.kind==='bingo'?'self-report':'checked',at:Number.isFinite(x.at)&&x.at>0?x.at:1,read:!!x.read,written:!!x.written,...(t.kind==='bingo'?{marks:x.marks.filter(i=>Number.isInteger(i)&&i>=0&&i<25)}:{})};}
 if(obj(v.checkpoints))for(let m=0;m<8;m++){const c=v.checkpoints[m];if(!obj(c))continue;let n=Number.isInteger(c.step)&&c.step>=0&&c.step<=totals[m]?c.step:0;for(let i=0;i<n;i++)if(!s.tasks[m+':'+i]){n=i;break;}const t=task(m,n);const seen=new Set();const picked=Array.isArray(c.picked)&&t?.tiles?c.picked.filter(i=>Number.isInteger(i)&&i>=0&&i<t.tiles.length&&!seen.has(i)&&(seen.add(i),true)):[];s.checkpoints[m]={step:n,picked,marks:Array.isArray(c.marks)?[...new Set(c.marks.filter(i=>Number.isInteger(i)&&i>=0&&i<25))]:[],choice:typeof c.choice==='string'&&t?.options?.includes(c.choice)?c.choice:null,checked:c.checked===true,read:c.read===true,written:c.written===true,at:Number.isFinite(c.at)&&c.at>0?c.at:1};}
 if(obj(v.last)&&Number.isInteger(v.last.mission)&&v.last.mission>=-1&&v.last.mission<=9)s.last={mission:v.last.mission,at:Number.isFinite(v.last.at)?v.last.at:0};
 if(obj(v.homework)){if(obj(v.homework.answers))for(let i=0;i<5;i++){const a=v.homework.answers[i];if(['cat','bed','pig','sun','pen'].includes(a))s.homework.answers[i]=a;}s.homework.written=v.homework.written===true;s.homework.at=Number.isFinite(v.homework.at)?v.homework.at:0;}
 return s;}
 function merge(a,b){a=restore(a);b=restore(b);const s=fresh();s.tasks={...a.tasks,...b.tasks};for(let m=0;m<8;m++){const x=a.checkpoints[m],y=b.checkpoints[m];if(x||y)s.checkpoints[m]=x&&(!y||x.at>y.at)?x:y;}s.last=a.last.at>b.last.at?a.last:b.last;s.homework=a.homework.at>b.homework.at?a.homework:b.homework;return restore(s);}
 const shuffle=(values,key)=>{let seed=2166136261;for(const c of key)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;const a=values.map((v,i)=>({v,i}));for(let i=a.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
 return {vowels,names,words,aliens,totals,sentences,story,task,fresh,record,restore,merge,line,missionDone,summary,homeworkDone,equal,shuffle};
})();
