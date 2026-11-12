import React from 'react';

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'blue',
  badgeText
}) => {
  return (
    <div className="stat-card">
      <div className="stat-card-left">
        <span className="stat-label">{title}</span>
        <span className="stat-value">{value}</span>
        {subtext && (
          <span className="stat-subtext">
            {badgeText && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: variant === 'rose' ? '#dc2626' : variant === 'amber' ? '#d97706' : '#059669',
                  backgroundColor: variant === 'rose' ? '#fee2e2' : variant === 'amber' ? '#fef3c7' : '#d1fae5',
                  padding: '1px 6px',
                  borderRadius: '4px'
                }}
              >
                {badgeText}
              </span>
            )}
            {subtext}
          </span>
        )}
      </div>

      {Icon && (
        <div className={`stat-icon-wrapper stat-icon-${variant}`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
