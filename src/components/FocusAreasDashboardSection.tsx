

import React from 'react';
import { FocusArea } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { LightbulbIcon, SparklesIcon, StarIcon } from './IconComponents'; 
import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';

interface FocusAreasDashboardSectionProps {
  focusAreas: FocusArea[];
  onGenerateQuiz: (subjectId: string, chapterId: string, chapterName: string, subjectName: string) => void;
}

const FocusAreasDashboardSection: React.FC<FocusAreasDashboardSectionProps> = ({ focusAreas, onGenerateQuiz }) => {
  const { theme } = useTheme();
  const accentColorName = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[0] : DARK_ACCENT_COLOR.split('-')[0];

  const sectionBgClass = theme === 'light' ? 'bg-slate-50' : 'bg-slate-800/50';
  const sectionBorderClass = theme === 'light' ? `border-slate-200` : `border-slate-700/60`; 
  const titleColorClass = theme === 'light' ? `text-${accentColorName}-600` : `text-${accentColorName}-400`;
  const textColorClass = theme === 'light' ? 'text-slate-600' : 'text-slate-300';
  const chapterNameColorClass = theme === 'light' ? 'text-slate-700' : 'text-slate-100';
  const subjectNameColorClass = theme === 'light' ? 'text-slate-500' : 'text-slate-400';

  const itemBgClass = theme === 'light' ? 'bg-white hover:bg-slate-50' : 'bg-slate-700 hover:bg-slate-600/70';
  const itemBorderClass = theme === 'light' ? 'border-slate-200/80' : 'border-slate-600/70';
  
  const quizButtonBgClass = `bg-gradient-to-r from-${accentColorName}-400 to-${accentColorName}-500 hover:from-${accentColorName}-500 hover:to-${accentColorName}-600`;
  const quizButtonTextColorClass = 'text-white';
  const quizButtonFocusRing = `focus-visible:ring-${accentColorName}-300`;
  
  const proficiencyStarColor = theme === 'light' ? `text-amber-400` : `text-amber-400`;


  if (!focusAreas || focusAreas.length === 0) {
    return null;
  }

  return (
    <section 
      aria-labelledby="focus-areas-title"
      className={`p-4 sm:p-5 rounded-2xl shadow-xl ${sectionBgClass} border ${sectionBorderClass} transition-colors duration-300 ease-in-out`}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <LightbulbIcon className={`w-6 h-6 ${titleColorClass}`} />
        <h2 id="focus-areas-title" className={`text-lg sm:text-xl font-semibold ${titleColorClass}`}>
          Strengthen These Areas
        </h2>
      </div>
      <p className={`text-xs sm:text-sm ${textColorClass} mb-5`}>
        Based on your progress, these chapters could use a little extra attention. A quick quiz might help!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {focusAreas.map(area => (
          <div 
            key={area.chapterId} 
            className={`${itemBgClass} p-4 rounded-xl border ${itemBorderClass} shadow-lg transition-all duration-200 ease-in-out flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5`}
          >
            <div>
              <h3 className={`text-base font-semibold ${chapterNameColorClass} truncate mb-0.5`} title={area.chapterName}>
                {area.chapterName}
              </h3>
              <p className={`text-xs ${subjectNameColorClass} mb-2`}>
                From: <span className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} font-medium`}>{area.subjectName}</span>
              </p>
              <div className="flex items-center gap-1 mb-3.5" title={`Current Proficiency: ${area.proficiency}/5`}>
                {[1, 2, 3, 4, 5].map(level => (
                  <StarIcon 
                    key={level}
                    className={`w-4 h-4 ${level <= area.proficiency ? proficiencyStarColor : (theme === 'light' ? 'text-slate-300' : 'text-slate-500') }`}
                    filled={level <= area.proficiency}
                  />
                ))}
                 <span className={`text-xs font-medium ${subjectNameColorClass} ml-1`}>({area.proficiency}/5)</span>
              </div>
            </div>
            <button
              onClick={() => onGenerateQuiz(area.subjectId, area.chapterId, area.chapterName, area.subjectName)}
              className={`w-full mt-auto flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold ${quizButtonBgClass} ${quizButtonTextColorClass} rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${quizButtonFocusRing} ${theme === 'light' ? 'focus-visible:ring-offset-white' : `focus-visible:ring-offset-slate-700`} hover:scale-[1.03]`}
              aria-label={`Take quiz for ${area.chapterName}`}
            >
              <SparklesIcon className="w-4 h-4" />
              Practice Quiz
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FocusAreasDashboardSection;