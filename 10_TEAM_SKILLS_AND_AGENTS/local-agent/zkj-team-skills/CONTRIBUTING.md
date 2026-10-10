# Contributing

## When to add or change a skill

- You corrected the agent twice for the same mistake → that rule belongs in a skill.
- A new workflow repeats weekly → it deserves its own skill.
- A standard changed (new brand color, new policy) → update the existing skill, don't create a duplicate.

## Skill format

Every skill is one folder under `skills/` with a `SKILL.md`:

```markdown
---
name: skill-name-kebab-case
description: One paragraph. Say WHAT it does and WHEN to trigger it — include the exact phrases users say. Agents pick skills by this description alone.
---

# Skill title

Instructions written TO the agent, imperative voice.
Concrete rules beat vague principles: "Titles max 60 chars" not "keep titles short".
```

Rules for good skills: one job per skill, real examples over abstractions, include the *don'ts* (what the agent gets wrong without guidance), keep it under ~150 lines — split if bigger.

## Workflow

1. Branch: `git checkout -b skill/your-change`
2. Edit or add the skill
3. Test locally: point your agent at the file and run a real task
4. PR to `main` with a one-line summary of what behavior changes
5. One approval → merge → announce in team chat so people reinstall

## Versioning

Bump `version` in `package.json`: patch for wording fixes, minor for new skills, major for breaking restructures.
