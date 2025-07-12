import React from 'react';
import { APP_NAME, LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';
import { BookOpenIcon, PlusIcon, FireIcon, XIcon, LayoutDashboardIcon, DocumentTextIcon, Cog6ToothIcon, ClipboardDocumentCheckIcon, ArrowRightStartOnRectangleIcon } from './IconComponents'; 
import { useTheme } from '../contexts/ThemeContext';
import { ActiveView } from '../types'; 


interface SidebarProps {
  onAddSubjectClick: () => void;
  currentStreak: number;
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  userName: string; 
  userStudyLevel: string; 
  onOpenSettingsModal: () => void;
  onLogout: () => void; 
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onAddSubjectClick, 
  currentStreak, 
  isMobileSidebarOpen, 
  toggleMobileSidebar,
  activeView,
  setActiveView,
  userName, 
  userStudyLevel,
  onOpenSettingsModal,
  onLogout, 
}) => {
  const { theme } = useTheme(); 

  const accentColorName = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[0] : DARK_ACCENT_COLOR.split('-')[0];
  const accentShade = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[1] || '500' : DARK_ACCENT_COLOR.split('-')[1] || '400';

  const sidebarBgClass = theme === 'light' ? 'bg-slate-50/80 backdrop-blur-lg' : theme === 'dark' ? 'bg-slate-800/80 backdrop-blur-lg' : 'bg-gray-900/80 backdrop-blur-lg'; // Softer light bg
  const borderColorClass = theme === 'light' ? 'border-slate-200/80' : theme === 'dark' ? 'border-slate-700/60' : 'border-gray-800/60';
  const appNameMainColorClass = theme === 'light' ? 'text-slate-800' : 'text-slate-100'; // App name primary color
  const appNameAccentColorClass = theme === 'light' ? `text-${accentColorName}-${accentShade}` : `text-${accentColorName}-${accentShade}`;
  const iconColorClass = theme === 'light' ? `text-${accentColorName}-${accentShade}` : `text-${accentColorName}-${accentShade}`;
  
  const addSubjectButtonBgClass = `bg-gradient-to-r from-${accentColorName}-${accentShade} to-${accentColorName}-${parseInt(accentShade) + 100} hover:from-${accentColorName}-${parseInt(accentShade) + 100} hover:to-${accentColorName}-${parseInt(accentShade) + 200}`;
  const addSubjectButtonTextColorClass = 'text-white';
  const addSubjectButtonFocusRing = `focus-visible:ring-${accentColorName}-${parseInt(accentShade) - 100 < 100 ? 100 : parseInt(accentShade) - 100}`;

  const navItemBaseClass = "flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 ease-in-out text-sm font-medium w-full group"; // Adjusted padding
  const navItemDefaultText = theme === 'light' ? 'text-slate-600' : theme === 'dark' ? 'text-slate-300' : 'text-gray-400';
  const navItemDefaultHover = theme === 'light' ? 'hover:bg-slate-200/70 hover:text-slate-800' : theme === 'dark' ? 'hover:bg-slate-700 hover:text-slate-100' : 'hover:bg-gray-800 hover:text-gray-200';
  const navItemDefaultClass = `${navItemDefaultText} ${navItemDefaultHover}`;
  
  const navItemActiveText = theme === 'light' ? `text-${accentColorName}-${parseInt(accentShade) + 100 > 900 ? 900 : parseInt(accentShade) + 100}` : `text-${accentColorName}-${accentShade}`;
  const navItemActiveBg = theme === 'light' ? `bg-${accentColorName}-100` : theme === 'dark' ? `bg-${accentColorName}-500/20` : `bg-${accentColorName}-500/20`;
  const navItemActiveClass = `${navItemActiveBg} ${navItemActiveText} font-semibold shadow-sm`;
  
  const streakBgClass = theme === 'light' ? 'bg-amber-100/80 border-amber-200/80' : theme === 'dark' ? 'bg-amber-500/15 border-amber-500/30' : 'bg-amber-500/10 border-amber-500/20';
  const streakTextColorClass = theme === 'light' ? 'text-amber-700' : 'text-amber-300';
  
  const userInfoBgClass = theme === 'light' ? 'bg-slate-100/80' : theme === 'dark' ? 'bg-slate-700/40' : 'bg-gray-800/40';
  const userInfoPrimaryTextClass = theme === 'light' ? 'text-slate-700' : 'text-slate-200';
  const userInfoSecondaryTextClass = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  
  const settingsButtonBgClass = theme === 'light' ? 'bg-slate-200/80 hover:bg-slate-300/90' : theme === 'dark' ? 'bg-slate-600/70 hover:bg-slate-600' : 'bg-gray-800/80 hover:bg-gray-700';
  const settingsButtonTextClass = theme === 'light' ? 'text-slate-700' : 'text-slate-200';
  const settingsButtonFocusRing = theme === 'light' ? `focus-visible:ring-${accentColorName}-500` : `focus-visible:ring-${accentColorName}-400`;

  const closeButtonColorClass = theme === 'light' ? 'text-slate-500 hover:text-slate-700' : theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-200';
  const closeButtonHoverBgClass = theme === 'light' ? 'hover:bg-slate-200/80' : theme === 'dark' ? 'hover:bg-slate-700/60' : 'hover:bg-gray-800/60';

  const logoutButtonBgClass = theme === 'light' ? 'bg-rose-100/80 hover:bg-rose-200/90 text-rose-600' : 'bg-rose-700/40 hover:bg-rose-700/60 text-rose-300';
  const logoutButtonFocusRing = `focus-visible:ring-rose-500`;


  const handleViewChange = (view: ActiveView) => {
    setActiveView(view);
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && isMobileSidebarOpen) {
      toggleMobileSidebar();
    }
  };

  const handleLogoutClick = () => {
    onLogout();
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && isMobileSidebarOpen) {
        toggleMobileSidebar(); 
    }
  }

  const NavButton: React.FC<{view: ActiveView, label: string, Icon: React.FC<any>}> = ({view, label, Icon}) => (
     <button 
        onClick={() => handleViewChange(view)}
        className={`${navItemBaseClass} ${activeView === view ? navItemActiveClass : navItemDefaultClass}`}
        aria-current={activeView === view ? 'page' : undefined}
    >
        <Icon className={`w-5 h-5 flex-shrink-0 ${activeView === view ? (navItemActiveText) : (theme === 'light' ? 'text-slate-500 group-hover:text-slate-700' : 'text-slate-400 group-hover:text-slate-200')}`} />
        {label}
    </button>
  );

  return (
    <aside 
        className={`
            ${sidebarBgClass} border-r ${borderColorClass} 
            flex flex-col p-4 sm:p-5 transition-transform duration-300 ease-in-out
            fixed top-0 left-0 h-full w-72 z-50 shadow-xl 
            lg:translate-x-0 
            ${isMobileSidebarOpen ? 'translate-x-0 ' : '-translate-x-full'}
        `}
        aria-hidden={!isMobileSidebarOpen && typeof window !== 'undefined' && window.innerWidth < 1024}
    >
      <div className="flex items-center justify-between mb-6 pt-1 pb-3 border-b ${borderColorClass}">
        <div className="flex items-center gap-2.5">
            <BookOpenIcon className={`w-9 h-9 ${iconColorClass}`} />
            <h1 className={`text-2xl font-bold ${appNameMainColorClass}`}>
            Learn<span className={`${appNameAccentColorClass} font-extrabold`}>ixus</span>
            </h1>
        </div>
        <button 
            onClick={toggleMobileSidebar} 
            className={`lg:hidden p-1.5 rounded-lg ${closeButtonColorClass} ${closeButtonHoverBgClass} transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 ${theme === 'light' ? `focus-visible:ring-${accentColorName}-${accentShade}` : `focus-visible:ring-${accentColorName}-${accentShade}`} hover:scale-105`}
            aria-label="Close sidebar"
        >
            <XIcon className="w-5 h-5" />
        </button>
      </div>

      <button
        onClick={() => {
            onAddSubjectClick(); 
            if (typeof window !== 'undefined' && window.innerWidth < 1024 && isMobileSidebarOpen) { 
                toggleMobileSidebar();
            }
        }}
        className={`w-full ${addSubjectButtonBgClass} ${addSubjectButtonTextColorClass} font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out flex items-center justify-center gap-2 text-sm focus:outline-none focus-visible:ring-2 ${addSubjectButtonFocusRing} focus-visible:ring-offset-2 ${theme === 'light' ? `focus-visible:ring-offset-slate-50` : `focus-visible:ring-offset-slate-800`} hover:scale-[1.02] hover:-translate-y-px mb-6`}
      >
        <PlusIcon className="w-5 h-5" />
        Create New Subject
      </button>

      <nav className="space-y-1.5 flex-grow"> {/* Slightly reduced spacing for nav items */}
        <NavButton view="dashboard" label="Dashboard" Icon={LayoutDashboardIcon} />
        <NavButton view="subjects" label="My Learning" Icon={BookOpenIcon} />
        <NavButton view="examPrep" label="Exam Prep Hub" Icon={ClipboardDocumentCheckIcon} />
        <NavButton view="personalNotes" label="Personal Notes" Icon={DocumentTextIcon} />
        <NavButton view="video" label="Focus Mode" Icon={FireIcon} />
      </nav>
      
      <div className={`p-3.5 rounded-xl ${userInfoBgClass} mb-4 border ${borderColorClass}`}>
        <p className={`text-sm font-semibold ${userInfoPrimaryTextClass} mb-0.5 truncate`} title={userName || 'Learner'}>{userName || 'Learner'}</p>
         <p className={`text-xs ${userInfoSecondaryTextClass} truncate`} title={userStudyLevel || 'General Learner'}>{userStudyLevel || 'General Learner'}</p>
      </div>

      {currentStreak > 0 && (
        <div className={`flex items-center gap-2.5 ${streakTextColorClass} ${streakBgClass} px-3.5 py-2.5 rounded-lg mb-4 text-sm shadow-inner border ${borderColorClass}`}>
          <FireIcon className="w-4 h-4" />
          <span className="font-semibold">{currentStreak} day{currentStreak > 1 ? 's' : ''} streak! Keep it up!</span>
        </div>
      )}

      <div className="space-y-2 pt-4 border-t ${borderColorClass}">
        <button
            onClick={() => {
                onOpenSettingsModal();
                if (typeof window !== 'undefined' && window.innerWidth < 1024 && isMobileSidebarOpen) {
                    toggleMobileSidebar(); 
                }
            }}
            className={`w-full p-2.5 rounded-lg ${settingsButtonTextClass} ${settingsButtonBgClass} transition-all duration-200 ease-in-out flex items-center justify-center gap-2 text-sm font-medium shadow-sm focus:outline-none focus-visible:ring-2 ${settingsButtonFocusRing} focus-visible:ring-offset-1 ${theme === 'light' ? `focus-visible:ring-offset-slate-50` : `focus-visible:ring-offset-slate-800`} hover:scale-[1.02]`}
            aria-label="Open application settings"
        >
            <Cog6ToothIcon className="w-4 h-4" />
            Settings
        </button>
        <button
            onClick={handleLogoutClick}
            className={`w-full p-2.5 rounded-lg ${logoutButtonBgClass} transition-all duration-200 ease-in-out flex items-center justify-center gap-2 text-sm font-medium shadow-sm focus:outline-none focus-visible:ring-2 ${logoutButtonFocusRing} focus-visible:ring-offset-1 ${theme === 'light' ? `focus-visible:ring-offset-slate-50` : `focus-visible:ring-offset-slate-800`} hover:scale-[1.02]`}
            aria-label="Logout"
        >
            <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
            Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;