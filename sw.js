// 开个影视公司 · service worker
// 代码走「网络优先」，保证 push 之后立刻是新版；图片走「先用缓存、后台更新」。
// 断网时全部回落到缓存，飞机上也能开。
const VER = 'kaige-v1';
const SHELL = [
  './', './index.html',
  './src/data.js', './src/events.js', './src/art.js', './src/game.js', './src/install.js',
  './site.webmanifest', './favicon.ico', './icon/icon-192.png', './icon/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(SHELL)));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== VER).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

const isAsset = p => /\/(assets|icon)\//.test(p) || /\.(webp|png|jpg|ico)$/i.test(p);

async function networkFirst(req) {
  const cache = await caches.open(VER);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req);
    if (hit) return hit;
    if (req.mode === 'navigate') {
      const shell = await cache.match('./index.html');
      if (shell) return shell;
    }
    throw err;
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(VER);
  const hit = await cache.match(req);
  if (hit) {
    fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); }).catch(() => {});
    return hit;
  }
  const res = await fetch(req);
  if (res && res.ok) cache.put(req, res.clone());
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(isAsset(url.pathname) ? cacheFirst(req) : networkFirst(req));
});
