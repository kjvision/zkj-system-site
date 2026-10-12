/* ZKJ SYSTEM — live client portal (app/index.html).
   Reads the signed-in person's data from Supabase. Row-level security (supabase/schema.sql)
   decides what each person can see; this file only renders it.
   Clients can only approve / request changes (review_item) and clear their bell (mark_notifications_read).
   The admin (KJ) gets a client switcher and simple forms to add items, numbers and notifications.
   Reuses the CSS classes of the public demo dashboard (assets/style.css). */
(function () {
  'use strict';
  var Z = window.ZKJ;
  var t = Z.t, esc = Z.esc;
  var SB = window.ZKJ_SB || {};
  var sb = SB.client;
  var CLIENT_KEY = 'zkj-portal-client';
  var DEFAULT_CLIENT = 'c1000000-0000-4000-8000-000000000001'; // KJ VISION (seeded in schema.sql)

  var S = {
    user: null, profile: null, isAdmin: false,
    clients: [], client: null,
    items: [], kpis: [], notifs: [], reports: [],
    week: 0, filter: 'all', busy: {}
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
  function fmtTime(iso) { return new Intl.DateTimeFormat(loc(), { hour: 'numeric', minute: '2-digit' }).format(new Date(iso)); }
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

  /* ---------- Page states ---------- */
  function setState(titleKey, bodyKey, actions) {
    $('dash').setAttribute('data-state', 'message');
    show($('board'), false); show($('pw-panel'), false); show($('state'), true);
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

  /* ---------- Header ---------- */
  function renderHeader() {
    var c = S.client;
    $('client-name').textContent = c ? cName(c) : 'ZKJ SYSTEM';
    var wrap = $('client-logo');
    var src = c ? safeUrl(c.logo_url) : '';
    wrap.innerHTML = '';
    if (src) {
      var img = document.createElement('img');
      img.alt = ''; img.src = src; img.width = 44; img.height = 44;
      img.addEventListener('error', function () { wrap.innerHTML = initials(c); });
      wrap.appendChild(img);
    } else if (c) {
      wrap.innerHTML = initials(c);
    } else {
      wrap.innerHTML = '<img src="../assets/brand/zkjsystem-icon-primary.svg" alt="" width="38" height="44">';
    }
    var pill = $('pkg-pill');
    if (c) { pill.textContent = planName(c); pill.title = t('p.pkg', { name: planName(c) }); show(pill, true); } else show(pill, false);
    show($('admin-pill'), S.isAdmin);
    var dash = $('dash');
    var acc = c && hex(c.accent_color);
    if (acc) dash.style.setProperty('--accent', acc); else dash.style.removeProperty('--accent');
  }
  function initials(c) {
    var n = (c && c.name ? c.name : '?').replace(/[^A-Za-z0-9 ]/g, '').trim().split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 3) || '?';
    var bg = hex(c && c.primary_color) || '#15151B', fg = hex(c && c.accent_color) || '#D4AF37';
    return '<span class="logo-initials" style="background:' + bg + ';color:' + fg + ';border-color:' + fg + '" aria-hidden="true">' + esc(n) + '</span>';
  }
  function renderSwitcher() {
    var wrap = $('client-switch-wrap');
    if (!S.isAdmin) { show(wrap, false); return; }
    show(wrap, true);
    $('client-switch').innerHTML = S.clients.map(function (c) {
      return '<option value="' + esc(c.id) + '"' + (S.client && c.id === S.client.id ? ' selected' : '') + '>' + esc(cName(c)) + (c.active === false ? ' (—)' : '') + '</option>';
    }).join('');
  }

  /* ---------- Board ---------- */
  function renderHello() {
    var c = S.client, n = pending().length;
    $('hello').textContent = S.isAdmin ? t('p.hello.admin', { name: cName(c) }) : t('p.hello', { name: cName(c) });
    $('hello-sub').textContent = S.isAdmin ? t('p.hello.admin.sub') : t('p.hello.sub');
    $('needs-you-btn').textContent = n === 0 ? t('p.needs0') : n === 1 ? t('p.needs1') : t('p.needs', { n: n });
  }

  function renderKpis() {
    var seen = {}, latest = [];
    S.kpis.forEach(function (k) { if (!seen[k.metric]) { seen[k.metric] = 1; latest.push(k); } });
    // show numbers in the order they were added (ties: by id), newest value per metric
    latest.sort(function (a, b) { return String(a.created_at).localeCompare(String(b.created_at)) || String(a.id).localeCompare(String(b.id)); });
    var n = pending().length;
    var tiles = latest.map(function (k) {
      return '<div class="plate kpi"><span class="k-label">' + esc(pick(k, 'label', 'label_ar') || k.metric) + '</span><span class="k-value">' + esc(num(k.value)) +
        '</span><span class="k-delta muted">' + esc(k.period_start ? t('p.kpi.asof', { d: fmtDate(k.period_start) }) : '') + '</span></div>';
    });
    tiles.push('<div class="plate kpi"><span class="k-label">' + esc(t('p.kpi.appr')) + '</span><span class="k-value">' + n + '</span><span class="k-delta ' + (n ? 'bad' : '') + '">' + esc(t(n ? 'p.kpi.appr.bad' : 'p.kpi.appr.ok')) + '</span></div>');
    if (!latest.length) tiles.unshift('<div class="plate kpi kpi-empty"><span class="k-label">' + esc(t('p.kpi.title')) + '</span><p>' + esc(t('p.kpi.empty')) + '</p></div>');
    $('kpi-row').innerHTML = tiles.join('');
  }

  function thumb(x, idSuffix) {
    var media = safeUrl(x.media_url);
    if (media && isImage(media)) return '<img src="' + esc(media) + '" alt="" loading="lazy">';
    var c = S.client || {};
    var a = hex(c.primary_color) || '#15151B', b = hex(c.accent_color) || '#D4AF37';
    var gid = 'g-' + x.id + (idSuffix || '');
    var motif = x.kind === 'reel' || x.kind === 'story'
      ? '<circle cx="48" cy="54" r="16" fill="rgba(255,255,255,.18)"/><path d="M43 46l13 8-13 8z" fill="#fff"/>'
      : x.kind === 'carousel'
        ? '<rect x="22" y="30" width="44" height="52" fill="rgba(255,255,255,.14)"/><rect x="30" y="36" width="44" height="52" fill="rgba(255,255,255,.22)"/>'
        : '<rect x="26" y="38" width="44" height="36" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2"/><path d="M30 70l12-12 8 8 6-6 10 10" fill="none" stroke="#fff" stroke-width="2"/>';
    return '<svg viewBox="0 0 96 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="' + esc(gid) + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '" stop-opacity=".55"/></linearGradient></defs><rect width="96" height="120" fill="url(#' + esc(gid) + ')"/>' + motif + '</svg>';
  }
  function platChip(id) {
    if (!id) return '';
    var p = plat(id);
    return '<span class="chip chip-static"><span class="pdot" style="background:' + p.color + '"></span>' + esc(p[L()]) + '</span>';
  }

  function apprCard(x) {
    var actions;
    if (x.status === 'needs_approval') {
      var dis = S.busy[x.id] ? ' disabled' : '';
      actions = '<button class="btn btn-approve btn-sm" type="button" data-action="approve" data-id="' + x.id + '"' + dis + '>' + esc(t('p.appr.approve')) + '</button>' +
        '<button class="btn btn-ghost btn-sm" type="button" data-action="changes" data-id="' + x.id + '"' + dis + '>' + esc(t('p.appr.changes')) + '</button>' +
        '<button class="link-btn" type="button" data-action="preview" data-id="' + x.id + '">' + esc(t('p.appr.preview')) + '</button>';
    } else {
      var ok = x.status === 'approved' || x.status === 'scheduled' || x.status === 'published';
      actions = '<span class="appr-state status-' + (ok ? 'ok' : 'warn') + '"><span class="dot ' + (ok ? 'ok' : 'warn') + '"></span>' + esc(statusLabel(x.status)) + '</span>' +
        '<button class="link-btn" type="button" data-action="preview" data-id="' + x.id + '">' + esc(t('p.appr.preview')) + '</button>';
    }
    var note = x.client_note ? '<p class="appr-note">' + esc(t('p.appr.yournote', { note: x.client_note })) + '</p>' : '';
    return '<li><article class="plate appr' + (x.status !== 'needs_approval' ? ' is-done' : '') + '" id="appr-' + x.id + '">' +
      '<div class="appr-thumb">' + thumb(x) + '<span class="type" style="position:relative">' + esc(t('p.type.' + x.kind)) + '</span></div>' +
      '<div class="appr-body"><h3>' + esc(pick(x, 'title', 'title_ar')) + '</h3>' +
      '<div class="appr-meta">' + platChip(x.platform) + '<span>' + esc(x.scheduled_at ? t('p.appr.when', { w: fmtWhen(x.scheduled_at) }) : t('p.appr.nowhen')) + '</span></div>' +
      '<p class="appr-caption">' + esc(pick(x, 'caption', 'caption_ar')) + '</p>' + note +
      '<div class="appr-actions">' + actions + '</div></div>' +
      '</article></li>';
  }

  function renderApprovals() {
    var reviewed = S.items.filter(function (x) { return (x.status === 'changes_requested' || x.status === 'approved') && x.reviewed_at; })
      .sort(function (a, b) { return String(b.reviewed_at).localeCompare(String(a.reviewed_at)); }).slice(0, 6);
    var list = pending().concat(reviewed);
    $('appr-list').innerHTML = list.length ? list.map(apprCard).join('') : '<li class="plate portal-empty">' + esc(t('p.appr.empty')) + '</li>';
  }

  function weekStart(offset) {
    var d = new Date(); d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay() + offset * 7);
    return d;
  }
  function renderFilters() {
    var used = {};
    S.items.forEach(function (x) { if (x.platform) used[x.platform] = 1; });
    var opts = [{ id: 'all', label: t('p.cal.all') }].concat(Object.keys(used).map(function (id) { var p = plat(id); return { id: id, label: p[L()], color: p.color }; }));
    if (S.filter !== 'all' && !used[S.filter]) S.filter = 'all';
    $('cal-filters').innerHTML = opts.length > 1 ? opts.map(function (o) {
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
    var html = '';
    for (var i = 0; i < 7; i++) {
      var day = new Date(start); day.setDate(day.getDate() + i);
      var dayItems = items.filter(function (x) { var d = new Date(x.scheduled_at); return d.getDate() === day.getDate() && d.getMonth() === day.getMonth(); })
        .sort(function (a, b) { return new Date(a.scheduled_at) - new Date(b.scheduled_at); });
      html += '<div class="cal-day"><h3>' + esc(t('p.day.' + day.getDay())) + ' <span class="cal-date">' + day.getDate() + '</span></h3>' +
        (dayItems.length ? dayItems.map(function (x) {
          var p = plat(x.platform), dot = STATUS_DOT[x.status] || 'off';
          return '<button class="cal-item" type="button" data-action="cal-item" data-id="' + x.id + '" style="--pc:' + p.color + '">' +
            '<span class="ci-top"><span>' + esc(p[L()]) + ' · ' + esc(t('p.type.' + x.kind)) + '</span><span>' + esc(fmtTime(x.scheduled_at)) + '</span></span>' +
            '<span class="ci-title">' + esc(pick(x, 'title', 'title_ar')) + '</span>' +
            '<span class="ci-status status-' + dot + '"><span class="dot ' + dot + '"></span>' + esc(statusLabel(x.status)) + '</span>' +
            '</button>';
        }).join('') : '<span class="cal-empty">' + esc(t('p.cal.empty')) + '</span>') +
        '</div>';
    }
    $('cal').innerHTML = html;
    show($('cal-none'), dated.length === 0);
  }

  function kindList(kind, listId, emptyKey) {
    var list = S.items.filter(function (x) { return x.kind === kind; });
    $(listId).innerHTML = list.length ? list.map(apprCard).join('') : '<li class="plate portal-empty">' + esc(t(emptyKey)) + '</li>';
  }
  function renderPackage() {
    var key = planKey(S.client), feats = PKG[key].features;
    ['inbox', 'ads', 'whatsapp'].forEach(function (f) { show($(f), feats.indexOf(f) > -1); });
    var missing = Object.keys(ADDONS).filter(function (f) { return feats.indexOf(f) < 0; });
    show($('addons'), missing.length > 0);
    $('addon-sub').textContent = t('p.addon.sub', { pkg: planName(S.client) });
    $('addon-list').innerHTML = missing.map(function (f) { return '<li><span class="dot off"></span><span>' + esc(t(ADDONS[f])) + '</span></li>'; }).join('');
    $('addon-wa').href = 'https://wa.me/971541668700?text=' + encodeURIComponent(t('wa.general'));
    if (feats.indexOf('inbox') > -1) kindList('reply', 'inbox-list', 'p.inbox.empty');
    if (feats.indexOf('ads') > -1) kindList('ad', 'ads-list', 'p.ads.empty');
  }

  function renderReports() {
    $('rep-list').innerHTML = S.reports.length ? S.reports.map(function (r) {
      var url = safeUrl(r.file_url);
      return '<li><article class="plate report-item"><div><h3>' + esc(pick(r, 'title', 'title_ar')) + '</h3>' +
        (r.period ? '<span class="report-period"><bdi>' + esc(r.period) + '</bdi></span>' : '') + '</div>' +
        (url ? '<a class="btn btn-ghost btn-sm" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(t('p.rep.open')) + '<span class="sr-only"> — ' + esc(pick(r, 'title', 'title_ar')) + '</span></a>'
          : '<span class="report-soon">' + esc(t('p.rep.soon')) + '</span>') +
        '</article></li>';
    }).join('') : '<li class="plate portal-empty">' + esc(t('p.rep.empty')) + '</li>';
  }

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
        '<span class="dot ' + (n.read ? 'off' : 'warn') + '"></span><span><p>' + esc(pick(n, 'title', 'title_ar')) + '</p>' +
        (body ? '<p class="notif-body">' + esc(body) + '</p>' : '') +
        '<small>' + esc(who + ago(n.created_at)) + '</small></span></div></li>';
    }).join('') : '<li class="cal-empty" style="padding:10px">' + esc(t('p.notif.empty')) + '</li>';
  }

  function renderAdmin() {
    show($('admin'), S.isAdmin);
    if (!S.isAdmin) return;
    $('adm-sub').textContent = t('p.adm.sub', { name: cName(S.client) });
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

  function renderBoard() {
    if (!S.client) return;
    renderHeader(); renderSwitcher(); renderHello(); renderKpis(); renderApprovals();
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

  /* ---------- Modal ---------- */
  var modal = $('modal');
  var modalOpen = false;
  function openModal(o) {
    modalOpen = true;
    $('modal-title').textContent = o.title;
    $('modal-body').innerHTML = o.body;
    $('modal-actions').innerHTML = (o.actions || []).map(function (a) {
      if (a.href) return '<a class="btn ' + (a.cls || 'btn-ghost') + ' btn-sm" href="' + esc(a.href) + '" target="_blank" rel="noopener">' + esc(a.label) + '</a>';
      return '<button class="btn ' + (a.cls || 'btn-ghost') + ' btn-sm" type="button" data-action="' + a.action + '"' + (a.id ? ' data-id="' + a.id + '"' : '') + '>' + esc(a.label) + '</button>';
    }).join('');
    if (!modal.open) { if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', ''); }
    var first = modal.querySelector('textarea, .modal-actions .btn');
    if (first) first.focus();
  }
  function closeModal() { modalOpen = false; if (modal.open) { if (typeof modal.close === 'function') modal.close(); else modal.removeAttribute('open'); } }
  modal.addEventListener('close', function () { modalOpen = false; });
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

  function itemDetail(x) {
    var media = safeUrl(x.media_url);
    var acts = [];
    if (x.status === 'needs_approval') {
      acts.push({ action: 'approve', id: x.id, label: t('p.appr.approve'), cls: 'btn-approve' });
      acts.push({ action: 'changes', id: x.id, label: t('p.appr.changes') });
    }
    if (media) acts.push({ href: media, label: t('p.item.media') });
    acts.push({ action: 'modal-close', label: t('p.close') });
    var dot = STATUS_DOT[x.status] || 'off';
    openModal({
      title: pick(x, 'title', 'title_ar'),
      body: '<div class="appr-thumb modal-thumb">' + thumb(x, '-m') + '<span class="type" style="position:relative">' + esc(t('p.type.' + x.kind)) + '</span></div>' +
        '<p class="modal-caption">' + esc(pick(x, 'caption', 'caption_ar')) + '</p>' +
        '<dl class="kv"><dt>' + esc(t('p.item.platform')) + '</dt><dd>' + esc(x.platform ? plat(x.platform)[L()] : '—') + '</dd>' +
        '<dt>' + esc(t('p.item.type')) + '</dt><dd>' + esc(t('p.type.' + x.kind)) + '</dd>' +
        '<dt>' + esc(t('p.item.when')) + '</dt><dd>' + esc(fmtWhen(x.scheduled_at)) + '</dd>' +
        '<dt>' + esc(t('p.item.status')) + '</dt><dd><span class="status-' + dot + '" style="font-weight:700">' + esc(statusLabel(x.status)) + '</span></dd>' +
        (x.client_note ? '<dt>' + esc(t('p.item.note')) + '</dt><dd>' + esc(x.client_note) + '</dd>' : '') + '</dl>',
      actions: acts
    });
  }

  /* ---------- Review (RPC) ---------- */
  function review(x, decision, note) {
    if (S.busy[x.id]) return Promise.resolve();
    S.busy[x.id] = true;
    renderApprovals();
    return sb.rpc('review_item', { p_item: x.id, p_decision: decision, p_note: note || null }).then(function (r) {
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

  /* ---------- Actions ---------- */
  function closeNotif() { $('notif-panel').hidden = true; $('bell').setAttribute('aria-expanded', 'false'); }
  function goTo(id) {
    var el = $(id); if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    var target = el.querySelector('.plate, .approvals') || el;
    target.classList.remove('flash'); void target.offsetWidth; target.classList.add('flash');
  }

  var actions = {
    retry: function () { setState('p.loading', null); loadProfile(); },
    signout: function () { sb.auth.signOut().then(toLogin, toLogin); },
    go: function (el) { goTo(el.getAttribute('data-target')); },
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
      if (x && x.status === 'needs_approval') review(x, 'approved', null);
    },
    changes: function (el) {
      var x = item(el.getAttribute('data-id'));
      if (!x) return;
      openModal({
        title: t('p.ch.title'),
        body: '<label for="ch-note"><strong>' + esc(t('p.ch.label', { title: pick(x, 'title', 'title_ar') })) + '</strong></label>' +
          '<textarea id="ch-note" maxlength="2000" placeholder="' + esc(t('p.ch.ph')) + '"></textarea>' +
          '<div class="toolbar"><span style="font-size:13px;color:var(--muted)">' + esc(t('p.ch.quick')) + '</span>' +
          ['p.ch.q1', 'p.ch.q2', 'p.ch.q3'].map(function (k) { return '<button class="chip" type="button" data-action="quick-pick" data-text="' + esc(t(k)) + '">' + esc(t(k)) + '</button>'; }).join('') +
          '</div><p class="err" id="ch-err" style="color:var(--bad);font-size:13px;margin:0"></p>',
        actions: [
          { action: 'changes-send', id: x.id, label: t('p.ch.send'), cls: 'btn-primary' },
          { action: 'modal-close', label: t('p.close') }
        ]
      });
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
      closeModal();
      if (x.status === 'needs_approval') review(x, 'changes_requested', note);
    }
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
  $('client-switch').addEventListener('change', function (e) {
    var id = e.target.value;
    $('dash').setAttribute('data-state', 'loading');
    selectClient(id).catch(loadError);
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

  Z.onLang(function () {
    if (modalOpen) closeModal();
    if ($('dash').getAttribute('data-state') === 'ready') renderBoard();
    if ($('dash').getAttribute('data-state') === 'password') $('pw-sub').textContent = t('p.pw.sub', { email: (S.user && S.user.email) || '' });
  });

  boot();
})();
