# CoachConnect — Project Structure

## Folder Layout

```
Coach Connect/
├── instructions/           # Rules and guidance for AI agents
│   └── CLAUDE.md           # Project-specific Claude rules (purpose, constraints, tone)
├── notes/                  # My notes, plans, and work journal
│   ├── planning.md         # The 5-step project plan
│   ├── feedback_loop.md    # How the project improves over time
│   ├── memory.md           # Lessons learned journal (dated entries)
│   └── decisions.md        # Decision log (what / why / ruled-out)
├── data/                   # Raw data and exports
│   └── (school lists, message logs, Google Sheet exports go here)
├── AGENTS.md               # Agent workflow instructions (bd/Beads integration)
├── CLAUDE.md               # Claude AI agent instructions (auto-managed by Beads)
├── README.md               # Project overview
└── structure.md            # This file
```

Hidden (auto-managed, do not edit by hand):

```
├── .beads/                 # Issue tracker database (bd commands read/write here)
├── .git/                   # Git history
├── .gitignore              # Git ignore rules
└── .claude/                # Claude Code settings
```

## Where Things Live

| Type of file | Folder |
|---|---|
| AI agent rules and instructions | `instructions/` |
| Project notes, plans, journals, decisions | `notes/` |
| Raw data, exports, spreadsheets | `data/` |
| Repo overview | `README.md` (root) |
| Issue tracking | `bd` CLI → `.beads/` |
| Agent workflow config | `AGENTS.md`, `CLAUDE.md` (root) |
