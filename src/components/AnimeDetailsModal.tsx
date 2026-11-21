import React, { useState } from 'react';
import { X, Play, Bookmark, Star, Volume2, ShieldCheck, Film, Calendar, Share2, Sparkles } from 'lucide-react';
import { Anime, Episode } from '../types/anime';
import { generateEpisodesForAnime } from '../data/curatedAnime';

interface AnimeDetailsModalProps {
  anime: Anime;
  onClose: () => void;
  onPlay: (anime: Anime, episodeNum?: number) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (anime: Anime) => void;
}

export const AnimeDetailsModal: React.FC<AnimeDetailsModalProps> = ({
  anime,
  onClose,
  onPlay,
  isInWatchlist,
  onToggleWatchlist,
}) => {
  const [activeTab, setActiveTab] = useState<'episodes' | 'trailer' | 'cast'>('episodes');
  const episodes = generateEpisodesForAnime(anime, 24);

  const displayTitle = anime.titleEnglish || anime.title;
  const isHindi = anime.hindiDub.isAvailable;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/80 hover:bg-rose-900 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Hero Area */}
        <div className="relative aspect-[21/9] sm:aspect-[24/8] w-full bg-slate-950 overflow-hidden">
          <img
            src={anime.bannerImage || anime.image}
            alt={displayTitle}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter brightness-[0.55]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

          {/* Hindi Dub Tag */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            {isHindi && (
              <span className="bg-amber-500 text-slate-950 font-bold text-xs px-2.5 py-1 rounded shadow-lg flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" /> HINDI DUBBED (हिन्दी)
              </span>
            )}
            <span className="bg-slate-900/90 text-slate-300 text-xs px-2 py-1 rounded font-mono border border-slate-700">
              {anime.type}
            </span>
          </div>
        </div>

        {/* Main Details Body */}
        <div className="p-5 sm:p-8 -mt-16 sm:-mt-24 relative z-10 flex flex-col gap-6">
          
          {/* Top Title & Poster Block */}
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <img
              src={anime.image}
              alt={displayTitle}
              referrerPolicy="no-referrer"
              className="w-28 sm:w-36 aspect-[3/4] object-cover rounded-xl shadow-2xl border-2 border-slate-800 shrink-0"
            />

            <div className="flex-1">
              <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {displayTitle}
              </h2>
              {anime.titleHindi && (
                <div className="text-base text-amber-300 font-medium mt-1">
                  {anime.titleHindi}
                </div>
              )}
              {anime.titleJapanese && (
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  {anime.titleJapanese}
                </div>
              )}

              {/* Unboxed Metadata (NO PILLS) */}
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-300 mt-3 font-medium">
                <span className="text-amber-400 font-semibold">{anime.score ? anime.score.toFixed(2) : '7.5'} ★</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="tabular-nums">{anime.episodes ? `${anime.episodes} Episodes` : 'Ongoing'}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{anime.duration}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{anime.status}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400">{anime.genres.join(', ')}</span>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <button
                  onClick={() => {
                    onPlay(anime, 1);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Watch Free (Episode 1)</span>
                </button>

                <button
                  onClick={() => onToggleWatchlist(anime)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg border transition-all cursor-pointer ${
                    isInWatchlist
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-950 text-slate-300 hover:text-white border-slate-700'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isInWatchlist ? 'fill-current' : ''}`} />
                  <span>{isInWatchlist ? 'Saved in Watchlist' : 'Add to Watchlist'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Synopsis</h4>
            <p>{anime.synopsis}</p>
            {anime.synopsisHindi && (
              <p className="mt-2 text-amber-200/90 border-t border-slate-800 pt-2">
                <strong>हिन्दी विवरण:</strong> {anime.synopsisHindi}
              </p>
            )}
          </div>

          {/* Tab Bar: Episodes / Trailer / Voice Cast */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-4 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('episodes')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'episodes' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Episodes ({episodes.length})
              </button>
              {anime.trailerEmbedUrl && (
                <button
                  onClick={() => setActiveTab('trailer')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'trailer' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Trailer Preview
                </button>
              )}
              {isHindi && (
                <button
                  onClick={() => setActiveTab('cast')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'cast' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Hindi Voice Cast
                </button>
              )}
            </div>

            {/* Episodes Tab */}
            {activeTab === 'episodes' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {episodes.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => {
                      onPlay(anime, ep.number);
                      onClose();
                    }}
                    className="p-2.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-rose-500 font-mono shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                        {ep.number}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-medium text-white truncate group-hover:text-rose-400">
                          {ep.title}
                        </div>
                        {ep.titleHindi && (
                          <div className="text-[11px] text-amber-300/80 truncate">
                            {ep.titleHindi}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0 pl-2">
                      {ep.duration}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Trailer Tab */}
            {activeTab === 'trailer' && anime.trailerEmbedUrl && (
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-800 bg-black">
                <iframe
                  src={anime.trailerEmbedUrl}
                  title="Official Anime Trailer"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Voice Cast Tab */}
            {activeTab === 'cast' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(anime.hindiDub.voiceActors || [
                  { character: 'Protagonist', actor: 'Sanket Mhatre', role: 'Main Lead' },
                  { character: 'Rival / Deuteragonist', actor: 'Rajesh Kava', role: 'Support Lead' },
                  { character: 'Heroine', actor: 'Pooja Punjabi', role: 'Support' },
                ]).map((actor) => (
                  <div key={actor.character} className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="text-xs font-bold text-white">{actor.character}</div>
                    <div className="text-xs text-amber-400 font-semibold">{actor.actor}</div>
                    <div className="text-[10px] text-slate-500">{actor.role}</div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
