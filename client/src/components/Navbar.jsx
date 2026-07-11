import React from 'react';
import { BarChart2, Sun, Moon, Bookmark } from 'lucide-react';
import SidebarChat from './SidebarChat';

export default function Navbar({ total, onShowStats, theme, onToggleTheme }) {
  return (
    <aside className="sidebar">
      <div className="nav-brand">
        <div className="nav-logo-wrap">
          <Bookmark size={18} fill="currentColor" />
        </div>
        <span className="nav-title">Social Saver</span>
      </div>

      <div className="sidebar-chat-wrapper" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <SidebarChat />
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
    </aside>
  );
}
