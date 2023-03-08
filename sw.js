// from https://web.dev/learn/pwa/caching/

const urlsToCache = [
    "/",
    "bahnhofstafelsuche.webmanifest",
    "favicon.ico",
    "icon-192.png",
    "search.worker.js",
    "stops.csv",
    "turbocommons-es5.js",
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open("pwa-assets")
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                return cachedResponse || fetch(event.request);
            })
    );
});