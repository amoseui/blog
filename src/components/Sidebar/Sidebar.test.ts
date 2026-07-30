import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";

import Sidebar from "./Sidebar.astro";

test("renders author and menu", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Sidebar);
  expect(html).toContain("amoseui");
  expect(html).toContain('href="/categories/"');
  expect(html).toContain('href="/tags/"');
});
