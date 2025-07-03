

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext'; // To sync theme
import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR, APP_NAME } from '../constants';

const LOCAL_STORAGE_POMODORO_STATE_KEY = 'learnixusPomodoroState';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
}
interface PomodoroStateForMiniTimer extends PomodoroSettings {
  timeLeft: number;
  isActive: boolean;
  mode: TimerMode;
  pomodoroCount: number;
  theme: 'light' | 'dark'; // Theme information
}

const MiniTimer: React.FC = () => {
  const { theme: currentDocumentTheme, toggleTheme: currentDocumentToggleTheme } = useTheme(); // from mini-timer document context
  const [displayState, setDisplayState] = useState<PomodoroStateForMiniTimer | null>(null);
  const [internalTimeLeft, setInternalTimeLeft] = useState<number | null>(null);

  const loadStateFromStorage = useCallback(() => {
    const storedStateRaw = localStorage.getItem(LOCAL_STORAGE_POMODORO_STATE_KEY);
    if (storedStateRaw) {
      try {
        const newState = JSON.parse(storedStateRaw) as PomodoroStateForMiniTimer;
        setDisplayState(newState);
        setInternalTimeLeft(newState.timeLeft);
        
        // Apply theme from main window
        const root = window.document.documentElement;
        if (newState.theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        // If ThemeContext's theme doesn't match, toggle it (careful with infinite loops if not managed)
        // This is a bit hacky; ideally ThemeProvider in mini-timer-entry would handle this if localStorage was its source too.
        // For now, direct DOM manipulation for theme.
        
      } catch (e) {
        console.error("Error parsing mini timer state from localStorage", e);
        setDisplayState(null);
      }
    }
  }, []);

  useEffect(() => {
    loadStateFromStorage(); // Initial load

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_POMODORO_STATE_KEY) {
        loadStateFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadStateFromStorage]);

  useEffect(() => {
    let intervalId: number | null = null;
    if (displayState?.isActive && internalTimeLeft !== null && internalTimeLeft > 0) {
      document.title = `${formatTime(internalTimeLeft)} - ${modeText(displayState.mode)} - ${APP_NAME}`;
      intervalId = window.setInterval(() => {
        setInternalTimeLeft(prev => (prev !== null ? prev - 1 : 0));
      }, 1000);
    } else if (internalTimeLeft === 0) {
       document.title = `Finished! - ${displayState ? modeText(displayState.mode) : ''} - ${APP_NAME}`;
    } else {
       document.title = `Timer - ${APP_NAME}`; // Default title when paused or inactive
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [displayState, internalTimeLeft]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const modeText = (currentMode: TimerMode): string => {
    switch (currentMode) {
      case 'work': return 'Focus';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
      default: return 'Focus';
    }
  };

  if (!displayState) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 p-2 text-center text-xs">
        Waiting for main timer data...
      </div>
    );
  }
  
  // Use the theme from displayState for styling, not the mini-window's own ThemeContext directly for dynamic parts.
  const miniTheme = displayState.theme;
  const accentColor = miniTheme === 'light' ? LIGHT_ACCENT_COLOR : DARK_ACCENT_COLOR;
  
  const bgColor = miniTheme === 'light' ? 'bg-slate-50' : 'bg-slate-800';
  const textColor = miniTheme === 'light' ? 'text-slate-800' : 'text-slate-100';
  const modeColor = miniTheme === 'light' ? `text-${accentColor}-600` : `text-${accentColor}-400`;
  const borderColor = miniTheme === 'light' ? `border-${accentColor}-300` : `border-${accentColor}-600`;

  // Adjusting padding and font sizes for a very small window
  return (
    <div className={`flex flex-col items-center justify-center h-screen p-3 ${bgColor} ${textColor} border-2 ${borderColor} rounded-md`}>
      <div className={`text-xs font-semibold mb-1 ${modeColor}`}>
        {modeText(displayState.mode)} {displayState.isActive ? '' : '(Paused)'}
      </div>
      <div className="text-5xl font-bold tabular-nums">
        {internalTimeLeft !== null ? formatTime(internalTimeLeft) : '--:--'}
      </div>
      <div className="text-xs mt-1">
        Pomodoros: {displayState.pomodoroCount}
      </div>
    </div>
  );
};

export default MiniTimer;