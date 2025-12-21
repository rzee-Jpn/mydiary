const saved = localStorage.getItem('scroll');
if (saved) window.scrollTo(0, saved);

window.addEventListener('beforeunload', () => {
  localStorage.setItem('scroll', window.scrollY);
});
