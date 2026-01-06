(() => {
  const reader = document.getElementById("reader");
  if (!reader) return;

  const params = new URLSearchParams(location.search);
  const bookPath = params.get("path");
  if (!bookPath) return;

  function key() {
    const chapter = document
      .querySelector("#tocList li.active")
      ?.textContent || "chapter";
    return `resume:${bookPath}:${chapter}`;
  }

  function restore() {
    const y = localStorage.getItem(key());
    if (y) {
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(y, 10));
      });
    }
  }

  function save() {
    localStorage.setItem(key(), window.scrollY);
  }

  window.addEventListener("scroll", () => {
    window.requestIdleCallback(save);
  });

  window.addEventListener("beforeunload", save);

  document.addEventListener("chapter:loaded", restore);
})();