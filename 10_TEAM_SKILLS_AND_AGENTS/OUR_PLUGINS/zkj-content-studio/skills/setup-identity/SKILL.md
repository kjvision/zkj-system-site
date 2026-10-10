---
name: setup-identity
description: First-run setup for ZKJ Content Studio. Collects and saves the user's brand identity (name, niche, dialect, colors, tone) so make-thread and make-carousel apply it automatically. Trigger when the user says "setup my identity", "جهز هويتي", "عرفني", "غير ألواني", "غير نبرتي", wants to change brand colors or tone, or when another studio skill runs and no identity file exists yet.
---

# Setup identity

Collect the brand identity once, save it to a file, and never ask again unless the user wants changes.

## Where the identity lives

Save to `ZKJ-IDENTITY.md` in the connected folder if one is connected, otherwise in the outputs folder. Other skills read this file at the start of every run.

## Steps

1. Check whether `ZKJ-IDENTITY.md` already exists. If it does, show the current values and ask what to change — update only those fields.
2. If it doesn't exist, ask the user (in Arabic, using AskUserQuestion or the elicitation form when available) for:
   - **Brand name and handle** — default: ZKJ VERSE
   - **Niche** — the field the content covers (tech, AI, business, ...)
   - **Language style** — default: mix (Modern Standard Arabic for information, Gulf dialect for hooks and CTAs)
   - **Colors** — primary, secondary, background, and text color as hex codes. If the user uploads a logo, extract the dominant colors from it and confirm.
   - **Tone** — رسمي / ودّي / جريء / ساخر, or a free description
   - **CTA** — the default call-to-action line and handle to append to threads and carousels
3. Write `ZKJ-IDENTITY.md` in this format:

```markdown
# ZKJ VERSE — هوية المحتوى

- البراند: ZKJ VERSE
- الهاندل: @ZKJVERSE
- المجال: <niche>
- اللغة: فصحى للمعلومة · لهجة خليجية للهوك والـ CTA
- الألوان: primary #xxxxxx · secondary #xxxxxx · background #xxxxxx · text #xxxxxx
- النبرة: <tone>
- الـ CTA: <cta line>
```

4. Confirm to the user in Arabic that the identity is saved and that every thread and carousel will now use it automatically. Suggest trying: "حوّل هذا الفيديو لثريد: [رابط]".

## Rules

- Never overwrite existing values the user didn't ask to change.
- Keep the conversation in Arabic unless the user writes in English.
