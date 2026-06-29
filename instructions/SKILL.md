# instructions/ — Directory Skill File

## What Lives Here

This folder holds rules and guidance for AI agents working on CoachConnect. Files here define how Claude and other AI assistants should behave in this project.

---

## Files and Their Purpose

| File | Purpose |
|---|---|
| `CLAUDE.md` | Project-specific rules for Claude: purpose, hard constraints, tone, where things live |

---

## CLAUDE.md Summary

The key rules from `instructions/CLAUDE.md`:

**Purpose:** CoachConnect automatically sends scheduled WhatsApp messages to 9 NIETE school groups for Maroof Anwar.

**Hard rules:**
- Never use the personal WhatsApp number — only the dedicated CoachConnect SIM.
- Always ask before deleting a scheduled message or template.
- Write all messages in warm, human language — never robotic or generic.

**Where things live:**
- Project plan → `notes/planning.md`
- Issue tracking → `bd` (beads) CLI
- Decisions → `notes/decisions.md`
- Lessons learned → `notes/memory.md`

---

## Relationship to Root CLAUDE.md

The root `CLAUDE.md` is auto-managed by Beads and contains the Beads integration block plus session completion rules. The `instructions/CLAUDE.md` contains human-authored project context. Both apply — they are complementary, not duplicates.

If there is ever a conflict, the root `CLAUDE.md` takes precedence for issue tracking and session workflow; `instructions/CLAUDE.md` takes precedence for content and tone rules.

---

## Adding New Instructions

If Maroof gives a new permanent rule (e.g. "always CC the school admin"), add it to `instructions/CLAUDE.md` under the relevant section. Then:
1. Log the decision in `notes/decisions.md`
2. Commit the change
3. Push to remote

Do not add ephemeral or session-specific guidance to this folder — that belongs in `bd` issues or conversation context.
