import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const storage=new Map();
const stubElement=()=>({disabled:false,classList:{add(){},remove(){},toggle(){}},addEventListener(){}});
const context={
  console,Math,JSON,Intl,setInterval,clearInterval,setTimeout,clearTimeout,
  localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
  document:{getElementById:stubElement,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},body:{appendChild(){}},createElement:stubElement},
  window:{addEventListener(){}},confirm:()=>true
};
vm.createContext(context);
const files=['data.js','events.js','art.js','game.js'];
const source=files.map(f=>fs.readFileSync(new URL('../src/'+f,import.meta.url),'utf8')).join('\n')+`
;globalThis.__gameTest={fresh,normalize,competitionAt,updateIpAfterRelease,studio,setState:x=>S=x,getState:()=>S,GOALS,ACHIEVEMENTS,makeStar,starTraits,pairKey,teamChemistry,pickFace,ART,load,VERSION,poachCost,resolveBet,checkGoals,checkAchievements};`;
vm.runInContext(source,context,{filename:'bundle.js'});
const api=context.__gameTest;

const base=api.fresh();
assert.equal(base.projects.length,0);
assert.equal(base.rivals.length,6);
assert.deepEqual(Object.keys(base.audiences),['youth','family','women','cinephile','mass']);

const legacy=api.fresh();
const legacyProject={id:'p901',name:'旧项目',script:{title:'旧项目',genre:'都市',theme:'职场博弈',story:66},scale:'web',channel:'share',marketing:100000,team:[legacy.staff[0].id,legacy.staff[1].id,legacy.staff[2].id],phase:1,progress:40,quality:{story:10,vision:3,performance:0,visual:0},spent:900000,eventMarks:[0],ready:false};
legacy.project=legacyProject;
delete legacy.projects;
legacy.staff.slice(0,3).forEach(e=>e.status='project');
legacy.audience=240;
delete legacy.audiences;
legacy.works=[{id:'w902',name:'旧片',genre:'都市',theme:'职场博弈',scale:'web',channel:'share',score:7.4,cost:900000,potential:1600000,gross:400000,net:280000,weeks:5,releaseYear:2026,releaseMonth:2}];
delete legacy.ips;
delete legacy.rivals;
const migrated=api.normalize(legacy);
assert.equal(migrated.projects.length,1);
assert.equal(migrated.projects[0].target,'mass');
assert.ok(migrated.staff.slice(0,3).every(e=>e.status==='project:p901'));
assert.equal(Object.keys(migrated.audiences).length,5);
assert.equal(migrated.ips.length,1);
assert.equal(migrated.works[0].ipId,migrated.ips[0].id);
assert.equal(migrated.rivals.length,6);

const state=api.fresh();
state.studio=1;
api.setState(state);
assert.equal(api.studio().slots,2);
const project={script:{genre:state.rivals[0].nextGenre,theme:'秘密往事'},target:state.rivals[0].target};
const collision=api.competitionAt(state.rivals[0].nextStamp,project);
assert.ok(collision.rival.length>=1);
assert.ok(collision.pressure>=.2);

const originalProject={name:'测试IP',script:{genre:'悬疑',theme:'秘密往事'},relation:'original',ipId:null};
const work={score:8.1};
api.updateIpAfterRelease(originalProject,work);
assert.equal(state.ips.length,1);
assert.equal(state.ips[0].entries,1);
assert.equal(work.ipId,state.ips[0].id);

// ── 新系统：明星 / 默契 / 目标成就 / 对赌 / 存档回填 ──
assert.equal(base.goals.i,0);
assert.ok(Array.isArray(base.achievements)&&Array.isArray(base.pending));
assert.equal(typeof base.chemistry,'object');
assert.equal(base.bet,null);

// 旧存档（无新字段）能被 normalize 回填
assert.equal(migrated.goals.i,0);
assert.ok(Array.isArray(migrated.achievements));
assert.ok(Array.isArray(migrated.pending));
assert.equal(typeof migrated.chemistry,'object');
assert.equal(typeof migrated.flags,'object');

// 明星主创
const star=api.makeStar(new Set());
assert.ok(star.star&&star.aura>=8&&star.aura<=16);
assert.ok(api.starTraits[star.starTrait]);

// 搭档默契
const s2=api.fresh();
api.setState(s2);
const [a,b]=s2.staff;
s2.chemistry[api.pairKey(a.id,b.id)]=2;
assert.equal(api.teamChemistry([a,b]),1);
assert.equal(api.teamChemistry([a]),0);

// 目标推进：发行首作后 checkGoals 应发钱并推进
s2.works.push({name:'新片',score:7.0,net:0,releaseYear:2026});
const before=s2.money;
api.checkGoals();
assert.ok(s2.goals.done.includes('debut'),'首作目标应达成');
assert.equal(s2.money,before+500000);

// 目标不再按顺序锁死：直接满足靠后的目标也应结算
s2.studio=2;
api.checkGoals();
assert.ok(s2.goals.done.includes('base'),'越过前序目标也应能达成「自己的基地」');

// 成就解锁
s2.works.push({name:'神作',score:9.2,net:9000000,releaseYear:2027});
api.checkAchievements();
assert.ok(s2.achievements.includes('master')&&s2.achievements.includes('gold'));

// 票房对赌结算
s2.bet={rivalId:'r1',rivalName:'星河传媒',stake:500000,myScore:8.0,rivalScore:7.1};
const cash=s2.money;
api.resolveBet();
assert.equal(s2.money,cash+1000000);
assert.equal(s2.bet,null);
assert.ok(s2.flags.betWon);

// 挖角成本随实力上升
assert.ok(api.poachCost({strength:82})>api.poachCost({strength:59}));

console.log('game-core: all assertions passed');
