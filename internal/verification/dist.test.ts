import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { globSync } from "glob";
import { describe, expect, test } from "vitest";

const fixtures = (name: string) =>
  JSON.parse(readFileSync(`internal/verification/fixtures/${name}`, "utf8"));

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

  test("every baseline rss item still exists", () => {
    const expected = fixtures("rss-items.json") as {
      title: string;
      link: string;
      guid: string;
    }[];
    const decodeEntities = (s: string) =>
      s
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&");
    const rssContent = readFileSync("dist/rss.xml", "utf8");
    const items = [...rssContent.matchAll(/<item>[\s\S]*?<\/item>/g)];
    expect(items.length).toBeGreaterThanOrEqual(expected.length);
    const actualTitles = new Set(
      items.map(([item]) =>
        decodeEntities(
          (item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) ??
            [])[1] ?? "",
        ),
      ),
    );
    for (const { title, link, guid } of expected) {
      expect(actualTitles.has(title), title).toBe(true);
      expect(rssContent).toContain(`<link>${link}</link>`);
      expect(rssContent).toContain(`<guid isPermaLink="false">${guid}</guid>`);
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

  test("sitemap, robots, cname exist", () => {
    expect(existsSync("dist/sitemap-index.xml")).toBe(true);
    expect(existsSync("dist/robots.txt")).toBe(true);
    expect(existsSync("dist/CNAME")).toBe(true);
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

  test("internal links use the canonical trailing-slash form", () => {
    // Crawlers walking bare-form links hit a 301 on every hop, which search
    // console reports as "page with redirect". All internal hrefs must use
    // the slash form.
    const pages = ["index.html", "2015-retrospective/index.html"];
    for (const page of pages) {
      const html = readFileSync(path.join("dist", page), "utf8");
      const hrefs = [...html.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]);
      const bare = hrefs.filter(
        (h) =>
          !h.endsWith("/") &&
          !h.includes("#") &&
          !/\.(png|jpg|jpeg|webp|svg|css|js|xml|ico)(\?|$)/.test(h),
      );
      expect(bare, page).toEqual([]);
    }
  });

  test("generated favicon set and profile photo exist", () => {
    // These are built from content/photo.jpg by scripts/generate-icons.mjs
    // (prebuild hook) and are not tracked in git.
    for (const size of [48, 72, 96, 144, 192, 256, 384, 512]) {
      expect(existsSync(`dist/icons/icon-${size}x${size}.png`), `${size}`).toBe(
        true,
      );
    }
    expect(existsSync("dist/favicon-32x32.png")).toBe(true);
    expect(existsSync("dist/photo.jpg")).toBe(true);
  });
});
