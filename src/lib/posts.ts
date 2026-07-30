import { getCollection } from "astro:content";

type Entry = Awaited<ReturnType<typeof getCollection<"blog">>>[number];

export const allPosts = async (): Promise<Entry[]> => {
  const posts = await getCollection(
    "blog",
    ({ data }) => data.template === "post" && !data.draft,
  );
  return posts.sort(
    (a, b) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0),
  );
};

export const paginate = <T>(items: T[], limit: number): T[][] => {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += limit) {
    pages.push(items.slice(i, i + limit));
  }
  return pages;
};

const groupBy = (
  posts: Entry[],
  keys: (post: Entry) => string[],
): Map<string, Entry[]> => {
  const groups = new Map<string, Entry[]>();
  for (const post of posts) {
    for (const key of keys(post)) {
      const group = groups.get(key);
      if (group) group.push(post);
      else groups.set(key, [post]);
    }
  }
  return new Map([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)));
};

export const byCategory = async (): Promise<Map<string, Entry[]>> =>
  groupBy(await allPosts(), (post) =>
    post.data.category ? [post.data.category] : [],
  );

export const byTag = async (): Promise<Map<string, Entry[]>> =>
  groupBy(await allPosts(), (post) => post.data.tags ?? []);
