import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { freelancerAPI, bookingAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import EmptyState from '../components/EmptyState';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { 
  MapPin, Star, Heart, Calendar, Briefcase, ExternalLink, 
  ShieldCheck, MessageSquare, ArrowLeft, CheckCircle2, Globe, Code, Sparkles 
} from 'lucide-react';
import './TalentDetailPage.css';

export default function TalentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({ start_date: '', end_date: '', description: '' });
  const [bookingStatus, setBookingStatus] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingStatus('');
    setBookingError('');
    setSubmitting(true);
    try {
      await bookingAPI.create(id, bookingForm);
      setBookingStatus('Booking request sent successfully! The freelancer will review it shortly.');
      setBookingForm({ start_date: '', end_date: '', description: '' });
    } catch (err) {
      setBookingError(err.response?.data?.error || 'Failed to send booking request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFav = async () => {
    if (!user) return;
    try {
      const res = await freelancerAPI.toggleFavourite(id);
      setProfile((p) => ({ ...p, is_favourite: res.data.is_favourite }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container page-content mt-12">
        <div className="talent-detail-grid">
          <div className="main-col">
            <div className="skeleton skeleton-card mb-6" style={{ height: '240px' }} />
            <div className="skeleton skeleton-card mb-6" style={{ height: '300px' }} />
          </div>
          <div className="sidebar-col">
            <div className="skeleton skeleton-card" style={{ height: '420px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container page-content mt-12">
        <EmptyState
          icon="⚡"
          title="Talent Profile Not Found"
          message="This professional profile is either unavailable or has been deactivated."
          action={
            <Link to="/">
              <Button variant="lime" size="md" icon={ArrowLeft}>
                Back to Directory
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const isAvailable = profile.availability === true || profile.availability === 'available';
  const displayAvatar = profile.avatar_url || profile.profile_picture;
  const professionalTitle = profile.title || (profile.skills?.[0] ? `${profile.skills[0]} Architect & Engineer` : 'Technical Consultant');

  return (
    <div className="nexora-talent-detail-page page-content">
      {/* Dark Futuristic Profile Header */}
      <div className="profile-hero-dark">
        <div className="container">
          <div className="profile-back-nav">
            <Link to="/" className="back-link">
              <ArrowLeft size={16} /> Back to Directory
            </Link>
          </div>

          <div className="profile-header-layout">
            <div className="profile-avatar-block">
              <div className="detail-avatar-ring">
                <Avatar
                  src={displayAvatar}
                  fallback={(profile.full_name || profile.username || 'U')[0].toUpperCase()}
                  size="xl"
                  className="detail-main-avatar"
                />
                <span className="detail-verified-pill" title="Verified Expert">
                  <ShieldCheck size={16} color="#151521" />
                </span>
              </div>
            </div>

            <div className="profile-info-block">
              <div className="profile-title-line">
                <h1 className="profile-fullname">{profile.full_name || profile.username}</h1>
                <span className={`detail-status-chip ${isAvailable ? 'available' : 'busy'}`}>
                  <span className="dot-pulse" />
                  {isAvailable ? 'Available Now' : 'Currently Busy'}
                </span>
              </div>

              <p className="profile-role-sub">{professionalTitle}</p>

              <div className="profile-badges-strip">
                {profile.location && (
                  <span className="detail-meta-tag">
                    <MapPin size={14} className="text-lime" /> {profile.location}
                  </span>
                )}
                <span className="detail-meta-tag">
                  <Star size={14} fill="#F59E0B" color="#F59E0B" />
                  <strong>{profile.avg_rating || '5.0'}</strong>
                  <span className="text-muted">({profile.review_count || 0} reviews)</span>
                </span>
                {profile.hourly_rate && (
                  <span className="detail-meta-tag rate-tag">
                    ${profile.hourly_rate}<span className="unit">/hr</span>
                  </span>
                )}
              </div>

              {/* Social / Portfolio Links */}
              <div className="profile-social-links">
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noreferrer" className="profile-ext-link">
                    <Code size={14} /> GitHub
                  </a>
                )}
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="profile-ext-link">
                    <Globe size={14} /> LinkedIn
                  </a>
                )}
                {profile.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noreferrer" className="profile-ext-link">
                    <Globe size={14} /> Website
                  </a>
                )}
              </div>
            </div>

            <div className="profile-actions-block">
              {user && user.username !== profile.username && (
                <>
                  <Link to={`/messages/${profile.username}`}>
                    <Button variant="lime" size="md" icon={MessageSquare}>
                      Direct Message
                    </Button>
                  </Link>
                  <Button
                    variant={profile.is_favourite ? 'danger' : 'outline-light'}
                    size="md"
                    onClick={handleToggleFav}
                    icon={Heart}
                  >
                    {profile.is_favourite ? 'Saved' : 'Save'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Booking Sidebar */}
      <div className="container detail-content-body">
        <div className="talent-detail-grid">
          {/* Main Column */}
          <div className="main-col">
            {/* About Card */}
            <div className="detail-card">
              <div className="detail-card-head">
                <Sparkles size={18} className="text-purple" />
                <h3>About & Background</h3>
              </div>
              <p className="bio-paragraph">
                {profile.bio || 'This professional has not written a comprehensive bio yet, but has verified skills and is ready for project bookings.'}
              </p>

              <h4 className="detail-subhead">Core Competencies & Frameworks</h4>
              <div className="detail-skills-grid">
                {(profile.skills || []).map((s) => (
                  <span key={s} className="skill-pill-large">
                    <CheckCircle2 size={13} className="text-lime" /> {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Portfolio Card */}
            <div className="detail-card">
              <div className="detail-card-head">
                <Briefcase size={18} className="text-purple" />
                <h3>Verified Portfolio Projects ({profile.portfolio?.length || 0})</h3>
              </div>

              {profile.portfolio && profile.portfolio.length > 0 ? (
                <div className="portfolio-gallery-grid">
                  {profile.portfolio.map((item) => (
                    <div key={item.id} className="portfolio-showcase-item">
                      {item.image ? (
                        <div className="port-thumb-box">
                          <img src={item.image} alt={item.title} className="port-thumb-img" />
                        </div>
                      ) : (
                        <div className="port-thumb-placeholder">
                          <Briefcase size={28} className="text-purple" />
                        </div>
                      )}
                      <div className="port-item-info">
                        <h4 className="port-item-title">{item.title}</h4>
                        <p className="port-item-desc">{item.description}</p>
                        {item.external_link && (
                          <a
                            href={item.external_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="port-item-link"
                          >
                            View Live Project <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-sub-block">
                  <p className="text-muted">No portfolio items published yet.</p>
                </div>
              )}
            </div>

            {/* Reviews Card */}
            <div className="detail-card">
              <div className="detail-card-head">
                <Star size={18} className="text-purple" />
                <h3>Client Reviews ({profile.review_count || 0})</h3>
              </div>

              {profile.reviews && profile.reviews.length > 0 ? (
                <div className="reviews-stack">
                  {profile.reviews.map((r) => (
                    <div key={r.id} className="client-review-item">
                      <div className="review-top-row">
                        <div className="reviewer-meta">
                          <Avatar fallback={r.reviewer[0]} size="sm" />
                          <div>
                            <strong className="reviewer-name">{r.reviewer}</strong>
                            <div className="review-time">{new Date(r.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="review-star-row">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i <= r.rating ? '#F59E0B' : 'none'}
                              color={i <= r.rating ? '#F59E0B' : '#C4C4D4'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="review-text">“{r.comment}”</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-sub-block">
                  <p className="text-muted">No reviews recorded yet. Be the first to book and rate this expert!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column: Booking Widget */}
          <div className="sidebar-col">
            <div className="booking-widget-card sticky-sidebar">
              <div className="booking-header">
                <h3 className="booking-widget-title">Book This Expert</h3>
                <p className="booking-widget-sub">Milestone escrow guarantee with full refund protection.</p>
              </div>

              {user ? (
                user.username === profile.username ? (
                  <div className="self-booking-notice">
                    <p>You are viewing your own public profile.</p>
                    <Link to="/profile/edit">
                      <Button variant="purple" size="md" className="w-full mt-4">
                        Edit My Profile
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="booking-form-wrap">
                    {bookingStatus && (
                      <div className="alert alert-success">
                        <CheckCircle2 size={16} /> {bookingStatus}
                      </div>
                    )}
                    {bookingError && (
                      <div className="alert alert-danger">
                        {bookingError}
                      </div>
                    )}

                    <div className="date-fields-row">
                      <div className="flex-1">
                        <Input
                          label="Start Date"
                          type="date"
                          value={bookingForm.start_date}
                          onChange={(e) => setBookingForm({ ...bookingForm, start_date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          label="End Date"
                          type="date"
                          value={bookingForm.end_date}
                          onChange={(e) => setBookingForm({ ...bookingForm, end_date: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group mt-4">
                      <label className="ui-input-label">Project Scope & Deliverables</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        placeholder="Detail the technical specifications, deliverables, and estimated hours..."
                        value={bookingForm.description}
                        onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="lime"
                      size="lg"
                      className="w-full mt-4"
                      isLoading={submitting}
                      icon={Calendar}
                    >
                      Submit Booking Request
                    </Button>

                    <div className="booking-guarantee-note">
                      <ShieldCheck size={14} color="#059669" />
                      <span>Zero upfront fee. Funds held in milestone escrow.</span>
                    </div>
                  </form>
                )
              ) : (
                <div className="guest-booking-prompt">
                  <p className="mb-4">Create a free account or log in to initiate a verified contract with {profile.full_name || profile.username}.</p>
                  <Link to="/signup">
                    <Button variant="lime" size="lg" className="w-full mb-3">
                      Sign Up to Book
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="secondary" size="md" className="w-full">
                      Log In
                    </Button>
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
