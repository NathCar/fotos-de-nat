import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const galleries = defineCollection({
  loader: glob({ pattern: "**/index.md", base: "./src/content/galleries" }),
  schema: ({ image }) =>
    z
      .object({
        order: z.number().int().positive(),
        location: z.string(),
        filmStock: z.string().optional(),
        intro: z.string().optional(),
        cover: z.number().int().positive().optional(),
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
      })
      .refine((d) => d.cover === undefined || d.cover <= d.photos.length, {
        message: "cover must be a 1-based index within photos",
        path: ["cover"],
      }),
});

export const collections = { galleries };
