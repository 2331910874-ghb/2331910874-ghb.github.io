/* ============================================================
   END-PAGE MARQUEE
   Drives the bottom word ribbon with requestAnimationFrame so it
   keeps scrolling even if CSS animation is unavailable. The CSS
   keyframes stay in place as a fallback when JS is blocked.
   ============================================================ */
(function () {
  'use strict';

  var track = document.querySelector('.end-marquee-track');
  var marquee = document.querySelector('.end-marquee');
  if (!track || !marquee) return;

  var groups = track.querySelectorAll('.end-marquee-group');
  var span = 0;

  function measure() {
    span = groups.length > 1 ? groups[0].offsetWidth : track.scrollWidth / 2;
    if (!span) span = track.scrollWidth / 2;
    if (!span) span = 1200;
  }

  measure();

  // Take over from the CSS keyframes.
  track.style.animation = 'none';
  track.style.willChange = 'transform';

  var x = 0;
  var last = performance.now();
  var speed = 95; // px per second in design pixels

  function frame(now) {
    var dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    x += speed * dt;
    if (span > 0 && x >= span) x -= span;
    track.style.transform = 'translate3d(' + (-x).toFixed(2) + 'px, 0, 0)';
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  requestAnimationFrame(frame);

  // Small hook for verification from the console.
  window.endMarquee = {
    get x() { return x; },
    get span() { return span; }
  };
})();
