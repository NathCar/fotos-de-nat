/**
 * Progressive enhancement for the filmstrip.
 *
 * Server-rendered markup is a single, natively-scrollable row of photos. This
 * upgrades it into the centered, seamlessly-looping, draggable strip from the
 * original design — navigation loops WITHIN the gallery; switching galleries is
 * page navigation handled by the pager links.
 */
export function initFilmstrip(stage: HTMLElement): void {
  const track = stage.querySelector<HTMLElement>("[data-track]");
  const cap = stage.querySelector<HTMLElement>("[data-cap]");
  const prevBtn = stage.querySelector<HTMLButtonElement>("[data-prev]");
  const nextBtn = stage.querySelector<HTMLButtonElement>("[data-next]");
  if (!track || !cap) return;

  const name = stage.dataset.galleryName ?? "";
  const number = stage.dataset.galleryNumber ?? "";
  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Capture the server-rendered slides, then build three copies so the loop is
  // seamless and the edges always peek.
  const originals = Array.from(track.children) as HTMLElement[];
  const n = originals.length;
  if (n === 0) return;

  track.innerHTML = "";
  for (let copy = 0; copy < 3; copy++) {
    for (const slide of originals) {
      track.appendChild(slide.cloneNode(true) as HTMLElement);
    }
  }
  const slides = Array.from(track.children) as HTMLElement[];

  stage.dataset.enhanced = "";
  prevBtn?.removeAttribute("hidden");
  nextBtn?.removeAttribute("hidden");

  let active = n + Math.floor(Math.random() * n); // start in the middle copy
  let baseTX = 0;

  function place(animate: boolean): void {
    track!.style.transition = animate && !prefersReduced ? "" : "none";
    const s = slides[active];
    baseTX = stage.clientWidth / 2 - (s.offsetLeft + s.offsetWidth / 2);
    track!.style.transform = `translateX(${baseTX}px)`;

    const k = ((active % n) + n) % n;
    cap!.innerHTML = `<b>${number}</b> &nbsp; ${name} &nbsp;·&nbsp; ${k + 1} / ${n}`;

    if (!animate) void track!.offsetWidth; // reflow so the next move animates
    if (prefersReduced) normalize();
  }

  function normalize(): void {
    if (active < n || active >= 2 * n) {
      active = n + (((active % n) + n) % n);
      place(false);
    }
  }

  function goTo(i: number): void {
    active = i;
    place(true);
  }
  function shift(delta: number): void {
    active += delta;
    place(true);
  }

  // Re-center once each image reports its real size.
  slides.forEach((s) => {
    const img = s.querySelector("img");
    if (img && !img.complete) {
      img.addEventListener("load", () => place(false), { once: true });
    }
  });

  // After an animated move, if we've drifted off the middle copy, snap back.
  track.addEventListener("transitionend", (e) => {
    if (e.propertyName === "transform") normalize();
  });

  prevBtn?.addEventListener("click", () => shift(-1));
  nextBtn?.addEventListener("click", () => shift(1));

  stage.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      shift(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      shift(1);
    }
  });
  stage.tabIndex = 0; // make the strip focusable so keys reach it

  addEventListener("resize", () => place(false));

  // Drag / swipe — stays within the gallery.
  let down = false;
  let startX = 0;
  let dx = 0;
  let moved = false;

  track.addEventListener("pointerdown", (e) => {
    down = true;
    startX = e.clientX;
    dx = 0;
    moved = false;
    track.classList.add("drag");
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener("pointermove", (e) => {
    if (!down) return;
    dx = e.clientX - startX;
    if (Math.abs(dx) > 5) moved = true;
    track.style.transform = `translateX(${baseTX + dx}px)`;
  });
  function release(): void {
    if (!down) return;
    down = false;
    track!.classList.remove("drag");
    const threshold = stage.clientWidth * 0.08;
    if (dx < -threshold) shift(1);
    else if (dx > threshold) shift(-1);
    else place(true);
  }
  track.addEventListener("pointerup", release);
  track.addEventListener("pointercancel", release);

  // Click a peeking slide to bring it to center (ignored right after a drag).
  slides.forEach((s, i) => {
    s.addEventListener("click", () => {
      if (!moved) goTo(i);
    });
  });

  place(false);
}
