import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, invoiceAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import BookingStatusBadge from '../components/BookingStatusBadge';
import EmptyState from '../components/EmptyState';
import SkeletonCard from '../components/SkeletonCard';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Filler
} from 'chart.js';
import './DashboardPage.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await dashboardAPI.get();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handlePay = async (invoiceId) => {
    setPaying(invoiceId);
    try {
      await invoiceAPI.pay(invoiceId, { payment_method: 'credit_card' });
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.error || 'Payment failed.');
    } finally {
      setPaying(null);
    }
  };

  if (loading) {
    return (
      <div className="container page-content">
        <SkeletonCard count={4} />
      </div>
    );
  }

  const isFreelancer = data.role === 'freelancer';

  const chartData = {
    labels: isFreelancer ? data.monthly_earnings.map(d => d.month) : [],
    datasets: [
      {
        label: 'Earnings',
        data: isFreelancer ? data.monthly_earnings.map(d => d.earnings) : [],
        borderColor: 'hsl(217, 91%, 60%)',
        backgroundColor: 'hsla(217, 91%, 60%, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'hsla(217, 20%, 25%, 0.4)' }, ticks: { color: '#888' } },
      x: { grid: { display: false }, ticks: { color: '#888' } },
    }
  };

  return (
    <div className="container page-content">
      <div className="section-header">
        <h1>Welcome, {user.full_name}</h1>
        <p>Here's an overview of your {isFreelancer ? 'freelance business' : 'hiring activity'}.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">{isFreelancer ? 'Total Earnings' : 'Total Spent'}</div>
          <div className="stat-value">₹{isFreelancer ? data.stats.total_earnings : data.stats.total_spent}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Bookings</div>
          <div className="stat-value">{data.stats.active_bookings}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Requests</div>
          <div className="stat-value">{data.stats.pending_bookings}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Bookings</div>
          <div className="stat-value">{data.stats.total_bookings}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="card">
            <h2 className="section-title">Recent Bookings</h2>
            {data.bookings.length > 0 ? (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>{isFreelancer ? 'Client' : 'Freelancer'}</th>
                      <th>Dates</th>
                      <th>Status</th>
                      <th>Invoice</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bookings.map(b => (
                      <tr key={b.id}>
                        <td data-label="Project">Booking #{b.id}</td>
                        <td data-label={isFreelancer ? 'Client' : 'Freelancer'}>
                          <Link to={`/${isFreelancer ? '#' : `freelancer/${b.freelancer.id}`}`}>
                            {isFreelancer ? b.client.full_name : b.freelancer.full_name}
                          </Link>
                        </td>
                        <td data-label="Dates">{new Date(b.start_date).toLocaleDateString()} - {new Date(b.end_date).toLocaleDateString()}</td>
                        <td data-label="Status"><BookingStatusBadge status={b.status} /></td>
                        <td data-label="Invoice">
                          {b.invoice ? (
                            <span className={`badge ${b.invoice.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                              ₹{b.invoice.amount} ({b.invoice.status})
                            </span>
                          ) : '-'}
                        </td>
                        <td data-label="Actions">
                          <Link to={`/booking/${b.id}/edit`} className="btn btn-sm btn-secondary">Manage</Link>
                          {!isFreelancer && b.invoice && b.invoice.status === 'unpaid' && b.status === 'completed' && (
                            <button
                              className="btn btn-sm btn-primary"
                              style={{ marginLeft: 8 }}
                              onClick={() => handlePay(b.invoice.id)}
                              disabled={paying === b.invoice.id}
                            >
                              {paying === b.invoice.id ? 'Processing...' : 'Pay'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon="📅" title="No bookings yet" message="When you get booked, it will show up here." />
            )}
          </div>

          {isFreelancer && (
            <div className="card" style={{ marginTop: '24px' }}>
              <h2 className="section-title">Earnings Overview</h2>
              <div className="chart-container">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-sidebar">
          {isFreelancer ? (
            <div className="card">
              <h3 className="section-title">Recent Reviews</h3>
              {data.reviews.length > 0 ? (
                <div className="reviews-mini-list">
                  {data.reviews.map(r => (
                    <div key={r.id} className="review-mini">
                      <div className="rm-header">
                        <strong>{r.reviewer}</strong>
                        <span className="star">★ {r.rating}</span>
                      </div>
                      <p className="rm-body">{r.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No reviews yet.</p>
              )}
            </div>
          ) : (
            <div className="card">
              <h3 className="section-title">Saved Talent</h3>
              {data.favourites.length > 0 ? (
                <div className="favs-list">
                  {data.favourites.map(f => (
                    <Link key={f.id} to={`/freelancer/${f.id}`} className="fav-item">
                      <span className="avatar avatar-placeholder">{f.full_name[0]}</span>
                      <span>{f.full_name}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No saved freelancers.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
