
import React, { useState, useMemo, useEffect } from 'react';
import { ExamPreparationInfo, ExamActivity, ExamGoalType } from '../types';
import { POPULAR_INDIAN_EXAMS, LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, ClipboardDocumentCheckIcon } from './IconComponents';

interface ExamPrepViewProps {
  examInfo: ExamPreparationInfo | null;
  activities: ExamActivity[];
  userName: string;
}

const getTodayDateString = (): string => new Date().toISOString().split('T')[0];

const formatDate = (date: Date, options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }): string => {
  return date.toLocaleDateString(undefined, options);
};

const ExamPrepView: React.FC<ExamPrepViewProps> = ({ examInfo, activities, userName }) => {
  const { theme } = useTheme();
  
  const lightAccentName = LIGHT_ACCENT_COLOR.split('-')[0];
  const darkAccentName = DARK_ACCENT_COLOR.split('-')[0];

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ...
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to make Monday the start of the week
    return new Date(today.setDate(diff));
  });

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  useEffect(() => {
    // If examInfo changes, perhaps reset selectedDate or week if needed, though usually not.
    // This is more for future use if external changes should reset the view.
  }, [examInfo]);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    let day = new Date(currentWeekStart);
    for (let i = 0; i < 7; i++) {
      days.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    return days;
  }, [currentWeekStart]);

  const activitiesForSelectedDate = useMemo(() => {
    return activities
      .filter(activity => activity.date === selectedDate)
      .sort((a, b) => b.timestamp - a.timestamp); // Sort by most recent first
  }, [activities, selectedDate]);
  
  const activitiesByDateMap = useMemo(() => {
    const map = new Map<string, number>();
    activities.forEach(activity => {
      map.set(activity.date, (map.get(activity.date) || 0) + 1);
    });
    return map;
  }, [activities]);


  const changeWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => {
      const newWeekStart = new Date(prev);
      newWeekStart.setDate(newWeekStart.getDate() + (direction === 'next' ? 7 : -7));
      return newWeekStart;
    });
  };

  const getExamDisplayInfo = () => {
    if (!examInfo || examInfo.goalType === 'none') {
      return "No specific exam goal set. You can update this in Settings.";
    }
    if (examInfo.goalType === 'general_final_exams') {
      return `Preparing for: General Final Exams ${examInfo.customExamName ? `(${examInfo.customExamName})` : ''}`;
    }
    if (examInfo.goalType === 'specific_competitive_exam') {
      const examDetails = POPULAR_INDIAN_EXAMS.find(ex => ex.key === examInfo.specificExamKey);
      if (examDetails && examDetails.key !== 'other_competitive') {
        return `Preparing for: ${examDetails.name}`;
      }
      if (examInfo.customExamName) {
        return `Preparing for: ${examInfo.customExamName}`;
      }
      return "Preparing for a specific competitive exam.";
    }
    return "Exam goal details are unavailable.";
  };
  
  const cardBgClass = theme === 'light' ? 'bg-white' : 'bg-slate-800';
  const textColorClass = theme === 'light' ? 'text-slate-700' : 'text-slate-200';
  const headingColorClass = theme === 'light' ? `text-${lightAccentName}-600` : `text-${darkAccentName}-400`;
  const subTextColorClass = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  const borderColorClass = theme === 'light' ? 'border-slate-200' : 'border-slate-700';
  const calendarButtonBgClass = theme === 'light' ? 'bg-slate-100 hover:bg-slate-200' : 'bg-slate-700 hover:bg-slate-600';
  
  const calendarDaySelectedBgClass = theme === 'light' ? `bg-${lightAccentName}-100` : `bg-${darkAccentName}-500/30`;
  const calendarDaySelectedTextClass = theme === 'light' ? `text-${lightAccentName}-700` : `text-${darkAccentName}-200`;
  const calendarDayTodayBorderClass = theme === 'light' ? `border-${lightAccentName}-400` : `border-${darkAccentName}-500`;
  
  const activityItemBg = theme === 'light' ? 'bg-slate-50' : 'bg-slate-700/60';


  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Exam Goal Display */}
      <section className={`p-4 sm:p-5 rounded-xl shadow-lg ${cardBgClass} border ${borderColorClass}`}>
        <h2 className={`text-lg font-semibold ${headingColorClass} mb-2 flex items-center`}>
          <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2" /> Your Exam Goal
        </h2>
        <p className={`${subTextColorClass} text-sm`}>{getExamDisplayInfo()}</p>
      </section>

      {/* Weekly Calendar */}
      <section className={`p-4 sm:p-5 rounded-xl shadow-lg ${cardBgClass} border ${borderColorClass}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-semibold ${headingColorClass} flex items-center`}>
             <CalendarDaysIcon className="w-5 h-5 mr-2" /> Weekly Activity Calendar
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => changeWeek('prev')}
              className={`p-2.5 rounded-md ${calendarButtonBgClass} ${textColorClass} shadow-sm focus:outline-none focus:ring-2 ${theme === 'light' ? `focus:ring-${lightAccentName}-500` : `focus:ring-${darkAccentName}-400`}`}
              aria-label="Previous week"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => changeWeek('next')}
              className={`p-2.5 rounded-md ${calendarButtonBgClass} ${textColorClass} shadow-sm focus:outline-none focus:ring-2 ${theme === 'light' ? `focus:ring-${lightAccentName}-500` : `focus:ring-${darkAccentName}-400`}`}
              aria-label="Next week"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
          {weekDays.map(day => {
            const dayStr = day.toISOString().split('T')[0];
            const isToday = dayStr === getTodayDateString();
            const isSelected = dayStr === selectedDate;
            const hasActivity = (activitiesByDateMap.get(dayStr) || 0) > 0;

            return (
              <button
                key={dayStr}
                onClick={() => setSelectedDate(dayStr)}
                className={`p-2.5 sm:p-3.5 rounded-lg transition-all duration-150 ease-in-out relative
                  ${isSelected ? `${calendarDaySelectedBgClass} ${calendarDaySelectedTextClass} font-semibold shadow-md` : `${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-700'} ${subTextColorClass}`}
                  ${isToday && !isSelected ? `border-2 ${calendarDayTodayBorderClass}` : `border border-transparent`}
                `}
                aria-pressed={isSelected}
                aria-label={`Select date ${formatDate(day, { month: 'long', day: 'numeric' })}`}
              >
                <div className="font-medium text-sm">{day.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                <div className="mt-1 text-xl sm:text-2xl">{day.getDate()}</div>
                 {hasActivity && <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${isSelected ? (theme === 'light' ? `bg-${lightAccentName}-600` : `bg-${darkAccentName}-300`) : (theme === 'light' ? `bg-${lightAccentName}-400` : `bg-${darkAccentName}-500`)}`}></div>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Daily Activity List */}
      <section className={`p-4 sm:p-5 rounded-xl shadow-lg ${cardBgClass} border ${borderColorClass}`}>
        <h2 className={`text-lg font-semibold ${headingColorClass} mb-3`}>
          Activities for: <span className={textColorClass}>{formatDate(new Date(selectedDate + 'T00:00:00'), { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </h2>
        {activitiesForSelectedDate.length > 0 ? (
          <ul className="space-y-3">
            {activitiesForSelectedDate.map(activity => (
              <li key={activity.id} className={`p-3.5 rounded-md ${activityItemBg} border ${borderColorClass} shadow-sm`}>
                <p className={`${textColorClass} text-base`}>{activity.description}</p>
                <p className={`${subTextColorClass} text-sm mt-1`}>
                  Logged at: {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {activity.details?.subjectName && ` | Subject: ${activity.details.subjectName}`}
                  {activity.details?.chapterName && ` | Chapter: ${activity.details.chapterName}`}
                  {activity.details?.duration && ` | Duration: ${activity.details.duration} min`}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`${subTextColorClass} text-base text-center py-4`}>No activities logged for this day, {userName}.</p>
        )}
      </section>
    </div>
  );
};

export default ExamPrepView;
