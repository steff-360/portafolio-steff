/* ============================================================
   CAPA DE RENDERIZADO: TRACK RENDERER (URBAN SUBWAY 3D ENGINE)
   Vías férreas en perspectiva 3D, muros de contención urbanos,
   graffiti, balasto realista, skyline en capas y atmósfera AAA
   ============================================================ */

// Nubes esponjosas y amigables flotando en el cielo
function drawClouds() {
  ctx.save();
  var cList = [
    { x: 0.12, y: 0.22, s: 1.15, spd: 0.03 },
    { x: 0.45, y: 0.16, s: 0.9, spd: 0.02 },
    { x: 0.74, y: 0.26, s: 1.25, spd: 0.035 },
    { x: 0.96, y: 0.18, s: 0.75, spd: 0.025 }
  ];
  for (var i = 0; i < cList.length; i++) {
    var c = cList[i];
    var cxPos = ((c.x * W + time * 12 * c.spd + scroll * 0.02) % (W + 280)) - 140 - camX * 15;
    var cyPos = horizon * c.y;
    var baseR = Math.max(16, W * 0.036 * c.s);
    ctx.fillStyle = pal.sun > 0.4 ? 'rgba(255, 255, 255, 0.82)' : 'rgba(254, 215, 170, 0.58)';
    ctx.beginPath();
    ctx.arc(cxPos, cyPos, baseR, 0, Math.PI * 2);
    ctx.arc(cxPos + baseR * 0.9, cyPos - baseR * 0.22, baseR * 0.75, 0, Math.PI * 2);
    ctx.arc(cxPos - baseR * 0.8, cyPos + baseR * 0.1, baseR * 0.65, 0, Math.PI * 2);
    ctx.arc(cxPos + baseR * 1.6, cyPos + baseR * 0.12, baseR * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBG() {
  // Gradiente atmosférico del cielo
  var g = ctx.createLinearGradient(0, 0, 0, horizon);
  g.addColorStop(0, pal.sky0);
  g.addColorStop(0.85, pal.sky1);
  var hr = pal.hor_;
  g.addColorStop(1, 'rgb(' + hr[0] + ',' + hr[1] + ',' + hr[2] + ')');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, horizon);

  // 1. SOL RADIANTE Y CÁLIDO (Día y Atardecer)
  if (pal.sun > 0.08) {
    var sunR = Math.min(W, H) * 0.085;
    var sunX = W * 0.5 - camX * 16;
    var sunY = horizon * 0.52;

    // Resplandor difuso suave (glow atmosférico)
    var sg = ctx.createRadialGradient(sunX, sunY, sunR * 0.4, sunX, sunY, sunR * 3.2);
    sg.addColorStop(0, 'rgba(255, 250, 210, ' + (0.95 * pal.sun) + ')');
    sg.addColorStop(0.35, 'rgba(255, 210, 110, ' + (0.45 * pal.sun) + ')');
    sg.addColorStop(0.7, 'rgba(255, 160, 60, ' + (0.15 * pal.sun) + ')');
    sg.addColorStop(1, 'rgba(255, 140, 40, 0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Disco solar nítido
    ctx.fillStyle = 'rgba(255, 255, 248, ' + (0.98 * pal.sun) + ')';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 0.88, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. ESTRELLAS SUAVES Y LUNA CRECIENTE (Noche y Ocaso)
  if (pal.star > 0.08) {
    var moonX = W * 0.22 - camX * 14, moonY = horizon * 0.32, mr = Math.max(16, W * 0.038);
    var mg = ctx.createRadialGradient(moonX, moonY, mr * 0.3, moonX, moonY, mr * 3.2);
    mg.addColorStop(0, 'rgba(224, 242, 254, ' + (0.5 * pal.star) + ')');
    mg.addColorStop(0.6, 'rgba(186, 230, 253, ' + (0.2 * pal.star) + ')');
    mg.addColorStop(1, 'rgba(224, 242, 254, 0)');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.arc(moonX, moonY, mr * 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(240, 249, 255, ' + (0.95 * pal.star) + ')';
    ctx.beginPath();
    ctx.arc(moonX, moonY, mr, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal.sky0;
    ctx.beginPath();
    ctx.arc(moonX + mr * 0.45, moonY - mr * 0.15, mr * 0.85, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    for (var s = 0; s < 32; s++) {
      var stX = (((s * 137.5) % 100) * 0.01 * W - camX * 6 + W) % W;
      var stY = ((s * 59.3) % 100) * 0.007 * horizon + 8;
      var tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(time * 1.8 + s * 1.3));
      ctx.globalAlpha = tw * pal.star * 0.85;
      ctx.beginPath();
      ctx.arc(stX, stY, s % 3 === 0 ? 1.8 : 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Nubes suaves cuando hay luz solar
  if (pal.sun > 0.15) {
    drawClouds();
  }

  // Skyline urbano en dos capas con perspectiva y profundidad
  drawSkyline([18, 32, 24, 45, 28, 52, 22, 38, 48, 20, 36, 42, 30], pal.sun > 0.4 ? '#475569' : '#1e1b4b', 0.12, false, 0);
  drawSkyline([28, 48, 36, 62, 42, 70, 34, 55, 68, 30, 52, 60, 44], pal.sun > 0.4 ? '#334155' : '#0f172a', 0.28, true, 1);
}

// Renderizado de edificios determinista y limpio (SIN RUIDO / ESTÁTICA)
function drawSkyline(arr, col, par, litK, layerIdx) {
  var bW = W / (arr.length - 1);
  var off = ((camX * 35 * par) + (scroll * 1.2 * par)) % bW;
  ctx.fillStyle = col;
  for (var i = -1; i <= arr.length; i++) {
    var arrIdx = ((i % arr.length) + arr.length) % arr.length;
    var h = arr[arrIdx] * (H * 0.0035);
    var bx = i * bW - off;
    ctx.fillRect(bx, horizon - h, bW + 1, h);

    // Cornisa superior iluminada
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.fillRect(bx, horizon - h, bW + 1, 3);

    // Antenas y torres de agua en algunos techos
    if (arrIdx % 3 === 0) {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(bx + bW * 0.5 - 1.5, horizon - h - 14, 3, 14);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(bx + bW * 0.5 - 2.5, horizon - h - 16, 5, 3);
    }

    ctx.fillStyle = col;

    // Ventanas limpias, fijas y armoniosas
    if (litK && pal.lamp > 0.25) {
      var bSeed = (arrIdx * 31 + layerIdx * 17) % 100;
      var colCount = Math.max(1, Math.floor((bW - 14) / 11));
      var rowCount = Math.max(1, Math.floor((h - 22) / 15));

      for (var r = 0; r < rowCount; r++) {
        var wy = horizon - h + 14 + r * 15;
        for (var c = 0; c < colCount; c++) {
          var isLit = ((c * 7 + r * 13 + bSeed) % 10) >= 3;
          if (isLit) {
            var wx = bx + 7 + c * 11;
            var wColor = ((c + r + bSeed) % 3 === 0) ? '#fef08a' : (((c + r) % 2 === 0) ? '#38bdf8' : '#fda4af');
            ctx.fillStyle = wColor;
            ctx.fillRect(wx, wy, 4, 7);
          }
        }
      }
      ctx.fillStyle = col;
    }
  }
}

function drawBoards() {
  // Rótulos luminosos de Stefani Sánchez y proyectos en postes laterales elegantes
  var bOff = scroll % 60;
  for (var bz = -bOff; bz < ZFAR; bz += 60) {
    if (bz < 3.2) continue;
    var bp = F / (F + bz);
    var by = sy(bp);
    var bu = unit * bp;
    var side = Math.sin(bz * 7) > 0 ? 1 : -1;
    var bx = sx(side * 3.4, bp);
    var bw = 1.35 * bu, bh = 0.58 * bu;

    var bIdx = Math.abs(Math.floor(bz / 60)) % CITY_DATA.length;
    var bd = CITY_DATA[bIdx];

    var alpha = Math.min(1, (bz - 3.2) / 3.8);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(bx, by - 2.8 * bu);

    // Poste de soporte metálico
    ctx.fillStyle = '#334155';
    ctx.fillRect(-bw * 0.04, 0, bw * 0.08, 2.8 * bu);

    // Cartel estilizado con marco dorado
    ctx.fillStyle = '#0f172a';
    rr(-bw / 2, -bh / 2, bw, bh, bh * 0.16);
    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth = Math.max(1, 0.03 * bu);
    ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);

    ctx.fillStyle = '#ffd23f';
    ctx.font = '800 ' + Math.max(7, bh * 0.32) + 'px Bungee, Impact, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(bd[0], 0, -bh * 0.2);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 ' + Math.max(6, bh * 0.24) + 'px "Barlow Condensed", sans-serif';
    ctx.fillText(bd[1], 0, bh * 0.22);
    ctx.restore();
  }
}

function drawTrack() {
  var yN = Math.max(H, sy(PN));

  // 1. TERRENO BASE DE ASFALTO / HORMIGÓN URBANO
  var g = ctx.createLinearGradient(0, horizon, 0, H);
  g.addColorStop(0, pal.g0);
  g.addColorStop(0.4, pal.g1);
  g.addColorStop(1, '#05070d');
  ctx.fillStyle = g;
  ctx.fillRect(0, horizon, W, H - horizon);

  // 2. MUROS DE CONTENCIÓN LATERALES DEL METRO (Subway Retaining Walls con Graffiti)
  var wallH = 1.4; // Altura del muro en unidades
  for (var wSide = -1; wSide <= 1; wSide += 2) {
    var wxFar = wSide * 2.2, wxNear = wSide * 2.3;
    var xFarTop = sx(wxFar, 0.04), yFarTop = sy(0.04) - wallH * unit * 0.04;
    var xNearTop = sx(wxNear, PN), yNearTop = sy(PN) - wallH * unit * PN;
    var xNearBot = sx(wxNear, PN), yNearBot = yN;
    var xFarBot = sx(wxFar, 0.04), yFarBot = sy(0.04);

    // Muro de hormigón
    var wallGrad = ctx.createLinearGradient(0, horizon, 0, H);
    wallGrad.addColorStop(0, pal.sun > 0.4 ? '#475569' : '#1e293b');
    wallGrad.addColorStop(1, pal.sun > 0.4 ? '#334155' : '#0f172a');
    poly([[xFarTop, yFarTop], [xNearTop, yNearTop], [xNearBot, yNearBot], [xFarBot, yFarBot]], wallGrad);

    // Remate superior del muro (Curb) con franja de seguridad amarilla
    var curbW = 0.15;
    var cFarTop = sx(wxFar + wSide * curbW, 0.04), cyFarTop = yFarTop - 0.08 * unit * 0.04;
    var cNearTop = sx(wxNear + wSide * curbW, PN), cyNearTop = yNearTop - 0.08 * unit * PN;
    poly([[xFarTop, yFarTop], [xNearTop, yNearTop], [cNearTop, cyNearTop], [cFarTop, cyFarTop]], '#f59e0b');

    // Paneles de junta vertical en el muro que se mueven con scroll
    var jOff = scroll % 8;
    for (var jz = -jOff; jz < ZFAR; jz += 8) {
      if (jz < 0.8) continue;
      var jp = F / (F + jz), jy = sy(jp), ju = unit * jp;
      var jx = sx(wSide * 2.25, jp);
      var jTop = jy - wallH * ju;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
      ctx.lineWidth = Math.max(1, 0.03 * ju);
      ctx.beginPath();
      ctx.moveTo(jx, jTop);
      ctx.lineTo(jx, jy);
      ctx.stroke();

      // Rótulos de graffiti en los muros a intervalos
      if (Math.floor(jz / 8) % 3 === 0 && ju > 14) {
        ctx.save();
        ctx.translate(jx + wSide * 0.05 * ju, jy - wallH * 0.5 * ju);
        ctx.fillStyle = (Math.floor(jz / 8) % 2 === 0) ? '#06b6d4' : '#f43f5e';
        ctx.font = '900 ' + Math.max(8, ju * 0.38) + 'px Bungee, Impact, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(wSide < 0 ? 'STEFF' : 'DEV', 0, 0);
        ctx.restore();
      }
    }
  }

  // 3. BALASTO DE LAS VÍAS DEL TREN (Grava de piedra triturada central)
  var bgG = ctx.createLinearGradient(0, horizon, 0, H);
  bgG.addColorStop(0, pal.sun > 0.4 ? '#332924' : '#231b17');
  bgG.addColorStop(0.5, pal.sun > 0.4 ? '#261e19' : '#181310');
  bgG.addColorStop(1, '#0e0b09');
  poly([[cx, horizon], [sx(1.62, PN), yN], [sx(-1.62, PN), yN]], bgG);

  // Líneas amarillas de seguridad del andén
  for (var si = -1; si <= 1; si += 2) {
    poly([[cx, horizon], [sx(si * 1.62, PN), yN], [sx(si * 1.72, PN), yN]], 'rgba(255, 210, 63, 0.88)');
  }

  // 4. TRAVIESAS DE MADERA (Sleepers 3D con placas de fijación)
  var off = scroll % 1.5;
  for (var z = -off; z < ZFAR; z += 1.5) {
    if (z < -0.8) continue;
    var p = F / (F + z), y = sy(p);
    if (y > H + 5) continue;
    var slW = 3.16 * unit * p, slH = Math.max(1.8, 0.13 * unit * p), slX = sx(-1.58, p);

    // Cuerpo de madera de la traviesa
    ctx.fillStyle = '#261c14';
    ctx.fillRect(slX, y - slH, slW, slH);

    // Borde biselado superior con luz
    ctx.fillStyle = pal.sun > 0.3 ? '#3d2e24' : '#1a130e';
    ctx.fillRect(slX, y - slH, slW, Math.max(1, slH * 0.28));

    // Placas metálicas de fijación bajo los rieles
    for (var plLane = -1; plLane <= 1; plLane++) {
      for (var plO = -1; plO <= 1; plO += 2) {
        var plx = sx(plLane + plO * 0.26, p);
        ctx.fillStyle = '#475569';
        ctx.fillRect(plx - 0.05 * unit * p, y - slH, 0.1 * unit * p, slH);
      }
    }
  }

  // 5. RIELES METÁLICOS DE ACERO 3D (3 vías: -1, 0, +1)
  for (var l = -1; l <= 1; l++) {
    for (var o = -1; o <= 1; o += 2) {
      var rx = l + o * 0.26;
      // Base y alma de acero del riel
      poly([[cx, horizon], [sx(rx - 0.038, PN), yN], [sx(rx + 0.038, PN), yN]], '#334155');
      // Cabeza del riel con reflejo especular metálico
      poly([[cx, horizon], [sx(rx - 0.016, PN), yN], [sx(rx + 0.016, PN), yN]], pal.sun > 0.3 ? '#f1f5f9' : '#38bdf8');
    }
  }

  // 6. SEMÁFOROS FERROVIARIOS CON INDICADORES LED
  var sigOff = scroll % 28;
  for (var sz = -sigOff; sz < ZFAR; sz += 28) {
    if (sz < 1.0) continue;
    var sp = F / (F + sz), syP = sy(sp), su = unit * sp;
    var sigX = sx(2.05, sp);
    var poleH = 2.4 * su;
    var headW = 0.34 * su, headH = 0.7 * su;

    var poleTop = syP - poleH;
    ctx.fillStyle = '#334155';
    ctx.fillRect(sigX - 0.04 * su, poleTop, 0.08 * su, poleH);
    for (var str = 0; str < 4; str++) {
      ctx.fillStyle = str % 2 === 0 ? '#ef4444' : '#f8fafc';
      ctx.fillRect(sigX - 0.04 * su, syP - (str + 1) * (poleH * 0.22), 0.08 * su, poleH * 0.18);
    }

    ctx.fillStyle = '#0f172a';
    rr(sigX - headW / 2, poleTop - headH, headW, headH, 0.06 * su);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = Math.max(1, 0.02 * su);
    ctx.strokeRect(sigX - headW / 2, poleTop - headH, headW, headH);

    var redY = poleTop - headH * 0.72;
    var isRed = ((Math.floor((time * 0.8) + sz)) % 2 === 0);
    ctx.fillStyle = isRed ? '#ef4444' : '#450a0a';
    ctx.beginPath(); ctx.arc(sigX, redY, 0.09 * su, 0, Math.PI * 2); ctx.fill();
    if (isRed) {
      var rGlow = ctx.createRadialGradient(sigX, redY, 0, sigX, redY, 0.35 * su);
      rGlow.addColorStop(0, 'rgba(239, 68, 68, 0.65)');
      rGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = rGlow;
      ctx.beginPath(); ctx.arc(sigX, redY, 0.35 * su, 0, Math.PI * 2); ctx.fill();
    }

    var grnY = poleTop - headH * 0.28;
    ctx.fillStyle = !isRed ? '#22c55e' : '#052e16';
    ctx.beginPath(); ctx.arc(sigX, grnY, 0.09 * su, 0, Math.PI * 2); ctx.fill();
    if (!isRed) {
      var gGlow = ctx.createRadialGradient(sigX, grnY, 0, sigX, grnY, 0.35 * su);
      gGlow.addColorStop(0, 'rgba(34, 197, 94, 0.65)');
      gGlow.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = gGlow;
      ctx.beginPath(); ctx.arc(sigX, grnY, 0.35 * su, 0, Math.PI * 2); ctx.fill();
    }
  }

  // 7. PÓRTICOS DE CATENARIA AÉREA Y CABLEADO FINO ELEGANTE
  var gOff = scroll % 24;
  for (var gz = -gOff; gz < ZFAR; gz += 24) {
    if (gz < 2.8) continue;
    var gp = F / (F + gz), gy = sy(gp), gu = unit * gp;
    var gLeft = sx(-2.05, gp), gRight = sx(2.05, gp), gTop = gy - 3.4 * gu;
    var gThick = Math.max(2, 0.08 * gu);

    // Columnas metálicas del pórtico
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(gLeft - gThick / 2, gTop, gThick, gy - gTop);
    ctx.fillRect(gRight - gThick / 2, gTop, gThick, gy - gTop);

    // Viga transversal superior
    ctx.fillStyle = '#334155';
    ctx.fillRect(gLeft, gTop, gRight - gLeft, gThick);
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(gLeft, gTop + gThick, gRight - gLeft, Math.max(1, gThick * 0.25));

    // Aisladores cerámicos y cables finos sobre cada carril
    for (var gc2 = -1; gc2 <= 1; gc2++) {
      var clx = sx(gc2, gp);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(clx - Math.max(1, 0.02 * gu), gTop + gThick, Math.max(2, 0.04 * gu), 0.35 * gu);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(clx, gTop + gThick + 0.35 * gu, Math.max(1.5, 0.03 * gu), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Cable de alta tensión sutil y fino que conecta a lo largo de las vías
  for (var wLane = -1; wLane <= 1; wLane++) {
    var wFarX = sx(wLane * 0.08, 0.06), wFarY = sy(0.06) - 3.05 * unit * 0.06;
    var wNearX = sx(wLane, PN), wNearY = sy(PN) - 3.05 * unit * PN;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.38)';
    ctx.lineWidth = Math.max(1, 0.015 * unit * PN);
    ctx.beginPath();
    ctx.moveTo(wFarX, wFarY);
    ctx.lineTo(wNearX, wNearY);
    ctx.stroke();
  }

  // 8. FAROLAS LATERALES CON HALO CÁLIDO
  var off2 = scroll % 12, la = 0.15 + pal.lamp * 0.6;
  for (var lz = -off2; lz < ZFAR; lz += 12) {
    if (lz < 1.0) continue;
    var lp = F / (F + lz), ly = sy(lp);
    for (var ls = -1; ls <= 1; ls += 2) {
      var lpx = sx(ls * 2.35, lp), top = ly - 2.6 * unit * lp, pw2 = Math.max(1, 0.06 * unit * lp);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(lpx - pw2 / 2, top, pw2, ly - top);
      var ax = lpx - ls * 0.45 * unit * lp;
      ctx.fillRect(Math.min(lpx, ax), top, Math.abs(ax - lpx), pw2);
      if (pal.lamp > 0.1) {
        var gl = ctx.createRadialGradient(ax, top, 0, ax, top, 0.75 * unit * lp);
        gl.addColorStop(0, 'rgba(255,210,100,' + la + ')'); gl.addColorStop(1, 'rgba(255,210,100,0)');
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(ax, top, 0.75 * unit * lp, 0, 6.283); ctx.fill();
      }
      ctx.fillStyle = pal.lamp > 0.2 ? '#ffd23f' : '#cbd5e1';
      ctx.beginPath(); ctx.arc(ax, top, Math.max(1, 0.08 * unit * lp), 0, 6.283); ctx.fill();
    }
  }

  drawBoards();

  // 9. NIEBLA ATMOSFÉRICA PROFUNDA EN EL HORIZONTE
  var hz = ctx.createLinearGradient(0, horizon - H * 0.02, 0, horizon + H * 0.08), hr2 = pal.hor_;
  hz.addColorStop(0, 'rgba(' + hr2[0] + ',' + hr2[1] + ',' + hr2[2] + ',.5)');
  hz.addColorStop(0.5, 'rgba(' + hr2[0] + ',' + hr2[1] + ',' + hr2[2] + ',.3)');
  hz.addColorStop(1, 'rgba(' + hr2[0] + ',' + hr2[1] + ',' + hr2[2] + ',0)');
  ctx.fillStyle = hz;
  ctx.fillRect(0, horizon - H * 0.02, W, H * 0.1);
}
