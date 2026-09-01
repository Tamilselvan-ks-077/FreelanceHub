import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { freelancerAPI, bookingAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import EmptyState from '../components/EmptyState';
import './TalentDetailPage.css';

export default function TalentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({ start_date: '', end_date: '', description: '' });
  const [bookingStatus, setBookingStatus] = useState('');
  const [bookingError, setBookingError] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const res = await freelancerAPI.detail(id);
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingStatus('');
    setBookingError('');
    try {
      await bookingAPI.create(id, bookingForm);
      setBookingStatus('Booking request sent successfully!');
      setBookingForm({ start_date: '', end_date: '', description: '' });
    } catch (err) {
      setBookingError(err.response?.data?.error || 'Failed to send booking request.');
    }
  };

  const handleToggleFav = async () => {
    if (!user) return;
    try {
      const res = await freelancerAPI.toggleFavourite(id);
      setProfile(p => ({ ...p, is_favourite: res.data.is_favourite }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container page-content">
        <div className="skeleton skeleton-card" style={{ height: 400 }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container page-content">
        <EmptyState icon="😕" title="Freelancer not found" message="This profile might have been removed." />
      </div>
    );
  }

  return (
    <div className="container page-content">
      <div className="talent-detail-grid">
        {/* Main Content */}
        <div className="main-col">
          <div className="card talent-header-card animate-in">
            <div className="talent-header-info">
              {profile.profile_picture ? (
                <img src={profile.profile_picture} alt={profile.full_name} className="avatar avatar-xl" />
              ) : (
                <span className="avatar avatar-xl avatar-placeholder">{profile.full_name[0]}</span>
              )}
              <div className="talent-header-text">
                <h1>{profile.full_name}</h1>
                {profile.location && <p className="location">📍 {profile.location}</p>}
                
                <div className="talent-meta-tags">
                  <span className={`badge badge-${profile.availability === 'available' ? 'success' : profile.availability === 'busy' ? 'warning' : 'danger'}`}>
                    {profile.availability}
                  </span>
                  {profile.hourly_rate && (
                    <span className="rate-badge">₹{profile.hourly_rate}/hr</span>
                  )}
                </div>
              </div>
            </div>

            <div className="talent-actions">
              {user && user.id !== profile.user_id && (
                <button
                  className={`btn btn-secondary ${profile.is_favourite ? 'fav-active' : ''}`}
                  onClick={handleToggleFav}
                >
                  {profile.is_favourite ? '♥ Saved' : '♡ Save'}
                </button>
              )}
            </div>
          </div>

          <div className="card animate-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="section-title">About</h2>
            <p className="bio-text">{profile.bio || 'No bio provided.'}</p>

            <h3 className="subsection-title">Skills</h3>
            <div className="skills-wrap">
              {profile.skills.map(s => <span key={s} className="badge badge-primary">{s}</span>)}
            </div>
          </div>

          <div className="card animate-in" style={{ animationDelay: '0.15s' }}>
            <h2 className="section-title">Portfolio</h2>
            {profile.portfolio.length > 0 ? (
              <div className="portfolio-grid">
                {profile.portfolio.map(p => (
                  <div key={p.id} className="portfolio-item">
                    {p.image && <img src={p.image} alt={p.title} className="portfolio-img" />}
                    <h4>{p.title}</h4>
                    <p>{p.description}</p>
                    {p.external_link && <a href={p.external_link} target="_blank" rel="noopener noreferrer">View Link</a>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No portfolio items added yet.</p>
            )}
          </div>

          <div className="card animate-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="section-title">Reviews ({profile.review_count})</h2>
            {profile.reviews.length > 0 ? (
              <div className="reviews-list">
                {profile.reviews.map(r => (
                  <div key={r.id} className="review-item">
                    <div className="review-header">
                      <strong>{r.reviewer}</strong>
                      <span className="stars">
                        {[1,2,3,4,5].map(i => (
                          <span key={i} className={`star ${i <= r.rating ? '' : 'empty'}`}>★</span>
                        ))}
                      </span>
                    </div>
                    <p>{r.comment}</p>
                    <small className="text-muted">{new Date(r.created_at).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No reviews yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar-col">
          <div className="card sticky-card animate-in" style={{ animationDelay: '0.25s' }}>
            <h3 className="section-title">Book this Talent</h3>
            
            {user ? (
              user.id === profile.user_id ? (
                <p className="text-muted text-center">This is your profile.</p>
              ) : (
                <form onSubmit={handleBookingSubmit} className="booking-form">
                  {bookingStatus && <div className="alert alert-success">{bookingStatus}</div>}
                  {bookingError && <div className="alert alert-danger">{bookingError}</div>}

                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={bookingForm.start_date}
                      onChange={e => setBookingForm({ ...bookingForm, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={bookingForm.end_date}
                      onChange={e => setBookingForm({ ...bookingForm, end_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Project Details</label>
                    <textarea
                      className="form-control"
                      value={bookingForm.description}
                      onChange={e => setBookingForm({ ...bookingForm, description: e.target.value })}
                      required
                      placeholder="Describe the work..."
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                    Send Request
                  </button>
                </form>
              )
            ) : (
              <div className="text-center">
                <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                  Log in to book {profile.full_name}.
                </p>
                <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>Log In</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
