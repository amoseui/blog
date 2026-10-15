import { runInNewContext } from "node:vm";

import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getCollection } from "astro:content";
import { expect, test } from "vitest";

import Post from "./Post.astro";

const fixture = async () => {
  const entry = (await getCollection("blog")).find(
    ({ data }) => data.slug === "/2015-retrospective",
  );
  if (!entry) throw new Error("fixture post not found");
  return entry;
};

test("links the outline to compiled h2 and h3 anchors in document order", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Post, {
    props: {
      entry: await fixture(),
      headings: [
        { depth: 1, slug: "title", text: "Title" },
        { depth: 2, slug: "오픈소스", text: "오픈소스" },
        { depth: 3, slug: "build-setup", text: "Build & setup" },
        { depth: 4, slug: "detail", text: "Detail" },
        { depth: 2, slug: "오픈소스-1", text: "오픈소스" },
      ],
    },
    slots: {
      default:
        '<h2 id="오픈소스">오픈소스</h2><h3 id="build-setup">Build &amp; setup</h3><h2 id="오픈소스-1">오픈소스</h2>',
    },
  });
  const navigation = html.match(
    /<nav\b[^>]*aria-label="목차"[\s\S]*?<\/nav>/,
  )?.[0];
  expect(navigation).toBeDefined();
  expect(
    [...(navigation ?? "").matchAll(/href="([^"]+)"/g)].map(([, href]) => href),
  ).toEqual([
    "#%EC%98%A4%ED%94%88%EC%86%8C%EC%8A%A4",
    "#build-setup",
    "#%EC%98%A4%ED%94%88%EC%86%8C%EC%8A%A4-1",
  ]);
  expect(navigation).toContain("Build &amp; setup");
});

test("omits an empty outline when the article has no h2 or h3 headings", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Post, {
    props: {
      entry: await fixture(),
      headings: [{ depth: 4, slug: "detail", text: "Detail" }],
    },
    slots: { default: '<h4 id="detail">Detail</h4>' },
  });
  expect(html).not.toContain('aria-label="목차"');
});

test("renders the mobile outline toggle collapsed before its module runs", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Post, {
    props: {
      entry: await fixture(),
      headings: [{ depth: 2, slug: "section", text: "Section" }],
    },
    slots: { default: '<h2 id="section">Section</h2>' },
  });
  const toggle = html.match(/<button\b[^>]*data-contents-toggle[^>]*>/)?.[0];
  expect(toggle).toBeDefined();
  expect(toggle).toContain('aria-expanded="false"');
  expect(toggle).not.toMatch(/\bhidden\b/);
  expect(html).toContain('href="#section"');

  const bootstrap = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
    .map(([, script]) => script)
    .find((script) => script.includes("document.currentScript"));
  expect(bootstrap).toBeDefined();
  const attributes = new Map<string, string>();
  const outline = {
    setAttribute: (name: string, value: string) => attributes.set(name, value),
  };
  expect(() =>
    runInNewContext(bootstrap ?? "", {
      document: { currentScript: { parentElement: outline } },
    }),
  ).not.toThrow();
  expect(attributes.has("data-enhanced")).toBe(true);
});
