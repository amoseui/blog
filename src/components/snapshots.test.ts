import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getCollection } from "astro:content";
import { expect, test } from "vitest";

import Feed from "@/components/Feed/Feed.astro";
import Meta from "@/components/Meta/Meta.astro";
import Page from "@/components/Page/Page.astro";
import Pagination from "@/components/Pagination/Pagination.astro";
import Post from "@/components/Post/Post.astro";
import Sidebar from "@/components/Sidebar/Sidebar.astro";
import ThemeSwitcher from "@/components/ThemeSwitcher/ThemeSwitcher.astro";
import BaseLayout from "@/layouts/BaseLayout.astro";

// Deterministic fixture: the oldest post of the collection, which never
// changes as new posts are added.
const fixturePost = async () => {
  const entries = await getCollection("blog");
  const entry = entries.find((e) => e.data.slug === "/2015-retrospective");
  if (!entry) throw new Error("fixture post not found");
  return entry;
};

test("BaseLayout snapshot", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(BaseLayout, {
    props: { title: "Snapshot Title", description: "Snapshot description" },
    slots: { default: "<main>content</main>" },
  });
  expect(html).toMatchSnapshot();
});

test("Sidebar snapshot", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Sidebar, {
    props: { isIndex: true },
  });
  expect(html).toMatchSnapshot();
});

test("ThemeSwitcher snapshot", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ThemeSwitcher);
  expect(html).toMatchSnapshot();
});

test("Feed snapshot", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Feed, {
    props: { entries: [await fixturePost()] },
  });
  expect(html).toMatchSnapshot();
});

test("Pagination snapshot", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Pagination, {
    props: {
      prevPagePath: "/",
      nextPagePath: "/page/1",
      hasPrevPage: false,
      hasNextPage: true,
    },
  });
  expect(html).toMatchSnapshot();
});

test("Post snapshot", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Post, {
    props: { entry: await fixturePost() },
    slots: { default: "<p>post body</p>" },
  });
  expect(html).toMatchSnapshot();
});

test("Page snapshot", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Page, {
    props: { title: "About me" },
    slots: { default: "<p>page body</p>" },
  });
  expect(html).toMatchSnapshot();
});

test("Meta snapshot", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Meta, {
    props: {
      title: "Snapshot Title",
      description: "Snapshot description",
      image: "/media/image.png",
    },
  });
  expect(html).toMatchSnapshot();
});
