import React, { useState } from 'react';
import { RX_COLORS, RX_LABELS, FS_COLORS, FS_LABELS } from '../utils/colors';

export default function Legend({ districtMode = 'rx' }) {
  const [isOpen, setIsOpen] = useState(false);

  const isRx = districtMode === 'rx';
  const colorMap = isRx ? RX_COLORS : FS_COLORS;
  const labelMap = isRx ? RX_LABELS : FS_LABELS;

  if (!isOpen) {
    return (
      <button
        className="legend-toggle"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1px solid #3f3f46',
          background: '#27272a',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          zIndex: 1000,
        }}
        aria-label="Open legend"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="3" r="2.5" fill={Object.values(colorMap)[0]} />
          <circle cx="8" cy="8" r="2.5" fill={Object.values(colorMap)[1]} />
          <circle cx="8" cy="13" r="2.5" fill={Object.values(colorMap)[2]} />
        </svg>
      </button>
    );
  }

  return (
    <div
      className="legend fade-in"
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        background: '#18181b',
        border: '1px solid #3f3f46',
        borderRadius: 8,
        padding: '12px 16px',
        zIndex: 1000,
        minWidth: 150,
        color: '#e4e4e7',
        fontSize: 13,
        fontFamily: 'inherit',
      }}
    >
      <button
        onClick={() => setIsOpen(false)}
        style={{
          position: 'absolute',
          top: 6,
          right: 8,
          background: 'none',
          border: 'none',
          color: '#a1a1aa',
          cursor: 'pointer',
          fontSize: 14,
          lineHeight: 1,
          padding: 2,
        }}
        aria-label="Close legend"
      >
        ✕
      </button>

      <div style={{ fontWeight: 600, marginBottom: 8 }}>
        {isRx ? 'Rx Districts' : 'FS Districts'}
      </div>

      {Object.keys(colorMap).map((key) => (
        <div
          key={key}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 4,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill={colorMap[key]} />
          </svg>
          <span>{labelMap[key]}</span>
        </div>
      ))}

      {isRx && (
        <>
          <hr
            style={{
              border: 'none',
              borderTop: '1px solid #3f3f46',
              margin: '8px 0',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" fill="none" stroke="#71717a" strokeWidth="2.5" />
              <circle cx="12" cy="12" r="5.5" fill="none" stroke="#71717a" strokeWidth="2.5" />
              <circle cx="12" cy="12" r="2" fill="#71717a" />
            </svg>
            <span>Target</span>
          </div>
        </>
      )}
    </div>
  );
}
