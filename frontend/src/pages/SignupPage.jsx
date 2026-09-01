import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AuthPages.css';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'client' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card animate-in">
        <div className="auth-header">
          <span className="auth-icon">◆</span>
          <h1>Create account</h1>
          <p>Join FreelanceHub and get started</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form-control"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Choose a username"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Create a strong password"
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">I am a...</label>
            <div className="role-select">
              <button
                type="button"
                className={`role-option ${form.role === 'client' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'client' })}
              >
                <span className="role-icon">💼</span>
                <span>Client</span>
                <span className="role-desc">I want to hire</span>
              </button>
              <button
                type="button"
                className={`role-option ${form.role === 'freelancer' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'freelancer' })}
              >
                <span className="role-icon">🎯</span>
                <span>Freelancer</span>
                <span className="role-desc">I want to work</span>
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
