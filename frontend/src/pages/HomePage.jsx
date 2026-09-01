import { useState, useEffect, useCallback } from 'react';
import { freelancerAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import TalentCard from '../components/TalentCard';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import './HomePage.css';

export default function HomePage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: '', skill: '', availability: '', page: 1 });

  const fetchFreelancers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await freelancerAPI.list(filters);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchFreelancers(); }, [fetchFreelancers]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleToggleFav = async (id) => {
    if (!user) return;
    try {
      await freelancerAPI.toggleFavourite(id);
      setData(prev => ({
        ...prev,
        results: prev.results.map(f =>
          f.id === id ? { ...f, is_favourite: !f.is_favourite } : f
        ),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      {/* Hero */}
      <section className="hero animate-in">
        <h1 className="hero-title">
          Find <span className="gradient-text">Exceptional</span> Talent
        </h1>
        <p className="hero-subtitle">
          Connect with top freelancers and bring your projects to life
        </p>
      </section>

      {/* Filters */}
      <section className="filters-bar card-glass animate-in" style={{ animationDelay: '0.1s' }}>
        <div className="filter-group">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, skill, or location..."
            value={filters.q}
            onChange={(e) => handleFilterChange('q', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            className="form-control"
            value={filters.skill}
            onChange={(e) => handleFilterChange('skill', e.target.value)}
          >
            <option value="">All Skills</option>
            {(data?.skills || []).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <select
            className="form-control"
            value={filters.availability}
            onChange={(e) => handleFilterChange('availability', e.target.value)}
          >
            <option value="">Any Availability</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </section>

      {/* Results */}
      <section className="results-section">
        {data && (
          <p className="results-count" style={{ animationDelay: '0.15s' }}>
            <strong>{data.total}</strong> freelancer{data.total !== 1 ? 's' : ''} found
          </p>
        )}

        {loading ? (
          <SkeletonCard count={6} />
        ) : data?.results?.length > 0 ? (
          <>
            <div className="grid grid-3">
              {data.results.map((f, i) => (
                <div key={f.id} style={{ animationDelay: `${0.05 * i}s` }}>
                  <TalentCard freelancer={f} onToggleFav={user ? handleToggleFav : null} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data.total_pages > 1 && (
              <div className="pagination">
                <button
                  disabled={data.page <= 1}
                  onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(data.total_pages, 7) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      className={data.page === pageNum ? 'active' : ''}
                      onClick={() => setFilters(p => ({ ...p, page: pageNum }))}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  disabled={data.page >= data.total_pages}
                  onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon="🔍"
            title="No freelancers found"
            message="Try adjusting your search filters or check back later"
          />
        )}
      </section>
    </div>
  );
}
