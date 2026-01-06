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

  // =========================
  // UTIL
  // =========================
  function clearHighlight() {
    reader.querySelectorAll(".tts-active").forEach(p => {
      p.classList.remove("tts-active");
    });
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

  // =========================
  // CORE TTS
  // =========================
  function speak(index) {
    if (index >= paragraphs.length) {
      speaking = false;
      return;
    }

    currentIndex = index;
    const p = paragraphs[index];

    clearHighlight();
    p.classList.add("tts-active");
    p.scrollIntoView({ behavior: "smooth", block: "center" });

    const utter = new SpeechSynthesisUtterance(p.innerText);
    utter.lang = "id-ID";
    utter.rate = 1;
    utter.pitch = 1;

    utter.onend = () => {
      speak(index + 1);
    };

    speechSynthesis.speak(utter);
  }

  function startFrom(index) {
    stopTTS();
    speaking = true;
    speak(index);
  }

  // =========================
  // BUTTON
  // =========================
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

  // =========================
  // AUTO-RELOAD AFTER CHAPTER LOAD
  // =========================
  const observer = new MutationObserver(() => {
    stopTTS();
    prepareParagraphs();
  });

  observer.observe(reader, { childList: true, subtree: true });
})();