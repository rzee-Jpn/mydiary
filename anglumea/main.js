const panels = document.querySelectorAll(".panel");
const buttons = document.querySelectorAll(".core-nav button");
const track = document.querySelector(".track");
const viewport = document.querySelector(".viewport");
const arrowLeft = document.querySelector(".arrow-left");
const arrowRight = document.querySelector(".arrow-right");
const modal = document.getElementById("modal");
const modalBox = document.getElementById("modal-box");

let active = false;
let currentIndex = null;
let currentSlide = 0;

const copy = {
  about: "Anglumea is a quiet archive of independent systems.",
  support: "Support keeps the systems alive.",
  follow: "Follow only if the work resonates."
};

function updateArrows() {
  const show = active;
  arrowLeft.style.display = show ? "flex" : "none";
  arrowRight.style.display = show ? "flex" : "none";
}

/* --- SHOW PANEL --- */
function showPanel(index) {
  currentIndex = index;
  const nav = document.querySelector(".core-nav");
  gsap.to(nav, { opacity: 0, duration: 0.25, onComplete: () => (nav.style.pointerEvents = "none") });

  panels.forEach((p, i) => (p.style.display = i === index ? "flex" : "none"));

  if (!active) {
    active = true;
    viewport.classList.add("active");
    gsap.to(track, { opacity: 1, duration: 0.5, ease: "power2.out" });
    viewport.style.pointerEvents = "auto";
  }

  currentSlide = 0;
  updateSlide();
  updateArrows();
}

/* --- UPDATE SLIDE --- */
function updateSlide() {
  const panel = panels[currentIndex];
  const cards = panel.querySelectorAll(".card");
  cards.forEach((c, i) => {
    const isActive = i === currentSlide;
    c.classList.toggle("active", isActive);
    gsap.to(c, {
      opacity: isActive ? 1 : 0,
      scale: isActive ? 1 : 0.9,
      duration: 0.4,
      ease: "power2.out"
    });
  });
}

/* --- MOVE SLIDE --- */
function moveSlide(dir) {
  if (currentIndex === null) return;
  const cards = panels[currentIndex].querySelectorAll(".card");
  currentSlide = (currentSlide + dir + cards.length) % cards.length;
  updateSlide();
}

/* --- NAV BUTTONS --- */
buttons.forEach((btn, i) => {
  btn.addEventListener("click", e => {
    e.stopPropagation();
    showPanel(i);
  });
});

/* --- CLOSE ON EMPTY CLICK --- */
document.addEventListener("click", () => {
  if (!active) return;
  active = false;
  currentIndex = null;
  gsap.to(track, { opacity: 0, duration: 0.35 });
  viewport.classList.remove("active");
  viewport.style.pointerEvents = "none";
  panels.forEach(p => (p.style.display = "none"));
  updateArrows();

  const nav = document.querySelector(".core-nav");
  nav.style.pointerEvents = "auto";
  gsap.to(nav, { opacity: 1, duration: 0.3 });
});

/* --- PREVENT CLOSING WHEN CLICK INSIDE PANEL --- */
panels.forEach(p => p.addEventListener("click", e => e.stopPropagation()));

/* --- ARROWS --- */
arrowLeft.addEventListener("click", e => {
  e.stopPropagation();
  moveSlide(-1);
});
arrowRight.addEventListener("click", e => {
  e.stopPropagation();
  moveSlide(1);
});

/* --- MODALS --- */
document.querySelectorAll(".peripheral span").forEach(el => {
  el.onclick = e => {
    e.stopPropagation();
    modalBox.textContent = copy[el.dataset.modal] || "";
    modal.style.display = "flex";
  };
});
modal.onclick = () => (modal.style.display = "none");

/* --- PARALLAX BACKGROUND --- */
let px = 0, py = 0, ticking = false;
document.addEventListener("mousemove", e => {
  px = (e.clientX / window.innerWidth - 0.5) * 8;
  py = (e.clientY / window.innerHeight - 0.5) * 8;
  if (!ticking) {
    requestAnimationFrame(() => {
      gsap.to("#bg-parallax", { x: px, y: py, duration: 0.8 });
      ticking = false;
    });
    ticking = true;
  }
});

window.addEventListener("resize", updateArrows);
updateArrows();