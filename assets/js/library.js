/* ============================================================
   PUSTAKA — LIBRARY JS
   Clean browsing: search + category pills + single grid
   ============================================================ */

const catalogEl      = document.getElementById('catalog');
const searchInput    = document.getElementById('bookSearch');
const searchClear    = document.getElementById('searchClear');
const categoryEl     = document.getElementById('categoryList');
const sectionTitle   = document.getElementById('sectionTitle');
const bookCountEl    = document.getElementById('bookCount');
const emptyState     = document.getElementById('emptyState');
const pagination     = document.getElementById('pagination');
const prevBtn        = document.getElementById('latestPrev');
const nextBtn        = document.getElementById('latestNext');
const indicator      = document.getElementById('latestIndicator');

let BOOKS   = [];
let current = [];
let page    = 0;
const PER_PAGE = 12;

/* ─── COVER ─── */
const coverCache = new Map();

function svgCover(title) {
  const short = title.length > 28 ? title.slice(0, 28) + '…' : title;
  const words = short.split(' ');
  // wrap into ~2 lines for the SVG
  const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
  const line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='174'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#1e1a14'/>
        <stop offset='100%' stop-color='#2a2318'/>
      </linearGradient>
    </defs>
    <rect width='120' height='174' rx='6' fill='url(#g)'/>
    <rect x='8' y='8' width='104' height='158' rx='4' fill='none' stroke='rgba(201,169,106,.3)' stroke-width='.8'/>
    <text x='60' y='72' fill='rgba(201,169,106,.7)' font-size='22' text-anchor='middle' font-family='serif'>❧</text>
    <text x='60' y='100' fill='rgba(240,235,224,.8)' font-size='9' text-anchor='middle' font-family='serif'>${line1}</text>
    <text x='60' y='113' fill='rgba(240,235,224,.8)' font-size='9' text-anchor='middle' font-family='serif'>${line2}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

async function getCover(book) {
  if (coverCache.has(book.path)) return coverCache.get(book.path);
  try {
    const r = await fetch(`${book.path}/cover.jpg`, { method: 'HEAD' });
    if (r.ok) {
      coverCache.set(book.path, `${book.path}/cover.jpg`);
      return `${book.path}/cover.jpg`;
    }
  } catch { /* no cover.jpg */ }
  const fallback = svgCover(book.title);
  coverCache.set(book.path, fallback);
  return fallback;
}

/* ─── LOAD DATA ─── */
fetch('data/library.json')
  .then(r => r.json())
  .then(data => {
    // Support single object, array, or {books:[...]} wrapper
    const raw = Array.isArray(data) ? data : data.books ? data.books : [data];
    BOOKS = raw.sort((a, b) => new Date(b.created) - new Date(a.created));
    current = BOOKS;
    renderCategories();
    renderGrid();
    renderSchema();
  })
  .catch(() => {
    emptyState.style.display = '';
    emptyState.querySelector('p:last-child').textContent = 'Gagal memuat data perpustakaan.';
  });

/* ─── SEARCH ─── */
searchInput.addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase();
  searchClear.classList.toggle('visible', q.length > 0);
  applyFilter(q, activeCategory());
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchClear.classList.remove('visible');
  applyFilter('', activeCategory());
  searchInput.focus();
});

/* ─── CATEGORY FILTER ─── */
function activeCategory() {
  const active = categoryEl.querySelector('.pill.active');
  return active && !active.dataset.all ? active.dataset.cat : null;
}

function applyFilter(q, cat) {
  current = BOOKS.filter(b => {
    const matchQ = !q
      || b.title.toLowerCase().includes(q)
      || (b.author || '').toLowerCase().includes(q)
      || (b.tags || []).join(' ').toLowerCase().includes(q);
    const matchCat = !cat || (b.categories || []).includes(cat);
    return matchQ && matchCat;
  });
  page = 0;
  // Update label
  if (q) {
    sectionTitle.textContent = 'Hasil Pencarian';
  } else if (cat) {
    sectionTitle.textContent = cat;
  } else {
    sectionTitle.textContent = 'Koleksi';
  }
  renderGrid();
}

function renderCategories() {
  const counts = {};
  BOOKS.forEach(b => (b.categories || []).forEach(c => counts[c] = (counts[c] || 0) + 1));

  const existing = categoryEl.querySelector('[data-all]');
  // clear all except "Semua" if it exists
  categoryEl.innerHTML = '';
  const all = document.createElement('button');
  all.className = 'pill active';
  all.dataset.all = '';
  all.textContent = 'Semua';
  categoryEl.appendChild(all);

  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      const btn = document.createElement('button');
      btn.className = 'pill';
      btn.dataset.cat = cat;
      btn.textContent = cat;
      categoryEl.appendChild(btn);
    });

  categoryEl.addEventListener('click', e => {
    const btn = e.target.closest('.pill');
    if (!btn) return;
    categoryEl.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(searchInput.value.trim().toLowerCase(), btn.dataset.all !== undefined ? null : btn.dataset.cat);
  });
}

/* ─── RENDER GRID ─── */
async function renderGrid() {
  const total = current.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const slice = current.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  // Update count
  bookCountEl.textContent = total === BOOKS.length
    ? `${total} buku`
    : `${total} dari ${BOOKS.length}`;

  // Empty state
  emptyState.style.display = total === 0 ? '' : 'none';

  // Pagination visibility
  pagination.style.display = totalPages > 1 ? '' : 'none';
  prevBtn.disabled = page === 0;
  nextBtn.disabled = page >= totalPages - 1;
  indicator.textContent = `${page + 1} / ${totalPages}`;

  // Clear
  catalogEl.innerHTML = '';

  for (let i = 0; i < slice.length; i++) {
    const b = slice[i];
    const img = await getCover(b);
    const a = document.createElement('a');
    a.href = `reader.html?path=${encodeURIComponent(b.path)}`;
    a.className = 'book-card';
    a.style.animationDelay = `${i * 40}ms`;
    a.innerHTML = `
      <div class="book-cover">
        <img src="${img}" alt="" loading="lazy">
      </div>
      <div class="book-info">
        <div class="book-title">${escHtml(b.title)}</div>
        <div class="book-author">${escHtml(b.author || 'Penulis tidak diketahui')}</div>
        <div class="book-tags">
          ${(b.tags || []).slice(0, 2).map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}
        </div>
      </div>`;
    catalogEl.appendChild(a);
  }
}

prevBtn.onclick = () => { page--; renderGrid(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
nextBtn.onclick = () => { page++; renderGrid(); window.scrollTo({ top: 0, behavior: 'smooth' }); };

/* ─── UTILS ─── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ─── SCHEMA ─── */
function renderSchema() {
  document.getElementById('schema-books').textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: BOOKS.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.title,
      author: b.author
    }))
  });
}
