/* ============================================================
   CAPA DE RENDERIZADO: PLAYER RENDERER (SUBWAY SURFERS 3D ENGINE)
   Animación 3D realista de carrera hacia adelante (zancadas dinámicas,
   suelas en perspectiva, flexión de codos, balanceo atlético y Star Outfit)
   ============================================================ */

var lastStepPhase = 0;

function drawPlayer() {
  var S = unit;
  var px = sx(P.x, 1);
  var py = groundY - P.y * S;
  var sk = getActiveOutfit();

  var isHoverboard = (pw.shield > 0);
  var air = P.y > (P.onTrain ? 1.92 : 0.05);
  var isSlide = (P.slide > 0);

  // 1. SOMBRA 3D EN EL SUELO O TECHO DEL TREN
  var shadowFloor = groundY - (P.onTrain ? 1.9 * S : 0);
  var heightAboveFloor = Math.max(0, P.y - (P.onTrain ? 1.9 : 0));
  var shadowScale = Math.max(0.3, 1.0 - heightAboveFloor * 0.35);
  ctx.fillStyle = 'rgba(10, 16, 22, 0.45)';
  ctx.beginPath();
  ctx.ellipse(px, shadowFloor, 0.38 * S * shadowScale, 0.1 * S * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  if (P.inv > 0 && pw.shield <= 0 && Math.floor(P.inv * 16) % 2 === 0) ctx.globalAlpha = 0.35;

  ctx.save();

  // Inclinación dinámica en cambios de carril (Banking alrededor del centro de masa)
  var hipLevel = py - 0.52 * S;
  ctx.translate(px, hipLevel);
  var bankAngle = clamp((P.lane - P.x) * 0.36, -0.36, 0.36);
  ctx.rotate(bankAngle);
  ctx.translate(0, 0.52 * S);

  // 2. PATINETA HOVERBOARD (si está activa)
  if (isHoverboard) {
    var bData = BOARDS_DATA.find(function (b) { return b.id === activeBoardId; }) || BOARDS_DATA[0];
    ctx.save();
    var hFloat = Math.sin(time * 9) * 0.03 * S;
    ctx.translate(0, hFloat + 0.04 * S);

    // Tabla con propulsión
    ctx.fillStyle = bData.col || '#00d2b4';
    rr(-0.46 * S, -0.04 * S, 0.92 * S, 0.1 * S, 0.05 * S);
    ctx.fillStyle = bData.col2 || '#ff3b30';
    ctx.fillRect(-0.24 * S, -0.02 * S, 0.48 * S, 0.06 * S);
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(-0.38 * S, -0.01 * S, 0.09 * S, 0.04 * S);
    ctx.fillRect(0.29 * S, -0.01 * S, 0.09 * S, 0.04 * S);

    // Propulsores iónicos
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

  // 3. FÍSICA CINEMÁTICA DE CARRERA EN PERSPECTIVA 3D
  // El ciclo de carrera avanza continuamente con la velocidad del runner
  var runCadence = P.run * 18;
  var stepCycle = runCadence % (Math.PI * 2);
  var strideSin = Math.sin(runCadence);
  var strideCos = Math.cos(runCadence);

  // Sonido y partículas de pasos en el piso al correr
  if (!air && !isHoverboard && !isSlide && state === 'play') {
    if ((lastStepPhase < Math.PI && stepCycle >= Math.PI) || (lastStepPhase >= Math.PI && stepCycle < lastStepPhase)) {
      emit(px + (strideSin > 0 ? -0.15 : 0.15) * S, groundY - (P.onTrain ? 1.9 : 0) * S, 2, { s: 40, up: 15, g: 100, l: 0.2, r: 2, c: '#e2e8f0' });
    }
  }
  lastStepPhase = stepCycle;

  // Rebote rítmico del torso hacia arriba y abajo (Bobbing)
  var runBob = (air || isHoverboard || isSlide) ? 0 : Math.abs(strideSin) * 0.06 * S;
  ctx.translate(0, -runBob);

  // Inclinación hacia adelante del corredor de velocidad
  var runLean = (air || isHoverboard) ? 0 : -0.06;
  ctx.rotate(runLean);

  // Balanceo sutil de cadera de izquierda a derecha
  var hipSway = (air || isHoverboard) ? 0 : Math.sin(runCadence) * 0.03 * S;
  ctx.translate(hipSway, 0);

  // 4. ANIMACIÓN Y RENDERIZADO DE PIERNAS Y ZAPATILLAS
  var pantsCol = sk.pants || (sk.star ? '#854d0e' : '#1e293b');
  var isSneakers = pw.sneakers > 0;
  var shoeCol = isSneakers ? '#ff9100' : (sk.s || '#dc2626');
  var shoeScale = isSneakers ? 1.35 : 1.0;
  var hipY = -0.48 * S;

  if (isSlide) {
    // POSTURA DE SLIDE / DIVE (Deslizamiento bajo bajo las barreras)
    ctx.translate(0, 0.24 * S);
    ctx.scale(1.12, 0.58);
    // Piernas juntas estiradas al frente
    ctx.fillStyle = pantsCol;
    rr(-0.2 * S, -0.32 * S, 0.4 * S, 0.32 * S, 0.05 * S);
    // Zapatillas derrapando en el suelo
    ctx.fillStyle = shoeCol;
    rr(-0.24 * S, -0.08 * S, 0.2 * S, 0.12 * S, 0.03 * S);
    rr(0.04 * S, -0.08 * S, 0.2 * S, 0.12 * S, 0.03 * S);
    if (state === 'play') {
      emit(px + (Math.random() - 0.5) * 20, groundY - (P.onTrain ? 1.9 : 0) * S, 2, { s: 80, up: 20, g: 150, l: 0.3, r: 2.4, c: '#ffd23f' });
    }
  } else if (isHoverboard) {
    // POSTURA DE SURF EN PATINETA (Knees flexed, skater stance)
    ctx.fillStyle = pantsCol;
    // Pierna izquierda (adelantada en la tabla)
    rr(-0.26 * S, hipY, 0.16 * S, 0.44 * S, 0.04 * S);
    // Pierna derecha (apoyada atrás en la tabla)
    rr(0.1 * S, hipY + 0.02 * S, 0.16 * S, 0.42 * S, 0.04 * S);

    // Zapatillas firmes sobre la patineta
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
    // POSTURA EN EL AIRE / SALTO (Rodillas flexionadas hacia el pecho)
    ctx.fillStyle = pantsCol;
    rr(-0.22 * S, hipY, 0.16 * S, 0.32 * S, 0.05 * S);
    rr(0.06 * S, hipY, 0.16 * S, 0.32 * S, 0.05 * S);

    // Zapatillas recogidas en el aire
    [-0.14 * S, 0.14 * S].forEach(function (shoeX) {
      ctx.save();
      ctx.translate(shoeX, hipY + 0.32 * S);
      ctx.fillStyle = shoeCol;
      rr(-0.09 * S, -0.06 * S, 0.18 * S, 0.12 * S, 0.03 * S);
      ctx.fillStyle = '#ffffff';
      rr(-0.09 * S, 0.02 * S, 0.18 * S, 0.04 * S, 0.015 * S);
      ctx.restore();
    });
  } else {
    // ========================================================
    // CARRERA REALISTA HACIA ADELANTE EN PERSPECTIVA 3D
    // (Una pierna pisa adelante mientras la otra patea hacia atrás
    // mostrando la suela en perspectiva hacia la cámara)
    // ========================================================

    // PIERNA IZQUIERDA
    var leftKickBack = Math.max(0, -strideSin); // Cuando patea hacia atrás
    var leftStepFwd = Math.max(0, strideSin);   // Cuando pisa hacia adelante

    ctx.save();
    var legLX = -0.12 * S;
    // La pierna que patea atrás se eleva hacia la cámara
    var legLY = hipY + (leftKickBack * 0.18 * S);
    ctx.translate(legLX, legLY);

    // Muslo y pantorrilla en perspectiva
    ctx.fillStyle = pantsCol;
    var legLH = (0.48 * S) - (leftKickBack * 0.22 * S);
    rr(-0.08 * S, 0, 0.16 * S, legLH, 0.04 * S);

    // Dobladillo del pantalón
    ctx.fillStyle = sk.star ? '#713f12' : '#334155';
    ctx.fillRect(-0.08 * S, legLH - 0.04 * S, 0.16 * S, 0.04 * S);

    // ZAPATILLA IZQUIERDA (Muestra la suela al patear hacia atrás)
    ctx.save();
    ctx.translate(0, legLH);
    ctx.scale(shoeScale, shoeScale);
    if (leftKickBack > 0.3) {
      // Vista en perspectiva de la suela levantada hacia atrás
      ctx.fillStyle = '#ffffff'; // Suela blanca vista desde atrás
      rr(-0.09 * S, -0.12 * S, 0.18 * S, 0.14 * S, 0.04 * S);
      ctx.fillStyle = shoeCol;
      rr(-0.08 * S, -0.14 * S, 0.16 * S, 0.05 * S, 0.02 * S);
      // Dibujo de goma de la suela de skater
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-0.06 * S, -0.09 * S, 0.12 * S, 0.02 * S);
      ctx.fillRect(-0.06 * S, -0.05 * S, 0.12 * S, 0.02 * S);
    } else {
      // Vista en apoyo en el piso
      ctx.fillStyle = shoeCol;
      rr(-0.09 * S, -0.1 * S, 0.2 * S, 0.1 * S, 0.03 * S);
      ctx.fillStyle = '#ffffff';
      rr(-0.1 * S, -0.03 * S, 0.22 * S, 0.035 * S, 0.015 * S);
    }
    ctx.restore();
    ctx.restore();

    // PIERNA DERECHA (Fase contraria)
    var rightKickBack = Math.max(0, strideSin);
    var rightStepFwd = Math.max(0, -strideSin);

    ctx.save();
    var legRX = 0.12 * S;
    var legRY = hipY + (rightKickBack * 0.18 * S);
    ctx.translate(legRX, legRY);

    ctx.fillStyle = pantsCol;
    var legRH = (0.48 * S) - (rightKickBack * 0.22 * S);
    rr(-0.08 * S, 0, 0.16 * S, legRH, 0.04 * S);

    ctx.fillStyle = sk.star ? '#713f12' : '#334155';
    ctx.fillRect(-0.08 * S, legRH - 0.04 * S, 0.16 * S, 0.04 * S);

    // ZAPATILLA DERECHA
    ctx.save();
    ctx.translate(0, legRH);
    ctx.scale(shoeScale, shoeScale);
    if (rightKickBack > 0.3) {
      // Suela levantada hacia atrás
      ctx.fillStyle = '#ffffff';
      rr(-0.09 * S, -0.12 * S, 0.18 * S, 0.14 * S, 0.04 * S);
      ctx.fillStyle = shoeCol;
      rr(-0.08 * S, -0.14 * S, 0.16 * S, 0.05 * S, 0.02 * S);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-0.06 * S, -0.09 * S, 0.12 * S, 0.02 * S);
      ctx.fillRect(-0.06 * S, -0.05 * S, 0.12 * S, 0.02 * S);
    } else {
      ctx.fillStyle = shoeCol;
      rr(-0.09 * S, -0.1 * S, 0.2 * S, 0.1 * S, 0.03 * S);
      ctx.fillStyle = '#ffffff';
      rr(-0.1 * S, -0.03 * S, 0.22 * S, 0.035 * S, 0.015 * S);
    }
    ctx.restore();
    ctx.restore();
  }

  // 5. MOCHILA TÉCNICA O JETPACK
  if (pw.jetpack > 0) {
    ctx.fillStyle = '#7928ca';
    rr(-0.28 * S, -0.92 * S, 0.56 * S, 0.46 * S, 0.08 * S);
    ctx.fillStyle = '#e2e8f0';
    rr(-0.25 * S, -0.54 * S, 0.16 * S, 0.18 * S, 0.04 * S);
    rr(0.09 * S, -0.54 * S, 0.16 * S, 0.18 * S, 0.04 * S);
    ctx.fillStyle = '#c77dff';
    ctx.fillRect(-0.22 * S, -0.8 * S, 0.44 * S, 0.08 * S);
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(-0.17 * S, -0.34 * S, 0.08 * S, 0, Math.PI * 2);
    ctx.arc(0.17 * S, -0.34 * S, 0.08 * S, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#0b1319';
    rr(-0.22 * S, -0.88 * S, 0.44 * S, 0.4 * S, 0.08 * S);
    ctx.fillStyle = '#1e293b';
    rr(-0.17 * S, -0.78 * S, 0.34 * S, 0.24 * S, 0.05 * S);
    ctx.fillStyle = sk.s || '#00d2b4';
    ctx.font = '800 ' + Math.max(9, 0.12 * S) + 'px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(sk.star ? '★' : '</>', 0, -0.66 * S);
  }

  // 6. TORSO Y SUDADERA 3D (Hoodie roja)
  ctx.fillStyle = 'rgba(0,0,0,.15)';
  rr(-0.25 * S, -0.9 * S, 0.5 * S, 0.5 * S, 0.12 * S);
  ctx.fillStyle = sk.b || '#dc2626';
  rr(-0.24 * S, -0.89 * S, 0.48 * S, 0.48 * S, 0.11 * S);

  // CHALECO DENIM AZUL CON ESTRELLA EN EL PECHO (STAR OUTFIT)
  if (sk.star) {
    ctx.fillStyle = '#2563eb';
    rr(-0.21 * S, -0.88 * S, 0.42 * S, 0.44 * S, 0.08 * S);
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(-0.06 * S, -0.88 * S, 0.12 * S, 0.32 * S);

    // Estrella dorada grabada en el pecho
    ctx.fillStyle = '#facc15';
    ctx.font = '800 ' + Math.max(13, 0.17 * S) + 'px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('★', 0, -0.67 * S);
  } else {
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    rr(-0.18 * S, -0.6 * S, 0.36 * S, 0.18 * S, 0.06 * S);
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    ctx.fillRect(-0.23 * S, -0.46 * S, 0.46 * S, 0.05 * S);
  }

  // Tirantes de la mochila
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-0.18 * S, -0.88 * S, 0.06 * S, 0.42 * S);
  ctx.fillRect(0.12 * S, -0.88 * S, 0.06 * S, 0.42 * S);
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(-0.19 * S, -0.7 * S, 0.08 * S, 0.03 * S);
  ctx.fillRect(0.11 * S, -0.7 * S, 0.08 * S, 0.03 * S);

  // 7. BRAZOS PUMPING DE VELOCISTA (Codos flexionados oscilando enérgicamente)
  var shoulderY = -0.84 * S;
  var armSwingL = isHoverboard ? 0.35 : (air ? -0.4 : -strideSin * 0.55);
  var armSwingR = isHoverboard ? -0.35 : (air ? 0.4 : strideSin * 0.55);

  // Brazo izquierdo articulado con flexión
  ctx.save();
  ctx.translate(-0.26 * S, shoulderY);
  ctx.rotate(armSwingL);
  ctx.fillStyle = sk.b || '#dc2626';
  // Hombro a codo
  rr(-0.07 * S, 0, 0.14 * S, 0.22 * S, 0.05 * S);
  // Antebrazo flexionado
  ctx.translate(0, 0.2 * S);
  ctx.rotate(0.35); // Flexión de codo
  rr(-0.06 * S, 0, 0.12 * S, 0.18 * S, 0.04 * S);
  // Puño
  ctx.fillStyle = '#f5cb9b';
  ctx.beginPath(); ctx.arc(0, 0.18 * S, 0.055 * S, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Brazo derecho articulado con flexión
  ctx.save();
  ctx.translate(0.26 * S, shoulderY);
  ctx.rotate(armSwingR);
  ctx.fillStyle = sk.b || '#dc2626';
  rr(-0.07 * S, 0, 0.14 * S, 0.22 * S, 0.05 * S);
  ctx.translate(0, 0.2 * S);
  ctx.rotate(-0.35);
  rr(-0.06 * S, 0, 0.12 * S, 0.18 * S, 0.04 * S);
  ctx.fillStyle = '#f5cb9b';
  ctx.beginPath(); ctx.arc(0, 0.18 * S, 0.055 * S, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // 8. CORDONES Y CUELLO DE LA SUDADERA
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.beginPath(); ctx.arc(0, -0.86 * S, 0.13 * S, 0, Math.PI); ctx.fill();
  var cordSwing = Math.sin(runCadence * 1.3) * 0.035 * S;
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1.5, 0.018 * S);
  ctx.beginPath();
  ctx.moveTo(-0.06 * S, -0.84 * S); ctx.lineTo(-0.07 * S + cordSwing, -0.68 * S);
  ctx.moveTo(0.06 * S, -0.84 * S); ctx.lineTo(0.07 * S - cordSwing, -0.68 * S);
  ctx.stroke();

  // 9. CABEZA Y ROSTRO 3D
  var skinGrad = ctx.createRadialGradient(-0.05 * S, -1.04 * S, 0.04 * S, 0, -1.0 * S, 0.22 * S);
  skinGrad.addColorStop(0, '#fde68a');
  skinGrad.addColorStop(0.4, '#f5cb9b');
  skinGrad.addColorStop(1, '#e0a66d');
  ctx.fillStyle = skinGrad;
  ctx.beginPath(); ctx.arc(0, -1.0 * S, 0.22 * S, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = sk.hair || '#2c1810';
  ctx.beginPath();
  ctx.arc(-0.17 * S, -1.0 * S, 0.07 * S, 0, Math.PI * 2);
  ctx.arc(0.17 * S, -1.0 * S, 0.07 * S, 0, Math.PI * 2);
  ctx.fill();

  // COLETA DE PELO OSCILANTE AL CORRER
  var ponySway = Math.sin(runCadence * 1.1) * 0.06 * S;
  ctx.fillStyle = sk.hair || '#2c1810';
  ctx.beginPath();
  ctx.moveTo(-0.08 * S, -0.98 * S);
  ctx.quadraticCurveTo(-0.25 * S + ponySway, -0.92 * S, -0.22 * S + ponySway, -0.78 * S);
  ctx.quadraticCurveTo(-0.14 * S + ponySway, -0.86 * S, -0.04 * S, -0.94 * S);
  ctx.closePath();
  ctx.fill();

  // 10. AURICULARES DE DJ AMARILLOS (STAR OUTFIT / FRESH)
  if (sk.headphones || sk.star) {
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = Math.max(2.5, 0.038 * S);
    ctx.beginPath(); ctx.arc(0, -1.04 * S, 0.25 * S, Math.PI * 0.8, Math.PI * 0.2); ctx.stroke();

    ctx.fillStyle = '#facc15';
    rr(-0.26 * S, -1.06 * S, 0.08 * S, 0.15 * S, 0.04 * S);
    rr(0.18 * S, -1.06 * S, 0.08 * S, 0.15 * S, 0.04 * S);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-0.24 * S, -1.02 * S, 0.04 * S, 0.07 * S);
    ctx.fillRect(0.2 * S, -1.02 * S, 0.04 * S, 0.07 * S);
  }

  // 11. GORRA HACIA ATRÁS 3D (Signature Backwards Cap)
  ctx.fillStyle = sk.h || '#facc15';
  rr(-0.22 * S, -1.18 * S, 0.44 * S, 0.2 * S, 0.09 * S);
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = Math.max(1, 0.015 * S);
  ctx.beginPath();
  ctx.moveTo(0, -1.18 * S); ctx.lineTo(0, -0.99 * S);
  ctx.moveTo(-0.13 * S, -1.17 * S); ctx.lineTo(-0.09 * S, -1.0 * S);
  ctx.moveTo(0.13 * S, -1.17 * S); ctx.lineTo(0.09 * S, -1.0 * S);
  ctx.stroke();

  ctx.fillStyle = sk.star ? '#16a34a' : '#ffd23f';
  ctx.beginPath(); ctx.arc(0, -1.19 * S, 0.032 * S, 0, Math.PI * 2); ctx.fill();

  // Visera trasera plana (verde en Star Outfit)
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.fillRect(-0.29 * S, -1.07 * S, 0.17 * S, 0.06 * S);
  ctx.fillStyle = sk.star ? '#16a34a' : (sk.h || '#00d2b4');
  rr(-0.31 * S, -1.1 * S, 0.17 * S, 0.05 * S, 0.02 * S);

  // 12. OJOS Y ROSTRO
  if (sk.visor) {
    ctx.fillStyle = sk.visor;
    rr(-0.16 * S, -1.06 * S, 0.32 * S, 0.08 * S, 0.03 * S);
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.fillRect(-0.14 * S, -1.04 * S, 0.12 * S, 0.025 * S);
  } else {
    var eyeY = -1.03 * S;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(-0.08 * S, eyeY, 0.052 * S, 0.065 * S, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0.08 * S, eyeY, 0.052 * S, 0.065 * S, 0, 0, Math.PI * 2); ctx.fill();

    var irisCol = sk.id === 'cyber' ? '#00f0d0' : (sk.id === 'terminal' ? '#10b981' : '#3d2010');
    ctx.fillStyle = irisCol;
    ctx.beginPath(); ctx.arc(-0.075 * S, eyeY, 0.036 * S, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0.085 * S, eyeY, 0.036 * S, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#0a0a0f';
    ctx.beginPath(); ctx.arc(-0.075 * S, eyeY, 0.024 * S, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0.085 * S, eyeY, 0.024 * S, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(-0.085 * S, eyeY - 0.016 * S, 0.014 * S, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0.075 * S, eyeY - 0.016 * S, 0.014 * S, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = sk.hair || '#2c1810'; ctx.lineWidth = Math.max(1.5, 0.022 * S);
    ctx.beginPath();
    ctx.moveTo(-0.13 * S, eyeY - 0.07 * S); ctx.lineTo(-0.04 * S, eyeY - 0.075 * S);
    ctx.moveTo(0.04 * S, eyeY - 0.075 * S); ctx.lineTo(0.13 * S, eyeY - 0.07 * S);
    ctx.stroke();

    ctx.strokeStyle = '#991b1b'; ctx.lineWidth = Math.max(1.5, 0.022 * S);
    ctx.beginPath();
    ctx.arc(0, -0.94 * S, 0.065 * S, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }

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
