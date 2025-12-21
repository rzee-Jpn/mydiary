fetch("data/library.json")
  .then(res => res.json())
  .then(books => {
    const lib = document.getElementById("library");

    books.forEach(b => {
      const card = document.createElement("a");
      card.href = `index.html?book=${b.id}`;
      card.className = "book-card";

      card.innerHTML = `
        <img src="data/books/${b.id}/${b.cover}" alt="${b.title}">
        <h3>${b.title}</h3>
        <small>${b.author} • ${b.year}</small>
      `;

      lib.appendChild(card);
    });
  })
  .catch(() => {
    document.getElementById("library").innerHTML =
      "<p>Gagal memuat perpustakaan.</p>";
  });