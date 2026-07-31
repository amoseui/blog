import type { APIRoute } from "astro";
import sharp from "sharp";

import { ICON_SIZES, ICON_SOURCE } from "@/lib/icons";

export const getStaticPaths = () =>
  ICON_SIZES.map((size) => ({ params: { icon: `icon-${size}x${size}` } }));

export const GET: APIRoute = async ({ params }) => {
  const size = Number(/^icon-(\d+)x/.exec(params.icon ?? "")?.[1]);
  const png = await sharp(ICON_SOURCE)
    .resize(size, size, { fit: "cover" })
    .png()
    .toBuffer();
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
