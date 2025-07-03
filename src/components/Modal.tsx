import React, { ReactNode, useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidthClass?: string; 
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidthClass = 'max-w-xl' }) => {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden'; 
      document.addEventListener('keydown', handleEsc);
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, 10); 

      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleEsc);
        clearTimeout(timer);
      };
    } else {
      const timer = setTimeout(() => {
         setIsMounted(false);
         document.body.style.overflow = 'auto'; 
      }, 300); // Match animation duration
      document.removeEventListener('keydown', handleEsc);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen && !isMounted) {
    return null;
  }
  
  const accentColorName = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[0] : DARK_ACCENT_COLOR.split('-')[0];
  const accentShade = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[1] || '500' : DARK_ACCENT_COLOR.split('-')[1] || '400';

  const overlayBgClass = theme === 'light' ? 'bg-slate-500' : 'bg-slate-900'; 
  const modalBgClass = theme === 'light' ? 'bg-white' : 'bg-slate-800';
  const titleColorClass = theme === 'light' ? 'text-slate-800' : 'text-slate-100'; // Ensured contrast
  const closeButtonColorClass = theme === 'light' ? 'text-slate-500 hover:text-slate-700' : 'text-slate-400 hover:text-slate-200'; // Ensured contrast
  const modalBorderClass = theme === 'light' ? 'border-slate-200' : 'border-slate-700';


  return (
    <div
      className={`fixed inset-0 ${overlayBgClass} flex items-center justify-center z-[60] p-4 sm:p-6 transition-all duration-300 ease-in-out ${
        isMounted && isOpen ? 'bg-opacity-50 dark:bg-opacity-60 opacity-100 backdrop-blur-sm' : 'bg-opacity-0 opacity-0 backdrop-blur-none'
      }`}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`${modalBgClass} p-6 sm:p-8 rounded-2xl shadow-xl w-full ${maxWidthClass} border ${modalBorderClass} transform transition-all duration-300 ease-in-out ${
          isMounted && isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5 sm:mb-6">
          <h2 className={`text-xl sm:text-2xl font-semibold ${titleColorClass}`}>{title}</h2>
          <button
            onClick={onClose}
            className={`${closeButtonColorClass} p-1.5 rounded-full -mr-1.5 -mt-1.5 focus:outline-none focus-visible:ring-2 ${theme === 'light' ? `focus-visible:ring-${accentColorName}-${accentShade}` : `focus-visible:ring-${accentColorName}-${accentShade}`} transform-gpu transition-all duration-200 ease-in-out hover:bg-slate-100 dark:hover:bg-slate-700/70 hover:scale-110`}
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;