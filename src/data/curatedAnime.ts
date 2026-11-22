import { Anime, StreamSource } from '../types/anime';
import heroBanner from '../assets/images/hero_anime_showcase_1793197634668.jpg';
import hindiDubBanner from '../assets/images/hindi_dub_spotlight_1793197636490.jpg';
import collectionBanner from '../assets/images/anime_collection_banner_1793197635836.jpg';

export const HERO_BANNER = heroBanner;
export const HINDI_DUB_BANNER = hindiDubBanner;
export const COLLECTION_BANNER = collectionBanner;

/** Legacy components can import this symbol, but the app no longer ships fake catalogue rows. */
export const CURATED_ANIME: Anime[] = [];

/** A playable source is never generated from an anime ID or episode number. */
export function createAnimeStreams(): StreamSource[] {
  return [];
}

export const GENRES_LIST = [
  'All Genres', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Supernatural', 'Thriller'
];

/** Static day labels only; no release times or titles are invented. */
export const SCHEDULE_DAYS: Array<{ day: string; dayHindi: string; animes: string[] }> = [
  { day: 'Monday', dayHindi: 'सोमवार', animes: [] },
  { day: 'Tuesday', dayHindi: 'मंगलवार', animes: [] },
  { day: 'Wednesday', dayHindi: 'बुधवार', animes: [] },
  { day: 'Thursday', dayHindi: 'गुरुवार', animes: [] },
  { day: 'Friday', dayHindi: 'शुक्रवार', animes: [] },
  { day: 'Saturday', dayHindi: 'शनिवार', animes: [] },
  { day: 'Sunday', dayHindi: 'रविवार', animes: [] }
];
