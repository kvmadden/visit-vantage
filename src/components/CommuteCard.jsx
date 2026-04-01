import { useState, useEffect, useMemo } from 'react';
import { haversine } from '../utils/routing';

export default function CommuteCard({ gpsPosition, stores, onStoreSelect }) {
  const [dismissed, setDismissed] = useState(false);
  const [autoHide, setAutoHide] = useState(false);

  const nearest = useMemo(() => {
    if (!gpsPosition || !stores || stores.length === 0) return null;
    let best = null;
    let bestDist = Infinity;
    stores.forEach((s) => {
      const d = haversine(gpsPosition.lat, gpsPosition.lng, s.lat, s.lng);
      if (d < bestDist) { bestDist = d; best = s; }
    });
    return best ? { store: best, distance: bestDist, driveMin: Math.round(bestDist * 2.5) } : null;
  }, [gpsPosition, stores]);

  // Auto-dismiss after 15 seconds
  useEffect(() => {
    if (!nearest || dismissed) return;
    const timer = setTimeout(() => setAutoHide(true), 15000);
    return () => clearTimeout(timer);
  }, [nearest, dismissed]);

  if (!nearest || dismissed || autoHide) return null;

  return (
    <div className="commute-card fade-in" onClick={() => onStoreSelect(nearest.store)}>
      <div className="commute-card-content">
        <span className="commute-card-icon">&#x1F4CD;</span>
        <div className="commute-card-text">
          <span className="commute-card-label">You're nearest to</span>
          <span className="commute-card-store">
            Store #{nearest.store.store} — {nearest.store.nickname}
          </span>
          <span className="commute-card-distance" style={{ fontFamily: 'var(--font-mono)' }}>
            {nearest.distance.toFixed(1)} mi · ~{nearest.driveMin} min
          </span>
        </div>
      </div>
      <button
        className="commute-card-dismiss"
        onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
