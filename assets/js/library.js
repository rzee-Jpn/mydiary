const library = document.getElementById("library");
const searchInput = document.getElementById("bookSearch");
const searchToggle = document.getElementById("searchToggle");
const wrapper = document.querySelector(".search-wrapper");

let ALL_BOOKS = [];

/* ===== SVG COVER GENERATOR (PALING AMAN) ===== */
function generateSVGCover(title) {
  const safeText = title.substring(0, 150);

  let fontSize = 28;
  if (safeText.length > 40) fontSize = 22;
  if (safeText.length > 80) fontSize = 18;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg"
       width="400" height="600"
       viewBox="0 0 400 600"
       preserveAspectRatio="xMidYMid meet">

    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#111"/>
        <stop offset="100%" stop-color="#333"/>
      </linearGradient>
    </defs>

    <rect width="400" height="600" fill="url(#g)"/>

    <foreignObject x="40" y="160" width="320" height="280">
      <div xmlns="http://www.w3.org/1999/xhtml"
        style="
          color:#f2f2f2;
          font-family:serif;
          font-size:${fontSize}px;
          line-height:1.3;
          text-align:center;
          word-wrap:break-word;
          overflow-wrap:break-word;
        ">
        ${safeText}
      </div>
    </foreignObject>
  </svg>`;

  return "data:image/svg+xml;base64," +
    btoa(unescape(encodeURIComponent(svg)));
}

/* ===== AUTO COVER DETECT ===== */
async function detectCover(book) {
  const files = ["cover.jpg", "cover.png", "thumbnail.jpg", "thumbnail.png"];

  for (const f of files) {
    try {
      const res = await fetch(`${book.path}/${f}`, { method: "HEAD" });
      if (res.ok) return `${book.path}/${f}`;
    } catch (_) {}
  }

  return generateSVGCover(book.title);
}

/* ===== LOAD DATA ===== */
fetch("data/library.json")
  .then(r => r.json())
  .then(data => {
    ALL_BOOKS = data;
    render(data);
  });

/* ===== SEARCH ===== */
searchToggle.onclick = () => {
  wrapper.classList.toggle("active");
  if (!wrapper.classList.contains("active")) {
    searchInput.value = "";
    render(ALL_BOOKS);
  }
};

searchInput.oninput = e => {
  const q = e.target.value.toLowerCase();
  render(
    ALL_BOOKS.filter(b =>
      b.title.toLowerCase().includes(q) ||
      (b.author || "").toLowerCase().includes(q)
    )
  );
};

/* ===== RENDER ===== */
async function render(books) {
  library.innerHTML = "";

  for (let i = 0; i < books.length; i++) {
    const b = books[i];
    const cover = await detectCover(b);

    const a = document.createElement("a");
    a.href = `reader.html?path=${encodeURIComponent(b.path)}`;
    a.className = "book-card";

    a.innerHTML = `
      <div class="book-cover">
        <img src="${cover}" alt="${b.title}">
      </div>
      <h3 title="${b.title}">${b.title}</h3>
      <small>${b.author || "Anonim"}</small>
    `;

    library.appendChild(a);

    gsap.from(a, {
      opacity: 0,
      y: 20,
      duration: 0.35,
      delay: i * 0.03
    });
  }
}