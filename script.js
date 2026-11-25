// ==========================================================================
// STEFANI SÁNCHEZ · FULL STACK DEVELOPER
// Arquitectura JS modular, accesible y optimizada (60fps)
// ==========================================================================

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ------------------------------------------------------------------------
  // 1. GESTIÓN DE TEMA (MODO OSCURO / MODO BLANCO)
  // ------------------------------------------------------------------------
  const THEME_KEY = "stefani_portfolio_theme";
  const themeToggle = document.getElementById("theme-toggle");
  const themeLabel = document.getElementById("theme-label");
  const metaTheme = document.querySelector('meta[name="theme-color"]');

  let currentTheme = localStorage.getItem(THEME_KEY) || "dark";

  function applyTheme(nextTheme) {
    currentTheme = nextTheme;
    document.documentElement.setAttribute("data-theme", currentTheme);
    localStorage.setItem(THEME_KEY, currentTheme);

    if (themeLabel) {
      themeLabel.textContent = currentTheme === "dark" ? "Claro" : "Oscuro";
    }
    if (metaTheme) {
      metaTheme.setAttribute("content", currentTheme === "dark" ? "#090d16" : "#ffffff");
    }
  }

  applyTheme(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = currentTheme === "dark" ? "light" : "dark";
      applyTheme(next);
      showToast(next === "dark" ? "Modo oscuro activado" : "Modo claro activado");
    });
  }

  // ------------------------------------------------------------------------
  // 2. CANVAS GEOMÉTRICO SUTIL (P5AHOLIC-INSPIRED, OPTIMIZADO)
  // ------------------------------------------------------------------------
  const canvas = document.getElementById("bg-canvas");
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: -9999, y: -9999 };
    const COUNT = Math.min(55, Math.floor((width * height) / 26000));
    const MAX_DIST = 135;

    const nodes = Array.from({ length: COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1.3 + Math.random() * 1.4,
    }));

    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener("mouseleave", () => {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    function renderCanvas() {
      ctx.clearRect(0, 0, width, height);

      const isDark = currentTheme === "dark";
      const dotColor = isDark ? "rgba(148, 163, 184, 0.38)" : "rgba(15, 23, 42, 0.18)";
      const lineRGB = isDark ? "16, 185, 129" : "5, 150, 105";

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Repulsión suave cerca del cursor
        const dxm = n.x - mouse.x;
        const dym = n.y - mouse.y;
        const distM = Math.hypot(dxm, dym);
        if (distM < 110 && distM > 0) {
          const force = ((110 - distM) / 110) * 0.25;
          n.vx += (dxm / distM) * force;
          n.vy += (dym / distM) * force;
        }

        // Límite de velocidad
        n.vx *= 0.99;
        n.vy *= 0.99;
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        n.x = Math.max(0, Math.min(width, n.x));
        n.y = Math.max(0, Math.min(height, n.y));

        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dist = Math.hypot(n.x - m.x, n.y - m.y);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * (isDark ? 0.16 : 0.11);
            ctx.strokeStyle = `rgba(${lineRGB}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(renderCanvas);
    }

    requestAnimationFrame(renderCanvas);
  }

  // ------------------------------------------------------------------------
  // 3. NAVBAR, SCROLL PROGRESS & ACTIVE LINK
  // ------------------------------------------------------------------------
  const navbar = document.getElementById("navbar");
  const scrollProgress = document.getElementById("scroll-progress");

  function onScroll() {
    const y = window.scrollY;
    if (navbar) navbar.classList.toggle("is-scrolled", y > 24);
    if (scrollProgress) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const pct = maxScroll > 0 ? (y / maxScroll) * 100 : 0;
      scrollProgress.style.width = `${pct}%`;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    const sectionObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach((link) => {
              link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    sections.forEach((sec) => sectionObs.observe(sec));
  }

  // ------------------------------------------------------------------------
  // 4. MENÚ MÓVIL ACCESIBLE
  // ------------------------------------------------------------------------
  const menuToggle = document.getElementById("menu-toggle");
  const mobileDrawer = document.getElementById("mobile-drawer");

  function setDrawer(open) {
    if (!menuToggle || !mobileDrawer) return;
    mobileDrawer.classList.toggle("is-open", open);
    mobileDrawer.setAttribute("aria-hidden", String(!open));
    menuToggle.setAttribute("aria-expanded", String(open));
  }

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener("click", () => {
      setDrawer(!mobileDrawer.classList.contains("is-open"));
    });

    mobileDrawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setDrawer(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setDrawer(false);
    });
  }

  // ------------------------------------------------------------------------
  // 5. SCROLL REVEAL & BARRAS DE HABILIDADES
  // ------------------------------------------------------------------------
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => revealObs.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  const skillItems = document.querySelectorAll(".skill-item");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const skillObs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = entry.target.querySelector(".skill-bar");
            const level = entry.target.getAttribute("data-level") || "0";
            if (bar) bar.style.width = `${level}%`;
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    skillItems.forEach((item) => skillObs.observe(item));
  } else {
    skillItems.forEach((item) => {
      const bar = item.querySelector(".skill-bar");
      if (bar) bar.style.width = `${item.getAttribute("data-level") || 0}%`;
    });
  }

  // ------------------------------------------------------------------------
  // 6. TILT SUTIL EN RETRATO HERO
  // ------------------------------------------------------------------------
  const portraitCard = document.getElementById("portrait-card");
  if (portraitCard && !prefersReducedMotion) {
    portraitCard.addEventListener("mousemove", (e) => {
      const rect = portraitCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      portraitCard.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });

    portraitCard.addEventListener("mouseleave", () => {
      portraitCard.style.transform = "";
    });
  }

  // ------------------------------------------------------------------------
  // 7. COPIAR EMAIL & TOAST
  // ------------------------------------------------------------------------
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2600);
  }

  const copyBtn = document.getElementById("copy-email");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const email = copyBtn.getAttribute("data-email") || "steff.18random@gmail.com";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
          copyBtn.textContent = "Copiado ✓";
          showToast(`Correo copiado: ${email}`);
          setTimeout(() => {
            copyBtn.textContent = "Copiar";
          }, 2000);
        });
      } else {
        showToast(`Correo: ${email}`);
      }
    });
  }

  // ------------------------------------------------------------------------
  // 8. AÑO EN FOOTER
  // ------------------------------------------------------------------------
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
