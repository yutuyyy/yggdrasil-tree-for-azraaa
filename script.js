/* =========================================================
   FOR AZRA — script.js
   Modular sections:
   1. Utilities
   2. Background particles (light motes, sakura petals, birds)
   3. Grass generation
   4. Heart-shaped leaf layout
   5. Growth sequence (the main "story" timeline)
   6. Leaf -> butterfly interaction
   7. Background music (MP3 file, played via <audio>)
   ========================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. UTILITIES
  --------------------------------------------------------- */
  function $(sel) { return document.querySelector(sel); }
  function rand(min, max) { return Math.random() * (max - min) + min; }
  var NS = 'http://www.w3.org/2000/svg';

  var trunkEl       = $('#trunk');
  var branchEls     = document.querySelectorAll('.branch');
  var rootGlow      = $('#root-glow');
  var budsGroup     = $('#buds-group');
  var leavesGroup   = $('#leaves-group');
  var sparkleGroup  = $('#sparkle-group');
  var waterBtn      = $('#water-btn');
  var waterStream   = $('#water-stream');
  var skyEl         = $('#sky');
  var sunEl         = $('#sun');
  var hintEl        = $('#hint');

  /* ---------------------------------------------------------
     2. BACKGROUND PARTICLES (canvas)
     Light motes drift from the start; sakura petals & birds
     only start once the tree begins to come alive.
  --------------------------------------------------------- */
  var canvas = $('#fx-canvas');
  var ctx = canvas.getContext('2d');
  var W, H;

  function resizeCanvas() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // gentle light motes, present from the very first frame
  var motes = [];
  for (var m = 0; m < 26; m++) {
    motes.push({
      x: rand(0, W), y: rand(0, H),
      r: rand(0.6, 2.2),
      a: rand(0.15, 0.55),
      vx: rand(-0.06, 0.06),
      vy: rand(-0.12, -0.02),
      phase: rand(0, Math.PI * 2)
    });
  }

  var petalsActive = false;
  var petals = [];
  function spawnPetal() {
    petals.push({
      x: rand(-20, W + 20), y: -20,
      r: rand(5, 9),
      vy: rand(0.35, 0.75),
      vx: rand(-0.3, 0.3),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.02, 0.02),
      sway: rand(0, Math.PI * 2)
    });
  }

  var birdsActive = false;
  var birds = [];
  function spawnBird() {
    var y = rand(H * 0.1, H * 0.32);
    birds.push({ x: -40, y: y, speed: rand(1.1, 1.8), wing: 0, size: rand(7, 11) });
  }

  function drawMote(mm) {
    ctx.beginPath();
    var grad = ctx.createRadialGradient(mm.x, mm.y, 0, mm.x, mm.y, mm.r * 4);
    grad.addColorStop(0, 'rgba(255,240,210,' + mm.a + ')');
    grad.addColorStop(1, 'rgba(255,240,210,0)');
    ctx.fillStyle = grad;
    ctx.arc(mm.x, mm.y, mm.r * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = 'rgba(245,175,195,0.85)';
    ctx.beginPath();
    ctx.ellipse(0, 0, p.r, p.r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBird(b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.strokeStyle = 'rgba(60,40,55,0.55)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    var flap = Math.sin(b.wing) * b.size * 0.5;
    ctx.beginPath();
    ctx.moveTo(-b.size, flap);
    ctx.quadraticCurveTo(0, -flap, b.size, flap);
    ctx.stroke();
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    // light motes: slow upward drift with a gentle sine sway
    for (var i = 0; i < motes.length; i++) {
      var mm = motes[i];
      mm.phase += 0.01;
      mm.x += mm.vx + Math.sin(mm.phase) * 0.05;
      mm.y += mm.vy;
      if (mm.y < -10) mm.y = H + 10;
      if (mm.x < -10) mm.x = W + 10;
      if (mm.x > W + 10) mm.x = -10;
      drawMote(mm);
    }

    // sakura petals
    if (petalsActive && Math.random() < 0.035) spawnPetal();
    for (var pi = petals.length - 1; pi >= 0; pi--) {
      var p = petals[pi];
      p.sway += 0.02;
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.sway) * 0.4;
      p.rot += p.vr;
      drawPetal(p);
      if (p.y > H + 20) petals.splice(pi, 1);
    }

    // birds crossing the sky
    if (birdsActive && Math.random() < 0.0025 && birds.length < 2) spawnBird();
    for (var bi = birds.length - 1; bi >= 0; bi--) {
      var b = birds[bi];
      b.x += b.speed;
      b.wing += 0.25;
      drawBird(b);
      if (b.x > W + 40) birds.splice(bi, 1);
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* ---------------------------------------------------------
     3. GRASS — swaying blades along the bottom edge
  --------------------------------------------------------- */
  function buildGrass() {
    var container = $('#grass');
    var count = Math.round(window.innerWidth / 14);
    for (var i = 0; i < count; i++) {
      var blade = document.createElement('div');
      blade.className = 'blade';
      var h = rand(18, 42);
      blade.style.left = (i / count) * 100 + rand(-1, 1) + '%';
      blade.style.height = h + 'px';
      blade.style.setProperty('--tilt', rand(-6, 6) + 'deg');
      blade.style.animationDuration = rand(2.6, 4.4) + 's';
      blade.style.animationDelay = '-' + rand(0, 4) + 's';
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
  function heartPoint(t) {
    var x = 16 * Math.pow(Math.sin(t), 3);
    var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return { x: x, y: y };
  }

  var CANOPY_CX = 400;
  var CANOPY_CY = 288;   // shifted up so the shape sits over the branches
  var SCALE_X = 8.6;     // horizontal reach — matches the branch spread
  var SCALE_Y = 6.1;     // vertical reach — kept short so it stays above the trunk

  function buildLeafPositions() {
    var layers = [0.32, 0.46, 0.58, 0.7, 0.82, 0.93, 1.0];
    var points = [];
    for (var li = 0; li < layers.length; li++) {
      var layerScale = layers[li];
      var count = 20 + li * 3;
      for (var i = 0; i < count; i++) {
        var t = (i / count) * Math.PI * 2 + rand(-0.05, 0.05);
        var pt = heartPoint(t);
        var jitterX = rand(-4, 4);
        var jitterY = rand(-4, 4);
        var sx = CANOPY_CX + pt.x * SCALE_X * layerScale + jitterX;
        var sy = CANOPY_CY - pt.y * SCALE_Y * layerScale + jitterY;
        points.push({ x: sx, y: sy, size: rand(9, 15) });
      }
    }
    // grow from the bottom of the canopy upward, like real foliage
    points.sort(function (a, b) { return (b.y - a.y) + rand(-15, 15); });
    return points;
  }

  var LEAF_PATH_D = 'M0,-9 C4.5,-7 7,-2.5 7,2 C7,6.5 3.5,9.5 0,11 C-3.5,9.5 -7,6.5 -7,2 C-7,-2.5 -4.5,-7 0,-9 Z';
  var LEAF_COLORS = ['#e58aa0', '#f2a5b8', '#c96b86', '#e58aa0', '#f2a5b8'];

  function createLeaf(pos, index) {
    var g = document.createElementNS(NS, 'g');
    var angle = rand(-25, 25);
    g.setAttribute('transform',
      'translate(' + pos.x.toFixed(1) + ',' + pos.y.toFixed(1) + ') ' +
      'rotate(' + angle.toFixed(1) + ') ' +
      'scale(' + (pos.size / 10).toFixed(2) + ')');

    var path = document.createElementNS(NS, 'path');
    path.setAttribute('d', LEAF_PATH_D);
    path.setAttribute('class', 'leaf');
    path.setAttribute('fill', LEAF_COLORS[index % LEAF_COLORS.length]);
    path.style.pointerEvents = 'none';
    path.style.animationDelay = (index * 16) + 'ms';
    path.style.setProperty('--rot', '0deg');

    path.addEventListener('animationend', function onGrow(e) {
      if (e.animationName !== 'leafGrow') return;
      path.removeEventListener('animationend', onGrow);
      path.classList.add('settled');
      path.style.setProperty('--sway-dur', rand(3, 6).toFixed(2) + 's');
      path.style.setProperty('--sway-delay', '-' + rand(0, 4).toFixed(2) + 's');
      path.style.pointerEvents = 'auto';
      path.addEventListener('click', function () { turnIntoButterfly(path); });
    });

    g.appendChild(path);
    return g;
  }

  /* ---------------------------------------------------------
     5. GROWTH SEQUENCE — the heart of the story
  --------------------------------------------------------- */
  var BRANCH_TIPS = [
    [270, 365], [535, 340], [320, 255], [495, 255],
    [400, 210], [265, 392], [538, 396]
  ];

  function spawnBud(x, y, delay) {
    var c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', x);
    c.setAttribute('cy', y);
    c.setAttribute('r', 5);
    c.setAttribute('class', 'bud');
    c.style.animationDelay = delay + 'ms';
    budsGroup.appendChild(c);
  }

  function spawnSparkles() {
    for (var i = 0; i < 16; i++) {
      var s = document.createElementNS(NS, 'circle');
      var x = CANOPY_CX + rand(-150, 150);
      var y = CANOPY_CY + rand(-110, 110);
      s.setAttribute('cx', x);
      s.setAttribute('cy', y);
      s.setAttribute('r', rand(1.4, 2.8));
      s.setAttribute('class', 'sparkle');
      s.style.animationDelay = rand(0, 3) + 's';
      s.style.animationDuration = rand(2, 3.6) + 's';
      s.setAttribute('filter', 'url(#soft-glow)');
      sparkleGroup.appendChild(s);
    }
  }

  function revealLine(el, delay) {
    setTimeout(function () { el.classList.add('visible'); }, delay);
  }

  var hasStarted = false;
  function beginGrowth() {
    if (hasStarted) return;
    hasStarted = true;

    // start the music the moment the story begins (see section 7)
    playMusic();

    // Step 1: soft glow from the button
    waterBtn.classList.add('watering');

    // Step 2: water/love flows toward the roots
    waterStream.classList.add('flow');

    // Step 3: roots glow
    setTimeout(function () { rootGlow.classList.add('on'); }, 900);

    // Step 4: trunk regains color
    setTimeout(function () { trunkEl.classList.add('alive'); }, 1300);

    // Step 5: branches regain color and tremble softly
    setTimeout(function () {
      branchEls.forEach(function (b) {
        b.classList.add('alive');
        b.classList.add('shiver');
      });
    }, 1500);

    // fade the button away once its job is done
    setTimeout(function () { waterBtn.classList.add('done'); }, 2600);

    // Step 6: little buds appear along the branches
    var budStart = 2000;
    for (var i = 0; i < BRANCH_TIPS.length; i++) {
      spawnBud(BRANCH_TIPS[i][0], BRANCH_TIPS[i][1], i * 90);
    }

    // Step 7: leaves grow one by one, forming the heart
    var leafStart = budStart + BRANCH_TIPS.length * 90 + 500;
    setTimeout(function () {
      var positions = buildLeafPositions();
      positions.forEach(function (pos, i) {
        leavesGroup.appendChild(createLeaf(pos, i));
      });

      var growthDuration = positions.length * 16 + 1100;

      // once every leaf has bloomed: brighten the scene, tell the story
      setTimeout(function () {
        skyEl.classList.add('bright');
        sunEl.classList.add('bright');
        spawnSparkles();
        petalsActive = true;
        birdsActive = true;

        revealLine($('#line1'), 400);
        revealLine($('#line2'), 2000);
        revealLine($('#line3'), 4400);

        setTimeout(function () {
          var sig = $('#signature');
          sig.classList.add('visible', 'write');
          sig.addEventListener('animationend', function () {
            sig.classList.add('written');
          }, { once: true });
        }, 6800);

        setTimeout(function () { hintEl.classList.add('visible'); }, 8600);
      }, growthDuration);
    }, leafStart);
  }

  waterBtn.addEventListener('click', beginGrowth);

  /* ---------------------------------------------------------
     6. LEAF -> BUTTERFLY
  --------------------------------------------------------- */
  function turnIntoButterfly(leafEl) {
    if (leafEl.dataset.done) return;
    leafEl.dataset.done = '1';

    var rect = leafEl.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;

    leafEl.style.transition = 'opacity .5s ease';
    leafEl.style.opacity = '0';
    leafEl.style.pointerEvents = 'none';

    var b = document.createElement('div');
    b.className = 'butterfly';
    b.style.left = cx + 'px';
    b.style.top = cy + 'px';
    b.innerHTML = '<span class="wing w1"></span><span class="wing w2"></span>';
    document.body.appendChild(b);
    setTimeout(function () { b.remove(); }, 3300);
  }

  /* ---------------------------------------------------------
     7. BACKGROUND MUSIC (MP3 file)
     Uses the <audio id="bg-music"> element in index.html.
     Volume fades in/out smoothly instead of jumping abruptly.
  --------------------------------------------------------- */
  var musicBtn  = $('#music-btn');
  var musicIcon = $('#music-icon');
  var bgMusic   = $('#bg-music');
  var TARGET_VOLUME = 0.35; // soft background volume — adjust freely
  var isPlaying = false;
  var fadeTimer = null;

  if (bgMusic) bgMusic.volume = 0;

  function fadeVolume(target, duration) {
    if (!bgMusic) return;
    if (fadeTimer) clearInterval(fadeTimer);
    var steps = 30;
    var stepTime = duration / steps;
    var startVol = bgMusic.volume;
    var diff = target - startVol;
    var count = 0;
    fadeTimer = setInterval(function () {
      count++;
      bgMusic.volume = Math.max(0, Math.min(1, startVol + diff * (count / steps)));
      if (count >= steps) clearInterval(fadeTimer);
    }, stepTime);
  }

  function setMusicUI(playing) {
    musicBtn.classList.toggle('playing', playing);
    musicBtn.setAttribute('aria-pressed', String(playing));
    musicIcon.textContent = playing ? '❚❚' : '♪';
  }

  function playMusic() {
    if (!bgMusic || isPlaying) return;
    var playPromise = bgMusic.play();
    if (playPromise && playPromise.catch) {
      // Autoplay can be blocked by the browser; that's fine —
      // the music button still lets the user start it manually.
      playPromise.catch(function () { /* ignore */ });
    }
    isPlaying = true;
    fadeVolume(TARGET_VOLUME, 1500);
    setMusicUI(true);
  }

  function pauseMusic() {
    if (!bgMusic || !isPlaying) return;
    fadeVolume(0, 800);
    setTimeout(function () { bgMusic.pause(); }, 800);
    isPlaying = false;
    setMusicUI(false);
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', function () {
      if (isPlaying) {
        pauseMusic();
      } else {
        playMusic();
      }
    });
  }

})();
