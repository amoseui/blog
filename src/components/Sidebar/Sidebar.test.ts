import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";

import Sidebar from "./Sidebar.astro";

const renderSidebar = async (pathname = "/") => {
  const container = await AstroContainer.create();
  return container.renderToString(Sidebar, {
    request: new Request(`https://blog.amoseui.com${pathname}`),
  });
};

const currentLinks = (html: string) =>
  [...html.matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)].map(
    ([link]) => link.match(/href="([^"]+)"/)?.[1],
  );

const topicLinks = (html: string) =>
  [
    ...(html.match(/<nav\b[\s\S]*?<\/nav>/)?.[0] ?? "").matchAll(
      /href="([^"]+)"/g,
    ),
  ].map(([, href]) => href);

test("renders author and tag navigation", async () => {
  const html = await renderSidebar();
  expect(html).toContain("amoseui");
  expect(html).toContain('href="/tag/chromium/"');
  expect(html).toContain('href="/tag/opensource/"');
  expect(html).toContain(">opensource</a>");
  expect(html).not.toContain(">Open Source</a>");
  expect(html).not.toContain('href="/categories/"');
  expect(html).not.toContain('href="/tags/"');
  expect(currentLinks(html)).toEqual(["/"]);
  expect(html).not.toContain("<details");
  expect(html).not.toMatch(/href="\/tag\/\d{4}\//);
  expect(topicLinks(html).slice(0, 10)).toEqual([
    "/",
    "/tag/chromium/",
    "/tag/opensource/",
    "/tag/contribution/",
    "/tag/retrospective/",
    "/tag/conference/",
    "/tag/css/",
    "/tag/w3c/",
    "/tag/wpt/",
    "/tag/android/",
  ]);
  expect(topicLinks(html).slice(-11)).toEqual([
    "/tag/aosp/",
    "/tag/codecoverage/",
    "/tag/cpp/",
    "/tag/cuttlefish/",
    "/tag/deview/",
    "/tag/droidknights/",
    "/tag/hacktoberfest/",
    "/tag/pycon/",
    "/tag/python/",
    "/tag/testing/",
    "/tag/webauthn/",
  ]);
});

test("keeps the current tag selected on paginated lists", async () => {
  const html = await renderSidebar("/tag/chromium/page/1/");
  expect(currentLinks(html)).toEqual(["/tag/chromium/"]);
});

test("keeps All selected on paginated full lists", async () => {
  const html = await renderSidebar("/page/1/");
  expect(currentLinks(html)).toEqual(["/"]);
});

test("shows every tag without expanding a menu", async () => {
  const html = await renderSidebar("/tag/wpt/");
  expect(topicLinks(html)).toHaveLength(23);
  expect(html).not.toContain("<details");
  expect(currentLinks(html)).toEqual(["/tag/wpt/"]);
});

test("renders social profiles in the requested order without email", async () => {
  const html = await renderSidebar();
  const icons = [...html.matchAll(/<title>([^<]+)<\/title>/g)].map(
    ([, name]) => name,
  );
  expect(icons.filter((name) => name !== "light")).toEqual([
    "rss",
    "github",
    "linkedin",
    "instagram",
    "X",
    "medium",
    "soundcloud",
    "youtube",
  ]);
  expect(html).toContain('href="https://www.instagram.com/amoseui"');
  expect(html).toContain('href="https://x.com/amoseui"');
  expect(html).not.toContain("data-contact-email");
  expect(html.indexOf('href="https://www.youtube.com/@amoseui"')).toBeLessThan(
    html.indexOf("<nav"),
  );
});

test("rss link resolves to the site feed from nested pages", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Sidebar);
  const rssHref = html.match(/href="([^"]*rss\.xml)"/)?.[1];
  expect(rssHref).toBeDefined();
  for (const pathname of ["/tag/testing/", "/tag/contribution/page/1/"]) {
    const resolved = new URL(
      rssHref ?? "",
      `https://blog.amoseui.com${pathname}`,
    );
    expect(resolved.href).toBe("https://blog.amoseui.com/rss.xml");
  }
});
