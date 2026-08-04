import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";

import Meta from "./Meta.astro";

const renderMeta = async (props: Record<string, unknown>) => {
  const container = await AstroContainer.create();
  return container.renderToString(Meta, {
    props: { title: "Title", description: "Description", ...props },
  });
};

test("open graph tags use the property attribute", async () => {
  const html = await renderMeta({ image: "/media/image.png" });
  expect(html).toContain('<meta property="og:title" content="Title"');
  expect(html).toContain('<meta property="og:description"');
  expect(html).toContain('<meta property="og:image"');
  expect(html).not.toContain('name="og:');
});

test("og:type defaults to website", async () => {
  const html = await renderMeta({});
  expect(html).toContain('<meta property="og:type" content="website"');
});

test("og:type renders article when given", async () => {
  const html = await renderMeta({ type: "article" });
  expect(html).toContain('<meta property="og:type" content="article"');
});
