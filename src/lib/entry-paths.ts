import { getCollection } from "astro:content";

import { entryUrl } from "./urls";

export const entryPaths = async () => {
  const entries = await getCollection("blog", ({ data }) => !data.draft);
  const paths = entries.map((entry) => ({
    params: { slug: entryUrl(entry).replace(/^\//, "") },
    props: { entry },
  }));
  const seen = new Set<string>();
  for (const path of paths) {
    if (seen.has(path.params.slug)) {
      throw new Error(`duplicate url: ${path.params.slug}`);
    }
    seen.add(path.params.slug);
  }
  return paths;
};
