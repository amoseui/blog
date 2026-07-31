import { readFileSync } from "node:fs";

import { expect, test } from "vitest";

// The old Gatsby site (gatsby-plugin-offline) registered a service worker at
// /sw.js. Returning browsers are served the stale cached app shell, which
// fails to boot against the Astro site and renders a blank page. A
// self-destroying worker at the same path must replace it, clear its caches,
// and reload open tabs.
test("public/sw.js self-destroys the stale gatsby service worker", () => {
  const sw = readFileSync("public/sw.js", "utf-8");
  expect(sw).toContain("skipWaiting()");
  expect(sw).toContain("caches.keys()");
  expect(sw).toContain("caches.delete");
  expect(sw).toContain("client.navigate(client.url)");
});
