import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    globalSetup: "./vitest.global-setup.ts",
    include: ["src/**/*.test.ts", "internal/verification/**/*.test.ts"],
  },
});
