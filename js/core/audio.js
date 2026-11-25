/* ============================================================
   CAPA DEL NÚCLEO: AUDIO MANAGER (Web Audio API)
   Sintetizador de efectos retro arcade y música dinámica
   ============================================================ */

var actx = null;
var sfxOn = true, musicOn = true;
var musicNode = null, musicTimer = null;

function initAudio() {
  if (!actx) {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) actx = new AudioCtx();
  }
  if (actx && actx.state === 'suspended') actx.resume();
}

function sfx(n, k) {
  if (!sfxOn) return;
  initAudio();
  if (!actx) return;

  var now = actx.currentTime;
  var osc = actx.createOscillator();
  var gain = actx.createGain();
  osc.connect(gain);
  gain.connect(actx.destination);

  if (n === 'coin') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.start(now);
    osc.stop(now + 0.28);
  } else if (n === 'jump') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.15);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.start(now);
    osc.stop(now + 0.18);
  } else if (n === 'slide') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.22);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.start(now);
    osc.stop(now + 0.24);
  } else if (n === 'crash') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.35);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } else if (n === 'whistle') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.setValueAtTime(2400, now + 0.1);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.35);
  } else if (n === 'token') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.1);
    osc.frequency.setValueAtTime(783.99, now + 0.2);
    osc.frequency.setValueAtTime(1046.50, now + 0.3);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
    osc.start(now);
    osc.stop(now + 0.48);
  } else if (n === 'power') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.3);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.35);
  } else if (n === 'boardon') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.25);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (n === 'shield') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (n === 'tap') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

var notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
var noteIdx = 0;
function playMusicStep() {
  if (!musicOn || !actx) return;
  var now = actx.currentTime;
  var osc = actx.createOscillator();
  var gain = actx.createGain();
  osc.connect(gain);
  gain.connect(actx.destination);
  osc.type = 'triangle';
  var f = notes[noteIdx % notes.length];
  osc.frequency.setValueAtTime(f, now);
  gain.gain.setValueAtTime(0.045, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
  osc.start(now);
  osc.stop(now + 0.16);
  noteIdx = (noteIdx + 1) % notes.length;
}

function musicStart() {
  if (!musicOn || musicTimer) return;
  initAudio();
  musicTimer = setInterval(playMusicStep, 185);
}

function musicStop() {
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
}
