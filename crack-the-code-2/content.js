var CtcTwo = (() => {
const ipa={cat:'/kæt/',bat:'/bæt/',hat:'/hæt/',mat:'/mæt/',bag:'/bæg/',big:'/bɪg/',pig:'/pɪg/',dig:'/dɪg/',pen:'/pen/',ten:'/ten/',men:'/men/',hen:'/hen/',sun:'/sʌn/',run:'/rʌn/',fun:'/fʌn/',bun:'/bʌn/',bed:'/bed/',bad:'/bæd/',sit:'/sɪt/',set:'/set/',pin:'/pɪn/',pan:'/pæn/',cup:'/kʌp/',cap:'/kæp/',red:'/red/',rid:'/rɪd/',ship:'/ʃɪp/',fish:'/fɪʃ/',dog:'/dɒg/',van:'/væn/',zim:'/zɪm/',dap:'/dæp/',teg:'/teg/',vun:'/vʌn/',lat:'/læt/',pem:'/pem/',bif:'/bɪf/',sut:'/sʌt/'};
const pairQuestions=[['cat','cat','SAME'],['bag','big','DIFFERENT'],['pen','pin','DIFFERENT'],['sun','sun','SAME'],['bed','bad','DIFFERENT'],['sit','sit','SAME'],['cup','cap','DIFFERENT'],['man','men','DIFFERENT'],['pig','pig','SAME'],['run','sun','DIFFERENT']];
const families=[{end:'at',words:['cat','bat','hat','mat'],target:'hat'},{end:'ig',words:['big','pig','dig'],target:'pig'},{end:'en',words:['pen','ten','men','hen'],target:'hen'},{end:'un',words:['sun','run','fun','bun'],target:'fun'}];
const alien=[['cat',true],['zim',false],['bus',true],['dap',false],['pen',true],['teg',false],['sun',true],['vun',false],['fish',true],['bif',false]];
const repairs=[['c_t','cat','a'],['p_g','pig','i'],['s_n','sun','u'],['b_d','bed','e'],['b_g','bag','a'],['p_n','pen','e'],['c_p','cup','u'],['r_d','red','e']];
const silly=[['The','pig','is','on','the','bed.'],['A','cat','can','sit.'],['The','bug','is','in','a','bag.'],['Ben','has','a','red','hat.'],['A','man','can','run.'],['The','dog','is','big.']];
const traps=[['cat','/kæt/',true],['pig','/peg/',false],['bed','/bed/',true],['sun','/sɪn/',false],['bag','/bæg/',true],['sit','/set/',false],['pen','/pen/',true],['cup','/kæp/',false]];
const story=['Ben has a cat.','The cat is big.','The cat can run.','Ben has fun.'];
const vowels=[['A','/æ/','cat'],['I','/ɪ/','pig'],['E','/e/','bed'],['U','/ʌ/','sun']];
const wordArt=['cat','bed','pig','sun','bag','pen','cup','hat'];
const choose=(prompt,cue,options,answer,extra={})=>({prompt,cue,options,answer,...extra});
const build=(prompt,cue,tiles,extra={})=>({prompt,cue,tiles,answer:tiles,...extra});
const write=(prompt,model)=>({prompt,model,confirm:'I finished and checked my notebook work.'});
const missions=[
 {name:'Incoming Signal',tasks:[false,true].flatMap(letters=>vowels.map(v=>choose('Match the letter and the sound.',v[letters?0:1],vowels.map(x=>x[letters?1:0]),v[letters?1:0],{audio:v[2]})))},
 {name:'Same or Different?',tasks:pairQuestions.map(([a,b,answer])=>choose('Listen to two words. Are they the same?','',['SAME','DIFFERENT'],answer,{audio:a+'. '+b,transcript:a+' — '+b}))},
 {name:'Word Families',tasks:[...families.map(f=>build('Build the word '+f.target.toUpperCase()+'.','Family: -'+f.end+' · '+f.words.join(' · '),f.target.split(''),{audio:f.target,art:wordArt.indexOf(f.target)})),write('Write one word from each family and its sound code.','cat /kæt/ · pig /pɪg/ · pen /pen/ · sun /sʌn/')]},
 {name:'Alien Dictionary',tasks:alien.map(([w,real])=>choose('Read aloud. Is this a real English word in this game?',w,['REAL','ALIEN'],real?'REAL':'ALIEN',{audio:real?w:null,model:ipa[w]||({bus:'/bʌs/'})[w],confirm:'I read the word aloud.'}))},
 {name:'Repair the Words',tasks:[...repairs.map(([cue,w,v])=>choose('Choose the missing vowel.',cue,['A','E','I','U'],v.toUpperCase(),{audio:w,art:wordArt.indexOf(w),explain:w+' '+ipa[w]})),write('Write four repaired words. Underline the vowel in each.','cat · pig · sun · bed · bag · pen · cup · red')]},
 {name:'Silly Sentence Machine',tasks:[...silly.map(words=>build('Put the words in order.','',words,{audio:words.join(' '),confirm:'I read the sentence aloud.'})),write('Write two sentences from this mission and read them aloud.','The pig is on the bed. / A cat can sit.')]},
 {name:'Robot Error',tasks:traps.map(([w,code,ok])=>choose('Does the sound code match the word?',w+' — '+code,['RIGHT','WRONG'],ok?'RIGHT':'WRONG',{audio:w,explain:w+' '+ipa[w]}))},
 {name:'The Final Message',tasks:[
 {prompt:'Read the message aloud.',story:true,audio:story.join(' '),confirm:'I read the message aloud.'},
 choose('Who has a cat?','',['Ben','The dog','The alien'],'Ben',{story:true}),
 choose('Can the cat run?','',['YES','NO'],'YES',{story:true}),
 build('Build the final word from these sounds.','',['f','u','n'],{audio:'fun'}),
 write('Write one sentence from the story and the sound code for cat.','Ben has a cat. · cat /kæt/')
 ]}
];
const homework={name:'Homework',tasks:[...['cat','pig','sun','bed','fish'].map((w,i,a)=>choose('Choose the sound code.',w,[ipa[w],ipa[a[(i+1)%a.length]],ipa[a[(i+2)%a.length]]],ipa[w],{audio:w})),write('Write the five words and their sound codes. Read them aloud.','cat /kæt/ · pig /pɪg/ · sun /sʌn/ · bed /bed/ · fish /fɪʃ/')]};
const all=[...missions,homework];
const fresh=()=>({completed:{},drafts:{},last:-1,at:0});
function restore(raw){
 const s=fresh();
 for(const [m,mission] of all.entries()){
  const tasks=mission.tasks;
  for(const [n,t] of tasks.entries())if(raw?.completed?.[m+':'+n]===true)s.completed[m+':'+n]=true;
  const d=raw?.drafts?.[m];if(!d)continue;
  const first=tasks.findIndex((_,n)=>!s.completed[m+':'+n]);
  const step=Number.isInteger(d.step)&&d.step>=0?Math.min(d.step,first<0?tasks.length:first):0;
  const t=tasks[step];
  const picks=step===d.step&&Array.isArray(d.picks)?[...new Set(d.picks.filter(i=>Number.isInteger(i)&&i>=0&&i<(t?.tiles?.length||0)))]:[];
  const choice=step===d.step&&Number.isInteger(d.choice)&&d.choice>=0&&d.choice<(t?.options?.length||0)?d.choice:null;
  s.drafts[m]={step,picks,choice,checked:step===d.step&&d.checked===true&&correct(t,picks,choice),confirmed:step===d.step&&!!t?.confirm&&d.confirmed===true,at:Number.isFinite(d.at)?d.at:0};
 }
 if(Number.isInteger(raw?.last)&&raw.last>=-1&&raw.last<all.length)s.last=raw.last;
 s.at=Number.isFinite(raw?.at)?raw.at:0;
 return s;
}
function correct(t,picks,choice){return !!t&&(t.options?t.options[choice]===t.answer:t.tiles?picks.length===t.answer.length&&picks.every((i,j)=>t.tiles[i]===t.answer[j]):true);}
function merge(a,b){
 a=restore(a);b=restore(b);
 const next={...b,completed:{...a.completed,...b.completed}};
 for(const [m,d] of Object.entries(a.drafts))if(!b.drafts[m]||d.at>b.drafts[m].at)next.drafts[m]=d;
 if(a.at>b.at){next.last=a.last;next.at=a.at;}
 return restore(next);
}
const done=(s,m)=>all[m].tasks.every((_,n)=>s.completed[m+':'+n]);
function summary(s){const n=missions.filter((_,m)=>done(s,m)).length;return {missions:n,tasks:missions.reduce((sum,x,m)=>sum+x.tasks.filter((_,i)=>s.completed[m+':'+i]).length,0),completed:n===missions.length,homework:done(s,8)};}
return {total:missions.reduce((n,m)=>n+m.tasks.length,0),missions,homework,all,wordArt,story,fresh,restore,merge,summary,done,correct};
})();
