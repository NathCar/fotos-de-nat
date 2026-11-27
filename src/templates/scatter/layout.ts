interface Shape {
  width: number;
  height: number;
}

/** Where a photo sits on the 12-column grid; `drop` pushes it down, in rem. */
export interface Placement {
  col: number;
  span: number;
  drop: number;
}

const isPortrait = (p: Shape) => p.height > p.width;

// Repeats every 8 photos.
const MIXED: Placement[] = [
  { col: 2, span: 6, drop: 0 },
  { col: 9, span: 4, drop: 10 },
  { col: 1, span: 7, drop: 0 },
  { col: 9, span: 4, drop: 6 },
  { col: 3, span: 10, drop: 0 },
  { col: 1, span: 5, drop: 0 },
  { col: 7, span: 6, drop: 8 },
  { col: 2, span: 9, drop: 0 },
];

function mixedLayout(photos: Shape[]): Placement[] {
  return photos.map((photo, i) => {
    const slot = MIXED[i % MIXED.length];
    // Portraits take a narrower slot so they don't tower over the page.
    const span = isPortrait(photo)
      ? Math.max(4, Math.round(slot.span * 0.7))
      : slot.span;
    return { ...slot, span: Math.min(span, 13 - slot.col) };
  });
}

/** Reorders so each landscape shares its row with a portrait when one is left. */
export function pairOrder(photos: Shape[]): number[] {
  const order = photos.map((_, i) => i);
  for (let i = 0; i + 1 < order.length; i += 2) {
    if (isPortrait(photos[order[i]]) || isPortrait(photos[order[i + 1]])) {
      continue;
    }
    const swap = order.findIndex((o, j) => j > i + 1 && isPortrait(photos[o]));
    if (swap !== -1) [order[i + 1], order[swap]] = [order[swap], order[i + 1]];
  }
  return order;
}

// Vertical offsets (rem) for the left and right photo of each row; repeats.
const DROPS: [number, number][] = [
  [0, 12],
  [8, 0],
  [0, 6],
  [14, 2],
];

function rowSpans(a: Shape, b: Shape): [number, number] {
  if (isPortrait(a) && isPortrait(b)) return [5, 4];
  if (isPortrait(a)) return [4, 8];
  if (isPortrait(b)) return [8, 4];
  return [6, 5];
}

/** Two photos per row with a gap between, alternating which side leads. */
function portraitLayout(photos: Shape[]): Placement[] {
  const out: Placement[] = [];
  for (let i = 0; i < photos.length; i += 2) {
    const row = i / 2;
    const [a, b] = [photos[i], photos[i + 1]];
    if (!b) {
      const span = isPortrait(a) ? 5 : 8;
      out.push({ col: Math.round((13 - span) / 2), span, drop: 0 });
      break;
    }
    const [spanA, spanB] = rowSpans(a, b);
    const [dropA, dropB] = DROPS[row % DROPS.length];
    const spacer = spanA + spanB < 12 ? 1 : 0;
    // Odd rows hug the right edge, even rows the left, so the page zigzags.
    const inset = row % 2 === 0 ? 1 : 13 - (spanA + spanB + spacer);
    out.push({ col: inset, span: spanA, drop: dropA });
    out.push({ col: inset + spanA + spacer, span: spanB, drop: dropB });
  }
  return out;
}

export function scatterLayout(photos: Shape[]): {
  order: number[];
  placements: Placement[];
} {
  const portraits = photos.filter(isPortrait).length;
  if (portraits <= photos.length / 2) {
    return { order: photos.map((_, i) => i), placements: mixedLayout(photos) };
  }
  const order = pairOrder(photos);
  return { order, placements: portraitLayout(order.map((i) => photos[i])) };
}
