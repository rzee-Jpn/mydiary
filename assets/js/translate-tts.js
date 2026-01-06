(() => {
  const select = document.getElementById("translateLang");
  const reader = document.getElementById("reader");

  if (!select || !reader) return;

  const originalMap = new Map();

  async function translateText(text, target) {
    const res = await fetch(
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" +
        target +
        "&dt=t&q=" +
        encodeURIComponent(text)
    );
    const data = await res.json();
    return data[0].map(x => x[0]).join("");
  }

  select.addEventListener("change", async () => {
    const lang = select.value;
    const ps = [...reader.querySelectorAll("p")];

    window.isTranslating = true;

    if (!lang) {
      ps.forEach(p => {
        if (originalMap.has(p)) p.innerText = originalMap.get(p);
      });
      window.isTranslating = false;
      return;
    }

    for (const p of ps) {
      const text = p.innerText.trim();
      if (text.length < 20) continue;

      if (!originalMap.has(p)) {
        originalMap.set(p, text);
      }

      try {
        const translated = await translateText(text, lang);
        p.innerText = translated;
      } catch (e) {
        console.warn("Translate failed", e);
      }
    }

    window.isTranslating = false;
  });
})();