import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { messageAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Search, Edit, MoreVertical, Send, Paperclip, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import './Messages.css';

export default function ChatPage() {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Threads state
  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Active Chat state
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(true);
  
  // Input state
  const [body, setBody] = useState('');
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch threads for sidebar
  const fetchThreads = useCallback(async () => {
    try {
      const res = await messageAPI.inbox();
      setThreads(res.data.threads);
    } catch (err) {
      console.error(err);
    } finally {
      setThreadsLoading(false);
    }
  }, []);

  // Fetch active chat
  const fetchChat = useCallback(async () => {
    try {
      const res = await messageAPI.chat(username);
      setOtherUser(res.data.other_user);
      setMessages(res.data.messages);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  }, [username]);

  // Initial load and polling
  useEffect(() => {
    fetchThreads();
    fetchChat();
    const interval = setInterval(() => {
      fetchThreads();
      fetchChat();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchThreads, fetchChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!body.trim() && !file) return;
    setSending(true);

    try {
      let data = { body };
      if (file) {
        data = new FormData();
        data.append('body', body);
        data.append('attachment', file);
      }
      const res = await messageAPI.send(username, data);
      setMessages(prev => [...prev, res.data]);
      setBody('');
      setFile(null);
      // Update thread list as well
      fetchThreads();
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const filteredThreads = threads.filter(t => 
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="messages-layout">
      {/* Sidebar: Threads List (hidden on small screens when a chat is open) */}
      <div className="messages-sidebar d-none-sm">
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
          {threadsLoading ? (
            <div className="p-4 space-y-4">
              <div className="skeleton" style={{ height: '60px' }}></div>
              <div className="skeleton" style={{ height: '60px' }}></div>
            </div>
          ) : filteredThreads.length > 0 ? (
            filteredThreads.map(t => (
              <Link 
                key={t.username} 
                to={`/messages/${t.username}`} 
                className={`thread-item ${t.unread_count > 0 ? 'unread' : ''} ${t.username === username ? 'active' : ''}`}
              >
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

      {/* Main Area: Active Chat */}
      <div className="messages-main">
        {chatLoading && !otherUser ? (
          <div className="flex items-center justify-center h-full">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <button className="icon-btn d-block-sm mr-2" onClick={() => navigate('/messages')}>
                <ArrowLeft size={20} />
              </button>
              <div className="chat-recipient">
                <Avatar fallback={otherUser?.full_name[0]} size="sm" />
                <div className="recipient-info">
                  <h3 className="recipient-name">{otherUser?.full_name}</h3>
                  <span className="recipient-status">
                    <span className="status-dot online"></span> Online
                  </span>
                </div>
              </div>
              <div className="chat-actions">
                <button className="icon-btn"><MoreVertical size={20} /></button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="chat-messages scrollbar-custom">
              {messages.length > 0 ? (
                messages.map((m, index) => {
                  const isMine = m.sender === user?.username;
                  const showAvatar = index === messages.length - 1 || messages[index + 1].sender !== m.sender;
                  
                  return (
                    <div key={m.id} className={`message-wrapper ${isMine ? 'mine' : 'theirs'}`}>
                      {!isMine && showAvatar ? (
                        <div className="message-avatar">
                          <Avatar fallback={otherUser?.full_name[0]} size="sm" />
                        </div>
                      ) : (
                        <div className="message-avatar-placeholder"></div>
                      )}
                      
                      <div className="message-content">
                        <div className="message-bubble">
                          {m.attachment && (
                            <div className="message-attachment">
                              <a href={m.attachment} target="_blank" rel="noopener noreferrer">
                                <ImageIcon size={20} />
                                <span>View Attachment</span>
                              </a>
                            </div>
                          )}
                          {m.body && <p className="message-text">{m.body}</p>}
                        </div>
                        <span className="message-time">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-chat-state">
                  <p>Say hi to {otherUser?.full_name}!</p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-input-container">
              {file && (
                <div className="attachment-preview">
                  <span className="attachment-name">📎 {file.name}</span>
                  <button type="button" className="remove-btn" onClick={() => setFile(null)}>×</button>
                </div>
              )}
              
              <form onSubmit={handleSend} className="chat-input-form">
                <label className="attach-button">
                  <Paperclip size={20} />
                  <input type="file" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
                </label>
                
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Write a message..."
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  disabled={sending}
                  autoComplete="off"
                />
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="send-button"
                  disabled={sending || (!body.trim() && !file)}
                  icon={Send}
                />
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
