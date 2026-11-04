/* ============================================================
   HERO MOTION — Dylan portfolio
   - both bike wheels spin continuously, even when idle
   - scrolling down rolls the bike forward and speeds the wheels up
   - scrolling up rewinds the bike and spins the wheels backwards
   - runs regardless of the OS "reduce motion" setting (this is a portfolio
     hero, and the motion is the centrepiece of the page)
   ============================================================ */
(function () {
  'use strict';

  var hero = document.querySelector('.page-home .hero-img-box');
  var home = document.getElementById('home');
  if (!hero || !home) return;

  var wheels = Array.prototype.slice.call(hero.querySelectorAll('.hero-wheel'));
  var rings = Array.prototype.slice.call(hero.querySelectorAll('.hero-wheel-ring img'));
  if (!wheels.length) return;

  // Hand the wheels over from the CSS fallback to this script.
  document.documentElement.classList.add('hero-motion-ready');

  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = reduceQuery.matches;
  if (reduceQuery.addEventListener) {
    reduceQuery.addEventListener('change', function (e) {
      reduced = e.matches;
    });
  }

  var IDLE = 260;        // deg / second while the page is still (~1.4s per turn)
  var MAX_BOOST = 2400;  // extra deg / second at fast scroll
  var MAX_SHIFT = 1470;  // left edge -> completely off the right side
  var PHASE = 37;        // keeps the two wheels from looking cloned

  var angle = 0;
  var spin = IDLE;
  var dir = 1;
  var vel = 0;
  var lastTime = performance.now();
  var lastY = window.pageYOffset;
  var lastBlur = -1;
  var lastShift = -1;
  var started = false;

  function applyFilter(w, blur) {
    if (Math.abs(blur - lastBlur) < 0.04) return;
    w.style.filter = blur > 0.05 ? 'blur(' + blur.toFixed(2) + 'px)' : 'none';
  }

  function frame(now) {
    requestAnimationFrame(frame);

    var dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
    lastTime = now;

    var y = window.pageYOffset;
    var instant = (y - lastY) / dt;
    lastY = y;
    vel += (instant - vel) * 0.16;

    // Progress runs over the pinned part of the home track only, so the bike
    // crosses the page while the hero is held in place.
    var pin = document.getElementById('homePin');
    var trackHeight = home.getBoundingClientRect().height;
    var pinHeight = pin ? pin.getBoundingClientRect().height : window.innerHeight;
    var span = Math.max(1, trackHeight - pinHeight);
    var p = Math.min(1, Math.max(0, y / span));

    var idleSpeed = IDLE;
    if (vel < -12) dir = -1;
    else if (vel > 12) dir = 1;

    var boost = Math.min(Math.abs(vel) * 1.4, MAX_BOOST);
    spin += (idleSpeed + boost - spin) * 0.22;
    angle = (angle + dir * spin * dt) % 360;

    var blur = 0.4 + Math.min(3.2, Math.max(0, (spin - IDLE) / 380));
    var rimBlur = Math.min(blur, 1.6);

    wheels.forEach(function (w, i) {
      var a = i === 0 ? angle : (angle + PHASE) % 360;
      w.style.transform = 'rotate(' + a.toFixed(2) + 'deg)';
      applyFilter(w, blur);
    });
    rings.forEach(function (r, i) {
      var a = i === 0 ? angle : (angle + PHASE) % 360;
      r.style.transform = 'rotate(' + a.toFixed(2) + 'deg)';
      r.style.filter = rimBlur > 0.05 ? 'blur(' + rimBlur.toFixed(2) + 'px)' : 'none';
    });
    lastBlur = blur;

    var shift = p * MAX_SHIFT;
    if (Math.abs(shift - lastShift) > 0.05) {
      hero.style.transform = 'translate3d(' + shift.toFixed(1) + 'px, ' +
        (-p * 40).toFixed(1) + 'px, 0) ' +
        'scale(' + (1 + p * 0.07).toFixed(4) + ')';
      lastShift = shift;
    }

    if (!started) {
      started = true;
      document.documentElement.setAttribute('data-hero-motion', 'running');
    }
  }

  // Small public hook so the effect can be verified from the console.
  window.heroMotion = {
    get angle() { return angle; },
    get reduced() { return reduced; },
    get wheels() { return wheels.length; }
  };

  requestAnimationFrame(frame);
})();
