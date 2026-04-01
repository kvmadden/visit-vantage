import { useState, useEffect, useRef } from 'react';
import { haversine } from '../utils/routing';

const PROXIMITY_METERS = 200;
const SNOOZE_MS = 10 * 60 * 1000; // 10 minutes
const AUTO_DISMISS_MS = 30 * 1000; // 30 seconds

export default function ProximityAlert({ gpsPosition, routeStores, stopStatuses, onStopStatusChange }) {
  const [snoozed, setSnoozed] = useState({});
  const [visible, setVisible] = useState(false);
  const [targetStore, setTargetStore] = useState(null);
  const timerRef = useRef(null);

  // Find next planned stop
  const nextStop = routeStores
    ? routeStores.find((s) => {
        const status = stopStatuses[s.store];
        return !status || status === 'planned';
      })
    : null;

  useEffect(() => {
    if (!gpsPosition || !nextStop) {
      setVisible(false);
      return;
    }

    // Check if snoozed
    if (snoozed[nextStop.store] && Date.now() - snoozed[nextStop.store] < SNOOZE_MS) {
      return;
    }

    const dist = haversine(gpsPosition.lat, gpsPosition.lng, nextStop.lat, nextStop.lng);
    const distMeters = dist * 1609.34;

    if (distMeters <= PROXIMITY_METERS) {
      setTargetStore(nextStop);
      setVisible(true);

      // Auto-dismiss
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), AUTO_DISMISS_MS);
    } else {
      setVisible(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gpsPosition, nextStop, snoozed, stopStatuses]);

  if (!visible || !targetStore) return null;

  return (
    <div className="proximity-alert fade-in">
      <div className="proximity-alert-content">
        <span className="proximity-alert-icon">&#x1F4CD;</span>
        <div className="proximity-alert-text">
          <span>You're near <strong>Store #{targetStore.store}</strong> — {targetStore.nickname}</span>
        </div>
      </div>
      <div className="proximity-alert-actions">
        <button
          className="btn btn-primary"
          style={{ minHeight: 36, fontSize: 13 }}
          onClick={() => {
            onStopStatusChange(targetStore.store, 'visited');
            setVisible(false);
          }}
        >
          I'm here
        </button>
        <button
          className="btn btn-secondary"
          style={{ minHeight: 36, fontSize: 13 }}
          onClick={() => {
            setSnoozed((prev) => ({ ...prev, [targetStore.store]: Date.now() }));
            setVisible(false);
          }}
        >
          Not yet
        </button>
      </div>
    </div>
  );
}
