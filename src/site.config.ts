/**
 * Single source of truth for site-wide settings.
 * Edit this file to set your name, links, and SEO defaults — nothing else needs to change.
 */
export const SITE = {
  /** Brand mark shown in the header. */
  name: "Your Name",
  /** Used in <title>, Open Graph, and structured data. */
  title: "Your Name — Film Photography",
  description:
    "Film photographs from around the world, organised by place and film stock.",
  /** Canonical site URL. Update to your Vercel domain before deploying. */
  url: "https://example.com",
  /** Default locale for <html lang> and Open Graph. */
  locale: "en",
  /** Header social links. Leave a value empty ("") to hide that icon. */
  social: {
    instagram: "https://instagram.com/your-handle",
    x: "https://x.com/your-handle",
    email: "you@example.com",
  },
} as const;

export type SiteConfig = typeof SITE;
