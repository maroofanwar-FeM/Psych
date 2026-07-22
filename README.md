# Psych
Exploring the intersection of AI, Automation and human thinking

## CoachConnect

WhatsApp automation app for Maroof Anwar's 9 NIETE school groups. See `notes/planning.md`
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

Frontend serves at `:8080` (proxies `/api` to the backend internally); backend data
(SQLite DB + WhatsApp session) persists in the `backend-data` volume across restarts.

### Production deploy (Railway)

CoachConnect needs an always-on process (whatsapp-web.js keeps a live session) and a
persistent disk (SQLite DB + WhatsApp login), which rules out serverless hosts. Railway
gives both plus GitHub auto-deploy, so it's the recommended target.

Two services from this one repo:
- **backend** — root directory `backend/`, builds from `backend/Dockerfile`, needs a
  persistent **Volume** mounted at `/app/data`.
- **frontend** — root directory `frontend/`, builds from `frontend/Dockerfile`. Its
  nginx config reads `BACKEND_HOST`/`BACKEND_PORT` at container start (via
  `frontend/nginx-templates/default.conf.template`) so it can reach the backend over
  Railway's private network — set these to the backend service's Railway-internal
  hostname (e.g. `backend.railway.internal`) and port (`4000`).

Backend environment variables to set in the Railway dashboard: `DATABASE_URL` (e.g.
`file:./data/coachconnect.db`, pointing into the mounted volume), `JWT_SECRET` (long
random string), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ANTHROPIC_API_KEY`, `FRONTEND_ORIGIN`
(the frontend's public Railway URL). Run `npx prisma migrate deploy` once after first
deploy (Railway's Deploy Logs / a one-off shell command) to create the schema on the
mounted volume.

After both services are live, open the frontend's public URL, sign in, and scan the
WhatsApp QR code from the Dashboard with the spare CoachConnect SIM.
