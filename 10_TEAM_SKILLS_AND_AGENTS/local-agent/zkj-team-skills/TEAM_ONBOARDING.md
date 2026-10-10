# Team Onboarding — ZKJ VERSE Skills

Welcome. This takes 5 minutes and you only do it once.

## Install

```bash
npx skills add kjvision/team-skills
```

If prompted about GitHub access, run `gh auth login` first (the repo is private).

## What you just got

Your AI agent now knows:

- **Brand** — ZKJ VERSE identity, colors, tone, taglines, collection names
- **Arabic content** — when to use فصحى vs Gulf dialect, hook/CTA style
- **Social** — per-platform standards for IG, X, TikTok, YouTube
- **Shopify** — how to write product listings that match our positioning
- **SEO** — meta, alt text, and keyword rules for the store
- **Support** — how we talk to customers, policy references
- **Code** — conventions, review checklist
- **Security** — audit checklist before anything ships

## How to use

Just work normally. The skills trigger automatically — ask your agent to "write a product description for the new piece" and it applies `zkj-brand-guidelines` + `shopify-product-listing` + `seo-content` on its own.

You can also invoke explicitly: "use the security-review skill on this code."

## Updating

Skills update when you reinstall:

```bash
npx skills add kjvision/team-skills
```

Run it whenever the team announces a skills update.

## Something wrong or missing?

Open a PR — see `CONTRIBUTING.md`. Skills are living documents; if you had to correct the agent twice for the same thing, that correction belongs in a skill.
