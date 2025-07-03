
import React, { useState, useCallback } from 'react';
import Modal from './Modal';
import { useTheme } from '../contexts/ThemeContext';
import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR, APP_NAME } from '../constants';
import { ChatBubbleOvalLeftEllipsisIcon, SparklesIcon, ExclamationTriangleIcon, LightbulbIcon, BookOpenIcon } from './IconComponents';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { FeelingAIResponse, EasyChapterSuggestion, FeelingActionHint } from '../types';

interface FeelingCheckModalProps {
  isOpen: boolean;
  onClose: (feelingSubmitted?: boolean) => void;
  userName: string;
  ai: GoogleGenAI | null;
  onFeelingSubmit: (feelingText: string, aiResponseHandler: (aiRes: FeelingAIResponse | null, error?: string) => void) => void;
  easyChapterSuggestions: EasyChapterSuggestion[];
  onNavigateToChapter: (subjectId: string, chapterId: string, subjectName: string, chapterName: string) => void;
}

const FeelingCheckModal: React.FC<FeelingCheckModalProps> = ({
  isOpen,
  onClose,
  userName,
  ai,
  onFeelingSubmit,
  easyChapterSuggestions,
  onNavigateToChapter,
}) => {
  const { theme } = useTheme();
  const [userFeeling, setUserFeeling] = useState('');
  const [aiGeneratedResponse, setAiGeneratedResponse] = useState<FeelingAIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feelingSubmittedThisSession, setFeelingSubmittedThisSession] = useState(false);


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
  const responseBgClass = theme === 'light' ? 'bg-slate-50' : 'bg-slate-700/60';
  const responseBorderClass = theme === 'light' ? `border-slate-200` : `border-slate-600/70`;
  const errorBgColor = theme === 'light' ? 'bg-red-50' : 'bg-red-500/10';
  const errorBorderColor = theme === 'light' ? 'border-red-300' : 'border-red-500';
  const suggestionCardBg = theme === 'light' ? 'bg-indigo-50 hover:bg-indigo-100' : 'bg-sky-500/10 hover:bg-sky-500/20';
  const suggestionCardBorder = theme === 'light' ? 'border-indigo-200' : 'border-sky-700';
  const suggestionTitleColor = theme === 'light' ? 'text-indigo-700' : 'text-sky-300';
  const suggestionTextColor = theme === 'light' ? 'text-indigo-600' : 'text-sky-400';


  const handleInternalSubmit = () => {
    if (!userFeeling.trim() && ai) {
      setError("Please share how you're feeling.");
      return;
    }
    if (!ai) {
        setAiGeneratedResponse({ responseText: `It's completely okay to feel how you do, ${userName}. AI insights are unavailable, but remember to be kind to yourself. If you're up for it, maybe try a chapter you enjoy?`, actionHint: 'none'});
        setFeelingSubmittedThisSession(true);
        return;
    }

    setIsLoading(true);
    setError(null);
    setAiGeneratedResponse(null);

    onFeelingSubmit(userFeeling, (aiRes, err) => {
        setIsLoading(false);
        if (err) {
            setError(err);
        } else if (aiRes) {
            setAiGeneratedResponse(aiRes);
            setFeelingSubmittedThisSession(true);
        } else {
             setError("Couldn't get a response. Please try again.");
        }
    });
  };

  const handleCloseModal = () => {
    setUserFeeling('');
    setAiGeneratedResponse(null);
    setError(null);
    setIsLoading(false);
    onClose(feelingSubmittedThisSession); 
    setFeelingSubmittedThisSession(false); // Reset for next modal opening
  };
  
  const handleTakeBreak = () => {
    // For now, this just closes the modal. Could be extended.
    handleCloseModal();
  };

  const handleChapterSuggestionClick = (suggestion: EasyChapterSuggestion) => {
    onNavigateToChapter(suggestion.subjectId, suggestion.chapterId, suggestion.subjectName, suggestion.chapterName);
    handleCloseModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title={`Daily Check-in`} maxWidthClass="max-w-lg">
      <div className="space-y-4">
        {!aiGeneratedResponse && !isLoading && !error && (
            <>
                <div className="flex items-center gap-3 mb-2">
                    <ChatBubbleOvalLeftEllipsisIcon className={`w-8 h-8 ${strongTextColor}`} />
                    <p className={`${textColor} text-base`}>
                        Hi {userName}, how are you feeling today?
                    </p>
                </div>
                <textarea
                    id="userFeeling"
                    value={userFeeling}
                    onChange={(e) => setUserFeeling(e.target.value)}
                    rows={3}
                    className={`w-full p-3 border rounded-md ${inputBgClass} ${inputTextColor} focus:ring-2 focus:outline-none text-sm shadow-sm resize-y`}
                    placeholder="Share a few words about your mood or energy levels..."
                    aria-label="Your feeling"
                    disabled={isLoading}
                />
            </>
        )}

        {isLoading && (
          <div className={`flex items-center justify-center p-6 rounded-md ${responseBgClass} border ${responseBorderClass}`}>
            <SparklesIcon className={`w-7 h-7 mr-2.5 animate-pulse ${strongTextColor}`} />
            <p className={`${textColor} text-sm`}>Crafting a thoughtful response...</p>
          </div>
        )}

        {error && !isLoading && (
           <div className={`p-3.5 rounded-md ${errorBgColor} border ${errorBorderColor} text-sm ${errorColor} flex items-start gap-2.5`}>
            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {aiGeneratedResponse && !isLoading && (
          <div className={`p-3.5 sm:p-4 rounded-md ${responseBgClass} border ${responseBorderClass} space-y-3`}>
            <div className="flex items-center gap-2">
                 <LightbulbIcon className={`w-6 h-6 ${strongTextColor}`} />
                 <h3 className={`text-sm font-semibold ${strongTextColor}`}>A Note from Your AI Companion:</h3>
            </div>
            <p className={`${textColor} text-sm whitespace-pre-wrap`}>{aiGeneratedResponse.responseText}</p>

            {aiGeneratedResponse.actionHint === 'suggest_easy_chapter' && easyChapterSuggestions.length > 0 && (
              <div className="pt-2">
                <p className={`${textColor} text-sm font-medium mb-2`}>Feeling a bit stuck? Maybe one of these could be a gentle start:</p>
                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                  {easyChapterSuggestions.map(sugg => (
                    <button 
                      key={sugg.chapterId} 
                      onClick={() => handleChapterSuggestionClick(sugg)}
                      className={`w-full text-left p-2.5 rounded-md border ${suggestionCardBorder} ${suggestionCardBg} transition-all duration-150 ease-in-out`}
                    >
                      <div className="flex items-center gap-2">
                        <div style={{ backgroundColor: sugg.subjectColor.startsWith('bg-') ? undefined : sugg.subjectColor }} className={`w-2.5 h-2.5 rounded-full ${sugg.subjectColor.startsWith('bg-') ? sugg.subjectColor : ''} flex-shrink-0`}></div>
                        <div>
                            <span className={`block text-xs font-semibold ${suggestionTitleColor}`}>{sugg.chapterName}</span>
                            <span className={`block text-2xs ${suggestionTextColor}`}>from {sugg.subjectName}</span>
                        </div>
                        <BookOpenIcon className={`w-4 h-4 ml-auto ${suggestionTextColor} opacity-70`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            {!aiGeneratedResponse && !isLoading && (
                 <button
                    type="button"
                    onClick={handleCloseModal}
                    className={`w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all ${secondaryButtonBg} ${secondaryButtonFocusRing} focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90`}
                >
                    Maybe Later
                </button>
            )}
           
            {aiGeneratedResponse?.actionHint === 'take_break' && !isLoading && (
                <button
                    onClick={handleTakeBreak}
                    className={`w-full sm:w-auto ${secondaryButtonBg} font-semibold py-2 px-4 rounded-lg shadow-sm hover:opacity-90 transition-all focus:outline-none focus:ring-2 ${secondaryButtonFocusRing} focus:ring-offset-2`}
                >
                    Okay, I'll Take a Break
                </button>
            )}

            {!aiGeneratedResponse && !isLoading ? (
                <button
                    onClick={handleInternalSubmit}
                    disabled={isLoading || !userFeeling.trim()}
                    className={`w-full sm:w-auto ${buttonBgClass} text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 ${buttonFocusRing} focus:ring-offset-2 disabled:opacity-70`}
                >
                    Share Feeling
                </button>
            ) : (
                 <button
                    type="button"
                    onClick={handleCloseModal}
                    className={`w-full sm:w-auto ${buttonBgClass} text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 ${buttonFocusRing} focus:ring-offset-2`}
                >
                    Got it, Close
                </button>
            )}
        </div>
      </div>
    </Modal>
  );
};

export default FeelingCheckModal;
