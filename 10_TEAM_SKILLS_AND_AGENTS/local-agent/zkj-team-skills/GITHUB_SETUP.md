# GitHub Setup — Step by Step

Total time: ~30 minutes. Do these in order.

## 1. Create the repo (5 min)

1. Go to https://github.com/new
2. Owner: your `zkjverse` organization (create one at github.com/organizations/plan if you don't have it — free plan is fine)
3. Repository name: `team-skills`
4. Visibility: **Private**
5. Create repository (no README — we have our own)

## 2. Upload the files (5 min)

Option A — web upload: on the empty repo page click "uploading an existing file", drag the entire contents of this `zkj-team-skills` folder, commit to `main`.

Option B — command line:

```bash
cd zkj-team-skills
git init
git add .
git commit -m "ZKJ VERSE team skills v1.0"
git branch -M main
git remote add origin https://github.com/kjvision/team-skills.git
git push -u origin main
```

## 3. Protect the main branch (5 min)

Repo → Settings → Branches → Add rule:
- Branch name pattern: `main`
- Require a pull request before merging: ON
- Require approvals: 1

This means no one (including you) breaks the standards accidentally — every change is reviewed.

## 4. Add team members (5 min)

Repo → Settings → Collaborators and teams → Add people. Give team members **Write** access (they contribute via PRs, protected branch handles review).

## 5. Announce (5 min)

Message template for the team:

> We now have a shared skills repo. Run this once:
> `npx skills add kjvision/team-skills`
> Your AI agent (Claude Code, Cursor, etc.) will automatically follow ZKJ brand, content, and code standards from now on. Details: [repo link]/TEAM_ONBOARDING.md

## 6. Verify (5 min)

Have one team member install and ask their agent: "What are the ZKJ brand colors?" — the answer should come from `zkj-brand-guidelines`. Done.

## Note on private repos

`npx skills add` on a private repo requires each team member to have GitHub access configured locally (`gh auth login` or SSH keys). Anyone with repo access can install.
