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

  test("rss items match", () => {
    const expected = fixtures("rss-items.json") as {
      title: string;
      link: string;
      guid: string;
    }[];
    const rssContent = readFileSync("dist/rss.xml", "utf8");
    const items = [...rssContent.matchAll(/<item>[\s\S]*?<\/item>/g)];
    expect(items).toHaveLength(expected.length);
    for (const { link } of expected) {
      expect(rssContent).toContain(`<link>${link}</link>`);
    }
  });

  test("sitemap, robots, cname exist", () => {
    expect(existsSync("dist/sitemap-index.xml")).toBe(true);
    expect(existsSync("dist/robots.txt")).toBe(true);
    expect(existsSync("dist/CNAME")).toBe(true);
  });
});
