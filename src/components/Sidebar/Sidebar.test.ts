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

test("rss link resolves to the site feed from nested pages", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Sidebar);
  const rssHref = html.match(/href="([^"]*rss\.xml)"/)?.[1];
  expect(rssHref).toBeDefined();
  for (const pathname of ["/tag/testing/", "/category/chromium/"]) {
    const resolved = new URL(
      rssHref ?? "",
      `https://blog.amoseui.com${pathname}`,
    );
    expect(resolved.href).toBe("https://blog.amoseui.com/rss.xml");
  }
});
