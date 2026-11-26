export const SITE = {
  name: "fotos de nat",
  title: "fotos de nat — Film Photography",
  description:
    "Film photographs from around the world, organised by place and film stock.",
  url: "https://example.com",
  locale: "en",
  /** Leave a link empty to hide its icon. */
  social: {
    instagram: "",
    x: "",
    email: "",
  },
} as const;

export type SiteConfig = typeof SITE;
