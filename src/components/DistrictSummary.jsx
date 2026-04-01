import React, { useMemo, useState } from 'react';
import { RX_COLORS, FS_COLORS } from '../utils/colors';

function hexToRgba(hex, alpha) {
  if (!hex || hex.length < 7) return `rgba(128,128,128,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function DistrictSummary({ district, stores, districtMode = 'rx', dlName }) {
  const [dismissed, setDismissed] = useState(false);
  const isRx = districtMode === 'rx';
  const colorMap = isRx ? RX_COLORS : FS_COLORS;

  const stats = useMemo(() => {
    if (!stores || stores.length === 0) return null;

    const total = stores.length;
    const rx24hr = stores.filter((s) => s.rx24 === 'Yes').length;
    const target = stores.filter((s) => s.target === true).length;
    const ymas = stores.filter((s) => s.ymas === 'Yes').length;
    const minuteClinic = stores.filter((s) => s.minuteClinic === 'Yes').length;
    const standalone = total - target;

    return { total, rx24hr, target, ymas, minuteClinic, standalone };
  }, [stores]);

  // Reset dismissed state when district changes
  const [prevDistrict, setPrevDistrict] = useState(district);
  if (district !== prevDistrict) {
    setPrevDistrict(district);
    setDismissed(false);
  }

  if (!stats || dismissed) return null;

  const color = colorMap[district] || '#888';

  const statPills = [
    { label: `${stats.total} stores`, show: true },
    { label: `${stats.target} Target`, show: isRx && stats.target > 0 },
    { label: `${stats.rx24hr} Rx 24hr`, show: stats.rx24hr > 0 },
    { label: `${stats.minuteClinic} MC`, show: stats.minuteClinic > 0 },
    { label: `${stats.ymas} y más`, show: stats.ymas > 0 },
  ].filter((p) => p.show);

  const formatBreakdown = isRx && stats.target > 0
    ? `${stats.standalone} standalone · ${stats.target} Target`
    : null;

  return (
    <div
      className="district-summary fade-in"
      style={{
        borderLeft: `3px solid ${color}`,
        background: `linear-gradient(90deg, ${hexToRgba(color, 0.04)} 0%, var(--bg-surface) 40%)`,
      }}
    >
      <button
        className="district-summary-dismiss"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        ✕
      </button>

      <div className="district-summary-header">
        <span className="district-summary-dot" style={{ backgroundColor: color }} />
        <span className="district-summary-title">
          {isRx ? 'Rx' : 'FS'} District {district}
        </span>
      </div>

      {dlName && (
        <span
          className="dl-pill"
          style={{
            background: hexToRgba(color, 0.15),
            color: color,
            border: `1px solid ${hexToRgba(color, 0.3)}`,
            marginTop: 4,
            display: 'inline-flex',
          }}
        >
          {dlName}
        </span>
      )}

      <div className="district-summary-pills">
        {statPills.map((pill) => (
          <span key={pill.label} className="district-stat-pill">{pill.label}</span>
        ))}
      </div>

      {formatBreakdown && (
        <div className="district-summary-format">{formatBreakdown}</div>
      )}
    </div>
  );
}
