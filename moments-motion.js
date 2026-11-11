/* ============================================================
   MOMENTS / KEEP LOOKING — scroll-driven image reveal
   Each photo fades in, lifts up and scales down as it slides
   into view while the vertical scroll drives the collage
   sideways. Works in both directions (scroll back = re-hide).
   CSS lives in style.css under ".moments-motion".
   ============================================================ */
(function () {
  'use strict';

  var pin = document.getElementById('momentsPin');
  var section = document.getElementById('moments');
  if (!pin || !section) return;

  var items = Array.prototype.slice.call(pin.querySelectorAll('.moments-item'));
  if (!items.length) return;

  var ticking = false;

  // Enable the animated state only when this script runs, so the
  // gallery still shows every photo if JS is unavailable.
  pin.classList.add('moments-motion');

  function clamp(n, min, max) {
    return n < min ? min : n > max ? max : n;
  }

  function update() {
    ticking = false;

    var vw = window.innerWidth;
    var vh = window.innerHeight;

    items.forEach(function (el) {
      var r = el.getBoundingClientRect();

      // Horizontal reveal: starts when the frame is 96% across the
      // screen and completes once it is comfortably inside the view.
      var enter = (vw * 0.96 - r.left) / (vw * 0.44);
      var p = clamp(enter, 0, 1);

      // Soft vertical drift so the frame is not statically pinned
      // while the collage passes by.
      var centre = r.top + r.height / 2;
      var drift = clamp((centre - vh / 2) / vh, -1, 1) * -18;

      el.style.setProperty('--rv', p.toFixed(3));
      el.style.setProperty('--py', drift.toFixed(2));
    });
  }

  var settleTimers = [];

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);

    // the collage keeps easing for a few frames after the wheel stops,
    // so re-sample once it has settled
    settleTimers.forEach(clearTimeout);
    settleTimers = [
      setTimeout(update, 160),
      setTimeout(update, 420)
    ];
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('orientationchange', onScroll);
  window.addEventListener('load', update);

  update();
})();
