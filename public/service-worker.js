const FILES_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/idb.js',
  './js/index.js',
  './manifest.json',
  '/api/transaction',
  'https://cdn.jsdelivr.net/npm/chart.js@2.8.0',
  'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
  'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/fonts/fontawesome-webfont.woff2?v=4.7.0',
];

const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_03';
const CACHE_NAME = APP_PREFIX + VERSION;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    })()
  );
});

self.addEventListener('activate', (event) =>
  event.waitUntil(
    (async () => {
      const keyList = await caches.keys();
      const keepList = keyList.filter((key) => key.indexOf(APP_PREFIX));
      keepList.push(CACHE_NAME);
      return Promise.all(
        keyList.map((key, i) =>
          keepList.includes(key) ? null : caches.delete(keyList[i])
        )
      );
    })()
  )
);

async function apiCacheHandler(request) {
  try {
    const response = await fetch(request);
    if (!response.ok) {
      if (request.method === 'GET') {
        return (
          (await caches.match(request)) || new Response(null, {status: 503})
        );
      } else {
        return new Response(null, {status: 500});
      }
    }
    if (request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      console.debug(`Updating cache: ${request.url}`);
      cache.add(request, response.clone());
    } else if (request.method === 'POST') {
      if (!response.ok) return response; // error handling by loudly insisting it isn't *my* problem
      // update the cache for the associated GET route aggressively
      // because we're a PWA and the network could disappear at any moment
      const url = request.url.replace('/bulk', '');
      console.info(`POST: ${request.url}\nPreemptively cache: ${url}`);
      const cache = await caches.open(CACHE_NAME);
      cache.add(url, await fetch(url));
    }
    return response;
  } catch (err) {
    return (await caches.match(request)) || new Response(null, {status: 503});
  }
}

self.addEventListener('fetch', (event) => {
  console.debug(`fetch request: ${event.request.url}`);
  return event.respondWith(
    (async () => {
      const url = new URL(event.request.url);
      if (url.pathname.indexOf('/icons/') >= 0) {
        // lazy cache icons when requested so we aren't caching all of them
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(url);
        if (cached) {
          console.debug(`Cached: ${url}`);
          return cached;
        }
        const response = await fetch(url);
        console.debug(`Adding to cache: ${url}`);
        cache.add(url, response);
        return response;
      } else if (url.pathname.indexOf('/api/') === -1) {
        // everything else that isn't in /api/ is cache first
        return (
          (await caches.match(event.request)) ||
          (await fetch(event.request)) ||
          new Response(null, {status: 503})
        );
      }
      // assert(url.pathname.indexOf('/api') >= 0)
      return await apiCacheHandler(event.request);
    })()
  );
});
