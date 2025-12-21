const sidebar = document.getElementById("sidebar");
const handle = document.getElementById("pullHandle");
const header = document.getElementById("header");

let open = false;

handle.addEventListener("click", () => {
  open = !open;

  gsap.to(sidebar, {
    x: open ? 280 : 0,
    duration: 0.6,
    ease: "power3.out"
  });
});

let lastScroll = 0;
window.addEventListener("scroll", () => {
  const current = window.scrollY;
  if (current > lastScroll) {
    header.style.transform = "translateY(-100%)";
  } else {
    header.style.transform = "translateY(0)";
  }
  lastScroll = current;
});