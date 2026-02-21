import React from "react";
import axios from "axios";

const BASE_URL = "https://social-saver-backend.onrender.com";

const ContentCard = ({ item, onDelete }) => {
  if (!item) return null;

  const formattedDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString()
    : null;

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmDelete) return;

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

      {item.category && (
        <div className="badge">{item.category}</div>
      )}

      {item.aiSummary && <p>{item.aiSummary}</p>}

      <div className="card-footer">
        {formattedDate && <span>Saved on {formattedDate}</span>}

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