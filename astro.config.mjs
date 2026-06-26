// @ts-check
import { defineConfig } from "astro/config";
import { SITE } from "./src/site.config";

// Static output. Vercel auto-detects Astro — no adapter needed for a static build.
export default defineConfig({
  site: SITE.url,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
});
