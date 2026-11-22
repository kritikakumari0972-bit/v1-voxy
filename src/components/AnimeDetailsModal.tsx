import React, { useState } from 'react';
import { Bookmark, ExternalLink, Film, Play, Star, Volume2, X } from 'lucide-react';
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
  anime, onClose, onPlay, isInWatchlist, onToggleWatchlist
}) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const title = anime.titleEnglish || anime.title;
  const hindiVerified = isHindiDubVerified(anime);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/80 p-3 backdrop-blur-xl sm:p-6">
      <section className="relative my-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#10131f] shadow-2xl">
        <button onClick={onClose} aria-label="Close title details" className="absolute right-4 top-4 z-20 rounded-xl border border-white/15 bg-black/50 p-2 text-white backdrop-blur hover:bg-black/75"><X className="h-4 w-4" /></button>
        <div className="relative h-44 overflow-hidden bg-slate-900 sm:h-64">
          {anime.bannerImage || anime.image ? <img src={anime.bannerImage || anime.image} alt="" className="h-full w-full object-cover opacity-45" /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#10131f] via-[#10131f]/45 to-black/10" />
          <div className="absolute bottom-4 left-5 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-white/10 bg-black/50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white">{anime.type}</span>
            {hindiVerified && <span className="rounded-md bg-amber-300 px-2.5 py-1 text-[9px] font-extrabold text-slate-950"><Volume2 className="mr-1 inline h-3 w-3" />Hindi audio verified</span>}
          </div>
        </div>

        <div className="relative -mt-10 space-y-5 p-5 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row">
            <img src={anime.image} alt={title} referrerPolicy="no-referrer" className="aspect-[3/4] w-28 rounded-xl border border-white/10 object-cover shadow-xl sm:w-36" />
            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-violet-300">VOXY · TITLE PROFILE</div>
              <h2 className="mt-1 text-2xl font-black leading-tight text-white sm:text-3xl">{title}</h2>
              {anime.titleJapanese && <p className="mt-1 text-xs text-slate-500">{anime.titleJapanese}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-amber-300"><Star className="h-3 w-3 fill-current" />{anime.score > 0 ? anime.score.toFixed(1) : 'Not rated'}</span>
                <span>· {anime.year || 'Year not listed'}</span><span>· {anime.episodes ? anime.episodes + ' episodes' : 'Episode count unknown'}</span><span>· {anime.status}</span>
              </div>
              <p className="mt-2 text-[10px] text-slate-500">{anime.genres.join(' · ') || 'Genres not listed'}{anime.studios.length ? ' · ' + anime.studios.join(', ') : ''}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => { onPlay(anime, 1); onClose(); }} className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-[11px] font-bold text-white transition hover:bg-violet-400"><Play className="h-3.5 w-3.5 fill-current" /> Trailer & viewing options</button>
                <button onClick={() => onToggleWatchlist(anime)} className={'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[11px] font-semibold ' + (isInWatchlist ? 'border-amber-300/30 bg-amber-300/10 text-amber-200' : 'border-white/10 bg-white/[0.04] text-slate-300')}>
                  <Bookmark className={'h-3.5 w-3.5 ' + (isInWatchlist ? 'fill-current' : '')} />{isInWatchlist ? 'Saved to your list' : 'Save to my list'}
                </button>
                {anime.trailerEmbedUrl && <button onClick={() => setShowTrailer((value) => !value)} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[11px] font-semibold text-slate-300">{showTrailer ? 'Hide trailer' : 'Show trailer'}</button>}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-black/15 p-4">
            <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">About this anime</h3>
            <p className="text-xs leading-6 text-slate-300">{anime.synopsis || 'No synopsis is available from the catalogue.'}</p>
          </div>

          {showTrailer && anime.trailerEmbedUrl && (
            <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
              <iframe src={anime.trailerEmbedUrl} title={title + ' trailer'} className="h-full w-full border-0" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4 text-[10px]">
            <span className={hindiVerified ? 'text-emerald-300' : 'text-slate-500'}>{hindiVerified ? 'Hindi audio evidence reviewed' : 'Hindi audio status not verified'}</span>
            <a href={'https://anilist.co/anime/' + anime.id} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white">View AniList source <ExternalLink className="h-3 w-3" /></a>
          </div>
        </div>
      </section>
    </div>
  );
};
