// ==========================================================================
// PORTAFOLIO INMERSIVO - STEFANI SÁNCHEZ
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. AÑO ACTUAL EN FOOTER
  const yearEl = document.querySelector("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ------------------------------------------------------------------------
  // 2. SISTEMA DE AUDIO NATIVO (WEB AUDIO API)
  // ------------------------------------------------------------------------
  let audioCtx = null;
  let sfxEnabled = localStorage.getItem("stefaniSfx") === "true";

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = "sine", duration = 0.1, gainVal = 0.1) {
    if (!sfxEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio fallback silencioso
    }
  }

  function playHitSound(combo) {
    const baseFreq = 440;
    const freq = baseFreq + Math.min(combo * 40, 500);
    playTone(freq, "triangle", 0.12, 0.15);
  }

  function playMissSound() {
    playTone(180, "sawtooth", 0.18, 0.12);
  }

  function playFanfareSound() {
    if (!sfxEnabled) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      setTimeout(() => playTone(freq, "sine", 0.25, 0.15), idx * 100);
    });
  }

  // Toggle de SFX en el header
  const soundToggle = document.querySelector("#sound-toggle");
  const soundIcon = document.querySelector("#sound-icon");
  const gameSoundHint = document.querySelector("#game-sound-hint");

  function updateSoundUI() {
    if (soundIcon) soundIcon.textContent = sfxEnabled ? "🔊" : "🔇";
    if (gameSoundHint) gameSoundHint.textContent = sfxEnabled ? "🔊 Efectos de sonido activados" : "🔇 Sonido silenciado (clic en header para activar)";
    localStorage.setItem("stefaniSfx", String(sfxEnabled));
  }
  updateSoundUI();

  if (soundToggle) {
    soundToggle.addEventListener("click", () => {
      sfxEnabled = !sfxEnabled;
      if (sfxEnabled) {
        initAudio();
        playTone(600, "sine", 0.1, 0.1);
        showToast("🔊 Efectos de sonido activados");
      } else {
        showToast("🔇 Efectos de sonido silenciados");
      }
      updateSoundUI();
    });
  }

  // ------------------------------------------------------------------------
  // 3. CAMBIO DE TEMA (MODO OSCURO INMERSIVO / MODO CLARO)
  // ------------------------------------------------------------------------
  const themeToggle = document.querySelector("#theme-toggle");
  const themeIcon = document.querySelector("#theme-icon");
  const savedTheme = localStorage.getItem("stefaniTheme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  function updateThemeIcon(theme) {
    if (themeIcon) themeIcon.textContent = theme === "dark" ? "🌙" : "☀️";
  }
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("stefaniTheme", next);
      updateThemeIcon(next);
      playTone(500, "sine", 0.08, 0.08);
      showToast(next === "dark" ? "🌙 Modo Inmersivo Oscuro activado" : "☀️ Modo Claro activado");
    });
  }

  // ------------------------------------------------------------------------
  // 4. TOAST NOTIFICATIONS
  // ------------------------------------------------------------------------
  const toast = document.querySelector("#toast-notification");
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2800);
  }

  // ------------------------------------------------------------------------
  // 5. BARRA DE PROGRESO DE LECTURA (SCROLL PROGRESS)
  // ------------------------------------------------------------------------
  const scrollBar = document.querySelector("#scroll-progress");
  window.addEventListener("scroll", () => {
    if (!scrollBar) return;
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollMax > 0 ? (window.scrollY / scrollMax) * 100 : 0;
    scrollBar.style.width = `${progress}%`;
  }, { passive: true });

  // ------------------------------------------------------------------------
  // 6. CURSOR INTERACTIVO CON HALO DE LUZ
  // ------------------------------------------------------------------------
  const cursorGlow = document.querySelector("#cursor-glow");
  if (cursorGlow && window.matchMedia("(pointer: fine)").matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    function animateCursor() {
      currentX += (mouseX - currentX) * 0.15;
      currentY += (mouseY - currentY) * 0.15;
      cursorGlow.style.left = `${currentX}px`;
      cursorGlow.style.top = `${currentY}px`;
      requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);
  }

  // ------------------------------------------------------------------------
  // 7. CANVAS DE FONDO DE CONSTELACIONES Y PARTÍCULAS
  // ------------------------------------------------------------------------
  const canvas = document.querySelector("#ambient-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const particles = [];
    const particleCount = Math.min(Math.floor(width / 24), 60);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 0.8,
        color: ["#f43f5e", "#38bdf8", "#fbbf24", "#10b981"][Math.floor(Math.random() * 4)]
      });
    }

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      // Dibujar enlaces
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Dibujar partículas
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      requestAnimationFrame(renderParticles);
    }
    renderParticles();
  }

  // ------------------------------------------------------------------------
  // 8. EFECTO TYPEWRITER EN EL HERO
  // ------------------------------------------------------------------------
  const typewriterEl = document.querySelector("#typewriter-text");
  if (typewriterEl) {
    const phrases = [
      "Desarrollo arquitecturas web interactivas y escalables.",
      "Especializada en Node.js, Express y PostgreSQL.",
      "Creo videojuegos web educativos con gamificación real.",
      "Automatizo con Docker Compose y GitHub Actions."
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 50;

    function typeLoop() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        charIndex--;
        typewriterEl.textContent = currentPhrase.substring(0, charIndex);
        typeSpeed = 25;
      } else {
        charIndex++;
        typewriterEl.textContent = currentPhrase.substring(0, charIndex);
        typeSpeed = 55;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        typeSpeed = 2200; // Pausa al completar la frase
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 400; // Pausa antes de la siguiente
      }

      setTimeout(typeLoop, typeSpeed);
    }
    typeLoop();
  }

  // ------------------------------------------------------------------------
  // 9. TARJETA 3D PARALLAX TILT EN FOTO
  // ------------------------------------------------------------------------
  const photoContainer = document.querySelector("#photo-container");
  const photoFrame = document.querySelector("#photo-frame");
  if (photoContainer && photoFrame) {
    photoContainer.addEventListener("mousemove", (e) => {
      const rect = photoContainer.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = (y / (rect.height / 2)) * -14;
      const rotateY = (x / (rect.width / 2)) * 14;
      photoFrame.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    photoContainer.addEventListener("mouseleave", () => {
      photoFrame.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
    });
  }

  // ------------------------------------------------------------------------
  // 10. LISTADO Y FILTRO INTERACTIVO DE PROYECTOS
  // ------------------------------------------------------------------------
  const featuredProjects = [
    {
      id: "escape-room",
      title: "Escape Room Educativo",
      category: "games",
      isFeatured: true,
      accent: "#f43f5e",
      technologies: ["Node.js", "Express", "PostgreSQL", "Canvas API", "HTML", "CSS"],
      description: "Videojuego web interactivo de resolución de retos en programación con control de sesiones, roles administrativos y persistencia en base de datos.",
      githubUrl: "https://github.com/steff-360/escape-room-programacion",
      liveUrl: "https://steff-360.github.io/escape-room-programacion/",
      fullDetails: `
        <h3>Escape Room Educativo: Gamificación en Vivo</h3>
        <p>Una experiencia web completa diseñada para enseñar lógica de programación mediante desafíos de código en tiempo real.</p>
        <h4>Arquitectura & Retos Técnicos:</h4>
        <ul>
          <li><strong>Backend robusto:</strong> API REST en Node.js y Express con autenticación segura y persistencia de estados de misión.</li>
          <li><strong>Base de datos relacional:</strong> PostgreSQL con modelado para participantes, equipos, registros de intentos y tiempos récord.</li>
          <li><strong>Interacción en frontend:</strong> Canvas API y manipulación dinámica del DOM para mecánicas de rompecabezas interactivos.</li>
        </ul>
      `
    },
    {
      id: "job-applications",
      title: "API de gestión de postulaciones",
      category: "fullstack",
      isFeatured: true,
      accent: "#38bdf8",
      technologies: ["Node.js", "Express", "PostgreSQL", "Jest"],
      description: "API REST para candidatos, vacantes y postulaciones; calcula puntuación y prioridad e incluye pruebas automatizadas con Jest.",
      githubUrl: "https://github.com/steff-360/Prueba-diagnostica-/tree/main/job-applications-api",
      liveUrl: null,
      fullDetails: `
        <h3>API REST de Reclutamiento & Gestión de Candidatos</h3>
        <p>Arquitectura empresarial modular para optimizar procesos de selección mediante algoritmos de priorización ponderada.</p>
        <h4>Aspectos Clave:</h4>
        <ul>
          <li><strong>Pruebas unitarias & integración:</strong> Cobertura exhaustiva con suite automatizada Jest.</li>
          <li><strong>Control de errores:</strong> Middlewares centralizados y validación estricta de payloads entrantes.</li>
          <li><strong>Persistencia:</strong> Consultas optimizadas en PostgreSQL con integridad referencial.</li>
        </ul>
      `
    },
    {
      id: "techzone",
      title: "TechZone · Inventario con PostgreSQL",
      category: "databases",
      isFeatured: false,
      accent: "#10b981",
      technologies: ["PostgreSQL", "SQL", "Docker"],
      description: "Base de datos relacional para inventario y ventas, con modelo entidad-relación, normalización avanzada, scripts SQL y consultas analíticas.",
      githubUrl: "https://github.com/steff-360/Examen-postgres",
      liveUrl: null,
      fullDetails: `
        <h3>TechZone: Modelado y Optimización Relacional</h3>
        <p>Diseño completo de arquitectura relacional para comercio y control de stock tecnológico.</p>
        <ul>
          <li>Esquema normalizado hasta Tercera Forma Normal (3FN).</li>
          <li>Triggers, funciones almacenadas y vistas complejas para reportes de rotación de inventario.</li>
        </ul>
      `
    },
    {
      id: "algodones",
      title: "Algodones Maravilla · La Fábrica",
      category: "games",
      isFeatured: false,
      accent: "#fbbf24",
      technologies: ["JavaScript", "HTML", "CSS"],
      description: "Juego arcade interactivo para navegador con niveles dinámicos, sistema de vidas, puntuación progresiva y modo runner adicional.",
      githubUrl: "https://github.com/steff-360/primera-versi-n",
      liveUrl: null,
      fullDetails: `
        <h3>Algodones Maravilla: Desarrollo de Videojuegos Web</h3>
        <p>Experiencia arcade responsiva construida con Vanilla JavaScript nativo y renderizado por cuadros por segundo (requestAnimationFrame).</p>
      `
    },
    {
      id: "campuslands-cli",
      title: "CampusLands CLI ESM",
      category: "fullstack",
      isFeatured: false,
      accent: "#a855f7",
      technologies: ["JavaScript", "Node.js", "ESM"],
      description: "Aplicación de consola interactiva para agregar, listar, buscar y gestionar entidades académicas, con persistencia en JSON.",
      githubUrl: "https://github.com/steff-360/new",
      liveUrl: null,
      fullDetails: `
        <h3>CLI Empresarial en Node.js ESM</h3>
        <p>Herramienta por línea de comandos interactiva construida bajo el estándar ECMAScript Modules (ESM) para gestión de registros y validaciones.</p>
      `
    },
    {
      id: "flowers",
      title: "Animación Web de Flores",
      category: "games",
      isFeatured: false,
      accent: "#f43f5e",
      technologies: ["HTML", "CSS", "Sass"],
      description: "Práctica responsive de animación matemática y visual con HTML y CSS/Sass con sincronización de fotogramas clave.",
      githubUrl: "https://github.com/steff-360/flowers",
      liveUrl: null,
      fullDetails: `
        <h3>Animación Matemática & CSS Keyframes</h3>
        <p>Exploración de transformaciones 2D y keyframes complejos para renderizado de componentes estéticos de alto rendimiento.</p>
      `
    }
  ];

  const projectGrid = document.querySelector("#project-grid");
  const filterTabs = document.querySelectorAll(".filter-tab");
  let activeFilter = "all";

  // Modal elements
  const modalBackdrop = document.querySelector("#project-modal");
  const modalBody = document.querySelector("#modal-body");
  const modalClose = document.querySelector("#modal-close");

  function openProjectModal(project) {
    if (!modalBackdrop || !modalBody) return;
    modalBody.innerHTML = `
      ${project.fullDetails}
      <div style="margin-top: 24px; display: flex; gap: 12px; flex-wrap: wrap;">
        ${project.liveUrl ? `<a class="project-btn-play" href="${project.liveUrl}" target="_blank" rel="noopener noreferrer">🎮 Probar Demo en Vivo ↗</a>` : ""}
        <a class="project-link-gh" href="${project.githubUrl}" target="_blank" rel="noopener noreferrer">💻 Ver Código en GitHub ↗</a>
      </div>
    `;
    modalBackdrop.classList.add("is-open");
    modalBackdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeProjectModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove("is-open");
    modalBackdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (modalClose) modalClose.addEventListener("click", closeProjectModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeProjectModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProjectModal();
  });

  function renderProjects() {
    if (!projectGrid) return;
    projectGrid.innerHTML = "";

    const filtered = featuredProjects.filter((p) => {
      if (activeFilter === "all") return true;
      return p.category === activeFilter;
    });

    filtered.forEach((p, idx) => {
      const card = document.createElement("article");
      card.className = "project-card";
      card.dataset.techs = p.technologies.join(",").toLowerCase();
      card.style.setProperty("--card-accent", p.accent);

      card.innerHTML = `
        <div class="project-card-spotlight"></div>
        <div class="project-meta">
          <span class="project-rank">PROYECTO 0${idx + 1}</span>
          ${p.isFeatured ? '<span class="project-badge-featured">⭐ DESTACADO</span>' : ""}
        </div>
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="project-tags">
          ${p.technologies.map(t => `<span class="project-tag">${t}</span>`).join("")}
        </div>
        <div class="project-bottom">
          <button class="project-link-gh btn-open-modal" type="button" aria-label="Ver detalles de ${p.title}">
            <span>Detalles</span> <span>🔍</span>
          </button>
          <div style="display: flex; gap: 8px;">
            ${p.liveUrl ? `<a class="project-btn-play" href="${p.liveUrl}" target="_blank" rel="noopener noreferrer">Jugar 🎮</a>` : ""}
            <a class="project-link-gh" href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" title="Ver repositorio en GitHub">Código ↗</a>
          </div>
        </div>
      `;

      // Efecto Spotlight 3D en la tarjeta
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });

      // Abrir modal con botón de detalles
      const detailBtn = card.querySelector(".btn-open-modal");
      if (detailBtn) {
        detailBtn.addEventListener("click", () => {
          playTone(620, "sine", 0.08, 0.1);
          openProjectModal(p);
        });
      }

      projectGrid.appendChild(card);
    });
  }

  // Filtrado al hacer clic en pestañas
  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      filterTabs.forEach(t => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      activeFilter = tab.dataset.filter || "all";
      playTone(450, "sine", 0.08, 0.08);
      renderProjects();
    });
  });

  renderProjects();

  // ------------------------------------------------------------------------
  // 11. TECH-CONNECT (INTERACCIÓN CON HERRAMIENTAS Y LENGUAJES)
  // ------------------------------------------------------------------------
  const techChips = document.querySelectorAll(".tech-chip");
  const techHintText = document.querySelector("#tech-hint-text");

  techChips.forEach((chip) => {
    const techName = chip.dataset.tech.toLowerCase();

    chip.addEventListener("mouseenter", () => {
      chip.classList.add("is-active");
      playTone(700, "sine", 0.04, 0.03);

      const cards = document.querySelectorAll(".project-card");
      let matches = 0;

      cards.forEach((card) => {
        const cardTechs = card.dataset.techs || "";
        if (cardTechs.includes(techName)) {
          card.classList.add("is-highlighted");
          card.classList.remove("is-dimmed");
          matches++;
        } else {
          card.classList.add("is-dimmed");
          card.classList.remove("is-highlighted");
        }
      });

      if (techHintText) {
        techHintText.textContent = `⚡ ${matches} proyecto(s) utilizan ${chip.textContent.trim()}.`;
      }
    });

    chip.addEventListener("mouseleave", () => {
      chip.classList.remove("is-active");
      const cards = document.querySelectorAll(".project-card");
      cards.forEach((card) => {
        card.classList.remove("is-highlighted", "is-dimmed");
      });
      if (techHintText) {
        techHintText.textContent = "Pasa el cursor por una tecnología para iluminar proyectos asociados.";
      }
    });

    chip.addEventListener("click", () => {
      // Scroll suave a proyectos
      const projSec = document.querySelector("#proyectos");
      if (projSec) projSec.scrollIntoView({ behavior: "smooth" });
    });
  });

  // ------------------------------------------------------------------------
  // 12. MINIJUEGO DE REFLEJOS POTENCIADO (PAUSA INTERACTIVA)
  // ------------------------------------------------------------------------
  const gameStartButton = document.querySelector("#game-start");
  const gameCells = [...document.querySelectorAll(".game-cell")];
  const gameScore = document.querySelector("#game-score");
  const gameTime = document.querySelector("#game-time");
  const gameBest = document.querySelector("#game-best");
  const gameCombo = document.querySelector("#game-combo");
  const gameProgress = document.querySelector("#game-progress");
  const gameMessage = document.querySelector("#game-message");
  const comboFeedback = document.querySelector("#combo-feedback");

  // Badges de logros
  const badgeFirst = document.querySelector("#achieve-first");
  const badgeCombo = document.querySelector("#achieve-combo");
  const badgeSpeed = document.querySelector("#achieve-speed");

  let gameTimer = null;
  let targetTimer = null;
  let gameSeconds = 15;
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let targetIndex = -1;
  let gameIsActive = false;

  function readBestScore() {
    try {
      return Number(localStorage.getItem("stefaniPortfolioBest") || 0);
    } catch {
      return 0;
    }
  }

  function clearGameTarget() {
    gameCells.forEach((cell, index) => {
      cell.classList.remove("is-target", "is-miss");
      cell.setAttribute("aria-label", `Casilla ${index + 1}`);
    });
  }

  function moveGameTarget() {
    clearGameTarget();
    const nextIndex = Math.floor(Math.random() * gameCells.length);
    targetIndex = nextIndex === targetIndex ? (nextIndex + 1) % gameCells.length : nextIndex;
    gameCells[targetIndex].classList.add("is-target");
    gameCells[targetIndex].setAttribute("aria-label", `Objetivo, casilla ${targetIndex + 1}`);
  }

  function finishMiniGame() {
    gameIsActive = false;
    clearInterval(gameTimer);
    clearInterval(targetTimer);
    clearGameTarget();
    targetIndex = -1;

    const previousBest = readBestScore();
    const isNewRecord = score > previousBest;
    const bestScore = Math.max(previousBest, score);

    try {
      localStorage.setItem("stefaniPortfolioBest", String(bestScore));
    } catch {}

    gameBest.textContent = String(bestScore).padStart(2, "0");
    gameStartButton.textContent = "Jugar otra vez";

    if (isNewRecord && score > 0) {
      gameMessage.textContent = `🎉 ¡NUEVO RÉCORD! Puntuación final: ${score} pts (Max combo x${maxCombo}).`;
      playFanfareSound();
      showToast(`🏆 ¡Nuevo récord personal: ${score} puntos!`);
    } else {
      gameMessage.textContent = `Partida finalizada. Puntuación: ${score} pts.`;
      playTone(400, "sine", 0.3, 0.1);
    }

    if (comboFeedback) comboFeedback.textContent = "Haz clic en empezar para superar tu récord.";
  }

  function startMiniGame() {
    clearInterval(gameTimer);
    clearInterval(targetTimer);
    gameIsActive = true;
    gameSeconds = 15;
    score = 0;
    combo = 0;
    maxCombo = 0;
    targetIndex = -1;

    gameScore.textContent = "00";
    gameTime.textContent = "15";
    gameCombo.textContent = "x1";
    gameProgress.style.width = "100%";
    gameStartButton.textContent = "Reiniciar partida";
    gameMessage.textContent = "¡Partida en curso! Concentración total...";
    if (comboFeedback) comboFeedback.textContent = "¡Acierta casillas seguidas para activar combo!";

    playTone(550, "sine", 0.1, 0.1);
    moveGameTarget();

    targetTimer = setInterval(moveGameTarget, 720);
    gameTimer = setInterval(() => {
      gameSeconds -= 1;
      gameTime.textContent = String(gameSeconds).padStart(2, "0");
      gameProgress.style.width = `${(gameSeconds / 15) * 100}%`;
      if (gameSeconds <= 0) finishMiniGame();
    }, 1000);
  }

  if (gameStartButton) gameStartButton.addEventListener("click", startMiniGame);

  gameCells.forEach((cell, index) => {
    cell.addEventListener("click", () => {
      if (!gameIsActive) return;

      if (index === targetIndex) {
        combo += 1;
        if (combo > maxCombo) maxCombo = combo;
        score += combo >= 3 ? 2 : 1;

        gameScore.textContent = String(score).padStart(2, "0");
        gameCombo.textContent = `x${combo}`;
        playHitSound(combo);

        // Feedback de racha
        if (comboFeedback) {
          if (combo >= 5) comboFeedback.textContent = `🔥 ¡EN RACHA! Combo x${combo} (+2 pts)`;
          else if (combo >= 3) comboFeedback.textContent = `⚡ ¡Combo x${combo}! Sigue así`;
          else comboFeedback.textContent = "✦ ¡Acierto perfecto!";
        }

        // Desbloquear medallas
        if (score >= 1 && badgeFirst) badgeFirst.classList.add("is-unlocked");
        if (combo >= 5 && badgeCombo) badgeCombo.classList.add("is-unlocked");
        if (score >= 12 && badgeSpeed) badgeSpeed.classList.add("is-unlocked");

        moveGameTarget();
      } else {
        combo = 0;
        gameCombo.textContent = "x1";
        playMissSound();
        cell.classList.add("is-miss");
        setTimeout(() => cell.classList.remove("is-miss"), 200);
        if (comboFeedback) comboFeedback.textContent = "❌ ¡Fallo! Combo reiniciado";
      }
    });
  });

  if (gameBest) gameBest.textContent = String(readBestScore()).padStart(2, "0");

  // ------------------------------------------------------------------------
  // 13. BOTÓN COPIAR CORREO (CONTACTO)
  // ------------------------------------------------------------------------
  const copyBtn = document.querySelector("#copy-email-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const email = copyBtn.dataset.email || "steff.18random@gmail.com";
      navigator.clipboard.writeText(email).then(() => {
        playTone(750, "triangle", 0.12, 0.1);
        showToast("✓ Correo copiado al portapapeles: steff.18random@gmail.com");
        const copyText = document.querySelector("#copy-text");
        if (copyText) {
          const original = copyText.textContent;
          copyText.textContent = "¡Copiado!";
          setTimeout(() => (copyText.textContent = original), 2000);
        }
      }).catch(() => {
        showToast("steff.18random@gmail.com");
      });
    });
  }

  // ------------------------------------------------------------------------
  // 14. MENÚ MÓVIL RESPONSIVE
  // ------------------------------------------------------------------------
  const menuToggle = document.querySelector(".menu-toggle");
  const mainMenu = document.querySelector("#main-menu");

  function setMenuOpen(isOpen) {
    if (!menuToggle || !mainMenu) return;
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    mainMenu.classList.toggle("is-open", isOpen);
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!isExpanded);
    });
  }

  if (mainMenu) {
    mainMenu.addEventListener("click", (e) => {
      if (e.target.closest("a")) setMenuOpen(false);
    });
  }
});
