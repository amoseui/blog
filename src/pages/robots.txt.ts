import { site } from "@/lib/site";

// Same output the gatsby robots-txt plugin produced. The CNAME file is gone:
// github pages deployed via actions takes the custom domain from the repo
// settings, not from a file in the artifact.
export function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${site.url}/sitemap-index.xml`,
    `Host: ${site.url}`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
