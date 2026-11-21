/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Anime, WatchHistoryItem } from './types/anime';
import { CURATED_ANIME, COLLECTION_BANNER } from './data/curatedAnime';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AnimeCard } from './components/AnimeCard';
import { AnimePlayer } from './components/AnimePlayer';
import { AnimeDetailsModal } from './components/AnimeDetailsModal';
import { HindiDubSection } from './components/HindiDubSection';
import { CatalogExplorer } from './components/CatalogExplorer';
import { ScheduleView } from './components/ScheduleView';
import { WatchlistView } from './components/WatchlistView';
import { Footer } from './components/Footer';
import { Play, Sparkles, Volume2, Flame, ArrowRight } from 'lucide-react';
import { isHindiDubVerified } from './services/animeTrust';
import { getTopAnimeList } from './services/jikanApi';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'hindi' | 'explore' | 'schedule' | 'watchlist'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingList, setTrendingList] = useState<Anime[]>(CURATED_ANIME.slice(0, 6));

  useEffect(() => {
    let cancelled = false;
    getTopAnimeList(1, 'bypopularity').then((items) => {
      if (!cancelled && items.length) setTrendingList(items.slice(0, 6));
    });
    return () => { cancelled = true; };
  }, []);
  
  // Player state
  const [playingAnime, setPlayingAnime] = useState<Anime | null>(null);
  const [playingEpisodeNum, setPlayingEpisodeNum] = useState<number>(1);

  // Detail Modal state
  const [detailAnime, setDetailAnime] = useState<Anime | null>(null);

  // Watchlist & History stored in localStorage
  const [watchlist, setWatchlist] = useState<Anime[]>(() => {
    try {
      const saved = localStorage.getItem('anihindi_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('anihindi_history');
      const parsed = saved ? JSON.parse(saved) : [];
      // Previous versions generated placeholder progress. Keep only entries created by the real-time player.
      return Array.isArray(parsed) ? parsed.filter((item) => item?.animeSnapshot) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('anihindi_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [watchlist]);

  useEffect(() => {
    try {
      localStorage.setItem('anihindi_history', JSON.stringify(history));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [history]);

  const watchlistIds = new Set(watchlist.map((a) => a.id));

  const handleToggleWatchlist = (anime: Anime) => {
    setWatchlist((prev) => {
      const exists = prev.some((a) => a.id === anime.id);
      if (exists) {
        return prev.filter((a) => a.id !== anime.id);
      } else {
        return [anime, ...prev];
      }
    });
  };

  const handleUpdateHistory = (item: {
    anime: Anime;
    episodeNumber: number;
    progressSeconds: number;
    durationSeconds: number;
    selectedAudio: import('./types/anime').AudioLanguage;
  }) => {
    const newItem: WatchHistoryItem = {
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
    setHistory((previous) => [
      newItem,
      ...previous.filter((entry) =>
        !(entry.animeId === newItem.animeId && entry.episodeNumber === newItem.episodeNumber)
      )
    ].slice(0, 20));
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('anihindi_history');
    } catch {}
  };

  const handlePlay = (anime: Anime, episodeNum = 1) => {
    setPlayingAnime(anime);
    setPlayingEpisodeNum(episodeNum);
  };

  const handleViewDetails = (anime: Anime) => {
    setDetailAnime(anime);
  };

  const handleRandomAnime = () => {
    const choices = trendingList.length ? trendingList : CURATED_ANIME;
    const randomIdx = Math.floor(Math.random() * choices.length);
    const chosen = choices[randomIdx];
    handlePlay(chosen, 1);
  };

  const findAnimeById = (id: number) => {
    return CURATED_ANIME.find((anime) => anime.id === id) ||
      watchlist.find((anime) => anime.id === id) ||
      history.find((item) => item.animeId === id)?.animeSnapshot;
  };

  // Curated lists
  const featuredMarquee = CURATED_ANIME[0]; // Solo Leveling
  const hindiDubbedList = CURATED_ANIME.filter(isHindiDubVerified);
  const shounenFavorites = CURATED_ANIME.filter((a) => a.genres.includes('Shounen') || a.genres.includes('Action')).slice(0, 6);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans">
      
      {/* Header conforming to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRandomAnime={handleRandomAnime}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        watchlistCount={watchlist.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div>
            {/* Hero Section */}
            <HeroSection
              featuredAnime={featuredMarquee}
              onPlay={handlePlay}
              onViewDetails={handleViewDetails}
              isInWatchlist={watchlistIds.has(featuredMarquee.id)}
              onToggleWatchlist={handleToggleWatchlist}
            />

            {/* Quick Continue Watching Row if user has history */}
            {history.length > 0 && (
              <section className="py-6 px-4 sm:px-8 max-w-7xl mx-auto border-b border-slate-800/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-500 uppercase tracking-wider">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Continue Where You Left Off</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('watchlist')}
                    className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    View All History →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {history.slice(0, 4).map((item) => {
                    const matched = findAnimeById(item.animeId);
                    const progress = Math.min(
                      Math.round((item.progressSeconds / (item.durationSeconds || 1425)) * 100),
                      100
                    );
                    return (
                      <button
                        key={`${item.animeId}-${item.episodeNumber}`}
                        onClick={() => matched && handlePlay(matched, item.episodeNumber)}
                        className="flex items-center gap-3 p-2 bg-slate-900/60 hover:bg-slate-850 border border-slate-800 rounded-lg text-left transition-colors cursor-pointer group"
                      >
                        <div className="relative w-12 h-14 bg-slate-950 rounded overflow-hidden shrink-0 border border-slate-800">
                          <img
                            src={item.animeImage}
                            alt={item.animeTitle}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                          </div>
                        </div>
                        <div className="overflow-hidden flex-1">
                          <div className="text-xs font-semibold text-white truncate group-hover:text-rose-400">
                            {item.animeTitle}
                          </div>
                          <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                            Ep {item.episodeNumber} · {item.selectedAudio} Dub
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                            <div className="bg-rose-500 h-full" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Trending & Most Popular Anime Row */}
            <section className="py-10 px-4 sm:px-8 max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Flame className="w-4 h-4" /> Top Ranked Globally & In India
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Trending Right Now
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <span>Explore Anime</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
                {trendingList.map((anime) => (
                  <AnimeCard
                    key={anime.id}
                    anime={anime}
                    onPlay={handlePlay}
                    onViewDetails={handleViewDetails}
                    isInWatchlist={watchlistIds.has(anime.id)}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                ))}
              </div>
            </section>

            {/* Hindi Dubbed Spotlight Vault Section */}
            <HindiDubSection
              hindiAnimeList={hindiDubbedList}
              onPlay={handlePlay}
              onViewDetails={handleViewDetails}
              watchlistIds={watchlistIds}
              onToggleWatchlist={handleToggleWatchlist}
            />

            {/* Shounen & Action Favorites */}
            <section className="py-10 px-4 sm:px-8 max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                    High Adrenaline Battles
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Shounen & Action Masterpieces
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Browse Action Anime →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
                {shounenFavorites.map((anime) => (
                  <AnimeCard
                    key={`shounen-${anime.id}`}
                    anime={anime}
                    onPlay={handlePlay}
                    onViewDetails={handleViewDetails}
                    isInWatchlist={watchlistIds.has(anime.id)}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                ))}
              </div>
            </section>

            {/* Anime Catalogue CTA Banner */}
            <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl">
                  <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                    Full Anime Universe
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-3">
                    Looking for a Specific Anime? Search titles
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    From 90s classics like Dragon Ball Z and Beyblade to the latest winter 2025 simulcasts. Filter by Hindi Dub, genre, movies, or TV series.
                  </p>
                  <button
                    onClick={() => setActiveTab('explore')}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
                  >
                    Open Anime Explorer
                  </button>
                </div>

                <div className="w-full md:w-80 aspect-video rounded-xl overflow-hidden border border-slate-700/80 shadow-xl shrink-0">
                  <img
                    src={COLLECTION_BANNER}
                    alt="Anime Collection"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter brightness-90"
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tab: Dedicated Hindi Dubbed Section */}
        {activeTab === 'hindi' && (
          <HindiDubSection
            hindiAnimeList={hindiDubbedList}
            onPlay={handlePlay}
            onViewDetails={handleViewDetails}
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
          />
        )}

        {/* Tab: Anime Explorer */}
        {activeTab === 'explore' && (
          <CatalogExplorer
            initialSearchQuery={searchQuery}
            onPlay={handlePlay}
            onViewDetails={handleViewDetails}
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
          />
        )}

        {/* Tab: Airing Schedule */}
        {activeTab === 'schedule' && (
          <ScheduleView
            onPlay={handlePlay}
            onViewDetails={handleViewDetails}
          />
        )}

        {/* Tab: Watchlist & History */}
        {activeTab === 'watchlist' && (
          <WatchlistView
            watchlist={watchlist}
            history={history}
            onPlay={handlePlay}
            onViewDetails={handleViewDetails}
            onToggleWatchlist={handleToggleWatchlist}
            onClearHistory={handleClearHistory}
            findAnimeById={findAnimeById}
          />
        )}
      </main>

      {/* Video Streaming Player Overlay (Active when playing) */}
      {playingAnime && (
        <AnimePlayer
          anime={playingAnime}
          initialEpisodeNumber={playingEpisodeNum}
          onClose={() => setPlayingAnime(null)}
          onUpdateHistory={handleUpdateHistory}
          isInWatchlist={watchlistIds.has(playingAnime.id)}
          onToggleWatchlist={handleToggleWatchlist}
        />
      )}

      {/* Details & Episode Guide Modal */}
      {detailAnime && (
        <AnimeDetailsModal
          anime={detailAnime}
          onClose={() => setDetailAnime(null)}
          onPlay={handlePlay}
          isInWatchlist={watchlistIds.has(detailAnime.id)}
          onToggleWatchlist={handleToggleWatchlist}
        />
      )}

      {/* Footer */}
      <Footer
        onSelectGenre={(g) => {
          setSearchQuery('');
          setActiveTab('explore');
        }}
        onNavigateTab={setActiveTab}
      />

    </div>
  );
}
