

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR, APP_NAME } from '../constants';
import { PlayIcon, PauseIcon, ArrowPathIcon, Cog6ToothIcon, XIcon } from './IconComponents';
import useLocalStorage from '../hooks/useLocalStorage';
import useUserData from '../hooks/useUserData';
import { useNotification } from '../contexts/NotificationContext'; 

const POMODOROS_UNTIL_LONG_BREAK = 4;
const LOCAL_STORAGE_POMODORO_STATE_KEY = 'learnixusPomodoroState';

interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
}

interface PomodoroStateForMiniTimer extends PomodoroSettings {
  timeLeft: number; // in seconds
  isActive: boolean;
  mode: TimerMode;
  pomodoroCount: number;
  theme: 'light' | 'dark';
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroTimerProps {
  isDashboardActive: boolean;
  userName: string;
  onLogPomodoroActivity: (durationInMinutes: number) => void; 
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ isDashboardActive, userName, onLogPomodoroActivity }) => {
  const { theme } = useTheme();
  const { addNotification } = useNotification(); 
  const accentColorName = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[0] : DARK_ACCENT_COLOR.split('-')[0];

  const [settings, setSettings] = useUserData<PomodoroSettings>('learnixusPomodoroSettings', {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
  });

  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const miniTimerWindowRef = useRef<Window | null>(null);
  const originalDocTitleRef = useRef<string>(document.title);

  const updateTimerStateInLocalStorage = useCallback(() => {
    const stateForMiniTimer: PomodoroStateForMiniTimer = {
      ...settings,
      timeLeft,
      isActive,
      mode,
      pomodoroCount,
      theme,
    };
    localStorage.setItem(LOCAL_STORAGE_POMODORO_STATE_KEY, JSON.stringify(stateForMiniTimer));
  }, [settings, timeLeft, isActive, mode, pomodoroCount, theme]);
  
  const resetTimer = useCallback((newMode?: TimerMode, resetCount = false) => {
    setIsActive(false);
    const targetMode = newMode || mode;
    if (resetCount) setPomodoroCount(0);

    let newTimeLeft;
    switch (targetMode) {
      case 'work':
        newTimeLeft = settings.workDuration * 60;
        break;
      case 'shortBreak':
        newTimeLeft = settings.shortBreakDuration * 60;
        break;
      case 'longBreak':
        newTimeLeft = settings.longBreakDuration * 60;
        break;
      default:
        newTimeLeft = settings.workDuration * 60;
    }
    setTimeLeft(newTimeLeft);
    setMode(targetMode);
  }, [mode, settings]);


  useEffect(() => {
    originalDocTitleRef.current = document.title;
    return () => {
      document.title = originalDocTitleRef.current; 
       if (miniTimerWindowRef.current && !miniTimerWindowRef.current.closed) {
        miniTimerWindowRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    let interval: number | null = null;

    if (isActive && timeLeft > 0) {
      document.title = `${formatTime(timeLeft)} - ${modeText(mode)} - ${APP_NAME}`;
      interval = window.setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      updateTimerStateInLocalStorage();
    } else if (isActive && timeLeft === 0) {
      document.title = `Finished! - ${modeText(mode)} - ${APP_NAME}`;
      setIsActive(false); 
      
      let newPomodoroCount = pomodoroCount;
      if (mode === 'work') {
        newPomodoroCount = pomodoroCount + 1;
        setPomodoroCount(newPomodoroCount);
        onLogPomodoroActivity(settings.workDuration); 
        addNotification(`🎉 Great focus, ${userName || 'Learner'}! Time for a well-deserved break. 🎉`, 'success', 7000);
        if (newPomodoroCount % POMODOROS_UNTIL_LONG_BREAK === 0) {
          resetTimer('longBreak');
        } else {
          resetTimer('shortBreak');
        }
      } else { 
        addNotification(`🧘 Break's over, ${userName || 'Learner'}! Ready for the next focus session?`, 'info', 7000);
        resetTimer('work');
      }
      if (Notification.permission === "granted") {
        new Notification(APP_NAME + " Timer", {
          body: mode === 'work' ? "Focus session ended! Time for a break." : "Break ended! Time for work.",
          icon: '/logo_learnixus_192.png'
        });
      }
      updateTimerStateInLocalStorage(); 
    } else if (!isActive) {
      if(document.title !== originalDocTitleRef.current) document.title = originalDocTitleRef.current;
      updateTimerStateInLocalStorage(); 
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, pomodoroCount, resetTimer, updateTimerStateInLocalStorage, userName, addNotification, onLogPomodoroActivity, settings.workDuration]);
  
  useEffect(() => {
    const handleWindowBlur = () => {
      if (isActive && (!miniTimerWindowRef.current || miniTimerWindowRef.current.closed)) {
        updateTimerStateInLocalStorage(); 
        miniTimerWindowRef.current = window.open(
          '/mini-timer.html', 
          'LearnixusMiniTimer', 
          'width=280,height=180,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no'
        );
      }
    };

    const handleWindowFocus = () => {
      if (miniTimerWindowRef.current && !miniTimerWindowRef.current.closed) {
        miniTimerWindowRef.current.close();
        miniTimerWindowRef.current = null;
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isActive, updateTimerStateInLocalStorage]);
  
  useEffect(() => {
    if (!isActive && miniTimerWindowRef.current && !miniTimerWindowRef.current.closed) {
      miniTimerWindowRef.current.close();
      miniTimerWindowRef.current = null;
    }
  }, [isActive]);


  const toggleTimer = () => {
     if (!isActive && Notification.permission === "default") {
      Notification.requestPermission();
    }
    setIsActive(!isActive);
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const modeText = (currentMode: TimerMode): string => {
    switch (currentMode) {
      case 'work': return 'Focus Session';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
      default: return 'Focus Session';
    }
  };

  const handleSettingsChange = (field: keyof PomodoroSettings, value: string) => {
    const numValue = parseInt(value, 10);
    if (numValue > 0 && numValue <= 120) { 
      const newSettings = { ...settings, [field]: numValue };
      setSettings(newSettings);
      if (!isActive) {
        if (field === 'workDuration' && mode === 'work') setTimeLeft(numValue * 60);
        else if (field === 'shortBreakDuration' && mode === 'shortBreak') setTimeLeft(numValue * 60);
        else if (field === 'longBreakDuration' && mode === 'longBreak') setTimeLeft(numValue * 60);
      }
    }
  };
  
  const timerBgClass = theme === 'light' ? 'bg-white' : 'bg-slate-800';
  const timerBorderClass = theme === 'light' ? 'border-slate-200/90' : 'border-slate-700/70';
  const titleColorClass = theme === 'light' ? `text-${accentColorName}-600` : `text-${accentColorName}-400`;
  const timeColorClass = theme === 'light' ? 'text-slate-800' : 'text-slate-50';
  const modeTextColorClass = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  
  const buttonBaseClass = "font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm sm:text-base";
  const primaryButtonClass = `bg-gradient-to-r from-${accentColorName}-500 to-${accentColorName}-600 hover:from-${accentColorName}-600 hover:to-${accentColorName}-700 text-white focus:ring-${accentColorName}-300`;
  const secondaryButtonClass = `${theme === 'light' ? 'bg-slate-200 hover:bg-slate-300/80 text-slate-700 focus:ring-slate-300' : 'bg-slate-700 hover:bg-slate-600/80 text-slate-200 focus:ring-slate-500'}`;
  const ringOffsetClass = theme === 'light' ? 'focus:ring-offset-white' : `focus:ring-offset-slate-800`;
  
  const inputBgClass = theme === 'light' 
    ? 'bg-slate-100 border-slate-300 focus:ring-indigo-500 focus:border-indigo-500' 
    : 'bg-slate-700 border-slate-600 focus:ring-sky-500 focus:border-sky-500';
  const inputTextColorClass = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const labelColorClass = theme === 'light' ? 'text-slate-600' : 'text-slate-400';
  const settingsCardBgClass = theme === 'light' ? 'bg-slate-50' : 'bg-slate-700/60';
  const settingsCardBorderClass = theme === 'light' ? 'border-slate-200' : 'border-slate-600/70';


  if (!isDashboardActive && !isActive) {
    return null; 
  }

  if (!isDashboardActive && isActive) {
    // Mini-timer for when dashboard is not active but timer is running
    return (
      <div 
        className={`fixed bottom-5 right-5 p-3.5 rounded-xl shadow-2xl ${timerBgClass} border ${timerBorderClass} z-[70] w-52 text-center transition-all duration-300 animate-fadeIn`}
        role="status"
        aria-live="polite"
        aria-label={`Pomodoro Timer active. Mode: ${modeText(mode)}, Time left: ${formatTime(timeLeft)}`}
      >
        <p className={`text-xs font-medium ${modeTextColorClass}`}>{modeText(mode)}</p>
        <div className={`text-4xl font-bold ${timeColorClass} tabular-nums my-0.5`}>
          {formatTime(timeLeft)}
        </div>
        <p className={`text-xs ${modeTextColorClass}`}>Pomodoros: {pomodoroCount}</p>
      </div>
    );
  }

  return (
    <div className={`relative p-5 sm:p-6 rounded-2xl shadow-xl ${timerBgClass} border ${timerBorderClass} text-center transition-all duration-300`}>
      <div className="flex justify-between items-center mb-4"> 
        <h2 className={`text-xl sm:text-2xl font-semibold ${titleColorClass}`}>Pomodoro Focus</h2>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`text-xs p-2 rounded-lg ${secondaryButtonClass} ${ringOffsetClass} flex items-center gap-1.5 shadow-sm hover:scale-105`}
          aria-expanded={showSettings}
          aria-controls="pomodoro-settings"
        >
          <Cog6ToothIcon className="w-4 h-4" />
          {showSettings ? 'Close Settings' : 'Timer Settings'}
        </button>
      </div>
      
      {showSettings && (
        <div id="pomodoro-settings" className={`grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 my-5 p-4 border rounded-xl ${settingsCardBgClass} ${settingsCardBorderClass} transition-all duration-300 ease-in-out animate-fadeIn`}>
          {[
            { label: 'Focus (min)', key: 'workDuration' as keyof PomodoroSettings, value: settings.workDuration },
            { label: 'Short Break (min)', key: 'shortBreakDuration' as keyof PomodoroSettings, value: settings.shortBreakDuration },
            { label: 'Long Break (min)', key: 'longBreakDuration' as keyof PomodoroSettings, value: settings.longBreakDuration },
          ].map(item => (
            <div key={item.key}>
              <label htmlFor={item.key} className={`block text-xs font-medium ${labelColorClass} mb-1.5`}>{item.label}</label>
              <input
                type="number"
                id={item.key}
                value={item.value}
                onChange={(e) => handleSettingsChange(item.key, e.target.value)}
                min="1"
                max="120"
                className={`w-full border ${inputBgClass} ${inputTextColorClass} rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none transition-colors duration-200 ease-in-out shadow-sm text-center`}
              />
            </div>
          ))}
        </div>
      )}

      <p className={`text-base font-medium ${modeTextColorClass} mb-1 sm:mb-2`}>{modeText(mode)}</p>
      <p className={`text-xs ${modeTextColorClass} mb-4 sm:mb-6`}>Sessions completed: {pomodoroCount}</p>
      
      <div className={`text-6xl sm:text-8xl font-bold ${timeColorClass} my-6 sm:my-8 tabular-nums tracking-tight`}>
        {formatTime(timeLeft)}
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-4">
        <button
          onClick={toggleTimer}
          className={`${buttonBaseClass} ${primaryButtonClass} ${ringOffsetClass} w-full sm:w-auto flex items-center justify-center gap-2 hover:scale-[1.03] hover:-translate-y-px`}
          aria-label={isActive ? 'Pause timer' : 'Start timer'}
        >
          {isActive ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
          {isActive ? 'Pause' : 'Start Focus'}
        </button>
        <button
          onClick={() => resetTimer(mode, true)} 
          className={`${buttonBaseClass} ${secondaryButtonClass} ${ringOffsetClass} w-full sm:w-auto flex items-center justify-center gap-2 hover:opacity-90`}
          aria-label="Reset timer and pomodoro count"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Reset All
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;