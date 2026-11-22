# Voxy Anime

Voxy is a React + TypeScript + Vite anime discovery app. The interface uses live catalogue data; it does not ship a demo catalogue as a substitute when an API is unavailable.

## Features

- Live anime discovery, search, genre filters, trending and top-rated views powered by the public AniList GraphQL API.
- API-derived result totals and pagination. Counts are never hard-coded.
- Adult entries excluded from catalogue queries with AniList's `isAdult: false` filter.
- Anime profiles, official trailer previews and a MyAnimeList episode metadata guide where an MAL ID is linked.
- Browser-local watchlist and playback progress for approved direct video sources.
- Full episode playback is only enabled for streams with verified rights evidence, India territory permission, free/ad-free terms, HTTPS media and a checked audio language.

## Run locally

```bash
npm install
npm run lint
npm run build
npm run dev
```

## Render deployment

The root `render.yaml` Blueprint deploys the Vite frontend as a Render Static Site and publishes `dist/`. It does not require a Start or Run command.

## Catalogue and count accuracy

The catalogue total is read from AniList's live API response for the active search/filter. AniList documents 20,000+ anime entries; its 100,000+ figure refers to manga entries, not anime. Voxy therefore does not claim 100,000 anime titles. The live total can change as the upstream catalogue changes.

AniList API documentation: https://docs.anilist.co/

## Playback and rights policy

AniList and MyAnimeList provide anime metadata, not episode video files or streaming permission. A trailer URL is labelled as a trailer preview. Episode names and dates are metadata only.

Voxy does not scrape third-party streams, bypass DRM, remove paywalls, or infer streaming rights from an anime ID. An operator-added episode source must provide:
- An HTTPS player/media URL and public HTTPS rights-evidence URL.
- `rightsStatus: "verified"`.
- `free: true` and `adFree: true`.
- `territories` containing `"IN"` or `"*"`.
- `audioLanguages` containing only audio tracks that have been checked.
- An optional future ISO `expiresAt` date for time-limited permission.

## Hindi audio labels

The catalogue metadata API does not prove that a Hindi dub exists or that it may be streamed. Voxy shows a verified Hindi-audio label only when separate public evidence and territory details have been reviewed.
