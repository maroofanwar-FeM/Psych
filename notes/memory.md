# CoachConnect — Memory Journal

| Date | Task | Lesson Learned |
|---|---|---|
| 2026-06-18 | Reviewed agent_loop.md | Agents improve by cycling through observe → act → learn, not by getting it right first time. |
| 2026-06-18 | Deleted agent_loop.md from git | Use `git rm` to delete and stage in one step — a plain file delete leaves git out of sync. |
| 2026-06-21 | Created feedback_loop.md | Concepts stick when tied to real project steps, not kept abstract. |
| 2026-06-21 | Pushed feedback_loop.md to GitHub | Always run `git remote -v` first — the remote was already set and ready. |
| 2026-06-23 | Created this memory journal | Logging what you did and why is more useful than logging just what changed. |
| 2026-07-22 | Scaffolded the Step 3/4 app (React+Vite frontend, Express+Prisma/SQLite+whatsapp-web.js backend) | SQLite doesn't support Prisma's native `enum` type — modeled occasion/status as plain strings instead; caught this by actually running `prisma generate`, not just reading the schema. |
