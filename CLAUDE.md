# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Trailmark — a map-based travel log to record and revisit places you've been. Vue 3 + Vite SPA built on MapLibre GL, Quasar, and Pinia.

Note: `package.json` still has `"name": "dotnet-template"` and ships with .NET dev-cert tooling — this project is scaffolded from an internal shared template that pairs a Vue SPA with a .NET backend (see "Dev server & .NET dev-cert" below).

## Commands

- `npm run dev` — start Vite on `https://localhost:53090` (strict port; HTTPS via .NET dev-cert).
- `npm run build` — production build. Mode is required and is read from `npm_config_mode`, e.g. `npm run build --mode=Release` (modes starting with `Release` strip `console.log/debug/info/trace/table`). Env files live under `./envs/` (gitignored).
- `npm run preview` — preview the built bundle.
- `npm test` — Vitest. Run a single file: `npx vitest run src/path/to/file.spec.ts`. Tests are colocated as `*.spec.{js,ts}` or `*.test.ts`.
- `npm run format` — Prettier across the repo. `lint-staged` runs Prettier on `*.{js,vue,json}` via a `simple-git-hooks` pre-commit hook (installed by `npm install`'s `postinstall`).

### Dev server & .NET dev-cert

`vite.config.js` calls `scripts/make-certificate.js` in development, which shells out to `dotnet dev-certs https` to generate/trust `vite-https.pem` / `vite-https.key`. The .NET SDK must be installed locally for `npm run dev` to start. The dev server proxies `/api` → `https://localhost:55710/api/` (the paired .NET backend; `/api` prefix is stripped).

## Architecture

### App bootstrap

`src/main.js` wires Vue + router (`setupRouter()`) + Pinia + Quasar, and overrides Quasar `Screen.setSizes({ sm: 768, md: 1024, lg: 1280, xl: 1920 })` so `$q.screen.lt.sm` reflects the project's mobile breakpoint. `maplibre-gl` CSS must load before app styles.

### File-based routing

Routes are generated at build time from `src/pages/**/*.vue` via `import.meta.glob`, not declared by hand. See `src/router/routes/pagesRoutes.js` and `src/router/helper/routeHelper.js`:

- File path → route path: `/src/pages/` is stripped, `.vue` is stripped, `[param]` segments become `:param`, and a file named `Home.vue` collapses to the empty path (the default child route).
- A file named `Layout.vue` at any directory level becomes a parent route whose `<RouterView />` hosts its children — adding a `Layout.vue` next to nested pages turns that directory into a nested layout.
- Dev builds log a route table and throw if any non-root node lacks a matching `Layout.vue`.
- The current permission guard (`src/router/guards/permission.js`) is a stub — only `login` / `404` are whitelisted and everything else passes. The hook for per-route permissions exists (`config.meta.permission = getPermission(component)`) but is commented out in `routeHelper.js`.

### Map architecture (the core of the app)

The map layer is intentionally decoupled from Vue and supports multiple concurrent maps keyed by string.

- `src/map/composables/useMap.ts` is the single entry point. It keeps a module-level `Map<string, MapEntry>` of `{ mapRef, readyPromise, ... }` keyed by `MAP_KEYS` (see `mapKeys.ts`). The main map uses `MAP_KEYS.MAIN` (`'main'`); add new keys here for panel/secondary maps instead of hard-coding strings.
- Consumers call `useMap(key).init(container, options)` once (from `MapContainer.vue`) and `destroy()` on unmount. Everywhere else, use **`onMapReady(fn)`** inside `<script setup>` to register code that needs the live `maplibregl.Map`. `fn` may return a cleanup function that runs on `onBeforeUnmount` — this is the canonical way to bind/unbind MapLibre event listeners. For non-Vue / one-shot contexts use `whenMapReady()` (a Promise) instead.
- HMR: `import.meta.hot.dispose` tears down all map entries to avoid leaks.

### Map feature layout

`src/map/features/<feature>/` is the convention. Each feature owns its config, composable, optional store, and panel component. Examples:

- `basemap/` — `BASEMAP_CONFIG` (NLSC raster + Richi vector styles), `useBasemap()` composable, and a Pinia store (`basemapStore.ts`) that buckets the selected basemap by `mapKey` so each map remembers its own selection.
- `layers/` — `LAYER_CONFIG` (currently empty; basemaps were moved out). New business layers (`LayerDef` with `source` + `layers` arrays) go here and are applied via `useLayers(mapKey).syncLayers()`.
- `controls/`, `locate/`, `measurement/` (with a `domain/` folder of pure TS classes like `Area.ts` / `Distance.ts` that have unit tests), plus per-panel features (`treeQuery/`, `mapLocate/`).

UI shell:

- `src/pages/Home.vue` renders `<MapContainer><MapShell /></MapContainer>`. `MapContainer.vue` owns map init; `src/features/mapShell/MapShell.vue` overlays the chrome (header, drawer, tool dock, control buttons, and a single active panel selected by `activePanel` ref). On mobile (`$q.screen.lt.sm`), the hamburger opens a drawer and the active panel docks to the bottom; on tablet/desktop, the tool dock is a vertical rail and panels float top-left.

### HTTP layer

`src/api/HttpService.js` exports `createAxios(config)` → `HttpService` instances. Define a request once (`http.defineGet(uri)` / `definePost` / `defineRequest`), then call `.send(urlParams, bodyData)`. Features:

- Path templating: URLs with `{id}`-style segments are detected and filled from `urlParams` at send time, with the matched keys removed from query params.
- Each `HttpRequest` owns its own `AbortController`; calling `send` while a previous send is still pending aborts the previous one (also driven by `useRequest` composable in `src/composables/useRequest.js`). `useRequest` exposes `{ isLoading, isFinished, data, send, stop, onError }` and silently swallows `ERR_CANCELED`.
- Response interceptor unwraps `AxiosResponse.data` (except for `responseType: 'blob'`, where the full response is kept so `download()` can read `content-disposition`).
- `HttpService.setJWT(refreshUri, refreshStrategy)` returns a `JWT` helper that auto-adds `Authorization: Bearer …`, stores the token in `localStorage` under `${baseURL}.jwt`, and installs a 401 interceptor. Two built-in refresh strategies: `JWT.refreshOnDelay` (timer based on `exp` claim) and `JWT.refreshOn401` (retry after refresh on 401). Choose one when calling `setJWT`.

### Styles

- `src/styles/app-tokens.scss` and `map-shell.scss` are loaded globally in `main.js`. Quasar SCSS variables are overridden via `src/styles/quasar-variables.scss` (wired through `@quasar/vite-plugin`).
- Noto Sans TC Regular is self-hosted from `/public/fonts/`; other weights come from CDN inside `app-tokens.scss`.

### Aliases & TypeScript

`@/*` → `src/*` is configured in both `vite.config.js` and `tsconfig.json`. The codebase mixes `.js`/`.vue` (app shell, routing, HTTP) with `.ts` (map layer and its domain logic) — prefer TS for new map features, JS is fine elsewhere to match the surrounding files.
