/* ─── RESUME — Save & restore scroll per chapter ─── */
(() => {
  const reader = document.getElementById('reader');
  if (!reader) return;

  const bookPath = new URLSearchParams(location.search).get('path');
  if (!bookPath) return;

  function scrollKey() {
    const idx = typeof window.__getChapterIndex === 'function'
      ? window.__getChapterIndex()
      : 0;
    return `resume_scroll:${bookPath}:${idx}`;
  }

  function save() {
    try { localStorage.setItem(scrollKey(), window.scrollY); } catch { /* */ }
  }

  function restore() {
    try {
      const y = parseInt(localStorage.getItem(scrollKey()), 10);
      if (y > 0) requestAnimationFrame(() => window.scrollTo(0, y));
    } catch { /* */ }
  }

  // Save on scroll (throttled) and before leaving
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestIdleCallback
        ? window.requestIdleCallback(save)
        : setTimeout(save, 200);
      ticking = true;
      setTimeout(() => { ticking = false; }, 200);
    }
  });

  window.addEventListener('beforeunload', save);
  document.addEventListener('chapter:loaded', restore);
})();
