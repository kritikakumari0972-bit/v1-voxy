import React from 'react';
import { Bookmark, Play, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { Anime, WatchHistoryItem } from '../types/anime';
import { AnimeCard } from './AnimeCard';

interface WatchlistViewProps {
  watchlist: Anime[];
  history: WatchHistoryItem[];
  onPlay: (anime: Anime, episodeNum?: number) => void;
  onViewDetails: (anime: Anime) => void;
  onToggleWatchlist: (anime: Anime) => void;
  onClearHistory: () => void;
  findAnimeById: (id: number) => Anime | undefined;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  watchlist,
  history,
  onPlay,
  onViewDetails,
  onToggleWatchlist,
  onClearHistory,
  findAnimeById,
}) => {
  const watchlistIds = new Set(watchlist.map((a) => a.id));

  return (
    <section className="py-10 px-4 sm:px-8 max-w-7xl mx-auto">
      
      {/* Continue Watching Section (If history exists) */}
      {history.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-6">
            <div>
              <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Resume Playback
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Continue Watching
              </h2>
            </div>
            <button
              onClick={onClearHistory}
              className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {history.slice(0, 8).map((item) => {
              const matchedAnime = findAnimeById(item.animeId);
              const progressPct = Math.min(
                Math.round((item.progressSeconds / (item.durationSeconds || 1425)) * 100),
                100
              );

              return (
                <div
                  key={`${item.animeId}-${item.episodeNumber}`}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group"
                >
                  <div className="relative aspect-video bg-black overflow-hidden cursor-pointer" onClick={() => matchedAnime && onPlay(matchedAnime, item.episodeNumber)}>
                    <img
                      src={item.animeImage}
                      alt={item.animeTitle}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
                      <div className="h-full bg-rose-500" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="flex items-center justify-between text-[11px] text-amber-400 font-medium mb-1">
                      <span>Episode {item.episodeNumber} ({item.selectedAudio} Dub)</span>
                      <span className="text-slate-400 tabular-nums">{progressPct}%</span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate mb-2">
                      {item.animeTitle}
                    </h4>

                    <button
                      onClick={() => matchedAnime && onPlay(matchedAnime, item.episodeNumber)}
                      className="w-full py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Resume Episode {item.episodeNumber}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bookmarked Anime Section */}
      <div>
        <div className="pb-3 border-b border-slate-800 mb-6">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Bookmark className="w-4 h-4" /> Personal Anime Vault
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            My Watchlist ({watchlist.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            All your bookmarked shows are saved locally on your device for instant offline access.
          </p>
        </div>

        {watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {watchlist.map((anime) => (
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
        ) : (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center max-w-md mx-auto">
            <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Your Watchlist is Empty</h3>
            <p className="text-xs text-slate-400 mb-4">
              Browse through our 10,000+ anime titles or Hindi Dub vault and bookmark your favorite series.
            </p>
          </div>
        )}
      </div>

    </section>
  );
};
