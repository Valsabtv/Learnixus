
export enum ChapterStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Completed = 'Completed',
}

export interface Chapter {
  id: string;
  name: string;
  status: ChapterStatus;
  notes?: string;
  proficiency?: number; 
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
  color: string; 
  lastInteractedDate: string | null; // YYYY-MM-DD
}

// New types for the Quiz feature
export interface QuizQuestion {
  question: string;
  answer: string; // Correct answer provided by AI
}

export type EvaluationStatus = 'correct' | 'partially_correct' | 'incorrect' | 'pending_evaluation';

export interface UserQuizAttempt extends QuizQuestion {
  userAnswer: string;
  evaluationStatus: EvaluationStatus;
  score: number; // 0, 0.5, or 1
  aiFeedback?: string | null; // To store AI feedback
  feedbackLoading?: boolean; // To indicate feedback is being loaded
}

// Interface for displaying areas to focus on (weak chapters)
export interface FocusArea {
  subjectId: string;
  subjectName: string;
  subjectColor: string; // Ensure this is always present
  chapterId: string;
  chapterName: string;
  proficiency: number;
}

// Interface for Study Strategies
export interface StudyStrategy {
  id: string;
  text: string;
}

// Active view type for main application layout
export type ActiveView = 'dashboard' | 'subjects' | 'personalNotes' | 'chapterContent' | 'examPrep' | 'video' | 'dailyTasks';

// Types for Daily Tasks
export enum DailyTaskStatus {
  Pending = 'pending',
  Completed = 'completed',
  Dropped = 'dropped',
}

export interface DailyTask {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  status: DailyTaskStatus;
  notes?: string;
}


// Interface for Chapter Content View
export interface ActiveChapterContentInfo {
  subjectName: string;
  chapterName: string;
  subjectId: string; 
  chapterId: string; 
}

// Interface for ChapterContentView Insights
export interface Insight {
  title: string;
  description: string;
  keyPoints: string[];
  imageUrl?: string; // Will always be PLACEHOLDER_IMAGE_URL or undefined
}

// For Global Notification System
export type NotificationType = 'success' | 'warning' | 'error' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

// Types for Exam Preparation
export type ExamGoalType = 'none' | 'general_final_exams' | 'specific_competitive_exam';

export interface ExamPreparationInfo {
  goalType: ExamGoalType;
  customExamName?: string; // For "Other competitive exam" or general description for final exams
  specificExamKey?: string; // Key from POPULAR_INDIAN_EXAMS if selected
  targetDate?: string; // Optional for future use (YYYY-MM-DD)
}

export type ExamActivityType = 
  | 'quiz_attempt' 
  | 'chapter_completed' 
  | 'pomodoro_session'
  | 'chapter_content_viewed' // Added new type
  | 'ai_question_asked'
  | 'daily_task_completed';     // Added new type

export interface ExamActivity {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number; // For sorting within a day
  type: ExamActivityType;
  description: string;
  details?: {
    subjectName?: string;
    chapterName?: string;
    score?: string; // e.g., "3/5" for quiz, or proficiency update
    duration?: number; // in minutes for pomodoro
  };
}

// Types for Feeling Check Modal
export type FeelingSentiment = 'positive' | 'neutral' | 'negative_mild' | 'negative_moderate' | 'negative_strong';
export type FeelingActionHint = 'none' | 'suggest_easy_chapter' | 'take_break';

export interface FeelingAIResponse {
  responseText: string;
  actionHint: FeelingActionHint;
}

export interface EasyChapterSuggestion {
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  chapterId: string;
  chapterName: string;
}
