/* ============================================================
   MTB wheel loading screen
   Duration tracks real load demand: it finishes as soon as the
   page's resources (images / scripts / CSS) have loaded, with a
   tiny 220ms floor so it never flashes for zero time, and a hard
   cap so a hung asset can't hold it forever. When done, the wheel
   blows up off-screen and the title motion takes over via
   "mtb:loader-done".
   ============================================================ */
(function () {
  'use strict';

  var overlay = document.getElementById('mtbLoader');
  if (!overlay) return;

  var fill = overlay.querySelector('.wl-bar-fill');

  var MIN_MS = 220;    // never vanish faster than this
  var MAX_MS = 3500;   // never hang longer than this
  var start = performance.now();
  var finished = false;

  // The natural "everything is ready" signal is the window load event
  // (fires after images + scripts + styles are done).
  var loadDone = document.readyState === 'complete';
  if (!loadDone) {
    window.addEventListener('load', function () { loadDone = true; });
  }

  // Images still loading at this point are sampled for the progress bar.
  var imgs = Array.prototype.slice.call(document.images).filter(function (img) {
    return img.src && !img.complete;
  });

  function imageProgress() {
    if (!imgs.length) return 1;
    var done = imgs.filter(function (img) {
      return img.complete || img.naturalWidth > 0;
    }).length;
    return 0.06 + 0.94 * (done / imgs.length);
  }

  function finish() {
    if (finished) return;
    finished = true;

    if (fill) fill.style.transform = 'scaleX(1)';
    overlay.classList.add('is-done');
    document.documentElement.classList.remove('mo-pause');
    try { window.dispatchEvent(new Event('mtb:loader-done')); } catch (e) {}

    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 1200);
  }

  function tick() {
    if (finished) return;

    var elapsed = performance.now() - start;
    var p = imgs.length
      ? imageProgress()
      : Math.min(0.9, 0.2 + 0.7 * (elapsed / 1500));

    if (fill) fill.style.transform = 'scaleX(' + p.toFixed(3) + ')';

    // Fast page: loadDone is already true, so it exits at the 220ms floor.
    // Slow page: it waits for the load event, up to MAX_MS.
    if (elapsed >= MIN_MS && loadDone) {
      finish();
      return;
    }
    requestAnimationFrame(tick);
  }

  // Hard safety cap in case a resource hangs.
  setTimeout(finish, MAX_MS);

  requestAnimationFrame(tick);
})();
