import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { MapPin, Star, Heart, ShieldCheck, ArrowRight, Sparkles, Check } from 'lucide-react';
import './TalentCard.css';

function Stars({ rating, count }) {
  if (!rating) {
    return <span className="no-rating-pill">★ New Artisan</span>;
  }
  return (
    <span className="stars-pill">
      <Star className="star-icon filled" size={13} strokeWidth={1.5} fill="#C78539" color="#C78539" />
      <span className="rating-value">{rating}</span>
      <span className="rating-count">({count || 0})</span>
    </span>
  );
}

export default function TalentCard({ freelancer, onToggleFav }) {
  const navigate = useNavigate();
  const {
    id,
    full_name,
    username,
    bio,
    location,
    hourly_rate,
    availability,
    avatar_url,
    profile_picture,
    skills = [],
    avg_rating,
    review_count,
    is_favourite,
    title,
  } = freelancer;

  const displayName = full_name || username || 'Verified Artisan';
  const displayAvatar = avatar_url || profile_picture;
  const isAvailable = availability === true || availability === 'available';

  return (
    <div className="botanical-talent-card">
      {/* Top Header */}
      <div className="talent-card-header">
        <Link to={`/freelancer/${id}`} className="talent-avatar-link">
          <div className="talent-avatar-wrapper">
            <Avatar
              src={displayAvatar}
              fallback={displayName[0].toUpperCase()}
              size="lg"
              className="talent-card-avatar"
            />
            <span className="avatar-verified-badge" title="Botanical Verified Talent">
              <ShieldCheck size={13} strokeWidth={1.5} color="#FAF9F6" />
            </span>
          </div>
        </Link>

        {onToggleFav && (
          <button
            type="button"
            className={`talent-fav-btn ${is_favourite ? 'is-fav' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFav(id);
            }}
            aria-label={is_favourite ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart size={17} strokeWidth={1.5} fill={is_favourite ? '#C27B66' : 'none'} color={is_favourite ? '#C27B66' : '#7A887F'} />
          </button>
        )}
      </div>

      {/* Main Card Body */}
      <div className="talent-card-body">
        <div className="talent-meta-top">
          <Link to={`/freelancer/${id}`} className="talent-name-link">
            <h3 className="talent-card-name">{displayName}</h3>
          </Link>
          <span className="talent-role-tag">
            {title || (skills[0] ? `${skills[0]} Specialist` : 'Software Craftsman')}
          </span>
        </div>

        <div className="talent-location-rating-row">
          <div className="talent-location">
            <MapPin size={13} strokeWidth={1.5} className="location-icon" />
            <span>{location || 'Remote'}</span>
          </div>
          <Stars rating={avg_rating} count={review_count} />
        </div>

        {bio && (
          <p className="talent-card-bio">
            {bio.length > 115 ? `${bio.slice(0, 115)}...` : bio}
          </p>
        )}

        {/* Skills Tag Cloud */}
        <div className="talent-skills-container">
          {skills.slice(0, 4).map((skill, index) => (
            <span key={index} className="talent-skill-badge">
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="talent-skill-more">+{skills.length - 4}</span>
          )}
        </div>
      </div>

      {/* Card Footer: Rate & Action */}
      <div className="talent-card-footer">
        <div className="talent-rate-block">
          <span className="rate-amount">${hourly_rate || '45'}</span>
          <span className="rate-unit">/ hr</span>
        </div>

        <div className="talent-action-block">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/freelancer/${id}`)}
            className="talent-view-btn"
          >
            View Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
