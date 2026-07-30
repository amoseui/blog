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

// Canonical link form for github pages: the directory output is served with
// a trailing slash (the bare form 301-redirects), so every internal href must
// use the slash form or crawlers walk through redirects on each link.
export const href = (url: string): string =>
  url.endsWith("/") ? url : `${url}/`;
