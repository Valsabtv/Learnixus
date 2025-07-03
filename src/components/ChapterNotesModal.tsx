import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useTheme } from '../contexts/ThemeContext';
import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';
import { ArrowUturnLeftIcon } from './IconComponents'; 

interface ChapterNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterName: string;
  currentNotes: string;
  onSaveNotes: (newNotes: string) => void;
}

const ChapterNotesModal: React.FC<ChapterNotesModalProps> = ({
  isOpen,
  onClose,
  chapterName,
  currentNotes,
  onSaveNotes,
}) => {
  const [notes, setNotes] = useState(currentNotes);
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setNotes(currentNotes); 
    }
  }, [isOpen, currentNotes]);

  const handleSave = () => {
    onSaveNotes(notes);
  };

  const handleClearNotes = () => {
    setNotes('');
  };

  const accentColorName = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[0] : DARK_ACCENT_COLOR.split('-')[0];
  const accentShade = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[1] || '500' : DARK_ACCENT_COLOR.split('-')[1] || '400';
  
  const labelColorClass = theme === 'light' ? 'text-slate-600' : 'text-slate-300';
  const textareaBgClass = theme === 'light' 
    ? 'bg-slate-50 border-slate-300 focus:ring-indigo-500 focus:border-indigo-500' 
    : 'bg-slate-700 border-slate-600 focus:ring-sky-500 focus:border-sky-500';
  const textareaTextColorClass = theme === 'light' ? 'text-slate-900 placeholder-slate-500' : 'text-slate-50 placeholder-slate-400'; // Improved placeholder contrast
  
  const saveButtonBgClass = `bg-gradient-to-r from-${accentColorName}-${accentShade} to-${accentColorName}-${parseInt(accentShade) + 100} hover:from-${accentColorName}-${parseInt(accentShade) + 100} hover:to-${accentColorName}-${parseInt(accentShade) + 200}`;
  const saveButtonFocusRing = `focus-visible:ring-${accentColorName}-${parseInt(accentShade) - 100 < 100 ? 100 : parseInt(accentShade) - 100}`;
  
  const secondaryButtonBgClass = theme === 'light' ? 'bg-slate-200 hover:bg-slate-300/80 text-slate-700' : 'bg-slate-600 hover:bg-slate-500/80 text-slate-200';
  const secondaryButtonFocusRing = theme === 'light' ? 'focus-visible:ring-slate-400' : 'focus-visible:ring-slate-500';


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detailed Notes: ${chapterName}`} maxWidthClass="max-w-2xl"> {/* Increased max-width */}
      <div className="space-y-6">
        <div>
          <label htmlFor="chapterNotes" className={`block text-sm font-medium ${labelColorClass} mb-1.5`}>
            Your Insights & Key Points for "{chapterName}"
          </label>
          <textarea
            id="chapterNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Capture your thoughts, summaries, and key takeaways for this chapter..."
            rows={10}
            className={`w-full border ${textareaBgClass} ${textareaTextColorClass} rounded-lg p-3.5 focus:ring-2 focus:outline-none transition-colors duration-200 ease-in-out shadow-sm text-sm sm:text-base resize-y leading-relaxed`}
            autoFocus
          />
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-3 pt-2">
            <button
                type="button"
                onClick={handleClearNotes}
                className={`w-full sm:w-auto px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ease-in-out shadow-sm focus:outline-none focus-visible:ring-2 ${secondaryButtonFocusRing} focus-visible:ring-offset-2 ${theme === 'light' ? 'focus-visible:ring-offset-white' : 'focus-visible:ring-offset-slate-800'} ${secondaryButtonBgClass} flex items-center justify-center gap-1.5 hover:opacity-90 disabled:opacity-50`}
                aria-label="Clear notes content"
                disabled={!notes}
            >
                <ArrowUturnLeftIcon className="w-4 h-4" />
                Clear
            </button>
            <div className="flex w-full sm:w-auto justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ease-in-out shadow-sm focus:outline-none focus-visible:ring-2 ${secondaryButtonFocusRing} focus-visible:ring-offset-2 ${theme === 'light' ? 'focus-visible:ring-offset-white' : 'focus-visible:ring-offset-slate-800'} ${secondaryButtonBgClass} flex-grow sm:flex-grow-0 hover:opacity-90`}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    className={`${saveButtonBgClass} text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 ${saveButtonFocusRing} focus-visible:ring-offset-2 ${theme === 'light' ? 'focus-visible:ring-offset-white' : 'focus-visible:ring-offset-slate-800'} flex-grow sm:flex-grow-0 hover:scale-[1.02] hover:-translate-y-px text-sm`}
                >
                    Save Notes
                </button>
            </div>
        </div>
      </div>
    </Modal>
  );
};

export default ChapterNotesModal;