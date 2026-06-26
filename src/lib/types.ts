/** Domain types shared across the app, independent of where content comes from. */
import type { ImageMetadata } from "astro";

export interface Photo {
  /** Processed local image (Astro reads its dimensions for optimization). */
  src: ImageMetadata;
  /** Alt text for screen readers; falls back to the gallery name when omitted. */
  alt: string;
  /** Optional human caption shown in the UI. */
  caption?: string;
  /** Optional EXIF-derived metadata (auto-filled once real images land). */
  date?: string;
  camera?: string;
}

export interface Gallery {
  /** URL-safe identifier, e.g. "lofoten-norway". */
  slug: string;
  /** Display order in the pager (ascending). */
  order: number;
  /** Where the photos were taken, e.g. "Lofoten, Norway". */
  location: string;
  /** Film stock used, e.g. "Ektar 100". Optional — omit for non-film galleries. */
  filmStock?: string;
  /** Optional short intro for the gallery (SEO + future use). */
  intro?: string;
  photos: Photo[];
}

/** Combined header label used in captions and the document title. */
export function galleryName(g: Pick<Gallery, "location" | "filmStock">): string {
  return g.filmStock ? `${g.location} · ${g.filmStock}` : g.location;
}
