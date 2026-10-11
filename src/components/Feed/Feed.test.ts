import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getCollection } from "astro:content";
import { expect, test } from "vitest";

import Feed from "./Feed.astro";

const renderFeed = async () => {
  const entries = await getCollection("blog");
  const entry = entries.find(({ data }) => data.slug === "/2015-retrospective");
  if (!entry) throw new Error("fixture post not found");
  const container = await AstroContainer.create();
  return container.renderToString(Feed, { props: { entries: [entry] } });
};

test("shows the date and tags above the title and summary", async () => {
  const html = await renderFeed();
  expect(html).toContain("<article");
  expect(html).toContain("2015년과 2016년");
  expect(html).toContain("2015년, 여러모로 아쉬운 한 해였다.");
  expect(html.indexOf("<time")).toBeLessThan(html.indexOf("<h2"));
  expect(html.indexOf("<h2")).toBeLessThan(html.indexOf("<p"));
  expect(html.indexOf('href="/tag/retrospective/"')).toBeLessThan(
    html.indexOf("<h2"),
  );
  expect([...html.matchAll(/href="\/2015-retrospective\/"/g)]).toHaveLength(1);
  expect(html).toContain('href="/tag/retrospective/"');
});

test("uses a machine-readable date and displays YYYY.MM.DD in KST", async () => {
  const html = await renderFeed();
  const time = html.match(
    /<time\b[^>]*datetime="([^"]+)"[^>]*>\s*([^<]+?)\s*<\/time>/,
  );
  expect(time?.[1]).toBe("2016-01-01T18:20:22.000Z");
  expect(time?.[2]).toBe("2016.01.02");
});
