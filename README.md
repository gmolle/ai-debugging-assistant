# AI Debugging Assistant

Web app that takes a **stack trace** and **related code**, calls an LLM, and returns a structured **root cause**, **explanation**, and **suggested fixes** with confidence hints. Successful runs can be **saved** (Postgres) and reopened from **recent history**.

---

## Using the app

### Main flow

1. **Stack trace** — Paste the exception and frames (plain text).
2. **Code snippet** — Paste the code the error refers to (syntax highlighting follows the language you pick).
3. **Language** — Choose the programming language (used for prompts and highlighting).
4. Click **Analyze**.

While the request runs, the editors are read-only and a loading state is shown. Analysis can take a while, especially if the API was idle (cold start).

### Results

- **Root cause** — Short summary of what went wrong.
- **Explanation** — Longer context in plain language.
- **Suggested fixes** — One or more items, each with:
  - A description you can **copy**
  - A **confidence** bar (values are normalized to 0–1 for display)
  - Optional **suggested code** blocks when the model returns them

### History (sidebar)

- **Recent** lists saved analyses (newest first). Click an entry to load its stack trace, code, language, and full analysis into the main view.
- **Language** filter narrows the list (e.g. only Python); it does not change the language of the current form until you pick an item or change the dropdown yourself.
- **Refresh** reloads the list from the server.
- **Delete** (trash on a row) removes that saved analysis; if it was the one open, the main results clear.

### Other controls

- **New analysis** clears the form and results so you can start fresh (disabled while an analyze request is in progress).
- If the API suggests a different **language** (e.g. mismatch detection), an error banner may offer a one-click action such as **Use Python** to switch the dropdown and dismiss the error.

---

## Run locally

From the **repository root**:

```bash
npm install
npm run dev
```

This starts **PostgreSQL** (Docker), then **Spring Boot** (port **8080**) and **Vite** (port **5173**). Open **http://localhost:5173**.

Set your key in **`backend/.env`** (gitignored):

```bash
OPENAI_API_KEY=sk-...
```

One line, no spaces around `=`. Restart the backend if you change it. Do **not** put the key in `frontend/.env` or any `VITE_*` variable (those are exposed to the browser).

**Docker not running?** Start Docker Desktop first, or use **`npm run dev:offline`** for a quick UI/API run without Postgres (history may be missing or non-persistent).

**Check everything compiles** (no servers):

```bash
npm run verify
```

---

## Project layout

| Path | Role |
|------|------|
| `backend/` | Spring Boot API, OpenAI integration, JPA + Flyway |
| `frontend/` | React + TypeScript + Tailwind + Vite |
| `docker-compose.yml` | Local Postgres for `npm run dev` |

For API shapes and server configuration details, see the code under `backend/src/main/java/...` and `application.yml`.
