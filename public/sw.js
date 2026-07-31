// Self-destroying service worker. The previous Gatsby site
// (gatsby-plugin-offline) registered a worker at this path that keeps serving
// its cached app shell to returning visitors, who then see a blank page. This
// replacement takes over immediately, wipes every cache it left behind, and
// reloads open tabs so the current site is fetched from the network.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.navigate(client.url));
    })(),
  );
});
