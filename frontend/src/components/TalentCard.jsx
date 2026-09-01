import { Link } from 'react-router-dom';
import './TalentCard.css';

function Stars({ rating, count }) {
  if (!rating) return <span className="no-rating">No reviews yet</span>;
  const full = Math.round(rating);
  return (
    <span className="stars-row">
      <span className="stars">
        {[1,2,3,4,5].map(i => (
          <span key={i} className={`star ${i <= full ? '' : 'empty'}`}>★</span>
        ))}
      </span>
      <span className="rating-text">{rating} ({count})</span>
    </span>
  );
}

export default function TalentCard({ freelancer, onToggleFav }) {
  const {
    id, full_name, bio, location, hourly_rate, availability,
    profile_picture, skills, avg_rating, review_count, is_favourite
  } = freelancer;

  return (
    <div className="talent-card card animate-in">
      <div className="talent-card-header">
        <Link to={`/freelancer/${id}`} className="talent-avatar-link">
          {profile_picture ? (
            <img src={profile_picture} alt={full_name} className="avatar avatar-lg" />
          ) : (
            <span className="avatar avatar-lg avatar-placeholder">{full_name[0]}</span>
          )}
        </Link>
        {onToggleFav && (
          <button
            className={`fav-btn ${is_favourite ? 'active' : ''}`}
            onClick={() => onToggleFav(id)}
            aria-label={is_favourite ? 'Remove from favourites' : 'Add to favourites'}
          >
            {is_favourite ? '♥' : '♡'}
          </button>
        )}
      </div>

      <Link to={`/freelancer/${id}`} className="talent-card-body">
        <h3 className="talent-name">{full_name}</h3>
        {location && <p className="talent-location">📍 {location}</p>}
        <Stars rating={avg_rating} count={review_count} />
        <p className="talent-bio">{bio}</p>
      </Link>

      <div className="talent-card-footer">
        <div className="talent-skills">
          {skills.map(s => <span key={s} className="badge badge-primary">{s}</span>)}
        </div>
        <div className="talent-meta">
          {hourly_rate && <span className="talent-rate">₹{hourly_rate}/hr</span>}
          <span className={`badge badge-${availability === 'available' ? 'success' : availability === 'busy' ? 'warning' : 'danger'}`}>
            {availability}
          </span>
        </div>
      </div>
    </div>
  );
}
