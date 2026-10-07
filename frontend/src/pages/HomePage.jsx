import React, { useState, useEffect, useCallback, useRef } from 'react';
import { freelancerAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import HeroSection from '../components/HeroSection';
import FeatureSection from '../components/FeatureSection';
import HowItWorksSection from '../components/HowItWorksSection';
import StatsSection from '../components/StatsSection';
import TestimonialSection from '../components/TestimonialSection';
import CTASection from '../components/CTASection';
import TalentCard from '../components/TalentCard';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Search, Filter, Briefcase, ChevronLeft, ChevronRight, Leaf, Sparkles, SlidersHorizontal, Check } from 'lucide-react';
import './HomePage.css';

export default function HomePage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: '', skill: '', availability: '', page: 1 });
  const directoryRef = useRef(null);

  const fetchFreelancers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await freelancerAPI.list(filters);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch freelancers:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFreelancers();
  }, [fetchFreelancers]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleToggleFav = async (id) => {
    if (!user) return;
    try {
      await freelancerAPI.toggleFavourite(id);
      setData((prev) => ({
        ...prev,
        results: prev.results.map((f) =>
          f.id === id ? { ...f, is_favourite: !f.is_favourite } : f
        ),
      }));
    } catch (err) {
      console.error('Failed to toggle favourite:', err);
    }
  };

  const scrollToDirectory = () => {
    if (directoryRef.current) {
      directoryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="botanical-home-page page-content">
      {/* 1. Hero Section */}
      <HeroSection onExploreClick={scrollToDirectory} />

      {/* 2. Feature / USP Section */}
      <FeatureSection />

      {/* 3. How It Works Section */}
      <HowItWorksSection />

      {/* 4. Main Talent Directory / Products Section */}
      <section ref={directoryRef} id="talent-directory" className="directory-main-section">
        <div className="container">
          {/* Directory Header */}
          <div className="directory-section-header">
            <div className="directory-badge">
              <Leaf size={14} strokeWidth={1.5} className="directory-badge-leaf" />
              <span>THE CURATED DIRECTORY</span>
            </div>
            <h2 className="directory-title">
              Discover master <span className="serif-italic">craftsmen</span> & engineers
            </h2>
            <p className="directory-subtitle">
              Filter elite artisans by specialized discipline, availability status, and verified client milestones.
            </p>
          </div>

          {/* Botanical Filter Bar */}
          <div className="directory-filter-bar">
            <div className="filter-input-cell search-cell">
              <Input
                icon={Search}
                placeholder="Search by name, craft, framework, or location..."
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                className="directory-search-input"
              />
            </div>

            <div className="filter-input-cell">
              <div className="filter-select-box">
                <Briefcase size={16} strokeWidth={1.5} className="filter-box-icon" />
                <select
                  value={filters.skill}
                  onChange={(e) => handleFilterChange('skill', e.target.value)}
                  className="filter-native-select"
                >
                  <option value="">All Disciplines</option>
                  <option value="React">React / Next.js</option>
                  <option value="Python">Python / Django</option>
                  <option value="PostgreSQL">PostgreSQL / Databases</option>
                  <option value="AI">AI & LLM Integration</option>
                  <option value="UI/UX">Artisanal UI/UX Design</option>
                  <option value="DevOps">DevOps & Cloud</option>
                  <option value="Node.js">Node.js / Express</option>
                </select>
              </div>
            </div>

            <div className="filter-input-cell">
              <div className="filter-select-box">
                <SlidersHorizontal size={16} strokeWidth={1.5} className="filter-box-icon" />
                <select
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  className="filter-native-select"
                >
                  <option value="">Any Availability</option>
                  <option value="available">Available Immediately</option>
                  <option value="busy">Engaged on Milestones</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Filter Tag Pills */}
          <div className="quick-tags-bar">
            <span className="quick-tags-label">Popular Crafts:</span>
            {['React', 'Python', 'PostgreSQL', 'AI', 'UI/UX', 'Node.js'].map((skill) => (
              <button
                key={skill}
                type="button"
                className={`quick-tag-pill ${filters.skill === skill ? 'active' : ''}`}
                onClick={() => handleFilterChange('skill', filters.skill === skill ? '' : skill)}
              >
                {filters.skill === skill && <Check size={12} strokeWidth={2} className="mr-1 inline" />}
                {skill}
              </button>
            ))}
            {(filters.q || filters.skill || filters.availability) && (
              <button
                type="button"
                className="quick-clear-btn"
                onClick={() => setFilters({ q: '', skill: '', availability: '', page: 1 })}
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Grid Content */}
          {loading ? (
            <div className="grid grid-3 talent-results-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : !data || data.results?.length === 0 ? (
            <EmptyState
              title="No master artisans found"
              message="Try broadening your craft filters or search keywords to discover matching talent."
            />
          ) : (
            <>
              <div className="directory-results-meta">
                <span className="meta-count">
                  Showing <strong>{data.results.length}</strong> of <strong>{data.total || data.count || data.results.length}</strong> verified craftsmen
                </span>
              </div>

              <div className="grid grid-3 talent-results-grid">
                {data.results.map((freelancer) => (
                  <TalentCard
                    key={freelancer.id}
                    freelancer={freelancer}
                    onToggleFav={handleToggleFav}
                  />
                ))}
              </div>

              {/* Pagination */}
              {data.num_pages > 1 && (
                <div className="directory-pagination">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={ChevronLeft}
                    disabled={filters.page <= 1}
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="pagination-info">
                    Page {data.current_page} of {data.num_pages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    iconRight={ChevronRight}
                    disabled={filters.page >= data.num_pages}
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 5. Key Metrics Stats Section */}
      <StatsSection totalFreelancers={data?.total || data?.count || 140} />

      {/* 6. Testimonial Social Proof */}
      <TestimonialSection />

      {/* 7. Conversion CTA Banner */}
      <CTASection />
    </div>
  );
}
