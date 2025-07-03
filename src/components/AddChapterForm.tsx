import React, { useState } from 'react';
import { PlusIcon } from './IconComponents';
import { useTheme } from '../contexts/ThemeContext';
import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';

interface AddChapterFormProps {
  subjectId: string;
  onAddChapter: (subjectId: string, chapterName: string) => void;
  onClose: () => void;
}

const AddChapterForm: React.FC<AddChapterFormProps> = ({ subjectId, onAddChapter, onClose }) => {
  const [chapterName, setChapterName] = useState('');
  const { theme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chapterName.trim()) {
      onAddChapter(subjectId, chapterName.trim());
      setChapterName('');
      onClose();
    }
  };
  
  const accentColorName = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[0] : DARK_ACCENT_COLOR.split('-')[0];
  const accentShade = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[1] || '500' : DARK_ACCENT_COLOR.split('-')[1] || '400';
  
  const labelColorClass = theme === 'light' ? 'text-slate-600' : 'text-slate-300'; // Softer label
  const inputBgClass = theme === 'light' 
    ? 'bg-slate-50 border-slate-300 focus:ring-indigo-500 focus:border-indigo-500' 
    : 'bg-slate-700 border-slate-600 focus:ring-sky-500 focus:border-sky-500';
  const inputTextColorClass = theme === 'light' ? 'text-slate-900 placeholder-slate-400' : 'text-slate-50 placeholder-slate-500'; // Ensure placeholder contrast
  
  const buttonBgClass = `bg-gradient-to-r from-${accentColorName}-${accentShade} to-${accentColorName}-${parseInt(accentShade) + 100} hover:from-${accentColorName}-${parseInt(accentShade) + 100} hover:to-${accentColorName}-${parseInt(accentShade) + 200}`;
  const buttonFocusRing = `focus-visible:ring-${accentColorName}-${parseInt(accentShade) - 100 < 100 ? 100 : parseInt(accentShade) - 100}`;
  
  const cancelButtonBgClass = theme === 'light' ? 'bg-slate-200 hover:bg-slate-300/80 text-slate-700' : 'bg-slate-600 hover:bg-slate-500/80 text-slate-200';
  const cancelFocusRing = theme === 'light' ? 'focus-visible:ring-slate-400' : 'focus-visible:ring-slate-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="chapterName" className={`block text-sm font-medium ${labelColorClass} mb-1.5`}>
          Chapter Name
        </label>
        <input
          type="text"
          id="chapterName"
          value={chapterName}
          onChange={(e) => setChapterName(e.target.value)}
          placeholder="e.g., General Relativity"
          className={`w-full border ${inputBgClass} ${inputTextColorClass} rounded-lg p-3.5 focus:ring-2 focus:outline-none transition-colors duration-200 ease-in-out shadow-sm text-base`}
          autoFocus
        />
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
         <button
            type="button"
            onClick={onClose}
            className={`w-full sm:w-auto px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ease-in-out shadow-sm focus:outline-none focus-visible:ring-2 ${cancelFocusRing} focus-visible:ring-offset-2 ${theme === 'light' ? 'focus-visible:ring-offset-white' : 'focus-visible:ring-offset-slate-800'} ${cancelButtonBgClass} hover:opacity-90`}
        >
            Cancel
        </button>
        <button
          type="submit"
          className={`w-full sm:w-auto ${buttonBgClass} text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 ${buttonFocusRing} focus-visible:ring-offset-2 ${theme === 'light' ? 'focus-visible:ring-offset-white' : 'focus-visible:ring-offset-slate-800'} hover:scale-[1.02] hover:-translate-y-px text-sm`}
          disabled={!chapterName.trim()}
        >
          <PlusIcon className="w-5 h-5" />
          Create Chapter
        </button>
      </div>
    </form>
  );
};

export default AddChapterForm;