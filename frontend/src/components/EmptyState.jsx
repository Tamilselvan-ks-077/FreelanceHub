export default function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className="empty-state animate-in">
      <span className="empty-state-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{message}</p>
      {action && action}
    </div>
  );
}
