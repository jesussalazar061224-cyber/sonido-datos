// =====================================================================
// sw.js — SERVICE WORKER
// Es un pequeño programa que el navegador ejecuta "por detrás" de la página.
// Sirve para que la app se pueda instalar en el celular y funcione SIN internet:
// guarda una copia de los archivos (caché) y la usa cuando no hay conexión.
// =====================================================================

// Nombre de la caché. Si algún día quieres obligar a borrar la copia vieja,
// cambia el número (v1 -> v2).
const CACHE = 'sonido-datos-v1';

// Lista de archivos que se guardan en el celular al instalar la app.
const ARCHIVOS = ['./', 'index.html', 'manifest.json', 'icono-192.png', 'icono-512.png'];

// EVENTO "install": ocurre la primera vez que se registra el service worker.
// Abre la caché, descarga y guarda todos los ARCHIVOS, y con skipWaiting()
// se activa de inmediato sin esperar a que se cierren las pestañas.
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())));

// EVENTO "activate": ocurre cuando esta versión toma el control.
// Revisa todas las cachés guardadas y borra las que tengan otro nombre
// (versiones viejas). clients.claim() hace que controle ya las páginas abiertas.
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));

// EVENTO "fetch": ocurre cada vez que la página pide un archivo.
// Estrategia "primero la red":
//   1. Intenta descargar el archivo de internet (fetch).
//   2. Si funciona, guarda una copia actualizada en la caché y la entrega.
//   3. Si falla (sin internet), entrega la copia guardada (caches.match).
// Por eso, con internet siempre ves la versión más nueva.
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).then(r => {
    const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r;
  }).catch(() => caches.match(e.request)));
});
