import React, { useState } from 'react';
import { X, Play, Bookmark, Star, Volume2, ExternalLink } from 'lucide-react';
import { Anime } from '../types/anime';
import { isHindiDubVerified } from '../services/animeTrust';

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
  const [showTrailer, setShowTrailer] = useState(false);
  const title = anime.titleEnglish || anime.title;
  const hindiVerified = isHindiDubVerified(anime);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl my-auto">
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700" aria-label="Close details">
          <X className="w-5 h-5" />
        </button>
        <div className="relative aspect-[21/9] w-full bg-slate-950 overflow-hidden">
          <img src={anime.bannerImage || anime.image} alt={title} referrerPolicy="no-referrer" className="w-full h-full object-cover brightness-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          <div className="absolute bottom-4 left-5 flex gap-2 items-center">
            {hindiVerified && <span className="bg-amber-400 text-slate-950 font-bold text-xs px-2.5 py-1 rounded"><Volume2 className="w-3.5 h-3.5 inline mr-1" />Verified Hindi audio</span>}
            <span className="bg-slate-900/90 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700">{anime.type}</span>
          </div>
        </div>

        <div className="p-5 sm:p-8 -mt-12 relative z-10 space-y-5">
          <div className="flex flex-col sm:flex-row gap-5">
            <img src={anime.image} alt={title} referrerPolicy="no-referrer" className="w-28 sm:w-36 aspect-[3/4] object-cover rounded-xl border border-slate-700 shadow-xl" />
            <div className="flex-1">
              <h2 className="text-xl sm:text-3xl font-extrabold text-white">{title}</h2>
              {anime.titleHindi && <p className="mt-1 text-amber-300 text-sm">{anime.titleHindi}</p>}
              {anime.titleJapanese && <p className="mt-1 text-xs font-mono text-slate-400">{anime.titleJapanese}</p>}
              <div className="flex flex-wrap gap-2 text-xs text-slate-300 mt-3">
                <span className="text-amber-400"><Star className="w-3 h-3 inline fill-current mr-1" />{anime.score ? anime.score.toFixed(2) : 'Not rated'}</span>
                <span>· {anime.episodes ?? 'Episode count unknown'} episodes</span>
                <span>· {anime.year || 'Year unknown'}</span>
                <span>· {anime.status}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">{anime.genres.join(' · ')} {anime.studios.length ? '· ' + anime.studios.join(', ') : ''}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => { onPlay(anime, 1); onClose(); }} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg">
                  <Play className="w-4 h-4 fill-current" /> Viewing options
                </button>
                <button onClick={() => onToggleWatchlist(anime)} className={'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border ' + (isInWatchlist ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-950 text-slate-300 border-slate-700')}>
                  <Bookmark className={'w-4 h-4 ' + (isInWatchlist ? 'fill-current' : '')} /> {isInWatchlist ? 'Saved' : 'Add to watchlist'}
                </button>
                {anime.trailerEmbedUrl && (
                  <button onClick={() => setShowTrailer((value) => !value)} className="px-4 py-2.5 text-sm font-semibold rounded-lg bg-slate-950 border border-slate-700 text-slate-300 hover:text-white">
                    {showTrailer ? 'Hide trailer' : 'Official trailer'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <section className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Synopsis</h3>
            <p className="text-sm leading-relaxed text-slate-300">{anime.synopsis || 'No synopsis available.'}</p>
          </section>

          {showTrailer && anime.trailerEmbedUrl && (
            <div className="aspect-video rounded-xl overflow-hidden bg-black border border-slate-800">
              <iframe src={anime.trailerEmbedUrl} title={title + ' trailer'} className="w-full h-full border-0" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4 text-xs">
            <span className={hindiVerified ? 'text-emerald-400' : 'text-slate-400'}>
              {hindiVerified ? 'Hindi audio: verified for listed territory' : 'Hindi audio: not verified by this catalogue'}
            </span>
            {anime.mal_id > 0 && (
              <a href={'https://myanimelist.net/anime/' + anime.mal_id} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                Metadata source <ExternalLink className="w-3 h-3 inline ml-1" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
