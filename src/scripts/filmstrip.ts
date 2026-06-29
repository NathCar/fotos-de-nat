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

  // Open on the gallery's cover photo (1-based) if set, else a random photo.
  const cover = Number(stage.dataset.cover);
  let active =
    Number.isInteger(cover) && cover >= 1 && cover <= n
      ? n + (cover - 1)
      : n + Math.floor(Math.random() * n);
  let baseTX = 0;
  let animating = false; // true while an animated move is in flight

  function place(animate: boolean): void {
    const willAnimate = animate && !prefersReduced;
    track!.style.transition = willAnimate ? "" : "none";
    const s = slides[active];
    baseTX = stage.clientWidth / 2 - (s.offsetLeft + s.offsetWidth / 2);
    track!.style.transform = `translateX(${baseTX}px)`;
    if (willAnimate) animating = true;

    const k = ((active % n) + n) % n;
    cap!.innerHTML = `${name} &nbsp;·&nbsp; ${k + 1} / ${n}`;

    prime(active);
    if (!animate) void track!.offsetWidth; // reflow so the next move animates
    if (prefersReduced) normalize();
  }

  // A non-animated re-center (image load, resize) must never run mid-move: it
  // sets transition:none, which snaps the in-flight transform to its end and
  // makes the photo "pop" instead of sliding. Defer until the move settles.
  function recenter(): void {
    if (!animating) place(false);
  }

  // Decode the active slide and its immediate neighbours ahead of time. On
  // mobile a single ~1200px photo costs hundreds of ms to decode; doing it
  // lazily at navigation time is what makes the first view of each photo lag.
  function prime(center: number): void {
    for (let d = -2; d <= 2; d++) {
      const img = slides[center + d]?.querySelector("img");
      if (!img) continue;
      if (img.loading === "lazy") img.loading = "eager"; // force the fetch too
      img.decode?.().catch(() => {});
    }
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
      img.addEventListener("load", () => recenter(), { once: true });
    }
  });

  // After an animated move ends, clear the flag, then snap back if we've
  // drifted off the middle copy.
  track.addEventListener("transitionend", (e) => {
    if (e.propertyName !== "transform") return;
    animating = false;
    normalize();
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

  addEventListener("resize", () => recenter());

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
