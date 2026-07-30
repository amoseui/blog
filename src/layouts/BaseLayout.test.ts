import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";

import BaseLayout from "./BaseLayout.astro";

test("renders title, meta and theme bootstrap", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(BaseLayout, {
    props: { title: "T", description: "D" },
  });
  expect(html).toContain("<title>T</title>");
  expect(html).toContain('name="naver-site-verification"');
  expect(html).toContain("diesel:theme-atom");
});
