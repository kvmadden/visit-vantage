import React from 'react';
import { CHAIN_COLORS } from './StoreCard';

const styles = {
  panel: {
    background: '#fff',
    padding: 16,
    borderTop: '2px solid #4a90d9',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    fontSize: 20,
    cursor: 'pointer',
    color: '#666',
    padding: 0,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    margin: '0 0 8px 0',
    paddingRight: 44,
  },
  chainBadge: {
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
    borderRadius: 10,
    padding: '2px 10px',
    marginBottom: 8,
    lineHeight: '18px',
  },
  address: {
    fontSize: 14,
    color: '#333',
    margin: '8px 0',
    whiteSpace: 'pre-line',
    lineHeight: '20px',
  },
  phone: {
    fontSize: 14,
    color: '#4a90d9',
    textDecoration: 'none',
    display: 'inline-block',
    margin: '4px 0',
  },
  district: {
    fontSize: 13,
    color: '#888',
    margin: '4px 0 12px 0',
  },
  btn: {
    display: 'block',
    width: '100%',
    minHeight: 44,
    borderRadius: 8,
    border: 'none',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
    textAlign: 'center',
    textDecoration: 'none',
    lineHeight: '44px',
    boxSizing: 'border-box',
  },
  addBtn: {
    background: '#4a90d9',
    color: '#fff',
  },
  removeBtn: {
    background: '#e53e3e',
    color: '#fff',
  },
  secondaryBtn: {
    background: '#e2e8f0',
    color: '#4a5568',
  },
};

export default function StoreDetail({
  store,
  onClose,
  onAddToRoute,
  onRemoveFromRoute,
  isInRoute,
  routeIndex,
}) {
  if (!store) return null;

  const chainColor = CHAIN_COLORS[store.chain] || '#888';
  const fullAddress = `${store.address}\n${store.city}, ${store.state} ${store.zip}`;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;

  return (
    <div className="store-detail" style={styles.panel}>
      <button
        style={styles.closeBtn}
        onClick={onClose}
        aria-label="Close"
      >
        &#x2715;
      </button>

      <div style={styles.name}>{store.name}</div>

      <span style={{ ...styles.chainBadge, backgroundColor: chainColor }}>
        {store.chain}
      </span>

      <div style={styles.address}>{fullAddress}</div>

      {store.phone && (
        <a href={`tel:${store.phone}`} style={styles.phone}>
          {store.phone}
        </a>
      )}

      {store.district && (
        <div style={styles.district}>District: {store.district}</div>
      )}

      {isInRoute ? (
        <button
          style={{ ...styles.btn, ...styles.removeBtn }}
          onClick={() => onRemoveFromRoute(store)}
        >
          Remove from Route{routeIndex != null ? ` (#${routeIndex})` : ''}
        </button>
      ) : (
        <button
          style={{ ...styles.btn, ...styles.addBtn }}
          onClick={() => onAddToRoute(store)}
        >
          Add to Route
        </button>
      )}

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...styles.btn, ...styles.secondaryBtn }}
      >
        Open in Maps
      </a>

      {store.phone && (
        <a
          href={`tel:${store.phone}`}
          style={{ ...styles.btn, ...styles.secondaryBtn }}
        >
          Call Store
        </a>
      )}
    </div>
  );
}
