import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";
import autoprefixer from "autoprefixer";
import lost from "lost";
import rehypeSlug from "rehype-slug";
import rehypeExternalLinks from "rehype-external-links";

import rehypeAutolinkGatsby from "./src/lib/rehype-autolink-gatsby.mjs";
import rehypeInlineCode from "./src/lib/rehype-inline-code.mjs";

export default defineConfig({
  site: "https://blog.amoseui.com",
  // GitHub Pages serves the directory output at the trailing-slash url and
  // 301-redirects the bare form, so both must resolve in dev/preview too.
  trailingSlash: "ignore",
  // The gatsby baseline emits directory-style output (foo/index.html, verified
  // by the extracted url fixtures), so match it exactly for the parity gate.
  build: { format: "directory" },
  // Sitemap urls use the canonical trailing-slash form github pages serves
  // with 200 (the gatsby sitemap pointed at the 301-redirecting bare form,
  // which search console reported as "page with redirect").
  integrations: [sitemap()],
  markdown: {
    syntaxHighlight: "prism",
    // The top-level markdown.rehypePlugins option is deprecated since Astro 7
    // (Sätteri is the default pipeline); these plugins need the unified()
    // processor from @astrojs/markdown-remark.
    processor: unified({
      rehypePlugins: [
        rehypeSlug,
        rehypeAutolinkGatsby,
        rehypeInlineCode,
        [
          rehypeExternalLinks,
          { target: "_blank", rel: ["nofollow", "noopener", "noreferrer"] },
        ],
      ],
    }),
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
