/* ============================================================
   CAPA DE RENDERIZADO: ENTITY RENDERER
   Renderizado de trenes 3D, monedas giratorias con estrella dorada,
   obstáculos, power-ups, inspector y partículas
   ============================================================ */

function drawTrain(e) {
  var zf = Math.max(e.z, -0.3), zb = Math.max(e.z + e.len, -0.3);
  var p1 = F / (F + zf), p2 = F / (F + zb);
  var TH = 1.35; // Altura áurea optimizada con ángulo de cámara elevado
  var halfW = 0.44; // Ancho del vagón
  var xl = e.lane - halfW, xr = e.lane + halfW;

  var y1 = sy(p1), y1t = y1 - TH * unit * p1;
  var y2 = sy(p2), y2t = y2 - TH * unit * p2;
  var x1l = sx(xl, p1), x1r = sx(xr, p1);
  var x2l = sx(xl, p2), x2r = sx(xr, p2);
  var w1 = x1r - x1l, h1 = y1 - y1t;
  var w2 = x2r - x2l, h2 = y2 - y2t;

  // Selección de librea auténtica de Subway Surfers (según referencia del usuario)
  // 0: Tren clásico de metro (Imagen 1: Techo azul marino, cabina blanca, laterales naranjas)
  // 1: Tren bala moderno (Imagen 2: Carrocería blanca plateada con franja roja de competición)
  var isBullet = (Math.abs(Math.floor(e.lane * 3 + e.len)) % 2 === 1);

  // 1. SOMBRA DE CONTACTO 3D Y BOGIES BAJO EL VAGÓN
  var shadowGrad = ctx.createLinearGradient(0, y2, 0, y1);
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0.22)');
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0.55)');
  poly([[x1l - 0.04 * w1, y1 + 2], [x1r + 0.04 * w1, y1 + 2], [x2r + 0.04 * w2, y2 + 1], [x2l - 0.04 * w2, y2 + 1]], shadowGrad);

  var bogieW = w1 * 0.18, bogieH = h1 * 0.1;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x1l + w1 * 0.12, y1 - bogieH * 0.8, bogieW, bogieH);
  ctx.fillRect(x1r - w1 * 0.3, y1 - bogieH * 0.8, bogieW, bogieH);

  // 2. HAZ DE LUZ DE LOS FAROS PROYECTADO SOBRE LA VÍA
  if (e.z > -0.4 && e.z < 28) {
    var lightLen = Math.min(8.5, 3.8 + (28 - e.z) * 0.2);
    var plF = F / (F + Math.max(0, e.z - lightLen));
    var lyG = sy(plF);
    var lxL = sx(e.lane - 0.72, plF), lxR = sx(e.lane + 0.72, plF);
    var bGrad = ctx.createLinearGradient(x1l + w1 / 2, y1, x1l + w1 / 2, lyG);
    var beamAlpha = 0.25 + pal.lamp * 0.35;
    bGrad.addColorStop(0, 'rgba(255, 240, 180, ' + beamAlpha + ')');
    bGrad.addColorStop(0.65, 'rgba(255, 220, 130, ' + (beamAlpha * 0.35) + ')');
    bGrad.addColorStop(1, 'rgba(255, 220, 130, 0)');
    poly([[x1l, y1], [x1r, y1], [lxR, lyG], [lxL, lyG]], bGrad);
  }

  // 3. FLANCO LATERAL EN PERSPECTIVA 3D CON VENTANAS DE PASAJEROS
  var showLeft = (e.lane > P.x + 0.05);
  var showRight = (e.lane < P.x - 0.05);

  if (showLeft) {
    // Pared lateral izquierda
    var sCol = isBullet ? '#e2e8f0' : '#1e293b';
    poly([[x1l, y1t], [x2l, y2t], [x2l, y2], [x1l, y1]], sCol);

    // Franja decorativa lateral (Naranja para metro clásico, Roja para tren bala)
    var stripeCol = isBullet ? '#dc2626' : '#ea580c';
    var b1yTop = y1t + h1 * 0.38, b1yBot = y1t + h1 * 0.86;
    var b2yTop = y2t + h2 * 0.38, b2yBot = y2t + h2 * 0.86;
    poly([[x1l, b1yTop], [x2l, b2yTop], [x2l, b2yBot], [x1l, b1yBot]], stripeCol);

    // Ventanas tintadas de pasajeros a lo largo del lateral
    var nWins = Math.max(2, Math.floor(e.len * 1.05));
    for (var wi = 0; wi < nWins; wi++) {
      var wz1 = e.z + (wi + 0.18) * (e.len / nWins);
      var wz2 = e.z + (wi + 0.76) * (e.len / nWins);
      if (wz1 > ZFAR || wz2 < -0.3) continue;
      var wp1 = F / (F + Math.max(wz1, -0.3)), wp2 = F / (F + Math.max(wz2, -0.3));
      var wx1 = sx(xl, wp1), wy1T = sy(wp1) - TH * unit * wp1 + (TH * unit * wp1 * 0.42), wy1B = wy1T + (TH * unit * wp1 * 0.26);
      var wx2 = sx(xl, wp2), wy2T = sy(wp2) - TH * unit * wp2 + (TH * unit * wp2 * 0.42), wy2B = wy2T + (TH * unit * wp2 * 0.26);
      poly([[wx1, wy1T], [wx2, wy2T], [wx2, wy2B], [wx1, wy1B]], '#0f172a');
      poly([[wx1 + 1, wy1T + 1], [wx2 - 1, wy2T + 1], [wx2 - 1, wy2B - 1], [wx1 + 1, wy1B - 1]], 'rgba(56, 189, 248, 0.55)');
    }
  } else if (showRight) {
    // Pared lateral derecha
    var sCol = isBullet ? '#e2e8f0' : '#1e293b';
    poly([[x1r, y1t], [x2r, y2t], [x2r, y2], [x1r, y1]], sCol);

    var stripeCol = isBullet ? '#dc2626' : '#ea580c';
    var b1yTop = y1t + h1 * 0.38, b1yBot = y1t + h1 * 0.86;
    var b2yTop = y2t + h2 * 0.38, b2yBot = y2t + h2 * 0.86;
    poly([[x1r, b1yTop], [x2r, b2yTop], [x2r, b2yBot], [x1r, b1yBot]], stripeCol);

    var nWins = Math.max(2, Math.floor(e.len * 1.05));
    for (var wi = 0; wi < nWins; wi++) {
      var wz1 = e.z + (wi + 0.18) * (e.len / nWins);
      var wz2 = e.z + (wi + 0.76) * (e.len / nWins);
      if (wz1 > ZFAR || wz2 < -0.3) continue;
      var wp1 = F / (F + Math.max(wz1, -0.3)), wp2 = F / (F + Math.max(wz2, -0.3));
      var wx1 = sx(xr, wp1), wy1T = sy(wp1) - TH * unit * wp1 + (TH * unit * wp1 * 0.42), wy1B = wy1T + (TH * unit * wp1 * 0.26);
      var wx2 = sx(xr, wp2), wy2T = sy(wp2) - TH * unit * wp2 + (TH * unit * wp2 * 0.42), wy2B = wy2T + (TH * unit * wp2 * 0.26);
      poly([[wx1, wy1T], [wx2, wy2T], [wx2, wy2B], [wx1, wy1B]], '#0f172a');
      poly([[wx1 - 1, wy1T + 1], [wx2 + 1, wy2T + 1], [wx2 + 1, wy2B - 1], [wx1 - 1, wy1B - 1]], 'rgba(56, 189, 248, 0.55)');
    }
  }

  // 4. TECHO 3D CURVADO Y PISABLE (Visible con perspectiva aérea)
  var roofCol = isBullet ? '#cbd5e1' : '#1e3a8a'; // Gris metálico o Azul Marino clásico
  var rGrad = ctx.createLinearGradient(0, y2t, 0, y1t);
  rGrad.addColorStop(0, isBullet ? '#94a3b8' : '#172554');
  rGrad.addColorStop(1, roofCol);
  poly([[x1l, y1t], [x1r, y1t], [x2r, y2t], [x2l, y2t]], rGrad);

  // Pista central transitable sobre el techo
  var rWalkW = 0.54;
  var rxl1 = sx(e.lane - halfW * rWalkW, p1), rxr1 = sx(e.lane + halfW * rWalkW, p1);
  var rxl2 = sx(e.lane - halfW * rWalkW, p2), rxr2 = sx(e.lane + halfW * rWalkW, p2);
  poly([[rxl1, y1t], [rxr1, y1t], [rxr2, y2t], [rxl2, y2t]], isBullet ? '#b91c1c' : '#334155');

  // Nervaduras y unidades de climatización en el techo
  var nRibs = Math.floor(e.len * 1.5);
  for (var r = 0; r < nRibs; r++) {
    var rz = e.z + (r + 0.5) * (e.len / nRibs);
    if (rz < -0.2 || rz > ZFAR) continue;
    var rp = F / (F + rz), ry = sy(rp) - TH * unit * rp;
    var rxl = sx(xl, rp), rxr = sx(xr, rp);
    ctx.strokeStyle = isBullet ? '#64748b' : '#3b82f6';
    ctx.lineWidth = Math.max(1, 0.03 * unit * rp);
    ctx.beginPath(); ctx.moveTo(rxl, ry); ctx.lineTo(rxr, ry); ctx.stroke();

    if (r % 3 === 0 && unit * rp > 12) {
      var acW = (rxr - rxl) * 0.44, acH = Math.max(2, 0.07 * unit * rp);
      var acX = (rxl + rxr) * 0.5 - acW * 0.5;
      ctx.fillStyle = '#475569';
      rr(acX, ry - acH, acW, acH, 2);
    }
  }

  // 5. CABINA FRONTAL AUTÉNTICA (SUBWAY SURFERS AAA)
  var cabCorner = Math.max(4, 0.14 * w1);
  ctx.save();

  // A) Cúpula superior arqueada (Navy Blue en clásico / Gris plateado en bullet)
  var domeH = h1 * 0.28;
  var dGrad = ctx.createLinearGradient(x1l, y1t, x1l, y1t + domeH);
  dGrad.addColorStop(0, isBullet ? '#cbd5e1' : '#1e3a8a');
  dGrad.addColorStop(1, isBullet ? '#94a3b8' : '#172554');
  ctx.fillStyle = dGrad;
  rr(x1l, y1t, w1, domeH + 4, cabCorner);

  // B) Cuerpo inferior de la cabina con sombreado cilíndrico curvo 3D
  var lowerH = h1 - domeH;
  var sideShade = ctx.createLinearGradient(x1l, 0, x1r, 0);
  if (isBullet) {
    sideShade.addColorStop(0, '#cbd5e1');
    sideShade.addColorStop(0.18, '#f8fafc');
    sideShade.addColorStop(0.82, '#f8fafc');
    sideShade.addColorStop(1, '#cbd5e1');
  } else {
    sideShade.addColorStop(0, '#c2410c');
    sideShade.addColorStop(0.18, '#ea580c');
    sideShade.addColorStop(0.82, '#ea580c');
    sideShade.addColorStop(1, '#c2410c');
  }
  ctx.fillStyle = sideShade;
  rr(x1l, y1t + domeH, w1, lowerH, cabCorner);

  // C) Columna vertical central blanca (rasgo distintivo de Subway Surfers - Imagen 1)
  if (!isBullet) {
    var colW = w1 * 0.46;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x1l + (w1 - colW) * 0.5, y1t + domeH * 0.65, colW, h1 * 0.55);
  }

  // D) Parabrisas aerodinámico triple con cristales tintados oceánicos y reflejo
  var winY = y1t + h1 * 0.16, winH = h1 * 0.32;
  var winCenterW = w1 * 0.46, winSideW = w1 * 0.16;
  var gap = w1 * 0.04;
  var winStartX = x1l + (w1 - (winCenterW + winSideW * 2 + gap * 2)) * 0.5;

  // Panel izquierdo
  ctx.fillStyle = '#090d16';
  rr(winStartX, winY, winSideW, winH, 3);
  ctx.fillStyle = 'rgba(2, 132, 199, 0.82)';
  rr(winStartX + 1, winY + 1, winSideW - 2, winH - 2, 2);

  // Panel central panorámico
  var winCenterX = winStartX + winSideW + gap;
  ctx.fillStyle = '#090d16';
  rr(winCenterX, winY, winCenterW, winH, 3);
  ctx.fillStyle = 'rgba(2, 132, 199, 0.82)';
  rr(winCenterX + 1, winY + 1, winCenterW - 2, winH - 2, 2);
  // Reflejo diagonal de luz
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.moveTo(winCenterX + winCenterW * 0.22, winY + 2);
  ctx.lineTo(winCenterX + winCenterW * 0.46, winY + 2);
  ctx.lineTo(winCenterX + winCenterW * 0.3, winY + winH - 2);
  ctx.lineTo(winCenterX + winCenterW * 0.06, winY + winH - 2);
  ctx.fill();

  // Panel derecho
  var winRightX = winCenterX + winCenterW + gap;
  ctx.fillStyle = '#090d16';
  rr(winRightX, winY, winSideW, winH, 3);
  ctx.fillStyle = 'rgba(2, 132, 199, 0.82)';
  rr(winRightX + 1, winY + 1, winSideW - 2, winH - 2, 2);

  // E) Emblema heráldico de la línea del metro (rombo dorado elegante)
  var emblemY = y1t + h1 * 0.58, emblemS = Math.max(3, w1 * 0.06);
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath();
  ctx.moveTo(x1l + w1 * 0.5, emblemY - emblemS);
  ctx.lineTo(x1l + w1 * 0.5 + emblemS, emblemY);
  ctx.lineTo(x1l + w1 * 0.5, emblemY + emblemS);
  ctx.lineTo(x1l + w1 * 0.5 - emblemS, emblemY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(x1l + w1 * 0.5, emblemY, emblemS * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // F) Faros frontales duales con halos cálidos luminosos
  var lampY = y1 - h1 * 0.24, lRad = Math.max(3, w1 * 0.08);
  var lampLeftX = x1l + w1 * 0.2, lampRightX = x1r - w1 * 0.2;
  [lampLeftX, lampRightX].forEach(function (lx) {
    var lGlow = ctx.createRadialGradient(lx, lampY, lRad * 0.3, lx, lampY, lRad * 2.2);
    lGlow.addColorStop(0, 'rgba(255, 245, 170, 0.95)');
    lGlow.addColorStop(0.5, 'rgba(255, 215, 80, 0.45)');
    lGlow.addColorStop(1, 'rgba(255, 215, 80, 0)');
    ctx.fillStyle = lGlow;
    ctx.beginPath(); ctx.arc(lx, lampY, lRad * 2.2, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(lx, lampY, lRad, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.5; ctx.stroke();
  });

  // G) Parachoques inferior (Cowcatcher) con franjas chevron de seguridad (Imagen 2)
  var bumpH = h1 * 0.13, bumpY = y1 - bumpH;
  ctx.fillStyle = '#0f172a';
  rr(x1l - 2, bumpY, w1 + 4, bumpH, 2);

  var nStripes = 6, sStep = w1 / nStripes;
  for (var si = 0; si < nStripes; si++) {
    var sx1 = x1l + si * sStep;
    ctx.fillStyle = (si % 2 === 0) ? '#f8fafc' : '#ef4444';
    ctx.beginPath();
    ctx.moveTo(sx1, bumpY + bumpH);
    ctx.lineTo(sx1 + sStep * 0.5, bumpY);
    ctx.lineTo(sx1 + sStep, bumpY);
    ctx.lineTo(sx1 + sStep * 0.5, bumpY + bumpH);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawRamp(e) {
  var zf = Math.max(e.z, -0.3), zb = Math.max(e.z + 2.5, -0.3);
  var p1 = F / (F + zf), p2 = F / (F + zb);
  var xl = e.lane - 0.4, xr = e.lane + 0.4;
  var y1 = sy(p1), y2 = sy(p2) - 1.35 * unit * p2;
  var x1l = sx(xl, p1), x1r = sx(xr, p1), x2l = sx(xl, p2), x2r = sx(xr, p2);

  // Superficie de la rampa metálica
  poly([[x1l, y1], [x1r, y1], [x2r, y2], [x2l, y2]], '#ffd23f');
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = Math.max(1, 0.04 * unit * p1);
  ctx.beginPath();
  ctx.moveTo(x1l, y1); ctx.lineTo(x2l, y2);
  ctx.moveTo(x1r, y1); ctx.lineTo(x2r, y2);
  ctx.stroke();

  // Flechas amarillas/negras indicadoras de impulso
  var midY = (y1 + y2) / 2, midX = (x1l + x1r) / 2, mW = (x1r - x1l) * 0.4;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(midX, midY - 0.15 * unit * p1);
  ctx.lineTo(midX + mW / 2, midY + 0.1 * unit * p1);
  ctx.lineTo(midX - mW / 2, midY + 0.1 * unit * p1);
  ctx.closePath();
  ctx.fill();
}

function drawBar(e) {
  var z = Math.max(e.z, -0.3), p = F / (F + z), y = sy(p), u = unit * p;
  var x0 = sx(e.lane - 0.45, p), w = 0.9 * u;
  ctx.fillStyle = '#0c141a';
  ctx.fillRect(x0, y - 0.7 * u, 0.08 * u, 0.7 * u);
  ctx.fillRect(x0 + w - 0.08 * u, y - 0.7 * u, 0.08 * u, 0.7 * u);
  // Barra a rayas de advertencia
  var n = 5;
  for (var i = 0; i < n; i++) {
    ctx.fillStyle = i % 2 ? '#ef4444' : '#f8fafc';
    ctx.fillRect(x0 + w * i / n, y - 0.7 * u, w / n + 0.5, 0.22 * u);
  }
}

function drawOver(e) {
  var z = Math.max(e.z, -0.3), p = F / (F + z), y = sy(p), u = unit * p;
  var x0 = sx(e.lane - 0.46, p), w = 0.92 * u;
  ctx.fillStyle = '#0c141a';
  ctx.fillRect(x0, y - 1.25 * u, 0.07 * u, 1.25 * u);
  ctx.fillRect(x0 + w - 0.07 * u, y - 1.25 * u, 0.07 * u, 1.25 * u);
  var n = 6;
  for (var i = 0; i < n; i++) {
    ctx.fillStyle = i % 2 ? '#0f1a22' : '#ffd23f';
    ctx.fillRect(x0 + w * i / n, y - 1.15 * u, w / n + 0.5, 0.35 * u);
  }
}

// -------------------------------------------------------------
// MONEDAS 3D CON ESTRELLA DORADA (METRO DEV COIN 3D)
// -------------------------------------------------------------
function drawCoin(e) {
  var z = Math.max(e.z, -0.3), p = F / (F + z), x = sx(e.lane, p), y = sy(p) - e.y * unit * p, r = 0.19 * unit * p;
  if (r < 1.5) return;
  var ang = time * 5 + e.z * 0.6;
  var cosA = Math.cos(ang);
  var w = Math.max(r * 0.12, Math.abs(cosA) * r);
  var sign = cosA >= 0 ? 1 : -1;

  // Halo dorado resplandeciente
  var glow = ctx.createRadialGradient(x, y, 0, x, y, r * 2.2);
  glow.addColorStop(0, 'rgba(255, 215, 0, 0.45)');
  glow.addColorStop(0.5, 'rgba(255, 180, 0, 0.18)');
  glow.addColorStop(1, 'rgba(255, 180, 0, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.2, 0, 6.283);
  ctx.fill();

  // Canto 3D de la moneda (espesor cilíndrico)
  var rimThick = Math.sin(ang) * (r * 0.22);
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.ellipse(x + rimThick, y, w, r, 0, 0, 6.283);
  ctx.fill();

  // Cara exterior de la moneda con degradado brillante
  var coinGrad = ctx.createLinearGradient(x - w, y - r, x + w, y + r);
  coinGrad.addColorStop(0, '#fef08a');
  coinGrad.addColorStop(0.35, '#f59e0b');
  coinGrad.addColorStop(0.7, '#d97706');
  coinGrad.addColorStop(1, '#78350f');
  ctx.fillStyle = coinGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, w, r, 0, 0, 6.283);
  ctx.fill();

  // Aro interior grabado
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = Math.max(1, r * 0.1);
  ctx.beginPath();
  ctx.ellipse(x, y, w * 0.82, r * 0.82, 0, 0, 6.283);
  ctx.stroke();

  // Estrella de 5 puntas grabada en el centro
  if (w > r * 0.25) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sign * (w / r), 1);
    ctx.fillStyle = '#fef9c3';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = Math.max(0.8, r * 0.06);
    ctx.beginPath();
    var starR = r * 0.48, starInner = r * 0.22;
    for (var sIdx = 0; sIdx < 5; sIdx++) {
      var aOuter = -Math.PI / 2 + (sIdx * 2 * Math.PI) / 5;
      var aInner = aOuter + Math.PI / 5;
      var ox = Math.cos(aOuter) * starR, oy = Math.sin(aOuter) * starR;
      var ix = Math.cos(aInner) * starInner, iy = Math.sin(aInner) * starInner;
      if (sIdx === 0) ctx.moveTo(ox, oy);
      else ctx.lineTo(ox, oy);
      ctx.lineTo(ix, iy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawLetter(e) {
  var z = Math.max(e.z, -0.3), p = F / (F + z), x = sx(e.lane, p), y = sy(p) - e.y * unit * p, u = unit * p;
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath(); ctx.arc(x, y, 0.35 * u, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#0b1319';
  ctx.font = '800 ' + (0.42 * u) + 'px Bungee, Impact, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(e.char, x, y + 2);
}

function drawPw(e) {
  var z = Math.max(e.z, -0.3), p = F / (F + z), x = sx(e.lane, p), yg = sy(p), u = unit * p, col = PWCOL[e.k];
  var cy = yg - (0.85 + 0.08 * Math.sin(time * 4)) * u, r = 0.3 * u;
  var rg = ctx.createRadialGradient(x, cy, 0, x, cy, r * 2.4);
  rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(x, cy, r * 2.4, 0, 6.283); ctx.fill();

  ctx.fillStyle = '#0f1a22'; ctx.beginPath(); ctx.arc(x, cy, r, 0, 6.283); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.5, r * 0.18); ctx.beginPath(); ctx.arc(x, cy, r, 0, 6.283); ctx.stroke();
  ctx.fillStyle = col;
  if (e.k === 'x2') {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = (r * 0.95) + 'px Bungee, Impact, sans-serif';
    ctx.fillText('x2', x, cy + r * 0.05);
  } else if (e.k === 'magnet') {
    ctx.beginPath();
    ctx.arc(x, cy + r * 0.05, r * 0.42, Math.PI, 0);
    ctx.lineTo(x + r * 0.42, cy + r * 0.45);
    ctx.moveTo(x - r * 0.42, cy + r * 0.05);
    ctx.lineTo(x - r * 0.42, cy + r * 0.45);
    ctx.stroke();
  } else if (e.k === 'jetpack') {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = (r * 0.95) + 'px sans-serif'; ctx.fillText('🚀', x, cy);
  } else if (e.k === 'sneakers') {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = (r * 0.95) + 'px sans-serif'; ctx.fillText('👟', x, cy);
  }
}

function drawToken(e) {
  var z = Math.max(e.z, -0.3), p = F / (F + z), x = sx(e.lane, p), yg = sy(p);
  var hov = 0.95 + 0.08 * Math.sin(time * 3), cy = yg - hov * unit * p, w = 0.82 * unit * p, h = 0.56 * unit * p;
  var bg = ctx.createLinearGradient(0, yg - 3.2 * unit * p, 0, yg);
  bg.addColorStop(0, 'rgba(0,210,180,0)'); bg.addColorStop(1, 'rgba(0,210,180,.38)');
  ctx.fillStyle = bg; ctx.fillRect(x - 0.28 * unit * p, yg - 3.2 * unit * p, 0.56 * unit * p, 3.2 * unit * p);

  ctx.fillStyle = '#f4efe6'; rr(x - w / 2, cy - h / 2, w, h, h * 0.14);
  ctx.fillStyle = '#ffd23f'; ctx.fillRect(x - w / 2 + w * 0.16, cy - h / 2, Math.max(1, w * 0.02), h);
  ctx.fillStyle = '#0f1a22'; ctx.font = Math.max(8, h * 0.62) + 'px Bungee, Impact, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(e.idx + 1), x + w * 0.06, cy + h * 0.04);
}

function drawBox(e) {
  var z = Math.max(e.z, -0.3), p = F / (F + z), x = sx(e.lane, p), yg = sy(p), u = unit * p;
  var bob = 0.85 + 0.08 * Math.sin(time * 4 + e.z);
  var cy = yg - bob * u, s = 0.58 * u;
  ctx.fillStyle = '#b87333';
  rr(x - s / 2, cy - s / 2, s, s, s * 0.12);
  ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = Math.max(2, s * 0.1);
  ctx.strokeRect(x - s / 2 + 2, cy - s / 2 + 2, s - 4, s - 4);
  ctx.fillStyle = '#ffffff'; ctx.font = '800 ' + Math.max(12, s * 0.65) + 'px Bungee, Impact, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', x, cy + 2);
}

function drawEnt(e) {
  ctx.globalAlpha = Math.max(0, Math.min(1, (ZFAR - e.z) / 16)) * (e.ghost ? 0.35 : 1);
  if (e.t === 'train') drawTrain(e);
  else if (e.t === 'ramp') drawRamp(e);
  else if (e.t === 'bar') drawBar(e);
  else if (e.t === 'over') drawOver(e);
  else if (e.t === 'coin') drawCoin(e);
  else if (e.t === 'letter') drawLetter(e);
  else if (e.t === 'box') drawBox(e);
  else if (e.t === 'token') drawToken(e);
  else if (e.t === 'pw') drawPw(e);
  ctx.globalAlpha = 1;
}

function drawInspector() {
  if (!inspector.active || inspector.dist > 5.5) return;

  // Perspectiva y distancia dinámica
  var pDist = Math.max(0.68, 1.0 - (inspector.dist - 0.7) * 0.12);
  var S = unit * 0.88 * pDist;
  var iy = sy(pDist);
  var fade = Math.max(0, Math.min(1, (5.2 - inspector.dist) / 1.5));
  if (fade <= 0.01) return;

  var runTime = time * 15;
  var legSw = Math.sin(runTime);

  // Inspector corre en el flanco derecho (carril lateral derecho, nunca cubre a Stefani)
  var ix = sx(inspector.lane + 0.72, pDist);
  // Bulldog corre en el flanco izquierdo (carril lateral izquierdo, nunca bajo los pies)
  var dogX = sx(inspector.lane - 0.68, pDist), dogY = iy;

  ctx.save();
  ctx.globalAlpha = fade;

  // Sombra del Inspector y su perro
  ctx.fillStyle = 'rgba(0,0,0,.4)';
  ctx.beginPath();
  ctx.ellipse(ix, iy, 0.34 * S, 0.09 * S, 0, 0, 6.283);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(dogX, dogY, 0.22 * S, 0.07 * S, 0, 0, 6.283);
  ctx.fill();

  // === PERRO PITBULL / BULLDOG DEL INSPECTOR (Auténtico persecutor) ===
  ctx.save();
  ctx.translate(dogX, dogY);
  var dLeg = Math.sin(runTime * 1.3) * 0.09 * S;

  ctx.fillStyle = '#5c3517';
  ctx.fillRect(-0.13 * S, -0.14 * S + dLeg, 0.06 * S, 0.14 * S - dLeg);
  ctx.fillRect(0.08 * S, -0.14 * S - dLeg, 0.06 * S, 0.14 * S + dLeg);
  ctx.fillRect(-0.06 * S, -0.14 * S - dLeg, 0.06 * S, 0.14 * S + dLeg);
  ctx.fillRect(0.02 * S, -0.14 * S + dLeg, 0.06 * S, 0.14 * S - dLeg);

  ctx.fillStyle = '#854d1d';
  rr(-0.15 * S, -0.26 * S, 0.3 * S, 0.18 * S, 0.07 * S);

  ctx.fillStyle = '#dc2626';
  ctx.fillRect(-0.14 * S, -0.28 * S, 0.09 * S, 0.06 * S);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-0.13 * S, -0.29 * S, 0.02 * S, 0.02 * S);
  ctx.fillRect(-0.08 * S, -0.29 * S, 0.02 * S, 0.02 * S);
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath(); ctx.arc(-0.09 * S, -0.22 * S, 0.025 * S, 0, 6.283); ctx.fill();

  ctx.fillStyle = '#854d1d';
  rr(-0.25 * S, -0.34 * S, 0.18 * S, 0.18 * S, 0.06 * S);
  ctx.fillStyle = '#45260e';
  rr(-0.27 * S, -0.27 * S, 0.12 * S, 0.1 * S, 0.03 * S);
  ctx.fillStyle = '#0a0502';
  ctx.beginPath(); ctx.arc(-0.25 * S, -0.25 * S, 0.022 * S, 0, 6.283); ctx.fill();

  var tongueBob = Math.sin(runTime * 2) * 0.015 * S;
  ctx.fillStyle = '#ff6b81';
  ctx.beginPath(); ctx.ellipse(-0.26 * S, -0.19 * S + tongueBob, 0.028 * S, 0.045 * S, 0.25, 0, 6.283); ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(-0.18 * S, -0.29 * S, 0.03 * S, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath(); ctx.arc(-0.19 * S, -0.29 * S, 0.018 * S, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(-0.20 * S, -0.30 * S, 0.008 * S, 0, 6.283); ctx.fill();

  ctx.fillStyle = '#45260e';
  ctx.beginPath();
  ctx.ellipse(-0.14 * S, -0.32 * S, 0.035 * S, 0.06 * S, 0.4, 0, 6.283);
  ctx.fill();

  var tailAngle = Math.sin(runTime * 2.2) * 0.45;
  ctx.strokeStyle = '#854d1d'; ctx.lineWidth = 0.045 * S;
  ctx.beginPath();
  ctx.moveTo(0.14 * S, -0.2 * S);
  ctx.lineTo(0.22 * S, -0.34 * S + tailAngle * 0.09 * S);
  ctx.stroke();
  ctx.restore();

  // === INSPECTOR GRUÑÓN DEL METRO (Auténtico persecutor) ===
  ctx.save();
  ctx.translate(ix, iy);
  var il1 = Math.max(0, legSw) * 0.2 * S, il2 = Math.max(0, -legSw) * 0.2 * S;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-0.22 * S, -0.52 * S, 0.17 * S, 0.52 * S - il1);
  ctx.fillRect(0.05 * S, -0.52 * S, 0.17 * S, 0.52 * S - il2);

  ctx.fillStyle = '#020617';
  ctx.fillRect(-0.24 * S, -0.1 * S - il1, 0.2 * S, 0.1 * S);
  ctx.fillRect(0.04 * S, -0.1 * S - il2, 0.2 * S, 0.1 * S);

  ctx.fillStyle = '#1e3a5f';
  rr(-0.32 * S, -1.05 * S, 0.64 * S, 0.58 * S, 0.13 * S);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-0.32 * S, -0.6 * S, 0.64 * S, 0.09 * S);
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(-0.07 * S, -0.61 * S, 0.14 * S, 0.11 * S);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-0.04 * S, -0.58 * S, 0.08 * S, 0.05 * S);

  ctx.fillStyle = '#ffd23f';
  for (var btnY = -0.96; btnY < -0.65; btnY += 0.1) {
    ctx.beginPath(); ctx.arc(-0.09 * S, btnY * S, 0.024 * S, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.arc(0.09 * S, btnY * S, 0.024 * S, 0, 6.283); ctx.fill();
  }

  ctx.beginPath();
  ctx.moveTo(0.15 * S, -0.92 * S);
  ctx.lineTo(0.24 * S, -0.92 * S);
  ctx.lineTo(0.2 * S, -0.8 * S);
  ctx.closePath();
  ctx.fill();

  var armSw = Math.cos(runTime) * 0.18 * S;
  ctx.fillStyle = '#1e3a5f';
  rr(-0.4 * S, -0.98 * S + armSw, 0.15 * S, 0.4 * S, 0.07 * S);
  rr(0.25 * S, -0.98 * S - armSw, 0.15 * S, 0.4 * S, 0.07 * S);

  ctx.fillStyle = '#f5cb9b';
  ctx.beginPath(); ctx.arc(-0.32 * S, -0.56 * S + armSw, 0.065 * S, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.arc(0.32 * S, -0.56 * S - armSw, 0.065 * S, 0, 6.283); ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(-0.08 * S, -1.04 * S); ctx.lineTo(0, -0.96 * S); ctx.lineTo(0.08 * S, -1.04 * S);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(-0.03 * S, -0.98 * S); ctx.lineTo(0.03 * S, -0.98 * S);
  ctx.lineTo(0.04 * S, -0.82 * S); ctx.lineTo(0, -0.76 * S); ctx.lineTo(-0.04 * S, -0.82 * S);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#f5cb9b';
  ctx.beginPath(); ctx.arc(0, -1.16 * S, 0.23 * S, 0, 6.283); ctx.fill();
  ctx.fillStyle = 'rgba(239,68,68,.35)';
  ctx.beginPath(); ctx.arc(-0.11 * S, -1.12 * S, 0.06 * S, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.arc(0.11 * S, -1.12 * S, 0.06 * S, 0, 6.283); ctx.fill();

  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.ellipse(0, -1.1 * S, 0.16 * S, 0.07 * S, 0, 0, 6.283);
  ctx.fill();

  ctx.fillStyle = '#e29e68';
  ctx.beginPath(); ctx.arc(0, -1.15 * S, 0.05 * S, 0, 6.283); ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(-0.08 * S, -1.21 * S, 0.035 * S, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.arc(0.08 * S, -1.21 * S, 0.035 * S, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath(); ctx.arc(-0.07 * S, -1.2 * S, 0.02 * S, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.arc(0.07 * S, -1.2 * S, 0.02 * S, 0, 6.283); ctx.fill();

  ctx.strokeStyle = '#1e293b'; ctx.lineWidth = Math.max(1.5, 0.028 * S);
  ctx.beginPath();
  ctx.moveTo(-0.13 * S, -1.24 * S); ctx.lineTo(-0.03 * S, -1.22 * S);
  ctx.moveTo(0.03 * S, -1.22 * S); ctx.lineTo(0.13 * S, -1.24 * S);
  ctx.stroke();

  ctx.fillStyle = '#102444';
  rr(-0.26 * S, -1.37 * S, 0.52 * S, 0.19 * S, 0.07 * S);
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(-0.27 * S, -1.26 * S, 0.54 * S, 0.035 * S);
  ctx.beginPath(); ctx.arc(0, -1.3 * S, 0.048 * S, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.ellipse(0, -1.23 * S, 0.28 * S, 0.065 * S, 0, 0, Math.PI);
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

function drawSpeedLines() {
  if (speed < 14 || reduce) return;
  var nLines = Math.min(8, Math.floor((speed - 12) * 1.5));
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.5;
  for (var i = 0; i < nLines; i++) {
    var lx = (Math.sin(time * 20 + i * 47) * 0.5 + 0.5) * W;
    var ly = (Math.cos(time * 25 + i * 23) * 0.5 + 0.5) * H;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx + (lx - cx) * 0.2, ly + (ly - horizon) * 0.2);
    ctx.stroke();
  }
}

function drawFx() {
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 6.283);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.font = '800 20px Bungee, Impact, sans-serif';
  ctx.textAlign = 'center';
  for (var j = 0; j < floaters.length; j++) {
    var f = floaters[j];
    ctx.globalAlpha = Math.max(0, f.life);
    ctx.fillStyle = f.col;
    ctx.fillText(f.t, f.x, f.y);
  }
  ctx.globalAlpha = 1;
}
