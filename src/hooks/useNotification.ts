// src/hooks/useNotification.ts
import { toast } from 'react-hot-toast';

export const useNotification = () => ({
  addNotification: (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (type === 'success') toast.success(msg);
    else if (type === 'error') toast.error(msg);
    else toast(msg);
  }
});
