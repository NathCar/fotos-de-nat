import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { TEMPLATE_NAMES } from "./templates/names";

const photoRef = z.union([
  z.string(),
  z.object({
    id: z.string(),
    caption: z.string().optional(),
    alt: z.string().optional(),
  }),
]);

const galleries = defineCollection({
  loader: glob({ pattern: "*.{yaml,yml}", base: "./src/content/galleries" }),
  schema: z.object({
    number: z.number().int().positive(),
    title: z.string(),
    filmStock: z.string().optional(),
    intro: z.string().optional(),
    template: z.enum(TEMPLATE_NAMES).default("carousel"),
    folder: z.string().optional(),
    cover: z.string().optional(),
    photos: z.array(photoRef).min(1).optional(),
  }),
});

export const collections = { galleries };
