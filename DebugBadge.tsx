import React from 'react';
import { API_BASE } from '../../services/apiClient';

const DebugBadge: React.FC = () => {
  if (process.env.NODE_ENV === 'production') return null;

  const base = API_BASE || '(relative)';

  return (
    <div style={{
      position: 'fixed',
      bottom: 12,
      right: 12,
      padding: '6px 10px',
      background: '#111',
      color: '#fff',
      borderRadius: 6,
      fontSize: 12,
      opacity: 0.9,
      zIndex: 9999
    }}>
      <strong>API:</strong> {base}
    </div>
  );
};

export default DebugBadge;
