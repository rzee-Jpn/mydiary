const sidebar = document.getElementById("sidebar");
const handle = document.getElementById("pullHandle");
const closeBtn = document.getElementById("closeSidebar");
const overlay = document.getElementById("sidebarOverlay");

const reader = document.getElementById("reader");
const zoomIn = document.getElementById("zoomIn");
const zoomOut = document.getElementById("zoomOut");

const SIDEBAR_DURATION = 0.35;

/* INIT */
gsap.set(sidebar, { x: "-100%" });
gsap.set(overlay, { autoAlpha: 0 });

/* SIDEBAR OPEN */
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

/* SIDEBAR CLOSE */
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

/* EVENTS */
handle.addEventListener("click", openSidebar);
closeBtn.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

/* FONT SIZE */
let size = parseFloat(localStorage.getItem("fontSize")) || 1.05;

function applyFont() {
  reader.style.fontSize = size + "rem";
  localStorage.setItem("fontSize", size);
}

zoomIn.onclick = () => {
  size = Math.min(size + 0.1, 1.8);
  applyFont();
};

zoomOut.onclick = () => {
  size = Math.max(size - 0.1, 0.8);
  applyFont();
};

applyFont();