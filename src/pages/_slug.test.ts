import { getCollection } from "astro:content";
import { expect, test } from "vitest";

import { entryPaths } from "@/lib/entry-paths";

test("emits one url per non-draft entry", async () => {
  const paths = await entryPaths();
  const entries = await getCollection("blog", ({ data }) => !data.draft);
  expect(paths).toHaveLength(entries.length);
  const slugs = paths.map((p) => p.params.slug);
  expect(slugs).toContain("2015-retrospective");
  expect(slugs).toContain("pages/about");
});
