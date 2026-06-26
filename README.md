# fotos-de-nat

A minimal film-photography portfolio. Each gallery is a place + film stock; photos
are shown in a full-bleed, looping, draggable filmstrip. Built with
[Astro](https://astro.build), static-rendered, and deployed on Vercel.

> The current images are placeholders from [picsum.photos](https://picsum.photos).
> See [Swapping in real photos](#swapping-in-real-photos) and
> [Roadmap](#roadmap-google-drive) below.

## Quick start

```bash
npm install
npm run dev      # http://localhost:4321
```

| Command            | Does                                                  |
| ------------------ | ----------------------------------------------------- |
| `npm run dev`      | Start the dev server with hot reload                  |
| `npm run build`    | Type-check (`astro check`) then build to `dist/`      |
| `npm run preview`  | Serve the production build locally                    |
| `npm run format`   | Format the codebase with Prettier                     |
| `npm run check`    | Type-check / diagnostics only                         |

## Project structure

```
src/
  site.config.ts          # name, social links, SEO defaults — edit this first
  content.config.ts       # schema for the galleries collection
  content/galleries/      # one FOLDER per gallery: index.md + its photo files
  lib/
    types.ts              # Gallery / Photo domain types
    content-source.ts     # the content "seam" — swap backends here
    routes.ts             # gallery → URL mapping
  components/             # BaseHead, SiteHeader, SocialLinks, Filmstrip, Photo, …
  scripts/filmstrip.ts    # progressive-enhancement for the filmstrip
  layouts/BaseLayout.astro
  pages/
    index.astro           # the first gallery (lives at "/")
    galleries/[slug].astro# every other gallery
```

## Configure the site

Edit **`src/site.config.ts`** — your name, the social links shown in the header
(leave any blank `""` to hide it), the canonical `url` (set this to your Vercel
domain before deploying), and the default SEO title/description.

## Add or edit a gallery

Each gallery is a **folder** in `src/content/galleries/`. The folder name is the
URL slug (e.g. `06-iceland/` → `/galleries/06-iceland`). Inside it: an `index.md`
and the gallery's photo files.

```
src/content/galleries/
  06-iceland/
    index.md
    falls.jpg
    glacier.jpg
```

```markdown
---
order: 6 # position in the pager (ascending)
location: Iceland # shown in the header/caption
filmStock: Portra 800 # shown in the header/caption
intro: Long nights on the ring road. # optional; used for SEO
photos:
  - src: ./falls.jpg # path to a file in this folder
    caption: Skógafoss at dusk # optional
    alt: A tall waterfall # optional; falls back to caption / gallery name
  - src: ./glacier.jpg
---
```

- The **lowest `order`** gallery is the home page (`/`); the rest get their own routes.
- You do **not** specify width/height — Astro reads each image's real dimensions
  and reserves space automatically (no layout shift).
- Run `npm run dev` and the new gallery appears in the pager automatically.

## Adding your real photos

The placeholder `.jpg` files (labelled "PLACEHOLDER") are real image files, so the
project builds and looks right out of the box. To use your own photos:

1. Drop your exported photos into the gallery's folder (any size — Astro
   optimizes them to responsive WebP/AVIF at build time).
2. In that gallery's `index.md`, point each `src:` at your filename and write a
   `caption:`. Delete the placeholder lines/files you replaced.
3. Rename folders / edit `location` + `filmStock` to your real trips.

Tip: export a sensible web size from Lightroom/Photos (long edge ~2400px). Astro
handles compression and format from there. EXIF `date`/`camera` fields exist on
the schema if you want to surface them later.

## Deploy to Vercel

This is a static site; Vercel auto-detects Astro — no adapter needed.

1. Push this repo to GitHub.
2. In Vercel: **New Project → import the repo**. Build command `npm run build`,
   output `dist/` (auto-detected). Deploy → you get a preview URL.
3. Check the preview, then attach your domain under **Project → Settings → Domains**.
   Your existing site stays live until you point the domain here.

## Roadmap: Google Drive

A second content source (a Drive-backed implementation of the `ContentSource`
interface in `src/lib/content-source.ts`) will let you manage photos in Drive
folders — one folder per gallery — with no code changes to any component. After
adding photos you trigger a rebuild on demand via a Vercel **Deploy Hook** URL.
Nothing in the components or routes changes; only the active `content` export is
swapped.
