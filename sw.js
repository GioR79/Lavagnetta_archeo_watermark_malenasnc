const CACHE = "lavagnetta-v3";

self.addEventListener("install", e => {
  self.skipWaiting();

  e.waitUntil(
    caches.open(CACHE).then(c =>
      c.addAll([
        "./",
        "./index.html",
        "./manifest.webmanifest"
      ])
    )
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache =>
            cache.put("./index.html", copy)
          );
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});
