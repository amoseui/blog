import { expect, test } from "vitest";
import sharp from "sharp";

import { GET as getSw } from "./pages/sw.js.ts";
import { GET as getPhoto } from "./pages/photo.jpg.ts";
import { GET as getFavicon } from "./pages/favicon-32x32.png.ts";
import { GET as getAppleTouchIcon } from "./pages/apple-touch-icon.png.ts";

// These file endpoints replace the old prebuild step that copied generated
// assets into public/: everything is produced straight into dist/ at build
// time and served the same way by the dev server.

const asContext = (params: Record<string, string> = {}) =>
  ({ params }) as Parameters<typeof getFavicon>[0];

test("/sw.js serves the self-destroying service worker", async () => {
  const res = getSw(asContext());
  expect(res.headers.get("Content-Type")).toContain("javascript");
  const body = await res.text();
  expect(body).toContain("skipWaiting()");
  expect(body).toContain("caches.delete");
});

test("/photo.jpg serves the profile image", async () => {
  const res = getPhoto(asContext());
  expect(res.headers.get("Content-Type")).toBe("image/jpeg");
  const bytes = new Uint8Array(await res.arrayBuffer());
  // JPEG SOI marker
  expect([bytes[0], bytes[1]]).toEqual([0xff, 0xd8]);
});

test("/favicon-32x32.png serves a 32px png", async () => {
  const res = await getFavicon(asContext());
  expect(res.headers.get("Content-Type")).toBe("image/png");
  const meta = await sharp(Buffer.from(await res.arrayBuffer())).metadata();
  expect(meta.format).toBe("png");
  expect(meta.width).toBe(32);
  expect(meta.height).toBe(32);
});

test("/apple-touch-icon.png serves the standard 180px icon", async () => {
  const res = await getAppleTouchIcon(asContext());
  expect(res.headers.get("Content-Type")).toBe("image/png");
  const meta = await sharp(Buffer.from(await res.arrayBuffer())).metadata();
  expect(meta.width).toBe(180);
  expect(meta.height).toBe(180);
});
