// ==========================================================================
// STEFANI SÁNCHEZ · INTERACTIVE STORY GAME PORTFOLIO
// Canvas Side-Scroller cinemático e interactivo con narrativa completa
// ==========================================================================

(() => {
  "use strict";

  // ------------------------------------------------------------------------
  // 1. ESTACIONES NARRATIVAS / ZONAS DEL MUNDO (QUIÉN SOY, PROYECTOS, STACK, CONTACTO)
  // ------------------------------------------------------------------------
  const STATIONS = [
    {
      x: 100,
      title: "01 · Presentación",
      tag: "CAPÍTULO 01 · QUIÉN SOY",
      name: "Stefani Sánchez · Full Stack Developer",
      desc: "¡Hola! Soy Stefani Sánchez. Construyo aplicaciones web donde la arquitectura robusta y la interactividad se fusionan para resolver problemas reales.",
      tags: ["Full Stack", "EdTech", "Gamificación", "Backend First"],
      actions: [
        { label: "Comenzar recorrido →", jumpTo: 1 }
      ],
      landmark: "terminal"
    },
    {
      x: 750,
      title: "02 · Filosofía & Arquitectura",
      tag: "CAPÍTULO 02 · PERFIL TÉCNICO",
      name: "Código Limpio, Escalable y Probado",
      desc: "Me especializo en diseñar APIs REST resilientes, modelar bases de datos en PostgreSQL y empaquetar servicios en contenedores Docker con cobertura de pruebas automatizadas en Jest.",
      tags: ["Node.js", "PostgreSQL", "TypeScript", "Docker", "Jest"],
      actions: [
        { label: "Ver primer proyecto →", jumpTo: 2 }
      ],
      landmark: "architecture"
    },
    {
      x: 1450,
      title: "03 · Escape Room Programación",
      tag: "PROYECTO 01 · EDTECH & CANVAS",
      name: "Escape Room: Puzzles de Código",
      desc: "Videojuego educativo desarrollado con HTML5 Canvas puro y JavaScript. Enseña fundamentos lógicos y estructuras de control a través de desafíos interactivos.",
      tags: ["HTML5 Canvas", "JavaScript", "Gamificación", "CSS3"],
      actions: [
        { label: "Demo Live ↗", href: "https://steff-360.github.io/escape-room-programacion/", live: true },
        { label: "Ver en GitHub ↗", href: "https://github.com/steff-360" }
      ],
      landmark: "project_canvas"
    },
    {
      x: 2150,
      title: "04 · Job Listings API",
      tag: "PROYECTO 02 · BACKEND & DATABASE",
      name: "API REST de Empleos con JWT",
      desc: "Backend escalable para ofertas laborales. Implementa CRUD completo, hash seguro de contraseñas, tokens JWT, middleware de autorización y pool en PostgreSQL.",
      tags: ["Node.js", "Express", "PostgreSQL", "JWT", "REST API"],
      actions: [
        { label: "Ver Repositorio ↗", href: "https://github.com/steff-360" }
      ],
      landmark: "project_api"
    },
    {
      x: 2850,
      title: "05 · TechZone PostgreSQL",
      tag: "PROYECTO 03 · SQL AVANZADO",
      name: "Arquitectura de Datos para E-Commerce",
      desc: "Diseño relacional optimizado para plataforma tecnológica: procedimientos almacenados, índices compuestos, triggers de auditoría y análisis de transacciones.",
      tags: ["PostgreSQL", "SQL Tuning", "Triggers", "Data Integrity"],
      actions: [
        { label: "Ver Repositorio ↗", href: "https://github.com/steff-360" }
      ],
      landmark: "project_database"
    },
    {
      x: 3550,
      title: "06 · Algodones Maravilla",
      tag: "PROYECTO 04 · TYPESCRIPT CLI",
      name: "Gestor de Inventario en Consola",
      desc: "Sistema interactivo por terminal construido en TypeScript. Implementa arquitectura limpia, tipado estricto y patrones orientados a objetos para control de stock.",
      tags: ["TypeScript", "OOP", "Clean Code", "CLI"],
      actions: [
        { label: "Ver Repositorio ↗", href: "https://github.com/steff-360" }
      ],
      landmark: "project_terminal"
    },
    {
      x: 4250,
      title: "07 · CampusLands CLI",
      tag: "PROYECTO 05 · GESTIÓN EDUCATIVA",
      name: "Plataforma CLI de Seguimiento Estudiantil",
      desc: "Herramienta técnica para control académico: registro y evaluación de notas, reportes de asistencia y modularización de procesos de aprendizaje.",
      tags: ["Node.js", "TypeScript", "EdTech", "CLI Tooling"],
      actions: [
        { label: "Ver Repositorio ↗", href: "https://github.com/steff-360" }
      ],
      landmark: "project_school"
    },
    {
      x: 4950,
      title: "08 · Docker + Supabase Infra",
      tag: "PROYECTO 06 · DEVOPS & INFRA",
      name: "Entornos Reproducibles con Docker Compose",
      desc: "Orquestación de microservicios, persistencia con Supabase local, variables de entorno aisladas y despliegue automatizado sin fricción.",
      tags: ["Docker", "Supabase", "DevOps", "Containers"],
      actions: [
        { label: "Ver Repositorio ↗", href: "https://github.com/steff-360" }
      ],
      landmark: "project_docker"
    },
    {
      x: 5650,
      title: "09 · Arsenal Tecnológico",
      tag: "CAPÍTULO 04 · STACK & SKILLS",
      name: "Tecnologías y Nivel de Dominio",
      desc: "Node.js (92%), PostgreSQL (90%), Express (88%), Git/GitHub (88%), TypeScript (85%), Docker (82%), HTML5/CSS3 (82%), REST APIs (80%), Supabase (75%), Jest (74%).",
      tags: ["Backend", "Databases", "DevOps", "Testing"],
      actions: [
        { label: "Abrir Resumen CV ↗", openCv: true }
      ],
      landmark: "skills_vault"
    },
    {
      x: 6350,
      title: "10 · Conectemos",
      tag: "CAPÍTULO 05 · CONTACTO",
      name: "¿Construimos algo increíble juntas?",
      desc: "Estoy lista para sumarme a equipos de producto, proyectos de tecnología educativa o retos full stack de alto impacto. Escríbeme y charlemos.",
      tags: ["steff.18random@gmail.com", "LinkedIn", "GitHub"],
      actions: [
        { label: "Copiar Email 📋", copyEmail: true },
        { label: "LinkedIn ↗", href: "https://www.linkedin.com/in/stefani-s%C3%A1nchez-b35b65279" }
      ],
      landmark: "portal_contact"
    }
  ];

  const WORLD_WIDTH = 7100;

  // Proyectos para el modal de resumen
  const OVERVIEW_PROJECTS = [
    { title: "Escape Room Programación", tags: ["Canvas", "JS", "EdTech"], live: "https://steff-360.github.io/escape-room-programacion/", gh: "https://github.com/steff-360", desc: "Juego didáctico interactivo de lógica y código." },
    { title: "Job Listings API", tags: ["Node.js", "Express", "PostgreSQL", "JWT"], gh: "https://github.com/steff-360", desc: "API REST segura con autenticación por tokens y testing." },
    { title: "TechZone PostgreSQL", tags: ["PostgreSQL", "SQL Tuning", "Procedures"], gh: "https://github.com/steff-360", desc: "Base de datos analítica y transaccional optimizada." },
    { title: "Algodones Maravilla", tags: ["TypeScript", "OOP", "CLI"], gh: "https://github.com/steff-360", desc: "Gestor de inventario en consola con arquitectura limpia." },
    { title: "CampusLands CLI", tags: ["Node.js", "TypeScript", "EdTech"], gh: "https://github.com/steff-360", desc: "Plataforma de seguimiento de estudiantes en CLI." },
    { title: "Docker + Supabase Infra", tags: ["Docker Compose", "DevOps"], gh: "https://github.com/steff-360", desc: "Infraestructura reproducible y aislada en contenedores." }
  ];

  const OVERVIEW_SKILLS = [
    { name: "Node.js", level: "92%" },
    { name: "PostgreSQL", level: "90%" },
    { name: "Express.js", level: "88%" },
    { name: "Git / GitHub", level: "88%" },
    { name: "TypeScript", level: "85%" },
    { name: "Docker", level: "82%" },
    { name: "HTML5 / CSS3", level: "82%" },
    { name: "REST APIs", level: "80%" },
    { name: "Supabase", level: "75%" },
    { name: "Jest / Testing", level: "74%" }
  ];

  // ------------------------------------------------------------------------
  // 2. REFERENCIAS DOM
  // ------------------------------------------------------------------------
  const canvas = document.getElementById("world-canvas");
  const ctx = canvas.getContext("2d");

  const hudZone = document.getElementById("hud-zone");
  const hudProgress = document.getElementById("hud-progress");
  const themeToggle = document.getElementById("theme-toggle");
  const themeLabel = document.getElementById("theme-label");
  const soundToggle = document.getElementById("sound-toggle");
  const soundIcon = document.getElementById("sound-icon");

  const storyCard = document.getElementById("story-card");
  const scTag = document.getElementById("sc-tag");
  const scCounter = document.getElementById("sc-counter");
  const scTitle = document.getElementById("sc-title");
  const scBody = document.getElementById("sc-body");
  const scTags = document.getElementById("sc-tags");
  const scActions = document.getElementById("sc-actions");

  const introOverlay = document.getElementById("intro-overlay");
  const startGameBtn = document.getElementById("start-game-btn");
  const introOverviewBtn = document.getElementById("intro-overview-btn");
  const openOverviewBtn = document.getElementById("open-overview");

  const overviewModal = document.getElementById("overview-modal");
  const omClose = document.getElementById("om-close");
  const omBackdrop = document.getElementById("om-backdrop");
  const omProjects = document.getElementById("om-projects");
  const omSkills = document.getElementById("om-skills");
  const omCopyBtn = document.getElementById("om-copy-btn");
  const toastEl = document.getElementById("toast");

  const padLeft = document.getElementById("btn-left");
  const padRight = document.getElementById("btn-right");
  const padJump = document.getElementById("btn-jump");
  const chapButtons = document.querySelectorAll(".chap-btn");

  // ------------------------------------------------------------------------
  // 3. TEMA OSCURO / CLARO
  // ------------------------------------------------------------------------
  let currentTheme = localStorage.getItem("stefani_game_theme") || "dark";
  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("stefani_game_theme", theme);
    if (themeLabel) themeLabel.textContent = theme === "dark" ? "Claro" : "Oscuro";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#090d16" : "#f8fafc");
  }
  applyTheme(currentTheme);

  themeToggle.addEventListener("click", () => {
    applyTheme(currentTheme === "dark" ? "light" : "dark");
    showToast(currentTheme === "dark" ? "🌙 Modo Oscuro" : "☀️ Modo Blanco");
  });

  // ------------------------------------------------------------------------
  // 4. SONIDO AMBIENTAL & SFX (WEB AUDIO API)
  // ------------------------------------------------------------------------
  let soundEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = "sine", duration = 0.08, vol = 0.06, slideTo = null) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, audioCtx.currentTime + duration);
      }
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }

  const sfx = {
    step: () => playTone(180, "triangle", 0.04, 0.03, 140),
    jump: () => playTone(280, "sine", 0.12, 0.06, 520),
    station: () => {
      playTone(440, "sine", 0.08, 0.05);
      setTimeout(() => playTone(660, "triangle", 0.14, 0.06), 70);
    }
  };

  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundIcon.textContent = soundEnabled ? "🔊" : "🔇";
    showToast(soundEnabled ? "🔊 Sonido activado" : "🔇 Sonido silenciado");
  });

  // ------------------------------------------------------------------------
  // 5. MOTOR DEL JUEGO (FÍSICA + CÁMARA + ANIMACIÓN)
  // ------------------------------------------------------------------------
  let W = window.innerWidth;
  let H = window.innerHeight;
  let DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  // Jugadora (Stefani)
  const player = {
    x: 100,
    y: 0,
    vx: 0,
    vy: 0,
    w: 36,
    h: 68,
    speed: 380,
    jumpForce: 720,
    isGrounded: true,
    facing: 1, // 1 der, -1 izq
    walkFrame: 0,
    stepTimer: 0
  };

  const camera = {
    x: 0,
    targetX: 0
  };

  const keys = {
    left: false,
    right: false,
    jump: false
  };

  let currentStationIndex = 0;
  let targetStationX = null; // Para navegación suave automática

  // Controles de teclado
  window.addEventListener("keydown", (e) => {
    initAudio();
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      keys.left = true;
      targetStationX = null;
    }
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      keys.right = true;
      targetStationX = null;
    }
    if ((e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.key === " ") && player.isGrounded) {
      e.preventDefault();
      player.vy = -player.jumpForce;
      player.isGrounded = false;
      sfx.jump();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = false;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = false;
  });

  // Botones táctiles
  function bindTouch(btn, onDown, onUp) {
    if (!btn) return;
    btn.addEventListener("touchstart", (e) => { e.preventDefault(); initAudio(); onDown(); }, { passive: false });
    btn.addEventListener("touchend", (e) => { e.preventDefault(); onUp(); }, { passive: false });
    btn.addEventListener("mousedown", () => { initAudio(); onDown(); });
    btn.addEventListener("mouseup", onUp);
    btn.addEventListener("mouseleave", onUp);
  }

  bindTouch(padLeft, () => { keys.left = true; targetStationX = null; }, () => { keys.left = false; });
  bindTouch(padRight, () => { keys.right = true; targetStationX = null; }, () => { keys.right = false; });
  bindTouch(padJump, () => {
    if (player.isGrounded) {
      player.vy = -player.jumpForce;
      player.isGrounded = false;
      sfx.jump();
    }
  }, () => {});

  // ------------------------------------------------------------------------
  // 6. ACTUALIZACIÓN NARRATIVA DE LA ESTACIÓN ACTIVA
  // ------------------------------------------------------------------------
  function updateStationUI(index) {
    const station = STATIONS[index];
    if (!station) return;

    scTag.textContent = station.tag;
    scCounter.textContent = `${index + 1} / ${STATIONS.length}`;
    scTitle.textContent = station.name;
    scBody.textContent = station.desc;

    // Tags
    scTags.innerHTML = station.tags.map(t => `<span>${t}</span>`).join("");

    // Acciones dinámicas
    scActions.innerHTML = "";
    station.actions.forEach(act => {
      const btn = document.createElement("button");
      btn.className = `sc-btn ${act.live ? "sc-btn-primary" : ""}`;
      btn.type = "button";
      btn.textContent = act.label;

      btn.addEventListener("click", () => {
        if (act.href) {
          window.open(act.href, "_blank", "noopener,noreferrer");
        } else if (act.jumpTo !== undefined) {
          travelToStation(act.jumpTo);
        } else if (act.copyEmail) {
          copyEmailToClipboard();
        } else if (act.openCv) {
          openOverview();
        }
      });
      scActions.appendChild(btn);
    });

    hudZone.textContent = station.title;

    // Resaltar botón de capítulo activo
    chapButtons.forEach((btn, idx) => {
      const zoneIdx = parseInt(btn.dataset.zone, 10);
      btn.classList.toggle("is-active", (zoneIdx === 0 && index < 1) ||
                                       (zoneIdx === 1 && index === 1) ||
                                       (zoneIdx === 2 && index >= 2 && index <= 7) ||
                                       (zoneIdx === 3 && index === 8) ||
                                       (zoneIdx === 4 && index >= 9));
    });
  }

  function travelToStation(index) {
    if (index >= 0 && index < STATIONS.length) {
      targetStationX = STATIONS[index].x;
      sfx.station();
    }
  }

  // Click en navegación de capítulos inferiores
  chapButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const z = parseInt(btn.dataset.zone, 10);
      const targetIdx = [0, 1, 2, 8, 9][z] || 0;
      travelToStation(targetIdx);
    });
  });

  // ------------------------------------------------------------------------
  // 7. BUCLE FÍSICO Y NARRATIVO
  // ------------------------------------------------------------------------
  let lastTime = performance.now();

  function update(dt) {
    const groundY = H * 0.76;

    // Desplazamiento automático si se hizo click en un capítulo
    if (targetStationX !== null) {
      const diff = targetStationX - player.x;
      if (Math.abs(diff) > 8) {
        player.vx = Math.sign(diff) * player.speed * 1.35;
        player.facing = Math.sign(diff);
      } else {
        player.x = targetStationX;
        player.vx = 0;
        targetStationX = null;
      }
    } else {
      // Controles manuales
      if (keys.left) {
        player.vx = -player.speed;
        player.facing = -1;
      } else if (keys.right) {
        player.vx = player.speed;
        player.facing = 1;
      } else {
        player.vx = 0;
      }
    }

    // Gravedad y salto
    player.vy += 1800 * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    // Límites de mundo
    player.x = Math.max(60, Math.min(WORLD_WIDTH - 120, player.x));

    if (player.y >= groundY - player.h) {
      player.y = groundY - player.h;
      player.vy = 0;
      player.isGrounded = true;
    }

    // Animación de caminar y pasos
    if (Math.abs(player.vx) > 10 && player.isGrounded) {
      player.walkFrame += dt * 14;
      player.stepTimer += dt;
      if (player.stepTimer > 0.22) {
        sfx.step();
        player.stepTimer = 0;
      }
    } else {
      player.walkFrame = 0;
    }

    // Cámara suave centrada en Stefani
    const targetCamX = player.x - W * 0.42;
    camera.x += (targetCamX - camera.x) * Math.min(1, dt * 8);
    camera.x = Math.max(0, Math.min(WORLD_WIDTH - W, camera.x));

    // Determinar estación más cercana
    let closestIdx = 0;
    let minDistance = Infinity;
    STATIONS.forEach((st, i) => {
      const d = Math.abs(player.x - st.x);
      if (d < minDistance) {
        minDistance = d;
        closestIdx = i;
      }
    });

    if (closestIdx !== currentStationIndex && minDistance < 280) {
      currentStationIndex = closestIdx;
      updateStationUI(currentStationIndex);
      sfx.station();
    }

    // Barra de progreso HUD
    const pct = (player.x / (WORLD_WIDTH - 200)) * 100;
    hudProgress.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }

  // ------------------------------------------------------------------------
  // 8. RENDERIZADO DEL MUNDO Y MONUMENTOS
  // ------------------------------------------------------------------------
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const isDark = currentTheme === "dark";
    const groundY = H * 0.76;

    // 1. Cielo con degradado suave
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    if (isDark) {
      skyGrad.addColorStop(0, "#080c16");
      skyGrad.addColorStop(0.7, "#0f192e");
      skyGrad.addColorStop(1, "#16233d");
    } else {
      skyGrad.addColorStop(0, "#e0f2fe");
      skyGrad.addColorStop(0.7, "#f0f9ff");
      skyGrad.addColorStop(1, "#f8fafc");
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, groundY);

    // 2. Capa de fondo Parallax (Edificios lejanos)
    ctx.save();
    ctx.translate(-camera.x * 0.18, 0);
    const bgBuildColor = isDark ? "rgba(15, 23, 42, 0.45)" : "rgba(186, 230, 253, 0.55)";
    ctx.fillStyle = bgBuildColor;
    for (let i = 0; i < 35; i++) {
      const bx = i * 240;
      const bw = 160;
      const bh = 140 + (i % 5) * 45;
      ctx.fillRect(bx, groundY - bh, bw, bh);
    }
    ctx.restore();

    // 3. Capa media Parallax (Estructuras de ingeniería)
    ctx.save();
    ctx.translate(-camera.x * 0.45, 0);
    const midBuildColor = isDark ? "rgba(22, 35, 61, 0.65)" : "rgba(203, 213, 225, 0.5)";
    ctx.fillStyle = midBuildColor;
    for (let i = 0; i < 45; i++) {
      const bx = i * 180;
      const bw = 110;
      const bh = 90 + (i % 4) * 35;
      ctx.fillRect(bx, groundY - bh, bw, bh);
    }
    ctx.restore();

    // 4. Suelo principal interactivo
    ctx.save();
    ctx.translate(-camera.x, 0);

    const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
    if (isDark) {
      groundGrad.addColorStop(0, "#0d1424");
      groundGrad.addColorStop(1, "#070a12");
    } else {
      groundGrad.addColorStop(0, "#e2e8f0");
      groundGrad.addColorStop(1, "#cbd5e1");
    }
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, WORLD_WIDTH, H - groundY);

    // Línea de suelo iluminada
    ctx.strokeStyle = isDark ? "rgba(16, 185, 129, 0.4)" : "rgba(5, 150, 105, 0.35)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(WORLD_WIDTH, groundY);
    ctx.stroke();

    // Marcas de distancia métrica en el suelo
    for (let x = 100; x < WORLD_WIDTH; x += 150) {
      ctx.fillStyle = isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(71, 85, 105, 0.2)";
      ctx.fillRect(x, groundY + 4, 2, 12);
    }

    // 5. Dibujar Estaciones / Monumentos interactivos
    STATIONS.forEach((st, idx) => {
      drawStationLandmark(st, idx, groundY, isDark);
    });

    // 6. Personaje (Stefani)
    drawCharacter(player, groundY, isDark);

    ctx.restore();
  }

  // Dibujar monumentos de cada hito
  function drawStationLandmark(st, idx, groundY, isDark) {
    const isCurrent = idx === currentStationIndex;
    const accentColor = isDark ? "#10b981" : "#059669";
    const subColor = isDark ? "#06b6d4" : "#0284c7";

    ctx.save();
    ctx.translate(st.x, groundY);

    // Halo en la estación actual
    if (isCurrent) {
      const halo = ctx.createRadialGradient(0, -60, 10, 0, -60, 120);
      halo.addColorStop(0, isDark ? "rgba(16, 185, 129, 0.25)" : "rgba(5, 150, 105, 0.2)");
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, -60, 120, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tótem / Pilar base
    ctx.fillStyle = isDark ? "#111b30" : "#ffffff";
    ctx.strokeStyle = isCurrent ? accentColor : (isDark ? "rgba(148, 163, 184, 0.25)" : "rgba(15, 23, 42, 0.15)");
    ctx.lineWidth = isCurrent ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.roundRect(-42, -140, 84, 140, 10);
    ctx.fill();
    ctx.stroke();

    // Pantalla / Núcleo
    ctx.fillStyle = isDark ? "#0a101f" : "#f1f5f9";
    ctx.fillRect(-34, -132, 68, 62);

    // Icono o Gráfico del Hito
    ctx.fillStyle = isCurrent ? accentColor : subColor;
    ctx.font = '800 24px "IBM Plex Mono", monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let glyph = "</>";
    if (st.landmark === "terminal") glyph = "SS";
    if (st.landmark === "architecture") glyph = "⚡";
    if (st.landmark === "project_canvas") glyph = "🎮";
    if (st.landmark === "project_api") glyph = "🔗";
    if (st.landmark === "project_database") glyph = "🗄️";
    if (st.landmark === "project_terminal") glyph = "💻";
    if (st.landmark === "project_school") glyph = "🏫";
    if (st.landmark === "project_docker") glyph = "🐳";
    if (st.landmark === "skills_vault") glyph = "📊";
    if (st.landmark === "portal_contact") glyph = "📬";

    ctx.fillText(glyph, 0, -100);

    // Número de estación
    ctx.font = '700 11px "IBM Plex Mono", monospace';
    ctx.fillStyle = isDark ? "#94a3b8" : "#475569";
    ctx.fillText(`0${idx + 1}`, 0, -50);

    // Cartel flotante sobre el tótem
    const labelY = -162 + Math.sin(performance.now() * 0.003 + idx) * 4;
    ctx.fillStyle = isCurrent ? accentColor : (isDark ? "rgba(15, 23, 42, 0.85)" : "#ffffff");
    ctx.strokeStyle = isCurrent ? accentColor : (isDark ? "rgba(148, 163, 184, 0.3)" : "rgba(15, 23, 42, 0.2)");
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-60, labelY - 14, 120, 26, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isCurrent ? "#ffffff" : (isDark ? "#f8fafc" : "#0f172a");
    ctx.font = '700 11px "Space Grotesk", sans-serif';
    ctx.fillText(st.title.split(" · ")[1] || st.title, 0, labelY);

    ctx.restore();
  }

  // Dibujar a Stefani
  function drawCharacter(p, groundY, isDark) {
    ctx.save();
    ctx.translate(p.x, p.y + p.h);

    // Sombra dinámica
    const shadowAlpha = isDark ? 0.45 : 0.25;
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Orientación
    ctx.scale(p.facing, 1);

    const legSwing = Math.sin(p.walkFrame) * 8;

    // Piernas
    ctx.strokeStyle = isDark ? "#38bdf8" : "#0284c7";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-6, -26);
    ctx.lineTo(-7 + legSwing, -2);
    ctx.moveTo(6, -26);
    ctx.lineTo(7 - legSwing, -2);
    ctx.stroke();

    // Torso / Chaqueta técnica de Stefani
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.roundRect(-14, -54, 28, 30, 8);
    ctx.fill();

    // Detalles del torso
    ctx.fillStyle = "#059669";
    ctx.fillRect(-2, -54, 4, 30);

    // Brazos
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-12, -48);
    ctx.lineTo(-18 - legSwing * 0.5, -30);
    ctx.moveTo(12, -48);
    ctx.lineTo(18 + legSwing * 0.5, -30);
    ctx.stroke();

    // Cabeza
    ctx.fillStyle = "#fde68a";
    ctx.beginPath();
    ctx.arc(0, -64, 12, 0, Math.PI * 2);
    ctx.fill();

    // Cabello / Gorra dev
    ctx.fillStyle = isDark ? "#0f172a" : "#1e293b";
    ctx.beginPath();
    ctx.arc(0, -68, 12, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-10, -70, 20, 4);

    // Indicador sutil de jugadora activa
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(0, -84 + Math.sin(performance.now() * 0.006) * 3, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ------------------------------------------------------------------------
  // 9. BUCLE PRINCIPAL
  // ------------------------------------------------------------------------
  function loop(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ------------------------------------------------------------------------
  // 10. MODAL DE RESUMEN EJECUTIVO (OVERVIEW) & TOAST
  // ------------------------------------------------------------------------
  function renderOverview() {
    omProjects.innerHTML = OVERVIEW_PROJECTS.map(p => `
      <div class="om-proj">
        <div class="om-proj-head">
          <strong>${p.title}</strong>
          <div class="om-proj-links">
            ${p.live ? `<a href="${p.live}" target="_blank" rel="noopener noreferrer">Demo Live ↗</a>` : ""}
            <a href="${p.gh}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          </div>
        </div>
        <p>${p.desc}</p>
        <div class="om-proj-tags">${p.tags.map(t => `<span>${t}</span>`).join("")}</div>
      </div>
    `).join("");

    omSkills.innerHTML = OVERVIEW_SKILLS.map(s => `
      <div class="om-skill">
        <span>${s.name}</span>
        <span>${s.level}</span>
      </div>
    `).join("");
  }
  renderOverview();

  function openOverview() {
    overviewModal.classList.add("is-open");
    overviewModal.setAttribute("aria-hidden", "false");
  }

  function closeOverview() {
    overviewModal.classList.remove("is-open");
    overviewModal.setAttribute("aria-hidden", "true");
  }

  openOverviewBtn.addEventListener("click", openOverview);
  introOverviewBtn.addEventListener("click", () => {
    introOverlay.classList.remove("is-active");
    openOverview();
  });
  omClose.addEventListener("click", closeOverview);
  omBackdrop.addEventListener("click", closeOverview);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeOverview();
  });

  // Inicio desde overlay
  startGameBtn.addEventListener("click", () => {
    initAudio();
    introOverlay.classList.remove("is-active");
    sfx.station();
  });

  // Copiar email
  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2500);
  }

  function copyEmailToClipboard() {
    const email = "steff.18random@gmail.com";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email).then(() => {
        showToast(`✓ Correo copiado: ${email}`);
      }).catch(() => {
        showToast(`Correo: ${email}`);
      });
    } else {
      showToast(`Correo: ${email}`);
    }
  }

  omCopyBtn.addEventListener("click", copyEmailToClipboard);

  // Inicialización de la primera estación
  updateStationUI(0);
})();
