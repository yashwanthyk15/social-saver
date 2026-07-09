import React from 'react';

const CONFIG = {
  all:       { icon: '📭', title: 'Nothing saved yet',         sub: 'Send any link to the Telegram bot and it will appear here.' },
  search:    { icon: '🔍', title: 'No results found',           sub: 'Try different keywords or clear the search.' },
  favorites: { icon: '⭐', title: 'No favorites yet',           sub: 'Tap the star on any card to add it to favorites.' },
  category:  { icon: '🗂',  title: 'Nothing in this category',  sub: 'Save more content and it will be categorized automatically.' },
};

export default function EmptyState({ view }) {
  const { icon, title, sub } = CONFIG[view] || CONFIG.all;
  return (
    <div className="empty-state">
      <div className="empty-icon-wrap">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-sub">{sub}</p>
    </div>
  );
}
