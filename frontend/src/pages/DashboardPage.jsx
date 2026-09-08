import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, invoiceAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import BookingStatusBadge from '../components/BookingStatusBadge';
import EmptyState from '../components/EmptyState';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Filler,
  RadialLinearScale, ArcElement
} from 'chart.js';
import { 
  TrendingUp, Users, Calendar, DollarSign, 
  Clock, CheckCircle, AlertCircle, ChevronRight,
  CreditCard, ArrowRight
} from 'lucide-react';
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
      <div className="container page-content mt-12">
        <div className="mb-8">
          <div className="skeleton" style={{ width: '200px', height: '40px', marginBottom: '8px' }}></div>
          <div className="skeleton" style={{ width: '300px', height: '20px' }}></div>
        </div>
        <div className="grid grid-4 mb-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="glass rounded-xl p-6" style={{ height: '120px' }}></div>
          ))}
        </div>
        <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div className="glass rounded-xl p-6" style={{ height: '400px' }}></div>
          <div className="glass rounded-xl p-6" style={{ height: '400px' }}></div>
        </div>
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
        borderColor: '#6366f1', // brand-500
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#6366f1',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: { family: 'Inter', size: 13 },
        bodyFont: { family: 'Inter', size: 14, weight: 'bold' },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `₹${context.parsed.y}`
        }
      }
    },
    scales: {
      y: { 
        grid: { color: 'var(--border-subtle)', drawBorder: false }, 
        ticks: { color: 'var(--text-tertiary)', font: { family: 'Inter' } },
        border: { display: false }
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: 'var(--text-tertiary)', font: { family: 'Inter' } },
        border: { display: false }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <div className="dashboard-page">
      <div className="container page-content">
        {/* Header */}
        <div className="dashboard-header animate-in">
          <div>
            <h1 className="dashboard-title">Welcome back, {user.full_name} 👋</h1>
            <p className="dashboard-subtitle">Here's what's happening with your {isFreelancer ? 'freelance business' : 'hiring activity'} today.</p>
          </div>
          <div className="dashboard-actions">
            <Button variant="outline" icon={Calendar}>View Schedule</Button>
            {isFreelancer ? (
              <Button variant="primary" icon={TrendingUp}>View Reports</Button>
            ) : (
              <Button variant="primary" icon={Users}>Find Talent</Button>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-card glass animate-in" style={{ animationDelay: '0.1s' }}>
            <div className="metric-icon-wrapper bg-brand-light">
              <DollarSign className="text-brand" size={24} />
            </div>
            <div className="metric-content">
              <p className="metric-label">{isFreelancer ? 'Total Earnings' : 'Total Spent'}</p>
              <h3 className="metric-value">₹{isFreelancer ? data.stats.total_earnings : data.stats.total_spent}</h3>
            </div>
          </div>
          
          <div className="metric-card glass animate-in" style={{ animationDelay: '0.15s' }}>
            <div className="metric-icon-wrapper bg-blue-light">
              <Clock className="text-blue" size={24} />
            </div>
            <div className="metric-content">
              <p className="metric-label">Active Bookings</p>
              <h3 className="metric-value">{data.stats.active_bookings}</h3>
            </div>
          </div>
          
          <div className="metric-card glass animate-in" style={{ animationDelay: '0.2s' }}>
            <div className="metric-icon-wrapper bg-amber-light">
              <AlertCircle className="text-amber" size={24} />
            </div>
            <div className="metric-content">
              <p className="metric-label">Pending Requests</p>
              <h3 className="metric-value">{data.stats.pending_bookings}</h3>
            </div>
          </div>
          
          <div className="metric-card glass animate-in" style={{ animationDelay: '0.25s' }}>
            <div className="metric-icon-wrapper bg-green-light">
              <CheckCircle className="text-green" size={24} />
            </div>
            <div className="metric-content">
              <p className="metric-label">Total Bookings</p>
              <h3 className="metric-value">{data.stats.total_bookings}</h3>
            </div>
          </div>
        </div>

        <div className="dashboard-layout">
          {/* Main Content Area */}
          <div className="dashboard-main">
            
            {/* Earnings Chart (Freelancer Only) */}
            {isFreelancer && (
              <div className="glass panel animate-in" style={{ animationDelay: '0.3s' }}>
                <div className="panel-header">
                  <h2 className="panel-title">Earnings Overview</h2>
                  <select className="panel-select">
                    <option>Last 6 Months</option>
                    <option>This Year</option>
                    <option>All Time</option>
                  </select>
                </div>
                <div className="chart-container">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>
            )}

            {/* Recent Bookings Table */}
            <div className="glass panel animate-in" style={{ animationDelay: '0.35s' }}>
              <div className="panel-header">
                <h2 className="panel-title">Recent Activity</h2>
                <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">View All</Button>
              </div>
              
              {data.bookings.length > 0 ? (
                <div className="table-responsive">
                  <table className="saas-table">
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>{isFreelancer ? 'Client' : 'Freelancer'}</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.bookings.map(b => (
                        <tr key={b.id}>
                          <td>
                            <div className="flex flex-col">
                              <span className="font-medium text-primary">Booking #{b.id}</span>
                              <span className="text-xs text-tertiary">
                                {new Date(b.start_date).toLocaleDateString()} - {new Date(b.end_date).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <Avatar fallback={isFreelancer ? b.client.full_name[0] : b.freelancer.full_name[0]} size="sm" />
                              <Link to={`/${isFreelancer ? '#' : `freelancer/${b.freelancer.id}`}`} className="hover-link">
                                {isFreelancer ? b.client.full_name : b.freelancer.full_name}
                              </Link>
                            </div>
                          </td>
                          <td><BookingStatusBadge status={b.status} /></td>
                          <td>
                            {b.invoice ? (
                              <div className="flex flex-col">
                                <span className="font-medium">₹{b.invoice.amount}</span>
                                <span className={`text-xs ${b.invoice.status === 'paid' ? 'text-green-500' : 'text-amber-500'}`}>
                                  {b.invoice.status}
                                </span>
                              </div>
                            ) : (
                              <span className="text-tertiary">-</span>
                            )}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <Link to={`/booking/${b.id}/edit`}>
                                <Button variant="ghost" size="sm">Manage</Button>
                              </Link>
                              
                              {!isFreelancer && b.invoice && b.invoice.status === 'unpaid' && b.status === 'completed' && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  icon={CreditCard}
                                  onClick={() => handlePay(b.invoice.id)}
                                  disabled={paying === b.invoice.id}
                                >
                                  {paying === b.invoice.id ? 'Processing...' : 'Pay'}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8">
                  <EmptyState icon="📝" title="No recent activity" message="When you get new bookings or requests, they'll appear here." />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="dashboard-sidebar">
            
            {/* Quick Actions */}
            <div className="glass panel animate-in" style={{ animationDelay: '0.4s' }}>
              <h3 className="panel-title mb-4">Quick Actions</h3>
              <div className="action-list">
                <Link to="/profile/edit" className="action-card">
                  <div className="action-icon bg-brand-light text-brand"><Users size={20} /></div>
                  <div className="action-text">
                    <strong>Update Profile</strong>
                    <span>Keep your info current</span>
                  </div>
                  <ChevronRight size={16} className="text-tertiary" />
                </Link>
                <Link to="/settings" className="action-card">
                  <div className="action-icon bg-neutral-light text-secondary"><AlertCircle size={20} /></div>
                  <div className="action-text">
                    <strong>Account Settings</strong>
                    <span>Manage preferences</span>
                  </div>
                  <ChevronRight size={16} className="text-tertiary" />
                </Link>
              </div>
            </div>

            {/* Dynamic Sidebar Widget */}
            {isFreelancer ? (
              <div className="glass panel animate-in" style={{ animationDelay: '0.45s' }}>
                <div className="panel-header">
                  <h3 className="panel-title">Recent Reviews</h3>
                </div>
                {data.reviews.length > 0 ? (
                  <div className="sidebar-list">
                    {data.reviews.map(r => (
                      <div key={r.id} className="sidebar-list-item review-item">
                        <div className="review-header">
                          <Avatar fallback={r.reviewer[0]} size="sm" />
                          <div className="review-meta">
                            <strong>{r.reviewer}</strong>
                            <div className="review-rating text-amber-500 font-medium text-xs">
                              ★ {r.rating}.0
                            </div>
                          </div>
                        </div>
                        <p className="review-text">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-tertiary text-sm py-4 text-center">No reviews yet.</p>
                )}
              </div>
            ) : (
              <div className="glass panel animate-in" style={{ animationDelay: '0.45s' }}>
                <div className="panel-header">
                  <h3 className="panel-title">Saved Talent</h3>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                {data.favourites.length > 0 ? (
                  <div className="sidebar-list">
                    {data.favourites.map(f => (
                      <Link key={f.id} to={`/freelancer/${f.id}`} className="sidebar-list-item talent-item">
                        <Avatar src={f.profile_picture} fallback={f.full_name[0]} />
                        <div className="talent-meta">
                          <strong>{f.full_name}</strong>
                          <span className="text-xs text-tertiary">{f.title || 'Freelancer'}</span>
                        </div>
                        <ChevronRight size={16} className="text-tertiary ml-auto" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-tertiary text-sm py-4 text-center">No saved freelancers.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
