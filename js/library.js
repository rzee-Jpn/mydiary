fetch("data/library.json")
  .then(res => res.json())
  .then(books => {
    const lib = document.getElementById("library");

    books.forEach(b => {
      const card = document.createElement("a");
      card.href = `index.html?book=${b.id}`;
      card.className = "book-card";

      const coverImg = b.cover && b.cover.length ? b.cover : "default-cover.jpg";

      card.innerHTML = `
        <img src="data/books/${b.id}/${coverImg}" alt="${b.title}">
        <h3>${b.title}</h3>
        <small>${b.author} • ${b.year}</small>
      `;

      lib.appendChild(card);

      // GSAP hover effect
      card.addEventListener('mouseenter',()=>gsap.to(card,{scale:1.05,duration:0.3}));
      card.addEventListener('mouseleave',()=>gsap.to(card,{scale:1,duration:0.3}));
    });
  })
  .catch(()=>{ document.getElementById("library").innerHTML = "<p>Gagal memuat perpustakaan.</p>"; });