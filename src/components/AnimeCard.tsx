import React, { useState } from 'react';
import { Bookmark, Film, Play, Star } from 'lucide-react';
import { Anime } from '../types/anime';
import { isHindiDubVerified } from '../services/animeTrust';

interface AnimeCardProps {
  anime: Anime;
  onPlay: (anime: Anime) => void;
  onViewDetails: (anime: Anime) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (anime: Anime) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime, onPlay, onViewDetails, isInWatchlist, onToggleWatchlist
}) => {
  const [imageError, setImageError] = useState(false);
  const title = anime.titleEnglish || anime.title;
  const hindiVerified = isHindiDubVerified(anime);

  return (
    <article className="group min-w-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111420]/90 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:shadow-xl hover:shadow-black/30">
      <div className="relative aspect-[3/4.15] overflow-hidden bg-[#1a1d2a]">
        {!imageError && anime.image ? (
          <img src={anime.image} alt={title} loading="lazy" referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="h-full w-full cursor-pointer object-cover transition duration-700 group-hover:scale-105"
            onClick={() => onViewDetails(anime)} />
        ) : (
          <button onClick={() => onViewDetails(anime)} className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-violet-950/70 to-slate-900 p-3 text-center">
            <Film className="h-7 w-7 text-violet-300/70" /><span className="line-clamp-3 text-xs font-bold text-slate-300">{title}</span>
          </button>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/15" />
        <span className="absolute left-2.5 top-2.5 rounded-md border border-white/10 bg-black/55 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-200 backdrop-blur">{anime.type}</span>
        <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md border border-white/10 bg-black/55 px-2 py-1 text-[10px] font-bold text-amber-200 backdrop-blur">
          <Star className="h-3 w-3 fill-current" />{anime.score > 0 ? anime.score.toFixed(1) : '—'}
        </span>
        {hindiVerified && <span className="absolute bottom-2.5 left-2.5 rounded-md bg-amber-300 px-2 py-1 text-[9px] font-extrabold text-slate-950">Hindi audio verified</span>}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-center gap-2 p-3 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100">
          <button onClick={() => onPlay(anime)} aria-label={'Open trailer and viewing options for ' + title}
            className="flex items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-2 text-[10px] font-bold text-white shadow-lg shadow-violet-950/50 transition hover:bg-violet-400">
            <Play className="h-3 w-3 fill-current" /> Preview & sources
          </button>
          <button onClick={() => onToggleWatchlist(anime)} aria-label={isInWatchlist ? 'Remove from saved list' : 'Save to list'}
            className={'grid h-8 w-8 place-items-center rounded-lg border transition ' + (isInWatchlist ? 'border-amber-300 bg-amber-300 text-slate-950' : 'border-white/20 bg-black/55 text-white hover:bg-black/80')}>
            <Bookmark className={'h-3.5 w-3.5 ' + (isInWatchlist ? 'fill-current' : '')} />
          </button>
        </div>
      </div>

      <div className="p-3">
        <button onClick={() => onViewDetails(anime)} className="block w-full text-left">
          <h3 title={title} className="line-clamp-2 min-h-[2.5rem] text-xs font-bold leading-5 text-slate-100 transition group-hover:text-violet-200">{title}</h3>
        </button>
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
          <span>{anime.year || 'Year unknown'}</span><span>·</span><span>{anime.episodes ? anime.episodes + ' eps' : 'Episode count unknown'}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5">
          <span className="line-clamp-1 text-[9px] text-slate-500">{anime.genres.slice(0, 2).join(' · ') || 'Genres not listed'}</span>
          <button onClick={() => onViewDetails(anime)} className="shrink-0 text-[10px] font-bold text-violet-300 transition hover:text-violet-100">Details ↗</button>
        </div>
      </div>
    </article>
  );
};
