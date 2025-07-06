import React, { useState, useMemo, useCallback, useEffect } from 'react';
import useStreakTracker from './hooks/useStreakTracker';
import { Subject, Chapter, ChapterStatus, QuizQuestion, FocusArea, StudyStrategy, ActiveView, ActiveChapterContentInfo, ExamPreparationInfo, ExamActivity, FeelingAIResponse, EasyChapterSuggestion } from './types';
import { SUBJECT_COLORS, APP_NAME, LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR, OTHER_COLLEGE_PLACEHOLDER, NIRF_COLLEGES_INDIA_TOP_50, STUDY_LEVEL_OPTIONS, POPULAR_INDIAN_EXAMS,} from './constants';
import SubjectList from './components/SubjectList';
import Modal from './components/Modal';
import AddSubjectForm from './components/AddSubjectForm';
import AddChapterForm from './components/AddChapterForm';
import OpeningPage from './components/OpeningPage';
import Layout from './components/Layout'; 
import { useTheme } from './contexts/ThemeContext';
import { STOIC_QUOTES, StoicQuote } from './utils/stoicQuotes';
import PersonalNotesView from './components/PersonalNotesView';
import ChapterNotesModal from './components/ChapterNotesModal';
import ConfirmationModal from './components/ConfirmationModal';
import QuizModal from './components/QuizModal'; 
import PomodoroTimer from './components/PomodoroTimer'; 
import StudyStrategiesSection from './components/StudyStrategiesSection'; 
import FocusAreasDashboardSection from './components/FocusAreasDashboardSection'; 
import InitialSetupPage from './components/InitialSetupPage';
import { SettingsModal } from './components/SettingsModal';
import ChapterContentView from './components/ChapterContentView'; 
import AskQuestionModal from './components/AskQuestionModal'; 
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import GlobalNotificationDisplay from './components/GlobalNotificationDisplay'; 
import { useNotification } from './contexts/NotificationContext'; 
import ExamPrepView from './components/ExamPrepView'; 
import LoginPage from './components/LoginPage';
import FeelingCheckModal from './components/FeelingCheckModal';
import FarewellPopup from './components/FarewellPopup';
import { supabase } from '../supabaseClient'; // Adjust path if needed
import VideoPlayer from './components/VideoPlayer';
import useUserData from './hooks/useUserData';
import { BookOpenIcon } from './components/IconComponents';


interface ConfirmationModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmButtonText?: string;
  isDestructive?: boolean;
}

interface ActiveQuizData {
  subjectId: string;
  chapterId: string;
  chapterName: string;
  subjectName: string;
  userStudyLevel: string;
  questions: QuizQuestion[];
}

interface ActiveChapterForQuestion {
  subjectId: string;
  chapterId: string;
  chapterName: string;
  subjectName: string;
}

const getTodayDateString = (): string => new Date().toISOString().split('T')[0];


const App: React.FC = () => {
  const [subjects, setSubjects] = useUserData<Subject[]>('learnixus-subjects', []);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);
  const [currentSubjectIdForChapter, setCurrentSubjectIdForChapter] = useState<string | null>(null);
  const [currentSubjectNameForChapter, setCurrentSubjectNameForChapter] = useState<string | null>(null);

  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [hasCompletedInitialSetup, setHasCompletedInitialSetup] = useState(false);
  const [userStudyLevel, setUserStudyLevel] = useUserData<string>('learnixus-userStudyLevel', '');
  const [selectedCollege, setSelectedCollege] = useUserData<string>('learnixus-selectedCollege', '');
  const [userName, setUserName] = useUserData<string>('learnixus-userName', '');
  const [examPreparationInfo, setExamPreparationInfo] = useUserData<ExamPreparationInfo | null>('learnixus-examPrepInfo', null);
  const [examActivities, setExamActivities] = useUserData<ExamActivity[]>('learnixus-examActivities', []);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [showOpeningPage, setShowOpeningPage] = useState(true);
  const [appContentVisible, setAppContentVisible] = useState(false);
  const { currentStreak, checkAndProcessStreak } = useStreakTracker();
  const { theme } = useTheme();
  const { addNotification } = useNotification(); 
  const [dailyQuote, setDailyQuote] = useState<StoicQuote | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard'); 
  const [globalNotes, setGlobalNotes] = useUserData<string>('learnixus-globalNotes', '');
  
  const [isChapterNotesModalOpen, setIsChapterNotesModalOpen] = useState(false);
  const [editingChapterInfo, setEditingChapterInfo] = useState<{subjectId: string, chapterId: string, chapterName: string, currentNotes: string} | null>(null);

  const [confirmationModalConfig, setConfirmationModalConfig] = useState<ConfirmationModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [activeQuizData, setActiveQuizData] = useState<ActiveQuizData | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  
  const [studyStrategies, setStudyStrategies] = useUserData<StudyStrategy[]>('learnixus-studyStrategies', []);
  const [strategiesLoading, setStrategiesLoading] = useState<boolean>(false);
  const [isStrategyDetailModalOpen, setIsStrategyDetailModalOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<StudyStrategy | null>(null);

  const [activeChapterContentInfo, setActiveChapterContentInfo] = useState<ActiveChapterContentInfo | null>(null);

  const [isAskQuestionModalOpen, setIsAskQuestionModalOpen] = useState(false);
  const [activeChapterForQuestion, setActiveChapterForQuestion] = useState<ActiveChapterForQuestion | null>(null);

  const [isFeelingCheckModalOpen, setIsFeelingCheckModalOpen] = useState(false);
  const [lastFeelingCheckDate, setLastFeelingCheckDate] = useUserData<string | null>('learnixus-lastFeelingCheckDate', null);
  const [showFarewellPopup, setShowFarewellPopup] = useState(false);


  const ai = useMemo(() => {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
        return null; 
    }
    try {
      return new GoogleGenAI({ apiKey });
    } catch (e) {
      console.error("Error initializing GoogleGenAI client:", e);
      return null;
    }
  }, []);

  const updateSubjectInteraction = useCallback((subjectId: string) => {
    setSubjects(prevSubjects =>
      prevSubjects.map(s =>
        s.id === subjectId ? { ...s, lastInteractedDate: getTodayDateString() } : s
      )
    );
  }, [setSubjects]);

  const handleOpeningPageExited = useCallback(() => {
    setShowOpeningPage(false);
  }, []); 

  useEffect(() => {
    if (isAuthenticated && hasCompletedInitialSetup && !showOpeningPage && !appContentVisible) {
      checkAndProcessStreak();
      setTimeout(() => setAppContentVisible(true), 50); 
    }
  }, [isAuthenticated, hasCompletedInitialSetup, showOpeningPage, appContentVisible, checkAndProcessStreak]);
  
  useEffect(() => {
    if (isAuthenticated && hasCompletedInitialSetup && !showOpeningPage && appContentVisible) {
        const todayStr = getTodayDateString();
        if (lastFeelingCheckDate !== todayStr && ai) { 
            setIsFeelingCheckModalOpen(true);
        }

        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 0);
        const diff = now.getTime() - startOfYear.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        setDailyQuote(STOIC_QUOTES[dayOfYear % STOIC_QUOTES.length]);
    }
  }, [isAuthenticated, hasCompletedInitialSetup, showOpeningPage, appContentVisible, lastFeelingCheckDate, ai]);

  const fetchStudyStrategies = useCallback(async () => {
    const hasDefaultStrategies = studyStrategies.length > 0 && studyStrategies[0]?.id.startsWith('default-');

    if (!ai) {
        if (!hasDefaultStrategies) {
            setStudyStrategies([
              {id: 'default-1', text: `${userName || 'Learner'}, AI features are currently unavailable. Try the Feynman Technique: explain a concept in simple terms.`},
              {id: 'default-2', text: `${userName || 'Learner'}, AI features are currently unavailable. Use active recall: regularly test yourself.`},
              {id: 'default-3', text: `${userName || 'Learner'}, AI features are currently unavailable. Practice spaced repetition: review material at intervals.`}
            ]);
        }
        setStrategiesLoading(false);
        return;
    }

    if (studyStrategies.length > 0 && !hasDefaultStrategies && !strategiesLoading) {
        return;
    }

    setStrategiesLoading(true);
    try {
      let studyContextDescription = `a student at the study level: "${userStudyLevel || 'general student'}"`;
      if (userStudyLevel === STUDY_LEVEL_OPTIONS.find(opt => opt.includes('College/University'))) {
        if (selectedCollege && selectedCollege !== OTHER_COLLEGE_PLACEHOLDER && NIRF_COLLEGES_INDIA_TOP_50.includes(selectedCollege)) {
          studyContextDescription = `a student at ${selectedCollege}, a top-ranked Indian university (NIRF)`;
        } else if (selectedCollege && selectedCollege === OTHER_COLLEGE_PLACEHOLDER) {
          studyContextDescription = `a student at a college/university in India (details specified as 'Other / Not in top list')`;
        } else if (selectedCollege) { 
          studyContextDescription = `a student at ${selectedCollege}`;
        } else {
          studyContextDescription = `a student at the College/University (Higher Education) level in India`;
        }
      }

      let examContext = "";
      if (examPreparationInfo && examPreparationInfo.goalType !== 'none') {
        if (examPreparationInfo.goalType === 'general_final_exams') {
          examContext = ` They are preparing for general final exams described as: "${examPreparationInfo.customExamName || 'their school/college finals'}".`;
        } else if (examPreparationInfo.goalType === 'specific_competitive_exam') {
          const examDetails = POPULAR_INDIAN_EXAMS.find(ex => ex.key === examPreparationInfo.specificExamKey);
          if (examDetails) {
            examContext = ` They are specifically preparing for the ${examDetails.name}.`;
            if (examDetails.key === 'other_competitive' && examPreparationInfo.customExamName) {
              examContext = ` They are specifically preparing for: "${examPreparationInfo.customExamName}".`;
            }
          } else if (examPreparationInfo.customExamName) { 
             examContext = ` They are specifically preparing for: "${examPreparationInfo.customExamName}".`;
          }
        }
      }


      const prompt = `You are an academic advisor AI.\nGenerate 3 unique, concise, and actionable study strategies for ${userName || 'Student'}, who is ${studyContextDescription}.${examContext}\nEach strategy should be 1-2 sentences long, directly addressing the student by name (e.g., "${userName || 'Learner'}, try...").\nReturn the output as a JSON array of strings.\nExample: ["${userName || 'Learner'}, try the Feynman Technique by explaining concepts in simple terms.", "To boost memory, ${userName || 'Student'}, use active recall by testing yourself regularly.", "${userName || 'Learner'}, practice spaced repetition by reviewing material at increasing intervals." ]`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      let rawText = response.text;
      if (rawText) {
        let jsonStr = rawText.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }
        const parsedStrategies: string[] = JSON.parse(jsonStr);
        if (Array.isArray(parsedStrategies) && parsedStrategies.every(s => typeof s === 'string')) {
          setStudyStrategies(parsedStrategies.map(text => ({ id: crypto.randomUUID(), text })));
        } else {
          throw new Error("Parsed JSON is not an array of strings for strategies.");
        }
      }
    } catch (err) {
      console.error("Error fetching study strategies:", err);
      let defaultStrategyText = `${userName || 'Learner'}, try the Feynman Technique: explain a concept in simple terms as if teaching it to someone else.`;
      if (err instanceof Error && (err.message.includes("API key not valid") || err.message.includes("API_KEY_INVALID"))) {
        defaultStrategyText = `${userName || 'Learner'}, AI features are currently unavailable. You can still try the Feynman Technique.`;
         addNotification("Could not fetch AI study strategies: API key issue.", 'warning');
      } else {
         addNotification("Could not fetch AI study strategies. Using defaults.", 'warning');
      }
      setStudyStrategies([
          {id: 'default-1', text: defaultStrategyText},
          {id: 'default-2', text: `${userName || 'Learner'}, use active recall: regularly test yourself on material without looking at your notes.`},
          {id: 'default-3', text: `${userName || 'Learner'}, practice spaced repetition: review material at increasing intervals over time.`}
      ]);
    } finally {
      setStrategiesLoading(false);
    }
  }, [ai, studyStrategies, setStudyStrategies, userStudyLevel, userName, selectedCollege, examPreparationInfo, strategiesLoading, addNotification]);


  useEffect(() => {
    if (isAuthenticated && hasCompletedInitialSetup && !showOpeningPage && appContentVisible) {
      fetchStudyStrategies();
    }
  }, [isAuthenticated, hasCompletedInitialSetup, showOpeningPage, appContentVisible, fetchStudyStrategies]);

  const handleOpenStrategyDetailModal = useCallback((strategy: StudyStrategy) => {
    setSelectedStrategy(strategy);
    setIsStrategyDetailModalOpen(true);
  }, []);
  const handleCloseStrategyDetailModal = useCallback(() => {
    setIsStrategyDetailModalOpen(false);
    setSelectedStrategy(null);
  }, []);

  const handleAddSubject = useCallback((name: string) => {
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name,
      chapters: [],
      color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length],
      lastInteractedDate: getTodayDateString(),
    };
    setSubjects(prev => [...prev, newSubject]);
    setActiveView('subjects'); 
    addNotification(`Subject "${name}" created successfully!`, 'success');
  }, [setSubjects, subjects.length, addNotification]);

  const handleAddChapter = useCallback((subjectId: string, chapterName: string) => {
    const newChapter: Chapter = {
      id: crypto.randomUUID(),
      name: chapterName,
      status: ChapterStatus.NotStarted,
      notes: '', 
      proficiency: 0, 
    };
    setSubjects(prevSubjects =>
      prevSubjects.map(subject => 
        subject.id === subjectId 
          ? { ...subject, chapters: [...subject.chapters, newChapter], lastInteractedDate: getTodayDateString() } 
          : subject
      )
    );
    addNotification(`Chapter "${chapterName}" added!`, 'success');
  }, [setSubjects, addNotification]);

  const handleNavigateToChapterContent = useCallback((subjectId: string, chapterId: string, subjectName: string, chapterNameParam: string) => {
    if (!ai) {
        addNotification("AI features for content viewing are currently unavailable.", 'warning');
        return;
    }
    setActiveChapterContentInfo({
        subjectName,
        chapterName: chapterNameParam,
        subjectId,
        chapterId,
    });
    setActiveView('chapterContent');
    updateSubjectInteraction(subjectId);

    const activity: ExamActivity = {
        id: crypto.randomUUID(),
        date: getTodayDateString(),
        timestamp: Date.now(),
        type: 'chapter_content_viewed',
        description: `Started learning chapter: "${chapterNameParam}" from "${subjectName}".`,
        details: { subjectName, chapterName: chapterNameParam }
    };
    setExamActivities(prev => [...prev, activity]);
    addNotification(`Exploring chapter: ${chapterNameParam}. Happy learning!`, 'info');

  }, [ai, addNotification, setExamActivities, updateSubjectInteraction]);

  const handleCloseChapterContentView = useCallback(() => {
    setActiveChapterContentInfo(null);
    setActiveView('subjects'); 
  }, []);


  const handleUpdateChapterStatus = useCallback((subjectId: string, chapterId: string, status: ChapterStatus) => {
    let chapterName = '';
    let subjectName = '';

    setSubjects(prevSubjects =>
      prevSubjects.map(subject => {
        if (subject.id === subjectId) {
          subjectName = subject.name;
          const updatedChapters = subject.chapters.map(chapter => {
            if (chapter.id === chapterId) {
              chapterName = chapter.name;
              return { ...chapter, status };
            }
            return chapter;
          });
          return { ...subject, chapters: updatedChapters, lastInteractedDate: getTodayDateString() };
        }
        return subject;
      })
    );
     addNotification(`Status of "${chapterName}" updated to ${status}.`, 'info');

    if (status === ChapterStatus.Completed && chapterName && subjectName) {
      const newActivity: ExamActivity = {
        id: crypto.randomUUID(),
        date: getTodayDateString(),
        timestamp: Date.now(),
        type: 'chapter_completed',
        description: `Completed chapter: "${chapterName}" from "${subjectName}".`,
        details: { subjectName, chapterName }
      };
      setExamActivities(prevActivities => [...prevActivities, newActivity]);
      addNotification(`Chapter "${chapterName}" marked complete & logged!`, 'success');
    }
  }, [setSubjects, setExamActivities, addNotification]);
  
  const requestDeleteChapter = useCallback((subjectId: string, chapterId: string, chapterName: string) => {
    setConfirmationModalConfig({
      isOpen: true,
      title: 'Delete Chapter',
      message: `Are you sure you want to delete the chapter "${chapterName}"? This action cannot be undone and all associated data will be lost.`,
      onConfirm: () => {
        setSubjects(prevSubjects =>
          prevSubjects.map(subject =>
            subject.id === subjectId
              ? { ...subject, chapters: subject.chapters.filter(ch => ch.id !== chapterId), lastInteractedDate: getTodayDateString() } : subject
          )
        );
         addNotification(`Chapter "${chapterName}" has been deleted.`, 'info');
      },
      confirmButtonText: 'Yes, Delete Chapter',
      isDestructive: true,
    });
  }, [setSubjects, addNotification]);

  const requestDeleteSubject = useCallback((subjectId: string, subjectName: string) => {
     setConfirmationModalConfig({
      isOpen: true,
      title: 'Delete Subject',
      message: `Are you sure you want to delete the subject "${subjectName}" and all its chapters? This is permanent and cannot be undone.`,
      onConfirm: () => {
         setSubjects(prevSubjects => prevSubjects.filter(subject => subject.id !== subjectId));
         addNotification(`Subject "${subjectName}" and all its chapters deleted.`, 'info');
      },
      confirmButtonText: 'Yes, Delete Subject',
      isDestructive: true,
    });
  }, [setSubjects, addNotification]);

  const handleOpenChapterNotesModal = useCallback((subjectId: string, chapterId: string, chapterName: string, currentNotes: string) => {
    setEditingChapterInfo({ subjectId, chapterId, chapterName, currentNotes });
    setIsChapterNotesModalOpen(true);
    updateSubjectInteraction(subjectId);
  }, [updateSubjectInteraction]);

  const handleCloseChapterNotesModal = useCallback(() => {
    setIsChapterNotesModalOpen(false);
    setEditingChapterInfo(null);
  }, []);

  const handleSaveChapterNotes = useCallback((subjectId: string, chapterId: string, newNotes: string) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? {
        ...s,
        chapters: s.chapters.map(c => c.id === chapterId ? {...c, notes: newNotes} : c),
        lastInteractedDate: getTodayDateString()
    } : s));
    handleCloseChapterNotesModal();
    addNotification('Chapter notes successfully saved!', 'success');
  }, [setSubjects, handleCloseChapterNotesModal, addNotification]);
  
  const handleUpdateChapterProficiency = useCallback((subjectId: string, chapterId: string, proficiency: number) => {
    setSubjects(prevSubjects =>
      prevSubjects.map(subject =>
        subject.id === subjectId
          ? {
              ...subject,
              chapters: subject.chapters.map(chapter =>
                chapter.id === chapterId ? { ...chapter, proficiency: Math.max(0, Math.min(5, proficiency)) } : chapter
              ),
              lastInteractedDate: getTodayDateString()
            }
          : subject
      )
    );
  }, [setSubjects]);

  const handleGenerateQuiz = useCallback(async (subjectId: string, chapterId: string, chapterName: string, subjectName: string, numQuestions?: number) => {
    if (!ai) {
        setQuizError("AI features are currently unavailable (AI client not initialized). Please check API Key setup.");
        setIsQuizModalOpen(true);
        setQuizLoading(false);
        setActiveQuizData({ subjectId, chapterId, chapterName, subjectName, userStudyLevel: userStudyLevel || "General", questions: [] });
        addNotification("Quiz generation failed: AI client not available.", 'error');
        return;
    }
    if (!userStudyLevel) {
      setQuizError("Please set your study level in settings before generating a quiz.");
      setIsQuizModalOpen(true);
      setQuizLoading(false);
      setActiveQuizData({ subjectId, chapterId, chapterName, subjectName, userStudyLevel: userStudyLevel || "General", questions: [] });
      addNotification("Please set your study level in settings to generate a quiz.", 'warning');
      return;
    }
    
    if (!numQuestions) {
      setActiveQuizData({ subjectId, chapterId, chapterName, subjectName, userStudyLevel, questions: [] });
      setQuizLoading(false);
      setQuizError(null);
      setIsQuizModalOpen(true);
      return;
    }

    setIsQuizModalOpen(true);
    setQuizLoading(true);
    setActiveQuizData({ subjectId, chapterId, chapterName, subjectName, userStudyLevel, questions: [] }); 
    setQuizError(null);
    updateSubjectInteraction(subjectId);

    try {
      const prompt = `
        You are a quiz generation assistant for a student named ${userName || 'there'}.
        Based on the chapter titled "${chapterName}" from the subject "${subjectName}",
        and considering the student is at a "${userStudyLevel}" level,
        generate ${numQuestions} distinct questions.
        The questions should start relatively easy for the "${userStudyLevel}" level and progressively increase in difficulty, while all remaining appropriate for this study level.
        
        Formatting Instructions for Questions:
        - **General**: Ensure all generated content, especially questions involving structures or multi-line elements, is formatted with appropriate line breaks (using '\\n') to be easily readable when displayed.
        - **Mathematical Matrices**: Represent matrices using clearly separated rows. Use line breaks ('\\n') for new rows. For example, a 2x2 matrix like [[a, b], [c, d]] should be formatted in the question string as:
          "[a, b]\\n[c, d]" or "a b\\nc d"
          Ensure elements within a row are adequately spaced.
        - **Chemical Compounds**: For organic compounds or complex structures, use common linear notations (like simplified structural representations where appropriate, e.g., CH3-CH2-OH for ethanol) or ensure that multi-part formulas are presented with clear spacing and line breaks if it aids readability. Avoid cramming complex structures into a single line. For example, a longer chain or a simple displayed formula should use line breaks.
        
        For each question, provide a concise, correct answer.
        Return the output as a JSON array, where each element is an object with two keys: "question" (string, formatted as per above) and "answer" (string).
        Ensure the entire response is ONLY the JSON array string, nothing before or after.
        Example: [{"question": "What is the capital of France?", "answer": "Paris."}, {"question": "Solve for x: 2x + 3 = 7", "answer": "x = 2"}, {"question": "Represent the following matrix:\\n[1, 2; 3, 4]", "answer": "A 2x2 matrix with 1 and 2 in the first row, and 3 and 4 in the second row."}]
        If the chapter title is too vague or general to generate specific, meaningful questions according to these instructions, respond with the exact text "NOT_FOUND".
      `;
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
      });
      
      let rawText = response.text;

      if (rawText && rawText.trim().toUpperCase() === "NOT_FOUND") {
        const errorMsg = `Could not generate a quiz for "${chapterName}". The title might be too vague or the topic too broad for specific questions at the "${userStudyLevel}" level with ${numQuestions} questions.`;
        setQuizError(errorMsg);
        addNotification(errorMsg, 'warning');
        setActiveQuizData({ subjectId, chapterId, chapterName, subjectName, userStudyLevel, questions: [] });
      } else if (rawText) {
        let jsonStr = rawText.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }

        try {
          const parsedQuestions: QuizQuestion[] = JSON.parse(jsonStr);
          if (Array.isArray(parsedQuestions) && parsedQuestions.every(q => typeof q.question === 'string' && typeof q.answer === 'string')) {
            setActiveQuizData({ subjectId, chapterId, chapterName, subjectName, userStudyLevel, questions: parsedQuestions });
          } else {
            throw new Error("Parsed JSON is not in the expected format of QuizQuestion[].");
          }
        } catch (parseError) {
          console.error("Failed to parse JSON response for quiz:", parseError, "Raw text:", rawText);
          const errorMsg = `Sorry, I couldn't structure the quiz for "${chapterName}" correctly. The AI response was not in the expected JSON format. The raw response started with: "${rawText.substring(0, 100)}..."`;
          setQuizError(errorMsg);
          addNotification("Quiz generation failed: AI response format error.", 'error');
          setActiveQuizData({ subjectId, chapterId, chapterName, subjectName, userStudyLevel, questions: [] });
        }
      } else {
        const errorMsg = `Sorry, I couldn't generate a quiz for "${chapterName}" right now. The model returned an empty response.`;
        setQuizError(errorMsg);
        addNotification(errorMsg, 'error');
        setActiveQuizData({ subjectId, chapterId, chapterName, subjectName, userStudyLevel, questions: [] });
      }
    } catch (err) {
      console.error("Gemini API error (Quiz Generation):", err);
      let errorMsg = "An error occurred while generating the quiz. Please try again later.";
      if (err instanceof Error && (err.message.includes("API key not valid") || err.message.includes("API_KEY_INVALID"))) {
         errorMsg = "AI features are currently unavailable. The API key is invalid or missing.";
      }
      setQuizError(errorMsg);
      addNotification(errorMsg, 'error');
      setActiveQuizData({ subjectId, chapterId, chapterName, subjectName, userStudyLevel, questions: [] });
    } finally {
      setQuizLoading(false);
    }
  }, [ai, userStudyLevel, userName, addNotification, updateSubjectInteraction]); 

  const handleCloseQuizModal = useCallback(() => {
    setIsQuizModalOpen(false);
    setActiveQuizData(null); 
  }, []);

  const handleQuizComplete = useCallback((subjectId: string, chapterId: string, achievedScore: number, totalPossibleScore: number) => {
    if (totalPossibleScore === 0) { 
        handleUpdateChapterProficiency(subjectId, chapterId, 1); 
        return;
    }

    const percentage = (achievedScore / totalPossibleScore) * 100;
    let newProficiency: number;

    if (percentage >= 90) {
        newProficiency = 5; 
    } else if (percentage >= 70) {
        newProficiency = 4; 
    } else if (percentage >= 40) {
        newProficiency = 3; 
    } else if (percentage >= 10) {
        newProficiency = 2; 
    } else {
        newProficiency = 1; 
    }
    
    handleUpdateChapterProficiency(subjectId, chapterId, newProficiency); 
    
    const subject = subjects.find(s => s.id === subjectId);
    const chapter = subject?.chapters.find(c => c.id === chapterId);

    if (subject && chapter) {
      const quizActivity: ExamActivity = {
        id: crypto.randomUUID(),
        date: getTodayDateString(),
        timestamp: Date.now(),
        type: 'quiz_attempt',
        description: `Attempted quiz for "${chapter.name}" (${subject.name}). Score: ${achievedScore}/${totalPossibleScore}.`,
        details: { 
          subjectName: subject.name, 
          chapterName: chapter.name, 
          score: `${achievedScore}/${totalPossibleScore}`
        }
      };
      setExamActivities(prev => [...prev, quizActivity]);
    }
    addNotification(`Quiz completed! Proficiency for "${chapter?.name || 'chapter'}" updated & attempt logged.`, 'success');
  }, [handleUpdateChapterProficiency, addNotification, subjects, setExamActivities]);

  const openAddSubjectModal = () => setIsAddSubjectModalOpen(true);
  const closeAddSubjectModal = () => setIsAddSubjectModalOpen(false);

  const openAddChapterModal = (subjectId: string, subjectName: string) => {
    setCurrentSubjectIdForChapter(subjectId);
    setCurrentSubjectNameForChapter(subjectName); 
    setIsAddChapterModalOpen(true);
  };
  const closeAddChapterModal = () => {
    setCurrentSubjectIdForChapter(null);
    setCurrentSubjectNameForChapter(null);
    setIsAddChapterModalOpen(false);
  };
  
  const handleOpenAskQuestionModal = useCallback((subjectId: string, chapterId: string, chapterName: string, subjectName: string) => {
    if (!ai) {
        addNotification("AI features for asking questions are currently unavailable.", 'warning');
        return;
    }
    setActiveChapterForQuestion({ subjectId, chapterId, chapterName, subjectName });
    setIsAskQuestionModalOpen(true);
    updateSubjectInteraction(subjectId);

    const activity: ExamActivity = {
        id: crypto.randomUUID(),
        date: getTodayDateString(),
        timestamp: Date.now(),
        type: 'ai_question_asked',
        description: `Asked a question about chapter: "${chapterName}" from "${subjectName}".`,
        details: { subjectName, chapterName }
    };
    setExamActivities(prev => [...prev, activity]);
    addNotification(`Asking AI about ${chapterName}...`, 'info');
  }, [ai, addNotification, setExamActivities, updateSubjectInteraction]);

  const handleCloseAskQuestionModal = useCallback(() => {
    setIsAskQuestionModalOpen(false);
    setActiveChapterForQuestion(null);
  }, []);

  const overallProgressData = useMemo(() => {
    let totalChapters = 0;
    let completedChapters = 0;
    subjects.forEach(subject => {
      totalChapters += subject.chapters.length;
      completedChapters += subject.chapters.filter(ch => ch.status === ChapterStatus.Completed).length;
    });
    return {
      totalChapters,
      completedChapters,
      progress: totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0,
    };
  }, [subjects]);

  const focusAreasData = useMemo((): FocusArea[] => {
    const areas: FocusArea[] = [];
    subjects.forEach(subject => {
      subject.chapters.forEach(chapter => {
        if ((chapter.proficiency || 0) <= 2 && chapter.proficiency !== undefined) { 
          areas.push({
            subjectId: subject.id,
            subjectName: subject.name,
            subjectColor: subject.color,
            chapterId: chapter.id,
            chapterName: chapter.name,
            proficiency: chapter.proficiency,
          });
        }
      });
    });
    return areas.sort((a, b) => {
        if (a.proficiency !== b.proficiency) {
            return a.proficiency - b.proficiency;
        }
        if (a.subjectName !== b.subjectName) {
            return a.subjectName.localeCompare(b.subjectName);
        }
        return a.chapterName.localeCompare(b.chapterName);
    });
  }, [subjects]);

  const logPomodoroActivity = useCallback((durationInMinutes: number) => {
    const pomodoroActivity: ExamActivity = {
      id: crypto.randomUUID(),
      date: getTodayDateString(),
      timestamp: Date.now(),
      type: 'pomodoro_session',
      description: `Completed a ${durationInMinutes}-minute Pomodoro focus session.`,
      details: { duration: durationInMinutes }
    };
    setExamActivities(prevActivities => [...prevActivities, pomodoroActivity]);
    addNotification('Pomodoro session logged!', 'success');
  }, [setExamActivities, addNotification]);

  const handleLogin = useCallback(async (email: string, pass: string) => {
  setAuthLoading(true);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });

  if (error) {
    setAuthLoading(false);
    setAuthError(error.message);
    return;
  }

  addNotification(`Welcome back to ${APP_NAME}!`, 'success');
  setIsAuthenticated(true);
  setAuthLoading(false);
  setAuthError(null);
  setShowOpeningPage(true);
  setAppContentVisible(false);
}, []);


  const handleSignUp = useCallback(async (email: string, pass: string) => {
  setAuthLoading(true);
  const { data, error } = await supabase.auth.signUp({ email, password: pass });

  if (error) {
    setAuthLoading(false);
    setAuthError(error.message);
    return;
  }

  const user = data.user;

  // ⬇️ Insert profile row
  if (user) {
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
    });
  }

  addNotification(`Signed up successfully!`, 'success');
  setIsAuthenticated(true);
  setAuthLoading(false);
  setAuthError(null);
  setShowOpeningPage(true);
  setAppContentVisible(false);
}, []);


  
  const handleSocialLogin = useCallback(async (provider: 'google' | 'github') => {
  setAuthLoading(true);
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.origin, // 👈 This must match the Authorized URL
    },
  });

  if (error) {
    setAuthError(error.message);
  }
  setAuthLoading(false);
}, []);


  const requestLogout = useCallback(() => {
  setShowFarewellPopup(true);
}, []);

const handleLogout = useCallback(async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout error:", error.message);
    addNotification("Logout failed.", "error");
    return;
  }

  // Cleanup on logout
  localStorage.removeItem('lernixus_profile'); // Clear saved profile
  setIsAuthenticated(false);
  setAppContentVisible(false);
  setShowFarewellPopup(false);

  addNotification("Logged out successfully.", "success");
}, [addNotification, setIsAuthenticated]);


useEffect(() => {
    setIsSessionLoading(true);

    const handleAuthChange = async (session: any) => {
      const user = session?.user;

      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching profile:", error);
          addNotification("Error loading your profile. Please try again.", "error");
          await supabase.auth.signOut(); // Log out on critical profile error
          return;
        }
        
        setIsAuthenticated(true);

        if (profile && profile.username) {
          // User has completed setup before
          setUserName(profile.username);
          setHasCompletedInitialSetup(true);
          setShowOpeningPage(true);
          setAppContentVisible(false); // Let opening page control this
        } else {
          // New user, or user who hasn't finished setup
          setHasCompletedInitialSetup(false);
        }
      } else {
        // User is not logged in
        setIsAuthenticated(false);
        setHasCompletedInitialSetup(false);
        // Clear user-specific data for a clean login screen
        setUserName('');
        setUserStudyLevel('');
        setSelectedCollege('');
        setSubjects([]);
        setExamPreparationInfo(null);
        setExamActivities([]);
        setGlobalNotes('');
      }
      
      setIsSessionLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [addNotification, setUserName, setUserStudyLevel, setSelectedCollege, setSubjects, setExamPreparationInfo, setExamActivities, setGlobalNotes]);



  const handleFeelingCheckSubmit = useCallback(async (feelingText: string, aiResponseHandler: (aiRes: FeelingAIResponse | null, error?: string) => void) => {
    if (!ai) {
      aiResponseHandler(null, "AI features for feeling check are unavailable.");
      return;
    }
    try {
      const prompt = `
        You are an empathetic AI companion for a student named ${userName || 'Learner'}.
        The student is using the ${APP_NAME} app and has shared their current feeling: "${feelingText}"

        Your tasks:
        1. Provide a short (1-2 sentences), comforting, and understanding response to the student's feeling. Address them by name.
        2. Determine an "actionHint" based on the feeling. Possible actionHints are: "none", "suggest_easy_chapter", "take_break".
           - "take_break": If the feeling is strongly negative (e.g., "depressed", "hopeless", "overwhelmed", "burnt out", "crisis").
           - "suggest_easy_chapter": If the feeling is mildly or moderately negative (e.g., "stressed", "tired", "a bit down", "sad", "frustrated", "unmotivated").
           - "none": For positive or neutral feelings, or if unsure.

        Return your entire response as a single, valid JSON object with two keys: "responseText" (string) and "actionHint" (string - one of the three specified values).
        Example 1 (mildly negative): {"responseText": "I hear you, ${userName || 'Learner'}. It's okay to feel stressed sometimes. Remember to be kind to yourself.", "actionHint": "suggest_easy_chapter"}
        Example 2 (strongly negative): {"responseText": "It sounds like you're going through a really tough time, ${userName || 'Learner'}. Please consider taking a break and focusing on your well-being.", "actionHint": "take_break"}
        Example 3 (positive): {"responseText": "That's great to hear, ${userName || 'Learner'}! Keep that positive energy going into your studies.", "actionHint": "none"}
      `;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      let rawText = response.text;
      if (rawText) {
        let jsonStr = rawText.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }
        const parsedResponse = JSON.parse(jsonStr) as FeelingAIResponse;
        if (parsedResponse.responseText && parsedResponse.actionHint) {
            aiResponseHandler(parsedResponse);
        } else {
            throw new Error("AI response was not in the expected format.");
        }
      } else {
        throw new Error("AI returned an empty response.");
      }
    } catch (err) {
      console.error("Error in handleFeelingCheckSubmit:", err);
      let errorMsg = "Sorry, I couldn't process that right now.";
      if (err instanceof Error && (err.message.includes("API key not valid") || err.message.includes("API_KEY_INVALID"))) {
         errorMsg = "AI interaction failed: API key issue.";
      }
      aiResponseHandler(null, errorMsg);
    }
  }, [ai, userName]);

  const handleFeelingCheckModalClose = (feelingSubmitted?: boolean) => {
    setIsFeelingCheckModalOpen(false);
    if(feelingSubmitted){
        setLastFeelingCheckDate(getTodayDateString());
    }
  };
  
  const easyChapterSuggestions = useMemo((): EasyChapterSuggestion[] => {
    const suggestions: EasyChapterSuggestion[] = [];
    subjects.forEach(subject => {
      subject.chapters.forEach(chapter => {
        if (chapter.status === ChapterStatus.NotStarted || (chapter.proficiency || 0) <= 1) {
          suggestions.push({
            subjectId: subject.id,
            subjectName: subject.name,
            subjectColor: subject.color,
            chapterId: chapter.id,
            chapterName: chapter.name,
          });
        }
      });
    });
    return suggestions.sort(() => 0.5 - Math.random()).slice(0, 3);
  }, [subjects]);

  const handleNavigateFromSuggestion = (subjectId: string, chapterId: string, subjectName: string, chapterName: string) => {
    setActiveView('chapterContent'); 
    handleNavigateToChapterContent(subjectId, chapterId, subjectName, chapterName);
  };

  const lightAccentName = LIGHT_ACCENT_COLOR.split('-')[0];
  const lightAccentShade = LIGHT_ACCENT_COLOR.split('-')[1] || '500';
  const darkAccentName = DARK_ACCENT_COLOR.split('-')[0];
  const darkAccentShade = DARK_ACCENT_COLOR.split('-')[1] || '400';


  if (isSessionLoading) {
    return (
      <div className={`fixed inset-0 bg-slate-100 dark:bg-slate-900 flex items-center justify-center transition-opacity duration-300`}>
        <BookOpenIcon className="w-24 h-24 text-sky-500 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <GlobalNotificationDisplay />
        <LoginPage 
          onLogin={handleLogin} 
          onSignUp={handleSignUp}
          onSocialLogin={handleSocialLogin}
          loading={authLoading}
          error={authError}
          setError={setAuthError}
        />
      </>
    );
  }

  if (!hasCompletedInitialSetup) {
    return (
      <>
        <GlobalNotificationDisplay />
        <InitialSetupPage
            onSetupComplete={(name, level, college, examInfo) => { 
                setUserName(name);
                setUserStudyLevel(level);
                setSelectedCollege(college || '');
                setExamPreparationInfo(examInfo); 
                setHasCompletedInitialSetup(true);
                addNotification(`Welcome, ${name}! Your learning space is ready.`, 'success');
                setShowOpeningPage(true); 
                setAppContentVisible(false);
            }}
            currentName={userName}
            currentLevel={userStudyLevel}
            currentCollege={selectedCollege}
            currentExamInfo={examPreparationInfo} 
        />
      </>
    );
  }

  if (showOpeningPage) {
    return (
       <>
        <GlobalNotificationDisplay />
        <OpeningPage onExitAnimationComplete={handleOpeningPageExited} />
       </>
    );
  }
  
  const mainContentPadding = (activeView === 'dashboard' || activeView === 'subjects' || activeView === 'examPrep' ||  activeView === 'video' ) ? 'p-4 sm:p-6 lg:p-8' : '';


  return (
    <div className={`${!appContentVisible ? 'opacity-0' : 'animate-appContentFadeIn opacity-100'}`}>
      <GlobalNotificationDisplay />
      <Layout
        activeView={activeView}
        setActiveView={setActiveView}
        onAddSubjectClick={openAddSubjectModal}
        currentStreak={currentStreak}
        overallProgressData={overallProgressData} 
        userName={userName}
        userStudyLevel={userStudyLevel}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        activeChapterContentInfo={activeChapterContentInfo}
        onLogout={requestLogout}
      >
        <PomodoroTimer 
            isDashboardActive={activeView === 'dashboard'} 
            userName={userName} 
            onLogPomodoroActivity={logPomodoroActivity}
        />

        {activeView === 'dashboard' && (
          <div className={`space-y-6 sm:space-y-8 ${mainContentPadding}`}>
            {dailyQuote && (
                 <section 
                  aria-labelledby="daily-motivation-title" 
                  className={`p-5 sm:p-6 rounded-2xl shadow-xl hover:shadow-2xl ${theme === 'light' ? 'bg-white' : 'bg-slate-800'} border-l-4 ${theme === 'light' ? `border-${lightAccentName}-${lightAccentShade}` : `border-${darkAccentName}-${darkAccentShade}`} transition-all duration-300 ease-in-out hover:scale-[1.015]`}
                >
                  <h2 id="daily-motivation-title" className="sr-only">Daily Wisdom for ${userName || 'Learner'}</h2>
                  <blockquote className="text-center sm:text-left">
                    <p className={`text-lg sm:text-xl italic ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'} leading-relaxed`}>"${dailyQuote.text}"</p>
                    <footer className={`mt-3 text-sm font-semibold tracking-wide ${theme === 'light' ? `text-${lightAccentName}-600` : `text-${darkAccentName}-400`}`}>— ${dailyQuote.author}</footer>
                  </blockquote>
                </section>
            )}
            <StudyStrategiesSection 
                strategies={studyStrategies} 
                isLoading={strategiesLoading} 
                onOpenStrategyDetail={handleOpenStrategyDetailModal}
            />
          </div>
        )}
        {activeView === 'subjects' && (
          <div className={`space-y-6 sm:space-y-8 ${mainContentPadding}`}>
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
        )}
        {activeView === 'personalNotes' && (
          <PersonalNotesView initialNotes={globalNotes} onSaveNotes={setGlobalNotes} />
        )}
        {activeView === 'chapterContent' && activeChapterContentInfo && ai && ( 
          <ChapterContentView
            subjectName={activeChapterContentInfo.subjectName}
            chapterName={activeChapterContentInfo.chapterName}
            userStudyLevel={userStudyLevel}
            userName={userName}
            ai={ai}
            onClose={handleCloseChapterContentView}
          />
        )}
         {activeView === 'chapterContent' && activeChapterContentInfo && !ai && ( 
            <div className="p-6 sm:p-8 text-center">
                <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-200'} text-lg`}>
                    AI features for chapter content generation are currently unavailable.
                </p>
                <button 
                    onClick={handleCloseChapterContentView}
                    className={`mt-4 py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all ${theme === 'light' ? `bg-${lightAccentName}-500 hover:bg-${lightAccentName}-600 text-white` : `bg-${darkAccentName}-500 hover:bg-${darkAccentName}-600 text-white`}`}
                >
                    Back to My Learning
                </button>
            </div>
        )}
        {activeView === 'examPrep' && (
            <div className={`${mainContentPadding}`}>
                <ExamPrepView 
                    examInfo={examPreparationInfo}
                    activities={examActivities}
                    userName={userName}
                />
            </div>
        )}
        {activeView === 'video' && (
            <div className={`${mainContentPadding}`}>
                <VideoPlayer onBack={function (): void {
              throw new Error('Function not implemented.');
            } } />
            </div>
          )}

      </Layout>

      <Modal isOpen={isAddSubjectModalOpen} onClose={closeAddSubjectModal} title="Create New Subject">
        <AddSubjectForm onAddSubject={handleAddSubject} onClose={closeAddSubjectModal} />
      </Modal>

      {currentSubjectIdForChapter && (
        <Modal isOpen={isAddChapterModalOpen} onClose={closeAddChapterModal} title={`New Chapter for: ${currentSubjectNameForChapter || 'Subject'}`}>
          <AddChapterForm
            subjectId={currentSubjectIdForChapter}
            onAddChapter={(sId, chName) => {
              handleAddChapter(sId, chName);
              closeAddChapterModal(); 
            }}
            onClose={closeAddChapterModal}
          />
        </Modal>
      )}

      {editingChapterInfo && (
        <ChapterNotesModal
            isOpen={isChapterNotesModalOpen}
            onClose={handleCloseChapterNotesModal}
            chapterName={editingChapterInfo.chapterName}
            currentNotes={editingChapterInfo.currentNotes}
            onSaveNotes={(newNotes) => handleSaveChapterNotes(editingChapterInfo.subjectId, editingChapterInfo.chapterId, newNotes)}
        />
      )}

      <ConfirmationModal
        isOpen={confirmationModalConfig.isOpen}
        onClose={() => setConfirmationModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModalConfig.onConfirm}
        title={confirmationModalConfig.title}
        message={confirmationModalConfig.message}
        confirmButtonText={confirmationModalConfig.confirmButtonText}
        isDestructive={confirmationModalConfig.isDestructive}
      />

      {isQuizModalOpen && ai && ( 
        <QuizModal
          isOpen={isQuizModalOpen}
          onClose={handleCloseQuizModal}
          quizData={activeQuizData}
          isLoading={quizLoading}
          error={quizError}
          onGenerateNewQuiz={(chapterName, subjectName, numQuestions) => {
              if (activeQuizData) { 
                   handleGenerateQuiz(activeQuizData.subjectId, activeQuizData.chapterId, chapterName, subjectName, numQuestions);
              }
          }}
          ai={ai}
          onQuizComplete={handleQuizComplete}
          userStudyLevel={userStudyLevel} 
          userName={userName}
        />
      )}
       {isQuizModalOpen && !ai && ( 
         <Modal isOpen={isQuizModalOpen} onClose={handleCloseQuizModal} title="Quiz Unavailable">
            <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>
                AI features for Quiz generation are currently unavailable.
            </p>
             <div className="mt-4 flex justify-end">
                 <button 
                    onClick={handleCloseQuizModal}
                    className={`py-2 px-4 rounded-lg shadow-sm ${theme === 'light' ? `bg-${lightAccentName}-500 hover:bg-${lightAccentName}-600 text-white` : `bg-${darkAccentName}-500 hover:bg-${darkAccentName}-600 text-white`}`}
                >
                    Close
                </button>
             </div>
         </Modal>
       )}


      {activeChapterForQuestion && ai && (
        <AskQuestionModal
            isOpen={isAskQuestionModalOpen}
            onClose={handleCloseAskQuestionModal}
            chapterName={activeChapterForQuestion.chapterName}
            subjectName={activeChapterForQuestion.subjectName}
            userStudyLevel={userStudyLevel}
            userName={userName}
            ai={ai}
        />
      )}
        
      {selectedStrategy && (
        <Modal
            isOpen={isStrategyDetailModalOpen}
            onClose={handleCloseStrategyDetailModal}
            title="Study Strategy Deep Dive"
        >
            <div className={`p-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>
                <p className="text-sm sm:text-base leading-relaxed">${selectedStrategy.text}</p>
                <div className="mt-6 flex justify-end">
                    <button
                    onClick={handleCloseStrategyDetailModal}
                    className={`py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all text-sm font-semibold ${theme === 'light' ? `bg-${lightAccentName}-500 hover:bg-${lightAccentName}-600 text-white focus:ring-${lightAccentName}-400` : `bg-${darkAccentName}-500 hover:bg-${darkAccentName}-600 text-white focus:ring-${darkAccentName}-400`} focus:outline-none focus:ring-2  focus:ring-offset-2 ${theme === 'light' ? 'focus:ring-offset-white' : `focus:ring-offset-slate-800`}`}
                    >
                    Close
                    </button>
                </div>
            </div>
        </Modal>
      )}

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentName={userName}
        onUpdateName={setUserName}
        currentStudyLevel={userStudyLevel}
        onUpdateStudyLevel={(newLevel) => {
            setUserStudyLevel(newLevel);
            if (newLevel !== userStudyLevel) {
              setStudyStrategies([]); 
              const notApplicableLevels = ['Working Professional (Continuing Education / Skill Development)', 'Other / Prefer not to say'];
              if (notApplicableLevels.includes(newLevel)) {
                setExamPreparationInfo({goalType: 'none'});
              }
            }
        }}
        currentCollege={selectedCollege}
        onUpdateCollege={(collegeName) => {
            const oldCollege = selectedCollege;
            setSelectedCollege(collegeName);
            if (collegeName !== oldCollege) {
                 setStudyStrategies([]); 
            }
        }}
        currentExamInfo={examPreparationInfo}
        onUpdateExamInfo={(newExamInfo) => {
            setExamPreparationInfo(newExamInfo);
            setStudyStrategies([]); 
        }}
      />
      {ai && ( 
        <FeelingCheckModal
          isOpen={isFeelingCheckModalOpen}
          onClose={handleFeelingCheckModalClose}
          userName={userName}
          ai={ai}
          onFeelingSubmit={handleFeelingCheckSubmit}
          easyChapterSuggestions={easyChapterSuggestions}
          onNavigateToChapter={handleNavigateFromSuggestion}
        />
      )}
    <FarewellPopup
        isOpen={showFarewellPopup}
        onClose={handleLogout}
      />
    </div>
  );
};

export default App;