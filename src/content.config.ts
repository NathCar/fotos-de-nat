import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * "galleries" collection — one Markdown file per gallery in src/content/galleries/.
 * Add a gallery by adding a file; see README for the field reference.
 */
const galleries = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/galleries" }),
  schema: z.object({
    order: z.number().int().positive(),
    location: z.string(),
    filmStock: z.string(),
    intro: z.string().optional(),
    photos: z
      .array(
        z.object({
          // Placeholder mode: a picsum seed + intrinsic size.
          // Real mode (later): replace `seed` with a local image path.
          seed: z.string(),
          width: z.number().int().positive(),
          height: z.number().int().positive(),
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
