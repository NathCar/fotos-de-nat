# fotos de nat

A photography website: numbered galleries of photos, each shown with a
layout template. It's a static [Astro](https://astro.build) site deployed on [Vercel](https://vercel.com).

Photos aren't stored in this repo. They live in [Cloudinary](https://cloudinary.com)
as protected 2000px copies, and each gallery is a short YAML config file.

- **Live site:** [fotosdenat.com](https://fotosdenat.com)
- **Stack:** Astro 5, TypeScript, Cloudinary, Vercel

## Contents

- [Use this repo for your own photos](#use-this-repo-for-your-own-photos)
- [Add or change a gallery](#add-or-change-a-gallery)
- [Gallery config reference](#gallery-config-reference)
- [Add a new template](#add-a-new-template)
- [How photos are protected](#how-photos-are-protected)
- [Commands](#commands)
- [Project structure](#project-structure)

## Use this repo for your own photos

You need Node 20 or later, a free [Cloudinary](https://cloudinary.com) account, and a
free [Vercel](https://vercel.com) account.

### 1. Get the code

Clone the repo, then install:

```bash
git clone https://github.com/<you>/<your-repo>.git
cd <your-repo>
npm install
```

### 2. Connect Cloudinary

1. In the Cloudinary console, go to **Settings → API Keys**. Note the **cloud name**
   (shown at the top), the **API key** and the **API secret**.
2. Create your local env file and fill in those three values:

   ```bash
   cp .env.example .env
   ```

   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

   `.env` is gitignored. The values are only read at build time and never reach the
   browser.

### 3. Make the site yours

Edit `src/site.config.ts`:

| Field         | Used for                                                        |
| ------------- | --------------------------------------------------------------- |
| `name`        | The name in the header, page titles and link previews           |
| `tagline`     | Home page title (`name — tagline`) and default descriptions     |
| `description` | Home page description for search engines and link previews      |
| `url`         | Your site's address, used for canonical links and link previews |
| `locale`      | The page language, e.g. `en`                                    |

Also replace `public/favicon.svg` with your own icon.

In `vercel.json`, delete the `redirects` block. Those redirect this site's old URLs
and don't apply to yours. Keep `"trailingSlash": false`.

### 4. Replace the galleries

Replace the galleries in `src/content/galleries/` with your config files. These point at photos in
my Cloudinary account, so they won't build with yours. To add your own see
[Add or change a gallery](#add-or-change-a-gallery).

Check it locally:

```bash
npm run dev      # http://localhost:4321
```

### 5. Deploy to Vercel

1. Push the repo to GitHub.
2. In Vercel, choose **Add New → Project** and import the repo. Vercel detects Astro,
   so keep the default settings.
3. Before the first deploy, open **Environment Variables** and add the three
   `CLOUDINARY_*` variables. Tick both **Production** and **Preview**, otherwise
   pull request previews fail to build. Mark the secret as **Sensitive**.
4. Deploy. To use your own domain, add it in **Settings → Domains**, and make sure
   it matches `url` in `src/site.config.ts`.

Every push to `main` redeploys the site, and every pull request gets a preview.

## Add or change a gallery

### 1. Upload the photos

Put the photos for one gallery in a folder on your computer, then run:

```bash
npm run upload -- japan ~/Pictures/export/japan
```

- `japan` is the gallery's slug. It becomes the Cloudinary folder and the URL
  (`/galleries/japan`).
- Each photo is resized to at most 2000px on the long edge, has its metadata
  removed, and is uploaded as a protected asset. Your full-resolution files never
  leave your computer, so keep them in your own archive.
- Photos are named after their filename without the extension, e.g. `IMG_1234.jpg`
  becomes `IMG_1234`.
- Re-running the command skips photos that are already uploaded. Add `--replace` to
  overwrite them, for example after re-editing.

Always upload with this script, not through the Cloudinary website. The website
creates public, full-size assets, and the build refuses them.

### 2. Add the config file

Create `src/content/galleries/japan.yaml`. The filename must match the slug you
uploaded to:

```yaml
number: 10
title: Japan
intro: Two weeks in Tokyo and Kyoto.
template: carousel
cover: IMG_1240
photos:
  - IMG_1234
  - IMG_1240
  - id: IMG_1251
    alt: A narrow street in Kyoto at dusk
```

### 3. Publish

Commit and push. Vercel builds and deploys the site, and the gallery appears in the
header.

### Changing a gallery later

- **Reorder, remove or add photos:** edit the `photos` list and push.
- **Change the order of galleries:** change their `number` values.
- **Remove a gallery:** delete its YAML file. The photos stay in Cloudinary until you
  delete the folder there.
- **A gallery with no `photos` list** shows every photo in its folder. New uploads
  appear on the next deploy. Nothing changes in git, so trigger one from Vercel
  (**Deployments → ⋯ → Redeploy**).

## Gallery config reference

| Field       | Required | Meaning                                                                                                                                                                         |
| ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `number`    | yes      | Position in the header. Must be unique. The lowest number is the home page.                                                                                                     |
| `title`     | yes      | Shown under the photos and in the page title.                                                                                                                                   |
| `filmStock` | no       | Added after the title, e.g. "Japan · Portra 400".                                                                                                                               |
| `intro`     | no       | Page description for search engines and link previews.                                                                                                                          |
| `template`  | no       | How the photos are shown. Defaults to `carousel`. See [Add a new template](#add-a-new-template).                                                                                |
| `folder`    | no       | The Cloudinary folder, if it differs from the filename.                                                                                                                         |
| `cover`     | no       | The photo the gallery opens on, and the image used in link previews. Without it the gallery opens on a random photo.                                                            |
| `photos`    | no       | Photos in display order. Each is a photo name, or `{ id, alt }` to set alt text. Without a list, every photo in the folder is shown in random order, reshuffled on each deploy. |

Alt text describes the photo for screen readers. Photos without `alt` use the
gallery title.

The build stops with a clear error if:

- two galleries share a `number`;
- a listed photo or the `cover` isn't in the Cloudinary folder;
- the folder is empty or contains a public (non-protected) photo;
- `template` names a template that doesn't exist.

## Add a new template

A template decides how a gallery's photos are laid out. Every gallery picks one with
its `template` field. Here's how to add one, using a vertical scroll as the example.

### 1. Create the component

Create `src/templates/vertical/Vertical.astro`. A template receives one prop,
`gallery`, and should render each photo with the shared `Photo` component so it gets
the signed URLs, responsive sizes and download protection:

```astro
---
import Photo from "../../components/Photo.astro";
import type { Gallery } from "../../lib/types";

interface Props {
  gallery: Gallery;
}

const { gallery } = Astro.props;
---

<section class="vertical" aria-label={`${gallery.title} gallery`}>
  {
    gallery.photos.map((photo, i) => (
      <Photo
        photo={photo}
        priority={i === 0}
        sizes="min(100vw, 1600px)"
        class="v-photo"
      />
    ))
  }
</section>

<style>
  .vertical {
    height: calc(100dvh - var(--head));
    overflow-y: auto;
    display: grid;
    justify-items: center;
    gap: 24px;
    padding: 24px;
  }
  .vertical :global(.v-photo) {
    max-height: calc(100dvh - var(--head) - 48px);
    width: auto;
  }
</style>
```

`Photo` takes these props:

| Prop       | Meaning                                                                |
| ---------- | ---------------------------------------------------------------------- |
| `photo`    | One entry from `gallery.photos`                                        |
| `priority` | `true` for the first photo on screen, so it loads first                |
| `sizes`    | How wide the photo is displayed, e.g. `"50vw"`. Defaults to `"100vw"`. |
| `class`    | A class name to style the photo from your template                     |

The `gallery` object contains:

| Field                | Type                          |
| -------------------- | ----------------------------- |
| `slug`, `title`      | string                        |
| `number`             | number                        |
| `filmStock`, `intro` | string, optional              |
| `cover`              | 1-based photo index, optional |
| `photos`             | array of `Photo`              |

Each photo has `width`, `height` and `alt`. The rest of its fields are used by the
`Photo` component.

### 2. Register it

Templates are registered in two files:

- Add the name to `src/templates/names.ts`:

  ```ts
  export const TEMPLATE_NAMES = ["carousel", "vertical"] as const;
  ```

- Map the name to the component in `src/templates/index.ts`:

  ```ts
  import Vertical from "./vertical/Vertical.astro";

  export const TEMPLATES: Record<TemplateName, AstroComponentFactory> = {
    carousel: Carousel,
    vertical: Vertical,
  };
  ```

The names live in a separate file because the gallery config schema can't import
`.astro` components. If the two files get out of sync, `npm run build` fails with a
type error naming the missing template.

### 3. Use it

Set `template: vertical` in any gallery's YAML file.

### Things to know

- **Photo sizing:** `Photo.astro` takes a `sizes` prop that tells the browser how
  wide the photo will be on screen, so it downloads the smallest file that looks
  sharp. It defaults to the full screen width. Set it whenever your photos are
  narrower, as in the example above. Pass `class` to style the photo from your
  template with `:global(...)`, since Astro scopes styles to each component.
- **Interactivity:** put client-side code in the template's own folder and load it
  from a `<script>` in the component, as the carousel does with `carousel.ts`.
- **Page scroll:** `global.css` sets `overflow: hidden` on `body` because the carousel
  fills the screen. A scrolling template should scroll its own container, as in the
  example above.

## How photos are protected

Nothing a browser can display is fully safe from a screenshot, but no full-resolution
file is ever online:

- Only 2000px copies are uploaded. The originals stay on your computer.
- Photos are stored as **authenticated** assets, so only URLs signed at build time
  work. Nobody can change a URL to get a different size.
- Right-click, drag and long-press saving are turned off on photos.

## Commands

| Command                                         | Does                                       |
| ----------------------------------------------- | ------------------------------------------ |
| `npm run dev`                                   | Start a local server at localhost:4321     |
| `npm run build`                                 | Type-check, then build the site to `dist/` |
| `npm run preview`                               | Serve the built site locally               |
| `npm run upload -- <slug> <folder> [--replace]` | Resize and upload a folder of photos       |
| `npm run format`                                | Format the code with Prettier              |

## Project structure

```
src/
  site.config.ts              site name, tagline, description, URL
  content.config.ts           schema for the gallery YAML files
  content/galleries/          one YAML file per gallery
  templates/
    names.ts                  list of template names
    index.ts                  template name → component
    carousel/                 the horizontal carousel template
  components/
    Photo.astro               one protected, responsive photo
    GalleryView.astro         header + the gallery's template
    SiteHeader.astro          site name and gallery numbers
    BaseHead.astro            title, description, link-preview tags
  lib/
    cloudinary.ts             lists folders, builds signed URLs (build time only)
    content-source.ts         YAML + Cloudinary → galleries, with validation
  pages/                      "/" is the first gallery; the rest are /galleries/<slug>
scripts/upload-photos.mjs     resizes and uploads photos
public/favicon.svg            browser tab icon
vercel.json                   redirects for old URLs
```
