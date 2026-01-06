(() => {
  const sel = document.getElementById("translateLang");
  const reader = document.getElementById("reader");
  if (!sel || !reader) return;

  const original = new Map();

  sel.onchange = async () => {
    const lang = sel.value;
    const ps = reader.querySelectorAll("p");

    ReaderState.isTranslating = true;

    if (!lang) {
      ps.forEach(p => p.innerText = original.get(p) || p.innerText);
      ReaderState.isTranslating = false;
      return;
    }

    for (const p of ps) {
      const t = p.innerText.trim();
      if (t.length < 30) continue;
      original.set(p, t);

      const r = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(t)}`
      );
      const j = await r.json();
      p.innerText = j[0].map(x => x[0]).join("");
    }

    ReaderState.isTranslating = false;
  };
})();