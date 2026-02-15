const CACHE_NAME = 'guarina0x0-v8';
const ASSETS = [
    '/',
    '/index.html',
    '/cheatsheets.html',
    '/writeups.html',
    '/crte-cheatsheet.html',
    '/crto-cheatsheet.html',
    '/cwp-cheatsheet.html',
    '/cartp-cheatsheet.html',
    '/blizzard-review.html',
    '/hades-review.html',
    '/styles.css',
    '/index.css',
    '/main.js',
    '/index.js',
    '/search-index.js',
    '/favicon.svg',
    '/favicon-32x32.png',
    '/og-image.png'
];

// Install: cache core assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch: network-first for HTML, cache-first for assets
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Only handle same-origin requests
    if (url.origin !== location.origin) return;

    // HTML pages: network first, fallback to cache
    if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request) || caches.match('/index.html'))
        );
        return;
    }

    // Static assets: cache first, fallback to network
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            });
        })
    );
});
