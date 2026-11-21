import React from 'react';
import { Volume2, Play, Star, Sparkles, ShieldCheck } from 'lucide-react';
import { Anime } from '../types/anime';
import { AnimeCard } from './AnimeCard';
import { HINDI_DUB_BANNER } from '../data/curatedAnime';

interface HindiDubSectionProps {
  hindiAnimeList: Anime[];
  onPlay: (anime: Anime) => void;
  onViewDetails: (anime: Anime) => void;
  watchlistIds: Set<number>;
  onToggleWatchlist: (anime: Anime) => void;
}

export const HindiDubSection: React.FC<HindiDubSectionProps> = ({
  hindiAnimeList,
  onPlay,
  onViewDetails,
  watchlistIds,
  onToggleWatchlist,
}) => {
  return (
    <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
      
      {/* Spotlight Feature Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 mb-10 bg-slate-950 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img
            src={HINDI_DUB_BANNER}
            alt="Hindi Dub Anime Spotlight"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter brightness-[0.45]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14] via-[#0b0e14]/85 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2 uppercase tracking-wider">
            <Volume2 className="w-4 h-4 text-rose-500" />
            <span>Dedicated Hindi Dub Vault (हिन्दी डब एनीमे)</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Watch Top Anime in Official Hindi Audio
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Experience world-class shounen, action, and fantasy anime voiced by India&apos;s finest voice artists—Sanket Mhatre, Rajesh Kava, Prasad Barve, and Meghana Erande. High definition 1080p audio, zero lag, completely free.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onPlay(hindiAnimeList[0])}
              className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 rounded-lg transition-all shadow-lg shadow-amber-400/25 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Featured Hindi Dub</span>
            </button>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 pl-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Licensed Studios & High Bitrate Stereo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Header with Unboxed Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1">
            Top Rated in India & South Asia
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Popular Hindi Dubbed Series
          </h3>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Showing {hindiAnimeList.length} Verified Hindi Dubs
        </div>
      </div>

      {/* Grid of Anime Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
        {hindiAnimeList.map((anime) => (
          <AnimeCard
            key={anime.id}
            anime={anime}
            onPlay={onPlay}
            onViewDetails={onViewDetails}
            isInWatchlist={watchlistIds.has(anime.id)}
            onToggleWatchlist={onToggleWatchlist}
          />
        ))}
      </div>

    </section>
  );
};
