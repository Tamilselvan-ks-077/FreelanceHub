import React, { useState, useEffect, useCallback } from 'react';
import { freelancerAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import TalentCard from '../components/TalentCard';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Search, Filter, Briefcase, ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Star } from 'lucide-react';
import heroImg from '../assets/hero.png';
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
    <div className="home-page page-content">
      {/* Premium Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content animate-in">
            <Badge variant="primary" className="hero-badge mb-4">
              <span className="badge-pulse-dot" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', marginRight: 6 }}></span>
              🛡️ Verified Experts & Global Talent Network
            </Badge>
            <h1 className="hero-title">
              Hire Verified <span className="gradient-text">Freelance Talent</span>
            </h1>
            <p className="hero-subtitle">
              Connect instantly with elite software engineers, UI/UX designers, and technology consultants ready to build your project.
            </p>
            <div className="hero-cta-group">
              <Button variant="primary" size="lg" icon={Search} onClick={() => {
                const el = document.querySelector('.filters-strip');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>
                Explore Talent
              </Button>
              <Button variant="outline" size="lg" icon={Briefcase} onClick={() => {
                const el = document.querySelector('.results-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>
                Browse Jobs
              </Button>
            </div>
          </div>
          
          <div className="hero-visual animate-in" style={{ animationDelay: '0.2s' }}>
            <div className="hero-card-mockup">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="mockup-body">
                <div className="mockup-talent-preview" style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <img src={heroImg} alt="Top Rated Freelancer" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Alex Rivera <ShieldCheck size={16} color="#3b82f6" style={{ display: 'inline', verticalAlign: 'middle' }} /></div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Senior Full-Stack Architect</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#f59e0b', marginTop: 2 }}>
                      <Star size={13} fill="#f59e0b" /> 5.0 (34 reviews) · $85/hr
                    </div>
                  </div>
                </div>
                <div className="mockup-line w-full"></div>
                <div className="mockup-line w-5/6"></div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 600 }}>React</span>
                  <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 600 }}>Django</span>
                  <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', fontWeight: 600 }}>PostgreSQL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Sleek Filters Strip */}
        <section className="filters-strip glass animate-in" style={{ animationDelay: '0.3s' }}>
          <div className="filters-container">
            <div className="filter-item search-item">
              <Input
                icon={Search}
                placeholder="Search by name, skill, or location..."
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
              />
            </div>
            <div className="filter-item select-item">
              <div className="custom-select-wrapper">
                <Filter className="select-icon" size={18} />
                <select
                  className="custom-select"
                  value={filters.skill}
                  onChange={(e) => handleFilterChange('skill', e.target.value)}
                >
                  <option value="">All Skills</option>
                  {(data?.skills || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="filter-item select-item">
              <div className="custom-select-wrapper">
                <Briefcase className="select-icon" size={18} />
                <select
                  className="custom-select"
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                >
                  <option value="">Any Availability</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="results-section">
          {data && (
            <div className="results-header" style={{ animationDelay: '0.4s' }}>
              <h2 className="results-title">Featured Freelancers</h2>
              <p className="results-count">
                Showing {data.results?.length || 0} of {data.total} professionals
              </p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-3">
              <SkeletonCard count={6} />
            </div>
          ) : data?.results?.length > 0 ? (
            <>
              <div className="grid grid-3">
                {data.results.map((f, i) => (
                  <div key={f.id} style={{ animationDelay: `${0.1 * i}s` }}>
                    <TalentCard freelancer={f} onToggleFav={user ? handleToggleFav : null} />
                  </div>
                ))}
              </div>

              {/* Modern Pagination */}
              {data.total_pages > 1 && (
                <div className="pagination-wrapper mt-12">
                  <div className="pagination">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={data.page <= 1}
                      onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                      icon={ChevronLeft}
                    >
                      Previous
                    </Button>
                    
                    <div className="pagination-numbers">
                      {Array.from({ length: Math.min(data.total_pages, 5) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            className={`page-num ${data.page === pageNum ? 'active' : ''}`}
                            onClick={() => setFilters(p => ({ ...p, page: pageNum }))}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={data.page >= data.total_pages}
                      onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                    >
                      Next <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state-wrapper">
              <EmptyState
                icon="🔍"
                title="No professionals found"
                message="Try adjusting your search filters or check back later to discover new talent."
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
