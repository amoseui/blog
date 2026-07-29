import { expect, test } from "vitest";

import { getStaticPaths } from "./[...slug].astro";

test("emits every post and page url", async () => {
  const paths = await getStaticPaths();
  expect(paths).toHaveLength(25);
  const slugs = paths.map((p) => p.params.slug);
  expect(slugs).toContain("2015-retrospective");
  expect(slugs).toContain("pages/about");
});
