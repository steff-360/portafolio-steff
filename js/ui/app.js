/* ============================================================
   CAPA DE UI: APP CONTROLLER & MAIN LOOP
   Orquestación principal, ciclo de vida del juego, entrada y HUD
   ============================================================ */

var cv = null, ctx = null;
var lastTapTime = 0;

function refreshStart() {
  renderSS();
  var bEl = $('bestLine');
  if (bEl) bEl.textContent = best ? 'Récord: ' + best + ' puntos' : '';
}

function updateLetterBoxes() {
  var row = $('wordHuntRow');
  if (!row) return;
  row.innerHTML = '';
  for (var w = 0; w < WORD.length; w++) {
    var b = document.createElement('span');
    b.className = 'word-box' + (collectedLetters[w] ? ' on' : '');
    b.textContent = WORD[w];
    row.appendChild(b);
  }
}

function startGame() {
  reset();
  state = 'play';
  showFor('play');
  blurAll();
  musicStart();
  sfx('whistle');
  if (firstRun) {
    firstRun = false;
    toast('¡Cuidado con el Inspector! Sube a los trenes, vuela con el Jetpack y usa la patineta con Doble Tap o tecla H.', 4500);
  }
}

function pauseGame() {
  if (state !== 'play') return;
  state = 'pause';
  showFor('pause');
  musicStop();
  blurAll();
}

function resumeGame() {
  if (state !== 'pause') return;
  state = 'play';
  showFor('play');
  musicStart();
  blurAll();
}

function gameOver() {
  state = 'over';
  musicStop();
  sfx('whistle');
  inspector.active = true;
  inspector.dist = 0.22;
  inspector.lane = P.lane + 0.35;
  inspector.timer = 20;

  totalCoins += coins;
  try { localStorage.setItem('subwaydev-totalcoins', String(totalCoins)); } catch (e) {}

  var sc = score(), isBest = sc > best;
  if (isBest) {
    best = sc;
    try { localStorage.setItem('subwaydev-best', String(best)); } catch (e) {}
  }
  var n = found.filter(Boolean).length;
  if (n > storedUnlock) {
    storedUnlock = n;
    try { localStorage.setItem('subwaydev-unlock', String(n)); } catch (e) {}
  }

  if ($('newBest')) $('newBest').hidden = !isBest;
  if ($('overStats')) {
    $('overStats').innerHTML = sc + ' puntos<br>' + Math.floor(dist) + ' m · ' + coins + ' monedas · ' + n + '/4 paradas<br>Récord ' + best;
  }
  showFor('over');
}

// -------------------------------------------------------------
// TARJETA DE ESTACIÓN / TICKET DEL PORTAFOLIO
// -------------------------------------------------------------
function renderCard() {
  var s = cardIdx === 4 ? { k: 'Línea completa', title: 'Portafolio Completo', html: finaleHtml() } : SECTIONS[cardIdx];
  var foot = '';
  if (cardMode === 'play') {
    foot = '<button class="btn primary" data-act="close" type="button">Seguir corriendo</button>';
  } else {
    foot = '<button class="btn" data-act="prev" type="button"' + (cardIdx === 0 ? ' disabled' : '') + '>Anterior</button>' +
           '<button class="btn" data-act="next" type="button"' + (cardIdx === 3 ? ' disabled' : '') + '>Siguiente</button>' +
           '<button class="btn primary" data-act="close" type="button">Cerrar</button>';
  }
  $('card').innerHTML =
    '<div class="ticket" role="dialog" aria-label="' + s.k + '" data-n="' + (cardIdx === 4 ? '★' : cardIdx + 1) + '">' +
    '<div class="t-head"><span>' + (cardIdx === 4 ? 'Fin del recorrido' : 'Estación ' + (cardIdx + 1) + ' de 4') + '</span><span>' + s.k + '</span></div>' +
    '<div class="t-body"><h2>' + s.title + '</h2>' + s.html + '</div>' +
    '<div class="t-foot">' + foot + '</div></div>';
}

function openCard(i) {
  cardIdx = i;
  if (state !== 'card') {
    prevState = state;
    cardMode = prevState === 'play' ? 'play' : 'read';
  }
  state = 'card';
  showFor('card');
  renderCard();
  blurAll();
}

function step(d) {
  var n = cardIdx + d;
  if (n >= 0 && n <= 3) {
    cardIdx = n;
    renderCard();
  }
}

function closeCard() {
  if (cardMode === 'play') {
    if (found.every(Boolean) && !celebrated) {
      celebrated = true;
      cardIdx = 4;
      renderCard();
      emit(cx, H * 0.4, 40, { s: 260, up: 160, g: 300, l: 1.2, r: 4, c: '#ffd23f' });
      return;
    }
    state = 'play';
    showFor('play');
    P.inv = Math.max(P.inv, 1.0);
    blurAll();
  } else {
    state = prevState;
    showFor(state);
    if (state === 'start') refreshStart();
  }
}

var pipBtns = [];
function initPips() {
  var pipsEl = $('pips');
  if (!pipsEl) return;
  pipsEl.innerHTML = '';
  pipBtns = [];
  SECTIONS.forEach(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'pip';
    b.setAttribute('aria-label', 'Estación ' + (i + 1) + ': ' + s.k);
    b.innerHTML = '<span class="n">' + (i + 1) + '</span><span class="full">' + s.k + '</span>';
    b.addEventListener('click', function () {
      b.blur();
      if (state !== 'play') return;
      if (found[i]) openCard(i);
      else toast('Aún no desbloqueas esta estación. ¡Sigue surfeando las vías!', 2400);
    });
    pipsEl.appendChild(b);
    pipBtns.push(b);
  });
}

function refreshPips() {
  pipBtns.forEach(function (b, i) { b.classList.toggle('on', found[i]); });
}

// -------------------------------------------------------------
// CONTROLADORES DE ENTRADA (TECLADO & TOUCH SWIPE)
// -------------------------------------------------------------
function initInputListeners() {
  window.addEventListener('keydown', function (e) {
    var k = e.key;
    if (e.target && e.target.closest && e.target.closest('button') && (k === 'Enter' || k === ' ')) return;
    if (state === 'play') {
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') moveLane(-1);
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') moveLane(1);
      else if (k === 'ArrowUp' || k === 'w' || k === 'W' || k === ' ') jump();
      else if (k === 'ArrowDown' || k === 's' || k === 'S') slide();
      else if (k === 'h' || k === 'H') activateHoverboard();
      else if (k === 'p' || k === 'P' || k === 'Escape') pauseGame();
      else return;
      e.preventDefault();
    } else if (state === 'pause') {
      if (k === 'p' || k === 'P' || k === 'Escape' || k === 'Enter' || k === ' ') { e.preventDefault(); resumeGame(); }
    } else if (state === 'start' || state === 'over') {
      if (k === 'Enter' || k === ' ') { e.preventDefault(); startGame(); }
    } else if (state === 'card') {
      if (k === 'Escape' || k === 'Enter' || k === ' ') { e.preventDefault(); closeCard(); }
      else if (cardMode === 'read' && k === 'ArrowRight') step(1);
      else if (cardMode === 'read' && k === 'ArrowLeft') step(-1);
    } else if (state === 'skins') {
      if (k === 'Escape' || k === 'Enter' || k === ' ') { e.preventDefault(); closeSkins(); }
    }
  });

  var x0 = 0, y0 = 0, swiping = false;
  cv.addEventListener('pointerdown', function (e) {
    x0 = e.clientX; y0 = e.clientY; swiping = true;
    var now = performance.now();
    if (now - lastTapTime < 280) { activateHoverboard(); }
    lastTapTime = now;
    try { cv.setPointerCapture(e.pointerId); } catch (er) {}
  });

  cv.addEventListener('pointermove', function (e) {
    if (!swiping || state !== 'play') return;
    var dx = e.clientX - x0, dy = e.clientY - y0;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      moveLane(dx > 0 ? 1 : -1);
    } else if (dy < 0) {
      jump();
    } else {
      slide();
    }
    // Reanclar coordenadas para permitir encadenar swipes seguidos con fluidez
    x0 = e.clientX;
    y0 = e.clientY;
  });

  cv.addEventListener('pointerup', function () { swiping = false; });
  cv.addEventListener('pointercancel', function () { swiping = false; });

  // Botones de interfaz
  $('play').addEventListener('click', startGame);
  $('again').addEventListener('click', function () { startGame(); });
  $('read').addEventListener('click', function () { openCard(0); });
  $('readOver').addEventListener('click', function () { openCard(0); });
  $('openSkinsBtn').addEventListener('click', openSkins);
  $('openSkinsOver').addEventListener('click', openSkins);
  $('hudSkinsBtn').addEventListener('click', function () {
    if (state === 'play') pauseGame();
    openSkins();
  });
  $('pauseBtn').addEventListener('click', function () {
    if (state === 'play') pauseGame();
    else if (state === 'pause') resumeGame();
  });
  $('todBtn').addEventListener('click', toggleTOD);
  $('resume').addEventListener('click', resumeGame);
  $('boardTrigger').addEventListener('click', activateHoverboard);

  $('card').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b || b.disabled) return;
    var a = b.getAttribute('data-act');
    if (a === 'close') closeCard();
    else if (a === 'prev') step(-1);
    else if (a === 'next') step(1);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pauseGame();
  });
}

// -------------------------------------------------------------
// RENDERIZADO PRINCIPAL
// -------------------------------------------------------------
function draw() {
  ctx.save();
  if (shake > 0) {
    var sk = shake * 9;
    ctx.translate((Math.random() - 0.5) * sk, (Math.random() - 0.5) * sk);
  }

  drawBG();
  drawTrack();

  // Ordenar entidades por profundidad (delante del runner y detrás)
  var far = ents.filter(function (e) { return e.z >= 0; }).sort(function (a, b) { return b.z - a.z; });
  var near = ents.filter(function (e) { return e.z < 0; }).sort(function (a, b) { return b.z - a.z; });

  far.forEach(drawEnt);
  drawPlayer();
  drawInspector();
  near.forEach(drawEnt);
  drawSpeedLines();
  drawFx();

  if (flash > 0) {
    ctx.fillStyle = 'rgba(255, 59, 48, ' + (flash * 0.4) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

function updateHUD() {
  if ($('scoreVal')) $('scoreVal').textContent = score();
  if ($('coinsVal')) $('coinsVal').textContent = coins;
  if ($('distVal')) $('distVal').textContent = Math.floor(dist) + 'm';
  if ($('boardVal')) $('boardVal').textContent = totalBoards;

  // Letras de la misión diaria
  var missionText = collectedLetters.filter(Boolean).length + '/5';
  if ($('wordHuntCount')) $('wordHuntCount').textContent = missionText;

  // Power-up badges activos
  var pwTray = $('pwTray');
  if (pwTray) {
    var pwHtml = '';
    if (pw.shield > 0) pwHtml += '<span class="pw-badge" style="background:#00d2b4;color:#0b1319">🛹 ' + Math.ceil(pw.shield) + 's</span>';
    if (pw.jetpack > 0) pwHtml += '<span class="pw-badge" style="background:#a855f7;color:#ffffff">🚀 ' + Math.ceil(pw.jetpack) + 's</span>';
    if (pw.sneakers > 0) pwHtml += '<span class="pw-badge" style="background:#ff9100;color:#0b1319">👟 ' + Math.ceil(pw.sneakers) + 's</span>';
    if (pw.magnet > 0) pwHtml += '<span class="pw-badge" style="background:#ff6b4a;color:#ffffff">🧲 ' + Math.ceil(pw.magnet) + 's</span>';
    if (pw.x2 > 0) pwHtml += '<span class="pw-badge" style="background:#ffd23f;color:#0b1319">⭐x2 ' + Math.ceil(pw.x2) + 's</span>';
    pwTray.innerHTML = pwHtml;
  }
}

var lastTime = 0;
function loop(ts) {
  if (!lastTime) lastTime = ts;
  var dt = Math.min(0.06, (ts - lastTime) * 0.001);
  lastTime = ts;
  time += dt;

  update(dt);
  draw();
  if (state === 'play') updateHUD();

  requestAnimationFrame(loop);
}

function resize() {
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  W = window.innerWidth;
  H = window.innerHeight;
  cv.width = W * dpr;
  cv.height = H * dpr;
  cv.style.width = W + 'px';
  cv.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  cx = W * 0.5;
  horizon = H * 0.44;
  groundY = H * 0.88;
  unit = Math.min(W, H) * 0.42;

  // Canvas del vestidor
  var scCv = $('ssCharCanvas');
  if (scCv) {
    var scDpr = Math.min(2, window.devicePixelRatio || 1);
    scCv.width = 280 * scDpr;
    scCv.height = 340 * scDpr;
    scCv.style.width = '280px';
    scCv.style.height = '340px';
    var sctx = scCv.getContext('2d');
    sctx.setTransform(scDpr, 0, 0, scDpr, 0, 0);
  }
}

// -------------------------------------------------------------
// INICIALIZACIÓN DE LA APLICACIÓN
// -------------------------------------------------------------
window.addEventListener('DOMContentLoaded', function () {
  cv = $('game');
  if (!cv) return;
  ctx = cv.getContext('2d');

  window.addEventListener('resize', resize);
  resize();

  initPips();
  refreshPips();
  refreshStart();
  updateLetterBoxes();
  updateTODButton();

  initWardrobeListeners();
  initInputListeners();

  requestAnimationFrame(loop);
});
