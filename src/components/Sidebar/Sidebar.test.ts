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

test("places archive pagination between Topics and copyright", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Sidebar, {
    request: new Request("https://blog.amoseui.com/tag/chromium/page/1/"),
    props: {
      pagination: { basePath: "/tag/chromium", currentPage: 1, totalPages: 3 },
    },
  });
  const start = html.indexOf('aria-label="글 목록 페이지"');
  expect(start).toBeGreaterThan(html.indexOf('aria-label="Topics"'));
  expect(start).toBeLessThan(html.indexOf("All rights reserved."));
  const navigation = html.match(
    /<nav\b[^>]*aria-label="글 목록 페이지"[\s\S]*?<\/nav>/,
  )?.[0];
  expect(navigation).toBeDefined();
  expect(navigation).toContain('href="/tag/chromium/"');
  expect(navigation).toContain('href="/tag/chromium/page/2/"');
  expect(navigation).toMatch(/aria-current="page"[^>]*>\s*2\s*</);
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

test("renders contact links in the requested order", async () => {
  const html = await renderSidebar();
  const icons = [...html.matchAll(/<title>([^<]+)<\/title>/g)].map(
    ([, name]) => name,
  );
  expect(icons.filter((name) => name !== "light")).toEqual([
    "rss",
    "email",
    "github",
    "linkedin",
    "Speaker Deck",
    "medium",
    "X",
    "instagram",
    "youtube",
    "soundcloud",
  ]);
  expect(html).toContain('href="https://www.instagram.com/amoseui"');
  expect(html).toContain('href="https://x.com/amoseui"');
  expect(html).toContain('href="https://speakerdeck.com/amoseui"');
  const emailLink = html.match(
    /<a\b[^>]*href="mailto:amoseui@gmail\.com"[^>]*>/,
  )?.[0];
  expect(emailLink).toBeDefined();
  expect(emailLink).not.toContain("target=");
  expect(html).not.toContain("data-contact-email");
  expect(html.indexOf('href="https://www.youtube.com/@amoseui"')).toBeLessThan(
    html.indexOf("<nav"),
  );
});

test("preserves Speaker Deck attribution in the rendered SVG", async () => {
  const html = await renderSidebar();
  const speakerDeckSvg = [...html.matchAll(/<svg\b[^>]*>[\s\S]*?<\/svg>/g)]
    .map(([svg]) => svg)
    .find((svg) => svg.includes("<title>Speaker Deck</title>"));
  expect(speakerDeckSvg).toContain("Font Awesome Free 6.7.2 by @fontawesome");
  expect(speakerDeckSvg).toContain("Copyright 2024 Fonticons, Inc.");
  expect(speakerDeckSvg).toContain(
    "https://creativecommons.org/licenses/by/4.0/",
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
