import type { Gallery } from "./types";

export function galleryName(g: Pick<Gallery, "title" | "filmStock">): string {
  return g.filmStock ? `${g.title} · ${g.filmStock}` : g.title;
}
