/*
 * Pill management, ambient audio, glitch effects, and environmental evolution
 * for the net-art hypertext "Life Review".
 *
 * Pills left persists in localStorage across pages.
 * Story begins with 7 pills; each consumed pill reveals a memory and shifts
 * the environment — warmer frame glow, richer drone, more intense glitches.
 */

// ── Pill state ──────────────────────────────────────────────────────────────

function getPillsLeft() {
  const stored = localStorage.getItem('pills_left');
  if (stored === null) {
    localStorage.setItem('pills_left', '7');
    return 7;
  }
  return parseInt(stored, 10);
}

function setPillsLeft(n) {
  localStorage.setItem('pills_left', String(n));
}

function getPillsTaken() {
  return 7 - getPillsLeft();
}

// ── Counter ─────────────────────────────────────────────────────────────────

function updateCounter() {
  const counter = document.getElementById('counter');
  if (!counter) return;
  const left = getPillsLeft();
  counter.textContent = `${left} pill${left === 1 ? '' : 's'} left`;
  if (left <= 3) counter.classList.add('urgent');
  else counter.classList.remove('urgent');
}

// ── Environment: frame warmth grows with each pill taken ────────────────────

function updateEnvironment() {
  const taken = getPillsTaken();
  const ratio = taken / 7;
  const frame = document.querySelector('.frame');
  if (!frame) return;

  // Interpolate border and glow from cold blue-grey → warm amber
  const r = Math.round(255 * ratio);
  const g = Math.round(160 * ratio);
  const b = Math.round(40  * ratio);
  const borderAlpha = 0.15 + ratio * 0.35;
  const glowRadius  = Math.round(ratio * 70);
  const glowAlpha   = ratio * 0.28;

  frame.style.borderColor = `rgba(${r},${g},${b},${borderAlpha})`;
  frame.style.boxShadow   =
    `0 0 20px rgba(0,0,0,0.4), 0 0 ${glowRadius}px rgba(${r},${g},${b},${glowAlpha})`;
}

// ── Glitch overlay ───────────────────────────────────────────────────────────

function _ensureGlitchLayer() {
  if (document.getElementById('glitch-layer')) return;
  const el = document.createElement('div');
  el.id = 'glitch-layer';
  document.body.appendChild(el);
}

function applyGlitch(duration) {
  duration = duration || 500;
  _ensureGlitchLayer();
  const layer = document.getElementById('glitch-layer');
  layer.classList.remove('active');
  void layer.offsetWidth; // force reflow to restart animation
  layer.classList.add('active');
  setTimeout(() => layer.classList.remove('active'), duration);
}

function _glitchHeading() {
  const h2 = document.querySelector('h2');
  if (!h2) return;
  h2.classList.remove('glitching');
  void h2.offsetWidth;
  h2.classList.add('glitching');
  setTimeout(() => h2.classList.remove('glitching'), 700);
}

// ── Ambient drone (Web Audio API, no external files) ────────────────────────

let _ctx  = null;
let _master = null;
let _oscNodes = [];

function _initAudio() {
  if (_ctx) return;
  try {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
    _master = _ctx.createGain();
    _master.gain.setValueAtTime(0, _ctx.currentTime);
    _master.connect(_ctx.destination);
    _startDrone();
  } catch (e) { /* audio not available */ }
}

function _startDrone() {
  if (!_ctx) return;
  const taken = getPillsTaken();
  if (taken === 0) return;

  // Each layer is unlocked by one more pill taken
  const base = 55; // Hz — a low A
  const layers = [
    { freq: base,        type: 'sine',     gain: 0.10 },
    { freq: base * 1.5,  type: 'sine',     gain: 0.06 },
    { freq: base * 2,    type: 'sine',     gain: 0.04 },
    { freq: base * 0.5,  type: 'sine',     gain: 0.07 },
    { freq: base * 3,    type: 'triangle', gain: 0.025 },
    { freq: base * 4,    type: 'triangle', gain: 0.015 },
    { freq: base * 5,    type: 'sine',     gain: 0.010 },
  ];

  layers.slice(0, taken).forEach(function(layer, i) {
    var osc = _ctx.createOscillator();
    var g   = _ctx.createGain();
    osc.type = layer.type;
    osc.frequency.setValueAtTime(layer.freq, _ctx.currentTime);
    // Slight slow vibrato per layer
    osc.frequency.setValueAtTime(layer.freq * 1.001, _ctx.currentTime + 3 + i);
    osc.frequency.setValueAtTime(layer.freq,          _ctx.currentTime + 6 + i);
    g.gain.setValueAtTime(layer.gain, _ctx.currentTime);
    osc.connect(g);
    g.connect(_master);
    osc.start();
    _oscNodes.push(osc);
  });

  // Gentle fade-in over 2.5 s
  _master.gain.linearRampToValueAtTime(0.18, _ctx.currentTime + 2.5);
}

// ── Story navigation ─────────────────────────────────────────────────────────

function takePill(memoryPage) {
  _initAudio(); // click IS a user gesture — safe to init here

  let left = getPillsLeft();
  if (left <= 0) {
    window.location.href = 'empty.html';
    return;
  }

  left -= 1;
  setPillsLeft(left);
  updateCounter();
  updateEnvironment();
  applyGlitch(500);

  setTimeout(function() {
    window.location.href = memoryPage;
  }, 420);
}

function resetStory() {
  setPillsLeft(7);
  window.location.href = 'index.html';
}

function returnToCorridor(page) {
  window.location.href = page;
}

// ── Hidden page: triple-click the counter ────────────────────────────────────

var _counterClicks = 0;
var _counterTimer  = null;

function _setupCounterSecret() {
  var counter = document.getElementById('counter');
  if (!counter) return;
  counter.addEventListener('click', function() {
    _counterClicks++;
    clearTimeout(_counterTimer);
    _counterTimer = setTimeout(function() { _counterClicks = 0; }, 700);
    if (_counterClicks >= 3) {
      _counterClicks = 0;
      applyGlitch(900);
      setTimeout(function() { window.location.href = 'hidden.html'; }, 500);
    }
  });
}

// ── Initialise on page load ──────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', function() {
  _ensureGlitchLayer();
  updateCounter();
  updateEnvironment();
  _setupCounterSecret();

  // On memory pages, briefly glitch the heading to signal the pill's effect
  if (document.title.startsWith('Memory:')) {
    setTimeout(_glitchHeading, 200);
  }

  // Start audio on the first click of any kind (browser gesture requirement)
  document.addEventListener('click', function() { _initAudio(); }, { once: true });
});
