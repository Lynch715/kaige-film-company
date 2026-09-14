'use strict';
// ── 装到桌面 ──────────────────────────────────────────────
// Chrome/Edge：接住 beforeinstallprompt，点一下直接装。
// Safari（Mac 和 iPhone）：苹果不给这个接口，只能给指引。
// Firefox 桌面没有安装这回事，什么都不弹。
const INSTALL_KEY = 'film_install_v1';
let deferredPrompt = null, installShown = false;

const ua = navigator.userAgent;
const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua);
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

function installState(){ try { return localStorage.getItem(INSTALL_KEY) || '' } catch(e) { return '' } }
function setInstallState(v){ try { localStorage.setItem(INSTALL_KEY, v) } catch(e) {} }

function installBar(html){
  let bar = document.getElementById('installBar');
  if (!bar){
    bar = document.createElement('div');
    bar.id = 'installBar';
    bar.className = 'installbar';
    document.body.appendChild(bar);
  }
  bar.innerHTML = html;
  requestAnimationFrame(() => bar.classList.add('show'));
}
function closeInstallBar(remember){
  const bar = document.getElementById('installBar');
  if (bar) bar.classList.remove('show');
  if (remember) setInstallState('dismissed');
}

// 能不能一点就装
function canPrompt(){ return !!deferredPrompt }

function showInstallOffer(manual){
  if (standalone) { if (manual) toast('已经装过了，直接从桌面打开就行。'); return }
  if (!manual && (installShown || installState() === 'dismissed')) return;
  if (!manual && !canPrompt() && !isSafari) return;          // 不支持的浏览器不打扰
  installShown = true;

  const head = `<img src="icon/icon-64.png" alt="" width="46" height="46"><div class="grow"><b>装到桌面</b><small>${isIOS ? '装好以后全屏打开，断网也能玩' : '装好以后从桌面或程序坞直接打开，断网也能玩'}</small></div>`;

  if (canPrompt()){
    installBar(`${head}<div class="ib-act"><button class="primary" onclick="doInstall()">安装</button><button onclick="closeInstallBar(true)">以后再说</button></div>`);
  } else if (isSafari && isIOS){
    installBar(`${head}<div class="ib-act"><button onclick="closeInstallBar(true)">知道了</button></div><p class="ib-tip">点底部工具栏的<b>分享</b>按钮 → 往下找<b>「添加到主屏幕」</b> → 右上角<b>添加</b>。</p>`);
  } else if (isSafari){
    installBar(`${head}<div class="ib-act"><button onclick="closeInstallBar(true)">知道了</button></div><p class="ib-tip">菜单栏<b>文件</b> → <b>「添加到程序坞」</b>，图标会自动带上。</p>`);
  } else if (manual){
    installBar(`${head}<div class="ib-act"><button onclick="closeInstallBar(true)">知道了</button></div><p class="ib-tip">这个浏览器不支持一键安装。把网址存成书签，或者换 Chrome / Edge 打开再试。</p>`);
  }
}

async function doInstall(){
  if (!deferredPrompt) return closeInstallBar(true);
  closeInstallBar(false);
  deferredPrompt.prompt();
  let outcome = 'dismissed';
  try { outcome = (await deferredPrompt.userChoice).outcome } catch(e) {}
  deferredPrompt = null;
  setInstallState(outcome === 'accepted' ? 'installed' : 'dismissed');
  if (outcome === 'accepted') toast('装好了，桌面上能找到。');
}

// 等玩家真的进了游戏再计时，不一进来就糊脸。
// beforeinstallprompt 通常在点「成立新公司」之前就触发，所以这里要等界面出来。
let armed = false;
function armInstallOffer(){
  if (armed || standalone) return;
  const st = installState();
  if (st === 'dismissed' || st === 'installed') return;
  armed = true;
  const t = setInterval(() => {
    const app = document.getElementById('app');
    if (app && !app.classList.contains('hidden')){
      clearInterval(t);
      setTimeout(() => showInstallOffer(false), 45000);
    }
  }, 2000);
}
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; armInstallOffer() });
if (isSafari) addEventListener('load', armInstallOffer);   // Safari 不发这个事件，自己排队
addEventListener('appinstalled', () => { setInstallState('installed'); closeInstallBar(false) });

// ── service worker：离线可玩 + 有新版本时提醒 ──
if ('serviceWorker' in navigator && location.protocol.startsWith('http')){
  addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller){
            installBar(`<div class="grow"><b>有新版本</b><small>刷新一下就用上了，存档不受影响</small></div><div class="ib-act"><button class="primary" onclick="applyUpdate()">刷新</button><button onclick="closeInstallBar(false)">待会儿</button></div>`);
          }
        });
      });
    }).catch(() => {});
  });
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return; reloading = true; location.reload();
  });
}
function applyUpdate(){
  navigator.serviceWorker.getRegistration().then(reg => {
    if (reg && reg.waiting) reg.waiting.postMessage('skipWaiting');
    else location.reload();
  });
}
