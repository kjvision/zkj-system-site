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
    week: 0, filter: 'all', busy: {}, keepFlown: false
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
    { id: 'meta', en: 'Meta', ar: 'ميتا', color: '#1877F2' }
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
  function item(id) { for (var i = 0; i < S.items.length; i++) if (S.items[i].id === id) return S.items[i]; return null; }
  function pending() { return S.items.filter(function (x) { return x.status === 'needs_approval'; }); }
  var STATUS_DOT = { draft: 'off', needs_approval: 'bad', approved: 'ok', changes_requested: 'warn', scheduled: 'warn', published: 'ok' };
  function statusLabel(s) { return t('p.s.' + s); }
  function show(el, on) { if (el) el.hidden = !on; }
  function clientById(id) { for (var i = 0; i < S.clients.length; i++) if (S.clients[i].id === id) return S.clients[i]; return null; }

  // Client logo (or initials). A broken logo URL falls back to initials (see the error listener below).
  function initials(c) {
    var n = (c && c.name ? c.name : '?').replace(/[^A-Za-z0-9 ]/g, '').trim().split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 3) || '?';
    var bg = hex(c && c.primary_color) || '#15151B', fg = hex(c && c.accent_color) || '#D4AF37';
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
    show($('dock'), on); show($('tabbar'), on); show($('sidebar'), on && !!S.client);
  }
  function setState(titleKey, bodyKey, actions) {
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
    var c = S.client, dash = $('dash');
    $('client-name').textContent = c ? cName(c) : 'ZKJ SYSTEM';
    dash.classList.toggle('no-client', !c);
    $('client-logo').innerHTML = logoHtml(c);
    $('sb-logo').innerHTML = logoHtml(c);
    $('sb-name').textContent = c ? cName(c) : '';
    $('sb-handle').textContent = c && c.instagram ? '@' + handle(c) : '';
    var pill = $('pkg-pill');
    if (c) { pill.textContent = planName(c); pill.title = t('p.pkg', { name: planName(c) }); show(pill, true); } else show(pill, false);
    $('more-pkg').textContent = c ? planName(c) : '';
    show($('admin-pill'), S.isAdmin);
    var acc = c && hex(c.accent_color);
    if (acc) dash.style.setProperty('--accent', acc); else dash.style.removeProperty('--accent');
  }

  /* ---------- Today ---------- */
  function renderHello() {
    var c = S.client, n = pending().length;
    $('hello').textContent = S.isAdmin ? t('p.hello.admin', { name: cName(c) }) : t('p.hello', { name: cName(c) });
    $('hello-sub').textContent = S.isAdmin ? t('p.hello.admin.sub') : t('p.hello.sub');
    $('today-date').textContent = new Intl.DateTimeFormat(loc(), { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Dubai' }).format(new Date()) + ' · ' + t('dv.dubai');
    var btn = $('needs-you-btn');
    btn.textContent = n === 0 ? t('p.needs0') : n === 1 ? t('p.needs1') : t('p.needs', { n: n });
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
      '<span class="inst-label">' + esc(t('p.kpi.appr')) + '</span><span class="inst-foot"><span class="' + (n ? 'status-bad' : 'status-ok') + '">' + esc(t(n ? 'p.kpi.appr.bad' : 'p.kpi.appr.ok')) + '</span></span></button>');
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
        '<span class="un-title"><strong>' + esc(pick(x, 'title', 'title_ar')) + '</strong><span><span class="pdot-round" style="background:' + p.color + '"></span>' + esc(p[L()]) + ' · ' + esc(t('p.type.' + x.kind)) + '</span></span>' +
        statusTag(x) + '</button></li>';
    }).join('') : '<li class="portal-empty">' + esc(t('p.next.empty')) + '</li>';
    // sidebar
    var n = pending().length;
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
    $('pkg-card').innerHTML = '<span class="pkg-name">' + esc(planName(S.client)) + '</span><ul class="pkg-feats">' + rows.map(function (r) {
      return '<li class="' + (r[1] ? 'on' : 'off') + '"><span class="pf-ic" aria-hidden="true">' + (r[1] ? D.icon('check') : D.icon('plus')) + '</span><span>' + esc(t(r[0])) + '</span>' +
        (r[1] ? '' : '<span class="sr-only"> — ' + esc(t('p.pkg.notincl')) + '</span>') + '</li>';
    }).join('') + '</ul>';
    var pct = { starter: .34, growth: .67, full: 1 }[key];
    $('cc-pkg-label').textContent = t('p.pkg.title');
    $('cc-pkg').textContent = planName(S.client);
    $('cc-pkg-bar').style.width = (pct * 100) + '%';
  }

  /* ---------- Approvals: iPhone previews ---------- */
  function media(x, sfx) {
    var m = safeUrl(x.media_url), c = S.client || {};
    if (m && isImage(m)) return '<img src="' + esc(m) + '" alt="" loading="lazy">';
    return D.art({ a: hex(c.primary_color) || '#15151B', b: hex(c.accent_color) || '#D4AF37', title: pick(x, 'title', 'title_ar'), kind: x.kind, seed: x.id, sfx: sfx, full: x.kind === 'reel' || x.kind === 'story', mark: 'ZKJ SYSTEM · ' + t('p.type.' + x.kind) });
  }
  function phoneOf(x, sfx) {
    var c = S.client;
    return D.phone({ kind: x.kind, handle: handle(c), avatar: logoHtml(c), media: media(x, sfx), caption: pick(x, 'caption', 'caption_ar'), when: x.scheduled_at ? fmtWhen(x.scheduled_at) : t('p.appr.nowhen'), slides: 5 });
  }
  function platChip(id) {
    if (!id) return '';
    var p = plat(id);
    return '<span class="chip chip-static"><span class="pdot" style="background:' + p.color + '"></span>' + esc(p[L()]) + '</span>';
  }
  function phoneCard(x) {
    var dis = S.busy[x.id] ? ' disabled' : '';
    var title = pick(x, 'title', 'title_ar');
    return '<li class="appr-slot"><article class="appr phone-card" id="appr-' + esc(x.id) + '" data-id="' + esc(x.id) + '" data-pending="1" aria-label="' + esc(title) + '">' +
      phoneOf(x) +
      '<div class="pc-meta"><h3>' + esc(title) + '</h3><p>' + platChip(x.platform) + '<span class="mono">' + esc(x.scheduled_at ? fmtWhen(x.scheduled_at) : t('p.appr.nowhen')) + '</span></p></div>' +
      '<div class="pc-actions">' +
      '<button class="tactile yes" type="button" data-action="approve" data-id="' + esc(x.id) + '"' + dis + '>' + D.icon('check') + '<span>' + esc(t('p.appr.approve')) + '</span><span class="sr-only"> — ' + esc(title) + '</span></button>' +
      '<button class="tactile no" type="button" data-action="changes" data-id="' + esc(x.id) + '"' + dis + '>' + D.icon('pencil') + '<span>' + esc(t('p.appr.changes')) + '</span><span class="sr-only"> — ' + esc(title) + '</span></button>' +
      '</div><button class="link-btn pc-more" type="button" data-action="preview" data-id="' + esc(x.id) + '">' + esc(t('p.appr.preview')) + '<span class="sr-only"> — ' + esc(title) + '</span></button>' +
      '</article></li>';
  }
  function thumb(x) {
    var m = safeUrl(x.media_url), c = S.client || {};
    if (m && isImage(m)) return '<img src="' + esc(m) + '" alt="" loading="lazy">';
    return D.art({ a: hex(c.primary_color) || '#15151B', b: hex(c.accent_color) || '#D4AF37', kind: x.kind, seed: x.id, sfx: '-t' });
  }
  // compact card: reviewed items, inbox replies, ads
  function rowCard(x, prefix) {
    var title = pick(x, 'title', 'title_ar'), actions;
    if (x.status === 'needs_approval') {
      var dis = S.busy[x.id] ? ' disabled' : '';
      actions = '<button class="btn btn-approve btn-sm" type="button" data-action="approve" data-id="' + esc(x.id) + '"' + dis + '>' + esc(t('p.appr.approve')) + '</button>' +
        '<button class="btn btn-ghost btn-sm" type="button" data-action="changes" data-id="' + esc(x.id) + '"' + dis + '>' + esc(t('p.appr.changes')) + '</button>';
    } else {
      var ok = x.status === 'approved' || x.status === 'scheduled' || x.status === 'published';
      actions = '<span class="appr-state status-' + (ok ? 'ok' : 'warn') + '"><span class="dot ' + (ok ? 'ok' : 'warn') + '"></span>' + esc(statusLabel(x.status)) + '</span>';
    }
    var note = x.client_note ? '<p class="appr-note">' + esc(t('p.appr.yournote', { note: x.client_note })) + '</p>' : '';
    return '<li><article class="appr row-card' + (x.status !== 'needs_approval' ? ' is-done' : '') + '" id="' + (prefix || 'appr-') + esc(x.id) + '">' +
      '<div class="rc-thumb">' + thumb(x) + '</div><div class="rc-body"><h3>' + esc(title) + '</h3>' +
      '<div class="rc-line">' + platChip(x.platform) + '<span class="mono" style="font-size:12px;color:var(--muted)">' + esc(x.scheduled_at ? fmtWhen(x.scheduled_at) : t('p.appr.nowhen')) + '</span></div>' +
      (prefix ? '<p class="rc-caption">' + esc(pick(x, 'caption', 'caption_ar')) + '</p>' : '') + note +
      '<div class="appr-actions">' + actions + '<button class="link-btn" type="button" data-action="preview" data-id="' + esc(x.id) + '">' + esc(t('p.appr.preview')) + '<span class="sr-only"> — ' + esc(title) + '</span></button></div></div>' +
      '</article></li>';
  }
  var rowUpd = D.rowNav($('appr-list'), $('row-prev'), $('row-next'), $('row-count'));
  function renderApprovals() {
    var pend = pending();
    var reviewed = S.items.filter(function (x) { return (x.status === 'changes_requested' || x.status === 'approved') && x.reviewed_at; })
      .sort(function (a, b) { return String(b.reviewed_at).localeCompare(String(a.reviewed_at)); }).slice(0, 6);
    $('appr-list').innerHTML = pend.length ? pend.map(phoneCard).join('')
      : '<li class="appr-empty">' + D.icon('check') + '<span>' + esc(t('p.appr.empty')) + '</span></li>';
    $('appr-done').innerHTML = reviewed.map(function (x) { return rowCard(x); }).join('');
    show($('done-wrap'), reviewed.length > 0);
    $('stack-ghosts').setAttribute('data-n', Math.min(pend.length, 3));
    show($('stack-ghosts'), pend.length > 1);
    show($('stack-hint'), pend.length > 0);
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
        (o.color ? '<span class="pdot" style="background:' + o.color + '"></span>' : '') + esc(o.label) + '</button>';
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
        kind: p[L()], color: p.color, dot: STATUS_DOT[x.status] || 'off', status: statusLabel(x.status), wave: x.kind === 'reel' || x.kind === 'story' });
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
      '<dl class="kv"><dt>' + esc(t('p.item.platform')) + '</dt><dd><span class="pdot-round" style="background:' + p.color + '"></span> ' + esc(p[L()]) + '</dd>' +
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
  function renderPackage() {
    var key = planKey(S.client), feats = PKG[key].features;
    ['inbox', 'ads', 'whatsapp'].forEach(function (f) { D.setAvailable(f, feats.indexOf(f) > -1); });
    var missing = Object.keys(ADDONS).filter(function (f) { return feats.indexOf(f) < 0; });
    show($('addons'), missing.length > 0);
    $('addon-sub').textContent = t('p.addon.sub', { pkg: planName(S.client) });
    $('addon-list').innerHTML = missing.map(function (f) { return '<li><span class="pf-ic" aria-hidden="true">' + D.icon('plus') + '</span><span>' + esc(t(ADDONS[f])) + '</span></li>'; }).join('');
    $('addon-wa').href = 'https://wa.me/971541668700?text=' + encodeURIComponent(t('wa.general'));
    if (feats.indexOf('inbox') > -1) kindList('reply', 'inbox-list', 'p.inbox.empty');
    if (feats.indexOf('ads') > -1) kindList('ad', 'ads-list', 'p.ads.empty');
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
  function renderAdmin() {
    D.setAvailable('admin', S.isAdmin);
    show($('admin'), S.isAdmin);
    if (!S.isAdmin) return;
    $('adm-sub').textContent = t('p.adm.sub', { name: cName(S.client) });
    $('cc-sheet-client').textContent = cName(S.client);
    $('cc-client-count').textContent = S.clients.length;
    $('client-switch').innerHTML = S.clients.map(function (c) {
      var on = S.client && c.id === S.client.id;
      return '<button class="cc-client" type="button" data-action="switch-client" data-id="' + esc(c.id) + '" aria-pressed="' + on + '">' +
        '<span class="cc-logo">' + logoHtml(c) + '</span><b>' + esc(cName(c)) + (c.active === false ? ' (—)' : '') + '</b><small>' + esc(planName(c)) + '</small></button>';
    }).join('');
    $('cc-need').textContent = pending().length;
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
    ['f-item', 'f-kpi', 'f-notif'].forEach(function (f) { show($(f), f === id); });
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
    if (!S.client) return;
    renderHeader(); renderHello(); renderKpis(); renderNext(); renderApprovals();
    renderFilters(); renderCalendar(); renderPackage(); renderReports(); renderNotifs(); renderAdmin();
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
      loadNotifs()
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

  function showBoard() {
    $('dash').setAttribute('data-state', 'ready');
    show($('state'), false); show($('pw-panel'), false); show($('board'), true);
    show($('notif-wrap'), true);
    renderBoard();
    chrome(true);
    D.show(D.current(), { bounce: false });
  }

  function loadError(err) {
    if (window.console) console.warn('[portal] load failed', err && (err.message || err));
    setState('p.st.error.t', 'p.st.error.b', [{ action: 'retry', key: 'p.retry', cls: 'btn-primary' }, WA_ACTION]);
  }

  function selectClient(id) {
    var c = S.clients.filter(function (x) { return x.id === id; })[0] || S.clients[0];
    S.client = c; S.filter = 'all';
    Z.store(CLIENT_KEY, c.id);
    return loadClientData().then(function () { pickInitialWeek(); showBoard(); });
  }

  function boot() {
    if (!sb) { setState('p.st.error.t', 'p.e.config', [WA_ACTION]); return; }
    sb.auth.getSession().then(function (r) {
      var session = r && r.data && r.data.session;
      if (!session) {
        window.location.replace('login.html' + (SB.linkError ? '?e=link' : ''));
        return null;
      }
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
        return q(sb.from('clients').select('*').order('created_at', { ascending: true })).then(function (list) {
          S.clients = list || [];
          if (!S.clients.length) { setState('p.st.noclients.t', 'p.st.noclients.b'); return; }
          var stored = Z.store(CLIENT_KEY);
          var has = function (id) { return S.clients.some(function (c) { return c.id === id; }); };
          return selectClient(has(stored) ? stored : has(DEFAULT_CLIENT) ? DEFAULT_CLIENT : S.clients[0].id);
        });
      }
      if (!p.client_id) { setState('p.st.unlinked.t', 'p.st.unlinked.b', [WA_ACTION]); return; }
      return q(sb.from('clients').select('*').eq('id', p.client_id).maybeSingle()).then(function (c) {
        if (!c || c.active === false) { setState('p.st.noclient.t', 'p.st.noclient.b', [WA_ACTION]); return; }
        S.clients = [c]; S.client = c;
        return loadClientData().then(function () { pickInitialWeek(); showBoard(); });
      });
    }).catch(loadError);
  }

  /* ---------- Set password (invite / recovery links) ---------- */
  function showPassword() {
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
  function toLogin() { if (leaving) return; leaving = true; window.location.replace('login.html?out=1'); }

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
    var m = safeUrl(x.media_url);
    var acts = [];
    if (x.status === 'needs_approval') {
      acts.push({ action: 'approve', id: x.id, label: t('p.appr.approve'), cls: 'btn-primary' });
      acts.push({ action: 'changes', id: x.id, label: t('p.appr.changes') });
    }
    if (m) acts.push({ href: m, label: t('p.item.media') });
    acts.push({ action: 'modal-close', label: t('p.close') });
    var dot = STATUS_DOT[x.status] || 'off';
    openModal({
      title: pick(x, 'title', 'title_ar'),
      body: '<div class="modal-preview">' + phoneOf(x, '-m') + '</div>' +
        '<dl class="kv"><dt>' + esc(t('p.item.platform')) + '</dt><dd>' + esc(x.platform ? plat(x.platform)[L()] : '—') + '</dd>' +
        '<dt>' + esc(t('p.item.type')) + '</dt><dd>' + esc(t('p.type.' + x.kind)) + '</dd>' +
        '<dt>' + esc(t('p.item.when')) + '</dt><dd>' + esc(fmtWhen(x.scheduled_at)) + '</dd>' +
        '<dt>' + esc(t('p.item.status')) + '</dt><dd><span class="status-' + dot + '" style="font-weight:700">' + esc(statusLabel(x.status)) + '</span></dd>' +
        (x.client_note ? '<dt>' + esc(t('p.item.note')) + '</dt><dd>' + esc(x.client_note) + '</dd>' : '') + '</dl>',
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
      Z.toast(t(decision === 'approved' ? 'p.appr.toast.ok' : 'p.appr.toast.changes', { title: pick(x, 'title', 'title_ar') }), decision === 'approved' ? 'ok' : 'warn');
      if (S.isAdmin) return loadNotifs();
    }).catch(function (err) {
      if (err && /no longer waiting/i.test(err.message || '')) {
        Z.toast(t('p.appr.stale'), 'warn');
        return loadClientData();
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
  D.swipe($('appr-list'), {
    approve: function (id) { var x = item(id); if (x && x.status === 'needs_approval') approveItem(x, true); else renderApprovals(); },
    changes: function (id) { var x = item(id); if (x && x.status === 'needs_approval') openChanges(x); else renderApprovals(); }
  });

  /* ---------- Actions ---------- */
  function closeNotif() { $('notif-panel').hidden = true; $('bell').setAttribute('aria-expanded', 'false'); }

  var actions = {
    retry: function () { setState('p.loading', null); loadProfile(); },
    signout: function () { sb.auth.signOut().then(toLogin, toLogin); },
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
    'switch-client': function (el) {
      var id = el.getAttribute('data-id');
      if (S.client && id === S.client.id) return;
      $('dash').setAttribute('data-state', 'loading');
      selectClient(id).catch(loadError);
    },
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
  D.onView(function (id) {
    closeNotif();
    if (id === 'approvals' && rowUpd) setTimeout(rowUpd, 0);
    if (id === 'calendar') setTimeout(function () { D.revealNow($('cal')); }, 0);
    if (id === 'today') D.animateIn($('kpi-row'));
  });

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
      if (!S.isAdmin || !S.client) return;
      var bad = null;
      form.querySelectorAll('[required]').forEach(function (inp) {
        var ok = !!inp.value.trim();
        inp.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok && !bad) bad = inp;
      });
      if (bad) { formStatus(form, 'error', t('p.f.need')); bad.focus(); return; }
      var row = build(form);
      row.client_id = S.client.id;
      var btn = form.querySelector('[type="submit"]'), label = btn.textContent;
      btn.disabled = true; btn.textContent = t('p.f.saving');
      var name = cName(S.client);
      q(sb.from(table).insert(row).select()).then(function () {
        form.reset(); renderAdmin();
        formStatus(form, 'ok', t(okKey, { name: name }));
        Z.toast(t(okKey, { name: name }), 'ok');
        return loadClientData().then(function () { renderBoard(); });
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
      caption: val(f, 'caption'), caption_ar: val(f, 'caption_ar'), media_url: val(f, 'media_url'),
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

  /* ---------- Shell ---------- */
  D.buildNav({
    items: [
      { id: 'today', key: 'dv.today', icon: 'today', tone: 'gold' },
      { id: 'approvals', key: 'dv.approvals', icon: 'approvals' },
      { id: 'calendar', key: 'dv.calendar', icon: 'calendar', tone: 'cal' },
      { id: 'inbox', key: 'dv.inbox', icon: 'inbox' },
      { id: 'ads', key: 'dv.ads', icon: 'ads' },
      { id: 'whatsapp', key: 'dv.whatsapp', icon: 'whatsapp', tone: 'wa' },
      { id: 'reports', key: 'dv.reports', icon: 'reports', tone: 'steel' },
      { id: 'admin', key: 'dv.control', icon: 'control', sep: true }
    ],
    tabs: ['today', 'approvals', 'calendar', 'more']
  });
  D.setAvailable('admin', false);
  D.clock($('mb-clock'), 'menubar');

  Z.onLang(function () {
    if (modalOpen) closeModal();
    if ($('dash').getAttribute('data-state') === 'ready') renderBoard();
    if ($('dash').getAttribute('data-state') === 'password') $('pw-sub').textContent = t('p.pw.sub', { email: (S.user && S.user.email) || '' });
  });

  boot();
})();
