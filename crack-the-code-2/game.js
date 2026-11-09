(() => {
'use strict';
const F=CtcTwo, profiles=CtcProfiles.make(()=>localStorage,{level:'level-2',core:F});
const $=s=>document.querySelector(s), app=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(text,action,primary=false,disabled=false)=>`<button data-action="${action}" ${primary?'class="primary"':''} ${disabled?'disabled':''}>${text}</button>`;
const empty=(step=0)=>({step,picks:[],choice:null,checked:false,confirmed:false,at:0});
let profile=null,state=F.fresh(),m=-1,draft=empty(),message='',muted=false,media=null;
function status(){return `<p class="small muted" role="status">${esc(profiles.warning()||(profile?'Saved in this browser · '+profile.name:'Profiles are stored in this browser.'))}</p>`;}
function save(){if(!profile)return;if(m>=0)state.drafts[m]={...draft,at:Date.now()};state.last=m;state.at=Date.now();state=profiles.save(profile.id,state);}
function stop(){if(media){media.pause();media.remove();media=null;}window.speechSynthesis?.cancel();$('#audio-status').textContent='';}
async function listen(text,slow){
 stop();if(muted||!text)return;
 const status=$('#audio-status'),file=window.CtcTwoClips?.[text];
 if(file){
  const a=new Audio(file);media=a;a.hidden=true;document.body.append(a);a.playbackRate=slow?.8:1;
  try{await a.play();if(media===a)status.textContent=slow?"Playing slowly…":"Playing…";return;}catch(_){if(media!==a)return;}
 }
 try{const u=new SpeechSynthesisUtterance(text);u.lang='en-GB';u.rate=slow?.65:.85;u.onerror=()=>{status.textContent='Audio unavailable. Open the written words or ask a helper.';};speechSynthesis.speak(u);}
 catch(_){status.textContent='Audio unavailable. Open the written words or ask a helper.';}
}
function go(target,resume=true){stop();m=target;draft=resume&&state.drafts[m]?structuredDraft(state.drafts[m]):empty();message='';save();render();app.focus();window.scrollTo?.(0,0);}
function structuredDraft(d){return {...d,picks:[...d.picks]};}
function enter(p){profile=p;state=profiles.state(p.id);go(state.last);}
function welcome(){const list=profiles.list();app.innerHTML=`<section class="welcome"><div><p class="eyebrow">CRACK THE CODE / LEVEL 2</p><h1>The Alien Message<span>.</span></h1><p>A message from space is broken. Repair the sounds, words and sentences to read it.</p></div><img src="assets/alien-message.jpg" alt="A friendly alien sends a signal to Ben and his cat."></section><section class="card"><h2>Your learner profile</h2><p>Choose your profile or enter a first name or nickname.</p><div class="profiles">${list.map((p,i)=>`<button data-profile="${p.id}"><strong>${esc(p.name)}</strong><span>Level 2 · ${profiles.course(p.id)['level-2'].missions}/8 missions${list.filter(x=>x.name.toLowerCase()===p.name.toLowerCase()).length>1?' · Profile '+(i+1):''}</span></button>`).join('')}</div><form><label for="name">Your name</label><div class="row"><input id="name" maxlength="40" required autocomplete="off"><button type="submit" class="primary">Start my game →</button></div><div id="name-feedback" role="status"></div></form><p class="small muted">Use the same browser and device to continue. No online account is needed.</p>${status()}</section>`;}
function map(){const s=F.summary(state),next=F.missions.findIndex((_,i)=>!F.done(state,i));app.innerHTML=`<p class="eyebrow">PART 02 / MISSION MAP</p><h1>The Alien Message</h1><section class="intro"><img src="assets/alien-message.jpg" alt="The alien at the radio with Ben and his cat."><div><h2>Hello, ${esc(profile.name)}.</h2><p>${s.missions} / 8 missions complete · ${s.tasks} / ${F.total} steps</p>${s.completed?'<p class="correct"><strong>Level 2 complete!</strong></p>':`<button class="primary" data-mission="${next}">Continue my game →</button>`}</div></section><div class="mission-grid">${F.all.map((x,i)=>`<button class="mission-card" data-mission="${i}"><span class="eyebrow">${i===8?'EXTRA PRACTICE':'MISSION '+(i+1)}</span><strong>${x.name}</strong><span>${F.done(state,i)?'✓ Complete':state.drafts[i]?'Continue →':'Start →'}</span></button>`).join('')}</div>${status()}`;}
function art(i){return i>=0?`<svg class="word-art" viewBox="${i%4*400} ${Math.floor(i/4)*400} 400 400" role="img" aria-label="${F.wordArt[i]}"><image href="../crack-the-code-1/assets/words.jpg" width="1600" height="800"/></svg>`:'';}
function taskView(){const mission=F.all[m],t=mission.tasks[draft.step];if(!t){app.innerHTML=`<section class="card result"><p class="eyebrow">${mission.name}</p><h1>${m===8?'Homework':'Mission'} complete!</h1><p>Your work is saved for ${esc(profile.name)}.</p><div class="row">${btn('Mission map','map',true)}${btn('Practise again','again')}${m<7?`<button data-mission="${m+1}">Next mission →</button>`:''}</div></section>${status()}`;return;}
 const answered=!t.options&&!t.tiles||draft.checked;
 const options=t.options?CtcOne.shuffle(t.options,m+':'+draft.step).map(({v,i})=>`<button data-option="${i}" aria-pressed="${draft.choice===i}" class="${draft.choice===i?'chosen':''}" ${answered?'disabled':''}>${esc(v)}</button>`).join(''):'';
 const tiles=t.tiles?CtcOne.shuffle(t.tiles,m+':'+draft.step).map(({v,i})=>`<button data-tile="${i}" ${answered||draft.picks.includes(i)?'disabled':''}>${esc(v)}</button>`).join(''):'';
 app.innerHTML=`<div class="task-heading"><p class="eyebrow">${mission.name}</p><span>${draft.step+1} / ${mission.tasks.length}</span></div><section class="card workbench"><h2>${t.prompt}</h2>
 ${t.story?`<div class="story-layout"><img src="../crack-the-code-1/assets/ben-cat.jpg" alt="Ben beside his cat."><div class="story">${F.story.map(line=>`<p>${esc(line)}</p>`).join('')}</div></div>`:''}
 ${art(t.art)}${t.cue?`<p class="cue ${t.cue.length>16?'smaller':''}">${esc(t.cue)}</p>`:''}
 ${options?`<div class="choices" role="group" aria-label="Choose an answer">${options}</div>`:''}
 ${tiles?`<div class="assembly" aria-label="Your answer">${draft.picks.map((i,j)=>`<button data-remove="${j}" ${answered?'disabled':''}>${esc(t.tiles[i])}</button>`).join('')||'Choose cards below.'}</div><p class="small muted">Tap a card to add it. Tap it above to remove it.</p><div class="tiles">${tiles}</div>`:''}
 ${t.audio?`<div class="row">${btn('Listen','listen',false,muted)}${t.transcript?btn('Listen slowly','slow',false,muted):''}</div>`:''}
 ${t.transcript?`<details><summary>Show written words</summary><p>${esc(t.transcript)}</p></details>`:''}
 ${t.model?`<details><summary>${t.confirm&&!t.options?'See a notebook example':'See the sound code'}</summary><p>${esc(t.model)}</p></details>`:''}
 <p class="feedback" role="status">${esc(draft.checked?(t.explain?'Correct. '+t.explain:'Correct!'):message)}</p>
 ${answered&&t.confirm?`<label class="check-label"><input id="confirm" type="checkbox" ${draft.confirmed?'checked':''}> ${t.confirm}</label>`:''}
 <div class="task-controls"><div class="row">${btn('Back','back')}${tiles&&!answered?btn('Clear','clear'):''}</div><div class="row">${answered?(draft.checked?btn('Try again','retry'):'')+btn('Continue →','next',true,!!t.confirm&&!draft.confirmed):btn('Check','check',true)}</div></div></section>${status()}`;
}
function render(){if(!profile)welcome();else if(m<0)map();else taskView();}
function edit(){
 const active=document.activeElement;
 const attr=app.contains(active)&&['data-option','data-tile','data-remove','data-action'].find(k=>active.hasAttribute(k));
 const value=attr?active.getAttribute(attr):null;
 save();render();
 if(attr){const same=app.querySelector('['+attr+'="'+value+'"]:not(:disabled)');
 (same||app.querySelector('[data-action=check], #confirm, [data-action=next]:not(:disabled)')||app).focus({preventScroll:true});}
}
document.addEventListener('submit',e=>{
 if(profile||!app.contains(e.target))return;e.preventDefault();const name=profiles.cleanName($('#name').value);if(!name)return;
 if(profiles.list().some(p=>p.name.toLowerCase()===name.toLowerCase())){$('#name-feedback').innerHTML='<p>Choose the existing profile above or create a separate one.</p>'+btn('Create separate profile','duplicate');return;}
 enter(profiles.create(name));
});
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b||!b.isConnected||b.disabled)return;
 const a=b.dataset.action;
 if(a==='profiles'){stop();profile=null;render();return;}
 if(a==='sound'){muted=!muted;stop();b.textContent=muted?'Unmute audio':'Mute audio';b.setAttribute('aria-pressed',String(muted));if(profile)render();return;}
 if(b.dataset.profile){const p=profiles.list().find(p=>p.id===b.dataset.profile);if(p)enter(p);return;}
 if(a==='duplicate'&&!profile){const name=profiles.cleanName($('#name').value);if(name)enter(profiles.create(name));return;}
 if(!profile)return;
 if(a==='map'){go(-1);return;}
 if(b.dataset.mission!==undefined){go(Number(b.dataset.mission));return;}
 if(a==='again'){go(m,false);return;}
 const t=F.all[m]?.tasks[draft.step];if(!t)return;
 if(a==='listen'||a==='slow'){listen(t.audio,a==='slow');return;}
 if(a==='back'){if(draft.step===0){go(-1);return;}stop();draft=empty(draft.step-1);message='';edit();return;}
 if(a==='next'){
  if((t.options||t.tiles)&&!draft.checked||t.confirm&&!draft.confirmed)return;
  stop();state.completed[m+':'+draft.step]=true;draft=empty(draft.step+1);message='';edit();app.focus();return;
 }
 if(a==='retry'||a==='clear'){draft=empty(draft.step);message='';edit();return;}
 if(draft.checked)return;
 if(a==='check'){draft.checked=F.correct(t,draft.picks,draft.choice);message=draft.checked?'':'Try again. You can change your answer.';edit();return;}
 if(b.dataset.option!==undefined)draft.choice=Number(b.dataset.option);
 else if(b.dataset.tile!==undefined)draft.picks.push(Number(b.dataset.tile));
 else if(b.dataset.remove!==undefined)draft.picks.splice(Number(b.dataset.remove),1);
 else return;
 message='';edit();
});
document.addEventListener('change',e=>{if(e.target.id==='confirm'&&profile){draft.confirmed=e.target.checked;save();app.querySelector('[data-action=next]').disabled=!draft.confirmed;}});
render();
})();
