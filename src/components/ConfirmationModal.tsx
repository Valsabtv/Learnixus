import React from 'react';
import Modal from './Modal';
import { useTheme } from '../contexts/ThemeContext';
import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR, APP_NAME } from '../constants';
import { ExclamationTriangleIcon } from './IconComponents';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isDestructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm Action',
  cancelButtonText = 'Cancel',
  isDestructive = false,
}) => {
  const { theme } = useTheme();
  const accentColorName = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[0] : DARK_ACCENT_COLOR.split('-')[0];

  const destructiveButtonBgClass = 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700';
  const destructiveButtonFocusRing = 'focus:ring-red-400 dark:focus:ring-red-500';
  
  const defaultConfirmButtonBgClass = `bg-gradient-to-r from-${accentColorName}-500 to-${accentColorName}-600 hover:from-${accentColorName}-600 hover:to-${accentColorName}-700`;
  const defaultConfirmButtonFocusRing = `focus:ring-${accentColorName}-400`;

  const confirmButtonClass = isDestructive ? destructiveButtonBgClass : defaultConfirmButtonBgClass;
  const confirmFocusRingClass = isDestructive ? destructiveButtonFocusRing : defaultConfirmButtonFocusRing;

  const cancelButtonBgClass = theme === 'light' ? 'bg-slate-200 hover:bg-slate-300/80 text-slate-700' : 'bg-slate-600 hover:bg-slate-500/80 text-slate-200';
  const cancelFocusRing = theme === 'light' ? 'focus:ring-slate-400' : 'focus:ring-slate-500';

  const messageColorClass = theme === 'light' ? 'text-slate-600' : 'text-slate-300';
  const iconColorClass = isDestructive ? (theme === 'light' ? 'text-red-500' : 'text-red-400') : (theme === 'light' ? `text-${accentColorName}-500` : `text-${accentColorName}-400`);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-5 sm:space-y-6">
        <div className="flex items-start gap-3 sm:gap-4">
            <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${isDestructive ? (theme === 'light' ? 'bg-red-100' : 'bg-red-900/40') : (theme === 'light' ? `bg-${accentColorName}-100` : `bg-${accentColorName}-900/40`)}`}>
                <ExclamationTriangleIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColorClass}`} />
            </div>
            <p className={`text-sm sm:text-base ${messageColorClass} mt-0.5 sm:mt-1 leading-relaxed`}>{message}</p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className={`w-full sm:w-auto px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ease-in-out shadow-sm focus:outline-none focus:ring-2 ${cancelFocusRing} focus:ring-offset-2 ${theme === 'light' ? 'focus:ring-offset-white' : `focus:ring-offset-slate-800`} ${cancelButtonBgClass} hover:opacity-85`}
          >
            {cancelButtonText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`w-full sm:w-auto ${confirmButtonClass} text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out flex items-center justify-center gap-2 focus:outline-none focus:ring-2 ${confirmFocusRingClass} focus:ring-offset-2 ${theme === 'light' ? 'focus:ring-offset-white' : `focus:ring-offset-slate-800`} hover:scale-[1.02] hover:-translate-y-px text-sm`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;