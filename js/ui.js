const sidebar = document.getElementById("sidebar");  
const handle = document.getElementById("pullHandle");  
const header = document.getElementById("header");  

let isOpen = false;

// pastikan posisi awal  
gsap.set(sidebar, { x: "-100%" });  

handle.addEventListener("click", () => {  
  if (!isOpen) {  
    gsap.to(sidebar, { x: 0, duration: 0.55, ease: "power3.out" });  
  } else {  
    gsap.to(sidebar, { x: "-100%", duration: 0.45, ease: "power3.in" });  
  }  
  isOpen = !isOpen;  
});  

/* auto-hide header */  
let lastScroll = 0;  
window.addEventListener("scroll", () => {  
  const now = window.scrollY;  
  header.style.transform = now > lastScroll ? "translateY(-100%)" : "translateY(0)";  
  lastScroll = now;  
});

// ===== ZEN MODE =====
let zen = false;

// toggle Zen Mode
function toggleZen() {
  const footer = document.querySelector("footer.progress");
  if (!zen) {
    gsap.to([header, sidebar, handle, footer], { opacity:0, duration:0.5, display:"none", ease:"power2.out" });
    document.body.classList.add("zen-mode");
    zen = true;
  } else {
    gsap.to(header, { opacity:1, duration:0.5, display:"flex", ease:"power2.out" });
    gsap.to(footer, { opacity:1, duration:0.5, display:"flex", ease:"power2.out" });
    gsap.to(handle, { opacity:1, duration:0.5, display:"block", ease:"power2.out" });
    gsap.to(sidebar, { x: "-100%", opacity:1, duration:0.5, display:"block", ease:"power2.out" });
    document.body.classList.remove("zen-mode");
    zen = false;
  }
}

// double-tap / double-click for Zen Mode
let lastTap = 0;
window.addEventListener("click", (e) => {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTap;
  if (tapLength < 400 && tapLength > 0) {
    toggleZen();
  }
  lastTap = currentTime;
});

// shortcut key Z
window.addEventListener("keydown", e => {
  if(e.key.toLowerCase() === "z") toggleZen();
});