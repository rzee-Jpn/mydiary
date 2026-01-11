/* ============================= */
/*  ELEMENT REFERENCES           */
/* ============================= */

const catalogEl = document.getElementById("catalog");
const searchInput = document.getElementById("bookSearch");
const searchToggle = document.getElementById("searchToggle");
const searchWrapper = document.querySelector(".search-wrapper");

let CATALOG_ITEMS = [];

/* ============================= */
/*  SVG PLACEHOLDER COVER        */
/* ============================= */

function generateSVGCover(title) {
  const MAX_CHARS = 28;
  let text = (title || "").trim();

  if (text.length > MAX_CHARS) {
    text = text.substring(0, MAX_CHARS - 1) + "…";
  }

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#2b2b2b"/>
        <stop offset="100%" stop-color="#444"/>
      </linearGradient>
    </defs>
    <rect width="400" height="600" fill="url(#g)"/>
    <text x="200" y="300" fill="#f2f2f2"
      font-size="30" font-family="Georgia, serif"
      text-anchor="middle" dominant-baseline="middle">
      ${text}
    </text>
  </svg>`;

  return "data:image/svg+xml;base64," +
    btoa(unescape(encodeURIComponent(svg)));
}

/* ============================= */
/*  AUTO COVER DETECTION         */
/* ============================= */

async function detectCatalogCover(book) {
  const files = ["cover.jpg", "cover.png", "thumbnail.jpg", "thumbnail.png"];

  for (const f of files) {
    try {
      const res = await fetch(`${book.path}/${f}`, { method: "HEAD" });
      if (res.ok) return `${book.path}/${f}`;
    } catch (_) {}
  }
  return generateSVGCover(book.title);
}

/* ============================= */
/*  LOAD DATA                    */
/* ============================= */

fetch("data/library.json")
  .then(res => res.json())
  .then(data => {
    CATALOG_ITEMS = data;

    // sort terbaru
    CATALOG_ITEMS.sort(
      (a, b) => new Date(b.created) - new Date(a.created)
    );

    renderWeeklyTop();
    renderLatestBooks();
    renderCategories();

    // default tampil 8 terbaru
    renderCatalog(CATALOG_ITEMS.slice(0, 8));
  });

/* ============================= */
/*  SEARCH                       */
/* ============================= */

if (searchToggle) {
  searchToggle.onclick = () => {
    searchWrapper.classList.toggle("active");
    if (!searchWrapper.classList.contains("active")) {
      searchInput.value = "";
      renderCatalog(CATALOG_ITEMS.slice(0, 8));
    }
  };
}

if (searchInput) {
  searchInput.oninput = e => {
    const q = e.target.value.toLowerCase();

    const result = CATALOG_ITEMS.filter(b =>
      b.title.toLowerCase().includes(q) ||
      (b.author || "").toLowerCase().includes(q)
    );

    renderCatalog(result.slice(0, 8));
  };
}

/* ============================= */
/*  RENDER CATALOG (BOTTOM)      */
/* ============================= */

async function renderCatalog(items) {
  catalogEl.innerHTML = "";

  for (let i = 0; i < items.length; i++) {
    const book = items[i];
    const cover = await detectCatalogCover(book);

    const link = document.createElement("a");
    link.href = `reader.html?path=${encodeURIComponent(book.path)}`;
    link.className = "catalog-item";

    link.onclick = () => countBookView(book.id);

    link.innerHTML = `
      <div class="catalog-thumb">
        <img src="${cover}">
      </div>
      <div class="catalog-info">
        <span class="catalog-tag">BOOK</span>
        <h3>${book.title}</h3>
        <small>${book.author || "Anonim"}</small>
        <div class="catalog-meta">
          ${(book.bookshelves || []).slice(0, 2).join(", ")}
        </div>
      </div>
    `;

    catalogEl.appendChild(link);

    if (window.gsap) {
      gsap.from(link, {
        opacity: 0,
        y: 18,
        duration: 0.35,
        delay: i * 0.03,
        ease: "power2.out"
      });
    }
  }
}

/* ============================= */
/*  🔥 TOP WEEKLY SLIDER         */
/* ============================= */

function getBookWeeklyViews(id) {
  const data = JSON.parse(localStorage.getItem("bookViews") || "{}");
  return data[id] || 0;
}

function countBookView(id) {
  const data = JSON.parse(localStorage.getItem("bookViews") || "{}");
  data[id] = (data[id] || 0) + 1;
  localStorage.setItem("bookViews", JSON.stringify(data));
}

async function renderWeeklyTop() {
  const slider = document.getElementById("weeklySlider");
  if (!slider) return;

  const top = [...CATALOG_ITEMS]
    .sort((a, b) => getBookWeeklyViews(b.id) - getBookWeeklyViews(a.id))
    .slice(0, 5);

  slider.innerHTML = "";

  for (const book of top) {
    const cover = await detectCatalogCover(book);

    const item = document.createElement("div");
    item.className = "weekly-item";
    item.innerHTML = `
      <img src="${cover}">
      <h4>${book.title}</h4>
    `;

    item.onclick = () => {
      countBookView(book.id);
      location.href = `reader.html?path=${encodeURIComponent(book.path)}`;
    };

    slider.appendChild(item);
  }
}

/* ============================= */
/*  📚 LATEST BOOKS              */
/* ============================= */

let latestPage = 1;
const LATEST_PER_PAGE = 8;

async function renderLatestBooks() {
  const grid = document.getElementById("latestCatalog");
  if (!grid) return;

  const start = (latestPage - 1) * LATEST_PER_PAGE;
  const pageItems = CATALOG_ITEMS.slice(start, start + LATEST_PER_PAGE);

  grid.innerHTML = "";

  for (const book of pageItems) {
    const cover = await detectCatalogCover(book);

    const el = document.createElement("div");
    el.className = "catalog-item";
    el.innerHTML = `
      <div class="catalog-thumb">
        <img src="${cover}">
      </div>
      <div class="catalog-info">
        <h3>${book.title}</h3>
        <small>${book.author || "Anonim"}</small>
      </div>
    `;

    el.onclick = () => {
      countBookView(book.id);
      location.href = `reader.html?path=${encodeURIComponent(book.path)}`;
    };

    grid.appendChild(el);
  }

  const pageInfo = document.getElementById("pageInfo");
  if (pageInfo) pageInfo.textContent = `Page ${latestPage}`;
}

/* ============================= */
/*  📂 CATEGORY TABS             */
/* ============================= */

function renderCategories() {
  const wrap = document.getElementById("categoryTabs");
  if (!wrap) return;

  const set = new Set();
  CATALOG_ITEMS.forEach(b => {
    (b.bookshelves || []).forEach(cat => set.add(cat));
  });

  const categories = ["Semua", ...Array.from(set).sort()];
  wrap.innerHTML = "";

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;

    btn.onclick = () => {
      let items = [...CATALOG_ITEMS];

      if (cat !== "Semua") {
        items = items.filter(b =>
          (b.bookshelves || []).includes(cat)
        );
      }

      renderCatalog(items.slice(0, 8));
    };

    wrap.appendChild(btn);
  });
}