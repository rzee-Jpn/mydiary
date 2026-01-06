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
  let readyToSpeak = true;

  // dipakai translate.js
  window.isTranslating = false;

  /* =========================
     LOAD VOICES (STABLE)
  ========================= */
  function loadVoices() {
    voices = speechSynthesis.getVoices();
  }
  speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();

  /* =========================
     LANGUAGE DETECT
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
     PICK VOICE (LOCKABLE)
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

  function stopTTS(force = true) {
    speaking = false;
    if (currentUtterance) {
      currentUtterance.onend = null;
      currentUtterance.onerror = null;
    }
    if (force) speechSynthesis.cancel();
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
     CORE SPEAK (ANTI MATI)
  ========================= */
  function speak(index) {
    if (!speaking || index >= paragraphs.length) {
      stopTTS();
      return;
    }

    currentIndex = index;
    const p = paragraphs[index];
    const text = p.innerText.trim();
    if (!text) return speak(index + 1);

    const lang = detectLang(text);

    // 🔒 lock voice sekali per session
    if (!sessionVoice) {
      sessionVoice = pickVoice(lang);
    }

    clearHighlight();
    p.classList.add("tts-active");
    p.scrollIntoView({ behavior: "smooth", block: "center" });

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    if (sessionVoice) utter.voice = sessionVoice;

    currentUtterance = utter;

    utter.onend = () => {
      if (speaking) speak(index + 1);
    };

    utter.onerror = () => {
      if (speaking) speak(index + 1);
    };

    // 🧠 micro-delay = Chrome Android lifesaver
    setTimeout(() => {
      if (!readyToSpeak) return;
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
    }, 80);
  }

  function startFrom(index) {
    stopTTS();
    prepareParagraphs();
    speaking = true;
    readyToSpeak = true;
    speak(index);
  }

  /* =========================
     BUTTON (USER GESTURE)
  ========================= */
  ttsBtn.onclick = () => {
    if (speaking) {
      stopTTS();
      return;
    }

    prepareParagraphs();
    if (!paragraphs.length) return;

    speaking = true;
    readyToSpeak = true;
    speak(0);
  };

  /* =========================
     VISIBILITY FIX (INI KUNCI)
  ========================= */
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && speaking) {
      readyToSpeak = true;
      speechSynthesis.cancel();
      setTimeout(() => speak(currentIndex), 150);
    }
  });

  /* =========================
     OBSERVER (DEBOUNCED)
  ========================= */
  let obsTimer = null;
  const observer = new MutationObserver(() => {
    if (window.isTranslating) return;
    clearTimeout(obsTimer);
    obsTimer = setTimeout(() => {
      stopTTS(false);
      prepareParagraphs();
    }, 300);
  });

  observer.observe(reader, {
    childList: true,
    subtree: true
  });
})();