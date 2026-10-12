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
    all: [], hqWeek: 0, ccClient: null
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
    show($('dock'), on); show($('tabbar'), on); show($('sidebar'), on && (!!S.client || S.mode === 'hq'));
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
        '<span class="un-title"><strong>' + esc(pick(x, 'title', 'title_ar')) + '</strong><span><span class="pdot-round" style="background:' + p.color + '"></span>' + esc(p[L()]) + ' · ' + esc(t('p.type.' + x.kind)) + '</span></span>' +
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
  function media(x, sfx) {
    var m = safeUrl(x.media_url), c = clientOf(x);
    if (m && isImage(m)) return '<img src="' + esc(m) + '" alt="" loading="lazy">';
    return D.art({ a: hex(c.primary_color) || '#15151B', b: hex(c.accent_color) || '#D4AF37', title: pick(x, 'title', 'title_ar'), kind: x.kind, seed: x.id, sfx: sfx, full: x.kind === 'reel' || x.kind === 'story', mark: 'ZKJ SYSTEM · ' + t('p.type.' + x.kind) });
  }
  function phoneOf(x, sfx) {
    var c = clientOf(x);
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
    var can = canReview(x);
    var acts = can
      ? '<div class="pc-actions">' +
        '<button class="tactile yes" type="button" data-action="approve" data-id="' + esc(x.id) + '"' + dis + '>' + D.icon('check') + '<span>' + esc(t(S.isAdmin ? 'p.appr.owner' : 'p.appr.approve')) + '</span><span class="sr-only"> — ' + esc(title) + '</span></button>' +
        '<button class="tactile no" type="button" data-action="changes" data-id="' + esc(x.id) + '"' + dis + '>' + D.icon('pencil') + '<span>' + esc(t('p.appr.changes')) + '</span><span class="sr-only"> — ' + esc(title) + '</span></button></div>'
      : '<div class="pc-wait"><span class="status-tag warn"><span class="dot warn"></span> ' + esc(t('p.wait.client')) + '</span></div>';
    return '<li class="appr-slot"><article class="appr phone-card' + (can ? '' : ' is-readonly') + '" id="appr-' + esc(x.id) + '" data-id="' + esc(x.id) + '" data-pending="' + (can ? '1' : '0') + '" aria-label="' + esc(title) + '">' +
      phoneOf(x) +
      '<div class="pc-meta"><h3>' + esc(title) + '</h3><p>' + platChip(x.platform) + '<span class="mono">' + esc(x.scheduled_at ? fmtWhen(x.scheduled_at) : t('p.appr.nowhen')) + '</span></p></div>' +
      acts + '<button class="link-btn pc-more" type="button" data-action="preview" data-id="' + esc(x.id) + '">' + esc(t('p.appr.preview')) + '<span class="sr-only"> — ' + esc(title) + '</span></button>' +
      '</article></li>';
  }
  function thumb(x) {
    var m = safeUrl(x.media_url), c = clientOf(x);
    if (m && isImage(m)) return '<img src="' + esc(m) + '" alt="" loading="lazy">';
    return D.art({ a: hex(c.primary_color) || '#15151B', b: hex(c.accent_color) || '#D4AF37', kind: x.kind, seed: x.id, sfx: '-t' });
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
    D.ambient($('ambient'), { covers: coversOf(c).length ? coversOf(c) : SYSTEM_COVERS }); // the client's logo glows once, behind the title
    var hl = $('ws-light'), k = 'logo:' + logo;
    if (hl.getAttribute('data-k') !== k) {
      hl.setAttribute('data-k', k);
      hl.className = 'hero-light ' + (logo ? 'is-logo' : 'is-cube');
      hl.innerHTML = logo ? D.neonLogo(logo) : D.cubeLight();
    }
  }
  function renderMood() {
    var m = $('dash').getAttribute('data-mood');
    document.querySelectorAll('[data-action="set-mood"]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-mood') === m ? 'true' : 'false'); });
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
    S.all.filter(function (x) { return x.status === 'draft'; })
      .forEach(function (x) { rows.push({ type: 'draft', x: x, c: clientOf(x), when: x.scheduled_at || x.created_at }); });
    S.notifs.forEach(function (n) { rows.push({ type: 'activity', n: n, c: clientById(n.client_id), when: n.created_at }); });
    return rows;
  }
  function todoCount() { return todoRows().filter(function (r) { return r.type !== 'activity' || !r.n.read; }).length; }
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
        '<span class="cc-handle">' + esc(c.instagram ? '@' + handle(c) : '—') + '</span></div>' +
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
      if (r.type === 'activity') {
        var body = pick(r.n, 'body', 'body_ar');
        return '<li class="td td-activity' + (r.n.read ? ' is-read' : '') + '"><span class="td-ic" data-kind="activity">' + D.icon('bell') + '</span><div class="td-main"><div class="td-top">' + who + '<span class="td-type">' + esc(t('p.td.activity')) + '</span>' + when + '</div>' +
          '<strong>' + (r.n.read ? '' : '<span class="nb-unread" aria-hidden="true"></span>') + esc(pick(r.n, 'title', 'title_ar')) + '</strong>' + (body ? '<p>' + esc(body) + '</p>' : '') + '</div></li>';
      }
      var x = r.x;
      return '<li class="td td-' + r.type + '"><span class="td-ic" data-kind="' + r.type + '">' + D.icon(r.type === 'changes' ? 'pencil' : 'reports') + '</span><div class="td-main"><div class="td-top">' + who +
        '<span class="td-type">' + esc(t(r.type === 'changes' ? 'p.td.changes' : 'p.td.draft')) + '</span>' + when + '</div>' +
        '<strong>' + esc(pick(x, 'title', 'title_ar')) + '</strong>' +
        (r.type === 'changes' && x.client_note ? '<p class="td-note">“' + esc(x.client_note) + '”</p>' : '') +
        (r.type === 'draft' ? '<p>' + esc(t('p.td.draft.sub')) + '</p>' : '') + '</div>' +
        '<div class="td-acts"><button class="btn btn-ghost btn-sm" type="button" data-action="preview" data-id="' + esc(x.id) + '">' + esc(t('p.appr.preview')) + '</button>' +
        '<button class="btn btn-ghost btn-sm" type="button" data-action="open-ws" data-id="' + esc(x.client_id) + '">' + esc(t('p.hq.open')) + '</button></div></li>';
    }).join('') : '<li class="gcard portal-empty">' + esc(t('p.td.empty')) + '</li>';

    renderHQWeek();
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
          kind: t('p.type.' + x.kind), color: p.color, dot: STATUS_DOT[x.status] || 'off', status: x.status === 'needs_approval' ? t(c.internal ? 'p.st.wait.own' : 'p.wait.client') : statusLabel(x.status), wave: x.kind === 'reel' || x.kind === 'story', dim: x.status === 'draft' };
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
    if (document.activeElement !== $('cc-covers-input')) $('cc-covers-input').value = coversOf(target).join(',\n');
    renderMood();
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
    if (S.mode === 'hq') { renderHeader(); renderNotifs(); renderHQ(); renderAmbient(); return; }
    if (!S.client) return;
    renderAmbient();
    renderHeader(); renderHello(); renderKpis(); renderNext(); renderApprovals();
    renderFilters(); renderCalendar(); renderPackage(); renderReports(); renderNotifs();
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
    { id: 'approvals', key: 'dv.approvals', icon: 'approvals' },
    { id: 'calendar', key: 'dv.calendar', icon: 'calendar', tone: 'cal' },
    { id: 'inbox', key: 'dv.inbox', icon: 'inbox' },
    { id: 'ads', key: 'dv.ads', icon: 'ads' },
    { id: 'whatsapp', key: 'dv.whatsapp', icon: 'whatsapp', tone: 'wa' },
    { id: 'reports', key: 'dv.reports', icon: 'reports', tone: 'steel' }
  ];
  var HQ_NAV = [
    { id: 'hq', key: 'dv.hq', icon: 'box', tone: 'gold' },
    { id: 'todo', key: 'dv.todo', icon: 'pencil' },
    { id: 'week', key: 'dv.week', icon: 'calendar', tone: 'cal' },
    { id: 'admin', key: 'dv.control', icon: 'control', sep: true }
  ];
  var HQ_VIEWS = ['hq', 'todo', 'week', 'admin'];
  function navFor(mode) {
    if (mode === 'hq') D.buildNav({ items: HQ_NAV, tabs: ['hq', 'todo', 'week', 'more'] });
    else if (mode === 'ws') D.buildNav({ items: [{ id: 'hq', key: 'dv.backhq', icon: 'back', tone: 'steel' }].concat(CLIENT_NAV.map(function (it, i) { return i === 0 ? Object.assign({ sep: true }, it) : it; })), tabs: ['today', 'approvals', 'calendar', 'more'] });
    else D.buildNav({ items: CLIENT_NAV, tabs: ['today', 'approvals', 'calendar', 'more'] });
    document.querySelectorAll('.hq-view').forEach(function (v) { if (v.id !== 'admin') v.hidden = !S.isAdmin; });
  }

  function loadHQ() {
    return Promise.all([
      q(sb.from('clients').select('*').order('created_at', { ascending: true })),
      q(sb.from('items').select('*').order('scheduled_at', { ascending: true, nullsFirst: false })),
      loadNotifs()
    ]).then(function (r) { S.clients = r[0] || []; S.all = r[1] || []; });
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
    if (window.console) console.warn('[portal] load failed', err && (err.message || err));
    setState('p.st.error.t', 'p.st.error.b', [{ action: 'retry', key: 'p.retry', cls: 'btn-primary' }, WA_ACTION]);
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
        // KJ lands on ZKJ SYSTEM HQ, never inside a client's screen
        return loadHQ().then(function () {
          if (!S.clients.length) { setState('p.st.noclients.t', 'p.st.noclients.b'); return; }
          var stored = Z.store(CLIENT_KEY);
          S.ccClient = clientById(stored) ? stored : clientById(DEFAULT_CLIENT) ? DEFAULT_CLIENT : S.clients[0].id;
          showHQ('hq');
        });
      }
      if (!p.client_id) { setState('p.st.unlinked.t', 'p.st.unlinked.b', [WA_ACTION]); return; }
      return q(sb.from('clients').select('*').eq('id', p.client_id).maybeSingle()).then(function (c) {
        if (!c || c.active === false) { setState('p.st.noclient.t', 'p.st.noclient.b', [WA_ACTION]); return; }
        S.clients = [c]; S.client = c; S.mode = 'client';
        return loadClientData().then(function () { pickInitialWeek(); navFor('client'); showBoard('today'); });
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
    if (x.status === 'needs_approval' && canReview(x)) {
      acts.push({ action: 'approve', id: x.id, label: t(S.isAdmin ? 'p.appr.owner' : 'p.appr.approve'), cls: 'btn-primary' });
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
        (S.isAdmin ? '<dt>' + esc(t('p.item.client')) + '</dt><dd>' + esc(cName(clientOf(x))) + '</dd>' : '') +
        '<dt>' + esc(t('p.item.status')) + '</dt><dd><span class="status-' + dot + '" style="font-weight:700">' + esc(x.status === 'needs_approval' && !canReview(x) ? t('p.wait.client') : statusLabel(x.status)) + '</span></dd>' +
        (x.client_note ? '<dt>' + esc(t(S.isAdmin ? 'p.item.theirnote' : 'p.item.note')) + '</dt><dd>' + esc(x.client_note) + '</dd>' : '') + '</dl>',
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
    'open-ws': function (el) { closeModal(); openWorkspace(el.getAttribute('data-id')).catch(loadError); },
    'back-hq': function () { backToHQ('hq'); },
    'set-mood': function (el) { D.setMood(el.getAttribute('data-mood')); renderMood(); },
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
    'cc-target': function (el) { S.ccClient = el.getAttribute('data-id'); Z.store(CLIENT_KEY, S.ccClient); renderAdmin(); var b = document.querySelector('#client-switch [data-id="' + S.ccClient + '"]'); if (b) b.focus(); },
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
  D.onView(function (id) {
    closeNotif();
    if (S.mode === 'ws' && HQ_VIEWS.indexOf(id) > -1) { backToHQ(id); return; }
    if (id === 'week') setTimeout(function () { D.revealNow($('hq-cal')); }, 0);
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
  navFor('client');
  $('dash').setAttribute('data-mood', D.getMood());
  D.setAvailable('admin', false);
  D.clock($('mb-clock'), 'menubar');

  Z.onLang(function () {
    if (modalOpen) closeModal();
    if ($('dash').getAttribute('data-state') === 'ready') renderBoard();
    if ($('dash').getAttribute('data-state') === 'password') $('pw-sub').textContent = t('p.pw.sub', { email: (S.user && S.user.email) || '' });
  });

  boot();
})();
