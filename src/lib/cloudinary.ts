import { v2 as cloudinary } from "cloudinary";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "astro:env/server";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export const MAX_EDGE = 2000;

export interface CloudinaryAsset {
  publicId: string;
  name: string;
  version: number;
  width: number;
  height: number;
  type: string;
}

interface ApiResource {
  public_id: string;
  display_name?: string;
  version: number;
  width: number;
  height: number;
  type: string;
  resource_type: string;
}

const folderCache = new Map<string, Promise<CloudinaryAsset[]>>();

async function fetchFolder(folder: string): Promise<CloudinaryAsset[]> {
  const assets: CloudinaryAsset[] = [];
  let cursor: string | undefined;
  do {
    const res = await cloudinary.api.resources_by_asset_folder(folder, {
      max_results: 500,
      next_cursor: cursor,
    });
    for (const r of res.resources as ApiResource[]) {
      if (r.resource_type !== "image") continue;
      assets.push({
        publicId: r.public_id,
        name: r.display_name ?? r.public_id.split("/").pop()!,
        version: r.version,
        width: r.width,
        height: r.height,
        type: r.type,
      });
    }
    cursor = res.next_cursor;
  } while (cursor);
  return assets;
}

export function listFolder(folder: string): Promise<CloudinaryAsset[]> {
  let cached = folderCache.get(folder);
  if (!cached) {
    cached = fetchFolder(folder);
    folderCache.set(folder, cached);
  }
  return cached;
}

/** Signed URL for one width; authenticated assets refuse anything unsigned. */
export function photoUrl(
  asset: Pick<CloudinaryAsset, "publicId" | "version">,
  width: number,
): string {
  return cloudinary.url(asset.publicId, {
    type: "authenticated",
    sign_url: true,
    version: asset.version,
    transformation: [
      { width, crop: "limit" },
      { fetch_format: "auto", quality: "auto" },
    ],
  });
}
