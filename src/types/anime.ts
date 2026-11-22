export type AudioLanguage = 'Hindi' | 'English' | 'Japanese';

export interface HindiVoiceActor {
  character: string;
  actor: string;
  role: string;
}

export interface StreamSource {
  serverName: string;
  serverType: 'direct' | 'embed' | 'hls';
  url: string;
  embedUrl?: string;
  quality: string;
  hasHindiAudio: boolean;
  hasEnglishAudio: boolean;
  hasJapaneseAudio: boolean;
  rightsStatus?: 'verified' | 'unverified';
  rightsEvidenceUrl?: string;
  territories?: string[];
  audioLanguages?: AudioLanguage[];
  free?: boolean;
  adFree?: boolean;
  expiresAt?: string;
}

export interface HindiSource {
  title: string;
  url: string;
  platform: 'youtube' | 'dailymotion' | 'archive' | 'direct';
  quality: string;
}

export interface Episode {
  id: number;
  number: number;
  title: string;
  titleHindi?: string;
  duration: string;
  thumbnail: string;
  synopsis: string;
  airDate: string;
  isFiller?: boolean;
  embedUrl?: string;
  videoUrl?: string;
  hindiEmbedUrl?: string;
  hindiVideoUrl?: string;
  hindiSources?: HindiSource[];
}

export interface OfficialStreamingEpisode {
  title?: string;
  thumbnail?: string;
  url: string;
  site?: string;
}

export interface Anime {
  id: number;
  mal_id: number;
  title: string;
  titleEnglish?: string;
  titleHindi?: string;
  titleJapanese?: string;
  image: string;
  bannerImage?: string;
  synopsis: string;
  synopsisHindi?: string;
  score: number;
  scoredBy?: number;
  rank?: number;
  popularity?: number;
  type: 'TV' | 'Movie' | 'OVA' | 'Special';
  episodes: number | null;
  status: 'Finished Airing' | 'Currently Airing' | 'Not yet aired';
  duration: string;
  rating: string;
  year?: number;
  season?: string;
  genres: string[];
  studios: string[];
  trailerYoutubeId?: string;
  trailerEmbedUrl?: string;
  hindiDub: {
    isAvailable: boolean;
    verificationStatus?: 'verified' | 'unverified';
    evidenceUrl?: string;
    territories?: string[];
    voiceActors?: HindiVoiceActor[];
    studio?: string;
    seasonsDubbed?: string;
    qualityRating?: number;
  };
  streams?: StreamSource[];
  /** Outbound legal episode destinations returned by AniList; availability can vary by region. */
  officialEpisodes?: OfficialStreamingEpisode[];
}

export interface WatchHistoryItem {
  animeId: number;
  animeTitle: string;
  animeImage: string;
  episodeNumber: number;
  progressSeconds: number;
  durationSeconds: number;
  lastWatchedAt: number;
  selectedAudio: AudioLanguage;
  animeSnapshot?: Anime;
}

export interface FilterState {
  searchQuery: string;
  genre: string;
  audio: 'all' | 'hindi' | 'english' | 'japanese';
  format: 'all' | 'TV' | 'Movie' | 'OVA';
  status: 'all' | 'airing' | 'completed';
  sortBy: 'popularity' | 'score' | 'latest' | 'title';
}
