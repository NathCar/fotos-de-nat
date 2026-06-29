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

/** Local content source backed by the `galleries` content collection. */
export const localContentSource: ContentSource = {
  async getGalleries() {
    const entries = await getCollection("galleries");
    return entries
      .map((entry): Gallery => {
        const { order, location, filmStock, intro, cover, photos } = entry.data;
        const name = galleryName({ location, filmStock });
        return {
          // Entry id is "<folder>/index" — the folder name is the slug.
          slug: entry.id.replace(/\/index$/, ""),
          order,
          location,
          filmStock,
          intro,
          cover,
          photos: photos.map(
            (p): Photo => ({
              src: p.src,
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
