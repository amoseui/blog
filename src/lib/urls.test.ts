import { expect, test } from "vitest";

import { entryUrl, href, paginationUrl, tagUrl } from "./urls";

test("uses frontmatter slug verbatim", () => {
  expect(
    entryUrl({
      id: "posts/2016-01-01---2015-retrospective",
      data: { slug: "/2015-retrospective" },
    }),
  ).toBe("/2015-retrospective");
});

test("falls back to file path for pages without slug", () => {
  expect(entryUrl({ id: "pages/about/index", data: {} })).toBe("/pages/about");
});

test("strips md extension in file path fallback", () => {
  expect(entryUrl({ id: "pages/about/index.md", data: {} })).toBe(
    "/pages/about",
  );
});

test("tagUrl kebab-cases the tag", () => {
  expect(tagUrl("Code Coverage Best Practices")).toBe(
    "/tag/code-coverage-best-practices",
  );
});

test("paginationUrl returns base for page 0", () => {
  expect(paginationUrl("/", 0)).toBe("/");
  expect(paginationUrl("/tag/chromium", 0)).toBe("/tag/chromium");
});

test("paginationUrl appends page segment for later pages", () => {
  expect(paginationUrl("/", 1)).toBe("/page/1");
  expect(paginationUrl("/tag/chromium", 2)).toBe("/tag/chromium/page/2");
});

test("href appends a trailing slash for internal page urls", () => {
  expect(href("/2015-retrospective")).toBe("/2015-retrospective/");
  expect(href("/tag/aosp")).toBe("/tag/aosp/");
  expect(href("/page/1")).toBe("/page/1/");
});

test("href keeps root and already-slashed urls unchanged", () => {
  expect(href("/")).toBe("/");
  expect(href("/tag/chromium/")).toBe("/tag/chromium/");
});
