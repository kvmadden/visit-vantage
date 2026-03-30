import { useState } from "react";

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
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!routeStores || routeStores.length === 0) {
    return null;
  }

  return (
    <div
      className="route-planner"
      style={{
        transform: isExpanded ? "translateY(0)" : "translateY(calc(100% - 48px))",
      }}
    >
      <div
        className="route-handle"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <span className="route-handle-label">Route Planner</span>
        <span className="route-badge">{routeStores.length}</span>
        <span className="route-chevron">{isExpanded ? "▼" : "▲"}</span>
      </div>

      <div className="route-body">
        {/* GPS section */}
        <div className="route-gps-section">
          <button className="route-gps-btn" onClick={onRequestGps}>
            Use GPS
          </button>
          {gpsPosition && (
            <span className="route-gps-status">
              GPS active ({gpsPosition.lat.toFixed(4)}, {gpsPosition.lng.toFixed(4)})
            </span>
          )}
        </div>

        {/* Route stats */}
        {routeStats && (
          <div className="route-stats">
            <span>{routeStats.totalDistance.toFixed(1)} mi</span>
            <span>{formatTime(routeStats.estimatedTime)}</span>
            <span>{routeStores.length} stops</span>
          </div>
        )}

        {/* Numbered stop list */}
        <ul className="route-stop-list">
          {routeStores.map((store, index) => (
            <li key={store.store} className="route-stop">
              <span className="route-stop-number">{index + 1}</span>
              <div className="route-stop-info">
                <span className="route-stop-name">
                  {store.nickname} #{store.store}
                </span>
                <span className="route-stop-address">{store.address}</span>
              </div>
              <button
                className="route-stop-remove"
                onClick={() => onRemoveFromRoute(store)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        {/* Action buttons */}
        <div className="route-actions">
          <button
            className="route-btn route-btn-primary"
            onClick={onOptimizeRoute}
            disabled={routeStores.length < 2}
          >
            Optimize
          </button>
          <button
            className="route-btn route-btn-secondary"
            onClick={onOpenInMaps}
            disabled={routeStores.length < 1}
          >
            Open in Maps
          </button>
          <button
            className="route-btn route-btn-danger"
            onClick={onClearRoute}
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
