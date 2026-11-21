import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X, Bookmark, Share2, ExternalLink, Calendar, ListVideo,
  Loader2, AlertCircle, ChevronLeft, ChevronRight, ShieldCheck, Info
} from 'lucide-react';
import { Anime, AudioLanguage } from '../types/anime';
import { getAnimeEpisodes, JikanEpisode } from '../services/jikanApi';
import { getApprovedStreamSources } from '../services/animeTrust';

interface AnimePlayerProps {
  anime: Anime;
  initialEpisodeNumber?: number;
  onClose: () => void;
  onUpdateHistory: (item: {
    anime: Anime;
    episodeNumber: number;
    progressSeconds: number;
    durationSeconds: number;
    selectedAudio: AudioLanguage;
  }) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (anime: Anime) => void;
}

export const AnimePlayer: React.FC<AnimePlayerProps> = ({
  anime,
  initialEpisodeNumber = 1,
  onClose,
  onUpdateHistory,
  isInWatchlist,
  onToggleWatchlist,
}) => {
  const [currentEpisodeNum, setCurrentEpisodeNum] = useState(initialEpisodeNumber);
  const [episodePage, setEpisodePage] = useState(1);
  const [episodes, setEpisodes] = useState<JikanEpisode[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [episodeError, setEpisodeError] = useState('');
  const [selectedAudio, setSelectedAudio] = useState<AudioLanguage>('Japanese');
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
  const [notice, setNotice] = useState('');
  const lastProgressSavedAt = useRef(0);

  const title = anime.titleEnglish || anime.title;
  const approvedSources = useMemo(
    () => getApprovedStreamSources(anime, selectedAudio, 'IN'),
    [anime, selectedAudio]
  );
  const activeSource = approvedSources[selectedSourceIndex] || approvedSources[0];
  const episodeTitle = episodes.find((item) => item.number === currentEpisodeNum)?.title ||
    ('Episode ' + currentEpisodeNum);
  const query = encodeURIComponent(title + ' episode ' + currentEpisodeNum);
  const officialLinks = [
    { name: 'Crunchyroll', url: 'https://www.crunchyroll.com/search?q=' + query },
    { name: 'Netflix', url: 'https://www.netflix.com/search?q=' + query },
    { name: 'Prime Video', url: 'https://www.primevideo.com/search/ref=atv_nb_sr?phrase=' + query },
    { name: 'YouTube official channels', url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(title + ' official channel') }
  ];

  useEffect(() => {
    let cancelled = false;
    setLoadingEpisodes(true);
    setEpisodeError('');
    getAnimeEpisodes(anime.mal_id || anime.id, episodePage)
      .then((result) => {
        if (!cancelled) {
          setEpisodes(result.episodes);
          setHasNextPage(result.hasNextPage);
        }
      })
      .catch((error) => {
        if (!cancelled) setEpisodeError(error instanceof Error ? error.message : 'Episode guide is unavailable.');
      })
      .finally(() => {
        if (!cancelled) setLoadingEpisodes(false);
      });
    return () => { cancelled = true; };
  }, [anime.id, anime.mal_id, episodePage]);

  useEffect(() => {
    setSelectedSourceIndex(0);
  }, [selectedAudio, anime.id]);

  useEffect(() => {
    lastProgressSavedAt.current = 0;
  }, [currentEpisodeNum]);

  const saveVideoProgress = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    const now = Date.now();
    if (!video.ended && now - lastProgressSavedAt.current < 15000) return;
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    lastProgressSavedAt.current = now;
    onUpdateHistory({
      anime,
      episodeNumber: currentEpisodeNum,
      progressSeconds: Math.floor(video.currentTime),
      durationSeconds: Math.floor(video.duration),
      selectedAudio
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setNotice('Page link copied.');
    } catch {
      setNotice('Clipboard access is unavailable in this browser.');
    }
    window.setTimeout(() => setNotice(''), 2500);
  };

  const renderPlayer = () => {
    if (activeSource?.serverType === 'embed') {
      return (
        <iframe
          key={activeSource.embedUrl || activeSource.url}
          src={activeSource.embedUrl || activeSource.url}
          title={title + ' licensed player'}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      );
    }
    if (activeSource) {
      return (
        <video key={activeSource.url} src={activeSource.url} controls playsInline className="w-full h-full bg-black">
          Your browser does not support this video source.
        </video>
      );
    }
    return (
      <div className="w-full h-full min-h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-950">
        <ShieldCheck className="w-10 h-10 text-emerald-400 mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">No approved episode stream connected</h3>
        <p className="max-w-lg text-sm text-slate-400">
          This title is in the anime catalogue, but no free, ad-free, rights-cleared episode source with a verified {selectedAudio} audio track has been added.
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-md flex flex-col">
      <header className="sticky top-0 z-10 bg-[#0b0e14]/95 border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white" aria-label="Back to catalogue">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="text-xs text-rose-400 font-semibold">ANIHINDI · ANIME GUIDE</div>
            <h2 className="text-sm sm:text-base font-bold text-white truncate">{title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onToggleWatchlist(anime)} className={'p-2 rounded-lg border ' + (isInWatchlist ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-900 text-slate-300 border-slate-800')} aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}>
            <Bookmark className={'w-4 h-4 ' + (isInWatchlist ? 'fill-current' : '')} />
          </button>
          <button onClick={handleShare} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300" aria-label="Share">
            <Share2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-rose-400" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {notice && <div role="status" className="mx-auto mt-3 px-4 py-2 rounded-lg bg-slate-800 text-white text-xs">{notice}</div>}

      <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <div className="aspect-video bg-black border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            {renderPlayer()}
          </div>

          {approvedSources.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-slate-300 font-semibold mr-2">Approved server:</span>
              {approvedSources.map((source, index) => (
                <button key={source.serverName + index} onClick={() => setSelectedSourceIndex(index)}
                  className={'px-3 py-1.5 text-xs rounded-lg ' + (selectedSourceIndex === index ? 'bg-rose-600 text-white' : 'bg-slate-950 text-slate-300 border border-slate-800')}>
                  {source.serverName}
                </button>
              ))}
            </div>
          )}

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs text-rose-400 font-semibold uppercase tracking-wide">Episode selection</div>
                <h3 className="text-base text-white font-bold">{episodeTitle}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs text-slate-400" htmlFor="audio-track">Audio</label>
                <select id="audio-track" value={selectedAudio} onChange={(event) => setSelectedAudio(event.target.value as AudioLanguage)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white">
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                  <option value="Japanese">Japanese</option>
                </select>
                <button onClick={() => setCurrentEpisodeNum((value) => Math.max(1, value - 1))} disabled={currentEpisodeNum <= 1}
                  className="p-2 bg-slate-800 rounded-lg text-white disabled:opacity-40" aria-label="Previous episode">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setCurrentEpisodeNum((value) => value + 1)}
                  className="p-2 bg-slate-800 rounded-lg text-white" aria-label="Next episode">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              The audio selector only filters sources verified for that language; it does not change the audio of a trailer.
            </p>
          </div>

          <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
              <ExternalLink className="w-4 h-4 text-rose-400" /> Official catalogue searches
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              These open provider search pages. Availability, subscription requirements and audio languages vary by title and region; no title is claimed to be available until confirmed by the provider.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {officialLinks.map((link) => (
                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 hover:border-rose-500/50 hover:text-white">
                  {link.name} <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </section>
        </section>

        <aside className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 text-rose-400 text-xs font-bold uppercase">
              <ListVideo className="w-4 h-4" /> Real episode guide
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Episode names and dates are metadata from MyAnimeList through Jikan. They are not video files or streaming links.
            </p>
            {loadingEpisodes ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-4"><Loader2 className="w-4 h-4 animate-spin" /> Loading episode guide…</div>
            ) : episodeError ? (
              <div className="text-xs text-amber-300 flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{episodeError}</div>
            ) : episodes.length ? (
              <div className="max-h-[28rem] overflow-y-auto space-y-1.5">
                {episodes.map((episode) => (
                  <button key={episode.mal_id} onClick={() => setCurrentEpisodeNum(episode.number)}
                    className={'w-full text-left p-2.5 rounded-lg border text-xs ' + (currentEpisodeNum === episode.number ? 'bg-rose-600/15 border-rose-500/40 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700')}>
                    <span className="font-semibold">Episode {episode.number}</span>
                    <span className="block mt-0.5 text-slate-400 line-clamp-2">{episode.title}</span>
                    {episode.aired && <span className="block mt-1 text-[10px] text-slate-500"><Calendar className="w-3 h-3 inline mr-1" />{new Date(episode.aired).toLocaleDateString()}</span>}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No episode entries were returned for this title.</p>
            )}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
              <button onClick={() => setEpisodePage((value) => Math.max(1, value - 1))} disabled={episodePage <= 1 || loadingEpisodes}
                className="text-xs text-slate-300 disabled:opacity-40">Previous</button>
              <span className="text-[11px] text-slate-500">Page {episodePage}</span>
              <button onClick={() => setEpisodePage((value) => value + 1)} disabled={!hasNextPage || loadingEpisodes}
                className="text-xs text-slate-300 disabled:opacity-40">Next</button>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2"><Info className="w-4 h-4" /> Source transparency</div>
            <p className="text-xs leading-relaxed text-slate-400">
              This screen accepts only HTTPS sources marked verified with a public rights-evidence URL, India territory, free and ad-free status, and a verified audio track. The catalogue does not create or extract streams.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
};
