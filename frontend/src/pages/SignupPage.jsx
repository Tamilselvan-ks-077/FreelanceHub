import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Briefcase, Target, ShieldCheck } from 'lucide-react';
import './AuthPages.css';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'client',
    terms_agreed: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Create Account | FreelanceHub';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.terms_agreed) {
      setError('You must agree to the Terms & Conditions and Privacy Policy to create an account.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.friendlyMessage || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card animate-in">
        <div className="auth-header">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3" style={{ background: 'var(--bg-sage-subtle)', color: 'var(--forest-green)' }}>
            <ShieldCheck size={20} strokeWidth={1.5} />
          </div>
          <h1>Create account</h1>
          <p>Join FreelanceHub and start collaborating</p>
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
              required
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
              placeholder="At least 8 characters"
              required
              minLength={8}
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
                <span className="role-icon" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Briefcase size={20} strokeWidth={1.5} />
                </span>
                <span>Client</span>
                <span className="role-desc">I want to hire</span>
              </button>
              <button
                type="button"
                className={`role-option ${form.role === 'freelancer' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'freelancer' })}
              >
                <span className="role-icon" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Target size={20} strokeWidth={1.5} />
                </span>
                <span>Freelancer</span>
                <span className="role-desc">I want to work</span>
              </button>
            </div>
          </div>

          {/* Legal Consent Checkbox (DPDP & GDPR Compliance) */}
          <div className="form-group mb-4" style={{ marginTop: '0.75rem' }}>
            <label className="flex items-start gap-2 cursor-pointer text-xs" style={{ color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                required
                checked={form.terms_agreed}
                onChange={(e) => setForm({ ...form, terms_agreed: e.target.checked })}
                className="mt-0.5"
                style={{ accentColor: 'var(--terracotta)' }}
              />
              <span>
                I agree to the <Link to="/terms" target="_blank" className="underline font-semibold" style={{ color: 'var(--forest-green)' }}>Terms & Conditions</Link> and acknowledge the <Link to="/privacy" target="_blank" className="underline font-semibold" style={{ color: 'var(--forest-green)' }}>Privacy Policy</Link> (DPDP Act & GDPR compliant).
              </span>
            </label>
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
