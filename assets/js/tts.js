(() => {
  const reader = document.getElementById("reader");
  const ttsBtn = document.getElementById("ttsFloat");

  if (!reader || !ttsBtn || !("speechSynthesis" in window)) {
    if (ttsBtn) ttsBtn.style.display = "none";
    return;
  }

  let speaking = false;
  let utterances = [];
  let currentIndex = 0;

  function clearHighlight() {
    reader.querySelectorAll(".tts-active").forEach(p => {
      p.classList.remove("tts-active");
    });
  }

  function stopTTS() {
    speechSynthesis.cancel();
    clearHighlight();
    speaking = false;
    currentIndex = 0;
  }

  function prepareParagraphs() {
    clearHighlight();

    return [...reader.querySelectorAll("p")]
      .filter(p => p.innerText.trim().length > 20); // skip noise
  }

  function speakNext(paragraphs) {
    if (currentIndex >= paragraphs.length) {
      speaking = false;
      return;
    }

    const p = paragraphs[currentIndex];
    p.classList.add("tts-active");
    p.scrollIntoView({ behavior: "smooth", block: "center" });

    const u = new SpeechSynthesisUtterance(p.innerText);
    u.lang = "id-ID";
    u.rate = 1;
    u.pitch = 1;

    u.onend = () => {
      p.classList.remove("tts-active");
      currentIndex++;
      speakNext(paragraphs);
    };

    speechSynthesis.speak(u);
  }

  ttsBtn.addEventListener("click", () => {
    if (speaking) {
      stopTTS();
      return;
    }

    const paragraphs = prepareParagraphs();
    if (!paragraphs.length) return;

    speaking = true;
    currentIndex = 0;
    speakNext(paragraphs);
  });
})();