import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";

import Pagination from "./Pagination.astro";

const renderPagination = async (
  currentPage: number,
  totalPages: number,
  basePath = "/",
) => {
  const container = await AstroContainer.create();
  return container.renderToString(Pagination, {
    props: { currentPage, totalPages, basePath },
  });
};

test.each([
  {
    name: "first home page",
    basePath: "/",
    currentPage: 0,
    totalPages: 5,
    hrefs: ["/page/1/", "/page/2/", "/page/3/", "/page/4/", "/page/1/"],
    previous: undefined,
    next: "/page/1/",
  },
  {
    name: "middle home page",
    basePath: "/",
    currentPage: 2,
    totalPages: 5,
    hrefs: ["/page/1/", "/", "/page/1/", "/page/3/", "/page/4/", "/page/3/"],
    previous: "/page/1/",
    next: "/page/3/",
  },
  {
    name: "last home page",
    basePath: "/",
    currentPage: 4,
    totalPages: 5,
    hrefs: ["/page/3/", "/", "/page/1/", "/page/2/", "/page/3/"],
    previous: "/page/3/",
    next: undefined,
  },
  {
    name: "first tag page",
    basePath: "/tag/chromium",
    currentPage: 0,
    totalPages: 3,
    hrefs: [
      "/tag/chromium/page/1/",
      "/tag/chromium/page/2/",
      "/tag/chromium/page/1/",
    ],
    previous: undefined,
    next: "/tag/chromium/page/1/",
  },
  {
    name: "middle tag page",
    basePath: "/tag/chromium",
    currentPage: 1,
    totalPages: 3,
    hrefs: [
      "/tag/chromium/",
      "/tag/chromium/",
      "/tag/chromium/page/2/",
      "/tag/chromium/page/2/",
    ],
    previous: "/tag/chromium/",
    next: "/tag/chromium/page/2/",
  },
  {
    name: "last tag page",
    basePath: "/tag/chromium",
    currentPage: 2,
    totalPages: 3,
    hrefs: ["/tag/chromium/page/1/", "/tag/chromium/", "/tag/chromium/page/1/"],
    previous: "/tag/chromium/page/1/",
    next: undefined,
  },
])("renders numbered navigation for the $name", async (page) => {
  const html = await renderPagination(
    page.currentPage,
    page.totalPages,
    page.basePath,
  );
  const links = [...html.matchAll(/<a\b[^>]*>/g)].map(([link]) => ({
    href: link.match(/href="([^"]+)"/)?.[1],
    label: link.match(/aria-label="([^"]+)"/)?.[1],
    rel: link.match(/rel="([^"]+)"/)?.[1],
  }));
  expect(html).toMatch(/<nav\b[^>]*aria-label="글 목록 페이지"/);
  expect(links.map(({ href }) => href)).toEqual(page.hrefs);
  expect(links.find(({ rel }) => rel === "prev")?.href).toBe(page.previous);
  expect(links.find(({ rel }) => rel === "next")?.href).toBe(page.next);
  if (page.previous) {
    expect(links.find(({ rel }) => rel === "prev")?.label).toBe("이전 페이지");
  }
  if (page.next) {
    expect(links.find(({ rel }) => rel === "next")?.label).toBe("다음 페이지");
  }
  const current = [
    ...html.matchAll(
      /<span\b[^>]*aria-current="page"[^>]*>\s*(\d+)\s*<\/span>/g,
    ),
  ];
  expect(current.map(([, number]) => Number(number))).toEqual([
    page.currentPage + 1,
  ]);
  expect([...html.matchAll(/<li(?:\s|>)/g)]).toHaveLength(page.totalPages + 2);
  const disabled = [...html.matchAll(/<button\b[^>]*>/g)].map(([button]) => {
    expect(button).toContain("disabled");
    return button.match(/aria-label="([^"]+)"/)?.[1];
  });
  expect(disabled).toEqual([
    ...(page.previous ? [] : ["이전 페이지"]),
    ...(page.next ? [] : ["다음 페이지"]),
  ]);
});

test.each([
  { current: 0, ellipses: 1, href: "/page/4/" },
  { current: 9, ellipses: 2, href: "/page/10/" },
  { current: 19, ellipses: 1, href: "/page/15/" },
])(
  "renders stable navigation for page $current of a long archive",
  async ({ current, ellipses, href }) => {
    const html = await renderPagination(current, 20);
    expect([...html.matchAll(/<li(?:\s|>)/g)]).toHaveLength(9);
    expect([...html.matchAll(/>\s*…\s*</g)]).toHaveLength(ellipses);
    expect(html).toContain(`href="${href}"`);
    if (current !== 0) expect(html).toContain('href="/"');
    if (current !== 19) expect(html).toContain('href="/page/19/"');
    expect(html).not.toMatch(/href="[^"]*ellipsis/);
  },
);

test.each([0, 1])(
  "omits navigation when there are %i pages",
  async (totalPages) => {
    const html = await renderPagination(0, totalPages);
    expect(html).not.toContain("<nav");
    expect(html).not.toContain("<a");
  },
);
