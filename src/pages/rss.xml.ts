import rss from "@astrojs/rss";
import { render } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { allPosts } from "@/lib/posts";
import { entryUrl } from "@/lib/urls";
import { site } from "@/lib/site";

// Strip invalid XML control characters (ported from gatsby-config feed serialize)
const sanitizeXml = (text: string): string =>
  // eslint-disable-next-line no-control-regex
  text ? text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "") : "";

export async function GET(context: { site: URL }) {
  const container = await AstroContainer.create();
  const posts = await allPosts();
  const items = [];
  for (const post of posts) {
    const { Content } = await render(post);
    const html = await container.renderToString(Content);
    items.push({
      title: post.data.title,
      pubDate: post.data.date,
      description: sanitizeXml(post.data.description ?? ""),
      link: entryUrl(post),
      content: sanitizeXml(html),
    });
  }
  return rss({
    title: site.title,
    description: site.subtitle,
    site: context.site,
    // Baseline gatsby feed links have no trailing slash; guid defaults to the
    // link-based absolute URL, matching the baseline fixture.
    trailingSlash: false,
    items,
  });
}
