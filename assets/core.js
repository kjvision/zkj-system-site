/* ZKJ SYSTEM — CORE («النواة»): a client's living universe, drawn on Canvas 2D. No libraries.
   Client mode: the client's logo is the sun; their tools orbit as planets, their channels on the outer ring,
   every post / reel / story is a moon around the tool that owns its stage, pending approvals wait on a
   golden gate ring, and each status change sends a glowing packet along a curved path. Published work
   becomes a permanent star in the sky of wins.
   Universe mode (KJ's HQ): the ZKJ cube is the central star; each client is its own solar system.
   Used by app/index.html (portal) and dashboard.html (demo). Data in, callbacks out — no network here. */
(function () {
  'use strict';
  var Z = window.ZKJ;
  var t = Z.t, esc = Z.esc;

  Z.extend({
    en: {
      'core.name': 'CORE', 'core.sub': '{name} — live', 'core.hq': 'ZKJ SYSTEM — every client, live',
      'core.gate': 'Approval gate', 'core.gate.n': '{n} waiting for approval', 'core.gate.0': 'Nothing waiting',
      'core.t.studio': 'Content Studio', 'core.t.publisher': 'Publisher', 'core.t.inbox': 'Inbox Replies', 'core.t.insights': 'Insights',
      'core.t.ads': 'Ads', 'core.t.whatsapp': 'WhatsApp AI', 'core.t.brandkit': 'Brand Kit',
      'core.wins': 'Sky of wins · {n}', 'core.wins.sr': '{n} published pieces in the sky of wins',
      'core.st.ok': 'On track', 'core.st.warn': 'In progress', 'core.st.bad': 'Needs you', 'core.st.off': 'Quiet',
      'core.week': 'This week', 'core.none': 'Nothing here this week.', 'core.close': 'Close', 'core.zoomin': 'Zoom in', 'core.zoomout': 'Zoom out', 'core.reset': 'Reset view',
      'core.list': 'List view', 'core.hint': 'Drag to pan · scroll or pinch to zoom · click a planet', 'core.skip': 'Click to skip',
      'core.open': 'Open', 'core.review': 'Review', 'core.fly': 'Fly into {name}', 'core.kpi': '{v} of {t} views', 'core.items': '{n} items',
      'core.channels': 'Channels', 'core.tools': 'Tools', 'core.clients': 'Clients', 'core.moons': '{n} moons',
      'core.s.draft': 'Draft', 'core.s.needs_approval': 'Waiting for approval', 'core.s.approved': 'Approved', 'core.s.changes_requested': 'Changes requested',
      'core.s.scheduled': 'Scheduled', 'core.s.published': 'Published', 'core.aria': 'CORE: {name}. {tools} tools, {wait} waiting for approval, {wins} published. Use the list view to explore with the keyboard.'
    },
    ar: {
      'core.name': 'النواة', 'core.sub': '{name} — مباشر', 'core.hq': 'ZKJ SYSTEM — كل العملاء مباشرة',
      'core.gate': 'بوابة الموافقة', 'core.gate.n': '{n} بانتظار الموافقة', 'core.gate.0': 'لا شيء بالانتظار',
      'core.t.studio': 'استوديو المحتوى', 'core.t.publisher': 'الناشر', 'core.t.inbox': 'ردود الرسائل', 'core.t.insights': 'التحليلات',
      'core.t.ads': 'الإعلانات', 'core.t.whatsapp': 'واتساب الذكي', 'core.t.brandkit': 'هوية العلامة',
      'core.wins': 'سماء الإنجازات · {n}', 'core.wins.sr': '{n} عمل منشور في سماء الإنجازات',
      'core.st.ok': 'على المسار', 'core.st.warn': 'قيد التنفيذ', 'core.st.bad': 'يحتاجك', 'core.st.off': 'هادئ',
      'core.week': 'هذا الأسبوع', 'core.none': 'لا شيء هنا هذا الأسبوع.', 'core.close': 'إغلاق', 'core.zoomin': 'تكبير', 'core.zoomout': 'تصغير', 'core.reset': 'إعادة العرض',
      'core.list': 'عرض القائمة', 'core.hint': 'اسحب للتحريك · مرّر أو اقرص للتكبير · اضغط على كوكب', 'core.skip': 'اضغط للتخطي',
      'core.open': 'افتح', 'core.review': 'مراجعة', 'core.fly': 'ادخل إلى {name}', 'core.kpi': '{v} من {t} مشاهدة', 'core.items': '{n} عناصر',
      'core.channels': 'القنوات', 'core.tools': 'الأدوات', 'core.clients': 'العملاء', 'core.moons': '{n} أقمار',
      'core.s.draft': 'مسودة', 'core.s.needs_approval': 'بانتظار الموافقة', 'core.s.approved': 'تمت الموافقة', 'core.s.changes_requested': 'طلب تعديل',
      'core.s.scheduled': 'مجدول', 'core.s.published': 'منشور', 'core.aria': 'النواة: {name}. {tools} أدوات، {wait} بانتظار الموافقة، {wins} منشور. استخدم عرض القائمة للتنقل بلوحة المفاتيح.'
    }
  });

  var TAU = Math.PI * 2;
  var reduceMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var COL = { ok: '#3FBF73', warn: '#E0A43A', bad: '#FF6B5E', off: '#7B818B', gold: '#C9A84C', goldL: '#F6E7B4' };
  var STATUS_COL = { draft: COL.off, needs_approval: COL.gold, approved: COL.ok, changes_requested: COL.warn, scheduled: '#7FB7FF', published: '#FFFFFF' };
  function L() { return Z.getLang(); }
  function hash(s) { var h = 2166136261; s = String(s || ''); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
  function hexA(h, a) { var m = /^#?([0-9a-f]{6})$/i.exec(h || ''); if (!m) return 'rgba(201, 168, 76,' + a + ')'; var n = parseInt(m[1], 16); return 'rgba(' + (n >> 16) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
  function ease(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function stageOf(s) { return s === 'draft' || s === 'changes_requested' ? 'studio' : s === 'needs_approval' ? 'gate' : s === 'approved' || s === 'scheduled' ? 'publisher' : s === 'published' ? 'channel' : 'studio'; }

  /* ---- sprite cache: soft glows rendered once, drawn additively ---- */
  var sprites = {};
  function glow(color, a) {
    var k = color + a;
    if (sprites[k]) return sprites[k];
    var c = document.createElement('canvas'); c.width = c.height = 128;
    var g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, hexA(color, a)); r.addColorStop(.25, hexA(color, a * .45)); r.addColorStop(1, hexA(color, 0));
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    return (sprites[k] = c);
  }
  var grainTile = null;
  function grain() {
    if (grainTile) return grainTile;
    var c = document.createElement('canvas'); c.width = c.height = 160;
    var g = c.getContext('2d'), d = g.createImageData(160, 160), r = rng(7);
    for (var i = 0; i < d.data.length; i += 4) { var v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 18; }
    g.putImageData(d, 0, 0);
    return (grainTile = c);
  }
  var imgCache = {};
  function img(url, cb) {
    if (!url) return null;
    if (imgCache[url]) return imgCache[url].ok ? imgCache[url].im : null;
    var im = new Image(); var rec = imgCache[url] = { im: im, ok: false };
    im.decoding = 'async';
    im.onload = function () { rec.ok = true; if (cb) cb(); };
    im.src = url;
    return null;
  }

  /* ---- glyphs for tool planets (drawn in a 20×20 box around 0,0) ---- */
  function glyph(g, id, s) {
    g.save(); g.scale(s, s); g.lineWidth = 1.6; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
    switch (id) {
      case 'studio': g.arc(0, 0, 6.5, 0, TAU); g.moveTo(0, -6.5); g.lineTo(3.2, 1); g.moveTo(5.6, 3.2); g.lineTo(-2, 3.6); g.moveTo(-5.6, 3.2); g.lineTo(-3.2, -3.6); break;
      case 'publisher': g.moveTo(-7, 0); g.lineTo(7, -6); g.lineTo(2, 7); g.lineTo(0, 1); g.closePath(); g.moveTo(0, 1); g.lineTo(7, -6); break;
      case 'inbox': g.moveTo(-7, -5); g.lineTo(7, -5); g.lineTo(7, 3); g.lineTo(-1, 3); g.lineTo(-5, 7); g.lineTo(-5, 3); g.lineTo(-7, 3); g.closePath(); break;
      case 'insights': g.moveTo(-6, 6); g.lineTo(-6, 0); g.moveTo(-2, 6); g.lineTo(-2, -5); g.moveTo(2, 6); g.lineTo(2, -1); g.moveTo(6, 6); g.lineTo(6, -7); break;
      case 'ads': g.moveTo(-7, -2); g.lineTo(-7, 3); g.lineTo(-3, 3); g.lineTo(4, 7); g.lineTo(4, -6); g.lineTo(-3, -2); g.closePath(); break;
      case 'whatsapp': g.arc(0, 0, 6.5, .6, TAU - .2); g.lineTo(-6, 7); g.lineTo(-4.6, 4); break;
      case 'brandkit': g.moveTo(0, -7); g.lineTo(7, 0); g.lineTo(0, 7); g.lineTo(-7, 0); g.closePath(); g.moveTo(0, -3); g.lineTo(3, 0); g.lineTo(0, 3); g.lineTo(-3, 0); g.closePath(); break;
    }
    g.stroke(); g.restore();
  }
  var CHANNEL_COL = { threads: '#E8E8E8', instagram: '#E1306C', tiktok: '#25C2C9', snapchat: '#E8D90C', whatsapp: '#25D366', google: '#34A853', youtube: '#FF3B30', facebook: '#1877F2', x: '#8B95A1', linkedin: '#0A66C2', pinterest: '#D5243A', meta: '#1877F2' };
  var TOOL_ORDER = ['studio', 'publisher', 'inbox', 'insights', 'ads', 'whatsapp', 'brandkit'];

  function Core(host, opts) {
    this.host = host; this.o = opts || {};
    this.mode = this.o.mode || 'client';
    this.data = null; this.prev = null; this.ents = {}; this.hits = [];
    this.comets = []; this.bursts = []; this.shooting = []; this.fired = 0; this.frames = 0;
    this.cam = { x: 0, y: 0, z: 1, tx: 0, ty: 0, tz: 1 }; this.fit = 1; this.sel = null; this.hover = null;
    this.time = 0; this.last = 0; this.running = false; this.dirty = true;
    this.mobile = window.matchMedia && window.matchMedia('(max-width: 699px)').matches;
    this.reduce = reduceMQ.matches;
    this.build();
  }
  var P = Core.prototype;

  P.build = function () {
    var self = this, h = this.host;
    h.classList.add('core-host');
    h.innerHTML =
      '<canvas class="core-canvas" role="img"></canvas>' +
      '<div class="core-hud">' +
      '<div class="core-title"><span class="core-badge">' + esc(t('core.name')) + '</span><strong class="core-name"></strong></div>' +
      '<div class="core-wins mono"></div>' +
      '</div>' +
      '<div class="core-controls" role="group">' +
      '<button type="button" class="core-btn" data-c="in" aria-label="' + esc(t('core.zoomin')) + '">+</button>' +
      '<button type="button" class="core-btn" data-c="out" aria-label="' + esc(t('core.zoomout')) + '">−</button>' +
      '<button type="button" class="core-btn" data-c="reset" aria-label="' + esc(t('core.reset')) + '">⟲</button>' +
      '<button type="button" class="core-btn wide" data-c="list" aria-expanded="false">' + esc(t('core.list')) + '</button>' +
      '</div>' +
      '<p class="core-hint">' + esc(t('core.hint')) + '</p>' +
      '<div class="core-tip" role="tooltip" hidden></div>' +
      '<aside class="core-panel" hidden aria-live="polite"></aside>' +
      '<nav class="core-list" aria-label="' + esc(t('core.list')) + '"></nav>' +
      '<div class="core-warp" hidden><span>' + esc(t('core.skip')) + '</span></div>';
    this.cv = h.querySelector('canvas'); this.g = this.cv.getContext('2d', { alpha: false });
    this.tip = h.querySelector('.core-tip'); this.panel = h.querySelector('.core-panel'); this.list = h.querySelector('.core-list');
    h.querySelector('.core-controls').addEventListener('click', function (e) {
      var b = e.target.closest('[data-c]'); if (!b) return;
      var c = b.getAttribute('data-c');
      if (c === 'in') self.zoomBy(1.35); if (c === 'out') self.zoomBy(1 / 1.35); if (c === 'reset') self.home();
      if (c === 'list') { var open = !h.classList.contains('list-open'); h.classList.toggle('list-open', open); b.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    });
    this.panel.addEventListener('click', function (e) {
      var b = e.target.closest('[data-core-item]'); if (b) { self.emitItem(b.getAttribute('data-core-item')); return; }
      var f = e.target.closest('[data-core-fly]'); if (f) { self.flyInto(f.getAttribute('data-core-fly')); return; }
      if (e.target.closest('[data-core-close]')) self.home();
    });
    this.list.addEventListener('click', function (e) {
      var b = e.target.closest('[data-core-item]'); if (b) { self.emitItem(b.getAttribute('data-core-item')); return; }
      var f = e.target.closest('[data-core-fly]'); if (f) { self.flyInto(f.getAttribute('data-core-fly')); return; }
      var s = e.target.closest('[data-core-sel]'); if (s) self.select(s.getAttribute('data-core-sel'));
    });
    this.bindPointer();
    this.onResize = function () { self.resize(); };
    window.addEventListener('resize', this.onResize);
    this.onVis = function () { if (document.hidden) self.stop(); else if (self.active) self.start(); };
    document.addEventListener('visibilitychange', this.onVis);
    reduceMQ.addEventListener && reduceMQ.addEventListener('change', function () { self.reduce = reduceMQ.matches; self.start(); });
    this.onKey = function (e) {
      if (!self.active) return;
      if (e.key === 'Escape' && (self.sel || self.cam.tz > self.fit * 1.05)) { if (!document.querySelector('dialog[open]')) { self.home(); } }
      if (self.warp) self.warp.t = 1;
    };
    document.addEventListener('keydown', this.onKey);
  };

  P.emitItem = function (id) { var x = this.itemById(id); if (x && this.o.onItem) this.o.onItem(x); };
  P.itemById = function (id) {
    var d = this.data; if (!d) return null;
    if (this.mode === 'client') { for (var i = 0; i < d.items.length; i++) if (d.items[i].id === id) return d.items[i]; return null; }
    for (var c = 0; c < d.clients.length; c++) for (var j = 0; j < d.clients[c].items.length; j++) if (d.clients[c].items[j].id === id) return d.clients[c].items[j];
    return null;
  };

  /* ---------- data ---------- */
  P.update = function (data) {
    var first = !this.data;
    var prevMap = {};
    var all = function (d) { return !d ? [] : d.items ? d.items : d.clients.reduce(function (a, c) { return a.concat(c.items.map(function (x) { x._client = c.id; return x; })); }, []); };
    all(this.data).forEach(function (x) { prevMap[x.id] = x.status; });
    this.data = data;
    this.layout();
    var self = this;
    if (!first) {
      all(data).forEach(function (x) {
        var was = prevMap[x.id];
        if (was === undefined) self.flow(x, null, x.status);
        else if (was !== x.status) self.flow(x, was, x.status);
      });
    } else if (this.mode === 'universe') {
      this.replay();
    }
    this.renderList();
    if (this.sel) this.showPanel(this.sel);
    this.cv.setAttribute('aria-label', this.ariaText());
    this.dirty = true;
    if (this.reduce) this.frame(this.last || 0);
  };
  P.ariaText = function () {
    var d = this.data;
    if (this.mode === 'universe') return t('core.hq') + ' — ' + d.clients.map(function (c) { return c.name; }).join(', ');
    var wait = d.items.filter(function (x) { return x.status === 'needs_approval'; }).length;
    return t('core.aria', { name: d.name, tools: this.tools.length, wait: wait, wins: d.wins || 0 });
  };

  P.layout = function () {
    var d = this.data, ents = {}, self = this;
    var r0 = this.host.getBoundingClientRect();
    if (r0.width > 0) this.ky = r0.height > r0.width * 1.2 ? 1.7 : .82; // tall phone screens: orbits stand upright
    else this.ky = this.ky || .82;
    if (this.mode === 'client') {
      var feats = d.features || [];
      this.tools = TOOL_ORDER.filter(function (id) { return ['studio', 'publisher', 'insights', 'brandkit'].indexOf(id) > -1 || feats.indexOf(id) > -1; });
      this.channels = (d.channels && d.channels.length ? d.channels : ['instagram']).slice(0, 12);
      ents.sun = { id: 'sun', type: 'sun', r: 46, color: d.primary || COL.gold, accent: d.accent || COL.goldL, label: d.name, logo: d.logo };
      ents.gate = { id: 'gate', type: 'gate', r: 98 };
      this.tools.forEach(function (id, i) {
        var items = d.items.filter(function (x) { return self.ownerTool(x) === id; });
        ents['t:' + id] = { id: 't:' + id, type: 'tool', tool: id, r: 19, base: (i + .5) / self.tools.length * TAU - Math.PI / 2, orbit: 205, w: .022, status: self.toolStatus(id), items: items };
      });
      this.channels.forEach(function (ch, i) {
        ents['c:' + ch] = { id: 'c:' + ch, type: 'channel', ch: ch, r: 15, base: i / self.channels.length * TAU + .4, orbit: 330, w: -.011, color: CHANNEL_COL[ch] || '#9AA0A6' };
      });
      // moons: item → its current stage owner
      var counts = {};
      d.items.forEach(function (x) {
        if (x.status === 'published') return; // published work becomes a star in the sky of wins
        var owner = self.ownerOf(x);
        if (!ents[owner]) return;
        var n = counts[owner] = (counts[owner] || 0) + 1;
        ents['m:' + x.id] = { id: 'm:' + x.id, type: 'moon', item: x, owner: owner, idx: n - 1, r: owner === 'gate' ? 6.5 : 4.2 };
      });
      // sky of wins
      var r = rng(hash(d.name));
      this.wins = (d.published || []).map(function (x) { var a = (hash(x.id) % 1000) / 1000 * TAU, rad = 255 + (hash(x.id + 'r') % 140); return { x: Math.cos(a) * rad * 1.25, y: Math.sin(a) * rad * self.ky, s: .6 + r() * .9, ph: r() * TAU, id: x.id }; });
      this.extent = 350;
    } else {
      ents.sun = { id: 'sun', type: 'hq', r: 46, color: COL.gold, accent: COL.goldL, label: 'ZKJ SYSTEM', logo: d.logo };
      d.clients.forEach(function (c, i) {
        ents['s:' + c.id] = { id: 's:' + c.id, type: 'system', client: c, r: 30, base: i / d.clients.length * TAU - Math.PI / 2, orbit: 250, w: .012, color: c.primary || COL.gold };
        c.items.forEach(function (x, j) { ents['m:' + x.id] = { id: 'm:' + x.id, type: 'umoon', item: x, owner: 's:' + c.id, idx: j, r: x.status === 'needs_approval' ? 4 : 3 }; });
      });
      this.wins = [];
      d.clients.forEach(function (c) { (c.published || []).forEach(function (x) { var a = (hash(x.id) % 1000) / 1000 * TAU, rad = 300 + (hash(x.id + 'r') % 120); self.wins.push({ x: Math.cos(a) * rad * 1.2, y: Math.sin(a) * rad * self.ky, s: .7, ph: hash(x.id) % 7, id: x.id }); }); });
      this.extent = 330;
    }
    this.ents = ents;
    this.resize();
  };
  P.ownerTool = function (x) {
    if (x.kind === 'reply') return 'inbox';
    if (x.kind === 'ad') return this.tools.indexOf('ads') > -1 ? 'ads' : 'publisher';
    var s = stageOf(x.status);
    return s === 'studio' ? 'studio' : s === 'publisher' ? 'publisher' : s === 'channel' ? 'insights' : 'studio';
  };
  P.ownerOf = function (x) {
    if (x.kind === 'reply') return 't:inbox';
    var s = stageOf(x.status);
    if (s === 'gate') return 'gate';
    if (s === 'channel') return 'c:' + (this.channels.indexOf(x.platform) > -1 ? x.platform : this.channels[0]);
    if (x.kind === 'ad' && this.tools.indexOf('ads') > -1 && s === 'publisher') return 't:ads';
    return 't:' + (s === 'publisher' ? 'publisher' : 'studio');
  };
  P.toolStatus = function (id) {
    var items = this.data.items;
    var any = function (f) { return items.some(f); };
    if (id === 'studio') return any(function (x) { return x.status === 'changes_requested'; }) ? 'warn' : any(function (x) { return x.status === 'draft'; }) ? 'warn' : 'ok';
    if (id === 'publisher') return any(function (x) { return x.status === 'approved' || x.status === 'scheduled'; }) ? 'ok' : 'off';
    if (id === 'inbox') return any(function (x) { return x.kind === 'reply' && x.status === 'needs_approval'; }) ? 'bad' : 'ok';
    if (id === 'ads') return any(function (x) { return x.kind === 'ad'; }) ? 'ok' : 'off';
    if (id === 'insights') return (this.data.wins || 0) > 0 ? 'ok' : 'off';
    return 'ok';
  };

  /* ---------- positions (world space) ---------- */
  P.pos = function (e) {
    if (!e) return { x: 0, y: 0 };
    var T = this.time;
    switch (e.type) {
      case 'sun': case 'hq': case 'gate': return { x: 0, y: 0 };
      case 'tool': case 'channel': case 'system':
        var a = e.base + T * e.w, sq = this.ky > 1 ? .58 : 1; return { x: Math.cos(a) * e.orbit * sq, y: Math.sin(a) * e.orbit * this.ky * sq };
      case 'moon':
        if (e.owner === 'gate') {
          var n = this.countAt('gate'), ga = -Math.PI / 2 + (e.idx / Math.max(1, n)) * TAU + T * .06;
          return { x: Math.cos(ga) * this.ents.gate.r, y: Math.sin(ga) * this.ents.gate.r };
        }
        var o = this.pos(this.ents[e.owner]), rr = (this.ents[e.owner].r || 12) + 12 + (e.idx % 4) * 6, ma = e.idx * 2.39 + T * (.5 / (1 + (e.idx % 4) * .35));
        return { x: o.x + Math.cos(ma) * rr, y: o.y + Math.sin(ma) * rr * .8 };
      case 'umoon':
        var s = this.pos(this.ents[e.owner]), ur = 44 + (e.idx % 3) * 9, ua = e.idx * 2.1 + T * (.45 / (1 + (e.idx % 3) * .3));
        return { x: s.x + Math.cos(ua) * ur, y: s.y + Math.sin(ua) * ur * .8 };
    }
    return { x: 0, y: 0 };
  };
  P.countAt = function (owner) { var n = 0, E = this.ents; for (var k in E) if (E[k].owner === owner) n++; return n; };
  P.toScreen = function (p) { return { x: this.W / 2 + (p.x - this.cam.x) * this.cam.z, y: this.H / 2 + (p.y - this.cam.y) * this.cam.z }; };
  P.toWorld = function (sx, sy) { return { x: (sx - this.W / 2) / this.cam.z + this.cam.x, y: (sy - this.H / 2) / this.cam.z + this.cam.y }; };

  /* ---------- flows (status changes) ---------- */
  P.nodeFor = function (x, status) {
    if (this.mode === 'universe') return null;
    var s = stageOf(status);
    if (x.kind === 'reply') return this.ents['t:inbox'];
    if (s === 'gate') return this.ents.gate;
    if (s === 'channel') return this.ents['c:' + (this.channels.indexOf(x.platform) > -1 ? x.platform : this.channels[0])];
    return this.ents['t:' + (s === 'publisher' ? (x.kind === 'ad' && this.ents['t:ads'] ? 'ads' : 'publisher') : 'studio')];
  };
  P.flow = function (x, from, to) {
    if (this.mode === 'universe') {
      var sys = this.ents['s:' + x._client], hq = this.ents.sun;
      if (!sys) return;
      var toHQ = to === 'approved' || to === 'changes_requested';
      this.comet(toHQ ? sys : hq, toHQ ? hq : sys, STATUS_COL[to] || COL.gold, { id: x.id });
      return;
    }
    var a = from ? this.nodeFor(x, from) : this.ents.sun, b = this.nodeFor(x, to);
    if (!b) return;
    var col = to === 'approved' || to === 'scheduled' ? COL.ok : to === 'changes_requested' ? COL.warn : to === 'published' ? '#FFFFFF' : COL.goldL;
    this.comet(a || this.ents.sun, b, col, { id: x.id, approved: from === 'needs_approval' && to === 'approved', published: to === 'published' });
    if (from === 'needs_approval' && to === 'approved') { this.burst(this.pos(this.ents['m:' + x.id] || this.ents.gate), COL.goldL, 34); this.shoot(); }
  };
  P.comet = function (a, b, color, meta) {
    this.fired++;
    var dist = Math.hypot(this.pos(a).x - this.pos(b).x, this.pos(a).y - this.pos(b).y);
    this.comets.push({ a: a, b: b, t: 0, dur: clamp(.9 + dist / 260, 1.1, 2.4), color: color, trail: [], bend: (hash(meta && meta.id) % 2 ? 1 : -1) * (.28 + (hash((meta && meta.id) + 'b') % 20) / 100), meta: meta || {} });
    if (this.reduce) { this.comets.length = 0; this.dirty = true; }
  };
  P.burst = function (p, color, n) {
    if (this.reduce) return;
    var parts = [];
    for (var i = 0; i < n; i++) { var a = i / n * TAU + Math.random() * .2, v = 40 + Math.random() * 90; parts.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v }); }
    this.bursts.push({ parts: parts, t: 0, color: color, ring: { x: p.x, y: p.y } });
  };
  P.shoot = function () {
    if (this.reduce) return;
    var y = -this.H * (.15 + Math.random() * .25), x0 = -this.W * (.6 + Math.random() * .3);
    this.shooting.push({ x: x0, y: y, vx: 900 + Math.random() * 300, vy: 260 + Math.random() * 120, t: 0 });
  };
  // universe: replay recent activity so HQ feels alive
  P.replay = function () {
    var self = this, d = this.data, events = [];
    d.clients.forEach(function (c) { c.items.forEach(function (x) { if (x.recent) events.push({ x: x, c: c }); }); });
    events.forEach(function (ev, i) { setTimeout(function () { if (!self.data) return; ev.x._client = ev.c.id; self.flow(ev.x, 'needs_approval', ev.x.status); }, 900 + i * 1400); });
    clearInterval(this.ambientTimer);
    if (!this.reduce) this.ambientTimer = setInterval(function () {
      if (!self.active || document.hidden || !self.data) return;
      var withPending = self.data.clients.filter(function (c) { return c.items.some(function (x) { return x.status === 'needs_approval'; }); });
      if (!withPending.length) return;
      var c = withPending[Math.floor(Math.random() * withPending.length)];
      self.comet(self.ents.sun, self.ents['s:' + c.id], COL.goldL, { id: 'amb' + Date.now(), ambient: true });
    }, 5200);
  };

  /* ---------- camera ---------- */
  P.resize = function () {
    var r = this.host.getBoundingClientRect();
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    if (r.width > 0 && this.data) { var nk = r.height > r.width * 1.2 ? 1.7 : .82; if (nk !== this.ky) { this.ky = nk; this.layout(); return; } }
    this.W = Math.max(1, r.width); this.H = Math.max(1, r.height); this.dpr = dpr;
    this.cv.width = Math.round(this.W * dpr); this.cv.height = Math.round(this.H * dpr);
    this.cv.style.width = this.W + 'px'; this.cv.style.height = this.H + 'px';
    var ky = this.ky || .82, sq = ky > 1 ? .58 : 1, ext = (this.extent || 380) * sq;
    /* keep the universe clear of the arc dock that rises over the bottom of the stage */
    this.inset = 0; // the dock auto-hides now: the universe gets the full height
    var fit = Math.min(this.W / (2 * ext * 1.08), (this.H - this.inset) / (2 * ext * Math.max(.86, ky) * 1.04));
    var wasHome = Math.abs(this.cam.tz - this.fit) < 1e-6 || !this.fit;
    this.fit = fit;
    if (wasHome && !this.sel) { this.cam.tz = fit; this.cam.tx = 0; this.cam.ty = this.homeY(); if (!this.started) { this.cam.z = fit; this.cam.y = this.cam.ty; } }
    this.makeStars();
    this.nebula = null; this.overlay = null;
    this.dirty = true;
  };
  P.makeStars = function () {
    var n = this.mobile ? .4 : 1, area = this.W * this.H / (1440 * 900), r = rng(42);
    this.layers = [[.04, 260], [.1, 140], [.22, 60]].map(function (L, i) {
      var arr = [], count = Math.round(L[1] * n * Math.max(.6, area));
      for (var k = 0; k < count; k++) arr.push({ x: r(), y: r(), s: (i + 1) * .5 + r() * .7, a: .25 + r() * .6, ph: r() * TAU, tw: .5 + r() * 2 });
      return { f: L[0], stars: arr };
    });
  };
  P.homeY = function () { return this.inset && this.fit ? this.inset / (2 * this.fit) : 0; };
  P.home = function () { this.sel = null; this.panel.hidden = true; this.cam.tx = 0; this.cam.ty = this.homeY(); this.cam.tz = this.fit; this.dirty = true; if (this.reduce) this.snap(); };
  P.zoomBy = function (k, sx, sy) {
    var z0 = this.cam.tz, z1 = clamp(z0 * k, this.fit * .6, this.fit * 3.2);
    if (sx !== undefined) { var w = this.toWorld(sx, sy); this.cam.tx = w.x - (sx - this.W / 2) / z1; this.cam.ty = w.y - (sy - this.H / 2) / z1; }
    this.cam.tz = z1; this.dirty = true; if (this.reduce) this.snap();
  };
  P.snap = function () { this.cam.x = this.cam.tx; this.cam.y = this.cam.ty; this.cam.z = this.cam.tz; this.frame(this.last || 0); };
  P.select = function (id) {
    var e = this.ents[id]; if (!e) return;
    this.sel = id;
    var p = this.pos(e);
    this.cam.tx = p.x + (this.W > 700 ? 90 / (this.fit * 2) * (L() === 'ar' ? -1 : 1) : 0); this.cam.ty = p.y + (this.W > 700 ? 0 : 60 / this.fit);
    this.cam.tz = clamp(this.fit * (e.type === 'gate' ? 1.7 : 2.1), this.fit, this.fit * 3.2);
    this.showPanel(id);
    this.dirty = true; if (this.reduce) this.snap();
  };
  P.flyInto = function (id) {
    var e = this.ents['s:' + id]; if (!e) return;
    var self = this, p = this.pos(e);
    this.cam.tx = p.x; this.cam.ty = p.y; this.cam.tz = this.fit * 3.2; this.flying = true;
    setTimeout(function () { self.flying = false; if (self.o.onOpenClient) self.o.onOpenClient(id); }, this.reduce ? 0 : 750);
  };

  /* ---------- panel + list (DOM) ---------- */
  P.itemsFor = function (id) {
    var e = this.ents[id], d = this.data; if (!e) return [];
    if (e.type === 'tool') { var tool = e.tool; return d.items.filter(function (x) { return x.kind === 'reply' ? tool === 'inbox' : tool === 'studio' ? stageOf(x.status) === 'studio' : tool === 'publisher' ? stageOf(x.status) === 'publisher' : tool === 'insights' ? x.status === 'published' : tool === 'ads' ? x.kind === 'ad' : false; }); }
    if (e.type === 'gate') return d.items.filter(function (x) { return x.status === 'needs_approval'; });
    if (e.type === 'channel') return d.items.filter(function (x) { return x.platform === e.ch && x.status !== 'draft'; });
    if (e.type === 'system') return e.client.items;
    return [];
  };
  P.labelOf = function (e) {
    if (e.type === 'tool') return t('core.t.' + e.tool);
    if (e.type === 'gate') return t('core.gate');
    if (e.type === 'channel') return (this.o.platformName ? this.o.platformName(e.ch) : e.ch);
    if (e.type === 'system') return e.client.name;
    if (e.type === 'sun' || e.type === 'hq') return e.label;
    if (e.type === 'moon' || e.type === 'umoon') return e.item.title;
    return '';
  };
  P.itemRow = function (x) {
    return '<li><button type="button" data-core-item="' + esc(x.id) + '"><i style="background:' + (STATUS_COL[x.status] || '#888') + '"></i><span>' + esc(x.title) + '</span><small>' + esc(t('core.s.' + x.status)) + (x.when ? ' · ' + esc(x.when) : '') + '</small></button></li>';
  };
  P.showPanel = function (id) {
    var e = this.ents[id]; if (!e) { this.panel.hidden = true; return; }
    var items = this.itemsFor(id), head, extra = '';
    if (e.type === 'tool') head = '<span class="cp-status" data-s="' + e.status + '">' + esc(t('core.st.' + e.status)) + '</span>';
    else if (e.type === 'gate') head = '<span class="cp-status" data-s="' + (items.length ? 'bad' : 'ok') + '">' + esc(items.length ? t('core.gate.n', { n: items.length }) : t('core.gate.0')) + '</span>';
    else if (e.type === 'system') { head = '<span class="cp-status" data-s="ok">' + esc(e.client.tag || '') + '</span>'; extra = '<button type="button" class="cp-fly" data-core-fly="' + esc(e.client.id) + '">' + esc(t('core.fly', { name: e.client.name })) + '</button>'; }
    else head = '';
    this.panel.innerHTML = '<button type="button" class="cp-close" data-core-close aria-label="' + esc(t('core.close')) + '">×</button>' +
      '<span class="cp-eyebrow">' + esc(t('core.week')) + '</span><h3>' + esc(this.labelOf(e)) + '</h3>' + head + extra +
      (items.length ? '<ul class="cp-items">' + items.slice(0, 12).map(this.itemRow).join('') + '</ul>' : '<p class="cp-none">' + esc(t('core.none')) + '</p>');
    this.panel.hidden = false;
  };
  P.renderList = function () {
    var d = this.data, self = this, html;
    if (this.mode === 'universe') {
      html = '<h3>' + esc(t('core.clients')) + '</h3><ul>' + d.clients.map(function (c) {
        return '<li><button type="button" data-core-fly="' + esc(c.id) + '"><i style="background:' + esc(c.primary || COL.gold) + '"></i><span>' + esc(c.name) + '</span><small>' + esc(t('core.items', { n: c.items.length })) + '</small></button></li>';
      }).join('') + '</ul>';
    } else {
      var gate = d.items.filter(function (x) { return x.status === 'needs_approval'; });
      html = '<h3>' + esc(t('core.gate')) + '</h3>' + (gate.length ? '<ul>' + gate.map(this.itemRow).join('') + '</ul>' : '<p>' + esc(t('core.gate.0')) + '</p>') +
        '<h3>' + esc(t('core.tools')) + '</h3><ul>' + this.tools.map(function (id) {
          var e = self.ents['t:' + id];
          return '<li><button type="button" data-core-sel="t:' + id + '"><i style="background:' + COL[e.status] + '"></i><span>' + esc(t('core.t.' + id)) + '</span><small>' + esc(t('core.st.' + e.status)) + ' · ' + esc(t('core.moons', { n: self.itemsFor('t:' + id).length })) + '</small></button></li>';
        }).join('') + '</ul>' +
        '<h3>' + esc(t('core.channels')) + '</h3><ul>' + this.channels.map(function (ch) {
          return '<li><button type="button" data-core-sel="c:' + ch + '"><i class="li-pg" style="color:' + (CHANNEL_COL[ch] || '#999') + '">' + (window.ZDEV ? window.ZDEV.pglyph(ch) : '') + '</i><span>' + esc(self.o.platformName ? self.o.platformName(ch) : ch) + '</span></button></li>';
        }).join('') + '</ul><p class="mono">' + esc(t('core.wins.sr', { n: d.wins || 0 })) + '</p>';
    }
    this.list.innerHTML = html;
    var nm = this.host.querySelector('.core-name');
    nm.textContent = this.mode === 'universe' ? t('core.hq') : t('core.sub', { name: d.name });
    this.host.querySelector('.core-wins').textContent = t('core.wins', { n: this.mode === 'universe' ? this.wins.length : (d.wins || 0) });
  };

  /* ---------- pointer ---------- */
  P.bindPointer = function () {
    var self = this, cv = this.cv, pts = {}, drag = null, pinch = null, moved = 0;
    cv.addEventListener('pointerdown', function (e) {
      if (self.warp) { self.warp.t = 1; return; }
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      try { cv.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
      var ids = Object.keys(pts);
      if (ids.length === 1) { drag = { x: e.clientX, y: e.clientY, cx: self.cam.tx, cy: self.cam.ty }; moved = 0; }
      if (ids.length === 2) { var a = pts[ids[0]], b = pts[ids[1]]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: self.cam.tz }; drag = null; }
    });
    cv.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
      if (pts[e.pointerId]) pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pts);
      if (pinch && ids.length === 2) { var a = pts[ids[0]], b = pts[ids[1]]; self.cam.tz = clamp(pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d, self.fit * .6, self.fit * 3.2); self.dirty = true; if (self.reduce) self.snap(); return; }
      if (drag) {
        var dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
        if (moved > 4) { self.cam.tx = drag.cx - dx / self.cam.z; self.cam.ty = drag.cy - dy / self.cam.z; self.dirty = true; if (self.reduce) self.snap(); cv.style.cursor = 'grabbing'; }
        return;
      }
      var h = self.hit(sx, sy);
      self.setHover(h, sx, sy);
    });
    function up(e) {
      delete pts[e.pointerId];
      if (Object.keys(pts).length < 2) pinch = null;
      cv.style.cursor = '';
      if (drag && moved <= 4) {
        var r = cv.getBoundingClientRect(), h = self.hit(e.clientX - r.left, e.clientY - r.top);
        self.click(h);
      }
      drag = null;
    }
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', function (e) { delete pts[e.pointerId]; drag = null; pinch = null; });
    cv.addEventListener('pointerleave', function () { self.setHover(null); });
    cv.addEventListener('dblclick', function () { self.home(); });
    cv.addEventListener('wheel', function (e) { e.preventDefault(); var r = cv.getBoundingClientRect(); self.zoomBy(Math.exp(-e.deltaY * .0015), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  };
  P.hit = function (sx, sy) {
    for (var i = this.hits.length - 1; i >= 0; i--) { var h = this.hits[i]; if (Math.hypot(sx - h.x, sy - h.y) <= h.r) return h.e; }
    return null;
  };
  P.setHover = function (e, sx, sy) {
    this.hover = e ? e.id : null;
    this.cv.style.cursor = e ? 'pointer' : '';
    if (!e || e.type === 'sun' && this.mode === 'client' && !this.data) { this.tip.hidden = true; return; }
    var line = '';
    if (e.type === 'tool') line = t('core.st.' + e.status) + ' · ' + t('core.moons', { n: this.itemsFor(e.id).length });
    else if (e.type === 'moon' || e.type === 'umoon') line = t('core.s.' + e.item.status) + (e.item.when ? ' · ' + e.item.when : '') + (e.item.client ? ' · ' + e.item.client : '');
    else if (e.type === 'gate') line = t('core.gate.n', { n: this.itemsFor('gate').length });
    else if (e.type === 'system') line = t('core.items', { n: e.client.items.length }) + ' · ' + (e.client.tag || '');
    else if (e.type === 'sun' && this.data.kpi) line = t('core.kpi', { v: this.data.kpi.v, t: this.data.kpi.t });
    this.tip.innerHTML = '<strong>' + esc(this.labelOf(e)) + '</strong>' + (line ? '<span>' + esc(line) + '</span>' : '');
    this.tip.hidden = false;
    var w = this.tip.offsetWidth, x = clamp(sx + 14, 8, this.W - w - 8), y = clamp(sy + 14, 8, this.H - 60);
    this.tip.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  };
  P.click = function (e) {
    if (!e) { if (this.sel) this.home(); return; }
    if (e.type === 'moon' || e.type === 'umoon') { this.emitItem(e.item.id); return; }
    if (e.type === 'system') { this.select(e.id); return; }
    if (e.type === 'sun' && this.mode === 'universe') { this.home(); return; }
    if (e.type === 'sun') { this.select('gate'); return; }
    if (e.type === 'tool' || e.type === 'gate' || e.type === 'channel') this.select(e.id);
  };

  /* ---------- loop ---------- */
  P.mount = function () {
    this.active = true;
    var key = 'zkj-core-warp-' + this.mode, seen = false;
    try { seen = !!window.sessionStorage.getItem(key); window.sessionStorage.setItem(key, '1'); } catch (e) { seen = true; }
    if (!seen && !this.reduce) { this.warp = { t: 0 }; this.host.querySelector('.core-warp').hidden = false; this.cam.z = this.fit * .25; }
    this.resize();
    this.start();
  };
  P.unmount = function () { this.active = false; this.stop(); this.tip.hidden = true; };
  P.start = function () {
    if (!this.active || document.hidden) return;
    if (this.reduce) { this.stop(); this.warp = null; this.host.querySelector('.core-warp').hidden = true; this.snap(); return; }
    if (this.running) return;
    this.running = true;
    var self = this;
    var tick = function (ts) {
      if (!self.running) return;
      self.raf = requestAnimationFrame(tick);
      self.frame(ts);
    };
    this.raf = requestAnimationFrame(tick);
  };
  P.stop = function () { this.running = false; if (this.raf) cancelAnimationFrame(this.raf); };
  P.destroy = function () { this.unmount(); clearInterval(this.ambientTimer); window.removeEventListener('resize', this.onResize); document.removeEventListener('visibilitychange', this.onVis); document.removeEventListener('keydown', this.onKey); this.host.innerHTML = ''; };

  P.frame = function (ts) {
    var dt = this.last && ts > this.last ? Math.min(.05, (ts - this.last) / 1000) : 1 / 60;
    if (this.reduce) dt = 0;
    this.last = ts; this.time += dt; this.frames++; this.started = true;
    if (this.warp) {
      this.warp.t = Math.min(1, this.warp.t + dt / 1.5);
      this.cam.z = this.fit * (.25 + .75 * ease(this.warp.t));
      if (this.warp.t >= 1) { this.warp = null; this.host.querySelector('.core-warp').hidden = true; }
    } else {
      var k = this.reduce ? 1 : 1 - Math.pow(.0009, dt);
      this.cam.x += (this.cam.tx - this.cam.x) * k; this.cam.y += (this.cam.ty - this.cam.y) * k; this.cam.z += (this.cam.tz - this.cam.z) * k;
    }
    if (this.sel && !this.reduce) { var se = this.ents[this.sel]; if (se) { var p = this.pos(se); this.cam.tx += (p.x + (this.W > 700 ? (L() === 'ar' ? -1 : 1) * 160 / this.cam.z : 0) - this.cam.tx) * .08; this.cam.ty += (p.y + (this.W > 700 ? 0 : 70 / this.cam.z) - this.cam.ty) * .08; } }
    this.draw(dt);
  };

  /* ---------- drawing ---------- */
  P.makeNebula = function () {
    var size = Math.ceil(Math.max(this.W, this.H) * 1.3), c = document.createElement('canvas');
    c.width = c.height = Math.min(1600, size);
    var g = c.getContext('2d'), s = c.width, d = this.data || {}, prim = d.primary || COL.gold, acc = d.accent || COL.goldL;
    var r1 = g.createRadialGradient(s * .38, s * .42, 0, s * .38, s * .42, s * .5); r1.addColorStop(0, hexA(prim, .16)); r1.addColorStop(1, hexA(prim, 0));
    var r2 = g.createRadialGradient(s * .66, s * .62, 0, s * .66, s * .62, s * .42); r2.addColorStop(0, hexA(acc, .1)); r2.addColorStop(1, hexA(acc, 0));
    var r3 = g.createRadialGradient(s * .5, s * .5, 0, s * .5, s * .5, s * .5); r3.addColorStop(0, 'rgba(90,70,160,.07)'); r3.addColorStop(1, 'rgba(90,70,160,0)');
    g.fillStyle = r3; g.fillRect(0, 0, s, s); g.fillStyle = r1; g.fillRect(0, 0, s, s); g.fillStyle = r2; g.fillRect(0, 0, s, s);
    var coverA = this.mobile ? .07 : .1, cover = d.covers && d.covers[0], im = cover && img(cover, (function (self) { return function () { self.nebula = null; self.dirty = true; if (self.reduce) self.frame(self.last); }; })(this));
    if (im) {
      g.save(); g.globalAlpha = coverA; g.globalCompositeOperation = 'screen';
      var sc = Math.max(s / im.width, s / im.height); g.drawImage(im, (s - im.width * sc) / 2, (s - im.height * sc) / 2, im.width * sc, im.height * sc);
      g.restore();
      var v = g.createRadialGradient(s / 2, s / 2, s * .2, s / 2, s / 2, s * .55); v.addColorStop(0, 'rgba(5,5,8,0)'); v.addColorStop(1, 'rgba(5,5,8,1)');
      g.fillStyle = v; g.fillRect(0, 0, s, s);
    }
    this.nebula = c;
  };
  P.draw = function (dt) {
    var g = this.g, W = this.W, H = this.H, T = this.time, self = this, cam = this.cam, dpr = this.dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    g.fillStyle = '#05050A'; g.fillRect(0, 0, W, H);
    if (!this.data) return;
    // nebula (slow rotation)
    if (!this.nebula) this.makeNebula();
    var nb = this.nebula, ns = Math.max(W, H) * 1.3;
    g.save(); g.translate(W / 2 - (cam.x * cam.z) * .15, H / 2 - (cam.y * cam.z) * .15); g.rotate(T * .004); g.drawImage(nb, -ns / 2, -ns / 2, ns, ns); g.restore();
    // starfield: 3 parallax layers (warp → streaks)
    var warpK = this.warp ? 1 - ease(this.warp.t) : 0;
    g.globalCompositeOperation = 'lighter';
    this.layers.forEach(function (Ly, li) {
      var ox = -cam.x * cam.z * Ly.f, oy = -cam.y * cam.z * Ly.f;
      for (var i = 0; i < Ly.stars.length; i++) {
        var s = Ly.stars[i];
        var x = ((s.x * W + ox) % W + W) % W, y = ((s.y * H + oy) % H + H) % H;
        var a = s.a * (self.reduce ? .85 : .65 + .35 * Math.sin(T * s.tw + s.ph));
        if (warpK > .02) {
          var dx = x - W / 2, dy = y - H / 2, l = warpK * (li + 1) * .5;
          g.strokeStyle = 'rgba(230, 213, 163,' + (a * .9) + ')'; g.lineWidth = s.s;
          g.beginPath(); g.moveTo(x, y); g.lineTo(x + dx * l, y + dy * l); g.stroke();
        } else { g.fillStyle = 'rgba(255,250,235,' + a + ')'; g.fillRect(x, y, s.s, s.s); }
      }
    });
    g.globalCompositeOperation = 'source-over';
    this.hits = [];
    g.save();
    g.translate(W / 2, H / 2); g.scale(cam.z, cam.z); g.translate(-cam.x, -cam.y);
    var z = cam.z, px = 1 / z; // one screen pixel in world units
    // sky of wins
    g.globalCompositeOperation = 'lighter';
    this.wins.forEach(function (w) {
      var a = self.reduce ? .8 : .55 + .45 * Math.sin(T * 1.3 + w.ph);
      var r = (2.2 + w.s) * px * 1.6;
      g.drawImage(glow('#FFF3C9', .8), w.x - r * 4, w.y - r * 4, r * 8, r * 8);
      g.strokeStyle = 'rgba(255,243,201,' + a + ')'; g.lineWidth = px;
      g.beginPath(); g.moveTo(w.x - r * 2.2, w.y); g.lineTo(w.x + r * 2.2, w.y); g.moveTo(w.x, w.y - r * 2.2); g.lineTo(w.x, w.y + r * 2.2); g.stroke();
    });
    g.globalCompositeOperation = 'source-over';
    if (this.mode === 'client') this.drawClient(g, T, px); else this.drawUniverse(g, T, px);
    this.drawFx(g, dt, px);
    g.restore();
    // vignette + film grain: rendered once per size, drawn as one image (the grain shifts a few pixels each frame)
    if (!this.overlay) {
      var oc = document.createElement('canvas'); oc.width = Math.ceil(W) + 160; oc.height = Math.ceil(H) + 160;
      var og = oc.getContext('2d'), vg = og.createRadialGradient(W / 2 + 80, H / 2 + 80, Math.min(W, H) * .3, W / 2 + 80, H / 2 + 80, Math.max(W, H) * .75);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
      og.fillStyle = vg; og.fillRect(0, 0, oc.width, oc.height);
      if (!this.mobile) { og.globalAlpha = .55; og.fillStyle = og.createPattern(grain(), 'repeat'); og.fillRect(0, 0, oc.width, oc.height); }
      this.overlay = oc;
    }
    var jx = this.reduce ? 80 : 40 + (this.frames * 37 % 80), jy = this.reduce ? 80 : 40 + (this.frames * 53 % 80);
    g.drawImage(this.overlay, -jx, -jy);
  };
  P.addHit = function (e, p, r) { var s = this.toScreen(p); this.hits.push({ e: e, x: s.x, y: s.y, r: Math.max(14, r * this.cam.z + 6) }); };
  P.orbitRing = function (g, r, px, a, dash) {
    g.strokeStyle = 'rgba(230, 213, 163,' + a + ')'; g.lineWidth = px;
    if (dash) g.setLineDash([2 * px, 6 * px]);
    var sq = this.ky > 1 ? .58 : 1;
    g.beginPath(); g.ellipse(0, 0, r * sq, r * this.ky * sq, 0, 0, TAU); g.stroke(); g.setLineDash([]);
  };
  P.drawSun = function (g, e, T, px, isHQ) {
    var c = e.color, pulse = this.reduce ? 1 : 1 + .04 * Math.sin(T * 1.6);
    g.globalCompositeOperation = 'lighter';
    var cr = e.r * 5.2 * pulse;
    g.drawImage(glow(c, .55), -cr, -cr, cr * 2, cr * 2);
    g.drawImage(glow(e.accent || c, .5), -e.r * 2.2, -e.r * 2.2, e.r * 4.4, e.r * 4.4);
    // corona rays
    g.strokeStyle = hexA(e.accent || c, .22); g.lineWidth = 1.2 * px;
    for (var i = 0; i < 36; i++) {
      var a = i / 36 * TAU + T * .05, l = e.r * (1.35 + .25 * Math.sin(T * 1.2 + i * 1.7));
      g.beginPath(); g.moveTo(Math.cos(a) * e.r * 1.05, Math.sin(a) * e.r * 1.05); g.lineTo(Math.cos(a) * l, Math.sin(a) * l); g.stroke();
    }
    g.globalCompositeOperation = 'source-over';
    var body = g.createRadialGradient(-e.r * .3, -e.r * .35, e.r * .1, 0, 0, e.r);
    body.addColorStop(0, '#FFFFFF'); body.addColorStop(.25, hexA(e.accent || c, 1)); body.addColorStop(1, hexA(c, 1));
    if (isHQ) {
      var hb = g.createRadialGradient(-e.r * .3, -e.r * .35, e.r * .05, 0, 0, e.r);
      hb.addColorStop(0, '#2b2412'); hb.addColorStop(.7, '#0d0b07'); hb.addColorStop(1, '#3a2c0c');
      body = hb;
    }
    g.fillStyle = body; g.beginPath(); g.arc(0, 0, e.r, 0, TAU); g.fill();
    if (isHQ) { g.strokeStyle = hexA(COL.goldL, .85); g.lineWidth = 1.6 * px; g.stroke(); g.strokeStyle = hexA(COL.gold, .35); g.lineWidth = 5 * px; g.beginPath(); g.arc(0, 0, e.r + 4 * px, 0, TAU); g.stroke(); }
    var im = img(e.logo, (function (self) { return function () { self.dirty = true; if (self.reduce) self.frame(self.last); }; })(this));
    if (im) {
      g.save(); g.beginPath(); g.arc(0, 0, e.r * .82, 0, TAU); g.clip();
      if (!isHQ) { g.fillStyle = 'rgba(8,8,12,.88)'; g.fill(); }
      var s = e.r * 1.25, ar = im.width / im.height || 1, w = ar >= 1 ? s : s * ar, h = ar >= 1 ? s / ar : s;
      g.drawImage(im, -w / 2, -h / 2, w, h);
      g.restore();
    } else if (!isHQ) {
      g.fillStyle = 'rgba(8,8,12,.82)'; g.beginPath(); g.arc(0, 0, e.r * .82, 0, TAU); g.fill();
      g.fillStyle = hexA(e.accent || c, 1); g.font = '600 ' + (e.r * .55) + 'px ' + (getComputedStyle(this.host).getPropertyValue('--f-display') || 'serif');
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText((e.label || '?').split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 3), 0, 1);
    }
  };
  P.label = function (g, text, x, y, px, opts) {
    opts = opts || {};
    g.font = (opts.weight || 600) + ' ' + ((opts.size || 11.5) * px) + 'px ' + (opts.font || 'Inter, "IBM Plex Sans Arabic", system-ui, sans-serif');
    g.textAlign = 'center'; g.textBaseline = 'top';
    g.fillStyle = 'rgba(0,0,0,.55)'; g.fillText(text, x + px, y + px);
    g.fillStyle = opts.color || 'rgba(255,255,255,.92)'; g.fillText(text, x, y);
  };
  P.drawClient = function (g, T, px) {
    var E = this.ents, self = this, d = this.data;
    this.glyphs = {};
    // orbits
    this.orbitRing(g, 205, px, .14); this.orbitRing(g, 330, px, .1, true);
    // gate ring
    var gate = E.gate, pend = this.countAt('gate');
    g.strokeStyle = hexA(COL.gold, pend ? .55 + (this.reduce ? 0 : .25 * Math.sin(T * 2.4)) : .25); g.lineWidth = (pend ? 2.2 : 1.2) * px;
    g.beginPath(); g.arc(0, 0, gate.r, 0, TAU); g.stroke();
    g.strokeStyle = hexA(COL.gold, .18); g.lineWidth = 6 * px; g.beginPath(); g.arc(0, 0, gate.r, 0, TAU); g.stroke();
    this.hits.push({ e: gate, x: this.toScreen({ x: 0, y: gate.r + 12 }).x, y: this.toScreen({ x: 0, y: gate.r + 12 }).y, r: 18 });
    this.label(g, t('core.gate').toUpperCase(), 0, gate.r + 7 * px, px, { size: 9.5, weight: 700, color: 'rgba(246,231,180,.85)' });
    // KPI arc around the sun
    if (d.kpi && d.kpi.t > 0) {
      var pct = clamp(d.kpi.v / d.kpi.t, 0, 1), kr = E.sun.r + 14;
      g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 3 * px; g.beginPath(); g.arc(0, 0, kr, 0, TAU); g.stroke();
      var grd = g.createLinearGradient(-kr, -kr, kr, kr); grd.addColorStop(0, '#FFF3C9'); grd.addColorStop(1, d.primary || COL.gold);
      g.strokeStyle = grd; g.lineWidth = 3.4 * px; g.lineCap = 'round';
      g.beginPath(); g.arc(0, 0, kr, -Math.PI / 2, -Math.PI / 2 + Math.max(.03, pct) * TAU); g.stroke(); g.lineCap = 'butt';
      this.label(g, d.kpi.v.toLocaleString('en-US') + ' / ' + d.kpi.t.toLocaleString('en-US'), 0, kr + 6 * px, px, { size: 10, font: '"IBM Plex Mono", monospace', weight: 500, color: 'rgba(246,231,180,.85)' });
    }
    // sun
    this.drawSun(g, E.sun, T, px, false);
    this.addHit(E.sun, { x: 0, y: 0 }, E.sun.r);
    // tool planets
    this.tools.forEach(function (id) {
      var e = E['t:' + id], p = self.pos(e), hov = self.hover === e.id || self.sel === e.id, sc = COL[e.status];
      g.globalCompositeOperation = 'lighter';
      g.drawImage(glow(sc, hov ? .7 : .45), p.x - e.r * 3, p.y - e.r * 3, e.r * 6, e.r * 6);
      g.globalCompositeOperation = 'source-over';
      var pl = g.createRadialGradient(p.x - e.r * .4, p.y - e.r * .5, 1, p.x, p.y, e.r);
      pl.addColorStop(0, '#3a3a46'); pl.addColorStop(1, '#0d0d12');
      g.fillStyle = pl; g.beginPath(); g.arc(p.x, p.y, e.r, 0, TAU); g.fill();
      g.strokeStyle = hexA(sc, hov ? 1 : .8); g.lineWidth = (hov ? 2 : 1.4) * px; g.stroke();
      g.save(); g.translate(p.x, p.y); g.strokeStyle = 'rgba(255,255,255,.9)'; glyph(g, id, e.r / 13); g.restore();
      self.label(g, t('core.t.' + id), p.x, p.y + e.r + 8 * px, px, { size: 11 });
      self.addHit(e, p, e.r);
    });
    // channels
    this.channels.forEach(function (ch) {
      var e = E['c:' + ch], p = self.pos(e), hov = self.hover === e.id || self.sel === e.id;
      g.globalCompositeOperation = 'lighter'; g.drawImage(glow(e.color, hov ? .8 : .5), p.x - e.r * 3, p.y - e.r * 3, e.r * 6, e.r * 6); g.globalCompositeOperation = 'source-over';
      // brand-tinted disc, white platform mark, the official colour only as a thin ring
      var disc = g.createRadialGradient(p.x - e.r * .35, p.y - e.r * .45, 1, p.x, p.y, e.r);
      disc.addColorStop(0, hexA(d.primary || COL.gold, .38)); disc.addColorStop(1, '#0b0b10');
      g.fillStyle = '#0b0b10'; g.beginPath(); g.arc(p.x, p.y, e.r, 0, TAU); g.fill();
      g.fillStyle = disc; g.fill();
      g.strokeStyle = hexA(e.color, hov ? .95 : .6); g.lineWidth = (hov ? 1.8 : 1.2) * px; g.stroke();
      g.save(); g.translate(p.x, p.y);
      var drew = window.ZDEV && window.ZDEV.pglyphCanvas(g, ch, e.r * 1.12, 'rgba(255,255,255,.95)');
      g.restore();
      if (drew) self.glyphs[ch] = 1;
      else { g.fillStyle = e.color; g.beginPath(); g.arc(p.x, p.y, e.r * .35, 0, TAU); g.fill(); }
      self.label(g, self.o.platformName ? self.o.platformName(ch) : ch, p.x, p.y + e.r + 7 * px, px, { size: 10, color: 'rgba(255,255,255,.75)' });
      self.addHit(e, p, e.r);
    });
    // moons
    Object.keys(E).forEach(function (k) {
      var e = E[k]; if (e.type !== 'moon') return;
      var p = self.pos(e), c = STATUS_COL[e.item.status] || '#999', atGate = e.owner === 'gate', hov = self.hover === e.id;
      var r = e.r * (atGate && !self.reduce ? 1 + .18 * Math.sin(T * 3 + e.idx) : 1) * (hov ? 1.35 : 1);
      g.globalCompositeOperation = 'lighter'; g.drawImage(glow(c, atGate ? .9 : .6), p.x - r * 4, p.y - r * 4, r * 8, r * 8); g.globalCompositeOperation = 'source-over';
      g.fillStyle = atGate ? '#FFF3C9' : c; g.beginPath(); g.arc(p.x, p.y, r, 0, TAU); g.fill();
      if (atGate) { g.strokeStyle = hexA(COL.gold, .9); g.lineWidth = 1.2 * px; g.beginPath(); g.arc(p.x, p.y, r + 3.5 * px + (self.reduce ? 0 : 2 * px * Math.sin(T * 3 + e.idx)), 0, TAU); g.stroke(); }
      self.addHit(e, p, Math.max(r, 6));
    });
  };
  P.drawUniverse = function (g, T, px) {
    var E = this.ents, self = this;
    this.orbitRing(g, 250, px, .14);
    this.drawSun(g, E.sun, T, px, true);
    this.addHit(E.sun, { x: 0, y: 0 }, E.sun.r);
    this.label(g, 'ZKJ SYSTEM HQ', 0, E.sun.r + 22 * px, px, { size: 12, color: 'rgba(246,231,180,.95)', font: '"Cinzel", serif' });
    this.data.clients.forEach(function (c) {
      var e = E['s:' + c.id], p = self.pos(e), hov = self.hover === e.id || self.sel === e.id;
      // signal line to HQ
      g.strokeStyle = hexA(e.color, .12); g.lineWidth = px; g.setLineDash([3 * px, 7 * px]); g.beginPath(); g.moveTo(0, 0); g.lineTo(p.x, p.y); g.stroke(); g.setLineDash([]);
      g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = px; g.beginPath(); g.ellipse(p.x, p.y, 53, 43, 0, 0, TAU); g.stroke();
      g.save(); g.translate(p.x, p.y);
      self.drawSun(g, { r: e.r * (hov ? 1.12 : 1), color: e.color, accent: c.accent, logo: c.logo, label: c.name }, T + c.name.length, px, false);
      g.restore();
      self.label(g, c.name, p.x, p.y + e.r + 16 * px, px, { size: 12.5, font: c.font || 'Inter, sans-serif' });
      if (c.tag) self.label(g, c.tag, p.x, p.y + e.r + 32 * px, px, { size: 9.5, weight: 500, color: 'rgba(255,255,255,.6)' });
      self.addHit(e, p, e.r + 8);
    });
    Object.keys(E).forEach(function (k) {
      var e = E[k]; if (e.type !== 'umoon') return;
      var p = self.pos(e), c = STATUS_COL[e.item.status] || '#999', pend = e.item.status === 'needs_approval';
      var r = e.r * (pend && !self.reduce ? 1 + .2 * Math.sin(T * 3 + e.idx) : 1);
      g.globalCompositeOperation = 'lighter'; g.drawImage(glow(c, .7), p.x - r * 4, p.y - r * 4, r * 8, r * 8); g.globalCompositeOperation = 'source-over';
      g.fillStyle = pend ? '#FFF3C9' : c; g.beginPath(); g.arc(p.x, p.y, r, 0, TAU); g.fill();
      self.addHit(e, p, 6);
    });
  };
  P.drawFx = function (g, dt, px) {
    var self = this;
    // comets along curved bezier paths between moving bodies
    g.globalCompositeOperation = 'lighter';
    this.comets = this.comets.filter(function (c) {
      c.t += dt / c.dur;
      var a = self.pos(c.a), b = self.pos(c.b), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y;
      var cx = mx - dy * c.bend, cy = my + dx * c.bend, k = ease(Math.min(1, c.t)), u = 1 - k;
      var x = u * u * a.x + 2 * u * k * cx + k * k * b.x, y = u * u * a.y + 2 * u * k * cy + k * k * b.y;
      c.trail.push({ x: x, y: y }); if (c.trail.length > 26) c.trail.shift();
      for (var i = 1; i < c.trail.length; i++) {
        var f = i / c.trail.length;
        g.strokeStyle = hexA(c.color, f * .75); g.lineWidth = (1 + f * 3.2) * px; g.lineCap = 'round';
        g.beginPath(); g.moveTo(c.trail[i - 1].x, c.trail[i - 1].y); g.lineTo(c.trail[i].x, c.trail[i].y); g.stroke();
      }
      var hr = 7 * px * 3;
      g.drawImage(glow(c.color, .95), x - hr * 2, y - hr * 2, hr * 4, hr * 4);
      g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x, y, 2.4 * px, 0, TAU); g.fill();
      if (c.t >= 1) {
        if (c.meta.published) self.burst(b, '#FFFFFF', 18);
        else if (!c.meta.ambient) self.burst(b, c.color, 12);
        return false;
      }
      return true;
    });
    // starbursts
    this.bursts = this.bursts.filter(function (B) {
      B.t += dt;
      var life = 1 - B.t / 1.1; if (life <= 0) return false;
      B.parts.forEach(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .96; p.vy *= .96; g.fillStyle = hexA(B.color, life); g.beginPath(); g.arc(p.x, p.y, 1.6 * px, 0, TAU); g.fill(); });
      g.strokeStyle = hexA(B.color, life * .8); g.lineWidth = 2 * px; g.beginPath(); g.arc(B.ring.x, B.ring.y, (1 - life) * 70, 0, TAU); g.stroke();
      return true;
    });
    g.globalCompositeOperation = 'source-over';
    // shooting stars (screen space)
    if (this.shooting.length) {
      g.save(); g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); g.globalCompositeOperation = 'lighter';
      this.shooting = this.shooting.filter(function (s) {
        s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt;
        var x = s.x + self.W, y = s.y + self.H * .5, life = 1 - s.t / 1.3; if (life <= 0) return false;
        var gr = g.createLinearGradient(x, y, x - s.vx * .18, y - s.vy * .18); gr.addColorStop(0, 'rgba(255,248,226,' + life + ')'); gr.addColorStop(1, 'rgba(255,248,226,0)');
        g.strokeStyle = gr; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x - s.vx * .18, y - s.vy * .18); g.stroke();
        return true;
      });
      g.restore();
    }
  };

  // debug + tests: screen position of a body
  P.screenOf = function (id) { var e = this.ents[id]; if (!e) return null; var p = this.toScreen(this.pos(e)), r = this.cv.getBoundingClientRect(); return { x: r.left + p.x, y: r.top + p.y }; };
  P.stats = function () { return { glyphs: Object.keys(this.glyphs || {}), frames: this.frames, fired: this.fired, comets: this.comets.length, running: this.running, mode: this.mode, z: this.cam.z, fit: this.fit, sel: this.sel }; };

  window.ZCORE = { create: function (host, opts) { return new Core(host, opts); } };
})();
