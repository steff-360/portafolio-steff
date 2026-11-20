// ==========================================================================
// PORTAFOLIO STEFANI SÁNCHEZ — Ultra-Animated Cinematic Version
// Inspirado en: bruno-simon, brittany-chiang, p5aholic, itssharl.ee, vanholtz
// ==========================================================================

(function () {
  "use strict";

  // -------------------------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------------------------
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
  }

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  // -------------------------------------------------------------------------
  // 1. LOADER SEQUENCE
  // -------------------------------------------------------------------------
  const loader = document.getElementById("loader");
  const loaderBar = document.getElementById("loader-bar");
  const loaderLabel = document.getElementById("loader-label");
  const loaderPercent = document.getElementById("loader-percent");
  const loaderEnter = document.getElementById("loader-enter");

  const loaderLabels = [
    "Compilando assets...",
    "Cargando portafolio...",
    "Preparando experiencia...",
    "Listo.",
  ];

  let loaderProgress = 0;
  let loaderLabelIndex = 0;
  let loaderDone = false;

  function tickLoader() {
    if (loaderDone) return;
    loaderProgress += rand(1.2, 3.5);
    if (loaderProgress >= 100) {
      loaderProgress = 100;
      loaderDone = true;
    }
    if (loaderBar) loaderBar.style.width = loaderProgress + "%";
    if (loaderPercent) loaderPercent.textContent = Math.round(loaderProgress) + "%";

    // Cycle label text
    const newIndex = Math.floor((loaderProgress / 100) * (loaderLabels.length - 1));
    if (newIndex !== loaderLabelIndex && newIndex < loaderLabels.length) {
      loaderLabelIndex = newIndex;
      if (loaderLabel) loaderLabel.textContent = loaderLabels[loaderLabelIndex];
    }

    if (loaderDone) {
      if (loaderLabel) loaderLabel.textContent = loaderLabels[loaderLabels.length - 1];
      if (loaderEnter) {
        loaderEnter.classList.add("is-ready");
        loaderEnter.focus();
      }
    } else {
      setTimeout(tickLoader, 50);
    }
  }

  function finishLoader() {
    if (loader) loader.classList.add("is-done");
    // Trigger post-load features
    setTimeout(() => {
      startCounters();
      initSkillBars();
    }, 600);
  }

  if (loaderEnter) {
    loaderEnter.addEventListener("click", finishLoader);
  }

  // -------------------------------------------------------------------------
  // THEME SYSTEM
  // -------------------------------------------------------------------------
  const themeToggle = document.getElementById("theme-toggle");
  const themeLabel = document.getElementById("theme-label");
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    const isLight = theme === "light";
    document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
    if (themeLabel) themeLabel.textContent = isLight ? "DARK" : "LIGHT";
    if (themeToggle) {
      const icon = themeToggle.querySelector(".theme-icon");
      if (icon) icon.textContent = isLight ? "◐" : "☀";
      themeToggle.setAttribute("aria-label", isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro");
    }
    if (themeMeta) themeMeta.setAttribute("content", isLight ? "#edf4f8" : "#050810");
  }

  let savedTheme = "dark";
  try {
    savedTheme = localStorage.getItem("portfolio-theme") || "dark";
  } catch (e) {}
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      if (typeof document.startViewTransition === "function" &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        document.startViewTransition(() => applyTheme(nextTheme));
      } else {
        applyTheme(nextTheme);
      }
      try { localStorage.setItem("portfolio-theme", nextTheme); } catch (e) {}
      showToast(nextTheme === "light" ? "Modo claro activado" : "Modo oscuro activado");
    });
  }

  // Start loader on DOMContentLoaded
  setTimeout(tickLoader, 300);

  // -------------------------------------------------------------------------
  // 2. CUSTOM CURSOR
  // -------------------------------------------------------------------------
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorRing = document.querySelector(".cursor-ring");

  let mouseX = -200, mouseY = -200;
  let ringX = -200, ringY = -200;
  let cursorRAF = null;

  if (cursorDot && cursorRing) {
    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + "px";
      cursorDot.style.top = mouseY + "px";
    });

    function animateCursor() {
      ringX = lerp(ringX, mouseX, 0.12);
      ringY = lerp(ringY, mouseY, 0.12);
      cursorRing.style.left = ringX + "px";
      cursorRing.style.top = ringY + "px";
      cursorRAF = requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover state on interactive elements
    const hoverEls = document.querySelectorAll("a, button, .project-row, .ac-cell, .value-card");
    hoverEls.forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
    });

    // Hide cursor when leaving window
    document.addEventListener("mouseleave", () => {
      cursorDot.style.opacity = "0";
      cursorRing.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
      cursorDot.style.opacity = "";
      cursorRing.style.opacity = "";
    });
  }

  // -------------------------------------------------------------------------
  // 3. CANVAS PARTICLE SYSTEM (p5aholic style — interactive with mouse)
  // -------------------------------------------------------------------------
  const canvas = document.getElementById("bg-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // Accent colors for particles
    const particleColors = [
      "rgba(255,107,107,",   // coral
      "rgba(78,205,196,",    // cyan
      "rgba(255,207,74,",    // gold
      "rgba(100,255,218,",   // green mint
      "rgba(180,120,255,",   // purple
    ];

    const PARTICLE_COUNT = 70;
    const CONNECT_DIST = 130;
    const REPEL_RADIUS = 110;
    const REPEL_FORCE = 0.4;

    let particles = [];
    let mouse = { x: -9999, y: -9999 };

    class Particle {
      constructor() {
        this.reset(true);
      }
      reset(randomY = false) {
        this.x = rand(0, W);
        this.y = randomY ? rand(0, H) : rand(-20, 0);
        this.vx = rand(-0.3, 0.3);
        this.vy = rand(0.1, 0.4);
        this.r = rand(1.5, 3.5);
        this.color = particleColors[Math.floor(rand(0, particleColors.length))];
        this.alpha = rand(0.4, 0.9);
        this.baseAlpha = this.alpha;
      }
      update() {
        // Mouse repulsion
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_RADIUS && dist > 0) {
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS * REPEL_FORCE;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }
        // Damping
        this.vx *= 0.98;
        this.vy *= 0.98;
        // Drift
        this.x += this.vx;
        this.y += this.vy;
        // Wrap edges
        if (this.x < -10) this.x = W + 10;
        if (this.x > W + 10) this.x = -10;
        if (this.y > H + 10) this.reset(false);
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.alpha + ")";
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    // Track mouse for canvas
    document.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const opacity = (1 - dist / CONNECT_DIST) * 0.25;
            ctx.strokeStyle = "rgba(100,255,218," + opacity + ")";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animateCanvas() {
      ctx.clearRect(0, 0, W, H);
      drawConnections();
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateCanvas);
    }
    animateCanvas();

    window.addEventListener("resize", () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    });
  }

  // -------------------------------------------------------------------------
  // 4. SCROLL PROGRESS BAR
  // -------------------------------------------------------------------------
  const scrollBar = document.getElementById("scroll-bar");
  if (scrollBar) {
    window.addEventListener("scroll", () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      scrollBar.style.width = pct + "%";
      const xpFill = document.getElementById("xp-fill");
      const xpValue = document.getElementById("xp-value");
      if (xpFill) xpFill.style.width = pct + "%";
      if (xpValue) xpValue.textContent = Math.round(pct) + "%";
    }, { passive: true });
  }

  // -------------------------------------------------------------------------
  // 5. NAV SCROLL BEHAVIOR
  // -------------------------------------------------------------------------
  const nav = document.querySelector(".nav");
  if (nav) {
    window.addEventListener("scroll", () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 50);
      const hudLevel = document.getElementById("hud-level");
      if (hudLevel) {
        const zone = Math.min(6, 1 + Math.floor(window.scrollY / Math.max(1, (document.documentElement.scrollHeight - window.innerHeight) / 6)));
        hudLevel.textContent = String(zone).padStart(2, "0");
      }
    }, { passive: true });
  }

  // -------------------------------------------------------------------------
  // 6. MOBILE MENU
  // -------------------------------------------------------------------------
  const menuBtn = document.getElementById("nav-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      menuBtn.textContent = isOpen ? "✕" : "☰";
    });

    // Close on nav link click
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.textContent = "☰";
      });
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) {
        mobileMenu.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.textContent = "☰";
      }
    });
  }

  // -------------------------------------------------------------------------
  // 7. SCROLL REVEAL (IntersectionObserver)
  // -------------------------------------------------------------------------
  const revealEls = document.querySelectorAll(".reveal-up, .reveal-fade");
  if (revealEls.length && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: show all
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  // -------------------------------------------------------------------------
  // 8. ANIMATED STAT COUNTERS
  // -------------------------------------------------------------------------
  function startCounters() {
    const statEls = document.querySelectorAll(".stat-n[data-count]");
    statEls.forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || "";
      const duration = 1500;
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = clamp(elapsed / duration, 0, 1);
        const val = Math.round(easeOut(progress) * target);
        el.textContent = val + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(step);
    });
  }

  // -------------------------------------------------------------------------
  // 9. PROJECT PREVIEW FOLLOWING CURSOR (vanholtz.co style)
  // -------------------------------------------------------------------------
  const projectPreview = document.getElementById("project-preview");
  const previewInner = document.getElementById("preview-inner");

  if (projectPreview && previewInner) {
    const projectRows = document.querySelectorAll(".project-row");
    let previewTargetX = 0;
    let previewTargetY = 0;
    let previewCurrentX = 0;
    let previewCurrentY = 0;
    let previewVisible = false;
    let previewRAF = null;

    function animatePreview() {
      previewCurrentX = lerp(previewCurrentX, previewTargetX, 0.1);
      previewCurrentY = lerp(previewCurrentY, previewTargetY, 0.1);
      projectPreview.style.left = previewCurrentX + "px";
      projectPreview.style.top = previewCurrentY + "px";
      previewRAF = requestAnimationFrame(animatePreview);
    }
    animatePreview();

    projectRows.forEach((row) => {
      const color = row.dataset.previewColor || "#1e1e2e";
      const label = row.dataset.previewLabel || "";

      row.addEventListener("mouseenter", () => {
        previewInner.style.background = color;
        previewInner.textContent = label;
        projectPreview.classList.add("is-visible");
        previewVisible = true;
      });

      row.addEventListener("mousemove", (e) => {
        previewTargetX = e.clientX + 20;
        previewTargetY = e.clientY - 60;
      });

      row.addEventListener("mouseleave", () => {
        projectPreview.classList.remove("is-visible");
        previewVisible = false;
      });
    });
  }

  // -------------------------------------------------------------------------
  // 10. SKILL BARS ANIMATION
  // -------------------------------------------------------------------------
  function initSkillBars() {
    const skillCats = document.querySelectorAll(".skill-category");
    if (!("IntersectionObserver" in window)) {
      // Fallback: set all widths immediately
      document.querySelectorAll(".skill-bar-row").forEach((row) => {
        const fill = row.querySelector(".sb-fill");
        if (fill) fill.style.width = (row.dataset.level || 0) + "%";
      });
      return;
    }

    const skillObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rows = entry.target.querySelectorAll(".skill-bar-row");
            rows.forEach((row, i) => {
              const level = row.dataset.level || 0;
              const fill = row.querySelector(".sb-fill");
              if (fill) {
                setTimeout(() => {
                  fill.style.width = level + "%";
                }, i * 120);
              }
            });
            skillObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    skillCats.forEach((cat) => skillObserver.observe(cat));
  }

  // -------------------------------------------------------------------------
  // 11. SCROLL CUE HIDING
  // -------------------------------------------------------------------------
  const scrollCue = document.querySelector(".scroll-cue");
  if (scrollCue) {
    window.addEventListener("scroll", () => {
      scrollCue.style.opacity = window.scrollY > 80 ? "0" : "";
    }, { passive: true });
  }

  // -------------------------------------------------------------------------
  // 12. TOAST NOTIFICATION
  // -------------------------------------------------------------------------
  const toast = document.getElementById("toast");
  let toastTimeout = null;

  function showToast(msg, duration = 2800) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove("show"), duration);
  }

  // -------------------------------------------------------------------------
  // 13. COPY EMAIL BUTTON
  // -------------------------------------------------------------------------
  const copyBtn = document.getElementById("copy-btn");
  const copyLabel = document.getElementById("copy-label");

  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const email = copyBtn.dataset.email || "steff.18random@gmail.com";
      if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(() => {
          if (copyLabel) {
            copyLabel.textContent = "¡Copiado!";
            setTimeout(() => (copyLabel.textContent = "Copiar correo"), 2000);
          }
          showToast("✓ Correo copiado: " + email);
        }).catch(() => {
          showToast("No se pudo copiar. Escríbeme a: " + email, 3500);
        });
      } else {
        // Fallback
        const ta = document.createElement("textarea");
        ta.value = email;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        if (copyLabel) {
          copyLabel.textContent = "¡Copiado!";
          setTimeout(() => (copyLabel.textContent = "Copiar correo"), 2000);
        }
        showToast("✓ Correo copiado: " + email);
      }
    });
  }

  // -------------------------------------------------------------------------
  // 14. FOOTER YEAR
  // -------------------------------------------------------------------------
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // -------------------------------------------------------------------------
  // 15. ARCADE MINI-GAME
  // -------------------------------------------------------------------------
  (function initArcade() {
    const board = document.getElementById("g-board");
    const startBtn = document.getElementById("g-start");
    const scoreEl = document.getElementById("g-score");
    const timeEl = document.getElementById("g-time");
    const comboEl = document.getElementById("g-combo");
    const bestEl = document.getElementById("g-best");
    const barEl = document.getElementById("g-bar");
    const msgEl = document.getElementById("g-msg");

    if (!board || !startBtn) return;

    const BEST_KEY = "stefaniBestScore2026";
    const GAME_DURATION = 15; // seconds
    const CELL_COUNT = 9;

    let score = 0;
    let combo = 0;
    let streak = 0;
    let timeLeft = GAME_DURATION;
    let gameActive = false;
    let activeCell = null;
    let cellTimer = null;
    let countdownTimer = null;
    let bestScore = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);

    // Achievements tracking
    let ach = {
      first: false,   // 1+ point
      combo: false,   // 5+ combo
      pro: false,     // 12+ points
      record: false,  // new best
    };

    // Use the existing 3×3 HTML board instead of duplicating it.
    const cells = Array.from(board.querySelectorAll(".ac-cell")).slice(0, CELL_COUNT);

    if (bestEl) bestEl.textContent = bestScore;

    // Audio (Web Audio API)
    let audioCtx = null;
    function getAudio() {
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      }
      return audioCtx;
    }

    function playBeep(freq = 880, type = "square", dur = 0.07, vol = 0.06) {
      try {
        const ac = getAudio();
        if (!ac) return;
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
        osc.start(ac.currentTime);
        osc.stop(ac.currentTime + dur);
      } catch (e) { /* ignore */ }
    }

    function hitSound() { playBeep(660, "square", 0.08); }
    function missSound() { playBeep(220, "sawtooth", 0.12, 0.05); }
    function comboSound() { playBeep(990, "triangle", 0.1); }
    function gameOverSound() { playBeep(180, "sawtooth", 0.3, 0.07); }

    function getComboMult() {
      if (streak >= 6) return 4;
      if (streak >= 4) return 3;
      if (streak >= 2) return 2;
      return 1;
    }

    function updateUI() {
      if (scoreEl) scoreEl.textContent = score;
      if (timeEl) timeEl.textContent = timeLeft;
      const mult = getComboMult();
      if (comboEl) comboEl.textContent = "x" + mult;
      if (barEl) barEl.style.width = (timeLeft / GAME_DURATION * 100) + "%";
    }

    function unlockAch(id) {
      const el = document.getElementById("ach-" + id);
      if (el && !el.classList.contains("unlocked")) {
        el.classList.add("unlocked");
        const achName = { first: "Primera vez", combo: "Combo ×5", pro: "Pro Gamer", record: "Récord" }[id] || id;
        showToast("🏆 Logro desbloqueado: " + achName + "!");
      }
    }

    function checkAchievements() {
      if (score >= 1 && !ach.first) { ach.first = true; unlockAch("first"); }
      if (getComboMult() >= 2 && streak >= 5 && !ach.combo) { ach.combo = true; unlockAch("combo"); }
      if (score >= 12 && !ach.pro) { ach.pro = true; unlockAch("pro"); }
    }

    function showCell() {
      if (!gameActive) return;
      // Reset previous
      cells.forEach((c) => c.classList.remove("is-active", "is-miss"));

      // Pick random cell (not same as last)
      let idx;
      do { idx = Math.floor(Math.random() * CELL_COUNT); } while (cells[idx] === activeCell);
      activeCell = cells[idx];

      // Active duration shrinks as time runs out (harder)
      const activeDur = clamp(600 + (timeLeft / GAME_DURATION) * 400, 400, 1000);
      activeCell.classList.add("is-active");

      cellTimer = setTimeout(() => {
        if (activeCell && activeCell.classList.contains("is-active")) {
          activeCell.classList.remove("is-active");
          activeCell.classList.add("is-miss");
          streak = 0;
          combo = 0;
          missSound();
          updateUI();
          setTimeout(() => { if (activeCell) activeCell.classList.remove("is-miss"); }, 300);
        }
        if (gameActive) showCell();
      }, activeDur);
    }

    function startGame() {
      score = 0; combo = 0; streak = 0; timeLeft = GAME_DURATION; gameActive = true;
      ach = { first: false, combo: false, pro: false, record: false };
      cells.forEach((c) => c.classList.remove("is-active", "is-miss", "is-hit"));
      if (startBtn) startBtn.textContent = "Reiniciar";
      if (msgEl) msgEl.style.display = "none";
      updateUI();
      clearInterval(countdownTimer);
      clearTimeout(cellTimer);
      showCell();

      countdownTimer = setInterval(() => {
        timeLeft--;
        updateUI();
        if (timeLeft <= 0) endGame();
      }, 1000);
    }

    function endGame() {
      gameActive = false;
      clearInterval(countdownTimer);
      clearTimeout(cellTimer);
      cells.forEach((c) => c.classList.remove("is-active"));
      activeCell = null;
      gameOverSound();

      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem(BEST_KEY, bestScore);
        if (bestEl) bestEl.textContent = bestScore;
        if (!ach.record) { ach.record = true; unlockAch("record"); }
      }

      if (msgEl) {
        msgEl.style.display = "block";
        const msgs = [
          "¡Juego terminado! Puntuación: " + score,
          score >= 15 ? "🔥 ¡INCREÍBLE! Eres una crack." : "",
          score >= 10 && score < 15 ? "🎉 ¡Muy bien! Casi eres una pro." : "",
          score >= 5 && score < 10 ? "👾 Nada mal, ¡sigue practicando!" : "",
          score < 5 ? "💪 ¡Vuelve a intentarlo!" : "",
        ].filter(Boolean);
        msgEl.textContent = msgs.join(" ");
      }
      if (startBtn) startBtn.textContent = "Jugar de nuevo";
    }

    // Cell click handler
    cells.forEach((cell) => {
      cell.addEventListener("click", () => {
        if (!gameActive) return;
        if (cell === activeCell && cell.classList.contains("is-active")) {
          cell.classList.remove("is-active");
          cell.classList.add("is-hit");
          clearTimeout(cellTimer);

          streak++;
          const mult = getComboMult();
          score += mult;
          combo = streak;

          hitSound();
          if (mult >= 2) comboSound();
          updateUI();
          checkAchievements();

          setTimeout(() => cell.classList.remove("is-hit"), 200);
          if (gameActive) showCell();
        }
      });
    });

    if (startBtn) {
      startBtn.addEventListener("click", startGame);
    }
  })();

  // -------------------------------------------------------------------------
  // 16. PARALLAX TILT ON HERO PHOTO
  // -------------------------------------------------------------------------
  const heroPhoto = document.querySelector(".hero-photo-wrap");
  if (heroPhoto) {
    document.addEventListener("mousemove", (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      heroPhoto.style.transform = `perspective(800px) rotateY(${dx * 8}deg) rotateX(${-dy * 6}deg)`;
    });
  }

  // -------------------------------------------------------------------------
  // 17. SECTION ACTIVE NAV HIGHLIGHT
  // -------------------------------------------------------------------------
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a, .mobile-menu a");

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle("active", link.getAttribute("href") === "#" + id);
            });
            const missionLinks = document.querySelectorAll(".mission-links a");
            missionLinks.forEach((link) => {
              const linkTarget = link.getAttribute("href");
              link.classList.toggle("active", linkTarget === "#" + id);
            });
            const missionCount = document.getElementById("mission-count");
            const missionProgress = document.getElementById("mission-progress");
            const missionNumber = id === "about" ? 1 : id === "projects" ? 2 : id === "skills" ? 3 : id === "arcade" ? 4 : 0;
            if (missionNumber) {
              if (missionCount) missionCount.textContent = String(missionNumber).padStart(2, "0") + " / 04";
              if (missionProgress) missionProgress.style.width = (missionNumber * 25) + "%";
              missionLinks.forEach((link) => {
                const linkNumber = parseInt(link.dataset.mission, 10);
                const isComplete = linkNumber < missionNumber;
                link.classList.toggle("is-complete", isComplete);
                if (link.getAttribute("href") === "#" + id) {
                  link.setAttribute("aria-current", "step");
                } else {
                  link.removeAttribute("aria-current");
                }
              });
            }
          }
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  // -------------------------------------------------------------------------
  // 18. SMOOTH SCROLL FOR ANCHOR LINKS
  // -------------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // -------------------------------------------------------------------------
  // 19. HERO TITLE CHARACTER STAGGER ANIMATION
  // -------------------------------------------------------------------------
  const heroTitleLines = document.querySelectorAll(".hero-line-inner");
  heroTitleLines.forEach((line, i) => {
    line.style.transitionDelay = (i * 0.15) + "s";
  });

  // -------------------------------------------------------------------------
  // 20. MAGNETIC BUTTONS
  // -------------------------------------------------------------------------
  const magnetBtns = document.querySelectorAll(".btn-primary, .btn-secondary");
  magnetBtns.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.3;
      const dy = (e.clientY - cy) * 0.3;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });

})();
