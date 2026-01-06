const sidebar = document.getElementById("sidebar");
const handle = document.getElementById("pullHandle");
const closeBtn = document.getElementById("closeSidebar");
const header = document.getElementById("header");
const footer = document.querySelector("footer.progress");

let isOpen = false;

/* INIT */
gsap.set(sidebar, { x: "-100%" });

handle.onclick = () => {
  gsap.to(sidebar, { x: 0, duration: .5, ease: "power3.out" });
  isOpen = true;
};

closeBtn.onclick = closeSidebar;

function closeSidebar() {
  gsap.to(sidebar, { x: "-100%", duration: .4, ease: "power3.in" });
  isOpen = false;
}

/* AUTO HIDE HEADER */
let lastScroll = 0;
window.addEventListener("scroll", () => {
  const now = window.scrollY;
  header.style.transform =
    now > lastScroll ? "translateY(-100%)" : "translateY(0)";
  lastScroll = now;
});

/* ZEN MODE */
let zen = false;
let lastTap = 0;

function toggleZen() {
  zen = !zen;
  document.body.classList.toggle("zen-mode", zen);
  closeSidebar();
}

window.addEventListener("click", () => {
  const now = Date.now();
  if (now - lastTap < 350) toggleZen();
  lastTap = now;
});

window.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "z") toggleZen();
});

/* FONT ZOOM */
const reader = document.getElementById("reader");
let fontSize = parseFloat(localStorage.getItem("readerFontSize")) || 1.05;

function applyFont() {
  reader.style.fontSize = fontSize + "rem";
  localStorage.setItem("readerFontSize", fontSize);
}

document.getElementById("zoomIn").onclick = () => {
  fontSize = Math.min(fontSize + .1, 1.8);
  applyFont();
};

document.getElementById("zoomOut").onclick = () => {
  fontSize = Math.max(fontSize - .1, .8);
  applyFont();
};

applyFont();