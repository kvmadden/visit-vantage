import React, { useState, useMemo, useCallback } from 'react';
import stores from './data/stores.json';
import MapView from './components/MapView';
import FilterBar from './components/FilterBar';
import SearchBar from './components/SearchBar';
import StoreCard from './components/StoreCard';
import DistrictSummary from './components/DistrictSummary';
import RoutePlanner from './components/RoutePlanner';
import Legend from './components/Legend';
import { optimizeRoute, getRouteStats, buildMapsUrl } from './utils/routing';
import { RX_COLORS, FS_COLORS } from './utils/colors';
import './App.css';

export default function App() {
  const [activeDistrict, setActiveDistrict] = useState(null);
  const [districtMode, setDistrictMode] = useState('rx'); // 'rx' or 'fs'
  const [flags, setFlags] = useState({ fs24: false, rx24: false, ymas: false, target: false });
  const [searchText, setSearchText] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [routeStores, setRouteStores] = useState([]);
  const [gpsPosition, setGpsPosition] = useState(null);
  const [districtView, setDistrictView] = useState(false);

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      // In FS mode, hide Target stores (fsDistrict 98)
      if (districtMode === 'fs' && store.target === true) return false;

      const districtField = districtMode === 'rx' ? 'rxDistrict' : 'fsDistrict';
      if (activeDistrict != null && store[districtField] !== activeDistrict) return false;
      if (flags.fs24 && store.fs24 !== 'Yes') return false;
      if (flags.rx24 && store.rx24 !== 'Yes') return false;
      if (flags.ymas && store.ymas !== 'Yes') return false;
      if (flags.target && store.target !== true) return false;
      if (searchText) {
        const q = searchText.toLowerCase();
        const haystack = [
          String(store.store),
          store.nickname,
          store.city,
          store.address,
          store.zip,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [activeDistrict, districtMode, flags, searchText, stores]);

  const routeStats = useMemo(() => {
    if (routeStores.length === 0) return null;
    return getRouteStats(routeStores, gpsPosition);
  }, [routeStores, gpsPosition]);

  const handleDistrictChange = useCallback((d) => {
    setActiveDistrict(d);
  }, []);

  const handleDistrictModeChange = useCallback((mode) => {
    setDistrictMode(mode);
    setActiveDistrict(null); // reset filter when switching modes
  }, []);

  const handleFlagToggle = useCallback((flag) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  }, []);

  const handleSearchChange = useCallback((text) => {
    setSearchText(text);
  }, []);

  const handleStoreSelect = useCallback((store) => {
    setSelectedStore(store);
    setSearchText('');
  }, []);

  const handleAddToRoute = useCallback((store) => {
    setRouteStores((prev) => {
      if (prev.some((s) => s.store === store.store)) return prev;
      return [...prev, store];
    });
  }, []);

  const handleRemoveFromRoute = useCallback((store) => {
    setRouteStores((prev) => prev.filter((s) => s.store !== store.store));
  }, []);

  const handleOptimizeRoute = useCallback(() => {
    setRouteStores((prev) => optimizeRoute(prev, gpsPosition));
  }, [gpsPosition]);

  const handleClearRoute = useCallback(() => {
    setRouteStores([]);
  }, []);

  const handleOpenInMaps = useCallback(() => {
    window.open(buildMapsUrl(routeStores, gpsPosition), '_blank');
  }, [routeStores, gpsPosition]);

  const handleRequestGps = useCallback(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setGpsPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, []);

  const handleDistrictViewToggle = useCallback(() => {
    setDistrictView((prev) => !prev);
  }, []);

  const handleCloseCard = useCallback(() => {
    setSelectedStore(null);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <span className="header-title">StoreSprint</span>
        <span className="header-badge">REGION 41</span>
      </header>
      <FilterBar
        activeDistrict={activeDistrict}
        onDistrictChange={handleDistrictChange}
        districtMode={districtMode}
        onDistrictModeChange={handleDistrictModeChange}
        flags={flags}
        onFlagToggle={handleFlagToggle}
        storeCount={filteredStores.length}
        districtView={districtView}
        onDistrictViewToggle={handleDistrictViewToggle}
      />
      <SearchBar
        stores={stores}
        onStoreSelect={handleStoreSelect}
        searchText={searchText}
        onSearchChange={handleSearchChange}
      />
      <div className="app-main">
        <div className="map-container">
          <MapView
            stores={filteredStores}
            selectedStore={selectedStore}
            onStoreSelect={handleStoreSelect}
            routeStores={routeStores}
            activeDistrict={districtView ? activeDistrict : null}
            districtMode={districtMode}
            gpsPosition={gpsPosition}
          />
        </div>
        {districtView && activeDistrict && (
          <DistrictSummary
            district={activeDistrict}
            stores={filteredStores}
            districtMode={districtMode}
            dlName={
              districtMode === 'rx'
                ? filteredStores[0]?.rxDL || ''
                : filteredStores[0]?.fsDL || ''
            }
          />
        )}
        <Legend districtMode={districtMode} />
        {selectedStore && (
          <StoreCard
            store={selectedStore}
            onClose={handleCloseCard}
            onAddToRoute={handleAddToRoute}
            onRemoveFromRoute={handleRemoveFromRoute}
            isInRoute={routeStores.some((s) => s.store === selectedStore.store)}
          />
        )}
        <RoutePlanner
          routeStores={routeStores}
          onRemoveFromRoute={handleRemoveFromRoute}
          onOptimizeRoute={handleOptimizeRoute}
          onClearRoute={handleClearRoute}
          onOpenInMaps={handleOpenInMaps}
          gpsPosition={gpsPosition}
          onRequestGps={handleRequestGps}
          routeStats={routeStats}
        />
      </div>
      <footer className="footer">&copy; 2026 Madden Frameworks &middot; v2</footer>
    </div>
  );
}
