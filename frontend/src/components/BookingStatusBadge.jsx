export default function BookingStatusBadge({ status }) {
  const map = {
    pending: 'badge-pending',
    accepted: 'badge-accepted',
    rejected: 'badge-rejected',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
  };
  return <span className={`badge ${map[status] || 'badge-primary'}`}>{status}</span>;
}
