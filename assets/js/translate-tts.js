(() => {
  const reader = document.getElementById("reader");
  const select = document.getElementById("translateLang");

  if (!reader || !select) return;

  // Simpan teks asli (tidak ke storage)
  const originalMap = new WeakMap();

  function collectParagraphs() {
    return [...reader.querySelectorAll("p")]
      .filter(p => p.innerText.trim().length > 5);
  }

  function storeOriginal() {
    collectParagraphs().forEach(p => {
      if (!originalMap.has(p)) {
        originalMap.set(p, p.innerText);
      }
    });
  }

  async function translateText(text, target) {
    const url =
      "https://translate.googleapis.com/translate_a/single" +
      "?client=gtx" +
      "&sl=auto" +
      "&tl=" + target +
      "&dt=t&q=" + encodeURIComponent(text);

    const res = await fetch(url);
    const data = await res.json();

    return data[0].map(t => t[0]).join("");
  }

  async function translateAll(lang) {
    storeOriginal();
    const paragraphs = collectParagraphs();

    for (const p of paragraphs) {
      const original = originalMap.get(p);
      if (!original) continue;

      try {
        p.innerText = "⏳ Menerjemahkan...";
        const translated = await translateText(original, lang);
        p.innerText = translated;
      } catch (e) {
        p.innerText = original;
      }
    }
  }

  function restoreOriginal() {
    collectParagraphs().forEach(p => {
      if (originalMap.has(p)) {
        p.innerText = originalMap.get(p);
      }
    });
  }

  select.addEventListener("change", () => {
    const lang = select.value;

    // Hentikan TTS saat ganti bahasa
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }

    if (!lang) {
      restoreOriginal();
    } else {
      translateAll(lang);
    }
  });

  // Jika konten bab berubah
  const observer = new MutationObserver(() => {
    originalMap.clear?.();
  });

  observer.observe(reader, { childList: true, subtree: true });
})();