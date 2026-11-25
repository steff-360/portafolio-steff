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
  var z = inspector.dist;
  var p = F / (F + z);
  var ix = sx(inspector.lane, p);
  var iy = sy(p);
  var su = unit * p;

  // Sombra del Inspector
  ctx.fillStyle = 'rgba(0,0,0,.45)';
  ctx.beginPath();
  ctx.ellipse(ix, iy, 0.45 * su, 0.12 * su, 0, 0, 6.283);
  ctx.fill();

  // Cuerpo y uniforme azul oscuro del inspector
  ctx.fillStyle = '#1e3a8a';
  rr(ix - 0.28 * su, iy - 1.4 * su, 0.56 * su, 0.8 * su, 0.08 * su);

  // Cabeza y gorra de oficial de metro
  ctx.fillStyle = '#f5cb9b';
  ctx.beginPath(); ctx.arc(ix, iy - 1.55 * su, 0.18 * su, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(ix - 0.24 * su, iy - 1.75 * su, 0.48 * su, 0.14 * su);
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(ix - 0.08 * su, iy - 1.7 * su, 0.16 * su, 0.08 * su);

  // Perro pitbull guardián corriendo al lado
  var dogX = ix + 0.42 * su;
  ctx.fillStyle = '#78350f';
  rr(dogX - 0.18 * su, iy - 0.5 * su, 0.36 * su, 0.28 * su, 0.06 * su);
  ctx.beginPath(); ctx.arc(dogX + 0.16 * su, iy - 0.52 * su, 0.12 * su, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(dogX + 0.06 * su, iy - 0.46 * su, 0.08 * su, 0.14 * su);
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
