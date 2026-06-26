import type { Gallery } from "./types";

/**
 * URL for a gallery. The first gallery (index 0) lives at the site root to
 * avoid duplicate content; the rest get their own /galleries/<slug> route.
 */
export function galleryUrl(gallery: Gallery, index: number): string {
  return index === 0 ? "/" : `/galleries/${gallery.slug}`;
}
