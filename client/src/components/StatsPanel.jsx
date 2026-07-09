import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp } from 'lucide-react';
import { api } from '../utils/api';

const PLATFORM_ICON = {
  instagram: '📸', twitter: '🐦', youtube: '▶️',
  reddit: '🟠', linkedin: '💼', generic: '🔗',
};

export default function StatsPanel({ onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal stats-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
      >
        <div className="modal-header">
          <h2><TrendingUp size={16} /> Your Stats</h2>
          <button className="close-btn" onClick={onClose}><X size={14} /></button>
        </div>

        {loading && <div className="modal-loading">Loading your stats…</div>}
        {!loading && !stats && <div className="modal-empty">Could not load stats. Try again.</div>}

        {!loading && stats && (
          <div className="stats-body">
            {/* Big numbers */}
            <div className="stats-grid">
              {[
                { num: stats.total,           label: 'Total Saved' },
                { num: stats.favorites,        label: 'Favorites' },
                { num: stats.totalCategories,  label: 'Categories' },
              ].map(({ num, label }) => (
                <motion.div
                  key={label} className="stat-box"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="stat-num">{num}</span>
                  <span className="stat-label">{label}</span>
                </motion.div>
              ))}
            </div>

            {/* By Platform */}
            {stats.platforms?.length > 0 && (
              <>
                <p className="stats-section-title">By Platform</p>
                <div className="platform-list">
                  {stats.platforms.map((p) => (
                    <div key={p._id} className="platform-row">
                      <span>{PLATFORM_ICON[p._id] || '🔗'} {p._id}</span>
                      <span className="platform-count">{p.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Top Categories bar chart */}
            {stats.categoryCounts?.length > 0 && (
              <>
                <p className="stats-section-title">Top Categories</p>
                <div className="category-bars">
                  {stats.categoryCounts.map((c, i) => {
                    const pct = stats.total > 0 ? Math.round((c.count / stats.total) * 100) : 0;
                    return (
                      <div key={i} className="cat-bar-row">
                        <span className="cat-bar-label" title={c._id}>{c._id}</span>
                        <div className="cat-bar-track">
                          <motion.div
                            className="cat-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: i * 0.05 + 0.2, duration: 0.7, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="cat-bar-count">{c.count}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
