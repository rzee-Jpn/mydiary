(() => {
  const reader = document.getElementById("reader");
  const bookTitle = document.getElementById("bookTitle");
  const tocList = document.getElementById("tocList");
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");

  const params = new URLSearchParams(location.search);
  const bookPath = params.get("path");

  if (!bookPath) {
    reader.innerHTML = "<p>📕 Buku tidak ditemukan.</p>";
    return;
  }

  let chapters = [];
  let currentChapter = 0;

  // ========================
  // LOAD BOOK
  // ========================
  fetch(`${bookPath}/book.json`)
    .then(r => r.json())
    .then(book => {
      bookTitle.textContent = book.title || "Tanpa Judul";
      chapters = book.chapters || [];
      buildTOC();
      loadChapter(0);
    });

  // ========================
  // TOC
  // ========================
  function buildTOC() {
    tocList.innerHTML = "";
    chapters.forEach((ch, i) => {
      const li = document.createElement("li");
      li.textContent = ch.title;
      li.onclick = () => loadChapter(i);
      tocList.appendChild(li);
    });
  }

  // ========================
  // LOAD HTML CHAPTER
  // ========================
  function loadChapter(index) {
    const ch = chapters[index];
    if (!ch) return;

    currentChapter = index;

    fetch(`${bookPath}/${ch.file}`)
      .then(r => r.text())
      .then(html => {
        reader.innerHTML = html;
        updateProgress();
      });
  }

  // ========================
  // PROGRESS
  // ========================
  function updateProgress() {
    const percent = Math.round(((currentChapter + 1) / chapters.length) * 100);
    progressText.textContent = percent + "%";
    progressBar.style.width = percent + "%";
  }

  // ========================
  // SWIPE
  // ========================
  let sx = 0, sy = 0;

  reader.addEventListener("touchstart", e => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  });

  reader.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0 && currentChapter < chapters.length - 1)
        loadChapter(currentChapter + 1);
      if (dx > 0 && currentChapter > 0)
        loadChapter(currentChapter - 1);
    }
  });
})();