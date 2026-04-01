export const APP_VERSION = 'v2.11.1';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import stores from './data/stores.json';
import MapView from './components/MapView';
import FilterBar from './components/FilterBar';
import SearchBar from './components/SearchBar';
import StoreCard from './components/StoreCard';
import DistrictSummary from './components/DistrictSummary';
import RoutePlanner from './components/RoutePlanner';
import Legend from './components/Legend';
import LayerPanel from './components/LayerPanel';
import BottomSheet from './components/BottomSheet';
import WeatherWidget from './components/WeatherWidget';
import Brand from './components/Brand';
import LandingPage from './components/LandingPage';
import SetupScreen from './components/SetupScreen';
import FocusBanner from './components/FocusBanner';
import QuickFilterChips, { CHIPS } from './components/QuickFilterChips';
import CommuteCard from './components/CommuteCard';
import ProximityAlert from './components/ProximityAlert';
import MapBookmarks from './components/MapBookmarks';
import RouteExport from './components/RouteExport';
import StoreComparison from './components/StoreComparison';
import MapAnnotations from './components/MapAnnotations';
import { optimizeRoute, getRouteStats, getRouteStatsOSRM, buildMapsUrl } from './utils/routing';
import { RX_COLORS, FS_COLORS } from './utils/colors';
import { markStoreViewed, getViewedStores } from './utils/storeStatus';
import { getPharmacyStatus } from './utils/storeHours';
import './App.css';

export default function App() {
  const [activeDistrict, setActiveDistrict] = useState(null);
  const [districtMode, setDistrictMode] = useState('rx');
  const [flags, setFlags] = useState({ fs24: false, rx24: false, ymas: false, target: false });
  const [searchText, setSearchText] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [routeStores, setRouteStores] = useState([]);
  const [stopStatuses, setStopStatuses] = useState({}); // { storeId: 'planned'|'active'|'visited'|'skipped' }
  const [gpsPosition, setGpsPosition] = useState(null);
  const [districtView, setDistrictView] = useState(false);
  const [viewedStores, setViewedStores] = useState(() => getViewedStores());
  const [activeLayers, setActiveLayers] = useState({});
  const [appScreen, setAppScreen] = useState('landing'); // 'landing' | 'setup' | 'map'
  const [sessionConfig, setSessionConfig] = useState(null);
  const [quickFilters, setQuickFilters] = useState([]);
  const [mapRef, setMapRef] = useState(null);
  const [compareStores, setCompareStores] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('visitvantage-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('visitvantage-theme', theme);
  }, [theme]);

  const handleThemeToggle = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Stores filtered by district only (for quick-filter chip counts)
  const districtFilteredStores = useMemo(() => {
    return stores.filter((store) => {
      if (districtMode === 'fs' && store.target === true) return false;
      const districtField = districtMode === 'rx' ? 'rxDistrict' : 'fsDistrict';
      if (activeDistrict != null && store[districtField] !== activeDistrict) return false;
      return true;
    });
  }, [activeDistrict, districtMode, stores]);

  const filteredStores = useMemo(() => {
    const now = new Date();
    return districtFilteredStores.filter((store) => {
      if (flags.fs24 && store.fs24 !== 'Yes') return false;
      if (flags.rx24 && store.rx24 !== 'Yes') return false;
      if (flags.ymas && store.ymas !== 'Yes') return false;
      if (flags.target && store.target !== true) return false;

      // Quick-filter chips (AND logic)
      for (const chipKey of quickFilters) {
        const chip = CHIPS.find((c) => c.key === chipKey);
        if (chip && !chip.filter(store, now)) return false;
      }

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
  }, [districtFilteredStores, flags, quickFilters, searchText]);

  const [routeStats, setRouteStats] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);

  // Fetch OSRM route stats when route changes
  useEffect(() => {
    if (routeStores.length === 0) {
      setRouteStats(null);
      setRouteGeometry(null);
      return;
    }
    // Start with haversine estimate immediately
    const localStats = getRouteStats(routeStores, gpsPosition);
    setRouteStats(localStats);

    // Then fetch OSRM for real road-network stats
    const controller = new AbortController();
    getRouteStatsOSRM(routeStores, gpsPosition, controller.signal).then((stats) => {
      if (!controller.signal.aborted) {
        setRouteStats(stats);
        if (stats.geometry) setRouteGeometry(stats.geometry);
      }
    });
    return () => controller.abort();
  }, [routeStores, gpsPosition]);

  const handleDistrictChange = useCallback((d) => {
    setActiveDistrict(d);
  }, []);

  const handleDistrictModeChange = useCallback((mode) => {
    setDistrictMode(mode);
    setActiveDistrict(null);
  }, []);

  const handleFlagToggle = useCallback((flag) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  }, []);

  const handleQuickFilterToggle = useCallback((chipKey) => {
    setQuickFilters((prev) =>
      prev.includes(chipKey) ? prev.filter((k) => k !== chipKey) : [...prev, chipKey]
    );
  }, []);

  const handleSearchChange = useCallback((text) => {
    setSearchText(text);
  }, []);

  const handleStoreSelect = useCallback((store) => {
    setSelectedStore(store);
    setSearchText('');
    if (store) {
      markStoreViewed(store.store);
      setViewedStores((prev) => {
        const next = new Set(prev);
        next.add(store.store);
        return next;
      });
    }
  }, []);

  const handleAddToRoute = useCallback((store) => {
    setRouteStores((prev) => {
      if (prev.some((s) => s.store === store.store)) return prev;
      return [...prev, store];
    });
  }, []);

  const handleRemoveFromRoute = useCallback((store) => {
    setRouteStores((prev) => prev.filter((s) => s.store !== store.store));
    setStopStatuses((prev) => {
      const next = { ...prev };
      delete next[store.store];
      return next;
    });
  }, []);

  const handleReorderRoute = useCallback((newOrder) => {
    setRouteStores(newOrder);
  }, []);

  const handleStopStatusChange = useCallback((storeId, status) => {
    setStopStatuses((prev) => ({ ...prev, [storeId]: status }));
  }, []);

  const handleOptimizeRoute = useCallback(async () => {
    const result = await optimizeRoute(routeStores, gpsPosition);
    setRouteStores(result.stores);
    if (result.geometry) setRouteGeometry(result.geometry);
  }, [routeStores, gpsPosition]);

  const handleClearRoute = useCallback(() => {
    setRouteStores([]);
  }, []);

  const handleOpenInMaps = useCallback(() => {
    window.open(buildMapsUrl(routeStores, gpsPosition), '_blank');
  }, [routeStores, gpsPosition]);

  // GPS watch for proximity features
  const [gpsWatchActive, setGpsWatchActive] = useState(false);
  useEffect(() => {
    if (!gpsPosition || gpsWatchActive) return;
    if (!navigator.geolocation) return;
    let lastLat = gpsPosition.lat;
    let lastLng = gpsPosition.lng;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        // Only update if moved > 50m
        const dLat = newLat - lastLat;
        const dLng = newLng - lastLng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng) * 111000;
        if (dist > 50) {
          lastLat = newLat;
          lastLng = newLng;
          setGpsPosition({ lat: newLat, lng: newLng });
        }
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 30000 }
    );
    setGpsWatchActive(true);
    return () => navigator.geolocation.clearWatch(id);
  }, [gpsPosition, gpsWatchActive]);

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

  const handleLayerChange = useCallback((layers) => {
    setActiveLayers(layers);
  }, []);

  const handleMapReady = useCallback((map) => {
    setMapRef(map);
  }, []);

  const handleBookmarkRestore = useCallback((bm) => {
    if (mapRef) mapRef.flyTo([bm.lat, bm.lng], bm.zoom, { duration: 0.6 });
  }, [mapRef]);

  const handleAddToCompare = useCallback((store) => {
    setCompareStores((prev) => {
      if (prev.some((s) => s.store === store.store)) return prev;
      return [...prev, store].slice(0, 3);
    });
  }, []);

  const handleCloseCompare = useCallback(() => {
    setCompareStores([]);
  }, []);

  const handleAddAnnotation = useCallback((text) => {
    setAnnotations((prev) => [...prev, { text, timestamp: Date.now() }]);
  }, []);

  const handleRemoveAnnotation = useCallback((index) => {
    setAnnotations((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearAnnotations = useCallback(() => {
    setAnnotations([]);
  }, []);

  const handleBottomSheetCollapse = useCallback(() => {
    setSelectedStore(null);
  }, []);

  const handleStartPlanning = useCallback(function () {
    setAppScreen('setup');
  }, []);

  const handleLandingLocate = useCallback(function (pos) {
    setGpsPosition(pos);
    setAppScreen('setup');
  }, []);

  const handleSetupBack = useCallback(function () {
    setAppScreen('landing');
  }, []);

  const handleSetupGo = useCallback(function (config) {
    setSessionConfig(config);
    if (config.focusDistrict) {
      setActiveDistrict(config.focusDistrict);
    }
    if (config.startLocation) {
      setGpsPosition(config.startLocation);
    }
    setAppScreen('map');
  }, []);

  if (appScreen === 'landing') {
    return <LandingPage onStart={handleStartPlanning} onLocate={handleLandingLocate} />;
  }

  if (appScreen === 'setup') {
    return (
      <SetupScreen
        onBack={handleSetupBack}
        onGo={handleSetupGo}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <Brand compact />
        </div>
        <div className="header-right">
          <span className="header-badge">REGION 41</span>
          <span className="header-version">{APP_VERSION}</span>
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

      <div className="app-main">
        <div className="map-container">
          <MapView
            stores={filteredStores}
            selectedStore={selectedStore}
            onStoreSelect={handleStoreSelect}
            routeStores={routeStores}
            routeGeometry={routeGeometry}
            activeDistrict={districtView ? activeDistrict : null}
            districtMode={districtMode}
            gpsPosition={gpsPosition}
            theme={theme}
            showClouds={activeLayers.districts !== false}
            showCompetitors={activeLayers.competitors === true}
            viewedStores={viewedStores}
            onMapReady={handleMapReady}
          />
        </div>

        <FocusBanner config={sessionConfig} onEdit={function () { setAppScreen('setup'); }} />

        {/* Commute-aware start */}
        {gpsPosition && (
          <CommuteCard gpsPosition={gpsPosition} stores={stores} onStoreSelect={handleStoreSelect} />
        )}

        {/* GPS proximity auto-arrive */}
        {gpsPosition && routeStores.length > 0 && (
          <ProximityAlert
            gpsPosition={gpsPosition}
            routeStores={routeStores}
            stopStatuses={stopStatuses}
            onStopStatusChange={handleStopStatusChange}
          />
        )}

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
        <LayerPanel onLayerChange={handleLayerChange} />

        <BottomSheet
          forceOpen={selectedStore}
          onCollapse={handleBottomSheetCollapse}
        >
          {/* Filter pills */}
          <div className="bs-section">
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
              stores={stores}
              quickFilters={quickFilters}
            />
          </div>

          {/* Quick-filter chips */}
          <div className="bs-section">
            <QuickFilterChips
              stores={districtFilteredStores}
              activeChips={quickFilters}
              onToggleChip={handleQuickFilterToggle}
            />
          </div>

          {/* Search */}
          <div className="bs-section">
            <SearchBar
              stores={stores}
              onStoreSelect={handleStoreSelect}
              searchText={searchText}
              onSearchChange={handleSearchChange}
            />
          </div>

          {/* Map bookmarks */}
          <div className="bs-section">
            <MapBookmarks mapRef={mapRef} onRestore={handleBookmarkRestore} />
          </div>

          {/* Store card */}
          {selectedStore && (
            <div className="bs-section bs-store-card">
              <StoreCard
                store={selectedStore}
                onClose={handleCloseCard}
                onAddToRoute={handleAddToRoute}
                onRemoveFromRoute={handleRemoveFromRoute}
                isInRoute={routeStores.some((s) => s.store === selectedStore.store)}
                allStores={stores}
                activeDistrict={activeDistrict}
                districtMode={districtMode}
                routeStores={routeStores}
                onStoreSelect={handleStoreSelect}
                showWeekendFilter={quickFilters.includes('weekendHours')}
                onAddToCompare={handleAddToCompare}
                inline
              />
            </div>
          )}

          {/* Map annotations */}
          <div className="bs-section">
            <MapAnnotations
              annotations={annotations}
              onAdd={handleAddAnnotation}
              onRemove={handleRemoveAnnotation}
              onClear={handleClearAnnotations}
            />
          </div>

          {/* Route planner */}
          {routeStores.length > 0 && (
            <div className="bs-section bs-route">
              <RoutePlanner
                routeStores={routeStores}
                onRemoveFromRoute={handleRemoveFromRoute}
                onOptimizeRoute={handleOptimizeRoute}
                onClearRoute={handleClearRoute}
                onOpenInMaps={handleOpenInMaps}
                gpsPosition={gpsPosition}
                onRequestGps={handleRequestGps}
                routeStats={routeStats}
                sessionConfig={sessionConfig}
                districtMode={districtMode}
                onReorderRoute={handleReorderRoute}
                stopStatuses={stopStatuses}
                onStopStatusChange={handleStopStatusChange}
                inline
              />
              <RouteExport routeStores={routeStores} routeStats={routeStats} sessionConfig={sessionConfig} />
            </div>
          )}

          {/* Store comparison */}
          {compareStores.length >= 2 && (
            <div className="bs-section">
              <StoreComparison stores={compareStores} onClose={handleCloseCompare} onStoreSelect={handleStoreSelect} />
            </div>
          )}
        </BottomSheet>
      </div>

      <footer className="footer">
        <span className="footer-pill">&copy; 2026 Madden Frameworks</span>
      </footer>
    </div>
  );
}
