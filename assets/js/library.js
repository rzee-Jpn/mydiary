const library = document.getElementById("library");
const searchInput = document.getElementById("bookSearch");
const searchToggle = document.getElementById("searchToggle");
const wrapper = document.querySelector(".search-wrapper");

let ALL_BOOKS = [];

/* LOAD DATA */
fetch("data/library.json")
  .then(r => r.json())
  .then(data => {
    ALL_BOOKS = data;
    render(data);
  });

/* SEARCH */
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

/* RENDER */
function render(books) {
  library.innerHTML = "";

  books.forEach(b => {
    const a = document.createElement("a");
    a.className = "book-card";
    a.href = `reader.html?path=${encodeURIComponent(b.path)}`;

    a.innerHTML = `
      <div class="book-cover">
        <img src="${b.cover || 'img/cover-placeholder.png'}" alt="">
      </div>
      <h3 title="${b.title}">${b.title}</h3>
      <small>${b.author || "Anonim"}</small>
    `;

    library.appendChild(a);
  });
}