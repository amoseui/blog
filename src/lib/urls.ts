import { toKebabCase } from "./to-kebab-case";

interface UrlEntry {
  id: string;
  data: { slug?: string };
}

export const entryUrl = (entry: UrlEntry): string => {
  if (entry.data.slug) return entry.data.slug;
  const path = entry.id.replace(/\.md$/, "").replace(/\/index$/, "");
  return `/${path}`;
};

export const categoryUrl = (category: string): string =>
  `/category/${toKebabCase(category)}`;

export const tagUrl = (tag: string): string => `/tag/${toKebabCase(tag)}`;

export const paginationUrl = (base: string, page: number): string =>
  page === 0 ? base : [base === "/" ? "" : base, "page", page].join("/");
