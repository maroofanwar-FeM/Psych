---
name: log-decision
description: Append a properly formatted entry to notes/decisions.md whenever a real decision is made (a choice between alternatives, a naming/structure change, a ruled-out approach). Use this instead of hand-writing decision entries so the format stays consistent.
---

# Log Decision

`notes/decisions.md` is CoachConnect's historical record of what was decided and why. Entries are never deleted, even if later reversed — a reversal gets a new entry.

## When to Use

Log a decision whenever:
- A real alternative was considered and rejected (tool choice, format, structure).
- A naming or structural change is made that future agents/humans might wonder about.
- Maroof explicitly says "let's go with X" after weighing options.

Don't log routine work (closing a bd issue, drafting a message) — only decisions with a *why* worth preserving.

## Format

Find the highest existing number in `notes/decisions.md`, then append:

```markdown

---

## N. Decision Title

**Decided:** One sentence: what was chosen.

**Why:** Why this option was picked.

**Ruled out:**
- Alternative A — reason
- Alternative B — reason
```

## Rules

- Decisions are numbered sequentially — never renumber or delete old entries.
- Keep each field to one or two sentences; this is a log, not a design doc.
- If a past decision is being reversed, add a **new** numbered entry referencing the old one — don't edit the original.
