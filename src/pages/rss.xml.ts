import rss from "@astrojs/rss";
import { render } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { allPosts } from "@/lib/posts";
import { entryUrl, href } from "@/lib/urls";
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
    // Keep the published identifier stable even though the link now uses
    // the canonical trailing slash. Feed readers use it to recognize items.
    const guid = new URL(entryUrl(post), context.site).href.replace(/\/+$/, "");
    items.push({
      title: post.data.title,
      pubDate: post.data.date,
      description: sanitizeXml(post.data.description ?? ""),
      link: href(entryUrl(post)),
      customData: `<guid isPermaLink="false">${guid.replaceAll("&", "&amp;")}</guid>`,
      content: sanitizeXml(html),
    });
  }
  return rss({
    title: site.title,
    description: site.subtitle,
    site: context.site,
    trailingSlash: true,
    items,
  });
}
