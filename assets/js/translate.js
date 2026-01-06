(() => {
  const sel = document.getElementById("translateLang");
  const reader = document.getElementById("reader");
  if (!sel || !reader) return;

  const original = new Map();

  const params = new URLSearchParams(location.search);
  const bookId = params.get("book") || "default";
  const STORAGE_KEY = `reader_lang_${bookId}`;

  async function applyTranslate(lang) {
    const ps = reader.querySelectorAll("p");
    ReaderState.isTranslating = true;

    if (!lang) {
      ps.forEach(p => original.has(p) && (p.innerText = original.get(p)));
      ReaderState.isTranslating = false;
      return;
    }

    for (const p of ps) {
      const t = p.innerText.trim();
      if (t.length < 30) continue;

      if (!original.has(p)) original.set(p, t);

      const r = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(t)}`
      );
      const j = await r.json();
      p.innerText = j[0].map(x => x[0]).join("");
    }

    ReaderState.isTranslating = false;
  }

  sel.addEventListener("change", async () => {
    const lang = sel.value;
    localStorage.setItem(STORAGE_KEY, lang);
    await applyTranslate(lang);
  });

  const savedLang = localStorage.getItem(STORAGE_KEY);
  if (savedLang) {
    sel.value = savedLang;
    setTimeout(() => applyTranslate(savedLang), 400);
  }
})();