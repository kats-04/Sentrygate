import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

/**
 * Theme Toggle Component with Light/Dark/System modes
 * @component
 * @example
 * <ThemeToggle onChange={(theme) => console.log(theme)} />
 */
const ThemeToggle = ({ onChange = null, size = 'md' }) => {
  const [theme, setTheme] = useState('system');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
    setMounted(true);
  }, []);

  const applyTheme = (selectedTheme) => {
    const html = document.documentElement;
    if (selectedTheme === 'dark') {
      html.classList.add('dark');
    } else if (selectedTheme === 'light') {
      html.classList.remove('dark');
    } else {
      // System preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  };

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];

    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);

    if (onChange) {
      onChange(nextTheme);
    }
  };

  if (!mounted) {
    return null;
  }

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  const iconClass = 'transition-transform duration-300';

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg glass-effect hover:bg-slate-100 dark:hover:bg-slate-700 transition-smooth focus-ring"
      title={`Current theme: ${theme}`}
      aria-label={`Toggle theme (current: ${theme})`}
    >
      {theme === 'light' && <Sun size={iconSize} className={iconClass} />}
      {theme === 'dark' && <Moon size={iconSize} className={iconClass} />}
      {theme === 'system' && <Monitor size={iconSize} className={iconClass} />}
    </button>
  );
};

export default ThemeToggle;
