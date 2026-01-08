/* ---------------------------------
   ANGLUMEA ULTRA — main.js (Cinematic)
--------------------------------- */

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

/* --- Modal text --- */
const copy = {
  about: "Anglumea is a quiet archive of independent systems.",
  support: "Support keeps the systems alive.",
  follow: "Follow only if the work resonates."
};

/* --- Show/hide arrow buttons --- */
function updateArrows() {
  const show = active;
  arrowLeft.style.display = show ? "block" : "none";
  arrowRight.style.display = show ? "block" : "none";
}

/* --- Show a specific panel --- */
function showPanel(index) {
  currentIndex = index;

  const nav = document.querySelector(".core-nav");
  gsap.to(nav, { opacity: 0, duration: 0.25, onComplete: () => (nav.style.pointerEvents = "none") });

  panels.forEach((p, i) => {
    p.style.display = i === index ? "flex" : "none";
    if (i === index) {
      // cinematic entrance
      gsap.fromTo(
        p,
        { opacity: 0, scale: 0.92, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  });

  if (!active) {
    active = true;
    gsap.to(track, { opacity: 1, duration: 0.5, ease: "power1.out" });
    viewport.classList.add("active");
    viewport.style.pointerEvents = "auto";
  }

  currentSlide = 0;
  updateSlide();
  updateArrows();
}

/* --- Update slide --- */
function updateSlide() {
  const panel = panels[currentIndex];
  const cards = panel.querySelectorAll(".card");

  cards.forEach((c, i) => {
    const isActive = i === currentSlide;
    gsap.to(c, {
      opacity: isActive ? 1 : 0,
      scale: isActive ? 1 : 0.9,
      duration: 0.4,
      ease: "power2.out"
    });
    c.style.pointerEvents = isActive ? "auto" : "none";
    c.classList.toggle("active", isActive);
  });
}

/* --- Move slides left/right --- */
function moveSlide(dir) {
  if (currentIndex === null) return;
  const cards = panels[currentIndex].querySelectorAll(".card");
  if (!cards.length) return;

  currentSlide = (currentSlide + dir + cards.length) % cards.length;

  // cinematic slide transition
  const panel = panels[currentIndex];
  const activeCard = panel.querySelector(".card.active");
  if (activeCard) {
    gsap.fromTo(
      activeCard,
      { opacity: 1, scale: 1 },
      { opacity: 0, scale: 0.92, duration: 0.3, ease: "power1.in" }
    );
  }

  setTimeout(updateSlide, 200);
}

/* --- Navigation buttons --- */
buttons.forEach((btn, i) => {
  btn.addEventListener("click", e => {
    e.stopPropagation();
    showPanel(i);
  });
});

/* --- Close panel when clicking outside --- */
document.addEventListener("click", () => {
  if (!active) return;
  active = false;
  currentIndex = null;

  // cinematic exit
  gsap.to(track, { opacity: 0, scale: 0.96, duration: 0.45, ease: "power2.inOut" });
  viewport.classList.remove("active");
  viewport.style.pointerEvents = "none";

  panels.forEach(p => {
    gsap.to(p, { opacity: 0, y: 20, duration: 0.3, onComplete: () => (p.style.display = "none") });
  });

  updateArrows();

  const nav = document.querySelector(".core-nav");
  nav.style.pointerEvents = "auto";
  gsap.to(nav, { opacity: 1, duration: 0.45, delay: 0.15, ease: "power2.out" });
});

/* --- Prevent closing when clicking inside panel --- */
panels.forEach(p => p.addEventListener("click", e => e.stopPropagation()));

/* --- Arrows --- */
arrowLeft.addEventListener("click", e => {
  e.stopPropagation();
  moveSlide(-1);
});
arrowRight.addEventListener("click", e => {
  e.stopPropagation();
  moveSlide(1);
});

/* --- Peripheral modals --- */
document.querySelectorAll(".peripheral span").forEach(el => {
  el.onclick = e => {
    e.stopPropagation();
    modalBox.textContent = copy[el.dataset.modal] || "";
    modal.style.display = "flex";
    gsap.fromTo(
      modalBox,
      { opacity: 0, scale: 0.9, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
  };
});
modal.onclick = () => {
  gsap.to(modalBox, {
    opacity: 0,
    scale: 0.9,
    duration: 0.3,
    ease: "power2.in",
    onComplete: () => (modal.style.display = "none")
  });
};

/* --- Parallax background --- */
let px = 0,
  py = 0,
  ticking = false;
document.addEventListener("mousemove", e => {
  px = (e.clientX / window.innerWidth - 0.5) * 8;
  py = (e.clientY / window.innerHeight - 0.5) * 8;
  if (!ticking) {
    requestAnimationFrame(() => {
      gsap.to("#bg-parallax", { x: px, y: py, duration: 0.8, ease: "power1.out" });
      ticking = false;
    });
    ticking = true;
  }
});

/* --- Resize event --- */
window.addEventListener("resize", updateArrows);
updateArrows();