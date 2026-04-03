# AI Debugging Assistant

Monorepo: **Spring Boot** API + **React** (Vite) UI.

## Layout

```
├── backend/                 # Spring Boot 3, Java 17
│   └── src/main/java/com/aiddebuggingassistant/
│       ├── config/          # OpenAI properties, WebClient, CORS
│       ├── controller/      # REST
│       ├── domain/          # JPA entity
│       ├── dto/             # Request/response records
│       ├── exception/       # Global error handling
│       ├── repository/      # Spring Data JPA
│       └── service/         # Analysis pipeline (TODO)
├── frontend/                # Vite + React + TypeScript + Tailwind
└── docker-compose.yml       # PostgreSQL for local dev
```

## One command (full stack)

From the **repo root** (Git Bash / WSL / macOS / Linux):

```bash
npm install
npm run dev
```

This will:

1. Start Postgres (`docker compose up -d`)
2. Wait until port **5432** accepts connections
3. Run **Spring Boot** and **Vite** together (two processes; stop with Ctrl+C)

Open **http://localhost:5173** for the UI. The API is **http://localhost:8080**; health check: **http://localhost:8080/actuator/health** (includes DB status when Postgres is up).

Set `OPENAI_API_KEY` in your environment (or IDE run config) before analyzing; the app still starts without it.

The backend is started via [`scripts/mvnw.cjs`](scripts/mvnw.cjs) so **Windows** (cmd/PowerShell) and **Unix** both work without editing scripts.

### Docker error on Windows (`dockerDesktopLinuxEngine` / “pipe … not found”)

That means the **Docker engine is not running**. Start **Docker Desktop** and wait until it says it is running, then run `npm run dev` again.

If you want to work **without Docker** (in-memory H2 instead of Postgres, no Flyway):

```bash
npm run dev:offline
```

Use `npm run dev` when you need the real Postgres + Flyway setup (matches production-style local dev).

## Quick check (no dev servers)

After `npm install` at the repo root:

```bash
npm run verify
```

Runs **backend unit tests** (H2, no Docker) and a **frontend production build**. Use this for a fast “does it compile” check.

If **Docker Desktop** is running and you want Postgres up before that same check (optional):

```bash
npm run verify:integration
```

## Manual start (optional)

1. `docker compose up -d`
2. Set `OPENAI_API_KEY` for the backend
3. Backend: `cd backend && ./mvnw spring-boot:run` (Windows: `mvnw.cmd spring-boot:run`)
4. Frontend: `npm run dev -w frontend` from repo root, or `cd frontend && npm run dev`
5. Copy `frontend/.env.example` to `frontend/.env` if you need a non-default API URL

## Configuration

OpenAI timeout and retry cap live in `backend/src/main/resources/application.yml` under `app.openai` (`response-timeout`, `max-attempts`).

## Confidence scores

Model-returned fix confidence values outside `[0, 1]` are **clamped** to that range (documented for the UI); see the analysis service when implemented.
