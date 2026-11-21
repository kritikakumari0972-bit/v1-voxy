import { Anime } from '../types/anime';
import { CURATED_ANIME } from '../data/curatedAnime';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { value: unknown; timestamp: number }>();
let requestQueue: Promise<unknown> = Promise.resolve();
let nextRequestAt = 0;

const HINDI_TITLES: Record<string, string> = {
  'solo leveling': 'सोलो लेवलिंग',
  'naruto': 'नारुतो',
  'naruto shippuden': 'नारुतो: शिपुडेन',
  'dragon ball z': 'ड्रैगन बॉल ज़ेड',
  'dragon ball super': 'ड्रैगन बॉल सुपर',
  'demon slayer: kimetsu no yaiba': 'डिमॉन स्लेयर: किमेत्सु नो याइबा',
  'jujutsu kaisen': 'जुजुत्सु काइसेन',
  'death note': 'डेथ नोट',
  'one piece': 'वन पीस',
  'one punch man': 'वन पंच मैन',
  'attack on titan': 'अटैक ऑन टाइटन',
  'bleach': 'ब्लीच',
  'spy x family': 'स्पाई एक्स फैमिली',
  'chainsaw man': 'चेनसॉ मैन',
  'haikyu!!': 'हाइक्यू!!',
  'blue lock': 'ब्लू लॉक',
  'doraemon': 'डोरेमोन',
  'crayon shin-chan': 'क्रेयॉन शिन-चैन'
};

const GENRE_IDS: Record<string, number> = {
  action: 1,
  adventure: 2,
  avantgarde: 5,
  'award winning': 46,
  comedy: 4,
  drama: 8,
  fantasy: 10,
  gourmet: 47,
  horror: 14,
  mystery: 7,
  romance: 22,
  'sci-fi': 24,
  'slice of life': 36,
  sports: 30,
  supernatural: 37,
  suspense: 41,
  'boys love': 28,
  'girls love': 26,
  shoujo: 25,
  shounen: 27,
  seinen: 42,
  josei: 43,
  kids: 15
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJikan(path: string): Promise<any> {
  const job = requestQueue.then(async () => {
    const url = JIKAN_BASE_URL + path;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const waitMs = Math.max(0, nextRequestAt - Date.now());
      if (waitMs > 0) await delay(waitMs);
      nextRequestAt = Date.now() + 400;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if ((response.status === 429 || response.status === 503) && attempt < 2) {
        await delay(1200 * (attempt + 1));
        continue;
      }
      if (!response.ok) {
        throw new Error('Jikan request failed with HTTP ' + response.status);
      }
      return response.json();
    }
    throw new Error('Jikan is rate-limiting requests. Please try again shortly.');
  });
  requestQueue = job.then(() => undefined, () => undefined);
  return job;
}

function cacheGet<T>(key: string): T | undefined {
  const entry = cache.get(key) as { value: T; timestamp: number } | undefined;
  if (!entry || Date.now() - entry.timestamp > CACHE_TTL_MS) return undefined;
  return entry.value;
}

function cacheSet<T>(key: string, value: T): void {
  cache.set(key, { value, timestamp: Date.now() });
}

export function getHindiTitle(title: string): string | undefined {
  return HINDI_TITLES[title.trim().toLocaleLowerCase()];
}

function safeAnimeType(value: unknown): Anime['type'] {
  if (value === 'TV' || value === 'Movie' || value === 'OVA') return value;
  return 'Special';
}

function safeAnimeStatus(value: unknown): Anime['status'] {
  if (value === 'Currently Airing') return 'Currently Airing';
  if (value === 'Not yet aired') return 'Not yet aired';
  return 'Finished Airing';
}

/** Convert public MyAnimeList metadata into the app model. Audio rights are never inferred. */
export function transformJikanAnime(item: any): Anime {
  const title = String(item?.title || item?.title_english || 'Untitled anime');
  const titleEnglish = item?.title_english || item?.title || undefined;
  const trailerId = item?.trailer?.youtube_id || undefined;
  const trailerUrl = item?.trailer?.embed_url ||
    (trailerId ? 'https://www.youtube-nocookie.com/embed/' + trailerId + '?rel=0' : undefined);
  const year = item?.year || item?.aired?.prop?.from?.year ||
    (item?.aired?.from ? new Date(item.aired.from).getFullYear() : undefined);

  return {
    id: Number(item?.mal_id) || 0,
    mal_id: Number(item?.mal_id) || 0,
    title,
    titleEnglish,
    titleJapanese: item?.title_japanese || undefined,
    titleHindi: getHindiTitle(titleEnglish || title),
    image: item?.images?.webp?.large_image_url ||
      item?.images?.jpg?.large_image_url ||
      item?.images?.jpg?.image_url || '',
    synopsis: item?.synopsis || 'No synopsis available.',
    score: Number(item?.score) || 0,
    scoredBy: Number(item?.scored_by) || undefined,
    rank: Number(item?.rank) || undefined,
    popularity: Number(item?.popularity) || undefined,
    type: safeAnimeType(item?.type),
    episodes: Number.isFinite(item?.episodes) ? item.episodes : null,
    status: safeAnimeStatus(item?.status),
    duration: item?.duration || 'Unknown',
    rating: item?.rating || 'Not rated',
    year,
    season: item?.season || undefined,
    genres: Array.isArray(item?.genres) ? item.genres.map((genre: any) => genre.name).filter(Boolean) : [],
    studios: Array.isArray(item?.studios) ? item.studios.map((studio: any) => studio.name).filter(Boolean) : [],
    trailerYoutubeId: trailerId,
    trailerEmbedUrl: trailerUrl,
    hindiDub: {
      isAvailable: false,
      verificationStatus: 'unverified'
    },
    streams: []
  };
}

export interface AnimeSearchResult {
  animes: Anime[];
  hasNextPage: boolean;
  total: number;
  source: 'jikan' | 'curated-fallback';
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

function curatedFallback(query: string, genre?: string): Anime[] {
  let list = CURATED_ANIME;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (normalizedQuery) {
    list = list.filter((anime) =>
      [anime.title, anime.titleEnglish, anime.titleJapanese, anime.titleHindi]
        .some((value) => value?.toLocaleLowerCase().includes(normalizedQuery))
    );
  }
  if (genre && genre !== 'All Genres') {
    list = list.filter((anime) =>
      anime.genres.some((item) => item.toLocaleLowerCase() === genre.toLocaleLowerCase())
    );
  }
  return list;
}

export async function searchAnimeFromApi(
  query: string,
  genre?: string,
  page = 1,
  limit = 24
): Promise<AnimeSearchResult> {
  const normalizedGenre = (genre || '').trim().toLocaleLowerCase();
  const cacheKey = 'search:' + query.trim().toLocaleLowerCase() + ':' + normalizedGenre + ':' + page + ':' + limit;
  const cached = cacheGet<AnimeSearchResult>(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams();
    const cleanQuery = query.trim();
    if (cleanQuery) params.set('q', cleanQuery);
    params.set('page', String(page));
    params.set('limit', String(Math.min(Math.max(limit, 1), 25)));
    params.set('sfw', 'true');
    if (normalizedGenre && normalizedGenre !== 'all genres' && GENRE_IDS[normalizedGenre]) {
      params.set('genres', String(GENRE_IDS[normalizedGenre]));
    }
    params.set('order_by', cleanQuery ? 'popularity' : 'score');
    params.set('sort', 'desc');

    const json = await requestJikan('/anime?' + params.toString());
    const rawItems = Array.isArray(json?.data) ? json.data : [];
    const mapped = rawItems
      .filter((item: any) => {
        const rating = String(item?.rating || '');
        return !rating.startsWith('R+') && rating !== 'Rx - Hentai';
      })
      .map(transformJikanAnime);
    const hasKnownGenreId = Boolean(GENRE_IDS[normalizedGenre]);
    const results = !normalizedGenre || normalizedGenre === 'all genres' || hasKnownGenreId
      ? mapped
      : mapped.filter((anime: Anime) => anime.genres.some((value) => value.toLocaleLowerCase() === normalizedGenre));
    const result: AnimeSearchResult = {
      animes: results,
      hasNextPage: Boolean(json?.pagination?.has_next_page),
      total: Number(json?.pagination?.items?.total) || results.length,
      source: 'jikan'
    };
    cacheSet(cacheKey, result);
    return result;
  } catch (error) {
    console.warn('Jikan catalogue unavailable; using the bundled sample list.', error);
    const fallback = curatedFallback(query, genre);
    return {
      animes: fallback.slice(0, limit),
      hasNextPage: false,
      total: fallback.length,
      source: 'curated-fallback'
    };
  }
}

export async function getTopAnimeList(page = 1, filterType = 'bypopularity'): Promise<Anime[]> {
  const key = 'top:' + filterType + ':' + page;
  const cached = cacheGet<Anime[]>(key);
  if (cached) return cached;
  try {
    const params = new URLSearchParams({
      filter: filterType,
      page: String(page),
      limit: '24',
      sfw: 'true'
    });
    const json = await requestJikan('/top/anime?' + params.toString());
    const list = (Array.isArray(json?.data) ? json.data : [])
      .filter((item: any) => {
        const rating = String(item?.rating || '');
        return !rating.startsWith('R+') && rating !== 'Rx - Hentai';
      })
      .map(transformJikanAnime);
    cacheSet(key, list);
    return list;
  } catch (error) {
    console.warn('Could not load popular anime from Jikan.', error);
    return CURATED_ANIME.slice(0, 24);
  }
}

export interface JikanEpisodePage {
  episodes: JikanEpisode[];
  hasNextPage: boolean;
}

export async function getAnimeEpisodes(malId: number, page = 1): Promise<JikanEpisodePage> {
  const key = 'episodes:' + malId + ':' + page;
  const cached = cacheGet<JikanEpisodePage>(key);
  if (cached) return cached;
  const json = await requestJikan('/anime/' + encodeURIComponent(String(malId)) + '/episodes?page=' + page);
  const episodes = (Array.isArray(json?.data) ? json.data : []).map((item: any, index: number) => ({
    mal_id: Number(item?.mal_id) || index + 1,
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
  const result = {
    episodes,
    hasNextPage: Boolean(json?.pagination?.has_next_page)
  };
  cacheSet(key, result);
  return result;
}
