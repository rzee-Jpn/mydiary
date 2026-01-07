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
  <svg xmlns="http://www.w3.org/2000/svg"
       width="400" height="600"
       viewBox="0 0 400 600"
       preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#2b2b2b"/>
        <stop offset="100%" stop-color="#444"/>
      </linearGradient>
    </defs>

    <rect width="400" height="600" fill="url(#g)"/>

    <text
      x="200"
      y="300"
      fill="#f2f2f2"
      font-size="30"
      font-family="Georgia, serif"
      text-anchor="middle"
      dominant-baseline="middle"
      letter-spacing=".04em">
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

  // ✅ FIX: fungsi yang benar
  return generateSVGCover(book.title);
}

/* ============================= */
/*  LOAD DATA                    */
/* ============================= */

fetch("data/library.json")
  .then(res => res.json())
  .then(data => {
    CATALOG_ITEMS = data;
    renderCatalog(data);
  });

/* ============================= */
/*  SEARCH TOGGLE                */
/* ============================= */

if (searchToggle) {
  searchToggle.onclick = () => {
    searchWrapper.classList.toggle("active");

    if (!searchWrapper.classList.contains("active")) {
      searchInput.value = "";
      renderCatalog(CATALOG_ITEMS);
    }
  };
}

/* ============================= */
/*  SEARCH FILTER                */
/* ============================= */

if (searchInput) {
  searchInput.oninput = e => {
    const q = e.target.value.toLowerCase();

    renderCatalog(
      CATALOG_ITEMS.filter(item =>
        item.title.toLowerCase().includes(q) ||
        (item.author || "").toLowerCase().includes(q)
      )
    );
  };
}

/* ============================= */
/*  RENDER CATALOG               */
/* ============================= */

async function renderCatalog(items) {
  catalogEl.innerHTML = "";

  for (let i = 0; i < items.length; i++) {
    const book = items[i];
    const cover = await detectCatalogCover(book);

    const link = document.createElement("a");
    link.href = `reader.html?path=${encodeURIComponent(book.path)}`;
    link.className = "catalog-item";

    link.innerHTML = `
      <div class="catalog-thumb">
        <img src="${cover}" alt="${book.title}">
      </div>
      <div class="catalog-info">
        <span class="catalog-tag">BOOK</span>
        <h3 title="${book.title}">${book.title}</h3>
        <small>${book.author || "Anonim"}</small>
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