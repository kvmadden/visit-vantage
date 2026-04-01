import { useCallback } from 'react';
import { getPharmacyStatus } from '../utils/storeHours';

function StatRow({ label, values }) {
  return (
    <div className="compare-row">
      <span className="compare-label">{label}</span>
      {values.map((v, i) => (
        <span key={i} className="compare-value">{v}</span>
      ))}
    </div>
  );
}

export default function StoreComparison({ stores, onClose, onStoreSelect }) {
  const now = new Date();

  const handleSelect = useCallback((store) => {
    if (onStoreSelect) onStoreSelect(store);
  }, [onStoreSelect]);

  if (!stores || stores.length < 2) return null;

  const cols = stores.slice(0, 3); // max 3 stores

  return (
    <div className="store-comparison fade-in">
      <div className="compare-header">
        <span className="compare-title">Compare Stores</span>
        <button className="compare-close" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <div className="compare-grid" style={{ gridTemplateColumns: `120px repeat(${cols.length}, 1fr)` }}>
        {/* Store headers */}
        <div className="compare-row compare-row-header">
          <span className="compare-label"></span>
          {cols.map((s) => (
            <span key={s.store} className="compare-value compare-store-header" onClick={() => handleSelect(s)}>
              #{s.store}<br /><small>{s.nickname}</small>
            </span>
          ))}
        </div>

        <StatRow label="City" values={cols.map((s) => s.city || '—')} />
        <StatRow label="Format" values={cols.map((s) => s.target ? 'Target' : 'CVS')} />
        <StatRow label="Rx Status" values={cols.map((s) => {
          const status = getPharmacyStatus(s, now);
          return status === 'open' ? '🟢 Open' : status === 'closing' ? '🟡 Closing' : status === 'closed' ? '🔴 Closed' : '—';
        })} />
        <StatRow label="Rx 24hr" values={cols.map((s) => s.rx24 === 'Yes' ? '✓' : '—')} />
        <StatRow label="FS 24hr" values={cols.map((s) => s.fs24 === 'Yes' ? '✓' : '—')} />
        <StatRow label="Drive-Thru" values={cols.map((s) => s.driveThru === 'Yes' ? '✓' : '—')} />
        <StatRow label="MinuteClinic" values={cols.map((s) => s.minuteClinic === 'Yes' ? '✓' : '—')} />
        <StatRow label="y más" values={cols.map((s) => s.ymas === 'Yes' ? '✓' : '—')} />
        <StatRow label="Rx District" values={cols.map((s) => s.rxDistrict || '—')} />
        <StatRow label="FS District" values={cols.map((s) => s.fsDistrict || '—')} />
      </div>
    </div>
  );
}
