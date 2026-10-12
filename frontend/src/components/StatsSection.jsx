import React from 'react';
import { Users, CheckCircle, MessageSquare, ShieldCheck } from 'lucide-react';
import './StatsSection.css';

export default function StatsSection() {
  const stats = [
    {
      value: 'Verified',
      label: 'Technical Expertise',
      subtext: 'Portfolio & code appraisal',
      icon: Users,
    },
    {
      value: '100%',
      label: 'Milestone Escrow',
      subtext: 'Secured financial releases',
      icon: ShieldCheck,
    },
    {
      value: 'Direct',
      label: 'Studio Messaging',
      subtext: 'End-to-end project chat',
      icon: MessageSquare,
    },
    {
      value: '0%',
      label: 'Hidden Platform Fees',
      subtext: 'Transparent project invoicing',
      icon: CheckCircle,
    },
  ];

  return (
    <section className="botanical-stats-section" aria-label="Platform guarantees">
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
