import React from 'react';
import { Volume2, ShieldCheck } from 'lucide-react';
import { Anime } from '../types/anime';
import { AnimeCard } from './AnimeCard';

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
}) => (
  <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
    <div className="rounded-2xl border border-amber-500/20 bg-slate-950 p-6 sm:p-9 mb-8">
      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
        <Volume2 className="w-4 h-4" /> Hindi audio catalogue
      </div>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Anime with verified Hindi audio</h2>
      <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
        A title appears here only after its Hindi audio and territory have been checked against a public source. Anime database metadata alone cannot confirm a dub.
      </p>
      <div className="flex items-center gap-2 text-xs text-emerald-400 mt-4">
        <ShieldCheck className="w-4 h-4" /> Evidence-based labels only
      </div>
    </div>

    {hindiAnimeList.length ? (
      <>
        <div className="text-xs text-slate-400 mb-5">Showing {hindiAnimeList.length} verified titles</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {hindiAnimeList.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} onPlay={onPlay} onViewDetails={onViewDetails}
              isInWatchlist={watchlistIds.has(anime.id)} onToggleWatchlist={onToggleWatchlist} />
          ))}
        </div>
      </>
    ) : (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
        <ShieldCheck className="w-8 h-8 text-slate-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-2">No Hindi dubs verified yet</h3>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          The catalogue will not guess audio languages or invent dubbing studios and voice casts. This section will populate when title-specific evidence is added.
        </p>
      </div>
    )}
  </section>
);
