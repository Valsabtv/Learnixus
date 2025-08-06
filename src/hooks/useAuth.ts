
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { useNotification } from '../contexts/NotificationContext';
import { ExamPreparationInfo } from '../types';

export const useAuth = () => {
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [hasCompletedInitialSetup, setHasCompletedInitialSetup] = useState(false);
  const [userName, setUserName] = useState('');
  const [userStudyLevel, setUserStudyLevel] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [examPreparationInfo, setExamPreparationInfo] = useState<ExamPreparationInfo | null>(null);
  const [streak, setStreak] = useState(0);
  const { addNotification } = useNotification();

  const handleSocialLogin = useCallback(async (provider: 'google' | 'github') => {
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setAuthError(error.message);
    }
    setAuthLoading(false);
  }, []);

  const requestLogout = useCallback(() => {
    // This will be handled by a farewell popup in the UI
  }, []);

  const handleLogout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
      addNotification("Logout failed.", "error");
      return;
    }
    addNotification("Logged out successfully.", "success");
  }, [addNotification]);

  useEffect(() => {
    const handleAuthChange = async (session: any) => {
      const user = session?.user;

      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username, setup_complete, study_level, college, exam_info')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching profile:", error);
          addNotification("Error loading your profile. Please try again.", "error");
          await supabase.auth.signOut();
          return;
        }

        setIsAuthenticated(true);

        if (profile) {
          setUserName(profile.username || '');
          setHasCompletedInitialSetup(profile.setup_complete || false);
          setUserStudyLevel(profile.study_level || '');
          setSelectedCollege(profile.college || '');
          setExamPreparationInfo(profile.exam_info || null);
        } else {
          // This is a new user, or a user without a profile. Direct them to setup.
          setHasCompletedInitialSetup(false);
        }
      } else {
        setIsAuthenticated(false);
        setHasCompletedInitialSetup(false);
        setUserName('');
        setUserStudyLevel('');
        setSelectedCollege('');
        setExamPreparationInfo(null);
      }

      setIsSessionLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [addNotification]);

  return {
    isSessionLoading,
    isAuthenticated,
    authLoading,
    authError,
    setAuthError,
    hasCompletedInitialSetup,
    userName,
    setUserName,
    userStudyLevel,
    setUserStudyLevel,
    selectedCollege,
    setSelectedCollege,
    examPreparationInfo,
    setExamPreparationInfo,
    streak,
    handleSocialLogin,
    requestLogout,
    handleLogout,
    setHasCompletedInitialSetup,
  };
};
