/* ZKJ SYSTEM — client portal strings (EN / AR). Shared by app/login.html and app/index.html.
   Wording follows the public demo dashboard (assets/dashboard.js) wherever the same thing is shown. */
(function () {
  'use strict';
  window.ZKJ.extend({
    en: {
      'p.login.meta': 'Client login — ZKJ SYSTEM', 'p.app.meta': 'Your dashboard — ZKJ SYSTEM',
      'p.portal': 'Client portal', 'p.back': 'Back to site', 'p.wa': 'Message KJ on WhatsApp',
      'p.email': 'Email', 'p.password': 'Password', 'p.signin': 'Sign in', 'p.signing': 'Signing in…',
      'p.login.title': 'Sign in to your dashboard', 'p.login.sub': 'Use the email KJ invited and the password you chose.',
      'p.login.note': 'No account yet? Logins are created by KJ for clients only. Message us on WhatsApp to get started.',
      'p.forgot': 'Forgot your password?',
      'p.reset.title': 'Reset your password', 'p.reset.sub': 'Enter your email. If it belongs to a dashboard, you’ll get a link to choose a new password.',
      'p.reset.send': 'Send reset link', 'p.reset.sending': 'Sending…', 'p.reset.back': 'Back to sign in',
      'p.reset.ok': 'If that email has a dashboard, a reset link is on its way. Check your inbox (and spam).',
      'p.e.fields': 'Enter your email and password.', 'p.e.email': 'Enter a valid email address.',
      'p.e.creds': 'Wrong email or password. Try again, or use “Forgot your password?”.',
      'p.e.confirm': 'Your email isn’t confirmed yet. Open the invite email from KJ first.',
      'p.e.rate': 'Too many attempts. Wait a minute and try again.',
      'p.e.network': 'Can’t reach the server. Check your connection and try again.',
      'p.e.generic': 'Something went wrong. Please try again, or message KJ on WhatsApp.',
      'p.e.link': 'That email link has expired or was already used. Use “Forgot your password?” to get a new one.',
      'p.e.config': 'The portal isn’t configured on this page. Please message KJ.',

      'p.loading': 'Loading your dashboard…', 'p.signout': 'Sign out', 'p.signedout': 'You’ve signed out.',
      'p.sub': 'Client dashboard · ZKJ SYSTEM', 'p.admin': 'ADMIN', 'p.switch': 'Client',
      'p.hello': 'Welcome back, {name}', 'p.hello.sub': 'Here’s what’s planned — and what needs you.',
      'p.hello.admin': 'Viewing {name}', 'p.hello.admin.sub': 'You see exactly what this client sees. Your admin tools live in the Control Center.',
      'p.needs': '{n} items need you', 'p.needs1': '1 item needs you', 'p.needs0': 'All clear — nothing needs you',
      'p.pkg': 'Package: {name}',

      'p.st.noprofile.t': 'We couldn’t find your account', 'p.st.noprofile.b': 'You’re signed in, but there’s no dashboard profile for this login yet. Please message KJ so he can set it up.',
      'p.st.unlinked.t': 'Your account isn’t linked yet', 'p.st.unlinked.b': 'Your account isn’t linked yet — KJ will set it up. You’ll see your dashboard here as soon as it’s ready.',
      'p.st.noclient.t': 'Your dashboard isn’t available', 'p.st.noclient.b': 'Your brand isn’t active right now. Please message KJ.',
      'p.st.noclients.t': 'No clients yet', 'p.st.noclients.b': 'Add a client in Supabase → Table Editor → clients, then reload this page.',
      'p.st.error.t': 'We couldn’t load your dashboard', 'p.st.error.b': 'Please check your connection and try again. If it keeps happening, message KJ.',
      'p.retry': 'Try again',

      'p.pw.title': 'Choose your password', 'p.pw.sub': 'Set a password for {email}. You’ll use it to sign in next time.',
      'p.pw.new': 'New password', 'p.pw.confirm': 'Repeat password', 'p.pw.save': 'Save password',
      'p.pw.short': 'Use at least 8 characters.', 'p.pw.match': 'The two passwords don’t match.', 'p.pw.ok': 'Password saved.',

      'p.kpi.title': 'Key numbers', 'p.kpi.empty': 'No numbers yet — they appear after your first audit or report.',
      'p.kpi.asof': 'As of {d}', 'p.kpi.appr': 'Awaiting your approval', 'p.kpi.appr.bad': 'Needs you', 'p.kpi.appr.ok': 'All clear',

      'p.appr.title': 'Approvals queue', 'p.appr.sub': 'Nothing is published until you approve it.',
      'p.appr.approve': 'Approve', 'p.appr.changes': 'Request changes', 'p.appr.preview': 'Preview',
      'p.appr.when': 'Planned: {w}', 'p.appr.nowhen': 'Date to be confirmed',
      'p.appr.approved': 'Approved', 'p.appr.changed': 'Changes requested', 'p.appr.yournote': 'Your note: {note}',
      'p.appr.empty': 'Nothing waiting for you. Approved posts are on the calendar.',
      'p.appr.toast.ok': 'Approved: “{title}”. KJ has been notified.',
      'p.appr.toast.changes': 'Sent to KJ: changes requested on “{title}”.',
      'p.appr.stale': 'This item was already reviewed. The list has been refreshed.',
      'p.appr.fail': 'That didn’t go through. Please try again.',
      'p.ch.title': 'Request changes', 'p.ch.label': 'What should change in “{title}”?', 'p.ch.ph': 'e.g. Use the second clip as the opening shot and shorten the caption.',
      'p.ch.send': 'Send to KJ', 'p.ch.quick': 'Quick picks:', 'p.ch.q1': 'Shorter caption', 'p.ch.q2': 'Different music', 'p.ch.q3': 'Use another photo',
      'p.ch.need': 'Add a short note or choose a quick pick so KJ knows what to change.',

      'p.cal.title': 'Content calendar', 'p.cal.sub': 'Posts, carousels, reels and stories per platform.', 'p.cal.filter': 'Filter by platform',
      'p.cal.all': 'All', 'p.cal.prev': 'Previous week', 'p.cal.next': 'Next week', 'p.cal.today': 'This week', 'p.cal.empty': 'Nothing planned',
      'p.cal.none': 'Nothing is scheduled yet. Planned content will appear here.',
      'p.day.0': 'Sun', 'p.day.1': 'Mon', 'p.day.2': 'Tue', 'p.day.3': 'Wed', 'p.day.4': 'Thu', 'p.day.5': 'Fri', 'p.day.6': 'Sat',
      'p.type.post': 'Post', 'p.type.carousel': 'Carousel', 'p.type.reel': 'Reel', 'p.type.story': 'Story', 'p.type.reply': 'Reply', 'p.type.ad': 'Ad',
      'p.s.draft': 'Draft', 'p.s.needs_approval': 'Needs your approval', 'p.s.approved': 'Approved', 'p.s.changes_requested': 'Changes requested', 'p.s.scheduled': 'Scheduled', 'p.s.published': 'Published',
      'p.item.platform': 'Platform', 'p.item.type': 'Type', 'p.item.when': 'When', 'p.item.status': 'Status', 'p.item.note': 'Your note', 'p.item.media': 'Open media',

      'p.inbox.title': 'Inbox replies', 'p.inbox.sub': 'Suggested replies to comments and DMs, in your brand voice.', 'p.inbox.empty': 'No replies to review right now.',
      'p.ads.title': 'Ads', 'p.ads.sub': 'Campaigns waiting for you or running.', 'p.ads.empty': 'No ad campaigns yet.', 'p.ads.note': 'Ad budget is paid by you directly to each platform.',
      'p.wa.title': 'WhatsApp AI Assistant', 'p.wa.sub': 'Replies, catalogue and orders on the official WhatsApp Business Platform.', 'p.wa.body': 'KJ sets up your WhatsApp assistant and shares its results here.',
      'p.addon.title': 'Add to your package', 'p.addon.sub': 'Not in your {pkg} package yet:', 'p.addon.ask': 'Ask KJ on WhatsApp',
      'p.addon.ads': 'Ads — paid campaigns on Meta, TikTok & Snapchat', 'p.addon.wa': 'WhatsApp AI Assistant', 'p.addon.inbox': 'Inbox & Comments AI replies',

      'p.notif.title': 'Notifications', 'p.notif.readall': 'Mark all as read', 'p.notif.done': 'All notifications marked as read.', 'p.notif.empty': 'You’re all caught up.',
      'p.notif.admin': 'Client activity',

      'p.rep.title': 'Reports', 'p.rep.sub': 'Audits, strategies and monthly reports.', 'p.rep.open': 'Open', 'p.rep.soon': 'File coming soon', 'p.rep.empty': 'No reports yet. Your first report will appear here.',

      'p.adm.title': 'Control Center', 'p.adm.sub': 'Add content, numbers and messages for {name}. Clients never see this section.',
      'p.adm.item': 'Add an item', 'p.adm.kpi': 'Add a key number', 'p.adm.notif': 'Send a notification',
      'p.f.kind': 'Type', 'p.f.title': 'Title (EN)', 'p.f.title_ar': 'Title (AR)', 'p.f.caption': 'Caption (EN)', 'p.f.caption_ar': 'Caption (AR)',
      'p.f.media': 'Media URL', 'p.f.platform': 'Platform', 'p.f.when': 'Scheduled date & time', 'p.f.status': 'Status',
      'p.f.metric': 'Metric ID', 'p.f.metric.ph': 'e.g. views_30d', 'p.f.value': 'Value', 'p.f.label': 'Label (EN)', 'p.f.label_ar': 'Label (AR)', 'p.f.period': 'As of date',
      'p.f.ntitle': 'Title (EN)', 'p.f.ntitle_ar': 'Title (AR)', 'p.f.body': 'Message (EN)', 'p.f.body_ar': 'Message (AR)',
      'p.f.add': 'Add item', 'p.f.addkpi': 'Add number', 'p.f.send': 'Send notification', 'p.f.saving': 'Saving…',
      'p.f.need': 'Fill in the required fields.', 'p.f.ok.item': 'Item added for {name}.', 'p.f.ok.kpi': 'Number added for {name}.', 'p.f.ok.notif': 'Notification sent to {name}.',
      'p.f.fail': 'Couldn’t save: {msg}', 'p.close': 'Close',
      'p.foot': 'Powered by ZKJ SYSTEM · Every project becomes a tool.'
    },
    ar: {
      'p.login.meta': 'دخول العملاء — ZKJ SYSTEM', 'p.app.meta': 'لوحتك — ZKJ SYSTEM',
      'p.portal': 'بوابة العملاء', 'p.back': 'العودة للموقع', 'p.wa': 'راسل KJ على واتساب',
      'p.email': 'البريد الإلكتروني', 'p.password': 'كلمة المرور', 'p.signin': 'تسجيل الدخول', 'p.signing': 'جارٍ الدخول…',
      'p.login.title': 'ادخل إلى لوحتك', 'p.login.sub': 'استخدم البريد الذي دعاك به KJ وكلمة المرور التي اخترتها.',
      'p.login.note': 'ما عندك حساب؟ KJ ينشئ حسابات الدخول للعملاء فقط. راسلنا على واتساب لتبدأ.',
      'p.forgot': 'نسيت كلمة المرور؟',
      'p.reset.title': 'إعادة تعيين كلمة المرور', 'p.reset.sub': 'اكتب بريدك. إذا كان مرتبطًا بلوحة، بيوصلك رابط لاختيار كلمة مرور جديدة.',
      'p.reset.send': 'أرسل رابط التعيين', 'p.reset.sending': 'جارٍ الإرسال…', 'p.reset.back': 'العودة لتسجيل الدخول',
      'p.reset.ok': 'إذا كان البريد مرتبطًا بلوحة، فالرابط في الطريق. تحقّق من بريدك (والرسائل غير المرغوبة).',
      'p.e.fields': 'اكتب بريدك وكلمة المرور.', 'p.e.email': 'اكتب بريدًا إلكترونيًا صحيحًا.',
      'p.e.creds': 'البريد أو كلمة المرور غير صحيحة. حاول مرة أخرى أو استخدم «نسيت كلمة المرور؟».',
      'p.e.confirm': 'بريدك لم يتأكد بعد. افتح رسالة الدعوة من KJ أولًا.',
      'p.e.rate': 'محاولات كثيرة. انتظر دقيقة وحاول مرة أخرى.',
      'p.e.network': 'تعذّر الوصول إلى الخادم. تحقّق من اتصالك وحاول مرة أخرى.',
      'p.e.generic': 'حدث خطأ. حاول مرة أخرى، أو راسل KJ على واتساب.',
      'p.e.link': 'رابط البريد انتهت صلاحيته أو استُخدم من قبل. استخدم «نسيت كلمة المرور؟» لتحصل على رابط جديد.',
      'p.e.config': 'البوابة غير مهيأة في هذه الصفحة. راسل KJ.',

      'p.loading': 'جارٍ تحميل لوحتك…', 'p.signout': 'تسجيل الخروج', 'p.signedout': 'تم تسجيل الخروج.',
      'p.sub': 'لوحة العميل · ZKJ SYSTEM', 'p.admin': 'مدير', 'p.switch': 'العميل',
      'p.hello': 'أهلًا بعودتك، {name}', 'p.hello.sub': 'هذا المخطط له — وما الذي يحتاجك.',
      'p.hello.admin': 'تعرض لوحة {name}', 'p.hello.admin.sub': 'تشوف بالضبط ما يشوفه العميل. أدوات المدير في مركز التحكم.',
      'p.needs': '{n} عناصر تحتاجك', 'p.needs1': 'عنصر واحد يحتاجك', 'p.needs0': 'كل شيء تمام — لا شيء يحتاجك',
      'p.pkg': 'الباقة: {name}',

      'p.st.noprofile.t': 'ما لقينا حسابك', 'p.st.noprofile.b': 'أنت مسجّل الدخول، لكن ما فيه ملف لوحة لهذا الحساب بعد. راسل KJ ليجهّزه لك.',
      'p.st.unlinked.t': 'حسابك غير مربوط بعد', 'p.st.unlinked.b': 'حسابك غير مربوط بعد — KJ بيجهّزه لك. بتشوف لوحتك هنا أول ما تجهز.',
      'p.st.noclient.t': 'لوحتك غير متاحة', 'p.st.noclient.b': 'علامتك غير مفعّلة حاليًا. راسل KJ.',
      'p.st.noclients.t': 'لا يوجد عملاء بعد', 'p.st.noclients.b': 'أضف عميلًا من Supabase ← Table Editor ← clients ثم حدّث الصفحة.',
      'p.st.error.t': 'تعذّر تحميل لوحتك', 'p.st.error.b': 'تحقّق من اتصالك وحاول مرة أخرى. إذا تكرر الأمر راسل KJ.',
      'p.retry': 'حاول مرة أخرى',

      'p.pw.title': 'اختر كلمة المرور', 'p.pw.sub': 'عيّن كلمة مرور لـ {email}. بتستخدمها للدخول في المرة القادمة.',
      'p.pw.new': 'كلمة المرور الجديدة', 'p.pw.confirm': 'أعد كتابة كلمة المرور', 'p.pw.save': 'حفظ كلمة المرور',
      'p.pw.short': 'استخدم 8 أحرف على الأقل.', 'p.pw.match': 'كلمتا المرور غير متطابقتين.', 'p.pw.ok': 'تم حفظ كلمة المرور.',

      'p.kpi.title': 'الأرقام الرئيسية', 'p.kpi.empty': 'لا أرقام بعد — تظهر بعد أول تدقيق أو تقرير.',
      'p.kpi.asof': 'حتى {d}', 'p.kpi.appr': 'بانتظار موافقتك', 'p.kpi.appr.bad': 'يحتاجك', 'p.kpi.appr.ok': 'كل شيء تمام',

      'p.appr.title': 'قائمة الموافقات', 'p.appr.sub': 'لا شيء يُنشر قبل موافقتك.',
      'p.appr.approve': 'موافقة', 'p.appr.changes': 'طلب تعديل', 'p.appr.preview': 'معاينة',
      'p.appr.when': 'الموعد: {w}', 'p.appr.nowhen': 'الموعد يُحدد لاحقًا',
      'p.appr.approved': 'تمت الموافقة', 'p.appr.changed': 'طُلب تعديل', 'p.appr.yournote': 'ملاحظتك: {note}',
      'p.appr.empty': 'لا شيء بانتظارك. المنشورات المعتمدة موجودة في التقويم.',
      'p.appr.toast.ok': 'تمت الموافقة: «{title}». وصل إشعار إلى KJ.',
      'p.appr.toast.changes': 'أُرسل إلى KJ: طلب تعديل على «{title}».',
      'p.appr.stale': 'هذا العنصر تمت مراجعته من قبل. تم تحديث القائمة.',
      'p.appr.fail': 'لم يتم الإرسال. حاول مرة أخرى.',
      'p.ch.title': 'طلب تعديل', 'p.ch.label': 'وش تبي نعدّل في «{title}»؟', 'p.ch.ph': 'مثال: استخدم المقطع الثاني كبداية واختصر التعليق.',
      'p.ch.send': 'أرسل إلى KJ', 'p.ch.quick': 'اختيارات سريعة:', 'p.ch.q1': 'تعليق أقصر', 'p.ch.q2': 'موسيقى مختلفة', 'p.ch.q3': 'صورة أخرى',
      'p.ch.need': 'أضف ملاحظة قصيرة أو اختر من الاختيارات السريعة حتى يعرف KJ المطلوب.',

      'p.cal.title': 'تقويم المحتوى', 'p.cal.sub': 'المنشورات والكاروسيل والريلز والستوري لكل منصة.', 'p.cal.filter': 'تصفية حسب المنصة',
      'p.cal.all': 'الكل', 'p.cal.prev': 'الأسبوع السابق', 'p.cal.next': 'الأسبوع القادم', 'p.cal.today': 'هذا الأسبوع', 'p.cal.empty': 'لا شيء مخطط',
      'p.cal.none': 'لا يوجد محتوى مجدول بعد. المحتوى المخطط بيظهر هنا.',
      'p.day.0': 'الأحد', 'p.day.1': 'الاثنين', 'p.day.2': 'الثلاثاء', 'p.day.3': 'الأربعاء', 'p.day.4': 'الخميس', 'p.day.5': 'الجمعة', 'p.day.6': 'السبت',
      'p.type.post': 'منشور', 'p.type.carousel': 'كاروسيل', 'p.type.reel': 'ريل', 'p.type.story': 'ستوري', 'p.type.reply': 'رد', 'p.type.ad': 'إعلان',
      'p.s.draft': 'مسودة', 'p.s.needs_approval': 'بانتظار موافقتك', 'p.s.approved': 'تمت الموافقة', 'p.s.changes_requested': 'طُلب تعديل', 'p.s.scheduled': 'مجدول', 'p.s.published': 'منشور',
      'p.item.platform': 'المنصة', 'p.item.type': 'النوع', 'p.item.when': 'الموعد', 'p.item.status': 'الحالة', 'p.item.note': 'ملاحظتك', 'p.item.media': 'افتح الملف',

      'p.inbox.title': 'ردود الرسائل', 'p.inbox.sub': 'ردود مقترحة على التعليقات والرسائل بنبرة علامتك.', 'p.inbox.empty': 'لا ردود للمراجعة الآن.',
      'p.ads.title': 'الإعلانات', 'p.ads.sub': 'حملات بانتظارك أو تعمل الآن.', 'p.ads.empty': 'لا حملات إعلانية بعد.', 'p.ads.note': 'ميزانية الإعلانات تدفعها أنت مباشرة لكل منصة.',
      'p.wa.title': 'مساعد واتساب الذكي', 'p.wa.sub': 'ردود وكتالوج وطلبات عبر منصة واتساب للأعمال الرسمية.', 'p.wa.body': 'KJ يجهّز مساعد واتساب لك ويعرض نتائجه هنا.',
      'p.addon.title': 'أضف إلى باقتك', 'p.addon.sub': 'غير مشمول في باقة {pkg} بعد:', 'p.addon.ask': 'اسأل KJ على واتساب',
      'p.addon.ads': 'الإعلانات — حملات مدفوعة على ميتا وتيك توك وسناب شات', 'p.addon.wa': 'مساعد واتساب الذكي', 'p.addon.inbox': 'ردود ذكية على التعليقات والرسائل',

      'p.notif.title': 'الإشعارات', 'p.notif.readall': 'تحديد الكل كمقروء', 'p.notif.done': 'تم تحديد كل الإشعارات كمقروءة.', 'p.notif.empty': 'ما عندك شيء جديد.',
      'p.notif.admin': 'نشاط العملاء',

      'p.rep.title': 'التقارير', 'p.rep.sub': 'التدقيقات والاستراتيجيات والتقارير الشهرية.', 'p.rep.open': 'افتح', 'p.rep.soon': 'الملف قريبًا', 'p.rep.empty': 'لا تقارير بعد. أول تقرير بيظهر هنا.',

      'p.adm.title': 'مركز التحكم', 'p.adm.sub': 'أضف محتوى وأرقامًا ورسائل لـ {name}. العملاء لا يرون هذا القسم.',
      'p.adm.item': 'إضافة عنصر', 'p.adm.kpi': 'إضافة رقم رئيسي', 'p.adm.notif': 'إرسال إشعار',
      'p.f.kind': 'النوع', 'p.f.title': 'العنوان (EN)', 'p.f.title_ar': 'العنوان (AR)', 'p.f.caption': 'التعليق (EN)', 'p.f.caption_ar': 'التعليق (AR)',
      'p.f.media': 'رابط الملف', 'p.f.platform': 'المنصة', 'p.f.when': 'تاريخ ووقت النشر', 'p.f.status': 'الحالة',
      'p.f.metric': 'معرّف الرقم', 'p.f.metric.ph': 'مثال: views_30d', 'p.f.value': 'القيمة', 'p.f.label': 'الوصف (EN)', 'p.f.label_ar': 'الوصف (AR)', 'p.f.period': 'بتاريخ',
      'p.f.ntitle': 'العنوان (EN)', 'p.f.ntitle_ar': 'العنوان (AR)', 'p.f.body': 'الرسالة (EN)', 'p.f.body_ar': 'الرسالة (AR)',
      'p.f.add': 'أضف العنصر', 'p.f.addkpi': 'أضف الرقم', 'p.f.send': 'أرسل الإشعار', 'p.f.saving': 'جارٍ الحفظ…',
      'p.f.need': 'عبّئ الحقول المطلوبة.', 'p.f.ok.item': 'تمت إضافة العنصر لـ {name}.', 'p.f.ok.kpi': 'تمت إضافة الرقم لـ {name}.', 'p.f.ok.notif': 'تم إرسال الإشعار إلى {name}.',
      'p.f.fail': 'تعذّر الحفظ: {msg}', 'p.close': 'إغلاق',
      'p.foot': 'مدعوم من ZKJ SYSTEM · كل مشروع يصبح أداة.'
    }
  });

  // Device redesign (assets/device.js views, instruments, Control Center)
  window.ZKJ.extend({
    en: {
      'p.sb.glance': 'At a glance', 'p.sb.week': 'Planned this week', 'p.sb.next': 'Next to publish',
      'p.next.title': 'Up next', 'p.next.all': 'Open calendar', 'p.next.empty': 'Nothing scheduled yet.',
      'p.pkg.title': 'Your package', 'p.pkg.core': 'Approvals, calendar & reports', 'p.pkg.notincl': 'not included',
      'p.inst.target': 'Progress', 'p.inst.score': 'Score', 'p.inst.reading': 'Reading', 'p.inst.trend': 'Trend', 'p.inst.queue': 'Queue',
      'p.appr.done': 'Recently reviewed', 'p.stack.left': '{n} waiting',
      'p.notif.unread': 'unread',
      'p.mon.next': 'Next on air', 'p.mon.last': 'Last on the timeline', 'p.mon.review': 'Review in Approvals',
      'p.cc.clients': 'Clients', 'p.cc.newclient': 'New clients are added in Supabase → Table Editor → clients.', 'p.cc.item.sub': 'Post, reel, story, carousel, ad', 'p.cc.kpi.sub': 'Shows as an instrument on Today',
      'p.cc.notif.sub': 'Lands on the client’s bell', 'p.cc.activity': 'Client activity · unread',
      'p.cc.tab.item': 'Item', 'p.cc.tab.kpi': 'Number', 'p.cc.tab.notif': 'Notification',
      'p.cc.kpi.help': 'Tip: a metric called target_X draws X as a ring against its target; a score out of 100 draws a dial.'
    },
    ar: {
      'p.sb.glance': 'نظرة سريعة', 'p.sb.week': 'مخطط هذا الأسبوع', 'p.sb.next': 'التالي للنشر',
      'p.next.title': 'التالي', 'p.next.all': 'افتح التقويم', 'p.next.empty': 'لا شيء مجدول بعد.',
      'p.pkg.title': 'باقتك', 'p.pkg.core': 'الموافقات والتقويم والتقارير', 'p.pkg.notincl': 'غير مشمولة',
      'p.inst.target': 'التقدّم', 'p.inst.score': 'النتيجة', 'p.inst.reading': 'القراءة', 'p.inst.trend': 'الاتجاه', 'p.inst.queue': 'الطابور',
      'p.appr.done': 'تمت مراجعتها مؤخرًا', 'p.stack.left': '{n} بالانتظار',
      'p.notif.unread': 'غير مقروء',
      'p.mon.next': 'التالي على الهواء', 'p.mon.last': 'آخر عنصر في الخط الزمني', 'p.mon.review': 'راجعه في الموافقات',
      'p.cc.clients': 'العملاء', 'p.cc.newclient': 'يُضاف العملاء الجدد من Supabase ← Table Editor ← clients.', 'p.cc.item.sub': 'منشور، ريل، ستوري، كاروسيل، إعلان', 'p.cc.kpi.sub': 'يظهر كمؤشر في صفحة اليوم',
      'p.cc.notif.sub': 'يصل إلى جرس العميل', 'p.cc.activity': 'نشاط العملاء · غير مقروء',
      'p.cc.tab.item': 'عنصر', 'p.cc.tab.kpi': 'رقم', 'p.cc.tab.notif': 'إشعار',
      'p.cc.kpi.help': 'معلومة: المقياس باسم target_X يرسم X كحلقة مقابل هدفه؛ والنتيجة من 100 تُرسم كعدّاد.'
    }
  });
})();
