import type { Gallery } from "./types";

/** The first gallery lives at the site root to avoid duplicate content. */
export function galleryUrl(gallery: Gallery, index: number): string {
  return index === 0 ? "/" : `/galleries/${gallery.slug}`;
}
