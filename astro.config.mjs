import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import autoprefixer from "autoprefixer";
import lost from "lost";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";

export default defineConfig({
  site: "https://blog.amoseui.com",
  trailingSlash: "never",
  build: { format: "file" },
  integrations: [sitemap()],
  markdown: {
    syntaxHighlight: "prism",
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [
        rehypeExternalLinks,
        { target: "_blank", rel: ["nofollow", "noopener", "noreferrer"] },
      ],
    ],
  },
  vite: {
    css: {
      postcss: {
        plugins: [lost(), autoprefixer()],
      },
      preprocessorOptions: {
        scss: {
          // Some legacy scss modules import "src/assets/..." relative to the
          // repo root (resolved via includePaths in the gatsby setup).
          loadPaths: ["."],
        },
      },
    },
  },
});
