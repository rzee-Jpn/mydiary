const library = document.getElementById("library");
const searchInput = document.getElementById("bookSearch");
const searchWrapper = document.querySelector(".search-wrapper");
const searchToggle = document.getElementById("searchToggle");

let ALL_BOOKS = [];

// ========================
// FETCH LIBRARY
// ========================
fetch("data/library.json")
  .then(res => res.json())
  .then(books => {
    ALL_BOOKS = books;
    renderLibrary(books);

    // realtime search
    searchInput.addEventListener("input", e => {
      const q = e.target.value.toLowerCase();
      const filtered = ALL_BOOKS.filter(b =>
        b.title.toLowerCase().includes(q) ||
        (b.author && b.author.toLowerCase().includes(q))
      );
      renderLibrary(filtered);
    });
  })
  .catch(err => {
    console.error(err);
    library.innerHTML = "<p>Gagal memuat perpustakaan.</p>";
  });

// ========================
// TOGGLE SEARCH
// ========================
searchToggle.addEventListener("click", () => {
  searchWrapper.classList.toggle("active");

  if (searchWrapper.classList.contains("active")) {
    searchInput.focus();
  } else {
    searchInput.value = "";
    renderLibrary(ALL_BOOKS);
  }
});

// ========================
// RENDER GRID
// ========================
function renderLibrary(books) {
  library.innerHTML = "";

  books.forEach((b, index) => {
    const card = document.createElement("a");

    // 👉 PATH DINAMIS (KUNCI UTAMA)
    card.href = `index.html?book=${encodeURIComponent(b.id)}&path=${encodeURIComponent(b.path)}`;
    card.className = "book-card";

    // cover fallback
    const coverImg = b.cover && b.cover.length
      ? `${b.path}/${b.cover}`
      : "img/default-cover.jpg";

    card.innerHTML = `
      <img src="${coverImg}" alt="${b.title}">
      <h3>${b.title}</h3>
      <small>
        ${b.author ? b.author : "Anonim"}
        ${b.year ? " • " + b.year : ""}
      </small>
    `;

    library.appendChild(card);

    // GSAP hover
    card.addEventListener("mouseenter", () =>
      gsap.to(card, { scale: 1.05, duration: 0.25 })
    );
    card.addEventListener("mouseleave", () =>
      gsap.to(card, { scale: 1, duration: 0.25 })
    );

    // GSAP fade-in
    gsap.from(card, {
      opacity: 0,
      y: 15,
      duration: 0.4,
      delay: index * 0.05,
      ease: "power2.out"
    });
  });
}