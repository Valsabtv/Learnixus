
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { APP_NAME, LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';

interface FarewellPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const FarewellPopup: React.FC<FarewellPopupProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();

  const cardBg = theme === 'light' ? 'bg-white' : 'bg-slate-800';
  const textColor = theme === 'light' ? 'text-slate-700' : 'text-slate-200';
  const accentColor = theme === 'light' ? LIGHT_ACCENT_COLOR : DARK_ACCENT_COLOR;
  const buttonBgClass = `bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-600 hover:from-${accentColor}-600 hover:to-${accentColor}-700`;
  const buttonFocusRing = `focus:ring-${accentColor}-300`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className={`relative ${cardBg} p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-sm text-center`}>
        <h2 className={`text-2xl font-bold mb-4 ${textColor}`}>Good luck!</h2>
        <p className={`${textColor} mb-6`}>We hope to see you again soon.</p>
        <button
          onClick={onClose}
          className={`w-full ${buttonBgClass} text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 ${buttonFocusRing} focus:ring-offset-2`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default FarewellPopup;
