import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { globSync } from "glob";
import sharp from "sharp";
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

const inlineStyles = (html: string) =>
  [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)]
    .map(([, css]) => css)
    .join("\n");

test.each(["dist/index.html", "dist/2025-retrospective/index.html"])(
  "the first render of %s needs no stylesheet round trip",
  (file) => {
    const html = readFileSync(file, "utf8");
    const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
    expect(head).not.toMatch(/<link\b[^>]*\brel="stylesheet"/);
    expect(inlineStyles(head)).toMatch(
      /img\[width\]\[height\]\s*\{[^}]*height:\s*auto/,
    );
  },
);

describe("image delivery", () => {
  test("the sidebar serves crisp profile images without the full original", async () => {
    const html = readFileSync("dist/index.html", "utf8");
    const image = html.match(/<img\b[^>]*alt="amoseui"[^>]*>/)?.[0] ?? "";
    expect(image).toContain('loading="eager"');
    expect(image).toContain('sizes="56px"');
    const sources = [
      image.match(/\bsrc="([^"]+)"/)?.[1],
      ...(image.match(/\bsrcset="([^"]+)"/)?.[1] ?? "")
        .split(",")
        .map((candidate) => candidate.trim().split(/\s+/)[0]),
    ];
    expect(sources.length).toBeGreaterThan(2);
    for (const src of sources) {
      expect(src).toMatch(/\.webp$/);
      const bytes = readFileSync(path.join("dist", src ?? ""));
      const metadata = await sharp(bytes).metadata();
      expect(metadata.width).toBeGreaterThanOrEqual(168);
      expect(metadata.width).toBeLessThanOrEqual(224);
      expect(metadata.height).toBe(metadata.width);
      expect(bytes.length).toBeLessThan(20_000);
    }
  });

  test("article images offer smaller candidates for narrow content columns", () => {
    const html = readFileSync("dist/2025-retrospective/index.html", "utf8");
    const image = html.match(/<img\b[^>]*alt="github"[^>]*>/)?.[0] ?? "";
    const srcset = image.match(/\bsrcset="([^"]+)"/)?.[1] ?? "";
    expect(srcset.split(",").length).toBeGreaterThan(1);
    expect(image).toContain("690px");
    expect(image).toContain("calc(100vw - 37.5px)");
    expect(image).toContain('loading="lazy"');
  });
});

describe("post-list navigation", () => {
  test.each([
    ["/", 1],
    ["/page/1/", 2],
    ["/page/2/", 3],
    ["/page/4/", 5],
    ["/tag/chromium/", 1],
    ["/tag/chromium/page/1/", 2],
    ["/tag/chromium/page/2/", 3],
  ])("marks the displayed page on %s", (pathname, currentPage) => {
    const html = readFileSync(
      path.join("dist", pathname, "index.html"),
      "utf8",
    );
    const navigations = [
      ...html.matchAll(
        /<nav\b[^>]*aria-label="글 목록 페이지"[\s\S]*?<\/nav>/g,
      ),
    ];
    expect(navigations, pathname).toHaveLength(2);
    for (const [navigation] of navigations) {
      const current = navigation.match(
        /aria-current="page"[^>]*>\s*(\d+)\s*</,
      )?.[1];
      expect(Number(current), pathname).toBe(currentPage);
      for (const [, href] of navigation.matchAll(/href="([^"]+)"/g)) {
        expect(existsSync(path.join("dist", href, "index.html")), href).toBe(
          true,
        );
        if (pathname.startsWith("/tag/chromium/")) {
          expect(href).toMatch(/^\/tag\/chromium\//);
        }
      }
    }
    if (currentPage > 1) {
      expect(html).toContain(`- Page ${currentPage} -`);
    }
  });

  test("omits pagination from a one-page tag archive", () => {
    const html = readFileSync("dist/tag/testing/index.html", "utf8");
    expect(html).not.toContain('aria-label="글 목록 페이지"');
    expect(html).not.toContain('rel="prev"');
    expect(html).not.toContain('rel="next"');
  });
});

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

  test("retired category urls resolve to tag archives without being indexed", () => {
    const redirects = [
      ["/category/aosp/", "/tag/aosp/"],
      ["/category/chromium/", "/tag/contribution/"],
      ["/category/chromium/page/1/", "/tag/contribution/page/1/"],
      ["/category/conference/", "/tag/conference/"],
      ["/category/opensource/", "/tag/opensource/"],
      ["/category/retrospective/", "/tag/retrospective/"],
      ["/category/retrospective/page/1/", "/tag/retrospective/page/1/"],
      ["/category/review/", "/tag/codecoverage/"],
    ];
    const sitemap = readFileSync("dist/sitemap-0.xml", "utf8");
    for (const [oldPath, target] of redirects) {
      const html = readFileSync(
        path.join("dist", oldPath, "index.html"),
        "utf8",
      );
      const redirect = html.match(
        /http-equiv="refresh" content="0;url=([^"]+)"/,
      );
      const canonical = html.match(/rel="canonical" href="([^"]+)"/);
      const robots = html.match(/name="robots" content="([^"]+)"/);
      expect(redirect?.[1], oldPath).toBe(target);
      expect(robots?.[1], oldPath).toBe("noindex");
      expect(canonical?.[1], oldPath).toBe(`https://blog.amoseui.com${target}`);
      expect(existsSync(path.join("dist", target, "index.html"))).toBe(true);
      expect(sitemap).not.toContain(`https://blog.amoseui.com${oldPath}`);
    }
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
    const css = [
      inlineStyles(readFileSync("dist/2025-retrospective/index.html", "utf8")),
      ...cssFiles.map((f) => readFileSync(f, "utf8")),
    ].join("\n");
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
