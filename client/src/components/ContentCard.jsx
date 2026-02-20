const ContentCard = ({ item }) => {
  if (!item.aiSummary) return null;

  return (
    <div className="card">
      <div className="badge">{item.category}</div>

      <p>{item.aiSummary}</p>

      <a href={item.url} target="_blank" rel="noopener noreferrer">
        Open on Instagram →
      </a>
    </div>
  );
};

export default ContentCard;
