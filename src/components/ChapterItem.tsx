import React, { useState } from 'react';
import { Chapter, ChapterStatus } from '../types';
import { CHAPTER_STATUS_OPTIONS, STATUS_STYLES_LIGHT, STATUS_STYLES_DARK } from '../constants';
import { TrashIcon, CheckCircleIcon, XCircleIcon, MinusCircleIcon, StarIcon, PencilSquareIcon, QuestionMarkCircleIcon, SparklesIcon, BookOpenIcon, PencilIcon } from './IconComponents';
import { useTheme } from '../contexts/ThemeContext';
import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';

interface ChapterItemProps {
  subjectId: string;
  subjectName: string; 
  chapter: Chapter;
  subjectColor: string;
  onUpdateStatus: (subjectId: string, chapterId: string, status: ChapterStatus) => void;
  onRequestDeleteChapter: (subjectId: string, chapterId: string, chapterName: string) => void;
  onOpenNotes: () => void; 
  onUpdateProficiency: (proficiency: number) => void; 
  onGenerateQuiz: (subjectId: string, chapterId: string, chapterName: string, subjectName: string) => void; 
  onAskQuestion: (subjectId: string, chapterId: string, chapterName: string, subjectName: string) => void;
  onNavigateToChapterContent: (subjectId: string, chapterId: string, subjectName: string, chapterName: string) => void;
}

const ChapterItem: React.FC<ChapterItemProps> = ({ 
    subjectId, 
    subjectName,
    chapter, 
    subjectColor, 
    onUpdateStatus, 
    onRequestDeleteChapter,
    onOpenNotes,
    onUpdateProficiency, 
    onGenerateQuiz,
    onAskQuestion,
    onNavigateToChapterContent,
}) => {
  const { theme } = useTheme();
  const statusStyles = theme === 'light' ? STATUS_STYLES_LIGHT : STATUS_STYLES_DARK;
  const currentStyle = statusStyles[chapter.status];
  const accentColorName = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[0] : DARK_ACCENT_COLOR.split('-')[0];
  const accentShade = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[1] || '500' : DARK_ACCENT_COLOR.split('-')[1] || '400';
  
  const chapterNameColorClass = theme === 'light' ? 'text-slate-800' : theme === 'dark' ? 'text-slate-100' : 'text-gray-200'; // Higher contrast for chapter name

  const getProficiencyText = (level?: number): string => {
    if (level === undefined || level === 0) return "Not Assessed";
    if (level === 1) return "Needs Revision";
    if (level === 2) return "Foundational";
    if (level === 3) return "Proficient";
    if (level === 4) return "Advanced";
    if (level === 5) return "Mastered";
    return "Not Assessed";
  };

  const StatusIcon = () => {
    switch(chapter.status) {
      case ChapterStatus.Completed: return <CheckCircleIcon className={`w-4 h-4 ${currentStyle.iconColor}`} />;
      case ChapterStatus.InProgress: return <MinusCircleIcon className={`w-4 h-4 ${currentStyle.iconColor}`} />;
      case ChapterStatus.NotStarted: return <XCircleIcon className={`w-4 h-4 ${currentStyle.iconColor}`} />;
      default: return null;
    }
  }
  
  const itemBgClass = theme === 'light' ? 'bg-white hover:bg-slate-50/70' : theme === 'dark' ? 'bg-slate-700/80 hover:bg-slate-700' : 'bg-gray-800/80 hover:bg-gray-800'; // Slightly adjusted alpha for dark
  const itemBorderClass = theme === 'light' ? 'border-slate-200' : theme === 'dark' ? 'border-slate-600' : 'border-gray-700'; // Softer border
  
  const utilityButtonBase = `p-2 rounded-lg transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus-visible:ring-2`;
  const utilityButtonColorClass = theme === 'light' 
    ? `text-slate-500 hover:text-${accentColorName}-${accentShade} focus-visible:text-${accentColorName}-${accentShade} hover:bg-${accentColorName}-100/70 focus-visible:bg-${accentColorName}-100/70 focus-visible:ring-${accentColorName}-${accentShade}` 
    : `text-slate-400 hover:text-${accentColorName}-${accentShade} focus-visible:text-${accentColorName}-${accentShade} hover:bg-${accentColorName}-500/20 focus-visible:bg-${accentColorName}-500/20 focus-visible:ring-${accentColorName}-${accentShade}`;
  
  const deleteButtonColorClass = theme === 'light' 
    ? `text-slate-500 hover:text-red-600 focus-visible:text-red-600 hover:bg-red-100/70 focus-visible:bg-red-100/70 focus-visible:ring-red-500` 
    : `text-slate-400 hover:text-red-400 focus-visible:text-red-400 hover:bg-red-500/20 focus-visible:bg-red-500/20 focus-visible:ring-red-400`;
  
  const actionButtonBase = `w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-all duration-200 ease-in-out hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 hover:scale-[1.02]`;
  const actionButtonOffsetClass = theme === 'light' ? 'focus-visible:ring-offset-white' : `focus-visible:ring-offset-slate-700/80`;

  const learnContentButtonBgClass = theme === 'light'
    ? `bg-sky-100 hover:bg-sky-200/80 text-sky-700 border border-sky-200 hover:border-sky-300`
    : `bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/50 hover:border-sky-500/70`;
  const learnContentButtonFocusRing = `focus-visible:ring-sky-500`;

  const notesActionButtonBgClass = theme === 'light'
    ? `bg-green-100 hover:bg-green-200/80 text-green-700 border border-green-200 hover:border-green-300`
    : `bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/50 hover:border-green-500/70`;
  const notesActionButtonFocusRing = `focus-visible:ring-green-500`;

  const askQuestionButtonBgClass = theme === 'light'
    ? `bg-teal-100 hover:bg-teal-200/80 text-teal-700 border border-teal-200 hover:border-teal-300`
    : `bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/50 hover:border-teal-500/70`;
  const askQuestionButtonFocusRing = `focus-visible:ring-teal-500`;
  
  const quizButtonBgClass = theme === 'light'
    ? `bg-purple-100 hover:bg-purple-200/80 text-purple-700 border border-purple-200 hover:border-purple-300`
    : `bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/50 hover:border-purple-500/70`;
  const quizButtonFocusRing = `focus-visible:ring-purple-500`;
  
  const selectRingClass = theme === 'light' ? `focus:ring-${accentColorName}-500 focus:border-${accentColorName}-500` : `focus:ring-${accentColorName}-400 focus:border-${accentColorName}-400`;
  const selectOptionBgClass = theme === 'light' ? 'bg-white text-slate-700' : 'bg-slate-700 text-slate-100'; // Ensure options are readable
  
  const proficiencyStarColor = theme === 'light' ? 'text-amber-400' : 'text-yellow-400'; // Consistent star color
  const proficiencyTextColorClass = theme === 'light' ? 'text-slate-600' : 'text-slate-300'; // Clearer proficiency text


  return (
    <li className={`flex flex-col gap-4 p-4 ${itemBgClass} rounded-xl border ${itemBorderClass} transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl hover:-translate-y-px`}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
           <p 
            className={`text-base font-semibold ${chapterNameColorClass} truncate mb-1 ${chapter.status === ChapterStatus.Completed ? `line-through ${theme === 'light' ? 'decoration-slate-400' : 'decoration-slate-500'} decoration-1` : ''}`} 
            title={chapter.name}
          >
            {chapter.name}
          </p>
           <div className="flex items-center gap-1.5" title={`Proficiency: ${getProficiencyText(chapter.proficiency)} (${chapter.proficiency}/5)`}>
            {[1, 2, 3, 4, 5].map(level => (
              <StarIcon 
                key={level}
                className={`w-3.5 h-3.5 ${level <= (chapter.proficiency || 0) ? proficiencyStarColor : (theme === 'light' ? 'text-slate-300' : 'text-slate-600') }`}
                filled={level <= (chapter.proficiency || 0)}
              />
            ))}
            <span className={`text-xs ${proficiencyTextColorClass} ml-0.5`}>{getProficiencyText(chapter.proficiency)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
            <button
                onClick={onOpenNotes}
                className={`${utilityButtonBase} ${utilityButtonColorClass}`}
                title="Edit Detailed Notes"
                aria-label={`Edit detailed notes for chapter ${chapter.name}`}
            >
                <PencilSquareIcon className="w-4 h-4" />
            </button>
            <button
                onClick={() => onRequestDeleteChapter(subjectId, chapter.id, chapter.name)}
                className={`${utilityButtonBase} ${deleteButtonColorClass}`}
                title="Delete Chapter"
                aria-label={`Delete chapter ${chapter.name}`}
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div className="relative w-full sm:max-w-[220px]"> {/* Increased max-width for status */}
          <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none`}>
          <StatusIcon />
        </div>
        <select
          value={chapter.status}
          onChange={(e) => onUpdateStatus(subjectId, chapter.id, e.target.value as ChapterStatus)}
          className={`w-full appearance-none ${currentStyle.bgColor} border ${currentStyle.borderColor} ${currentStyle.textColor} text-xs font-medium rounded-lg py-2.5 pl-9 pr-8 focus:outline-none focus:ring-2 ${selectRingClass} transition-colors duration-200 ease-in-out shadow-sm`}
          aria-label={`Status for chapter ${chapter.name}`}
        >
          {CHAPTER_STATUS_OPTIONS.map(status => (
            <option key={status} value={status} className={`${selectOptionBgClass} text-sm`}>
              {status}
            </option>
          ))}
        </select>
          <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 ${currentStyle.textColor}`}>
          <svg className="fill-current h-4 w-4 opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.043-.48 1.576 0L10 10.405l2.908-2.857c.533-.48 1.141-.446 1.574 0 .436.445.408 1.197 0 1.615-.406.418-4.695 4.502-4.695 4.502a1.095 1.095 0 0 1-1.576 0S5.922 9.581 5.516 9.163c-.409-.418-.436-1.17 0-1.615z"/></svg>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-3">
        <button
            onClick={() => onNavigateToChapterContent(subjectId, chapter.id, subjectName, chapter.name)}
            className={`${actionButtonBase} ${learnContentButtonBgClass} ${actionButtonOffsetClass} ${learnContentButtonFocusRing}`}
            aria-label={`Learn content for chapter ${chapter.name}`}
        >
            <BookOpenIcon className="w-4 h-4" />
            Learn
        </button>
         <button
            onClick={onOpenNotes}
            className={`${actionButtonBase} ${notesActionButtonBgClass} ${actionButtonOffsetClass} ${notesActionButtonFocusRing}`}
            aria-label={`Edit notes for chapter ${chapter.name}`}
        >
            <PencilIcon className="w-3.5 h-3.5" /> 
            Edit Notes
        </button>
        <button
            onClick={() => onAskQuestion(subjectId, chapter.id, chapter.name, subjectName)}
            className={`${actionButtonBase} ${askQuestionButtonBgClass} ${actionButtonOffsetClass} ${askQuestionButtonFocusRing}`}
            aria-label={`Ask a question about chapter ${chapter.name}`}
        >
            <QuestionMarkCircleIcon className="w-4 h-4" />
            Ask AI
        </button>
        <button
            onClick={() => onGenerateQuiz(subjectId, chapter.id, chapter.name, subjectName)}
            className={`${actionButtonBase} ${quizButtonBgClass} ${actionButtonOffsetClass} ${quizButtonFocusRing}`}
            aria-label={`Generate quiz for chapter ${chapter.name}`}
        >
            <SparklesIcon className="w-4 h-4" />
            Quiz Me
        </button>
      </div>
    </li>
  );
};

export default ChapterItem;