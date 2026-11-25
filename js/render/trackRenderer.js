/* ============================================================
   CAPA DE RENDERIZADO: TRACK RENDERER
   Renderizado de vías en perspectiva 3D, catenarias y semáforos
   ============================================================ */

function drawBG() {
  var g = ctx.createLinearGradient(0, 0, 0, horizon);
  g.addColorStop(0, pal.sky0);
  g.addColorStop(1, pal.sky1);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, horizon);

  // Sol / Luna en el horizonte
  var sunR = Math.min(W, H) * 0.08;
  var sunX = W * 0.5 - camX * 20;
  var sunY = horizon * 0.55;
  var sg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 1.8);
  if (dayNight === 'day') {
    sg.addColorStop(0, 'rgba(255, 240, 180, 0.9)');
    sg.addColorStop(0.4, 'rgba(255, 210, 100, 0.4)');
    sg.addColorStop(1, 'rgba(255, 210, 100, 0)');
  } else {
    sg.addColorStop(0, 'rgba(224, 242, 254, 0.85)');
    sg.addColorStop(0.4, 'rgba(186, 230, 253, 0.25)');
    sg.addColorStop(1, 'rgba(186, 230, 253, 0)');
  }
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR * 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Skyline urbano estilo Subway Surfers
  drawSkyline([18, 32, 24, 45, 28, 52, 22, 38, 48, 20, 36, 42, 30], pal.sun > 0.5 ? '#7dd3fc' : '#1e293b', 0.15, false);
  drawSkyline([28, 48, 36, 62, 42, 70, 34, 55, 68, 30, 52, 60, 44], pal.sun > 0.5 ? '#38bdf8' : '#0f172a', 0.35, true);
}

function drawSkyline(arr, col, par, litK) {
  var bW = W / (arr.length - 1);
  var off = (camX * 60 * par) % bW;
  ctx.fillStyle = col;
  for (var i = -1; i <= arr.length; i++) {
    var h = arr[((i % arr.length) + arr.length) % arr.length] * (H * 0.0035);
    var bx = i * bW - off;
    ctx.fillRect(bx, horizon - h, bW + 1, h);

    // Ventanas iluminadas en los edificios
    if (litK && pal.lamp > 0.3) {
      ctx.fillStyle = (i % 3 === 0) ? '#fef08a' : (i % 2 === 0 ? '#38bdf8' : '#fda4af');
      for (var wy = horizon - h + 12; wy < horizon - 8; wy += 14) {
        for (var wx = bx + 6; wx < bx + bW - 6; wx += 10) {
          if (Math.sin(wx * 11 + wy * 17) > 0.1) {
            ctx.fillRect(wx, wy, 4, 6);
          }
        }
      }
      ctx.fillStyle = col;
    }
  }
}

function drawBoards() {
  // Rótulos luminosos de Stefani Sánchez y proyectos a lo largo de las vías
  var bOff = scroll % 60;
  for (var bz = -bOff; bz < ZFAR; bz += 60) {
    if (bz < 1.0) continue;
    var bp = F / (F + bz);
    var by = sy(bp);
    var bu = unit * bp;
    var side = Math.sin(bz * 7) > 0 ? 1 : -1;
    var bx = sx(side * 2.8, bp);
    var bw = 2.4 * bu, bh = 1.2 * bu;

    var bIdx = Math.abs(Math.floor(bz / 60)) % CITY_DATA.length;
    var bd = CITY_DATA[bIdx];

    ctx.save();
    ctx.translate(bx, by - 2.8 * bu);
    ctx.fillStyle = '#0b1319';
    rr(-bw / 2, -bh / 2, bw, bh, bh * 0.12);
    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth = Math.max(1, 0.04 * bu);
    ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);

    ctx.fillStyle = '#ffd23f';
    ctx.font = '800 ' + Math.max(7, bh * 0.32) + 'px Bungee, Impact, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(bd[0], 0, -bh * 0.18);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 ' + Math.max(6, bh * 0.22) + 'px "Barlow Condensed", sans-serif';
    ctx.fillText(bd[1], 0, bh * 0.22);
    ctx.restore();
  }
}

function drawTrack() {
  // Terreno base
  var g = ctx.createLinearGradient(0, horizon, 0, H);
  g.addColorStop(0, pal.g0);
  g.addColorStop(0.35, pal.g1);
  g.addColorStop(1, '#090d16');
  ctx.fillStyle = g;
  ctx.fillRect(0, horizon, W, H - horizon);

  var yN = sy(PN);

  // Balasto de las vías del tren (grava central)
  var bgG = ctx.createLinearGradient(0, horizon, 0, H);
  bgG.addColorStop(0, pal.sun > 0.5 ? '#9c8777' : '#57463b');
  bgG.addColorStop(1, '#1c1511');
  poly([[cx, horizon], [sx(1.58, PN), yN], [sx(-1.58, PN), yN]], bgG);

  // Líneas amarillas de seguridad de la zona de andén
  for (var si = -1; si <= 1; si += 2) {
    poly([[cx, horizon], [sx(si * 1.58, PN), yN], [sx(si * 1.7, PN), yN]], 'rgba(255, 210, 63, 0.85)');
  }

  // Traviesas de madera del ferrocarril
  var off = scroll % 2;
  for (var z = -off; z < ZFAR; z += 2) {
    if (z < -1) continue;
    var p = F / (F + z), y = sy(p);
    var slW = 3.1 * unit * p, slH = Math.max(1.5, 0.12 * unit * p), slX = sx(-1.55, p);
    ctx.fillStyle = '#2d231c';
    ctx.fillRect(slX, y - slH, slW, slH);
    ctx.fillStyle = '#18120e';
    ctx.fillRect(slX, y - slH, slW, Math.max(1, slH * 0.25));
  }

  // Rieles metálicos de acero para los 3 carriles (-1, 0, 1)
  for (var l = -1; l <= 1; l++) {
    for (var o = -1; o <= 1; o += 2) {
      var rx = l + o * 0.26;
      poly([[cx, horizon], [sx(rx - 0.035, PN), yN], [sx(rx + 0.035, PN), yN]], '#475569');
      poly([[cx, horizon], [sx(rx - 0.015, PN), yN], [sx(rx + 0.015, PN), yN]], pal.sun > 0.3 ? '#cbd5e1' : '#94a3b8');
    }
  }

  // Destellos y fijaciones metálicas móviles en los rieles que acentúan la velocidad hacia adelante
  var railDashOff = scroll % 3.5;
  for (var rz = -railDashOff; rz < ZFAR; rz += 3.5) {
    if (rz < 0.2) continue;
    var rp = F / (F + rz), ry = sy(rp), ru = unit * rp;
    for (var rl = -1; rl <= 1; rl++) {
      for (var ro = -1; ro <= 1; ro += 2) {
        var rrx = rl + ro * 0.26;
        var rfx = sx(rrx, rp);
        ctx.fillStyle = pal.sun > 0.3 ? '#ffffff' : '#38bdf8';
        ctx.fillRect(rfx - Math.max(1, 0.02 * ru), ry - Math.max(1.5, 0.05 * ru), Math.max(2, 0.04 * ru), Math.max(1.5, 0.05 * ru));
      }
    }
  }

  // Catenarias aéreas de alta tensión sobre cada carril (estilo Subway Surfers)
  for (var gc = -1; gc <= 1; gc++) {
    var wireNearX = sx(gc, PN), wireNearY = sy(PN) - 3.2 * unit * PN;
    var wireFarY = horizon + 8;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = Math.max(1, 0.03 * unit * PN);
    ctx.beginPath();
    ctx.moveTo(cx, wireFarY);
    ctx.lineTo(wireNearX, wireNearY);
    ctx.stroke();

    // Cable portador superior
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = Math.max(1, 0.02 * unit * PN);
    ctx.beginPath();
    ctx.moveTo(cx, wireFarY - 4);
    ctx.lineTo(wireNearX, wireNearY - 0.28 * unit * PN);
    ctx.stroke();
  }

  // Semáforos ferroviarios con LEDs verde y rojo a los lados de la vía (como en Subway Surfers)
  var sigOff = scroll % 28;
  for (var sz = -sigOff; sz < ZFAR; sz += 28) {
    if (sz < 1.0) continue;
    var sp = F / (F + sz), syP = sy(sp), su = unit * sp;
    var sigX = sx(2.35, sp);
    var poleH = 2.4 * su;
    var headW = 0.36 * su, headH = 0.72 * su;

    // Poste a rayas estilo ferroviario (rojo y blanco)
    var poleTop = syP - poleH;
    ctx.fillStyle = '#334155';
    ctx.fillRect(sigX - 0.04 * su, poleTop, 0.08 * su, poleH);
    for (var str = 0; str < 4; str++) {
      ctx.fillStyle = str % 2 === 0 ? '#ef4444' : '#f8fafc';
      ctx.fillRect(sigX - 0.04 * su, syP - (str + 1) * (poleH * 0.22), 0.08 * su, poleH * 0.18);
    }

    // Caja negra del semáforo
    ctx.fillStyle = '#0f172a';
    rr(sigX - headW / 2, poleTop - headH, headW, headH, 0.06 * su);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = Math.max(1, 0.02 * su);
    ctx.strokeRect(sigX - headW / 2, poleTop - headH, headW, headH);

    // Foco rojo (superior)
    var redY = poleTop - headH * 0.72;
    var isRed = ((Math.floor((time * 0.8) + sz)) % 2 === 0);
    ctx.fillStyle = isRed ? '#ef4444' : '#450a0a';
    ctx.beginPath();
    ctx.arc(sigX, redY, 0.1 * su, 0, Math.PI * 2);
    ctx.fill();
    if (isRed) {
      var rGlow = ctx.createRadialGradient(sigX, redY, 0, sigX, redY, 0.35 * su);
      rGlow.addColorStop(0, 'rgba(239, 68, 68, 0.65)');
      rGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = rGlow;
      ctx.beginPath(); ctx.arc(sigX, redY, 0.35 * su, 0, Math.PI * 2); ctx.fill();
    }

    // Foco verde (inferior)
    var grnY = poleTop - headH * 0.28;
    ctx.fillStyle = !isRed ? '#22c55e' : '#052e16';
    ctx.beginPath();
    ctx.arc(sigX, grnY, 0.1 * su, 0, Math.PI * 2);
    ctx.fill();
    if (!isRed) {
      var gGlow = ctx.createRadialGradient(sigX, grnY, 0, sigX, grnY, 0.35 * su);
      gGlow.addColorStop(0, 'rgba(34, 197, 94, 0.65)');
      gGlow.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = gGlow;
      ctx.beginPath(); ctx.arc(sigX, grnY, 0.35 * su, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Pórticos de catenaria aérea del metro
  var gOff = scroll % 22;
  for (var gz = -gOff; gz < ZFAR; gz += 22) {
    if (gz < 0.6) continue;
    var gp = F / (F + gz), gy = sy(gp), gu = unit * gp;
    var gLeft = sx(-2.1, gp), gRight = sx(2.1, gp), gTop = gy - 3.4 * gu;
    var gThick = Math.max(2, 0.09 * gu);
    ctx.fillStyle = '#1c2833';
    ctx.fillRect(gLeft - gThick / 2, gTop, gThick, gy - gTop);
    ctx.fillRect(gRight - gThick / 2, gTop, gThick, gy - gTop);
    ctx.fillStyle = '#273746';
    ctx.fillRect(gLeft, gTop, gRight - gLeft, gThick);
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(gLeft, gTop + gThick, gRight - gLeft, Math.max(1, gThick * 0.25));
    for (var gc2 = -1; gc2 <= 1; gc2++) {
      var clx = sx(gc2, gp);
      ctx.fillStyle = '#566573';
      ctx.fillRect(clx - Math.max(1, 0.02 * gu), gTop + gThick, Math.max(2, 0.04 * gu), 0.45 * gu);
    }
  }

  // Farolas laterales
  var off2 = scroll % 10, la = 0.15 + pal.lamp * 0.6;
  for (var lz = -off2; lz < ZFAR; lz += 10) {
    if (lz < -1.2) continue;
    var lp = F / (F + lz), ly = sy(lp);
    for (var ls = -1; ls <= 1; ls += 2) {
      var lpx = sx(ls * 2.6, lp), top = ly - 2.6 * unit * lp, pw2 = Math.max(1, 0.06 * unit * lp);
      ctx.fillStyle = '#0c141a'; ctx.fillRect(lpx - pw2 / 2, top, pw2, ly - top);
      var ax = lpx - ls * 0.55 * unit * lp;
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

  // Niebla atmosférica en el horizonte
  var hz = ctx.createLinearGradient(0, horizon, 0, horizon + H * 0.1), hr = pal.hor_;
  hz.addColorStop(0, 'rgba(' + hr[0] + ',' + hr[1] + ',' + hr[2] + ',.3)');
  hz.addColorStop(1, 'rgba(' + hr[0] + ',' + hr[1] + ',' + hr[2] + ',0)');
  ctx.fillStyle = hz;
  ctx.fillRect(0, horizon, W, H * 0.1);
}
