import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Trash2, StickyNote } from 'lucide-react';
import NoteModal from './NoteModal';

const PLATFORM_ICON  = { instagram: '📸', twitter: '🐦', youtube: '▶️', reddit: '🟠', linkedin: '💼', generic: '🔗' };
const PLATFORM_LABEL = { instagram: 'Instagram', twitter: 'Twitter / X', youtube: 'YouTube', reddit: 'Reddit', linkedin: 'LinkedIn', generic: 'Web' };

export default function ContentCard({ item, onDelete, onToggleFavorite, onUpdateNote }) {
  const [showNote, setShowNote] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const formattedDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const handleDelete = async () => {
    if (!window.confirm('Remove this item from your collection?')) return;
    setDeleting(true);
    try { await onDelete(item._id); }
    catch { setDeleting(false); }
  };

  const handleFav = async () => {
    if (favLoading) return;
    setFavLoading(true);
    try { await onToggleFavorite(item._id); }
    finally { setFavLoading(false); }
  };

  // 3D transform states
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Max rotation 8 degrees
    setRotateX(((y - centerY) / centerY) * -8);
    setRotateY(((x - centerX) / centerX) * 8);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <>
      <motion.div
        className={`card ${deleting ? 'card-deleting' : ''}`}
        layout
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX, rotateY, z: rotateX || rotateY ? 30 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* ── Image ── */}
        {item.image && !imgError && (
          <div className="card-img-wrap">
            <img
              src={item.image}
              alt="preview"
              className="card-image"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          </div>
        )}

        {/* ── Body ── */}
        <div className="card-body">
          {/* Header: badge + fav */}
          <div className="card-header-row">
            <span className="badge" title={item.category}>
              {PLATFORM_ICON[item.platform] || '🔗'} {item.category}
            </span>
            <button
              className={`fav-btn ${item.isFavorite ? 'fav-active' : ''}`}
              onClick={handleFav}
              disabled={favLoading}
              title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {item.isFavorite ? '★' : '☆'}
            </button>
          </div>

          {/* Summary */}
          <p className="card-summary">{item.aiSummary || 'No summary available.'}</p>

          {/* Tags */}
          {item.tags?.length > 0 && (
            <div className="tags-row">
              {item.tags.map((tag, i) => (
                <span key={i} className="tag">#{tag}</span>
              ))}
            </div>
          )}

          {/* User note */}
          {item.userNote && (
            <div className="note-preview">
              <span className="note-icon">📌</span>
              <span className="note-text">{item.userNote}</span>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="card-footer">
          <div className="card-meta">
            <span className="platform-badge">
              {PLATFORM_ICON[item.platform] || '🔗'} {PLATFORM_LABEL[item.platform] || 'Web'}
            </span>
            <span className="meta-dot">·</span>
            <span className="date">{formattedDate}</span>
          </div>

          <div className="card-actions">
            <button
              className="action-btn note-btn"
              onClick={() => setShowNote(true)}
              title="Add / edit note"
            >
              <StickyNote size={13} />
            </button>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn open-btn"
              title="Open original link"
            >
              <ExternalLink size={13} />
            </a>
            <button
              className="action-btn del-btn"
              onClick={handleDelete}
              disabled={deleting}
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </motion.div>

      {showNote && (
        <NoteModal
          item={item}
          onSave={onUpdateNote}
          onClose={() => setShowNote(false)}
        />
      )}
    </>
  );
}
