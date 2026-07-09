import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="card skeleton-card" aria-hidden="true">
      <div className="sk sk-img" />
      <div className="card-body" style={{ gap: 12 }}>
        <div className="sk sk-badge" />
        <div className="sk sk-line" />
        <div className="sk sk-line sk-short" />
        <div className="sk sk-gap" />
        <div className="sk sk-footer" />
      </div>
    </div>
  );
}
