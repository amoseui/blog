import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Naive frontmatter datetimes are authored in kst ("2026-01-20 21:00" means
// 21:00 in Seoul). Pinning the offset keeps output identical on any build
// machine, and the represented instants stay byte-compatible with the
// published rss pubDates (the old utc-form values were migrated by +9h).
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

const kstDate = z.preprocess((value) => {
  // The yaml parser pre-converts second-precision timestamps to utc dates
  // (digits read as utc); minute-precision values arrive as strings. Both
  // carry the same meaning — naive kst digits — so reinterpret accordingly.
  if (value instanceof Date) {
    return new Date(value.getTime() - KST_OFFSET_MS);
  }
  if (typeof value === "string") {
    const m = value.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2})?)$/);
    if (m) return new Date(`${m[1]}T${m[2]}+09:00`);
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
        date: kstDate,
        socialImage: image().optional(),
      })
      .passthrough(),
    z
      .object({
        ...shared,
        template: z.literal("page"),
        date: kstDate.optional(),
        socialImage: image().optional(),
      })
      .passthrough(),
  ]);

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content" }),
  schema: ({ image }) => blogSchema(image),
});

export const collections = { blog };
