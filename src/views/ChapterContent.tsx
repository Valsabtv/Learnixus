
import React from 'react';
import ChapterContentView from '../components/ChapterContentView';
import { useTheme } from '../contexts/ThemeContext';
import { GoogleGenAI } from '@google/genai';

interface ChapterContentProps {
  activeChapterContentInfo: {
    subjectName: string;
    chapterName: string;
    subjectId: string;
    chapterId: string;
  };
  userStudyLevel: string;
  userName: string;
  ai: GoogleGenAI | null;
  handleCloseChapterContentView: () => void;
  lightAccentName: string;
  lightAccentShade: string;
  darkAccentName: string;
  darkAccentShade: string;
}

const ChapterContent: React.FC<ChapterContentProps> = ({ 
  activeChapterContentInfo, 
  userStudyLevel, 
  userName, 
  ai, 
  handleCloseChapterContentView,
  lightAccentName,
  lightAccentShade,
  darkAccentName,
  darkAccentShade
}) => {
  const { theme } = useTheme();

  if (ai) {
    return (
      <ChapterContentView
        subjectName={activeChapterContentInfo.subjectName}
        chapterName={activeChapterContentInfo.chapterName}
        userStudyLevel={userStudyLevel}
        userName={userName}
        ai={ai}
        onClose={handleCloseChapterContentView}
      />
    );
  } else {
    return (
      <div className="p-6 sm:p-8 text-center">
        <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-200'} text-lg`}>
          AI features for chapter content generation are currently unavailable.
        </p>
        <button
          onClick={handleCloseChapterContentView}
          className={`mt-4 py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all ${theme === 'light' ? `bg-${lightAccentName}-500 hover:bg-${lightAccentName}-600 text-white` : `bg-${darkAccentName}-500 hover:bg-${darkAccentName}-600 text-white`}`}>
          Back to My Learning
        </button>
      </div>
    );
  }
};

export default ChapterContent;
