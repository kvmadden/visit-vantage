import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
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

// CVS heart icon — the brand heart shape: soft rounded top lobes, pointed bottom
function createHeartIcon(color, size = 18, opacity = 0.9) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
    <path d="M16 29 C16 29 2 20 2 11 C2 6 5.5 2 10 2 C12.5 2 14.8 3.5 16 5.5 C17.2 3.5 19.5 2 22 2 C26.5 2 30 6 30 11 C30 20 16 29 16 29Z"
      fill="${color}" fill-opacity="${opacity}" stroke="${darkenHexStr(color)}" stroke-width="0.5"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: 'cvs-heart-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Target bullseye — thick outer ring, white gap, filled inner circle (brand proportions)
function createBullseyeIcon(color, size = 13, opacity = 0.9) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10.5" fill="${color}" opacity="${opacity}"/>
    <circle cx="12" cy="12" r="7.5" fill="#18181b" opacity="${opacity}"/>
    <circle cx="12" cy="12" r="4.5" fill="${color}" opacity="${opacity}"/>
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
const DOT_ZOOM = 12; // At or below this zoom, use small circle dots instead of branded icons

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
// ZoomTracker — updates zoom state on map zoom events
// ---------------------------------------------------------------------------
function ZoomTracker({ onZoomChange }) {
  const map = useMap();

  useEffect(() => {
    const handler = () => onZoomChange(map.getZoom());
    map.on('zoomend', handler);
    onZoomChange(map.getZoom());
    return () => map.off('zoomend', handler);
  }, [map, onZoomChange]);

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
  zoom,
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
  const activeColor = isTarget
    ? (RX_COLORS[store.rxDistrict] || '#ef4444')
    : color;
  const displayColor = isFaded ? '#52525b' : activeColor;

  // At low zoom, render lightweight canvas CircleMarkers instead of SVG divIcons
  if (zoom <= DOT_ZOOM) {
    const dotScale = zoom <= 9 ? 0 : (zoom - 9) * 1.5;
    const baseRadius = isTarget ? 3 : 4;
    const radius = isSelected ? 7 : baseRadius + dotScale;
    return (
      <CircleMarker
        center={[store.lat, store.lng]}
        radius={radius}
        pathOptions={{
          fillColor: displayColor,
          fillOpacity: opacity,
          color: isSelected ? '#ffffff' : darkenHexStr(displayColor),
          weight: isSelected ? 2 : 0.5,
        }}
        eventHandlers={{ click: handleClick }}
      >
        <Tooltip direction="top" offset={[0, -6]}>
          {store.nickname} #{store.store}
        </Tooltip>
      </CircleMarker>
    );
  }

  // At higher zoom, use branded heart/bullseye icons
  const zoomScale = 1 + (zoom - DOT_ZOOM - 1) * 0.3;
  const baseHeart = isSelected ? 22 : 16;
  const baseBullseye = isSelected ? 15 : 11;
  const heartSize = Math.round(baseHeart * zoomScale);
  const bullseyeSize = Math.round(baseBullseye * zoomScale);

  const icon = isTarget
    ? createBullseyeIcon(displayColor, bullseyeSize, opacity)
    : createHeartIcon(displayColor, heartSize, opacity);

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
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const handleZoomChange = useCallback((z) => setZoom(z), []);

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
          zoom={zoom}
          onStoreSelect={onStoreSelect}
        />
      );
    });
  }, [stores, selectedStore, activeDistrict, districtMode, zoom, onStoreSelect]);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      zoomControl={false}
      preferCanvas={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <ZoomTracker onZoomChange={handleZoomChange} />

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
