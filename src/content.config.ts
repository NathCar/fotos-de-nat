import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * "galleries" collection — one folder per gallery in src/content/galleries/,
 * each containing an index.md and that gallery's photo files.
 * Add a gallery by adding a folder; see README for the field reference.
 */
const galleries = defineCollection({
  loader: glob({ pattern: "**/index.md", base: "./src/content/galleries" }),
  // `image()` validates that each src points at a real image file (relative to
  // index.md) and gives Astro its dimensions for build-time optimization.
  schema: ({ image }) =>
    z.object({
      order: z.number().int().positive(),
      location: z.string(),
      filmStock: z.string().optional(),
      intro: z.string().optional(),
      photos: z
        .array(
          z.object({
            src: image(),
            caption: z.string().optional(),
            alt: z.string().optional(),
            date: z.string().optional(),
            camera: z.string().optional(),
          }),
        )
        .min(1),
    }),
});

export const collections = { galleries };
