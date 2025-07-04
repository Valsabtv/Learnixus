
import React from 'react';
import ReactDOM from 'react-dom/client';
import MiniTimer from "./src/components/MiniTimer";
import { ThemeProvider } from './src/contexts/ThemeContext';

const rootElement = document.getElementById('mini-root');
if (!rootElement) {
  throw new Error("Could not find mini-root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <MiniTimer />
    </ThemeProvider>
  </React.StrictMode>
);
