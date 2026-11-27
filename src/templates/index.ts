import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { TemplateName } from "./names";
import Carousel from "./carousel/Carousel.astro";
import Scatter from "./scatter/Scatter.astro";
import Strip from "./strip/Strip.astro";

export const TEMPLATES: Record<TemplateName, AstroComponentFactory> = {
  carousel: Carousel,
  scatter: Scatter,
  strip: Strip,
};
