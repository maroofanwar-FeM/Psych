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
