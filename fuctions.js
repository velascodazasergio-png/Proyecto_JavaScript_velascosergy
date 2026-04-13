/* ═══════════════════════════════════════════════
   CampusBuild — Space Landing Page
   fuctions.js  ─  Canvas espacial interactivo 3D
═══════════════════════════════════════════════ */

'use strict';

/* ── Refs ── */
const canvas = document.getElementById('space');
const ctx    = canvas.getContext('2d');

/* ── Estado global ── */
let W, H;
let stars      = [];
let shooters   = [];
let planets    = [];
let mouse      = { x: 0, y: 0 };
let currentOff = { x: 0, y: 0 };

/* ══════════════════════════════════
   RESIZE
══════════════════════════════════ */
function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  mouse.x = W / 2;
  mouse.y = H / 2;
}

/* ══════════════════════════════════
   ESTRELLAS
══════════════════════════════════ */
function makeStars() {
  stars = [];
  for (let i = 0; i < 380; i++) {
    const layer = Math.random();
    stars.push({
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.6 + 0.15,
      alpha: Math.random() * 0.6 + 0.2,
      phase: Math.random() * Math.PI * 2,
      freq:  Math.random() * 0.018 + 0.004,
      layer,
      hue:   Math.random() < 0.7 ? 0 : (Math.random() < 0.5 ? 220 : 45),
      sat:   Math.random() < 0.7 ? 0 : Math.round(Math.random() * 40 + 20),
    });
  }
}

function drawStars() {
  for (const s of stars) {
    s.phase += s.freq;
    const a  = s.alpha * (0.55 + 0.45 * Math.sin(s.phase));
    const sx = s.x + currentOff.x * s.layer * 0.6;
    const sy = s.y + currentOff.y * s.layer * 0.6;
    ctx.beginPath();
    ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
    ctx.fillStyle = s.hue === 0
      ? `rgba(255,255,255,${a.toFixed(3)})`
      : `hsla(${s.hue},${s.sat}%,90%,${a.toFixed(3)})`;
    ctx.fill();
  }
}

/* ══════════════════════════════════
   ESTRELLAS FUGACES
══════════════════════════════════ */
function spawnShooter() {
  const x  = Math.random() * W;
  const y  = Math.random() * H * 0.5;
  const vx = Math.random() * 6 + 3;
  const vy = Math.random() * 3 + 1;
  shooters.push({ x, y, vx, vy, len: Math.random() * 80 + 40, life: 1 });
}

function drawShooters() {
  for (let i = shooters.length - 1; i >= 0; i--) {
    const s = shooters[i];
    s.x   += s.vx;
    s.y   += s.vy;
    s.life -= 0.025;
    if (s.life <= 0) { shooters.splice(i, 1); continue; }

    const grad = ctx.createLinearGradient(
      s.x - s.len, s.y - s.vy * (s.len / s.vx), s.x, s.y
    );
    grad.addColorStop(0, `rgba(255,255,255,0)`);
    grad.addColorStop(1, `rgba(255,255,255,${(s.life * 0.9).toFixed(2)})`);
    ctx.strokeStyle = grad;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(s.x - s.len, s.y - s.vy * (s.len / s.vx));
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
  }
}

/* ══════════════════════════════════
   PLANETAS
══════════════════════════════════ */
const PLANET_DEFS = [
  /* Planeta rosa-magenta grande (top-left) */
  {
    cx: 0.10, cy: 0.15, r: 58,
    colors: ['#d45a8a','#c0396e','#7a1a40'],
    rings: false, moons: 0, layer: 0.25,
    bands: [
      { offset: -0.12, opacity: 0.12 },
      { offset:  0.08, opacity: 0.09 },
      { offset:  0.28, opacity: 0.07 },
    ],
  },
  /* Saturno naranja con anillos (top-right) */
  {
    cx: 0.84, cy: 0.20, r: 44,
    colors: ['#e8a030','#d07818','#7a3c00'],
    rings: true,  moons: 0, layer: 0.45,
    bands: [
      { offset: -0.10, opacity: 0.14 },
      { offset:  0.12, opacity: 0.10 },
      { offset:  0.30, opacity: 0.07 },
    ],
  },
  /* Planeta azul con luna (bottom-right) */
  {
    cx: 0.74, cy: 0.80, r: 32,
    colors: ['#3388cc','#1a5588','#0a2244'],
    rings: false, moons: 1, layer: 0.65,
    bands: [
      { offset: -0.08, opacity: 0.10 },
      { offset:  0.14, opacity: 0.08 },
    ],
  },
  /* Pequeño planeta verde (bottom-left) */
  {
    cx: 0.14, cy: 0.80, r: 20,
    colors: ['#44aa66','#226644','#0d3322'],
    rings: false, moons: 0, layer: 0.80,
    bands: [
      { offset:  0.05, opacity: 0.10 },
    ],
  },
  /* Pequeño planeta marrón rojizo (top-center) */
  {
    cx: 0.50, cy: 0.05, r: 16,
    colors: ['#bb5533','#882211','#4e0000'],
    rings: false, moons: 0, layer: 0.35,
    bands: [],
  },
];

function makePlanets() {
  planets = PLANET_DEFS.map(p => ({ ...p }));
}

/* ── Dibujar un planeta ── */
function drawPlanet(p) {
  const x = p.cx * W + currentOff.x * p.layer;
  const y = p.cy * H + currentOff.y * p.layer;
  const r = p.r;

  ctx.save();

  /* Halo atmosférico */
  const atm = ctx.createRadialGradient(x, y, r * 0.7, x, y, r * 1.35);
  atm.addColorStop(0, 'rgba(0,0,0,0)');
  atm.addColorStop(1, `${p.colors[0]}22`);
  ctx.beginPath();
  ctx.arc(x, y, r * 1.35, 0, Math.PI * 2);
  ctx.fillStyle = atm;
  ctx.fill();

  /* Anillos detrás (Saturno) */
  if (p.rings) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, 0.28);
    for (let layer = 0; layer < 3; layer++) {
      const innerR = r * (1.0 + layer * 0.22);
      const outerR = r * (1.22 + layer * 0.22);
      const rg = ctx.createRadialGradient(0, 0, innerR, 0, 0, outerR);
      rg.addColorStop(0,   `${p.colors[0]}cc`);
      rg.addColorStop(0.5, `${p.colors[1]}88`);
      rg.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(0, 0, outerR, 0, Math.PI * 2);
      ctx.fillStyle = rg;
      ctx.fill();
    }
    ctx.restore();
  }

  /* Esfera base */
  const sph = ctx.createRadialGradient(x - r * 0.28, y - r * 0.28, r * 0.04, x, y, r);
  sph.addColorStop(0,    p.colors[0]);
  sph.addColorStop(0.55, p.colors[1]);
  sph.addColorStop(1,    p.colors[2]);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = sph;
  ctx.fill();

  /* Clip para efectos internos */
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();

  /* Bandas superficiales */
  for (const band of p.bands) {
    ctx.beginPath();
    ctx.ellipse(x, y + r * band.offset, r * 0.98, r * (0.12 + Math.abs(band.offset) * 0.3), 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,0,0,${band.opacity})`;
    ctx.fill();
  }

  /* Sombra lateral */
  const shadow = ctx.createRadialGradient(x + r * 0.4, y + r * 0.35, 0, x, y, r * 1.05);
  shadow.addColorStop(0,    'rgba(0,0,0,0)');
  shadow.addColorStop(0.55, 'rgba(0,0,0,0)');
  shadow.addColorStop(1,    'rgba(0,0,0,0.55)');
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = shadow;
  ctx.fill();

  /* Brillo especular */
  const spec = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x - r * 0.2, y - r * 0.2, r * 0.55);
  spec.addColorStop(0,   'rgba(255,255,255,0.22)');
  spec.addColorStop(0.4, 'rgba(255,255,255,0.06)');
  spec.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = spec;
  ctx.fill();

  ctx.restore(); /* fin clip */

  /* Borde sutil */
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth   = 1;
  ctx.stroke();

  /* Luna */
  if (p.moons) {
    const mx = x + r * 1.6;
    const my = y - r * 0.55;
    const mr = r * 0.24;
    const mg = ctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, mr * 0.05, mx, my, mr);
    mg.addColorStop(0, '#ccddee');
    mg.addColorStop(1, '#667788');
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fillStyle = mg;
    ctx.fill();
    const ms = ctx.createRadialGradient(mx + mr * 0.35, my + mr * 0.35, 0, mx, my, mr);
    ms.addColorStop(0.5, 'rgba(0,0,0,0)');
    ms.addColorStop(1,   'rgba(0,0,0,0.4)');
    ctx.fillStyle = ms;
    ctx.fill();
  }

  ctx.restore();
}

/* ══════════════════════════════════
   NEBULOSA DE FONDO
══════════════════════════════════ */
function drawNebula() {
  const ng = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.6);
  ng.addColorStop(0,    'rgba(18, 8, 55, 0.22)');
  ng.addColorStop(0.45, 'rgba(8,  4, 30, 0.10)');
  ng.addColorStop(1,    'rgba(0,  0,  0, 0)');
  ctx.fillStyle = ng;
  ctx.fillRect(0, 0, W, H);

  const nl = ctx.createRadialGradient(W * 0.1, H * 0.4, 0, W * 0.1, H * 0.4, W * 0.35);
  nl.addColorStop(0, 'rgba(60,10,100,0.12)');
  nl.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = nl;
  ctx.fillRect(0, 0, W, H);

  const nr = ctx.createRadialGradient(W * 0.9, H * 0.6, 0, W * 0.9, H * 0.6, W * 0.32);
  nr.addColorStop(0, 'rgba(0,40,90,0.10)');
  nr.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = nr;
  ctx.fillRect(0, 0, W, H);
}

/* ══════════════════════════════════
   RENDER PRINCIPAL
══════════════════════════════════ */
function draw() {
  ctx.fillStyle = '#00000a';
  ctx.fillRect(0, 0, W, H);
  drawNebula();
  drawStars();
  drawShooters();
  for (const p of planets) drawPlanet(p);
}

/* ══════════════════════════════════
   LOOP
══════════════════════════════════ */
let lastShoot = 0;

function loop(ts) {
  const dx = (mouse.x - W / 2) * 0.038;
  const dy = (mouse.y - H / 2) * 0.038;
  currentOff.x += (dx - currentOff.x) * 0.045;
  currentOff.y += (dy - currentOff.y) * 0.045;

  if (ts - lastShoot > (Math.random() * 4000 + 3000)) {
    spawnShooter();
    lastShoot = ts;
  }

  draw();
  requestAnimationFrame(loop);
}

/* ══════════════════════════════════
   EVENTOS
══════════════════════════════════ */
window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener('deviceorientation', e => {
  if (e.gamma !== null && e.beta !== null) {
    mouse.x = W / 2 + (e.gamma / 45) * W * 0.4;
    mouse.y = H / 2 + ((e.beta - 45) / 45) * H * 0.3;
  }
}, { passive: true });

window.addEventListener('touchmove', e => {
  const t = e.touches[0];
  mouse.x = t.clientX;
  mouse.y = t.clientY;
}, { passive: true });

window.addEventListener('resize', () => {
  resize();
  makeStars();
  makePlanets();
});

/* ══════════════════════════════════
   INICIO
══════════════════════════════════ */
resize();
makeStars();
makePlanets();
requestAnimationFrame(loop);