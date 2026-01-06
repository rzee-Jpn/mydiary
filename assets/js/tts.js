(() => {
  const reader = document.getElementById("reader");
  const ttsBtn = document.getElementById("ttsFloat");

  if (!reader || !ttsBtn || !("speechSynthesis" in window)) {
    if (ttsBtn) ttsBtn.style.display = "none";
    return;
  }

  let paragraphs = [];
  let currentIndex = 0;
  let speaking = false;
  let voices = [];

  // 🔑 FLAG GLOBAL (dipakai translate-tts.js)
  window.isTranslating = false;

  /* =========================
     LOAD VOICES (ASYNC SAFE)
  ========================= */
  function loadVoices() {
    voices = speechSynthesis.getVoices();
  }
  speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();

  /* =========================
     LANGUAGE DETECTION (SIMPLE & FAST)
  ========================= */
  function detectLang(text) {
    const t = text.toLowerCase();

    if (/[ぁ-ゔァ-ヴー々〆〤]/.test(t)) return "ja";
    if (/[؀-ۿ]/.test(t)) return "ar";
    if (/\b(the|and|is|are|with|from|that)\b/.test(t)) return "en";
    if (/\b(yang|dan|dari|ke|di|adalah)\b/.test(t)) return "id";

    return "id";
  }

  /* =========================
     PICK BEST VOICE PER LANG
  ========================= */
  function pickVoice(lang) {
    if (!voices.length) return null;

    const candidates = voices.filter(v =>
      v.lang.toLowerCase().startsWith(lang)
    );

    const preferred = candidates.find(v =>
      /google|natural|neural/i.test(v.name)
    );

    return preferred || candidates[0] || voices[0];
  }

  /* =========================
     UTIL
  ========================= */
  function clearHighlight() {
    reader.querySelectorAll(".tts-active").forEach(p =>
      p.classList.remove("tts-active")
    );
  }

  function stopTTS() {
    speechSynthesis.cancel();
    clearHighlight();
    speaking = false;
  }

  function prepareParagraphs() {
    paragraphs = [...reader.querySelectorAll("p")]
      .filter(p => p.innerText.trim().length > 20);

    paragraphs.forEach((p, i) => {
      p.dataset.ttsIndex = i;
      p.onclick = () => startFrom(i);
    });
  }

  /* =========================
     CORE TTS (CHAIN SAFE)
  ========================= */
  function speak(index) {
    if (!speaking || index >= paragraphs.length) {
      speaking = false;
      return;
    }

    currentIndex = index;
    const p = paragraphs[index];
    const text = p.innerText.trim();

    if (!text) {
      speak(index + 1);
      return;
    }

    const lang = detectLang(text);
    const voice = pickVoice(lang);

    clearHighlight();
    p.classList.add("tts-active");
    p.scrollIntoView({ behavior: "smooth", block: "center" });

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = voice?.lang || lang;
    utter.voice = voice || null;
    utter.rate = 1;
    utter.pitch = 1;

    utter.onend = () => {
      if (speaking) speak(index + 1);
    };

    utter.onerror = () => {
      if (speaking) speak(index + 1);
    };

    speechSynthesis.speak(utter);
  }

  function startFrom(index) {
    stopTTS();
    prepareParagraphs();
    speaking = true;
    speak(index);
  }

  /* =========================
     BUTTON (PLAY / STOP)
  ========================= */
  ttsBtn.addEventListener("click", () => {
    if (speaking) {
      stopTTS();
      return;
    }

    prepareParagraphs();
    if (!paragraphs.length) return;

    speaking = true;
    speak(0);
  });

  /* =========================
     OBSERVER (ONLY FOR CHAPTER LOAD)
     ❌ TIDAK MATI SAAT TRANSLATE
  ========================= */
  const observer = new MutationObserver(() => {
    if (window.isTranslating) return;
    stopTTS();
    prepareParagraphs();
  });

  observer.observe(reader, {
    childList: true,
    subtree: true
  });
})();