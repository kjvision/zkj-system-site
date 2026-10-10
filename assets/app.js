/* ZKJ SYSTEM — shared script: i18n (EN/AR + RTL), tool catalogue, enquiries. Vanilla JS, no build step. */
(function () {
  'use strict';

  var WA_NUMBER = '971541668700';
  var IG_URL = 'https://instagram.com/unknown.presence.kj';
  var FORM_ENDPOINT = 'https://formspree.io/f/mvkzrbog';
  var LANG_KEY = 'zkj-lang';

  /* ---------- Icons ---------- */
  var ICONS = {
    brand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 3v18M4 7.5l8 4.5 8-4.5"/></svg>',
    content: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="13" height="14" rx="1"/><path d="M16 10l5-3v10l-5-3"/><path d="M7 9h5M7 13h3"/></svg>',
    publisher: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="1"/><path d="M3 9h18M8 2v4M16 2v4"/><path d="M9 15l2 2 4-4"/></svg>',
    builder3d: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 12l9-5M12 12v10M12 12L3 7"/></svg>',
    drawings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3h18v18H3z"/><path d="M3 9h7v12M10 9V3M14 14h7M6 6h.01"/><path d="M14 17l2-2 2 2"/></svg>',
    security: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.4 9.2-8 11-4.6-1.8-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/></svg>',
    insights: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18"/><path d="M6 17v-5M11 17V7M16 17v-8M21 17V4"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l4 4 10-10"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.56 2 2.1 6.45 2.1 11.93c0 1.75.46 3.46 1.33 4.97L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.47 0 9.93-4.45 9.93-9.93A9.86 9.86 0 0012.04 2zm0 18.15h-.01a8.25 8.25 0 01-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 01-1.26-4.36c0-4.55 3.71-8.25 8.27-8.25 2.2 0 4.28.86 5.84 2.42a8.2 8.2 0 012.42 5.84c0 4.55-3.71 8.21-8.27 8.21zm4.53-6.16c-.25-.12-1.47-.72-1.7-.8-.23-.09-.39-.13-.56.12-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.29z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 7l9 6 9-6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  /* ---------- Tool catalogue ---------- */
  var TOOLS = [
    { id: 'brand', code: 'T-01', icon: ICONS.brand,
      en: { name: 'Brand Kit Builder', tag: 'A complete, consistent identity before the first post goes out.',
        desc: 'Everything your brand needs to look and sound like itself on every channel — documented so your team can follow it.',
        points: ['Logo direction and colour palette', 'Typography and brand voice', 'Bilingual Arabic / English taglines', 'Social templates + brand guideline document'] },
      ar: { name: 'باني هوية العلامة', tag: 'هوية متكاملة ومتّسقة قبل أن يُنشر أول منشور.',
        desc: 'كل ما تحتاجه علامتك لتظهر بشكلها وصوتها الحقيقي على كل منصة — موثّق ليلتزم به فريقك بسهولة.',
        points: ['اتجاه الشعار ولوحة الألوان', 'الخطوط ونبرة العلامة', 'شعارات نصية بالعربية والإنجليزية', 'قوالب سوشال ميديا ودليل هوية متكامل'] } },
    { id: 'content', code: 'T-02', icon: ICONS.content,
      en: { name: 'Content Studio', tag: 'Your real photos and videos, edited into content that looks like you.',
        desc: 'It always starts by asking for your own product photos and videos, then edits them professionally. Visuals are generated only where footage is missing.',
        points: ['Posts, carousels and reels in your brand', 'Cuts, captions, motion text and music', 'Colour grade and brand overlays', 'Captions in Arabic and English'] },
      ar: { name: 'استوديو المحتوى', tag: 'صورك وفيديوهاتك الحقيقية، تتحوّل إلى محتوى يشبهك.',
        desc: 'يبدأ دائمًا بطلب صور وفيديوهات منتجاتك، ثم يحرّرها باحتراف. ولا يُولّد صورًا إلا عندما لا تتوفّر مواد مصوّرة.',
        points: ['منشورات وكاروسيل وريلز بهوية علامتك', 'قصّ وتعليقات ونصوص متحركة وموسيقى', 'معالجة ألوان وإضافات بهوية العلامة', 'تعليقات بالعربية والإنجليزية'] } },
    { id: 'publisher', code: 'T-03', icon: ICONS.publisher,
      en: { name: 'Social Media Publisher', tag: 'Seven platforms, one calendar — and nothing posts without your approval.',
        desc: 'Approved content is scheduled and published at the right time on every channel you use, from one shared content calendar.',
        points: ['Instagram, Facebook, TikTok, YouTube', 'Pinterest, X and LinkedIn', 'One content calendar for every channel', 'Approve or request changes before anything goes live'] },
      ar: { name: 'ناشر السوشال ميديا', tag: 'سبع منصات في تقويم واحد — ولا شيء يُنشر بدون موافقتك.',
        desc: 'يُجدول المحتوى المعتمد ويُنشر في الوقت المناسب على كل منصة تستخدمها، من تقويم محتوى واحد.',
        points: ['إنستغرام، فيسبوك، تيك توك، يوتيوب', 'بنترست، إكس ولينكدإن', 'تقويم محتوى واحد لكل المنصات', 'وافق أو اطلب تعديل قبل أي نشر'] } },
    { id: 'builder3d', code: 'T-04', icon: ICONS.builder3d,
      en: { name: '3D Builder', tag: 'See the space or product in 3D before it exists.',
        desc: 'Clear 3D visualisation of interiors, shopfronts, displays and products — built on a tool ZKJ VERSE has tested on its own projects.',
        points: ['Spaces, fit-outs and shopfronts', 'Products and displays', 'Stills ready for social and proposals', 'Iterate on layout and materials'] },
      ar: { name: 'مُنشئ الثلاثي الأبعاد', tag: 'شاهد المكان أو المنتج بالأبعاد الثلاثية قبل تنفيذه.',
        desc: 'تصوّر ثلاثي الأبعاد واضح للمساحات الداخلية والواجهات وأماكن العرض والمنتجات — مبني على أداة جرّبتها ZKJ VERSE في مشاريعها.',
        points: ['مساحات وتشطيبات وواجهات محلات', 'منتجات وأماكن عرض', 'صور جاهزة للسوشال والعروض', 'تعديلات على التوزيع والخامات'] } },
    { id: 'drawings', code: 'T-05', icon: ICONS.drawings,
      en: { name: '2D Engineering Drawings Agent', tag: 'Technical drawings in Arabic and English, with dimensions that read right.',
        desc: 'Plans, sections and schedules prepared bilingually, with correct right-to-left dimensions and labels — made by an engineer’s standards.',
        points: ['Plans, sections and elevations', 'Door, finish and equipment schedules', 'Correct RTL dimensions and labels', 'Arabic / English title blocks'] },
      ar: { name: 'وكيل الرسومات الهندسية ثنائية الأبعاد', tag: 'رسومات فنية بالعربية والإنجليزية، بأبعاد تُقرأ صح.',
        desc: 'مخططات ومقاطع وجداول ثنائية اللغة، مع أبعاد وتسميات صحيحة من اليمين إلى اليسار — بمعايير هندسية.',
        points: ['مخططات ومقاطع وواجهات', 'جداول الأبواب والتشطيبات والمعدات', 'أبعاد وتسميات صحيحة من اليمين لليسار', 'إطارات عنوان بالعربية والإنجليزية'] } },
    { id: 'security', code: 'T-06', icon: ICONS.security,
      en: { name: 'Security Agent', tag: 'Find the weak spots before someone else does.',
        desc: 'Reviews your website, social accounts and code for security issues, then gives you a plain-language fix list, ordered by risk.',
        points: ['Website and booking-page checks', 'Account access and two-step login review', 'Code review for common issues', 'Plain-language fix list by priority'] },
      ar: { name: 'وكيل الأمان', tag: 'اكتشف نقاط الضعف قبل أن يكتشفها غيرك.',
        desc: 'يراجع موقعك وحساباتك على السوشال والكود بحثًا عن مشاكل أمنية، ثم يعطيك قائمة إصلاحات بلغة واضحة مرتبة حسب الخطورة.',
        points: ['فحص الموقع وصفحات الحجز', 'مراجعة صلاحيات الحسابات والتحقق بخطوتين', 'مراجعة الكود للمشاكل الشائعة', 'قائمة إصلاحات واضحة حسب الأولوية'] } },
    { id: 'insights', code: 'T-07', icon: ICONS.insights,
      en: { name: 'Insights & Reports', tag: 'Every week: what worked, and what to post next.',
        desc: 'A weekly report across all your channels that turns numbers into decisions — with clear recommendations for the next week’s content.',
        points: ['Reach and engagement by platform', 'Best and weakest posts of the week', 'What to post next, and when', 'Bilingual report in your dashboard'] },
      ar: { name: 'التحليلات والتقارير', tag: 'كل أسبوع: ما الذي نجح، وماذا تنشر بعده.',
        desc: 'تقرير أسبوعي لكل منصاتك يحوّل الأرقام إلى قرارات — مع توصيات واضحة لمحتوى الأسبوع القادم.',
        points: ['الوصول والتفاعل لكل منصة', 'أفضل وأضعف منشورات الأسبوع', 'ماذا تنشر بعد ذلك ومتى', 'تقرير بلغتين داخل لوحتك'] } }
  ];

  var PLATFORMS = [
    { id: 'instagram', en: 'Instagram', ar: 'إنستغرام', color: '#E1306C' },
    { id: 'facebook', en: 'Facebook', ar: 'فيسبوك', color: '#1877F2' },
    { id: 'tiktok', en: 'TikTok', ar: 'تيك توك', color: '#25C2C9' },
    { id: 'youtube', en: 'YouTube', ar: 'يوتيوب', color: '#FF3B30' },
    { id: 'pinterest', en: 'Pinterest', ar: 'بنترست', color: '#D5243A' },
    { id: 'x', en: 'X', ar: 'إكس', color: '#8B95A1' },
    { id: 'linkedin', en: 'LinkedIn', ar: 'لينكدإن', color: '#0A66C2' }
  ];

  var PACKAGES = ['starter', 'growth', 'full'];

  /* ---------- Strings ---------- */
  var STR = {
    en: {
      'meta.title': 'ZKJ SYSTEM — AI tools for your brand, by ZKJ VERSE',
      'skip': 'Skip to content',
      'nav.how': 'How it works', 'nav.tools': 'Tools', 'nav.packages': 'Packages', 'nav.demo': 'Live demo', 'nav.faq': 'FAQ', 'nav.enquire': 'Enquire',
      'nav.menu': 'Open menu', 'lang.switch': 'Switch language to Arabic',
      'hero.eyebrow': 'ZKJ VERSE · Where Engineering Meets Light',
      'hero.title': 'AI tools that run your brand’s content — <span class="hl">and show you every step.</span>',
      'hero.lead': 'ZKJ SYSTEM is a set of seven AI tools built by ZKJ VERSE. Send a short brief and your own photos and videos — the tools build your brand kit, edit your content, publish it with your approval and tell you what worked. All inside a live dashboard in your logo and colours.',
      'hero.cta.wa': 'Enquire on WhatsApp', 'hero.cta.demo': 'Open the live demo',
      'hero.f1': 'AI tools', 'hero.f2': 'platforms published', 'hero.f3': 'languages — Arabic & English', 'hero.f4': 'posts go live without your approval',
      'mock.client': 'Your brand here', 'mock.demo': 'Live demo',
      'mock.r1': 'Content Studio', 'mock.r1s': '2 reels in edit from your footage',
      'mock.r2': 'Social Media Publisher', 'mock.r2s': '3 posts waiting for your approval',
      'mock.r3': 'Insights & Reports', 'mock.r3s': 'Weekly report ready',
      'mock.r4': '3D Builder', 'mock.r4s': 'Not started',
      'mock.foot1': 'Your logo · your colours', 'mock.foot2': 'EN / AR',
      'aud.label': 'Built for businesses across the Arab world:',
      'aud.1': 'Restaurants', 'aud.2': 'Cafés', 'aud.3': 'Gyms', 'aud.4': 'Retail', 'aud.5': 'Real estate', 'aud.6': 'E-commerce', 'aud.7': 'Brands',
      'how.eyebrow': 'How it works', 'how.title': 'From first message to a live dashboard', 'how.sub': 'Four clear steps. You stay in control of everything that goes out under your name.',
      'how.1.t': 'Enquire', 'how.1.d': 'Tell us about your business on WhatsApp, Instagram or the form below. KJ replies personally.',
      'how.2.t': 'Brief + your photos & videos', 'how.2.d': 'A short brief on your brand, audience and goals — plus your own product photos and videos, if you have them.',
      'how.3.t': 'Tools start', 'how.3.d': 'KJ sets up the tools you chose. Content is edited from your real footage first; anything missing is generated in your style.',
      'how.4.t': 'Your live branded dashboard', 'how.4.d': 'Notifications, content, approvals and publishing in one place — in your logo and colours, in Arabic or English.',
      'tools.eyebrow': 'The catalogue', 'tools.title': 'Seven tools. One system.', 'tools.sub': 'Start with one tool or run all seven. Every tool reports into the same dashboard, so you always know what’s done and what needs you.',
      'tools.cta': 'Enquire about this tool',
      'pk.eyebrow': 'Packages', 'pk.title': 'Packages by channel', 'pk.sub': 'Every package includes Content Studio, Social Media Publisher, Insights & Reports and your live branded dashboard. Pricing is shared with you personally after your brief.',
      'pk.starter.name': 'Starter', 'pk.starter.reach': '1–2 platforms', 'pk.starter.d': 'For a focused start on the channels where your customers already are.',
      'pk.growth.name': 'Growth', 'pk.growth.reach': '3–4 platforms', 'pk.growth.d': 'For businesses ready to show up consistently across more channels.',
      'pk.full.name': 'Full', 'pk.full.reach': 'All 7 platforms + Brand Kit', 'pk.full.d': 'The complete system, starting with a full brand kit and covering every channel.',
      'pk.i1': 'Content edited from your own photos & videos', 'pk.i2': 'Approval before anything is published', 'pk.i3': 'Weekly insights report', 'pk.i4': 'Live branded dashboard (EN / AR)',
      'pk.i5': 'Brand Kit Builder included', 'pk.i6': 'Content calendar across all channels',
      'pk.cta': 'Enquire about {name}',
      'pk.note': 'Add 3D Builder, 2D Engineering Drawings or the Security Agent to any package — or use them on their own.',
      'demo.eyebrow': 'Live demo', 'demo.title': 'See your dashboard before you start', 'demo.sub': 'Click through a working demo with a sample café brand: approve posts, check the calendar, upload media and switch themes. No login needed.', 'demo.cta': 'Open the live demo',
      'faq.eyebrow': 'FAQ', 'faq.title': 'Questions, answered',
      'faq.1.q': 'Is ZKJ SYSTEM a service or a product?', 'faq.1.a': 'A product. ZKJ SYSTEM is a set of AI tools sold by ZKJ VERSE. KJ sets up your tools from your brief and your media, and you follow everything in your own branded dashboard.',
      'faq.2.q': 'Do I have to send my own photos and videos?', 'faq.2.a': 'It’s the first thing we ask for — your real products, space and people perform best. If you don’t have footage yet, Content Studio generates visuals in your brand style, and those posts are clearly marked in your dashboard.',
      'faq.3.q': 'Will anything be posted without my approval?', 'faq.3.a': 'No. Every post, carousel and reel waits in your approvals queue. You approve it or request changes; only approved content is scheduled and published.',
      'faq.4.q': 'Which platforms do you publish to?', 'faq.4.a': 'Instagram, Facebook, TikTok, YouTube, Pinterest, X and LinkedIn. Your package decides how many you start with.',
      'faq.5.q': 'Does it work in Arabic and English?', 'faq.5.a': 'Yes. Captions, your dashboard and your reports are available in Arabic and English, with a proper right-to-left layout in Arabic.',
      'faq.6.q': 'How do pricing and payment work?', 'faq.6.a': 'There is no checkout on this site. Send an enquiry and KJ replies personally with a proposal for the tools you chose, and arranges payment with you directly.',
      'faq.7.q': 'Can I start small and add tools later?', 'faq.7.a': 'Yes. Start with one tool or the Starter package and add tools whenever you’re ready — they join the same dashboard.',
      'enq.eyebrow': 'Enquire', 'enq.title': 'Start with a conversation', 'enq.sub': 'Choose the channel that suits you. KJ reads every enquiry and replies personally.',
      'enq.ctx': 'Enquiring about:', 'enq.ctx.clear': 'Clear selection',
      'enq.wa.t': 'WhatsApp', 'enq.wa.d': 'Fastest reply. Opens a pre-written message you can edit.', 'enq.wa.b': 'Message on WhatsApp',
      'enq.ig.t': 'Instagram', 'enq.ig.d': 'Prefer DMs? Message us on Instagram.', 'enq.ig.b': 'DM us on Instagram',
      'enq.form.t': 'Email form', 'enq.form.d': 'Tell us a little more and we’ll reply by email or WhatsApp.', 'enq.form.b': 'Go to the form',
      'f.title': 'Send an enquiry',
      'f.name': 'Your name', 'f.business': 'Business name', 'f.country': 'Country', 'f.country.ph': 'e.g. UAE, Saudi Arabia, Egypt', 'f.phone': 'Phone / WhatsApp', 'f.phone.ph': '+971 …', 'f.email': 'Email',
      'f.tools': 'Tools you’re interested in', 'f.platforms': 'Platforms you use', 'f.message': 'Message', 'f.message.ph': 'Tell us about your business and what you’d like the tools to do.',
      'f.submit': 'Send enquiry', 'f.sending': 'Sending…', 'f.privacy': 'No payment is taken here. KJ replies personally.',
      'f.ok': 'Thank you — your enquiry is with KJ. Expect a personal reply soon.',
      'f.error': 'Something went wrong sending the form. Please try again, or message us on WhatsApp.',
      'f.invalid': 'Please check the highlighted fields.',
      'f.e.name': 'Please enter your name.', 'f.e.business': 'Please enter your business name.', 'f.e.country': 'Please enter your country.',
      'f.e.phone': 'Please enter a valid phone / WhatsApp number.', 'f.e.email': 'Please enter a valid email address.',
      'wa.general': 'Hello KJ, I’m interested in ZKJ SYSTEM for my business. Can we talk?',
      'wa.item': 'Hello KJ, I’m interested in ZKJ SYSTEM — {item}. Can we talk?',
      'wa.pkg': '{name} package ({reach})',
      'wa.float': 'Chat with us on WhatsApp',
      'ft.tag': 'AI tools for brands across the Arab world — by ZKJ VERSE.',
      'ft.line': 'Where Engineering Meets Light',
      'ft.product': 'Product', 'ft.contact': 'Contact', 'ft.copy': '© {year} ZKJ VERSE. ZKJ SYSTEM is a product of ZKJ VERSE.',
      'ft.demo': 'Live demo dashboard',
      'nf.title.doc': 'Page not found — ZKJ SYSTEM', 'nf.title': 'This page doesn’t exist', 'nf.sub': 'The link may be old or mistyped. Let’s get you back on track.', 'nf.home': 'Back to home', 'nf.demo': 'Open the live demo'
    },
    ar: {
      'meta.title': 'ZKJ SYSTEM — أدوات ذكاء اصطناعي لعلامتك من ZKJ VERSE',
      'skip': 'انتقل إلى المحتوى',
      'nav.how': 'كيف يعمل', 'nav.tools': 'الأدوات', 'nav.packages': 'الباقات', 'nav.demo': 'العرض المباشر', 'nav.faq': 'الأسئلة الشائعة', 'nav.enquire': 'استفسر',
      'nav.menu': 'فتح القائمة', 'lang.switch': 'تغيير اللغة إلى الإنجليزية',
      'hero.eyebrow': 'ZKJ VERSE · حيث تلتقي الهندسة بالضوء',
      'hero.title': 'أدوات ذكاء اصطناعي تدير محتوى علامتك — <span class="hl">وتريك كل خطوة.</span>',
      'hero.lead': 'ZKJ SYSTEM مجموعة من سبع أدوات ذكاء اصطناعي من تطوير ZKJ VERSE. أرسل موجزًا قصيرًا مع صورك وفيديوهاتك — والأدوات تبني هويتك، وتحرّر محتواك، وتنشره بعد موافقتك، وتخبرك بما نجح. وكل ذلك داخل لوحة تحكم مباشرة بشعارك وألوانك.',
      'hero.cta.wa': 'تواصل معنا على واتساب', 'hero.cta.demo': 'افتح العرض المباشر',
      'hero.f1': 'أدوات ذكاء اصطناعي', 'hero.f2': 'منصات للنشر', 'hero.f3': 'لغتان — العربية والإنجليزية', 'hero.f4': 'منشورات تُنشر بدون موافقتك',
      'mock.client': 'علامتك هنا', 'mock.demo': 'عرض مباشر',
      'mock.r1': 'استوديو المحتوى', 'mock.r1s': 'ريلزان قيد التحرير من موادك',
      'mock.r2': 'ناشر السوشال ميديا', 'mock.r2s': '3 منشورات بانتظار موافقتك',
      'mock.r3': 'التحليلات والتقارير', 'mock.r3s': 'التقرير الأسبوعي جاهز',
      'mock.r4': 'مُنشئ الثلاثي الأبعاد', 'mock.r4s': 'لم يبدأ بعد',
      'mock.foot1': 'شعارك · ألوانك', 'mock.foot2': 'ع / EN',
      'aud.label': 'مصمَّم للأعمال في أنحاء العالم العربي:',
      'aud.1': 'مطاعم', 'aud.2': 'مقاهي', 'aud.3': 'نوادٍ رياضية', 'aud.4': 'متاجر', 'aud.5': 'عقارات', 'aud.6': 'تجارة إلكترونية', 'aud.7': 'علامات تجارية',
      'how.eyebrow': 'كيف يعمل', 'how.title': 'من أول رسالة إلى لوحة تحكم مباشرة', 'how.sub': 'أربع خطوات واضحة، وتبقى أنت المتحكم في كل ما يُنشر باسمك.',
      'how.1.t': 'استفسر', 'how.1.d': 'عرّفنا على نشاطك عبر واتساب أو إنستغرام أو النموذج بالأسفل، ويرد عليك KJ شخصيًا.',
      'how.2.t': 'الموجز + صورك وفيديوهاتك', 'how.2.d': 'موجز قصير عن علامتك وجمهورك وأهدافك — مع صور وفيديوهات منتجاتك إن توفّرت.',
      'how.3.t': 'تبدأ الأدوات', 'how.3.d': 'يجهّز KJ الأدوات التي اخترتها. يُحرَّر المحتوى من موادك الحقيقية أولًا، وما ينقص يُولَّد بأسلوب علامتك.',
      'how.4.t': 'لوحتك المباشرة بهويتك', 'how.4.d': 'الإشعارات والمحتوى والموافقات والنشر في مكان واحد — بشعارك وألوانك، بالعربية أو الإنجليزية.',
      'tools.eyebrow': 'الكتالوج', 'tools.title': 'سبع أدوات. نظام واحد.', 'tools.sub': 'ابدأ بأداة واحدة أو شغّل السبع كلها. كل أداة ترفع تقاريرها إلى نفس اللوحة، فتعرف دائمًا ما الذي أُنجز وما الذي يحتاجك.',
      'tools.cta': 'استفسر عن هذه الأداة',
      'pk.eyebrow': 'الباقات', 'pk.title': 'باقات حسب عدد المنصات', 'pk.sub': 'كل باقة تشمل استوديو المحتوى وناشر السوشال ميديا والتحليلات والتقارير ولوحتك المباشرة بهويتك. يُرسل لك التسعير شخصيًا بعد الموجز.',
      'pk.starter.name': 'البداية', 'pk.starter.reach': 'منصة أو منصتان', 'pk.starter.d': 'لبداية مركّزة على المنصات التي يتواجد فيها عملاؤك أصلًا.',
      'pk.growth.name': 'النمو', 'pk.growth.reach': '3–4 منصات', 'pk.growth.d': 'للأعمال الجاهزة للظهور بانتظام على منصات أكثر.',
      'pk.full.name': 'الكاملة', 'pk.full.reach': 'جميع المنصات السبع + هوية العلامة', 'pk.full.d': 'النظام الكامل، يبدأ بهوية متكاملة لعلامتك ويغطي كل المنصات.',
      'pk.i1': 'محتوى محرَّر من صورك وفيديوهاتك', 'pk.i2': 'موافقتك قبل أي نشر', 'pk.i3': 'تقرير تحليلات أسبوعي', 'pk.i4': 'لوحة مباشرة بهويتك (عربي / إنجليزي)',
      'pk.i5': 'باني هوية العلامة مشمول', 'pk.i6': 'تقويم محتوى لكل المنصات',
      'pk.cta': 'استفسر عن باقة {name}',
      'pk.note': 'أضف مُنشئ الثلاثي الأبعاد أو الرسومات الهندسية أو وكيل الأمان إلى أي باقة — أو استخدمها بشكل مستقل.',
      'demo.eyebrow': 'عرض مباشر', 'demo.title': 'شوف لوحتك قبل ما تبدأ', 'demo.sub': 'جرّب عرضًا تفاعليًا بعلامة مقهى نموذجية: وافق على المنشورات، تصفّح التقويم، ارفع الصور، وبدّل بين الثيمات. بدون تسجيل دخول.', 'demo.cta': 'افتح العرض المباشر',
      'faq.eyebrow': 'الأسئلة الشائعة', 'faq.title': 'أسئلة وإجابات',
      'faq.1.q': 'هل ZKJ SYSTEM خدمة أم منتج؟', 'faq.1.a': 'منتج. ZKJ SYSTEM مجموعة أدوات ذكاء اصطناعي تقدّمها ZKJ VERSE. يجهّز KJ أدواتك من الموجز وموادك، وتتابع أنت كل شيء من لوحتك الخاصة بهويتك.',
      'faq.2.q': 'هل لازم أرسل صوري وفيديوهاتي؟', 'faq.2.a': 'هذا أول ما نطلبه — منتجاتك ومكانك وفريقك الحقيقيون يحققون أفضل النتائج. وإن لم تتوفر لديك مواد بعد، يولّد استوديو المحتوى صورًا بأسلوب علامتك، وتظهر هذه المنشورات معلَّمة بوضوح في لوحتك.',
      'faq.3.q': 'هل يُنشر أي شيء بدون موافقتي؟', 'faq.3.a': 'لا. كل منشور وكاروسيل وريل ينتظر في قائمة الموافقات. توافق عليه أو تطلب تعديلًا، ولا يُجدول ويُنشر إلا المحتوى المعتمد.',
      'faq.4.q': 'على أي منصات تنشرون؟', 'faq.4.a': 'إنستغرام وفيسبوك وتيك توك ويوتيوب وبنترست وإكس ولينكدإن. وباقتك تحدد عدد المنصات التي تبدأ بها.',
      'faq.5.q': 'هل يعمل بالعربية والإنجليزية؟', 'faq.5.a': 'نعم. التعليقات ولوحتك وتقاريرك متاحة بالعربية والإنجليزية، مع اتجاه صحيح من اليمين إلى اليسار بالعربية.',
      'faq.6.q': 'كيف يتم التسعير والدفع؟', 'faq.6.a': 'لا يوجد دفع على هذا الموقع. أرسل استفسارك ويرد عليك KJ شخصيًا بعرض للأدوات التي اخترتها، ويتفق معك على الدفع مباشرة.',
      'faq.7.q': 'هل أقدر أبدأ بشيء بسيط وأضيف أدوات لاحقًا؟', 'faq.7.a': 'أكيد. ابدأ بأداة واحدة أو بباقة البداية، وأضف الأدوات متى ما كنت جاهز — وكلها تنضم لنفس اللوحة.',
      'enq.eyebrow': 'استفسر', 'enq.title': 'البداية محادثة', 'enq.sub': 'اختر الطريقة اللي تناسبك. KJ يقرأ كل استفسار ويرد عليك شخصيًا.',
      'enq.ctx': 'استفسار عن:', 'enq.ctx.clear': 'إلغاء الاختيار',
      'enq.wa.t': 'واتساب', 'enq.wa.d': 'أسرع رد. تُفتح رسالة جاهزة تقدر تعدّلها.', 'enq.wa.b': 'راسلنا على واتساب',
      'enq.ig.t': 'إنستغرام', 'enq.ig.d': 'تفضّل الرسائل الخاصة؟ راسلنا على إنستغرام.', 'enq.ig.b': 'راسلنا على إنستغرام',
      'enq.form.t': 'نموذج البريد', 'enq.form.d': 'خبّرنا أكثر عن نشاطك ونرد عليك بالبريد أو واتساب.', 'enq.form.b': 'انتقل إلى النموذج',
      'f.title': 'أرسل استفسارك',
      'f.name': 'الاسم', 'f.business': 'اسم النشاط التجاري', 'f.country': 'الدولة', 'f.country.ph': 'مثال: الإمارات، السعودية، مصر', 'f.phone': 'رقم الهاتف / واتساب', 'f.phone.ph': '+971 …', 'f.email': 'البريد الإلكتروني',
      'f.tools': 'الأدوات التي تهمك', 'f.platforms': 'المنصات التي تستخدمها', 'f.message': 'رسالتك', 'f.message.ph': 'حدّثنا عن نشاطك وما تريد أن تقوم به الأدوات.',
      'f.submit': 'أرسل الاستفسار', 'f.sending': 'جارٍ الإرسال…', 'f.privacy': 'لا يتم أي دفع هنا. KJ يرد عليك شخصيًا.',
      'f.ok': 'شكرًا لك — وصل استفسارك إلى KJ، وبيتواصل معك قريبًا.',
      'f.error': 'حدث خطأ أثناء إرسال النموذج. حاول مرة أخرى، أو راسلنا على واتساب.',
      'f.invalid': 'يرجى مراجعة الحقول المحددة.',
      'f.e.name': 'يرجى كتابة اسمك.', 'f.e.business': 'يرجى كتابة اسم نشاطك التجاري.', 'f.e.country': 'يرجى كتابة الدولة.',
      'f.e.phone': 'يرجى كتابة رقم هاتف / واتساب صحيح.', 'f.e.email': 'يرجى كتابة بريد إلكتروني صحيح.',
      'wa.general': 'مرحبا KJ، مهتم بـ ZKJ SYSTEM لنشاطي التجاري. ممكن نتواصل؟',
      'wa.item': 'مرحبا KJ، مهتم بـ ZKJ SYSTEM — {item}. ممكن نتواصل؟',
      'wa.pkg': 'باقة {name} ({reach})',
      'wa.float': 'تواصل معنا على واتساب',
      'ft.tag': 'أدوات ذكاء اصطناعي للعلامات التجارية في العالم العربي — من ZKJ VERSE.',
      'ft.line': 'حيث تلتقي الهندسة بالضوء',
      'ft.product': 'المنتج', 'ft.contact': 'تواصل', 'ft.copy': '© {year} ZKJ VERSE. ‏ZKJ SYSTEM منتج من ZKJ VERSE.',
      'ft.demo': 'لوحة العرض المباشر',
      'nf.title.doc': 'الصفحة غير موجودة — ZKJ SYSTEM', 'nf.title': 'هذه الصفحة غير موجودة', 'nf.sub': 'قد يكون الرابط قديمًا أو مكتوبًا بشكل خاطئ. خلّنا نرجعك للمسار الصحيح.', 'nf.home': 'العودة للرئيسية', 'nf.demo': 'افتح العرض المباشر'
    }
  };

  /* ---------- Storage (safe) ---------- */
  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, val);
    } catch (e) { /* storage unavailable */ }
    return null;
  }

  /* ---------- i18n core ---------- */
  var lang = store(LANG_KEY) === 'ar' ? 'ar' : 'en';
  var listeners = [];

  function t(key, vars) {
    var s = (STR[lang] && STR[lang][key]);
    if (s === undefined) s = STR.en[key];
    if (s === undefined) s = key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  function tLang(l, key, vars) {
    var s = (STR[l] && STR[l][key]);
    if (s === undefined) s = STR.en[key];
    if (s === undefined) s = key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  function extend(dict) {
    ['en', 'ar'].forEach(function (l) { if (dict[l]) Object.keys(dict[l]).forEach(function (k) { STR[l][k] = dict[l][k]; }); });
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  function applyLang() {
    var root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n'), { year: new Date().getFullYear() }); });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':'); if (p.length === 2) el.setAttribute(p[0].trim(), t(p[1].trim()));
      });
    });
    var tk = document.body && document.body.getAttribute('data-title-key');
    if (tk) document.title = t(tk);
    document.querySelectorAll('[data-lang-toggle]').forEach(function (b) {
      b.innerHTML = lang === 'ar' ? '<span lang="en">English</span>' : '<span class="lt-ar" lang="ar">العربية</span>';
      b.setAttribute('aria-label', t('lang.switch'));
    });
    listeners.forEach(function (fn) { try { fn(lang); } catch (e) { if (window.console) console.warn(e); } });
    updateWaLinks();
  }
  function setLang(l) { lang = l === 'ar' ? 'ar' : 'en'; store(LANG_KEY, lang); applyLang(); }
  function onLang(fn) { listeners.push(fn); }

  /* ---------- Toast ---------- */
  function toast(msg, kind) {
    var wrap = document.querySelector('.toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; wrap.setAttribute('role', 'status'); wrap.setAttribute('aria-live', 'polite'); (document.querySelector('.dash') || document.body).appendChild(wrap); }
    var el = document.createElement('div');
    el.className = 'toast ' + (kind || '');
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(function () { el.remove(); }, 4200);
  }

  /* ---------- Enquiry context + WhatsApp ---------- */
  var ctx = null; // { type: 'tool'|'package', id }
  function toolById(id) { for (var i = 0; i < TOOLS.length; i++) if (TOOLS[i].id === id) return TOOLS[i]; return null; }
  function ctxLabel(c) {
    if (!c) return '';
    if (c.type === 'tool') { var tl = toolById(c.id); return tl ? tl[lang].name : ''; }
    if (c.type === 'package') return t('wa.pkg', { name: t('pk.' + c.id + '.name'), reach: t('pk.' + c.id + '.reach') });
    return '';
  }
  function waLink(c) {
    var label = ctxLabel(c);
    var msg = label ? t('wa.item', { item: label }) : t('wa.general');
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
  }
  function updateWaLinks() {
    document.querySelectorAll('[data-wa]').forEach(function (a) {
      var fixed = a.getAttribute('data-wa');
      var c = ctx;
      if (fixed) { var p = fixed.split(':'); c = { type: p[0], id: p[1] }; }
      a.setAttribute('href', waLink(c));
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
    var chip = document.getElementById('ctx-chip');
    if (chip) {
      chip.classList.toggle('show', !!ctx);
      var lab = chip.querySelector('[data-ctx-label]');
      if (lab) lab.textContent = ctxLabel(ctx);
    }
  }
  function setContext(c) {
    ctx = c;
    var form = document.getElementById('enquiry-form');
    if (form && c) {
      if (c.type === 'tool') {
        var cb = form.querySelector('input[name="tools"][value="' + c.id + '"]');
        if (cb) cb.checked = true;
      }
      var pk = form.querySelector('input[name="package"]');
      if (pk) pk.value = c.type === 'package' ? c.id : '';
      if (c.type === 'package' && c.id === 'full') {
        form.querySelectorAll('input[name="platforms"]').forEach(function (p) { p.checked = true; });
        var bk = form.querySelector('input[name="tools"][value="brand"]'); if (bk) bk.checked = true;
      }
    }
    if (form && !c) { var pk2 = form.querySelector('input[name="package"]'); if (pk2) pk2.value = ''; }
    updateWaLinks();
  }

  /* ---------- Index renderers ---------- */
  function renderTools() {
    var grid = document.getElementById('tools-grid');
    if (!grid) return;
    grid.innerHTML = TOOLS.map(function (tl) {
      var d = tl[lang];
      return '<li><article class="plate tool-card" id="tool-' + tl.id + '">' +
        '<span class="tag tool-id">' + tl.code + '</span>' +
        '<div class="tool-icon">' + tl.icon + '</div>' +
        '<h3>' + esc(d.name) + '</h3>' +
        '<p class="tool-tag">' + esc(d.tag) + '</p>' +
        '<p class="tool-desc">' + esc(d.desc) + '</p>' +
        '<ul>' + d.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
        '<a class="btn btn-ghost btn-sm" href="#enquire" data-enquire="tool:' + tl.id + '">' + esc(t('tools.cta')) + ' ' + ICONS.arrow + '</a>' +
        '</article></li>';
    }).join('');
  }
  function renderPackages() {
    var grid = document.getElementById('packages-grid');
    if (!grid) return;
    var items = {
      starter: ['pk.i1', 'pk.i2', 'pk.i3', 'pk.i4'],
      growth: ['pk.i1', 'pk.i2', 'pk.i6', 'pk.i3', 'pk.i4'],
      full: ['pk.i5', 'pk.i1', 'pk.i2', 'pk.i6', 'pk.i3', 'pk.i4']
    };
    grid.innerHTML = PACKAGES.map(function (id) {
      return '<article class="plate pkg' + (id === 'full' ? ' is-accent' : '') + '" id="pkg-' + id + '">' +
        '<span class="tag">' + ({ starter: 'P-01', growth: 'P-02', full: 'P-03' })[id] + '</span>' +
        '<h3>' + esc(t('pk.' + id + '.name')) + '</h3>' +
        '<div class="pkg-reach">' + esc(t('pk.' + id + '.reach')) + '</div>' +
        '<p>' + esc(t('pk.' + id + '.d')) + '</p>' +
        '<ul>' + items[id].map(function (k) { return '<li>' + ICONS.check + '<span>' + esc(t(k)) + '</span></li>'; }).join('') + '</ul>' +
        '<a class="btn ' + (id === 'full' ? 'btn-primary' : 'btn-ghost') + '" href="#enquire" data-enquire="package:' + id + '">' + esc(t('pk.cta', { name: t('pk.' + id + '.name') })) + '</a>' +
        '</article>';
    }).join('');
  }
  function renderFormOptions() {
    var tb = document.getElementById('tools-checks');
    var pb = document.getElementById('platform-checks');
    var form = document.getElementById('enquiry-form');
    if (!tb || !pb || !form) return;
    var checkedTools = Array.prototype.map.call(form.querySelectorAll('input[name="tools"]:checked'), function (i) { return i.value; });
    var checkedPl = Array.prototype.map.call(form.querySelectorAll('input[name="platforms"]:checked'), function (i) { return i.value; });
    tb.innerHTML = TOOLS.map(function (tl) {
      return '<label class="check"><input type="checkbox" name="tools" value="' + tl.id + '"' + (checkedTools.indexOf(tl.id) > -1 ? ' checked' : '') + '><span>' + esc(tl[lang].name) + '</span></label>';
    }).join('');
    pb.innerHTML = PLATFORMS.map(function (p) {
      return '<label class="check"><input type="checkbox" name="platforms" value="' + p.id + '"' + (checkedPl.indexOf(p.id) > -1 ? ' checked' : '') + '><span>' + esc(p[lang]) + '</span></label>';
    }).join('');
  }

  /* ---------- Enquiry form ---------- */
  function initForm() {
    var form = document.getElementById('enquiry-form');
    if (!form) return;
    var status = document.getElementById('form-status');
    var submit = form.querySelector('[type="submit"]');
    var rules = {
      name: function (v) { return v.trim().length >= 2; },
      business: function (v) { return v.trim().length >= 2; },
      country: function (v) { return v.trim().length >= 2; },
      phone: function (v) { var d = v.replace(/[^\d]/g, ''); return /^[+\d\s()\-.]+$/.test(v.trim()) && d.length >= 7 && d.length <= 15; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
    };
    function setErr(name, ok) {
      var input = form.elements[name];
      var err = document.getElementById('err-' + name);
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (err) { err.textContent = ok ? '' : t('f.e.' + name); err.setAttribute('data-err', ok ? '' : name); }
      return ok;
    }
    function validate() {
      var firstBad = null;
      Object.keys(rules).forEach(function (n) {
        var ok = rules[n](form.elements[n].value);
        setErr(n, ok);
        if (!ok && !firstBad) firstBad = form.elements[n];
      });
      if (firstBad) firstBad.focus();
      return !firstBad;
    }
    Object.keys(rules).forEach(function (n) {
      form.elements[n].addEventListener('blur', function () { if (form.elements[n].value) setErr(n, rules[n](form.elements[n].value)); });
      form.elements[n].addEventListener('input', function () { if (form.elements[n].getAttribute('aria-invalid') === 'true' && rules[n](form.elements[n].value)) setErr(n, true); });
    });
    onLang(function () {
      form.querySelectorAll('.err[data-err]').forEach(function (e) { var n = e.getAttribute('data-err'); if (n) e.textContent = t('f.e.' + n); });
      if (status.classList.contains('show')) status.textContent = t(status.getAttribute('data-msg'));
    });
    function showStatus(kind, key) {
      status.className = 'form-status show ' + kind;
      status.setAttribute('data-msg', key);
      status.textContent = t(key);
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) { showStatus('error', 'f.invalid'); return; }
      if (form.elements._gotcha.value) { showStatus('ok', 'f.ok'); form.reset(); return; }
      var vals = function (name) { return Array.prototype.map.call(form.querySelectorAll('input[name="' + name + '"]:checked'), function (i) { return i.value; }); };
      var toolNames = vals('tools').map(function (id) { var tl = toolById(id); return tl ? tl.en.name : id; });
      var plNames = vals('platforms').map(function (id) { for (var i = 0; i < PLATFORMS.length; i++) if (PLATFORMS[i].id === id) return PLATFORMS[i].en; return id; });
      var fd = new FormData();
      fd.append('name', form.elements.name.value.trim());
      fd.append('business', form.elements.business.value.trim());
      fd.append('country', form.elements.country.value.trim());
      fd.append('phone', form.elements.phone.value.trim());
      fd.append('email', form.elements.email.value.trim());
      fd.append('tools', toolNames.join(', ') || '—');
      fd.append('platforms', plNames.join(', ') || '—');
      fd.append('package', form.elements['package'].value || '—');
      fd.append('message', form.elements.message.value.trim());
      fd.append('language', lang);
      fd.append('_subject', 'ZKJ SYSTEM enquiry — ' + form.elements.business.value.trim());
      fd.append('_gotcha', '');
      submit.disabled = true;
      var label = submit.querySelector('span');
      if (label) label.textContent = t('f.sending');
      fetch(FORM_ENDPOINT, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          showStatus('ok', 'f.ok');
          form.reset();
          setContext(null);
          form.querySelectorAll('[aria-invalid]').forEach(function (i) { i.setAttribute('aria-invalid', 'false'); });
        })
        .catch(function () { showStatus('error', 'f.error'); })
        .then(function () { submit.disabled = false; if (label) label.textContent = t('f.submit'); });
    });
  }

  /* ---------- Global wiring ---------- */
  function initCommon() {
    document.addEventListener('click', function (e) {
      var lt = e.target.closest('[data-lang-toggle]');
      if (lt) { e.preventDefault(); setLang(lang === 'ar' ? 'en' : 'ar'); return; }
      var en = e.target.closest('[data-enquire]');
      if (en) {
        var p = en.getAttribute('data-enquire').split(':');
        setContext({ type: p[0], id: p[1] });
        var target = document.getElementById('enquire');
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (history.replaceState) history.replaceState(null, '', '#enquire');
        }
        return;
      }
      var cc = e.target.closest('[data-ctx-clear]');
      if (cc) { e.preventDefault(); setContext(null); return; }
      var menu = e.target.closest('[data-menu]');
      if (menu) {
        var nav = document.getElementById('site-nav');
        var open = nav.classList.toggle('open');
        menu.setAttribute('aria-expanded', open ? 'true' : 'false');
        return;
      }
      if (e.target.closest('#site-nav a')) {
        var n = document.getElementById('site-nav'); n.classList.remove('open');
        var mb = document.querySelector('[data-menu]'); if (mb) mb.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var n = document.getElementById('site-nav');
        if (n && n.classList.contains('open')) { n.classList.remove('open'); var mb = document.querySelector('[data-menu]'); if (mb) { mb.setAttribute('aria-expanded', 'false'); mb.focus(); } }
      }
    });
  }

  function initFromUrl() {
    try {
      var q = new URLSearchParams(window.location.search);
      if (q.get('tool') && toolById(q.get('tool'))) setContext({ type: 'tool', id: q.get('tool') });
      else if (q.get('package') && PACKAGES.indexOf(q.get('package')) > -1) setContext({ type: 'package', id: q.get('package') });
    } catch (e) { /* ignore */ }
  }

  window.ZKJ = {
    t: t, tLang: tLang, extend: extend, esc: esc, onLang: onLang, setLang: setLang, getLang: function () { return lang; },
    toast: toast, waLink: waLink, store: store, TOOLS: TOOLS, PLATFORMS: PLATFORMS, ICONS: ICONS, IG_URL: IG_URL,
    applyLang: applyLang
  };

  function boot() {
    onLang(function () { renderTools(); renderPackages(); renderFormOptions(); });
    initCommon();
    initForm();
    initFromUrl();
    applyLang();
    initFromUrl(); // re-apply after checkboxes render
    if (window.location.hash === '#enquire' && document.getElementById('enquire')) {
      setTimeout(function () { document.getElementById('enquire').scrollIntoView(); }, 60);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
