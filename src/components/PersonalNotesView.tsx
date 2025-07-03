import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';
import { ArrowUturnLeftIcon } from './IconComponents'; 

interface PersonalNotesViewProps {
  initialNotes: string;
  onSaveNotes: (notes: string) => void;
}

const PersonalNotesView: React.FC<PersonalNotesViewProps> = ({ initialNotes, onSaveNotes }) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaved, setIsSaved] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setNotes(initialNotes);
    setHasChanged(false); 
  }, [initialNotes]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    if (!hasChanged) setHasChanged(true);
    if (isSaved) setIsSaved(false); 
  };
  
  const handleSave = () => {
    onSaveNotes(notes);
    setIsSaved(true);
    setHasChanged(false);
    setTimeout(() => setIsSaved(false), 3000); 
  };

  const handleClearNotes = () => {
    setNotes('');
    if (!hasChanged) setHasChanged(true);
    if (isSaved) setIsSaved(false);
  };

  const accentColorName = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[0] : DARK_ACCENT_COLOR.split('-')[0];
  const accentShade = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[1] || '500' : DARK_ACCENT_COLOR.split('-')[1] || '400';
  
  const mainBgClass = theme === 'light' ? 'bg-slate-100' : 'bg-slate-900'; // Consistent with Layout.tsx
  const textareaBgClass = theme === 'light' 
    ? 'bg-white border-slate-300 focus:ring-indigo-500 focus:border-indigo-500' 
    : 'bg-slate-800 border-slate-700 focus:ring-sky-500 focus:border-sky-500'; // Ensure border contrast
  const textareaTextColorClass = theme === 'light' ? 'text-slate-800 placeholder-slate-500' : 'text-slate-100 placeholder-slate-400'; // Ensure text and placeholder contrast
  
  const saveButtonBgClass = `bg-gradient-to-r from-${accentColorName}-${accentShade} to-${accentColorName}-${parseInt(accentShade) + 100} hover:from-${accentColorName}-${parseInt(accentShade) + 100} hover:to-${accentColorName}-${parseInt(accentShade) + 200}`;
  const saveButtonFocusRing = `focus-visible:ring-${accentColorName}-${parseInt(accentShade) - 100 < 100 ? 100 : parseInt(accentShade) - 100}`;
  const savedMessageColor = theme === 'light' ? `text-${accentColorName}-600` : `text-${accentColorName}-300`; // Better contrast for dark theme

  const secondaryButtonBgClass = theme === 'light' ? 'bg-slate-200 hover:bg-slate-300/80 text-slate-700' : 'bg-slate-700 hover:bg-slate-600/80 text-slate-200'; // Ensure text contrast
  const secondaryButtonFocusRing = theme === 'light' ? 'focus-visible:ring-slate-400' : 'focus-visible:ring-slate-500';


  return (
    <div className={`h-full flex flex-col p-4 sm:p-6 lg:p-8 ${mainBgClass} transition-colors duration-300`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5">
        {isSaved && (
            <span className={`text-sm font-medium ${savedMessageColor} transition-opacity duration-300 ease-in-out order-last sm:order-first animate-fadeIn`}>
                Notes Saved Successfully!
            </span>
        )}
      </div>
      <textarea
        value={notes}
        onChange={handleNotesChange}
        placeholder="Jot down your thoughts, ideas, or quick notes here..."
        className={`w-full flex-grow p-4 sm:p-5 border rounded-xl shadow-lg resize-none ${textareaBgClass} ${textareaTextColorClass} focus:ring-2 focus:outline-none transition-colors duration-200 ease-in-out text-base leading-relaxed`}
        aria-label="Personal Notes Area"
      />
      <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row justify-end items-center gap-3">
        <button
            type="button"
            onClick={handleClearNotes}
            className={`w-full sm:w-auto px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ease-in-out shadow-sm focus:outline-none focus-visible:ring-2 ${secondaryButtonFocusRing} focus-visible:ring-offset-2 ${theme === 'light' ? `focus-visible:ring-offset-slate-100` : `focus-visible:ring-offset-slate-900`} ${secondaryButtonBgClass} flex items-center justify-center gap-2 order-2 sm:order-1 hover:opacity-90 disabled:opacity-50`}
            aria-label="Clear notes content"
            disabled={!notes && !hasChanged}
        >
            <ArrowUturnLeftIcon className="w-4 h-4" />
            Clear Notes
        </button>
        <button
          onClick={handleSave}
          className={`${saveButtonBgClass} text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out flex items-center justify-center gap-2 text-sm sm:text-base focus:outline-none focus-visible:ring-2 ${saveButtonFocusRing} focus-visible:ring-offset-2 ${theme === 'light' ? `focus-visible:ring-offset-slate-100` : `focus-visible:ring-offset-slate-900`} w-full sm:w-auto order-1 sm:order-2 hover:scale-[1.02] hover:-translate-y-px disabled:opacity-60`}
          disabled={!hasChanged || isSaved}
        >
          Save My Notes
        </button>
      </div>
    </div>
  );
};
export default PersonalNotesView;