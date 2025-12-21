const ttsBtn = document.getElementById("ttsBtn");

if ("speechSynthesis" in window && ttsBtn) {
  let speaking = false;
  let utterance;

  ttsBtn.addEventListener("click", () => {
    if (speaking) {
      speechSynthesis.cancel();
      speaking = false;
      return;
    }

    const text = document.getElementById("reader")?.innerText;
    if (!text) return;

    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 1;
    utterance.pitch = 1;

    speechSynthesis.speak(utterance);
    speaking = true;

    utterance.onend = () => {
      speaking = false;
    };
  });

} else {
  // fallback: sembunyikan tombol
  if (ttsBtn) {
    ttsBtn.style.display = "none";
    console.warn("TTS tidak didukung di browser ini.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const floatBtn = document.getElementById("ttsFloat");
  const mainBtn = document.getElementById("ttsBtn");

  if (!floatBtn || !mainBtn) return;

  // klik floating = klik tombol utama
  floatBtn.addEventListener("click", () => {
    mainBtn.click();
  });

  // sinkron teks ikon
  const observer = new MutationObserver(() => {
    floatBtn.textContent = mainBtn.textContent.includes("Hentikan")
      ? "⏹"
      : "🔊";
  });

  observer.observe(mainBtn, {
    childList: true,
    characterData: true,
    subtree: true
  });
});