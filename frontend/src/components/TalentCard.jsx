import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import { MapPin, Star, Heart } from 'lucide-react';
import './TalentCard.css';

function Stars({ rating, count }) {
  if (!rating) return <span className="no-rating">No reviews yet</span>;
  return (
    <span className="stars-row">
      <Star className="star-icon filled" size={14} />
      <span className="rating-text">
        <strong>{rating}</strong> ({count})
      </span>
    </span>
  );
}

export default function TalentCard({ freelancer, onToggleFav }) {
  const {
    id, full_name, bio, location, hourly_rate, availability,
    profile_picture, skills, avg_rating, review_count, is_favourite,
    title = "Freelance Professional" // Mock title if not provided by backend
  } = freelancer;

  return (
    <div className="talent-card glass animate-in">
      <div className="talent-card-header">
        <Link to={`/freelancer/${id}`} className="talent-avatar-link">
          <Avatar 
            src={profile_picture} 
            fallback={full_name[0]} 
            size="lg" 
          />
        </Link>
        {onToggleFav && (
          <button
            className={`fav-btn ${is_favourite ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onToggleFav(id);
            }}
            aria-label={is_favourite ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Heart size={20} className={is_favourite ? 'heart-filled' : ''} />
          </button>
        )}
      </div>

      <Link to={`/freelancer/${id}`} className="talent-card-body">
        <div className="talent-name-wrapper">
          <h3 className="talent-name">{full_name}</h3>
          <span className="talent-title">{title}</span>
        </div>
        
        <div className="talent-meta-row">
          {location && (
            <span className="talent-location">
              <MapPin size={14} />
              {location}
            </span>
          )}
          <Stars rating={avg_rating} count={review_count} />
        </div>
        
        <p className="talent-bio">{bio}</p>
      </Link>

      <div className="talent-card-footer">
        <div className="talent-skills">
          {skills.slice(0, 3).map(s => (
            <Badge key={s} variant="neutral">{s}</Badge>
          ))}
          {skills.length > 3 && (
            <Badge variant="neutral">+{skills.length - 3}</Badge>
          )}
        </div>
        
        <div className="talent-meta-footer">
          {hourly_rate && (
            <div className="talent-rate-wrapper">
              <span className="talent-rate">₹{hourly_rate}</span>
              <span className="talent-rate-suffix">/hr</span>
            </div>
          )}
          <Badge variant={
            availability === 'available' ? 'success' : 
            availability === 'busy' ? 'warning' : 'error'
          }>
            {availability}
          </Badge>
        </div>
      </div>
    </div>
  );
}
