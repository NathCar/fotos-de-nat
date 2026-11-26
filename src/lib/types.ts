import type { TemplateName } from "../templates/names";

export interface Photo {
  publicId: string;
  name: string;
  version: number;
  width: number;
  height: number;
  alt: string;
}

export interface Gallery {
  slug: string;
  number: number;
  title: string;
  filmStock?: string;
  intro?: string;
  template: TemplateName;
  /** 1-based index of the photo to open on; random when unset. */
  cover?: number;
  photos: Photo[];
}
