---
name: make-carousel
description: Turns a YouTube video, post, or article into a 6-slide Arabic Instagram carousel (1080×1350) in the ZKJ VERSE colors, exportable as PNG. Trigger when the user asks for a carousel — "اعمل كاروسيل", "سوّ لي كاروسيل عن", "make a carousel", "instagram slides" — or shares content asking to repurpose it for Instagram.
---

# Make carousel

Convert source content into a 6-slide Instagram carousel rendered as an HTML file with per-slide PNG download.

## Steps

1. **Load identity.** Read `ZKJ-IDENTITY.md` from the connected folder or outputs folder. If missing, run the setup-identity skill first, then continue.
2. **Get the source content** the same way as make-thread: fetch links, ask for a transcript if a YouTube page doesn't carry the substance, or use pasted text directly.
3. **Write the 6 slides** using the structure below — copy first, design second.
4. **Build the HTML file** from `references/carousel-template.md`, injecting the identity colors and slide copy. Save as `carousel-<slug>.html` in the outputs folder.
5. **Deliver:** present the file, tell the user (in Arabic) to open it and press "حمّل الكل" to download all slides as 1080×1350 PNGs. Offer to also make an X thread from the same content.

## Slide structure (fixed, 6 slides)

| # | Slide | Content |
|---|-------|---------|
| 1 | الغلاف | Big bold hook, 3–7 words, Gulf dialect. Category tag on top. |
| 2 | المشكلة / السياق | Why this matters — one short paragraph, MSA. |
| 3 | التفاصيل ١ | First key point(s), numbered list of up to 3 items. |
| 4 | التفاصيل ٢ | Remaining key points or a standout number/quote. |
| 5 | الحل / الخلاصة | The takeaway in one strong sentence + one supporting line. |
| 6 | CTA / التفاعل | The CTA from the identity file + handle + "شارك رأيك" style engagement line. |

## Copy rules

- Headlines ≤ 7 words, body ≤ 40 words per slide. Carousels are skimmed, not read.
- Language mix per identity file: خليجي for slide 1 and 6, فصحى for 2–5.
- Every slide carries the brand handle at the bottom.
- Never invent facts not in the source.

## Design rules

- Slides are 1080×1350 (4:5), RTL, `dir="rtl"`.
- Use only the four identity colors. Primary for headlines and accents, background as the canvas.
- Use a bold Arabic-friendly font stack: "IBM Plex Sans Arabic", "Noto Kufi Arabic", "Tajawal", sans-serif (loaded from Google Fonts in the template).
- Slide counter (01/06 … 06/06) in a corner of every slide.
