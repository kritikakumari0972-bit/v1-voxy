# AniHindi / Voxy Anime

A React + TypeScript + Vite anime discovery app.

## Features

- Searchable anime metadata catalogue powered by Jikan (MyAnimeList metadata).
- Popular anime feed, genre and format filters, and pagination.
- Title details, official trailer links, and episode guide metadata.
- Local watchlist and playback history for direct video sources that expose real playback time.
- Hindi-audio and playback labels are evidence-gated. Jikan metadata alone does not prove a dub or grant streaming rights.

## Run locally

```bash
npm install
npm run lint
npm run build
npm run dev
```

## Render deployment

This repo includes a root `render.yaml` Blueprint for a Render Static Site. It builds the Vite app and publishes `dist/`. In Render, connect the repository and apply the Blueprint.

The site is static; it does not require a Node web service or a database. Jikan requests run from the browser. External API availability and rate limits are outside this app's control.

## Rights and playback policy

No episode stream is generated from a MAL/Jikan ID. An episode source must be added by an operator only after documenting the source's streaming rights, India territory, free and ad-free terms, and the actual audio language. The player rejects entries that lack this information. The app does not scrape streams, bypass DRM, or remove paywalls.

To allow a source, add it to an Anime record with:
- HTTPS player/media URL and HTTPS rights evidence URL.
- `rightsStatus: "verified"`.
- `free: true` and `adFree: true`.
- `territories` containing `"IN"` or `"*"`.
- `audioLanguages` listing only checked audio tracks.
- Optional ISO date `expiresAt` for time-limited permission.

## Data notes

Anime titles, scores, posters, and episode guide entries are metadata, not video files. Hindi audio appears as verified only when a public evidence page and territory have been reviewed. Unverified claims are intentionally hidden.
