const catalogEl = document.getElementById("catalog");
const searchInput = document.getElementById("bookSearch");
const searchToggle = document.getElementById("searchToggle");
const searchWrapper = document.querySelector(".search-wrapper");

let BOOKS = [];
const HOME_LIMIT = 8;

/* =============================
   SVG COVER (AUTO WRAP)
============================= */
function generateSVGCover(title) {
  const words = (title || "").split(" ");
  const lines = [];
  let line = "";

  words.forEach(w => {
    if ((line + " " + w).length > 16) {
      lines.push(line);
      line = w;
    } else {
      line += (line ? " " : "") + w;
    }
  });
  if (line) lines.push(line);

  const text = lines.slice(0, 4)
    .map((l, i) =>
      `<tspan x="200" dy="${i === 0 ? 0 : 36}">${l}</tspan>`
    ).join("");

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2a2a2a"/>
        <stop offset="100%" stop-color="#111"/>
      </linearGradient>
    </defs>
    <rect width="400" height="600" rx="24" fill="url(#g)"/>
    <text x="200" y="240"
      fill="#f5f5f5"
      font-size="30"
      font-family="Georgia, serif"
      text-anchor="middle">
      ${text}
    </text>
  </svg>`;

  return "data:image/svg+xml;base64," +
    btoa(unescape(encodeURIComponent(svg)));
}

/* =============================
   COVER DETECTION
============================= */
async function detectCover(book) {
  const files = ["cover.jpg", "cover.png", "thumbnail.jpg"];
  for (const f of files) {
    try {
      const res = await fetch(`${book.path}/${f}`, { method: "HEAD" });
      if (res.ok) return `${book.path}/${f}`;
    } catch {}
  }
  return generateSVGCover(book.title);
}

/* =============================
   LOAD DATA
============================= */
fetch("data/library.json")
  .then(r => r.json())
  .then(data => {
    BOOKS = data
      .filter(b => b.status === "published")
      .sort((a, b) => new Date(b.created) - new Date(a.created));

    renderCatalog(BOOKS.slice(0, HOME_LIMIT));
  });

/* =============================
   SEARCH
============================= */
searchToggle.onclick = () => {
  searchWrapper.classList.toggle("active");
  if (!searchWrapper.classList.contains("active")) {
    searchInput.value = "";
    renderCatalog(BOOKS.slice(0, HOME_LIMIT));
  }
};

searchInput.oninput = e => {
  const q = e.target.value.toLowerCase();
  const result = BOOKS.filter(b =>
    b.title.toLowerCase().includes(q) ||
    (b.author || "").toLowerCase().includes(q)
  );
  renderCatalog(result.slice(0, HOME_LIMIT));
};

/* =============================
   RENDER
============================= */
async function renderCatalog(items) {
  catalogEl.innerHTML = "";

  for (const book of items) {
    const cover = await detectCover(book);

    const a = document.createElement("a");
    a.href = `reader.html?path=${encodeURIComponent(book.path)}`;
    a.className = "catalog-item";

    a.innerHTML = `
      <div class="catalog-thumb">
        <img src="${cover}">
      </div>
      <div class="catalog-info">
        <span class="catalog-tag">BOOK</span>
        <h3>${book.title}</h3>
        <small>${book.author || "Anonim"}</small>
        <div class="catalog-meta">
          ${(book.categories || []).join(", ")}
        </div>
      </div>
    `;

    catalogEl.appendChild(a);
  }
}