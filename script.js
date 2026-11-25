// ==========================================================================
// STEFANI SÁNCHEZ · SUBWAY CODE RUNNER
// Portafolio interactivo estilo Subway Surfers en HTML5 Canvas (Perspectiva 3D)
// ==========================================================================

(() => {
  "use strict";

  // ------------------------------------------------------------------------
  // 1. DATOS REALES DEL PORTAFOLIO
  // ------------------------------------------------------------------------
  const PROJECTS = [
    {
      id: "escape-room",
      stationDist: 60,
      icon: "🎮",
      title: "Escape Room Programación",
      desc: "Videojuego educativo de lógica y código. HTML5 Canvas, mecánicas de puzzles, diseño de niveles y progresión gamificada.",
      tags: ["HTML5 Canvas", "JavaScript", "CSS", "Gamificación"],
      live: "https://steff-360.github.io/escape-room-programacion/",
      github: "https://github.com/steff-360",
    },
    {
      id: "job-api",
      stationDist: 140,
      icon: "🔗",
      title: "Job Listings API",
      desc: "API REST completa para gestión de ofertas de empleo. CRUD con Node.js, Express, PostgreSQL y autenticación JWT.",
      tags: ["Node.js", "Express", "PostgreSQL", "JWT"],
      github: "https://github.com/steff-360",
    },
    {
      id: "techzone",
      stationDist: 230,
      icon: "🗄️",
      title: "TechZone PostgreSQL",
      desc: "Diseño completo de base de datos para tienda tech. Queries avanzadas, índices optimizados, funciones y procedimientos almacenados.",
      tags: ["PostgreSQL", "SQL", "DB Design", "Performance"],
      github: "https://github.com/steff-360",
    },
    {
      id: "algodones",
      stationDist: 330,
      icon: "💻",
      title: "Algodones Maravilla",
      desc: "Sistema de gestión de inventario con interfaz de línea de comandos. TypeScript, arquitectura limpia y patrones de diseño.",
      tags: ["TypeScript", "CLI", "OOP", "Inventario"],
      github: "https://github.com/steff-360",
    },
    {
      id: "campuslands",
      stationDist: 440,
      icon: "🏫",
      title: "CampusLands CLI",
      desc: "Plataforma de gestión estudiantil con interfaz CLI. Control de asistencia, notas y seguimiento de aprendizaje.",
      tags: ["Node.js", "TypeScript", "CLI", "EdTech"],
      github: "https://github.com/steff-360",
    },
    {
      id: "docker-infra",
      stationDist: 560,
      icon: "🐳",
      title: "Docker + Supabase Infra",
      desc: "Infraestructura backend con Docker Compose y Supabase. Contenedores, variables de entorno y despliegue reproducible.",
      tags: ["Docker", "Supabase", "DevOps", "PostgreSQL"],
      github: "https://github.com/steff-360",
    },
  ];

  const SKILLS = [
    { name: "Node.js", level: 92, color: "#10b981" },
    { name: "PostgreSQL", level: 90, color: "#06b6d4" },
    { name: "Express.js", level: 88, color: "#f59e0b" },
    { name: "Git / GitHub", level: 88, color: "#a855f7" },
    { name: "TypeScript", level: 85, color: "#3b82f6" },
    { name: "Docker", level: 82, color: "#0ea5e9" },
    { name: "HTML5 / CSS3", level: 80, color: "#f43f5e" },
    { name: "REST APIs", level: 78, color: "#14b8a6" },
    { name: "JavaScript ES6+", level: 75, color: "#eab308" },
    { name: "Supabase", level: 75, color: "#22c55e" },
    { name: "Jest / Testing", level: 72, color: "#ec4899" },
    { name: "Canvas / Web APIs", level: 68, color: "#8b5cf6" },
  ];

  // ------------------------------------------------------------------------
  // 2. REFERENCIAS DOM & ESTADO GLOBAL
  // ------------------------------------------------------------------------
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  const hudDist = document.getElementById("hud-dist");
  const hudCoins = document.getElementById("hud-coins");
  const hudMult = document.getElementById("hud-mult");
  const hudBest = document.getElementById("hud-best");
  const unlockCountEl = document.getElementById("unlock-count");

  const spLabel = document.getElementById("sp-label");
  const spMeters = document.getElementById("sp-meters");
  const spFill = document.getElementById("sp-fill");
  const powerupHud = document.getElementById("powerup-hud");

  const unlockToast = document.getElementById("unlock-toast");
  const utIcon = document.getElementById("ut-icon");
  const utTag = document.getElementById("ut-tag");
  const utTitle = document.getElementById("ut-title");
  const utSub = document.getElementById("ut-sub");

  const startOverlay = document.getElementById("start-overlay");
  const pauseOverlay = document.getElementById("pause-overlay");
  const gameoverOverlay = document.getElementById("gameover-overlay");

  const portfolioModal = document.getElementById("portfolio-modal");
  const pmProjectsGrid = document.getElementById("pm-projects-grid");
  const pmSkillsGrid = document.getElementById("pm-skills-grid");
  const toastEl = document.getElementById("toast");

  const STORAGE_BEST = "stefani_subway_best_v1";
  const STORAGE_UNLOCKED = "stefani_subway_unlocked_v1";
  const STORAGE_THEME = "stefani_subway_theme_v1";

  let theme = localStorage.getItem(STORAGE_THEME) || "dark";
  let soundEnabled = true;
  let bestScore = parseInt(localStorage.getItem(STORAGE_BEST) || "0", 10);
  let unlockedProjects = new Set(JSON.parse(localStorage.getItem(STORAGE_UNLOCKED) || "[]"));

  // ------------------------------------------------------------------------
  // 3. TEMA CLARO / OSCURO (BLANCO / OSCURO)
  // ------------------------------------------------------------------------
  function applyTheme(nextTheme) {
    theme = nextTheme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_THEME, theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", theme === "dark" ? "#070b14" : "#f1f5f9");
    }
  }

  function toggleTheme() {
    applyTheme(theme === "dark" ? "light" : "dark");
    showToast(theme === "dark" ? "🌙 Modo Oscuro activado" : "☀️ Modo Blanco activado");
  }

  applyTheme(theme);
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  document.getElementById("pm-theme-toggle").addEventListener("click", toggleTheme);

  // ------------------------------------------------------------------------
  // 4. AUDIO ARCADE (WEB AUDIO API)
  // ------------------------------------------------------------------------
  let audioCtx = null;

  function playTone(freq, type = "sine", dur = 0.08, vol = 0.07, slideTo = null) {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      }
      if (!audioCtx) return;
      if (audioCtx.state === "suspended") audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, audioCtx.currentTime + dur);
      }
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch (_) {
      // Ignorar si el navegador bloquea audio antes de interacción
    }
  }

  const sfx = {
    lane: () => playTone(320, "triangle", 0.06, 0.05, 440),
    jump: () => playTone(260, "sine", 0.14, 0.08, 620),
    slide: () => playTone(420, "triangle", 0.12, 0.06, 170),
    coin: () => playTone(920, "sine", 0.08, 0.06, 1320),
    skill: () => {
      playTone(523, "triangle", 0.09, 0.07);
      setTimeout(() => playTone(784, "triangle", 0.14, 0.07), 70);
    },
    powerup: () => {
      playTone(440, "square", 0.08, 0.05);
      setTimeout(() => playTone(660, "square", 0.08, 0.05), 70);
      setTimeout(() => playTone(880, "square", 0.14, 0.06), 140);
    },
    station: () => {
      playTone(523, "triangle", 0.1, 0.08);
      setTimeout(() => playTone(659, "triangle", 0.1, 0.08), 90);
      setTimeout(() => playTone(784, "triangle", 0.1, 0.08), 180);
      setTimeout(() => playTone(1046, "triangle", 0.22, 0.09), 270);
    },
    crash: () => playTone(180, "sawtooth", 0.35, 0.1, 55),
  };

  const soundToggleBtn = document.getElementById("sound-toggle");
  const soundIcon = document.getElementById("sound-icon");
  soundToggleBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundIcon.textContent = soundEnabled ? "🔊" : "🔇";
    showToast(soundEnabled ? "🔊 Sonido activado" : "🔇 Sonido silenciado");
  });

  // ------------------------------------------------------------------------
  // 5. MOTOR DEL JUEGO (SUBWAY RUNNER EN PERSPECTIVA 3D)
  // ------------------------------------------------------------------------
  let W = window.innerWidth;
  let H = window.innerHeight;
  let DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas() {
    W = window.innerWidth;
    H = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Estados: "menu" | "playing" | "paused" | "gameover"
  let gameState = "menu";

  const player = {
    lane: 1, // 0 = izq, 1 = centro, 2 = der
    visualLane: 1,
    y: 0, // altura sobre el suelo (px en escala base)
    vy: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0,
    runCycle: 0,
    magnetTimer: 0,
    hoverTimer: 0,
    invulnTimer: 0,
  };

  let speed = 0.52; // unidades Z por segundo
  let distance = 0;
  let coins = 0;
  let multiplier = 1;
  let streakCoins = 0;
  let trackOffset = 0;
  let spawnTimer = 0;
  let shakeTimer = 0;

  // Entidades en pista: z va de 1.0 (horizonte) a -0.15 (detrás de cámara)
  let entities = [];
  let particles = [];
  let buildings = [];

  // Inicializar edificios laterales decorativos
  function initBuildings() {
    buildings = [];
    for (let i = 0; i < 18; i++) {
      const z = i / 18;
      buildings.push({
        z,
        side: -1,
        h: 110 + (i * 37) % 140,
        w: 75 + (i * 19) % 45,
        hue: (i * 45) % 360,
      });
      buildings.push({
        z,
        side: 1,
        h: 120 + (i * 53) % 150,
        w: 75 + (i * 23) % 45,
        hue: (i * 65 + 120) % 360,
      });
    }
  }
  initBuildings();

  // Proyección perspectiva: z=0 es cerca del jugador, z=1 es el horizonte
  function project(laneFloat, z, yOffset = 0) {
    const horizonY = H * 0.34;
    const groundY = H * 0.88;
    // Curva de perspectiva suave
    const t = Math.max(0.02, 1 - z);
    const persp = Math.pow(t, 1.85);
    const screenY = horizonY + (groundY - horizonY) * persp - yOffset * persp;
    const roadHalfWidth = Math.min(W * 0.42, 300) * (0.14 + 0.86 * persp);
    const laneOffset = (laneFloat - 1) * (roadHalfWidth * 0.62);
    const screenX = W * 0.5 + laneOffset;
    const scale = 0.16 + 0.84 * persp;
    return { x: screenX, y: screenY, scale, roadHalfWidth, persp };
  }

  function resetGame() {
    player.lane = 1;
    player.visualLane = 1;
    player.y = 0;
    player.vy = 0;
    player.isJumping = false;
    player.isSliding = false;
    player.slideTimer = 0;
    player.magnetTimer = 0;
    player.hoverTimer = 0;
    player.invulnTimer = 0;

    speed = 0.55;
    distance = 0;
    coins = 0;
    multiplier = 1;
    streakCoins = 0;
    spawnTimer = 0.4;
    shakeTimer = 0;
    entities = [];
    particles = [];
    updateHUD();
  }

  function startGame() {
    resetGame();
    gameState = "playing";
    startOverlay.classList.remove("is-active");
    pauseOverlay.classList.remove("is-active");
    gameoverOverlay.classList.remove("is-active");
    sfx.station();
  }

  function pauseGame() {
    if (gameState !== "playing") return;
    gameState = "paused";
    pauseOverlay.classList.add("is-active");
  }

  function resumeGame() {
    if (gameState !== "paused") return;
    gameState = "playing";
    pauseOverlay.classList.remove("is-active");
  }

  function triggerGameOver() {
    gameState = "gameover";
    sfx.crash();
    shakeTimer = 0.4;

    const finalScore = Math.floor(distance * multiplier + coins * 5);
    if (finalScore > bestScore) {
      bestScore = finalScore;
      localStorage.setItem(STORAGE_BEST, String(bestScore));
      document.getElementById("go-badge").textContent = "🏆 ¡NUEVO RÉCORD!";
      document.getElementById("go-title").textContent = "¡Imparable!";
    } else {
      document.getElementById("go-badge").textContent = "💥 ¡FIN DE LA CARRERA!";
      document.getElementById("go-title").textContent = "¡Buen recorrido!";
    }

    document.getElementById("go-score").textContent = finalScore;
    document.getElementById("go-dist").textContent = Math.floor(distance) + "m";
    document.getElementById("go-coins").textContent = coins;
    document.getElementById("go-projects").textContent = `${unlockedProjects.size}/${PROJECTS.length}`;
    hudBest.textContent = bestScore;

    gameoverOverlay.classList.add("is-active");
  }

  // ------------------------------------------------------------------------
  // 6. CONTROLES (TECLADO + SWIPE TÁCTIL + BOTONES)
  // ------------------------------------------------------------------------
  function moveLeft() {
    if (gameState !== "playing") return;
    if (player.lane > 0) {
      player.lane--;
      sfx.lane();
    }
  }

  function moveRight() {
    if (gameState !== "playing") return;
    if (player.lane < 2) {
      player.lane++;
      sfx.lane();
    }
  }

  function jump() {
    if (gameState !== "playing") return;
    if (!player.isJumping) {
      player.isJumping = true;
      player.isSliding = false;
      player.vy = 680;
      sfx.jump();
      spawnBurst(player.visualLane, 0.04, 8, "#06b6d4");
    }
  }

  function slide() {
    if (gameState !== "playing") return;
    if (player.isJumping) {
      // Fast drop estilo Subway Surfers
      player.vy = -850;
    }
    player.isSliding = true;
    player.slideTimer = 0.65;
    sfx.slide();
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (portfolioModal.classList.contains("is-open")) {
        closePortfolio();
      } else if (gameState === "playing") {
        pauseGame();
      } else if (gameState === "paused") {
        resumeGame();
      }
      return;
    }

    if (gameState !== "playing") return;

    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      e.preventDefault();
      moveLeft();
    } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      e.preventDefault();
      moveRight();
    } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.key === " ") {
      e.preventDefault();
      jump();
    } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
      e.preventDefault();
      slide();
    }
  });

  // Swipe táctil
  let touchStartX = 0;
  let touchStartY = 0;
  canvas.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });

  canvas.addEventListener("touchend", (e) => {
    if (gameState !== "playing") return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) moveRight();
      else moveLeft();
    } else {
      if (dy < 0) jump();
      else slide();
    }
  }, { passive: true });

  // Botones táctiles
  document.getElementById("tc-left").addEventListener("click", moveLeft);
  document.getElementById("tc-right").addEventListener("click", moveRight);
  document.getElementById("tc-up").addEventListener("click", jump);
  document.getElementById("tc-down").addEventListener("click", slide);

  // ------------------------------------------------------------------------
  // 7. GENERADOR DE OBSTÁCULOS, MONEDAS, SKILLS Y POWER-UPS
  // ------------------------------------------------------------------------
  function spawnWave() {
    // Elegir patrón de carriles para garantizar que siempre haya al menos 1 camino libre
    const freeLane = Math.floor(Math.random() * 3);
    const obstacleTypes = ["train", "barrier_low", "barrier_high"];

    for (let lane = 0; lane < 3; lane++) {
      if (lane === freeLane) {
        // En el carril libre ponemos monedas o un skill/powerup
        const r = Math.random();
        if (r < 0.72) {
          for (let k = 0; k < 4; k++) {
            entities.push({
              kind: "coin",
              lane,
              z: 1.0 + k * 0.075,
              y: 0,
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
        } else if (r < 0.88) {
          const sk = SKILLS[Math.floor(Math.random() * SKILLS.length)];
          entities.push({
            kind: "skill",
            lane,
            z: 1.02,
            y: 18,
            label: sk.name,
            color: sk.color,
          });
        } else {
          const puType = Math.random() < 0.5 ? "magnet" : "hover";
          entities.push({
            kind: "powerup",
            puType,
            lane,
            z: 1.02,
            y: 22,
          });
        }
      } else {
        // En los otros carriles hay chance de obstáculo
        if (Math.random() < 0.62) {
          const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          entities.push({
            kind: "obstacle",
            type,
            lane,
            z: 1.0,
            y: 0,
          });

          // Monedas encima de barrera baja para incentivar el salto
          if (type === "barrier_low" && Math.random() < 0.6) {
            entities.push({
              kind: "coin",
              lane,
              z: 1.0,
              y: 85,
            });
          }
        }
      }
    }
  }

  function spawnBurst(lane, z, count, color) {
    for (let i = 0; i < count; i++) {
      particles.push({
        lane: lane + (Math.random() - 0.5) * 0.4,
        z,
        y: 20 + Math.random() * 35,
        vx: (Math.random() - 0.5) * 1.4,
        vy: 60 + Math.random() * 140,
        life: 0.45 + Math.random() * 0.25,
        maxLife: 0.7,
        color,
        size: 3 + Math.random() * 4,
      });
    }
  }

  // ------------------------------------------------------------------------
  // 8. DESBLOQUEO DE PROYECTOS Y HUD
  // ------------------------------------------------------------------------
  let unlockToastTimer = null;
  function showUnlockBanner(icon, tag, title, sub) {
    utIcon.textContent = icon;
    utTag.textContent = tag;
    utTitle.textContent = title;
    utSub.textContent = sub;
    unlockToast.classList.add("is-visible");
    clearTimeout(unlockToastTimer);
    unlockToastTimer = setTimeout(() => {
      unlockToast.classList.remove("is-visible");
    }, 3600);
  }

  function checkStationUnlocks() {
    for (const proj of PROJECTS) {
      if (distance >= proj.stationDist && !unlockedProjects.has(proj.id)) {
        unlockedProjects.add(proj.id);
        localStorage.setItem(STORAGE_UNLOCKED, JSON.stringify([...unlockedProjects]));
        sfx.station();
        showUnlockBanner(
          proj.icon,
          "ESTACIÓN ALCANZADA · PROYECTO DESBLOQUEADO",
          proj.title,
          "Ábrelo en 📂 Portafolio para ver código y demo"
        );
        renderPortfolioProjects();
      }
    }
  }

  function updateHUD() {
    hudDist.textContent = Math.floor(distance) + "m";
    hudCoins.textContent = coins;
    hudMult.textContent = "x" + multiplier;
    hudBest.textContent = bestScore;
    unlockCountEl.textContent = `${unlockedProjects.size}/${PROJECTS.length}`;

    // Próxima estación
    const nextProj = PROJECTS.find((p) => !unlockedProjects.has(p.id));
    if (nextProj) {
      const remaining = Math.max(0, Math.ceil(nextProj.stationDist - distance));
      const pct = Math.min(100, (distance / nextProj.stationDist) * 100);
      spLabel.textContent = `🚇 Próxima estación: ${nextProj.title}`;
      spMeters.textContent = `${remaining}m`;
      spFill.style.width = `${pct}%`;
    } else {
      spLabel.textContent = "🏆 ¡Todas las estaciones de proyectos desbloqueadas!";
      spMeters.textContent = "6/6";
      spFill.style.width = "100%";
    }

    // Power-ups activos
    const chips = [];
    if (player.magnetTimer > 0) chips.push(`🧲 Imán ${player.magnetTimer.toFixed(1)}s`);
    if (player.hoverTimer > 0) chips.push(`🛹 Hoverboard ${player.hoverTimer.toFixed(1)}s`);
    powerupHud.innerHTML = chips.map((c) => `<div class="pu-chip">${c}</div>`).join("");
  }

  // ------------------------------------------------------------------------
  // 9. ACTUALIZACIÓN FÍSICA (UPDATE LOOP)
  // ------------------------------------------------------------------------
  function update(dt) {
    if (shakeTimer > 0) shakeTimer = Math.max(0, shakeTimer - dt);

    if (gameState !== "playing") {
      // Animación suave de fondo cuando está en menú
      trackOffset = (trackOffset + dt * 0.25) % 1;
      for (const b of buildings) {
        b.z -= dt * 0.14;
        if (b.z < -0.05) b.z += 1.05;
      }
      return;
    }

    // Incrementar velocidad progresivamente
    speed = Math.min(1.18, speed + dt * 0.008);
    distance += speed * 26 * dt;
    trackOffset = (trackOffset + speed * 3.2 * dt) % 1;

    // Interpolar carril visual
    player.visualLane += (player.lane - player.visualLane) * Math.min(1, dt * 15);
    player.runCycle += dt * (11 + speed * 8);

    // Salto y gravedad
    if (player.isJumping) {
      player.y += player.vy * dt;
      player.vy -= 1850 * dt;
      if (player.y <= 0) {
        player.y = 0;
        player.vy = 0;
        player.isJumping = false;
      }
    }

    // Slide
    if (player.isSliding) {
      player.slideTimer -= dt;
      if (player.slideTimer <= 0) {
        player.isSliding = false;
      }
    }

    // Power-ups timers
    if (player.magnetTimer > 0) player.magnetTimer = Math.max(0, player.magnetTimer - dt);
    if (player.hoverTimer > 0) {
      player.hoverTimer = Math.max(0, player.hoverTimer - dt);
      if (Math.random() < 0.45) {
        spawnBurst(player.visualLane, 0.05, 1, "#a855f7");
      }
    }
    if (player.invulnTimer > 0) player.invulnTimer = Math.max(0, player.invulnTimer - dt);

    // Edificios laterales
    for (const b of buildings) {
      b.z -= speed * 0.65 * dt;
      if (b.z < -0.05) b.z += 1.05;
    }

    // Spawn de oleadas
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnWave();
      spawnTimer = Math.max(0.58, 1.15 - (speed - 0.55) * 0.7);
    }

    // Actualizar entidades y colisiones
    const playerZ = 0.06;
    for (let i = entities.length - 1; i >= 0; i--) {
      const ent = entities[i];
      ent.z -= speed * dt;

      // Imán atrae monedas hacia el carril del jugador
      if (ent.kind === "coin" && player.magnetTimer > 0 && ent.z < 0.45 && ent.z > -0.02) {
        ent.lane += (player.visualLane - ent.lane) * Math.min(1, dt * 10);
      }

      // Colisión cerca de playerZ
      if (Math.abs(ent.z - playerZ) < 0.045 && Math.abs(ent.lane - player.visualLane) < 0.46) {
        if (ent.kind === "coin") {
          coins++;
          streakCoins++;
          if (streakCoins >= 10) {
            multiplier = Math.min(5, multiplier + 1);
            streakCoins = 0;
          }
          sfx.coin();
          spawnBurst(ent.lane, ent.z, 6, "#f59e0b");
          entities.splice(i, 1);
          continue;
        }

        if (ent.kind === "skill") {
          coins += 5;
          multiplier = Math.min(5, multiplier + 1);
          sfx.skill();
          spawnBurst(ent.lane, ent.z, 12, ent.color);
          showUnlockBanner("⚡", "HABILIDAD RECOLECTADA", ent.label, `Multiplicador ahora en x${multiplier}`);
          entities.splice(i, 1);
          continue;
        }

        if (ent.kind === "powerup") {
          sfx.powerup();
          if (ent.puType === "magnet") {
            player.magnetTimer = 8.0;
            showUnlockBanner("🧲", "POWER-UP ACTIVO", "Imán de Código", "Atrae monedas automáticamente por 8s");
          } else {
            player.hoverTimer = 7.0;
            showUnlockBanner("🛹", "POWER-UP ACTIVO", "Hoverboard Dev", "Escudo protector activo por 7s");
          }
          spawnBurst(ent.lane, ent.z, 14, "#06b6d4");
          entities.splice(i, 1);
          continue;
        }

        if (ent.kind === "obstacle") {
          let hit = true;
          if (ent.type === "barrier_low" && player.y > 42) hit = false;
          if (ent.type === "barrier_high" && player.isSliding) hit = false;
          if (player.invulnTimer > 0) hit = false;

          if (hit) {
            if (player.hoverTimer > 0) {
              // El hoverboard absorbe el golpe
              player.hoverTimer = 0;
              player.invulnTimer = 1.2;
              shakeTimer = 0.25;
              sfx.crash();
              spawnBurst(ent.lane, ent.z, 18, "#f43f5e");
              entities.splice(i, 1);
              showToast("🛡️ ¡Tu Hoverboard salvó la carrera!");
              continue;
            } else {
              triggerGameOver();
              return;
            }
          }
        }
      }

      if (ent.z < -0.15) {
        entities.splice(i, 1);
      }
    }

    // Partículas
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.lane += p.vx * dt;
      p.y += p.vy * dt;
      p.vy -= 420 * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    checkStationUnlocks();
    updateHUD();
  }

  // ------------------------------------------------------------------------
  // 10. RENDERIZADO EN CANVAS (DARK & LIGHT THEME)
  // ------------------------------------------------------------------------
  function draw() {
    const isDark = theme === "dark";
    ctx.save();

    if (shakeTimer > 0) {
      const mag = shakeTimer * 18;
      ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }

    const horizonY = H * 0.34;

    // 1. Cielo / Fondo
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    if (isDark) {
      skyGrad.addColorStop(0, "#040711");
      skyGrad.addColorStop(1, "#111b36");
    } else {
      skyGrad.addColorStop(0, "#bae6fd");
      skyGrad.addColorStop(1, "#f8fafc");
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, horizonY + 2);

    // Suelo lateral fuera de las vías
    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, H);
    if (isDark) {
      groundGrad.addColorStop(0, "#090f1f");
      groundGrad.addColorStop(1, "#050811");
    } else {
      groundGrad.addColorStop(0, "#e2e8f0");
      groundGrad.addColorStop(1, "#cbd5e1");
    }
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, W, H - horizonY);

    // Sol / Luna en el horizonte
    const sunGrad = ctx.createRadialGradient(W * 0.5, horizonY - 25, 10, W * 0.5, horizonY - 25, 110);
    if (isDark) {
      sunGrad.addColorStop(0, "rgba(244, 63, 94, 0.85)");
      sunGrad.addColorStop(0.5, "rgba(168, 85, 247, 0.35)");
      sunGrad.addColorStop(1, "rgba(168, 85, 247, 0)");
    } else {
      sunGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      sunGrad.addColorStop(0.5, "rgba(245, 158, 11, 0.35)");
      sunGrad.addColorStop(1, "rgba(245, 158, 11, 0)");
    }
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(W * 0.5, horizonY - 25, 110, 0, Math.PI * 2);
    ctx.fill();

    // 2. Edificios laterales en perspectiva (ordenados de fondo a frente)
    const sortedBuildings = [...buildings].sort((a, b) => b.z - a.z);
    for (const b of sortedBuildings) {
      if (b.z < 0 || b.z > 1) continue;
      const p = project(b.side < 0 ? -1.45 : 3.45, b.z);
      const bw = b.w * p.scale;
      const bh = b.h * p.scale;
      const bx = b.side < 0 ? p.x - bw : p.x;
      const by = p.y - bh;

      ctx.fillStyle = isDark ? "#0d1528" : "#ffffff";
      ctx.strokeStyle = isDark ? "rgba(6, 182, 212, 0.25)" : "rgba(15, 23, 42, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeRect(bx, by, bw, bh);

      // Ventanas iluminadas
      ctx.fillStyle = isDark
        ? (b.side < 0 ? "rgba(6, 182, 212, 0.45)" : "rgba(244, 63, 94, 0.45)")
        : "rgba(56, 189, 248, 0.45)";
      const rows = 4;
      const cols = 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.fillRect(
            bx + bw * (0.2 + c * 0.4),
            by + bh * (0.14 + r * 0.2),
            bw * 0.22,
            bh * 0.1
          );
        }
      }
    }

    // 3. Pista / Plataforma de 3 carriles
    const farLeft = project(-0.6, 1.0);
    const farRight = project(2.6, 1.0);
    const nearLeft = project(-0.6, -0.05);
    const nearRight = project(2.6, -0.05);

    ctx.beginPath();
    ctx.moveTo(farLeft.x, farLeft.y);
    ctx.lineTo(farRight.x, farRight.y);
    ctx.lineTo(nearRight.x, nearRight.y);
    ctx.lineTo(nearLeft.x, nearLeft.y);
    ctx.closePath();
    ctx.fillStyle = isDark ? "#0f172a" : "#e2e8f0";
    ctx.fill();

    // Bordes neón de la pista
    ctx.strokeStyle = isDark ? "#06b6d4" : "#0284c7";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(farLeft.x, farLeft.y);
    ctx.lineTo(nearLeft.x, nearLeft.y);
    ctx.moveTo(farRight.x, farRight.y);
    ctx.lineTo(nearRight.x, nearRight.y);
    ctx.stroke();

    // Durmientes de las vías en movimiento
    const tieCount = 18;
    for (let i = 0; i < tieCount; i++) {
      const z = (i / tieCount + (1 - trackOffset) / tieCount) % 1;
      for (let lane = 0; lane < 3; lane++) {
        const pL = project(lane - 0.28, z);
        const pR = project(lane + 0.28, z);
        ctx.strokeStyle = isDark ? "rgba(148, 163, 184, 0.25)" : "rgba(71, 85, 105, 0.28)";
        ctx.lineWidth = Math.max(1, 5 * pL.scale);
        ctx.beginPath();
        ctx.moveTo(pL.x, pL.y);
        ctx.lineTo(pR.x, pR.y);
        ctx.stroke();
      }
    }

    // Rieles de los 3 carriles
    for (let lane = 0; lane < 3; lane++) {
      for (const offset of [-0.22, 0.22]) {
        const pFar = project(lane + offset, 1.0);
        const pNear = project(lane + offset, -0.05);
        ctx.strokeStyle = isDark ? "rgba(248, 250, 252, 0.32)" : "rgba(30, 41, 59, 0.35)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pFar.x, pFar.y);
        ctx.lineTo(pNear.x, pNear.y);
        ctx.stroke();
      }
    }

    // 4. Entidades ordenadas de lejos a cerca (Painter's Algorithm)
    const drawList = [...entities].sort((a, b) => b.z - a.z);
    for (const ent of drawList) {
      if (ent.z < -0.05 || ent.z > 1.05) continue;
      const p = project(ent.lane, ent.z, ent.y || 0);

      if (ent.kind === "coin") {
        const r = 15 * p.scale;
        ctx.save();
        ctx.translate(p.x, p.y - 18 * p.scale);
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = Math.max(1, 2.5 * p.scale);
        ctx.strokeStyle = "#fef08a";
        ctx.stroke();
        if (r > 6) {
          ctx.fillStyle = "#78350f";
          ctx.font = `800 ${Math.round(r * 0.95)}px "IBM Plex Mono", monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("</>", 0, 1);
        }
        ctx.restore();
      } else if (ent.kind === "skill") {
        const r = 20 * p.scale;
        ctx.save();
        ctx.translate(p.x, p.y - 22 * p.scale);
        ctx.fillStyle = ent.color;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2 * p.scale;
        ctx.stroke();
        if (r > 8) {
          ctx.fillStyle = "#ffffff";
          ctx.font = `800 ${Math.round(9 * p.scale)}px "IBM Plex Mono", monospace`;
          ctx.textAlign = "center";
          ctx.fillText(ent.label, 0, -r - 6 * p.scale);
        }
        ctx.restore();
      } else if (ent.kind === "powerup") {
        const s = 26 * p.scale;
        ctx.save();
        ctx.translate(p.x, p.y - 24 * p.scale);
        ctx.fillStyle = ent.puType === "magnet" ? "#06b6d4" : "#a855f7";
        ctx.beginPath();
        ctx.roundRect(-s / 2, -s / 2, s, s, 6 * p.scale);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = `${Math.round(16 * p.scale)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(ent.puType === "magnet" ? "🧲" : "🛹", 0, 0);
        ctx.restore();
      } else if (ent.kind === "obstacle") {
        drawObstacle(ent, p, isDark);
      }
    }

    // 5. Personaje (Stefani)
    drawPlayer(isDark);

    // 6. Partículas
    for (const pt of particles) {
      const p = project(pt.lane, pt.z, pt.y);
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, pt.size * p.scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  function drawObstacle(ent, p, isDark) {
    const s = p.scale;
    if (ent.type === "train") {
      const w = 96 * s;
      const h = 118 * s;
      // Cuerpo del tren
      ctx.fillStyle = isDark ? "#1e293b" : "#334155";
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = Math.max(1.5, 3 * s);
      ctx.beginPath();
      ctx.roundRect(p.x - w / 2, p.y - h, w, h, 10 * s);
      ctx.fill();
      ctx.stroke();

      // Parabrisas frontal
      ctx.fillStyle = "#06b6d4";
      ctx.fillRect(p.x - w * 0.36, p.y - h * 0.82, w * 0.72, h * 0.28);

      // Faros
      ctx.fillStyle = "#fde047";
      ctx.beginPath();
      ctx.arc(p.x - w * 0.28, p.y - h * 0.22, 7 * s, 0, Math.PI * 2);
      ctx.arc(p.x + w * 0.28, p.y - h * 0.22, 7 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (ent.type === "barrier_low") {
      const w = 88 * s;
      const h = 38 * s;
      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.roundRect(p.x - w / 2, p.y - h, w, h, 6 * s);
      ctx.fill();
      // Franjas diagonales blancas de alerta
      ctx.fillStyle = "#ffffff";
      for (let k = -1; k <= 1; k++) {
        ctx.fillRect(p.x + k * 22 * s - 5 * s, p.y - h + 6 * s, 10 * s, h - 12 * s);
      }
    } else if (ent.type === "barrier_high") {
      const w = 94 * s;
      const barH = 34 * s;
      const clearance = 52 * s;
      // Postes laterales
      ctx.fillStyle = isDark ? "#64748b" : "#475569";
      ctx.fillRect(p.x - w / 2, p.y - clearance - barH, 8 * s, clearance + barH);
      ctx.fillRect(p.x + w / 2 - 8 * s, p.y - clearance - barH, 8 * s, clearance + barH);
      // Cartel superior (hay que deslizarse)
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.roundRect(p.x - w / 2, p.y - clearance - barH, w, barH, 6 * s);
      ctx.fill();
      if (s > 0.35) {
        ctx.fillStyle = "#0f172a";
        ctx.font = `800 ${Math.round(12 * s)}px "IBM Plex Mono", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("▼ SLIDE", p.x, p.y - clearance - barH / 2);
      }
    }
  }

  function drawPlayer(isDark) {
    const groundP = project(player.visualLane, 0.06, 0);
    const p = project(player.visualLane, 0.06, player.y + (player.hoverTimer > 0 ? 18 : 0));
    const s = p.scale;

    // Sombra en el suelo
    const shadowScale = Math.max(0.4, 1 - player.y / 220);
    ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.55)" : "rgba(15, 23, 42, 0.25)";
    ctx.beginPath();
    ctx.ellipse(groundP.x, groundP.y, 26 * s * shadowScale, 8 * s * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Parpadeo si es invulnerable
    if (player.invulnTimer > 0 && Math.floor(player.invulnTimer * 14) % 2 === 0) return;

    ctx.save();
    ctx.translate(p.x, p.y);

    // Hoverboard si está activo
    if (player.hoverTimer > 0) {
      ctx.fillStyle = "#a855f7";
      ctx.beginPath();
      ctx.roundRect(-28 * s, -6 * s, 56 * s, 10 * s, 5 * s);
      ctx.fill();
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 2 * s;
      ctx.stroke();
    }

    const bodyScaleY = player.isSliding ? 0.52 : 1;
    ctx.scale(1, bodyScaleY);

    const swing = Math.sin(player.runCycle) * 10 * s;

    // Piernas
    ctx.strokeStyle = isDark ? "#38bdf8" : "#0284c7";
    ctx.lineWidth = 8 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-8 * s, -28 * s);
    ctx.lineTo(-10 * s, -4 * s + swing * 0.4);
    ctx.moveTo(8 * s, -28 * s);
    ctx.lineTo(10 * s, -4 * s - swing * 0.4);
    ctx.stroke();

    // Torso / Hoodie coral de Stefani
    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.roundRect(-18 * s, -64 * s, 36 * s, 38 * s, 10 * s);
    ctx.fill();

    // Brazos
    ctx.strokeStyle = "#fb7185";
    ctx.lineWidth = 7 * s;
    ctx.beginPath();
    ctx.moveTo(-18 * s, -56 * s);
    ctx.lineTo(-26 * s, -36 * s - swing * 0.5);
    ctx.moveTo(18 * s, -56 * s);
    ctx.lineTo(26 * s, -36 * s + swing * 0.5);
    ctx.stroke();

    // Cabeza
    ctx.fillStyle = "#fde68a";
    ctx.beginPath();
    ctx.arc(0, -80 * s, 16 * s, 0, Math.PI * 2);
    ctx.fill();

    // Cabello / Gorra dev
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(0, -85 * s, 16 * s, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#06b6d4";
    ctx.fillRect(-10 * s, -88 * s, 20 * s, 5 * s);

    ctx.restore();
  }

  // Loop principal
  let lastTime = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ------------------------------------------------------------------------
  // 11. MODAL DEL PORTAFOLIO (PROYECTOS, SKILLS, SOBRE MÍ, CONTACTO)
  // ------------------------------------------------------------------------
  function renderPortfolioProjects() {
    pmProjectsGrid.innerHTML = PROJECTS.map((proj) => {
      const isUnlocked = unlockedProjects.has(proj.id);
      return `
        <article class="pm-proj-card ${isUnlocked ? "is-unlocked" : "is-locked"}">
          <div class="pm-proj-top">
            <span style="font-size:24px">${proj.icon}</span>
            <span class="pm-proj-status ${isUnlocked ? "unlocked" : "locked"}">
              ${isUnlocked ? "✓ Desbloqueado" : `🔒 Estación ${proj.stationDist}m`}
            </span>
          </div>
          <h3>${proj.title}</h3>
          <p>${proj.desc}</p>
          <div class="pm-tags">${proj.tags.map((t) => `<span>${t}</span>`).join("")}</div>
          <div class="pm-links">
            ${proj.live ? `<a class="pm-link live" href="${proj.live}" target="_blank" rel="noopener noreferrer">Demo Live ↗</a>` : ""}
            <a class="pm-link" href="${proj.github}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderPortfolioSkills() {
    pmSkillsGrid.innerHTML = SKILLS.map((sk) => `
      <div class="pm-skill-card">
        <div class="pm-skill-head">
          <span>${sk.name}</span>
          <span style="color:${sk.color}">${sk.level}%</span>
        </div>
        <div class="pm-skill-bar">
          <div class="pm-skill-fill" style="width:${sk.level}%; background:${sk.color}"></div>
        </div>
      </div>
    `).join("");
  }

  function openPortfolio() {
    if (gameState === "playing") pauseGame();
    renderPortfolioProjects();
    renderPortfolioSkills();
    portfolioModal.classList.add("is-open");
    portfolioModal.setAttribute("aria-hidden", "false");
  }

  function closePortfolio() {
    portfolioModal.classList.remove("is-open");
    portfolioModal.setAttribute("aria-hidden", "true");
  }

  document.getElementById("open-portfolio-btn").addEventListener("click", openPortfolio);
  document.getElementById("start-portfolio-btn").addEventListener("click", openPortfolio);
  document.getElementById("pause-portfolio-btn").addEventListener("click", openPortfolio);
  document.getElementById("go-portfolio-btn").addEventListener("click", openPortfolio);
  document.getElementById("pm-close").addEventListener("click", closePortfolio);
  document.getElementById("pm-backdrop").addEventListener("click", closePortfolio);

  // Tabs del modal
  document.querySelectorAll(".pm-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".pm-tab").forEach((t) => t.classList.remove("is-active"));
      document.querySelectorAll(".pm-pane").forEach((p) => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      document.getElementById("tab-" + tab.dataset.tab).classList.add("is-active");
    });
  });

  // Desbloquear todos los proyectos manualmente
  document.getElementById("unlock-all-btn").addEventListener("click", () => {
    PROJECTS.forEach((p) => unlockedProjects.add(p.id));
    localStorage.setItem(STORAGE_UNLOCKED, JSON.stringify([...unlockedProjects]));
    renderPortfolioProjects();
    updateHUD();
    showToast("🔓 ¡Todos los proyectos desbloqueados!");
  });

  // Copiar email
  document.getElementById("copy-email-btn").addEventListener("click", () => {
    const email = "steff.18random@gmail.com";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email).then(() => showToast("✓ Correo copiado: " + email));
    } else {
      showToast("Correo: " + email);
    }
  });

  // Botones de juego
  document.getElementById("start-btn").addEventListener("click", startGame);
  document.getElementById("pause-btn").addEventListener("click", () => {
    if (gameState === "playing") pauseGame();
    else if (gameState === "paused") resumeGame();
  });
  document.getElementById("resume-btn").addEventListener("click", resumeGame);
  document.getElementById("restart-from-pause-btn").addEventListener("click", startGame);
  document.getElementById("retry-btn").addEventListener("click", startGame);

  // Toast helper
  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }

  // Render inicial
  renderPortfolioProjects();
  renderPortfolioSkills();
  updateHUD();
})();
