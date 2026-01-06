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
  let currentUtterance = null;
  let sessionVoice = null;
  let observerTimer = null;

  // dipakai translate.js
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
     LANGUAGE DETECTION (BCP-47)
  ========================= */
  function detectLang(text) {
    const t = text.toLowerCase();

    if (/[ぁ-ゔァ-ヴー々〆〤]/.test(t)) return "ja-JP";
    if (/[؀-ۿ]/.test(t)) return "ar-SA";
    if (/\b(the|and|is|are|with|from|that)\b/.test(t)) return "en-US";
    if (/\b(yang|dan|dari|ke|di|adalah)\b/.test(t)) return "id-ID";

    return "id-ID";
  }

  /* =========================
     PICK VOICE (STABLE)
  ========================= */
  function pickVoice(lang) {
    if (!voices.length) return null;

    const base = lang.split("-")[0];

    const candidates = voices.filter(v =>
      v.lang.toLowerCase().startsWith(base)
    );

    return (
      candidates.find(v => /google|natural|neural/i.test(v.name)) ||
      candidates[0] ||
      null
    );
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
    speaking = false;

    if (currentUtterance) {
      currentUtterance.onend = null;
      currentUtterance.onerror = null;
    }

    speechSynthesis.cancel();
    clearHighlight();

    currentUtterance = null;
    sessionVoice = null;
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
     CORE SPEAK (LOCKED & SAFE)
  ========================= */
  function speak(index) {
    if (!speaking || index >= paragraphs.length) {
      stopTTS();
      return;
    }

    currentIndex = index;
    const p = paragraphs[index];
    const text = p.innerText.trim();

    if (!text) {
      speak(index + 1);
      return;
    }

    clearHighlight();
    p.classList.add("tts-active");
    p.scrollIntoView({ behavior: "smooth", block: "center" });

    const utter = new SpeechSynthesisUtterance(text);

    // LANG & VOICE DIKUNCI
    const lang = detectLang(text);
    utter.lang = lang;
    if (sessionVoice) utter.voice = sessionVoice;

    utter.rate = 1;
    utter.pitch = 1;

    currentUtterance = utter;

    utter.onend = () => {
      if (speaking) speak(index + 1);
    };

    utter.onerror = () => {
      if (speaking) speak(index + 1);
    };

    // ❗ JANGAN CANCEL SAAT TRANSLATE
    if (!window.isTranslating) {
      speechSynthesis.cancel();
    }

    speechSynthesis.speak(utter);
  }

  function startFrom(index) {
    stopTTS();
    prepareParagraphs();

    // 🔒 LOCK VOICE SEKALI PER SESI
    const firstText = paragraphs[index]?.innerText || "";
    const lang = detectLang(firstText);
    sessionVoice = pickVoice(lang);

    speaking = true;
    speak(index);
  }

  /* =========================
     BUTTON
  ========================= */
  ttsBtn.onclick = () => {
    if (speaking) {
      stopTTS();
      return;
    }

    prepareParagraphs();
    if (!paragraphs.length) return;

    startFrom(0);
  };

  /* =========================
     OBSERVER (DEBOUNCED)
  ========================= */
  const observer = new MutationObserver(() => {
    if (window.isTranslating) return;

    clearTimeout(observerTimer);
    observerTimer = setTimeout(() => {
      stopTTS();
      prepareParagraphs();
    }, 300);
  });

  observer.observe(reader, {
    childList: true,
    subtree: true
  });
})();