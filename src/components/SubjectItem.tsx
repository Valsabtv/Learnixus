import React, { useState, useMemo } from 'react';
import { Subject, ChapterStatus } from '../types';
import ChapterItem from './ChapterItem';
import ProgressBar from './ProgressBar';
import { PlusIcon, TrashIcon, ChevronDownIcon } from './IconComponents';
import { useTheme } from '../contexts/ThemeContext';
import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';

interface SubjectItemProps {
  subject: Subject;
  onAddChapterClick: (subjectId: string, subjectName: string) => void; 
  onUpdateChapterStatus: (subjectId: string, chapterId: string, status: ChapterStatus) => void;
  onRequestDeleteChapter: (subjectId: string, chapterId: string, chapterName: string) => void;
  onRequestDeleteSubject: (subjectId: string, subjectName: string) => void;
  onOpenChapterNotes: (subjectId: string, chapterId: string, chapterName: string, currentNotes: string) => void;
  onUpdateChapterProficiency: (subjectId: string, chapterId: string, proficiency: number) => void;
  onGenerateQuiz: (subjectId: string, chapterId: string, chapterName: string, subjectName: string) => void; 
  onAskQuestion: (subjectId: string, chapterId: string, chapterName: string, subjectName: string) => void; 
  onNavigateToChapterContent: (subjectId: string, chapterId: string, subjectName: string, chapterName: string) => void;
}

const getInteractionStatus = (lastInteractedDate: string | null): { text: string, colorClass: string, dotColorClass: string } => {
  if (!lastInteractedDate) {
    return { text: 'No interaction yet', colorClass: 'text-slate-100/80 dark:text-slate-200/70', dotColorClass: 'bg-slate-100/60 dark:bg-slate-200/50' };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const lastDate = new Date(lastInteractedDate);
  lastDate.setHours(0,0,0,0); 

  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { text: 'Active Today', colorClass: 'text-green-200 dark:text-green-300', dotColorClass: 'bg-green-300 dark:bg-green-400' };
  } else if (diffDays === 1) {
    return { text: 'Active Yesterday', colorClass: 'text-green-200 dark:text-green-300', dotColorClass: 'bg-green-300 dark:bg-green-400' };
  } else if (diffDays < 7) {
    return { text: `Active ${diffDays} days ago`, colorClass: 'text-yellow-200 dark:text-yellow-300', dotColorClass: 'bg-yellow-300 dark:bg-yellow-400' };
  } else {
    return { text: `Last active ${diffDays} days ago`, colorClass: 'text-red-300 dark:text-red-300', dotColorClass: 'bg-red-300 dark:bg-red-400' };
  }
};


const SubjectItem: React.FC<SubjectItemProps> = ({
  subject,
  onAddChapterClick,
  onUpdateChapterStatus,
  onRequestDeleteChapter,
  onRequestDeleteSubject,
  onOpenChapterNotes,
  onUpdateChapterProficiency,
  onGenerateQuiz, 
  onAskQuestion,
  onNavigateToChapterContent,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { theme } = useTheme();

  const { progress, completedChapters, totalChapters } = useMemo(() => {
    if (subject.chapters.length === 0) {
      return { progress: 0, completedChapters: 0, totalChapters: 0 };
    }
    const completed = subject.chapters.filter(ch => ch.status === ChapterStatus.Completed).length;
    const total = subject.chapters.length;
    return {
      progress: total > 0 ? (completed / total) * 100 : 0,
      completedChapters: completed,
      totalChapters: total
    };
  }, [subject.chapters]);

  const interactionStatus = useMemo(() => getInteractionStatus(subject.lastInteractedDate), [subject.lastInteractedDate]);

  const accentColorName = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[0] : DARK_ACCENT_COLOR.split('-')[0];
  const accentShade = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[1] || '500' : DARK_ACCENT_COLOR.split('-')[1] || '400';

  const cardBgClass = theme === 'light' ? 'bg-white' : 'bg-slate-800'; 
  const cardBorderClass = theme === 'light' ? 'border-slate-200' : 'border-slate-700'; // Softer border
  const contentBgClass = theme === 'light' ? 'bg-slate-50' : 'bg-slate-800/60'; // Adjusted for dark theme consistency
  
  const titleColorClass = 'text-white'; 
  const subtextColorClass = 'text-slate-100/90 dark:text-slate-200/80'; // Improved contrast for subtext on header
  const emptyChapterTextColorClass = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  
  const addChapterButtonBgClass = `bg-gradient-to-r from-${accentColorName}-${accentShade} to-${accentColorName}-${parseInt(accentShade) + 100} hover:from-${accentColorName}-${parseInt(accentShade) + 100} hover:to-${accentColorName}-${parseInt(accentShade) + 200}`;
  const addChapterButtonTextColorClass = 'text-white';
  const addChapterButtonFocusRing = `focus-visible:ring-${accentColorName}-${parseInt(accentShade) - 100 < 100 ? 100 : parseInt(accentShade) - 100}`;


  const chevronColorClass = 'text-slate-100/80 group-hover:text-white';
  const deleteSubjectButtonColorClass = 'text-slate-100/80 hover:text-red-100 focus-visible:text-red-100 hover:bg-red-500/60 focus-visible:bg-red-500/60';

  const subjectColorBase = subject.color.replace('bg-', '').split('-')[0]; 
  const subjectColorShade = subject.color.replace('bg-', '').split('-')[1] || '500';
  const gradientFromClass = `from-${subjectColorBase}-${subjectColorShade}`; 
  const gradientToClass = `to-${subjectColorBase}-${parseInt(subjectColorShade) + 200 > 900 ? 900 : parseInt(subjectColorShade) + 200}`;   

  return (
    <div className={`${cardBgClass} rounded-2xl shadow-xl border ${cardBorderClass} overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl`}>
      <header 
        className={`group p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer transition-all duration-300 ease-in-out bg-gradient-to-br ${gradientFromClass} ${gradientToClass} hover:brightness-105`}
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`subject-content-${subject.id}`}
      >
        <div className="flex-1 min-w-0">
          <h2 className={`text-xl sm:text-2xl font-semibold ${titleColorClass} truncate`} title={subject.name}>{subject.name}</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${interactionStatus.dotColorClass} flex-shrink-0 shadow-sm`}></div>
            <p className={`text-xs font-medium ${interactionStatus.colorClass}`}>
              {interactionStatus.text}
            </p>
          </div>
          <p className={`text-xs ${subtextColorClass} mt-1 font-medium`}>
            {totalChapters > 0 ? `${completedChapters} of ${totalChapters} chapters complete` : "No chapters yet"}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          {totalChapters > 0 && (
            <div className="w-24 xs:w-28 sm:w-32">
              <ProgressBar progress={progress} customColorClass="bg-white/90" customTrackColorClass="bg-white/40" height="h-1.5" />
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onRequestDeleteSubject(subject.id, subject.name); }}
            className={`p-2 ${deleteSubjectButtonColorClass} transition-all duration-200 ease-in-out rounded-lg hover:scale-110 focus:outline-none focus-visible:ring-1 focus-visible:ring-red-200`}
            title="Delete Subject"
            aria-label={`Delete subject ${subject.name}`}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
          <ChevronDownIcon className={`w-5 h-5 ${chevronColorClass} transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </header>

      <div
        id={`subject-content-${subject.id}`}
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className={`min-h-0 overflow-hidden transition-colors duration-300 ease-in-out ${contentBgClass}`}>
          <div className={`p-5 sm:p-6 ${isExpanded ? `border-t ${cardBorderClass}` : 'border-t border-transparent'}`}>
            <div className="flex justify-end mb-5">
              <button
                onClick={() => onAddChapterClick(subject.id, subject.name)}
                className={`${addChapterButtonBgClass} ${addChapterButtonTextColorClass} font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out flex items-center justify-center gap-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme === 'light' ? `focus-visible:ring-offset-slate-50 ${addChapterButtonFocusRing}` : `focus-visible:ring-offset-slate-800/60 ${addChapterButtonFocusRing}`} hover:scale-[1.03] hover:-translate-y-px`}
              >
                <PlusIcon className="w-4 h-4" />
                Add New Chapter
              </button>
            </div>
            {subject.chapters.length > 0 ? (
              <ul className="space-y-4"> 
                {subject.chapters.map(chapter => (
                  <ChapterItem
                    key={chapter.id}
                    subjectId={subject.id}
                    subjectName={subject.name} 
                    chapter={chapter}
                    subjectColor={subject.color}
                    onUpdateStatus={onUpdateChapterStatus}
                    onRequestDeleteChapter={onRequestDeleteChapter}
                    onOpenNotes={() => onOpenChapterNotes(subject.id, chapter.id, chapter.name, chapter.notes || '')}
                    onUpdateProficiency={(proficiency) => onUpdateChapterProficiency(subject.id, chapter.id, proficiency)}
                    onGenerateQuiz={onGenerateQuiz} 
                    onAskQuestion={onAskQuestion}
                    onNavigateToChapterContent={onNavigateToChapterContent}
                  />
                ))}
              </ul>
            ) : (
              <div className={`text-center py-10 px-4 rounded-xl ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700/60'}`}>
                <img src="/logo_learnixus_192.png" alt="Learnixus logo" className="w-16 h-16 mx-auto mb-4 opacity-60"/>
                <p className={`text-base font-semibold ${emptyChapterTextColorClass}`}>This subject is beautifully empty.</p>
                <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'} mt-1.5`}>Add your first chapter to chart your learning journey!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectItem;