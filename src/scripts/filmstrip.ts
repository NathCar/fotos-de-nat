export function initFilmstrip(stage: HTMLElement): void {
  const track = stage.querySelector<HTMLElement>("[data-track]");
  const cap = stage.querySelector<HTMLElement>("[data-cap]");
  const prevBtn = stage.querySelector<HTMLButtonElement>("[data-prev]");
  const nextBtn = stage.querySelector<HTMLButtonElement>("[data-next]");
  if (!track || !cap) return;

  const name = stage.dataset.galleryName ?? "";
  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Three copies so the loop is seamless and the edges always peek.
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

  const cover = Number(stage.dataset.cover);
  let active =
    Number.isInteger(cover) && cover >= 1 && cover <= n
      ? n + (cover - 1)
      : n + Math.floor(Math.random() * n);
  let baseTX = 0;
  let animating = false;

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

  // Re-centering mid-move sets transition:none and pops the animation, so defer.
  function recenter(): void {
    if (!animating) place(false);
  }

  // Decode neighbours early; lazy decoding on mobile makes each first view lag.
  function prime(center: number): void {
    for (let d = -2; d <= 2; d++) {
      const img = slides[center + d]?.querySelector("img");
      if (!img) continue;
      if (img.loading === "lazy") img.loading = "eager";
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

  slides.forEach((s) => {
    const img = s.querySelector("img");
    if (img && !img.complete) {
      img.addEventListener("load", () => recenter(), { once: true });
    }
  });

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
  stage.tabIndex = 0;

  addEventListener("resize", () => recenter());

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

  slides.forEach((s, i) => {
    s.addEventListener("click", () => {
      if (!moved) goTo(i);
    });
  });

  place(false);
}
