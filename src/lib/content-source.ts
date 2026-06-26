import { getCollection } from "astro:content";
import type { Gallery, Photo } from "./types";
import { galleryName } from "./types";

/**
 * The content seam.
 *
 * Pages and components depend only on this interface — never on where the
 * content physically lives. Phase 1 reads Markdown files from the repo. Phase 2
 * will add a Google Drive implementation of the SAME interface, so swapping the
 * source requires no changes to any component or route.
 */
export interface ContentSource {
  getGalleries(): Promise<Gallery[]>;
  getGallery(slug: string): Promise<Gallery | undefined>;
}

/** Turn a placeholder seed into an image URL. Swap this out for real assets later. */
function resolvePlaceholder(seed: string, width: number, height: number): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

/** Local content source backed by the `galleries` content collection. */
export const localContentSource: ContentSource = {
  async getGalleries() {
    const entries = await getCollection("galleries");
    return entries
      .map((entry): Gallery => {
        const { order, location, filmStock, intro, photos } = entry.data;
        const name = galleryName({ location, filmStock });
        return {
          slug: entry.id,
          order,
          location,
          filmStock,
          intro,
          photos: photos.map(
            (p): Photo => ({
              src: resolvePlaceholder(p.seed, p.width, p.height),
              width: p.width,
              height: p.height,
              alt: p.alt ?? p.caption ?? name,
              caption: p.caption,
              date: p.date,
              camera: p.camera,
            }),
          ),
        };
      })
      .sort((a, b) => a.order - b.order);
  },

  async getGallery(slug) {
    const all = await this.getGalleries();
    return all.find((g) => g.slug === slug);
  },
};

/** The active source. Change this single line to switch backends. */
export const content: ContentSource = localContentSource;
