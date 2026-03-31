import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import { RX_COLORS, FS_COLORS } from '../utils/colors';

// Standalone helper for SVG string context (no DOM access)
function darkenHexStr(hex, amount = 40) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// Heart SVG path for both individual markers and cluster icons
function heartSvg(color, size, opacity = 0.9, label = '') {
  const stroke = darkenHexStr(color);
  const textEl = label
    ? `<text x="16" y="18" text-anchor="middle" fill="#fff" font-family="IBM Plex Sans,sans-serif" font-weight="700" font-size="${label.length > 2 ? 9 : 11}" dominant-baseline="central">${label}</text>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
    <path d="M16 29 C16 29 2 20 2 11 C2 6 5.5 2 10 2 C12.5 2 14.8 3.5 16 5.5 C17.2 3.5 19.5 2 22 2 C26.5 2 30 6 30 11 C30 20 16 29 16 29Z"
      fill="${color}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="0.5"/>
    ${textEl}
  </svg>`;
}

function createHeartIcon(color, size = 18, opacity = 0.9) {
  return L.divIcon({
    html: heartSvg(color, size, opacity),
    className: 'cvs-heart-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Target bullseye — thick outer ring, white gap, filled inner circle
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
// ClusteredMarkers — one cluster group per district so colors never mix
// ---------------------------------------------------------------------------
function ClusteredMarkers({
  stores,
  selectedStore,
  activeDistrict,
  districtMode,
  zoom,
  onStoreSelect,
}) {
  const map = useMap();
  const clusterGroupsRef = useRef([]);

  useEffect(() => {
    if (!map) return;

    // Remove old cluster groups
    clusterGroupsRef.current.forEach((g) => map.removeLayer(g));
    clusterGroupsRef.current = [];

    // Group stores by district color
    const colorMap = districtMode === 'fs' ? FS_COLORS : RX_COLORS;
    const buckets = {};
    stores.forEach((store) => {
      const key = districtMode === 'fs' ? store.fsDistrict : store.rxDistrict;
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(store);
    });

    // Create one cluster group per district
    Object.entries(buckets).forEach(([districtKey, districtStores]) => {
      const districtColor = colorMap[districtKey] || '#888';

      const clusterGroup = L.markerClusterGroup({
        maxClusterRadius: (z) => (z <= 10 ? 80 : z <= 12 ? 50 : 30),
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          const size = count <= 3 ? 32 : count <= 10 ? 38 : count <= 25 ? 44 : 50;
          return L.divIcon({
            html: heartSvg(districtColor, size, 0.9, String(count)),
            className: 'cluster-heart-icon',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });
        },
        animate: true,
      });

      districtStores.forEach((store) => {
        const isTarget = store.target === true;
        const activeColor = isTarget
          ? (RX_COLORS[store.rxDistrict] || '#ef4444')
          : districtColor;

        const isSelected =
          selectedStore != null && selectedStore.store === store.store;
        const dk = districtMode === 'fs' ? store.fsDistrict : store.rxDistrict;
        const isFaded =
          activeDistrict != null && dk !== activeDistrict;
        const opacity = isFaded ? 0.2 : 0.9;
        const displayColor = isFaded ? '#52525b' : activeColor;

        const zoomScale = Math.max(0.75, 1 + (zoom - 13) * 0.25);
        const baseHeart = isSelected ? 22 : 16;
        const baseBullseye = isSelected ? 15 : 11;
        const heartSize = Math.max(12, Math.round(baseHeart * zoomScale));
        const bullseyeSize = Math.max(9, Math.round(baseBullseye * zoomScale));

        const icon = isTarget
          ? createBullseyeIcon(displayColor, bullseyeSize, opacity)
          : createHeartIcon(displayColor, heartSize, opacity);

        const marker = L.marker([store.lat, store.lng], { icon });

        marker.bindTooltip(`${store.nickname} #${store.store}`, {
          direction: 'top',
          offset: [0, -10],
        });

        marker.on('click', () => onStoreSelect(store));
        clusterGroup.addLayer(marker);
      });

      map.addLayer(clusterGroup);
      clusterGroupsRef.current.push(clusterGroup);
    });

    return () => {
      clusterGroupsRef.current.forEach((g) => map.removeLayer(g));
      clusterGroupsRef.current = [];
    };
  }, [map, stores, selectedStore, activeDistrict, districtMode, zoom, onStoreSelect]);

  return null;
}

// ---------------------------------------------------------------------------
// FitAllStores — on initial load, fit map to show all stores
// ---------------------------------------------------------------------------
function FitAllStores({ stores }) {
  const map = useMap();
  const hasFit = useRef(false);

  useEffect(() => {
    if (hasFit.current || !stores || stores.length === 0) return;
    hasFit.current = true;

    const lats = stores.map((s) => s.lat);
    const lngs = stores.map((s) => s.lng);
    const bounds = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ];
    map.fitBounds(bounds, { padding: [20, 20], animate: false });
  }, [stores, map]);

  return null;
}
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

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      zoomControl={false}
      zoomSnap={0.25}
      zoomDelta={0.5}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <ZoomTracker onZoomChange={handleZoomChange} />
      <FitAllStores stores={stores} />

      <ClusteredMarkers
        stores={stores}
        selectedStore={selectedStore}
        activeDistrict={activeDistrict}
        districtMode={districtMode}
        zoom={zoom}
        onStoreSelect={onStoreSelect}
      />

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
