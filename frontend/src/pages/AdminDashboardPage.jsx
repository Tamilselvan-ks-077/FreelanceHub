import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import SkeletonCard from '../components/SkeletonCard';
import BookingStatusBadge from '../components/BookingStatusBadge';
import Badge from '../components/ui/Badge';
import { Users, Briefcase, DollarSign, Calendar, ShieldCheck, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = useCallback(async () => {
    try {
      const res = await adminAPI.stats();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  if (loading) {
    return (
      <div className="container page-content mt-8">
        <SkeletonCard count={4} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container page-content mt-8">
        <div className="alert alert-danger">Failed to load admin analytics.</div>
      </div>
    );
  }

  return (
    <div className="container page-content mt-8">
      <div className="section-header mb-8">
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#151521',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--neon-lime)',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1>Admin Control & Analytics</h1>
            <p>Platform telemetry, user overview, and system volume.</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrapper bg-brand-light">
            <Users size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Total Users</p>
            <h3 className="metric-value">{data.stats.users}</h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper bg-blue-light">
            <Briefcase size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Freelancers</p>
            <h3 className="metric-value">{data.stats.freelancers}</h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper bg-amber-light">
            <Calendar size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Total Bookings</p>
            <h3 className="metric-value">{data.stats.bookings}</h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrapper bg-green-light">
            <DollarSign size={24} />
          </div>
          <div className="metric-content">
            <p className="metric-label">Revenue Volume</p>
            <h3 className="metric-value">${data.stats.revenue}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 32 }}>
        {/* Recent Bookings */}
        <div className="card">
          <h3 className="panel-title mb-4">Recent Platform Contracts</h3>
          <div className="table-wrapper">
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Freelancer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_bookings.slice(0, 10).map((b) => (
                  <tr key={b.id}>
                    <td><strong>#{b.id}</strong></td>
                    <td>{b.client.username}</td>
                    <td>{b.freelancer.username}</td>
                    <td><BookingStatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users */}
        <div className="card">
          <h3 className="panel-title mb-4">Recent User Registrations</h3>
          <div className="table-wrapper">
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Staff</th>
                </tr>
              </thead>
              <tbody>
                {data.users.slice(0, 10).map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.username}</strong></td>
                    <td>
                      <Badge variant={u.role === 'freelancer' ? 'purple' : 'lime'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {new Date(u.date_joined).toLocaleDateString()}
                    </td>
                    <td>
                      {u.is_staff ? (
                        <span style={{ color: '#059669', fontWeight: 700 }}>Admin</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>User</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
