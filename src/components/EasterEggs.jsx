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

export const SVG_GENERATORS = {
  // =========================================================================
  // BATCH 1 — Category-colored icons (spec v2)
  // =========================================================================

  pirateShip(theme, activated = false) {
    // culture → #A78BFA
    const k = '#A78BFA';
    const o = activated ? 1 : 0.4;
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="22" viewBox="-2 -1 32 22">
      <!-- ocean waves background -->
      <path d="M-2 17 Q3.5 16 7 17 Q10.5 18 14 17 Q17.5 16 21 17 Q24.5 18 30 17" fill="none" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.35}" stroke-linecap="round"/>
      <path d="M-2 19 Q3.5 18 7 19 Q10.5 20 14 19 Q17.5 18 21 19 Q24.5 20 30 19" fill="none" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.2}" stroke-linecap="round"/>
      <!-- hull: wide U-shape with flat deck -->
      <path d="M2 10 L2 14 Q3 16.5 14 16.5 Q25 16.5 26 14 L26 10" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="1.8" stroke-opacity="${o}" stroke-linejoin="round"/>
      <!-- flat deck line -->
      <line x1="2" y1="10" x2="26" y2="10" stroke="${k}" stroke-width="1.8" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- hull planking lines -->
      <line x1="3" y1="12" x2="25" y2="12" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.3}"/>
      <line x1="3" y1="14" x2="25" y2="14" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.3}"/>
      <!-- bowsprit -->
      <line x1="2" y1="10" x2="0" y2="8" stroke="${k}" stroke-width="1.5" stroke-opacity="${o * 0.8}" stroke-linecap="round"/>
      <!-- stern rise -->
      <path d="M26 10 L27 8.5" fill="none" stroke="${k}" stroke-width="1.5" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <path d="M27 8.5 Q27.5 7.5 27 7" fill="none" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.4}" stroke-linecap="round"/>
      <!-- main mast -->
      <line x1="14" y1="1" x2="14" y2="10" stroke="${k}" stroke-width="1.8" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- crow's nest -->
      <line x1="12.5" y1="3.5" x2="15.5" y2="3.5" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.8}" stroke-linecap="round"/>
      <path d="M12.5 3.5 Q12 4.5 12.5 5" fill="none" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.5}"/>
      <path d="M15.5 3.5 Q16 4.5 15.5 5" fill="none" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.5}"/>
      <!-- main sail -->
      <path d="M14 1.5 Q19 3 22 5 L22 8 Q19 7 14 8 Z" fill="${k}" fill-opacity="${o * 0.35}" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.8}" stroke-linejoin="round"/>
      <!-- sail rigging lines -->
      <line x1="15" y1="2.5" x2="21" y2="5.5" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.25}"/>
      <line x1="15" y1="5" x2="21" y2="6.5" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.25}"/>
      <!-- fore mast -->
      <line x1="8" y1="3" x2="8" y2="10" stroke="${k}" stroke-width="1.5" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- fore sail -->
      <path d="M8 3 Q4 5 2 7 L2 9.5 Q5 8 8 8.5 Z" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.7}" stroke-linejoin="round"/>
      <!-- jolly roger flag -->
      <rect x="14.2" y="1" width="4" height="2.8" rx="0.3" fill="${k}" fill-opacity="${o * 0.6}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o}"/>
      <circle cx="16.2" cy="1.8" r="0.6" fill="black" fill-opacity="${o * 0.7}"/>
      <line x1="15.4" y1="3" x2="17" y2="3" stroke="black" stroke-width="0.5" stroke-opacity="${o * 0.5}"/>
      <!-- rigging ropes -->
      <line x1="8" y1="3" x2="14" y2="1.5" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.3}"/>
      <line x1="14" y1="1.5" x2="26" y2="10" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.3}"/>
      <line x1="8" y1="3" x2="2" y2="10" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.3}"/>
      <!-- cannon ports -->
      <rect x="6" y="11" width="1.4" height="1" rx="0.3" fill="${k}" fill-opacity="${o * 0.5}"/>
      <rect x="9.5" y="11" width="1.4" height="1" rx="0.3" fill="${k}" fill-opacity="${o * 0.5}"/>
      <rect x="13" y="11" width="1.4" height="1" rx="0.3" fill="${k}" fill-opacity="${o * 0.5}"/>
      <rect x="16.5" y="11" width="1.4" height="1" rx="0.3" fill="${k}" fill-opacity="${o * 0.5}"/>
      <rect x="20" y="11" width="1.4" height="1" rx="0.3" fill="${k}" fill-opacity="${o * 0.5}"/>
      <!-- water splash at bow -->
      <path d="M1 15 Q0 14 1 13" fill="none" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <path d="M0 16 Q-0.5 15 0.5 14" fill="none" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.2}" stroke-linecap="round"/>
      <!-- wake trail -->
      <path d="M26 15 Q27 14.5 28 15.5" fill="none" stroke="${k}" stroke-width="0.7" stroke-opacity="${o * 0.25}" stroke-linecap="round"/>
    </svg>`;
    // INACTIVE: mast + sail popping up from behind horizon line
    return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="22" viewBox="-2 -1 32 22">
      <path d="M-2 14 Q7 13 14 14 Q21 15 30 14" fill="none" stroke="${k}" stroke-width="1.5" stroke-opacity="${o}" stroke-linecap="round"/>
      <path d="M-2 16 Q7 15 14 16 Q21 17 30 16" fill="none" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.4}" stroke-linecap="round"/>
      <!-- mast rising above horizon -->
      <line x1="14" y1="4" x2="14" y2="14" stroke="${k}" stroke-width="2" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- sail billowing -->
      <path d="M14 4 Q18 6 20 8 L20 12 Q18 11 14 11.5 Z" fill="${k}" fill-opacity="${o * 0.5}" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.8}" stroke-linejoin="round"/>
      <!-- crow's nest hint -->
      <line x1="13" y1="6" x2="15" y2="6" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <!-- tiny flag -->
      <path d="M14 4 L17 5 L14 6" fill="${k}" fill-opacity="${o * 0.6}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o}" stroke-linejoin="round"/>
    </svg>`;
  },

  kraken(theme, activated = false) {
    // water → #2DD4BF
    const k = '#2DD4BF';
    const o = activated ? 1 : 0.4;
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="24" viewBox="-1 -1 34 24">
      <!-- waterline low — kraken is mostly OUT of the water -->
      <path d="M0 18 Q8 17 16 18 Q24 19 32 18" fill="none" stroke="${k}" stroke-width="1.5" stroke-opacity="${o * 0.4}" stroke-linecap="round"/>
      <path d="M0 20 Q8 19 16 20 Q24 21 32 20" fill="none" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.2}" stroke-linecap="round"/>
      <!-- big dome head — upper half of the SVG -->
      <path d="M10 17 Q10 10 11 7 Q12 4 16 2.5 Q20 4 21 7 Q22 10 22 17" fill="${k}" fill-opacity="${o * 0.25}" stroke="${k}" stroke-width="2" stroke-opacity="${o}" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- head texture bumps -->
      <path d="M12 5 Q14 3.5 16 3" fill="none" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.3}"/>
      <path d="M16 3 Q18 3.5 20 5" fill="none" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.3}"/>
      <!-- big angry eyes -->
      <ellipse cx="13.5" cy="8" rx="1.8" ry="1.5" fill="none" stroke="${k}" stroke-width="1.5" stroke-opacity="${o}"/>
      <circle cx="13.5" cy="8" r="0.9" fill="${k}" fill-opacity="${o}"/>
      <ellipse cx="18.5" cy="8" rx="1.8" ry="1.5" fill="none" stroke="${k}" stroke-width="1.5" stroke-opacity="${o}"/>
      <circle cx="18.5" cy="8" r="0.9" fill="${k}" fill-opacity="${o}"/>
      <!-- brow ridges -->
      <path d="M11.5 6.5 Q13.5 5.5 15 6.5" fill="none" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <path d="M17 6.5 Q18.5 5.5 20.5 6.5" fill="none" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <!-- mouth -->
      <path d="M14 12 Q16 13.5 18 12" fill="none" stroke="${k}" stroke-width="1.5" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <!-- tentacle 1 — far left, curling up -->
      <path d="M3 18 Q1 14 2 9 Q3 5 4 3 Q5 1 5.5 4 Q6 7 6.5 11 Q7 14 8 17" fill="none" stroke="${k}" stroke-width="2.2" stroke-opacity="${o}" stroke-linecap="round"/>
      <circle cx="3" cy="5" r="0.8" fill="${k}" fill-opacity="${o * 0.6}"/>
      <circle cx="4" cy="8" r="0.7" fill="${k}" fill-opacity="${o * 0.5}"/>
      <circle cx="5" cy="11" r="0.6" fill="${k}" fill-opacity="${o * 0.5}"/>
      <circle cx="6" cy="14" r="0.6" fill="${k}" fill-opacity="${o * 0.4}"/>
      <!-- tentacle 2 — inner left -->
      <path d="M9 17 Q8 13 8.5 9 Q9 6 9.5 4.5" fill="none" stroke="${k}" stroke-width="1.8" stroke-opacity="${o * 0.8}" stroke-linecap="round"/>
      <circle cx="9" cy="6" r="0.6" fill="${k}" fill-opacity="${o * 0.5}"/>
      <circle cx="8.5" cy="9" r="0.5" fill="${k}" fill-opacity="${o * 0.4}"/>
      <!-- tentacle 3 — inner right -->
      <path d="M23 17 Q24 13 23.5 9 Q23 6 22.5 4.5" fill="none" stroke="${k}" stroke-width="1.8" stroke-opacity="${o * 0.8}" stroke-linecap="round"/>
      <circle cx="23" cy="6" r="0.6" fill="${k}" fill-opacity="${o * 0.5}"/>
      <circle cx="23.5" cy="9" r="0.5" fill="${k}" fill-opacity="${o * 0.4}"/>
      <!-- tentacle 4 — far right, curling up -->
      <path d="M29 18 Q31 14 30 9 Q29 5 28 3 Q27 1 26.5 4 Q26 7 25.5 11 Q25 14 24 17" fill="none" stroke="${k}" stroke-width="2.2" stroke-opacity="${o}" stroke-linecap="round"/>
      <circle cx="29" cy="5" r="0.8" fill="${k}" fill-opacity="${o * 0.6}"/>
      <circle cx="28" cy="8" r="0.7" fill="${k}" fill-opacity="${o * 0.5}"/>
      <circle cx="27" cy="11" r="0.6" fill="${k}" fill-opacity="${o * 0.5}"/>
      <circle cx="26" cy="14" r="0.6" fill="${k}" fill-opacity="${o * 0.4}"/>
      <!-- water splash around base -->
      <path d="M1 18 Q2 17 3 18" fill="none" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <path d="M29 18 Q30 17 31 18" fill="none" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <!-- dripping water -->
      <circle cx="12" cy="16" r="0.4" fill="${k}" fill-opacity="${o * 0.3}"/>
      <circle cx="20" cy="15" r="0.4" fill="${k}" fill-opacity="${o * 0.3}"/>
    </svg>`;
    // INACTIVE: waterline + 3 tentacles poking up with suckers
    return `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="24" viewBox="-1 -1 34 24">
      <path d="M0 12 Q8 11 16 12 Q24 13 32 12" fill="none" stroke="${k}" stroke-width="1.5" stroke-opacity="${o}" stroke-linecap="round"/>
      <path d="M7 12 Q8 7 10 5 Q11 4 10.5 7 Q10 9 9 12" fill="none" stroke="${k}" stroke-width="2" stroke-opacity="${o}" stroke-linecap="round"/>
      <circle cx="9.5" cy="6.5" r="0.7" fill="${k}" fill-opacity="${o * 0.8}"/>
      <circle cx="9" cy="8.5" r="0.6" fill="${k}" fill-opacity="${o * 0.7}"/>
      <path d="M15 12 Q14 6 16 3 Q17 2 17.5 5 Q17 8 16 12" fill="none" stroke="${k}" stroke-width="2" stroke-opacity="${o}" stroke-linecap="round"/>
      <circle cx="16" cy="4.5" r="0.7" fill="${k}" fill-opacity="${o * 0.8}"/>
      <circle cx="16" cy="7" r="0.6" fill="${k}" fill-opacity="${o * 0.7}"/>
      <circle cx="16.5" cy="9.5" r="0.6" fill="${k}" fill-opacity="${o * 0.6}"/>
      <path d="M23 12 Q24 8 22 5 Q21 4 21.5 7 Q22 10 23.5 12" fill="none" stroke="${k}" stroke-width="2" stroke-opacity="${o}" stroke-linecap="round"/>
      <circle cx="22" cy="6" r="0.6" fill="${k}" fill-opacity="${o * 0.7}"/>
    </svg>`;
  },

  skunkApe(theme, activated = false) {
    // land → #4ADE80
    const k = '#4ADE80';
    const o = activated ? 1 : 0.4;
    const gold = '#FBBF24';
    const brown = '#92400E';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
      <!-- swamp background foliage -->
      <path d="M0 20 Q3 18 5 20 Q7 22 9 20 Q11 18 13 20 Q15 22 18 20 L18 24 L0 24 Z" fill="${k}" fill-opacity="${o * 0.15}"/>
      <path d="M1 22 Q4 20 7 22 Q10 24 13 22 Q16 20 18 22" fill="none" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.2}"/>
      <!-- hanging moss left -->
      <path d="M1 0 Q0 3 1 5 Q0.5 7 1.5 4 Q2 2 1 0" fill="${k}" fill-opacity="${o * 0.2}"/>
      <path d="M3 0 Q2 4 3 6 Q2.5 3 3 0" fill="${k}" fill-opacity="${o * 0.15}"/>
      <!-- hanging moss right -->
      <path d="M15 0 Q16 3 15 5.5 Q15.5 3 15 0" fill="${k}" fill-opacity="${o * 0.2}"/>
      <path d="M17 0 Q18 4 17 6 Q17.5 3 17 0" fill="${k}" fill-opacity="${o * 0.15}"/>
      <!-- body: massive hairy torso -->
      <path d="M5 9 Q4 12 4.5 16 Q5 18 9 18.5 Q13 18 13.5 16 Q14 12 13 9 Q11 8 9 8 Q7 8 5 9Z" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="1.5" stroke-opacity="${o}" stroke-linejoin="round"/>
      <!-- fur texture on body -->
      <line x1="6" y1="10" x2="5.5" y2="12" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <line x1="8" y1="9.5" x2="7.5" y2="11.5" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <line x1="10" y1="9.5" x2="10.5" y2="11.5" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <line x1="12" y1="10" x2="12.5" y2="12" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <line x1="7" y1="13" x2="6.5" y2="15" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.25}" stroke-linecap="round"/>
      <line x1="11" y1="13" x2="11.5" y2="15" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.25}" stroke-linecap="round"/>
      <!-- head -->
      <path d="M6 3 Q6 1 9 0.5 Q12 1 12 3 Q12.5 6 12 8 Q11 9 9 9 Q7 9 6 8 Q5.5 6 6 3Z" fill="${k}" fill-opacity="${o * 0.35}" stroke="${k}" stroke-width="1.5" stroke-opacity="${o}" stroke-linejoin="round"/>
      <!-- brow ridge -->
      <path d="M6.5 3.5 Q9 2.5 11.5 3.5" fill="none" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <!-- glowing eyes -->
      <ellipse cx="7.5" cy="4.5" rx="1" ry="0.8" fill="${gold}" fill-opacity="${o * 0.9}"/>
      <circle cx="7.5" cy="4.5" r="0.4" fill="${brown}" fill-opacity="${o}"/>
      <ellipse cx="10.5" cy="4.5" rx="1" ry="0.8" fill="${gold}" fill-opacity="${o * 0.9}"/>
      <circle cx="10.5" cy="4.5" r="0.4" fill="${brown}" fill-opacity="${o}"/>
      <!-- nose -->
      <ellipse cx="9" cy="6" rx="0.8" ry="0.5" fill="${k}" fill-opacity="${o * 0.5}"/>
      <!-- mouth/grimace -->
      <path d="M7.5 7 Q9 8 10.5 7" fill="none" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <!-- left arm reaching out -->
      <path d="M5 10 Q3 9 1.5 10.5 Q0.5 12 1 13" fill="none" stroke="${k}" stroke-width="1.8" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- left hand/fingers -->
      <line x1="1" y1="13" x2="0.5" y2="14" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <line x1="1" y1="13" x2="1.5" y2="14.5" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <line x1="1" y1="13" x2="2.5" y2="14" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <!-- right arm -->
      <path d="M13 10 Q15 9 16.5 10.5 Q17.5 12 17 13" fill="none" stroke="${k}" stroke-width="1.8" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- right hand/fingers -->
      <line x1="17" y1="13" x2="17.5" y2="14" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <line x1="17" y1="13" x2="16.5" y2="14.5" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <line x1="17" y1="13" x2="15.5" y2="14" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <!-- legs -->
      <path d="M7 18 Q6 20 5 22 Q4.5 23 6 23" fill="none" stroke="${k}" stroke-width="1.8" stroke-opacity="${o}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M11 18 Q12 20 13 22 Q13.5 23 12 23" fill="none" stroke="${k}" stroke-width="1.8" stroke-opacity="${o}" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- stink lines -->
      <path d="M1 7 Q0 6 0.5 5" fill="none" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <path d="M2 6 Q1.5 5 2 4" fill="none" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.25}" stroke-linecap="round"/>
      <path d="M16 6 Q17 5 16.5 4" fill="none" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.25}" stroke-linecap="round"/>
    </svg>`;
    // INACTIVE: dark foliage blob with two golden eyes
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
      <path d="M4 8 Q9 5 14 8 Q15 11 14 13 Q9 15 4 13 Q3 11 4 8Z" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="1.5" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <circle cx="7" cy="10.5" r="1" fill="${gold}" fill-opacity="${o * 1.5}"/>
      <circle cx="11" cy="10.5" r="1" fill="${gold}" fill-opacity="${o * 1.5}"/>
    </svg>`;
  },

  strawberry(theme, activated = false) {
    // food → #FB923C
    const k = '#FB923C';
    const o = activated ? 1 : 0.4;
    const green = '#4ADE80';
    const red = '#EF4444';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 16 20">
      <!-- stem -->
      <line x1="8" y1="0" x2="8" y2="3.5" stroke="${green}" stroke-width="1.8" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- calyx leaves (sepals radiating out) -->
      <path d="M8 3.5 L4.5 1.5 Q3.5 1 3 2 L6 4" fill="${green}" fill-opacity="${o * 0.5}" stroke="${green}" stroke-width="1" stroke-opacity="${o * 0.8}"/>
      <path d="M8 3.5 L11.5 1.5 Q12.5 1 13 2 L10 4" fill="${green}" fill-opacity="${o * 0.5}" stroke="${green}" stroke-width="1" stroke-opacity="${o * 0.8}"/>
      <path d="M8 3.5 L2.5 3 Q1.5 2.5 1.5 3.5 L5.5 4.5" fill="${green}" fill-opacity="${o * 0.4}" stroke="${green}" stroke-width="0.8" stroke-opacity="${o * 0.7}"/>
      <path d="M8 3.5 L13.5 3 Q14.5 2.5 14.5 3.5 L10.5 4.5" fill="${green}" fill-opacity="${o * 0.4}" stroke="${green}" stroke-width="0.8" stroke-opacity="${o * 0.7}"/>
      <!-- berry body — TEARDROP: wide at top, tapering to point at bottom -->
      <path d="M8 4 Q2 6 1.5 9 Q1 12 3 14 Q4 15 5.5 16.5 Q7 19 8 19.5 Q9 19 10.5 16.5 Q12 15 13 14 Q15 12 14.5 9 Q14 6 8 4Z" fill="${red}" fill-opacity="${o * 0.5}" stroke="${k}" stroke-width="1.8" stroke-opacity="${o}" stroke-linejoin="round"/>
      <!-- highlight sheen on left -->
      <path d="M5 6 Q3.5 9 4 12" fill="none" stroke="${red}" stroke-width="0.8" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <!-- seeds in teardrop pattern -->
      <circle cx="5.5" cy="7" r="0.5" fill="${k}" fill-opacity="${o * 0.8}"/>
      <circle cx="10.5" cy="7" r="0.5" fill="${k}" fill-opacity="${o * 0.8}"/>
      <circle cx="4" cy="9" r="0.5" fill="${k}" fill-opacity="${o * 0.8}"/>
      <circle cx="8" cy="8.5" r="0.5" fill="${k}" fill-opacity="${o * 0.8}"/>
      <circle cx="12" cy="9" r="0.5" fill="${k}" fill-opacity="${o * 0.8}"/>
      <circle cx="3.5" cy="11" r="0.45" fill="${k}" fill-opacity="${o * 0.7}"/>
      <circle cx="6.5" cy="10.5" r="0.45" fill="${k}" fill-opacity="${o * 0.7}"/>
      <circle cx="9.5" cy="10.5" r="0.45" fill="${k}" fill-opacity="${o * 0.7}"/>
      <circle cx="12.5" cy="11" r="0.45" fill="${k}" fill-opacity="${o * 0.7}"/>
      <circle cx="5" cy="13" r="0.45" fill="${k}" fill-opacity="${o * 0.65}"/>
      <circle cx="8" cy="12.5" r="0.45" fill="${k}" fill-opacity="${o * 0.65}"/>
      <circle cx="11" cy="13" r="0.45" fill="${k}" fill-opacity="${o * 0.65}"/>
      <circle cx="6.5" cy="15" r="0.4" fill="${k}" fill-opacity="${o * 0.55}"/>
      <circle cx="9.5" cy="15" r="0.4" fill="${k}" fill-opacity="${o * 0.55}"/>
      <circle cx="8" cy="17" r="0.35" fill="${k}" fill-opacity="${o * 0.45}"/>
      <!-- surface texture -->
      <path d="M5 7.5 Q4.5 9 5 10.5" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.15}"/>
      <path d="M11 7.5 Q11.5 9 11 10.5" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.15}"/>
    </svg>`;
    // INACTIVE: low strawberry plant with leaves and a small red berry peeking
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 16 20">
      <!-- ground line -->
      <path d="M1 14 Q8 13.5 15 14" fill="none" stroke="${green}" stroke-width="1" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- plant leaves spreading low -->
      <path d="M8 13 Q5 11 3 9 Q2 8.5 3 8 Q4 8 5 9 Q7 11 8 12" fill="${green}" fill-opacity="${o * 0.5}" stroke="${green}" stroke-width="1.2" stroke-opacity="${o}" stroke-linejoin="round"/>
      <path d="M8 13 Q11 11 13 9 Q14 8.5 13 8 Q12 8 11 9 Q9 11 8 12" fill="${green}" fill-opacity="${o * 0.5}" stroke="${green}" stroke-width="1.2" stroke-opacity="${o}" stroke-linejoin="round"/>
      <!-- center leaf (upright) -->
      <path d="M8 13 Q7 10 8 8 Q9 10 8 13" fill="${green}" fill-opacity="${o * 0.6}" stroke="${green}" stroke-width="1" stroke-opacity="${o * 0.8}"/>
      <!-- small red strawberry peeking from under leaves -->
      <path d="M9.5 12.5 Q10.5 12 11 13 Q11 14.5 10 15 Q9 14.5 9 13.5 Q9 13 9.5 12.5Z" fill="${red}" fill-opacity="${o * 1.2}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.8}"/>
      <!-- tiny seed on berry -->
      <circle cx="10" cy="13.5" r="0.3" fill="${k}" fill-opacity="${o * 0.6}"/>
    </svg>`;
  },

  lightning(theme, activated = false) {
    // culture → #A78BFA
    const k = '#A78BFA';
    const o = activated ? 1 : 0.4;
    const blue = '#60A5FA';
    const yellow = '#FDE68A';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="-3 -2 20 28">
      <!-- BIG storm cloud — fills top third -->
      <ellipse cx="7" cy="5" rx="7" ry="5" fill="${k}" fill-opacity="${o * 0.25}" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.5}"/>
      <!-- cloud billows — tall and wide -->
      <circle cx="2.5" cy="4" r="3.5" fill="${k}" fill-opacity="${o * 0.22}" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.45}"/>
      <circle cx="7" cy="2.5" r="4" fill="${k}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.45}"/>
      <circle cx="11.5" cy="4" r="3.5" fill="${k}" fill-opacity="${o * 0.22}" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.45}"/>
      <!-- extra billow top center -->
      <circle cx="5" cy="1.5" r="2.5" fill="${k}" fill-opacity="${o * 0.15}"/>
      <circle cx="9" cy="1.5" r="2.5" fill="${k}" fill-opacity="${o * 0.15}"/>
      <!-- dark underbelly -->
      <ellipse cx="4.5" cy="7" rx="4.5" ry="2.5" fill="${k}" fill-opacity="${o * 0.18}"/>
      <ellipse cx="10" cy="7" rx="4" ry="2.5" fill="${k}" fill-opacity="${o * 0.15}"/>
      <!-- cloud texture curls -->
      <path d="M1 4.5 Q2.5 3.5 4 4.5" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.2}"/>
      <path d="M5 2 Q7 0.8 9 2" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.2}"/>
      <path d="M9.5 4.5 Q11 3.5 12.5 4.5" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.2}"/>
      <!-- MAIN lightning bolt -->
      <path d="M7.5 8 L5 14 L7 14 L4 23 L11 13 L8.5 13 L11 8 Z" fill="${yellow}" fill-opacity="${o * 0.7}" stroke="${blue}" stroke-width="1.5" stroke-opacity="${o}" stroke-linejoin="round"/>
      <!-- inner bolt highlight -->
      <path d="M7.8 9 L6.2 13 L7.5 13 L5.5 20 L9.5 13.5 L8.2 13.5 L10 9 Z" fill="${yellow}" fill-opacity="${o * 0.4}"/>
      <!-- left secondary bolt -->
      <path d="M2 9 L1 13 L2 13 L0.5 17 L4 12 L2.5 12 L3.5 9 Z" fill="${blue}" fill-opacity="${o * 0.5}" stroke="${blue}" stroke-width="0.8" stroke-opacity="${o * 0.6}" stroke-linejoin="round"/>
      <!-- right secondary bolt -->
      <path d="M11.5 10 L10.5 13.5 L11.5 13.5 L10 18 L13.5 13 L12.5 13 L13 10 Z" fill="${blue}" fill-opacity="${o * 0.45}" stroke="${blue}" stroke-width="0.8" stroke-opacity="${o * 0.55}" stroke-linejoin="round"/>
      <!-- ground impact glow -->
      <ellipse cx="4.5" cy="23" rx="3" ry="1" fill="${blue}" fill-opacity="${o * 0.15}"/>
      <ellipse cx="4.5" cy="23" rx="1.5" ry="0.6" fill="${yellow}" fill-opacity="${o * 0.2}"/>
      <!-- heavy rain streaks -->
      <line x1="0.5" y1="9" x2="0" y2="12.5" stroke="${blue}" stroke-width="0.7" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <line x1="2" y1="8.5" x2="1.5" y2="11.5" stroke="${blue}" stroke-width="0.6" stroke-opacity="${o * 0.25}" stroke-linecap="round"/>
      <line x1="4" y1="8" x2="3.5" y2="10.5" stroke="${blue}" stroke-width="0.6" stroke-opacity="${o * 0.22}" stroke-linecap="round"/>
      <line x1="10" y1="9" x2="9.5" y2="11.5" stroke="${blue}" stroke-width="0.6" stroke-opacity="${o * 0.22}" stroke-linecap="round"/>
      <line x1="12" y1="8.5" x2="11.5" y2="11" stroke="${blue}" stroke-width="0.6" stroke-opacity="${o * 0.25}" stroke-linecap="round"/>
      <line x1="13.5" y1="9" x2="13" y2="12" stroke="${blue}" stroke-width="0.7" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <line x1="6" y1="8" x2="5.5" y2="10" stroke="${blue}" stroke-width="0.5" stroke-opacity="${o * 0.18}" stroke-linecap="round"/>
      <line x1="8.5" y1="8.5" x2="8" y2="10.5" stroke="${blue}" stroke-width="0.5" stroke-opacity="${o * 0.18}" stroke-linecap="round"/>
      <!-- spark particles -->
      <circle cx="3" cy="18" r="0.5" fill="${yellow}" fill-opacity="${o * 0.3}"/>
      <circle cx="11" cy="15" r="0.4" fill="${yellow}" fill-opacity="${o * 0.25}"/>
      <circle cx="1" cy="15" r="0.35" fill="${blue}" fill-opacity="${o * 0.2}"/>
      <circle cx="12.5" cy="17" r="0.3" fill="${blue}" fill-opacity="${o * 0.2}"/>
    </svg>`;
    // INACTIVE: cloud with a few raindrops falling
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="-3 -2 20 28">
      <!-- cloud -->
      <ellipse cx="7" cy="8" rx="6" ry="3.5" fill="${k}" fill-opacity="${o * 0.35}" stroke="${k}" stroke-width="1.5" stroke-opacity="${o}" stroke-linecap="round"/>
      <circle cx="4" cy="7" r="2.5" fill="${k}" fill-opacity="${o * 0.25}"/>
      <circle cx="10" cy="7" r="2.5" fill="${k}" fill-opacity="${o * 0.2}"/>
      <!-- raindrops -->
      <line x1="5" y1="12" x2="4.5" y2="14.5" stroke="${blue}" stroke-width="0.8" stroke-opacity="${o * 0.8}" stroke-linecap="round"/>
      <line x1="9" y1="12.5" x2="8.5" y2="15" stroke="${blue}" stroke-width="0.8" stroke-opacity="${o * 0.8}" stroke-linecap="round"/>
      <line x1="7" y1="13" x2="6.5" y2="15" stroke="${blue}" stroke-width="0.7" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <!-- faint glow -->
      <circle cx="7" cy="17" r="1" fill="${blue}" fill-opacity="${o * 0.4}"/>
    </svg>`;
  },

  mermaid(theme, activated = false) {
    // culture → #A78BFA
    const k = '#A78BFA';
    const o = activated ? 1 : 0.4;
    const teal = '#2DD4BF';
    const skin = '#FBBF24';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
      <!-- water surface -->
      <path d="M0 12 Q4.5 11 9 12 Q13.5 13 18 12" fill="none" stroke="${teal}" stroke-width="1" stroke-opacity="${o * 0.4}" stroke-linecap="round"/>
      <path d="M0 13.5 Q4.5 12.5 9 13.5 Q13.5 14.5 18 13.5" fill="none" stroke="${teal}" stroke-width="0.8" stroke-opacity="${o * 0.2}" stroke-linecap="round"/>
      <!-- flowing hair -->
      <path d="M6 3 Q4 5 3 8 Q2.5 10 3 11" fill="none" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <path d="M7 2.5 Q5 5 4.5 8" fill="none" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.4}" stroke-linecap="round"/>
      <path d="M12 3 Q14 5 15 8 Q15.5 10 15 11" fill="none" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <path d="M11 2.5 Q13 5 13.5 8" fill="none" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.4}" stroke-linecap="round"/>
      <!-- head -->
      <circle cx="9" cy="3.5" r="2.8" fill="${k}" fill-opacity="${o * 0.25}" stroke="${k}" stroke-width="1.5" stroke-opacity="${o}"/>
      <!-- face details -->
      <circle cx="7.8" cy="3" r="0.5" fill="${k}" fill-opacity="${o * 0.8}"/>
      <circle cx="10.2" cy="3" r="0.5" fill="${k}" fill-opacity="${o * 0.8}"/>
      <path d="M8.5 4.5 Q9 5 9.5 4.5" fill="none" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- torso -->
      <path d="M7.5 6 Q7 8 7.5 10 Q8 11 9 11 Q10 11 10.5 10 Q11 8 10.5 6" fill="${k}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.8}"/>
      <!-- arms reaching up -->
      <path d="M7.5 7.5 Q5 6 3.5 7 Q3 7.5 4 8" fill="none" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <path d="M10.5 7.5 Q13 6 14.5 7 Q15 7.5 14 8" fill="none" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <!-- shell bikini detail -->
      <circle cx="8.2" cy="7.5" r="0.6" fill="${skin}" fill-opacity="${o * 0.5}" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
      <circle cx="9.8" cy="7.5" r="0.6" fill="${skin}" fill-opacity="${o * 0.5}" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
      <!-- tail — SINGLE center tail curving down, not two legs -->
      <path d="M9 11 Q9 14 8.5 16 Q8 18 8 20" fill="${teal}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="2.5" stroke-opacity="${o * 0.7}" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- tail scale texture -->
      <path d="M8 13 Q9 12.5 10 13" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.3}"/>
      <path d="M7.5 15.5 Q9 15 10 15.5" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.3}"/>
      <path d="M7.5 17.5 Q8.5 17 9.5 17.5" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.25}"/>
      <!-- tail fluke — two fins spreading out from bottom of single tail -->
      <path d="M8 20 Q5.5 21 4 22 Q3 22.5 3.5 21 Q4.5 19.5 7 19" fill="${teal}" fill-opacity="${o * 0.4}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.5}"/>
      <path d="M8 20 Q10.5 21 12 22 Q13 22.5 12.5 21 Q11.5 19.5 9 19" fill="${teal}" fill-opacity="${o * 0.4}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.5}"/>
      <!-- bubbles -->
      <circle cx="3" cy="14" r="0.6" fill="${teal}" fill-opacity="${o * 0.3}"/>
      <circle cx="15" cy="15" r="0.5" fill="${teal}" fill-opacity="${o * 0.25}"/>
      <circle cx="5" cy="22" r="0.5" fill="${teal}" fill-opacity="${o * 0.2}"/>
    </svg>`;
    // INACTIVE: mermaid tail fluke sticking up from water — thicker tail
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
      <path d="M0 14 Q4.5 13 9 14 Q13.5 15 18 14" fill="none" stroke="${teal}" stroke-width="1.2" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- thick tail rising out of water -->
      <path d="M9 14 Q9 11 10 8.5 Q10.5 7 10 6" fill="${k}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="2.5" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- fluke fins spread wide at top -->
      <path d="M10 6 Q7 4.5 4.5 3.5 Q3.5 3.5 4.5 5 Q6 6 9 7.5" fill="${teal}" fill-opacity="${o * 0.6}" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.8}" stroke-linejoin="round"/>
      <path d="M10 6 Q13 4.5 15.5 3.5 Q16.5 3.5 15.5 5 Q14 6 11 7.5" fill="${teal}" fill-opacity="${o * 0.6}" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.8}" stroke-linejoin="round"/>
      <!-- water drips -->
      <circle cx="7" cy="10" r="0.5" fill="${teal}" fill-opacity="${o * 0.5}"/>
      <circle cx="12.5" cy="11" r="0.4" fill="${teal}" fill-opacity="${o * 0.4}"/>
    </svg>`;
  },

  cigar(theme, activated = false) {
    // food → #FB923C
    const k = '#FB923C';
    const o = activated ? 1 : 0.4;
    const brown = '#92400E';
    const wood = '#D97706';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="10" viewBox="0 0 28 12">
      <!-- cigar body — tapered shape: wide at left (foot), pointed at right (cap) -->
      <path d="M3 4.5 Q2 4.5 2 6 Q2 7.5 3 7.5 L22 7 Q24 6.8 25 6 Q24 5.2 22 5 Z" fill="${brown}" fill-opacity="${o * 0.7}" stroke="${brown}" stroke-width="0.8" stroke-opacity="${o}"/>
      <!-- lighter inner wrapper -->
      <path d="M4 5 L21 5.3 Q23 5.5 23.5 6 Q23 6.5 21 6.7 L4 7 Q3.5 6 4 5 Z" fill="${wood}" fill-opacity="${o * 0.4}"/>
      <!-- cigar band — gold/orange ring near the cap -->
      <rect x="17" y="4.8" width="3.5" height="2.4" rx="0.5" fill="${k}" fill-opacity="${o * 0.8}" stroke="${brown}" stroke-width="0.5" stroke-opacity="${o * 0.6}"/>
      <!-- band emblem/text line -->
      <line x1="17.8" y1="6" x2="19.7" y2="6" stroke="${brown}" stroke-width="0.5" stroke-opacity="${o * 0.5}"/>
      <rect x="18" y="5.3" width="2" height="1" rx="0.3" fill="${brown}" fill-opacity="${o * 0.2}"/>
      <!-- diagonal leaf vein lines on wrapper -->
      <line x1="5" y1="5.2" x2="7" y2="7" stroke="${brown}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <line x1="8" y1="5.3" x2="10" y2="6.8" stroke="${brown}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <line x1="11" y1="5.3" x2="13" y2="6.7" stroke="${brown}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <line x1="14" y1="5.2" x2="15.5" y2="6.5" stroke="${brown}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <!-- flat cut foot end (left) — visible tobacco -->
      <ellipse cx="3" cy="6" rx="0.6" ry="1.5" fill="${wood}" fill-opacity="${o * 0.5}" stroke="${brown}" stroke-width="0.6" stroke-opacity="${o * 0.7}"/>
      <!-- cap tip (right) — rounded point -->
      <ellipse cx="24.5" cy="6" rx="0.5" ry="0.7" fill="${brown}" fill-opacity="${o * 0.8}"/>
    </svg>`;
    // INACTIVE: closed cigar box
    return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="10" viewBox="0 0 28 12">
      <rect x="4" y="3" width="20" height="7" rx="1" fill="${k}" fill-opacity="${o * 0.4}" stroke="${k}" stroke-width="1.5" stroke-opacity="${o}"/>
      <line x1="4" y1="5.5" x2="24" y2="5.5" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.5}"/>
      <rect x="10" y="4.5" width="8" height="2" rx="0.5" fill="${wood}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
    </svg>`;
  },

  dolphin(theme, activated = false) {
    // water → #2DD4BF
    const k = '#2DD4BF';
    const o = activated ? 1 : 0.4;
    const dark = '#0D9488';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="-1 -1 26 18">
      <!-- water -->
      <path d="M-1 14 Q6 13 12 14 Q18 15 25 14" fill="none" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <!-- DOLPHIN — sleek body with slight S-curve wiggle, facing right -->
      <!-- top contour: forehead dips, rises to dorsal area, tapers to tail -->
      <path d="M20 5 Q17 3.5 14 3.5 Q10 3.5 7 4.5 Q4 5.5 2 7 Q1 7.5 0 7" fill="none" stroke="${k}" stroke-width="1.3" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- bottom contour: chin slopes, belly curves gently, tapers to tail -->
      <path d="M23 6 Q21 7 18 8 Q14 9 10 9 Q6 8.5 3 7.5 Q1.5 7.5 0 7" fill="none" stroke="${k}" stroke-width="1.3" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- fill between contours -->
      <path d="M20 5 Q17 3.5 14 3.5 Q10 3.5 7 4.5 Q4 5.5 2 7 Q1 7.5 0 7 Q1.5 7.5 3 7.5 Q6 8.5 10 9 Q14 9 18 8 Q21 7 23 6 Q22 5.5 20 5 Z" fill="${k}" fill-opacity="${o * 0.3}"/>
      <!-- bottle nose/snout -->
      <path d="M20 5 Q22 4.5 23.5 5 Q24 5.5 23 6" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="1" stroke-opacity="${o}" stroke-linejoin="round"/>
      <!-- mouth line -->
      <path d="M21 6 L23.5 5.5" fill="none" stroke="${dark}" stroke-width="0.5" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- eye -->
      <circle cx="19" cy="5.3" r="0.6" fill="${dark}" fill-opacity="${o * 0.9}"/>
      <!-- dorsal fin — smooth curved hump, not sharp -->
      <path d="M12 3.5 Q11 1.5 10 0.5 Q11 1 12.5 2 Q13 2.5 14 3.5" fill="${k}" fill-opacity="${o * 0.5}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.8}" stroke-linejoin="round"/>
      <!-- pectoral flipper -->
      <path d="M15 8 Q14 10.5 15.5 11" fill="none" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- tail flukes -->
      <path d="M0 7 Q-1 5.5 -0.5 4.5 Q0 5.5 0.5 6.5" fill="${k}" fill-opacity="${o * 0.4}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.6}"/>
      <path d="M0 7 Q-1 8.5 -0.5 9.5 Q0 8.5 0.5 7.5" fill="${k}" fill-opacity="${o * 0.4}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.6}"/>
      <!-- belly highlight -->
      <path d="M6 7.5 Q10 8.5 16 7.5" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.15}" stroke-linecap="round"/>
    </svg>`;
    // INACTIVE: smooth back arc + rounded dorsal fin breaking water
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="-1 -1 26 18">
      <path d="M-1 10 Q6 9 12 10 Q18 11 25 10" fill="none" stroke="${k}" stroke-width="1.2" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- sleek curved back with gentle wiggle breaking the surface -->
      <path d="M6 10 Q8 9 10 8 Q12 7 14 7.5 Q16 8.5 18 10" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <!-- smooth rounded dorsal fin — one curved stroke, not pointy -->
      <path d="M11 7.5 Q10.5 5 10 3.5 Q10.5 3 11.5 4.5 Q12.5 6 13 7.5" fill="${k}" fill-opacity="${o * 0.5}" stroke="${k}" stroke-width="1" stroke-opacity="${o}" stroke-linejoin="round"/>
      <!-- small splash -->
      <circle cx="18.5" cy="9.5" r="0.4" fill="${k}" fill-opacity="${o * 0.4}"/>
    </svg>`;
  },

  pelican(theme, activated = false) {
    // bird → #38BDF8
    const k = '#38BDF8';
    const o = activated ? 1 : 0.4;
    const yellow = '#FBBF24';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="-1 -1 20 24">
      <!-- pier post -->
      <rect x="7" y="17" width="4" height="5" rx="0.5" fill="${k}" fill-opacity="${o * 0.15}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.3}"/>
      <!-- big round body (side profile) -->
      <ellipse cx="9" cy="12" rx="5" ry="5" fill="${k}" fill-opacity="${o * 0.25}" stroke="${k}" stroke-width="1.5" stroke-opacity="${o}"/>
      <!-- wing folded on body -->
      <path d="M6 9 Q9 8 12 10 Q13 12 12 14 Q9 15 6 13 Z" fill="${k}" fill-opacity="${o * 0.15}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.3}"/>
      <!-- wing feather lines -->
      <path d="M7 10.5 Q9 10 11 11" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
      <path d="M7 12 Q9 11.5 11 12.5" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
      <!-- long S-curved neck -->
      <path d="M9 7 Q8 4 7 2 Q6.5 0.5 7.5 0 Q9 0 9 1.5" fill="none" stroke="${k}" stroke-width="2" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- head (small, at top of neck) -->
      <circle cx="8" cy="0.8" r="1.5" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="1.3" stroke-opacity="${o}"/>
      <!-- eye -->
      <circle cx="7.5" cy="0.5" r="0.5" fill="${k}" fill-opacity="${o * 0.9}"/>
      <!-- LONG beak — top mandible -->
      <path d="M9 0.8 L17 2.5" fill="none" stroke="${k}" stroke-width="1.5" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- beak hook at tip -->
      <path d="M17 2.5 Q17.5 3 17 3.5" fill="none" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <!-- BIG droopy pouch hanging way below beak -->
      <path d="M9 1.5 Q11 5.5 14 6 Q16 5.5 17 3.5" fill="${yellow}" fill-opacity="${o * 0.4}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.6}" stroke-linejoin="round"/>
      <!-- pouch texture lines -->
      <path d="M10 3 Q12 5 14 4.5" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
      <path d="M11 4 Q13 5.5 15 4" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.15}"/>
      <!-- short legs on post -->
      <line x1="8" y1="17" x2="8" y2="15" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <line x1="10" y1="17" x2="10" y2="15.5" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <!-- webbed feet -->
      <path d="M7 17 L6 17.5 L8 17.5 L9 17" fill="${yellow}" fill-opacity="${o * 0.4}" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
      <path d="M9.5 17 L9 17.5 L11 17.5 L11.5 17" fill="${yellow}" fill-opacity="${o * 0.4}" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
    </svg>`;
    // INACTIVE: pelican on a post — chunky body, clear neck + drooping beak/pouch
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="-1 -1 20 24">
      <!-- post -->
      <rect x="7.5" y="15" width="3" height="5" rx="0.3" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.5}"/>
      <!-- chunky round body -->
      <ellipse cx="9" cy="12" rx="4" ry="3.5" fill="${k}" fill-opacity="${o * 0.35}" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.7}"/>
      <!-- neck stub going up -->
      <path d="M9 8.5 Q8 7 8 5.5" fill="none" stroke="${k}" stroke-width="1.8" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <!-- small head -->
      <circle cx="8" cy="5" r="1.3" fill="${k}" fill-opacity="${o * 0.4}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.6}"/>
      <!-- long beak + hanging pouch shape -->
      <path d="M9 5 L15 6.5" fill="none" stroke="${k}" stroke-width="1.3" stroke-opacity="${o}" stroke-linecap="round"/>
      <path d="M9 5.5 Q12 8 15 6.5" fill="${yellow}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.4}"/>
    </svg>`;
  },

  osprey(theme, activated = false) {
    // bird → #38BDF8
    const k = '#38BDF8';
    const o = activated ? 1 : 0.4;
    const brown = '#92400E';
    const yellow = '#FBBF24';
    const white = '#F0F9FF';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="-1 -1 24 24">
      <!-- wings spread — broad raptor wings -->
      <path d="M11 7 Q7 4 3 2 Q1 1 0 2 Q1 4 4 5.5 Q7 7 9 8" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="1.3" stroke-opacity="${o * 0.8}" stroke-linejoin="round"/>
      <path d="M11 7 Q15 4 19 2 Q21 1 22 2 Q21 4 18 5.5 Q15 7 13 8" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="1.3" stroke-opacity="${o * 0.8}" stroke-linejoin="round"/>
      <!-- wing feather barring -->
      <line x1="4" y1="3" x2="6" y2="5" stroke="${brown}" stroke-width="0.5" stroke-opacity="${o * 0.3}"/>
      <line x1="2" y1="2.5" x2="4.5" y2="4.5" stroke="${brown}" stroke-width="0.5" stroke-opacity="${o * 0.25}"/>
      <line x1="7" y1="4.5" x2="8.5" y2="6.5" stroke="${brown}" stroke-width="0.5" stroke-opacity="${o * 0.25}"/>
      <line x1="18" y1="3" x2="16" y2="5" stroke="${brown}" stroke-width="0.5" stroke-opacity="${o * 0.3}"/>
      <line x1="20" y1="2.5" x2="17.5" y2="4.5" stroke="${brown}" stroke-width="0.5" stroke-opacity="${o * 0.25}"/>
      <line x1="15" y1="4.5" x2="13.5" y2="6.5" stroke="${brown}" stroke-width="0.5" stroke-opacity="${o * 0.25}"/>
      <!-- body -->
      <ellipse cx="11" cy="11" rx="3" ry="4" fill="${k}" fill-opacity="${o * 0.25}" stroke="${k}" stroke-width="1.5" stroke-opacity="${o}"/>
      <!-- white breast patch -->
      <ellipse cx="11" cy="10" rx="2" ry="2.5" fill="${white}" fill-opacity="${o * 0.15}"/>
      <!-- head — white with dark eye stripe -->
      <circle cx="11" cy="5" r="2.2" fill="${white}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="1.3" stroke-opacity="${o}"/>
      <!-- dark eye stripe (osprey's distinctive mask) -->
      <path d="M9.5 4.5 Q8 5 7 6" fill="none" stroke="${brown}" stroke-width="1.2" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <path d="M12.5 4.5 Q14 5 15 6" fill="none" stroke="${brown}" stroke-width="1.2" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <!-- eyes -->
      <circle cx="10" cy="4.5" r="0.6" fill="${yellow}" fill-opacity="${o * 0.9}"/>
      <circle cx="10" cy="4.5" r="0.25" fill="${brown}" fill-opacity="${o}"/>
      <circle cx="12" cy="4.5" r="0.6" fill="${yellow}" fill-opacity="${o * 0.9}"/>
      <circle cx="12" cy="4.5" r="0.25" fill="${brown}" fill-opacity="${o}"/>
      <!-- hooked beak -->
      <path d="M11 6 L12.5 7 Q13 7.5 12.5 8 L11.5 7.5" fill="${k}" fill-opacity="${o * 0.5}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.7}"/>
      <!-- tail feathers -->
      <path d="M9.5 15 Q10 16 9 17.5" fill="none" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <path d="M11 15 Q11 16 11 17.5" fill="none" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <path d="M12.5 15 Q12 16 13 17.5" fill="none" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- talons with fish -->
      <line x1="9.5" y1="14.5" x2="7.5" y2="18" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <line x1="12.5" y1="14.5" x2="14.5" y2="18" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <!-- taloned feet -->
      <path d="M7.5 18 L6.5 19 M7.5 18 L7.5 19.5 M7.5 18 L8.5 19" fill="none" stroke="${yellow}" stroke-width="0.8" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <path d="M14.5 18 L13.5 19 M14.5 18 L14.5 19.5 M14.5 18 L15.5 19" fill="none" stroke="${yellow}" stroke-width="0.8" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <!-- small fish in talons -->
      <path d="M8 20 Q10 19.5 12 20 Q13 20 14 20.5 L13.5 20 L14 19.5" fill="#2DD4BF" fill-opacity="${o * 0.25}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.4}"/>
    </svg>`;
    // INACTIVE: soaring V silhouette
    return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="-1 -1 24 24">
      <path d="M2 7 Q5 4 11 5.5 Q17 4 20 7" fill="none" stroke="${k}" stroke-width="1.5" stroke-opacity="${o}" stroke-linecap="round"/>
      <ellipse cx="11" cy="6.5" rx="1.2" ry="1.5" fill="${k}" fill-opacity="${o * 0.5}"/>
    </svg>`;
  },

  sandhillCrane(theme, activated = false) {
    // bird → #38BDF8
    const k = '#38BDF8';
    const o = activated ? 1 : 0.4;
    const gray = '#6B7280';
    const red = '#EF4444';
    const green = '#4ADE80';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
      <!-- grass -->
      <path d="M0 22 Q4 21 9 22 Q14 23 18 22" fill="none" stroke="${green}" stroke-width="0.6" stroke-opacity="${o * 0.3}"/>
      <!-- long stilt legs -->
      <line x1="7.5" y1="15" x2="6" y2="21.5" stroke="${gray}" stroke-width="1" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <line x1="10.5" y1="15" x2="12" y2="21.5" stroke="${gray}" stroke-width="1" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <!-- feet -->
      <path d="M5 21.5 L6 21.5 L7 21.5" fill="none" stroke="${gray}" stroke-width="0.6" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <path d="M11 21.5 L12 21.5 L13 21.5" fill="none" stroke="${gray}" stroke-width="0.6" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- chunky body -->
      <ellipse cx="9" cy="13" rx="4" ry="3" fill="${k}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="1.3" stroke-opacity="${o}"/>
      <!-- tail feathers drooping back -->
      <path d="M5 13 Q3 14 2 15 Q2.5 14.5 4 13.5" fill="${gray}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.5}"/>
      <!-- long S-curved neck -->
      <path d="M9 10 Q9 8 8.5 6 Q8 4 8 3" fill="none" stroke="${k}" stroke-width="1.8" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- small head -->
      <circle cx="8" cy="2.5" r="1.5" fill="${k}" fill-opacity="${o * 0.25}" stroke="${k}" stroke-width="1.2" stroke-opacity="${o}"/>
      <!-- red crown patch — the defining feature -->
      <ellipse cx="8" cy="1.8" rx="1" ry="0.6" fill="${red}" fill-opacity="${o * 0.7}"/>
      <!-- eye -->
      <circle cx="7.3" cy="2.5" r="0.4" fill="${k}" fill-opacity="${o * 0.9}"/>
      <!-- long straight beak -->
      <path d="M9 2.8 L13 3.5" fill="none" stroke="${k}" stroke-width="1.2" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- wing detail on body -->
      <path d="M7 11 Q9 10.5 11 11.5" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.25}"/>
      <path d="M6.5 12.5 Q9 12 11.5 13" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
      <!-- small wing appendage — right side -->
      <path d="M12.5 12 Q14.5 10 16 9" fill="none" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
    </svg>`;
    // INACTIVE: silhouette of the bird — small body blob on stilt legs with long neck hint
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
      <path d="M0 22 Q4 21 9 22 Q14 23 18 22" fill="none" stroke="${green}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
      <!-- stilt legs -->
      <line x1="8" y1="17" x2="7" y2="22" stroke="${k}" stroke-width="0.8" stroke-opacity="${o}" stroke-linecap="round"/>
      <line x1="10" y1="17" x2="11" y2="22" stroke="${k}" stroke-width="0.8" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- body blob -->
      <ellipse cx="9" cy="15.5" rx="3" ry="2" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.6}"/>
      <!-- neck going up -->
      <path d="M9 13.5 Q9 11 8.5 9" fill="none" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- head -->
      <circle cx="8.5" cy="8.5" r="1" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.5}"/>
      <!-- beak hint -->
      <path d="M9.2 8.8 L11 9.2" fill="none" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.4}" stroke-linecap="round"/>
    </svg>`;
  },

  gopherTortoise(theme, activated = false) {
    // land → #4ADE80
    const k = '#4ADE80';
    const o = activated ? 1 : 0.4;
    const brown = '#92400E';
    const dark = '#166534';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16">
      <!-- ground line -->
      <path d="M0 14 L20 14" stroke="${brown}" stroke-width="0.5" stroke-opacity="${o * 0.3}"/>
      <!-- high dome shell — the defining gopher tortoise feature -->
      <path d="M5 11 Q5 4 10 3 Q15 4 15 11" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="1.3" stroke-opacity="${o}"/>
      <!-- shell scute pattern (hexagonal plates) -->
      <path d="M7 7 Q10 5.5 13 7" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.3}"/>
      <path d="M6 9 Q10 7.5 14 9" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.25}"/>
      <line x1="10" y1="3.5" x2="10" y2="10" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
      <line x1="7.5" y1="5.5" x2="6.5" y2="10" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.15}"/>
      <line x1="12.5" y1="5.5" x2="13.5" y2="10" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.15}"/>
      <!-- head poking out left — blocky, tortoise-like -->
      <ellipse cx="3" cy="9.5" rx="2.5" ry="1.8" fill="${k}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.8}"/>
      <!-- eye -->
      <circle cx="2" cy="9" r="0.5" fill="${dark}" fill-opacity="${o * 0.8}"/>
      <!-- mouth -->
      <path d="M1 10.5 Q2 10.8 3 10.5" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.4}" stroke-linecap="round"/>
      <!-- stubby front leg — coming from under shell edge -->
      <path d="M6 11 Q4.5 12 3.5 13.5" stroke="${k}" stroke-width="1.8" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <path d="M3.5 13.5 L2.5 13.5 L3 14 L4 13.5" fill="none" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.4}"/>
      <!-- stubby back leg -->
      <path d="M14 11 Q15.5 12 16.5 13.5" stroke="${k}" stroke-width="1.8" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <path d="M16.5 13.5 L17.5 13.5 L17 14 L16 13.5" fill="none" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.4}"/>
      <!-- small tail -->
      <path d="M15 11 Q16 11 17 11.5" fill="none" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.4}" stroke-linecap="round"/>
    </svg>`;
    // INACTIVE: dome shell shape on ground
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16">
      <path d="M0 13 L20 13" stroke="${brown}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <path d="M5 13 Q5 6 10 5 Q15 6 15 13" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="1.2" stroke-opacity="${o}"/>
      <!-- hint of head -->
      <ellipse cx="3.5" cy="11.5" rx="1.5" ry="1" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.5}"/>
    </svg>`;
  },

  alligator(theme, activated = false) {
    // land → #4ADE80
    const k = '#4ADE80';
    const o = activated ? 1 : 0.4;
    const dark = '#166534';
    const teal = '#2DD4BF';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="22" viewBox="-1 -1 28 24">
      <!-- ground/water line -->
      <path d="M-1 16 Q6 15 13 16 Q20 17 27 16" fill="none" stroke="${teal}" stroke-width="0.5" stroke-opacity="${o * 0.25}"/>
      <!-- === GATOR: long horizontal body on ground, tail curving UP === -->
      <!-- long flat body stretching across the ground -->
      <path d="M0 14 Q5 13 10 13.5 Q15 13 20 13.5" fill="${k}" fill-opacity="${o * 0.25}" stroke="${k}" stroke-width="2" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- belly -->
      <path d="M1 15 Q5 15.5 10 15 Q15 15.5 20 15" fill="${k}" fill-opacity="${o * 0.1}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.3}"/>
      <!-- armored spine scutes along the back -->
      <path d="M2 12.5 L3 11.5 L4 12.5" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.4}"/>
      <path d="M5 12 L6 11 L7 12" fill="${k}" fill-opacity="${o * 0.25}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.4}"/>
      <path d="M8 11.8 L9 10.8 L10 11.8" fill="${k}" fill-opacity="${o * 0.25}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.35}"/>
      <path d="M11 12 L12 11 L13 12" fill="${k}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.3}"/>
      <path d="M14 12.2 L15 11.2 L16 12.2" fill="${k}" fill-opacity="${o * 0.15}" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.25}"/>
      <!-- wide powerful head — right end -->
      <path d="M20 13.5 Q22 12 23 11.5 Q24 11.5 24.5 12.5 Q24 13.5 23 14 Q22 14.5 20 14" fill="${k}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="1.3" stroke-opacity="${o * 0.8}"/>
      <!-- long snout with open jaws -->
      <path d="M24 12 L27 10.5" fill="none" stroke="${k}" stroke-width="1.8" stroke-opacity="${o}" stroke-linecap="round"/>
      <path d="M24 13.5 L27 15" fill="none" stroke="${k}" stroke-width="1.8" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- teeth -->
      <path d="M25 11 L25.2 10.3 M25.8 10.8 L26 10 M26.5 10.5 L26.7 9.8" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.5}"/>
      <path d="M25 14 L25.2 14.7 M25.8 14.2 L26 15 M26.5 14.8 L26.7 15.5" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.5}"/>
      <!-- nostril -->
      <circle cx="27" cy="11" r="0.4" fill="${k}" fill-opacity="${o * 0.5}"/>
      <!-- eye — protruding bump -->
      <circle cx="22" cy="11.5" r="0.9" fill="${dark}" fill-opacity="${o * 0.9}" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.5}"/>
      <circle cx="22" cy="11.5" r="0.3" fill="#000" fill-opacity="${o * 0.6}"/>
      <!-- TAIL curving UP from the left end — the dramatic element -->
      <path d="M0 14 Q-1 13 -0.5 11 Q0 9 1 7 Q2 5 3 4" fill="none" stroke="${k}" stroke-width="2.5" stroke-opacity="${o * 0.8}" stroke-linecap="round"/>
      <!-- tail scutes -->
      <path d="M0 11.5 L-0.5 10.5 L0.5 11" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <path d="M1 8.5 L0.5 7.5 L1.5 8" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <path d="M2 6 L1.5 5 L2.5 5.5" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.25}"/>
      <!-- tail tip -->
      <path d="M3 4 Q3.5 3 4 2.5" fill="none" stroke="${k}" stroke-width="1.5" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- front legs (near head) -->
      <path d="M18 14.5 Q17.5 16 17 17" stroke="${k}" stroke-width="1.3" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <path d="M17 17 L16 17.5 M17 17 L17 18 M17 17 L18 17.5" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
      <!-- back legs -->
      <path d="M6 14.5 Q5.5 16 5 17" stroke="${k}" stroke-width="1.3" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <path d="M5 17 L4 17.5 M5 17 L5 18 M5 17 L6 17.5" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
    </svg>`;
    // INACTIVE: two eyes poking above water line
    return `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="22" viewBox="-1 -1 28 24">
      <path d="M-1 12 Q6 11 13 12 Q20 13 27 12" fill="none" stroke="${teal}" stroke-width="0.6" stroke-opacity="${o}"/>
      <!-- two bumpy eyes just above water -->
      <circle cx="16" cy="11" r="1" fill="${k}" fill-opacity="${o * 0.4}" stroke="${k}" stroke-width="0.7" stroke-opacity="${o * 0.6}"/>
      <circle cx="20" cy="11" r="1" fill="${k}" fill-opacity="${o * 0.4}" stroke="${k}" stroke-width="0.7" stroke-opacity="${o * 0.6}"/>
      <circle cx="16" cy="10.7" r="0.35" fill="${dark}" fill-opacity="${o * 0.5}"/>
      <circle cx="20" cy="10.7" r="0.35" fill="${dark}" fill-opacity="${o * 0.5}"/>
      <!-- hint of snout ridge ahead -->
      <path d="M21.5 11.5 L24 11.5" fill="none" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.3}"/>
    </svg>`;
  },

  roseateSpoonbill(theme, activated = false) {
    // bird → #38BDF8
    const k = '#38BDF8';
    const o = activated ? 1 : 0.4;
    const pink = '#F472B6';
    const teal = '#2DD4BF';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22">
      <!-- shallow water -->
      <path d="M0 18 Q5 17 10 18 Q15 19 20 18" fill="none" stroke="${teal}" stroke-width="0.5" stroke-opacity="${o * 0.3}"/>
      <!-- long wading legs -->
      <line x1="9" y1="14" x2="7.5" y2="18" stroke="${pink}" stroke-width="0.8" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <line x1="11" y1="14" x2="12.5" y2="18" stroke="${pink}" stroke-width="0.8" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <!-- round pink body -->
      <ellipse cx="10" cy="12" rx="4" ry="3" fill="${pink}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="1.2" stroke-opacity="${o}"/>
      <!-- wing with hot pink tips -->
      <path d="M7 10 Q10 9 13 10.5" fill="none" stroke="${pink}" stroke-width="0.8" stroke-opacity="${o * 0.4}"/>
      <path d="M6.5 11.5 Q10 10.5 13.5 12" fill="none" stroke="${pink}" stroke-width="0.5" stroke-opacity="${o * 0.3}"/>
      <!-- bright pink wing edges -->
      <path d="M6 12 Q5 13 4.5 14" fill="none" stroke="${pink}" stroke-width="1" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <path d="M14 12 Q15 13 15.5 14" fill="none" stroke="${pink}" stroke-width="1" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <!-- neck curving down (feeding posture, head near water) -->
      <path d="M10 9 Q9 7 8 5.5 Q7 4 7 3" fill="none" stroke="${k}" stroke-width="1.5" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- small head -->
      <circle cx="7" cy="2.5" r="1.3" fill="${pink}" fill-opacity="${o * 0.25}" stroke="${k}" stroke-width="1" stroke-opacity="${o}"/>
      <!-- eye -->
      <circle cx="6.5" cy="2.2" r="0.4" fill="${k}" fill-opacity="${o * 0.9}"/>
      <!-- THE SPOON BILL — flat, wide, rounded end -->
      <path d="M8 2.8 L12 3.5 Q13.5 3.5 13.5 4.5 Q13.5 5.5 12 5.5 L8 4" fill="${pink}" fill-opacity="${o * 0.25}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.7}" stroke-linejoin="round"/>
      <!-- short tail -->
      <path d="M6 13 Q5 14 4 14.5" fill="none" stroke="${pink}" stroke-width="0.8" stroke-opacity="${o * 0.4}" stroke-linecap="round"/>
    </svg>`;
    // INACTIVE: spoon-shaped bill hint + pink blob
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22">
      <path d="M0 16 Q5 15 10 16 Q15 17 20 16" fill="none" stroke="${teal}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
      <!-- pink blob body -->
      <ellipse cx="10" cy="12" rx="3" ry="2" fill="${pink}" fill-opacity="${o * 0.35}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.6}"/>
      <!-- spoon-shaped bill sticking out — the key identifier -->
      <path d="M12 11 L16 10.5 Q17.5 10.5 17.5 11.5 Q17.5 12.5 16 12.5 L12 12" fill="${pink}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.5}" stroke-linejoin="round"/>
      <!-- thin legs -->
      <line x1="9" y1="14" x2="8" y2="16" stroke="${pink}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
      <line x1="11" y1="14" x2="12" y2="16" stroke="${pink}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
    </svg>`;
  },

  seaTurtle(theme, activated = false) {
    // water → #2DD4BF
    const k = '#2DD4BF';
    const o = activated ? 1 : 0.4;
    const dark = '#0D9488';
    const brown = '#92400E';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18">
      <!-- oval shell — top-down view -->
      <ellipse cx="11" cy="9" rx="5.5" ry="4.5" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="1.3" stroke-opacity="${o}"/>
      <!-- shell scute pattern — center vertebral scutes -->
      <path d="M11 4.5 L11 13.5" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.25}"/>
      <path d="M9 5.5 Q11 4.5 13 5.5" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
      <path d="M8 7.5 Q11 6 14 7.5" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
      <path d="M8 10.5 Q11 9 14 10.5" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
      <path d="M9 12.5 Q11 11.5 13 12.5" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
      <!-- head — small oval poking out front-left -->
      <ellipse cx="4.5" cy="7" rx="2" ry="1.3" fill="${k}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.8}"/>
      <!-- eye -->
      <circle cx="3.8" cy="6.5" r="0.4" fill="${dark}" fill-opacity="${o * 0.8}"/>
      <!-- front left flipper — long paddle shape -->
      <path d="M7 6 Q4 3 1 2.5 Q2.5 4 5.5 6" fill="${k}" fill-opacity="${o * 0.25}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.6}" stroke-linejoin="round"/>
      <!-- front right flipper -->
      <path d="M7 12 Q4 15 1 15.5 Q2.5 14 5.5 12" fill="${k}" fill-opacity="${o * 0.25}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.6}" stroke-linejoin="round"/>
      <!-- rear left flipper — shorter -->
      <path d="M15 6.5 Q18 4 20 4 Q19 5.5 16 6.5" fill="${k}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.5}" stroke-linejoin="round"/>
      <!-- rear right flipper -->
      <path d="M15 11.5 Q18 14 20 14 Q19 12.5 16 11.5" fill="${k}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.5}" stroke-linejoin="round"/>
      <!-- small tail -->
      <path d="M16.5 9 Q18 9 19 8.5" fill="none" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
    </svg>`;
    // INACTIVE: oval shell with all four flippers + head showing
    return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18">
      <ellipse cx="11" cy="9" rx="5" ry="4" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="1" stroke-opacity="${o}"/>
      <!-- head poking out -->
      <ellipse cx="5" cy="7.5" rx="1.3" ry="0.9" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.5}"/>
      <!-- front left flipper -->
      <path d="M7 6 Q4.5 4 2.5 3.5" fill="none" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- front right flipper -->
      <path d="M7 12 Q4.5 14 2.5 14.5" fill="none" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- rear left flipper -->
      <path d="M15 7 Q17 5.5 18.5 5.5" fill="none" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.4}" stroke-linecap="round"/>
      <!-- rear right flipper -->
      <path d="M15 11 Q17 12.5 18.5 12.5" fill="none" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.4}" stroke-linecap="round"/>
      <!-- tiny tail -->
      <path d="M16 9 L17.5 9" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
    </svg>`;
  },

  // --- Batch 2: Landmarks & Sports ---

  skywayBridge(theme, activated = false) {
    // landmark → #FBBF24
    const k = '#FBBF24';
    const o = activated ? 1 : 0.4;
    const water = '#2DD4BF';
    const steel = '#94A3B8';
    const concrete = '#CBD5E1';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="16" viewBox="0 0 30 16">
      <!-- water background -->
      <path d="M0 13 Q8 11.5 15 12.5 Q22 13.5 30 12" fill="${water}" fill-opacity="${o * 0.08}"/>
      <path d="M0 14.5 Q8 13 15 14 Q22 15 30 13.5" fill="none" stroke="${water}" stroke-width="0.5" stroke-opacity="${o * 0.3}"/>
      <path d="M0 13 Q8 11.5 15 12.5 Q22 13.5 30 12" fill="none" stroke="${water}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
      <!-- main deck — gentle arc -->
      <path d="M0 10.5 Q8 9 15 9.5 Q22 10 30 10.5" fill="none" stroke="${concrete}" stroke-width="1.5" stroke-opacity="${o * 0.8}"/>
      <!-- center pylon (tall) -->
      <rect x="14" y="2" width="2" height="8" rx="0.3" fill="${k}" fill-opacity="${o * 0.5}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.8}"/>
      <!-- pylon cap -->
      <rect x="13.5" y="1.5" width="3" height="1" rx="0.3" fill="${k}" fill-opacity="${o * 0.7}"/>
      <!-- cable stays — left fan -->
      <line x1="15" y1="2.5" x2="4" y2="10" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.7}"/>
      <line x1="15" y1="3.5" x2="7" y2="9.5" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.6}"/>
      <line x1="15" y1="4.5" x2="10" y2="9.5" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.5}"/>
      <!-- cable stays — right fan -->
      <line x1="15" y1="2.5" x2="26" y2="10" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.7}"/>
      <line x1="15" y1="3.5" x2="23" y2="9.5" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.6}"/>
      <line x1="15" y1="4.5" x2="20" y2="9.5" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.5}"/>
      <!-- deck support piers -->
      <rect x="5" y="10" width="1.5" height="3" rx="0.2" fill="${steel}" fill-opacity="${o * 0.4}"/>
      <rect x="23.5" y="10" width="1.5" height="3" rx="0.2" fill="${steel}" fill-opacity="${o * 0.4}"/>
      <rect x="10" y="9.5" width="1" height="3" rx="0.2" fill="${steel}" fill-opacity="${o * 0.3}"/>
      <rect x="19" y="9.5" width="1" height="3" rx="0.2" fill="${steel}" fill-opacity="${o * 0.3}"/>
      <!-- deck railing details -->
      <path d="M0 10" fill="none" stroke="${steel}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <!-- tiny cars on deck -->
      <rect x="7" y="9" width="1.5" height="0.8" rx="0.3" fill="${k}" fill-opacity="${o * 0.3}"/>
      <rect x="20" y="9.2" width="1.5" height="0.8" rx="0.3" fill="${k}" fill-opacity="${o * 0.25}"/>
    </svg>`;
    // INACTIVE: bridge silhouette with faint cables
    return `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="16" viewBox="0 0 30 16">
      <path d="M0 11 Q8 9.5 15 10 Q22 10.5 30 11" fill="none" stroke="${k}" stroke-width="1.2" stroke-opacity="${o}"/>
      <rect x="14" y="4" width="2" height="6.5" rx="0.3" fill="${k}" fill-opacity="${o * 0.5}"/>
      <line x1="15" y1="5" x2="7" y2="10" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.5}"/>
      <line x1="15" y1="5" x2="23" y2="10" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.5}"/>
      <path d="M0 14 Q8 12.5 15 13.5 Q22 14.5 30 13" fill="none" stroke="${water}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
    </svg>`;
  },

  spongeDiver(theme, activated = false) {
    // water → #2DD4BF
    const k = '#2DD4BF';
    const o = activated ? 1 : 0.4;
    const suit = '#1E3A5F';
    const brass = '#D4A04A';
    const sponge = '#D4A04A';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 16 24">
      <!-- water surface -->
      <path d="M0 3 Q4 2 8 3 Q12 4 16 3" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.3}"/>
      <!-- air hose going up from helmet -->
      <path d="M8 6.5 Q6 4 4 2 Q3 1.5 2 1" fill="none" stroke="${brass}" stroke-width="0.6" stroke-opacity="${o * 0.4}" stroke-linecap="round"/>
      <!-- diving helmet — big round brass -->
      <circle cx="8" cy="8" r="2.8" fill="${brass}" fill-opacity="${o * 0.3}" stroke="${brass}" stroke-width="1" stroke-opacity="${o * 0.8}"/>
      <!-- helmet viewport (round glass) -->
      <circle cx="8" cy="8" r="1.5" fill="${k}" fill-opacity="${o * 0.15}" stroke="${brass}" stroke-width="0.5" stroke-opacity="${o * 0.6}"/>
      <!-- helmet bolts -->
      <circle cx="5.5" cy="7.5" r="0.35" fill="${brass}" fill-opacity="${o * 0.6}"/>
      <circle cx="10.5" cy="7.5" r="0.35" fill="${brass}" fill-opacity="${o * 0.6}"/>
      <circle cx="8" cy="10.5" r="0.35" fill="${brass}" fill-opacity="${o * 0.6}"/>
      <!-- diving suit body -->
      <path d="M6 10.5 L5.5 17 Q5.5 17.5 6 17.5 L10 17.5 Q10.5 17.5 10.5 17 L10 10.5" fill="${suit}" fill-opacity="${o * 0.35}" stroke="${k}" stroke-width="0.7" stroke-opacity="${o * 0.5}"/>
      <!-- suit belt -->
      <rect x="5.5" y="12.5" width="5" height="0.8" rx="0.2" fill="${brass}" fill-opacity="${o * 0.5}"/>
      <!-- arms reaching out -->
      <path d="M6 12 L3 14 L2 13" fill="none" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <path d="M10 12 L13 14 L14 13" fill="none" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- sponge in right hand -->
      <ellipse cx="14" cy="12.5" rx="1.5" ry="1.2" fill="${sponge}" fill-opacity="${o * 0.4}" stroke="${sponge}" stroke-width="0.5" stroke-opacity="${o * 0.5}"/>
      <circle cx="13.5" cy="12" r="0.3" fill="${sponge}" fill-opacity="${o * 0.2}"/>
      <circle cx="14.5" cy="13" r="0.25" fill="${sponge}" fill-opacity="${o * 0.2}"/>
      <!-- boots -->
      <path d="M5.5 17.5 L5 19 Q4.5 19.5 5 19.5 L7 19.5 L7 17.5" fill="${suit}" fill-opacity="${o * 0.4}" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
      <path d="M10.5 17.5 L11 19 Q11.5 19.5 11 19.5 L9 19.5 L9 17.5" fill="${suit}" fill-opacity="${o * 0.4}" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
      <!-- bubbles rising -->
      <circle cx="5" cy="5" r="0.6" fill="${k}" fill-opacity="${o * 0.25}"/>
      <circle cx="6.5" cy="3.5" r="0.45" fill="${k}" fill-opacity="${o * 0.2}"/>
      <circle cx="4" cy="2" r="0.35" fill="${k}" fill-opacity="${o * 0.15}"/>
      <!-- seafloor -->
      <path d="M0 21 Q4 20 8 21 Q12 22 16 21" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.2}"/>
      <path d="M2 21.5 L2.5 19.5 L3 21" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
      <path d="M12 21 L12.5 19 L13 21.5" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
    </svg>`;
    // INACTIVE: bubbles rising with faint helmet silhouette
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 16 24">
      <circle cx="8" cy="10" r="2.5" fill="${k}" fill-opacity="${o * 0.15}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o}"/>
      <circle cx="8" cy="10" r="1.2" fill="${k}" fill-opacity="${o * 0.1}" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.5}"/>
      <path d="M6.5 12.5 L6.5 16" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.4}"/>
      <path d="M9.5 12.5 L9.5 16" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.4}"/>
      <circle cx="6" cy="6" r="0.5" fill="${k}" fill-opacity="${o * 0.4}"/>
      <circle cx="9" cy="4.5" r="0.4" fill="${k}" fill-opacity="${o * 0.3}"/>
      <circle cx="7" cy="3" r="0.35" fill="${k}" fill-opacity="${o * 0.25}"/>
    </svg>`;
  },

  hockeyPuck(theme, activated = false) {
    // sport → #F87171
    const k = '#F87171';
    const o = activated ? 1 : 0.4;
    const ice = '#E0F2FE';
    const black = '#1E293B';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <!-- ice surface -->
      <ellipse cx="8" cy="13" rx="7" ry="2" fill="${ice}" fill-opacity="${o * 0.1}"/>
      <!-- hockey stick — angled shaft -->
      <path d="M2 2 L7 9" fill="none" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.8}" stroke-linecap="round"/>
      <!-- stick blade -->
      <path d="M7 9 L11 10.5 Q12 11 11.5 11.5 L7 10" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.7}"/>
      <!-- stick tape wrap on blade -->
      <line x1="7.5" y1="9.5" x2="8" y2="10" stroke="${black}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <line x1="9" y1="10" x2="9.5" y2="10.5" stroke="${black}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <!-- puck — 3D cylinder -->
      <ellipse cx="8" cy="13" rx="2.5" ry="0.9" fill="${black}" fill-opacity="${o * 0.5}" stroke="${black}" stroke-width="0.6" stroke-opacity="${o * 0.7}"/>
      <rect x="5.5" y="12" width="5" height="1" fill="${black}" fill-opacity="${o * 0.45}"/>
      <ellipse cx="8" cy="12" rx="2.5" ry="0.9" fill="${black}" fill-opacity="${o * 0.4}" stroke="${black}" stroke-width="0.6" stroke-opacity="${o * 0.7}"/>
      <!-- puck edge texture -->
      <path d="M6 12 L6 13" stroke="${black}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <path d="M10" stroke="${black}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <!-- lightning bolt on stick shaft -->
      <path d="M3.5 4 L4.5 5.5 L3.8 5.5 L4.8 7" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- grip tape on shaft top -->
      <line x1="2.3" y1="2.5" x2="2.8" y2="3" stroke="${black}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <line x1="2.8" y1="3.2" x2="3.3" y2="3.7" stroke="${black}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <!-- motion lines -->
      <path d="M12 8 L14 7" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <path d="M12.5 9 L14 8.5" fill="none" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.25}" stroke-linecap="round"/>
    </svg>`;
    // INACTIVE: puck shape with faint stick hint
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <ellipse cx="8" cy="9" rx="3" ry="1.2" fill="${k}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="0.7" stroke-opacity="${o}"/>
      <rect x="5" y="8" width="6" height="1" fill="${k}" fill-opacity="${o * 0.15}"/>
      <ellipse cx="8" cy="8" rx="3" ry="1.2" fill="${k}" fill-opacity="${o * 0.15}" stroke="${k}" stroke-width="0.7" stroke-opacity="${o * 0.8}"/>
      <path d="M5 5 L7.5 8" fill="none" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.4}" stroke-linecap="round"/>
    </svg>`;
  },

  pirateFlag(theme, activated = false) {
    // sport → #F87171
    const k = '#F87171';
    const o = activated ? 1 : 0.4;
    const black = '#1E293B';
    const white = '#F8FAFC';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="14" viewBox="0 0 20 14">
      <!-- flagpole -->
      <line x1="2" y1="0" x2="2" y2="13.5" stroke="${black}" stroke-width="1" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <!-- pole cap ball -->
      <circle cx="2" cy="0.5" r="0.8" fill="${k}" fill-opacity="${o * 0.5}"/>
      <!-- flag — waving shape with red field -->
      <path d="M3 1.5 Q10 0.5 17 1.5 Q18 3 17.5 5 Q17 7 17.5 9 Q10 10 3 9Z" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.7}"/>
      <!-- flag fold shading -->
      <path d="M8 2 Q9 4 8 6 Q7 8 8 9.5" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
      <path d="M13 1.5 Q14 3.5 13 5.5 Q12 7.5 13 9" fill="none" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.15}"/>
      <!-- skull -->
      <ellipse cx="10" cy="4" rx="2.2" ry="1.8" fill="${white}" fill-opacity="${o * 0.6}" stroke="${white}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <!-- skull eye sockets -->
      <circle cx="9" cy="3.8" r="0.6" fill="${black}" fill-opacity="${o * 0.7}"/>
      <circle cx="11" cy="3.8" r="0.6" fill="${black}" fill-opacity="${o * 0.7}"/>
      <!-- skull nose -->
      <path d="M9.8 4.5 L10 5 L10.2 4.5" fill="none" stroke="${black}" stroke-width="0.3" stroke-opacity="${o * 0.5}"/>
      <!-- skull teeth -->
      <path d="M9 5.5 L9.5 5.5 L9.5 6 M10 5.5 L10 6 M10.5 5.5 L10.5 6 L11 5.5" fill="none" stroke="${black}" stroke-width="0.3" stroke-opacity="${o * 0.5}"/>
      <!-- crossbones below skull -->
      <path d="M7 7.5 L13 8.5" fill="none" stroke="${white}" stroke-width="0.8" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <path d="M7 8.5 L13 7.5" fill="none" stroke="${white}" stroke-width="0.8" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- bone ends -->
      <circle cx="7" cy="7.5" r="0.4" fill="${white}" fill-opacity="${o * 0.4}"/>
      <circle cx="13" cy="8.5" r="0.4" fill="${white}" fill-opacity="${o * 0.4}"/>
      <circle cx="7" cy="8.5" r="0.4" fill="${white}" fill-opacity="${o * 0.4}"/>
      <circle cx="13" cy="7.5" r="0.4" fill="${white}" fill-opacity="${o * 0.4}"/>
      <!-- base grass/ground -->
      <path d="M0 13 Q2 12.5 4 13" fill="none" stroke="#4ADE80" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
    </svg>`;
    // INACTIVE: pole with small furled flag hint
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="14" viewBox="0 0 20 14">
      <line x1="3" y1="1" x2="3" y2="13" stroke="${k}" stroke-width="0.8" stroke-opacity="${o}" stroke-linecap="round"/>
      <path d="M4 2 Q8 1 12 2 Q13 4 12 6 Q8 7 4 6.5Z" fill="${k}" fill-opacity="${o * 0.15}" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.6}"/>
      <circle cx="3" cy="1" r="0.6" fill="${k}" fill-opacity="${o * 0.5}"/>
    </svg>`;
  },

  stingray(theme, activated = false) {
    // water → #2DD4BF
    const k = '#2DD4BF';
    const o = activated ? 1 : 0.4;
    const dark = '#1E293B';
    const sand = '#D4A04A';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 24 18">
      <!-- body — diamond/kite shape viewed from above -->
      <path d="M12 1 Q4 4 1 8 Q4 12 12 10 Q20 12 23 8 Q20 4 12 1Z" fill="${k}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.8}"/>
      <!-- body center ridge -->
      <path d="M12 2 L12 10" fill="none" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.3}"/>
      <!-- wing rib lines — left -->
      <path d="M10 3 Q6 5 3 7" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
      <path d="M9 5 Q6 6.5 3 8.5" fill="none" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.15}"/>
      <path d="M9 7 Q7 8 4 10" fill="none" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.15}"/>
      <!-- wing rib lines — right -->
      <path d="M14 3 Q18 5 21 7" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
      <path d="M15 5 Q18 6.5 21 8.5" fill="none" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.15}"/>
      <path d="M15 7 Q17 8 20 10" fill="none" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.15}"/>
      <!-- spots on wings -->
      <circle cx="7" cy="5.5" r="0.8" fill="${k}" fill-opacity="${o * 0.15}" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <circle cx="17" cy="5.5" r="0.8" fill="${k}" fill-opacity="${o * 0.15}" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <circle cx="5" cy="8" r="0.6" fill="${k}" fill-opacity="${o * 0.1}"/>
      <circle cx="19" cy="8" r="0.6" fill="${k}" fill-opacity="${o * 0.1}"/>
      <!-- eyes -->
      <circle cx="10.5" cy="4" r="0.7" fill="${dark}" fill-opacity="${o * 0.6}"/>
      <circle cx="13.5" cy="4" r="0.7" fill="${dark}" fill-opacity="${o * 0.6}"/>
      <!-- mouth/gill slits underneath hint -->
      <path d="M10 6.5 Q12 7 14 6.5" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <path d="M10.5 7.5 Q12 7.8 13.5 7.5" fill="none" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <!-- tail — long whip trailing back -->
      <path d="M12 10 Q12.5 13 11 15 Q10 16.5 11.5 17.5" fill="none" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <!-- tail barb -->
      <path d="M11.5 17 L12.5 17.5 L11.5 17.5 L12 18" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.5}"/>
      <!-- sand floor hint -->
      <circle cx="3" cy="16" r="0.3" fill="${sand}" fill-opacity="${o * 0.15}"/>
      <circle cx="8" cy="17" r="0.25" fill="${sand}" fill-opacity="${o * 0.12}"/>
      <circle cx="18" cy="16.5" r="0.3" fill="${sand}" fill-opacity="${o * 0.12}"/>
    </svg>`;
    // INACTIVE: diamond wing shape with tail
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 24 18">
      <path d="M12 3 Q5 5 3 8 Q5 11 12 9.5 Q19 11 21 8 Q19 5 12 3Z" fill="${k}" fill-opacity="${o * 0.12}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o}"/>
      <path d="M12 9.5 Q12 12 11 15" fill="none" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <circle cx="10.5" cy="5.5" r="0.4" fill="${k}" fill-opacity="${o * 0.5}"/>
      <circle cx="13.5" cy="5.5" r="0.4" fill="${k}" fill-opacity="${o * 0.5}"/>
    </svg>`;
  },

  greekCross(theme, activated = false) {
    // culture → #A78BFA
    const k = '#A78BFA';
    const o = activated ? 1 : 0.4;
    const gold = '#FBBF24';
    const blue = '#2563EB';
    const water = '#2DD4BF';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="-1 -1 18 18">
      <!-- water at base (Epiphany cross dive into water) -->
      <path d="M0 13 Q4 12 8 13 Q12 14 16 13" fill="${water}" fill-opacity="${o * 0.08}"/>
      <path d="M0 14 Q4 13 8 14 Q12 15 16 14" fill="none" stroke="${water}" stroke-width="0.4" stroke-opacity="${o * 0.25}"/>
      <!-- Greek Orthodox cross — ornate with trefoil ends -->
      <!-- vertical beam -->
      <rect x="6.5" y="1" width="3" height="11.5" rx="0.3" fill="${blue}" fill-opacity="${o * 0.3}" stroke="${blue}" stroke-width="0.7" stroke-opacity="${o * 0.8}"/>
      <!-- horizontal beam (slightly above center) -->
      <rect x="1.5" y="4.5" width="13" height="3" rx="0.3" fill="${blue}" fill-opacity="${o * 0.3}" stroke="${blue}" stroke-width="0.7" stroke-opacity="${o * 0.8}"/>
      <!-- trefoil end caps — top -->
      <circle cx="8" cy="1" r="1.2" fill="${blue}" fill-opacity="${o * 0.25}" stroke="${blue}" stroke-width="0.5" stroke-opacity="${o * 0.6}"/>
      <!-- trefoil end caps — bottom -->
      <circle cx="8" cy="12.5" r="1.2" fill="${blue}" fill-opacity="${o * 0.25}" stroke="${blue}" stroke-width="0.5" stroke-opacity="${o * 0.6}"/>
      <!-- trefoil end caps — left -->
      <circle cx="1.5" cy="6" r="1.2" fill="${blue}" fill-opacity="${o * 0.25}" stroke="${blue}" stroke-width="0.5" stroke-opacity="${o * 0.6}"/>
      <!-- trefoil end caps — right -->
      <circle cx="14.5" cy="6" r="1.2" fill="${blue}" fill-opacity="${o * 0.25}" stroke="${blue}" stroke-width="0.5" stroke-opacity="${o * 0.6}"/>
      <!-- gold center medallion -->
      <circle cx="8" cy="6" r="1.5" fill="${gold}" fill-opacity="${o * 0.4}" stroke="${gold}" stroke-width="0.5" stroke-opacity="${o * 0.6}"/>
      <!-- IC XC inscription hint -->
      <line x1="7.2" y1="5.5" x2="7.2" y2="6.5" stroke="${gold}" stroke-width="0.3" stroke-opacity="${o * 0.5}"/>
      <line x1="8.8" y1="5.5" x2="8.8" y2="6.5" stroke="${gold}" stroke-width="0.3" stroke-opacity="${o * 0.5}"/>
      <!-- gold trim lines on beams -->
      <line x1="6.8" y1="2.5" x2="9.2" y2="2.5" stroke="${gold}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <line x1="6.8" y1="10" x2="9.2" y2="10" stroke="${gold}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <!-- water splash (Epiphany dive) -->
      <circle cx="6" cy="13.5" r="0.5" fill="${water}" fill-opacity="${o * 0.2}"/>
      <circle cx="10" cy="13.5" r="0.5" fill="${water}" fill-opacity="${o * 0.2}"/>
      <circle cx="8" cy="12.8" r="0.4" fill="${water}" fill-opacity="${o * 0.15}"/>
    </svg>`;
    // INACTIVE: simple cross silhouette
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="-1 -1 18 18">
      <rect x="6.5" y="2" width="3" height="11" rx="0.3" fill="${k}" fill-opacity="${o * 0.15}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o}"/>
      <rect x="2" y="5" width="12" height="3" rx="0.3" fill="${k}" fill-opacity="${o * 0.15}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.8}"/>
      <circle cx="8" cy="6.5" r="1" fill="${k}" fill-opacity="${o * 0.2}"/>
    </svg>`;
  },

  // --- Batch 3: Food & History ---

  cubanSandwich(theme, activated = false) {
    // food → #FB923C
    const k = '#FB923C';
    const o = activated ? 1 : 0.4;
    const bread = '#D4A04A';
    const ham = '#F87171';
    const pork = '#FBBF24';
    const swiss = '#FDE68A';
    const pickle = '#4ADE80';
    const mustard = '#FBBF24';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="14" viewBox="-1 -1 26 14">
      <!-- pressed Cuban bread — top half (toasted golden, slightly domed) -->
      <path d="M2 3 Q12 1 22 3 L22 4.5 L2 4.5Z" fill="${bread}" fill-opacity="${o * 0.5}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.9}"/>
      <!-- bread score lines (diagonal slashes from pressing) -->
      <line x1="6" y1="2.5" x2="7.5" y2="4" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
      <line x1="10" y1="2" x2="11.5" y2="3.8" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
      <line x1="14" y1="2" x2="15.5" y2="3.8" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
      <line x1="18" y1="2.5" x2="19.5" y2="4" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
      <!-- grill press marks on top bread -->
      <line x1="4" y1="3.2" x2="20" y2="3.2" stroke="#92400E" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <line x1="4" y1="3.8" x2="20" y2="3.8" stroke="#92400E" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <!-- mustard drizzle -->
      <path d="M3 4.5 Q7 4.8 12 4.5 Q17 4.2 21 4.5" fill="none" stroke="${mustard}" stroke-width="0.7" stroke-opacity="${o * 0.5}"/>
      <!-- Swiss cheese layer with holes — thicker, brighter -->
      <rect x="2.5" y="4.8" width="19" height="1.5" fill="${swiss}" fill-opacity="${o * 0.5}" stroke="${swiss}" stroke-width="0.4" stroke-opacity="${o * 0.5}"/>
      <circle cx="7" cy="5.5" r="0.5" fill="${bread}" fill-opacity="${o * 0.3}"/>
      <circle cx="14" cy="5.3" r="0.45" fill="${bread}" fill-opacity="${o * 0.25}"/>
      <circle cx="18" cy="5.7" r="0.4" fill="${bread}" fill-opacity="${o * 0.2}"/>
      <!-- ham layer (bright pink, ruffled edges) -->
      <path d="M2.5 6.3 Q5 6 7 6.5 Q9 6.1 12 6.3 Q15 6.6 17 6.2 Q19 6.5 21.5 6.3 L21.5 7.2 L2.5 7.2Z" fill="${ham}" fill-opacity="${o * 0.45}" stroke="${ham}" stroke-width="0.3" stroke-opacity="${o * 0.4}"/>
      <!-- roast pork layer -->
      <rect x="2.5" y="7.2" width="19" height="0.9" fill="${pork}" fill-opacity="${o * 0.35}"/>
      <!-- pickle slices — bright green, poking out edges -->
      <circle cx="3" cy="6.8" r="1" fill="${pickle}" fill-opacity="${o * 0.5}" stroke="${pickle}" stroke-width="0.4" stroke-opacity="${o * 0.6}"/>
      <circle cx="9" cy="7" r="0.9" fill="${pickle}" fill-opacity="${o * 0.45}" stroke="${pickle}" stroke-width="0.4" stroke-opacity="${o * 0.5}"/>
      <circle cx="15" cy="6.8" r="0.9" fill="${pickle}" fill-opacity="${o * 0.45}" stroke="${pickle}" stroke-width="0.4" stroke-opacity="${o * 0.5}"/>
      <circle cx="21" cy="7" r="0.8" fill="${pickle}" fill-opacity="${o * 0.4}" stroke="${pickle}" stroke-width="0.3" stroke-opacity="${o * 0.4}"/>
      <!-- bottom bread -->
      <path d="M2 8.1 L22 8.1 L22 9.5 Q12 11 2 9.5Z" fill="${bread}" fill-opacity="${o * 0.5}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.9}"/>
      <!-- toothpick through center -->
      <line x1="12" y1="0" x2="12" y2="10" stroke="#92400E" stroke-width="0.5" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- toothpick olive on top -->
      <circle cx="12" cy="0.3" r="0.8" fill="${pickle}" fill-opacity="${o * 0.4}" stroke="${pickle}" stroke-width="0.3" stroke-opacity="${o * 0.5}"/>
      <circle cx="12" cy="0.3" r="0.25" fill="#92400E" fill-opacity="${o * 0.4}"/>
      <!-- steam wisps -->
      <path d="M6 0.5 Q5.5 -0.5 6.5 -0.5" fill="none" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.15}" stroke-linecap="round"/>
      <path d="M18 0.5 Q17.5 -0.5 18.5 -0.5" fill="none" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.15}" stroke-linecap="round"/>
    </svg>`;
    // INACTIVE: pressed sandwich outline
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="12" viewBox="0 0 24 12">
      <path d="M4 4 Q12 2.5 20 4 L20 5 L4 5Z" fill="${k}" fill-opacity="${o * 0.12}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o}"/>
      <rect x="5" y="5" width="14" height="1.5" fill="${k}" fill-opacity="${o * 0.08}"/>
      <path d="M4 6.5 L20 6.5 L20 8 Q12 9.5 4 8Z" fill="${k}" fill-opacity="${o * 0.12}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.8}"/>
      <line x1="8" y1="3.5" x2="9" y2="4.8" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.4}"/>
      <line x1="14" y1="3.2" x2="15" y2="4.8" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.4}"/>
    </svg>`;
  },

  grouper(theme, activated = false) {
    // food → #FB923C
    const k = '#FB923C';
    const o = activated ? 1 : 0.4;
    const brown = '#92400E';
    const dark = '#1E293B';
    const water = '#2DD4BF';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="14" viewBox="0 0 22 14">
      <!-- main body — big stocky grouper shape facing right -->
      <path d="M4 7 Q5 3 9 2 Q13 1.5 17 3 Q19 4 20 6 Q20 8 19 9 Q17 11 13 11.5 Q9 12 6 11 Q4 10 4 7Z" fill="${k}" fill-opacity="${o * 0.25}" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.8}"/>
      <!-- dorsal fin — spiny top -->
      <path d="M8 3 L7 1 L9 2.5 L10 0.5 L11.5 2 L13 0.8 L14 2 L15.5 1 L16 3" fill="${k}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.6}"/>
      <!-- tail fin — forked -->
      <path d="M4 7 L1 4 Q0.5 3.5 1 4.5 L2 6 L1 8 Q0.5 9 1 9.5 L4 7" fill="${k}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.5}"/>
      <!-- pectoral fin -->
      <path d="M13 8 Q14 10 12 11" fill="none" stroke="${k}" stroke-width="0.7" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- anal fin -->
      <path d="M7 11 L6 12.5 L8 11.5 L9 13 L10 11" fill="${k}" fill-opacity="${o * 0.15}" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
      <!-- grouper spots/mottling -->
      <circle cx="8" cy="6" r="0.6" fill="${brown}" fill-opacity="${o * 0.2}"/>
      <circle cx="11" cy="5" r="0.5" fill="${brown}" fill-opacity="${o * 0.2}"/>
      <circle cx="14" cy="6.5" r="0.55" fill="${brown}" fill-opacity="${o * 0.18}"/>
      <circle cx="10" cy="8" r="0.5" fill="${brown}" fill-opacity="${o * 0.15}"/>
      <circle cx="15" cy="4.5" r="0.4" fill="${brown}" fill-opacity="${o * 0.15}"/>
      <circle cx="7" cy="9" r="0.45" fill="${brown}" fill-opacity="${o * 0.15}"/>
      <!-- big eye -->
      <circle cx="17.5" cy="5.5" r="1" fill="#FDE68A" fill-opacity="${o * 0.6}"/>
      <circle cx="17.5" cy="5.5" r="0.4" fill="${dark}" fill-opacity="${o * 0.8}"/>
      <!-- wide mouth -->
      <path d="M19.5 6.5 Q20.5 7 20.5 8 Q20 8.5 19 8" fill="none" stroke="${k}" stroke-width="0.7" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <!-- gill line -->
      <path d="M16 4 Q15.5 6 16 8.5" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.3}"/>
      <!-- lateral line -->
      <path d="M5 7 Q10 6.5 16 7" fill="none" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
    </svg>`;
    // INACTIVE: fish body outline
    return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="14" viewBox="0 0 22 14">
      <path d="M5 7 Q6 4 11 3.5 Q16 4 18 7 Q16 10 11 10.5 Q6 10 5 7Z" fill="${k}" fill-opacity="${o * 0.1}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o}"/>
      <path d="M5 7 L2 5 L2 9 L5 7" fill="${k}" fill-opacity="${o * 0.15}" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.6}"/>
      <circle cx="16" cy="6" r="0.5" fill="${k}" fill-opacity="${o * 0.5}"/>
    </svg>`;
  },

  orange(theme, activated = false) {
    // food → #FB923C
    const k = '#FB923C';
    const o = activated ? 1 : 0.4;
    const green = '#4ADE80';
    const highlight = '#FDBA74';
    const dark = '#C2410C';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <!-- stem -->
      <path d="M8 3.5 L8 1.5" fill="none" stroke="${dark}" stroke-width="0.8" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <!-- leaves — two small ones flanking stem -->
      <path d="M8 2.5 Q5.5 1 4.5 1.5 Q5.5 2.5 7.5 3" fill="${green}" fill-opacity="${o * 0.4}" stroke="${green}" stroke-width="0.4" stroke-opacity="${o * 0.5}"/>
      <path d="M8 2.5 Q10.5 1 11.5 1.5 Q10.5 2.5 8.5 3" fill="${green}" fill-opacity="${o * 0.35}" stroke="${green}" stroke-width="0.4" stroke-opacity="${o * 0.45}"/>
      <!-- leaf veins -->
      <line x1="6" y1="1.8" x2="7" y2="2.8" stroke="${green}" stroke-width="0.25" stroke-opacity="${o * 0.3}"/>
      <line x1="10" y1="1.8" x2="9" y2="2.8" stroke="${green}" stroke-width="0.25" stroke-opacity="${o * 0.3}"/>
      <!-- main orange fruit -->
      <circle cx="8" cy="9.5" r="5.8" fill="${k}" fill-opacity="${o * 0.35}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.8}"/>
      <!-- citrus segment lines radiating from center -->
      <line x1="8" y1="4.5" x2="8" y2="14.5" stroke="${dark}" stroke-width="0.3" stroke-opacity="${o * 0.15}"/>
      <line x1="3" y1="6.5" x2="13" y2="12.5" stroke="${dark}" stroke-width="0.3" stroke-opacity="${o * 0.12}"/>
      <line x1="13" y1="6.5" x2="3" y2="12.5" stroke="${dark}" stroke-width="0.3" stroke-opacity="${o * 0.12}"/>
      <line x1="2.5" y1="9.5" x2="13.5" y2="9.5" stroke="${dark}" stroke-width="0.3" stroke-opacity="${o * 0.1}"/>
      <!-- orange peel texture — tiny dimples -->
      <circle cx="6" cy="7.5" r="0.3" fill="${k}" fill-opacity="${o * 0.2}"/>
      <circle cx="10" cy="8" r="0.3" fill="${k}" fill-opacity="${o * 0.2}"/>
      <circle cx="5.5" cy="10.5" r="0.25" fill="${k}" fill-opacity="${o * 0.18}"/>
      <circle cx="10.5" cy="11" r="0.25" fill="${k}" fill-opacity="${o * 0.18}"/>
      <circle cx="8" cy="13" r="0.25" fill="${k}" fill-opacity="${o * 0.15}"/>
      <circle cx="7" cy="6" r="0.2" fill="${k}" fill-opacity="${o * 0.15}"/>
      <!-- highlight/shine -->
      <path d="M5.5 6 Q6.5 5 7.5 5.5" fill="none" stroke="${highlight}" stroke-width="0.5" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <!-- navel dimple at bottom -->
      <circle cx="8" cy="14.5" r="0.5" fill="${dark}" fill-opacity="${o * 0.15}"/>
    </svg>`;
    // INACTIVE: round orange shape with stem hint
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="9.5" r="5" fill="${k}" fill-opacity="${o * 0.12}" stroke="${k}" stroke-width="0.7" stroke-opacity="${o}"/>
      <path d="M8 4.5 L8 3" fill="none" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <path d="M8 3.5 Q6 2.5 5.5 3" fill="none" stroke="${green}" stroke-width="0.4" stroke-opacity="${o * 0.4}"/>
    </svg>`;
  },

  craftBeer(theme, activated = false) {
    // food → #FB923C
    const k = '#FB923C';
    const o = activated ? 1 : 0.4;
    const amber = '#D97706';
    const foam = '#FEF3C7';
    const glass = '#FDE68A';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="18" viewBox="0 0 14 18">
      <!-- pint glass — tapered shape wider at top -->
      <path d="M2.5 5 L1.5 16 Q1.5 17 2.5 17 L9.5 17 Q10.5 17 10.5 16 L9.5 5Z" fill="${amber}" fill-opacity="${o * 0.25}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.8}"/>
      <!-- beer fill line gradient effect -->
      <rect x="2.3" y="7" width="7.4" height="9.5" rx="0.5" fill="${k}" fill-opacity="${o * 0.2}"/>
      <!-- beer liquid darker at bottom -->
      <rect x="2" y="12" width="8" height="4.5" rx="0.5" fill="${amber}" fill-opacity="${o * 0.15}"/>
      <!-- foam head — bubbly top -->
      <path d="M2.5 5 Q6 3.5 9.5 5" fill="${foam}" fill-opacity="${o * 0.4}" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.5}"/>
      <!-- foam bubbles overflowing -->
      <ellipse cx="4" cy="3.5" rx="1.8" ry="1.2" fill="${foam}" fill-opacity="${o * 0.35}" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.4}"/>
      <ellipse cx="8" cy="3" rx="1.8" ry="1.3" fill="${foam}" fill-opacity="${o * 0.35}" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.4}"/>
      <ellipse cx="6" cy="2" rx="1.5" ry="1" fill="${foam}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.35}"/>
      <ellipse cx="3.5" cy="1.5" rx="1" ry="0.7" fill="${foam}" fill-opacity="${o * 0.25}"/>
      <ellipse cx="8.5" cy="1.5" rx="1" ry="0.7" fill="${foam}" fill-opacity="${o * 0.25}"/>
      <!-- handle -->
      <path d="M9.5 7.5 L11.5 7.5 Q12.5 7.5 12.5 8.5 L12.5 12 Q12.5 13 11.5 13 L9.5 13" fill="none" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.6}"/>
      <!-- rising bubbles inside beer -->
      <circle cx="5" cy="8" r="0.4" fill="${k}" fill-opacity="${o * 0.2}"/>
      <circle cx="7" cy="9" r="0.35" fill="${k}" fill-opacity="${o * 0.18}"/>
      <circle cx="4.5" cy="11" r="0.3" fill="${k}" fill-opacity="${o * 0.15}"/>
      <circle cx="6.5" cy="13" r="0.35" fill="${k}" fill-opacity="${o * 0.15}"/>
      <circle cx="8" cy="10.5" r="0.25" fill="${k}" fill-opacity="${o * 0.12}"/>
      <!-- label on glass -->
      <rect x="3.5" y="10" width="5" height="3.5" rx="0.5" fill="${k}" fill-opacity="${o * 0.1}" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.25}"/>
      <!-- condensation drops on glass -->
      <circle cx="3" cy="8.5" r="0.2" fill="${k}" fill-opacity="${o * 0.15}"/>
      <circle cx="3.5" cy="14" r="0.2" fill="${k}" fill-opacity="${o * 0.12}"/>
    </svg>`;
    // INACTIVE: pint glass outline with foam cap
    return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="18" viewBox="0 0 14 18">
      <path d="M3 6 L2 16 Q2 17 3 17 L9 17 Q10 17 10 16 L9 6Z" fill="${k}" fill-opacity="${o * 0.1}" stroke="${k}" stroke-width="0.7" stroke-opacity="${o}"/>
      <path d="M3 6 Q6 4.5 9 6" fill="${k}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.6}"/>
      <ellipse cx="6" cy="4" rx="2" ry="1" fill="${k}" fill-opacity="${o * 0.15}"/>
    </svg>`;
  },

  flamingo(theme, activated = false) {
    // bird → #38BDF8
    const k = '#38BDF8';
    const o = activated ? 1 : 0.4;
    const pink = '#F472B6';
    const hotpink = '#EC4899';
    const dark = '#1E293B';
    const water = '#2DD4BF';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="22" viewBox="0 0 14 22">
      <!-- head -->
      <circle cx="7" cy="2.5" r="1.8" fill="${pink}" fill-opacity="${o * 0.35}" stroke="${pink}" stroke-width="0.8" stroke-opacity="${o * 0.8}"/>
      <!-- eye -->
      <circle cx="6.5" cy="2.2" r="0.4" fill="${dark}" fill-opacity="${o * 0.7}"/>
      <!-- beak — angled down with black tip -->
      <path d="M8 3 L10.5 4 L10 4.8 L7.5 4" fill="${pink}" fill-opacity="${o * 0.4}" stroke="${hotpink}" stroke-width="0.5" stroke-opacity="${o * 0.6}"/>
      <path d="M10 4 L10.5 4 L10 4.8" fill="${dark}" fill-opacity="${o * 0.5}"/>
      <!-- long S-curved neck -->
      <path d="M7 4.3 Q6.5 6 5.5 8 Q4.5 10 5 12" fill="none" stroke="${pink}" stroke-width="1.2" stroke-opacity="${o * 0.8}" stroke-linecap="round"/>
      <!-- body — plump oval -->
      <ellipse cx="6" cy="13" rx="3.5" ry="2.5" fill="${pink}" fill-opacity="${o * 0.3}" stroke="${pink}" stroke-width="0.8" stroke-opacity="${o * 0.7}"/>
      <!-- wing feathers layered -->
      <path d="M4 12 Q2 11 1.5 12 Q2.5 13 4.5 12.5" fill="${hotpink}" fill-opacity="${o * 0.2}" stroke="${hotpink}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
      <path d="M8 12 Q10 11 10.5 12 Q9.5 13 7.5 12.5" fill="${hotpink}" fill-opacity="${o * 0.2}" stroke="${hotpink}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
      <!-- tail tuft -->
      <path d="M3 14 Q2 15 1.5 14.5" fill="none" stroke="${hotpink}" stroke-width="0.6" stroke-opacity="${o * 0.4}" stroke-linecap="round"/>
      <path d="M3.5 14.5 Q2.5 16 2 15.5" fill="none" stroke="${hotpink}" stroke-width="0.5" stroke-opacity="${o * 0.35}" stroke-linecap="round"/>
      <!-- legs — long, thin, one bent -->
      <line x1="5.5" y1="15" x2="5" y2="20" stroke="${pink}" stroke-width="0.7" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <!-- second leg bent at knee -->
      <path d="M7 15 L7.5 17 L7 18.5" fill="none" stroke="${pink}" stroke-width="0.7" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <!-- feet -->
      <path d="M5 20 L4 20.5 M5 20 L5.5 20.5 M5 20 L4.5 20.8" fill="none" stroke="${pink}" stroke-width="0.4" stroke-opacity="${o * 0.5}"/>
      <!-- water line at base -->
      <path d="M0 20 Q7 19 14 20" fill="none" stroke="${water}" stroke-width="0.5" stroke-opacity="${o * 0.25}"/>
    </svg>`;
    // INACTIVE: S-curve neck with body blob
    return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="22" viewBox="0 0 14 22">
      <path d="M7 4 Q6 7 5 10 Q4.5 12 5 14" fill="none" stroke="${k}" stroke-width="0.8" stroke-opacity="${o}" stroke-linecap="round"/>
      <ellipse cx="6" cy="14.5" rx="2.5" ry="1.5" fill="${k}" fill-opacity="${o * 0.15}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.7}"/>
      <circle cx="7" cy="3.5" r="1" fill="${k}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.6}"/>
      <line x1="5.5" y1="16" x2="5" y2="19" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.5}"/>
      <line x1="7" y1="16" x2="7.5" y2="19" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.5}"/>
    </svg>`;
  },


  tikiHut(theme, activated = false) {
    // culture → #A78BFA
    const k = '#A78BFA';
    const o = activated ? 1 : 0.4;
    const thatch = '#D4A04A';
    const wood = '#92400E';
    const green = '#4ADE80';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="-1 -1 20 20">
      <!-- thatched roof — big A-frame with overhang -->
      <path d="M-0.5 9 L9 1 L18.5 9" fill="${thatch}" fill-opacity="${o * 0.3}" stroke="${thatch}" stroke-width="0.8" stroke-opacity="${o * 0.8}"/>
      <!-- thatch texture lines (horizontal) -->
      <path d="M1 8 L17 8" fill="none" stroke="${thatch}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <path d="M2.5 6.5 L15.5 6.5" fill="none" stroke="${thatch}" stroke-width="0.4" stroke-opacity="${o * 0.25}"/>
      <path d="M4 5 L14 5" fill="none" stroke="${thatch}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
      <path d="M5.5 3.5 L12.5 3.5" fill="none" stroke="${thatch}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <!-- thatch fringe hanging off edges -->
      <path d="M-0.5 9 L-1 10.5" stroke="${thatch}" stroke-width="0.5" stroke-opacity="${o * 0.4}" stroke-linecap="round"/>
      <path d="M0.5 9 L0 10" stroke="${thatch}" stroke-width="0.4" stroke-opacity="${o * 0.35}" stroke-linecap="round"/>
      <path d="M18.5 9 L19 10.5" stroke="${thatch}" stroke-width="0.5" stroke-opacity="${o * 0.4}" stroke-linecap="round"/>
      <path d="M17.5 9 L18 10" stroke="${thatch}" stroke-width="0.4" stroke-opacity="${o * 0.35}" stroke-linecap="round"/>
      <!-- bamboo support poles -->
      <line x1="4" y1="9" x2="4" y2="17" stroke="${wood}" stroke-width="1" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <line x1="14" y1="9" x2="14" y2="17" stroke="${wood}" stroke-width="1" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <!-- pole knot details -->
      <line x1="3.5" y1="11" x2="4.5" y2="11" stroke="${wood}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <line x1="3.5" y1="14" x2="4.5" y2="14" stroke="${wood}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <line x1="13.5" y1="12" x2="14.5" y2="12" stroke="${wood}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <line x1="13.5" y1="15" x2="14.5" y2="15" stroke="${wood}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <!-- bar counter -->
      <rect x="3.5" y="12.5" width="11" height="1.2" rx="0.3" fill="${wood}" fill-opacity="${o * 0.4}" stroke="${wood}" stroke-width="0.5" stroke-opacity="${o * 0.5}"/>
      <!-- bar stools (two circles) -->
      <circle cx="6" cy="16.5" r="1" fill="${wood}" fill-opacity="${o * 0.2}" stroke="${wood}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <line x1="6" y1="15.5" x2="6" y2="14" stroke="${wood}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <circle cx="12" cy="16.5" r="1" fill="${wood}" fill-opacity="${o * 0.2}" stroke="${wood}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <line x1="12" y1="15.5" x2="12" y2="14" stroke="${wood}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <!-- string lights under roof -->
      <circle cx="6" cy="9.5" r="0.5" fill="${k}" fill-opacity="${o * 0.5}"/>
      <circle cx="9" cy="9.5" r="0.5" fill="#FB923C" fill-opacity="${o * 0.5}"/>
      <circle cx="12" cy="9.5" r="0.5" fill="${green}" fill-opacity="${o * 0.5}"/>
      <!-- palm frond accents on sides -->
      <path d="M-0.5 10 Q-2 8 -1 6" fill="none" stroke="${green}" stroke-width="0.5" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <path d="M18.5 10 Q20 8 19 6" fill="none" stroke="${green}" stroke-width="0.5" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
    </svg>`;
    // INACTIVE: A-frame roof with poles and faint bar
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
      <path d="M1 10 L9 3 L17 10" fill="${k}" fill-opacity="${o * 0.1}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o}"/>
      <!-- thatch texture hints -->
      <path d="M3 8.5 L15 8.5" fill="none" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <path d="M5 7 L13 7" fill="none" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.25}"/>
      <!-- fringe hints -->
      <path d="M1 10 L0.5 11" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <path d="M17 10 L17.5 11" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <!-- poles -->
      <line x1="5" y1="10" x2="5" y2="16" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.5}"/>
      <line x1="13" y1="10" x2="13" y2="16" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.5}"/>
      <!-- bar counter hint -->
      <line x1="5" y1="13" x2="13" y2="13" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
    </svg>`;
  },

  // --- Batch 4: Quirky & Deep Cuts ---

  ufo(theme, activated = false) {
    // spooky → #C084FC
    const k = '#C084FC';
    const o = activated ? 1 : 0.4;
    const green = '#4ADE80';
    const silver = '#CBD5E1';
    const dark = '#1E293B';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="14" viewBox="0 0 22 14">
      <!-- abduction beam — wide green cone from saucer bottom -->
      <polygon points="7,7.5 11,13.5 15,7.5" fill="${green}" fill-opacity="${o * 0.12}"/>
      <polygon points="8,7.5 11,12.5 14,7.5" fill="${green}" fill-opacity="${o * 0.07}"/>
      <!-- beam stripes -->
      <line x1="8.5" y1="8" x2="9.5" y2="12" stroke="${green}" stroke-width="0.3" stroke-opacity="${o * 0.12}"/>
      <line x1="13.5" y1="8" x2="12.5" y2="12" stroke="${green}" stroke-width="0.3" stroke-opacity="${o * 0.12}"/>
      <!-- saucer — FLAT wide disc, clearly a flying saucer -->
      <ellipse cx="11" cy="6" rx="9.5" ry="1.8" fill="${silver}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.8}"/>
      <!-- saucer belly (underside thickness) -->
      <path d="M1.5 6 Q11 9 20.5 6" fill="${silver}" fill-opacity="${o * 0.08}" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <!-- dome on top — small bubble cockpit sitting on disc -->
      <ellipse cx="11" cy="4.5" rx="3.5" ry="2.5" fill="${k}" fill-opacity="${o * 0.15}" stroke="${k}" stroke-width="0.7" stroke-opacity="${o * 0.7}"/>
      <!-- dome glass shine -->
      <path d="M9 3 Q10 2 11 2.5" fill="none" stroke="${silver}" stroke-width="0.5" stroke-opacity="${o * 0.35}" stroke-linecap="round"/>
      <!-- portholes / windows on dome -->
      <circle cx="9.5" cy="4.5" r="0.6" fill="${green}" fill-opacity="${o * 0.5}" stroke="${green}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <circle cx="11" cy="4.8" r="0.6" fill="${green}" fill-opacity="${o * 0.5}" stroke="${green}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <circle cx="12.5" cy="4.5" r="0.6" fill="${green}" fill-opacity="${o * 0.5}" stroke="${green}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <!-- rim lights along saucer edge -->
      <circle cx="3" cy="6" r="0.6" fill="${green}" fill-opacity="${o * 0.7}"/>
      <circle cx="5.5" cy="6.8" r="0.6" fill="${k}" fill-opacity="${o * 0.6}"/>
      <circle cx="8" cy="7.2" r="0.6" fill="${green}" fill-opacity="${o * 0.7}"/>
      <circle cx="11" cy="7.4" r="0.6" fill="${k}" fill-opacity="${o * 0.6}"/>
      <circle cx="14" cy="7.2" r="0.6" fill="${green}" fill-opacity="${o * 0.7}"/>
      <circle cx="16.5" cy="6.8" r="0.6" fill="${k}" fill-opacity="${o * 0.6}"/>
      <circle cx="19" cy="6" r="0.6" fill="${green}" fill-opacity="${o * 0.7}"/>
      <!-- stars -->
      <circle cx="1" cy="1" r="0.35" fill="${k}" fill-opacity="${o * 0.3}"/>
      <circle cx="21" cy="1.5" r="0.3" fill="${k}" fill-opacity="${o * 0.25}"/>
      <circle cx="5" cy="0.5" r="0.25" fill="${k}" fill-opacity="${o * 0.2}"/>
      <circle cx="17" cy="0.5" r="0.2" fill="${k}" fill-opacity="${o * 0.15}"/>
    </svg>`;
    // INACTIVE: saucer disc with beam hint
    return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="14" viewBox="0 0 22 14">
      <ellipse cx="11" cy="5" rx="7" ry="2" fill="${k}" fill-opacity="${o * 0.1}" stroke="${k}" stroke-width="0.7" stroke-opacity="${o}"/>
      <ellipse cx="11" cy="3.5" rx="3" ry="2.5" fill="${k}" fill-opacity="${o * 0.1}" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.6}"/>
      <polygon points="9,7 11,12 13,7" fill="${k}" fill-opacity="${o * 0.08}" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <circle cx="8" cy="5.5" r="0.4" fill="${k}" fill-opacity="${o * 0.4}"/>
      <circle cx="11" cy="6" r="0.4" fill="${k}" fill-opacity="${o * 0.4}"/>
      <circle cx="14" cy="5.5" r="0.4" fill="${k}" fill-opacity="${o * 0.4}"/>
    </svg>`;
  },

  conchShell(theme, activated = false) {
    // culture → #A78BFA
    const k = '#A78BFA';
    const o = activated ? 1 : 0.4;
    const pink = '#F472B6';
    const coral = '#FB7185';
    const cream = '#FDE68A';
    const sand = '#D4A04A';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="-1 -1 20 20">
      <!-- conch shell lying on its side — classic queen conch shape -->
      <!-- outer shell body — wide flared opening on left, tapering spiral to right -->
      <path d="M3 14 Q1 12 1 9 Q1 5 4 3 Q7 1 11 2 Q14 3 16 5 Q17 7 17 9 Q16 10 14 10 Q11 10 9 12 Q7 14 3 14Z" fill="${pink}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="0.9" stroke-opacity="${o * 0.8}"/>
      <!-- spire — pointed spiral tip at top right -->
      <path d="M16 5 Q17 3 17 1.5" fill="none" stroke="${k}" stroke-width="0.7" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <circle cx="17" cy="1.5" r="0.4" fill="${k}" fill-opacity="${o * 0.4}"/>
      <!-- spiral whorls visible on top -->
      <path d="M14 4 Q13 5 12 5 Q10 5 10 4 Q10 3 12 3" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.5}"/>
      <path d="M12 3 Q13 3.5 13 4.5 Q12.5 5.5 11 5" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.4}"/>
      <!-- shell ridges (horizontal ribs across body) -->
      <path d="M4 4 Q8 3.5 12 4" fill="none" stroke="${coral}" stroke-width="0.4" stroke-opacity="${o * 0.25}"/>
      <path d="M3 6 Q7 5 13 6" fill="none" stroke="${coral}" stroke-width="0.4" stroke-opacity="${o * 0.25}"/>
      <path d="M2 8 Q6 7 14 8" fill="none" stroke="${coral}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
      <path d="M2 10 Q5 9 10 10" fill="none" stroke="${coral}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <!-- flared lip — the big curving opening -->
      <path d="M3 14 Q1 12 1 9 Q0.5 7 0 8 Q-0.5 10 0 12 Q1 15 3 16" fill="${pink}" fill-opacity="${o * 0.25}" stroke="${coral}" stroke-width="0.7" stroke-opacity="${o * 0.5}"/>
      <!-- inner lip — glossy pink interior -->
      <path d="M3 14 Q4 12 5 11 Q6 10 7 11 Q6 13 3 16" fill="${pink}" fill-opacity="${o * 0.15}" stroke="${cream}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <!-- crown spikes along the lip edge -->
      <path d="M4 3 L3.5 1.5" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.4}" stroke-linecap="round"/>
      <path d="M6 2 L5.5 0.5" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.35}" stroke-linecap="round"/>
      <path d="M8 1.5 L8 0" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <!-- sand at base -->
      <path d="M0 16 Q5 15 10 16 Q14 17 18 16" fill="none" stroke="${sand}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
    </svg>`;
    // INACTIVE: conch outline with spire
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="-1 -1 20 20">
      <path d="M3 14 Q1 11 2 7 Q4 3 9 2 Q13 3 16 6 Q17 8 16 10 Q13 10 10 12 Q7 14 3 14Z" fill="${k}" fill-opacity="${o * 0.08}" stroke="${k}" stroke-width="0.7" stroke-opacity="${o}"/>
      <path d="M16 6 Q17 3.5 17 2" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <path d="M3 14 Q1.5 12 1.5 9" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.5}"/>
      <path d="M5 3.5 L5 2" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
    </svg>`;
  },

  treasureChest(theme, activated = false) {
    // culture → #A78BFA
    const k = '#A78BFA';
    const o = activated ? 1 : 0.4;
    const gold = '#FBBF24';
    const wood = '#92400E';
    const dark = '#1E293B';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="-1 -2 20 20">
      <!-- chest base — wooden box sitting on ground -->
      <rect x="2" y="9" width="14" height="7" rx="0.8" fill="${wood}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.8}"/>
      <!-- wood plank lines -->
      <line x1="2.5" y1="12" x2="15.5" y2="12" stroke="${wood}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <line x1="2.5" y1="14" x2="15.5" y2="14" stroke="${wood}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <!-- metal brackets on front -->
      <rect x="2" y="9" width="2" height="1.5" rx="0.2" fill="${dark}" fill-opacity="${o * 0.15}" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <rect x="14" y="9" width="2" height="1.5" rx="0.2" fill="${dark}" fill-opacity="${o * 0.15}" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <!-- LID — wide open, tilted back, hinged at back -->
      <path d="M2 9 L2 6 Q5 3 9 2 Q13 3 16 6 L16 9" fill="${wood}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.7}"/>
      <path d="M2 6 Q9 3.5 16 6" fill="none" stroke="${wood}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <!-- hinge detail -->
      <circle cx="2.5" cy="9" r="0.5" fill="${dark}" fill-opacity="${o * 0.3}"/>
      <circle cx="15.5" cy="9" r="0.5" fill="${dark}" fill-opacity="${o * 0.3}"/>
      <!-- GOLD overflowing from inside — coins piling up and spilling over edge -->
      <circle cx="5" cy="8" r="1.2" fill="${gold}" fill-opacity="${o * 0.6}" stroke="${gold}" stroke-width="0.4" stroke-opacity="${o * 0.5}"/>
      <circle cx="8" cy="7.5" r="1.1" fill="${gold}" fill-opacity="${o * 0.6}" stroke="${gold}" stroke-width="0.4" stroke-opacity="${o * 0.5}"/>
      <circle cx="11" cy="7.5" r="1.2" fill="${gold}" fill-opacity="${o * 0.6}" stroke="${gold}" stroke-width="0.4" stroke-opacity="${o * 0.5}"/>
      <circle cx="13.5" cy="8" r="1" fill="${gold}" fill-opacity="${o * 0.55}" stroke="${gold}" stroke-width="0.4" stroke-opacity="${o * 0.45}"/>
      <!-- coins flying/bouncing out -->
      <circle cx="3" cy="5.5" r="0.8" fill="${gold}" fill-opacity="${o * 0.5}" stroke="${gold}" stroke-width="0.3" stroke-opacity="${o * 0.4}"/>
      <circle cx="9" cy="4.5" r="0.9" fill="${gold}" fill-opacity="${o * 0.5}" stroke="${gold}" stroke-width="0.3" stroke-opacity="${o * 0.4}"/>
      <circle cx="15" cy="5" r="0.7" fill="${gold}" fill-opacity="${o * 0.45}"/>
      <circle cx="6" cy="3.5" r="0.6" fill="${gold}" fill-opacity="${o * 0.4}"/>
      <circle cx="12" cy="3" r="0.65" fill="${gold}" fill-opacity="${o * 0.4}"/>
      <!-- coins in the air! -->
      <circle cx="4" cy="1" r="0.5" fill="${gold}" fill-opacity="${o * 0.35}"/>
      <circle cx="9" cy="0" r="0.55" fill="${gold}" fill-opacity="${o * 0.35}"/>
      <circle cx="14" cy="1.5" r="0.5" fill="${gold}" fill-opacity="${o * 0.3}"/>
      <!-- sparkle/shine lines radiating from treasure -->
      <line x1="1" y1="4" x2="0" y2="3" stroke="${gold}" stroke-width="0.4" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <line x1="17" y1="4" x2="18" y2="3" stroke="${gold}" stroke-width="0.4" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <line x1="9" y1="-1" x2="9" y2="-2" stroke="${gold}" stroke-width="0.4" stroke-opacity="${o * 0.25}" stroke-linecap="round"/>
      <line x1="5" y1="0" x2="4.5" y2="-1" stroke="${gold}" stroke-width="0.3" stroke-opacity="${o * 0.2}" stroke-linecap="round"/>
      <line x1="13" y1="0" x2="13.5" y2="-1" stroke="${gold}" stroke-width="0.3" stroke-opacity="${o * 0.2}" stroke-linecap="round"/>
      <!-- jewel gems among the gold -->
      <circle cx="7" cy="6" r="0.5" fill="#F87171" fill-opacity="${o * 0.55}"/>
      <circle cx="10" cy="6.5" r="0.45" fill="#2DD4BF" fill-opacity="${o * 0.5}"/>
      <circle cx="6" cy="1.5" r="0.35" fill="#38BDF8" fill-opacity="${o * 0.4}"/>
      <!-- lock hanging open on front -->
      <rect x="7.5" y="10" width="3" height="2.5" rx="0.5" fill="${gold}" fill-opacity="${o * 0.35}" stroke="${gold}" stroke-width="0.4" stroke-opacity="${o * 0.5}"/>
      <circle cx="9" cy="11" r="0.4" fill="${dark}" fill-opacity="${o * 0.4}"/>
    </svg>`;
    // INACTIVE: closed chest with domed lid and lock
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 18 16">
      <!-- box -->
      <rect x="3" y="8" width="12" height="6" rx="0.5" fill="${k}" fill-opacity="${o * 0.1}" stroke="${k}" stroke-width="0.7" stroke-opacity="${o}"/>
      <!-- domed lid -->
      <path d="M3 8 Q5 5 9 4 Q13 5 15 8" fill="${k}" fill-opacity="${o * 0.08}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.7}"/>
      <!-- lid plank hint -->
      <path d="M5 6.5 Q9 5.5 13 6.5" fill="none" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <!-- metal band across lid -->
      <line x1="3" y1="8" x2="15" y2="8" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
      <!-- lock -->
      <circle cx="9" cy="10" r="0.7" fill="${k}" fill-opacity="${o * 0.4}"/>
      <rect x="8.6" y="10" width="0.8" height="1" fill="${k}" fill-opacity="${o * 0.3}"/>
      <!-- corner brackets hint -->
      <rect x="3" y="8" width="1.5" height="1.5" rx="0.2" fill="${k}" fill-opacity="${o * 0.1}" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <rect x="13.5" y="8" width="1.5" height="1.5" rx="0.2" fill="${k}" fill-opacity="${o * 0.1}" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
    </svg>`;
  },

  gibsonton(theme, activated = false) {
    // spooky → #C084FC
    const k = '#C084FC';
    const o = activated ? 1 : 0.4;
    const red = '#F87171';
    const gold = '#FBBF24';
    const stripe = '#FB923C';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18">
      <!-- carnival tent — big top with stripes -->
      <path d="M2 14 L10 2 L18 14" fill="${k}" fill-opacity="${o * 0.15}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.8}"/>
      <!-- tent stripes (alternating) -->
      <path d="M10 2 L6 14" fill="none" stroke="${red}" stroke-width="1.5" stroke-opacity="${o * 0.25}"/>
      <path d="M10 2 L14 14" fill="none" stroke="${red}" stroke-width="1.5" stroke-opacity="${o * 0.25}"/>
      <path d="M10 2 L3 14" fill="none" stroke="${stripe}" stroke-width="1" stroke-opacity="${o * 0.15}"/>
      <path d="M10 2 L17 14" fill="none" stroke="${stripe}" stroke-width="1" stroke-opacity="${o * 0.15}"/>
      <!-- tent peak flag -->
      <line x1="10" y1="2" x2="10" y2="0" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.6}"/>
      <path d="M10 0 L12.5 1 L10 1.5" fill="${red}" fill-opacity="${o * 0.5}" stroke="${red}" stroke-width="0.3" stroke-opacity="${o * 0.4}"/>
      <!-- tent entrance — dark opening -->
      <path d="M8 14 L10 10 L12 14" fill="#1E293B" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.4}"/>
      <!-- entrance curtain lines -->
      <line x1="9.5" y1="10.5" x2="9" y2="14" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <line x1="10.5" y1="10.5" x2="11" y2="14" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <!-- string lights across front -->
      <path d="M3 12 Q6 11 10 11.5 Q14 11 17 12" fill="none" stroke="${gold}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <circle cx="5" cy="11.5" r="0.5" fill="${gold}" fill-opacity="${o * 0.5}"/>
      <circle cx="8" cy="11.2" r="0.5" fill="${red}" fill-opacity="${o * 0.5}"/>
      <circle cx="12" cy="11.2" r="0.5" fill="${gold}" fill-opacity="${o * 0.5}"/>
      <circle cx="15" cy="11.5" r="0.5" fill="${red}" fill-opacity="${o * 0.5}"/>
      <!-- "SHOW" banner hint -->
      <rect x="5.5" y="12.5" width="9" height="1.5" rx="0.3" fill="${gold}" fill-opacity="${o * 0.2}" stroke="${gold}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <!-- ground line -->
      <line x1="0" y1="14.5" x2="20" y2="14.5" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
      <!-- sideshow stars -->
      <circle cx="3" cy="5" r="0.4" fill="${gold}" fill-opacity="${o * 0.3}"/>
      <circle cx="17" cy="6" r="0.35" fill="${gold}" fill-opacity="${o * 0.25}"/>
    </svg>`;
    // INACTIVE: carnival tent with stripes and entrance
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18">
      <path d="M4 14 L10 4 L16 14" fill="${k}" fill-opacity="${o * 0.08}" stroke="${k}" stroke-width="0.7" stroke-opacity="${o}"/>
      <!-- stripe hints -->
      <path d="M10 4 L7 14" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <path d="M10 4 L13 14" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <!-- entrance opening -->
      <path d="M9 14 L10 11 L11 14" fill="${k}" fill-opacity="${o * 0.15}"/>
      <!-- flag on top -->
      <line x1="10" y1="4" x2="10" y2="2.5" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.5}"/>
      <path d="M10 2.5 L11.5 3 L10 3.3" fill="${k}" fill-opacity="${o * 0.3}"/>
      <!-- ground line -->
      <line x1="2" y1="14.5" x2="18" y2="14.5" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.25}"/>
      <!-- string light dots -->
      <circle cx="7" cy="11" r="0.3" fill="${k}" fill-opacity="${o * 0.3}"/>
      <circle cx="10" cy="10.5" r="0.3" fill="${k}" fill-opacity="${o * 0.3}"/>
      <circle cx="13" cy="11" r="0.3" fill="${k}" fill-opacity="${o * 0.3}"/>
    </svg>`;
  },

  spookHill(theme, activated = false) {
    // spooky → #C084FC
    const k = '#C084FC';
    const o = activated ? 1 : 0.4;
    const green = '#4ADE80';
    const dark = '#1E293B';
    const gray = '#94A3B8';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="14" viewBox="0 0 20 14">
      <!-- hill slope — gradual incline -->
      <path d="M0 12 Q5 9 10 7 Q15 9 20 12" fill="${green}" fill-opacity="${o * 0.1}" stroke="${green}" stroke-width="0.6" stroke-opacity="${o * 0.4}"/>
      <!-- road surface on hill -->
      <path d="M1 11.5 Q5 9 10 7.5 Q15 9 19 11.5" fill="${gray}" fill-opacity="${o * 0.08}" stroke="${gray}" stroke-width="0.4" stroke-opacity="${o * 0.2}"/>
      <!-- road center line (dashed) -->
      <path d="M3 11 Q7 9 10 8 Q13 9 17 11" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.3}" stroke-dasharray="1.5 1"/>
      <!-- car — on LEFT side, facing uphill to the right -->
      <g transform="rotate(8 5 9)">
        <!-- car body lower -->
        <rect x="2.5" y="8" width="5" height="1.8" rx="0.4" fill="${dark}" fill-opacity="${o * 0.35}" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.6}"/>
        <!-- car cabin/roof -->
        <rect x="3.5" y="6.7" width="3" height="1.5" rx="0.5" fill="${dark}" fill-opacity="${o * 0.25}" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.5}"/>
        <!-- windshield (front, right side) -->
        <path d="M6.5 8 L6 6.9" fill="none" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.4}"/>
        <!-- rear window -->
        <path d="M3.5 8 L4 6.9" fill="none" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.4}"/>
      </g>
      <!-- wheels -->
      <circle cx="4" cy="10" r="0.7" fill="${dark}" fill-opacity="${o * 0.6}" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <circle cx="7" cy="9.5" r="0.7" fill="${dark}" fill-opacity="${o * 0.6}" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <!-- arrow showing car rolling uphill (pointing right/up the hill) -->
      <path d="M8 6.5 L10 5.5" fill="none" stroke="${k}" stroke-width="0.7" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <path d="M9 6 L10 5.5 L9.5 6.5" fill="none" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- BIG question marks — prominent, spread across -->
      <text x="10" y="4.5" font-size="4" font-weight="bold" font-family="sans-serif" fill="${k}" fill-opacity="${o * 0.7}">?</text>
      <text x="14" y="3" font-size="3.5" font-weight="bold" font-family="sans-serif" fill="${k}" fill-opacity="${o * 0.6}">?</text>
      <text x="17" y="5" font-size="3" font-weight="bold" font-family="sans-serif" fill="${k}" fill-opacity="${o * 0.5}">?</text>
      <!-- ground -->
      <line x1="0" y1="12.5" x2="20" y2="12.5" stroke="${green}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
    </svg>`;
    // INACTIVE: hill slope with question marks and road hint
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="14" viewBox="0 0 20 14">
      <path d="M1 12 Q10 7 19 5" fill="none" stroke="${k}" stroke-width="0.8" stroke-opacity="${o}"/>
      <!-- road dashes on hill -->
      <path d="M5 10.5 Q10 8 15 6.5" fill="none" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.3}" stroke-dasharray="1 1"/>
      <!-- question marks -->
      <text x="6" y="5" font-size="3.5" font-family="sans-serif" fill="${k}" fill-opacity="${o * 0.7}">?</text>
      <text x="11" y="3.5" font-size="2.5" font-family="sans-serif" fill="${k}" fill-opacity="${o * 0.5}">?</text>
      <!-- ground fill hint -->
      <path d="M1 12 Q10 7 19 5 L19 13 L1 13Z" fill="${k}" fill-opacity="${o * 0.05}"/>
    </svg>`;
  },

  joyland(theme, activated = false) {
    // spooky → #C084FC
    const k = '#C084FC';
    const o = activated ? 1 : 0.4;
    const rust = '#92400E';
    const red = '#F87171';
    const gold = '#FBBF24';
    const dark = '#1E293B';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <!-- ferris wheel rim — rusted, slightly tilted -->
      <circle cx="10" cy="10" r="8" fill="none" stroke="${rust}" stroke-width="0.8" stroke-opacity="${o * 0.5}" stroke-dasharray="2 0.5"/>
      <!-- inner ring -->
      <circle cx="10" cy="10" r="5.5" fill="none" stroke="${rust}" stroke-width="0.4" stroke-opacity="${o * 0.25}"/>
      <!-- spokes -->
      <line x1="10" y1="2" x2="10" y2="18" stroke="${rust}" stroke-width="0.5" stroke-opacity="${o * 0.3}"/>
      <line x1="2" y1="10" x2="18" y2="10" stroke="${rust}" stroke-width="0.5" stroke-opacity="${o * 0.3}"/>
      <line x1="4.3" y1="4.3" x2="15.7" y2="15.7" stroke="${rust}" stroke-width="0.4" stroke-opacity="${o * 0.25}"/>
      <line x1="15.7" y1="4.3" x2="4.3" y2="15.7" stroke="${rust}" stroke-width="0.4" stroke-opacity="${o * 0.25}"/>
      <!-- gondola cars — hanging, some empty, some broken -->
      <rect x="9" y="1.5" width="2" height="1.5" rx="0.3" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.5}"/>
      <rect x="17" y="9" width="2" height="1.5" rx="0.3" fill="${red}" fill-opacity="${o * 0.25}" stroke="${rust}" stroke-width="0.4" stroke-opacity="${o * 0.4}"/>
      <rect x="14.5" y="15" width="2" height="1.5" rx="0.3" fill="${gold}" fill-opacity="${o * 0.25}" stroke="${rust}" stroke-width="0.4" stroke-opacity="${o * 0.4}"/>
      <rect x="9" y="17.5" width="2" height="1.5" rx="0.3" fill="${k}" fill-opacity="${o * 0.2}" stroke="${rust}" stroke-width="0.4" stroke-opacity="${o * 0.35}"/>
      <rect x="3.5" y="15" width="2" height="1.5" rx="0.3" fill="${red}" fill-opacity="${o * 0.2}" stroke="${rust}" stroke-width="0.4" stroke-opacity="${o * 0.35}"/>
      <rect x="1" y="9" width="2" height="1.5" rx="0.3" fill="${gold}" fill-opacity="${o * 0.2}" stroke="${rust}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <!-- missing gondola at top-right (broken/abandoned) -->
      <line x1="15.7" y1="4.3" x2="16.2" y2="4.8" stroke="${rust}" stroke-width="0.4" stroke-opacity="${o * 0.2}" stroke-linecap="round"/>
      <!-- center hub -->
      <circle cx="10" cy="10" r="1.5" fill="${dark}" fill-opacity="${o * 0.2}" stroke="${rust}" stroke-width="0.6" stroke-opacity="${o * 0.5}"/>
      <!-- rust spots on rim -->
      <circle cx="14" cy="3" r="0.4" fill="${rust}" fill-opacity="${o * 0.2}"/>
      <circle cx="17" cy="7" r="0.35" fill="${rust}" fill-opacity="${o * 0.15}"/>
      <circle cx="4" cy="16" r="0.3" fill="${rust}" fill-opacity="${o * 0.15}"/>
      <!-- overgrown vine hints -->
      <path d="M3 8 Q2 7 2.5 6" fill="none" stroke="#4ADE80" stroke-width="0.4" stroke-opacity="${o * 0.2}" stroke-linecap="round"/>
      <path d="M16 14 Q17 13.5 17 12.5" fill="none" stroke="#4ADE80" stroke-width="0.3" stroke-opacity="${o * 0.15}" stroke-linecap="round"/>
      <!-- A-frame support legs to ground -->
      <line x1="10" y1="10" x2="6" y2="19" stroke="${rust}" stroke-width="0.7" stroke-opacity="${o * 0.4}"/>
      <line x1="10" y1="10" x2="14" y2="19" stroke="${rust}" stroke-width="0.7" stroke-opacity="${o * 0.4}"/>
      <!-- ground line -->
      <line x1="3" y1="19.5" x2="17" y2="19.5" stroke="${rust}" stroke-width="0.4" stroke-opacity="${o * 0.25}"/>
    </svg>`;
    // INACTIVE: ferris wheel connected to ground with A-frame support
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <circle cx="10" cy="9" r="6.5" fill="none" stroke="${k}" stroke-width="0.6" stroke-opacity="${o}" stroke-dasharray="2 1"/>
      <line x1="10" y1="2.5" x2="10" y2="15.5" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.4}"/>
      <line x1="3.5" y1="9" x2="16.5" y2="9" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.4}"/>
      <circle cx="10" cy="9" r="1" fill="${k}" fill-opacity="${o * 0.3}"/>
      <!-- A-frame support legs going to ground -->
      <line x1="10" y1="9" x2="6" y2="19" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.5}"/>
      <line x1="10" y1="9" x2="14" y2="19" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.5}"/>
      <!-- ground line -->
      <line x1="3" y1="19" x2="17" y2="19" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
    </svg>`;
  },

  babeRuth(theme, activated = false) {
    // sport → #F87171
    const k = '#F87171';
    const o = activated ? 1 : 0.4;
    const white = '#F8FAFC';
    const brown = '#92400E';
    const red = '#DC2626';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <!-- bat — angled, on the left side -->
      <path d="M1 14 L1.5 13.5 L8 5 L8.5 4 Q9 3 8.5 2.5 Q8 2 7.5 2.5 L7 3 L1 13.5Z" fill="${brown}" fill-opacity="${o * 0.4}" stroke="${brown}" stroke-width="0.7" stroke-opacity="${o * 0.7}"/>
      <!-- bat handle grip -->
      <line x1="1.5" y1="13" x2="2.2" y2="12" stroke="${brown}" stroke-width="0.3" stroke-opacity="${o * 0.3}"/>
      <line x1="1.8" y1="12.5" x2="2.5" y2="11.5" stroke="${brown}" stroke-width="0.3" stroke-opacity="${o * 0.25}"/>
      <!-- bat knob -->
      <circle cx="0.8" cy="14.3" r="0.6" fill="${brown}" fill-opacity="${o * 0.45}"/>
      <!-- baseball — on the right side, just barely touching the bat tip -->
      <circle cx="11.5" cy="5.5" r="3.2" fill="${white}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.8}"/>
      <!-- stitching — classic S-curves -->
      <path d="M9.2 3.8 Q11.5 2.5 13.8 3.8" fill="none" stroke="${red}" stroke-width="0.5" stroke-opacity="${o * 0.5}"/>
      <path d="M9.2 7.2 Q11.5 8.5 13.8 7.2" fill="none" stroke="${red}" stroke-width="0.5" stroke-opacity="${o * 0.5}"/>
      <!-- stitch marks -->
      <path d="M9.5 4 L9.7 4.5 M10.5 3.5 L10.6 4 M11.5 3.2 L11.5 3.7 M12.5 3.5 L12.3 4 M13.5 4 L13.2 4.5" fill="none" stroke="${red}" stroke-width="0.3" stroke-opacity="${o * 0.4}"/>
      <path d="M9.5 7 L9.7 6.5 M10.5 7.5 L10.6 7 M11.5 7.8 L11.5 7.3 M12.5 7.5 L12.3 7 M13.5 7 L13.2 6.5" fill="none" stroke="${red}" stroke-width="0.3" stroke-opacity="${o * 0.4}"/>
      <!-- motion arcs — ball just hit -->
      <path d="M14.5 3 Q15 2 15.5 2.5" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <path d="M15 2 Q15.5 1 16 1.5" fill="none" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.25}" stroke-linecap="round"/>
      <!-- impact spark at contact point -->
      <line x1="8.5" y1="4.5" x2="7.5" y2="3.5" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <line x1="9" y1="3.5" x2="8" y2="2.5" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.25}" stroke-linecap="round"/>
    </svg>`;
    // INACTIVE: baseball with stitching
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="3.8" fill="${k}" fill-opacity="${o * 0.08}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o}"/>
      <path d="M5.5 6 Q8 4.5 10.5 6" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.6}"/>
      <path d="M5.5 10 Q8 11.5 10.5 10" fill="none" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.6}"/>
      <path d="M6.5 6.3 L6.7 6.8 M8 5.6 L8 6.1 M9.5 6.3 L9.3 6.8" fill="none" stroke="${k}" stroke-width="0.25" stroke-opacity="${o * 0.4}"/>
    </svg>`;
  },

  phosphateMining(theme, activated = false) {
    // culture → #A78BFA
    const k = '#A78BFA';
    const o = activated ? 1 : 0.4;
    const rust = '#92400E';
    const gray = '#94A3B8';
    const bone = '#FDE68A';
    const dirt = '#D4A04A';
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16">
      <!-- big phosphate mound — irregularly shaped pile -->
      <path d="M0 14 Q2 10 5 8 Q7 7 9 7.5 Q11 6.5 13 7 Q16 8 18 10 Q20 12 20 14Z" fill="${dirt}" fill-opacity="${o * 0.2}" stroke="${k}" stroke-width="0.7" stroke-opacity="${o * 0.6}"/>
      <!-- mound texture — layers showing strata -->
      <path d="M2 12 Q6 10 10 10 Q14 10 18 12" fill="none" stroke="${dirt}" stroke-width="0.4" stroke-opacity="${o * 0.25}"/>
      <path d="M4 10 Q7 9 10 9 Q13 9 16 10" fill="none" stroke="${dirt}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <!-- rocks/chunks on the mound -->
      <circle cx="6" cy="10" r="0.7" fill="${dirt}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <circle cx="10" cy="9" r="0.8" fill="${dirt}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="0.3" stroke-opacity="${o * 0.2}"/>
      <circle cx="14" cy="9.5" r="0.6" fill="${dirt}" fill-opacity="${o * 0.25}"/>
      <circle cx="8" cy="11" r="0.5" fill="${dirt}" fill-opacity="${o * 0.2}"/>
      <circle cx="12" cy="10.5" r="0.55" fill="${dirt}" fill-opacity="${o * 0.2}"/>
      <!-- mine cart at base of mound -->
      <path d="M2 13.5 L5 13.5 L5.5 11.5 L1.5 11.5Z" fill="${gray}" fill-opacity="${o * 0.35}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o * 0.6}"/>
      <!-- cart rocks -->
      <circle cx="2.5" cy="12" r="0.5" fill="${dirt}" fill-opacity="${o * 0.4}"/>
      <circle cx="3.5" cy="11.8" r="0.55" fill="${dirt}" fill-opacity="${o * 0.35}"/>
      <circle cx="4.2" cy="12.2" r="0.45" fill="${dirt}" fill-opacity="${o * 0.3}"/>
      <!-- cart wheels -->
      <circle cx="2.5" cy="14" r="0.6" fill="${gray}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.5}"/>
      <circle cx="4.5" cy="14" r="0.6" fill="${gray}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.5}"/>
      <!-- rail tracks under cart -->
      <line x1="0" y1="14.5" x2="8" y2="14.5" stroke="${gray}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <!-- fossil bones embedded in mound face -->
      <path d="M15 8.5 L16.5 8 L16 9" fill="none" stroke="${bone}" stroke-width="0.6" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <circle cx="15" cy="8.5" r="0.35" fill="${bone}" fill-opacity="${o * 0.4}"/>
      <circle cx="16" cy="9" r="0.3" fill="${bone}" fill-opacity="${o * 0.35}"/>
      <!-- more fossil hints -->
      <path d="M7 8.5 L8 8" fill="none" stroke="${bone}" stroke-width="0.4" stroke-opacity="${o * 0.3}" stroke-linecap="round"/>
      <circle cx="7" cy="8.5" r="0.25" fill="${bone}" fill-opacity="${o * 0.3}"/>
      <!-- dust particles -->
      <circle cx="17" cy="7" r="0.4" fill="${k}" fill-opacity="${o * 0.1}"/>
      <circle cx="18" cy="6.5" r="0.3" fill="${k}" fill-opacity="${o * 0.08}"/>
      <circle cx="16" cy="6" r="0.25" fill="${k}" fill-opacity="${o * 0.06}"/>
      <!-- ground line -->
      <line x1="0" y1="15" x2="20" y2="15" stroke="${dirt}" stroke-width="0.3" stroke-opacity="${o * 0.15}"/>
    </svg>`;
    // INACTIVE: pit with cart silhouette
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16">
      <path d="M2 12 L6 8 L14 8 L18 12" fill="${k}" fill-opacity="${o * 0.06}" stroke="${k}" stroke-width="0.6" stroke-opacity="${o}"/>
      <path d="M7 11 L9 11 L9.5 9 L6.5 9Z" fill="${k}" fill-opacity="${o * 0.15}" stroke="${k}" stroke-width="0.4" stroke-opacity="${o * 0.5}"/>
      <circle cx="7.5" cy="11.5" r="0.5" fill="${k}" fill-opacity="${o * 0.3}"/>
      <circle cx="9" cy="11.5" r="0.5" fill="${k}" fill-opacity="${o * 0.3}"/>
    </svg>`;
  },



  sharkTooth(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="18" viewBox="0 0 14 18">
      <path d="M7 0 Q2 6 1 10 Q0 15 4 18 Q6 19 7 18 Q8 19 10 18 Q14 15 13 10 Q12 6 7 0Z" fill="${c.stroke}" fill-opacity="${c.op * 0.3}" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op}"/>
      <path d="M3 8 L4.5 6 L6 8 L7 4 L8 8 L9.5 6 L11 8" fill="none" stroke="${c.fill}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <line x1="7" y1="0" x2="7" y2="18" stroke="${c.fill}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}"/>
      <path d="M1 10 Q0 8 1 6" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <path d="M13 10 Q14 8 13 6" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <path d="M4 14 Q5 13 6 14 Q7 15 8 14 Q9 13 10 14" fill="none" stroke="${c.fill}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <circle cx="5" cy="11" r="0.4" fill="${c.accent}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="9" cy="11" r="0.4" fill="${c.accent}" fill-opacity="${c.op * 0.3}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="18" viewBox="0 0 14 18">
      <path d="M5 16 L7 12 L9 16" fill="${c.accent}" fill-opacity="${c.op * 0.08}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.25}"/>
      <circle cx="5" cy="17" r="0.5" fill="${c.accent}" fill-opacity="${c.op * 0.15}"/>
      <circle cx="9" cy="17" r="0.4" fill="${c.accent}" fill-opacity="${c.op * 0.12}"/>
      <circle cx="7" cy="17.5" r="0.35" fill="${c.accent}" fill-opacity="${c.op * 0.1}"/>
    </svg>`;
  },

  tarponFish(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16">
      <path d="M0 11 Q6 10 12 11 Q18 12 24 11" fill="none" stroke="${c.water}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}"/>
      <path d="M8 11 Q7 6 9 2 Q10 0 11 0 Q12 0 13 2 Q15 6 14 11" fill="${c.fill}" fill-opacity="${c.op * 0.25}" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op * 0.7}"/>
      <path d="M8 11 Q7 13 5 14 Q7 12 9 11" fill="${c.fill}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <path d="M14 11 Q15 13 17 14 Q15 12 13 11" fill="${c.fill}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <circle cx="10" cy="3.5" r="0.6" fill="${c.stroke}" fill-opacity="${c.op * 0.6}"/>
      <path d="M9 4 L9 8" stroke="${c.fill}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <path d="M11 3 L11 8" stroke="${c.fill}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <path d="M13 4 L13 8" stroke="${c.fill}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <circle cx="4" cy="10" r="0.5" fill="${c.water}" fill-opacity="${c.op * 0.4}"/>
      <circle cx="18" cy="10.5" r="0.4" fill="${c.water}" fill-opacity="${c.op * 0.35}"/>
      <circle cx="11" cy="13" r="0.35" fill="${c.water}" fill-opacity="${c.op * 0.3}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16">
      <path d="M0 10 Q6 9 12 10 Q18 11 24 10" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
      <path d="M10 10 Q11 8 12 10" fill="none" stroke="${c.fill}" stroke-width="0.6" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
      <circle cx="9" cy="9.5" r="0.4" fill="${c.water}" fill-opacity="${c.op * 0.25}"/>
      <circle cx="13" cy="9" r="0.35" fill="${c.water}" fill-opacity="${c.op * 0.2}"/>
    </svg>`;
  },

  shipwreck(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16">
      <path d="M0 5 Q6 4 12 5 Q18 6 24 5" fill="none" stroke="${c.water}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}"/>
      <path d="M6 8 Q8 7 11 8 L18 8 Q19.5 8.5 19 10 L18 12 Q15 14 10 13 L7 12 Q5 11 6 8Z" fill="${c.brown}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" transform="rotate(-20 12 10)"/>
      <line x1="10" y1="5" x2="9.5" y2="9" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.5}"/>
      <line x1="14" y1="4.5" x2="13.5" y2="8" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.45}"/>
      <path d="M10 5 L10.5 4 L9.5 4.5" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <circle cx="8" cy="11" r="0.5" fill="${c.water}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="10" cy="12.5" r="0.4" fill="${c.water}" fill-opacity="${c.op * 0.25}"/>
      <circle cx="12" cy="13.5" r="0.35" fill="${c.water}" fill-opacity="${c.op * 0.2}"/>
      <circle cx="15" cy="12" r="0.4" fill="${c.water}" fill-opacity="${c.op * 0.2}"/>
      <path d="M0 14 Q6 13 12 14 Q18 15 24 14" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.25}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16">
      <path d="M0 6 Q6 5 12 6 Q18 7 24 6" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
      <line x1="10" y1="6" x2="9.5" y2="3" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
      <line x1="15" y1="6" x2="14.5" y2="3.5" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.25}" stroke-linecap="round"/>
    </svg>`;
  },

  mantaRay(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 24 18">
      <path d="M12 3 Q5 0 0 4 Q3 7 7 6 Q10 5 12 6 Q14 5 17 6 Q21 7 24 4 Q19 0 12 3Z" fill="${c.water}" fill-opacity="${c.op * 0.25}" stroke="${c.water}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M12 6 Q12 9 11 14" fill="none" stroke="${c.water}" stroke-width="0.6" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <circle cx="10" cy="4.5" r="0.5" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="14" cy="4.5" r="0.5" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <path d="M10 5.5 L12 6.5 L14 5.5" fill="none" stroke="${c.water}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 24 18">
      <path d="M12 4 Q6 2 1 6 Q4 8 8 7 Q10 6 12 7 Q14 6 16 7 Q20 8 23 6 Q18 2 12 4Z" fill="${c.water}" fill-opacity="${c.op * 0.2}" stroke="${c.water}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M12 7 Q12 10 11 15" fill="none" stroke="${c.water}" stroke-width="0.6" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <circle cx="10" cy="5.5" r="0.5" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="14" cy="5.5" r="0.5" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <path d="M10 6.5 L12 7.5 L14 6.5" fill="none" stroke="${c.water}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
    </svg>`;
  },

  spanishMoss(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="22" viewBox="0 0 16 22">
      <path d="M2 2 Q8 0 14 2" fill="none" stroke="${c.brown}" stroke-width="1" stroke-opacity="${c.op * 0.7}" stroke-linecap="round"/>
      <path d="M5 2 Q4 1 3 2" fill="none" stroke="${c.brown}" stroke-width="0.6" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M11 2 Q12 1 13 2" fill="none" stroke="${c.brown}" stroke-width="0.6" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M3 2 Q2 7 1 12 Q0 17 1 22" fill="none" stroke="${c.fill}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M5 2 Q4 8 3 14 Q2 19 3 22" fill="none" stroke="${c.fill}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M7 2 Q6 8 5.5 14 Q5 19 5 22" fill="none" stroke="${c.fill}" stroke-width="0.45" stroke-opacity="${c.op * 0.45}" stroke-linecap="round"/>
      <path d="M9 2 Q8 8 7.5 14 Q7 19 7.5 22" fill="none" stroke="${c.fill}" stroke-width="0.45" stroke-opacity="${c.op * 0.45}" stroke-linecap="round"/>
      <path d="M11 2 Q10 7 9.5 13 Q9 18 10 22" fill="none" stroke="${c.fill}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M13 2 Q12 7 11.5 13 Q11 18 12 22" fill="none" stroke="${c.fill}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M4 5 Q3 9 2 14 Q1.5 18 2 21" fill="none" stroke="${c.fill}" stroke-width="0.35" stroke-opacity="${c.op * 0.35}" stroke-linecap="round"/>
      <path d="M10 4 Q9 9 8.5 15 Q8 19 9 22" fill="none" stroke="${c.fill}" stroke-width="0.35" stroke-opacity="${c.op * 0.35}" stroke-linecap="round"/>
      <path d="M14 3 Q13 8 13 15 Q13 19 14 22" fill="none" stroke="${c.fill}" stroke-width="0.35" stroke-opacity="${c.op * 0.35}" stroke-linecap="round"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="22" viewBox="0 0 16 22">
      <path d="M4 3 Q8 2 12 3" fill="none" stroke="${c.brown}" stroke-width="0.7" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <path d="M6 3 Q5.5 7 6 11" fill="none" stroke="${c.fill}" stroke-width="0.35" stroke-opacity="${c.op * 0.25}" stroke-linecap="round"/>
      <path d="M8 3 Q7.5 8 8 12" fill="none" stroke="${c.fill}" stroke-width="0.35" stroke-opacity="${c.op * 0.25}" stroke-linecap="round"/>
      <path d="M10 3 Q9.5 7 10 10" fill="none" stroke="${c.fill}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}" stroke-linecap="round"/>
    </svg>`;
  },

  // --- Replacement Batch: Fun Facts & Folklore ---

  greenFlash(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="14" viewBox="0 0 20 14">
      <path d="M0 10 Q5 9 10 10 Q15 11 20 10" fill="none" stroke="${c.water}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}"/>
      <circle cx="10" cy="8" r="4" fill="${c.accent}" fill-opacity="${c.op * 0.2}" stroke="${c.accent}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <path d="M4 8 Q10 1 16 8" fill="${c.green}" fill-opacity="${c.op * 0.5}" stroke="${c.green}" stroke-width="0.6" stroke-opacity="${c.op * 0.7}"/>
      <line x1="10" y1="3" x2="10" y2="0" stroke="${c.green}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}" stroke-linecap="round"/>
      <line x1="6" y1="4" x2="3" y2="1" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op * 0.45}" stroke-linecap="round"/>
      <line x1="14" y1="4" x2="17" y2="1" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op * 0.45}" stroke-linecap="round"/>
      <line x1="8" y1="3" x2="6" y2="0" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
      <line x1="12" y1="3" x2="14" y2="0" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
      <circle cx="6" cy="12" r="0.5" fill="${c.water}" fill-opacity="${c.op * 0.35}"/>
      <circle cx="10" cy="12.5" r="0.4" fill="${c.water}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="14" cy="12" r="0.4" fill="${c.water}" fill-opacity="${c.op * 0.25}"/>
      <path d="M0 13 Q5 12 10 13 Q15 14 20 13" fill="none" stroke="${c.water}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="14" viewBox="0 0 20 14">
      <path d="M0 10 Q5 9 10 10 Q15 11 20 10" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
      <circle cx="10" cy="9.5" r="0.8" fill="${c.green}" fill-opacity="${c.op * 0.2}" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op * 0.25}"/>
    </svg>`;
  },

  unconquered(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="0 0 18 22">
      <line x1="9" y1="1" x2="9" y2="21" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op * 0.7}"/>
      <path d="M9 1 L2 6 L9 4 L16 6 Z" fill="${c.red}" fill-opacity="${c.op * 0.4}" stroke="${c.red}" stroke-width="0.6" stroke-opacity="${c.op * 0.7}"/>
      <path d="M9 7 L4 9.5 L9 8.5 L14 9.5 Z" fill="${c.red}" fill-opacity="${c.op * 0.3}" stroke="${c.red}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <path d="M3 4 Q2 3 3 2" fill="none" stroke="${c.red}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <path d="M15 4 Q16 3 15 2" fill="none" stroke="${c.red}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <circle cx="9" cy="21" r="1" fill="${c.stroke}" fill-opacity="${c.op * 0.25}"/>
      <path d="M5 14 Q9 12 13 14" fill="none" stroke="${c.accent}" stroke-width="0.4" stroke-opacity="${c.op * 0.35}" stroke-linecap="round"/>
      <path d="M6 17 Q9 15 12 17" fill="none" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op * 0.25}" stroke-linecap="round"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="0 0 18 22">
      <line x1="9" y1="6" x2="9" y2="18" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.25}"/>
      <path d="M9 6 L7 7.5 Q8 8 9 7" fill="${c.red}" fill-opacity="${c.op * 0.15}" stroke="${c.red}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}"/>
    </svg>`;
  },

  mangroveTunnels(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="16" viewBox="0 0 22 16">
      <path d="M2 0 Q1 4 0 8 Q-1 12 1 15" fill="none" stroke="${c.green}" stroke-width="0.9" stroke-opacity="${c.op * 0.7}" stroke-linecap="round"/>
      <path d="M20 0 Q21 4 22 8 Q23 12 21 15" fill="none" stroke="${c.green}" stroke-width="0.9" stroke-opacity="${c.op * 0.7}" stroke-linecap="round"/>
      <path d="M2 0 Q7 3 11 3 Q15 3 20 0" fill="${c.green}" fill-opacity="${c.op * 0.3}" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op * 0.6}"/>
      <path d="M0 8 Q5 6 11 6 Q17 6 22 8" fill="none" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}"/>
      <path d="M1 12 Q3 10 5 12" fill="none" stroke="${c.brown}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <path d="M17 11 Q19 9 21 12" fill="none" stroke="${c.brown}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <path d="M3 13 Q5 11 7 13" fill="none" stroke="${c.brown}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
      <path d="M15 12 Q17 10 19 13" fill="none" stroke="${c.brown}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
      <ellipse cx="11" cy="12" rx="2" ry="1.5" fill="${c.accent}" fill-opacity="${c.op * 0.1}"/>
      <path d="M9 12 L10 10 L11 11 L12 10 L13 12" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.25}"/>
      <path d="M0 15 Q6 14 11 15 Q16 16 22 15" fill="none" stroke="${c.water}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}"/>
      <circle cx="8" cy="10" r="0.4" fill="${c.water}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="14" cy="9" r="0.35" fill="${c.water}" fill-opacity="${c.op * 0.25}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="16" viewBox="0 0 22 16">
      <path d="M8 5 Q11 2 14 5" fill="${c.green}" fill-opacity="${c.op * 0.08}" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op * 0.2}"/>
      <path d="M0 14 Q6 13 11 14 Q16 15 22 14" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.2}"/>
      <path d="M8 14 Q8 10 8 5" fill="none" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op * 0.15}"/>
      <path d="M14 14 Q14 10 14 5" fill="none" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op * 0.15}"/>
    </svg>`;
  },

  kerouac(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18">
      <path d="M3 1 L3 17 Q8 16 8 17 L8 1 Z" fill="${c.fill}" fill-opacity="${c.op * 0.12}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <path d="M8 1 L8 17 Q13 16 13 17 L13 1 Z" fill="${c.fill}" fill-opacity="${c.op * 0.1}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <line x1="8" y1="1" x2="8" y2="17" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}"/>
      <line x1="4.5" y1="5" x2="7" y2="5" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.35}"/>
      <line x1="4.5" y1="7" x2="7" y2="7" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.35}"/>
      <line x1="4.5" y1="9" x2="6.5" y2="9" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <line x1="4.5" y1="11" x2="7" y2="11" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <line x1="9" y1="5" x2="12" y2="5" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.35}"/>
      <line x1="9" y1="7" x2="11.5" y2="7" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.35}"/>
      <line x1="9" y1="9" x2="12" y2="9" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <line x1="9" y1="11" x2="11" y2="11" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <rect x="11" y="2" width="1" height="4" rx="0.3" fill="${c.red}" fill-opacity="${c.op * 0.3}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18">
      <path d="M7 8 L8 5 L8 12 L7 9" fill="${c.stroke}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.25}"/>
      <circle cx="8" cy="5" r="0.4" fill="${c.stroke}" fill-opacity="${c.op * 0.2}"/>
    </svg>`;
  },

  bioluminescence(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="14" viewBox="0 0 20 14">
      <path d="M0 5 Q5 4 10 5 Q15 6 20 5" fill="none" stroke="${c.water}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}"/>
      <circle cx="4" cy="7" r="1.8" fill="${c.teal}" fill-opacity="${c.op * 0.4}" stroke="${c.teal}" stroke-width="0.3" stroke-opacity="${c.op * 0.6}"/>
      <circle cx="10" cy="6.5" r="2.2" fill="${c.teal}" fill-opacity="${c.op * 0.35}" stroke="${c.teal}" stroke-width="0.4" stroke-opacity="${c.op * 0.6}"/>
      <circle cx="16" cy="8" r="1.5" fill="${c.teal}" fill-opacity="${c.op * 0.35}" stroke="${c.teal}" stroke-width="0.3" stroke-opacity="${c.op * 0.5}"/>
      <circle cx="2" cy="10" r="0.7" fill="${c.teal}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="7" cy="10" r="0.6" fill="${c.teal}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="12" cy="4" r="0.5" fill="${c.teal}" fill-opacity="${c.op * 0.45}"/>
      <circle cx="18" cy="6" r="0.5" fill="${c.teal}" fill-opacity="${c.op * 0.4}"/>
      <circle cx="6" cy="4" r="0.4" fill="${c.teal}" fill-opacity="${c.op * 0.35}"/>
      <circle cx="14" cy="10" r="0.5" fill="${c.teal}" fill-opacity="${c.op * 0.4}"/>
      <circle cx="8" cy="3" r="0.35" fill="${c.teal}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="19" cy="10" r="0.4" fill="${c.teal}" fill-opacity="${c.op * 0.3}"/>
      <path d="M0 12 Q5 11 10 12 Q15 13 20 12" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="14" viewBox="0 0 20 14">
      <path d="M0 6 Q5 5 10 6 Q15 7 20 6" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.25}"/>
      <circle cx="10" cy="8" r="1" fill="${c.teal}" fill-opacity="${c.op * 0.15}" stroke="${c.teal}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}"/>
      <path d="M0 12 Q5 11 10 12 Q15 13 20 12" fill="none" stroke="${c.water}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}"/>
    </svg>`;
  },

  floridaMan(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
      <circle cx="9" cy="4" r="2.5" fill="${c.accent}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.6}"/>
      <circle cx="8.2" cy="3.5" r="0.4" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="10.2" cy="3.5" r="0.4" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <path d="M8 5.5 Q9 6.2 10 5.5" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <path d="M9 6.5 L9 12" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op * 0.6}" stroke-linecap="round"/>
      <path d="M9 8 L5 6" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M9 8 L14 10" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M9 12 L6 16" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M9 12 L12 16" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <text x="14" y="6" font-size="4" font-family="sans-serif" fill="${c.stroke}" fill-opacity="${c.op * 0.6}">!</text>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
      <rect x="5" y="6" width="8" height="6" rx="0.5" fill="${c.fill}" fill-opacity="${c.op * 0.1}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.25}"/>
      <line x1="6" y1="8" x2="12" y2="8" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}"/>
      <line x1="6" y1="9.5" x2="11" y2="9.5" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}"/>
      <line x1="6" y1="11" x2="10" y2="11" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.15}"/>
    </svg>`;
  },

  hurricaneAlley(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18">
      <path d="M11 2 Q4 0 1 4 Q-1 8 3 12 Q7 15 12 13 Q17 11 19 14 Q22 17 21 12 Q20 6 15 4 Q12 3 11 2Z" fill="${c.water}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op * 0.7}"/>
      <circle cx="11" cy="9" r="2.2" fill="${c.water}" fill-opacity="${c.op * 0.1}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}"/>
      <path d="M11 7 Q14 5 15 8" fill="none" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M9 11 Q6 13 7 10" fill="none" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M13 11 Q15 12 14 10" fill="none" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <line x1="2" y1="5" x2="0" y2="3" stroke="${c.water}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <line x1="4" y1="3" x2="2" y2="1" stroke="${c.water}" stroke-width="0.3" stroke-opacity="${c.op * 0.25}"/>
      <line x1="19" y1="6" x2="21" y2="4" stroke="${c.water}" stroke-width="0.3" stroke-opacity="${c.op * 0.25}"/>
      <path d="M0 16 Q6 15 11 16 Q16 17 22 16" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18">
      <ellipse cx="11" cy="7" rx="6" ry="3" fill="${c.stroke}" fill-opacity="${c.op * 0.06}" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.15}"/>
      <path d="M7 8 L5 10" fill="none" stroke="${c.water}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}" stroke-linecap="round"/>
      <path d="M15 7 L17 9" fill="none" stroke="${c.water}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}" stroke-linecap="round"/>
      <path d="M0 16 Q6 15 11 16 Q16 17 22 16" fill="none" stroke="${c.water}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}"/>
    </svg>`;
  },

  redTide(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="14" viewBox="0 0 20 14">
      <path d="M0 4 Q5 3 10 4 Q15 5 20 4" fill="none" stroke="${c.red}" stroke-width="0.7" stroke-opacity="${c.op * 0.6}"/>
      <path d="M0 7 Q5 6 10 7 Q15 8 20 7" fill="${c.red}" fill-opacity="${c.op * 0.2}" stroke="${c.red}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}"/>
      <path d="M0 10 Q5 9 10 10 Q15 11 20 10" fill="${c.red}" fill-opacity="${c.op * 0.15}" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <circle cx="3" cy="5" r="0.7" fill="${c.red}" fill-opacity="${c.op * 0.45}"/>
      <circle cx="7" cy="5.5" r="0.6" fill="${c.red}" fill-opacity="${c.op * 0.4}"/>
      <circle cx="11" cy="5" r="0.5" fill="${c.red}" fill-opacity="${c.op * 0.35}"/>
      <circle cx="15" cy="5.5" r="0.6" fill="${c.red}" fill-opacity="${c.op * 0.4}"/>
      <circle cx="5" cy="8" r="0.5" fill="${c.red}" fill-opacity="${c.op * 0.35}"/>
      <circle cx="9" cy="8.5" r="0.45" fill="${c.red}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="13" cy="8" r="0.5" fill="${c.red}" fill-opacity="${c.op * 0.35}"/>
      <circle cx="17" cy="8.5" r="0.4" fill="${c.red}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="2" cy="11" r="0.4" fill="${c.red}" fill-opacity="${c.op * 0.25}"/>
      <circle cx="8" cy="11" r="0.35" fill="${c.red}" fill-opacity="${c.op * 0.25}"/>
      <circle cx="18" cy="11" r="0.35" fill="${c.red}" fill-opacity="${c.op * 0.2}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="14" viewBox="0 0 20 14">
      <path d="M0 7 Q5 6 10 7 Q15 8 20 7" fill="none" stroke="${c.red}" stroke-width="0.4" stroke-opacity="${c.op * 0.2}"/>
    </svg>`;
  },

  honeymoonIsland(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="16" viewBox="0 0 22 16">
      <path d="M3 12 Q6 8 9 7 Q11 6 13 7 Q16 8 19 12" fill="${c.green}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}"/>
      <line x1="11" y1="7" x2="11" y2="1" stroke="${c.brown}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M11 1 Q8 0 6 2 Q8 1 11 2 Q14 1 16 2 Q14 0 11 1Z" fill="${c.green}" fill-opacity="${c.op * 0.35}" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <path d="M16 3 Q18 1 20 3" fill="none" stroke="${c.accent}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <circle cx="19" cy="2" r="1" fill="${c.red}" fill-opacity="${c.op * 0.35}" stroke="${c.red}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
      <path d="M3 5 Q2 4 3 3" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <path d="M5 4 Q4 3 5 2" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.25}"/>
      <path d="M0 13 Q6 12 11 13 Q16 14 22 13" fill="none" stroke="${c.water}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}"/>
      <path d="M0 15 Q6 14 11 15 Q16 16 22 15" fill="none" stroke="${c.water}" stroke-width="0.3" stroke-opacity="${c.op * 0.25}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="16" viewBox="0 0 22 16">
      <path d="M0 12 Q6 11 11 12 Q16 13 22 12" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.25}"/>
      <path d="M9 12 Q10 10 11 12 Q12 10 13 12" fill="${c.accent}" fill-opacity="${c.op * 0.08}" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op * 0.15}"/>
    </svg>`;
  },

  ghostOrchid(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 16 20">
      <line x1="8" y1="0" x2="8" y2="7" stroke="${c.green}" stroke-width="0.6" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M5 2 Q8 1 11 2" fill="none" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <path d="M8 7 Q3 5 1 8 Q0 11 3 13 Q5 14 8 11 Q11 14 13 13 Q16 11 15 8 Q13 5 8 7Z" fill="${c.fill}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.7}"/>
      <path d="M8 11 Q6 15 4 18" fill="none" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.6}" stroke-linecap="round"/>
      <path d="M8 11 Q10 15 12 18" fill="none" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.6}" stroke-linecap="round"/>
      <path d="M4 18 Q3 19 2 20" fill="none" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <path d="M12 18 Q13 19 14 20" fill="none" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <path d="M4 18 Q5 19 6 20" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
      <path d="M12 18 Q11 19 10 20" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
      <circle cx="8" cy="9.5" r="0.7" fill="${c.accent}" fill-opacity="${c.op * 0.45}"/>
      <circle cx="3" cy="3" r="0.4" fill="${c.green}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="13" cy="2" r="0.35" fill="${c.green}" fill-opacity="${c.op * 0.25}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 16 20">
      <line x1="8" y1="2" x2="8" y2="10" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
      <path d="M7 9 Q8 8 9 9 Q9.5 10 8 10.5 Q6.5 10 7 9Z" fill="${c.fill}" fill-opacity="${c.op * 0.1}" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}"/>
    </svg>`;
  },
};

// ---------------------------------------------------------------------------
// Zoom-responsive sizing — more aggressive scaling so eggs grow with zoom
// ---------------------------------------------------------------------------
function scaledSize(baseSize, currentZoom) {
  // Narrow band: 0.9x–1.4x so icons stay consistent across zoom levels.
  // At zoom 9: 0.9x, zoom 13: ~1.14x, zoom 18: 1.4x (capped)
  const zoomScale = Math.min(1.4, Math.max(0.9, 0.9 + (currentZoom - 9) * 0.06));
  return [
    Math.round(baseSize[0] * zoomScale),
    Math.round(baseSize[1] * zoomScale),
  ];
}

// ---------------------------------------------------------------------------
// Zoom-dependent opacity — faint at low zoom, more visible as you zoom in
// ---------------------------------------------------------------------------
function zoomOpacity(currentZoom, minZoom, maxZoom) {
  const range = Math.max(1, maxZoom - minZoom);
  const progress = Math.min(1, Math.max(0, (currentZoom - minZoom) / range));
  // 0.3 at minZoom → 0.75 at maxZoom (subtle resting state)
  // Combined with SVG internal opacity (c.op ~0.35-0.4) gives
  // ~10% effective at minZoom, ~30% at maxZoom — discoverable but ghostly
  return 0.3 + progress * 0.45;
}

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
  const svgCacheRef = useRef({});
  const animatingRef = useRef(new Set());

  const handleEggClick = useCallback((egg, marker) => {
    foundRef.current = markFound(egg.id);
    marker.setPopupContent(buildPopupHtml(egg, foundRef.current));

    // Clear any existing auto-fade timers
    if (marker._eggFadeTimer) clearTimeout(marker._eggFadeTimer);
    if (marker._eggCloseTimer) clearTimeout(marker._eggCloseTimer);

    // Swap to activated SVG
    const gen = SVG_GENERATORS[egg.svgKey];
    if (gen) {
      animatingRef.current.add(egg.id);
      const activatedSvg = gen(theme, true);
      const z = map.getZoom();
      const [w, h] = scaledSize(egg.size, z);
      marker.setIcon(L.divIcon({
        html: `<div style="opacity:1;transition:opacity 0.3s">${activatedSvg}</div>`,
        className: 'easter-egg-icon egg-activated',
        iconSize: [w, h],
        iconAnchor: [w / 2, 0],
        popupAnchor: [0, -4],
      }));

      // Revert icon when popup closes (not on a fixed timer)
      marker.once('popupclose', () => {
        clearTimeout(marker._eggFadeTimer);
        clearTimeout(marker._eggCloseTimer);
        // Reset popup opacity for next open
        const el = marker.getPopup()?._container;
        if (el) { el.style.transition = ''; el.style.opacity = ''; }
        animatingRef.current.delete(egg.id);
        const restingSvg = svgCacheRef.current[egg.id];
        if (restingSvg) {
          const zNow = map.getZoom();
          const [w2, h2] = scaledSize(egg.size, zNow);
          const op = zoomOpacity(zNow, egg.minZoom, egg.maxZoom);
          marker.setIcon(L.divIcon({
            html: `<div style="opacity:${op};transition:opacity 0.3s">${restingSvg}</div>`,
            className: 'easter-egg-icon',
            iconSize: [w2, h2],
            iconAnchor: [w2 / 2, 0],
            popupAnchor: [0, -4],
          }));
        }
      });

      // Auto-fade popup after 8s reading time
      marker._eggFadeTimer = setTimeout(() => {
        const popup = marker.getPopup();
        const el = popup?._container;
        if (el && marker.isPopupOpen()) {
          el.style.transition = 'opacity 1.5s ease';
          el.style.opacity = '0';
          marker._eggCloseTimer = setTimeout(() => {
            marker.closePopup();
          }, 1500);
        }
      }, 8000);
    }
  }, [theme, map]);

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
    const currentZoom = map.getZoom();
    svgCacheRef.current = {};

    EASTER_EGGS.forEach((egg) => {
      const gen = SVG_GENERATORS[egg.svgKey];
      if (!gen) return;

      const svg = gen(theme, false);
      svgCacheRef.current[egg.id] = svg;
      const [w, h] = scaledSize(egg.size, currentZoom);
      const op = zoomOpacity(currentZoom, egg.minZoom, egg.maxZoom);
      const visible = currentZoom >= egg.minZoom && currentZoom <= egg.maxZoom;
      const icon = L.divIcon({
        html: `<div style="opacity:${visible ? op : 0};transition:opacity 0.3s">${svg}</div>`,
        className: 'easter-egg-icon',
        iconSize: [w, h],
        iconAnchor: [w / 2, 0],
        popupAnchor: [0, -4],
      });

      const marker = L.marker([egg.lat, egg.lng], {
        icon,
        interactive: true,
        zIndexOffset: -1000,
      });

      marker.bindPopup(buildPopupHtml(egg, foundRef.current), {
        className: 'easter-egg-popup',
        maxWidth: 280,
        closeButton: true,
        autoPan: true,
        autoPanPadding: [50, 50],
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
        const wrapper = marker._icon?.querySelector('div');
        if (!wrapper) return;
        const visible = z >= egg.minZoom && z <= egg.maxZoom;
        const op = visible ? zoomOpacity(z, egg.minZoom, egg.maxZoom) : 0;
        wrapper.style.opacity = op;
        wrapper.style.pointerEvents = visible ? 'auto' : 'none';
      });
    }

    // Rescale icons on zoom end (skip during animation or open popup)
    function updateSizes() {
      const z = map.getZoom();
      markersRef.current.forEach(({ marker, egg }) => {
        if (animatingRef.current.has(egg.id)) return;
        if (marker.isPopupOpen()) return;
        const visible = z >= egg.minZoom && z <= egg.maxZoom;
        if (!visible) return;
        const cachedSvg = svgCacheRef.current[egg.id];
        if (!cachedSvg) return;
        const [w, h] = scaledSize(egg.size, z);
        const op = zoomOpacity(z, egg.minZoom, egg.maxZoom);
        marker.setIcon(L.divIcon({
          html: `<div style="opacity:${op};transition:opacity 0.3s">${cachedSvg}</div>`,
          className: 'easter-egg-icon',
          iconSize: [w, h],
          iconAnchor: [w / 2, 0],
          popupAnchor: [0, -4],
        }));
      });
    }

    // Fade popup as user scrolls away, close when fully off-screen
    function fadeOnScroll() {
      markersRef.current.forEach(({ marker }) => {
        if (!marker.isPopupOpen()) return;
        const popup = marker.getPopup();
        const el = popup?._container;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const m = map.getContainer().getBoundingClientRect();
        // Fully off-screen → close
        if (r.right < m.left || r.left > m.right || r.bottom < m.top || r.top > m.bottom) {
          marker.closePopup();
          return;
        }
        // Calculate how close the popup edge is to the viewport edge
        const overLeft = m.left - r.left;
        const overRight = r.right - m.right;
        const overTop = m.top - r.top;
        const overBottom = r.bottom - m.bottom;
        const maxOver = Math.max(0, overLeft, overRight, overTop, overBottom);
        // Fade from 1→0 over 60px of overshoot; close once faded enough
        const opacity = Math.max(0, 1 - maxOver / 60);
        if (opacity <= 0.3) {
          marker.closePopup();
          return;
        }
        el.style.opacity = opacity;
      });
    }

    updateVisibility();
    updateSizes();
    map.on('zoom', updateVisibility);
    map.on('zoomend', updateSizes);
    map.on('move', fadeOnScroll);
    return () => {
      map.off('zoom', updateVisibility);
      map.off('zoomend', updateSizes);
      map.off('move', fadeOnScroll);
    };
  }, [map, zoom]);

  return null;
}
