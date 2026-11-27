export function initStrip(root: HTMLElement): void {
  const row = root.querySelector<HTMLElement>("[data-row]");
  if (!row) return;
  const toggles = Array.from(
    row.querySelectorAll<HTMLButtonElement>("button[aria-pressed]"),
  );
  let frame = 0;

  function setOpen(btn: HTMLButtonElement, open: boolean): void {
    btn.setAttribute("aria-pressed", String(open));
    btn.setAttribute(
      "aria-label",
      btn
        .getAttribute("aria-label")!
        .replace(/^\w+/, open ? "Shrink" : "Enlarge"),
    );
    const img = btn.querySelector("img");
    // Widening sizes makes the browser fetch a sharper file for the bigger photo.
    if (open && img && btn.dataset.sizesOpen) {
      img.loading = "eager";
      img.sizes = btn.dataset.sizesOpen;
    }
  }

  function centeredScroll(btn: HTMLElement): number {
    const b = btn.getBoundingClientRect();
    const r = row!.getBoundingClientRect();
    return row!.scrollLeft + b.left + b.width / 2 - (r.left + r.width / 2);
  }

  // Scrolls in step with the CSS height transition, so growing and centring happen together.
  function follow(btn: HTMLButtonElement): void {
    cancelAnimationFrame(frame);
    void getComputedStyle(btn).height; // flush styles so the height transition exists
    const resize = btn
      .getAnimations()
      .find(
        (a): a is CSSTransition =>
          a instanceof CSSTransition && a.transitionProperty === "height",
      );
    if (!resize) {
      row!.scrollLeft = centeredScroll(btn);
      return;
    }
    const [from, to] = (resize.effect as KeyframeEffect)
      .getKeyframes()
      .map((k) => parseFloat(String(k.height)));
    const offset = centeredScroll(btn) - row!.scrollLeft;
    const step = () => {
      const h = btn.getBoundingClientRect().height;
      const progress = to === from ? 1 : (h - from) / (to - from);
      row!.scrollLeft = centeredScroll(btn) - offset * (1 - progress);
      if (resize.playState !== "finished" && resize.playState !== "idle")
        frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  }

  toggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const opening = btn.getAttribute("aria-pressed") !== "true";
      toggles.forEach((other) => {
        if (other !== btn && other.getAttribute("aria-pressed") === "true")
          setOpen(other, false);
      });
      setOpen(btn, opening);
      follow(btn);
    });
  });

  root.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = toggles.find((b) => b.getAttribute("aria-pressed") === "true");
    if (!open) return;
    setOpen(open, false);
    follow(open);
  });

  // Letting the visitor take over mid-animation feels better than fighting their scroll.
  for (const type of ["pointerdown", "touchstart"])
    row.addEventListener(type, () => cancelAnimationFrame(frame), {
      passive: true,
    });

  // A mouse wheel only scrolls vertically, so turn it into horizontal movement.
  row.addEventListener(
    "wheel",
    (e) => {
      cancelAnimationFrame(frame);
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      row.scrollLeft += e.deltaY;
    },
    { passive: false },
  );
}
