---
name: make-thread
description: Turns a YouTube video, post, or article into an Arabic X (Twitter) thread in the ZKJ VERSE voice. Trigger when the user shares a YouTube link or pasted post and asks for a thread — "سوّ لي ثريد", "حوّل هذا الفيديو لثريد", "make a thread from this video", "turn this post into a thread" — or shares any content link asking to repurpose it for X.
---

# Make thread

Convert source content into a ready-to-post Arabic X thread in the user's saved voice.

## Steps

1. **Load identity.** Read `ZKJ-IDENTITY.md` from the connected folder or outputs folder. If missing, run the setup-identity skill first, then continue.
2. **Get the source content:**
   - YouTube link → fetch the page with web fetch to get title and description. If the substance of the video isn't recoverable from the page, ask the user to paste the transcript or key points (YouTube: ⋯ → Show transcript → copy).
   - Article/post link → fetch it and extract the main content.
   - Pasted text → use as-is.
3. **Extract the core:** the one big idea, 3–7 supporting points, any numbers or names worth quoting, and what the audience should do next.
4. **Write the thread** following the format below.
5. **Deliver:** number each tweet, put each in its own copyable code block, and note the character count if any tweet is near the limit. Offer to also make an Instagram carousel from the same content.

## Thread format

- **Length:** 5–10 tweets. Short source → 5; dense source → up to 10. Each tweet ≤ 280 characters (count Arabic characters carefully).
- **Tweet 1 (الهوك):** Gulf dialect, bold, curiosity-driven. No links, no hashtags. End with "🧵👇" or similar.
- **Body tweets:** Modern Standard Arabic, one idea per tweet. Lead with the point, then the detail. Use line breaks inside tweets for scannability. Numbers and specifics beat adjectives.
- **Last tweet (الختام):** Gulf dialect. Recap in one line + the CTA from the identity file + source link if there is one.
- **Numbering:** ١/ ٢/ ٣/ at the start of each tweet after the hook.

## Voice rules

- Apply the tone from `ZKJ-IDENTITY.md`. Language mix: فصحى for information, خليجي for hooks and CTAs.
- Write like the user talks — no press-release Arabic, no filler like "في هذا الثريد سنتحدث عن".
- Never invent facts not in the source. If the source is thin, say so and ask for more material instead of padding.
