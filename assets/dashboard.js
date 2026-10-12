/* ZKJ SYSTEM — live demo client dashboard. All state is in memory; nothing is sent anywhere. */
(function () {
  'use strict';
  var Z = window.ZKJ, D = window.ZDEV;
  var t = Z.t, esc = Z.esc;
  var THEME_KEY = 'zkj-dash-theme';

  Z.extend({
    en: {
      'd.meta.title': 'Live demo dashboard — ZKJ SYSTEM',
      'd.client': 'Qahwa House', 'd.client.sub': 'Client dashboard · ZKJ SYSTEM', 'd.demo': 'DEMO',
      'd.theme.brand': 'Theme: Qahwa House', 'd.theme.core': 'Theme: CORE',
      'd.theme.toast.brand': 'Brand theme on — your logo and colours.', 'd.theme.toast.core': 'CORE theme on — the ZKJ VERSE dark view.',
      'd.back': 'Back to site', 'd.login': 'Client login', 'd.enquire': 'Enquire', 'd.enquire.long': 'Get a dashboard like this', 'd.close': 'Close',
      'd.banner': 'This is a live demo with a sample café brand. Everything is clickable; nothing is saved or sent. Your dashboard uses your own logo and colours.',
      'd.reset': 'Reset demo', 'd.reset.toast': 'Demo reset to its starting state.',
      'd.hello': 'Welcome back, Qahwa House', 'd.hello.sub': 'Here’s what your tools did this week — and what needs you.',
      'd.needs': '{n} items need you', 'd.needs1': '1 item needs you', 'd.needs0': 'All clear — nothing needs you',
      'd.kpi.title': 'Key numbers',
      'd.k.reach': 'Reach · 7 days', 'd.k.reach.d': '▲ 12% vs last week',
      'd.k.eng': 'Engagement rate', 'd.k.eng.d': '▲ 0.6 pts',
      'd.k.pub': 'Published this week', 'd.k.pub.d': 'on {n} platforms',
      'd.k.appr': 'Awaiting your approval', 'd.k.appr.d.bad': 'Needs you', 'd.k.appr.d.ok': 'All clear',
      'd.k.fol': 'New followers', 'd.k.fol.d': '▲ across all channels',
      'd.tools.title': 'Your tools', 'd.tools.sub': 'Each card shows what’s pending and what’s done.',
      'd.st.ok': 'On track', 'd.st.warn': 'In progress', 'd.st.bad': 'Needs you', 'd.st.off': 'Not started',
      'd.details': 'Details',
      'd.t.brand.p': 'Pending: autumn menu templates (2 of 3)', 'd.t.brand.d': 'Done: brand guideline v2 — palette, type, voice',
      'd.t.content.p': 'Pending: 2 reels in edit from your latest shoot', 'd.t.content.d': 'Done: 6 posts + 3 reels delivered this week',
      'd.t.pub.p.n': 'Needs you: {n} posts waiting for approval', 'd.t.pub.p.0': 'Pending: queue is clear', 'd.t.pub.d': 'Done: {n} published on {p} platforms this week',
      'd.t.3d.p': 'Not started — e.g. a 3D preview of a new seating area', 'd.t.3d.d': 'Ask KJ to add it to your plan',
      'd.t.2d.p': 'Not started — e.g. a bilingual layout for a second branch', 'd.t.2d.d': 'Ask KJ to add it to your plan',
      'd.t.sec.p': 'Pending: booking-page scan (2 of 3 checks)', 'd.t.sec.d': 'Done: two-step login confirmed on 5 accounts',
      'd.t.ins.p': 'Pending: next report on Sunday', 'd.t.ins.d': 'Done: weekly report — reels drove 64% of reach',
      'd.cal.title': 'Content calendar', 'd.cal.sub': 'Posts, carousels and reels per platform.', 'd.cal.filter': 'Filter by platform',
      'd.cal.all': 'All', 'd.cal.prev': 'This week', 'd.cal.next': 'Next week', 'd.cal.w0': 'This week', 'd.cal.w1': 'Next week', 'd.cal.empty': 'Nothing planned',
      'd.cal.filtered': 'Showing: {p}',
      'd.day.0': 'Sun', 'd.day.1': 'Mon', 'd.day.2': 'Tue', 'd.day.3': 'Wed', 'd.day.4': 'Thu', 'd.day.5': 'Fri', 'd.day.6': 'Sat',
      'd.type.post': 'Post', 'd.type.carousel': 'Carousel', 'd.type.reel': 'Reel', 'd.type.story': 'Story',
      'd.s.published': 'Published', 'd.s.scheduled': 'Scheduled', 'd.s.approval': 'Needs your approval', 'd.s.changes': 'Changes requested',
      'd.src.footage': 'Edited from your footage', 'd.src.photos': 'Edited from your photos', 'd.src.gen': 'Generated in your style',
      'd.appr.title': 'Approvals queue', 'd.appr.sub': 'Nothing is published until you approve it.', 'd.appr.all': 'Approve all',
      'd.appr.approve': 'Approve', 'd.appr.changes': 'Request changes', 'd.appr.undo': 'Undo', 'd.appr.preview': 'Preview',
      'd.appr.when': 'Planned: {w}', 'd.appr.approved': 'Approved — scheduled', 'd.appr.changed': 'Changes requested',
      'd.appr.empty': 'Nothing waiting for you. Approved posts are on the calendar.',
      'd.appr.toast.ok': 'Approved: “{title}” is scheduled for {w}.',
      'd.appr.toast.changes': 'Sent to Content Studio: changes requested on “{title}”.',
      'd.appr.toast.undo': '“{title}” is back in your approvals queue.',
      'd.appr.toast.all': '{n} posts approved and scheduled.', 'd.appr.toast.none': 'There’s nothing waiting for approval.',
      'd.ch.title': 'Request changes', 'd.ch.label': 'What should change in “{title}”?', 'd.ch.ph': 'e.g. Use the second clip as the opening shot and shorten the caption.',
      'd.ch.send': 'Send to Content Studio', 'd.ch.quick': 'Quick picks:', 'd.ch.q1': 'Shorter caption', 'd.ch.q2': 'Different music', 'd.ch.q3': 'Use another photo',
      'd.ch.need': 'Add a short note or choose a quick pick so Content Studio knows what to change.',
      'd.notif.title': 'Notifications', 'd.notif.readall': 'Mark all as read', 'd.notif.done': 'All notifications marked as read.', 'd.notif.empty': 'You’re all caught up.',
      'd.n.1': 'Content Studio finished 2 reels from your latest shoot — ready for approval.', 'd.n.1t': '12 min ago',
      'd.n.2': 'Content Studio would like 3–5 short clips of your cold brew for next week.', 'd.n.2t': '1 h ago',
      'd.n.3': 'Security Agent: booking-page scan is 2 of 3 checks done.', 'd.n.3t': '3 h ago',
      'd.n.4': 'Weekly report ready: reels drove 64% of your reach.', 'd.n.4t': 'Yesterday',
      'd.n.5': '“Latte art in slow motion” was published on TikTok.', 'd.n.5t': 'Mon',
      'd.n.appr': 'You approved “{title}” — scheduled for {w}.', 'd.n.changes': 'Change request sent on “{title}”.', 'd.n.up': '{n} files sent to Content Studio (demo).', 'd.n.now': 'Just now',
      'd.ins.title': 'This week’s insights', 'd.ins.sub': 'From Insights & Reports.', 'd.ins.full': 'Open full report', 'd.ins.chart': 'Reach by platform (last 7 days)',
      'd.ins.w': 'What worked', 'd.ins.w.t': 'Reels filmed at your bar outperformed photo posts 3 to 1. Saves peaked on the autumn menu carousel.',
      'd.ins.n': 'Post next', 'd.ins.n.t': 'Two short reels on cold brew (Thu and Sat evening), plus a carousel answering “what’s the difference between V60 and espresso?”.',
      'd.rep.title': 'Weekly report · Insights & Reports', 'd.rep.body': 'Reach 48.2K (▲12%), engagement 5.8%, 612 new followers. Instagram and TikTok carried 74% of reach. Best post: “Latte art in slow motion”. Weakest: plain text posts on X — keep X for announcements only.',
      'd.rep.cta': 'See the calendar',
      'd.up.title': 'Upload your photos & videos', 'd.up.sub': 'Content Studio edits your own footage first.', 'd.up.drop': 'Drag photos and videos here, or choose files.',
      'd.up.choose': 'Choose files', 'd.up.send': 'Send to Content Studio', 'd.up.clear': 'Clear',
      'd.up.note': 'Demo: files stay on your device and are only previewed in this browser. Nothing is uploaded.',
      'd.up.count': '{n} selected', 'd.up.none': 'Add at least one photo or video first.', 'd.up.added': '{n} file(s) added for preview.',
      'd.up.sent': 'Demo: {n} file(s) would now go to Content Studio. In your live dashboard they upload securely.', 'd.up.cleared': 'Selection cleared.',
      'd.up.remove': 'Remove {name}', 'd.up.skipped': 'Only photos and videos can be added.', 'd.up.photo': 'Photo', 'd.up.video': 'Video',
      'd.tool.status': 'Status', 'd.tool.pending': 'Pending', 'd.tool.done': 'Done',
      'd.tool.go.appr': 'Open approvals', 'd.tool.go.up': 'Upload photos & videos', 'd.tool.go.ins': 'View insights', 'd.tool.go.cal': 'View calendar',
      'd.tool.ask': 'Ask KJ on WhatsApp', 'd.tool.enq': 'Enquire about this tool',
      'd.item.platform': 'Platform', 'd.item.type': 'Type', 'd.item.when': 'When', 'd.item.status': 'Status', 'd.item.src': 'Source',
      'd.enq.title': 'Get a dashboard like this', 'd.enq.body': 'Your own dashboard comes with your logo, your colours and the tools you choose. Tell KJ about your business — he replies personally.',
      'd.enq.wa': 'Message on WhatsApp', 'd.enq.form': 'Send the enquiry form', 'd.enq.ig': 'DM us on Instagram',
      'd.foot': 'Powered by ZKJ SYSTEM · Where Engineering Meets Light'
    },
    ar: {
      'd.meta.title': 'لوحة العرض المباشر — ZKJ SYSTEM',
      'd.client': 'بيت القهوة', 'd.client.sub': 'لوحة العميل · ZKJ SYSTEM', 'd.demo': 'عرض تجريبي',
      'd.theme.brand': 'الثيم: بيت القهوة', 'd.theme.core': 'الثيم: CORE',
      'd.theme.toast.brand': 'ثيم العلامة مفعّل — بشعارك وألوانك.', 'd.theme.toast.core': 'ثيم CORE مفعّل — العرض الداكن من ZKJ VERSE.',
      'd.back': 'العودة للموقع', 'd.login': 'دخول العملاء', 'd.enquire': 'استفسر', 'd.enquire.long': 'أبي لوحة مثل هذي', 'd.close': 'إغلاق',
      'd.banner': 'هذا عرض مباشر بعلامة مقهى نموذجية. كل شيء قابل للنقر، ولا شيء يُحفظ أو يُرسل. لوحتك الحقيقية تأتي بشعارك وألوانك.',
      'd.reset': 'إعادة ضبط العرض', 'd.reset.toast': 'تمت إعادة العرض إلى حالته الأولى.',
      'd.hello': 'أهلًا بعودتك، بيت القهوة', 'd.hello.sub': 'هذا ما أنجزته أدواتك هذا الأسبوع — وما الذي يحتاجك.',
      'd.needs': '{n} عناصر تحتاجك', 'd.needs1': 'عنصر واحد يحتاجك', 'd.needs0': 'كل شيء تمام — لا شيء يحتاجك',
      'd.kpi.title': 'الأرقام الرئيسية',
      'd.k.reach': 'الوصول · 7 أيام', 'd.k.reach.d': '▲ 12% عن الأسبوع الماضي',
      'd.k.eng': 'معدل التفاعل', 'd.k.eng.d': '▲ 0.6 نقطة',
      'd.k.pub': 'منشور هذا الأسبوع', 'd.k.pub.d': 'على {n} منصات',
      'd.k.appr': 'بانتظار موافقتك', 'd.k.appr.d.bad': 'يحتاجك', 'd.k.appr.d.ok': 'كل شيء تمام',
      'd.k.fol': 'متابعون جدد', 'd.k.fol.d': '▲ على كل المنصات',
      'd.tools.title': 'أدواتك', 'd.tools.sub': 'كل بطاقة توضّح ما هو قيد التنفيذ وما تم إنجازه.',
      'd.st.ok': 'على المسار', 'd.st.warn': 'قيد التنفيذ', 'd.st.bad': 'يحتاجك', 'd.st.off': 'لم يبدأ',
      'd.details': 'التفاصيل',
      'd.t.brand.p': 'قيد التنفيذ: قوالب قائمة الخريف (2 من 3)', 'd.t.brand.d': 'تم: دليل الهوية الإصدار 2 — الألوان والخطوط والنبرة',
      'd.t.content.p': 'قيد التنفيذ: ريلزان قيد التحرير من آخر تصوير', 'd.t.content.d': 'تم: 6 منشورات و3 ريلز هذا الأسبوع',
      'd.t.pub.p.n': 'يحتاجك: {n} منشورات بانتظار الموافقة', 'd.t.pub.p.0': 'قيد التنفيذ: لا شيء بالانتظار', 'd.t.pub.d': 'تم: {n} منشورات على {p} منصات هذا الأسبوع',
      'd.t.3d.p': 'لم يبدأ — مثال: معاينة ثلاثية الأبعاد لجلسات جديدة', 'd.t.3d.d': 'اطلب من KJ إضافتها لخطتك',
      'd.t.2d.p': 'لم يبدأ — مثال: مخطط ثنائي اللغة لفرع ثانٍ', 'd.t.2d.d': 'اطلب من KJ إضافتها لخطتك',
      'd.t.sec.p': 'قيد التنفيذ: فحص صفحة الحجز (2 من 3)', 'd.t.sec.d': 'تم: التحقق بخطوتين مفعّل على 5 حسابات',
      'd.t.ins.p': 'قيد التنفيذ: التقرير القادم يوم الأحد', 'd.t.ins.d': 'تم: التقرير الأسبوعي — الريلز حققت 64% من الوصول',
      'd.cal.title': 'تقويم المحتوى', 'd.cal.sub': 'المنشورات والكاروسيل والريلز لكل منصة.', 'd.cal.filter': 'تصفية حسب المنصة',
      'd.cal.all': 'الكل', 'd.cal.prev': 'هذا الأسبوع', 'd.cal.next': 'الأسبوع القادم', 'd.cal.w0': 'هذا الأسبوع', 'd.cal.w1': 'الأسبوع القادم', 'd.cal.empty': 'لا شيء مخطط',
      'd.cal.filtered': 'المعروض: {p}',
      'd.day.0': 'الأحد', 'd.day.1': 'الاثنين', 'd.day.2': 'الثلاثاء', 'd.day.3': 'الأربعاء', 'd.day.4': 'الخميس', 'd.day.5': 'الجمعة', 'd.day.6': 'السبت',
      'd.type.post': 'منشور', 'd.type.carousel': 'كاروسيل', 'd.type.reel': 'ريل', 'd.type.story': 'ستوري',
      'd.s.published': 'منشور', 'd.s.scheduled': 'مجدول', 'd.s.approval': 'بانتظار موافقتك', 'd.s.changes': 'طُلب تعديل',
      'd.src.footage': 'محرَّر من فيديوهاتك', 'd.src.photos': 'محرَّر من صورك', 'd.src.gen': 'مولَّد بأسلوب علامتك',
      'd.appr.title': 'قائمة الموافقات', 'd.appr.sub': 'لا شيء يُنشر قبل موافقتك.', 'd.appr.all': 'الموافقة على الكل',
      'd.appr.approve': 'موافقة', 'd.appr.changes': 'طلب تعديل', 'd.appr.undo': 'تراجع', 'd.appr.preview': 'معاينة',
      'd.appr.when': 'الموعد: {w}', 'd.appr.approved': 'تمت الموافقة — مجدول', 'd.appr.changed': 'طُلب تعديل',
      'd.appr.empty': 'لا شيء بانتظارك. المنشورات المعتمدة موجودة في التقويم.',
      'd.appr.toast.ok': 'تمت الموافقة: «{title}» مجدول يوم {w}.',
      'd.appr.toast.changes': 'أُرسل إلى استوديو المحتوى: طلب تعديل على «{title}».',
      'd.appr.toast.undo': 'رجع «{title}» إلى قائمة الموافقات.',
      'd.appr.toast.all': 'تمت الموافقة على {n} منشورات وجدولتها.', 'd.appr.toast.none': 'لا يوجد شيء بانتظار الموافقة.',
      'd.ch.title': 'طلب تعديل', 'd.ch.label': 'وش تبي نعدّل في «{title}»؟', 'd.ch.ph': 'مثال: استخدم المقطع الثاني كبداية واختصر التعليق.',
      'd.ch.send': 'أرسل إلى استوديو المحتوى', 'd.ch.quick': 'اختيارات سريعة:', 'd.ch.q1': 'تعليق أقصر', 'd.ch.q2': 'موسيقى مختلفة', 'd.ch.q3': 'صورة أخرى',
      'd.ch.need': 'أضف ملاحظة قصيرة أو اختر من الاختيارات السريعة حتى يعرف استوديو المحتوى المطلوب.',
      'd.notif.title': 'الإشعارات', 'd.notif.readall': 'تحديد الكل كمقروء', 'd.notif.done': 'تم تحديد كل الإشعارات كمقروءة.', 'd.notif.empty': 'ما عندك شيء جديد.',
      'd.n.1': 'استوديو المحتوى أنهى ريلزين من آخر تصوير — جاهزة للموافقة.', 'd.n.1t': 'قبل 12 دقيقة',
      'd.n.2': 'استوديو المحتوى يحتاج 3–5 مقاطع قصيرة للكولد برو للأسبوع القادم.', 'd.n.2t': 'قبل ساعة',
      'd.n.3': 'وكيل الأمان: فحص صفحة الحجز أنجز 2 من 3.', 'd.n.3t': 'قبل 3 ساعات',
      'd.n.4': 'التقرير الأسبوعي جاهز: الريلز حققت 64% من وصولك.', 'd.n.4t': 'أمس',
      'd.n.5': 'تم نشر «لاتيه آرت بالحركة البطيئة» على تيك توك.', 'd.n.5t': 'الاثنين',
      'd.n.appr': 'وافقت على «{title}» — مجدول يوم {w}.', 'd.n.changes': 'أُرسل طلب تعديل على «{title}».', 'd.n.up': 'أُرسلت {n} ملفات إلى استوديو المحتوى (عرض تجريبي).', 'd.n.now': 'الآن',
      'd.ins.title': 'تحليلات هذا الأسبوع', 'd.ins.sub': 'من أداة التحليلات والتقارير.', 'd.ins.full': 'افتح التقرير الكامل', 'd.ins.chart': 'الوصول حسب المنصة (آخر 7 أيام)',
      'd.ins.w': 'ما الذي نجح', 'd.ins.w.t': 'الريلز المصوّرة عند البار تفوّقت على منشورات الصور بثلاثة أضعاف. وأعلى حفظ كان لكاروسيل قائمة الخريف.',
      'd.ins.n': 'انشر بعد ذلك', 'd.ins.n.t': 'ريلزان قصيران عن الكولد برو (مساء الخميس والسبت)، وكاروسيل يجاوب: «وش الفرق بين V60 والإسبريسو؟».',
      'd.rep.title': 'التقرير الأسبوعي · التحليلات والتقارير', 'd.rep.body': 'الوصول 48.2 ألف (▲12%)، التفاعل 5.8%، و612 متابعًا جديدًا. إنستغرام وتيك توك حققا 74% من الوصول. أفضل منشور: «لاتيه آرت بالحركة البطيئة». الأضعف: المنشورات النصية على إكس — خلّوا إكس للإعلانات فقط.',
      'd.rep.cta': 'اعرض التقويم',
      'd.up.title': 'ارفع صورك وفيديوهاتك', 'd.up.sub': 'استوديو المحتوى يحرّر موادك الحقيقية أولًا.', 'd.up.drop': 'اسحب الصور والفيديوهات هنا، أو اختر الملفات.',
      'd.up.choose': 'اختر الملفات', 'd.up.send': 'أرسل إلى استوديو المحتوى', 'd.up.clear': 'مسح',
      'd.up.note': 'عرض تجريبي: الملفات تبقى على جهازك وتُعرض في هذا المتصفح فقط. لا يتم رفع أي شيء.',
      'd.up.count': '{n} محدد', 'd.up.none': 'أضف صورة أو فيديو واحد على الأقل أولًا.', 'd.up.added': 'تمت إضافة {n} ملف للمعاينة.',
      'd.up.sent': 'عرض تجريبي: {n} ملف كان سيُرسل الآن إلى استوديو المحتوى. في لوحتك الحقيقية تُرفع بأمان.', 'd.up.cleared': 'تم مسح الاختيار.',
      'd.up.remove': 'إزالة {name}', 'd.up.skipped': 'يمكن إضافة الصور والفيديوهات فقط.', 'd.up.photo': 'صورة', 'd.up.video': 'فيديو',
      'd.tool.status': 'الحالة', 'd.tool.pending': 'قيد التنفيذ', 'd.tool.done': 'تم',
      'd.tool.go.appr': 'افتح الموافقات', 'd.tool.go.up': 'ارفع صورك وفيديوهاتك', 'd.tool.go.ins': 'اعرض التحليلات', 'd.tool.go.cal': 'اعرض التقويم',
      'd.tool.ask': 'اسأل KJ على واتساب', 'd.tool.enq': 'استفسر عن هذه الأداة',
      'd.item.platform': 'المنصة', 'd.item.type': 'النوع', 'd.item.when': 'الموعد', 'd.item.status': 'الحالة', 'd.item.src': 'المصدر',
      'd.enq.title': 'أبي لوحة مثل هذي', 'd.enq.body': 'لوحتك الخاصة تأتي بشعارك وألوانك والأدوات التي تختارها. عرّف KJ على نشاطك — ويرد عليك شخصيًا.',
      'd.enq.wa': 'راسلنا على واتساب', 'd.enq.form': 'أرسل نموذج الاستفسار', 'd.enq.ig': 'راسلنا على إنستغرام',
      'd.foot': 'مدعوم من ZKJ SYSTEM · حيث تلتقي الهندسة بالضوء'
    }
  });

  Z.extend({
    en: {
      'd.t.audit.p': 'Pending: website speed and booking-app review', 'd.t.audit.d': 'Done: market study — 5 competing cafés compared',
      'd.t.content.p': 'Pending: 2 reels + 1 story in edit from your latest shoot', 'd.t.content.d': 'Done: 6 posts, 3 reels, 4 stories, 1 location-reveal video',
      'd.t.inbox.p.n': 'Needs you: {n} suggested replies to review', 'd.t.inbox.p.0': 'Pending: inbox is clear', 'd.t.inbox.d': 'Done: 214 comments and DMs answered this week',
      'd.t.wa.p': 'Pending: add 3 new autumn drinks to the catalogue', 'd.t.wa.d': 'Done: 128 chats answered, 14 pickup orders taken',
      'd.t.smm.p': 'Pending: fresh creative for the Meta campaign', 'd.t.smm.d': 'Done: Meta + TikTok campaigns live — see Ads',
      'd.t.yt.p': 'Not started — e.g. weekly Shorts from your bar footage', 'd.t.yt.d': 'Ask KJ to add it to your plan',
      'd.t.google.p': 'Pending: new photos for your Google Business Profile', 'd.t.google.d': 'Done: Search campaign live — 41 direction requests',
      'd.tool.go.inbox': 'Open inbox', 'd.tool.go.ads': 'View ads',
      'd.inbox.title': 'Inbox', 'd.inbox.sub': 'Comments, DMs and WhatsApp — with AI-suggested replies in your brand voice.',
      'd.inbox.note': 'Replies go out through each platform’s official API (WhatsApp via the WhatsApp Business Platform). Demo: nothing is sent.',
      'd.inbox.k.comment': 'comment', 'd.inbox.k.dm': 'DM', 'd.inbox.k.msg': 'message',
      'd.inbox.suggested': 'Suggested reply', 'd.inbox.sensitive': 'Sensitive — suggested: escalate to you',
      'd.inbox.send': 'Send', 'd.inbox.edit': 'Edit', 'd.inbox.escalate': 'Escalate', 'd.inbox.undo': 'Undo',
      'd.inbox.sent': 'Reply sent', 'd.inbox.escalated': 'Escalated to your team — the AI won’t reply',
      'd.inbox.toast.sent': 'Reply sent on {p} (demo).', 'd.inbox.toast.esc': 'Escalated: {who} is waiting for a reply from your team.', 'd.inbox.toast.undo': 'Message moved back to your inbox.',
      'd.inbox.edit.title': 'Edit reply', 'd.inbox.edit.label': 'Reply to {who}', 'd.inbox.edit.send': 'Save & send', 'd.inbox.edit.need': 'The reply can’t be empty.',
      'd.inbox.empty': 'Inbox zero — every message is handled.',
      'd.ads.title': 'Ads', 'd.ads.sub': 'Campaigns from Social Media Marketing and Google Ads & Marketing.', 'd.ads.demo': 'Demo numbers',
      'd.ads.note': 'Ad budget is paid by you directly to each platform.',
      'd.ads.spend': 'Spent {s} of {b}', 'd.ads.total': 'This month: {s} spent of {b} budget',
      'd.ads.st.active': 'Active', 'd.ads.st.learning': 'Learning', 'd.ads.st.paused': 'Paused',
      'd.ads.pause': 'Pause', 'd.ads.resume': 'Resume', 'd.ads.details': 'Details',
      'd.ads.toast.pause': '“{name}” paused (demo).', 'd.ads.toast.resume': '“{name}” resumed (demo).',
      'd.ads.k.platform': 'Platform', 'd.ads.k.results': 'Results', 'd.ads.k.budget': 'Budget', 'd.ads.k.status': 'Status',
      'd.n.6': '4 new comments and messages — AI replies ready for review.', 'd.n.6t': '5 min ago',
      'd.n.7': 'TikTok campaign is still learning — expect stable results in 2–3 days.', 'd.n.7t': '2 h ago',
      'd.n.inbox': 'Reply sent to {who}.', 'd.n.esc': '{who} was escalated to your team.'
    },
    ar: {
      'd.t.audit.p': 'قيد التنفيذ: مراجعة سرعة الموقع وتطبيق الحجز', 'd.t.audit.d': 'تم: دراسة السوق — مقارنة 5 مقاهٍ منافسة',
      'd.t.content.p': 'قيد التنفيذ: ريلزان وستوري من آخر تصوير', 'd.t.content.d': 'تم: 6 منشورات و3 ريلز و4 ستوري وفيديو كشف موقع',
      'd.t.inbox.p.n': 'يحتاجك: {n} ردود مقترحة للمراجعة', 'd.t.inbox.p.0': 'قيد التنفيذ: لا رسائل بالانتظار', 'd.t.inbox.d': 'تم: الرد على 214 تعليقًا ورسالة هذا الأسبوع',
      'd.t.wa.p': 'قيد التنفيذ: إضافة 3 مشروبات خريفية للكتالوج', 'd.t.wa.d': 'تم: الرد على 128 محادثة واستلام 14 طلب استلام',
      'd.t.smm.p': 'قيد التنفيذ: تصاميم جديدة لحملة ميتا', 'd.t.smm.d': 'تم: حملات ميتا وتيك توك تعمل — شوف الإعلانات',
      'd.t.yt.p': 'لم يبدأ — مثال: شورتس أسبوعية من تصوير البار', 'd.t.yt.d': 'اطلب من KJ إضافتها لخطتك',
      'd.t.google.p': 'قيد التنفيذ: صور جديدة لملفك التجاري على جوجل', 'd.t.google.d': 'تم: حملة البحث تعمل — 41 طلب اتجاهات',
      'd.tool.go.inbox': 'افتح الرسائل', 'd.tool.go.ads': 'اعرض الإعلانات',
      'd.inbox.title': 'الرسائل', 'd.inbox.sub': 'التعليقات والرسائل الخاصة وواتساب — مع ردود مقترحة بنبرة علامتك.',
      'd.inbox.note': 'الردود تُرسل عبر الواجهة الرسمية لكل منصة (وواتساب عبر منصة واتساب للأعمال). عرض تجريبي: لا يُرسل شيء.',
      'd.inbox.k.comment': 'تعليق', 'd.inbox.k.dm': 'رسالة خاصة', 'd.inbox.k.msg': 'رسالة',
      'd.inbox.suggested': 'الرد المقترح', 'd.inbox.sensitive': 'حساسة — المقترح: تحويلها إليك',
      'd.inbox.send': 'إرسال', 'd.inbox.edit': 'تعديل', 'd.inbox.escalate': 'تحويل', 'd.inbox.undo': 'تراجع',
      'd.inbox.sent': 'تم إرسال الرد', 'd.inbox.escalated': 'حُوّلت لفريقك — الذكاء الاصطناعي لن يرد',
      'd.inbox.toast.sent': 'تم إرسال الرد على {p} (عرض تجريبي).', 'd.inbox.toast.esc': 'تم التحويل: {who} بانتظار رد من فريقك.', 'd.inbox.toast.undo': 'رجعت الرسالة إلى صندوقك.',
      'd.inbox.edit.title': 'تعديل الرد', 'd.inbox.edit.label': 'الرد على {who}', 'd.inbox.edit.send': 'حفظ وإرسال', 'd.inbox.edit.need': 'لا يمكن أن يكون الرد فارغًا.',
      'd.inbox.empty': 'الصندوق فاضي — كل الرسائل تمت معالجتها.',
      'd.ads.title': 'الإعلانات', 'd.ads.sub': 'حملات التسويق عبر السوشال ميديا وإعلانات جوجل.', 'd.ads.demo': 'أرقام تجريبية',
      'd.ads.note': 'ميزانية الإعلانات تدفعها أنت مباشرة لكل منصة.',
      'd.ads.spend': 'صُرف {s} من {b}', 'd.ads.total': 'هذا الشهر: صُرف {s} من ميزانية {b}',
      'd.ads.st.active': 'نشطة', 'd.ads.st.learning': 'مرحلة التعلّم', 'd.ads.st.paused': 'متوقفة',
      'd.ads.pause': 'إيقاف', 'd.ads.resume': 'استئناف', 'd.ads.details': 'التفاصيل',
      'd.ads.toast.pause': 'تم إيقاف «{name}» (عرض تجريبي).', 'd.ads.toast.resume': 'تم استئناف «{name}» (عرض تجريبي).',
      'd.ads.k.platform': 'المنصة', 'd.ads.k.results': 'النتائج', 'd.ads.k.budget': 'الميزانية', 'd.ads.k.status': 'الحالة',
      'd.n.6': '4 تعليقات ورسائل جديدة — الردود المقترحة جاهزة للمراجعة.', 'd.n.6t': 'قبل 5 دقائق',
      'd.n.7': 'حملة تيك توك ما زالت في مرحلة التعلّم — النتائج تستقر خلال 2–3 أيام.', 'd.n.7t': 'قبل ساعتين',
      'd.n.inbox': 'تم إرسال الرد إلى {who}.', 'd.n.esc': 'تم تحويل {who} إلى فريقك.'
    }
  });

  Z.extend({
    en: {
      'd.live': 'Live demo', 'd.demo.long': 'Demo — this is what your clients see', 'd.plan': 'Full package · Demo', 'd.sb.glance': 'At a glance', 'd.sb.inbox': 'Replies to review', 'd.sb.next': 'Next to publish',
      'd.next.title': 'Up next', 'd.next.all': 'Open calendar', 'd.appr.done': 'Recently reviewed', 'd.stack.left': '{n} waiting',
      'd.inst.trend': 'Trend', 'd.inst.rate': 'Rate', 'd.inst.progress': 'Progress', 'd.inst.queue': 'Queue', 'd.k.pub.of': '/ {n} planned'
    },
    ar: {
      'd.live': 'عرض مباشر', 'd.demo.long': 'عرض تجريبي — هذا ما يراه عملاؤك', 'd.plan': 'الباقة الكاملة · تجريبي', 'd.sb.glance': 'نظرة سريعة', 'd.sb.inbox': 'ردود للمراجعة', 'd.sb.next': 'التالي للنشر',
      'd.next.title': 'التالي', 'd.next.all': 'افتح التقويم', 'd.appr.done': 'تمت مراجعتها مؤخرًا', 'd.stack.left': '{n} بالانتظار',
      'd.inst.trend': 'الاتجاه', 'd.inst.rate': 'المعدل', 'd.inst.progress': 'التقدّم', 'd.inst.queue': 'الطابور', 'd.k.pub.of': '/ {n} مخطط'
    }
  });

  /* ---------- Seed data ---------- */
  function seed() {
    return {
      week: 0,
      filter: 'all',
      approvals: [
        { id: 'a1', type: 'reel', platforms: ['instagram', 'tiktok'], src: 'footage', state: 'pending', art: ['#6B3A1E', '#C8853B'],
          when: { en: 'Thu 7:30 PM', ar: 'الخميس 7:30 م' },
          title: { en: 'Pour-over in 15 seconds', ar: 'قهوة مقطّرة في 15 ثانية' },
          caption: { en: 'Slow coffee, fast reel. Our V60 from bloom to first sip — filmed at the bar this morning.', ar: 'قهوة على مهل في ريل سريع. الـV60 من أول صبّة لأول رشفة — صوّرناها عند البار الصبح.' } },
        { id: 'a2', type: 'carousel', platforms: ['instagram', 'facebook'], src: 'photos', state: 'pending', art: ['#8C4A1F', '#E9B872'],
          when: { en: 'Fri 1:00 PM', ar: 'الجمعة 1:00 م' },
          title: { en: 'New: Saffron Cardamom Latte', ar: 'جديد: لاتيه الزعفران والهيل' },
          caption: { en: 'Saffron, cardamom, a double shot and steamed milk. Five slides on how we make it — available all autumn.', ar: 'زعفران وهيل مع دبل شوت وحليب مبخّر. خمس شرائح عن طريقة تحضيره — متوفر طوال الخريف.' } },
        { id: 'a3', type: 'post', platforms: ['x', 'facebook'], src: 'gen', state: 'pending', art: ['#2A1910', '#9A5426'],
          when: { en: 'Sat 9:00 AM', ar: 'السبت 9:00 ص' },
          title: { en: 'Weekend hours', ar: 'مواعيد نهاية الأسبوع' },
          caption: { en: 'This weekend we open at 7 AM and stay until midnight. Breakfast menu until noon.', ar: 'هالويكند نفتح من 7 الصبح لين نص الليل. قائمة الفطور لين الظهر.' } },
        { id: 'a4', type: 'reel', platforms: ['tiktok', 'youtube'], src: 'footage', state: 'pending', art: ['#3B2418', '#D9A066'],
          when: { en: 'Next Sun 6:00 PM', ar: 'الأحد القادم 6:00 م' },
          title: { en: 'Behind the roast', ar: 'خلف كواليس التحميص' },
          caption: { en: 'From green bean to first crack. 40 seconds inside our roastery, cut from your footage.', ar: 'من الحبة الخضراء إلى أول طقّة. 40 ثانية داخل محمصتنا، مقطوعة من فيديوهاتك.' } }
      ],
      cal: [
        // week, day, time, platform, type, status, title, approval link
        { id: 'c1', w: 0, d: 0, time: '9:00', p: 'instagram', type: 'carousel', s: 'published', src: 'photos', title: { en: 'Autumn menu is here', ar: 'قائمة الخريف وصلت' } },
        { id: 'c2', w: 0, d: 0, time: '9:30', p: 'facebook', type: 'post', s: 'published', src: 'photos', title: { en: 'Autumn menu is here', ar: 'قائمة الخريف وصلت' } },
        { id: 'c3', w: 0, d: 1, time: '18:00', p: 'tiktok', type: 'reel', s: 'published', src: 'footage', title: { en: 'Latte art in slow motion', ar: 'لاتيه آرت بالحركة البطيئة' } },
        { id: 'c4', w: 0, d: 1, time: '8:00', p: 'x', type: 'post', s: 'published', src: 'gen', title: { en: 'Monday opening hours', ar: 'مواعيد الاثنين' } },
        { id: 'c5', w: 0, d: 2, time: '10:00', p: 'instagram', type: 'story', s: 'published', src: 'photos', title: { en: 'Today’s single origin: Ethiopia Guji', ar: 'محصول اليوم: إثيوبيا قوجي' } },
        { id: 'c6', w: 0, d: 2, time: '12:00', p: 'linkedin', type: 'post', s: 'published', src: 'photos', title: { en: 'Meet our head roaster', ar: 'تعرّف على رئيس المحمصة' } },
        { id: 'c7', w: 0, d: 3, time: '11:00', p: 'pinterest', type: 'post', s: 'published', src: 'photos', title: { en: 'Saffron latte recipe card', ar: 'بطاقة وصفة لاتيه الزعفران' } },
        { id: 'c8', w: 0, d: 3, time: '17:00', p: 'instagram', type: 'reel', s: 'published', src: 'footage', title: { en: 'Morning rush, 20 seconds', ar: 'زحمة الصبح في 20 ثانية' } },
        { id: 'c9', w: 0, d: 3, time: '19:00', p: 'youtube', type: 'reel', s: 'published', src: 'footage', title: { en: 'Morning rush, 20 seconds', ar: 'زحمة الصبح في 20 ثانية' } },
        { id: 'c10', w: 0, d: 4, time: '19:30', p: 'instagram', type: 'reel', a: 'a1' },
        { id: 'c11', w: 0, d: 4, time: '19:30', p: 'tiktok', type: 'reel', a: 'a1' },
        { id: 'c12', w: 0, d: 5, time: '13:00', p: 'instagram', type: 'carousel', a: 'a2' },
        { id: 'c13', w: 0, d: 5, time: '13:00', p: 'facebook', type: 'carousel', a: 'a2' },
        { id: 'c14', w: 0, d: 6, time: '9:00', p: 'x', type: 'post', a: 'a3' },
        { id: 'c15', w: 0, d: 6, time: '9:00', p: 'facebook', type: 'post', a: 'a3' },
        { id: 'c16', w: 1, d: 0, time: '18:00', p: 'tiktok', type: 'reel', a: 'a4' },
        { id: 'c17', w: 1, d: 0, time: '18:00', p: 'youtube', type: 'reel', a: 'a4' },
        { id: 'c18', w: 1, d: 1, time: '10:00', p: 'instagram', type: 'post', s: 'scheduled', src: 'photos', title: { en: 'Regular of the week', ar: 'زبون الأسبوع' } },
        { id: 'c19', w: 1, d: 2, time: '12:00', p: 'facebook', type: 'post', s: 'scheduled', src: 'gen', title: { en: 'Loyalty card reminder', ar: 'تذكير بطاقة الولاء' } },
        { id: 'c20', w: 1, d: 3, time: '18:30', p: 'instagram', type: 'reel', s: 'scheduled', src: 'footage', title: { en: 'Cold brew, 18 hours', ar: 'كولد برو، 18 ساعة' } },
        { id: 'c21', w: 1, d: 4, time: '11:00', p: 'pinterest', type: 'post', s: 'scheduled', src: 'photos', title: { en: 'Autumn menu board', ar: 'لوحة قائمة الخريف' } },
        { id: 'c22', w: 1, d: 5, time: '9:00', p: 'linkedin', type: 'post', s: 'scheduled', src: 'gen', title: { en: 'Why we roast in small batches', ar: 'ليش نحمّص بكميات صغيرة' } },
        { id: 'c23', w: 0, d: 4, time: '8:00', p: 'instagram', type: 'story', s: 'scheduled', src: 'footage', title: { en: 'Thursday special at the bar', ar: 'عرض الخميس عند البار' } },
        { id: 'c24', w: 0, d: 6, time: '16:00', p: 'facebook', type: 'story', s: 'scheduled', src: 'photos', title: { en: 'Weekend pastry box', ar: 'بوكس معجنات الويكند' } },
        { id: 'c25', w: 1, d: 2, time: '8:30', p: 'instagram', type: 'story', s: 'scheduled', src: 'footage', title: { en: 'Poll: hot or iced saffron latte?', ar: 'تصويت: لاتيه الزعفران حار ولا بارد؟' } },
        { id: 'c26', w: 1, d: 6, time: '17:00', p: 'youtube', type: 'reel', s: 'scheduled', src: 'footage', title: { en: 'Location reveal: Qahwa House rising from the map', ar: 'كشف الموقع: بيت القهوة يرتفع من الخريطة' } }
      ],
      notifs: [
        { id: 'n6', kind: 'bad', key: 'd.n.6', tkey: 'd.n.6t', target: 'inbox', read: false },
        { id: 'n1', kind: 'bad', key: 'd.n.1', tkey: 'd.n.1t', target: 'approvals', read: false },
        { id: 'n2', kind: 'warn', key: 'd.n.2', tkey: 'd.n.2t', target: 'upload', read: false },
        { id: 'n3', kind: 'warn', key: 'd.n.3', tkey: 'd.n.3t', target: 'tools', read: false },
        { id: 'n4', kind: 'ok', key: 'd.n.4', tkey: 'd.n.4t', target: 'insights', read: false },
        { id: 'n7', kind: 'warn', key: 'd.n.7', tkey: 'd.n.7t', target: 'ads', read: true },
        { id: 'n5', kind: 'ok', key: 'd.n.5', tkey: 'd.n.5t', target: 'calendar', read: true }
      ],
      inbox: [
        { id: 'i1', p: 'instagram', k: 'comment', who: '@layla.k', state: 'pending',
          msg: { en: 'Do you have the saffron latte iced too?', ar: 'عندكم لاتيه الزعفران بارد؟' },
          reply: { en: 'Yes. The iced Saffron Cardamom Latte is on the autumn menu all day. See you soon.', ar: 'إيه أكيد، لاتيه الزعفران والهيل البارد موجود في قائمة الخريف طول اليوم. ننتظرك.' } },
        { id: 'i2', p: 'instagram', k: 'dm', who: '@omar.events', state: 'pending',
          msg: { en: 'Hi, can we book a table for 8 on Friday evening?', ar: 'مرحبا، نقدر نحجز طاولة لـ8 أشخاص الجمعة المسا؟' },
          reply: { en: 'Hi Omar, happy to host you. We have space for 8 on Friday from 7 PM. Shall I reserve it under your name?', ar: 'هلا عمر، يسعدنا. عندنا مكان لـ8 أشخاص يوم الجمعة من الساعة 7 المسا. أحجزها باسمك؟' } },
        { id: 'i3', p: 'tiktok', k: 'comment', who: '@coffee.nerd', state: 'pending',
          msg: { en: 'Which beans are you using for the V60?', ar: 'أي بن تستخدمون للـV60؟' },
          reply: { en: 'This week it’s Ethiopia Guji — floral and light roast. Ask the bar for a free tasting.', ar: 'هالأسبوع إثيوبيا قوجي — زهري وتحميص فاتح. اطلب تذوّق مجاني من البار.' } },
        { id: 'i4', p: 'whatsapp', k: 'msg', who: '+971 5• ••• 2231', state: 'pending', sensitive: true,
          msg: { en: 'My order yesterday was missing a croissant.', ar: 'طلبي أمس كان ناقص كرواسون.' },
          reply: { en: 'We’re sorry about that. I’m passing this to the team now so they can make it right.', ar: 'نعتذر منك. بحوّل الموضوع للفريق الحين عشان يعوضونك.' } }
      ],
      ads: [
        { id: 'ad1', p: 'meta', state: 'active', spend: 1240, budget: 2000,
          name: { en: 'Autumn menu — local reach', ar: 'قائمة الخريف — وصول محلي' },
          results: { en: '18.4K reached · 312 link clicks', ar: '18.4 ألف وصول · 312 نقرة' } },
        { id: 'ad2', p: 'google', state: 'active', spend: 860, budget: 1200,
          name: { en: 'Search — “coffee near me”', ar: 'بحث — «قهوة قريبة مني»' },
          results: { en: '96 calls · 41 direction requests', ar: '96 اتصال · 41 طلب اتجاهات' } },
        { id: 'ad3', p: 'tiktok', state: 'learning', spend: 450, budget: 1500,
          name: { en: 'Saffron latte launch', ar: 'إطلاق لاتيه الزعفران' },
          results: { en: '62K views · 3.1% click rate', ar: '62 ألف مشاهدة · 3.1% نسبة نقر' } }
      ],
      files: []
    };
  }

  var S = seed();
  var notifSeq = 100;
  var AD_PLATFORMS = { meta: { en: 'Meta (Instagram + Facebook)', ar: 'ميتا (إنستغرام + فيسبوك)', color: '#1877F2' }, google: { en: 'Google Ads', ar: 'إعلانات جوجل', color: '#34A853' }, tiktok: { en: 'TikTok Ads', ar: 'إعلانات تيك توك', color: '#25C2C9' } };
  var WA_PLAT = { id: 'whatsapp', en: 'WhatsApp', ar: 'واتساب', color: '#25D366' };
  function money(n) { return (L() === 'ar' ? n.toLocaleString('en-US') + ' د.إ' : 'AED ' + n.toLocaleString('en-US')); }
  function inboxPending() { return S.inbox.filter(function (m) { return m.state === 'pending'; }).length; }
  var BARS = [['instagram', 21.4], ['tiktok', 14.1], ['facebook', 6.3], ['youtube', 3.2], ['x', 1.8], ['linkedin', 0.9], ['pinterest', 0.5]];

  /* ---------- Helpers ---------- */
  function L() { return Z.getLang(); }
  function $(id) { return document.getElementById(id); }
  var EXTRA_PLAT = [
    { id: 'snapchat', en: 'Snapchat', ar: 'سناب شات', color: '#E8D90C' },
    { id: 'google', en: 'Google', ar: 'جوجل', color: '#34A853' },
    { id: 'threads', en: 'Threads', ar: 'ثريدز', color: '#E8E8E8' },
    { id: 'meta', en: 'Meta', ar: 'ميتا', color: '#1877F2' }
  ];
  function plat(id) { if (id === 'whatsapp') return WA_PLAT; var all = Z.PLATFORMS.concat(EXTRA_PLAT); for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i]; return { id: id, en: id, ar: id, color: '#999' }; }
  function appr(id) { for (var i = 0; i < S.approvals.length; i++) if (S.approvals[i].id === id) return S.approvals[i]; return null; }
  function tool(id) { for (var i = 0; i < Z.TOOLS.length; i++) if (Z.TOOLS[i].id === id) return Z.TOOLS[i]; return null; }
  function pendingCount() { return S.approvals.filter(function (a) { return a.state === 'pending'; }).length; }
  function fmtTime(hm) {
    var p = hm.split(':'), h = +p[0], m = p[1];
    var am = h < 12; var h12 = h % 12 || 12;
    return h12 + ':' + m + ' ' + (L() === 'ar' ? (am ? 'ص' : 'م') : (am ? 'AM' : 'PM'));
  }
  function calItem(c) {
    // resolve approval-linked items
    if (c.a) {
      var a = appr(c.a);
      var s = a.state === 'pending' ? 'approval' : a.state === 'approved' ? 'scheduled' : 'changes';
      return { id: c.id, w: c.w, d: c.d, time: c.time, p: c.p, type: c.type, s: s, src: a.src, title: a.title, a: c.a };
    }
    return c;
  }
  var STATUS_DOT = { published: 'ok', scheduled: 'warn', approval: 'bad', changes: 'warn' };
  function publishedThisWeek() { return S.cal.map(calItem).filter(function (c) { return c.w === 0 && c.s === 'published'; }); }

  /* ---------- Renderers (device UI kit: assets/device.js) ---------- */
  var QLOGO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="#C8853B"/><circle cx="24" cy="24" r="19.5" fill="none" stroke="#2A1910" stroke-width="1.2" stroke-dasharray="2 2.4"/><path d="M14 20h16v6a7 7 0 01-7 7h-2a7 7 0 01-7-7z" fill="#2A1910"/><path d="M30 22h2a3 3 0 010 6h-2.4" fill="none" stroke="#2A1910" stroke-width="2"/><path d="M19 12c0 2 1.6 2 1.6 4M24 11c0 2 1.6 2 1.6 4" fill="none" stroke="#FFF8EE" stroke-width="1.8" stroke-linecap="round"/><path d="M13 35h20" stroke="#2A1910" stroke-width="2" stroke-linecap="round"/></svg>';
  var HANDLE = 'qahwahouse';
  document.querySelectorAll('[data-qlogo]').forEach(function (el) { el.innerHTML = QLOGO; });
  function loc() { return L() === 'ar' ? 'ar-u-nu-latn' : 'en-GB'; }
  function weekDate(w, d) { var x = new Date(); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - x.getDay() + w * 7 + d); return x; }

  function renderTheme() {
    var th = $('dash').getAttribute('data-theme');
    var label = t(th === 'brand' ? 'd.theme.brand' : 'd.theme.core');
    $('theme-label').textContent = label;
    $('theme-label-m').textContent = label;
    $('theme-btn').setAttribute('aria-pressed', th === 'core' ? 'true' : 'false');
    $('theme-btn').setAttribute('aria-label', label);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', th === 'brand' ? '#2A1910' : '#070709');
  }

  function renderKpis() {
    var n = pendingCount();
    var pub = publishedThisWeek();
    var plats = {}; pub.forEach(function (c) { plats[c.p] = 1; });
    var planned = S.cal.filter(function (c) { return c.w === 0; }).length;
    var tag = function (k) { return '<span class="inst-tag">' + esc(t(k)) + '</span>'; };
    var pips = ''; for (var i = 0; i < n; i++) pips += '<i></i>';
    var tiles = [
      '<div class="inst inst-num">' + tag('d.inst.trend') + '<span class="big">48.2K</span><div class="inst-spark">' + D.spark([31.4, 33.9, 30.2, 37.8, 41.1, 44.6, 48.2]) + '</div>' +
        '<span class="inst-label">' + esc(t('d.k.reach')) + '</span><span class="inst-foot"><span class="status-ok">' + esc(t('d.k.reach.d')) + '</span></span></div>',
      '<div class="inst inst-gauge">' + tag('d.inst.rate') + '<div class="inst-dial">' + D.gauge(0.58, { max: 10 }) + '<div class="inst-read"><span class="v">5.8%</span><span class="of">/ 10%</span></div></div>' +
        '<span class="inst-label">' + esc(t('d.k.eng')) + '</span><span class="inst-foot"><span class="status-ok">' + esc(t('d.k.eng.d')) + '</span></span></div>',
      '<div class="inst inst-ring">' + tag('d.inst.progress') + '<div class="inst-dial">' + D.ring(pub.length / planned) + '<div class="inst-read"><span class="v">' + pub.length + '</span><span class="of">' + esc(t('d.k.pub.of', { n: planned })) + '</span></div></div>' +
        '<span class="inst-label">' + esc(t('d.k.pub')) + '</span><span class="inst-foot"><span class="mono">' + esc(t('d.k.pub.d', { n: Object.keys(plats).length })) + '</span></span></div>',
      '<button class="inst inst-num inst-need' + (n ? '' : ' is-clear') + '" type="button" data-nav="approvals">' + tag('d.inst.queue') + '<span class="big">' + n + '</span>' +
        (n ? '<span class="need-pips" aria-hidden="true">' + pips + '</span>' : '<div class="inst-ruler" aria-hidden="true"></div>') +
        '<span class="inst-label">' + esc(t('d.k.appr')) + '</span><span class="inst-foot"><span class="' + (n ? 'status-bad' : 'status-ok') + '">' + esc(t(n ? 'd.k.appr.d.bad' : 'd.k.appr.d.ok')) + '</span></span></button>',
      '<div class="inst inst-num">' + tag('d.inst.trend') + '<span class="big">+612</span><div class="inst-spark">' + D.spark([40, 62, 71, 88, 79, 120, 152]) + '</div>' +
        '<span class="inst-label">' + esc(t('d.k.fol')) + '</span><span class="inst-foot"><span class="status-ok">' + esc(t('d.k.fol.d')) + '</span></span></div>'
    ];
    $('kpi-row').innerHTML = tiles.join('');
    D.animateIn($('kpi-row'));
    var nb = $('needs-you-btn');
    nb.textContent = n === 0 ? t('d.needs0') : n === 1 ? t('d.needs1') : t('d.needs', { n: n });
    nb.classList.toggle('is-clear', n === 0);
    $('today-date').textContent = new Intl.DateTimeFormat(loc(), { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Dubai' }).format(new Date()) + ' · ' + t('dv.dubai');
    D.setBadge('approvals', n);
    D.setBadge('inbox', inboxPending());
    renderSide();
  }

  function upcoming() {
    var now = new Date(), today = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
    var m = function (c) { var p = c.time.split(':'); return +p[0] * 60 + +p[1]; };
    return S.cal.map(calItem).filter(function (c) { return c.s !== 'published' && (c.w > 0 || c.d > today || (c.d === today && m(c) >= mins)); })
      .sort(function (a, b) { return a.w - b.w || a.d - b.d || m(a) - m(b); });
  }
  function statusTag(c) { return '<span class="status-tag ' + STATUS_DOT[c.s] + '">' + esc(t('d.s.' + c.s)) + '</span>'; }
  function renderSide() {
    var n = pendingCount();
    $('sb-need').textContent = n; $('sb-need').classList.toggle('hot', n > 0);
    $('sb-inbox').textContent = inboxPending(); $('sb-inbox').classList.toggle('hot', inboxPending() > 0);
    $('sb-pub').textContent = publishedThisWeek().length;
    var list = upcoming();
    var nx = list[0];
    if (nx) {
      $('sb-next').setAttribute('data-id', nx.id);
      $('sb-next').innerHTML = '<span class="when">' + esc(t(nx.w ? 'd.cal.w1' : 'd.cal.w0') + ' · ' + t('d.day.' + nx.d) + ' ') + '<span dir="ltr">' + esc(fmtTime(nx.time)) + '</span></span><strong>' + esc(nx.title[L()]) + '</strong><span>' + esc(plat(nx.p)[L()] + ' · ' + t('d.type.' + nx.type)) + '</span>';
    }
    $('next-list').innerHTML = list.slice(0, 4).map(function (c) {
      var p = plat(c.p);
      return '<li><button type="button" data-action="cal-item" data-id="' + c.id + '"><span class="un-when"><span>' + esc(t('d.day.' + c.d)) + '</span><b dir="ltr">' + esc(c.time) + '</b></span>' +
        '<span class="un-title"><strong>' + esc(c.title[L()]) + '</strong><span>' + '<span class="pmark" style="color:' + p.color + '">' + D.pglyph(c.p) + '</span>' + esc(p[L()]) + ' · ' + esc(t('d.type.' + c.type)) + '</span></span>' + statusTag(c) + '</button></li>';
    }).join('');
  }

  function toolState(id) {
    var n = pendingCount(), pub = publishedThisWeek();
    var plats = {}; pub.forEach(function (c) { plats[c.p] = 1; });
    switch (id) {
      case 'brand': return { s: 'ok', p: t('d.t.brand.p'), d: t('d.t.brand.d'), go: null };
      case 'content': return { s: 'warn', p: t('d.t.content.p'), d: t('d.t.content.d'), go: 'upload' };
      case 'publisher': return { s: n ? 'bad' : 'ok', p: n ? t('d.t.pub.p.n', { n: n }) : t('d.t.pub.p.0'), d: t('d.t.pub.d', { n: pub.length, p: Object.keys(plats).length }), go: n ? 'approvals' : 'calendar' };
      case 'audit': return { s: 'ok', p: t('d.t.audit.p'), d: t('d.t.audit.d'), go: null };
      case 'inbox': var ni = inboxPending(); return { s: ni ? 'bad' : 'ok', p: ni ? t('d.t.inbox.p.n', { n: ni }) : t('d.t.inbox.p.0'), d: t('d.t.inbox.d'), go: 'inbox' };
      case 'whatsapp': return { s: 'ok', p: t('d.t.wa.p'), d: t('d.t.wa.d'), go: 'inbox' };
      case 'smm': return { s: 'warn', p: t('d.t.smm.p'), d: t('d.t.smm.d'), go: 'ads' };
      case 'youtube': return { s: 'off', p: t('d.t.yt.p'), d: t('d.t.yt.d'), go: null };
      case 'google': return { s: 'ok', p: t('d.t.google.p'), d: t('d.t.google.d'), go: 'ads' };
      case 'builder3d': return { s: 'off', p: t('d.t.3d.p'), d: t('d.t.3d.d'), go: null };
      case 'drawings': return { s: 'off', p: t('d.t.2d.p'), d: t('d.t.2d.d'), go: null };
      case 'security': return { s: 'warn', p: t('d.t.sec.p'), d: t('d.t.sec.d'), go: null };
      case 'insights': return { s: 'ok', p: t('d.t.ins.p'), d: t('d.t.ins.d'), go: 'insights' };
    }
    return { s: 'off', p: '', d: '' };
  }

  function renderTools() {
    $('dtools').innerHTML = Z.GROUPS.map(function (g) {
      var list = Z.TOOLS.filter(function (tl) { return tl.group === g.id; });
      return '<div class="lp-group"><h3 class="lp-title"><span class="tag">' + g.code + '</span> ' + esc(g[L()].name) + '</h3><ul class="lp-grid">' + list.map(function (tl) {
        var st = toolState(tl.id);
        return '<li><button class="lp-app state-' + st.s + '" type="button" data-action="tool-detail" data-id="' + tl.id + '" id="dtool-' + tl.id + '">' +
          '<span class="lp-icon">' + tl.icon + '<span class="dot ' + st.s + '"></span></span><span class="lp-name">' + esc(tl[L()].name) + '</span>' +
          '<span class="lp-state status-' + st.s + '">' + esc(t('d.st.' + st.s)) + '</span><span class="sr-only"> — ' + esc(st.p) + '</span></button></li>';
      }).join('') + '</ul></div>';
    }).join('');
  }

  function renderInbox() {
    var list = $('inbox-list');
    list.innerHTML = S.inbox.map(function (m) {
      var p = plat(m.p);
      var head = '<div class="ib-head"><span class="chip chip-static">' + '<span class="pmark" style="color:' + p.color + '">' + D.pglyph(m.p) + '</span>' + esc(p[L()]) + ' · ' + esc(t('d.inbox.k.' + m.k)) + '</span><strong dir="ltr">' + esc(m.who) + '</strong></div>';
      var body = '<p class="dm-bubble them inbox-msg">' + esc(m.msg[L()]) + '</p>';
      var actions, reply;
      if (m.state === 'pending') {
        reply = '<div class="ib-reply"><span class="ib-label">' + esc(t('d.inbox.suggested')) + (m.sensitive ? ' · <span class="status-bad">' + esc(t('d.inbox.sensitive')) + '</span>' : '') + '</span><p class="dm-bubble me">' + esc(m.reply[L()]) + '</p></div>';
        actions = '<button class="btn btn-primary btn-sm" type="button" data-action="inbox-send" data-id="' + m.id + '">' + esc(t('d.inbox.send')) + '</button>' +
          '<button class="btn btn-ghost btn-sm" type="button" data-action="inbox-edit" data-id="' + m.id + '">' + esc(t('d.inbox.edit')) + '</button>' +
          '<button class="btn btn-ghost btn-sm" type="button" data-action="inbox-escalate" data-id="' + m.id + '">' + esc(t('d.inbox.escalate')) + '</button>';
      } else {
        var sent = m.state === 'sent';
        reply = sent ? '<div class="ib-reply"><p class="dm-bubble me">' + esc(m.edited ? m.edited : m.reply[L()]) + '</p></div>' : '';
        actions = '<span class="appr-state status-' + (sent ? 'ok' : 'warn') + '"><span class="dot ' + (sent ? 'ok' : 'warn') + '"></span>' + esc(t(sent ? 'd.inbox.sent' : 'd.inbox.escalated')) + '</span>' +
          '<button class="link-btn" type="button" data-action="inbox-undo" data-id="' + m.id + '">' + esc(t('d.inbox.undo')) + '</button>';
      }
      return '<li><article class="gcard inbox-item' + (m.state !== 'pending' ? ' is-done' : '') + '" id="inbox-' + m.id + '">' + head + body + reply + '<div class="appr-actions">' + actions + '</div></article></li>';
    }).join('');
  }

  function renderAds() {
    var ts = 0, tb = 0;
    $('ads-list').innerHTML = S.ads.map(function (a) {
      ts += a.spend; tb += a.budget;
      var ap = AD_PLATFORMS[a.p];
      var stc = a.state === 'active' ? 'ok' : a.state === 'learning' ? 'warn' : 'off';
      var pct = Math.min(100, a.spend / a.budget * 100);
      return '<li><article class="gcard ad-item" id="ad-' + a.id + '">' +
        '<div class="ad-top"><span class="chip chip-static">' + '<span class="pmark" style="color:' + ap.color + '">' + D.pglyph(a.p) + '</span>' + esc(ap[L()]) + '</span>' +
        '<span class="status-tag ' + stc + '">' + esc(t('d.ads.st.' + a.state)) + '</span></div>' +
        '<h4>' + esc(a.name[L()]) + '</h4>' +
        '<div class="fuel" role="img" aria-label="' + esc(t('d.ads.spend', { s: money(a.spend), b: money(a.budget) })) + '"><span style="width:' + pct.toFixed(0) + '%"></span><i style="inset-inline-start:25%"></i><i style="inset-inline-start:50%"></i><i style="inset-inline-start:75%"></i></div>' +
        '<div class="ad-nums"><span class="mono">' + esc(t('d.ads.spend', { s: money(a.spend), b: money(a.budget) })) + '</span><span>' + esc(a.results[L()]) + '</span></div>' +
        '<div class="appr-actions"><button class="btn btn-ghost btn-sm" type="button" data-action="ad-toggle" data-id="' + a.id + '">' + esc(t(a.state === 'paused' ? 'd.ads.resume' : 'd.ads.pause')) + '</button>' +
        '<button class="link-btn" type="button" data-action="ad-details" data-id="' + a.id + '">' + esc(t('d.ads.details')) + '</button></div>' +
        '</article></li>';
    }).join('');
    $('ads-total').textContent = t('d.ads.total', { s: money(ts), b: money(tb) });
  }

  function renderFilters() {
    var opts = [{ id: 'all', label: t('d.cal.all') }].concat(Z.PLATFORMS.map(function (p) { return { id: p.id, label: p[L()], color: p.color }; }));
    $('cal-filters').innerHTML = opts.map(function (o) {
      return '<button class="chip" type="button" data-action="filter" data-platform="' + o.id + '" aria-pressed="' + (S.filter === o.id) + '">' +
        (o.color ? '<span class="pmark" style="color:' + o.color + '">' + D.pglyph(o.id) + '</span>' : '') + esc(o.label) + '</button>';
    }).join('');
  }

  var TRACKS = [['reel', 'V1'], ['story', 'V2'], ['post', 'P1'], ['carousel', 'P2']];
  function renderCalendar() {
    var f = new Intl.DateTimeFormat(loc(), { day: 'numeric', month: 'short' });
    $('cal-label').textContent = t(S.week === 0 ? 'd.cal.w0' : 'd.cal.w1') + ' · ' + f.format(weekDate(S.week, 0)) + ' – ' + f.format(weekDate(S.week, 6));
    $('cal-prev').setAttribute('aria-pressed', S.week === 0 ? 'true' : 'false');
    $('cal-next').setAttribute('aria-pressed', S.week === 1 ? 'true' : 'false');
    var items = S.cal.map(calItem).filter(function (c) { return c.w === S.week && (S.filter === 'all' || c.p === S.filter); });
    var now = new Date(), days = [];
    for (var d = 0; d < 7; d++) days.push({ name: t('d.day.' + d), num: String(weekDate(S.week, d).getDate()), today: S.week === 0 && d === now.getDay() });
    var byKind = {};
    items.forEach(function (c) {
      var p = plat(c.p), hm = c.time.split(':');
      (byKind[c.type] = byKind[c.type] || []).push({ id: c.id, day: c.d, mins: +hm[0] * 60 + +hm[1], time: c.time.length < 5 ? '0' + c.time : c.time, title: c.title[L()], kind: p[L()], pg: c.p, color: p.color, dot: STATUS_DOT[c.s], status: t('d.s.' + c.s), wave: c.type === 'reel' || c.type === 'story' });
    });
    var tracks = TRACKS.filter(function (k) { return byKind[k[0]]; }).map(function (k) { return { code: k[1], label: t('d.type.' + k[0]), clips: byKind[k[0]] }; });
    if (!tracks.length) tracks = [{ code: '—', label: t('d.cal.empty'), clips: [] }];
    var pos = S.week === 0 ? (now.getDay() + (now.getHours() * 60 + now.getMinutes()) / 1440) / 7 : null;
    $('cal').innerHTML = D.timeline({ days: days, tracks: tracks, now: pos, nowLabel: t('dv.now') + ' ' + new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(now) });
    $('cal-legend').innerHTML = ['approval', 'changes', 'scheduled', 'published'].map(function (s) { return '<span><span class="dot ' + STATUS_DOT[s] + '"></span>' + esc(t('d.s.' + s)) + '</span>'; }).join('');
    if (D.current() === 'calendar') D.revealNow($('cal'));
  }

  function media(a, sfx) {
    return D.art({ a: a.art[0], b: a.art[1], title: a.title[L()], kind: a.type, seed: a.id, sfx: sfx, full: a.type === 'reel', mark: 'Qahwa House · ' + t('d.type.' + a.type) });
  }
  function phoneOf(a, sfx) {
    return D.phone({ kind: a.type, platform: a.platforms[0], platformName: plat(a.platforms[0])[L()], handle: HANDLE, avatar: QLOGO, media: media(a, sfx), caption: a.caption[L()], when: t('d.appr.when', { w: a.when[L()] }), slides: 5 });
  }
  function chips(a) { return a.platforms.map(function (p) { return '<span class="chip chip-static">' + '<span class="pmark" style="color:' + plat(p).color + '">' + D.pglyph(p) + '</span>' + esc(plat(p)[L()]) + '</span>'; }).join(''); }
  var rowUpd = D.rowNav($('appr-list'), $('row-prev'), $('row-next'), $('row-count'));
  function renderApprovals() {
    var pend = S.approvals.filter(function (a) { return a.state === 'pending'; });
    var done = S.approvals.filter(function (a) { return a.state !== 'pending'; });
    $('appr-list').innerHTML = pend.length ? pend.map(function (a) {
      var title = a.title[L()];
      return '<li class="appr-slot"><article class="appr phone-card" id="appr-' + a.id + '" data-id="' + a.id + '" data-pending="1" aria-label="' + esc(title) + '">' + phoneOf(a) +
        '<div class="pc-meta"><h3>' + esc(title) + '</h3><p>' + chips(a) + '</p><p><span class="mono">' + esc(a.when[L()]) + '</span> · <span>' + esc(t('d.src.' + a.src)) + '</span></p></div>' +
        '<div class="pc-actions"><button class="tactile yes" type="button" data-action="approve" data-id="' + a.id + '">' + D.icon('check') + '<span>' + esc(t('d.appr.approve')) + '</span><span class="sr-only"> — ' + esc(title) + '</span></button>' +
        '<button class="tactile no" type="button" data-action="changes" data-id="' + a.id + '">' + D.icon('pencil') + '<span>' + esc(t('d.appr.changes')) + '</span><span class="sr-only"> — ' + esc(title) + '</span></button></div>' +
        '<button class="link-btn pc-more" type="button" data-action="preview" data-id="' + a.id + '">' + esc(t('d.appr.preview')) + '<span class="sr-only"> — ' + esc(title) + '</span></button></article></li>';
    }).join('') : '<li class="appr-empty">' + D.icon('check') + '<span>' + esc(t('d.appr.empty')) + '</span></li>';
    $('appr-done').innerHTML = done.map(function (a) {
      var ok = a.state === 'approved';
      return '<li><article class="appr row-card is-done" id="appr-' + a.id + '"><div class="rc-thumb">' + D.art({ a: a.art[0], b: a.art[1], kind: a.type, seed: a.id, sfx: '-t' }) + '</div>' +
        '<div class="rc-body"><h3>' + esc(a.title[L()]) + '</h3><div class="rc-line">' + chips(a) + '</div>' +
        (a.note ? '<p class="appr-note">' + esc(a.note) + '</p>' : '') +
        '<div class="appr-actions"><span class="appr-state status-' + (ok ? 'ok' : 'warn') + '"><span class="dot ' + (ok ? 'ok' : 'warn') + '"></span>' + esc(t(ok ? 'd.appr.approved' : 'd.appr.changed')) + '</span>' +
        '<button class="link-btn" type="button" data-action="undo" data-id="' + a.id + '">' + esc(t('d.appr.undo')) + '</button></div></div></article></li>';
    }).join('');
    $('done-wrap').hidden = !done.length;
    $('stack-ghosts').setAttribute('data-n', Math.min(pend.length, 3));
    $('stack-ghosts').hidden = pend.length < 2;
    $('stack-hint').hidden = !pend.length;
    $('stack-count').textContent = pend.length ? t('d.stack.left', { n: pend.length }) : '';
    if (rowUpd) rowUpd();
  }

  function renderNotifs() {
    var unread = S.notifs.filter(function (n) { return !n.read; }).length;
    var badge = $('bell-count');
    badge.textContent = unread;
    badge.hidden = unread === 0;
    $('bell').setAttribute('aria-label', t('d.notif.title') + (unread ? ' (' + unread + ')' : ''));
    $('notif-list').innerHTML = S.notifs.length ? S.notifs.map(function (n) {
      var text = n.text ? n.text[L()] : t(n.key);
      var time = n.tkey ? t(n.tkey) : t('d.n.now');
      return '<li><button class="notif-item ' + (n.read ? 'read' : 'unread') + '" type="button" data-action="notif-open" data-id="' + n.id + '">' +
        '<span class="nb-icon"><img src="assets/brand/zkjsystem-icon-primary.svg" alt="" width="20" height="23"></span><span class="nb-body">' +
        '<span class="nb-top"><span class="app">ZKJ SYSTEM</span><span>' + esc(time) + '</span></span>' +
        '<p class="nb-title">' + (n.read ? '' : '<span class="nb-unread" aria-hidden="true"></span>') + '<span class="dot ' + n.kind + '" aria-hidden="true" style="margin-inline-end:6px"></span>' + esc(text) + '</p></span></button></li>';
    }).join('') : '<li class="nb-empty">' + esc(t('d.notif.empty')) + '</li>';
  }

  function barsHtml() {
    var max = BARS[0][1];
    return BARS.map(function (b) {
      var p = plat(b[0]);
      return '<li class="bar-row"><span>' + esc(p[L()]) + '</span><span class="bar-track"><span class="bar-fill" style="width:' + (b[1] / max * 100).toFixed(1) + '%;--pc:' + p.color + '"></span></span><span class="v">' + b[1].toFixed(1) + 'K</span></li>';
    }).join('');
  }
  function renderBars() { $('bars').innerHTML = barsHtml(); $('bars-mini').innerHTML = barsHtml(); }

  function renderFiles() {
    $('thumbs').innerHTML = S.files.map(function (f, i) {
      var m = f.kind === 'video'
        ? '<video src="' + f.url + '" muted playsinline preload="metadata"></video>'
        : '<img src="' + f.url + '" alt="' + esc(f.name) + '">';
      return '<li>' + m + '<span class="kind">' + esc(t(f.kind === 'video' ? 'd.up.video' : 'd.up.photo')) + '</span>' +
        '<button class="rm" type="button" data-action="upload-remove" data-idx="' + i + '" aria-label="' + esc(t('d.up.remove', { name: f.name })) + '">×</button></li>';
    }).join('');
    $('up-count').textContent = S.files.length ? t('d.up.count', { n: S.files.length }) : '';
  }

  /* ---------- CORE (assets/core.js): Qahwa House's living universe, with a pipeline that keeps moving ---------- */
  var QLOGO_URL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(QLOGO);
  var FLOW = ['draft', 'needs_approval', 'approved', 'scheduled', 'published'];
  var FAKE_TITLES = [
    { en: 'Cardamom cold brew', ar: 'كولد برو بالهيل' }, { en: 'Barista hands, slow', ar: 'يدا الباريستا ببطء' }, { en: 'Sunset on the terrace', ar: 'الغروب على التراس' },
    { en: 'New beans: Yirgacheffe', ar: 'بن جديد: يرغاتشيفي' }, { en: 'Friday brunch board', ar: 'لوح برانش الجمعة' }, { en: 'Rose latte, 10 seconds', ar: 'لاتيه الورد في 10 ثوانٍ' }
  ];
  var FAKE_PLAT = ['instagram', 'tiktok', 'instagram', 'youtube', 'facebook', 'instagram'];
  var FAKE_KIND = ['reel', 'reel', 'post', 'carousel', 'post', 'story'];
  var fake = [], fakeSeq = 0, fakeWins = 0, coreCtl = null, coreKey = null, coreMounted = false, coreTimer = null;
  function spawnFake(stage) { var i = fakeSeq++ % FAKE_TITLES.length; fake.push({ id: 'f' + fakeSeq, t: FAKE_TITLES[i], p: FAKE_PLAT[i], k: FAKE_KIND[i], s: stage || 'draft' }); }
  ['draft', 'draft', 'scheduled', 'approved'].forEach(spawnFake);
  function stepFake() {
    if (!fake.length) spawnFake();
    var x = fake[Math.floor(Math.random() * fake.length)], i = FLOW.indexOf(x.s);
    if (i >= FLOW.length - 1) return;
    x.s = FLOW[i + 1];
    if (x.s === 'published') { setTimeout(function () { fake = fake.filter(function (y) { return y !== x; }); fakeWins++; spawnFake(); renderCore(); }, 2600); }
    renderCore();
  }
  function coreData() {
    var items = [];
    S.approvals.forEach(function (a) {
      var st = a.state === 'pending' ? 'needs_approval' : a.state === 'approved' ? 'approved' : 'changes_requested';
      items.push({ id: a.id, title: a.title[L()], kind: a.type, status: st, platform: a.platforms[0], when: a.when[L()] });
    });
    S.cal.forEach(function (c) { if (c.a) return; items.push({ id: c.id, title: c.title[L()], kind: c.type, status: c.s, platform: c.p, when: t('d.day.' + c.d) + ' ' + c.time }); });
    fake.forEach(function (f) { items.push({ id: f.id, title: f.t[L()], kind: f.k, status: f.s, platform: f.p, when: '' }); });
    S.inbox.forEach(function (m) { if (m.state === 'pending') items.push({ id: m.id, title: m.who, kind: 'reply', status: 'needs_approval', platform: m.p === 'whatsapp' ? 'whatsapp' : m.p, when: '' }); });
    var pub = items.filter(function (x) { return x.status === 'published'; });
    for (var w = 0; w < fakeWins; w++) pub.push({ id: 'win' + w, title: '', status: 'published' });
    return { name: t('d.client'), logo: QLOGO_URL, primary: '#C8853B', accent: '#E9B872', covers: [], features: ['inbox', 'ads', 'whatsapp'],
      channels: ['instagram', 'tiktok', 'snapchat', 'facebook', 'youtube', 'x', 'threads', 'linkedin', 'pinterest', 'google', 'whatsapp'], items: items, published: pub, wins: pub.length, kpi: { v: 48200, t: 60000 } };
  }
  function renderCore() {
    var host = $('core-stage'); if (!host || !window.ZCORE) return;
    var key = 'demo:' + L();
    if (coreKey !== key) {
      if (coreCtl) coreCtl.destroy();
      coreCtl = window.ZCORE.create(host, {
        mode: 'client', platformName: function (id) { return plat(id)[L()]; },
        onItem: function (x) {
          if (appr(x.id)) actions.preview({ getAttribute: function () { return x.id; } });
          else if (/^c\d/.test(x.id)) actions['cal-item']({ getAttribute: function () { return x.id; } });
          else if (/^i\d/.test(x.id)) { D.show('inbox', { focus: true }); }
        }
      });
      coreKey = key; coreMounted = false;
    }
    coreCtl.update(coreData());
    var on = D.current() === 'core';
    if (on && !coreMounted) { coreCtl.mount(); coreMounted = true; }
    if (!on && coreMounted) { coreCtl.unmount(); coreMounted = false; }
    clearInterval(coreTimer);
    if (on && !D.reduce) coreTimer = setInterval(function () { if (!document.hidden) stepFake(); }, 3200);
    window.__zkjCore = coreCtl;
  }

  function renderAll() {
    renderTheme(); renderKpis(); renderTools(); renderFilters(); renderCalendar(); renderApprovals(); renderNotifs(); renderBars(); renderFiles(); renderInbox(); renderAds();
  }

  /* ---------- Modal ---------- */
  var modal = $('modal');
  var modalState = null;
  function openModal(o) {
    modalState = o;
    $('modal-title').textContent = o.title;
    $('modal-body').innerHTML = o.body;
    $('modal-actions').innerHTML = (o.actions || []).map(function (a) {
      if (a.href) return '<a class="btn ' + (a.cls || 'btn-ghost') + ' btn-sm" href="' + esc(a.href) + '"' + (a.ext ? ' target="_blank" rel="noopener"' : '') + '>' + esc(a.label) + '</a>';
      return '<button class="btn ' + (a.cls || 'btn-ghost') + ' btn-sm" type="button" data-action="' + a.action + '"' + (a.id ? ' data-id="' + a.id + '"' : '') + (a.target ? ' data-target="' + a.target + '"' : '') + '>' + esc(a.label) + '</button>';
    }).join('');
    if (!modal.open) {
      if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
    }
    var first = modal.querySelector('textarea, .modal-actions .btn');
    if (first) first.focus();
  }
  function closeModal() { modalState = null; if (modal.open) { if (typeof modal.close === 'function') modal.close(); else modal.removeAttribute('open'); } }
  var keepFlown = false;
  modal.addEventListener('close', function () {
    modalState = null;
    if (!keepFlown && document.querySelector('#appr-list .is-flown-left')) renderApprovals();
  });
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

  // section ids → device views (dock / tab bar)
  var VIEW_OF = { approvals: 'approvals', calendar: 'calendar', inbox: 'inbox', ads: 'ads', insights: 'insights', upload: 'insights', tools: 'tools', today: 'today' };
  function goTo(id) {
    D.show(VIEW_OF[id] || 'today', { focus: true });
    if (id === 'upload') { var u = $('upload'); if (u) u.scrollIntoView({ block: 'start' }); }
  }

  function addNotif(kind, text, target) {
    S.notifs.unshift({ id: 'n' + (++notifSeq), kind: kind, text: text, target: target, read: false });
    renderNotifs();
  }

  function enquireModal(ctx) {
    openModal({
      title: t('d.enq.title'),
      body: '<p>' + esc(t('d.enq.body')) + '</p>',
      actions: [
        { href: Z.waLink(ctx || null), ext: true, label: t('d.enq.wa'), cls: 'btn-wa' },
        { href: 'index.html' + (ctx && ctx.type === 'tool' ? '?tool=' + ctx.id : '') + '#enquire', label: t('d.enq.form'), cls: 'btn-primary' },
        { href: Z.IG_URL, ext: true, label: t('d.enq.ig') }
      ]
    });
  }

  /* ---------- Actions ---------- */
  function tIn(lang, key, vars) { return Z.tLang(lang, key, vars); }
  function approveOne(a, silent) {
    a.state = 'approved';
    if (!silent) {
      Z.toast(t('d.appr.toast.ok', { title: a.title[L()], w: a.when[L()] }), 'ok');
      addNotif('ok', { en: tIn('en', 'd.n.appr', { title: a.title.en, w: a.when.en }), ar: tIn('ar', 'd.n.appr', { title: a.title.ar, w: a.when.ar }) }, 'calendar');
    }
  }

  var actions = {
    theme: function () {
      var d = $('dash');
      var next = d.getAttribute('data-theme') === 'brand' ? 'core' : 'brand';
      d.setAttribute('data-theme', next);
      Z.store(THEME_KEY, next);
      renderTheme();
      Z.toast(t(next === 'brand' ? 'd.theme.toast.brand' : 'd.theme.toast.core'));
    },
    'notif-toggle': function (el, e) {
      var panel = $('notif-panel');
      var open = panel.hidden;
      panel.hidden = !open;
      $('bell').setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { var f = panel.querySelector('button'); if (f) f.focus(); }
      if (e) e.stopPropagation();
    },
    'notif-read-all': function () {
      S.notifs.forEach(function (n) { n.read = true; });
      renderNotifs();
      Z.toast(t('d.notif.done'), 'ok');
    },
    'notif-open': function (el) {
      var id = el.getAttribute('data-id');
      var n = S.notifs.filter(function (x) { return x.id === id; })[0];
      if (!n) return;
      n.read = true;
      renderNotifs();
      closeNotif();
      goTo(n.target);
    },
    enquire: function () { enquireModal(null); },
    reset: function () {
      S.files.forEach(function (f) { try { URL.revokeObjectURL(f.url); } catch (e) { /* noop */ } });
      S = seed();
      renderAll();
      Z.toast(t('d.reset.toast'));
    },
    go: function (el) { goTo(el.getAttribute('data-target')); },
    'tool-detail': function (el) {
      var id = el.getAttribute('data-id');
      var tl = tool(id), st = toolState(id);
      var acts = [];
      if (st.go === 'approvals') acts.push({ action: 'modal-go', target: 'approvals', label: t('d.tool.go.appr'), cls: 'btn-primary' });
      if (st.go === 'upload') acts.push({ action: 'modal-go', target: 'upload', label: t('d.tool.go.up'), cls: 'btn-primary' });
      if (st.go === 'insights') acts.push({ action: 'modal-go', target: 'insights', label: t('d.tool.go.ins'), cls: 'btn-primary' });
      if (st.go === 'inbox') acts.push({ action: 'modal-go', target: 'inbox', label: t('d.tool.go.inbox'), cls: 'btn-primary' });
      if (st.go === 'ads') acts.push({ action: 'modal-go', target: 'ads', label: t('d.tool.go.ads'), cls: 'btn-primary' });
      if (st.go === 'calendar') acts.push({ action: 'modal-go', target: 'calendar', label: t('d.tool.go.cal'), cls: 'btn-primary' });
      if (st.s === 'off') {
        acts.push({ href: 'index.html?tool=' + id + '#enquire', label: t('d.tool.enq'), cls: 'btn-primary' });
        acts.push({ href: Z.waLink({ type: 'tool', id: id }), ext: true, label: t('d.tool.ask'), cls: 'btn-wa' });
      } else if (!st.go) {
        acts.push({ href: Z.waLink({ type: 'tool', id: id }), ext: true, label: t('d.tool.ask'), cls: 'btn-wa' });
      }
      acts.push({ action: 'modal-close', label: t('d.close') });
      openModal({
        title: tl[L()].name,
        body: '<p>' + esc(tl[L()].tag) + '</p>' +
          '<dl class="kv"><dt>' + esc(t('d.tool.status')) + '</dt><dd><span class="status-label status-' + st.s + '" style="font-weight:700"><span class="dot ' + st.s + '"></span> ' + esc(t('d.st.' + st.s)) + '</span></dd>' +
          '<dt>' + esc(t('d.tool.pending')) + '</dt><dd>' + esc(st.p) + '</dd><dt>' + esc(t('d.tool.done')) + '</dt><dd>' + esc(st.d) + '</dd></dl>',
        actions: acts
      });
    },
    'modal-go': function (el) { var tg = el.getAttribute('data-target'); closeModal(); goTo(tg); },
    'modal-close': function () { closeModal(); },
    'cal-prev': function () { S.week = 0; renderCalendar(); },
    'cal-next': function () { S.week = 1; renderCalendar(); },
    filter: function (el) {
      S.filter = el.getAttribute('data-platform');
      renderFilters(); renderCalendar();
      var b = document.querySelector('#cal-filters [data-platform="' + S.filter + '"]'); if (b) b.focus();
    },
    'cal-item': function (el) {
      var raw = S.cal.filter(function (c) { return c.id === el.getAttribute('data-id'); })[0];
      if (!raw) return;
      var c = calItem(raw), p = plat(c.p);
      var acts = [];
      if (c.s === 'approval') {
        acts.push({ action: 'approve', id: c.a, label: t('d.appr.approve'), cls: 'btn-approve' });
        acts.push({ action: 'changes', id: c.a, label: t('d.appr.changes') });
      } else if (c.a) {
        acts.push({ action: 'modal-go', target: 'approvals', label: t('d.tool.go.appr') });
      }
      acts.push({ action: 'modal-close', label: t('d.close') });
      openModal({
        title: c.title[L()],
        body: '<dl class="kv"><dt>' + esc(t('d.item.platform')) + '</dt><dd>' + esc(p[L()]) + '</dd>' +
          '<dt>' + esc(t('d.item.type')) + '</dt><dd>' + esc(t('d.type.' + c.type)) + '</dd>' +
          '<dt>' + esc(t('d.item.when')) + '</dt><dd>' + esc(t(c.w === 0 ? 'd.cal.w0' : 'd.cal.w1')) + ' · ' + esc(t('d.day.' + c.d)) + ' · <span dir="ltr">' + esc(fmtTime(c.time)) + '</span></dd>' +
          '<dt>' + esc(t('d.item.status')) + '</dt><dd><span class="status-' + STATUS_DOT[c.s] + '" style="font-weight:700">' + esc(t('d.s.' + c.s)) + '</span></dd>' +
          '<dt>' + esc(t('d.item.src')) + '</dt><dd>' + esc(t('d.src.' + c.src)) + '</dd></dl>',
        actions: acts
      });
    },
    approve: function (el) {
      var a = appr(el.getAttribute('data-id'));
      if (!a || a.state !== 'pending') { closeModal(); return; }
      closeModal();
      approveAnimated(a, false);
    },
    'approve-all': function () {
      var pend = S.approvals.filter(function (a) { return a.state === 'pending'; });
      if (!pend.length) { Z.toast(t('d.appr.toast.none'), 'warn'); return; }
      pend.forEach(function (a) { approveOne(a, true); });
      Z.toast(t('d.appr.toast.all', { n: pend.length }), 'ok');
      refreshAfterApproval();
    },
    changes: function (el) {
      var a = appr(el.getAttribute('data-id'));
      if (!a) return;
      openChanges(a);
    },
    'changes-open': function (el) {
      var a = appr(el.getAttribute('data-id'));
      if (!a) return;
      openModal({
        title: t('d.ch.title'),
        body: '<label for="ch-note"><strong>' + esc(t('d.ch.label', { title: a.title[L()] })) + '</strong></label>' +
          '<textarea id="ch-note" placeholder="' + esc(t('d.ch.ph')) + '"></textarea>' +
          '<div class="toolbar"><span style="font-size:13px;color:var(--muted)">' + esc(t('d.ch.quick')) + '</span>' +
          ['d.ch.q1', 'd.ch.q2', 'd.ch.q3'].map(function (k) { return '<button class="chip" type="button" data-action="quick-pick" data-text="' + esc(t(k)) + '">' + esc(t(k)) + '</button>'; }).join('') +
          '</div><p class="err" id="ch-err" style="color:var(--bad);font-size:13px"></p>',
        actions: [
          { action: 'changes-send', id: a.id, label: t('d.ch.send'), cls: 'btn-primary' },
          { action: 'modal-close', label: t('d.close') }
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
      var a = appr(el.getAttribute('data-id'));
      var ta = $('ch-note');
      if (!a) return;
      if (ta && !ta.value.trim()) { $('ch-err').textContent = t('d.ch.need'); ta.focus(); return; }
      a.state = 'changes';
      a.note = ta ? ta.value.trim() : '';
      keepFlown = true; closeModal(); keepFlown = false;
      Z.toast(t('d.appr.toast.changes', { title: a.title[L()] }), 'warn');
      addNotif('warn', { en: tIn('en', 'd.n.changes', { title: a.title.en }), ar: tIn('ar', 'd.n.changes', { title: a.title.ar }) }, 'approvals');
      refreshAfterApproval();
    },
    undo: function (el) {
      var a = appr(el.getAttribute('data-id'));
      if (!a) return;
      a.state = 'pending';
      Z.toast(t('d.appr.toast.undo', { title: a.title[L()] }));
      refreshAfterApproval();
    },
    preview: function (el) {
      var a = appr(el.getAttribute('data-id'));
      if (!a) return;
      var acts = a.state === 'pending' ? [
        { action: 'approve', id: a.id, label: t('d.appr.approve'), cls: 'btn-primary' },
        { action: 'changes', id: a.id, label: t('d.appr.changes') }
      ] : [];
      acts.push({ action: 'modal-close', label: t('d.close') });
      openModal({
        title: a.title[L()],
        body: '<div class="modal-preview">' + phoneOf(a, '-m') + '</div>' +
          '<p style="color:var(--muted);font-size:14px;text-align:center">' + esc(t('d.appr.when', { w: a.when[L()] })) + ' · ' + esc(t('d.src.' + a.src)) + '</p>',
        actions: acts
      });
    },
    report: function () {
      openModal({
        title: t('d.rep.title'),
        body: '<p>' + esc(t('d.rep.body')) + '</p>',
        actions: [
          { action: 'modal-go', target: 'calendar', label: t('d.rep.cta'), cls: 'btn-primary' },
          { action: 'modal-close', label: t('d.close') }
        ]
      });
    },
    'inbox-send': function (el) {
      var m = inboxItem(el.getAttribute('data-id'));
      if (!m || m.state !== 'pending') return;
      m.state = 'sent';
      Z.toast(t('d.inbox.toast.sent', { p: plat(m.p)[L()] }), 'ok');
      addNotif('ok', { en: tIn('en', 'd.n.inbox', { who: m.who }), ar: tIn('ar', 'd.n.inbox', { who: m.who }) }, 'inbox');
      refreshInbox();
    },
    'inbox-edit': function (el) {
      var m = inboxItem(el.getAttribute('data-id'));
      if (!m) return;
      openModal({
        title: t('d.inbox.edit.title'),
        body: '<p class="inbox-msg" style="margin:0">' + esc(m.msg[L()]) + '</p><label for="ib-note"><strong>' + esc(t('d.inbox.edit.label', { who: m.who })) + '</strong></label>' +
          '<textarea id="ib-note">' + esc(m.edited || m.reply[L()]) + '</textarea><p class="err" id="ib-err" style="color:var(--bad);font-size:13px"></p>',
        actions: [
          { action: 'inbox-edit-send', id: m.id, label: t('d.inbox.edit.send'), cls: 'btn-primary' },
          { action: 'modal-close', label: t('d.close') }
        ]
      });
    },
    'inbox-edit-send': function (el) {
      var m = inboxItem(el.getAttribute('data-id'));
      var ta = $('ib-note');
      if (!m || !ta) return;
      if (!ta.value.trim()) { $('ib-err').textContent = t('d.inbox.edit.need'); ta.focus(); return; }
      m.edited = ta.value.trim();
      m.state = 'sent';
      closeModal();
      Z.toast(t('d.inbox.toast.sent', { p: plat(m.p)[L()] }), 'ok');
      addNotif('ok', { en: tIn('en', 'd.n.inbox', { who: m.who }), ar: tIn('ar', 'd.n.inbox', { who: m.who }) }, 'inbox');
      refreshInbox();
    },
    'inbox-escalate': function (el) {
      var m = inboxItem(el.getAttribute('data-id'));
      if (!m || m.state !== 'pending') return;
      m.state = 'escalated';
      Z.toast(t('d.inbox.toast.esc', { who: m.who }), 'warn');
      addNotif('warn', { en: tIn('en', 'd.n.esc', { who: m.who }), ar: tIn('ar', 'd.n.esc', { who: m.who }) }, 'inbox');
      refreshInbox();
    },
    'inbox-undo': function (el) {
      var m = inboxItem(el.getAttribute('data-id'));
      if (!m) return;
      m.state = 'pending'; m.edited = null;
      Z.toast(t('d.inbox.toast.undo'));
      refreshInbox();
    },
    'ad-toggle': function (el) {
      var a = adItem(el.getAttribute('data-id'));
      if (!a) return;
      if (modal.open) closeModal();
      if (a.state === 'paused') { a.state = a.prev || 'active'; Z.toast(t('d.ads.toast.resume', { name: a.name[L()] }), 'ok'); }
      else { a.prev = a.state; a.state = 'paused'; Z.toast(t('d.ads.toast.pause', { name: a.name[L()] }), 'warn'); }
      renderAds();
      var b = document.querySelector('#ad-' + a.id + ' [data-action="ad-toggle"]'); if (b) b.focus();
    },
    'ad-details': function (el) {
      var a = adItem(el.getAttribute('data-id'));
      if (!a) return;
      var ap = AD_PLATFORMS[a.p];
      openModal({
        title: a.name[L()],
        body: '<dl class="kv"><dt>' + esc(t('d.ads.k.platform')) + '</dt><dd>' + esc(ap[L()]) + '</dd>' +
          '<dt>' + esc(t('d.ads.k.status')) + '</dt><dd>' + esc(t('d.ads.st.' + a.state)) + '</dd>' +
          '<dt>' + esc(t('d.ads.k.budget')) + '</dt><dd>' + esc(t('d.ads.spend', { s: money(a.spend), b: money(a.budget) })) + '</dd>' +
          '<dt>' + esc(t('d.ads.k.results')) + '</dt><dd>' + esc(a.results[L()]) + '</dd></dl>' +
          '<p style="color:var(--muted);font-size:14px">' + esc(t('d.ads.demo')) + ' · ' + esc(t('d.ads.note')) + '</p>',
        actions: [
          { action: 'ad-toggle', id: a.id, label: t(a.state === 'paused' ? 'd.ads.resume' : 'd.ads.pause') },
          { action: 'modal-close', label: t('d.close'), cls: 'btn-primary' }
        ]
      });
    },
    'upload-send': function () {
      if (!S.files.length) { Z.toast(t('d.up.none'), 'warn'); $('file-input').focus(); return; }
      var n = S.files.length;
      Z.toast(t('d.up.sent', { n: n }), 'ok');
      addNotif('ok', { en: tIn('en', 'd.n.up', { n: n }), ar: tIn('ar', 'd.n.up', { n: n }) }, 'upload');
    },
    'upload-clear': function () {
      if (!S.files.length) { Z.toast(t('d.up.none'), 'warn'); return; }
      S.files.forEach(function (f) { try { URL.revokeObjectURL(f.url); } catch (e) { /* noop */ } });
      S.files = [];
      renderFiles();
      Z.toast(t('d.up.cleared'));
    },
    'upload-remove': function (el) {
      var i = +el.getAttribute('data-idx');
      var f = S.files[i];
      if (!f) return;
      try { URL.revokeObjectURL(f.url); } catch (e) { /* noop */ }
      S.files.splice(i, 1);
      renderFiles();
    }
  };

  function inboxItem(id) { return S.inbox.filter(function (m) { return m.id === id; })[0]; }
  function adItem(id) { return S.ads.filter(function (a) { return a.id === id; })[0]; }
  function refreshInbox() { renderInbox(); renderTools(); renderKpis(); renderCore(); }
  function refreshAfterApproval() { renderKpis(); renderTools(); renderCalendar(); renderApprovals(); renderCore(); }
  // approve with the device animation: the phone lifts away (desktop) or flies off the stack (mobile)
  var busy = {};
  function approveAnimated(a, flown) {
    if (busy[a.id]) return;
    busy[a.id] = true;
    var card = $('appr-' + a.id);
    var isPhone = card && card.classList.contains('phone-card');
    if (isPhone && !flown) card.classList.add('is-approving');
    if (card) card.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
    D.wait(isPhone ? (flown ? 380 : 1150) : 0).then(function () {
      delete busy[a.id];
      if (a.state !== 'pending') { refreshAfterApproval(); return; }
      approveOne(a);
      refreshAfterApproval();
    });
  }
  function openChanges(a) { actions['changes-open']({ getAttribute: function () { return a.id; } }); }
  D.swipe($('appr-list'), {
    approve: function (id) { var a = appr(id); if (a && a.state === 'pending') approveAnimated(a, true); else renderApprovals(); },
    changes: function (id) { var a = appr(id); if (a && a.state === 'pending') openChanges(a); else renderApprovals(); }
  });

  function closeNotif() {
    $('notif-panel').hidden = true;
    $('bell').setAttribute('aria-expanded', 'false');
  }

  function addFiles(list) {
    var added = 0, skipped = 0;
    Array.prototype.forEach.call(list || [], function (f) {
      var kind = /^video\//.test(f.type) ? 'video' : /^image\//.test(f.type) ? 'image' : null;
      if (!kind) { skipped++; return; }
      if (S.files.length >= 24) { skipped++; return; }
      S.files.push({ name: f.name, kind: kind, url: URL.createObjectURL(f) });
      added++;
    });
    renderFiles();
    if (added) Z.toast(t('d.up.added', { n: added }), 'ok');
    if (skipped) Z.toast(t('d.up.skipped'), 'warn');
  }

  /* ---------- Wiring ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (el && actions[el.getAttribute('data-action')]) {
      e.preventDefault();
      actions[el.getAttribute('data-action')](el, e);
      return;
    }
    if (!e.target.closest('.notif')) closeNotif();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('notif-panel').hidden) { closeNotif(); $('bell').focus(); }
  });
  $('file-input').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });
  var dz = $('dropzone');
  ['dragenter', 'dragover'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('drag'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('drag'); }); });
  dz.addEventListener('drop', function (e) { if (e.dataTransfer) addFiles(e.dataTransfer.files); });

  D.buildNav({
    items: [
      { id: 'today', key: 'dv.today', icon: 'today', tone: 'gold' },
      { id: 'core', key: 'dv.core', icon: 'core', tone: 'core' },
      { id: 'approvals', key: 'dv.approvals', icon: 'approvals' },
      { id: 'calendar', key: 'dv.calendar', icon: 'calendar', tone: 'cal' },
      { id: 'inbox', key: 'dv.inbox', icon: 'inbox' },
      { id: 'ads', key: 'dv.ads', icon: 'ads' },
      { id: 'insights', key: 'dv.insights', icon: 'insights', tone: 'steel' },
      { id: 'tools', key: 'dv.tools', icon: 'tools', sep: true }
    ],
    tabs: ['today', 'core', 'approvals', 'calendar', 'more']
  });
  D.clock($('mb-clock'), 'menubar');
  // living background: mood A ("Neon lines") with the Frequency art
  var amb = $('ambient');
  D.ambient(amb, { covers: (amb.getAttribute('data-covers') || '').split(',').filter(Boolean) });
  $('demo-light').innerHTML = D.cubeLight();
  D.onView(function (id) {
    closeNotif();
    if (id === 'approvals' && rowUpd) setTimeout(rowUpd, 0);
    if (id === 'calendar') setTimeout(function () { D.revealNow($('cal')); }, 0);
    if (id === 'today') D.animateIn($('kpi-row'));
    renderCore();
  });

  var savedTheme = Z.store(THEME_KEY);
  if (savedTheme === 'core' || savedTheme === 'brand') $('dash').setAttribute('data-theme', savedTheme);

  Z.onLang(function () {
    renderAll();
    if (modalState) closeModal();
  });

  // exposed for automated checks: every data-action used on the page must exist here
  window.__zkjDashActions = Object.keys(actions);
})();
