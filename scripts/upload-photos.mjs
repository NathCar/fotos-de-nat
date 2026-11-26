import { readdir } from "node:fs/promises";
import { extname, basename, join } from "node:path";
import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

const MAX_EDGE = 2000;

const args = process.argv.slice(2);
const replace = args.includes("--replace");
const [slug, dir] = args.filter((a) => !a.startsWith("--"));
if (!slug || !dir) {
  console.error(
    "Usage: npm run upload -- <gallery-slug> <directory-of-photos> [--replace]",
  );
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function webCopy(path) {
  return sharp(path)
    .rotate()
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .toColourspace("srgb")
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4", mozjpeg: true })
    .toBuffer();
}

function upload(buffer, options) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (err, res) => (err ? reject(err) : resolve(res)))
      .end(buffer);
  });
}

const IMAGE = /\.(jpe?g|png|webp|tiff?|heic|avif)$/i;
const files = (await readdir(dir)).filter((f) => IMAGE.test(f)).sort();

let uploaded = 0;
let skipped = 0;
for (const file of files) {
  const name = basename(file, extname(file));
  const res = await upload(await webCopy(join(dir, file)), {
    type: "authenticated",
    asset_folder: slug,
    public_id: `${slug}/${name}`,
    display_name: name,
    overwrite: replace,
    invalidate: replace,
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
