/* ============================================================
   CAPA DE RENDERIZADO: TRACK RENDERER (ESTILO VÍA LIBRE 3D)
   Perspectiva pseudo-3D limpia, skyline determinista en capas,
   tren lejano elevado, carteles en perspectiva 3D y patio de vías
   ============================================================ */

// Generador determinista de edificios y estrellas (sin estática)
var _seed = 7;
function _rnd() { _seed = (_seed * 16807) % 2147483647; return _seed / 2147483647; }
function _makeBuild(minH, maxH, minW, maxW) {
  var arr = [], x = -0.02, i = 0;
  while (x < 1.05) {
    var w = minW + _rnd() * (maxW - minW);
    arr.push({ x: x, w: w, h: minH + _rnd() * (maxH - minH), i: i++ });
    x += w * 0.85;
  }
  return arr;
}
var BUILD1 = _makeBuild(0.02, 0.09, 0.03, 0.06);
var BUILD2 = _makeBuild(0.04, 0.15, 0.04, 0.1);
var STARS = [];
for (var _si = 0; _si < 50; _si++) {
  STARS.push({ x: _rnd(), y: _rnd() * 0.7, s: 0.6 + _rnd() * 1.2 });
}

function drawBG() {
  var g = ctx.createLinearGradient(0, 0, 0, horizon);
  g.addColorStop(0, pal.sky0);
  g.addColorStop(0.6, pal.sky1);
  g.addColorStop(1, pal.hor || pal.sky1);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, horizon + 1);

  // Estrellas suaves deterministas
  if (pal.star > 0.05) {
    ctx.fillStyle = 'rgba(244,239,230,.85)';
    for (var s = 0; s < STARS.length; s++) {
      var st = STARS[s], tw = 0.5 + 0.5 * Math.sin(time * 1.5 + s);
      ctx.globalAlpha = (0.2 + 0.6 * tw) * pal.star * (1 - st.y * 0.8);
      ctx.fillRect(st.x * W, st.y * horizon, st.s, st.s);
    }
    ctx.globalAlpha = 1;
  }

  // Resplandor radial cálido en el horizonte
  var hr = pal.hor_;
  var rg = ctx.createRadialGradient(cx, horizon, 0, cx, horizon, W * 0.62);
  rg.addColorStop(0, 'rgba(' + hr[0] + ',' + hr[1] + ',' + hr[2] + ',.6)');
  rg.addColorStop(1, 'rgba(' + hr[0] + ',' + hr[1] + ',' + hr[2] + ',0)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, W, horizon + 1);

  // Capa lejana de edificios
  drawSkyline(BUILD1, pal.bld2 || '#22323f', 3, 0.45);

  // Tren elevado lejano recorriendo el puente del skyline
  if (typeof farTrain !== 'undefined' && farTrain.x > -1) {
    var tx = farTrain.x * W, th = Math.max(4, H * 0.012), ty = horizon - H * 0.05;
    ctx.fillStyle = pal.bld || '#142029';
    ctx.fillRect(tx, ty, W * 0.5, th);
    ctx.fillStyle = 'rgba(255,210,100,.8)';
    for (var w = 0; w < 26; w++) {
      ctx.fillRect(tx + 6 + w * (W * 0.5 - 12) / 26, ty + th * 0.3, Math.max(2, W * 0.008), th * 0.4);
    }
  }

  // Capa cercana de edificios
  drawSkyline(BUILD2, pal.bld || '#142029', 7, 1);
}

function drawSkyline(arr, col, par, litK) {
  for (var b = 0; b < arr.length; b++) {
    var bd = arr[b], x = bd.x * W - camX * par, w = bd.w * W, h = bd.h * H;
    ctx.fillStyle = col;
    ctx.fillRect(x, horizon - h, w, h + 1);
    var cols = Math.max(1, Math.floor(w / 9)), rows = Math.max(1, Math.floor(h / 12));
    ctx.fillStyle = 'rgba(255,205,115,' + (0.35 + pal.lamp * 0.5) * litK + ')';
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if (((bd.i * 7 + r * 13 + c * 31) % 6) === 0) {
          ctx.fillRect(x + 4 + c * (w - 8) / cols, horizon - h + 6 + r * 12, 3, 4);
        }
      }
    }
  }
}

function drawBoards() {
  // Carteles laterales en perspectiva 3D real (transformada afín sobre postes)
  var off = scroll % 30, base = Math.floor(scroll / 30);
  for (var n = 0; n < 3; n++) {
    var z = n * 30 - off + 2, idx = base + n;
    if (z < 0.5 || z > ZFAR - 6) continue;
    var side = idx % 2 ? -1 : 1, z2 = z + 4;
    var p1 = F / (F + z), p2 = F / (F + z2), x = side * 3.7;
    var nx = sx(x, p1), fx = sx(x, p2), g1 = sy(p1), g2 = sy(p2);
    var yt1 = g1 - 3.1 * unit * p1, yb1 = g1 - 1.5 * unit * p1;
    var yt2 = g2 - 3.1 * unit * p2, yb2 = g2 - 1.5 * unit * p2;

    ctx.globalAlpha = Math.min(1, (ZFAR - z) / 22);
    ctx.fillStyle = '#0c141a';
    var la = F / (F + z + 0.7), lb = F / (F + z + 3.3);
    ctx.fillRect(sx(x, la) - Math.max(1, 0.05 * unit * la), sy(la) - 1.6 * unit * la, Math.max(2, 0.1 * unit * la), 1.6 * unit * la);
    ctx.fillRect(sx(x, lb) - Math.max(1, 0.05 * unit * lb), sy(lb) - 1.6 * unit * lb, Math.max(2, 0.1 * unit * lb), 1.6 * unit * lb);

    poly([[nx, yt1], [fx, yt2], [fx, yb2], [nx, yb1]], '#10202b');
    var Ls = nx < fx ? { x: nx, yt: yt1, yb: yb1 } : { x: fx, yt: yt2, yb: yb2 };
    var Rs = nx < fx ? { x: fx, yt: yt2, yb: yb2 } : { x: nx, yt: yt1, yb: yb1 };
    var wL = 260, hL = 100;
    var bd = CITY_DATA[((idx % CITY_DATA.length) + CITY_DATA.length) % CITY_DATA.length];

    ctx.save();
    ctx.transform((Rs.x - Ls.x) / wL, (Rs.yt - Ls.yt) / wL, 0, ((Ls.yb - Ls.yt) + (Rs.yb - Rs.yt)) / 2 / hL, Ls.x, Ls.yt);
    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, wL - 10, hL - 10);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f4efe6';
    ctx.font = '30px Bungee, Impact, sans-serif';
    ctx.fillText(bd[0], wL / 2, 40);
    ctx.fillStyle = '#ffd23f';
    ctx.font = '700 17px "Barlow Condensed", "Arial Narrow", sans-serif';
    ctx.fillText(bd[1].toUpperCase(), wL / 2, 74);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

function drawTrack() {
  // Terreno base limpio y atmosférico
  var g = ctx.createLinearGradient(0, horizon, 0, H);
  g.addColorStop(0, pal.g0);
  g.addColorStop(0.35, pal.g1);
  g.addColorStop(1, '#141b21');
  ctx.fillStyle = g;
  ctx.fillRect(0, horizon, W, H - horizon);

  var yN = sy(PN), i, z, p, y, s;

  // Balasto de las vías
  g = ctx.createLinearGradient(0, horizon, 0, H);
  g.addColorStop(0, '#7a655a');
  g.addColorStop(1, '#35302c');
  poly([[cx, horizon], [sx(1.55, PN), yN], [sx(-1.55, PN), yN]], g);

  // Líneas amarillas laterales de seguridad
  for (i = -1; i <= 1; i += 2) {
    poly([[cx, horizon], [sx(i * 1.55, PN), yN], [sx(i * 1.68, PN), yN]], 'rgba(255,210,63,.75)');
  }

  // Durmientes limpios y continuos hasta el horizonte (sin cortes bruscos)
  var off = scroll % 2;
  ctx.fillStyle = '#2a2420';
  for (z = -off; z < ZFAR; z += 2) {
    if (z < -1) continue;
    p = F / (F + z);
    y = sy(p);
    var sh = Math.max(1, 0.1 * unit * p);
    ctx.fillRect(sx(-1.5, p), y - sh, 3 * unit * p, sh);
  }

  // Rieles metálicos de acero en perspectiva (3 vías: -1, 0, +1)
  for (var l = -1; l <= 1; l++) {
    for (var o = -1; o <= 1; o += 2) {
      var x = l + o * 0.26;
      poly([[cx, horizon], [sx(x - 0.03, PN), yN], [sx(x + 0.03, PN), yN]], '#9aa7ae');
    }
  }

  // Farolas laterales con halo luminoso cálido
  var off2 = scroll % 10, la = 0.18 + pal.lamp * 0.5;
  for (z = -off2; z < ZFAR; z += 10) {
    if (z < -1.2) continue;
    p = F / (F + z);
    y = sy(p);
    for (s = -1; s <= 1; s += 2) {
      var px = sx(s * 2.6, p), top = y - 2.6 * unit * p, pw2 = Math.max(1, 0.06 * unit * p);
      ctx.fillStyle = '#0c141a';
      ctx.fillRect(px - pw2 / 2, top, pw2, y - top);
      var ax = px - s * 0.55 * unit * p;
      ctx.fillRect(Math.min(px, ax), top, Math.abs(ax - px), pw2);

      var gl = ctx.createRadialGradient(ax, top, 0, ax, top, 0.75 * unit * p);
      gl.addColorStop(0, 'rgba(255,210,100,' + la + ')');
      gl.addColorStop(1, 'rgba(255,210,100,0)');
      ctx.fillStyle = gl;
      ctx.beginPath();
      ctx.arc(ax, top, 0.75 * unit * p, 0, 6.283);
      ctx.fill();

      ctx.fillStyle = '#ffd23f';
      ctx.beginPath();
      ctx.arc(ax, top, Math.max(1, 0.08 * unit * p), 0, 6.283);
      ctx.fill();
    }
  }

  drawBoards();

  // Niebla atmosférica suave en el horizonte
  var hz = ctx.createLinearGradient(0, horizon, 0, horizon + H * 0.1), hr2 = pal.hor_;
  hz.addColorStop(0, 'rgba(' + hr2[0] + ',' + hr2[1] + ',' + hr2[2] + ',.3)');
  hz.addColorStop(1, 'rgba(' + hr2[0] + ',' + hr2[1] + ',' + hr2[2] + ',0)');
  ctx.fillStyle = hz;
  ctx.fillRect(0, horizon, W, H * 0.1);
}
