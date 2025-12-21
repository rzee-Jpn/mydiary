const pages = document.querySelectorAll('.page');
const pageInfo = document.getElementById('pageInfo');

let page = parseInt(localStorage.getItem('page')) || 0;

function showPage(n) {
  pages.forEach((p,i)=>p.style.display = i===n?'block':'none');
  pageInfo.textContent = `${n+1}/${pages.length}`;
  localStorage.setItem('page', n);
  estimateTime();
}

document.getElementById('next').onclick = () =>
  showPage(Math.min(page+1, pages.length-1));

document.getElementById('prev').onclick = () =>
  showPage(Math.max(page-1, 0));

document.querySelectorAll('#toc li').forEach(li=>{
  li.onclick = ()=>{
    page = parseInt(li.dataset.page);
    showPage(page);
    toc.classList.remove('show');
  }
});

function estimateTime() {
  const words = pages[page].innerText.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  document.getElementById('timeLeft').textContent =
    `± ${minutes} menit`;
}

showPage(page);
