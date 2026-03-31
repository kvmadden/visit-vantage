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

const DEFAULT_CENTER = [27.85, -82.48];
const DEFAULT_ZOOM = 9;
const MIN_ZOOM = 8;
const MAX_ZOOM = 18;
// Bounding box for the Tampa Bay region — prevents panning outside this area
const MAX_BOUNDS = [
  [26.4, -83.3], // SW corner
  [29.0, -81.3], // NE corner
];

const TILE_BASE = {
  light: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
};
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

const ROUTE_COLOR = '#4A9EFF';

// Tampa Bay area cities/places with min zoom at which they appear
// tier 1 = major cities (always visible), tier 2 = medium (z>=10), tier 3 = neighborhoods (z>=11)
const CITY_LABELS = [
  // Tier 1 — major cities (always try to show, will reposition to avoid collisions)
  { name: 'TAMPA', lat: 27.9506, lng: -82.4572, tier: 1 },
  { name: 'ST. PETERSBURG', lat: 27.7676, lng: -82.6403, tier: 1 },
  { name: 'CLEARWATER', lat: 27.9659, lng: -82.8001, tier: 1 },
  { name: 'SARASOTA', lat: 27.3364, lng: -82.5307, tier: 1 },
  { name: 'BRADENTON', lat: 27.4989, lng: -82.5748, tier: 1 },
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
// CityLabels — custom city name markers with collision avoidance
// Labels are created once, then visibility is toggled (no flashing)
// ---------------------------------------------------------------------------
function CityLabels({ zoom, theme }) {
  const map = useMap();
  const groupRef = useRef(null);
  const markersRef = useRef([]); // { marker, city, el } for visibility toggling

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

      const marker = L.marker([city.lat, city.lng], { icon, interactive: false });
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

  // Toggle visibility based on zoom + collision — no destroy/recreate
  useEffect(() => {
    if (!map || markersRef.current.length === 0) return;

    function updateVisibility() {
      const currentZoom = map.getZoom();
      const minTier = currentZoom >= 12 ? 3 : currentZoom >= 10 ? 2 : 1;

      // City labels fade at high zoom
      const cityOpacity = currentZoom <= 10 ? 0.9 : currentZoom <= 12 ? 0.6 : currentZoom <= 13 ? 0.35 : 0;

      // City labels are FIRST PRIORITY — only check against other city labels
      const placedRects = [];
      const bounds = map.getBounds();

      markersRef.current.forEach(({ marker, city }) => {
        const el = marker._icon?.querySelector('.city-label-custom');
        if (!el) return;

        // Reset position to natural lat/lng each pass
        marker.setLatLng([city.lat, city.lng]);

        // Hide if tier not visible at this zoom, or off-screen
        if (city.tier > minTier || cityOpacity <= 0 ||
            !bounds.contains([city.lat, city.lng])) {
          el.style.opacity = '0';
          return;
        }

        const pt = map.latLngToContainerPoint([city.lat, city.lng]);
        const isMajor = city.tier === 1;
        const estW = city.name.length * (isMajor ? 9 : 7);
        const estH = (isMajor ? 13 : 11) + 4;

        const rect = {
          left: pt.x - estW * 0.3,
          right: pt.x + estW * 0.7,
          top: pt.y - estH / 2,
          bottom: pt.y + estH / 2,
        };

        // Only check city-to-city collision (cities are top priority)
        const hitsOtherCity = placedRects.some((r) =>
          rect.left < r.right + 8 && rect.right > r.left - 8 &&
          rect.top < r.bottom + 8 && rect.bottom > r.top - 8
        );

        // Tier 1 always shows; tier 2/3 hide if overlapping another city
        if (hitsOtherCity && !isMajor) {
          el.style.opacity = '0';
        } else {
          el.style.opacity = String(cityOpacity);
          placedRects.push(rect);
        }
      });
    }

    // Run after cluster pills settle
    let pending = null;
    const debounced = () => {
      if (pending) clearTimeout(pending);
      pending = setTimeout(updateVisibility, 400);
    };
    debounced(); // initial run
    map.on('zoomend', debounced);
    map.on('moveend', debounced);

    return () => {
      if (pending) clearTimeout(pending);
      map.off('zoomend', debounced);
      map.off('moveend', debounced);
    };
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
// ClusteredMarkers — one cluster group per district so colors never mix
// ---------------------------------------------------------------------------
function ClusteredMarkers({
  stores,
  selectedStore,
  activeDistrict,
  districtMode,
  zoom,
  onStoreSelect,
  theme,
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
        maxClusterRadius: (z) => (z <= 9 ? 160 : z <= 10 ? 120 : z <= 12 ? 65 : 40),
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
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
        const displayColor = isFaded ? (theme === 'dark' ? '#a1a1aa' : '#71717a') : activeColor;

        const currentZoom = map.getZoom();
        const zoomScale = Math.max(0.75, 1 + (currentZoom - 13) * 0.25);
        const baseHeart = isSelected ? 22 : 16;
        const baseBullseye = isSelected ? 15 : 11;
        const heartSize = Math.max(20, Math.round(baseHeart * zoomScale));
        const bullseyeSize = Math.max(16, Math.round(baseBullseye * zoomScale));

        const bullseyeInner = theme === 'dark' ? '#18181b' : '#ffffff';
        const icon = isTarget
          ? createBullseyeIcon(displayColor, bullseyeSize, opacity, bullseyeInner)
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

    // Simple nudge: push overlapping cluster pills apart from each other
    function nudgeOverlaps() {
      try {
        const icons = [];
        clusterGroupsRef.current.forEach((group) => {
          group.eachLayer((layer) => {
            if (typeof layer.getChildCount === 'function' && layer._icon && layer._icon.offsetWidth > 0) {
              const rect = layer._icon.getBoundingClientRect();
              icons.push({ el: layer._icon, rect });
            }
          });
        });

        // Reset previous nudges
        for (const item of icons) {
          if (item.el.dataset.baseTransform) {
            item.el.style.transform = item.el.dataset.baseTransform;
            delete item.el.dataset.baseTransform;
            item.rect = item.el.getBoundingClientRect();
          }
        }

        // Push overlapping pills apart
        for (let pass = 0; pass < 2; pass++) {
          for (let i = 0; i < icons.length; i++) {
            for (let j = i + 1; j < icons.length; j++) {
              const a = icons[i].rect;
              const b = icons[j].rect;
              const pad = 4;
              const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left) + pad;
              const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) + pad;
              if (overlapX > 0 && overlapY > 0) {
                const nudge = Math.min(overlapX, overlapY) * 0.5 + 2;
                const dx = (b.left + b.width / 2) - (a.left + a.width / 2) || 1;
                const dy = (b.top + b.height / 2) - (a.top + a.height / 2) || 1;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const nx = dx / dist;
                const ny = dy / dist;
                const elA = icons[i].el;
                const elB = icons[j].el;
                if (!elA.dataset.baseTransform) elA.dataset.baseTransform = elA.style.transform || '';
                if (!elB.dataset.baseTransform) elB.dataset.baseTransform = elB.style.transform || '';
                elA.style.transform = elA.dataset.baseTransform + ` translate(${-nx * nudge}px, ${-ny * nudge}px)`;
                elB.style.transform = elB.dataset.baseTransform + ` translate(${nx * nudge}px, ${ny * nudge}px)`;
                icons[i].rect = elA.getBoundingClientRect();
                icons[j].rect = elB.getBoundingClientRect();
              }
            }
          }
        }
      } catch (_) { /* best-effort */ }
    }

    // Run nudge after clusters settle
    const timer = setTimeout(nudgeOverlaps, 300);
    map.on('zoomend', nudgeOverlaps);
    map.on('moveend', nudgeOverlaps);

    return () => {
      clearTimeout(timer);
      map.off('zoomend', nudgeOverlaps);
      map.off('moveend', nudgeOverlaps);
      clusterGroupsRef.current.forEach((g) => map.removeLayer(g));
      clusterGroupsRef.current = [];
    };
  }, [map, stores, selectedStore, activeDistrict, districtMode, onStoreSelect, theme]);

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
// DistrictClouds — colored territory overlays that fade as you zoom in
// District labels placed at polygon centroid, inside the district
// ---------------------------------------------------------------------------
function DistrictClouds({ zoom, activeDistrict, showClouds, districtMode, theme }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map || !showClouds) {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    // Polygon opacity: full at z<=9, gone at z>=13
    const baseOpacity = zoom <= 9 ? 0.18 : zoom >= 13 ? 0 : 0.18 * (13 - zoom) / 4;
    // District label opacity: fades earlier and faster than polygons
    const labelOpacity = zoom <= 9 ? 0.9 : zoom >= 12 ? 0 : 0.9 * (12 - zoom) / 3;

    if (baseOpacity <= 0 && labelOpacity <= 0) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    const labelData = [];
    const geoData = districtMode === 'fs' ? fsDistrictGeoJSON : rxDistrictGeoJSON;

    const layer = L.geoJSON(geoData, {
      style: (feature) => {
        const d = feature.properties.district;
        const isActive = activeDistrict == null || activeDistrict === d;
        return {
          fillColor: feature.properties.color,
          fillOpacity: isActive ? baseOpacity : baseOpacity * 0.2,
          color: feature.properties.color,
          weight: isActive ? 1.5 : 0.5,
          opacity: isActive ? 0.4 : 0.1,
        };
      },
      onEachFeature: (feature) => {
        const d = feature.properties.district;
        const isActive = activeDistrict == null || activeDistrict === d;
        if (!isActive || labelOpacity <= 0) return;

        // Place label at polygon centroid — inside the district
        const coords = feature.geometry.coordinates[0];
        const lats = coords.map((c) => c[1]);
        const lngs = coords.map((c) => c[0]);
        const centroidLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const centroidLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

        labelData.push({
          lat: centroidLat,
          lng: centroidLng,
          color: feature.properties.color,
          label: feature.properties.label,
        });
      },
    });

    layer.addTo(map);
    layerRef.current = layer;

    // Delay label placement so cluster pills are rendered first
    let labelTimer = null;
    if (labelOpacity > 0) {
      labelTimer = setTimeout(() => {
      // Collect visible city label rects for collision avoidance (city labels are higher priority)
      const mapRect = map.getContainer().getBoundingClientRect();
      const cityRects = [];
      document.querySelectorAll('.city-label-custom').forEach((el) => {
        if (el.offsetWidth > 0 && parseFloat(el.style.opacity) > 0) {
          const r = el.getBoundingClientRect();
          cityRects.push({
            left: r.left - mapRect.left,
            right: r.right - mapRect.left,
            top: r.top - mapRect.top,
            bottom: r.bottom - mapRect.top,
          });
        }
      });

      const labelSize = 16;
      const estLabelW = 45; // approximate width of "D20" etc at 16px
      const estLabelH = 22;
      const pad = 8;

      // For each district, find best position that avoids pills
      const placedDistrictRects = [];

      function hitsAnything(cx, cy) {
        const left = cx - estLabelW / 2;
        const right = cx + estLabelW / 2;
        const top = cy - estLabelH / 2;
        const bottom = cy + estLabelH / 2;
        // Check city labels (higher priority — district labels must avoid them)
        for (const r of cityRects) {
          if (left < r.right + pad && right > r.left - pad &&
              top < r.bottom + pad && bottom > r.top - pad) return true;
        }
        // Check already-placed district labels
        for (const r of placedDistrictRects) {
          if (left < r.right + pad && right > r.left - pad &&
              top < r.bottom + pad && bottom > r.top - pad) return true;
        }
        return false;
      }

      const haloColor = theme === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.85)';
      const haloBlur = theme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.6)';

      labelData.forEach((ld) => {
        const centroidPt = map.latLngToContainerPoint([ld.lat, ld.lng]);

        // Try centroid first, then search in a grid of offsets within the polygon area
        let bestX = centroidPt.x;
        let bestY = centroidPt.y;

        if (hitsAnything(bestX, bestY)) {
          // Search candidate positions: offset from centroid in a spiral pattern
          const offsets = [];
          for (let r = 30; r <= 120; r += 30) {
            for (let angle = 0; angle < 360; angle += 45) {
              const rad = angle * Math.PI / 180;
              offsets.push({ dx: Math.cos(rad) * r, dy: Math.sin(rad) * r });
            }
          }

          let found = false;
          for (const off of offsets) {
            const cx = centroidPt.x + off.dx;
            const cy = centroidPt.y + off.dy;
            if (!hitsAnything(cx, cy)) {
              bestX = cx;
              bestY = cy;
              found = true;
              break;
            }
          }

          // If no clear spot found, pick the offset furthest from any city label
          if (!found) {
            let maxMinDist = 0;
            for (const off of offsets) {
              const cx = centroidPt.x + off.dx;
              const cy = centroidPt.y + off.dy;
              let minDist = Infinity;
              for (const r of cityRects) {
                const rcx = (r.left + r.right) / 2;
                const rcy = (r.top + r.bottom) / 2;
                const d = Math.sqrt((cx - rcx) ** 2 + (cy - rcy) ** 2);
                if (d < minDist) minDist = d;
              }
              if (minDist > maxMinDist) {
                maxMinDist = minDist;
                bestX = cx;
                bestY = cy;
              }
            }
          }
        }

        placedDistrictRects.push({
          left: bestX - estLabelW / 2,
          right: bestX + estLabelW / 2,
          top: bestY - estLabelH / 2,
          bottom: bestY + estLabelH / 2,
        });

        const finalLL = map.containerPointToLatLng([bestX, bestY]);
        const icon = L.divIcon({
          html: `<div style="font-family:IBM Plex Sans,sans-serif;font-weight:800;font-size:${labelSize}px;color:${ld.color};opacity:${labelOpacity};text-shadow:-1px -1px 2px ${haloColor},1px -1px 2px ${haloColor},-1px 1px 2px ${haloColor},1px 1px 2px ${haloColor},0 0 8px ${haloBlur};white-space:nowrap;pointer-events:none;letter-spacing:0.5px">${ld.label}</div>`,
          className: 'district-label-icon',
          iconSize: [60, 24],
          iconAnchor: [30, 12],
        });
        L.marker([finalLL.lat, finalLL.lng], { icon, interactive: false }).addTo(layer);
      });
      }, 350); // wait for cluster pills to settle
    }

    return () => {
      if (labelTimer) clearTimeout(labelTimer);
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, zoom, activeDistrict, showClouds, districtMode, theme]);

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
      <ZoomTracker onZoomChange={handleZoomChange} />
      <FitAllStores stores={stores} />
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
              color: '#4A9EFF',
              fillColor: '#4A9EFF',
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
              color: '#4A9EFF',
              fillColor: '#4A9EFF',
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
