import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import SkeletonCard from '../components/SkeletonCard';
import BookingStatusBadge from '../components/BookingStatusBadge';

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

  useEffect(() => { fetchAdminStats(); }, [fetchAdminStats]);

  if (loading) return <div className="container page-content"><SkeletonCard count={4} /></div>;

  return (
    <div className="container page-content">
      <div className="section-header">
        <h1>Admin Analytics</h1>
        <p>Platform overview and statistics.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{data.stats.users}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Freelancers</div>
          <div className="stat-value">{data.stats.freelancers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Bookings</div>
          <div className="stat-value">{data.stats.bookings}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue Volume</div>
          <div className="stat-value">₹{data.stats.revenue}</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 32 }}>
        <div className="card">
          <h2 className="section-title">Recent Bookings</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Freelancer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_bookings.slice(0, 10).map(b => (
                  <tr key={b.id}>
                    <td data-label="ID">#{b.id}</td>
                    <td data-label="Client">{b.client.username}</td>
                    <td data-label="Freelancer">{b.freelancer.username}</td>
                    <td data-label="Status"><BookingStatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Recent Users</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Staff</th>
                </tr>
              </thead>
              <tbody>
                {data.users.slice(0, 10).map(u => (
                  <tr key={u.id}>
                    <td data-label="Username">{u.username}</td>
                    <td data-label="Role"><span className={`badge badge-${u.role === 'freelancer' ? 'primary' : 'secondary'}`}>{u.role}</span></td>
                    <td data-label="Joined">{new Date(u.date_joined).toLocaleDateString()}</td>
                    <td data-label="Staff">{u.is_staff ? 'Yes' : 'No'}</td>
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
