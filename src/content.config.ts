import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const shared = {
  title: z.string(),
  draft: z.boolean().default(false),
  slug: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
};

// Posts must carry a date: listing order and the rss pubDate break silently
// without one. Pages (e.g. about) have no date. Exported as a factory so
// tests can validate the contract with a stub image schema.
export const blogSchema = (image: () => z.ZodTypeAny) =>
  z.discriminatedUnion("template", [
    z
      .object({
        ...shared,
        template: z.literal("post"),
        date: z.coerce.date(),
        socialImage: image().optional(),
      })
      .passthrough(),
    z
      .object({
        ...shared,
        template: z.literal("page"),
        date: z.coerce.date().optional(),
        socialImage: image().optional(),
      })
      .passthrough(),
  ]);

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content" }),
  schema: ({ image }) => blogSchema(image),
});

export const collections = { blog };
