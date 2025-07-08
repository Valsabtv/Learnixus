

import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import { useTheme } from '../contexts/ThemeContext';
import { QuestionMarkCircleIcon, SparklesIcon, CheckCircleIcon, XCircleIcon, MinusCircleIcon, ArrowUturnLeftIcon, LightbulbIcon } from './IconComponents';
import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';
import { QuizQuestion, UserQuizAttempt, EvaluationStatus } from '../types';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { useNotification } from '../contexts/NotificationContext';


interface ActiveQuizData {
  subjectId: string;
  chapterId: string;
  chapterName: string;
  subjectName: string;
  userStudyLevel: string;
  questions: QuizQuestion[];
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizData: ActiveQuizData | null;
  isLoading: boolean; 
  error: string | null;   
  onGenerateNewQuiz: (chapterName: string, subjectName: string, numQuestions: number) => void; 
  ai: GoogleGenAI;
  onQuizComplete: (subjectId: string, chapterId: string, achievedScore: number, totalPossibleScore: number) => void;
  userStudyLevel: string;
  userName: string;
}

type QuizPhase = 
  | 'configuring_num_questions' 
  | 'loading_questions' 
  | 'error_generating_questions' 
  | 'answering' 
  | 'submitting_individual_feedback' 
  | 'results';

const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  quizData,
  isLoading,
  error,
  onGenerateNewQuiz,
  ai,
  onQuizComplete,
  userStudyLevel,
  userName,
}) => {
  const { theme } = useTheme();
  const { addNotification } = useNotification();
  const accentColor = theme === 'light' ? LIGHT_ACCENT_COLOR : DARK_ACCENT_COLOR;

  const [numQuestionsInput, setNumQuestionsInput] = useState<string>("5");
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [quizPhase, setQuizPhase] = useState<QuizPhase>('configuring_num_questions');
  const [quizResults, setQuizResults] = useState<UserQuizAttempt[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [overallFeedbackText, setOverallFeedbackText] = useState<string | null>(null);
  const [overallFeedbackLoading, setOverallFeedbackLoading] = useState<boolean>(false);
  
  const textColor = theme === 'light' ? 'text-slate-700' : theme === 'dark' ? 'text-slate-300' : 'text-gray-400';
  const strongTextColor = theme === 'light' ? `text-${accentColor}-600` : `text-${accentColor}-400`;
  const errorColor = theme === 'light' ? 'text-red-600' : 'text-red-400';
  const contentBgClass = theme === 'light' ? 'bg-slate-50' : theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-900/50';
  const contentBorderClass = theme === 'light' ? `border-slate-200/70` : theme === 'dark' ? `border-slate-700/60` : `border-gray-800/60`; 
  const inputBgClass = theme === 'light' ? 'bg-white border-slate-300 focus:ring-indigo-500 focus:border-indigo-500' : theme === 'dark' ? 'bg-slate-600 border-slate-500 focus:ring-sky-500 focus:border-sky-500' : 'bg-gray-800 border-gray-700 focus:ring-sky-500 focus:border-sky-500';
  const inputTextColor = theme === 'light' ? 'text-slate-900' : 'text-slate-50';
  
  const primaryButtonBg = `bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-600 hover:from-${accentColor}-600 hover:to-${accentColor}-700`;
  const primaryButtonFocusRing = `focus:ring-${accentColor}-400`;
  const secondaryButtonBg = theme === 'light' ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-600 hover:bg-slate-500 text-slate-200';
  const secondaryButtonFocusRing = theme === 'light' ? 'focus:ring-slate-400' : 'focus:ring-slate-500';
  const feedbackBgClass = theme === 'light' ? 'bg-sky-50' : 'bg-sky-500/10';
  const feedbackBorderClass = theme === 'light' ? 'border-sky-200' : 'border-sky-700/60';

  const correctBorderClass = theme === 'light' ? 'border-green-400' : 'border-green-500';
  const partiallyCorrectBorderClass = theme === 'light' ? 'border-amber-400' : 'border-amber-500';
  const incorrectBorderClass = theme === 'light' ? 'border-red-400' : 'border-red-500';

  useEffect(() => {
    if (isOpen) {
      setOverallFeedbackText(null); 
      setOverallFeedbackLoading(false);

      if (isLoading) {
        setQuizPhase('loading_questions');
      } else if (error) {
        setQuizPhase('error_generating_questions');
      } else if (quizData && quizData.questions && quizData.questions.length > 0) {
        setUserAnswers(new Array(quizData.questions.length).fill(''));
        setQuizResults(null);
        setCurrentQuestionIndex(0);
        setQuizPhase('answering');
      } else if (quizData && (!quizData.questions || quizData.questions.length === 0)) {
        setQuizPhase('configuring_num_questions');
        setNumQuestionsInput("5"); 
      }
    } else {
        setUserAnswers([]);
        setQuizResults(null);
        setCurrentQuestionIndex(0);
        setNumQuestionsInput("5");
        setOverallFeedbackText(null);
        setOverallFeedbackLoading(false);
    }
  }, [isOpen, isLoading, error, quizData]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[index] = value;
    setUserAnswers(newAnswers);
  };

  const parseAiFeedbackEvaluation = (feedbackText: string): { status: EvaluationStatus, score: number } => {
    const lowerFeedback = feedbackText.toLowerCase().trim();
    if (lowerFeedback.startsWith("partially correct.") || lowerFeedback.startsWith("somewhat correct.")) {
      return { status: 'partially_correct', score: 0.5 };
    }
    if (lowerFeedback.startsWith("correct.")) {
      return { status: 'correct', score: 1 };
    }
    return { status: 'incorrect', score: 0 };
  };

  const fetchOverallFeedback = async (currentQuizData: ActiveQuizData, results: UserQuizAttempt[], achievedScore: number, possibleScore: number) => {
    setOverallFeedbackLoading(true);
    setOverallFeedbackText(null);
    try {
        const overallFeedbackPrompt = `You are an encouraging and insightful AI Learning Coach.
A student named ${userName || 'there'} has just completed a quiz on the chapter "${currentQuizData.chapterName}" (subject: "${currentQuizData.subjectName}", study level: "${currentQuizData.userStudyLevel}").

Quiz Performance Summary:
- Total Questions: ${results.length}
- Score: ${achievedScore} out of ${possibleScore}

Detailed Results (brief summary of student's performance):
${results.map(r => `  - Question: "${r.question.substring(0, 70)}..." Student's Answer was: ${r.evaluationStatus} (Score: ${r.score})`).join('\n')}

Based on this performance, provide overall positive and constructive feedback for ${userName || 'the student'}.
The feedback should be 2-4 sentences long and friendly.
- Start with a positive affirmation of their effort (e.g., "Great job tackling this quiz, ${userName || 'learner'}!").
- If they did well (e.g., >70% score), congratulate them and perhaps mention their strong grasp of the topic.
- If they struggled (e.g., <40% score), offer encouragement, gently suggest reviewing key concepts from the chapter, and emphasize that learning is a journey.
- For scores in between, provide balanced feedback, acknowledging correct areas and areas for growth.
- Maintain an encouraging and supportive tone. Do not be harsh.
- Do not repeat individual question feedback. Focus on the bigger picture and general advice for this chapter/topic.
Example for good score: "Excellent work on this quiz, ${userName || 'learner'}! You've demonstrated a strong understanding of ${currentQuizData.chapterName}. Keep up the great learning momentum!"
Example for struggle: "Good effort for taking on the quiz for ${currentQuizData.chapterName}, ${userName || 'learner'}! This material can be challenging. Revisiting the main ideas of the chapter might be helpful. Remember, every quiz is a learning opportunity!"
`;
        const feedbackResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: overallFeedbackPrompt,
        });
        setOverallFeedbackText(feedbackResponse.text);
    } catch (err) {
        console.error("Error generating overall quiz feedback:", err);
        setOverallFeedbackText("Could not load overall feedback at this time. Please check your connection or API key.");
        addNotification("Failed to generate overall quiz feedback.", 'error');
    } finally {
        setOverallFeedbackLoading(false);
    }
  };

  const processAndSubmitQuiz = useCallback(async () => {
    if (!quizData || !quizData.questions || quizData.questions.length === 0) return;

    setQuizPhase('submitting_individual_feedback');
    const initialResults: UserQuizAttempt[] = quizData.questions.map((q, i) => ({
      ...q,
      userAnswer: userAnswers[i]?.trim() || "",
      evaluationStatus: 'pending_evaluation',
      score: 0,
      aiFeedback: null,
      feedbackLoading: true,
    }));
    setQuizResults(initialResults);

    const feedbackPromises = initialResults.map(async (result) => {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-04-17',
          contents: `Question: "${result.question}"
Correct Answer from System (for tutor reference only, do not reveal directly unless necessary for explanation): "${result.answer}"
Student's Answer (${userName || 'Student'}): "${result.userAnswer}"`,
          config: {
            systemInstruction: `You are a helpful and encouraging AI Tutor for a student named ${userName || 'there'}.
Your task is to provide concise feedback on a student's answer to a quiz question.

Instructions for feedback:
1.  **Response Start:**
    *   If the student's answer is fully correct, **start your feedback with the exact phrase "Correct."** followed by any additional affirmation or insight.
    *   If the student's answer is partially or somewhat correct but not entirely, **start your feedback with the exact phrase "Partially correct."** followed by guidance.
    *   If the student's answer is incorrect, do not use "Correct." or "Partially correct." as leading phrases. Instead, proceed directly to gentle guidance.
2.  **Content of Feedback:**
    *   **Correct Answers:** After "Correct.", you can add a very brief positive comment or a slightly deeper insight related to the answer (1-2 sentences maximum in total).
    *   **Partially Correct Answers:** After "Partially correct.", acknowledge the correct parts and gently guide them on the parts that need correction or completion (1-2 sentences maximum in total). Do NOT give away the full correct answer unless hinting is insufficient.
    *   **Incorrect Answers:** Gently point out the misunderstanding. Do NOT give away the direct correct answer. Instead, offer a small hint or guide them towards the correct concept (1-2 sentences maximum).
3.  **Formatting**: Ensure your feedback respects newlines if you are explaining something that needs it, like a step in a math problem. Use \\n for newlines.
4.  **Overall Tone:** Keep all feedback encouraging, supportive, and brief.`
          }
        });
        return { status: 'fulfilled' as const, value: response };
      } catch (error) {
        return { status: 'rejected' as const, reason: error };
      }
    });
    
    const settledFeedbacks = await Promise.all(feedbackPromises);
    
    let finalAchievedScore = 0;
    const totalPossibleScore = quizData.questions.length;
    
    const processedResults: UserQuizAttempt[] = initialResults.map((originalResult, idx) => {
        const settledItem = settledFeedbacks[idx];
        if (settledItem.status === 'fulfilled') {
            const feedbackText = settledItem.value.text;
            const parsedEval = parseAiFeedbackEvaluation(feedbackText);
            finalAchievedScore += parsedEval.score;
            return {
                ...originalResult,
                aiFeedback: feedbackText,
                feedbackLoading: false,
                evaluationStatus: parsedEval.status,
                score: parsedEval.score,
            };
        } else { 
            const reason = settledItem.reason;
            let feedbackErrorMessage = "Sorry, an error occurred while getting feedback for this answer.";
            if (reason instanceof Error && (reason.message.includes("API key not valid") || reason.message.includes("API_KEY_INVALID"))) {
                feedbackErrorMessage = "AI Tutor feedback unavailable (API key invalid or missing).";
            }
            addNotification(`Feedback error for question ${idx + 1}: ${feedbackErrorMessage}`, 'error');
            return {
                ...originalResult,
                aiFeedback: feedbackErrorMessage,
                feedbackLoading: false,
                evaluationStatus: 'incorrect' as EvaluationStatus,
                score: 0,
            };
        }
    });

    setQuizResults(processedResults);
    setQuizPhase('results');
    onQuizComplete(quizData.subjectId, quizData.chapterId, finalAchievedScore, totalPossibleScore);
    fetchOverallFeedback(quizData, processedResults, finalAchievedScore, totalPossibleScore);

  }, [ai, quizData, userAnswers, onQuizComplete, userStudyLevel, userName, addNotification]);


  const handleNextQuestion = () => {
    if (!quizData || !quizData.questions) return;
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      processAndSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleInitiateQuizGeneration = () => {
    const num = parseInt(numQuestionsInput, 10);
    if (quizData && quizData.chapterName && quizData.subjectName && num > 0 && num <= 10) { 
      onGenerateNewQuiz(quizData.chapterName, quizData.subjectName, num);
    } else if (num <= 0 || num > 10) { // Max 10 questions for this simple quiz
        addNotification("Please enter a number of questions between 1 and 10.", 'warning');
    }
  };

  const getResultItemBorderClass = (status: EvaluationStatus) => {
    switch (status) {
      case 'correct': return correctBorderClass;
      case 'partially_correct': return partiallyCorrectBorderClass;
      case 'incorrect':
      case 'pending_evaluation':
      default: return incorrectBorderClass;
    }
  };

  const getResultItemIcon = (status: EvaluationStatus) => {
    switch (status) {
      case 'correct': return <CheckCircleIcon className="w-4 h-4 inline-block ml-2 text-green-500 dark:text-green-400" />;
      case 'partially_correct': return <MinusCircleIcon className="w-4 h-4 inline-block ml-2 text-amber-500 dark:text-amber-400" />;
      case 'incorrect':
      case 'pending_evaluation':
      default: return <XCircleIcon className="w-4 h-4 inline-block ml-2 text-red-500 dark:text-red-400" />;
    }
  };
  
  const renderContent = () => {
    switch (quizPhase) {
      case 'configuring_num_questions':
        return (
          <div className={`flex flex-col items-center justify-center p-6 rounded-lg ${contentBgClass} border ${contentBorderClass} min-h-[300px] text-center`}>
            <LightbulbIcon className={`w-12 h-12 mb-4 ${strongTextColor}`} />
            <h3 className={`text-lg font-semibold ${textColor} mb-3`}>Configure Your Quiz, {userName || 'Learner'}!</h3>
            <p className={`${textColor} text-sm mb-4`}>How many questions would you like to attempt for "{quizData?.chapterName}"?</p>
            <input 
              type="number"
              value={numQuestionsInput}
              onChange={(e) => setNumQuestionsInput(e.target.value)}
              min="1"
              max="10" 
              className={`w-3/4 sm:w-1/3 p-2.5 border rounded-md ${inputBgClass} ${inputTextColor} focus:ring-2 focus:outline-none text-center mb-6 text-base`}
              aria-label="Number of questions"
            />
            <button
              onClick={handleInitiateQuizGeneration}
              className={`w-full sm:w-auto ${primaryButtonBg} text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 ${primaryButtonFocusRing} focus:ring-offset-2 ${theme === 'light' ? 'focus:ring-offset-white' : `focus:ring-offset-slate-800`} hover:scale-[1.03]`}
            >
              Generate Quiz
            </button>
          </div>
        );
      case 'loading_questions':
        return (
          <div className={`flex flex-col items-center justify-center p-6 rounded-lg ${contentBgClass} border ${contentBorderClass} min-h-[300px]`}>
            <SparklesIcon className={`w-12 h-12 mb-4 animate-pulse ${strongTextColor}`} />
            <p className={`${textColor} font-medium text-lg`}>Generating Quiz Questions, {userName || 'Learner'}...</p>
            <p className={`${textColor} text-base mt-1`}>This might take a moment, hang tight!</p>
          </div>
        );
      case 'error_generating_questions':
        return (
           <div className={`flex flex-col items-center justify-center p-6 rounded-lg ${contentBgClass} border border-red-300 dark:border-red-500 min-h-[300px] text-center`}>
            <QuestionMarkCircleIcon className={`w-12 h-12 mb-4 ${errorColor}`} />
            <p className={`${errorColor} font-medium text-lg mb-4`}>{error || "Could not load quiz questions."}</p>
            {quizData?.chapterName && quizData?.subjectName && (
                 <button
                    onClick={() => setQuizPhase('configuring_num_questions')} 
                    className={`w-full sm:w-auto ${primaryButtonBg} text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 ${primaryButtonFocusRing} focus:ring-offset-2 ${theme === 'light' ? 'focus:ring-offset-slate-50' : `focus:ring-offset-slate-700/50`} hover:scale-[1.03]`}
                >
                    Try Configuring Again
                </button>
            )}
          </div>
        );
      case 'answering':
        if (!quizData || !quizData.questions || quizData.questions.length === 0) return <p className={`${textColor} text-base`}>No questions available for this quiz.</p>;
        const currentQ = quizData.questions[currentQuestionIndex];
        return (
          <div className={`p-4 sm:p-5 rounded-lg ${contentBgClass} border ${contentBorderClass} min-h-[350px] flex flex-col`}>
            <div className="mb-3">
                <p className={`text-base font-medium ${textColor} opacity-80`}>Question {currentQuestionIndex + 1} of {quizData.questions.length} for {userName || 'Learner'}</p>
                <label htmlFor={`quiz-answer-${currentQuestionIndex}`} className={`font-semibold ${textColor} mt-1.5 mb-2.5 block text-lg whitespace-pre-wrap`}>{currentQ.question}</label>
            </div>
            <textarea
              id={`quiz-answer-${currentQuestionIndex}`}
              value={userAnswers[currentQuestionIndex]}
              onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
              rows={7} 
              className={`w-full p-3 border rounded-md ${inputBgClass} ${inputTextColor} focus:ring-2 focus:outline-none text-base flex-grow whitespace-pre-wrap`}
              placeholder="Your answer..."
              aria-label={`Answer for question ${currentQuestionIndex + 1}`}
            />
          </div>
        );
      case 'submitting_individual_feedback':
        return (
          <div className={`flex flex-col items-center justify-center p-6 rounded-lg ${contentBgClass} border ${contentBorderClass} min-h-[300px]`}>
            <SparklesIcon className={`w-12 h-12 mb-4 animate-pulse ${strongTextColor}`} />
            <p className={`${textColor} font-medium text-lg`}>Getting AI Feedback & Calculating Score, {userName || 'Learner'}...</p>
            <p className={`${textColor} text-base mt-1`}>This may take a few moments.</p>
          </div>
        );
      case 'results':
        if (!quizResults) return <p className={`${textColor} text-base`}>No results to display.</p>;
        
        const allFeedbackLoaded = quizResults.every(r => !r.feedbackLoading);
        const totalAchievedScore = allFeedbackLoaded ? quizResults.reduce((acc, r) => acc + r.score, 0) : "...";
        const totalPossibleScore = quizResults.length;

        return (
          <div className="space-y-4">
            <div className={`p-4 sm:p-5 rounded-lg ${contentBgClass} border ${contentBorderClass} text-center`}>
              <h3 className={`text-xl font-semibold ${strongTextColor} mb-1.5`}>Quiz Results for {userName || 'Learner'}</h3>
              <p className={`${textColor} text-2xl`}>
                You scored <span className="font-bold">{totalAchievedScore}</span> out of <span className="font-bold">{totalPossibleScore}</span> points!
              </p>
               <p className={`${textColor} text-base mt-1.5`}>Your chapter proficiency has been updated based on this score.</p>
            </div>
            {quizResults.map((r, index) => (
              <div key={index} className={`p-4 sm:p-5 rounded-lg ${contentBgClass} border ${getResultItemBorderClass(r.evaluationStatus)}`}>
                <div className="flex justify-between items-start">
                    <p className={`font-semibold ${textColor} mb-1.5 flex-1 text-base whitespace-pre-wrap`}>{index + 1}. {r.question}</p>
                    <span className={`text-sm font-bold px-2 py-1 rounded-full ml-2 whitespace-nowrap
                        ${r.evaluationStatus === 'correct' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' : 
                          r.evaluationStatus === 'partially_correct' ? 'bg-amber-100 text-amber-700 dark:bg-amber-700 dark:text-amber-100' :
                         'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100'}`}>
                        {r.feedbackLoading ? '...' : `+${r.score} pts`}
                    </span>
                </div>

                <div className={`p-3 rounded-md text-base mb-2.5 
                  ${r.evaluationStatus === 'correct' ? (theme === 'light' ? 'bg-green-50' : 'bg-green-500/10') : 
                    r.evaluationStatus === 'partially_correct' ? (theme === 'light' ? 'bg-amber-50' : 'bg-amber-500/10') : 
                   (theme === 'light' ? 'bg-red-50' : 'bg-red-500/10')}`}>
                  <span className={`font-medium ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Your Answer: </span>
                  <span className={`${textColor} whitespace-pre-wrap`}>{r.userAnswer || "(No answer provided)"}</span>
                  {getResultItemIcon(r.evaluationStatus)}
                </div>

                {(r.evaluationStatus === 'incorrect' || r.evaluationStatus === 'partially_correct') && !r.feedbackLoading && r.answer && (
                  <div className={`p-3 rounded-md text-base mb-2.5 ${theme === 'light' ? 'bg-blue-50' : 'bg-blue-500/10'}`}>
                    <span className={`font-medium ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Correct Answer: </span>
                    <span className={`${textColor} whitespace-pre-wrap`}>{r.answer}</span>
                  </div>
                )}

                {r.feedbackLoading && (
                  <div className={`mt-2.5 flex items-center text-sm ${textColor} opacity-80`}>
                    <SparklesIcon className={`w-4 h-4 mr-1.5 animate-pulse ${strongTextColor}`} />
                    <span>Getting AI Tutor feedback...</span>
                  </div>
                )}
                {r.aiFeedback && !r.feedbackLoading && (
                  <div className={`mt-2.5 p-3 rounded-md text-sm ${feedbackBgClass} border ${feedbackBorderClass}`}>
                    <p className={`font-semibold ${strongTextColor} mb-1`}>AI Tutor Feedback:</p>
                    <p className={`${textColor} whitespace-pre-wrap`}>{r.aiFeedback}</p>
                  </div>
                )}
              </div>
            ))}
            {/* Overall Feedback Section */}
            <div className={`p-4 sm:p-5 rounded-lg ${contentBgClass} border ${contentBorderClass}`}>
              <h4 className={`text-lg font-semibold ${strongTextColor} mb-2`}>Overall Coach Feedback for {userName || 'Learner'}</h4>
              {overallFeedbackLoading && (
                <div className={`flex items-center ${textColor} text-base`}>
                  <SparklesIcon className={`w-5 h-5 mr-2 animate-pulse ${strongTextColor}`} />
                  <span>Generating your personalized feedback...</span>
                </div>
              )}
              {overallFeedbackText && !overallFeedbackLoading && (
                <p className={`${textColor} text-base whitespace-pre-wrap`}>{overallFeedbackText}</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const modalTitle = quizData ? `Quiz: ${quizData.chapterName}` : "Quiz Configuration";
  const isLastQuestion = quizData && quizData.questions ? currentQuestionIndex === quizData.questions.length - 1 : false;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidthClass="max-w-3xl">
      <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
         {renderContent()}
      </div>
      <div className={`flex ${quizPhase === 'answering' ? 'justify-between' : 'justify-end'} items-center gap-3 pt-5 mt-1 border-t border-slate-200 dark:border-slate-700`}>
        {quizPhase === 'answering' && (
            <button
                onClick={handlePreviousQuestion}
                className={`w-auto ${secondaryButtonBg} font-semibold py-2.5 px-5 rounded-lg shadow-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 ${secondaryButtonFocusRing} focus:ring-offset-2 ${theme === 'light' ? 'focus:ring-offset-white' : `focus:ring-offset-slate-800`} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-base`}
                disabled={currentQuestionIndex === 0}
            >
                Previous
            </button>
        )}

        {quizPhase === 'answering' && (
          <button
            onClick={handleNextQuestion}
            className={`w-auto ${primaryButtonBg} text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 ${primaryButtonFocusRing} focus:ring-offset-2 ${theme === 'light' ? 'focus:ring-offset-white' : `focus:ring-offset-slate-800`} hover:scale-[1.03] disabled:opacity-60 disabled:cursor-not-allowed text-base`}
            disabled={!quizData || !quizData.questions || (userAnswers[currentQuestionIndex]?.trim() === '')}
          >
            {isLastQuestion ? "Submit Quiz & View Results" : "Next Question"}
          </button>
        )}
        
        {(quizPhase === 'results' || quizPhase === 'error_generating_questions' || quizPhase === 'loading_questions' || quizPhase === 'submitting_individual_feedback') && (
            <button
                type="button"
                onClick={() => {
                    if (quizPhase === 'results' || quizPhase === 'error_generating_questions') {
                         setQuizPhase('configuring_num_questions'); 
                         setOverallFeedbackText(null); 
                    } else {
                        onClose(); 
                    }
                }}
                className={`w-auto ${secondaryButtonBg} font-semibold py-2.5 px-5 rounded-lg shadow-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 ${secondaryButtonFocusRing} focus:ring-offset-2 ${theme === 'light' ? 'focus:ring-offset-white' : `focus:ring-offset-slate-800`} hover:opacity-90 text-base`}
                disabled={quizPhase === 'loading_questions' || quizPhase === 'submitting_individual_feedback'}
            >
                {(quizPhase === 'results' || quizPhase === 'error_generating_questions') ? 
                    <><ArrowUturnLeftIcon className="w-4 h-4 inline-block mr-1.5 -ml-1" /> New Quiz Config</> : 
                    'Cancel'
                }
            </button>
        )}

        {(quizPhase === 'results' || quizPhase === 'configuring_num_questions' || quizPhase === 'error_generating_questions') && (
             <button
                type="button"
                onClick={onClose}
                className={`w-auto ${primaryButtonBg} text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 ${primaryButtonFocusRing} focus:ring-offset-2 ${theme === 'light' ? 'focus:ring-offset-white' : `focus:ring-offset-slate-800`} hover:scale-[1.03] text-base`}
             >
                {quizPhase === 'results' ? 'Finish & Close' : 'Close'}
             </button>
        )}
      </div>
    </Modal>
  );
};

export default QuizModal;
