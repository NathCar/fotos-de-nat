// @ts-check
import { defineConfig } from "astro/config";
import { SITE } from "./src/site.config";

// Static output. Vercel auto-detects Astro — no adapter needed for a static build.
export default defineConfig({
  site: SITE.url,
  image: {
    // Placeholder photos are served from picsum.photos. When real images move
    // into the repo (or arrive via the Drive content source), switch Photo.astro
    // to astro:assets <Image> for build-time AVIF/WebP optimization.
    domains: ["picsum.photos"],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
});
