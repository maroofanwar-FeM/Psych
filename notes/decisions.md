# CoachConnect — Decision Log

---

## 1. Folder Structure

**Decided:** Organise files into `notes/`, `instructions/`, and `data/`.

**Why:** Files had no clear home as the project grew. Grouping by purpose makes it easier to find things and scale later.

**Ruled out:**
- Flat structure (everything at root) — unmanageable as files grow.
- `docs/` + `journal/` layout — rejected because it didn't match how you think about the project.

---

## 2. Installing Beads (bd)

**Decided:** Use the official Windows PowerShell install script to download the v1.0.4 binary directly.

**Why:** The npm package referenced v1.0.5 which didn't exist yet (404 error), and `curl | bash` runs remote code without inspection — a security risk.

**Ruled out:**
- `npm install -g @beads/bd` — failed, binary missing from releases.
- `curl | bash` quick-install — avoided due to security concerns.

---

## 3. memory.md Format

**Decided:** Simple table with three columns — Date, Task, Lesson Learned.

**Why:** Earlier drafts with headers, bullet points, and long prose were rejected twice for being too long. A table gives all the information in the least space.

**Ruled out:**
- Section-per-entry format with headers — too verbose.
- Narrative journal style — too informal and hard to scan.

---

## 4. Per-Directory SKILL.md Context Files + Autonomous Agents

**Decided:** Add a `SKILL.md` to each major folder (root, `notes/`, `instructions/`) documenting what lives there and how to work with it, and add three autonomous agent definitions under `.claude/agents/`: `issue-triage`, `message-drafter`, `session-closer`.

**Why:** As the project grew across folders, an AI agent starting fresh had no quick way to know what each folder was for or which conventions to follow. The three agents cover the recurring session tasks (status triage, message drafting, session close) so they don't need to be re-explained each time.

**Ruled out:**
- One giant root-level context file — rejected because it doesn't travel with the folder it describes, and gets out of sync as folders change independently.

---

## 5. Renamed feedback_loop.md to agent_loop.md

**Decided:** Rename `notes/feedback_loop.md` to `notes/agent_loop.md` and update all references (structure.md, SKILL.md files).

**Why:** The file describes how the *project* improves through send → observe → adjust → repeat, but the name "feedback_loop" was easy to confuse with user/customer feedback specifically. "agent_loop" better reflects that this is the loop an AI agent runs each cycle.

**Ruled out:**
- Keeping the original name — rejected after it caused confusion about whether the file was about customer feedback or the iteration process.

---

## 6. Real `.claude/skills/` Folder for Reusable Agent Skills

**Decided:** Add `.claude/skills/draft-message/SKILL.md` and `.claude/skills/log-decision/SKILL.md` as actual invokable Claude Code skills, extracted from logic that previously lived only inside the `message-drafter` and `session-closer` agent definitions.

**Why:** The project had three files named `SKILL.md` (root, `notes/`, `instructions/`) but none were real Claude Code skills — they were directory documentation that happened to share the name. Message-drafting rules and decision-log formatting were recurring, well-defined procedures duplicated only inside agent prompts, with no single source of truth and no way to invoke them without spinning up a full agent.

**Ruled out:**
- Renaming the existing directory-documentation `SKILL.md` files — left as-is since they serve a different, still-useful purpose (folder context, not invokable procedures); revisit only if the name collision causes real confusion.
- Also extracting a `close-session` skill from the `session-closer` agent — ruled out because session close needs judgment calls (what to file, what's actually done) that don't reduce well to a fixed procedure; kept as a full agent instead.

---

## 7. Build Steps 3 & 4 (the Real App) Before Step 2 Finishes

**Decided:** Start building the full web app (login, WhatsApp QR connect, schools, templates, schedule, sent log, AI draft helper, Send Now) now, in parallel with the still-in-progress Step 2 Make.com proof, rather than waiting for Step 2 to be validated first.

**Why:** Maroof explicitly asked to move to building the full application now that the planning artifacts were in place. Planning.md's own "Suggested Order" recommends finishing Steps 1+2 first, but that guidance is a default, not a hard gate — this was a deliberate, informed call to reorder rather than an oversight.

**Ruled out:**
- Refusing/delaying until Step 2 was proven — rejected because the request was explicit and the two tracks (a Make.com proof-of-concept and the real app) don't actually block each other technically.

---

## 8. App Stack: React+Vite / Node+Express+Prisma+SQLite / whatsapp-web.js

**Decided:** Frontend is React+Vite; backend is Express with Prisma ORM over SQLite; the WhatsApp layer uses `whatsapp-web.js` (QR-based, unofficial) wired for real rather than stubbed; AI drafting calls the Claude API directly, reusing `.claude/skills/draft-message/SKILL.md` as its system prompt so the app and the agents can't drift apart.

**Why:** Maroof deferred all three stack choices to my judgment. SQLite-via-Prisma keeps solo-scale deploy trivial while leaving a clean migration path to Postgres for Step 5 (multi-coach). whatsapp-web.js was chosen because planning.md is explicit that only the unofficial "scan QR code" method reaches WhatsApp *groups* at all — there's no official API path that fits the plan as written. Real integration (not a stub) was chosen since it's the actual core value of Step 3.

**Ruled out:**
- Plain HTML/CSS/JS frontend — rejected in favor of React for maintainability as the feature set grows toward Step 5.
- PostgreSQL now — rejected as unnecessary setup overhead for a single coach at 9 schools.
- Stubbing the WhatsApp layer behind a mock — rejected because a fake sender would leave the app's actual reason for existing untested; the real integration was built instead (it still needs a phone to scan the QR code, which no agent can do).

---

## 9. Deploy on Railway, Not Serverless or a Bare VPS

**Decided:** Deploy `backend/` and `frontend/` as two Railway services from the GitHub repo, with a persistent Volume on the backend for the SQLite DB and WhatsApp session.

**Why:** whatsapp-web.js needs an always-on process (serverless platforms like Vercel/Netlify kill or cold-start functions, which would drop the WhatsApp connection) and a persistent disk across restarts (the QR login and message history live there). Railway gives both, plus GitHub auto-deploy and a dashboard for env vars/logs — a bare VPS would match the existing `docker-compose.yml` more exactly but puts Maroof in charge of SSH access, OS patching, and security, which is unnecessary ongoing burden for a single-user tool.

**Ruled out:**
- Vercel/Netlify (serverless) — ruled out outright, incompatible with a persistent WhatsApp session.
- A DigitalOcean/Hetzner VPS running `docker-compose` directly — ruled out in favor of less ongoing maintenance, even though it needed zero code changes; revisit if Railway's cost or limits become a problem at Step 5 scale.
- Render — similar fit to Railway, but its free tier sleeps on inactivity (would drop the WhatsApp session) and persistent disks need a paid plan anyway, so it has no real edge over Railway here.

---

## 10. Frontend Calls the Backend's Public URL Directly, Not Through nginx/Private Networking

**Decided:** Mid-deployment, dropped the original design (frontend's nginx reverse-proxies `/api` to the backend over Railway's private network) in favor of the frontend calling the backend's public HTTPS URL directly, baked in at build time via `VITE_API_BASE_URL`. This makes the login cookie cross-origin, so it's now `SameSite=None; Secure` behind a `COOKIE_CROSS_ORIGIN=true` flag.

**Why:** While actually deploying, nginx failed to resolve `backend.railway.internal` at container start ("host not found in upstream") even though Railway's API reported the private network endpoint as ready — likely a resolver-configuration gap between nginx's default DNS setup and Railway's private network, not something worth debugging blind through slow rebuild/redeploy cycles. Calling the backend's public URL directly sidesteps private networking entirely, is easy to verify (curl the URL), and works identically on any host — not just Railway.

**Ruled out:**
- Continuing to debug the nginx private-network resolver — rejected because each attempt costs a full rebuild+redeploy cycle with no way to inspect Railway's internal DNS directly, versus a fix that could be verified immediately.
- Keeping same-origin cookies by finding another way to unify origins (e.g. a single combined service) — rejected as a bigger restructuring than the problem warranted; cross-origin cookies over HTTPS are a well-supported, standard pattern.
