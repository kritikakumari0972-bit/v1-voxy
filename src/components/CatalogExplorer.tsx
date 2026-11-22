import React, { useEffect, useMemo, useState } from 'react';
import { Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Anime } from '../types/anime';
import { AnimeCard } from './AnimeCard';
import { searchAnimeFromApi } from '../services/jikanApi';
import { GENRES_LIST } from '../data/curatedAnime';
import { isHindiDubVerified } from '../services/animeTrust';

interface CatalogExplorerProps {
  initialSearchQuery?: string;
  onPlay: (anime: Anime) => void;
  onViewDetails: (anime: Anime) => void;
  watchlistIds: Set<number>;
  onToggleWatchlist: (anime: Anime) => void;
}

export const CatalogExplorer: React.FC<CatalogExplorerProps> = ({
  initialSearchQuery = '',
  onPlay,
  onViewDetails,
  watchlistIds,
  onToggleWatchlist,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [audioFilter, setAudioFilter] = useState<'all' | 'hindi'>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | Anime['type']>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'score' | 'title'>('popularity');
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [catalogSource, setCatalogSource] = useState<'anilist' | 'unavailable'>('jikan');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (initialSearchQuery !== searchQuery) {
      setSearchQuery(initialSearchQuery);
      setPage(1);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const result = await searchAnimeFromApi(searchQuery, selectedGenre, page, 24);
        if (cancelled) return;
        setAnimeList(result.animes);
        setHasNextPage(result.hasNextPage);
        setTotalCount(result.total);
        setCatalogSource(result.source);
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : 'Could not load anime.');
          setAnimeList([]);
          setHasNextPage(false);
          setTotalCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery, selectedGenre, page]);

  const filteredList = useMemo(() => animeList.filter((anime) => {
    if (audioFilter === 'hindi' && !isHindiDubVerified(anime)) return false;
    if (formatFilter !== 'all' && anime.type !== formatFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'title') return (a.titleEnglish || a.title).localeCompare(b.titleEnglish || b.title);
    return (a.popularity || a.rank || Number.MAX_SAFE_INTEGER) - (b.popularity || b.rank || Number.MAX_SAFE_INTEGER);
  }), [animeList, audioFilter, formatFilter, sortBy]);

  return (
    <section className="py-8 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="mb-7">
        <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1">Anime database</div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Explore anime and movies</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-3xl">
          Search the live AniList anime catalogue. Catalogue entries do not imply a Hindi dub or a playable stream.
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 mb-7 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setPage(1); }}
            placeholder="Search anime by title…" aria-label="Search anime"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-11 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500" />
          {searchQuery && <button onClick={() => { setSearchQuery(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white">Clear</button>}
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Audio evidence:</span>
            <select value={audioFilter} onChange={(event) => setAudioFilter(event.target.value as 'all' | 'hindi')}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200">
              <option value="all">All catalogue titles</option>
              <option value="hindi">Verified Hindi audio only</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Format:</span>
            <select value={formatFilter} onChange={(event) => setFormatFilter(event.target.value as 'all' | Anime['type'])}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200">
              <option value="all">All formats</option>
              <option value="TV">TV</option>
              <option value="Movie">Movie</option>
              <option value="OVA">OVA</option>
              <option value="Special">Special / ONA</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Sort:</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200">
              <option value="popularity">Popularity</option>
              <option value="score">Highest score</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {GENRES_LIST.map((genre) => (
            <button key={genre} onClick={() => { setSelectedGenre(genre); setPage(1); }}
              className={'px-3 py-1.5 text-xs rounded-lg whitespace-nowrap shrink-0 ' + (selectedGenre === genre ? 'bg-rose-600 text-white font-semibold' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white')}>
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-5 text-xs text-slate-400">
        <div>
          {loading ? 'Loading catalogue…' : 'Showing '}
          {!loading && <><strong className="text-white">{filteredList.length}</strong> of {totalCount.toLocaleString()} catalogue matches</>}
          {searchQuery && !loading && <> for “{searchQuery}”</>}
        </div>
        <div className="flex items-center gap-2">
          {catalogSource === 'unavailable' && <span className="text-amber-300">Live API unavailable · no demo data</span>}
          {loading && <Loader2 className="w-4 h-4 animate-spin text-rose-400" />}
          <button onClick={() => setPage(1)} className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white" aria-label="Refresh catalogue">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {error && <div role="alert" className="mb-5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">{error}</div>}

      {filteredList.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {filteredList.map((anime) => <AnimeCard key={anime.mal_id + '-' + anime.id} anime={anime} onPlay={onPlay}
            onViewDetails={onViewDetails} isInWatchlist={watchlistIds.has(anime.id)} onToggleWatchlist={onToggleWatchlist} />)}
        </div>
      ) : !loading ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-10 text-center max-w-xl mx-auto">
          <AlertCircle className="w-9 h-9 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-2">No titles in this result</h3>
          <p className="text-xs text-slate-400">Try a different title, genre, format, or audio filter.</p>
          <button onClick={() => { setSearchQuery(''); setSelectedGenre('All Genres'); setAudioFilter('all'); setFormatFilter('all'); setPage(1); }}
            className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold">Reset filters</button>
        </div>
      ) : null}

      <div className="flex items-center justify-center gap-4 mt-9">
        <button onClick={() => { setPage((value) => Math.max(1, value - 1)); window.scrollTo({ top: 360, behavior: 'smooth' }); }}
          disabled={page <= 1 || loading} className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 disabled:opacity-40">Previous</button>
        <span className="text-xs text-slate-400">Page {page}</span>
        <button onClick={() => { setPage((value) => value + 1); window.scrollTo({ top: 360, behavior: 'smooth' }); }}
          disabled={!hasNextPage || loading} className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 disabled:opacity-40">Next</button>
      </div>
    </section>
  );
};
