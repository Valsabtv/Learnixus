import React from 'react';
import { Subject, ChapterStatus } from '../types';
import SubjectItem from './SubjectItem';
import { useTheme } from '../contexts/ThemeContext';
import { FolderPlusIcon } from './IconComponents'; 
import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';

interface SubjectListProps {
  subjects: Subject[];
  onAddChapterClick: (subjectId: string, subjectName: string) => void; 
  onUpdateChapterStatus: (subjectId: string, chapterId: string, status: ChapterStatus) => void;
  onRequestDeleteChapter: (subjectId: string, chapterId: string, chapterName: string) => void; 
  onRequestDeleteSubject: (subjectId: string, subjectName: string) => void; 
  onOpenChapterNotes: (subjectId: string, chapterId: string, chapterName: string, currentNotes: string) => void;
  onUpdateChapterProficiency: (subjectId: string, chapterId: string, proficiency: number) => void;
  onGenerateQuiz: (subjectId: string, chapterId: string, chapterName: string, subjectName: string) => void; 
  onAskQuestion: (subjectId: string, chapterId: string, chapterName: string, subjectName: string) => void; 
  onNavigateToChapterContent: (subjectId: string, chapterId: string, subjectName: string, chapterName: string) => void; 
  onAddSubjectFromEmptyState?: () => void;
}

const SubjectList: React.FC<SubjectListProps> = ({
  subjects,
  onAddChapterClick,
  onUpdateChapterStatus,
  onRequestDeleteChapter, 
  onRequestDeleteSubject, 
  onOpenChapterNotes,
  onUpdateChapterProficiency,
  onGenerateQuiz, 
  onAskQuestion, 
  onNavigateToChapterContent, 
  onAddSubjectFromEmptyState,
}) => {
  const { theme } = useTheme();
  const accentColorName = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[0] : DARK_ACCENT_COLOR.split('-')[0];
  const accentShade = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[1] || '500' : DARK_ACCENT_COLOR.split('-')[1] || '400';


  if (subjects.length === 0) {
    const iconColorClass = theme === 'light' ? `text-${accentColorName}-${accentShade}` : `text-${accentColorName}-${accentShade}`;
    const headingColorClass = theme === 'light' ? 'text-slate-800' : 'text-slate-100'; // Improved contrast
    const textColorClass = theme === 'light' ? 'text-slate-600' : 'text-slate-300';   // Improved contrast
    const containerBgClass = theme === 'light' ? 'bg-white' : 'bg-slate-800';
    const containerBorderClass = theme === 'light' ? 'border-slate-300' : 'border-slate-700';
    
    const clickableClasses = onAddSubjectFromEmptyState 
      ? `cursor-pointer hover:bg-opacity-90 dark:hover:bg-opacity-95 transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-xl ${theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-700/70'}`
      : '';

    return (
      <div 
        className={`text-center py-20 sm:py-24 md:py-28 px-6 ${containerBgClass} rounded-2xl border-2 ${containerBorderClass} border-dashed shadow-lg flex flex-col items-center ${clickableClasses} group`}
        onClick={onAddSubjectFromEmptyState}
        role={onAddSubjectFromEmptyState ? "button" : undefined}
        tabIndex={onAddSubjectFromEmptyState ? 0 : undefined}
        onKeyPress={onAddSubjectFromEmptyState ? (e) => (e.key === 'Enter' || e.key === ' ') && onAddSubjectFromEmptyState() : undefined}
        aria-label={onAddSubjectFromEmptyState ? "Create your first subject" : undefined}
      >
        <FolderPlusIcon className={`w-20 h-20 sm:w-24 sm:h-24 ${iconColorClass} opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-300 mb-6`} />
        <h3 className={`text-2xl sm:text-3xl font-semibold ${headingColorClass} mb-3`}>Your Learning Journey Starts Here</h3>
        <p className={`text-base ${textColorClass} max-w-lg mx-auto mb-1`}>
          Ready to conquer new topics? Add your first subject to organize chapters, track progress, and unlock your potential.
        </p>
         <p className={`mt-4 text-sm font-medium ${theme === 'light' ? `text-${accentColorName}-600` : `text-${accentColorName}-400`} group-hover:underline`}>
            {onAddSubjectFromEmptyState ? "Click here or use the sidebar to Create Your First Subject" : "Use the sidebar to add a new subject"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8"> {/* Consistent generous spacing */}
      {subjects.map(subject => (
        <SubjectItem
          key={subject.id}
          subject={subject}
          onAddChapterClick={onAddChapterClick} 
          onUpdateChapterStatus={onUpdateChapterStatus}
          onRequestDeleteChapter={onRequestDeleteChapter} 
          onRequestDeleteSubject={onRequestDeleteSubject} 
          onOpenChapterNotes={onOpenChapterNotes}
          onUpdateChapterProficiency={onUpdateChapterProficiency}
          onGenerateQuiz={onGenerateQuiz} 
          onAskQuestion={onAskQuestion} 
          onNavigateToChapterContent={onNavigateToChapterContent} 
        />
      ))}
    </div>
  );
};

export default SubjectList;