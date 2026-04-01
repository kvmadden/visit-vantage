import { useState, useCallback } from 'react';

function formatTime(minutes) {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return `${h}h ${m}m`;
  }
  return `${Math.round(minutes)} min`;
}

const TIME_BUDGETS = {
  '1hr': 60,
  '2hr': 120,
  half: 240,
  full: 480,
};

function buildShareText(routeStores, routeStats) {
  var lines = ['VisitVantage Route (' + routeStores.length + ' stops)'];
  routeStores.forEach(function (store, i) {
    lines.push((i + 1) + '. CVS #' + store.store + ' — ' + (store.nickname || store.address));
  });
  if (routeStats) {
    lines.push('');
    lines.push(routeStats.totalDistance.toFixed(1) + ' mi · ' + formatTime(routeStats.estimatedTime));
  }
  return lines.join('\n');
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
  sessionConfig,
}) {
  var stateArr = useState(null);
  var copiedIdx = stateArr[0];
  var setCopiedIdx = stateArr[1];

  var handleCopyRoute = useCallback(function () {
    var text = buildShareText(routeStores, routeStats);
    navigator.clipboard.writeText(text).then(function () {
      setCopiedIdx('all');
      setTimeout(function () { setCopiedIdx(null); }, 1500);
    });
  }, [routeStores, routeStats]);

  var handleShareRoute = useCallback(function () {
    if (navigator.share) {
      navigator.share({
        title: 'VisitVantage Route',
        text: buildShareText(routeStores, routeStats),
      });
    } else {
      handleCopyRoute();
    }
  }, [routeStores, routeStats, handleCopyRoute]);

  if (!routeStores || routeStores.length === 0) {
    return null;
  }

  // Pacing: estimate minutes per store based on session time budget
  var timeBudget = sessionConfig && TIME_BUDGETS[sessionConfig.timeAvailable];
  var pacingLabel = null;
  if (timeBudget && routeStats && routeStores.length > 0) {
    var driveTime = routeStats.estimatedTime || 0;
    var storeTime = Math.max(0, timeBudget - driveTime);
    var perStore = Math.round(storeTime / routeStores.length);
    if (perStore > 0) {
      pacingLabel = '~' + perStore + ' min/store';
    }
  }

  // Progress: how much time budget is used
  var budgetPct = null;
  if (timeBudget && routeStats) {
    budgetPct = Math.min(100, Math.round((routeStats.estimatedTime / timeBudget) * 100));
  }

  if (inline) {
    return (
      <div className="route-inline">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Route</span>
          <span className="route-badge">{routeStores.length}</span>
          {pacingLabel && (
            <span className="route-pacing-pill">{pacingLabel}</span>
          )}
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

        {/* Time budget progress bar */}
        {budgetPct !== null && (
          <div className="route-budget-bar" style={{ marginBottom: 8 }}>
            <div className="route-budget-track">
              <div
                className="route-budget-fill"
                style={{
                  width: budgetPct + '%',
                  backgroundColor: budgetPct > 80 ? 'var(--warning)' : budgetPct > 95 ? 'var(--destructive)' : 'var(--accent)',
                }}
              />
            </div>
            <span className="route-budget-label font-mono">
              {budgetPct}% of time budget (drive only)
            </span>
          </div>
        )}

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {routeStores.map(function (store, index) {
            var legIdx = gpsPosition ? index : index - 1;
            var leg = routeStats && routeStats.legs && routeStats.legs[legIdx];
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
                    onClick={function () { onRemoveFromRoute(store); }}
                  >
                    &#x2715;
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
            Clear
          </button>
        </div>

        {/* Share / Copy row */}
        <div className="route-actions" style={{ marginTop: 6 }}>
          <button className="btn btn-secondary" style={{ flex: 1, minHeight: 36, fontSize: 12 }} onClick={handleCopyRoute}>
            {copiedIdx === 'all' ? 'Copied!' : 'Copy Route'}
          </button>
          <button className="btn btn-secondary" style={{ flex: 1, minHeight: 36, fontSize: 12 }} onClick={handleShareRoute}>
            Share
          </button>
        </div>
      </div>
    );
  }
  return null;
}
