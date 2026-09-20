'use strict';
const TICK_MS=10000;
let S=null,speed=1,timer=null,currentPage='home',selectedScript=null,selectedProjectId=null,pauseBefore=null,modalDepth=0,idSeq=0,newsRev=0,lastNewsRev=-1,saveWarned=false,activeEvent=null;
const $=id=>document.getElementById(id),clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const NF=new Intl.NumberFormat('zh-CN'),money=n=>`${n<0?'-':''}¥${NF.format(Math.abs(Math.round(n)))}`;
const safe=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const nextId=()=>++idSeq,studio=()=>STUDIOS[clamp(S.studio,0,STUDIOS.length-1)],stamp=(y=S.year,m=S.month)=>y*12+(m-1);
const stampDate=n=>({year:Math.floor(n/12),month:n%12+1}),stampLabel=n=>{const d=stampDate(n);return `${d.year}年${d.month}月`};
const seasonOf=m=>SEASONS[m]||[1,'平常档期'],seasonAt=st=>seasonOf(stampDate(st).month);
const projectById=id=>S.projects.find(p=>p.id===id),teamOf=p=>(p?.team||[]).map(id=>S.staff.find(e=>e.id===id)).filter(Boolean);
const audienceTotal=()=>Object.values(S.audiences).reduce((a,b)=>a+(+b||0),0),payroll=()=>S.staff.reduce((a,e)=>a+e.salary,0),monthlyBurn=()=>payroll()+Math.round(studio().rent*(S.flags&&S.flags.rentUp?1.2:1));
const qualityGrid=get=>`<div class="qualities">${QUALITIES.map(([k,label])=>`<div>${label}<b>${get(k)}</b></div>`).join('')}</div>`;
const audienceFit=(script,target)=>audienceDefs[target].likes.includes(script.genre)||audienceDefs[target].likes.includes(script.theme);

function freshName(used){const pool=names.filter(n=>!used.has(n));if(pool.length)return pool[rnd(0,pool.length-1)];for(let i=2;i<500;i++){const c=names[rnd(0,names.length-1)]+i;if(!used.has(c))return c}return '新人'+rnd(1000,9999)}
function person(name,role,boost=0){const x={story:rnd(28,48),vision:rnd(28,48),performance:rnd(25,45),visual:rnd(28,48),management:rnd(25,45)};x[roles[role][1]]+=22+boost;return{id:nextId(),name,role,level:1,salary:rnd(52000,76000),energy:100,xp:0,stats:x,status:null,trait:traits[rnd(0,traits.length-1)],face:pickFace(role,false)}}
function makeStar(used){const name=freshName(used),role=Math.random()<.5?'actor':['director','writer','camera'][rnd(0,2)],e=person(name,role,20);e.star=true;e.face=pickFace(role,true);e.aura=rnd(8,16);e.starTrait=Object.keys(starTraits)[rnd(0,3)];e.salary=Math.round(e.salary*2.4);Object.keys(e.stats).forEach(k=>e.stats[k]+=rnd(4,10));return e}
const pairKey=(a,b)=>a<b?a+'-'+b:b+'-'+a;
function teamChemistry(team){let n=0;for(let i=0;i<team.length;i++)for(let j=i+1;j<team.length;j++)if((S.chemistry[pairKey(team[i].id,team[j].id)]||0)>=2)n++;return n}
function makeTitle(used){
  const pick=a=>a[rnd(0,a.length-1)];
  for(let i=0;i<240;i++){
    const r=Math.random();
    const t=r<.16?pick(titles)
      :r<.42?`${pick(TI_MOD)}的${pick(TI_NOUN)}`
      :r<.62?`${pick(TI_TIME)}${pick(TI_TAIL)}`
      :r<.8?`${pick(TI_NUM)}${pick(TI_PLACE)}`
      :`${pick(TI_PLACE)}${pick(TI_VP)}`;
    if(!used.has(t))return t;
  }
  return `无名之作 ${rnd(100,999)}`;
}
function makeScript(used){const genre=genres[rnd(0,genres.length-1)],theme=themes[rnd(0,themes.length-1)];const title=makeTitle(used);used.add(title);return{id:'s'+nextId(),title,genre,theme,story:rnd(48,82),heat:rnd(35,80),cost:rnd(9,42)*10000,relation:'original',ipId:null,logline:(LOGLINES[theme]||[`一个关于${theme}的${genre}故事。`])[rnd(0,(LOGLINES[theme]||[0]).length-1)]}}
function makeScripts(n,existing){const used=new Set(existing.map(s=>s.title)),out=[];if(typeof S!=='undefined'&&S){(S.works||[]).forEach(w=>used.add(w.name));(S.ips||[]).forEach(i=>used.add(i.name));(S.projects||[]).forEach(p=>used.add(p.name))}while(out.length<n)out.push(makeScript(used));return out}
function trendNow(){const t=trends[rnd(0,trends.length-1)];return{name:t[0],desc:t[1],weeks:rnd(12,20)}}
function makeRivals(){return rivalTemplates.map((r,i)=>({id:'r'+(i+1),name:r[0],style:r[1],focusGenre:r[2],target:r[3],strength:r[4],value:6500000+r[4]*110000,fame:r[4]/10,prestige:rnd(2,16),audience:300+r[4]*5,hits:0,nextStamp:stamp(2026,rnd(2,6))+i%2,nextGenre:Math.random()<.7?r[2]:genres[rnd(0,genres.length-1)]}))}
function fresh(origin='tv'){idSeq=20;const o=ORIGINS[origin]||ORIGINS.tv;let team=[person('沈望','producer',8),person('程屿','director',7),person('林栖','writer',6),person('苏念','actor',7),person('梁舟','camera',5)];if(o.small)team=[team[0],team[1],team[3]];return{version:VERSION,company:'灯塔影业',origin,chronicle:[],year:2026,month:1,week:1,money:o.money,fame:o.fame,prestige:o.prestige,studio:0,staff:team,projects:[],project:null,works:[],ips:[],scripts:makeScripts(4,[]),news:[],trend:trendNow(),facilities:{},audiences:{youth:120,family:105,women:110,cinephile:80,mass:125+(o.small?-20:0)},rivals:makeRivals(),candidates:[],candidateKey:null,annualAwards:[],chemistry:{},pending:[],goals:{i:0,done:[]},achievements:[],flags:{},speed:1,buzz:50,buzzLog:[50],evtLog:{},evtRecent:[],debt:0,debtPay:145000,gig:null,bet:null,negativeWeeks:0,evaluated:false,bankrupted:false,idSeq}}
// ── 舆情：公司的路人缘，0-100 ──
function buzzOf(){return Number.isFinite(+S.buzz)?+S.buzz:50}
function buzz(n,why){if(!S)return;S.buzz=clamp(buzzOf()+n,0,100);if(why)addNews('舆情',why)}
function buzzLabel(b=buzzOf()){return b>=80?'口碑极佳':b>=62?'路人缘不错':b>=40?'不好不坏':b>=22?'风评转差':'人人喊打'}
function buzzSpark(){const a=(S.buzzLog||[]).slice(-52);if(a.length<2)return'<p class="subtle">还没有足够的数据。</p>';const w=280,h=46,mx=a.length-1,pts=a.map((v,i)=>`${(i/mx*w).toFixed(1)},${(h-v/100*h).toFixed(1)}`).join(' ');return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="56" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="${h/2}" x2="${w}" y2="${h/2}" stroke="#d8ccbe" stroke-dasharray="4 4"/><polyline points="${pts}" fill="none" stroke="var(--red)" stroke-width="2"/></svg>`}
function chron(text){if(!S)return;S.chronicle=[...(S.chronicle||[]),`${S.year}.${S.month} ${text}`].slice(-90)}
function addNews(type,text){S.news.unshift({type,text,date:`${S.year}.${S.month}.${S.week}`});S.news=S.news.slice(0,60);newsRev++}

function save(){if(!S)return;S.idSeq=idSeq;try{localStorage.setItem(KEY,JSON.stringify(S))}catch{if(!saveWarned){saveWarned=true;toast('无法写入本机存储，本局进度不会被保存。')}}}
function normalize(x){
  const d=fresh();for(const k in d)if(x[k]===undefined)x[k]=d[k];x.version=VERSION;
  ['staff','works','scripts','news','candidates','annualAwards','ips','rivals','pending','achievements'].forEach(k=>{if(!Array.isArray(x[k]))x[k]=[]});
  ['chemistry','flags'].forEach(k=>{if(!x[k]||typeof x[k]!=='object')x[k]={}});
  if(!x.goals||typeof x.goals!=='object')x.goals={i:0};x.goals.i=clamp(Math.floor(+x.goals.i||0),0,GOALS.length);
  if(!Array.isArray(x.goals.done))x.goals.done=GOALS.slice(0,x.goals.i).map(g=>g.id);
  if(x.bet&&(!x.bet.rivalId||!Number.isFinite(+x.bet.stake)))x.bet=null;
  x.buzz=Number.isFinite(+x.buzz)?clamp(+x.buzz,0,100):50;x.evtLog=x.evtLog&&typeof x.evtLog==='object'?x.evtLog:{};if(!Array.isArray(x.evtRecent))x.evtRecent=[];if(!Array.isArray(x.chronicle))x.chronicle=[];x.origin=ORIGINS[x.origin]?x.origin:'tv';x.debt=Math.max(0,+x.debt||0);x.debtPay=+x.debtPay||145000;if(!x.gig||!Number.isFinite(+x.gig.at))x.gig=null;x.staff.forEach(e=>{if(e.status==='gig'&&!x.gig)e.status=null});if(!Array.isArray(x.buzzLog))x.buzzLog=[Math.round(x.buzz)];
  x.facilities=x.facilities&&typeof x.facilities==='object'?x.facilities:{};x.staff=x.staff.filter(e=>e&&roles[e.role]&&e.stats);if(!x.staff.length)x.staff=d.staff;
  x.studio=clamp(Math.floor(+x.studio||0),0,STUDIOS.length-1);if(!x.trend||!x.trend.name)x.trend=trendNow();
  if(!Array.isArray(x.projects))x.projects=[];if(x.project&&x.project.quality&&!x.projects.length)x.projects=[x.project];x.project=null;
  x.projects=x.projects.filter(p=>p&&p.quality&&scaleDefs[p.scale]).slice(0,3);
  x.projects.forEach(p=>{p.id=p.id||'p'+nextId();p.polish=+p.polish||0;p.target=p.target&&audienceDefs[p.target]?p.target:'mass';p.relation=p.relation||'original';p.ipId=p.ipId||null;p.offers=p.offers||null;(p.team||[]).forEach(id=>{const e=x.staff.find(v=>v.id===id);if(e)e.status='project:'+p.id})});
  x.staff.forEach(e=>{if(!e.face)e.face=pickFace(e.role,!!e.star);if(e.status==='project'){const p=x.projects.find(v=>(v.team||[]).includes(e.id));e.status=p?'project:'+p.id:null}});
  const oldAudience=Math.max(240,+x.audience||0);if(!x.audiences||typeof x.audiences!=='object')x.audiences={youth:Math.round(oldAudience*.22),family:Math.round(oldAudience*.2),women:Math.round(oldAudience*.2),cinephile:Math.round(oldAudience*.16),mass:Math.round(oldAudience*.22)};
  Object.keys(audienceDefs).forEach(k=>x.audiences[k]=Math.max(20,+x.audiences[k]||d.audiences[k]));
  x.works.forEach(w=>{w.id=w.id||'w'+nextId();w.target=audienceDefs[w.target]?w.target:'mass';w.deal=w.deal||w.channel||'share';w.channel=w.deal;w.startStamp=Number.isFinite(w.startStamp)?w.startStamp:stamp(w.releaseYear||x.year,w.releaseMonth||1);w.active=w.active!==false;w.ops=w.ops&&typeof w.ops==='object'?w.ops:{};w.window=w.window||dealDefs[w.deal]?.window||52;w.cut=Number.isFinite(w.cut)?w.cut:dealDefs[w.deal]?.baseCut||.7;w.rate=Number.isFinite(w.rate)?w.rate:dealDefs[w.deal]?.rate||0;w.decay=Number.isFinite(w.decay)?w.decay:dealDefs[w.deal]?.decay||1});
  if(!x.ips.length&&x.works.length)x.works.forEach(w=>{const ip={id:'ip'+nextId(),name:w.name,genre:w.genre,theme:w.theme,recognition:Math.round(w.score*7),fans:Math.round(w.score*20),fatigue:0,entries:1,lastYear:w.releaseYear||x.year,bestScore:w.score};x.ips.push(ip);w.ipId=ip.id});
  if(!x.rivals.length)x.rivals=makeRivals();x.rivals=x.rivals.slice(0,6);x.rivals.forEach((r,i)=>{const dR=makeRivals()[i];for(const k in dR)if(r[k]===undefined)r[k]=dR[k]});
  const ids=[...x.staff,...x.projects,...x.works,...x.ips].map(v=>+(String(v.id||'').match(/\d+/)?.[0]||0));idSeq=Math.max(+x.idSeq||0,20,...ids);x.idSeq=idSeq;return x;
}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));return x&&typeof x==='object'&&+x.version>=1&&+x.version<=VERSION?normalize(x):null}catch{return null}}
function hasSave(){try{return!!localStorage.getItem(KEY)}catch{return false}}
function openOrigins(){$('originBody').innerHTML=Object.keys(ORIGINS).map(k=>{const o=ORIGINS[k];return `<button class="choice" onclick="newGame('${k}')"><b>${o.name}</b> <span class="tag">${o.tag}</span><small>${o.line}<br>起始资金 ${money(o.money)} · 名气 ${o.fame} · 声望 ${o.prestige}</small></button>`}).join('');openDialog('originDialog')}
function newGame(origin='tv'){document.querySelectorAll('dialog[open]').forEach(d=>d.close());modalDepth=0;S=fresh(origin);const o=ORIGINS[origin]||ORIGINS.tv;addNews('公司开张',`灯塔影业挂牌：${o.line}`);chron(`公司挂牌，${o.name}。`);if(S.audiences&&ORIGINS[origin]&&ORIGINS[origin].cinephile)S.audiences.cinephile+=ORIGINS[origin].cinephile;save();showGame()}
function continueGame(){const x=load();if(!x)return toast('没有可用的存档。');S=x;showGame()}
function showGame(){ensureContracts();$('start').classList.add('hidden');$('app').classList.remove('hidden');selectedScript=null;selectedProjectId=null;modalDepth=0;pauseBefore=null;lastNewsRev=-1;setSpeed([0,1,2,4].includes(+S.speed)?+S.speed:1);showPage('home');render();$('continueBtn').disabled=!hasSave()}
function manualSave(){save();if(!saveWarned)toast('进度已保存到本机。')}
function deleteSave(){if(!confirm('确定删除《开个影视公司》的当前存档？'))return;try{localStorage.removeItem(KEY)}catch{}document.querySelectorAll('dialog[open]').forEach(d=>d.close());S=null;clearInterval(timer);timer=null;speed=1;$('app').classList.add('hidden');$('start').classList.remove('hidden');$('continueBtn').disabled=true}

function setSpeed(n){speed=n;if(S)S.speed=n;document.querySelectorAll('[data-speed]').forEach(b=>b.classList.toggle('active',+b.dataset.speed===n));clearInterval(timer);timer=null;if(n&&S)timer=setInterval(()=>advanceWeek(n),TICK_MS);renderClock()}
function stepWeek(){if(!S)return;if(document.querySelector('dialog[open]'))return;if(speed)setSpeed(0);advanceWeek(1)}
window.addEventListener('keydown',e=>{
  if(!S||document.querySelector('dialog[open]'))return;
  const t=e.target;if(t&&/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName))return;
  if(e.code==='Space'||e.code==='ArrowRight'){e.preventDefault();stepWeek()}
});
function pauseForModal(){if(modalDepth++===0)pauseBefore=speed;setSpeed(0)}
function resumeAfterModal(){if(modalDepth>0&&--modalDepth===0)setSpeed(pauseBefore??1)}
function openDialog(id){const d=$(id);if(d.open)return;pauseForModal();d.showModal()}
function closeDialog(id){const d=$(id);if(d.open)d.close()}
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('close',resumeAfterModal));

function tickWeek(allowDialogs=true){
  S.week++;if(S.week>4){S.week=1;S.month++;if(S.month>12){S.month=1;S.year++;addNews('年度结算',`${S.year-1} 年结束，公司名气自然回落。`);S.fame=Math.max(0,S.fame*.94);const dr=ORIGINS[S.origin]&&ORIGINS[S.origin].drain;if(dr){S.money-=dr;addNews('股东抽成',`家里按约定抽走 ${money(dr)}。`)}}
    monthlyCosts();refreshScripts();processRivals();processContracts(allowDialogs);
    if(S.origin==='rich'&&!S.flags.deadlineChecked&&stamp()>=stamp(2028,1)){S.flags.deadlineChecked=true;if(S.works.some(w=>w.net>w.cost)){S.money+=1000000;chron('两年之期，家里认了这门生意。');addNews('股东','家里看到回本的片子，又追加了一百万。')}else{S.money-=3000000;chron('两年之期到了，家里撤走三百万。');addNews('股东','两年之内没有一部赚钱的片子，家里撤走三百万。')}}}
  S.buzz=clamp(buzzOf()+(buzzOf()<50?.4:-.4),0,100);(S.buzzLog=S.buzzLog||[]).push(Math.round(buzzOf()));if(S.buzzLog.length>60)S.buzzLog=S.buzzLog.slice(-60);
  processGig();processStaff();processProjects(allowDialogs);processWorks(allowDialogs);processTrend();processPending(allowDialogs);processEvents(allowDialogs);maybeScandal(allowDialogs);checkAwards();checkGoals();checkAchievements();financialRisk(allowDialogs&&!document.querySelector('dialog[open]'));
}
function advanceWeek(times=1){for(let i=0;i<times;i++){tickWeek(true);if(document.querySelector('dialog[open]'))break}save();render()}
function monthlyCosts(){
  const burn=monthlyBurn();S.money-=burn;addNews('月度支出',`工资与场地支出 ${money(burn)}。`);
  if(S.debt>0){const pay=Math.min(S.debt,S.debtPay||145000);S.money-=pay;S.debt-=pay;
    if(S.debt<=0){S.debt=0;addNews('公司','贷款已经还清。')}else addNews('还贷',`本月还贷 ${money(pay)}，还剩 ${money(S.debt)}。`)}
}
function processStaff(){const drain=S.facilities.sound?1:0;S.staff.forEach(e=>{if(e.status==='gig')e.energy=clamp(e.energy-2,0,100);else if(e.status==='rest'){e.energy=clamp(e.energy+18,0,100);if(e.energy>=95)e.status=null}else if(String(e.status||'').startsWith('project:'))e.energy=clamp(e.energy-Math.max(1,rnd(2,4)-drain),0,100);else e.energy=clamp(e.energy+5,0,100)})}
function processProjects(allowDialogs){
  for(const p of S.projects){
    if(p.ready)continue;
    const team=teamOf(p);
    if(!team.length){if(!p.stalled){p.stalled=true;addNews('制作停摆',`《${p.name}》暂时没有可用主创。`)}continue}
    p.stalled=false;
    const ph=PHASES[p.phase],order=p.order||null;
    const avg=team.reduce((a,e)=>a+e.stats[ph.stat]*(e.energy<30?.62:e.energy<55?.82:1),0)/team.length;
    const coverage=new Set(team.map(e=>e.role));
    const bonus=(coverage.has('director')?1.08:1)*(coverage.has('producer')?1.06:1)*(coverage.has('writer')&&p.phase===0?1.12:1);
    const baseStep=400/scaleDefs[p.scale].weeks;
    let step=clamp(baseStep*(.72+avg/170)*bonus,baseStep*.7,baseStep*1.35)*(S.facilities.edit&&p.phase===3?1.1:1);
    let gain=avg/15+(p.phase===0?p.script.story/28:0);
    if(S.facilities.edit&&ph.quality==='visual')gain*=1.1;
    if(S.facilities.sound&&ph.quality==='performance')gain*=1.1;
    let wage=team.reduce((a,e)=>a+e.salary/4,0);
    // ── 本周指令 ──
    if(order==='rush'){step*=1.35;gain*=.7;team.forEach(e=>e.energy=clamp(e.energy-3,0,100));p.rush=(p.rush||0)+1}else p.rush=0;
    if(order==='quality'){gain*=1.3;step*=.8}
    if(order==='care'){team.forEach(e=>e.energy=clamp(e.energy+6,0,100));for(let i=0;i<team.length;i++)for(let j=i+1;j<team.length;j++){const k=pairKey(team[i].id,team[j].id);S.chemistry[k]=(S.chemistry[k]||0)+.34}}
    if(order==='save'){wage*=.65;gain*=.85;team.forEach(e=>e.energy=clamp(e.energy-2,0,100))}
    if(order==='free'&&Math.random()<.14){gain*=1.5;addNews('意外收获',`《${p.name}》拍到一条计划外的好镜头。`)}
    p.progress+=step;p.quality[ph.quality]+=gain;p.spent+=wage;
    if(p.rush>=3){p.rush=0;team.forEach(e=>e.energy=clamp(e.energy-10,0,100));p.quality[ph.quality]=Math.max(0,p.quality[ph.quality]-4);buzz(-2);addNews('剧组怨气',`《${p.name}》连赶三周通告，现场开始出错，返工了两场戏。`)}
    if(allowDialogs&&!p.eventMarks.includes(p.phase)&&p.progress>52){p.eventMarks.push(p.phase);if(Math.random()<.45){projectEvent(p);break}}
    if(p.progress>=100){
      p.phase++;p.progress=0;
      if(p.phase>=PHASES.length){p.ready=true;ensureOffers(p);addNews('成片完成',`《${p.name}》完成制作，发行商报价已经送达。`);if(allowDialogs){openRelease(p.id);break}}
      else addNews('制作推进',`《${p.name}》进入${PHASES[p.phase].name}阶段。`);
    }
  }
}
function setOrder(id,key){const p=projectById(id);if(!p||p.ready)return;p.order=p.order===key?null:key;save();render()}
// ── 通用抉择事件：choices 为 {label,cost,note,apply}，onSkip 处理“按原计划推进” ──
function costText(c){return c.cost>S.money?`资金不足 · 需要 ${money(c.cost)}`:c.cost>0?`追加 ${money(c.cost)}`:c.cost<0?`获得 ${money(-c.cost)}`:'不追加预算'}
function showChoices(title,html,choices,onSkip,skipLabel,mood){activeEvent={choices,onSkip};$('eventTitle').textContent=title;const sk=$('eventSkipBtn');if(sk)sk.textContent=skipLabel||'按原计划推进 · 不追加投入';$('eventBody').innerHTML=moodImg(mood)+html+choices.map((c,i)=>`<button class="choice" ${c.cost>S.money?'disabled':''} onclick="resolveEvent(${i})">${c.label}<small>${costText(c)}${c.note?' · '+c.note:''}</small></button>`).join('');openDialog('eventDialog')}
function resolveEvent(i){const c=activeEvent?.choices?.[i];if(!c)return closeDialog('eventDialog');if(c.cost>0&&S.money<c.cost)return toast('资金不足，无法做出这个选择。');S.money-=c.cost||0;if(c.apply)c.apply();activeEvent=null;closeDialog('eventDialog');save();render()}
function skipEvent(){if(activeEvent?.onSkip)activeEvent.onSkip();activeEvent=null;closeDialog('eventDialog');save();render()}
// ── 事件调度：每周最多弹一个窗，优先级 连锁 > 上映 > 片场 > 公司 > 人物 ──
const val=(x,c)=>typeof x==='function'?x(c):x;
function evtReady(ev,c){
  if(ev.once&&S.evtLog[ev.id]!=null)return false;
  if(ev.cooldown&&S.evtLog[ev.id]!=null&&weekAbs()-S.evtLog[ev.id]<ev.cooldown)return false;
  if((S.evtRecent||[]).includes(ev.id))return false;
  try{return ev.cond?!!ev.cond(c):true}catch(err){return false}
}
function pickEvent(filter,c){
  const pool=EVENTS.filter(e=>filter(e)&&evtReady(e,c));
  if(!pool.length)return null;
  let total=pool.reduce((a,e)=>a+(e.weight||8),0),r=Math.random()*total;
  for(const e of pool){r-=(e.weight||8);if(r<=0)return e}
  return pool[pool.length-1];
}
function fireEvent(ev,c){
  S.evtLog[ev.id]=weekAbs();S.lastEvt=weekAbs();
  S.evtRecent=[...(S.evtRecent||[]),ev.id].slice(-10);
  const choices=ev.choices.map(ch=>({label:val(ch.label,c),cost:val(ch.cost,c)||0,note:val(ch.note,c),apply:()=>{if(ch.cost<0)0;ch.apply(c);if(c.p&&ch.cost>0)c.p.spent+=ch.cost}}));
  showChoices(ev.title,`<p>${val(ev.text,c)}</p>`,choices,()=>{if(ev.onSkip)ev.onSkip(c)},ev.skip,ev.mood);
}
function projectEvent(p){const c={p},ev=pickEvent(e=>e.tier==='project'&&e.phase===p.phase,c);if(ev)fireEvent(ev,c)}
function processEvents(allowDialogs){
  if(!allowDialogs||document.querySelector('dialog[open]'))return;
  if(Math.random()<.22)addNews('业内',FLAVOR[rnd(0,FLAVOR.length-1)]);
  const live=S.works.filter(w=>w.active&&stamp()>=w.startStamp);
  const making=S.projects.filter(p=>!p.ready);
  const folks=S.staff.filter(e=>e.contract);
  if(weekAbs()-(S.lastEvt||-99)<3)return;   // 三周之内不再弹第二个随机事件
  const rolls=[
    [.08,()=>live.length?{w:live[rnd(0,live.length-1)]}:null,e=>e.tier==='release'],
    [.07,()=>making.length?{p:making[rnd(0,making.length-1)]}:null,e=>e.tier==='project'&&e.phase==null],
    [.06,()=>({}),e=>e.tier==='company'],
    [.05,()=>folks.length?{e:folks[rnd(0,folks.length-1)]}:null,e=>e.tier==='person']
  ];
  for(const [chance,mk,filter] of rolls){
    if(Math.random()>=chance)continue;
    const extra=mk();if(!extra)continue;
    const c=extra,ev=pickEvent(filter,c);
    if(ev){fireEvent(ev,c);return}
  }
}
// ── 链式后果：埋下的选择会在数周后回来找你 ──
const weekAbs=()=>stamp()*4+S.week-1;
function queueChain(id,p){S.pending.push({at:weekAbs()+rnd(4,9),chain:id,projectId:p.id,name:p.name})}
function processPending(allowDialogs){if(!allowDialogs||!S.pending.length||document.querySelector('dialog[open]'))return;const now=weekAbs(),i=S.pending.findIndex(e=>e.at<=now);if(i>=0)fireChain(S.pending.splice(i,1)[0])}
function fireChain(ev){
  const p=projectById(ev.projectId);
  if(ev.chain==='censor'){
    if(!p)return addNews('备案消息',`《${ev.name}》顺利通过内容备案，虚惊一场。`);
    showChoices('修改意见下达',`<p><b>《${safe(p.name)}》</b> · 备案反馈要求调整那段大胆的现实指涉。</p>`,[
      {label:'配合修改',cost:0,note:'故事 -5',apply:()=>{p.quality.story=Math.max(0,p.quality.story-5);addNews('审查风波',`《${p.name}》按意见完成修改。`)}},
      {label:'逐条申辩',cost:100000,note:'55% 保住原片',apply:()=>{if(Math.random()<.55){p.quality.story+=3;addNews('审查风波',`《${p.name}》申辩成功，原片得以保留。`)}else{p.quality.story=Math.max(0,p.quality.story-8);addNews('审查风波',`《${p.name}》申辩未果，被迫大幅删改。`)}}}
    ],()=>{p.quality.story=Math.max(0,p.quality.story-5);addNews('审查风波',`《${p.name}》默默完成了修改。`)},null,'review');
  }else if(ev.chain==='longtake'){
    if(!p)return;
    showChoices('长镜头卡住了',`<p><b>《${safe(p.name)}》</b> · 那个没预演的长镜头拍到第十四条还是不对，一整天就这么过去了。</p>`,[
      {label:'再给一天',cost:90000,note:'视听 +8',apply:()=>{p.quality.visual+=8;addNews('片场',`《${p.name}》多花一天拍成了那个长镜头。`)}},
      {label:'拆成三个镜头',cost:0,note:'导演 -4 · 进度 +6',apply:()=>{p.quality.vision=Math.max(0,p.quality.vision-4);p.progress+=6;addNews('片场',`《${p.name}》把长镜头拆开拍了。`)}}
    ],()=>{p.quality.vision=Math.max(0,p.quality.vision-4);p.progress+=6;addNews('片场',`《${p.name}》最后还是把长镜头拆了。`)},null,'idle');
  }else if(ev.chain==='placement'){
    if(!p)return;
    showChoices('植入镜头惹争议',`<p><b>《${safe(p.name)}》</b> · 内部试映后，植入镜头被吐槽严重出戏。</p>`,[
      {label:'重新剪辑弱化',cost:80000,note:'消除影响',apply:()=>addNews('植入风波',`《${p.name}》重剪弱化植入，口碑警报解除。`)},
      {label:'合同在身，保留',cost:0,note:'故事 -6',apply:()=>{p.quality.story=Math.max(0,p.quality.story-6);buzz(-3);addNews('植入风波',`《${p.name}》保留植入镜头，观众恐怕不会买账。`)}}
    ],()=>{p.quality.story=Math.max(0,p.quality.story-6);addNews('植入风波',`《${p.name}》无人处理植入争议，只能硬着头皮上。`)},null,'press');
  }else if(ev.chain==='injury'){
    if(!p)return;
    showChoices('伤情恶化',`<p><b>《${safe(p.name)}》</b> · 带伤硬拍的主演伤势加重，剧组陷入两难。</p>`,[
      {label:'公开致歉停机',cost:0,note:'进度 -12，名气 -0.5',apply:()=>{p.progress=Math.max(0,p.progress-12);S.fame=Math.max(0,S.fame-.5);addNews('片场危机',`《${p.name}》停机让主演养伤，舆论表示理解。`)}},
      {label:'医疗团队随组保障',cost:200000,note:'保住拍摄进度',apply:()=>addNews('片场危机',`《${p.name}》请来医疗团队随组保障，拍摄继续。`)}
    ],()=>{p.progress=Math.max(0,p.progress-12);S.fame=Math.max(0,S.fame-.5);addNews('片场危机',`《${p.name}》被迫停机，主演回家养伤。`)},null,'hospital');
  }
}
// ── 明星塌房：话题体质是双刃剑 ──
function maybeScandal(allowDialogs){
  if(!allowDialogs||document.querySelector('dialog[open]'))return;
  const star=S.staff.find(e=>e.star&&e.starTrait==='topic'&&Math.random()<.006);
  if(!star)return;
  showChoices('明星塌房危机',`<p>${safe(star.name)}的旧账被自媒体翻出，话题冲上热搜，公司和在映作品面临连带风险。</p>`,[
    {label:'危机公关团队进场',cost:300000,note:'化解危机，名气 -0.5',apply:()=>{S.fame=Math.max(0,S.fame-.5);buzz(-4);S.flags.scandalHandled=true;addNews('公关行动',`公司为${star.name}紧急公关，风波逐渐平息。`)}},
    {label:'火速解约切割',cost:0,note:'失去该主创，声望 -2',apply:()=>{S.staff=S.staff.filter(x=>x.id!==star.id);S.projects.forEach(p=>p.team=p.team.filter(id=>id!==star.id));S.prestige=Math.max(0,S.prestige-2);buzz(-2);addNews('紧急切割',`公司宣布与${star.name}解约，相关项目重新调整。`)}},
    {label:'硬刚不回应',cost:0,note:'50% 自证清白',apply:()=>{if(Math.random()<.5){S.fame+=1;buzz(6);S.flags.scandalHandled=true;addNews('风波反转',`${star.name}晒出证据自证清白，公司路人缘不降反升。`)}else{S.fame=Math.max(0,S.fame-2);buzz(-10);S.works.filter(w=>w.active).forEach(w=>w.potential*=.92);addNews('风波发酵',`沉默让舆论持续发酵，公司在映作品受到波及。`)}}}
  ],()=>{S.fame=Math.max(0,S.fame-1);buzz(-6);addNews('风波发酵',`公司未作回应，${star.name}的话题继续发酵。`)},'暂不表态 · 名气 -1','online')
}
// ── 目标与成就 ──
function goalDone(id){return (S.goals.done||[]).includes(id)}
function checkGoals(){
  for(const g of GOALS){
    if(goalDone(g.id))continue;
    let ok=false;try{ok=!!g.check()}catch(e){ok=false}
    if(!ok)continue;
    (S.goals.done=S.goals.done||[]).push(g.id);g.reward();
    addNews('经营目标',`达成「${g.name}」，获得：${g.rw}。`);chron(`达成经营目标「${g.name}」。`);toast(`目标达成：${g.name}`);
  }
}
function checkAchievements(){ACHIEVEMENTS.forEach(a=>{if(!S.achievements.includes(a[0])&&a[3]()){S.achievements.push(a[0]);addNews('成就解锁',`「${a[1]}」— ${a[2]}`);toast(`成就解锁：${a[1]}`)}})}

function processWorks(allowDialogs){const now=stamp();let opened=false;S.works.forEach(w=>{if(!w.active||now<w.startStamp||w.weeks>=w.window)return;if(!w.premiered){w.premiered=true;addNews('公映',`《${w.name}》今日${w.deal==='theater'?'公映':'上线'}。`);if(allowDialogs&&!opened&&!document.querySelector('dialog[open]')){opened=true;premiereDialog(w)}}if(w.rate>0){const gross=w.potential*w.rate*Math.pow(w.decay,w.weeks)*(.88+Math.random()*.24);w.gross+=gross;w.net+=gross*w.cut;S.money+=gross*w.cut}w.weeks++;if(w.weeks>=w.window){w.active=false;addNews('主发行结束',`《${w.name}》完成主要商业周期，累计回款 ${money(w.net)}。`)}})}
function processTrend(){S.trend.weeks--;if(S.trend.weeks<=0){S.trend=trendNow();addNews('市场风向',`${S.trend.name}内容热度上升：${S.trend.desc}`)}}
function processRivals(){const now=stamp();S.rivals.forEach(r=>{if(now<r.nextStamp)return;const score=clamp(5.2+r.strength/30+(Math.random()-.5)*1.8,5.2,9.3),gross=(900000+score*620000)*(.75+Math.random()*.6),hit=score>=7.7;if(S.bet&&S.bet.rivalId===r.id&&S.bet.rivalScore==null){S.bet.rivalScore=score;resolveBet()}r.value=Math.max(3000000,r.value+gross*.22-r.strength*9000);r.fame=Math.max(1,r.fame+(hit?.7:-.15));r.prestige+=score>=8.4?2:0;r.audience+=Math.round(score*(hit?18:7));if(hit)r.hits++;S.audiences[r.target]=Math.max(20,S.audiences[r.target]-rnd(2,8));addNews('竞争对手',`${r.name}的${r.nextGenre}新作${hit?'成为档期热门':'表现平平'}，评分 ${score.toFixed(1)}。`);let ns=now+rnd(4,8);if(r.strength>=65&&Math.random()<.55)for(let k=0;k<3&&seasonAt(ns)[0]===1;k++)ns++;r.nextStamp=ns;r.nextGenre=Math.random()<.65?r.focusGenre:genres[rnd(0,genres.length-1)]})}
function checkAwards(){if(S.month!==2||S.week!==1||S.annualAwards.includes(S.year))return;S.annualAwards.push(S.year);const pool=S.works.filter(w=>w.releaseYear===S.year-1).sort((a,b)=>b.score-a.score);if(!pool.length)return addNews('金幕奖','公司去年没有可参评作品。');const best=pool[0];if(best.score<7.2)return addNews('金幕奖',`《${best.name}》未能入围今年的金幕奖。`);if(Math.random()<Math.min(.9,best.score/11+S.prestige/120+(S.staff.some(e=>e.star&&e.starTrait==='award')?.08:0)+(S.flags.awardPush?.12:0))){const prize=best.score>=8.6?'年度最佳影片':best.score>=8?'最佳导演':'评审团特别奖';S.prestige+=prize==='年度最佳影片'?14:8;S.fame+=2;buzz(8);S.flags.awardWon=true;S.flags.awardPush=false;chron(`《${best.name}》拿下${prize}。`);addNews('金幕奖',`《${best.name}》获得${prize}。`);
    if(!document.querySelector('dialog[open]')){
      showChoices('金幕奖',sceneBanner('award',`《${safe(best.name)}》· ${prize}`,`${S.year} 年金幕奖`)
        +`<div class="premiere">${posterSvg(best.name,best.genre,best.score)}<div><div class="big-score">${prize}</div><p>台下坐着的那些人，几年前还不知道这家公司叫什么。</p><p class="subtle">行业声望 +${prize==='年度最佳影片'?14:8} · 公司名气 +2 · 舆情 +8</p></div></div>`,[],null,'谢谢大家');
    }else toast(`获奖：《${best.name}》· ${prize}`)}else addNews('金幕奖',`《${best.name}》入围但未获奖。`)}
function showEnding(title,html,scene){$('endingTitle').textContent=title;$('endingBody').innerHTML=sceneBanner(scene||'ending-rise',title,'')+html;openDialog('endingDialog')}
function financialRisk(canOpen=true){if(S.money<0)S.negativeWeeks++;else S.negativeWeeks=0;if(S.negativeWeeks&&S.negativeWeeks%12===0)addNews('财务预警',`公司已连续 ${S.negativeWeeks} 周资金为负。`);if(canOpen&&!S.bankrupted&&((S.money<=-3000000&&S.negativeWeeks>=10)||S.negativeWeeks>=26)){S.bankrupted=true;chron('资金链断裂，公司关门。');saveHall();return showEnding('资金链断裂',`<p>连续亏损让公司无法继续支付工资和场租。</p><div class="hint">本局共发行 ${S.works.length} 部作品，建立 ${S.ips.length} 个IP。</div>`,'ending-fall')}if(canOpen&&S.year>=2036&&!S.evaluated){S.evaluated=true;saveHall();const e=endingOf();chron(`十年之后：${e.title}。`);showEnding(e.title,e.html,e.scene)}}
function refreshScripts(){
  // 到期的王牌剧本被竞价对手截胡，对方实力增强
  S.scripts.filter(s=>s.expire&&s.hot).forEach(s=>{const r=S.rivals.find(v=>v.id===s.bidderId);if(r){r.strength=Math.min(95,r.strength+3);addNews('剧本争夺',`王牌剧本《${s.title}》被${r.name}签下，对方阵容更强了。`)}});
  S.scripts=S.scripts.filter(x=>!x.expire);S.scripts.forEach(x=>x.expire=true);
  if(S.scripts.length<4)S.scripts.push(...makeScripts(4-S.scripts.length,S.scripts));
  if(Math.random()<.25&&!S.scripts.some(s=>s.hot)){const r=S.rivals[rnd(0,S.rivals.length-1)],s=makeScript(new Set(S.scripts.map(x=>x.title)));s.story=rnd(72,90);s.heat=rnd(70,95);s.cost=Math.round(s.cost*2.2);s.hot=true;s.bidder=r.name;s.bidderId=r.id;S.scripts.push(s);addNews('剧本争夺',`王牌剧本《${s.title}》流入市场，${r.name}已经报价，本月不拿下就会易主。`)}
}

function showPage(page){const changed=currentPage!==page;currentPage=page;['home','scripts','crew','works','strategy'].forEach(x=>$(`page-${x}`).classList.toggle('hidden',x!==page));document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));renderMain();if(changed)requestAnimationFrame(()=>window.scrollTo(0,0))}
function statHtml(){const st=studio();return `<div class="stats"><div class="card stat"><label>可用资金</label><b>${money(S.money)}</b><small>月支 ${money(monthlyBurn())}${S.debt>0?` · 欠款 ${money(S.debt)}`:''}</small></div><div class="card stat"><label>公司名气</label><b>${S.fame.toFixed(1)}</b><small>舆情 ${Math.round(buzzOf())} · ${buzzLabel()}</small></div><div class="card stat"><label>观众资产</label><b>${NF.format(audienceTotal())} 万</b><small>五类受众总规模</small></div><div class="card stat"><label>行业声望</label><b>${S.prestige}</b><small>来自奖项与高分作品</small></div><div class="card stat"><label>制作管线</label><b>${S.projects.length}/${st.slots}</b><small>${st.name}</small></div></div>`}
function trendHtml(){return `<small>当期市场风向 · 剩余 ${S.trend.weeks} 周</small><b>${S.trend.name}升温</b><span>${S.trend.desc}</span>`}
function newsHtml(){return S.news.map(n=>`<div class="news"><time>${n.date} · ${n.type}</time>${safe(n.text)}</div>`).join('')}
function orderBar(p){return `<div class="orders">${Object.keys(ORDERS).map(k=>`<button class="${p.order===k?'on':''}" onclick="setOrder('${p.id}','${k}')">${ORDERS[k].name}</button>`).join('')}</div><p class="subtle order-hint">${p.order?`当前指令 · ${ORDERS[p.order].hint}${p.order==='rush'&&p.rush?`（已连赶 ${p.rush} 周）`:''}`:'没下指令 · 按常规推进。指令会一直执行，直到你改或再点一次取消。'}</p>`}
function projectCard(p){const ip=p.ipId?S.ips.find(x=>x.id===p.ipId):null,progress=clamp(Math.round(p.progress),0,100);return `<div class="project"><div class="project-head"><div class="poster" aria-hidden="true">${p.relation==='original'?'映':'续'}</div><div class="grow"><h3>《${safe(p.name)}》 <span class="tag red">${p.ready?'待定档':PHASES[p.phase].name}</span></h3><p>${p.script.genre} · ${p.script.theme} · ${scaleDefs[p.scale].name} · ${audienceDefs[p.target].name}${ip?` · ${relationDefs[p.relation].name}`:''}</p></div><b>${p.ready?previewScore(p).toFixed(1):progress+'%'}</b></div><div class="bar"><i style="width:${p.ready?100:progress}%"></i></div>${qualityGrid(k=>Math.round(p.quality[k]||0))}<p>当前投入 ${money(p.spent)} · ${p.ready?'三家发行报价已到齐':p.stalled?'制作停滞：没有可用主创':'主创正在推进制作'}</p>${p.ready?`<div class="project-actions"><button class="primary" onclick="openRelease('${p.id}')">谈判并定档</button></div>`:orderBar(p)}</div>`}
function renderHome(){const st=studio(),next=nextRivalSlate(3);$('page-home').innerHTML=statHtml()+`<div class="studio"><div class="dashboard"><section class="card set-card">${sceneImg(stageScene())}<div class="set-head"><div><b>${st.stage}</b><br><small>${S.projects.length?`${S.projects.length} 条制作线同时推进`:'今日没有拍摄通告'}</small></div><span class="tag">${S.projects.length}/${st.slots} PROJECTS</span></div><div class="spotlight a"></div><div class="spotlight b"></div><div class="camera" aria-hidden="true">🎥</div><div class="crew-dots">${S.staff.slice(0,6).map(e=>`<div class="crew-dot"><i style="--c:${roleColors[e.role]}">${faceImg(e)}</i><b>${safe(e.name)}</b><span>${String(e.status||'').startsWith('project:')?'制作中':e.status==='rest'?'休整':'待命'}</span></div>`).join('')}</div></section><section class="card section quick"><h2>快速操作</h2><div class="operation-grid"><button onclick="showPage('scripts')">挑选剧本</button><button onclick="openRecruit()">寻找主创</button><button ${S.gig?'disabled':''} onclick="openGig()">${S.gig?`外包进行中 · 还有 ${Math.max(0,S.gig.at-weekAbs())} 周`:'接一单外包'}</button><button onclick="restTeam()">空闲成员轮休</button><button onclick="endRest()">结束轮休</button><button onclick="showPage('works')">IP与片库</button><button onclick="manualSave()">保存进度</button></div></section></div><div class="dashboard"><section class="card section board"><div class="split"><h2 class="grow">制作看板</h2><span class="tag">${S.projects.length}/${st.slots} 条管线</span></div><div class="project-list">${S.projects.length?S.projects.map(projectCard).join(''):'<div class="empty">尚无在制项目<br><br><button class="primary" onclick="showPage(\'scripts\')">去剧本市场选故事</button></div>'}</div></section></div></div>${goalHtml()}<section class="card section"><div class="split"><h2 class="grow">近期竞争档期</h2><button onclick="showPage('strategy')">查看完整片单</button></div><div class="slate">${slateHtml(next)}</div></section><section class="card panel trend-card only-narrow" style="margin-top:12px">${trendHtml()}</section><section class="card section only-narrow"><h2>业内消息</h2><div class="feed">${newsHtml()}</div></section>`}
function renderScripts(){const full=S.projects.length>=studio().slots;$('page-scripts').innerHTML=statHtml()+`<section class="card section">${sceneBanner('market-script','剧本交易市场','每月更新。立项时先定核心受众，发行渠道留到成片后谈判')}<div class="split"><span class="grow"></span><span class="tag">管线 ${S.projects.length}/${studio().slots}</span></div><div class="script-grid">${S.scripts.map(s=>`<article class="script"><div class="split"><span class="tag red">${s.genre}</span>${s.hot?`<span class="tag red">🔥 ${safe(s.bidder)}竞价中</span>`:''}<span class="score grow" style="text-align:right">${s.story}</span></div><h3>《${safe(s.title)}》</h3><p>${safe(s.logline)}${s.hot?'<br><b style="color:var(--red)">王牌剧本：本月不签，就会被对手抢走。</b>':''}</p><p>${s.theme} · 市场热度 ${s.heat}<br>版权费 <b>${money(s.cost)}</b></p><button class="primary" ${full?'disabled':''} onclick="openProject('${s.id}')">${full?'制作管线已满':'购买并立项'}</button></article>`).join('')}</div></section>`}
function statusText(e){if(e.status==='gig')return'在外包项目上';if(e.status==='rest')return'休整中';if(String(e.status||'').startsWith('project:')){const p=projectById(String(e.status).slice(8));return p?`参与《${p.name}》`:'制作中'}return'可以安排工作'}
function staffRow(e,aside){return `<div class="staff">${avatarHtml(e)}<div><h3>${safe(e.name)} <span class="tag">${roles[e.role][0]} Lv.${e.level}</span>${e.star?` <span class="tag red">★ ${starTraits[e.starTrait]?.name||'明星'}</span>`:''}${e.hall?' <span class="tag green">名人堂</span>':''}</h3><p>${e.trait}${e.star?` · 号召力 ${e.aura}`:''} · 故事 ${e.stats.story} / 导演 ${e.stats.vision} / 表演 ${e.stats.performance} / 视听 ${e.stats.visual} / 统筹 ${e.stats.management}</p><div class="energy"><i style="width:${e.energy}%"></i></div><p>体力 ${e.energy} · ${safe(statusText(e))}${e.contract?` · ${contractText(e)}`:''}</p></div><aside>${aside}</aside></div>`}
function renderCrew(){$('page-crew').innerHTML=statHtml()+`<section class="card section"><div class="split"><h2 class="grow">主创团队</h2><button onclick="openRecruit()">＋ 寻找主创</button></div>${S.staff.map(e=>staffRow(e,`<span>月薪 ${money(e.salary)}</span><button onclick="openPerson(${e.id})">查看 / 安排</button>`)).join('')}</section>`}
function workStatus(w){const now=stamp();if(now<w.startStamp)return`等待 ${stampLabel(w.startStamp)} 上线`;if(w.active)return`发行第 ${w.weeks+1} 周`;return'主发行结束'}
function ipCard(ip){const full=S.projects.length>=studio().slots,canReboot=ip.entries>=2;return `<article class="ip-card"><span class="tag red">IP · ${ip.genre}</span><h3>《${safe(ip.name)}》</h3><p>${ip.theme} · 已开发 ${ip.entries} 部<br>知名度 ${Math.round(ip.recognition)} · 粉丝 ${NF.format(Math.round(ip.fans))} 万 · 疲劳 ${Math.round(ip.fatigue)}</p><div class="meter"><i style="width:${clamp(ip.recognition,0,100)}%"></i></div><div class="card-actions"><button ${full?'disabled':''} onclick="openSequel('${ip.id}','sequel')">正统续集</button><button ${full?'disabled':''} onclick="openSequel('${ip.id}','spinoff')">衍生</button><button ${full||!canReboot?'disabled':''} onclick="openSequel('${ip.id}','reboot')">重启</button><button onclick="sellIp('${ip.id}')">卖断 · ${money(ipValue(ip))}</button></div></article>`}
function renderWorks(){const works=[...S.works].reverse();$('page-works').innerHTML=statHtml()+`<section class="card section"><div class="split"><div class="grow"><h2>IP开发库</h2><p class="subtle">成功作品可以延续，但高疲劳会伤害续作口碑与市场潜力。</p></div><span class="tag">${S.ips.length} 个IP</span></div>${S.ips.length?(()=>{const sorted=[...S.ips].sort((a,b)=>b.recognition-a.recognition),top=sorted.slice(0,6),rest=sorted.slice(6);return `<div class="ip-grid">${top.map(ipCard).join('')}</div>`+(rest.length?`<details class="fold" style="margin-top:12px"><summary>其余 ${rest.length} 个IP</summary><div class="fold-body"><div class="ip-grid">${rest.map(ipCard).join('')}</div></div></details>`:'')})():'<div class="empty">发行第一部原创作品后，这里会形成公司的首个IP。</div>'}</section><section class="card section">${sceneBanner('premiere','作品片库与发行后运营','上映期的追加动作有时间和次数限制')}${works.length?(()=>{const card=w=>`<article class="work"><div class="work-top">${posterSvg(w.name,w.genre,w.score)}<div><h3>《${safe(w.name)}》</h3><span class="tag ${w.score>=8?'green':''}">${dealDefs[w.deal]?.name||w.deal}</span><p>${w.genre} · ${audienceDefs[w.target].name}<br>${workStatus(w)}<br>流水 ${money(w.gross)}<br>回款 ${money(w.net)}</p></div></div><button onclick="showReport('${w.id}')">报告 / 发行后运营</button></article>`;const recent=works.slice(0,6),older=works.slice(6);return `<div class="work-grid">${recent.map(card).join('')}</div>`+(older.length?`<details class="fold" style="margin-top:12px"><summary>更早的作品 <span class="tag">${older.length} 部</span></summary><div class="fold-body"><div class="work-grid">${older.map(card).join('')}</div></div></details>`:'')})():'<div class="empty">还没有正式签约发行的作品。</div>'}</section>`}
function audienceCards(){return Object.entries(audienceDefs).map(([k,d])=>`<article class="audience-card"><span class="tag">${d.name}</span><h3>${NF.format(Math.round(S.audiences[k]))} 万</h3><p>${d.desc}</p><div class="meter"><i style="width:${clamp(S.audiences[k]/8,8,100)}%"></i></div></article>`).join('')}
function cashHtml(){
  const low=S.money<3000000,gig=S.gig;
  return `<section class="card section"><div class="split"><h2 class="grow">资金运作</h2>${S.debt>0?`<span class="tag red">欠款 ${money(S.debt)}</span>`:''}</div>`
   +`<p class="subtle">账上周转不开的时候，这三条路都能救急：跟银行借一笔、接外包活、或者把一个IP的版权卖断。卖断是一次性的——那个IP以后不能再开发。</p>`
   +`<div class="operation-grid">`
   +`<button ${S.debt>0||!low?'disabled':''} onclick="takeLoan()">${S.debt>0?`还款中 · 月付 ${money(S.debtPay||145000)}`:low?'借 300 万 · 两年还清':'账上够用，暂不需要'}</button>`
   +`<button ${gig?'disabled':''} onclick="openGig()">${gig?`外包进行中 · 还有 ${Math.max(0,gig.at-weekAbs())} 周`:'接一单外包 · 六周'}</button>`
   +`<button onclick="showPage('works')">去片库卖IP</button></div></section>`;
}
function buzzHtml(){const b=Math.round(buzzOf());return `<section class="card section"><div class="split"><h2 class="grow">公司舆情</h2><span class="tag ${b>=62?'green':b<40?'red':''}">${b} · ${buzzLabel()}</span></div>${buzzSpark()}<p class="subtle">舆情影响作品首发表现（最多 ±15%）和招募签约金（最多 ±25%）。高分作品和获奖会把它拉起来，烂片、塌房、把剧组用到怨声载道会拉下去；没有大事发生时每周向 50 自然回归。</p></section>`}
function goalHtml(){
  const done=(S.goals.done||[]),next=GOALS.find(g=>!done.includes(g.id));
  return `<section class="card section"><div class="split"><h2 class="grow">经营目标</h2><span class="tag ${done.length===GOALS.length?'green':''}">${done.length}/${GOALS.length}</span></div>`
   +(next?`<div class="hint"><b>${next.name}</b> · ${next.desc}<br>达成奖励：${next.rw}</div>`:'<div class="hint"><b>七个目标全部达成</b> · 剩下的只有把公司开下去。</div>')
   +`<div class="goal-list">${GOALS.map(g=>{const ok=done.includes(g.id);return `<div class="goal-row ${ok?'ok':''}"><i>${ok?'✓':'○'}</i><b>${g.name}</b><span>${g.desc}</span></div>`}).join('')}</div></section>`;
}
function achHtml(){return `<details class="fold"><summary>成就墙 <span class="tag">${S.achievements.length}/${ACHIEVEMENTS.length}</span></summary><div class="fold-body"><div class="facility-grid">${ACHIEVEMENTS.map(a=>{const got=S.achievements.includes(a[0]);return `<article class="facility" style="${got?'':'opacity:.55'}"><span class="tag ${got?'green':''}">${got?'✓ 已解锁':'未解锁'}</span><h3>${a[1]}</h3><p>${a[2]}</p></article>`}).join('')}</div></div></details>`}
function nextRivalSlate(count=12){return [...S.rivals].sort((a,b)=>a.nextStamp-b.nextStamp).slice(0,count)}
function slateHtml(list){return list.map(r=>`<div class="slate-item ${r.nextStamp===stamp()?'danger':''}"><b>${stampLabel(r.nextStamp).replace('年','.')}</b><span>${safe(r.name)} · ${r.nextGenre}新作 · ${audienceDefs[r.target].name}</span><span>实力 ${r.strength}</span></div>`).join('')}
function industryRank(){const own=Math.max(0,S.money+audienceTotal()*650+S.prestige*80000+S.ips.reduce((a,ip)=>a+ip.recognition*18000,0));return[...S.rivals.map(r=>({name:r.name,style:r.style,value:r.value})),{name:S.company,style:'你的公司',value:own}].sort((a,b)=>b.value-a.value)}
function renderStrategy(){const st=studio(),next=STUDIOS[S.studio+1];$('page-strategy').innerHTML=statHtml()+goalHtml()+cashHtml()+buzzHtml()+`<section class="card section">${sceneBanner('hq-office','五类观众资产','观众是可以被一部部作品养大的资产')}<div class="audience-grid">${audienceCards()}</div></section><section class="card section">${sceneBanner('rivals','竞争公司与片单','')}<div class="split"><div class="grow"><p class="subtle">对手会按片单真实发行。撞上同类型或同受众作品，会压低你的首发表现。</p></div><span class="tag">6 家公司</span></div><div class="rival-grid">${S.rivals.map(r=>`<article class="rival-card"><span class="tag">${r.style}</span>${S.bet&&S.bet.rivalId===r.id?'<span class="tag red">对赌进行中</span>':''}<h3>${safe(r.name)}</h3><p>主攻 ${r.focusGenre} · ${audienceDefs[r.target].name} · 实力 ${r.strength}<br>下部作品 ${stampLabel(r.nextStamp)} · ${r.nextGenre}<br>累计热门作品 ${r.hits}</p><div class="card-actions"><button ${stamp()<(r.poachCd||0)?'disabled':''} onclick="poachRival('${r.id}')">${stamp()<(r.poachCd||0)?'挖角冷却中':`挖角 · ${money(poachCost(r))}`}</button><button ${S.bet?'disabled':''} onclick="openBet('${r.id}')">对赌 · 50万</button></div></article>`).join('')}</div></section><details class="fold"><summary>未来片单 <span class="tag">${S.rivals.length} 家的排期</span></summary><div class="fold-body"><div class="slate">${slateHtml(nextRivalSlate())}</div></div></details><section class="card section"><h2>公司设施</h2><div class="facility-grid">${facilities.map(f=>`<article class="facility"><span class="tag">${S.facilities[f[0]]?'已建成':'待投资'}</span><h3>${f[1]}</h3><p>${f[2]}</p><button ${S.facilities[f[0]]?'disabled':''} onclick="buyFacility('${f[0]}')">${S.facilities[f[0]]?'投入使用中':money(f[3])}</button></article>`).join('')}</div></section><section class="card section"><div class="split upgrade-split"><div class="grow"><h2>场地升级</h2><p>${st.desc} 当前可同时制作 ${st.slots} 个项目。</p></div>${next?`<button class="primary" onclick="upgradeStudio()">升级至 ${next.name}<br><small>${money(st.upgrade)} · 开放 ${next.slots} 条管线</small></button>`:'<span class="tag green">最高等级 · 3条管线</span>'}</div></section>${achHtml()}<details class="fold"><summary>公司编年史 <span class="tag">${(S.chronicle||[]).length} 条</span></summary><div class="fold-body"><div class="card-actions" style="margin:0 0 10px"><button onclick="copyChronicle()">复制全文</button></div>${chronicleHtml(20)}</div></details>${hallHtml()}<section class="card section"><h2>存档与帮助</h2><div class="operation-grid"><button onclick="showInstallOffer(true)">装到桌面</button><button onclick="manualSave()">保存进度</button><button onclick="openDialog('helpDialog')">经营说明</button><button onclick="restTeam()">空闲成员轮休</button><button onclick="deleteSave()">删除存档</button></div></section><details class="fold"><summary>行业榜单</summary><div class="fold-body">${industryRank().map((x,i)=>`<div class="rank"><div class="no">#${i+1}</div><div><b>${safe(x.name)}</b><br><small>${x.style}</small></div><b>${money(x.value)}</b></div>`).join('')}</div></details>`}
function renderMain(){if(!S)return;({home:renderHome,scripts:renderScripts,crew:renderCrew,works:renderWorks,strategy:renderStrategy}[currentPage]||renderHome)()}
function renderClock(){$('clock').innerHTML=S?`<b><span class="clock-wide">${S.year} 年 ${S.month} 月 · 第 ${S.week} 周</span><span class="clock-compact">${S.year}.${S.month} · W${S.week}</span></b><small>${speed?speed+'× 推进中':'已暂停'}</small>`:''}
function render(){if(!S)return;renderClock();$('companyName').textContent=S.company;$('studioName').textContent=studio().name;$('trendPanel').innerHTML=trendHtml();if(newsRev!==lastNewsRev){lastNewsRev=newsRev;const f=$('newsFeed'),top=f.scrollTop;f.innerHTML=newsHtml();f.scrollTop=top}renderMain()}

function suggestedAudience(script){return Object.keys(audienceDefs).find(k=>audienceFit(script,k))||'mass'}
function openProject(id){if(S.projects.length>=studio().slots)return toast('制作管线已满，请先完成项目或升级场地。');selectedScript=S.scripts.find(x=>x.id===id);if(!selectedScript)return toast('这个剧本已经不在市场上了。');prepareProjectDialog()}
function openSequel(ipId,relation){if(S.projects.length>=studio().slots)return toast('制作管线已满。');const ip=S.ips.find(x=>x.id===ipId);if(!ip)return;if(relation==='reboot'&&ip.entries<2)return toast('至少完成两部作品后才能重启IP。');const suffix=relation==='sequel'?`${ip.entries+1}`:relation==='spinoff'?'：外传':`：新章`;selectedScript={id:null,title:ip.name+suffix,genre:ip.genre,theme:ip.theme,story:clamp(Math.round(ip.bestScore*8+relationDefs[relation].story-ip.fatigue*.12),48,88),heat:clamp(Math.round(ip.recognition-ip.fatigue*.35),35,95),cost:relationDefs[relation].cost,relation,ipId:ip.id,logline:`延续《${ip.name}》的世界与观众期待，开发一部${relationDefs[relation].name}。`};prepareProjectDialog()}
function prepareProjectDialog(){$('projectTitle').textContent=`筹备《${selectedScript.title}》`;$('filmName').value=selectedScript.title;$('filmScale').value=selectedScript.cost>300000?'cinema':'web';$('filmAudience').value=suggestedAudience(selectedScript);$('filmMarketing').value='100000';const ip=selectedScript.ipId?S.ips.find(x=>x.id===selectedScript.ipId):null;$('projectOriginHint').innerHTML=ip?`<b>${relationDefs[selectedScript.relation].name}</b> · IP知名度 ${Math.round(ip.recognition)}，当前疲劳 ${Math.round(ip.fatigue)}。高知名度提高开局，高疲劳会压低成片上限。`:`<b>原创项目</b> · 成功发行后将建立新IP，可继续开发续集、衍生作品和重启版本。`;$('crewPicks').innerHTML=S.staff.filter(e=>!e.status).map((e,i)=>`<label class="pick"><input type="checkbox" value="${e.id}" ${i<5?'checked':''}><span>${safe(e.name)}<small>${roles[e.role][0]} · 体力 ${e.energy}</small></span></label>`).join('')||'<div class="empty">没有空闲主创。请先等待项目完成或招募新人。</div>';previewProject();openDialog('projectDialog')}
function previewProject(){if(!selectedScript)return;const def=scaleDefs[$('filmScale').value],mk=+$('filmMarketing').value,target=$('filmAudience').value,fit=audienceFit(selectedScript,target),ip=selectedScript.ipId?S.ips.find(x=>x.id===selectedScript.ipId):null;$('projectPreview').innerHTML=`<b>基础投入 ${money(selectedScript.cost+def.base+mk)} · 制作约 ${def.weeks} 周</b><br>${audienceDefs[target].name}${fit?'与题材匹配，首映更容易形成口碑基本盘':'不是题材天然受众，需要更强成片与宣发说服市场'}。${ip&&ip.fatigue>=45?'<br><b style="color:var(--red)">IP疲劳偏高，本作评分和商业潜力将受到压制。</b>':''}`}
function startProject(){const ids=[...document.querySelectorAll('#crewPicks input:checked')].map(x=>+x.value),scale=$('filmScale').value,target=$('filmAudience').value,mk=+$('filmMarketing').value,def=scaleDefs[scale];if(!selectedScript)return;if(S.projects.length>=studio().slots)return toast('制作管线已满。');const picked=ids.map(id=>S.staff.find(e=>e.id===id)).filter(e=>e&&!e.status),upfront=selectedScript.cost+def.base+mk;if(picked.length<def.need)return toast(`${def.name}至少需要 ${def.need} 名空闲主创。`);if(!picked.some(e=>e.role==='director'))return toast('项目必须有一名导演。');if(S.origin==='crew'&&S.works.length<2&&scale!=='web')return toast('草台班子开局：前两部只能做网络电影。');if(S.money<upfront)return toast('资金不足，无法签约开机。');const p={id:'p'+nextId(),name:$('filmName').value.trim()||selectedScript.title,script:{...selectedScript},scale,target,marketing:mk,team:picked.map(e=>e.id),phase:0,progress:0,quality:{story:0,vision:0,performance:0,visual:0},spent:upfront,eventMarks:[],ready:false,polish:0,stalled:false,relation:selectedScript.relation||'original',ipId:selectedScript.ipId||null,offers:null};S.money-=upfront;S.projects.push(p);picked.forEach(e=>e.status='project:'+p.id);if(selectedScript.id)S.scripts=S.scripts.filter(x=>x.id!==selectedScript.id);addNews('项目开机',`《${p.name}》进入${PHASES[0].name}，核心受众为${audienceDefs[target].name}。`);selectedScript=null;closeDialog('projectDialog');showPage('home');save()}
function previewScore(p){const vals=Object.values(p.quality),craft=vals.reduce((a,b)=>a+b,0)/vals.length,team=teamOf(p),coverage=new Set(team.map(e=>e.role)),roleBonus=['producer','director','writer','actor','camera','editor'].filter(r=>coverage.has(r)).length*.13,facilityBonus=(S.facilities.screen?.35:0)+(S.facilities.sound?.12:0)+(S.facilities.edit?.12:0)+(S.facilities.casting?.06:0),trendBonus=(p.script.genre===S.trend.name||p.script.theme===S.trend.name)?.55:0,audBonus=audienceFit(p.script,p.target)?.22:-.08,ip=S.ips.find(x=>x.id===p.ipId),ipBonus=ip?Math.min(.42,ip.recognition/180)-Math.min(.75,ip.fatigue/90):0,overwork=team.filter(e=>e.energy<25).length*.18,chemBonus=Math.min(.28,teamChemistry(team)*.07),starBonus=Math.min(.3,team.reduce((a,e)=>a+(e.star?(e.starTrait==='versatile'?.15:.07):0),0));return clamp(3.5+p.script.story/30+craft/25+roleBonus+facilityBonus+trendBonus+audBonus+ipBonus+chemBonus+starBonus-overwork,3.8,scaleDefs[p.scale].cap)}
function ensureOffers(p){if(p.offers)return;p.offers={platform:{partner:['云帆视频','极光视频','海豚视频'][rnd(0,2)],factor:rnd(78,92)/100,cut:1},share:{partner:['云帆内容','星火剧场','新幕平台'][rnd(0,2)],factor:rnd(96,112)/100,cut:rnd(67,77)/100},theater:{partner:['远景发行','华星院线','银幕联合'][rnd(0,2)],factor:rnd(88,114)/100,cut:rnd(46,54)/100}}}
function competitionAt(slot,p){const rival=S.rivals.filter(r=>r.nextStamp===slot),own=S.works.filter(w=>w.startStamp===slot),pressure=clamp(rival.reduce((a,r)=>a+.03+(r.target===p.target?.12:0)+(r.nextGenre===p.script.genre?.08:0),0)+own.length*.08+(seasonAt(slot)[0]-1)*.45,0,.55);return{rival,own,pressure}}
function basePotential(p,deal,slot){const score=previewScore(p),team=teamOf(p),fit=audienceFit(p.script,p.target)?1.14:.92,trend=(p.script.genre===S.trend.name||p.script.theme===S.trend.name)?1.2:1,aud=1+Math.min(.42,S.audiences[p.target]/1600),marketing=1+Math.log10(1+p.marketing/100000)*(team.some(e=>e.star&&e.starTrait==='topic')?.24:.17),ip=S.ips.find(x=>x.id===p.ipId),ipFx=ip?1+Math.min(.3,ip.recognition/260)-Math.min(.35,ip.fatigue/130):1,starPow=1+Math.min(.4,team.reduce((a,e)=>a+(e.star?e.aura/(e.starTrait==='draw'?70:160):0),0)),scaleMismatch=p.scale==='web'&&deal==='theater'?.58:1,comp=competitionAt(slot,p);return(p.spent*(.52+score/7.7)+S.fame*90000)*fit*trend*aud*marketing*ipFx*starPow*scaleMismatch*seasonAt(slot)[0]*(1-comp.pressure)*(.85+buzzOf()/333)}
function releaseSlots(){return[0,1,2,3,4,5].map(i=>stamp()+i)}
function offerText(p,key,slot){const o=p.offers[key],potential=basePotential(p,key,slot)*o.factor;if(key==='platform')return`${o.partner} · 买断保底 ${money(potential*.78)}`;if(key==='share')return`${o.partner} · 预付 ${money(potential*.1)} · 公司分成 ${Math.round(o.cut*100)}%`;return`${o.partner} · 最低保证 ${money(potential*.05)} · 公司分账 ${Math.round(o.cut*100)}%`}
function renderRelease(){const p=projectById(selectedProjectId);if(!p)return;ensureOffers(p);p.score=previewScore(p);const slot=releaseSlots()[0];$('releaseBody').innerHTML=`${sceneBanner('release-deal','《'+safe(p.name)+'》','三家发行商的报价都已经送到')}${qualityGrid(k=>Math.round(p.quality[k]||0))}<p>内部试映 <b style="font-size:26px;color:var(--red)">${p.score.toFixed(1)}</b> 分 · 核心受众 ${audienceDefs[p.target].name}</p><h3>三份发行报价</h3><div class="deal-grid">${Object.keys(dealDefs).map((k,i)=>`<label class="deal"><input type="radio" name="releaseDeal" value="${k}" ${i===0?'checked':''} onchange="updateReleasePreview()"><span><b>${dealDefs[k].name}</b><small>${offerText(p,k,slot)}<br>${dealDefs[k].desc}</small></span></label>`).join('')}</div><div class="calendar-row"><div class="field"><label for="releaseSlot">选择首发档期</label><select id="releaseSlot" onchange="updateReleasePreview()">${releaseSlots().map(s=>{const se=seasonAt(s);return `<option value="${s}">${stampLabel(s)}${se[0]>1?` · ${se[1]} ×${se[0]}`:''}</option>`}).join('')}</select></div><div id="releasePreview" class="hint"></div></div><div class="hint">追加精剪真实消耗 2 周与 12 万元，最多 ${MAX_POLISH} 次（已用 ${p.polish}/${MAX_POLISH}）。等待档期期间主创会结束剧组工作，可以投入新项目。</div>`;$('polishBtn').disabled=p.polish>=MAX_POLISH||S.money<120000;requestAnimationFrame(updateReleasePreview)}
function openRelease(id){const p=projectById(id);if(!p||!p.ready)return;selectedProjectId=id;renderRelease();openDialog('releaseDialog')}
function updateReleasePreview(){const p=projectById(selectedProjectId),deal=document.querySelector('input[name="releaseDeal"]:checked')?.value,slot=+$('releaseSlot')?.value;if(!p||!deal||!slot)return;const c=competitionAt(slot,p),pressure=Math.round(c.pressure*100),names=c.rival.map(r=>`${r.name}（${r.nextGenre}/${audienceDefs[r.target].name}）`).concat(c.own.map(w=>`本公司《${w.name}》`));$('releasePreview').innerHTML=`<b>${seasonAt(slot)[1]}${seasonAt(slot)[0]>1?` · 商业倍率 ×${seasonAt(slot)[0]}`:''}</b><br><b>${pressure?`档期压力 ${pressure}%`:'档期相对宽松'}</b><br>${names.length?`同期作品：${names.map(safe).join('、')}`:'暂无已公布的直接竞争作品'}<br>${offerText(p,deal,slot)}`}
function polishProject(){const p=projectById(selectedProjectId);if(!p||!p.ready)return;if(p.polish>=MAX_POLISH)return toast('已经追加过两轮精剪。');if(S.money<120000)return toast('资金不足。');S.money-=120000;p.spent+=120000;p.polish++;p.quality.visual+=3;p.quality.story+=2;for(let i=0;i<2;i++)tickWeek(false);addNews('追加精剪',`《${p.name}》追加两周精剪。`);save();render();renderRelease()}
function confirmRelease(){const p=projectById(selectedProjectId),deal=document.querySelector('input[name="releaseDeal"]:checked')?.value,slot=+$('releaseSlot')?.value;if(!p||!deal||!slot)return;const o=p.offers[deal],score=previewScore(p),potential=basePotential(p,deal,slot)*o.factor,c=dealDefs[deal],advance=deal==='platform'?potential*.78:deal==='share'?potential*.1:potential*.05,releaseDate=stampDate(slot),w={id:'w'+nextId(),name:p.name,genre:p.script.genre,theme:p.script.theme,scale:p.scale,target:p.target,deal,channel:deal,score,cost:p.spent,potential,gross:advance,net:advance,weeks:0,startStamp:slot,releaseYear:releaseDate.year,releaseMonth:releaseDate.month,active:true,window:c.window,rate:c.rate,decay:c.decay,cut:o.cut,partner:o.partner,ops:{},ipId:p.ipId,season:seasonAt(slot)[0],moved:false,screenRate:0};
  if(deal==='theater'){w.screenRate=clamp(.1+score/45+Math.log10(1+p.marketing/100000)*.06+S.fame/70-competitionAt(slot,p).pressure*.3,.05,.42);w.decay=score>=7.8?.93:score>=7?.88:score>=6?.8:.62;w.potential*=.78+w.screenRate}const shareCut=Math.min(.3,p.team.reduce((a,id)=>a+(S.staff.find(x=>x.id===id)?.contract?.share||0),0));if(shareCut>0){w.cut*=1-shareCut;w.shareCut=shareCut}
  w.diag={pressure:competitionAt(slot,p).pressure,fit:audienceFit(p.script,p.target),season:seasonAt(slot)[0],marketing:p.marketing,weak:['story','vision','performance','visual'].reduce((a,k)=>(p.quality[k]||0)<(p.quality[a]||0)?k:a,'story')};
  S.money+=advance;S.works.push(w);p.team.forEach(id=>{const e=S.staff.find(x=>x.id===id);if(e&&e.status==='project:'+p.id){e.status=null;e.xp+=Math.round(score*10);if(e.xp>=100){e.xp-=100;e.level++;Object.keys(e.stats).forEach(k=>e.stats[k]+=rnd(2,5))}}});const initial=Math.round(score*12*(audienceFit(p.script,p.target)?1.18:.9)*(1-competitionAt(slot,p).pressure));S.audiences[p.target]+=initial;S.fame+=score>=8?1.8:score>=6.5?.8:.2;buzz(score>=8.4?7:score>=7.2?4:score<5.5?-5:0);S.prestige+=score>=8.4?3:0;for(let i=0;i<p.team.length;i++)for(let j=i+1;j<p.team.length;j++){const k=pairKey(p.team[i],p.team[j]);S.chemistry[k]=(S.chemistry[k]||0)+1}if(S.bet&&S.bet.myScore==null){S.bet.myScore=score;addNews('票房对赌',`《${p.name}》成为对赌作品，等待${S.bet.rivalName}的新作揭晓。`);resolveBet()}updateIpAfterRelease(p,w);chron(scoreLine(w));S.projects=S.projects.filter(x=>x.id!==p.id);addNews('发行签约',`《${p.name}》与${o.partner}签约，将于${stampLabel(slot)}通过${c.name}首发，获得 ${money(advance)}。`);selectedProjectId=null;closeDialog('releaseDialog');save();showPage('works');toast(`《${p.name}》完成签约定档！`)}
function updateIpAfterRelease(p,w){let ip=S.ips.find(x=>x.id===p.ipId);if(!ip){ip={id:'ip'+nextId(),name:p.name,genre:p.script.genre,theme:p.script.theme,recognition:0,fans:0,fatigue:0,entries:0,lastYear:S.year,bestScore:0};S.ips.push(ip)}ip.entries++;ip.recognition=clamp(ip.recognition+w.score*5+(w.score>=8?8:2),0,100);ip.fans+=Math.round(w.score*16);ip.fatigue=clamp(ip.fatigue+relationDefs[p.relation].fatigue-(S.year-ip.lastYear>=2?8:0),0,100);ip.lastYear=S.year;ip.bestScore=Math.max(ip.bestScore,w.score);w.ipId=ip.id}

// ── 合约与人员流动 ──
function ensureContracts(){S.staff.forEach(e=>{if(!e.contract||!Number.isFinite(+e.contract.until))e.contract={until:stamp()+rnd(30,54),share:+e.contract?.share||0}})}
function contractText(e){return e.contract?`合约至 ${stampLabel(e.contract.until)}${e.contract.share?` · 分红 ${Math.round(e.contract.share*100)}%`:''}`:''}
function leaveStaff(e){S.staff=S.staff.filter(x=>x.id!==e.id);S.projects.forEach(p=>{p.team=(p.team||[]).filter(id=>id!==e.id)})}
function renewDialog(e){
  e.contract.asked=true;
  const ask=Math.round(e.salary*(1.12+e.level*.035+(e.star?.22:0)+Math.random()*.1)/1000)*1000,mid=Math.round((ask+e.salary)/2/1000)*1000,left=Math.max(0,e.contract.until-stamp());
  showChoices('续约谈判',`<p><b>${safe(e.name)}</b>（${roles[e.role][0]} Lv.${e.level}）的合约还有 ${left} 个月到期。他开口要 ${money(ask)} 月薪，现在是 ${money(e.salary)}。</p>`,[
    {label:'按他开的价签三年',cost:0,note:`月薪涨到 ${money(ask)}`,apply:()=>{e.salary=ask;e.contract={until:stamp()+36,share:e.contract.share||0};addNews('续约',`${e.name}续约三年，月薪 ${money(ask)}。`)}},
    {label:`压到 ${money(mid)}`,cost:0,note:'六成把握，谈崩当场走人',apply:()=>{if(Math.random()<.6){e.salary=mid;e.contract={until:stamp()+24,share:e.contract.share||0};addNews('续约',`${e.name}接受 ${money(mid)} 续约两年。`)}else if(S.staff.length<=3){e.contract={until:stamp()+12,share:e.contract.share||0};addNews('续约',`${e.name}没谈拢，但公司实在走不了人，先续了一年。`)}else{leaveStaff(e);buzz(-3);addNews('谈崩',`${e.name}当场翻脸，收拾东西走了。`)}}},
    {label:'月薪不动，改成参与作品分红',cost:0,note:'他参与的作品，公司回款分出 6%',apply:()=>{e.contract={until:stamp()+30,share:(e.contract.share||0)+.06};addNews('续约',`${e.name}接受分红方案，续约两年半。`)}}
  ],()=>addNews('续约',`公司没给${e.name}答复，合约照常走向到期。`),'先放着不谈','sign');
}
function maybePoachMe(){
  const pool=S.staff.filter(e=>!String(e.status||'').startsWith('project:')&&(e.level>=2||e.star));
  if(!pool.length||S.staff.length<=3)return;
  const e=pool[rnd(0,pool.length-1)],r=S.rivals[rnd(0,S.rivals.length-1)],keep=Math.round(e.salary*rnd(4,7));
  showChoices('对手来挖人',`<p>${safe(r.name)}开出高价想签走 <b>${safe(e.name)}</b>。他没明说走不走，但已经把话带到公司了。</p>`,[
    {label:`加钱留人 · 一次性 ${money(keep)}`,cost:keep,note:'月薪 +12%，合约续两年',apply:()=>{e.salary=Math.round(e.salary*1.12);e.contract={until:stamp()+24,share:e.contract?.share||0};addNews('留人',`公司加钱留住了${e.name}。`)}},
    {label:'放他走',cost:0,note:`${r.name}实力 +3`,apply:()=>{leaveStaff(e);r.strength+=3;buzz(-2);addNews('人员流失',`${e.name}转投${r.name}。`)}}
  ],()=>{if(Math.random()<.5){leaveStaff(e);r.strength+=3;addNews('人员流失',`公司没接话，${e.name}自己去了${r.name}。`)}else addNews('挖角未遂',`${e.name}最后没走，但这事他记着。`)},'不表态','sign');
}
function processContracts(allowDialogs){
  if(!S.staff.length)return;ensureContracts();
  const now=stamp();
  for(const e of [...S.staff]){
    if(e.contract.until>now)continue;
    if(!e.contract.asked){e.contract.until=now+1;continue}
    if(String(e.status||'').startsWith('project:')){e.contract.until=now+2;e.contract.asked=false;addNews('合约到期',`${e.name}的合约已经到期，为了把手上的戏拍完先口头延了两个月。`);continue}
    if(S.staff.length<=3){e.contract.until=now+12;e.contract.asked=false;continue}
    leaveStaff(e);const r=S.rivals[rnd(0,S.rivals.length-1)];r.strength+=2;buzz(-2);
    addNews('人员流失',`${e.name}合约到期离开公司，下个月出现在${r.name}的新片名单里。`);
    return;
  }
  if(!allowDialogs||document.querySelector('dialog[open]'))return;
  const soon=S.staff.find(e=>!e.contract.asked&&e.contract.until-now<=3);
  if(soon){
    if(soon.level<3&&!soon.star){   // 普通员工自动续约，只发一条消息，不打断
      soon.salary=Math.round(soon.salary*1.08);
      soon.contract={until:now+rnd(30,48),share:soon.contract.share||0};
      addNews('续约',`${soon.name}按惯例续了约，月薪涨到 ${money(soon.salary)}。`);
      return;
    }
    return renewDialog(soon);
  }
  if(Math.random()<.1)maybePoachMe();
}
// ── 现金流自救：借款、卖断IP、承制外包 ──
function ipValue(ip){return Math.round(400000+ip.recognition*42000+ip.bestScore*130000-ip.fatigue*2600)}
function takeLoan(){
  if(S.debt>0)return toast('上一笔贷款还没还清。');
  if(S.money>=3000000)return toast('账上还有钱，银行不会批这笔周转贷。');
  S.money+=3000000;S.debt=3480000;S.debtPay=145000;
  chron('借了三百万周转。');addNews('融资','公司借入三百万周转资金，两年内每月还 14.5 万。');
  save();render();toast('三百万到账。');
}
function sellIp(id){
  const ip=S.ips.find(x=>x.id===id);if(!ip)return;
  const price=ipValue(ip);
  showChoices('卖断版权',`<p>有买家想买下《${safe(ip.name)}》的全部版权，出 ${money(price)}。</p><p class="subtle">卖掉之后这个IP就不属于公司了，续集、衍生、重启都做不了，已发行的作品也不再算在你的IP资产里。</p>`,
    [{label:`卖 · ${money(price)}`,cost:-price,note:'这个IP从此与公司无关',apply:()=>{
      S.works.forEach(w=>{if(w.ipId===ip.id)w.ipId=null});
      S.ips=S.ips.filter(x=>x.id!==ip.id);
      chron(`卖断了《${ip.name}》的版权。`);addNews('版权交易',`公司以 ${money(price)} 卖断《${ip.name}》全部版权。`);buzz(-2);
    }}],()=>addNews('版权交易',`公司没有卖《${ip.name}》。`),'再想想','sign');
}
function gigCrew(){return S.staff.filter(e=>!e.status).sort((a,b)=>b.stats.management-a.stats.management).slice(0,2)}
function openGig(){
  if(S.gig)return toast('手上已经有一单外包了。');
  const crew=gigCrew();
  if(crew.length<2)return toast('至少要有两名空闲主创才接得下外包。');
  const skill=(crew[0].stats.management+crew[1].stats.management)/2,pay=Math.round(280000+skill*4200);
  showChoices('接一单外包',`<p>一家广告公司要拍六周的宣传片，出 ${money(pay)}。活不体面，但能把账上的窟窿堵一堵。</p><p class="subtle">会占用 ${crew.map(e=>safe(e.name)).join('、')} 六周，这期间他们进不了剧组。</p>`,
    [{label:'接',cost:0,note:`六周后到账 ${money(pay)}`,apply:()=>{
      crew.forEach(e=>e.status='gig');S.gig={at:weekAbs()+6,pay,team:crew.map(e=>e.id)};
      addNews('承制',`公司接了一支广告宣传片，六周后结款 ${money(pay)}。`);
    }}],()=>addNews('承制','公司回绝了那单外包。'),'不接','sign');
}
function processGig(){
  if(!S.gig)return;
  if(weekAbs()<S.gig.at)return;
  S.money+=S.gig.pay;
  (S.gig.team||[]).forEach(id=>{const e=S.staff.find(x=>x.id===id);if(e&&e.status==='gig')e.status=null});
  addNews('承制结款',`宣传片交片，结款 ${money(S.gig.pay)}。`);
  S.gig=null;
}
function restTeam(){const list=S.staff.filter(e=>!e.status&&e.energy<95);if(!list.length)return toast('当前没有需要休整的空闲员工。');list.forEach(e=>e.status='rest');addNews('团队轮休',`${list.map(e=>e.name).join('、')}开始轮休。`);save();render()}
function endRest(){const list=S.staff.filter(e=>e.status==='rest');if(!list.length)return toast('当前没有正在休整的员工。');list.forEach(e=>e.status=null);addNews('结束轮休',`${list.length} 名主创回到待命状态。`);save();render()}
function rollCandidates(){const used=new Set(S.staff.map(e=>e.name));S.candidates=[];if(Math.random()<.18){const h=hallPick();if(h&&!used.has(h.name)){used.add(h.name);h.signing=Math.round(h.salary*rnd(3,5));S.candidates.push(h)}}if(Math.random()<(S.facilities.casting?.5:.28)){const e=makeStar(used);used.add(e.name);e.signing=Math.round(e.salary*rnd(3,5));S.candidates.push(e)}while(S.candidates.length<3){const name=freshName(used);used.add(name);const role=Object.keys(roles)[rnd(0,Object.keys(roles).length-1)],e=person(name,role,S.facilities.casting?8:0);e.signing=e.salary*rnd(2,4);S.candidates.push(e)}S.candidateKey=S.year*12+S.month}
function renderRecruit(){$('recruitBody').innerHTML=sceneBanner('casting','寻找新主创','')+`<p class="subtle">名单每月自然更新一次。当前团队 ${S.staff.length}/${studio().cap}。</p>`+(S.candidates.length?S.candidates.map((e,i)=>staffRow(e,`<span>签约金</span><button onclick="hire(${i})">${money(Math.round(e.signing*(1.25-buzzOf()/200)))}</button>`)).join(''):'<div class="empty">名单已空，点下方刷新。</div>')}
function openRecruit(){if(!S.candidates.length||S.candidateKey!==S.year*12+S.month)rollCandidates();renderRecruit();openDialog('recruitDialog')}
function refreshCandidates(){if(S.money<20000)return toast('资金不足。');S.money-=20000;rollCandidates();renderRecruit();save();render()}
function hire(i){const e=S.candidates[i];if(!e)return;if(S.staff.length>=studio().cap)return toast('团队已满，请先升级场地。');const price=Math.round(e.signing*(1.25-buzzOf()/200));if(S.money<price)return toast('签约资金不足。');S.money-=price;delete e.signing;e.contract={until:stamp()+rnd(30,48),share:0};S.staff.push(e);S.candidates.splice(i,1);addNews('新主创',`${e.name}以${roles[e.role][0]}身份加入公司，签约金 ${money(price)}。`);closeDialog('recruitDialog');save();render()}
function openPerson(id){const e=S.staff.find(x=>x.id===id);if(!e)return;$('personBody').innerHTML=`${portraitBox(e)}<h2>${safe(e.name)} <span class="tag">${roles[e.role][0]} Lv.${e.level}</span>${e.star?` <span class="tag red">★ ${starTraits[e.starTrait]?.name}</span>`:''}</h2><p>${e.trait}型创作者。${e.star?`明星主创，号召力 ${e.aura}：${starTraits[e.starTrait]?.desc}。`:''}${safe(statusText(e))}。</p>${qualityGrid(k=>e.stats[k])}<p>统筹 ${e.stats.management} · 体力 ${e.energy} · 月薪 ${money(e.salary)}${e.contract?` · ${contractText(e)}`:''}</p><div class="actions"><button ${String(e.status||'').startsWith('project:')?'disabled':''} onclick="restPerson(${e.id})">${e.status==='rest'?'结束休整':'安排休整'}</button><button ${String(e.status||'').startsWith('project:')?'disabled':''} onclick="dismissPerson(${e.id})">解除合约</button></div>`;openDialog('personDialog')}
function restPerson(id){const e=S.staff.find(x=>x.id===id);if(!e||String(e.status||'').startsWith('project:'))return;if(e.status==='rest'){e.status=null;addNews('结束休整',`${e.name}回到待命状态。`)}else{e.status='rest';addNews('安排休整',`${e.name}开始休整。`)}closeDialog('personDialog');save();render()}
function dismissPerson(id){const e=S.staff.find(x=>x.id===id);if(!e)return;if(String(e.status||'').startsWith('project:'))return toast('该成员正在参与项目，无法解约。');if(S.staff.length<=3)return toast('公司至少要保留 3 名成员。');S.money-=e.salary;S.staff=S.staff.filter(x=>x.id!==id);addNews('团队变动',`${e.name}离开公司，结清一个月薪资。`);closeDialog('personDialog');save();render()}

function openReschedule(id){
  const w=S.works.find(x=>x.id===id);if(!w||w.moved||stamp()>=w.startStamp)return;
  const fee=Math.round(w.cost*.08),slots=releaseSlots().filter(v=>v!==w.startStamp);
  closeDialog('reportDialog');
  showChoices('改档',`<p><b>《${safe(w.name)}》</b> · 原定 ${stampLabel(w.startStamp)} 上映。改一次档要赔发行方 ${money(fee)}，宣发节奏也要重来，只有一次机会。</p>`,
    slots.map(v=>{const se=seasonAt(v);return{label:`改到 ${stampLabel(v)}`,cost:fee,note:`${se[1]}${se[0]>1?` ×${se[0]}`:''}`,apply:()=>{
      const old=w.season||1,ns=se[0];w.potential*=ns/old;w.season=ns;w.startStamp=v;w.moved=true;
      const dt=stampDate(v);w.releaseYear=dt.year;w.releaseMonth=dt.month;
      addNews('改档',`《${w.name}》改到 ${stampLabel(v)} 上映。`)}}}),
    ()=>addNews('改档',`《${w.name}》维持原档期。`),'维持原档期','sign');
}
function showReport(id){const w=S.works.find(x=>x.id===id);if(!w)return;const profit=w.net-w.cost,started=stamp()>=w.startStamp,ip=S.ips.find(x=>x.id===w.ipId);$('reportBody').innerHTML=`<div class="premiere">${posterSvg(w.name,w.genre,w.score)}<div><h2 style="margin:0 0 6px">《${safe(w.name)}》</h2><p class="subtle">复盘 · ${postMortem(w)}</p></div></div><p><span class="tag">${w.genre}</span> <span class="tag">${audienceDefs[w.target].name}</span> <span class="tag">${dealDefs[w.deal].name}</span></p><div class="qualities"><div>观众评分<b>${w.score.toFixed(1)}</b></div><div>累计流水<b>${money(w.gross)}</b></div><div>公司回款<b>${money(w.net)}</b></div><div>项目盈亏<b style="color:${profit>=0?'var(--green)':'var(--red)'}">${money(profit)}</b></div></div><h3>发行状态</h3><div class="hint">合作方 ${safe(w.partner)} · ${workStatus(w)}。${w.deal==='theater'?`首周排片率约 ${Math.round(w.screenRate*100)}%，口碑决定后续跌幅。`:''}${(w.season||1)>1?`档期为${seasonAt(w.startStamp)[1]}。`:''}${ip?`所属IP知名度 ${Math.round(ip.recognition)}，疲劳 ${Math.round(ip.fatigue)}。`:''}</div>${stamp()<w.startStamp&&!w.moved?`<div class="card-actions"><button onclick="openReschedule('${w.id}')">改档 · ${money(Math.round(w.cost*.08))}</button></div>`:''}<h3>发行后运营</h3><div class="card-actions"><button ${!started||!w.active||w.ops.campaign||w.weeks>12||S.money<180000?'disabled':''} onclick="postOperate('${w.id}','campaign')">追加宣传 · 18万</button><button ${!started||w.ops.overseas||w.weeks<4||w.score<7?'disabled':''} onclick="postOperate('${w.id}','overseas')">海外版权</button><button ${!started||w.ops.cut||w.weeks<8||w.score<6.5||S.money<220000?'disabled':''} onclick="postOperate('${w.id}','cut')">导演剪辑版 · 22万</button></div><p class="subtle">宣传限主发行期且首发12周内一次；海外版权需上映4周且评分不低于7.0；导演剪辑版需上映8周且评分不低于6.5。</p>`;openDialog('reportDialog')}
function postOperate(id,type){const w=S.works.find(x=>x.id===id);if(!w)return;if(type==='campaign'){if(!w.active||w.ops.campaign||w.weeks>12)return;if(S.money<180000)return toast('资金不足。');S.money-=180000;w.ops.campaign=true;if(w.rate>0)w.potential*=1.12;S.audiences[w.target]+=Math.round(w.score*3);buzz(2);addNews('追加宣传',`《${w.name}》启动第二轮宣传，继续争取${audienceDefs[w.target].name}。`)}else if(type==='overseas'){if(w.ops.overseas||w.weeks<4||w.score<7)return;const income=Math.round(w.potential*.08);w.ops.overseas=true;w.gross+=income;w.net+=income;S.money+=income;S.fame+=.4;buzz(2);addNews('海外版权',`《${w.name}》售出海外版权，回款 ${money(income)}。`)}else if(type==='cut'){if(w.ops.cut||w.weeks<8||w.score<6.5)return;if(S.money<220000)return toast('资金不足。');S.money-=220000;w.ops.cut=true;w.score=clamp(w.score+.15,0,10);if(w.rate>0)w.potential*=1.05;const ip=S.ips.find(x=>x.id===w.ipId);if(ip)ip.recognition=clamp(ip.recognition+3,0,100);addNews('导演剪辑版',`《${w.name}》推出导演剪辑版，长尾口碑回升。`)}save();render();showReport(id)}

// ── 对手互动：挖角与票房对赌 ──
function poachCost(r){return 400000+r.strength*8000}
function poachRival(id){
  const r=S.rivals.find(x=>x.id===id);if(!r)return;
  if(stamp()<(r.poachCd||0))return toast('刚接触过对方团队，风声太紧，过几个月再试。');
  if(S.staff.length>=studio().cap)return toast('团队已满，请先升级场地。');
  const cost=poachCost(r);if(S.money<cost)return toast('资金不足。');
  S.money-=cost;r.poachCd=stamp()+8;
  const chance=clamp(.5+S.fame/50-r.strength/300,.25,.8);
  if(Math.random()<chance){
    const used=new Set(S.staff.map(e=>e.name)),e=r.strength>=70?makeStar(used):person(freshName(used),Object.keys(roles)[rnd(0,Object.keys(roles).length-1)],14);
    S.staff.push(e);r.strength=Math.max(40,r.strength-5);S.flags.poached=true;
    addNews('挖角成功',`${e.name}从${r.name}跳槽加入公司${e.star?'，业内哗然':''}。对方阵容受损。`);toast(`挖角成功：${e.name} 加入`);
  }else{
    S.money+=Math.round(cost*.6);
    addNews('挖角失败',`${r.name}提高待遇留住了核心主创，定金损失 ${money(Math.round(cost*.4))}。`);toast('挖角失败，对方选择留下。');
  }
  save();render();
}
function openBet(id){
  const r=S.rivals.find(x=>x.id===id);if(!r)return;
  if(S.bet)return toast('已有进行中的对赌协议。');
  if(S.money<500000)return toast('资金不足，对赌需要 50 万保证金。');
  showChoices('票房对赌',`<p>与${safe(r.name)}签订对赌协议：以 <b>50 万</b>为注，赌你<b>下一部签约发行的作品</b>评分高于对方<b>下一部新作</b>（${stampLabel(r.nextStamp)}）。赢者通吃，拿走双倍保证金与行业声望。</p>`,[
    {label:'签下对赌协议',cost:500000,note:'赢得 ¥1,000,000 与声望 +2',apply:()=>{S.bet={rivalId:r.id,rivalName:r.name,stake:500000,myScore:null,rivalScore:null};addNews('票房对赌',`公司与${r.name}签订 50 万票房对赌协议。`)}}
  ],()=>{},'再想想')
}
function resolveBet(){const b=S.bet;if(!b||b.myScore==null||b.rivalScore==null)return;if(b.myScore>b.rivalScore){S.money+=b.stake*2;S.prestige+=2;S.flags.betWon=true;addNews('对赌获胜',`你的作品以 ${b.myScore.toFixed(1)} 比 ${b.rivalScore.toFixed(1)} 胜出，赢得 ${money(b.stake*2)}。`);toast('对赌获胜！')}else{addNews('对赌落败',`对方新作 ${b.rivalScore.toFixed(1)} 分胜过你的 ${b.myScore.toFixed(1)} 分，保证金归对方。`)}S.bet=null}

function reserveOk(cost){if(S.projects.length||S.works.some(w=>w.active)||S.money-cost>=MIN_RESERVE)return true;toast('这笔投入会让公司无力启动下一部作品，请先留出周转资金。');return false}
function buyFacility(id){const f=facilities.find(x=>x[0]===id);if(!f||S.facilities[id])return;if(S.money<f[3])return toast('资金不足。');if(!reserveOk(f[3]))return;S.money-=f[3];S.facilities[id]=true;addNews('设施升级',`${f[1]}建成投入使用。`);save();render()}
function upgradeStudio(){const cost=studio().upgrade;if(cost==null)return;if(S.money<cost)return toast('资金不足。');if(!reserveOk(cost))return;S.money-=cost;S.studio++;chron(`公司搬进${studio().name}。`);addNews('公司搬迁',`公司升级至${studio().name}，开放 ${studio().slots} 条制作管线。`);save();render()}
// showModal() 的弹窗在浏览器 top layer 里，z-index 再高也压不过去。
// 有弹窗开着的时候，把 toast 挂进那个弹窗，它才看得见。
function toastHost(){const ds=document.querySelectorAll('dialog[open]');return ds.length?ds[ds.length-1]:document.body}
function toast(text){
  const t=$('toast'),host=toastHost();
  if(t.parentNode!==host)host.appendChild(t);
  t.textContent=text;t.classList.add('show');
  clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),2200);
}
// 弹窗关掉（× / ESC / 按钮都算）之后把 toast 收回 body，否则它跟着一起消失
document.addEventListener('close',e=>{
  const t=$('toast');
  if(t&&e.target&&e.target.contains&&e.target.contains(t))document.body.appendChild(t);
},true);

$('continueBtn').disabled=!hasSave();
window.addEventListener('beforeunload',save);

// ── 乐趣层：编年史文案、程序化海报、首映夜、复盘、结局、名人堂 ──
const HALL_KEY='film_studio_hall_v1';let posterSeq=0;
function scoreLine(w){const s=w.score;return `《${w.name}》上映，${s.toFixed(1)} 分，`+(s>=8.5?'散场灯亮了还有人坐着没动。':s>=7.5?'口碑站住了。':s>=6.5?'不功不过。':s>=5.5?'观众出来没什么话说。':'首周就被挤出了排片表。')}
function posterSvg(name,genre,score){
  const g=GENRE_COLORS[genre]||'#6b4c3d',clean=String(name).replace(/[《》]/g,''),chars=[...clean].slice(0,7);
  const seed=chars.reduce((a,c)=>a+c.charCodeAt(0),0),v=seed%4,uid=`pg${++posterSeq}`;
  const deco=v===0?`<circle cx="86" cy="48" r="29" fill="#f2d49a" opacity=".8"/>`
    :v===1?`<path d="M120 180 L58 66 L120 66 Z" fill="#f2d49a" opacity=".62"/>`
    :v===2?`<g fill="#f2d49a" opacity=".62"><rect x="68" y="22" width="7" height="140"/><rect x="83" y="44" width="7" height="118"/><rect x="98" y="70" width="7" height="92"/></g>`
    :`<path d="M0 180 L120 44 L120 180 Z" fill="#ffffff" opacity=".1"/><circle cx="92" cy="36" r="15" fill="#f2d49a" opacity=".85"/>`;
  const title=chars.map((c,i)=>`<text x="23" y="${36+i*17}" font-size="15" font-family="serif" fill="#fdf3e2">${safe(c)}</text>`).join('');
  return `<svg class="poster-svg" viewBox="0 0 120 180" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${safe(clean)}">`
    +`<defs><linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${g}"/><stop offset="1" stop-color="#191311"/></linearGradient></defs>`
    +`<rect width="120" height="180" fill="url(#${uid})"/>${deco}`
    +`<rect x="8" y="8" width="104" height="164" fill="none" stroke="#e8c98a" stroke-opacity=".5"/>${title}`
    +(score!=null?`<text x="99" y="157" font-size="15" font-family="serif" fill="#f0c674" text-anchor="end">${score.toFixed(1)}</text>`:'')+`</svg>`;
}
function premiereLine(w){
  if(w.deal==='platform')return '今天零点上线，平台首页给了个角标，剩下的就看有没有人点进去。';
  if(w.deal==='share')return '上线即分账，能走多远全看后面几周的留存。';
  if(w.screenRate>=.3)return '首日排片给得很足，影院经理认这个阵容。';
  if(w.screenRate<=.14)return '排片只有个位数，要靠上座率一场一场打回来。';
  return '排片中规中矩，首周末是关键。';
}
function premiereDialog(w){
  const html=sceneBanner('premiere',`《${safe(w.name)}》今日公映`,`${seasonAt(w.startStamp)[1]} · ${dealDefs[w.deal].name}`)
    +`<div class="premiere">${posterSvg(w.name,w.genre,w.score)}<div><div class="big-score">${w.score.toFixed(1)}</div>`
    +`<p>${w.genre} · ${audienceDefs[w.target].name} · 合作方 ${safe(w.partner)}</p><p>${premiereLine(w)}</p></div></div>`;
  showChoices('首映',html,[],null,'知道了');
}
function postMortem(w){
  const d=w.diag||{};
  if(d.fit===false)return '受众选错了：这个题材对着这批观众发，天然要多花一倍力气。';
  if((d.pressure||0)>=.28)return '档期太挤：同期撞上的片子分走了排片和注意力。';
  if(w.deal==='theater'&&(d.marketing||0)<=100000)return '宣发太省：院线片只投了十万，影院经理根本不知道有这部片。';
  if((d.season||1)===1&&w.deal==='theater')return '档期太平：避开了所有大档期，也就避开了所有人流。';
  if(d.weak)return `短板在${(QUALITIES.find(q=>q[0]===d.weak)||[,'制作'])[1]}：这一项从开机就没补上来。`;
  return '没有明显短板，这个分数就是它的样子。';
}
function chronicleHtml(limit){
  const list=(S.chronicle||[]).slice(limit?-limit:0);
  if(!list.length)return '<p class="subtle">还没有写进编年史的事。</p>';
  return `<div class="chron">${list.map(l=>`<div>${safe(l)}</div>`).join('')}</div>`;
}
function copyChronicle(){
  const txt=`${S.company} ${S.year} 年编年史\n`+(S.chronicle||[]).join('\n');
  const done=()=>toast('编年史已复制到剪贴板。');
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(done,()=>fallbackCopy(txt,done));
  else fallbackCopy(txt,done);
}
function fallbackCopy(txt,done){try{const t=document.createElement('textarea');t.value=txt;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();done()}catch(e){toast('这个浏览器不让复制，长按选中吧。')}}
function endingOf(){
  const works=S.works,avg=works.length?works.reduce((a,w)=>a+w.score,0)/works.length:0;
  const value=Math.max(0,S.money+audienceTotal()*700+S.prestige*100000+S.ips.reduce((a,ip)=>a+ip.recognition*25000,0));
  const grade=value>45000000?'S':value>28000000?'A':value>15000000?'B':value>7000000?'C':'D';
  const plat=works.length?works.filter(w=>w.deal==='platform').length/works.length:0;
  let key,title,line;
  if(S.prestige>=55&&avg>=7.6&&works.length>=6){key='auteur';title='作者厂牌';line='十年下来公司没做成最大的那个，但提起这块牌子，圈里知道它意味着什么样的片子。'}
  else if(value>=45000000&&works.length>=12){key='giant';title='行业巨头';line='片单排到了三年之后，档期表上你的名字挡在别人前面。'}
  else if(plat>=.6&&works.length>=12){key='factory';title='平台代工厂';line='账面不难看，片子一部接一部，但没人说得出这家公司到底是做什么的。'}
  else if(S.flags.outsideMoney&&value>=15000000){key='sold';title='被收购退场';line='资本方行使了优先权，公司整体并进对方的内容板块，你留了个虚职。'}
  else{key='plain';title='还在拍';line='没成巨头也没散伙，十年了还在开机，这件事本身就是个成绩。'}
  const html=`<div style="text-align:center"><div style="font:72px/1 serif;color:var(--red)">${grade}</div><h2 style="margin:6px 0">${title}</h2></div><p>${line}</p>`
    +`<div class="hint">公司估值 ${money(value)} · 发行 ${works.length} 部 · 平均 ${avg.toFixed(2)} 分 · 声望 ${S.prestige} · 观众 ${NF.format(audienceTotal())} 万</div>`
    +`<h3>公司编年史</h3>${chronicleHtml()}<div class="card-actions"><button onclick="copyChronicle()">复制这份编年史</button></div>`;
  return{key,title,html,scene:(key==='factory'||key==='sold')?'ending-fall':'ending-rise'};
}
function saveHall(){
  try{
    const cur=JSON.parse(localStorage.getItem(HALL_KEY)||'[]');
    const mine=[...S.staff].sort((a,b)=>(b.level+(b.star?2:0))-(a.level+(a.star?2:0))).slice(0,3)
      .map(e=>({name:e.name,role:e.role,level:e.level,star:!!e.star,face:e.face||null,from:S.company,year:S.year}));
    localStorage.setItem(HALL_KEY,JSON.stringify([...mine,...cur].slice(0,12)));
  }catch(e){}
}
function hallPick(){
  try{
    const cur=JSON.parse(localStorage.getItem(HALL_KEY)||'[]');
    if(!cur.length||!roles[cur[0].role])return null;
    const h=cur[rnd(0,cur.length-1)];if(!roles[h.role])return null;
    const e=person(h.name,h.role,10);
    e.level=Math.max(1,Math.min(9,+h.level||1));if(h.face)e.face=h.face;
    if(h.star){e.star=true;e.aura=rnd(8,16);e.starTrait=Object.keys(starTraits)[rnd(0,3)];e.salary=Math.round(e.salary*2.2)}
    Object.keys(e.stats).forEach(k=>e.stats[k]+=e.level*3);
    e.hall=true;e.hallFrom=h.from||'上一家公司';
    return e;
  }catch(err){return null}
}
function hallHtml(){
  let cur=[];try{cur=JSON.parse(localStorage.getItem(HALL_KEY)||'[]')}catch(e){}
  return `<details class="fold"><summary>名人堂 <span class="tag">${cur.length} 人</span></summary><div class="fold-body">`
    +(cur.length?`<p class="subtle">上几局留下的主创。他们有机会重新出现在招募名单里。</p><div class="facility-grid">${cur.map(h=>`<article class="facility"><span class="tag">${roles[h.role]?roles[h.role][0]:'主创'} Lv.${h.level}</span><h3>${safe(h.name)}${h.star?' ★':''}</h3><p>${safe(h.from||'')} · ${h.year} 年</p></article>`).join('')}</div>`
      :'<p class="subtle">还没有人进入名人堂。一局结束时，公司里最出色的三个人会留在这里。</p>')+`</div></details>`;
}
