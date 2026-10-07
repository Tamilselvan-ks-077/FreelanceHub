import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import SkeletonCard from '../components/SkeletonCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { User, Camera, ArrowLeft, Save, CheckCircle2 } from 'lucide-react';

export default function ProfileEditPage() {
  const { user, refetch } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    location: '',
    hourly_rate: '',
    availability: 'available',
    github_url: '',
    linkedin_url: '',
    website_url: '',
    skills: '',
  });

  const fetchProfile = useCallback(async () => {
    try {
      const res = await profileAPI.get();
      const p = res.data;
      setForm({
        full_name: p.full_name || '',
        bio: p.bio || '',
        location: p.location || '',
        hourly_rate: p.hourly_rate || '',
        availability: p.availability || 'available',
        github_url: p.github_url || '',
        linkedin_url: p.linkedin_url || '',
        website_url: p.website_url || '',
        skills: p.skills ? p.skills.join(', ') : '',
      });
      if (p.avatar_url || p.profile_picture) {
        setPreviewImage(p.avatar_url || p.profile_picture);
      }
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, profile_picture: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key] !== null && form[key] !== undefined) {
          formData.append(key, form[key]);
        }
      });

      await profileAPI.update(formData);
      await refetch();
      setSuccess('Profile updated successfully.');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-content mt-8">
        <SkeletonCard count={1} />
      </div>
    );
  }

  return (
    <div className="container page-content mt-8" style={{ maxWidth: 780 }}>
      <div className="section-header flex items-center justify-between mb-6">
        <div>
          <h1>Edit Profile</h1>
          <p>Update your public details, rate, and technical skills</p>
        </div>
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <div className="card">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && (
          <div className="alert alert-success">
            <CheckCircle2 size={16} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Avatar Upload */}
          <div className="form-group flex flex-col items-center mb-8">
            <div
              style={{
                width: 108,
                height: 108,
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#F3F2FA',
                cursor: 'pointer',
                border: '3px solid var(--purple-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
                boxShadow: 'var(--shadow-card)',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewImage ? (
                <img src={previewImage} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Camera size={32} color="var(--purple-primary)" />
              )}
            </div>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--purple-primary)',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              Change Photo
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="full_name"
                className="form-control"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Alex Rivera"
                required
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                name="location"
                className="form-control"
                value={form.location}
                onChange={handleChange}
                placeholder="San Francisco, CA or Remote"
              />
            </div>
          </div>

          {user?.role === 'freelancer' && (
            <div className="grid grid-2">
              <div className="form-group">
                <label>Hourly Rate ($/hr)</label>
                <input
                  type="number"
                  name="hourly_rate"
                  className="form-control"
                  value={form.hourly_rate}
                  onChange={handleChange}
                  placeholder="85"
                />
              </div>
              <div className="form-group">
                <label>Availability Status</label>
                <select
                  name="availability"
                  className="form-control"
                  value={form.availability}
                  onChange={handleChange}
                >
                  <option value="available">Available Now</option>
                  <option value="busy">Currently Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Bio / Professional Summary</label>
            <textarea
              name="bio"
              className="form-control"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell clients about your background, specializations, and years of experience..."
            />
          </div>

          {user?.role === 'freelancer' && (
            <div className="form-group">
              <label>Skills & Frameworks (comma separated)</label>
              <input
                name="skills"
                className="form-control"
                value={form.skills}
                onChange={handleChange}
                placeholder="e.g. React, Django, PostgreSQL, Next.js, Cloud Architecture"
              />
            </div>
          )}

          <div className="grid grid-3" style={{ marginTop: 20 }}>
            <div className="form-group">
              <label>GitHub URL</label>
              <input
                type="url"
                name="github_url"
                className="form-control"
                value={form.github_url}
                onChange={handleChange}
                placeholder="https://github.com/username"
              />
            </div>
            <div className="form-group">
              <label>LinkedIn URL</label>
              <input
                type="url"
                name="linkedin_url"
                className="form-control"
                value={form.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="form-group">
              <label>Personal Website</label>
              <input
                type="url"
                name="website_url"
                className="form-control"
                value={form.website_url}
                onChange={handleChange}
                placeholder="https://yourportfolio.io"
              />
            </div>
          </div>

          <div className="profile-form-actions">
            <Button type="submit" variant="lime" size="lg" isLoading={saving} icon={Save}>
              Save Profile
            </Button>
            <Button type="button" variant="secondary" size="lg" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
