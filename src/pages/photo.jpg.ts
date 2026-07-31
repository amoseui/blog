import { readFileSync } from "node:fs";
import type { APIRoute } from "astro";

import { ICON_SOURCE } from "@/lib/icons";

// Sidebar profile photo (content/config.json points at /photo.jpg).
export const GET: APIRoute = () =>
  new Response(readFileSync(ICON_SOURCE), {
    headers: { "Content-Type": "image/jpeg" },
  });
