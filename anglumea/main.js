/* ===============================
   LOAD LINK CONFIG (JSON)
================================ */
let CARD_CONFIG = {};

fetch("links.json")
  .then(res => res.json())
  .then(data => {
    CARD_CONFIG = data;
  })
  .catch(err => {
    console.error("Failed to load links.json", err);
  });

/* ===============================
   CORE ELEMENTS
================================ */
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

/* ===============================
   COPY
================================ */
const copy = {
  about: "Anglumea is a quiet archive of independent systems.",
  support: "Support keeps the systems alive.",
  follow: `
    <div class="pen-slider">
      <div class="pen-card active">
        <div class="hologram"></div>
        <div class="pen-header">
          <span>PEN IDENTITY</span>
          <span>ID-ZH01</span>
        </div>
        <div class="pen-body">
          <div class="row"><span>Name</span><span>Zhie</span></div>
          <div class="row"><span>Gender</span><span>Male</span></div>
          <div class="row"><span>Occupation</span><span>Transportation</span></div>
          <div class="row"><span>Hobby</span><span>Sports</span></div>
          <div class="row"><span>Interest</span><span>Technology</span></div>
          <div class="row"><span>Location</span><span>Indonesia</span></div>
        </div>
        <div class="pen-footer">∴ active identity</div>
      </div>

      <div class="pen-card">
        <div class="hologram"></div>
        <div class="pen-header">
          <span>PEN IDENTITY</span>
          <span>ID-ANG02</span>
        </div>
        <div class="pen-body">
          <div class="row"><span>Name</span><span>Angyta</span></div>
          <div class="row"><span>Gender</span><span>Female</span></div>
          <div class="row"><span>Occupation</span><span>Accountant</span></div>
          <div class="row"><span>Hobby</span><span>Writing</span></div>
          <div class="row"><span>Interest</span><span>Artificial Intelligence</span></div>
          <div class="row"><span>Location</span><span>Indonesia</span></div>
        </div>
        <div class="pen-footer">∴ active identity</div>
      </div>
    </div>

    <div class="pen-nav">
      <span class="pen-dot active"></span>
      <span class="pen-dot"></span>
    </div>
  `
};

/* ===============================
   ARROWS
================================ */
function updateArrows() {
  const show = active;
  arrowLeft.style.display = show ? "flex" : "none";
  arrowRight.style.display = show ? "flex" : "none";
}

/* ===============================
   SHOW PANEL
================================ */
function showPanel(index) {
  currentIndex = index;

  const nav = document.querySelector(".core-nav");
  gsap.to(nav, { opacity: 0, duration: 0.25, onComplete: () => nav.style.pointerEvents = "none" });

  panels.forEach((p, i) => p.style.display = i === index ? "flex" : "none");

  active = true;
  viewport.classList.add("active");
  gsap.to(track, { opacity: 1, duration: 0.5 });
  viewport.style.pointerEvents = "auto";

  currentSlide = 0;
  updateSlide();
  updateArrows();
}

/* ===============================
   SLIDE
================================ */
function updateSlide() {
  const panel = panels[currentIndex];
  if (!panel) return;

  const cards = panel.querySelectorAll(".card");
  cards.forEach((c, i) => {
    const on = i === currentSlide;
    c.classList.toggle("active", on);
    gsap.to(c, { opacity: on ? 1 : 0, scale: on ? 1 : 0.9, duration: 0.4 });
  });
}

function moveSlide(dir) {
  if (currentIndex === null) return;
  const cards = panels[currentIndex].querySelectorAll(".card");
  currentSlide = (currentSlide + dir + cards.length) % cards.length;
  updateSlide();
}

/* ===============================
   NAV BUTTONS
================================ */
buttons.forEach((btn, i) => {
  btn.addEventListener("click", e => {
    e.stopPropagation();
    showPanel(i);
  });
});

/* ===============================
   CLOSE PANEL
================================ */
document.addEventListener("click", () => {
  if (!active) return;

  active = false;
  currentIndex = null;

  gsap.to(track, { opacity: 0, duration: 0.35 });
  viewport.classList.remove("active");
  viewport.style.pointerEvents = "none";

  panels.forEach(p => p.style.display = "none");
  updateArrows();

  const nav = document.querySelector(".core-nav");
  nav.style.pointerEvents = "auto";
  gsap.to(nav, { opacity: 1, duration: 0.3 });
});

panels.forEach(p => p.addEventListener("click", e => e.stopPropagation()));

/* ===============================
   ARROW EVENTS
================================ */
arrowLeft.addEventListener("click", e => { e.stopPropagation(); moveSlide(-1); });
arrowRight.addEventListener("click", e => { e.stopPropagation(); moveSlide(1); });

/* ===============================
   MODAL OPEN
================================ */
document.querySelectorAll(".peripheral span").forEach(el => {
  el.addEventListener("click", e => {
    e.stopPropagation();
    modalBox.innerHTML = copy[el.dataset.modal] || "";
    modal.style.display = "flex";
  });
});

/* ===============================
   MODAL CLOSE (SAFE)
================================ */
modal.addEventListener("pointerdown", e => {
  if (e.target === modal) modal.style.display = "none";
});

modalBox.addEventListener("pointerdown", e => {
  e.stopPropagation();
});

/* ===============================
   PEN CARD SWITCH (FINAL FIX)
================================ */
modalBox.addEventListener("pointerdown", e => {
  const dot = e.target.closest(".pen-dot");
  if (!dot) return;

  e.stopPropagation();

  const dots = modalBox.querySelectorAll(".pen-dot");
  const cards = modalBox.querySelectorAll(".pen-card");
  const index = [...dots].indexOf(dot);

  dots.forEach(d => d.classList.remove("active"));
  cards.forEach(c => c.classList.remove("active"));

  if (cards[index]) {
    dots[index].classList.add("active");
    cards[index].classList.add("active");
  }
});

/* ===============================
   PARALLAX
================================ */
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