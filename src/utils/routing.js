const OSRM_BASE = 'https://router.project-osrm.org';

export function haversine(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth radius in miles
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

  return R * c;
}

// Local nearest-neighbor fallback
function localOptimize(stores, startPosition) {
  if (stores.length <= 1) return [...stores];

  const remaining = [...stores];
  const ordered = [];

  let currentLat = startPosition?.lat ?? remaining[0].lat;
  let currentLng = startPosition?.lng ?? remaining[0].lng;

  if (!startPosition) {
    ordered.push(remaining.shift());
    currentLat = ordered[0].lat;
    currentLng = ordered[0].lng;
  }

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = haversine(currentLat, currentLng, remaining[i].lat, remaining[i].lng);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    const nearest = remaining.splice(nearestIdx, 1)[0];
    ordered.push(nearest);
    currentLat = nearest.lat;
    currentLng = nearest.lng;
  }

  return ordered;
}

/**
 * Optimize route using OSRM trip API for road-network-based optimization.
 * Falls back to local nearest-neighbor if OSRM fails.
 */
export async function optimizeRoute(stores, startPosition) {
  if (stores.length <= 1) return { stores: [...stores], legs: [], geometry: null };

  try {
    // Build coordinates string: lng,lat pairs
    const coords = [];
    if (startPosition) {
      coords.push(`${startPosition.lng},${startPosition.lat}`);
    }
    stores.forEach((s) => coords.push(`${s.lng},${s.lat}`));

    const sourceParam = startPosition ? 'first' : 'any';
    const url = `${OSRM_BASE}/trip/v1/driving/${coords.join(';')}?source=${sourceParam}&roundtrip=false&geometries=geojson&overview=full&steps=false&annotations=distance,duration`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM ${res.status}`);

    const data = await res.json();
    if (data.code !== 'Ok' || !data.trips || data.trips.length === 0) {
      throw new Error('OSRM returned no trips');
    }

    const trip = data.trips[0];
    const waypoints = data.waypoints;

    // Map waypoints back to stores in optimized order
    // waypoints have waypoint_index (position in trip) and trips_index
    const storeStartIdx = startPosition ? 1 : 0;
    const wpOrder = waypoints
      .slice(storeStartIdx) // skip GPS position if present
      .map((wp, origIdx) => ({ origIdx, tripIdx: wp.waypoint_index }))
      .sort((a, b) => a.tripIdx - b.tripIdx);

    const optimized = wpOrder.map((wp) => stores[wp.origIdx]);

    // Extract leg details
    const legs = trip.legs.map((leg) => ({
      distance: leg.distance / 1609.34, // meters to miles
      duration: leg.duration / 60, // seconds to minutes
    }));

    // Extract route geometry for polyline
    const geometry = trip.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    return { stores: optimized, legs, geometry };
  } catch (err) {
    console.warn('OSRM optimization failed, using local fallback:', err.message);
    const optimized = localOptimize(stores, startPosition);
    return { stores: optimized, legs: [], geometry: null };
  }
}

/**
 * Get route stats with between-stop estimates using OSRM route API.
 */
export async function getRouteStatsOSRM(orderedStores, startPosition) {
  if (orderedStores.length === 0) return { totalDistance: 0, estimatedTime: 0, legs: [], geometry: null };

  try {
    const coords = [];
    if (startPosition) {
      coords.push(`${startPosition.lng},${startPosition.lat}`);
    }
    orderedStores.forEach((s) => coords.push(`${s.lng},${s.lat}`));

    const url = `${OSRM_BASE}/route/v1/driving/${coords.join(';')}?geometries=geojson&overview=full&steps=false`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM ${res.status}`);

    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('OSRM returned no routes');
    }

    const route = data.routes[0];
    const totalDistance = route.distance / 1609.34; // meters to miles
    const estimatedTime = route.duration / 60 + orderedStores.length * 5; // + 5 min per stop
    const geometry = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    const legs = route.legs.map((leg) => ({
      distance: leg.distance / 1609.34,
      duration: leg.duration / 60,
    }));

    return { totalDistance, estimatedTime, legs, geometry };
  } catch (err) {
    console.warn('OSRM route stats failed, using haversine fallback:', err.message);
    return getRouteStats(orderedStores, startPosition);
  }
}

export function getRouteStats(orderedStores, startPosition) {
  if (orderedStores.length === 0) return { totalDistance: 0, estimatedTime: 0, legs: [], geometry: null };

  let totalDistance = 0;
  const legs = [];

  if (startPosition) {
    const d = haversine(startPosition.lat, startPosition.lng, orderedStores[0].lat, orderedStores[0].lng);
    totalDistance += d;
    legs.push({ distance: d, duration: (d / 25) * 60 });
  }

  for (let i = 0; i < orderedStores.length - 1; i++) {
    const d = haversine(
      orderedStores[i].lat, orderedStores[i].lng,
      orderedStores[i + 1].lat, orderedStores[i + 1].lng
    );
    totalDistance += d;
    legs.push({ distance: d, duration: (d / 25) * 60 });
  }

  const estimatedTime = (totalDistance / 25) * 60 + orderedStores.length * 5;

  return { totalDistance, estimatedTime, legs, geometry: null };
}

export function buildMapsUrl(orderedStores, startPosition) {
  const WAYPOINT_LIMIT = 25;

  let stops = orderedStores;

  if (stops.length > WAYPOINT_LIMIT) {
    const step = Math.ceil(stops.length / WAYPOINT_LIMIT);
    const sampled = [];
    for (let i = 0; i < stops.length; i += step) {
      sampled.push(stops[i]);
    }
    if (sampled[sampled.length - 1] !== stops[stops.length - 1]) {
      sampled.push(stops[stops.length - 1]);
    }
    stops = sampled;
  }

  let url = 'https://www.google.com/maps/dir/';

  if (startPosition) {
    url += `${startPosition.lat},${startPosition.lng}/`;
  }

  url += stops.map((s) => `${s.lat},${s.lng}`).join('/');

  return url;
}
