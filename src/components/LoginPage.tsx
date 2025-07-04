
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { APP_NAME, LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR } from '../constants';
import { BookOpenIcon } from './IconComponents'; // Assuming you have a Google and Github icon, or will add them
import { useNotification } from '../contexts/NotificationContext';

// Placeholder icons - replace with actual ones if available or create them in IconComponents
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
  onLogin: (email: string, pass: string) => void;
  onSignUp: (email: string, pass: string) => void;
  onSocialLogin: (provider: 'google' | 'github') => void;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSignUp, onSocialLogin, loading, error, setError }) => {
  const { theme } = useTheme();
  const { addNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const accentColor = theme === 'light' ? LIGHT_ACCENT_COLOR : DARK_ACCENT_COLOR;
  const pageBg = theme === 'light' ? 'bg-slate-100' : 'bg-slate-900';
  const cardBg = theme === 'light' ? 'bg-white' : 'bg-slate-800';
  const textColor = theme === 'light' ? 'text-slate-700' : 'text-slate-200';
  const headingColor = theme === 'light' ? 'text-slate-800' : 'text-slate-50';
  const appNameColor = theme === 'light' ? `text-${accentColor}-600` : `text-${accentColor}-400`;
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-300 focus:ring-indigo-500 focus:border-indigo-500' : 'bg-slate-700 border-slate-600 focus:ring-sky-500 focus:border-sky-500';
  const inputTextColor = theme === 'light' ? 'text-slate-900 placeholder-slate-400' : 'text-slate-100 placeholder-slate-400';
  const labelColor = theme === 'light' ? 'text-slate-600' : 'text-slate-300';
  const primaryButtonBg = `bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-600 hover:from-${accentColor}-600 hover:to-${accentColor}-700`;
  const primaryButtonFocusRing = `focus:ring-${accentColor}-400`;
  const secondaryButtonBg = theme === 'light' ? `bg-slate-200 hover:bg-slate-300 text-slate-700` : `bg-slate-600 hover:bg-slate-500 text-slate-200`;
  const secondaryButtonFocusRing = theme === 'light' ? `focus:ring-slate-400` : `focus:ring-slate-500`;
  const socialButtonBg = theme === 'light' ? 'bg-white hover:bg-slate-50 border-slate-300' : 'bg-slate-700 hover:bg-slate-600 border-slate-500';
  const socialButtonTextColor = theme === 'light' ? 'text-slate-600' : 'text-slate-300';
  const errorTextColor = theme === 'light' ? 'text-red-600' : 'text-red-400';

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password cannot be empty.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = (action: 'login' | 'signup') => {
    if (!validateForm()) return;

    if (action === 'login') {
      onLogin(email, password);
    } else {
      onSignUp(email, password);
    }
  };


  return (
    <div className={`min-h-screen ${pageBg} flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 ease-in-out animate-fadeIn`}>
      <div className={`w-full max-w-md ${cardBg} p-6 sm:p-8 rounded-xl shadow-2xl`}>
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <BookOpenIcon className={`w-16 h-16 sm:w-20 sm:h-20 mb-3 ${appNameColor}`} />
          <h1 className={`text-3xl sm:text-4xl font-bold ${headingColor}`}>{APP_NAME}</h1>
          <p className={`mt-1.5 text-sm ${textColor} text-center`}>Your personalized learning hub.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit('login'); }} className="space-y-5">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${labelColor} mb-1.5`}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`w-full border ${inputBg} ${inputTextColor} rounded-lg p-3 focus:ring-2 focus:outline-none transition-colors duration-200 ease-in-out shadow-sm text-sm`}
              required
              aria-describedby={error ? "error-message" : undefined}
            />
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${labelColor} mb-1.5`}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full border ${inputBg} ${inputTextColor} rounded-lg p-3 focus:ring-2 focus:outline-none transition-colors duration-200 ease-in-out shadow-sm text-sm`}
              required
              aria-describedby={error ? "error-message" : undefined}
            />
          </div>
          
          {error && <p id="error-message" className={`text-xs ${errorTextColor} text-center`} aria-live="assertive">{error}</p>}

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${primaryButtonBg} text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out flex items-center justify-center text-sm focus:outline-none focus:ring-2 ${primaryButtonFocusRing} focus:ring-offset-2 ${theme === 'light' ? 'focus:ring-offset-white' : `focus:ring-offset-${cardBg.split('-')[1]}`} disabled:opacity-70`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('signup')}
              disabled={loading}
              className={`w-full ${secondaryButtonBg} font-semibold py-3 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out flex items-center justify-center text-sm focus:outline-none focus:ring-2 ${secondaryButtonFocusRing} focus:ring-offset-2 ${theme === 'light' ? 'focus:ring-offset-white' : `focus:ring-offset-${cardBg.split('-')[1]}`} disabled:opacity-70`}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="my-6 sm:my-8 flex items-center">
          <hr className={`flex-grow border-t ${theme === 'light' ? 'border-slate-300' : 'border-slate-600'}`} />
          <span className={`px-3 text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Or continue with</span>
          <hr className={`flex-grow border-t ${theme === 'light' ? 'border-slate-300' : 'border-slate-600'}`} />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => onSocialLogin('google')}
            disabled={loading}
            className={`w-full border ${socialButtonBg} ${socialButtonTextColor} font-medium py-2.5 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out flex items-center justify-center gap-2 text-sm focus:outline-none focus:ring-2 ${theme === 'light' ? 'focus:ring-slate-300' : 'focus:ring-slate-500'} focus:ring-offset-1 disabled:opacity-70`}
          >
            <GoogleIcon className="w-5 h-5" /> Continue with Google
          </button>
          <button
            type="button"
            onClick={() => onSocialLogin('github')}
            disabled={loading}
            className={`w-full border ${socialButtonBg} ${socialButtonTextColor} font-medium py-2.5 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out flex items-center justify-center gap-2 text-sm focus:outline-none focus:ring-2 ${theme === 'light' ? 'focus:ring-slate-300' : 'focus:ring-slate-500'} focus:ring-offset-1 disabled:opacity-70`}
          >
            <GitHubIcon className="w-5 h-5" /> Continue with GitHub
          </button>
        </div>
      </div>
      <p className={`mt-8 text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
        &copy; {new Date().getFullYear()} {APP_NAME}
      </p>
    </div>
  );
};

export default LoginPage;
