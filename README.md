# Psych
Exploring the intersection of AI, Automation and human thinking

## CoachConnect

WhatsApp automation app for Maroof Anwar's NIETE school groups. See `notes/planning.md`
for the full plan and `structure.md` for the repo layout.

### Local development

Requires Node 20+.

```bash
# Backend
cd backend
cp .env.example .env   # fill in JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, ANTHROPIC_API_KEY
npm install
npm run prisma:migrate
npm run dev             # http://localhost:4000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Sign in at `http://localhost:5173/login` with the `ADMIN_EMAIL`/`ADMIN_PASSWORD` from
`backend/.env`, then open the Dashboard and scan the QR code with the **CoachConnect
SIM** (never your personal WhatsApp number).

### Docker deploy

```bash
cp backend/.env.example backend/.env   # fill in real values first
docker compose up --build -d
```

Frontend serves at `:8080`, backend at `:4000` — the frontend build is pointed at
`http://localhost:4000` for local testing (see `docker-compose.yml`). Backend data
(SQLite DB + WhatsApp session) persists in the `backend-data` volume across restarts.
Note: since frontend and backend are different origins even locally, the login cookie
needs `COOKIE_CROSS_ORIGIN=true` + HTTPS to work under `docker compose up` — for testing
the login flow locally, prefer `npm run dev` in both folders instead (same-origin via
Vite's dev proxy).

### Production deploy (Railway)

CoachConnect needs an always-on process (whatsapp-web.js keeps a live session) and a
persistent disk (SQLite DB + WhatsApp login), which rules out serverless hosts. Railway
gives both plus GitHub auto-deploy, so it's the recommended target.

Two services from this one repo, each with its own public domain:
- **backend** — root directory `backend/`, builds from `backend/Dockerfile`, needs a
  persistent **Volume** mounted at `/app/data`.
- **frontend** — root directory `frontend/`, builds from `frontend/Dockerfile`. It
  calls the backend's public URL directly (baked in at build time via the
  `VITE_API_BASE_URL` build arg), rather than routing through Railway's private
  network — simpler and works the same on any host.

Backend environment variables: `DATABASE_URL` (`file:./data/coachconnect.db`, pointing
into the mounted volume), `JWT_SECRET` (long random string), `ADMIN_EMAIL`,
`ADMIN_PASSWORD`, `ANTHROPIC_API_KEY` (optional), `FRONTEND_ORIGIN` (the frontend's
public Railway URL), and `COOKIE_CROSS_ORIGIN=true` (required — frontend and backend
are different domains in production). Frontend build variable: `VITE_API_BASE_URL` set
to the backend's public Railway URL.

Run `npx prisma migrate deploy` once after the backend's first deploy (Railway's
Deploy Logs / a one-off shell command) to create the schema on the mounted volume.

After both services are live, open the frontend's public URL, sign in, and scan the
WhatsApp QR code from the Dashboard with the spare CoachConnect SIM.
