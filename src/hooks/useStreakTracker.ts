import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import useUserData from './useUserData'; 

const getTodayDateString = (): string => {
  const today = new Date();
  // Creates a new Date object representing midnight local time on the current day
  const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return todayAtMidnight.toISOString().split('T')[0]; // YYYY-MM-DD
};

interface StreakData {
  streak: number;
  lastActiveDate: string | null;
}

const useStreakTracker = (): { currentStreak: number; checkAndProcessStreak: () => void } => {
  const [streakData, setStreakData] = useUserData<StreakData>('learnixus-streakData', {
    streak: 0,
    lastActiveDate: null,
  });

  const checkAndProcessStreak = useCallback(() => {
    const todayStr = getTodayDateString();
    
    setStreakData(prevData => {
      // If already processed for today or initial state is 0 streak and no last active date (will be set to 1)
      if (prevData.lastActiveDate === todayStr && prevData.streak > 0) {
        return prevData; // Already active today, no change if streak is positive
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).toISOString().split('T')[0];

      let newStreak: number;
      if (prevData.lastActiveDate === yesterdayStr) {
        newStreak = prevData.streak + 1;
      } else {
        // Streak broken, or first time for today (could be first ever if lastActiveDate was null)
        // If it's a new day (not yesterday, not today), streak becomes 1.
        // If lastActiveDate was null, it also becomes 1.
        newStreak = 1; 
      }
      return { streak: newStreak, lastActiveDate: todayStr };
    });
  }, [setStreakData]);

  return { currentStreak: streakData.streak, checkAndProcessStreak };
};

export default useStreakTracker;
