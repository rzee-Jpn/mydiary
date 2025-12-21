(() => {
  const reader = document.getElementById("reader");
  const bookTitle = document.getElementById("bookTitle");
  const tocList = document.getElementById("tocList");
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");

  let chapters = [];
  let currentChapter = 0;
  let currentPara = 0;

  // Fetch buku
  fetch("data/books/naskah-kuno-demo/book.json")
    .then(r => r.json())
    .then(book => {
      bookTitle.textContent = book.title || "Tanpa Judul";
      chapters = book.chapters || [];
      buildTOC(chapters);
      loadChapter(0);
    })
    .catch(err => {
      reader.innerHTML = "<p>📕 Gagal memuat buku.</p>";
      console.error(err);
    });

  // Build daftar bab
  function buildTOC(chapters) {
    tocList.innerHTML = "";
    chapters.forEach((ch, i) => {
      const li = document.createElement("li");
      li.textContent = ch.title || `Bab ${i + 1}`;
      li.addEventListener("click", () => loadChapter(i));
      tocList.appendChild(li);
    });
  }

  // Load bab
  function loadChapter(index) {
    const ch = chapters[index];
    if (!ch) return;

    currentChapter = index;
    currentPara = 0;

    // Animasi masuk bab
    gsap.fromTo(reader,
      { x: index > currentChapter ? 300 : -300, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
    );

    reader.innerHTML = `<h2>${ch.title}</h2>`;
    ch.content.forEach(t => {
      const p = document.createElement("p");
      p.textContent = t;
      reader.appendChild(p);
    });

    // Divider
    const divider = document.createElement("div");
    divider.className = "chapter-divider";
    divider.textContent = "●";
    reader.appendChild(divider);

    updateProgress();
  }

  // Update progress
  function updateProgress() {
    const paras = reader.querySelectorAll("p");
    const percent = paras.length
      ? Math.round(((currentPara + 1) / paras.length) * 100)
      : 0;

    if (progressText) progressText.textContent = percent + "%";
    if (progressBar) progressBar.style.width = percent + "%";
  }

  // =========================
  // Swipe kiri/kanan untuk pindah bab
  // =========================
  let startX = 0;
  let startY = 0;

  reader.addEventListener("touchstart", e => {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
  });

  reader.addEventListener("touchend", e => {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        // swipe kiri → bab selanjutnya
        if (currentChapter < chapters.length - 1) loadChapter(currentChapter + 1);
      } else {
        // swipe kanan → bab sebelumnya
        if (currentChapter > 0) loadChapter(currentChapter - 1);
      }
    }
  });

})();