
import React from 'react';
import FocusAreasDashboardSection from '../components/FocusAreasDashboardSection';
import SubjectList from '../components/SubjectList';
import { FocusArea, Subject, ChapterStatus } from '../types';

interface SubjectsProps {
  focusAreasData: FocusArea[];
  handleGenerateQuiz: (subjectId: string, chapterId: string, chapterName: string, subjectName: string, numQuestions?: number) => void;
  subjects: Subject[];
  openAddChapterModal: (subjectId: string, subjectName: string) => void;
  handleUpdateChapterStatus: (subjectId: string, chapterId: string, status: ChapterStatus) => void;
  requestDeleteChapter: (subjectId: string, chapterId: string, chapterName: string) => void;
  requestDeleteSubject: (subjectId: string, subjectName: string) => void;
  handleOpenChapterNotesModal: (subjectId: string, chapterId: string, chapterName: string, currentNotes: string) => void;
  handleUpdateChapterProficiency: (subjectId: string, chapterId: string, proficiency: number) => void;
  handleOpenAskQuestionModal: (subjectId: string, chapterId: string, chapterName: string, subjectName: string) => void;
  handleNavigateToChapterContent: (subjectId: string, chapterId: string, subjectName: string, chapterName: string) => void;
  openAddSubjectModal: () => void;
}

const Subjects: React.FC<SubjectsProps> = ({ 
  focusAreasData, 
  handleGenerateQuiz, 
  subjects, 
  openAddChapterModal, 
  handleUpdateChapterStatus, 
  requestDeleteChapter, 
  requestDeleteSubject, 
  handleOpenChapterNotesModal, 
  handleUpdateChapterProficiency, 
  handleOpenAskQuestionModal, 
  handleNavigateToChapterContent, 
  openAddSubjectModal 
}) => {
  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      {focusAreasData && focusAreasData.length > 0 && (
        <FocusAreasDashboardSection
          focusAreas={focusAreasData}
          onGenerateQuiz={handleGenerateQuiz}
        />
      )}
      <SubjectList
        subjects={subjects}
        onAddChapterClick={(subjectId, subjectName) => openAddChapterModal(subjectId, subjectName)}
        onUpdateChapterStatus={handleUpdateChapterStatus}
        onRequestDeleteChapter={requestDeleteChapter}
        onRequestDeleteSubject={requestDeleteSubject}
        onOpenChapterNotes={handleOpenChapterNotesModal}
        onUpdateChapterProficiency={handleUpdateChapterProficiency}
        onGenerateQuiz={(sId, chId, chName, subjName) => handleGenerateQuiz(sId, chId, chName, subjName)}
        onAskQuestion={handleOpenAskQuestionModal}
        onNavigateToChapterContent={handleNavigateToChapterContent}
        onAddSubjectFromEmptyState={openAddSubjectModal}
      />
    </div>
  );
};

export default Subjects;
