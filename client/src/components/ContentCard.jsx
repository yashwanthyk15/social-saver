import React from "react";
import axios from "axios";

const BASE_URL = "https://social-saver-backend.onrender.com";

const platformIcon = (platform) => {
  if (platform === "instagram") return "📸";
  if (platform === "twitter") return "🐦";
  return "🔗";
};

const ContentCard = ({ item, onDelete }) => {
  const formattedDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString()
    : null;

  const handleDelete = async () => {
    if (!window.confirm("Delete this item?")) return;

    try {
      await axios.delete(
        `${BASE_URL}/dashboard/delete/${item._id}`
      );
      onDelete(item._id);
    } catch (error) {
      console.error("Delete failed:", error);
    }
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
        <span>{formattedDate}</span>

        <div className="card-actions">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open →
          </a>

          <button className="delete-btn" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;