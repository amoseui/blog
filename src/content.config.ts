import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Naive frontmatter datetimes ("2016-01-01 18:20:22") must be read as utc:
// gatsby (js-yaml) did so, the published rss pubDates depend on it, and local
// parsing would make kst and utc build machines emit different output.
const utcDate = z.preprocess((value) => {
  if (typeof value === "string") {
    const m = value.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2})?)$/);
    if (m) return new Date(`${m[1]}T${m[2]}Z`);
  }
  return value;
}, z.coerce.date());

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
        date: utcDate,
        socialImage: image().optional(),
      })
      .passthrough(),
    z
      .object({
        ...shared,
        template: z.literal("page"),
        date: utcDate.optional(),
        socialImage: image().optional(),
      })
      .passthrough(),
  ]);

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content" }),
  schema: ({ image }) => blogSchema(image),
});

export const collections = { blog };
