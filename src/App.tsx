import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowRight, Bookmark, CheckCircle2, Compass,
  Film, Flame, Loader2, Play, Search, Shuffle, Sparkles,
  Star, X, Menu, SlidersHorizontal, AlertCircle
} from 'lucide-react';
import { Anime, AudioLanguage, WatchHistoryItem } from './types/anime';
import { searchAnimeFromApi } from './services/jikanApi';
import { isHindiDubVerified } from './services/animeTrust';
import { AnimeCard } from './components/AnimeCard';
import { AnimePlayer } from './components/AnimePlayer';
import { AnimeDetailsModal } from './components/AnimeDetailsModal';

type View = 'discover' | 'trending' | 'top' | 'watchlist';
const GENRES = ['All Genres', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'];
const SORT_FOR_VIEW = {
  discover: 'POPULARITY_DESC',
  trending: 'TRENDING_DESC',
  top: 'SCORE_DESC'
} as const;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [view, setView] = useState<View>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [genre, setGenre] = useState('All Genres');
  const [verifiedHindiOnly, setVerifiedHindiOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [total, setTotal] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [watchlist, setWatchlist] = useState<Anime[]>(() => readStorage('voxy_watchlist', []));
  const [, setHistory] = useState<WatchHistoryItem[]>(() => readStorage('voxy_history', []));
  const [playingAnime, setPlayingAnime] = useState<Anime | null>(null);
  const [detailAnime, setDetailAnime] = useState<Anime | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem('voxy_watchlist', JSON.stringify(watchlist)); } catch { /* storage may be disabled */ }
  }, [watchlist]);

  useEffect(() => {
    try { localStorage.setItem('voxy_history', JSON.stringify(history)); } catch { /* storage may be disabled */ }
  }, [history]);

  useEffect(() => {
    let cancelled = false;
    if (view === 'watchlist') {
      setLoading(false);
      setError('');
      setTotal(watchlist.length);
      setHasNextPage(false);
      return () => { cancelled = true; };
    }

    const selectedSort = SORT_FOR_VIEW[view];
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      const result = await searchAnimeFromApi(
        searchQuery,
        genre,
        page,
        24,
        selectedSort
      );
      if (cancelled) return;
      setAnimeList(result.animes);
      setTotal(result.total);
      setHasNextPage(result.hasNextPage);
      setError(result.error || '');
      setLoading(false);
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [view, searchQuery, genre, page, watchlist.length]);

  const watchlistIds = useMemo(() => new Set(watchlist.map((anime) => anime.id)), [watchlist]);

  const visibleAnime = useMemo(() => {
    const source = view === 'watchlist' ? watchlist : animeList;
    const query = searchQuery.trim().toLocaleLowerCase();
    return source.filter((anime) => {
      const matchesQuery = !query || [
        anime.title, anime.titleEnglish, anime.titleJapanese, anime.titleHindi
      ].some((title) => title?.toLocaleLowerCase().includes(query));
      const matchesGenre = genre === 'All Genres' || anime.genres.some((item) => item.toLowerCase() === genre.toLowerCase());
      const matchesHindi = !verifiedHindiOnly || isHindiDubVerified(anime);
      return matchesQuery && matchesGenre && matchesHindi;
    });
  }, [view, watchlist, animeList, searchQuery, genre, verifiedHindiOnly]);

  const featuredAnime = view !== 'watchlist' && !searchQuery.trim() && genre === 'All Genres' && !verifiedHindiOnly
    ? visibleAnime[0]
    : undefined;
  const gridAnime = featuredAnime ? visibleAnime.slice(1) : visibleAnime;

  const handleToggleWatchlist = (anime: Anime) => {
    setWatchlist((current) => current.some((item) => item.id === anime.id)
      ? current.filter((item) => item.id !== anime.id)
      : [anime, ...current]);
  };

  const handleUpdateHistory = (item: {
    anime: Anime;
    episodeNumber: number;
    progressSeconds: number;
    durationSeconds: number;
    selectedAudio: AudioLanguage;
  }) => {
    const entry: WatchHistoryItem = {
      animeId: item.anime.id,
      animeTitle: item.anime.titleEnglish || item.anime.title,
      animeImage: item.anime.image,
      episodeNumber: item.episodeNumber,
      progressSeconds: item.progressSeconds,
      durationSeconds: item.durationSeconds,
      lastWatchedAt: Date.now(),
      selectedAudio: item.selectedAudio,
      animeSnapshot: item.anime
    };
    setHistory((current) => [
      entry,
      ...current.filter((old) => !(old.animeId === entry.animeId && old.episodeNumber === entry.episodeNumber))
    ].slice(0, 30));
  };

  const chooseView = (next: View) => {
    setView(next);
    setPage(1);
    setMobileMenuOpen(false);
  };

  const randomAnime = () => {
    const pool = visibleAnime.length ? visibleAnime : animeList;
    if (pool.length) setDetailAnime(pool[Math.floor(Math.random() * pool.length)]);
  };

  const viewLabel = view === 'trending' ? 'Trending now' : view === 'top' ? 'Top rated' : view === 'watchlist' ? 'Your saved titles' : 'Discover anime';
  const viewDescription = view === 'trending'
    ? 'Popular titles gaining attention across the community.'
    : view === 'top'
      ? 'Highly rated anime, ranked by AniList scores.'
      : view === 'watchlist'
        ? 'Your saved anime, stored in this browser.'
        : 'Search and explore anime records from the live AniList catalogue.';

  return (
    <div className="min-h-screen bg-[#080a12] text-slate-100 selection:bg-violet-500/40">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-52 left-[12%] h-[32rem] w-[32rem] rounded-full bg-violet-700/10 blur-[120px]" />
        <div className="absolute top-[38rem] right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#080a12]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-4 py-3 sm:px-7">
          <button onClick={() => chooseView('discover')} className="flex shrink-0 items-center gap-2.5 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-lg font-black text-white shadow-lg shadow-violet-950/50">V</span>
            <span>
              <span className="block text-[18px] font-black tracking-tight text-white">VOXY<span className="text-violet-400">.</span></span>
              <span className="-mt-0.5 block text-[9px] font-bold uppercase tracking-[0.24em] text-slate-500">Anime discovery</span>
            </span>
          </button>

          <nav className="ml-7 hidden items-center gap-1 lg:flex">
            {([
              ['discover', 'Discover', Compass],
              ['trending', 'Trending', Flame],
              ['top', 'Top rated', Star],
              ['watchlist', 'My list', Bookmark]
            ] as const).map(([key, label, Icon]) => (
              <button key={key} onClick={() => chooseView(key)}
                className={'flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ' + (view === key ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white')}>
                <Icon className="h-3.5 w-3.5" />{label}
                {key === 'watchlist' && watchlist.length > 0 && <span className="rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[10px] text-violet-200">{watchlist.length}</span>}
              </button>
            ))}
          </nav>

          <div className="relative ml-auto hidden w-full max-w-md sm:block">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setPage(1); }}
              placeholder="Search anime titles..." aria-label="Search anime titles"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400/50 focus:bg-white/[0.07]" />
          </div>

          <button onClick={randomAnime} className="hidden shrink-0 items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 px-3.5 py-2.5 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/20 md:flex">
            <Shuffle className="h-3.5 w-3.5" /> Pick for me
          </button>
          <button onClick={() => setMobileMenuOpen((open) => !open)} className="ml-auto rounded-xl border border-white/10 p-2 text-slate-300 sm:ml-0 lg:hidden" aria-label="Toggle navigation">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="border-t border-white/[0.05] px-4 py-2.5 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setPage(1); }}
              placeholder="Search titles..." aria-label="Search anime titles"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-violet-400/50" />
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="grid grid-cols-2 gap-2 border-t border-white/[0.06] p-3 lg:hidden">
            <button onClick={() => chooseView('discover')} className="rounded-lg bg-white/[0.06] p-3 text-left text-xs text-slate-200">Discover</button>
            <button onClick={() => chooseView('trending')} className="rounded-lg bg-white/[0.06] p-3 text-left text-xs text-slate-200">Trending</button>
            <button onClick={() => chooseView('top')} className="rounded-lg bg-white/[0.06] p-3 text-left text-xs text-slate-200">Top rated</button>
            <button onClick={() => chooseView('watchlist')} className="rounded-lg bg-white/[0.06] p-3 text-left text-xs text-slate-200">My list ({watchlist.length})</button>
          </nav>
        )}
      </header>

      <main className="relative z-10 mx-auto max-w-[1500px] px-4 pb-16 pt-7 sm:px-7 sm:pt-10">
        {!searchQuery.trim() && view !== 'watchlist' && featuredAnime && (
          <section className="relative mb-10 min-h-[390px] overflow-hidden rounded-[28px] border border-white/10 bg-[#121522] shadow-2xl shadow-black/30 sm:min-h-[440px]">
            {featuredAnime.bannerImage || featuredAnime.image ? (
              <img src={featuredAnime.bannerImage || featuredAnime.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c15] via-[#0a0c15]/90 to-[#0a0c15]/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c15] via-transparent to-transparent" />
            <div className="relative flex min-h-[390px] flex-col justify-end p-6 sm:min-h-[440px] sm:p-10 lg:max-w-3xl">
              <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
                <Sparkles className="h-3.5 w-3.5" /> Live catalogue spotlight
                <span className="h-1 w-1 rounded-full bg-slate-500" />
                AniList metadata
              </div>
              <h1 className="max-w-2xl text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                {featuredAnime.titleEnglish || featuredAnime.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-300"><Star className="h-3.5 w-3.5 fill-current" />{featuredAnime.score > 0 ? featuredAnime.score.toFixed(1) : 'Not rated'}</span>
                <span className="text-slate-600">•</span><span>{featuredAnime.type}</span>
                <span className="text-slate-600">•</span><span>{featuredAnime.year || 'Year not listed'}</span>
                <span className="text-slate-600">•</span><span>{featuredAnime.episodes ? featuredAnime.episodes + ' episodes' : 'Episode count not listed'}</span>
              </div>
              <p className="mt-4 line-clamp-3 max-w-2xl text-sm leading-6 text-slate-300/90">{featuredAnime.synopsis}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button onClick={() => setDetailAnime(featuredAnime)} className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-extrabold text-slate-950 transition hover:bg-violet-100">
                  <Film className="h-4 w-4" /> Explore title <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setPlayingAnime(featuredAnime)} className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.07] px-5 py-3 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/15">
                  <Play className="h-4 w-4" /> Trailer & viewing options
                </button>
              </div>
            </div>
            <div className="absolute bottom-5 right-6 hidden items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-[10px] font-semibold text-slate-300 backdrop-blur md:flex">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Metadata loaded from AniList
            </div>
          </section>
        )}

        <section className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-violet-300">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" /> Your anime space
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{searchQuery.trim() ? 'Search results' : viewLabel}</h2>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-400">{viewDescription}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Browse by</span>
            {GENRES.map((item) => (
              <button key={item} onClick={() => { setGenre(item); setPage(1); }}
                className={'whitespace-nowrap rounded-lg border px-3 py-2 text-[10px] font-semibold transition ' + (genre === item ? 'border-violet-400/40 bg-violet-500/15 text-violet-100' : 'border-white/[0.07] bg-white/[0.025] text-slate-400 hover:border-white/20 hover:text-white')}>
                {item}
              </button>
            ))}
          </div>
        </section>

        <div className="mb-5 flex flex-col gap-3 border-y border-white/[0.07] py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
            <span className="font-semibold text-white">{view === 'watchlist' ? visibleAnime.length.toLocaleString() : total.toLocaleString()}</span>
            {view === 'watchlist' ? 'saved titles in this view' : 'matching anime records in the live catalogue'}
            <span className="hidden h-3 w-px bg-white/10 sm:block" />
            <span className="inline-flex items-center gap-1.5 text-emerald-300"><Activity className="h-3 w-3" /> Live API data</span>
          </div>
          <button onClick={() => setVerifiedHindiOnly((value) => !value)}
            className={'flex items-center gap-2 self-start rounded-lg border px-3 py-2 text-[10px] font-semibold transition sm:self-auto ' + (verifiedHindiOnly ? 'border-amber-300/30 bg-amber-400/10 text-amber-200' : 'border-white/[0.08] text-slate-400 hover:text-white')}>
            <SlidersHorizontal className="h-3.5 w-3.5" /> {verifiedHindiOnly ? 'Showing verified Hindi audio' : 'Verified Hindi audio only'}
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-4 text-xs text-rose-100">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
            <div><strong className="block text-rose-200">Catalogue connection issue</strong><span className="mt-1 block text-rose-100/70">{error} No sample titles are being substituted.</span></div>
          </div>
        )}

        {loading ? (
          <div className="grid min-h-64 place-items-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex flex-col items-center gap-3 text-xs text-slate-400"><Loader2 className="h-7 w-7 animate-spin text-violet-300" />Fetching live anime records…</div>
          </div>
        ) : visibleAnime.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {gridAnime.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} onPlay={setPlayingAnime}
                onViewDetails={setDetailAnime} isInWatchlist={watchlistIds.has(anime.id)}
                onToggleWatchlist={handleToggleWatchlist} />
            ))}
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
            <div className="max-w-md">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.05] text-slate-500"><Film className="h-5 w-5" /></div>
              <h3 className="text-base font-bold text-white">{verifiedHindiOnly ? 'No verified Hindi audio entries yet' : view === 'watchlist' ? 'Your list is empty' : 'No matching titles found'}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                {verifiedHindiOnly
                  ? 'AniList supplies anime metadata, not dub-rights records. Voxy only marks Hindi audio when evidence is reviewed.'
                  : view === 'watchlist'
                    ? 'Save anime from the catalogue and they will appear here on this device.'
                    : 'Try another title or genre. When the API is unavailable, Voxy does not fill the page with invented demo data.'}
              </p>
              <button onClick={() => { setSearchQuery(''); setGenre('All Genres'); setVerifiedHindiOnly(false); if (view === 'watchlist') chooseView('discover'); }}
                className="mt-5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-violet-100">Reset view</button>
            </div>
          </div>
        )}

        {view !== 'watchlist' && (
          <div className="mt-9 flex items-center justify-center gap-4">
            <button onClick={() => { setPage((value) => Math.max(1, value - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page <= 1 || loading} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-30">Previous</button>
            <span className="text-xs tabular-nums text-slate-500">Page {page}</span>
            <button onClick={() => { setPage((value) => value + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={!hasNextPage || loading} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-30">Next</button>
          </div>
        )}

        <section className="mt-14 grid gap-4 rounded-3xl border border-white/[0.07] bg-gradient-to-br from-violet-500/[0.08] via-white/[0.025] to-cyan-400/[0.04] p-5 sm:grid-cols-3 sm:p-7">
          <div><div className="mb-2 flex items-center gap-2 text-xs font-bold text-white"><Compass className="h-4 w-4 text-violet-300" /> Real catalogue</div><p className="text-[11px] leading-5 text-slate-400">Titles, posters, genres and scores are fetched from AniList. The count shown above comes from the live API response.</p></div>
          <div><div className="mb-2 flex items-center gap-2 text-xs font-bold text-white"><Play className="h-4 w-4 text-cyan-300" /> Honest playback</div><p className="text-[11px] leading-5 text-slate-400">The player displays actual trailers and only enables full video sources that pass the rights and territory checks.</p></div>
          <div><div className="mb-2 flex items-center gap-2 text-xs font-bold text-white"><Bookmark className="h-4 w-4 text-emerald-300" /> Your list stays yours</div><p className="text-[11px] leading-5 text-slate-400">Watchlist and supported playback progress are saved locally in this browser. No account is required.</p></div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.07] px-4 py-7 text-center text-[10px] text-slate-600">
        VOXY ANIME · Discovery and metadata interface · Anime availability and playback rights belong to their respective providers.
      </footer>

      {detailAnime && (
        <AnimeDetailsModal anime={detailAnime} onClose={() => setDetailAnime(null)}
          onPlay={(anime) => { setDetailAnime(null); setPlayingAnime(anime); }}
          isInWatchlist={watchlistIds.has(detailAnime.id)} onToggleWatchlist={handleToggleWatchlist} />
      )}
      {playingAnime && (
        <AnimePlayer key={playingAnime.id} anime={playingAnime} initialEpisodeNumber={1}
          onClose={() => setPlayingAnime(null)} onUpdateHistory={handleUpdateHistory}
          isInWatchlist={watchlistIds.has(playingAnime.id)} onToggleWatchlist={handleToggleWatchlist} />
      )}
    </div>
  );
}
