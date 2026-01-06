const sidebar = document.getElementById("sidebar");
const handle = document.getElementById("pullHandle");

let open = false;
gsap.set(sidebar, { x: "-100%" });

handle.addEventListener("click", () => {
  open = !open;
  gsap.to(sidebar, {
    x: open ? 0 : "-100%",
    duration: 0.35,
    ease: "power3.out"
  });
});