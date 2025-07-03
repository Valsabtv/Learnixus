import React from 'react';
import ProgressBar from './ProgressBar';
import { useTheme } from '../contexts/ThemeContext';
import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';
import { LayoutDashboardIcon, MenuIcon, DocumentTextIcon, ClipboardDocumentCheckIcon, BookOpenIcon } from './IconComponents'; 
import { ActiveView } from '../types';


interface ContentHeaderProps {
  activeView: ActiveView; 
  overallProgress?: number; 
  totalChapters?: number;   
  completedChapters?: number; 
  toggleMobileSidebar: () => void;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({ 
  activeView, 
  overallProgress, 
  totalChapters, 
  completedChapters, 
  toggleMobileSidebar 
}) => {
  const { theme } = useTheme();

  const accentColorName = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[0] : DARK_ACCENT_COLOR.split('-')[0];
  const accentShade = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[1] || '500' : DARK_ACCENT_COLOR.split('-')[1] || '400';

  const headerBgClass = theme === 'light' ? 'bg-white/80 backdrop-blur-md' : 'bg-slate-800/80 backdrop-blur-md'; // Increased blur
  const borderColorClass = theme === 'light' ? 'border-slate-200' : 'border-slate-700'; // Softer border
  const titleColorClass = theme === 'light' ? 'text-slate-800' : 'text-slate-100'; // Stronger title contrast
  const iconColorClass = theme === 'light' ? `text-${accentColorName}-${accentShade}` : `text-${accentColorName}-${accentShade}`;
  const menuButtonColorClass = theme === 'light' ? `text-slate-600 hover:text-${accentColorName}-${accentShade}` : `text-slate-400 hover:text-${accentColorName}-${accentShade}`;
  const progressTextColorClass = theme === 'light' ? 'text-slate-600' : 'text-slate-300'; // Good contrast for progress text
  const progressValueColorClass = theme === 'light' ? `text-${accentColorName}-700 font-semibold` : `text-${accentColorName}-${parseInt(accentShade) -100 > 0 ? parseInt(accentShade) -100 : 100 } font-semibold`; // Adjusted dark theme progress value

  const getTitleAndIcon = () => {
    switch (activeView) {
      case 'dashboard':
        return { title: 'Dashboard', Icon: LayoutDashboardIcon };
      case 'subjects':
        return { title: 'My Learning Hub', Icon: BookOpenIcon }; 
      case 'personalNotes': 
        return { title: 'Personal Notes', Icon: DocumentTextIcon}; 
      case 'examPrep':
        return { title: 'Exam Prep Central', Icon: ClipboardDocumentCheckIcon };
      default:
        return { title: 'Learnixus', Icon: LayoutDashboardIcon };
    }
  };

  const { title, Icon } = getTitleAndIcon();
  
  const showProgress = activeView === 'subjects' && typeof totalChapters === 'number' && totalChapters > 0;

  return (
    <div className={`p-4 sm:p-5 sticky top-0 ${headerBgClass} border-b ${borderColorClass} z-30 transition-colors duration-300 ease-in-out shadow-sm`}> {/* Softer shadow */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleMobileSidebar} 
            className={`lg:hidden p-2 -ml-2 rounded-full ${menuButtonColorClass} transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 ${theme === 'light' ? `focus-visible:ring-${accentColorName}-${accentShade}` : `focus-visible:ring-${accentColorName}-${accentShade}`} hover:bg-slate-100 dark:hover:bg-slate-700/60 transform`}
            aria-label="Open sidebar menu"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          <Icon className={`hidden sm:block w-6 h-6 ${iconColorClass}`} />
          <h2 className={`text-xl sm:text-2xl font-semibold ${titleColorClass}`}>{title}</h2>
        </div>
        
        {showProgress && typeof overallProgress === 'number' && typeof completedChapters === 'number' && (
          <div className="mt-2 sm:mt-0 w-full sm:w-auto max-w-xs sm:max-w-sm">
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className={`font-medium ${progressTextColorClass}`}>Overall Progress</span>
              <span className={`${progressValueColorClass}`}>{`${completedChapters} / ${totalChapters} Chapters`}</span>
            </div>
            <ProgressBar progress={overallProgress} height="h-2" />
          </div>
        )}
      </div>
      
       {activeView === 'subjects' && typeof totalChapters === 'number' && totalChapters === 0 && !showProgress && (
         <p className={`text-sm ${progressTextColorClass} mt-2 text-center sm:text-left`}>Start by adding subjects and chapters to see your learning progress here.</p>
      )}
    </div>
  );
};

export default ContentHeader;