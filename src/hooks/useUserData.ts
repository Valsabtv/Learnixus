import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useSession } from '@supabase/auth-helpers-react';
import useDebounce from './useDebounce';

type UseUserDataReturn<T> = [T, React.Dispatch<React.SetStateAction<T>>, boolean];

function useUserData<T>(key: string, initialValue: T): UseUserDataReturn<T> {
  const session = useSession();
  const user = session?.user;

  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    if (!user) {
      setValue(initialValue);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: row, error } = await supabase
          .from('lernixus_data')
          .select('data')
          .eq('user_id', user.id)
          .eq('key', key)
          .maybeSingle();

        if (error) throw error;

        if (isMounted) {
          if (row && row.data !== undefined) {
            setValue(row.data);
          } else {
            setValue(initialValue);
          }
        }
      } catch (error: any) {
        console.error(`Error fetching user data for key "${key}":`, error.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [key, user?.id]);

  useEffect(() => {
    if (!user || loading) {
      return;
    }

    const saveData = async () => {
      try {
        const { error } = await supabase
          .from('lernixus_data')
          .upsert([{ user_id: user.id, key, data: debouncedValue }], { onConflict: 'user_id,key' });

        if (error) {
          console.error(`Error saving user data for key "${key}":`, error.message);
        }
      } catch (error: any) {
        console.error(`Error during upsert for key "${key}":`, error.message);
      }
    };

    saveData();
  }, [debouncedValue]);

  return [value, setValue, loading];
}

export default useUserData;
