import type { Gallery } from "./types";
import { photoUrl } from "./cloudinary";

export function ogImage(gallery: Gallery): string | undefined {
  const photo = gallery.photos[(gallery.cover ?? 1) - 1];
  return photo && photoUrl(photo, 1200);
}
