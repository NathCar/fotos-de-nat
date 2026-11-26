const isPhoto = (t: EventTarget | null) =>
  t instanceof HTMLElement && t.closest("[data-protected]");

for (const type of ["contextmenu", "dragstart"]) {
  document.addEventListener(type, (e) => {
    if (isPhoto(e.target)) e.preventDefault();
  });
}
