import { createContext, runInContext } from "node:vm";

import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";

import { site } from "@/lib/site";

import BaseLayout from "./BaseLayout.astro";

const analyticsPage = async (readyState = "loading") => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(BaseLayout, {
    props: { title: "T" },
  });
  const source = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
    .map(([, script]) => script)
    .find((script) => script.includes("gtag("));
  if (!source) throw new Error("Analytics initializer not found");

  const events = new EventTarget();
  const documentEvents = new EventTarget();
  const frames: (() => void)[] = [];
  const tasks: (() => void)[] = [];
  const context = createContext({
    document: {
      readyState,
      visibilityState: "visible",
      addEventListener: documentEvents.addEventListener.bind(documentEvents),
      removeEventListener:
        documentEvents.removeEventListener.bind(documentEvents),
    },
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    requestAnimationFrame: (callback: () => void) => frames.push(callback),
    setTimeout: (callback: () => void) => tasks.push(callback),
  });
  context.window = context;
  runInContext(source, context);
  const paint = () => {
    frames.splice(0).forEach((callback) => callback());
    tasks.splice(0).forEach((callback) => callback());
  };
  return { context, events, documentEvents, frames, tasks, paint };
};

test("renders title, meta and theme bootstrap", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(BaseLayout, {
    props: { title: "T", description: "D" },
  });
  expect(html).toContain("<title>T</title>");
  expect(html).toContain('name="naver-site-verification"');
  expect(html).toContain("diesel:theme-atom");
});

test("places the mobile copyright after page content and navigation", async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(BaseLayout, {
    props: { title: "T" },
    slots: { default: "<main>Page content</main><nav>Page navigation</nav>" },
  });
  const body = html.match(/<body>([\s\S]*?)<\/body>/)?.[1] ?? "";
  expect(body).toContain(site.copyright);
  expect(body.indexOf(site.copyright)).toBeGreaterThan(body.indexOf("</nav>"));
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

  const { context, events, paint } = await analyticsPage();
  expect(typeof context.gtag).toBe("function");
  expect(context.dataLayer).toHaveLength(0);
  events.dispatchEvent(new Event("load"));
  paint();
  expect(context.dataLayer).toHaveLength(2);
  expect(context.dataLayer[0][0]).toBe("js");
  expect(Array.from(context.dataLayer[1])).toEqual([
    "config",
    site.googleAnalyticsId,
  ]);
});

test("waits for a rendering opportunity before initializing Analytics", async () => {
  const { context, events, frames, tasks } = await analyticsPage();
  expect(context.dataLayer).toHaveLength(0);
  events.dispatchEvent(new Event("load"));
  expect(context.dataLayer).toHaveLength(0);
  expect(frames).toHaveLength(1);
  frames.shift()?.();
  expect(context.dataLayer).toHaveLength(0);
  expect(tasks).toHaveLength(1);
  tasks.shift()?.();
  expect(context.dataLayer).toHaveLength(2);
});

test("queues a single pageview when the visitor leaves before rendering", async () => {
  const { context, events, paint } = await analyticsPage();
  events.dispatchEvent(new Event("pagehide"));
  expect(context.dataLayer).toHaveLength(2);
  events.dispatchEvent(new Event("load"));
  paint();
  expect(context.dataLayer).toHaveLength(2);
});

test("initializes when a tab is hidden even if animation frames are paused", async () => {
  const { context, events, documentEvents, paint } = await analyticsPage();
  context.document.visibilityState = "hidden";
  documentEvents.dispatchEvent(new Event("visibilitychange"));
  expect(context.dataLayer).toHaveLength(2);
  events.dispatchEvent(new Event("load"));
  paint();
  events.dispatchEvent(new Event("pagehide"));
  expect(context.dataLayer).toHaveLength(2);
});

test("schedules Analytics when the document has already loaded", async () => {
  const { context, frames, paint } = await analyticsPage("complete");
  expect(context.dataLayer).toHaveLength(0);
  expect(frames).toHaveLength(1);
  paint();
  expect(context.dataLayer).toHaveLength(2);
});
