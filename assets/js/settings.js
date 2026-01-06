const select = document.getElementById("themeSelect");
if (select) {
  const saved = localStorage.getItem("theme") || "paper";
  document.body.className = "theme-" + saved;
  select.value = saved;

  select.onchange = e => {
    document.body.className = "theme-" + e.target.value;
    localStorage.setItem("theme", e.target.value);
  };
}