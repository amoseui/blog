import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { globSync } from "glob";
import { describe, expect, test } from "vitest";

const fixtures = (name: string) =>
  JSON.parse(readFileSync(`internal/verification/fixtures/${name}`, "utf8"));

const decodeEntities = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

// The fixtures are a frozen snapshot of the last gatsby build (2026-07-30) and
// are never regenerated (gatsby is gone). The contract is monotonic: every
// baseline url, anchor and rss item must keep existing so old links never
// break, while new posts are free to add urls and rss items on top.
describe("dist keeps the gatsby baseline contract", () => {
  test("dist exists (run npm run build first)", () => {
    expect(existsSync("dist/index.html")).toBe(true);
  });

  test("every baseline url still exists", () => {
    const expected = fixtures("urls.json") as string[];
    const actual = new Set(
      globSync("dist/**/*.html").map((f) => "/" + path.relative("dist", f)),
    );
    const missing = expected.filter((url) => !actual.has(url));
    expect(missing).toEqual([]);
  });

  test("heading anchors are identical per page", () => {
    const expected = fixtures("anchors.json") as Record<string, string[]>;
    for (const [page, ids] of Object.entries(expected)) {
      const html = readFileSync(path.join("dist", page), "utf8");
      const actual = [...html.matchAll(/<h[1-6][^>]*\bid="([^"]+)"/g)]
        .map((m) => m[1])
        .sort();
      expect(actual, page).toEqual(ids);
    }
  });

  test("heading markup keeps the gatsby anchor shape", () => {
    // Legacy scss (Content.module.scss h2 > a, base/_anchor.scss) only works
    // with the gatsby-remark-autolink-headers shape: heading text must stay a
    // direct child and the anchor must be the prepended octicon link.
    const expected = fixtures("anchors.json") as Record<string, string[]>;
    for (const [page, ids] of Object.entries(expected)) {
      if (ids.length === 0) continue;
      const html = readFileSync(path.join("dist", page), "utf8");
      const headings = [
        ...html.matchAll(/<h[1-6][^>]*\bid="[^"]+"[^>]*>[\s\S]*?<\/h[1-6]>/g),
      ];
      expect(headings.length, page).toBeGreaterThan(0);
      for (const [heading] of headings) {
        expect(heading, page).toMatch(
          /^<h[1-6][^>]*><a [^>]*class="anchor before"[^>]*><svg[\s\S]*?<\/svg><\/a>/,
        );
      }
    }
  });

  test("baseline rss items keep their guids with canonical links", () => {
    const expected = fixtures("rss-items.json") as {
      title: string;
      link: string;
      guid: string;
    }[];
    const rssContent = readFileSync("dist/rss.xml", "utf8");
    const items = [...rssContent.matchAll(/<item>[\s\S]*?<\/item>/g)];
    expect(items.length).toBeGreaterThanOrEqual(expected.length);
    for (const { title, link, guid } of expected) {
      const item = items.find(([xml]) =>
        xml.includes(`<guid isPermaLink="false">${guid}</guid>`),
      )?.[0];
      expect(item, title).toBeDefined();
      const actualTitle = decodeEntities(
        item?.match(
          /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/,
        )?.[1] ?? "",
      );
      expect(actualTitle).toBe(title);
      expect(item).toContain(`<link>${link}/</link>`);
      expect(item?.match(/<guid\b/g)).toHaveLength(1);
    }
  });

  test("all rss item links use the canonical trailing-slash form", () => {
    const rssContent = readFileSync("dist/rss.xml", "utf8");
    const items = [...rssContent.matchAll(/<item>[\s\S]*?<\/item>/g)];
    expect(items.length).toBeGreaterThan(0);
    for (const [item] of items) {
      const link = item.match(/<link>([^<]+)<\/link>/)?.[1];
      expect(link).toMatch(/^https:\/\/blog\.amoseui\.com\/.+\/$/);
    }
  });

  test("content images keep their intrinsic ratio when width is capped", () => {
    // astro:assets emits explicit width/height attributes; the post body caps
    // rendered width via max-width, so the stylesheet must reset height to
    // auto or every image wider than the column renders distorted.
    const cssFiles = globSync("dist/_astro/*.css");
    expect(cssFiles.length).toBeGreaterThan(0);
    const css = cssFiles.map((f) => readFileSync(f, "utf8")).join("\n");
    expect(css).toMatch(/img\[width\]\[height\]\s*\{[^}]*height:\s*auto/);
  });

  test("rss dates and guid match the gatsby form", () => {
    // Frontmatter datetimes are naive and gatsby interpreted them as utc;
    // parsing them in the build machine's local timezone shifts every
    // pubDate (and can reset read-state in strict feed readers). The gatsby
    // feed also marked guids isPermaLink="false".
    const rssContent = readFileSync("dist/rss.xml", "utf8");
    expect(rssContent).toContain('<guid isPermaLink="false">');
    expect(rssContent).not.toContain('isPermaLink="true"');
    expect(rssContent).toContain(
      "<pubDate>Fri, 01 Jan 2016 18:20:22 GMT</pubDate>",
    );
  });

  test("sitemap and robots exist", () => {
    // No CNAME check: pages deployed via actions takes the custom domain
    // from the repo settings, not from a file in the artifact.
    expect(existsSync("dist/sitemap-index.xml")).toBe(true);
    expect(existsSync("dist/robots.txt")).toBe(true);
    expect(readFileSync("dist/robots.txt", "utf8")).toContain(
      "Sitemap: https://blog.amoseui.com/sitemap-index.xml",
    );
  });

  test("sitemap urls use the canonical trailing-slash form", () => {
    // Github pages serves the slash form with 200 and 301-redirects the bare
    // form; the sitemap must point crawlers at the 200 form.
    const sitemap = readFileSync("dist/sitemap-0.xml", "utf8");
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(0);
    const bare = locs.filter((u) => !u.endsWith("/"));
    expect(bare).toEqual([]);
  });

  test("internal page links in html and rss content use the canonical form", () => {
    // Crawlers walking bare-form links hit a 301 on every hop, which search
    // console reports as "page with redirect". All internal hrefs must use
    // the slash form.
    const origin = "https://blog.amoseui.com";
    const documents = [...globSync("dist/**/*.html"), "dist/rss.xml"];
    for (const document of documents) {
      const html = decodeEntities(readFileSync(document, "utf8"));
      const base = new URL(path.relative("dist", document), `${origin}/`);
      const links = [...html.matchAll(/href="([^"]+)"/g)].map(
        (m) => new URL(m[1], base),
      );
      const bare = links
        .filter(
          (url) =>
            url.origin === origin &&
            !url.pathname.endsWith("/") &&
            !path.posix.extname(url.pathname),
        )
        .map((url) => url.href);
      expect(bare, document).toEqual([]);
    }
  });

  test("generated icons and profile photo exist", () => {
    // Rendered from content/photo.jpg by the file endpoints in src/pages.
    // The gatsby-era 48-512px manifest icon set was dropped: without a web
    // manifest only the favicon and one 180px apple-touch-icon are used.
    expect(existsSync("dist/favicon-32x32.png")).toBe(true);
    expect(existsSync("dist/apple-touch-icon.png")).toBe(true);
    expect(existsSync("dist/photo.jpg")).toBe(true);
    expect(existsSync("dist/icons")).toBe(false);
  });
});
