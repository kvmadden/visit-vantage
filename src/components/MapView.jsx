import React, { useEffect, useMemo, useCallback, memo } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Tooltip,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { RX_COLORS } from '../utils/colors';

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
  onStoreSelect,
}) {
  const isTarget = store.target === true;

  let radius = isTarget ? 5 : 7;
  let fillColor = isTarget ? '#52525b' : RX_COLORS[store.rxDistrict] || '#888';
  let strokeColor = isTarget ? '#ef4444' : darkenHex(fillColor);
  let fillOpacity = 0.9;

  if (isFaded) {
    fillOpacity = 0.15;
    radius = 5;
  }

  if (isSelected) {
    radius = 10;
    fillOpacity = 1;
  }

  const handleClick = useCallback(() => {
    onStoreSelect(store);
  }, [store, onStoreSelect]);

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
  gpsPosition = null,
}) {
  const markers = useMemo(() => {
    return stores.map((store) => {
      const isSelected =
        selectedStore != null && selectedStore.store === store.store;
      const isFaded =
        activeDistrict != null && store.rxDistrict !== activeDistrict;

      return (
        <StoreMarker
          key={store.store}
          store={store}
          isSelected={isSelected}
          isFaded={isFaded}
          onStoreSelect={onStoreSelect}
        />
      );
    });
  }, [stores, selectedStore, activeDistrict, onStoreSelect]);

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
