document.getElementById('fontSize').oninput = e => {
  document.body.style.fontSize = e.target.value + 'px';
};

document.getElementById('themeSelect').onchange = e => {
  document.body.className = 'theme-' + e.target.value;
};