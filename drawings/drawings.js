/* Drawings desk pages: order form (/drawings/), the customer's order page (view.html) and KJ's HQ (hq.html).
   The order and the customer page talk to the drawings-desk Edge Function; HQ uses KJ's admin login (row-level security). */
(function () {
  'use strict';
  var FN = 'https://usucmdjupfjuchfxnxpz.supabase.co/functions/v1/drawings-desk';
  var S = {
    en: {
      'title': '2D Engineering Drawings', 'eyebrow': '◆ T-12 · ZKJ SYSTEM',
      'lead': 'Send your sketch, photo, PDF or CAD file. We return clean, dimensioned drawings in Arabic, English or both — plans, sections, elevations and details — plus the installation method statement and a 3D model when you need them.',
      'f.price': 'Price', 'f.price.v': 'Per sheet. You see the price for your job and confirm it before any work starts.',
      'f.time': 'Delivery', 'f.time.v': 'As soon as it is ready. Your order page shows every step.',
      'f.files': 'You receive', 'f.files.v': 'PDF + DXF (opens in AutoCAD) + PNG, with a title block on every sheet. Method statement in PDF + Word. 3D model in SketchUp.',
      'o.sample': 'Sample sheet: plan with Arabic and English labels, dimensions, title block and the reference note.', 'o.name': 'Your name', 'o.company': 'Company (optional)', 'o.email': 'Email', 'o.phone': 'WhatsApp / phone', 'o.contact': 'Email or WhatsApp — at least one.',
      'o.work': 'What do you need?', 'w.redraw': 'Clean redraw of my sketch / file', 'w.plans': 'Plans', 'w.sections': 'Sections', 'w.elevations': 'Elevations', 'w.details': 'Details', 'w.method': 'Method statement (installation, scaffolding, crane / lifting)', 'w.model3d': '3D model (SketchUp)',
      'o.work.hint': 'Method statement: how it gets installed from your drawing — work sequence, scaffolding, crane and lifting, equipment, safety. You can also add a 3D model or a method statement later, after you approve your drawings.',
      'o.labels': 'Text on the drawings', 'l.en': 'English', 'l.ar': 'Arabic', 'l.both': 'Arabic + English',
      'o.units': 'Units', 'o.sheet': 'Sheet size', 'o.scale': 'Scale (optional)', 'o.scale.ph': 'e.g. 1:50',
      'o.details': 'Describe the job', 'o.details.ph': 'What it is, the sizes you know, what each sheet should show, anything that must not change.',
      'o.upload': 'Your files', 'o.upload.hint': 'PDF, JPG, PNG, HEIC, DXF or DWG · up to 10 files · 50 MB each',
      'o.send': 'Send my order', 'o.sending': 'Sending…', 'o.uploading': 'Uploading', 'o.done': 'Order received. Keep this page — it is your private order page.',
      'o.err': 'Something is missing or wrong. Check the fields and try again.', 'o.err.file': 'One file is not a supported type or is over 50 MB.', 'o.err.net': 'Could not send. Check your connection and try again.',
      'v.title': 'Your drawing order', 'v.lead': 'Save this page. It is private to you and shows your order from start to delivery.',
      's.received': 'Order received', 's.quoted': 'Price sent — waiting for you', 's.confirmed': 'Confirmed — queued', 's.in_work': 'Drawing in progress', 's.check': 'Final check by ZKJ SYSTEM',
      's.review': 'Ready for your review', 's.changes': 'Changes in progress', 's.approved': 'Approved — final files below', 's.cancelled': 'Cancelled',
      'v.quote': 'Your price', 'v.sheets': 'sheet(s)', 'v.per': 'per sheet', 'v.confirm': 'Confirm and start',
      'v.review': 'Your drawings', 'v.review.lead': 'Check every sheet. Approve to receive the final files (including DXF), or tell us what to change.',
      'v.approve': 'Approve drawings', 'v.changes': 'Request changes', 'v.changes.ph': 'Sheet number and what to change…', 'v.send': 'Send changes',
      'v.final': 'Final files', 'v.final.lead': 'Download links stay valid for one hour — reopen this page for fresh ones.',
      'v.wait': 'We will message you when the next step is ready. You can also check this page any time.',
      'v.notfound': 'This order link is not valid. Check the link you received.', 'v.wa': 'Questions? Message us on WhatsApp',
      'a.title': 'Add to this order', 'a.lead': 'Built on the drawings you approved. You get a separate price and confirm it before work starts.', 'a.note': 'Anything we should know (optional)',
      'a.note.ph': 'e.g. site access, crane position, height, weight of the heaviest part, views you want…', 'a.send': 'Request', 'a.pick': 'Choose at least one.', 'a.list': 'Your add-on orders', 'a.open': 'Open',
      'a.of': 'Add-on to your approved drawings',
      'h.title': 'Drawings · HQ'
    },
    ar: {
      'title': 'الرسومات الهندسية ثنائية الأبعاد', 'eyebrow': '◆ T-12 · ZKJ SYSTEM',
      'lead': 'أرسل الرسم اليدوي أو الصورة أو ملف PDF أو CAD. نعيده لك رسومات نظيفة بالأبعاد، بالعربية أو الإنجليزية أو باللغتين — مخططات ومقاطع وواجهات وتفاصيل — ومعها بيان طريقة التركيب ونموذج ثلاثي الأبعاد عند الحاجة.',
      'f.price': 'السعر', 'f.price.v': 'باللوحة. ترى سعر طلبك وتوافق عليه قبل بدء أي عمل.',
      'f.time': 'التسليم', 'f.time.v': 'فور الجاهزية. صفحة طلبك تُظهر كل خطوة.',
      'f.files': 'تستلم', 'f.files.v': 'PDF + DXF (يفتح في AutoCAD) + PNG، مع جدول عنوان في كل لوحة. بيان طريقة العمل بصيغتي PDF و Word. النموذج ثلاثي الأبعاد بصيغة SketchUp.',
      'o.sample': 'لوحة نموذجية: مخطط بتسميات عربية وإنجليزية وأبعاد وجدول عنوان.', 'o.name': 'الاسم', 'o.company': 'الشركة (اختياري)', 'o.email': 'البريد الإلكتروني', 'o.phone': 'واتساب / الهاتف', 'o.contact': 'البريد أو واتساب — واحد على الأقل.',
      'o.work': 'ماذا تحتاج؟', 'w.redraw': 'إعادة رسم نظيفة لرسمي / ملفي', 'w.plans': 'مخططات', 'w.sections': 'مقاطع', 'w.elevations': 'واجهات', 'w.details': 'تفاصيل', 'w.method': 'بيان طريقة العمل (التركيب، السقالات، الرافعة والرفع)', 'w.model3d': 'نموذج ثلاثي الأبعاد (SketchUp)',
      'o.work.hint': 'بيان طريقة العمل: كيف يُركَّب العمل حسب رسمك — تسلسل الأعمال، السقالات، الرافعة والرفع، المعدات، السلامة. ويمكنك إضافة نموذج ثلاثي الأبعاد أو بيان طريقة العمل لاحقًا بعد اعتماد رسوماتك.',
      'o.labels': 'لغة الكتابة على الرسومات', 'l.en': 'الإنجليزية', 'l.ar': 'العربية', 'l.both': 'عربي + إنجليزي',
      'o.units': 'الوحدات', 'o.sheet': 'مقاس اللوحة', 'o.scale': 'مقياس الرسم (اختياري)', 'o.scale.ph': 'مثلاً 1:50',
      'o.details': 'صف المطلوب', 'o.details.ph': 'ما هو المشروع، المقاسات المعروفة، ماذا تُظهر كل لوحة، وما لا يجب تغييره.',
      'o.upload': 'ملفاتك', 'o.upload.hint': 'PDF أو JPG أو PNG أو HEIC أو DXF أو DWG · حتى 10 ملفات · 50 ميجا لكل ملف',
      'o.send': 'أرسل طلبي', 'o.sending': 'جارٍ الإرسال…', 'o.uploading': 'جارٍ الرفع', 'o.done': 'وصل طلبك. احتفظ بهذه الصفحة — هي صفحة طلبك الخاصة.',
      'o.err': 'هناك حقل ناقص أو غير صحيح. راجع الحقول وحاول مجددًا.', 'o.err.file': 'أحد الملفات بنوع غير مدعوم أو أكبر من 50 ميجا.', 'o.err.net': 'تعذّر الإرسال. تحقق من الاتصال وحاول مجددًا.',
      'v.title': 'طلب الرسومات', 'v.lead': 'احتفظ بهذه الصفحة. هي خاصة بك وتُظهر طلبك من البداية حتى التسليم.',
      's.received': 'وصل الطلب', 's.quoted': 'أُرسل السعر — بانتظارك', 's.confirmed': 'تم التأكيد — في الدور', 's.in_work': 'جارٍ الرسم', 's.check': 'مراجعة أخيرة من ZKJ SYSTEM',
      's.review': 'جاهزة لمراجعتك', 's.changes': 'جارٍ التعديل', 's.approved': 'معتمدة — الملفات النهائية بالأسفل', 's.cancelled': 'ملغى',
      'v.quote': 'سعر طلبك', 'v.sheets': 'لوحة', 'v.per': 'للوحة', 'v.confirm': 'أؤكّد وابدأوا',
      'v.review': 'رسوماتك', 'v.review.lead': 'راجع كل لوحة. اعتمدها لتستلم الملفات النهائية (مع DXF)، أو أخبرنا بما تريد تعديله.',
      'v.approve': 'اعتمد الرسومات', 'v.changes': 'اطلب تعديلات', 'v.changes.ph': 'رقم اللوحة وما يجب تعديله…', 'v.send': 'أرسل التعديلات',
      'v.final': 'الملفات النهائية', 'v.final.lead': 'روابط التحميل صالحة لساعة — افتح الصفحة مجددًا لروابط جديدة.',
      'v.wait': 'سنراسلك عندما تجهز الخطوة التالية. ويمكنك متابعة هذه الصفحة في أي وقت.',
      'v.notfound': 'رابط الطلب غير صالح. تحقق من الرابط الذي وصلك.', 'v.wa': 'لديك سؤال؟ راسلنا على واتساب',
      'a.title': 'أضف إلى هذا الطلب', 'a.lead': 'مبني على الرسومات التي اعتمدتها. يصلك سعر مستقل وتوافق عليه قبل بدء العمل.', 'a.note': 'ما يجب أن نعرفه (اختياري)',
      'a.note.ph': 'مثلاً: الوصول إلى الموقع، مكان الرافعة، الارتفاع، وزن أثقل قطعة، المناظر التي تريدها…', 'a.send': 'اطلب', 'a.pick': 'اختر خيارًا واحدًا على الأقل.', 'a.list': 'طلبات الإضافة', 'a.open': 'افتح',
      'a.of': 'إضافة على رسوماتك المعتمدة',
      'h.title': 'الرسومات · المقر'
    }
  };
  var lang = 'en';
  try { lang = new URLSearchParams(location.search).get('lang') || localStorage.getItem('zkj-lang') || (navigator.language || '').slice(0, 2); } catch (e) { /* default */ }
  lang = lang === 'ar' ? 'ar' : 'en';
  function t(k) { return (S[lang] && S[lang][k]) || S.en[k] || k; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function applyLang() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = t(el.getAttribute('data-t')); });
    document.querySelectorAll('[data-tph]').forEach(function (el) { el.setAttribute('placeholder', t(el.getAttribute('data-tph'))); });
    var b = $('dw-lang'); if (b) b.textContent = lang === 'ar' ? 'English' : 'العربية';
  }
  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'dw-lang') { lang = lang === 'ar' ? 'en' : 'ar'; try { localStorage.setItem('zkj-lang', lang); } catch (er) { /* ignore */ } applyLang(); if (window.__dwRender) window.__dwRender(); }
  });
  function api(method, qs, body) {
    return fetch(FN + qs, { method: method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }).then(function (j) { j.httpStatus = r.status; return j; }); });
  }
  function msg(el, text, kind) { el.hidden = !text; el.className = 'dw-msg' + (kind ? ' ' + kind : ''); el.textContent = text || ''; }
  var page = document.body.getAttribute('data-page');
  if (page) applyLang(); // inside the dashboard (/app) the dashboard owns the language

  /* ---------- order form ---------- */
  if (page === 'order') {
    var form = $('dw-form'), fileIn = $('dw-in'), list = $('dw-list'), out = $('dw-msg'), btn = $('dw-send');
    var OK_EXT = /\.(pdf|jpe?g|png|webp|heic|dxf|dwg)$/i;
    fileIn.addEventListener('change', function () {
      list.innerHTML = Array.prototype.slice.call(fileIn.files, 0, 10).map(function (f) { return '<li><span>' + esc(f.name) + '</span><span>' + (f.size / 1048576).toFixed(1) + ' MB</span></li>'; }).join('');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault(); msg(out, '');
      var fd = new FormData(form);
      var files = Array.prototype.slice.call(fileIn.files, 0, 10);
      if (files.some(function (f) { return !OK_EXT.test(f.name) || f.size > 50 * 1048576; })) return msg(out, t('o.err.file'), 'err');
      var body = { name: fd.get('name'), company: fd.get('company'), email: fd.get('email'), phone: fd.get('phone'), website: fd.get('website'), lang: lang,
        work: fd.getAll('work'), labels: fd.get('labels'), units: fd.get('units'), sheet: fd.get('sheet'), scale: fd.get('scale'), details: fd.get('details'),
        files: files.map(function (f) { return { name: f.name, size: f.size }; }) };
      if (!body.name || !body.details || !body.work.length || (!body.email && !body.phone)) return msg(out, t('o.err'), 'err');
      btn.disabled = true; btn.textContent = t('o.sending');
      api('POST', '?action=create', body).then(function (r) {
        if (!r.ok || !r.job) throw new Error(r.error || 'create');
        var i = 0;
        function next() {
          if (i >= r.uploads.length) return Promise.resolve();
          var up = r.uploads[i], f = files[i]; i++;
          btn.textContent = t('o.uploading') + ' ' + i + '/' + r.uploads.length + '…';
          return fetch(up.url, { method: 'PUT', headers: { 'Content-Type': f.type || 'application/octet-stream', 'x-upsert': 'false' }, body: f })
            .then(function (res) { if (!res.ok) throw new Error('upload'); return next(); });
        }
        return next().then(function () { return api('POST', '?action=submitted&job=' + r.job + '&key=' + r.key); }).then(function () { location.href = r.view + '&new=1&lang=' + lang; });
      }).catch(function (err) {
        btn.disabled = false; btn.textContent = t('o.send');
        msg(out, /bad_file/.test(err.message) ? t('o.err.file') : /missing|bad_email/.test(err.message) ? t('o.err') : t('o.err.net'), 'err');
      });
    });
  }

  /* ---------- customer order page ---------- */
  if (page === 'view') {
    var q = new URLSearchParams(location.search), job = q.get('job'), key = q.get('k');
    var box = $('dw-view'), state = null;
    var FLOW = ['received', 'quoted', 'confirmed', 'in_work', 'check', 'review', 'approved'];
    function render() {
      if (!state) return;
      var j = state, at = FLOW.indexOf(j.status === 'changes' ? 'in_work' : j.status);
      var h = (q.get('new') ? '<p class="dw-msg ok">' + esc(t('o.done')) + '</p>' : '');
      h += '<ol class="dw-steps">' + FLOW.map(function (s, i) { return '<li class="' + (i < at ? 'done' : i === at ? 'now' : '') + '">' + esc(t('s.' + (s === 'in_work' && j.status === 'changes' ? 'changes' : s))) + '</li>'; }).join('') + '</ol>';
      if (j.status === 'quoted' && j.total != null) {
        h += '<section class="dw-card"><h2>' + esc(t('v.quote')) + '</h2><p class="dw-quote">' + esc(j.total) + ' ' + esc(j.currency) + '</p><p class="dw-small">' + esc(j.sheets + ' ' + t('v.sheets') + ' × ' + j.price_per_sheet + ' ' + j.currency + ' ' + t('v.per')) + '</p>' +
          '<div class="dw-actions"><button class="btn btn-primary" type="button" data-do="confirm">' + esc(t('v.confirm')) + '</button></div></section>';
      }
      if ((j.status === 'review' || j.status === 'approved') && j.files.length) {
        h += '<section class="dw-card"><h2>' + esc(t(j.final ? 'v.final' : 'v.review')) + '</h2><p class="dw-small">' + esc(t(j.final ? 'v.final.lead' : 'v.review.lead')) + '</p><div class="dw-out">' +
          j.files.map(function (f) { var img = /\.(png|jpe?g|webp)$/i.test(f.name); return '<a href="' + esc(f.url) + '" target="_blank" rel="noopener">' + (img ? '<img src="' + esc(f.url) + '" alt="" loading="lazy">' : '') + '<span class="ft">' + esc((f.name.split('.').pop() || '').toUpperCase()) + '</span>' + esc(f.name) + '</a>'; }).join('') + '</div>';
        if (j.status === 'review') h += '<div class="dw-actions"><button class="btn btn-primary" type="button" data-do="approve">' + esc(t('v.approve')) + '</button></div>' +
          '<label class="dw-field" style="margin-top:14px"><span>' + esc(t('v.changes')) + '</span><textarea class="dw-note" id="dw-note" placeholder="' + esc(t('v.changes.ph')) + '"></textarea></label><div class="dw-actions"><button class="btn" type="button" data-do="changes">' + esc(t('v.send')) + '</button></div>';
        h += '</section>';
      }
      if (['received', 'confirmed', 'in_work', 'check', 'changes'].indexOf(j.status) > -1) h += '<p class="dw-small">' + esc(t('v.wait')) + '</p>';
      if (j.addon) h = '<p class="dw-small">' + esc(t('a.of')) + ': ' + esc((j.work || []).map(function (w) { return t('w.' + w); }).join(' · ')) + '</p>' + h;
      if (j.status === 'approved' && !j.addon) {
        var have = (j.work || []).concat.apply(j.work || [], (j.addons || []).map(function (a) { return a.work || []; }));
        var opts = ['model3d', 'method'].filter(function (w) { return have.indexOf(w) < 0; });
        if ((j.addons || []).length) h += '<section class="dw-card"><h2>' + esc(t('a.list')) + '</h2>' + j.addons.map(function (a) { return '<p class="dw-small">' + esc((a.work || []).map(function (w) { return t('w.' + w); }).join(' · ')) + ' — ' + esc(t('s.' + a.status)) + ' · <a href="' + esc(a.view + '&lang=' + lang) + '">' + esc(t('a.open')) + '</a></p>'; }).join('') + '</section>';
        if (opts.length) h += '<section class="dw-card" id="dw-add"><h2>' + esc(t('a.title')) + '</h2><p class="dw-small">' + esc(t('a.lead')) + '</p><div class="dw-checks">' +
          opts.map(function (w) { return '<label><input type="checkbox" name="addon" value="' + w + '"><span>' + esc(t('w.' + w)) + '</span></label>'; }).join('') + '</div>' +
          '<label class="dw-field" style="margin-top:14px"><span>' + esc(t('a.note')) + '</span><textarea class="dw-note" id="dw-addnote" placeholder="' + esc(t('a.note.ph')) + '"></textarea></label><p class="dw-msg" id="dw-addmsg" hidden role="alert"></p>' +
          '<div class="dw-actions"><button class="btn btn-primary" type="button" data-do="addon">' + esc(t('a.send')) + '</button></div></section>';
      }
      h += '<p class="dw-small"><a href="https://wa.me/971541668700" target="_blank" rel="noopener">' + esc(t('v.wa')) + '</a></p>';
      box.innerHTML = h; applyLang();
    }
    window.__dwRender = render;
    function load() {
      api('GET', '?job=' + encodeURIComponent(job || '') + '&k=' + encodeURIComponent(key || '')).then(function (r) {
        if (!r.ok) { box.innerHTML = '<p class="dw-msg err">' + esc(t('v.notfound')) + '</p>'; return; }
        state = r.job; render();
      }).catch(function () { box.innerHTML = '<p class="dw-msg err">' + esc(t('o.err.net')) + '</p>'; });
    }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-do]'); if (!b) return;
      var a = b.getAttribute('data-do'), body = null;
      if (a === 'changes') { var n = ($('dw-note').value || '').trim(); if (!n) { $('dw-note').focus(); return; } body = { note: n }; }
      if (a === 'addon') {
        var picked = Array.prototype.map.call(box.querySelectorAll('input[name="addon"]:checked'), function (i) { return i.value; });
        if (!picked.length) return msg($('dw-addmsg'), t('a.pick'), 'err');
        b.disabled = true;
        return api('POST', '?action=addon&job=' + job + '&key=' + key, { work: picked, note: $('dw-addnote').value || '' }).then(function (r) {
          if (r.ok && r.view) location.href = r.view + '&new=1&lang=' + lang; else { b.disabled = false; msg($('dw-addmsg'), t('o.err.net'), 'err'); }
        });
      }
      b.disabled = true;
      api('POST', '?action=' + a + '&job=' + job + '&key=' + key, body || {}).then(load);
    });
    load();
  }

  /* ---------- HQ (KJ, admin login): /drawings/hq.html and the Drawings section of the dashboard ---------- */
  // ZKJDrawingsHQ.mount(root, supabaseClient, { onChange }) → { reload(), open(id) }
  function mountHQ(root, SB, opts) {
    opts = opts || {};
    var STATUS_ORDER = ['received', 'check', 'changes', 'confirmed', 'quoted', 'in_work', 'review', 'approved', 'cancelled'];
    var price = '';
    if (!SB) { root.innerHTML = '<p class="dw-msg err">Supabase not loaded.</p>'; return { reload: function () {}, open: function () {} }; }
    var want = null, flash = '';
    var FLASH = { quote: 'Price sent to the customer.', release: 'Sent to the customer.', back: 'Sent back to the agent with your note. Tell the agent chat to continue: it reads your note when it opens the job.', cancel: 'Order cancelled.' };
    function copyRow(label, value) { return '<div class="dw-field"><span>' + esc(label) + '</span><div class="dw-copy"><input readonly value="' + esc(value) + '"><button class="btn btn-sm" type="button" data-copy>Copy</button></div></div>'; }
    function signed(path) { return SB.storage.from('drawings').createSignedUrl(path, 3600).then(function (r) { return r.data ? r.data.signedUrl : '#'; }); }
    function drawJob(j) {
      var view = location.origin + '/drawings/view.html?job=' + j.id + '&k=' + j.customer_key + '&lang=' + j.lang;
      var agent = 'https://usucmdjupfjuchfxnxpz.supabase.co/functions/v1/drawings-desk?job=' + j.id + '&agent=' + j.agent_key;
      var wa = j.phone ? 'https://wa.me/' + String(j.phone).replace(/[^\d]/g, '') + '?text=' + encodeURIComponent((j.lang === 'ar' ? 'رابط طلب الرسومات: ' : 'Your drawing order: ') + view) : '';
      var revOut = (j.outputs || []).filter(function (o) { return o.rev === j.revision; });
      var h = '<details class="dw-job" data-id="' + j.id + '"' + (['received', 'check', 'changes', 'confirmed'].indexOf(j.status) > -1 ? ' open' : '') + '><summary><span><b>' + esc(j.name) + '</b>' + (j.company ? ' · ' + esc(j.company) : '') + ' <span class="dw-small">' + esc(new Date(j.created_at).toLocaleString()) + '</span></span><span class="dw-tag ' + j.status + '">' + esc(j.status === 'changes' ? 'sent back' : j.status) + (j.revision > 1 ? ' · rev ' + esc(j.revision) : '') + '</span></summary><div class="body">' +
        '<dl class="dw-kv">' + (j.hq_note ? '<dt>Your note</dt><dd>' + esc(j.hq_note) + '</dd>' : '') + (j.parent_id ? '<dt>Add-on to</dt><dd>approved order ' + esc(j.parent_id.slice(0, 8)) + ' (the agent gets those drawings in its brief)</dd>' : '') + '<dt>Needs</dt><dd>' + esc((j.work || []).join(', ')) + '</dd><dt>Text</dt><dd>' + esc(j.labels) + ' · ' + esc(j.units) + ' · ' + esc(j.sheet) + (j.scale ? ' · ' + esc(j.scale) : '') + '</dd><dt>Contact</dt><dd>' + esc([j.email, j.phone].filter(Boolean).join(' · ')) + '</dd><dt>Brief</dt><dd>' + esc(j.details) + '</dd>' +
        (j.customer_note ? '<dt>Changes asked</dt><dd>' + esc(j.customer_note) + '</dd>' : '') + (j.sheets ? '<dt>Quote</dt><dd>' + esc(j.sheets) + ' × ' + esc(j.price_per_sheet) + ' ' + esc(j.currency) + '</dd>' : '') + '</dl>' +
        '<div><span class="dw-small">Customer files</span><div class="dw-out" data-files="in"></div></div>' +
        (revOut.length ? '<div><span class="dw-small">Agent output · revision ' + j.revision + '</span><div class="dw-out" data-files="out"></div></div>' : '');
      if (j.status === 'received' || j.status === 'quoted') h += '<div class="dw-row"><label class="dw-field"><span>Sheets</span><input type="number" min="1" data-f="sheets" value="' + esc(j.sheets || '') + '"><small>Method statement or 3D: count each document page set or view sheet.</small></label><label class="dw-field"><span>Price per sheet (' + esc(j.currency) + ')</span><input type="number" min="0" step="1" data-f="price" value="' + esc(j.price_per_sheet || price) + '"></label></div><div class="dw-actions"><button class="btn btn-primary" type="button" data-a="quote">' + (j.status === 'quoted' ? 'Update quote' : 'Send quote to customer') + '</button></div>';
      if (j.status === 'check') h += '<label class="dw-field"><span>Note back to the agent (only if it needs fixing)</span><textarea class="dw-note" data-f="hq"></textarea></label><div class="dw-actions"><button class="btn btn-primary" type="button" data-a="release">Send to customer</button><button class="btn" type="button" data-a="back">Back to the agent</button></div>';
      h += copyRow('Customer page (send this to the customer)', view) + (wa ? '<div class="dw-actions"><a class="btn btn-sm" target="_blank" rel="noopener" href="' + esc(wa) + '">Send link on WhatsApp</a></div>' : '') +
        copyRow('Agent brief (give this to your drawings agent — never to the customer)', agent) +
        (j.status !== 'approved' && j.status !== 'cancelled' ? '<div class="dw-actions"><button class="btn btn-sm" type="button" data-a="cancel">Cancel order</button></div>' : '') + '</div></details>';
      return h;
    }
    function fill(el, j) {
      var ins = el.querySelector('[data-files="in"]'), outs = el.querySelector('[data-files="out"]');
      (j.inputs || []).forEach(function (f) { signed('inputs/' + j.id + '/' + f.name).then(function (u) { ins.insertAdjacentHTML('beforeend', '<a target="_blank" rel="noopener" href="' + esc(u) + '">' + (/\.(png|jpe?g|webp)$/i.test(f.name) ? '<img src="' + esc(u) + '" alt="">' : '') + '<span class="ft">' + esc((f.name.split('.').pop() || '').toUpperCase()) + '</span>' + esc(f.name) + '</a>'); }); });
      if (outs) (j.outputs || []).filter(function (o) { return o.rev === j.revision; }).forEach(function (o) { signed(o.path).then(function (u) { outs.insertAdjacentHTML('beforeend', '<a target="_blank" rel="noopener" href="' + esc(u) + '">' + (/\.(png|jpe?g)$/i.test(o.name) ? '<img src="' + esc(u) + '" alt="">' : '') + '<span class="ft">' + esc((o.name.split('.').pop() || '').toUpperCase()) + '</span>' + esc(o.name) + '</a>'); }); });
    }
    var jobs = [];
    function load() {
      SB.auth.getSession().then(function (s) {
        if (!s.data || !s.data.session) { root.innerHTML = '<p class="dw-msg">Log in first: <a href="/app/login.html">open the dashboard login</a>, then come back here.</p>'; return; }
        root.setAttribute('aria-busy', 'true');
        return Promise.all([SB.from('drawing_jobs').select('*').order('created_at', { ascending: false }).limit(100), SB.from('app_settings').select('key,value').in('key', ['drawings_price_per_sheet'])]).then(function (r) {
          if (r[0].error) { root.innerHTML = '<p class="dw-msg err">' + esc(r[0].error.message) + ' (admin only)</p>'; return; }
          price = ((r[1].data || [])[0] || {}).value || '';
          jobs = (r[0].data || []).sort(function (a, b) { return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || (a.created_at < b.created_at ? 1 : -1); });
          root.removeAttribute('aria-busy');
          root.innerHTML = (flash ? '<p class="dw-msg ok" role="status">' + esc(flash) + '</p>' : '') + (jobs.length ? jobs.map(drawJob).join('') : '<p class="dw-small">No drawing orders yet.</p>');
          if (flash) { flash = ''; root.scrollIntoView({ block: 'start' }); }
          jobs.forEach(function (j) { fill(root.querySelector('[data-id="' + j.id + '"]'), j); });
          if (want) focusJob(want);
          if (opts.onChange) opts.onChange(jobs);
        });
      });
    }
    function focusJob(id) {
      var el = root.querySelector('[data-id="' + id + '"]');
      if (!el) return;
      want = null; el.open = true;
      el.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    root.addEventListener('click', function (e) {
      var c = e.target.closest('[data-copy]');
      if (c) { var inp = c.parentNode.querySelector('input'); inp.select(); try { navigator.clipboard.writeText(inp.value); } catch (er) { document.execCommand('copy'); } c.textContent = 'Copied'; return; }
      var b = e.target.closest('[data-a]'); if (!b) return;
      var el = b.closest('[data-id]'), id = el.getAttribute('data-id'), a = b.getAttribute('data-a'), now = new Date().toISOString(), patch = null;
      if (a === 'quote') {
        var sh = parseInt(el.querySelector('[data-f="sheets"]').value, 10), pr = parseFloat(el.querySelector('[data-f="price"]').value);
        if (!(sh > 0) || !(pr >= 0)) { alert('Enter the number of sheets and the price per sheet.'); return; }
        patch = { sheets: sh, price_per_sheet: pr, status: 'quoted', quoted_at: now };
        SB.from('app_settings').update({ value: String(pr) }).eq('key', 'drawings_price_per_sheet').then(function () { /* default for the next quote */ });
      } else if (a === 'release') patch = { status: 'review' };
      else if (a === 'back') { var n = (el.querySelector('[data-f="hq"]').value || '').trim(); if (!n) { alert('Write what the agent should fix.'); return; } patch = { status: 'changes', hq_note: n }; }
      else if (a === 'cancel') { if (!confirm('Cancel this order?')) return; patch = { status: 'cancelled' }; }
      if (!patch) return;
      patch.updated_at = now; b.disabled = true;
      SB.from('drawing_jobs').update(patch).eq('id', id).then(function (r) { if (r.error) alert(r.error.message); else flash = FLASH[a] || ''; load(); });
    });
    load();
    return { reload: load, open: function (id) { want = id; if (root.querySelector('[data-id="' + id + '"]')) focusJob(id); } };
  }
  window.ZKJDrawingsHQ = { mount: mountHQ };
  if (page === 'hq') mountHQ($('dw-hq'), window.ZKJ_SB && window.ZKJ_SB.client);
})();
