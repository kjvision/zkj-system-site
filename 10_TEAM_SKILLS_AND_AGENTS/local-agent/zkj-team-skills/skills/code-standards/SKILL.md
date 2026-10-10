---
name: code-standards
description: ZKJ VERSE coding conventions for web work — Shopify theme code (Liquid), HTML/CSS/JS, and any tooling scripts. Trigger on any coding task: "edit the theme", "add a section", "fix this code", "write a script".
---

# Code Standards — ZKJ VERSE

## General

- Small, readable, boring code beats clever code. Optimize for the next person (often future-you).
- Every change answers: what breaks if this is wrong? Test that path before calling it done.
- Names: descriptive, no abbreviations (`productCardImage`, not `pci`).
- No dead code, no commented-out blocks in commits.

## Shopify theme work (Liquid)

- Never edit the live theme directly — duplicate the theme, edit the copy, preview, then publish.
- New functionality goes in sections/snippets with schema settings so the owner can adjust via the customizer — no hardcoded copy or colors in Liquid.
- Use theme settings/CSS variables for brand colors; check `ZKJ-IDENTITY.md` or existing settings before introducing any new hex value.
- Respect Online Store 2.0 patterns: JSON templates, section groups; don't monkey-patch `theme.liquid` when a section will do.

## Front-end

- Mobile-first — most store traffic is mobile. Test at 375px before desktop.
- Performance budget: lazy-load images, use Shopify's `image_url` with explicit sizes, no new JS libraries without justification.
- Accessibility: alt text everywhere, focus states preserved, contrast ≥4.5:1 on text, `dir="rtl"` correctness on Arabic pages.

## Git

- Branches: `feature/...`, `fix/...`; commits: imperative one-liner ("Add edition badge to product card").
- Never commit secrets, API tokens, or customer data. `.env` in `.gitignore` always.

## Review checklist (before any PR/publish)

1. Works on mobile viewport
2. No console errors
3. Brand colors/fonts from settings, not hardcoded
4. Alt text and ARIA where relevant
5. `security-review` skill run if code touches input, auth, or payments
