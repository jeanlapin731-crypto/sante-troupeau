// Permet d'ouvrir l'application sans réseau (étable, champ) et de l'installer sur le téléphone.
const CACHE = 'sante-troupeau-v3';
const LIBS = ['www.gstatic.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'];
const FICHIERS = ['./', './index.html', './firebase-config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).catch(() => {}));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Réseau d'abord (pour recevoir les mises à jour), copie locale si pas de réseau.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin !== location.origin && !LIBS.includes(url.hostname)) return;
  e.respondWith(
    // "no-cache" : toujours demander au serveur si le fichier a changé (évite d'afficher une ancienne version)
    (url.origin === location.origin ? fetch(e.request.url, { cache: 'no-cache' }) : fetch(e.request)).then(r => {
      if (r.ok) { const copie = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); }
      return r;
    }).catch(() => caches.match(e.request))
  );
});
