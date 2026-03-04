window.updateProgress = (i, total) => {
  const p = Math.round(((i + 1) / total) * 100);
  const bar  = document.getElementById("progressBar");
  const text = document.getElementById("progressText");
  if (bar)  bar.style.width = p + "%";
  if (text) text.textContent = p + "%";
};
