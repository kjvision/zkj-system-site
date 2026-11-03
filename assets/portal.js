/* ZKJ SYSTEM — live client portal (app/index.html).
   Reads the signed-in person's data from Supabase. Row-level security (supabase/schema.sql)
   decides what each person can see; this file only renders it.
   Clients can only approve / request changes (review_item) and clear their bell (mark_notifications_read).
   The admin (KJ) gets a Control Center: client switcher tiles and a slide-over sheet to add items, numbers and notifications.
   UI kit: assets/device.js + assets/device.css (shared with the public demo dashboard). */
(function () {
  'use strict';
  var Z = window.ZKJ, D = window.ZDEV;
  var t = Z.t, esc = Z.esc;
  var SB = window.ZKJ_SB || {};
  var sb = SB.client;
  var CLIENT_KEY = 'zkj-portal-client';
  var DEFAULT_CLIENT = 'c1000000-0000-4000-8000-000000000001'; // KJ VISION (seeded in schema.sql)
  var CUBE = '../assets/brand/zkjsystem-icon-primary.svg';

  var S = {
    user: null, profile: null, isAdmin: false,
    clients: [], client: null,
    items: [], kpis: [], notifs: [], reports: [],
    week: 0, filter: 'all', busy: {}, keepFlown: false,
    mode: 'client', // 'client' (a client's login) · 'hq' (KJ's overview) · 'ws' (KJ inside one client's workspace)
    all: [], hqWeek: 0, ccClient: null, settings: {}
  };

  /* ---------- Packages (plan → panels) ---------- */
  var PKG = {
    starter: { features: [] },
    growth: { features: ['inbox'] },
    full: { features: ['inbox', 'ads', 'whatsapp'] }
  };
  var ADDONS = { inbox: 'p.addon.inbox', ads: 'p.addon.ads', whatsapp: 'p.addon.wa' };
  function planKey(c) {
    var p = ((c && (c.plan || '')) + ' ' + (c && (c.plan_ar || ''))).toLowerCase();
    if (/starter|البداية/.test(p)) return 'starter';
    if (/growth|النمو/.test(p)) return 'growth';
    return 'full';
  }
  function planName(c) {
    if (!c) return '';
    if (L() === 'ar' && c.plan_ar) return c.plan_ar;
    return c.plan || t('pk.' + planKey(c) + '.name');
  }

  /* ---------- Helpers ---------- */
  function L() { return Z.getLang(); }
  function $(id) { return document.getElementById(id); }
  function loc() { return L() === 'ar' ? 'ar-u-nu-latn' : 'en-GB'; }
  function pick(o, en, ar) { return (L() === 'ar' && o[ar]) ? o[ar] : (o[en] || o[ar] || ''); }
  function cName(c) { return c ? pick(c, 'name', 'name_ar') : ''; }
  function safeUrl(u) {
    if (!u || typeof u !== 'string') return '';
    u = u.trim();
    if (/^https?:\/\//i.test(u)) return u;
    if (/^\/(?!\/)/.test(u)) return u;
    return '';
  }
  function isImage(u) { return /\.(jpe?g|png|webp|gif|avif|svg)(\?.*)?$/i.test(u || ''); }
  function hex(c) { return /^#[0-9a-f]{6}$/i.test(c || '') ? c : null; }
  var EXTRA_PLATFORMS = [
    { id: 'snapchat', en: 'Snapchat', ar: 'سناب شات', color: '#E8D90C' },
    { id: 'whatsapp', en: 'WhatsApp', ar: 'واتساب', color: '#25D366' },
    { id: 'google', en: 'Google', ar: 'جوجل', color: '#34A853' },
    { id: 'meta', en: 'Meta', ar: 'ميتا', color: '#1877F2' },
    { id: 'threads', en: 'Threads', ar: 'ثريدز', color: '#E8E8E8' }
  ];
  function allPlatforms() { return Z.PLATFORMS.concat(EXTRA_PLATFORMS); }
  function plat(id) {
    var all = allPlatforms();
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return { id: id || '', en: id || '—', ar: id || '—', color: '#9AA0A6' };
  }
  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso + 'T12:00:00' : iso);
    if (isNaN(d)) return '';
    return new Intl.DateTimeFormat(loc(), { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  }
  function fmtWhen(iso) {
    if (!iso) return t('p.appr.nowhen');
    var d = new Date(iso);
    if (isNaN(d)) return t('p.appr.nowhen');
    return new Intl.DateTimeFormat(loc(), { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(d);
  }
  function fmtTime(iso) { return new Intl.DateTimeFormat(loc(), { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso)); }
  function ago(iso) {
    var d = new Date(iso); if (isNaN(d)) return '';
    var s = (d.getTime() - Date.now()) / 1000, a = Math.abs(s);
    var rtf = new Intl.RelativeTimeFormat(loc(), { numeric: 'auto' });
    if (a < 60) return rtf.format(0, 'second');
    if (a < 3600) return rtf.format(Math.round(s / 60), 'minute');
    if (a < 86400) return rtf.format(Math.round(s / 3600), 'hour');
    if (a < 86400 * 7) return rtf.format(Math.round(s / 86400), 'day');
    return fmtDate(iso);
  }
  function num(v) {
    var n = Number(v);
    if (!isFinite(n)) return String(v);
    return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
  function item(id) {
    var lists = S.mode === 'hq' ? [S.all, S.items] : [S.items, S.all];
    for (var l = 0; l < lists.length; l++) for (var i = 0; i < lists[l].length; i++) if (lists[l][i].id === id) return lists[l][i];
    return null;
  }
  function pending() { return S.items.filter(function (x) { return x.status === 'needs_approval'; }); }
  var STATUS_DOT = { draft: 'off', needs_approval: 'bad', approved: 'ok', changes_requested: 'warn', scheduled: 'warn', published: 'ok' };
  function statusLabel(s) { return t('p.s.' + s); }
  function show(el, on) { if (el) el.hidden = !on; }
  function clientById(id) { for (var i = 0; i < S.clients.length; i++) if (S.clients[i].id === id) return S.clients[i]; return null; }
  function clientOf(x) { return (x && clientById(x.client_id)) || S.client || {}; }
  function clientNo(c) { return S.clients.indexOf(c) + 1; }
  function tagOf(c) { return c ? t(c.internal ? 'p.tag.own' : 'p.tag.client', { n: clientNo(c) }) : ''; }
  // Who may approve: a client always (RLS keeps it to their own items); KJ only for his own (internal) brands.
  function extView() { return S.isAdmin && S.client && !S.client.internal; }
  function canReview(x) { return !S.isAdmin || clientOf(x).internal === true; }

  // Client logo (or initials). A broken logo URL falls back to initials (see the error listener below).
  // clients.brand, with the older primary_color / accent_color as fallbacks
  function brandOf(c) {
    if (!c) return null;
    var b = c.brand && typeof c.brand === 'object' ? c.brand : {};
    var pc = hex(c.primary_color), ac = hex(c.accent_color);
    var dark = function (h) { return h && D.contrast(h, '#000000') < 3.5; };
    return { b: b, fb: { bg: dark(pc) ? pc : '#0B0B0F', primary: ac || '#C9A84C', accent: ac } };
  }
  function brandColor(c, k) { var r = brandOf(c); return r ? D.resolveBrand(r.b, r.fb).vars[k] : null; }
  function initials(c) {
    var n = (c && c.name ? c.name : '?').replace(/[^A-Za-z0-9 ]/g, '').trim().split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 3) || '?';
    var bg = (c && brandColor(c, '--b-primary')) || '#15151B', fg = (c && brandColor(c, '--b-on-primary')) || '#C9A84C';
    return '<span class="logo-initials" style="background:' + bg + ';color:' + fg + ';border-color:' + fg + '" aria-hidden="true">' + esc(n) + '</span>';
  }
  function logoHtml(c) {
    if (!c) return '<img src="' + CUBE + '" alt="">';
    var src = safeUrl(c.logo_url);
    return src ? '<img src="' + esc(src) + '" alt="" data-logo-for="' + esc(c.id) + '">' : initials(c);
  }
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (img && img.tagName === 'IMG' && img.hasAttribute('data-logo-for')) {
      var c = clientById(img.getAttribute('data-logo-for'));
      var span = document.createElement('span'); span.innerHTML = initials(c);
      img.replaceWith(span.firstChild);
    }
  }, true);
  function handle(c) {
    var h = (c && (c.instagram || '')).trim().replace(/^@/, '');
    return h || (c ? c.name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '') : 'zkjsystem');
  }

  /* ---------- Page states ---------- */
  function chrome(on) {
    show($('dock'), on); show($('tabbar'), on); show($('sidebar'), on && (!!S.client || S.mode === 'hq'));
  }
  function booted() { document.documentElement.classList.add('booted'); setTimeout(function () { var b = $('boot'); if (b) b.remove(); }, 700); }
  function setState(titleKey, bodyKey, actions) {
    if (titleKey !== 'p.loading') booted();
    $('dash').setAttribute('data-state', 'message');
    show($('board'), false); show($('pw-panel'), false); show($('state'), true);
    chrome(false);
    $('state-title').setAttribute('data-i18n', titleKey);
    $('state-title').textContent = t(titleKey);
    $('state-body').setAttribute('data-i18n', bodyKey || '');
    $('state-body').textContent = bodyKey ? t(bodyKey) : '';
    if (!bodyKey) $('state-body').removeAttribute('data-i18n');
    $('state-actions').innerHTML = (actions || []).map(function (a) {
      if (a.href) return '<a class="btn ' + (a.cls || 'btn-ghost') + ' btn-sm" href="' + esc(a.href) + '"' + (a.ext ? ' target="_blank" rel="noopener"' : '') + ' data-i18n="' + a.key + '">' + esc(t(a.key)) + '</a>';
      return '<button class="btn ' + (a.cls || 'btn-ghost') + ' btn-sm" type="button" data-action="' + a.action + '" data-i18n="' + a.key + '">' + esc(t(a.key)) + '</button>';
    }).join('');
  }
  var WA_ACTION = { href: 'https://wa.me/971541668700', ext: true, key: 'p.wa', cls: 'btn-wa' };

  function signedInChrome() {
    show($('signout-btn'), true);
  }

  /* ---------- Header + sidebar ---------- */
  function renderHeader() {
    var c = S.mode === 'hq' ? null : S.client, dash = $('dash');
    $('client-name').textContent = c ? cName(c) : (S.mode === 'hq' ? t('p.hq.name') : 'ZKJ SYSTEM');
    dash.classList.toggle('no-client', !c);
    dash.setAttribute('data-mode', S.mode);
    $('mb-where').innerHTML = S.mode === 'client' ? esc(t('p.portal')) : esc(t('p.hq.name')) + (S.mode === 'ws' && c ? ' <span aria-hidden="true">›</span> ' + esc(cName(c)) : '');
    show($('sb-hq'), S.mode === 'hq');
    document.querySelectorAll('.sb-client-only').forEach(function (el) { el.hidden = S.mode === 'hq'; });
    show($('sb-backhq'), S.mode === 'ws');
    show($('ws-banner'), S.mode === 'ws');
    if (S.mode === 'ws' && c) $('ws-text').innerHTML = '<strong>' + esc(cName(c)) + '</strong> — ' + esc(t('p.ws.text')) + ' <span class="ws-tag">' + esc(tagOf(c)) + '</span>';
    $('sb-glance-title').textContent = c ? t('p.sb.glance.c', { name: cName(c) }) : t('p.sb.glance');
    $('client-logo').innerHTML = logoHtml(c);
    $('sb-logo').innerHTML = logoHtml(c);
    $('sb-name').textContent = c ? cName(c) : '';
    $('sb-handle').textContent = c && c.instagram ? '@' + handle(c) : '';
    var pill = $('pkg-pill');
    if (c && S.mode === 'ws') $('sb-handle').textContent = (c.instagram ? '@' + handle(c) + ' · ' : '') + tagOf(c);
    if (c) { pill.textContent = planName(c); pill.title = t('p.pkg', { name: planName(c) }); show(pill, true); } else show(pill, false);
    $('more-pkg').textContent = c ? planName(c) : '';
    show($('admin-pill'), S.isAdmin);
    var acc = c && hex(c.accent_color);
    if (acc) dash.style.setProperty('--accent', acc); else dash.style.removeProperty('--accent');
    // the client's brand in their dashboard (and KJ's workspace view of it); HQ stays ZKJ SYSTEM
    if (c && S.mode !== 'hq') { var br = brandOf(c); S.brandInfo = D.applyBrand(dash, br.b, br.fb); }
    else { D.clearBrand(dash); S.brandInfo = null; }
  }

  /* ---------- Today ---------- */
  function renderHello() {
    var c = S.client, n = pending().length;
    $('hello').textContent = S.isAdmin ? t('p.ws.title', { name: cName(c) }) : t('p.hello', { name: cName(c) });
    $('hello-sub').textContent = S.isAdmin ? t('p.ws.sub') : t('p.hello.sub');
    $('today-date').textContent = new Intl.DateTimeFormat(loc(), { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Dubai' }).format(new Date()) + ' · ' + t('dv.dubai');
    var btn = $('needs-you-btn');
    var ext = S.isAdmin && !c.internal;
    btn.textContent = n === 0 ? t(ext ? 'p.needs0.ext' : 'p.needs0') : ext ? t('p.needs.ext', { n: n }) : n === 1 ? t('p.needs1') : t('p.needs', { n: n });
    btn.classList.toggle('is-clear', n === 0);
  }

  function isScore(k) { return /score|\/\s*100|out of 100|من 100/i.test((k.metric || '') + ' ' + (k.label || '') + ' ' + (k.label_ar || '')); }
  function asOf(k) { return k.period_start ? t('p.kpi.asof', { d: fmtDate(k.period_start) }) : ''; }
  function renderKpis() {
    var seen = {}, latest = [], series = {};
    S.kpis.forEach(function (k) {
      if (!seen[k.metric]) { seen[k.metric] = k; latest.push(k); }
      (series[k.metric] = series[k.metric] || []).push(k);
    });
    // show numbers in the order they were added (ties: by id), newest value per metric
    latest.sort(function (a, b) { return String(a.created_at).localeCompare(String(b.created_at)) || String(a.id).localeCompare(String(b.id)); });
    var tiles = [];
    latest.forEach(function (k) {
      var label = esc(pick(k, 'label', 'label_ar') || k.metric);
      var base = /^target_/.test(k.metric) ? k.metric.slice(7) : null;
      if (base && seen[base]) return; // drawn as the ring of its metric
      var target = seen['target_' + k.metric];
      var v = Number(k.value);
      if (target && Number(target.value) > 0) {
        var pct = v / Number(target.value);
        tiles.push('<div class="inst inst-ring"><span class="inst-tag">' + esc(t('p.inst.target')) + '</span>' +
          '<div class="inst-dial">' + D.ring(pct) + '<div class="inst-read"><span class="v">' + esc(num(k.value)) + '</span><span class="of">/ ' + esc(num(target.value)) + '</span></div></div>' +
          '<span class="inst-label">' + label + '</span>' +
          '<span class="inst-foot"><span class="mono">' + esc(t('dv.target', { p: (Math.round(pct * 1000) / 10).toLocaleString('en-US') })) + '</span><span>' + esc(asOf(target)) + '</span></span></div>');
      } else if (isScore(k) && v >= 0 && v <= 100) {
        tiles.push('<div class="inst inst-gauge"><span class="inst-tag">' + esc(t('p.inst.score')) + '</span>' +
          '<div class="inst-dial">' + D.gauge(v / 100) + '<div class="inst-read"><span class="v">' + esc(num(k.value)) + '</span><span class="of">/ 100</span></div></div>' +
          '<span class="inst-label">' + label + '</span><span class="inst-foot"><span>' + esc(asOf(k)) + '</span></span></div>');
      } else {
        var vals = (series[k.metric] || []).slice().reverse().map(function (r) { return Number(r.value); }).filter(isFinite);
        var sp = D.spark(vals);
        tiles.push('<div class="inst inst-num"><span class="inst-tag">' + esc(t(sp ? 'p.inst.trend' : 'p.inst.reading')) + '</span>' +
          '<span class="big">' + esc(num(k.value)) + '</span>' +
          (sp ? '<div class="inst-spark">' + sp + '</div>' : '<div class="inst-ruler" aria-hidden="true"></div>') +
          '<span class="inst-label">' + label + '</span><span class="inst-foot"><span>' + esc(asOf(k)) + '</span></span></div>');
      }
    });
    var n = pending().length;
    var pips = ''; for (var i = 0; i < Math.min(n, 12); i++) pips += '<i></i>';
    tiles.push('<button class="inst inst-num inst-need' + (n ? '' : ' is-clear') + '" type="button" data-nav="approvals"><span class="inst-tag">' + esc(t('p.inst.queue')) + '</span>' +
      '<span class="big">' + n + '</span>' + (n ? '<span class="need-pips" aria-hidden="true">' + pips + '</span>' : '<div class="inst-ruler" aria-hidden="true"></div>') +
      '<span class="inst-label">' + esc(t(extView() ? 'p.st.wait' : 'p.kpi.appr')) + '</span><span class="inst-foot"><span class="' + (n ? 'status-bad' : 'status-ok') + '">' + esc(t(n ? (extView() ? 'p.kpi.appr.ext' : 'p.kpi.appr.bad') : 'p.kpi.appr.ok')) + '</span></span></button>');
    if (!latest.length) tiles.unshift('<div class="inst inst-empty kpi-empty"><span class="inst-tag">' + esc(t('p.kpi.title')) + '</span><p>' + esc(t('p.kpi.empty')) + '</p><div class="inst-ruler" aria-hidden="true"></div></div>');
    $('kpi-row').innerHTML = tiles.join('');
    D.animateIn($('kpi-row'));
  }

  function upcoming() {
    var now = Date.now();
    var dated = S.items.filter(function (x) { return x.scheduled_at && x.kind !== 'reply'; })
      .sort(function (a, b) { return new Date(a.scheduled_at) - new Date(b.scheduled_at); });
    var next = dated.filter(function (x) { return new Date(x.scheduled_at).getTime() >= now; });
    return next.length ? next : dated.slice(-3);
  }
  function statusTag(x) { var d = STATUS_DOT[x.status] || 'off'; return '<span class="status-tag ' + d + '">' + esc(statusLabel(x.status)) + '</span>'; }
  function renderNext() {
    var list = upcoming().slice(0, 4);
    $('next-list').innerHTML = list.length ? list.map(function (x) {
      var d = new Date(x.scheduled_at), p = plat(x.platform);
      return '<li><button type="button" data-action="cal-item" data-id="' + esc(x.id) + '">' +
        '<span class="un-when"><span>' + esc(new Intl.DateTimeFormat(loc(), { weekday: 'short', day: 'numeric' }).format(d)) + '</span><b>' + esc(fmtTime(x.scheduled_at)) + '</b></span>' +
        '<span class="un-title"><strong>' + esc(pick(x, 'title', 'title_ar')) + '</strong><span>' + '<span class="pmark" style="color:' + p.color + '">' + D.pglyph(p.id) + '</span>' + esc(p[L()]) + ' · ' + esc(t('p.type.' + x.kind)) + '</span></span>' +
        statusTag(x) + '</button></li>';
    }).join('') : '<li class="portal-empty">' + esc(t('p.next.empty')) + '</li>';
    // sidebar
    var n = pending().length;
    var ext = S.isAdmin && S.client && !S.client.internal;
    $('sb-need-label').textContent = t(ext ? 'p.st.wait' : 'p.kpi.appr');
    $('sb-need').textContent = n; $('sb-need').classList.toggle('hot', n > 0);
    var ws = weekStart(0), we = new Date(ws); we.setDate(we.getDate() + 7);
    $('sb-week').textContent = S.items.filter(function (x) { var d = x.scheduled_at && new Date(x.scheduled_at); return d && d >= ws && d < we && x.kind !== 'reply'; }).length;
    $('sb-reps').textContent = S.reports.length;
    var nx = list[0];
    show($('sb-next-wrap'), !!nx);
    if (nx) {
      $('sb-next').setAttribute('data-id', nx.id);
      $('sb-next').innerHTML = '<span class="when">' + esc(fmtWhen(nx.scheduled_at)) + '</span><strong>' + esc(pick(nx, 'title', 'title_ar')) + '</strong><span>' + esc(plat(nx.platform)[L()] + ' · ' + t('p.type.' + nx.kind)) + '</span>';
    }
  }
  function renderPkgCard() {
    var key = planKey(S.client), feats = PKG[key].features;
    var rows = [['p.pkg.core', true], ['p.addon.inbox', feats.indexOf('inbox') > -1], ['p.addon.ads', feats.indexOf('ads') > -1], ['p.addon.wa', feats.indexOf('whatsapp') > -1]];
    $('pkg-card').innerHTML = '<ul class="pkg-feats">' + rows.map(function (r) {
      return '<li class="' + (r[1] ? 'on' : 'off') + '"><span class="pf-ic" aria-hidden="true">' + (r[1] ? D.icon('check') : D.icon('plus')) + '</span><span>' + esc(t(r[0])) + '</span>' +
        (r[1] ? '' : '<span class="sr-only"> — ' + esc(t('p.pkg.notincl')) + '</span>') + '</li>';
    }).join('') + '</ul>';
  }

  /* ---------- Approvals: iPhone previews ---------- */
  function mediaList(x) { return String(x.media_url || '').split(/[\s,]+/).map(safeUrl).filter(function (u) { return u && isImage(u); }); }
  // a delivered reel/story video: shown as its first frame, tap to play (muted, like the feed)
  function videoOf(x) { return String(x.media_url || '').split(/[\s,]+/).map(safeUrl).filter(function (u) { return u && /\.(mp4|mov)(\?.*)?$/i.test(u); })[0] || ''; }
  function videoTag(v) { return '<div class="vid" data-vid><video src="' + esc(v) + '#t=0.1" muted loop playsinline preload="metadata"></video><span class="vid-btn" aria-hidden="true">' + D.icon('play') + '</span></div>'; }
  document.addEventListener('click', function (e) {
    // the phone frame's bars sit over a full-screen reel, so a tap anywhere on its screen counts (not on buttons/links)
    if (!e.target.closest || e.target.closest('a, button')) return;
    var scr = e.target.closest('[data-vid], .screen'); if (!scr) return;
    var w = scr.matches('[data-vid]') ? scr : scr.querySelector('[data-vid]'); if (!w) return;
    var v = w.querySelector('video'); if (!v) return;
    e.preventDefault();
    if (v.paused) { document.querySelectorAll('[data-vid] video').forEach(function (o) { if (o !== v && !o.paused) o.pause(); }); v.play().catch(function () { /* blocked: stays on the first frame */ }); } else v.pause();
  });
  document.addEventListener('play', function (e) { var w = e.target.closest && e.target.closest('[data-vid]'); if (w) w.classList.add('is-playing'); }, true);
  document.addEventListener('pause', function (e) { var w = e.target.closest && e.target.closest('[data-vid]'); if (w) w.classList.remove('is-playing'); }, true);
  function media(x, sfx) {
    var list = mediaList(x), c = clientOf(x), v = videoOf(x);
    if (v) return videoTag(v);
    if (list.length > 1) return '<div class="ig-strip" data-n="' + list.length + '">' + list.map(function (u, i) { return '<img src="' + esc(u) + '" alt="" loading="' + (i ? 'lazy' : 'eager') + '">'; }).join('') + '</div>';
    if (list.length === 1) return '<img src="' + esc(list[0]) + '" alt="" loading="lazy">';
    return D.art({ a: hex(c.primary_color) || '#15151B', b: hex(c.accent_color) || '#C9A84C', title: pick(x, 'title', 'title_ar'), kind: x.kind, seed: x.id, sfx: sfx, full: x.kind === 'reel' || x.kind === 'story', mark: 'ZKJ SYSTEM · ' + t('p.type.' + x.kind) });
  }
  function phoneOf(x, sfx) {
    var c = clientOf(x);
    var n = mediaList(x).length;
    return D.phone({ kind: x.kind, platform: x.platform, platformName: x.platform ? plat(x.platform)[L()] : '', handle: handle(c), avatar: logoHtml(c), media: media(x, sfx), slides: n > 1 ? n : undefined, pageName: cName(c), caption: pick(x, 'caption', 'caption_ar'), when: x.scheduled_at ? fmtWhen(x.scheduled_at) : t('p.appr.nowhen') });
  }
  function platChip(id) {
    if (!id) return '';
    var p = plat(id);
    return '<span class="chip chip-static">' + '<span class="pmark" style="color:' + p.color + '">' + D.pglyph(p.id) + '</span>' + esc(p[L()]) + '</span>';
  }
  function phoneCard(x) {
    var dis = S.busy[x.id] ? ' disabled' : '';
    var title = pick(x, 'title', 'title_ar');
    var can = canReview(x);
    var acts = can
      ? '<div class="pc-actions">' +
        '<button class="tactile yes" type="button" data-action="approve" data-id="' + esc(x.id) + '"' + dis + '>' + D.icon('check') + '<span>' + esc(t(S.isAdmin ? 'p.appr.owner' : 'p.appr.approve')) + '</span><span class="sr-only"> — ' + esc(title) + '</span></button>' +
        '<button class="tactile no" type="button" data-action="changes" data-id="' + esc(x.id) + '"' + dis + '>' + D.icon('pencil') + '<span>' + esc(t('p.appr.changes')) + '</span><span class="sr-only"> — ' + esc(title) + '</span></button></div>'
      : '<div class="pc-wait"><span class="status-tag warn"><span class="dot warn"></span> ' + esc(t('p.wait.client')) + '</span></div>';
    return '<li class="appr-slot"><article class="appr phone-card' + (can ? '' : ' is-readonly') + '" id="appr-' + esc(x.id) + '" data-id="' + esc(x.id) + '" data-pending="' + (can ? '1' : '0') + '" aria-label="' + esc(title) + '">' +
      phoneOf(x) +
      '<div class="pc-meta"><h3>' + esc(title) + '</h3><p>' + platChip(x.platform) + '<span class="mono">' + esc(x.scheduled_at ? fmtWhen(x.scheduled_at) : t('p.appr.nowhen')) + '</span></p></div>' +
      editedTag(x, 'pc-edited') + acts + '<button class="link-btn pc-more" type="button" data-action="preview" data-id="' + esc(x.id) + '">' + esc(t('p.appr.preview')) + '<span class="sr-only"> — ' + esc(title) + '</span></button>' +
      '</article></li>';
  }
  function thumb(x) {
    var m = mediaList(x)[0], c = clientOf(x), v = videoOf(x);
    if (m) return '<img src="' + esc(m) + '" alt="" loading="lazy">';
    if (v) return '<video src="' + esc(v) + '#t=0.5" muted playsinline preload="metadata" tabindex="-1" aria-hidden="true"></video>';
    return D.art({ a: hex(c.primary_color) || '#15151B', b: hex(c.accent_color) || '#C9A84C', kind: x.kind, seed: x.id, sfx: '-t' });
  }
  // drafts: the owner sends them to the approval queue; a reel needs its video first (a cover image alone cannot be published)
  function hasVideo(x) { return /\.(mp4|mov)(\?|$)/i.test(String(x.media_url || '')); }
  function draftReady(x) { return x.kind === 'reel' ? hasVideo(x) : !!(x.media_url && String(x.media_url).trim()); }
  function draftBlock(x) { return x.kind === 'reel' ? 'p.dr.novideo' : 'p.dr.nomedia'; }
  // "edited after your note → ready for approval again" marker (items sent back by the owner after a change request)
  function editedTag(x, cls) {
    if (!x.revised_at || x.status !== 'needs_approval') return '';
    return '<p class="' + cls + '"><span class="ed-badge">' + D.icon('pencil') + '<span>' + esc(t('p.appr.edited')) + '</span></span>' +
      (x.revision_note ? '<span class="ed-note">' + esc(t('p.appr.whatchanged', { note: x.revision_note })) + '</span>' : '') + '</p>';
  }
  // compact card: reviewed items, inbox replies, ads
  function rowCard(x, prefix) {
    var title = pick(x, 'title', 'title_ar'), actions;
    if (x.status === 'needs_approval' && !canReview(x)) {
      actions = '<span class="status-tag warn">' + esc(t('p.wait.client')) + '</span>';
    } else if (x.status === 'needs_approval') {
      var dis = S.busy[x.id] ? ' disabled' : '';
      actions = '<button class="btn btn-approve btn-sm" type="button" data-action="approve" data-id="' + esc(x.id) + '"' + dis + '>' + esc(t(S.isAdmin ? 'p.appr.owner' : 'p.appr.approve')) + '</button>' +
        '<button class="btn btn-ghost btn-sm" type="button" data-action="changes" data-id="' + esc(x.id) + '"' + dis + '>' + esc(t('p.appr.changes')) + '</button>';
    } else {
      var ok = x.status === 'approved' || x.status === 'scheduled' || x.status === 'published';
      var lab = S.isAdmin && x.status === 'changes_requested' ? t('p.s.changes.admin') : statusLabel(x.status);
      actions = '<span class="appr-state status-' + (ok ? 'ok' : 'warn') + '"><span class="dot ' + (ok ? 'ok' : 'warn') + '"></span>' + esc(lab) + '</span>';
    }
    var note = x.client_note ? '<p class="appr-note">' + esc(t(S.isAdmin ? 'p.appr.theirnote' : 'p.appr.yournote', { note: x.client_note })) + '</p>' : '';
    return '<li><article class="appr row-card' + (x.status !== 'needs_approval' ? ' is-done' : '') + '" id="' + (prefix || 'appr-') + esc(x.id) + '">' +
      '<div class="rc-thumb">' + thumb(x) + '</div><div class="rc-body"><h3>' + esc(title) + '</h3>' +
      '<div class="rc-line">' + platChip(x.platform) + '<span class="mono" style="font-size:12px;color:var(--muted)">' + esc(x.scheduled_at ? fmtWhen(x.scheduled_at) : t('p.appr.nowhen')) + '</span></div>' +
      (prefix ? '<p class="rc-caption">' + esc(pick(x, 'caption', 'caption_ar')) + '</p>' : '') +
      (prefix && x.first_comment ? '<p class="rc-caption rc-fc"><b>' + esc(t('p.item.fc')) + ':</b> ' + esc(x.first_comment) + '</p>' : '') + note + editedTag(x, 'rc-edited') +
      '<div class="appr-actions">' + actions + '<button class="link-btn" type="button" data-action="preview" data-id="' + esc(x.id) + '">' + esc(t('p.appr.preview')) + '<span class="sr-only"> — ' + esc(title) + '</span></button></div></div>' +
      '</article></li>';
  }
  var rowUpd = D.rowNav($('appr-list'), $('row-prev'), $('row-next'), $('row-count'));
  function renderApprovals() {
    var pend = pending();
    var reviewed = S.items.filter(function (x) { return (x.status === 'changes_requested' || x.status === 'approved') && x.reviewed_at; })
      .sort(function (a, b) { return String(b.reviewed_at).localeCompare(String(a.reviewed_at)); }).slice(0, 6);
    $('appr-list').innerHTML = pend.length ? pend.map(phoneCard).join('')
      : '<li class="appr-empty">' + D.icon('check', true) + '<span>' + esc(t('p.appr.empty')) + '</span></li>';
    $('appr-done').innerHTML = reviewed.map(function (x) { return rowCard(x); }).join('');
    show($('done-wrap'), reviewed.length > 0);
    $('stack-ghosts').setAttribute('data-n', Math.min(pend.length, 3));
    showCoach(pend.length > 0);
    var can = pend.length > 0 && canReview(pend[0]);
    show($('stack-ghosts'), pend.length > 1);
    show($('stack-hint'), can);
    show($('row-nav'), pend.length > 1);
    $('stack-count').textContent = pend.length ? t('p.stack.left', { n: pend.length }) : '';
    D.setBadge('approvals', pend.length);
    if (rowUpd) rowUpd();
  }

  /* ---------- Calendar: film-strip timeline ---------- */
  function weekStart(offset) {
    var d = new Date(); d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay() + offset * 7);
    return d;
  }
  function dayIndex(start, d) {
    var a = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.round((a - start) / 86400000);
  }
  function renderFilters() {
    var used = {};
    S.items.forEach(function (x) { if (x.platform) used[x.platform] = 1; });
    var opts = [{ id: 'all', label: t('p.cal.all') }].concat(Object.keys(used).map(function (id) { var p = plat(id); return { id: id, label: p[L()], color: p.color }; }));
    if (S.filter !== 'all' && !used[S.filter]) S.filter = 'all';
    $('cal-filters').innerHTML = opts.length > 2 ? opts.map(function (o) {
      return '<button class="chip" type="button" data-action="filter" data-platform="' + esc(o.id) + '" aria-pressed="' + (S.filter === o.id) + '">' +
        (o.color ? '<span class="pmark" style="color:' + o.color + '">' + D.pglyph(o.id) + '</span>' : '') + esc(o.label) + '</button>';
    }).join('') : '';
  }
  function renderCalendar() {
    var start = weekStart(S.week), end = new Date(start); end.setDate(end.getDate() + 7);
    var last = new Date(end); last.setDate(last.getDate() - 1);
    var f = new Intl.DateTimeFormat(loc(), { day: 'numeric', month: 'short' });
    $('cal-label').textContent = (S.week === 0 ? t('p.cal.today') + ' · ' : '') + f.format(start) + ' – ' + f.format(last);
    var dated = S.items.filter(function (x) { return x.scheduled_at && x.kind !== 'reply'; });
    var items = dated.filter(function (x) {
      var d = new Date(x.scheduled_at);
      return d >= start && d < end && (S.filter === 'all' || x.platform === S.filter);
    });
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var days = [];
    for (var i = 0; i < 7; i++) {
      var day = new Date(start); day.setDate(day.getDate() + i);
      days.push({ name: t('p.day.' + day.getDay()), num: String(day.getDate()), today: day.getTime() === today.getTime() });
    }
    // one track per content type, like the video / image tracks of an editing timeline; clips keep their platform colour
    var byKind = {};
    items.forEach(function (x) {
      var d = new Date(x.scheduled_at), p = plat(x.platform);
      (byKind[x.kind] = byKind[x.kind] || []).push({ id: x.id, day: dayIndex(start, d), mins: d.getHours() * 60 + d.getMinutes(), time: fmtTime(x.scheduled_at), title: pick(x, 'title', 'title_ar'),
        kind: p[L()], pg: x.platform, color: p.color, dot: STATUS_DOT[x.status] || 'off', status: statusLabel(x.status), wave: x.kind === 'reel' || x.kind === 'story' });
    });
    var tracks = TRACKS.filter(function (k) { return byKind[k[0]]; }).map(function (k) { return { code: k[1], label: t('p.type.' + k[0]), color: '#9AA0A6', clips: byKind[k[0]] }; });
    if (!tracks.length) tracks = [{ code: '—', label: t('p.cal.empty'), color: '#3a3a42', clips: [] }];
    var now = S.week === 0 ? (Date.now() - start.getTime()) / (7 * 86400000) : null;
    $('cal').innerHTML = D.timeline({ days: days, tracks: tracks, now: now, nowLabel: t('dv.now') + ' ' + fmtTime(new Date().toISOString()) });
    show($('cal-none'), dated.length === 0);
    $('cal-legend').innerHTML = ['needs_approval', 'approved', 'scheduled', 'published'].map(function (s) {
      return '<span><span class="dot ' + STATUS_DOT[s] + '"></span>' + esc(statusLabel(s)) + '</span>';
    }).join('');
    if (D.current() === 'calendar') D.revealNow($('cal'));
    renderMonitor(items);
  }
  var TRACKS = [['reel', 'V1'], ['story', 'V2'], ['post', 'P1'], ['carousel', 'P2'], ['ad', 'AD']];
  function countdown(iso) {
    var s = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
    if (s <= 0) return '00:00';
    var d = Math.floor(s / 1440), h = Math.floor(s % 1440 / 60), m = s % 60;
    return (d ? d + 'd ' : '') + String(h).padStart(2, '0') + 'h ' + String(m).padStart(2, '0') + 'm';
  }
  // "next on air" monitor under the timeline
  function renderMonitor(items) {
    var sorted = items.slice().sort(function (a, b) { return new Date(a.scheduled_at) - new Date(b.scheduled_at); });
    var x = sorted.filter(function (i) { return new Date(i.scheduled_at).getTime() >= Date.now(); })[0] || sorted[0];
    var mon = $('cal-monitor');
    show(mon, !!x);
    if (!x) return;
    var p = plat(x.platform), dot = STATUS_DOT[x.status] || 'off', future = new Date(x.scheduled_at).getTime() >= Date.now();
    mon.innerHTML = '<div class="mon-screen">' + phoneOf(x, '-c') + '</div>' +
      '<div class="mon-info"><span class="eyebrow">' + esc(t(future ? 'p.mon.next' : 'p.mon.last')) + '</span>' +
      '<h3>' + esc(pick(x, 'title', 'title_ar')) + '</h3>' +
      (future ? '<span class="mon-count mono" dir="ltr">T&minus; ' + esc(countdown(x.scheduled_at)) + '</span>' : '') +
      '<dl class="kv"><dt>' + esc(t('p.item.platform')) + '</dt><dd>' + '<span class="pmark" style="color:' + p.color + '">' + D.pglyph(p.id) + '</span>' + ' ' + esc(p[L()]) + '</dd>' +
      '<dt>' + esc(t('p.item.type')) + '</dt><dd>' + esc(t('p.type.' + x.kind)) + '</dd>' +
      '<dt>' + esc(t('p.item.when')) + '</dt><dd class="mono">' + esc(fmtWhen(x.scheduled_at)) + '</dd>' +
      '<dt>' + esc(t('p.item.status')) + '</dt><dd>' + statusTag(x) + '</dd></dl>' +
      '<div class="row">' + (x.status === 'needs_approval' ? '<button class="btn btn-primary btn-sm" type="button" data-nav="approvals">' + esc(t('p.mon.review')) + '</button>' : '') +
      '<button class="btn btn-ghost btn-sm" type="button" data-action="preview" data-id="' + esc(x.id) + '">' + esc(t('p.appr.preview')) + '</button></div></div>';
  }

  function kindList(kind, listId, emptyKey) {
    var list = S.items.filter(function (x) { return x.kind === kind; });
    $(listId).innerHTML = list.length ? list.map(function (x) { return rowCard(x, 'k-'); }).join('') : '<li class="gcard portal-empty">' + esc(t(emptyKey)) + '</li>';
  }
  /* ---------- Inbox: comments on the brand's posts, answered by hand (owner only; inbox-reply Edge Function) ---------- */
  var CM_REPLY = { instagram: 1, facebook: 1, youtube: 1 };
  function loadComments() {
    if (!S.isAdmin || !S.client) { S.comments = []; return Promise.resolve(); }
    return q(sb.from('comment_replies').select('*').eq('client_id', S.client.id).order('comment_at', { ascending: false, nullsFirst: false }).limit(60))
      .then(function (d) { S.comments = d || []; }).catch(function () { S.comments = []; });
  }
  function renderComments() {
    var wrap = $('cm-wrap'); if (!wrap) return;
    show(wrap, !!S.isAdmin);
    if (!S.isAdmin) return;
    var list = S.comments || [];
    $('cm-count').textContent = list.length ? String(list.length) : '';
    $('cm-list').innerHTML = list.length ? list.map(function (c) {
      var p = plat(c.platform), can = !!CM_REPLY[c.platform], link = safeUrl(c.permalink);
      var auto = c.reply_text && c.status === 'replied' && !(c.manual_reply_text && c.manual_reply_text === c.reply_text);
      return '<li class="gcard cm-row" data-cm="' + esc(c.comment_id) + '">' +
        '<div class="cm-top"><span class="cm-pf" style="color:#fff">' + D.pglyph(c.platform) + '</span><b class="cm-from">' + esc(c.from_name ? (c.platform === 'instagram' ? '@' : '') + c.from_name : t('p.cm.someone')) + '</b>' +
        '<span class="cm-when">' + esc(p[L()] || c.platform) + (c.comment_at ? ' · ' + esc(ago(c.comment_at)) : '') + '</span>' +
        (link ? '<a class="cm-open" href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(t('p.cm.open')) + '</a>' : '') + '</div>' +
        '<p class="cm-text">' + esc(c.comment || '') + '</p>' +
        (auto ? '<p class="cm-auto"><span>' + esc(t('p.cm.auto')) + '</span> ' + esc(c.reply_text) + '</p>' : '') +
        (c.manual_reply_text ? '<p class="cm-mine"><span>' + esc(t('p.cm.mine')) + '</span> ' + esc(c.manual_reply_text) + '</p>' : '') +
        (c.status === 'waiting' || c.status === 'failed' ? '<p class="cm-wait">' + esc(t('p.cm.waiting')) + '</p>' : '') +
        (can ? '<form class="cm-form" data-cm-form="' + esc(c.comment_id) + '"><label class="sr-only" for="cm-in-' + esc(c.comment_id) + '">' + esc(t('p.cm.label')) + '</label>' +
          '<textarea id="cm-in-' + esc(c.comment_id) + '" rows="1" maxlength="2000" placeholder="' + esc(t('p.cm.ph')) + '"></textarea>' +
          '<button class="btn btn-primary btn-sm" type="submit">' + esc(t('p.cm.send')) + '</button></form>'
          : '<p class="cm-wait">' + esc(t('p.cm.onplatform')) + '</p>') +
        '</li>';
    }).join('') : '<li class="gcard portal-empty">' + esc(t('p.cm.empty')) + '</li>';
  }
  document.addEventListener('submit', function (e) {
    var f = e.target.closest && e.target.closest('[data-cm-form]'); if (!f) return;
    e.preventDefault();
    var id = f.getAttribute('data-cm-form'), ta = f.querySelector('textarea'), btn = f.querySelector('button'), text = (ta.value || '').trim();
    if (!text) { ta.focus(); Z.toast(t('p.cm.write'), 'warn'); return; }
    btn.disabled = true; ta.disabled = true; btn.textContent = t('p.cm.sending');
    sb.auth.getSession().then(function (r) {
      var tok = r && r.data && r.data.session && r.data.session.access_token;
      return fetch(((window.ZKJ_SB && window.ZKJ_SB.url) || '') + '/functions/v1/inbox-reply', { method: 'POST', headers: { Authorization: 'Bearer ' + (tok || ''), 'Content-Type': 'application/json' }, body: JSON.stringify({ comment_id: id, text: text }) })
        .then(function (res) { return res.json().catch(function () { return { ok: false, error: String(res.status) }; }); });
    }).then(function (j) {
      if (!j || !j.ok) throw new Error((j && j.error) || '?');
      (S.comments || []).forEach(function (c) { if (c.comment_id === id) { c.manual_reply_text = text; c.manual_reply_at = j.at; if (c.status !== 'replied') { c.status = 'replied'; c.reply_text = text; } } });
      Z.toast(t('p.cm.sent'), 'ok'); renderComments();
    }).catch(function (err) {
      Z.toast(t('p.cm.fail', { err: (err && err.message) || '?' }), 'bad');
      btn.disabled = false; ta.disabled = false; btn.textContent = t('p.cm.send');
    });
  });
  function renderPackage() {
    var key = planKey(S.client), feats = PKG[key].features;
    var adm = S.isAdmin; // the owner always has every screen
    ['inbox', 'ads', 'whatsapp'].forEach(function (f) { D.setAvailable(f, adm || feats.indexOf(f) > -1); });
    var missing = Object.keys(ADDONS).filter(function (f) { return feats.indexOf(f) < 0; });
    show($('addons'), missing.length > 0);
    $('addon-sub').textContent = t('p.addon.sub', { pkg: planName(S.client) });
    $('addon-list').innerHTML = missing.map(function (f) { return '<li><span class="pf-ic" aria-hidden="true">' + D.icon('plus') + '</span><span>' + esc(t(ADDONS[f])) + '</span></li>'; }).join('');
    $('addon-wa').href = 'https://wa.me/971541668700?text=' + encodeURIComponent(t('wa.general'));
    if (adm || feats.indexOf('inbox') > -1) kindList('reply', 'inbox-list', 'p.inbox.empty');
    if (adm || feats.indexOf('ads') > -1) kindList('ad', 'ads-list', 'p.ads.empty');
    renderComments();
    renderPkgCard();
  }

  function renderReports() {
    $('rep-list').innerHTML = S.reports.length ? S.reports.map(function (r) {
      var url = safeUrl(r.file_url), title = pick(r, 'title', 'title_ar');
      return '<li><article class="file report-item"><span class="file-icon" aria-hidden="true"><b>PDF</b></span><div><h3>' + esc(title) + '</h3>' +
        (r.period ? '<span class="meta report-period"><bdi>' + esc(r.period) + '</bdi></span>' : '') + '</div>' +
        (url ? '<a class="btn btn-ghost btn-sm" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(t('p.rep.open')) + '<span class="sr-only"> — ' + esc(title) + '</span></a>'
          : '<span class="meta report-soon">' + esc(t('p.rep.soon')) + '</span>') +
        '</article></li>';
    }).join('') : '<li class="gcard portal-empty">' + esc(t('p.rep.empty')) + '</li>';
  }

  /* ---------- Notification Centre ---------- */
  function renderNotifs() {
    var unread = S.notifs.filter(function (n) { return !n.read; }).length;
    var badge = $('bell-count');
    badge.textContent = unread;
    badge.hidden = unread === 0;
    var head = S.isAdmin ? t('p.notif.admin') : t('p.notif.title');
    $('notif-head-title').textContent = head;
    $('bell').setAttribute('aria-label', head + (unread ? ' (' + unread + ')' : ''));
    var byId = {}; S.clients.forEach(function (c) { byId[c.id] = c; });
    $('notif-list').innerHTML = S.notifs.length ? S.notifs.map(function (n) {
      var who = S.isAdmin && byId[n.client_id] ? cName(byId[n.client_id]) + ' · ' : '';
      var body = pick(n, 'body', 'body_ar');
      return '<li><div class="notif-item ' + (n.read ? 'read' : 'unread') + '">' +
        '<span class="nb-icon"><img src="' + CUBE + '" alt="" width="20" height="23"></span><span class="nb-body">' +
        '<span class="nb-top"><span class="app">ZKJ SYSTEM</span><span>' + esc(who + ago(n.created_at)) + '</span></span>' +
        '<p class="nb-title">' + (n.read ? '' : '<span class="nb-unread" aria-hidden="true"></span>') + esc(pick(n, 'title', 'title_ar')) + (n.read ? '' : '<span class="sr-only"> (' + esc(t('p.notif.unread')) + ')</span>') + '</p>' +
        (body ? '<p class="notif-body">' + esc(body) + '</p>' : '') +
        '</span></div></li>';
    }).join('') : '<li class="nb-empty">' + esc(t('p.notif.empty')) + '</li>';
    $('cc-unread').textContent = unread;
  }

  /* ---------- Control Center (admin) ---------- */
  /* ---------- Ambient (living background, data-driven from clients.cover_urls) ---------- */
  // ZKJ SYSTEM's own art (teal neon architecture): HQ, and any client without covers yet. Swap freely.
  var SYSTEM_COVERS = ['/assets/art/kj/kj-010.webp', '/assets/art/kj/kj-026.webp', '/assets/art/kj/kj-041.webp', '/assets/art/kj/kj-027.webp', '/assets/art/kj/kj-025.webp', '/assets/art/kj/kj-042.webp', '/assets/art/kj/kj-030.webp', '/assets/art/kj/kj-028.webp', '/assets/art/kj/kj-033.webp', '/assets/art/kj/kj-062.webp'];
  function coversOf(c) { return (c && Array.isArray(c.cover_urls) ? c.cover_urls : []).map(safeUrl).filter(Boolean); }
  function renderAmbient() {
    if (S.mode === 'hq') {
      // weave every client's covers together
      D.ambient($('ambient'), { covers: SYSTEM_COVERS });
      if (!$('hq-light').firstChild) $('hq-light').innerHTML = D.cubeLight();
      return;
    }
    var c = S.client; if (!c) return;
    var logo = safeUrl(c.logo_url);
    // no art yet: KJ's own brands borrow the ZKJ SYSTEM set; a client in a light brand gets a soft wash in its own colours
    var light = $('dash').getAttribute('data-brand') === 'light';
    D.ambient($('ambient'), { covers: coversOf(c).length ? coversOf(c) : (c.internal || !light ? SYSTEM_COVERS : []) }); // the client's logo glows once, behind the title
    var hl = $('ws-light'), k = 'logo:' + logo;
    if (hl.getAttribute('data-k') !== k) {
      hl.setAttribute('data-k', k);
      hl.className = 'hero-light ' + (logo ? 'is-logo' : 'is-cube');
      hl.innerHTML = logo ? D.neonLogo(logo) : (c.internal ? D.cubeLight() : '');
    }
  }
  var brandDraft = null, brandFor = null;
  function brandFields() { return ['bg', 'surface', 'text', 'primary', 'accent', 'font_display', 'font_body', 'radius']; }
  function renderBrandEditor(c) {
    $('cc-brand-client').textContent = cName(c);
    if (brandFor !== c.id) {
      brandFor = c.id;
      var r = brandOf(c), v = D.resolveBrand(r.b, r.fb).vars;
      brandDraft = {
        bg: v['--b-bg'], surface: v['--b-surface'], text: r.b.text || v['--b-text'], primary: v['--b-primary'], accent: v['--b-accent'],
        font_display: r.b.font_display || 'Cinzel', font_body: r.b.font_body || 'Inter', radius: r.b.radius != null ? r.b.radius : 22
      };
    }
    ['font_display', 'font_body'].forEach(function (k) {
      var sel = $('br-' + k);
      if (!sel.options.length) sel.innerHTML = D.FONT_ALLOW.map(function (f) { return '<option>' + esc(f) + '</option>'; }).join('');
    });
    brandFields().forEach(function (k) { var el = $('br-' + k); if (document.activeElement !== el) el.value = brandDraft[k]; });
    previewBrand();
  }
  function previewBrand() {
    var pv = $('brand-preview'), r = D.applyBrand(pv, brandDraft);
    $('bp-title').textContent = t('p.hello', { name: cName(clientById(brandFor)) });
    $('brand-notes').textContent = r.notes.length ? t('p.br.fixed', { what: r.notes.map(function (n) { return t('p.br.n.' + n); }).join(', ') }) : t('p.br.ok');
  }
  document.addEventListener('input', function (e) {
    var k = e.target && e.target.getAttribute && e.target.closest('#cc-brand') && e.target.getAttribute('data-k');
    if (!k || !brandDraft) return;
    brandDraft[k] = k === 'radius' ? Math.max(0, Math.min(32, parseInt(e.target.value, 10) || 0)) : e.target.value;
    previewBrand();
  });
  document.addEventListener('change', function (e) { if (e.target && e.target.closest && e.target.closest('#cc-brand')) { var k = e.target.getAttribute('data-k'); if (k && brandDraft) { brandDraft[k] = k === 'radius' ? Math.max(0, Math.min(32, parseInt(e.target.value, 10) || 0)) : e.target.value; previewBrand(); } } });

  // Auto-publish switch (app_settings.publisher_paused), admin only
  function renderPub() {
    var btn = $('pub-toggle'), st = $('pub-status'); if (!btn || !st) return;
    var v = S.settings.publisher_paused;
    if (v === undefined) { btn.disabled = true; btn.textContent = '—'; st.className = 'form-status show error'; st.textContent = t('p.pub.unknown'); return; }
    var paused = v === 'true';
    btn.disabled = false; btn.textContent = t(paused ? 'p.pub.resume' : 'p.pub.pause'); btn.setAttribute('aria-pressed', paused ? 'false' : 'true');
    st.className = 'form-status show ' + (paused ? 'error' : 'ok'); st.textContent = t(paused ? 'p.pub.off' : 'p.pub.on');
  }
  // Connect · YouTube / Pinterest / LinkedIn: one account per brand per network (KJ, 22 Oct). Tokens never reach the browser;
  // social_links() returns only name/status. The Connect link opens the network's own login (social-connect function).
  // LinkedIn parked (KJ, 23 Oct): it comes back in this list the day KJ reopens it
  var SOC_NETS = [{ id: 'youtube', en: 'YouTube', ar: 'يوتيوب' }, { id: 'pinterest', en: 'Pinterest', ar: 'بنترست' }, { id: 'tiktok', en: 'TikTok', ar: 'تيك توك' }, { id: 'x', en: 'X', ar: 'إكس' }];
  function renderSocial() {
    var box = $('cc-social-list'), note = $('cc-social-note'); if (!box || !note) return;
    var key = S.settings.social_connect_key || '';
    var base = ((window.ZKJ_SB && window.ZKJ_SB.url) || '') + '/functions/v1/social-connect';
    note.textContent = key ? t('p.soc.help') : t('p.soc.nokey');
    box.innerHTML = S.clients.filter(function (c) { return c.active !== false; }).map(function (c) {
      return '<li class="soc-row"><span class="soc-client">' + miniLogo(c) + esc(cName(c)) + '</span><div class="soc-nets">' + SOC_NETS.map(function (n) {
        var a = (S.social || []).filter(function (s2) { return s2.client_id === c.id && s2.network === n.id; })[0];
        var st = !a ? 'none' : a.status !== 'ok' ? 'expired' : 'ok';
        var label = st === 'ok' ? (a.name || t('p.soc.ok')) : t('p.soc.' + st);
        var href = key ? base + '?client=' + encodeURIComponent(c.name) + '&network=' + n.id + '&key=' + encodeURIComponent(key) : '';
        return '<div class="soc-net" data-st="' + st + '"><b>' + esc(n[L()]) + '</b><span class="soc-st">' + esc(label) + '</span>' +
          (href ? '<a class="btn btn-sm ' + (st === 'ok' ? 'btn-ghost' : 'btn-primary') + '" href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(t(st === 'ok' ? 'p.soc.reconnect' : 'p.soc.connect')) + '</a>' : '') + '</div>';
      }).join('') + '</div></li>';
    }).join('');
  }
  function renderMood() {
    var m = $('dash').getAttribute('data-mood');
    document.querySelectorAll('[data-action="set-mood"]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-mood') === m ? 'true' : 'false'); });
  }

  /* ---------- CORE (assets/core.js): the client's living universe / KJ's whole system ---------- */
  var core = { ctl: null, key: null, mounted: false };
  function coreItem(x) { return { id: x.id, title: pick(x, 'title', 'title_ar'), kind: x.kind, status: x.status, platform: x.platform, when: x.scheduled_at ? fmtWhen(x.scheduled_at) : '' }; }
  function coreKpi(list) {
    var by = {}; list.forEach(function (k) { if (!by[k.metric]) by[k.metric] = k; });
    for (var m in by) if (by['target_' + m]) return { v: Number(by[m].value), t: Number(by['target_' + m].value) };
    return null;
  }
  function coreClientData(c, items, kpis) {
    var feats = PKG[planKey(c)].features, chans = [];
    items.forEach(function (x) { if (x.platform && chans.indexOf(x.platform) < 0) chans.push(x.platform); });
    if (feats.indexOf('whatsapp') > -1 && chans.indexOf('whatsapp') < 0) chans.push('whatsapp');
    if (!chans.length) chans = ['instagram'];
    var pub = items.filter(function (x) { return x.status === 'published'; });
    return { name: cName(c), logo: safeUrl(c.logo_url), primary: brandColor(c, '--b-primary'), accent: brandColor(c, '--b-accent'), covers: coversOf(c), features: feats, channels: chans,
      items: items.map(coreItem), published: pub.map(coreItem), wins: pub.length, kpi: kpis ? coreKpi(kpis) : null };
  }
  function coreUniverseData() {
    var now = Date.now();
    return { logo: CUBE, clients: S.clients.map(function (c) {
      var list = S.all.filter(function (x) { return x.client_id === c.id && x.status !== 'draft'; });
      return { id: c.id, name: cName(c), logo: safeUrl(c.logo_url), primary: brandColor(c, '--b-primary'), accent: brandColor(c, '--b-accent'), tag: tagOf(c),
        items: list.map(function (x) { var o = coreItem(x); o.client = cName(c); o.recent = !!x.reviewed_at && now - new Date(x.reviewed_at).getTime() < 48 * 3600000; return o; }),
        published: list.filter(function (x) { return x.status === 'published'; }).map(coreItem) };
    }) };
  }
  function renderCore() {
    var host = $('core-stage'); if (!host || !window.ZCORE) return;
    var uni = S.mode === 'hq', key = (uni ? 'hq' : 'c:' + (S.client && S.client.id)) + ':' + L();
    if (!uni && !S.client) return;
    if (core.key !== key) {
      if (core.ctl) core.ctl.destroy();
      core.ctl = window.ZCORE.create(host, {
        mode: uni ? 'universe' : 'client',
        platformName: function (id) { return plat(id)[L()]; },
        onItem: function (x) { var it = item(x.id); if (it) itemDetail(it); },
        onOpenClient: function (id) { openWorkspace(id).then(function () { D.show('core'); }).catch(loadError); }
      });
      core.key = key; core.mounted = false;
    }
    core.ctl.update(uni ? coreUniverseData() : coreClientData(S.client, S.items, S.kpis));
    var on = D.current() === 'core' && $('dash').getAttribute('data-state') === 'ready';
    if (on && !core.mounted) { core.ctl.mount(); core.mounted = true; }
    if (!on && core.mounted) { core.ctl.unmount(); core.mounted = false; }
    window.__zkjCore = core.ctl;
  }

  /* ---------- ZKJ SYSTEM HQ (admin overview across all clients) ---------- */
  function inWeek(x, off) {
    if (!x.scheduled_at) return false;
    var a = weekStart(off), e = new Date(a); e.setDate(e.getDate() + 7);
    var d = new Date(x.scheduled_at); return d >= a && d < e;
  }
  function inThisMonth(iso) { var d = new Date(iso), n = new Date(); return !!iso && d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth(); }
  function statsOf(c) {
    var list = S.all.filter(function (x) { return x.client_id === c.id; });
    var now = Date.now();
    var next = list.filter(function (x) { return x.scheduled_at && x.kind !== 'reply' && x.status !== 'draft' && new Date(x.scheduled_at).getTime() >= now; })
      .sort(function (a, b) { return new Date(a.scheduled_at) - new Date(b.scheduled_at); })[0];
    return {
      waiting: list.filter(function (x) { return x.status === 'needs_approval'; }).length,
      changes: list.filter(function (x) { return x.status === 'changes_requested'; }).length,
      week: list.filter(function (x) { return inWeek(x, 0) && x.status !== 'draft' && x.kind !== 'reply'; }).length,
      month: list.filter(function (x) { return x.status === 'published' && inThisMonth(x.scheduled_at); }).length,
      next: next
    };
  }
  function todoRows() {
    var rows = [];
    S.all.filter(function (x) { return x.status === 'changes_requested'; })
      .sort(function (a, b) { return String(b.reviewed_at).localeCompare(String(a.reviewed_at)); })
      .forEach(function (x) { rows.push({ type: 'changes', x: x, c: clientOf(x), when: x.reviewed_at }); });
    // edited after a note and sent back: waiting for the client's approval again (or the owner's, on own brands)
    S.all.filter(function (x) { return x.status === 'needs_approval' && x.revised_at; })
      .sort(function (a, b) { return String(b.revised_at).localeCompare(String(a.revised_at)); })
      .forEach(function (x) { rows.push({ type: 'revised', x: x, c: clientOf(x), when: x.revised_at }); });
    S.all.filter(function (x) { return x.status === 'draft'; })
      .forEach(function (x) { rows.push({ type: 'draft', x: x, c: clientOf(x), when: x.scheduled_at || x.created_at }); });
    (S.dw || []).filter(function (j) { return j.status === 'check' || j.status === 'received'; })
      .forEach(function (j) { rows.push({ type: j.status === 'check' ? 'dw-check' : 'dw-quote', j: j, when: j.updated_at || j.created_at }); });
    S.notifs.forEach(function (n) { rows.push({ type: 'activity', n: n, c: clientById(n.client_id), when: n.created_at }); });
    return rows;
  }
  function todoCount() {
    return todoRows().filter(function (r) {
      if (r.type === 'activity') return !r.n.read;
      if (r.type === 'revised') return canReview(r.x); // the client's turn, unless it is one of the owner's own brands
      return true;
    }).length;
  }
  function greeting() {
    var h = +new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Dubai' }).format(new Date());
    return h < 12 ? 'p.hq.morning' : h < 17 ? 'p.hq.afternoon' : 'p.hq.evening';
  }
  function ownerName() { var n = S.profile && (S.profile.full_name || '').trim(); return n || 'KJ'; }
  function miniLogo(c) { return '<span class="mini-logo">' + logoHtml(c) + '</span>'; }

  function renderHQ() {
    var d = new Date();
    $('hq-date').textContent = new Intl.DateTimeFormat(loc(), { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Dubai' }).format(d) + ' · ' +
      new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Dubai' }).format(d) + ' ' + t('dv.dubai');
    $('hq-hello').textContent = t(greeting(), { name: ownerName() });
    var todo = todoCount(), stats = S.clients.map(statsOf);
    var sum = function (k) { return stats.reduce(function (a, s2) { return a + s2[k]; }, 0); };
    $('hq-todo-btn').textContent = todo ? t('p.hq.todo.n', { n: todo }) : t('p.hq.todo.0');
    $('hq-todo-btn').classList.toggle('is-clear', !todo);
    var own = S.clients.filter(function (c) { return c.internal; }).length;
    var tile = function (tag, v, label, foot, nav) {
      return '<' + (nav ? 'button type="button" data-nav="' + nav + '"' : 'div') + ' class="inst inst-num' + (nav ? ' inst-need' : '') + '"><span class="inst-tag">' + esc(t(tag)) + '</span><span class="big">' + v + '</span>' +
        '<div class="inst-ruler" aria-hidden="true"></div><span class="inst-label">' + esc(label) + '</span><span class="inst-foot"><span>' + esc(foot) + '</span></span></' + (nav ? 'button' : 'div') + '>';
    };
    $('hq-sum').innerHTML = tile('p.hq.t.clients', S.clients.length, t('p.hq.clients'), t('p.hq.own', { n: own }), null) +
      tile('p.hq.t.todo', todo, t('p.hq.todo'), t('p.hq.todo.foot'), 'todo') +
      tile('p.hq.t.waiting', sum('waiting'), t('p.hq.waiting'), t('p.hq.waiting.foot'), null) +
      tile('p.hq.t.week', sum('week'), t('p.hq.weekc'), t('p.hq.month', { n: sum('month') }), 'week');

    $('hq-clients').innerHTML = S.clients.map(function (c, i) {
      var st = stats[i], nx = st.next;
      var stat = function (k, v, label, hot) { return '<div class="cs' + (hot && v ? ' hot' : '') + '" data-stat="' + k + '"><b class="mono">' + v + '</b><span>' + esc(label) + '</span></div>'; };
      var cov = coversOf(c)[0], lg = safeUrl(c.logo_url);
      var art = '<div class="card-art" aria-hidden="true">' + (cov ? '<img src="' + esc(cov) + '" alt="" loading="lazy" decoding="async">' : D.neonLogo(lg || CUBE)) + '</div>';
      return '<li><article class="client-card' + (c.internal ? ' is-own' : '') + (cov ? ' has-cover' : ' has-logo-art') + '" id="hqc-' + esc(c.id) + '" aria-labelledby="hqc-n-' + esc(c.id) + '">' + art +
        '<header class="cc-head"><span class="cc-logo">' + logoHtml(c) + '</span><div class="cc-id"><h3 id="hqc-n-' + esc(c.id) + '">' + esc(cName(c)) + '</h3>' +
        '<span class="cc-handle">' + esc(c.instagram ? '@' + handle(c) : '—') + '</span><span class="cc-brands" title="' + esc(t('p.br.title')) + '" aria-hidden="true"><i style="background:' + esc(brandColor(c, '--b-bg')) + '"></i><i style="background:' + esc(brandColor(c, '--b-primary')) + '"></i><i style="background:' + esc(brandColor(c, '--b-accent')) + '"></i></span></div>' +
        '</header><div class="cc-badges"><span class="pill pill-demo cc-pkg" title="' + esc(t('p.pkg', { name: planName(c) })) + '">' + esc(planName(c)) + '</span>' +
        '<span class="cc-tag' + (c.internal ? ' own' : '') + '">' + esc(tagOf(c)) + '</span></div>' +
        '<div class="cc-stats">' + stat('waiting', st.waiting, t(c.internal ? 'p.st.wait.own' : 'p.st.wait'), false) + stat('changes', st.changes, t('p.st.changes'), true) +
        stat('week', st.week, t('p.st.week'), false) + stat('month', st.month, t('p.st.month'), false) + '</div>' +
        '<div class="cc-next">' + (nx ? '<span class="eyebrow">' + esc(t('p.sb.next')) + '</span><button type="button" class="cc-next-btn" data-action="cal-item" data-id="' + esc(nx.id) + '"><span class="mono">' + esc(fmtWhen(nx.scheduled_at)) + '</span> <strong>' + esc(pick(nx, 'title', 'title_ar')) + '</strong></button>'
          : '<span class="eyebrow">' + esc(t('p.sb.next')) + '</span><span class="cc-none">' + esc(t('p.next.empty')) + '</span>') + '</div>' +
        '<button class="btn btn-primary cc-open" type="button" data-action="open-ws" data-id="' + esc(c.id) + '">' + esc(t('p.hq.open')) + '<span class="sr-only"> — ' + esc(cName(c)) + '</span></button>' +
        '</article></li>';
    }).join('');

    var rows = todoRows();
    $('hq-todo').innerHTML = rows.length ? rows.map(function (r) {
      var c = r.c, who = c ? '<span class="td-client">' + miniLogo(c) + esc(cName(c)) + '</span>' : '';
      var when = r.when ? '<span class="td-when">' + esc(ago(r.when)) + '</span>' : '';
      if (r.type === 'dw-quote' || r.type === 'dw-check') {
        var j = r.j;
        return '<li class="td td-drawing"><span class="td-ic" data-kind="drawing">' + D.icon('drawings') + '</span><div class="td-main"><div class="td-top"><span class="td-type">' + esc(t('p.td.' + r.type.replace('-', '.'))) + '</span>' + when + '</div>' +
          '<strong>' + esc(j.name) + (j.company ? ' · ' + esc(j.company) : '') + '</strong><p>' + (j.parent_id ? esc(t('p.dw.addon')) + ' · ' : '') + esc(dwWork(j)) + '</p></div>' +
          '<div class="td-acts"><button class="btn btn-primary btn-sm" type="button" data-action="dw-open" data-id="' + esc(j.id) + '">' + esc(t('p.td.dw.open')) + '</button></div></li>';
      }
      if (r.type === 'activity') {
        var body = pick(r.n, 'body', 'body_ar');
        return '<li class="td td-activity' + (r.n.read ? ' is-read' : '') + '"><span class="td-ic" data-kind="activity">' + D.icon('bell') + '</span><div class="td-main"><div class="td-top">' + who + '<span class="td-type">' + esc(t('p.td.activity')) + '</span>' + when + '</div>' +
          '<strong>' + (r.n.read ? '' : '<span class="nb-unread" aria-hidden="true"></span>') + esc(pick(r.n, 'title', 'title_ar')) + '</strong>' + (body ? '<p>' + esc(body) + '</p>' : '') + '</div></li>';
      }
      var x = r.x;
      return '<li class="td td-' + r.type + '"><span class="td-ic" data-kind="' + r.type + '">' + D.icon(r.type === 'changes' ? 'pencil' : r.type === 'revised' ? 'check' : 'reports') + '</span><div class="td-main"><div class="td-top">' + who +
        '<span class="td-type">' + esc(t(r.type === 'changes' ? 'p.td.changes' : r.type === 'revised' ? (canReview(x) ? 'p.td.revised.own' : 'p.td.revised') : 'p.td.draft')) + '</span>' + when + '</div>' +
        '<strong>' + esc(pick(x, 'title', 'title_ar')) + '</strong>' +
        (r.type === 'changes' && x.client_note ? '<p class="td-note">“' + esc(x.client_note) + '”</p>' : '') +
        (r.type === 'revised' && x.revision_note ? '<p class="td-note">' + esc(t('p.appr.whatchanged', { note: x.revision_note })) + '</p>' : '') +
        (r.type === 'draft' ? '<p>' + esc(t('p.td.draft.sub')) + '</p>' : '') + '</div>' +
        '<div class="td-acts">' + (r.type === 'changes' ? '<button class="btn btn-primary btn-sm" type="button" data-action="sendback" data-id="' + esc(x.id) + '">' + esc(t('p.sb.btn')) + '</button>' : '') +
        (r.type === 'draft' ? (draftReady(x) ? '<button class="btn btn-primary btn-sm" type="button" data-action="to-approval" data-id="' + esc(x.id) + '">' + esc(t('p.dr.btn')) + '</button>' : '<span class="td-block">' + esc(t(draftBlock(x))) + '</span>') : '') +
        '<button class="btn btn-ghost btn-sm" type="button" data-action="preview" data-id="' + esc(x.id) + '">' + esc(t('p.appr.preview')) + '</button>' +
        '<button class="btn btn-ghost btn-sm" type="button" data-action="open-ws" data-id="' + esc(x.client_id) + '">' + esc(t('p.hq.open')) + '</button></div></li>';
    }).join('') : '<li class="gcard portal-empty">' + esc(t('p.td.empty')) + '</li>';

    renderHQWeek();
    renderJobs();
    // sidebar
    $('sbh-clients').textContent = S.clients.length;
    $('sbh-todo').textContent = todo; $('sbh-todo').classList.toggle('hot', todo > 0);
    $('sbh-week').textContent = sum('week');
    $('sbh-list').innerHTML = S.clients.map(function (c) {
      return '<li><button type="button" data-action="open-ws" data-id="' + esc(c.id) + '">' + miniLogo(c) + '<span>' + esc(cName(c)) + '</span><span class="sb-v">' + statsOf(c).waiting + '</span></button></li>';
    }).join('');
    D.setBadge('todo', todo);
    renderAdmin();
  }
  function renderHQWeek() {
    var start = weekStart(S.hqWeek), last = new Date(start); last.setDate(last.getDate() + 6);
    var f = new Intl.DateTimeFormat(loc(), { day: 'numeric', month: 'short' });
    $('hq-week-label').textContent = (S.hqWeek === 0 ? t('p.cal.today') + ' · ' : '') + f.format(start) + ' – ' + f.format(last);
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var days = [];
    for (var i = 0; i < 7; i++) { var day = new Date(start); day.setDate(day.getDate() + i); days.push({ name: t('p.day.' + day.getDay()), num: String(day.getDate()), today: day.getTime() === today.getTime() }); }
    var tracks = S.clients.map(function (c) {
      var clips = S.all.filter(function (x) { return x.client_id === c.id && x.kind !== 'reply' && inWeek(x, S.hqWeek); }).map(function (x) {
        var dd = new Date(x.scheduled_at), p = plat(x.platform);
        return { id: x.id, day: dayIndex(start, dd), mins: dd.getHours() * 60 + dd.getMinutes(), time: fmtTime(x.scheduled_at), title: pick(x, 'title', 'title_ar'),
          kind: t('p.type.' + x.kind), pg: x.platform, color: p.color, dot: STATUS_DOT[x.status] || 'off', status: x.status === 'needs_approval' ? t(c.internal ? 'p.st.wait.own' : 'p.wait.client') : statusLabel(x.status), wave: x.kind === 'reel' || x.kind === 'story', dim: x.status === 'draft' };
      });
      var code = (c.name || '?').replace(/[^A-Za-z0-9 ]/g, '').trim().split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 3);
      return { code: code, label: cName(c), clips: clips };
    });
    var now = S.hqWeek === 0 ? (Date.now() - start.getTime()) / (7 * 86400000) : null;
    $('hq-cal').innerHTML = D.timeline({ days: days, tracks: tracks, now: now, nowLabel: t('dv.now') + ' ' + fmtTime(new Date().toISOString()) });
    $('hq-legend').innerHTML = ['needs_approval', 'changes_requested', 'approved', 'scheduled', 'published', 'draft'].map(function (s2) {
      return '<span><span class="dot ' + STATUS_DOT[s2] + '"></span>' + esc(s2 === 'needs_approval' ? t('p.hq.waiting') : statusLabel(s2)) + '</span>';
    }).join('') + '<span>' + esc(t('p.week.platform')) + '</span>';
    if (D.current() === 'week') D.revealNow($('hq-cal'));
  }

  function renderAdmin() {
    D.setAvailable('admin', S.isAdmin);
    show($('admin'), S.isAdmin);
    if (!S.isAdmin) return;
    var target = clientById(S.ccClient) || S.clients[0];
    if (!target) return;
    S.ccClient = target.id;
    $('adm-sub').textContent = t('p.adm.sub2');
    $('cc-sheet-client').textContent = cName(target);
    $('cc-client-count').textContent = S.clients.length;
    $('cc-covers-client').textContent = cName(target);
    $('imp-help').textContent = t('p.imp.help', { name: cName(target) });
    if (document.activeElement !== $('cc-covers-input')) $('cc-covers-input').value = coversOf(target).join(',\n');
    renderMood();
    renderPub();
    renderSocial();
    renderBrandEditor(target);
    $('client-switch').innerHTML = S.clients.map(function (c) {
      var on = c.id === target.id;
      return '<button class="cc-client" type="button" data-action="cc-target" data-id="' + esc(c.id) + '" aria-pressed="' + on + '">' +
        '<span class="cc-logo">' + logoHtml(c) + '</span><b>' + esc(cName(c)) + (c.active === false ? ' (—)' : '') + '</b><small>' + esc(tagOf(c)) + '</small></button>';
    }).join('');
    var kinds = ['post', 'reel', 'story', 'carousel', 'reply', 'ad'];
    var keep = function (sel) { return sel.value; };
    var k = $('fi-kind'), kv = keep(k);
    k.innerHTML = kinds.map(function (x) { return '<option value="' + x + '">' + esc(t('p.type.' + x)) + '</option>'; }).join('');
    if (kv) k.value = kv;
    var pl = $('fi-platform'), pv = keep(pl);
    pl.innerHTML = '<option value="">—</option>' + allPlatforms().map(function (p) { return '<option value="' + p.id + '">' + esc(p[L()]) + '</option>'; }).join('');
    pl.value = pv || 'instagram';
    var st = $('fi-status'), sv = keep(st);
    st.innerHTML = ['needs_approval', 'draft', 'scheduled', 'published'].map(function (s) { return '<option value="' + s + '">' + esc(t('p.s.' + s)) + '</option>'; }).join('');
    st.value = sv || 'needs_approval';
  }
  var sheet = $('cc-sheet');
  function selectForm(id) {
    ['f-item', 'f-import', 'f-kpi', 'f-notif'].forEach(function (f) { show($(f), f === id); });
    sheet.querySelectorAll('[data-form-tab]').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-form-tab') === id ? 'true' : 'false'); });
  }
  function openSheet(formId) {
    selectForm(formId || 'f-item');
    if (!sheet.open) { if (typeof sheet.showModal === 'function') sheet.showModal(); else sheet.setAttribute('open', ''); }
    var first = $(formId || 'f-item').querySelector('select, input');
    if (first) first.focus();
  }
  function closeSheet() { if (sheet.open) { if (typeof sheet.close === 'function') sheet.close(); else sheet.removeAttribute('open'); } }
  sheet.addEventListener('click', function (e) {
    if (e.target === sheet) { closeSheet(); return; }
    var tab = e.target.closest('[data-form-tab]');
    if (tab) selectForm(tab.getAttribute('data-form-tab'));
  });

  function renderBoard() {
    // the cube and circuit screens are the dashboard now: the classic board is never shown, so it is not drawn (no hidden work, no hidden photos)
    if (CLASSIC_OFF) return;
    if (S.mode === 'hq') { renderHeader(); renderNotifs(); renderHQ(); renderAmbient(); renderCore(); return; }
    if (!S.client) return;
    renderHeader(); renderAmbient(); renderHello(); renderKpis(); renderNext(); renderApprovals();
    renderFilters(); renderCalendar(); renderPackage(); renderReports(); renderNotifs(); renderCore();
  }

  /* ---------- Data ---------- */
  function q(p) {
    return p.then(function (r) { if (r.error) throw r.error; return r.data; });
  }
  function loadNotifs() {
    var query = sb.from('notifications').select('*');
    query = S.isAdmin ? query.eq('audience', 'admin') : query.eq('client_id', S.client.id).eq('audience', 'client');
    return q(query.order('created_at', { ascending: false }).limit(40)).then(function (d) { S.notifs = d || []; });
  }
  function loadClientData() {
    var id = S.client.id;
    return Promise.all([
      q(sb.from('kpis').select('*').eq('client_id', id).order('period_start', { ascending: false }).order('created_at', { ascending: false })),
      q(sb.from('items').select('*').eq('client_id', id).order('scheduled_at', { ascending: true, nullsFirst: false })),
      q(sb.from('reports').select('*').eq('client_id', id).order('created_at', { ascending: false })),
      loadNotifs(),
      loadComments()
    ]).then(function (r) {
      S.kpis = r[0] || []; S.items = r[1] || []; S.reports = r[2] || [];
    });
  }
  function pickInitialWeek() {
    // Start on this week; if nothing is planned this week, jump to the next week that has content.
    S.week = 0;
    var start = weekStart(0), end = new Date(start); end.setDate(end.getDate() + 7);
    var dated = S.items.filter(function (x) { return x.scheduled_at && x.kind !== 'reply'; }).map(function (x) { return new Date(x.scheduled_at); });
    if (!dated.length || dated.some(function (d) { return d >= start && d < end; })) return;
    var future = dated.filter(function (d) { return d >= end; }).sort(function (a, b) { return a - b; })[0];
    if (future) S.week = Math.min(52, Math.floor((future - start) / (7 * 86400000)));
  }

  function showBoard(view) {
    $('dash').setAttribute('data-state', 'ready');
    show($('state'), false); show($('pw-panel'), false); show($('board'), true);
    show($('notif-wrap'), true);
    renderBoard();
    chrome(true);
    D.show(view || D.current(), { bounce: false, force: !!view });
  }

  // Navigation sets: a client (or KJ inside a workspace) sees the client sections; KJ at HQ sees HQ sections.
  var CLIENT_NAV = [
    { id: 'today', key: 'dv.today', icon: 'today', tone: 'gold' },
    { id: 'core', key: 'dv.core', icon: 'core', tone: 'core' },
    { id: 'approvals', key: 'dv.approvals', icon: 'approvals' },
    { id: 'calendar', key: 'dv.calendar', icon: 'calendar', tone: 'cal' },
    { id: 'inbox', key: 'dv.inbox', icon: 'inbox' },
    { id: 'ads', key: 'dv.ads', icon: 'ads' },
    { id: 'whatsapp', key: 'dv.whatsapp', icon: 'whatsapp', tone: 'wa' },
    { id: 'reports', key: 'dv.reports', icon: 'reports', tone: 'steel' }
  ];
  var HQ_NAV = [
    { id: 'hq', key: 'dv.hq', icon: 'box', tone: 'gold' },
    { id: 'drawings', key: 'dv.drawings', icon: 'drawings', tone: 'steel' },
    { id: 'core', key: 'dv.core', icon: 'core', tone: 'core' },
    { id: 'todo', key: 'dv.todo', icon: 'pencil' },
    { id: 'week', key: 'dv.week', icon: 'calendar', tone: 'cal' },
    { id: 'admin', key: 'dv.control', icon: 'control', sep: true }
  ];
  var HQ_VIEWS = ['hq', 'drawings', 'todo', 'week', 'admin'];
  function navFor(mode) {
    if (mode === 'hq') D.buildNav({ items: HQ_NAV, tabs: ['hq', 'drawings', 'todo', 'week', 'more'] });
    else if (mode === 'ws') D.buildNav({ items: [{ id: 'hq', key: 'dv.backhq', icon: 'back', tone: 'steel' }].concat(CLIENT_NAV.map(function (it, i) { return i === 0 ? Object.assign({ sep: true }, it) : it; })), tabs: ['today', 'core', 'approvals', 'calendar', 'more'] });
    else D.buildNav({ items: CLIENT_NAV, tabs: ['today', 'core', 'approvals', 'calendar', 'more'] });
    document.querySelectorAll('.hq-view').forEach(function (v) { if (v.id !== 'admin') v.hidden = !S.isAdmin; });
  }

  function loadHQ() {
    return Promise.all([
      q(sb.from('clients').select('*').order('created_at', { ascending: true })),
      q(sb.from('items').select('*').order('scheduled_at', { ascending: true, nullsFirst: false })),
      loadNotifs(),
      q(sb.from('app_settings').select('*')).catch(function () { return null; }),
      loadDrawings(),
      q(sb.rpc('social_links')).catch(function () { return []; })
    ]).then(function (r) { S.clients = r[0] || []; S.all = r[1] || []; S.settings = {}; (r[3] || []).forEach(function (s2) { S.settings[s2.key] = s2.value; }); if (r[3] === null) S.settings.__missing = '1'; S.social = r[5] || []; });
  }
  // drawing jobs (T-12): the HQ "Jobs · Drawings" section, the to-do and the Drawings view
  function loadDrawings() {
    return q(sb.from('drawing_jobs').select('id,name,company,status,revision,work,parent_id,created_at,updated_at').neq('status', 'cancelled').order('created_at', { ascending: false }).limit(200))
      .then(function (d) { S.dw = d || []; }).catch(function () { S.dw = S.dw || []; });
  }
  var DW_GROUP = { received: 'quote', check: 'check', confirmed: 'work', in_work: 'work', changes: 'work', quoted: 'cust', review: 'cust', approved: 'done' };
  var DW_ORDER = ['received', 'check', 'changes', 'confirmed', 'in_work', 'quoted', 'review', 'approved'];
  function dwWork(j) { return (j.work || []).map(function (w) { return t('p.dw.w.' + w); }).join(' · '); }
  function renderJobs() {
    var jobs = (S.dw || []).slice().sort(function (a, b) { return DW_ORDER.indexOf(a.status) - DW_ORDER.indexOf(b.status) || String(b.created_at).localeCompare(String(a.created_at)); });
    var n = { quote: 0, check: 0, work: 0, cust: 0, done: 0 };
    jobs.forEach(function (j) { if (DW_GROUP[j.status]) n[DW_GROUP[j.status]]++; });
    var tile = function (k, hot) {
      return '<button type="button" class="inst inst-num' + (hot && n[k] ? ' inst-need' : '') + '" data-nav="drawings"><span class="inst-tag">' + esc(t('p.dw.t.' + k)) + '</span><span class="big">' + n[k] + '</span><div class="inst-ruler" aria-hidden="true"></div></button>';
    };
    var tiles = tile('quote', true) + tile('check', true) + tile('work') + tile('cust');
    var active = jobs.filter(function (j) { return j.status !== 'approved'; }).slice(0, 3);
    var list = active.length ? '<ul class="todo-list hq-jobs-list">' + active.map(function (j) {
      return '<li class="td"><span class="td-ic" data-kind="drawing">' + D.icon('drawings') + '</span><div class="td-main"><div class="td-top"><span class="td-type">' + esc(t('p.dw.s.' + j.status)) + (j.revision > 1 ? ' · rev ' + esc(j.revision) : '') + '</span><span class="td-when">' + esc(ago(j.updated_at || j.created_at)) + '</span></div>' +
        '<strong>' + esc(j.name) + (j.company ? ' · ' + esc(j.company) : '') + '</strong><p>' + (j.parent_id ? esc(t('p.dw.addon')) + ' · ' : '') + esc(dwWork(j)) + '</p></div>' +
        '<div class="td-acts"><button class="btn btn-ghost btn-sm" type="button" data-action="dw-open" data-id="' + esc(j.id) + '">' + esc(t('p.td.dw.open')) + '</button></div></li>';
    }).join('') + '</ul>' : '<p class="gcard portal-empty">' + esc(t('p.hq.jobs.none')) + '</p>';
    if ($('hq-jobs')) $('hq-jobs').innerHTML = '<div class="instruments hq-sum">' + tiles + '</div>' + list;
    if ($('dw-sum')) $('dw-sum').innerHTML = tiles + tile('done');
    if ($('sbh-dw')) { $('sbh-dw').textContent = n.quote + n.check; $('sbh-dw').classList.toggle('hot', n.quote + n.check > 0); }
  }
  function ensureDrawings() {
    if (S.dwHQ || !window.ZKJDrawingsHQ) return S.dwHQ;
    S.dwHQ = window.ZKJDrawingsHQ.mount($('dw-board'), sb, { onChange: function (jobs) {
      S.dw = jobs.filter(function (j) { return j.status !== 'cancelled'; });
      if (S.mode === 'hq') renderHQ();
    } });
    return S.dwHQ;
  }
  function openDrawing(id) {
    if (D.current() !== 'drawings') D.show('drawings', { force: true, focus: !id }); // the view hook mounts / reloads the list
    var hq = ensureDrawings();
    if (hq && id) hq.open(id);
  }
  function showHQ(view) {
    S.mode = 'hq'; S.client = null;
    navFor('hq');
    showBoard(view || 'hq');
  }
  function openWorkspace(id) {
    var c = clientById(id); if (!c) return Promise.resolve();
    S.client = c; S.filter = 'all'; S.mode = 'ws';
    Z.store(CLIENT_KEY, c.id);
    $('dash').setAttribute('data-state', 'loading');
    return loadClientData().then(function () { pickInitialWeek(); navFor('ws'); showBoard('today'); });
  }
  function backToHQ(view) {
    $('dash').setAttribute('data-state', 'loading');
    return loadHQ().then(function () { showHQ(view); }).catch(loadError);
  }

  function loadError(err) {
    booted();
    if (window.console) console.warn('[portal] load failed', err && (err.message || err));
    setState('p.st.error.t', 'p.st.error.b', [{ action: 'retry', key: 'p.retry', cls: 'btn-primary' }, WA_ACTION]);
  }


  function boot() {
    if (!sb) { setState('p.st.error.t', 'p.e.config', [WA_ACTION]); return; }
    sb.auth.getSession().then(function (r) {
      var session = r && r.data && r.data.session;
      if (!session) {
        window.location.replace('login.html' + (SB.linkError ? (SB.linkCode === 'otp_expired' ? '?e=expired' : '?e=link') : ''));
        return null;
      }
      // signed in already: a stale "#error=access_denied&error_code=otp_expired…" from an old link is not an error
      if (SB.linkError && SB.clearLinkError) SB.clearLinkError();
      S.user = session.user;
      signedInChrome();
      if (SB.linkType === 'invite' || SB.linkType === 'recovery') { showPassword(); return null; }
      return loadProfile();
    }).catch(loadError);
  }

  function loadProfile() {
    setState('p.loading', null);
    $('dash').setAttribute('data-state', 'loading');
    return q(sb.from('profiles').select('*').eq('id', S.user.id).maybeSingle()).then(function (p) {
      if (!p) { setState('p.st.noprofile.t', 'p.st.noprofile.b', [WA_ACTION]); return; }
      S.profile = p; S.isAdmin = p.role === 'admin';
      if (p.lang && !Z.store('zkj-lang') && p.lang !== L()) Z.setLang(p.lang);
      if (S.isAdmin) {
        // KJ lands on ZKJ SYSTEM HQ, never inside a client's screen
        return loadHQ().then(function () {
          if (!S.clients.length) { setState('p.st.noclients.t', 'p.st.noclients.b'); return; }
          var stored = Z.store(CLIENT_KEY);
          S.ccClient = clientById(stored) ? stored : clientById(DEFAULT_CLIENT) ? DEFAULT_CLIENT : S.clients[0].id;
          showHQ('hq');
          openFront();
        });
      }
      if (!p.client_id) { setState('p.st.unlinked.t', 'p.st.unlinked.b', [WA_ACTION]); return; }
      return q(sb.from('clients').select('*').eq('id', p.client_id).maybeSingle()).then(function (c) {
        if (!c || c.active === false) { setState('p.st.noclient.t', 'p.st.noclient.b', [WA_ACTION]); return; }
        S.clients = [c]; S.client = c; S.mode = 'client';
        return loadClientData().then(function () { pickInitialWeek(); navFor('client'); showBoard('today'); openFront(); });
      });
    }).catch(loadError);
  }


  /* ---------- Front: the cube (app/front.html), the first screen after login (KJ, 2 Nov 2026) ----------
     The cube runs in its own full-screen frame so its canvas and styles never touch the portal. It asks this file for a model
     (labels, real numbers, links) through window.ZFRONT_HOST and sends every tap back as an action token:
       v:<view>  open a portal screen · hq:<view>  KJ's HQ screen · ws:<client id>  KJ switches brand · bell · lang · signout · close */
  var FR = { wrap: null, frame: null, on: false };
  var WA = 'https://wa.me/971541668700';
  function frontClient() { return S.isAdmin ? (clientById(S.ccClient) || S.clients[0] || null) : S.client; }
  function frontItems(c) { if (!c) return []; return S.isAdmin ? (S.all || []).filter(function (x) { return x.client_id === c.id; }) : (S.items || []); }
  function featsOf(c) { return S.isAdmin ? ['inbox', 'ads', 'whatsapp'] : PKG[planKey(c)].features; }
  function frontModel() {
    var c = frontClient(), items = frontItems(c), feats = featsOf(c);
    var need = items.filter(function (x) { return x.status === 'needs_approval'; }).length;
    var h = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Dubai' }).format(new Date()));
    var who = S.isAdmin ? 'KJ' : ((S.profile && S.profile.full_name) || cName(c) || '');
    var greet = t(h < 12 ? 'fr.morning' : h < 18 ? 'fr.afternoon' : 'fr.evening') + (who ? (L() === 'ar' ? '، ' : ', ') + who : '') +
      (S.isAdmin && c ? ' · ' + cName(c) : '') + ' · ' + (need ? t('fr.need', { n: need }) : t('fr.clear'));
    var gate = function (f, view) { return feats.indexOf(f) > -1 ? 'v:' + view : null; };
    // page 1: six plates around the cube
    var plates = [
      ['approvals', t('fr.p.appr'), 'appr', 'c:ap'],
      ['inbox', t('fr.p.inbox'), 'inbox', 'c:inbox'],
      ['adsman', t('fr.p.ads'), 'ads', 'c:ads'],
      ['live', t('fr.p.live'), 'live', 'c:live'],
      ['plan', t('fr.p.plan'), 'plan', 'c:plan'],
      ['calendar', t('fr.p.cal'), 'cal', 'c:cal']];
    // page 2: account rows (the last four fold into tiles on short screens)
    var rows = [
      ['payments', t('fr.r.pay'), t('fr.r.pay.s'), '', '', 'pay', null, null],
      ['package', t('fr.r.pkg'), planName(c), '', '', 'pkg', null, 'c:acc'],
      ['ecard', t('fr.r.ec'), t('fr.r.ec.s'), '', '', 'site', null, 'c:ec'],
      ['account', t('fr.r.acc'), t('fr.r.acc.s'), '', '', 'acc', null, 'c:acc'],
      ['terms', t('fr.r.terms'), t('fr.r.terms.s'), '', '', 'terms', '../terms.html', null],
      ['privacy', t('fr.r.priv'), t('fr.r.priv.s'), '', '', 'priv', '../privacy.html', null],
      ['channels', t('fr.r.chan'), t('fr.r.chan.s'), '', '', 'chan', null, null],
      ['numbers', t('fr.r.num'), t('fr.r.num.s'), '', '', 'num', null, 'c:num'],
      ['core', t('fr.r.core'), t('fr.r.core.s'), '', '', 'core', null, 'v:core'],
      ['reports', t('fr.r.rep'), t('fr.r.rep.s'), '', '', 'reports', null, 'c:rep'],
      ['whatsapp', 'WhatsApp', t('fr.r.wa.s'), '', '', 'whatsapp', WA, null]];
    var sec = {};
    var row = function (k, v, href, icon, act) { return [k, v || '', href || null, icon || null, act || null]; };
    // Live now: the newest published posts, every link real
    var live = [];
    items.filter(function (x) { return x.published_url || x.fb_url || x.threads_url; })
      .sort(function (a, b) { return String(b.published_at || b.scheduled_at || '').localeCompare(String(a.published_at || a.scheduled_at || '')); })
      .forEach(function (x) {
        var title = pick(x, 'title', 'title_ar'), when = x.published_at ? ' · ' + fmtDate(x.published_at) : '';
        if (safeUrl(x.published_url)) live.push(row(title, plat(x.platform)[L()] + when, safeUrl(x.published_url)));
        if (safeUrl(x.fb_url)) live.push(row(title, plat('facebook')[L()] + when, safeUrl(x.fb_url)));
        if (safeUrl(x.threads_url)) live.push(row(title, plat('threads')[L()] + when, safeUrl(x.threads_url)));
      });
    sec.live = { t: t('fr.p.live'), s: live.length ? t('fr.live.s') : t('fr.live.none'), rows: live.slice(0, 7) };
    // Plan: this month's planned posts by type (Dubai month), then the calendar
    var ym = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', timeZone: 'Asia/Dubai' }).format(new Date());
    var counts = {};
    items.forEach(function (x) {
      if (x.kind === 'reply' || !x.scheduled_at) return;
      if (new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', timeZone: 'Asia/Dubai' }).format(new Date(x.scheduled_at)) !== ym) return;
      counts[x.kind] = (counts[x.kind] || 0) + 1;
    });
    var planRows = ['reel', 'post', 'carousel', 'story', 'ad'].filter(function (k) { return counts[k]; }).map(function (k) { return row(t('fr.kind.' + k), String(counts[k])); });
    planRows.push(row(t('fr.plan.open'), t('fr.plan.open.s'), null, 'calendar', 'v:calendar'));
    sec.plan = { t: t('fr.p.plan'), s: new Intl.DateTimeFormat(loc(), { month: 'long', year: 'numeric', timeZone: 'Asia/Dubai' }).format(new Date()), rows: planRows };
    sec.payments = { t: t('fr.r.pay'), s: t('fr.pay.s'), rows: [row(t('fr.pay.wa'), t('fr.pay.wa.s'), WA + '?text=' + encodeURIComponent(t('wa.general')), 'whatsapp')] };
    var pk = PKG[planKey(c)].features;
    sec.package = { t: t('fr.r.pkg'), s: planName(c), rows: [row(t('p.pkg.core'), t('fr.inc'))].concat(Object.keys(ADDONS).map(function (f) { return row(t(ADDONS[f]), pk.indexOf(f) > -1 ? t('fr.inc') : t('fr.notinc')); }))
      .concat([row(t('fr.pkg.add'), t('fr.pay.wa.s'), WA + '?text=' + encodeURIComponent(t('wa.general')), 'whatsapp')]) };
    sec.account = { t: t('fr.r.acc'), s: S.user && S.user.email ? S.user.email : '', rows: [
      S.isAdmin ? row(t('fr.acc.brand'), t('fr.acc.brand.s'), null, 'control', 'hq:admin') : row(t('fr.acc.brand'), t('fr.acc.brand.kj')),
      row(t('fr.acc.lang'), L() === 'ar' ? 'English' : 'العربية', null, 'globe', 'lang'),
      row(t('p.back'), 'system.zkjverse.com', '../index.html', 'site'),
      row(t('p.signout'), t('fr.acc.out.s'), null, 'signout', 'signout')] };
    // Channels: what is linked for this brand
    var chan = [];
    if (c && c.instagram) chan.push(row('Instagram', '@' + String(c.instagram).replace(/^@/, ''), 'https://www.instagram.com/' + encodeURIComponent(String(c.instagram).replace(/^@/, '')) + '/'));
    if (S.isAdmin) {
      SOC_NETS.forEach(function (n) {
        var a = (S.social || []).filter(function (s2) { return s2.client_id === c.id && s2.network === n.id; })[0];
        chan.push(row(n[L()], !a ? t('p.soc.none') : a.status !== 'ok' ? t('p.soc.expired') : (a.name || t('p.soc.ok'))));
      });
      chan.push(row(t('fr.chan.manage'), t('fr.chan.manage.s'), null, 'control', 'hq:admin'));
    } else {
      var used = {}; items.forEach(function (x) { if (x.platform && x.platform !== 'instagram') used[x.platform] = 1; });
      Object.keys(used).forEach(function (id) { chan.push(row(plat(id)[L()], t('fr.chan.used'))); });
    }
    sec.channels = { t: t('fr.r.chan'), s: c ? cName(c) : '', rows: chan.length ? chan : [row(t('fr.chan.none'), '')] };
    // Ads: every platform's own ads manager (official addresses, checked 2 Nov 2026), plus our ad approvals
    var pn = function (id) { return plat(id)[L()]; };
    sec.adsman = { t: t('fr.p.ads'), s: t('fr.ads.s'), rows: [
      gate('ads', 'ads') ? row(t('fr.ads.appr'), t('fr.ads.appr.s'), null, 'ads', 'v:ads') : row(t('fr.ads.appr'), t('fr.notinc'), WA + '?text=' + encodeURIComponent(t('wa.general')), 'ads'),
      row('Meta', pn('facebook') + ' · ' + pn('instagram'), 'https://adsmanager.facebook.com/', 'pm-meta'),
      row(pn('tiktok'), 'Ads Manager', 'https://ads.tiktok.com/', 'pm-tiktok'),
      row('Google', 'Google Ads · ' + pn('youtube'), 'https://ads.google.com/', 'pm-google'),
      row(pn('snapchat'), 'Ads Manager', 'https://ads.snapchat.com/', 'pm-snapchat'),
      row(pn('x'), 'X Ads', 'https://ads.x.com/', 'pm-x'),
      row(pn('pinterest'), 'Pinterest Ads', 'https://ads.pinterest.com/', 'pm-pinterest'),
      row('LinkedIn', 'Campaign Manager', 'https://www.linkedin.com/campaignmanager/', 'pm-linkedin')] };
    // not in the package: say so and offer WhatsApp, never a dead tap
    sec.addon = { t: t('fr.addon.t'), s: planName(c), rows: [row(t('fr.addon.b'), t('fr.pay.wa.s'), WA + '?text=' + encodeURIComponent(t('wa.general')), 'whatsapp')] };
    plates.forEach(function (p) { if (p[3] === null && !sec[p[0]]) p[3] = 'sec:addon'; });
    if (S.isAdmin) sec.hq = { t: t('fr.hq.t'), s: t('fr.hq.s'), rows: [
      row(t('fr.hq.all'), t('fr.hq.all.s'), null, 'box', 'hq:hq'),
      row(t('dv.drawings'), t('fr.hq.dw.s'), null, 'drawings', 'hq:drawings'),
      row(t('dv.todo'), t('fr.hq.todo.s'), null, 'pencil', 'hq:todo'),
      row(t('dv.week'), t('fr.hq.week.s'), null, 'calendar', 'hq:week'),
      row(t('dv.control'), t('fr.hq.cc.s'), null, 'control', 'hq:admin')].concat(S.clients.filter(function (x) { return x.active !== false; }).map(function (x) {
        return row(cName(x), x.id === (c && c.id) ? t('fr.hq.current') : t('fr.hq.switch'), null, 'ring', 'ws:' + x.id); })) };
    return {
      lang: L(), dir: L() === 'ar' ? 'rtl' : 'ltr', admin: !!S.isAdmin, greet: greet, plates: plates, rows: rows, sec: sec,
      hints: [t('fr.h0'), t('fr.h1'), t('fr.h2')], aria: [t('fr.a0'), t('fr.a1'), t('fr.a2')],
      labels: { hq: 'HQ', bell: t('p.notif.title'), lang: t('fr.acc.lang'), out: t('p.signout'), unread: (S.notifs || []).filter(function (n) { return !n.read; }).length }
    };
  }
  function closeFront() {
    if (!FR.wrap || !FR.on) return;
    FR.on = false; FR.wrap.classList.remove('on'); document.documentElement.classList.remove('front-on');
    setTimeout(function () { if (!FR.on) FR.wrap.hidden = true; }, 420);
  }
  function openFront(reload) {
    if (!FR.wrap) {
      FR.wrap = document.createElement('div'); FR.wrap.className = 'front-wrap'; FR.wrap.id = 'front';
      FR.frame = document.createElement('iframe'); FR.frame.title = 'ZKJ SYSTEM'; FR.frame.src = 'front.html?v=20261103d';
      FR.frame.addEventListener('load', function () { setTimeout(booted, 250); });
      setTimeout(booted, 8000); // never leave the cover up
      FR.frame.setAttribute('allow', 'fullscreen');
      FR.wrap.appendChild(FR.frame); document.body.appendChild(FR.wrap);
    } else if (reload) {
      try { FR.frame.contentWindow.location.reload(); } catch (e) { FR.frame.src = 'front.html?v=20261103d'; }
    } else {
      try { FR.frame.contentWindow.ZFRONT_FRAME && FR.frame.contentWindow.ZFRONT_FRAME.home(); } catch (e) { /* ignore */ }
    }
    FR.wrap.hidden = false; FR.on = true;
    document.documentElement.classList.add('front-on');
    requestAnimationFrame(function () { FR.wrap.classList.add('on'); });
  }
  function frontAct(tok) {
    tok = String(tok || '');
    var c = frontClient();
    if (tok === 'close') { closeCircuit(); openFront(); return; } // never the classic screens (KJ, 3 Nov 2026)
    if (tok === 'home') { closeCircuit(); openFront(); return; }
    if (tok.indexOf('c:') === 0) { if (!FR.on) openFront(); openCircuit(tok.slice(2)); return; }
    if (tok === 'signout') { sb.auth.signOut().then(toLogin, toLogin); return; }
    if (tok === 'lang') { var lt = document.querySelector('[data-lang-toggle]'); if (lt) lt.click(); return; }
    if (tok === 'bell') { if (!FR.on) openFront(); openCircuit('notif'); return; }
    if (tok === 'bell-classic') { if (!FR.on) openFront(); openCircuit('notif'); return; }
    // every screen that used to be classic now has its circuit screen (KJ, 3 Nov 2026)
    var NEWS = { 'hq:hq': 'cl', 'hq:drawings': 'dw', 'hq:todo': 'todo', 'hq:week': 'wk', 'hq:admin': 'cc', 'v:core': 'core', 'v:calendar': 'cal', 'v:ads': 'ads-ap', 'v:approvals': 'ap', 'v:inbox': 'inbox', 'v:reports': 'rep', 'v:today': 'hq' };
    if (NEWS[tok]) { if (!FR.on) openFront(); openCircuit(NEWS[tok]); return; }
    if (tok.indexOf('ws:') === 0) { S.ccClient = tok.slice(3); Z.store(CLIENT_KEY, S.ccClient); openFront(true); if (CX.on) { try { CX.frame.contentWindow.ZCIRCUIT.reload(); } catch (e) { /* ignore */ } } return; }
    // any other old token still lands in the new world: KJ's HQ dial, or the client's approvals
    if (tok.indexOf('hq:') === 0 || tok.indexOf('v:') === 0) { if (!FR.on) openFront(); openCircuit(S.isAdmin ? 'hq' : 'ap'); return; }
  }

  /* ---------- Circuit screens (app/circuit.html): every screen in the cube's world (KJ, 3 Nov 2026) ----------
     The page asks for its data with ZFRONT_HOST.data({week}) and acts through review(), reply() and act(). Real data only:
     where there is none yet, the page says so instead of showing figures. */
var CLASSIC_OFF = true;
  var CX = { wrap: null, frame: null, on: false };
  function isVideo(u) { return /\.(mp4|mov|m4v|webm)(\?.*)?$/i.test(u || ''); }
  function mediaOf(x) {
    var all = String(x.media_url || '').split(/[\s,]+/).map(safeUrl).filter(Boolean);
    return { img: all.filter(isImage), video: all.filter(isVideo)[0] || null };
  }
  function dub(iso) { var d = new Date(Date.parse(iso) + 4 * 3600e3); return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), wd: d.getUTCDay(), h: d.getUTCHours() + d.getUTCMinutes() / 60, key: d.toISOString().slice(0, 10) }; }
  function itemOut(x) {
    var md = mediaOf(x), w = x.scheduled_at ? dub(x.scheduled_at) : null;
    return { id: x.id, title: pick(x, 'title', 'title_ar') || '', kind: x.kind, platform: x.platform || '', pname: x.platform ? plat(x.platform)[L()] : '',
      status: x.status, when: x.scheduled_at ? fmtWhen(x.scheduled_at) : '', at: x.scheduled_at || null, wd: w ? w.wd : null, h: w ? w.h : null, key: w ? w.key : null,
      img: md.img, video: md.video, caption: pick(x, 'caption', 'caption_ar') || '', canReview: canReview(x), url: safeUrl(x.published_url) || null };
  }
  function circuitData(opt) {
    opt = opt || {};
    var c = frontClient(); if (!c) return Promise.resolve(null);
    var items = frontItems(c), feats = featsOf(c);
    var get = function (pr) { return q(pr).catch(function () { return []; }); };
    return Promise.all([
      get(sb.from('kpis').select('*').eq('client_id', c.id).order('period_start', { ascending: false }).order('created_at', { ascending: false })),
      get(sb.from('reports').select('*').eq('client_id', c.id).order('created_at', { ascending: false })),
      S.isAdmin ? get(sb.from('comment_replies').select('*').in('client_id', S.clients.filter(function (x) { return x.active !== false; }).map(function (x) { return x.id; })).order('comment_at', { ascending: false, nullsFirst: false }).limit(60)) : Promise.resolve([])
    ]).then(function (r) {
      var kpis = r[0] || [], reports = r[1] || [], comments = r[2] || [];
      var byAt = function (a, b) { return String(a.scheduled_at || '').localeCompare(String(b.scheduled_at || '')); };
      // KJ sees every brand's posts waiting for a yes in one queue, each tagged with its brand (KJ, 3 Nov 2026: new episodes were hidden behind the cube's brand)
      var pendSrc = S.isAdmin ? (S.all || []).filter(function (x) { var cl = clientById(x.client_id); return cl && cl.active !== false; }) : items;
      var pending = pendSrc.filter(function (x) { return x.status === 'needs_approval' && x.kind !== 'reply'; }).sort(byAt).map(function (x) { var o = itemOut(x); if (S.isAdmin) { var cl = clientById(x.client_id); o.client = cl ? cName(cl) : ''; } return o; });
      var drafts = pendSrc.filter(function (x) { return x.status === 'needs_approval' && x.kind === 'reply'; }).map(function (x) { var o = itemOut(x); if (S.isAdmin) { var cl = clientById(x.client_id); o.client = cl ? cName(cl) : ''; } return o; });
      // this week in Dubai, Sunday first; opt.week moves it
      var now = dub(new Date().toISOString()), base = Date.UTC(now.y, now.m, now.d) - now.wd * 86400e3 + (opt.week || 0) * 7 * 86400e3;
      var keys = []; for (var i = 0; i < 7; i++) keys.push(new Date(base + i * 86400e3).toISOString().slice(0, 10));
      // opt.all (KJ's This week): every active brand's posts in the week, each tagged with its brand
      var weekSrc = opt.all && S.isAdmin ? (S.all || []).filter(function (x) { var cl = clientById(x.client_id); return cl && cl.active !== false && x.status !== 'draft'; }) : items;
      var week = weekSrc.filter(function (x) { return x.kind !== 'reply' && x.scheduled_at && keys.indexOf(dub(x.scheduled_at).key) > -1; }).sort(byAt).map(function (x) { var o = itemOut(x); if (opt.all) { var cl = clientById(x.client_id); o.client = cl ? cName(cl) : ''; } return o; });
      var live = [];
      items.filter(function (x) { return x.published_url || x.fb_url || x.threads_url; })
        .sort(function (a, b) { return String(b.published_at || b.scheduled_at || '').localeCompare(String(a.published_at || a.scheduled_at || '')); })
        .forEach(function (x) { var o = itemOut(x), when = x.published_at ? fmtDate(x.published_at) : '';
          if (safeUrl(x.published_url)) live.push({ title: o.title, platform: x.platform, pname: o.pname, url: safeUrl(x.published_url), when: when, img: o.img[0] || null });
          if (safeUrl(x.fb_url)) live.push({ title: o.title, platform: 'facebook', pname: plat('facebook')[L()], url: safeUrl(x.fb_url), when: when, img: o.img[0] || null });
          if (safeUrl(x.threads_url)) live.push({ title: o.title, platform: 'threads', pname: plat('threads')[L()], url: safeUrl(x.threads_url), when: when, img: o.img[0] || null }); });
      var ym = now.y + '-' + now.m, counts = {}, days = {};
      items.forEach(function (x) { if (x.kind === 'reply' || !x.scheduled_at) return; var d = dub(x.scheduled_at); if (d.y + '-' + d.m !== ym) return; counts[x.kind] = (counts[x.kind] || 0) + 1; days[d.d] = 1; });
      var seen = {}, latest = [], series = {};
      kpis.forEach(function (k) { if (!seen[k.metric]) { seen[k.metric] = k; latest.push(k); } (series[k.metric] = series[k.metric] || []).push(Number(k.value)); });
      var nums = latest.filter(function (k) { return !/^target_/.test(k.metric); }).slice(0, 4).map(function (k) {
        var sr = series[k.metric], prev = sr.length > 1 ? sr[1] : null, tg = seen['target_' + k.metric];
        return { label: pick(k, 'label', 'label_ar') || k.metric, value: num(k.value), raw: Number(k.value), delta: prev ? (Number(k.value) - prev) / Math.abs(prev) * 100 : null,
          pct: tg && Number(tg.value) > 0 ? Number(k.value) / Number(tg.value) : null, asof: k.period_start ? fmtDate(k.period_start) : '' };
      });
      var out = {
        lang: L(), dir: L() === 'ar' ? 'rtl' : 'ltr', admin: !!S.isAdmin, week: opt.week || 0, all: !!(opt.all && S.isAdmin),
        client: { id: c.id, name: cName(c), plan: planName(c), feats: feats, internal: c.internal === true, instagram: c.instagram || '' },
        pending: pending, drafts: drafts, week_items: week, week_keys: keys, now: { wd: now.wd, h: dub(new Date().toISOString()).h, key: now.key },
        week_label: fmtDate(keys[0]) + ' – ' + fmtDate(keys[6]),
        live: live.slice(0, 8), plan: { counts: counts, days: Object.keys(days).map(Number), month: new Intl.DateTimeFormat(loc(), { month: 'long', year: 'numeric', timeZone: 'Asia/Dubai' }).format(new Date()),
          dim: new Date(Date.UTC(now.y, now.m + 1, 0)).getUTCDate(), today: now.d },
        nums: nums, reports: reports.map(function (x) { return { title: pick(x, 'title', 'title_ar') || '', period: x.period || x.period_start || '', url: safeUrl(x.file_url) || null, date: x.created_at ? fmtDate(x.created_at) : '' }; }),
        comments: comments.map(function (m) { var mc = clientById(m.client_id); return { id: m.comment_id, client: S.isAdmin && mc ? cName(mc) : '', platform: m.platform, from: m.from_name || '', text: m.comment || '', ago: m.comment_at ? ago(m.comment_at) : '', status: m.status,
          auto: m.status === 'replied' && m.reply_text && m.reply_text !== m.manual_reply_text ? m.reply_text : '', mine: m.manual_reply_text || '', url: safeUrl(m.permalink) || null, can: !!CM_REPLY[m.platform] }; }),
        unread: (S.notifs || []).filter(function (n) { return !n.read; }).length,
        notifs: (S.notifs || []).slice(0, 40).map(function (n) { var cl = n.client_id ? clientById(n.client_id) : null; return { title: pick(n, 'title', 'title_ar') || '', body: pick(n, 'body', 'body_ar') || '', ago: n.created_at ? ago(n.created_at) : '', read: !!n.read, client: cl ? cName(cl) : '' }; }),
        ecard: /zkj system/i.test(c.name || '') ? 'https://system.zkjverse.com/zkj-system/' : null,
        wa: WA, publishing: S.settings && S.settings.publisher_paused !== undefined ? S.settings.publisher_paused !== 'true' : null
      };
      if (S.isAdmin) {
        out.hq = S.clients.filter(function (x) { return x.active !== false; }).map(function (x) {
          var its = (S.all || []).filter(function (y) { return y.client_id === x.id; });
          return { id: x.id, name: cName(x), waiting: its.filter(function (y) { return y.status === 'needs_approval'; }).length,
            changes: its.filter(function (y) { return y.status === 'changes_requested'; }).length, current: x.id === c.id };
        });
        out.waiting_all = out.hq.reduce(function (a, b) { return a + b.waiting; }, 0);
        out.changes_all = out.hq.reduce(function (a, b) { return a + b.changes; }, 0);
      }
      return out;
    });
  }
  function itemById(id) { var all = (S.all || []).concat(S.items || []); for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i]; return null; }
  function circuitReview(id, decision, note) {
    var x = itemById(id); if (!x) return Promise.resolve({ ok: false, error: 'missing' });
    if (!canReview(x)) return Promise.resolve({ ok: false, error: 'not-allowed' });
    var before = x.status;
    return review(x, decision, note).then(function () { return { ok: x.status === decision || x.status !== before }; });
  }
  function circuitReply(commentId, text) {
    return sb.auth.getSession().then(function (r) {
      var tok = r && r.data && r.data.session && r.data.session.access_token;
      return fetch(((window.ZKJ_SB && window.ZKJ_SB.url) || '') + '/functions/v1/inbox-reply', { method: 'POST', headers: { Authorization: 'Bearer ' + (tok || ''), 'Content-Type': 'application/json' }, body: JSON.stringify({ comment_id: commentId, text: text }) })
        .then(function (res) { return res.json().catch(function () { return { ok: false, error: String(res.status) }; }); });
    }).catch(function (e) { return { ok: false, error: e.message }; });
  }
  function closeCircuit() {
    if (!CX.wrap || !CX.on) return;
    CX.on = false; CX.wrap.classList.remove('on');
    setTimeout(function () { if (!CX.on) CX.wrap.hidden = true; }, 420);
  }
  function openCircuit(scene) {
    if (!CX.wrap) {
      CX.wrap = document.createElement('div'); CX.wrap.className = 'front-wrap circuit-wrap'; CX.wrap.id = 'circuit';
      CX.frame = document.createElement('iframe'); CX.frame.title = 'ZKJ SYSTEM'; CX.frame.src = 'circuit.html?v=20261103d#' + scene;
      CX.wrap.appendChild(CX.frame); document.body.appendChild(CX.wrap);
    } else {
      try { CX.frame.contentWindow.ZCIRCUIT && CX.frame.contentWindow.ZCIRCUIT.go(scene); } catch (e) { CX.frame.src = 'circuit.html?v=20261103d#' + scene; }
    }
    CX.wrap.hidden = false; CX.on = true; document.documentElement.classList.add('front-on');
    requestAnimationFrame(function () { CX.wrap.classList.add('on'); });
  }
  function circuitReadAll() { return sb.rpc('mark_notifications_read').then(function (r) { if (r.error) throw r.error; (S.notifs || []).forEach(function (n) { n.read = true; }); renderNotifs(); return { ok: true }; }).catch(function (e) { return { ok: false, error: e && e.message }; }); }
  /* ---------- Circuit HQ (KJ, 3 Nov 2026: "nothing old anywhere"): All clients, To-do, This week, Drawings, Control Center and Core
     now live in circuit.html too. The page reads hqData() and acts through admin(op, payload). Same rules and tables as the classic
     screens: the classic code stays in place (never delete), the circuit simply calls the same steps. */
  function afterAdmin() { return loadHQ().then(function () { try { if (S.mode === 'hq') renderBoard(); } catch (e) { /* the classic board is hidden */ } }); }
  function sendBackItem(x, note) {
    var patch = { status: 'needs_approval', revised_at: new Date().toISOString(), revision_note: note, reviewed_at: null, reviewed_by: null, publish_error: null, publish_attempts: 0 };
    return q(sb.from('items').update(patch).eq('id', x.id).eq('status', 'changes_requested').select()).then(function (rows) {
      if (!rows || !rows.length) throw new Error('no longer waiting');
      var row = rows[0]; for (var k in row) if (Object.prototype.hasOwnProperty.call(row, k)) x[k] = row[k];
      var n = { client_id: x.client_id, audience: 'client', title: 'Edited after your note: ' + x.title, title_ar: 'عُدّل بعد ملاحظتك: ' + (x.title_ar || x.title), body: note, body_ar: note };
      return q(sb.from('notifications').insert(n).select()).catch(function () { return null; });
    });
  }
  function itemFull(x) {
    var o = itemOut(x), c = clientById(x.client_id);
    o.client = c ? cName(c) : ''; o.client_id = x.client_id; o.note = x.client_note || ''; o.revision = x.revision_note || '';
    o.first = x.first_comment || ''; o.ready = x.status === 'draft' ? draftReady(x) : null; o.block = x.status === 'draft' && !draftReady(x) ? t(draftBlock(x)) : '';
    o.ytPublish = !!(S.isAdmin && (x.platform === 'youtube' || x.platform === 'tiktok') && x.publish_state === 'private' && x.external_id);
    o.media = (videoOf(x) || mediaList(x)[0] || '') || null; o.error = x.publish_error || '';
    return o;
  }
  function dwLabel(s) { var k = 'p.dw.s.' + s, v = t(k); return v === k ? s : v; }
  function hqData() {
    if (!S.isAdmin) return null;
    var cc = clientById(S.ccClient) || S.clients[0];
    var clients = S.clients.map(function (c) {
      var st = statsOf(c), nx = st.next, r = brandOf(c), v = D.resolveBrand(r.b, r.fb).vars;
      return { id: c.id, name: cName(c), logo: safeUrl(c.logo_url), plan: planName(c), tag: tagOf(c), internal: !!c.internal, active: c.active !== false,
        handle: c.instagram ? '@' + handle(c) : '', colors: [v['--b-bg'], v['--b-primary'], v['--b-accent']],
        waiting: st.waiting, changes: st.changes, week: st.week, month: st.month,
        next: nx ? { id: nx.id, title: pick(nx, 'title', 'title_ar'), when: fmtWhen(nx.scheduled_at) } : null, cube: cc && c.id === cc.id };
    });
    var todo = todoRows().map(function (r) {
      if (r.type === 'dw-quote' || r.type === 'dw-check') return { type: r.type, job: r.j.id, title: r.j.name + (r.j.company ? ' · ' + r.j.company : ''), sub: (r.j.parent_id ? t('p.dw.addon') + ' · ' : '') + dwWork(r.j), ago: r.when ? ago(r.when) : '' };
      if (r.type === 'activity') return { type: 'activity', title: pick(r.n, 'title', 'title_ar'), sub: pick(r.n, 'body', 'body_ar'), read: !!r.n.read, client: r.c ? cName(r.c) : '', ago: r.when ? ago(r.when) : '' };
      var x = r.x;
      return { type: r.type, id: x.id, title: pick(x, 'title', 'title_ar'), client: r.c ? cName(r.c) : '', ago: r.when ? ago(r.when) : '', note: r.type === 'changes' ? (x.client_note || '') : r.type === 'revised' ? (x.revision_note || '') : '',
        own: r.type === 'revised' ? canReview(x) : false, ready: r.type === 'draft' ? draftReady(x) : null, block: r.type === 'draft' && !draftReady(x) ? t(draftBlock(x)) : '' };
    });
    var n = { quote: 0, check: 0, work: 0, cust: 0, done: 0 };
    (S.dw || []).forEach(function (j) { if (DW_GROUP[j.status]) n[DW_GROUP[j.status]]++; });
    var r0 = cc ? brandOf(cc) : null, bv = r0 ? D.resolveBrand(r0.b, r0.fb).vars : {};
    var key = S.settings.social_connect_key || '', base = ((window.ZKJ_SB && window.ZKJ_SB.url) || '') + '/functions/v1/social-connect';
    return {
      clients: clients, todo: todo, todoOpen: todoCount(), dwCount: n,
      cc: cc ? { id: cc.id, name: cName(cc), covers: coversOf(cc).join(',\n'),
        brand: { bg: bv['--b-bg'], surface: bv['--b-surface'], text: (r0.b.text || bv['--b-text']), primary: bv['--b-primary'], accent: bv['--b-accent'],
          font_display: r0.b.font_display || 'Cinzel', font_body: r0.b.font_body || 'Inter', radius: r0.b.radius != null ? r0.b.radius : 22 },
        social: SOC_NETS.map(function (nt) {
          var a = (S.social || []).filter(function (s2) { return s2.client_id === cc.id && s2.network === nt.id; })[0], st = !a ? 'none' : a.status !== 'ok' ? 'expired' : 'ok';
          return { id: nt.id, name: nt[L()], st: st, label: st === 'ok' ? (a.name || t('p.soc.ok')) : t('p.soc.' + st), href: key ? base + '?client=' + encodeURIComponent(cc.name) + '&network=' + nt.id + '&key=' + encodeURIComponent(key) : '' };
        }) } : null,
      fonts: D.FONT_ALLOW.slice(), kinds: IMPORT_KINDS.map(function (k) { return [k, t('p.type.' + k)]; }),
      platforms: allPlatforms().map(function (p) { return [p.id, p[L()]]; }), statuses: ['needs_approval', 'draft', 'scheduled', 'published'].map(function (s2) { return [s2, t('p.s.' + s2)]; }),
      paused: S.settings.publisher_paused === undefined ? null : S.settings.publisher_paused === 'true', socialKey: !!key
    };
  }
  function dwJobs() {
    return Promise.all([q(sb.from('drawing_jobs').select('*').order('created_at', { ascending: false }).limit(100)), q(sb.from('app_settings').select('key,value').in('key', ['drawings_price_per_sheet'])).catch(function () { return []; })]).then(function (r) {
      var order = ['received', 'check', 'changes', 'confirmed', 'quoted', 'in_work', 'review', 'approved', 'cancelled'];
      var jobs = (r[0] || []).sort(function (a, b) { return order.indexOf(a.status) - order.indexOf(b.status) || (a.created_at < b.created_at ? 1 : -1); });
      S.dw = jobs.filter(function (j) { return j.status !== 'cancelled'; });
      return { price: ((r[1] || [])[0] || {}).value || '', jobs: jobs.map(function (j) {
        var view = location.origin + '/drawings/view.html?job=' + j.id + '&k=' + j.customer_key + '&lang=' + j.lang;
        return { id: j.id, name: j.name, company: j.company || '', status: j.status, label: dwLabel(j.status), rev: j.revision || 1, ago: ago(j.updated_at || j.created_at), created: fmtDate(j.created_at),
          work: dwWork(j), addon: !!j.parent_id, spec: [j.labels, j.units, j.sheet].filter(Boolean).join(' · '), hq: j.hq_note || '', cust: j.customer_note || '', details: j.details || '',
          sheets: j.sheets || '', ppsheet: j.price_per_sheet != null ? j.price_per_sheet : '', cur: j.currency || '',
          view: view, agent: 'https://usucmdjupfjuchfxnxpz.supabase.co/functions/v1/drawings-desk?job=' + j.id + '&agent=' + j.agent_key,
          wa: j.phone ? 'https://wa.me/' + String(j.phone).replace(/[^\d]/g, '') + '?text=' + encodeURIComponent((j.lang === 'ar' ? 'رابط طلب الرسومات: ' : 'Your drawing order: ') + view) : '',
          inputs: (j.inputs || []).map(function (f) { return { name: f.name, path: 'inputs/' + j.id + '/' + f.name }; }),
          outputs: (j.outputs || []).filter(function (o) { return o.rev === j.revision; }).map(function (o) { return { name: o.name, path: o.path }; }) };
      }) };
    });
  }
  function ok(msg) { return { ok: true, msg: msg || '' }; }
  function bad(err) { return { ok: false, error: (err && err.message) || String(err || '?') }; }
  function adminInsert(table, row, okKey) {
    var target = clientById(S.ccClient); if (!S.isAdmin || !target) return Promise.resolve(bad('no brand'));
    row.client_id = target.id; var name = cName(target);
    return q(sb.from(table).insert(row).select()).then(function () { return afterAdmin().then(function () { return ok(t(okKey, { name: name })); }); }).catch(bad);
  }
  function str(v) { v = v == null ? '' : String(v).trim(); return v === '' ? null : v; }
  function circuitAdmin(op, p) {
    p = p || {};
    if (!S.isAdmin) return Promise.resolve(bad('admin only'));
    var x = p.id ? itemById(p.id) : null;
    switch (op) {
      case 'item': return Promise.resolve(x ? itemFull(x) : null);
      case 'target': if (clientById(p.client)) { S.ccClient = p.client; Z.store(CLIENT_KEY, S.ccClient); } return Promise.resolve(ok());
      case 'sendback':
        if (!x || x.status !== 'changes_requested') return Promise.resolve(bad(t('p.appr.stale')));
        if (!str(p.note)) return Promise.resolve(bad(t('p.sb.need')));
        return sendBackItem(x, str(p.note)).then(afterAdmin).then(function () { return ok(t('p.sb.toast', { title: pick(x, 'title', 'title_ar') })); })
          .catch(function (e) { return bad(/no longer waiting/i.test(e && e.message) ? t('p.appr.stale') : e); });
      case 'to-approval':
        if (!x || x.status !== 'draft' || !draftReady(x)) return Promise.resolve(bad(t('p.e.generic')));
        return q(sb.from('items').update({ status: 'needs_approval' }).eq('id', x.id).eq('status', 'draft').select()).then(function (rows) {
          if (!rows || !rows.length) throw new Error('no longer a draft'); x.status = 'needs_approval';
          return afterAdmin().then(function () { return ok(t('p.dr.toast', { title: pick(x, 'title', 'title_ar') })); });
        }).catch(bad);
      case 'yt-publish':
        if (!x) return Promise.resolve(bad('missing'));
        return sb.auth.getSession().then(function (r) {
          var tok = r && r.data && r.data.session && r.data.session.access_token;
          return fetch(((window.ZKJ_SB && window.ZKJ_SB.url) || '') + '/functions/v1/social-publisher?publish=' + encodeURIComponent(x.id), { method: 'POST', headers: { Authorization: 'Bearer ' + (tok || '') } }).then(function (res) { return res.json(); });
        }).then(function (j) {
          if (j && j.ok) { x.publish_state = j.state || 'public'; return ok(t('p.soc.public')); }
          if (j && j.studio) return { ok: false, open: j.studio, error: t(x.platform === 'tiktok' ? 'p.soc.tt.open' : 'p.soc.studio') };
          return bad(t('p.soc.fail', { err: (j && j.error) || '?' }));
        }).catch(bad);
      case 'post':
        if (!str(p.title)) return Promise.resolve(bad(t('p.f.need')));
        return adminInsert('items', { kind: str(p.kind) || 'post', title: str(p.title), title_ar: str(p.title_ar), caption: str(p.caption), caption_ar: str(p.caption_ar), first_comment: str(p.first_comment),
          media_url: str(p.media_url), platform: str(p.platform), scheduled_at: str(p.scheduled_at) ? new Date(p.scheduled_at).toISOString() : null, status: str(p.status) || 'needs_approval' }, 'p.f.ok.item');
      case 'kpi':
        if (!str(p.label) || !str(p.value) || !isFinite(Number(p.value))) return Promise.resolve(bad(t('p.f.need')));
        var label = str(p.label), row = { metric: str(p.metric) || label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 60) || 'metric', value: Number(p.value), label: label, label_ar: str(p.label_ar) };
        if (str(p.period_start)) row.period_start = str(p.period_start);
        return adminInsert('kpis', row, 'p.f.ok.kpi');
      case 'notif':
        if (!str(p.title)) return Promise.resolve(bad(t('p.f.need')));
        return adminInsert('notifications', { audience: 'client', title: str(p.title), title_ar: str(p.title_ar), body: str(p.body), body_ar: str(p.body_ar) }, 'p.f.ok.notif');
      case 'import-check':
        var res = parseImport(p.text), tg = clientById(S.ccClient);
        return Promise.resolve({ fatal: res.fatal, n: res.rows.length, errors: res.errors.length, ready: !res.fatal && res.rows.length && !res.errors.length ? t('p.imp.ready', { n: res.rows.length, name: tg ? cName(tg) : '' }) : (res.rows.length ? t('p.imp.fix') : t('p.imp.none')),
          rows: res.rows.map(function (r) { return { n: r.n, ok: r.ok, title: r.row.title || '—', meta: (IMPORT_KINDS.indexOf(r.row.kind) > -1 ? t('p.type.' + r.row.kind) : r.row.kind) + ' · ' + (r.row.platform ? plat(r.row.platform)[L()] : '—'), when: r.ok ? (r.when ? fmtWhen(r.when) : t('p.appr.nowhen')) : r.errs.join(' ') }; }) });
      case 'import':
        var rs = parseImport(p.text), target = clientById(S.ccClient);
        if (rs.fatal || !rs.rows.length || rs.errors.length || !target) return Promise.resolve(bad(rs.fatal || t('p.imp.fix')));
        var rows = rs.rows.map(function (r) { r.row.client_id = target.id; return r.row; });
        return q(sb.from('items').insert(rows).select()).then(afterAdmin).then(function () { return ok(t('p.imp.done', { n: rows.length, name: cName(target) })); }).catch(bad);
      case 'brand':
        var tb = clientById(S.ccClient); if (!tb) return Promise.resolve(bad('no brand'));
        var br = {}; brandFields().forEach(function (k) { br[k] = p[k]; }); br.radius = Math.max(0, Math.min(32, parseInt(br.radius, 10) || 0));
        ['bg', 'surface', 'text', 'primary', 'accent'].forEach(function (k) { br[k] = String(br[k] || '').toUpperCase(); if (!/^#[0-9A-F]{6}$/.test(br[k])) delete br[k]; });
        if (D.FONT_ALLOW.indexOf(br.font_display) < 0 || D.FONT_ALLOW.indexOf(br.font_body) < 0) return Promise.resolve(bad(t('p.f.need')));
        return q(sb.from('clients').update({ brand: br }).eq('id', tb.id).select()).then(function () { brandFor = null; return afterAdmin(); }).then(function () { return ok(t('p.br.saved', { name: cName(tb) })); }).catch(bad);
      case 'covers':
        var tc = clientById(S.ccClient); if (!tc) return Promise.resolve(bad('no brand'));
        var raw = String(p.text || '').split(/[\s,]+/).map(function (u) { return u.trim(); }).filter(Boolean), urls = raw.map(safeUrl).filter(Boolean);
        if (urls.length !== raw.length) return Promise.resolve(bad(t('p.cov.bad')));
        return q(sb.from('clients').update({ cover_urls: urls.length ? urls : null }).eq('id', tc.id).select()).then(afterAdmin).then(function () { return ok(t('p.cov.ok', { n: urls.length, name: cName(tc) })); }).catch(bad);
      case 'pub':
        if (S.settings.publisher_paused === undefined) return Promise.resolve(bad(t('p.pub.unknown')));
        var next = S.settings.publisher_paused === 'true' ? 'false' : 'true';
        return q(sb.from('app_settings').update({ value: next, updated_at: new Date().toISOString() }).eq('key', 'publisher_paused').select()).then(function (rows) {
          if (!rows || !rows.length) throw new Error('not saved'); S.settings.publisher_paused = rows[0].value; try { renderPub(); } catch (e) { /* classic only */ }
          return ok(t('p.pub.saved') + ' ' + t(rows[0].value === 'true' ? 'p.pub.off' : 'p.pub.on'));
        }).catch(bad);
      case 'dw-list': return dwJobs().catch(function (e) { return { error: e.message, jobs: [] }; });
      case 'dw-sign': return sb.storage.from('drawings').createSignedUrl(p.path, 3600).then(function (r) { return r.data ? r.data.signedUrl : null; });
      case 'dw':
        var now = new Date().toISOString(), patch = null;
        if (p.a === 'quote') {
          var sh = parseInt(p.sheets, 10), pr = parseFloat(p.price);
          if (!(sh > 0) || !(pr >= 0)) return Promise.resolve(bad(L() === 'ar' ? 'أدخل عدد اللوحات وسعر اللوحة.' : 'Enter the number of sheets and the price per sheet.'));
          patch = { sheets: sh, price_per_sheet: pr, status: 'quoted', quoted_at: now };
          sb.from('app_settings').update({ value: String(pr) }).eq('key', 'drawings_price_per_sheet').then(function () { /* default for the next quote */ });
        } else if (p.a === 'release') patch = { status: 'review' };
        else if (p.a === 'back') { if (!str(p.note)) return Promise.resolve(bad(L() === 'ar' ? 'اكتب ما يجب أن يصلحه الوكيل.' : 'Write what the agent should fix.')); patch = { status: 'changes', hq_note: str(p.note) }; }
        else if (p.a === 'cancel') patch = { status: 'cancelled' };
        if (!patch || !p.id) return Promise.resolve(bad('?'));
        patch.updated_at = now;
        return q(sb.from('drawing_jobs').update(patch).eq('id', p.id).select()).then(function () { return ok(); }).catch(bad);
    }
    return Promise.resolve(bad('unknown ' + op));
  }
  var CORE2 = { ctl: null };
  // Core inside the circuit page: KJ sees the universe of every brand, a client sees their own
  function circuitCore(host, o) {
    if (!host || !window.ZCORE) return false; o = o || {};
    if (CORE2.ctl) { try { CORE2.ctl.destroy(); } catch (e) { /* ignore */ } }
    var uni = !!S.isAdmin, c = S.client;
    if (!uni && !c) return false;
    CORE2.ctl = window.ZCORE.create(host, { mode: uni ? 'universe' : 'client', platformName: function (id) { return plat(id)[L()]; }, onItem: o.onItem || function () {}, onOpenClient: o.onOpenClient || function () {} });
    CORE2.ctl.update(uni ? coreUniverseData() : coreClientData(c, S.items, S.kpis)); CORE2.ctl.mount();
    return true;
  }
  function circuitCoreOff() { if (CORE2.ctl) { try { CORE2.ctl.destroy(); } catch (e) { /* ignore */ } CORE2.ctl = null; } }
  function circuitItem(id) { var x = itemById(id); return Promise.resolve(x ? itemFull(x) : null); }
  window.ZFRONT_HOST = { model: frontModel, act: frontAct, data: circuitData, review: circuitReview, reply: circuitReply, readAll: circuitReadAll, hq: hqData, admin: circuitAdmin, item: circuitItem, core: circuitCore, coreOff: circuitCoreOff };
  // Esc steps back inside the new world (circuit → cube); it never drops to the old screens
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && CX.on) frontAct('home'); });

  /* ---------- Set password (invite / recovery links) ---------- */
  function showPassword() {
    booted();
    $('dash').setAttribute('data-state', 'password');
    show($('state'), false); show($('board'), false); show($('pw-panel'), true);
    chrome(false);
    $('pw-sub').textContent = t('p.pw.sub', { email: (S.user && S.user.email) || '' });
    $('pw-new').focus();
  }
  $('pw-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var a = $('pw-new').value, b = $('pw-confirm').value, st = $('pw-status');
    function msg(kind, key) { st.className = 'form-status show ' + kind; st.textContent = t(key); }
    if (a.length < 8) { msg('error', 'p.pw.short'); $('pw-new').focus(); return; }
    if (a !== b) { msg('error', 'p.pw.match'); $('pw-confirm').focus(); return; }
    var btn = $('pw-submit'); btn.disabled = true;
    sb.auth.updateUser({ password: a }).then(function (r) {
      if (r.error) throw r.error;
      SB.linkType = null;
      Z.toast(t('p.pw.ok'), 'ok');
      return loadProfile();
    }).catch(function (err) {
      st.className = 'form-status show error';
      st.textContent = (err && err.message) ? err.message : t('p.e.generic');
    }).then(function () { btn.disabled = false; });
  });
  if (sb) sb.auth.onAuthStateChange(function (ev) {
    if (ev === 'PASSWORD_RECOVERY') { SB.linkType = 'recovery'; setTimeout(showPassword, 0); }
    if (ev === 'SIGNED_OUT') toLogin();
  });

  var leaving = false;
  function toLogin() {
    if (leaving) return; leaving = true;
    try { localStorage.removeItem('sb-' + String(SB.url || '').replace(/^https?:\/\//, '').split('.')[0] + '-auth-token'); } catch (e) { /* ignore */ }
    window.location.replace('login.html?out=1');
  }

  /* ---------- Sheet (modal) ---------- */
  var modal = $('modal');
  var modalOpen = false;
  function openModal(o) {
    modalOpen = true;
    $('modal-title').textContent = o.title;
    $('modal-body').innerHTML = o.body;
    $('modal-actions').innerHTML = (o.actions || []).map(function (a) {
      if (a.href) return '<a class="btn ' + (a.cls || 'btn-ghost') + ' btn-sm" href="' + esc(a.href) + '" target="_blank" rel="noopener">' + esc(a.label) + '</a>';
      return '<button class="btn ' + (a.cls || 'btn-ghost') + ' btn-sm" type="button" data-action="' + a.action + '"' + (a.id ? ' data-id="' + esc(a.id) + '"' : '') + '>' + esc(a.label) + '</button>';
    }).join('');
    if (!modal.open) { if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', ''); }
    var first = modal.querySelector('textarea, .modal-actions .btn');
    if (first) first.focus();
  }
  function closeModal() { modalOpen = false; if (modal.open) { if (typeof modal.close === 'function') modal.close(); else modal.removeAttribute('open'); } }
  modal.addEventListener('close', function () {
    modalOpen = false;
    // a card swiped away for "changes" comes back if the sheet was dismissed without sending
    if (!S.keepFlown && document.querySelector('#appr-list .is-flown-left')) renderApprovals();
  });
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

  function itemDetail(x) {
    var m = videoOf(x) || mediaList(x)[0] || '';
    var acts = [];
    if (x.status === 'needs_approval' && canReview(x)) {
      acts.push({ action: 'approve', id: x.id, label: t(S.isAdmin ? 'p.appr.owner' : 'p.appr.approve'), cls: 'btn-primary' });
      acts.push({ action: 'changes', id: x.id, label: t('p.appr.changes') });
    }
    if (S.isAdmin && x.status === 'changes_requested') acts.push({ action: 'sendback', id: x.id, label: t('p.sb.btn'), cls: 'btn-primary' });
    if (S.isAdmin && x.status === 'draft' && draftReady(x)) acts.push({ action: 'to-approval', id: x.id, label: t('p.dr.btn'), cls: 'btn-primary' });
    // YouTube before Google's audit: uploaded private, KJ makes it public with one tap
    if (S.isAdmin && (x.platform === 'youtube' || x.platform === 'tiktok') && x.publish_state === 'private' && x.external_id) acts.push({ action: 'yt-publish', id: x.id, label: t(x.platform === 'tiktok' ? 'p.soc.publish.tt' : 'p.soc.publish'), cls: 'btn-primary' });
    if (x.published_url && safeUrl(x.published_url)) acts.push({ href: safeUrl(x.published_url), label: t('p.item.openpost'), cls: x.publish_state === 'private' ? 'btn-ghost' : 'btn-primary' });
    if (m) acts.push({ href: m, label: t('p.item.media') });
    acts.push({ action: 'modal-close', label: t('p.close') });
    var dot = STATUS_DOT[x.status] || 'off';
    openModal({
      title: pick(x, 'title', 'title_ar'),
      body: '<div class="modal-preview">' + phoneOf(x, '-m') + '</div>' +
        '<dl class="kv"><dt>' + esc(t('p.item.platform')) + '</dt><dd>' + esc(x.platform ? plat(x.platform)[L()] : '—') + '</dd>' +
        '<dt>' + esc(t('p.item.type')) + '</dt><dd>' + esc(t('p.type.' + x.kind)) + '</dd>' +
        '<dt>' + esc(t('p.item.when')) + '</dt><dd>' + esc(fmtWhen(x.scheduled_at)) + '</dd>' +
        (S.isAdmin ? '<dt>' + esc(t('p.item.client')) + '</dt><dd>' + esc(cName(clientOf(x))) + '</dd>' : '') +
        '<dt>' + esc(t('p.item.status')) + '</dt><dd><span class="status-' + dot + '" style="font-weight:700">' + esc(x.status === 'needs_approval' && !canReview(x) ? t('p.wait.client') : statusLabel(x.status)) + '</span></dd>' +
        (x.client_note ? '<dt>' + esc(t(S.isAdmin ? 'p.item.theirnote' : 'p.item.note')) + '</dt><dd>' + esc(x.client_note) + '</dd>' : '') +
        (S.isAdmin && x.status === 'draft' && !draftReady(x) ? '<dt>' + esc(t('p.item.status')) + '</dt><dd class="status-warn">' + esc(t(draftBlock(x))) + '</dd>' : '') +
        (x.revised_at ? '<dt>' + esc(t('p.item.revised')) + '</dt><dd><span class="mono">' + esc(fmtWhen(x.revised_at)) + '</span>' + (x.revision_note ? ' — ' + esc(x.revision_note) : '') + '</dd>' : '') +
        (x.published_at ? '<dt>' + esc(t('p.item.published')) + '</dt><dd class="mono">' + esc(fmtWhen(x.published_at)) + '</dd>' : '') +
        (x.first_comment ? '<dt>' + esc(t('p.item.fc')) + '</dt><dd class="rc-fc">' + esc(x.first_comment) + (x.first_comment_at ? ' <span class="status-ok">· ' + esc(t('p.item.fcposted')) + '</span>' : '') + '</dd>' : '') +
        (S.isAdmin && x.first_comment_error ? '<dt>' + esc(t('p.item.fcerr')) + '</dt><dd class="status-bad">' + esc(x.first_comment_error) + '</dd>' : '') +
        (x.publish_state === 'private' ? '<dt>' + esc(t('p.item.status')) + '</dt><dd class="status-warn">' + esc(t(x.platform === 'tiktok' ? 'p.soc.tt.private' : 'p.soc.yt.private')) + '</dd>' : '') +
        (x.publish_error && x.status !== 'published' ? '<dt>' + esc(t('p.item.puberr')) + '</dt><dd class="status-bad">' + esc(x.publish_error) + '</dd>' : '') + '</dl>',
      actions: acts
    });
  }

  /* ---------- Review (RPC) ---------- */
  function review(x, decision, note, minWait) {
    if (S.busy[x.id]) return Promise.resolve();
    S.busy[x.id] = true;
    document.querySelectorAll('[data-id="' + x.id + '"] button, button[data-id="' + x.id + '"]').forEach(function (b) { if (/approve|changes/.test(b.getAttribute('data-action') || '')) b.disabled = true; });
    var rpc = sb.rpc('review_item', { p_item: x.id, p_decision: decision, p_note: note || null });
    return Promise.all([rpc, minWait || Promise.resolve()]).then(function (res) {
      var r = res[0];
      if (r.error) throw r.error;
      var row = Array.isArray(r.data) ? r.data[0] : r.data;
      if (row && row.id) { for (var k in row) if (Object.prototype.hasOwnProperty.call(row, k)) x[k] = row[k]; }
      else { x.status = decision; x.client_note = note || null; x.reviewed_at = new Date().toISOString(); }
      var tk = decision === 'approved' ? (S.isAdmin ? 'p.appr.toast.owner' : 'p.appr.toast.ok') : (S.isAdmin ? 'p.appr.toast.ownerch' : 'p.appr.toast.changes');
      Z.toast(t(tk, { title: pick(x, 'title', 'title_ar') }), decision === 'approved' ? 'ok' : 'warn');
      if (S.isAdmin) return loadNotifs();
    }).catch(function (err) {
      if (err && /no longer waiting/i.test(err.message || '')) {
        Z.toast(t('p.appr.stale'), 'warn');
        return S.client ? loadClientData() : loadHQ();
      }
      Z.toast(t('p.appr.fail'), 'bad');
      if (window.console) console.warn('[portal] review failed', err && err.message);
    }).then(function () {
      delete S.busy[x.id];
      renderBoard();
    });
  }
  function approveItem(x, flown) {
    var card = $('appr-' + x.id);
    var isPhone = card && card.classList.contains('phone-card');
    if (isPhone && !flown) card.classList.add('is-approving');
    return review(x, 'approved', null, D.wait(isPhone ? (flown ? 420 : 1250) : 0));
  }
  function openChanges(x) {
    openModal({
      title: t('p.ch.title'),
      body: '<label for="ch-note"><strong>' + esc(t('p.ch.label', { title: pick(x, 'title', 'title_ar') })) + '</strong></label>' +
        '<textarea id="ch-note" maxlength="2000" placeholder="' + esc(t('p.ch.ph')) + '"></textarea>' +
        '<div class="toolbar"><span style="font-size:13px;color:var(--muted)">' + esc(t('p.ch.quick')) + '</span>' +
        ['p.ch.q1', 'p.ch.q2', 'p.ch.q3'].map(function (k) { return '<button class="chip" type="button" data-action="quick-pick" data-text="' + esc(t(k)) + '">' + esc(t(k)) + '</button>'; }).join('') +
        '</div><p class="err" id="ch-err" role="alert" style="color:#FF9A8F;font-size:13px;margin:0"></p>',
      actions: [
        { action: 'changes-send', id: x.id, label: t('p.ch.send'), cls: 'btn-primary' },
        { action: 'modal-close', label: t('p.close') }
      ]
    });
  }
  // Owner: after editing an item the client sent back, return it to the queue with one line on what changed.
  function openSendBack(x) {
    openModal({
      title: t('p.sb.title'),
      body: '<label for="rv-note"><strong>' + esc(t('p.sb.label', { title: pick(x, 'title', 'title_ar') })) + '</strong></label>' +
        (x.client_note ? '<p class="td-note" style="margin:6px 0 0">“' + esc(x.client_note) + '”</p>' : '') +
        '<textarea id="rv-note" maxlength="500" placeholder="' + esc(t('p.sb.ph')) + '"></textarea>' +
        '<p class="err" id="rv-err" role="alert" style="color:#FF9A8F;font-size:13px;margin:0"></p>',
      actions: [
        { action: 'sendback-send', id: x.id, label: t('p.sb.send'), cls: 'btn-primary' },
        { action: 'modal-close', label: t('p.close') }
      ]
    });
  }
  // First-use coach: how to see slides vs how to decide. Shown once per device, or on demand (?).
  var COACH_KEY = 'zkj-appr-coach', coachTimer = null;
  function showCoach(force) {
    var el = $('appr-coach'); if (!el || !force) return;
    var seen = false; try { seen = localStorage.getItem(COACH_KEY) === '1'; } catch (e) { /* ignore */ }
    if (force === true && seen) return;
    if (force === 'again') seen = false;
    if (seen || D.current() !== 'approvals') return;
    el.hidden = false; var bar = el.querySelector('.bar i'); if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    clearTimeout(coachTimer); coachTimer = setTimeout(function () { hideCoach(true); }, 9000);
  }
  // remember "seen" only once the card was really shown (or closed by hand), never just because another view opened first
  function hideCoach(remember) {
    var el = $('appr-coach'), wasShown = !!(el && !el.hidden);
    if (el) el.hidden = true; clearTimeout(coachTimer);
    if (remember || wasShown) { try { localStorage.setItem(COACH_KEY, '1'); } catch (e) { /* ignore */ } }
  }
  D.onView(function (id) { if (id === 'approvals') setTimeout(function () { showCoach(pending().length > 0); }, 400); else hideCoach(false); });

  D.swipe($('appr-list'), {
    approve: function (id) { var x = item(id); if (x && x.status === 'needs_approval') approveItem(x, true); else renderApprovals(); },
    changes: function (id) { var x = item(id); if (x && x.status === 'needs_approval') openChanges(x); else renderApprovals(); }
  });

  /* ---------- Actions ---------- */
  function closeNotif() { $('notif-panel').hidden = true; $('bell').setAttribute('aria-expanded', 'false'); }

  var actions = {
    retry: function () { setState('p.loading', null); loadProfile(); },
    signout: function () { sb.auth.signOut().then(toLogin, toLogin); },
    front: function () { openFront(); },
    go: function (el) { D.show(el.getAttribute('data-target'), { focus: true }); },
    'notif-toggle': function (el, e) {
      var panel = $('notif-panel'), open = panel.hidden;
      panel.hidden = !open;
      $('bell').setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { var f = panel.querySelector('button'); if (f) f.focus(); }
      if (e) e.stopPropagation();
    },
    'notif-read-all': function () {
      sb.rpc('mark_notifications_read').then(function (r) {
        if (r.error) throw r.error;
        S.notifs.forEach(function (n) { n.read = true; });
        renderNotifs();
        Z.toast(t('p.notif.done'), 'ok');
      }).catch(function () { Z.toast(t('p.e.generic'), 'bad'); });
    },
    'modal-close': function () { closeModal(); },
    'coach-close': function () { hideCoach(true); },
    'coach-show': function () { showCoach('again'); },
    'cal-prev': function () { S.week -= 1; renderCalendar(); },
    'cal-next': function () { S.week += 1; renderCalendar(); },
    filter: function (el) {
      S.filter = el.getAttribute('data-platform');
      renderFilters(); renderCalendar();
      var b = document.querySelector('#cal-filters [data-platform="' + S.filter + '"]'); if (b) b.focus();
    },
    'cal-item': function (el) { var x = item(el.getAttribute('data-id')); if (x) itemDetail(x); },
    preview: function (el) { var x = item(el.getAttribute('data-id')); if (x) itemDetail(x); },
    approve: function (el) {
      var x = item(el.getAttribute('data-id'));
      closeModal();
      if (x && x.status === 'needs_approval') approveItem(x, false);
    },
    changes: function (el) {
      var x = item(el.getAttribute('data-id'));
      if (x) openChanges(x);
    },
    'quick-pick': function (el) {
      var ta = $('ch-note'); if (!ta) return;
      var txt = el.getAttribute('data-text');
      ta.value = ta.value ? ta.value.replace(/\s*$/, '') + ' · ' + txt : txt;
      el.setAttribute('aria-pressed', 'true');
      ta.focus();
    },
    'changes-send': function (el) {
      var x = item(el.getAttribute('data-id')), ta = $('ch-note');
      if (!x || !ta) return;
      var note = ta.value.trim();
      if (!note) { $('ch-err').textContent = t('p.ch.need'); ta.focus(); return; }
      S.keepFlown = true;
      closeModal();
      S.keepFlown = false;
      if (x.status === 'needs_approval') {
        var card = $('appr-' + x.id), isPhone = card && card.classList.contains('phone-card');
        if (isPhone && !card.classList.contains('is-flown-left')) card.classList.add('swipe-left');
        review(x, 'changes_requested', note, D.wait(isPhone ? 650 : 0));
      }
    },
    sendback: function (el) {
      var x = item(el.getAttribute('data-id'));
      if (!x || !S.isAdmin || x.status !== 'changes_requested') return;
      closeModal(); openSendBack(x);
    },
    'to-approval': function (el) {
      var x = item(el.getAttribute('data-id'));
      if (!x || !S.isAdmin || x.status !== 'draft' || !draftReady(x)) return;
      el.disabled = true;
      q(sb.from('items').update({ status: 'needs_approval' }).eq('id', x.id).eq('status', 'draft').select()).then(function (rows) {
        if (!rows || !rows.length) throw new Error('no longer a draft');
        x.status = 'needs_approval';
        closeModal();
        Z.toast(t('p.dr.toast', { title: pick(x, 'title', 'title_ar') }), 'ok');
        return (S.client ? loadClientData() : loadHQ()).then(renderBoard);
      }).catch(function (err) {
        el.disabled = false;
        Z.toast(t('p.e.generic'), 'bad');
        if (window.console) console.warn('[portal] to approval failed', err && err.message);
      });
    },
    'sendback-send': function (el) {
      var x = item(el.getAttribute('data-id')), ta = $('rv-note');
      if (!x || !ta || !S.isAdmin) return;
      var note = ta.value.trim();
      if (!note) { $('rv-err').textContent = t('p.sb.need'); ta.focus(); return; }
      el.disabled = true;
      var patch = { status: 'needs_approval', revised_at: new Date().toISOString(), revision_note: note, reviewed_at: null, reviewed_by: null, publish_error: null, publish_attempts: 0 };
      q(sb.from('items').update(patch).eq('id', x.id).eq('status', 'changes_requested').select()).then(function (rows) {
        if (!rows || !rows.length) throw new Error('no longer waiting');
        var row = rows[0]; for (var k in row) if (Object.prototype.hasOwnProperty.call(row, k)) x[k] = row[k];
        // the client sees it in the bell as well as on the card
        var n = { client_id: x.client_id, audience: 'client', title: 'Edited after your note: ' + x.title, title_ar: 'عُدّل بعد ملاحظتك: ' + (x.title_ar || x.title), body: note, body_ar: note };
        return q(sb.from('notifications').insert(n).select()).catch(function () { return null; });
      }).then(function () {
        closeModal();
        Z.toast(t('p.sb.toast', { title: pick(x, 'title', 'title_ar') }), 'ok');
        return (S.client ? loadClientData() : loadHQ()).then(renderBoard);
      }).catch(function (err) {
        el.disabled = false;
        var e2 = $('rv-err'); if (e2) e2.textContent = /no longer waiting/i.test((err && err.message) || '') ? t('p.appr.stale') : t('p.e.generic');
        if (window.console) console.warn('[portal] send back failed', err && err.message);
      });
    },
    'dw-open': function (el) { closeModal(); openDrawing(el.getAttribute('data-id')); },
    'open-ws': function (el) { closeModal(); openWorkspace(el.getAttribute('data-id')).catch(loadError); },
    'back-hq': function () { backToHQ('hq'); },
    'save-brand': function (el) {
      var target = clientById(brandFor); if (!S.isAdmin || !target || !brandDraft) return;
      var row = {}; brandFields().forEach(function (k) { row[k] = brandDraft[k]; });
      row.radius = Number(row.radius) || 0;
      ['bg', 'surface', 'text', 'primary', 'accent'].forEach(function (k) { row[k] = String(row[k] || '').toUpperCase(); if (!/^#[0-9A-F]{6}$/.test(row[k])) delete row[k]; });
      if (D.FONT_ALLOW.indexOf(row.font_display) < 0 || D.FONT_ALLOW.indexOf(row.font_body) < 0) return;
      var st = $('cc-brand-status'); el.disabled = true;
      q(sb.from('clients').update({ brand: row }).eq('id', target.id).select()).then(function () {
        st.className = 'form-status show ok'; st.textContent = t('p.br.saved', { name: cName(target) });
        brandFor = null;
        return loadHQ().then(function () { renderBoard(); });
      }).catch(function (err) { st.className = 'form-status show error'; st.textContent = t('p.f.fail', { msg: (err && err.message) || '?' }); })
        .then(function () { el.disabled = false; });
    },
    'set-mood': function (el) { D.setMood(el.getAttribute('data-mood')); renderMood(); },
    'yt-publish': function (el) {
      var id = el.getAttribute('data-id'); if (!id || !S.isAdmin) return;
      var isTT = (S.all || []).concat(S.items || []).some(function (x) { return x.id === id && x.platform === 'tiktok'; });
      el.disabled = true; el.textContent = t('p.soc.publishing');
      var reset = function () { el.disabled = false; el.textContent = t(isTT ? 'p.soc.publish.tt' : 'p.soc.publish'); };
      sb.auth.getSession().then(function (r) {
        var tok = r && r.data && r.data.session && r.data.session.access_token;
        return fetch(((window.ZKJ_SB && window.ZKJ_SB.url) || '') + '/functions/v1/social-publisher?publish=' + encodeURIComponent(id), { method: 'POST', headers: { Authorization: 'Bearer ' + (tok || '') } }).then(function (res) { return res.json(); });
      }).then(function (j) {
        if (j && j.ok) {
          (S.all || []).concat(S.items || []).forEach(function (x) { if (x.id === id) x.publish_state = j.state || 'public'; });
          Z.toast(t('p.soc.public'), 'ok'); closeModal(); if (S.isAdmin) renderHQ();
          return;
        }
        if (j && j.studio) { Z.toast(t(isTT ? 'p.soc.tt.open' : 'p.soc.studio'), 'warn'); window.open(j.studio, '_blank', 'noopener'); }
        else Z.toast(t('p.soc.fail', { err: (j && j.error) || '?' }), 'warn');
        reset();
      }).catch(function (e) { Z.toast(t('p.soc.fail', { err: e.message })); reset(); });
    },
    'pub-toggle': function (el) {
      if (!S.isAdmin || S.settings.publisher_paused === undefined) return;
      var next = S.settings.publisher_paused === 'true' ? 'false' : 'true'; el.disabled = true;
      q(sb.from('app_settings').update({ value: next, updated_at: new Date().toISOString() }).eq('key', 'publisher_paused').select()).then(function (rows) {
        if (!rows || !rows.length) throw new Error('not saved');
        S.settings.publisher_paused = rows[0].value; renderPub(); Z.toast(t('p.pub.saved') + ' ' + t(rows[0].value === 'true' ? 'p.pub.off' : 'p.pub.on'), rows[0].value === 'true' ? 'warn' : 'ok');
      }).catch(function (err) { Z.toast(t('p.f.fail', { msg: (err && err.message) || '?' }), 'bad'); el.disabled = false; });
    },
    'save-covers': function (el) {
      var target = clientById(S.ccClient); if (!S.isAdmin || !target) return;
      var raw = $('cc-covers-input').value.split(/[\s,]+/).map(function (u) { return u.trim(); }).filter(Boolean);
      var urls = raw.map(safeUrl).filter(Boolean), st = $('cc-covers-status');
      if (urls.length !== raw.length) { st.className = 'form-status show error'; st.textContent = t('p.cov.bad'); return; }
      el.disabled = true;
      q(sb.from('clients').update({ cover_urls: urls.length ? urls : null }).eq('id', target.id).select()).then(function () {
        st.className = 'form-status show ok'; st.textContent = t('p.cov.ok', { n: urls.length, name: cName(target) });
        return loadHQ().then(function () { renderBoard(); });
      }).catch(function (err) { st.className = 'form-status show error'; st.textContent = t('p.f.fail', { msg: (err && err.message) || '?' }); })
        .then(function () { el.disabled = false; });
    },
    'cc-target': function (el) {
      $('cc-brand-status').textContent = ''; $('cc-brand-status').className = 'form-status'; S.ccClient = el.getAttribute('data-id'); Z.store(CLIENT_KEY, S.ccClient); renderAdmin(); var b = document.querySelector('#client-switch [data-id="' + S.ccClient + '"]'); if (b) b.focus(); },
    'hq-prev': function () { S.hqWeek -= 1; renderHQWeek(); },
    'hq-next': function () { S.hqWeek += 1; renderHQWeek(); },
    'cc-open': function (el) { openSheet(el.getAttribute('data-form')); },
    'cc-close': function () { closeSheet(); }
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (el && actions[el.getAttribute('data-action')]) {
      e.preventDefault();
      if (el.disabled) return;
      actions[el.getAttribute('data-action')](el, e);
      return;
    }
    if (!e.target.closest('.notif')) closeNotif();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('notif-panel').hidden) { closeNotif(); $('bell').focus(); }
  });
  // phone: while typing, the on-screen keyboard leaves a short screen; the tab bar and dock would cover the field
  (function () {
    var typing = function (el) { return el && el.matches && el.matches('textarea, input:not([type=checkbox]):not([type=radio]):not([type=button]), select'); };
    document.addEventListener('focusin', function (e) { if (typing(e.target)) { document.body.classList.add('kb-open'); setTimeout(function () { try { e.target.scrollIntoView({ block: 'center' }); } catch (er) { /* old browser */ } }, 250); } });
    document.addEventListener('focusout', function (e) { if (typing(e.target)) setTimeout(function () { if (!typing(document.activeElement)) document.body.classList.remove('kb-open'); }, 100); });
  })();
  D.onView(function (id) {
    closeNotif();
    if (S.mode === 'ws' && HQ_VIEWS.indexOf(id) > -1) { backToHQ(id); return; }
    if (id === 'week') setTimeout(function () { D.revealNow($('hq-cal')); }, 0);
    if (id === 'drawings' && S.isAdmin) { var had = !!S.dwHQ; ensureDrawings(); if (had) S.dwHQ.reload(); }
    renderCore();
    if (id === 'approvals' && rowUpd) setTimeout(rowUpd, 0);
    if (id === 'calendar') setTimeout(function () { D.revealNow($('cal')); }, 0);
    if (id === 'today') D.animateIn($('kpi-row'));
  });

  // Carousel preview: update the 1/N badge while swiping the strip.
  document.addEventListener('scroll', function (e) {
    var st = e.target; if (!st || !st.classList || !st.classList.contains('ig-strip')) return;
    var n = +st.getAttribute('data-n') || 1, i = Math.min(n, Math.round(Math.abs(st.scrollLeft) / Math.max(1, st.clientWidth)) + 1);
    var badge = st.parentNode && st.parentNode.querySelector('.ig-count'); if (badge) badge.textContent = i + '/' + n;
    var screen = st.closest('.screen'), dots = screen && screen.querySelector('.ig-dots');
    if (dots) { dots.classList.add('live'); Array.prototype.forEach.call(dots.children, function (d, k) { d.classList.toggle('on', k === i - 1); }); }
  }, true);

  /* ---------- Admin forms ---------- */
  function formStatus(form, kind, text) {
    var st = form.querySelector('.form-status');
    st.className = 'form-status' + (text ? ' show ' + kind : '');
    st.textContent = text || '';
  }
  function adminSubmit(formId, build, table, okKey) {
    var form = $(formId);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var target = clientById(S.ccClient);
      if (!S.isAdmin || !target) return;
      var bad = null;
      form.querySelectorAll('[required]').forEach(function (inp) {
        var ok = !!inp.value.trim();
        inp.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok && !bad) bad = inp;
      });
      if (bad) { formStatus(form, 'error', t('p.f.need')); bad.focus(); return; }
      var row = build(form);
      row.client_id = target.id;
      var btn = form.querySelector('[type="submit"]'), label = btn.textContent;
      btn.disabled = true; btn.textContent = t('p.f.saving');
      var name = cName(target);
      q(sb.from(table).insert(row).select()).then(function () {
        form.reset(); renderAdmin();
        formStatus(form, 'ok', t(okKey, { name: name }));
        Z.toast(t(okKey, { name: name }), 'ok');
        return loadHQ().then(function () { renderBoard(); });
      }).catch(function (err) {
        formStatus(form, 'error', t('p.f.fail', { msg: (err && err.message) || '?' }));
      }).then(function () { btn.disabled = false; btn.textContent = label; });
    });
  }
  function val(form, name) { var v = form.elements[name].value.trim(); return v === '' ? null : v; }
  adminSubmit('f-item', function (f) {
    var when = val(f, 'scheduled_at');
    return {
      kind: val(f, 'kind') || 'post', title: val(f, 'title'), title_ar: val(f, 'title_ar'),
      caption: val(f, 'caption'), caption_ar: val(f, 'caption_ar'), first_comment: val(f, 'first_comment'), media_url: val(f, 'media_url'),
      platform: val(f, 'platform'), scheduled_at: when ? new Date(when).toISOString() : null,
      status: val(f, 'status') || 'needs_approval'
    };
  }, 'items', 'p.f.ok.item');
  adminSubmit('f-kpi', function (f) {
    var label = val(f, 'label');
    var metric = val(f, 'metric') || (label || 'metric').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 60) || 'metric';
    var row = { metric: metric, value: Number(val(f, 'value')), label: label, label_ar: val(f, 'label_ar') };
    var p = val(f, 'period_start'); if (p) row.period_start = p;
    return row;
  }, 'kpis', 'p.f.ok.kpi');
  adminSubmit('f-notif', function (f) {
    return { audience: 'client', title: val(f, 'title'), title_ar: val(f, 'title_ar'), body: val(f, 'body'), body_ar: val(f, 'body_ar') };
  }, 'notifications', 'p.f.ok.notif');

  /* ---------- Import from AI (admin) ----------
     KJ pastes the block that the Content Studio tool wrote: a JSON list of items.
     Each item: { kind, title, title_ar, caption, caption_ar, media_url, platform, when }.
     Everything lands as needs_approval for the chosen client. No keys, nothing is published. */
  var IMPORT_MAX = 60, IMPORT_KINDS = ['post', 'reel', 'story', 'carousel', 'reply', 'ad'];
  function parseImportDate(v) {
    if (v == null || v === '') return null;
    var s = String(v).trim().replace(/\//g, '-');
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?$/.exec(s);
    var d = m ? new Date(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 12, m[5] ? +m[5] : 0) : new Date(s);
    return isNaN(d.getTime()) ? false : d.toISOString();
  }
  function parseImport(text) {
    var raw = String(text || '').trim().replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/, '').trim();
    var out = { rows: [], errors: [], fatal: null };
    if (!raw) return out;
    var data;
    try { data = JSON.parse(raw); } catch (e) {
      var a = raw.indexOf('['), b = raw.lastIndexOf(']');
      if (a > -1 && b > a) { try { data = JSON.parse(raw.slice(a, b + 1)); } catch (e2) { data = null; } }
    }
    if (data && !Array.isArray(data) && Array.isArray(data.items)) data = data.items;
    if (!Array.isArray(data)) { out.fatal = t('p.imp.e.json'); return out; }
    if (!data.length) { out.fatal = t('p.imp.e.empty'); return out; }
    if (data.length > IMPORT_MAX) { out.fatal = t('p.imp.e.many', { max: IMPORT_MAX }); return out; }
    var platforms = allPlatforms().map(function (p) { return p.id; });
    var str = function (v, max) { return v == null ? null : String(v).trim().slice(0, max || 4000) || null; };
    data.forEach(function (it, i) {
      it = it && typeof it === 'object' ? it : {};
      var errs = [], kind = str(it.kind || it.type, 20) || 'post', platform = str(it.platform, 30), url = str(it.media_url || it.media, 2000);
      kind = kind.toLowerCase(); if (platform) platform = platform.toLowerCase();
      var title = str(it.title || it.title_en, 200);
      if (!title) errs.push(t('p.imp.e.title'));
      if (IMPORT_KINDS.indexOf(kind) < 0) errs.push(t('p.imp.e.kind', { v: kind }));
      if (platform && platforms.indexOf(platform) < 0) errs.push(t('p.imp.e.platform', { v: platform }));
      if (url) { url = url.split(/[\s,]+/).filter(Boolean).join(','); if (url.split(',').some(function (u) { return !/^https:\/\//i.test(u); })) errs.push(t('p.imp.e.url')); }
      var whenRaw = it.when != null ? it.when : it.scheduled_at, when = parseImportDate(whenRaw);
      if (when === false) errs.push(t('p.imp.e.when', { v: whenRaw }));
      out.rows.push({
        n: i + 1, ok: !errs.length, errs: errs, when: when || null,
        row: { kind: kind, title: title, title_ar: str(it.title_ar, 200), caption: str(it.caption || it.caption_en), caption_ar: str(it.caption_ar),
          media_url: url, platform: platform || null, scheduled_at: when || null, status: 'needs_approval' }
      });
      if (errs.length) out.errors.push(i + 1);
    });
    return out;
  }
  function renderImportPreview() {
    var form = $('f-import'), target = clientById(S.ccClient), res = parseImport($('imp-text').value);
    var sum = $('imp-sum'), list = $('imp-list'), btn = $('imp-submit');
    formStatus(form, '', '');
    sum.className = 'imp-sum';
    if (res.fatal) { sum.textContent = res.fatal; list.hidden = true; btn.disabled = true; btn.textContent = t('p.imp.add0'); return null; }
    if (!res.rows.length) { sum.textContent = t('p.imp.none'); list.hidden = true; btn.disabled = true; btn.textContent = t('p.imp.add0'); return null; }
    list.hidden = false;
    list.innerHTML = res.rows.map(function (r) {
      var x = r.row, p = x.platform ? plat(x.platform)[L()] : '—';
      var kindName = IMPORT_KINDS.indexOf(x.kind) > -1 ? t('p.type.' + x.kind) : x.kind;
      return '<li' + (r.ok ? '' : ' class="bad"') + '><span class="imp-top"><span class="mono">' + esc(t('p.imp.item', { n: r.n })) + '</span><b>' + esc(x.title || '—') + '</b></span>' +
        '<span class="imp-meta"><span class="mono">' + esc(kindName + ' · ' + p) + '</span>' +
        (r.ok ? '<span class="imp-when">' + esc(r.when ? fmtWhen(r.when) : t('p.appr.nowhen')) + '</span>' : '<span class="imp-err">' + esc(r.errs.join(' ')) + '</span>') + '</span></li>';
    }).join('');
    var ok = !res.errors.length;
    sum.className = 'imp-sum' + (ok ? ' ok' : '');
    sum.textContent = ok ? t('p.imp.ready', { n: res.rows.length, name: target ? cName(target) : '' }) : t('p.imp.fix');
    btn.disabled = !ok || !S.isAdmin;
    btn.textContent = ok ? t('p.imp.add', { n: res.rows.length }) : t('p.imp.add0');
    return ok ? res.rows.map(function (r) { return r.row; }) : null;
  }
  $('imp-text').addEventListener('input', renderImportPreview);
  $('f-import').addEventListener('submit', function (e) {
    e.preventDefault();
    var form = $('f-import'), target = clientById(S.ccClient), rows = renderImportPreview();
    if (!S.isAdmin || !target || !rows) return;
    rows.forEach(function (r) { r.client_id = target.id; });
    var btn = $('imp-submit'), label = btn.textContent, name = cName(target), n = rows.length;
    btn.disabled = true; btn.textContent = t('p.f.saving');
    q(sb.from('items').insert(rows).select()).then(function () {
      $('imp-text').value = ''; renderImportPreview();
      formStatus(form, 'ok', t('p.imp.done', { n: n, name: name }));
      Z.toast(t('p.imp.done', { n: n, name: name }), 'ok');
      return loadHQ().then(function () { renderBoard(); });
    }).catch(function (err) {
      formStatus(form, 'error', t('p.f.fail', { msg: (err && err.message) || '?' }));
      btn.disabled = false; btn.textContent = label;
    });
  });

  /* ---------- Shell ---------- */
  navFor('client');
  $('dash').setAttribute('data-mood', D.getMood());
  D.setAvailable('admin', false);
  D.clock($('mb-clock'), 'menubar');

  Z.onLang(function () {
    if (modalOpen) closeModal();
    if ($('dash').getAttribute('data-state') === 'ready') renderBoard();
    if (FR.wrap && FR.on) openFront(true);
    if (CX.wrap && CX.on) { try { CX.frame.contentWindow.ZCIRCUIT.reload(); } catch (e) { /* ignore */ } }
    if ($('dash').getAttribute('data-state') === 'password') $('pw-sub').textContent = t('p.pw.sub', { email: (S.user && S.user.email) || '' });
  });

  boot();
})();
