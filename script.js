const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotion = reducedMotionQuery.matches;
    const loadingScreen = document.getElementById("loadingScreen");
    const scrollProgress = document.getElementById("scrollProgress");

    function updateScrollProgress() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      scrollProgress.style.transform = `scaleX(${Math.min(progress, 100) / 100})`;
    }

    if (reducedMotion) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("show"));
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      }, { threshold: 0.14 });

      document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    }

    window.addEventListener("load", () => {
      setTimeout(() => loadingScreen.classList.add("hidden"), reducedMotion ? 0 : 420);
      document.body.classList.add("loaded");
    });

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    updateScrollProgress();

    const tiltCards = document.querySelectorAll(".tilt-card");
    if (!reducedMotion) {
      tiltCards.forEach((card) => {
        card.addEventListener("mousemove", (event) => {
          const bounds = card.getBoundingClientRect();
          const px = (event.clientX - bounds.left) / bounds.width;
          const py = (event.clientY - bounds.top) / bounds.height;
          const rotateY = (px - 0.5) * 6;
          const rotateX = (0.5 - py) * 6;
          card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener("mouseleave", () => {
          card.style.transform = "";
        });
      });
    }

    const canvas = document.getElementById("particles");
    const ctx = canvas.getContext("2d");
    const particles = [];
    const maxParticles = 56;
    let rafId;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function makeParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.8 + 0.4,
        speedX: (Math.random() - 0.5) * 0.24,
        speedY: (Math.random() - 0.5) * 0.24,
        alpha: Math.random() * 0.5 + 0.2,
      };
    }

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < maxParticles; i += 1) {
        particles.push(makeParticle());
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, index) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          particles[index] = makeParticle();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(164, 195, 255, ${p.alpha})`;
        ctx.fill();
      });

      rafId = requestAnimationFrame(animateParticles);
    }

    if (!reducedMotion) {
      resizeCanvas();
      initParticles();
      animateParticles();

      window.addEventListener("resize", () => {
        resizeCanvas();
        initParticles();
      });

      document.addEventListener("visibilitychange", () => {
        if (document.hidden && rafId) {
          cancelAnimationFrame(rafId);
        } else if (!document.hidden) {
          animateParticles();
        }
      });
    } else {
      canvas.style.display = "none";
    }
