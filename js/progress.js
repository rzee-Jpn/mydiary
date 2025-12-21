window.addEventListener("scroll", () => {
  const doc = document.documentElement;
  const percent = Math.round(
    (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100
  );
  document.getElementById("progressText").textContent = percent + "%";
  document.getElementById("progressBar").style.width = percent + "%";
});