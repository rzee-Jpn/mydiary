const latestTitle = document.getElementById("latestTitle");
const catalogEl = document.getElementById("catalog");
const topListEl = document.getElementById("topList");
const searchInput = document.getElementById("bookSearch");
const categoryEl = document.getElementById("categoryList");

const prevBtn = document.getElementById("latestPrev");
const nextBtn = document.getElementById("latestNext");
const indicator = document.getElementById("latestIndicator");

let BOOKS = [];
let current = [];
let index = 0;
const LIMIT = 6;

/* REVEAL */
const obs = new IntersectionObserver(es=>{
  es.forEach(e=>e.isIntersecting && e.target.classList.add("show"));
},{threshold:.12});

function reveal(){
  document.querySelectorAll(".reveal:not(.obs)").forEach(el=>{
    el.classList.add("obs");
    obs.observe(el);
  });
}

/* COVER */
function svgCover(t){
  return `data:image/svg+xml;base64,${btoa(`
<svg xmlns='http://www.w3.org/2000/svg' width='300' height='450'>
<rect width='100%' height='100%' rx='24' fill='#2b2418'/>
<text x='50%' y='50%' fill='#f5f1ea' font-size='22'
text-anchor='middle' dominant-baseline='middle'
font-family='IBM Plex Serif, serif'>${t}</text>
</svg>`)}`;
}

async function cover(b){
  try{
    const r = await fetch(`${b.path}/cover.jpg`,{method:"HEAD"});
    if(r.ok) return `${b.path}/cover.jpg`;
  }catch{}
  return svgCover(b.title);
}

/* LOAD */
fetch("data/library.json")
.then(r=>r.json())
.then(d=>{
  BOOKS = d.sort((a,b)=>new Date(b.created)-new Date(a.created));
  current = BOOKS;
  renderTop();
  renderLatest();
  renderCat();
});

/* SEARCH */
searchInput.oninput=e=>{
  const q=e.target.value.toLowerCase();
  current=BOOKS.filter(b=>
    b.title.toLowerCase().includes(q) ||
    (b.author||"").toLowerCase().includes(q) ||
    (b.tags||[]).join(" ").includes(q)
  );
  index=0;
  renderLatest();
};

/* RENDER LIST */
async function renderList(el, items){
  el.innerHTML="";
  for(const b of items){
    const c = await cover(b);
    const a = document.createElement("a");
    a.href=`reader.html?path=${encodeURIComponent(b.path)}`;
    a.className="post-embed reveal";
    a.innerHTML=`
      <div class="post-thumb"><img src="${c}"></div>
      <div class="post-info">
        <div class="post-title">${b.title}</div>
        <div class="post-meta">${b.author||"Unknown"}</div>
        <div class="post-tags">
          ${(b.tags||[]).slice(0,2).map(t=>`<span class="badge">${t}</span>`).join("")}
        </div>
      </div>`;
    el.appendChild(a);
  }
  reveal();
}

/* TOP */
function renderTop(){
  const top = [...BOOKS].sort((a,b)=>b.views-a.views).slice(0,3);
  renderList(topListEl, top);
}

/* LATEST */
function renderLatest(){
  const slice=current.slice(index,index+LIMIT);
  renderList(catalogEl,slice);

  const total=Math.ceil(current.length/LIMIT)||1;
  indicator.textContent=`${index/LIMIT+1} / ${total}`;

  prevBtn.disabled=index===0;
  nextBtn.disabled=index+LIMIT>=current.length;
}

prevBtn.onclick=()=>{index-=LIMIT;renderLatest();}
nextBtn.onclick=()=>{index+=LIMIT;renderLatest();}

/* CATEGORY */
function renderCat(){
  const map = {};
  BOOKS.forEach(b =>
    (b.categories || []).forEach(c => map[c] = (map[c] || 0) + 1)
  );

  categoryEl.innerHTML =
    `<button class="cat-btn" data-all>All</button>` +
    Object.keys(map)
      .map(c => `<button class="cat-btn" data-cat="${c}">${c}</button>`)
      .join("");

  categoryEl.querySelectorAll("button").forEach(btn => {
    btn.onclick = () => {

      // ALL
      if (btn.dataset.all !== undefined) {
        current = BOOKS;
        latestTitle.textContent = "Post Terbaru";
      }

      // CATEGORY
      if (btn.dataset.cat) {
        const cat = btn.dataset.cat;
        current = BOOKS.filter(b =>
          (b.categories || []).includes(cat)
        );
        latestTitle.textContent = `${cat}`;
      }

      index = 0;
      renderLatest();
    };
  });
}