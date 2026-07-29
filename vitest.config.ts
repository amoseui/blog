import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    globalSetup: "./vitest.global-setup.ts",
    include: ["src/**/*.test.ts", "internal/verification/**/*.test.ts"],
    // Legacy gatsby-era jest tests; their dependencies were removed with the
    // gatsby toolchain and the files themselves are deleted in the final
    // cleanup task of the migration.
    exclude: ["src/utils/**"],
  },
});
