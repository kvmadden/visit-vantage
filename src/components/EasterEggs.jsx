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
      <path d="M0 8 Q4.5 7 9 8 Q13.5 9 18 8" fill="none" stroke="${teal}" stroke-width="1" stroke-opacity="${o * 0.4}" stroke-linecap="round"/>
      <!-- hair flowing up and back from water -->
      <path d="M4 7 Q2 5 1.5 3 Q1.5 2 2.5 3 Q3 4 4 6" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.5}" stroke-linejoin="round"/>
      <path d="M5 6.5 Q3.5 4.5 3 2.5 Q3.5 2 4 3.5 Q4.5 5 5.5 6" fill="${k}" fill-opacity="${o * 0.25}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.4}" stroke-linejoin="round"/>
      <!-- head just above water, looking right -->
      <circle cx="6" cy="7" r="2" fill="${k}" fill-opacity="${o * 0.25}" stroke="${k}" stroke-width="1.4" stroke-opacity="${o}"/>
      <!-- eye -->
      <circle cx="7" cy="6.5" r="0.4" fill="${k}" fill-opacity="${o * 0.9}"/>
      <!-- smile -->
      <path d="M6.5 8 Q7 8.4 7.5 8" fill="none" stroke="${k}" stroke-width="0.5" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- torso going into water, angled down-right -->
      <path d="M7 9 Q8 10.5 9 12" fill="none" stroke="${k}" stroke-width="2.5" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <!-- arm extended forward -->
      <path d="M7.5 9 Q10 8.5 12 9" fill="none" stroke="${k}" stroke-width="1" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- tail — single thick curve going down -->
      <path d="M9 12 Q10 14 11 16 Q12 18 13 19" fill="none" stroke="${k}" stroke-width="2.8" stroke-opacity="${o * 0.6}" stroke-linecap="round"/>
      <!-- tail narrows -->
      <path d="M13 19 Q14 20 14.5 20.5" fill="none" stroke="${k}" stroke-width="2" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- fluke — wide horizontal V -->
      <path d="M14.5 20.5 L17 19 Q17 20 15.5 21" fill="${teal}" fill-opacity="${o * 0.5}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.6}"/>
      <path d="M14.5 20.5 L16 22.5 Q15.5 23 14 21.5" fill="${teal}" fill-opacity="${o * 0.5}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.6}"/>
      <!-- scale shimmer on tail -->
      <path d="M10 13.5 Q10.5 13 11 13.5" fill="none" stroke="${teal}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <path d="M11.5 16 Q12 15.5 12.5 16" fill="none" stroke="${teal}" stroke-width="0.4" stroke-opacity="${o * 0.3}"/>
      <!-- bubbles -->
      <circle cx="10" cy="10" r="0.4" fill="${teal}" fill-opacity="${o * 0.3}"/>
      <circle cx="13" cy="15" r="0.35" fill="${teal}" fill-opacity="${o * 0.2}"/>
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
      <!-- DOLPHIN — single filled silhouette shape, side profile, facing left, leaping right-to-left arc -->
      <!-- drawn as one continuous outline: snout → forehead → back → tail stock → tail flukes → belly → snout -->
      <path d="
        M1 9
        Q0 9 -0.5 8.5
        Q0 8 1 8.5
        Q2 7.5 3 6
        Q4 4 6 2.5
        Q8 1 10 1.5
        Q11 2 12 3
        Q14 5 16 7
        Q18 9 20 10
        Q21 10.5 22 10
        Q23 9 24 8
        Q24.5 8.5 24 9.5
        Q23 10 22 10.5
        Q23 11.5 24 12.5
        Q24.5 12 24 11.5
        Q23 11 22 10.5
        Q20 11 18 10.5
        Q16 9 14 7.5
        Q12 5.5 10 4.5
        Q8 4 6 5
        Q4 6.5 3 8
        Q2 9.5 1 9
        Z
      " fill="${k}" fill-opacity="${o * 0.35}" stroke="${k}" stroke-width="1.2" stroke-opacity="${o}" stroke-linejoin="round"/>
      <!-- eye -->
      <circle cx="4" cy="5" r="0.6" fill="${dark}" fill-opacity="${o * 0.9}"/>
      <!-- mouth line (the dolphin smile) -->
      <path d="M1 8.8 Q2 7.5 3.5 6.5" fill="none" stroke="${dark}" stroke-width="0.6" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- dorsal fin on the back peak -->
      <path d="M9 2 L7.5 -0.5 L11 2.5" fill="${k}" fill-opacity="${o * 0.6}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.8}" stroke-linejoin="round"/>
      <!-- pectoral flipper -->
      <path d="M7 6 Q5.5 7.5 6.5 8" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="0.8" stroke-opacity="${o * 0.5}" stroke-linecap="round"/>
      <!-- water splashes -->
      <circle cx="0" cy="10.5" r="0.4" fill="${k}" fill-opacity="${o * 0.2}"/>
      <circle cx="21" cy="8" r="0.3" fill="${k}" fill-opacity="${o * 0.2}"/>
    </svg>`;
    // INACTIVE: dorsal fin + back arc breaking water
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="-1 -1 26 18">
      <path d="M-1 10 Q6 9 12 10 Q18 11 25 10" fill="none" stroke="${k}" stroke-width="1.2" stroke-opacity="${o}" stroke-linecap="round"/>
      <!-- curved back breaking the surface -->
      <path d="M7 10 Q9 8.5 12 7.5 Q15 8.5 17 10" fill="${k}" fill-opacity="${o * 0.3}" stroke="${k}" stroke-width="1.2" stroke-opacity="${o * 0.7}" stroke-linecap="round"/>
      <!-- tall curved dorsal fin -->
      <path d="M12 7.5 L10 3 Q11 2 13 5 Z" fill="${k}" fill-opacity="${o * 0.6}" stroke="${k}" stroke-width="1" stroke-opacity="${o}" stroke-linejoin="round"/>
      <!-- small splash -->
      <circle cx="17.5" cy="9.5" r="0.4" fill="${k}" fill-opacity="${o * 0.4}"/>
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
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
      <circle cx="9" cy="3.5" r="2" fill="${c.fill}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.6}"/>
      <circle cx="9" cy="2.8" r="0.8" fill="${c.red}" fill-opacity="${c.op * 0.5}"/>
      <path d="M9 4 L9 1.5 Q8 0.5 7 1.5" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}" stroke-linecap="round" fill="none"/>
      <circle cx="8.3" cy="3.3" r="0.35" fill="${c.stroke}" fill-opacity="${c.op * 0.6}"/>
      <path d="M9 5.5 Q9 7 8.5 9 Q8 11 9 12" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op * 0.6}" stroke-linecap="round" fill="none"/>
      <ellipse cx="9" cy="13" rx="3" ry="2.5" fill="${c.fill}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <path d="M9 10 Q6 8 4 6" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round" fill="none"/>
      <path d="M9 10 Q12 8 14 6" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round" fill="none"/>
      <line x1="8" y1="15.5" x2="6" y2="23" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op * 0.6}" stroke-linecap="round"/>
      <line x1="10" y1="15.5" x2="12" y2="23" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op * 0.6}" stroke-linecap="round"/>
      <path d="M0 22 Q4 21 9 22 Q14 23 18 22" fill="none" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
      <path d="M0 20 Q4 19 9 20 Q14 21 18 20" fill="none" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
      <line x1="7" y1="20" x2="6" y2="14" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
      <line x1="11" y1="20" x2="12" y2="14" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
    </svg>`;
  },

  gopherTortoise(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16">
      <path d="M0 13 L20 13" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <ellipse cx="10" cy="8" rx="6.5" ry="5" fill="${c.green}" fill-opacity="${c.op * 0.3}" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op * 0.6}"/>
      <path d="M5 6 Q5 4 6 5 Q7 6 6 7" fill="none" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}"/>
      <path d="M10 4 Q10 3 11 4 Q12 5 10 5" fill="none" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}"/>
      <path d="M14 6 Q15 5 15 6 Q15 7 14 7" fill="none" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}"/>
      <ellipse cx="2.5" cy="7" rx="2.2" ry="1.5" fill="${c.green}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <circle cx="1.8" cy="6.5" r="0.4" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <path d="M5 11 L3 14" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M8 12 L6 15" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M12 12 L14 15" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M15 11 L17 14" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16">
      <path d="M0 12 L20 12" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.25}"/>
      <path d="M6 12 Q7 7 10 6 Q13 7 14 12" fill="${c.green}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.3}"/>
    </svg>`;
  },

  alligator(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="14" viewBox="0 0 26 14">
      <path d="M0 6 Q6 5 13 6 Q20 7 26 6" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
      <path d="M2 6 Q6 4 10 5 Q14 5.5 18 5 Q22 4.5 24 5.5" fill="${c.green}" fill-opacity="${c.op * 0.15}" stroke="${c.green}" stroke-width="1.2" stroke-opacity="${c.op * 0.7}" stroke-linecap="round"/>
      <path d="M24 5.5 L26 2 L25.5 4.5" fill="none" stroke="${c.green}" stroke-width="0.7" stroke-opacity="${c.op * 0.6}"/>
      <path d="M24 5.5 L26 9 L25.5 7" fill="none" stroke="${c.green}" stroke-width="0.7" stroke-opacity="${c.op * 0.6}"/>
      <path d="M25 3 L25.5 2.5 M25.3 4 L25.8 3.5 M25.5 5 L26 4.5" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.5}"/>
      <path d="M25 8 L25.5 8.5 M25.3 7 L25.8 7.5 M25.5 6 L26 6.5" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.5}"/>
      <ellipse cx="23.5" cy="4" rx="1.5" ry="1" fill="${c.green}" fill-opacity="${c.op * 0.3}" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op * 0.6}"/>
      <circle cx="24" cy="3.7" r="0.5" fill="${c.stroke}" fill-opacity="${c.op * 0.7}"/>
      <path d="M5 4.5 Q6 4 7 4.5 Q8 5 9 4.5 Q10 4 11 4.5" fill="none" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}"/>
      <path d="M2 6 Q1 4 2 3" fill="none" stroke="${c.green}" stroke-width="0.8" stroke-opacity="${c.op * 0.6}" stroke-linecap="round"/>
      <path d="M2 6 Q1 8 2 9" fill="none" stroke="${c.green}" stroke-width="0.8" stroke-opacity="${c.op * 0.6}" stroke-linecap="round"/>
      <path d="M7 4.5 L5.5 2" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M7 7 L5.5 9.5" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M14 5 L12.5 2.5" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M14 7 L12.5 9.5" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="14" viewBox="0 0 26 14">
      <path d="M0 7 Q6 6 13 7 Q20 8 26 7" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
      <ellipse cx="20" cy="6.5" rx="1.2" ry="0.6" fill="${c.green}" fill-opacity="${c.op * 0.2}" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
      <circle cx="20.5" cy="6.2" r="0.3" fill="${c.stroke}" fill-opacity="${c.op * 0.35}"/>
      <circle cx="19.5" cy="6.2" r="0.3" fill="${c.stroke}" fill-opacity="${c.op * 0.35}"/>
      <path d="M21.5 7 L22.5 7" fill="none" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op * 0.25}"/>
    </svg>`;
  },

  roseateSpoonbill(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22">
      <path d="M0 18 Q5 17 10 18 Q15 19 20 18" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
      <circle cx="10" cy="3" r="1.8" fill="${c.red}" fill-opacity="${c.op * 0.2}" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op * 0.6}"/>
      <path d="M10 4.5 L14 4 Q15.5 4 15 5 Q14.5 5.5 10 5" fill="${c.red}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <circle cx="9.2" cy="2.7" r="0.35" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <path d="M10 5 Q10 7 10 10" stroke="${c.red}" stroke-width="0.7" stroke-opacity="${c.op * 0.6}" stroke-linecap="round"/>
      <ellipse cx="10" cy="11" rx="3.5" ry="2.5" fill="${c.red}" fill-opacity="${c.op * 0.2}" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <path d="M10 7 Q4 3 1 5" fill="${c.red}" fill-opacity="${c.op * 0.2}" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <path d="M10 7 Q16 3 19 5" fill="${c.red}" fill-opacity="${c.op * 0.2}" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <line x1="9" y1="13.5" x2="7" y2="18" stroke="${c.red}" stroke-width="0.6" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <line x1="11" y1="13.5" x2="13" y2="18" stroke="${c.red}" stroke-width="0.6" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M14 18 Q15 17.5 16 18.5" fill="none" stroke="${c.water}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22">
      <path d="M16 8 Q17 7 18 8" fill="none" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
      <path d="M17 9 Q18 10 17 11" fill="none" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op * 0.25}"/>
      <path d="M15 10 L17 9.5 Q18.5 9.5 18 10.5 Q17.5 11 15 10.5" fill="${c.red}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
    </svg>`;
  },

  seaTurtle(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18">
      <ellipse cx="11" cy="9" rx="5.5" ry="4.5" fill="${c.green}" fill-opacity="${c.op * 0.25}" stroke="${c.green}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}"/>
      <path d="M9 6 L9 5 L11 6.5 L13 5 L13 6" fill="none" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
      <path d="M9 9 L11 7.5 L13 9" fill="none" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
      <path d="M9 12 L11 10.5 L13 12" fill="none" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op * 0.35}"/>
      <ellipse cx="4" cy="6.5" rx="1.8" ry="1" transform="rotate(-20 4 6.5)" fill="${c.green}" fill-opacity="${c.op * 0.15}" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <circle cx="3.5" cy="6" r="0.3" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <path d="M6 7 Q4 4 1 4 Q3 6 5.5 7" fill="${c.green}" fill-opacity="${c.op * 0.2}" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <path d="M6 11 Q4 14 1 14 Q3 12 5.5 11" fill="${c.green}" fill-opacity="${c.op * 0.2}" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <path d="M16 7 Q18 4 21 4 Q19 6 16.5 7" fill="${c.green}" fill-opacity="${c.op * 0.2}" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <path d="M16 11 Q18 14 21 14 Q19 12 16.5 11" fill="${c.green}" fill-opacity="${c.op * 0.2}" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <path d="M19 9 Q20 9 21 8.5" fill="none" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
      <path d="M19 10 Q20 10.5 21 10" fill="none" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18">
      <ellipse cx="11" cy="9" rx="5" ry="4" fill="${c.green}" fill-opacity="${c.op * 0.2}" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op * 0.3}"/>
      <circle cx="8" cy="12" r="0.4" fill="${c.accent}" fill-opacity="${c.op * 0.2}"/>
      <circle cx="14" cy="12" r="0.35" fill="${c.accent}" fill-opacity="${c.op * 0.18}"/>
      <circle cx="11" cy="14" r="0.3" fill="${c.accent}" fill-opacity="${c.op * 0.15}"/>
    </svg>`;
  },

  // --- Batch 2: Landmarks & Sports ---

  skywayBridge(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="16" viewBox="0 0 30 16">
      <line x1="15" y1="1" x2="15" y2="10" stroke="${c.stroke}" stroke-width="1" stroke-opacity="${c.op * 0.8}"/>
      <path d="M15 2 L5 9" stroke="${c.accent}" stroke-width="0.7" stroke-opacity="${c.op * 0.7}"/>
      <path d="M15 2 L25 9" stroke="${c.accent}" stroke-width="0.7" stroke-opacity="${c.op * 0.7}"/>
      <path d="M15 4 L8 9" stroke="${c.accent}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}"/>
      <path d="M15 4 L22 9" stroke="${c.accent}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}"/>
      <path d="M15 6 L11 9" stroke="${c.accent}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <path d="M15 6 L19 9" stroke="${c.accent}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <path d="M0 10 Q7 9 15 10 Q23 11 30 10" fill="none" stroke="${c.stroke}" stroke-width="1.2" stroke-opacity="${c.op * 0.8}"/>
      <rect x="5" y="9" width="3" height="2" rx="0.3" fill="${c.stroke}" fill-opacity="${c.op * 0.35}"/>
      <rect x="19" y="9.5" width="3" height="2" rx="0.3" fill="${c.stroke}" fill-opacity="${c.op * 0.35}"/>
      <rect x="12" y="9.3" width="2.5" height="1.5" rx="0.3" fill="${c.stroke}" fill-opacity="${c.op * 0.3}"/>
      <path d="M0 14 Q8 12 15 13 Q22 14 30 12" fill="none" stroke="${c.water}" stroke-width="0.5" stroke-opacity="${c.op * 0.35}"/>
      <path d="M0 12 Q8 11 15 12 Q22 13 30 11" fill="none" stroke="${c.water}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="16" viewBox="0 0 30 16">
      <path d="M0 10 Q8 8 15 9 Q22 10 30 8" fill="${c.fill}" fill-opacity="${c.op * 0.06}" stroke="${c.fill}" stroke-width="0.3" stroke-opacity="${c.op * 0.15}"/>
      <line x1="15" y1="4" x2="15" y2="9" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.25}"/>
      <path d="M0 14 Q8 12 15 13 Q22 14 30 12" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.2}"/>
    </svg>`;
  },

  spongeDiver(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 16 24">
      <path d="M0 8 Q4 7 8 8 Q12 9 16 8" fill="none" stroke="${c.water}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}"/>
      <circle cx="8" cy="11" r="2.5" fill="${c.accent}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}"/>
      <circle cx="9" cy="10.5" r="1" fill="none" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <path d="M8 13.5 L8 18" stroke="${c.stroke}" stroke-width="0.9" stroke-opacity="${c.op * 0.6}" stroke-linecap="round"/>
      <path d="M8 15 L12 13 L13 10" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.5}" stroke-linecap="round" fill="none"/>
      <path d="M8 15 L4 17" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <ellipse cx="13.5" cy="9" rx="1.8" ry="1.3" fill="${c.accent}" fill-opacity="${c.op * 0.35}" stroke="${c.accent}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <path d="M8 18 L5.5 23" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M8 18 L10.5 23" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <circle cx="6" cy="6" r="0.5" fill="${c.water}" fill-opacity="${c.op * 0.4}"/>
      <circle cx="10" cy="5" r="0.4" fill="${c.water}" fill-opacity="${c.op * 0.35}"/>
      <circle cx="8" cy="3" r="0.35" fill="${c.water}" fill-opacity="${c.op * 0.3}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 16 24">
      <path d="M0 6 Q4 5 8 6 Q12 7 16 6" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
      <circle cx="7" cy="4" r="0.6" fill="${c.water}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="9" cy="2.5" r="0.5" fill="${c.water}" fill-opacity="${c.op * 0.25}"/>
      <circle cx="8" cy="0.5" r="0.4" fill="${c.water}" fill-opacity="${c.op * 0.2}"/>
      <circle cx="6" cy="1.5" r="0.35" fill="${c.water}" fill-opacity="${c.op * 0.2}"/>
      <circle cx="10" cy="0" r="0.3" fill="${c.water}" fill-opacity="${c.op * 0.15}"/>
    </svg>`;
  },

  hockeyPuck(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14">
      <line x1="2" y1="12" x2="7" y2="7" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <line x1="12" y1="12" x2="7" y2="7" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <ellipse cx="7" cy="7.5" rx="4" ry="1.8" fill="${c.stroke}" fill-opacity="${c.op * 0.4}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}"/>
      <rect x="3" y="5.8" width="8" height="1.7" fill="${c.stroke}" fill-opacity="${c.op * 0.35}"/>
      <ellipse cx="7" cy="5.8" rx="4" ry="1.8" fill="${c.stroke}" fill-opacity="${c.op * 0.35}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}"/>
      <path d="M9 3 L10 2 L10.5 2.5" fill="none" stroke="${c.accent}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14">
      <ellipse cx="7" cy="8" rx="4.5" ry="2" fill="${c.stroke}" fill-opacity="${c.op * 0.3}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}"/>
      <rect x="2.5" y="6.5" width="9" height="1.5" fill="${c.stroke}" fill-opacity="${c.op * 0.25}"/>
      <ellipse cx="7" cy="6.5" rx="4.5" ry="2" fill="${c.stroke}" fill-opacity="${c.op * 0.25}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}"/>
      <line x1="4" y1="6" x2="6" y2="6.5" stroke="${c.stroke}" stroke-width="0.2" stroke-opacity="${c.op * 0.25}"/>
      <line x1="8" y1="5.5" x2="10" y2="6.2" stroke="${c.stroke}" stroke-width="0.2" stroke-opacity="${c.op * 0.25}"/>
    </svg>`;
  },

  pirateFlag(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 18 14">
      <line x1="2" y1="0" x2="2" y2="13" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op * 0.6}"/>
      <path d="M3 1 Q10 0 16 1 Q17 3 16 5 Q15 7 16 9 Q10 10 3 9" fill="${c.stroke}" fill-opacity="${c.op * 0.3}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.6}"/>
      <text x="9.5" y="7" font-size="5" font-family="sans-serif" text-anchor="middle" fill="${c.stroke}" fill-opacity="${c.op * 0.6}">&#9760;</text>
      <circle cx="1" cy="12" r="0.6" fill="${c.fill}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="2.5" cy="12.5" r="0.5" fill="${c.fill}" fill-opacity="${c.op * 0.25}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 18 14">
      <line x1="2" y1="1" x2="2" y2="13" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.35}"/>
      <path d="M3 2 Q5 1.5 7 2 Q8 2.5 7 3 Q5 3.5 3 3" fill="${c.stroke}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
    </svg>`;
  },

  stingray(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18">
      <path d="M10 2 Q2 4 0 8 Q2 11 10 9 Q18 11 20 8 Q18 4 10 2Z" fill="${c.water}" fill-opacity="${c.op * 0.25}" stroke="${c.water}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}"/>
      <path d="M10 9 Q10 12 8 17 Q9 16 10 17" fill="none" stroke="${c.water}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}" stroke-linecap="round"/>
      <circle cx="8" cy="5.5" r="0.6" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="12" cy="5.5" r="0.6" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <path d="M7 7 Q10 8 13 7" fill="none" stroke="${c.water}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
      <path d="M3 6 Q5 5 7 6" fill="none" stroke="${c.water}" stroke-width="0.2" stroke-opacity="${c.op * 0.3}"/>
      <path d="M13 6 Q15 5 17 6" fill="none" stroke="${c.water}" stroke-width="0.2" stroke-opacity="${c.op * 0.3}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18">
      <path d="M0 4 Q5 3 10 4 Q15 5 20 4" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
      <path d="M0 7 Q5 6 10 7 Q15 8 20 7" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.25}"/>
      <path d="M6 8 Q10 6 14 8 Q10 10 6 8Z" fill="${c.water}" fill-opacity="${c.op * 0.1}" stroke="none"/>
    </svg>`;
  },

  greekCross(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <path d="M0 12 Q4 11 8 12 Q12 13 16 12" fill="none" stroke="${c.water}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}"/>
      <rect x="5.5" y="2" width="5" height="12" rx="0.5" fill="${c.blue}" fill-opacity="${c.op * 0.3}" stroke="${c.blue}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}"/>
      <rect x="1" y="5.5" width="14" height="5" rx="0.5" fill="${c.blue}" fill-opacity="${c.op * 0.3}" stroke="${c.blue}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}"/>
      <circle cx="8" cy="13" r="1.2" fill="${c.water}" fill-opacity="${c.op * 0.2}" stroke="${c.water}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <circle cx="5" cy="13.5" r="0.8" fill="${c.water}" fill-opacity="${c.op * 0.15}"/>
      <circle cx="11" cy="13.5" r="0.8" fill="${c.water}" fill-opacity="${c.op * 0.15}"/>
      <path d="M0 15 Q4 14 8 15 Q12 16 16 15" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="3" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.25}"/>
      <circle cx="8" cy="8" r="5.5" fill="none" stroke="${c.water}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}"/>
      <circle cx="8" cy="8" r="7.5" fill="none" stroke="${c.water}" stroke-width="0.25" stroke-opacity="${c.op * 0.15}"/>
    </svg>`;
  },

  // --- Batch 3: Food & History ---

  cubanSandwich(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="12" viewBox="0 0 24 12">
      <path d="M3 2 Q12 0 21 2" fill="${c.accent}" fill-opacity="${c.op * 0.3}" stroke="${c.accent}" stroke-width="0.5" stroke-opacity="${c.op * 0.7}"/>
      <rect x="3" y="2" width="18" height="2.5" rx="1.5" fill="${c.accent}" fill-opacity="${c.op * 0.25}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.6}"/>
      <rect x="4" y="4.5" width="16" height="1.2" rx="0.2" fill="${c.green}" fill-opacity="${c.op * 0.35}" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op * 0.5}"/>
      <rect x="4" y="5.3" width="16" height="1" rx="0.2" fill="${c.red}" fill-opacity="${c.op * 0.35}"/>
      <rect x="4" y="6" width="16" height="0.8" rx="0.2" fill="${c.accent}" fill-opacity="${c.op * 0.4}"/>
      <rect x="4" y="6.5" width="16" height="0.7" rx="0.2" fill="${c.stroke}" fill-opacity="${c.op * 0.15}"/>
      <rect x="3" y="7.2" width="18" height="2.5" rx="1.5" fill="${c.accent}" fill-opacity="${c.op * 0.25}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.6}"/>
      <line x1="7" y1="1" x2="8" y2="11" stroke="${c.stroke}" stroke-width="0.2" stroke-opacity="${c.op * 0.25}"/>
      <line x1="12" y1="0.5" x2="13" y2="11" stroke="${c.stroke}" stroke-width="0.2" stroke-opacity="${c.op * 0.25}"/>
      <line x1="17" y1="1" x2="18" y2="11" stroke="${c.stroke}" stroke-width="0.2" stroke-opacity="${c.op * 0.25}"/>
      <circle cx="5" cy="5.8" r="0.4" fill="${c.green}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="19" cy="5.8" r="0.4" fill="${c.green}" fill-opacity="${c.op * 0.3}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="12" viewBox="0 0 24 12">
      <path d="M6 3 Q12 2 18 3 Q19 4 18 5 L6 5 Q5 4 6 3Z" fill="${c.accent}" fill-opacity="${c.op * 0.12}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.2}"/>
      <path d="M6 7 Q12 8 18 7 Q19 8 18 9 L6 9 Q5 8 6 7Z" fill="${c.accent}" fill-opacity="${c.op * 0.1}" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.15}"/>
    </svg>`;
  },

  grouper(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="14" viewBox="0 0 22 14">
      <path d="M3 10 Q4 8 6 8 L7 8" fill="none" stroke="${c.brown}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}"/>
      <path d="M19 10 Q18 8 16 8 L15 8" fill="none" stroke="${c.brown}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}"/>
      <path d="M6 8 Q8 3 12 2 Q16 3 18 5 Q20 6 19 4 Q18 3 17 5 Q15 7 12 8 Q9 9 6 8Z" fill="${c.brown}" fill-opacity="${c.op * 0.3}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.7}"/>
      <path d="M6 8 Q4 9 3 11 Q4 9 5.5 8" fill="${c.brown}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <circle cx="16" cy="4" r="0.7" fill="${c.stroke}" fill-opacity="${c.op * 0.6}"/>
      <path d="M19 4 L21 3" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <line x1="2" y1="6" x2="5" y2="7" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.35}"/>
      <line x1="2" y1="4.5" x2="5" y2="5.5" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.35}"/>
      <circle cx="10" cy="5" r="0.4" fill="${c.stroke}" fill-opacity="${c.op * 0.25}"/>
      <circle cx="13" cy="4.5" r="0.35" fill="${c.stroke}" fill-opacity="${c.op * 0.25}"/>
      <path d="M1 10 Q11 9 21 10" fill="none" stroke="${c.brown}" stroke-width="0.5" stroke-opacity="${c.op * 0.3}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="14" viewBox="0 0 22 14">
      <path d="M3 10 Q6 8 11 8 Q16 8 19 10" fill="${c.brown}" fill-opacity="${c.op * 0.08}" stroke="${c.brown}" stroke-width="0.5" stroke-opacity="${c.op * 0.2}"/>
      <path d="M1 10 Q11 9 21 10" fill="none" stroke="${c.brown}" stroke-width="0.4" stroke-opacity="${c.op * 0.25}"/>
      <ellipse cx="11" cy="9.5" rx="4" ry="1.5" fill="${c.stroke}" fill-opacity="${c.op * 0.06}"/>
    </svg>`;
  },

  orange(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <path d="M8 3 L8 1 Q9 0 10 1" fill="none" stroke="${c.green}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}" stroke-linecap="round"/>
      <path d="M8 3 Q6 1 5 1 Q6 2 7 3" fill="${c.green}" fill-opacity="${c.op * 0.4}" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <path d="M8 3 Q10 1 11 1 Q10 2 9 3" fill="${c.green}" fill-opacity="${c.op * 0.35}" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
      <circle cx="8" cy="9" r="6" fill="${c.accent}" fill-opacity="${c.op * 0.4}" stroke="${c.accent}" stroke-width="0.6" stroke-opacity="${c.op * 0.7}"/>
      <line x1="8" y1="4" x2="8" y2="14" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <line x1="5" y1="5.5" x2="5" y2="12.5" stroke="${c.accent}" stroke-width="0.2" stroke-opacity="${c.op * 0.2}"/>
      <line x1="11" y1="5.5" x2="11" y2="12.5" stroke="${c.accent}" stroke-width="0.2" stroke-opacity="${c.op * 0.2}"/>
      <circle cx="6" cy="8" r="0.4" fill="${c.accent}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="10" cy="10" r="0.35" fill="${c.accent}" fill-opacity="${c.op * 0.25}"/>
      <circle cx="8" cy="13" r="0.3" fill="${c.accent}" fill-opacity="${c.op * 0.2}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <path d="M8 6 L8 4 Q9 3 10 4" fill="none" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op * 0.35}" stroke-linecap="round"/>
      <path d="M8 6 Q6 4.5 5.5 4.5 Q6.5 5 7 6" fill="${c.green}" fill-opacity="${c.op * 0.25}" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op * 0.25}"/>
      <path d="M8 6 Q10 4.5 10.5 4.5 Q9.5 5 9 6" fill="${c.green}" fill-opacity="${c.op * 0.2}" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}"/>
    </svg>`;
  },

  craftBeer(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="18" viewBox="0 0 14 18">
      <rect x="2" y="5" width="8" height="11" rx="1" fill="${c.accent}" fill-opacity="${c.op * 0.25}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.7}"/>
      <path d="M2 5 Q6 3 10 5" fill="${c.accent}" fill-opacity="${c.op * 0.35}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.6}"/>
      <path d="M1 4 Q6 1 11 4" fill="${c.accent}" fill-opacity="${c.op * 0.4}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <ellipse cx="4" cy="3" rx="1.5" ry="1" fill="${c.accent}" fill-opacity="${c.op * 0.35}" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
      <ellipse cx="8" cy="2.5" rx="1.5" ry="1.2" fill="${c.accent}" fill-opacity="${c.op * 0.35}" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
      <ellipse cx="6" cy="1.5" rx="1.2" ry="0.8" fill="${c.accent}" fill-opacity="${c.op * 0.3}" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.35}"/>
      <path d="M10 8 L12 8 Q13 8 13 9 L13 12 Q13 13 12 13 L10 13" fill="none" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.6}"/>
      <line x1="3" y1="9" x2="9" y2="9" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op * 0.25}"/>
      <rect x="4" y="10" width="4" height="3" rx="0.3" fill="${c.accent}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.25}"/>
      <circle cx="5" cy="7" r="0.4" fill="${c.accent}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="7" cy="7.5" r="0.35" fill="${c.accent}" fill-opacity="${c.op * 0.25}"/>
      <circle cx="4" cy="14" r="0.3" fill="${c.accent}" fill-opacity="${c.op * 0.2}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="18" viewBox="0 0 14 18">
      <circle cx="6" cy="8" r="3" fill="none" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.2}"/>
      <path d="M4.5 8 L5.5 7 L5 8 L6 7.5 L5.5 8.5 L6.5 8 L7 9" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}"/>
    </svg>`;
  },

  flamingo(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="22" viewBox="0 0 14 22">
      <circle cx="7" cy="2.5" r="1.5" fill="${c.red}" fill-opacity="${c.op * 0.3}" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op * 0.7}"/>
      <path d="M7 3 L9.5 4 L7 4.5" fill="${c.stroke}" fill-opacity="${c.op * 0.4}" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.6}"/>
      <circle cx="6.3" cy="2.2" r="0.35" fill="${c.stroke}" fill-opacity="${c.op * 0.6}"/>
      <path d="M7 4 Q7 6 6 8 Q5 10 5 12" stroke="${c.red}" stroke-width="0.7" stroke-opacity="${c.op * 0.7}" fill="none" stroke-linecap="round"/>
      <ellipse cx="5.5" cy="12.5" rx="3" ry="2" fill="${c.red}" fill-opacity="${c.op * 0.25}" stroke="${c.red}" stroke-width="0.4" stroke-opacity="${c.op * 0.6}"/>
      <path d="M5.5 10.5 Q3 9.5 1.5 10.5 Q3 11.5 5 11.5" fill="${c.red}" fill-opacity="${c.op * 0.15}" stroke="${c.red}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <path d="M5.5 10.5 Q8 9.5 10 10.5 Q9 11.5 7 11.5" fill="${c.red}" fill-opacity="${c.op * 0.15}" stroke="${c.red}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <line x1="5" y1="14.5" x2="5" y2="20" stroke="${c.red}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}" stroke-linecap="round"/>
      <path d="M0 20 Q7 19 14 20" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
      <circle cx="10" cy="19" r="0.4" fill="${c.water}" fill-opacity="${c.op * 0.3}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="22" viewBox="0 0 14 22">
      <path d="M0 16 Q7 15 14 16" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.25}"/>
      <line x1="5" y1="16" x2="4.5" y2="11" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
      <line x1="8" y1="16" x2="8.5" y2="12" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
    </svg>`;
  },


  tikiHut(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
      <path d="M1 9 L9 2 L17 9" fill="${c.accent}" fill-opacity="${c.op * 0.25}" stroke="${c.accent}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}"/>
      <path d="M0 9 L9 1 L18 9" fill="none" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.6}"/>
      <path d="M2 9 L9 3.5 L16 9" fill="none" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <path d="M0 9 L-1 10" stroke="${c.accent}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <path d="M18 9 L19 10" stroke="${c.accent}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <line x1="5" y1="9" x2="5" y2="17" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.5}"/>
      <line x1="13" y1="9" x2="13" y2="17" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.5}"/>
      <line x1="4" y1="13" x2="14" y2="13" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}"/>
      <path d="M4 9 Q3.5 7.5 4 6.5" fill="none" stroke="${c.accent}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M3.5 6.5 Q4 5 4.5 6.5" fill="${c.accent}" fill-opacity="${c.op * 0.5}" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op * 0.5}"/>
      <path d="M14 9 Q14.5 7.5 14 6.5" fill="none" stroke="${c.accent}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M13.5 6.5 Q14 5 14.5 6.5" fill="${c.accent}" fill-opacity="${c.op * 0.5}" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op * 0.5}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
      <path d="M7 8 L9 6 L11 8" fill="${c.accent}" fill-opacity="${c.op * 0.2}" stroke="${c.accent}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
    </svg>`;
  },

  // --- Batch 4: Quirky & Deep Cuts ---

  ufo(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="14" viewBox="0 0 22 14">
      <polygon points="8,8 11,14 14,8" fill="${c.accent}" fill-opacity="${c.op * 0.15}" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <polygon points="9,8 11,13 13,8" fill="${c.accent}" fill-opacity="${c.op * 0.08}"/>
      <ellipse cx="11" cy="6" rx="10" ry="2.5" fill="${c.fill}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.7}"/>
      <ellipse cx="11" cy="4" rx="5" ry="3.5" fill="${c.fill}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.7}"/>
      <circle cx="4.5" cy="6.5" r="0.7" fill="${c.accent}" fill-opacity="${c.op * 0.7}"/>
      <circle cx="8" cy="7.5" r="0.7" fill="${c.accent}" fill-opacity="${c.op * 0.7}"/>
      <circle cx="14" cy="7.5" r="0.7" fill="${c.accent}" fill-opacity="${c.op * 0.7}"/>
      <circle cx="17.5" cy="6.5" r="0.7" fill="${c.accent}" fill-opacity="${c.op * 0.7}"/>
      <line x1="7" y1="8.5" x2="5" y2="10" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <line x1="11" y1="8.5" x2="11" y2="10.5" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <line x1="15" y1="8.5" x2="17" y2="10" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="14" viewBox="0 0 22 14">
      <polygon points="9,2 11,12 13,2" fill="${c.accent}" fill-opacity="${c.op * 0.08}" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op * 0.15}"/>
      <circle cx="11" cy="12" r="0.5" fill="${c.accent}" fill-opacity="${c.op * 0.2}"/>
      <circle cx="10" cy="10" r="0.3" fill="${c.accent}" fill-opacity="${c.op * 0.15}"/>
      <circle cx="12" cy="10" r="0.3" fill="${c.accent}" fill-opacity="${c.op * 0.15}"/>
    </svg>`;
  },

  conchShell(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
      <path d="M9 1 Q16 3 17 10 Q17 14 13 16.5 Q9 18 5 16 Q2 13 2 8 Q3 4 9 1Z" fill="${c.red}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}" transform="rotate(-10 9 9)"/>
      <path d="M9 1 Q10 5.5 9 10 Q8 13.5 6.5 16" fill="none" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <path d="M13 4 Q11 7 9 10" fill="none" stroke="${c.stroke}" stroke-width="0.35" stroke-opacity="${c.op * 0.4}"/>
      <path d="M15 8 Q13 10 11 13" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.35}"/>
      <path d="M5 16 Q3 14.5 2.5 12" fill="none" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <path d="M2.5 12 Q1 11 0 13" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <path d="M1 13 Q-0.5 15 -1 17" fill="none" stroke="${c.stroke}" stroke-width="0.25" stroke-opacity="${c.op * 0.25}"/>
      <path d="M0 15 Q-1 17 -1 18" fill="none" stroke="${c.stroke}" stroke-width="0.2" stroke-opacity="${c.op * 0.2}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
      <path d="M8 6 Q9 5 10 6 Q10.5 7 9.5 7.5 Q8.5 7 8 6Z" fill="${c.red}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.25}"/>
      <circle cx="7" cy="9" r="0.4" fill="${c.accent}" fill-opacity="${c.op * 0.2}"/>
      <circle cx="11" cy="8" r="0.35" fill="${c.accent}" fill-opacity="${c.op * 0.15}"/>
      <circle cx="9" cy="11" r="0.3" fill="${c.accent}" fill-opacity="${c.op * 0.15}"/>
    </svg>`;
  },

  treasureChest(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 18 16">
      <rect x="2" y="8" width="14" height="7" rx="1" fill="${c.accent}" fill-opacity="${c.op * 0.3}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.7}"/>
      <path d="M2 8 Q5 5 9 3 Q13 5 16 8" fill="${c.accent}" fill-opacity="${c.op * 0.25}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.7}"/>
      <line x1="2" y1="12" x2="16" y2="12" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
      <rect x="7.5" y="10" width="3" height="3" rx="0.5" fill="${c.accent}" fill-opacity="${c.op * 0.45}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.6}"/>
      <circle cx="9" cy="11.5" r="0.6" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="6" cy="5.5" r="0.7" fill="${c.accent}" fill-opacity="${c.op * 0.6}"/>
      <circle cx="9" cy="3.5" r="0.6" fill="${c.accent}" fill-opacity="${c.op * 0.55}"/>
      <circle cx="12" cy="5" r="0.65" fill="${c.accent}" fill-opacity="${c.op * 0.55}"/>
      <circle cx="4.5" cy="7" r="0.5" fill="${c.accent}" fill-opacity="${c.op * 0.45}"/>
      <circle cx="13.5" cy="6.5" r="0.5" fill="${c.accent}" fill-opacity="${c.op * 0.45}"/>
      <circle cx="8" cy="2" r="0.4" fill="${c.accent}" fill-opacity="${c.op * 0.4}"/>
      <circle cx="11" cy="2.5" r="0.35" fill="${c.accent}" fill-opacity="${c.op * 0.35}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 18 16">
      <path d="M7 10 Q9 8 11 10 Q11 12 9 13 Q7 12 7 10Z" fill="${c.accent}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.25}"/>
      <circle cx="9" cy="11" r="0.5" fill="${c.stroke}" fill-opacity="${c.op * 0.2}"/>
      <circle cx="7" cy="14" r="0.35" fill="${c.accent}" fill-opacity="${c.op * 0.15}"/>
      <circle cx="11" cy="14" r="0.3" fill="${c.accent}" fill-opacity="${c.op * 0.12}"/>
    </svg>`;
  },

  gibsonton(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18">
      <circle cx="10" cy="9" r="7" fill="none" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}"/>
      <line x1="10" y1="2" x2="10" y2="16" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <line x1="3" y1="9" x2="17" y2="9" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <line x1="5" y1="4" x2="15" y2="14" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.25}"/>
      <line x1="15" y1="4" x2="5" y2="14" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.25}"/>
      <circle cx="10" cy="9" r="1.5" fill="${c.stroke}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <circle cx="10" cy="2" r="0.9" fill="${c.red}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="15" cy="4" r="0.9" fill="${c.accent}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="17" cy="9" r="0.9" fill="${c.blue}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="15" cy="14" r="0.9" fill="${c.green}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="10" cy="16" r="0.9" fill="${c.red}" fill-opacity="${c.op * 0.4}"/>
      <circle cx="5" cy="14" r="0.9" fill="${c.accent}" fill-opacity="${c.op * 0.4}"/>
      <circle cx="3" cy="9" r="0.9" fill="${c.blue}" fill-opacity="${c.op * 0.4}"/>
      <circle cx="5" cy="4" r="0.9" fill="${c.green}" fill-opacity="${c.op * 0.4}"/>
      <path d="M8 3 L9 2 L9.5 2.5" fill="none" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
      <path d="M12 15 L11 16 L10.5 15.5" fill="none" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18">
      <circle cx="10" cy="9" r="7" fill="none" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.25}"/>
      <circle cx="10" cy="9" r="7" fill="none" stroke="${c.stroke}" stroke-width="0.2" stroke-opacity="${c.op * 0.15}" stroke-dasharray="1.5 2"/>
    </svg>`;
  },

  spookHill(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 18 14">
      <path d="M1 12 Q5 8 9 6 Q13 8 17 12" fill="${c.green}" fill-opacity="${c.op * 0.1}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <rect x="8" y="6.5" width="4" height="2.5" rx="0.5" fill="${c.stroke}" fill-opacity="${c.op * 0.25}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <circle cx="8.5" cy="8" r="0.6" fill="${c.stroke}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="11.5" cy="8" r="0.6" fill="${c.stroke}" fill-opacity="${c.op * 0.3}"/>
      <rect x="9" y="7" width="2" height="1.3" rx="0.3" fill="${c.water}" fill-opacity="${c.op * 0.25}"/>
      <path d="M10 6 Q10 4.5 9 3.5" fill="none" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <path d="M13 5 Q14 3 13 2" fill="none" stroke="${c.fill}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
      <path d="M5 4 Q6 3 5 2" fill="none" stroke="${c.fill}" stroke-width="0.3" stroke-opacity="${c.op * 0.25}" stroke-linecap="round"/>
      <text x="9" y="3" font-size="2.5" font-family="sans-serif" fill="${c.stroke}" fill-opacity="${c.op * 0.5}">?</text>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 18 14">
      <path d="M2 12 Q7 8 16 5" fill="none" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.3}"/>
    </svg>`;
  },

  joyland(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="8" fill="none" stroke="${c.accent}" stroke-width="0.7" stroke-opacity="${c.op * 0.6}"/>
      <line x1="10" y1="2" x2="10" y2="18" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}" transform="rotate(22 10 10)"/>
      <line x1="2" y1="10" x2="18" y2="10" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}" transform="rotate(22 10 10)"/>
      <line x1="4.3" y1="4.3" x2="15.7" y2="15.7" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}" transform="rotate(22 10 10)"/>
      <line x1="15.7" y1="4.3" x2="4.3" y2="15.7" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}" transform="rotate(22 10 10)"/>
      <circle cx="10" cy="2" r="1" fill="${c.red}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="15.7" cy="4.3" r="1" fill="${c.accent}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="18" cy="10" r="1" fill="${c.blue}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="15.7" cy="15.7" r="1" fill="${c.green}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="10" cy="18" r="1" fill="${c.red}" fill-opacity="${c.op * 0.45}"/>
      <circle cx="4.3" cy="15.7" r="1" fill="${c.accent}" fill-opacity="${c.op * 0.45}"/>
      <circle cx="2" cy="10" r="1" fill="${c.blue}" fill-opacity="${c.op * 0.45}"/>
      <circle cx="4.3" cy="4.3" r="1" fill="${c.green}" fill-opacity="${c.op * 0.45}"/>
      <circle cx="10" cy="10" r="1.5" fill="${c.stroke}" fill-opacity="${c.op * 0.3}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <circle cx="6" cy="6" r="0.4" fill="${c.accent}" fill-opacity="${c.op * 0.4}"/>
      <circle cx="14" cy="14" r="0.4" fill="${c.accent}" fill-opacity="${c.op * 0.35}"/>
      <circle cx="14" cy="6" r="0.35" fill="${c.accent}" fill-opacity="${c.op * 0.3}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <path d="M6 3 L6 1 L14 1 L14 3" fill="none" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.25}" stroke-linecap="round"/>
      <line x1="6" y1="1" x2="6" y2="18" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.2}"/>
      <line x1="14" y1="1" x2="14" y2="18" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.2}"/>
      <path d="M6 18 L14 18" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.15}"/>
    </svg>`;
  },

  babeRuth(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <line x1="1" y1="15" x2="12" y2="3" stroke="${c.stroke}" stroke-width="1" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <line x1="11.5" y1="3.5" x2="12.5" y2="2" stroke="${c.stroke}" stroke-width="1.2" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <circle cx="8" cy="8" r="3.5" fill="${c.fill}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.5}"/>
      <path d="M5.5 6 Q8 5 10.5 6" fill="none" stroke="${c.red}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}"/>
      <path d="M5.5 10 Q8 11 10.5 10" fill="none" stroke="${c.red}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}"/>
      <path d="M6 6.5 L6.3 7 M7.5 5.5 L7.6 6 M9 5.5 L8.9 6 M10 6.5 L9.7 7" fill="none" stroke="${c.red}" stroke-width="0.25" stroke-opacity="${c.op * 0.35}"/>
      <path d="M4 6 Q3 5 2 6" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.35}" stroke-linecap="round"/>
      <path d="M3.5 5 Q2.5 4 1.5 5" fill="none" stroke="${c.stroke}" stroke-width="0.25" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
      <path d="M13 9 L14 8.5 L14.5 9.5 L13.5 10" fill="${c.accent}" fill-opacity="${c.op * 0.4}" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="4" fill="${c.fill}" fill-opacity="${c.op * 0.12}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.3}"/>
      <path d="M5 6 Q8 4.5 11 6" fill="none" stroke="${c.red}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
      <path d="M5 10 Q8 11.5 11 10" fill="none" stroke="${c.red}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
      <path d="M6 6.5 L6.3 7 M8 5.5 L8 6 M10 6.5 L9.7 7" fill="none" stroke="${c.red}" stroke-width="0.25" stroke-opacity="${c.op * 0.25}"/>
    </svg>`;
  },

  phosphateMining(theme, activated = false) {
    const c = svgColors(theme);
    if (activated) return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16">
      <path d="M2 10 L6 6 L14 6 L18 10" fill="${c.stroke}" fill-opacity="${c.op * 0.1}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <line x1="2" y1="10" x2="18" y2="10" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
      <rect x="6" y="5" width="8" height="4.5" rx="0.5" fill="${c.accent}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <path d="M5 10 L6 9.5 L14 9.5 L15 10" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <circle cx="7" cy="10" r="1.3" fill="${c.stroke}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}"/>
      <circle cx="13" cy="10" r="1.3" fill="${c.stroke}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}"/>
      <path d="M8 7 Q9 6 10 7.5 Q10.5 8 11 7" fill="none" stroke="${c.accent}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}"/>
      <path d="M11.5 7.5 L12 6.5 L12.5 7 L13 6.5" fill="none" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op * 0.35}"/>
      <circle cx="9" cy="3" r="0.5" fill="${c.accent}" fill-opacity="${c.op * 0.4}"/>
      <circle cx="11" cy="2" r="0.4" fill="${c.accent}" fill-opacity="${c.op * 0.35}"/>
      <circle cx="7" cy="2.5" r="0.35" fill="${c.accent}" fill-opacity="${c.op * 0.3}"/>
    </svg>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16">
      <path d="M4 12 L8 8 L12 8 L16 12" fill="${c.stroke}" fill-opacity="${c.op * 0.1}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.25}"/>
      <line x1="3" y1="12" x2="17" y2="12" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}"/>
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
