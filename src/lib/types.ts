import type { ImageMetadata } from "astro";

export interface Photo {
  src: ImageMetadata;
  alt: string;
  caption?: string;
  date?: string;
  camera?: string;
}

export interface Gallery {
  slug: string;
  order: number;
  location: string;
  filmStock?: string;
  intro?: string;
  /** 1-based index of the photo to open on; random when unset. */
  cover?: number;
  photos: Photo[];
}
