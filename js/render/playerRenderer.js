/* ============================================================
   CAPA DE RENDERIZADO: PLAYER RENDERER (SUBWAY SURFERS 3D RUNNER)
   Vista trasera 3D auténtica: corredor avanzando hacia el horizonte,
   chaleco con estrella en la espalda, zancadas con suelas hacia la cámara,
   codos flexionados oscilando, coleta dinámica y postura de surf en hoverboard
   ============================================================ */

var lastStepSide = 0;

function drawPlayer() {
  var S = unit;
  var px = sx(P.x, 1);
  var py = groundY - P.y * S;
  var sk = getActiveOutfit();

  var isHoverboard = (pw.shield > 0);
  var air = P.y > (P.onTrain ? 1.92 : 0.05);
  var isSlide = (P.slide > 0);

  // 1. SOMBRA OVALADA 3D PROYECTADA EN EL PISO
  var shadowFloor = groundY - (P.onTrain ? 1.9 * S : 0);
  var heightAboveFloor = Math.max(0, P.y - (P.onTrain ? 1.9 : 0));
  var shadowScale = Math.max(0.3, 1.0 - heightAboveFloor * 0.35);
  ctx.fillStyle = 'rgba(10, 16, 22, 0.45)';
  ctx.beginPath();
  ctx.ellipse(px, shadowFloor, 0.36 * S * shadowScale, 0.09 * S * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  if (P.inv > 0 && pw.shield <= 0 && Math.floor(P.inv * 16) % 2 === 0) ctx.globalAlpha = 0.35;

  ctx.save();

  // Inclinación dinámica de banking en el centro de gravedad (caderas)
  var hipLevel = py - 0.52 * S;
  ctx.translate(px, hipLevel);
  var bankAngle = clamp((P.lane - P.x) * 0.35, -0.35, 0.35);
  ctx.rotate(bankAngle);
  ctx.translate(0, 0.52 * S);

  // 2. PATINETA HOVERBOARD (si está activa)
  if (isHoverboard) {
    var bData = BOARDS_DATA.find(function (b) { return b.id === activeBoardId; }) || BOARDS_DATA[0];
    ctx.save();
    var hFloat = Math.sin(time * 9) * 0.03 * S;
    ctx.translate(0, hFloat + 0.04 * S);

    ctx.fillStyle = bData.col || '#00d2b4';
    rr(-0.46 * S, -0.04 * S, 0.92 * S, 0.1 * S, 0.05 * S);
    ctx.fillStyle = bData.col2 || '#ff3b30';
    ctx.fillRect(-0.24 * S, -0.02 * S, 0.48 * S, 0.06 * S);
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(-0.38 * S, -0.01 * S, 0.09 * S, 0.04 * S);
    ctx.fillRect(0.29 * S, -0.01 * S, 0.09 * S, 0.04 * S);

    // Toberas y propulsión
    ctx.fillStyle = '#00f0d0';
    ctx.beginPath();
    ctx.arc(-0.28 * S, 0.07 * S, 0.04 * S, 0, Math.PI * 2);
    ctx.arc(0.28 * S, 0.07 * S, 0.04 * S, 0, Math.PI * 2);
    ctx.fill();

    if (state === 'play') {
      emit(px - 0.28 * S + (Math.random() - 0.5) * 10, py + 0.1 * S, 1, { s: 70, up: -10, g: 0, l: 0.25, r: 2.5, c: bData.col || '#00f0d0' });
      emit(px + 0.28 * S + (Math.random() - 0.5) * 10, py + 0.1 * S, 1, { s: 70, up: -10, g: 0, l: 0.25, r: 2.5, c: bData.col || '#00f0d0' });
    }
    ctx.restore();
  }

  // 3. FÍSICA CINEMÁTICA DE CARRERA HACIA EL HORIZONTE
  var runCadence = P.run * 18;
  var strideSin = Math.sin(runCadence);
  var strideCos = Math.cos(runCadence);

  // Emisión de polvo en cada zancada contra los rieles
  if (!air && !isHoverboard && !isSlide && state === 'play') {
    if (strideSin > 0.8 && lastStepSide !== 1) {
      lastStepSide = 1;
      emit(px - 0.15 * S, groundY - (P.onTrain ? 1.9 : 0) * S, 2, { s: 45, up: 15, g: 120, l: 0.2, r: 2.2, c: '#e2e8f0' });
    } else if (strideSin < -0.8 && lastStepSide !== -1) {
      lastStepSide = -1;
      emit(px + 0.15 * S, groundY - (P.onTrain ? 1.9 : 0) * S, 2, { s: 45, up: 15, g: 120, l: 0.2, r: 2.2, c: '#e2e8f0' });
    }
  }

  // Rebote rítmico del cuerpo en carrera (Bobbing de velocista)
  var runBob = (air || isHoverboard || isSlide) ? 0 : Math.abs(strideSin) * 0.06 * S;
  ctx.translate(0, -runBob);

  // Inclinación hacia adelante
  var runLean = (air || isHoverboard) ? 0 : -0.07;
  ctx.rotate(runLean);

  // Balanceo de cadera de lado a lado
  var hipSway = (air || isHoverboard) ? 0 : strideCos * 0.025 * S;
  ctx.translate(hipSway, 0);

  // 4. PIERNAS Y ZAPATILLAS VISTAS DESDE ATRÁS
  var pantsCol = sk.pants || (sk.star ? '#854d0e' : '#1e293b');
  var isSneakers = pw.sneakers > 0;
  var shoeCol = isSneakers ? '#ff9100' : (sk.s || '#dc2626');
  var shoeScale = isSneakers ? 1.35 : 1.0;
  var hipY = -0.48 * S;

  if (isSlide) {
    // DESLIZAMIENTO BAJO TIPO BÉISBOL / ROLL
    ctx.translate(0, 0.24 * S);
    ctx.scale(1.1, 0.58);
    ctx.fillStyle = pantsCol;
    rr(-0.2 * S, -0.32 * S, 0.4 * S, 0.32 * S, 0.05 * S);
    ctx.fillStyle = shoeCol;
    rr(-0.24 * S, -0.08 * S, 0.2 * S, 0.12 * S, 0.03 * S);
    rr(0.04 * S, -0.08 * S, 0.2 * S, 0.12 * S, 0.03 * S);
    if (state === 'play') {
      emit(px + (Math.random() - 0.5) * 20, groundY - (P.onTrain ? 1.9 : 0) * S, 2, { s: 80, up: 20, g: 150, l: 0.3, r: 2.4, c: '#ffd23f' });
    }
  } else if (isHoverboard) {
    // POSTURA DE SURF EN PATINETA (Vista trasera de skater con rodillas flexionadas)
    ctx.fillStyle = pantsCol;
    rr(-0.26 * S, hipY, 0.16 * S, 0.44 * S, 0.04 * S);
    rr(0.1 * S, hipY + 0.02 * S, 0.16 * S, 0.42 * S, 0.04 * S);

    [-0.2 * S, 0.18 * S].forEach(function (shoeX) {
      ctx.save();
      ctx.translate(shoeX, -0.04 * S);
      ctx.fillStyle = shoeCol;
      rr(-0.09 * S, -0.08 * S, 0.18 * S, 0.1 * S, 0.03 * S);
      ctx.fillStyle = '#ffffff';
      rr(-0.09 * S, 0, 0.18 * S, 0.03 * S, 0.01 * S);
      ctx.restore();
    });
  } else if (air) {
    // SALTO EN EL AIRE (Rodillas flexionadas y talones elevados)
    ctx.fillStyle = pantsCol;
    rr(-0.22 * S, hipY, 0.16 * S, 0.3 * S, 0.05 * S);
    rr(0.06 * S, hipY, 0.16 * S, 0.3 * S, 0.05 * S);

    [-0.14 * S, 0.14 * S].forEach(function (shoeX) {
      ctx.save();
      ctx.translate(shoeX, hipY + 0.3 * S);
      // Suelas visibles hacia la cámara
      ctx.fillStyle = '#ffffff';
      rr(-0.09 * S, -0.1 * S, 0.18 * S, 0.12 * S, 0.04 * S);
      ctx.fillStyle = shoeCol;
      rr(-0.08 * S, -0.12 * S, 0.16 * S, 0.04 * S, 0.02 * S);
      ctx.restore();
    });
  } else {
    // ========================================================
    // CARRERA REALISTA HACIA ADELANTE (VISTA DESDE ATRÁS)
    // Cuando el talón patea hacia atrás, la suela se levanta
    // hacia la cámara en perspectiva 3D!
    // ========================================================
    var kickL = Math.max(0, -strideSin); // Pierna izquierda pateando atrás
    var kickR = Math.max(0, strideSin);  // Pierna derecha pateando atrás

    // PIERNA IZQUIERDA
    ctx.save();
    var legLX = -0.12 * S;
    var legLY = hipY + (kickL * 0.16 * S);
    ctx.translate(legLX, legLY);

    ctx.fillStyle = pantsCol;
    var legLH = (0.48 * S) - (kickL * 0.22 * S);
    rr(-0.08 * S, 0, 0.16 * S, legLH, 0.04 * S);

    ctx.save();
    ctx.translate(0, legLH);
    ctx.scale(shoeScale, shoeScale);
    if (kickL > 0.25) {
      // Suela blanca levantada hacia la cámara con talón visible
      ctx.fillStyle = '#ffffff';
      rr(-0.09 * S, -0.12 * S, 0.18 * S, 0.14 * S, 0.04 * S);
      ctx.fillStyle = shoeCol;
      rr(-0.08 * S, -0.14 * S, 0.16 * S, 0.04 * S, 0.02 * S);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-0.06 * S, -0.08 * S, 0.12 * S, 0.02 * S);
      ctx.fillRect(-0.06 * S, -0.04 * S, 0.12 * S, 0.02 * S);
    } else {
      ctx.fillStyle = shoeCol;
      rr(-0.09 * S, -0.1 * S, 0.18 * S, 0.1 * S, 0.03 * S);
      ctx.fillStyle = '#ffffff';
      rr(-0.1 * S, -0.02 * S, 0.2 * S, 0.035 * S, 0.015 * S);
    }
    ctx.restore();
    ctx.restore();

    // PIERNA DERECHA
    ctx.save();
    var legRX = 0.12 * S;
    var legRY = hipY + (kickR * 0.16 * S);
    ctx.translate(legRX, legRY);

    ctx.fillStyle = pantsCol;
    var legRH = (0.48 * S) - (kickR * 0.22 * S);
    rr(-0.08 * S, 0, 0.16 * S, legRH, 0.04 * S);

    ctx.save();
    ctx.translate(0, legRH);
    ctx.scale(shoeScale, shoeScale);
    if (kickR > 0.25) {
      ctx.fillStyle = '#ffffff';
      rr(-0.09 * S, -0.12 * S, 0.18 * S, 0.14 * S, 0.04 * S);
      ctx.fillStyle = shoeCol;
      rr(-0.08 * S, -0.14 * S, 0.16 * S, 0.04 * S, 0.02 * S);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-0.06 * S, -0.08 * S, 0.12 * S, 0.02 * S);
      ctx.fillRect(-0.06 * S, -0.05 * S, 0.12 * S, 0.02 * S);
    } else {
      ctx.fillStyle = shoeCol;
      rr(-0.09 * S, -0.1 * S, 0.18 * S, 0.1 * S, 0.03 * S);
      ctx.fillStyle = '#ffffff';
      rr(-0.1 * S, -0.02 * S, 0.2 * S, 0.035 * S, 0.015 * S);
    }
    ctx.restore();
    ctx.restore();
  }

  // 5. ESPALDA: SUDADERA ROJA Y CHALECO DENIM CON ESTRELLA (STAR OUTFIT)
  ctx.fillStyle = 'rgba(0,0,0,.15)';
  rr(-0.25 * S, -0.9 * S, 0.5 * S, 0.5 * S, 0.12 * S);
  ctx.fillStyle = sk.b || '#dc2626';
  rr(-0.24 * S, -0.89 * S, 0.48 * S, 0.48 * S, 0.11 * S);

  if (sk.star) {
    // CHALECO DENIM AZUL VISTO DESDE LA ESPALDA
    ctx.fillStyle = '#2563eb';
    rr(-0.21 * S, -0.88 * S, 0.42 * S, 0.44 * S, 0.08 * S);

    // Canesú y costuras vaqueras de la espalda
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(-0.21 * S, -0.88 * S, 0.42 * S, 0.1 * S);

    // GRAN ESTRELLA DORADA EN LA ESPALDA (Auténtico Jake Star Outfit)
    ctx.fillStyle = '#facc15';
    ctx.font = '800 ' + Math.max(16, 0.22 * S) + 'px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('★', 0, -0.66 * S);
  } else {
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    rr(-0.18 * S, -0.7 * S, 0.36 * S, 0.22 * S, 0.06 * S);
  }

  // 6. MOCHILA EN LA ESPALDA (O JETPACK)
  if (pw.jetpack > 0) {
    ctx.fillStyle = '#7928ca';
    rr(-0.28 * S, -0.92 * S, 0.56 * S, 0.46 * S, 0.08 * S);
    ctx.fillStyle = '#e2e8f0';
    rr(-0.25 * S, -0.54 * S, 0.16 * S, 0.18 * S, 0.04 * S);
    rr(0.09 * S, -0.54 * S, 0.16 * S, 0.18 * S, 0.04 * S);
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(-0.17 * S, -0.34 * S, 0.08 * S, 0, Math.PI * 2);
    ctx.arc(0.17 * S, -0.34 * S, 0.08 * S, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. BRAZOS DE VELOCISTA BOMBANDO (Codos flexionados)
  var shoulderY = -0.84 * S;
  var armSwingL = isHoverboard ? 0.35 : (air ? -0.4 : -strideSin * 0.6);
  var armSwingR = isHoverboard ? -0.35 : (air ? 0.4 : strideSin * 0.6);

  // Brazo izquierdo con flexión de codo
  ctx.save();
  ctx.translate(-0.26 * S, shoulderY);
  ctx.rotate(armSwingL);
  ctx.fillStyle = sk.b || '#dc2626';
  rr(-0.07 * S, 0, 0.14 * S, 0.22 * S, 0.05 * S);
  ctx.translate(0, 0.2 * S);
  ctx.rotate(0.4);
  rr(-0.06 * S, 0, 0.12 * S, 0.18 * S, 0.04 * S);
  ctx.fillStyle = '#f5cb9b';
  ctx.beginPath(); ctx.arc(0, 0.18 * S, 0.055 * S, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Brazo derecho con flexión de codo
  ctx.save();
  ctx.translate(0.26 * S, shoulderY);
  ctx.rotate(armSwingR);
  ctx.fillStyle = sk.b || '#dc2626';
  rr(-0.07 * S, 0, 0.14 * S, 0.22 * S, 0.05 * S);
  ctx.translate(0, 0.2 * S);
  ctx.rotate(-0.4);
  rr(-0.06 * S, 0, 0.12 * S, 0.18 * S, 0.04 * S);
  ctx.fillStyle = '#f5cb9b';
  ctx.beginPath(); ctx.arc(0, 0.18 * S, 0.055 * S, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // 8. CUELLO Y PARTE TRASERA DE LA CAPUCHA
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.beginPath();
  ctx.arc(0, -0.86 * S, 0.14 * S, 0, Math.PI * 2);
  ctx.fill();

  // 9. CABEZA VISTA DESDE ATRÁS (Pelo y nuca)
  var skinGrad = ctx.createRadialGradient(0, -1.0 * S, 0.02 * S, 0, -1.0 * S, 0.22 * S);
  skinGrad.addColorStop(0, '#f5cb9b');
  skinGrad.addColorStop(1, '#d97706');
  ctx.fillStyle = skinGrad;
  ctx.beginPath();
  ctx.arc(0, -1.0 * S, 0.22 * S, 0, Math.PI * 2);
  ctx.fill();

  // Cabello trasero cubriendo la nuca
  ctx.fillStyle = sk.hair || '#2c1810';
  ctx.beginPath();
  ctx.arc(0, -1.02 * S, 0.21 * S, 0, Math.PI * 2);
  ctx.fill();

  // COLETA DINÁMICA OSCILANTE AL CORRER
  var ponySway = Math.sin(runCadence * 1.1) * 0.08 * S;
  ctx.fillStyle = sk.hair || '#2c1810';
  ctx.beginPath();
  ctx.moveTo(-0.06 * S, -0.96 * S);
  ctx.quadraticCurveTo(-0.24 * S + ponySway, -0.92 * S, -0.22 * S + ponySway, -0.74 * S);
  ctx.quadraticCurveTo(-0.12 * S + ponySway, -0.82 * S, 0.02 * S, -0.92 * S);
  ctx.closePath();
  ctx.fill();

  // Coletero
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(-0.03 * S, -0.95 * S, 0.03 * S, 0, Math.PI * 2);
  ctx.fill();

  // 10. AURICULARES DE DJ AMARILLOS (Rodeando la nuca desde atrás)
  if (sk.headphones || sk.star) {
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = Math.max(3, 0.04 * S);
    ctx.beginPath();
    ctx.arc(0, -1.02 * S, 0.24 * S, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    rr(-0.26 * S, -1.04 * S, 0.08 * S, 0.14 * S, 0.04 * S);
    rr(0.18 * S, -1.04 * S, 0.08 * S, 0.14 * S, 0.04 * S);
  }

  // 11. GORRA HACIA ATRÁS (Signature Backwards Cap vista desde atrás)
  ctx.fillStyle = sk.h || '#facc15';
  rr(-0.22 * S, -1.18 * S, 0.44 * S, 0.2 * S, 0.09 * S);

  // Visera plana que apunta hacia la cámara
  ctx.fillStyle = sk.star ? '#16a34a' : (sk.h || '#00d2b4');
  rr(-0.28 * S, -1.06 * S, 0.56 * S, 0.06 * S, 0.03 * S);
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  ctx.fillRect(-0.26 * S, -1.04 * S, 0.52 * S, 0.02 * S);

  // Cierre trasero de la gorra (hebilla snapback)
  ctx.fillStyle = '#0f172a';
  rr(-0.08 * S, -1.14 * S, 0.16 * S, 0.06 * S, 0.02 * S);
  ctx.fillStyle = '#ffffff';
  for (var snap = -0.06; snap <= 0.06; snap += 0.03) {
    ctx.beginPath(); ctx.arc(snap * S, -1.11 * S, 0.008 * S, 0, Math.PI * 2); ctx.fill();
  }

  // Botón superior de la gorra
  ctx.fillStyle = sk.star ? '#16a34a' : '#ffd23f';
  ctx.beginPath();
  ctx.arc(0, -1.19 * S, 0.032 * S, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  ctx.globalAlpha = 1;

  // Auras activas de power-ups
  if (pw.shield > 0) {
    var cyy = groundY - (P.y + 0.55) * S;
    ctx.strokeStyle = 'rgba(0,210,180,' + (0.55 + 0.25 * Math.sin(time * 8)) + ')';
    ctx.lineWidth = Math.max(2, S * 0.04);
    ctx.fillStyle = 'rgba(0,210,180,.12)';
    ctx.beginPath(); ctx.arc(px, cyy, S * 0.74, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  if (pw.magnet > 0) {
    ctx.strokeStyle = 'rgba(255,107,74,' + (0.35 + 0.35 * Math.sin(time * 10)) + ')';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(px, groundY - (P.y + 0.55) * S, S * (0.8 + 0.18 * ((time * 2) % 1)), 0, Math.PI * 2); ctx.stroke();
  }
}
