'use strict';
// ── 美术资源清单 ──────────────────────────────────────────────
// 规则：这里预先登记所有计划中的图片文件名。文件还没出的时候，
// <img> 会 onerror 静默移除并给容器打上 .no-art，退回纯 CSS 表现。
// 所以「丢一张图进 assets 就多一处变好看」，不需要改任何代码。
// 加立绘：把 portraitCount 里对应岗位的数字 +1，文件按 <role>-03.webp 命名。
const ART={
  scenePath:'assets/scene/',
  portraitPath:'assets/portrait/',
  // 场景图 1280×720 webp
  scenes:['stage-lv1','stage-lv2','stage-lv3','phase-script','phase-prep','phase-shoot','phase-post',
          'market-script','release-deal','premiere','casting','award','hq-office','rivals','ending-rise','ending-fall'],
  // 事件氛围图 960×540 webp，事件用 mood 字段取图
  moods:['rain','hospital','press','online','sign','wrap','idle','review'],
  // 立绘 512×640 webp，每个岗位可用张数
  portraitCount:{producer:2,director:2,writer:2,actor:2,camera:2,editor:2,art:2,marketing:2,star:4}
};
const PHASE_SCENES=['phase-script','phase-prep','phase-shoot','phase-post'];
function artMiss(img){const box=img.parentNode;if(box)box.classList.add('no-art');img.remove()}
function sceneImg(id,cls=''){return id?`<img class="scene-img ${cls}" src="${ART.scenePath}${id}.webp" alt="" loading="lazy" decoding="async" onerror="artMiss(this)">`:''}
function moodImg(mood){return mood&&ART.moods.includes(mood)?`<div class="scene-band plain">${sceneImg('mood-'+mood)}</div>`:''}
function sceneBanner(id,title,sub){return `<div class="scene-band">${sceneImg(id)}<div class="scene-text"><b>${title}</b>${sub?`<small>${sub}</small>`:''}</div></div>`}
// 人物领脸：一局之内同一个人永远同一张。存档里存 face 字段。
function pickFace(role,star){
  const key=star?'star':role,n=ART.portraitCount[key]||0;if(!n)return null;
  const all=[];for(let i=1;i<=n;i++)all.push(`${key}-${String(i).padStart(2,'0')}`);
  let used=[];try{used=((typeof S!=='undefined'&&S&&S.staff)||[]).map(e=>e.face)}catch(e){}
  const free=all.filter(f=>!used.includes(f));const pool=free.length?free:all;
  return pool[Math.floor(Math.random()*pool.length)];
}
function portraitBox(e){return e&&e.face?`<div class="portrait">${faceImg(e)}</div>`:''}
function faceImg(e){return e&&e.face?`<img src="${ART.portraitPath}${e.face}.webp" alt="" loading="lazy" decoding="async" onerror="artMiss(this)">`:''}
// 头像：底下永远垫着原来的色块+首字，图加载失败就露出来
function avatarHtml(e,cls=''){return `<div class="avatar ${cls}" style="--avatar:${roleColors[e.role]};${e.star?'box-shadow:0 0 0 2px var(--gold)':''}" aria-hidden="true">${e.star?'★':roles[e.role][0][0]}${faceImg(e)}</div>`}
function studioScene(){return 'stage-lv'+(clamp(S.studio,0,2)+1)}
function stageScene(){const p=S.projects.find(x=>!x.ready)||S.projects[0];return p&&!p.ready?PHASE_SCENES[clamp(p.phase,0,3)]:studioScene()}
