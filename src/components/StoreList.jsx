import React, { useRef, useEffect } from 'react';
import StoreCard from './StoreCard';

const styles = {
  container: {
    overflowY: 'auto',
    height: '100%',
    padding: '8px 12px',
    boxSizing: 'border-box',
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#999',
    fontSize: 14,
  },
};

export default function StoreList({ stores, selectedStore, onStoreSelect, routeStores }) {
  const cardRefs = useRef({});

  useEffect(() => {
    if (selectedStore && cardRefs.current[selectedStore.id]) {
      cardRefs.current[selectedStore.id].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedStore]);

  if (!stores || stores.length === 0) {
    return (
      <div className="store-list" style={styles.container}>
        <div style={styles.empty}>No stores match filters</div>
      </div>
    );
  }

  const routeIndexMap = {};
  if (routeStores && routeStores.length > 0) {
    routeStores.forEach((s, i) => {
      routeIndexMap[s.id] = i + 1;
    });
  }

  return (
    <div className="store-list" style={styles.container}>
      {stores.map((store) => (
        <div key={store.id} ref={(el) => { cardRefs.current[store.id] = el; }}>
          <StoreCard
            store={store}
            isSelected={selectedStore && selectedStore.id === store.id}
            onSelect={onStoreSelect}
            routeIndex={routeIndexMap[store.id] != null ? routeIndexMap[store.id] : null}
          />
        </div>
      ))}
    </div>
  );
}
