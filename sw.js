
const CACHE_NAME = "tasky-shell-v1";

const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/style.css",
    "./css/dashboard.css",
    "./css/tasks.css",
    "./css/calendar.css",
    "./css/analytics.css",
    "./css/premium.css",
    "./css/animations.css",
    "./css/mobile-compact.css",
    "./css/concept-redesign.css",
    "./js/utils.js",
    "./js/storage.js",
    "./js/tasks.js",
    "./js/planner.js",
    "./js/calendar.js",
    "./js/analytics.js",
    "./js/achievements.js",
    "./js/notifications.js",
    "./js/theme.js",
    "./js/export.js",
    "./js/settings.js",
    "./js/premium.js",
    "./js/sections.js",
    "./js/focus.js",
    "./js/app.js"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache =>
            cache.addAll(APP_SHELL)
        ).then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key =>
                        key.startsWith("tasky-shell-") &&
                        key !== CACHE_NAME
                    )
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const request = event.request;
    const url = new URL(request.url);

    if (
        request.method !== "GET" ||
        url.origin !== self.location.origin
    ) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(async () => {
                const cachedPage = await caches.match("./index.html");
                return cachedPage || Response.error();
            })
        );
        return;
    }

    event.respondWith(
        caches.match(request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;

            return fetch(request);
        })
    );
});
                         
