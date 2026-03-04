/* ─── READER CORE ─── */
(() => {
  const reader    = document.getElementById('reader');
  const tocList   = document.getElementById('tocList');
  const bookTitle = document.getElementById('bookTitle');
  const hdrTitle  = document.getElementById('headerBookTitle');

  const path = new URLSearchParams(location.search).get('path');
  if (!path) {
    reader.innerHTML = '<p style="padding:2rem;opacity:.6">Path buku tidak ditemukan.</p>';
    return;
  }

  let chapters = [];
  let current  = -1;

  /* ─── LOAD BOOK MANIFEST ─── */
  fetch(`${path}/book.json`)
    .then(r => {
      if (!r.ok) throw new Error('book.json not found');
      return r.json();
    })
    .then(book => {
      // Update titles
      const title = book.title || 'Tanpa Judul';
      if (bookTitle) bookTitle.textContent = title;
      if (hdrTitle)  hdrTitle.textContent  = title;
      document.title = `${title} — Pustaka`;

      chapters = book.chapters || [];

      // Build TOC
      tocList.innerHTML = '';
      chapters.forEach((ch, i) => {
        const li = document.createElement('li');
        li.textContent = ch.title || `Bab ${i + 1}`;
        li.dataset.index = i;
        li.addEventListener('click', () => loadChapter(i));
        tocList.appendChild(li);
      });

    // Load saved or first chapter
      const saved = getSavedChapter();
      loadChapter(saved >= 0 && saved < chapters.length ? saved : 0);

      // Next chapter button on scroll bottom
      initNextChapterBtn();
    })
    .catch(err => {
      reader.innerHTML = `<div style="padding:2rem;opacity:.6">
        <p>Gagal memuat buku.</p>
        <p style="font-size:.85rem;margin-top:.5rem">${err.message}</p>
      </div>`;
    });

  /* ─── LOAD CHAPTER ─── */
  function loadChapter(i) {
    if (i < 0 || i >= chapters.length) return;
    current = i;

    // Update active in TOC
    tocList.querySelectorAll('li').forEach((li, idx) => {
      li.classList.toggle('active', idx === i);
    });

    // Scroll TOC item into view (sidebar)
    const activeLi = tocList.querySelector('li.active');
    if (activeLi) activeLi.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

    // Save progress
    saveChapter(i);

    fetch(`${path}/${chapters[i].file}`)
      .then(r => {
        if (!r.ok) throw new Error(`File tidak ditemukan: ${chapters[i].file}`);
        return r.text();
      })
      .then(html => {
        reader.innerHTML = html;
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.dispatchEvent(new CustomEvent('chapter:loaded', { detail: { index: i, total: chapters.length } }));
        updateProgress(i, chapters.length);

        // Optional: close sidebar after selecting chapter (mobile UX)
        if (window.innerWidth < 768 && typeof window.closeSidebar === 'function') {
          window.closeSidebar();
        }
      })
      .catch(err => {
        reader.innerHTML = `<p style="padding:2rem;opacity:.6">Gagal memuat bab: ${err.message}</p>`;
      });
  }

  /* ─── PERSISTENCE HELPERS ─── */
  function storageKey() {
    return `reader_chapter:${path}`;
  }

  function saveChapter(i) {
    try { localStorage.setItem(storageKey(), i); } catch { /* private mode */ }
  }

  function getSavedChapter() {
    try { return parseInt(localStorage.getItem(storageKey()), 10); } catch { return -1; }
  }

  /* ─── NEXT CHAPTER BUTTON ON SCROLL BOTTOM ─── */
  function initNextChapterBtn() {
    const btn = document.getElementById('nextChapterBtn');
    if (!btn) return;

    let visible = false;

    function setVisible(show) {
      if (show === visible) return;
      visible = show;
      btn.classList.toggle('show', show);
    }

    function checkScroll() {
      const nearBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 80;
      const hasNext = current < chapters.length - 1;
      setVisible(nearBottom && hasNext);
    }

    window.addEventListener('scroll', checkScroll, { passive: true });

    btn.addEventListener('click', () => {
      if (current < chapters.length - 1) {
        loadChapter(current + 1);
        setVisible(false);
      }
    });

    // Re-check after each chapter load
    document.addEventListener('chapter:loaded', () => {
      setVisible(false);
      setTimeout(checkScroll, 400);
    });
  }

  /* ─── EXPOSE FOR OTHER MODULES ─── */
  window.__getChapterIndex = () => current;
  window.__getChapters     = () => chapters;
  window.__loadChapter     = loadChapter;
})();
