// Hero intro: the logo starts large in the centre of the screen while it draws, then moves into its place in the hero
// and the other hero content fades in. Runs only when <head> set html.hero-intro (first view per visit, motion allowed).
(function () {
  var root = document.documentElement, mark = document.querySelector('.hero-mark');
  if (!root.classList.contains('hero-intro')) return;
  if (!mark || window.scrollY > 10 || root.classList.contains('reduce-motion')) { root.classList.remove('hero-intro'); return; }
  var done = false;
  function place() {
    if (done) return;
    mark.style.transform = '';
    var r = mark.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
    var s = Math.min(vw * 0.46, vh * 0.42, 380) / r.width;
    var dx = vw / 2 - (r.left + r.width / 2), dy = vh / 2 - (r.top + r.height / 2);
    mark.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')';
  }
  function release() {
    if (done) return; done = true;
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (t) { window.removeEventListener(t, release); });
    root.classList.add('hero-intro-out');
    mark.style.transform = '';
    setTimeout(function () { root.classList.remove('hero-intro', 'hero-intro-out'); mark.style.transform = ''; }, 2400);
  }
  place();
  window.addEventListener('resize', place);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (t) { window.addEventListener(t, release, { passive: true }); });
  setTimeout(release, Math.max(600, 3300 - (window.performance ? performance.now() : 0)));
})();
