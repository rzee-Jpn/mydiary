const bar = document.querySelector('#progressBar span');
const text = document.getElementById('progressText');

window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const percent = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  bar.style.width = percent + '%';
  text.textContent = Math.round(percent) + '%';
  localStorage.setItem('progress', percent);
});