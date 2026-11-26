// @ts-check
import { defineConfig, envField } from "astro/config";
import { SITE } from "./src/site.config";

export default defineConfig({
  site: SITE.url,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  env: {
    schema: {
      CLOUDINARY_CLOUD_NAME: envField.string({
        context: "server",
        access: "secret",
      }),
      CLOUDINARY_API_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
      CLOUDINARY_API_SECRET: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },
});
