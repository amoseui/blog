import { readFileSync } from "node:fs";
import type { APIRoute } from "astro";

// The worker source lives outside src/pages so it stays plain JS; this
// endpoint emits it verbatim at /sw.js (see src/sw.js for why it exists).
export const GET: APIRoute = () =>
  new Response(readFileSync("src/sw.js", "utf-8"), {
    headers: { "Content-Type": "application/javascript; charset=utf-8" },
  });
