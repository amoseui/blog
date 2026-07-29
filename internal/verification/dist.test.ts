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
      expect(rssContent).toContain(`<guid isPermaLink="true">${guid}</guid>`);
    }
  });

  test("sitemap, robots, cname exist", () => {
    expect(existsSync("dist/sitemap-index.xml")).toBe(true);
    expect(existsSync("dist/robots.txt")).toBe(true);
    expect(existsSync("dist/CNAME")).toBe(true);
  });
});
