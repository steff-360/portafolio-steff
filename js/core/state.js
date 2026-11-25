/* ============================================================
   CAPA DEL NÚCLEO: STATE MANAGER
   Gestión del estado global, persistencia en localStorage y utilidades
   ============================================================ */

var $ = function (id) { return document.getElementById(id); };
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function rng(a, b) { return a + Math.random() * (b - a); }

// Estado del juego
var state = 'start', prevState = 'start';
var cardIdx = 0, cardMode = 'read';
var firstRun = true, celebrated = false;

// Estado de paradas del portafolio (4 estaciones)
var found = [false, false, false, false];
var storedUnlock = 0;
try { storedUnlock = parseInt(localStorage.getItem('subwaydev-unlock') || '0', 10); } catch (e) {}
function unlocked() { return Math.max(storedUnlock, found.filter(Boolean).length); }

// Recursos acumulados
var totalCoins = 0, totalKeys = 5, totalBoards = 3;
try {
  totalCoins = parseInt(localStorage.getItem('subwaydev-totalcoins') || '0', 10);
  totalKeys = parseInt(localStorage.getItem('subwaydev-totalkeys') || '15', 10);
  totalBoards = parseInt(localStorage.getItem('subwaydev-totalboards') || '5', 10);
} catch (e) {}

// Desbloqueos de la tienda
var unlockedChars = ['stefani', 'jake'];
var unlockedOutfits = ['star', 'classic', 'jake-star'];
var unlockedBoards = ['freestyler'];
var upgradeLevels = { jetpack: 1, sneakers: 1, magnet: 1, x2: 1 };
var claimedCollections = [];

try {
  var svC = localStorage.getItem('subwaydev-unlocked-chars');
  if (svC) unlockedChars = JSON.parse(svC);
  var svO = localStorage.getItem('subwaydev-unlocked-outfits');
  if (svO) unlockedOutfits = JSON.parse(svO);
  var svB = localStorage.getItem('subwaydev-unlocked-boards');
  if (svB) unlockedBoards = JSON.parse(svB);
  var svU = localStorage.getItem('subwaydev-upgrades');
  if (svU) upgradeLevels = JSON.parse(svU);
  var svCol = localStorage.getItem('subwaydev-claimed-col');
  if (svCol) claimedCollections = JSON.parse(svCol);
} catch (e) {}

// Selección actual
var activeCharId = 'stefani', activeOutfitId = 'star';
var activeBoardId = 'freestyler';
var selectedCharId = 'stefani', selectedOutfitId = 'star';
var activeSSTab = 'characters';

try {
  activeCharId = localStorage.getItem('subwaydev-char') || 'stefani';
  activeOutfitId = localStorage.getItem('subwaydev-outfit') || 'star';
  activeBoardId = localStorage.getItem('subwaydev-board') || 'freestyler';
  selectedCharId = activeCharId;
  selectedOutfitId = activeOutfitId;
} catch (e) {}

function getActiveOutfit() {
  var c = CHARACTERS.find(function (ch) { return ch.id === activeCharId; }) || CHARACTERS[0];
  return c.outfits.find(function (o) { return o.id === activeOutfitId; }) || c.outfits[0];
}

function refreshPWDUR() {
  PWDUR.jetpack = 7.5 + ((upgradeLevels.jetpack || 1) - 1) * 1.5;
  PWDUR.sneakers = 9.0 + ((upgradeLevels.sneakers || 1) - 1) * 1.8;
  PWDUR.magnet = 9.0 + ((upgradeLevels.magnet || 1) - 1) * 1.8;
  PWDUR.x2 = 10.0 + ((upgradeLevels.x2 || 1) - 1) * 2.0;
}
refreshPWDUR();

// Paleta de iluminación día/noche
var dayNight = 'day';
var pal = PALETTES.day;

function updateTODButton() {
  var btn = $('todBtn');
  if (!btn) return;
  btn.textContent = dayNight === 'day' ? '☀️ Día' : '🌙 Noche';
  btn.setAttribute('aria-label', 'Modo de iluminación: ' + (dayNight === 'day' ? 'Día' : 'Noche'));
}

function toggleTOD() {
  dayNight = dayNight === 'day' ? 'night' : 'day';
  pal = PALETTES[dayNight];
  updateTODButton();
  toast('Iluminación cambiada a ' + (dayNight === 'day' ? '☀️ Día soleado' : '🌙 Noche neón'), 1800);
}

// Variables de partida en carrera
var dist = 0, speed = 14, coins = 0, mult = 1, streak = 0, lives = 1, best = 0;
try { best = parseInt(localStorage.getItem('subwaydev-best') || '0', 10); } catch (e) {}
function score() { return Math.floor(dist * mult * 2) + coins * 60; }

// Power-ups activos
var pw = { magnet: 0, x2: 0, shield: 0, jetpack: 0, sneakers: 0 };

// Inspector del metro y perro
var inspector = { active: false, lane: 0, dist: 0.75, timer: 0 };

// Letras de la misión S-T-E-F-F
var WORD = ['S', 'T', 'E', 'F', 'F'];
var collectedLetters = [false, false, false, false, false];

// Efectos de cámara y pantalla
var flash = 0, shake = 0, freeze = 0, scroll = 0, time = 0, camX = 0;
var reduce = false;
try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

// Toast de notificación
var toastTimer = 0;
function toast(msg, ms) {
  var t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.hidden = true; }, ms || 3000);
}

function blurAll() {
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
}

function showFor(st) {
  var panels = ['start', 'pause', 'over', 'card', 'skinsModal'];
  panels.forEach(function (id) {
    var el = $(id);
    if (!el) return;
    if (id === 'skinsModal') {
      el.hidden = (st !== 'skins');
    } else {
      el.hidden = (st !== id);
    }
  });
  if ($('boardTrigger')) $('boardTrigger').hidden = (st !== 'play');
}
