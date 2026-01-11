const catalogEl = document.getElementById("catalog");
const searchInput = document.getElementById("bookSearch");
const searchToggle = document.getElementById("searchToggle");
const searchWrapper = document.querySelector(".search-wrapper");

let BOOKS = [];
const HOME_LIMIT = 8;

/* =============================
   UTIL
============================= */
const byDateDesc = (a, b) => new Date(b.created) - new Date(a.created);
const byViewsDesc = (a, b) => (b.views || 0) - (a.views || 0);

/* =============================
   COVER
============================= */
function generateSVGCover(title) {
  const text = title.slice(0, 28);
  return `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600">
      <rect width="100%" height="100%" fill="#2b2b2b"/>
      <text x="50%" y="50%" fill="#eee" font-size="28"
        text-anchor="middle" dominant-baseline="middle"
        font-family="Georgia">${text}</text>
    </svg>
  `)}`;
}

async function detectCover(book) {
  const files = ["cover.jpg", "cover.png"];
  for (const f of files) {
    try {
      const r = await fetch(`${book.path}/${f}`, { method: "HEAD" });
      if (r.ok) return `${book.path}/${f}`;
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
    BOOKS = data.filter(b => b.status === "published");

    renderCatalog(BOOKS.sort(byDateDesc).slice(0, HOME_LIMIT));
    renderWeeklyTop();
    renderCategories();
  });

/* =============================
   SEARCH
============================= */
searchToggle.onclick = () => {
  searchWrapper.classList.toggle("active");
  if (!searchWrapper.classList.contains("active")) {
    searchInput.value = "";
    renderCatalog(BOOKS.sort(byDateDesc).slice(0, HOME_LIMIT));
  }
};

searchInput.oninput = e => {
  const q = e.target.value.toLowerCase();
  const res = BOOKS.filter(b =>
    b.title.toLowerCase().includes(q) ||
    (b.author || "").toLowerCase().includes(q)
  );
  renderCatalog(res.slice(0, HOME_LIMIT));
};

/* =============================
   RENDER GRID
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
        <img src="${cover}">
      </div>
      <div class="catalog-info">
        <span class="catalog-tag">BOOK</span>
        <h3>${book.title}</h3>
        <small>${book.author || "Anonim"}</small>
        <div class="catalog-meta">${(book.categories || []).join(", ")}</div>
      </div>
    `;
    catalogEl.appendChild(el);
  }
}

/* =============================
   🔥 POPULAR
============================= */
function renderWeeklyTop() {
  const slider = document.getElementById("weeklySlider");
  if (!slider) return;

  const top = [...BOOKS].sort(byViewsDesc).slice(0, 5);
  slider.innerHTML = "";

  top.forEach(b => {
    const el = document.createElement("div");
    el.className = "weekly-item";
    el.innerHTML = `<h4>${b.title}</h4>`;
    el.onclick = () =>
      location.href = `reader.html?path=${encodeURIComponent(b.path)}`;
    slider.appendChild(el);
  });
}

/* =============================
   📂 CATEGORIES
============================= */
function renderCategories() {
  const wrap = document.getElementById("categoryTabs");
  if (!wrap) return;

  const cats = new Set();
  BOOKS.forEach(b => (b.categories || []).forEach(c => cats.add(c)));

  wrap.innerHTML = `<button>Semua</button>`;
  wrap.firstChild.onclick = () =>
    renderCatalog(BOOKS.sort(byDateDesc).slice(0, HOME_LIMIT));

  [...cats].sort().forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.onclick = () =>
      renderCatalog(
        BOOKS.filter(b => (b.categories || []).includes(cat)).slice(0, HOME_LIMIT)
      );
    wrap.appendChild(btn);
  });
}