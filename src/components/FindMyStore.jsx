import { useState, useCallback } from 'react';
import { haversine } from '../utils/routing';

export default function FindMyStore({ onLocate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = useCallback(() => {
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        onLocate({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLoading(false);
        setError('Location access is needed for this feature. You can still search for stores by name or number.');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
    );
  }, [onLocate]);

  return (
    <div>
      <button className="find-my-store-btn" onClick={handleClick} disabled={loading}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3"/>
          <line x1="12" y1="2" x2="12" y2="6"/>
          <line x1="12" y1="18" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="6" y2="12"/>
          <line x1="18" y1="12" x2="22" y2="12"/>
        </svg>
        {loading ? 'Locating...' : 'Where am I today?'}
      </button>
      {error && <p className="find-my-store-error">{error}</p>}
    </div>
  );
}
