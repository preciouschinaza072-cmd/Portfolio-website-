const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const loadingScreen = document.getElementById("loadingScreen");
const progress = document.getElementById("scrollProgress");
const year = document.getElementById("year");

year.textContent = new Date().getFullYear();

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
}

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
  window.setTimeout(() => loadingScreen.classList.add("hidden"), reducedMotion ? 0 : 350);
});

const reveals = document.querySelectorAll(".reveal");

if (reducedMotion) {
  reveals.forEach((el) => el.classList.add("show"));
} else {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach((el) => observer.observe(el));
}

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
const particles = [];
const maxParticles = 42;
let raf;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function createParticle() {
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.4 + .3,
    vx: (Math.random() - .5) * .16,
    vy: (Math.random() - .5) * .16,
    a: Math.random() * .35 + .08
  };
}

function resetParticles() {
  particles.length = 0;
  for (let i = 0; i < maxParticles; i++) particles.push(createParticle());
}

function animate() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles.forEach((p) => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > window.innerWidth || p.y < 0 || p.y > window.innerHeight) Object.assign(p, createParticle());
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(164,195,255,${p.a})`;
    ctx.fill();
  });
  raf = requestAnimationFrame(animate);
}

if (!reducedMotion) {
  resizeCanvas();
  resetParticles();
  animate();
  window.addEventListener("resize", () => { resizeCanvas(); resetParticles(); });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && raf) cancelAnimationFrame(raf);
    if (!document.hidden) animate();
  });
} else {
  canvas.remove();
}
