# ZKJ VERSE — Team Skills

Private skills repository for the ZKJ VERSE team. One source of truth for brand, content, commerce, and engineering standards — installable into any AI coding agent in one command.

## Quick start

```bash
npx skills add kjvision/team-skills
```

That's it. Every skill loads into your agent (Claude Code, Cursor, Cline, Copilot, and 70+ others).

Install a single skill only:

```bash
npx skills add kjvision/team-skills --skill zkj-brand-guidelines
```

## The team (skills included)

| Skill | Role it plays |
|---|---|
| `zkj-brand-guidelines` | Brand director — identity, tone, visual rules |
| `arabic-content` | Arabic content lead — MSA + Gulf dialect rules |
| `social-content-standards` | Social media manager — IG, X, TikTok, YouTube |
| `shopify-product-listing` | E-commerce manager — product pages that sell |
| `seo-content` | SEO specialist — search visibility for the store |
| `customer-support` | Support lead — tone-matched customer replies |
| `code-standards` | Lead developer — coding conventions |
| `security-review` | Security engineer — audit checklist |

## How it works

1. Skills live here, version-controlled on GitHub.
2. Team members install once with `npx skills add`.
3. Their AI agent automatically applies ZKJ standards to every task.
4. Improve a skill → push → everyone gets the update.

## Docs

- `GITHUB_SETUP.md` — create and configure the repo (do this first)
- `TEAM_ONBOARDING.md` — share with new team members
- `CONTRIBUTING.md` — how to add or improve skills
- `ARCHITECTURE.md` — how the system works under the hood
