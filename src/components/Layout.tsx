import React, { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ContentHeader from './ContentHeader';
import { useTheme } from '../contexts/ThemeContext';
import { ActiveView, ActiveChapterContentInfo } from '../types'; 

interface LayoutProps {
  children: ReactNode; 
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onAddSubjectClick: () => void;
  currentStreak: number;
  overallProgressData: { 
    totalChapters: number;
    completedChapters: number;
    progress: number;
  };
  userName: string; 
  userStudyLevel: string; 
  onOpenSettingsModal: () => void;
  activeChapterContentInfo: ActiveChapterContentInfo | null; 
  onLogout: () => void; 
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeView,
  setActiveView,
  onAddSubjectClick,
  currentStreak,
  overallProgressData,
  userName, 
  userStudyLevel, 
  onOpenSettingsModal,
  activeChapterContentInfo, 
  onLogout, 
}) => {
  const { theme } = useTheme();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };
  
  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileSidebarOpen]);


  const mainContentBgClass = theme === 'light' ? 'bg-slate-100' : theme === 'dark' ? 'bg-slate-900' : 'bg-black'; 

  const showContentHeader = activeView === 'dashboard' || activeView === 'subjects' || activeView === 'personalNotes' || activeView === 'examPrep' || activeView === 'video';


  return (
    <div className="flex h-screen relative">
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300 ease-in-out"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        ></div>
      )}

      <Sidebar 
        onAddSubjectClick={onAddSubjectClick}
        currentStreak={currentStreak}
        isMobileSidebarOpen={isMobileSidebarOpen}
        toggleMobileSidebar={toggleMobileSidebar}
        activeView={activeView}
        setActiveView={setActiveView}
        userName={userName} 
        userStudyLevel={userStudyLevel}
        onOpenSettingsModal={onOpenSettingsModal}
        onLogout={onLogout} 
      />
      <div 
        className={`flex-1 flex flex-col overflow-y-auto ${mainContentBgClass} transition-colors duration-300 ease-in-out lg:ml-72`} 
      >
        {showContentHeader && (
          <ContentHeader
            activeView={activeView}
            overallProgress={activeView === 'subjects' ? overallProgressData.progress : undefined}
            totalChapters={activeView === 'subjects' ? overallProgressData.totalChapters : undefined}
            completedChapters={activeView === 'subjects' ? overallProgressData.completedChapters : undefined}
            toggleMobileSidebar={toggleMobileSidebar}
          />
        )}
        <main className={`flex-1 ${activeView === 'chapterContent' ? 'flex flex-col' : ''} relative`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;