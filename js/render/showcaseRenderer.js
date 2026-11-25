/* ============================================================
   CAPA DE RENDERIZADO: SHOWCASE RENDERER
   Renderizado 3D de alta definición en el vestidor con animación idle
   ============================================================ */

var scAnimId = null;

function drawShowcaseChar(sctx, cObj, oObj, t) {
  var cw = 280, ch = 340;
  sctx.clearRect(0, 0, cw, ch);

  var cx = cw * 0.5;
  var baseY = ch * 0.85;
  var S = 120; // Escala grande para detalle de vestidor

  // 1. Sombra ovalada 3D del podio en el suelo
  var sBreath = Math.sin(t * 2.5) * 0.03;
  sctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
  sctx.beginPath();
  sctx.ellipse(cx, baseY + 4, 0.42 * S * (1 + sBreath), 0.11 * S, 0, 0, Math.PI * 2);
  sctx.fill();

  sctx.save();
  sctx.translate(cx, baseY);

  // Respiración idle suave y cambio sutil de peso en reposo
  var breathY = Math.sin(t * 2.5) * 3;
  var headBob = Math.sin(t * 2.5 + 0.5) * 1.5;
  var weightShift = Math.sin(t * 1.5) * 0.02;
  sctx.rotate(weightShift);

  // 2. PIERNAS Y PANTALONES (Jeans marrones estilo Subway Surfers)
  var pantsCol = oObj.pants || (oObj.star ? '#854d0e' : '#1e293b');
  sctx.fillStyle = pantsCol;
  // Pierna izquierda
  sctx.beginPath();
  sctx.roundRect(-0.24 * S, -0.52 * S + breathY * 0.3, 0.16 * S, 0.52 * S, 6);
  sctx.fill();
  // Pierna derecha
  sctx.beginPath();
  sctx.roundRect(0.08 * S, -0.52 * S + breathY * 0.3, 0.16 * S, 0.52 * S, 6);
  sctx.fill();

  // Cinturón / doblez inferior
  sctx.fillStyle = oObj.star ? '#713f12' : '#334155';
  sctx.fillRect(-0.24 * S, -0.05 * S, 0.16 * S, 0.05 * S);
  sctx.fillRect(0.08 * S, -0.05 * S, 0.16 * S, 0.05 * S);

  // 3. ZAPATILLAS AUTÉNTICAS (Chunky Skate Sneakers)
  var shoeCol = oObj.s || '#dc2626';
  [-0.16 * S, 0.16 * S].forEach(function (sxPos, idx) {
    sctx.save();
    sctx.translate(sxPos, 0);
    // Suela blanca gruesa
    sctx.fillStyle = '#ffffff';
    sctx.beginPath();
    sctx.roundRect(-0.13 * S, -0.06 * S, 0.26 * S, 0.08 * S, 4);
    sctx.fill();
    // Línea de goma inferior
    sctx.fillStyle = '#cbd5e1';
    sctx.fillRect(-0.12 * S, 0.01 * S, 0.24 * S, 0.012 * S);
    // Cuerpo de la zapatilla
    sctx.fillStyle = shoeCol;
    sctx.beginPath();
    sctx.roundRect(-0.12 * S, -0.15 * S, 0.24 * S, 0.11 * S, 6);
    sctx.fill();
    // Puntera redondeada
    sctx.fillStyle = '#f8fafc';
    sctx.beginPath();
    sctx.arc(idx === 0 ? -0.08 * S : 0.08 * S, -0.08 * S, 0.05 * S, 0, Math.PI * 2);
    sctx.fill();
    // Cordones
    sctx.fillStyle = '#ffffff';
    sctx.fillRect(-0.04 * S, -0.14 * S, 0.08 * S, 0.02 * S);
    sctx.fillRect(-0.03 * S, -0.11 * S, 0.06 * S, 0.02 * S);
    // Acento dorado en Star Outfit
    if (oObj.star) {
      sctx.fillStyle = '#facc15';
      sctx.fillRect(-0.08 * S, -0.11 * S, 0.04 * S, 0.02 * S);
    }
    sctx.restore();
  });

  // 4. TORSO Y SUDADERA 3D (Hoodie roja)
  sctx.save();
  sctx.translate(0, breathY);

  sctx.fillStyle = oObj.b || '#dc2626';
  sctx.beginPath();
  sctx.roundRect(-0.32 * S, -1.02 * S, 0.64 * S, 0.54 * S, 12);
  sctx.fill();

  // CHALECO DENIM AZUL CON ESTRELLA EN EL PECHO (STAR OUTFIT)
  if (oObj.star) {
    sctx.fillStyle = '#2563eb';
    sctx.beginPath();
    sctx.roundRect(-0.28 * S, -1.0 * S, 0.56 * S, 0.48 * S, 8);
    sctx.fill();

    // Costuras del chaleco y solapas
    sctx.fillStyle = '#1d4ed8';
    sctx.fillRect(-0.08 * S, -1.0 * S, 0.16 * S, 0.35 * S);

    // ESTRELLA DORADA EN EL PECHO
    sctx.fillStyle = '#facc15';
    sctx.font = '800 ' + (0.24 * S) + 'px sans-serif';
    sctx.textAlign = 'center'; sctx.textBaseline = 'middle';
    sctx.fillText('★', 0, -0.76 * S);
  } else {
    // Bolsillo canguro
    sctx.fillStyle = 'rgba(0,0,0,0.18)';
    sctx.beginPath();
    sctx.roundRect(-0.22 * S, -0.7 * S, 0.44 * S, 0.18 * S, 6);
    sctx.fill();
  }

  // Cuello y cordones de sudadera
  sctx.strokeStyle = '#ffffff';
  sctx.lineWidth = 2.5;
  sctx.beginPath();
  sctx.moveTo(-0.08 * S, -0.98 * S); sctx.lineTo(-0.08 * S, -0.78 * S);
  sctx.moveTo(0.08 * S, -0.98 * S); sctx.lineTo(0.08 * S, -0.78 * S);
  sctx.stroke();

  // BRAZOS Y MANOS EN POSICIÓN DE SKATER
  sctx.fillStyle = oObj.b || '#dc2626';
  // Brazo izquierdo
  sctx.beginPath();
  sctx.roundRect(-0.46 * S, -0.98 * S, 0.15 * S, 0.44 * S, 8);
  sctx.fill();
  // Brazo derecho
  sctx.beginPath();
  sctx.roundRect(0.31 * S, -0.98 * S, 0.15 * S, 0.44 * S, 8);
  sctx.fill();
  // Manos
  sctx.fillStyle = '#f5cb9b';
  sctx.beginPath();
  sctx.arc(-0.38 * S, -0.52 * S, 0.07 * S, 0, Math.PI * 2);
  sctx.arc(0.38 * S, -0.52 * S, 0.07 * S, 0, Math.PI * 2);
  sctx.fill();

  sctx.restore(); // Termina torso

  // 5. CABEZA, ROSTRO, AURICULARES Y GORRA
  sctx.save();
  sctx.translate(0, breathY + headBob);

  // Cabeza con sombreado 3D
  var skinGrad = sctx.createRadialGradient(-0.06 * S, -1.22 * S, 0.05 * S, 0, -1.18 * S, 0.28 * S);
  skinGrad.addColorStop(0, '#fde68a');
  skinGrad.addColorStop(0.5, '#f5cb9b');
  skinGrad.addColorStop(1, '#e0a66d');
  sctx.fillStyle = skinGrad;
  sctx.beginPath();
  sctx.arc(0, -1.18 * S, 0.26 * S, 0, Math.PI * 2);
  sctx.fill();

  // Pelo
  sctx.fillStyle = oObj.hair || '#2c1810';
  sctx.beginPath();
  sctx.arc(-0.19 * S, -1.18 * S, 0.09 * S, 0, Math.PI * 2);
  sctx.arc(0.19 * S, -1.18 * S, 0.09 * S, 0, Math.PI * 2);
  sctx.fill();

  // AURICULARES DE DJ AMARILLOS (STAR OUTFIT / FRESH)
  if (oObj.headphones || oObj.star) {
    // Diadema superior
    sctx.strokeStyle = '#1e293b'; sctx.lineWidth = 4;
    sctx.beginPath();
    sctx.arc(0, -1.22 * S, 0.31 * S, Math.PI * 0.82, Math.PI * 0.18);
    sctx.stroke();

    // Almohadillas amarillas brillantes
    sctx.fillStyle = '#facc15';
    sctx.beginPath();
    sctx.roundRect(-0.32 * S, -1.24 * S, 0.09 * S, 0.18 * S, 6);
    sctx.roundRect(0.23 * S, -1.24 * S, 0.09 * S, 0.18 * S, 6);
    sctx.fill();
    sctx.fillStyle = '#1e293b';
    sctx.fillRect(-0.29 * S, -1.18 * S, 0.04 * S, 0.07 * S);
    sctx.fillRect(0.25 * S, -1.18 * S, 0.04 * S, 0.07 * S);
  }

  // GORRA HACIA ATRÁS 3D (Subway Surfers signature backwards cap)
  sctx.fillStyle = oObj.h || '#facc15';
  sctx.beginPath();
  sctx.roundRect(-0.26 * S, -1.42 * S, 0.52 * S, 0.25 * S, 12);
  sctx.fill();

  // Visera trasera plana (verde en Star Outfit)
  sctx.fillStyle = oObj.star ? '#16a34a' : (oObj.h || '#00d2b4');
  sctx.beginPath();
  sctx.roundRect(-0.38 * S, -1.32 * S, 0.22 * S, 0.07 * S, 4);
  sctx.fill();
  sctx.fillStyle = '#ffffff';
  sctx.fillRect(-0.37 * S, -1.28 * S, 0.2 * S, 0.02 * S);

  // Botón superior de la gorra
  sctx.fillStyle = oObj.star ? '#16a34a' : '#ffd23f';
  sctx.beginPath();
  sctx.arc(0, -1.43 * S, 0.04 * S, 0, Math.PI * 2);
  sctx.fill();

  // OJOS Y EXPRESIÓN VIVA (con parpadeo natural)
  var eyeY = -1.2 * S;
  var blinkCycle = (t * 0.8) % 4.0;
  var isBlinking = blinkCycle > 3.85;
  var eyeH = isBlinking ? 0.015 * S : 0.08 * S;

  sctx.fillStyle = '#ffffff';
  sctx.beginPath();
  sctx.ellipse(-0.09 * S, eyeY, 0.065 * S, eyeH, 0, 0, Math.PI * 2);
  sctx.ellipse(0.09 * S, eyeY, 0.065 * S, eyeH, 0, 0, Math.PI * 2);
  sctx.fill();

  if (!isBlinking) {
    // Iris
    sctx.fillStyle = oObj.id === 'cyber' ? '#00f0d0' : (oObj.id === 'terminal' ? '#10b981' : '#3d2010');
    sctx.beginPath();
    sctx.arc(-0.08 * S, eyeY, 0.044 * S, 0, Math.PI * 2);
    sctx.arc(0.1 * S, eyeY, 0.044 * S, 0, Math.PI * 2);
    sctx.fill();

    // Pupilas
    sctx.fillStyle = '#0f172a';
    sctx.beginPath();
    sctx.arc(-0.08 * S, eyeY, 0.028 * S, 0, Math.PI * 2);
    sctx.arc(0.1 * S, eyeY, 0.028 * S, 0, Math.PI * 2);
    sctx.fill();

    // Brillos en los ojos
    sctx.fillStyle = '#ffffff';
    sctx.beginPath();
    sctx.arc(-0.095 * S, eyeY - 0.02 * S, 0.016 * S, 0, Math.PI * 2);
    sctx.arc(0.085 * S, eyeY - 0.02 * S, 0.016 * S, 0, Math.PI * 2);
    sctx.fill();
  }

  // Cejas expresivas
  sctx.strokeStyle = '#2c1810'; sctx.lineWidth = 3;
  sctx.beginPath();
  sctx.moveTo(-0.16 * S, eyeY - 0.08 * S); sctx.lineTo(-0.04 * S, eyeY - 0.09 * S);
  sctx.moveTo(0.04 * S, eyeY - 0.09 * S); sctx.lineTo(0.16 * S, eyeY - 0.08 * S);
  sctx.stroke();

  // Sonrisa
  sctx.strokeStyle = '#b91c1c'; sctx.lineWidth = 3;
  sctx.beginPath();
  sctx.arc(0, -1.09 * S, 0.08 * S, 0.2 * Math.PI, 0.8 * Math.PI);
  sctx.stroke();

  sctx.restore(); // Termina cabeza
  sctx.restore(); // Termina personaje completo
}

function startShowcaseLoop() {
  stopShowcaseLoop();
  var canvas = $('ssCharCanvas');
  if (!canvas) return;
  var sctx = canvas.getContext('2d');
  var startTime = performance.now();

  function anim(ts) {
    var t = (ts - startTime) * 0.001;
    var cObj = CHARACTERS.find(function (c) { return c.id === selectedCharId; }) || CHARACTERS[0];
    var oObj = cObj.outfits.find(function (o) { return o.id === selectedOutfitId; }) || cObj.outfits[0];
    drawShowcaseChar(sctx, cObj, oObj, t);
    scAnimId = requestAnimationFrame(anim);
  }
  scAnimId = requestAnimationFrame(anim);
}

function stopShowcaseLoop() {
  if (scAnimId) {
    cancelAnimationFrame(scAnimId);
    scAnimId = null;
  }
}
