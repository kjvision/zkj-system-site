/* ZKJ SYSTEM — "Find your tools in 30 seconds": four taps, three suggested tools.
   Nothing is stored or sent by us. The answers only go into a WhatsApp message if the visitor taps the button. */
(function () {
  'use strict';
  var Z = window.ZKJ;
  if (!Z) return;
  var esc = Z.esc, t = Z.t;
  var card = document.getElementById('quiz-card');
  if (!card) return;

  /* ----- questions: id, label (en/ar), weights { toolId: points } ----- */
  var Q = [
    { id: 'biz', en: 'What kind of business do you run?', ar: 'ما نوع نشاطك التجاري؟', opts: [
      { en: 'Restaurant or café', ar: 'مطعم أو مقهى', w: { content: 2, google: 2, publisher: 1, whatsapp: 1, inbox: 1 } },
      { en: 'Clinic, salon or gym', ar: 'عيادة أو صالون أو نادٍ رياضي', w: { whatsapp: 2, content: 1, inbox: 1, google: 1, smm: 1 } },
      { en: 'Shop or online store', ar: 'متجر أو متجر إلكتروني', w: { smm: 2, content: 1, whatsapp: 1, dialect: 1, publisher: 1 } },
      { en: 'Real estate, construction or design', ar: 'عقارات أو مقاولات أو تصميم', w: { builder3d: 2, drawings: 2, content: 1 } },
      { en: 'Creator or personal brand', ar: 'صانع محتوى أو علامة شخصية', w: { content: 2, youtube: 2, publisher: 1, brand: 1 } },
      { en: 'Something else', ar: 'نشاط آخر', w: { audit: 1, brand: 1 } }
    ] },
    { id: 'pain', en: 'What slows you down most?', ar: 'ما أكثر شيء يعطّلك؟', opts: [
      { en: 'Not enough people see us', ar: 'قليلون يرون علامتنا', w: { smm: 3, google: 2, youtube: 1, publisher: 1 } },
      { en: 'Making content takes too long', ar: 'صناعة المحتوى تأخذ وقتًا طويلًا', w: { content: 3, publisher: 2, dialect: 1, brand: 1 } },
      { en: 'Customers wait too long for replies', ar: 'العملاء ينتظرون الرد طويلًا', w: { whatsapp: 3, inbox: 3, dialect: 1 } },
      { en: 'I don’t know what works', ar: 'لا أعرف ما الذي ينجح', w: { audit: 3, insights: 3 } },
      { en: 'We don’t look consistent or professional', ar: 'لا نظهر بشكل متّسق واحترافي', w: { brand: 3, audit: 1, content: 1 } },
      { en: 'I need to show a space or product before it exists', ar: 'أحتاج أن أُري مكانًا أو منتجًا قبل تنفيذه', w: { builder3d: 3, drawings: 3 } }
    ] },
    { id: 'lang', en: 'How do your customers talk?', ar: 'كيف يتكلم عملاؤك؟', opts: [
      { en: 'Arabic', ar: 'بالعربية', w: { dialect: 3 } },
      { en: 'Arabic and English', ar: 'عربي وإنجليزي', w: { dialect: 2 } },
      { en: 'Arabic and French (North Africa)', ar: 'عربي وفرنسي (شمال أفريقيا)', w: { dialect: 4 } },
      { en: 'Mostly English', ar: 'الإنجليزية غالبًا', w: {} }
    ] },
    { id: 'where', en: 'Where do customers find you today?', ar: 'أين يجدك العملاء اليوم؟', opts: [
      { en: 'Instagram or TikTok', ar: 'إنستغرام أو تيك توك', w: { publisher: 2, content: 1, smm: 1 } },
      { en: 'WhatsApp', ar: 'واتساب', w: { whatsapp: 3, inbox: 1 } },
      { en: 'Google or Maps', ar: 'جوجل أو الخرائط', w: { google: 3 } },
      { en: 'YouTube', ar: 'يوتيوب', w: { youtube: 3 } },
      { en: 'Walk-ins and word of mouth', ar: 'زبائن المحل والتوصية', w: { google: 2, audit: 1, brand: 1 } }
    ] }
  ];
  var ORDER = ['content', 'whatsapp', 'publisher', 'smm', 'brand', 'audit', 'inbox', 'google', 'youtube', 'insights', 'dialect', 'builder3d', 'drawings', 'security'];

  Z.extend({
    en: {
      'quiz.eyebrow': '30-second test', 'quiz.title': 'Which tools does your business need?',
      'quiz.sub': 'Four quick taps. We suggest where to start — you choose what happens next.',
      'quiz.step': 'Question {n} of {total}', 'quiz.back': 'Back', 'quiz.restart': 'Start again', 'quiz.all': 'See all 14 tools',
      'quiz.res.title': 'Your starting set', 'quiz.res.sub': 'Three tools to start with, based on your answers. You can add more later — they all report into one dashboard.',
      'quiz.why': 'Because you said: “{a}”', 'quiz.wa': 'Ask KJ about these on WhatsApp',
      'quiz.privacy': 'Nothing is saved or sent. Your answers only go into a WhatsApp message if you tap the button.',
      'quiz.msg': 'Hello KJ, I took the 30-second test on ZKJ SYSTEM. My business: {biz}. My biggest problem: {pain}. Suggested tools: {tools}. Can we talk?'
    },
    ar: {
      'quiz.eyebrow': 'اختبار ٣٠ ثانية', 'quiz.title': 'أي الأدوات يحتاجها نشاطك؟',
      'quiz.sub': 'أربع نقرات سريعة. نقترح عليك من أين تبدأ — والقرار التالي لك.',
      'quiz.step': 'السؤال {n} من {total}', 'quiz.back': 'رجوع', 'quiz.restart': 'ابدأ من جديد', 'quiz.all': 'شاهد الأدوات الـ 14',
      'quiz.res.title': 'مجموعتك للبداية', 'quiz.res.sub': 'ثلاث أدوات للبداية بحسب إجاباتك. يمكنك إضافة غيرها لاحقًا — كلها تُسلّم تقاريرها في لوحة واحدة.',
      'quiz.why': 'لأنك قلت: «{a}»', 'quiz.wa': 'اسأل KJ عنها على واتساب',
      'quiz.privacy': 'لا يُحفظ ولا يُرسل شيء. تذهب إجاباتك إلى رسالة واتساب فقط إذا ضغطت الزر.',
      'quiz.msg': 'مرحبا KJ، جرّبت اختبار الـ 30 ثانية في ZKJ SYSTEM. نشاطي: {biz}. أكبر مشكلة عندي: {pain}. الأدوات المقترحة: {tools}. ممكن نتواصل؟'
    }
  });

  var state = { step: 0, picks: [] };
  var lang = function () { return Z.getLang(); };
  function toolById(id) { for (var i = 0; i < Z.TOOLS.length; i++) if (Z.TOOLS[i].id === id) return Z.TOOLS[i]; return null; }

  function diamonds() {
    var h = '<ol class="quiz-dots" aria-hidden="true">';
    for (var i = 0; i < Q.length; i++) h += '<li class="' + (i < state.step ? 'done' : i === state.step ? 'now' : '') + '"></li>';
    return h + '</ol>';
  }

  function renderQuestion() {
    var q = Q[state.step], L = lang();
    card.innerHTML =
      '<div class="quiz-top">' + diamonds() + '<span class="tag">' + esc(t('quiz.step', { n: state.step + 1, total: Q.length })) + '</span></div>' +
      '<h3 class="quiz-q" id="quiz-q" tabindex="-1">' + esc(q[L]) + '</h3>' +
      '<div class="quiz-opts" role="group" aria-labelledby="quiz-q">' +
      q.opts.map(function (o, i) {
        return '<button type="button" class="quiz-opt" data-pick="' + i + '"><span>' + esc(o[L]) + '</span></button>';
      }).join('') + '</div>' +
      (state.step ? '<button type="button" class="quiz-link" data-back>' + esc(t('quiz.back')) + '</button>' : '');
  }

  function compute() {
    var score = {}, why = {};
    state.picks.forEach(function (pi, qi) {
      var o = Q[qi].opts[pi];
      Object.keys(o.w).forEach(function (id) {
        score[id] = (score[id] || 0) + o.w[id];
        if (!why[id] || o.w[id] >= why[id].p) why[id] = { p: o.w[id], q: qi, o: pi };
      });
    });
    var ids = ORDER.filter(function (id) { return (score[id] || 0) > 0; });
    ids.sort(function (a, b) { return (score[b] - score[a]) || (ORDER.indexOf(a) - ORDER.indexOf(b)); });
    ['content', 'whatsapp', 'publisher'].forEach(function (id) { if (ids.length < 3 && ids.indexOf(id) < 0) ids.push(id); });
    return ids.slice(0, 3).map(function (id) { return { id: id, why: why[id] }; });
  }

  function renderResult() {
    var L = lang(), res = compute();
    var names = res.map(function (r) { return toolById(r.id)[L].name; });
    var biz = Q[0].opts[state.picks[0]][L], pain = Q[1].opts[state.picks[1]][L];
    var base = Z.waLink(null).split('?')[0];
    var href = base + '?text=' + encodeURIComponent(t('quiz.msg', { biz: biz, pain: pain, tools: names.join(', ') }));
    card.innerHTML =
      '<div class="quiz-top">' + diamonds().replace(/class="(now|)"/g, 'class="done"') + '<span class="tag">✓</span></div>' +
      '<h3 class="quiz-q quiz-res-title" id="quiz-q" tabindex="-1">' + esc(t('quiz.res.title')) + '</h3>' +
      '<p class="quiz-res-sub">' + esc(t('quiz.res.sub')) + '</p>' +
      '<ul class="quiz-res">' + res.map(function (r) {
        var tl = toolById(r.id), d = tl[L];
        var a = r.why ? Q[r.why.q].opts[r.why.o][L] : '';
        return '<li class="quiz-tool"><div class="tool-icon">' + tl.icon + '</div><div><h4>' + esc(d.name) + '</h4><p class="tool-tag">' + esc(d.tag) + '</p>' +
          (a ? '<p class="quiz-why">' + esc(t('quiz.why', { a: a })) + '</p>' : '') + '</div></li>';
      }).join('') + '</ul>' +
      '<div class="quiz-cta"><a class="btn btn-primary btn-wa" href="' + href + '" target="_blank" rel="noopener">' + Z.ICONS.wa + '<span>' + esc(t('quiz.wa')) + '</span></a>' +
      '<a class="btn btn-ghost" href="#tools">' + esc(t('quiz.all')) + '</a>' +
      '<button type="button" class="quiz-link" data-restart>' + esc(t('quiz.restart')) + '</button></div>' +
      '<p class="quiz-privacy">' + esc(t('quiz.privacy')) + '</p>';
  }

  function render(focus) {
    if (state.step >= Q.length) renderResult(); else renderQuestion();
    if (focus) { var h = document.getElementById('quiz-q'); if (h) h.focus({ preventScroll: true }); }
  }

  card.addEventListener('click', function (e) {
    var pick = e.target.closest('[data-pick]');
    if (pick) { state.picks[state.step] = +pick.getAttribute('data-pick'); state.step++; render(true); return; }
    if (e.target.closest('[data-back]')) { state.step = Math.max(0, state.step - 1); state.picks.length = state.step; render(true); return; }
    if (e.target.closest('[data-restart]')) { state.step = 0; state.picks = []; render(true); }
  });
  Z.onLang(function () { render(false); });
  render(false);
})();
