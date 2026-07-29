import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content" }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        date: z.coerce.date().optional(),
        template: z.enum(["post", "page"]),
        draft: z.boolean().default(false),
        slug: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        description: z.string().optional(),
        socialImage: image().optional(),
      })
      .passthrough(),
});

export const collections = { blog };
