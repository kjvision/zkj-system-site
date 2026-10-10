# Architecture

## The two layers

**Layer 1 — infrastructure (Vercel, free):** the `npx skills` CLI. It reads a Git repo of `SKILL.md` files and installs them into the config format of 70+ AI agents (Claude Code, Cursor, Cline, Copilot, ...). Vercel maintains it; we never touch this layer.

**Layer 2 — content (ours):** this repo. Our standards, written once, versioned in Git, private to the team.

```
GitHub: kjvision/team-skills (private)
        │
        │  npx skills add kjvision/team-skills
        ▼
Each member's agent config
(~/.claude/skills, .cursor/rules, etc. — the CLI handles the mapping)
        │
        ▼
Agent applies ZKJ standards automatically on every task
```

## Why this design

- **No custom tooling to maintain.** We own markdown files, nothing else.
- **Agent-agnostic.** A designer on Cursor and a developer on Claude Code get identical standards.
- **Git = governance.** Branch protection means standards change only by reviewed PR. History shows who changed what and why.
- **Scales by addition.** New role on the team → new skill folder. New hire → one install command replaces onboarding docs.

## How agents pick skills

Agents read only the frontmatter `description` when deciding whether to load a skill — the body loads on demand. This is why descriptions must contain the trigger phrases people actually say ("write a caption", "اكتب وصف المنتج"). Weak description = skill never fires.

## Repo layout

```
team-skills/
├── package.json            # metadata + version
├── README.md               # entry point
├── GITHUB_SETUP.md         # one-time repo setup
├── TEAM_ONBOARDING.md      # per-member setup
├── CONTRIBUTING.md         # change workflow
├── ARCHITECTURE.md         # this file
└── skills/
    ├── zkj-brand-guidelines/SKILL.md
    ├── arabic-content/SKILL.md
    ├── social-content-standards/SKILL.md
    ├── shopify-product-listing/SKILL.md
    ├── seo-content/SKILL.md
    ├── customer-support/SKILL.md
    ├── code-standards/SKILL.md
    └── security-review/SKILL.md
```
