import React, { useState } from 'react';
import { Play, Bookmark, Star, Volume2 } from 'lucide-react';
import { Anime } from '../types/anime';

interface AnimeCardProps {
  anime: Anime;
  onPlay: (anime: Anime) => void;
  onViewDetails: (anime: Anime) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (anime: Anime) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  onPlay,
  onViewDetails,
  isInWatchlist,
  onToggleWatchlist,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const displayTitle = anime.titleEnglish || anime.title;
  const isHindi = anime.hindiDub.isAvailable;

  return (
    <div className="group relative flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden hover:border-slate-700 hover:shadow-xl hover:shadow-black/50 transition-all duration-300">
      
      {/* Poster Image Container */}
      <div className="relative aspect-[3/4] w-full bg-slate-950 overflow-hidden cursor-pointer" onClick={() => onViewDetails(anime)}>
        {/* Fallback container if image fails or loading */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-900 animate-pulse flex items-center justify-center text-xs text-slate-600">
            Loading...
          </div>
        )}
        
        {imageError ? (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4 text-center">
            <span className="text-rose-500 font-bold text-lg mb-1">{displayTitle.slice(0, 1)}</span>
            <span className="text-xs text-slate-400 line-clamp-2">{displayTitle}</span>
          </div>
        ) : (
          <img
            src={anime.image}
            alt={displayTitle}
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Gradient overlay for bottom readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

        {/* Audio Track Indicators (Clean text badges in corner) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {isHindi && (
            <span className="bg-amber-500/90 backdrop-blur-md text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded tracking-wide shadow-md">
              HINDI DUB
            </span>
          )}
          <span className="bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] px-1.5 py-0.5 rounded font-mono">
            {anime.type}
          </span>
        </div>

        {/* Score indicator */}
        <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-amber-400 text-xs px-2 py-0.5 rounded flex items-center gap-1 font-semibold tabular-nums shadow-sm">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{anime.score ? anime.score.toFixed(1) : '7.5'}</span>
        </div>

        {/* Quick Hover Play Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(anime);
            }}
            className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transform hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="Watch Online Free"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(anime);
            }}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
              isInWatchlist
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-900/90 text-white border-slate-700 hover:bg-slate-800'
            }`}
            title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Bookmark className={`w-4 h-4 ${isInWatchlist ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Card Info Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Unboxed Metadata (NO PILLS) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 font-medium">
            <span className="text-slate-300 tabular-nums">{anime.year || '2023'}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{anime.episodes ? `${anime.episodes} Eps` : 'Ongoing'}</span>
            {isHindi && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400 font-medium">हिन्दी</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewDetails(anime)}
            className="text-sm font-semibold text-white group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug cursor-pointer"
            title={displayTitle}
          >
            {displayTitle}
          </h3>

          {/* Hindi Title if exists */}
          {anime.titleHindi && (
            <p className="text-xs text-amber-300/80 line-clamp-1 mt-0.5">
              {anime.titleHindi}
            </p>
          )}
        </div>

        {/* Card Footer: Genres & Action */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span className="line-clamp-1 text-[11px] text-slate-400">
            {anime.genres.slice(0, 2).join(', ')}
          </span>
          <button
            onClick={() => onPlay(anime)}
            className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer text-xs flex items-center gap-1"
          >
            <span>Play</span>
            <span>→</span>
          </button>
        </div>

      </div>
    </div>
  );
};
