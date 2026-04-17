# Istanbul 2026

Sito per la gita di famiglia a Istanbul dal 29 ottobre al 2 novembre 2026.

Stack: **Astro 5** · **Svelte 5** (runes) · **Tailwind CSS 4** · **TypeScript** · **Leaflet** · **Motion**.
Build statico → hostabile su qualsiasi CDN. Deploy target: **Render.com static site**.

## Sviluppo locale

```bash
npm install
npm run dev
# http://localhost:4321
```

## Build e preview

```bash
npm run build          # output in dist/
npm run preview        # serve dist/ in locale
```

## Test E2E

```bash
npm run test:install   # scarica chromium Playwright (solo prima volta)
npm run test           # esegue tests/e2e.spec.ts su desktop + mobile
```

## Struttura

- `src/content/` — dati tipizzati (giorni, attrazioni, piatti, quartieri, trasporti, checklist)
- `src/pages/` — pagine Astro (7 sezioni + 5 giorni dinamici)
- `src/components/` — componenti Astro + Svelte islands (mappa, checklist, calcolatori)
- `src/lib/` — utility (date, map, storage, constants)
- `src/styles/` — Tailwind 4 + tokens + pattern
- `public/img/` — foto Wikimedia Commons (crediti in `CREDITS.md`)
- `public/patterns/` — SVG decorativi ottomani
- `tests/` — Playwright E2E

## Modificare i dati

Ogni entità è un file JSON in `src/content/<tipo>/`. Lo schema Zod in `src/content/config.ts` valida al build. Aggiungere/modificare entry è sicuro: se il JSON rompe lo schema, il build fallisce con messaggio chiaro.

## Deploy su Render

Il `render.yaml` committato configura la static site:

- build: `npm ci && npm run build`
- publish: `./dist`
- cache headers: `/_astro/*` immutable 1 anno, `/img/*` 30 giorni, tutto il resto 1 ora

Render auto-deploya su ogni push al branch `main`.
