import { Anime } from '../types/anime';
import { CURATED_ANIME, createAnimeStreams } from '../data/curatedAnime';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const cache = new Map<string, { data: Anime[]; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

// Map known Hindi dubbed anime titles for automatic authentic Hindi title translations
const KNOWN_HINDI_TITLES: Record<string, string> = {
  'solo leveling': 'सोलो लेवलिंग (अराइज)',
  'jujutsu kaisen': 'जुजुत्सु काइसेन',
  'demon slayer': 'डिमॉन स्लेयर: किमेत्सु नो याइबा',
  'kimetsu no yaiba': 'डिमॉन स्लेयर: किमेत्सु नो याइबा',
  'naruto': 'नारुतो (मूल टीवी श्रृंखला)',
  'naruto shippuden': 'नारुतो: शिपुडेन',
  'naruto: shippuuden': 'नारुतो: शिपुडेन',
  'dragon ball z': 'ड्रैगन बॉल ज़ेड',
  'dragon ball super': 'ड्रैगन बॉल सुपर',
  'death note': 'डेथ नोट',
  'attack on titan': 'अटैक ऑन टाइटन',
  'shingeki no kyojin': 'अटैक ऑन टाइटन',
  'one piece': 'वन पीस',
  'one punch man': 'वन पंच मैन',
  'chainsaw man': 'चेनसॉ मैन',
  'spy x family': 'स्पाई एक्स फैमिली',
  'bleach': 'ब्लीच (थाउजेंड ईयर ब्लड वॉर)',
  'hunter x hunter': 'हंटर एक्स हंटर',
  'my hero academia': 'माई हीरो एकेडेमिया',
  'boku no hero academia': 'माई हीरो एकेडेमिया',
  'beyblade': 'बेब्लेड',
  'doraemon': 'डोरेमोन (क्लासिक)',
  'shin-chan': 'शिनचैन (क्रेयॉन शिनचैन)',
  'crayon shin-chan': 'शिनचैन (क्रेयॉन शिनचैन)',
  'detective conan': 'डिटेक्टिव कोनन',
  'black clover': 'ब्लैक क्लोवर',
  'tokyo ghoul': 'टोक्यो घूल',
  'blue lock': 'ब्लू लॉक',
  'vinland saga': 'विनलैंड सागा',
  'kaiju no. 8': 'काइजू नंबर 8',
  'dr. stone': 'डॉ. स्टोन',
  'wind breaker': 'विंड ब्रेकर',
  'mashle': 'मैशले: मैजिक एंड मसल्स',
  'haikyuu': 'हाइक्यू!!',
  'steins;gate': 'स्टाइन्स;गेट',
  'fullmetal alchemist': 'फुलमेटल अल्केमिस्ट: ब्रदरहुड',
  'sword art online': 'स्वॉर्ड आर्ट ऑनलाइन',
  'fairy tail': 'फेयरी टेल',
  'classroom of the elite': 'क्लासरूम ऑफ द एलीट',
  're:zero': 'री:ज़ीरो',
  'mushoku tensei': 'मुशोकु तेन्सेई',
  'frieren': 'फ्रीरेन: बियॉन्ड जर्नीज़ एंड',
  'dandadan': 'दंडादान',
};

export function getHindiTitle(title: string): string {
  const lower = title.toLowerCase();
  for (const [key, val] of Object.entries(KNOWN_HINDI_TITLES)) {
    if (lower.includes(key)) {
      return val;
    }
  }
  return `${title} (हिन्दी डब)`;
}

export function getVoiceActorsForAnime(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes('naruto')) {
    return [
      { character: 'Naruto Uzumaki', actor: 'Rajesh Kava', role: 'Protagonist' },
      { character: 'Sasuke Uchiha', actor: 'Sanket Mhatre', role: 'Rival' },
      { character: 'Kakashi Hatake', actor: 'Pawan Kalra', role: 'Mentor' },
    ];
  }
  if (lower.includes('dragon ball') || lower.includes('goku')) {
    return [
      { character: 'Goku', actor: 'Ankur Javeri', role: 'Saiyan' },
      { character: 'Vegeta', actor: 'Prasad Barve', role: 'Prince of Saiyans' },
      { character: 'Piccolo', actor: 'Mayur Vyas', role: 'Namekian' },
    ];
  }
  if (lower.includes('demon slayer') || lower.includes('kimetsu')) {
    return [
      { character: 'Tanjiro Kamado', actor: 'Priyansh Jora', role: 'Demon Slayer' },
      { character: 'Nezuko Kamado', actor: 'Urvi Ashar', role: 'Sister' },
      { character: 'Zenitsu', actor: 'Rohan Jadhav', role: 'Thunder Slayer' },
    ];
  }
  if (lower.includes('jujutsu') || lower.includes('gojo')) {
    return [
      { character: 'Satoru Gojo', actor: 'Lohit Sharma', role: 'Sorcerer' },
      { character: 'Yuji Itadori', actor: 'Pratik Sinha', role: 'Vessel' },
      { character: 'Sukuna', actor: 'Sanket Mhatre', role: 'Curse King' },
    ];
  }
  return [
    { character: 'Main Protagonist', actor: 'Sanket Mhatre', role: 'Lead Voice' },
    { character: 'Lead Companion', actor: 'Rajesh Kava', role: 'Deuteragonist' },
    { character: 'Main Heroine', actor: 'Pooja Punjabi', role: 'Lead Female Voice' },
    { character: 'Rival / Master', actor: 'Mayur Vyas', role: 'Supporting Voice' },
  ];
}

// Every anime in the AniHindi catalog has full Hindi Dub support
export function isAnimeHindiDubbed(_title: string): boolean {
  return true;
}

// Convert Jikan API item into our unified Anime model
export function transformJikanAnime(item: any): Anime {
  const animeTitle = item.title_english || item.title || 'Anime Stream';
  const trailerId = item.trailer?.youtube_id || 'QczGoCmX-pI';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=1&enablejsapi=1&rel=0`;
  const titleHindi = getHindiTitle(animeTitle);

  return {
    id: item.mal_id,
    mal_id: item.mal_id,
    title: item.title,
    titleEnglish: item.title_english || item.title,
    titleJapanese: item.title_japanese,
    titleHindi: titleHindi,
    image: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
    synopsis: item.synopsis || 'No synopsis available for this title.',
    synopsisHindi: `${animeTitle} अब सम्पूर्ण हिन्दी डब (Dual Audio 1080p) में उपलब्ध है। सभी एपिसोड्स हिन्दी आवाज़ और सबटाइटल में बिना किसी रुकावट के देखें।`,
    score: item.score || 7.8,
    scoredBy: item.scored_by || 10000,
    rank: item.rank,
    popularity: item.popularity,
    type: item.type || 'TV',
    episodes: item.episodes || 12,
    status: item.status || 'Finished Airing',
    duration: item.duration || '24 min per ep',
    rating: item.rating || 'PG-13',
    year: item.year || (item.aired?.from ? new Date(item.aired.from).getFullYear() : 2023),
    season: item.season,
    genres: (item.genres || []).map((g: any) => g.name),
    studios: (item.studios || []).map((s: any) => s.name),
    trailerYoutubeId: trailerId,
    trailerEmbedUrl: embedUrl,
    hindiDub: {
      isAvailable: true,
      studio: 'Crunchyroll Hindi Dubbing Studio / Muse India / Sony YAY!',
      seasonsDubbed: 'Complete Hindi Dubbed (Dual Audio HD)',
      qualityRating: 4.9,
      voiceActors: getVoiceActorsForAnime(animeTitle),
    },
    streams: createAnimeStreams(item.mal_id, 1, true, animeTitle, 'Hindi'),
  };
}

export async function searchAnimeFromApi(
  query: string,
  genre?: string,
  page = 1,
  limit = 24
): Promise<{ animes: Anime[]; hasNextPage: boolean; total: number }> {
  const cacheKey = `search_${query}_${genre || 'all'}_${page}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { animes: cached.data, hasNextPage: true, total: 10000 };
  }

  try {
    const params = new URLSearchParams();
    if (query.trim()) params.append('q', query.trim());
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('sfw', 'true');
    params.append('order_by', 'popularity');
    params.append('sort', 'asc');

    const res = await fetch(`${JIKAN_BASE_URL}/anime?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Jikan API status: ${res.status}`);
    }

    const json = await res.json();
    const data = (json.data || []).map(transformJikanAnime);

    // Filter by genre if specified
    const filtered = genre && genre !== 'All Genres'
      ? data.filter((a: Anime) => a.genres.some((g) => g.toLowerCase() === genre.toLowerCase()))
      : data;

    cache.set(cacheKey, { data: filtered, timestamp: Date.now() });
    return {
      animes: filtered,
      hasNextPage: json.pagination?.has_next_page || false,
      total: json.pagination?.items?.total || 10000,
    };
  } catch (error) {
    console.warn('Jikan API rate limit or network issue, using curated anime search:', error);
    // Instant fallback to curated catalog matching
    let results = CURATED_ANIME;
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.titleEnglish && a.titleEnglish.toLowerCase().includes(q)) ||
          (a.titleHindi && a.titleHindi.toLowerCase().includes(q))
      );
    }
    if (genre && genre !== 'All Genres') {
      results = results.filter((a) => a.genres.some((g) => g.toLowerCase() === genre.toLowerCase()));
    }
    return { animes: results, hasNextPage: false, total: results.length };
  }
}

export async function getTopAnimeList(page = 1, filterType?: string): Promise<Anime[]> {
  const cacheKey = `top_${filterType || 'bypopularity'}_${page}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const res = await fetch(`${JIKAN_BASE_URL}/top/anime?filter=${filterType || 'bypopularity'}&page=${page}&limit=24&sfw=true`);
    if (!res.ok) throw new Error('Failed to fetch top anime');
    const json = await res.json();
    const data = (json.data || []).map(transformJikanAnime);
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    console.warn('Using curated fallback for top anime:', err);
    return CURATED_ANIME;
  }
}
