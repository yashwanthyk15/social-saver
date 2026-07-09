import React from 'react';
import { BarChart2, Sun, Moon, BookOpen } from 'lucide-react';

export default function Navbar({ total, onShowStats, theme, onToggleTheme }) {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="nav-logo-wrap">📚</div>
        <span className="nav-title">Social Saver</span>
      </div>

      <div className="nav-right">
        {total > 0 && (
          <div className="nav-pill">
            <span className="nav-pill-dot" />
            {total} saved
          </div>
        )}

        <button
          className="nav-icon-btn theme-toggle"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <button className="nav-stats-btn" onClick={onShowStats}>
          <BarChart2 size={14} />
          Stats
        </button>
      </div>
    </nav>
  );
}
