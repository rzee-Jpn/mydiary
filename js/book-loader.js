const reader = document.getElementById("reader");
const tocList = document.querySelector("#toc ul");
const pageInfo = document.getElementById("pageInfo");

let book = null;
let currentPage = 0;

/* =============================
   DETEKSI BUKU DARI URL
============================= */
const params = new URLSearchParams(location.search);
const BOOK_ID = params.get("book") || "naskah-kuno"; // default buku

/* =============================
   LOAD BOOK.JSON
============================= */
fetch(`data/books/${BOOK_ID}/book.json`)
  .then(res => res.json())
  .then(data => {
    book = data;
    initBook();
  })
  .catch(err => {
    reader.innerHTML = "<p>Gagal memuat buku.</p>";
    console.error(err);
  });

/* =============================
   INIT
============================= */
function initBook() {
  document.title = book.title;
  currentPage = parseInt(localStorage.getItem(`page_${book.id}`)) || 0;
  buildTOC();
  renderPage(currentPage);
}

/* =============================
   BUILD TOC
============================= */
function buildTOC() {
  tocList.innerHTML = "";

  book.chapters
    .sort((a, b) => a.order - b.order)
    .forEach((ch, i) => {
      const li = document.createElement("li");
      li.textContent = ch.title;
      li.onclick = () => {
        currentPage = i;
        renderPage(i);
        localStorage.setItem(`page_${book.id}`, i);
        document.getElementById("toc").classList.remove("show");
      };
      tocList.appendChild(li);
    });
}

/* =============================
   RENDER PAGE
============================= */
function renderPage(index) {
  reader.innerHTML = "";

  const chapter = book.chapters[index];
  if (!chapter) return;

  const h2 = document.createElement("h2");
  h2.textContent = chapter.title;
  reader.appendChild(h2);

  chapter.content.forEach(text => {
    const p = document.createElement("p");
    p.textContent = text;
    reader.appendChild(p);
  });

  pageInfo.textContent = `${index + 1}/${book.chapters.length}`;
  estimateTime(chapter);
  attachTTS();
}

/* =============================
   NAVIGATION
============================= */
document.getElementById("next").onclick = () => {
  if (currentPage < book.chapters.length - 1) {
    currentPage++;
    renderPage(currentPage);
    localStorage.setItem(`page_${book.id}`, currentPage);
  }
};

document.getElementById("prev").onclick = () => {
  if (currentPage > 0) {
    currentPage--;
    renderPage(currentPage);
    localStorage.setItem(`page_${book.id}`, currentPage);
  }
};

/* =============================
   ESTIMATED READING TIME
============================= */
function estimateTime(chapter) {
  const timeBox = document.getElementById("timeLeft");
  if (chapter.estimatedMinutes) {
    timeBox.textContent = `± ${chapter.estimatedMinutes} menit`;
  } else {
    const words = chapter.content.join(" ").split(/\s+/).length;
    timeBox.textContent = `± ${Math.ceil(words / 200)} menit`;
  }
}