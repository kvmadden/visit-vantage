import React, { useState } from 'react';

const styles = {
  panel: {
    background: '#fff',
    borderTop: '2px solid #4a90d9',
    padding: '12px 16px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    userSelect: 'none',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a202c',
    margin: 0,
  },
  collapseToggle: {
    background: 'none',
    border: 'none',
    fontSize: 18,
    color: '#4a5568',
    cursor: 'pointer',
    padding: 4,
    lineHeight: 1,
  },
  statsBar: {
    display: 'flex',
    gap: 16,
    padding: '8px 0',
    fontSize: 14,
    color: '#4a5568',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  actionsRow: {
    display: 'flex',
    gap: 8,
    padding: '8px 0',
  },
  btnOptimize: {
    minHeight: 44,
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    border: 'none',
    cursor: 'pointer',
    padding: '0 16px',
    flex: 1,
    background: '#4a90d9',
    color: '#fff',
  },
  btnMaps: {
    minHeight: 44,
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    border: '1px solid #4a90d9',
    cursor: 'pointer',
    padding: '0 16px',
    flex: 1,
    background: '#fff',
    color: '#4a90d9',
  },
  btnClear: {
    minHeight: 44,
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    border: 'none',
    cursor: 'pointer',
    padding: '0 16px',
    flex: 1,
    background: '#e53e3e',
    color: '#fff',
  },
  routeStop: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  routeNumber: {
    width: 24,
    height: 24,
    background: '#4a90d9',
    color: '#fff',
    borderRadius: '50%',
    fontSize: 12,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: 10,
  },
  stopInfo: {
    flex: 1,
    minWidth: 0,
  },
  stopName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1a202c',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stopMeta: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    fontSize: 16,
    color: '#a0aec0',
    cursor: 'pointer',
    padding: '4px 8px',
    lineHeight: 1,
    flexShrink: 0,
  },
  stopsList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
};

function formatTime(minutes) {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}

export default function RoutePanel({
  routeStores,
  routeStats,
  onOptimizeRoute,
  onClearRoute,
  onOpenInMaps,
  onRemoveFromRoute,
}) {
  const [expanded, setExpanded] = useState(true);

  const count = routeStores ? routeStores.length : 0;
  const legs = routeStats?.legs || [];

  return (
    <div className="route-panel" style={styles.panel}>
      <div style={styles.header} onClick={() => setExpanded(!expanded)}>
        <h3 style={styles.headerTitle}>Route ({count} stops)</h3>
        <button
          style={styles.collapseToggle}
          aria-label={expanded ? 'Collapse route panel' : 'Expand route panel'}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? '\u25B2' : '\u25BC'}
        </button>
      </div>

      {expanded && (
        <>
          {routeStats && (
            <div style={styles.statsBar}>
              <span style={styles.statItem}>
                {routeStats.totalDistance.toFixed(1)} mi
              </span>
              <span style={styles.statItem}>
                {formatTime(routeStats.estimatedTime)}
              </span>
              <span style={styles.statItem}>
                {count} stops
              </span>
            </div>
          )}

          <div style={styles.actionsRow}>
            <button
              style={styles.btnOptimize}
              onClick={onOptimizeRoute}
            >
              Optimize
            </button>
            <button
              style={styles.btnMaps}
              onClick={onOpenInMaps}
            >
              Open in Maps
            </button>
            <button
              style={styles.btnClear}
              onClick={onClearRoute}
            >
              Clear Route
            </button>
          </div>

          <ol style={styles.stopsList}>
            {routeStores && routeStores.map((store, index) => {
              const leg = legs[index];
              const distanceToNext = leg ? `${leg.distance?.toFixed(1) || '?'} mi to next` : null;

              return (
                <li key={store.id || index} style={styles.routeStop} className="route-stop">
                  <div style={styles.routeNumber}>{index + 1}</div>
                  <div style={styles.stopInfo}>
                    <div style={styles.stopName}>{store.name}</div>
                    <div style={styles.stopMeta}>
                      {store.chain}
                      {distanceToNext && ` \u00B7 ${distanceToNext}`}
                    </div>
                  </div>
                  <button
                    style={styles.removeBtn}
                    onClick={() => onRemoveFromRoute(store)}
                    aria-label={`Remove ${store.name} from route`}
                  >
                    \u00D7
                  </button>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
