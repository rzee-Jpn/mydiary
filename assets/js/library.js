const library = document.getElementById("library");
const searchInput = document.getElementById("bookSearch");
const searchToggle = document.getElementById("searchToggle");
const wrapper = document.querySelector(".search-wrapper");

let ALL_BOOKS = [];

fetch("data/library.json")
  .then(r => r.json())
  .then(data => {
    ALL_BOOKS = data;
    render(data);
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
  render(ALL_BOOKS.filter(b =>
    b.title.toLowerCase().includes(q) ||
    (b.author || "").toLowerCase().includes(q)
  ));
};

function render(books) {
  library.innerHTML = "";
  books.forEach((b, i) => {
    const a = document.createElement("a");
    a.href = `reader.html?path=${encodeURIComponent(b.path)}`;
    a.className = "book-card";

    a.innerHTML = `
      <img src="${b.cover ? `${b.path}/${b.cover}` : "img/default-cover.jpg"}">
      <h3>${b.title}</h3>
      <small>${b.author || "Anonim"}</small>
    `;

    library.appendChild(a);

    gsap.from(a, { opacity: 0, y: 15, delay: i * .05 });
  });
}