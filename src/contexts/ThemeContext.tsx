
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import useUserData from '../hooks/useUserData';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to 'dark' if no theme is found in localStorage.
  // The useUserData hook handles reading from localStorage first.
  // If 'learnixus-theme' is not found, it will use this 'dark' as the initialValue.
  const [persistedTheme, setPersistedTheme] = useUserData<Theme>('learnixus-theme', 'dark');
  
  const [theme, setTheme] = useState<Theme>(persistedTheme);

  useEffect(() => {
    // Ensure client-side state matches localStorage after hydration
    setTheme(persistedTheme);
  }, [persistedTheme]);
  
  useEffect(() => {
    const root = window.document.documentElement; // Target the <html> element
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Update persisted theme when local theme changes
    if (theme !== persistedTheme) {
        setPersistedTheme(theme);
    }
  }, [theme, persistedTheme, setPersistedTheme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};