import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Connecting to backend...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 20px',
        color: '#64748b',
        gap: '12px'
      }}
    >
      <Loader2
        size={36}
        className="spin-animation"
        color="#2563eb"
        style={{
          animation: 'spin 1s linear infinite'
        }}
      />
      <span style={{ fontSize: '14px', fontWeight: 500 }}>{message}</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
