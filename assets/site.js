/* ZKJ SYSTEM — creative layer for the home page: hero media, gallery room, journey, mock-up rooms.
   Vanilla JS. Motion is disabled when the visitor prefers reduced motion. */
(function () {
  'use strict';
  var Z = window.ZKJ;
  var t = Z.t, esc = Z.esc;
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduce = !!(mq && mq.matches);
  if (reduce) root.classList.add('reduce-motion');

  var state = { art: [], heroMode: 'static', slide: 0, slides: 1, lightbox: -1, scene: 'cafe' };
  window.__zkjSite = state;
  function $(id) { return document.getElementById(id); }
  function L() { return Z.getLang(); }

  function getJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(url); return r.json(); });
  }

  /* ---------- Header ---------- */
  var header = $('site-header');
  function onScrollHeader() { if (header) header.classList.toggle('solid', window.scrollY > 40 || (document.getElementById('site-nav') || {}).classList && document.getElementById('site-nav').classList.contains('open')); }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  document.addEventListener('click', function (e) { if (e.target.closest('[data-menu]')) setTimeout(onScrollHeader, 0); });
  onScrollHeader();

  /* ---------- Hero ---------- */
  var media = $('hero-media');
  var slideTimer = null;
  function startSlides(works) {
    if (!media || !works.length) return;
    state.heroMode = reduce ? 'static' : 'slides';
    if (reduce) return; // one still frame only
    var load = function () {
      works.slice(1).forEach(function (w) {
        var d = document.createElement('div');
        d.className = 'hero-slide';
        d.style.backgroundImage = "url('" + w.hero + "')";
        media.appendChild(d);
      });
      state.slides = media.querySelectorAll('.hero-slide').length;
      slideTimer = setInterval(nextSlide, 7000);
    };
    if (document.readyState === 'complete') setTimeout(load, 400); else window.addEventListener('load', function () { setTimeout(load, 400); });
  }
  function nextSlide() {
    var slides = media.querySelectorAll('.hero-slide');
    if (slides.length < 2) return;
    slides[state.slide].classList.remove('on');
    state.slide = (state.slide + 1) % slides.length;
    slides[state.slide].classList.add('on');
  }
  state.nextSlide = function () { nextSlide(); return state.slide; };

  function startVideo(list, works) {
    var v = list[0];
    var video = document.createElement('video');
    video.muted = true; video.loop = true; video.playsInline = true; video.autoplay = !reduce;
    video.setAttribute('muted', ''); video.setAttribute('playsinline', ''); video.setAttribute('aria-hidden', 'true');
    if (v.poster) video.poster = v.poster;
    video.preload = reduce ? 'none' : 'auto';
    if (v.webm) { var s1 = document.createElement('source'); s1.src = v.webm; s1.type = 'video/webm'; video.appendChild(s1); }
    var s2 = document.createElement('source'); s2.src = v.src; s2.type = 'video/mp4'; video.appendChild(s2);
    var failed = false;
    function fail() { if (failed) return; failed = true; video.remove(); startSlides(works); }
    s2.addEventListener('error', fail);
    video.addEventListener('error', fail);
    media.appendChild(video);
    state.heroMode = 'video';
    if (!reduce) { var p = video.play(); if (p && p.catch) p.catch(function () { /* autoplay blocked: poster stays */ }); }
  }

  /* ---------- Gallery ---------- */
  function renderWall() {
    var wall = $('wall');
    if (!wall) return;
    wall.innerHTML = state.art.map(function (w, i) {
      var title = w['title_' + L()] || w.title_en;
      var alt = w['alt_' + L()] || w.alt_en || title;
      return '<figure class="artwork" style="margin:0"><span class="lamp" aria-hidden="true"></span><span class="cone" aria-hidden="true"></span>' +
        '<button class="frame-btn" type="button" data-art="' + i + '" aria-label="' + esc(t('gal.view', { title: title })) + '">' +
        '<img src="' + esc(w.thumb) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async" width="600" height="600"></button>' +
        '<figcaption class="museum-label"><strong>' + esc(title) + '</strong><span>' + esc(w.collection) + '</span><span>' + esc(t('gal.handed')) + '</span></figcaption></figure>';
    }).join('');
  }

  var lb = $('lightbox');
  function openLightbox(i) {
    if (!lb || !state.art.length) return;
    state.lightbox = (i + state.art.length) % state.art.length;
    var w = state.art[state.lightbox];
    var img = $('lb-img');
    img.src = w.file;
    img.alt = w['alt_' + L()] || w.alt_en;
    $('lb-title').textContent = w['title_' + L()] || w.title_en;
    $('lb-col').textContent = w.collection;
    $('lb-count').textContent = t('gal.count', { n: state.lightbox + 1, total: state.art.length });
    if (!lb.open) { if (lb.showModal) lb.showModal(); else lb.setAttribute('open', ''); }
  }
  function closeLightbox() { state.lightbox = -1; if (lb && lb.open) { if (lb.close) lb.close(); else lb.removeAttribute('open'); } }
  if (lb) {
    lb.addEventListener('close', function () { state.lightbox = -1; });
    lb.addEventListener('click', function (e) {
      if (e.target === lb) { closeLightbox(); return; }
      var b = e.target.closest('[data-lb]');
      if (!b) return;
      var a = b.getAttribute('data-lb');
      if (a === 'close') closeLightbox();
      if (a === 'next') openLightbox(state.lightbox + 1);
      if (a === 'prev') openLightbox(state.lightbox - 1);
    });
    lb.addEventListener('keydown', function (e) {
      var fwd = L() === 'ar' ? 'ArrowLeft' : 'ArrowRight', back = L() === 'ar' ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === fwd) openLightbox(state.lightbox + 1);
      if (e.key === back) openLightbox(state.lightbox - 1);
    });
  }
  document.addEventListener('click', function (e) {
    var f = e.target.closest('[data-art]');
    if (f) openLightbox(+f.getAttribute('data-art'));
  });

  // room tilt + cursor light
  var room = $('room'), inner = $('room-inner');
  function tilt(x, y) { // x,y in -1..1
    inner.style.setProperty('--ry', (x * 6).toFixed(2) + 'deg');
    inner.style.setProperty('--rx', (-y * 4).toFixed(2) + 'deg');
  }
  if (room && inner && !reduce) {
    room.addEventListener('pointermove', function (e) {
      var r = inner.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      inner.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      inner.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      if (window.innerWidth > 900) tilt(px * 2 - 1, py * 2 - 1);
    });
    room.addEventListener('pointerleave', function () { tilt(0, 0); });
    if ('DeviceOrientationEvent' in window && typeof DeviceOrientationEvent.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', function (e) {
        if (window.innerWidth > 900 || e.gamma == null) return;
        inner.style.setProperty('--mx', (50 + Math.max(-45, Math.min(45, e.gamma))).toFixed(1) + '%');
      }, { passive: true });
    }
  }

  /* ---------- Journey rail ---------- */
  var track = $('journey-track');
  var rail = track && track.querySelector('.rail');
  function railProgress() {
    if (!rail) return;
    var r = track.getBoundingClientRect(), vh = window.innerHeight;
    var p = (vh * 0.65 - r.top) / r.height;
    rail.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
  }
  window.addEventListener('scroll', railProgress, { passive: true });
  window.addEventListener('resize', railProgress);
  railProgress();

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }
  initReveal();

  /* ---------- Mock-up rooms (tabs) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab[data-scene]'));
  function selectScene(id, focus) {
    state.scene = id;
    tabs.forEach(function (tb) {
      var on = tb.getAttribute('data-scene') === id;
      tb.setAttribute('aria-selected', on ? 'true' : 'false');
      tb.tabIndex = on ? 0 : -1;
      var panel = $(tb.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
      if (on && focus) tb.focus();
    });
    var cap = $('scene-caption');
    if (cap) { cap.setAttribute('data-i18n', 'world.' + id + '.scene'); cap.textContent = t('world.' + id + '.scene'); }
  }
  tabs.forEach(function (tb, i) {
    tb.addEventListener('click', function () { selectScene(tb.getAttribute('data-scene')); });
    tb.addEventListener('keydown', function (e) {
      var rtl = L() === 'ar';
      var nextKey = rtl ? 'ArrowLeft' : 'ArrowRight', prevKey = rtl ? 'ArrowRight' : 'ArrowLeft';
      var j = null;
      if (e.key === nextKey) j = (i + 1) % tabs.length;
      if (e.key === prevKey) j = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') j = 0;
      if (e.key === 'End') j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); selectScene(tabs[j].getAttribute('data-scene'), true); }
    });
  });

  /* ---------- Showcase: THE TOOLS AT WORK ---------- */
  var reel = $('reel'), stage = $('reel-stage');
  var R = { steps: [], index: 0, playing: !reduce, hover: false, visible: true, timer: null, interval: 5000, mode: reduce ? 'static' : 'player' };
  state.reel = R;
  var PLAT = { instagram: ['Instagram', '#E1306C'], tiktok: ['TikTok', '#25C2C9'], youtube: ['YouTube', '#FF3B30'], x: ['X', '#B8BEC6'] };
  function img(src, cls) { return '<img class="' + (cls || '') + '" src="' + esc(src) + '" alt="" loading="lazy" decoding="async">'; }
  function overlay(st) {
    var m = (st.media && st.media.images) || [];
    var im = function (i) { return m[i % (m.length || 1)] || ''; };
    switch (st.overlay) {
      case 'brandkit':
        var fl = st['frames_' + L()] || st.frames_en || [];
        return '<div class="ov ov-bk4">' + m.map(function (src, i) {
          return '<figure class="fr bk-frame" style="--d:' + (0.2 + i * 0.9) + 's"><img src="' + esc(src) + '" alt="' + esc('KJ VISION — ' + (st.frames_en && st.frames_en[i] || '')) + '" loading="lazy" decoding="async"><figcaption><span class="tag" style="color:var(--gold)">0' + (i + 1) + '</span> ' + esc(fl[i] || '') + '</figcaption></figure>';
        }).join('') + '</div>';
      case 'setup':
        var pf = st.profile || {};
        return '<div class="ov ov-setup"><div class="ovc prof">' + (pf.emblem ? '<span class="avatar emblem"><img src="' + esc(pf.emblem) + '" alt="" loading="lazy"></span>' : img(im(0), 'avatar')) + '<div>' +
          '<b class="plain-name">' + esc(pf.name || 'KJ VISION') + '</b>' +
          '<span dir="ltr">' + esc(pf.handle || '') + '</span><small>' + esc(t('sc.profile')) + '</small></div></div>' +
          '<ul class="ovc chans">' + ['instagram', 'tiktok', 'youtube', 'x'].map(function (k, i) {
            return '<li style="--d:' + (i * 0.35 + 0.4) + 's"><i style="background:' + PLAT[k][1] + '"></i><span>' + PLAT[k][0] + '</span><em>' + esc(t('sc.connected')) + '</em></li>';
          }).join('') + '</ul></div>';
      case 'content':
        var posts = st.posts || [];
        var edPost = function (po, extra) {
          return '<div class="edp' + (extra || '') + '"><span class="edl" dir="ltr">' + esc(po.label) + '</span><i class="edh"></i>' +
            '<p class="eds" dir="ltr">' + esc(po.pre) + '<em>' + esc(po.gold) + '</em>' + esc(po.post || '') + '</p>' +
            '<p class="eda" lang="ar" dir="rtl">' + esc(po.ar) + '</p><span class="edf" dir="ltr">ZKJ VERSE ◆</span></div>';
        };
        var p0 = posts[0] || { label: '', pre: '', gold: '', ar: '' };
        return '<div class="ov ov-content">' +
          posts.map(function (po, i) { return '<figure class="fr fr-ed" style="--d:' + (0.2 + i * 0.3) + 's">' + edPost(po) + '<figcaption>' + esc(t('sc.f.post')) + '</figcaption></figure>'; }).join('') +
          '<figure class="fr fr-story" style="--d:1.2s"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>' + edPost(p0, ' tall') + '<figcaption>' + esc(t('sc.f.story')) + '</figcaption></figure>' +
          '<figure class="fr fr-reel" style="--d:1.5s"><div class="edp tall art" style="background-image:linear-gradient(180deg,rgba(11,11,15,.2),rgba(11,11,15,.88) 70%),url(\'' + esc(im(0)) + '\')"><span class="edl" dir="ltr">' + esc(p0.label) + '</span><i class="edh"></i><p class="eds" dir="ltr">' + esc(p0.pre) + '<em>' + esc(p0.gold) + '</em></p><span class="edf" dir="ltr">ZKJ VERSE ◆</span></div><span class="play" aria-hidden="true"></span><figcaption>' + esc(t('sc.f.reel')) + '</figcaption></figure></div>';
      case 'approval':
        return '<div class="ov ov-approval">' + [0, 1, 2].map(function (i) {
          return '<div class="ovc ap' + (i === 0 ? ' ap-ok' : '') + '" style="--d:' + (i * 0.3 + 0.2) + 's">' + img(im(i)) + '<div><b>' + esc(t('sc.ap.' + i)) + '</b>' +
            '<span class="ap-btns"><span>' + esc(t('sc.approve')) + '</span><span>' + esc(t('sc.changes')) + '</span></span>' +
            (i === 0 ? '<span class="stamp">' + esc(t('sc.approved')) + '</span>' : '') + '</div></div>';
        }).join('') + '</div>';
      case 'publisher':
        var days = t('sc.days').split(',');
        var fill = { 0: 'instagram', 1: 'tiktok', 2: 'youtube', 3: 'instagram', 4: 'x', 5: 'tiktok', 6: 'instagram' };
        var grid = st.media && st.media.grid;
        return '<div class="ov ov-pub">' +
          (grid ? '<div class="ovc phone-live" style="--d:.2s"><div class="pl-top" dir="ltr">@unknown.presence.kj</div><div class="pl-screen"><img src="' + esc(grid) + '" alt="' + esc(t('sc.grid.alt')) + '" loading="lazy" decoding="async"></div></div>' : '') +
          '<div class="pub-side"><div class="ovc cal7">' + days.map(function (d, i) {
          return '<div class="cd"><span>' + esc(d) + '</span><i style="--d:' + (i * 0.3 + 0.3) + 's;background:' + PLAT[fill[i]][1] + '"></i>' + (i % 2 ? '' : '<i style="--d:' + (i * 0.3 + 0.5) + 's;background:' + PLAT[fill[(i + 2) % 7]][1] + '"></i>') + '</div>';
        }).join('') + '</div><ul class="ovc ticks">' + ['instagram', 'tiktok', 'youtube', 'x'].map(function (k, i) {
          return '<li style="--d:' + (i * 0.4 + 1.6) + 's"><i style="background:' + PLAT[k][1] + '"></i>' + PLAT[k][0] + '<em>✓ ' + esc(t('sc.published')) + '</em></li>';
        }).join('') + '</ul></div></div>';
      case 'inbox':
        var bars = [34, 52, 41, 68, 77, 63, 92];
        return '<div class="ov ov-inbox"><div class="ovc msg"><span class="who" dir="ltr">@collector.dxb</span><p>' + esc(t('sc.comment')) + '</p>' +
          '<div class="sugg"><span class="ovk">' + esc(t('sc.suggested')) + '</span><p>' + esc(t('sc.reply')) + '</p></div></div>' +
          '<div class="ovc chart"><span class="ovk">' + esc(t('sc.reach')) + '</span><div class="cbars">' + bars.map(function (v, i) { return '<i style="--h:' + v + '%;--d:' + (i * 0.12 + 0.4) + 's"></i>'; }).join('') + '</div><b dir="ltr">+38%</b></div></div>';
    }
    return '';
  }
  function shotHTML(st, i) {
    var m = st.media || {};
    var bg = m.video
      ? '<video class="shot-bg" muted loop playsinline preload="none" ' + (m.poster ? 'poster="' + esc(m.poster) + '"' : '') + ' aria-hidden="true"><source src="' + esc(m.video) + '" type="video/mp4"></video>'
      : ((m.background || (m.images && m.images[0])) ? '<div class="shot-bg" style="background-image:url(\'' + esc(m.background || m.images[0]) + '\')" aria-hidden="true"></div>' : '');
    return '<article class="shot' + (i === R.index ? ' active' : '') + '" id="shot-' + st.id + '" data-step="' + i + '" aria-roledescription="slide" aria-label="' + esc(t('sc.step', { n: i + 1, title: st['title_' + L()] || st.title_en })) + '"' + (R.mode === 'player' && i !== R.index ? ' aria-hidden="true"' : '') + '>' +
      bg + (st.overlay && st.overlay !== 'none' ? overlay(st) : '') +
      '<div class="shot-cap"><span class="num">' + esc(st.num || ('0' + (i + 1))) + '</span><div><h3>' + esc(st['title_' + L()] || st.title_en) + '</h3><p>' + esc(st['caption_' + L()] || st.caption_en) + '</p></div></div>' +
      '<span class="shot-progress" aria-hidden="true"><i></i></span></article>';
  }
  function renderReel() {
    if (!stage) return;
    reel.classList.toggle('static', R.mode === 'static');
    stage.innerHTML = R.steps.map(shotHTML).join('');
    $('reel-dots').innerHTML = R.steps.map(function (st, i) {
      return '<button type="button" class="rdot" data-reel-go="' + i + '" aria-label="' + esc(t('sc.step', { n: i + 1, title: st['title_' + L()] || st.title_en })) + '"' + (i === R.index ? ' aria-current="step"' : '') + '><span>' + esc(st.num || i + 1) + '</span></button>';
    }).join('');
    syncReel();
  }
  function syncReel() {
    var shots = stage.querySelectorAll('.shot');
    shots.forEach(function (sh, i) {
      var on = i === R.index;
      sh.classList.toggle('active', on);
      if (R.mode === 'player') { if (on) sh.removeAttribute('aria-hidden'); else sh.setAttribute('aria-hidden', 'true'); }
      var v = sh.querySelector('video');
      if (v) { if (on && R.playing && R.mode === 'player') { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else v.pause(); }
    });
    document.querySelectorAll('#reel-dots .rdot').forEach(function (d, i) { if (i === R.index) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
    $('reel-count').textContent = (R.index + 1) + ' / ' + R.steps.length;
    var tg = $('reel-toggle');
    tg.setAttribute('aria-pressed', R.playing ? 'false' : 'true');
    tg.setAttribute('aria-label', t(R.playing ? 'sc.pause' : 'sc.play'));
    reel.classList.toggle('paused', !R.playing || R.hover || !R.visible);
    reel.style.setProperty('--dur', ((R.steps[R.index] || {}).duration_ms || R.interval) + 'ms');
    schedule();
  }
  function schedule() {
    clearTimeout(R.timer);
    if (R.mode !== 'player' || !R.playing || R.hover || !R.visible || R.steps.length < 2) return;
    var cur = R.steps[R.index] || {};
    R.timer = setTimeout(function () { goStep(R.index + 1); }, cur.duration_ms || R.interval);
  }
  function goStep(i) {
    if (!R.steps.length) return;
    R.index = (i + R.steps.length) % R.steps.length;
    var cur = stage.querySelector('.shot.active');
    if (cur) { cur.classList.remove('active'); void cur.offsetWidth; }
    syncReel();
  }
  state.reelGo = goStep;
  if (reel) {
    reel.addEventListener('click', function (e) {
      var b = e.target.closest('[data-reel]');
      var d = e.target.closest('[data-reel-go]');
      if (d) { goStep(+d.getAttribute('data-reel-go')); return; }
      if (!b) return;
      var a = b.getAttribute('data-reel');
      if (a === 'next') goStep(R.index + 1);
      if (a === 'prev') goStep(R.index - 1);
      if (a === 'toggle') { R.playing = !R.playing; syncReel(); }
    });
    reel.addEventListener('mouseenter', function () { R.hover = true; syncReel(); });
    reel.addEventListener('mouseleave', function () { R.hover = false; syncReel(); });
    reel.addEventListener('focusin', function () { R.hover = true; syncReel(); });
    reel.addEventListener('focusout', function (e) { if (!reel.contains(e.relatedTarget)) { R.hover = false; syncReel(); } });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { R.visible = en[0].isIntersecting; if (R.steps.length) syncReel(); }, { threshold: 0.25 }).observe(reel);
    }
  }

  /* ---------- Boot ---------- */
  Z.onLang(function () { renderWall(); if (state.lightbox > -1) openLightbox(state.lightbox); if (R.steps.length) renderReel(); });
  if (reel) getJSON('assets/showcase/showcase.json').then(function (data) {
    R.steps = data.steps || [];
    R.interval = data.interval_ms || 5000;
    renderReel();
  }).catch(function (err) { if (window.console) console.warn('Showcase data unavailable', err); });

  getJSON('assets/art/art.json').then(function (data) {
    state.art = data.works || [];
    renderWall();
    return getJSON('assets/media/hero.json').catch(function () { return { videos: [] }; }).then(function (h) {
      var vids = (h && h.videos) || [];
      if (vids.length && !reduce) startVideo(vids, state.art);
      else if (vids.length && reduce && vids[0].poster) { media.style.background = "#0B0B0F url('" + vids[0].poster + "') center/cover"; state.heroMode = 'static'; }
      else startSlides(state.art);
    });
  }).catch(function (err) { if (window.console) console.warn('Gallery data unavailable', err); });
})();
