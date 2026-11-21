import React, { useState } from 'react';
import { Search, Shuffle, Bookmark, Sparkles, X } from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'hindi' | 'explore' | 'schedule' | 'watchlist';
  setActiveTab: (tab: 'home' | 'hindi' | 'explore' | 'schedule' | 'watchlist') => void;
  onRandomAnime: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  watchlistCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRandomAnime,
  searchQuery,
  setSearchQuery,
  watchlistCount,
}) => {
  const [showSearchModal, setShowSearchModal] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveTab('explore');
      setShowSearchModal(false);
    }
  };

  return (
    <>
      {/* Strict 3-zone Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (4-5 single-line links) — Zone 3 (1 primary action) */}
      <header className="sticky top-0 z-40 w-full bg-[#0b0e14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          
          {/* Zone 1: Single element Brand wordmark */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-sm tracking-tighter">AH</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
                Ani<span className="text-rose-500">Hindi</span>
              </span>
            </div>
          </button>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <button
              onClick={() => setActiveTab('home')}
              className={`hover:text-white transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                activeTab === 'home' ? 'text-white border-b-2 border-rose-500 font-semibold' : 'text-slate-400'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('hindi')}
              className={`hover:text-white transition-colors whitespace-nowrap cursor-pointer pb-0.5 flex items-center gap-1.5 ${
                activeTab === 'hindi' ? 'text-white border-b-2 border-rose-500 font-semibold' : 'text-slate-400'
              }`}
            >
              <span>Hindi Dubbed</span>
              <span className="text-[11px] text-amber-400 font-normal">हिन्दी</span>
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`hover:text-white transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                activeTab === 'explore' ? 'text-white border-b-2 border-rose-500 font-semibold' : 'text-slate-400'
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`hover:text-white transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
                activeTab === 'schedule' ? 'text-white border-b-2 border-rose-500 font-semibold' : 'text-slate-400'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`hover:text-white transition-colors whitespace-nowrap cursor-pointer pb-0.5 flex items-center gap-1.5 ${
                activeTab === 'watchlist' ? 'text-white border-b-2 border-rose-500 font-semibold' : 'text-slate-400'
              }`}
            >
              <span>Watchlist</span>
              {watchlistCount > 0 && (
                <span className="text-xs text-rose-400 font-mono">({watchlistCount})</span>
              )}
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action + Quick search trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowSearchModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Search Anime Anime"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Search...</span>
            </button>

            <button
              onClick={onRandomAnime}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 rounded-lg transition-all shadow-md shadow-rose-600/25 whitespace-nowrap cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Random Anime</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around pt-3 mt-2 border-t border-slate-800/50 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('home')}
            className={`cursor-pointer ${activeTab === 'home' ? 'text-rose-500 font-semibold' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('hindi')}
            className={`cursor-pointer ${activeTab === 'hindi' ? 'text-rose-500 font-semibold' : ''}`}
          >
            Hindi Dub
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`cursor-pointer ${activeTab === 'explore' ? 'text-rose-500 font-semibold' : ''}`}
          >
            Anime
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`cursor-pointer ${activeTab === 'schedule' ? 'text-rose-500 font-semibold' : ''}`}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`cursor-pointer ${activeTab === 'watchlist' ? 'text-rose-500 font-semibold' : ''}`}
          >
            Watchlist ({watchlistCount})
          </button>
        </div>
      </header>

      {/* Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-semibold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-rose-500" /> Search anime
              </span>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Naruto, Solo Leveling, Death Note, Demon Slayer..."
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-semibold cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>
            <div className="mt-4 text-xs text-slate-400">
              <span className="text-slate-500">Popular Searches:</span>{' '}
              {['Solo Leveling', 'Jujutsu Kaisen', 'Naruto', 'Dragon Ball Z', 'One Piece'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setSearchQuery(item);
                    setActiveTab('explore');
                    setShowSearchModal(false);
                  }}
                  className="mx-1 text-slate-300 hover:text-rose-400 underline cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
