import { globSync } from "glob";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const outDir = "internal/verification/fixtures";
mkdirSync(outDir, { recursive: true });

// nodir: gatsby creates a directory literally named "page-data/404.html"
const htmlFiles = globSync("public/**/*.html", { nodir: true }).sort();
const urls = htmlFiles.map((f) => "/" + path.relative("public", f));
// trailing newline keeps generated fixtures prettier-compliant
writeFileSync(`${outDir}/urls.json`, JSON.stringify(urls, null, 2) + "\n");

const anchors = {};
for (const f of htmlFiles) {
  const html = readFileSync(f, "utf8");
  const ids = [...html.matchAll(/<h[1-6][^>]*\bid="([^"]+)"/g)]
    .map((m) => m[1])
    .sort();
  if (ids.length) anchors["/" + path.relative("public", f)] = ids;
}
writeFileSync(`${outDir}/anchors.json`, JSON.stringify(anchors, null, 2) + "\n");

const rss = readFileSync("public/rss.xml", "utf8");
const items = [...rss.matchAll(/<item>[\s\S]*?<\/item>/g)].map((m) => ({
  title: (m[0].match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/) ??
    [])[1],
  link: (m[0].match(/<link>(.*?)<\/link>/) ?? [])[1],
  guid: (m[0].match(/<guid[^>]*>(.*?)<\/guid>/) ?? [])[1],
}));
writeFileSync(`${outDir}/rss-items.json`, JSON.stringify(items, null, 2) + "\n");

console.log(
  `urls=${urls.length} anchorPages=${Object.keys(anchors).length} rssItems=${items.length}`,
);
