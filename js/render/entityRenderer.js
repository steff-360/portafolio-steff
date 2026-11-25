/* ============================================================
   CAPA DE RENDERIZADO: ENTITY RENDERER
   Renderizado de trenes 3D, monedas giratorias con estrella dorada,
   obstáculos, power-ups, inspector y partículas
   ============================================================ */

function drawTrain(e) {
  var zf = Math.max(e.z, -0.3), zb = Math.max(e.z + e.len, -0.3);
  var p1 = F / (F + zf), p2 = F / (F + zb), c = e.c, TH = 1.9;
  var xl = e.lane - 0.44, xr = e.lane + 0.44;
  var y1 = sy(p1), y1t = y1 - TH * unit * p1, y2 = sy(p2), y2t = y2 - TH * unit * p2;
  var x1l = sx(xl, p1), x1r = sx(xr, p1), x2l = sx(xl, p2), x2r = sx(xr, p2);
  var w = x1r - x1l, h = y1 - y1t;

  // Haz de luz frontal de los faros del tren proyectado sobre los rieles
  if (e.z > -0.2 && e.z < 26) {
    var lightLen = Math.min(8, 3.5 + (26 - e.z) * 0.2);
    var plF = F / (F + Math.max(0, e.z - lightLen));
    var lyG = sy(plF);
    var lxL = sx(e.lane - 0.72, plF), lxR = sx(e.lane + 0.72, plF);
    var bGrad = ctx.createLinearGradient(x1l + w / 2, y1, x1l + w / 2, lyG);
    var beamAlpha = 0.22 + pal.lamp * 0.35;
    bGrad.addColorStop(0, 'rgba(255, 235, 170, ' + beamAlpha + ')');
    bGrad.addColorStop(0.7, 'rgba(255, 220, 130, ' + (beamAlpha * 0.4) + ')');
    bGrad.addColorStop(1, 'rgba(255, 220, 130, 0)');
    poly([[x1l, y1], [x1r, y1], [lxR, lyG], [lxL, lyG]], bGrad);
  }

  // Lado del tren
  if (e.lane > P.x + 0.1) {
    poly([[x1l, y1t], [x2l, y2t], [x2l, y2], [x1l, y1]], c.s);
  } else if (e.lane < P.x - 0.1) {
    poly([[x1r, y1t], [x2r, y2t], [x2r, y2], [x1r, y1]], c.s);
  }

  // Techo del tren con hendiduras metálicas
  poly([[x1l, y1t], [x1r, y1t], [x2r, y2t], [x2l, y2t]], '#334155');
  var nRibs = Math.floor(e.len * 1.4);
  for (var r = 0; r < nRibs; r++) {
    var rz = e.z + (r + 0.5) * (e.len / nRibs);
    if (rz < -0.2 || rz > ZFAR) continue;
    var rp = F / (F + rz), ry = sy(rp) - TH * unit * rp;
    var rxl = sx(xl, rp), rxr = sx(xr, rp);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = Math.max(1, 0.04 * unit * rp);
    ctx.beginPath(); ctx.moveTo(rxl, ry); ctx.lineTo(rxr, ry); ctx.stroke();
  }

  // Frente del vagón
  poly([[x1l, y1t], [x1r, y1t], [x1r, y1], [x1l, y1]], c.f);

  // Parabrisas frontal
  var winH = h * 0.35, winW = w * 0.8, winY = y1t + h * 0.12, winX = x1l + w * 0.1;
  ctx.fillStyle = '#0f172a';
  rr(winX, winY, winW, winH, Math.max(2, 0.05 * w));
  ctx.fillStyle = 'rgba(255,255,255,.25)';
  ctx.fillRect(winX + winW * 0.15, winY + 2, winW * 0.35, winH * 0.4);

  // Faros luminosos delanteros
  var lampY = y1 - h * 0.22, lRad = Math.max(2, w * 0.08);
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath();
  ctx.arc(x1l + w * 0.2, lampY, lRad, 0, 6.283);
  ctx.arc(x1r - w * 0.2, lampY, lRad, 0, 6.283);
  ctx.fill();

  // Franja de advertencia en el parachoques
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(x1l, y1 - h * 0.08, w, h * 0.08);
  ctx.fillStyle = '#ef4444';
  for (var st = 0; st < 5; st++) {
    ctx.fillRect(x1l + st * (w / 5), y1 - h * 0.08, w / 10, h * 0.08);
  }
}

function drawRamp(e) {
  var zf = Math.max(e.z, -0.3), zb = Math.max(e.z + 2.5, -0.3);
  var p1 = F / (F + zf), p2 = F / (F + zb);
  var xl = e.lane - 0.4, xr = e.lane + 0.4;
  var y1 = sy(p1), y2 = sy(p2) - 1.9 * unit * p2;
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
// MONEDAS 3D CON ESTRELLA DORADA (SUBWAY SURFERS REAL COIN - IMAGE 2)
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

  // Estrella de 5 puntas de Subway Surfers en el centro
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
  if (!inspector.active) return;
  if (state !== 'over' && inspector.dist > 3.6) return;
  var z = -inspector.dist;
  var p = F / (F + z);
  var flankX = (state === 'over') ? 0.32 : 0.48;
  var ix = sx(inspector.lane + flankX, p), iy = sy(p);
  var S = unit * p;
  if (state !== 'over' && (iy - 1.4 * S) > H) return;
  var runTime = time * 15;
  var legSw = Math.sin(runTime);

  // Sombra del Inspector y su perro
  ctx.fillStyle = 'rgba(0,0,0,.45)';
  ctx.beginPath();
  ctx.ellipse(ix, iy, 0.38 * S, 0.11 * S, 0, 0, 6.283);
  ctx.fill();

  var dogX = sx(inspector.lane - 0.45, p), dogY = iy;
  ctx.beginPath();
  ctx.ellipse(dogX, dogY, 0.24 * S, 0.08 * S, 0, 0, 6.283);
  ctx.fill();

  // === PERRO PITBULL / BULLDOG DEL INSPECTOR (Auténtico Subway Surfers) ===
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

  // === INSPECTOR GRUÑÓN DEL METRO (Auténtico Subway Surfers) ===
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
}

function drawSpeedLines() {
  if (speed < 22 || reduce) return;
  var nLines = Math.min(8, Math.floor((speed - 22) * 1.5));
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
