## Application layout

- **Frontend (React)**  
  UI components live at the repository root (`*.tsx`, CSS assets, `main.tsx`, `index.html`). The React entry point renders the router and talks to the backend via `api.ts`/`apiClient.ts`, which already include offline detection and retry handling.

- **Backend (Node HTTP)**  
  A lightweight, dependency-free server is provided in `backend/server.js`. It exposes `/api/health`, `/api/readiness`, and `/api/status` endpoints so the frontend can quickly detect availability, and it applies backpressure when the server is saturated to stay reliable under load.

## Running locally

1. Start the backend (defaults to `http://localhost:5000` to match the frontend configuration):  
   ```bash
   npm run start:backend
   ```
2. Start your frontend dev server/build as usual; API calls to `/api/*` will reach the backend above.

## Resilience and concurrency guardrails

- **Health & readiness probes:** `/api/health` and `/api/readiness` return uptime, load, and memory snapshots for liveness and deployment checks.
- **Backpressure:** The backend caps concurrent in-flight requests (`MAX_INFLIGHT`, default 250) and returns `503` with `Retry-After` semantics when saturated.
- **Graceful shutdown:** SIGINT/SIGTERM trigger a drain period so in-flight work can complete before the process exits.
- **Timeout hardening:** Request, keep-alive, and header timeouts are set to avoid hung connections.
- **CORS enabled:** Safe defaults allow the React frontend to call the API across origins during development.
