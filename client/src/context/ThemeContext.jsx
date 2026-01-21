import React, { createContext, useState, useEffect } from 'react';

/**
 * Theme Context for managing light/dark/system theme states
 */
export const ThemeContext = createContext();

/**
 * Theme Provider Component
 * @component
 * @example
 * <ThemeProvider><App /></ThemeProvider>
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
    setMounted(true);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const applyTheme = (selectedTheme) => {
    const html = document.documentElement;
    const isDark = selectedTheme === 'dark' ||
      (selectedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
