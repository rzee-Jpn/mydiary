const toc = document.getElementById('toc');
const settings = document.getElementById('settings');

menuBtn.onclick = ()=> toc.classList.toggle('show');
settingBtn.onclick = ()=> settings.classList.toggle('show');

fontSize.oninput = e=>{
  document.documentElement.style
    .setProperty('--font-size', e.target.value + 'px');
};

themeSelect.onchange = e=>{
  document.body.className = 'theme-' + e.target.value;
};
