/* ─── UI.JS — Sidebar, Font Size, Zen Mode ─── */

const sidebar        = document.getElementById('sidebar');
const overlay        = document.getElementById('sidebarOverlay');
const openBtn        = document.getElementById('openSidebarBtn');
const closeBtn       = document.getElementById('closeSidebar');
const reader         = document.getElementById('reader');
const zoomIn         = document.getElementById('zoomIn');
const zoomOut        = document.getElementById('zoomOut');

/* ─── SIDEBAR (pure CSS transition, no GSAP needed) ─── */
function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

window.closeSidebar = closeSidebar;

openBtn?.addEventListener('click', openSidebar);
closeBtn?.addEventListener('click', closeSidebar);
overlay?.addEventListener('click', closeSidebar);

// Keyboard: Escape closes sidebar
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSidebar();
});

/* ─── APPLY SIDEBAR OPEN STYLES via CSS class ─── */
// Inject into sidebar.css behavior
const sidebarStyle = document.createElement('style');
sidebarStyle.textContent = `
  #sidebar {
    transform: translateX(100%);
    transition: transform .32s cubic-bezier(.4,0,.2,1);
  }
  #sidebar.open {
    transform: translateX(0);
  }
  #sidebarOverlay {
    transition: opacity .25s, visibility .25s;
  }
  #sidebarOverlay.open {
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
  }
`;
document.head.appendChild(sidebarStyle);

/* ─── FONT SIZE ─── */
let fontSize = parseFloat(localStorage.getItem('reader_fontSize')) || 1.05;

function applyFontSize() {
  if (!reader) return;
  reader.style.fontSize = fontSize + 'rem';
  localStorage.setItem('reader_fontSize', fontSize);
}

zoomIn?.addEventListener('click', () => {
  fontSize = Math.min(fontSize + 0.1, 1.8);
  applyFontSize();
});

zoomOut?.addEventListener('click', () => {
  fontSize = Math.max(fontSize - 0.1, 0.8);
  applyFontSize();
});

applyFontSize();

/* ─── ZEN MODE (double-tap) ─── */
(() => {
  if (!reader) return;
  let lastTap = 0;

  function setZen(on) {
    document.body.classList.toggle('zen-mode', on);
    try { localStorage.setItem('reader_zen', on ? '1' : '0'); } catch { /* */ }
  }

  try {
    if (localStorage.getItem('reader_zen') === '1') setZen(true);
  } catch { /* */ }

  reader.addEventListener('touchend', e => {
    const now = Date.now();
    const delta = now - lastTap;
    if (delta > 80 && delta < 300) {
      setZen(!document.body.classList.contains('zen-mode'));
      e.preventDefault();
    }
    lastTap = now;
  });
})();