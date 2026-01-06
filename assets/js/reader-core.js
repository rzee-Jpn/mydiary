(() => {
  const reader = document.getElementById("reader");
  const toc = document.getElementById("tocList");
  const title = document.getElementById("bookTitle");

  const path = new URLSearchParams(location.search).get("path");
  if (!path) return;

  let chapters = [];
  let current = 0;

  fetch(`${path}/book.json`)
    .then(r => r.json())
    .then(book => {
      title.textContent = book.title;
      chapters = book.chapters;
      toc.innerHTML = "";
      chapters.forEach((c, i) => {
        const li = document.createElement("li");
        li.textContent = c.title;
        li.onclick = () => load(i);
        toc.appendChild(li);
      });
      load(0);
    });

  function load(i) {
    current = i;
    fetch(`${path}/${chapters[i].file}`)
      .then(r => r.text())
      .then(html => {
        reader.innerHTML = html;
        document.dispatchEvent(new Event("chapter:loaded"));
        updateProgress(i, chapters.length);
      });
  }

  window.__getChapterIndex = () => current;
})();