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

  /* =========================
     LOAD VOICES
  ========================= */
  function loadVoices() {
    voices = speechSynthesis.getVoices();
  }
  speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();

  /* =========================
     LANGUAGE DETECTION
  ========================= */
  function detectLang(text) {
    const t = text.toLowerCase();

    if (/[ぁ-ゔァ-ヴー々〆〤]/.test(t)) return "ja";
    if (/\b(the|and|is|are|with|from|that)\b/.test(t)) return "en";
    if (/\b(yang|dan|dari|ke|di|adalah)\b/.test(t)) return "id";

    return "id";
  }

  /* =========================
     PICK BEST VOICE
  ========================= */
  function pickVoice(lang) {
    if (!voices.length) return null;

    // 1️⃣ Exact language match
    let candidates = voices.filter(v =>
      v.lang.toLowerCase().startsWith(lang)
    );

    // 2️⃣ Prefer Google / Natural
    let best = candidates.find(v =>
      /google|natural/i.test(v.name)
    );

    // 3️⃣ Fallback
    return best || candidates[0] || voices[0];
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
     CORE TTS
  ========================= */
  function speak(index) {
    if (index >= paragraphs.length) {
      speaking = false;
      return;
    }

    currentIndex = index;
    const p = paragraphs[index];
    const text = p.innerText.trim();
    const lang = detectLang(text);
    const voice = pickVoice(lang);

    clearHighlight();
    p.classList.add("tts-active");
    p.scrollIntoView({ behavior: "smooth", block: "center" });

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = voice?.lang || "id-ID";
    utter.voice = voice || null;
    utter.rate = 1;
    utter.pitch = 1;

    utter.onend = () => speak(index + 1);

    speechSynthesis.speak(utter);
  }

  function startFrom(index) {
    stopTTS();
    speaking = true;
    speak(index);
  }

  /* =========================
     BUTTON
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
     OBSERVE CHAPTER CHANGE
  ========================= */
  const observer = new MutationObserver(() => {
    stopTTS();
    prepareParagraphs();
  });

  observer.observe(reader, { childList: true, subtree: true });
})();