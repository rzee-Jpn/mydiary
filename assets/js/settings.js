/* ─── SETTINGS — Theme ─── */
(() => {
  const THEMES  = ['light', 'dark', 'sepia', 'paper'];
  const saved   = localStorage.getItem('reader_theme') || 'paper';
  const validTheme = THEMES.includes(saved) ? saved : 'paper';

  function applyTheme(t) {
    document.body.className = `theme-${t}`;
    localStorage.setItem('reader_theme', t);
    document.querySelectorAll('.theme-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.theme === t);
    });
  }

  applyTheme(validTheme);

  document.querySelectorAll('.theme-chip').forEach(chip => {
    chip.addEventListener('click', () => applyTheme(chip.dataset.theme));
  });
})();
