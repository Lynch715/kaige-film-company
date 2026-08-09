import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const storage=new Map();
const stubElement=()=>({disabled:false,classList:{add(){},remove(){},toggle(){}},addEventListener(){}});
const context={
  console,Math,JSON,Intl,setInterval,clearInterval,setTimeout,clearTimeout,
  localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
  document:{getElementById:stubElement,querySelectorAll:()=>[],querySelector:()=>null},
  window:{addEventListener(){}},confirm:()=>true
};
vm.createContext(context);
const source=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8')+`
;globalThis.__gameTest={fresh,normalize,competitionAt,updateIpAfterRelease,studio,setState:x=>S=x,getState:()=>S};`;
vm.runInContext(source,context,{filename:'game.js'});
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

console.log('game-core: all assertions passed');
