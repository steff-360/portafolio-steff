// ==========================================================================
// STEFANI'S QUEST: THE CODE ADVENTURE (VIDEOJUEGO DE ROL PORTAFOLIO)
// Desarrollado con HTML5 Canvas y Web Audio API nativo
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // ------------------------------------------------------------------------
  // 1. SISTEMA DE AUDIO NATIVO CHIPTUNE & SFX (WEB AUDIO API)
  // ------------------------------------------------------------------------
  let audioCtx = null;
  let sfxEnabled = localStorage.getItem("stefaniQuestSfx") === "true";
  let bgmInterval = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function play8bit(freq, type = "square", duration = 0.08, vol = 0.08) {
    if (!sfxEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }

  function playBlip() {
    play8bit(400 + Math.random() * 120, "triangle", 0.04, 0.04);
  }

  function playChime() {
    if (!sfxEnabled) return;
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => play8bit(f, "sine", 0.12, 0.08), i * 60);
    });
  }

  function playFanfare() {
    if (!sfxEnabled) return;
    [440, 554, 659, 880, 1108].forEach((f, i) => {
      setTimeout(() => play8bit(f, "square", 0.2, 0.1), i * 90);
    });
  }

  // Música chiptune ambiental procedural suave (8-bit arpeggios)
  function startBgm() {
    stopBgm();
    if (!sfxEnabled) return;
    initAudio();
    const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 392.00, 329.63, 293.66];
    let noteIdx = 0;
    bgmInterval = setInterval(() => {
      if (!sfxEnabled) { stopBgm(); return; }
      play8bit(notes[noteIdx], "triangle", 0.15, 0.025);
      noteIdx = (noteIdx + 1) % notes.length;
    }, 280);
  }

  function stopBgm() {
    if (bgmInterval) {
      clearInterval(bgmInterval);
      bgmInterval = null;
    }
  }

  const audioBtn = document.querySelector("#audio-toggle-btn");
  const audioIcon = document.querySelector("#audio-icon");

  function updateAudioUI() {
    if (audioIcon) audioIcon.textContent = sfxEnabled ? "🔊" : "🔇";
    localStorage.setItem("stefaniQuestSfx", String(sfxEnabled));
    if (sfxEnabled) startBgm();
    else stopBgm();
  }
  updateAudioUI();

  if (audioBtn) {
    audioBtn.addEventListener("click", () => {
      sfxEnabled = !sfxEnabled;
      updateAudioUI();
      if (sfxEnabled) {
        playChime();
        showToast("🔊 Audio Chiptune y efectos activados");
      } else {
        showToast("🔇 Audio silenciado");
      }
    });
  }

  // Toast flotante
  const toast = document.querySelector("#game-toast");
  let toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  // ------------------------------------------------------------------------
  // 2. MODAL DE AYUDA Y VISTA RÁPIDA / DIARIO DE MISIONES (CV)
  // ------------------------------------------------------------------------
  const viewToggleBtn = document.querySelector("#view-toggle-btn");
  const questLogDrawer = document.querySelector("#quest-log");
  const questCloseBtn = document.querySelector("#quest-close");
  const btnQuickCv = document.querySelector("#btn-quick-cv");
  const helpBtn = document.querySelector("#help-btn");
  const helpModal = document.querySelector("#help-modal");
  const helpClose = document.querySelector("#help-close");

  function openQuestLog() {
    if (questLogDrawer) {
      questLogDrawer.classList.add("is-open");
      questLogDrawer.setAttribute("aria-hidden", "false");
      playChime();
    }
  }

  function closeQuestLog() {
    if (questLogDrawer) {
      questLogDrawer.classList.remove("is-open");
      questLogDrawer.setAttribute("aria-hidden", "true");
    }
  }

  if (viewToggleBtn) viewToggleBtn.addEventListener("click", openQuestLog);
  if (btnQuickCv) btnQuickCv.addEventListener("click", openQuestLog);
  if (questCloseBtn) questCloseBtn.addEventListener("click", closeQuestLog);

  if (helpBtn) helpBtn.addEventListener("click", () => {
    if (helpModal) {
      helpModal.classList.add("is-open");
      helpModal.setAttribute("aria-hidden", "false");
      playChime();
    }
  });

  if (helpClose) helpClose.addEventListener("click", () => {
    if (helpModal) {
      helpModal.classList.remove("is-open");
      helpModal.setAttribute("aria-hidden", "true");
    }
  });

  // Copiar correo en el diario de misiones
  const btnCopyEmailCv = document.querySelector("#btn-copy-email-cv");
  if (btnCopyEmailCv) {
    btnCopyEmailCv.addEventListener("click", () => {
      navigator.clipboard.writeText("steff.18random@gmail.com").then(() => {
        playChime();
        showToast("✓ Correo copiado: steff.18random@gmail.com");
      });
    });
  }

  // ------------------------------------------------------------------------
  // 3. START GAME & PANTALLA DE TÍTULO
  // ------------------------------------------------------------------------
  const titleScreen = document.querySelector("#title-screen");
  const btnStartGame = document.querySelector("#btn-start-game");
  let gameStarted = false;

  function startGame() {
    gameStarted = true;
    if (titleScreen) titleScreen.classList.add("is-hidden");
    initAudio();
    if (sfxEnabled) startBgm();
    playFanfare();
    showToast("⚔️ ¡Aventura iniciada! Explora las 5 zonas");
  }

  if (btnStartGame) btnStartGame.addEventListener("click", startGame);

  // ------------------------------------------------------------------------
  // 4. MOTOR DE JUEGO 2D (CANVAS RPG)
  // ------------------------------------------------------------------------
  const canvas = document.querySelector("#rpg-canvas");
  const ctx = canvas.getContext("2d");

  const WORLD_WIDTH = 1280;
  const WORLD_HEIGHT = 720;
  canvas.width = WORLD_WIDTH;
  canvas.height = WORLD_HEIGHT;

  // Estado del jugador (Stefani)
  const player = {
    x: 640,
    y: 420,
    targetX: 640,
    targetY: 420,
    size: 40,
    speed: 4.8,
    direction: "down", // 'down', 'up', 'left', 'right'
    isMoving: false,
    animFrame: 0,
    animTimer: 0
  };

  // 5 Estaciones Interactivas del Mundo
  const stations = [
    {
      id: "academia",
      title: "ORIGEN: LA ACADEMIA PEDAGÓGICA",
      subtitle: "Pedagogía + Programación",
      icon: "🏛️",
      x: 280,
      y: 220,
      width: 140,
      height: 100,
      color: "#38bdf8",
      accent: "#0284c7",
      dialogue: `
        <h4>🏛️ Misión 1: El Origen Pedagógico</h4>
        <p>¡Bienvenida viajera! Mi camino inició en la <strong>Pedagogía</strong>, donde descubrí que enseñar y programar comparten la misma esencia: <em>descomponer problemas complejos en pasos claros y significativos</em>.</p>
        <p>Hoy aplico esa empatía didáctica para crear interfaces intuitivas, código limpio y experiencias interactivas que realmente conectan con los usuarios.</p>
      `,
      actions: [
        { label: "📜 Ver Historia en Diario", type: "cv" },
        { label: "Continuar Explorando ↗", type: "close" }
      ]
    },
    {
      id: "forja",
      title: "LA FORJA DE CÓDIGO (INVENTARIO)",
      subtitle: "Arsenal Tecnológico & Stats",
      icon: "⚡",
      x: 1000,
      y: 220,
      width: 140,
      height: 100,
      color: "#fbbf24",
      accent: "#d97706",
      dialogue: `
        <h4>⚡ Arsenal de Habilidades & Equipamiento</h4>
        <p>Aquí forjo arquitecturas con tecnologías de alto rendimiento:</p>
        <p>
          ⚔️ <strong>Node.js & Express:</strong> +95 Backend Power<br>
          🛡️ <strong>PostgreSQL & SQL:</strong> +90 Persistencia Relacional<br>
          📜 <strong>JavaScript & TypeScript:</strong> +92 Lógica & Tipado<br>
          🐳 <strong>Docker & Compose:</strong> +85 Aprovisionamiento Seguro<br>
          🎯 <strong>Jest:</strong> +88 Pruebas Automatizadas
        </p>
      `,
      actions: [
        { label: "📜 Abrir Inventario Completo", type: "cv" },
        { label: "Cerrar Forja", type: "close" }
      ]
    },
    {
      id: "misiones",
      title: "SALÓN DE MISIONES (PROYECTOS)",
      subtitle: "Proyectos Destacados & Dungeons",
      icon: "🏰",
      x: 640,
      y: 160,
      width: 160,
      height: 110,
      color: "#f43f5e",
      accent: "#e11d48",
      dialogue: `
        <h4>🏰 Misión Principal: Escape Room Educativo</h4>
        <p>Videojuego web interactivo full stack con retos de programación en tiempo real, roles administrativos y base de datos PostgreSQL.</p>
        <p>Otros proyectos en la bitácora: <em>API de Gestión de Postulaciones (Jest)</em>, <em>TechZone SQL</em>, <em>Algodones Maravilla</em> y <em>CampusLands CLI</em>.</p>
      `,
      actions: [
        { label: "🎮 JUGAR ESCAPE ROOM EN VIVO ↗", type: "link", url: "https://steff-360.github.io/escape-room-programacion/" },
        { label: "💻 Ver Código en GitHub ↗", type: "link", url: "https://github.com/steff-360/escape-room-programacion" },
        { label: "📜 Ver Todos los Proyectos", type: "cv" }
      ]
    },
    {
      id: "arcade",
      title: "SALA ARCADE (RETO DE REFLEJOS)",
      subtitle: "Pausa Creativa de 15 Segundos",
      icon: "🕹️",
      x: 280,
      y: 540,
      width: 140,
      height: 100,
      color: "#a855f7",
      accent: "#9333ea",
      dialogue: `
        <h4>🕹️ Máquina Arcade: Reto de 15 Segundos</h4>
        <p>¿Tienes reflejos rápidos de programador? Presiona el botón para entrar a la cabina arcade y superar tu récord personal.</p>
      `,
      actions: [
        { label: "🕹️ INSERT COIN / ABRIR ARCADE", type: "arcade" },
        { label: "Más tarde", type: "close" }
      ]
    },
    {
      id: "enlace",
      title: "TORRE DE ENLACE (CONTACTO)",
      subtitle: "Alianzas & Contratación",
      icon: "📡",
      x: 1000,
      y: 540,
      width: 140,
      height: 100,
      color: "#34d399",
      accent: "#059669",
      dialogue: `
        <h4>📡 Torre de Comunicación Interplanetaria</h4>
        <p>¡Has llegado al punto de enlace! Estoy lista para unirme a equipos que valoren la innovación, los productos educativos y la arquitectura sólida.</p>
        <p>📧 <strong>steff.18random@gmail.com</strong></p>
      `,
      actions: [
        { label: "📋 Copiar Correo", type: "copy-email" },
        { label: "🔗 Abrir LinkedIn ↗", type: "link", url: "https://www.linkedin.com/in/stefani-s%C3%A1nchez-b35b65279" },
        { label: "💻 Ver GitHub ↗", type: "link", url: "https://github.com/steff-360" }
      ]
    }
  ];

  // Partículas mágicas flotantes en el mapa
  const worldParticles = [];
  for (let i = 0; i < 40; i++) {
    worldParticles.push({
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * WORLD_HEIGHT,
      size: Math.random() * 2 + 1,
      speedY: -(Math.random() * 0.4 + 0.2),
      alpha: Math.random() * 0.6 + 0.2
    });
  }

  // Teclado
  const keys = {};
  window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === " " || e.key === "Enter") {
      checkInteraction();
    }
    if (e.key === "Escape") {
      closeDialogue();
      closeArcadeModal();
      closeQuestLog();
    }
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  // Movimiento por clic o toque en el canvas
  canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = WORLD_WIDTH / rect.width;
    const scaleY = WORLD_HEIGHT / rect.height;
    player.targetX = (e.clientX - rect.left) * scaleX;
    player.targetY = (e.clientY - rect.top) * scaleY;
  });

  // Controles D-pad táctiles
  const btnUp = document.querySelector("#btn-up");
  const btnDown = document.querySelector("#btn-down");
  const btnLeft = document.querySelector("#btn-left");
  const btnRight = document.querySelector("#btn-right");
  const btnInteract = document.querySelector("#btn-interact");

  function bindTouchBtn(btn, key) {
    if (!btn) return;
    btn.addEventListener("pointerdown", (e) => { e.preventDefault(); keys[key] = true; });
    btn.addEventListener("pointerup", (e) => { e.preventDefault(); keys[key] = false; });
    btn.addEventListener("pointerleave", (e) => { e.preventDefault(); keys[key] = false; });
  }
  bindTouchBtn(btnUp, "arrowup");
  bindTouchBtn(btnDown, "arrowdown");
  bindTouchBtn(btnLeft, "arrowleft");
  bindTouchBtn(btnRight, "arrowright");
  if (btnInteract) btnInteract.addEventListener("click", checkInteraction);

  // Sistema de interacción y diálogo
  let nearbyStation = null;
  const zoneBanner = document.querySelector("#zone-banner");
  const zoneIcon = document.querySelector("#zone-icon");
  const zoneTitle = document.querySelector("#zone-title");
  const zoneDesc = document.querySelector("#zone-desc");
  const interactPrompt = document.querySelector("#interact-prompt");
  const dialogueBox = document.querySelector("#rpg-dialogue");
  const dialogueBody = document.querySelector("#dialogue-body");
  const dialogueActions = document.querySelector("#dialogue-actions");
  const dialogueClose = document.querySelector("#dialogue-close");

  function checkNearbyStations() {
    let currentNear = null;
    stations.forEach((st) => {
      const centerX = st.x + st.width / 2;
      const centerY = st.y + st.height / 2;
      const dist = Math.hypot(player.x - centerX, player.y - centerY);
      if (dist < 110) {
        currentNear = st;
      }
    });

    if (currentNear !== nearbyStation) {
      nearbyStation = currentNear;
      if (nearbyStation) {
        zoneIcon.textContent = nearbyStation.icon;
        zoneTitle.textContent = nearbyStation.title;
        zoneDesc.textContent = nearbyStation.subtitle;
        zoneBanner.classList.add("is-visible");
        interactPrompt.classList.add("is-visible");
        playBlip();
      } else {
        zoneBanner.classList.remove("is-visible");
        interactPrompt.classList.remove("is-visible");
      }
    }
  }

  function checkInteraction() {
    if (nearbyStation) {
      openDialogue(nearbyStation);
    }
  }

  function openDialogue(station) {
    if (!dialogueBox) return;
    playChime();
    dialogueBox.classList.add("is-open");
    dialogueBox.setAttribute("aria-hidden", "false");

    // Escribir texto con efecto typewriter suave
    dialogueBody.innerHTML = station.dialogue;

    // Renderizar botones de acción
    dialogueActions.innerHTML = "";
    station.actions.forEach((act) => {
      const btn = document.createElement("button");
      btn.className = `dialogue-btn ${act.type === "link" || act.type === "arcade" ? "btn-primary-action" : "btn-secondary-action"}`;
      btn.textContent = act.label;

      btn.addEventListener("click", () => {
        if (act.type === "link" && act.url) {
          window.open(act.url, "_blank");
        } else if (act.type === "cv") {
          closeDialogue();
          openQuestLog();
        } else if (act.type === "arcade") {
          closeDialogue();
          openArcadeModal();
        } else if (act.type === "copy-email") {
          navigator.clipboard.writeText("steff.18random@gmail.com").then(() => {
            playFanfare();
            showToast("✓ Correo copiado: steff.18random@gmail.com");
          });
        } else if (act.type === "close") {
          closeDialogue();
        }
      });
      dialogueActions.appendChild(btn);
    });
  }

  function closeDialogue() {
    if (dialogueBox) {
      dialogueBox.classList.remove("is-open");
      dialogueBox.setAttribute("aria-hidden", "true");
    }
  }
  if (dialogueClose) dialogueClose.addEventListener("click", closeDialogue);

  // ------------------------------------------------------------------------
  // 5. MINIJUEGO ARCADE INCORPORADO EN LA SALA ARCADE
  // ------------------------------------------------------------------------
  const arcadeModal = document.querySelector("#arcade-modal");
  const arcadeClose = document.querySelector("#arcade-close");
  const arcadeStartBtn = document.querySelector("#arcade-start-btn");
  const arcadeBtns = document.querySelectorAll(".arcade-btn");
  const arcadeScore = document.querySelector("#arcade-score");
  const arcadeTime = document.querySelector("#arcade-time");
  const arcadeBest = document.querySelector("#arcade-best");
  const arcadeCombo = document.querySelector("#arcade-combo");
  const arcadeMsg = document.querySelector("#arcade-msg");

  let arcadeTimer = null;
  let arcadeTargetTimer = null;
  let arcadeSeconds = 15;
  let aScore = 0;
  let aCombo = 0;
  let aTargetIdx = -1;
  let arcadeActive = false;

  function openArcadeModal() {
    if (arcadeModal) {
      arcadeModal.classList.add("is-open");
      arcadeModal.setAttribute("aria-hidden", "false");
      playChime();
    }
  }

  function closeArcadeModal() {
    if (arcadeModal) {
      arcadeModal.classList.remove("is-open");
      arcadeModal.setAttribute("aria-hidden", "true");
      clearInterval(arcadeTimer);
      clearInterval(arcadeTargetTimer);
      arcadeActive = false;
    }
  }
  if (arcadeClose) arcadeClose.addEventListener("click", closeArcadeModal);

  function clearArcadeTarget() {
    arcadeBtns.forEach(b => b.classList.remove("is-target", "is-miss"));
  }

  function moveArcadeTarget() {
    clearArcadeTarget();
    const next = Math.floor(Math.random() * arcadeBtns.length);
    aTargetIdx = next === aTargetIdx ? (next + 1) % arcadeBtns.length : next;
    arcadeBtns[aTargetIdx].classList.add("is-target");
  }

  function finishArcade() {
    arcadeActive = false;
    clearInterval(arcadeTimer);
    clearInterval(arcadeTargetTimer);
    clearArcadeTarget();
    const prevBest = Number(localStorage.getItem("stefaniArcadeBest") || 0);
    const best = Math.max(prevBest, aScore);
    localStorage.setItem("stefaniArcadeBest", String(best));
    arcadeBest.textContent = String(best).padStart(2, "0");
    arcadeStartBtn.textContent = "INSERT COIN / JUGAR OTRA VEZ";

    if (aScore > prevBest && aScore > 0) {
      playFanfare();
      arcadeMsg.textContent = `★ ¡NUEVO RÉCORD: ${aScore} PUNTOS! ★`;
      showToast(`🏆 ¡Nuevo récord arcade: ${aScore} pts!`);
    } else {
      arcadeMsg.textContent = `Partida finalizada: ${aScore} pts`;
      play8bit(300, "sawtooth", 0.2, 0.1);
    }
  }

  function startArcade() {
    clearInterval(arcadeTimer);
    clearInterval(arcadeTargetTimer);
    arcadeActive = true;
    arcadeSeconds = 15;
    aScore = 0;
    aCombo = 0;
    arcadeScore.textContent = "00";
    arcadeTime.textContent = "15";
    arcadeCombo.textContent = "x1";
    arcadeMsg.textContent = "¡Acierta las estrellas!";
    arcadeStartBtn.textContent = "PARTIDA EN CURSO...";
    playChime();
    moveArcadeTarget();

    arcadeTargetTimer = setInterval(moveArcadeTarget, 740);
    arcadeTimer = setInterval(() => {
      arcadeSeconds--;
      arcadeTime.textContent = String(arcadeSeconds).padStart(2, "0");
      if (arcadeSeconds <= 0) finishArcade();
    }, 1000);
  }

  if (arcadeStartBtn) arcadeStartBtn.addEventListener("click", startArcade);

  arcadeBtns.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      if (!arcadeActive) return;
      if (idx === aTargetIdx) {
        aCombo++;
        aScore += aCombo >= 3 ? 2 : 1;
        arcadeScore.textContent = String(aScore).padStart(2, "0");
        arcadeCombo.textContent = `x${aCombo}`;
        play8bit(440 + aCombo * 50, "square", 0.1, 0.12);
        moveArcadeTarget();
      } else {
        aCombo = 0;
        arcadeCombo.textContent = "x1";
        btn.classList.add("is-miss");
        setTimeout(() => btn.classList.remove("is-miss"), 180);
        play8bit(160, "sawtooth", 0.15, 0.1);
      }
    });
  });
  if (arcadeBest) arcadeBest.textContent = String(Number(localStorage.getItem("stefaniArcadeBest") || 0)).padStart(2, "0");

  // ------------------------------------------------------------------------
  // 6. BUCLE PRINCIPAL DE DIBUJADO Y FÍSICAS (RENDER LOOP)
  // ------------------------------------------------------------------------
  function updatePlayer() {
    let dx = 0;
    let dy = 0;

    // Entrada de teclado
    if (keys["w"] || keys["arrowup"]) { dy -= 1; player.direction = "up"; }
    if (keys["s"] || keys["arrowdown"]) { dy += 1; player.direction = "down"; }
    if (keys["a"] || keys["arrowleft"]) { dx -= 1; player.direction = "left"; }
    if (keys["d"] || keys["arrowright"]) { dx += 1; player.direction = "right"; }

    if (dx !== 0 || dy !== 0) {
      player.targetX = player.x;
      player.targetY = player.y;
      const mag = Math.hypot(dx, dy);
      player.x += (dx / mag) * player.speed;
      player.y += (dy / mag) * player.speed;
      player.isMoving = true;
    } else {
      // Movimiento hacia clic / toque
      const toX = player.targetX - player.x;
      const toY = player.targetY - player.y;
      const dist = Math.hypot(toX, toY);

      if (dist > 4) {
        player.x += (toX / dist) * player.speed;
        player.y += (toY / dist) * player.speed;
        player.isMoving = true;

        if (Math.abs(toX) > Math.abs(toY)) {
          player.direction = toX > 0 ? "right" : "left";
        } else {
          player.direction = toY > 0 ? "down" : "up";
        }
      } else {
        player.isMoving = false;
      }
    }

    // Límites del mapa
    player.x = Math.max(40, Math.min(WORLD_WIDTH - 40, player.x));
    player.y = Math.max(60, Math.min(WORLD_HEIGHT - 60, player.y));

    // Animación de pasos
    if (player.isMoving) {
      player.animTimer++;
      if (player.animTimer > 8) {
        player.animFrame = (player.animFrame + 1) % 4;
        player.animTimer = 0;
        if (player.animFrame % 2 === 0 && Math.random() < 0.25) playBlip();
      }
    } else {
      player.animFrame = 0;
    }

    checkNearbyStations();
  }

  function drawWorld() {
    // 1. Fondo oscuro con rejilla cibernética
    ctx.fillStyle = "#070b13";
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Rejilla retro suave
    ctx.strokeStyle = "rgba(30, 58, 95, 0.25)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < WORLD_WIDTH; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, WORLD_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < WORLD_HEIGHT; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WORLD_WIDTH, y);
      ctx.stroke();
    }

    // 2. Caminos luminosos entre estaciones
    ctx.strokeStyle = "rgba(56, 189, 248, 0.2)";
    ctx.lineWidth = 6;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(stations[0].x + 70, stations[0].y + 50);
    ctx.lineTo(stations[2].x + 80, stations[2].y + 55);
    ctx.lineTo(stations[1].x + 70, stations[1].y + 50);
    ctx.lineTo(stations[4].x + 70, stations[4].y + 50);
    ctx.lineTo(stations[3].x + 70, stations[3].y + 50);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Partículas flotantes
    worldParticles.forEach((p) => {
      p.y += p.speedY;
      if (p.y < 0) p.y = WORLD_HEIGHT;
      ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Dibujar las 5 Estaciones Temáticas
    stations.forEach((st) => {
      const isNear = nearbyStation === st;

      // Resplandor si está cerca
      if (isNear) {
        ctx.fillStyle = "rgba(251, 191, 36, 0.15)";
        ctx.beginPath();
        ctx.arc(st.x + st.width / 2, st.y + st.height / 2, 85, 0, Math.PI * 2);
        ctx.fill();
      }

      // Base del edificio / pedestal
      ctx.fillStyle = "#0c182a";
      ctx.strokeStyle = isNear ? "#fbbf24" : st.color;
      ctx.lineWidth = isNear ? 3 : 2;
      ctx.beginPath();
      ctx.roundRect(st.x, st.y, st.width, st.height, 10);
      ctx.fill();
      ctx.stroke();

      // Techo / cabecera
      ctx.fillStyle = st.accent;
      ctx.beginPath();
      ctx.roundRect(st.x, st.y, st.width, 24, [10, 10, 0, 0]);
      ctx.fill();

      // Icono de la estación
      ctx.font = "32px 'Segoe UI Emoji', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(st.icon, st.x + st.width / 2, st.y + 64);

      // Etiqueta de la estación
      ctx.font = "bold 10px 'IBM Plex Mono', monospace";
      ctx.fillStyle = isNear ? "#fbbf24" : "#ffffff";
      ctx.fillText(st.title.split(":")[0], st.x + st.width / 2, st.y + 90);

      // Icono flotante indicador si está cerca
      if (isNear) {
        ctx.font = "bold 14px 'Press Start 2P', monospace";
        ctx.fillStyle = "#fbbf24";
        const bob = Math.sin(Date.now() / 150) * 4;
        ctx.fillText("▼", st.x + st.width / 2, st.y - 10 + bob);
      }
    });

    // 5. Dibujar al Personaje (Stefani) en Pixel/Vector Style
    drawPlayer();
  }

  function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);

    const bob = player.isMoving ? (player.animFrame % 2 === 0 ? -2 : 2) : 0;

    // Sombra en el suelo
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.beginPath();
    ctx.ellipse(0, 18, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Piernas animadas
    ctx.fillStyle = "#1e293b";
    if (player.isMoving) {
      const legOffset = player.animFrame === 1 ? -4 : (player.animFrame === 3 ? 4 : 0);
      ctx.fillRect(-8 + legOffset, 8, 6, 10);
      ctx.fillRect(2 - legOffset, 8, 6, 10);
    } else {
      ctx.fillRect(-7, 8, 5, 10);
      ctx.fillRect(2, 8, 5, 10);
    }

    // Torso / Chaqueta de desarrolladora
    ctx.fillStyle = "#f43f5e"; // Chaqueta coral vibrante
    ctx.fillRect(-10, -6 + bob, 20, 15);

    // Cuello camisa
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-3, -6 + bob, 6, 6);

    // Mochila / Laptop backpack
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(-12, -4 + bob, 3, 10);

    // Cabeza / Rostro
    ctx.fillStyle = "#fcd34d"; // Tono piel pixel
    ctx.fillRect(-8, -20 + bob, 16, 14);

    // Cabello castaño oscuro con coleta
    ctx.fillStyle = "#3e2723";
    ctx.fillRect(-9, -24 + bob, 18, 7); // Parte superior
    ctx.fillRect(-10, -20 + bob, 3, 10); // Lado izquierdo
    ctx.fillRect(7, -20 + bob, 3, 10); // Lado derecho
    // Coleta hacia atrás
    ctx.fillRect(player.direction === "left" ? 6 : -9, -16 + bob, 4, 8);

    // Ojos según dirección
    ctx.fillStyle = "#0f172a";
    if (player.direction === "right") {
      ctx.fillRect(2, -15 + bob, 2, 3);
      ctx.fillRect(5, -15 + bob, 2, 3);
    } else if (player.direction === "left") {
      ctx.fillRect(-6, -15 + bob, 2, 3);
      ctx.fillRect(-3, -15 + bob, 2, 3);
    } else if (player.direction === "up") {
      // De espaldas (solo pelo)
      ctx.fillStyle = "#3e2723";
      ctx.fillRect(-8, -20 + bob, 16, 12);
    } else {
      // De frente
      ctx.fillRect(-4, -15 + bob, 2, 3);
      ctx.fillRect(2, -15 + bob, 2, 3);
    }

    // Etiqueta del nombre sobre el personaje
    ctx.font = "bold 9px 'Press Start 2P', monospace";
    ctx.fillStyle = "#fbbf24";
    ctx.textAlign = "center";
    ctx.fillText("STEFANI", 0, -30 + bob);

    ctx.restore();
  }

  function gameLoop() {
    updatePlayer();
    drawWorld();
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
});
