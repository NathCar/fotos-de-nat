import { getCollection } from "astro:content";
import type { Gallery, Photo } from "./types";
import { galleryName } from "./gallery-name";

export interface ContentSource {
  getGalleries(): Promise<Gallery[]>;
  getGallery(slug: string): Promise<Gallery | undefined>;
}

export const localContentSource: ContentSource = {
  async getGalleries() {
    const entries = await getCollection("galleries");
    return entries
      .map((entry): Gallery => {
        const { order, location, filmStock, intro, cover, photos } = entry.data;
        const name = galleryName({ location, filmStock });
        return {
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

export const content: ContentSource = localContentSource;
