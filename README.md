# ZKJ SYSTEM — website + live demo dashboard

Static marketing site for **ZKJ SYSTEM**, the AI tools sold by **ZKJ VERSE**, plus a clickable live demo of the client dashboard.

- `index.html` — marketing site (hero, how it works, 13 tools in 5 groups — Brand / Content / Engage & Sell / Grow / Build & Protect — safety, packages, FAQ, enquiries)
- `dashboard.html` — live demo client dashboard (sample brand "Qahwa House" / «بيت القهوة»), no login, all state in memory
- `404.html` — not-found page
- `assets/style.css` — shared styles (ZKJ VERSE dark theme + the demo's brand theme)
- `assets/app.js` — shared script: EN/AR i18n with RTL, tool catalogue, WhatsApp links, enquiry form
- `assets/site.js` — home-page experience: hero video slot / artwork crossfade, gallery room + lightbox, showcase walkthrough, journey, mock-up rooms
- `assets/dashboard.js` — demo dashboard logic (approvals, calendar, inbox, ads, notifications, uploads preview)
- `assets/art/art.json` — KJ's artworks (file, thumbnail, hero version, EN/AR titles, collection, alt text)
- `assets/media/hero.json` — hero background videos (empty = artwork crossfade)
- `assets/showcase/showcase.json` — the "Tools at work — KJ VISION" walkthrough steps
- `assets/brand/` — gold/white ZKJ mark (SVG), favicon (SVG + PNG), apple-touch icon, Open Graph image
- `app/login.html`, `app/index.html` — live client portal on Supabase (sign-in, client dashboard, admin view for KJ); `noindex`
- `assets/portal.js`, `assets/login.js`, `assets/portal-strings.js`, `assets/portal.css` — portal logic, EN/AR strings and styles (reuses the demo dashboard's CSS classes)
- `assets/supabase-config.js` — Supabase project URL + publishable (public) key; never put a secret here
- `assets/vendor/supabase-js-2.116.0.min.js` — vendored supabase-js UMD build (MIT)
- `supabase/schema.sql` — tables, row-level security, RPCs, signup trigger and starter data; `supabase/SETUP.md` — one-time setup steps for KJ
- `CNAME` — custom domain `system.zkjverse.com`
- `.nojekyll` — serve files as-is (no Jekyll processing)

No build step and no frameworks. The only external dependency is Google Fonts.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000/
```

## Hero video (swap or add loops)

The hero plays the first video listed in `assets/media/hero.json`. With an empty list it shows a slow crossfade of the artworks instead. Visitors who prefer reduced motion always get a still frame.

1. Compress the loop (1080p, H.264, no audio, under ~8 MB):

   ```bash
   ffmpeg -i input.mov -vf "scale=-2:1080,fps=30" -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -movflags +faststart -an assets/media/hero-1.mp4
   # optional WebM (smaller in Chrome/Firefox)
   ffmpeg -i input.mov -vf "scale=-2:1080,fps=30" -c:v libvpx-vp9 -crf 36 -b:v 0 -an assets/media/hero-1.webm
   # poster frame (shown while loading)
   ffmpeg -i assets/media/hero-1.mp4 -vf "select=eq(n\,0),scale=-2:1080" -frames:v 1 -q:v 4 assets/media/hero-1-poster.jpg
   ```

2. Add a line to `assets/media/hero.json`:

   ```json
   { "videos": [ { "src": "assets/media/hero-1.mp4", "webm": "assets/media/hero-1.webm", "poster": "assets/media/hero-1-poster.jpg" } ] }
   ```

   `webm` and `poster` are optional. To swap videos, replace the files or change the first entry.

## Artworks

Titles and alt text live in `assets/art/art.json` ("Unknown Presence — Frequency I…V" for now). Rename there; the gallery, lightbox and hero all read from it. Each work has a full image (max 1600px), a 600px thumbnail and a darker 1280px hero version, all WebP.

## Showcase — "The tools at work: KJ VISION"

`assets/showcase/showcase.json` drives the six-step walkthrough (brand kit → setup → content studio → approval → publisher → inbox & insights). Per step:

- `title_en/ar`, `caption_en/ar` — text under the frame
- `overlay` — the UI drawn over the media: `brandkit`, `setup`, `content`, `approval`, `publisher`, `inbox`, or `none`
- `media.images` — background/frames (paths from the site root)
- `media.video` (+ optional `media.poster`) — an MP4 that plays muted on that step instead of the image background
- `duration_ms` — optional per-step length (step 01 uses 7000 for its four brand-kit frames)
- `pending_assets` — TODO placeholders that are **not loaded**. When a file arrives (brand-kit images in `assets/showcase/brandkit/`, Instagram screenshots or reels from @unknown.presence.kj in `assets/showcase/instagram/`), move its path into `media.images` or `media.video`.

## Publish with GitHub Pages

1. Push this repository to GitHub (`kjvision/zkj-system-site`).
2. On GitHub open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose the branch (e.g. `main`, or the branch you want live) and the folder **/ (root)**, then **Save**.
5. Under **Custom domain**, enter `system.zkjverse.com` (it is already in the `CNAME` file) and save.
6. Once the DNS check passes, tick **Enforce HTTPS**.

## DNS record

At the DNS provider for `zkjverse.com`, add one record:

| Type  | Name / Host | Value / Target         | TTL     |
|-------|-------------|------------------------|---------|
| CNAME | `system`    | `kjvision.github.io`   | default |

DNS can take from a few minutes up to 24 hours to propagate. You can check it with:

```bash
dig system.zkjverse.com +short
```

## Enquiries

There is no payment or checkout on the site. Every call to action is an enquiry:

- **WhatsApp** — `wa.me` link with a pre-filled message naming the chosen tool or package, in the visitor's language.
- **Email form** — posts to Formspree (`https://formspree.io/f/mvkzrbog`) with `fetch` + `Accept: application/json`, honeypot field `_gotcha`. Tool cards and package buttons pre-select the form.
- **Instagram** — DM link.

To change the WhatsApp number, Instagram handle or Formspree endpoint, edit the constants at the top of `assets/app.js`.

## Platform wording

The site states that publishing, comment/DM replies and WhatsApp run through the platforms' official APIs and business tools (Meta, TikTok, YouTube, Google, WhatsApp Business Platform), that nothing goes out without the client's approval, and that ad budgets are paid by the client directly to each platform. Keep any new copy consistent with that.

## Editing copy

All visible text lives in the `STR` dictionaries in `assets/app.js` (site) and `assets/dashboard.js` (demo), with one `en` and one `ar` entry per key. The tool catalogue (`TOOLS`) is also in `assets/app.js`. The chosen language is remembered in `localStorage`.
