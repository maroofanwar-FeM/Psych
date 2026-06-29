# CoachConnect — Project Skill File

## What This Project Is

CoachConnect is a WhatsApp automation tool for **Maroof Anwar**, a CPD Coach at NIETE who manages 9 school groups. The goal: send the right message (Monday motivation, session reminder, thank-you follow-up) to the right group at the right time — automatically, without manual effort.

This is a **no-code automation project** at its current stage, not a software codebase. There is no application code to compile or test. The "product" is a configured Make.com scenario reading from a Google Sheet.

---

## Current Phase: Step 2 of 5

| Step | Description | Status |
|---|---|---|
| 1 | Get spare SIM, add to 9 school WhatsApp groups | Open |
| 2 | Prove automation with Make.com + Google Sheets | **In Progress** |
| 3 | Build real web app (login, QR, schedule, templates) | Not started |
| 4 | Add AI message drafting + broadcast button | Not started |
| 5 | Open platform to other NIETE coaches | Not started |

---

## Key Technologies & Tools

| Tool | Role |
|---|---|
| **Make.com** | No-code automation platform — reads Google Sheet, triggers WhatsApp sends |
| **Google Sheets** | Message schedule: columns for group, message, day, time |
| **WhatsApp** | Delivery channel — must use dedicated CoachConnect SIM, never personal number |
| **bd (beads)** | Issue tracker — all tasks live here, never in TODO lists or markdown |
| **Git / GitHub** | Version control; remote is `https://github.com/maroofanwar-FeM/Psych.git` |
| **Claude Code** | AI coding assistant with hooks for session start and pre-compact |

---

## Folder Structure

```
Coach Connect/
├── SKILL.md              ← You are here
├── CLAUDE.md             ← Claude agent rules (auto-managed by Beads)
├── AGENTS.md             ← Agent workflow instructions
├── README.md             ← Project overview
├── structure.md          ← Folder layout reference
├── instructions/
│   ├── CLAUDE.md         ← Project-specific Claude rules
│   └── SKILL.md          ← Agent rules context
├── notes/
│   ├── planning.md       ← The 5-step project plan (source of truth)
│   ├── feedback_loop.md  ← How the project improves over time
│   ├── memory.md         ← Lessons learned (dated table)
│   ├── decisions.md      ← Decision log (what / why / ruled-out)
│   └── SKILL.md          ← Notes conventions context
├── data/                 ← Raw data, Google Sheet exports, school lists
└── .claude/
    ├── settings.json     ← Hooks: bd prime on SessionStart + PreCompact
    └── agents/           ← Autonomous agent definitions
```

---

## Issue Tracking (Beads)

All tasks are managed in `bd` (beads), stored in a local Dolt DB. The `.beads/issues.jsonl` file is a passive export — never edit it directly.

```bash
bd ready                  # Show available work
bd show <id>              # View issue details
bd update <id> --claim    # Claim work
bd close <id>             # Mark complete
bd dolt push              # Push issues to remote
bd prime                  # Full workflow context (run at session start)
```

**Open issues as of 2026-06-29:**
- `coach-connect-3l7` — Get spare SIM, add to 9 school groups (priority 2)
- `coach-connect-b2q` — Build message schedule in Google Sheets (priority 2)
- `coach-connect-sa2` — Try Make.com automation (**in progress**, priority 2)
- `coach-connect-az9` — Write message templates (priority 3)
- `coach-connect-ofu` — Get NIETE approval before Step 5 (priority 1)

---

## Hard Rules (Never Break)

1. **Never use the personal WhatsApp number** — only the dedicated CoachConnect SIM.
2. **Never delete a scheduled message or template without asking Maroof first.**
3. **All messages must be warm and human** — never robotic or generic.
4. **Use `bd` for ALL task tracking** — no TodoWrite, no markdown TODO lists.
5. **Work is not done until `git push` succeeds** — always push before ending a session.
6. **Don't blast all groups at the exact same second** — stagger sends to look natural.

---

## Message Types & Conventions

Three core message occasions:

| Occasion | Timing | Tone |
|---|---|---|
| **Monday motivation** | Monday 8am | Energising, forward-looking |
| **Session reminder** | Day before a session | Warm, practical, reassuring |
| **Thank-you follow-up** | Day after a session | Appreciative, reflective |

All messages must feel like they came from a real person. Short, warm, human. No corporate language.

---

## Common Tasks for an AI Agent

1. **Draft a message** — given occasion + optional context (school, date), write 2–3 warm variants.
2. **Triage open issues** — summarise what's open, in-progress, and suggest next action.
3. **End a session** — file new issues, update status, commit, push.
4. **Update memory journal** — add a row to `notes/memory.md` with date, task, lesson.
5. **Log a decision** — add an entry to `notes/decisions.md` with what/why/ruled-out.

---

## Session Completion Checklist

When ending any work session:

1. File issues in `bd` for anything unfinished
2. Run `bd close <id>` for completed work
3. Commit all changes with a clear message
4. `git pull --rebase && git push`
5. Verify `git status` shows "up to date with origin"

---

## Gotchas

- WhatsApp bans numbers that send automated messages carelessly — always use the spare SIM.
- Make.com's free tier has scenario run limits — design the schedule efficiently.
- The Dolt DB lives locally; run `bd dolt push` after `git push` to keep issues synced.
- `.beads/issues.jsonl` is read-only for humans — it's auto-generated, not the source of truth.
- The project is currently a planning/automation project, not a code project — don't expect `npm install` or tests.
