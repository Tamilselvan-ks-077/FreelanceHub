import { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import Badge from '../components/ui/Badge';
import { Bell, CheckCircle2, Calendar, DollarSign, MessageSquare, Sparkles } from 'lucide-react';

export default function NotificationsPage() {
  const { refetch } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationAPI.list();
      setNotifications(res.data.notifications || []);

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

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (loading) {
    return (
      <div className="container page-content mt-8" style={{ maxWidth: 800 }}>
        <SkeletonCard count={3} />
      </div>
    );
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return <Calendar size={18} className="text-purple" />;
      case 'payment':
        return <DollarSign size={18} className="text-lime" />;
      case 'message':
        return <MessageSquare size={18} className="text-purple" />;
      default:
        return <Bell size={18} className="text-purple" />;
    }
  };

  return (
    <div className="container page-content mt-8" style={{ maxWidth: 820 }}>
      <div className="section-header mb-6">
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: '#151521',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--neon-lime)',
            }}
          >
            <Bell size={20} />
          </div>
          <div>
            <h1>Notifications</h1>
            <p>Stay updated on booking milestones, messages, and payouts</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {notifications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: n.is_read ? '#FFFFFF' : 'var(--purple-soft)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  transition: 'background var(--transition-fast)',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: n.is_read ? '#F3F2FA' : '#FFFFFF',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {getNotificationIcon(n.notification_type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <strong style={{ fontSize: '1rem', color: '#151521' }}>
                      {n.verb}
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {n.description && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                      {n.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '3rem 1.5rem' }}>
            <EmptyState
              icon="🔔"
              title="All Caught Up"
              message="You have no notifications at the moment."
            />
          </div>
        )}
      </div>
    </div>
  );
}
