import { z } from "astro:content";
import { describe, expect, test } from "vitest";

import { blogSchema } from "./content.config";

const schema = blogSchema(() => z.string());

describe("blog frontmatter contract", () => {
  test("rejects a post without a date", () => {
    const result = schema.safeParse({ title: "T", template: "post" });
    expect(result.success).toBe(false);
  });

  test("accepts a post with a date", () => {
    const result = schema.safeParse({
      title: "T",
      template: "post",
      date: "2026-07-30 12:00:00",
    });
    expect(result.success).toBe(true);
  });

  test("accepts a page without a date", () => {
    const result = schema.safeParse({ title: "About me", template: "page" });
    expect(result.success).toBe(true);
  });

  test("rejects an unknown template", () => {
    const result = schema.safeParse({ title: "T", template: "draft" });
    expect(result.success).toBe(false);
  });
});
