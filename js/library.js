const library = document.getElementById("library");
const searchInput = document.getElementById("bookSearch");
const searchWrapper = document.querySelector(".search-wrapper");
const searchToggle = document.getElementById("searchToggle");

// fetch data JSON
fetch("data/library.json")
  .then(res => res.json())
  .then(books => {
    renderLibrary(books);

    // pencarian realtime
    searchInput.addEventListener("input", e => {
      const query = e.target.value.toLowerCase();
      const filtered = books.filter(b => b.title.toLowerCase().includes(query));
      renderLibrary(filtered);
    });
  })
  .catch(() => {
    library.innerHTML = "<p>Gagal memuat perpustakaan.</p>";
  });

// toggle input search
searchToggle.addEventListener("click", () => {
  searchWrapper.classList.toggle("active");
  if(searchWrapper.classList.contains("active")) {
    searchInput.focus();
  } else {
    searchInput.value = "";
    fetch("data/library.json")
      .then(res => res.json())
      .then(books => renderLibrary(books));
  }
});

// render library function
function renderLibrary(books) {
  library.innerHTML = "";

  books.forEach((b, index) => {
    const card = document.createElement("a");
    card.href = `index.html?book=${b.id}`;
    card.className = "book-card";

    const coverImg = b.cover && b.cover.length ? b.cover : "default-cover.jpg";

    card.innerHTML = `
      <img src="data/books/${b.id}/${coverImg}" alt="${b.title}">
      <h3>${b.title}</h3>
      <small>${b.author ? b.author + " • " : ""}${b.year || ""}</small>
    `;

    library.appendChild(card);

    // hover effect GSAP
    card.addEventListener('mouseenter', ()=>gsap.to(card,{scale:1.05,duration:0.3}));
    card.addEventListener('mouseleave', ()=>gsap.to(card,{scale:1,duration:0.3}));

    // fade-in GSAP
    gsap.from(card,{opacity:0,y:10,duration:0.5,delay:index*0.05,ease:"power2.out"});
  });
}