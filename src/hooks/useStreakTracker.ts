import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useSession } from '@supabase/auth-helpers-react';

const getTodayDateString = (): string => {
  const today = new Date();
  const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return todayAtMidnight.toISOString().split('T')[0];
};

const useStreakTracker = (): { currentStreak: number; checkAndProcessStreak: () => void } => {
  const session = useSession();
  const user = session?.user;
  const [streak, setStreak] = useState(0);
  const [lastActiveDate, setLastActiveDate] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchStreak = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('streak, last_active_date')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching streak:", error.message);
        return;
      }

      setStreak(data.streak || 0);
      setLastActiveDate(data.last_active_date || null);
    };

    fetchStreak();
  }, [user]);

  const checkAndProcessStreak = useCallback(async () => {
    if (!user) return;

    const todayStr = getTodayDateString();

    if (lastActiveDate === todayStr && streak > 0) {
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).toISOString().split('T')[0];

    let newStreak: number;
    if (lastActiveDate === yesterdayStr) {
      newStreak = streak + 1;
    } else {
      newStreak = 1;
    }

    setStreak(newStreak);
    setLastActiveDate(todayStr);

    const { error } = await supabase
      .from('profiles')
      .update({ streak: newStreak, last_active_date: todayStr })
      .eq('id', user.id);

    if (error) {
      console.error("Error updating streak:", error.message);
    }
  }, [user, streak, lastActiveDate]);

  return { currentStreak: streak, checkAndProcessStreak };
};

export default useStreakTracker;
