

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';
import { LightbulbIcon, SparklesIcon } from './IconComponents';
import { StudyStrategy } from '../types';

interface StudyStrategiesSectionProps {
  strategies: StudyStrategy[];
  isLoading: boolean;
  onOpenStrategyDetail: (strategy: StudyStrategy) => void; 
}

const StudyStrategiesSection: React.FC<StudyStrategiesSectionProps> = ({ strategies, isLoading, onOpenStrategyDetail }) => {
  const { theme } = useTheme();
  const accentColorName = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[0] : DARK_ACCENT_COLOR.split('-')[0];

  const sectionBgClass = theme === 'light' ? 'bg-white' : theme === 'dark' ? 'bg-slate-800' : 'bg-gray-900';
  const sectionBorderClass = theme === 'light' ? 'border-slate-200/90' : theme === 'dark' ? 'border-slate-700/70' : 'border-gray-800/70';
  const titleColorClass = theme === 'light' ? `text-${accentColorName}-600` : `text-${accentColorName}-400`;
  const textColorClass = theme === 'light' ? 'text-slate-600' : theme === 'dark' ? 'text-slate-300' : 'text-gray-400';
  const cardBgClass = theme === 'light' ? 'bg-slate-50' : theme === 'dark' ? 'bg-slate-700/60' : 'bg-gray-800/60';
  const cardBorderClass = theme === 'light' ? `border-slate-200` : theme === 'dark' ? `border-slate-600/70` : `border-gray-700/70`;
  const cardHoverBgClass = theme === 'light' ? `hover:bg-${accentColorName}-50 hover:border-${accentColorName}-300` : `hover:bg-${accentColorName}-700/40 hover:border-${accentColorName}-500/80`;


  if (isLoading) {
    return (
      <section className={`p-5 sm:p-6 rounded-2xl shadow-xl ${sectionBgClass} border ${sectionBorderClass} transition-colors duration-300 ease-in-out`}>
        <div className="flex items-center gap-3 mb-5">
          <LightbulbIcon className={`w-7 h-7 ${titleColorClass}`} />
          <h2 className={`text-xl sm:text-2xl font-semibold ${titleColorClass}`}>AI Study Tips</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-10 min-h-[150px]">
          <SparklesIcon className={`w-10 h-10 ${titleColorClass} animate-pulse`} />
          <p className={`${textColorClass} ml-3 text-lg mt-3`}>Fetching smart strategies for you...</p>
        </div>
      </section>
    );
  }
  
  if (!strategies || strategies.length === 0) {
    return null; 
  }

  return (
    <section className={`p-5 sm:p-6 rounded-2xl shadow-xl ${sectionBgClass} border ${sectionBorderClass} transition-colors duration-300 ease-in-out`}>
      <div className="flex items-center gap-3 mb-5">
        <LightbulbIcon className={`w-7 h-7 ${titleColorClass}`} />
        <h2 className={`text-xl sm:text-2xl font-semibold ${titleColorClass}`}>Personalized Study Strategies</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {strategies.map((strategy) => (
          <button
            key={strategy.id} 
            onClick={() => onOpenStrategyDetail(strategy)}
            className={`text-left p-4 rounded-xl ${cardBgClass} border ${cardBorderClass} shadow-lg hover:shadow-xl ${cardHoverBgClass} transition-all duration-300 ease-in-out hover:scale-[1.03] focus:outline-none focus:ring-2 ${theme === 'light' ? `focus:ring-${accentColorName}-500` : `focus:ring-${accentColorName}-400`} focus:ring-offset-2 ${theme === 'light' ? `focus:ring-offset-white` : `focus:ring-offset-slate-800`} h-full flex flex-col`}
            aria-label={`View details for strategy: ${strategy.text.substring(0,50)}...`}
          >
            <SparklesIcon className={`w-5 h-5 mb-2 flex-shrink-0 ${theme === 'light' ? `text-${accentColorName}-500` : `text-${accentColorName}-400`}`} />
            <p className={`${textColorClass} text-sm leading-relaxed flex-grow`}>{strategy.text}</p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default StudyStrategiesSection;