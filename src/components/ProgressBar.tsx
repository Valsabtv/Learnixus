import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';

interface ProgressBarProps {
  progress: number;
  height?: string; // Tailwind height class e.g. 'h-2'
  customColorClass?: string; 
  customTrackColorClass?: string; 
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, height = 'h-2', customColorClass, customTrackColorClass }) => {
  const { theme } = useTheme();
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const accentColorName = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[0] : DARK_ACCENT_COLOR.split('-')[0];
  const accentShade = theme === 'light' ? LIGHT_ACCENT_COLOR.split('-')[1] : DARK_ACCENT_COLOR.split('-')[1];


  const colorClass = customColorClass
    ? customColorClass
    : theme === 'light'
      ? `bg-gradient-to-r from-${accentColorName}-${accentShade || '500'} to-${accentColorName}-${parseInt(accentShade || '500') + 100}`
      : `bg-gradient-to-r from-${accentColorName}-${accentShade || '400'} to-${accentColorName}-${parseInt(accentShade || '400') + 100}`;
      
  const trackColorClass = customTrackColorClass 
    ? customTrackColorClass
    : theme === 'light' ? 'bg-slate-200/80' : 'bg-slate-700/70';

  return (
    <div className={`w-full ${trackColorClass} rounded-full ${height} overflow-hidden shadow-sm`}>
      <div
        className={`${colorClass} ${height} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${clampedProgress}%` }}
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
      ></div>
    </div>
  );
};

export default ProgressBar;