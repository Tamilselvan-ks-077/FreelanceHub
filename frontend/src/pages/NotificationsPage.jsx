import { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';

export default function NotificationsPage() {
  const { refetch } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationAPI.list();
      setNotifications(res.data.notifications);
      
      if (res.data.unread_count > 0) {
        await notificationAPI.markRead();
        await refetch();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  if (loading) return <div className="container page-content"><SkeletonCard count={3} /></div>;

  return (
    <div className="container page-content" style={{ maxWidth: 800 }}>
      <div className="section-header">
        <h1>Notifications</h1>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {notifications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map(n => (
              <div 
                key={n.id} 
                style={{
                  padding: 'var(--space-4)',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: n.is_read ? 'transparent' : 'hsla(217, 91%, 60%, 0.08)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontSize: '1.05rem', color: n.is_read ? 'var(--text-primary)' : 'var(--brand-primary)' }}>
                    {n.verb}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                {n.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{n.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="🔔" title="No notifications" message="You're all caught up!" />
        )}
      </div>
    </div>
  );
}
