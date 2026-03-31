import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('storesprint-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('storesprint-theme', theme);
  }, [theme]);

  const handleThemeToggle = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

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
        <div className="header-left">
          <span className="header-title">StoreSprint</span>
        </div>
        <div className="header-right">
          <span className="header-badge">REGION 41</span>
          <button
            className="theme-toggle"
            onClick={handleThemeToggle}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>
        </div>
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
            theme={theme}
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
        <Legend districtMode={districtMode} theme={theme} />
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
