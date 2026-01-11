const catalogEl = document.getElementById("catalog");
const searchInput = document.getElementById("bookSearch");
const searchToggle = document.getElementById("searchToggle");
const searchWrapper = document.querySelector(".search-wrapper");

let BOOKS = [];
const HOME_LIMIT = 12;

/* =============================
   SVG COVER (fallback)
============================= */
function generateSVGCover(title) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600">
    <rect width="100%" height="100%" rx="24" fill="#2b2418"/>
    <text x="50%" y="50%" fill="#f5f1ea"
      font-size="30"
      font-family="Georgia, serif"
      text-anchor="middle"
      dominant-baseline="middle">
      ${title}
    </text>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
}

async function detectCover(book) {
  try {
    const res = await fetch(`${book.path}/cover.jpg`, { method: "HEAD" });
    if (res.ok) return `${book.path}/cover.jpg`;
  } catch {}
  return generateSVGCover(book.title);
}

/* =============================
   LOAD
============================= */
fetch("data/library.json")
  .then(r => r.json())
  .then(data => {
    BOOKS = data.sort((a,b)=>new Date(b.created)-new Date(a.created));
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
    (b.tags || []).join(" ").includes(q) ||
    (b.author || "").toLowerCase().includes(q)
  );
  renderCatalog(result);
};

/* =============================
   RENDER
============================= */
async function renderCatalog(items) {
  catalogEl.innerHTML = "";

  for (const book of items) {
    const cover = await detectCover(book);

    const el = document.createElement("a");
    el.href = `reader.html?path=${encodeURIComponent(book.path)}`;
    el.className = "catalog-item";

    el.innerHTML = `
      <div class="catalog-thumb">
        <img src="${cover}" loading="lazy">
      </div>
      <div class="catalog-info">
        <h3>${book.title}</h3>
        <small>${book.author || "Unknown"}</small>
        <div class="catalog-meta">
          ${book.reading_level} · ${book.length}
        </div>
        <div class="badges">
          ${(book.tags||[]).slice(0,3).map(t=>`<span class="badge">${t}</span>`).join("")}
        </div>
      </div>
    `;
    catalogEl.appendChild(el);
  }
}