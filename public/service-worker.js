const FILES_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/idb.js',
  './js/index.js',
  'https://cdn.jsdelivr.net/npm/chart.js@2.8.0',
  'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
];

const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.debug(`installing cache: ${CACHE_NAME}`);
      return cache.addAll(FILES_TO_CACHE);
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keyList = await caches.keys();
      const keepList = keyList.filter((key) => key.indexOf(APP_PREFIX));
      keepList.push(CACHE_NAME);
      return Promise.all(
        keyList.map((key, i) => {
          if (!keepList.includes(key)) {
            console.debug(`deleting cache: ${keyList[i]}`);
            return caches.delete(keyList[i]);
          }
        })
      );
    })()
  );
});

self.addEventListener('fetch', (event) => {
  event.waitUntil(
    // (() => caches.match(event.request) || fetch(event.request))()
    (async () => {
      const request = await caches.match(event.request);
      if (request) {
        console.info(`responding with cache: ${event.request.url}`);
        return request;
      } else {
        console.info(`file not cached, fetching: ${event.request.url}`);
        return fetch(event.request);
      }
    })()
  );
});
