import React from 'react';
import { Play, Bookmark, Info, Sparkles, Volume2, Film } from 'lucide-react';
import { Anime } from '../types/anime';
import { isHindiDubVerified } from '../services/animeTrust';
import { HERO_BANNER } from '../data/curatedAnime';

interface HeroSectionProps {
  featuredAnime: Anime;
  onPlay: (anime: Anime, episodeNum?: number) => void;
  onViewDetails: (anime: Anime) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (anime: Anime) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  featuredAnime,
  onPlay,
  onViewDetails,
  isInWatchlist,
  onToggleWatchlist,
}) => {
  return (
    <section className="relative w-full overflow-hidden border-b border-slate-800/80 bg-slate-950">
      {/* Background Image with Measured Contrast Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={featuredAnime.bannerImage || HERO_BANNER}
          alt={featuredAnime.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top filter brightness-[0.7] transform scale-105 transition-transform duration-1000"
        />
        {/* Measured dark scrim for 4.5:1 text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/70 to-[#0b0e14]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14] via-[#0b0e14]/80 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 flex flex-col justify-end min-h-[520px]">
        
        {/* Unboxed Editorial Kicker (NO static pills) */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-amber-400 mb-3 tracking-wide">
          <Volume2 className="w-4 h-4 text-rose-500" />
          <span className="font-semibold text-white">Featured Anime</span>
          <span aria-hidden="true" className="text-slate-500">·</span>
          <span>{isHindiDubVerified(featuredAnime) ? 'Verified Hindi audio' : 'Audio availability unverified'}</span>
          <span aria-hidden="true" className="text-slate-500">·</span>
          <span>Anime overview</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mb-4 text-balance">
          {featuredAnime.titleEnglish || featuredAnime.title}
        </h1>

        {/* Hindi Title Subheading */}
        {featuredAnime.titleHindi && (
          <p className="text-lg sm:text-xl font-medium text-amber-300/90 mb-3">
            {featuredAnime.titleHindi}
          </p>
        )}

        {/* Unboxed Metadata with Typographic Separators (Rule 1.A) */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-slate-300 mb-5">
          <span className="font-semibold text-white">{featuredAnime.score.toFixed(2)} ★</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{featuredAnime.type}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="tabular-nums">{featuredAnime.episodes || 'Ongoing'} Episodes</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{featuredAnime.year}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-emerald-400 font-medium">Catalogue metadata</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{featuredAnime.genres.slice(0, 3).join(', ')}</span>
        </div>

        {/* Synopsis text constrained */}
        <p className="text-sm sm:text-base text-slate-300/90 line-clamp-3 max-w-2xl mb-8 leading-relaxed">
          {featuredAnime.synopsis}
        </p>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onPlay(featuredAnime, 1)}
            className="flex items-center gap-2.5 px-6 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 rounded-lg transition-all shadow-xl shadow-rose-600/30 whitespace-nowrap cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>View title options</span>
          </button>

          <button
            onClick={() => onViewDetails(featuredAnime)}
            className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-all backdrop-blur-sm whitespace-nowrap cursor-pointer"
          >
            <Info className="w-4 h-4 text-slate-400" />
            <span>Details & Episodes</span>
          </button>

          <button
            onClick={() => onToggleWatchlist(featuredAnime)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg border transition-all cursor-pointer ${
              isInWatchlist
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-900/60 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isInWatchlist ? 'fill-current' : ''}`} />
            <span>{isInWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
          </button>
        </div>

        {/* Bottom Feature Proof Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-6 border-t border-slate-800/60 text-xs text-slate-400">
          <div>
            <div className="font-semibold text-white text-sm tabular-nums">Anime metadata</div>
            <div className="text-slate-500 mt-0.5">Live catalogue search</div>
          </div>
          <div>
            <div className="font-semibold text-white text-sm">Anime overview</div>
            <div className="text-slate-500 mt-0.5">Trailer and metadata</div>
          </div>
          <div>
            <div className="font-semibold text-white text-sm">1080p Ultra HD</div>
            <div className="text-slate-500 mt-0.5">Only approved sources</div>
          </div>
          <div>
            <div className="font-semibold text-white text-sm">Rights-reviewed</div>
            <div className="text-slate-500 mt-0.5">No account needed to browse</div>
          </div>
        </div>

      </div>
    </section>
  );
};
