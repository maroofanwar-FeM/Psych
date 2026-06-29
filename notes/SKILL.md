# notes/ — Directory Skill File

## What Lives Here

This folder contains all human-readable project notes, plans, and journals for CoachConnect. Nothing in this folder is auto-generated — everything is written by Maroof or an AI agent under his direction.

---

## Files and Their Purpose

| File | Purpose | Format |
|---|---|---|
| `planning.md` | The canonical 5-step project plan | Prose with step headers |
| `decisions.md` | Log of significant decisions | Section per decision (see format below) |
| `memory.md` | Lessons learned journal | Table: Date / Task / Lesson Learned |
| `feedback_loop.md` | How the project improves over time | Short prose, 4-step loop |

---

## memory.md Format

Always add new rows at the **bottom** of the table. Columns:

| Date | Task | Lesson Learned |
|---|---|---|
| YYYY-MM-DD | Short description of what was done | What was non-obvious or worth remembering |

Keep the lesson concise — one sentence. Focus on the *why* or *what surprised you*, not what was done (the Task column covers that).

---

## decisions.md Format

Each entry follows this structure:

```markdown
## N. Decision Title

**Decided:** One sentence: what was chosen.

**Why:** Why this option was picked.

**Ruled out:**
- Alternative A — reason
- Alternative B — reason
```

Decisions are numbered sequentially. Never delete old decisions — they're a historical record.

---

## planning.md

This is the source of truth for the project roadmap. Steps 1–5 are defined here. When the project moves to a new phase, update the step status in `planning.md` and log it in `memory.md`.

Do not add new steps to the plan without Maroof's agreement.

---

## Common Agent Tasks in This Directory

- **Log a lesson**: append a row to `memory.md` after completing a task.
- **Log a decision**: add a new numbered section to `decisions.md`.
- **Check current phase**: read `planning.md` to see which step is active.
- **Review feedback loop**: read `feedback_loop.md` to understand how improvements are made.

---

## Gotchas

- `memory.md` uses a table — maintain the column alignment when adding rows.
- Dates are always in `YYYY-MM-DD` format.
- Decisions are never removed, even if later reversed — add a new entry noting the change.
