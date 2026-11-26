import { readdir } from "node:fs/promises";
import { extname, basename, join } from "node:path";
import { v2 as cloudinary } from "cloudinary";

const [slug, dir] = process.argv.slice(2);
if (!slug || !dir) {
  console.error(
    "Usage: npm run upload -- <gallery-slug> <directory-of-photos>",
  );
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const IMAGE = /\.(jpe?g|png|webp|tiff?|heic|avif)$/i;
const files = (await readdir(dir)).filter((f) => IMAGE.test(f)).sort();

let uploaded = 0;
let skipped = 0;
for (const file of files) {
  const name = basename(file, extname(file));
  const res = await cloudinary.uploader.upload(join(dir, file), {
    type: "authenticated",
    asset_folder: slug,
    public_id: `${slug}/${name}`,
    display_name: name,
    overwrite: false,
  });
  if (res.existing) skipped++;
  else uploaded++;
  console.log(
    `${res.existing ? "exists " : "added  "} ${slug}/${name}  ${res.width}x${res.height}`,
  );
}
console.log(
  `\n${slug}: ${uploaded} uploaded, ${skipped} already there, ${files.length} total.`,
);
