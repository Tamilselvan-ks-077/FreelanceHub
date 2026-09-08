import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { freelancerAPI, bookingAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import EmptyState from '../components/EmptyState';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { MapPin, Star, Heart, Calendar, Briefcase, ExternalLink } from 'lucide-react';
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
      <div className="container page-content mt-12">
        <div className="talent-detail-grid">
          <div className="main-col">
            <div className="glass rounded-xl p-8 mb-6" style={{ height: '300px' }} />
            <div className="glass rounded-xl p-8 mb-6" style={{ height: '200px' }} />
          </div>
          <div className="sidebar-col">
            <div className="glass rounded-xl p-8" style={{ height: '400px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container page-content mt-12">
        <EmptyState icon="😕" title="Freelancer not found" message="This profile might have been removed." />
      </div>
    );
  }

  // Mock title if backend doesn't provide
  const professionalTitle = profile.title || "Freelance Professional";

  return (
    <div className="talent-detail-page">
      {/* Profile Header Banner Area */}
      <div className="profile-banner">
        <div className="container">
          <div className="profile-header-content">
            <div className="profile-avatar-wrapper">
              <Avatar 
                src={profile.profile_picture} 
                fallback={profile.full_name[0]} 
                size="xl" 
                className="profile-main-avatar"
              />
            </div>
            
            <div className="profile-header-info">
              <div className="profile-name-row">
                <h1 className="profile-name">{profile.full_name}</h1>
                <Badge variant={
                  profile.availability === 'available' ? 'success' : 
                  profile.availability === 'busy' ? 'warning' : 'error'
                } className="availability-badge">
                  {profile.availability}
                </Badge>
              </div>
              
              <p className="profile-title">{professionalTitle}</p>
              
              <div className="profile-meta-row">
                {profile.location && (
                  <span className="profile-meta-item">
                    <MapPin size={16} />
                    {profile.location}
                  </span>
                )}
                <span className="profile-meta-item">
                  <Star className="star-icon filled" size={16} />
                  <strong>{profile.avg_rating || 'New'}</strong> 
                  {profile.review_count > 0 && ` (${profile.review_count} reviews)`}
                </span>
                {profile.hourly_rate && (
                  <span className="profile-meta-item rate-highlight">
                    ₹{profile.hourly_rate}/hr
                  </span>
                )}
              </div>
            </div>
            
            <div className="profile-header-actions">
              {user && user.id !== profile.user_id && (
                <Button 
                  variant={profile.is_favourite ? "secondary" : "outline"} 
                  onClick={handleToggleFav}
                  icon={Heart}
                  className={profile.is_favourite ? "text-red-500" : ""}
                >
                  {profile.is_favourite ? 'Saved' : 'Save'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container page-content content-overlap">
        <div className="talent-detail-grid">
          {/* Main Content */}
          <div className="main-col">
            
            {/* About Section */}
            <section className="profile-section glass animate-in">
              <h2 className="section-title">About</h2>
              <p className="bio-text">{profile.bio || 'No bio provided.'}</p>
              
              <h3 className="subsection-title">Skills & Expertise</h3>
              <div className="skills-wrap">
                {profile.skills.map(s => (
                  <Badge key={s} variant="neutral" className="skill-badge">{s}</Badge>
                ))}
              </div>
            </section>

            {/* Portfolio Section */}
            <section className="profile-section glass animate-in" style={{ animationDelay: '0.1s' }}>
              <h2 className="section-title">Portfolio</h2>
              {profile.portfolio.length > 0 ? (
                <div className="portfolio-grid">
                  {profile.portfolio.map(p => (
                    <div key={p.id} className="portfolio-card">
                      {p.image ? (
                        <div className="portfolio-img-wrapper">
                          <img src={p.image} alt={p.title} className="portfolio-img" />
                        </div>
                      ) : (
                        <div className="portfolio-img-placeholder">
                          <Briefcase size={32} />
                        </div>
                      )}
                      <div className="portfolio-card-content">
                        <h4 className="portfolio-title">{p.title}</h4>
                        <p className="portfolio-desc">{p.description}</p>
                        {p.external_link && (
                          <a href={p.external_link} target="_blank" rel="noopener noreferrer" className="portfolio-link">
                            <ExternalLink size={14} /> View Project
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon="🖼️" title="No portfolio" message="This professional hasn't added any portfolio items yet." />
              )}
            </section>

            {/* Reviews Section */}
            <section className="profile-section glass animate-in" style={{ animationDelay: '0.2s' }}>
              <h2 className="section-title">Reviews <span className="text-tertiary font-normal">({profile.review_count})</span></h2>
              {profile.reviews.length > 0 ? (
                <div className="reviews-list">
                  {profile.reviews.map(r => (
                    <div key={r.id} className="review-card">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <Avatar fallback={r.reviewer[0]} size="sm" />
                          <div>
                            <strong>{r.reviewer}</strong>
                            <div className="review-date">{new Date(r.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="review-rating">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} size={14} className={`star-icon ${i <= r.rating ? 'filled' : 'empty'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="review-comment">{r.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon="⭐" title="No reviews yet" message="Be the first to work with and review this professional." />
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="sidebar-col">
            <div className="booking-card glass sticky-card animate-in" style={{ animationDelay: '0.3s' }}>
              <h3 className="booking-title">Book this Professional</h3>
              
              {user ? (
                user.id === profile.user_id ? (
                  <div className="self-profile-notice">
                    <p>This is your profile view.</p>
                    <Button variant="outline" className="w-full mt-4" onClick={() => window.location.href='/profile/edit'}>
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="booking-form">
                    {bookingStatus && (
                      <div className="status-message success">
                        {bookingStatus}
                      </div>
                    )}
                    {bookingError && (
                      <div className="status-message error">
                        {bookingError}
                      </div>
                    )}

                    <div className="form-row">
                      <div className="form-group flex-1">
                        <Input
                          label="Start Date"
                          type="date"
                          value={bookingForm.start_date}
                          onChange={e => setBookingForm({ ...bookingForm, start_date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group flex-1">
                        <Input
                          label="End Date"
                          type="date"
                          value={bookingForm.end_date}
                          onChange={e => setBookingForm({ ...bookingForm, end_date: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="ui-input-label mb-1 block">Project Details</label>
                      <textarea
                        className="ui-input custom-textarea"
                        value={bookingForm.description}
                        onChange={e => setBookingForm({ ...bookingForm, description: e.target.value })}
                        required
                        placeholder="Describe the scope of work, deliverables, and any specific requirements..."
                        rows={4}
                      ></textarea>
                    </div>
                    
                    <Button type="submit" variant="primary" size="lg" className="w-full mt-2" icon={Calendar}>
                      Send Booking Request
                    </Button>
                    <p className="booking-help">You won't be charged yet. The professional needs to accept first.</p>
                  </form>
                )
              ) : (
                <div className="login-prompt">
                  <p>Log in or sign up to send a booking request to {profile.full_name}.</p>
                  <Link to="/login">
                    <Button variant="primary" className="w-full">Log In to Book</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
