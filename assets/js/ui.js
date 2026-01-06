/* =========================
   SIDEBAR + UI CONTROLS
========================= */

const sidebar = document.getElementById("sidebar");
const handle = document.getElementById("pullHandle");
const closeBtn = document.getElementById("closeSidebar");
const overlay = document.getElementById("sidebarOverlay");

const reader = document.getElementById("reader");
const zoomIn = document.getElementById("zoomIn");
const zoomOut = document.getElementById("zoomOut");

const SIDEBAR_DURATION = 0.35;

/* =========================
   INIT
========================= */
gsap.set(sidebar, { x: "-100%" });
gsap.set(overlay, { autoAlpha: 0 });
gsap.set(handle, { autoAlpha: 1 });

/* =========================
   SIDEBAR OPEN
========================= */
function openSidebar() {
  gsap.to(sidebar, {
    x: 0,
    duration: SIDEBAR_DURATION,
    ease: "power2.out"
  });

  gsap.to(overlay, {
    autoAlpha: 1,
    duration: 0.25,
    pointerEvents: "auto"
  });

  gsap.to(handle, {
    autoAlpha: 0,
    duration: 0.2
  });
}

/* =========================
   SIDEBAR CLOSE
   (EXPOSED GLOBAL)
========================= */
function closeSidebar() {
  gsap.to(sidebar, {
    x: "-100%",
    duration: SIDEBAR_DURATION,
    ease: "power2.in"
  });

  gsap.to(overlay, {
    autoAlpha: 0,
    duration: 0.25,
    pointerEvents: "none"
  });

  gsap.to(handle, {
    autoAlpha: 1,
    duration: 0.2,
    delay: 0.15
  });
}

/* ⬅️ PENTING: bikin global */
window.closeSidebar = closeSidebar;

/* =========================
   EVENTS
========================= */
handle.addEventListener("click", openSidebar);
closeBtn.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

/* =========================
   FONT SIZE CONTROL
========================= */
let size = parseFloat(localStorage.getItem("fontSize")) || 1.05;

function applyFont() {
  if (!reader) return;
  reader.style.fontSize = size + "rem";
  localStorage.setItem("fontSize", size);
}

zoomIn?.addEventListener("click", () => {
  size = Math.min(size + 0.1, 1.8);
  applyFont();
});

zoomOut?.addEventListener("click", () => {
  size = Math.max(size - 0.1, 0.8);
  applyFont();
});

applyFont();

/* =========================
   ZEN MODE (DOUBLE TAP)
========================= */
(() => {
  if (!reader) return;

  const KEY = "reader_zen_mode";
  let lastTap = 0;

  function setZen(on) {
    document.body.classList.toggle("zen-mode", on);
    localStorage.setItem(KEY, on ? "1" : "0");
  }

  // restore state
  if (localStorage.getItem(KEY) === "1") {
    setZen(true);
  }

  reader.addEventListener("touchend", (e) => {
    const now = Date.now();
    const delta = now - lastTap;

    if (delta > 80 && delta < 300) {
      setZen(!document.body.classList.contains("zen-mode"));
      e.preventDefault();
    }

    lastTap = now;
  });
})();