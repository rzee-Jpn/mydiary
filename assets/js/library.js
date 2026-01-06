const library = document.getElementById("library");
const searchInput = document.getElementById("bookSearch");
const searchToggle = document.getElementById("searchToggle");
const wrapper = document.querySelector(".search-wrapper");

let ALL_BOOKS = [];

// 🔍 auto detect cover
async function detectCover(bookPath) {
  const candidates = [
    "cover.jpg",
    "cover.png",
    "thumbnail.jpg",
    "thumbnail.png"
  ];

  for (const file of candidates) {
    try {
      const res = await fetch(`${bookPath}/${file}`, { method: "HEAD" });
      if (res.ok) return `${bookPath}/${file}`;
    } catch (e) {}
  }

  return "img/default-cover.jpg";
}

fetch("data/library.json")
  .then(r => r.json())
  .then(async data => {
    ALL_BOOKS = data;
    await render(data);
  });

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

// 📚 render library (async)
async function render(books) {
  library.innerHTML = "";

  for (let i = 0; i < books.length; i++) {
    const b = books[i];
    const cover = await detectCover(b.path);

    const a = document.createElement("a");
    a.href = `reader.html?path=${encodeURIComponent(b.path)}`;
    a.className = "book-card";

    a.innerHTML = `
      <img src="${cover}">
      <h3>${b.title}</h3>
      <small>${b.author || "Anonim"}</small>
    `;

    library.appendChild(a);

    gsap.from(a, { opacity: 0, y: 15, delay: i * 0.05 });
  }
}