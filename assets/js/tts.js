(() => {
  const reader = document.getElementById("reader");
  const ttsBtn = document.getElementById("ttsFloat");

  if (!reader || !ttsBtn || !("speechSynthesis" in window)) {
    if (ttsBtn) ttsBtn.style.display = "none";
    return;
  }

  let utterance;
  let speaking = false;

  function clearHighlight() {
    reader.querySelectorAll(".tts-active").forEach(el => {
      el.classList.remove("tts-active");
    });
  }

  function prepareText() {
    clearHighlight();

    const walker = document.createTreeWalker(
      reader,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          if (node.parentElement.closest("button, a")) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const fragments = [];
    let node;

    while ((node = walker.nextNode())) {
      const span = document.createElement("span");
      span.textContent = node.nodeValue;
      node.parentNode.replaceChild(span, node);
      fragments.push(span);
    }

    return fragments;
  }

  ttsBtn.addEventListener("click", () => {
    if (speaking) {
      speechSynthesis.cancel();
      speaking = false;
      clearHighlight();
      return;
    }

    const spans = prepareText();
    const text = spans.map(s => s.textContent).join("");

    if (!text.trim()) return;

    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 1;
    utterance.pitch = 1;

    let charIndex = 0;

    utterance.onboundary = e => {
      if (e.name !== "word") return;

      let count = 0;
      for (const span of spans) {
        count += span.textContent.length;
        if (count >= e.charIndex) {
          clearHighlight();
          span.classList.add("tts-active");
          span.scrollIntoView({ block: "center", behavior: "smooth" });
          break;
        }
      }
    };

    utterance.onend = () => {
      speaking = false;
      clearHighlight();
    };

    speaking = true;
    speechSynthesis.speak(utterance);
  });
})();