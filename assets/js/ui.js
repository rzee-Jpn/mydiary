const sidebar = document.getElementById("sidebar");
const handle = document.getElementById("pullHandle");
const header = document.getElementById("header");
const closeBtn = document.getElementById("sidebarClose");

let isOpen = false;

/* posisi awal sidebar */
gsap.set(sidebar, { x: "-100%" });

function openSidebar() {
  gsap.to(sidebar, {
    x: 0,
    duration: 0.55,
    ease: "power3.out"
  });
  isOpen = true;
}

function closeSidebar() {
  gsap.to(sidebar, {
    x: "-100%",
    duration: 0.45,
    ease: "power3.in"
  });
  isOpen = false;
}

/* pull handle */
handle.addEventListener("click", () => {
  isOpen ? closeSidebar() : openSidebar();
});

/* tombol X di sidebar */
if (closeBtn) {
  closeBtn.addEventListener("click", closeSidebar);
}

/* auto hide header saat scroll */
let lastScroll = 0;
window.addEventListener("scroll", () => {
  const now = window.scrollY;
  header.style.transform =
    now > lastScroll ? "translateY(-100%)" : "translateY(0)";
  lastScroll = now;
});

// ===== ZEN MODE =====
let zen = false;

function toggleZen() {
  const footer = document.querySelector("footer.progress");

  if (!zen) {
    gsap.to([header, sidebar, handle, footer], {
      opacity: 0,
      duration: 0.4,
      display: "none",
      ease: "power2.out"
    });
    document.body.classList.add("zen-mode");
    zen = true;
  } else {
    gsap.to(header, { opacity: 1, display: "flex", duration: 0.4 });
    gsap.to(footer, { opacity: 1, display: "flex", duration: 0.4 });
    gsap.to(handle, { opacity: 1, display: "block", duration: 0.4 });
    gsap.set(sidebar, { x: "-100%", display: "block", opacity: 1 });
    document.body.classList.remove("zen-mode");
    zen = false;
    isOpen = false;
  }
}

/* double tap / click */
let lastTap = 0;
window.addEventListener("click", () => {
  const now = Date.now();
  if (now - lastTap < 400) toggleZen();
  lastTap = now;
});

/* shortcut Z */
window.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "z") toggleZen();
});