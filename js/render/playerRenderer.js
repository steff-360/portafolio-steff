/* ============================================================
   CAPA DE RENDERIZADO: PLAYER RENDERER
   Renderizado del runner en perspectiva 3D con Star Outfit,
   patineta hoverboard, zapatillas chunky, auriculares y animaciones
   ============================================================ */

function drawPlayer() {
  var S = unit;
  var px = sx(P.x, 1);
  var py = groundY - P.y * S;
  var sk = getActiveOutfit();

  // Sombra ovalada 3D proyectada en el suelo o techo del tren
  var shadowFloor = groundY - (P.onTrain ? 1.9 * S : 0);
  var shadowScale = Math.max(0.4, 1 - Math.min(P.y - (P.onTrain ? 1.9 : 0), 1.5) * 0.35);
  ctx.fillStyle = 'rgba(10,16,22,.4)';
  ctx.beginPath();
  ctx.ellipse(px, shadowFloor, 0.34 * S * shadowScale, 0.08 * S * shadowScale, 0, 0, 6.283);
  ctx.fill();

  if (P.inv > 0 && pw.shield <= 0 && Math.floor(P.inv * 16) % 2 === 0) ctx.globalAlpha = 0.35;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate((P.lane - P.x) * 0.18);

  // 1. PATINETA HOVERBOARD (cuando está activa)
  if (pw.shield > 0) {
    var bData = BOARDS_DATA.find(function (b) { return b.id === activeBoardId; }) || BOARDS_DATA[0];
    ctx.fillStyle = bData.col || '#00d2b4';
    rr(-0.44 * S, 0.02 * S, 0.88 * S, 0.11 * S, 0.05 * S);
    ctx.fillStyle = bData.col2 || '#ff3b30';
    ctx.fillRect(-0.2 * S, 0.04 * S, 0.4 * S, 0.07 * S);
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(-0.36 * S, 0.05 * S, 0.08 * S, 0.05 * S);
    ctx.fillRect(0.28 * S, 0.05 * S, 0.08 * S, 0.05 * S);

    // Propulsores de luz bajo la tabla
    ctx.fillStyle = '#00f0d0';
    ctx.beginPath();
    ctx.arc(-0.25 * S, 0.13 * S, 0.045 * S, 0, 6.283);
    ctx.arc(0.25 * S, 0.13 * S, 0.045 * S, 0, 6.283);
    ctx.fill();
    emit(px + (Math.random() - 0.5) * 20, py + 0.15 * S, 1, { s: 60, g: 0, l: 0.25, r: 2.5, c: bData.col || '#00f0d0' });
  }

  // 2. MOCHILA TÉCNICA O JETPACK EN LA ESPALDA
  if (pw.jetpack > 0) {
    ctx.fillStyle = '#7928ca';
    rr(-0.26 * S, -0.9 * S, 0.52 * S, 0.44 * S, 0.08 * S);
    ctx.fillStyle = '#e2e8f0';
    rr(-0.24 * S, -0.52 * S, 0.15 * S, 0.16 * S, 0.04 * S);
    rr(0.09 * S, -0.52 * S, 0.15 * S, 0.16 * S, 0.04 * S);
    ctx.fillStyle = '#c77dff';
    ctx.fillRect(-0.2 * S, -0.78 * S, 0.4 * S, 0.08 * S);
    emit(px + (Math.random() - 0.5) * 14, py - 0.4 * S, 2, { s: 120, up: 60, g: 300, l: 0.35, r: 3, c: '#a855f7' });
  } else {
    ctx.fillStyle = '#0b1319';
    rr(-0.21 * S, -0.86 * S, 0.42 * S, 0.38 * S, 0.08 * S);
    ctx.fillStyle = '#1e293b';
    rr(-0.16 * S, -0.76 * S, 0.32 * S, 0.22 * S, 0.05 * S);
    ctx.fillStyle = sk.s || '#00d2b4';
    ctx.font = '800 ' + Math.max(9, 0.12 * S) + 'px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(sk.star ? '★' : '</>', 0, -0.65 * S);
  }

  if (P.slide > 0) {
    ctx.scale(1.15, 0.58);
    emit(px + (Math.random() - 0.5) * 16, groundY - (P.onTrain ? 1.9 : 0) * S, 1, { s: 50, up: 10, g: 120, l: 0.25, r: 2.2, c: '#ffd23f' });
  }

  var air = P.y > (P.onTrain ? 1.92 : 0.02);
  var t = P.run * 13, sw = Math.sin(t), aw = air ? -0.1 : sw * 0.12;
  var bob = air || (state !== 'play' && state !== 'start') ? 0 : Math.abs(sw) * 0.03;
  ctx.translate(0, -bob * S);

  var l1 = air ? 0.14 : Math.max(0, sw) * 0.16;
  var l2 = air ? 0.14 : Math.max(0, -sw) * 0.16;

  // 3. PANTALONES (Marrones en Star Outfit como en Subway Surfers)
  var pantsCol = sk.pants || (sk.star ? '#854d0e' : '#1e293b');
  ctx.fillStyle = pantsCol;
  rr(-0.18 * S, -0.46 * S, 0.15 * S, (0.46 - l1) * S, 0.03 * S);
  rr(0.03 * S, -0.46 * S, 0.15 * S, (0.46 - l2) * S, 0.03 * S);
  ctx.fillStyle = sk.star ? '#713f12' : '#334155';
  ctx.fillRect(-0.18 * S, -(0.06 + l1) * S, 0.15 * S, 0.03 * S);
  ctx.fillRect(0.03 * S, -(0.06 + l2) * S, 0.15 * S, 0.03 * S);

  // 4. ZAPATILLAS SKATE CHUNKY
  var isSneakers = pw.sneakers > 0;
  var shoeCol = isSneakers ? '#ff9100' : (sk.s || '#dc2626');
  var shoeScale = isSneakers ? 1.35 : 1.0;

  // Zapatilla izquierda
  ctx.save();
  ctx.translate(-0.1 * S, -l1 * S);
  ctx.scale(shoeScale, shoeScale);
  ctx.fillStyle = shoeCol;
  rr(-0.1 * S, -0.12 * S, 0.2 * S, 0.12 * S, 0.03 * S);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(0.06 * S, -0.05 * S, 0.05 * S, -Math.PI * 0.5, Math.PI * 0.5); ctx.fill();
  ctx.fillStyle = '#f8fafc';
  rr(-0.11 * S, -0.035 * S, 0.22 * S, 0.04 * S, 0.015 * S);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-0.1 * S, -0.008 * S, 0.2 * S, 0.01 * S);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-0.04 * S, -0.11 * S, 0.06 * S, 0.02 * S);
  ctx.fillRect(-0.03 * S, -0.08 * S, 0.05 * S, 0.02 * S);
  if (sk.star) {
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-0.08 * S, -0.08 * S, 0.04 * S, 0.02 * S);
  }
  ctx.restore();

  // Zapatilla derecha
  ctx.save();
  ctx.translate(0.11 * S, -l2 * S);
  ctx.scale(shoeScale, shoeScale);
  ctx.fillStyle = shoeCol;
  rr(-0.1 * S, -0.12 * S, 0.2 * S, 0.12 * S, 0.03 * S);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(0.06 * S, -0.05 * S, 0.05 * S, -Math.PI * 0.5, Math.PI * 0.5); ctx.fill();
  ctx.fillStyle = '#f8fafc';
  rr(-0.11 * S, -0.035 * S, 0.22 * S, 0.04 * S, 0.015 * S);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-0.1 * S, -0.008 * S, 0.2 * S, 0.01 * S);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-0.04 * S, -0.11 * S, 0.06 * S, 0.02 * S);
  ctx.fillRect(-0.03 * S, -0.08 * S, 0.05 * S, 0.02 * S);
  if (sk.star) {
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-0.08 * S, -0.08 * S, 0.04 * S, 0.02 * S);
  }
  ctx.restore();

  // 5. TORSO Y SUDADERA 3D (Hoodie + Chaleco Denim en Star Outfit)
  ctx.fillStyle = 'rgba(0,0,0,.15)';
  rr(-0.25 * S, -0.88 * S, 0.5 * S, 0.48 * S, 0.12 * S);
  ctx.fillStyle = sk.b || '#dc2626';
  rr(-0.24 * S, -0.87 * S, 0.48 * S, 0.46 * S, 0.11 * S);

  // CHALECO DENIM AZUL CON ESTRELLA EN EL PECHO (STAR OUTFIT)
  if (sk.star) {
    ctx.fillStyle = '#2563eb'; // Denim azul
    rr(-0.21 * S, -0.86 * S, 0.42 * S, 0.42 * S, 0.08 * S);
    // Solapas del chaleco
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(-0.06 * S, -0.86 * S, 0.12 * S, 0.3 * S);

    // ESTRELLA DORADA EN EL PECHO
    ctx.fillStyle = '#facc15';
    ctx.font = '800 ' + Math.max(12, 0.16 * S) + 'px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('★', 0, -0.66 * S);
  } else {
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    rr(-0.18 * S, -0.58 * S, 0.36 * S, 0.16 * S, 0.06 * S);
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    ctx.fillRect(-0.23 * S, -0.45 * S, 0.46 * S, 0.05 * S);
  }

  // Tirantes de la mochila
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-0.18 * S, -0.86 * S, 0.06 * S, 0.4 * S);
  ctx.fillRect(0.12 * S, -0.86 * S, 0.06 * S, 0.4 * S);
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(-0.19 * S, -0.68 * S, 0.08 * S, 0.03 * S);
  ctx.fillRect(0.11 * S, -0.68 * S, 0.08 * S, 0.03 * S);

  // 6. BRAZOS Y MANGAS
  ctx.fillStyle = sk.b || '#dc2626';
  rr(-0.35 * S, (-0.82 + aw) * S, 0.12 * S, 0.32 * S, 0.06 * S);
  rr(0.23 * S, (-0.82 - aw) * S, 0.12 * S, 0.32 * S, 0.06 * S);
  ctx.fillStyle = '#f5cb9b';
  ctx.beginPath();
  ctx.arc(-0.29 * S, (-0.5 + aw) * S, 0.055 * S, 0, 6.283);
  ctx.arc(0.29 * S, (-0.5 - aw) * S, 0.055 * S, 0, 6.283);
  ctx.fill();

  // 7. CORDONES BLANCOS DE LA SUDADERA
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.beginPath(); ctx.arc(0, -0.84 * S, 0.13 * S, 0, Math.PI); ctx.fill();
  var cordW = Math.sin(t * 1.1) * 0.03 * S;
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1.5, 0.018 * S);
  ctx.beginPath();
  ctx.moveTo(-0.06 * S, -0.82 * S); ctx.lineTo(-0.07 * S + cordW, -0.66 * S);
  ctx.moveTo(0.06 * S, -0.82 * S); ctx.lineTo(0.07 * S - cordW, -0.66 * S);
  ctx.stroke();

  // 8. CABEZA Y ROSTRO 3D
  var skinGrad = ctx.createRadialGradient(-0.05 * S, -1.02 * S, 0.04 * S, 0, -0.98 * S, 0.22 * S);
  skinGrad.addColorStop(0, '#fde68a');
  skinGrad.addColorStop(0.4, '#f5cb9b');
  skinGrad.addColorStop(1, '#e0a66d');
  ctx.fillStyle = skinGrad;
  ctx.beginPath(); ctx.arc(0, -0.98 * S, 0.21 * S, 0, 6.283); ctx.fill();

  ctx.fillStyle = sk.hair || '#2c1810';
  ctx.beginPath();
  ctx.arc(-0.16 * S, -0.98 * S, 0.07 * S, 0, 6.283);
  ctx.arc(0.16 * S, -0.98 * S, 0.07 * S, 0, 6.283);
  ctx.fill();

  // 9. AURICULARES DE DJ AMARILLOS (STAR OUTFIT / FRESH)
  if (sk.headphones || sk.star) {
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = Math.max(2, 0.035 * S);
    ctx.beginPath(); ctx.arc(0, -1.02 * S, 0.24 * S, Math.PI * 0.8, Math.PI * 0.2); ctx.stroke();

    ctx.fillStyle = '#facc15'; // Almohadillas amarillas brillantes
    rr(-0.25 * S, -1.04 * S, 0.08 * S, 0.14 * S, 0.04 * S);
    rr(0.17 * S, -1.04 * S, 0.08 * S, 0.14 * S, 0.04 * S);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-0.23 * S, -1.0 * S, 0.04 * S, 0.06 * S);
    ctx.fillRect(0.19 * S, -1.0 * S, 0.04 * S, 0.06 * S);
  }

  // 10. GORRA HACIA ATRÁS 3D (Subway Surfers signature backwards cap)
  ctx.fillStyle = sk.h || '#facc15';
  rr(-0.21 * S, -1.16 * S, 0.42 * S, 0.2 * S, 0.09 * S);
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = Math.max(1, 0.015 * S);
  ctx.beginPath();
  ctx.moveTo(0, -1.16 * S); ctx.lineTo(0, -0.97 * S);
  ctx.moveTo(-0.12 * S, -1.15 * S); ctx.lineTo(-0.08 * S, -0.98 * S);
  ctx.moveTo(0.12 * S, -1.15 * S); ctx.lineTo(0.08 * S, -0.98 * S);
  ctx.stroke();

  // Botón superior de la gorra
  ctx.fillStyle = sk.star ? '#16a34a' : '#ffd23f';
  ctx.beginPath(); ctx.arc(0, -1.17 * S, 0.032 * S, 0, 6.283); ctx.fill();

  // Visera trasera plana (verde en Star Outfit)
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.fillRect(-0.28 * S, -1.05 * S, 0.16 * S, 0.06 * S);
  ctx.fillStyle = sk.star ? '#16a34a' : (sk.h || '#00d2b4');
  rr(-0.3 * S, -1.08 * S, 0.16 * S, 0.05 * S, 0.02 * S);

  // 11. OJOS Y ROSTRO
  if (sk.visor) {
    ctx.fillStyle = sk.visor;
    rr(-0.16 * S, -1.04 * S, 0.32 * S, 0.08 * S, 0.03 * S);
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.fillRect(-0.14 * S, -1.02 * S, 0.12 * S, 0.025 * S);
  } else {
    var eyeY = -1.01 * S;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(-0.08 * S, eyeY, 0.052 * S, 0.065 * S, 0, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0.08 * S, eyeY, 0.052 * S, 0.065 * S, 0, 0, 6.283); ctx.fill();

    var irisCol = sk.id === 'cyber' ? '#00f0d0' : (sk.id === 'terminal' ? '#10b981' : '#3d2010');
    ctx.fillStyle = irisCol;
    ctx.beginPath(); ctx.arc(-0.075 * S, eyeY, 0.036 * S, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.arc(0.085 * S, eyeY, 0.036 * S, 0, 6.283); ctx.fill();

    ctx.fillStyle = '#0a0a0f';
    ctx.beginPath(); ctx.arc(-0.075 * S, eyeY, 0.024 * S, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.arc(0.085 * S, eyeY, 0.024 * S, 0, 6.283); ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(-0.085 * S, eyeY - 0.016 * S, 0.014 * S, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.arc(0.075 * S, eyeY - 0.016 * S, 0.014 * S, 0, 6.283); ctx.fill();

    // Cejas decididas
    ctx.strokeStyle = sk.hair || '#2c1810'; ctx.lineWidth = Math.max(1.5, 0.022 * S);
    ctx.beginPath();
    ctx.moveTo(-0.13 * S, eyeY - 0.07 * S); ctx.lineTo(-0.04 * S, eyeY - 0.075 * S);
    ctx.moveTo(0.04 * S, eyeY - 0.075 * S); ctx.lineTo(0.13 * S, eyeY - 0.07 * S);
    ctx.stroke();

    // Sonrisa de skater
    ctx.strokeStyle = '#991b1b'; ctx.lineWidth = Math.max(1.5, 0.022 * S);
    ctx.beginPath();
    ctx.arc(0, -0.92 * S, 0.065 * S, 0.2 * Math.PI, 0.8 * Math.PI);
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
    ctx.beginPath(); ctx.arc(px, cyy, S * 0.74, 0, 6.283); ctx.fill(); ctx.stroke();
  }
  if (pw.magnet > 0) {
    ctx.strokeStyle = 'rgba(255,107,74,' + (0.35 + 0.35 * Math.sin(time * 10)) + ')';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(px, groundY - (P.y + 0.55) * S, S * (0.8 + 0.18 * ((time * 2) % 1)), 0, 6.283); ctx.stroke();
  }
}
