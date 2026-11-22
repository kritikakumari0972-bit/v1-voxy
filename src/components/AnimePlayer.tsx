import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle, ArrowLeft, Bookmark, CalendarDays, CheckCircle2, ExternalLink,
  Info, Loader2, Play, ShieldCheck, X, Film
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
  anime, initialEpisodeNumber = 1, onClose, onUpdateHistory, isInWatchlist, onToggleWatchlist
}) => {
  const [selectedAudio, setSelectedAudio] = useState<AudioLanguage>('Japanese');
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
  const [episodes, setEpisodes] = useState<JikanEpisode[]>([]);
  const [episodePage, setEpisodePage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [episodeError, setEpisodeError] = useState('');
  const [notice, setNotice] = useState('');
  const lastProgressSavedAt = useRef(0);
  const title = anime.titleEnglish || anime.title;

  const approvedSources = useMemo(
    () => getApprovedStreamSources(anime, selectedAudio, 'IN'),
    [anime, selectedAudio]
  );
  const activeSource = approvedSources[selectedSourceIndex] || approvedSources[0];
  const hasEpisodeStream = Boolean(activeSource);
  const isTrailerPreview = !hasEpisodeStream && Boolean(anime.trailerEmbedUrl);

  useEffect(() => {
    let cancelled = false;
    setEpisodes([]);
    setEpisodeError('');
    setEpisodePage(1);
    if (!anime.mal_id) return () => { cancelled = true; };

    setLoadingEpisodes(true);
    getAnimeEpisodes(anime.mal_id, episodePage)
      .then((result) => {
        if (!cancelled) {
          setEpisodes(result.episodes);
          setHasNextPage(result.hasNextPage);
        }
      })
      .catch((error) => {
        if (!cancelled) setEpisodeError(error instanceof Error ? error.message : 'Episode guide could not be loaded.');
      })
      .finally(() => { if (!cancelled) setLoadingEpisodes(false); });
    return () => { cancelled = true; };
  }, [anime.mal_id, episodePage]);

  useEffect(() => { setSelectedSourceIndex(0); }, [selectedAudio, anime.id]);
  useEffect(() => { lastProgressSavedAt.current = 0; }, [anime.id]);

  const saveProgress = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    const now = Date.now();
    if (!video.ended && now - lastProgressSavedAt.current < 15000) return;
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    lastProgressSavedAt.current = now;
    onUpdateHistory({
      anime,
      episodeNumber: initialEpisodeNumber,
      progressSeconds: Math.floor(video.currentTime),
      durationSeconds: Math.floor(video.duration),
      selectedAudio
    });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setNotice('Page link copied.');
    } catch {
      setNotice('Clipboard is unavailable in this browser.');
    }
    window.setTimeout(() => setNotice(''), 2500);
  };

  const search = encodeURIComponent(title);
  const providerLinks = [
    { label: 'Crunchyroll', url: 'https://www.crunchyroll.com/search?q=' + search },
    { label: 'Netflix', url: 'https://www.netflix.com/search?q=' + search },
    { label: 'Prime Video', url: 'https://www.primevideo.com/search/ref=atv_nb_sr?phrase=' + search }
  ];

  const renderVideo = () => {
    if (activeSource?.serverType === 'embed') {
      return <iframe key={activeSource.embedUrl || activeSource.url} src={activeSource.embedUrl || activeSource.url}
        title={title + ' licensed episode player'} className="h-full w-full border-0"
        allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin" />;
    }
    if (activeSource) {
      return <video key={activeSource.url} src={activeSource.url} controls playsInline preload="metadata"
        onTimeUpdate={saveProgress} onEnded={saveProgress} className="h-full w-full bg-black">
        This browser cannot play the selected video source.
      </video>;
    }
    if (anime.trailerEmbedUrl) {
      return <iframe src={anime.trailerEmbedUrl} title={title + ' official trailer preview'}
        className="h-full w-full border-0" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />;
    }
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center px-6 text-center">
        <Play className="mb-3 h-10 w-10 text-slate-600" />
        <h3 className="text-base font-bold text-white">No video preview available</h3>
        <p className="mt-2 max-w-md text-xs leading-5 text-slate-400">This catalogue entry has no trailer URL and no rights-approved episode source connected yet.</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#070910]/[0.98] backdrop-blur-xl">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/[0.08] bg-[#080a12]/95 px-4 py-3 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={onClose} aria-label="Back to catalogue" className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:text-white"><ArrowLeft className="h-4 w-4" /></button>
          <div className="min-w-0">
            <div className="text-[9px] font-bold uppercase tracking-[0.23em] text-violet-300">VOXY PLAYER</div>
            <h2 className="truncate text-sm font-bold text-white sm:text-base">{title}</h2>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={() => onToggleWatchlist(anime)} aria-label={isInWatchlist ? 'Remove from saved list' : 'Save to list'}
            className={'rounded-xl border p-2 ' + (isInWatchlist ? 'border-amber-300/30 bg-amber-300/10 text-amber-200' : 'border-white/10 bg-white/[0.04] text-slate-300')}>
            <Bookmark className={'h-4 w-4 ' + (isInWatchlist ? 'fill-current' : '')} />
          </button>
          <button onClick={copyLink} aria-label="Copy link" className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:text-white"><ExternalLink className="h-4 w-4" /></button>
          <button onClick={onClose} aria-label="Close player" className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
      </header>

      {notice && <div role="status" className="mx-auto mt-3 w-fit rounded-lg bg-slate-800 px-4 py-2 text-xs text-white">{notice}</div>}

      <main className="mx-auto grid max-w-[1450px] gap-5 px-4 py-5 sm:px-7 lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.8fr)]">
        <section className="min-w-0 space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/40">
            {renderVideo()}
            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur">
              {hasEpisodeStream ? <><ShieldCheck className="h-3 w-3 text-emerald-300" /> Rights-approved episode source</> : isTrailerPreview ? <><Play className="h-3 w-3 text-cyan-300" /> Official trailer preview</> : <><Info className="h-3 w-3" /> No playable video</>}
            </div>
          </div>

          {!hasEpisodeStream && (
            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.045] p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
                <div>
                  <h3 className="text-xs font-bold text-cyan-100">{isTrailerPreview ? 'This is a trailer, not a full episode' : 'Full episodes are not connected for this title'}</h3>
                  <p className="mt-1 text-[11px] leading-5 text-slate-400">
                    Voxy does not turn episode metadata into video files. Full episodes appear here only when an authorised source, territory and audio track have been checked.
                  </p>
                </div>
              </div>
            </div>
          )}

          {approvedSources.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
              <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified source</span>
              {approvedSources.map((source, index) => (
                <button key={source.serverName + index} onClick={() => setSelectedSourceIndex(index)}
                  className={'rounded-lg px-3 py-2 text-[10px] font-semibold ' + (selectedSourceIndex === index ? 'bg-violet-500 text-white' : 'border border-white/10 bg-white/[0.04] text-slate-300')}>
                  {source.serverName}
                </button>
              ))}
              <label className="ml-auto flex items-center gap-2 text-[10px] text-slate-400">
                Audio
                <select value={selectedAudio} onChange={(event) => setSelectedAudio(event.target.value as AudioLanguage)}
                  className="rounded-lg border border-white/10 bg-[#111420] px-2.5 py-2 text-[10px] text-white">
                  <option value="Japanese">Japanese</option><option value="English">English</option><option value="Hindi">Hindi</option>
                </select>
              </label>
            </div>
          )}

          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div><div className="text-[9px] font-bold uppercase tracking-[0.22em] text-violet-300">Watch on official services</div><h3 className="mt-1 text-sm font-bold text-white">Check availability for this title</h3></div>
              <ExternalLink className="h-4 w-4 text-slate-500" />
            </div>
            <p className="mb-4 text-[11px] leading-5 text-slate-400">These links open provider search pages. Availability, subscription terms and audio languages depend on the provider and your region.</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {providerLinks.map((provider) => (
                <a key={provider.label} href={provider.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 text-[11px] font-bold text-slate-200 transition hover:border-violet-400/30 hover:bg-violet-500/[0.08]">
                  {provider.label}<ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                </a>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.07] pt-4 text-[10px] text-slate-500">
            <a href={'https://anilist.co/anime/' + anime.id} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white">AniList record <ExternalLink className="h-3 w-3" /></a>
            {anime.mal_id > 0 && <a href={'https://myanimelist.net/anime/' + anime.mal_id} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white">MyAnimeList record <ExternalLink className="h-3 w-3" /></a>}
            <span className="ml-auto inline-flex items-center gap-1.5 text-emerald-300"><CheckCircle2 className="h-3 w-3" /> Metadata source disclosed</span>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="mb-2 flex items-center gap-2"><Film className="h-4 w-4 text-violet-300" /><h3 className="text-xs font-bold text-white">Episode guide</h3></div>
            <p className="mb-4 text-[10px] leading-5 text-slate-500">Episode names and air dates are catalogue metadata. They do not represent playable video files.</p>
            {!anime.mal_id ? (
              <div className="rounded-xl border border-white/[0.06] bg-black/10 p-4 text-center text-[11px] text-slate-500">This anime does not have a linked MyAnimeList ID for the episode index.</div>
            ) : loadingEpisodes ? (
              <div className="flex items-center gap-2 py-5 text-[11px] text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />Loading episode metadata…</div>
            ) : episodeError ? (
              <div className="flex items-start gap-2 text-[11px] leading-5 text-amber-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{episodeError}</div>
            ) : episodes.length ? (
              <div className="max-h-[30rem] space-y-1.5 overflow-y-auto pr-1">
                {episodes.map((episode) => (
                  <div key={episode.mal_id} className="rounded-xl border border-white/[0.06] bg-black/10 p-3">
                    <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold text-slate-200">EP {episode.number}</span>{episode.aired && <span className="text-[9px] text-slate-600">{new Date(episode.aired).toLocaleDateString()}</span>}</div>
                    <p className="mt-1 text-[10px] leading-4 text-slate-400">{episode.title}</p>
                    {(episode.filler || episode.recap) && <span className="mt-1 inline-block text-[9px] text-amber-300">{episode.recap ? 'Recap entry' : 'Filler entry'}</span>}
                  </div>
                ))}
              </div>
            ) : <div className="rounded-xl border border-white/[0.06] bg-black/10 p-4 text-[11px] text-slate-500">No episode records were returned for this title.</div>}
            {anime.mal_id > 0 && (
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                <button onClick={() => setEpisodePage((value) => Math.max(1, value - 1))} disabled={episodePage <= 1 || loadingEpisodes} className="text-[10px] font-semibold text-slate-400 hover:text-white disabled:opacity-30">Previous</button>
                <span className="text-[9px] text-slate-600">Page {episodePage}</span>
                <button onClick={() => setEpisodePage((value) => value + 1)} disabled={!hasNextPage || loadingEpisodes} className="text-[10px] font-semibold text-slate-400 hover:text-white disabled:opacity-30">Next</button>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.035] p-4">
            <div className="mb-2 flex items-center gap-2 text-emerald-200"><ShieldCheck className="h-4 w-4" /><h3 className="text-[11px] font-bold">Playback checks</h3></div>
            <p className="text-[10px] leading-5 text-slate-400">A video source must include public rights evidence, India territory permission, free and ad-free terms, HTTPS playback and a verified audio language before Voxy can show it as an episode stream.</p>
          </section>
        </aside>
      </main>
    </div>
  );
};
