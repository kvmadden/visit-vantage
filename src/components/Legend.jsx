import React, { useState } from 'react';
import { RX_COLORS, RX_LABELS, FS_COLORS, FS_LABELS } from '../utils/colors';

export default function Legend({ districtMode = 'rx', theme = 'light' }) {
  const [isOpen, setIsOpen] = useState(false);

  const isRx = districtMode === 'rx';
  const colorMap = isRx ? RX_COLORS : FS_COLORS;
  const labelMap = isRx ? RX_LABELS : FS_LABELS;
  const bullseyeInner = theme === 'dark' ? '#18181b' : '#ffffff';

  if (!isOpen) {
    return (
      <button
        className="legend-toggle"
        onClick={() => setIsOpen(true)}
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
    <div className="legend-panel fade-in">
      <button
        className="legend-close"
        onClick={() => setIsOpen(false)}
        aria-label="Close legend"
      >
        ✕
      </button>

      <div className="legend-title">
        {isRx ? 'Rx Districts' : 'FS Districts'}
      </div>

      {Object.keys(colorMap).map((key) => (
        <div key={key} className="legend-item">
          <svg width="12" height="12" viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
            <path d="M16 29 C16 29 2 20 2 11 C2 6 5.5 2 10 2 C12.5 2 14.8 3.5 16 5.5 C17.2 3.5 19.5 2 22 2 C26.5 2 30 6 30 11 C30 20 16 29 16 29Z"
              fill={colorMap[key]} />
          </svg>
          <span>{labelMap[key]}</span>
        </div>
      ))}

      {isRx && (
        <>
          <hr className="legend-separator" />
          <div className="legend-item">
            <svg width="10" height="10" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10.5" fill="#71717a" />
              <circle cx="12" cy="12" r="7.5" fill={bullseyeInner} />
              <circle cx="12" cy="12" r="4.5" fill="#71717a" />
            </svg>
            <span>Target</span>
          </div>
        </>
      )}
    </div>
  );
}
