import { expect, test } from "vitest";

import { toKebabCase } from "./to-kebab-case";

test("lowercases and hyphenates", () => {
  expect(toKebabCase("Android")).toBe("android");
});

test("keeps already-kebab values unchanged", () => {
  expect(toKebabCase("chromium")).toBe("chromium");
  expect(toKebabCase("aosp")).toBe("aosp");
});

test("replaces spaces with hyphens and strips punctuation", () => {
  expect(toKebabCase("Code Coverage Best Practices")).toBe(
    "code-coverage-best-practices",
  );
});

test("replaces underscores with hyphens", () => {
  expect(toKebabCase("some_tag_name")).toBe("some-tag-name");
});

test("handles numeric-like tags", () => {
  expect(toKebabCase("2015")).toBe("2015");
});

test("strips non-ascii characters like the original gatsby util", () => {
  // Parity lock: the legacy implementation removes non-\w characters,
  // so Korean text is dropped. No real tag/category relies on this.
  expect(toKebabCase("2015년 회고")).toBe("2015-");
});

test("defaults to empty string", () => {
  expect(toKebabCase()).toBe("");
});
