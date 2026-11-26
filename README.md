# fotos de nat

A minimal film-photography portfolio. Each gallery is a numbered page of photos, shown
with a template (today: a looping, draggable horizontal carousel). Built with
[Astro](https://astro.build), statically rendered, and deployed on Vercel. Photos live
in [Cloudinary](https://cloudinary.com), not in this repo.

## Quick start

```bash
npm install
cp .env.example .env   # then fill in your Cloudinary credentials
npm run dev            # http://localhost:4321
```

| Command                             | Does                                    |
| ----------------------------------- | --------------------------------------- |
| `npm run dev`                       | Dev server with hot reload              |
| `npm run build`                     | Type-check, then build to `dist/`       |
| `npm run preview`                   | Serve the production build locally      |
| `npm run upload -- <slug> <folder>` | Upload a folder of photos to Cloudinary |
| `npm run format`                    | Format with Prettier                    |

## Environment

| Variable                | Where to find it                         |
| ----------------------- | ---------------------------------------- |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary console → Dashboard           |
| `CLOUDINARY_API_KEY`    | Cloudinary console → Settings → API Keys |
| `CLOUDINARY_API_SECRET` | Cloudinary console → Settings → API Keys |

Set them in `.env` locally and in Vercel → Project → Settings → Environment Variables.
They are only read at build time and never reach the browser.

## Add a gallery

1. Upload the photos:

   ```bash
   npm run upload -- japan ~/Pictures/export/japan
   ```

   This puts them in a Cloudinary folder called `japan`, as protected assets.
   Re-running it skips photos that are already there.

2. Add `src/content/galleries/japan.yaml`. The filename is the URL (`/galleries/japan`).

   ```yaml
   number: 10
   title: Japan
   filmStock: Portra 400
   intro: Two weeks in Tokyo and Kyoto.
   template: carousel
   cover: IMG_1240
   photos:
     - IMG_1234
     - id: IMG_1240
       caption: Shibuya at night
   ```

3. Commit and push. Vercel builds and deploys it.

| Field       | Required | Meaning                                                                                                        |
| ----------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `number`    | yes      | Position in the pager. Must be unique. The lowest number is the home page.                                     |
| `title`     | yes      | Shown in the caption and page title.                                                                           |
| `filmStock` | no       | Added to the caption, e.g. "Japan · Portra 400".                                                               |
| `intro`     | no       | Page description for search engines and link previews.                                                         |
| `template`  | no       | How the photos are shown. Defaults to `carousel`.                                                              |
| `folder`    | no       | Cloudinary folder. Defaults to the filename.                                                                   |
| `cover`     | no       | Photo to open on. Random if omitted.                                                                           |
| `photos`    | no       | Photos in order, by filename without extension. If omitted, every photo in the folder is used in random order. |

Photo entries are either a filename or `{ id, caption, alt }`.

The build fails with a clear message if two galleries share a number, a listed photo
or cover isn't in the folder, or a template name doesn't exist.

**Galleries without a `photos` list** pick up new uploads on the next deploy. Since
nothing changes in git, trigger one from Vercel (Deployments → Redeploy, or a deploy
hook).

**Don't upload through the Cloudinary web console.** It creates public assets, which
anyone could download at full size, and the build refuses them. Use `npm run upload`.

## Templates

Templates live in `src/templates/`. To add one, for example a vertical scroll:

1. Create `src/templates/vertical/Vertical.astro`. It receives `gallery` and `number`
   props, and should render each photo with `components/Photo.astro`.
2. Add `"vertical"` to `TEMPLATE_NAMES` in `src/templates/names.ts`.
3. Register it in `src/templates/index.ts`.

Any gallery can then use `template: vertical`.

## Photo protection

Nothing a browser can display is fully safe from a screenshot, but no usable original
leaves Cloudinary:

- Photos are stored as **authenticated** assets, so only signed URLs generated at
  build time work. Nobody can edit a URL to get a bigger version or the original.
- The largest size served is 2000px on the long edge.
- Right-click, drag and long-press save are disabled on photos.

## Project structure

```
src/
  site.config.ts           # name, social links, SEO defaults
  content.config.ts        # gallery config schema
  content/galleries/       # one YAML file per gallery
  lib/
    cloudinary.ts          # folder listing and signed URLs (build time only)
    content-source.ts      # YAML + Cloudinary → Gallery objects, with validation
  templates/               # one folder per template, plus the registry
  components/              # BaseHead, SiteHeader, Photo, GalleryView, …
  pages/                   # "/" is the first gallery; the rest are /galleries/<slug>
scripts/upload-photos.mjs  # uploads a folder as authenticated assets
```

## Deploy

Vercel auto-detects Astro, so no adapter is needed. Make sure the three Cloudinary
variables are set for both Production and Preview. Old `/galleries/02-colombia`-style
URLs redirect via `vercel.json`.
