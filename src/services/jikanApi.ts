import { Anime } from '../types/anime';

const ANILIST_URL = 'https://graphql.anilist.co';
const JIKAN_URL = 'https://api.jikan.moe/v4';
const CACHE_TTL = 12 * 60 * 60 * 1000;
const cache = new Map<string, { value: unknown; savedAt: number }>();
let anilistQueue: Promise<unknown> = Promise.resolve();
let anilistNextAt = 0;
let jikanQueue: Promise<unknown> = Promise.resolve();
let jikanNextAt = 0;

const ANIME_QUERY = `
query VoxyAnimeCatalogue($page: Int, $perPage: Int, $search: String, $genre: String, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total currentPage lastPage hasNextPage }
    media(type: ANIME, search: $search, genre: $genre, isAdult: false, sort: $sort) {
      id
      idMal
      title { romaji english native }
      coverImage { large extraLarge }
      bannerImage
      description(asHtml: false)
      averageScore
      popularity
      episodes
      format
      status
      startDate { year }
      duration
      genres
      studios(isMain: true) { nodes { name isAnimationStudio } }
      trailer { id site }
    }
  }
}`;

export interface AnimeSearchResult {
  animes: Anime[];
  hasNextPage: boolean;
  total: number;
  source: 'anilist' | 'unavailable';
  error?: string;
}

export interface JikanEpisode {
  mal_id: number;
  number: number;
  title: string;
  titleJapanese?: string;
  titleRomanji?: string;
  aired?: string;
  score?: number;
  filler?: boolean;
  recap?: boolean;
  url?: string;
}

export interface JikanEpisodePage {
  episodes: JikanEpisode[];
  hasNextPage: boolean;
}

type CatalogueSort = 'POPULARITY_DESC' | 'TRENDING_DESC' | 'SCORE_DESC' | 'START_DATE_DESC';

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key) as { value: T; savedAt: number } | undefined;
  return entry && Date.now() - entry.savedAt < CACHE_TTL ? entry.value : undefined;
}

function setCached<T>(key: string, value: T): void {
  cache.set(key, { value, savedAt: Date.now() });
}

function cleanDescription(value: unknown): string {
  return String(value || 'No synopsis is available from the catalogue.')
    .replace(new RegExp('<br[^>]*>', 'gi'), ' ')
    .replace(new RegExp('<[^>]*>', 'g'), ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#039;', "'")
    .replaceAll('&nbsp;', ' ')
    .split(String.fromCharCode(10)).join(' ')
    .split(String.fromCharCode(13)).join(' ')
    .split(String.fromCharCode(9)).join(' ')
    .split(' ').filter(Boolean).join(' ')
    .trim();
}
function mapFormat(value: unknown): Anime['type'] {
  if (value === 'MOVIE') return 'Movie';
  if (value === 'OVA') return 'OVA';
  if (value === 'TV' || value === 'TV_SHORT') return 'TV';
  return 'Special';
}

function mapStatus(value: unknown): Anime['status'] {
  if (value === 'RELEASING') return 'Currently Airing';
  if (value === 'NOT_YET_RELEASED') return 'Not yet aired';
  return 'Finished Airing';
}

function mapAniListAnime(item: any): Anime {
  const titleEnglish = item?.title?.english || undefined;
  const titleRomaji = item?.title?.romaji || undefined;
  const title = titleEnglish || titleRomaji || item?.title?.native || 'Untitled anime';
  const trailerId = item?.trailer?.site?.toLowerCase() === 'youtube' ? item.trailer.id : undefined;
  const studioNodes = Array.isArray(item?.studios?.nodes) ? item.studios.nodes : [];

  return {
    id: Number(item?.id) || 0,
    mal_id: Number(item?.idMal) || 0,
    title,
    titleEnglish,
    titleJapanese: item?.title?.native || undefined,
    image: item?.coverImage?.extraLarge || item?.coverImage?.large || '',
    bannerImage: item?.bannerImage || undefined,
    synopsis: cleanDescription(item?.description),
    score: Number(item?.averageScore) ? Number(item.averageScore) / 10 : 0,
    popularity: Number(item?.popularity) || undefined,
    type: mapFormat(item?.format),
    episodes: Number.isFinite(item?.episodes) ? Number(item.episodes) : null,
    status: mapStatus(item?.status),
    duration: Number(item?.duration) ? String(item.duration) + ' min per episode' : 'Unknown',
    rating: item?.isAdult ? 'Adult' : 'Not rated by source',
    year: Number(item?.startDate?.year) || undefined,
    genres: Array.isArray(item?.genres) ? item.genres.filter((genre: unknown): genre is string => typeof genre === 'string') : [],
    studios: studioNodes.filter((studio: any) => studio?.isAnimationStudio !== false).map((studio: any) => String(studio?.name || '')).filter(Boolean),
    trailerYoutubeId: trailerId,
    trailerEmbedUrl: trailerId ? 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(trailerId) : undefined,
    hindiDub: { isAvailable: false, verificationStatus: 'unverified' },
    streams: []
  };
}

async function requestAniList(query: string, variables: Record<string, unknown>): Promise<any> {
  const job = anilistQueue.then(async () => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const wait = Math.max(0, anilistNextAt - Date.now());
      if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
      anilistNextAt = Date.now() + 1100;

      const response = await fetch(ANILIST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query, variables })
      });
      if ((response.status === 429 || response.status >= 500) && attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)));
        continue;
      }
      if (!response.ok) throw new Error('AniList returned HTTP ' + response.status + '. Please retry in a moment.');
      const payload = await response.json();
      if (Array.isArray(payload?.errors) && payload.errors.length) {
        throw new Error(String(payload.errors[0]?.message || 'AniList could not complete this catalogue request.'));
      }
      return payload?.data;
    }
    throw new Error('AniList is temporarily rate-limiting requests. Please try again shortly.');
  });
  anilistQueue = job.then(() => undefined, () => undefined);
  return job;
}

export async function searchAnimeFromApi(
  query: string,
  genre?: string,
  page = 1,
  limit = 24,
  sort: CatalogueSort = 'POPULARITY_DESC'
): Promise<AnimeSearchResult> {
  const cleanQuery = query.trim();
  const cleanGenre = genre && genre !== 'All Genres' ? genre : '';
  const cacheKey = ['catalogue', cleanQuery.toLowerCase(), cleanGenre, page, limit, sort].join(':');
  const cached = getCached<AnimeSearchResult>(cacheKey);
  if (cached) return cached;

  try {
    const data = await requestAniList(ANIME_QUERY, {
      page: Math.max(1, page),
      perPage: Math.min(50, Math.max(1, limit)),
      search: cleanQuery || null,
      genre: cleanGenre || null,
      sort: [sort]
    });
    const pageData = data?.Page;
    const raw = Array.isArray(pageData?.media) ? pageData.media : [];
    const result: AnimeSearchResult = {
      animes: raw.map(mapAniListAnime),
      hasNextPage: Boolean(pageData?.pageInfo?.hasNextPage),
      total: Number(pageData?.pageInfo?.total) || 0,
      source: 'anilist'
    };
    setCached(cacheKey, result);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The anime catalogue is unavailable right now.';
    return { animes: [], hasNextPage: false, total: 0, source: 'unavailable', error: message };
  }
}

export async function getTopAnimeList(
  page = 1,
  filterType: 'bypopularity' | 'score' | 'trending' | 'upcoming' = 'bypopularity'
): Promise<Anime[]> {
  const sort: CatalogueSort = filterType === 'score'
    ? 'SCORE_DESC'
    : filterType === 'trending'
      ? 'TRENDING_DESC'
      : filterType === 'upcoming'
        ? 'START_DATE_DESC'
        : 'POPULARITY_DESC';
  const result = await searchAnimeFromApi('', 'All Genres', page, 24, sort);
  return result.animes;
}

async function requestJikan(path: string): Promise<any> {
  const job = jikanQueue.then(async () => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const wait = Math.max(0, jikanNextAt - Date.now());
      if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
      jikanNextAt = Date.now() + 450;
      const response = await fetch(JIKAN_URL + path, { headers: { Accept: 'application/json' } });
      if ((response.status === 429 || response.status === 503) && attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)));
        continue;
      }
      if (!response.ok) throw new Error('Episode guide returned HTTP ' + response.status + '.');
      return response.json();
    }
    throw new Error('Episode metadata is rate-limited. Try again shortly.');
  });
  jikanQueue = job.then(() => undefined, () => undefined);
  return job;
}

export async function getAnimeEpisodes(malId: number, page = 1): Promise<JikanEpisodePage> {
  if (!Number.isFinite(malId) || malId <= 0) return { episodes: [], hasNextPage: false };
  const key = 'episode-guide:' + malId + ':' + page;
  const cached = getCached<JikanEpisodePage>(key);
  if (cached) return cached;

  const json = await requestJikan('/anime/' + encodeURIComponent(String(malId)) + '/episodes?page=' + Math.max(1, page));
  const episodes: JikanEpisode[] = (Array.isArray(json?.data) ? json.data : []).map((item: any, index: number) => ({
    mal_id: Number(item?.mal_id) || ((page - 1) * 100 + index + 1),
    number: Number(item?.episode) || ((page - 1) * 100 + index + 1),
    title: item?.title || 'Episode ' + ((page - 1) * 100 + index + 1),
    titleJapanese: item?.title_japanese || undefined,
    titleRomanji: item?.title_romanji || undefined,
    aired: item?.aired || undefined,
    score: Number(item?.score) || undefined,
    filler: Boolean(item?.filler),
    recap: Boolean(item?.recap),
    url: item?.url || undefined
  }));
  const result = { episodes, hasNextPage: Boolean(json?.pagination?.has_next_page) };
  setCached(key, result);
  return result;
}
