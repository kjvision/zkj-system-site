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

  /* T-01 Brand Kit Builder */
  var MOODS = {
    warm: { l: { en: 'Warm', ar: 'دافئ' }, pal: ['#2B1D14', '#7A3B1D', '#D9A066', '#F4EAD9', '#1F3B2C'], font: "'Cormorant Garamond', Georgia, serif", fx: 'font-style:italic;font-weight:500', tag: { en: 'Slow coffee. Warm welcome.', ar: 'قهوة على مهلها، وترحيب دافئ.' } },
    bold: { l: { en: 'Bold', ar: 'جريء' }, pal: ['#0E0E10', '#E5484D', '#FFD23F', '#F5F5F5', '#2D2D33'], font: 'Inter, sans-serif', fx: 'font-weight:700;text-transform:uppercase;letter-spacing:.04em', tag: { en: 'Big flavour. No waiting.', ar: 'نكهة قوية، بلا انتظار.' } },
    calm: { l: { en: 'Calm', ar: 'هادئ' }, pal: ['#F3F1EC', '#D8CFC0', '#A8B5A2', '#5E7363', '#2F3B33'], font: 'Inter, sans-serif', fx: 'font-weight:400;text-transform:lowercase;letter-spacing:.18em', tag: { en: 'A quiet cup, made well.', ar: 'فنجان هادئ، مصنوع بإتقان.' } },
    luxe: { l: { en: 'Luxe', ar: 'فاخر' }, pal: ['#0B0B0F', '#D4AF37', '#EAD9A6', '#9AA0A6', '#FFFFFF'], font: 'Cinzel, serif', fx: 'font-weight:600;letter-spacing:.12em', tag: { en: 'Made for those who notice.', ar: 'لمن يلاحظ التفاصيل.' } }
  };
  S.brand = {
    init: function () { return { mood: 'warm', name: L() === 'ar' ? 'بيت القهوة' : 'Qahwa House' }; },
    render: function (s) {
      var m = MOODS[s.mood], p = m.pal, dark = s.mood !== 'calm';
      return lab({ en: 'Your business name', ar: 'اسم نشاطك' }) +
        '<input class="ts-input" data-in="name" value="' + esc(s.name) + '" maxlength="24" aria-label="' + esc(tx({ en: 'Business name', ar: 'اسم النشاط' })) + '">' +
        lab({ en: 'Pick a feeling', ar: 'اختر الإحساس' }) +
        chips('mood', Object.keys(MOODS).map(function (k) { return { v: k, l: MOODS[k].l }; }), s.mood) +
        '<div class="ts-out" data-out>' + S.brand.out(s) + '</div>';
    },
    out: function (s) {
      var m = MOODS[s.mood], p = m.pal, fg = s.mood === 'calm' ? p[4] : p[3];
      var ini = (s.name || '?').trim().charAt(0).toUpperCase();
      return '<div class="bk-logo" style="background:' + p[0] + ';color:' + fg + '"><span class="bk-mark" style="border-color:' + p[2] + ';color:' + p[2] + ';font-family:' + m.font + '">' + esc(ini) + '</span>' +
        '<span class="bk-name" style="font-family:' + m.font + ';' + m.fx + '">' + esc(s.name || '—') + '</span>' +
        '<span class="bk-tag" style="color:' + p[2] + '">' + esc(tx(m.tag)) + '</span></div>' +
        '<div class="bk-pal">' + p.map(function (c) { return '<span style="background:' + c + '"><i>' + c + '</i></span>'; }).join('') + '</div>' +
        '<div class="bk-type"><span style="font-family:' + m.font + ';' + m.fx + '">Aa</span><span class="ar">أبجد</span><small>' + esc(tx({ en: 'Headline + Arabic pair, with voice rules and a guideline PDF', ar: 'خط العناوين مع خط عربي مناسب، وقواعد النبرة ودليل PDF' })) + '</small></div>';
    },
    input: function (s, el, box) { s.name = el.value; box.querySelector('[data-out]').innerHTML = S.brand.out(s); },
    act: function (s, a, v) { if (a === 'mood') s.mood = v; }
  };

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

  /* T-03 Content Studio */
  var PH = ['kj-052', 'kj-067', 'kj-072'];
  var FMT = [{ v: 'post', l: { en: 'Post 4:5', ar: 'منشور' } }, { v: 'story', l: { en: 'Story', ar: 'ستوري' } }, { v: 'reel', l: { en: 'Reel cover', ar: 'غلاف ريل' } }];
  S.content = {
    init: function () { return { ph: 0, fmt: 'post' }; },
    render: function (s) {
      return lab({ en: '1 · Your photo', ar: '١ · صورتك' }) +
        '<div class="cs-ph">' + PH.map(function (p, i) { return '<button type="button" data-x="ph" data-v="' + i + '" aria-pressed="' + (i === s.ph ? 'true' : 'false') + '" style="background-image:url(' + ART + p + '-600.webp)"><span class="sr-only">' + (i + 1) + '</span></button>'; }).join('') + '</div>' +
        lab({ en: '2 · Format', ar: '٢ · الشكل' }) + chips('fmt', FMT, s.fmt) +
        '<div class="cs-prev ' + s.fmt + '" style="background-image:url(' + ART + PH[s.ph] + '-600.webp)"><span class="cs-top">yourbrand</span>' +
        (s.fmt === 'reel' ? '<span class="cs-play">▶</span>' : '') +
        '<span class="cs-h">' + esc(tx({ en: 'New season. Same slow ritual.', ar: 'موسم جديد… وطقوسنا على مهلها.' })) + '</span><span class="cs-badge">' + esc(tx({ en: 'Edited from your photo', ar: 'محرَّر من صورتك' })) + '</span></div>' +
        '<p class="cs-cap"><b>yourbrand</b> ' + esc(tx({ en: 'New season, same slow ritual. Come early — the first batch goes fast.', ar: 'موسم جديد وطقوسنا نفسها. تعال بدري — أول دفعة تخلص بسرعة.' })) + '</p>';
    },
    act: function (s, a, v) { if (a === 'ph') s.ph = +v; if (a === 'fmt') s.fmt = v; }
  };

  /* T-04 Social Media Publisher */
  var PLAT = [['ig', 'Instagram', '#E1306C'], ['fb', 'Facebook', '#1877F2'], ['tt', 'TikTok', '#25C2C9'], ['yt', 'YouTube', '#FF3B30'], ['x', 'X', '#8B95A1'], ['li', 'LinkedIn', '#0A66C2'], ['pi', 'Pinterest', '#D5243A']];
  var DAYS = { en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], ar: ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'] };
  S.publisher = {
    init: function () { return { on: { ig: 1, fb: 1, tt: 1 }, st: 'wait' }; },
    render: function (s) {
      var n = Object.keys(s.on).filter(function (k) { return s.on[k]; }).length;
      return '<div class="pb-week">' + DAYS[L()].map(function (d, i) { return '<div class="' + (i === 3 ? 'on' : '') + '"><small>' + esc(d) + '</small>' + (i === 3 ? '<span class="pb-post" style="background-image:url(' + ART + 'kj-052-600.webp)"></span><b>20:30</b>' : '') + '</div>'; }).join('') + '</div>' +
        '<div class="pb-card"><span class="pb-th" style="background-image:url(' + ART + 'kj-052-600.webp)"></span><div><b>' + esc(tx({ en: 'Autumn menu — carousel', ar: 'منيو الخريف — كاروسيل' })) + '</b><small>' + esc(tx({ en: 'Thursday 20:30', ar: 'الخميس 20:30' })) + '</small></div></div>' +
        lab({ en: 'Publish to', ar: 'انشر على' }) +
        '<div class="ts-chips">' + PLAT.map(function (p) { return '<button type="button" class="ts-chip pl" data-x="pl" data-v="' + p[0] + '" aria-pressed="' + (s.on[p[0]] ? 'true' : 'false') + '"' + (s.st === 'done' ? ' disabled' : '') + '><i style="background:' + p[2] + '"></i>' + p[1] + '</button>'; }).join('') + '</div>' +
        (s.st === 'wait' ? '<p class="pb-st wait">● ' + esc(tx({ en: 'Waiting for your approval', ar: 'بانتظار موافقتك' })) + '</p><div class="ts-row">' + btn('ok', { en: 'Approve', ar: 'موافقة' }, true) + btn('chg', { en: 'Request changes', ar: 'اطلب تعديل' }) + '</div>' : '') +
        (s.st === 'done' ? '<p class="pb-st ok">✓ ' + esc(tx({ en: 'Scheduled for Thursday 20:30 on ' + n + ' platforms — through official APIs.', ar: 'مُجدول الخميس 20:30 على ' + n + ' منصات — عبر الواجهات الرسمية.' })) + '</p>' + btn('reset', { en: 'Undo', ar: 'تراجع' }) : '') +
        (s.st === 'chg' ? '<p class="pb-st chg">↺ ' + esc(tx({ en: 'Sent back to the studio with your note. Nothing was published.', ar: 'رجع للاستوديو مع ملاحظتك. لم يُنشر شيء.' })) + '</p>' + btn('reset', { en: 'Undo', ar: 'تراجع' }) : '');
    },
    act: function (s, a, v) { if (a === 'pl') s.on[v] = !s.on[v]; if (a === 'ok') s.st = 'done'; if (a === 'chg') s.st = 'chg'; if (a === 'reset') s.st = 'wait'; }
  };

  /* T-05 Inbox & Comments AI */
  var CM = [
    { u: 'sara.m', p: 'Instagram', m: 'كم سعر الكيك الصغير؟', r: { en: 'Hi Sara! Prices are on our menu — link in bio. We deliver to your door too.', ar: 'أهلًا سارة! الأسعار في المنيو بالرابط في البايو، ونوصّل لين باب البيت.' } },
    { u: 'omar_k', p: 'TikTok', m: 'Are you open on Friday?', r: { en: 'Yes — Friday from 9 am to 11 pm. See you there!', ar: 'إي نعم — الجمعة من 9 الصبح لين 11 بالليل. نشوفك!' } },
    { u: 'guest_22', p: 'Facebook', m: 'الطلب وصل بارد ومتأخر', bad: true }
  ];
  S.inbox = {
    init: function () { return { i: 0, sent: {} }; },
    render: function (s) {
      var c = CM[s.i];
      return '<ul class="ib-list">' + CM.map(function (x, i) { return '<li><button type="button" data-x="sel" data-v="' + i + '" aria-pressed="' + (i === s.i ? 'true' : 'false') + '"><i class="' + (x.bad ? 'bad' : '') + '"></i><span><b>' + x.u + '</b> <small>' + x.p + '</small><br><q dir="auto">' + esc(x.m) + '</q></span>' + (s.sent[i] ? '<em>✓</em>' : '') + '</button></li>'; }).join('') + '</ul>' +
        (c.bad ? '<div class="ib-out bad">⚑ ' + esc(tx({ en: 'Complaint — sent straight to you. Complaints never get an automatic reply.', ar: 'شكوى — وصلتك مباشرة. الشكاوى لا يُرد عليها تلقائيًا أبدًا.' })) + '</div>'
          : '<div class="ib-out">' + lab({ en: 'Suggested reply · your brand voice', ar: 'رد مقترح · بنبرة علامتك' }) + '<p class="ib-reply" dir="auto">' + esc(tx(c.r)) + '</p>' +
            (s.sent[s.i] ? '<p class="pb-st ok">✓ ' + esc(tx({ en: 'Sent (sample)', ar: 'أُرسل (مثال)' })) + '</p>' : '<div class="ts-row">' + btn('send', { en: 'Send', ar: 'إرسال' }, true) + btn('esc', { en: 'Send to me instead', ar: 'حوّلها لي' }) + '</div>') + '</div>');
    },
    act: function (s, a, v) { if (a === 'sel') s.i = +v; if (a === 'send') s.sent[s.i] = 1; if (a === 'esc') { CM[s.i].escalated = 1; s.i = 2; } }
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

  /* T-08 YouTube Growth */
  var YT = [
    { l: { en: 'How we roast our beans', ar: 'كيف نحمّص البن' }, t: [{ en: 'How We Roast Our Beans (Start to Cup)', ar: 'من الحبة للفنجان: كيف نحمّص قهوتنا' }, { en: '12 Minutes That Decide Your Coffee’s Taste', ar: '12 دقيقة تحدد طعم قهوتك' }, { en: 'Light vs Dark Roast — We Tried Both', ar: 'تحميص فاتح أو غامق؟ جرّبنا الاثنين' }], s: [{ en: 'The 12-minute roast', ar: 'تحميصة الـ 12 دقيقة' }] },
    { l: { en: 'A day behind the counter', ar: 'يوم خلف الكاونتر' }, t: [{ en: 'A Full Day Behind Our Coffee Counter', ar: 'يوم كامل خلف كاونتر القهوة' }, { en: '6 AM to Close: Running a Small Café', ar: 'من 6 الصبح للإغلاق: يوم في مقهى صغير' }, { en: 'What Customers Never See', ar: 'اللي ما يشوفه الزبون' }], s: [{ en: '6 AM, before the doors open', ar: '6 الصبح، قبل ما نفتح' }] }
  ];
  S.youtube = {
    init: function () { return { i: 0, f: 'long' }; },
    render: function (s) {
      var y = YT[s.i];
      return lab({ en: 'Your video', ar: 'فيديوك' }) + chips('i', YT.map(function (x, i) { return { v: i, l: x.l }; }), s.i) +
        chips('f', [{ v: 'long', l: { en: 'Long video', ar: 'فيديو طويل' } }, { v: 'short', l: { en: 'Short', ar: 'شورت' } }], s.f) +
        '<div class="yt-thumb ' + s.f + '" style="background-image:url(' + ART + (s.i ? 'kj-067' : 'kj-052') + '-600.webp)"><b>' + esc(tx(s.f === 'short' ? y.s[0] : y.t[1])) + '</b>' + (s.f === 'long' ? '<i>12:04</i>' : '<i>0:45</i>') + '</div>' +
        lab({ en: 'Title options', ar: 'خيارات العنوان' }) + '<ol class="yt-t">' + (s.f === 'short' ? y.s.concat(y.t.slice(0, 1)) : y.t).map(function (x) { return '<li>' + esc(tx(x)) + '</li>'; }).join('') + '</ol>' +
        '<div class="ts-tags">' + ['#coffee', '#قهوة', '#roasting', '#behindthescenes'].map(function (h) { return '<span>' + h + '</span>'; }).join('') + '</div>';
    },
    act: function (s, a, v) { if (a === 'i') s.i = +v; if (a === 'f') s.f = v; }
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
      var c = MAT[s.m], g = '#D4AF37';
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
        '<g stroke="#cfe0ff" fill="none" stroke-width="1.6"><rect x="30" y="30" width="260" height="140"/><path d="M30 95H130M175 95H290M130 30V95M200 130V170"/><path d="M130 95a22 22 0 0 1 22-22" stroke="#D4AF37"/></g>' +
        '<g fill="#9fc0ff" font-size="11"' + dir + '><text x="80" y="66" text-anchor="middle">' + T.k + '</text><text x="210" y="66" text-anchor="middle">' + T.s + '</text><text x="110" y="138" text-anchor="middle">' + T.c + '</text><text x="245" y="155" text-anchor="middle">' + T.w + '</text></g>' +
        '<g stroke="#D4AF37" stroke-width="1"><path d="M30 18H290M30 14V22M290 14V22"/><path d="M302 30V170M298 30H306M298 170H306"/></g>' +
        '<g fill="#EAD9A6" font-size="11"' + dir + '><text x="160" y="13" text-anchor="middle">' + T.d1 + '</text><text x="312" y="104" text-anchor="middle" transform="rotate(90 312 104)">' + T.d2 + '</text></g>' +
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
  window.ZKJTry = { open: open, close: close, ids: Object.keys(S) };
})();
