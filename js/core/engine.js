/* ============================================================
   CAPA DEL NÚCLEO: GAME ENGINE & PHYSICS
   Motor de física, proyección 3D pseudo, colisiones y spawner
   ============================================================ */

var W = 0, H = 0, cx = 0, horizon = 0, groundY = 0, unit = 0;
var F = 280, ZFAR = 44, PN = F / (F + ZFAR);

function sx(x, p) { return cx + (x - camX) * unit * p; }
function sy(p) { return horizon + (groundY - horizon) * p; }

function poly(pts, fill) {
  if (pts.length < 3) return;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
}

function rr(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

// Sistema de partículas y textos flotantes
var particles = [], floaters = [];

function emit(x, y, n, opt) {
  if (reduce) return;
  for (var i = 0; i < n; i++) {
    var a = opt.a !== undefined ? opt.a + (Math.random() - 0.5) * (opt.spr || 0) : Math.random() * Math.PI * 2;
    var s = (opt.s || 100) * (0.5 + Math.random() * 0.8);
    particles.push({
      x: x, y: y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - (opt.up || 0),
      g: opt.g !== undefined ? opt.g : 400,
      life: opt.l || 0.6, maxLife: opt.l || 0.6,
      r: opt.r || 3, c: opt.c || '#ffd23f'
    });
  }
}

function floater(txt, x, y, col) {
  floaters.push({ t: txt, x: x, y: y, life: 1.0, col: col || '#ffd23f' });
}

function stepFx(dt) {
  for (var i = particles.length - 1; i >= 0; i--) {
    var p = particles[i];
    p.life -= dt;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += p.g * dt;
  }
  for (var j = floaters.length - 1; j >= 0; j--) {
    var f = floaters[j];
    f.life -= dt;
    if (f.life <= 0) { floaters.splice(j, 1); continue; }
    f.y -= 38 * dt;
  }
}

// Jugador
var P = {
  lane: 0, x: 0, y: 0, vy: 0,
  slide: 0, inv: 0, jumpBuf: 0,
  onTrain: false, run: 0
};

function jump() {
  if (state !== 'play') return;
  var onSurface = (P.y <= 0.08) || (P.onTrain && P.y <= 1.98);
  if (onSurface || P.jumpBuf > 0) {
    var jumpPower = pw.sneakers > 0 ? 20.5 : 15.5;
    P.vy = jumpPower;
    P.jumpBuf = 0;
    P.slide = 0;
    sfx('jump');
    emit(sx(P.x, 1), groundY - P.y * unit, 6, { s: 80, up: 40, g: 200, l: 0.3, r: 2.5, c: '#ffd23f' });
  } else {
    P.jumpBuf = 0.2;
  }
}

function slide() {
  if (state !== 'play') return;
  if (P.y > (P.onTrain ? 1.95 : 0.05)) {
    P.vy = -34; // Inmersión rápida (fast-fall dive) en el aire como en Subway Surfers
  }
  P.slide = 0.75;
  sfx('slide');
}

function moveLane(d) {
  if (state !== 'play') return;
  P.lane = clamp(P.lane + d, -1, 1);
  sfx('tap');
}

function activateHoverboard() {
  if (state !== 'play') return;
  if (pw.shield > 0) return;
  var curBoards = totalBoards;
  if (curBoards > 0) {
    totalBoards = Math.max(0, curBoards - 1);
    try { localStorage.setItem('subwaydev-totalboards', String(totalBoards)); } catch (e) {}
    pw.shield = 25.0;
    sfx('boardon');
    floater('¡HOVERBOARD ACTIVA!', sx(P.x, 1), groundY - (P.y + 1.2) * unit, '#00d2b4');
    emit(sx(P.x, 1), groundY - P.y * unit, 25, { s: 200, up: 80, g: 0, l: 0.5, r: 3.5, c: '#00d2b4' });
    toast('Hoverboard activada: ¡inmunidad total a un choque!', 2500);
  } else {
    toast('Sin Hoverboards. Consigue más en la Tienda con monedas o en cajas misteriosas.', 2500);
  }
}

// Entidades del mundo
var ents = [];
var spawnAcc = 0;
var farTrain = { x: -1, t: 3 };

function spawnRow(z, safe) {
  if (safe) return 8;
  var r = Math.random();
  var rowType = r < 0.4 ? 'trains' : (r < 0.65 ? 'barriers' : (r < 0.85 ? 'coins' : 'mix'));

  if (rowType === 'trains') {
    var lane = Math.floor(Math.random() * 3) - 1;
    var len = 8 + Math.floor(Math.random() * 6);
    ents.push({
      t: 'train',
      lane: lane,
      z: z,
      len: len,
      c: { f: pal.trainCol, s: '#1e293b' }
    });
    // Rampa antes del tren en ocasiones
    if (Math.random() < 0.45) {
      ents.push({ t: 'ramp', lane: lane, z: z - 2.5 });
    }
    // Monedas sobre el tren
    for (var zi = 1; zi < len - 1; zi += 1.6) {
      ents.push({ t: 'coin', lane: lane, z: z + zi, y: 2.1 });
    }
    return len + 4;
  } else if (rowType === 'barriers') {
    var bLane = Math.floor(Math.random() * 3) - 1;
    var isHigh = Math.random() < 0.5;
    ents.push({
      t: isHigh ? 'over' : 'bar',
      lane: bLane,
      z: z,
      req: isHigh ? 'slide' : 'jump'
    });
    return 6;
  } else if (rowType === 'coins') {
    var cLane = Math.floor(Math.random() * 3) - 1;
    var count = 4 + Math.floor(Math.random() * 4);
    for (var ci = 0; ci < count; ci++) {
      ents.push({ t: 'coin', lane: cLane, z: z + ci * 1.5, y: 0.2 });
    }
    return count * 1.5 + 4;
  } else {
    // Power-up, letra o caja misteriosa
    var pLane = Math.floor(Math.random() * 3) - 1;
    var pr = Math.random();
    if (pr < 0.35) {
      var pwKeys = ['jetpack', 'sneakers', 'magnet', 'x2'];
      var chosenPw = pwKeys[Math.floor(Math.random() * pwKeys.length)];
      ents.push({ t: 'pw', k: chosenPw, lane: pLane, z: z });
    } else if (pr < 0.6) {
      var uncollected = [];
      for (var w = 0; w < WORD.length; w++) if (!collectedLetters[w]) uncollected.push(w);
      if (uncollected.length > 0) {
        var pickW = uncollected[Math.floor(Math.random() * uncollected.length)];
        ents.push({ t: 'letter', char: WORD[pickW], idx: pickW, lane: pLane, z: z, y: 0.6 });
      }
    } else if (pr < 0.8) {
      ents.push({ t: 'box', lane: pLane, z: z });
    } else {
      // Token de estación del portafolio
      var nextSt = found.indexOf(false);
      if (nextSt !== -1) {
        ents.push({ t: 'token', idx: nextSt, lane: pLane, z: z });
      }
    }
    return 7;
  }
}

function crash(e) {
  e.ghost = true;
  var px = sx(P.x, 1), py = groundY - (P.y + 0.5) * unit;
  if (pw.shield > 0) {
    pw.shield = 0;
    P.inv = 1.3;
    sfx('shield');
    floater('¡HOVERBOARD ROTO!', px, py - unit * 0.6, '#00d2b4');
    emit(px, py, 28, { s: 260, g: 0, l: 0.5, r: 3.5, c: '#00d2b4' });
    return;
  }

  lives--;
  streak = 0;
  mult = 1;
  P.inv = 1.8;
  sfx('crash');
  freeze = 0.07;
  flash = 0.55;
  inspector.timer = 5.0;
  inspector.dist = 0.72;
  sfx('whistle');
  floater('¡EL INSPECTOR SE ACERCA!', px, py - unit * 1.6, '#ff3b30');
  if (!reduce) shake = 0.4;
  var col = e.c ? e.c.f : '#ff3b30';
  emit(px, py, 30, { s: 340, up: 150, g: 700, l: 0.7, r: 4, c: col });
  emit(px, py, 14, { s: 220, up: 100, g: 600, l: 0.6, r: 3, c: '#f4efe6' });
  if (lives <= 0) gameOver();
}

function world(dt, sp, safe) {
  spawnAcc -= sp * dt;
  while (spawnAcc <= 0) {
    var z = ZFAR + spawnAcc, len = spawnRow(z, safe);
    spawnAcc += len + 10 + sp * 0.3 + Math.random() * 3;
  }
  for (var i = 0; i < ents.length; i++) ents[i].z -= sp * dt;
}

function update(dt) {
  flash = Math.max(0, flash - dt * 2.5);
  if (shake > 0) shake = Math.max(0, shake - dt);
  if (state === 'card' || state === 'pause' || state === 'skins') return;
  if (freeze > 0) { freeze -= dt; return; }
  stepFx(dt);

  if (state === 'play' || state === 'start') {
    var sp = state === 'play' ? speed : 9;
    scroll += sp * dt;
    P.run += dt * (sp / 14);
  }
  camX = P.x * 0.45;

  farTrain.t -= dt;
  if (farTrain.t <= 0 && farTrain.x < 0) { farTrain.x = -0.6; farTrain.t = 0; }
  if (farTrain.x > -1) {
    farTrain.x += dt * 0.09;
    if (farTrain.x > 1.1) { farTrain.x = -1; farTrain.t = 14 + Math.random() * 14; }
  }

  if (state === 'start') {
    P.x += (0 - P.x) * Math.min(1, dt * 8);
    world(dt, 9, true);
    ents = ents.filter(function (e) { return e.z + (e.len || 0.5) > -8; });
    return;
  }

  if (state !== 'play') return;

  var base = Math.min(28, 14 + dist * 0.007);
  speed += (base - speed) * Math.min(1, dt * 1.5);
  dist += speed * dt;

  P.inv = Math.max(0, P.inv - dt);
  P.slide = Math.max(0, P.slide - dt);
  P.jumpBuf = Math.max(0, P.jumpBuf - dt);
  pw.magnet = Math.max(0, pw.magnet - dt);
  pw.x2 = Math.max(0, pw.x2 - dt);
  pw.shield = Math.max(0, pw.shield - dt);
  pw.jetpack = Math.max(0, pw.jetpack - dt);
  pw.sneakers = Math.max(0, pw.sneakers - dt);

  // Persecución del Inspector y su perro policía (al iniciar la carrera o tras tropezar)
  if (inspector.timer > 0) {
    inspector.timer -= dt;
    inspector.lane += (P.x - inspector.lane) * Math.min(1, dt * 8);
    var targetDist = 0.75 + (5.0 - inspector.timer) * 0.16;
    inspector.dist += (targetDist - inspector.dist) * Math.min(1, dt * 6);
    inspector.active = true;
  } else {
    inspector.dist += dt * 3.5;
    if (inspector.dist > 5.5) inspector.active = false;
  }

  // Movimiento lateral fluido y reactivo estilo Subway Surfers
  P.x += (P.lane - P.x) * Math.min(1, dt * 20);

  // Física vertical (Jetpack vs gravedad)
  if (pw.jetpack > 0) {
    P.y += (3.2 - P.y) * Math.min(1, dt * 6);
    P.vy = 0;
    P.onTrain = false;
  } else {
    P.vy -= 42 * dt; // Gravedad
    P.y += P.vy * dt;

    var floorY = P.onTrain ? 1.9 : 0;
    if (P.y <= floorY) {
      P.y = floorY;
      P.vy = 0;
    }
  }

  // Actualizar mundo y entidades
  world(dt, speed, false);

  // Colisiones y recogida
  var px = P.x, py = P.y;
  var trainOccupied = false;

  for (var i = ents.length - 1; i >= 0; i--) {
    var e = ents[i];

    // Recogida con Imán de Monedas
    if (e.t === 'coin' && pw.magnet > 0 && e.z > 0 && e.z < 18) {
      e.lane += (P.x - e.lane) * Math.min(1, dt * 12);
      e.y += ((P.y + 0.4) - e.y) * Math.min(1, dt * 12);
    }

    // Colisión con Trenes
    if (e.t === 'train') {
      var inZ = (e.z <= 0.6 && e.z + e.len >= -0.4);
      var inLane = Math.abs(px - e.lane) < 0.75;
      if (inZ && inLane) {
        if (py >= 1.85) {
          trainOccupied = true;
        } else if (P.inv <= 0 && !e.ghost) {
          crash(e);
        }
      }
    }

    // Colisión con Rampas
    if (e.t === 'ramp') {
      if (Math.abs(e.z) < 0.6 && Math.abs(px - e.lane) < 0.65) {
        P.y = Math.max(P.y, 1.9);
        P.vy = 12;
        sfx('jump');
        emit(sx(P.x, 1), groundY - P.y * unit, 8, { s: 120, up: 60, g: 300, l: 0.35, r: 2.8, c: '#ffd23f' });
      }
    }

    // Colisión con Barreras bajas / altas
    if (e.t === 'bar' && Math.abs(e.z) < 0.45 && Math.abs(px - e.lane) < 0.65) {
      if (P.y < 0.8 && P.inv <= 0 && !e.ghost) crash(e);
    }
    if (e.t === 'over' && Math.abs(e.z) < 0.45 && Math.abs(px - e.lane) < 0.65) {
      if (P.slide <= 0 && P.inv <= 0 && !e.ghost) crash(e);
    }

    // Recogida de Monedas
    if (e.t === 'coin' && Math.abs(e.z) < 0.6 && Math.abs(px - e.lane) < 0.65 && Math.abs(py - e.y) < 0.9) {
      coins++;
      sfx('coin');
      emit(sx(e.lane, 1), groundY - (e.y + 0.4) * unit, 8, { s: 140, up: 50, g: 300, l: 0.35, r: 2.5, c: '#ffd23f' });
      ents.splice(i, 1);
      continue;
    }

    // Recogida de Power-ups
    if (e.t === 'pw' && Math.abs(e.z) < 0.6 && Math.abs(px - e.lane) < 0.65) {
      var k = e.k;
      pw[k] = PWDUR[k] || 8.0;
      sfx('power');
      floater(k.toUpperCase() + '!', sx(e.lane, 1), groundY - 1.2 * unit, PWCOL[k]);
      emit(sx(e.lane, 1), groundY - 1.0 * unit, 25, { s: 220, up: 80, g: 200, l: 0.6, r: 3.5, c: PWCOL[k] });
      ents.splice(i, 1);
      continue;
    }

    // Letra de la misión diaria
    if (e.t === 'letter' && Math.abs(e.z) < 0.6 && Math.abs(px - e.lane) < 0.65) {
      collectedLetters[e.idx] = true;
      sfx('token');
      floater('¡LETRA ' + e.char + '!', sx(e.lane, 1), groundY - 1.2 * unit, '#ffd23f');
      emit(sx(e.lane, 1), groundY - 1.0 * unit, 20, { s: 200, up: 60, g: 150, l: 0.5, r: 3, c: '#ffd23f' });
      updateLetterBoxes();
      ents.splice(i, 1);
      continue;
    }

    // Token de Estación del Portafolio
    if (e.t === 'token' && Math.abs(e.z) < 0.6 && Math.abs(px - e.lane) < 0.65) {
      var sIdx = e.idx;
      found[sIdx] = true;
      refreshPips();
      sfx('token');
      openCard(sIdx);
      ents.splice(i, 1);
      continue;
    }

    // Caja Misteriosa
    if (e.t === 'box' && Math.abs(e.z) < 0.6 && Math.abs(px - e.lane) < 0.65) {
      sfx('token');
      var rPrize = Math.random();
      if (rPrize < 0.5) {
        var gCoins = 100 + Math.floor(Math.random() * 200);
        coins += gCoins;
        floater('+' + gCoins + ' 🪙', sx(e.lane, 1), groundY - 1.2 * unit, '#ffd23f');
      } else if (rPrize < 0.8) {
        totalBoards += 2;
        floater('+2 🛹', sx(e.lane, 1), groundY - 1.2 * unit, '#00d2b4');
      } else {
        totalKeys += 2;
        floater('+2 🔑', sx(e.lane, 1), groundY - 1.2 * unit, '#38bdf8');
      }
      ents.splice(i, 1);
      continue;
    }

    // Eliminar entidades que quedaron atrás
    if (e.z + (e.len || 0.5) < -8) {
      ents.splice(i, 1);
    }
  }

  P.onTrain = trainOccupied;
}

function reset() {
  P.lane = 0; P.x = 0; P.y = 0; P.vy = 0; P.slide = 0; P.inv = 0; P.jumpBuf = 0; P.onTrain = false; P.run = 0;
  dist = 0; speed = 14; coins = 0; mult = 1; streak = 0; lives = 1;
  pw.magnet = 0; pw.x2 = 0; pw.shield = 0; pw.jetpack = 0; pw.sneakers = 0;
  inspector.active = true; inspector.dist = 0.9; inspector.lane = 0; inspector.timer = 5.0;
  ents = []; spawnAcc = 0; particles = []; floaters = [];
  collectedLetters = [false, false, false, false, false];
  updateLetterBoxes();
}
