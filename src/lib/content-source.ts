import { getCollection, type CollectionEntry } from "astro:content";
import type { Gallery, Photo } from "./types";
import { galleryName } from "./gallery-name";
import { listFolder, type CloudinaryAsset } from "./cloudinary";

type Entry = CollectionEntry<"galleries">;

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function resolvePhotos(entry: Entry): Promise<Photo[]> {
  const { title, filmStock, photos: refs } = entry.data;
  const folder = entry.data.folder ?? entry.id;
  const assets = await listFolder(folder);
  if (assets.length === 0) {
    throw new Error(
      `Gallery "${entry.id}": Cloudinary folder "${folder}" has no images.`,
    );
  }
  const exposed = assets
    .filter((a) => a.type !== "authenticated")
    .map((a) => a.name);
  if (exposed.length) {
    throw new Error(
      `Gallery "${entry.id}": ${exposed.join(", ")} must be uploaded as authenticated, not public. See README.`,
    );
  }
  const fallbackAlt = galleryName({ title, filmStock });
  const toPhoto = (a: CloudinaryAsset, alt?: string): Photo => ({
    publicId: a.publicId,
    name: a.name,
    version: a.version,
    width: a.width,
    height: a.height,
    alt: alt ?? fallbackAlt,
  });

  if (!refs) return shuffle(assets).map((a) => toPhoto(a));

  const byName = new Map(assets.map((a) => [a.name, a]));
  return refs.map((ref) => {
    const r = typeof ref === "string" ? { id: ref } : ref;
    const asset = byName.get(r.id);
    if (!asset) {
      throw new Error(
        `Gallery "${entry.id}": photo "${r.id}" is not in Cloudinary folder "${folder}".`,
      );
    }
    return toPhoto(asset, r.alt);
  });
}

function coverIndex(entry: Entry, photos: Photo[]): number | undefined {
  const { cover } = entry.data;
  if (!cover) return undefined;
  const i = photos.findIndex((p) => p.name === cover);
  if (i === -1)
    throw new Error(
      `Gallery "${entry.id}": cover "${cover}" is not one of its photos.`,
    );
  return i + 1;
}

async function toGallery(entry: Entry): Promise<Gallery> {
  const photos = await resolvePhotos(entry);
  const { number, title, filmStock, intro, template } = entry.data;
  return {
    slug: entry.id,
    number,
    title,
    filmStock,
    intro,
    template,
    cover: coverIndex(entry, photos),
    photos,
  };
}

let cached: Promise<Gallery[]> | undefined;

async function loadGalleries(): Promise<Gallery[]> {
  const entries = await getCollection("galleries");
  const seen = new Map<number, string>();
  for (const e of entries) {
    const clash = seen.get(e.data.number);
    if (clash)
      throw new Error(
        `Galleries "${clash}" and "${e.id}" both use number ${e.data.number}.`,
      );
    seen.set(e.data.number, e.id);
  }
  const galleries = await Promise.all(entries.map(toGallery));
  return galleries.sort((a, b) => a.number - b.number);
}

export function getGalleries(): Promise<Gallery[]> {
  cached ??= loadGalleries();
  return cached;
}
