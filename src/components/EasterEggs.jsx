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

  // --- Batch 1: Wildlife & Nature ---

  dolphin(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16">
      <path d="M2 9 Q5 4 10 5 Q14 5.5 17 7 Q19 8 21 7 Q23 6 23 5" fill="none" stroke="${c.water}" stroke-width="1" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M17 7 Q18 5 20 4 Q19 5.5 18 6" fill="${c.water}" fill-opacity="${c.op * 0.4}" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <path d="M2 9 Q3 10 5 10 Q4 11 2 11" fill="${c.water}" fill-opacity="${c.op * 0.3}" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <circle cx="5" cy="6.5" r="0.5" fill="${c.water}" fill-opacity="${c.op * 0.7}"/>
      <path d="M0 12 Q4 11 8 12 Q12 13 16 12 Q20 11 24 12" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
    </svg>`;
  },

  pelican(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="22" viewBox="0 0 18 22">
      <ellipse cx="9" cy="8" rx="4" ry="5" fill="${c.brown}" fill-opacity="${c.op * 0.25}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <circle cx="9" cy="3.5" r="2" fill="${c.brown}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <path d="M9 5.5 L9 4 L14 5.5 Q12 7 9 6" fill="${c.accent}" fill-opacity="${c.op * 0.4}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <circle cx="8" cy="3" r="0.5" fill="${c.stroke}" fill-opacity="${c.op * 0.6}"/>
      <path d="M7 13 L6 20" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M11 13 L12 20" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op}" stroke-linecap="round"/>
    </svg>`;
  },

  osprey(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
      <path d="M11 8 Q7 5 2 3 Q4 6 6 7" fill="${c.brown}" fill-opacity="${c.op * 0.3}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M11 8 Q15 5 20 3 Q18 6 16 7" fill="${c.brown}" fill-opacity="${c.op * 0.3}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <ellipse cx="11" cy="10" rx="3" ry="4" fill="${c.brown}" fill-opacity="${c.op * 0.25}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <circle cx="11" cy="6.5" r="1.8" fill="${c.fill}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <path d="M11 7.5 L12.5 8.5" stroke="${c.accent}" stroke-width="0.6" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <circle cx="10.3" cy="6.2" r="0.4" fill="${c.stroke}" fill-opacity="${c.op * 0.6}"/>
      <path d="M9 14 L8 19" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M13 14 L14 19" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}" stroke-linecap="round"/>
    </svg>`;
  },

  sandhillCrane(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
      <circle cx="9" cy="3" r="2" fill="${c.fill}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <circle cx="9" cy="2.2" r="0.8" fill="${c.red}" fill-opacity="${c.op * 0.5}"/>
      <path d="M9 3.5 L13 3" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <circle cx="8.3" cy="2.7" r="0.35" fill="${c.stroke}" fill-opacity="${c.op * 0.6}"/>
      <path d="M9 5 Q9 8 9 12" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <ellipse cx="9" cy="12" rx="3" ry="2.5" fill="${c.fill}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <line x1="8" y1="14.5" x2="6" y2="23" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <line x1="10" y1="14.5" x2="12" y2="23" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op}" stroke-linecap="round"/>
    </svg>`;
  },

  gopherTortoise(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16">
      <ellipse cx="10" cy="8" rx="7" ry="5" fill="${c.green}" fill-opacity="${c.op * 0.25}" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op}"/>
      <path d="M5 6 Q5 4 6 5 Q7 6 6 7" fill="none" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <path d="M10 4 Q10 3 11 4 Q12 5 10 5" fill="none" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <path d="M14 6 Q15 5 15 6 Q15 7 14 7" fill="none" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <circle cx="4" cy="6" r="1.5" fill="${c.green}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <circle cx="3.5" cy="5.7" r="0.35" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <path d="M5 11 L4 14" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M8 12 L7 15" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M12 12 L13 15" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M15 11 L16 14" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op}" stroke-linecap="round"/>
    </svg>`;
  },

  alligator(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="14" viewBox="0 0 26 14">
      <path d="M2 7 Q6 5 10 6 Q14 6.5 18 6 Q22 5.5 25 7" fill="none" stroke="${c.green}" stroke-width="1.2" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M25 7 L26 5.5 L25 6" fill="none" stroke="${c.green}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M25 7 L26 8.5 L25 8" fill="none" stroke="${c.green}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <ellipse cx="24" cy="5.5" rx="1.5" ry="1" fill="${c.green}" fill-opacity="${c.op * 0.3}" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <circle cx="24.5" cy="5.2" r="0.4" fill="${c.stroke}" fill-opacity="${c.op * 0.6}"/>
      <path d="M2 7 Q1 5 2 4" fill="none" stroke="${c.green}" stroke-width="0.8" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M2 7 Q1 9 2 10" fill="none" stroke="${c.green}" stroke-width="0.8" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M7 5.5 L6 3" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M7 8 L6 10.5" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M14 6 L13 3.5" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M14 7.5 L13 10" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
    </svg>`;
  },

  roseateSpoonbill(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22">
      <circle cx="10" cy="3.5" r="2" fill="${c.red}" fill-opacity="${c.op * 0.25}" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <path d="M10 5 L14 4.5 Q15 4.5 14.5 5 L10 5.5" fill="${c.stroke}" fill-opacity="${c.op * 0.3}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <circle cx="9.2" cy="3.2" r="0.35" fill="${c.stroke}" fill-opacity="${c.op * 0.6}"/>
      <path d="M10 5.5 Q10 8 10 11" stroke="${c.red}" stroke-width="0.7" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <ellipse cx="10" cy="11" rx="3.5" ry="2.5" fill="${c.red}" fill-opacity="${c.op * 0.2}" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <path d="M10 8 Q6 6 4 8" fill="${c.red}" fill-opacity="${c.op * 0.15}" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <path d="M10 8 Q14 6 16 8" fill="${c.red}" fill-opacity="${c.op * 0.15}" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <line x1="9" y1="13.5" x2="7" y2="21" stroke="${c.red}" stroke-width="0.6" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <line x1="11" y1="13.5" x2="13" y2="21" stroke="${c.red}" stroke-width="0.6" stroke-opacity="${c.op}" stroke-linecap="round"/>
    </svg>`;
  },

  seaTurtle(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="18" viewBox="0 0 22 18">
      <ellipse cx="11" cy="9" rx="6" ry="5" fill="${c.green}" fill-opacity="${c.op * 0.25}" stroke="${c.green}" stroke-width="0.7" stroke-opacity="${c.op}"/>
      <path d="M6 7 Q5 5 3 5 Q4 6 5 7" fill="${c.green}" fill-opacity="${c.op * 0.2}" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <path d="M6 11 Q5 13 3 13 Q4 12 5 11" fill="${c.green}" fill-opacity="${c.op * 0.2}" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <path d="M16 7 Q17 5 19 5 Q18 6 17 7" fill="${c.green}" fill-opacity="${c.op * 0.2}" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <path d="M16 11 Q17 13 19 13 Q18 12 17 11" fill="${c.green}" fill-opacity="${c.op * 0.2}" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <ellipse cx="5" cy="7" rx="1.5" ry="1" transform="rotate(-30 5 7)" fill="${c.green}" fill-opacity="${c.op * 0.15}"/>
      <circle cx="4.5" cy="6.5" r="0.3" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <path d="M9 6 L9 4.5 L11 6" fill="none" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
      <path d="M11 6 L13 4.5 L13 6" fill="none" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
      <path d="M9 9 L11 7.5 L13 9" fill="none" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
    </svg>`;
  },

  // --- Batch 2: Landmarks & Sports ---

  skywayBridge(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="16" viewBox="0 0 30 16">
      <line x1="15" y1="1" x2="15" y2="10" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op}"/>
      <path d="M15 2 L5 9" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.7}"/>
      <path d="M15 2 L25 9" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.7}"/>
      <path d="M15 4 L8 9" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.5}"/>
      <path d="M15 4 L22 9" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.5}"/>
      <path d="M15 6 L11 9" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
      <path d="M15 6 L19 9" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
      <path d="M0 10 Q7 9 15 10 Q23 11 30 10" fill="none" stroke="${c.stroke}" stroke-width="1" stroke-opacity="${c.op}"/>
      <path d="M0 14 Q8 12 15 13 Q22 14 30 12" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
    </svg>`;
  },

  donCesar(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20">
      <rect x="3" y="8" width="12" height="11" rx="0.5" fill="${c.red}" fill-opacity="${c.op * 0.2}" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <rect x="6" y="4" width="6" height="6" rx="0.3" fill="${c.red}" fill-opacity="${c.op * 0.25}" stroke="${c.red}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <path d="M7 4 Q9 1 11 4" fill="${c.red}" fill-opacity="${c.op * 0.15}" stroke="${c.red}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <rect x="5" y="12" width="2" height="3" rx="0.3" fill="none" stroke="${c.red}" stroke-width="0.3" stroke-opacity="${c.op * 0.5}"/>
      <rect x="8" y="12" width="2" height="3" rx="0.3" fill="none" stroke="${c.red}" stroke-width="0.3" stroke-opacity="${c.op * 0.5}"/>
      <rect x="11" y="12" width="2" height="3" rx="0.3" fill="none" stroke="${c.red}" stroke-width="0.3" stroke-opacity="${c.op * 0.5}"/>
      <rect x="7" y="16" width="4" height="3" rx="0.5" fill="none" stroke="${c.red}" stroke-width="0.4" stroke-opacity="${c.op * 0.6}"/>
    </svg>`;
  },

  ringlingCircus(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="20" viewBox="0 0 22 20">
      <path d="M2 16 Q5 4 11 2 Q17 4 20 16" fill="${c.red}" fill-opacity="${c.op * 0.2}" stroke="${c.red}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <line x1="11" y1="0" x2="11" y2="2" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M7 16 Q9 10 11 8 Q13 10 15 16" fill="none" stroke="${c.red}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
      <line x1="2" y1="16" x2="20" y2="16" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op}"/>
      <circle cx="8" cy="14" r="0.6" fill="${c.accent}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="11" cy="13" r="0.6" fill="${c.accent}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="14" cy="14" r="0.6" fill="${c.accent}" fill-opacity="${c.op * 0.5}"/>
      <polygon points="10,0 11,0 12,0 11.5,-1.5 10.5,-1.5" fill="${c.accent}" fill-opacity="${c.op * 0.5}"/>
    </svg>`;
  },

  spongeDiver(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="24" viewBox="0 0 16 24">
      <circle cx="8" cy="4" r="3" fill="${c.accent}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <circle cx="9" cy="3.5" r="1.2" fill="none" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.6}"/>
      <path d="M8 7 L8 15" stroke="${c.stroke}" stroke-width="1" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M8 9 L4 12" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M8 9 L12 11" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M8 15 L5 22" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M8 15 L11 22" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <ellipse cx="3" cy="13" rx="2" ry="1.5" fill="${c.accent}" fill-opacity="${c.op * 0.3}" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op * 0.5}"/>
      <path d="M0 18 Q4 17 8 18 Q12 19 16 18" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
    </svg>`;
  },

  hockeyPuck(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14">
      <ellipse cx="7" cy="8" rx="5.5" ry="2.5" fill="${c.stroke}" fill-opacity="${c.op * 0.4}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <rect x="1.5" y="5.5" width="11" height="2.5" fill="${c.stroke}" fill-opacity="${c.op * 0.35}"/>
      <ellipse cx="7" cy="5.5" rx="5.5" ry="2.5" fill="${c.stroke}" fill-opacity="${c.op * 0.3}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
    </svg>`;
  },

  pirateFlag(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 18 14">
      <line x1="2" y1="1" x2="2" y2="13" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op}"/>
      <rect x="3" y="1" width="13" height="9" rx="0.5" fill="${c.red}" fill-opacity="${c.op * 0.25}" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <text x="9.5" y="7.5" font-size="5" font-family="sans-serif" text-anchor="middle" fill="${c.stroke}" fill-opacity="${c.op * 0.7}">&#9760;</text>
    </svg>`;
  },

  stingray(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18">
      <path d="M10 3 Q3 6 1 10 Q3 12 10 10 Q17 12 19 10 Q17 6 10 3Z" fill="${c.water}" fill-opacity="${c.op * 0.2}" stroke="${c.water}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M10 10 Q10 13 9 17" fill="none" stroke="${c.water}" stroke-width="0.7" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <circle cx="8" cy="7" r="0.5" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="12" cy="7" r="0.5" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
    </svg>`;
  },

  flamencoDancer(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="22" viewBox="0 0 16 22">
      <circle cx="8" cy="3" r="2" fill="${c.red}" fill-opacity="${c.op * 0.2}" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <path d="M8 5 L8 12" stroke="${c.red}" stroke-width="0.8" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M8 7 Q4 5 3 3" stroke="${c.red}" stroke-width="0.6" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M8 7 Q12 5 14 4" stroke="${c.red}" stroke-width="0.6" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M8 12 Q4 14 2 20 Q5 18 8 17 Q11 18 14 20 Q12 14 8 12Z" fill="${c.red}" fill-opacity="${c.op * 0.25}" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <circle cx="3" cy="2.5" r="0.8" fill="${c.red}" fill-opacity="${c.op * 0.4}"/>
    </svg>`;
  },

  greekCross(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <rect x="5.5" y="1" width="5" height="14" rx="0.5" fill="${c.blue}" fill-opacity="${c.op * 0.2}" stroke="${c.blue}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <rect x="1" y="5.5" width="14" height="5" rx="0.5" fill="${c.blue}" fill-opacity="${c.op * 0.2}" stroke="${c.blue}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M0 15 Q4 14 8 15 Q12 16 16 15" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.3}"/>
    </svg>`;
  },

  // --- Batch 3: Food & History ---

  cubanSandwich(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="12" viewBox="0 0 24 12">
      <path d="M2 3 Q12 1 22 3" fill="${c.accent}" fill-opacity="${c.op * 0.3}" stroke="${c.accent}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <rect x="2" y="3" width="20" height="6" rx="3" fill="${c.accent}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <line x1="4" y1="5" x2="20" y2="5" stroke="${c.green}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}"/>
      <line x1="4" y1="6.5" x2="20" y2="6.5" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}"/>
      <line x1="4" y1="8" x2="20" y2="8" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <line x1="6" y1="2" x2="8" y2="10" stroke="${c.stroke}" stroke-width="0.2" stroke-opacity="${c.op * 0.3}"/>
      <line x1="12" y1="2" x2="14" y2="10" stroke="${c.stroke}" stroke-width="0.2" stroke-opacity="${c.op * 0.3}"/>
      <line x1="18" y1="2" x2="20" y2="10" stroke="${c.stroke}" stroke-width="0.2" stroke-opacity="${c.op * 0.3}"/>
    </svg>`;
  },

  grouper(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="14" viewBox="0 0 22 14">
      <path d="M3 7 Q5 3 10 3 Q15 3 18 5 Q20 6 20 7 Q20 8 18 9 Q15 11 10 11 Q5 11 3 7Z" fill="${c.brown}" fill-opacity="${c.op * 0.25}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M18 5 L21 3 L21 5" fill="${c.brown}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <path d="M18 9 L21 11 L21 9" fill="${c.brown}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <circle cx="6" cy="6" r="0.6" fill="${c.stroke}" fill-opacity="${c.op * 0.6}"/>
      <path d="M3 7 L1 6.5" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <circle cx="9" cy="5" r="0.3" fill="${c.stroke}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="12" cy="6" r="0.3" fill="${c.stroke}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="14" cy="8" r="0.3" fill="${c.stroke}" fill-opacity="${c.op * 0.3}"/>
    </svg>`;
  },

  orange(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="9" r="6" fill="${c.accent}" fill-opacity="${c.op * 0.35}" stroke="${c.accent}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M8 3 L8 2 Q9 1 10 2" fill="none" stroke="${c.green}" stroke-width="0.6" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M8 3 Q6 2 7 1" fill="${c.green}" fill-opacity="${c.op * 0.5}" stroke="${c.green}" stroke-width="0.3" stroke-opacity="${c.op}"/>
      <circle cx="6" cy="8" r="0.3" fill="${c.accent}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="10" cy="10" r="0.3" fill="${c.accent}" fill-opacity="${c.op * 0.3}"/>
    </svg>`;
  },

  craftBeer(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="18" viewBox="0 0 14 18">
      <rect x="2" y="4" width="8" height="12" rx="1" fill="${c.accent}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M2 4 Q6 2 10 4" fill="${c.accent}" fill-opacity="${c.op * 0.35}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <path d="M10 7 L12 7 Q13 7 13 8 L13 11 Q13 12 12 12 L10 12" fill="none" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <line x1="3" y1="8" x2="9" y2="8" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
    </svg>`;
  },

  flamingo(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="22" viewBox="0 0 14 22">
      <circle cx="7" cy="3" r="1.5" fill="${c.red}" fill-opacity="${c.op * 0.3}" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <path d="M7 3.5 L9 4 L7 4.5" fill="${c.stroke}" fill-opacity="${c.op * 0.4}" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op}"/>
      <circle cx="6.3" cy="2.8" r="0.3" fill="${c.stroke}" fill-opacity="${c.op * 0.6}"/>
      <path d="M7 4.5 Q7 7 6 9 Q5 11 5 13" stroke="${c.red}" stroke-width="0.7" stroke-opacity="${c.op}" fill="none" stroke-linecap="round"/>
      <ellipse cx="5.5" cy="13" rx="2.5" ry="1.5" fill="${c.red}" fill-opacity="${c.op * 0.2}" stroke="${c.red}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <line x1="4.5" y1="14.5" x2="4" y2="21" stroke="${c.red}" stroke-width="0.6" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <line x1="6.5" y1="14.5" x2="7" y2="21" stroke="${c.red}" stroke-width="0.6" stroke-opacity="${c.op}" stroke-linecap="round"/>
    </svg>`;
  },

  galleonAnchor(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="22" viewBox="0 0 16 22">
      <circle cx="8" cy="3" r="2" fill="none" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op}"/>
      <line x1="8" y1="5" x2="8" y2="18" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op}"/>
      <line x1="4" y1="8" x2="12" y2="8" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M3 18 Q5 15 8 14 Q11 15 13 18" fill="none" stroke="${c.stroke}" stroke-width="0.8" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M3 18 L4 16" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M13 18 L12 16" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}" stroke-linecap="round"/>
    </svg>`;
  },

  shuffleboard(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="14" viewBox="0 0 20 14">
      <rect x="1" y="2" width="18" height="10" rx="0.5" fill="${c.accent}" fill-opacity="${c.op * 0.1}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <line x1="10" y1="2" x2="10" y2="12" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
      <path d="M7 2 L4 5 L7 8 L4 11 L7 12" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <path d="M13 2 L16 5 L13 8 L16 11 L13 12" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <circle cx="6" cy="5" r="1" fill="${c.accent}" fill-opacity="${c.op * 0.4}" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op}"/>
      <circle cx="14" cy="9" r="1" fill="${c.red}" fill-opacity="${c.op * 0.4}" stroke="${c.red}" stroke-width="0.3" stroke-opacity="${c.op}"/>
    </svg>`;
  },

  tikiHut(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
      <path d="M1 10 L9 3 L17 10" fill="${c.accent}" fill-opacity="${c.op * 0.25}" stroke="${c.accent}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M0 10 L9 2 L18 10" fill="none" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <path d="M0 10 L-1 11" stroke="${c.accent}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <path d="M18 10 L19 11" stroke="${c.accent}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
      <line x1="5" y1="10" x2="5" y2="17" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <line x1="13" y1="10" x2="13" y2="17" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <line x1="4" y1="13" x2="14" y2="13" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
    </svg>`;
  },

  // --- Batch 4: Quirky & Deep Cuts ---

  ufo(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="14" viewBox="0 0 22 14">
      <ellipse cx="11" cy="8" rx="10" ry="3" fill="${c.fill}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <ellipse cx="11" cy="6" rx="5" ry="3.5" fill="${c.fill}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <circle cx="5" cy="8" r="0.6" fill="${c.accent}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="8.5" cy="9" r="0.6" fill="${c.accent}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="13.5" cy="9" r="0.6" fill="${c.accent}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="17" cy="8" r="0.6" fill="${c.accent}" fill-opacity="${c.op * 0.5}"/>
      <path d="M8 12 L6 14" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
      <path d="M11 11 L11 14" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
      <path d="M14 12 L16 14" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
    </svg>`;
  },

  conchShell(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
      <path d="M9 2 Q15 4 16 10 Q16 14 12 16 Q8 17 5 15 Q2 12 3 8 Q4 5 9 2Z" fill="${c.red}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M9 2 Q10 6 9 10 Q8 13 7 15" fill="none" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <path d="M12 5 Q10 8 8 11" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
      <path d="M14 8 Q12 10 10 13" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <path d="M5 15 Q3 14 3 12" fill="none" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
    </svg>`;
  },

  treasureChest(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 18 16">
      <rect x="2" y="7" width="14" height="8" rx="1" fill="${c.accent}" fill-opacity="${c.op * 0.3}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M2 7 Q9 3 16 7" fill="${c.accent}" fill-opacity="${c.op * 0.25}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <line x1="2" y1="11" x2="16" y2="11" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}"/>
      <rect x="7.5" y="9.5" width="3" height="3" rx="0.5" fill="${c.accent}" fill-opacity="${c.op * 0.5}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <circle cx="9" cy="11" r="0.6" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
    </svg>`;
  },

  gibsonton(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18">
      <circle cx="10" cy="9" r="7" fill="none" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <circle cx="10" cy="9" r="5" fill="${c.red}" fill-opacity="${c.op * 0.1}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <line x1="10" y1="2" x2="10" y2="0" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <polygon points="9,0 10,-1.5 11,0" fill="${c.accent}" fill-opacity="${c.op * 0.5}"/>
      <path d="M5 7 Q6 6 7 7 Q8 8 7 9" fill="none" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
      <circle cx="6" cy="8" r="0.4" fill="${c.stroke}" fill-opacity="${c.op * 0.4}"/>
      <path d="M12 6 L14 5 L13 7" fill="${c.accent}" fill-opacity="${c.op * 0.3}" stroke="${c.accent}" stroke-width="0.3" stroke-opacity="${c.op}"/>
      <path d="M7 12 Q10 14 13 12" fill="none" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}" stroke-linecap="round"/>
    </svg>`;
  },

  spookHill(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 18 14">
      <path d="M1 12 Q5 8 9 6 Q13 8 17 12" fill="${c.green}" fill-opacity="${c.op * 0.1}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <rect x="11" y="7" width="4" height="3" rx="0.5" fill="${c.stroke}" fill-opacity="${c.op * 0.25}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <circle cx="11" cy="9" r="0.8" fill="${c.stroke}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="15" cy="9" r="0.8" fill="${c.stroke}" fill-opacity="${c.op * 0.3}"/>
      <rect x="12" y="8" width="2" height="1.5" rx="0.3" fill="${c.water}" fill-opacity="${c.op * 0.3}"/>
      <path d="M13 7 L13.5 5" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <text x="13.5" y="4.5" font-size="2.5" fill="${c.stroke}" fill-opacity="${c.op * 0.5}">?</text>
    </svg>`;
  },

  joyland(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="8" fill="none" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.5}"/>
      <circle cx="10" cy="10" r="8" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}" stroke-dasharray="1.5 2"/>
      <line x1="10" y1="2" x2="10" y2="18" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <line x1="2" y1="10" x2="18" y2="10" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <line x1="4.3" y1="4.3" x2="15.7" y2="15.7" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <line x1="15.7" y1="4.3" x2="4.3" y2="15.7" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}"/>
      <circle cx="10" cy="2" r="0.8" fill="${c.red}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="15.7" cy="4.3" r="0.8" fill="${c.accent}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="18" cy="10" r="0.8" fill="${c.blue}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="15.7" cy="15.7" r="0.8" fill="${c.green}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="10" cy="10" r="1.5" fill="${c.stroke}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op}"/>
    </svg>`;
  },

  babeRuth(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6" fill="${c.fill}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op}"/>
      <path d="M3 5 Q8 3 13 5" fill="none" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <path d="M3 11 Q8 13 13 11" fill="none" stroke="${c.red}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <path d="M4 5.5 L4.5 6.5 M6 4.5 L6.2 5.5 M8 4 L8 5 M10 4.5 L9.8 5.5 M12 5.5 L11.5 6.5" fill="none" stroke="${c.red}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
    </svg>`;
  },

  phosphateMining(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16">
      <path d="M3 8 L7 4 L13 4 L17 8" fill="${c.stroke}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <rect x="3" y="8" width="14" height="5" rx="0.5" fill="${c.accent}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <circle cx="5.5" cy="13" r="1.5" fill="${c.stroke}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <circle cx="14.5" cy="13" r="1.5" fill="${c.stroke}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <circle cx="8" cy="6" r="0.8" fill="${c.accent}" fill-opacity="${c.op * 0.4}"/>
      <circle cx="10.5" cy="5.5" r="0.6" fill="${c.accent}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="12" cy="7" r="0.7" fill="${c.accent}" fill-opacity="${c.op * 0.35}"/>
    </svg>`;
  },

  // --- Batch 5: Deep Cuts & Gap Fillers ---

  solomonsCastle(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20">
      <rect x="3" y="8" width="12" height="11" rx="0.3" fill="${c.fill}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <rect x="1" y="6" width="4" height="13" rx="0.3" fill="${c.fill}" fill-opacity="${c.op * 0.12}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <rect x="13" y="6" width="4" height="13" rx="0.3" fill="${c.fill}" fill-opacity="${c.op * 0.12}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <path d="M1 6 L3 4 L3 6" fill="${c.stroke}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op}"/>
      <path d="M15 6 L15 4 L17 6" fill="${c.stroke}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op}"/>
      <path d="M6 8 L9 4 L12 8" fill="${c.accent}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <line x1="9" y1="2" x2="9" y2="4" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <polygon points="8.5,2 9,0.5 9.5,2" fill="${c.accent}" fill-opacity="${c.op * 0.4}"/>
      <rect x="7" y="14" width="4" height="5" rx="0.5" fill="none" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op * 0.5}"/>
    </svg>`;
  },

  weedonIsland(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18">
      <path d="M4 16 Q6 8 8 6 Q10 8 12 16" fill="${c.brown}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M8 6 L8 3" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <path d="M6 3 L8 1 L10 3" fill="${c.accent}" fill-opacity="${c.op * 0.3}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <path d="M6 10 L5 9 L7 9" fill="${c.stroke}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op}"/>
      <path d="M9 12 L10 10 L11 12" fill="${c.stroke}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op}"/>
      <circle cx="7" cy="13" r="0.4" fill="${c.stroke}" fill-opacity="${c.op * 0.3}"/>
      <circle cx="10" cy="14" r="0.3" fill="${c.stroke}" fill-opacity="${c.op * 0.3}"/>
    </svg>`;
  },

  bernsSteak(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 14">
      <path d="M3 4 Q4 2 8 2 Q12 2 13 4 Q14 6 13 8 Q12 10 10 11 L9 13 L7 13 L6 11 Q4 10 3 8 Q2 6 3 4Z" fill="${c.red}" fill-opacity="${c.op * 0.25}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M5 5 Q6 4 7 5" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
      <path d="M9 4 Q10 3 11 5" fill="none" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
      <circle cx="2" cy="3" r="1" fill="${c.fill}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.3" stroke-opacity="${c.op * 0.5}"/>
    </svg>`;
  },

  sharkTooth(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="18" viewBox="0 0 14 18">
      <path d="M7 1 Q3 6 2 10 Q1 14 4 17 Q6 18 7 17 Q8 18 10 17 Q13 14 12 10 Q11 6 7 1Z" fill="${c.stroke}" fill-opacity="${c.op * 0.25}" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M4 8 L5 6 L6 8 L7 5 L8 8 L9 6 L10 8" fill="none" stroke="${c.fill}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}"/>
      <line x1="7" y1="1" x2="7" y2="17" stroke="${c.fill}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}"/>
    </svg>`;
  },

  tarponFish(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16">
      <path d="M4 8 Q6 3 12 3 Q18 3 21 6 Q23 7 23 8 Q23 9 21 10 Q18 13 12 13 Q6 13 4 8Z" fill="${c.fill}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.7" stroke-opacity="${c.op}"/>
      <path d="M4 8 Q2 5 1 3 Q1 8 1 13 Q2 11 4 8Z" fill="${c.fill}" fill-opacity="${c.op * 0.15}" stroke="${c.stroke}" stroke-width="0.4" stroke-opacity="${c.op}"/>
      <circle cx="20" cy="7" r="0.7" fill="${c.stroke}" fill-opacity="${c.op * 0.6}"/>
      <path d="M7 5 L7 11" stroke="${c.fill}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}"/>
      <path d="M10 4 L10 12" stroke="${c.fill}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}"/>
      <path d="M13 4 L13 12" stroke="${c.fill}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}"/>
      <path d="M16 4.5 L16 11.5" stroke="${c.fill}" stroke-width="0.3" stroke-opacity="${c.op * 0.2}"/>
    </svg>`;
  },

  shipwreck(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16">
      <path d="M0 4 Q6 3 12 4 Q18 5 24 4" fill="none" stroke="${c.water}" stroke-width="0.5" stroke-opacity="${c.op * 0.3}"/>
      <path d="M5 8 Q7 7 10 8 L18 8 Q19 8 19 10 L18 12 Q15 14 10 13 L6 12 Q4 11 5 8Z" fill="${c.brown}" fill-opacity="${c.op * 0.2}" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op}" transform="rotate(-15 12 10)"/>
      <line x1="10" y1="5" x2="10" y2="10" stroke="${c.stroke}" stroke-width="0.6" stroke-opacity="${c.op * 0.6}"/>
      <line x1="14" y1="4" x2="14" y2="9" stroke="${c.stroke}" stroke-width="0.5" stroke-opacity="${c.op * 0.5}"/>
      <path d="M0 14 Q6 12 12 13 Q18 14 24 13" fill="none" stroke="${c.water}" stroke-width="0.4" stroke-opacity="${c.op * 0.25}"/>
    </svg>`;
  },

  mantaRay(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 24 18">
      <path d="M12 4 Q6 2 1 6 Q4 8 8 7 Q10 6 12 7 Q14 6 16 7 Q20 8 23 6 Q18 2 12 4Z" fill="${c.water}" fill-opacity="${c.op * 0.2}" stroke="${c.water}" stroke-width="0.6" stroke-opacity="${c.op}"/>
      <path d="M12 7 Q12 10 11 15" fill="none" stroke="${c.water}" stroke-width="0.6" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <circle cx="10" cy="5.5" r="0.5" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <circle cx="14" cy="5.5" r="0.5" fill="${c.stroke}" fill-opacity="${c.op * 0.5}"/>
      <path d="M10 6.5 L12 7.5 L14 6.5" fill="none" stroke="${c.water}" stroke-width="0.3" stroke-opacity="${c.op * 0.4}"/>
    </svg>`;
  },

  spanishMoss(theme) {
    const c = svgColors(theme);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="22" viewBox="0 0 16 22">
      <path d="M8 1 Q4 2 3 5 Q2 8 4 10" fill="${c.green}" fill-opacity="${c.op * 0.2}" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <path d="M8 1 Q12 2 13 5 Q14 8 12 10" fill="${c.green}" fill-opacity="${c.op * 0.2}" stroke="${c.green}" stroke-width="0.5" stroke-opacity="${c.op}"/>
      <line x1="8" y1="1" x2="8" y2="5" stroke="${c.brown}" stroke-width="0.8" stroke-opacity="${c.op}" stroke-linecap="round"/>
      <path d="M4 10 Q3 14 4 18" fill="none" stroke="${c.fill}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <path d="M6 9 Q5 13 5.5 17" fill="none" stroke="${c.fill}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <path d="M8 8 Q7 12 7 16" fill="none" stroke="${c.fill}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <path d="M10 9 Q9 13 9.5 17" fill="none" stroke="${c.fill}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <path d="M12 10 Q11 14 11.5 19" fill="none" stroke="${c.fill}" stroke-width="0.4" stroke-opacity="${c.op * 0.4}" stroke-linecap="round"/>
      <path d="M5 12 Q4.5 15 5 19" fill="none" stroke="${c.fill}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
      <path d="M9 11 Q8.5 15 8.5 20" fill="none" stroke="${c.fill}" stroke-width="0.3" stroke-opacity="${c.op * 0.3}" stroke-linecap="round"/>
    </svg>`;
  },
};

// ---------------------------------------------------------------------------
// Zoom-responsive sizing — matches store marker scaling pattern
// ---------------------------------------------------------------------------
function scaledSize(baseSize, currentZoom) {
  const zoomScale = Math.max(0.75, 1 + (currentZoom - 13) * 0.25);
  return [
    Math.max(Math.round(baseSize[0] * 0.6), Math.round(baseSize[0] * zoomScale)),
    Math.max(Math.round(baseSize[1] * 0.6), Math.round(baseSize[1] * zoomScale)),
  ];
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

    // Swap to activated SVG
    const gen = SVG_GENERATORS[egg.svgKey];
    if (gen) {
      animatingRef.current.add(egg.id);
      const activatedSvg = gen(theme, true);
      const z = map.getZoom();
      const [w, h] = scaledSize(egg.size, z);
      marker.setIcon(L.divIcon({
        html: activatedSvg,
        className: 'easter-egg-icon egg-activated',
        iconSize: [w, h],
        iconAnchor: [w / 2, h / 2],
      }));
      // Revert after 2s
      setTimeout(() => {
        animatingRef.current.delete(egg.id);
        const restingSvg = svgCacheRef.current[egg.id];
        if (restingSvg) {
          const zNow = map.getZoom();
          const [w2, h2] = scaledSize(egg.size, zNow);
          marker.setIcon(L.divIcon({
            html: restingSvg,
            className: 'easter-egg-icon',
            iconSize: [w2, h2],
            iconAnchor: [w2 / 2, h2 / 2],
          }));
        }
      }, 2000);
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
      const icon = L.divIcon({
        html: svg,
        className: 'easter-egg-icon',
        iconSize: [w, h],
        iconAnchor: [w / 2, h / 2],
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
        marker.setIcon(L.divIcon({
          html: cachedSvg,
          className: 'easter-egg-icon',
          iconSize: [w, h],
          iconAnchor: [w / 2, h / 2],
        }));
      });
    }

    updateVisibility();
    updateSizes();
    map.on('zoom', updateVisibility);
    map.on('zoomend', updateSizes);
    return () => {
      map.off('zoom', updateVisibility);
      map.off('zoomend', updateSizes);
    };
  }, [map, zoom]);

  return null;
}
