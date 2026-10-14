/* ZKJ SYSTEM — shared script: i18n (EN/AR + RTL), tool catalogue, enquiries. Vanilla JS, no build step. */
(function () {
  'use strict';

  var WA_NUMBER = '971541668700';
  var IG_URL = 'https://instagram.com/zkjsystem';
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
    audit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/><path d="M8 12v-2M10.5 12V8M13 12v-3"/></svg>',
    inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h12v8H9l-4 3v-3H4z"/><path d="M16 9h4v8h-1v3l-4-3h-4v-2"/></svg>',
    whatsappTool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1112 20a8 8 0 01-4.1-1.1z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a3.5 3.5 0 01-1.8-1.8l.8-1-1-2z"/></svg>',
    smm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10v4h3l7 5V5L6 10z"/><path d="M17 9a4 4 0 010 6M19.5 6.5a7.5 7.5 0 010 11"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="3.5"/><path d="M10 9l5 3-5 3z"/></svg>',
    google: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0112 3.5 6.5 6.5 0 0118.5 10c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    dialect: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11h-9l-4 3.5V16H4z"/><path d="M8 9.5c1.2-1.1 2.2 1.1 3.5 0s2.3 1.1 3.5 0"/><path d="M8 12.5h5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l4 4 10-10"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.56 2 2.1 6.45 2.1 11.93c0 1.75.46 3.46 1.33 4.97L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.47 0 9.93-4.45 9.93-9.93A9.86 9.86 0 0012.04 2zm0 18.15h-.01a8.25 8.25 0 01-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 01-1.26-4.36c0-4.55 3.71-8.25 8.27-8.25 2.2 0 4.28.86 5.84 2.42a8.2 8.2 0 012.42 5.84c0 4.55-3.71 8.21-8.27 8.21zm4.53-6.16c-.25-.12-1.47-.72-1.7-.8-.23-.09-.39-.13-.56.12-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.29z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 7l9 6 9-6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  /* ---------- Tool catalogue (14 tools in 5 groups) ---------- */
  var GROUPS = [
    { id: 'brand', code: 'G-01', en: { name: 'Brand', d: 'Know where you stand, then look the part everywhere.' }, ar: { name: 'الهوية', d: 'اعرف موقعك في السوق، ثم اظهر بهوية واحدة في كل مكان.' } },
    { id: 'content', code: 'G-02', en: { name: 'Content', d: 'Your own footage, edited into content that performs.' }, ar: { name: 'المحتوى', d: 'موادك الحقيقية، محرَّرة إلى محتوى يحقق نتائج.' } },
    { id: 'engage', code: 'G-03', en: { name: 'Engage & Sell', d: 'Publish, reply and take orders — through official platform APIs.' }, ar: { name: 'التفاعل والمبيعات', d: 'انشر، ورُد، واستقبل الطلبات — عبر الواجهات الرسمية للمنصات.' } },
    { id: 'grow', code: 'G-04', en: { name: 'Grow', d: 'Campaigns, channels and reports that bring new customers.' }, ar: { name: 'النمو', d: 'حملات وقنوات وتقارير تجلب لك عملاء جدد.' } },
    { id: 'build', code: 'G-05', en: { name: 'Build & Protect', d: 'Engineering-grade visuals, drawings and security.' }, ar: { name: 'البناء والحماية', d: 'تصورات ورسومات بمعايير هندسية، وأمان لحساباتك.' } }
  ];

  var TOOLS = [
    { id: 'brand', group: 'brand', code: 'T-01', icon: ICONS.brand,
      en: { name: 'Brand Kit Builder', tag: 'A complete, consistent identity before the first post goes out.',
        desc: 'Everything your brand needs to look and sound like itself on every channel — documented so your team can follow it.',
        points: ['Logo direction and colour palette', 'Typography and brand voice', 'Bilingual Arabic / English taglines', 'Social templates + brand guideline document'] },
      ar: { name: 'باني هوية العلامة', tag: 'هوية متكاملة ومتّسقة قبل أن يُنشر أول منشور.',
        desc: 'كل ما تحتاجه علامتك لتظهر بشكلها وصوتها الحقيقي على كل منصة — موثّق ليلتزم به فريقك بسهولة.',
        points: ['اتجاه الشعار ولوحة الألوان', 'الخطوط ونبرة العلامة', 'شعارات نصية بالعربية والإنجليزية', 'قوالب سوشال ميديا ودليل هوية متكامل'] } },
    { id: 'audit', group: 'brand', code: 'T-02', icon: ICONS.audit,
      en: { name: 'Brand & Market Audit', tag: 'An honest digital study of your business — next to your competitors.',
        desc: 'A clear look at how you show up online today compared with the businesses you compete with, and where the quickest wins are.',
        points: ['Social accounts, website and app reviewed', 'Colours, voice and visuals vs competitors', 'Gaps in content, channels and offers', 'Prioritised list of opportunities'] },
      ar: { name: 'تدقيق العلامة والسوق', tag: 'دراسة رقمية صريحة لنشاطك — بجانب منافسيك.',
        desc: 'نظرة واضحة على ظهورك الرقمي اليوم مقارنة بمنافسيك، وأين توجد أسرع المكاسب.',
        points: ['مراجعة حسابات السوشال والموقع والتطبيق', 'الألوان والنبرة والصور مقارنة بالمنافسين', 'الفجوات في المحتوى والقنوات والعروض', 'قائمة فرص مرتبة حسب الأولوية'] } },
    { id: 'content', group: 'content', code: 'T-03', icon: ICONS.content,
      en: { name: 'Content Studio', tag: 'Your real photos and videos, edited into content that looks like you.',
        desc: 'It always starts by asking for your own product photos and videos, then edits them professionally. Visuals are generated only where footage is missing.',
        points: ['Posts, carousels, reels and stories', 'Animated video covers', '3D “location reveal” videos — your building rising from the map', 'Cuts, captions, motion text, music, colour grade, brand overlays', 'Captions in Arabic and English'] },
      ar: { name: 'استوديو المحتوى', tag: 'صورك وفيديوهاتك الحقيقية، تتحوّل إلى محتوى يشبهك.',
        desc: 'يبدأ دائمًا بطلب صور وفيديوهات منتجاتك، ثم يحرّرها باحتراف. ولا يُولّد صورًا إلا عندما لا تتوفّر مواد مصوّرة.',
        points: ['منشورات وكاروسيل وريلز وستوري', 'أغلفة فيديو متحركة', 'فيديوهات «كشف الموقع» ثلاثية الأبعاد — مبناك يرتفع من الخريطة', 'قصّ وتعليقات ونصوص متحركة وموسيقى ومعالجة ألوان بهوية علامتك', 'تعليقات بالعربية والإنجليزية'] } },
    { id: 'publisher', group: 'engage', code: 'T-04', icon: ICONS.publisher,
      en: { name: 'Social Media Publisher', tag: 'Seven platforms, one calendar — and nothing posts without your approval.',
        desc: 'Approved content is scheduled and published through each platform’s official API, from one shared content calendar — safe for your accounts.',
        points: ['Instagram, Facebook, TikTok, YouTube', 'Pinterest, X and LinkedIn', 'Official platform APIs only', 'Approve or request changes before anything goes live'] },
      ar: { name: 'ناشر السوشال ميديا', tag: 'سبع منصات في تقويم واحد — ولا شيء يُنشر بدون موافقتك.',
        desc: 'يُجدول المحتوى المعتمد ويُنشر عبر الواجهة الرسمية (API) لكل منصة، من تقويم محتوى واحد — بأمان تام لحساباتك.',
        points: ['إنستغرام، فيسبوك، تيك توك، يوتيوب', 'بنترست، إكس ولينكدإن', 'عبر الواجهات الرسمية للمنصات فقط', 'وافق أو اطلب تعديل قبل أي نشر'] } },
    { id: 'inbox', group: 'engage', code: 'T-05', icon: ICONS.inbox,
      en: { name: 'Inbox & Comments AI', tag: 'Every comment and DM answered in your brand voice.',
        desc: 'Replies to comments and direct messages on Instagram, Facebook, TikTok and YouTube through their official APIs. Questions you’ve approved answers for are handled automatically; anything sensitive comes straight to you.',
        points: ['Comments and DMs on Instagram, Facebook, TikTok, YouTube', 'Replies in your brand voice, Arabic or English', 'Approved FAQs answered automatically', 'Complaints and sensitive messages escalated to you'] },
      ar: { name: 'الرد الذكي على التعليقات والرسائل', tag: 'كل تعليق ورسالة يُرد عليها بنبرة علامتك.',
        desc: 'يرد على التعليقات والرسائل الخاصة في إنستغرام وفيسبوك وتيك توك ويوتيوب عبر واجهاتها الرسمية. الأسئلة التي اعتمدت إجاباتها يُرد عليها تلقائيًا، وأي رسالة حساسة تصلك مباشرة.',
        points: ['تعليقات ورسائل إنستغرام وفيسبوك وتيك توك ويوتيوب', 'ردود بنبرة علامتك بالعربية أو الإنجليزية', 'الأسئلة المتكررة المعتمدة يُرد عليها تلقائيًا', 'الشكاوى والرسائل الحساسة تُحوَّل إليك'] } },
    { id: 'whatsapp', group: 'engage', code: 'T-06', icon: ICONS.whatsappTool,
      en: { name: 'WhatsApp AI Assistant', tag: 'Instant answers on WhatsApp, 24/7 — with a human one tap away.',
        desc: 'Runs on the official WhatsApp Business Platform: answers questions, shares your catalogue and takes orders or bookings, then hands over to your team whenever needed.',
        points: ['Instant replies, day and night', 'Product catalogue, orders and bookings', 'Broadcasts only to customers who opted in', 'Handover to a human at any point'] },
      ar: { name: 'مساعد واتساب الذكي', tag: 'ردود فورية على واتساب على مدار الساعة — وموظفك على بُعد ضغطة.',
        desc: 'يعمل عبر منصة واتساب للأعمال الرسمية (WhatsApp Business Platform): يجاوب الأسئلة، ويعرض الكتالوج، ويستقبل الطلبات والحجوزات، ويحوّل المحادثة لفريقك متى ما احتجت.',
        points: ['ردود فورية ليلًا ونهارًا', 'كتالوج المنتجات والطلبات والحجوزات', 'رسائل جماعية فقط لمن وافق على استقبالها', 'تحويل المحادثة لموظف في أي لحظة'] } },
    { id: 'smm', group: 'grow', code: 'T-07', icon: ICONS.smm,
      en: { name: 'Social Media Marketing', tag: 'Strategy, campaigns and paid ads that reach the right people.',
        desc: 'Plans your campaigns and runs paid ads on Meta (Instagram and Facebook), TikTok and Snapchat, with clear targets and weekly results. Your ad budget is paid by you directly to the platform.',
        points: ['Channel strategy and campaign plan', 'Paid ads on Meta, TikTok and Snapchat', 'Audiences, creatives and A/B tests', 'Spend vs budget visible in your dashboard'] },
      ar: { name: 'التسويق عبر السوشال ميديا', tag: 'استراتيجية وحملات وإعلانات مدفوعة تصل للناس الصح.',
        desc: 'يخطط حملاتك ويدير إعلاناتك المدفوعة على ميتا (إنستغرام وفيسبوك) وتيك توك وسناب شات، بأهداف واضحة ونتائج أسبوعية. ميزانية الإعلانات تدفعها أنت مباشرة للمنصة.',
        points: ['استراتيجية القنوات وخطة الحملات', 'إعلانات مدفوعة على ميتا وتيك توك وسناب شات', 'الجمهور والتصاميم واختبارات A/B', 'الصرف مقابل الميزانية واضح في لوحتك'] } },
    { id: 'youtube', group: 'grow', code: 'T-08', icon: ICONS.youtube,
      en: { name: 'YouTube Growth', tag: 'A channel that works for you — Shorts, long videos and ads.',
        desc: 'Sets up and grows your YouTube channel: Shorts and long videos from your footage, titles and SEO, thumbnails, and YouTube ads.',
        points: ['Channel setup and branding', 'Shorts + long-form videos', 'Titles, descriptions, SEO and thumbnails', 'YouTube ads'] },
      ar: { name: 'نمو يوتيوب', tag: 'قناة تشتغل لصالحك — شورتس وفيديوهات طويلة وإعلانات.',
        desc: 'يجهّز قناتك على يوتيوب وينمّيها: شورتس وفيديوهات طويلة من موادك، عناوين وتحسين بحث، صور مصغّرة، وإعلانات يوتيوب.',
        points: ['إعداد القناة وهويتها', 'شورتس وفيديوهات طويلة', 'العناوين والأوصاف والـSEO والصور المصغّرة', 'إعلانات يوتيوب'] } },
    { id: 'google', group: 'grow', code: 'T-09', icon: ICONS.google,
      en: { name: 'Google Ads & Marketing', tag: 'Be found the moment someone searches for what you sell.',
        desc: 'Search and Performance Max campaigns, YouTube ads, your Google Business Profile and local SEO — so nearby customers find you, call you and visit.',
        points: ['Google Search and Performance Max', 'YouTube ads', 'Google Business Profile management', 'Local SEO and map visibility'] },
      ar: { name: 'إعلانات وتسويق جوجل', tag: 'خلّ العميل يلقاك لحظة ما يبحث عن اللي تبيعه.',
        desc: 'حملات البحث وPerformance Max، إعلانات يوتيوب، ملفك التجاري على جوجل (Google Business Profile) والـSEO المحلي — حتى يلقاك العملاء القريبون ويتصلون ويزورونك.',
        points: ['حملات بحث جوجل وPerformance Max', 'إعلانات يوتيوب', 'إدارة ملفك التجاري على جوجل', 'SEO محلي وظهور على الخرائط'] } },
    { id: 'insights', group: 'grow', code: 'T-10', icon: ICONS.insights,
      en: { name: 'Insights & Reports', tag: 'Every week: what worked, and what to post next.',
        desc: 'A weekly report across all your channels and campaigns that turns numbers into decisions — with clear recommendations for next week.',
        points: ['Reach and engagement by platform', 'Best and weakest posts of the week', 'Ad results vs budget', 'What to post next, and when'] },
      ar: { name: 'التحليلات والتقارير', tag: 'كل أسبوع: ما الذي نجح، وماذا تنشر بعده.',
        desc: 'تقرير أسبوعي لكل منصاتك وحملاتك يحوّل الأرقام إلى قرارات — مع توصيات واضحة للأسبوع القادم.',
        points: ['الوصول والتفاعل لكل منصة', 'أفضل وأضعف منشورات الأسبوع', 'نتائج الإعلانات مقابل الميزانية', 'ماذا تنشر بعد ذلك ومتى'] } },
    { id: 'builder3d', group: 'build', code: 'T-11', icon: ICONS.builder3d,
      en: { name: '3D Builder', tag: 'See the space or product in 3D before it exists.',
        desc: 'Clear 3D visualisation of interiors, shopfronts, displays and products — built on a tool ZKJ VERSE has tested on its own projects.',
        points: ['Spaces, fit-outs and shopfronts', 'Products and displays', 'Stills ready for social and proposals', 'Iterate on layout and materials'] },
      ar: { name: 'مُنشئ الثلاثي الأبعاد', tag: 'شاهد المكان أو المنتج بالأبعاد الثلاثية قبل تنفيذه.',
        desc: 'تصوّر ثلاثي الأبعاد واضح للمساحات الداخلية والواجهات وأماكن العرض والمنتجات — مبني على أداة جرّبتها ZKJ VERSE في مشاريعها.',
        points: ['مساحات وتشطيبات وواجهات محلات', 'منتجات وأماكن عرض', 'صور جاهزة للسوشال والعروض', 'تعديلات على التوزيع والخامات'] } },
    { id: 'drawings', group: 'build', code: 'T-12', icon: ICONS.drawings,
      en: { name: '2D Engineering Drawings Agent', tag: 'Technical drawings in Arabic and English, with dimensions that read right.',
        desc: 'Plans, sections and schedules prepared bilingually, with correct right-to-left dimensions and labels — made to an engineer’s standards.',
        points: ['Plans, sections and elevations', 'Door, finish and equipment schedules', 'Correct RTL dimensions and labels', 'Arabic / English title blocks'] },
      ar: { name: 'وكيل الرسومات الهندسية ثنائية الأبعاد', tag: 'رسومات فنية بالعربية والإنجليزية، بأبعاد تُقرأ صح.',
        desc: 'مخططات ومقاطع وجداول ثنائية اللغة، مع أبعاد وتسميات صحيحة من اليمين إلى اليسار — بمعايير هندسية.',
        points: ['مخططات ومقاطع وواجهات', 'جداول الأبواب والتشطيبات والمعدات', 'أبعاد وتسميات صحيحة من اليمين لليسار', 'إطارات عنوان بالعربية والإنجليزية'] } },
    { id: 'security', group: 'build', code: 'T-13', icon: ICONS.security,
      en: { name: 'Security Agent', tag: 'Find the weak spots before someone else does.',
        desc: 'Reviews your website, social accounts and code for security issues, then gives you a plain-language fix list, ordered by risk.',
        points: ['Website and booking-page checks', 'Account access and two-step login review', 'Code review for common issues', 'Plain-language fix list by priority'] },
      ar: { name: 'وكيل الأمان', tag: 'اكتشف نقاط الضعف قبل أن يكتشفها غيرك.',
        desc: 'يراجع موقعك وحساباتك على السوشال والكود بحثًا عن مشاكل أمنية، ثم يعطيك قائمة إصلاحات بلغة واضحة مرتبة حسب الخطورة.',
        points: ['فحص الموقع وصفحات الحجز', 'مراجعة صلاحيات الحسابات والتحقق بخطوتين', 'مراجعة الكود للمشاكل الشائعة', 'قائمة إصلاحات واضحة حسب الأولوية'] } },
    { id: 'dialect', group: 'content', code: 'T-14', icon: ICONS.dialect, demo: true,
      en: { name: 'Arabic Dialect Writer', badge: 'New · Beta', tag: 'Copy that sounds like your customers talk.',
        desc: 'Writes posts, captions, ads and customer replies in the Arabic your customers really speak — Gulf, Egyptian, Levantine, Iraqi or Moroccan — and in French for North Africa. It keeps your brand voice, uses only facts you gave us, and you approve every line.',
        points: ['Gulf, Egyptian, Levantine, Iraqi and Moroccan Arabic', 'Modern Standard Arabic and North-African French', 'Your brand voice, your real facts — nothing invented', 'Side-by-side versions to choose from, approved before use'] },
      ar: { name: 'كاتب اللهجات العربية', badge: 'جديد · تجريبي', tag: 'نصوص تشبه كلام عملائك.',
        desc: 'يكتب المنشورات والتعليقات والإعلانات وردود العملاء بالعربية التي يتكلمها عملاؤك فعلًا — خليجي أو مصري أو شامي أو عراقي أو مغربي — وبالفرنسية لشمال أفريقيا. يحافظ على نبرة علامتك، ولا يستخدم إلا المعلومات التي أعطيتنا إياها، وأنت تعتمد كل سطر.',
        points: ['لهجات خليجية ومصرية وشامية وعراقية ومغربية', 'العربية الفصحى المبسطة والفرنسية لشمال أفريقيا', 'نبرة علامتك ومعلوماتك الحقيقية — بلا أي إضافات من عندنا', 'نسخ جنبًا إلى جنب لتختار منها، وتُعتمد قبل أي استخدام'] } }
  ];
  /* ---------- Coming next (not built yet — shown honestly, not counted in the 14) ---------- */
  var COMING = [
    { id: 'proof', icon: ICONS.check,
      en: { name: 'Arabic Proofreader & Rewriter', d: 'Fix spelling and grammar, and polish your Arabic text in seconds.' },
      ar: { name: 'المدقّق والمُعيد صياغة بالعربية', d: 'صحّح الإملاء والنحو، وحسّن نصّك العربي في ثوانٍ.' } },
    { id: 'docs', icon: ICONS.mail,
      en: { name: 'Business Documents AI', d: 'Official letters, quotes and proposals in Arabic and English, ready to send.' },
      ar: { name: 'مستندات الأعمال بالذكاء الاصطناعي', d: 'خطابات رسمية وعروض أسعار ومقترحات بالعربية والإنجليزية، جاهزة للإرسال.' } },
    { id: 'store', icon: ICONS.smm,
      en: { name: 'Online Store Assistant', d: 'Product descriptions in three languages, and answers for shoppers around the clock.' },
      ar: { name: 'مساعد المتجر الإلكتروني', d: 'أوصاف منتجات بثلاث لغات، وردود لمتسوقيك على مدار الساعة.' } }
  ];
  var DIALECTS = [
    { id: 'msa', en: 'Standard', ar: 'الفصحى', line: 'الطلبات مفتوحة الآن، ونوصّلها إلى باب منزلك.' },
    { id: 'gulf', en: 'Gulf', ar: 'خليجي', line: 'الطلبات مفتوحة الحين، ونوصّلها لين باب بيتك.' },
    { id: 'egypt', en: 'Egyptian', ar: 'مصري', line: 'الطلبات اتفتحت دلوقتي، وبنوصّلها لحد باب بيتك.' },
    { id: 'levant', en: 'Levantine', ar: 'شامي', line: 'الطلبات صارت مفتوحة هلّق، وبنوصّلها لحد باب بيتك.' },
    { id: 'iraq', en: 'Iraqi', ar: 'عراقي', line: 'الطلبات مفتوحة هسّه، ونوصّلها لباب بيتكم.' },
    { id: 'morocco', en: 'Moroccan', ar: 'مغربي', line: 'الطلبات مفتوحة دابا، وكنوصلوها حتى لباب الدار.' },
    { id: 'french', en: 'French (N. Africa)', ar: 'فرنسي (شمال أفريقيا)', line: 'Les commandes sont ouvertes, livraison jusqu’à votre porte.', fr: true }
  ];

  TOOLS.forEach(function (tl, i) { tl.code = 'T-' + (i < 9 ? '0' : '') + (i + 1); });

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
  var FORM_EXTRA_PLATFORMS = [
    { id: 'snapchat', en: 'Snapchat', ar: 'سناب شات' },
    { id: 'whatsapp', en: 'WhatsApp', ar: 'واتساب' },
    { id: 'google', en: 'Google Business Profile', ar: 'ملف جوجل التجاري' }
  ];

  /* ---------- Strings ---------- */
  var STR = {
    en: {
      'meta.title': 'ZKJ SYSTEM — 14 AI tools by KJ VISION · ZKJ VERSE',
      'skip': 'Skip to content',
      'nav.story': 'Story',
      'st.eyebrow': 'Our story',
      'st.title': 'Every project becomes a tool.',
      'st.lead': 'ZKJ SYSTEM was never planned as a product. It grew out of building ZKJ VERSE from zero, and every tool here was first tested on our own brands.',
      'st.1.t': 'Starting from zero',
      'st.1.b': 'KJ, a civil engineer and artist in Dubai, spent four months learning Claude and the cloud by building for his own brand. He built around 20 dashboards before the one that went live.',
      'st.2.t': 'The first goal: publish automatically',
      'st.2.b': 'The first goal was simple: social media that publishes itself. While building it, he found much more that could be automated: content, reels, photos and marketing strategy.',
      'st.3.t': 'Mother HQ',
      'st.3.b': 'Every job became a short instruction that does one thing well, so each job made the central system a little smarter.',
      'st.4.t': 'Projects become tools',
      'st.4.b': 'Publishing, the content studio, the 3D world of ZKJ VERSE, and engineering drawings and SketchUp work all ended up as reusable tools that keep improving with real use.',
      'st.5.t': 'Live, 24/7',
      'st.5.b': 'Mother HQ now runs around the clock, with tasks, approvals and notifications on one live dashboard. ZKJ SYSTEM opens the same proven tools to your brand.',
      'st.img.alt': 'Mother HQ, the live 24/7 dashboard that runs ZKJ VERSE. Private details are blurred.',
      'st.img.cap': 'Mother HQ: the live system behind ZKJ VERSE. Private details are blurred.',
      'nav.safe': 'Safety', 'nav.how': 'Journey', 'nav.tools': 'Collection', 'nav.packages': 'Packages', 'nav.demo': 'Live demo', 'nav.faq': 'FAQ', 'nav.enquire': 'Enquire',
      'nav.menu': 'Open menu', 'lang.switch': 'Switch language to Arabic',
      'hero.eyebrow': 'ZKJ VERSE · Where Engineering Meets Light',
      'hero.title': 'AI tools that run your brand’s content — <span class="hl">and show you every step.</span>',
      'hero.lead': 'ZKJ SYSTEM is a set of 14 AI tools built by ZKJ VERSE. Send a short brief and your own photos and videos — the tools build your brand, edit your content, publish and reply through official platform APIs with your approval, run your campaigns and tell you what worked. All inside a live dashboard in your logo and colours.',
      'hero.cta.wa': 'Enquire on WhatsApp', 'hero.cta.demo': 'See a live dashboard',
      'hero.f1': 'AI tools', 'hero.f2': 'platforms published', 'hero.f3': 'languages — Arabic & English', 'hero.f4': 'posts go live without your approval',
      'mock.client': 'Your brand here', 'mock.demo': 'Live demo',
      'mock.r1': 'Content Studio', 'mock.r1s': '2 reels and 1 story in edit from your footage',
      'mock.r2': 'Social Media Publisher', 'mock.r2s': '3 posts waiting for your approval',
      'mock.r3': 'Insights & Reports', 'mock.r3s': 'Weekly report ready',
      'mock.r4': 'Inbox & Comments AI', 'mock.r4s': '4 suggested replies to review',
      'mock.foot1': 'Your logo · your colours', 'mock.foot2': 'EN / AR',
      'aud.label': 'Built for businesses across the Arab world:',
      'aud.1': 'Restaurants', 'aud.2': 'Cafés', 'aud.3': 'Gyms', 'aud.4': 'Retail', 'aud.5': 'Real estate', 'aud.6': 'E-commerce', 'aud.7': 'Brands',
      'how.eyebrow': 'The Journey', 'how.title': 'From first message to a live dashboard', 'how.sub': 'How it works, in three acts.',
      'how.1.t': 'Enquire', 'how.1.d': 'Tell us about your business on WhatsApp, Instagram or the form below. KJ replies personally.',
      'how.2.t': 'Brief + your photos & videos', 'how.2.d': 'A short brief on your brand, audience and goals — plus your own product photos and videos, if you have them.',
      'how.3.t': 'Tools start', 'how.3.d': 'KJ sets up the tools you chose. Content is edited from your real footage first; anything missing is generated in your style.',
      'how.4.t': 'Your live branded dashboard', 'how.4.d': 'Notifications, content, approvals and publishing in one place — in your logo and colours, in Arabic or English.',
      'tools.eyebrow': 'The Collection', 'tools.title': '14 tools. Five groups. One system.', 'tools.sub': 'Brand, Content, Engage & Sell, Grow, Build & Protect. Start with one tool or run them all — every tool reports into the same dashboard, so you always know what’s done and what needs you.',
      'tools.cta': 'Enquire about this tool',
      'soon.title': 'Coming next', 'soon.sub': 'Not built yet. Tell us which one you want first and it moves up the list.', 'soon.tag': 'coming next', 'soon.cta': 'I want this first',
      'dia.label': 'Same message, five dialects', 'dia.msg': 'Orders are open now — we deliver to your door.', 'dia.note': 'Beta — a sample, not a promise for every phrase. You approve every line before it is used.',
      'pk.eyebrow': 'Packages', 'pk.title': 'Packages by channel', 'pk.sub': 'Every package includes Content Studio, Social Media Publisher, Insights & Reports and your live branded dashboard. Pricing is shared with you personally after your brief.',
      'pk.starter.name': 'Starter', 'pk.starter.reach': '1–2 platforms', 'pk.starter.d': 'For a focused start on the channels where your customers already are.',
      'pk.growth.name': 'Growth', 'pk.growth.reach': '3–4 platforms', 'pk.growth.d': 'For businesses ready to show up consistently on more channels — and answer every comment and DM.',
      'pk.full.name': 'Full', 'pk.full.reach': 'All 7 platforms + Brand Kit, ads & WhatsApp AI', 'pk.full.d': 'The complete system: a full brand kit, every channel, paid campaigns and a WhatsApp assistant that takes orders around the clock.',
      'pk.i1': 'Content edited from your own photos & videos', 'pk.i2': 'Approval before anything is published', 'pk.i3': 'Weekly insights report', 'pk.i4': 'Live branded dashboard (EN / AR)',
      'pk.i5': 'Brand Kit Builder included', 'pk.i6': 'Content calendar across all channels',
      'pk.cta': 'Enquire about {name}',
      'pk.note': 'Add Brand & Market Audit, YouTube Growth, Google Ads & Marketing, 3D Builder, 2D Engineering Drawings or the Security Agent to any package — or use them on their own. Ad budgets are paid by you directly to each platform.',
      'demo.eyebrow': 'Live demo', 'demo.title': 'See your dashboard before you start', 'demo.sub': 'Click through a working demo with a sample café brand: approve posts, check the calendar, upload media and switch themes. No login needed.', 'demo.cta': 'Open the live demo',
      'faq.eyebrow': 'FAQ', 'faq.title': 'Questions, answered',
      'faq.1.q': 'Is ZKJ SYSTEM a service or a product?', 'faq.1.a': 'A product. ZKJ SYSTEM is a set of AI tools sold by ZKJ VERSE. KJ sets up your tools from your brief and your media, and you follow everything in your own branded dashboard.',
      'faq.2.q': 'Do I have to send my own photos and videos?', 'faq.2.a': 'It’s the first thing we ask for — your real products, space and people perform best. If you don’t have footage yet, Content Studio generates visuals in your brand style, and those posts are clearly marked in your dashboard.',
      'faq.3.q': 'Will anything be posted or sent without my approval?', 'faq.3.a': 'No. Every post, carousel, reel and story waits in your approvals queue. Comment, DM and WhatsApp replies follow answers and rules you have approved; anything new or sensitive waits for you or is escalated to you.',
      'faq.4.q': 'Which platforms do you publish to?', 'faq.4.a': 'We publish to Instagram, Facebook, TikTok, YouTube, Pinterest, X and LinkedIn; run ads on Meta, TikTok, Snapchat and Google; and answer customers on WhatsApp. Your package decides where you start.',
      'faq.5.q': 'Does it work in Arabic and English?', 'faq.5.a': 'Yes. Captions, your dashboard and your reports are available in Arabic and English, with a proper right-to-left layout in Arabic.',
      'faq.6.q': 'How do pricing and payment work?', 'faq.6.a': 'There is no checkout on this site. Send an enquiry and KJ replies personally with a proposal for the tools you chose, and arranges payment with you directly.',
      'faq.8.q': 'Is it safe for my accounts?', 'faq.8.a': 'Yes. Publishing, comment and DM replies and WhatsApp run only through the platforms’ official APIs and business tools — Meta, TikTok, YouTube, Google and the WhatsApp Business Platform. No unofficial bots or workarounds, and you can remove access at any time.',
      'faq.9.q': 'Is the ad budget included?', 'faq.9.a': 'No — the ad budget is paid by you directly to the platform (Meta, TikTok, Snapchat or Google). ZKJ SYSTEM plans and manages the campaigns, and you see spend against budget in your dashboard.',
      'safe.eyebrow': 'Safe by design', 'safe.title': 'Official channels only. Your approval first.', 'safe.sub': 'Your accounts are your business. ZKJ SYSTEM works with them the way the platforms intend.',
      'safe.1.t': 'Official platform APIs', 'safe.1.d': 'Publishing, comment and DM replies and WhatsApp run through the official APIs and business tools of Meta, TikTok, YouTube, Google and the WhatsApp Business Platform — safe for your accounts.',
      'safe.2.t': 'Nothing goes out without approval', 'safe.2.d': 'Posts wait in your approvals queue. Replies follow answers and rules you’ve approved, and anything sensitive is escalated to you.',
      'safe.3.t': 'You stay the owner', 'safe.3.d': 'Pages, channels and ad accounts stay in your name. Access is granted through each platform’s official permissions and you can remove it at any time.',
      'safe.4.t': 'Ad budget goes to the platform', 'safe.4.d': 'Your ad budget is paid by you directly to Meta, TikTok, Snapchat or Google. You see every campaign’s spend against budget.',
      'pk.i7': 'Inbox & Comments AI replies', 'pk.i8': 'Social Media Marketing — paid ads on Meta, TikTok & Snapchat', 'pk.i9': 'WhatsApp AI Assistant',
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
      'ft.line': 'Every project becomes a tool.',
      'ft.product': 'Product', 'ft.contact': 'Contact', 'ft.copy': '© {year} ZKJ VERSE. ZKJ SYSTEM is a product of ZKJ VERSE.',
      'ft.demo': 'Live demo dashboard', 'ft.login': 'Client login',
      'nf.title.doc': 'Page not found — ZKJ SYSTEM', 'nf.title': 'This page doesn’t exist', 'nf.sub': 'The link may be old or mistyped. Let’s get you back on track.', 'nf.home': 'Back to home', 'nf.demo': 'Open the live demo',
      'nav.gallery': 'Gallery',
      'hero.label': '◆ Every project becomes a tool.',
      'hero.sub': '14 AI tools. One living dashboard. Your brand, made visible.',
      'hero.cta.enter': 'Enter the system',
      'hero.scroll': 'Scroll',
      'intro.title': 'About ZKJ SYSTEM',
      'gal.eyebrow': 'The Gallery',
      'gal.title': 'Selected works — light, city and signal',
      'gal.sub': 'Photographs of Dubai by KJ VISION, digital art from ZKJ VERSE and the neon architecture of ZKJ SYSTEM. The same eye for light and precision shapes every tool in the system.',
      'gal.quote': 'Light is not illumination. It is energy.',
      'gal.hint': 'Move to light the room · Select a work to view it',
      'gal.handed': 'Hand-edited light work',
      'gal.prev': 'Previous',
      'gal.next': 'Next',
      'gal.close': 'Close',
      'gal.view': 'View {title}',
      'gal.count': 'Work {n} of {total}',
      'ex.cta': 'Enquire',
      'ex.room': 'Room {n}',
      'act.1.era': 'Past · Act I',
      'act.1.t': 'Enquire, and bring your light',
      'act.1.d': 'Every system begins with what is already yours — your story, your space, your people.',
      'act.1.cap': 'Step one · The brand audit',
      'act.2.era': 'Present · Act II',
      'act.2.t': 'The tools run. You approve.',
      'act.2.d': 'Your tools work in the background and report into one dashboard. Nothing reaches your audience until you say so.',
      'act.2.cap': 'Approve · Request changes',
      'act.3.era': 'Future · Act III',
      'act.3.t': 'Your brand, live on every channel',
      'act.3.d': 'Published, answered and measured — consistently, in Arabic and English.',
      'act.3.l2': 'Posts, replies, WhatsApp and campaigns run through the platforms’ official APIs, and every week you see what worked.',
      'act.3.cap': 'Live dashboard · 24/7',
      'world.eyebrow': 'See it in your world',
      'world.title': 'Art and brand, living together',
      'world.sub': 'One of KJ’s works on your wall, your newest post on your customer’s screen. Choose a space.',
      'world.tabs': 'Spaces',
      'world.cafe': 'Café',
      'world.hotel': 'Hotel lobby',
      'world.office': 'Office',
      'world.likes': 'likes',
      'world.cafe.post': 'Autumn menu, poured slowly',
      'world.cafe.cap': 'New season. Same slow ritual.',
      'world.cafe.scene': '“Gold Run” above the counter — beside the café’s latest post.',
      'world.hotel.post': 'Check in to the quiet hour',
      'world.hotel.cap': 'The lobby, after sunset.',
      'world.hotel.scene': '“Burj, Blue Hour” in the lobby — beside the hotel’s evening post.',
      'world.office.post': 'Precision is a kind of light',
      'world.office.cap': 'Drawings, delivered in two languages.',
      'world.office.scene': '“Signal Tunnel” in the studio — beside the firm’s latest post.',
      'ft.presented': 'ZKJ SYSTEM — by KJ VISION · ZKJ VERSE',
      'ft.by': 'ZKJ SYSTEM — by',
      'sc.eyebrow': 'The tools at work',
      'sc.title': 'Case study: KJ VISION',
      'sc.sub': 'Six steps, one real brand. Watch the system take KJ VISION from identity to live channels.',
      'sc.prev': 'Previous step',
      'sc.next': 'Next step',
      'sc.pause': 'Pause walkthrough',
      'sc.play': 'Play walkthrough',
      'sc.step': 'Step {n}: {title}',
      'sc.k.logo': 'Logo',
      'sc.k.palette': 'Palette',
      'sc.k.type': 'Typography',
      'sc.k.voice': 'Voice',
      'sc.voice': 'Precise · Mystical · Premium',
      'sc.bk.note': 'Brand-kit preview — final files follow',
      'sc.profile': 'Photography & digital art',
      'sc.connected': 'Connected · official API',
      'sc.f.post': 'Post',
      'sc.f.carousel': 'Carousel',
      'sc.f.reel': 'Reel',
      'sc.f.story': 'Story',
      'sc.ap.0': 'Night Moon — reel',
      'sc.ap.1': 'Kaleidoscope — carousel',
      'sc.ap.2': 'Gold Run — story',
      'sc.approve': 'Approve',
      'sc.changes': 'Request changes',
      'sc.approved': 'Approved',
      'sc.days': 'Sun,Mon,Tue,Wed,Thu,Fri,Sat',
      'sc.published': 'Published',
      'sc.comment': 'Is this piece available as a print?',
      'sc.suggested': 'Suggested reply',
      'sc.reply': 'It is — in limited acrylic and resin editions. I will send you the sizes.',
      'sc.reach': 'Reach · last 7 days',
      'sc.grid.alt': 'Real screenshot of the @zkjverse Instagram grid: editorial posts in gold and white serif on black, architecture photographs and artworks'
    },
    ar: {
      'meta.title': 'ZKJ SYSTEM — 14 أداة ذكاء اصطناعي من KJ VISION · ZKJ VERSE',
      'skip': 'انتقل إلى المحتوى',
      'nav.story': 'القصة',
      'st.eyebrow': 'قصتنا',
      'st.title': 'كل مشروع يصبح أداة.',
      'st.lead': 'لم تبدأ ZKJ SYSTEM كمنتج، بل وُلدت أثناء بناء ZKJ VERSE من الصفر، وكل أداة هنا جُرّبت أولاً على علاماتنا نحن.',
      'st.1.t': 'البداية من الصفر',
      'st.1.b': 'أمضى KJ، المهندس المدني والفنان في دبي، أربعة أشهر يتعلّم Claude والسحابة بالبناء لعلامته الخاصة، وبنى نحو 20 لوحة تحكّم قبل أن تعمل النسخة النهائية.',
      'st.2.t': 'الهدف الأول: نشر تلقائي',
      'st.2.b': 'كان الهدف الأول بسيطاً: حسابات تنشر وحدها. وأثناء العمل ظهر الكثير مما يمكن أتمتته: المحتوى، والريلز، والصور، واستراتيجية التسويق.',
      'st.3.t': 'Mother HQ',
      'st.3.b': 'تحوّلت كل مهمة إلى تعليمة قصيرة تتقن عملاً واحداً، فصار النظام المركزي أذكى قليلاً مع كل مهمة.',
      'st.4.t': 'المشاريع تصبح أدوات',
      'st.4.b': 'النشر، واستوديو المحتوى، وعالم ZKJ VERSE ثلاثي الأبعاد، والرسومات الهندسية وأعمال SketchUp؛ كلها أصبحت أدوات قابلة لإعادة الاستخدام وتتحسّن مع العمل الحقيقي.',
      'st.5.t': 'مباشر على مدار الساعة',
      'st.5.b': 'يعمل Mother HQ اليوم على مدار الساعة: مهام، وموافقات، وتنبيهات في لوحة واحدة مباشرة. وZKJ SYSTEM تفتح الأدوات نفسها المجرّبة لعلامتك.',
      'st.img.alt': 'Mother HQ، اللوحة المباشرة التي تدير ZKJ VERSE على مدار الساعة. التفاصيل الخاصة مموّهة.',
      'st.img.cap': 'Mother HQ: النظام المباشر خلف ZKJ VERSE. التفاصيل الخاصة مموّهة.',
      'nav.safe': 'الأمان', 'nav.how': 'الرحلة', 'nav.tools': 'المجموعة', 'nav.packages': 'الباقات', 'nav.demo': 'العرض المباشر', 'nav.faq': 'الأسئلة الشائعة', 'nav.enquire': 'استفسر',
      'nav.menu': 'فتح القائمة', 'lang.switch': 'تغيير اللغة إلى الإنجليزية',
      'hero.eyebrow': 'ZKJ VERSE · حيث تلتقي الهندسة بالضوء',
      'hero.title': 'أدوات ذكاء اصطناعي تدير محتوى علامتك — <span class="hl">وتريك كل خطوة.</span>',
      'hero.lead': 'ZKJ SYSTEM مجموعة من 14 أداة ذكاء اصطناعي من تطوير ZKJ VERSE. أرسل موجزًا قصيرًا مع صورك وفيديوهاتك — والأدوات تبني هويتك، وتحرّر محتواك، وتنشر وترد عبر الواجهات الرسمية للمنصات بعد موافقتك، وتدير حملاتك، وتخبرك بما نجح. وكل ذلك داخل لوحة تحكم مباشرة بشعارك وألوانك.',
      'hero.cta.wa': 'تواصل معنا على واتساب', 'hero.cta.demo': 'شاهد لوحة تحكم حيّة',
      'hero.f1': 'أدوات ذكاء اصطناعي', 'hero.f2': 'منصات للنشر', 'hero.f3': 'لغتان — العربية والإنجليزية', 'hero.f4': 'منشورات تُنشر بدون موافقتك',
      'mock.client': 'علامتك هنا', 'mock.demo': 'عرض مباشر',
      'mock.r1': 'استوديو المحتوى', 'mock.r1s': 'ريلزان وستوري قيد التحرير من موادك',
      'mock.r2': 'ناشر السوشال ميديا', 'mock.r2s': '3 منشورات بانتظار موافقتك',
      'mock.r3': 'التحليلات والتقارير', 'mock.r3s': 'التقرير الأسبوعي جاهز',
      'mock.r4': 'الرد الذكي على التعليقات والرسائل', 'mock.r4s': '4 ردود مقترحة للمراجعة',
      'mock.foot1': 'شعارك · ألوانك', 'mock.foot2': 'ع / EN',
      'aud.label': 'مصمَّم للأعمال في أنحاء العالم العربي:',
      'aud.1': 'مطاعم', 'aud.2': 'مقاهي', 'aud.3': 'نوادٍ رياضية', 'aud.4': 'متاجر', 'aud.5': 'عقارات', 'aud.6': 'تجارة إلكترونية', 'aud.7': 'علامات تجارية',
      'how.eyebrow': 'الرحلة', 'how.title': 'من أول رسالة إلى لوحة تحكم مباشرة', 'how.sub': 'كيف يعمل، في ثلاثة فصول.',
      'how.1.t': 'استفسر', 'how.1.d': 'عرّفنا على نشاطك عبر واتساب أو إنستغرام أو النموذج بالأسفل، ويرد عليك KJ شخصيًا.',
      'how.2.t': 'الموجز + صورك وفيديوهاتك', 'how.2.d': 'موجز قصير عن علامتك وجمهورك وأهدافك — مع صور وفيديوهات منتجاتك إن توفّرت.',
      'how.3.t': 'تبدأ الأدوات', 'how.3.d': 'يجهّز KJ الأدوات التي اخترتها. يُحرَّر المحتوى من موادك الحقيقية أولًا، وما ينقص يُولَّد بأسلوب علامتك.',
      'how.4.t': 'لوحتك المباشرة بهويتك', 'how.4.d': 'الإشعارات والمحتوى والموافقات والنشر في مكان واحد — بشعارك وألوانك، بالعربية أو الإنجليزية.',
      'tools.eyebrow': 'المجموعة', 'tools.title': '14 أداة. خمس مجموعات. نظام واحد.', 'tools.sub': 'الهوية، المحتوى، التفاعل والمبيعات، النمو، البناء والحماية. ابدأ بأداة واحدة أو شغّلها كلها — كل أداة ترفع تقاريرها إلى نفس اللوحة، فتعرف دائمًا ما الذي أُنجز وما الذي يحتاجك.',
      'soon.title': 'قريبًا', 'soon.sub': 'لم تُبنَ بعد. أخبرنا أيّها تريد أولًا فيتقدّم في القائمة.', 'soon.tag': 'قريبًا', 'soon.cta': 'أريدها أولًا',
      'dia.label': 'الرسالة نفسها بخمس لهجات', 'dia.msg': 'الطلبات مفتوحة الآن — نوصّل إلى باب بيتك.', 'dia.note': 'نسخة تجريبية — مثال وليس وعدًا بكل عبارة. وأنت تعتمد كل سطر قبل استخدامه.',
      'tools.cta': 'استفسر عن هذه الأداة',
      'pk.eyebrow': 'الباقات', 'pk.title': 'باقات حسب عدد المنصات', 'pk.sub': 'كل باقة تشمل استوديو المحتوى وناشر السوشال ميديا والتحليلات والتقارير ولوحتك المباشرة بهويتك. يُرسل لك التسعير شخصيًا بعد الموجز.',
      'pk.starter.name': 'البداية', 'pk.starter.reach': 'منصة أو منصتان', 'pk.starter.d': 'لبداية مركّزة على المنصات التي يتواجد فيها عملاؤك أصلًا.',
      'pk.growth.name': 'النمو', 'pk.growth.reach': '3–4 منصات', 'pk.growth.d': 'للأعمال الجاهزة للظهور بانتظام على منصات أكثر — والرد على كل تعليق ورسالة.',
      'pk.full.name': 'الكاملة', 'pk.full.reach': 'جميع المنصات السبع + الهوية والإعلانات وواتساب الذكي', 'pk.full.d': 'النظام الكامل: هوية متكاملة، كل المنصات، حملات مدفوعة، ومساعد واتساب يستقبل الطلبات على مدار الساعة.',
      'pk.i1': 'محتوى محرَّر من صورك وفيديوهاتك', 'pk.i2': 'موافقتك قبل أي نشر', 'pk.i3': 'تقرير تحليلات أسبوعي', 'pk.i4': 'لوحة مباشرة بهويتك (عربي / إنجليزي)',
      'pk.i5': 'باني هوية العلامة مشمول', 'pk.i6': 'تقويم محتوى لكل المنصات',
      'pk.cta': 'استفسر عن باقة {name}',
      'pk.note': 'أضف تدقيق العلامة والسوق أو نمو يوتيوب أو إعلانات وتسويق جوجل أو مُنشئ الثلاثي الأبعاد أو الرسومات الهندسية أو وكيل الأمان إلى أي باقة — أو استخدمها بشكل مستقل. ميزانيات الإعلانات تدفعها أنت مباشرة لكل منصة.',
      'demo.eyebrow': 'عرض مباشر', 'demo.title': 'شوف لوحتك قبل ما تبدأ', 'demo.sub': 'جرّب عرضًا تفاعليًا بعلامة مقهى نموذجية: وافق على المنشورات، تصفّح التقويم، ارفع الصور، وبدّل بين الثيمات. بدون تسجيل دخول.', 'demo.cta': 'افتح العرض المباشر',
      'faq.eyebrow': 'الأسئلة الشائعة', 'faq.title': 'أسئلة وإجابات',
      'faq.1.q': 'هل ZKJ SYSTEM خدمة أم منتج؟', 'faq.1.a': 'منتج. ZKJ SYSTEM مجموعة أدوات ذكاء اصطناعي تقدّمها ZKJ VERSE. يجهّز KJ أدواتك من الموجز وموادك، وتتابع أنت كل شيء من لوحتك الخاصة بهويتك.',
      'faq.2.q': 'هل لازم أرسل صوري وفيديوهاتي؟', 'faq.2.a': 'هذا أول ما نطلبه — منتجاتك ومكانك وفريقك الحقيقيون يحققون أفضل النتائج. وإن لم تتوفر لديك مواد بعد، يولّد استوديو المحتوى صورًا بأسلوب علامتك، وتظهر هذه المنشورات معلَّمة بوضوح في لوحتك.',
      'faq.3.q': 'هل يُنشر أو يُرسل أي شيء بدون موافقتي؟', 'faq.3.a': 'لا. كل منشور وكاروسيل وريل وستوري ينتظر في قائمة الموافقات. والردود على التعليقات والرسائل وواتساب تتبع إجابات وقواعد اعتمدتها أنت، وأي رسالة جديدة أو حساسة تنتظرك أو تُحوَّل إليك.',
      'faq.4.q': 'على أي منصات تنشرون؟', 'faq.4.a': 'ننشر على إنستغرام وفيسبوك وتيك توك ويوتيوب وبنترست وإكس ولينكدإن، ونشغّل الإعلانات على ميتا وتيك توك وسناب شات وجوجل، ونرد على عملائك في واتساب. وباقتك تحدد من أين تبدأ.',
      'faq.5.q': 'هل يعمل بالعربية والإنجليزية؟', 'faq.5.a': 'نعم. التعليقات ولوحتك وتقاريرك متاحة بالعربية والإنجليزية، مع اتجاه صحيح من اليمين إلى اليسار بالعربية.',
      'faq.6.q': 'كيف يتم التسعير والدفع؟', 'faq.6.a': 'لا يوجد دفع على هذا الموقع. أرسل استفسارك ويرد عليك KJ شخصيًا بعرض للأدوات التي اخترتها، ويتفق معك على الدفع مباشرة.',
      'faq.8.q': 'هل هذا آمن لحساباتي؟', 'faq.8.a': 'نعم. النشر والرد على التعليقات والرسائل وواتساب تتم فقط عبر الواجهات الرسمية وأدوات الأعمال للمنصات — ميتا وتيك توك ويوتيوب وجوجل ومنصة واتساب للأعمال. بدون أي برامج غير رسمية أو طرق ملتوية، وتقدر تلغي الصلاحية في أي وقت.',
      'faq.9.q': 'هل ميزانية الإعلانات مشمولة؟', 'faq.9.a': 'لا — ميزانية الإعلانات تدفعها أنت مباشرة للمنصة (ميتا أو تيك توك أو سناب شات أو جوجل). ZKJ SYSTEM يخطط الحملات ويديرها، وتشوف الصرف مقابل الميزانية في لوحتك.',
      'safe.eyebrow': 'أمان من الأساس', 'safe.title': 'قنوات رسمية فقط. وموافقتك أولًا.', 'safe.sub': 'حساباتك هي رأس مالك. ZKJ SYSTEM يتعامل معها بالطريقة التي تعتمدها المنصات نفسها.',
      'safe.1.t': 'الواجهات الرسمية للمنصات', 'safe.1.d': 'النشر والرد على التعليقات والرسائل وواتساب تتم عبر الواجهات الرسمية (API) وأدوات الأعمال لميتا وتيك توك ويوتيوب وجوجل ومنصة واتساب للأعمال — بأمان تام لحساباتك.',
      'safe.2.t': 'لا شيء يخرج بدون موافقتك', 'safe.2.d': 'المنشورات تنتظر في قائمة الموافقات. والردود تتبع إجابات وقواعد اعتمدتها، وأي رسالة حساسة تُحوَّل إليك.',
      'safe.3.t': 'تبقى أنت المالك', 'safe.3.d': 'الصفحات والقنوات والحسابات الإعلانية تبقى باسمك. الصلاحيات تُمنح عبر الأذونات الرسمية لكل منصة، وتقدر تلغيها متى ما شئت.',
      'safe.4.t': 'ميزانية الإعلانات للمنصة مباشرة', 'safe.4.d': 'ميزانية الإعلانات تدفعها أنت مباشرة لميتا أو تيك توك أو سناب شات أو جوجل، وتشوف صرف كل حملة مقابل ميزانيتها.',
      'pk.i7': 'ردود ذكية على التعليقات والرسائل', 'pk.i8': 'تسويق السوشال ميديا — إعلانات على ميتا وتيك توك وسناب شات', 'pk.i9': 'مساعد واتساب الذكي',
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
      'ft.line': 'كل مشروع يصبح أداة.',
      'ft.product': 'المنتج', 'ft.contact': 'تواصل', 'ft.copy': '© {year} ZKJ VERSE. ‏ZKJ SYSTEM منتج من ZKJ VERSE.',
      'ft.demo': 'لوحة العرض المباشر', 'ft.login': 'دخول العملاء',
      'nf.title.doc': 'الصفحة غير موجودة — ZKJ SYSTEM', 'nf.title': 'هذه الصفحة غير موجودة', 'nf.sub': 'قد يكون الرابط قديمًا أو مكتوبًا بشكل خاطئ. خلّنا نرجعك للمسار الصحيح.', 'nf.home': 'العودة للرئيسية', 'nf.demo': 'افتح العرض المباشر',
      'nav.gallery': 'المعرض',
      'hero.label': '◆ كل مشروع يصبح أداة.',
      'hero.sub': '14 أداة ذكاء اصطناعي. لوحة تحكم حيّة واحدة. علامتك، مرئية.',
      'hero.cta.enter': 'ادخل النظام',
      'hero.scroll': 'مرّر',
      'intro.title': 'عن ZKJ SYSTEM',
      'gal.eyebrow': 'المعرض',
      'gal.title': 'أعمال مختارة — ضوء ومدينة وإشارة',
      'gal.sub': 'صور دبي بعدسة KJ VISION، وفن رقمي من ZKJ VERSE، وعمارة النيون من ZKJ SYSTEM. نفس العين للضوء والدقة تصنع كل أداة في النظام.',
      'gal.quote': 'الضوء ليس إنارة. إنه طاقة.',
      'gal.hint': 'حرّك المؤشر لإضاءة القاعة · اختر عملًا لعرضه',
      'gal.handed': 'عمل ضوئي محرَّر يدويًا',
      'gal.prev': 'السابق',
      'gal.next': 'التالي',
      'gal.close': 'إغلاق',
      'gal.view': 'عرض {title}',
      'gal.count': 'العمل {n} من {total}',
      'ex.cta': 'استفسر',
      'ex.room': 'القاعة {n}',
      'act.1.era': 'الماضي · الفصل الأول',
      'act.1.t': 'استفسر، وأحضر ضوءك',
      'act.1.d': 'كل نظام يبدأ بما هو لك أصلًا — قصتك، ومكانك، وناسك.',
      'act.1.cap': 'الخطوة الأولى · تدقيق العلامة',
      'act.2.era': 'الحاضر · الفصل الثاني',
      'act.2.t': 'الأدوات تعمل. وأنت توافق.',
      'act.2.d': 'أدواتك تعمل في الخلفية وترفع تقاريرها إلى لوحة واحدة. ولا يصل شيء لجمهورك قبل أن تقول نعم.',
      'act.2.cap': 'موافقة · طلب تعديل',
      'act.3.era': 'المستقبل · الفصل الثالث',
      'act.3.t': 'علامتك، حيّة على كل منصة',
      'act.3.d': 'تُنشر، ويُرد عليها، وتُقاس — بانتظام، بالعربية والإنجليزية.',
      'act.3.l2': 'المنشورات والردود وواتساب والحملات تعمل عبر الواجهات الرسمية للمنصات، وكل أسبوع تشوف ما الذي نجح.',
      'act.3.cap': 'لوحة مباشرة · على مدار الساعة',
      'world.eyebrow': 'شاهدها في عالمك',
      'world.title': 'الفن والعلامة، يعيشان معًا',
      'world.sub': 'عمل من أعمال KJ على جدارك، وأحدث منشوراتك على شاشة عميلك. اختر مساحة.',
      'world.tabs': 'المساحات',
      'world.cafe': 'مقهى',
      'world.hotel': 'ردهة فندق',
      'world.office': 'مكتب',
      'world.likes': 'إعجاب',
      'world.cafe.post': 'قائمة الخريف، تُسكب على مهل',
      'world.cafe.cap': 'موسم جديد. نفس الطقس الهادئ.',
      'world.cafe.scene': '«مسار ذهبي» فوق البار — بجانب أحدث منشور للمقهى.',
      'world.hotel.post': 'سجّل دخولك إلى الساعة الهادئة',
      'world.hotel.cap': 'الردهة بعد الغروب.',
      'world.hotel.scene': '«البرج، الساعة الزرقاء» في الردهة — بجانب منشور الفندق المسائي.',
      'world.office.post': 'الدقة نوع من الضوء',
      'world.office.cap': 'رسومات تُسلَّم بلغتين.',
      'world.office.scene': '«نفق الإشارة» في المكتب — بجانب أحدث منشور للشركة.',
      'ft.presented': 'ZKJ SYSTEM — من KJ VISION · ZKJ VERSE',
      'ft.by': 'ZKJ SYSTEM — من',
      'sc.eyebrow': 'الأدوات أثناء العمل',
      'sc.title': 'دراسة حالة: KJ VISION',
      'sc.sub': 'ست خطوات، وعلامة حقيقية واحدة. شاهد النظام يأخذ KJ VISION من الهوية إلى القنوات المباشرة.',
      'sc.prev': 'الخطوة السابقة',
      'sc.next': 'الخطوة التالية',
      'sc.pause': 'إيقاف العرض مؤقتًا',
      'sc.play': 'تشغيل العرض',
      'sc.step': 'الخطوة {n}: {title}',
      'sc.k.logo': 'الشعار',
      'sc.k.palette': 'الألوان',
      'sc.k.type': 'الخطوط',
      'sc.k.voice': 'النبرة',
      'sc.voice': 'دقيقة · غامضة · راقية',
      'sc.bk.note': 'معاينة الهوية — الملفات النهائية لاحقًا',
      'sc.profile': 'تصوير وفن رقمي',
      'sc.connected': 'متصل · واجهة رسمية',
      'sc.f.post': 'منشور',
      'sc.f.carousel': 'كاروسيل',
      'sc.f.reel': 'ريل',
      'sc.f.story': 'ستوري',
      'sc.ap.0': 'قمر الليل — ريل',
      'sc.ap.1': 'مشكال — كاروسيل',
      'sc.ap.2': 'مسار ذهبي — ستوري',
      'sc.approve': 'موافقة',
      'sc.changes': 'طلب تعديل',
      'sc.approved': 'تمت الموافقة',
      'sc.days': 'أحد,اثنين,ثلاثاء,أربعاء,خميس,جمعة,سبت',
      'sc.published': 'منشور',
      'sc.comment': 'هل هذا العمل متوفر كطباعة؟',
      'sc.suggested': 'الرد المقترح',
      'sc.reply': 'نعم — بإصدارات محدودة على الأكريليك والريزن. بأرسل لك المقاسات.',
      'sc.reach': 'الوصول · آخر 7 أيام',
      'sc.grid.alt': 'لقطة شاشة حقيقية لشبكة حساب ‎@zkjverse على إنستغرام: منشورات تحريرية بخط ذهبي وأبيض على الأسود، وصور معمارية وأعمال فنية'
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
  function soonById(id) { for (var i = 0; i < COMING.length; i++) if (COMING[i].id === id) return COMING[i]; return null; }
  function toolById(id) { for (var i = 0; i < TOOLS.length; i++) if (TOOLS[i].id === id) return TOOLS[i]; return null; }
  function ctxLabel(c) {
    if (!c) return '';
    if (c.type === 'tool') { var tl = toolById(c.id); return tl ? tl[lang].name : ''; }
    if (c.type === 'soon') { var sn = soonById(c.id); return sn ? sn[lang].name + ' (' + t('soon.tag') + ')' : ''; }
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
        ['brand', 'smm', 'whatsapp'].forEach(function (id) { var bk = form.querySelector('input[name="tools"][value="' + id + '"]'); if (bk) bk.checked = true; });
      }
    }
    if (form && !c) { var pk2 = form.querySelector('input[name="package"]'); if (pk2) pk2.value = ''; }
    updateWaLinks();
  }

  /* ---------- Index renderers ---------- */
  var dialectSel = 'gulf';
  function dialectDemo() {
    var cur = null;
    DIALECTS.forEach(function (d) { if (d.id === dialectSel) cur = d; });
    return '<div class="dia-demo" data-dia><p class="dia-label">' + esc(t('dia.label')) + '</p>' +
      '<p class="dia-msg">' + esc(t('dia.msg')) + '</p>' +
      '<div class="dia-chips" role="group" aria-label="' + esc(t('dia.label')) + '">' + DIALECTS.map(function (d) {
        return '<button type="button" class="dia-chip" data-dia-pick="' + d.id + '" aria-pressed="' + (d.id === dialectSel ? 'true' : 'false') + '">' + esc(d[lang]) + '</button>';
      }).join('') + '</div>' +
      '<p class="dia-line" aria-live="polite" lang="' + (cur.fr ? 'fr' : 'ar') + '" dir="' + (cur.fr ? 'ltr' : 'rtl') + '">' + esc(cur.line) + '</p>' +
      '<p class="dia-note">' + esc(t('dia.note')) + '</p></div>';
  }
  function soonCard(c) {
    var d = c[lang];
    return '<li><article class="soon-card"><div class="tool-icon">' + c.icon + '</div>' +
      '<div><h4>' + esc(d.name) + '</h4><p>' + esc(d.d) + '</p></div>' +
      '<a class="btn btn-sm" href="#enquire" data-enquire="soon:' + c.id + '">' + esc(t('soon.cta')) + '<span class="sr-only"> — ' + esc(d.name) + '</span></a></article></li>';
  }
  function toolCard(tl) {
    var d = tl[lang];
    var ex = 'EX-' + tl.code.slice(2);
    return '<li><article class="tool-card exhibit' + (tl.demo ? ' has-demo' : '') + '" id="tool-' + tl.id + '">' +
      '<div class="plaque"><span class="tag">' + ex + '</span>' + (d.badge ? '<span class="tool-badge">' + esc(d.badge) + '</span>' : '') + '<div class="tool-icon">' + tl.icon + '</div></div>' +
      '<h4>' + esc(d.name) + '</h4>' +
      '<p class="tool-tag">' + esc(d.tag) + '</p>' +
      '<p class="tool-desc">' + esc(d.desc) + '</p>' +
      '<ul>' + d.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
      (tl.demo ? dialectDemo() : '') +
      '<a class="btn btn-sm" href="#enquire" data-enquire="tool:' + tl.id + '">' + esc(t('ex.cta')) + '<span class="sr-only"> — ' + esc(d.name) + '</span></a>' +
      '</article></li>';
  }
  function renderTools() {
    var wrap = document.getElementById('tools-grid');
    if (!wrap) return;
    wrap.innerHTML = GROUPS.map(function (g, gi) {
      var list = TOOLS.filter(function (tl) { return tl.group === g.id; });
      return '<div class="tool-group exroom" id="group-' + g.id + '">' +
        '<div class="exroom-head"><span class="tag">' + esc(t('ex.room', { n: gi + 1 })) + ' · ' + g.code + '</span><h3>' + esc(g[lang].name) + '</h3><p>' + esc(g[lang].d) + '</p></div>' +
        '<ul class="ex-track">' + list.map(toolCard).join('') + '</ul></div>';
    }).join('') +
      '<div class="tool-group exroom soon-room" id="group-soon"><div class="exroom-head"><span class="tag">' + esc(t('soon.tag')).toUpperCase() + '</span><h3>' + esc(t('soon.title')) + '</h3><p>' + esc(t('soon.sub')) + '</p></div>' +
      '<ul class="soon-track">' + COMING.map(soonCard).join('') + '</ul></div>';
  }
  function renderPackages() {
    var grid = document.getElementById('packages-grid');
    if (!grid) return;
    var items = {
      starter: ['pk.i1', 'pk.i2', 'pk.i3', 'pk.i4'],
      growth: ['pk.i1', 'pk.i2', 'pk.i6', 'pk.i7', 'pk.i3', 'pk.i4'],
      full: ['pk.i5', 'pk.i8', 'pk.i9', 'pk.i7', 'pk.i1', 'pk.i6', 'pk.i3', 'pk.i4']
    };
    grid.innerHTML = PACKAGES.map(function (id) {
      return '<article class="pkg' + (id === 'full' ? ' is-accent' : '') + '" id="pkg-' + id + '">' +
        '<span class="tag">' + ({ starter: 'PLATE I', growth: 'PLATE II', full: 'PLATE III' })[id] + '</span>' +
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
    tb.innerHTML = GROUPS.map(function (g) {
      return '<div class="check-group"><span class="check-group-label">' + esc(g[lang].name) + '</span><div class="checks">' +
        TOOLS.filter(function (tl) { return tl.group === g.id; }).map(function (tl) {
          return '<label class="check"><input type="checkbox" name="tools" value="' + tl.id + '"' + (checkedTools.indexOf(tl.id) > -1 ? ' checked' : '') + '><span>' + esc(tl[lang].name) + '</span></label>';
        }).join('') + '</div></div>';
    }).join('');
    pb.innerHTML = PLATFORMS.concat(FORM_EXTRA_PLATFORMS).map(function (p) {
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
      var allPl = PLATFORMS.concat(FORM_EXTRA_PLATFORMS);
      var plNames = vals('platforms').map(function (id) { for (var i = 0; i < allPl.length; i++) if (allPl[i].id === id) return allPl[i].en; return id; });
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
      var dp = e.target.closest('[data-dia-pick]');
      if (dp) { dialectSel = dp.getAttribute('data-dia-pick'); var box = dp.closest('[data-dia]'); if (box) { var tmp = document.createElement('div'); tmp.innerHTML = dialectDemo(); box.replaceWith(tmp.firstChild); var nb = document.querySelector('[data-dia-pick="' + dialectSel + '"]'); if (nb) nb.focus(); } return; }
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
    toast: toast, waLink: waLink, store: store, TOOLS: TOOLS, COMING: COMING, GROUPS: GROUPS, PLATFORMS: PLATFORMS, ICONS: ICONS, IG_URL: IG_URL,
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
