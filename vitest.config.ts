import { getViteConfig } from "astro/config";
import { defineConfig } from "vitest/config";

export default getViteConfig(
  defineConfig({
    test: {
      globalSetup: "./vitest.global-setup.ts",
      include: ["src/**/*.test.ts", "internal/verification/**/*.test.ts"],
    },
  }),
);
