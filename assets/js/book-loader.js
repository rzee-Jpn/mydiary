(() => {
  const reader = document.getElementById("reader");
  const bookTitle = document.getElementById("bookTitle");
  const tocList = document.getElementById("tocList");
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");

  const params = new URLSearchParams(location.search);
  const bookId = params.get("book");
  const bookPath = params.get("path");

  if (!bookPath) {
    reader.innerHTML = "<p>📕 Buku tidak ditemukan.</p>";
    return;
  }

  let chapters = [];
  let currentChapter = 0;

  // ========================
  // LOAD BOOK METADATA
  // ========================
  fetch(`${bookPath}/book.json`)
    .then(r => r.json())
    .then(book => {
      bookTitle.textContent = book.title || "Tanpa Judul";
      chapters = book.chapters || [];
      buildTOC(chapters);
      loadChapter(0);
    })
    .catch(err => {
      console.error(err);
      reader.innerHTML = "<p>📕 Gagal memuat buku.</p>";
    });

  // ========================
  // BUILD TOC
  // ========================
  function buildTOC(chapters) {
    tocList.innerHTML = "";
    chapters.forEach((ch, i) => {
      const li = document.createElement("li");
      li.textContent = ch.title || `Bab ${i + 1}`;
      li.addEventListener("click", () => loadChapter(i));
      tocList.appendChild(li);
    });
  }

  // ========================
  // LOAD CHAPTER
  // ========================
  function loadChapter(index) {
    const ch = chapters[index];
    if (!ch) return;

    currentChapter = index;

    fetch(`${bookPath}/${ch.file}`)
      .then(r => r.json())
      .then(data => {
        gsap.fromTo(
          reader,
          { x: index > currentChapter ? 300 : -300, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
        );

        reader.innerHTML = `<h2>${data.title}</h2>`;

        data.content.forEach(pText => {
          const p = document.createElement("p");
          p.textContent = pText;
          reader.appendChild(p);
        });

        const divider = document.createElement("div");
        divider.className = "chapter-divider";
        divider.textContent = "●";
        reader.appendChild(divider);

        updateProgress();
      });
  }

  // ========================
  // PROGRESS
  // ========================
  function updateProgress() {
    const paras = reader.querySelectorAll("p");
    const percent = paras.length
      ? Math.round(((currentChapter + 1) / chapters.length) * 100)
      : 0;

    if (progressText) progressText.textContent = percent + "%";
    if (progressBar) progressBar.style.width = percent + "%";
  }

  // ========================
  // SWIPE NAVIGATION
  // ========================
  let startX = 0, startY = 0;

  reader.addEventListener("touchstart", e => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
  });

  reader.addEventListener("touchend", e => {
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0 && currentChapter < chapters.length - 1) {
        loadChapter(currentChapter + 1);
      } else if (dx > 0 && currentChapter > 0) {
        loadChapter(currentChapter - 1);
      }
    }
  });
})();