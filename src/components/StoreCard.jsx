import React from 'react';

export const CHAIN_COLORS = {
  CVS: '#cc0000',
  Walgreens: '#1a7b1a',
  Walmart: '#0071ce',
  Publix: '#4b8f29',
  'Winn-Dixie': '#e31837',
  'Rite Aid': '#1e3c78',
  Target: '#cc0000',
  Costco: '#e31837',
  "Sam's Club": '#0060a9',
  Kroger: '#0062ac',
};

const styles = {
  card: {
    minHeight: 72,
    padding: '12px 16px',
    marginBottom: 8,
    borderRadius: 10,
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    border: '1px solid transparent',
    transition: 'border-color 0.15s ease',
    boxSizing: 'border-box',
  },
  cardSelected: {
    borderLeft: '4px solid #4a90d9',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  chainBadge: {
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 600,
    color: '#fff',
    borderRadius: 10,
    padding: '2px 8px',
    marginBottom: 4,
    lineHeight: '16px',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    margin: '2px 0',
    lineHeight: '20px',
  },
  address: {
    fontSize: 13,
    color: '#555',
    margin: '2px 0',
  },
  district: {
    fontSize: 12,
    color: '#999',
    margin: '2px 0',
  },
  phone: {
    fontSize: 13,
    color: '#4a90d9',
    textDecoration: 'none',
    marginTop: 2,
    display: 'inline-block',
  },
  routeCircle: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#4a90d9',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 14,
    marginLeft: 12,
    flexShrink: 0,
  },
};

export default function StoreCard({ store, isSelected, onSelect, routeIndex }) {
  const chainColor = CHAIN_COLORS[store.chain] || '#888';

  const cardStyle = {
    ...styles.card,
    ...(isSelected ? styles.cardSelected : {}),
  };

  const address = [store.address, store.city, store.state, store.zip]
    .filter(Boolean)
    .join(', ')
    .replace(/,\s*,/g, ',');

  return (
    <div
      className={isSelected ? 'store-card selected' : 'store-card'}
      style={cardStyle}
      onClick={() => onSelect(store)}
    >
      <div style={styles.content}>
        <span style={{ ...styles.chainBadge, backgroundColor: chainColor }}>
          {store.chain}
        </span>
        <div style={styles.name}>{store.name}</div>
        {address && <div style={styles.address}>{address}</div>}
        {store.district && (
          <div style={styles.district}>
            District {store.district}
            {store.territory ? ` \u00b7 ${store.territory}` : ''}
          </div>
        )}
        {store.phone && (
          <a
            href={`tel:${store.phone}`}
            style={styles.phone}
            onClick={(e) => e.stopPropagation()}
          >
            {store.phone}
          </a>
        )}
      </div>
      {routeIndex != null && (
        <div style={styles.routeCircle}>{routeIndex}</div>
      )}
    </div>
  );
}
