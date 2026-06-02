// ============================================================
//  Service Worker — habilita instalación PWA y juego offline.
//  Estrategia:
//   · navegación  -> network-first (cae a caché si no hay red)
//   · Phaser CDN  -> cache-first (URL versionada/inmutable)
//   · resto local -> stale-while-revalidate (rápido + se refresca)
//  Sube CACHE_VERSION cuando quieras forzar refresco del shell.
// ============================================================
const CACHE_VERSION = 'msitafury-v3';
const CDN = 'https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js';

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  CDN,
  './src/data/config.js',
  './src/audio/Sound.js',
  './src/art/Pixel.js',
  './src/art/CharacterArt.js',
  './src/art/SceneryArt.js',
  './src/entities/Player.js',
  './src/entities/Chairo.js',
  './src/entities/Lucky.js',
  './src/entities/Boss.js',
  './src/scenes/BootScene.js',
  './src/scenes/MenuScene.js',
  './src/scenes/CharacterSelectScene.js',
  './src/scenes/GameScene.js',
  './src/scenes/EndScene.js',
  './src/main.js',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_VERSION).then((c) =>
      // No fallar la instalación si algún recurso opcional no carga.
      Promise.allSettled(SHELL.map((u) => c.add(new Request(u, { cache: 'reload' }))))
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Navegación: red primero, caché de respaldo.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put('./index.html', copy));
        return res;
      }).catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // Phaser CDN: caché primero (es inmutable por versión).
  if (req.url === CDN) {
    e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
      return res;
    })));
    return;
  }

  // Resto: stale-while-revalidate.
  e.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
