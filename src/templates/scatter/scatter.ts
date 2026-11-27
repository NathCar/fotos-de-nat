export function initScatter(root: HTMLElement): void {
  const items = root.querySelectorAll<HTMLElement>(".item");
  if (!("IntersectionObserver" in window) || items.length === 0) return;

  root.dataset.enhanced = "";
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }
    },
    { root, rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
  );
  items.forEach((item) => observer.observe(item));
}
