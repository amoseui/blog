// Plain tsc uses the server factory type; astro check validates component sources.
declare module "*.astro" {
  import type { AstroComponentFactory } from "astro/runtime/server/index.js";

  const Component: AstroComponentFactory;
  export default Component;
}
