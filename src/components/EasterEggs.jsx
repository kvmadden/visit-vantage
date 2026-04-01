import { useEffect, useRef, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { EASTER_EGGS } from '../config/easterEggs';

const LS_KEY = 'vv-easter-eggs-found';

function getFound() {
  try {
    return new Set(JSON.parse(localStorage.getItem(LS_KEY) || '[]'));
  } catch { return new Set(); }
}

function markFound(id) {
  const found = getFound();
  found.add(id);
  localStorage.setItem(LS_KEY, JSON.stringify([...found]));
  return found;
}

// ---------------------------------------------------------------------------
// SVG generators — monochrome, low-opacity, theme-aware
// ---------------------------------------------------------------------------

function svgColors(theme) {
  return {
    stroke: theme === 'dark' ? '#d4d4d8' : '#57534e',
    fill: theme === 'dark' ? '#a1a1aa' : '#78716c',
    accent: theme === 'dark' ? '#D4A04A' : '#B8862E',
    water: theme === 'dark' ? '#60a5fa' : '#3b82f6',
    red: theme === 'dark' ? '#fca5a5' : '#b91c1c',
    green: theme === 'dark' ? '#86efac' : '#166534',
    teal: theme === 'dark' ? '#5eead4' : '#0d9488',
    blue: theme === 'dark' ? '#93c5fd' : '#2563eb',
    brown: theme === 'dark' ? '#d6d3d1' : '#78716c',
    op: theme === 'dark' ? 0.35 : 0.4,
  };
}

const SVG_GENERATORS = {
  pirateShip(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="20" viewBox="0 0 28 20">
      <path d="M3 14 Q5 17 14 17 Q23 17 25 14 L23 14 Q22 16 14 16 Q6 16 5 14 Z" fill="${c.brown}" fill-opacity="${c.op}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M4 14 Q4 11 7 10 L21 10 Q24 11 24 14" fill="none" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op}"/>
      <line x1="14" y1="3" x2="14" y2="10" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op}"/>
      <polygon points="14,3 14,8 21,6.5" fill="${c.fill}" fill-opacity="${c.op * 0.6}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <line x1="8" y1="4" x2="8" y2="10" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.7}"/>
      <polygon points="8,4 8,8 4,7" fill="${c.fill}" fill-opacity="${c.op * 0.5}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.7}"/>
      <text x="17" y="5" font-size="4" font-family="sans-serif" fill="${c.stroke}" fill-opacity="${c.op * 0.8}">&#9760;</text>
    </svg>`;
  },

  kraken(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="22" viewBox="0 0 32 22">
      <path d="M0 11 Q4 10 8 11 Q12 12 16 11 Q20 10 24 11 Q28 12 32 11" fill="none" stroke="${c.water}" stroke-width="0.6" stroke-opacity="${c.op * 0.5}"/>
      <path d="M6 11 Q7 6 10 4 Q11 3 10 6 Q9 8 8 11" fill="none" stroke="${c.stroke}" stroke-width="0.9" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <circle cx="9" cy="6" r="0.6" fill="${c.stroke}" fill-opacity="${c.op * 0.6}"/>
      <circle cx="8.5" cy="8" r="0.5" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <path d="M14 11 Q13 5 16 2 Q17 1 17 4 Q16 7 15 11" fill="none" stroke="${c.stroke}" stroke-width="1" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <circle cx="15.5" cy="4" r="0.6" fill="${c.stroke}" fill-opacity="${c.op * 0.6}"/>
      <circle cx="15" cy="6.5" r="0.5" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="16" cy="8.5" r="0.5" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <path d="M22 11 Q23 7 21 4 Q20 3 21 6 Q22 9 23 11" fill="none" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op * 0.9}" stroke-linecap="round"/>
      <circle cx="21.5" cy="5.5" r="0.5" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
    </svg>`;
  },

  manatee(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16">
      <ellipse cx="12" cy="8" rx="8" ry="5" fill="${c.fill}" fill-opacity="${c.op * 0.3}" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op}"/>
      <ellipse cx="21" cy="8" rx="3" ry="2.5" fill="${c.fill}" fill-opacity="${c.op * 0.25}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.8}"/>
      <ellipse cx="6" cy="4.5" rx="1.5" ry="1" transform="rotate(-20 6 4.5)" fill="${c.fill}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.6}"/>
      <ellipse cx="6" cy="11.5" rx="1.5" ry="1" transform="rotate(20 6 11.5)" fill="${c.fill}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.6}"/>
      <circle cx="5.5" cy="7" r="0.6" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="5.5" cy="9" r="0.6" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
    </svg>`;
  },

  skunkApe(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
      <path d="M9 2 Q11 2 11 4 Q11 6 9 6 Q7 6 7 4 Q7 2 9 2Z" fill="${c.brown}" fill-opacity="${c.op * 0.4}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M9 6 L9 14" stroke="${c.stroke}" stroke-width="1.2" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M9 8 L4 12" stroke="${c.stroke}" stroke-width="0.9" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M9 8 L15 11" stroke="${c.stroke}" stroke-width="0.9" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M9 14 L5 22" stroke="${c.stroke}" stroke-width="1" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M9 14 L13 21" stroke="${c.stroke}" stroke-width="1" stroke-opacity="${c.op}" stroke-linecap="round"/>
    </svg>`;
  },

  strawberry(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 16 20">
      <path d="M8 4 Q2 8 2 13 Q2 18 8 19 Q14 18 14 13 Q14 8 8 4Z" fill="${c.red}" fill-opacity="${c.op * 0.5}" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <path d="M5 2 L8 5 L11 2" fill="${c.green}" fill-opacity="${c.op * 0.6}" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <path d="M3 3 L8 5 L13 3" fill="${c.green}" fill-opacity="${c.op * 0.4}" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <circle cx="6" cy="10" r="0.5" fill="${c.accent}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="10" cy="10" r="0.5" fill="${c.accent}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="8" cy="13" r="0.5" fill="${c.accent}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="6" cy="15" r="0.4" fill="${c.accent}" fill-opacity="${c.op * 0.4}"/>
      <circle cx="10" cy="15" r="0.4" fill="${c.accent}" fill-opacity="${c.op * 0.4}"/>
    </svg>`;
  },

  meltingClock(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <path d="M10 1 A7 7 0 0 1 17 8 Q18 12 17 15 Q15 18 13 17 Q11 16 10 17 A7 7 0 0 1 3 8 A7 7 0 0 1 10 1Z" fill="${c.accent}" fill-opacity="${c.op * 0.15}" stroke="${c.accent}" stroke-width="0.7" stroke-opacity="${c.op}"/>
      <line x1="10" y1="4" x2="10" y2="9" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <line x1="10" y1="9" x2="14" y2="7" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <circle cx="10" cy="9" r="0.8" fill="${c.stroke}" fill-opacity="${c.op * 0.6}"/>
      <circle cx="10" cy="4" r="0.4" fill="${c.stroke}" fill-opacity="${c.op * 0.4}"/>
      <circle cx="14" cy="9" r="0.4" fill="${c.stroke}" fill-opacity="${c.op * 0.4}"/>
      <circle cx="10" cy="14" r="0.4" fill="${c.stroke}" fill-opacity="${c.op * 0.4}"/>
      <circle cx="6" cy="9" r="0.4" fill="${c.stroke}" fill-opacity="${c.op * 0.4}"/>
    </svg>`;
  },

  lightning(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="24" viewBox="0 0 14 24">
      <polygon points="8,0 2,12 6,12 4,24 13,9 9,9 12,0" fill="${c.blue}" fill-opacity="${c.op * 0.5}" stroke="${c.blue}" stroke-width="0.5" stroke-opacity="${c.op}"/>
    </svg>`;
  },

  mermaid(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
      <circle cx="9" cy="3.5" r="2.5" fill="${c.teal}" fill-opacity="${c.op * 0.3}" stroke="${c.teal}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M9 6 L9 14" stroke="${c.teal}" stroke-width="1" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M9 8 Q5 7 4 10" stroke="${c.teal}" stroke-width="0.7" stroke-opacity="${c.op * 0.8}" stroke-linecap="round" fill="none"/>
      <path d="M9 8 Q13 7 14 10" stroke="${c.teal}" stroke-width="0.7" stroke-opacity="${c.op * 0.8}" stroke-linecap="round" fill="none"/>
      <path d="M9 14 Q7 17 5 19 Q3 21 2 20 Q3 18 5 17" fill="${c.teal}" fill-opacity="${c.op * 0.3}" stroke="${c.teal}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M9 14 Q11 17 13 19 Q15 21 16 20 Q15 18 13 17" fill="${c.teal}" fill-opacity="${c.op * 0.3}" stroke="${c.teal}" stroke-width="0.6" stroke-opacity="${c.op}"/>
    </svg>`;
  },

  cigar(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="10" viewBox="0 0 28 10">
      <rect x="2" y="3" width="20" height="4" rx="2" ry="2" fill="${c.brown}" fill-opacity="${c.op * 0.4}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <rect x="16" y="3" width="3" height="4" rx="0.5" fill="${c.stroke}" fill-opacity="${c.op * 0.2}"/>
      <circle cx="1.5" cy="5" r="1.2" fill="${c.accent}" fill-opacity="${c.op * 0.5}"/>
      <path d="M23 4 Q24 2 23 1" fill="none" stroke="${c.fill}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <path d="M24 5 Q26 2 25 0" fill="none" stroke="${c.fill}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
    </svg>`;
  },
};

// ---------------------------------------------------------------------------
// Popup HTML builder
// ---------------------------------------------------------------------------
function buildPopupHtml(egg, foundSet) {
  const count = foundSet.size;
  const total = EASTER_EGGS.length;
  return `<div class="egg-popup-inner">
    <div class="egg-title">${egg.title}</div>
    <div class="egg-fact">${egg.fact}</div>
    <div class="egg-badge">Easter egg ${count} of ${total} discovered</div>
  </div>`;
}

// ---------------------------------------------------------------------------
// EasterEggs component — renders inside <MapContainer>
// ---------------------------------------------------------------------------
export default function EasterEggs({ zoom, theme }) {
  const map = useMap();
  const groupRef = useRef(null);
  const markersRef = useRef([]);
  const foundRef = useRef(getFound());

  const handleEggClick = useCallback((egg, marker) => {
    foundRef.current = markFound(egg.id);
    // Update popup content with latest count
    marker.setPopupContent(buildPopupHtml(egg, foundRef.current));
    // Pulse animation
    const el = marker._icon;
    if (el) {
      el.classList.add('easter-egg-found');
      setTimeout(() => el.classList.remove('easter-egg-found'), 600);
    }
  }, []);

  // Create all markers once per theme change
  useEffect(() => {
    if (!map) return;

    // Clean up
    if (groupRef.current) {
      map.removeLayer(groupRef.current);
      groupRef.current = null;
      markersRef.current = [];
    }

    const group = L.layerGroup();
    const markers = [];

    EASTER_EGGS.forEach((egg) => {
      const gen = SVG_GENERATORS[egg.svgKey];
      if (!gen) return;

      const svg = gen(theme);
      const icon = L.divIcon({
        html: svg,
        className: 'easter-egg-icon',
        iconSize: egg.size,
        iconAnchor: [egg.size[0] / 2, egg.size[1] / 2],
      });

      const marker = L.marker([egg.lat, egg.lng], {
        icon,
        interactive: true,
        zIndexOffset: -1000,
      });

      marker.bindPopup(buildPopupHtml(egg, foundRef.current), {
        className: 'easter-egg-popup',
        maxWidth: 220,
        closeButton: true,
      });

      marker.on('click', () => handleEggClick(egg, marker));
      group.addLayer(marker);
      markers.push({ marker, egg });
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
  }, [map, theme, handleEggClick]);

  // Toggle visibility based on zoom
  useEffect(() => {
    if (!map || markersRef.current.length === 0) return;

    function updateVisibility() {
      const z = map.getZoom();
      markersRef.current.forEach(({ marker, egg }) => {
        const el = marker._icon?.querySelector('svg');
        if (!el) return;
        const visible = z >= egg.minZoom && z <= egg.maxZoom;
        el.style.opacity = visible ? '1' : '0';
        el.style.pointerEvents = visible ? 'auto' : 'none';
      });
    }

    updateVisibility();
    map.on('zoomend', updateVisibility);
    map.on('zoom', updateVisibility);
    return () => {
      map.off('zoomend', updateVisibility);
      map.off('zoom', updateVisibility);
    };
  }, [map, zoom]);

  return null;
}
