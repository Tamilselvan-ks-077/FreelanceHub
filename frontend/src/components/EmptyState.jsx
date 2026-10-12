import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  const isComponent = typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null && !React.isValidElement(Icon));

  return (
    <div className="empty-state animate-in">
      <div className="empty-state-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {React.isValidElement(Icon) ? (
          Icon
        ) : isComponent ? (
          <Icon size={32} strokeWidth={1.5} />
        ) : (
          <Inbox size={32} strokeWidth={1.5} />
        )}
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action && action}
    </div>
  );
}
