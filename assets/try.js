/* ZKJ SYSTEM — "Try it": one small, honest sample of each tool's job.
   Everything here is a sample in the browser. Nothing is generated, scanned, stored or sent. */
(function () {
  'use strict';
  var Z = window.ZKJ;
  if (!Z) return;
  var esc = Z.esc, t = Z.t;
  var L = function () { return Z.getLang(); };
  var tx = function (o) { return o == null ? '' : (typeof o === 'string' ? o : (o[L()] || o.en)); };
  var ART = 'assets/art/kj/';

  Z.extend({
    en: {
      'try.cta': 'Try it', 'try.eyebrow': 'Try it · sample', 'try.close': 'Close',
      'try.note': 'A sample in your browser. Your real version uses your brand, your photos and your data — nothing here is saved or sent.',
      'try.use': 'Use this for my business', 'try.more': 'Back to all tools'
    },
    ar: {
      'try.cta': 'جرّبها', 'try.eyebrow': 'جرّبها · مثال', 'try.close': 'إغلاق',
      'try.note': 'مثال داخل متصفحك. نسختك الحقيقية تستخدم هويتك وصورك وبياناتك — لا يُحفظ ولا يُرسل شيء من هنا.',
      'try.use': 'أريد هذه لنشاطي', 'try.more': 'العودة لكل الأدوات'
    }
  });

  function chips(name, opts, cur, extra) {
    return '<div class="ts-chips" role="group">' + opts.map(function (o) {
      return '<button type="button" class="ts-chip" data-x="' + name + '" data-v="' + o.v + '" aria-pressed="' + (String(o.v) === String(cur) ? 'true' : 'false') + '"' + (extra || '') + '>' + esc(tx(o.l)) + '</button>';
    }).join('') + '</div>';
  }
  function lab(o) { return '<p class="ts-lab">' + esc(tx(o)) + '</p>'; }
  function sample(o) { return '<p class="ts-sample">◆ ' + esc(tx(o)) + '</p>'; }
  function btn(name, o, primary) { return '<button type="button" class="btn btn-sm ' + (primary ? 'btn-primary' : 'btn-ghost') + '" data-x="' + name + '">' + esc(tx(o)) + '</button>'; }

  /* ================= STAGES ================= */
  var S = {};

  /* T-02 Brand & Market Audit — numbers are our real audit of KJ VISION (11 Oct 2026) */
  var AUD = [[{ en: 'Presence', ar: 'الحضور' }, 9, 15], [{ en: 'Consistency', ar: 'الاستمرارية' }, 3, 15], [{ en: 'Content quality', ar: 'جودة المحتوى' }, 12, 20], [{ en: 'Engagement', ar: 'التفاعل' }, 6, 15], [{ en: 'Conversion', ar: 'التحويل' }, 4, 20]];
  S.audit = {
    init: function () { return { run: false }; },
    render: function (s) {
      var g = s.run ? 40 : 0, C = 2 * Math.PI * 52;
      return lab({ en: 'Your Instagram', ar: 'حسابك على إنستغرام' }) +
        '<div class="ts-row"><input class="ts-input" value="@kjvision.zkj" readonly aria-readonly="true">' + btn('run', { en: s.run ? 'Run again' : 'Run audit', ar: s.run ? 'أعد التشغيل' : 'شغّل التدقيق' }, true) + '</div>' +
        '<div class="au-wrap' + (s.run ? ' on' : '') + '"><svg class="au-gauge" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="tr"/><circle cx="60" cy="60" r="52" class="fg" style="stroke-dasharray:' + C + ';stroke-dashoffset:' + (C * (1 - g / 100)) + '"/><text x="60" y="64">' + (s.run ? '40' : '—') + '</text><text x="60" y="82" class="sm">/ 100</text></svg>' +
        '<ul class="au-bars">' + AUD.map(function (r) { return '<li><span>' + esc(tx(r[0])) + '</span><b>' + (s.run ? r[1] + '/' + r[2] : '') + '</b><i><em style="width:' + (s.run ? (100 * r[1] / r[2]) : 0) + '%"></em></i></li>'; }).join('') +
        '<li class="na"><span>' + esc(tx({ en: 'Reputation', ar: 'السمعة' })) + '</span><b>' + (s.run ? 'n/a' : '') + '</b></li></ul></div>' +
        (s.run ? '<ol class="au-wins"><li>' + esc(tx({ en: 'Post on a steady schedule — consistency is the weakest score.', ar: 'انشر بجدول ثابت — الاستمرارية أضعف نقطة.' })) + '</li><li>' + esc(tx({ en: 'Make the link in bio lead straight to what you sell.', ar: 'خلّ رابط البايو يوصل مباشرة لما تبيعه.' })) + '</li><li>' + esc(tx({ en: 'Answer comments within a day.', ar: 'رد على التعليقات خلال يوم.' })) + '</li></ol>' : '') +
        sample({ en: 'Real numbers from our own audit of KJ VISION, 11 Oct 2026 — your audit studies your accounts and your competitors.', ar: 'أرقام حقيقية من تدقيقنا لحساب KJ VISION في 11 أكتوبر 2026 — تدقيقك يدرس حساباتك ومنافسيك.' });
    },
    act: function (s, a) { if (a === 'run') s.run = true; }
  };

  /* T-06 WhatsApp AI Assistant */
  var WA = {
    open: [{ en: 'Are you open now?', ar: 'مفتوحين الحين؟' }, { en: 'Yes — open today until 11 pm. Would you like the menu or a table?', ar: 'إي نعم، مفتوحين اليوم لين 11 بالليل. تبي المنيو ولا نحجز لك طاولة؟' }],
    menu: [{ en: 'Menu please', ar: 'المنيو لو سمحت' }, { en: 'Here it is — tap an item to order:', ar: 'تفضل — اضغط على أي صنف عشان تطلب:' }, 'cat'],
    book: [{ en: 'Book a table', ar: 'أبي أحجز طاولة' }, { en: 'For how many people, and what time?', ar: 'كم شخص، وأي ساعة؟' }],
    two: [{ en: '2 people · 8 pm', ar: 'شخصين · 8 بالليل' }, { en: 'Booked ✓ Table for 2 at 8 pm. We’ll send you a reminder.', ar: 'تم الحجز ✓ طاولة لشخصين الساعة 8. بنرسل لك تذكير.' }],
    human: [{ en: 'Talk to a person', ar: 'أبي أكلم موظف' }, { en: 'Of course — connecting you to the team now. Someone will reply here.', ar: 'أكيد — أحولك الحين للفريق، وواحد منهم بيرد عليك هنا.' }, 'hand']
  };
  S.whatsapp = {
    init: function () { return { log: [], last: '' }; },
    render: function (s) {
      var next = s.last === 'book' ? ['two', 'human'] : ['open', 'menu', 'book', 'human'];
      return '<div class="wa-phone"><div class="wa-hd"><i></i><b>yourbrand</b><small>' + esc(tx({ en: 'replies instantly', ar: 'يرد فورًا' })) + '</small></div><div class="wa-log" data-log>' +
        (s.log.length ? '' : '<p class="wa-hint">' + esc(tx({ en: 'Tap a question below.', ar: 'اضغط على سؤال تحت.' })) + '</p>') +
        s.log.map(function (k) {
          var f = WA[k];
          return '<p class="wa-b me">' + esc(tx(f[0])) + '</p><p class="wa-b bot">' + esc(tx(f[1])) + '</p>' +
            (f[2] === 'cat' ? '<div class="wa-cat">' + [{ en: 'Flat white', ar: 'فلات وايت' }, { en: 'Cardamom latte', ar: 'لاتيه بالهيل' }, { en: 'Saffron cake', ar: 'كيكة الزعفران' }].map(function (x, i) { return '<span style="background-image:url(' + ART + ['kj-052', 'kj-059', 'kj-060'][i] + '-600.webp)"><b>' + esc(tx(x)) + '</b></span>'; }).join('') + '</div>' : '') +
            (f[2] === 'hand' ? '<p class="wa-hand">' + esc(tx({ en: 'Handed over to the team', ar: 'تم التحويل للفريق' })) + '</p>' : '');
        }).join('') + '</div></div>' +
        '<div class="ts-chips wa-q">' + next.map(function (k) { return '<button type="button" class="ts-chip" data-x="q" data-v="' + k + '">' + esc(tx(WA[k][0])) + '</button>'; }).join('') + (s.log.length ? btn('clr', { en: 'Clear', ar: 'مسح' }) : '') + '</div>';
    },
    act: function (s, a, v) { if (a === 'q') { s.log.push(v); s.last = v; } if (a === 'clr') { s.log = []; s.last = ''; } },
    after: function (box) { var l = box.querySelector('[data-log]'); if (l) l.scrollTop = l.scrollHeight; }
  };

  /* T-07 Social Media Marketing */
  var GOAL = { msg: { l: { en: 'Messages', ar: 'رسائل' }, split: [60, 25, 15], cta: { en: 'Send message', ar: 'أرسل رسالة' } }, visit: { l: { en: 'Store visits', ar: 'زيارات' }, split: [45, 25, 30], cta: { en: 'Get directions', ar: 'الاتجاهات' } }, sale: { l: { en: 'Online sales', ar: 'مبيعات' }, split: [55, 35, 10], cta: { en: 'Shop now', ar: 'تسوّق الآن' } } };
  var LVL = [{ v: 0, l: { en: 'Small', ar: 'صغيرة' } }, { v: 1, l: { en: 'Medium', ar: 'متوسطة' } }, { v: 2, l: { en: 'Large', ar: 'كبيرة' } }];
  S.smm = {
    init: function () { return { g: 'msg', lv: 1 }; },
    render: function (s) {
      var G = GOAL[s.g];
      var plan = [{ en: 'Test 2 ad designs', ar: 'تجربة تصميمين' }, { en: 'Test 3 ad designs + one audience test', ar: 'تجربة 3 تصاميم + اختبار جمهور' }, { en: 'Test 4 ad designs, audience tests and retargeting', ar: '4 تصاميم واختبارات جمهور وإعادة استهداف' }][s.lv];
      return lab({ en: 'Goal', ar: 'الهدف' }) + chips('g', Object.keys(GOAL).map(function (k) { return { v: k, l: GOAL[k].l }; }), s.g) +
        lab({ en: 'Budget size', ar: 'حجم الميزانية' }) + chips('lv', LVL, s.lv) +
        '<div class="sm-split">' + [['Meta', '#1877F2'], ['TikTok', '#25C2C9'], ['Snapchat', '#E8D90C']].map(function (p, i) { return '<div><span>' + p[0] + '</span><i><em style="width:' + G.split[i] + '%;background:' + p[1] + '"></em></i><b>' + G.split[i] + '%</b></div>'; }).join('') + '</div>' +
        '<p class="sm-plan">◆ ' + esc(tx(plan)) + '</p>' +
        '<div class="sm-ad"><div class="sm-ad-hd"><i></i><b>yourbrand</b><small>' + esc(tx({ en: 'Sponsored', ar: 'مُموَّل' })) + '</small></div><span class="sm-img" style="background-image:url(' + ART + 'kj-052-600.webp)"></span><div class="sm-ad-ft"><span>' + esc(tx({ en: 'Autumn menu is here', ar: 'منيو الخريف وصل' })) + '</span><b>' + esc(tx(G.cta)) + '</b></div></div>' +
        sample({ en: 'A sample plan. You pay each platform directly, and we never promise results — you see real spend and results every week.', ar: 'خطة مثال. تدفع لكل منصة مباشرة، ولا نَعِد بنتائج — ترى الصرف والنتائج الحقيقية كل أسبوع.' });
    },
    act: function (s, a, v) { if (a === 'g') s.g = v; if (a === 'lv') s.lv = +v; }
  };

  /* T-09 Google Ads & Marketing */
  S.google = {
    init: function () { return { q: 0 }; },
    render: function (s) {
      var Q = [{ en: 'coffee near me', ar: 'قهوة قريبة مني' }, { en: 'café open now', ar: 'مقهى مفتوح الحين' }];
      return chips('q', Q.map(function (x, i) { return { v: i, l: x }; }), s.q) +
        '<div class="gg-search"><span>⌕</span>' + esc(tx(Q[s.q])) + '</div>' +
        '<div class="gg-ad"><small>' + esc(tx({ en: 'Sponsored', ar: 'إعلان' })) + ' · yourbrand.com</small><b>' + esc(tx({ en: 'Fresh roast, poured slowly — open now', ar: 'قهوة طازجة على مهلها — مفتوحين الحين' })) + '</b><span>' + esc(tx({ en: 'Order on WhatsApp · Directions · Call', ar: 'اطلب على واتساب · الاتجاهات · اتصال' })) + '</span></div>' +
        '<div class="gg-map"><i class="p1"></i><i class="p2"></i><i class="me"></i></div>' +
        '<div class="gg-biz"><b>yourbrand</b><span class="ok">' + esc(tx({ en: 'Open now', ar: 'مفتوح الحين' })) + '</span><span>★ 4.8 <small>(' + esc(tx({ en: 'sample', ar: 'مثال' })) + ')</small></span><div class="ts-row"><em>' + esc(tx({ en: 'Call', ar: 'اتصال' })) + '</em><em>' + esc(tx({ en: 'Directions', ar: 'الاتجاهات' })) + '</em><em>' + esc(tx({ en: 'Website', ar: 'الموقع' })) + '</em></div></div>' +
        '<ul class="ts-check"><li>' + esc(tx({ en: 'Hours, photos and menu kept up to date', ar: 'الساعات والصور والمنيو محدّثة' })) + '</li><li>' + esc(tx({ en: 'Every review answered', ar: 'الرد على كل تقييم' })) + '</li><li>' + esc(tx({ en: 'Ads only when people nearby are searching', ar: 'إعلانات فقط عندما يبحث الناس القريبون' })) + '</li></ul>';
    },
    act: function (s, a, v) { if (a === 'q') s.q = +v; }
  };

  /* T-10 Insights & Reports */
  var WK = [{ k: [['12.4K', { en: 'Reach', ar: 'الوصول' }, '+18%'], ['640', { en: 'Saves', ar: 'الحفظ' }, '+9%'], ['37', { en: 'WhatsApp chats', ar: 'محادثات واتساب' }, '+5']], b: [35, 52, 41, 88, 60, 95, 70] }, { k: [['10.5K', { en: 'Reach', ar: 'الوصول' }, '+4%'], ['587', { en: 'Saves', ar: 'الحفظ' }, '−3%'], ['32', { en: 'WhatsApp chats', ar: 'محادثات واتساب' }, '+2']], b: [40, 38, 55, 60, 47, 72, 58] }];
  S.insights = {
    init: function () { return { w: 0 }; },
    render: function (s) {
      var w = WK[s.w];
      return chips('w', [{ v: 0, l: { en: 'This week', ar: 'هذا الأسبوع' } }, { v: 1, l: { en: 'Last week', ar: 'الأسبوع الماضي' } }], s.w) +
        '<div class="in-k">' + w.k.map(function (k) { return '<div><b>' + k[0] + '</b><small>' + esc(tx(k[1])) + '</small><em class="' + (k[2].charAt(0) === '−' ? 'dn' : 'up') + '">' + k[2] + '</em></div>'; }).join('') + '</div>' +
        '<div class="in-bars">' + w.b.map(function (h, i) { return '<span><i style="height:' + h + '%"></i><small>' + DAYS[L()][i].slice(0, L() === 'ar' ? 3 : 1) + '</small></span>'; }).join('') + '</div>' +
        '<div class="in-pp"><div><span style="background-image:url(' + ART + 'kj-059-600.webp)"></span><small>' + esc(tx({ en: 'Best · counter reel', ar: 'الأفضل · ريل الكاونتر' })) + '</small></div><div><span style="background-image:url(' + ART + 'kj-009-600.webp)"></span><small>' + esc(tx({ en: 'Weakest · text post', ar: 'الأضعف · منشور نصي' })) + '</small></div></div>' +
        '<p class="in-next">→ ' + esc(tx({ en: 'Post next: a reel, Thursday 20:30.', ar: 'انشر بعدها: ريل، الخميس 20:30.' })) + '</p>' +
        sample({ en: 'Sample numbers. Your report uses your real accounts.', ar: 'أرقام مثال. تقريرك يستخدم حساباتك الحقيقية.' });
    },
    act: function (s, a, v) { if (a === 'w') s.w = +v; }
  };

  /* T-11 3D Builder */
  var MAT = { wood: ['#8A5A33', '#B07A4A', '#5E3B1F'], marble: ['#E8E4DE', '#CFC9C0', '#A9A39A'], steel: ['#2A2C31', '#3A3D44', '#16171A'] };
  S.builder3d = {
    init: function () { return { sp: 'front', m: 'wood' }; },
    render: function (s) {
      var c = MAT[s.m], g = '#C9A84C';
      var shapes = {
        front: '<path d="M40 150 160 90 280 150 160 210Z" fill="#1a1b22"/><path d="M60 140V70l100-50v70Z" fill="' + c[1] + '"/><path d="M160 90V20l100 50v70Z" fill="' + c[0] + '"/><path d="M90 125V85l40-20v40Z" fill="#9fc0ff" opacity=".35"/><path d="M180 100V60l55 27v40Z" fill="#9fc0ff" opacity=".3"/><path d="M60 70l100-50 100 50" stroke="' + g + '" fill="none"/><text x="160" y="50" fill="' + g + '" font-size="10" text-anchor="middle" font-family="Cinzel">YOURBRAND</text>',
        cafe: '<path d="M40 150 160 90 280 150 160 210Z" fill="' + c[2] + '"/><path d="M40 150V60l120-60v90Z" fill="#23242b"/><path d="M160 90V0l120 60v90Z" fill="#1c1d23"/><path d="M90 160l60-30 40 20-60 30Z" fill="' + c[1] + '"/><path d="M90 160v12l60 30v-12Z M150 190v12l40-20v-12Z" fill="' + c[0] + '"/><circle cx="205" cy="128" r="14" fill="' + c[1] + '"/><path d="M60 80l50-25v30l-50 25Z" fill="' + g + '" opacity=".5"/>',
        display: '<path d="M40 150 160 90 280 150 160 210Z" fill="#1a1b22"/><path d="M110 160l50-25 50 25-50 25Z" fill="' + c[1] + '"/><path d="M110 160v-40l50 25v40Z" fill="' + c[0] + '"/><path d="M210 160v-40l-50 25v40Z" fill="' + c[2] + '"/><path d="M110 120l50-25 50 25-50 25Z" fill="' + c[1] + '"/><rect x="148" y="70" width="24" height="40" fill="' + g + '" opacity=".75"/>'
      };
      return lab({ en: 'Space', ar: 'المساحة' }) + chips('sp', [{ v: 'front', l: { en: 'Shopfront', ar: 'واجهة محل' } }, { v: 'cafe', l: { en: 'Café corner', ar: 'ركن مقهى' } }, { v: 'display', l: { en: 'Display', ar: 'منصة عرض' } }], s.sp) +
        lab({ en: 'Material', ar: 'الخامة' }) + chips('m', [{ v: 'wood', l: { en: 'Wood', ar: 'خشب' } }, { v: 'marble', l: { en: 'Marble', ar: 'رخام' } }, { v: 'steel', l: { en: 'Black steel', ar: 'حديد أسود' } }], s.m) +
        '<div class="b3-stage"><svg viewBox="0 0 320 220" aria-hidden="true">' + shapes[s.sp] + '</svg></div>' +
        sample({ en: 'A simple sample. Your version is built to your real measurements and materials.', ar: 'مثال مبسّط. نسختك تُبنى على قياساتك وخاماتك الحقيقية.' });
    },
    act: function (s, a, v) { if (a === 'sp') s.sp = v; if (a === 'm') s.m = v; }
  };

  /* T-12 2D Engineering Drawings Agent */
  S.drawings = {
    init: function () { return { lg: L() === 'ar' ? 'ar' : 'en' }; },
    render: function (s) {
      var ar = s.lg === 'ar';
      var T = ar ? { k: 'مطبخ', s: 'جلسات', c: 'كاونتر', w: 'دورة مياه', d1: '٦٫٥٠ م', d2: '٤٫٢٠ م', tb: 'مخطط الدور الأرضي · مقياس ١:٥٠' } : { k: 'KITCHEN', s: 'SEATING', c: 'COUNTER', w: 'WC', d1: '6.50 m', d2: '4.20 m', tb: 'GROUND FLOOR PLAN · SCALE 1:50' };
      var dir = ar ? ' direction="rtl"' : '';
      return chips('lg', [{ v: 'en', l: { en: 'English labels', ar: 'تسميات إنجليزية' } }, { v: 'ar', l: { en: 'Arabic labels', ar: 'تسميات عربية' } }], s.lg) +
        '<div class="dw-sheet"><svg viewBox="0 0 320 230" font-family="' + (ar ? 'IBM Plex Sans Arabic' : 'IBM Plex Mono, monospace') + '">' +
        '<g stroke="#cfe0ff" fill="none" stroke-width="1.6"><rect x="30" y="30" width="260" height="140"/><path d="M30 95H130M175 95H290M130 30V95M200 130V170"/><path d="M130 95a22 22 0 0 1 22-22" stroke="#C9A84C"/></g>' +
        '<g fill="#9fc0ff" font-size="11"' + dir + '><text x="80" y="66" text-anchor="middle">' + T.k + '</text><text x="210" y="66" text-anchor="middle">' + T.s + '</text><text x="110" y="138" text-anchor="middle">' + T.c + '</text><text x="245" y="155" text-anchor="middle">' + T.w + '</text></g>' +
        '<g stroke="#C9A84C" stroke-width="1"><path d="M30 18H290M30 14V22M290 14V22"/><path d="M302 30V170M298 30H306M298 170H306"/></g>' +
        '<g fill="#E6D5A3" font-size="11"' + dir + '><text x="160" y="13" text-anchor="middle">' + T.d1 + '</text><text x="312" y="104" text-anchor="middle" transform="rotate(90 312 104)">' + T.d2 + '</text></g>' +
        '<rect x="30" y="186" width="260" height="30" fill="none" stroke="#3a4a78"/><text x="' + (ar ? 282 : 38) + '" y="205" fill="#cfe0ff" font-size="10"' + (ar ? ' text-anchor="end"' : '') + '>' + T.tb + '</text></svg></div>' +
        sample({ en: 'Dimensions and labels read correctly in both languages — right-to-left in Arabic.', ar: 'الأبعاد والتسميات تُقرأ صح باللغتين — من اليمين لليسار بالعربية.' });
    },
    act: function (s, a, v) { if (a === 'lg') s.lg = v; }
  };

  /* T-13 Security Agent */
  var SEC = [
    ['hi', { en: 'Booking form has no spam protection', ar: 'نموذج الحجز بدون حماية من الرسائل المزعجة' }, { en: 'Add a simple check before sending.', ar: 'أضف تحققًا بسيطًا قبل الإرسال.' }],
    ['md', { en: 'Two-step login is off on 1 of 3 social accounts', ar: 'التحقق بخطوتين مطفأ في حساب من 3' }, { en: 'Turn it on — it takes two minutes.', ar: 'فعّله — يأخذ دقيقتين.' }],
    ['lo', { en: 'Website shows its software version', ar: 'الموقع يُظهر إصدار البرنامج' }, { en: 'Hide it in the settings.', ar: 'أخفه من الإعدادات.' }],
    ['ok', { en: 'HTTPS is on', ar: 'HTTPS مفعّل' }, { en: 'Nothing to do.', ar: 'لا شيء مطلوب.' }]
  ];
  S.security = {
    init: function () { return { run: false }; },
    render: function (s) {
      var LV = { hi: { en: 'High', ar: 'عالية' }, md: { en: 'Medium', ar: 'متوسطة' }, lo: { en: 'Low', ar: 'منخفضة' }, ok: { en: 'OK', ar: 'سليم' } };
      return lab({ en: 'Website', ar: 'الموقع' }) + '<div class="ts-row"><input class="ts-input" value="yourbrand.com" readonly aria-readonly="true">' + btn('run', { en: 'Show sample report', ar: 'اعرض تقرير المثال' }, true) + '</div>' +
        (s.run ? '<ul class="sc-list">' + SEC.map(function (r) { return '<li class="' + r[0] + '"><em>' + esc(tx(LV[r[0]])) + '</em><div><b>' + esc(tx(r[1])) + '</b><small>' + esc(tx(r[2])) + '</small></div></li>'; }).join('') + '</ul>' : '<div class="sc-idle">' + esc(tx({ en: 'Your report lists every issue in plain words, ordered by risk.', ar: 'تقريرك يسرد كل مشكلة بكلام واضح، مرتبة حسب الخطورة.' })) + '</div>') +
        sample({ en: 'Sample report — no website was scanned. We only check sites and accounts with the owner’s permission.', ar: 'تقرير مثال — لم يُفحص أي موقع. لا نفحص إلا المواقع والحسابات بإذن أصحابها.' });
    },
    act: function (s, a) { if (a === 'run') s.run = true; }
  };

  /* T-14 Arabic Dialect Writer */
  var DM = [
    { l: { en: 'Orders open', ar: 'الطلبات مفتوحة' }, msa: 'الطلبات مفتوحة الآن، ونوصّلها إلى باب منزلك.', gulf: 'الطلبات مفتوحة الحين، ونوصّلها لين باب بيتك.', egypt: 'الطلبات اتفتحت دلوقتي، وبنوصّلها لحد باب بيتك.', levant: 'الطلبات صارت مفتوحة هلّق، وبنوصّلها لحد باب بيتك.', fr: 'Les commandes sont ouvertes, livraison jusqu’à votre porte.' },
    { l: { en: 'Open until 11', ar: 'مفتوحين لين 11' }, msa: 'مفتوحون اليوم حتى الساعة 11 مساءً.', gulf: 'مفتوحين اليوم لين الساعة 11 بالليل.', egypt: 'فاتحين النهارده لحد 11 بالليل.', levant: 'فاتحين اليوم لحد الساعة 11 بالليل.', fr: 'Ouvert aujourd’hui jusqu’à 23 h.' },
    { l: { en: 'Order confirmed', ar: 'تأكيد الطلب' }, msa: 'شكرًا لك! تم تأكيد طلبك.', gulf: 'شكرًا لك! طلبك تأكّد.', egypt: 'شكرًا ليك! الأوردر بتاعك اتأكّد.', levant: 'شكرًا إلك! طلبك تأكّد.', fr: 'Merci ! Votre commande est confirmée.' }
  ];
  var DL = [{ v: 'msa', l: { en: 'Standard', ar: 'الفصحى' } }, { v: 'gulf', l: { en: 'Gulf', ar: 'خليجي' } }, { v: 'egypt', l: { en: 'Egyptian', ar: 'مصري' } }, { v: 'levant', l: { en: 'Levantine', ar: 'شامي' } }, { v: 'fr', l: { en: 'French', ar: 'فرنسي' } }];
  S.dialect = {
    init: function () { return { m: 0, d: 'gulf' }; },
    render: function (s) {
      var line = DM[s.m][s.d], fr = s.d === 'fr';
      return lab({ en: 'Message', ar: 'الرسالة' }) + chips('m', DM.map(function (x, i) { return { v: i, l: x.l }; }), s.m) +
        lab({ en: 'Your customers speak', ar: 'عملاؤك يتكلمون' }) + chips('d', DL, s.d) +
        '<div class="ts-chips"><span class="ts-chip is-soon">' + esc(tx({ en: 'Iraqi', ar: 'عراقي' })) + ' <small>' + esc(tx({ en: 'soon', ar: 'قريبًا' })) + '</small></span><span class="ts-chip is-soon">' + esc(tx({ en: 'Moroccan', ar: 'مغربي' })) + ' <small>' + esc(tx({ en: 'soon', ar: 'قريبًا' })) + '</small></span></div>' +
        '<p class="dw-line" lang="' + (fr ? 'fr' : 'ar') + '" dir="' + (fr ? 'ltr' : 'rtl') + '">' + esc(line) + '</p>' +
        '<div class="ts-row">' + btn('ap', { en: s.ok ? 'Approved ✓' : 'Approve this line', ar: s.ok ? 'تم الاعتماد ✓' : 'اعتمد هذا السطر' }, true) + '</div>' +
        sample({ en: 'Beta. Every line is approved by you before it is used.', ar: 'نسخة تجريبية. كل سطر تعتمده أنت قبل استخدامه.' });
    },
    act: function (s, a, v) { if (a === 'm') { s.m = +v; s.ok = 0; } if (a === 'd') { s.d = v; s.ok = 0; } if (a === 'ap') s.ok = 1; }
  };

  /* ================= v2 · shared platform screens ================= */
  var DAYS = { en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], ar: ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'] };
  var PG = {
    instagram: [{ s: 'M7.5 3h9A4.5 4.5 0 0121 7.5v9a4.5 4.5 0 01-4.5 4.5h-9A4.5 4.5 0 013 16.5v-9A4.5 4.5 0 017.5 3zM12 8.1a3.9 3.9 0 100 7.8 3.9 3.9 0 000-7.8zM17.2 6.6h.01' }],
    tiktok: [{ f: 'M13.6 3h3.1c.3 2.2 1.8 3.8 4 4v3.1c-1.5 0-2.9-.5-4-1.3v6.5a6 6 0 11-6-6c.3 0 .6 0 .9.1v3.2a2.9 2.9 0 102 2.7z' }],
    snapchat: [{ f: 'M12 3c3.3 0 5.6 2.4 5.6 5.8v2.3l1.6-.5c.6-.1 1 .6.5 1-.6.5-1.6.8-2.2 1 .4 1.3 1.6 2.6 3 3 .5.2.4.9-.1 1-1 .2-1.5.3-1.7 1-.1.4-.5.5-.9.4-1-.2-2-.1-3 .6-1 .7-1.7 1.4-2.8 1.4s-1.8-.7-2.8-1.4c-1-.7-2-.8-3-.6-.4.1-.8 0-.9-.4-.2-.7-.7-.8-1.7-1-.5-.1-.6-.8-.1-1 1.4-.4 2.6-1.7 3-3-.6-.2-1.6-.5-2.2-1-.5-.4-.1-1.1.5-1l1.6.5V8.8C6.4 5.4 8.7 3 12 3z' }],
    whatsapp: [{ s: 'M12 3.4a8.6 8.6 0 00-7.4 13L3.4 20.6l4.3-1.1A8.6 8.6 0 1012 3.4z' }, { f: 'M9.3 7.6c.3 0 .5.1.7.5l.7 1.6c.1.3.1.5-.1.7l-.6.7c.6 1.2 1.6 2.2 2.8 2.8l.7-.6c.2-.2.4-.2.7-.1l1.6.7c.4.2.5.4.5.7 0 1.1-.9 2-2 2-3.4-.3-6.2-3.1-6.5-6.5 0-1.2.9-2.5 2-2.5z' }],
    facebook: [{ f: 'M13.6 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21z' }],
    youtube: [{ f: 'M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15.1V8.9l5.3 3.1z', e: 1 }],
    x: [{ f: 'M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z' }],
    linkedin: [{ f: 'M4.6 3A1.6 1.6 0 003 4.6v14.8A1.6 1.6 0 004.6 21h14.8a1.6 1.6 0 001.6-1.6V4.6A1.6 1.6 0 0019.4 3zm3.7 15.3H5.7V9.8h2.6zM7 8.6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm11.3 9.7h-2.6v-4.1c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2v4.2h-2.6V9.8h2.5V11c.4-.7 1.2-1.4 2.5-1.4 2.7 0 3.2 1.8 3.2 4.1z', e: 1 }],
    pinterest: [{ f: 'M12 2a10 10 0 00-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.5 2.1-.8 3.3-.2 1 .5 1.8 1.5 1.8 1.8 0 3.1-1.9 3.1-4.6 0-2.4-1.7-4.1-4.2-4.1-2.9 0-4.5 2.1-4.5 4.4 0 .9.3 1.8.8 2.3.1.1.1.2.1.3l-.3 1.2c0 .2-.2.2-.4.1-1.3-.6-2.1-2.5-2.1-4 0-3.3 2.4-6.3 6.9-6.3 3.6 0 6.4 2.6 6.4 6 0 3.6-2.3 6.5-5.4 6.5-1.1 0-2.1-.6-2.4-1.2l-.7 2.5c-.2.9-.9 2.1-1.3 2.8A10 10 0 1012 2z' }],
    google: [{ s: 'M18.1 6.3A8.3 8.3 0 1020.3 12.6H12.4' }],
    threads: [{ s: 'M17.6 8.4C16.5 5.7 14.4 4.3 11.9 4.3 7.6 4.3 5 7.4 5 12s2.6 7.7 6.9 7.7c3.4 0 5.9-2 5.9-4.7 0-2.5-2-3.9-4.8-3.9-2.2 0-3.6 1-3.6 2.5 0 1.4 1.2 2.3 2.8 2.3 2.6 0 3.7-2.1 3.4-5.6' }],
    meta: [{ s: 'M3 15.2C3 11.7 4.9 8 7.3 8c3 0 5.5 8 8.4 8 1.9 0 3.3-1.9 3.3-4.6S17.6 7 15.7 7c-2.7 0-5 7.6-8.4 8.6C4.6 16.3 3 15.9 3 15.2z' }],
    gmail: [{ s: 'M3.5 6.5h17v11h-17z' }, { s: 'M3.5 6.5 12 13l8.5-6.5' }, { s: 'M3.5 17.5 9.5 11.6M20.5 17.5l-6-5.9' }],
    outlook: [{ s: 'M10 5.5h10.5v13H10' }, { s: 'M10 8.5l5.2 3.6 5.3-3.6' }, { f: 'M2.5 6.2 11 4.6v14.8l-8.5-1.6zM6.8 9.4c-1.4 0-2.2 1.2-2.2 2.6s.8 2.6 2.2 2.6S9 13.4 9 12s-.8-2.6-2.2-2.6zm0 1.2c.6 0 .9.6.9 1.4s-.3 1.4-.9 1.4-.9-.6-.9-1.4.3-1.4.9-1.4z', e: 1 }],
    mail: [{ s: 'M3.5 6.5h17v11h-17zM3.5 7l8.5 6 8.5-6' }, { s: 'M15.5 15.6a2 2 0 1 0 0 0' }],
    messenger: [{ s: 'M12 3.3c-4.9 0-8.7 3.6-8.7 8.2 0 2.5 1.1 4.6 2.9 6.1v3.1l2.8-1.6c.9.3 1.9.4 3 .4 4.9 0 8.7-3.6 8.7-8.2S16.9 3.3 12 3.3z' }, { f: 'M6.8 14.2l3.1-4.9 2.6 2.1 3.6-2.1-3.1 4.9-2.6-2.1z' }],
    reviews: [{ f: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z' }]
  };
  function pg(id, cls) {
    var g = PG[id]; if (!g) return '';
    return '<svg class="pg ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + g.map(function (p) {
      return p.f ? '<path d="' + p.f + '" fill="currentColor"' + (p.e ? ' fill-rule="evenodd"' : '') + '/>' : '<path d="' + p.s + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
    }).join('') + '</svg>';
  }
  var IC = {
    heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z', comment: 'M4 5h16v11H9l-5 4z', send: 'M21 3 10 14M21 3l-7 18-4-7-7-4z',
    save: 'M6 3h12v18l-6-4-6 4z', share: 'M4 12v8h16v-8M12 3v12M7 8l5-5 5 5', like: 'M7 10v10H4V10zM7 10l4-7c1.5 0 2.5 1 2 3l-1 4h6c1 0 2 1 1.7 2l-2 7c-.3.8-1 1-1.7 1H7',
    repost: 'M5 9V7h12l-3-3M19 15v2H7l3 3', more: 'M5 12h.01M12 12h.01M19 12h.01', music: 'M9 18V5l11-2v13M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM20 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z',
    home: 'M3 11l9-7 9 7v9h-6v-6H9v6H3z', search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5', plus: 'M12 5v14M5 12h14', user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0', bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4'
  };
  function ic(n) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="' + IC[n] + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }

  /* the three brands — real logos and real published content */
  var BRANDS = {
    verse: { name: 'ZKJ VERSE', h: 'zkjverse', logo: 'assets/brand/zkjverse-mark-gold.svg', pics: ['assets/art/kj/kj-054-600.webp', 'assets/art/kj/kj-018-600.webp', 'assets/art/kj/kj-060-600.webp'], cap: { en: 'Limited is not a mood. It is arithmetic.', ar: 'المحدود مو كلمة تسويق — المحدود رقم.' } },
    vision: { name: 'KJ VISION', h: 'kjvision.zkj', logo: 'assets/showcase/brandkit/kjvision-emblem-gold.svg', pics: ['assets/art/kj/kj-067-600.webp', 'assets/art/kj/kj-072-600.webp', 'assets/art/kj/kj-009-600.webp'], cap: { en: 'Burj, silver night. Dubai, seen slowly.', ar: 'برج خليفة، ليلة فضية. دبي على مهل.' } },
    system: { name: 'ZKJ SYSTEM', h: 'zkjsystem', logo: 'assets/brand/zkjsystem-icon-primary.svg', pics: ['assets/try/zkjsystem-1.webp', 'assets/try/zkjsystem-2.webp', 'assets/try/zkjsystem-3.webp'], cap: { en: 'Every project becomes a tool. The tools run. You approve.', ar: 'كل مشروع يصبح أداة. الأدوات تعمل، وأنت تعتمد.' } }
  };
  /* platforms: theme + which formats exist there */
  var PF = {
    instagram: { n: 'Instagram', c: '#E1306C', bg: '#000', fg: '#fff', has: { post: 1, reel: 1, story: 1 }, rail: ['heart', 'comment', 'send'], bar: ['heart', 'comment', 'send', 'save'], ratio: '4/5' },
    tiktok: { n: 'TikTok', c: '#25F4EE', bg: '#000', fg: '#fff', has: { post: 1, reel: 1, story: 1 }, rail: ['heart', 'comment', 'save', 'share'], bar: ['heart', 'comment', 'save', 'share'], ratio: '9/16' },
    facebook: { n: 'Facebook', c: '#1877F2', bg: '#18191A', fg: '#E4E6EB', has: { post: 1, reel: 1, story: 1 }, rail: ['like', 'comment', 'share'], bar: ['like', 'comment', 'share'], ratio: '4/5' },
    youtube: { n: 'YouTube', c: '#FF0000', bg: '#0F0F0F', fg: '#fff', has: { post: 1, reel: 1 }, rail: ['like', 'comment', 'share', 'repost'], bar: ['like', 'comment', 'share'], ratio: '1/1', reelName: 'Shorts' },
    snapchat: { n: 'Snapchat', c: '#FFFC00', bg: '#000', fg: '#fff', has: { reel: 1, story: 1 }, rail: ['heart', 'comment', 'share'], reelName: 'Spotlight' },
    x: { n: 'X', c: '#E7E9EA', bg: '#000', fg: '#E7E9EA', has: { post: 1, reel: 1 }, rail: ['comment', 'repost', 'heart', 'share'], bar: ['comment', 'repost', 'heart', 'share'], ratio: '16/10' },
    linkedin: { n: 'LinkedIn', c: '#0A66C2', bg: '#1B1F23', fg: '#E9E9E9', has: { post: 1, reel: 1 }, rail: ['like', 'comment', 'repost', 'send'], bar: ['like', 'comment', 'repost', 'send'], ratio: '4/5' },
    pinterest: { n: 'Pinterest', c: '#E60023', bg: '#fff', fg: '#111', has: { post: 1, reel: 1 }, rail: ['heart', 'share'], bar: ['heart', 'share', 'more'], ratio: '2/3' }
  };
  var FMTN = { post: { en: 'Post', ar: 'منشور' }, reel: { en: 'Reel / video', ar: 'ريل / فيديو' }, story: { en: 'Story', ar: 'ستوري' } };
  function fmtFor(p, f) { return PF[p].has[f] ? f : (PF[p].has.reel ? 'reel' : 'post'); }
  function av(b) { return '<span class="sx-av"><img src="' + b.logo + '" alt=""></span>'; }
  /* one platform screen. f = post | reel | story; img = picture url */
  function screen(p, f, b, img, capText) {
    var P = PF[p]; f = fmtFor(p, f);
    var st = 'style="--sx-bg:' + P.bg + ';--sx-fg:' + P.fg + ';--sx-c:' + P.c + '"';
    var head = '<div class="sx-head">' + av(b) + '<b>' + esc(b.h) + '</b><span class="sx-pg">' + pg(p) + '</span></div>';
    if (f === 'post') {
      return '<div class="sx ' + p + ' post" ' + st + '>' + head + '<div class="sx-media" style="aspect-ratio:' + P.ratio + ';background-image:url(' + img + ')"></div>' +
        '<div class="sx-bar">' + P.bar.map(ic).join('') + '</div><p class="sx-cap"><b>' + esc(b.h) + '</b> ' + esc(capText) + '</p>' +
        '<div class="sx-ghost"><div class="sx-head">' + av(b) + '<b>' + esc(b.h) + '</b></div><div class="sx-media" style="aspect-ratio:' + P.ratio + ';background-image:url(' + img + ')"></div></div></div>';
    }
    if (f === 'story') {
      return '<div class="sx ' + p + ' vert story" ' + st + '><div class="sx-media full" style="background-image:url(' + img + ')"></div><div class="sx-prog"><i></i><i></i><i></i></div>' + head +
        '<div class="sx-reply">' + esc(tx({ en: 'Send message', ar: 'أرسل رسالة' })) + '</div></div>';
    }
    return '<div class="sx ' + p + ' vert reel" ' + st + '><div class="sx-media full" style="background-image:url(' + img + ')"></div><span class="sx-tab">' + esc(P.reelName || tx({ en: 'Reels', ar: 'ريلز' })) + '</span>' +
      '<div class="sx-rail">' + P.rail.map(ic).join('') + '</div><div class="sx-foot">' + head + '<p>' + esc(capText) + '</p><small>' + ic('music') + ' ' + esc(tx({ en: 'Original audio', ar: 'صوت أصلي' })) + '</small></div></div>';
  }
  function phone(inner) { return '<div class="dev-phone"><div class="dev-notch"></div>' + inner + '</div>'; }
  function desk(p, inner, wide) {
    var P = PF[p];
    return '<div class="dev-desk" style="--sx-bg:' + P.bg + ';--sx-fg:' + P.fg + ';--sx-c:' + P.c + '"><div class="dev-bar"><i></i><i></i><i></i><span>' + P.n.toLowerCase().replace(' ', '') + '.com</span></div>' +
      '<div class="dev-body"><nav class="dev-nav"><span class="sx-pg big">' + pg(p) + '</span>' + ['home', 'search', 'plus', 'bell', 'user'].map(ic).join('') + '</nav><div class="dev-main' + (wide ? ' wide' : '') + '">' + inner + '</div>' +
      '<aside class="dev-side"><i></i><i></i><i></i><i></i></aside></div></div>';
  }

  /* T-01 Brand Kit Builder — try your three logos in any colour, font and background */
  var LOGOS = { verse: { n: 'ZKJ VERSE', src: 'assets/brand/zkjverse-mark-gold.svg', tag: { en: 'Light is not illumination. It is energy.', ar: 'الضوء ليس إنارة. إنه طاقة.' } }, vision: { n: 'KJ VISION', src: 'assets/showcase/brandkit/kjvision-emblem-gold.svg', tag: { en: 'Seeing, engineered.', ar: 'الرؤية… بدقّة مهندس.' } }, system: { n: 'ZKJ SYSTEM', src: 'assets/brand/zkjsystem-icon-primary.svg', tag: { en: 'Every project becomes a tool.', ar: 'كل مشروع يصبح أداة.' } } };
  var COLS = ['#C9A84C', '#FFFFFF', '#9AA0A6', '#0B0B0F', '#1990C6', '#25C2C9', '#E5484D', '#7A3B1D'];
  var FONTS = [{ v: 'cinzel', l: 'Cinzel', f: 'Cinzel, serif', x: 'font-weight:600;letter-spacing:.14em' }, { v: 'corm', l: 'Cormorant', f: "'Cormorant Garamond', serif", x: 'font-weight:500;font-style:italic;letter-spacing:.02em' }, { v: 'inter', l: 'Inter', f: 'Inter, sans-serif', x: 'font-weight:700;letter-spacing:.06em;text-transform:uppercase' }, { v: 'thin', l: 'Inter Light', f: 'Inter, sans-serif', x: 'font-weight:400;letter-spacing:.32em;text-transform:uppercase' }, { v: 'kufi', l: 'Noto Kufi (AR)', f: "'Noto Kufi Arabic', sans-serif", x: 'font-weight:700' }];
  var BGS = ['', 'assets/art/kj/kj-067-600.webp', 'assets/art/kj/kj-054-600.webp', 'assets/art/kj/kj-026-600.webp', 'assets/art/kj/kj-059-600.webp', 'assets/art/kj/kj-016-600.webp', 'assets/art/kj/kj-072-600.webp', 'white'];
  function dark(h) { var n = parseInt(h.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255; return (0.2126 * r + 0.7152 * g + 0.0722 * b) < 90; }
  S.brand = {
    init: function () { return { lg: 'system', col: '#C9A84C', font: 'cinzel', bg: 1, lay: 'stack', name: '' }; },
    render: function (s) {
      var lo = LOGOS[s.lg];
      return '<div class="bk-wrap"><div class="bk-ctl">' + lab({ en: '1 · Your logo', ar: '١ · شعارك' }) +
        '<div class="bk-logos">' + Object.keys(LOGOS).map(function (k) { return '<button type="button" data-x="lg" data-v="' + k + '" aria-pressed="' + (k === s.lg) + '"><span class="m" style="-webkit-mask-image:url(' + LOGOS[k].src + ');mask-image:url(' + LOGOS[k].src + ')"></span><small>' + LOGOS[k].n + '</small></button>'; }).join('') + '</div>' +
        lab({ en: '2 · Colour', ar: '٢ · اللون' }) +
        '<div class="bk-cols">' + COLS.map(function (c) { return '<button type="button" data-x="col" data-v="' + c + '" aria-pressed="' + (c === s.col) + '" style="background:' + c + '"><span class="sr-only">' + c + '</span></button>'; }).join('') +
        '<label class="bk-pick"><input type="color" data-in="col" value="' + s.col + '"><span>' + esc(tx({ en: 'Any colour', ar: 'أي لون' })) + '</span></label></div>' +
        lab({ en: '3 · Font', ar: '٣ · الخط' }) + chips('font', FONTS.map(function (f) { return { v: f.v, l: f.l }; }), s.font) +
        lab({ en: '4 · Layout', ar: '٤ · التنسيق' }) + chips('lay', [{ v: 'stack', l: { en: 'Stacked', ar: 'عمودي' } }, { v: 'row', l: { en: 'Side by side', ar: 'أفقي' } }, { v: 'icon', l: { en: 'Icon only', ar: 'الرمز فقط' } }], s.lay) +
        lab({ en: '5 · Background — KJ’s artworks', ar: '٥ · الخلفية — من أعمال KJ' }) +
        '<div class="bk-bgs">' + BGS.map(function (b, i) { return '<button type="button" data-x="bg" data-v="' + i + '" aria-pressed="' + (i === s.bg) + '" style="' + (b === 'white' ? 'background:#F4F1EA' : b ? 'background-image:url(' + b + ')' : 'background:#0B0B0F') + '"><span class="sr-only">' + (i + 1) + '</span></button>'; }).join('') + '</div>' +
        '</div><div data-out>' + S.brand.out(s) + '</div></div>';
    },
    out: function (s) {
      var lo = LOGOS[s.lg], F = FONTS.filter(function (f) { return f.v === s.font; })[0], b = BGS[s.bg];
      var name = s.font === 'kufi' ? ({ verse: 'زي كي جي فيرس', vision: 'كي جي فيجن', system: 'زي كي جي سيستم' })[s.lg] : lo.n;
      var bgcss = b === 'white' ? 'background:#F4F1EA' : b ? 'background-image:linear-gradient(rgba(5,5,7,.45),rgba(5,5,7,.6)),url(' + b + ')' : 'background:#0B0B0F';
      var lock = '<div class="bk-lock ' + s.lay + '" style="color:' + s.col + '"><span class="m" style="background:' + s.col + ';-webkit-mask-image:url(' + lo.src + ');mask-image:url(' + lo.src + ')"></span>' +
        (s.lay === 'icon' ? '' : '<span class="n" style="font-family:' + F.f + ';' + F.x + '">' + esc(name) + '</span>') + '</div>';
      return '<div class="bk-stage" style="' + bgcss + '">' + lock + '<p class="bk-tg" style="color:' + s.col + '">' + esc(tx(lo.tag)) + '</p></div>' +
        '<div class="bk-apps">' +
        '<div class="bk-app ig"><span class="c" style="' + bgcss + '"><span class="m" style="background:' + s.col + ';-webkit-mask-image:url(' + lo.src + ');mask-image:url(' + lo.src + ')"></span></span><small>' + esc(tx({ en: 'Profile picture', ar: 'صورة الحساب' })) + '</small></div>' +
        '<div class="bk-app card"><span class="c" style="background:' + (dark(s.col) ? '#F4F1EA' : '#0B0B0F') + ';color:' + s.col + '"><span class="m" style="background:' + s.col + ';-webkit-mask-image:url(' + lo.src + ');mask-image:url(' + lo.src + ')"></span><b style="font-family:' + F.f + ';' + F.x + '">' + esc(name) + '</b></span><small>' + esc(tx({ en: 'Business card', ar: 'بطاقة العمل' })) + '</small></div>' +
        '<div class="bk-app sign"><span class="c" style="' + bgcss + ';color:' + s.col + '"><b style="font-family:' + F.f + ';' + F.x + '">' + esc(name) + '</b></span><small>' + esc(tx({ en: 'Shop sign', ar: 'لوحة المحل' })) + '</small></div></div>';
    },
    input: function (s, el, box) { if (el.getAttribute('data-in') === 'col') { s.col = el.value; box.querySelector('[data-out]').innerHTML = S.brand.out(s); box.querySelectorAll('[data-x="col"]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); } },
    act: function (s, a, v) { if (a === 'lg') s.lg = v; if (a === 'col') s.col = v; if (a === 'font') s.font = v; if (a === 'bg') s.bg = +v; if (a === 'lay') s.lay = v; }
  };

  /* T-03 Content Studio — your photo, framed the way each platform shows it, on phone or desktop */
  var CPH = ['assets/art/kj/kj-052-600.webp', 'assets/art/kj/kj-067-600.webp', 'assets/art/kj/kj-072-600.webp', 'assets/art/kj/kj-026-600.webp'];
  var CPL = ['instagram', 'tiktok', 'youtube', 'facebook', 'snapchat', 'x', 'linkedin', 'pinterest'];
  S.content = {
    wide: true,
    init: function () { return { ph: 0, p: 'instagram', f: 'post', d: 'phone' }; },
    render: function (s) {
      var f = fmtFor(s.p, s.f), b = { h: 'yourbrand', logo: 'assets/brand/zkjsystem-icon-white.svg' };
      var note = f !== s.f ? '<p class="cs-note">◆ ' + esc(tx({ en: FMTN[s.f].en + 's aren’t on ' + PF[s.p].n + ' — we make a ' + (PF[s.p].reelName || FMTN[f].en) + ' instead.', ar: 'لا يوجد ' + FMTN[s.f].ar + ' على ' + PF[s.p].n + ' — نصنع ' + (PF[s.p].reelName || FMTN[f].ar) + ' بدلًا منه.' })) + '</p>' : '';
      var cap = tx({ en: 'New season. Same slow ritual.', ar: 'موسم جديد… وطقوسنا على مهلها.' });
      var scr = screen(s.p, f, b, CPH[s.ph], cap);
      return '<div class="cs-grid"><div class="cs-ctl">' +
        lab({ en: '1 · Your photo', ar: '١ · صورتك' }) +
        '<div class="cs-ph">' + CPH.map(function (p, i) { return '<button type="button" data-x="ph" data-v="' + i + '" aria-pressed="' + (i === s.ph) + '" style="background-image:url(' + p + ')"><span class="sr-only">' + (i + 1) + '</span></button>'; }).join('') + '</div>' +
        lab({ en: '2 · Platform', ar: '٢ · المنصة' }) +
        '<div class="ts-chips">' + CPL.map(function (p) { return '<button type="button" class="ts-chip plt" data-x="p" data-v="' + p + '" aria-pressed="' + (p === s.p) + '" style="--pc:' + PF[p].c + '">' + pg(p) + PF[p].n + '</button>'; }).join('') + '</div>' +
        lab({ en: '3 · Format', ar: '٣ · الشكل' }) + chips('f', ['post', 'reel', 'story'].map(function (k) { return { v: k, l: FMTN[k] }; }), s.f) +
        lab({ en: '4 · Screen', ar: '٤ · الشاشة' }) + chips('d', [{ v: 'phone', l: { en: 'Phone', ar: 'جوال' } }, { v: 'desktop', l: { en: 'Desktop', ar: 'كمبيوتر' } }], s.d) + note +
        '</div><div class="cs-view ' + s.d + '" style="--pc:' + PF[s.p].c + '">' + (s.d === 'phone' ? phone(scr) : desk(s.p, scr, f === 'post' && s.p === 'x')) + '</div></div>' +
        sample({ en: 'Edited from your own photo — the same picture, shaped for each platform.', ar: 'محرَّر من صورتك — الصورة نفسها بشكل مناسب لكل منصة.' });
    },
    act: function (s, a, v) { if (a === 'ph') s.ph = +v; if (a === 'p') s.p = v; if (a === 'f') s.f = v; if (a === 'd') s.d = v; }
  };

  /* T-04 Social Media Publisher — one approval, every platform at once */
  var PPL = ['instagram', 'tiktok', 'facebook', 'youtube', 'snapchat', 'x', 'linkedin', 'pinterest'];
  S.publisher = {
    wide: true,
    init: function () { return { b: 'system', f: 'post', on: { instagram: 1, tiktok: 1, facebook: 1, youtube: 1 }, st: 'wait' }; },
    render: function (s) {
      var B = BRANDS[s.b], sel = PPL.filter(function (p) { return s.on[p]; });
      var cap = tx(B.cap);
      return '<div class="pb-wrap"><div class="pb-brands">' + Object.keys(BRANDS).map(function (k) { return '<button type="button" data-x="b" data-v="' + k + '" aria-pressed="' + (k === s.b) + '"><img src="' + BRANDS[k].logo + '" alt=""><span><b>' + BRANDS[k].name + '</b><small>@' + BRANDS[k].h + '</small></span></button>'; }).join('') + '</div>' +
        '<div class="ts-row pb-ctl">' + chips('f', ['post', 'reel', 'story'].map(function (k) { return { v: k, l: FMTN[k] }; }), s.f) + '</div>' +
        '<div class="ts-chips">' + PPL.map(function (p) { return '<button type="button" class="ts-chip plt" data-x="pl" data-v="' + p + '" aria-pressed="' + (!!s.on[p]) + '" style="--pc:' + PF[p].c + '"' + (s.st === 'done' ? ' disabled' : '') + '>' + pg(p) + PF[p].n + '</button>'; }).join('') + '</div>' +
        '<div class="pb-fan ' + s.st + '">' + (sel.length ? sel.map(function (p, i) {
          return '<figure>' + phone(screen(p, s.f, B, B.pics[i % 3], cap)) + '<figcaption>' + pg(p) + PF[p].n + (fmtFor(p, s.f) !== s.f ? ' · ' + esc(PF[p].reelName || tx(FMTN[fmtFor(p, s.f)])) : '') + '</figcaption>' + (s.st === 'done' ? '<span class="pb-stamp">✓ 20:30</span>' : '') + '</figure>';
        }).join('') : '<p class="sc-idle">' + esc(tx({ en: 'Pick at least one platform.', ar: 'اختر منصة واحدة على الأقل.' })) + '</p>') + '</div>' +
        '<div class="pb-when">' + DAYS[L()].map(function (d, i) { return '<span class="' + (i === 3 ? 'on' : '') + '">' + esc(d.slice(0, L() === 'ar' ? 8 : 3)) + (i === 3 ? '<b>20:30</b>' : '') + '</span>'; }).join('') + '</div>' +
        (s.st === 'wait' ? '<p class="pb-st wait">● ' + esc(tx({ en: 'One post, ' + sel.length + ' platforms — waiting for your approval', ar: 'منشور واحد على ' + sel.length + ' منصات — بانتظار موافقتك' })) + '</p><div class="ts-row">' + btn('ok', { en: 'Approve all', ar: 'موافقة على الكل' }, true) + btn('chg', { en: 'Request changes', ar: 'اطلب تعديل' }) + '</div>' : '') +
        (s.st === 'done' ? '<p class="pb-st ok">✓ ' + esc(tx({ en: 'Scheduled: Thursday 20:30 on ' + sel.length + ' platforms, through each platform’s official API.', ar: 'مُجدول الخميس 20:30 على ' + sel.length + ' منصات، عبر الواجهة الرسمية لكل منصة.' })) + '</p>' + btn('reset', { en: 'Undo', ar: 'تراجع' }) : '') +
        (s.st === 'chg' ? '<p class="pb-st chg">↺ ' + esc(tx({ en: 'Sent back to the studio with your note. Nothing was published.', ar: 'رجع للاستوديو مع ملاحظتك. لم يُنشر شيء.' })) + '</p>' + btn('reset', { en: 'Undo', ar: 'تراجع' }) : '') + '</div>';
    },
    act: function (s, a, v) { if (a === 'b') s.b = v; if (a === 'f') s.f = v; if (a === 'pl') s.on[v] = !s.on[v]; if (a === 'ok') s.st = 'done'; if (a === 'chg') s.st = 'chg'; if (a === 'reset') s.st = 'wait'; }
  };

  /* T-05 Inbox & Comments AI — every channel in one calm inbox */
  var CH = [
    { id: 'instagram', n: 'Instagram', c: '#E1306C', k: 2 }, { id: 'facebook', n: 'Facebook', c: '#1877F2', k: 1 }, { id: 'messenger', n: 'Messenger', c: '#A033FF', k: 1 },
    { id: 'tiktok', n: 'TikTok', c: '#25F4EE', k: 1 }, { id: 'youtube', n: 'YouTube', c: '#FF0000', k: 1 }, { id: 'whatsapp', n: 'WhatsApp', c: '#25D366', k: 1, via: 'T-06' },
    { id: 'reviews', n: { en: 'Google reviews', ar: 'تقييمات جوجل' }, c: '#FBBC04', k: 1, via: 'T-09' },
    { id: 'gmail', n: 'Gmail', c: '#EA4335', k: 1 }, { id: 'outlook', n: 'Outlook', c: '#0F78D4', k: 1 }, { id: 'mail', n: { en: 'Your own email', ar: 'بريدك الخاص' }, c: '#C9A84C', k: 1 }
  ];
  var MSG = [
    { ch: 'instagram', u: 'sara.m', m: 'كم سعر الكيك الصغير؟', r: { en: 'Hi Sara! Prices are on our menu — link in bio. We deliver to your door too.', ar: 'أهلًا سارة! الأسعار في المنيو بالرابط في البايو، ونوصّل لين باب البيت.' } },
    { ch: 'tiktok', u: 'omar_k', m: 'Are you open on Friday?', r: { en: 'Yes — Friday from 9 am to 11 pm. See you there!', ar: 'إي نعم — الجمعة من 9 الصبح لين 11 بالليل. نشوفك!' } },
    { ch: 'reviews', u: 'Hessa A.', m: '★★★★★ أفضل لاتيه في المنطقة', r: { en: 'Thank you Hessa! See you on your next visit.', ar: 'شكرًا حصة! ننتظرك في زيارتك الجاية.' } },
    { ch: 'youtube', u: '@roastlab', m: 'What beans do you use in this video?', r: { en: 'Single-origin, roasted in-house every week — the full list is in the description.', ar: 'بن من مصدر واحد نحمّصه عندنا كل أسبوع — القائمة كاملة في الوصف.' } },
    { ch: 'gmail', u: 'Noura K.', m: 'Can you host 12 people this Friday evening?', r: { en: 'Hi Noura, yes — we can seat 12 on Friday from 7 pm. Shall I hold the long table for you? (saved as a draft for your approval)', ar: 'أهلًا نورة، نعم — نقدر نستقبل 12 شخص يوم الجمعة من 7 المساء. نحجز لك الطاولة الطويلة؟ (محفوظ كمسودة بانتظار موافقتك)' } },
    { ch: 'outlook', u: 'Office manager · Atlas Co.', m: 'Do you do coffee catering for meetings?', r: { en: 'Thank you for asking — yes, we cater meetings. Could you share the date, number of guests and location? (draft for your approval)', ar: 'شكرًا لتواصلكم — نعم، نقدّم ضيافة القهوة للاجتماعات. ممكن التاريخ وعدد الضيوف والموقع؟ (مسودة بانتظار موافقتك)' } },
    { ch: 'mail', u: 'billing@supplier', m: 'Invoice #2207 attached', bad: 1, inv: 1 },
    { ch: 'facebook', u: 'guest_22', m: 'الطلب وصل بارد ومتأخر', bad: 1 }
  ];
  S.inbox = {
    wide: true,
    init: function () { return { ch: 'all', i: 0, sent: {} }; },
    render: function (s) {
      var list = MSG.map(function (m, i) { return [m, i]; }).filter(function (x) { return s.ch === 'all' || x[0].ch === s.ch; });
      var cur = MSG[s.i], C = function (id) { return CH.filter(function (c) { return c.id === id; })[0]; };
      return '<div class="ib-glass"><div class="ib-rail">' +
        '<button type="button" data-x="ch" data-v="all" aria-pressed="' + (s.ch === 'all') + '" class="ib-ch all"><b>' + esc(tx({ en: 'All', ar: 'الكل' })) + '</b><em>' + MSG.length + '</em></button>' +
        CH.map(function (c) { return c.soon ? '<span class="ib-ch soon" style="--cc:' + c.c + '" title="' + esc(tx(c.n)) + '">' + pg(c.id) + '<small>' + esc(tx({ en: 'soon', ar: 'قريبًا' })) + '</small><span class="sr-only">' + esc(tx(c.n)) + '</span></span>'
          : '<button type="button" class="ib-ch" data-x="ch" data-v="' + c.id + '" aria-pressed="' + (s.ch === c.id) + '" style="--cc:' + c.c + '">' + pg(c.id) + '<span class="sr-only">' + esc(tx(c.n)) + '</span>' + (c.k ? '<em>' + c.k + '</em>' : '') + '</button>'; }).join('') + '</div>' +
        '<div class="ib-col"><ul class="ib-list">' + (list.length ? list.map(function (x) { var m = x[0], c = C(m.ch); return '<li><button type="button" data-x="sel" data-v="' + x[1] + '" aria-pressed="' + (x[1] === s.i) + '"><span class="ib-badge" style="--cc:' + c.c + '">' + pg(m.ch) + '</span><span><b>' + esc(m.u) + '</b> <small>' + esc(tx(c.n)) + (c.via ? ' · ' + c.via : '') + '</small><br><q dir="auto">' + esc(m.m) + '</q></span>' + (s.sent[x[1]] ? '<em>✓</em>' : m.bad ? '<em class="bad">!</em>' : '') + '</button></li>'; }).join('') : '<li class="sc-idle">' + esc(tx({ en: 'Nothing new here.', ar: 'لا جديد هنا.' })) + '</li>') + '</ul>' +
        (cur.bad ? '<div class="ib-out bad">⚑ ' + esc(tx(cur.inv ? { en: 'Invoice — sent straight to you. Invoices, payments and legal mail are never answered automatically, and attachments from unknown senders are never opened.', ar: 'فاتورة — وصلتك مباشرة. الفواتير والمدفوعات والمراسلات القانونية لا يُرد عليها تلقائيًا، ولا تُفتح مرفقات من مرسلين غير معروفين.' } : { en: 'Complaint — sent straight to you. Complaints never get an automatic reply.', ar: 'شكوى — وصلتك مباشرة. الشكاوى لا يُرد عليها تلقائيًا أبدًا.' })) + '</div>'
          : '<div class="ib-out">' + lab({ en: 'Suggested reply · your brand voice', ar: 'رد مقترح · بنبرة علامتك' }) + '<p class="ib-reply" dir="auto">' + esc(tx(cur.r)) + '</p>' +
            (s.sent[s.i] ? '<p class="pb-st ok">✓ ' + esc(tx({ en: 'Sent (sample)', ar: 'أُرسل (مثال)' })) + '</p>' : '<div class="ts-row">' + btn('send', { en: 'Send', ar: 'إرسال' }, true) + btn('esc', { en: 'Send to me instead', ar: 'حوّلها لي' }) + '</div>') + '</div>') +
        '</div></div>' +
        sample({ en: 'Instagram, Facebook, Messenger, TikTok, YouTube and email (Gmail, Outlook, your own domain). WhatsApp and Google reviews come with their own tools. Email replies are saved as drafts until you approve.', ar: 'إنستغرام وفيسبوك وماسنجر وتيك توك ويوتيوب والإيميل (جيميل وأوتلوك وبريدك الخاص). واتساب وتقييمات جوجل مع أدواتها الخاصة. ردود الإيميل تُحفظ كمسودات حتى توافق.' });
    },
    act: function (s, a, v) { if (a === 'ch') { s.ch = v; var f = MSG.map(function (m, i) { return [m, i]; }).filter(function (x) { return v === 'all' || x[0].ch === v; }); if (f.length) s.i = f[0][1]; } if (a === 'sel') s.i = +v; if (a === 'send') s.sent[s.i] = 1; if (a === 'esc') s.i = MSG.length - 1; }
  };

  /* T-08 YouTube Growth — see your video on YouTube, then pick the title */
  var YV = [
    { l: { en: 'How we roast our beans', ar: 'كيف نحمّص البن' }, img: 'assets/art/kj/kj-052-600.webp', t: [{ en: 'How We Roast Our Beans (Start to Cup)', ar: 'من الحبة للفنجان: كيف نحمّص قهوتنا' }, { en: '12 Minutes That Decide Your Coffee’s Taste', ar: '12 دقيقة تحدد طعم قهوتك' }, { en: 'Light vs Dark Roast — We Tried Both', ar: 'تحميص فاتح أو غامق؟ جرّبنا الاثنين' }], th: [{ en: '12 MINUTES', ar: '12 دقيقة' }, { en: 'START TO CUP', ar: 'من الحبة للفنجان' }, { en: 'LIGHT VS DARK', ar: 'فاتح ولا غامق؟' }] },
    { l: { en: 'Dubai at night', ar: 'دبي في الليل' }, img: 'assets/art/kj/kj-067-600.webp', t: [{ en: 'Dubai at Night, Shot on One Lens', ar: 'دبي في الليل بعدسة واحدة' }, { en: 'The Burj Like You’ve Never Seen It', ar: 'برج خليفة كما لم تره من قبل' }, { en: 'One Night, 400 Photos, One Frame', ar: 'ليلة واحدة، 400 صورة، لقطة واحدة' }], th: [{ en: 'ONE LENS', ar: 'عدسة واحدة' }, { en: 'NEVER SEEN', ar: 'ما شفته قبل' }, { en: '400 → 1', ar: '400 ← 1' }] }
  ];
  S.youtube = {
    wide: true,
    init: function () { return { v: 0, f: 'long', t: 0, d: 'phone' }; },
    render: function (s) {
      var V = YV[s.v], title = tx(V.t[s.t]), th = tx(V.th[s.t]);
      var ch = '<div class="yt-ch"><span class="sx-av"><img src="assets/brand/zkjsystem-icon-white.svg" alt=""></span><span><b>yourbrand</b><small>' + esc(tx({ en: 'New channel', ar: 'قناة جديدة' })) + '</small></span><em>' + esc(tx({ en: 'Subscribe', ar: 'اشترك' })) + '</em></div>';
      var player = '<div class="yt-player ' + s.f + '" style="background-image:url(' + V.img + ')"><b>' + esc(th) + '</b>' + (s.f === 'long' ? '<i class="yt-time">12:04</i><span class="yt-prog"><em></em></span><span class="yt-play">' + pg('youtube') + '</span>' : '<div class="sx-rail">' + ['like', 'comment', 'share', 'repost'].map(ic).join('') + '</div>') + '</div>';
      var watch = s.f === 'long'
        ? player + '<h4 class="yt-title">' + esc(title) + '</h4><p class="yt-meta">' + esc(tx({ en: 'Sample · 0 views · just now', ar: 'مثال · 0 مشاهدة · الآن' })) + '</p>' + ch + '<div class="yt-acts">' + ['like', 'share', 'save'].map(ic).join('') + '</div>'
        : player + '<div class="yt-sfoot">' + ch + '<p>' + esc(title) + '</p></div>';
      var upnext = '<div class="yt-next">' + [V.img, 'assets/art/kj/kj-059-600.webp', 'assets/art/kj/kj-072-600.webp'].map(function (im, i) { return '<div><span style="background-image:url(' + im + ')"></span><small>' + (i ? '&nbsp;' : esc(title)) + '</small></div>'; }).join('') + '</div>';
      var app = '<div class="yt-app ' + s.f + '"><div class="yt-top"><span class="yt-logo">' + pg('youtube') + '<b>YouTube</b></span>' + ic('search') + '</div>' + watch + (s.f === 'long' ? '<div class="yt-pnext">' + upnext + '</div>' : '') + '</div>';
      var view = s.d === 'phone' ? phone(app) : '<div class="dev-desk yt" style="--sx-bg:#0F0F0F;--sx-fg:#fff;--sx-c:#FF0000"><div class="dev-bar"><i></i><i></i><i></i><span>youtube.com</span></div><div class="yt-deskbody"><div class="yt-deskmain">' + (s.f === 'long' ? '<div class="yt-top"><span class="yt-logo">' + pg('youtube') + '<b>YouTube</b></span><span class="yt-sbar">' + ic('search') + '</span></div>' : '') + watch + '</div>' + (s.f === 'long' ? upnext : '') + '</div></div>';
      return '<div class="cs-grid"><div class="cs-ctl">' +
        lab({ en: '1 · Your video', ar: '١ · فيديوك' }) + chips('v', YV.map(function (x, i) { return { v: i, l: x.l }; }), s.v) +
        lab({ en: '2 · Long video or Short', ar: '٢ · فيديو طويل أو شورت' }) + chips('f', [{ v: 'long', l: { en: 'Long video', ar: 'فيديو طويل' } }, { v: 'short', l: { en: 'Short', ar: 'شورت' } }], s.f) +
        lab({ en: '3 · Pick a title — watch it change', ar: '٣ · اختر عنوانًا — وشاهده يتغيّر' }) +
        '<div class="yt-opts">' + V.t.map(function (x, i) { return '<button type="button" data-x="t" data-v="' + i + '" aria-pressed="' + (i === s.t) + '"><b>' + (i + 1) + '</b>' + esc(tx(x)) + '</button>'; }).join('') + '</div>' +
        lab({ en: '4 · Screen', ar: '٤ · الشاشة' }) + chips('d', [{ v: 'phone', l: { en: 'Phone', ar: 'جوال' } }, { v: 'desktop', l: { en: 'Desktop', ar: 'كمبيوتر' } }], s.d) +
        '<div class="ts-tags">' + ['#coffee', '#قهوة', '#dubai', '#behindthescenes'].map(function (h) { return '<span>' + h + '</span>'; }).join('') + '</div>' +
        '</div><div class="cs-view ' + s.d + '">' + view + '</div></div>' +
        sample({ en: 'Your title, thumbnail, description and tags are written for search — you approve them before upload.', ar: 'العنوان والصورة المصغّرة والوصف والوسوم مكتوبة لتظهر في البحث — وتعتمدها قبل الرفع.' });
    },
    act: function (s, a, v) { if (a === 'v') { s.v = +v; s.t = 0; } if (a === 'f') s.f = v; if (a === 't') s.t = +v; if (a === 'd') s.d = v; }
  };

  /* ================= SHEET ================= */
  var sheet, box, cur, state, lastFocus;
  function tool(id) { for (var i = 0; i < Z.TOOLS.length; i++) if (Z.TOOLS[i].id === id) return Z.TOOLS[i]; return null; }
  function build() {
    sheet = document.createElement('div');
    sheet.className = 'try-sheet'; sheet.hidden = true;
    sheet.innerHTML = '<div class="try-back" data-close></div><div class="try-panel" role="dialog" aria-modal="true" aria-labelledby="try-title"><div class="try-in" id="try-in"></div></div>';
    document.body.appendChild(sheet);
    box = sheet.querySelector('#try-in');
    sheet.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) { close(); return; }
      var x = e.target.closest('[data-x]');
      if (x && !x.disabled && S[cur].act) { S[cur].act(state, x.getAttribute('data-x'), x.getAttribute('data-v')); stage(); var again = box.querySelector('[data-x="' + x.getAttribute('data-x') + '"][data-v="' + (x.getAttribute('data-v') || '') + '"]') || box.querySelector('[data-x="' + x.getAttribute('data-x') + '"]'); if (again) again.focus(); }
    });
    sheet.addEventListener('input', function (e) { if (S[cur].input) S[cur].input(state, e.target, box); });
    document.addEventListener('keydown', function (e) {
      if (sheet.hidden) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') {
        var f = sheet.querySelectorAll('button:not([disabled]),a[href],input');
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
  }
  function stage() {
    var st = box.querySelector('[data-stage]');
    if (st) st.innerHTML = S[cur].render(state);
    if (S[cur].after) S[cur].after(box);
  }
  function paint() {
    var tl = tool(cur), d = tl[L()];
    sheet.querySelector('.try-panel').classList.toggle('wide', !!S[cur].wide);
    box.innerHTML =
      '<div class="try-top"><span class="tag">EX-' + tl.code.slice(2) + ' · ' + esc(t('try.eyebrow')) + '</span><button type="button" class="icon-btn try-x" data-close aria-label="' + esc(t('try.close')) + '">' + Z.ICONS.close + '</button></div>' +
      '<div class="try-head"><div class="tool-icon">' + tl.icon + '</div><div><h2 id="try-title">' + esc(d.name) + '</h2><p>' + esc(d.tag) + '</p></div></div>' +
      '<div class="try-stage" data-stage></div>' +
      '<p class="try-note">' + esc(t('try.note')) + '</p>' +
      '<div class="try-cta"><a class="btn btn-primary btn-wa" target="_blank" rel="noopener" href="' + esc(Z.waLink({ type: 'tool', id: cur })) + '">' + Z.ICONS.wa + '<span>' + esc(t('try.use')) + '</span></a><button type="button" class="btn btn-ghost" data-close>' + esc(t('try.more')) + '</button></div>';
    stage();
  }
  function open(id) {
    if (!S[id] || !tool(id)) return;
    if (!sheet) build();
    lastFocus = document.activeElement;
    cur = id; state = S[id].init();
    paint();
    sheet.hidden = false;
    document.documentElement.classList.add('try-open');
    requestAnimationFrame(function () { sheet.classList.add('on'); var x = sheet.querySelector('.try-x'); if (x) x.focus(); });
  }
  function close() {
    if (!sheet || sheet.hidden) return;
    sheet.classList.remove('on'); sheet.hidden = true;
    document.documentElement.classList.remove('try-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-try]');
    if (b) { e.preventDefault(); open(b.getAttribute('data-try')); }
  });
  Z.onLang(function () { if (sheet && !sheet.hidden) { state = S[cur].init(); paint(); } });
  window.ZKJTry = { open: open, close: close, ids: Z.TOOLS.map(function (x) { return x.id; }).filter(function (id) { return S[id]; }) };
})();
