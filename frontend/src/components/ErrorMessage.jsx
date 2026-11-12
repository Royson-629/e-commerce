import React from 'react';
import { AlertCircle, RefreshCw, ServerOff } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

export const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div
      style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        padding: '24px',
        margin: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '12px'
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ServerOff size={22} />
      </div>

      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#991b1b', margin: 0 }}>
          Backend Communication Error
        </h4>
        <p style={{ fontSize: '13px', color: '#7f1d1d', marginTop: '4px', maxWidth: '520px', lineHeight: 1.5 }}>
          {message || `Failed to fetch data from Spring Boot API at ${API_BASE_URL}.`}
        </p>
        <p style={{ fontSize: '12px', color: '#991b1b', marginTop: '6px' }}>
          Target Backend: <code style={{ background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>{API_BASE_URL}</code>
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={onRetry}
          style={{ borderColor: '#fca5a5', color: '#991b1b', backgroundColor: '#ffffff' }}
        >
          <RefreshCw size={14} />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
