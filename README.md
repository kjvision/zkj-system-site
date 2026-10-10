# ZKJ SYSTEM — website + live demo dashboard

Static marketing site for **ZKJ SYSTEM**, the AI tools sold by **ZKJ VERSE**, plus a clickable live demo of the client dashboard.

- `index.html` — marketing site (hero, how it works, 13 tools in 5 groups — Brand / Content / Engage & Sell / Grow / Build & Protect — safety, packages, FAQ, enquiries)
- `dashboard.html` — live demo client dashboard (sample brand "Qahwa House" / «بيت القهوة»), no login, all state in memory
- `404.html` — not-found page
- `assets/style.css` — shared styles (ZKJ VERSE dark theme + the demo's brand theme)
- `assets/app.js` — shared script: EN/AR i18n with RTL, tool catalogue, WhatsApp links, enquiry form
- `assets/dashboard.js` — demo dashboard logic (approvals, calendar, notifications, uploads preview)
- `CNAME` — custom domain `system.zkjverse.com`
- `.nojekyll` — serve files as-is (no Jekyll processing)

No build step and no frameworks. The only external dependency is Google Fonts.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000/
```

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
