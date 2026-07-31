import type { APIRoute } from "astro";
import sharp from "sharp";

import { ICON_SOURCE } from "@/lib/icons";

// Single 180x180 icon at the path iOS probes by convention; replaces the
// gatsby-era 48-512px manifest set, which nothing referenced once the PWA
// manifest was dropped.
export const GET: APIRoute = async () => {
  const png = await sharp(ICON_SOURCE)
    .resize(180, 180, { fit: "cover" })
    .png()
    .toBuffer();
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
