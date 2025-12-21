const themeSelect = document.getElementById("themeSelect");

function applyTheme(theme) {
  document.body.classList.remove(
    "theme-light",
    "theme-dark",
    "theme-sepia",
    "theme-paper"
  );
  document.body.classList.add(`theme-${theme}`);
  localStorage.setItem("theme", theme);
}

themeSelect.addEventListener("change", e => {
  applyTheme(e.target.value);
});

// load saved theme
const saved = localStorage.getItem("theme");
if (saved) {
  themeSelect.value = saved;
  applyTheme(saved);
}