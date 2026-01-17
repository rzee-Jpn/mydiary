/* ===========================
   STATE
=========================== */
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

/* ===========================
   REVEAL (smooth, OS-like)
=========================== */
const observer = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add("show");
      observer.unobserve(e.target);
    }
  });
},{threshold:0.12});

function reveal(){
  document.querySelectorAll(".reveal:not(.obs)").forEach(el=>{
    el.classList.add("obs");
    observer.observe(el);
  });
}

/* ===========================
   COVER CACHE
=========================== */
const coverCache = new Map();

function svgCover(title){
  return `data:image/svg+xml;base64,${btoa(`
<svg xmlns='http://www.w3.org/2000/svg' width='300' height='450'>
<rect width='100%' height='100%' rx='24' fill='#2b2418'/>
<text x='50%' y='50%' fill='#f5f1ea' font-size='22'
 text-anchor='middle' dominant-baseline='middle'
 font-family='IBM Plex Serif, serif'>${title}</text>
</svg>`)}`;
}

async function cover(book){
  if(coverCache.has(book.path)) return coverCache.get(book.path);
  try{
    const r = await fetch(`${book.path}/cover.jpg`,{method:"HEAD"});
    if(r.ok){
      coverCache.set(book.path, `${book.path}/cover.jpg`);
      return `${book.path}/cover.jpg`;
    }
  }catch{}
  const fallback = svgCover(book.title);
  coverCache.set(book.path, fallback);
  return fallback;
}

/* ===========================
   LOAD DATA
=========================== */
fetch("data/library.json")
.then(r=>r.json())
.then(data=>{
  BOOKS = data.sort((a,b)=>new Date(b.created)-new Date(a.created));
  current = BOOKS;
  renderTop();
  renderLatest();
  renderCategories();
  renderSchema();
});

/* ===========================
   SEARCH
=========================== */
searchInput.addEventListener("input", e=>{
  const q = e.target.value.toLowerCase();
  current = BOOKS.filter(b =>
    b.title.toLowerCase().includes(q) ||
    (b.author||"").toLowerCase().includes(q) ||
    (b.tags||[]).join(" ").toLowerCase().includes(q)
  );
  index = 0;
  latestTitle.textContent = q ? `Hasil Pencarian` : `Post Terbaru`;
  renderLatest();
});

/* ===========================
   RENDER LIST
=========================== */
async function renderList(el, items){
  el.innerHTML = "";
  for(const b of items){
    const img = await cover(b);
    const a = document.createElement("a");
    a.href = `reader.html?path=${encodeURIComponent(b.path.replace(/\.\./g,""))}`;
    a.className = "post-embed reveal";
    a.innerHTML = `
      <div class="post-thumb"><img src="${img}" alt=""></div>
      <div class="post-info">
        <div class="post-title">${b.title}</div>
        <div class="post-meta">${b.author || "Unknown"}</div>
        <div class="post-tags">
          ${(b.tags||[]).slice(0,2).map(t=>`<span class="badge">${t}</span>`).join("")}
        </div>
      </div>`;
    el.appendChild(a);
  }
  reveal();
}

/* ===========================
   TOP
=========================== */
function renderTop(){
  const top = [...BOOKS]
    .sort((a,b)=>(b.views||0)-(a.views||0))
    .slice(0,3);
  renderList(topListEl, top);
}

/* ===========================
   LATEST + PAGINATION
=========================== */
function renderLatest(){
  const slice = current.slice(index,index+LIMIT);
  renderList(catalogEl, slice);

  const total = Math.max(1, Math.ceil(current.length / LIMIT));
  indicator.textContent = `${index/LIMIT+1} / ${total}`;

  prevBtn.disabled = index === 0;
  nextBtn.disabled = index + LIMIT >= current.length;
}

prevBtn.onclick = ()=>{ index -= LIMIT; renderLatest(); }
nextBtn.onclick = ()=>{ index += LIMIT; renderLatest(); }

/* ===========================
   CATEGORY
=========================== */
function renderCategories(){
  const map = {};
  BOOKS.forEach(b =>
    (b.categories||[]).forEach(c => map[c]=(map[c]||0)+1)
  );

  categoryEl.innerHTML =
    `<button class="cat-btn active" data-all>All</button>` +
    Object.keys(map).map(c =>
      `<button class="cat-btn" data-cat="${c}">${c}</button>`
    ).join("");

  categoryEl.querySelectorAll("button").forEach(btn=>{
    btn.onclick = ()=>{
      categoryEl.querySelectorAll(".cat-btn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");

      if(btn.dataset.all !== undefined){
        current = BOOKS;
        latestTitle.textContent = "Post Terbaru";
      }else{
        current = BOOKS.filter(b => (b.categories||[]).includes(btn.dataset.cat));
        latestTitle.textContent = btn.dataset.cat;
      }

      index = 0;
      renderLatest();
    };
  });
}

/* ===========================
   STRUCTURED DATA
=========================== */
function renderSchema(){
  const el = document.getElementById("schema-books");
  el.textContent = JSON.stringify({
    "@context":"https://schema.org",
    "@type":"ItemList",
    "itemListElement": BOOKS.map((b,i)=>({
      "@type":"ListItem",
      "position": i+1,
      "name": b.title
    }))
  });
}


/* ===========================
   DAILY QUOTE
=========================== */
const QUOTES = [
  { text:"Ilmu bukan untuk disimpan, tapi untuk dipertanggungjawabkan.", author:"Cak Nun" },
  { text:"Yang paling mahal dari pengetahuan adalah kejujuran.", author:"—" },
  { text:"Membaca adalah cara paling sunyi untuk memahami dunia.", author:"—" },
  { text:"Arsip adalah ingatan yang diberi rumah.", author:"Pustaka" },
  { text:"Yang tidak dicatat, akan dilupakan.", author:"—" }
];

function renderDailyQuote(){
  const q = QUOTES[new Date().getDate() % QUOTES.length];
  document.getElementById("quoteText").textContent = q.text;
  document.getElementById("quoteAuthor").textContent = q.author || "";
}

renderDailyQuote();