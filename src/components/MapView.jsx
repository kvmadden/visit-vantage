import React, { useEffect, useMemo, useCallback, memo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RX_COLORS, FS_COLORS } from '../utils/colors';

// Heart-shaped SVG icon for regular CVS stores
function createHeartIcon(color, size = 18, opacity = 0.9) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="${color}" fill-opacity="${opacity}" stroke="${darkenHexStr(color)}" stroke-width="1"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: 'cvs-heart-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Bullseye icon for Target stores (Target brand style)
function createBullseyeIcon(color, size = 18, opacity = 0.9) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="none" stroke="${color}" stroke-width="2.5" opacity="${opacity}"/>
    <circle cx="12" cy="12" r="5.5" fill="none" stroke="${color}" stroke-width="2.5" opacity="${opacity}"/>
    <circle cx="12" cy="12" r="2" fill="${color}" opacity="${opacity}"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: 'target-bullseye-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Standalone helper for SVG string context (no DOM access)
function darkenHexStr(hex, amount = 40) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const DEFAULT_CENTER = [27.85, -82.48];
const DEFAULT_ZOOM = 9;

const TILE_URL =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

const ROUTE_COLOR = '#4A9EFF';
const GPS_COLOR = '#22c55e';

// ---------------------------------------------------------------------------
// FlyToStore — reacts to selectedStore and activeDistrict changes
// ---------------------------------------------------------------------------
function FlyToStore({ selectedStore, activeDistrict, stores }) {
  const map = useMap();

  useEffect(() => {
    if (selectedStore) {
      map.flyTo([selectedStore.lat, selectedStore.lng], 14, {
        duration: 1,
      });
    }
  }, [selectedStore, map]);

  useEffect(() => {
    if (activeDistrict == null || !stores || stores.length === 0) return;

    const districtStores = stores.filter(
      (s) => s.rxDistrict === activeDistrict
    );
    if (districtStores.length === 0) return;

    const lats = districtStores.map((s) => s.lat);
    const lngs = districtStores.map((s) => s.lng);
    const bounds = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];

    map.fitBounds(bounds, { padding: [40, 40] });
  }, [activeDistrict, stores, map]);

  return null;
}

// ---------------------------------------------------------------------------
// Memoised store marker
// ---------------------------------------------------------------------------
const StoreMarker = memo(function StoreMarker({
  store,
  isSelected,
  isFaded,
  districtMode,
  onStoreSelect,
}) {
  const isTarget = store.target === true;
  const colorMap = districtMode === 'fs' ? FS_COLORS : RX_COLORS;
  const districtKey = districtMode === 'fs' ? store.fsDistrict : store.rxDistrict;
  const color = colorMap[districtKey] || '#888';

  const handleClick = useCallback(() => {
    onStoreSelect(store);
  }, [store, onStoreSelect]);

  const opacity = isFaded ? 0.2 : 0.9;
  const size = isSelected ? 24 : 18;

  const icon = isTarget
    ? createBullseyeIcon(isFaded ? '#52525b' : (RX_COLORS[store.rxDistrict] || '#ef4444'), size, opacity)
    : createHeartIcon(isFaded ? '#52525b' : color, size, opacity);

  return (
    <Marker
      position={[store.lat, store.lng]}
      icon={icon}
      eventHandlers={{ click: handleClick }}
    >
      <Tooltip direction="top" offset={[0, -10]}>
        {store.nickname} #{store.store}
      </Tooltip>
    </Marker>
  );
});

// ---------------------------------------------------------------------------
// GPS position marker
// ---------------------------------------------------------------------------
const GpsMarker = memo(function GpsMarker({ position }) {
  return (
    <CircleMarker
      center={[position.lat, position.lng]}
      radius={8}
      pathOptions={{
        fillColor: GPS_COLOR,
        fillOpacity: 0.9,
        color: GPS_COLOR,
        weight: 2,
      }}
      className="gps-pulse"
    >
      <Tooltip direction="top" offset={[0, -10]}>
        Your Location
      </Tooltip>
    </CircleMarker>
  );
});

// ---------------------------------------------------------------------------
// Route polyline
// ---------------------------------------------------------------------------
const RoutePolyline = memo(function RoutePolyline({ routeStores }) {
  if (!routeStores || routeStores.length === 0) return null;

  const positions = routeStores.map((s) => [s.lat, s.lng]);

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: ROUTE_COLOR,
        weight: 3,
        dashArray: '8, 6',
        opacity: 0.8,
      }}
    />
  );
});

// ---------------------------------------------------------------------------
// MapView
// ---------------------------------------------------------------------------
export default function MapView({
  stores = [],
  selectedStore = null,
  onStoreSelect,
  routeStores = [],
  activeDistrict = null,
  districtMode = 'rx',
  gpsPosition = null,
}) {
  const markers = useMemo(() => {
    return stores.map((store) => {
      const isSelected =
        selectedStore != null && selectedStore.store === store.store;
      const districtKey = districtMode === 'fs' ? store.fsDistrict : store.rxDistrict;
      const isFaded =
        activeDistrict != null && districtKey !== activeDistrict;

      return (
        <StoreMarker
          key={store.store}
          store={store}
          isSelected={isSelected}
          isFaded={isFaded}
          districtMode={districtMode}
          onStoreSelect={onStoreSelect}
        />
      );
    });
  }, [stores, selectedStore, activeDistrict, districtMode, onStoreSelect]);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      zoomControl={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />

      {markers}

      <RoutePolyline routeStores={routeStores} />

      {gpsPosition && <GpsMarker position={gpsPosition} />}

      <FlyToStore
        selectedStore={selectedStore}
        activeDistrict={activeDistrict}
        stores={stores}
      />
    </MapContainer>
  );
}
