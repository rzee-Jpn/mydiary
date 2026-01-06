const sidebar = document.getElementById("sidebar");
const handle = document.getElementById("pullHandle");
const closeBtn = document.getElementById("closeSidebar");

gsap.set(sidebar, { x: "-100%" });

handle.onclick = () => gsap.to(sidebar, { x: 0 });
closeBtn.onclick = () => gsap.to(sidebar, { x: "-100%" });

let size = parseFloat(localStorage.getItem("fontSize")) || 1.05;
const reader = document.getElementById("reader");

function apply() {
  reader.style.fontSize = size + "rem";
  localStorage.setItem("fontSize", size);
}

document.getElementById("zoomIn").onclick = () => {
  size = Math.min(size + .1, 1.8); apply();
};
document.getElementById("zoomOut").onclick = () => {
  size = Math.max(size - .1, .8); apply();
};

apply();