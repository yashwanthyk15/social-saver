import React from "react";

const platformIcon = (platform) => {
  if (platform === "instagram") return "📸";
  if (platform === "twitter") return "🐦";
  return "🔗";
};

const ContentCard = ({ item, onDelete }) => {
  const formattedDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString()
    : "";

  const handleDeleteClick = () => {
    if (!window.confirm("Delete this item?")) return;
    onDelete(item._id);   // 👈 Let App handle API call
  };

  return (
    <div className="card">
      {item.image && (
        <img
          src={item.image}
          alt="preview"
          className="card-image"
        />
      )}

      <div className="badge">
        {platformIcon(item.platform)} {item.category}
      </div>

      <p>{item.aiSummary}</p>

      <div className="card-footer">
        <span className="date">{formattedDate}</span>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="open-link"
        >
          Open →
        </a>

        <button
          className="delete-btn"
          onClick={handleDeleteClick}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ContentCard;