# SECURITY SCAN — the standing job (written 8 September 2026 by ⊙ MOTHER HQ, ordered by KJ)

WHY: KJ asked on 8 Sep 2026 for the "scanning for passwords" idea from an earlier conversation to
become real. No record of that earlier conversation exists in ZKJ_STATE.md, AGENT_REGISTER.md or
the project docs — so this file IS the record from now on.

THE JOB, in one line: find files on the Mac that may hold a password, API key, token or private key,
and tell KJ WHERE they are. Nothing else.

LAWS OF THIS JOB
1. Runs ON THE MAC only (device_bash). File contents never leave the Mac. The report holds file
   paths, pattern names and counts — never the matched text.
2. It never deletes, never moves, never edits. KJ opens the file, judges, rotates the real secret,
   and moves the file to a _TO_DELETE review folder himself.
3. A hit is not proof. "password = …" inside a brief is usually an instruction. Say "possible", never "leaked".
4. Every agent, every chat: never paste a password, token or key into a chat, a brief, the dashboard
   store, a project doc or memory. If one is needed, KJ types it himself where it belongs.
5. Scope today: text files ≤3 MB under kj.work and site.work (md txt json js html py csv yml env sh
   plist xml ini cfg log liquid ts mjs toml conf). Not covered: docx, xlsx, pdf, images, the Photos app.
6. Cadence: MOTHER HQ runs it at the start of any redesign / cleanup session, and once a week when the
   Mac is on. Each run writes SECURITY_SCAN_<date>.md beside this file. Old reports are kept.

FIRST RUN — 8 Sep 2026 23:5x Dubai: 1,177 files, 44.1 MB, 9 seconds. 4 files with hits, all in
reference copies of the public website or in an old skill document (see SECURITY_SCAN_2026-09-08.md).
No private key, no Shopify admin token, no AWS/GitHub/Slack/Anthropic key pattern found in text files.

HOW TO RUN (any Cowork session with the folders connected)
  device_bash:  cd $HOME/mnt && python3 kj.work/00_ZKJ_SYSTEM/security_scan.py
  The script is 00_ZKJ_SYSTEM/security_scan.py — the exact code of the 8 Sep run. It prints paths,
  pattern names and counts only, and writes SECURITY_SCAN_<date>.md beside this file.
