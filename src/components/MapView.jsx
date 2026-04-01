import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Circle,
  CircleMarker,
  Tooltip,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import { RX_COLORS, FS_COLORS } from '../utils/colors';
import rxDistrictGeoJSON from '../data/districts.json';
import fsDistrictGeoJSON from '../data/fs-districts.json';
import competitors from '../data/competitors.json';
import { LABEL_POSITIONS } from '../config/labelPositions';

// Standalone helper for SVG string context (no DOM access)
function darkenHexStr(hex, amount = 40) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// Heart SVG path for single-store markers
function heartSvg(color, size, opacity = 0.9) {
  const stroke = darkenHexStr(color);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
    <path d="M16 29 C16 29 2 20 2 11 C2 6 5.5 2 10 2 C12.5 2 14.8 3.5 16 5.5 C17.2 3.5 19.5 2 22 2 C26.5 2 30 6 30 11 C30 20 16 29 16 29Z"
      fill="${color}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="0.5"/>
  </svg>`;
}

// Cluster icon: rounded pill with mini heart + count  [♥ 17]
function clusterPillSvg(color, count = 2) {
  const stroke = darkenHexStr(color);
  const label = String(count);
  // Scale pill width based on digit count
  const textWidth = label.length > 2 ? 24 : label.length > 1 ? 18 : 12;
  const pillW = 20 + textWidth; // heart area + text area
  const pillH = 22;
  const r = pillH / 2; // fully rounded ends
  const fontSize = label.length > 2 ? 10 : 11;
  return {
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="${pillW}" height="${pillH}" viewBox="0 0 ${pillW} ${pillH}">
      <rect x="0.5" y="0.5" width="${pillW - 1}" height="${pillH - 1}" rx="${r}" ry="${r}"
        fill="${color}" stroke="${stroke}" stroke-width="0.8"/>
      <path d="M10 16.5 C10 16.5 3.5 12.5 3.5 8.5 C3.5 6.2 5 4.5 7 4.5 C8.2 4.5 9.3 5.2 10 6.2 C10.7 5.2 11.8 4.5 13 4.5 C15 4.5 16.5 6.2 16.5 8.5 C16.5 12.5 10 16.5 10 16.5Z"
        fill="#fff" fill-opacity="0.95"/>
      <text x="${20 + textWidth / 2}" y="${pillH / 2 + 0.5}" text-anchor="middle" fill="#fff" font-family="IBM Plex Sans,sans-serif" font-weight="700" font-size="${fontSize}" dominant-baseline="central">${label}</text>
    </svg>`,
    width: pillW,
    height: pillH,
  };
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
function createBullseyeIcon(color, size = 13, opacity = 0.9, bullseyeInner = '#ffffff') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10.5" fill="${color}" opacity="${opacity}"/>
    <circle cx="12" cy="12" r="7.5" fill="${bullseyeInner}" opacity="${opacity}"/>
    <circle cx="12" cy="12" r="4.5" fill="${color}" opacity="${opacity}"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: 'target-bullseye-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// y más rounded pill — heart + "y más" text badge
function createYmasPillIcon(color, size = 18, opacity = 0.9) {
  const stroke = darkenHexStr(color);
  const pillW = size + 28;
  const pillH = size;
  const r = pillH / 2;
  const heartScale = size / 32;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pillW}" height="${pillH}" viewBox="0 0 ${pillW} ${pillH}">
    <rect x="0.5" y="0.5" width="${pillW - 1}" height="${pillH - 1}" rx="${r}" ry="${r}"
      fill="${color}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="0.5"/>
    <g transform="translate(${pillH * 0.15}, ${pillH * 0.1}) scale(${heartScale * 0.8})">
      <path d="M16 29 C16 29 2 20 2 11 C2 6 5.5 2 10 2 C12.5 2 14.8 3.5 16 5.5 C17.2 3.5 19.5 2 22 2 C26.5 2 30 6 30 11 C30 20 16 29 16 29Z"
        fill="#fff" fill-opacity="0.95"/>
    </g>
    <text x="${pillH * 0.5 + 16}" y="${pillH / 2 + 0.5}" text-anchor="start" fill="#fff" font-family="IBM Plex Sans,sans-serif" font-weight="700" font-size="${Math.max(8, pillH * 0.45)}" dominant-baseline="central">y más</text>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: 'ymas-pill-icon',
    iconSize: [pillW, pillH],
    iconAnchor: [pillW / 2, pillH / 2],
  });
}

// Icon cache — avoids recreating identical L.divIcon instances
const _iconCache = new Map();
function cachedDivIcon(key, createFn) {
  if (_iconCache.has(key)) return _iconCache.get(key);
  const icon = createFn();
  _iconCache.set(key, icon);
  // Limit cache size
  if (_iconCache.size > 2000) {
    const first = _iconCache.keys().next().value;
    _iconCache.delete(first);
  }
  return icon;
}

const DEFAULT_CENTER = [27.50, -82.44];
const DEFAULT_ZOOM = 8.5;
const MIN_ZOOM = 8.5;
const MAX_ZOOM = 18;
// Bounding box — loose enough to not constrain zoom, tight enough to prevent panning to Africa
const MAX_BOUNDS = [
  [26.0, -83.5], // SW corner
  [29.0, -81.3], // NE corner
];

const TILE_BASE = {
  light: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
};
const TILE_LABELS = {
  light: 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png',
};
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

const ROUTE_COLOR = '#D4A04A';

// Tampa Bay area cities/places with min zoom at which they appear
// tier 1 = major cities (always visible), tier 2 = medium (z>=10), tier 3 = neighborhoods (z>=11)
const CITY_LABELS = [
  // Tier 1 — major cities (always try to show, will reposition to avoid collisions)
  // Positioned so the middle of the name sits on land (extending into water is fine)
  { name: 'TAMPA', lat: 27.99, lng: -82.53, tier: 1 },
  { name: 'ST. PETERSBURG', lat: 27.7676, lng: -82.79, tier: 1 },
  { name: 'CLEARWATER', lat: 27.9659, lng: -82.88, tier: 1 },
  { name: 'SARASOTA', lat: 27.3364, lng: -82.58, tier: 1 },
  { name: 'BRADENTON', lat: 27.52, lng: -82.63, tier: 1 },
  // Tier 2 — medium cities
  { name: 'Wesley Chapel', lat: 28.2397, lng: -82.3271, tier: 2 },
  { name: 'Brandon', lat: 27.9378, lng: -82.2859, tier: 2 },
  { name: 'Largo', lat: 27.9095, lng: -82.7873, tier: 2 },
  { name: 'Palm Harbor', lat: 28.0836, lng: -82.7637, tier: 2 },
  { name: 'Dunedin', lat: 28.0197, lng: -82.7718, tier: 2 },
  { name: 'Spring Hill', lat: 28.4767, lng: -82.5276, tier: 2 },
  { name: 'Riverview', lat: 27.8661, lng: -82.3265, tier: 2 },
  { name: 'New Port Richey', lat: 28.2442, lng: -82.7193, tier: 2 },
  { name: 'Venice', lat: 27.0998, lng: -82.4543, tier: 2 },
  { name: 'Punta Gorda', lat: 26.9298, lng: -82.0454, tier: 2 },
  { name: 'Englewood', lat: 26.9620, lng: -82.3526, tier: 2 },
  // Tier 3 — neighborhoods/smaller places
  { name: 'Temple Terrace', lat: 28.0353, lng: -82.3893, tier: 3 },
  { name: 'Town \'n\' Country', lat: 28.0106, lng: -82.5762, tier: 3 },
  { name: 'Pinellas Park', lat: 27.8428, lng: -82.6993, tier: 3 },
  { name: 'Oldsmar', lat: 28.0342, lng: -82.6651, tier: 3 },
  { name: 'Safety Harbor', lat: 28.0058, lng: -82.6929, tier: 3 },
  { name: 'Lutz', lat: 28.1511, lng: -82.4615, tier: 3 },
  { name: 'Bloomingdale', lat: 27.8936, lng: -82.2448, tier: 3 },
  { name: 'Ruskin', lat: 27.7209, lng: -82.4331, tier: 3 },
  { name: 'Apollo Beach', lat: 27.7731, lng: -82.4072, tier: 3 },
  { name: 'Sun City Center', lat: 27.7181, lng: -82.3529, tier: 3 },
  { name: 'Holiday', lat: 28.1875, lng: -82.7393, tier: 3 },
  { name: 'Hudson', lat: 28.3644, lng: -82.6932, tier: 3 },
  { name: 'Bayonet Point', lat: 28.3278, lng: -82.6835, tier: 3 },
  { name: 'Brooksville', lat: 28.5553, lng: -82.3879, tier: 3 },
  { name: 'Dade City', lat: 28.3647, lng: -82.1962, tier: 3 },
  { name: 'Zephyrhills', lat: 28.2336, lng: -82.1812, tier: 3 },
  { name: 'Gulfport', lat: 27.7481, lng: -82.7084, tier: 3 },
  { name: 'Madeira Beach', lat: 27.7981, lng: -82.7973, tier: 3 },
  { name: 'Seminole', lat: 27.8400, lng: -82.7901, tier: 3 },
  { name: 'Valrico', lat: 27.9370, lng: -82.2365, tier: 3 },
  { name: 'Plant City', lat: 28.0186, lng: -82.1193, tier: 3 },
  { name: 'Gibsonton', lat: 27.8345, lng: -82.3810, tier: 3 },
  { name: 'Palmetto', lat: 27.5214, lng: -82.5721, tier: 3 },
  { name: 'Ellenton', lat: 27.5225, lng: -82.5276, tier: 3 },
  { name: 'Northdale', lat: 28.1058, lng: -82.5262, tier: 3 },
  { name: 'Citrus Park', lat: 28.0789, lng: -82.5790, tier: 3 },
  { name: 'Lake Magdalene', lat: 28.0767, lng: -82.4678, tier: 3 },
  { name: 'Keystone', lat: 28.1553, lng: -82.6215, tier: 3 },
  { name: 'Odessa', lat: 28.1839, lng: -82.5936, tier: 3 },
  { name: 'Westchase', lat: 28.0600, lng: -82.6100, tier: 3 },
  { name: 'Carrollwood', lat: 28.0578, lng: -82.5101, tier: 3 },
  { name: 'Clair-Mel City', lat: 27.8942, lng: -82.3570, tier: 3 },
  { name: 'Progress Village', lat: 27.8978, lng: -82.3553, tier: 3 },
  { name: 'Mango', lat: 27.9828, lng: -82.3062, tier: 3 },
  { name: 'Seffner', lat: 27.9925, lng: -82.2726, tier: 3 },
  { name: 'Dover', lat: 27.9939, lng: -82.2193, tier: 3 },
  { name: 'Thonotosassa', lat: 28.0600, lng: -82.2900, tier: 3 },
  { name: 'East Lake', lat: 28.1100, lng: -82.6914, tier: 3 },
  { name: 'Trinity', lat: 28.1808, lng: -82.6725, tier: 3 },
  { name: 'Land O\' Lakes', lat: 28.2186, lng: -82.4568, tier: 3 },
  { name: 'Starkey Ranch', lat: 28.2050, lng: -82.5930, tier: 3 },
  { name: 'Pebble Creek', lat: 28.1500, lng: -82.3450, tier: 3 },
  { name: 'Cheval', lat: 28.1550, lng: -82.5200, tier: 3 },
  { name: 'Lealman', lat: 27.8196, lng: -82.6792, tier: 3 },
  { name: 'Kenneth City', lat: 27.8153, lng: -82.7220, tier: 3 },
  { name: 'Treasure Island', lat: 27.7681, lng: -82.7707, tier: 3 },
  { name: 'Indian Rocks Beach', lat: 27.8910, lng: -82.8520, tier: 3 },
  { name: 'Belleair', lat: 27.9350, lng: -82.8087, tier: 3 },
  { name: 'Tarpon Springs', lat: 28.1461, lng: -82.7568, tier: 3 },
  { name: 'Port Richey', lat: 28.2717, lng: -82.7196, tier: 3 },
  { name: 'Siesta Key', lat: 27.2676, lng: -82.5460, tier: 3 },
  { name: 'Osprey', lat: 27.1990, lng: -82.4922, tier: 3 },
  { name: 'Nokomis', lat: 27.1197, lng: -82.4434, tier: 3 },
  { name: 'North Port', lat: 27.0443, lng: -82.2359, tier: 3 },
  { name: 'Lakewood Ranch', lat: 27.4041, lng: -82.4046, tier: 3 },
  { name: 'Parrish', lat: 27.5812, lng: -82.3571, tier: 3 },
  { name: 'Sun City', lat: 27.6778, lng: -82.4590, tier: 3 },
  { name: 'Wimauma', lat: 27.7119, lng: -82.3007, tier: 3 },
  { name: 'Bartow', lat: 27.8964, lng: -81.8431, tier: 3 },
  { name: 'Winter Haven', lat: 28.0222, lng: -81.7329, tier: 3 },
  { name: 'Haines City', lat: 28.1142, lng: -81.6178, tier: 3 },
  { name: 'Arcadia', lat: 27.2156, lng: -81.8587, tier: 3 },
  { name: 'Wauchula', lat: 27.5478, lng: -81.8112, tier: 3 },
  { name: 'Sebring', lat: 27.4956, lng: -81.4409, tier: 3 },
  { name: 'Lake Wales', lat: 27.9014, lng: -81.5856, tier: 3 },
];

// ---------------------------------------------------------------------------
// CityLabels — hardcoded positions, no collision detection
// Tier 1 uses config positions, tier 2/3 use geographic positions
// Visibility toggled by zoom tier only
// ---------------------------------------------------------------------------
function CityLabels({ zoom, theme }) {
  const map = useMap();
  const groupRef = useRef(null);
  const markersRef = useRef([]);

  // Create all markers once
  useEffect(() => {
    if (!map) return;

    if (groupRef.current) {
      map.removeLayer(groupRef.current);
      groupRef.current = null;
      markersRef.current = [];
    }

    const group = L.layerGroup();
    const markers = [];
    const textColor = theme === 'dark' ? '#d4d4d8' : '#52525b';
    const haloColor = theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)';

    CITY_LABELS.forEach((city) => {
      // Tier 1: use hardcoded config position. Tier 2/3: use geographic position.
      const configPos = LABEL_POSITIONS.cities[city.name];
      const lat = configPos ? configPos.lat : city.lat;
      const lng = configPos ? configPos.lng : city.lng;

      const isMajor = city.tier === 1;
      const fontSize = isMajor ? 13 : 11;
      const fontWeight = isMajor ? 700 : 500;
      const textTransform = isMajor ? 'uppercase' : 'none';
      const letterSpacing = isMajor ? '1px' : '0.3px';

      const icon = L.divIcon({
        html: `<div class="city-label-custom" data-tier="${city.tier}" style="font-family:IBM Plex Sans,sans-serif;font-weight:${fontWeight};font-size:${fontSize}px;color:${textColor};text-transform:${textTransform};letter-spacing:${letterSpacing};white-space:nowrap;pointer-events:none;opacity:0;transition:opacity 0.3s;text-shadow:-1px 0 2px ${haloColor},1px 0 2px ${haloColor},0 -1px 2px ${haloColor},0 1px 2px ${haloColor}">${city.name}</div>`,
        className: 'city-label-icon',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([lat, lng], { icon, interactive: false, zIndexOffset: 10000 });
      group.addLayer(marker);
      markers.push({ marker, city });
    });

    group.addTo(map);
    groupRef.current = group;
    markersRef.current = markers;

    return () => {
      if (groupRef.current) {
        map.removeLayer(groupRef.current);
        groupRef.current = null;
        markersRef.current = [];
      }
    };
  }, [map, theme]);

  // Toggle visibility by zoom tier — no collision detection, no delays
  useEffect(() => {
    if (!map || markersRef.current.length === 0) return;

    function updateVisibility() {
      const currentZoom = map.getZoom();
      // Custom labels hidden at z11+ where CARTO label tiles take over
      const minTier = currentZoom >= 12 ? 3 : currentZoom >= 10 ? 2 : 1;
      let cityOpacity;
      if (currentZoom < 10.5) {
        cityOpacity = 0.9;
      } else if (currentZoom < 11) {
        // Quick fade out between z10.5 and z11, before CARTO tiles appear
        cityOpacity = 0.9 * ((11 - currentZoom) / 0.5);
      } else {
        cityOpacity = 0;
      }

      markersRef.current.forEach(({ marker, city }) => {
        const el = marker._icon?.querySelector('.city-label-custom');
        if (!el) return;
        if (city.tier > minTier || cityOpacity <= 0) {
          el.style.opacity = '0';
        } else {
          el.style.opacity = String(cityOpacity.toFixed(2));
        }
      });
    }

    updateVisibility();
    map.on('zoomend', updateVisibility);
    map.on('zoom', updateVisibility);
    return () => { map.off('zoomend', updateVisibility); map.off('zoom', updateVisibility); };
  }, [map, zoom]);

  return null;
}
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
    if (selectedStore) return; // store flyTo takes priority
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
// ViewTracker — shows zoom + center in bottom-left corner
// ---------------------------------------------------------------------------
function ViewTracker() {
  const map = useMap();
  const [info, setInfo] = useState({ zoom: 0, lat: 0, lng: 0 });

  useEffect(() => {
    const update = () => {
      const c = map.getCenter();
      setInfo({ zoom: map.getZoom(), lat: c.lat, lng: c.lng });
    };
    map.on('zoomend', update);
    map.on('moveend', update);
    update();
    return () => {
      map.off('zoomend', update);
      map.off('moveend', update);
    };
  }, [map]);

  return (
    <div style={{
      position: 'absolute',
      top: 8,
      left: 8,
      background: 'rgba(0,0,0,0.6)',
      color: '#fff',
      fontSize: 10,
      fontFamily: 'monospace',
      padding: '3px 6px',
      borderRadius: 4,
      zIndex: 1000,
      pointerEvents: 'none',
    }}>
      z{info.zoom.toFixed(2)} | {info.lat.toFixed(4)}, {info.lng.toFixed(4)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ClusteredMarkers — hardcoded pills at zoom <= 10, markerCluster at zoom > 10
// No nudge logic, no collision detection, no timing chains
// ---------------------------------------------------------------------------
function ClusteredMarkers({
  stores,
  selectedStore,
  activeDistrict,
  districtMode,
  zoom,
  onStoreSelect,
  theme,
  viewedStores,
}) {
  const map = useMap();
  const layerRef = useRef([]);   // cluster groups or manual pill markers

  // Derive render mode from zoom — only recreate layers when mode changes
  const renderMode = zoom < 9 ? 'pills' : zoom >= 13 ? 'individual' : 'cluster';

  useEffect(() => {
    if (!map) return;

    // Clean up previous layers
    layerRef.current.forEach((g) => map.removeLayer(g));
    layerRef.current = [];

    const colorMap = districtMode === 'fs' ? FS_COLORS : RX_COLORS;
    const buckets = {};
    stores.forEach((store) => {
      const key = districtMode === 'fs' ? store.fsDistrict : store.rxDistrict;
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(store);
    });

    const currentZoom = map.getZoom();

    if (currentZoom < 9) {
      // ---- HARDCODED PILLS at max zoom-out (8.5) ----
      // One or two pills per district depending on config
      Object.entries(buckets).forEach(([dk, districtStores]) => {
        const posConfig = LABEL_POSITIONS.pills[dk];
        if (!posConfig) return;

        const districtColor = colorMap[dk] || '#888';
        const isActive = activeDistrict == null || activeDistrict == dk;
        const positions = Array.isArray(posConfig) ? posConfig : [posConfig];

        // For split districts, divide stores geographically by latitude median
        let subGroups;
        if (positions.length > 1) {
          const sorted = [...districtStores].sort((a, b) => b.lat - a.lat);
          const mid = Math.ceil(sorted.length / 2);
          subGroups = [sorted.slice(0, mid), sorted.slice(mid)];
        } else {
          subGroups = [districtStores];
        }

        positions.forEach((pos, idx) => {
          const groupStores = subGroups[idx] || subGroups[0];
          const count = groupStores.length;
          const pill = clusterPillSvg(districtColor, count);

          const icon = L.divIcon({
            html: pill.html,
            className: 'cluster-pill-icon',
            iconSize: [pill.width, pill.height],
            iconAnchor: [pill.width / 2, pill.height / 2],
          });

          const marker = L.marker([pos.lat, pos.lng], {
            icon,
            opacity: isActive ? 1 : 0.3,
          });

          // Click to zoom into the sub-group's bounds
          marker.on('click', () => {
            const lats = groupStores.map((s) => s.lat);
            const lngs = groupStores.map((s) => s.lng);
            map.fitBounds(
              [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]],
              { padding: [40, 40] }
            );
          });

          marker.bindTooltip(`District ${dk}: ${count} stores`, {
            direction: 'top',
            offset: [0, -12],
          });

          marker.addTo(map);
          layerRef.current.push(marker);
        });
      });
    } else {
      // Helper to build a marker icon for a single store (with caching)
      const buildStoreIcon = (store, districtColor) => {
        const isTarget = store.target === true;
        const isYmas = store.ymas === 'Yes';
        const activeColor = isTarget
          ? (RX_COLORS[store.rxDistrict] || '#ef4444')
          : districtColor;

        const dk = districtMode === 'fs' ? store.fsDistrict : store.rxDistrict;
        const isFaded = activeDistrict != null && dk !== activeDistrict;
        const opacity = isFaded ? 0.2 : 0.9;
        const displayColor = isFaded ? (theme === 'dark' ? '#a1a1aa' : '#71717a') : activeColor;
        const isSelected = selectedStore != null && selectedStore.store === store.store;

        const zoomScale = Math.max(0.75, 1 + (currentZoom - 13) * 0.25);
        const heartSize = Math.max(20, Math.round((isSelected ? 22 : 16) * zoomScale));
        const bullseyeSize = Math.max(16, Math.round((isSelected ? 15 : 11) * zoomScale));
        const ymasSize = Math.max(18, Math.round((isSelected ? 20 : 16) * zoomScale));

        const bullseyeInner = theme === 'dark' ? '#18181b' : '#ffffff';
        const isViewed = viewedStores && viewedStores.has(store.store);

        // Build a cache key from all visual parameters
        const type = isTarget ? 'T' : isYmas ? 'Y' : 'H';
        const size = isTarget ? bullseyeSize : isYmas ? ymasSize : heartSize;
        const cacheKey = `${type}:${displayColor}:${size}:${opacity}:${isViewed && !isFaded ? 'v' : ''}:${bullseyeInner}`;

        return cachedDivIcon(cacheKey, () => {
          let baseSvg;
          if (isTarget) {
            baseSvg = createBullseyeIcon(displayColor, bullseyeSize, opacity, bullseyeInner);
          } else if (isYmas) {
            baseSvg = createYmasPillIcon(displayColor, ymasSize, opacity);
          } else {
            baseSvg = createHeartIcon(displayColor, heartSize, opacity);
          }

          if (isViewed && !isFaded) {
            const sz = isTarget ? bullseyeSize : isYmas ? ymasSize : heartSize;
            const w = isYmas ? sz + 28 : sz;
            const dotHtml = `<div style="position:relative;width:${w}px;height:${sz}px">${baseSvg.options.html}<svg style="position:absolute;top:-2px;right:-2px" width="7" height="7" viewBox="0 0 7 7"><circle cx="3.5" cy="3.5" r="3.5" fill="#22c55e"/><path d="M2 3.5L3 4.5L5 2.5" stroke="#fff" stroke-width="0.8" fill="none"/></svg></div>`;
            return L.divIcon({
              html: dotHtml,
              className: baseSvg.options.className,
              iconSize: [w, sz],
              iconAnchor: [w / 2, sz / 2],
            });
          }
          return baseSvg;
        });
      };

      // Identify outlier stores: nearest same-district neighbor > threshold
      // Tighter at low zoom (cluster more), relaxed at higher zoom (show barrier island stores)
      const outlierMinDist = currentZoom <= 10 ? 0.12 : currentZoom <= 11 ? 0.08 : 0.04;
      function isOutlier(store, districtStores) {
        let minDist = Infinity;
        for (let i = 0; i < districtStores.length; i++) {
          const other = districtStores[i];
          if (other.store === store.store) continue;
          const d = Math.sqrt((store.lat - other.lat) ** 2 + (store.lng - other.lng) ** 2);
          if (d < minDist) minDist = d;
          if (minDist <= outlierMinDist) return false; // early exit
        }
        return minDist > outlierMinDist;
      }

      if (currentZoom >= 13) {
        // ---- INDIVIDUAL MARKERS at high zoom (no clustering needed) ----
        const group = L.layerGroup();
        Object.entries(buckets).forEach(([districtKey, districtStores]) => {
          const districtColor = colorMap[districtKey] || '#888';
          districtStores.forEach((store) => {
            const icon = buildStoreIcon(store, districtColor);
            const marker = L.marker([store.lat, store.lng], { icon });
            marker.bindTooltip(`${store.nickname} #${store.store}`, {
              direction: 'top',
              offset: [0, -10],
            });
            marker.on('click', () => onStoreSelect(store));
            group.addLayer(marker);
          });
        });
        group.addTo(map);
        layerRef.current.push(group);
      } else {
        // ---- MARKER CLUSTER + outlier individual markers ----
        const outlierGroup = L.layerGroup();

        Object.entries(buckets).forEach(([districtKey, districtStores]) => {
          const districtColor = colorMap[districtKey] || '#888';

          // Split into clustered vs outlier stores
          const clustered = [];
          const outliers = [];
          districtStores.forEach((store) => {
            if (isOutlier(store, districtStores)) {
              outliers.push(store);
            } else {
              clustered.push(store);
            }
          });

          // Add outliers as individual markers (bypass cluster)
          outliers.forEach((store) => {
            const icon = buildStoreIcon(store, districtColor);
            const marker = L.marker([store.lat, store.lng], { icon });
            marker.bindTooltip(`${store.nickname} #${store.store}`, {
              direction: 'top',
              offset: [0, -10],
            });
            marker.on('click', () => onStoreSelect(store));
            outlierGroup.addLayer(marker);
          });

          // Add clustered stores to markerClusterGroup
          const clusterGroup = L.markerClusterGroup({
            maxClusterRadius: (z) => (z <= 10 ? 45 : z <= 12 ? 30 : 20),
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            removeOutsideVisibleBounds: false,
            iconCreateFunction: (cluster) => {
              const count = cluster.getChildCount();
              const pill = clusterPillSvg(districtColor, count);
              return L.divIcon({
                html: pill.html,
                className: 'cluster-pill-icon',
                iconSize: [pill.width, pill.height],
                iconAnchor: [pill.width / 2, pill.height / 2],
              });
            },
            animate: true,
          });

          clustered.forEach((store) => {
            const icon = buildStoreIcon(store, districtColor);
            const marker = L.marker([store.lat, store.lng], { icon });
            marker.bindTooltip(`${store.nickname} #${store.store}`, {

              direction: 'top',
              offset: [0, -10],
            });
            marker.on('click', () => onStoreSelect(store));
            clusterGroup.addLayer(marker);
          });

          map.addLayer(clusterGroup);
          layerRef.current.push(clusterGroup);
        });

        outlierGroup.addTo(map);
        layerRef.current.push(outlierGroup);
      }
    }

    return () => {
      layerRef.current.forEach((g) => map.removeLayer(g));
      layerRef.current = [];
    };
  }, [map, stores, selectedStore, activeDistrict, districtMode, renderMode, onStoreSelect, theme, viewedStores]);

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
const RoutePolyline = memo(function RoutePolyline({ routeStores, routeGeometry }) {
  if (!routeStores || routeStores.length === 0) return null;

  // Use OSRM road geometry if available, otherwise straight lines
  const positions = routeGeometry || routeStores.map((s) => [s.lat, s.lng]);

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: ROUTE_COLOR,
        weight: 3,
        dashArray: routeGeometry ? undefined : '8, 6',
        opacity: 0.8,
      }}
    />
  );
});

// ---------------------------------------------------------------------------
// HomeControl — reset map to full Region 41 view
// ---------------------------------------------------------------------------
function HomeControl({ stores }) {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: 'topright' });
    control.onAdd = () => {
      const btn = L.DomUtil.create('div', 'leaflet-bar leaflet-control home-control');
      btn.innerHTML = `<a href="#" title="Region 41 Home" role="button" aria-label="Reset to Region 41 view" style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;background:var(--bg-surface);color:var(--text-primary);text-decoration:none;font-size:16px;border-radius:4px">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </a>`;
      L.DomEvent.disableClickPropagation(btn);
      const anchor = btn.querySelector('a');
      const handleClick = (e) => {
        e.preventDefault();
        if (!stores || stores.length === 0) return;
        const lats = stores.map((s) => s.lat);
        const lngs = stores.map((s) => s.lng);
        map.fitBounds(
          [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]],
          { padding: [20, 20] }
        );
      };
      anchor.addEventListener('click', handleClick);
      btn._handleClick = handleClick;
      btn._anchor = anchor;
      return btn;
    };
    control.addTo(map);
    return () => {
      const container = control.getContainer();
      if (container?._anchor && container?._handleClick) {
        container._anchor.removeEventListener('click', container._handleClick);
      }
      control.remove();
    };
  }, [map, stores]);

  return null;
}

// ---------------------------------------------------------------------------
// DistrictClouds — colored territory overlays + hardcoded district labels
// No algorithmic placement — positions come from labelPositions config
// ---------------------------------------------------------------------------
function DistrictClouds({ zoom, activeDistrict, showClouds, districtMode, theme }) {
  const map = useMap();
  const layerRef = useRef(null);
  const labelsRef = useRef([]);

  // Create the GeoJSON layer once per districtMode/theme change
  useEffect(() => {
    if (!map || !showClouds) {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
        labelsRef.current = [];
      }
      return;
    }

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    const geoData = districtMode === 'fs' ? fsDistrictGeoJSON : rxDistrictGeoJSON;
    const haloColor = theme === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.85)';
    const haloBlur = theme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.6)';

    const layer = L.geoJSON(geoData, {
      style: () => ({
        fillOpacity: 0,
        opacity: 0,
        weight: 1,
      }),
    });

    layer.addTo(map);
    layerRef.current = layer;

    // Create district labels
    const labels = [];
    (geoData.features || []).forEach((feature) => {
      const d = feature.properties.district;
      const pos = LABEL_POSITIONS.districts[d];
      if (!pos) return;

      const icon = L.divIcon({
        html: `<div class="district-label-text" style="font-family:IBM Plex Sans,sans-serif;font-weight:800;font-size:16px;color:${feature.properties.color};opacity:0;transition:opacity 0.3s ease;text-shadow:-1px -1px 2px ${haloColor},1px -1px 2px ${haloColor},-1px 1px 2px ${haloColor},1px 1px 2px ${haloColor},0 0 8px ${haloBlur};white-space:nowrap;pointer-events:none;letter-spacing:0.5px">${feature.properties.label}</div>`,
        className: 'district-label-icon',
        iconSize: [60, 24],
        iconAnchor: [30, 12],
      });
      const marker = L.marker([pos.lat, pos.lng], { icon, interactive: false });
      marker.addTo(layer);
      labels.push({ marker, district: d });
    });
    labelsRef.current = labels;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
        labelsRef.current = [];
      }
    };
  }, [map, showClouds, districtMode, theme]);

  // Update styles on zoom/activeDistrict changes (no layer recreation)
  useEffect(() => {
    if (!layerRef.current) return;

    const baseOpacity = zoom <= 9 ? 0.18 : zoom >= 13 ? 0 : 0.18 * (13 - zoom) / 4;
    const labelOpacity = zoom <= 9 ? 0.9 : zoom >= 12 ? 0 : 0.9 * (12 - zoom) / 3;

    // Update polygon styles in place
    layerRef.current.eachLayer((l) => {
      if (l.feature) {
        const d = l.feature.properties.district;
        const isActive = activeDistrict == null || activeDistrict === d;
        l.setStyle({
          fillColor: l.feature.properties.color,
          fillOpacity: isActive ? baseOpacity : baseOpacity * 0.2,
          color: l.feature.properties.color,
          weight: isActive ? 1.5 : 0.5,
          opacity: isActive ? 0.4 : 0.1,
        });
      }
    });

    // Update label opacity
    labelsRef.current.forEach(({ marker, district }) => {
      const isActive = activeDistrict == null || activeDistrict === district;
      const el = marker._icon?.querySelector('.district-label-text');
      if (el) {
        el.style.opacity = isActive ? String(labelOpacity) : '0';
      }
    });
  }, [zoom, activeDistrict, districtMode]);

  return null;
}

// ---------------------------------------------------------------------------
// CompetitorMarkers — optional overlay of Walgreens, Walmart, Publix
// ---------------------------------------------------------------------------
const COMPETITOR_COLORS = {
  Walgreens: '#1a6f3f',
  Walmart: '#0071ce',
  Publix: '#3d8b37',
};

function CompetitorMarkers({ showCompetitors }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (!showCompetitors) return;

    const group = L.layerGroup();

    competitors.forEach((c) => {
      const color = COMPETITOR_COLORS[c.brand] || '#888';
      const size = 8;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 16 16">
        <rect x="1" y="1" width="14" height="14" rx="2" fill="${color}" opacity="0.7" stroke="${color}" stroke-width="0.5"/>
        <text x="8" y="11" text-anchor="middle" fill="#fff" font-size="8" font-weight="700" font-family="sans-serif">${c.brand[0]}</text>
      </svg>`;
      const icon = L.divIcon({
        html: svg,
        className: 'competitor-icon',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([c.lat, c.lng], { icon, interactive: true });
      marker.bindTooltip(`${c.brand} — ${c.address}`, { direction: 'top', offset: [0, -6] });
      group.addLayer(marker);
    });

    group.addTo(map);
    layerRef.current = group;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, showCompetitors]);

  return null;
}

// ---------------------------------------------------------------------------
// MapView
// ---------------------------------------------------------------------------
function MapRefExporter({ onMapReady }) {
  const map = useMap();
  useEffect(() => {
    if (onMapReady) onMapReady(map);
  }, [map, onMapReady]);
  return null;
}

export default function MapView({
  stores = [],
  selectedStore = null,
  onStoreSelect,
  routeStores = [],
  routeGeometry = null,
  activeDistrict = null,
  districtMode = 'rx',
  gpsPosition = null,
  theme = 'light',
  showClouds = true,
  showCompetitors = false,
  viewedStores = new Set(),
  onMapReady = null,
}) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const handleZoomChange = useCallback((z) => setZoom(z), []);

  const baseUrl = TILE_BASE[theme] || TILE_BASE.light;

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      zoomControl={false}
      zoomSnap={0.25}
      zoomDelta={0.5}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      maxBounds={MAX_BOUNDS}
      maxBoundsViscosity={1.0}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer key={`base-${theme}`} url={baseUrl} attribution={TILE_ATTRIBUTION} />
      {zoom >= 11 && <TileLayer key={`labels-${theme}`} url={TILE_LABELS[theme] || TILE_LABELS.light} zIndex={650} pane="overlayPane" opacity={0.85} />}
      {onMapReady && <MapRefExporter onMapReady={onMapReady} />}
      <ZoomTracker onZoomChange={handleZoomChange} />
      <ViewTracker />
      <HomeControl stores={stores} />

      <DistrictClouds zoom={zoom} activeDistrict={activeDistrict} showClouds={showClouds} districtMode={districtMode} theme={theme} />

      <CityLabels zoom={zoom} theme={theme} />

      <ClusteredMarkers
        stores={stores}
        selectedStore={selectedStore}
        activeDistrict={activeDistrict}
        districtMode={districtMode}
        zoom={zoom}
        onStoreSelect={onStoreSelect}
        theme={theme}
        viewedStores={viewedStores}
      />

      <CompetitorMarkers showCompetitors={showCompetitors} />
      <RoutePolyline routeStores={routeStores} routeGeometry={routeGeometry} />

      {/* Drive-time rings around selected store */}
      {selectedStore && (
        <>
          <Circle
            center={[selectedStore.lat, selectedStore.lng]}
            radius={4023} // ~2.5 miles ≈ 5 min at 30mph
            pathOptions={{
              color: '#D4A04A',
              fillColor: '#D4A04A',
              fillOpacity: 0.04,
              weight: 1,
              dashArray: '4, 4',
              opacity: 0.3,
            }}
          />
          <Circle
            center={[selectedStore.lat, selectedStore.lng]}
            radius={8047} // ~5 miles ≈ 10 min at 30mph
            pathOptions={{
              color: '#D4A04A',
              fillColor: '#D4A04A',
              fillOpacity: 0.02,
              weight: 1,
              dashArray: '6, 6',
              opacity: 0.2,
            }}
          />
        </>
      )}

      {gpsPosition && <GpsMarker position={gpsPosition} />}

      <FlyToStore
        selectedStore={selectedStore}
        activeDistrict={activeDistrict}
        stores={stores}
      />
    </MapContainer>
  );
}
