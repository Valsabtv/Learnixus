
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { StoicQuote } from '../utils/stoicQuotes';
import StudyStrategiesSection from '../components/StudyStrategiesSection';
import { StudyStrategy } from '../types';

interface DashboardProps {
  dailyQuote: StoicQuote | null;
  userName: string;
  studyStrategies: StudyStrategy[];
  strategiesLoading: boolean;
  onOpenStrategyDetailModal: (strategy: StudyStrategy) => void;
  lightAccentName: string;
  lightAccentShade: string;
  darkAccentName: string;
  darkAccentShade: string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  dailyQuote, 
  userName, 
  studyStrategies, 
  strategiesLoading, 
  onOpenStrategyDetailModal,
  lightAccentName,
  lightAccentShade,
  darkAccentName,
  darkAccentShade
}) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      {dailyQuote && (
        <section
          aria-labelledby="daily-motivation-title"
          className={`p-5 sm:p-6 rounded-2xl shadow-xl hover:shadow-2xl ${theme === 'light' ? 'bg-white' : 'bg-slate-800'} border-l-4 ${theme === 'light' ? `border-${lightAccentName}-${lightAccentShade}` : `border-${darkAccentName}-${darkAccentShade}`} transition-all duration-300 ease-in-out hover:scale-[1.015]`}>
          <h2 id="daily-motivation-title" className="sr-only">Daily Wisdom for {userName || 'Learner'}</h2>
          <blockquote className="text-center sm:text-left">
            <p className={`text-lg sm:text-xl italic ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'} leading-relaxed`}>"{dailyQuote.text}"</p>
            <footer className={`mt-3 text-sm font-semibold tracking-wide ${theme === 'light' ? `text-${lightAccentName}-600` : `text-${darkAccentName}-400`}`}>— {dailyQuote.author}</footer>
          </blockquote>
        </section>
      )}
      <StudyStrategiesSection
        strategies={studyStrategies}
        isLoading={strategiesLoading}
        onOpenStrategyDetail={onOpenStrategyDetailModal}
      />
    </div>
  );
};

export default Dashboard;
