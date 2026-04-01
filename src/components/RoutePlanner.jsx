

function formatTime(minutes) {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${h}h ${m}m`;
  }
  return `${Math.round(minutes)} min`;
}

export default function RoutePlanner({
  routeStores,
  onRemoveFromRoute,
  onOptimizeRoute,
  onClearRoute,
  onOpenInMaps,
  gpsPosition,
  onRequestGps,
  routeStats,
  inline,
}) {


  if (!routeStores || routeStores.length === 0) {
    return null;
  }

  // Inline mode: render flat content inside the bottom sheet
  if (inline) {
    return (
      <div className="route-inline">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Route</span>
          <span className="route-badge">{routeStores.length}</span>
          <button className="btn btn-secondary" style={{ marginLeft: 'auto', minHeight: 32, padding: '0 10px', fontSize: 12 }} onClick={onRequestGps}>
            GPS
          </button>
        </div>

        {gpsPosition && (
          <div className="route-gps-status">
            GPS active ({gpsPosition.lat.toFixed(4)}, {gpsPosition.lng.toFixed(4)})
          </div>
        )}

        {routeStats && (
          <div style={{ display: 'flex', gap: 16, fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: 8 }}>
            <span>{routeStats.totalDistance.toFixed(1)} mi</span>
            <span>{formatTime(routeStats.estimatedTime)}</span>
            <span>{routeStores.length} stops</span>
          </div>
        )}

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {routeStores.map((store, index) => {
            const legIdx = gpsPosition ? index : index - 1;
            const leg = routeStats?.legs?.[legIdx];
            return (
              <li key={store.store}>
                {leg && (
                  <div className="route-leg-info" style={{ fontFamily: 'var(--font-mono)' }}>
                    {leg.distance.toFixed(1)} mi &middot; {formatTime(leg.duration)}
                  </div>
                )}
                <div className="route-stop">
                  <span className="route-stop-number">{index + 1}</span>
                  <div className="route-stop-info">
                    <span className="route-stop-name">
                      {store.nickname} <span style={{ fontFamily: 'var(--font-mono)' }}>#{store.store}</span>
                    </span>
                    <span className="route-stop-addr">{store.address}</span>
                  </div>
                  <button
                    className="route-stop-remove"
                    onClick={() => onRemoveFromRoute(store)}
                  >
                    ✕
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="route-actions">
          <button className="btn btn-primary" onClick={onOptimizeRoute} disabled={routeStores.length < 2}>
            Optimize
          </button>
          <button className="btn btn-secondary" onClick={onOpenInMaps} disabled={routeStores.length < 1}>
            Open in Maps
          </button>
          <button className="btn btn-danger" onClick={onClearRoute}>
            Clear Route
          </button>
        </div>
      </div>
    );
  }
  return null; // inline mode only — no legacy fallback
}
