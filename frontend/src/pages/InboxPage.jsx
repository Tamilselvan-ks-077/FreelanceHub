import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { messageAPI } from '../services/api';
import EmptyState from '../components/EmptyState';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { Search, Edit, MoreVertical } from 'lucide-react';
import './Messages.css';

export default function InboxPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredThreads = threads.filter(t => 
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="messages-layout">
      {/* Sidebar: Threads List */}
      <div className="messages-sidebar">
        <div className="sidebar-header">
          <div className="header-title-row">
            <h2>Messages</h2>
            <button className="icon-btn"><Edit size={18} /></button>
          </div>
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="threads-list">
          {loading ? (
            <div className="p-4 space-y-4">
              <div className="skeleton" style={{ height: '60px' }}></div>
              <div className="skeleton" style={{ height: '60px' }}></div>
              <div className="skeleton" style={{ height: '60px' }}></div>
            </div>
          ) : filteredThreads.length > 0 ? (
            filteredThreads.map(t => (
              <Link key={t.username} to={`/messages/${t.username}`} className={`thread-item ${t.unread_count > 0 ? 'unread' : ''}`}>
                <Avatar fallback={t.full_name[0]} size="md" />
                <div className="thread-info">
                  <div className="thread-meta">
                    <span className="thread-name">{t.full_name}</span>
                    <span className="thread-date">
                      {t.last_message_at ? new Date(t.last_message_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                  <div className="thread-preview-row">
                    <span className="thread-preview">
                      {t.last_message || 'Attachment sent'}
                    </span>
                    {t.unread_count > 0 && <Badge variant="primary" className="rounded-full px-2 py-0.5">{t.unread_count}</Badge>}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-tertiary">
              <p>No messages found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Area: Empty State */}
      <div className="messages-main empty-chat-main">
        <div className="empty-chat-state">
          <div className="empty-chat-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h3>Your Messages</h3>
          <p>Select a conversation from the sidebar or start a new one to chat.</p>
        </div>
      </div>
    </div>
  );
}
