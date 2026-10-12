/* ZKJ SYSTEM — device UI kit, shared by the live portal (/app/) and the public demo (dashboard.html).
   Plain JS, no dependencies. Builds the dock / iOS tab bar, switches views, and renders the
   instruments (rings, dials, sparklines), iPhone post previews, the film-strip timeline and the swipe stack.
   Everything that is user data goes through ZKJ.esc before it reaches innerHTML. */
(function () {
  'use strict';
  var Z = window.ZKJ;
  var t = Z.t, esc = Z.esc;

  Z.extend({
    en: {
      'dv.sections': 'Sections', 'dv.today': 'Today', 'dv.approvals': 'Approvals', 'dv.approve': 'Approve', 'dv.calendar': 'Calendar',
      'dv.inbox': 'Inbox', 'dv.ads': 'Ads', 'dv.whatsapp': 'WhatsApp', 'dv.reports': 'Reports', 'dv.control': 'Control Center',
      'dv.more': 'More', 'dv.tools': 'Tools', 'dv.insights': 'Insights',
      'dv.swipe.row': 'Swipe through your posts', 'dv.swipe.yes': 'Approve', 'dv.swipe.no': 'Changes',
      'dv.stack.label': 'Posts waiting for approval. Swipe a phone right to approve or left to request changes — or use the buttons under it.',
      'dv.stack.hint': 'Swipe right to approve, left to request changes',
      'dv.prev': 'Previous post', 'dv.next': 'Next post', 'dv.of': '{i} / {n}',
      'dv.now': 'Now', 'dv.tracks': 'Tracks', 'dv.target': '{p}% of target', 'dv.dubai': 'Dubai',
      'dv.ig.liked': 'Preview · not published yet', 'dv.ig.msg': 'Send message', 'dv.ig.audio': 'Original audio', 'dv.ig.follow': 'Follow',
      'dv.hq': 'HQ', 'dv.todo': 'To-do', 'dv.week': 'This week', 'dv.backhq': 'Back to HQ',
      'dv.ig.sponsored': 'Sponsored', 'dv.ig.reply': 'Suggested reply', 'dv.ig.reels': 'Reels', 'dv.ig.dm': 'Message…'
    },
    ar: {
      'dv.sections': 'الأقسام', 'dv.today': 'اليوم', 'dv.approvals': 'الموافقات', 'dv.approve': 'موافقة', 'dv.calendar': 'التقويم',
      'dv.inbox': 'الرسائل', 'dv.ads': 'الإعلانات', 'dv.whatsapp': 'واتساب', 'dv.reports': 'التقارير', 'dv.control': 'مركز التحكم',
      'dv.more': 'المزيد', 'dv.tools': 'الأدوات', 'dv.insights': 'التحليلات',
      'dv.swipe.row': 'تصفّح منشوراتك بالسحب', 'dv.swipe.yes': 'موافقة', 'dv.swipe.no': 'تعديل',
      'dv.stack.label': 'منشورات بانتظار موافقتك. اسحب الهاتف يمينًا للموافقة أو يسارًا لطلب تعديل — أو استخدم الأزرار تحته.',
      'dv.stack.hint': 'اسحب يمينًا للموافقة، ويسارًا لطلب تعديل',
      'dv.prev': 'المنشور السابق', 'dv.next': 'المنشور التالي', 'dv.of': '{i} / {n}',
      'dv.now': 'الآن', 'dv.tracks': 'المسارات', 'dv.target': '{p}% من الهدف', 'dv.dubai': 'دبي',
      'dv.ig.liked': 'معاينة · لم يُنشر بعد', 'dv.ig.msg': 'أرسل رسالة', 'dv.ig.audio': 'صوت أصلي', 'dv.ig.follow': 'متابعة',
      'dv.hq': 'المقر', 'dv.todo': 'مهامك', 'dv.week': 'هذا الأسبوع', 'dv.backhq': 'العودة للمقر',
      'dv.ig.sponsored': 'مُموَّل', 'dv.ig.reply': 'الرد المقترح', 'dv.ig.reels': 'ريلز', 'dv.ig.dm': 'رسالة…'
    }
  });

  function $(id) { return document.getElementById(id); }
  function L() { return Z.getLang(); }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobileMQ = window.matchMedia ? window.matchMedia('(max-width: 699px)') : { matches: false };

  /* ---------- Icons (24px, stroke) ---------- */
  var S = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var IC = {
    today: S + '<circle cx="12" cy="13" r="8"/><path d="M12 13l3.5-3.5M12 2v3M5 6l1.5 1.5M19 6l-1.5 1.5"/><circle cx="12" cy="13" r="1.2" fill="currentColor"/></svg>',
    approvals: S + '<rect x="6.5" y="2" width="11" height="20" rx="3"/><path d="M10.5 4.5h3"/><path d="M9.3 12.3l2 2 3.6-4"/></svg>',
    calendar: S + '<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><path d="M7 13.5h3M7 17h6"/></svg>',
    inbox: S + '<path d="M4 5.5h16v10.5H10l-4.5 3.5V16H4z"/><path d="M8 10h8M8 13h5"/></svg>',
    ads: S + '<path d="M3.5 10v4h3l6.5 4.5v-13L6.5 10z"/><path d="M16.5 9a4 4 0 010 6M19 6.5a7.5 7.5 0 010 11"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.56 2 2.1 6.45 2.1 11.93c0 1.75.46 3.46 1.33 4.97L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22c5.47 0 9.93-4.45 9.93-9.93A9.9 9.9 0 0012.04 2zm4.53 11.99c-.25-.12-1.47-.72-1.7-.8-.23-.09-.39-.13-.56.12-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.57c.12.17 1.75 2.67 4.24 3.74 1.48.64 2.06.7 2.8.59.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.29z"/></svg>',
    reports: S + '<path d="M6.5 2.5h8l4 4v15h-12z"/><path d="M14.5 2.5v4h4M9.5 12h6M9.5 15.5h6M9.5 8.5h2"/></svg>',
    control: S + '<rect x="3" y="3.5" width="18" height="7.5" rx="3.75"/><circle cx="7" cy="7.25" r="2" fill="currentColor"/><rect x="3" y="13" width="18" height="7.5" rx="3.75"/><circle cx="17" cy="16.75" r="2" fill="currentColor"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg>',
    tools: S + '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/></svg>',
    insights: S + '<path d="M3 20.5h18"/><path d="M6 17v-5M10.5 17V7M15 17v-7M19.5 17V4"/></svg>',
    upload: S + '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5"/><path d="M4 15v4a1.5 1.5 0 001.5 1.5h13A1.5 1.5 0 0020 19v-4"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    pencil: S + '<path d="M4 20l1-4.5L16 4.5a2.1 2.1 0 013 3L8 18.5z"/><path d="M14 6.5l3 3"/></svg>',
    left: S + '<path d="M15 5l-7 7 7 7"/></svg>',
    right: S + '<path d="M9 5l7 7-7 7"/></svg>',
    swipe: S + '<path d="M4 12h15M15 8l4 4-4 4"/></svg>',
    swipeL: S + '<path d="M20 12H5M9 8l-4 4 4 4"/></svg>',
    back: S + '<path d="M14.5 5l-7 7 7 7"/></svg>',
    site: S + '<path d="M10 14a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1-1"/></svg>',
    signout: S + '<path d="M14 4h4.5A1.5 1.5 0 0120 5.5v13a1.5 1.5 0 01-1.5 1.5H14"/><path d="M9.5 16.5L5 12l4.5-4.5M5 12h10"/></svg>',
    globe: S + '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg>',
    plus: S + '<path d="M12 5v14M5 12h14"/></svg>',
    number: S + '<path d="M4 18l4-6 4 3 6-9"/><path d="M15 6h3v3"/></svg>',
    bell: S + '<path d="M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 004 0"/></svg>',
    box: S + '<path d="M12 2.5l8.5 4.75v9.5L12 21.5l-8.5-4.75v-9.5z"/><path d="M12 12l8.5-4.75M12 12L3.5 7.25M12 12v9.5"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 8 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 1.5l5 5-5 5"/></svg>',
    // instagram glyphs (white, inside the phone)
    heart: S + '<path d="M12 20s-7.5-4.35-7.5-10A4.25 4.25 0 0112 7.6 4.25 4.25 0 0119.5 10c0 5.65-7.5 10-7.5 10z"/></svg>',
    comment: S + '<path d="M20 11.5a8 8 0 01-11.7 7.1L4 20l1.4-4.1A8 8 0 1120 11.5z"/></svg>',
    send: S + '<path d="M21 3.5L10.5 13.5M21 3.5l-6.5 17-4-7-7-4z"/></svg>',
    save: S + '<path d="M6 3.5h12v17l-6-4.5-6 4.5z"/></svg>',
    home: S + '<path d="M3.5 11L12 3.5l8.5 7.5V20.5h-6v-6h-5v6h-6z"/></svg>',
    search: S + '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/></svg>',
    add: S + '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><path d="M12 8v8M8 12h8"/></svg>',
    reel: S + '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><path d="M3.5 8.5h17M9 3.5l2.5 5M14.5 3.5l2.5 5"/><path d="M10.5 12v5l4-2.5z" fill="currentColor"/></svg>',
    camera: S + '<path d="M4 8.5h3l1.5-2.5h7L17 8.5h3V19H4z"/><circle cx="12" cy="13.5" r="3.5"/></svg>',
    music: S + '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z"/></svg>'
  };
  function icon(n) { return IC[n] || ''; }

  /* ---------- Navigation: dock (desktop), tab bar + More (mobile) ---------- */
  var NAV = { items: [], tabs: [], current: 'today', listeners: [], avail: {} };
  function itemById(id) { for (var i = 0; i < NAV.items.length; i++) if (NAV.items[i].id === id) return NAV.items[i]; return null; }
  function calIcon() {
    var d = new Date();
    var wd = new Intl.DateTimeFormat(L() === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { weekday: 'short', timeZone: 'Asia/Dubai' }).format(d);
    var dd = new Intl.DateTimeFormat('en-GB', { day: 'numeric', timeZone: 'Asia/Dubai' }).format(d);
    return '<span class="cal-ic"><small>' + esc(wd) + '</small><b>' + esc(dd) + '</b></span>';
  }
  function navIcon(it) { return it.tone === 'cal' ? calIcon() : icon(it.icon || it.id); }

  function buildNav(cfg) {
    NAV.items = cfg.items; NAV.tabs = cfg.tabs || ['today', 'approvals', 'calendar', 'more'];
    var dock = $('dock'), tabbar = $('tabbar'), more = $('more-nav');
    if (dock) {
      dock.innerHTML = NAV.items.map(function (it) {
        return (it.sep ? '<span class="dock-sep" aria-hidden="true"></span>' : '') +
          '<button class="dock-item" type="button" data-nav="' + it.id + '" id="dock-' + it.id + '"' + (it.tone ? ' data-tone="' + it.tone + '"' : '') + '>' +
          '<span class="dock-icon" data-dock-icon>' + navIcon(it) + '</span>' +
          '<span class="dock-label" data-i18n="' + it.key + '">' + esc(t(it.key)) + '</span>' +
          '<span class="nav-badge" hidden></span><span class="dock-dot" aria-hidden="true"></span></button>';
      }).join('');
    }
    if (tabbar) {
      tabbar.innerHTML = NAV.tabs.map(function (id) {
        var it = itemById(id) || { id: id, key: 'dv.' + id, icon: id };
        var key = id === 'approvals' ? 'dv.approve' : it.key;
        return '<button class="tab" type="button" data-nav="' + id + '" id="tab-' + id + '">' + icon(it.icon || id) +
          '<span data-i18n="' + key + '">' + esc(t(key)) + '</span><span class="nav-badge" hidden></span></button>';
      }).join('');
    }
    if (more) {
      more.innerHTML = NAV.items.filter(function (it) { return NAV.tabs.indexOf(it.id) < 0; }).map(function (it) {
        return '<li id="more-' + it.id + '"><button class="ios-row" type="button" data-nav="' + it.id + '"><span class="ri">' + icon(it.icon || it.id) + '</span>' +
          '<span data-i18n="' + it.key + '">' + esc(t(it.key)) + '</span><span class="rv"><span class="nav-badge-inline" hidden></span></span>' + IC.chev + '</button></li>';
      }).join('');
    }
    if (!NAV.langHooked) {
      NAV.langHooked = true;
      Z.onLang(function () { document.querySelectorAll('[data-dock-icon]').forEach(function (el) { var b = el.closest('[data-nav]'); var it = b && itemById(b.getAttribute('data-nav')); if (it && it.tone === 'cal') el.innerHTML = calIcon(); }); });
    }
    // the nav can be rebuilt (e.g. HQ ↔ client workspace): keep earlier availability decisions
    Object.keys(NAV.avail).forEach(function (id) { ['dock-' + id, 'more-' + id].forEach(function (x) { var el = $(x); if (el) el.hidden = !NAV.avail[id]; }); });
    paintNav();
  }
  function panel(id) { return document.querySelector('[data-view-panel="' + id + '"]'); }
  function isAvail(id) { return NAV.avail[id] !== false && !!panel(id) && !panel(id).hidden; }
  function paintNav() {
    var cur = NAV.current;
    var tabCur = NAV.tabs.indexOf(cur) > -1 ? cur : 'more';
    document.querySelectorAll('.dock-item[data-nav]').forEach(function (b) {
      if (b.getAttribute('data-nav') === cur) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    document.querySelectorAll('.tab[data-nav]').forEach(function (b) {
      if (b.getAttribute('data-nav') === tabCur) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    var root = $('dash'); if (root) root.setAttribute('data-view', cur);
  }
  function show(id, opts) {
    opts = opts || {};
    if (!isAvail(id)) id = 'today';
    var prev = NAV.current;
    NAV.current = id;
    document.querySelectorAll('[data-view-panel]').forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-view-panel') === id); });
    paintNav();
    if (prev !== id || opts.force) {
      var sc = document.querySelector('.win-content');
      if (sc) sc.scrollTop = 0;
      if (mobileMQ.matches) window.scrollTo(0, 0);
      var d = document.querySelector('.dock-item[data-nav="' + id + '"]');
      if (d && !reduce && opts.bounce !== false) { d.classList.remove('bounce'); void d.offsetWidth; d.classList.add('bounce'); }
    }
    if (opts.focus) {
      var h = panel(id) && panel(id).querySelector('[data-view-title]');
      if (h) { if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
    }
    NAV.listeners.forEach(function (fn) { try { fn(id, prev); } catch (e) { /* ignore */ } });
  }
  function setAvailable(id, on) {
    NAV.avail[id] = !!on;
    ['dock-' + id, 'more-' + id].forEach(function (x) { var el = $(x); if (el) el.hidden = !on; });
    var p = panel(id); if (p && p.hasAttribute('data-gated')) p.hidden = !on;
    if (!on && NAV.current === id) show('today');
  }
  function setBadge(id, n) {
    ['dock-' + id, 'tab-' + id].forEach(function (x) {
      var el = $(x); if (!el) return;
      var b = el.querySelector('.nav-badge'); if (!b) return;
      b.textContent = n > 99 ? '99+' : String(n); b.hidden = !n;
    });
    var m = $('more-' + id), mb = m && m.querySelector('.nav-badge-inline');
    if (mb) { mb.textContent = n; mb.hidden = !n; }
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-nav]');
    if (!el) return;
    e.preventDefault();
    show(el.getAttribute('data-nav'), { focus: true });
  });

  /* ---------- Dubai clock ---------- */
  function clock(el, mode) {
    if (!el) return;
    function tick() {
      var d = new Date(), loc = L() === 'ar' ? 'ar-u-nu-latn' : 'en-GB';
      if (mode === 'menubar') {
        var day = new Intl.DateTimeFormat(loc, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Dubai' }).format(d);
        var tm = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Dubai' }).format(d);
        el.textContent = day + '  ' + tm;
      } else if (typeof mode === 'function') mode(el, d);
    }
    tick(); setInterval(tick, 15000); Z.onLang(tick);
  }

  /* ---------- Instruments ---------- */
  var gid = 0;
  function uid(p) { gid += 1; return p + '-' + gid; }
  // Apple Watch–style ring. pct 0..1
  function ring(pct, o) {
    o = o || {};
    pct = Math.max(0, Math.min(1, pct || 0));
    var r = 82, C = 2 * Math.PI * r, id = uid('rg');
    var ticks = '';
    for (var i = 0; i < 60; i++) {
      var a = i / 60 * Math.PI * 2, r1 = i % 5 ? 98 : 95, r2 = 100;
      ticks += '<line x1="' + (100 + r1 * Math.sin(a)).toFixed(1) + '" y1="' + (100 - r1 * Math.cos(a)).toFixed(1) + '" x2="' + (100 + r2 * Math.sin(a)).toFixed(1) + '" y2="' + (100 - r2 * Math.cos(a)).toFixed(1) + '"/>';
    }
    var off = (C * (1 - Math.max(pct, .012))).toFixed(1);
    return '<svg viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + (o.c1 || '#F6E7B4') + '"/><stop offset=".55" stop-color="' + (o.c2 || '#D4AF37') + '"/><stop offset="1" stop-color="' + (o.c3 || '#8E6E17') + '"/></linearGradient>' +
      '<filter id="' + id + 'g" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.5"/></filter></defs>' +
      '<g stroke="rgba(255,255,255,.22)" stroke-width="1">' + ticks + '</g>' +
      '<circle cx="100" cy="100" r="' + r + '" fill="none" stroke="' + (o.track || 'rgba(212,175,55,.12)') + '" stroke-width="16"/>' +
      '<g transform="rotate(-90 100 100)">' +
      '<circle class="ring-arc" cx="100" cy="100" r="' + r + '" fill="none" stroke="url(#' + id + ')" stroke-width="16" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (reduce ? off : C.toFixed(1)) + '" data-off="' + off + '" filter="url(#' + id + 'g)" opacity=".55"/>' +
      '<circle class="ring-arc" cx="100" cy="100" r="' + r + '" fill="none" stroke="url(#' + id + ')" stroke-width="16" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (reduce ? off : C.toFixed(1)) + '" data-off="' + off + '"/>' +
      '</g></svg>';
  }
  // Engineering gauge dial, 240° sweep. pct 0..1, labels = [min, max]
  function gauge(pct, o) {
    o = o || {};
    pct = Math.max(0, Math.min(1, pct || 0));
    var cx = 100, cy = 100, r = 80;
    function pt(deg, rad) { var a = deg * Math.PI / 180; return [(cx + rad * Math.cos(a)).toFixed(2), (cy + rad * Math.sin(a)).toFixed(2)]; }
    function arc(a0, a1, rad) { var p0 = pt(a0, rad), p1 = pt(a1, rad); return 'M' + p0[0] + ' ' + p0[1] + ' A' + rad + ' ' + rad + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + p1[0] + ' ' + p1[1]; }
    var id = uid('gg'), ticks = '', labels = '';
    for (var i = 0; i <= 40; i++) {
      var deg = 150 + i * 6, major = i % 10 === 0, mid = i % 5 === 0;
      var a = pt(deg, major ? 88 : mid ? 91 : 94), b = pt(deg, 99);
      ticks += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + (major ? 'rgba(234,217,166,.9)' : 'rgba(255,255,255,.28)') + '" stroke-width="' + (major ? 1.6 : 1) + '"/>';
      if (major) { var lp = pt(deg, 75); labels += '<text x="' + lp[0] + '" y="' + (+lp[1] + 3).toFixed(1) + '" text-anchor="middle">' + Math.round((o.max || 100) * i / 40) + '</text>'; }
    }
    var zones = '<path d="' + arc(150, 246, 64) + '" stroke="rgba(229,83,75,.55)"/><path d="' + arc(246, 318, 64) + '" stroke="rgba(224,164,58,.55)"/><path d="' + arc(318, 390, 64) + '" stroke="rgba(63,191,115,.55)"/>';
    var end = pt(150 + 240 * pct, r);
    return '<svg viewBox="0 0 200 172" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#8E6E17"/><stop offset=".6" stop-color="#D4AF37"/><stop offset="1" stop-color="#F6E7B4"/></linearGradient></defs>' +
      '<path d="' + arc(150, 390, r) + '" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="10" stroke-linecap="round"/>' +
      '<path class="ring-arc" d="' + arc(150, 390, r) + '" fill="none" stroke="url(#' + id + ')" stroke-width="10" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="' + (reduce ? (100 - pct * 100).toFixed(1) : 100) + '" data-off="' + (100 - pct * 100).toFixed(1) + '"/>' +
      '<g fill="none" stroke-width="3">' + zones + '</g>' + ticks +
      '<g font-family="IBM Plex Mono, monospace" font-size="8.5" fill="rgba(255,255,255,.5)">' + labels + '</g>' +
      '<g class="needle" style="transform: rotate(' + (reduce ? 240 * pct : 0) + 'deg)" data-rot="' + (240 * pct).toFixed(1) + '">' +
      '<path d="M' + pt(150, 70)[0] + ' ' + pt(150, 70)[1] + ' L' + pt(240, 4)[0] + ' ' + pt(240, 4)[1] + ' L' + pt(60, 4)[0] + ' ' + pt(60, 4)[1] + 'Z" fill="#F6E7B4"/></g>' +
      '<circle cx="100" cy="100" r="7" fill="#0B0B0F" stroke="#D4AF37" stroke-width="2"/>' +
      '<circle cx="' + end[0] + '" cy="' + end[1] + '" r="3" fill="#fff" opacity=".9"/></svg>';
  }
  function spark(values, o) {
    o = o || {};
    if (!values || values.length < 2) return '';
    var min = Math.min.apply(null, values), max = Math.max.apply(null, values), span = (max - min) || 1;
    var pts = values.map(function (v, i) { return [(i / (values.length - 1) * 100).toFixed(2), (28 - (v - min) / span * 24).toFixed(2)]; });
    var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join(' ');
    var id = uid('sp'), last = pts[pts.length - 1];
    return '<svg viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D4AF37" stop-opacity=".35"/><stop offset="1" stop-color="#D4AF37" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="' + line + ' L100 32 L0 32Z" fill="url(#' + id + ')"/>' +
      '<path d="' + line + '" fill="none" stroke="#EAD9A6" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>' +
      '<circle cx="' + last[0] + '" cy="' + last[1] + '" r="2.2" fill="#fff" vector-effect="non-scaling-stroke"/></svg>';
  }
  // after inserting instruments: sweep rings and needles to their value
  function animateIn(root) {
    if (!root || reduce) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.querySelectorAll('.ring-arc[data-off]').forEach(function (c) { c.setAttribute('stroke-dashoffset', c.getAttribute('data-off')); });
        root.querySelectorAll('.needle[data-rot]').forEach(function (n) { n.style.transform = 'rotate(' + n.getAttribute('data-rot') + 'deg)'; });
      });
    });
  }

  /* ---------- Post placeholder art ---------- */
  function hash(s) { var h = 2166136261; s = String(s || ''); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function art(o) {
    var h = hash(o.seed), a = o.a || '#15151B', b = o.b || '#D4AF37';
    var vx = 20 + (h % 60), vy = 18 + ((h >> 8) % 50), lines = '';
    for (var i = 0; i < 16; i++) {
      var ex = i < 8 ? (i / 7) * 100 : 100 - ((i - 8) / 7) * 100, ey = i < 8 ? 125 : -5;
      lines += '<line x1="' + vx + '" y1="' + vy + '" x2="' + ex.toFixed(1) + '" y2="' + ey + '"/>';
    }
    var beamA = (h >> 4) % 2 ? '0,0 ' + (vx + 6) + ',' + vy + ' ' + (vx - 6) + ',' + vy : '100,0 ' + (vx + 6) + ',' + vy + ' ' + (vx - 6) + ',' + vy;
    var bid = 'ab' + h.toString(36) + (o.sfx || '');
    var bg = 'radial-gradient(90% 60% at ' + vx + '% ' + vy + '%, color-mix(in srgb, ' + b + ' 55%, transparent) 0%, transparent 60%), linear-gradient(165deg, color-mix(in srgb, ' + a + ' 70%, #222) 0%, #050507 85%)';
    var play = (o.kind === 'reel' || o.kind === 'story') && !o.full ? '<span class="art-play">' + IC.play + '</span>' : '';
    return '<div class="art" style="--art-bg:' + esc(bg) + '">' +
      '<svg class="art-lines" viewBox="0 0 100 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="' + bid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + esc(b) + '" stop-opacity=".55"/><stop offset="1" stop-color="' + esc(b) + '" stop-opacity="0"/></linearGradient></defs>' +
      '<polygon points="' + beamA + '" fill="url(#' + bid + ')" opacity=".55"/>' +
      '<g stroke="rgba(255,255,255,.13)" stroke-width=".35">' + lines + '</g>' +
      '<circle cx="' + vx + '" cy="' + vy + '" r="1.6" fill="' + esc(b) + '"/><circle cx="' + vx + '" cy="' + vy + '" r="9" fill="none" stroke="' + esc(b) + '" stroke-opacity=".35" stroke-width=".4"/></svg>' +
      (o.title ? '<span class="art-title">' + esc(o.title) + '</span>' : '') + play +
      (o.mark ? '<span class="art-mark">' + esc(o.mark) + '</span>' : '') + '</div>';
  }

  /* ---------- iPhone with an Instagram-style preview ---------- */
  var SBAR = '<div class="sbar"><span>9:41</span><span class="sb-icons"><svg viewBox="0 0 18 11" fill="#fff" aria-hidden="true"><rect x="0" y="7" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="6" rx="1"/><rect x="10" y="2.5" width="3" height="8.5" rx="1"/><rect x="15" y="0" width="3" height="11" rx="1"/></svg><svg viewBox="0 0 16 11" fill="#fff" aria-hidden="true"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.3A10.2 10.2 0 008 .4 10.2 10.2 0 00.8 3.3L2 4.6a8.4 8.4 0 016-2.4zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.2-1.3A6.6 6.6 0 008 4a6.6 6.6 0 00-4.6 1.8l1.2 1.3c.9-.8 2.1-1.3 3.4-1.3zM8 11l2.2-2.3a3.1 3.1 0 00-4.4 0z"/></svg><svg viewBox="0 0 26 12" aria-hidden="true"><rect x=".5" y=".5" width="22" height="11" rx="3.5" fill="none" stroke="rgba(255,255,255,.5)"/><rect x="2" y="2" width="17" height="8" rx="2" fill="#fff"/><rect x="23.5" y="4" width="1.8" height="4" rx=".9" fill="rgba(255,255,255,.5)"/></svg></span></div>';
  var STAMPS = '<div class="stamp yes" aria-hidden="true"><span>' + IC.check + '</span></div><div class="stamp no" aria-hidden="true"><span>' + IC.pencil + '</span></div>';
  function avatar(o) { return '<span class="ig-av"><span>' + (o.avatar || '') + '</span></span>'; }
  function head(o, sub) {
    return '<div class="ig-head">' + avatar(o) + '<span class="ig-who"><b>' + esc(o.handle || '') + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span><span class="ig-more" aria-hidden="true">•••</span></div>';
  }
  function cap(o) { return '<p class="ig-cap"><b>' + esc(o.handle || '') + '</b>' + esc(o.caption || '') + '</p>'; }
  function phone(o) {
    var k = o.kind, screen;
    var sharedNav = '<div class="ig-nav" aria-hidden="true">' + IC.home + IC.search + IC.add + IC.reel + '<span class="me">' + (o.avatar || '') + '</span></div>';
    if (k === 'reel' || k === 'story') {
      var top = k === 'reel'
        ? '<div class="reel-top"><span>' + esc(t('dv.ig.reels')) + '</span>' + IC.camera + '</div>'
        : '<div class="story-bars" aria-hidden="true"><i></i><i></i><i></i></div>' + head(o, o.when);
      var bottom = k === 'reel'
        ? '<div class="reel-side" aria-hidden="true">' + IC.heart + IC.comment + IC.send + '</div>' +
          '<div class="reel-bottom"><div class="ig-head">' + avatar(o) + '<span class="ig-who"><b>' + esc(o.handle || '') + '</b></span><span class="follow">' + esc(t('dv.ig.follow')) + '</span></div>' +
          '<p class="ig-cap">' + esc(o.caption || '') + '</p><span class="reel-audio">' + IC.music.replace('<svg ', '<svg width="11" height="11" ') + esc(o.handle || '') + ' · ' + esc(t('dv.ig.audio')) + '</span></div>'
        : (o.caption ? '<p class="story-cap">' + esc(o.caption) + '</p>' : '') + '<div class="story-bottom" aria-hidden="true"><span class="msg">' + esc(t('dv.ig.msg')) + '</span>' + IC.heart + IC.send + '</div>';
      screen = '<div class="screen is-full"><div class="full-media">' + o.media + '</div>' + SBAR + top + bottom + '</div>';
    } else if (k === 'reply') {
      screen = '<div class="screen">' + SBAR + head(o, t('dv.ig.reply')) +
        '<div class="dm-thread">' + (o.question ? '<p class="dm-bubble them">' + esc(o.question) + '</p>' : '') + '<p class="dm-bubble me">' + esc(o.caption || '') + '</p></div>' +
        '<div class="dm-input" aria-hidden="true">' + esc(t('dv.ig.dm')) + '</div></div>';
    } else {
      var count = k === 'carousel' ? '<span class="ig-count">1/' + (o.slides || 5) + '</span>' : '';
      var dots = k === 'carousel' ? '<span class="ig-dots" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>' : '';
      screen = '<div class="screen">' + SBAR + head(o, k === 'ad' ? t('dv.ig.sponsored') : o.place) +
        '<div class="ig-media">' + o.media + count + '</div>' +
        '<div class="ig-acts" aria-hidden="true">' + IC.heart + IC.comment + IC.send + dots + '<span class="save">' + IC.save + '</span></div>' +
        cap(o) + '<p class="ig-time">' + esc(o.when || t('dv.ig.liked')) + '</p>' + sharedNav + '</div>';
    }
    screen = screen.slice(0, -6) + STAMPS + '</div>';
    return '<div class="iphone"><span class="island" aria-hidden="true"></span>' + screen + '<span class="home-ind" aria-hidden="true"></span></div>';
  }

  /* ---------- Film-strip timeline ---------- */
  // o: { days:[{name, num, today}], tracks:[{label, color, clips:[{id, day, mins, time, title, dot, status, dim}]}], now: 0..1|null, nowLabel, action }
  function timeline(o) {
    var LANE = 74, RULER = 54;
    var labels = '<div class="tl-labels"><div class="tl-corner" style="height:' + RULER + 'px">' + esc(t('dv.tracks')) + '</div>';
    var lanes = '<div class="tl-lanes"><div class="tl-ruler">' + o.days.map(function (d) {
      return '<div class="' + (d.today ? 'is-today' : '') + '"><b>' + esc(d.name) + '</b><span>' + esc(d.num) + '</span></div>';
    }).join('') + '</div>';
    o.tracks.forEach(function (tr) {
      var perDay = {}, maxLane = 0;
      var clips = tr.clips.slice().sort(function (a, b) { return a.day - b.day || a.mins - b.mins; }).map(function (c) {
        var lane = perDay[c.day] = (perDay[c.day] === undefined ? 0 : perDay[c.day] + 1);
        maxLane = Math.max(maxLane, lane);
        return '<button class="cal-item clip' + (c.dim ? ' is-dim' : '') + (c.wave ? ' has-wave' : '') + '" type="button" data-action="' + (o.action || 'cal-item') + '" data-id="' + esc(c.id) + '" style="--pc:' + esc(c.color || tr.color) + ';inset-inline-start:calc(' + (c.day / 7 * 100).toFixed(4) + '% + 4px);top:' + (8 + lane * LANE) + 'px">' +
          '<span class="ci-top"><span dir="ltr">' + esc(c.time) + '</span><span>' + esc(c.kind || '') + '</span></span>' +
          '<span class="ci-title">' + esc(c.title) + '</span>' +
          '<span class="ci-status"><span class="dot ' + esc(c.dot || 'off') + '"></span>' + esc(c.status || '') + '</span>' + (c.wave ? wave(c.id) : '') + '</button>';
      });
      var hgt = Math.max(82, 16 + (maxLane + 1) * LANE - 8);
      labels += '<div class="tl-label" style="height:' + hgt + 'px">' + (tr.code ? '<span class="tl-code">' + esc(tr.code) + '</span>' : '<span class="pdot-round" style="background:' + esc(tr.color) + ';color:' + esc(tr.color) + '"></span>') + '<span class="tl-name">' + esc(tr.label) + '</span></div>';
      lanes += '<div class="tl-track" style="height:' + hgt + 'px">' + clips.join('') + '</div>';
    });
    if (o.now !== null && o.now !== undefined && o.now >= 0 && o.now <= 1) lanes += '<span class="playhead" style="inset-inline-start:' + (o.now * 100).toFixed(3) + '%"><span>' + esc(o.nowLabel || t('dv.now')) + '</span></span>';
    lanes += '</div>';
    labels += '</div>';
    return '<div class="tl-scroll"><div class="tl-grid"><div class="tl-perf" aria-hidden="true"></div>' + labels + lanes + '<div class="tl-perf bottom" aria-hidden="true"></div></div></div>';
  }
  function wave(seed) {
    var h = hash(seed), bars = '';
    for (var i = 0; i < 40; i++) { h = Math.imul(h ^ (h >>> 13), 1103515245) + 12345 >>> 0; var v = 2 + (h % 9); bars += '<rect x="' + (i * 2.5) + '" y="' + (6 - v / 2).toFixed(1) + '" width="1.4" height="' + v + '" rx=".7"/>'; }
    return '<svg class="wave" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true"><g fill="rgba(255,255,255,.55)">' + bars + '</g></svg>';
  }
  // keep the playhead in view on narrow screens
  function revealNow(root) {
    var sc = root && root.querySelector('.tl-scroll'), ph = root && root.querySelector('.playhead');
    if (!sc || !ph || sc.scrollWidth <= sc.clientWidth) return;
    var rtl = document.documentElement.dir === 'rtl';
    var lanes = sc.querySelector('.tl-lanes');
    var x = ph.offsetLeft + (lanes ? lanes.offsetLeft : 0);
    var target = Math.max(0, x - sc.clientWidth * .35);
    sc.scrollLeft = rtl ? -(sc.scrollWidth - sc.clientWidth - target) : target;
  }

  /* ---------- Phone row (desktop) + swipe stack (mobile) ---------- */
  function rowNav(list, prev, next, count) {
    if (!list) return;
    function step() { var li = list.querySelector('li'); return li ? li.getBoundingClientRect().width + 40 : 340; }
    function idx() { return Math.round(Math.abs(list.scrollLeft) / step()); }
    function upd() {
      var n = list.querySelectorAll(':scope > li.appr-slot').length;
      if (count) count.textContent = n ? t('dv.of', { i: Math.min(n, idx() + 1), n: n }) : '';
      var max = list.scrollWidth - list.clientWidth;
      if (prev) prev.disabled = Math.abs(list.scrollLeft) < 4;
      if (next) next.disabled = Math.abs(list.scrollLeft) >= max - 4;
    }
    var rtl = function () { return document.documentElement.dir === 'rtl' ? -1 : 1; };
    if (prev) prev.addEventListener('click', function () { list.scrollBy({ left: -step() * rtl(), behavior: reduce ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { list.scrollBy({ left: step() * rtl(), behavior: reduce ? 'auto' : 'smooth' }); });
    list.addEventListener('scroll', function () { window.requestAnimationFrame(upd); }, { passive: true });
    window.addEventListener('resize', upd);
    return upd;
  }
  function swipe(list, h) {
    if (!list || !window.PointerEvent) return;
    var st = null, TH = 100;
    list.addEventListener('pointerdown', function (e) {
      if (!mobileMQ.matches || e.button > 0) return;
      var ph = e.target.closest('.iphone'); if (!ph) return;
      var li = ph.closest('li'); if (!li || li !== list.firstElementChild) return;
      var card = ph.closest('.phone-card'); if (!card || card.getAttribute('data-pending') !== '1' || card.classList.contains('is-approving')) return;
      st = { x: e.clientX, y: e.clientY, ph: ph, card: card, id: card.getAttribute('data-id'), dx: 0, on: false, pid: e.pointerId, past: false };
    });
    list.addEventListener('pointermove', function (e) {
      if (!st || e.pointerId !== st.pid) return;
      var dx = e.clientX - st.x, dy = e.clientY - st.y;
      if (!st.on) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) { st.on = true; st.ph.classList.add('dragging'); try { st.ph.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ } }
        else if (Math.abs(dy) > 10) { st = null; return; }
        else return;
      }
      st.dx = dx;
      st.ph.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx / 22).toFixed(2) + 'deg)';
      st.card.classList.toggle('swipe-right', dx > 40);
      st.card.classList.toggle('swipe-left', dx < -40);
      var past = Math.abs(dx) > TH;
      if (past !== st.past) { st.past = past; if (past && !reduce && st.ph.animate) st.ph.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(1.25)' }, { filter: 'brightness(1)' }], { duration: 180 }); }
    });
    function end(e) {
      if (!st || (e && e.pointerId !== st.pid)) return;
      var s = st; st = null;
      if (!s.on) return;
      s.ph.classList.remove('dragging');
      s.ph.style.transform = '';
      if (s.dx > TH) { s.card.classList.add('is-flown-right'); h.approve(s.id, s.card); }
      else if (s.dx < -TH) { s.card.classList.add('is-flown-left'); h.changes(s.id, s.card); }
      else { s.card.classList.remove('swipe-right', 'swipe-left'); }
    }
    list.addEventListener('pointerup', end);
    list.addEventListener('pointercancel', end);
    // a drag must not also count as a click on the phone
    list.addEventListener('click', function (e) { if (e.target.closest('.iphone.dragging')) e.stopPropagation(); }, true);
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); }

  function fillIcons(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(function (el) { if (!el.firstElementChild) el.innerHTML = icon(el.getAttribute('data-icon')); });
  }
  fillIcons();

  /* ---------- Ambient layer (living background) ---------- */
  // Logos with known geometry: the KJ VISION emblem's two eyes glow and blink.
  var LOGO_GEOM = [
    { re: /kjvision-emblem/i, ar: '1000 / 681', eyes: [[26.96, 49.71], [73.04, 49.71]], d: 8.5 },
    { re: /zkjverse-mark/i, ar: '839 / 739' },
    { re: /zkjsystem-icon/i, ar: '93.48 / 106.08' }
  ];
  function cssUrl(u) { return 'url(&quot;' + esc(String(u).replace(/["\\\n\r]/g, '')) + '&quot;)'; }
  function neonLogo(url, cls) {
    if (!url) return '';
    var g = null; for (var i = 0; i < LOGO_GEOM.length; i++) if (LOGO_GEOM[i].re.test(url)) { g = LOGO_GEOM[i]; break; }
    var eyes = g && g.eyes ? g.eyes.map(function (e) { return '<span class="eye" style="left:' + e[0] + '%;top:' + e[1] + '%;width:' + g.d + '%"></span>'; }).join('') : '';
    return '<div class="neon-logo' + (cls ? ' ' + cls : '') + (eyes ? ' has-eyes' : '') + '" style="--ar:' + (g ? g.ar : '1') + '" aria-hidden="true"><i style="--logo:' + cssUrl(url) + '"></i>' + eyes + '</div>';
  }
  var CUBE_D = 'M48 95.04 L88.74 71.52 L88.74 24.48 L48 0.96 L7.26 24.48 L7.26 71.52ZM51.5 84.94 L51.5 55 L51.5 54.55 L48 58.05 L44.5 54.55 L44.5 55 L44.5 84.94 L17.76 69.5 L43.69 54.53 L44.19 54.24 L39.07 49.11 L14.26 63.44 L14.26 32.56 L39.07 46.89 L44.19 41.76 L17.76 26.5 L44.5 11.06 L44.5 41 L44.5 41.45 L48 37.95 L51.5 41.45 L51.5 41 L51.5 11.06 L78.24 26.5 L52.31 41.47 L51.81 41.76 L56.93 46.89 L81.74 32.56 L81.74 67.48ZM52.31 54.53 L53.4 52.64 L51.81 54.24Z';
  // the cube's real edges with a light signal travelling along them
  function cubeLight(cls) {
    return '<svg class="cube-light' + (cls ? ' ' + cls : '') + '" viewBox="1.26 -5.04 93.48 106.08" aria-hidden="true">' +
      '<path class="cl-base" d="' + CUBE_D + '"/><path class="cl-core" d="M48 40.5 L55.5 48 L48 55.5 L40.5 48Z"/>' +
      '<path class="cl-sig" pathLength="1" d="' + CUBE_D + '"/><path class="cl-sig s2" pathLength="1" d="' + CUBE_D + '"/></svg>';
  }
  function fxLayers() {
    var motes = ''; for (var i = 0; i < 14; i++) motes += '<i style="left:' + ((i * 37) % 100) + '%;animation-delay:-' + ((i * 2.3) % 18).toFixed(1) + 's;animation-duration:' + (14 + (i % 5) * 2) + 's"></i>';
    return '<div class="amb-aurora"><b></b><b></b><b></b>' + motes + '</div>' +
      '<div class="amb-blue"><div class="grid"></div>' +
      '<svg class="dims" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice"><g class="scan"><line x1="80" y1="520" x2="560" y2="520"/><path d="M80 512v16M560 512v16M80 520l10-4v8zM560 520l-10-4v8z"/><text x="290" y="510">4 800</text></g>' +
      '<line x1="940" y1="120" x2="940" y2="460"/><path d="M932 120h16M932 460h16"/><text x="900" y="300" transform="rotate(-90 900 300)">3 400</text>' +
      '<path d="M120 90h160M120 90v80" /><text x="128" y="84">± 0.00</text><circle cx="120" cy="90" r="4" fill="none" stroke="rgba(212,175,55,.6)"/></svg>' +
      '<div class="iso"><div class="cube3d"><span></span><span></span><span></span><span></span><span></span><span></span></div></div></div>';
  }
  var AMB_MS = 11000;
  // el: an empty container. o: { covers: [urls], logo: url }
  function ambient(el, o) {
    if (!el) return;
    o = o || {};
    var key = JSON.stringify(o);
    if (el._ambKey === key) return;
    el._ambKey = key;
    if (el._ambTimer) { clearInterval(el._ambTimer); el._ambTimer = null; }
    var covers = (o.covers || []).filter(Boolean).slice(0, 12);
    el.innerHTML = '<div class="amb-art">' + covers.map(function (u, i) { return '<div class="amb-slide' + (i === 0 ? ' is-on' : '') + '" data-src="' + esc(u) + '"></div>'; }).join('') + '</div>' +
      (!covers.length && o.logo ? neonLogo(o.logo, 'amb-logo') : '') +
      '<div class="amb-shade"></div><div class="amb-fx">' + fxLayers() + '</div>';
    var slides = el.querySelectorAll('.amb-slide');
    function load(s) { if (s && !s.style.backgroundImage) s.style.backgroundImage = 'url("' + s.getAttribute('data-src').replace(/"/g, '') + '")'; }
    load(slides[0]);
    if (slides.length < 2 || reduce) return;
    var cur = 0;
    setTimeout(function () { load(slides[1]); }, 2500); // lazy: only the next image is fetched
    el._ambTimer = setInterval(function () {
      if (document.hidden) return;
      var next = (cur + 1) % slides.length;
      load(slides[next]);
      slides[cur].classList.remove('is-on'); slides[next].classList.add('is-on');
      cur = next;
      setTimeout(function () { load(slides[(cur + 1) % slides.length]); }, AMB_MS - 3000);
    }, AMB_MS);
  }
  document.addEventListener('visibilitychange', function () { document.documentElement.classList.toggle('amb-paused', document.hidden); });
  var MOOD_KEY = 'zkj-mood';
  function getMood() { var m = null; try { m = window.localStorage.getItem(MOOD_KEY); } catch (e) { /* storage blocked */ } return /^[abc]$/.test(m || '') ? m : 'a'; }
  function setMood(m, root) {
    if (!/^[abc]$/.test(m)) m = 'a';
    try { window.localStorage.setItem(MOOD_KEY, m); } catch (e) { /* storage blocked */ }
    (root || document.getElementById('dash')).setAttribute('data-mood', m);
    return m;
  }

  window.ZDEV = {
    fillIcons: fillIcons, ambient: ambient, neonLogo: neonLogo, cubeLight: cubeLight, getMood: getMood, setMood: setMood,
    icon: icon, IC: IC, buildNav: buildNav, show: show, setAvailable: setAvailable, setBadge: setBadge,
    current: function () { return NAV.current; }, onView: function (fn) { NAV.listeners.push(fn); },
    clock: clock, ring: ring, gauge: gauge, spark: spark, animateIn: animateIn, art: art, phone: phone,
    timeline: timeline, revealNow: revealNow, rowNav: rowNav, swipe: swipe, wait: wait, reduce: reduce, isMobile: function () { return mobileMQ.matches; }
  };
})();
