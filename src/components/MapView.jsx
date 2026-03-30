import React, { useEffect, useMemo, useCallback, memo } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
  Polyline,
  Tooltip,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RX_COLORS, FS_COLORS } from '../utils/colors';

// X-shaped SVG icon for Target stores
function createXIcon(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <line x1="3" y1="3" x2="13" y2="13" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="13" y1="3" x2="3" y2="13" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: 'target-x-icon',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
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
// Helper: darken a hex color by a fixed amount
// ---------------------------------------------------------------------------
function darkenHex(hex, amount = 40) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

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

  const handleClick = useCallback(() => {
    onStoreSelect(store);
  }, [store, onStoreSelect]);

  // Target stores render as X markers
  if (isTarget) {
    const rxColor = RX_COLORS[store.rxDistrict] || '#71717a';
    const opacity = isFaded ? 0.15 : 1;
    const icon = createXIcon(isFaded ? '#52525b' : rxColor);

    return (
      <Marker
        position={[store.lat, store.lng]}
        icon={icon}
        opacity={opacity}
        eventHandlers={{ click: handleClick }}
      >
        <Tooltip direction="top" offset={[0, -8]}>
          {store.nickname} #{store.store}
        </Tooltip>
      </Marker>
    );
  }

  let radius = 7;
  let fillColor = colorMap[districtKey] || '#888';
  let strokeColor = darkenHex(fillColor);
  let fillOpacity = 0.9;

  if (isFaded) {
    fillOpacity = 0.15;
    radius = 5;
  }

  if (isSelected) {
    radius = 10;
    fillOpacity = 1;
  }

  return (
    <CircleMarker
      center={[store.lat, store.lng]}
      radius={radius}
      pathOptions={{
        fillColor,
        fillOpacity,
        color: strokeColor,
        weight: 2,
      }}
      className={isSelected ? 'marker-pulse' : undefined}
      eventHandlers={{ click: handleClick }}
    >
      <Tooltip direction="top" offset={[0, -8]}>
        {store.nickname} #{store.store}
      </Tooltip>
    </CircleMarker>
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
