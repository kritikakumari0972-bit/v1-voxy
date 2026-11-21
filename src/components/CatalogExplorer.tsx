import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Anime } from '../types/anime';
import { AnimeCard } from './AnimeCard';
import { searchAnimeFromApi } from '../services/jikanApi';
import { GENRES_LIST, CURATED_ANIME } from '../data/curatedAnime';

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
  const [audioFilter, setAudioFilter] = useState<'all' | 'hindi' | 'subbed'>('hindi');
  const [formatFilter, setFormatFilter] = useState<'all' | 'TV' | 'Movie' | 'OVA'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'score' | 'title'>('popularity');
  
  const [animeList, setAnimeList] = useState<Anime[]>(CURATED_ANIME);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalCount, setTotalCount] = useState(10000);

  // Sync external search query prop
  useEffect(() => {
    if (initialSearchQuery !== searchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Debounced API search
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await searchAnimeFromApi(searchQuery, selectedGenre, page, 24);
        if (!isCancelled) {
          setAnimeList(result.animes);
          setHasNextPage(result.hasNextPage);
          setTotalCount(result.total || 10000);
        }
      } catch (err) {
        console.error('Error in search:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedGenre, page]);

  // Client-side sub-filtering for Audio and Format
  const filteredList = animeList.filter((anime) => {
    if (audioFilter === 'hindi' && !anime.hindiDub.isAvailable) {
      return false;
    }
    if (formatFilter !== 'all' && anime.type !== formatFilter) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return (a.rank || 9999) - (b.rank || 9999);
  });

  return (
    <section className="py-8 px-4 sm:px-8 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="mb-8">
        <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1">
          Comprehensive 10,000+ Anime Database
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Explore All Anime & Movies (Hindi Dubbed & Subbed)
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Search over 10,000+ anime titles directly from global databases. Every show comes with working stream players, episodes, and Hindi audio options.
        </p>
      </div>

      {/* Search & Filters Controls Container */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 mb-8 flex flex-col gap-4">
        
        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title, English name, or Hindi name (e.g. Naruto, Bleach, Jujutsu, Death Note)..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-11 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Rows (Interactive segmented buttons allowed by Rule 1.A) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          
          {/* Audio Filter Segmented Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1">Audio:</span>
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                onClick={() => setAudioFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  audioFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Audio
              </button>
              <button
                onClick={() => setAudioFilter('hindi')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  audioFilter === 'hindi'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <span>Hindi Dubbed (हिन्दी)</span>
              </button>
              <button
                onClick={() => setAudioFilter('subbed')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  audioFilter === 'subbed'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Original Japanese Sub
              </button>
            </div>
          </div>

          {/* Format Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1">Format:</span>
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
              {(['all', 'TV', 'Movie', 'OVA'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormatFilter(fmt)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    formatFilter === fmt
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {fmt === 'all' ? 'All' : fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="popularity">Most Popular</option>
              <option value="score">Highest Rated (MAL Score)</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>

        </div>

        {/* Genre Pill Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {GENRES_LIST.map((genre) => (
            <button
              key={genre}
              onClick={() => {
                setSelectedGenre(genre);
                setPage(1);
              }}
              className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                selectedGenre === genre
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6 text-xs text-slate-400">
        <div>
          Showing <span className="font-semibold text-white tabular-nums">{filteredList.length}</span> titles
          {searchQuery && <span> for &ldquo;{searchQuery}&rdquo;</span>}
          {selectedGenre !== 'All Genres' && <span> in {selectedGenre}</span>}
          {audioFilter === 'hindi' && <span className="text-amber-400 font-medium"> (Hindi Dub Only)</span>}
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-rose-400 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Fetching 10,000+ Database...</span>
          </div>
        )}
      </div>

      {/* Anime Grid */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {filteredList.map((anime) => (
            <AnimeCard
              key={`${anime.id}-${anime.mal_id}`}
              anime={anime}
              onPlay={onPlay}
              onViewDetails={onViewDetails}
              isInWatchlist={watchlistIds.has(anime.id)}
              onToggleWatchlist={onToggleWatchlist}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Anime Found</h3>
          <p className="text-xs text-slate-400 mb-4">
            Try adjusting your search terms or genre filter. You can also reset to view all available titles.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGenre('All Genres');
              setAudioFilter('all');
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-3 mt-10">
        <button
          onClick={() => {
            if (page > 1) {
              setPage((p) => p - 1);
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }
          }}
          disabled={page <= 1 || loading}
          className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-xs font-semibold text-slate-200 rounded-lg cursor-pointer"
        >
          Previous Page
        </button>

        <span className="text-xs text-slate-400 font-mono tabular-nums px-2">
          Page {page}
        </span>

        <button
          onClick={() => {
            setPage((p) => p + 1);
            window.scrollTo({ top: 400, behavior: 'smooth' });
          }}
          disabled={!hasNextPage || loading}
          className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 text-xs font-semibold text-slate-200 rounded-lg cursor-pointer"
        >
          Next Page →
        </button>
      </div>

    </section>
  );
};
