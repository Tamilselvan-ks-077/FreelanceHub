import React from 'react';
import { Users, CheckCircle, Star, Clock, Sparkles } from 'lucide-react';
import './StatsSection.css';

export default function StatsSection({ totalFreelancers = 140 }) {
  const stats = [
    {
      value: `${totalFreelancers || 140}+`,
      label: 'Vetted Craftsmen',
      subtext: 'Rigorous technical appraisal',
      icon: Users,
    },
    {
      value: '99.4%',
      label: 'Delight Rate',
      subtext: 'Across completed milestones',
      icon: Star,
    },
    {
      value: '< 24h',
      label: 'Harmonious Match',
      subtext: 'From inquiry to kickoff',
      icon: Clock,
    },
    {
      value: '100%',
      label: 'Milestone Escrow',
      subtext: 'Protected financial disbursements',
      icon: CheckCircle,
    },
  ];

  return (
    <section className="botanical-stats-section">
      <div className="container">
        <div className="stats-panel-bar">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="stat-metric-block">
                <div className="stat-icon-pill">
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                <div className="stat-text-group">
                  <div className="stat-metric-val">{stat.value}</div>
                  <div className="stat-metric-label">{stat.label}</div>
                  <div className="stat-metric-sub">{stat.subtext}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
