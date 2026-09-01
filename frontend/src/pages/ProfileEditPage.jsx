import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import SkeletonCard from '../components/SkeletonCard';

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
    full_name: '', bio: '', location: '', hourly_rate: '',
    availability: 'available', github_url: '', linkedin_url: '',
    website_url: '', skills: ''
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
      if (p.profile_picture) setPreviewImage(p.profile_picture);
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

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
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== undefined) {
          formData.append(key, form[key]);
        }
      });
      
      await profileAPI.update(formData);
      await refetch();
      setSuccess('Profile updated successfully.');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container page-content"><SkeletonCard count={1} /></div>;

  return (
    <div className="container page-content" style={{ maxWidth: 700 }}>
      <div className="section-header">
        <h1>Edit Profile</h1>
      </div>

      <div className="card">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ alignItems: 'center', marginBottom: 32 }}>
            <div 
              style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-surface-hover)', cursor: 'pointer', border: '2px dashed var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewImage ? (
                <img src={previewImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '2rem' }}>📷</span>
              )}
            </div>
            <label style={{ cursor: 'pointer', color: 'var(--brand-primary)' }} onClick={() => fileInputRef.current?.click()}>
              Change Avatar
            </label>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Full Name</label>
              <input name="full_name" className="form-control" value={form.full_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input name="location" className="form-control" value={form.location} onChange={handleChange} />
            </div>
          </div>

          {user?.role === 'freelancer' && (
            <div className="grid grid-2">
              <div className="form-group">
                <label>Hourly Rate (₹)</label>
                <input type="number" name="hourly_rate" className="form-control" value={form.hourly_rate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Availability</label>
                <select name="availability" className="form-control" value={form.availability} onChange={handleChange}>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Bio</label>
            <textarea name="bio" className="form-control" value={form.bio} onChange={handleChange} rows={4}></textarea>
          </div>

          {user?.role === 'freelancer' && (
            <div className="form-group">
              <label>Skills (comma separated)</label>
              <input name="skills" className="form-control" value={form.skills} onChange={handleChange} placeholder="e.g. React, Django, UI/UX" />
            </div>
          )}

          <div className="grid grid-2" style={{ marginTop: 24 }}>
            <div className="form-group">
              <label>GitHub URL</label>
              <input type="url" name="github_url" className="form-control" value={form.github_url} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>LinkedIn URL</label>
              <input type="url" name="linkedin_url" className="form-control" value={form.linkedin_url} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Website URL</label>
              <input type="url" name="website_url" className="form-control" value={form.website_url} onChange={handleChange} />
            </div>
          </div>

          <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
