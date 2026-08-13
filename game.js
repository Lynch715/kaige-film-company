'use strict';

const KEY='film_studio_sim_v1',VERSION=1;
const roles={producer:['制片人','management'],director:['导演','vision'],writer:['编剧','story'],actor:['演员','performance'],camera:['摄影指导','visual'],editor:['剪辑师','visual'],art:['美术指导','visual'],marketing:['宣发经理','management']};
const roleColors={producer:'#91643e',director:'#9d3e38',writer:'#4f7184',actor:'#a35e78',camera:'#496c59',editor:'#555b80',art:'#a1663f',marketing:'#8b743c'};
const names=['程屿','沈望','林栖','苏念','赵可','梁舟','何野','顾遥','陈默','许星','方琪','陆青','姜禾','周寻','唐棠','白砚','夏川','孟真','秦漾','邵宁','温故','聂川','严昭','霍岚','施亦','卓然','裴今','俞穗','屈墨','单弦'];
const genres=['都市','悬疑','喜剧','爱情','动作','科幻','历史','家庭'];
const themes=['逆风翻盘','秘密往事','小城生活','职场博弈','亲情和解','孤胆追凶','青春成长','未来寓言','江湖恩怨','女性成长'];
const titles=['雾散以前','南方来信','无人知晓的夜','最后一班车','逆光而行','纸上迷城','第七码头','长街短梦','故乡来电','远山有火','星期八见','海边来客'];
const traits=['稳健','灵感型','较真','高效率','善沟通'];
const starTraits={
  draw:{name:'票房号召力',desc:'参与作品的商业潜力大幅提升'},
  award:{name:'奖项体质',desc:'公司作品更容易拿下金幕奖'},
  topic:{name:'话题体质',desc:'宣发效果更强，但存在塌房风险'},
  versatile:{name:'戏路百变',desc:'参与作品的成片评分明显提升'}
};
const STUDIOS=[
  {name:'城郊旧摄影棚',stage:'一号棚 · 城市街景',rent:70000,cap:8,slots:1,upgrade:1600000,desc:'一支剧组独立推进，适合打磨第一部代表作。'},
  {name:'联合制片中心',stage:'联合摄影棚 · 室内景',rent:160000,cap:12,slots:2,upgrade:4200000,desc:'开放双项目排期，需要在主创和档期之间取舍。'},
  {name:'灯塔影视基地',stage:'灯塔基地 · 综合片场',rent:320000,cap:18,slots:3,upgrade:null,desc:'三条制作线并行，真正经营公司的作品组合。'}
];
const PHASES=[{name:'剧本开发',stat:'story',quality:'story'},{name:'前期筹备',stat:'management',quality:'vision'},{name:'正式拍摄',stat:'performance',quality:'performance'},{name:'后期制作',stat:'visual',quality:'visual'}];
const QUALITIES=[['story','故事'],['vision','导演'],['performance','表演'],['visual','视听']];
const scaleDefs={web:{name:'网络电影',base:650000,weeks:12,need:3,cap:7.5},cinema:{name:'院线电影',base:2300000,weeks:22,need:4,cap:9.2},series:{name:'精品剧集',base:3900000,weeks:30,need:5,cap:9.5}};
const facilities=[
  ['sound','同期声棚','拍摄体力消耗 -1，表演完成度 +10%，成片评分 +0.12',900000],
  ['edit','数字后期室','后期推进速度 +10%，视听完成度 +10%，成片评分 +0.12',1500000],
  ['casting','选角工作室','候选人核心能力显著提高，成片评分 +0.06',2100000],
  ['screen','内部看片室','成片评分 +0.35',2800000]
];
const trends=[['悬疑','观众正在寻找能反复推理的故事'],['喜剧','轻松解压成为档期关键词'],['女性成长','平台加大现实题材采购'],['科幻','视效大片重新点燃市场'],['家庭','温暖现实主义口碑走高'],['动作','硬桥硬马的动作片回潮']];
const audienceDefs={
  youth:{name:'年轻观众',desc:'偏爱科幻、动作、喜剧与青春表达',likes:['科幻','动作','喜剧','青春成长']},
  family:{name:'家庭观众',desc:'重视家庭、喜剧和温暖现实题材',likes:['家庭','喜剧','亲情和解','小城生活']},
  women:{name:'女性观众',desc:'关注爱情、都市与女性成长',likes:['爱情','都市','女性成长','职场博弈']},
  cinephile:{name:'核心影迷',desc:'偏好悬疑、历史与作者表达',likes:['悬疑','历史','秘密往事','未来寓言']},
  mass:{name:'大众市场',desc:'接受度广，尤其关注动作与都市热门项目',likes:['动作','都市','喜剧','孤胆追凶']}
};
const relationDefs={original:{name:'原创首作',cost:0,fatigue:0,story:0},sequel:{name:'正统续集',cost:220000,fatigue:18,story:6},spinoff:{name:'衍生作品',cost:160000,fatigue:10,story:2},reboot:{name:'重启制作',cost:320000,fatigue:-22,story:4}};
const dealDefs={
  platform:{name:'流媒体版权买断',window:8,rate:0,decay:1,baseCut:1,desc:'签约即获得大额保底，后续没有周分账，适合快速回笼资金。'},
  share:{name:'平台网络分账',window:52,rate:.07,decay:.95,baseCut:.72,desc:'小额预付款加长尾分账，收益取决于持续留存。'},
  theater:{name:'院线联合发行',window:28,rate:.25,decay:.87,baseCut:.5,desc:'保底很少，首周排片、口碑和档期会显著放大结果。'}
};
const rivalTemplates=[
  ['星河传媒','头部商业大片','动作','mass',82],['北岸影业','现实主义精品','都市','cinephile',70],['青禾内容','流媒体剧集','家庭','family',63],
  ['飞鸟映画','青年类型片','悬疑','youth',59],['盛景娱乐','明星商业制作','爱情','women',74],['九州影业','历史与东方故事','历史','cinephile',67]
];
const projectEvents=[
  {phase:0,title:'编剧对结局意见相左',text:'主笔坚持留白，平台顾问希望给出明确答案。',choices:[['保留留白',0,'story',6],['组织试读会',90000,'vision',7]]},
  {phase:0,title:'原著作者要求保留支线',text:'删掉支线会让节奏更紧，但可能失去原作气质。',choices:[['保留支线',0,'story',5],['购买改编授权',120000,'vision',8]]},
  {phase:0,title:'类型定位出现分歧',text:'主创争论该更商业，还是坚持更冷峻的表达。',choices:[['加强类型钩子',60000,'story',7],['坚持作者路线',0,'vision',5]]},
  {phase:1,title:'核心场景超出预算',text:'美术组的方案很漂亮，但搭景报价明显高于计划。',choices:[['缩小场景规模',0,'management',5],['保留完整设计',180000,'visual',9]]},
  {phase:1,title:'主演档期突然冲突',text:'主演只能留下较短的集中拍摄窗口。',choices:[['重排通告',70000,'management',7],['启用替身方案',0,'performance',4]]},
  {phase:1,title:'分镜方案需要预演',text:'复杂调度未经预演可能拖慢正式拍摄。',choices:[['安排技术预演',100000,'vision',8],['片场随机应变',0,'management',4]]},
  {phase:2,title:'雨戏等不到雨',text:'天气预报连续放晴，外景组每天都在空等。',choices:[['改成夜戏',0,'vision',5],['调来洒水车',160000,'visual',8]]},
  {phase:2,title:'主演提出即兴修改',text:'主演认为照本宣科会失去人物真实感。',choices:[['允许即兴',30000,'performance',7],['坚持分镜',0,'vision',5]]},
  {phase:2,title:'动作场面保险升级',text:'保险公司要求降低风险，否则必须补充保费。',choices:[['改为近景剪辑',0,'visual',5],['升级安全保障',140000,'performance',8]]},
  {phase:3,title:'剪辑发现关键空镜不足',text:'情绪落点缺了一个能让观众安静下来的镜头。',choices:[['补拍一天',120000,'visual',7],['用现有素材重构',0,'story',4]]},
  {phase:3,title:'试映观众对节奏分化',text:'年轻观众喜欢速度，核心影迷更在意人物停顿。',choices:[['压缩十分钟',80000,'visual',7],['保留人物呼吸',0,'story',5]]},
  {phase:3,title:'主题曲临时获得机会',text:'一位知名音乐人愿意低价合作，但需要马上决定。',choices:[['签下主题曲',150000,'performance',8],['沿用原创配乐',0,'vision',5]]},
  // 带链式后果的事件：第 5 个元素是 chain id，选择后会在数周后触发后续事件
  {phase:0,title:'题材踩到敏感边界',text:'剧本里一段现实指涉引发内部争论：保留会更有力量，但可能在后期迎来修改意见。',choices:[['大胆保留',0,'story',8,'censor'],['稳妥改写',0,'story',3]]},
  {phase:1,title:'品牌方带钱进组',text:'一家饮料品牌愿意注资 40 万，换取多处植入镜头。',choices:[['接受植入',-400000,'management',2,'placement'],['婉拒合作',0,'vision',4]]},
  {phase:2,title:'主演拍打戏扭伤',text:'医生建议停机休养，主演表示还能坚持。',choices:[['停机休养',0,'management',3],['带伤硬拍',0,'performance',7,'injury']]}
];
const MIN_RESERVE=900000,MAX_POLISH=2;
const GOALS=[
  {id:'debut',name:'公司处女作',desc:'完成并签约发行第一部作品',check:()=>S.works.length>=1,reward:()=>{S.money+=500000},rw:'行业扶持金 ¥500,000'},
  {id:'quality',name:'口碑立足',desc:'发行一部评分 7.5 以上的作品',check:()=>S.works.some(w=>w.score>=7.5),reward:()=>{S.fame+=2},rw:'公司名气 +2'},
  {id:'ip2',name:'打造系列IP',desc:'把任意一个IP开发到第 2 部',check:()=>S.ips.some(ip=>ip.entries>=2),reward:()=>{S.money+=800000},rw:'IP开发基金 ¥800,000'},
  {id:'award',name:'冲击金幕奖',desc:'拿下任意一座金幕奖',check:()=>!!S.flags.awardWon,reward:()=>{S.money+=1000000},rw:'获奖分红 ¥1,000,000'},
  {id:'base',name:'自己的基地',desc:'升级到灯塔影视基地，开放三条管线',check:()=>S.studio>=2,reward:()=>{S.prestige+=6},rw:'行业声望 +6'},
  {id:'aud',name:'观众帝国',desc:'五类观众资产总量达到 1,200 万',check:()=>audienceTotal()>=1200,reward:()=>{S.fame+=3},rw:'公司名气 +3'},
  {id:'top',name:'行业第一',desc:'公司估值登顶行业榜单',check:()=>industryRank()[0].name===S.company,reward:()=>{S.prestige+=10},rw:'行业声望 +10'}
];
const ACHIEVEMENTS=[
  ['master','神作降临','发行一部 9.0 分以上的作品',()=>S.works.some(w=>w.score>=9)],
  ['gold','票房奇迹','单部作品累计回款超过 ¥8,000,000',()=>S.works.some(w=>w.net>=8000000)],
  ['machine','高产之年','同一年内发行 3 部作品',()=>{const c={};return S.works.some(w=>(c[w.releaseYear]=(c[w.releaseYear]||0)+1)>=3)}],
  ['star','群星闪耀','同时拥有 3 名明星主创',()=>S.staff.filter(e=>e.star).length>=3],
  ['poach','挖角大师','成功从竞争对手手中挖来主创',()=>!!S.flags.poached],
  ['bet','赌神','赢下一次票房对赌',()=>!!S.flags.betWon],
  ['duo','黄金搭档','让同一对主创合作发行 3 部作品',()=>Object.values(S.chemistry).some(n=>n>=3)],
  ['full','人才济济','团队规模达到 18 人',()=>S.staff.length>=18],
  ['allfac','设施齐备','建成全部四座公司设施',()=>facilities.every(f=>S.facilities[f[0]])],
  ['calm','公关高手','平安化解一次明星塌房危机',()=>!!S.flags.scandalHandled]
];

let S=null,speed=1,timer=null,currentPage='home',selectedScript=null,selectedProjectId=null,pauseBefore=null,modalDepth=0,idSeq=0,newsRev=0,lastNewsRev=-1,saveWarned=false,activeEvent=null;
const $=id=>document.getElementById(id),clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const NF=new Intl.NumberFormat('zh-CN'),money=n=>`${n<0?'-':''}¥${NF.format(Math.abs(Math.round(n)))}`;
const safe=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const nextId=()=>++idSeq,studio=()=>STUDIOS[clamp(S.studio,0,STUDIOS.length-1)],stamp=(y=S.year,m=S.month)=>y*12+(m-1);
const stampDate=n=>({year:Math.floor(n/12),month:n%12+1}),stampLabel=n=>{const d=stampDate(n);return `${d.year}年${d.month}月`};
const projectById=id=>S.projects.find(p=>p.id===id),teamOf=p=>(p?.team||[]).map(id=>S.staff.find(e=>e.id===id)).filter(Boolean);
const audienceTotal=()=>Object.values(S.audiences).reduce((a,b)=>a+(+b||0),0),payroll=()=>S.staff.reduce((a,e)=>a+e.salary,0),monthlyBurn=()=>payroll()+studio().rent;
const qualityGrid=get=>`<div class="qualities">${QUALITIES.map(([k,label])=>`<div>${label}<b>${get(k)}</b></div>`).join('')}</div>`;
const audienceFit=(script,target)=>audienceDefs[target].likes.includes(script.genre)||audienceDefs[target].likes.includes(script.theme);

function freshName(used){const pool=names.filter(n=>!used.has(n));if(pool.length)return pool[rnd(0,pool.length-1)];for(let i=2;i<500;i++){const c=names[rnd(0,names.length-1)]+i;if(!used.has(c))return c}return '新人'+rnd(1000,9999)}
function person(name,role,boost=0){const x={story:rnd(28,48),vision:rnd(28,48),performance:rnd(25,45),visual:rnd(28,48),management:rnd(25,45)};x[roles[role][1]]+=22+boost;return{id:nextId(),name,role,level:1,salary:rnd(52000,76000),energy:100,xp:0,stats:x,status:null,trait:traits[rnd(0,traits.length-1)]}}
function makeStar(used){const name=freshName(used),role=Math.random()<.5?'actor':['director','writer','camera'][rnd(0,2)],e=person(name,role,20);e.star=true;e.aura=rnd(8,16);e.starTrait=Object.keys(starTraits)[rnd(0,3)];e.salary=Math.round(e.salary*2.4);Object.keys(e.stats).forEach(k=>e.stats[k]+=rnd(4,10));return e}
const pairKey=(a,b)=>a<b?a+'-'+b:b+'-'+a;
function teamChemistry(team){let n=0;for(let i=0;i<team.length;i++)for(let j=i+1;j<team.length;j++)if((S.chemistry[pairKey(team[i].id,team[j].id)]||0)>=2)n++;return n}
function makeScript(used){const genre=genres[rnd(0,genres.length-1)],theme=themes[rnd(0,themes.length-1)];let pool=titles.filter(t=>!used.has(t));if(!pool.length)pool=titles;const title=pool[rnd(0,pool.length-1)];used.add(title);return{id:'s'+nextId(),title,genre,theme,story:rnd(48,82),heat:rnd(35,80),cost:rnd(9,42)*10000,relation:'original',ipId:null,logline:`一个关于“${theme}”的${genre}故事，在选择与代价之间寻找答案。`}}
function makeScripts(n,existing){const used=new Set(existing.map(s=>s.title)),out=[];while(out.length<n)out.push(makeScript(used));return out}
function trendNow(){const t=trends[rnd(0,trends.length-1)];return{name:t[0],desc:t[1],weeks:rnd(12,20)}}
function makeRivals(){return rivalTemplates.map((r,i)=>({id:'r'+(i+1),name:r[0],style:r[1],focusGenre:r[2],target:r[3],strength:r[4],value:6500000+r[4]*110000,fame:r[4]/10,prestige:rnd(2,16),audience:300+r[4]*5,hits:0,nextStamp:stamp(2026,rnd(2,6))+i%2,nextGenre:Math.random()<.7?r[2]:genres[rnd(0,genres.length-1)]}))}
function fresh(){idSeq=20;const team=[person('沈望','producer',8),person('程屿','director',7),person('林栖','writer',6),person('苏念','actor',7),person('梁舟','camera',5)];return{version:VERSION,company:'灯塔影业',year:2026,month:1,week:1,money:6200000,fame:3,prestige:0,studio:0,staff:team,projects:[],project:null,works:[],ips:[],scripts:makeScripts(4,[]),news:[],trend:trendNow(),facilities:{},audiences:{youth:120,family:105,women:110,cinephile:80,mass:125},rivals:makeRivals(),candidates:[],candidateKey:null,annualAwards:[],chemistry:{},pending:[],goals:{i:0},achievements:[],flags:{},bet:null,negativeWeeks:0,evaluated:false,bankrupted:false,idSeq}}
function addNews(type,text){S.news.unshift({type,text,date:`${S.year}.${S.month}.${S.week}`});S.news=S.news.slice(0,60);newsRev++}

function save(){if(!S)return;S.idSeq=idSeq;try{localStorage.setItem(KEY,JSON.stringify(S))}catch{if(!saveWarned){saveWarned=true;toast('无法写入本机存储，本局进度不会被保存。')}}}
function normalize(x){
  const d=fresh();for(const k in d)if(x[k]===undefined)x[k]=d[k];x.version=VERSION;
  ['staff','works','scripts','news','candidates','annualAwards','ips','rivals','pending','achievements'].forEach(k=>{if(!Array.isArray(x[k]))x[k]=[]});
  ['chemistry','flags'].forEach(k=>{if(!x[k]||typeof x[k]!=='object')x[k]={}});
  if(!x.goals||typeof x.goals!=='object')x.goals={i:0};x.goals.i=clamp(Math.floor(+x.goals.i||0),0,GOALS.length);
  if(x.bet&&(!x.bet.rivalId||!Number.isFinite(+x.bet.stake)))x.bet=null;
  x.facilities=x.facilities&&typeof x.facilities==='object'?x.facilities:{};x.staff=x.staff.filter(e=>e&&roles[e.role]&&e.stats);if(!x.staff.length)x.staff=d.staff;
  x.studio=clamp(Math.floor(+x.studio||0),0,STUDIOS.length-1);if(!x.trend||!x.trend.name)x.trend=trendNow();
  if(!Array.isArray(x.projects))x.projects=[];if(x.project&&x.project.quality&&!x.projects.length)x.projects=[x.project];x.project=null;
  x.projects=x.projects.filter(p=>p&&p.quality&&scaleDefs[p.scale]).slice(0,3);
  x.projects.forEach(p=>{p.id=p.id||'p'+nextId();p.polish=+p.polish||0;p.target=p.target&&audienceDefs[p.target]?p.target:'mass';p.relation=p.relation||'original';p.ipId=p.ipId||null;p.offers=p.offers||null;(p.team||[]).forEach(id=>{const e=x.staff.find(v=>v.id===id);if(e)e.status='project:'+p.id})});
  x.staff.forEach(e=>{if(e.status==='project'){const p=x.projects.find(v=>(v.team||[]).includes(e.id));e.status=p?'project:'+p.id:null}});
  const oldAudience=Math.max(240,+x.audience||0);if(!x.audiences||typeof x.audiences!=='object')x.audiences={youth:Math.round(oldAudience*.22),family:Math.round(oldAudience*.2),women:Math.round(oldAudience*.2),cinephile:Math.round(oldAudience*.16),mass:Math.round(oldAudience*.22)};
  Object.keys(audienceDefs).forEach(k=>x.audiences[k]=Math.max(20,+x.audiences[k]||d.audiences[k]));
  x.works.forEach(w=>{w.id=w.id||'w'+nextId();w.target=audienceDefs[w.target]?w.target:'mass';w.deal=w.deal||w.channel||'share';w.channel=w.deal;w.startStamp=Number.isFinite(w.startStamp)?w.startStamp:stamp(w.releaseYear||x.year,w.releaseMonth||1);w.active=w.active!==false;w.ops=w.ops&&typeof w.ops==='object'?w.ops:{};w.window=w.window||dealDefs[w.deal]?.window||52;w.cut=Number.isFinite(w.cut)?w.cut:dealDefs[w.deal]?.baseCut||.7;w.rate=Number.isFinite(w.rate)?w.rate:dealDefs[w.deal]?.rate||0;w.decay=Number.isFinite(w.decay)?w.decay:dealDefs[w.deal]?.decay||1});
  if(!x.ips.length&&x.works.length)x.works.forEach(w=>{const ip={id:'ip'+nextId(),name:w.name,genre:w.genre,theme:w.theme,recognition:Math.round(w.score*7),fans:Math.round(w.score*20),fatigue:0,entries:1,lastYear:w.releaseYear||x.year,bestScore:w.score};x.ips.push(ip);w.ipId=ip.id});
  if(!x.rivals.length)x.rivals=makeRivals();x.rivals=x.rivals.slice(0,6);x.rivals.forEach((r,i)=>{const dR=makeRivals()[i];for(const k in dR)if(r[k]===undefined)r[k]=dR[k]});
  const ids=[...x.staff,...x.projects,...x.works,...x.ips].map(v=>+(String(v.id||'').match(/\d+/)?.[0]||0));idSeq=Math.max(+x.idSeq||0,20,...ids);x.idSeq=idSeq;return x;
}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));return x&&typeof x==='object'&&x.version===VERSION?normalize(x):null}catch{return null}}
function hasSave(){try{return!!localStorage.getItem(KEY)}catch{return false}}
function newGame(){document.querySelectorAll('dialog[open]').forEach(d=>d.close());S=fresh();addNews('公司开张','灯塔影业在城郊旧摄影棚正式挂牌。第一批竞争公司已经公布片单。');save();showGame()}
function continueGame(){const x=load();if(!x)return toast('没有可用的存档。');S=x;showGame()}
function showGame(){$('start').classList.add('hidden');$('app').classList.remove('hidden');selectedScript=null;selectedProjectId=null;modalDepth=0;pauseBefore=null;lastNewsRev=-1;setSpeed(1);showPage('home');render();$('continueBtn').disabled=!hasSave()}
function manualSave(){save();if(!saveWarned)toast('进度已保存到本机。')}
function deleteSave(){if(!confirm('确定删除《开个影视公司》的当前存档？'))return;try{localStorage.removeItem(KEY)}catch{}document.querySelectorAll('dialog[open]').forEach(d=>d.close());S=null;clearInterval(timer);timer=null;speed=1;$('app').classList.add('hidden');$('start').classList.remove('hidden');$('continueBtn').disabled=true}

function setSpeed(n){speed=n;document.querySelectorAll('[data-speed]').forEach(b=>b.classList.toggle('active',+b.dataset.speed===n));clearInterval(timer);timer=null;if(n&&S)timer=setInterval(()=>advanceWeek(n),5000);renderClock()}
function pauseForModal(){if(modalDepth++===0)pauseBefore=speed;setSpeed(0)}
function resumeAfterModal(){if(modalDepth>0&&--modalDepth===0)setSpeed(pauseBefore??1)}
function openDialog(id){const d=$(id);if(d.open)return;pauseForModal();d.showModal()}
function closeDialog(id){const d=$(id);if(d.open)d.close()}
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('close',resumeAfterModal));

function tickWeek(allowDialogs=true){
  S.week++;if(S.week>4){S.week=1;S.month++;monthlyCosts();refreshScripts();processRivals();if(S.month>12){S.month=1;S.year++;addNews('年度结算',`${S.year-1} 年结束，公司名气自然回落。`);S.fame=Math.max(0,S.fame*.94)}}
  processStaff();processProjects(allowDialogs);processWorks();processTrend();processPending(allowDialogs);maybeScandal(allowDialogs);checkAwards();checkGoals();checkAchievements();financialRisk(allowDialogs&&!document.querySelector('dialog[open]'));
}
function advanceWeek(times=1){for(let i=0;i<times;i++){tickWeek(true);if(document.querySelector('dialog[open]'))break}save();render()}
function monthlyCosts(){const burn=monthlyBurn();S.money-=burn;addNews('月度支出',`工资与场地支出 ${money(burn)}。`)}
function processStaff(){const drain=S.facilities.sound?1:0;S.staff.forEach(e=>{if(e.status==='rest'){e.energy=clamp(e.energy+18,0,100);if(e.energy>=95)e.status=null}else if(String(e.status||'').startsWith('project:'))e.energy=clamp(e.energy-Math.max(1,rnd(2,4)-drain),0,100);else e.energy=clamp(e.energy+5,0,100)})}
function processProjects(allowDialogs){for(const p of S.projects){if(p.ready)continue;const team=teamOf(p);if(!team.length){if(!p.stalled){p.stalled=true;addNews('制作停摆',`《${p.name}》暂时没有可用主创。`)}continue}p.stalled=false;const ph=PHASES[p.phase],avg=team.reduce((a,e)=>a+e.stats[ph.stat]*(e.energy<30?.62:e.energy<55?.82:1),0)/team.length,coverage=new Set(team.map(e=>e.role)),bonus=(coverage.has('director')?1.08:1)*(coverage.has('producer')?1.06:1)*(coverage.has('writer')&&p.phase===0?1.12:1),baseStep=400/scaleDefs[p.scale].weeks,step=clamp(baseStep*(.72+avg/170)*bonus,baseStep*.7,baseStep*1.35)*(S.facilities.edit&&p.phase===3?1.1:1);p.progress+=step;let gain=avg/15+(p.phase===0?p.script.story/28:0);if(S.facilities.edit&&ph.quality==='visual')gain*=1.1;if(S.facilities.sound&&ph.quality==='performance')gain*=1.1;p.quality[ph.quality]+=gain;p.spent+=team.reduce((a,e)=>a+e.salary/4,0);if(allowDialogs&&!p.eventMarks.includes(p.phase)&&p.progress>52&&Math.random()<.5){p.eventMarks.push(p.phase);projectEvent(p);break}if(p.progress>=100){p.phase++;p.progress=0;if(p.phase>=PHASES.length){p.ready=true;ensureOffers(p);addNews('成片完成',`《${p.name}》完成制作，发行商报价已经送达。`);if(allowDialogs){openRelease(p.id);break}}else addNews('制作推进',`《${p.name}》进入${PHASES[p.phase].name}阶段。`)}}}
// ── 通用抉择事件：choices 为 {label,cost,note,apply}，onSkip 处理“按原计划推进” ──
function costText(c){return c.cost>S.money?`资金不足 · 需要 ${money(c.cost)}`:c.cost>0?`追加 ${money(c.cost)}`:c.cost<0?`获得 ${money(-c.cost)}`:'不追加预算'}
function showChoices(title,html,choices,onSkip,skipLabel){activeEvent={choices,onSkip};$('eventTitle').textContent=title;const sk=$('eventSkipBtn');if(sk)sk.textContent=skipLabel||'按原计划推进 · 不追加投入';$('eventBody').innerHTML=html+choices.map((c,i)=>`<button class="choice" ${c.cost>S.money?'disabled':''} onclick="resolveEvent(${i})">${c.label}<small>${costText(c)}${c.note?' · '+c.note:''}</small></button>`).join('');openDialog('eventDialog')}
function resolveEvent(i){const c=activeEvent?.choices?.[i];if(!c)return closeDialog('eventDialog');if(c.cost>0&&S.money<c.cost)return toast('资金不足，无法做出这个选择。');S.money-=c.cost||0;if(c.apply)c.apply();activeEvent=null;closeDialog('eventDialog');save();render()}
function skipEvent(){if(activeEvent?.onSkip)activeEvent.onSkip();activeEvent=null;closeDialog('eventDialog');save();render()}
function projectEvent(p){const list=projectEvents.filter(e=>e.phase===p.phase),ev=list[rnd(0,list.length-1)];showChoices(ev.title,`<p><b>《${safe(p.name)}》</b> · ${ev.text}</p>`,ev.choices.map(c=>({label:c[0],cost:c[1],note:`${c[2]==='management'?'统筹':QUALITIES.find(q=>q[0]===c[2])?.[1]||'制作'} +${c[3]}`,apply:()=>{p.spent+=Math.max(0,c[1]);p.quality[c[2]==='management'?'vision':c[2]]+=c[3];if(c[4])queueChain(c[4],p);addNews('片场抉择',`《${p.name}》选择“${c[0]}”。`)}})),()=>addNews('片场抉择',`《${p.name}》按原计划推进。`))}
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
    ],()=>{p.quality.story=Math.max(0,p.quality.story-5);addNews('审查风波',`《${p.name}》默默完成了修改。`)});
  }else if(ev.chain==='placement'){
    if(!p)return;
    showChoices('植入镜头惹争议',`<p><b>《${safe(p.name)}》</b> · 内部试映后，植入镜头被吐槽严重出戏。</p>`,[
      {label:'重新剪辑弱化',cost:80000,note:'消除影响',apply:()=>addNews('植入风波',`《${p.name}》重剪弱化植入，口碑警报解除。`)},
      {label:'合同在身，保留',cost:0,note:'故事 -6',apply:()=>{p.quality.story=Math.max(0,p.quality.story-6);addNews('植入风波',`《${p.name}》保留植入镜头，观众恐怕不会买账。`)}}
    ],()=>{p.quality.story=Math.max(0,p.quality.story-6);addNews('植入风波',`《${p.name}》无人处理植入争议，只能硬着头皮上。`)});
  }else if(ev.chain==='injury'){
    if(!p)return;
    showChoices('伤情恶化',`<p><b>《${safe(p.name)}》</b> · 带伤硬拍的主演伤势加重，剧组陷入两难。</p>`,[
      {label:'公开致歉停机',cost:0,note:'进度 -12，名气 -0.5',apply:()=>{p.progress=Math.max(0,p.progress-12);S.fame=Math.max(0,S.fame-.5);addNews('片场危机',`《${p.name}》停机让主演养伤，舆论表示理解。`)}},
      {label:'医疗团队随组保障',cost:200000,note:'保住拍摄进度',apply:()=>addNews('片场危机',`《${p.name}》请来医疗团队随组保障，拍摄继续。`)}
    ],()=>{p.progress=Math.max(0,p.progress-12);S.fame=Math.max(0,S.fame-.5);addNews('片场危机',`《${p.name}》被迫停机，主演回家养伤。`)});
  }
}
// ── 明星塌房：话题体质是双刃剑 ──
function maybeScandal(allowDialogs){
  if(!allowDialogs||document.querySelector('dialog[open]'))return;
  const star=S.staff.find(e=>e.star&&e.starTrait==='topic'&&Math.random()<.006);
  if(!star)return;
  showChoices('明星塌房危机',`<p>${safe(star.name)}的旧账被自媒体翻出，话题冲上热搜，公司和在映作品面临连带风险。</p>`,[
    {label:'危机公关团队进场',cost:300000,note:'化解危机，名气 -0.5',apply:()=>{S.fame=Math.max(0,S.fame-.5);S.flags.scandalHandled=true;addNews('公关行动',`公司为${star.name}紧急公关，风波逐渐平息。`)}},
    {label:'火速解约切割',cost:0,note:'失去该主创，声望 -2',apply:()=>{S.staff=S.staff.filter(x=>x.id!==star.id);S.projects.forEach(p=>p.team=p.team.filter(id=>id!==star.id));S.prestige=Math.max(0,S.prestige-2);addNews('紧急切割',`公司宣布与${star.name}解约，相关项目重新调整。`)}},
    {label:'硬刚不回应',cost:0,note:'50% 自证清白',apply:()=>{if(Math.random()<.5){S.fame+=1;S.flags.scandalHandled=true;addNews('风波反转',`${star.name}晒出证据自证清白，公司路人缘不降反升。`)}else{S.fame=Math.max(0,S.fame-2);S.works.filter(w=>w.active).forEach(w=>w.potential*=.92);addNews('风波发酵',`沉默让舆论持续发酵，公司在映作品受到波及。`)}}}
  ],()=>{S.fame=Math.max(0,S.fame-1);addNews('风波发酵',`公司未作回应，${star.name}的话题继续发酵。`)},'暂不表态 · 名气 -1')
}
// ── 目标与成就 ──
function checkGoals(){const g=GOALS[S.goals.i];if(!g)return;if(g.check()){g.reward();addNews('经营目标',`达成「${g.name}」，获得：${g.rw}。`);toast(`目标达成：${g.name}`);S.goals.i++}}
function checkAchievements(){ACHIEVEMENTS.forEach(a=>{if(!S.achievements.includes(a[0])&&a[3]()){S.achievements.push(a[0]);addNews('成就解锁',`「${a[1]}」— ${a[2]}`);toast(`成就解锁：${a[1]}`)}})}

function processWorks(){const now=stamp();S.works.forEach(w=>{if(!w.active||now<w.startStamp||w.weeks>=w.window)return;if(w.rate>0){const gross=w.potential*w.rate*Math.pow(w.decay,w.weeks)*(.88+Math.random()*.24);w.gross+=gross;w.net+=gross*w.cut;S.money+=gross*w.cut}w.weeks++;if(w.weeks>=w.window){w.active=false;addNews('主发行结束',`《${w.name}》完成主要商业周期，累计回款 ${money(w.net)}。`)}})}
function processTrend(){S.trend.weeks--;if(S.trend.weeks<=0){S.trend=trendNow();addNews('市场风向',`${S.trend.name}内容热度上升：${S.trend.desc}`)}}
function processRivals(){const now=stamp();S.rivals.forEach(r=>{if(now<r.nextStamp)return;const score=clamp(5.2+r.strength/30+(Math.random()-.5)*1.8,5.2,9.3),gross=(900000+score*620000)*(.75+Math.random()*.6),hit=score>=7.7;if(S.bet&&S.bet.rivalId===r.id&&S.bet.rivalScore==null){S.bet.rivalScore=score;resolveBet()}r.value=Math.max(3000000,r.value+gross*.22-r.strength*9000);r.fame=Math.max(1,r.fame+(hit?.7:-.15));r.prestige+=score>=8.4?2:0;r.audience+=Math.round(score*(hit?18:7));if(hit)r.hits++;S.audiences[r.target]=Math.max(20,S.audiences[r.target]-rnd(2,8));addNews('竞争对手',`${r.name}的${r.nextGenre}新作${hit?'成为档期热门':'表现平平'}，评分 ${score.toFixed(1)}。`);r.nextStamp=now+rnd(4,8);r.nextGenre=Math.random()<.65?r.focusGenre:genres[rnd(0,genres.length-1)]})}
function checkAwards(){if(S.month!==2||S.week!==1||S.annualAwards.includes(S.year))return;S.annualAwards.push(S.year);const pool=S.works.filter(w=>w.releaseYear===S.year-1).sort((a,b)=>b.score-a.score);if(!pool.length)return addNews('金幕奖','公司去年没有可参评作品。');const best=pool[0];if(best.score<7.2)return addNews('金幕奖',`《${best.name}》未能入围今年的金幕奖。`);if(Math.random()<Math.min(.9,best.score/11+S.prestige/120+(S.staff.some(e=>e.star&&e.starTrait==='award')?.08:0))){const prize=best.score>=8.6?'年度最佳影片':best.score>=8?'最佳导演':'评审团特别奖';S.prestige+=prize==='年度最佳影片'?14:8;S.fame+=2;S.flags.awardWon=true;addNews('金幕奖',`《${best.name}》获得${prize}。`);toast(`获奖：《${best.name}》· ${prize}`)}else addNews('金幕奖',`《${best.name}》入围但未获奖。`)}
function showEnding(title,html){$('endingTitle').textContent=title;$('endingBody').innerHTML=html;openDialog('endingDialog')}
function financialRisk(canOpen=true){if(S.money<0)S.negativeWeeks++;else S.negativeWeeks=0;if(S.negativeWeeks&&S.negativeWeeks%12===0)addNews('财务预警',`公司已连续 ${S.negativeWeeks} 周资金为负。`);if(canOpen&&!S.bankrupted&&(S.money<=-2000000||S.negativeWeeks>=12)){S.bankrupted=true;return showEnding('资金链断裂',`<p>连续亏损让公司无法继续支付工资和场租。</p><div class="hint">本局共发行 ${S.works.length} 部作品，建立 ${S.ips.length} 个IP。</div>`)}if(canOpen&&S.year>=2036&&!S.evaluated){S.evaluated=true;const value=Math.max(0,S.money+audienceTotal()*700+S.prestige*100000+S.ips.reduce((a,ip)=>a+ip.recognition*25000,0)),grade=value>45000000?'S':value>28000000?'A':value>15000000?'B':value>7000000?'C':'D';showEnding('十年行业答卷',`<div style="font:72px serif;color:var(--red);text-align:center">${grade}</div><h2 style="text-align:center">公司估值 ${money(value)}</h2><p>发行 ${S.works.length} 部作品，建立 ${S.ips.length} 个IP，积累观众 ${NF.format(audienceTotal())} 万。</p>`)}}
function refreshScripts(){
  // 到期的王牌剧本被竞价对手截胡，对方实力增强
  S.scripts.filter(s=>s.expire&&s.hot).forEach(s=>{const r=S.rivals.find(v=>v.id===s.bidderId);if(r){r.strength=Math.min(95,r.strength+3);addNews('剧本争夺',`王牌剧本《${s.title}》被${r.name}签下，对方阵容更强了。`)}});
  S.scripts=S.scripts.filter(x=>!x.expire);S.scripts.forEach(x=>x.expire=true);
  if(S.scripts.length<4)S.scripts.push(...makeScripts(4-S.scripts.length,S.scripts));
  if(Math.random()<.25&&!S.scripts.some(s=>s.hot)){const r=S.rivals[rnd(0,S.rivals.length-1)],s=makeScript(new Set(S.scripts.map(x=>x.title)));s.story=rnd(72,90);s.heat=rnd(70,95);s.cost=Math.round(s.cost*2.2);s.hot=true;s.bidder=r.name;s.bidderId=r.id;S.scripts.push(s);addNews('剧本争夺',`王牌剧本《${s.title}》流入市场，${r.name}已经报价，本月不拿下就会易主。`)}
}

function showPage(page){const changed=currentPage!==page;currentPage=page;['home','scripts','crew','works','strategy'].forEach(x=>$(`page-${x}`).classList.toggle('hidden',x!==page));document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));renderMain();if(changed)requestAnimationFrame(()=>window.scrollTo(0,0))}
function statHtml(){const st=studio();return `<div class="stats"><div class="card stat"><label>可用资金</label><b>${money(S.money)}</b><small>月固定支出 ${money(monthlyBurn())}</small></div><div class="card stat"><label>公司名气</label><b>${S.fame.toFixed(1)}</b><small>影响报价与首映关注</small></div><div class="card stat"><label>观众资产</label><b>${NF.format(audienceTotal())} 万</b><small>五类受众总规模</small></div><div class="card stat"><label>行业声望</label><b>${S.prestige}</b><small>来自奖项与高分作品</small></div><div class="card stat"><label>制作管线</label><b>${S.projects.length}/${st.slots}</b><small>${st.name}</small></div></div>`}
function trendHtml(){return `<small>当期市场风向 · 剩余 ${S.trend.weeks} 周</small><b>${S.trend.name}升温</b><span>${S.trend.desc}</span>`}
function newsHtml(){return S.news.map(n=>`<div class="news"><time>${n.date} · ${n.type}</time>${safe(n.text)}</div>`).join('')}
function projectCard(p){const ip=p.ipId?S.ips.find(x=>x.id===p.ipId):null,progress=clamp(Math.round(p.progress),0,100);return `<div class="project"><div class="project-head"><div class="poster" aria-hidden="true">${p.relation==='original'?'映':'续'}</div><div class="grow"><h3>《${safe(p.name)}》 <span class="tag red">${p.ready?'待定档':PHASES[p.phase].name}</span></h3><p>${p.script.genre} · ${p.script.theme} · ${scaleDefs[p.scale].name} · ${audienceDefs[p.target].name}${ip?` · ${relationDefs[p.relation].name}`:''}</p></div><b>${p.ready?previewScore(p).toFixed(1):progress+'%'}</b></div><div class="bar"><i style="width:${p.ready?100:progress}%"></i></div>${qualityGrid(k=>Math.round(p.quality[k]||0))}<p>当前投入 ${money(p.spent)} · ${p.ready?'三家发行报价已到齐':p.stalled?'制作停滞：没有可用主创':'主创正在推进制作'}</p>${p.ready?`<div class="project-actions"><button class="primary" onclick="openRelease('${p.id}')">谈判并定档</button></div>`:''}</div>`}
function renderHome(){const st=studio(),next=nextRivalSlate(3);$('page-home').innerHTML=statHtml()+`<div class="studio"><section class="card set-card"><div class="set-head"><div><b>${st.stage}</b><br><small>${S.projects.length?`${S.projects.length} 条制作线同时推进`:'今日没有拍摄通告'}</small></div><span class="tag">${S.projects.length}/${st.slots} PROJECTS</span></div><div class="spotlight a"></div><div class="spotlight b"></div><div class="camera" aria-hidden="true">🎥</div><div class="crew-dots">${S.staff.slice(0,6).map(e=>`<div class="crew-dot"><i style="--c:${roleColors[e.role]}"></i><b>${safe(e.name)}</b><span>${String(e.status||'').startsWith('project:')?'制作中':e.status==='rest'?'休整':'待命'}</span></div>`).join('')}</div></section><div class="dashboard"><section class="card section"><div class="split"><h2 class="grow">制作看板</h2><span class="tag">${S.projects.length}/${st.slots} 条管线</span></div><div class="project-list">${S.projects.length?S.projects.map(projectCard).join(''):'<div class="empty">尚无在制项目<br><br><button class="primary" onclick="showPage(\'scripts\')">去剧本市场选故事</button></div>'}</div></section><section class="card section"><h2>快速操作</h2><div class="operation-grid"><button onclick="showPage('scripts')">挑选剧本</button><button onclick="openRecruit()">寻找主创</button><button onclick="restTeam()">空闲成员轮休</button><button onclick="endRest()">结束轮休</button><button onclick="showPage('works')">IP与片库</button><button onclick="manualSave()">保存进度</button></div></section></div></div>${goalHtml()}<section class="card section"><div class="split"><h2 class="grow">近期竞争档期</h2><button onclick="showPage('strategy')">查看完整片单</button></div><div class="slate">${slateHtml(next)}</div></section><section class="card panel trend-card only-narrow" style="margin-top:12px">${trendHtml()}</section><section class="card section only-narrow"><h2>业内消息</h2><div class="feed">${newsHtml()}</div></section>`}
function renderScripts(){const full=S.projects.length>=studio().slots;$('page-scripts').innerHTML=statHtml()+`<section class="card section"><div class="split"><div class="grow"><h2>剧本交易市场</h2><p class="subtle">每月更新。立项时先确定核心受众，发行渠道留到成片后谈判。</p></div><span class="tag">管线 ${S.projects.length}/${studio().slots}</span></div><div class="script-grid">${S.scripts.map(s=>`<article class="script"><div class="split"><span class="tag red">${s.genre}</span>${s.hot?`<span class="tag red">🔥 ${safe(s.bidder)}竞价中</span>`:''}<span class="score grow" style="text-align:right">${s.story}</span></div><h3>《${safe(s.title)}》</h3><p>${safe(s.logline)}${s.hot?'<br><b style="color:var(--red)">王牌剧本：本月不签，就会被对手抢走。</b>':''}</p><p>${s.theme} · 市场热度 ${s.heat}<br>版权费 <b>${money(s.cost)}</b></p><button class="primary" ${full?'disabled':''} onclick="openProject('${s.id}')">${full?'制作管线已满':'购买并立项'}</button></article>`).join('')}</div></section>`}
function statusText(e){if(e.status==='rest')return'休整中';if(String(e.status||'').startsWith('project:')){const p=projectById(String(e.status).slice(8));return p?`参与《${p.name}》`:'制作中'}return'可以安排工作'}
function staffRow(e,aside){return `<div class="staff"><div class="avatar" style="--avatar:${roleColors[e.role]};${e.star?'box-shadow:0 0 0 2px var(--gold)':''}" aria-hidden="true">${e.star?'★':roles[e.role][0][0]}</div><div><h3>${safe(e.name)} <span class="tag">${roles[e.role][0]} Lv.${e.level}</span>${e.star?` <span class="tag red">★ ${starTraits[e.starTrait]?.name||'明星'}</span>`:''}</h3><p>${e.trait}${e.star?` · 号召力 ${e.aura}`:''} · 故事 ${e.stats.story} / 导演 ${e.stats.vision} / 表演 ${e.stats.performance} / 视听 ${e.stats.visual} / 统筹 ${e.stats.management}</p><div class="energy"><i style="width:${e.energy}%"></i></div><p>体力 ${e.energy} · ${safe(statusText(e))}</p></div><aside>${aside}</aside></div>`}
function renderCrew(){$('page-crew').innerHTML=statHtml()+`<section class="card section"><div class="split"><h2 class="grow">主创团队</h2><button onclick="openRecruit()">＋ 寻找主创</button></div>${S.staff.map(e=>staffRow(e,`<span>月薪 ${money(e.salary)}</span><button onclick="openPerson(${e.id})">查看 / 安排</button>`)).join('')}</section>`}
function workStatus(w){const now=stamp();if(now<w.startStamp)return`等待 ${stampLabel(w.startStamp)} 上线`;if(w.active)return`发行第 ${w.weeks+1} 周`;return'主发行结束'}
function ipCard(ip){const full=S.projects.length>=studio().slots,canReboot=ip.entries>=2;return `<article class="ip-card"><span class="tag red">IP · ${ip.genre}</span><h3>《${safe(ip.name)}》</h3><p>${ip.theme} · 已开发 ${ip.entries} 部<br>知名度 ${Math.round(ip.recognition)} · 粉丝 ${NF.format(Math.round(ip.fans))} 万 · 疲劳 ${Math.round(ip.fatigue)}</p><div class="meter"><i style="width:${clamp(ip.recognition,0,100)}%"></i></div><div class="card-actions"><button ${full?'disabled':''} onclick="openSequel('${ip.id}','sequel')">正统续集</button><button ${full?'disabled':''} onclick="openSequel('${ip.id}','spinoff')">衍生</button><button ${full||!canReboot?'disabled':''} onclick="openSequel('${ip.id}','reboot')">重启</button></div></article>`}
function renderWorks(){const works=[...S.works].reverse();$('page-works').innerHTML=statHtml()+`<section class="card section"><div class="split"><div class="grow"><h2>IP开发库</h2><p class="subtle">成功作品可以延续，但高疲劳会伤害续作口碑与市场潜力。</p></div><span class="tag">${S.ips.length} 个IP</span></div>${S.ips.length?`<div class="ip-grid">${S.ips.map(ipCard).join('')}</div>`:'<div class="empty">发行第一部原创作品后，这里会形成公司的首个IP。</div>'}</section><section class="card section"><h2>作品片库与发行后运营</h2>${works.length?`<div class="work-grid">${works.map(w=>`<article class="work"><span class="tag ${w.score>=8?'green':''}">${dealDefs[w.deal]?.name||w.deal}</span><h3>《${safe(w.name)}》</h3><div class="score" style="font:30px serif;color:var(--red)">${w.score.toFixed(1)} <small style="font:12px sans-serif;color:var(--muted)">观众评分</small></div><p>${w.genre} · ${audienceDefs[w.target].name}<br>${workStatus(w)}<br>流水 ${money(w.gross)} · 回款 ${money(w.net)}</p><button onclick="showReport('${w.id}')">报告 / 发行后运营</button></article>`).join('')}</div>`:'<div class="empty">还没有正式签约发行的作品。</div>'}</section>`}
function audienceCards(){return Object.entries(audienceDefs).map(([k,d])=>`<article class="audience-card"><span class="tag">${d.name}</span><h3>${NF.format(Math.round(S.audiences[k]))} 万</h3><p>${d.desc}</p><div class="meter"><i style="width:${clamp(S.audiences[k]/8,8,100)}%"></i></div></article>`).join('')}
function goalHtml(){const g=GOALS[S.goals.i];return `<section class="card section"><div class="split"><h2 class="grow">经营目标</h2><span class="tag">${S.goals.i}/${GOALS.length}</span></div>${g?`<div class="hint"><b>${g.name}</b> · ${g.desc}<br>达成奖励：${g.rw}</div>`:'<div class="hint"><b>全部目标已达成</b> · 你已经是这个行业的传奇。</div>'}</section>`}
function achHtml(){return `<section class="card section"><div class="split"><h2 class="grow">成就墙</h2><span class="tag">${S.achievements.length}/${ACHIEVEMENTS.length}</span></div><div class="facility-grid">${ACHIEVEMENTS.map(a=>{const got=S.achievements.includes(a[0]);return `<article class="facility" style="${got?'':'opacity:.55'}"><span class="tag ${got?'green':''}">${got?'✓ 已解锁':'未解锁'}</span><h3>${a[1]}</h3><p>${a[2]}</p></article>`}).join('')}</div></section>`}
function nextRivalSlate(count=12){return [...S.rivals].sort((a,b)=>a.nextStamp-b.nextStamp).slice(0,count)}
function slateHtml(list){return list.map(r=>`<div class="slate-item ${r.nextStamp===stamp()?'danger':''}"><b>${stampLabel(r.nextStamp).replace('年','.')}</b><span>${safe(r.name)} · ${r.nextGenre}新作 · ${audienceDefs[r.target].name}</span><span>实力 ${r.strength}</span></div>`).join('')}
function industryRank(){const own=Math.max(0,S.money+audienceTotal()*650+S.prestige*80000+S.ips.reduce((a,ip)=>a+ip.recognition*18000,0));return[...S.rivals.map(r=>({name:r.name,style:r.style,value:r.value})),{name:S.company,style:'你的公司',value:own}].sort((a,b)=>b.value-a.value)}
function renderStrategy(){const st=studio(),next=STUDIOS[S.studio+1];$('page-strategy').innerHTML=statHtml()+goalHtml()+`<section class="card section"><h2>五类观众资产</h2><div class="audience-grid">${audienceCards()}</div></section><section class="card section"><div class="split"><div class="grow"><h2>竞争公司与片单</h2><p class="subtle">对手会按片单真实发行。撞上同类型或同受众作品，会压低你的首发表现。</p></div><span class="tag">6 家公司</span></div><div class="rival-grid">${S.rivals.map(r=>`<article class="rival-card"><span class="tag">${r.style}</span>${S.bet&&S.bet.rivalId===r.id?'<span class="tag red">对赌进行中</span>':''}<h3>${safe(r.name)}</h3><p>主攻 ${r.focusGenre} · ${audienceDefs[r.target].name} · 实力 ${r.strength}<br>下部作品 ${stampLabel(r.nextStamp)} · ${r.nextGenre}<br>累计热门作品 ${r.hits}</p><div class="card-actions"><button ${stamp()<(r.poachCd||0)?'disabled':''} onclick="poachRival('${r.id}')">${stamp()<(r.poachCd||0)?'挖角冷却中':`挖角 · ${money(poachCost(r))}`}</button><button ${S.bet?'disabled':''} onclick="openBet('${r.id}')">对赌 · 50万</button></div></article>`).join('')}</div><h3 style="margin-top:18px">未来片单</h3><div class="slate">${slateHtml(nextRivalSlate())}</div></section><section class="card section"><h2>公司设施</h2><div class="facility-grid">${facilities.map(f=>`<article class="facility"><span class="tag">${S.facilities[f[0]]?'已建成':'待投资'}</span><h3>${f[1]}</h3><p>${f[2]}</p><button ${S.facilities[f[0]]?'disabled':''} onclick="buyFacility('${f[0]}')">${S.facilities[f[0]]?'投入使用中':money(f[3])}</button></article>`).join('')}</div></section><section class="card section"><div class="split upgrade-split"><div class="grow"><h2>场地升级</h2><p>${st.desc} 当前可同时制作 ${st.slots} 个项目。</p></div>${next?`<button class="primary" onclick="upgradeStudio()">升级至 ${next.name}<br><small>${money(st.upgrade)} · 开放 ${next.slots} 条管线</small></button>`:'<span class="tag green">最高等级 · 3条管线</span>'}</div></section>${achHtml()}<section class="card section"><h2>存档与帮助</h2><div class="operation-grid"><button onclick="manualSave()">保存进度</button><button onclick="openDialog('helpDialog')">经营说明</button><button onclick="restTeam()">空闲成员轮休</button><button onclick="deleteSave()">删除存档</button></div></section><section class="card section"><h2>行业榜单</h2>${industryRank().map((x,i)=>`<div class="rank"><div class="no">#${i+1}</div><div><b>${safe(x.name)}</b><br><small>${x.style}</small></div><b>${money(x.value)}</b></div>`).join('')}</section>`}
function renderMain(){if(!S)return;({home:renderHome,scripts:renderScripts,crew:renderCrew,works:renderWorks,strategy:renderStrategy}[currentPage]||renderHome)()}
function renderClock(){$('clock').innerHTML=S?`<b><span class="clock-wide">${S.year} 年 ${S.month} 月 · 第 ${S.week} 周</span><span class="clock-compact">${S.year}.${S.month} · W${S.week}</span></b><small>${speed?speed+'× 推进中':'已暂停'}</small>`:''}
function render(){if(!S)return;renderClock();$('companyName').textContent=S.company;$('studioName').textContent=studio().name;$('trendPanel').innerHTML=trendHtml();if(newsRev!==lastNewsRev){lastNewsRev=newsRev;const f=$('newsFeed'),top=f.scrollTop;f.innerHTML=newsHtml();f.scrollTop=top}renderMain()}

function suggestedAudience(script){return Object.keys(audienceDefs).find(k=>audienceFit(script,k))||'mass'}
function openProject(id){if(S.projects.length>=studio().slots)return toast('制作管线已满，请先完成项目或升级场地。');selectedScript=S.scripts.find(x=>x.id===id);if(!selectedScript)return toast('这个剧本已经不在市场上了。');prepareProjectDialog()}
function openSequel(ipId,relation){if(S.projects.length>=studio().slots)return toast('制作管线已满。');const ip=S.ips.find(x=>x.id===ipId);if(!ip)return;if(relation==='reboot'&&ip.entries<2)return toast('至少完成两部作品后才能重启IP。');const suffix=relation==='sequel'?`${ip.entries+1}`:relation==='spinoff'?'：外传':`：新章`;selectedScript={id:null,title:ip.name+suffix,genre:ip.genre,theme:ip.theme,story:clamp(Math.round(ip.bestScore*8+relationDefs[relation].story-ip.fatigue*.12),48,88),heat:clamp(Math.round(ip.recognition-ip.fatigue*.35),35,95),cost:relationDefs[relation].cost,relation,ipId:ip.id,logline:`延续《${ip.name}》的世界与观众期待，开发一部${relationDefs[relation].name}。`};prepareProjectDialog()}
function prepareProjectDialog(){$('projectTitle').textContent=`筹备《${selectedScript.title}》`;$('filmName').value=selectedScript.title;$('filmScale').value=selectedScript.cost>300000?'cinema':'web';$('filmAudience').value=suggestedAudience(selectedScript);$('filmMarketing').value='100000';const ip=selectedScript.ipId?S.ips.find(x=>x.id===selectedScript.ipId):null;$('projectOriginHint').innerHTML=ip?`<b>${relationDefs[selectedScript.relation].name}</b> · IP知名度 ${Math.round(ip.recognition)}，当前疲劳 ${Math.round(ip.fatigue)}。高知名度提高开局，高疲劳会压低成片上限。`:`<b>原创项目</b> · 成功发行后将建立新IP，可继续开发续集、衍生作品和重启版本。`;$('crewPicks').innerHTML=S.staff.filter(e=>!e.status).map((e,i)=>`<label class="pick"><input type="checkbox" value="${e.id}" ${i<5?'checked':''}><span>${safe(e.name)}<small>${roles[e.role][0]} · 体力 ${e.energy}</small></span></label>`).join('')||'<div class="empty">没有空闲主创。请先等待项目完成或招募新人。</div>';previewProject();openDialog('projectDialog')}
function previewProject(){if(!selectedScript)return;const def=scaleDefs[$('filmScale').value],mk=+$('filmMarketing').value,target=$('filmAudience').value,fit=audienceFit(selectedScript,target),ip=selectedScript.ipId?S.ips.find(x=>x.id===selectedScript.ipId):null;$('projectPreview').innerHTML=`<b>基础投入 ${money(selectedScript.cost+def.base+mk)} · 制作约 ${def.weeks} 周</b><br>${audienceDefs[target].name}${fit?'与题材匹配，首映更容易形成口碑基本盘':'不是题材天然受众，需要更强成片与宣发说服市场'}。${ip&&ip.fatigue>=45?'<br><b style="color:var(--red)">IP疲劳偏高，本作评分和商业潜力将受到压制。</b>':''}`}
function startProject(){const ids=[...document.querySelectorAll('#crewPicks input:checked')].map(x=>+x.value),scale=$('filmScale').value,target=$('filmAudience').value,mk=+$('filmMarketing').value,def=scaleDefs[scale];if(!selectedScript)return;if(S.projects.length>=studio().slots)return toast('制作管线已满。');const picked=ids.map(id=>S.staff.find(e=>e.id===id)).filter(e=>e&&!e.status),upfront=selectedScript.cost+def.base+mk;if(picked.length<def.need)return toast(`${def.name}至少需要 ${def.need} 名空闲主创。`);if(!picked.some(e=>e.role==='director'))return toast('项目必须有一名导演。');if(S.money<upfront)return toast('资金不足，无法签约开机。');const p={id:'p'+nextId(),name:$('filmName').value.trim()||selectedScript.title,script:{...selectedScript},scale,target,marketing:mk,team:picked.map(e=>e.id),phase:0,progress:0,quality:{story:0,vision:0,performance:0,visual:0},spent:upfront,eventMarks:[],ready:false,polish:0,stalled:false,relation:selectedScript.relation||'original',ipId:selectedScript.ipId||null,offers:null};S.money-=upfront;S.projects.push(p);picked.forEach(e=>e.status='project:'+p.id);if(selectedScript.id)S.scripts=S.scripts.filter(x=>x.id!==selectedScript.id);addNews('项目开机',`《${p.name}》进入${PHASES[0].name}，核心受众为${audienceDefs[target].name}。`);selectedScript=null;closeDialog('projectDialog');showPage('home');save()}
function previewScore(p){const vals=Object.values(p.quality),craft=vals.reduce((a,b)=>a+b,0)/vals.length,team=teamOf(p),coverage=new Set(team.map(e=>e.role)),roleBonus=['producer','director','writer','actor','camera','editor'].filter(r=>coverage.has(r)).length*.13,facilityBonus=(S.facilities.screen?.35:0)+(S.facilities.sound?.12:0)+(S.facilities.edit?.12:0)+(S.facilities.casting?.06:0),trendBonus=(p.script.genre===S.trend.name||p.script.theme===S.trend.name)?.55:0,audBonus=audienceFit(p.script,p.target)?.22:-.08,ip=S.ips.find(x=>x.id===p.ipId),ipBonus=ip?Math.min(.42,ip.recognition/180)-Math.min(.75,ip.fatigue/90):0,overwork=team.filter(e=>e.energy<25).length*.18,chemBonus=Math.min(.28,teamChemistry(team)*.07),starBonus=Math.min(.3,team.reduce((a,e)=>a+(e.star?(e.starTrait==='versatile'?.15:.07):0),0));return clamp(3.5+p.script.story/30+craft/25+roleBonus+facilityBonus+trendBonus+audBonus+ipBonus+chemBonus+starBonus-overwork,3.8,scaleDefs[p.scale].cap)}
function ensureOffers(p){if(p.offers)return;p.offers={platform:{partner:['云帆视频','极光视频','海豚视频'][rnd(0,2)],factor:rnd(78,92)/100,cut:1},share:{partner:['云帆内容','星火剧场','新幕平台'][rnd(0,2)],factor:rnd(96,112)/100,cut:rnd(67,77)/100},theater:{partner:['远景发行','华星院线','银幕联合'][rnd(0,2)],factor:rnd(88,114)/100,cut:rnd(46,54)/100}}}
function competitionAt(slot,p){const rival=S.rivals.filter(r=>r.nextStamp===slot),own=S.works.filter(w=>w.startStamp===slot),pressure=clamp(rival.reduce((a,r)=>a+(r.target===p.target?.12:0)+(r.nextGenre===p.script.genre?.08:0),0)+own.length*.08,0,.45);return{rival,own,pressure}}
function basePotential(p,deal,slot){const score=previewScore(p),team=teamOf(p),fit=audienceFit(p.script,p.target)?1.14:.92,trend=(p.script.genre===S.trend.name||p.script.theme===S.trend.name)?1.2:1,aud=1+Math.min(.42,S.audiences[p.target]/1600),marketing=1+Math.log10(1+p.marketing/100000)*(team.some(e=>e.star&&e.starTrait==='topic')?.24:.17),ip=S.ips.find(x=>x.id===p.ipId),ipFx=ip?1+Math.min(.3,ip.recognition/260)-Math.min(.35,ip.fatigue/130):1,starPow=1+Math.min(.4,team.reduce((a,e)=>a+(e.star?e.aura/(e.starTrait==='draw'?70:160):0),0)),scaleMismatch=p.scale==='web'&&deal==='theater'?.58:1,comp=competitionAt(slot,p);return(p.spent*(.52+score/7.7)+S.fame*90000)*fit*trend*aud*marketing*ipFx*starPow*scaleMismatch*(1-comp.pressure)}
function releaseSlots(){return[stamp(),stamp()+1,stamp()+2]}
function offerText(p,key,slot){const o=p.offers[key],potential=basePotential(p,key,slot)*o.factor;if(key==='platform')return`${o.partner} · 买断保底 ${money(potential*.78)}`;if(key==='share')return`${o.partner} · 预付 ${money(potential*.1)} · 公司分成 ${Math.round(o.cut*100)}%`;return`${o.partner} · 最低保证 ${money(potential*.05)} · 公司分账 ${Math.round(o.cut*100)}%`}
function renderRelease(){const p=projectById(selectedProjectId);if(!p)return;ensureOffers(p);p.score=previewScore(p);const slot=releaseSlots()[0];$('releaseBody').innerHTML=`<h2>《${safe(p.name)}》</h2>${qualityGrid(k=>Math.round(p.quality[k]||0))}<p>内部试映 <b style="font-size:26px;color:var(--red)">${p.score.toFixed(1)}</b> 分 · 核心受众 ${audienceDefs[p.target].name}</p><h3>三份发行报价</h3><div class="deal-grid">${Object.keys(dealDefs).map((k,i)=>`<label class="deal"><input type="radio" name="releaseDeal" value="${k}" ${i===0?'checked':''} onchange="updateReleasePreview()"><span><b>${dealDefs[k].name}</b><small>${offerText(p,k,slot)}<br>${dealDefs[k].desc}</small></span></label>`).join('')}</div><div class="calendar-row"><div class="field"><label for="releaseSlot">选择首发档期</label><select id="releaseSlot" onchange="updateReleasePreview()">${releaseSlots().map(s=>`<option value="${s}">${stampLabel(s)}</option>`).join('')}</select></div><div id="releasePreview" class="hint"></div></div><div class="hint">追加精剪真实消耗 2 周与 12 万元，最多 ${MAX_POLISH} 次（已用 ${p.polish}/${MAX_POLISH}）。等待档期期间主创会结束剧组工作，可以投入新项目。</div>`;$('polishBtn').disabled=p.polish>=MAX_POLISH||S.money<120000;requestAnimationFrame(updateReleasePreview)}
function openRelease(id){const p=projectById(id);if(!p||!p.ready)return;selectedProjectId=id;renderRelease();openDialog('releaseDialog')}
function updateReleasePreview(){const p=projectById(selectedProjectId),deal=document.querySelector('input[name="releaseDeal"]:checked')?.value,slot=+$('releaseSlot')?.value;if(!p||!deal||!slot)return;const c=competitionAt(slot,p),pressure=Math.round(c.pressure*100),names=c.rival.map(r=>`${r.name}（${r.nextGenre}/${audienceDefs[r.target].name}）`).concat(c.own.map(w=>`本公司《${w.name}》`));$('releasePreview').innerHTML=`<b>${pressure?`档期压力 ${pressure}%`:'档期相对宽松'}</b><br>${names.length?`同期作品：${names.map(safe).join('、')}`:'暂无已公布的直接竞争作品'}<br>${offerText(p,deal,slot)}`}
function polishProject(){const p=projectById(selectedProjectId);if(!p||!p.ready)return;if(p.polish>=MAX_POLISH)return toast('已经追加过两轮精剪。');if(S.money<120000)return toast('资金不足。');S.money-=120000;p.spent+=120000;p.polish++;p.quality.visual+=3;p.quality.story+=2;for(let i=0;i<2;i++)tickWeek(false);addNews('追加精剪',`《${p.name}》追加两周精剪。`);save();render();renderRelease()}
function confirmRelease(){const p=projectById(selectedProjectId),deal=document.querySelector('input[name="releaseDeal"]:checked')?.value,slot=+$('releaseSlot')?.value;if(!p||!deal||!slot)return;const o=p.offers[deal],score=previewScore(p),potential=basePotential(p,deal,slot)*o.factor,c=dealDefs[deal],advance=deal==='platform'?potential*.78:deal==='share'?potential*.1:potential*.05,releaseDate=stampDate(slot),w={id:'w'+nextId(),name:p.name,genre:p.script.genre,theme:p.script.theme,scale:p.scale,target:p.target,deal,channel:deal,score,cost:p.spent,potential,gross:advance,net:advance,weeks:0,startStamp:slot,releaseYear:releaseDate.year,releaseMonth:releaseDate.month,active:true,window:c.window,rate:c.rate,decay:c.decay,cut:o.cut,partner:o.partner,ops:{},ipId:p.ipId};S.money+=advance;S.works.push(w);p.team.forEach(id=>{const e=S.staff.find(x=>x.id===id);if(e&&e.status==='project:'+p.id){e.status=null;e.xp+=Math.round(score*10);if(e.xp>=100){e.xp-=100;e.level++;Object.keys(e.stats).forEach(k=>e.stats[k]+=rnd(2,5))}}});const initial=Math.round(score*12*(audienceFit(p.script,p.target)?1.18:.9)*(1-competitionAt(slot,p).pressure));S.audiences[p.target]+=initial;S.fame+=score>=8?1.8:score>=6.5?.8:.2;S.prestige+=score>=8.4?3:0;for(let i=0;i<p.team.length;i++)for(let j=i+1;j<p.team.length;j++){const k=pairKey(p.team[i],p.team[j]);S.chemistry[k]=(S.chemistry[k]||0)+1}if(S.bet&&S.bet.myScore==null){S.bet.myScore=score;addNews('票房对赌',`《${p.name}》成为对赌作品，等待${S.bet.rivalName}的新作揭晓。`);resolveBet()}updateIpAfterRelease(p,w);S.projects=S.projects.filter(x=>x.id!==p.id);addNews('发行签约',`《${p.name}》与${o.partner}签约，将于${stampLabel(slot)}通过${c.name}首发，获得 ${money(advance)}。`);selectedProjectId=null;closeDialog('releaseDialog');save();showPage('works');toast(`《${p.name}》完成签约定档！`)}
function updateIpAfterRelease(p,w){let ip=S.ips.find(x=>x.id===p.ipId);if(!ip){ip={id:'ip'+nextId(),name:p.name,genre:p.script.genre,theme:p.script.theme,recognition:0,fans:0,fatigue:0,entries:0,lastYear:S.year,bestScore:0};S.ips.push(ip)}ip.entries++;ip.recognition=clamp(ip.recognition+w.score*5+(w.score>=8?8:2),0,100);ip.fans+=Math.round(w.score*16);ip.fatigue=clamp(ip.fatigue+relationDefs[p.relation].fatigue-(S.year-ip.lastYear>=2?8:0),0,100);ip.lastYear=S.year;ip.bestScore=Math.max(ip.bestScore,w.score);w.ipId=ip.id}

function restTeam(){const list=S.staff.filter(e=>!e.status&&e.energy<95);if(!list.length)return toast('当前没有需要休整的空闲员工。');list.forEach(e=>e.status='rest');addNews('团队轮休',`${list.map(e=>e.name).join('、')}开始轮休。`);save();render()}
function endRest(){const list=S.staff.filter(e=>e.status==='rest');if(!list.length)return toast('当前没有正在休整的员工。');list.forEach(e=>e.status=null);addNews('结束轮休',`${list.length} 名主创回到待命状态。`);save();render()}
function rollCandidates(){const used=new Set(S.staff.map(e=>e.name));S.candidates=[];if(Math.random()<(S.facilities.casting?.5:.28)){const e=makeStar(used);used.add(e.name);e.signing=Math.round(e.salary*rnd(3,5));S.candidates.push(e)}while(S.candidates.length<3){const name=freshName(used);used.add(name);const role=Object.keys(roles)[rnd(0,Object.keys(roles).length-1)],e=person(name,role,S.facilities.casting?8:0);e.signing=e.salary*rnd(2,4);S.candidates.push(e)}S.candidateKey=S.year*12+S.month}
function renderRecruit(){$('recruitBody').innerHTML=`<p class="subtle">名单每月自然更新一次。当前团队 ${S.staff.length}/${studio().cap}。</p>`+(S.candidates.length?S.candidates.map((e,i)=>staffRow(e,`<span>签约金</span><button onclick="hire(${i})">${money(e.signing)}</button>`)).join(''):'<div class="empty">名单已空，点下方刷新。</div>')}
function openRecruit(){if(!S.candidates.length||S.candidateKey!==S.year*12+S.month)rollCandidates();renderRecruit();openDialog('recruitDialog')}
function refreshCandidates(){if(S.money<20000)return toast('资金不足。');S.money-=20000;rollCandidates();renderRecruit();save();render()}
function hire(i){const e=S.candidates[i];if(!e)return;if(S.staff.length>=studio().cap)return toast('团队已满，请先升级场地。');if(S.money<e.signing)return toast('签约资金不足。');S.money-=e.signing;delete e.signing;S.staff.push(e);S.candidates.splice(i,1);addNews('新主创',`${e.name}以${roles[e.role][0]}身份加入公司。`);closeDialog('recruitDialog');save();render()}
function openPerson(id){const e=S.staff.find(x=>x.id===id);if(!e)return;$('personBody').innerHTML=`<h2>${safe(e.name)} <span class="tag">${roles[e.role][0]} Lv.${e.level}</span>${e.star?` <span class="tag red">★ ${starTraits[e.starTrait]?.name}</span>`:''}</h2><p>${e.trait}型创作者。${e.star?`明星主创，号召力 ${e.aura}：${starTraits[e.starTrait]?.desc}。`:''}${safe(statusText(e))}。</p>${qualityGrid(k=>e.stats[k])}<p>统筹 ${e.stats.management} · 体力 ${e.energy} · 月薪 ${money(e.salary)}</p><div class="actions"><button ${String(e.status||'').startsWith('project:')?'disabled':''} onclick="restPerson(${e.id})">${e.status==='rest'?'结束休整':'安排休整'}</button><button ${String(e.status||'').startsWith('project:')?'disabled':''} onclick="dismissPerson(${e.id})">解除合约</button></div>`;openDialog('personDialog')}
function restPerson(id){const e=S.staff.find(x=>x.id===id);if(!e||String(e.status||'').startsWith('project:'))return;if(e.status==='rest'){e.status=null;addNews('结束休整',`${e.name}回到待命状态。`)}else{e.status='rest';addNews('安排休整',`${e.name}开始休整。`)}closeDialog('personDialog');save();render()}
function dismissPerson(id){const e=S.staff.find(x=>x.id===id);if(!e)return;if(String(e.status||'').startsWith('project:'))return toast('该成员正在参与项目，无法解约。');if(S.staff.length<=3)return toast('公司至少要保留 3 名成员。');S.money-=e.salary;S.staff=S.staff.filter(x=>x.id!==id);addNews('团队变动',`${e.name}离开公司，结清一个月薪资。`);closeDialog('personDialog');save();render()}

function showReport(id){const w=S.works.find(x=>x.id===id);if(!w)return;const profit=w.net-w.cost,started=stamp()>=w.startStamp,ip=S.ips.find(x=>x.id===w.ipId);$('reportBody').innerHTML=`<h2>《${safe(w.name)}》</h2><p><span class="tag">${w.genre}</span> <span class="tag">${audienceDefs[w.target].name}</span> <span class="tag">${dealDefs[w.deal].name}</span></p><div class="qualities"><div>观众评分<b>${w.score.toFixed(1)}</b></div><div>累计流水<b>${money(w.gross)}</b></div><div>公司回款<b>${money(w.net)}</b></div><div>项目盈亏<b style="color:${profit>=0?'var(--green)':'var(--red)'}">${money(profit)}</b></div></div><h3>发行状态</h3><div class="hint">合作方 ${safe(w.partner)} · ${workStatus(w)}。${ip?`所属IP知名度 ${Math.round(ip.recognition)}，疲劳 ${Math.round(ip.fatigue)}。`:''}</div><h3>发行后运营</h3><div class="card-actions"><button ${!started||!w.active||w.ops.campaign||w.weeks>12||S.money<180000?'disabled':''} onclick="postOperate('${w.id}','campaign')">追加宣传 · 18万</button><button ${!started||w.ops.overseas||w.weeks<4||w.score<7?'disabled':''} onclick="postOperate('${w.id}','overseas')">海外版权</button><button ${!started||w.ops.cut||w.weeks<8||w.score<6.5||S.money<220000?'disabled':''} onclick="postOperate('${w.id}','cut')">导演剪辑版 · 22万</button></div><p class="subtle">宣传限主发行期且首发12周内一次；海外版权需上映4周且评分不低于7.0；导演剪辑版需上映8周且评分不低于6.5。</p>`;openDialog('reportDialog')}
function postOperate(id,type){const w=S.works.find(x=>x.id===id);if(!w)return;if(type==='campaign'){if(!w.active||w.ops.campaign||w.weeks>12)return;if(S.money<180000)return toast('资金不足。');S.money-=180000;w.ops.campaign=true;if(w.rate>0)w.potential*=1.12;S.audiences[w.target]+=Math.round(w.score*3);addNews('追加宣传',`《${w.name}》启动第二轮宣传，继续争取${audienceDefs[w.target].name}。`)}else if(type==='overseas'){if(w.ops.overseas||w.weeks<4||w.score<7)return;const income=Math.round(w.potential*.08);w.ops.overseas=true;w.gross+=income;w.net+=income;S.money+=income;S.fame+=.4;addNews('海外版权',`《${w.name}》售出海外版权，回款 ${money(income)}。`)}else if(type==='cut'){if(w.ops.cut||w.weeks<8||w.score<6.5)return;if(S.money<220000)return toast('资金不足。');S.money-=220000;w.ops.cut=true;w.score=clamp(w.score+.15,0,10);if(w.rate>0)w.potential*=1.05;const ip=S.ips.find(x=>x.id===w.ipId);if(ip)ip.recognition=clamp(ip.recognition+3,0,100);addNews('导演剪辑版',`《${w.name}》推出导演剪辑版，长尾口碑回升。`)}save();render();showReport(id)}

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
function upgradeStudio(){const cost=studio().upgrade;if(cost==null)return;if(S.money<cost)return toast('资金不足。');if(!reserveOk(cost))return;S.money-=cost;S.studio++;addNews('公司搬迁',`公司升级至${studio().name}，开放 ${studio().slots} 条制作管线。`);save();render()}
function toast(text){const t=$('toast');t.textContent=text;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),2200)}

$('continueBtn').disabled=!hasSave();
window.addEventListener('beforeunload',save);
