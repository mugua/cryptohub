import React from 'react';

const Logo: React.FC<{ collapsed?: boolean }> = ({ collapsed }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: collapsed ? '16px 8px' : '16px',
      gap: 8,
    }}
  >
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" stroke="#F0B90B" strokeWidth="2" />
      <path
        d="M16 6L20 12H12L16 6Z"
        fill="#F0B90B"
      />
      <path
        d="M16 26L12 20H20L16 26Z"
        fill="#F0B90B"
      />
      <rect x="10" y="14" width="12" height="4" rx="1" fill="#F0B90B" />
    </svg>
    {!collapsed && (
      <span
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#EAECEF',
          letterSpacing: 1,
        }}
      >
        Crypto<span style={{ color: '#F0B90B' }}>Hub</span>
      </span>
    )}
  </div>
);

export default Logo;
