const library = document.getElementById("library");
const searchInput = document.getElementById("bookSearch");
const searchToggle = document.getElementById("searchToggle");
const wrapper = document.querySelector(".search-wrapper");

let ALL_BOOKS = [];

/* ===== SVG DEFAULT COVER (SAFE) ===== */
function generateSVGCover(title) {
  const maxChars = 18;
  const words = title.split(" ");
  let lines = [];
  let line = "";

  for (const w of words) {
    if ((line + w).length <= maxChars) {
      line += (line ? " " : "") + w;
    } else {
      lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);

  lines = lines.slice(0, 4);

  const tspans = lines
    .map((l, i) => `<tspan x="50%" dy="${i === 0 ? 0 : 32}">${l}</tspan>`)
    .join("");

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#2b2b2b"/>
        <stop offset="100%" stop-color="#444"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" rx="18" fill="url(#g)"/>
    <text x="50%" y="42%"
      fill="#f5f5f5"
      font-size="26"
      font-family="serif"
      text-anchor="middle">
      ${tspans}
    </text>
  </svg>`;

  return "data:image/svg+xml;base64," +
    btoa(unescape(encodeURIComponent(svg)));
}

/* ===== AUTO COVER DETECT ===== */
async function detectCover(book) {
  const files = ["cover.jpg", "cover.png", "thumbnail.jpg", "thumbnail.png"];
  for (const f of files) {
    try {
      const r = await fetch(`${book.path}/${f}`, { method: "HEAD" });
      if (r.ok) return `${book.path}/${f}`;
    } catch {}
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
    a.className = "book-card";
    a.href = `reader.html?path=${encodeURIComponent(b.path)}`;

    a.innerHTML = `
      <div class="book-cover">
        <img src="${cover}" alt="${b.title}">
      </div>

      <div class="book-info">
        <h3 title="${b.title}">${b.title}</h3>
        <small>${b.author || "Anonim"}</small>
      </div>
    `;

    library.appendChild(a);

    gsap.from(a, {
      opacity: 0,
      y: 20,
      duration: 0.4,
      delay: i * 0.04
    });
  }
}