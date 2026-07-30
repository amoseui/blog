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

test("parses naive frontmatter datetimes as utc like gatsby", () => {
  const result = schema.safeParse({
    title: "T",
    template: "post",
    date: "2016-01-01 18:20:22",
  });
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.date.toISOString()).toBe("2016-01-01T18:20:22.000Z");
  }
});

test("parses minute-precision naive datetimes as utc", () => {
  const result = schema.safeParse({
    title: "T",
    template: "post",
    date: "2026-01-20 12:00",
  });
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.date.toISOString()).toBe("2026-01-20T12:00:00.000Z");
  }
});
