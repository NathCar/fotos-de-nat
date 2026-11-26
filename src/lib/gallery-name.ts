import type { Gallery } from "./types";

export function galleryName(
  g: Pick<Gallery, "location" | "filmStock">,
): string {
  return g.filmStock ? `${g.location} · ${g.filmStock}` : g.location;
}
