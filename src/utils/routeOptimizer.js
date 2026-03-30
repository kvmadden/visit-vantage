/**
 * Route optimization utilities for StoreSprint.
 * Provides distance calculation, nearest-neighbor TSP approximation,
 * route statistics, and map URL generation.
 */

const EARTH_RADIUS_MILES = 3959;

/**
 * Calculate the distance in miles between two coordinates using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in miles
 */
export function haversine(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_MILES * c;
}

/**
 * Nearest-neighbor TSP approximation for store visit ordering.
 * Greedily visits the nearest unvisited store at each step.
 * @param {Array<{lat: number, lng: number}>} stores - Array of store objects
 * @param {object} [startStore] - Optional store to begin the route at
 * @returns {Array} Stores in optimized visit order
 */
export function optimizeRoute(stores, startStore) {
  if (!stores || stores.length === 0) return [];
  if (stores.length === 1) return [...stores];

  const remaining = [...stores];
  const ordered = [];

  // Determine starting store
  let current;
  if (startStore) {
    const startIdx = remaining.findIndex(
      (s) => s.lat === startStore.lat && s.lng === startStore.lng
    );
    if (startIdx !== -1) {
      current = remaining.splice(startIdx, 1)[0];
    } else {
      current = remaining.splice(0, 1)[0];
    }
  } else {
    current = remaining.splice(0, 1)[0];
  }

  ordered.push(current);

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = haversine(
        current.lat,
        current.lng,
        remaining[i].lat,
        remaining[i].lng
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    current = remaining.splice(nearestIdx, 1)[0];
    ordered.push(current);
  }

  return ordered;
}

/**
 * Calculate route statistics for an ordered list of stores.
 * @param {Array<{lat: number, lng: number}>} orderedStores - Stores in visit order
 * @returns {{ totalDistance: number, estimatedTime: number, legs: Array<{ from: object, to: object, distance: number }> }}
 */
export function getRouteStats(orderedStores) {
  if (!orderedStores || orderedStores.length < 2) {
    return { totalDistance: 0, estimatedTime: 0, legs: [] };
  }

  const legs = [];
  let totalDistance = 0;

  for (let i = 0; i < orderedStores.length - 1; i++) {
    const from = orderedStores[i];
    const to = orderedStores[i + 1];
    const distance = haversine(from.lat, from.lng, to.lat, to.lng);

    legs.push({ from, to, distance });
    totalDistance += distance;
  }

  // Estimated time: driving at 25 mph + 5 minutes per stop
  const drivingMinutes = (totalDistance / 25) * 60;
  const stopMinutes = orderedStores.length * 5;
  const estimatedTime = drivingMinutes + stopMinutes;

  return { totalDistance, estimatedTime, legs };
}

/**
 * Build a Google Maps directions URL for the given ordered stores.
 * First store is origin, last is destination, middle stores are waypoints.
 * Google Maps supports ~25 waypoints max; if more, samples every Nth store.
 * @param {Array<{lat: number, lng: number}>} orderedStores - Stores in visit order
 * @returns {string} Google Maps directions URL
 */
export function buildMapsUrl(orderedStores) {
  if (!orderedStores || orderedStores.length === 0) return '';
  if (orderedStores.length === 1) {
    const s = orderedStores[0];
    return `https://www.google.com/maps/dir/?api=1&origin=${s.lat},${s.lng}&destination=${s.lat},${s.lng}`;
  }

  const origin = orderedStores[0];
  const destination = orderedStores[orderedStores.length - 1];

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}`;

  const middleStores = orderedStores.slice(1, -1);

  if (middleStores.length > 0) {
    const MAX_WAYPOINTS = 25;
    let waypointStores;

    if (middleStores.length <= MAX_WAYPOINTS) {
      waypointStores = middleStores;
    } else {
      // Sample every Nth store to stay within the waypoint limit
      const step = middleStores.length / MAX_WAYPOINTS;
      waypointStores = [];
      for (let i = 0; i < MAX_WAYPOINTS; i++) {
        const idx = Math.min(
          Math.round(i * step),
          middleStores.length - 1
        );
        waypointStores.push(middleStores[idx]);
      }
    }

    const waypointStr = waypointStores
      .map((s) => `${s.lat},${s.lng}`)
      .join('|');
    url += `&waypoints=${waypointStr}`;
  }

  return url;
}

/**
 * Build an Apple Maps directions URL for the given ordered stores.
 * First store is origin, last is destination, middle stores are waypoints.
 * @param {Array<{lat: number, lng: number}>} orderedStores - Stores in visit order
 * @returns {string} Apple Maps directions URL
 */
export function buildAppleMapsUrl(orderedStores) {
  if (!orderedStores || orderedStores.length === 0) return '';
  if (orderedStores.length === 1) {
    const s = orderedStores[0];
    return `https://maps.apple.com/?saddr=${s.lat},${s.lng}&daddr=${s.lat},${s.lng}`;
  }

  const origin = orderedStores[0];
  const destination = orderedStores[orderedStores.length - 1];

  // Apple Maps uses saddr for start, daddr for destination.
  // Waypoints are appended to daddr separated by "+to:"
  let middleStores = orderedStores.slice(1, -1);

  const MAX_WAYPOINTS = 25;
  if (middleStores.length > MAX_WAYPOINTS) {
    const step = middleStores.length / MAX_WAYPOINTS;
    const sampled = [];
    for (let i = 0; i < MAX_WAYPOINTS; i++) {
      const idx = Math.min(
        Math.round(i * step),
        middleStores.length - 1
      );
      sampled.push(middleStores[idx]);
    }
    middleStores = sampled;
  }

  // Build the daddr chain: waypoints + final destination joined with "+to:"
  const allDestinations = [...middleStores, destination];
  const daddrStr = allDestinations
    .map((s) => `${s.lat},${s.lng}`)
    .join('+to:');

  return `https://maps.apple.com/?saddr=${origin.lat},${origin.lng}&daddr=${daddrStr}&dirflg=d`;
}
