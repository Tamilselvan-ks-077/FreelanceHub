import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { messageAPI } from '../services/api';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import './Messages.css';

export default function InboxPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchThreads = useCallback(async () => {
    try {
      const res = await messageAPI.inbox();
      setThreads(res.data.threads);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  if (loading) return <div className="container page-content"><SkeletonCard count={3} /></div>;

  return (
    <div className="container page-content" style={{ maxWidth: 800 }}>
      <div className="section-header">
        <h1>Messages</h1>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {threads.length > 0 ? (
          <div className="inbox-list">
            {threads.map(t => (
              <Link key={t.username} to={`/messages/${t.username}`} className={`inbox-item ${t.unread_count > 0 ? 'unread' : ''}`}>
                <div className="inbox-avatar">
                  <span className="avatar avatar-placeholder">{t.full_name[0]}</span>
                </div>
                <div className="inbox-content">
                  <div className="inbox-header">
                    <span className="inbox-name">{t.full_name}</span>
                    <span className="inbox-date">
                      {t.last_message_at ? new Date(t.last_message_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <div className="inbox-preview">
                    {t.last_message || 'Attachment sent'}
                  </div>
                </div>
                {t.unread_count > 0 && <span className="nav-badge inbox-badge">{t.unread_count}</span>}
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon="💬" title="No messages" message="Your inbox is empty." />
        )}
      </div>
    </div>
  );
}
