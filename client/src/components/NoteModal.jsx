import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';

export default function NoteModal({ item, onSave, onClose }) {
  const [note, setNote] = useState(item.userNote || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(item._id, note);
    setSaving(false);
    onClose();
  };

  const handleKey = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSave();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal note-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
      >
        <div className="modal-header">
          <h2><span>📝</span> Personal Note</h2>
          <button className="close-btn" onClick={onClose}><X size={14} /></button>
        </div>

        <p className="note-hint">Write your own thoughts about this saved item. <kbd>Ctrl+Enter</kbd> to save.</p>

        <textarea
          className="note-textarea"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={handleKey}
          placeholder="e.g. Try this workout on leg day — especially the Bulgarian split squat part…"
          maxLength={500}
          autoFocus
        />

        <div className="note-footer">
          <span className="note-chars" style={{ color: note.length > 450 ? 'var(--gold)' : undefined }}>
            {note.length}/500
          </span>
          <div className="note-actions">
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              <Save size={13} />
              {saving ? 'Saving…' : 'Save Note'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
