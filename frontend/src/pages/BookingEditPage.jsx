import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import BookingStatusBadge from '../components/BookingStatusBadge';
import SkeletonCard from '../components/SkeletonCard';

export default function BookingEditPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ start_date: '', end_date: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchBooking = useCallback(async () => {
    try {
      const res = await bookingAPI.detail(id);
      const b = res.data;
      setBooking(b);
      setForm({
        start_date: b.start_date.split('T')[0],
        end_date: b.end_date.split('T')[0],
        description: b.description || ''
      });
    } catch (err) {
      setError('Booking not found or not authorised.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await bookingAPI.update(id, form);
      setBooking(res.data);
      alert('Booking updated.');
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async (action) => {
    if (!window.confirm(`Are you sure you want to ${action} this booking?`)) return;
    setSaving(true);
    setError('');
    try {
      const res = await bookingAPI.action(id, action);
      setBooking(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Action failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    setSaving(true);
    try {
      const res = await bookingAPI.cancel(id);
      setBooking(prev => ({ ...prev, status: 'cancelled' }));
    } catch (err) {
      setError(err.response?.data?.error || 'Cancel failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container page-content"><SkeletonCard count={1} /></div>;
  if (!booking) return <div className="container page-content"><div className="alert alert-danger">{error}</div></div>;

  const isClient = user.id === booking.client.id;
  const isFreelancer = user.id === booking.freelancer.id;
  const canEdit = isClient && booking.status === 'pending';

  return (
    <div className="container page-content" style={{ maxWidth: 700 }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Manage Booking #{booking.id}</h1>
          <p style={{ marginTop: 8 }}>
            Between <strong>{booking.client.full_name}</strong> and <strong>{booking.freelancer.full_name}</strong>
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="card">
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleUpdate}>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" className="form-control" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} disabled={!canEdit} required />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" className="form-control" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} disabled={!canEdit} required />
            </div>
          </div>
          <div className="form-group">
            <label>Project Details</label>
            <textarea className="form-control" value={form.description} onChange={e => setForm({...form, description: e.target.value})} disabled={!canEdit} required rows={5}></textarea>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
            {canEdit && (
              <button type="submit" className="btn btn-primary" disabled={saving}>Update Details</button>
            )}

            {isFreelancer && booking.status === 'pending' && (
              <>
                <button type="button" className="btn btn-success" onClick={() => handleAction('accept')} disabled={saving}>Accept Request</button>
                <button type="button" className="btn btn-danger" onClick={() => handleAction('reject')} disabled={saving}>Reject</button>
              </>
            )}

            {(isClient || isFreelancer) && booking.status === 'accepted' && (
              <button type="button" className="btn btn-info" onClick={() => handleAction('complete')} disabled={saving}>Mark Completed</button>
            )}

            {isClient && (booking.status === 'pending' || booking.status === 'accepted') && (
              <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={saving}>Cancel Booking</button>
            )}

            <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')} style={{ marginLeft: 'auto' }}>
              Back to Dashboard
            </button>
          </div>
        </form>

        {booking.invoice && (
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-subtle)' }}>
            <h3>Invoice Information</h3>
            <p style={{ marginTop: 8 }}>
              Amount: <strong style={{ color: 'var(--brand-primary)', fontSize: '1.2rem' }}>₹{booking.invoice.amount}</strong>
            </p>
            <p>Status: <span className={`badge ${booking.invoice.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{booking.invoice.status}</span></p>
          </div>
        )}
      </div>
    </div>
  );
}
