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
