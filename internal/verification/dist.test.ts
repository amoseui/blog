import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { globSync } from "glob";
import { describe, expect, test } from "vitest";

const fixtures = (name: string) =>
  JSON.parse(readFileSync(`internal/verification/fixtures/${name}`, "utf8"));

describe("dist parity with gatsby baseline", () => {
  test("dist exists (run npm run build first)", () => {
    expect(existsSync("dist/index.html")).toBe(true);
  });

  test("url set is identical", () => {
    const expected = fixtures("urls.json") as string[];
    const actual = globSync("dist/**/*.html")
      .map((f) => "/" + path.relative("dist", f))
      .sort();
    expect(actual).toEqual(expected);
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

  test("rss items match", () => {
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
    expect(items).toHaveLength(expected.length);
    const actualTitles = items.map(([item]) =>
      decodeEntities(
        (item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/) ??
          [])[1] ?? "",
      ),
    );
    expect(actualTitles).toEqual(expected.map((e) => e.title));
    for (const { link, guid } of expected) {
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
