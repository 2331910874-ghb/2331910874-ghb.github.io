/* ============================================================
   SITE MOTION — big titles get a bold entrance, body copy a
   quiet one. Elements animate when they scroll into view and
   re-arm when they leave, so every return trip replays it.
   Styling lives in style.css under "html.mo".
   ============================================================ */
(function () {
  'use strict';

  var TITLES = [
    '.hero-title', '.about-title', '.work-title', '.moments-title',
    '.moments-end-title', '.football-title', '.mtb-title', '.photo-title',
    '.end-title', '.coach-title', '.help-title',
    '.coach-video-title'
  ].join(',');

  var SMALL = [
    '.statement-text', '.about-narrative', '.about-motto', '.about-tag',
    '.role-subheading', '.football-subtitle', '.mtb-subtitle', '.photo-subtitle',
    '.coach-subtitle', '.help-subtitle',
    '.football-section1-desc', '.football-section2-desc', '.football-section3-desc',
    '.mtb-section1-desc', '.mtb-section2-desc', '.mtb-section3-desc',
    '.card1-desc', '.card2-desc', '.card3-desc',
    '.moments-copy', '.football-keywords', '.mtb-keywords', '.photo-keywords',
    '.pillar-courage', '.pillar-persistence', '.pillar-curiosity', '.pillar-observation',
    '.card1-title', '.card2-title', '.card3-title',
    '.football-section1-title', '.football-section2-title', '.football-section3-title',
    '.mtb-section1-title', '.mtb-section2-title', '.mtb-section3-title'
  ].join(',');

  var supportsIO = 'IntersectionObserver' in window;
  var targets = [];

  function linesOf(el) {
    var kids = Array.prototype.slice.call(el.children);
    if (kids.length && kids.every(function (k) { return k.tagName === 'SPAN'; })) {
      return kids;
    }
    return [el];
  }

  function prep() {
    document.documentElement.classList.add('mo');
    document.documentElement.classList.add('mo-ready');

    Array.prototype.forEach.call(document.querySelectorAll(TITLES), function (title) {
      var lines = linesOf(title);
      lines.forEach(function (line, i) {
        line.classList.add('mo-t');
        line.style.setProperty('--mo-delay', String(i * 110));
        targets.push({ el: line, group: title, isTitle: true });
      });
      // the wrapper only needs to host the observer
      title.classList.add('mo-host');
      targets.push({ el: title, isTitle: false, hostOnly: true });
    });

    var smalls = document.querySelectorAll(SMALL);
    Array.prototype.forEach.call(smalls, function (el, i) {
      el.classList.add('mo-s');
      el.style.setProperty('--mo-delay', String((i % 5) * 60));
      targets.push({ el: el, isTitle: false });
    });
  }

  function setIn(entry) {
    var el = entry.el;
    if (entry.hostOnly) {
      el.classList.toggle('mo-in', entry.state);
      var lines = el.querySelectorAll('.mo-t');
      Array.prototype.forEach.call(lines, function (l) { l.classList.toggle('is-in', entry.state); });
      return;
    }
    el.classList.toggle('is-in', entry.state);
  }

  function run() {
    prep();

    if (!supportsIO) {
      targets.forEach(function (t) { setIn({ el: t.el, hostOnly: t.hostOnly, state: true }); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var found = targets.filter(function (t) { return t.el === e.target; });
        found.forEach(function (t) {
          setIn({ el: t.el, hostOnly: t.hostOnly, state: e.isIntersecting });
        });
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

    // Wait two frames before observing: elements already on screen at load
    // must first paint in their hidden state, otherwise the browser applies
    // the hidden and visible styles in the same frame and no transition runs.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        targets.forEach(function (t) { io.observe(t.el); });
      });
    });
  }

  function start() {
    // If the MTB wheel loader is still covering the page, hold the
    // title/copy motion until it finishes, so the entrance plays right
    // after the wheel blows up instead of being hidden behind it.
    if (document.getElementById('mtbLoader') &&
        document.documentElement.classList.contains('mo-pause')) {
      window.addEventListener('mtb:loader-done', run, { once: true });
      return;
    }
    run();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
