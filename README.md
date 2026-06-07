# customfy

A monorepo with a **NestJS** backend and a **React + Vite** frontend, plus GitHub Actions CI/CD. The structure mirrors [cryptly](https://github.com/cryptly-dev/cryptly).

## Structure

```
.
├── backend/     # NestJS API (TypeScript, pnpm)
├── frontend/    # React + Vite + Tailwind (TypeScript, pnpm)
├── .github/
│   ├── workflows/   # CI/CD pipelines
│   └── templates/   # Reusable composite actions (build/push, deploy, prune)
└── Makefile     # Dev convenience commands
```

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 10+
- [Docker](https://www.docker.com/) (optional, for container builds)

## Getting started

Install dependencies for both apps:

```bash
make install
```

Run both apps in development (backend on `:3000`, frontend on `:5173`):

```bash
make dev
```

Or set up local env files and run everything in one step:

```bash
make local
```

Run them individually:

```bash
make backend    # NestJS dev server (watch mode)
make frontend   # Vite dev server
```

## Backend

```bash
cd backend
pnpm run start:dev   # dev server with watch
pnpm run build       # compile to dist/
pnpm run test        # unit tests
pnpm run test:e2e    # e2e tests (uses in-memory MongoDB)
pnpm run lint        # eslint
pnpm run migrate-up  # run MongoDB migrations
```

Environment variables — copy `backend/.env.example` to `backend/.env`. The app reads config through `src/shared/config/env-config.ts` and requires `MONGO_URL`.

Swagger API docs are served at `/docs` when the server is running.

A multi-stage `backend/Dockerfile` builds a production image.

### MongoDB

- Connection is wired via `@nestjs/mongoose` in `src/app.module.ts` (`MongooseModule.forRoot`).
- The `user` module (`src/user`) is a representative schema following a `core` / `read` / `write` layout.
- Schema migrations live in `backend/mongo-migrations` and run with [migrate-mongo](https://github.com/seppevs/migrate-mongo) (`pnpm run migrate-up`).
- e2e tests spin up an in-memory MongoDB via `mongodb-memory-server`, so no running database is required for `pnpm run test:e2e`.

Run a local MongoDB with Docker:

```bash
docker run -d --name customfy-mongo -p 2137:27017 mongo:8
```

### Authentication (Google login)

Google sign-in uses the OAuth 2.0 **Authorization Code** flow, the same as Cryptly:

1. The frontend redirects to Google with `client_id`, `redirect_uri` (the app URL) and `scope=openid email profile`.
2. Google redirects back to the app with a `?code=...`.
3. The frontend posts the code to `POST /auth/google/login`.
4. The backend exchanges the code for the user's email/avatar, upserts a `User`, and returns a signed JWT.
5. The frontend stores the JWT and sends it as `Authorization: Bearer <token>` on subsequent requests.

A global `AuthGuard` (`src/auth/core`) protects every route by default; routes opt out with `@Public()`, and `@CurrentUserId()` injects the authenticated user id. JWTs are issued/verified by `CustomJwtService` (`src/auth/custom-jwt`).

Local development uses the **real database** (your `MONGO_URL`) and **real Google OAuth**. Set the Google credentials in `backend/.env` and `frontend/.env`, then run `make local` (or `make dev`).

#### Production + local with one Google client (alternative redirect URI)

Like Cryptly, a single Google OAuth client supports both production and localhost via two redirect URIs and a `forceLocalLogin` flag:

- `GOOGLE_REDIRECT_URI` — the production redirect (used by the deployed frontend).
- `GOOGLE_REDIRECT_URI_ALTERNATIVE` — the localhost redirect, used when the request carries `forceLocalLogin`.

The frontend always redirects to its **own origin** (`window.location.origin`) and sends `forceLocalLogin: true` automatically when it runs on `localhost`. The backend then exchanges the code using `GOOGLE_REDIRECT_URI_ALTERNATIVE` (localhost) or `GOOGLE_REDIRECT_URI` (production) to match. **Register both origins** as Authorized redirect URIs in the Google console (e.g. your Vercel URL like `https://customfy.vercel.app` and `http://localhost:5173`). So there are no per-environment frontend URL vars to manage — `GOOGLE_REDIRECT_URI` (backend) just needs to equal the deployed frontend origin.

### Optional dev-only local login (no Google)

As a fallback, there's an email-only login (handy for tests/offline work), gated by a flag and disabled by default / in production:

- Backend: `ALLOW_LOCAL_LOGIN=true` enables `POST /auth/local/login` (email → JWT).
- Frontend: `VITE_ALLOW_LOCAL_LOGIN=true` makes the login screen show an email form instead of "Sign in with Google".

Leave both unset/`false` to use real Google OAuth (the default).

### Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | public | Liveness check |
| GET | `/users/count` | public | Number of users (demonstrates DB connectivity) |
| POST | `/auth/google/login` | public | Exchange a Google auth code for a JWT |
| POST | `/auth/local/login` | public | Email-only login (only when `ALLOW_LOCAL_LOGIN=true`) |
| GET | `/users/me` | bearer | Current authenticated user |
| GET | `/docs` | public | Swagger UI |

## Frontend

```bash
cd frontend
pnpm run dev      # dev server
pnpm run build    # production build to dist/
pnpm run lint     # eslint
pnpm run preview  # preview the production build
```

Environment variables — copy `frontend/.env.example` to `frontend/.env` (`VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`). When the app runs on `localhost` it automatically targets the local backend at `http://localhost:3003` and ignores `VITE_API_URL`, so a single `.env` with remote values works for both local and production.

The app has two screens:

- **Login** (`src/components/LoginScreen.tsx`) — a Cryptly-style centered card with a "Sign in with Google" button.
- **Home** (`src/components/Home.tsx`) — the placeholder shown after login.

`src/App.tsx` chooses the screen based on the stored JWT and handles the Google `?code=` callback.

### Hosting on Vercel

The frontend is deployed to Vercel. In the Vercel project, set the root directory to `frontend/` and add the environment variables `VITE_API_URL` (your backend URL) and `VITE_GOOGLE_CLIENT_ID`. Vercel builds with Vite and auto-serves the SPA. The frontend redirects to its own origin, so make sure the Vercel URL is registered as an Authorized redirect URI in the Google console and equals the backend's `GOOGLE_REDIRECT_URI`.

## CI/CD

GitHub Actions workflows live in `.github/workflows`:

- **backend-deploy.yml** — on push to `main` (when `backend/**` changes): runs e2e tests, builds and pushes a Docker image to Docker Hub, deploys it to a VPS over SSH, then prunes old images.
- **backend-ci.yml** — on pull requests: builds and tests the backend.
- **frontend-ci.yml** — on pull requests: lints and builds the frontend.

The backend deploy steps use reusable composite actions in `.github/templates`. The frontend is deployed by Vercel (not GitHub Actions).

### Deployment credentials

All credentials needed by the workflows are listed with placeholders in [`deploy.env.example`](./deploy.env.example). Copy it to `deploy.env` (gitignored) to keep your real values handy, then add them to GitHub under **Settings → Secrets and variables → Actions**.

Repository **Secrets** (used by the backend VPS/Docker deploy):

| Secret | Description |
| --- | --- |
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token (read/write) |
| `DOCKER_IMAGE_NAME` | Image name, e.g. `user/customfy-backend` |
| `SSH_HOST` | VPS host/IP |
| `SSH_USERNAME` | SSH user on the VPS |
| `SSH_PORT` | SSH port (usually `22`) |
| `SSH_PRIVATE_KEY` | SSH private key authorized on the VPS |
| `JWT_SECRET` | App JWT secret |
| `WEB_APP_URL` | Public frontend URL (production) |
| `WEB_APP_URL_ALTERNATIVE` | Localhost frontend URL for local logins (optional) |
| `MONGO_URL` | MongoDB connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Google OAuth redirect URI (must match the frontend, i.e. the Vercel URL) |
| `GOOGLE_REDIRECT_URI_ALTERNATIVE` | Localhost redirect for local dev (optional) |

The **frontend** is deployed by Vercel. Its env vars are configured in the Vercel project settings (not GitHub):

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Public backend URL on your VPS |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (same as `GOOGLE_CLIENT_ID`) |
