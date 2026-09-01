import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { messageAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './Messages.css';

export default function ChatPage() {
  const { username } = useParams();
  const { user } = useAuth();
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  const fetchChat = useCallback(async () => {
    try {
      const res = await messageAPI.chat(username);
      setOtherUser(res.data.other_user);
      setMessages(res.data.messages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [username]);

  // Initial load and polling (since no websockets are configured)
  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [fetchChat]);

  // Scroll to bottom
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
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (loading && !otherUser) return <div className="container page-content">Loading...</div>;

  return (
    <div className="container page-content chat-page-container">
      <div className="chat-layout card glass-panel">
        
        <div className="chat-header">
          <Link to="/messages" className="back-btn">← Back</Link>
          <div className="chat-header-info">
            <span className="avatar avatar-placeholder">{otherUser?.full_name[0]}</span>
            <h2>{otherUser?.full_name}</h2>
          </div>
        </div>

        <div className="chat-messages-area">
          {messages.length > 0 ? (
            messages.map(m => (
              <div key={m.id} className={`chat-bubble-wrap ${m.sender === user?.username ? 'sent' : 'received'}`}>
                <div className="chat-bubble">
                  {m.body && <p className="msg-body">{m.body}</p>}
                  {m.attachment && (
                    <a href={m.attachment} target="_blank" rel="noopener noreferrer" className="msg-attachment">
                      📎 Attachment
                    </a>
                  )}
                  <div className="msg-meta">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
              No messages yet. Say hi to {otherUser?.full_name}!
            </p>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} className="chat-input-area">
          {file && <div className="file-preview">📎 {file.name} <button type="button" onClick={() => setFile(null)}>×</button></div>}
          <div className="chat-input-row">
            <label className="file-attach-btn" title="Attach file">
              📎
              <input type="file" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Type a message..."
              value={body}
              onChange={e => setBody(e.target.value)}
              disabled={sending}
            />
            <button type="submit" className="btn btn-primary" disabled={sending || (!body.trim() && !file)}>
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
