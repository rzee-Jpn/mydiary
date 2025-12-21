const params = new URLSearchParams(location.search);
const BOOK_ID = params.get('book') || 'naskah-kuno-demo';
let chapters = [];
let currentPara = 0;

const reader = document.getElementById('reader');
const bookTitle = document.getElementById('bookTitle');
const tocList = document.getElementById('tocList');
const tocBtn = document.getElementById('tocBtn');
const tocPanel = document.getElementById('tocPanel');
const themeSelect = document.getElementById('themeSelect');

fetch(`data/books/${BOOK_ID}/book.json`)
  .then(r => r.json())
  .then(book => {
    bookTitle.textContent = book.title;
    chapters = book.chapters;
    buildTOC();
    loadChapter(1);
  })
  .catch(err => { reader.innerHTML = "<p>Gagal memuat buku.</p>"; console.error(err); });

// TOC toggle dengan GSAP
tocBtn.onclick = ()=>{
  if(tocPanel.classList.contains('show')){
    gsap.to(tocPanel,{x:-280,duration:0.3});
    tocPanel.classList.remove('show');
  } else {
    gsap.to(tocPanel,{x:0,duration:0.3});
    tocPanel.classList.add('show');
  }
};

themeSelect.onchange = ()=> document.body.className = 'theme-'+themeSelect.value;

function buildTOC(){
  tocList.innerHTML = '';
  chapters.forEach((ch,i)=>{
    const li = document.createElement('li');
    li.textContent = ch.title;
    li.onclick = ()=>{ loadChapter(i+1); tocPanel.classList.remove('show'); gsap.to(tocPanel,{x:-280,duration:0.3}); };
    tocList.appendChild(li);
  });
}

function loadChapter(num){
  const chapter = chapters[num-1];
  if(!chapter) return;
  reader.innerHTML = `<div class="chapter-title">${chapter.title}</div>`;
  chapter.content.forEach(p=>{
    const el = document.createElement('p');
    el.textContent = p;
    reader.appendChild(el);
  });
  reader.innerHTML += `<div class="chapter-divider">●</div>`;
  currentPara=0;
  updateProgress();
}

function updateProgress(){
  const paras = reader.querySelectorAll('p');
  const percent = paras.length ? Math.round((currentPara+1)/paras.length*100) : 0;
  document.getElementById('progressText').textContent = percent+'%';
  document.getElementById('progressBar').style.width = percent+'%';
}