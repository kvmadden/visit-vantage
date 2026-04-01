import React, { useMemo } from 'react';
import { RX_COLORS, FS_COLORS } from '../utils/colors';

export default function DistrictSummary({ district, stores, districtMode = 'rx', dlName }) {
  const isRx = districtMode === 'rx';
  const colorMap = isRx ? RX_COLORS : FS_COLORS;

  const stats = useMemo(() => {
    if (!stores || stores.length === 0) return null;

    const total = stores.length;
    const rx24hr = stores.filter((s) => s.rx24 === 'Yes').length;
    const target = stores.filter((s) => s.target === true).length;
    const ymas = stores.filter((s) => s.ymas === 'Yes').length;
    const fs24hr = stores.filter((s) => s.fs24 === 'Yes').length;

    return { total, rx24hr, target, ymas, fs24hr };
  }, [stores]);

  if (!stats) return null;

  const color = colorMap[district] || '#888';

  const statItems = [
    { label: 'stores', value: stats.total },
    { label: '24hr Rx', value: stats.rx24hr },
    ...(isRx ? [{ label: 'Target', value: stats.target }] : []),
    { label: 'y m\u00e1s', value: stats.ymas },
    { label: 'FS 24hr', value: stats.fs24hr },
  ].filter((item) => item.value > 0);

  return (
    <div className="district-summary fade-in" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="district-summary-header">
        <span
          className="district-summary-dot"
          style={{ backgroundColor: color }}
        />
        <span className="district-summary-title">
          {isRx ? 'Rx' : 'FS'} District D{district}
        </span>
      </div>

      {dlName && (
        <div className="district-summary-dl">{dlName}</div>
      )}

      <div className="district-summary-stats">
        {statItems.map((item) => (
          <span key={item.label} className="district-summary-stat">
            {item.value} {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
