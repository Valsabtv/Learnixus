
import { useState, useEffect } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

const QUEUE_KEY = 'learnixus-videoQueue';

export function usePersistentVideoQueue() {
  const [videoQueue, setVideoQueue] = useState<string[]>([]);
  const user = useUser();
  const supabase = useSupabaseClient();

  // Effect to fetch the queue from Supabase when the user logs in
  useEffect(() => {
    async function fetchQueue() {
      if (user) {
        const { data, error } = await supabase
          .from('lernixus_data')
          .select('data')
          .eq('user_id', user.id)
          .eq('key', QUEUE_KEY)
          .single();

        if (data && data.data) {
          // Type guard to ensure data has the expected shape
          const queueData = data.data as { queue?: string[] };
          if (queueData.queue && Array.isArray(queueData.queue)) {
            setVideoQueue(queueData.queue);
          }
        } else if (error && error.code !== 'PGRST116') { // PGRST116 is the code for "No rows found", which is expected.
          console.error('Error fetching video queue:', error);
        }
      } else {
        // When the user logs out, clear the local state.
        // The data remains in Supabase for their next session.
        setVideoQueue([]);
      }
    }
    fetchQueue();
  }, [user, supabase]);

  // Effect to save the queue to Supabase whenever it changes
  useEffect(() => {
    // Do not run this effect if the user is not logged in or if the queue is empty.
    if (!user || videoQueue.length === 0) return;

    async function saveQueue() {
      const { error } = await supabase
        .from('lernixus_data')
        .upsert({
          user_id: user.id,
          key: QUEUE_KEY,
          data: { queue: videoQueue },
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving video queue:', error);
      }
    }

    // Debounce the save operation to avoid excessive writes
    const timerId = setTimeout(() => {
      saveQueue();
    }, 500); // Save 500ms after the last change

    return () => {
      clearTimeout(timerId);
    };
  }, [videoQueue, user, supabase]);

  return { videoQueue, setVideoQueue };
}
