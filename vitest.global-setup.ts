import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

// `astro sync` writes the content-layer data store to the cache dir
// (node_modules/.astro/data-store.json), but vitest boots astro's vite
// plugins in dev mode, where the store is read from .astro/data-store.json
// instead. Sync the collections and copy the store across so that
// getCollection() returns real entries inside tests.
export default function setup(): void {
  const root = fileURLToPath(new URL(".", import.meta.url));
  execFileSync("npx", ["astro", "sync"], { cwd: root, stdio: "ignore" });

  const cacheStore = new URL(
    "./node_modules/.astro/data-store.json",
    import.meta.url,
  );
  const devStoreDir = new URL("./.astro/", import.meta.url);
  const devStore = new URL("./data-store.json", devStoreDir);
  if (existsSync(cacheStore)) {
    mkdirSync(devStoreDir, { recursive: true });
    copyFileSync(cacheStore, devStore);
  }
}
