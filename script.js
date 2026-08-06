/* =========================================================
   FOR AZRA — script.js
   Modular sections:
   1. Utilities
   2. Background particles (light motes, sakura petals, birds)
   3. Grass generation
   4. Heart-shaped leaf layout
   5. Growth sequence (the main "story" timeline)
   6. Leaf -> butterfly interaction
   7. Generative ambient piano (Web Audio API)
   ========================================================= */

(() => {
  'use strict';

  /* ---------------------------------------------------------
     1. UTILITIES
  --------------------------------------------------------- */
  const $  = (sel) => document.querySelector(sel);
  const rand = (min, max) => Math.random() * (max - min) + min;
  const NS = 'http://www.w3.org/2000/svg';

  const svg          = $('#tree-svg');
  const trunkEl       = $('#trunk');
  const branchEls     = document.querySelectorAll('.branch');
  const rootGlow      = $('#root-glow');
  const budsGroup      = $('#buds-group');
  const leavesGroup    = $('#leaves-group');
  const sparkleGroup   = $('#sparkle-group');
  const waterBtn       = $('#water-btn');
  const waterStream    = $('#water-stream');
  const skyEl          = $('#sky');
  const sunEl          = $('#sun');
  const hintEl         = $('#hint');

  /* ---------------------------------------------------------
     2. BACKGROUND PARTICLES (canvas)
     Light motes drift from the start; sakura petals & birds
     only start once the tree begins to come alive.
  --------------------------------------------------------- */
  const canvas = $('#fx-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;

  function resizeCanvas(){
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // gentle light motes, present from the very first frame
  const motes = Array.from({ length: 26 }, () => ({
    x: rand(0, W), y: rand(0, H),
    r: rand(0.6, 2.2),
    a: rand(0.15, 0.55),
    vx: rand(-0.06, 0.06),
    vy: rand(-0.12, -0.02),
    phase: rand(0, Math.PI * 2),
  }));

  let petalsActive = false;
  const petals = [];
  function spawnPetal(){
    petals.push({
      x: rand(-20, W + 20), y: -20,
      r: rand(5, 9),
      vy: rand(0.35, 0.75),
      vx: rand(-0.3, 0.3),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.02, 0.02),
      sway: rand(0, Math.PI * 2),
    });
  }

  let birdsActive = false;
  const birds = [];
  function spawnBird(){
    const y = rand(H * 0.1, H * 0.32);
    birds.push({ x: -40, y, speed: rand(1.1, 1.8), wing: 0, size: rand(7, 11) });
  }

  function drawMote(m){
    ctx.beginPath();
    const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 4);
    grad.addColorStop(0, `rgba(255,240,210,${m.a})`);
    grad.addColorStop(1, 'rgba(255,240,210,0)');
    ctx.fillStyle = grad;
    ctx.arc(m.x, m.y, m.r * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPetal(p){
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = 'rgba(245,175,195,0.85)';
    ctx.beginPath();
    ctx.ellipse(0, 0, p.r, p.r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBird(b){
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.strokeStyle = 'rgba(60,40,55,0.55)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    const flap = Math.sin(b.wing) * b.size * 0.5;
    ctx.beginPath();
    ctx.moveTo(-b.size, flap);
    ctx.quadraticCurveTo(0, -flap, b.size, flap);
    ctx.stroke();
    ctx.restore();
  }

  function tick(){
    ctx.clearRect(0, 0, W, H);

    // light motes: slow upward drift with a gentle sine sway
    motes.forEach((m) => {
      m.phase += 0.01;
      m.x += m.vx + Math.sin(m.phase) * 0.05;
      m.y += m.vy;
      if (m.y < -10) m.y = H + 10;
      if (m.x < -10) m.x = W + 10;
      if (m.x > W + 10) m.x = -10;
      drawMote(m);
    });

    // sakura petals
    if (petalsActive && Math.random() < 0.035) spawnPetal();
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.sway += 0.02;
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.sway) * 0.4;
      p.rot += p.vr;
      drawPetal(p);
      if (p.y > H + 20) petals.splice(i, 1);
    }

    // birds crossing the sky
    if (birdsActive && Math.random() < 0.0025 && birds.length < 2) spawnBird();
    for (let i = birds.length - 1; i >= 0; i--) {
      const b = birds[i];
      b.x += b.speed;
      b.wing += 0.25;
      drawBird(b);
      if (b.x > W + 40) birds.splice(i, 1);
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* ---------------------------------------------------------
     3. GRASS — swaying blades along the bottom edge
  --------------------------------------------------------- */
  function buildGrass(){
    const container = $('#grass');
    const count = Math.round(window.innerWidth / 14);
    for (let i = 0; i < count; i++) {
      const blade = document.createElement('div');
      blade.className = 'blade';
      const h = rand(18, 42);
      blade.style.left = `${(i / count) * 100 + rand(-1, 1)}%`;
      blade.style.height = `${h}px`;
      blade.style.setProperty('--tilt', `${rand(-6, 6)}deg`);
      blade.style.animationDuration = `${rand(2.6, 4.4)}s`;
      blade.style.animationDelay = `-${rand(0, 4)}s`;
      blade.style.opacity = rand(0.5, 0.9).toFixed(2);
      container.appendChild(blade);
    }
  }
  buildGrass();

  /* ---------------------------------------------------------
     4. HEART-SHAPED LEAF LAYOUT
     Leaves are placed using the classic parametric heart
     curve so the LOVE shape emerges from real positions,
     not a pasted-on graphic.
  --------------------------------------------------------- */
  function heartPoint(t){
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return { x, y };
  }

  const CANOPY_CX = 400;
  const CANOPY_CY = 300;
  const SCALE = 9.5;

  function buildLeafPositions(){
    const layers = [0.32, 0.46, 0.58, 0.7, 0.83, 0.95, 1.05];
    const points = [];
    layers.forEach((layerScale, li) => {
      const count = 20 + li * 3;
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2 + rand(-0.05, 0.05);
        const { x, y } = heartPoint(t);
        const jitterX = rand(-5, 5);
        const jitterY = rand(-5, 5);
        const sx = CANOPY_CX + x * SCALE * layerScale + jitterX;
        const sy = CANOPY_CY - y * SCALE * layerScale + jitterY;
        points.push({ x: sx, y: sy, size: rand(9, 15) });
      }
    });
    // grow from the bottom of the canopy upward, like real foliage
    points.sort((a, b) => b.y - a.y + rand(-15, 15));
    return points;
  }

  const LEAF_PATH_D = 'M0,-9 C4.5,-7 7,-2.5 7,2 C7,6.5 3.5,9.5 0,11 C-3.5,9.5 -7,6.5 -7,2 C-7,-2.5 -4.5,-7 0,-9 Z';
  const LEAF_COLORS = ['#e58aa0', '#f2a5b8', '#c96b86', '#e58aa0', '#f2a5b8'];

  function createLeaf(pos, index){
    const g = document.createElementNS(NS, 'g');
    const angle = rand(-25, 25);
    g.setAttribute('transform', `translate(${pos.x.toFixed(1)},${pos.y.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${(pos.size / 10).toFixed(2)})`);

    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', LEAF_PATH_D);
    path.setAttribute('class', 'leaf');
    path.setAttribute('fill', LEAF_COLORS[index % LEAF_COLORS.length]);
    path.style.pointerEvents = 'none';
    path.style.animationDelay = `${index * 16}ms`;
    path.style.setProperty('--rot', '0deg');

    path.addEventListener('animationend', function onGrow(e){
      if (e.animationName !== 'leafGrow') return;
      path.removeEventListener('animationend', onGrow);
      path.classList.add('settled');
      path.style.setProperty('--sway-dur', `${rand(3, 6).toFixed(2)}s`);
      path.style.setProperty('--sway-delay', `-${rand(0, 4).toFixed(2)}s`);
      path.style.pointerEvents = 'auto';
      path.addEventListener('click', () => turnIntoButterfly(path));
    });

    g.appendChild(path);
    return g;
  }

  /* ---------------------------------------------------------
     5. GROWTH SEQUENCE — the heart of the story
  --------------------------------------------------------- */
  const BRANCH_TIPS = [
    [270, 365], [535, 340], [320, 255], [495, 255],
    [400, 210], [265, 392], [538, 396],
  ];

  function spawnBud(x, y, delay){
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', x);
    c.setAttribute('cy', y);
    c.setAttribute('r', 5);
    c.setAttribute('class', 'bud');
    c.style.animationDelay = `${delay}ms`;
    budsGroup.appendChild(c);
  }

  function spawnSparkles(){
    for (let i = 0; i < 16; i++) {
      const s = document.createElementNS(NS, 'circle');
      const x = CANOPY_CX + rand(-160, 160);
      const y = CANOPY_CY + rand(-140, 140);
      s.setAttribute('cx', x);
      s.setAttribute('cy', y);
      s.setAttribute('r', rand(1.4, 2.8));
      s.setAttribute('class', 'sparkle');
      s.style.animationDelay = `${rand(0, 3)}s`;
      s.style.animationDuration = `${rand(2, 3.6)}s`;
      s.setAttribute('filter', 'url(#soft-glow)');
      sparkleGroup.appendChild(s);
    }
  }

  function revealLine(el, delay){
    setTimeout(() => el.classList.add('visible'), delay);
  }

  let hasWatered = false;
  function beginGrowth(){
    if (hasWatered) return;
    hasWatered = true;

    // Step 1: soft glow from the button
    waterBtn.classList.add('watering');

    // Step 2: water flows toward the roots
    waterStream.classList.add('flow');

    // Step 3: roots glow
    setTimeout(() => rootGlow.classList.add('on'), 900);

    // Step 4: trunk regains color
    setTimeout(() => trunkEl.classList.add('alive'), 1300);

    // Step 5: branches regain color and tremble softly
    setTimeout(() => {
      branchEls.forEach((b) => {
        b.classList.add('alive');
        b.classList.add('shiver');
      });
    }, 1500);

    // fade the button away once its job is done
    setTimeout(() => waterBtn.classList.add('done'), 2600);

    // Step 6: little buds appear along the branches
    const budStart = 2000;
    BRANCH_TIPS.forEach(([x, y], i) => spawnBud(x, y, i * 90));

    // Step 7: leaves grow one by one, forming the heart
    const leafStart = budStart + BRANCH_TIPS.length * 90 + 500;
    setTimeout(() => {
      const positions = buildLeafPositions();
      positions.forEach((pos, i) => leavesGroup.appendChild(createLeaf(pos, i)));

      const growthDuration = positions.length * 16 + 1100;

      // once every leaf has bloomed: brighten the scene, tell the story
      setTimeout(() => {
        skyEl.classList.add('bright');
        sunEl.classList.add('bright');
        spawnSparkles();
        petalsActive = true;
        birdsActive = true;

        revealLine($('#line1'), 400);
        revealLine($('#line2'), 2000);
        revealLine($('#line3'), 4400);

        setTimeout(() => {
          const sig = $('#signature');
          sig.classList.add('visible', 'write');
          sig.addEventListener('animationend', () => sig.classList.add('written'), { once: true });
        }, 6800);

        setTimeout(() => hintEl.classList.add('visible'), 8600);
      }, growthDuration);
    }, leafStart);
  }

  waterBtn.addEventListener('click', beginGrowth);

  /* ---------------------------------------------------------
     6. LEAF -> BUTTERFLY
  --------------------------------------------------------- */
  function turnIntoButterfly(leafEl){
    if (leafEl.dataset.done) return;
    leafEl.dataset.done = '1';

    const rect = leafEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    leafEl.style.transition = 'opacity .5s ease';
    leafEl.style.opacity = '0';
    leafEl.style.pointerEvents = 'none';

    const b = document.createElement('div');
    b.className = 'butterfly';
    b.style.left = `${cx}px`;
    b.style.top = `${cy}px`;
    b.innerHTML = '<span class="wing w1"></span><span class="wing w2"></span>';
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 3300);
  }

/* ---------------------------------------------------------
   7. MUSIK LATAR (file MP3)
--------------------------------------------------------- */
const musicBtn  = $('#music-btn');
const musicIcon = $('#music-icon');
const bgMusic   = $('#bg-music');

bgMusic.volume = 0.35; // volume lembut, silakan disesuaikan

let isPlaying = false;

musicBtn.addEventListener('click', () => {
  isPlaying = !isPlaying;
  musicBtn.classList.toggle('playing', isPlaying);
  musicBtn.setAttribute('aria-pressed', String(isPlaying));
  musicIcon.textContent = isPlaying ? '❚❚' : '♪';

  if (isPlaying) {
    bgMusic.play();
  } else {
    bgMusic.pause();
  }
});