const synth = speechSynthesis;

function attachTTS() {
  document.querySelectorAll("#reader p").forEach(p => {
    p.onclick = () => {
      synth.cancel();
      document.querySelectorAll(".highlight")
        .forEach(x => x.classList.remove("highlight"));

      const u = new SpeechSynthesisUtterance(p.textContent);
      u.lang = "id-ID";
      p.classList.add("highlight");
      u.onend = () => p.classList.remove("highlight");
      synth.speak(u);
    };
  });
}