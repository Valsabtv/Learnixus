import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { APP_NAME, LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';
import { BookOpenIcon } from './IconComponents';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-5.067 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.133H12.48z" fill="currentColor"/>
  </svg>
);

const GitHubIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <title>GitHub</title>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor"/>
  </svg>
);

interface LoginPageProps {
  onSocialLogin: (provider: 'google' | 'github') => void;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSocialLogin, loading, error, setError }) => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      container.style.setProperty('--mouse-x', `${x}px`);
      container.style.setProperty('--mouse-y', `${y}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const accentColor = theme === 'light' ? LIGHT_ACCENT_COLOR : DARK_ACCENT_COLOR;
  const accentColorName = accentColor.split('-')[0];

  const headingColor = theme === 'light' ? 'text-slate-100' : 'text-slate-50';
  const textColor = theme === 'light' ? 'text-slate-200' : 'text-slate-300';
  const appNameColor = `text-${accentColorName}-400`;
  
  const errorTextColor = theme === 'light' ? 'text-red-300' : 'text-red-400';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gray-900 transition-colors duration-300 ease-in-out animate-fadeIn overflow-hidden">
      <div className="blob blob-1 bg-purple-500" style={{ top: '10%', left: '10%', width: '200px', height: '200px' }}></div>
      <div className="blob blob-2 bg-sky-500" style={{ top: '50%', left: '70%', width: '300px', height: '300px' }}></div>
      <div ref={containerRef} className="floating-ui-container w-full max-w-md text-center">
        <div className="flex flex-col items-center mb-10">
          <BookOpenIcon className={`w-24 h-24 sm:w-28 sm:h-28 mb-4 ${appNameColor}`} />
          <h1 className={`text-5xl sm:text-6xl font-bold ${headingColor}`}>{APP_NAME}</h1>
          <p className={`mt-3 text-lg ${textColor}`}>Unlock your potential. Sign in to continue.</p>
        </div>

        <div className="space-y-5">
          <button
            type="button"
            onClick={() => onSocialLogin('google')}
            disabled={loading}
            className={`glass-button w-full font-medium py-4 px-5 rounded-xl shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center gap-3 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70`}
          >
            <GoogleIcon className="w-6 h-6" /> Continue with Google
          </button>
          <button
            type="button"
            onClick={() => onSocialLogin('github')}
            disabled={loading}
            className={`glass-button w-full font-medium py-4 px-5 rounded-xl shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center gap-3 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70`}
          >
            <GitHubIcon className="w-6 h-6" /> Continue with GitHub
          </button>
        </div>

        {error && <p id="error-message" className={`text-base ${errorTextColor} text-center mt-8`} aria-live="assertive">{error}</p>}

      </div>
      <p className={`mt-12 text-sm ${textColor} opacity-70`}>
        &copy; {new Date().getFullYear()} {APP_NAME}
      </p>
    </div>
  );
};

export default LoginPage;