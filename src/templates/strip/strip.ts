export function initStrip(root: HTMLElement): void {
  const row = root.querySelector<HTMLElement>("[data-row]");
  if (!row) return;
  const toggles = Array.from(
    row.querySelectorAll<HTMLButtonElement>("button[aria-pressed]"),
  );
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  function reveal(btn: HTMLButtonElement): void {
    btn.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: reduced ? "auto" : "smooth",
    });
  }

  toggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const opening = btn.getAttribute("aria-pressed") !== "true";
      toggles.forEach((other) => {
        if (other !== btn && other.getAttribute("aria-pressed") === "true")
          setOpen(other, false);
      });
      setOpen(btn, opening);
      if (!opening) return;
      if (reduced) reveal(btn);
      else
        btn.addEventListener(
          "transitionend",
          (e) => e.propertyName === "height" && reveal(btn),
          { once: true },
        );
    });
  });

  root.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    toggles.forEach((btn) => setOpen(btn, false));
  });

  // A mouse wheel only scrolls vertically, so turn it into horizontal movement.
  row.addEventListener(
    "wheel",
    (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      row.scrollLeft += e.deltaY;
    },
    { passive: false },
  );
}
