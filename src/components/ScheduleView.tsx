import React, { useState } from 'react';
import { Calendar, Clock, Play, Volume2 } from 'lucide-react';
import { Anime } from '../types/anime';
import { SCHEDULE_DAYS, CURATED_ANIME } from '../data/curatedAnime';

interface ScheduleViewProps {
  onPlay: (anime: Anime) => void;
  onViewDetails: (anime: Anime) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onPlay, onViewDetails }) => {
  const [activeDay, setActiveDay] = useState(SCHEDULE_DAYS[0].day);

  const currentDayData = SCHEDULE_DAYS.find((d) => d.day === activeDay) || SCHEDULE_DAYS[0];

  // Map anime names to anime items
  const dayAnimeList = CURATED_ANIME.filter((a) => {
    return currentDayData.animes.some(
      (name) =>
        a.title.toLowerCase().includes(name.toLowerCase()) ||
        (a.titleEnglish && a.titleEnglish.toLowerCase().includes(name.toLowerCase()))
    );
  });

  return (
    <section className="py-10 px-4 sm:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Calendar className="w-4 h-4" /> Weekly Simulcast & Airing Calendar
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Anime Release Schedule (Hindi Dub & Sub)
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Track when new episodes and Hindi dub releases drop throughout the week.
        </p>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 mb-8 scrollbar-none">
        {SCHEDULE_DAYS.map((dayObj) => {
          const isActive = dayObj.day === activeDay;
          return (
            <button
              key={dayObj.day}
              onClick={() => setActiveDay(dayObj.day)}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex flex-col items-start ${
                isActive
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{dayObj.day}</span>
              <span className={`text-[10px] font-normal ${isActive ? 'text-rose-100' : 'text-slate-500'}`}>
                {dayObj.dayHindi}
              </span>
            </button>
          );
        })}
      </div>

      {/* Schedule Items for Active Day */}
      <div className="space-y-4">
        {dayAnimeList.length > 0 ? (
          dayAnimeList.map((anime, idx) => (
            <div
              key={anime.id}
              className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
            >
              {/* Left Info */}
              <div className="flex items-center gap-4">
                <img
                  src={anime.image}
                  alt={anime.title}
                  referrerPolicy="no-referrer"
                  className="w-14 h-20 object-cover rounded-lg shrink-0 border border-slate-800"
                />
                <div>
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-medium mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Air Time: {(idx * 2 + 18) % 24}:30 IST (Indian Standard Time)</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-emerald-400">Hindi Dub Simulcast</span>
                  </div>
                  <h3
                    onClick={() => onViewDetails(anime)}
                    className="text-base font-bold text-white hover:text-rose-400 cursor-pointer transition-colors"
                  >
                    {anime.titleEnglish || anime.title}
                  </h3>
                  {anime.titleHindi && (
                    <p className="text-xs text-amber-300/80 mt-0.5">{anime.titleHindi}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                    <span>{anime.type}</span>
                    <span aria-hidden="true">·</span>
                    <span>Score: {anime.score.toFixed(1)} ★</span>
                    <span aria-hidden="true">·</span>
                    <span>Studio: {anime.studios.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Right Action */}
              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
                <button
                  onClick={() => onViewDetails(anime)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Episode Guide
                </button>
                <button
                  onClick={() => onPlay(anime)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white rounded-lg transition-colors shadow-md shadow-rose-600/20 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Free</span>
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
            New episodes for this day are processing. Check back shortly!
          </div>
        )}
      </div>

    </section>
  );
};
