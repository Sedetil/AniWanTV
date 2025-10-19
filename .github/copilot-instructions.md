### Repo quick-context for AI coding agents

This repository is a Vite + React + TypeScript frontend (UI) with a small Flask-based scraper API in `app_with_scraper.py` used as a backend data source. The frontend expects a running API; by default the frontend points to a deployed URL in `src/api/animeApi.ts`.

Keep guidance short and actionable. Use these facts when implementing or changing code.

1. Project layout & responsibilities
   - Frontend: `src/` — React + TypeScript, Vite-powered. Routes are defined in `src/App.tsx` and pages live under `src/pages/` (e.g., `Index.tsx`, `AnimeDetails.tsx`, `WatchEpisode.tsx`).
   - API client: `src/api/animeApi.ts` — single source of truth for API endpoints and response shapes. Update this file if the backend contract changes.
   - Backend/scraper: top-level `app_with_scraper.py` — Flask app that scrapes third-party sites and exposes endpoints like `/top-anime`, `/latest-anime`, `/anime-details`, `/episode-streams`, `/search`, `/release-schedule`.
   - Config/aliases: `tsconfig.json` sets `@/*` → `src/*`. Prefer this alias in new TS imports.

2. Build / dev / debug commands
   - Install: `npm install` (or `yarn install`). See `package.json`.
   - Frontend dev: `npm run dev` (Vite server, default port in README is 3000). Use this to iterate on UI.
   - Frontend build: `npm run build` (or `npm run build:dev` for dev-mode build).
   - Lint: `npm run lint` (ESLint).
   - Backend: `app_with_scraper.py` is a Flask app — run with `python app_with_scraper.py` or a Flask runner. The code starts Flask on port 8080 when `keep_alive()` is used.
   - Common debugging pattern: run the Flask app locally, change `API_BASE_URL` in `src/api/animeApi.ts` to `http://localhost:8080` while developing the frontend.

3. API contract & shapes
   - `src/api/animeApi.ts` exports TypeScript interfaces for every endpoint (TopAnime, LatestAnime, AnimeDetails, EpisodeStream, Comic types). Use these interfaces for new code.
   - Frontend expects ApiResponse<T> = { success: boolean; data: T; error?: string } — adhere to this structure when modifying backend responses.

4. Patterns & conventions
   - React Query: data fetching uses `@tanstack/react-query` with a shared `QueryClient` in `src/App.tsx`. Prefer query keys matching domain (e.g., ['latestAnime', page]).
   - Error handling: `animeApi.ts` uses a centralized `handleApiError` that also shows Sonner toasts. When adding new API calls, reuse this pattern.
   - Path parsing: many components derive route params by parsing remote URLs (e.g., `comic.url.match(/\/komik\/([^/]+)\/?$/)`). Preserve existing regex-based extraction unless replacing with a robust router param.
   - UI primitives: Project uses shadcn-style components under `src/components/ui/`. Reuse those for consistent styling.

5. Integration notes / gotchas
   - The frontend currently points to a deployed API URL in `src/api/animeApi.ts` (variable `API_BASE_URL`). Change to local Flask when developing the backend locally.
   - `app_with_scraper.py` performs live scraping and can be slow or flaky; prefer mocking its responses in unit/component tests or use React Query's `staleTime` and `retry` options (already configured in `App.tsx`).
   - The scraper uses many heuristics and fallbacks (AJAX endpoints, iframe parsing, host-specific resolvers). When changing parsing logic, add logging like other functions (see `logger.info` / `logger.error`) and add tests against sample HTML snippets if possible.

6. Files to check when changing behavior
   - Backend scraping logic and endpoints: `app_with_scraper.py` (search, schedule, resolve_* functions)
   - Frontend API surface: `src/api/animeApi.ts` (endpoints & TS types)
   - Route wiring: `src/App.tsx`, pages in `src/pages/` (how routes consume API types)
   - UI components library: `src/components/ui/` (shared input/button/card primitives)

7. Tests and quality gates
   - No tests shipped. If you add tests, prefer React Testing Library for UI and small unit tests for `animeApi.ts` functions. Mock fetch calls and the Flask server.
   - Linting via `npm run lint`. Run it before sending PRs.

8. Example tasks and pointers
   - To add a new API endpoint: update `app_with_scraper.py` to return ApiResponse shape, then add a typed wrapper in `src/api/animeApi.ts` and a React Query hook in the page that consumes it.
   - To debug a failing stream resolver: add reproducible HTML snippets to `tests/fixtures` (create the folder) and write a small unit that runs the resolver functions against the fixture.

If anything here is unclear or you'd like more examples (sample request/response, fixture HTML locations, or a small unit-test harness), tell me which part to expand and I'll update this file.
