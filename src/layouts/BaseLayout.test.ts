import { createContext, runInContext } from "node:vm";

import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";

import { site } from "@/lib/site";

import BaseLayout from "./BaseLayout.astro";

test("renders title, meta and theme bootstrap", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(BaseLayout, {
    props: { title: "T", description: "D" },
  });
  expect(html).toContain("<title>T</title>");
  expect(html).toContain('name="naver-site-verification"');
  expect(html).toContain("diesel:theme-atom");
});

test("renders the standard Analytics snippet in head for ownership verification", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(BaseLayout, {
    props: { title: "T" },
  });
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
  const scripts = [...head.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
  const loaders = scripts.filter(([, attributes]) =>
    attributes.includes("https://www.googletagmanager.com/gtag/js?id="),
  );
  expect(loaders).toHaveLength(1);
  expect(loaders[0][1]).toContain(`gtag/js?id=${site.googleAnalyticsId}`);
  expect(loaders[0][1]).toMatch(/\basync\b/);

  const initializers = scripts.filter(([, , source]) =>
    source.includes("gtag("),
  );
  expect(initializers).toHaveLength(1);
  const source = initializers[0][2];
  // Keep the measurement ID readable without executing JavaScript.
  const config = source.match(
    /gtag\(\s*["']config["']\s*,\s*["']([^"']+)["']\s*\)/,
  );
  expect(config?.[1]).toBe(site.googleAnalyticsId);

  const context = createContext({});
  context.window = context;
  runInContext(source, context);
  expect(typeof context.gtag).toBe("function");
  expect(context.dataLayer).toHaveLength(2);
  expect(context.dataLayer[0][0]).toBe("js");
  expect(Array.from(context.dataLayer[1])).toEqual([
    "config",
    site.googleAnalyticsId,
  ]);
});
