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
  content/galleries/      # one Markdown file per gallery (the content)
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

Add a Markdown file to `src/content/galleries/`. The filename becomes the URL
slug (e.g. `06-iceland.md` → `/galleries/06-iceland`).

```markdown
---
order: 6 # position in the pager (ascending)
location: Iceland # shown in the header/caption
filmStock: Portra 800 # shown in the header/caption
intro: Long nights on the ring road. # optional; used for SEO
photos:
  - seed: iceland-falls # placeholder image id (any string)
    width: 1300 # intrinsic width  — keeps layout from shifting
    height: 860 # intrinsic height
    caption: Skógafoss at dusk # optional
    alt: A tall waterfall # optional; falls back to caption / gallery name
---
```

- The **lowest `order`** gallery is the home page (`/`); the rest get their own routes.
- `width`/`height` are required so the page reserves space and never jumps.
- Run `npm run dev` and the new gallery appears in the pager automatically.

## Swapping in real photos

Today, photos render from picsum via `Photo.astro`. For real images:

1. Drop image files into the repo (e.g. `src/assets/galleries/<gallery>/`).
2. Reference them in the gallery's `photos` and update `content-source.ts` so
   `src` points at the local file instead of the picsum placeholder.
3. Switch `Photo.astro` from `<img>` to astro's `<Image />` (`astro:assets`) to
   get automatic AVIF/WebP, responsive `srcset`, and build-time optimization.

EXIF `date`/`camera` fields already exist on the `Photo` type and can be
auto-extracted at that point.

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
