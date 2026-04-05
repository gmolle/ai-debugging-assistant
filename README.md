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

Put your key in **`backend/.env`** as `OPENAI_API_KEY=sk-...` (one line, no spaces around `=`; optional quotes around the value). That file is gitignored. On startup the backend reads **`.env` from its working directory** (the `backend/` folder when you use `npm run dev`). OS environment variables override the file. You should see a log line like `Loaded N variable(s) from .env` when it worked.

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
5. Optional `frontend/.env`: set `VITE_API_BASE_URL` to your API origin when the UI is **not** served by Vite dev (e.g. deployed). During `npm run dev`, if that variable is unset or blank, the UI calls **`/api/...` on the Vite origin** and Vite **proxies** those requests to `http://localhost:8080`, which avoids accidental 404s from hitting the wrong host.

## API

- **`POST /api/analyze`** — JSON body: stack trace, optional code snippet, language. Returns structured fixes and confidence; when `app.analysis.persist-results` is `true`, the row is stored after a successful model response.
- **`GET /api/analyses/recent?limit=`** — Recent saved analyses (newest first). Default limit **20**, maximum **50**. Each item includes `id`, `createdAt`, `language`, and short preview fields derived from the stored result.
- **`GET /api/analyses/{id}`** — Full detail for one saved analysis: stack trace, code, language, and the same analysis payload shape as `POST /api/analyze`.
- **`DELETE /api/analyses/{id}`** — Remove one saved analysis; **204** on success, **404** if the id does not exist.

With **`npm run dev:offline`**, the app uses in-memory H2 and no Flyway migration matching production; the analyses table may be missing or data is ephemeral, so **history can be empty or reset** on restart. Use **`npm run dev`** with Postgres for persistent history like production-style local dev.

## Configuration

### OpenAI API key (do not commit)

The backend reads **`OPENAI_API_KEY`** from the **OS environment** (see `app.openai.api-key` in `application.yml`).

**Safe places**

- **Shell only (no secret file):** set the variable in the same terminal session before `npm run dev`:
  - Git Bash / WSL / macOS / Linux: `export OPENAI_API_KEY='sk-...'`
  - PowerShell: `$env:OPENAI_API_KEY='sk-...'`
- **Local file:** create **`backend/.env`** (gitignored) with `OPENAI_API_KEY=sk-...` (one line, no spaces around `=`). On startup the backend reads **`.env`** from the `backend/` working directory (e.g. `npm run dev`). OS environment variables override the file.

**Never**

- Put the key in **`frontend/.env`** or any **`VITE_*`** variable (those are bundled for the browser).
- Put the key in committed YAML, README, or chat snippets you paste into the repo.

**Before every commit**

```bash
git status
git diff
```

Confirm you do not see `OPENAI_API_KEY`, `sk-`, or a new tracked file like `backend/.env`. Optional check:

```bash
git check-ignore -v backend/.env
```

### Other settings

In `backend/src/main/resources/application.yml`:

- `app.openai`: `api-key` (from env), `model` (default `gpt-4o-mini`), `max-attempts`, `response-timeout`
- `app.analysis.persist-results`: save successful analyses to Postgres (default `true`; tests use `false`)

## Deploying the backend API

The API is a Spring Boot JAR; use **managed PostgreSQL** (Neon, Supabase, Render Postgres, Railway Postgres, etc.) and set configuration via **environment variables** (never commit secrets).

### Docker image

From the **`backend/`** directory:

```bash
docker build -t ai-debug-api .
docker run --rm -p 8080:8080 \
  -e OPENAI_API_KEY=sk-... \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://HOST:5432/DB?sslmode=require \
  -e SPRING_DATASOURCE_USERNAME=... \
  -e SPRING_DATASOURCE_PASSWORD=... \
  -e APP_CORS_ALLOWED_ORIGINS=https://your-app.vercel.app \
  ai-debug-api
```

Health check: **`GET /actuator/health`** (includes DB when configured).

### Environment variables (production)

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Required for `/api/analyze`. |
| `SPRING_DATASOURCE_URL` | JDBC URL, e.g. `jdbc:postgresql://HOST:5432/DB?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Postgres user |
| `SPRING_DATASOURCE_PASSWORD` | Postgres password |
| `APP_CORS_ALLOWED_ORIGINS` | Comma-separated browser origins (your Vercel URL + previews if needed). |
| `PORT` | Optional; platforms like Render/Railway set this. Default **8080** in `application.yml`. |

After the API has a public **HTTPS** URL, set **`VITE_API_BASE_URL`** on Vercel to that origin (no trailing slash) and redeploy the frontend.

### Platform notes

- **Render**: New **Web Service** → Docker, **Dockerfile path** `backend/Dockerfile`, **Docker build context** `backend`. Add the env vars above; create a **PostgreSQL** instance and copy its **Internal Database URL** into `SPRING_DATASOURCE_*` (use the JDBC form your provider documents).
- **Railway**: New project → deploy from GitHub → set **root directory** to `backend` (or use a Dockerfile service pointing at this repo with context `backend`). Add Postgres plugin and wire variables; Railway sets `PORT` automatically.
- **Fly.io**: `fly launch` from `backend/` after installing the CLI; set secrets with `fly secrets set`.

## Confidence scores

Model-returned fix confidence values outside `[0, 1]` are **clamped** to that range (documented for the UI); see the analysis service when implemented.
