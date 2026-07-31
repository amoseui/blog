import type { APIRoute } from "astro";
import sharp from "sharp";

import { ICON_SOURCE } from "@/lib/icons";

export const GET: APIRoute = async () => {
  const png = await sharp(ICON_SOURCE)
    .resize(32, 32, { fit: "cover" })
    .png()
    .toBuffer();
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
