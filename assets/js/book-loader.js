(() => {
  const reader = document.getElementById("reader");
  const bookTitle = document.getElementById("bookTitle");
  const tocList = document.getElementById("tocList");
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");

  const params = new URLSearchParams(location.search);
  const bookPath = params.get("path");

  if (!reader || !bookPath) {
    if (reader) reader.innerHTML = "<p>📕 Buku tidak ditemukan.</p>";
    return;
  }

  let chapters = [];
  let currentChapter = 0;
  let isLoading = false;

  /* ========================
     LOAD BOOK METADATA
  ======================== */
  fetch(`${bookPath}/book.json`)
    .then(r => {
      if (!r.ok) throw new Error("Book.json not found");
      return r.json();
    })
    .then(book => {
      bookTitle.textContent = book.title || "Tanpa Judul";
      chapters = book.chapters || [];
      buildTOC();
      loadChapter(0);
    })
    .catch(err => {
      console.error(err);
      reader.innerHTML = "<p>📕 Gagal memuat buku.</p>";
    });

  /* ========================
     BUILD TOC
  ======================== */
  function buildTOC() {
    tocList.innerHTML = "";

    chapters.forEach((ch, i) => {
      const li = document.createElement("li");
      li.textContent = ch.title || `Bab ${i + 1}`;
      li.onclick = () => loadChapter(i);
      tocList.appendChild(li);
    });
  }

  /* ========================
     LOAD HTML CHAPTER
  ======================== */
  function loadChapter(index) {
    if (isLoading) return;

    const ch = chapters[index];
    if (!ch) return;

    isLoading = true;
    currentChapter = index;

    fetch(`${bookPath}/${ch.file}`)
      .then(r => {
        if (!r.ok) throw new Error("Chapter not found");
        return r.text();
      })
      .then(html => {
        // reset scroll
        window.scrollTo({ top: 0, behavior: "instant" });

        // render langsung HTML (ringan & cepat)
        reader.innerHTML = html;

        updateProgress();
      })
      .catch(err => {
        console.error(err);
        reader.innerHTML = "<p>⚠️ Gagal memuat bab.</p>";
      })
      .finally(() => {
        isLoading = false;
      });
  }

  /* ========================
     PROGRESS BAR
  ======================== */
  function updateProgress() {
    if (!chapters.length) return;

    const percent = Math.round(
      ((currentChapter + 1) / chapters.length) * 100
    );

    if (progressText) progressText.textContent = percent + "%";
    if (progressBar) progressBar.style.width = percent + "%";
  }

  /* ========================
     SWIPE NAVIGATION
  ======================== */
  let startX = 0;
  let startY = 0;

  reader.addEventListener("touchstart", e => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
  });

  reader.addEventListener("touchend", e => {
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    // horizontal swipe only
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0 && currentChapter < chapters.length - 1) {
        loadChapter(currentChapter + 1);
      } else if (dx > 0 && currentChapter > 0) {
        loadChapter(currentChapter - 1);
      }
    }
  });
})();