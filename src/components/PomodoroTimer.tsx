import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const isMobileDevice = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR, APP_NAME } from '../constants';
import { PlayIcon, PauseIcon, ArrowPathIcon, Cog6ToothIcon } from './IconComponents';
import useUserData from '../hooks/useUserData';
import { useNotification } from '../contexts/NotificationContext';
import toast from 'react-hot-toast';

const POMODOROS_UNTIL_LONG_BREAK = 4;
const LOCAL_STORAGE_POMODORO_STATE_KEY = 'learnixusPomodoroState';

interface PomodoroSettings {
  workDuration: number; 
  shortBreakDuration: number;
  longBreakDuration: number;
}

interface PomodoroStateFromStorage {
  timeLeft: number;
  isActive: boolean;
  mode: TimerMode;
  pomodoroCount: number;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

import { ActiveView } from '../types';

interface PomodoroTimerProps {
  isDashboardActive: boolean;
  userName: string;
  onLogPomodoroActivity: (durationInMinutes: number) => void;
  setActiveView: (view: ActiveView) => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ isDashboardActive, userName, onLogPomodoroActivity, setActiveView }) => {
  const { theme } = useTheme();
  const { addNotification } = useNotification();
  const accentColorName = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[0] : DARK_ACCENT_COLOR.split('-')[0];

  const [settings, setSettings] = useUserData<PomodoroSettings>('learnixusPomodoroSettings', {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
  });

  const [initialState] = useState(() => {
    const savedStateRaw = localStorage.getItem(LOCAL_STORAGE_POMODORO_STATE_KEY);
    if (savedStateRaw) {
      try {
        return JSON.parse(savedStateRaw) as PomodoroStateFromStorage;
      } catch (error) {
        console.error("Error parsing saved pomodoro state:", error);
        return null;
      }
    }
    return null;
  });

  const [timeLeft, setTimeLeft] = useState(initialState?.timeLeft ?? settings.workDuration * 60);
  const [isActive, setIsActive] = useState(initialState?.isActive ?? false);
  const [mode, setMode] = useState<TimerMode>(initialState?.mode ?? 'work');
  const [pomodoroCount, setPomodoroCount] = useState(initialState?.pomodoroCount ?? 0);

  const [showSettings, setShowSettings] = useState(false);
  const [inputValues, setInputValues] = useState({
    workDuration: String(settings.workDuration),
    shortBreakDuration: String(settings.shortBreakDuration),
    longBreakDuration: String(settings.longBreakDuration),
  });
  const [inputErrors, setInputErrors] = useState({
    workDuration: '',
    shortBreakDuration: '',
    longBreakDuration: '',
  });

  const miniTimerWindowRef = useRef<Window | null>(null);
  const originalDocTitleRef = useRef<string>(document.title);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel('pomodoro-timer');
    return () => {
      channelRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (channelRef.current) {
      channelRef.current.postMessage({ timeLeft, mode });
    }
  }, [timeLeft, mode]);

  useEffect(() => {
    setInputValues({
        workDuration: String(settings.workDuration),
        shortBreakDuration: String(settings.shortBreakDuration),
        longBreakDuration: String(settings.longBreakDuration),
    });
  }, [settings]);

  useEffect(() => {
    if (!initialState && !isActive) {
      if (mode === 'work') setTimeLeft(settings.workDuration * 60);
      else if (mode === 'shortBreak') setTimeLeft(settings.shortBreakDuration * 60);
      else if (mode === 'longBreak') setTimeLeft(settings.longBreakDuration * 60);
    }
  }, [settings, initialState, isActive, mode]);

  const updateTimerStateInLocalStorage = useCallback(() => {
    const stateToSave: PomodoroStateFromStorage = {
      timeLeft,
      isActive,
      mode,
      pomodoroCount,
    };
    localStorage.setItem(LOCAL_STORAGE_POMODORO_STATE_KEY, JSON.stringify(stateToSave));
  }, [timeLeft, isActive, mode, pomodoroCount]);

  const resetTimer = useCallback((newMode?: TimerMode, resetCount = false) => {
    workerRef.current?.postMessage({ command: 'reset', value: settings.workDuration * 60 });
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
    workerRef.current?.postMessage({ command: 'reset', value: newTimeLeft });
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

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/timerWorker.ts', import.meta.url));

    workerRef.current.onmessage = (e: MessageEvent) => {
      const { type, timeLeft: newTimeLeft } = e.data;
      if (type === 'tick') {
        setTimeLeft(newTimeLeft);
      } else if (type === 'done') {
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
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [resetTimer, mode, pomodoroCount, onLogPomodoroActivity, settings.workDuration, userName, addNotification]);

  useEffect(() => {
    if (isActive) {
      document.title = `${formatTime(timeLeft)} - ${modeText(mode)} - ${APP_NAME}`;
    } else {
      document.title = originalDocTitleRef.current;
    }
    updateTimerStateInLocalStorage();
  }, [timeLeft, isActive, mode, updateTimerStateInLocalStorage]);

  const toggleTimer = () => {
    if (!isActive && Notification.permission === "default") {
      Notification.requestPermission();
    }
    if (isActive) {
      workerRef.current?.postMessage({ command: 'pause' });
    } else {
      workerRef.current?.postMessage({ command: 'start', value: timeLeft });
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
    setInputValues(prev => ({ ...prev, [field]: value }));
    if (inputErrors[field]) {
      setInputErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSettingsBlur = (field: keyof PomodoroSettings) => {
    const value = inputValues[field];
    if (value.trim() === '') {
      setInputErrors(prev => ({ ...prev, [field]: 'Please enter a number.' }));
      return;
    }
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1 || numValue > 120) {
      setInputErrors(prev => ({ ...prev, [field]: 'Enter a value between 1 and 120.' }));
    } else {
      setInputErrors(prev => ({ ...prev, [field]: '' }));
      const newSettings = { ...settings, [field]: numValue };
      setSettings(newSettings);
      if (!isActive) {
        if (field === 'workDuration' && mode === 'work') setTimeLeft(numValue * 60);
        else if (field === 'shortBreakDuration' && mode === 'shortBreak') setTimeLeft(numValue * 60);
        else if (field === 'longBreakDuration' && mode === 'longBreak') setTimeLeft(numValue * 60);
      }
    }
  };

  const handleOpenMiniTimer = () => {
    if (isMobileDevice()) {
      toast.dismiss(); // Dismiss any existing timer toasts
      toast.custom(
        (t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <PlayIcon className="h-10 w-10 text-green-400" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {modeText(mode)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        ),
        {
          id: 'mini-timer-toast',
          duration: Infinity, // Keep the toast open until dismissed
        }
      );
    } else {
      if (miniTimerWindowRef.current && !miniTimerWindowRef.current.closed) {
        miniTimerWindowRef.current.focus();
      } else {
        const width = 250;
        const height = 200;
        const left = window.screen.width - width - 20;
        const top = window.screen.height - height - 80;

        miniTimerWindowRef.current = window.open(
          `/mini-timer.html?theme=${theme}`,
          'mini-timer',
          `width=${width},height=${height},left=${left},top=${top}`
        );
      }
    }
  };

  const timerBgClass = theme === 'light' ? 'bg-white' : theme === 'dark' ? 'bg-slate-800' : 'bg-gray-900';
  const timerBorderClass = theme === 'light' ? 'border-slate-200/90' : theme === 'dark' ? 'border-slate-700/70' : 'border-gray-800/70';
  const titleColorClass = theme === 'light' ? `text-${accentColorName}-600` : `text-${accentColorName}-400`;
  const timeColorClass = theme === 'light' ? 'text-slate-800' : 'text-slate-50';
  const modeTextColorClass = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  
  const buttonBaseClass = "font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm sm:text-base";
  const primaryButtonClass = `bg-gradient-to-r from-${accentColorName}-500 to-${accentColorName}-600 hover:from-${accentColorName}-600 hover:to-${accentColorName}-700 text-white focus:ring-${accentColorName}-300`;
  const secondaryButtonClass = `${theme === 'light' ? 'bg-slate-200 hover:bg-slate-300/80 text-slate-700 focus:ring-slate-300' : 'bg-slate-700 hover:bg-slate-600/80 text-slate-200 focus:ring-slate-500'}`;
  const ringOffsetClass = theme === 'light' ? 'focus:ring-offset-white' : `focus:ring-offset-slate-800`;
  
  const inputBgClass = theme === 'light' 
    ? 'bg-slate-100 border-slate-300 focus:ring-indigo-500 focus:border-indigo-500' 
    : theme === 'dark' ? 'bg-slate-700 border-slate-600 focus:ring-sky-500 focus:border-sky-500' : 'bg-gray-800 border-gray-700 focus:ring-sky-500 focus:border-sky-500';
  const inputTextColorClass = theme === 'light' ? 'text-slate-900' : 'text-slate-100';
  const labelColorClass = theme === 'light' ? 'text-slate-600' : 'text-slate-400';
  const settingsCardBgClass = theme === 'light' ? 'bg-slate-50' : theme === 'dark' ? 'bg-slate-700/60' : 'bg-gray-800/60';
  const settingsCardBorderClass = theme === 'light' ? 'border-slate-200' : theme === 'dark' ? 'border-slate-600/70' : 'border-gray-700/70';


  if (!isDashboardActive && !isActive) {
    return null; 
  }

  if (!isDashboardActive && isActive) {
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
                value={inputValues[item.key]}
                onChange={(e) => handleSettingsChange(item.key, e.target.value)}
                onBlur={() => handleSettingsBlur(item.key)}
                min="1"
                max="120"
                className={`w-full border ${inputBgClass} ${inputTextColorClass} rounded-lg p-2.5 text-sm focus:ring-2 focus:outline-none transition-colors duration-200 ease-in-out shadow-sm text-center`}
              />
              {inputErrors[item.key] && <p className={`text-xs mt-1 ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>{inputErrors[item.key]}</p>}
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
        <button
          onClick={handleOpenMiniTimer}
          className={`${buttonBaseClass} ${secondaryButtonClass} ${ringOffsetClass} w-full sm:w-auto flex items-center justify-center gap-2 hover:opacity-90`}
          aria-label="Open mini timer"
        >
          Open Mini Timer
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
