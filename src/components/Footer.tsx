import React from 'react';
import { Volume2, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onSelectGenre: (genre: string) => void;
  onNavigateTab: (tab: 'home' | 'hindi' | 'explore' | 'schedule' | 'watchlist') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectGenre, onNavigateTab }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#07090e] text-slate-400 py-12 px-4 sm:px-8 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        
        {/* Brand Column */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center font-black text-white text-xs">
              AH
            </div>
            <span className="text-lg font-extrabold text-white tracking-tight">
              Ani<span className="text-rose-500">Hindi</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Anime discovery with searchable metadata, episode guides, trailers, a local watchlist, and transparent viewing options.
          </p>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Metadata-first · Evidence-based labels</span>
          </div>
        </div>

        {/* Navigation Column */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Quick Navigation
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => onNavigateTab('home')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Home Showcase
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateTab('hindi')}
                className="hover:text-amber-400 transition-colors cursor-pointer text-amber-300/90 font-medium"
              >
                Verified Hindi Audio
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateTab('explore')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Explore Anime
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateTab('schedule')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Weekly Airing Schedule
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigateTab('watchlist')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                My Watchlist & History
              </button>
            </li>
          </ul>
        </div>

        {/* Popular Genres */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Top Anime Genres
          </h4>
          <ul className="space-y-2 text-xs">
            {['Action', 'Shounen', 'Fantasy', 'Adventure', 'Supernatural', 'Comedy'].map((g) => (
              <li key={g}>
                <button
                  onClick={() => {
                    onSelectGenre(g);
                    onNavigateTab('explore');
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {g} Anime in Hindi
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer Column */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Disclaimer & Rights
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
            AniHindi is an anime discovery catalogue. Metadata and episode listings are provided for reference; no episode stream is inferred from catalogue IDs. Playback is available only for sources that have been reviewed for rights, territory, free/ad-free terms, and audio language. All anime trademarks and characters belong to their respective owners.
          </p>
          <div className="text-[11px] text-slate-500">
            Support official anime releases on Crunchyroll, Muse Asia, and licensed broadcast partners.
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div>
          © {new Date().getFullYear()} AniHindi. Built for anime fans worldwide.
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span>Anime metadata</span>
          <span aria-hidden="true">·</span>
          <span>Verified audio only</span>
          <span aria-hidden="true">·</span>
          <span>Rights-reviewed playback</span>
        </div>
      </div>
    </footer>
  );
};
