
import React, { useState, useCallback } from 'react';
import Modal from './Modal';
import { useTheme } from '../contexts/ThemeContext';
import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';
import { QuestionMarkCircleIcon, SparklesIcon, ExclamationTriangleIcon, ArrowUturnLeftIcon } from './IconComponents';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterName: string;
  subjectName: string;
  userStudyLevel: string;
  userName: string;
  ai: GoogleGenAI;
}

const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  isOpen,
  onClose,
  chapterName,
  subjectName,
  userStudyLevel,
  userName,
  ai,
}) => {
  const { theme } = useTheme();
  const [userQuestion, setUserQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accentColor = theme === 'light' ? LIGHT_ACCENT_COLOR : DARK_ACCENT_COLOR;
  const textColor = theme === 'light' ? 'text-slate-700' : 'text-slate-300';
  const strongTextColor = theme === 'light' ? `text-${accentColor}-600` : `text-${accentColor}-400`;
  const errorColor = theme === 'light' ? 'text-red-600' : 'text-red-400';
  const inputBgClass = theme === 'light' ? 'bg-white border-slate-300 focus:ring-indigo-500 focus:border-indigo-500' : 'bg-slate-600 border-slate-500 focus:ring-sky-500 focus:border-sky-500';
  const inputTextColor = theme === 'light' ? 'text-slate-900' : 'text-slate-50';
  const buttonBgClass = `bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-600 hover:from-${accentColor}-600 hover:to-${accentColor}-700`;
  const buttonFocusRing = `focus:ring-${accentColor}-300`;
  const secondaryButtonBg = theme === 'light' ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-600 hover:bg-slate-500 text-slate-200';
  const secondaryButtonFocusRing = theme === 'light' ? 'focus:ring-slate-400' : 'focus:ring-slate-500';
  const answerBgClass = theme === 'light' ? 'bg-slate-50' : 'bg-slate-700/60';
  const answerBorderClass = theme === 'light' ? `border-slate-200` : `border-slate-600/70`;
  const errorBgColor = theme === 'light' ? 'bg-red-50' : 'bg-red-500/10';
  const errorBorderColor = theme === 'light' ? 'border-red-300' : 'border-red-500';


  const handleAskQuestion = useCallback(async () => {
    if (!userQuestion.trim()) {
      setError("Please enter a question.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAiAnswer(null);

    try {
      const prompt = `
        You are a helpful AI Tutor for a student named ${userName || 'Learner'}.
        The student is studying "${subjectName}" at the "${userStudyLevel}" level and has a question about the chapter titled "${chapterName}".

        Student's Question: "${userQuestion}"

        Please provide a clear, concise, and accurate answer suitable for the student's study level.
        - Answer in plain text.
        - Do not use Markdown.
        - Explain concepts step-by-step if necessary.
        - If the question is too vague, ambiguous, or outside the scope of the chapter/subject, politely state that you need more specific information or that it's outside the current topic.
        - Keep the tone friendly and encouraging.
      `;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
      });
      
      if (response.text) {
        setAiAnswer(response.text);
      } else {
        setError("The AI didn't provide an answer. Please try rephrasing your question or try again later.");
      }
    } catch (err) {
      console.error("Error fetching AI answer:", err);
       if (err instanceof Error && (err.message.includes("API key not valid") || err.message.includes("API_KEY_INVALID"))){
        setError("AI features are currently unavailable. The API key is invalid or missing.");
      } else {
        setError("An error occurred while getting an answer. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [ai, userName, userStudyLevel, chapterName, subjectName, userQuestion]);

  const handleCloseAndReset = () => {
    setUserQuestion('');
    setAiAnswer(null);
    setError(null);
    setIsLoading(false);
    onClose();
  };
  
  const handleClearInput = () => {
    setUserQuestion('');
    setAiAnswer(null); // Also clear previous answer if input is cleared
    setError(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseAndReset} title={`Ask about: ${chapterName}`} maxWidthClass="max-w-2xl">
      <div className="space-y-4">
        <div>
          <label htmlFor="userQuestion" className={`block text-sm font-medium ${textColor} mb-1.5`}>
            Your Question for {userName || 'Learner'}:
          </label>
          <textarea
            id="userQuestion"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            rows={4}
            className={`w-full p-3 border rounded-md ${inputBgClass} ${inputTextColor} focus:ring-2 focus:outline-none text-sm sm:text-base shadow-sm resize-y`}
            placeholder={`Ask anything about "${chapterName}"...`}
            aria-label="Your question"
          />
        </div>

        {error && (
           <div className={`p-3 rounded-md ${errorBgColor} border ${errorBorderColor} text-sm ${errorColor} flex items-start gap-2`}>
            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isLoading && (
          <div className={`flex items-center justify-center p-4 rounded-md ${answerBgClass} border ${answerBorderClass}`}>
            <SparklesIcon className={`w-6 h-6 mr-2 animate-pulse ${strongTextColor}`} />
            <p className={`${textColor} text-sm`}>Thinking...</p>
          </div>
        )}

        {aiAnswer && !isLoading && (
          <div className={`p-3 sm:p-4 rounded-md ${answerBgClass} border ${answerBorderClass} max-h-60 overflow-y-auto custom-scrollbar`}>
            <h3 className={`text-sm font-semibold ${strongTextColor} mb-1.5`}>AI Tutor's Answer:</h3>
            <p className={`${textColor} text-sm sm:text-base whitespace-pre-wrap`}>{aiAnswer}</p>
          </div>
        )}
        
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
                type="button"
                onClick={handleClearInput}
                className={`w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ease-in-out shadow-sm focus:outline-none focus:ring-2 ${secondaryButtonFocusRing} focus:ring-offset-2 ${theme === 'light' ? 'focus:ring-offset-white' : `focus:ring-offset-slate-800`} ${secondaryButtonBg} flex items-center justify-center gap-1.5 hover:opacity-90`}
                disabled={!userQuestion || isLoading}
            >
                 <ArrowUturnLeftIcon className="w-4 h-4" /> Clear Input
            </button>
            <div className="flex w-full sm:w-auto justify-end gap-3">
                <button
                    type="button"
                    onClick={handleCloseAndReset}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ease-in-out shadow-sm focus:outline-none focus:ring-2 ${secondaryButtonFocusRing} focus:ring-offset-2 ${theme === 'light' ? 'focus:ring-offset-white' : `focus:ring-offset-slate-800`} ${secondaryButtonBg} flex-grow sm:flex-grow-0 hover:opacity-90`}
                >
                    Close
                </button>
                <button
                    onClick={handleAskQuestion}
                    disabled={isLoading || !userQuestion.trim()}
                    className={`${buttonBgClass} text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 ${buttonFocusRing} focus:ring-offset-2 ${theme === 'light' ? 'focus:ring-offset-white' : `focus:ring-offset-slate-800`} flex-grow sm:flex-grow-0 hover:scale-[1.03] disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                    {isLoading ? (
                        <>
                        <SparklesIcon className="w-4 h-4 animate-spin" /> Asking...
                        </>
                    ) : (
                        <>
                        <QuestionMarkCircleIcon className="w-4 h-4" /> Ask AI
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>
    </Modal>
  );
};

export default AskQuestionModal;
