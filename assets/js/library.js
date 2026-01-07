const library = document.getElementById("library");
const searchInput = document.getElementById("bookSearch");
const searchToggle = document.getElementById("searchToggle");
const wrapper = document.querySelector(".search-wrapper");

let ALL_BOOKS = [];

/* ================= SVG COVER GENERATOR ================= */
function generateSVGCover(title) {
  const words = title.split(" ");
  let lines = [];
  let current = "";

  words.forEach(word => {
    if ((current + " " + word).length > 18) {
      lines.push(current);
      current = word;
    } else {
      current += (current ? " " : "") + word;
    }
  });
  if (current) lines.push(current);

  const textSVG = lines.slice(0, 5).map((line, i) => `
    <tspan x="50%" dy="${i === 0 ? 0 : 32}">${line}</tspan>
  `).join("");

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#2b2b2b"/>
        <stop offset="100%" stop-color="#3f3f3f"/>
      </linearGradient>
    </defs>

    <rect width="100%" height="100%" fill="url(#g)"/>

    <text x="50%" y="42%"
      fill="#f1f1f1"
      font-size="26"
      font-family="serif"
      text-anchor="middle">
      ${textSVG}
    </text>
  </svg>`;

  return "data:image/svg+xml;base64," +
    btoa(unescape(encodeURIComponent(svg)));
}

/* ================= AUTO COVER DETECT ================= */
async function detectCover(book) {
  const candidates = ["cover.jpg", "cover.png", "thumbnail.jpg", "thumbnail.png"];

  for (const file of candidates) {
    try {
      const res = await fetch(`${book.path}/${file}`, { method: "HEAD" });
      if (res.ok) return `${book.path}/${file}`;
    } catch {}
  }

  return generateSVGCover(book.title);
}

/* ================= LOAD DATA ================= */
fetch("data/library.json")
  .then(r => r.json())
  .then(data => {
    ALL_BOOKS = data;
    render(data);
  });

/* ================= SEARCH ================= */
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

/* ================= RENDER ================= */
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
      duration: 0.4,
      delay: i * 0.04
    });
  }
}