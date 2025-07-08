
import React, { useState } from 'react';
import { APP_NAME } from '../constants';
import { BookOpenIcon } from './IconComponents';

interface OpeningPageProps {
  onExitAnimationComplete: () => void;
}

const OpeningPage: React.FC<OpeningPageProps> = ({ onExitAnimationComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    if (!isExiting) {
      setIsExiting(true);
    }
  };

  const handleAnimationEnd = () => {
    if (isExiting) {
      onExitAnimationComplete();
    }
  };

  return (
    <div
      className={`
        fixed inset-0 
        bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100
        dark:from-slate-900 dark:via-sky-900/70 dark:to-indigo-900/70
        amoled:from-black amoled:via-gray-950 amoled:to-gray-900
        flex flex-col items-center justify-center text-center p-6 sm:p-8 
        cursor-pointer group 
        ${isExiting ? 'animate-fadeOut' : 'animate-fadeIn'}
      `}
      onClick={handleEnter}
      onAnimationEnd={handleAnimationEnd}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleEnter(); }}
      aria-label={`Welcome to ${APP_NAME}. Click or press Enter to begin your learning adventure.`}
    >
      <BookOpenIcon 
        className="
          w-24 h-24 sm:w-32 md:w-40 md:h-40
          text-sky-500 dark:text-sky-400 amoled:text-sky-300
          group-hover:text-sky-600 dark:group-hover:text-sky-300 amoled:group-hover:text-sky-200
          group-hover:scale-110 mb-6 sm:mb-8 
          transition-all duration-500 ease-out transform-gpu
        " 
      />
      <h1 
        className="
          text-5xl sm:text-6xl md:text-7xl font-extrabold 
          text-slate-800 dark:text-slate-50 amoled:text-gray-100
          mb-3 sm:mb-4 tracking-tighter
        "
      >
        {APP_NAME}
      </h1>
      <p 
        className="
          text-lg sm:text-xl md:text-2xl 
          text-slate-600 dark:text-slate-300 amoled:text-gray-400
          animate-pulseSlow font-medium
        "
      >
        Tap or Press Enter to Begin
      </p>
    </div>
  );
};

export default OpeningPage;