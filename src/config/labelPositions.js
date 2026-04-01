// Hardcoded positions for all map labels at default zoom (9).
// Positions are manually tuned so nothing overlaps.
// To adjust: change lat/lng values here, redeploy, check on phone.

export const LABEL_POSITIONS = {
  // District labels (D20–D27) — colored text like "D20", "D21"
  // Placed inside or just outside polygon, away from pills and city names
  districts: {
    20: { lat: 27.93, lng: -82.50 },
    21: { lat: 28.38, lng: -82.38 },
    22: { lat: 27.72, lng: -82.74 },
    23: { lat: 27.90, lng: -82.82 },
    24: { lat: 28.13, lng: -82.64 },
    25: { lat: 27.83, lng: -82.25 },
    26: { lat: 27.44, lng: -82.52 },
    27: { lat: 27.12, lng: -82.18 },
  },

  // Heart pill badges (store count per district) — shown at zoom <= 10
  // At zoom > 10, markerCluster takes over and positions dynamically
  pills: {
    20: { lat: 28.03, lng: -82.50 },
    21: { lat: 28.30, lng: -82.30 },
    22: { lat: 27.82, lng: -82.75 },
    23: { lat: 27.90, lng: -82.66 },
    24: { lat: 28.15, lng: -82.55 },
    25: { lat: 27.88, lng: -82.32 },
    26: { lat: 27.49, lng: -82.55 },
    27: { lat: 27.06, lng: -82.22 },
  },

  // City names — tier 1 only (tier 2/3 use their geographic positions)
  // Names extend rightward from position, so shift left to center text on land
  cities: {
    'TAMPA': { lat: 27.99, lng: -82.48 },
    'ST. PETERSBURG': { lat: 27.77, lng: -82.86 },
    'CLEARWATER': { lat: 27.95, lng: -82.88 },
    'SARASOTA': { lat: 27.34, lng: -82.57 },
    'BRADENTON': { lat: 27.53, lng: -82.62 },
  },
};
