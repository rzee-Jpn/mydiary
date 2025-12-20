const ttsBtn = document.getElementById('ttsBtn');
let synth = speechSynthesis;
let reading = false;

ttsBtn.onclick = () => {
  if (reading) {
    synth.cancel();
    reading = false;
    return;
  }

  const text = document.getElementById('reader').innerText;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'id-ID';
  utter.onend = () => reading = false;
  synth.speak(utter);
  reading = true;
};