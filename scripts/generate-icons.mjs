import { copyFileSync, mkdirSync } from "node:fs";
import sharp from "sharp";

// Single source of truth for the profile image: content/photo.jpg.
// Generates the favicon set (same sizes gatsby-plugin-manifest produced),
// the 32px favicon and the sidebar photo into public/, which is gitignored
// for these paths and rebuilt by the prebuild/prestart hooks.
const SOURCE = "content/photo.jpg";
const SIZES = [48, 72, 96, 144, 192, 256, 384, 512];

mkdirSync("public/icons", { recursive: true });

await Promise.all([
  ...SIZES.map((size) =>
    sharp(SOURCE)
      .resize(size, size, { fit: "cover" })
      .png()
      .toFile(`public/icons/icon-${size}x${size}.png`),
  ),
  sharp(SOURCE)
    .resize(32, 32, { fit: "cover" })
    .png()
    .toFile("public/favicon-32x32.png"),
]);
copyFileSync(SOURCE, "public/photo.jpg");

console.log(`generated ${SIZES.length} icons + favicon + photo from ${SOURCE}`);
