import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import BookingStatusBadge from '../components/BookingStatusBadge';
import SkeletonCard from '../components/SkeletonCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Calendar, ShieldCheck, ArrowLeft, Check, X, Ban, DollarSign } from 'lucide-react';

export default function BookingEditPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ start_date: '', end_date: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchBooking = useCallback(async () => {
    try {
      const res = await bookingAPI.detail(id);
      const b = res.data;
      setBooking(b);
      setForm({
        start_date: b.start_date.split('T')[0],
        end_date: b.end_date.split('T')[0],
        description: b.description || '',
      });
    } catch (err) {
      setError('Booking not found or not authorized.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await bookingAPI.update(id, form);
      setBooking(res.data);
      setMessage('Booking updated successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async (action) => {
    if (!window.confirm(`Are you sure you want to ${action} this booking contract?`)) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await bookingAPI.action(id, action);
      setBooking(res.data);
      setMessage(`Booking marked as ${action}.`);
    } catch (err) {
      setError(err.response?.data?.error || 'Action failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await bookingAPI.cancel(id);
      setBooking((prev) => ({ ...prev, status: 'cancelled' }));
      setMessage('Booking cancelled.');
    } catch (err) {
      setError(err.response?.data?.error || 'Cancel failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-content mt-8" style={{ maxWidth: 760 }}>
        <SkeletonCard count={1} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container page-content mt-8" style={{ maxWidth: 760 }}>
        <div className="alert alert-danger">{error || 'Booking not found.'}</div>
        <Link to="/dashboard">
          <Button variant="secondary" size="md" icon={ArrowLeft}>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const isClient = user?.id === booking.client.id;
  const isFreelancer = user?.id === booking.freelancer.id;
  const canEdit = isClient && booking.status === 'pending';

  return (
    <div className="container page-content mt-8" style={{ maxWidth: 760 }}>
      <div className="section-header flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1>Manage Contract #{booking.id}</h1>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="mt-1 text-muted">
            Client: <strong>{booking.client.full_name || booking.client.username}</strong> · Freelancer: <strong>{booking.freelancer.full_name || booking.freelancer.username}</strong>
          </p>
        </div>
        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/dashboard')}>
          Dashboard
        </Button>
      </div>

      <div className="card">
        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <form onSubmit={handleUpdate}>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                className="form-control"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                disabled={!canEdit}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                className="form-control"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                disabled={!canEdit}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Project Scope & Requirements</label>
            <textarea
              className="form-control"
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={!canEdit}
              required
            />
          </div>

          {canEdit && (
            <div style={{ marginTop: 24 }}>
              <Button type="submit" variant="lime" size="md" isLoading={saving}>
                Update Contract Details
              </Button>
            </div>
          )}
        </form>

        {/* Action Buttons */}
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-subtle)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 12 }}>Contract Actions</h4>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {isFreelancer && booking.status === 'pending' && (
              <>
                <Button variant="lime" size="md" icon={Check} onClick={() => handleAction('accept')} isLoading={saving}>
                  Accept Contract
                </Button>
                <Button variant="danger" size="md" icon={X} onClick={() => handleAction('reject')} isLoading={saving}>
                  Decline
                </Button>
              </>
            )}

            {isFreelancer && booking.status === 'accepted' && (
              <Button variant="purple" size="md" icon={Check} onClick={() => handleAction('complete')} isLoading={saving}>
                Mark as Completed
              </Button>
            )}

            {booking.status === 'pending' && (
              <Button variant="danger" size="md" icon={Ban} onClick={handleCancel} isLoading={saving}>
                Cancel Request
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
