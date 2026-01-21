import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const commands = [
    { id: 'dashboard', label: 'Go to Dashboard', action: () => navigate('/dashboard'), icon: '🏠' },
    { id: 'profile', label: 'Go to Profile', action: () => navigate('/profile'), icon: '👤' },
    { id: 'settings', label: 'Go to Settings', action: () => navigate('/settings'), icon: '⚙️' },
    { id: 'analytics', label: 'Go to Analytics', action: () => navigate('/analytics'), icon: '📊' },
    { id: 'teams', label: 'Go to Teams', action: () => navigate('/teams'), icon: '👥' },
    { id: 'notifications', label: 'Go to Notifications', action: () => navigate('/notifications'), icon: '🔔' },
  ];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults(commands);
    } else {
      const filtered = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    }
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSelect = (command) => {
    command.action();
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md mx-4">
        <div className="p-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-50 rounded border-0 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="max-h-80 overflow-y-auto">
          {results.map((command, index) => (
            <button
              key={command.id}
              onClick={() => handleSelect(command)}
              className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
            >
              <span className="text-lg">{command.icon}</span>
              <span className="text-slate-900 dark:text-slate-50">{command.label}</span>
            </button>
          ))}
          {results.length === 0 && (
            <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
              No commands found
            </div>
          )}
        </div>
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
          Press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
