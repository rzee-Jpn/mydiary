window.updateProgress = (i, total) => {
  const p = Math.round(((i + 1) / total) * 100);
  document.getElementById("progressText").textContent = p + "%";
  document.getElementById("progressBar").style.width = p + "%";
};